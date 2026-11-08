import math

def test_scene_syntax():
    # Verify Python syntax of the Blender script
    import ast
    blender_code = """import bpy
import math
import os
import sys
import time

# Frame range passed via command line or environment
start_f = int(os.environ.get("START_FRAME", 1))
end_f = int(os.environ.get("END_FRAME", 72))

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100
scene.render.fps = 24
scene.frame_start = start_f
scene.frame_end = end_f

# 100% HARDWARE GPU BINDING (CYCLES OPTIX/CUDA)
scene.render.engine = 'CYCLES'
scene.cycles.device = 'GPU'

cprefs = bpy.context.preferences.addons['cycles'].preferences
cprefs.get_devices()

available_types = [t[0] for t in cprefs.get_device_types(bpy.context)]
if 'OPTIX' in available_types:
    cprefs.compute_device_type = 'OPTIX'
    print("[GPU SETUP] Engine: NVIDIA OptiX")
else:
    cprefs.compute_device_type = 'CUDA'
    print("[GPU SETUP] Engine: NVIDIA CUDA")

cprefs.get_devices()
for d in cprefs.devices:
    if d.type in ['CUDA', 'OPTIX']:
        d.use = True
        print(f"  [OK] ENABLED GPU: {d.name} ({d.type})")
    else:
        d.use = False

# 8 Samples + Denoise (Clean 1080p at ~4s/frame on T4)
scene.cycles.samples = 8
scene.cycles.preview_samples = 4
scene.cycles.use_denoising = True
try:
    scene.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception:
    pass

if hasattr(scene.cycles, 'use_auto_tile'):
    scene.cycles.use_auto_tile = False
if hasattr(scene.cycles, 'tile_size'):
    scene.cycles.tile_size = 2048

# SCENE GEOMETRY
# 1. Studio Desk
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.7))
desk = bpy.context.active_object
desk.name = "Studio_Desk"
desk.scale = (2.4, 1.4, 0.05)
desk_mat = bpy.data.materials.new("Desk_Wood_Material")
desk_mat.use_nodes = True
bsdf = desk_mat.node_tree.nodes.get("Principled BSDF")
bsdf.inputs['Base Color'].default_value = (0.18, 0.10, 0.05, 1.0)
bsdf.inputs['Roughness'].default_value = 0.35
desk.data.materials.append(desk_mat)

# 2. Modern Laptop Base & Screen
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -0.15, 0.73))
laptop_base = bpy.context.active_object
laptop_base.name = "Laptop_Base"
laptop_base.scale = (0.36, 0.25, 0.012)
lap_mat = bpy.data.materials.new("Laptop_Metal")
lap_mat.use_nodes = True
b = lap_mat.node_tree.nodes.get("Principled BSDF")
b.inputs['Base Color'].default_value = (0.08, 0.10, 0.13, 1.0)
b.inputs['Metallic'].default_value = 0.90
b.inputs['Roughness'].default_value = 0.20
laptop_base.data.materials.append(lap_mat)

bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -0.03, 0.85))
screen = bpy.context.active_object
screen.name = "Laptop_Screen"
screen.scale = (0.36, 0.01, 0.23)
screen.rotation_euler = (math.radians(-16), 0, 0)
screen.data.materials.append(lap_mat)

# Silicon Chip Architecture UI Display
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, -0.038, 0.85))
display = bpy.context.active_object
display.name = "Display_Graphic"
display.scale = (0.34, 0.21, 1.0)
display.rotation_euler = (math.radians(74), 0, 0)
disp_mat = bpy.data.materials.new("Display_Emission")
disp_mat.use_nodes = True
d_nodes = disp_mat.node_tree.nodes
d_nodes.clear()

emit = d_nodes.new('ShaderNodeEmission')
emit.inputs['Color'].default_value = (0.0, 0.88, 1.0, 1.0)
emit.inputs['Strength'].default_value = 4.0
out = d_nodes.new('ShaderNodeOutputMaterial')
disp_mat.node_tree.links.new(emit.outputs['Emission'], out.inputs['Surface'])
display.data.materials.append(disp_mat)

# 3. Presenter Character
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.18, location=(0, 0.50, 1.25), segments=48, ring_count=24)
head = bpy.context.active_object
head.name = "Presenter_Head"
bpy.ops.object.shade_smooth()

skin_mat = bpy.data.materials.new("Pixar_SSS_Skin")
skin_mat.use_nodes = True
s_bsdf = skin_mat.node_tree.nodes.get("Principled BSDF")
s_bsdf.inputs['Base Color'].default_value = (0.92, 0.68, 0.52, 1.0)
s_bsdf.inputs['Roughness'].default_value = 0.40
if 'Subsurface Weight' in s_bsdf.inputs:
    s_bsdf.inputs['Subsurface Weight'].default_value = 0.35
    s_bsdf.inputs['Subsurface Radius'].default_value = (1.0, 0.45, 0.25)
elif 'Subsurface' in s_bsdf.inputs:
    s_bsdf.inputs['Subsurface'].default_value = 0.35
head.data.materials.append(skin_mat)

# Torso / Navy Shirt
bpy.ops.mesh.primitive_cylinder_add(radius=0.22, depth=0.45, location=(0, 0.50, 0.90), vertices=32)
torso = bpy.context.active_object
torso.name = "Presenter_Torso"
torso.scale = (1.1, 0.7, 1.0)
bpy.ops.object.shade_smooth()
shirt_mat = bpy.data.materials.new("Shirt_Fabric")
shirt_mat.use_nodes = True
sh_bsdf = shirt_mat.node_tree.nodes.get("Principled BSDF")
sh_bsdf.inputs['Base Color'].default_value = (0.12, 0.30, 0.58, 1.0)
sh_bsdf.inputs['Roughness'].default_value = 0.75
torso.data.materials.append(shirt_mat)

# Eyes
eye_mat = bpy.data.materials.new("Eye_Gloss")
eye_mat.use_nodes = True
e_bsdf = eye_mat.node_tree.nodes.get("Principled BSDF")
e_bsdf.inputs['Base Color'].default_value = (0.10, 0.07, 0.04, 1.0)
e_bsdf.inputs['Roughness'].default_value = 0.05
for side, offset in [("Left", -0.065), ("Right", 0.065)]:
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.035, location=(offset, 0.34, 1.28), segments=32, ring_count=16)
    eye = bpy.context.active_object
    eye.name = f"Eye_{side}"
    bpy.ops.object.shade_smooth()
    eye.data.materials.append(eye_mat)

# Hair
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.20, location=(0, 0.53, 1.34), segments=32, ring_count=16)
hair = bpy.context.active_object
hair.name = "Presenter_Hair"
hair.scale = (1.05, 0.95, 0.75)
bpy.ops.object.shade_smooth()
hair_mat = bpy.data.materials.new("Hair_Gloss")
hair_mat.use_nodes = True
h_bsdf = hair_mat.node_tree.nodes.get("Principled BSDF")
h_bsdf.inputs['Base Color'].default_value = (0.16, 0.10, 0.06, 1.0)
h_bsdf.inputs['Roughness'].default_value = 0.30
hair.data.materials.append(hair_mat)

# 4. Cinematic 3-Point Lighting
bpy.ops.object.light_add(type='SPOT', location=(0.8, -0.5, 1.9))
key = bpy.context.active_object
key.data.energy = 220.0
key.data.color = (1.0, 0.88, 0.70)
key.data.spot_size = math.radians(55)

bpy.ops.object.light_add(type='POINT', location=(-1.0, -0.3, 1.4))
fill = bpy.context.active_object
fill.data.energy = 70.0
fill.data.color = (0.75, 0.85, 1.0)

bpy.ops.object.light_add(type='SPOT', location=(0.0, 1.2, 1.9))
rim = bpy.context.active_object
rim.data.energy = 300.0
rim.data.color = (0.35, 0.85, 1.0)
rim.data.spot_size = math.radians(70)
rim.rotation_euler = (math.radians(145), 0, 0)

# Studio background soft amber fill
bpy.ops.object.light_add(type='POINT', location=(-0.6, 0.2, 0.95))
lamp = bpy.context.active_object
lamp.data.energy = 45.0
lamp.data.color = (1.0, 0.65, 0.25)

# 5. CINEMATIC CAMERA COMPOSITION (Both Nova & Laptop display framed)
# Target empty at mid-chest/laptop level
bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0.15, 1.05))
target = bpy.context.active_object
target.name = "Cam_Target"

bpy.ops.object.camera_add(location=(0, -1.65, 1.22))
cam = bpy.context.active_object
scene.camera = cam
cam.data.lens = 55.0 # Medium cinematic focal length
cam.data.dof.use_dof = True
cam.data.dof.focus_object = head
cam.data.dof.aperture_fstop = 2.8

track = cam.constraints.new(type='TRACK_TO')
track.target = target
track.track_axis = 'TRACK_NEGATIVE_Z'
track.up_axis = 'UP_Y'

# Camera Dolly Push-in Animation (72 frames)
cam.location = (0, -1.65, 1.22)
cam.keyframe_insert(data_path="location", frame=1)

cam.location = (0, -1.35, 1.18) # 30cm cinematic push-in
cam.keyframe_insert(data_path="location", frame=72)

# Head Subtle Breathing & Nod Movement
head.rotation_euler = (math.radians(3), 0, math.radians(-2))
head.keyframe_insert(data_path="rotation_euler", frame=1)

head.rotation_euler = (math.radians(0), 0, math.radians(1))
head.keyframe_insert(data_path="rotation_euler", frame=36)

head.rotation_euler = (math.radians(-2), 0, math.radians(-1))
head.keyframe_insert(data_path="rotation_euler", frame=72)

# Render Frames
os.makedirs("/tmp/frames", exist_ok=True)
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = "/tmp/frames/frame_"

print(f">>> WORKER RENDERING FRAMES {start_f} TO {end_f} (CYCLES OPTIX GPU)...")
t0 = time.time()
bpy.ops.render.render(animation=True)
total_time = time.time() - t0
n_frames = end_f - start_f + 1
print(f"[OK] Worker Finished {n_frames} frames in {total_time:.1f}s ({total_time/n_frames:.2f}s/frame)!")

# If this worker rendered frame 36, save hero lookdev still to /kaggle/working
if start_f <= 36 <= end_f:
    import shutil
    src_36 = "/tmp/frames/frame_0036.png"
    if os.path.exists(src_36):
        shutil.copyfile(src_36, "/kaggle/working/hero_lookdev_frame_36.png")
        print("[OK] Saved hero_lookdev_frame_36.png to /kaggle/working/")
"""
    ast.parse(blender_code)
    print("Syntax verification: PASSED!")

test_scene_syntax()
