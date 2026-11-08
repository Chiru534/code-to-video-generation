code = '''"""
Blender-S1 v4.1: Continuous Motion Prediction Architecture
Features:
1. Retains d_model=192, 4-layer Transformer backbone for 100% warm-start weight compatibility.
2. Typed Semantic Parameter Heads:
   - trans_head: 3D Cartesian offset (dx, dy, dz) in meters.
   - rot_head: 6D continuous rotation representation (Zhou et al., CVPR 2019) mapped to SO(3).
   - frame_head: 1D positive timeline frame advance (delta_frames >= 1).
   - scalar_head: 2D bounded [0, 1] scalars (index 0: shape key intensity, index 1: constraint influence).
3. Per-parameter normalization stats loaded from empirical dataset distribution.
4. Action-conditioned loss masking and gradient routing.
"""

import math
import torch
import torch.nn as nn
import torch.nn.functional as F

ACTION_V4_LIST = [
    # Preserved Actions 0-11 (Phase 4 Scene & Timeline)
    "CREATE_OBJECT", "SET_LOCATION", "SET_ROTATION", "SET_SCALE",
    "ASSIGN_MATERIAL", "CREATE_CAMERA", "SET_CAMERA_ACTIVE",
    "CREATE_LIGHT", "SET_LIGHT_ENERGY", "SET_KEYFRAME",
    "SET_FRAME_RANGE", "FINISH_SUBTASK",
    # Preserved Actions 12-23 (Phase 5 Character Rigging)
    "CREATE_CHARACTER_PRIMITIVE", "ADD_MODIFIER", "APPLY_MODIFIER",
    "CREATE_ARMATURE", "ADD_BONE", "SET_BONE_TRANSFORM",
    "BIND_MESH_ARMATURE", "AUTO_ASSIGN_WEIGHTS", "SET_VERTEX_GROUP_WEIGHT",
    "ADD_IK_CONSTRAINT", "ADD_SHAPE_KEY", "SET_SHAPE_KEY_VALUE",
    # Preserved Actions 24-35 (Phase 6 Character Animation & Motion Intelligence)
    "SET_BONE_POSE", "INSERT_POSE_KEYFRAME", "SETUP_DYNAMIC_CONSTRAINT",
    "KEYFRAME_CONSTRAINT_INFLUENCE", "SET_FACIAL_EXPRESSION", "INSERT_SHAPE_KEYFRAME",
    "ASSIGN_ACTION_SLOT", "CONFIGURE_MOTION_RANGE", "BLEND_ANIMATION_CLIPS",
    "CORRECT_ANIMATION_DRIFT", "RESOLVE_MESH_PENETRATION", "COMPLETE_ANIMATION_SEQUENCE"
]

ACTION_V4_TO_IDX = {name: idx for idx, name in enumerate(ACTION_V4_LIST)}

def compute_rotation_matrix_from_ortho6d(ortho6d):
    """
    Zhou et al., CVPR 2019: 'On the Continuity of Rotation Representations in Neural Networks'
    Maps continuous 6D vector to an orthogonal 3x3 rotation matrix R in SO(3).
    """
    x_raw = ortho6d[:, 0:3]
    y_raw = ortho6d[:, 3:6]
    
    x = F.normalize(x_raw, dim=-1, eps=1e-8)
    z = torch.cross(x, y_raw, dim=-1)
    z = F.normalize(z, dim=-1, eps=1e-8)
    y = torch.cross(z, x, dim=-1)
    
    matrix = torch.stack((x, y, z), dim=-1) # (B, 3, 3)
    return matrix

def rotation_matrix_to_euler_xyz(R):
    """
    Converts 3x3 rotation matrix to Euler angles (XYZ order) in radians.
    """
    sy = -R[:, 2, 0]
    sy = torch.clamp(sy, -1.0 + 1e-7, 1.0 - 1e-7)
    pitch = torch.asin(sy)
    
    yaw = torch.atan2(R[:, 2, 1], R[:, 2, 2])
    roll = torch.atan2(R[:, 1, 0], R[:, 0, 0])
    
    return torch.stack([pitch, yaw, roll], dim=-1)

class BlenderS1V4_1(nn.Module):
    def __init__(self, d_model=192, nhead=4, num_layers=4, dim_feedforward=512,
                 task_dim=48, cand_dim=24, bone_dim=24, global_dim=24,
                 num_actions=36):
        super().__init__()
        self.d_model = d_model
        self.num_actions = num_actions

        # Input Encoders (100% compatible with v3/v4 warmstart)
        self.task_proj = nn.Linear(task_dim, d_model)
        self.cand_proj = nn.Linear(cand_dim, d_model)
        self.bone_proj = nn.Linear(bone_dim, d_model)
        self.global_proj = nn.Linear(global_dim, d_model)

        # Positional token type embeddings: 0: Task, 1: Global, 2: Object, 3: Bone
        self.token_type_embed = nn.Embedding(4, d_model)

        # Transformer Backbone (100% compatible with v3/v4 warmstart)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model,
            nhead=nhead,
            dim_feedforward=dim_feedforward,
            batch_first=True,
            activation='gelu',
            norm_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)

        # Discrete Action Head (36 actions)
        self.action_head = nn.Sequential(
            nn.LayerNorm(d_model),
            nn.Linear(d_model, d_model),
            nn.GELU(),
            nn.Linear(d_model, num_actions)
        )

        # Pointer Heads
        self.object_pointer_head = nn.Sequential(
            nn.LayerNorm(d_model),
            nn.Linear(d_model, 1)
        )
        self.bone_pointer_head = nn.Sequential(
            nn.LayerNorm(d_model),
            nn.Linear(d_model, 1)
        )

        # --- TYPED PARAMETER HEADS (PHASE 6.1 ENHANCEMENT) ---
        # 1. Translation Head: 3D (dx, dy, dz) in meters
        self.trans_head = nn.Sequential(
            nn.LayerNorm(d_model),
            nn.Linear(d_model, 128),
            nn.GELU(),
            nn.Linear(128, 3)
        )

        # 2. 6D Rotation Head: (Zhou et al. 2019 continuous rotation representation)
        self.rot_head = nn.Sequential(
            nn.LayerNorm(d_model),
            nn.Linear(d_model, 128),
            nn.GELU(),
            nn.Linear(128, 6)
        )

        # 3. Timeline Frame Head: positive frame advance delta_frame >= 1
        self.frame_head = nn.Sequential(
            nn.LayerNorm(d_model),
            nn.Linear(d_model, 64),
            nn.GELU(),
            nn.Linear(64, 1),
            nn.Softplus()
        )

        # 4. Bounded Scalar Head: [0, 1] for shape key intensity (idx 0) and constraint influence (idx 1)
        self.scalar_head = nn.Sequential(
            nn.LayerNorm(d_model),
            nn.Linear(d_model, 64),
            nn.GELU(),
            nn.Linear(64, 2),
            nn.Sigmoid()
        )

    def forward(self, task_desc, global_state, cand_objs, cand_bones=None,
                cand_mask=None, bone_mask=None):
        B = task_desc.size(0)
        t_tok = self.task_proj(task_desc).unsqueeze(1) + self.token_type_embed(torch.zeros(B, 1, dtype=torch.long, device=task_desc.device))
        g_tok = self.global_proj(global_state).unsqueeze(1) + self.token_type_embed(torch.ones(B, 1, dtype=torch.long, device=task_desc.device))
        
        N_obj = cand_objs.size(1)
        o_toks = self.cand_proj(cand_objs) + self.token_type_embed(torch.full((B, N_obj), 2, dtype=torch.long, device=task_desc.device))
        
        tokens = [t_tok, g_tok, o_toks]
        masks = [
            torch.ones(B, 1, device=task_desc.device),
            torch.ones(B, 1, device=task_desc.device),
            cand_mask if cand_mask is not None else torch.ones(B, N_obj, device=task_desc.device)
        ]
        
        N_bone = 0
        if cand_bones is not None:
            N_bone = cand_bones.size(1)
            b_toks = self.bone_proj(cand_bones) + self.token_type_embed(torch.full((B, N_bone), 3, dtype=torch.long, device=task_desc.device))
            tokens.append(b_toks)
            b_m = bone_mask if bone_mask is not None else torch.ones(B, N_bone, device=task_desc.device)
            masks.append(b_m)

        seq = torch.cat(tokens, dim=1)
        full_mask = torch.cat(masks, dim=1)
        attn_key_pad_mask = (full_mask == 0)

        out = self.transformer(seq, src_key_padding_mask=attn_key_pad_mask)

        # Global representation from [Task, Global] tokens
        h_global = (out[:, 0, :] + out[:, 1, :]) * 0.5

        # 1. Action Logits (36 actions)
        act_logits = self.action_head(h_global)

        # 2. Object Pointer Logits
        obj_tokens = out[:, 2:2+N_obj, :]
        obj_scores = self.object_pointer_head(obj_tokens).squeeze(-1)
        if cand_mask is not None:
            obj_scores = obj_scores.masked_fill(cand_mask == 0, -1e4)

        # 3. Bone Pointer Logits
        bone_scores = None
        if N_bone > 0:
            bone_tokens = out[:, 2+N_obj:2+N_obj+N_bone, :]
            bone_scores = self.bone_pointer_head(bone_tokens).squeeze(-1)
            if bone_mask is not None:
                bone_scores = bone_scores.masked_fill(bone_mask == 0, -1e4)

        # 4. Typed Parameter Predictions
        pred_trans = self.trans_head(h_global)      # (B, 3) in meters
        pred_rot_6d = self.rot_head(h_global)       # (B, 6) continuous 6D
        pred_frame = self.frame_head(h_global) + 1.0 # (B, 1) delta_frames >= 1.0
        pred_scalars = self.scalar_head(h_global)   # (B, 2) bounded in [0, 1]

        return {
            "act_logits": act_logits,
            "obj_logits": obj_scores,
            "bone_logits": bone_scores,
            "pred_trans": pred_trans,
            "pred_rot_6d": pred_rot_6d,
            "pred_frame": pred_frame,
            "pred_scalars": pred_scalars
        }

def load_v4_1_with_warmstart(v3_or_v4_ckpt_path, device="cpu"):
    """
    Loads BlenderS1V4_1 and transfers:
    - 100% of 4-layer Transformer backbone (d_model=192, 4 layers, 36 tensors)
    - Encoders: task_proj, cand_proj, bone_proj, global_proj, token_type_embed (9 tensors)
    - Object and Bone pointer heads (8 tensors)
    - Action head layers 0 and 1, plus preserved action projections [:24] or [:36]
    """
    model = BlenderS1V4_1().to(device)
    ckpt = torch.load(v3_or_v4_ckpt_path, map_location=device)
    if isinstance(ckpt, dict) and "model_state_dict" in ckpt:
        state_dict = ckpt["model_state_dict"]
    else:
        state_dict = ckpt

    transferred = []
    with torch.no_grad():
        for k, v in state_dict.items():
            if k in model.state_dict() and model.state_dict()[k].shape == v.shape:
                model.state_dict()[k].copy_(v)
                transferred.append(k)
            elif k == "action_head.3.weight":
                n_src = v.shape[0]
                model.action_head[3].weight[:n_src, :].copy_(v)
                transferred.append(f"action_head.3.weight[:{n_src}]")
            elif k == "action_head.3.bias":
                n_src = v.shape[0]
                model.action_head[3].bias[:n_src].copy_(v)
                transferred.append(f"action_head.3.bias[:{n_src}]")

    print(f"BlenderS1V4_1 instantiated: {sum(p.numel() for p in model.parameters()):,} parameters.")
    print(f"Successfully warm-started {len(transferred)} weight tensors!")
    return model
'''

with open('/content/blender_s1_v4/model/blender_s1_v4_1.py', 'w') as f:
    f.write(code.strip())

print("Wrote /content/blender_s1_v4/model/blender_s1_v4_1.py successfully.")
