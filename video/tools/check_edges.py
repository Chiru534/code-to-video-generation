"""Catch content that runs off the edge of the frame.

A bar that is wider than its container does not look wrong in the source
code; it looks wrong on screen, where it is silently clipped by the frame.
The LittleBit film's "THE MODEL" bar was 1680px wide inside a 1180px
container, so it ran off the right edge of the 1920 frame for the whole
scene. Nobody caught it because every still looked plausible.

THE TEST: measure the brightest pixel in a thin strip along each edge of
every frame. The background is near-black, so a bright element touching the
border is the signature of an overflow. The faint background grid is well
below the threshold.

Usage:  python tools/check_edges.py <file.mp4> [--threshold 70]
"""
from __future__ import annotations

import argparse
import re
import subprocess
import sys

STRIP = 3  # pixels


def edge_luma(path: str) -> dict:
    """Max luma of the top, bottom, left and right strips, per frame."""
    filters = {
        "top": f"crop=iw:{STRIP}:0:0",
        "bottom": f"crop=iw:{STRIP}:0:ih-{STRIP}",
        "left": f"crop={STRIP}:ih:0:0",
        "right": f"crop={STRIP}:ih:iw-{STRIP}:0",
    }
    out = {}
    for name, vf in filters.items():
        proc = subprocess.run(
            ["ffmpeg", "-hide_banner", "-nostats", "-i", path,
             "-vf", f"{vf},signalstats,metadata=print:key=lavfi.signalstats.YMAX",
             "-f", "null", "-"],
            capture_output=True, text=True)
        vals = [float(v) for v in re.findall(r"lavfi\.signalstats\.YMAX=([\d.]+)", proc.stderr)]
        out[name] = vals
    return out


def main() -> int:
    parser = argparse.ArgumentParser(description="Check for content clipped at the frame edge.")
    parser.add_argument("path")
    parser.add_argument("--threshold", type=float, default=70.0)
    parser.add_argument("--frame", type=float, default=0.0, help="only report frames after this many seconds")
    args = parser.parse_args()

    edges = edge_luma(args.path)
    frames = min(len(v) for v in edges.values()) if edges else 0
    if not frames:
        print("could not measure the edges")
        return 1

    hits = []
    for i in range(frames):
        for name, vals in edges.items():
            if i < len(vals) and vals[i] > args.threshold:
                t = i / 30.0
                if t >= args.frame:
                    hits.append((t, name, vals[i]))

    if hits:
        print(f"{len(hits)} frames with bright content at the edge (threshold {args.threshold})")
        shown = hits[:12]
        for t, name, v in shown:
            print(f"  t={t:7.2f}s  {name:<6} luma {v:6.1f}")
        if len(hits) > len(shown):
            print(f"  ... and {len(hits) - len(shown)} more")
        return 1

    print(f"no bright content at the frame edge in {frames} frames")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
