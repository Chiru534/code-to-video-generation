"""Generate the weekly shorts: narration, placeholder timings, scene registry,
composition and registry entries.

WHY A GENERATOR: fourteen shorts each hand-writing the same four files is how
this repo grew to six private copies of buildPlan(). The CONTENT differs per
short; the machinery does not. So the content lives in one table here, and the
generator writes the files. Edit the table, never the output.

The output is four files per short, in src/shorts/<slug>/:

    narration.json   the spoken lines
    timings.json     PLACEHOLDER lengths; CI overwrites with measured ones
    scenes.tsx       the scene registry: scene id -> a kit component
    <Name>.tsx       the thin composition that wires them to the renderer

and one entry per short in episodes.json, with the publish date.

The scene registry is TSX rather than JSON on purpose: tools/audit.py finds a
scene by looking for `sNN:` lines in the .tsx files of the episode directory,
so a JSON registry would fail the "every narration line has a scene" gate.

Usage:  python tools/make_shorts_week.py [--only slug ...]
"""
from __future__ import annotations

import argparse
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHORTS_DIR = os.path.join(ROOT, "src", "shorts")

FPS = 30
VOICE = "af_heart"
SPEED = 0.95
TAIL_FRAMES = 12
MARK = "THE LAYER BELOW"

# Rough speaking rate at speed 0.95 with this voice, measured on the LittleBit
# short: 172 words in 72.1 s, so about 2.39 words per second.
WORDS_PER_SECOND = 2.39
PAD_SECONDS = 0.4  # the pause after each line, the same as every other episode

COLOR = {
    "text": "C.text",
    "cyan": "C.cyan",
    "amber": "C.amber",
    "red": "C.red",
    "green": "C.green",
    "violet": "C.violet",
    "dim": "C.dim",
    "faint": "C.faint",
}

# ---------------------------------------------------------------------------
# THE TABLE
#
# One entry per short. `lines` is the spoken script; `scenes` is the visual
# for each line, in the same order. Every number that needs a qualifier gets
# one: `note` on a figure is the honest label that sits ON SCREEN next to it.
# ---------------------------------------------------------------------------

SHORTS = [
    {
        "slug": "training-memory",
        "name": "TrainingMemoryShort",
        "title": "Why Training a 7B Model Needs 112 GB",
        "publishDate": "2026-11-12",
        "thumbSeconds": 2.0,
        "lines": [
            ("s01", "A seven-billion-parameter model runs on a laptop in fourteen gigabytes."),
            ("s02", "Training the same model needs a hundred and twelve."),
            ("s03", "That gap is arithmetic. It is worth doing carefully, because every term in it is a decision somebody made."),
            ("s04", "Start with the weights. Seven billion parameters at sixteen bits each is fourteen gigabytes."),
            ("s05", "Training also needs the gradients. Another fourteen gigabytes."),
            ("s06", "Then the optimizer. Adam keeps two running averages per parameter, momentum and variance, in full precision."),
            ("s07", "That is eight bytes per parameter. Two more copies of the model, held as state."),
            ("s08", "Fourteen, plus fourteen, plus fifty-six. Eighty-four gigabytes before a single activation."),
            ("s09", "Activations scale with batch size and sequence length, not with model size."),
            ("s10", "So the honest total depends on your configuration. At batch one and sequence four thousand, it lands near a hundred and twelve gigabytes."),
            ("s11", "You can make it fit. Shard it across eight GPUs, and each one holds an eighth."),
            ("s12", "But sharding does not delete the memory. It splits it, and adds the cost of the GPUs talking to each other."),
            ("s13", "A model you cannot fit is a model you cannot run. That is why training costs what it costs."),
        ],
        "scenes": [
            ("s01", "ShortFigure", {
                "value": "14", "unit": "GB", "label": "TO RUN A 7B MODEL",
                "note": "WEIGHTS ONLY · BF16", "color": "text", "kicker": "INFERENCE",
            }),
            ("s02", "ShortFigure", {
                "value": "112", "unit": "GB", "label": "TO TRAIN THE SAME MODEL",
                "note": "OUR ARITHMETIC · 7B / ADAM / BF16", "color": "cyan", "kicker": "TRAINING",
            }),
            ("s03", "ShortTitle", {
                "title": "It is arithmetic.", "sub": "EVERY TERM IS A DECISION",
                "kicker": "THE GAP", "meta": "ONE BY ONE",
            }),
            ("s04", "ShortFigure", {
                "value": "14", "unit": "GB", "label": "WEIGHTS · 7B × 16 BIT",
                "note": "OUR ARITHMETIC", "color": "text", "kicker": "TERM ONE",
            }),
            ("s05", "ShortFigure", {
                "value": "14", "unit": "GB", "label": "GRADIENTS · SAME SHAPE",
                "note": "OUR ARITHMETIC", "color": "text", "kicker": "TERM TWO",
            }),
            ("s06", "ShortStack", {
                "kicker": "TERM THREE",
                "rows": [
                    {"label": "MOMENTUM", "value": "28 GB", "color": "cyan",
                     "note": "7B × 4 BYTES · FP32"},
                    {"label": "VARIANCE", "value": "28 GB", "color": "violet",
                     "note": "7B × 4 BYTES · FP32"},
                ],
                "foot": "Two copies of the model.",
            }),
            ("s07", "ShortFigure", {
                "value": "8", "unit": "BYTES", "label": "PER PARAMETER, IN OPTIMIZER STATE",
                "note": "MOMENTUM + VARIANCE · FP32", "color": "amber", "kicker": "THE HIDDEN COST",
            }),
            ("s08", "ShortStack", {
                "kicker": "SO FAR",
                "rows": [
                    {"label": "WEIGHTS", "value": "14 GB", "color": "text"},
                    {"label": "GRADIENTS", "value": "14 GB", "color": "text"},
                    {"label": "ADAM STATE", "value": "56 GB", "color": "amber"},
                ],
                "foot": "84 GB, before a single activation.",
                "footColor": "amber",
            }),
            ("s09", "ShortScale", {
                "kicker": "THE PART THAT BITES",
                "points": [
                    {"x": 0.0, "label": "MODEL SIZE"},
                    {"x": 0.5, "label": "BATCH"},
                    {"x": 1.0, "label": "SEQUENCE"},
                ],
                "marker": 2,
                "markerLabel": "Activations scale with batch and sequence. Not with the model.",
                "axisLabel": "WHAT DRIVES THE MEMORY",
            }),
            ("s10", "ShortFigure", {
                "value": "112", "unit": "GB", "label": "WITH ACTIVATIONS",
                "note": "ASSUMES BATCH 1 · SEQUENCE 4096", "color": "cyan", "kicker": "THE TOTAL",
            }),
            ("s11", "ShortCompare", {
                "kicker": "THE FIX",
                "left": {"value": "8", "label": "GPUS", "color": "cyan"},
                "right": {"value": "14 GB", "label": "EACH", "color": "text"},
                "line": "Shard it across eight.",
            }),
            ("s12", "ShortCaveat", {
                "kicker": "THE HONEST VERSION",
                "claim": "Sharding makes it fit.",
                "reality": "It splits the memory, and adds the cost of eight GPUs talking to each other.",
            }),
            ("s13", "ShortEnd", {
                "title": "A model you cannot fit is a model you cannot run.",
                "sub": "Training memory is the budget every other number is measured against.",
            }),
        ],
    },
    {
        "slug": "fp4-format",
        "name": "Fp4FormatShort",
        "title": "What a Number Looks Like in Four Bits",
        "publishDate": "2026-11-12",
        "thumbSeconds": 2.0,
        "lines": [
            ("s01", "A floating-point number needs three things. A sign, an exponent, and a mantissa."),
            ("s02", "The exponent says how big or small the number can be. The mantissa says how finely you can pin it down."),
            ("s03", "FP32 spends thirty-two bits on that. Eight for the exponent, twenty-three for the mantissa, one for the sign."),
            ("s04", "Halve it and you halve the mantissa first. FP16 keeps five exponent bits and ten mantissa bits."),
            ("s05", "Keep going and you hit the real problem. The exponent runs out of room before the mantissa does."),
            ("s06", "FP8 splits the difference two ways. E4M3 has four exponent bits and three mantissa bits. E5M2 has five and two."),
            ("s07", "E4M3 has more precision and less range. E5M2 has more range and less precision."),
            ("s08", "Which one you want depends on whether you are storing a weight or an activation."),
            ("s09", "Then there is the clever part. You can shrink it to four bits. One sign, two exponent, one mantissa."),
            ("s10", "That is so little precision that one shared scale for a whole block of numbers would destroy them."),
            ("s11", "So the format stores a small scale factor alongside the block, and that scale is different for every group of values."),
            ("s12", "Four bits per number, and the block keeps its meaning."),
            ("s13", "That is how four-bit weights survive at all. The scale saves what one mantissa bit cannot hold."),
        ],
        "scenes": [
            ("s01", "ShortBits", {
                "kicker": "THE ANATOMY",
                "cells": [
                    {"text": "S", "color": "cyan", "width": 120},
                    {"text": "E", "color": "violet", "width": 120},
                    {"text": "M", "color": "amber", "width": 120},
                ],
                "label": "SIGN · EXPONENT · MANTISSA",
                "sub": "Three parts to every float",
            }),
            ("s02", "ShortStack", {
                "kicker": "WHAT EACH PART DOES",
                "rows": [
                    {"label": "EXPONENT", "value": "RANGE", "color": "violet",
                     "note": "HOW BIG OR SMALL"},
                    {"label": "MANTISSA", "value": "PRECISION", "color": "amber",
                     "note": "HOW FINELY YOU CAN PIN IT DOWN"},
                ],
            }),
            ("s03", "ShortBits", {
                "kicker": "FP32",
                "cells": [
                    {"text": "1", "color": "cyan", "width": 110, "filled": True},
                    {"text": "8", "color": "violet", "width": 180, "filled": True},
                    {"text": "23", "color": "amber", "width": 220, "filled": True},
                ],
                "label": "SIGN · EXPONENT · MANTISSA = 32 BITS",
                "sub": "Every bit spent.",
            }),
            ("s04", "ShortBits", {
                "kicker": "FP16",
                "cells": [
                    {"text": "1", "color": "cyan", "width": 110},
                    {"text": "5", "color": "violet", "width": 150},
                    {"text": "10", "color": "amber", "width": 190},
                ],
                "label": "16 BITS · THE MANTISSA HALVED",
                "sub": "Same range, less precision.",
            }),
            ("s05", "ShortBits", {
                "kicker": "THE SCARCE RESOURCE",
                "cells": [
                    {"text": "1", "color": "cyan", "width": 110},
                    {"text": "5", "color": "amber", "width": 150, "filled": True},
                    {"text": "10", "color": "violet", "width": 190},
                ],
                "label": "THE EXPONENT BIT IS WHAT RUNS OUT",
                "sub": "Range runs out before precision does.",
            }),
            ("s06", "ShortCompare", {
                "kicker": "EIGHT BITS, TWO WAYS",
                "left": {"value": "E4M3", "label": "4 EXPONENT · 3 MANTISSA", "color": "cyan"},
                "right": {"value": "E5M2", "label": "5 EXPONENT · 2 MANTISSA", "color": "violet"},
                "line": "Same eight bits. Two trade-offs.",
            }),
            ("s07", "ShortStack", {
                "kicker": "THE TRADE",
                "rows": [
                    {"label": "E4M3", "value": "PRECISION", "color": "cyan",
                     "note": "MORE MANTISSA · LESS RANGE"},
                    {"label": "E5M2", "value": "RANGE", "color": "violet",
                     "note": "MORE EXPONENT · LESS MANTISSA"},
                ],
            }),
            ("s08", "ShortTitle", {
                "title": "It depends what you are storing.",
                "sub": "WEIGHTS OR ACTIVATIONS",
                "kicker": "WHICH ONE",
            }),
            ("s09", "ShortBits", {
                "kicker": "FP4",
                "cells": [
                    {"text": "S", "color": "cyan", "width": 120},
                    {"text": "EE", "color": "violet", "width": 180},
                    {"text": "M", "color": "amber", "width": 120},
                ],
                "label": "1 SIGN · 2 EXPONENT · 1 MANTISSA",
                "sub": "Four bits.",
            }),
            ("s10", "ShortFigure", {
                "value": "1", "unit": "BIT", "label": "OF MANTISSA LEFT",
                "note": "ONE SHARED SCALE WOULD DESTROY THE BLOCK",
                "color": "red", "kicker": "THE PROBLEM",
            }),
            ("s11", "ShortStack", {
                "kicker": "THE FIX",
                "rows": [
                    {"label": "BLOCK OF 32 VALUES", "value": "ONE SCALE", "color": "cyan",
                     "note": "THE SCALE IS STORED ALONGSIDE"},
                    {"label": "EVERY BLOCK", "value": "ITS OWN SCALE", "color": "amber",
                     "note": "THE SCALE CHANGES PER BLOCK"},
                ],
            }),
            ("s12", "ShortFigure", {
                "value": "4", "unit": "BITS", "label": "PER NUMBER, AND THE BLOCK KEEPS ITS MEANING",
                "color": "cyan", "kicker": "THE RESULT",
            }),
            ("s13", "ShortEnd", {
                "title": "The scale saves what one mantissa bit cannot hold.",
                "sub": "That is how four-bit weights survive at all.",
            }),
        ],
    },
]


# ---------------------------------------------------------------------------
# EMIT
# ---------------------------------------------------------------------------

def jsx_attr(value) -> str:
    """One JSX attribute value."""
    if isinstance(value, bool):
        return "{true}" if value else "{false}"
    if isinstance(value, (int, float)):
        return "{" + str(value) + "}"
    if isinstance(value, str):
        if not re.search(r'["&<>]', value):
            return '"' + value + '"'
        return "{" + json.dumps(value, ensure_ascii=False) + "}"
    if isinstance(value, (list, dict)):
        return "{" + json.dumps(value, ensure_ascii=False) + "}"
    raise TypeError(f"unsupported prop: {value!r}")


def jsx_props(props: dict) -> str:
    parts = []
    for key, value in props.items():
        if key == "color" and isinstance(value, str) and value in COLOR:
            parts.append(f"color={{{COLOR[value]}}}")
        else:
            parts.append(f"{key}={jsx_attr(value)}")
    return " ".join(parts)


def scenes_tsx(short: dict) -> str:
    kinds = sorted({kind for _sid, kind, _props in short["scenes"]})
    order = [sid for sid, _kind, _props in short["scenes"]]
    lines = [
        "/* GENERATED by tools/make_shorts_week.py. Edit the table there, not here. */",
        "import React from \"react\";",
        "import { C } from \"../../theme\";",
        "import {",
    ]
    for kind in kinds:
        lines.append(f"  {kind},")
    lines.append("} from \"../../kit/portrait\";")
    lines.append("")
    lines.append("export const ORDER = [")
    for sid in order:
        lines.append(f"  \"{sid}\",")
    lines.append("];")
    lines.append("")
    lines.append("export const SCENE_NODES: Record<string, React.ReactNode> = {")
    for sid, kind, props in short["scenes"]:
        lines.append(f"  {sid}: <{kind} {jsx_props(props)} />,")
    lines.append("};")
    lines.append("")
    return "\n".join(lines)


def composition_tsx(short: dict) -> str:
    slug = short["slug"]
    audio = f"audio/shorts/{slug}"
    return f"""/* GENERATED by tools/make_shorts_week.py. Edit the table there, not here. */

import React from "react";
import {{ ORDER, SCENE_NODES }} from "./scenes";
import timings from "./timings.json";
import {{ ShortFilm, shortDuration }} from "../../kit/shortfilm";

/* tools/audit.py reads TAIL_FRAMES out of the episode source to compute the
 * expected render duration, so it has to live in a .tsx in this directory. */
const TAIL_FRAMES = {TAIL_FRAMES};

export const DURATION = shortDuration(ORDER, timings, TAIL_FRAMES);

export const {short["name"]}: React.FC = () => (
  <ShortFilm
    order={{ORDER}}
    timings={{timings}}
    scenes={{SCENE_NODES}}
    audioDir="{audio}"
    mark="{MARK}"
    tail={{TAIL_FRAMES}}
  />
);
"""


def narration_json(short: dict) -> dict:
    return {
        "voice": VOICE,
        "speed": SPEED,
        "lines": [{"id": sid, "text": text} for sid, text in short["lines"]],
    }


def timings_json(short: dict) -> dict:
    scenes = {}
    total = 0
    for sid, text in short["lines"]:
        words = len(text.split())
        sec = round(words / WORDS_PER_SECOND + PAD_SECONDS, 1)
        frames = int(round(sec * FPS))
        scenes[sid] = {"sec": sec, "frames": frames, "text": text}
        total += frames
    return {
        "note": (
            "PLACEHOLDER. CI regenerates this from measured narration before bundling "
            "(tools/tts.py). Do not hand-edit the frames."
        ),
        "fps": FPS,
        "voice": VOICE,
        "speed": SPEED,
        "totalFrames": total,
        "scenes": scenes,
    }


def episode_entry(short: dict) -> dict:
    return {
        "title": short["title"],
        "srcDir": f"src/shorts/{short['slug']}",
        "audioDir": f"public/audio/shorts/{short['slug']}",
        "composition": short["name"],
        "output": f"{short['slug']}.mp4",
        "thumbSeconds": short.get("thumbSeconds", 2.0),
        "publishDate": short["publishDate"],
        "status": "draft",
        "shape": "short",
        "style": "kit-hero",
    }


def write(path: str, body: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        handle.write(body)


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate the weekly shorts.")
    parser.add_argument("--only", default="", help="comma separated slugs")
    args = parser.parse_args()

    wanted = {s.strip() for s in args.only.split(",") if s.strip()}
    shorts = [s for s in SHORTS if not wanted or s["slug"] in wanted]
    if wanted and len(shorts) != len(wanted):
        missing = wanted - {s["slug"] for s in shorts}
        print(f"unknown slug(s): {sorted(missing)}")
        return 1

    for short in shorts:
        base = os.path.join(SHORTS_DIR, short["slug"])
        os.makedirs(base, exist_ok=True)
        with open(os.path.join(base, "narration.json"), "w", encoding="utf-8") as handle:
            json.dump(narration_json(short), handle, indent=2, ensure_ascii=False)
            handle.write("\n")
        with open(os.path.join(base, "timings.json"), "w", encoding="utf-8") as handle:
            json.dump(timings_json(short), handle, indent=2, ensure_ascii=False)
            handle.write("\n")
        write(os.path.join(base, "scenes.tsx"), scenes_tsx(short))
        write(os.path.join(base, f"{short['name']}.tsx"), composition_tsx(short))

        words = sum(len(t.split()) for _s, t in short["lines"])
        print(
            f"{short['slug']:<28} {len(short['lines']):>2} scenes "
            f"{words:>4} words  {short['publishDate']}"
        )

    # Registry. Only the keys this generator owns are touched.
    reg_path = os.path.join(ROOT, "episodes.json")
    with open(reg_path, encoding="utf-8") as handle:
        registry = json.load(handle)
    for short in shorts:
        registry[short["slug"]] = episode_entry(short)
    with open(reg_path, "w", encoding="utf-8") as handle:
        json.dump(registry, handle, indent=2, ensure_ascii=False)
        handle.write("\n")

    print(f"\nwrote {len(shorts)} short(s) + registry entries")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
