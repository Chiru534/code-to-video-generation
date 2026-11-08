"""
Blender-S1 Phase 6: Procedural Character Animation & Motion Intelligence
Generates biomechanically valid walk cycles, run cycles with flight phases,
expressive gestures with facial shape keys, and interactive object pickups
using Blender LTS slotted animation actions, pose bones, and dynamic constraints.
"""

import bpy
import math
import numpy as np
from mathutils import Vector, Euler

def clear_animation_data(obj):
    if obj and obj.animation_data:
        obj.animation_data_clear()

def generate_walk_cycle(arm_obj, mesh_obj, start_frame=1, num_frames=24):
    """
    Demonstration 1: Biomechanically accurate 24-frame walk cycle.
    Includes contact, down, passing, up phases, pelvis bobbing, foot rolls, and counter arm swing.
    """
    clear_animation_data(arm_obj)
    clear_animation_data(mesh_obj)

    bpy.context.scene.frame_start = start_frame
    bpy.context.scene.frame_end = start_frame + num_frames

    bpy.context.view_layer.objects.active = arm_obj
    bpy.ops.object.mode_set(mode='POSE')
    pb = arm_obj.pose.bones

    foot_ik_r = pb.get("Foot_IK.R")
    foot_ik_l = pb.get("Foot_IK.L")
    hand_ik_r = pb.get("Hand_IK.R")
    hand_ik_l = pb.get("Hand_IK.L")
    root = pb.get("Root")
    spine = pb.get("Spine")

    rest_r_foot = foot_ik_r.location.copy() if foot_ik_r else Vector((0,0,0))
    rest_l_foot = foot_ik_l.location.copy() if foot_ik_l else Vector((0,0,0))
    rest_r_hand = hand_ik_r.location.copy() if hand_ik_r else Vector((0,0,0))
    rest_l_hand = hand_ik_l.location.copy() if hand_ik_l else Vector((0,0,0))
    rest_root = root.location.copy() if root else Vector((0,0,0))

    # 5 Key Phases across 24 frames: F1, F7, F13, F19, F25
    keyframes_data = [
        # (frame, root_dz, spine_rot_x, r_foot_dy, r_foot_dz, l_foot_dy, l_foot_dz, r_arm_dy, l_arm_dy)
        (1,   0.00,  0.05,  0.22,  0.00, -0.22,  0.00, -0.15,  0.15),  # Contact R
        (7,  -0.04,  0.07,  0.10,  0.00, -0.05,  0.10, -0.08,  0.08),  # Down / Passing R
        (13,  0.00,  0.05, -0.22,  0.00,  0.22,  0.00,  0.15, -0.15),  # Contact L
        (19, -0.04,  0.07, -0.05,  0.10,  0.10,  0.00,  0.08, -0.08),  # Down / Passing L
        (25,  0.00,  0.05,  0.22,  0.00, -0.22,  0.00, -0.15,  0.15),  # Loop Contact R
    ]

    for f_rel, root_dz, spine_rx, r_dy, r_dz, l_dy, l_dz, r_arm_dy, l_arm_dy in keyframes_data:
        f = start_frame + (f_rel - 1)

        if root:
            root.location = Vector((rest_root.x, rest_root.y, rest_root.z + root_dz))
            root.keyframe_insert(data_path="location", frame=f)

        if spine:
            spine.rotation_mode = 'XYZ'
            spine.rotation_euler = Euler((spine_rx, 0, 0), 'XYZ')
            spine.keyframe_insert(data_path="rotation_euler", frame=f)

        if foot_ik_r:
            foot_ik_r.location = Vector((rest_r_foot.x, rest_r_foot.y + r_dy, rest_r_foot.z + r_dz))
            foot_ik_r.keyframe_insert(data_path="location", frame=f)

        if foot_ik_l:
            foot_ik_l.location = Vector((rest_l_foot.x, rest_l_foot.y + l_dy, rest_l_foot.z + l_dz))
            foot_ik_l.keyframe_insert(data_path="location", frame=f)

        if hand_ik_r:
            hand_ik_r.location = Vector((rest_r_hand.x, rest_r_hand.y + r_arm_dy, rest_r_hand.z))
            hand_ik_r.keyframe_insert(data_path="location", frame=f)

        if hand_ik_l:
            hand_ik_l.location = Vector((rest_l_hand.x, rest_l_hand.y + l_arm_dy, rest_l_hand.z))
            hand_ik_l.keyframe_insert(data_path="location", frame=f)

    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.context.view_layer.update()

    # Validation metrics
    bpy.context.scene.frame_set(start_frame)
    p_start_r = (arm_obj.matrix_world @ arm_obj.pose.bones["Foot_IK.R"].head).copy()
    p_start_l = (arm_obj.matrix_world @ arm_obj.pose.bones["Foot_IK.L"].head).copy()

    bpy.context.scene.frame_set(start_frame + 6)
    p_pass_l = (arm_obj.matrix_world @ arm_obj.pose.bones["Foot_IK.L"].head).copy()

    bpy.context.scene.frame_set(start_frame + 24)
    p_end_r = (arm_obj.matrix_world @ arm_obj.pose.bones["Foot_IK.R"].head).copy()

    stride_delta = abs(p_start_r.y - p_start_l.y)
    foot_lift = abs(p_pass_l.z - p_start_l.z)
    loop_drift = float(np.linalg.norm(np.array(p_start_r) - np.array(p_end_r)))

    return {
        "cycle_name": "HUMANOID_WALK_CYCLE",
        "total_frames": num_frames,
        "stride_displacement_m": round(float(stride_delta), 4),
        "foot_lift_elevation_m": round(float(foot_lift), 4),
        "periodicity_loop_drift_m": round(float(loop_drift), 6),
        "verification_passed": bool(stride_delta > 0.3 and foot_lift > 0.05 and loop_drift < 0.001)
    }

def generate_run_cycle(arm_obj, mesh_obj, start_frame=1, num_frames=16):
    """
    Demonstration 2: 16-frame Humanoid Running Cycle with genuine Flight Phases.
    At frames 5 and 13, both feet are elevated simultaneously off the ground.
    """
    clear_animation_data(arm_obj)
    clear_animation_data(mesh_obj)

    bpy.context.scene.frame_start = start_frame
    bpy.context.scene.frame_end = start_frame + num_frames

    bpy.context.view_layer.objects.active = arm_obj
    bpy.ops.object.mode_set(mode='POSE')
    pb = arm_obj.pose.bones

    foot_ik_r = pb.get("Foot_IK.R")
    foot_ik_l = pb.get("Foot_IK.L")
    hand_ik_r = pb.get("Hand_IK.R")
    hand_ik_l = pb.get("Hand_IK.L")
    root = pb.get("Root")
    spine = pb.get("Spine")

    rest_r_foot = foot_ik_r.location.copy() if foot_ik_r else Vector((0,0,0))
    rest_l_foot = foot_ik_l.location.copy() if foot_ik_l else Vector((0,0,0))
    rest_r_hand = hand_ik_r.location.copy() if hand_ik_r else Vector((0,0,0))
    rest_l_hand = hand_ik_l.location.copy() if hand_ik_l else Vector((0,0,0))
    rest_root = root.location.copy() if root else Vector((0,0,0))

    # 5 Key Phases across 16 frames: F1, F5, F9, F13, F17
    keyframes_data = [
        # (frame, root_dz, spine_rx, r_foot_dy, r_foot_dz, l_foot_dy, l_foot_dz, r_arm_dy, l_arm_dy)
        (1,  -0.03,  0.20,  0.38,  0.00, -0.38,  0.15, -0.30,  0.30),  # Strike R
        (5,   0.07,  0.22,  0.10,  0.18, -0.10,  0.20, -0.15,  0.15),  # FLIGHT PHASE 1 (both feet off ground)
        (9,  -0.03,  0.20, -0.38,  0.15,  0.38,  0.00,  0.30, -0.30),  # Strike L
        (13,  0.07,  0.22, -0.10,  0.20,  0.10,  0.18,  0.15, -0.15),  # FLIGHT PHASE 2 (both feet off ground)
        (17, -0.03,  0.20,  0.38,  0.00, -0.38,  0.15, -0.30,  0.30),  # Loop Strike R
    ]

    for f_rel, root_dz, spine_rx, r_dy, r_dz, l_dy, l_dz, r_arm_dy, l_arm_dy in keyframes_data:
        f = start_frame + (f_rel - 1)

        if root:
            root.location = Vector((rest_root.x, rest_root.y, rest_root.z + root_dz))
            root.keyframe_insert(data_path="location", frame=f)

        if spine:
            spine.rotation_mode = 'XYZ'
            spine.rotation_euler = Euler((spine_rx, 0, 0), 'XYZ')
            spine.keyframe_insert(data_path="rotation_euler", frame=f)

        if foot_ik_r:
            foot_ik_r.location = Vector((rest_r_foot.x, rest_r_foot.y + r_dy, rest_r_foot.z + r_dz))
            foot_ik_r.keyframe_insert(data_path="location", frame=f)

        if foot_ik_l:
            foot_ik_l.location = Vector((rest_l_foot.x, rest_l_foot.y + l_dy, rest_l_foot.z + l_dz))
            foot_ik_l.keyframe_insert(data_path="location", frame=f)

        if hand_ik_r:
            hand_ik_r.location = Vector((rest_r_hand.x, rest_r_hand.y + r_arm_dy, rest_r_hand.z + 0.10))
            hand_ik_r.keyframe_insert(data_path="location", frame=f)

        if hand_ik_l:
            hand_ik_l.location = Vector((rest_l_hand.x, rest_l_hand.y + l_arm_dy, rest_l_hand.z + 0.10))
            hand_ik_l.keyframe_insert(data_path="location", frame=f)

    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.context.view_layer.update()

    # Flight Phase Verification at Frame 5
    bpy.context.scene.frame_set(start_frame + 4)
    p_flight_r = (arm_obj.matrix_world @ arm_obj.pose.bones["Foot_IK.R"].head).copy()
    p_flight_l = (arm_obj.matrix_world @ arm_obj.pose.bones["Foot_IK.L"].head).copy()
    both_in_air = (p_flight_r.z > 0.12 and p_flight_l.z > 0.12)

    bpy.context.scene.frame_set(start_frame)
    p_start_r = (arm_obj.matrix_world @ arm_obj.pose.bones["Foot_IK.R"].head).copy()
    bpy.context.scene.frame_set(start_frame + 16)
    p_end_r = (arm_obj.matrix_world @ arm_obj.pose.bones["Foot_IK.R"].head).copy()
    loop_drift = float(np.linalg.norm(np.array(p_start_r) - np.array(p_end_r)))

    return {
        "cycle_name": "HUMANOID_RUN_CYCLE",
        "total_frames": num_frames,
        "flight_phase_verified": bool(both_in_air),
        "r_foot_flight_elevation_m": round(float(p_flight_r.z), 4),
        "l_foot_flight_elevation_m": round(float(p_flight_l.z), 4),
        "periodicity_loop_drift_m": round(float(loop_drift), 6),
        "verification_passed": bool(both_in_air and loop_drift < 0.001)
    }

def generate_gesture_sequence(arm_obj, mesh_obj, start_frame=1, num_frames=60):
    """
    Demonstration 3: Expressive 60-frame Greeting & Explanation Gesture Sequence.
    Includes right arm elevation, 2-beat waving oscillation, head nodding, and synchronized facial shape keys (Smile + Blink).
    """
    clear_animation_data(arm_obj)
    clear_animation_data(mesh_obj)

    bpy.context.scene.frame_start = start_frame
    bpy.context.scene.frame_end = start_frame + num_frames

    bpy.context.view_layer.objects.active = arm_obj
    bpy.ops.object.mode_set(mode='POSE')
    pb = arm_obj.pose.bones

    hand_ik_r = pb.get("Hand_IK.R")
    head = pb.get("Head")
    rest_r_hand = hand_ik_r.location.copy() if hand_ik_r else Vector((0,0,0))

    # Hand Motion Wave Timeline
    hand_frames = [
        (1,   0.00,  0.00,  0.00), # Rest
        (15, -0.15,  0.15,  0.42), # Raise to head height
        (22, -0.25,  0.15,  0.45), # Wave Right
        (28, -0.08,  0.15,  0.45), # Wave Left
        (35, -0.25,  0.15,  0.45), # Wave Right
        (42, -0.12,  0.22,  0.25), # Explanatory Open-Palm
        (50, -0.12,  0.22,  0.25), # Hold gesture
        (60,  0.00,  0.00,  0.00)  # Return to Rest
    ]

    for f, dx, dy, dz in hand_frames:
        if hand_ik_r:
            hand_ik_r.location = Vector((rest_r_hand.x + dx, rest_r_hand.y + dy, rest_r_hand.z + dz))
            hand_ik_r.keyframe_insert(data_path="location", frame=start_frame + (f - 1))

    # Head Nodding Timeline
    head_frames = [
        (1, 0.0), (15, 0.12), (25, -0.05), (35, 0.12), (45, -0.02), (60, 0.0)
    ]
    for f, rx in head_frames:
        if head:
            head.rotation_mode = 'XYZ'
            head.rotation_euler = Euler((rx, 0, 0), 'XYZ')
            head.keyframe_insert(data_path="rotation_euler", frame=start_frame + (f - 1))

    bpy.ops.object.mode_set(mode='OBJECT')

    # Synchronized Facial Shape Keys on mesh_obj
    smile_key = mesh_obj.data.shape_keys.key_blocks.get("Smile") if mesh_obj.data.shape_keys else None
    blink_key = mesh_obj.data.shape_keys.key_blocks.get("Blink_L") if mesh_obj.data.shape_keys else None

    if smile_key:
        smile_keyframes = [(1, 0.0), (15, 0.85), (45, 0.85), (60, 0.0)]
        for f, val in smile_keyframes:
            smile_key.value = val
            smile_key.keyframe_insert(data_path="value", frame=start_frame + (f - 1))

    if blink_key:
        blink_keyframes = [(1, 0.0), (21, 0.0), (23, 1.0), (26, 0.0), (60, 0.0)]
        for f, val in blink_keyframes:
            blink_key.value = val
            blink_key.keyframe_insert(data_path="value", frame=start_frame + (f - 1))

    bpy.context.view_layer.update()

    # Validation: Measure peak hand elevation and facial expression
    bpy.context.scene.frame_set(start_frame + 21) # frame 22
    p_wave = (arm_obj.matrix_world @ arm_obj.pose.bones["Hand_IK.R"].head).copy()

    bpy.context.scene.frame_set(start_frame)
    p_rest = (arm_obj.matrix_world @ arm_obj.pose.bones["Hand_IK.R"].head).copy()

    hand_elevation = p_wave.z - p_rest.z

    return {
        "sequence_name": "EXPRESSIVE_GESTURE_AND_FACIAL",
        "total_frames": num_frames,
        "max_hand_elevation_m": round(float(hand_elevation), 4),
        "smile_peak_value": 0.85 if smile_key else 0.0,
        "blink_synchronized": bool(blink_key is not None),
        "verification_passed": bool(hand_elevation > 0.35 and smile_key is not None)
    }

def generate_pickup_interaction(arm_obj, mesh_obj, start_frame=1, num_frames=80):
    """
    Demonstration 4: Character-Object Interaction & Pickup Sequence.
    Creates an interactive prop, character stoops down, grasps prop,
    binds it via Child-Of constraint, and lifts it up to chest level.
    """
    clear_animation_data(arm_obj)
    clear_animation_data(mesh_obj)

    bpy.context.scene.frame_start = start_frame
    bpy.context.scene.frame_end = start_frame + num_frames

    # 1. Armature Pose Animation
    bpy.context.view_layer.objects.active = arm_obj
    bpy.ops.object.mode_set(mode='POSE')
    pb = arm_obj.pose.bones

    hand_ik_r = pb.get("Hand_IK.R")
    root = pb.get("Root")
    spine = pb.get("Spine")
    head = pb.get("Head")

    rest_r_hand = hand_ik_r.location.copy() if hand_ik_r else Vector((0,0,0))
    rest_root = root.location.copy() if root else Vector((0,0,0))

    # Stoop, reach, grasp, and lift keyframes
    anim_steps = [
        # (frame, root_dz, spine_rx, head_rx, hand_dx, hand_dy, hand_dz)
        (1,   0.00,  0.00,  0.00,  0.00,  0.00,  0.00), # Idle upright
        (25, -0.28,  0.35,  0.25, -0.15,  0.30, -0.40), # Stoop & Reach down
        (35, -0.32,  0.40,  0.30, -0.20,  0.35, -0.48), # Contact Grasp on Crate
        (55,  0.00,  0.05,  0.15, -0.18,  0.25,  0.20), # Lift upright to chest
        (80,  0.00,  0.00,  0.10, -0.18,  0.25,  0.20), # Inspect & Hold
    ]

    for f, root_dz, spine_rx, head_rx, h_dx, h_dy, h_dz in anim_steps:
        frame_num = start_frame + (f - 1)
        if root:
            root.location = Vector((rest_root.x, rest_root.y, rest_root.z + root_dz))
            root.keyframe_insert(data_path="location", frame=frame_num)
        if spine:
            spine.rotation_mode = 'XYZ'
            spine.rotation_euler = Euler((spine_rx, 0, 0), 'XYZ')
            spine.keyframe_insert(data_path="rotation_euler", frame=frame_num)
        if head:
            head.rotation_mode = 'XYZ'
            head.rotation_euler = Euler((head_rx, 0, 0), 'XYZ')
            head.keyframe_insert(data_path="rotation_euler", frame=frame_num)
        if hand_ik_r:
            hand_ik_r.location = Vector((rest_r_hand.x + h_dx, rest_r_hand.y + h_dy, rest_r_hand.z + h_dz))
            hand_ik_r.keyframe_insert(data_path="location", frame=frame_num)

    bpy.ops.object.mode_set(mode='OBJECT')

    # 2. Evaluate Hand.R position at contact frame 35 to place crate exactly at hand contact
    contact_frame = start_frame + 34 # Frame 35
    bpy.context.scene.frame_set(contact_frame)
    bpy.context.view_layer.update()
    hand_bone = arm_obj.pose.bones["Hand.R"]
    hand_contact_world = (arm_obj.matrix_world @ hand_bone.head).copy()

    # 3. Create Interactive Target Prop (Stylized Cargo Crate)
    prop_name = "Interactive_Prop_Crate"
    existing_prop = bpy.data.objects.get(prop_name)
    if existing_prop:
        bpy.data.objects.remove(existing_prop, do_unlink=True)

    prop_pos = (hand_contact_world.x, hand_contact_world.y, hand_contact_world.z - 0.08)
    bpy.ops.mesh.primitive_cube_add(size=0.16, location=prop_pos)
    prop = bpy.context.active_object
    prop.name = prop_name

    # 4. Dynamic Prop Attachment via Constraint
    prop.animation_data_clear()
    c = prop.constraints.new(type='CHILD_OF')
    c.name = "HandGraspConstraint"
    c.target = arm_obj
    c.subtarget = "Hand.R"

    # Set active object to prop to invoke built-in childof_set_inverse operator at contact frame
    bpy.context.scene.frame_set(contact_frame)
    bpy.context.view_layer.objects.active = prop
    bpy.ops.constraint.childof_set_inverse(constraint=c.name, owner='OBJECT')

    # Influence is 0.0 before contact frame 35, and 1.0 from frame 35 onward
    c.influence = 0.0
    c.keyframe_insert(data_path="influence", frame=start_frame)
    c.keyframe_insert(data_path="influence", frame=contact_frame - 1)
    c.influence = 1.0
    c.keyframe_insert(data_path="influence", frame=contact_frame)
    c.keyframe_insert(data_path="influence", frame=start_frame + num_frames)

    # Prop static location keyframe before contact
    prop.keyframe_insert(data_path="location", frame=start_frame)
    prop.keyframe_insert(data_path="location", frame=contact_frame - 1)

    bpy.context.view_layer.update()

    # 5. Physical Validation: Initial vs. Lifted world coordinates
    bpy.context.scene.frame_set(start_frame)
    bpy.context.view_layer.update()
    depsgraph = bpy.context.evaluated_depsgraph_get()
    prop_eval_init = prop.evaluated_get(depsgraph)
    init_z = float(prop_eval_init.matrix_world.translation.z)

    bpy.context.scene.frame_set(start_frame + 59) # Frame 60
    bpy.context.view_layer.update()
    depsgraph = bpy.context.evaluated_depsgraph_get()
    prop_eval_lifted = prop.evaluated_get(depsgraph)
    lifted_z = float(prop_eval_lifted.matrix_world.translation.z)

    lift_delta = lifted_z - init_z

    return {
        "interaction_name": "OBJECT_PICKUP_INTERACTION",
        "prop_name": prop_name,
        "initial_elevation_m": round(float(init_z), 4),
        "lifted_elevation_m": round(float(lifted_z), 4),
        "elevation_gain_m": round(float(lift_delta), 4),
        "verification_passed": bool(lift_delta > 0.40)
    }

