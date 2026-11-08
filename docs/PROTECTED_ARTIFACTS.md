# Blender-S1 — Protected Artifacts & Cryptographic Registry
**Document ID:** `BLENDER-S1-DOC-PROT-003`  
**Version:** `1.0.0`  
**Date:** November 3, 2026  
**Status:** Inviolable Protection Registry  
**Authority:** Master Execution Blueprint (§0, §14, §38, §39)

---

## 1. Non-Negotiable Protection Mandates

The following assets, weights, and code definitions are **permanently frozen and immutable**. Any coding, research, or autonomous agent operating in this repository is strictly prohibited from:
1. Overwriting, deleting, re-training, or modifying any `.pt` checkpoint file in `checkpoints/`.
2. Renumbering, modifying, or removing any of the 48 discrete action IDs (0–47).
3. Altering the tensor shapes or parameter mappings of the Transformer backbone ($d_{\text{model}} = 192$, $N_{\text{layers}} = 4$).
4. Modifying verified master film deliverables or overwriting historical benchmark manifests.

---

## 2. Cryptographic Checkpoint Inventory

Every neural checkpoint in `checkpoints/` has been verified via SHA256 cryptographic checksum:

```
+----------------------------------------+---------+-----------+------------------------------------------------------------------+
| Checkpoint Filename                    | Tensors | Params    | SHA256 Checksum (Immutable)                                      |
+----------------------------------------+---------+-----------+------------------------------------------------------------------+
| blender_s1_v3_character_rigging.pt     | 81      | 1,462,112 | 705107B2F9431BE65EEAFE59B30EB3C0DC4E77BB4FFCD6AF946F53F7E892960E |
| blender_s1_v4_animation_pilot.pt       | 87      | 1,512,384 | 8F4B71E39512F5BEC7B8943B15DE709FC5CC02C493E2ACC5D0AADBBD24BAC813 |
| blender_s1_v4_1_continuous_motion.pt   | 95      | 1,606,064 | 5AFFBB45DB4C2C4B1A5EE6ED0F44048C19A6FCEE2C4C114608B1EF16160CA854 |
| blender_s1_v4_2_motion_intelligence.pt | 95      | 1,606,064 | 1FD7FE174D51B65BBCE445465F4394EE95C8339030A8EC00119BD07A19DDB89C |
| blender_s1_v5_pilot.pt                 | 119     | 1,689,173 | 79AC9D5CD20840685B7F6A9A5F0151DF98A798CFC57B022D1E95F0B913ECA745 |
+----------------------------------------+---------+-----------+------------------------------------------------------------------+
```

### Supporting Normalization & Lineage Files
- `checkpoints/normalization_stats.json` (SHA256: `18f71261...`): Per-parameter continuous distribution means and standard deviations.
- `checkpoints/normalization_stats_v4_2.json` (SHA256: `5bebfd03...`): Dynamic normalization statistics for continuous motion heads.
- `checkpoints/weight_transfer_audit.json` (SHA256: `632d4310...`): Audit of warm-start weight copying from v4 to v4.1.
- `reports/blender_s1_v5_parameter_transfer_audit.json` (SHA256: `d86f7b1e...`): Complete tensor-by-tensor lineage from v4.2 to v5.

---

## 3. Frozen 48-Action Vocabulary Registry

The 48 discrete action IDs remain frozen as defined:

```
+-------+-------------------------------+---------+-------------------------------------------------------------+
| ID    | Action Constant               | Phase   | Semantic Responsibility                                     |
+-------+-------------------------------+---------+-------------------------------------------------------------+
| 0–11  | Scene Actions                 | Phase 4 | CREATE_OBJECT, SET_LOCATION, SET_ROTATION, SET_SCALE,       |
|       |                               |         | ASSIGN_MATERIAL, CREATE_CAMERA, SET_CAMERA_ACTIVE,          |
|       |                               |         | CREATE_LIGHT, SET_LIGHT_ENERGY, SET_KEYFRAME,                |
|       |                               |         | SET_FRAME_RANGE, FINISH_SUBTASK                             |
+-------+-------------------------------+---------+-------------------------------------------------------------+
| 12–23 | Character Rigging Actions     | Phase 5 | CREATE_CHARACTER_PRIMITIVE, ADD_MODIFIER, APPLY_MODIFIER,   |
|       |                               |         | CREATE_ARMATURE, ADD_BONE, SET_BONE_TRANSFORM,              |
|       |                               |         | BIND_MESH_ARMATURE, AUTO_ASSIGN_WEIGHTS,                    |
|       |                               |         | SET_VERTEX_GROUP_WEIGHT, ADD_IK_CONSTRAINT, ADD_SHAPE_KEY,  |
|       |                               |         | SET_SHAPE_KEY_VALUE                                         |
+-------+-------------------------------+---------+-------------------------------------------------------------+
| 24–35 | Character Animation Actions   | Phase 6 | SET_BONE_POSE, INSERT_POSE_KEYFRAME,                        |
|       |                               |         | SETUP_DYNAMIC_CONSTRAINT, KEYFRAME_CONSTRAINT_INFLUENCE,    |
|       |                               |         | SET_FACIAL_EXPRESSION, INSERT_SHAPE_KEYFRAME,               |
|       |                               |         | ASSIGN_ACTION_SLOT, CONFIGURE_MOTION_RANGE,                 |
|       |                               |         | BLEND_ANIMATION_CLIPS, CORRECT_ANIMATION_DRIFT,             |
|       |                               |         | RESOLVE_MESH_PENETRATION, COMPLETE_ANIMATION_SEQUENCE       |
+-------+-------------------------------+---------+-------------------------------------------------------------+
| 36–47 | Physical Simulation Actions   | Phase 7 | ADD_RIGID_BODY, CONFIGURE_RIGID_BODY,                       |
|       |                               |         | APPLY_PHYSICAL_IMPULSE, ATTACH_PHYSICS_CONSTRAINT,          |
|       |                               |         | SET_KINEMATIC_HANDOFF, TRIGGER_PHYSICS_BAKE,                |
|       |                               |         | ADD_COLLISION_DEFLECTOR, CREATE_CLOTH_SYSTEM,               |
|       |                               |         | CONFIGURE_CLOTH_PROPERTIES, SETUP_CLOTH_COLLISION,          |
|       |                               |         | RESOLVE_PHYSICS_EXPLOSION, COMPLETE_PHYSICAL_TASK           |
+-------+-------------------------------+---------+-------------------------------------------------------------+
```

---

## 4. Master Deliverable Video Files

The master rendered productions on disk serve as frozen visual regression benchmarks:

| Video Deliverable | File Path | File Size | Exact Duration | SHA256 Checksum |
|---|---|---|---|---|
| **Nova First Contact (15s)** | `phase8_nova_capability_test/NOVA_FIRST_CONTACT_15S.mp4` | 3,977,896 B | 15.000000s | `F7C6E270074620A4B0627BF2EFC97E971F6325612C6F876634E701ED567E26D3` |
| **Final Quantum Core (60s)** | `phase8_production_v2/FINAL_QUANTUM_CORE_60S.mp4` | 13,016,984 B| 60.000000s | `4510F63861FB5C4D5E3E77C1C5DA0FD0CFA4B4DAB0C57D62599322C42876B8EE` |

---

## 5. Agent Enforcement Directive

Any tool call attempting to modify, rewrite, or delete files cataloged in this document must be rejected immediately. When training or evaluating new models, outputs must be directed to fresh versioned files (e.g. `checkpoints/blender_s1_v6_candidate.pt`), leaving historical checkpoints untouched.

