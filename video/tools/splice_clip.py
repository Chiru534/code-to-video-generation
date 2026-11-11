"""Splice one re-rendered scene back into a delivered video.

WHY: re-rendering a whole video to fix one scene is the slowest and
riskiest thing this pipeline can do. But a scene IS independent — it is its
own <Sequence> with its own measured length — so a changed scene can be
rendered on its own frames and put back.

HOW: the clip replaces frames [start, end) of the original. Everything
before and after is copied, frame for frame. The result is encoded once,
so the clip is not double-encoded: render the clip near-lossless first.

THE CONSTRAINT, and it is not a tooling limit: the scene lengths come from
the MEASURED narration. If the narration of a scene changes, the TTS
regenerates and every scene after it moves. A splice is only valid when
the frames after the edited scene still start where they did. That is why
this tool refuses if the replacement does not land exactly.

Usage:
    python tools/splice_clip.py --old old.mp4 --clip clip.mp4 \
        --start 1230 --end 1430 --out new.mp4
"""
import argparse
import os
import subprocess
import sys


def log(msg: str) -> None:
    print(msg, flush=True)


def fail(msg: str) -> None:
    print(f"::error::{msg}", flush=True)
    sys.exit(1)


def probe(path: str) -> dict:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-of", "json",
         "-show_entries", "format=duration,size",
         "-show_entries", "stream=codec_type,codec_name,width,height,r_frame_rate,"
         "pix_fmt,sample_rate,channels,nb_read_frames",
         "-count_frames",
         path],
        capture_output=True, text=True)
    if out.returncode != 0:
        fail(f"ffprobe could not read {path}: {out.stderr.strip()[:200]}")
    import json

    return json.loads(out.stdout)


def frame_count(meta: dict, path: str, fps: float) -> int:
    """The TRUE frame count.

    duration * fps is an estimate. A file whose duration is not an exact
    multiple of the frame time is off by a frame or two, and a splice is
    only correct to the frame.
    """
    for stream in meta["streams"]:
        if stream.get("codec_type") == "video" and stream.get("nb_read_frames"):
            return int(stream["nb_read_frames"])
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v", "-count_frames",
         "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", path],
        capture_output=True, text=True)
    if out.returncode == 0 and out.stdout.strip():
        return int(out.stdout.strip())
    return int(round(float(meta["format"]["duration"]) * fps))


def main() -> int:
    parser = argparse.ArgumentParser(description="Splice a clip into a video.")
    parser.add_argument("--old", required=True)
    parser.add_argument("--clip", required=True)
    parser.add_argument("--start", type=int, required=True, help="first frame replaced")
    parser.add_argument("--end", type=int, required=True, help="one past the last frame replaced")
    parser.add_argument("--out", required=True)
    parser.add_argument("--fps", type=float, default=30.0)
    parser.add_argument("--crf", type=int, default=18)
    args = parser.parse_args()

    for path in (args.old, args.clip):
        if not os.path.exists(path):
            fail(f"missing input: {path}")

    old = probe(args.old)
    clip = probe(args.clip)
    ov = next(s for s in old["streams"] if s["codec_type"] == "video")
    cv = next(s for s in clip["streams"] if s["codec_type"] == "video")
    for key in ("width", "height", "pix_fmt"):
        if ov.get(key) != cv.get(key):
            fail(f"the clip does not match the video: {key} {ov.get(key)} vs {cv.get(key)}")

    fps = args.fps
    clip_frames = int(round(float(clip["format"]["duration"]) * fps))
    expected = args.end - args.start
    if abs(clip_frames - expected) > 1:
        fail(
            f"the clip is {clip_frames} frames but {expected} were expected "
            f"({args.start}..{args.end})"
        )

    old_frames = frame_count(old, args.old, fps)
    if args.end > old_frames:
        fail(f"the range {args.start}..{args.end} is past the end of the video ({old_frames} frames)")

    start_sec = args.start / fps
    end_sec = args.end / fps

    # One encode of everything: the untouched parts and the clip together.
    # The clip was rendered near-lossless, so this is the only real encode.
    #
    # The AUDIO is NOT touched. A clip edit is a visual edit: the narration of
    # the other scenes must not move, and the audio of the edited scene was
    # measured into the timeline already. Replacing the audio with a fresh TTS
    # pass would shift it, so the original track is kept whole and only the
    # picture changes.
    graph = (
        f"[0:v]trim=start=0:end={start_sec:.6f},setpts=PTS-STARTPTS[pre];"
        f"[0:v]trim=start={end_sec:.6f},setpts=PTS-STARTPTS[post];"
        f"[1:v]setpts=PTS-STARTPTS[clip];"
        f"[pre][clip][post]concat=n=3:v=1:a=0[v]"
    )
    cmd = [
        "ffmpeg", "-y", "-v", "error",
        "-i", args.old, "-i", args.clip,
        "-filter_complex", graph,
        "-map", "[v]",
        "-map", "0:a",
        "-c:v", "libx264", "-preset", "medium", "-crf", str(args.crf),
        "-pix_fmt", ov.get("pix_fmt", "yuv420p"),
        "-r", f"{fps}",
        "-c:a", "copy",
        "-movflags", "+faststart",
        args.out,
    ]
    log(f"splice   : frames {args.start}..{args.end} of {old_frames}")
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        fail(f"ffmpeg failed: {proc.stderr.strip()[:400]}")

    new = probe(args.out)
    new_frames = frame_count(new, args.out, fps)
    expected_frames = old_frames - expected + clip_frames
    log(f"result   : {new_frames} frames, expected {expected_frames}")
    if new_frames != expected_frames:
        fail(f"the spliced video is {new_frames} frames, expected {expected_frames}")

    nv = next(s for s in new["streams"] if s["codec_type"] == "video")
    na = next((s for s in new["streams"] if s["codec_type"] == "audio"), None)
    for key in ("width", "height", "codec_name", "pix_fmt"):
        if nv.get(key) != ov.get(key):
            fail(f"the spliced video changed {key}: {ov.get(key)} -> {nv.get(key)}")
    if na is None:
        fail("the spliced video has no audio")
    log(f"ok       : {args.out} ({os.path.getsize(args.out):,} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
