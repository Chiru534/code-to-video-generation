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
    {
        "slug": "diffusion-llm",
        "name": "DiffusionLlmShort",
        "title": "Why a Language Model Can Write Out of Order",
        "publishDate": "2026-11-13",
        "thumbSeconds": 2.0,
        "lines": [
            ("s01", "Every language model you have used writes left to right. One token at a time, each waiting for the last."),
            ("s02", "That loop is the reason inference is slow, and it is not obvious that you have to do it this way."),
            ("s03", "A diffusion model does not generate. It denoises. It starts with a block of masked tokens and fills them in."),
            ("s04", "All masked. Nothing decided. Every slot is a question mark."),
            ("s05", "Then it predicts every position at once, and unmasks only the ones it is confident about."),
            ("s06", "One step, six of eight slots. Then the next step works on what is left."),
            ("s07", "Which means the order is not left to right. It is confidence order."),
            ("s08", "That is the appeal. A handful of denoising steps instead of hundreds of single-token steps."),
            ("s09", "And for the hardware it is bigger still. Batched matrix multiplies are what a GPU is good at."),
            ("s10", "But here is the honest part. The tokens are not equally confident. The easy ones get filled early."),
            ("s11", "So the speedup depends on how many slots you dare to unmask per step."),
            ("s12", "Unmask too many and you commit to a bad token, and you cannot take it back."),
            ("s13", "The order is free. The confidence is not."),
        ],
        "scenes": [
            ("s01", "ShortTokens", {
                "kicker": "THE LOOP",
                "tokens": ["the", "model", "is", "a", "?", "?"],
                "filled": 4,
                "label": "ONE TOKEN AT A TIME",
                "sub": "Every token waits for the last.",
            }),
            ("s02", "ShortStack", {
                "kicker": "TWO WAYS TO WRITE",
                "rows": [
                    {"label": "AUTOREGRESSIVE", "value": "N STEPS", "note": "ONE TOKEN PER PASS"},
                    {"label": "DIFFUSION", "value": "K STEPS", "note": "MANY TOKENS PER PASS", "color": "cyan"},
                ],
            }),
            ("s03", "ShortTokens", {
                "kicker": "STEP ZERO",
                "tokens": ["?", "?", "?", "?", "?", "?", "?", "?"],
                "filled": 0,
                "label": "ALL MASKED · NOTHING DECIDED",
                "sub": "It starts from nothing.",
            }),
            ("s04", "ShortTitle", {
                "title": "Every slot is a question mark.",
                "sub": "NOTHING DECIDED YET",
                "kicker": "THE STARTING POINT",
            }),
            ("s05", "ShortTokens", {
                "kicker": "ONE STEP",
                "tokens": ["the", "model", "is", "a", "?", "?", "?", "?"],
                "filled": 3, "focus": 3,
                "label": "PREDICT EVERY POSITION",
                "sub": "Unmask only what you are sure of.",
            }),
            ("s06", "ShortTokens", {
                "kicker": "AFTER ONE STEP",
                "tokens": ["the", "model", "is", "a", "big", "one", "?", "?"],
                "filled": 6,
                "label": "SIX OF EIGHT SLOTS",
                "sub": "Then the next step works on what is left.",
            }),
            ("s07", "ShortTitle", {
                "title": "Confidence order.",
                "sub": "NOT LEFT TO RIGHT",
                "kicker": "THE ORDER",
            }),
            ("s08", "ShortCompare", {
                "kicker": "THE APPEAL",
                "left": {"value": "N", "label": "AUTOREGRESSIVE STEPS", "color": "dim"},
                "right": {"value": "K", "label": "DENOISING STEPS", "color": "cyan"},
                "line": "A handful of steps.",
            }),
            ("s09", "ShortStack", {
                "kicker": "FOR THE HARDWARE",
                "rows": [
                    {"label": "AUTOREGRESSIVE", "value": "BATCH OF 1", "note": "A MOSTLY IDLE GPU"},
                    {"label": "DIFFUSION", "value": "BATCH OF 32", "note": "THE MATMULS A GPU WANTS", "color": "cyan"},
                ],
            }),
            ("s10", "ShortTokens", {
                "kicker": "THE HONEST PART",
                "tokens": ["the", "cat", "sat", "?", "?", "?", "?", "?"],
                "filled": 4,
                "label": "CONFIDENCE IS NOT EVEN",
                "sub": "The easy slots fill first.",
            }),
            ("s11", "ShortCompare", {
                "kicker": "THE BET",
                "left": {"value": "FEW", "label": "UNMASK PER STEP", "color": "amber"},
                "right": {"value": "MANY", "label": "UNMASK PER STEP", "color": "cyan"},
                "line": "How many slots do you dare to commit?",
            }),
            ("s12", "ShortCaveat", {
                "kicker": "THE TRADE",
                "claim": "Parallel decoding is faster.",
                "reality": "Every slot you unmask early is a slot you cannot revise. The speedup is a bet on confidence.",
            }),
            ("s13", "ShortEnd", {
                "title": "The order is free. The confidence is not.",
                "sub": "Diffusion language models trade the loop for a bet.",
            }),
        ],
    },
    {
        "slug": "kv-cache",
        "name": "KvCacheShort",
        "title": "Why the Cache Outgrows the Model",
        "publishDate": "2026-11-13",
        "thumbSeconds": 2.0,
        "lines": [
            ("s01", "Here is a model with seven billion weights, sitting in fourteen gigabytes of memory."),
            ("s02", "Now make it write a long document. Every token it writes gets stored."),
            ("s03", "Not just the token. The key and the value vector, for every layer, for every head."),
            ("s04", "That is the key-value cache. It is the reason long context is expensive."),
            ("s05", "The arithmetic for one token: thirty-two layers, each keeping a key and a value for every head."),
            ("s06", "That is about half a megabyte per token, in half precision, for a model this size."),
            ("s07", "A hundred thousand tokens of context is fifty gigabytes. For one conversation."),
            ("s08", "The model itself is fourteen gigabytes. The cache is now the bigger number."),
            ("s09", "Which flips the question. It is not how big is the model. It is how much are you going to ask it."),
            ("s10", "You can shrink the cache. Compress it, evict it, quantise it, or share the heads."),
            ("s11", "Every one of those is a trade. Compression costs accuracy, eviction costs context."),
            ("s12", "And none of them is free. They are all the same move: fit more context into less memory."),
            ("s13", "The model is the thing you trained. The cache is the thing you pay for."),
        ],
        "scenes": [
            ("s01", "ShortFigure", {
                "value": "14", "unit": "GB", "label": "THE WEIGHTS",
                "note": "7B PARAMETERS · BF16", "color": "text", "kicker": "THE MODEL",
            }),
            ("s02", "ShortFigure", {
                "value": "1", "unit": "TOKEN", "label": "AND NOW IT WRITES",
                "color": "cyan", "kicker": "THE OTHER THING",
            }),
            ("s03", "ShortStack", {
                "kicker": "WHAT GETS STORED",
                "rows": [
                    {"label": "PER LAYER", "value": "KEY + VALUE", "note": "FOR EVERY HEAD"},
                    {"label": "PER TOKEN", "value": "ALL OF THEM", "note": "THE WHOLE HISTORY"},
                ],
            }),
            ("s04", "ShortTitle", {
                "title": "The key-value cache.",
                "sub": "WHY LONG CONTEXT IS EXPENSIVE",
                "kicker": "THE NAME",
            }),
            ("s05", "ShortStack", {
                "kicker": "ONE TOKEN",
                "rows": [
                    {"label": "LAYERS", "value": "32", "note": "EACH KEEPS ITS OWN COPY"},
                    {"label": "PER LAYER", "value": "KEY + VALUE", "note": "FOR EVERY HEAD"},
                ],
            }),
            ("s06", "ShortFigure", {
                "value": "0.5", "unit": "MB", "label": "OF CACHE, PER TOKEN",
                "note": "OUR ARITHMETIC · 7B · 32 LAYERS · BF16 · FULL MHA",
                "color": "amber", "kicker": "THE NUMBER",
            }),
            ("s07", "ShortFigure", {
                "value": "50", "unit": "GB", "label": "OF CACHE AT 100K TOKENS",
                "note": "OUR ARITHMETIC · ONE CONVERSATION", "color": "red", "kicker": "THE SAME FACTOR",
            }),
            ("s08", "ShortCompare", {
                "kicker": "WHICH IS BIGGER",
                "left": {"value": "14 GB", "label": "THE MODEL", "color": "text"},
                "right": {"value": "50 GB", "label": "THE CACHE", "color": "red"},
                "line": "The cache is now the bigger number.",
            }),
            ("s09", "ShortTitle", {
                "title": "It is not how big is the model.",
                "sub": "IT IS HOW MUCH YOU WILL ASK",
                "kicker": "THE QUESTION FLIPS",
            }),
            ("s10", "ShortStack", {
                "kicker": "THE FIXES",
                "rows": [
                    {"label": "COMPRESS", "value": "COSTS ACCURACY"},
                    {"label": "EVICT", "value": "COSTS CONTEXT"},
                    {"label": "SHARE HEADS", "value": "COSTS QUALITY"},
                    {"label": "QUANTISE", "value": "COSTS PRECISION"},
                ],
            }),
            ("s11", "ShortCompare", {
                "kicker": "THE TRADE",
                "left": {"value": "LESS", "label": "MEMORY", "color": "cyan"},
                "right": {"value": "LESS", "label": "CONTEXT OR PRECISION", "color": "amber"},
                "line": "Nothing shrinks for free.",
            }),
            ("s12", "ShortTitle", {
                "title": "Fit more context into less memory.",
                "sub": "EVERY TRADE IS THE SAME TRADE",
                "kicker": "THE MOVE",
            }),
            ("s13", "ShortEnd", {
                "title": "The model is the thing you trained.",
                "sub": "The cache is the thing you pay for.",
            }),
        ],
    },
    {
        "slug": "activation-checkpointing",
        "name": "ActivationCheckpointingShort",
        "title": "Throw It Away and Compute It Again",
        "publishDate": "2026-11-14",
        "thumbSeconds": 2.0,
        "lines": [
            ("s01", "Here is the third term in the training bill: activations."),
            ("s02", "Every layer passes its output to the next one, and the backward pass needs those outputs to work out the gradients."),
            ("s03", "So you keep them. All of them. For every layer, for every token in the batch."),
            ("s04", "And activations are the only term that does not scale with the model. They scale with batch size and sequence length."),
            ("s05", "Double the sequence length and you double the activation memory."),
            ("s06", "Which means the term you can control without touching the model is the one that scales with your batch size."),
            ("s07", "There is a trade available. Do not save the activations. Save only the inputs to a few checkpoints."),
            ("s08", "Then when the backward pass needs a layer you threw away, recompute it from the last checkpoint."),
            ("s09", "You traded memory for arithmetic. And arithmetic is the thing a data centre actually has."),
            ("s10", "The cost is real. A checkpointed step does about a third more work than an uncheckpointed one."),
            ("s11", "A third more compute to fit twice the batch, or twice the context."),
            ("s12", "Which is why nobody turns it on for its own sake. You turn it on when the run will not fit."),
            ("s13", "Throw it away. Compute it again. That is the whole trick."),
        ],
        "scenes": [
            ("s01", "ShortStack", {
                "kicker": "THE BILL",
                "rows": [
                    {"label": "WEIGHTS", "value": "14 GB"},
                    {"label": "GRADIENTS", "value": "14 GB"},
                    {"label": "OPTIMIZER", "value": "56 GB", "color": "amber"},
                    {"label": "ACTIVATIONS", "value": "THE VARIABLE", "color": "cyan"},
                ],
            }),
            ("s02", "ShortStack", {
                "kicker": "WHY THEY EXIST",
                "rows": [
                    {"label": "FORWARD PASS", "value": "OUTPUTS"},
                    {"label": "BACKWARD PASS", "value": "NEEDS THEM", "color": "cyan"},
                ],
            }),
            ("s03", "ShortGrid", {
                "kicker": "WHAT IS KEPT",
                "rows": 6, "cols": 6, "cell": 84, "font": 17,
                "label": "ONE COPY PER LAYER, PER TOKEN",
            }),
            ("s04", "ShortScale", {
                "kicker": "WHAT DRIVES IT",
                "points": [
                    {"x": 0.0, "label": "MODEL SIZE"},
                    {"x": 1.0, "label": "BATCH × SEQUENCE"},
                ],
                "marker": 1,
                "markerLabel": "Activations scale with the work, not with the model.",
                "axisLabel": "THE ONLY TERM YOU CONTROL",
            }),
            ("s05", "ShortFigure", {
                "value": "2", "unit": "×", "label": "THE SEQUENCE LENGTH, THE MEMORY",
                "color": "cyan", "kicker": "DOUBLE IT",
            }),
            ("s06", "ShortStack", {
                "kicker": "THE ONE YOU CONTROL",
                "rows": [
                    {"label": "MODEL SIZE", "value": "FIXED", "color": "dim"},
                    {"label": "BATCH × SEQUENCE", "value": "YOUR CALL", "color": "cyan"},
                ],
            }),
            ("s07", "ShortStack", {
                "kicker": "THE TRADE",
                "rows": [
                    {"label": "SAVE EVERY ACTIVATION", "value": "FULL MEMORY"},
                    {"label": "SAVE A FEW CHECKPOINTS", "value": "LESS MEMORY", "color": "cyan",
                     "note": "AND MORE ARITHMETIC"},
                ],
            }),
            ("s08", "ShortTitle", {
                "title": "Throw it away, then compute it again.",
                "sub": "THE BACKWARD PASS REBUILDS IT",
                "kicker": "THE TRICK",
            }),
            ("s09", "ShortCompare", {
                "kicker": "THE SWAP",
                "left": {"value": "MEMORY", "label": "YOU SAVE IT", "color": "cyan"},
                "right": {"value": "ARITHMETIC", "label": "YOU HAVE IT", "color": "text"},
                "line": "Trade memory for arithmetic.",
            }),
            ("s10", "ShortFigure", {
                "value": "+33%", "unit": "WORK", "label": "PER TRAINING STEP",
                "note": "ONE EXTRA FORWARD PASS", "color": "amber", "kicker": "THE COST",
            }),
            ("s11", "ShortCompare", {
                "kicker": "THE BARGAIN",
                "left": {"value": "2×", "label": "THE BATCH", "color": "cyan"},
                "right": {"value": "+33%", "label": "THE COMPUTE", "color": "amber"},
                "line": "Fit twice the batch, for a third more work.",
            }),
            ("s12", "ShortCaveat", {
                "kicker": "THE HONEST VERSION",
                "claim": "You can turn it on for free.",
                "reality": "It costs about a third more work per step. You turn it on when the run does not fit.",
            }),
            ("s13", "ShortEnd", {
                "title": "Throw it away. Compute it again.",
                "sub": "That is the whole trick.",
            }),
        ],
    },
    {
        "slug": "gqa",
        "name": "GqaShort",
        "title": "Share the Keys, Keep the Queries",
        "publishDate": "2026-11-14",
        "thumbSeconds": 2.0,
        "lines": [
            ("s01", "Attention stores a key and a value for every head, for every layer, for every token."),
            ("s02", "That is a lot of duplication. Many heads end up storing almost the same key."),
            ("s03", "Group-query attention says: keep all the queries separate, but let a group of heads share one key and one value."),
            ("s04", "Eight query heads, one key and one value. Eight times less to store."),
            ("s05", "And the query still gets to be its own self, so each head can still look somewhere different."),
            ("s06", "Which sounds free. It is not, and the reason is a detail."),
            ("s07", "The shared key has to serve eight different queries, so it has to be the average of what those eight heads wanted."),
            ("s08", "Average keys are duller keys. The direction each head actually cared about gets smeared."),
            ("s09", "So quality does drop. The question is how much, and how fast it stops dropping."),
            ("s10", "DeepSeek went further and compressed the cache into a low-rank latent space instead."),
            ("s11", "Which gets the size down further, at the cost of rebuilding the keys on every step."),
            ("s12", "So the ladder is: share the heads, then compress them, then quantise what is left."),
            ("s13", "Every rung of that ladder is a trade, and the whole field is climbing it."),
        ],
        "scenes": [
            ("s01", "ShortStack", {
                "kicker": "THE STORAGE",
                "rows": [
                    {"label": "PER TOKEN", "value": "KEY + VALUE", "note": "FOR EVERY HEAD"},
                    {"label": "PER LAYER", "value": "ALL OF THEM", "note": "THE WHOLE HISTORY"},
                ],
            }),
            ("s02", "ShortGrid", {
                "kicker": "THE DUPLICATION",
                "rows": 6, "cols": 6, "cell": 84, "font": 17, "color": "violet",
                "label": "MANY HEADS, NEARLY THE SAME KEY",
            }),
            ("s03", "ShortCompare", {
                "kicker": "THE IDEA",
                "left": {"value": "8 HEADS", "label": "SEPARATE QUERIES", "color": "cyan"},
                "right": {"value": "1", "label": "SHARED KEY + VALUE", "color": "violet"},
                "line": "Eight queries, one stored key.",
            }),
            ("s04", "ShortFigure", {
                "value": "8", "unit": "×", "label": "LESS KEY-VALUE CACHE",
                "note": "GROUP SIZE 8", "color": "cyan", "kicker": "THE SAVING",
            }),
            ("s05", "ShortTokens", {
                "kicker": "WHAT DOES NOT CHANGE",
                "tokens": ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"],
                "filled": 8,
                "label": "EVERY HEAD STILL ASKS ITS OWN QUESTION",
                "sub": "The query is never shared.",
            }),
            ("s06", "ShortTitle", {
                "title": "Which sounds free.",
                "sub": "IT IS NOT",
                "kicker": "THE DETAIL",
            }),
            ("s07", "ShortCompare", {
                "kicker": "THE SMEAR",
                "left": {"value": "8", "label": "QUERIES WANTED", "color": "cyan"},
                "right": {"value": "1", "label": "KEY STORED", "color": "violet"},
                "line": "The key has to be the average of eight.",
            }),
            ("s08", "ShortStack", {
                "kicker": "THE SMEAR",
                "rows": [
                    {"label": "HEAD 1 WANTS", "value": "NORTH"},
                    {"label": "HEAD 2 WANTS", "value": "EAST"},
                    {"label": "THE SHARED KEY", "value": "NEITHER", "color": "amber",
                     "note": "THE AVERAGE OF BOTH"},
                ],
            }),
            ("s09", "ShortCompare", {
                "kicker": "THE HIT",
                "left": {"value": "DOWN", "label": "QUALITY", "color": "amber"},
                "right": {"value": "FLAT", "label": "THEN IT STOPS DROPPING", "color": "cyan"},
                "line": "It drops, then it flattens.",
            }),
            ("s10", "ShortTitle", {
                "title": "Compress it instead.",
                "sub": "ONE LOW-RANK LATENT FOR THE WHOLE CACHE",
                "kicker": "DEEPSEEK GOES FURTHER",
            }),
            ("s11", "ShortStack", {
                "kicker": "THE DEAL",
                "rows": [
                    {"label": "THE CACHE", "value": "ONE LATENT", "color": "cyan", "note": "MUCH SMALLER"},
                    {"label": "EVERY STEP", "value": "REBUILD THE KEYS", "color": "amber",
                     "note": "THE PRICE OF THE SMALLER CACHE"},
                ],
            }),
            ("s12", "ShortStack", {
                "kicker": "THE LADDER",
                "rows": [
                    {"label": "1", "value": "SHARE THE HEADS"},
                    {"label": "2", "value": "COMPRESS THEM"},
                    {"label": "3", "value": "QUANTISE WHAT IS LEFT"},
                ],
            }),
            ("s13", "ShortEnd", {
                "title": "Every rung is a trade.",
                "sub": "And the whole field is climbing this ladder.",
            }),
        ],
    },
    {
        "slug": "moe-active",
        "name": "MoeActiveShort",
        "title": "236 Billion Parameters, 21 Billion Working",
        "publishDate": "2026-11-15",
        "thumbSeconds": 2.0,
        "lines": [
            ("s01", "DeepSeek-V2 has two hundred and thirty-six billion parameters."),
            ("s02", "And on any given token, only twenty-one billion of them are used."),
            ("s03", "That is a mixture of experts. A router reads the token and picks eight experts out of a hundred and sixty."),
            ("s04", "A hundred and fifty-two never run at all. And two shared experts always do."),
            ("s05", "So the compute you pay for is the compute of a twenty-one-billion model."),
            ("s06", "But the memory you need is still two hundred and thirty-six billion parameters. All of them are stored."),
            ("s07", "Sparse compute, dense storage. That is the deal."),
            ("s08", "It is a good one for throughput, and a bad one for your disk bill."),
            ("s09", "And there is a cost that does not show up in either number. The router has to be right."),
            ("s10", "Pick the wrong expert and the token goes through a network that was never trained for it."),
            ("s11", "So the router has to be balanced. Send too much to one expert and the rest go stale."),
            ("s12", "Most of these models also run a couple of dense experts on every token, so no token is completely unrouted."),
            ("s13", "Two hundred and thirty-six billion parameters. Twenty-one billion working. Both numbers are true."),
        ],
        "scenes": [
            ("s01", "ShortFigure", {
                "value": "236", "unit": "B", "label": "PARAMETERS IN DEEPSEEK-V2",
                "note": "PAPER FIGURE", "color": "text", "kicker": "THE MODEL",
            }),
            ("s02", "ShortFigure", {
                "value": "21", "unit": "B", "label": "ACTIVATED ON ANY ONE TOKEN",
                "note": "PAPER FIGURE", "color": "cyan", "kicker": "THE OTHER NUMBER",
            }),
            ("s03", "ShortTitle", {
                "title": "A router picks the experts.",
                "sub": "EIGHT OUT OF A HUNDRED AND SIXTY",
                "kicker": "MIXTURE OF EXPERTS",
            }),
            ("s04", "ShortGrid", {
                "kicker": "THE POOL",
                "rows": 4, "cols": 10, "cell": 78, "font": 13, "color": "violet",
                "label": "152 EXPERTS SLEEP · 2 SHARED ALWAYS RUN",
            }),
            ("s05", "ShortCompare", {
                "kicker": "SPARSE COMPUTE",
                "left": {"value": "21B", "label": "COMPUTE PER TOKEN", "color": "cyan"},
                "right": {"value": "236B", "label": "PARAMETERS STORED", "color": "amber"},
                "line": "Sparse compute. Dense storage.",
            }),
            ("s06", "ShortFigure", {
                "value": "236", "unit": "B", "label": "STILL ON YOUR DISK",
                "note": "PAPER FIGURE", "color": "amber", "kicker": "THE MEMORY",
            }),
            ("s07", "ShortTitle", {
                "title": "Sparse compute, dense storage.",
                "sub": "THAT IS THE DEAL",
                "kicker": "THE TRADE",
            }),
            ("s08", "ShortCompare", {
                "kicker": "THE BILL",
                "left": {"value": "CHEAP", "label": "COMPUTE", "color": "cyan"},
                "right": {"value": "DEAR", "label": "MEMORY", "color": "amber"},
                "line": "A good deal for throughput. A bad one for your disk bill.",
            }),
            ("s09", "ShortTitle", {
                "title": "The router has to be right.",
                "sub": "A COST THAT SHOWS UP IN NEITHER NUMBER",
                "kicker": "THE HIDDEN ONE",
            }),
            ("s10", "ShortStack", {
                "kicker": "THE MISMATCH",
                "rows": [
                    {"label": "THE ROUTER PICKS", "value": "8 EXPERTS", "color": "cyan"},
                    {"label": "THE TOKEN NEEDS", "value": "ONE PATH", "color": "amber"},
                    {"label": "THE MISMATCH", "value": "NO TRAINING FOR IT", "color": "red"},
                ],
            }),
            ("s11", "ShortCompare", {
                "kicker": "THE BALANCE",
                "left": {"value": "ONE", "label": "EXPERT SWAMPED", "color": "red"},
                "right": {"value": "MANY", "label": "EXPERTS GO STALE", "color": "amber"},
                "line": "Balance the router or waste the capacity.",
            }),
            ("s12", "ShortStack", {
                "kicker": "WHY TWO KINDS",
                "rows": [
                    {"label": "ROUTED EXPERTS", "value": "8 OF 160", "color": "violet",
                     "note": "PICKED PER TOKEN"},
                    {"label": "SHARED EXPERTS", "value": "2, ALWAYS ON", "color": "cyan",
                     "note": "NO TOKEN IS COMPLETELY UNROUTED"},
                ],
            }),
            ("s13", "ShortEnd", {
                "title": "236 billion stored. 21 billion working.",
                "sub": "Both numbers are true, and you pay for both.",
            }),
        ],
    },
    {
        "slug": "flash-attention",
        "name": "FlashAttentionShort",
        "title": "FlashAttention Is Not a Faster Kernel",
        "publishDate": "2026-11-15",
        "thumbSeconds": 2.0,
        "lines": [
            ("s01", "FlashAttention is famous for being fast. That is the least interesting thing about it."),
            ("s02", "The interesting thing is that it is not a faster kernel. It is a different order of operations."),
            ("s03", "Attention has three steps. Multiply the queries and keys. Softmax the scores. Multiply by the values."),
            ("s04", "The slow part is the middle one. The score matrix is sequence length by sequence length."),
            ("s05", "At eight thousand tokens that is sixty-seven million numbers per head, written out to memory."),
            ("s06", "And then read straight back. That round trip is what costs the time."),
            ("s07", "FlashAttention never writes the score matrix down. It tiles it."),
            ("s08", "It computes a block of scores in fast memory, softmaxes that block, multiplies it into the output, and throws it away."),
            ("s09", "So the huge matrix never exists anywhere. Not on disk, not in video memory."),
            ("s10", "The memory traffic drops from quadratic to linear, and the flops stay exactly the same."),
            ("s11", "Same mathematics. Same answer. A completely different memory access pattern."),
            ("s12", "Which is why the name is a bit of a joke. It is not about attention. It is about not writing things down."),
            ("s13", "The fastest kernels are the ones that touch memory least."),
        ],
        "scenes": [
            ("s01", "ShortTitle", {
                "title": "It is not a faster kernel.",
                "sub": "IT IS A DIFFERENT ORDER OF OPERATIONS",
                "kicker": "FLASHATTENTION",
            }),
            ("s02", "ShortStack", {
                "kicker": "THE THREE STEPS",
                "rows": [
                    {"label": "STEP 1", "value": "Q × K"},
                    {"label": "STEP 2", "value": "SOFTMAX", "color": "amber"},
                    {"label": "STEP 3", "value": "× V"},
                ],
            }),
            ("s03", "ShortGrid", {
                "kicker": "THE SLOW PART",
                "rows": 6, "cols": 8, "cell": 78, "font": 13, "color": "amber",
                "label": "THE SCORE MATRIX",
            }),
            ("s04", "ShortFigure", {
                "value": "67M", "unit": "NUMBERS", "label": "IN THE SCORE MATRIX AT 8K TOKENS",
                "note": "PER HEAD", "color": "amber", "kicker": "THE SIZE",
            }),
            ("s05", "ShortStack", {
                "kicker": "THE ROUND TRIP",
                "rows": [
                    {"label": "COMPUTE THE BLOCK", "value": "FAST MEMORY"},
                    {"label": "WRITE IT TO VRAM", "value": "SLOW", "color": "red"},
                    {"label": "READ IT BACK", "value": "SLOW", "color": "red"},
                ],
            }),
            ("s06", "ShortTitle", {
                "title": "It never writes the matrix down.",
                "sub": "IT TILES IT",
                "kicker": "THE TRICK",
            }),
            ("s07", "ShortStack", {
                "kicker": "PER BLOCK",
                "rows": [
                    {"label": "ONE BLOCK", "value": "COMPUTE + SOFTMAX + ACCUMULATE", "color": "cyan",
                     "note": "ALL IN FAST MEMORY"},
                    {"label": "THEN", "value": "THROW IT AWAY", "color": "amber"},
                ],
            }),
            ("s08", "ShortFigure", {
                "value": "0", "unit": "BYTES", "label": "OF SCORE MATRIX STORED",
                "color": "green", "kicker": "THE RESULT",
            }),
            ("s09", "ShortCompare", {
                "kicker": "WHAT CHANGED",
                "left": {"value": "O(n²)", "label": "MEMORY TRAFFIC, BEFORE", "color": "red"},
                "right": {"value": "O(n)", "label": "MEMORY TRAFFIC, AFTER", "color": "green"},
                "line": "Quadratic becomes linear.",
            }),
            ("s10", "ShortCompare", {
                "kicker": "WHAT DID NOT",
                "left": {"value": "SAME", "label": "THE FLOPS", "color": "text"},
                "right": {"value": "SAME", "label": "THE ANSWER", "color": "text"},
                "line": "Exactly the same mathematics.",
            }),
            ("s11", "ShortTitle", {
                "title": "It is not about attention.",
                "sub": "IT IS ABOUT NOT WRITING THINGS DOWN",
                "kicker": "THE NAME",
            }),
            ("s12", "ShortCaveat", {
                "kicker": "THE HONEST VERSION",
                "claim": "FlashAttention makes attention faster.",
                "reality": "It does not change the mathematics at all. It changes when the data moves.",
            }),
            ("s13", "ShortEnd", {
                "title": "The fastest kernels touch memory least.",
                "sub": "Same maths. A completely different memory access pattern.",
            }),
        ],
    },
]


# ---------------------------------------------------------------------------
# EMIT
# ---------------------------------------------------------------------------

def js_value(value, key: str = "") -> str:
    """A JS expression for a nested prop value.

    Colour names are theme tokens, not CSS keywords: "amber" and "green" are
    not CSS colours, and "text" is not either. Emitting them raw produced
    invisible elements — a bit cell with no border. Every colour inside a
    nested structure has to come from the theme.
    """
    if key in ("color", "accent") and isinstance(value, str) and value in COLOR:
        return COLOR[value]
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, str):
        return json.dumps(value, ensure_ascii=False)
    if isinstance(value, list):
        return "[" + ", ".join(js_value(v) for v in value) + "]"
    if isinstance(value, dict):
        return (
            "{"
            + ", ".join(f"{k}: {js_value(v, k)}" for k, v in value.items())
            + "}"
        )
    if value is None:
        return "null"
    raise TypeError(f"unsupported prop: {value!r}")


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
        return "{" + js_value(value) + "}"
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


# --- Root.tsx ---------------------------------------------------------------
#
# The registry has to agree with the compositions, and tools/audit.py fails the
# build when it does not. Hand-editing Root.tsx for every new short is exactly
# the drift the audit exists to catch, so the generator owns the two blocks and
# rewrites them from the table.

IMPORT_BEGIN = "/* BEGIN GENERATED SHORT IMPORTS */"
IMPORT_END = "/* END GENERATED SHORT IMPORTS */"
COMPOSITION_BEGIN = "{/* BEGIN GENERATED SHORT COMPOSITIONS */}"
COMPOSITION_END = "{/* END GENERATED SHORT COMPOSITIONS */}"


def const_name(name: str) -> str:
    out = []
    for i, ch in enumerate(name):
        if ch.isupper() and i:
            out.append("_")
        out.append(ch.upper())
    return "_".join(out)


def replace_block(text: str, begin: str, end: str, body: str) -> str:
    start = text.index(begin) + len(begin)
    stop = text.index(end)
    return text[:start] + "\n" + body + text[stop:]


def update_root(shorts: list) -> None:
    path = os.path.join(ROOT, "src", "Root.tsx")
    with open(path, encoding="utf-8") as handle:
        text = handle.read()

    imports = []
    for short in shorts:
        imports.append(
            f'import {{\n  {short["name"]},\n  DURATION as {const_name(short["name"])}_DURATION,\n'
            f'}} from "./shorts/{short["slug"]}/{short["name"]}";'
        )
    text = replace_block(text, IMPORT_BEGIN, IMPORT_END, "\n".join(imports))

    compositions = []
    for short in shorts:
        compositions.append(
            f'      <Composition\n'
            f'        id="{short["name"]}"\n'
            f'        component={{{short["name"]}}}\n'
            f'        durationInFrames={{{const_name(short["name"])}_DURATION}}\n'
            f'        fps={{30}}\n'
            f'        width={{1080}}\n'
            f'        height={{1920}}\n'
            f'      />'
        )
    text = replace_block(text, COMPOSITION_BEGIN, COMPOSITION_END, "\n".join(compositions))

    with open(path, "w", encoding="utf-8") as handle:
        handle.write(text)


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

    # Root.tsx always carries ALL of the weekly shorts, not just the ones this
    # run generated, so a partial run cannot unregister the others.
    update_root([s for s in SHORTS if s["slug"] in registry])

    print(f"\nwrote {len(shorts)} short(s) + registry entries + Root.tsx")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
