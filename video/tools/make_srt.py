"""Write a .srt for an episode from its measured narration timings.

WHY: YouTube's auto-captions get the terminology wrong. This channel's whole
point is that `POTENTIAL - PAPER ESTIMATE` and `OUR ARITHMETIC` mean specific
things, and a caption that renders them as "our arithmetic" has thrown the
claim away. The narration is already timed to the frame, so the captions can
be exact instead of guessed.

YouTube's own caption style is the target: about 42 characters a line, no
more than two lines, and a caption that is on screen long enough to read.

A narration line is often six or seven seconds long, which is far too long
for one caption, so each line is split into caption-sized chunks and the
line's measured duration is divided between them in proportion to their
length. The split points are word boundaries, and the TTS pauses at
punctuation, so the drift between a chunk boundary and a real pause is small
and always in the same direction: a chunk can end a beat early, never late.

Usage:
    python tools/make_srt.py --episode training-memory
    python tools/make_srt.py --src-dir src/shorts/kv-cache --out out/kv.srt
"""
from __future__ import annotations

import argparse
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 30

MAX_CHARS = 42
MAX_LINES = 2
MAX_WORDS = 7


def stamp(seconds: float) -> str:
    if seconds < 0:
        seconds = 0.0
    ms = int(round(seconds * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def chunks(words: list[str]) -> list[str]:
    """Split a line into caption-sized pieces: <= MAX_WORDS words and
    <= MAX_CHARS characters, so one caption never needs a third line.

    The break prefers punctuation. "runs on a | laptop in fourteen gigabytes"
    is a legal caption and a bad one; "runs on | a laptop in fourteen
    gigabytes" reads properly. A word that ends a clause is where the eye
    already expects a line to end, and the TTS pauses there too, so the
    caption and the audio break in the same place."""
    out: list[str] = []
    current: list[str] = []
    for word in words:
        candidate = current + [word]
        text = " ".join(candidate)
        if current and (len(candidate) > MAX_WORDS or len(text) > MAX_CHARS):
            cut = len(current)
            for i in range(len(current) - 1, -1, -1):
                if current[i].endswith((",", ".", ";", ":", "?", "!", "—")):
                    cut = i + 1
                    break
            if cut < 1:
                cut = len(current)
            out.append(" ".join(current[:cut]))
            current = current[cut:]
            current.append(word)
        else:
            current = candidate
    if current:
        out.append(" ".join(current))
    return out


def wrap(text: str) -> str:
    """One or two lines, never more."""
    if len(text) <= MAX_CHARS:
        return text
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if current and len(candidate) > MAX_CHARS:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    if len(lines) > MAX_LINES:
        lines = lines[:MAX_LINES]
    return "\n".join(lines)


def build(src_dir: str) -> str:
    with open(os.path.join(src_dir, "narration.json"), encoding="utf-8") as handle:
        narration = json.load(handle)
    with open(os.path.join(src_dir, "timings.json"), encoding="utf-8") as handle:
        timings = json.load(handle)

    scenes = timings.get("scenes") or {}
    fps = float(timings.get("fps") or FPS)

    entries: list[tuple[float, float, str]] = []
    cursor = 0.0
    for line in narration.get("lines") or []:
        sid = line.get("id")
        scene = scenes.get(sid) or {}
        duration = float(scene.get("sec") or 0.0)
        text = (line.get("text") or "").strip()
        if text and duration > 0:
            parts = chunks(text.split())
            if parts:
                weights = [max(1, len(p)) for p in parts]
                total = float(sum(weights))
                at = cursor
                for part, weight in zip(parts, weights):
                    span = duration * (weight / total)
                    entries.append((at, at + span, wrap(part)))
                    at += span
        cursor += duration

    out = []
    for i, (start, end, text) in enumerate(entries, start=1):
        out.append(str(i))
        out.append(f"{stamp(start)} --> {stamp(end)}")
        out.append(text)
        out.append("")
    return "\n".join(out)


def main() -> int:
    parser = argparse.ArgumentParser(description="Write a .srt from measured timings.")
    parser.add_argument("--episode", default="", help="episode key from episodes.json")
    parser.add_argument("--src-dir", default="", help="episode source directory")
    parser.add_argument("--out", default="", help="output path (default: src_dir/<name>.srt)")
    args = parser.parse_args()

    src_dir = args.src_dir
    if not src_dir:
        if not args.episode:
            parser.error("pass --episode or --src-dir")
        with open(os.path.join(ROOT, "episodes.json"), encoding="utf-8") as handle:
            registry = json.load(handle)
        if args.episode not in registry:
            raise SystemExit(f"unknown episode: {args.episode}")
        src_dir = os.path.join(ROOT, registry[args.episode]["srcDir"])

    out = args.out or os.path.join(
        src_dir, os.path.basename(os.path.normpath(src_dir)) + ".srt"
    )
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    text = build(src_dir)
    with open(out, "w", encoding="utf-8", newline="\n") as handle:
        handle.write(text)

    count = text.count(" --> ")
    print(f"srt      : {out} ({count} captions)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
