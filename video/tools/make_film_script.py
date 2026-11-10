"""Write the LittleBit film's narration and its placeholder timings.

Both files come from ONE list, so the committed timings can never drift from
the narration. CI regenerates timings.json from the measured audio before it
bundles; the committed copy exists only so the first build can resolve the
import.

Usage: python tools/make_film_script.py
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src", "littlebit", "film")

FPS = 30
VOICE = "af_heart"
SPEED = 0.95

# (act, id, text) — the spine of the film. Claims are labelled in the copy
# itself where the number needs it: "potential", "the paper claims", and the
# 26 GB figure is ours (13B x 16 bits), which the film says out loud.
SCRIPT = [
    # ---------------- ACT 1 — THE WALL ----------------
    (1, "s01", "Here is a thirteen-billion-parameter model. It is the kind of thing that runs on a rack of GPUs in a data centre."),
    (1, "s02", "And here is what it weighs: twenty-six gigabytes of memory, just to hold the numbers."),
    (1, "s03", "Your phone has eight gigabytes. So this is a problem."),
    (1, "s04", "The first answer everyone reaches for is quantization: store the same numbers, more cheaply."),
    (1, "s05", "Sixteen bits becomes eight. Eight becomes four. Four becomes two. Every halving is a free lunch."),
    (1, "s06", "And then the ladder hits one bit. A weight is a yes, or a no. That is the floor people fight over."),
    (1, "s07", "So what happens if you try to go below one bit? Because below one bit, there is no yes, and there is no no."),

    # ---------------- ACT 2 — DELETE THE NUMBERS ----------------
    (2, "s08", "Samsung's LittleBit starts by refusing the premise."),
    (2, "s09", "It does not store smaller numbers. It does not round them down. It deletes them."),
    (2, "s10", "A model's weights are matrices. Take one: four thousand rows by four thousand columns."),
    (2, "s11", "That matrix is enormously redundant. It is not four thousand independent directions. It is a few."),
    (2, "s12", "So factor it. The big matrix becomes A times B. A is tall and thin, B is short and wide, and the rank is small."),
    (2, "s13", "Now the trick: binarize both factors. Every single entry in A, and every entry in B, becomes plus one, or minus one."),
    (2, "s14", "Not small numbers. No decimals. No rounding. A sign."),
    (2, "s15", "The original matrix was never stored. At run time you multiply A by B, and rebuild it."),
    (2, "s16", "Which means the information was never in the weights to begin with. It was in the relationship between two sign matrices."),

    # ---------------- ACT 3 — COUNTING DIFFERENTLY ----------------
    (3, "s17", "So how do you get to a tenth of a bit per weight? You count differently."),
    (3, "s18", "You are not storing sixteen bits per weight. You are storing two sign matrices, and asking what that costs per weight."),
    (3, "s19", "For a thirteen-billion-parameter model at a small rank, the answer is about zero point one bits per weight."),
    (3, "s20", "That number is an accounting measure. It is not a physical cell holding a tenth of a bit."),
    (3, "s21", "Nothing in hardware stores a tenth of a bit. It is a way of counting what the model costs."),
    (3, "s22", "Hold on to this: the model is not smaller because the numbers got smaller. It is smaller because most of the model was never numbers at all."),

    # ---------------- ACT 4 — WHAT DELETING COSTS ----------------
    (4, "s23", "Deleting the numbers has to cost something. It does."),
    (4, "s24", "A sign throws away magnitude. A weight of plus zero point zero zero one, and a weight of plus ten, become the same plus one."),
    (4, "s25", "Real weight matrices are not random noise. Their singular values fall off fast. A few directions carry most of the energy."),
    (4, "s26", "This is the intuition from LittleBit two: for a spectrum like that, a low-rank binary approximation can beat a tiny-rank float one."),
    (4, "s27", "So the question is not how much you keep. It is which directions you keep."),
    (4, "s28", "So LittleBit adds a compensation term that learns the error across rows, across columns, and across the latent dimension."),
    (4, "s29", "That is the part that recovers what the signs threw away."),

    # ---------------- ACT 5 — THE GEOMETRY PROBLEM ----------------
    (5, "s30", "Even so, something was still wrong. And the reason was geometric."),
    (5, "s31", "To multiply two matrices cheaply, you need their directions. The singular vectors of the latent space."),
    (5, "s32", "And those vectors are spiky. Almost all of their energy sits in a few coordinates."),
    (5, "s33", "Here is why that is the worst possible shape. A sign can only be plus one or minus one."),
    (5, "s34", "And a spiky vector has almost all of its mass in a handful of coordinates. Quantize that, and those coordinates saturate."),
    (5, "s35", "You gain nothing by being accurate where the vector barely points, and you lose everything by being wrong where it strongly points."),
    (5, "s36", "LittleBit two calls it latent geometry misalignment. And it is a real bug, not a tuning problem."),
    (5, "s37", "The fix is to rotate the latent space first, so the distribution is flat, and only then quantize it."),
    (5, "s38", "They call it internal latent rotation, and they interleave it with the quantization itself."),
    (5, "s39", "And the crucial part: the rotation folds into the factors. It costs nothing at inference time."),

    # ---------------- ACT 6 — THE NUMBERS ----------------
    (6, "s40", "So what does it buy? Memory: about thirty-one times less than full precision."),
    (6, "s41", "Size: Llama two, thirteen billion parameters, in under zero point nine gigabytes."),
    (6, "s42", "Quality: it matches the fidelity of leading one-bit baselines. At a tenth of their bits."),
    (6, "s43", "Speed: the paper claims a potential eleven point six times inference speedup against sixteen-bit."),
    (6, "s44", "Potential is the load-bearing word. There is no hardware that multiplies one-bit matrices that fast yet."),
    (6, "s45", "And one number in this film is ours, not the paper's: twenty-six gigabytes down to zero point nine is a twenty-nine times drop in the model itself."),
    (6, "s46", "That is just thirteen billion parameters, times sixteen bits."),

    # ---------------- ACT 7 — WHAT IT ACTUALLY MEANS ----------------
    (7, "s47", "None of this is on your phone yet. And it would be dishonest to pretend otherwise."),
    (7, "s48", "There are no sub-one-bit multiply kernels. The storage format does not exist. The bandwidth saving is theoretical until hardware catches up."),
    (7, "s49", "What exists is a direction, and a result strong enough that people are now building toward it."),
    (7, "s50", "There is a parallel road here. BitNet went the other way, to ternary weights: plus one, minus one, and zero."),
    (7, "s51", "Both are asking the same question. What is the smallest amount of information a language model actually needs?"),
    (7, "s52", "Because that number is the whole budget. A model you cannot fit is a model you cannot run."),
    (7, "s53", "And a model you can run on the device is the difference between a service, and a feature."),

    # ---------------- ACT 8 — THE LAYER BELOW ----------------
    (8, "s54", "So the layer below the layer. Not smaller numbers. Fewer numbers."),
    (8, "s55", "A thirteen-billion-parameter model, factored into two sign matrices, rebuilt on the fly, at a tenth of a bit per weight."),
    (8, "s56", "That is LittleBit, and LittleBit two. NeurIPS twenty twenty-five, and the follow-up this year."),
    (8, "s57", "We made a sixty-second version too, if you want the short version."),
    (8, "s58", "The layer below."),
]

# Rough speaking rate at speed 0.95 with this voice, measured on the
# LittleBit short: 172 words in 72.1 s, so about 2.39 words per second.
WORDS_PER_SECOND = 2.39
PAD_SECONDS = 0.4  # the pause after each line, the same as every other episode


def main() -> int:
    os.makedirs(OUT, exist_ok=True)

    lines = [{"id": sid, "text": text} for _, sid, text in SCRIPT]
    narration = {"voice": VOICE, "speed": SPEED, "lines": lines}
    with open(os.path.join(OUT, "narration.json"), "w", encoding="utf-8") as handle:
        json.dump(narration, handle, indent=2, ensure_ascii=False)
        handle.write("\n")

    scenes = {}
    total = 0
    for _, sid, text in SCRIPT:
        words = len(text.split())
        sec = round(words / WORDS_PER_SECOND + PAD_SECONDS, 1)
        frames = int(round(sec * FPS))
        scenes[sid] = {"sec": sec, "frames": frames, "text": text}
        total += frames

    timings = {
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
    with open(os.path.join(OUT, "timings.json"), "w", encoding="utf-8") as handle:
        json.dump(timings, handle, indent=2, ensure_ascii=False)
        handle.write("\n")

    words = sum(len(t.split()) for _, _, t in SCRIPT)
    print(f"scenes   : {len(SCRIPT)}")
    print(f"words    : {words}")
    print(f"est time : {total / FPS:.0f}s ({total / FPS / 60:.1f} min)")
    print(f"wrote    : {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
