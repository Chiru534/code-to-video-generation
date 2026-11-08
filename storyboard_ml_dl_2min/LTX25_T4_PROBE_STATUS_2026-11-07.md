# LTX-2.5 Kaggle T4 probe status

As of the Kaggle run recorded at 2026-11-07 13:24:59 UTC.

## Candidate and planned probe

- Runtime: Kaggle dual Tesla T4 (15.6 GB VRAM per card, about 29 GB host RAM).
- Model: LTX-2.5 22B Distilled NVFP4 through the Wan2GP headless API.
- Probe: 121 frames at 24 fps (5.04 seconds), 832x480, 8 steps, fixed seed, no generated audio.
- Checkpoint route: public `DeepBeepMeep/LTX-2` WanGP-compatible derivative; no Hugging Face credential is embedded.
- Notebook: [ltx25_wangp_t4_probe.ipynb](./ltx25_wangp_t4_probe.ipynb).

## Kaggle run evidence

1. The first version received the dual-T4 allocation, reported about 29 GB host RAM and roughly 1.03 TB free `/tmp` space, and installed the filtered Wan2GP dependencies in 166.96 seconds. It failed before model import because the setup cell did not persist the timing JSON needed by the next cell.
2. The second version fixed that report handoff and cloned Wan2GP to `/tmp/Wan2GP`. It then failed in the generation cell before importing Wan2GP or downloading weights: `ModuleNotFoundError: No module named 'shared'`. The cell inserted `/kaggle/working/Wan2GP` into `sys.path`, while the repository was at `/tmp/Wan2GP`. No model inference or MP4 generation occurred.

This is a notebook path bug, not evidence that LTX-2.5 itself fails on T4. It also does not provide a speed or quality result. A corrected probe would need to fix the import path first, then pass the visual gate before being considered usable.

## Existing measured baselines

### Wan2.1 T2V 1.3B

The completed Kaggle run produced a 3.0625-second, 832x480 MP4 from 49 frames at 16 fps. Model load took 216.66 seconds, generation took 589.77 seconds, and the whole job took 810.84 seconds. See [wan21_recovery_report.json](./wan21_recovery_report.json) and [wan21_recovery_sample.mp4](./generated_shots/wan21_recovery_sample.mp4).

Linear extrapolation of that complete job time is about 66.2 hours for 15 minutes of footage. It is a rough estimate, not a long-render measurement.

### LTX-Video 2B distilled

The separate dual-T4 run generated an 8.3-second, 832x480 MP4. The complete job took 377.58 seconds (6 minutes 18 seconds), implying about 11.4 hours for 15 minutes if that end-to-end rate scaled linearly. The sampled output is a green/cyan grid with no usable scene content, so reject it on quality even though the file encoded successfully. See [ltx_distilled_benchmark_report.json](./ltx_distilled_benchmark_report.json) and [ltx_distilled_contact.jpg](./generated_shots/ltx_distilled_contact.jpg).

## TPU availability

The saved Kaggle TPU probes detected JAX CPU only, no TPU devices, and no `torch_xla`; they do not establish TPU throughput. Browser access is disabled in this Codex session, so I could not select TPU v5e-8 in an interactive Kaggle notebook. The published TPU v4 figures in [AUTORESEARCH_PIPELINE_DECISION_2026-11-07.md](./AUTORESEARCH_PIPELINE_DECISION_2026-11-07.md) remain a research lead, not a result measured on this account.

## Current conclusion

There is no new 15-minute model-generated video from this attempt. The measured dual-T4 generation rates miss the one-hour target, and the potentially faster TPU route has not been allocated or benchmarked here. The existing 15-minute Kaggle master is based on still images with pan/zoom motion; it is not the moving model-generated video requested, so it should not be represented as one.

## Sources

- [Wan2GP headless API](https://github.com/DeepBeepMeep/Wan2GP/blob/main/docs/API.md)
- [WanGP-compatible LTX-2.5 checkpoint manifest](https://huggingface.co/DeepBeepMeep/LTX-2/blob/main/LTX-2.5-MANIFEST.md)
- [Kaggle Notebook resource and queue notes](https://www.kaggle.com/docs/notebooks)
