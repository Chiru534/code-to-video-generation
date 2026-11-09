---
name: code-to-video-generation
description: The plan for the "Code to Video Generation" YouTube channel and this folder. Use when working on channel strategy, the Remotion/Manim render pipeline, resource constraints (GitHub Actions, Kaggle CPU/T4), Google Drive permanent storage, or the publish workflow. NO AI video models are allowed in this selection — all visuals are deterministic code renders only.
---

# Code to Video Generation — Folder Skill

**Goal:** Run a YouTube channel making technical "code → video" content at near-zero cost, built **entirely from deterministic programmatic rendering**.

**HARD PROHIBITION (user-stated, 2026-11-08): NO AI VIDEO MODELS ALLOWED IN THIS SELECTION.** No Wan2.2, LivePortrait, LTX, FramePack, Seedance, or any diffusion/generative video model — not even for "hero shots". Everything on screen must be produced by code: Remotion, Manim, D2/Mermaid, VHS, FFmpeg. No exceptions.

**Why (recorded):** We measured it on this hardware. Wan2.1-1.3B on dual T4: 3.06 s of clip in 810 s → ~66 h for 15 min. LTX-Video 2B produced unusable noise. LTX-2.5 22B failed 4× on T4 (path bug → install 504 → OutStream error → smplfitter import). TPU allocation needs your browser and still wouldn't reliably fit. 30 GPU-h/week T4 quota and no other paid GPU. The only way AI video happens here is rented H100/4090 hardware we do not have and do not have budget for. Re-evaluate only if that changes.

## Canonical repo

- GitHub: `Chiru534/code-to-video-generation` (**public**, clean single-bootstrap + import history, created 2026-11-08, zero secrets anywhere)
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
| **Kaggle dual T4** | **30 h/week** quota, resets Sat 00:00 UTC, 12 h cap | Compute headroom only — e.g. extra FFmpeg/Blender cycles, encoding; **never AI video models** |
| **Kaggle TPU v5e-8** | Browser-only allocation; push-based returns CPU; no `torch_xla` | Parked — not usable for our PyTorch stack |
| **Kaggle P100** | Retired (Sept 2026) | Gone |
| **Google Drive 5 TB** | Drive media archive | Permanent storage for clips/audio/renders (details kept local) |
| **Local machine** | Control room only | No heavy rendering |

**Hard rule:** deterministic code-rendered visuals are free and unlimited. AI-generated video footage is prohibited in this selection regardless of cost or convenience.

## Channel technical stack

| Layer | Tool | Why |
|---|---|---|
| Video scenes | **Remotion** (71k★, React→MP4) | Deterministic, free for individuals, CI-renders |
| Math/animations | **Manim CE** | 3Blue1Brown's visual language |
| Terminal demos | **VHS** (`charmbracelet/vhs`) | Scripted tape → MP4 |
| Diagrams | **D2 / Mermaid** | Code → diagram → animated in Remotion |
| Voiceover | **Kokoro-82M** / Qwen3-TTS (free) | CPU-runnable, no paid API |
| Stitch/loudness | **FFmpeg** + `loudnorm` (−14 LUFS) | YouTube delivery |
| Thumbnails | Ideogram (text) + Canva | Click-through (no Midjourney needed for code content) |

**Not using (why):** paid API video ($), Wan2.1/Wan2.2/LTX/any diffusion model (prohibited), Seedance "open weights" (closed model), AnimateDiff (stale), Mochi-1, 15-min neural video, AI lip-sync/Avatar (LivePortrait/MuseTalk/LatentSync) — all outside this selection.

## Episode pipeline (target $0)

```
timecoded script → scenes (Remotion / Manim / VHS / D2)
  -> Kokoro voiceover (CPU)
  -> FFmpeg concat + loudnorm (-14 LUFS)
  -> GitHub Actions or Kaggle CPU render
  -> MP4 → GitHub Release → YouTube upload
Deterministic code renders only. No AI/diffusion video models anywhere in this pipeline.
```

## Proven render pipeline (verified 2026-11-09)

End-to-end on GitHub Actions, $0, no GPU. Repo: `Chiru534/code-to-video-generation`, `video/`.

```
narration.json (one line per scene)
  -> video/tools/tts.py  (Kokoro-82M ONNX, CPU)  -> video/public/audio/*.wav
                                                 -> video/src/episode/timings.json
  -> Remotion reads timings  (scene length = measured line length + 0.4s)
  -> npx remotion render FindingTheAddress
  -> ffmpeg loudnorm I=-14:TP=-1.5:LRA=11  -> final MP4
```

Measured on a 4-core `ubuntu-latest` runner (episode 01, 2910 frames):

| Stage | Time |
|---|---|
| `npm ci` | ~50 s |
| Kokoro model (cached) | ~5 s cached, ~35 s cold |
| TTS, 10 lines / 93 s of audio | ~60 s |
| Remotion render, 1080p30 | ~200 s |
| loudnorm master | ~5 s |
| **whole job** | **~6 min** |

Output verified: 1920x1080, 30 fps, H.264 + AAC 48 kHz stereo, **−14.2 LUFS** integrated, LRA 2.4.

### Non-obvious requirements (learned by failing)

- **`ffmpeg` is not preinstalled** on `ubuntu-latest` — apt-install it or the verify step dies with exit 127.
- Kokoro files: `thewh1teagle/kokoro-onnx` release tag `model-files-v1.1` → `kokoro-v1.0.onnx` (310 MB) + `voices-v1.0.bin` (27 MB). Wrapper is MIT, model is Apache-2.0 — commercial use OK.
- **Scene durations must come from measured audio**, never estimates. Otherwise narration drifts or gets truncated. `timings.json` is the single source of truth; the committed copy is only a fallback.
- `"resolveJsonModule": true` is required in `tsconfig.json` for the timings import.
- The workflow **fails the build if the MP4 has no audio stream** (`ffprobe -select_streams a`).
- Remotion and `@remotion/cli` must resolve to the same version — pin both to the same range.
- Audio is gitignored; it is regenerated deterministically by the TTS step on every run.

## Channel strategy (condensed, from multi-agent research)

- **Format:** faceless, one repeatable format, weekly cadence, human-edited scripts with a stance (not AI paraphrase).
- **Visual identity:** build the Shiki code-typing component in Remotion — your signature look (no off-the-shelf repo does this).
- **Policy:** YouTube "inauthentic content" ban (Jul 2025) — no template-spam mass production. AI disclosure only for realistic content; disclosure never blocks monetization.
- **Monetization:** 1,000 subs + 4,000 hrs (or 10M Shorts/90d). From Feb 2027: 8,000 hrs or 20M Shorts. Build long-form watch time.
- **Cost target:** $0–3 per 10-min video open-source stack.

## Publishing renders to Google Drive

Goal: render finishes on Actions, the MP4 lands in Drive with no manual step.

### Use OAuth as the Drive owner. Not a service account.

Quota follows the **identity that creates the bytes**, not the folder:

```
m.chiranjeevi.adarsh@gmail.com            5.5 TB
antirgavity@blender-s1...serviceaccount      0 B
```

Sharing a folder with the service account as Writer gives it *permission* but not
*storage*. Every create still dies:

```
files.create -> 403 storageQuotaExceeded
  "Service Accounts do not have storage quota. Leverage shared drives, or use
   OAuth delegation instead."
```

Boundary measured empirically (2026-11-09), so nobody re-derives it:

| Operation | Service account |
|---|---|
| create folder | OK (0 bytes) |
| create 0-byte file | OK |
| create 2 KB file | 403 storageQuotaExceeded |
| force `owners` = human | 403 fieldNotWritable |
| transfer ownership to human | 403 consentRequiredForOwnershipTransfer |
| **update content of a human-owned file** | **OK** (bills the owner) |

### The working path: one-time consent, then create-or-update

`scripts/drive_authorize.py --client <client_secret_*.json>` opens consent, catches
the loopback redirect, and writes `~/.gdrive/authorized_user.json` (never in git).
Consent was granted 2026-11-09; verified: identity = the human, 5.5 TB quota,
`files.create` OK, `files.delete` OK.

`video/tools/gdrive_upload.py` then does create-or-update by name:

- name exists in the folder -> `files.update` (same link, new version, history kept)
- name absent -> `files.create` (OAuth only)

Secrets in `Chiru534/code-to-video-generation`:
`GDRIVE_REFRESH_TOKEN`, `GDRIVE_CLIENT_ID`, `GDRIVE_CLIENT_SECRET`,
`GDRIVE_FOLDER_ID`, plus `GDRIVE_SA_JSON` as an unused fallback.

It verifies size and md5 after upload, exits 0 with a `::warning::` when Drive is
unconfigured, and fails loudly once configured but broken — so a green job means
the file really landed.

Notes:
- OAuth **client** secrets are the app's credentials, not the user's permission.
  They do nothing until a human consents once.
- A refresh token is revocable at <https://myaccount.google.com/permissions>.
  Revoke it if the repo is ever compromised, then re-run the authorize script.
- Service-account fallback still works for slot-overwrite, but it can never create
  the first file, so it is not the primary path.

## Also read

- `GOOGLE_DRIVE.md` — Drive storage, current authorization **BROKEN** (needs re-authorization; see file)
- GitHub repo for the full source tree and earlier feasibility reports

## When the user says "work on the channel"

1. Align on the episode/video topic first.
2. Prefer deterministic renders over AI footage.
3. Count Kaggle T4 quota spend before dispatching any GPU job.
4. Respect YouTube policy (no inauthentic spam).
5. Keep binaries in Drive, source in GitHub, secrets never in git.
