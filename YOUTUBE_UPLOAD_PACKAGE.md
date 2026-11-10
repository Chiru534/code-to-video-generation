# YouTube upload package — 2026-11-10

Everything for one Short is in **one dated folder on Drive**. Open the folder,
download the MP4 and the thumbnail, upload. No hunting.

```
My Drive / blender_s1 / productions / shorts /
  2026-11-10_littlebit/
    littlebit.mp4                 the video (72.1 s, 1080x1920, 30 fps, -14.3 LUFS)
    littlebit-thumbnail.jpg       1280x720  <- upload this as the custom thumbnail
    littlebit-thumbnail-9x16.jpg  1080x1920  <- phone-shaped cover, optional
```

The date prefix is the date the video was **created**, not the date it was last
re-rendered. A re-render reuses the same folder and replaces the file in
place, so the link and the folder name never change.

---

## The short: LittleBit

| | |
|---|---|
| Title | **Samsung Stored an AI Weight in a Tenth of a Bit** |
| Duration | 72.1 s |
| Resolution | 1080 x 1920 (9:16, vertical Short) |
| Frame rate | 30 fps |
| Loudness | -14.3 LUFS integrated (broadcast target -14) |
| Audio | AAC 48 kHz stereo |
| Custom thumbnail | `littlebit-thumbnail.jpg` (1280x720, 25 KB) |
| Category | Science & Technology |
| Visibility | Public |
| Playlist | none yet |

### Description

```
Samsung's LittleBit compresses a 13-billion-parameter model to 0.1 bits per
weight — under 0.9 GB for Llama-2-13B — and it still works.

It is not smaller numbers. The weight matrix is factorised into two thin
matrices of nothing but +1 and -1, and the original is rebuilt on the fly.
The information is shared, not stored. A multi-scale compensation mechanism
recovers what the signs throw away.

Paper: "LittleBit: Ultra Low-Bit Quantization via Latent Factorization"
(NeurIPS 2025) — https://arxiv.org/abs/2506.13771
Follow-up: "LittleBit-2" (2026) — https://arxiv.org/abs/2603.00042

Every frame in this video is rendered from code. No AI video models were used
to make it.

#quantization #llm #machinelearning #artificialintelligence #computerscience
```

### Tags

```
quantization, llm, machine learning, ai, sub-1-bit, model compression,
littlebit, samsung, inference speedup, memory, neural networks, llama,
artificial intelligence, how ai works, deep learning
```

### Title alternatives (pick one)

1. Samsung Stored an AI Weight in a Tenth of a Bit
2. 26 GB of AI, Squeezed Into 900 MB
3. 0.1 Bits Per Weight, And It Still Works
4. The Layer Below: How AI Got Under One Bit

Option 1 is the current title in `video/episodes.json` and is what the
thumbnail art matches. Option 3 is the most concrete.

---

## Claim discipline — read before you edit the description

These are the numbers on screen and what each one actually is. Keep them
honest in anything you write around the video.

| On screen | What it is | How to phrase it |
|---|---|---|
| 26 GB -> 0.9 GB | 26 GB is **our arithmetic**: 13B params x 16 bits (FP16). 0.9 GB is the paper's figure. | "13B params at FP16 is ~26 GB; the paper reports under 0.9 GB" |
| 31x less memory | Paper figure (approx. 31x memory reduction at 0.1 BPW). | "about 31x less memory" |
| 11.6x | **Potential** inference speedup vs FP16. A paper estimate, not a measured app. The video labels it `POTENTIAL · PAPER ESTIMATE`. | "a potential 11.6x inference speedup, per the paper" — never "11.6x faster" flat |
| "matches one-bit baselines" | LittleBit-2 reports **matching** the fidelity of leading 1-bit baselines at 1/10 the bits. | "matches", "at a tenth of the bits" — **never "beats"** |
| 0.1 bits per weight | An **accounting measure** of bits per weight for a factorised, binarised representation. It is not a physical 0.1-bit cell. | "0.1 bits per weight, as a measure of storage cost" |

Also:

- Do **not** mention, link to, or tease any longer or full-length video. This
  Short stands alone.
- Do not call it a "0.1-bit chip" or "0.1-bit memory". The number is bits per
  weight after factorisation.
- The first ~8 seconds carry the whole video: 26 GB -> 900 MB, then "0.1 bits
  per weight". If YouTube Shorts needs a strong opening, that is where it is.

---

## The rest of the channel

The long-form and older Shorts now live in dated folders too, the same way:

```
My Drive / blender_s1 / productions /        <- long videos
My Drive / blender_s1 / productions / shorts/ <- Shorts
```

Each video has its own `<date>_<slug>/` folder containing the MP4 and its
thumbnail. Sort by date, open the folder, upload. Files that were already on
Drive before this layout were moved into their dated folder **keeping their
link**, so every link you have shared still works.
