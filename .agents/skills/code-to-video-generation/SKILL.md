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

## Episode pipeline (working as of 2026-11-09)

```
episodes.json                     registry: srcDir, audioDir, composition, output
  -> plan job resolves it into a matrix
  -> per episode, in parallel on GitHub Actions:
       narration.json -> tools/tts.py (Kokoro CPU) -> public/audio/<ep>/*.wav
                                                     -> src/<ep>/timings.json
       -> remotion render <composition>   (scene length = measured line + 0.4s)
       -> ffmpeg loudnorm I=-14           -> out/<output>.mp4
       -> tools/gdrive_upload.py          -> the human's Drive
Deterministic code renders only. No AI/diffusion video models anywhere in this pipeline.
```

**ZERO-WASTE RENDER POLICY (LOCKED — user decision 2026-11-09):** we are **not allowed
to render an already-existing video when rendering a new one. We only render episodes
**when we think we need to change the video**. Finished episodes are never re-rendered
implicitly; the plan job maps changed files to specific episodes and renders nothing
when no relevant change is detected. A manual `workflow_dispatch` with an explicit
episode is the deliberate escape hatch for an intentional re-render.

**Nothing renders on the laptop.** The laptop holds source only. TTS, render,
loudness and upload all run on the runner, and the runner's disk is destroyed
afterwards, so the only permanent copy is the Drive file. A local `out/*.mp4`
is a debugging artifact, never part of production.

## Proven render pipeline (verified 2026-11-09)

End-to-end on GitHub Actions, $0, no GPU. Repo: `Chiru534/code-to-video-generation`, `video/`.

```
narration.json (one line per scene)
  -> video/tools/tts.py --src-dir src/<ep> --audio-dir public/audio/<ep>
                         (Kokoro-82M ONNX, CPU)  -> public/audio/<ep>/*.wav
                                                 -> src/<ep>/timings.json
  -> Remotion reads timings  (scene length = measured line length + 0.4s)
  -> npx remotion render <composition>
  -> ffmpeg loudnorm I=-14:TP=-1.5:LRA=11  -> final MP4
  -> gdrive_upload.py                      -> Drive
```

Measured on a 4-core `ubuntu-latest` runner:

| Episode | Frames | Duration | Whole job |
|---|---|---|---|
| ep01 Finding the Address | 2910 | 97.0 s | ~6 min |
| ep02 The Handshake | 2718 | 94.5 s | ~6 min |

Both verified 1920×1080, 30 fps, H.264 + AAC 48 kHz stereo, **−14.1 / −14.2 LUFS**.
Episodes run as **parallel matrix jobs**, so two episodes cost roughly the wall
clock of one (~7 min total), not double.

### Non-obvious requirements (learned by failing)

- **`ffmpeg` is not preinstalled** on `ubuntu-latest` — apt-install it or the verify step dies with exit 127.
- Kokoro files: `thewh1teagle/kokoro-onnx` release tag `model-files-v1.1` → `kokoro-v1.0.onnx` (310 MB) + `voices-v1.0.bin` (27 MB). Wrapper is MIT, model is Apache-2.0 — commercial use OK.
- **Scene durations must come from measured audio**, never estimates. Otherwise narration drifts or gets truncated. `timings.json` is the single source of truth; the committed copy is only a fallback.
- `"resolveJsonModule": true` is required in `tsconfig.json` for the timings import.
- The workflow **fails the build if the MP4 has no audio stream** (`ffprobe -select_streams a`).
- Remotion and `@remotion/cli` must resolve to the same version — pin both to the same range.
- Audio is gitignored; it is regenerated deterministically by the TTS step on every run.
- **Audio must live in a per-episode folder.** Scene ids restart at `s01` in every
  episode, so a shared `public/audio/` lets episode 2 silently overwrite episode
  1's voice tracks — and every render still looks green. Paths are
  `public/audio/<ep>/`.
- **Adding an episode is a data change**, not a workflow change: create
  `src/<ep>/{narration.json,<Name>.tsx}`, register one `<Composition>` in
  `src/Root.tsx`, add 4 lines to `video/episodes.json`.
- A committed `timings.json` is required for an episode's first build because the
  composition imports it; bundling fails if it is missing. CI overwrites it with
  measured values before rendering, so a placeholder with `"note"` is fine.

### Lookdev: what frame review caught in episode 02

These scenes compiled, rendered, passed every automated check, and were still
wrong. Only looking at frames found them:

| Defect | Symptom in the video |
|---|---|
| packet loop hid finished packets | the wire sat empty for ~half of every loop |
| packet card wider than a hop box | it covered the machine it was describing, exactly at the moment of narration |
| container 180px narrower than the safe area | content hugged the left edge with a dead quarter-frame on the right |

Method, no extra dependencies: pull the artifact, then

```
ffmpeg -i in.mp4 -vf "select='eq(n\,165)+eq(n\,435)+...',scale=960:-1,tile=2x3" \
       -vsync 0 -frames:v 1 sheet.png
```

and read the sheet. One frame per shot, taken *after* the entrance animation
settles. Sizing rule of thumb at 1080p: scene elements below ~300 px read as
decoration, and mono text under 15 px is not legible on a phone.

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

Destination is chosen per render from the **measured duration**, not from config:

| Duration | Folder | Secret |
|---|---|---|
| under 180 s | `My Drive / blender_s1 / productions / shorts` | `GDRIVE_SHORTS_FOLDER_ID` = `1Uf3kapfkQ1lmAAWY7xLnelsBHzsPcSzw` |
| 180 s and up | `My Drive / blender_s1 / productions` | `GDRIVE_FOLDER_ID` = `1XA5f1asH3nMji3PBsUa6QP0_VJ1zucsD` |

`gdrive_upload.py` runs `ffprobe` on the file it is about to upload and routes on
the result, so the folder always matches the bytes. Threshold override:
`GDRIVE_SHORTS_MAX_SECONDS` (default `180`). The decision is logged on every run
(`folder : <id> [94.5s < 180s -> shorts folder]`), so it is never invisible.

`shorts/` exists because `productions/` also holds the Blender-S1 renders and
previews; short-form deliverables stay separate from the long-form work.

Moving a file in Drive changes its `parents` but keeps its `id`, so existing links
keep working and only the secret has to follow. **Move files and forget the
secret, and the next render finds no matching name in the old folder — so it
silently creates a duplicate.** Folder-scoped lookup is the whole reason the id
matters.

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

## Auditing a render (who checks the video)

An integrity gate is not a quality gate. The pipeline can prove the file is a
valid 1080p30 MP4 with audio and still ship a wrong, boring, or unreadable video.
Treat these as separate layers.

`video/tools/audit.py` is the implemented Layer 1 (2026-11-09). Stdlib-only, no
new dependencies. Run in CI twice per episode:

- **Audit (pre-flight)** — right after setup-python, before any spend:
  `python tools/audit.py --static`. Fails in seconds, not after a 7-minute render.
- **Audit (render)** — on the finished MP4, **before the Drive upload**:
  `python tools/audit.py --static --video out/<output> --episode <key>`.
  Nothing reaches Drive unless this passes.

What it enforces:

| Area | Checks |
|---|---|
| registry | `episodes.json` parses; every entry has all 5 fields; output filenames and audio directories **unique**; composition registered in `src/Root.tsx` |
| narration | every id has a timing and a wav; ids unique and contiguous; sec/frames/fps agree; `totalFrames` is the sum |
| staleness | committed `timings.json` text must equal `narration.json` text |
| determinism | the known **`?? 240` silent fallback** in `buildPlan()` is pre-empted — a missing scene id is a hard failure |
| consistency | slate `STEP n OF m` total matches the arc length stated in narration ("one step out of five"), and the step number matches the episode's position |
| render | 1920×1080, H.264 + yuv420p, ~30 fps, AAC 48 kHz; duration vs frames+tail timeline (±1 s); integrated loudness within −15.5…−12.5 LUFS |
| Drive | upload verifies md5 and byte size; `::notice::` prints routing and destination |

Both Layer 1 failure modes that shipped were reproduced locally and confirmed
red: reverting the slate to "OF 8", and deleting a scene from `timings.json`.
An audit that has never failed is not a gate — `audit.py` was negative-tested
against the exact bugs it exists to catch.

Not yet implemented (by design, optional): blackdetect, freezedetect, silencedetect,
OCR-vs-source comparison, saturation stats, per-scene frame-diff rates. The
implemented subset already blocks both known silent-corruption paths.

Rule of thumb: a green run now means **intact and self-consistent**, not
"correct, good, or publishable". Layers 2 and 3 still apply.

### Layer 2 — advisory only, never blocking

Taste has no ground truth and a vision model cannot be made deterministic. Use it
to annotate a run, never to gate it — a nondeterministic judge failing a
deterministic build is how you get a red job at 2 a.m. for no reason.

Free options already verified in this workspace:

- Gemini free tier, vision **input** (`gemini-2.5-flash`), ~1,500 req/day.
- Cloudflare Workers AI vision (`llama-3.2-11b-vision`), ~10k neurons/day.

Careful with the distinction: Gemini **image generation** ("Nano Banana") is paid
tier only; Gemini **vision understanding** on the free tier is not. Do not
conflate them.

### Layer 3 — the human

Voice pleasantness, whether the explanation lands, whether it deserves publishing.
Not delegable. Keep it to ~30 s per video by making layers 1–2 trustworthy first.

### The self-review trap

The agent that wrote the scenes must not be the only auditor: it will pass its own
mistakes, because they look correct to it. If a reviewer agent is used, give it a
**fresh context and an adversarial brief** ("find what is wrong"), not a
confirmation brief ("check this is good").

**Status:** Layer 1 is designed but not implemented. Until it exists, a green run
means the file is intact, not that the video is right.

## Also read

- `GOOGLE_DRIVE.md` — Drive storage, current authorization **BROKEN** (needs re-authorization; see file)
- GitHub repo for the full source tree and earlier feasibility reports

## When the user says "work on the channel"

1. Align on the episode/video topic first.
2. Prefer deterministic renders over AI footage.
3. Count Kaggle T4 quota spend before dispatching any GPU job.
4. Respect YouTube policy (no inauthentic spam).
5. Keep binaries in Drive, source in GitHub, secrets never in git.
