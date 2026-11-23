"""Detect an interior dead band — the defect that shipped in ssd-trim.

A dark theme makes dark-pixel counts useless. The defect is structural: body
content stops, the footer caption is still hundreds of rows below, and nothing
lives in between. This measures the largest empty run between active rows,
sampled once per second, and reports the mean as a percentage of frame height.

Measured on the seven shipped Shorts: good = 6-19%, broken = 33.4%. The gate is
25%, which separates them without touching a legitimate sparse frame.

Usage:  python tools/deadband.py out/video.mp4 [--limit 25]
Exit 1 if the mean dead band exceeds the limit. Stdlib only.
"""
from __future__ import annotations

import argparse
import os
import subprocess
import sys
import tempfile

W, H = 108, 192
FRAME = W * H


def measure(path: str, ffmpeg: str) -> float:
    fd, raw = tempfile.mkstemp(prefix="deadband-", suffix=".raw")
    os.close(fd)
    try:
        subprocess.run(
            [ffmpeg, "-y", "-v", "error", "-i", path, "-vf",
             f"fps=1,scale={W}:{H},format=gray", "-f", "rawvideo", raw],
            check=True, capture_output=True,
        )
        data = open(raw, "rb").read()
    finally:
        try:
            os.remove(raw)
        except OSError:
            pass

    n = len(data) // FRAME
    if n == 0:
        raise RuntimeError("ffmpeg produced no frames")
    gaps = []
    for i in range(n):
        px = data[i * FRAME:(i + 1) * FRAME]
        hist = [0] * 256
        for v in px:
            hist[v] += 1
        bg = hist.index(max(hist))
        active = []
        for y in range(H):
            row = px[y * W:(y + 1) * W]
            if sum(1 for v in row if abs(v - bg) > 8) / W > 0.03:
                active.append(y)
        if len(active) < 2:
            gaps.append(1.0)
            continue
        best = max(b - a for a, b in zip(active, active[1:]))
        gaps.append(best / H)
    return 100.0 * sum(gaps) / len(gaps)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--limit", type=float, default=25.0)
    args = ap.parse_args()

    ffmpeg = os.environ.get("FFMPEG", "ffmpeg")
    try:
        pct = measure(args.video, ffmpeg)
    except (OSError, subprocess.SubprocessError, RuntimeError) as exc:
        print(f"dead band: could not measure ({exc})", file=sys.stderr)
        return 2

    ok = pct <= args.limit
    print(f"dead band: {pct:.1f}% of frame height (limit {args.limit:g}%)")
    if not ok:
        print("::error::interior dead band too large — content stops before the footer")
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
