# 15-minute video in one hour: feasibility and next probes

Date: 2026-11-07

> **Superseded decision:** the exact four-model proposal is analyzed in [AUTORESEARCH_PIPELINE_DECISION_2026-11-07.md](./AUTORESEARCH_PIPELINE_DECISION_2026-11-07.md). Its selected candidate is LTX-2.5 distilled on a verified Kaggle TPU v5e-8. This older note's LongLive discussion is an external research lead, not one of the four proposal models. It also predates the current TPU/HBM/storage gating analysis.

## What the failures tell us

## Karpathy loop: measured baseline and current probe state

### Baseline kept

The existing Wan2.1 T2V 1.3B Kaggle run is the current working neural baseline: 49 frames at 832×480 and 16 fps (3.06 s output), with coherent chip footage and visible camera motion. It measured 589.77 s for generation, 592.11 s generation plus encode, and 810.84 s total job time including model load/setup. That is about **0.083 generated frames/s** during generation and **0.060 output frames/s** for the whole job (about **0.0038 seconds of video per wall-clock second**). Linear scaling gives roughly **66 hours** for 15 minutes of output at the measured end-to-end rate; this is a rough lower bound for a many-shot film because each shot adds setup and stitching overhead. This makes the one-hour target require about a **66× end-to-end speedup** over the observed Wan run.

### Probe attempted, not yet measured

The 3-step FastWan2.1/FastVideo T4 probe first failed before generation because the generated runner lacked Python's multiprocessing `__main__` guard. After that was fixed, Kaggle eventually completed the job, but FastVideo worker initialization still failed before generation. The available error is only `WorkerMultiprocProc initialization failed`; Kaggle's log omitted the background worker's root exception. The job took 396.23 s total and produced no clip, so it supplies neither speed nor visual-quality evidence. See [fastwan_t4_microbenchmark_result.json](./fastwan_t4_microbenchmark_result.json).

### Keep / revert decision

- Keep the original Wan2.1 run as the neural quality baseline because it produced coherent moving imagery.
- Reject the LTX run as a visual-quality candidate because it produced grid/noise frames, despite completing encode.
- Do not promote FastWan: its run now completed but failed during worker initialization before generating any frames.
- The next valid micro-batch should be one 49-frame shot at 480p, then a 5–10 second shot only if it is visually clean. Capture model load, generation, VAE decode, encode, and complete kernel time separately. Require finite latents, a non-degenerate decoded-frame color distribution, playable MP4, and human lookdev before judging speed.

### Best next opportunities

1. **Resolve the Kaggle runner before changing models.** Check the notebook's run state in Kaggle UI/API and confirm a fresh `lastRunTime`; if it remains queued, submit the same tiny probe under a new exact title/slug and inspect the returned kernel reference. This distinguishes scheduler trouble from model trouble without spending GPU time on another model.
2. **Benchmark a genuinely optimized short-shot model.** If FastWan runs, compare it to the Wan baseline on the same 49-frame prompt, resolution, seed, and hardware. Then vary only inference steps (3, then 5 if quality fails) and choose the fastest result that passes lookdev.
3. **Treat continuity as an edit/design problem.** For a 15-minute educational film, use many short purposeful shots, controlled camera motion, repeated reference anchors, and deterministic Blender diagrams/titles. Generate neural footage only for hero shots. That is more plausible than asking a single diffusion model to synthesize 900 seconds continuously on 2×T4.
4. **Pursue the one-hour fully neural target by changing compute, not by assuming a T4 speedup.** LongLive is the strongest published long-video lead in the sources below, but its tested ≥40 GB GPU / 64 GB RAM baseline needs a suitable larger GPU environment. Obtain access and run the same micro-batch there before planning the full film.

### Current answer

This older note's T4-only recommendation is superseded by [AUTORESEARCH_PIPELINE_DECISION_2026-11-07.md](./AUTORESEARCH_PIPELINE_DECISION_2026-11-07.md): test LTX-2.5 distilled on a real Kaggle TPU v5e-8 first. The FastWan run has since failed before generation; no speed result exists.

### LTX-Video 2B green/noise output

The Kaggle job exited successfully and produced an H.264 MP4, but its sampled frame is a repeated green/cyan grid with no scene content. That means container/file encoding completed; the video-generation output itself is invalid.

The run did not use an unmodified, supported upstream path. Its notebook cloned Lightricks/LTX-Video and patched the inference code in place: it globally replaced `torch.bfloat16` with `torch.float16`, altered model placement/offload behavior, modified VAE device/normalization code, and changed the upscaler device argument. The report never checked latent finiteness/range, decoded-frame distribution, or color/quality before marking the job `complete`.

**Most likely cause (not proven):** numerical or device/normalization corruption in this custom FP16/offload/VAE patch path. A secondary possibility is a bug or version mismatch in the legacy `inference.py` path. Lightricks' current repository explicitly calls the 0.9.x code legacy and recommends its ComfyUI workflow for better output fidelity. Their documented VAE decode settings for 0.9.1+ are `decode_timestep=0.05` and `image_cond_noise_scale=0.025`; those values were in the config family, but the custom edits were not validated against the official workflow.

The evidence does **not** prove that T4 hardware or LTX-Video weights are inherently broken. The controlled follow-up should use an unmodified official workflow and add a lookdev check that rejects uniform/green frames before timing is accepted.

### Kaggle TPU request

The TPU probe exposed JAX CPU only and no `torch_xla`. Kaggle CLI issue #1197 describes TPU `kernels push` jobs silently running in the normal CPU image when stale CPU/GPU Docker image pins are passed. The issue was fixed in Kaggle CLI PR #1219 on Oct 26, 2026. Our probe generated a fresh notebook without a Kaggle image metadata block and used the direct Kaggle HTTP API, so the published stale-pin cause is a strong lead but **not a confirmed explanation for this exact run**. The remaining evidence is that the direct push/API run did not actually allocate TPU. A browser-created TPU notebook session or a clean current CLI push is the next diagnostic.

## One-hour throughput target

For a 15-minute, 24 fps master: 900 seconds × 24 = **21,600 output frames**. Completing that in 3,600 seconds requires an average of **6 output frames per second**, inclusive of generation, decoding, stitching, and export. If a model emits at 16 fps and the final master needs 24 fps, frame interpolation adds a postprocess step and must be included in the measured end-to-end time.

## Alternatives and realistic opportunities

| Candidate | Published evidence | Fit to this project | Status here |
|---|---|---|---|
| **LongLive 1.3B** | Authors report 20.7 generated frames/s on one H100; supports up to 240-second sequences; tested on NVIDIA GPUs with at least 40 GB VRAM and 64 GB host RAM. | **Best direct research lead** for long, moving footage. A 15-minute 24 fps master is 17.4 minutes of pure frame generation at the reported rate, before interpolation/export; four ~225-second segments fit the stated 240-second limit. That leaves substantial theoretical headroom under 1 hour, but does not prove a coherent, broadcast-ready 15-minute result. | Not tested; current Kaggle dual T4 and Colab T4 are below the authors' tested hardware.
| **FastWan2.1 1.3B (FastVideo)** | Distilled 3-step model; authors report up to 16 fps on H100 at 480p and train at 61 frames. Their FastVideo docs warn free Kaggle/Colab host RAM is limited and recommend one GPU. | Worth testing for 480p short-shot production, but no H100 throughput implies T4 speed. At the published frame rate, 15 minutes of 16 fps content would take at least 15 minutes of pure generation; 24 fps up-conversion and many short shots add cost. | Kaggle API says `queued`, but `lastRunTime` is stale and there are no logs/artifacts; not yet executed.
| **TurboDiffusion / TurboWan2.1 1.3B** | Authors report 1.9 s diffusion time for a 5-second 480p clip on RTX 5090, explicitly excluding text encoding and VAE decode. Acceleration depends on low-bit/sparse kernels and rCM distillation. | Potentially excellent on supported modern NVIDIA hardware, but the public benchmark is RTX 5090, not T4. Do not scale the 100–200× headline to Kaggle T4. | Not tested; hardware path likely unsuitable for T4-specific kernels.
| **LTX-2.5 22B distilled, convolutional VAE via vidax** | Published TPU v4-8 benchmark: 37.3 s warm generation for 121 frames at 1216×704; 87.9 s compile; excludes model download/setup/export. | Strong TPU speed reference, but the model run and TPU availability are unverified on Kaggle. | Not tested on this account's TPU session; probe saw CPU only.
| **Selective AI shots + Blender/motion graphics base** | No end-to-end benchmark yet. Procedural scenes, animated diagrams, camera moves, transitions, and typography can be rendered deterministically while AI is reserved for selected hero shots. | Most practical plan under current dual-T4/Colab limits for a full 15-minute educational documentary. It can deliver a moving video and exact technical text; it is not 15 minutes of neural photorealistic footage. | Project already has a rendered animatic and narration assets; full master timing still needs an actual cloud render benchmark.

## Best opportunity found

**A single H100 running LongLive is the first credible research-backed path to the 15-minute/one-hour target.** Its reported frame rate is over the required 6 fps; it supports 240-second videos and the project repo reports an unlimited-generation mode. However, the authors' tested baseline requires ≥40 GB GPU memory and 64 GB RAM, so it does not fit our current T4 environments. Treat this as a hardware-access opportunity, not a result achieved on Kaggle.

**With only the existing T4 resources, the one-hour target remains unproven and likely unrealistic for 15 minutes of fully neural photorealistic footage.** The strongest next action is to finish the FastWan T4 microbenchmark and independently retry TPU allocation from a clean, correctly configured TPU session. Do not launch a 15-minute generation until a short moving clip passes visual inspection and measured throughput clears the six-fps threshold with postprocessing included.

## Sources

- [Lightricks LTX-Video repository and model guidance](https://github.com/Lightricks/LTX-Video)
- [Lightricks LTX-Video inference implementation](https://github.com/Lightricks/LTX-Video/blob/main/ltx_video/inference.py)
- [Kaggle CLI TPU image-pin issue and maintainer-confirmed workaround](https://github.com/Kaggle/kaggle-cli/issues/1197)
- [Kaggle CLI fix merged Oct 26, 2026](https://github.com/Kaggle/kaggle-cli/pull/1219)
- [NVIDIA LongLive repository and hardware requirements](https://github.com/NVlabs/LongLive)
- [LongLive paper](https://arxiv.org/abs/2509.22622)
- [FastVideo inference quick start](https://github.com/hao-ai-lab/FastVideo/blob/main/docs/inference/inference_quick_start.md)
- [FastVideo 3-step model speeds and training resolution/frame details](https://github.com/hao-ai-lab/FastVideo/blob/main/docs/distillation/dmd.md)
- [Official TurboDiffusion implementation and benchmark methodology](https://github.com/thu-ml/TurboDiffusion)
- [vidax official TPU benchmarking](https://github.com/FlyingGiraffe/vidax/blob/main/docs/benchmarking.md)
