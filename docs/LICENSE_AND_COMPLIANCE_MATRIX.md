# Blender-S1 — License & Compliance Matrix
**Document ID:** `BLENDER-S1-DOC-LIC-003`  
**Version:** `1.0.0`  
**Date:** November 3, 2026  
**Status:** Approved Legal & Compliance Specification  
**Preservation Authority:** Canonical Phase 8 Specification (`BLENDER-S1-P8-ARCH-001`)

---

## 1. Executive Legal Strategy & IP Boundaries

Blender-S1 maintains strict intellectual property hygiene. To ensure that Blender-S1's learned intelligence, checkpoints (1–5), 48-action policy, and proprietary orchestrator code remain unencumbered, all external technologies are audited across four distinct licensing dimensions:
1. **Code License:** Governs Python scripts, C++ extensions, and tool implementations.
2. **Model Weight License:** Governs pre-trained neural network parameters and checkpoints.
3. **Dataset License:** Governs the training corpora used to train models.
4. **Asset / Output License:** Governs the 3D meshes, textures, motion captures, audio stems, and rendered video frames.

```mermaid
graph TD
    subgraph Proprietary Core
        CORE["Blender-S1 Orchestrator & 48-Action Intelligence\n(Proprietary / Closed IP Protection)"]
    end
    
    subgraph Permissive Cloud Layer (Safe)
        CC0["Poly Haven Textures / HDRIs (CC0 1.0)\nMPFB2 Generated Meshes (CC0)\nMixamo / CMU BVH Motions (Royalty Free / CC BY)"]
        MIT["BlenderProc (MIT)\nMDM Code (MIT)\nOTIO (Apache 2.0)"]
    end
    
    subgraph Quarantined Subprocesses (Isolated via TCP / CLI)
        GPL["Blender 5.2.3 Runtime (GPL-3.0)\nBlender Lab TCP Socket (GPL-3.0)\nFFmpeg CLI (LGPL / GPL)"]
    end
    
    subgraph Forbidden / Viral (Strictly Excluded)
        AGPL["OpenMontage (AGPL-3.0)\n- Viral Copyleft Risk\n- REJECTED"]
        HUNYUAN["Hunyuan3D-2.1 Output\n- Terms Ban AI Training on Outputs\n- RESTRICTED"]
    end
    
    CORE <-->|Clean TCP / Subprocess Barrier| GPL
    CORE -->|Direct Ingestion| CC0
    CORE -->|Standard Library Bridge| MIT
    CORE x-.-x|BLOCKED| AGPL
    CORE x-.-x|BLOCKED FROM TRAINING| HUNYUAN
```

---

## 2. Multi-Dimensional License Audit Table

| Technology | Code License | Model Weights License | Dataset License | Asset / Output License | Commercial Usability | AI Training on Outputs Allowed? | Risk Classification |
|---|---|---|---|---|---|---|---|
| **Blender Lab MCP** | GPL-3.0 / MIT | N/A | N/A | N/A | Permitted via TCP barrier | N/A | **Low (Safe via socket)** |
| **BlendRelay MCP** | GPL-3.0 / MIT | N/A | N/A | N/A | Permitted via TCP barrier | N/A | **Low (Safe via socket)** |
| **Blender Agent** | GPL-3.0 | N/A | N/A | N/A | Quarantined (Study only) | N/A | **Medium (Do not vendor)** |
| **Poly Haven** | CC0 1.0 | N/A | N/A | **CC0 1.0 (Public Domain)** | **100% Unrestricted** | **Yes (Fully Permitted)** | **Zero (Green Light)** |
| **MPFB2** | GPL-3.0 | N/A | N/A | **CC0 (Public Domain)** | **100% Unrestricted** | **Yes (Fully Permitted)** | **Zero (Green Light)** |
| **MakeHuman (App)** | GPL-3.0 | N/A | N/A | CC0 | Permitted | Yes | Low |
| **Rigify** | GPL-3.0 | N/A | N/A | **Unrestricted (Public Domain)** | **100% Unrestricted** | **Yes (Fully Permitted)** | **Zero (Green Light)** |
| **CMU Mocap** | N/A | N/A | CC BY | **CC BY (Attribution Required)** | **Permitted** | **Yes (Fully Permitted)** | **Zero (Green Light)** |
| **Mixamo Library** | N/A | N/A | Adobe Terms | **Royalty-Free in 3D Projects** | **Permitted in Rendered Video** | **Restricted (Do not sell raw FBX)** | **Low (Safe for video)** |
| **MDM** | MIT | Non-Commercial | Academic (HumanML3D/KIT) | Unclear Academic Rights | **Research Only** | **Restricted** | **High (Kaggle sandbox only)** |
| **HumanML3D** | MIT | N/A | AMASS / KIT Non-Commercial | Academic Non-Commercial | Research Only | Research Only | High (Study only) |
| **BlenderProc** | MIT | N/A | Varies | Output Owned by User | **100% Permitted** | **Yes (Fully Permitted)** | **Zero (Green Light)** |
| **Kubric** | Apache-2.0 | N/A | Varies | Apache-2.0 | Permitted | Yes | Low (Study only) |
| **Hunyuan3D-2.1** | Tencent Community | Custom Commercial | Internal Tencent | **Subject to Community Terms** | Free under \$100k revenue | **STRICTLY FORBIDDEN (Section 4)** | **Severe (Training restriction)** |
| **OpenMontage** | **AGPL-3.0** | N/A | N/A | N/A | **Viral Copyleft Hazard** | N/A | **Fatal (Rejected)** |
| **Blender Cycles** | GPL-3.0 | N/A | N/A | **Unencumbered (User Owns Video)** | **100% Unrestricted** | **Yes (Fully Permitted)** | **Zero (Standard Tool)** |
| **FFmpeg** | LGPL-2.1+ / GPL | N/A | N/A | **User Owns Output Video** | **100% Permitted via CLI** | **Yes (Fully Permitted)** | **Zero (Standard Tool)** |
| **OpenTimelineIO** | Apache-2.0 | N/A | N/A | Apache-2.0 | **100% Unrestricted** | **Yes (Fully Permitted)** | **Zero (Green Light)** |
| **Flamenco** | GPL-3.0 | N/A | N/A | N/A | Permitted | N/A | Medium (Deferred) |

---

## 3. Critical Compliance Restrictions & Protocols

### 3.1 The Hunyuan3D-2.1 AI Training Ban (§4 Compliance)
- **The Legal Trap:** Section 2 of Tencent’s Hunyuan3D-2.1 Community License explicitly dictates that:
  > *"You shall not use the Output or any derivative work thereof to train, retrain, fine-tune, or improve any machine learning, artificial intelligence, or deep learning model or algorithm."*
- **Mandatory Enforcement:**
  - **Zero Training Data Ingestion:** No synthetic 3D meshes, point clouds, or multi-view depth maps rendered from Hunyuan3D models may ever be ingested into the Blender-S1 training corpus or used to train Blender-S1 policy checkpoints (v6, v7, etc.).
  - **Quarantine:** Hunyuan3D can only ever be used as an ephemeral visual prop in the final rendered video sequence, completely disconnected from dataset logging pipelines.

### 3.2 The AGPL-3.0 Viral Boundary (OpenMontage Quarantine)
- **The Legal Trap:** Affero General Public License v3 (AGPL-3.0) mandates that if any AGPL code is linked into a project or served across a network, the entire surrounding source code must be made public under AGPL-3.0.
- **Mandatory Enforcement:**
  - **Zero Repository Integration:** OpenMontage code must **never** be cloned, vendored, imported, or linked inside `d:\New folder`.
  - **Architectural Isolation:** Multi-track audio/video assembly is handled exclusively via clean-room Python scripts calling the standalone `ffmpeg` CLI binary through `subprocess.run()`. Under copyright law, invoking a standalone CLI binary creates an arms-length operational boundary that prevents GPL/AGPL infection.

### 3.3 MPFB2 and Rigify Asset Safety
- **The Blender Addon Nuance:** Both MPFB2 and Rigify are distributed under GPL-3.0 because they link against Blender’s Python API.
- **The Legal Clearance:** The Free Software Foundation (FSF) and Blender Foundation have officially established that **3D geometry, armatures, animations, and renders produced by Blender addons are user-created data**, not derivative works of the software. Therefore, all meshes generated by MPFB2 and armatures generated by Rigify are 100% CC0 public domain and freely usable in Blender-S1 without GPL encumbrance.

### 3.4 Python Execution Security Boundary (§4 Compliance)
- **The Security Risk:** Headless agent bridges (BlendRelay, Blender Agent, Blender Lab) expose mechanisms to execute arbitrary Python code inside Blender (`bpy`). If an unvetted script or injected prompt executes `os.system()` or arbitrary network calls, host security is compromised.
- **Mandatory Enforcement:**
  - The Blender Lab TCP socket must bind **strictly to loopback `127.0.0.1`** with an ephemeral bearer token.
  - No arbitrary remote code execution endpoints may be exposed to external network interfaces.

