"""Layer 1 audit: deterministic checks that a video is *correct*, not just intact.

A green render only proves Remotion produced bytes. It does not prove the bytes
say the right thing. This gate exists because two real defects shipped:

  1. Episode 1's slate said "STEP 1 OF 8" while its own narration said "one step
     out of five". Each file was internally consistent; only the pair disagreed,
     so no amount of eyeballing one file would find it.
  2. `buildPlan()` falls back to `?? 240` frames when a scene id is missing from
     timings.json. A missing id therefore renders at a plausible-looking length
     with no error at all -- a silent, wrong video.

Usage
-----
    # checks that need no render (fast, runs on every commit)
    python tools/audit.py --static

    # add checks on a finished file
    python tools/audit.py --static --video out/the-handshake.mp4 --episode ep02

Exit code 1 on any failure. Failures are printed as GitHub error annotations.

Design rules
------------
- stdlib only. An audit that needs a dependency is an audit that gets skipped.
- every check reports the value it saw, not just pass/fail, so a failure is
  diagnosable from the log alone.
- skip-with-warning is only allowed where the input genuinely is not there yet
  (e.g. audio not generated on a docs-only commit). Anything that should exist
  and does not is a failure.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import wave

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)  # video/

FPS_DEFAULT = 30
FPS_TOLERANCE = 2  # frames between `sec` and `frames` in timings.json

WORD_NUMBERS = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
}

results: list[tuple[bool, str, str]] = []


def check(ok: bool, name: str, detail: str = "") -> bool:
    results.append((ok, name, detail))
    mark = "ok  " if ok else "FAIL"
    print(f"  [{mark}] {name}" + (f" -- {detail}" if detail else ""))
    return ok


def skip(name: str, reason: str) -> None:
    results.append((True, name, f"skipped: {reason}"))
    print(f"  [skip] {name} -- {reason}")


def warn(name: str, reason: str) -> None:
    results.append((True, name, f"warning: {reason}"))
    print(f"  [warn] {name} -- {reason}")


def load_json(path: str):
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)


# ---------------------------------------------------------------- registry ---

def audit_registry() -> dict:
    print("\n== registry ==")
    path = os.path.join(ROOT, "episodes.json")
    if not check(os.path.exists(path), "episodes.json exists", path):
        return {}

    registry = load_json(path)
    check(isinstance(registry, dict) and bool(registry), "registry is a non-empty object")
    if not isinstance(registry, dict):
        return {}

    required = ("title", "srcDir", "audioDir", "composition", "output")
    for key, cfg in registry.items():
        missing = [f for f in required if not cfg.get(f)]
        check(not missing, f"{key} has all fields", f"missing: {missing}" if missing else "")

    # Two episodes writing one filename silently overwrite each other in Drive:
    # the uploader looks files up by name and updates in place.
    outputs = [cfg.get("output") for cfg in registry.values()]
    dupes = sorted({o for o in outputs if outputs.count(o) > 1})
    check(not dupes, "output filenames are unique", f"duplicated: {dupes}" if dupes else "")

    # Same failure mode one layer down: scene ids restart at s01, so a shared
    # audio directory lets episode 2 overwrite episode 1's voice tracks.
    dirs = [cfg.get("audioDir") for cfg in registry.values()]
    dupes = sorted({d for d in dirs if dirs.count(d) > 1})
    check(not dupes, "audio directories are unique", f"shared: {dupes}" if dupes else "")

    root_path = os.path.join(ROOT, "src", "Root.tsx")
    if os.path.exists(root_path):
        source = open(root_path, encoding="utf-8").read()
        for key, cfg in registry.items():
            comp = cfg.get("composition", "")
            check(f'id="{comp}"' in source, f"{key} composition is registered", comp)
    else:
        check(False, "src/Root.tsx exists", root_path)

    return registry


# ---------------------------------------------------------------- episodes ---

def tail_frames(src_dir: str) -> int:
    """Read TAIL_FRAMES out of the episode source so the audit follows the code."""
    for name in os.listdir(src_dir):
        if not name.endswith(".tsx"):
            continue
        text = open(os.path.join(src_dir, name), encoding="utf-8").read()
        match = re.search(r"const TAIL_FRAMES\s*=\s*(\d+)", text)
        if match:
            return int(match.group(1))
    return 0


def wav_seconds(path: str) -> float:
    with wave.open(path, "rb") as handle:
        return handle.getnframes() / float(handle.getframerate())


def audit_episode(key: str, cfg: dict) -> dict:
    print(f"\n== {key}: {cfg.get('title', '?')} ==")
    src_dir = os.path.join(ROOT, cfg["srcDir"])
    audio_dir = os.path.join(ROOT, cfg["audioDir"])
    narration_path = os.path.join(src_dir, "narration.json")
    timings_path = os.path.join(src_dir, "timings.json")

    if not check(os.path.exists(narration_path), "narration.json exists", narration_path):
        return {}

    narration = load_json(narration_path)
    lines = narration.get("lines") or []
    check(bool(lines), "narration has lines", f"{len(lines)} lines")
    if not lines:
        return {}

    ids = [line.get("id") for line in lines]
    check(len(ids) == len(set(ids)), "narration ids are unique")
    check(all(ids), "every narration line has an id")
    empties = [line.get("id") for line in lines if not (line.get("text") or "").strip()]
    check(not empties, "every narration line has text", f"empty: {empties}" if empties else "")

    # Contiguous s01..sNN keeps the slate step number derivable from the id.
    expected = [f"s{i:02d}" for i in range(1, len(ids) + 1)]
    check(sorted(ids) == expected, "narration ids are contiguous", f"{ids[0]}..{ids[-1]}" if ids else "")

    if not check(os.path.exists(timings_path), "timings.json exists", timings_path):
        return {"ids": ids, "frames": 0, "tail": 0}

    timings = load_json(timings_path)
    scenes = timings.get("scenes") or {}
    fps = int(timings.get("fps", FPS_DEFAULT))

    check(fps == FPS_DEFAULT, "fps is 30", str(fps))

    # THE silent failure: buildPlan() uses `?? 240` for an unknown id.
    missing = [i for i in ids if i not in scenes]
    check(not missing, "every narration id has a timing", f"missing: {missing}" if missing else "")
    extra = [i for i in scenes if i not in ids]
    check(not extra, "no orphan timings", f"extra: {extra}" if extra else "")

    # Stale timings from a previous draft render at the old length with the new
    # text, which reads as a pacing bug and is invisible in the file.
    drift = []
    for line in lines:
        sid = line.get("id")
        if sid in scenes and scenes[sid].get("text", "").strip() != line.get("text", "").strip():
            drift.append(sid)
    check(not drift, "timing text matches narration text", f"stale: {drift}" if drift else "")

    bad = []
    for sid, scene in scenes.items():
        sec, frames = scene.get("sec"), scene.get("frames")
        if not isinstance(sec, (int, float)) or not isinstance(frames, int):
            bad.append(f"{sid}: non-numeric")
        elif abs(sec * fps - frames) > FPS_TOLERANCE:
            bad.append(f"{sid}: {sec}s != {frames}f")
        elif frames <= 0:
            bad.append(f"{sid}: {frames} frames")
    check(not bad, "sec and frames agree", ", ".join(bad) if bad else "")

    total = sum(scene.get("frames", 0) for scene in scenes.values())
    check(
        timings.get("totalFrames") == total,
        "totalFrames is the sum of scenes",
        f"declared {timings.get('totalFrames')} vs actual {total}",
    )

    # Audio: the file must exist AND be the length timings.json claims. A short
    # or missing wav is how a truncated sentence reaches the final render.
    if not os.path.isdir(audio_dir):
        warn("audio present", f"{audio_dir} not generated yet")
    else:
        absent, mismatched = [], []
        for line in lines:
            sid = line.get("id")
            path = os.path.join(audio_dir, f"{sid}.wav")
            if not os.path.exists(path):
                absent.append(sid)
                continue
            if os.path.getsize(path) < 1000:
                mismatched.append(f"{sid}: {os.path.getsize(path)} bytes")
                continue
            if sid in scenes:
                delta = abs(wav_seconds(path) - float(scenes[sid].get("sec", 0)))
                if delta > 0.1:
                    mismatched.append(f"{sid}: wav {wav_seconds(path):.2f}s vs timing {scenes[sid]['sec']}s")
        check(not absent, "every scene has a wav", f"missing: {absent}" if absent else "")
        check(not mismatched, "wav length matches timing", "; ".join(mismatched) if mismatched else "")

    return {
        "ids": ids,
        "frames": total,
        "tail": tail_frames(src_dir) * len(ids),
        "fps": fps,
    }


# --------------------------------------------------------- slate coherence ---

def arc_position(key: str) -> int:
    """Where this episode sits in the season. ep03 -> 3."""
    match = re.match(r"ep(\d+)$", key)
    return int(match.group(1)) if match else 0


def audit_slate(key: str, cfg: dict, info: dict) -> None:
    """The defect that shipped: slate count disagreed with the narration count.

    Only the *arc* count is compared to narration. An earlier version of this
    check compared the slate's step number to the scene count, and matched any
    "of <number>" phrase -- which fired on "seventy of two hundred", a latency
    budget, not an arc length. Both were false positives. The count is only
    meaningful when attached to the word "step".
    """
    src_dir = os.path.join(ROOT, cfg["srcDir"])
    narration_path = os.path.join(src_dir, "narration.json")
    if not os.path.exists(narration_path):
        return

    narration_text = " ".join(
        (line.get("text") or "") for line in load_json(narration_path).get("lines", [])
    )

    slate = None
    for name in os.listdir(src_dir):
        if not name.endswith(".tsx"):
            continue
        text = open(os.path.join(src_dir, name), encoding="utf-8").read()
        match = re.search(r"STEP\s+(\d+)\s+OF\s+(\d+)", text)
        if match:
            slate = (int(match.group(1)), int(match.group(2)), name)
            break

    if slate is None:
        skip(f"{key} slate count", "no STEP n OF m slate")
        return

    step, total, filename = slate
    print(f"  slate   : STEP {step} OF {total}  ({filename})")

    position = arc_position(key)
    if position:
        check(step == position, f"{key} slate step matches its place in the season",
              f"slate says step {step}, key {key} is step {position}")

    # "one step out of five", "out of five steps", "the five steps".
    # Deliberately anchored on the word "step" so unrelated numbers are ignored.
    numbers = set()
    for pattern in (
        r"\bsteps?\s+out\s+of\s+(" + "|".join(WORD_NUMBERS) + r"|\d+)\b",
        r"\bout\s+of\s+(" + "|".join(WORD_NUMBERS) + r"|\d+)\s+steps?\b",
    ):
        for found in re.findall(pattern, narration_text, re.I):
            numbers.add(WORD_NUMBERS.get(found.lower()) or int(found))

    if not numbers:
        skip(f"{key} slate total", "narration never states an arc length")
        return

    check(
        numbers == {total},
        f"{key} slate total matches narration",
        f"slate says {total}, narration says {sorted(numbers)}",
    )


# ------------------------------------------------------------------ render ---

def ffprobe_json(path: str, *args: str):
    try:
        out = subprocess.run(
            ["ffprobe", "-v", "error", "-of", "json", *args, path],
            capture_output=True, text=True, timeout=120,
        )
    except (OSError, subprocess.SubprocessError) as exc:
        return None, f"ffprobe failed: {exc}"
    if out.returncode != 0:
        return None, out.stderr.strip()[:300]
    return json.loads(out.stdout), ""


def audit_render(path: str, info: dict) -> None:
    print("\n== render ==")
    if not check(os.path.exists(path), "output file exists", path):
        return

    size = os.path.getsize(path)
    check(size > 100_000, "output is not a stub", f"{size:,} bytes")

    meta, err = ffprobe_json(
        path,
        "-show_entries", "format=duration,size",
        "-show_entries", "stream=codec_type,codec_name,width,height,pix_fmt,r_frame_rate,sample_rate,channels",
    )
    if not check(meta is not None, "ffprobe reads the file", err):
        return

    streams = meta.get("streams", [])
    video = next((s for s in streams if s.get("codec_type") == "video"), None)
    audio = next((s for s in streams if s.get("codec_type") == "audio"), None)

    if check(video is not None, "has a video stream"):
        # Shorts are rendered vertical 1080x1920; landscape 1920x1080 also accepted.
        check(
            (video.get("width") == 1920 and video.get("height") == 1080)
            or (video.get("width") == 1080 and video.get("height") == 1920),
            "is 1920x1080 or 1080x1920",
            f"{video.get('width')}x{video.get('height')}",
        )
        check(video.get("codec_name") == "h264", "is h264", str(video.get("codec_name")))
        check(video.get("pix_fmt") == "yuv420p", "is yuv420p", str(video.get("pix_fmt")))
        check(video.get("r_frame_rate") in ("30/1", "30000/1001"), "is ~30 fps",
              str(video.get("r_frame_rate")))

    if check(audio is not None, "has an audio stream", "the render is silent"):
        check(audio.get("codec_name") == "aac", "audio is aac", str(audio.get("codec_name")))
        check(str(audio.get("sample_rate")) == "48000", "audio is 48 kHz", str(audio.get("sample_rate")))

    duration = float(meta.get("format", {}).get("duration", 0))
    expected_frames = info.get("frames", 0) + info.get("tail", 0)
    if expected_frames:
        expected = expected_frames / float(info.get("fps", FPS_DEFAULT))
        check(abs(duration - expected) < 1.0, "duration matches the timeline",
              f"file {duration:.2f}s vs expected {expected:.2f}s ({expected_frames} frames)")
    else:
        print(f"  duration: {duration:.2f}s (no timeline to compare)")

    # EBU R128 integrated loudness. The workflow applies loudnorm at -14;
    # this proves the file that leaves the runner actually measured that.
    try:
        out = subprocess.run(
            ["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128", "-f", "null", "-"],
            capture_output=True, text=True, timeout=300,
        )
        matches = re.findall(r"I:\s*(-?\d+\.?\d*)\s+LUFS", out.stderr)
        if matches:
            loudness = float(matches[-1])
            check(-15.5 <= loudness <= -12.5, "loudness is near -14 LUFS", f"{loudness:.1f} LUFS")
        else:
            warn("loudness", "ebur128 produced no summary")
    except (OSError, subprocess.SubprocessError) as exc:
        warn("loudness", str(exc))


# -------------------------------------------------------------------- main ---

def main() -> int:
    parser = argparse.ArgumentParser(description="Deterministic audit of an episode.")
    parser.add_argument("--static", action="store_true", help="checks that need no render")
    parser.add_argument("--video", default="", help="rendered mp4 to audit")
    parser.add_argument("--episode", default="", help="episode key for --video checks")
    parser.add_argument("--only", default="", help="audit a single episode key")
    args = parser.parse_args()

    if not args.static and not args.video:
        parser.error("nothing to do: pass --static and/or --video")

    registry = audit_registry()
    if not registry:
        return 1

    keys = [args.only] if args.only else list(registry)
    infos = {}
    for key in keys:
        if key not in registry:
            check(False, f"unknown episode {key}")
            continue
        infos[key] = audit_episode(key, registry[key])
        audit_slate(key, registry[key], infos[key])

    if args.video:
        key = args.episode or (keys[0] if len(keys) == 1 else "")
        if not key:
            check(False, "--episode is required with --video when auditing several episodes")
        else:
            audit_render(args.video, infos.get(key, {}))

    failed = [r for r in results if not r[0]]
    print("\n" + "-" * 60)
    print(f"{len(results) - len(failed)} passed, {len(failed)} failed")
    for _, name, detail in failed:
        print(f"::error::{name}" + (f" -- {detail}" if detail else ""))
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
