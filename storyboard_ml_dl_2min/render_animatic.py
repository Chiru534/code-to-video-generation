from __future__ import annotations

import json
import shutil
import subprocess
import textwrap
from pathlib import Path


ROOT = Path(__file__).resolve().parent
PANELS = ROOT / "panels"
AUDIO = ROOT / "audio"
CLIPS = ROOT / "clips"
OUT_VIDEO = ROOT / "machine_learning_vs_deep_learning_2min_animatic.mp4"
OUT_SRT = ROOT / "machine_learning_vs_deep_learning_2min_animatic.srt"
OUT_MIX = ROOT / "narration_mix.wav"
TIMING = ROOT / "narration_timing.json"
FPS = 24
WIDTH = 1280
HEIGHT = 720
XFADE_FRAMES = 12
XFADE_SECONDS = XFADE_FRAMES / FPS


def run(args: list[str]) -> None:
    subprocess.run(args, check=True)


def stamp(seconds: float) -> str:
    millis = round(seconds * 1000)
    hours, millis = divmod(millis, 3_600_000)
    minutes, millis = divmod(millis, 60_000)
    secs, millis = divmod(millis, 1000)
    return f"{hours:02}:{minutes:02}:{secs:02},{millis:03}"


def make_srt(records: list[dict]) -> None:
    entries = []
    for n, row in enumerate(records):
        start = float(row["StartSeconds"])
        next_start = float(records[n + 1]["StartSeconds"]) if n + 1 < len(records) else 120.0
        end = min(start + float(row["DurationSeconds"]) + 0.35, next_start - 0.25)
        lines = textwrap.wrap(row["Narration"], width=44, break_long_words=False)
        caption = "\n".join(lines)
        entries.append(f"{n + 1}\n{stamp(start)} --> {stamp(end)}\n{caption}")
    OUT_SRT.write_text("\n\n".join(entries) + "\n", encoding="utf-8-sig")


def create_clips() -> list[Path]:
    CLIPS.mkdir(exist_ok=True)
    paths = []
    for i in range(1, 13):
        source = PANELS / f"panel_{i:02}.png"
        target = CLIPS / f"shot_{i:02}.mp4"
        frame_count = 252 if i < 12 else 240
        vf = (
            f"scale={WIDTH}:{HEIGHT}:force_original_aspect_ratio=decrease,"
            f"pad={WIDTH}:{HEIGHT}:(ow-iw)/2:(oh-ih)/2:black,"
            f"zoompan=z='min(1.04,1+on*0.00016)':"
            f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
            f"d=1:s={WIDTH}x{HEIGHT}:fps={FPS},format=yuv420p"
        )
        run([
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
            "-loop", "1", "-framerate", str(FPS), "-i", str(source),
            "-vf", vf, "-frames:v", str(frame_count), "-an",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
            "-pix_fmt", "yuv420p", "-r", str(FPS), "-movflags", "+faststart",
            str(target),
        ])
        paths.append(target)
    return paths


def join_video(clips: list[Path]) -> None:
    filters = []
    for i in range(len(clips)):
        filters.append(f"[{i}:v]setpts=PTS-STARTPTS,settb=AVTB,fps={FPS},format=yuv420p[v{i}]")
    prior = "v0"
    for i in range(1, len(clips)):
        output = f"x{i}"
        offset = i * 10.0
        filters.append(
            f"[{prior}][v{i}]xfade=transition=fade:duration={XFADE_SECONDS:.6f}:offset={offset:.6f}[{output}]"
        )
        prior = output
    run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        *[arg for clip in clips for arg in ("-i", str(clip))],
        "-filter_complex", ";".join(filters), "-map", f"[{prior}]",
        "-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
        "-profile:v", "high", "-pix_fmt", "yuv420p", "-r", str(FPS),
        "-frames:v", str(120 * FPS), "-movflags", "+faststart", str(OUT_VIDEO),
    ])


def mix_audio(records: list[dict]) -> None:
    inputs = []
    filters = []
    labels = []
    for i, row in enumerate(records):
        inputs.extend(["-i", str(AUDIO / f"shot_{i + 1:02}.wav")])
        delay_ms = round(float(row["StartSeconds"]) * 1000)
        label = f"a{i}"
        filters.append(
            f"[{i}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,"
            f"adelay=delays={delay_ms}|{delay_ms}[{label}]"
        )
        labels.append(f"[{label}]")
    filters.append(
        f"{''.join(labels)}amix=inputs={len(records)}:duration=longest:"
        "dropout_transition=0:normalize=0,apad,atrim=duration=120,"
        "asetpts=PTS-STARTPTS[aout]"
    )
    run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *inputs,
        "-filter_complex", ";".join(filters), "-map", "[aout]",
        "-c:a", "pcm_s16le", "-ar", "48000", "-ac", "2", str(OUT_MIX),
    ])


def mux_audio() -> None:
    temp = ROOT / "animatic_muxed.tmp.mp4"
    run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-i", str(OUT_VIDEO), "-i", str(OUT_MIX),
        "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
        "-t", "120", "-movflags", "+faststart", str(temp),
    ])
    temp.replace(OUT_VIDEO)


def main() -> None:
    for tool in ("ffmpeg", "ffprobe"):
        if shutil.which(tool) is None:
            raise RuntimeError(f"Required executable not found on PATH: {tool}")
    records = json.loads(TIMING.read_text(encoding="utf-8-sig"))
    if len(records) != 12:
        raise RuntimeError(f"Expected 12 storyboard shots, found {len(records)}")
    if any(float(r["DurationSeconds"]) >= 9.8 for r in records):
        raise RuntimeError("A narration segment exceeds its shot timing budget")
    make_srt(records)
    clips = create_clips()
    join_video(clips)
    mix_audio(records)
    mux_audio()
    print(f"Created: {OUT_VIDEO}")
    print(f"Created: {OUT_SRT}")


if __name__ == "__main__":
    main()
