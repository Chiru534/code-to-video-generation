import math
import torch
import torch.nn as nn
import torch.nn.functional as F

ACTION_V5_LIST = [
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
    "CORRECT_ANIMATION_DRIFT", "RESOLVE_MESH_PENETRATION", "COMPLETE_ANIMATION_SEQUENCE",
    # Phase 7 Multi-Body Dynamics & Physics (Actions 36-47)
    "ADD_RIGID_BODY", "CONFIGURE_RIGID_BODY", "APPLY_PHYSICAL_IMPULSE",
    "ATTACH_PHYSICS_CONSTRAINT", "SET_KINEMATIC_HANDOFF", "TRIGGER_PHYSICS_BAKE",
    "ADD_COLLISION_DEFLECTOR", "CREATE_CLOTH_SYSTEM", "CONFIGURE_CLOTH_PROPERTIES",
    "SETUP_CLOTH_COLLISION", "RESOLVE_PHYSICS_EXPLOSION", "COMPLETE_PHYSICAL_TASK"
]

class BlenderS1V5(nn.Module):
    def __init__(self, d_model=192, nhead=4, num_layers=4, dim_feedforward=512,
                 task_dim=48, cand_dim=32, bone_dim=24, global_dim=32,
                 num_actions=48):
        super().__init__()
        self.d_model = d_model
        self.num_actions = num_actions

        # Encoders
        self.task_proj = nn.Linear(task_dim, d_model)
        self.cand_proj = nn.Linear(cand_dim, d_model)
        self.bone_proj = nn.Linear(bone_dim, d_model)
        self.global_proj = nn.Linear(global_dim, d_model)
        self.token_type_embed = nn.Embedding(4, d_model)

        # Transformer Backbone
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model, nhead=nhead, dim_feedforward=dim_feedforward,
            batch_first=True, activation='gelu', norm_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)

        # Action Head
        self.action_head = nn.Sequential(
            nn.LayerNorm(d_model),
            nn.Linear(d_model, d_model),
            nn.GELU(),
            nn.Linear(d_model, num_actions)
        )

        # Query-Conditioned Dynamic Pointer Heads
        self.object_query_proj = nn.Sequential(
            nn.LayerNorm(d_model),
            nn.Linear(d_model, d_model)
        )
        self.bone_query_proj = nn.Sequential(
            nn.LayerNorm(d_model),
            nn.Linear(d_model, d_model)
        )

        # Continuous Parameter Heads (Phase 6)
        self.trans_head = nn.Sequential(
            nn.LayerNorm(d_model),
            nn.Linear(d_model, 128),
            nn.GELU(),
            nn.Linear(128, 3)
        )
        self.rot_head = nn.Sequential(
            nn.LayerNorm(d_model),
            nn.Linear(d_model, 128),
            nn.GELU(),
            nn.Linear(128, 6)
        )
        self.frame_head = nn.Sequential(
            nn.LayerNorm(d_model),
            nn.Linear(d_model, 64),
            nn.GELU(),
            nn.Linear(64, 1)
        )

        # Physics Parameter Heads (Phase 7: 5 heads, 6 tensors each = 30 tensors)
        self.torque_head = nn.Sequential(
            nn.LayerNorm(d_model),
            nn.Linear(d_model, 128),
            nn.GELU(),
            nn.Linear(128, 3)
        )
        self.physics_head = nn.Sequential(
            nn.LayerNorm(d_model),
            nn.Linear(d_model, 128),
            nn.GELU(),
            nn.Linear(128, 4)
        )
        self.shape_head = nn.Sequential(
            nn.LayerNorm(d_model),
            nn.Linear(d_model, 64),
            nn.GELU(),
            nn.Linear(64, 7)
        )
        self.constraint_head = nn.Sequential(
            nn.LayerNorm(d_model),
            nn.Linear(d_model, 64),
            nn.GELU(),
            nn.Linear(64, 8)
        )
        self.cloth_preset_head = nn.Sequential(
            nn.LayerNorm(d_model),
            nn.Linear(d_model, 64),
            nn.GELU(),
            nn.Linear(64, 5)
        )
