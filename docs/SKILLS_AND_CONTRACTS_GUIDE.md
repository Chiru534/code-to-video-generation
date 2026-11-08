# Blender-S1 — Skills, Contracts & Operating Guide

**Document ID:** `BLENDER-S1-DOC-SKILLS-001`  
**Date:** 2026-11-03  
**Status:** Authoritative Guide for Agent & Human Developers  
**Repository Root:** `d:/New folder/`  

---

## 1. Skill Distribution & Inventory

The canonical master project skill and specialized runbooks are installed across both workspace-local and machine-global locations to ensure seamless agent discovery in any environment:

| Skill Package | Location | Scope | Description |
| :--- | :--- | :--- | :--- |
| **`blender-s1`** (Master) | [`d:\New folder\.agents\skills\blender-s1\SKILL.md`](file:///d:/New%20folder/.agents/skills/blender-s1/SKILL.md) | Workspace | Canonical project master skill (Version 1.0.0, 65.8 KB) |
| **`blender-s1`** (Global) | `C:\Users\chiranjeevi madem\.gemini\config\skills\blender-s1\SKILL.md` | Global | Available to all Antigravity agent sessions on this machine |
| **`blender-s1`** (Source) | [`d:\New folder\skills\blender-s1\SKILL.md`](file:///d:/New%20folder/skills/blender-s1/SKILL.md) | Source Tree | Versioned source package alongside [`README.md`](file:///d:/New%20folder/skills/blender-s1/README.md) |
| **`blender-s1.zip`** | [`d:\New folder\skills\blender_s1_master_skill.zip`](file:///d:/New%20folder/skills/blender_s1_master_skill.zip) | Archive | Immutable original package archive (24.4 KB) |
| **`blender-s1-director`** | [`d:\New folder\.agents\skills\blender-s1-director\SKILL.md`](file:///d:/New%20folder/.agents/skills/blender-s1-director/SKILL.md) | Workspace | Specialized cinematic director & production runbook |

---

## 2. Inviolable Operating Principles

Every agent and engineer must adhere to the core principles specified in Section 0 & 3 of `blender-s1/SKILL.md`:

1. **Preserve Actions 0–47:** The 48-action vocabulary is an immutable contract. Never renumber, repurpose, or delete an action ID.
2. **Protect Checkpoints:** Never overwrite, delete, or modify checkpoints in `checkpoints/`.
3. **Structured Pydantic Interfaces:** All Parent LLM communications must pass through typed Pydantic models conforming to `BLENDER-S1-P8-ARCH-001`.
4. **Deterministic Physical Validation:** Physical interactions must be mathematically verified in world space (spatial contact tolerance $\le 0.05$m).
5. **Mandatory Full-Color Art Direction:** Never output untextured or grey default geometry. All keyframes must pass automated Color QA ($\ge 25.0\%$ saturated pixel ratio).
6. **No Phantom Claims:** Never claim a test passed or a feature was verified without an inspectable artifact on disk.

---

## 3. How to Use These Skills in New Tasks

1. **Before Modifying Code:** Read `skills/blender-s1/SKILL.md`. Identify existing code and checkpoints before proposing changes.
2. **When Directing Productions:** Refer to `blender-s1-director/SKILL.md` for specific color palettes (Nova navy `#142238`, cyan glow `#33D6E8`, Core luminous blue `#287BFF`), lighting setups, and audio mixes.
3. **For Multi-Phase Audits:** Refer to [`docs/PROJECT_HISTORY_AND_PHASE_AUDIT.md`](file:///d:/New%20folder/docs/PROJECT_HISTORY_AND_PHASE_AUDIT.md).

