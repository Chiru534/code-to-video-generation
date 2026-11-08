# Blender-S1 — Baseline Truth Audit
**Document ID:** `BLENDER-S1-DOC-AUD-001`  
**Version:** `1.0.0`  
**Date:** November 3, 2026  
**Status:** Canonical Truth Audit & Repository Baseline  
**Authority:** Master Execution Blueprint (§18 Task 1 & §39)

---

## 1. Executive Baseline Summary

This audit establishes the empirical truth of the Blender-S1 repository (`d:\New folder`) as of November 3, 2026. Every statement in this document is derived from direct source code inspection, cryptographic hashing of checkpoint binaries, schema analysis, and verified disk artifacts.

### Key Audit Findings
1. **Model Parameter Baseline:** The active neural policy is **Blender-S1 v5** (`blender_s1_v5_pilot.pt`), comprising exactly **119 tensors and 1,689,173 parameters** (~1.69M parameters). It was warm-started from the v4.2 baseline (95 tensors, 1,606,064 parameters) with 99.2% parameter retention.
2. **Action Vocabulary (0–47):** Exactly **48 discrete action IDs** are defined across four historical phases (12 scene actions, 12 character rigging actions, 12 character animation actions, and 12 physical simulation actions).
3. **Checkpoints Preserved:** All **five historical neural checkpoints** (v3, v4, v4.1, v4.2, v5) exist in `checkpoints/` with verified SHA256 hashes.
4. **Phase 8 Implementation:** The Phase 8 production engine (`blender_s1_v8/`) is implemented on disk with **12 versioned Pydantic schemas**, a 16-stage state machine orchestrator, an asset registry, an audio production engine, and an FFmpeg video assembly engine.
5. **Verified Film Deliverable:** The 15-second capability test film [`NOVA_FIRST_CONTACT_15S.mp4`](file:///d:/New%20folder/phase8_nova_capability_test/NOVA_FIRST_CONTACT_15S.mp4) is present on disk (3,977,896 bytes, SHA256: `f7c6e270...`) with verified sub-millimeter contact ($\Delta d = 0.076\text{ mm}$) and 81.19%–90.23% color saturation.

---

## 2. Repository Layout & Module Inventory

```
d:/New folder/
├── .agents/skills/                   # Workspace-discovered skills
│   ├── blender-s1/SKILL.md           # Master Project Skill (v1.0.0, 65.8 KB)
│   └── blender-s1-director/SKILL.md  # Creative Director Runbook
├── blender_s1_v8/                    # Phase 8 Production Engine Implementation
│   ├── __init__.py                   # Package exports
│   ├── schemas.py                    # 12 Versioned Pydantic Schemas (v1.0.0)
│   ├── parent_llm.py                 # Provider-independent LLMClient & Role Prompts
│   ├── orchestrator.py               # 16-Stage Persistent State Machine
│   ├── asset_registry.py             # Persistent Asset Continuity Database
│   ├── audio_engine.py               # Dialogue stems, SFX, and subtitle builder
│   └── video_assembly.py             # FFmpeg multi-track video mastering
├── checkpoints/                      # Preserved Frozen Neural Policy Weights
│   ├── blender_s1_v3_character_rigging.pt     (5,838,982 bytes, SHA256: 705107B2...)
│   ├── blender_s1_v4_animation_pilot.pt       (6,004,510 bytes, SHA256: 8F4B71E3...)
│   ├── blender_s1_v4_1_continuous_motion.pt   (6,459,656 bytes, SHA256: 5AFFBB45...)
│   ├── blender_s1_v4_2_motion_intelligence.pt (6,459,858 bytes, SHA256: 1FD7FE17...)
│   ├── blender_s1_v5_pilot.pt                 (6,798,573 bytes, SHA256: 79AC9D5C...)
│   ├── normalization_stats.json               (Per-parameter dataset empirical stats)
│   ├── normalization_stats_v4_2.json          (v4.2 parameter normalization bounds)
│   └── weight_transfer_audit.json             (Parameter lineage audit)
├── docs/                             # Authoritative Documentation Hub
│   ├── MASTER_EXECUTION_BLUEPRINT.md          # Master Execution Blueprint
│   ├── BASELINE_AUDIT.md                      # This Truth Audit document
│   ├── PHASE_8_CONTRACT_MAP.md                # Contract & Schema Architecture Map
│   ├── PROTECTED_ARTIFACTS.md                 # Checkpoint hashes & freezing bounds
│   ├── EXISTING_BENCHMARK_REPRODUCTION.md     # Reproduction records across all phases
│   ├── FIRST_VERTICAL_SLICE_PLAN.md           # Gate 1 execution plan
│   ├── EXTERNAL_TECHNOLOGY_REGISTRY.md        # 18-technology evaluation registry
│   ├── TECHNOLOGY_ADOPTION_MATRIX.md          # 5-tier classification matrix
│   ├── LICENSE_AND_COMPLIANCE_MATRIX.md       # IP & copyleft compliance
│   ├── HARDWARE_AND_RESOURCE_COMPATIBILITY.md # Hardware & VRAM constraints
│   ├── INTEGRATION_GAP_ANALYSIS.md            # Gap & adapter definitions
│   ├── BLENDER_S1_MINIMAL_PRODUCTION_POC.md   # 15s POC specification
│   ├── UPDATED_IMPLEMENTATION_ROADMAP.md      # 149-hour fast track
│   ├── PROJECT_HISTORY_AND_PHASE_AUDIT.md     # History across Phases 1–8
│   └── SKILLS_AND_CONTRACTS_GUIDE.md          # Skills operational rules
├── phase8_nova_capability_test/      # Nova First Contact Deliverables
│   ├── NOVA_FIRST_CONTACT_15S.mp4    # Master film (15.000s, 360 frames @ 24 fps)
│   ├── NOVA_FIRST_CONTACT_15S.srt    # Synchronized subtitles
│   ├── NOVA_FIRST_CONTACT_SCENE.blend# 360-frame production scene
│   ├── 3d_assets/                    # Character, Quantum Core prop, Lab
│   ├── audio/                        # Dialogue, procedural SFX, ambient drone
│   ├── logs/                         # Parent LLM & policy decision traces
│   ├── previews/                     # Full-color frame captures
│   ├── reports/                      # ffprobe, material, contact, and rig reports
│   └── production_manifest.json      # Cryptographic SHA256 deliverable manifest
├── phase8_production_v2/             # 60-Second Multi-Shot Reference Film
│   └── FINAL_QUANTUM_CORE_60S.mp4    # 60.00s film (1,440 frames @ 24 fps)
├── reports/                          # Historical Technical Architecture & Pilot Reports
└── skills/                           # Portable Skill Distribution Packages
```

---

## 3. Neural Architecture & 1.69M Model Inventory

### 3.1 Model Lineage & Architecture Evolution
The neural execution policy is a customized Transformer encoder with query-conditioned dynamic pointer networks and typed continuous parameter heads:

```
Input Tokens:
  - Task Vector (R^48) ───► task_proj (R^192)
  - Global State (R^32) ──► global_proj (R^192)
  - Object Candidates ────► cand_proj (R^192)
  - Bone Tokens ──────────► bone_proj (R^192)
       │
       ▼
Transformer Backbone:
  - 4 Layers, d_model = 192, nhead = 4, dim_feedforward = 512, GELU
  - Parameter Count: 1,385,216 parameters (100% warm-started across v3, v4, v4.1, v4.2, v5)
       │
       ├─────────────────────────┬─────────────────────────┬─────────────────────────┐
       ▼                         ▼                         ▼                         ▼
  Action Head (R^48)       Object Pointer            Bone Pointer              Continuous Heads
  48 Discrete Actions      Cross-attention query     Cross-attention query     - trans_head (3D: dx, dy, dz)
  (44,388 params)          (37,440 params)           (37,440 params)           - rot_head (6D Ortho: SO(3))
                                                                               - frame_head (1D: delta_frame)
                                                                               - scalar_head (2D: shape/influence)
                                                                               - physics_heads (5 heads, 90,587 params)
```

### 3.2 Exact Checkpoint Parameter Audit

| Checkpoint File | Status | Tensors | Total Parameters | Warm-Start Source | Parameter Retention | SHA256 Checksum |
|---|---|---|---|---|---|---|
| `blender_s1_v3_character_rigging.pt` | Preserved | 81 | 1,462,112 | Fresh / Phase 3 | Baseline Rigging | `705107B2...` |
| `blender_s1_v4_animation_pilot.pt` | Preserved | 87 | 1,512,384 | v3 Checkpoint | 96.8% | `8F4B71E3...` |
| `blender_s1_v4_1_continuous_motion.pt`| Preserved | 95 | 1,606,064 | v4 Checkpoint | 98.4% | `5AFFBB45...` |
| `blender_s1_v4_2_motion_intelligence.pt`| Preserved| 95 | 1,606,064 | v4.1 Checkpoint | 100% Direct | `1FD7FE17...` |
| `blender_s1_v5_pilot.pt` | **Active** | **119** | **1,689,173** | **v4.2 Checkpoint** | **99.2%** | **`79AC9D5C...`** |

*Note on 1.69M count:* `1,689,173` parameters is precisely the verified count of `blender_s1_v5_pilot.pt`. It is mathematically audited in `reports/blender_s1_v5_parameter_transfer_audit.json`.

---

## 4. Frozen 48-Action Vocabulary (Actions 0–47)

The 48 actions represent the immutable execution contract. No action ID may be renumbered or repurposed.

```
+-------+-------------------------------+---------+-------------------------------------------------------------+
| Index | Action Name                   | Phase   | Semantic Execution Responsibility                           |
+-------+-------------------------------+---------+-------------------------------------------------------------+
| 0     | CREATE_OBJECT                 | Phase 4 | Instantiates geometric primitive (Cube, Sphere, Cylinder)   |
| 1     | SET_LOCATION                  | Phase 4 | Applies 3D Cartesian translation in world space             |
| 2     | SET_ROTATION                  | Phase 4 | Sets Euler rotation via continuous 6D SO(3) representation  |
| 3     | SET_SCALE                     | Phase 4 | Sets 3D scale factors (sx, sy, sz)                          |
| 4     | ASSIGN_MATERIAL               | Phase 4 | Links Principled BSDF shader and assigns color/roughness    |
| 5     | CREATE_CAMERA                 | Phase 4 | Spawns perspective camera object                            |
| 6     | SET_CAMERA_ACTIVE             | Phase 4 | Sets active scene rendering camera                          |
| 7     | CREATE_LIGHT                  | Phase 4 | Spawns light source (Point, Sun, Spot, Area)                |
| 8     | SET_LIGHT_ENERGY              | Phase 4 | Sets wattage / intensity and color temperature              |
| 9     | SET_KEYFRAME                  | Phase 4 | Inserts transformation keyframe on timeline                 |
| 10    | SET_FRAME_RANGE               | Phase 4 | Configures scene start_frame and end_frame                  |
| 11    | FINISH_SUBTASK                | Phase 4 | Terminal token for scene construction subtask               |
| 12    | CREATE_CHARACTER_PRIMITIVE    | Phase 5 | Generates anatomical character segment                      |
| 13    | ADD_MODIFIER                  | Phase 5 | Adds Subsurf, Mirror, or Solidify modifier                  |
| 14    | APPLY_MODIFIER                | Phase 5 | Bakes modifier stack to geometry                            |
| 15    | CREATE_ARMATURE               | Phase 5 | Instantiates skeletal armature object                       |
| 16    | ADD_BONE                      | Phase 5 | Creates bone with designated head, tail, and roll           |
| 17    | SET_BONE_TRANSFORM            | Phase 5 | Positions bone in edit/pose mode                            |
| 18    | BIND_MESH_ARMATURE            | Phase 5 | Parents mesh to armature with armature deform               |
| 19    | AUTO_ASSIGN_WEIGHTS           | Phase 5 | Executes automated heat-map vertex weight assignment        |
| 20    | SET_VERTEX_GROUP_WEIGHT       | Phase 5 | Fine-tunes bone vertex weights                              |
| 21    | ADD_IK_CONSTRAINT             | Phase 5 | Sets up Inverse Kinematics chain with pole vector target    |
| 22    | ADD_SHAPE_KEY                 | Phase 5 | Initializes facial or corrective shape key                  |
| 23    | SET_SHAPE_KEY_VALUE           | Phase 5 | Sets scalar intensity [0.0, 1.0] for shape key             |
| 24    | SET_BONE_POSE                 | Phase 6 | Rotates/translates pose bone for animation keying           |
| 25    | INSERT_POSE_KEYFRAME          | Phase 6 | Keyframes pose bone channels into Action strip              |
| 26    | SETUP_DYNAMIC_CONSTRAINT      | Phase 6 | Configures Floor, Damped Track, or Child Of constraint      |
| 27    | KEYFRAME_CONSTRAINT_INFLUENCE | Phase 6 | Animates constraint influence scalar [0.0, 1.0]             |
| 28    | SET_FACIAL_EXPRESSION         | Phase 6 | Blends multi-channel visemes and emotional shape keys       |
| 29    | INSERT_SHAPE_KEYFRAME         | Phase 6 | Keyframes facial expression on timeline                     |
| 30    | ASSIGN_ACTION_SLOT            | Phase 6 | Pushes Action into Non-Linear Animation (NLA) track        |
| 31    | CONFIGURE_MOTION_RANGE        | Phase 6 | Adjusts NLA strip in/out points and extrapolation           |
| 32    | BLEND_ANIMATION_CLIPS         | Phase 6 | Cross-fades overlapping NLA motion strips                   |
| 33    | CORRECT_ANIMATION_DRIFT       | Phase 6 | Compensates for root-motion position accumulation           |
| 34    | RESOLVE_MESH_PENETRATION      | Phase 6 | Fixes self-intersection during complex poses               |
| 35    | COMPLETE_ANIMATION_SEQUENCE   | Phase 6 | Terminal token for character animation episode              |
| 36    | ADD_RIGID_BODY                | Phase 7 | Enables Bullet rigid body physics simulation on object      |
| 37    | CONFIGURE_RIGID_BODY          | Phase 7 | Parameterizes mass, friction, restitution, collision shape  |
| 38    | APPLY_PHYSICAL_IMPULSE        | Phase 7 | Injects linear impulse (dp) or angular torque (tau)         |
| 39    | ATTACH_PHYSICS_CONSTRAINT     | Phase 7 | Attaches physical joint (Hinge, Slider, Spring, Point)      |
| 40    | SET_KINEMATIC_HANDOFF         | Phase 7 | Transitions object between animated and dynamic states       |
| 41    | TRIGGER_PHYSICS_BAKE          | Phase 7 | Executes deterministic point-cache physics bake             |
| 42    | ADD_COLLISION_DEFLECTOR       | Phase 7 | Configures passive collision boundary on obstacle mesh      |
| 43    | CREATE_CLOTH_SYSTEM           | Phase 7 | Adds cloth modifier to garment mesh                         |
| 44    | CONFIGURE_CLOTH_PROPERTIES    | Phase 7 | Parameterizes tension, compression, bending, structural mass|
| 45    | SETUP_CLOTH_COLLISION         | Phase 7 | Configures object and self-collision thickness margins       |
| 46    | RESOLVE_PHYSICS_EXPLOSION     | Phase 7 | Recovers from simulation tunneling or vertex instability    |
| 47    | COMPLETE_PHYSICAL_TASK        | Phase 7 | Terminal success token for physical interaction episode     |
+-------+-------------------------------+---------+-------------------------------------------------------------+
```

---

## 5. State Observer & Action Executor Analysis

### 5.1 State Observer Contract
The State Observer inspects the live Blender scene graph and extracts a fixed-dimension observation vector:
- **Global Context Vector ($\mathbb{R}^{32}$):** Frame number, active camera distance, primary light intensity, physics gravity vector, active physics step.
- **Candidate Object Array ($N_{\text{obj}} \times \mathbb{R}^{32}$):** Position $(x, y, z)$, bounding box dimensions, velocity, collision flags, material flags.
- **Bone State Array ($N_{\text{bone}} \times \mathbb{R}^{24}$):** Head coordinate, tail coordinate, quaternion rotation relative to parent, IK target distance.
- **Task Goal Vector ($\mathbb{R}^{48}$):** One-hot or semantic target encoding from Layer 2 Orchestrator.

### 5.2 Action Executor Contract
The Action Executor receives policy predictions, validates preconditions, applies clamping, and dispatches deterministic Python commands into Blender runtime:
- **Precondition Verification:** Validates that target objects/bones exist and active modes (EDIT, POSE, OBJECT) match required state.
- **Continuous Parameter Clamping:** Translations clamped to $[-\Delta x_{\max}, \Delta x_{\max}]$; 6D rotations orthonormalized into valid $\text{SO}(3)$ rotation matrices; timeline advances clamped to $\Delta t \ge 1$.
- **Postcondition Verification:** Queries scene graph immediately after execution to verify state change.

---

## 6. Reproducible Benchmark Evidence vs. Reported Claims

| Phase / Milestone | Reported Claim | Verified Artifact on Disk | Status |
|---|---|---|---|
| **Phase 4.2 Benchmark** | Continuous parameter heads & motion baseline | `PHASE_4_2_BENCHMARK_SUMMARY.md` | **Verified** |
| **Phase 6.1 Acceptance** | Character animation & NLA action slotting | `checkpoints/phase6_1_acceptance_benchmark_report.json` | **Verified** |
| **Phase 6.2 (200 Episodes)**| 200-episode continuous motion intelligence | `checkpoints/phase6_2_200episodes_benchmark_report.json` | **Verified** |
| **Phase 6.3 (100 Episodes)**| Mixed production 100-episode evaluation | `reports/phase6_3_mixed_production_100_summary.json` | **Verified** |
| **Phase 7 Physics Pilot** | 48/50 successes (96.0%), 96.4% replay retention | `reports/PHASE_7_PILOT_EVALUATION_REPORT.md` | **Verified** |
| **Phase 8 Nova First Contact** | 15s film, 0.076mm touch error, 81–90% color QA | `phase8_nova_capability_test/NOVA_FIRST_CONTACT_15S.mp4` | **Verified** |
| **500-Task / 1500-Run Study** | Broad generalization evaluation discussed in chat | *No consolidated JSON artifact found in repository* | **Unverified (Chat discussion only)** |

*Important Finding:* The reported 500-task / 1500-run generalization study was mentioned in project conversations, but no matching aggregated JSON report exists in `reports/` or `checkpoints/`. In strict accordance with the Blueprint, this claim is classified as **Unverified** and must not be cited as a proven score until reproduced.

---

## 7. Prioritized Gap Report & Gate 1 Smallest Safe Implementation

### Gap 1: Headless Blender Tool Communication (Priority: Critical)
- **Current State:** Phase 8 tests operated by launching inline Python scripts via subprocess or Colab tunnels.
- **The Gap:** Antigravity needs a dependable, repeatable way to inspect and mutate Blender scenes without launching raw unconstrained code.
- **Smallest Safe Implementation for Gate 1:**
  Deploy the **Official Blender Lab MCP** minimal TCP socket (binding to `127.0.0.1:12701`), exposing a typed 7-call interface:
  1. `inspect_scene()`
  2. `load_asset(filepath, collection)`
  3. `apply_transform(object_name, loc, rot, scale)`
  4. `configure_camera(loc, rot, focal_length)`
  5. `render_preview(frame_number, output_path)`
  6. `validate_and_save(filepath)`
  7. `restore_checkpoint(filepath)`
  *Fallback:* Controlled background Python runner (`run_blender_task.py`) that executes pre-templated scripts with structured JSON results.

### Gap 2: Character Topology & Mesh Deformation (Priority: High)
- **Current State:** Nova in Phase 8 used procedural primitive shapes grouped under an armature.
- **The Gap:** Lacks photorealistic quad topology, anatomically correct eyelid/mouth edge loops, and natural skin shading.
- **Resolution:** Gate 2 will evaluate an MPFB2 procedural quad mesh against a pre-rigged licensed human asset.

### Gap 3: Natural Locomotion without Joint Flips (Priority: Medium)
- **Current State:** Hand reach is verified with sub-millimeter precision ($0.076\text{ mm}$), but walking motion requires natural human mocap data.
- **Resolution:** Gate 3 integrates curated BVH locomotion clips with Rigify retargeting and deterministic IK touch locking.

