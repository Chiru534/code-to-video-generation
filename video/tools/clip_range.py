"""Print the frame range of one scene, so only that clip can be re-rendered.

The scene lengths come from the MEASURED narration, so the range has to be
computed from timings.json — the same file the renderer lays the plan out
from. If the two disagree, the clip lands in the wrong place.

Usage: python tools/clip_range.py <src-dir> <scene-id>
"""
import json
import os
import sys

TAIL = 12


def main() -> int:
    if len(sys.argv) != 3:
        print(__doc__)
        return 2
    src_dir, scene_id = sys.argv[1], sys.argv[2]

    path = os.path.join(src_dir, "timings.json")
    if not os.path.exists(path):
        print(f"::error::no timings.json at {path}")
        return 1
    with open(path, encoding="utf-8") as handle:
        timings = json.load(handle)

    scenes = timings.get("scenes") or {}
    order = sorted(scenes, key=lambda s: int(s[1:]))
    if scene_id not in scenes:
        print(f"::error::unknown scene {scene_id}; have {order[0]}..{order[-1]}")
        return 1

    cursor = 0
    for sid in order:
        dur = int(scenes[sid]["frames"]) + TAIL
        if sid == scene_id:
            print(f"{cursor} {cursor + dur}")
            return 0
        cursor += dur

    print(f"::error::scene {scene_id} not found")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
