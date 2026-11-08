# Autoresearch decision: 15-minute video in one hour

Date: 2026-11-07

## Goal and constraint

The goal is 900 seconds of final video within 3,600 seconds wall time. At 24 fps, that is 21,600 output frames, or 6 final frames per second including model loading, generation, edits, audio mix, and export. The target is not met by the current local/T4 evidence.

## The four proposal models

| Rank | Model and proposed runtime | Published reference | Linear 15-minute projection | Decision |
|---|---|---|---:|---|
| 1 | LTX-2.5 22B distilled, convolutional VAE, vidax on TPU | TPU v4-8: 121 frames in 37.3 s warm; 87.9 s compile; 15.3 GB peak HBM/chip | ~111 min warm generation | **Run this first on a real Kaggle TPU v5e-8.** Kaggle reports up to 2.5× inference vs v4, which would imply ~44 min of warm generation if that upper-bound applied here. This leaves only ~16 min for model load/download, per-shot overhead, audio, assembly, and export. It is plausible enough to test, not proven. The vidax benchmark harness itself warns that the fast convolutional VAE has a periodic artifact; judge whether it is acceptable before keeping this speed path. |
| 2 | LTX-Video 2B distilled, vidax on TPU | TPU v4-8: 121 frames in 47.3 s warm; 83.5 s compile; 8.8 GB/chip | ~141 min warm | Secondary fallback if LTX-2.5 will not fit or initialize. The previous T4 attempt was green/noise because it used a heavily patched FP16/offload path; do not reuse that path. |
| 3 | LTX-Video 13B distilled, vidax on TPU | TPU v4-8: 121 frames in 104.2 s warm; 136.4 s compile; 15.3 GB/chip | ~5.2 h warm | Reject for the one-hour target absent a major measured speedup. |
| 4 | Wan2.1 T2V 1.3B | TPU v4-8 reference: 81 frames in 348.3 s warm. Kaggle dual-T4 result: 49 frames in 589.8 s generation / 810.8 s whole job | ~25.7 h on the v4 reference; ~66 h using the T4 whole-job rate | Keep as the existing visual baseline only. It is coherent, but too slow for the target. |

The vidax table is an average of five runs on TPU v4, batch size 1. Its warm generation includes sampling and VAE decode, while compilation is reported separately; final MP4 export and model acquisition/setup are not included. Its docs list TPU v4 and v7 as tested, not Kaggle v5e. These numbers are comparative references, not predictions for this Kaggle account.

## Physical/runtime issues to clear before the model probe

1. **TPU allocation:** the existing Kaggle push-based TPU probe returned JAX CPU and no `torch_xla`. Kaggle CLI issue #1197 reports the same silent substitution for push-based TPU jobs and says interactive notebook sessions can allocate TPU correctly. The separate FastWan T4 job eventually completed but failed while initializing its worker process. It downloaded/loaded some model components, ran about 396 seconds total, and produced no video; the worker's underlying exception was not present in Kaggle's published log, so its root cause remains unknown. This is not a generation-speed or visual-quality result. See [fastwan_t4_microbenchmark_result.json](./fastwan_t4_microbenchmark_result.json).
2. **HBM per chip:** Kaggle's v5e-8 has 8 chips with 16 GB HBM each (128 GB total). LTX-2.5's TPU v4 result peaked at 15.3 GB/chip at TP=4, leaving almost no safety margin if memory use were similar. On v5e, test `--tensor_parallel_size 8` (the model dimensions permit this split) to use all 8 chips and reduce per-chip shard pressure; measure speed because added communication can erase some benefit. Stop immediately on OOM; don't alter model precision to force a run.
3. **Checkpoint storage/access:** the distilled transformer is about 42 GB, Gemma-4 text encoder about 24 GB, and the convolutional VAE about 1.5 GB. The model is gated on Hugging Face. Kaggle's prior diagnostic showed a 20 GB working volume, which cannot hold the full checkpoint set there. Before spending accelerator time, verify accessible storage for roughly 70 GB (for example, mounted model inputs) and that the account has accepted the Hugging Face model terms. Never put an access token in notebook source or reports.
4. **Quality:** 15 minutes cannot be one 121-frame model call; at 24 fps, 121 frames is about five seconds. The candidate production plan is roughly 180 short generated shots, with camera/action variation and optional image conditioning from previous shot anchors. Exact technical diagrams, labels, captions, narration, and mix should be composed deterministically in the edit so generated footage is not asked to spell technical text.

## Karpathy loop to run

### Hypothesis

LTX-2.5 distilled with the vidax convolutional VAE on a true TPU v5e-8, using 8-way tensor parallelism and 480p output, can reach at least six final output frames per wall-clock second after measured setup and assembly. The model's published v4 warm rate is 3.24 frames/s; a reported Kaggle v5e-vs-v4 upper-bound of 2.5× would imply 8.1 frames/s, leaving little end-to-end slack. This hypothesis is falsified if actual throughput, memory, usable visual quality, or whole-pipeline timing fails.

### Probe A — allocation and storage gate (no model yet)

Run one cell in a Kaggle notebook with **TPU v5e-8 explicitly selected in the UI**. Print JAX devices/platform, RAM, free disk, package versions, and `/kaggle/input` mounts. Exit if there are no TPU devices, fewer than 8 devices for the planned TP=8 run, or insufficient checkpoint storage. This isolates platform/quota/storage failures before downloads or compilation.

### Probe B — 5-second quality and timing gate

Use the unmodified vidax LTX-2.5 script and official BF16 checkpoints + convolutional VAE. Render one 121-frame, 832×480, 24-fps technical macro shot with TP=8 and offloading disabled as the first target-shape probe. Keep prompt, seed, resolution, and steps fixed. Record checkpoint acquisition, install, cold compile, warm generation, VAE decode, MP4 write, peak HBM, peak host RAM, and total wall time separately. Extract a contact sheet and inspect motion, sharpness, color, flicker, prompt match, frame-to-frame stability, and the known periodic VAE artifact. Reject noise, black/green frames, stalled/static footage, or severe artifacts before any scale-up. If TP=8 fails, first inspect the root cause; only then change one configuration variable (for example, offloading) and rerun the same micro-batch.

### Probe C — three-shot end-to-end micro-batch

Only after Probe B passes the visual gate, generate three consecutive 121-frame shots with different prompts and a shared visual anchor. Include prompt encoding, clip joins, one narration/music segment, subtitle/vector overlays, and final 480p H.264 export. This gives a useful measured end-to-end rate and reveals repeated per-shot costs that a single-shot benchmark hides.

### Keep/revert threshold

Keep LTX-2.5 only if the decoded clip is visually usable (at least 9/10 on the agreed lookdev checklist) and the three-shot total projects to ≤60 minutes for the actual 15-minute shot plan with a 20% time buffer. Otherwise revert to the known coherent Wan sample as the visual baseline and choose a hybrid production schedule; do not launch a 15-minute neural render on an unverified speed claim.

## Selected production architecture if the probes pass

1. Prepare the 15-minute edit as a shot list with 4–7 second scenes; generate video shots at 480p, about five seconds each, with LTX-2.5 distilled on TPU v5e-8. Reuse visual anchors with I2V where identity/scene continuity matters.
2. Keep the gated checkpoints mounted as a read-only input dataset so no 70 GB download lands in the 20 GB working volume. Install the runtime before the timed production run, then start a long-lived inference worker that loads weights once and reuses the same compiled 480p shape across shots. **Count model load, compilation, prompt encoding, all generation/decode, joins, audio/subtitle composition, and final export in the one-hour clock.** Record environment provisioning and checkpoint acquisition separately; do not hide per-shot prompt or model costs outside the generation timing.
3. Add procedural Blender/FFmpeg camera overlays, exact math/labels, animated technical diagrams, transitions, narration, subtitles, and music after generation. Keep active object/camera/data motion throughout so the final is a video rather than a slide deck.
4. Encode and inspect the complete master. Count model generation, VAE decode, shot assembly, audio/subtitle composition, and export inside the one-hour timer.

This architecture can be a full video whose photographic shot footage is neural and whose exact educational graphics/edit are deterministic. It is not one continuous 15-minute diffusion call. The one-hour goal remains **conditional on Kaggle's actual v5e throughput and storage**, not achieved by this report.

## Work completed and current state

- Confirmed the four proposal candidates and separated them from FastWan, which was a later extra candidate.
- Kept the coherent Wan T4 sample as a quality baseline; rejected the corrupted LTX T4 sample for quality.
- Ran Kaggle TPU probes; they exposed CPU only, so no candidate has yet been measured on Kaggle TPU.
- Prepared [ltx25_vidax_kaggle_tpu_microbenchmark.ipynb](./ltx25_vidax_kaggle_tpu_microbenchmark.ipynb): an interactive TPU v5e-8 gate and one-run TP=8 LTX-2.5 distilled/conv-VAE benchmark. It requires the gated checkpoint files attached as a Kaggle input; it refuses CPU fallback and verifies output/contact sheet.
- The FastWan T4 micro-probe is complete with an error: worker initialization failed before generation; no clip or speed measurement resulted. The likely next fix belongs in FastVideo's worker/runtime configuration, not the model list, and it is lower priority than the LTX-2.5 TPU probe because FastWan is outside the four-model proposal.
- Browser automation is disabled in this Codex Work session, so I cannot select TPU v5e-8 in Kaggle's interactive UI from here. The push-based TPU route is precisely the route whose allocation is not reliable. The next operation requiring the user-side browser is the allocation gate above; the rest of the plan is ready to run as soon as it produces TPU devices.

## Primary sources

- [vidax benchmark methodology and model timings](https://github.com/FlyingGiraffe/vidax/blob/main/docs/benchmarking.md)
- [vidax LTX-2.5 usage, TP, frames, resolution, and checkpoints](https://github.com/FlyingGiraffe/vidax/blob/main/docs/models/ltx2_5.md)
- [vidax LTX-2.5 benchmark harness (notes conv-VAE periodic artifact)](https://github.com/FlyingGiraffe/vidax/blob/main/benchmarks/run_ltx2_5.py)
- [vidax TPU support matrix](https://github.com/FlyingGiraffe/vidax)
- [Kaggle TPU v5e-8 announcement](https://www.kaggle.com/product-announcements/607202)
- [Kaggle CLI report of push-based TPU allocation mismatch](https://github.com/Kaggle/kaggle-cli/issues/1197)
- [Official gated LTX-2.5 checkpoint repository](https://huggingface.co/Lightricks/LTX-2.5)
- [Google Cloud TPU v5e HBM specification](https://cloud.google.com/tpu/docs/v5e)
