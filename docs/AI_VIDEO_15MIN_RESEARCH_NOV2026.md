# Agent A: THE OPTIMIST — 15 Minutes of AI-Generated Moving Video in 1–2 Hours
### Research report — 8 November 2026 (all prices verified 2026-11-04…08, URLs inline)

**Bottom line:** YES, a solo operator with a credit card can get 15 minutes of AI-generated moving video inside 1–2 hours *today* — but not as one coherent "film." The working unit of AI video in Nov 2026 is the **8–30 second shot**. 15 minutes = ~45–180 shots, concatenated with ffmpeg. Continuity (same character/wardrobe/scene across shots) is the thing that still breaks, not raw throughput or cost.

Compute math: 15 min @ 24 fps = 21,600 frames. 15 min @ 16 fps (Wan/LongLive native) = 14,400 frames.

---

## 1. Cloud GPU rental — cheapest H100/A100/4090 (verified Nov 2026)

| Provider | H100 80GB | 4090 | H200 | Notes | URL |
|---|---|---|---|---|---|
| **Vast.ai (marketplace)** | from **$1.87–2.00** PCIe/SXM, median $3.41, floor $2.55 (Nov 7) | **$0.33–0.41** | $2.93 NVL / $3.60 floor | cheapest, host-dependent reliability | computetick.com/gpu/h100; gpueconomy.com/providers/vast-ai |
| **RunPod Community** | **$1.99 PCIe / $2.69 SXM** | **$0.34** | **$3.59** | per-second billing, 1–2h rentals fine, Secure Cloud 4090 $0.89 | runpod.io/pricing |
| RunPod Secure | $2.89 PCIe / $3.99 SXM | $0.89 | $5.29 | 20% hike Oct 2026 noted | usagepricing.com |
| **Lambda** | 1× PCIe **$3.29**, 1× SXM **$4.29** (8× $3.99/GPU) | n/a | none published | no H200, billed per minute, new accounts have low quota | lambda.ai/instances; askgpu.com/lambda-pricing |
| **Modal (serverless)** | **$3.95/hr** GPU-only (H100 SXM5) | L4 $0.80 | $4.54 | instant scale-to-zero, best for parallel containers | modal.com/pricing |
| Replicate | $5.49/hr (H100, incl. RAM/CPU) | n/a | $5.49 | | replicate.com/pricing |
| Together AI dedicated | $5.49/hr (HGX H100), $3.99 on-demand clusters | n/a | contact | | docs.together.ai |
| SiliconLiquid aggregate | H100 cheapest $1.33, median $3.29 | $0.33 | n/a | 44 providers tracked | siliconliquid.com/prices |

**Answers:** cheapest verifiable H100 = **Vast.ai ~$1.87–2.00/hr** or **RunPod Community $1.99**. 1–2 hour rentals trivially allowed (RunPod bills per second; Lambda per minute). H200 availability is thin (Lambda: none; RunPod $3.59). 4090s at $0.33–0.89 are everywhere.

---

## 2. LongLive on H100 — real status (Nov 2026)

**LongLive 1.0 (the "20.7 FPS" paper):** 1.3B params (Wan2.1-T2V-1.3B fine-tuned), **20.7 FPS on one H100** (24.8 FPS FP8), up to **240 s per generation** on a single ≥40 GB GPU, **480p, 16 fps** output. Weights: huggingface.co/Efficient-Large-Model/LongLive-1.3B (**CC-BY-NC-4.0 — non-commercial**). Code: github.com/NVlabs/LongLive. Setup = torch 2.5.0 + CUDA 12.4 + flash-attn 2.7.4, 40+ GB VRAM, Linux.
- Sources: arxiv.org/abs/2509.22622 · hanlab.mit.edu/projects/longlive · nvidia research page (research.nvidia.com/labs/eai/publication/longlive/)
- **15-min wall time:** 14,400 frames @ 20.7 fps ≈ **~12 min of pure generation** (≈10 min @ FP8) + overhead. 240 s cap ⇒ **4 chained/stitched segments** (e.g. doc acts) or use interactive mode with per-shot prompts. **Cost: 1 H100-hour ≈ $2–3.** That is the cheapest path in this report.
- **Reproduction status:** paper accepted ICLR 2026; but GitHub Issue #51 (Apr 2026, open) reports VBench 83.95/83.65 vs claimed 84.87 — **community can't quite reproduce benchmark numbers**; nobody published an independent speed reproduction. Treat 20.7 FPS as "nvidia-internal, plausible, unverified externally."
- VAE decode/text-encode excluded from FPS claim (paper protocol).

**LongLive 2.0 (May 2026) — the current release:** Wan2.2-TI2V-5B-based, 720p-class, multi-shot, **24.8 FPS BF16 / 29.7 FP8 / 45.7 FPS NVFP4 on one GB200 (180 GB)**, requires H100/GB200-class (SM90+, ≥80 GB), NVFP4 needs SM100 (B200/GB200/GB300). T2V + I2V DMD-distilled. Release notes: github.com/NVlabs/LongLive (2026.05.13/07.08) · nvlabs.github.io/LongLive
- On H100 you get BF16/FP8 (FP8 path validated on SM90, torch 2.8.0+cu128, torchao 0.13.0). Exact H100 FPS for 2.0 is **not published**; GB200 numbers only. 5B ≈ 4–5× cost of 1.3B per frame — budget ~45–60 min H100 for 15 min output, still ≈ $3–5.
- License dual like Wan (check repo before commercial use).

**Stitching 240 s → 15 min:** run 4 generations with per-segment prompts (acts), then ffmpeg concat. Visual consistency across segments is good within a segment, weaker across; mitigate with identical style prompts + fixed seed + frame-sink behavior, or accept it (documentary cutaways are forgiving). **No audio generation** — add TTS/score separately.

---

## 3. API services — price/s, max clip, 15-min cost (verified Nov 2026)

**Sora 2 is DEAD** — shutdown 24 Sep 2026 (app died 26 Apr 2026). No replacement. (costgoat.com/pricing/sora; kavel.ai/blog/sora-alternatives-api-shutdown-2026; developers.openai.com/api/docs/guides/video-generation)

| Model (route) | $/s | Max clip | 900 s cost | Audio | 15-min notes |
|---|---|---|---|---|---|
| **Grok Imagine Video 1.5** (fal: xai/grok-imagine-video/v1.5) | **0.01** (I2V) | ~10 s? | **$9** | yes | cheapest advertised; quality unproven, verify before committing |
| **MiniMax H3 Max Turbo** (fal/Runway) | 0.025 | ≥5 s | $22.50 | yes | 480p |
| **PixVerse V6 720p silent** (fal/API) | **0.040** | **15 s** | **$36** | $0.0533/s on | 1080p $0.08 |
| Grok Imagine Video 1.5 Lite 720p (Runway Dev) | 0.03 | n/d | $27 | yes | 480p $0.02 |
| **Hailuo 02 Standard** (fal) | 0.025 | 6 s | $22.50 | limited | $0.0144 I2V |
| Vidu Q3 Turbo 540p (fal) | 0.0297 | 8 s | $27 | yes? | |
| **Veo 3.1 Lite 720p** (Google) | 0.05 | 8–10 s + **Scene Extension (+7 s steps)** | **$45** (1080p $0.08 → $72) | yes ($0.05) | charged only on success; extension extends same scene — continuity aid |
| **Wan 3.0 (Alibaba/Runway)** | 0.05 (480p) / 0.10 (720p) | **30 s** | $45 / $90 | yes | multi-shot in one prompt; 1080p $0.20; Prime $0.068/0.14/0.28 |
| **Kling 2.6 720p silent** | 0.042 | 10 s | $37.80 | — | +audio 1080p $0.14 |
| Kling 2.6 (official, w/ audio) 1080p | 0.14 | 10 s | $126 | yes | |
| Kling 3.0 720p silent / 1080p audio | 0.084 / 0.168 | 15 s | $75.60 / $151 | yes | 4K $0.42 |
| **Kling 4.0 720p (20% off till 30 Nov)** | 0.1256 | **30 s** | **$113** (1080p $169) | yes | 3–30 s clips, best-in-class motion control |
| **LTX-2.3 Fast 1080p** (fal) | 0.051 | 20 s | $45.90 | yes (joint A/V) | open weights too (Lightricks/LTX-2.3) |
| LTX-2.3 Pro 1080p (fal) | 0.068 | 10 s | $61 | yes | |
| Wan 2.5 Preview API (third parties) | 0.034–0.110 | 10 s | $30–99 | yes (lipsync) | 1080p native |
| Wan 2.7 (fal) | 0.085–0.15 | 15 s? | $76–135 | yes | |
| Kling v3 / O3 (fal) | 0.07–0.14 | 15–30 s | $63–126 | yes | |
| **Gen-4.5 (Runway)** | 0.12 | 10 s | $108 | no | Runway own model; Aleph 2.0 edit $0.28 |
| **FLUX 3 Video HD (BFL)** | 0.17 | **20 s** | $153 | yes | FHD $0.29 → **$261**; 4K $0.80; Draft **$0.06 → $54**; Video Continuation $0.41–0.53/s; 24 fps |
| Seedance 2.0 Mini 480p (fal) | ~0.007 $/1k tok (≈$0.07/s) | 10–30 s | ~$63 | yes | BytePlus direct 1080p $0.569/s → $512 |
| Seedance 2.0 720p (fal/Runway) | 0.30 | 30 s | ~$270 | yes | 2.5: $0.30/0.68 (Runway), ~$1.16 (fal 720p, 1,216 Elo) |
| Veo 3.1 Fast (Google direct) | 0.10 / 0.12 (1080p) | 8 s + ext | $90 / $108 | yes | fal endpoint deprecating ~17 Nov 2026 |
| Veo 3.1 Standard | 0.40 | 8 s + ext | $360 | yes | Lite/Fast = better value |
| Luma Ray3.2 720p (API) | eff. $0.09 | 10 s (+5 s extends ≤30 s) | $81 | no | 1080p $3.60/10 s |

(Sources: dev.runway.com/pricing · fal.ai/pricing · developers.openai.com (Sora deprecated) · aistudio Gemini pricing/Vertex Veo card ($0.40/$0.10/$0.05) · kling.ai/document-api/pricing/base/video.md · docs.bfl.ai/quick_start/pricing · docs.platform.pixverse.ai · lumalabs.ai/api · raytake.com · vidcost.com · litellm model pages.)

**15 minutes of 1080p with native audio via top-tier models ≈ $90–$360.** Sub-$50 for 720p entirely feasible. Add **20–30 % for unusable takes/retries** (Runway: moderated input *is* billed; fal/PixVerse: failures not billed; Google: charge only on success).

**Continuity toolbox:** Veo 3.1 Ingredients-to-Video + Scene Extension; Kling 4.0 reference-to-video ($0.157/s) & elements; Seedance 2.5 (up to 50 refs); FLUX 3 Video Continuation (continue ≤4 s of existing clip+audio, seamless); Wan 3.0 reference-to-video; I2V from a single locked character sheet = only reliable character lock available to a solo op.

---

## 4. Distributed parallel generation — realistic throughput

**Yes, this is the unlock.** The 15-min film is a parallel job, not a serial one.
- **fal.ai:** starts 2 concurrent; auto-scales to **40 concurrent self-serve** as you buy credits; queue never rejects, just waits. 120 shots ≈ **~15–40 min of generation** at 40-way parallelism (fal concurrency docs). 
- **Runway Dev tiers:** Tier 1 = **1 concurrent / 50 per day** (would blow the cap!) → Tier 2 (3 conc. / 500 day) after $50 spent, **Tier 3 (5 conc. / 1,000–2,000 day) after $100** — upgrades automatic, immediate. So a $100 top-up is mandatory, not optional (docs.dev.runwayml.com/usage/tiers).
- **Modal:** arbitrary parallelism (thousands of concurrent H100 containers), you ship code (e.g. your own ComfyUI/LongLive worker), $3.95/hr/H100; cold starts seconds.
- **Replicate:** hosted pipelines; 600 predictions/min; runs-time billed; now part of Cloudflare.

**Realistic plan:** 90–120 shots of 5–10 s, submit all at once, concat with ffmpeg, normalize to 1920×1080 + loudnorm → done within the hour. **The wall-clock bottleneck is human shot-QA + retakes, not GPUs.**

---

## 5. Newer / faster models (Nov 2026) — vs LongLive

| Model | Speed evidence | vs LongLive | Source |
|---|---|---|---|
| **TurboDiffusion (TurboWan2.1)** — arXiv Dec 2025 | **1.9 s** per 5 s clip (1.3B 480p, RTX 5090); **9.9 s** 14B-480p; **24 s** 14B-720p; 100–200× over vanilla. Diffusion-only, excludes VAE decode/T5 | Faster than LongLive per-clip; quality −ε; short clips only; English-long prompts | arxiv.org/html/2512.16093 · github.com/thu-ml/TurboDiffusion |
| **Lightning LoRA (Wan2.1/2.2, 4-step)** | 4 steps ≈ 146 s per 5 s clip on A100 (7.4× over 40 steps); H100 ~3 min (4090) | Still too slow for 180 clips on one GPU | qevos.ai blog; benoit.gouthiere.be |
| LongLive 2.0 | 24.8/45.7 FPS (GB200) | SOTA long-form real-time; needs GB200/H100 ≥80 GB | github.com/NVlabs/LongLive |
| **LTX-2.3 / LTX-2.5** (Lightricks, open weights, joint audio) | distilled ≈ **40–50 s per ~4 s 768×512 clip on 5090** (decode-bound); Lightricks claims ~4 s on H100; 2.5 "near real-time" | Best open joint A/V model; 20 s Fast mode; 720p/1080p/4K; 22B params; needs ≥32 GB VRAM (H100 fine); commercial license ≥$10M revenue | huggingface.co/Lightricks/LTX-2.3 · docs.ltx.io · reports/ltx-2.3 (omegaprime669) |
| Seedance 2.5 (ByteDance) | not self-host; API-only | quality King (1,216 Elo), 30 s clips | fal |
| Wan 2.2-TI2V-5B | 720p, 121 fr, 525 s on 4090 (unaccel.) | open Apache-2.0 | benoit.gouthiere.be comparison |
| Kandinsky 5 Lite | 139 s/5 s H100 (35 s distilled), MIT, 2B | niche | same |

**Verdict:** for a 1–2 h deadline with rented GPUs, **TurboDiffusion/LongLive-class self-host beats vanilla Wan 2.2 by 2 orders of magnitude**; LTX-2.5 is the open dark horse worth $4 of H100 time as a test.

---

## 6. Hybrid keyframe + interpolation (FLUX/SD3 + RIFE/FILM)

- **FLOOR: pure stills + RIFE/FILM** (no video model): FLUX.2/3 keyframes every ~2–4 s (~225–450 images, ~$11–22 or free locally), RIFE v4 (~35.4 dB PSNR, **100+ fps 1080p on RTX**) or FILM (35.9 dB, better large motion, ~5–30 fps) fill 8× frames → 24 fps film. **Cost ≈ $10–25, wall < 1 h.** Quality = "morphing slideshow / audiobook-with-visuals" — acceptable for doc voice-over w/ Ken-Burns cuts, **not** acceptable for talking heads or "moving video" in the demanding sense. RIFE breaks on occlusions/fast motion (ghosting); FILM better but 5–10× slower (RIFE vs FILM benchmark, apatero.com).
- **CEILING: keyframes + I2V bridges (the Captain Cinema pattern, ICLR 2026):** FLUX.3 keyframes → LTX/Wan/Kling I2V between adjacent keyframes (224 bridges × 4 s @ $0.05–0.10/s ≈ **$45–90** + keyframes **~$11** ≈ **$56–101**). Best narrative coherence/$ — this is how "short movie generation" works now (Captain Cinema, Seaweed-3B; en.papernotes.org). Commands: 24 fps, ffmpeg concat, SeedVR2/Real-ESRGAN upscale 720→1080p (minutes on H100).
- **vs diffusion video:** stills+RIFE ≈ 10–30× faster than naive diffusion but fundamentally fake motion; I2V-bridge ≈ same cost as plain API shots, far better coherence.

---

## RANKED TOP-3 PATHS (Nov 2026, with evidence)

### 🥇 Path 1 — API shot-assembly pipeline (fal.ai or Runway Dev) + Veo 3.1 Lite/PixVerse V6 + ffmpeg
- **What:** script 15-min doc as 90–120 shots; submit all in parallel (fal: 2→40 conc. after credit purchase; Runway: $100 top-up → Tier 3 = 5 conc./1,000 day); concat, loudnorm, upscale.
- **Throughput:** ~60–120 generated seconds/min wall at 10–20-way concurrency. **15 min done in ~45–75 min** including 25 % retake budget.
- **Cost:** cheapest decent (PixVerse V6 720p silent) **$36**; Veo 3.1 Lite 720p **$45**; Wan 3.0 480p **$45** (30 s shots!); MiniMax H3 Max **$45**; quality pick Kling 4.0 720p **$113** promo / FLUX 3 HD **$153**. Add ~25 % retries + $10–20 upscale ⇒ **≈ $60–190 all-in**.
- **What breaks:** character/wardrobe consistency across shots (use I2V from one locked reference); safety-filter refusals on some prompts (Runway bills moderated input; fal doesn't); Veo 3.1 fal endpoint deprecating ~17 Nov 2026; 8–10 s clip caps (Wan 3.0/Kling 4.0 30 s mitigate).
- **Links:** fal.ai/pricing · dev.runway.com/pricing · docs.dev.runwayml.com/usage/tiers · fal concurrency docs

### 🥈 Path 2 — Self-hosted LongLive 2.0 / 1.3B on 1 rented H100 (+ ffmpeg)
- **What:** `git clone NVlabs/LongLive`, download checkpoints, run 3–4 × 240 s segments (or 2.0 with multi-shot), concat.
- **Throughput:** 20.7 FPS (1.0, H100, 480p) → **15 min in ~12–15 min**; 2.0-FP8 on H100 fastest reasonable. 2.5 GB VAE decode extra.
- **Cost:** **$2–6 of H100** (RunPod Community $1.99/hr · Vast from $1.87 · Modal $3.95). **Cheapest by far.** 1 GPU suffices; 2 GPUs (odd/even frames) not needed at this speed but Vast has them cheap.
- **What breaks:** 480p (1.0) / 720p (2.0) only; **CC-BY-NC license (1.3B)** — non-commercial; VBench reproduction gap (Issue #51); 240 s/segment ceiling; setup time (torch 2.5.0/cu124, flash-attn build, 40–80 GB VRAM); no audio; motion quality = "good, not Kling/Veo."
- **Links:** github.com/NVlabs/LongLive · arxiv.org/abs/2509.22622 · huggingface.co/Efficient-Large-Model/LongLive-1.3B · DeepWiki 2-getting-started

### 🥉 Path 3 — Hybrid FLUX-3 keyframes → I2V bridge shots ("Captain Cinema" pipeline)
- **What:** GPT/Claude writes shot list; FLUX.3 (BFL API, $0.041–0.048/keyframe, 4K avail.) generates 225 locked keyframes (same ref char sheet); LTX-2.5/Kling I2V interpolates 4 s gaps at $0.05–0.10/s; ffmpeg + loudnorm; SeedVR2 upscale to 1080p.
- **Throughput:** keyframes ~10 min (parallel), bridges ~30–50 min at 10-way concurrency ⇒ **~60–90 min**.
- **Cost:** keyframes ~$11 + bridges ~$45–90 + upscale $0–10 ⇒ **≈ $60–110**.
- **What breaks:** keyframe→video motion can "bend" identity between frames (seed-lock + ref image mitigate); 224 I2V calls × failure rate; FLUX 3 = preview model (GA Aug 2026).
- **Links:** bfl.ai/pricing · docs.bfl.ai/flux_3/flux3_overview · en.papernotes.org (Captain Cinema) · apatero.com RIFE vs FILM

**Not ranked but noted:** LTX-2.5 self-host ($2–5 compute; unproven in-house, decode-bound on 5090 — test one H100-hour before committing); pure stills+RIFE ($10–25; slideshow quality — only if "moving Ken Burns" is acceptable).

---

## Cheapest path that actually works
**Path 2: LongLive-1.3B on one RunPod Community/Vast H100 ($1.99–2.00/hr) ≈ $3–6 total, ~45–60 min door-to-door** — real moving video, 240 s-consistent, 16 fps, 480p (upscale free-ish to 720p/1080p with SeedVR2). Caveats: NC license, 480p, prompt-tuning needed. If commercial rights + 720p are required: **Path 1 with PixVerse V6 720p silent = $36** (or Wan 3.0 480p $45) — same hour, license-clean, just weaker motion fidelity. **Best $/quality sweet spot for a polished doc film: Path 1 with Veo 3.1 Lite ($45) or Kling 4.0 promo ($113), delivered 1080p.**

## Honest assessment — solo operator, credit card, today
- **"15 minutes that moves and is watchable as documentary/explainer B-roll"** → **YES, reliably, for $36–150, in 1–2 hours.** Montage discipline (shots every 4–7 s, data-viz cutaways, no >8 s static holds) does the heavy lifting; AI motion hides under cuts.
- **"15 minutes of coherent single-character drama with lip-synced dialogue"** → **NO, not in 1–2 hours, not solo.** Character drift, lip-sync failure, and 45–180 generations' retry roulette make it a 1–2-day human-in-loop effort. Sora's death removed the only 20 s/shot safety margin.
- **LongLive path:** works today if you're comfortable with Linux/CUDA/conda and accept 480p + non-commercial license; unattended 240 s generations of *interactive multi-prompt* video genuinely work.
- **Failure budget:** plan 20–30 % unusable shots; automated retry-with-new-seed is mandatory; watch Runway moderated-input billing vs fal/PixVerse failure refunds.
- **For Blender-S1 specifically:** AI video should carry presenter B-roll/atmosphere only; the Act-1→5 schematics (SM grid, HBM TSV, systolic array, attention heatmaps, quantization lattice) must stay Blender-native — AI mangles technical typography. Use Path 1 for 15–30 % of shots, not the technical core.
- **Sora is gone (24 Sep 2026)**; **Veo 3.1 fal endpoint deprecating ~17 Nov 2026**; **Kling 4.0 promo ends 30 Nov 2026** — timing favors acting in Nov 2026.

### Cross-cutting "what will break"
1. Clip-length ceilings everywhere (8 s Veo / 10 s Gen-4.5 / 15 s PixVerse / 30 s Wan 3.0 & Kling 4.0) ⇒ mandatory concat + loudness/fps normalization.
2. Concurrency/daily caps until money is spent (Runway Tier 1 50/day; fal 2).
3. License traps (LongLive-1.3B CC-BY-NC; LTX-2.x community license; PixVerse/fal terms).
4. 16–24 fps native output ⇒ RIFE→24/60 fps upscale for broadcast or motion jitter.
5. GPU rental flakiness on marketplaces (Vast hosts vary; RunPod Community insecure-ish; Lambda quota new accounts).
6. Watermarks/provenance (Veo SynthID; PixVerse peas; keep masters clean by choosing accordingly).
7. Token-priced models (Seedance 2.0 Fast "per 1000 tokens") make $/s estimates unreliable — measure on first jobs.

### Key URLs
RunPod runpod.io/pricing · Lambda lambda.ai/instances · Vast gpueconomy.com/providers/vast-ai · Modal modal.com/pricing · Replicate replicate.com/pricing · LongLive github.com/NVlabs/LongLive + huggingface.co/Efficient-Large-Model/LongLive-1.3B · TurboDiffusion arxiv.org/html/2512.16093 · fal.ai/pricing · dev.runway.com/pricing · aistudio.google.com/docs/pricing (Veo 3.1) · bfl.ai/pricing (FLUX 3) · docs.platform.pixverse.ai · lumalabs.ai/api · kling.ai/document-api/pricing · costgoat.com/pricing/sora (shutdown) · apatero.com (RIFE vs FILM)
