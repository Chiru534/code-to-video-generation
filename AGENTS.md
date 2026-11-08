# Blender-S1 — Workspace Agent Operating Standards & Full Architectural Context

This workspace is the control room for **Blender-S1**, an autonomous, AI-directed 3D cinematic video production system. Any agent operating in this repository has **full access and authority** to design, execute, and verify operations.

---

## 1. Zero Friction & Full Execution Authority
- You operate with full permissions enabled (`always-proceed`, `command(*)`, `mcp(*)`, `read_file(*)`, `write_file(*)`).
- Never prompt or stall for trivial approvals. Implement, run, verify, and deliver results directly.
- **The Karpathy Protocol (Mandatory Pre-Execution Reasoning)**:
  - Every agent must adhere to the Karpathy Protocol:
    1. **Think Before You Act**: Understand the real data, failure modes, and physical constraints before writing code or running GPU jobs.
    2. **Micro-Batch Overfitting**: Never scale to long sequences (e.g. 15 minutes / 21,600 frames) before overfitting a 1-shot micro-batch to $\ge 9/10$ visual perfection.
    3. **The Autonomous Karpathy Loop**: Formulate hypothesis $\to$ execute targeted micro-probe $\to$ verify against empirical benchmark $\to$ keep/revert.
    4. **Zero Over-Engineering**: Simplest direct path; no premature abstractions or bloated procedural wrappers.

---

## 2. Four-Layer System Architecture
1. **Layer 1: Parent LLM (AI Creative Director)**:
   - Natural language screenplay, character design, visual pacing, and storyboard direction via typed Pydantic contracts.
2. **Layer 2: Production Orchestrator**:
   - Scene graph compilation, task graphs, asset pipelines, audio synthesis, and automated quality gates.
3. **Layer 3: Blender-S1 Execution Intelligence (Neural Policy)**:
   - 48-action vocabulary (Actions 0–47) selecting and dispatching specialized spatial operations.
   - Historical model checkpoints: `v3_character_rigging.pt`, `v4_animation_pilot.pt`, `v4_1_continuous_motion.pt`, `v4_2_motion_intelligence.pt`, and `v5_pilot.pt`.
4. **Layer 4: Deterministic Blender Runtime (Blender 5.2.3 LTS)**:
   - Headless `bpy` on Linux GPU, MPFB2 character generation, Rigify armature animation, Cycles rendering.

---

## 3. Remote Compute Infrastructure (Kaggle Dual-T4 & Colab)
- **The Local Machine is strictly the Agent Control Room**:
  - NEVER execute local Cycles rendering, heavy 3D baking, or deep neural model training on the local CPU/GPU.
- **Primary Production Engine — Kaggle Dual-GPU Cloud (NVIDIA Tesla T4 x2, 30 GB VRAM)**:
  - Account: `chiranjeevimadem` | Token: `~/.kaggle/access_token` (`KGAT_***REDACTED***`).
  - Managed autonomously via [`scripts/kaggle_manager.py`](file:///d:/New%20folder/scripts/kaggle_manager.py).
  - Advantages: **2x T4 GPUs**, **12-hour continuous background execution** (runs with local laptop closed), **zero browser popups**.
- **Secondary Engine — Google Colab (Tesla T4, 15.36 GB VRAM)**:
  - Controlled remotely via the `colab-mcp` MCP server (Port: 53957).
- **Persistent Cloud Studio Storage (Google Drive & Kaggle Outputs)**:
  - Base Directory: `<DRIVE_MOUNT>/blender_s1/` (Folder ID: `<DRIVE_FOLDER_ID>`).
  - Service Account: `<SERVICE_ACCOUNT_EMAIL>` (Key: `<service-account-key.json>`).
  - Always verify presence and size via `os.path.exists()` and `os.path.getsize()` before reporting completion.

---

## 4. The Zero-Waste Studio Protocol (Strict Quality & Efficiency Mandate)
Any agent operating in this repository must strictly adhere to the Zero-Waste Studio Protocol:
1. **The Lookdev Gate (Zero GPU Waste Policy)**:
   - NEVER batch-render an entire act or multi-minute sequence without first rendering and inspecting **1 still frame per shot (Lookdev)**.
   - Verify: (a) Character Nova is true humanoid rig (no geometric block primitives); (b) Technical graphics display real labeled schematics, flowing particles, and numeric matrix math; (c) HSV saturation $\ge 25\%$; (d) Camera compositions are cinematic.
   - Only when keyframe stills are visually confirmed do we dispatch the batch animation render.
2. **Dual-GPU Parallel Splitting (2x Speed)**:
   - On Kaggle, dispatch two parallel Blender processes:
     - Worker 0 (`CUDA_VISIBLE_DEVICES=0`): Renders odd frames (`1, 3, 5, 7...`).
     - Worker 1 (`CUDA_VISIBLE_DEVICES=1`): Renders even frames (`2, 4, 6, 8...`).
3. **High-Speed Studio PBR Engine**:
   - For 15-minute productions (21,600 frames at 24 fps), use Blender Hardware Studio PBR / Workbench engine (~0.12–0.15s per frame).
   - The entire 15-minute documentary renders in **under 30 minutes total compute time**, consuming less than 1 hour of weekly GPU quota.
4. **Cinematic Pacing & Camera Direction**:
   - Cut camera angles every 4–7 seconds between presenter shots (Nova), macro die cutaways, and architectural diagrams.
   - Never hold static compositions for >8 seconds. Animate dynamic data flow:
     - Act 1: CPU vs GPU SM grid floorplan cutaway.
     - Act 2: Memory hierarchy & HBM3 stacked TSV bandwidth particle streaming.
     - Act 3: 3D Systolic MAC array with live cascading floating-point numbers.
     - Act 4: High-dimensional Transformer vector space and QKV attention heatmaps.
     - Act 5: Quantization lattice compression (FP32 $\to$ FP16 $\to$ INT8).
5. **Broadcast Audio Standards (Locked 10/10)**:
   - Calibrated integrated loudness: **-14.0 LUFS (EBU R128)**.
   - Dynamic sidechain ducking (-14 dB background score attenuation under speech).
   - Master audio: `master_audio_900s.wav` (900.0s exact duration).
   - Clean subtitles (`.srt`) without redundant `[Act X]:` prefixes.

---

## 5. Production Quality Standards
- **Resolution & Profile**: 1080p Full HD (1920×1080) at 12–20 Mbps (H.264 High Profile, yuv420p).
- **Audio Standards**: Broadcast-calibrated integrated loudness at **-14 LUFS**, with dynamic sidechain ducking of background music under narration.
- **Strict Full-Color Rule**: HSV saturation $\ge 25\%$; zero default grey untextured Blender materials.
- **Process Animation**: Never hold static compositions for >8 seconds. Animate dynamic data flow:
  - Split queues and task dispatch
  - Warp streaming and SIMT lockstep execution
  - Systolic MAC array cascading matrix multiplications
  - Token prefill vs. autoregressive decode heatmaps
- **Deliverables Package**:
  - Master `.mp4` video
  - Standalone `.srt` subtitles without redundant `[Act X]:` prefixes
  - `production_manifest.json` containing SHA256 hashes of all assets and renders

---

## 6. Operational Diagnostics & Troubleshooting Runbook

To prevent false alarms or confusion during cloud execution, any agent must refer to these documented root causes:

### 1. Blender Linux Engine Naming (`KeyError: key "engine" not found`)
- **Symptom:** Blender script exits immediately on Kaggle with `KeyError: 'bpy_prop_collection[key]: key "engine" not found'`.
- **Root Cause:** When installing Blender via Ubuntu APT (`apt-get install -y blender`), the version installed is **Blender 4.0.2**. In Blender 4.0.x, the engine `BLENDER_EEVEE_NEXT` does not exist (it was introduced in 4.2).
- **Correct Rule:** Always set:
  ```python
  scene.render.engine = 'BLENDER_EEVEE' # or 'CYCLES' or 'BLENDER_WORKBENCH'
  ```

### 2. Network DNS Blips (`[Errno 11001] getaddrinfo failed`)
- **Symptom:** Local Python script fails with `urllib.error.URLError: <urlopen error [Errno 11001] getaddrinfo failed>`.
- **Root Cause:** A momentary local WiFi/DNS resolution drop between the laptop and Google/Kaggle APIs. It does NOT mean the Kaggle account or token is expired.
- **Resolution:** All network calls in `scripts/kaggle_manager.py` must use a 3-attempt exponential backoff retry before reporting an error.

### 3. Kaggle Slug Auto-Derivation (`HTTP 403 Permission 'kernels.get' denied`)
- **Symptom:** API returns `HTTP 403 Permission 'kernels.get' was denied` when querying kernel status.
- **Root Cause:** If `newTitle` has different words than `slug` (e.g. title: `Blender S1 Micro Batch Benchmark` vs slug: `blender-s1-micro-batch`), Kaggle's backend derives the slug from the title: `chiranjeevimadem/blender-s1-micro-batch-benchmark`. Querying the old slug looks like a non-existent/private kernel, triggering a misleading 403.
- **Resolution:** Always match `slug` and `newTitle` exactly, or use the exact `ref` returned in the JSON response from `POST /api/v1/kernels/push`.

---

## 7. Key Project Reference Locations
- `docs/MASTER_EXECUTION_BLUEPRINT.md`: Complete operational specification.
- `docs/PHASE_8_CONTRACT_MAP.md`: State machine and Pydantic schemas.
- `production/renders/The_Silicon_Engine_15Min_Master.mp4`: Release 15-minute 1080p master film.
- `checkpoints/`: Preserved neural policy models.

