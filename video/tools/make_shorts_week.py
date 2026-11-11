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
        "duration": 80.5,
        "captions": 41,
        "claim": 'A 7B model runs in 14 GB and trains in 112 GB. Here is every term of that bill.',
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
        "duration": 86.9,
        "captions": 43,
        "claim": 'What a floating-point number looks like in four bits, and the block scale that saves it.',
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
        "duration": 74.1,
        "captions": 39,
        "claim": 'Why a diffusion language model unmasks tokens out of order, and what that bet costs.',
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
        "duration": 72.7,
        "captions": 39,
        "claim": 'Why the key-value cache, not the model, is the number you pay for at long context.',
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
        "duration": 74.5,
        "captions": 39,
        "claim": 'Why activation checkpointing trades a third more compute for the memory it saves.',
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
        "duration": 72.3,
        "captions": 41,
        "claim": 'What group-query attention saves, and what the shared key smears.',
        "name": "GqaShort",
        "title": "Share the Keys, Keep the Queries",
        "publishDate": "2026-11-17",
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
        "duration": 71.3,
        "captions": 35,
        "claim": '236 billion parameters, 21 billion working. Why both numbers are true.',
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
        "claim": "Why FlashAttention is not a faster kernel but a different order of operations.",
        "duration": 82.1,
        "captions": 42,
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
            ("s12", "So the claim is that it makes attention faster. The reality is that it changes nothing about the mathematics. It only changes when the data moves."),
            ("s13", "The fastest kernels are the ones that touch memory least. It is not about attention. It is about not writing things down."),
        ],
        "scenes": [
            ("s01", "ShortCompare", {
                "kicker": "FLASHATTENTION",
                "left": {"value": "FAST", "label": "WHAT IT IS FAMOUS FOR", "color": "amber"},
                "right": {"value": "MEMORY", "label": "WHAT IT IS ACTUALLY ABOUT", "color": "cyan"},
                "line": "The least interesting thing about it.",
            }),
            ("s02", "ShortTitle", {
                "title": "It is not a faster kernel.",
                "sub": "IT IS A DIFFERENT ORDER OF OPERATIONS",
                "kicker": "THE ACTUAL POINT",
            }),
            ("s03", "ShortStack", {
                "kicker": "THE THREE STEPS",
                "rows": [
                    {"label": "STEP 1", "value": "Q \u00d7 K"},
                    {"label": "STEP 2", "value": "SOFTMAX", "color": "amber"},
                    {"label": "STEP 3", "value": "\u00d7 V"},
                ],
            }),
            ("s04", "ShortGrid", {
                "kicker": "THE SLOW PART",
                "rows": 6, "cols": 8, "cell": 78, "font": 13, "color": "amber",
                "label": "THE SCORE MATRIX",
            }),
            ("s05", "ShortFigure", {
                "value": "67M", "unit": "NUMBERS", "label": "IN THE SCORE MATRIX AT 8K TOKENS",
                "note": "PER HEAD", "color": "amber", "kicker": "THE SIZE",
            }),
            ("s06", "ShortStack", {
                "kicker": "THE ROUND TRIP",
                "rows": [
                    {"label": "COMPUTE THE BLOCK", "value": "FAST MEMORY"},
                    {"label": "WRITE IT TO VRAM", "value": "SLOW", "color": "red"},
                    {"label": "READ IT BACK", "value": "SLOW", "color": "red"},
                ],
            }),
            ("s07", "ShortTitle", {
                "title": "It never writes the matrix down.",
                "sub": "IT TILES IT",
                "kicker": "THE TRICK",
            }),
            ("s08", "ShortStack", {
                "kicker": "PER BLOCK",
                "rows": [
                    {"label": "ONE BLOCK", "value": "COMPUTE + SOFTMAX + ACCUMULATE", "color": "cyan",
                     "note": "ALL IN FAST MEMORY"},
                    {"label": "THEN", "value": "THROW IT AWAY", "color": "amber"},
                ],
            }),
            ("s09", "ShortFigure", {
                "value": "0", "unit": "BYTES", "label": "OF SCORE MATRIX STORED",
                "color": "green", "kicker": "THE RESULT",
            }),
            ("s10", "ShortCompare", {
                "kicker": "WHAT CHANGED",
                "left": {"value": "O(n\u00b2)", "label": "MEMORY TRAFFIC, BEFORE", "color": "red"},
                "right": {"value": "O(n)", "label": "MEMORY TRAFFIC, AFTER", "color": "green"},
                "line": "Quadratic becomes linear.",
            }),
            ("s11", "ShortCompare", {
                "kicker": "WHAT DID NOT",
                "left": {"value": "SAME", "label": "THE FLOPS", "color": "text"},
                "right": {"value": "SAME", "label": "THE ANSWER", "color": "text"},
                "line": "Exactly the same mathematics.",
            }),
            ("s12", "ShortCaveat", {
                "kicker": "THE HONEST VERSION",
                "claim": "FlashAttention makes attention faster.",
                "reality": "It does not change the mathematics at all. It changes when the data moves.",
            }),
            ("s13", "ShortEnd", {
                "title": "The fastest kernels are the ones that touch memory least.",
                "sub": "It is not about attention. It is about not writing things down.",
            }),
        ],
    },
    {
        "slug": "tokenizer-tax",
        "duration": 66.8,
        "captions": 32,
        "claim": 'Why the same sentence costs a different number of tokens in a different language.',
        "name": "TokenizerTaxShort",
        "title": "The Same Sentence Costs Different",
        "publishDate": "2026-11-16",
        "thumbSeconds": 2.0,
        "lines": [
            ("s01", "Before a model can read your sentence, something has to chop it into pieces."),
            ("s02", "Those pieces are tokens, and they come from a tokenizer."),
            ("s03", "The tokenizer is trained on a specific corpus, so it learns what is common in that corpus."),
            ("s04", "Common things become one token. Rare things get chopped into several."),
            ("s05", "English text is well represented, because most tokenizer training data is English."),
            ("s06", "Other languages are not. The same meaning costs more tokens."),
            ("s07", "And that is not a rounding detail. Tokens are what you are billed for."),
            ("s08", "Same answer, more tokens, higher price."),
            ("s09", "You can see it directly. Take one sentence and translate it."),
            ("s10", "English takes a certain number of tokens. Another language takes more. A different script takes far more."),
            ("s11", "Which is a tax on every language that was not in the training corpus."),
            ("s12", "There are fixes. Train the tokenizer on more languages, or drop the tokenizer altogether."),
            ("s13", "Until someone does, the token count is not a measurement of the text. It is a measurement of the tokenizer."),
        ],
        "scenes": [
            ("s01", "ShortTokens", {
                "kicker": "BEFORE ANYTHING ELSE",
                "tokens": ["the", "cat", "sat", "on", "the", "mat", "?", "?"],
                "filled": 6,
                "label": "ONE SENTENCE, CHOPPED",
                "sub": "Pieces, not words.",
            }),
            ("s02", "ShortStack", {
                "kicker": "THE FIRST STEP",
                "rows": [
                    {"label": "TEXT", "value": "A SENTENCE"},
                    {"label": "TOKENS", "value": "THE PIECES", "color": "cyan"},
                ],
            }),
            ("s03", "ShortTitle", {
                "title": "Common things become one token.",
                "sub": "THE TOKENIZER LEARNS FROM A CORPUS",
                "kicker": "HOW IT DECIDES",
            }),
            ("s04", "ShortTokens", {
                "kicker": "THE RULE",
                "tokens": ["cat", "sat", "on", "mat", "×", "×", "×", "×"],
                "filled": 4,
                "label": "COMMON → ONE TOKEN",
                "sub": "Rare things get chopped into several.",
            }),
            ("s05", "ShortCompare", {
                "kicker": "THE CORPUS DECIDES",
                "left": {"value": "ENGLISH", "label": "MOST OF THE TRAINING DATA", "color": "cyan"},
                "right": {"value": "OTHERS", "label": "MUCH LESS OF IT", "color": "amber"},
                "line": "The corpus decides the token count.",
            }),
            ("s06", "ShortFigure", {
                "value": "MORE", "unit": "TOKENS", "label": "FOR THE SAME SENTENCE",
                "note": "THE DIRECTION IS UNIVERSAL", "color": "amber", "kicker": "THE TAX",
            }),
            ("s07", "ShortStack", {
                "kicker": "WHY IT MATTERS",
                "rows": [
                    {"label": "THE ANSWER", "value": "THE SAME"},
                    {"label": "THE TOKENS", "value": "WHAT YOU PAY FOR", "color": "cyan"},
                ],
            }),
            ("s08", "ShortTitle", {
                "title": "Same answer. More tokens. Higher price.",
                "sub": "THE BILL DOES NOT READ THE MEANING",
                "kicker": "THE CONSEQUENCE",
            }),
            ("s09", "ShortTokens", {
                "kicker": "TRY IT",
                "tokens": ["the", "cat", "sat", "on", "the", "mat", "?", "?"],
                "filled": 6,
                "label": "TRANSLATE IT AND COUNT AGAIN",
                "sub": "Same sentence. Different number.",
            }),
            ("s10", "ShortCompare", {
                "kicker": "THE SAME IDEA",
                "left": {"value": "EN", "label": "FEWER TOKENS", "color": "cyan"},
                "right": {"value": "OTHER", "label": "MORE TOKENS", "color": "amber",
                          "note": "EXACT RATIO DEPENDS ON THE TOKENIZER"},
                "line": "Same meaning, different bill.",
            }),
            ("s11", "ShortTitle", {
                "title": "A tax on the languages that were not in the corpus.",
                "sub": "AND NOT ON YOUR FAULT",
                "kicker": "THE INEQUITY",
            }),
            ("s12", "ShortStack", {
                "kicker": "THE FIXES",
                "rows": [
                    {"label": "FIX ONE", "value": "TRAIN ON MORE LANGUAGES"},
                    {"label": "FIX TWO", "value": "DROP THE TOKENIZER", "color": "cyan"},
                ],
            }),
            ("s13", "ShortEnd", {
                "title": "The token count measures the tokenizer.",
                "sub": "Not the text.",
            }),
        ],
    },
    {
        "slug": "speculative-acceptance",
        "duration": 69.3,
        "captions": 42,
        "claim": 'Why the speedup of speculative decoding is an acceptance rate, not a model size.',
        "name": "SpeculativeAcceptanceShort",
        "title": "The Speedup Is an Acceptance Rate",
        "publishDate": "2026-11-16",
        "thumbSeconds": 2.0,
        "lines": [
            ("s01", "Speculative decoding is the trick for making a model write faster without changing it."),
            ("s02", "A small draft model proposes a batch of tokens. The big model checks them all in one pass."),
            ("s03", "If the draft was right, you take the tokens. If it was wrong, you take the first one and start again."),
            ("s04", "So the speedup is not the size of the draft model. It is how often the draft is right."),
            ("s05", "Call that the acceptance rate."),
            ("s06", "At full acceptance you get the maximum speedup, which is the batch size you used."),
            ("s07", "At zero acceptance you get nothing, and you have paid for the draft model on every token."),
            ("s08", "Most real systems sit somewhere in between. Roughly sixty to eighty percent is typical."),
            ("s09", "Which is why a draft model that is barely better than the big one can still be useless."),
            ("s10", "It has to be close enough to guess right, and small enough to be cheap."),
            ("s11", "There is a second cost people forget. Every rejected token is wasted work for both models."),
            ("s12", "So a low acceptance rate does not just slow you down. It makes you do more work than the baseline."),
            ("s13", "The speedup is not the draft model. It is the agreement."),
        ],
        "scenes": [
            ("s01", "ShortTitle", {
                "title": "Write faster, without changing the model.",
                "sub": "SPECULATIVE DECODING",
                "kicker": "THE TRICK",
            }),
            ("s02", "ShortStack", {
                "kicker": "THE MECHANISM",
                "rows": [
                    {"label": "THE DRAFT MODEL", "value": "PROPOSES 5", "color": "cyan"},
                    {"label": "THE BIG MODEL", "value": "CHECKS ALL 5", "color": "amber"},
                ],
            }),
            ("s03", "ShortTokens", {
                "kicker": "THE DEAL",
                "tokens": ["the", "model", "is", "a", "?", "?"],
                "filled": 3, "focus": 3,
                "label": "TAKE THE MATCH · RESTART AFTER THE MISMATCH",
                "sub": "One pass, many tokens.",
            }),
            ("s04", "ShortTitle", {
                "title": "The speedup is not the size of the draft.",
                "sub": "IT IS HOW OFTEN THE DRAFT IS RIGHT",
                "kicker": "THE REAL NUMBER",
            }),
            ("s05", "ShortTitle", {
                "title": "The acceptance rate.",
                "sub": "HOW OFTEN THE DRAFT IS RIGHT",
                "kicker": "THE NAME",
            }),
            ("s06", "ShortFigure", {
                "value": "5", "unit": "×", "label": "AT FULL ACCEPTANCE — YOUR BATCH SIZE",
                "color": "green", "kicker": "THE CEILING",
            }),
            ("s07", "ShortFigure", {
                "value": "0", "unit": "×", "label": "AT ZERO ACCEPTANCE",
                "note": "AND YOU PAID FOR THE DRAFT ON EVERY TOKEN",
                "color": "red", "kicker": "THE FLOOR",
            }),
            ("s08", "ShortFigure", {
                "value": "60-80%", "unit": "", "label": "TYPICAL ACCEPTANCE RATE",
                "note": "DEPENDS ENTIRELY ON THE TASK", "color": "cyan", "kicker": "WHERE REAL SYSTEMS LAND",
            }),
            ("s09", "ShortStack", {
                "kicker": "WHY A WEAK DRAFT FAILS",
                "rows": [
                    {"label": "A GOOD DRAFT", "value": "NEAR THE TARGET", "color": "cyan"},
                    {"label": "A BAD DRAFT", "value": "BARELY BETTER", "color": "red"},
                    {"label": "THE RESULT", "value": "USELESS", "color": "amber"},
                ],
            }),
            ("s10", "ShortCompare", {
                "kicker": "THE DRAFT HAS TO BE BOTH",
                "left": {"value": "CLOSE", "label": "ENOUGH TO GUESS RIGHT", "color": "cyan"},
                "right": {"value": "CHEAP", "label": "SMALL ENOUGH TO BE FREE", "color": "cyan"},
                "line": "Neither one alone.",
            }),
            ("s11", "ShortStack", {
                "kicker": "THE SECOND COST",
                "rows": [
                    {"label": "EVERY REJECTED TOKEN", "value": "WASTED WORK", "color": "red"},
                    {"label": "FOR BOTH MODELS", "value": "DRAFT + TARGET", "color": "amber"},
                ],
            }),
            ("s12", "ShortCompare", {
                "kicker": "THE BAD CASE",
                "left": {"value": "SLOWER", "label": "THAN THE BASELINE", "color": "red"},
                "right": {"value": "MORE WORK", "label": "THAN THE BASELINE", "color": "red"},
                "line": "A bad acceptance rate is worse than nothing.",
            }),
            ("s13", "ShortEnd", {
                "title": "The speedup is not the draft model.",
                "sub": "It is the agreement.",
            }),
        ],
    },
    {
        "slug": "bf16",
        "duration": 91.2,
        "captions": 37,
        "claim": 'Why BF16 has the same sixteen bits as FP16 and a completely different number.',
        "name": "Bf16Short",
        "title": "Same Sixteen Bits, Different Split",
        "publishDate": "2026-11-14",
        "thumbSeconds": 2.0,
        "lines": [
            ("s01", "In 2020 NVIDIA noticed something. Deep learning did not need FP32's precision, but it did need FP32's range."),
            ("s02", "So they made a new sixteen-bit format that keeps the range and throws away the precision."),
            ("s03", "FP16 has five exponent bits and ten mantissa bits. BF16 has eight and seven."),
            ("s04", "Same sixteen bits. A completely different number."),
            ("s05", "The range is what a training run needs. Gradients get tiny. Activations get huge. Neither is a problem if the exponent can reach."),
            ("s06", "The precision is what inference likes. A weight at BF16 has fewer significant digits than one at FP16."),
            ("s07", "Which is why BF16 is the training format and FP16 is still the inference format."),
            ("s08", "And why both are everywhere: BF16 where the range matters, FP16 where the precision does."),
            ("s09", "The interesting part is what the throwaway bits buy. BF16 keeps the exponent identical to FP32."),
            ("s10", "Which means a BF16 number and an FP32 number have exactly the same exponent range."),
            ("s11", "You can convert between them by shifting bits. No rounding, no range check."),
            ("s12", "FP16 needs a clamp, because its exponent cannot represent FP32's biggest and smallest values."),
            ("s13", "The most useful number format is the one that is boring to convert."),
        ],
        "scenes": [
            ("s01", "ShortTitle", {
                "title": "It needed the range, not the precision.",
                "sub": "WHAT DEEP LEARNING ACTUALLY USES",
                "kicker": "WHY BF16 EXISTS",
            }),
            ("s02", "ShortBits", {
                "kicker": "BF16",
                "cells": [
                    {"text": "1", "color": "cyan", "width": 110},
                    {"text": "8", "color": "violet", "width": 150},
                    {"text": "7", "color": "amber", "width": 170},
                ],
                "label": "SIGN 1 · EXPONENT 8 · MANTISSA 7",
                "sub": "Sixteen bits.",
            }),
            ("s03", "ShortCompare", {
                "kicker": "SIXTEEN BITS EACH",
                "left": {"value": "FP16", "label": "5 EXPONENT · 10 MANTISSA", "color": "violet"},
                "right": {"value": "BF16", "label": "8 EXPONENT · 7 MANTISSA", "color": "cyan"},
                "line": "Same sixteen bits.",
            }),
            ("s04", "ShortTitle", {
                "title": "Same sixteen bits. A different number.",
                "sub": "A COMPLETELY DIFFERENT NUMBER",
                "kicker": "WHAT CHANGED",
            }),
            ("s05", "ShortStack", {
                "kicker": "WHY THE RANGE MATTERS",
                "rows": [
                    {"label": "GRADIENTS", "value": "GET TINY", "color": "amber"},
                    {"label": "ACTIVATIONS", "value": "GET HUGE", "color": "amber"},
                    {"label": "THE EXPONENT", "value": "HAS TO REACH", "color": "cyan"},
                ],
            }),
            ("s06", "ShortStack", {
                "kicker": "WHAT THE PRECISION COSTS",
                "rows": [
                    {"label": "FP16 MANTISSA", "value": "10 BITS", "color": "violet"},
                    {"label": "BF16 MANTISSA", "value": "7 BITS", "color": "cyan"},
                    {"label": "SIGNIFICANT DIGITS", "value": "FEWER", "color": "amber"},
                ],
            }),
            ("s07", "ShortCompare", {
                "kicker": "WHERE EACH ONE GOES",
                "left": {"value": "BF16", "label": "TRAINING", "color": "cyan"},
                "right": {"value": "FP16", "label": "INFERENCE", "color": "violet"},
                "line": "Range where you need range.",
            }),
            ("s08", "ShortTitle", {
                "title": "Which is why both are everywhere.",
                "sub": "EACH WHERE IT FITS",
                "kicker": "THE COEXISTENCE",
            }),
            ("s09", "ShortBits", {
                "kicker": "THE EXCHANGE",
                "cells": [
                    {"text": "1", "color": "cyan", "width": 110},
                    {"text": "8", "color": "violet", "width": 150},
                    {"text": "7", "color": "amber", "width": 170},
                    {"text": "= FP32", "color": "dim", "width": 220},
                ],
                "label": "THE EXPONENT IS IDENTICAL TO FP32",
                "sub": "Only the mantissa changed.",
            }),
            ("s10", "ShortCompare", {
                "kicker": "THE RANGE",
                "left": {"value": "BF16", "label": "SAME RANGE AS FP32", "color": "cyan"},
                "right": {"value": "FP16", "label": "NARROWER RANGE", "color": "amber"},
                "line": "Identical exponent, different precision.",
            }),
            ("s11", "ShortFigure", {
                "value": "0", "unit": "ROUNDING", "label": "BF16 TO FP32 IS A BIT SHIFT",
                "note": "EXACT · NO RANGE CHECK", "color": "green", "kicker": "THE CONVERSION",
            }),
            ("s12", "ShortFigure", {
                "value": "1", "unit": "CLAMP", "label": "FP32 TO FP16 CAN OVERFLOW",
                "note": "SO IT HAS TO CHECK THE RANGE", "color": "amber", "kicker": "THE OTHER DIRECTION",
            }),
            ("s13", "ShortEnd", {
                "title": "The best number format is the boring one.",
                "sub": "One you can convert without thinking.",
            }),
        ],
    },
    {
        "slug": "attention-sink",
        "duration": 68.8,
        "captions": 37,
        "claim": 'Why the first token of any sequence absorbs attention, and why it is load-bearing.',
        "name": "AttentionSinkShort",
        "title": "Why Models Dump Attention on the First Token",
        "publishDate": "2026-11-17",
        "thumbSeconds": 2.0,
        "lines": [
            ("s01", "Here is a strange fact about language models. The first token of any sequence absorbs a huge amount of attention."),
            ("s02", "Not the important token. Not the last one. The first."),
            ("s03", "And it is not about content. The first token gets the same treatment every time."),
            ("s04", "The explanation is that attention needs somewhere to dump probability mass."),
            ("s05", "Every head outputs a weighted average, and those weights have to sum to one."),
            ("s06", "Early on, before the model knows what it is looking at, some probability has to go somewhere."),
            ("s07", "So the model learns to use the first token as a sink. A place to put the leftover attention."),
            ("s08", "This is not a quirk. It is load-bearing."),
            ("s09", "StreamingLLM found that if you keep the first few tokens and slide the window, you can stream millions of tokens."),
            ("s10", "But if the sink disappears, the attention collapses. The model has nowhere to put the mass."),
            ("s11", "So the first tokens are not just history. They are the drain."),
            ("s12", "Which is a strange thing to depend on, and an easy thing for a retrained model to lose."),
            ("s13", "Keep the drain. Slide everything else."),
        ],
        "scenes": [
            ("s01", "ShortTokens", {
                "kicker": "THE STRANGE FACT",
                "tokens": ["The", "?", "?", "?", "?", "?", "?", "?"],
                "filled": 1, "focus": 0,
                "label": "THE FIRST TOKEN ABSORBS THE ATTENTION",
                "sub": "Every single sequence.",
            }),
            ("s02", "ShortTitle", {
                "title": "Not the important token. Not the last one.",
                "sub": "THE FIRST",
                "kicker": "NOT WHAT YOU WOULD EXPECT",
            }),
            ("s03", "ShortFigure", {
                "value": "SAME", "unit": "", "label": "TREATMENT, EVERY TIME",
                "note": "REGARDLESS OF CONTENT", "color": "amber", "kicker": "IT IS NOT ABOUT CONTENT",
            }),
            ("s04", "ShortTitle", {
                "title": "Attention needs somewhere to put the mass.",
                "sub": "THE DRAIN",
                "kicker": "WHY",
            }),
            ("s05", "ShortStack", {
                "kicker": "THE CONSTRAINT",
                "rows": [
                    {"label": "EVERY HEAD", "value": "A WEIGHTED AVERAGE", "color": "cyan"},
                    {"label": "THE WEIGHTS", "value": "MUST SUM TO ONE", "color": "amber"},
                ],
            }),
            ("s06", "ShortTitle", {
                "title": "Early on, some probability has to go somewhere.",
                "sub": "AND THE MODEL NEEDS A PLACE",
                "kicker": "THE PROBLEM",
            }),
            ("s07", "ShortCompare", {
                "kicker": "THE SOLUTION",
                "left": {"value": "1st", "label": "THE SINK TOKEN", "color": "cyan"},
                "right": {"value": "REST", "label": "THE CONTENT", "color": "dim"},
                "line": "The leftover attention goes to token one.",
            }),
            ("s08", "ShortTitle", {
                "title": "This is not a quirk.",
                "sub": "IT IS LOAD-BEARING",
                "kicker": "IT MATTERS",
            }),
            ("s09", "ShortStack", {
                "kicker": "STREAMINGLLM",
                "rows": [
                    {"label": "KEEP", "value": "THE FIRST 4 TOKENS", "color": "cyan", "note": "THE DRAIN"},
                    {"label": "SLIDE", "value": "THE WINDOW", "color": "violet"},
                    {"label": "STREAM", "value": "MILLIONS OF TOKENS", "color": "cyan"},
                ],
            }),
            ("s10", "ShortFigure", {
                "value": "0", "unit": "", "label": "IF THE SINK DISAPPEARS",
                "note": "THE ATTENTION COLLAPSES", "color": "red", "kicker": "THE DEPENDENCE",
            }),
            ("s11", "ShortTitle", {
                "title": "The first tokens are the drain.",
                "sub": "NOT JUST HISTORY",
                "kicker": "WHAT THEY ARE FOR",
            }),
            ("s12", "ShortCaveat", {
                "kicker": "THE HONEST VERSION",
                "claim": "It is always the first token.",
                "reality": "Retrain the model and the sink moves. It is a learned behaviour, not a fixed rule.",
            }),
            ("s13", "ShortEnd", {
                "title": "Keep the drain. Slide everything else.",
                "sub": "Four tokens do all the work.",
            }),
        ],
    },
    {
        "slug": "quant-aware-training",
        "duration": 68.4,
        "captions": 36,
        "claim": 'Why quantizing after training is not the same as training quantized.',
        "name": "QuantAwareTrainingShort",
        "title": "Train It Quantized or Post-Train It",
        "publishDate": "2026-11-18",
        "thumbSeconds": 2.0,
        "lines": [
            ("s01", "Quantization can be done after training, by rounding the weights of a finished model."),
            ("s02", "Or it can be done during training, by rounding the weights on every step."),
            ("s03", "The second one is slower to set up and much better in the result."),
            ("s04", "Here is why. A trained model has never seen a rounded weight."),
            ("s05", "The weights sit in a narrow band where the network is sensitive. Round them, and you move them."),
            ("s06", "Move them far enough and the next layer gets a different input than it was trained for."),
            ("s07", "One layer's rounding error becomes the next layer's noise, and it compounds."),
            ("s08", "Training with quantization in the loop teaches the model to work with rounded weights."),
            ("s09", "It learns to put its important information in the places where rounding does the least damage."),
            ("s10", "So the gap between the two is not a small margin. It is the difference between working and not."),
            ("s11", "Which is also why the honest version of a quantization claim has to say which one was used."),
            ("s12", "A number from a post-training model and a number from a quantization-aware one are not the same number."),
            ("s13", "Ask how the model was trained before you believe the size."),
        ],
        "scenes": [
            ("s01", "ShortStack", {
                "kicker": "TWO WAYS",
                "rows": [
                    {"label": "POST-TRAINING", "value": "ROUND AT THE END", "color": "violet"},
                    {"label": "QUANTIZATION-AWARE", "value": "ROUND EVERY STEP", "color": "cyan"},
                ],
            }),
            ("s02", "ShortTitle", {
                "title": "Train it quantized, or post-train it quantized.",
                "sub": "TWO DIFFERENT RESULTS",
                "kicker": "THE CHOICE",
            }),
            ("s03", "ShortCompare", {
                "kicker": "THE BARGAIN",
                "left": {"value": "SLOWER", "label": "TO SET UP", "color": "amber"},
                "right": {"value": "BETTER", "label": "WHAT YOU GET", "color": "cyan"},
                "line": "The second one wins.",
            }),
            ("s04", "ShortTitle", {
                "title": "A trained model has never seen a rounded weight.",
                "sub": "THAT IS THE WHOLE PROBLEM",
                "kicker": "WHY",
            }),
            ("s05", "ShortStack", {
                "kicker": "THE SENSITIVITY",
                "rows": [
                    {"label": "THE WEIGHTS", "value": "SIT NARROW", "color": "amber"},
                    {"label": "THE NETWORK", "value": "IS SENSITIVE THERE", "color": "amber"},
                ],
            }),
            ("s06", "ShortStack", {
                "kicker": "THE CASCADE",
                "rows": [
                    {"label": "ROUND ONE LAYER", "value": "ITS OUTPUT CHANGES", "color": "amber"},
                    {"label": "THE NEXT LAYER", "value": "GETS A NEW INPUT", "color": "red"},
                ],
            }),
            ("s07", "ShortStack", {
                "kicker": "IT COMPOUNDS",
                "rows": [
                    {"label": "LAYER 1", "value": "ROUNDING ERROR", "color": "amber"},
                    {"label": "LAYER 2", "value": "ADDS ITS OWN", "color": "amber"},
                    {"label": "LAYER 30", "value": "COMPOUNDED", "color": "red"},
                ],
            }),
            ("s08", "ShortTitle", {
                "title": "Training with rounding in the loop teaches the model to cope.",
                "sub": "AND TO PUT ITS INFORMATION SOMEWHERE SAFE",
                "kicker": "THE FIX",
            }),
            ("s09", "ShortStack", {
                "kicker": "WHAT IT LEARNS",
                "rows": [
                    {"label": "INSENSITIVE WEIGHTS", "value": "TAKE THE ROUNDING", "color": "cyan"},
                    {"label": "IMPORTANT INFORMATION", "value": "IN THE SAFE PLACES", "color": "cyan"},
                ],
            }),
            ("s10", "ShortCompare", {
                "kicker": "THE GAP",
                "left": {"value": "NARROW", "label": "WHAT POST-TRAINING GETS", "color": "amber"},
                "right": {"value": "WORKS", "label": "WHAT QAT GETS", "color": "cyan"},
                "line": "Not a small margin.",
            }),
            ("s11", "ShortTitle", {
                "title": "A quantization claim has to say which one was used.",
                "sub": "BOTH ARE CALLED QUANTIZATION",
                "kicker": "THE HONEST VERSION",
            }),
            ("s12", "ShortCaveat", {
                "kicker": "THE CAVEAT",
                "claim": "The model is 4-bit.",
                "reality": "Without saying whether it was trained that way, the number does not mean much.",
            }),
            ("s13", "ShortEnd", {
                "title": "Ask how the model was trained.",
                "sub": "Before you believe the size.",
            }),
        ],
    },
    {
        "slug": "moe-router",
        "duration": 71.1,
        "captions": 41,
        "claim": 'Why the router of a mixture of experts is punished for being good at routing.',
        "name": "MoeRouterShort",
        "title": "The Router Is Trained Against Itself",
        "publishDate": "2026-11-18",
        "thumbSeconds": 2.0,
        "lines": [
            ("s01", "In a mixture of experts, a router decides which experts handle a token."),
            ("s02", "It is a small network, trained to send tokens to the experts that handle them best."),
            ("s03", "Which is the whole problem. If every token goes to the best-fitting expert, one expert wins."),
            ("s04", "It gets all the training signal. The others get nothing, and they go stale."),
            ("s05", "So the router is given a second objective: send a balanced share of tokens everywhere."),
            ("s06", "That is the load-balancing loss, added to the training loss."),
            ("s07", "It is a hack in the truest sense. The router is told to do something other than the thing it was built for."),
            ("s08", "And the tension is real. Fit the tokens perfectly and the experts go stale. Balance them perfectly and the routing goes bad."),
            ("s09", "So every router sits somewhere on that trade-off."),
            ("s10", "Push too hard and the router starts sending tokens to worse experts, to satisfy the balance."),
            ("s11", "Push too little and you are back to one popular expert doing all the work."),
            ("s12", "The coefficient on that loss is the knob. One number trades quality against capacity."),
            ("s13", "The router is trained to be good at routing, and punished for being good at it."),
        ],
        "scenes": [
            ("s01", "ShortTitle", {
                "title": "A small network picks the experts.",
                "sub": "THE ROUTER",
                "kicker": "MIXTURE OF EXPERTS",
            }),
            ("s02", "ShortStack", {
                "kicker": "THE ROUTER",
                "rows": [
                    {"label": "THE ROUTER", "value": "A SMALL NETWORK", "color": "cyan"},
                    {"label": "ITS JOB", "value": "PICK THE EXPERTS", "color": "cyan"},
                ],
            }),
            ("s03", "ShortStack", {
                "kicker": "THE PROBLEM",
                "rows": [
                    {"label": "EVERY TOKEN", "value": "GOES TO THE BEST EXPERT", "color": "cyan"},
                    {"label": "ONE EXPERT", "value": "GETS ALL THE SIGNAL", "color": "amber"},
                ],
            }),
            ("s04", "ShortStack", {
                "kicker": "EXPERT COLLAPSE",
                "rows": [
                    {"label": "THE WINNER", "value": "TRAINED, ALWAYS", "color": "amber"},
                    {"label": "THE OTHERS", "value": "GO STALE", "color": "red"},
                ],
            }),
            ("s05", "ShortTitle", {
                "title": "So the router gets a second job.",
                "sub": "SEND A BALANCED SHARE EVERYWHERE",
                "kicker": "THE FIX",
            }),
            ("s06", "ShortCompare", {
                "kicker": "TWO OBJECTIVES",
                "left": {"value": "ROUTING", "label": "WHAT IT WANTS", "color": "cyan"},
                "right": {"value": "BALANCE", "label": "WHAT IT IS TOLD", "color": "amber"},
                "line": "One router, two losses.",
            }),
            ("s07", "ShortTitle", {
                "title": "It is a hack in the truest sense.",
                "sub": "TOLD TO DO SOMETHING ELSE ENTIRELY",
                "kicker": "THE TRADE",
            }),
            ("s08", "ShortCompare", {
                "kicker": "THE TENSION",
                "left": {"value": "FIT", "label": "THE EXPERTS GO STALE", "color": "red"},
                "right": {"value": "BALANCE", "label": "THE ROUTING GOES BAD", "color": "amber"},
                "line": "You cannot win both.",
            }),
            ("s09", "ShortTitle", {
                "title": "Every router sits on that trade-off.",
                "sub": "BALANCE VERSUS FIT",
                "kicker": "WHERE THEY LAND",
            }),
            ("s10", "ShortStack", {
                "kicker": "THE KNOB",
                "rows": [
                    {"label": "PUSH HARD", "value": "ROUTES TO WORSE EXPERTS", "color": "red"},
                    {"label": "PUSH LITTLE", "value": "ONE EXPERT WINS", "color": "amber"},
                ],
            }),
            ("s11", "ShortStack", {
                "kicker": "THE OTHER END",
                "rows": [
                    {"label": "PUSH LITTLE", "value": "ONE EXPERT DOES EVERYTHING", "color": "amber"},
                    {"label": "AND THEN", "value": "CAPACITY IS WASTED", "color": "red"},
                ],
            }),
            ("s12", "ShortCompare", {
                "kicker": "THE COEFFICIENT",
                "left": {"value": "QUALITY", "label": "WHAT YOU TRADE AWAY", "color": "amber"},
                "right": {"value": "CAPACITY", "label": "WHAT YOU PROTECT", "color": "cyan"},
                "line": "One number, two currencies.",
            }),
            ("s13", "ShortEnd", {
                "title": "The router is trained to be good at routing.",
                "sub": "And punished for being good at it.",
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


# ---------------------------------------------------------------------------
# THE UPLOAD TABLE
#
# What you paste into YouTube Studio. Kept here, beside the scripts, so the
# copy and the video cannot drift apart — the same reason the narration and
# the timings come from one list.
#
# The description is deliberately the first three lines: those are the only
# ones most viewers read before the fold, so the hook has to be in them.
# ---------------------------------------------------------------------------

UPLOAD = {
    "training-memory": {
        "description": (
            "A 7B model runs on a laptop in 14 GB. Training the same model needs 112.\n"
            "\n"
            "That gap is arithmetic, and every term in it is a decision somebody made: "
            "the weights, the gradients, and two copies of the model held as optimizer "
            "state. Then activations, which scale with your batch rather than with your model.\n"
            "\n"
            "The numbers on screen are our arithmetic, and the assumptions are on the "
            "frame with them.\n"
            "\n"
            "Every frame is rendered from code. No AI video models were used."
        ),
        "tags": ["llm", "machinelearning", "training", "gpucomputing", "deeplearning",
                 "transformers", "ai"],
    },
    "fp4-format": {
        "description": (
            "A floating-point number is three parts: a sign, an exponent, and a mantissa. "
            "FP32 spends 32 bits on it. FP8 splits the difference two ways. FP4 gets down "
            "to four bits: one sign, two exponent, one mantissa.\n"
            "\n"
            "One mantissa bit is not enough on its own. The block scale is what saves the "
            "numbers, and it changes for every group of values.\n"
            "\n"
            "Every frame is rendered from code. No AI video models were used."
        ),
        "tags": ["quantization", "fp8", "fp4", "machinelearning", "lowprecision", "llm",
                 "deeplearning"],
    },
    "diffusion-llm": {
        "description": (
            "Every language model you have used writes left to right, one token at a time. "
            "A diffusion model does not generate — it denoises, unmasking the slots it is "
            "confident about, in any order.\n"
            "\n"
            "The speedup is real. The catch is that the tokens are not equally confident, "
            "and every slot you unmask early is one you cannot take back.\n"
            "\n"
            "Every frame is rendered from code. No AI video models were used."
        ),
        "tags": ["diffusion", "llm", "languagemodels", "machinelearning",
                 "artificialintelligence", "transformers"],
    },
    "kv-cache": {
        "description": (
            "14 GB of weights. 50 GB of cache at 100k tokens. The cache is the bigger "
            "number, and it is the thing you actually pay for.\n"
            "\n"
            "The key-value cache stores a key and a value per layer, per head, per token. "
            "Compress it, evict it, quantise it, or share the heads — every fix is a "
            "trade, and none of them is free.\n"
            "\n"
            "Every frame is rendered from code. No AI video models were used."
        ),
        "tags": ["llm", "kv-cache", "inference", "contextwindow", "machinelearning",
                 "deepseek"],
    },
    "activation-checkpointing": {
        "description": (
            "Activations are the only term in the training memory bill that scales with "
            "your batch size instead of your model size. So you trade memory for "
            "arithmetic: throw the activations away, recompute them in the backward pass.\n"
            "\n"
            "It costs about a third more work per step. You turn it on when the run does "
            "not fit, not for its own sake.\n"
            "\n"
            "Every frame is rendered from code. No AI video models were used."
        ),
        "tags": ["deeplearning", "training", "gpucomputing", "machinelearning", "pytorch",
                 "llm"],
    },
    "gqa": {
        "description": (
            "Attention stores a key and a value for every head. Group-query attention "
            "keeps every query separate but lets a group of heads share one stored key.\n"
            "\n"
            "The saving is real. The cost is too: a shared key has to be the average of "
            "what eight heads wanted, and average keys are duller keys.\n"
            "\n"
            "Every frame is rendered from code. No AI video models were used."
        ),
        "tags": ["attention", "transformers", "llm", "inference", "machinelearning",
                 "deepseek"],
    },
    "moe-active": {
        "description": (
            "DeepSeek-V2 has 236 billion parameters and activates 21 billion of them on "
            "any given token. Sparse compute, dense storage.\n"
            "\n"
            "The router has to be right, and the balance has to be kept, or one expert "
            "wins and the rest go stale. Both numbers are true, and you pay for both.\n"
            "\n"
            "Every frame is rendered from code. No AI video models were used."
        ),
        "tags": ["mixtureofexperts", "deepseek", "llm", "machinelearning", "transformers",
                 "deeplearning"],
    },
    "flash-attention": {
        "description": (
            "FlashAttention is famous for being fast, and that is the least interesting "
            "thing about it. It is not a faster kernel — it is a different order of "
            "operations.\n"
            "\n"
            "The score matrix is sequence length squared. FlashAttention never writes it "
            "down. Memory traffic goes from quadratic to linear, and the flops stay "
            "exactly the same.\n"
            "\n"
            "Every frame is rendered from code. No AI video models were used."
        ),
        "tags": ["flashattention", "cuda", "gpucomputing", "transformers", "machinelearning",
                 "llm"],
    },
    "tokenizer-tax": {
        "description": (
            "Before a model can read your sentence, something chops it into tokens — and "
            "the tokenizer was trained on a corpus, so it charges you for what that "
            "corpus missed.\n"
            "\n"
            "The same sentence costs a different number of tokens in a different "
            "language, and tokens are what you are billed for. The exact ratio depends "
            "on the tokenizer. The direction does not.\n"
            "\n"
            "Every frame is rendered from code. No AI video models were used."
        ),
        "tags": ["tokenizer", "llm", "nlp", "multilingual", "machinelearning", "ai"],
    },
    "speculative-acceptance": {
        "description": (
            "Speculative decoding makes a model write faster without changing it: a "
            "small draft model proposes tokens, the big model checks them in one pass.\n"
            "\n"
            "The speedup is not the size of the draft. It is the acceptance rate — how "
            "often the draft is right. At zero acceptance you are slower than the "
            "baseline and doing more work.\n"
            "\n"
            "Every frame is rendered from code. No AI video models were used."
        ),
        "tags": ["speculativedecoding", "llm", "inference", "vllm", "machinelearning",
                 "deeplearning"],
    },
    "bf16": {
        "description": (
            "BF16 has the same sixteen bits as FP16 and a completely different number: "
            "eight exponent bits and seven mantissa bits, against five and ten.\n"
            "\n"
            "It keeps FP32's range and throws away precision, which is exactly what deep "
            "learning needed. It also makes the conversion to FP32 a bit shift, with no "
            "rounding and no range check.\n"
            "\n"
            "Every frame is rendered from code. No AI video models were used."
        ),
        "tags": ["bfloat16", "fp16", "numericalstability", "deeplearning", "machinelearning",
                 "gpu"],
    },
    "attention-sink": {
        "description": (
            "The first token of any sequence absorbs a huge amount of attention, and it "
            "is not about content. It is a drain: attention has to put its probability "
            "mass somewhere, and the model learned to use token one as the sink.\n"
            "\n"
            "That is why StreamingLLM can keep four tokens and slide the window forever.\n"
            "\n"
            "Every frame is rendered from code. No AI video models were used."
        ),
        "tags": ["attention", "streamingllm", "kv-cache", "llm", "transformers",
                 "machinelearning"],
    },
    "quant-aware-training": {
        "description": (
            "Quantizing a model after training is not the same as training it quantized. "
            "A trained model has never seen a rounded weight, and the rounding error of "
            "one layer is the next layer's noise.\n"
            "\n"
            "The gap between the two is not a small margin. It is why a quantization "
            "claim has to say which one was used.\n"
            "\n"
            "Every frame is rendered from code. No AI video models were used."
        ),
        "tags": ["quantization", "quantizationawaretraining", "llm", "machinelearning",
                 "deeplearning", "posttrainingquantization"],
    },
    "moe-router": {
        "description": (
            "In a mixture of experts, the router is trained to send tokens to the "
            "experts that fit them best — and if every token goes to the best fit, one "
            "expert wins and the rest go stale.\n"
            "\n"
            "So the router gets a second loss that tells it to balance, which is a hack "
            "in the truest sense: it is punished for being good at the job it was built "
            "for.\n"
            "\n"
            "Every frame is rendered from code. No AI video models were used."
        ),
        "tags": ["mixtureofexperts", "routing", "deeplearning", "machinelearning",
                 "transformers", "deepseek"],
    },
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


def upload_sheet(shorts: list) -> None:
    """The sheet you paste from: one dated folder per short, with its copy."""
    by_date: dict[str, list] = {}
    for short in shorts:
        by_date.setdefault(short["publishDate"], []).append(short)

    out = [
        "# The week of shorts — upload sheet",
        "",
        "GENERATED by `video/tools/make_shorts_week.py`. Edit the table there.",
        "",
        "Two Shorts a day. Every short has its own dated folder in Drive, so the",
        "calendar is the folder list. Upload in date order.",
        "",
        "| # | date | folder | file | title | length |",
        "|---|------|-------|------|-------|--------|",
    ]
    n = 0
    for date in sorted(by_date):
        for short in by_date[date]:
            n += 1
            out.append(
                f"| {n} | {date} | `shorts/{date}_{short['slug']}/` | "
                f"`{short['slug']}.mp4` | {short['title']} | "
                f"{short.get('duration', 0):.1f}s |"
            )
    out.append("")
    out.append("Lengths are measured from the rendered files, not estimated.")
    out.append("Each folder also holds a matching `.srt` with exact captions.")
    out.append("")
    out.append("## The claim behind each one")
    out.append("")
    out.append("Each short makes exactly one claim. If two claims ever read the")
    out.append("same, they are the same video and one of them should go.")
    out.append("")
    for date in sorted(by_date):
        for short in by_date[date]:
            out.append(f"- **{short['title']}** — {short.get('claim', '')}")
    out.append("")
    out.append("Each folder holds the MP4 plus `*-thumbnail.jpg` (1280x720) and")
    out.append("`*-thumbnail-9x16.jpg` (1080x1920). The 16:9 one is the custom thumbnail;")
    out.append("the 9:16 one is the phone-shaped cover.")
    out.append("")

    for date in sorted(by_date):
        for short in by_date[date]:
            meta = UPLOAD.get(short["slug"], {})
            out.append("---")
            out.append("")
            out.append(f"## {date} — {short['title']}")
            out.append("")
            out.append(f"`shorts/{date}_{short['slug']}/{short['slug']}.mp4`")
            out.append("")
            out.append(f"    {short.get('duration', 0):.1f}s · {short.get('captions', 0)} captions · "
                       f"`{short['slug']}.srt`")
            out.append("")
            out.append("**Title**")
            out.append("")
            out.append(f"    {short['title']}")
            out.append("")
            out.append("**Description**")
            out.append("")
            for line in (meta.get("description") or "").split("\n"):
                out.append(f"    {line}" if line else "")
            out.append("")
            out.append("**Tags**")
            out.append("")
            out.append("    " + ", ".join(meta.get("tags") or []))
            out.append("")

    path = os.path.join(os.path.dirname(ROOT), "SHORTS_WEEK1.md")
    with open(path, "w", encoding="utf-8") as handle:
        handle.write("\n".join(out))


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
    upload_sheet([s for s in SHORTS if s["slug"] in registry])

    print(f"\nwrote {len(shorts)} short(s) + registry entries + Root.tsx + upload sheet")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
