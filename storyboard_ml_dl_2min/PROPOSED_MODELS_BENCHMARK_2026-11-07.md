# Proposed video model benchmark — 2026-11-07

## Executive result

The proposal targets a Kaggle TPU, but two Kaggle runs requesting `TpuV5E8` exposed only JAX CPU devices. The explicit probe also found no `torch_xla` and no `nvidia-smi`. Therefore the proposal's TPU models could not be run on the allocated Kaggle runtime, and no Kaggle-TPU speed is claimed here. See `tpu_v5e8_probe_report.json`.

## Measurements from this workspace

| Candidate/run | Runtime and settings | Measured time | Output / result |
|---|---|---:|---|
| LTX-Video 2B distilled, PyTorch compatibility attempt | Kaggle dual T4 allocated; one T4 used; 249 frames, 30 fps, 512x288 native then upscaled to 832x480 | 56.7 s inside the model pipeline; 274.0 s inference call including model load and write; 377.6 s whole Kaggle job | MP4 completed but frames were corrupted green noise. **Failed visual-quality gate; speed is not a usable result.** |
| Wan2.1 T2V 1.3B recovery sample | Kaggle dual T4 allocated; one T4 used; 49 frames, 16 fps, 832x480 (3.0625 s), 20 steps | 216.7 s model load; 589.8 s generation; 592.1 s generation plus video write; 810.8 s whole job | Playable, visibly moving clip; still too slow for the proposed 1–3 minute target. |

The LTX and Wan run reports are `ltx_distilled_benchmark_report.json` and `wan21_recovery_report.json`.

## Published vidax reference numbers (not Kaggle measurements)

The official vidax benchmark reports averages from five runs on **TPU v4-8**, JAX 0.11.0. Compile and warm generation are separate; these figures exclude model download/setup and final MP4 export. They are useful references, not predictions for Kaggle TPU v5e-8.

| Proposal candidate | TPU v4-8 benchmark shape | Compile | Warm generation (sampling + VAE decode) | Peak HBM/chip |
|---|---|---:|---:|---:|
| LTX-Video 2B distilled | 1216x704, 121 frames, 8 steps, TP=4 | 83.5 s | 47.3 s | 8.8 GB |
| LTX-Video 13B distilled / vidax | 1216x704, 121 frames, 8 steps, TP=4 | 136.4 s | 104.2 s | 15.3 GB |
| LTX-2.5 22B distilled, convolutional VAE / vidax | 1216x704, 121 frames, 8 steps, TP=4, weight offload chunk 8 | 87.9 s | 37.3 s | 15.3 GB |
| Wan2.1 1.3B / vidax reference | 832x480, 81 frames, 50 steps, TP=4, SP=1 | 85.4 s | 348.3 s | 10.2 GB |

For LTX-2.5 with the diffusion VAE, vidax reports 478.2 s compilation and 2680.8 s generation; the fast result above specifically uses the convolutional VAE.

## Decision

- **Fastest documented model path:** LTX-2.5 22B distilled with vidax's convolutional VAE on TPU v4-8: 37.3 s warm generation, 125.2 s compile plus generation before setup/export. This is not validated on Kaggle's requested runtime.
- **Best small-model baseline:** LTX-Video 2B distilled with vidax: 47.3 s warm generation on TPU v4-8. The local T4 attempt was corrupted, so it does not pass quality validation.
- **LTX-Video 13B distilled:** 104.2 s warm generation on TPU v4-8, but about 240.6 s for compile plus generation before setup/export; it misses the 1–3 minute cold-run target on that reference.
- **Kaggle status:** Until Kaggle actually exposes TPU devices to JAX/XLA, the TPU-native candidates cannot be fairly benchmarked there. The current dual-T4 allocation is not a substitute for a TPU slice, and its two cards do not pool VRAM.

## Source links

- Proposal supplied in the Codex attachment: `Local-First AI Video Generation on Kaggle TPU Research and Benchmark Proposal`.
- [vidax benchmark methodology and full per-model settings](https://github.com/FlyingGiraffe/vidax/blob/main/docs/benchmarking.md)
- [vidax live benchmark table](https://flyinggiraffe.github.io/vidax-site/benchmarks)
- [vidax TPU model support and hardware caveats](https://github.com/FlyingGiraffe/vidax)
