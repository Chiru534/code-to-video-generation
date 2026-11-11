"""Check that each scene shows what its own narration line says.

WHY THIS EXISTS: a scene registry and a narration script are two lists. If
one of them is shifted by a single entry, every scene in the video shows the
wrong thing while every other gate in this repo stays green. The audit
proves a narration line HAS a scene; it cannot prove the scene shows that
line. flash-attention shipped exactly this way — every visual one scene
ahead of the words spoken over it — and no amount of looking at midpoints
caught it, because each individual frame looked correct.

THE TEST: a scene's on-screen words should share vocabulary with the line
spoken over it. The offset that fits best across the whole short should be
zero. A short whose best fit is +1 or -1 is shifted.

The gate only fires on a clear margin, because word overlap is a blunt
instrument and a wrong failure would train people to ignore it.

Usage:  python tools/check_alignment.py [--dir src/shorts]
"""
from __future__ import annotations

import argparse
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Words too common to be evidence. Deliberately NOT excluded: same, token,
# sentence, memory, attention. Those are exactly the words that would hide a
# real mismatch.
STOP = {
    "the", "a", "an", "and", "or", "of", "to", "in", "on", "is", "it", "its",
    "that", "this", "these", "those", "with", "for", "from", "at", "by", "as",
    "not", "no", "you", "your", "we", "they", "he", "she", "but", "so", "if",
    "than", "then", "there", "here", "what", "how", "why", "who", "when",
    "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "every", "all", "more", "most", "much", "many", "own",
    "other", "another", "into", "out", "up", "down", "over", "under", "only",
    "also", "very", "can", "will", "do", "does", "did", "be", "been", "being",
    "have", "has", "had", "was", "were", "are", "am", "get", "gets", "go",
    "goes", "make", "makes", "made", "take", "takes", "put", "keep", "keeps",
    "let", "lets", "less", "least", "still", "just", "now", "like", "new",
    "old", "first", "last", "next", "per", "gb", "mb", "bit", "bits",
}

SCENE_RE = re.compile(r"^[ \t]*(s\d+):[ \t]*(<Short\w+.*?/>),[ \t]*\r?$", re.M)


def words(text: str) -> set[str]:
    return {w for w in re.findall(r"[a-z0-9']+", text.lower())
            if w not in STOP and len(w) > 2}


def score_at(lines, nodes, offset: int) -> int:
    hit = 0
    for i, (sid, _text) in enumerate(lines):
        j = i + offset
        if j < 0 or j >= len(lines):
            continue
        node = nodes.get(sid, "")
        if words(node) & words(lines[j][1]):
            hit += 1
    return hit


def check_dir(path: str) -> list[tuple[str, str, int, int]]:
    problems = []
    for slug in sorted(os.listdir(path)):
        src = os.path.join(path, slug)
        if not os.path.isdir(src):
            continue
        narration_path = os.path.join(src, "narration.json")
        scenes_path = os.path.join(src, "scenes.tsx")
        if not (os.path.exists(narration_path) and os.path.exists(scenes_path)):
            continue
        narration = json.load(open(narration_path, encoding="utf-8"))
        lines = [(ln["id"], ln.get("text") or "") for ln in narration.get("lines") or []]
        body = open(scenes_path, encoding="utf-8", errors="replace").read()
        nodes = dict(SCENE_RE.findall(body))
        if len(nodes) != len(lines):
            problems.append((slug, "scene count does not match the narration count", 0, 0))
            continue

        scores = {off: score_at(lines, nodes, off) for off in (-1, 0, 1)}
        best = max(scores, key=lambda k: (scores[k], -abs(k)))
        margin = scores[best] - scores[0]
        if best != 0 and scores[best] >= 8 and margin >= 3:
            detail = "  ".join(f"{k:+d}:{v}" for k, v in sorted(scores.items()))
            problems.append(
                (slug, f"scenes are shifted {best:+d} from the narration ({detail})",
                 scores[0], scores[best])
            )
    return problems


def main() -> int:
    parser = argparse.ArgumentParser(description="Check scene/narration alignment.")
    parser.add_argument("--dir", default="src/shorts",
                        help="directory of episode folders to check")
    args = parser.parse_args()

    target = os.path.join(ROOT, args.dir)
    if not os.path.isdir(target):
        print(f"skip: {args.dir} does not exist")
        return 0

    problems = check_dir(target)
    if problems:
        print("scene/narration alignment:")
        for slug, detail, zero, best in problems:
            print(f"  [FAIL] {slug}: {detail}")
            print(f"         offset 0 matches {zero} lines, the best offset matches {best}")
        return 1

    checked = len([d for d in os.listdir(target)
                   if os.path.isdir(os.path.join(target, d))])
    print(f"scene/narration alignment: {checked} episodes, no shift found")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
