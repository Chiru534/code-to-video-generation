# Agent B — The Hardware Skeptic: 15-Min AI Video in 1–2 Hours? (Nov 8, 2026)

## TL;DR
- H100 rental is CHEAP: **$1.79–$4.29/hr** (Vast.ai spot/marketplace → Lambda SXM). 2 hours = **$4–$9**, not $50–$200. Spots exist but are THIN (~5 live H100 SXM offers on Vast.ai right now).
- The published "20.7 FPS" for LongLive **excludes VAE decode**. Independent measurement on H100: **~8.4–12.5 FPS end-to-end** (issue #26 profiler, issue #103). LongLive-2.0's 24.8/29.7/45.7 FPS claims are **GB200-only**, not H100.
- No open model generates 15 continuous minutes at 1080p. LongLive tops out at **240 s per session** (832×480). Everything else is 5–8 s clips that must be shot-listed and stitched.
- GPU time for 900 s of footage: **~5–30 min** depending on model. Wall clock is dominated by setup, QA, stitching, audio.
- **1–2 hours: NO for a finished, reviewed 15-min film. YES only for "raw footage dump, 480p, no review" with a pre-warmed environment — and even then ~1.5–2.5 h.**

---

## 1. H100 80GB rental — verified prices (Nov 2026)

| Provider | H100 80GB $/hr | 2h cost | Notes | Source |
|---|---|---|---|---|
| Vast.ai spot | from **$0.65–$1.79** | **$1.3–$3.6** | Interruptible; ~5 H100 SXM ($1.93) + spot $0.65 offers live 2026-11-08 | https://munkhbayarbr.github.io/gpu-radar/ |
| Vast.ai on-demand (marketplace, verified) | **$2.33–$2.40** | $4.66–4.8 | Verified US/CA listing; bandwidth extra | https://www.thundercompute.com/blog/nvidia-h100-pricing |
| RunPod Community | **$1.99** (PCIe) / $2.69 (SXM) | $4.0 / $5.4 | Host-dependent | https://www.runpod.io/gpu-models/h100-pcie |
| RunPod Secure | $2.89 (PCIe) / **$3.49** (SXM) | $5.8 / $7.0 | runpod.io/gpu-models/h100-sxm | |
| Shadeform (Hyperstack etc.) | **$2.50** | $5.0 | Aggregated marketplace | https://computeprices.com/providers/shadeform/gpus/h100 |
| Lambda | **$3.29** (PCIe 1×) / $4.29 (SXM 1×) | $6.6 / $8.6 | On-demand, in stock by default | https://lambda.ai/instances |
| Modal (serverless) | **$3.95** ($0.001097/s) | $7.9 | Per-second, cold start extra | https://modal.com/pricing |
| JarvisLabs spot / Hikube | $1.54 / $2.73 (in stock) | $3.1 / $5.5 | getdeploying.com, checked 2026-10-19 | https://getdeploying.com/gpus/nvidia-h100 |
| Spheron | $2.39 on-demand / $2.20 spot | $4.8 / $4.4 | | https://www.spheron.network/blog/gpu-cloud-pricing-comparison-runpod-vs-vastai-2026 |

**Queue/availability:** On-demand (Lambda/RunPod Secure) usually launches in minutes. Spot/marketplace is thin — Vast.ai showed only **5 H100 SXM offers** and ~1349 verified on-demand offers across GPUs on 2026-11-08; Nebius spot "from $0.79". Expect to shop for minutes, not hours. No multi-day queue for 1 GPU at these providers, but regional stock varies. (Sources: gpu-radar above; getdeploying.com.)

---

## 2. LongLive — paper vs measured reality

**Paper/HF claim:** 20.7 FPS on one H100; 24.8 FPS FP8; up to **240 s** per video; built on Wan2.1-T2V-1.3B @ 832×480, 16 FPS output. (https://arxiv.org/abs/2509.22622, https://huggingface.co/Efficient-Large-Model/LongLive-1.3B)

**What the FPS metric means:** generated frames ÷ **diffusion time only, excluding VAE decoding** — per the repo README and the maintainer's own reply in issue #103.

**Independent measurements (H100):**
- Issue #26 (Nov 2025), H100 SXM via RunPod: **~12.5 FPS overall, ~17.5 FPS diffusion-only**; VAE decode = 11.0 s of a 37.9 s total (29%); ~682 ms/block. Maintainer acknowledged ("580 ms per block… your results align"). https://github.com/NVlabs/LongLive/issues/26
- Same issue, Jul 2026 (kunkun0w0), H100: diffusion 30.5 s (53.8%) + **VAE 26.1 s (46.2%)** = 56.6 s for 477 frames → **~8.4 FPS e2e**.
- Issue #103 (Sep–Oct 2026), H100 80GB SXM, bf16, commit 58bc7d6: **18.6 FPS denoise-loop / 14.1 FPS streaming e2e** for LongLive-2.0-5B; stock script ≈ 3.9 FPS e2e. Maintainer (Aaronhuang-778) confirmed **24.8/29.7/45.7 FPS are GB200 180GB numbers**, FPS excludes VAE, and E2E needs 2 GPUs + MG-LightVAE to overlap. RTX PRO 6000: 15.2/9.9 FPS. https://github.com/NVlabs/LongLive/issues/103
- 4090: Daydream Scope lists LongLive **min 24 GB** (~20 GB estimated) and says the H100 FPS is the "~20 FPS" ceiling; WorldEngine runtime reports **14–15 FPS on RTX 4090** at 480×832. https://docs.daydream.live/scope/reference/system-requirements · https://www.emergentmind.com/topics/worldengine-runtime

**VRAM:** Official repo says **"Nvidia GPU with at least 40 GB memory (A100, H100 tested). 64 GB RAM. Other hardware untested."** (https://github.com/NVlabs/LongLive raw README). Daydream Scope repackaged it for **24 GB** (~20 GB) — works, slower. INT8 quantization (official "marginal quality loss") helps; a 4090 "may come into range," per independent blog — untested officially. https://menonlab-blog-production.up.railway.app/blog/longlive-nvidia-realtime-interactive-video-generation

**15-min feasibility of LongLive:** 900 s @16 fps = 14,400 frames.
- Optimistic (12.5 FPS e2e): **~19 min** of GPU. Pessimistic (8.4 FPS): **~29 min**. Plus ~20 min env/weights setup.
- BUT: **240 s cap per session.** 15 min needs either (a) 4 chained sessions (seams), or (b) the experimental "KV-cache relative RoPE → infinite video" patch from 2026-01-11 (unproven quality), or (c) 5–8 s clip stitching instead.
- Resolution is **832×480 SD**. "1080p" requires upscaling (adds ~10–20 min ffmpeg/Real-ESRGAN per minute of video).
- No audio track — needs separate TTS + music + SFX + mux.

---

## 3. TurboDiffusion — real, but it's a clip gun, not a film

Claim (paper/GitHub, Dec 2025): **1.9 s for a 5-s 480p video on a single RTX 5090** (Wan2.1-T2V-1.3B-480P), 100–200× speedup; 24 s for 14B-720p; E2E time **excludes text encoding and VAE decoding**. Only trained on **long English prompts**. Default 81 frames (5 s). (https://arxiv.org/abs/2512.16093 · https://github.com/thu-ml/TurboDiffusion)

Reality check:
- 1.9 s is **denoise-only on a 5090** with 4-step rCM + SageSLA + W8A8. Add VAE+decode+text-enc: realistically **~3–4 s** per 5-s clip.
- Good RTX 5090/4090 path (TurboDiffusion-QAD reports **~3.4 s FP8 on 4090**). On H100, use unquantized checkpoints (">40 GB, remove --quant_linear") — speed likely ≥ 5090 but **unverified publicly**.
- **No 15-min mode.** It generates fixed short clips with zero cross-clip continuity machinery. 900 s = **180 clips**, shot-listed, stitched.
- 480p (832×480) or 720p (14B). Quality "comparable to original" per paper — at 1.3B/4-step it's acceptable, not broadcast.

**15-min wall estimate (clip route):** 180 clips × 3.5–5 s ≈ **11–15 min GPU** + shot-list authoring + 180-prompt QA + ffmpeg concat (minutes). Compute is trivial; **human assembly is the bottleneck.**

## 4. FastWan2.1 (FastVideo) — real runs, short clips only

- FastWan2.1-T2V-1.3B (Diffusers): 3-step inference, 61×448×832, **up to 16 FPS on H100**; 5-s clip ≈ **5 s end-to-end on H200** (~1 s denoise), **~21 s on RTX 4090** (2.8 s denoise). VSA+DMD+torch.compile ≈ 0.98 s denoise. (https://hao-ai-lab.github.io/blogs/fastvideo_post_training · https://huggingface.co/FastVideo/FastWan2.1-T2V-1.3B-Diffusers)
- FastWan-QAD-FP8-1.3B: **~3.4 s per 5-s 480p clip on RTX 4090**; vs TurboDiffusion ~6.1 s on 5090 in their own table. https://huggingface.co/FastVideo/FastWan-QAD-FP8-1.3B
- 14B-480P: ~50× denoise speedup (≈9.9 s/clip); 14B-720P: ~24 s/clip.
- **T4 (16 GB): NOT viable.** Wan2.1-1.3B on a 16 GB 4060 laptop measured **~400 s/step → 4–5 h per 81-frame clip** (issue #555). T4 Colab can *run* quantized 1.3B for a single 5-s clip (rivas-vega/wan2.1-t4-colab) but at ~30–90+ min/clip — 180 clips is absurd. Skip T4.
- 15-min clip route on H100/H200: 180 × ~5 s ≈ **15 min GPU** (or ~63 min on 4090). Same continuity caveat as TurboDiffusion.

## 5. Table — model | hardware | fps (measured) | 15-min wall | cost | quality | source

| Model | HW | FPS measured (e2e) | 15-min footage time | 2h GPU cost | Quality | Source |
|---|---|---|---|---|---|---|
| LongLive-1.3B (832×480) | H100 | 20.7 paper-loop; **12.5** e2e; 8.4 worst | ~19–29 min (+setup) | $4–9 | 480p, decent drift-free ≤240 s | Issues #26, #103; arXiv 2509.22622 |
| LongLive-1.3B | RTX 4090 (24 GB, Scope) | ~14–15 | ~21–30+ min | $0.7–1.5 | 480p, untested limits | scope docs; emergentmind WorldEngine |
| LongLive-2.0-5B bf16 (1280×704) | H100 | 18.6 loop / **14.1 e2e** | ~17 min | $4–9 | 720p-ish, best open option | Issue #103 |
| LongLive-2.0-5B NVFP4 (claims) | **GB200 only** | 24.8 / 29.7 / 45.7 (claimed) | — | n/a on H100 | Good on paper | LongLive-2.0 paper; issue #103 |
| LTX-Video 1.9B | H100 | 8.98 | ~27 min | $4–9 | modest | LongLive paper table |
| Wan2.1-T2V-1.3B (raw) | H100 | 0.78 | **~5.1 h** ✗ | ✗ | high but far too slow | LongLive paper table |
| TurboDiffusion TurboWan2.1-1.3B | RTX 5090 | 5 s clip / 1.9 s loop (excl. VAE) | 180 clips ≈ 11–15 min | $0.9–2.4 (5090 @ ~$0.45) | 480p, 4-step, OK | arXiv 2512.16093; HF |
| FastWan2.1-T2V-1.3B | H100/H200 | ~16 (claimed loop) | 180 clips ≈ 15 min | $4–9 | 480p, decent | hao-ai-lab blog; HF |
| FastWan2.1-T2V-1.3B | RTX 4090 | ~21 s per 5-s clip | ≈ 63 min | $0.7–1.5 | 480p | hao-ai-lab blog |
| Wan2.1-1.3B raw | T4/4060 16 GB | ~0.005 | **days** ✗ | — | — | Wan2.1 issue #555 |
| (Ref) Sora 2 Pro / Veo 3.1 / Kling | Cloud API | n/a | n/a (≤25 s/shot) | **$30–$160+** | best | Runway/GenMagic guides |

Costs assume Vast.ai/RunPod rates from §1. "15-min footage time" = GPU generation only, excludes shot-list authoring, QA, edit, audio, export.

## 6. The actual 15-minute workflow (what people really do)

No single generation can do 15 min. Practice (Runway, Argil, GenMagic, CrePal, Dec 2025–Oct 2026 guides):
1. **Script → shot list**: 15 min ≈ **60–180 shots** at 5–10 s each; ~40–80 shots is aggressive pacing (aimagicx.com 2026-03-18; Runway long-form guide).
2. **References**: character sheet (10–15 imgs), location plates, locked style phrase in *every* prompt.
3. **Batch by similarity**, not chronology; expect **2–3 takes per kept shot** → 120–300+ clips for 15 min.
4. **Generate** (distilled model), **QA each clip**, regenerate only broken ones.
5. **Stitch**: ffmpeg concat → color match (Resolve) → TTS/VO (e.g. Piper, edge-tts — free) → music ducking (−14 LUFS) → x264 1080p export. ffmpeg concat of 180 clips: minutes.
6. Budget real brands do it this way: "60 to 100 shots for 10 minutes" (Runway); 2–3 generated minutes kept per finished minute (GenMagic).

Total wall clock for a *first* run: **4–8 h** (mostly human). Re-run with cached env/weights: **~2 h** if quality bar is "480p, ship it."

## 7. Cheapest viable path (with cost)

**Option A — continuity-first (recommended for narrative/documentary):**
RunPod Community **1× H100 $1.99/hr** (or Vast.ai on-demand $2.33) → LongLive (Scope, 24 GB is NOT enough for 5B; use 1.3B) research or LongLive-2.0 bf16 → stream 832×480 footage in ~20–30 min → ffmpeg mux with TTS → done-ish.
- GPU cost: ~0.75–1.25 h × $2 ≈ **$2–3** (plus a likely second attempt: **$4–6**).
- Catch: ≤240 s per uninterrupted session; seams or infinite-RoPE patch needed; 480p.

**Option B — clip-shot-list (matches how 15-min films are actually made):**
Vast.ai **RTX 4090 spot/on-demand ~$0.34–$0.52/hr** → FastWan-QAD-FP8 or TurboDiffusion (quant) → 180 5-s clips ≈ 15–25 min compute (4090) → concat + grade + VO.
- GPU cost: **<$1**. Fastest raw throughput per dollar. Catch: zero cross-shot continuity; heavy manual QA; 480p.

**Option C — safety/quality for client work:** Lambda/Modal/RunPod Secure H100 SXM ($3.49–4.29/hr), H100, 2 h ceiling = **$7–9 GPU**. Everything else identical.

**Bottom line: GPU for the whole 15-min video ≈ $2 (4090 spot) to $9 (H100 secure, 2 h). Audio: $0 (Piper/edge-tts). Storage/egress: ~$0. The $50–$200 figure only applies to hosted closed APIs (Veo/Sora/Seedance).**

## 8. #1 risk that breaks the run

**Environment + model-integration failure on research-grade stacks — not GPU, not money.** Concretely:
1. flash-attn build / CUDA mismatch / OOM at first frame (LongLive needs Linux, CUDA 12.4, torch 2.8.0, flash-attn source build — 20–40 min of setup before frame 1; Scope mitigates but adds its own stack);
2. config mismatch (issue #103: stock script ≈ 3.9 FPS e2e vs paper 20.7 — people benchmark the wrong thing, then panic-optimize the wrong thing);
3. **240 s session ceiling** — hitting it at minute 4 of 15 is the classic "we didn't read the paper" failure;
4. VRAM cliff on 24 GB (Scope fits it; official path OOMs);
5. quality collapse/drift after minute ~4 at 1.3B (VBench-Long numbers hold, but 832×480 + 4-step distillation is demo-grade).

Director of that list: **the 240-second cap + continuity drift at 480p** — i.e., the output is unusable as one continuous film no matter how cheap the GPU is.

## 9. Is 1–2 hours achievable?

**No — not for a reviewed, finished 15-minute film. Yes — only for a raw 480p footage dump with a pre-warmed pipeline.**

Evidence:
- Compute alone fits easily: LongLive e2e 12.5 FPS → 900 s in ~19–29 min (issue #26 profiler; kunkun0w0 re-test). Faster clip route: ~15 min.
- But cold-start setup is ~20–40 min (weights ~10 GB, flash-attn build — menonlab guide: "~20 minutes mostly model download"), leaving ≤60 min for generate + QA + edit + audio + export for 900 s of footage requiring 60–180 discrete generations with continuity QA.
- Independent reproductions show paper FPS is loop-only; e2e is ~50–60% of that (issues #26/#103). So even "near real-time" claims don't survive contact with VAE decode.
- Industry practice for 15 min: days of shot-list prep, 2–3 takes/shot, 100+ clips, human edit (Runway/aimagicx/GenMagic 2026 guides) — no published workflow does 15 min end-to-end in 1–2 h.
- Realistic: **first run 4–8 h; re-run with warm cache ~2–3 h; raw dump ~1–1.5 h.** Budget a second H100-hour as contingency (~+$2–4).

**Verdict:** 1–2 hours is a marketing-shaped number. The GPU bill ($2–9) is not the constraint; **review time and research-repo fragility are.** If the deliverable is "show me 15 minutes of continuous AI 480p footage tonight," rent a RunPod Community H100 ($1.99) or Vast on-demand ($2.33), use Daydream Scope/LongLive-1.3B, expect ~25 min of footage per session (240 s), and accept 480p. If the deliverable is a *good* 15-min film, plan an afternoon, not an hour.

---

### Primary sources
- NVlabs/LongLive repo + README (FPS = diffusion-only, GB200 for 2.0 claims, 40 GB requirement): https://github.com/NVlabs/LongLive
- LongLive paper (240 s cap, 20.7 FPS, 832×480, 16 FPS Wan2.1-based): https://arxiv.org/abs/2509.22622 · https://arxiv.org/html/2509.22622v1
- Issue #26 (t-sekai H100 profiler: 12.5 FPS e2e, VAE 29%; maintainer ack; Jul 2026 re-test 8.4 FPS, VAE 46%): https://github.com/NVlabs/LongLive/issues/26
- Issue #103 (stayinalive181 H100/B200/RTX PRO 6000 measurements; maintainer confirms GB200 + VAE-exclusion): https://github.com/NVlabs/LongLive/issues/103
- Daydream Scope system requirements (LongLive ≥24 GB, ~20 GB): https://docs.daydream.live/scope/reference/system-requirements
- TurboDiffusion (1.9 s denoise-only RTX 5090, English prompts, 81 frames): https://arxiv.org/abs/2512.16093 · https://github.com/thu-ml/TurboDiffusion · https://huggingface.co/FastVideo/FastWan-QAD-FP8-1.3B
- FastWan (5 s on H200 / 21 s on 4090 / ~16 FPS H100): https://hao-ai-lab.github.io/blogs/fastvideo_post_training · https://huggingface.co/FastVideo/FastWan2.1-T2V-1.3B-Diffusers
- H100 pricing: gpu-radar (2026-11-08 live Vast.ai), gpurentwatch (2026-11-07), thundercompute (2026-11-04), lambda.ai, runpod.io, modal.com/pricing, computeprices.com (Shadeform), lambda.ai/instances
- Wan2.1 T4/4060 slowness: https://github.com/Wan-Video/Wan2.1/issues/555 · https://github.com/rivas-vega/wan2.1-t4-colab
- Long-form workflow: https://www.aimagicx.com/blog/long-form-ai-video-character-consistency-guide-2026 · https://runway.com/resources/long-form-ai-video-generator · https://genmagic.co/blog/consistent-characters-ai-video
