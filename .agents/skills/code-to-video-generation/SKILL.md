---
name: code-to-video-generation
description: The plan for the "Code to Video Generation" YouTube channel and this folder. Use when working on channel strategy, the Remotion/Manim render pipeline, resource constraints (GitHub Actions, Kaggle CPU/T4), Google Drive permanent storage, or the publish workflow.
---

# Code to Video Generation — Folder Skill

**Goal:** Run a YouTube channel making technical "code → video" content at near-zero cost, built from deterministic programmatic rendering, with AI video only for hero shots.

## Canonical repo

- GitHub: `Chiru534/code-to-video-generation` (**public**, 6 commits as of 2026-11-08)
- Local working root: `D:\New folder`
- The repo is the backup. Drive is for binaries. GitHub is for source.

## What this folder is for

This folder is the **production workspace** for the channel:
setup, scripts, scenes, renders, and this skill survive here between sessions.
The external state (COVID of knowledge) lives in:
- GitHub (source of truth for code)
- Google Drive `blender_s1/` (permanent media storage — see `GOOGLE_DRIVE.md`)

## Verified resource inventory (tight constraints; use exactly these)

| Resource | Limits | Role |
|---|---|---|
| **GitHub Actions** (public repo) | 4-core Linux, 16 GB RAM, 14 GB SSD, **unlimited minutes** | CI + code-to-video rendering |
| **Kaggle CPU notebooks** | No quota, 12 h session, ~20 GB disk | Free render farm: TTS, FFmpeg, Manim/Remotion |
| **Kaggle dual T4** | **30 h/week** quota, resets Sat 00:00 UTC, 12 h cap | AI B-roll only: LivePortrait, FramePack, Wan2.2-TI2V-5B |
| **Kaggle TPU v5e-8** | Browser-only allocation; push-based returns CPU; no `torch_xla` | Parked — not usable for our PyTorch stack |
| **Kaggle P100** | Retired (Sept 2026) | Gone |
| **Google Drive 5 TB** | Drive media archive | Permanent storage for clips/audio/renders (details kept local) |
| **Local machine** | Control room only | No heavy rendering |

**Hard rule:** deterministic code-rendered visuals are free and unlimited; AI-generated footage is scarce. Budget T4 quota accordingly.

## Channel technical stack

| Layer | Tool | Why |
|---|---|---|
| Video scenes | **Remotion** (71k★, React→MP4) | Deterministic, free for individuals, CI-renders |
| Math/animations | **Manim CE** | 3Blue1Brown's visual language |
| Terminal demos | **VHS** (`charmbracelet/vhs`) | Scripted tape → MP4 |
| Diagrams | **D2 / Mermaid** | Code → diagram → animated in Remotion |
| Voiceover | **Kokoro-82M** / Qwen3-TTS (free) | CPU-runnable, no paid API |
| Stitch/loudness | **FFmpeg** + `loudnorm` (−14 LUFS) | YouTube delivery |
| Thumbnails | Ideogram (text) + Canva, Midjourney if budget | Click-through |

**Not using (why):** paid API video ($, off-budget), Wan2.1 full-film (~66 h/15 min), LTX-2.5 on T4 (4 failed runs), Seedance "open weights" repos (closed model / wrapper only), AnimateDiff (stale), Mochi-1 (480p only), 15-min neural video (not feasible on available hardware).

## Episode pipeline (target $0)

```
timecoded script → scenes (Remotion / Manim / VHS / D2)
  -> Kokoro voiceover (CPU)
  -> FFmpeg concat + loudnorm (-14 LUFS)
  -> GitHub Actions or Kaggle CPU render
  -> MP4 → GitHub Release → YouTube upload
Kaggle T4 only for 1–2 AI hero shots per episode, if at all
```

## Channel strategy (condensed, from multi-agent research)

- **Format:** faceless, one repeatable format, weekly cadence, human-edited scripts with a stance (not AI paraphrase).
- **Visual identity:** build the Shiki code-typing component in Remotion — your signature look (no off-the-shelf repo does this).
- **Policy:** YouTube "inauthentic content" ban (Jul 2025) — no template-spam mass production. AI disclosure only for realistic content; disclosure never blocks monetization.
- **Monetization:** 1,000 subs + 4,000 hrs (or 10M Shorts/90d). From Feb 2027: 8,000 hrs or 20M Shorts. Build long-form watch time.
- **Cost target:** $0–3 per 10-min video open-source stack.

## Also read

- `GOOGLE_DRIVE.md` — Drive storage, current authorization **BROKEN** (needs re-authorization; see file)
- GitHub repo for the full source tree and earlier feasibility reports

## When the user says "work on the channel"

1. Align on the episode/video topic first.
2. Prefer deterministic renders over AI footage.
3. Count Kaggle T4 quota spend before dispatching any GPU job.
4. Respect YouTube policy (no inauthentic spam).
5. Keep binaries in Drive, source in GitHub, secrets never in git.
