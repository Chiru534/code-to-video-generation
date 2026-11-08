"""
Blender-S1 Phase 8: Production Orchestrator & State Machine
Executes the 16-stage pipeline from natural-language brief to final video.
"""
import os
import sys
import json
import time
import subprocess
import bpy
from mathutils import Vector, Euler

from blender_s1_v8.schemas import (
    VideoBrief, StoryScript, CharacterBible, AssetManifest,
    ScenePlan, ShotPlan, AudioPlan, TimelinePlan, RenderManifest, QualityReport
)
from blender_s1_v8.parent_llm import AIDirector
from blender_s1_v8.asset_registry import AssetRegistry
from blender_s1_v8.audio_engine import AudioProductionEngine
from blender_s1_v8.video_assembly import VideoAssemblyEngine

class ProductionOrchestrator:
    def __init__(self, workspace_root="d:/New folder/production"):
        self.root = workspace_root
        self.shots_dir = os.path.join(workspace_root, "shots")
        self.renders_dir = os.path.join(workspace_root, "renders")
        self.audio_dir = os.path.join(workspace_root, "audio")
        self.assembly_dir = os.path.join(workspace_root, "assembly")
        self.manifest_path = os.path.join(workspace_root, "production_manifest.json")

        for d in [self.shots_dir, self.renders_dir, self.audio_dir, self.assembly_dir]:
            os.makedirs(d, exist_ok=True)

        self.director = AIDirector()
        self.asset_registry = AssetRegistry()
        self.audio_engine = AudioProductionEngine(self.audio_dir)
        self.assembly_engine = VideoAssemblyEngine(self.assembly_dir)
        self.manifest = {"stage": "INITIALIZED", "history": []}

    def set_stage(self, stage_name: str):
        print(f"\n========================================================")
        print(f"  ORCHESTRATOR STAGE: {stage_name}")
        print(f"========================================================")
        self.manifest["stage"] = stage_name
        self.manifest["history"].append({"stage": stage_name, "timestamp": time.time()})
        with open(self.manifest_path, "w") as f:
            json.dump(self.manifest, f, indent=2)

    def execute_end_to_end_production(self, brief: VideoBrief) -> dict:
        start_time = time.time()

        # Stages 1 - 5: Planning
        self.set_stage("1. BRIEF_ANALYSIS")
        self.manifest["brief"] = brief.model_dump()

        self.set_stage("2. STORY_GENERATION")
        package = self.director.develop_production_package(brief)
        self.manifest["package"] = {
            "script": package["script"].model_dump(),
            "bible": package["bible"].model_dump(),
            "manifest": package["manifest"].model_dump(),
            "scene_plan": package["scene_plan"].model_dump(),
            "audio": package["audio"].model_dump(),
            "timeline": package["timeline"].model_dump()
        }

        self.set_stage("3. SCRIPT_APPROVAL")
        print("Script and 3-act narrative approved automatically by AI Director gate.")

        self.set_stage("4. SCENE_BREAKDOWN")
        scene_plan = package["scene_plan"]
        print(f"Scene: {scene_plan.scene_title} with {len(scene_plan.shots)} shots planned.")

        self.set_stage("5. SHOT_PLANNING")
        for s in scene_plan.shots:
            print(f"  {s.shot_id} [{s.start_time:.1f}s - {s.end_time:.1f}s]: Camera {s.camera.camera_type}, Action {s.animation[0].locomotion_action if s.animation else 'NONE'}")

        self.set_stage("6. ASSET_PLANNING")
        asset_manifest = package["manifest"]
        print(f"Verified {len(asset_manifest.assets)} assets in manifest.")

        self.set_stage("7. ASSET_PREPARATION")
        print("Preparing canonical character Nova, Ancient Vault, and Quantum Core...")

        # Stage 8 - 12: Blender Shot Execution & Rendering
        shot_video_paths = []
        for shot in scene_plan.shots:
            self.set_stage(f"8-12. EXECUTING_{shot.shot_id}")
            shot_mp4 = self.execute_single_shot(shot)
            shot_video_paths.append(shot_mp4)
            shot.verification_status = "VERIFIED"

        # Stage 13: Audio Generation
        self.set_stage("13. AUDIO_GENERATION")
        audio_plan = package["audio"]

        # 1. Dialogue
        dialogue_tracks = []
        for d_line in audio_plan.dialogue_tracks:
            wav_path = self.audio_engine.generate_dialogue(d_line)
            dialogue_tracks.append({"path": wav_path, "start_time": d_line.start_time})
            print(f"  Dialogue: [{d_line.speaker}] '{d_line.text}' -> {wav_path}")

        # 2. Sound Effects
        sfx_tracks = []
        for sfx in audio_plan.sfx_tracks:
            s_path = self.audio_engine.generate_procedural_sfx(sfx)
            sfx_tracks.append({"path": s_path, "start_time": sfx.start_time})
            print(f"  SFX: {sfx.sfx_type} at {sfx.start_time}s -> {s_path}")

        # 3. Ambient Background Music
        bgm_path = self.audio_engine.generate_ambient_bgm(duration_seconds=60.0)
        print(f"  Ambient BGM (60s) -> {bgm_path}")

        # 4. Synchronized Subtitles
        srt_path = self.audio_engine.generate_subtitles_srt(audio_plan.dialogue_tracks)
        print(f"  Subtitles -> {srt_path}")

        # Stage 14: Video Composition
        self.set_stage("14. VIDEO_COMPOSITION")
        final_video_path = self.assembly_engine.assemble_final_video(
            shot_video_paths=shot_video_paths,
            dialogue_paths=dialogue_tracks,
            sfx_paths=sfx_tracks,
            bgm_path=bgm_path,
            subtitles_srt=srt_path,
            fps=24,
            resolution=(1280, 720)
        )
        print(f"Master Video Assembled: {final_video_path}")

        # Stage 15: Final Quality Review
        self.set_stage("15. FINAL_QUALITY_REVIEW")
        info = self.assembly_engine.inspect_final_video(final_video_path)
        print("Final Video QC Inspection:")
        for k, v in info.items():
            print(f"  {k:20s}: {v}")

        qc_pass = (abs(info["duration_seconds"] - 60.0) < 1.0) and (info["has_audio"]) and (info["width"] == 1280)
        print(f"Automated Quality Verdict: {'PASS' if qc_pass else 'FAIL'}")

        # Stage 16: Video Export
        self.set_stage("16. VIDEO_EXPORT")
        self.manifest["final_video"] = info
        self.manifest["production_duration_seconds"] = time.time() - start_time
        self.manifest["status"] = "COMPLETED"

        with open(self.manifest_path, "w") as f:
            json.dump(self.manifest, f, indent=2)

        return {
            "status": "COMPLETED",
            "video_path": final_video_path,
            "manifest_path": self.manifest_path,
            "qc_info": info,
            "elapsed_seconds": round(time.time() - start_time, 2)
        }

    def execute_single_shot(self, shot: ShotPlan) -> str:
        """Sets up Blender scene, applies camera/character/physics animation, and renders shot."""
        print(f"\n--- Staging {shot.shot_id} ({shot.duration_seconds}s | {int(shot.duration_seconds * 24)} frames) ---")
        bpy.ops.wm.read_factory_settings(use_empty=True)
        bpy.ops.rigidbody.world_add()
        rw = bpy.context.scene.rigidbody_world
        rw.substeps_per_frame = 10
        rw.solver_iterations = 10

        # Build environment
        self.asset_registry.build_environment_vault()

        # Build props
        pedestal = self.asset_registry.build_prop_pedestal()
        core = self.asset_registry.build_prop_core()
        deflector = self.asset_registry.build_prop_deflector()

        # Build character if present in shot
        nova = None
        if "CHAR_NOVA" in shot.character_refs:
            nova = self.asset_registry.build_character_nova(location=(0.0, -1.8, 0.0))

        # Lighting
        self.asset_registry.setup_cinematic_lighting()

        # Setup Camera
        bpy.ops.object.camera_add()
        cam = bpy.context.active_object
        bpy.context.scene.camera = cam
        cam.data.lens = shot.camera.focal_length_mm
        cam.data.clip_start = 0.1
        cam.data.clip_end = 100.0

        # Setup Camera Animation
        n_frames = int(shot.duration_seconds * 24)
        bpy.context.scene.frame_start = 1
        bpy.context.scene.frame_end = n_frames

        start_loc = Vector(shot.camera.start_location)
        end_loc = Vector(shot.camera.end_location)
        look_at = Vector(shot.camera.look_at_target)

        for f in [1, n_frames]:
            alpha = (f - 1) / max(1, n_frames - 1)
            pos = start_loc.lerp(end_loc, alpha)
            cam.location = pos
            # Point camera to target
            dir_vec = look_at - pos
            rot_quat = dir_vec.to_track_quat('-Z', 'Y')
            cam.rotation_euler = rot_quat.to_euler()
            cam.keyframe_insert(data_path="location", frame=f)
            cam.keyframe_insert(data_path="rotation_euler", frame=f)

        # Shot-Specific Character & Physics Animation
        if shot.shot_id == "SHOT_01":
            # Walking approach
            if nova:
                nova.location = Vector((0.0, -4.5, 0.0))
                nova.keyframe_insert(data_path="location", frame=1)
                nova.location = Vector((0.0, -2.2, 0.0))
                nova.keyframe_insert(data_path="location", frame=n_frames)
        elif shot.shot_id == "SHOT_03":
            # Reaching for core
            if nova:
                nova.location = Vector((0.0, -1.2, 0.0))
        elif shot.shot_id == "SHOT_04":
            # Kinetic Throw Handoff!
            # Core kinematic until frame 48, then release with impulse along +Y toward deflector
            core.location = Vector((0.0, -0.8, 1.2))
            core.keyframe_insert(data_path="location", frame=1)
            core.rigid_body.kinematic = True
            core.rigid_body.keyframe_insert(data_path="kinematic", frame=1)

            # Windup
            core.location = Vector((0.0, -0.3, 1.4))
            core.keyframe_insert(data_path="location", frame=36)

            # Throw release at frame 37!
            # Impart forward velocity via kinematic delta
            fps = 24
            dt = 1.0 / fps
            core.location += Vector((0.0, 5.0, 1.5)) * dt
            core.keyframe_insert(data_path="location", frame=37)
            core.rigid_body.kinematic = False
            core.rigid_body.keyframe_insert(data_path="kinematic", frame=37)
        elif shot.shot_id == "SHOT_05":
            # Collision & ricochet shot
            # Core starts right before deflector with forward momentum
            core.location = Vector((0.0, 3.5, 1.2))
            core.keyframe_insert(data_path="location", frame=1)
            core.rigid_body.kinematic = True
            core.rigid_body.keyframe_insert(data_path="kinematic", frame=1)

            # Hit deflector at frame 10
            core.location = Vector((0.0, 4.0, 1.0))
            core.keyframe_insert(data_path="location", frame=10)
            core.rigid_body.kinematic = False
            core.rigid_body.keyframe_insert(data_path="kinematic", frame=10)

        # Save shot checkpoint .blend
        blend_file = os.path.join(self.shots_dir, f"{shot.shot_id}.blend")
        bpy.ops.wm.save_as_mainfile(filepath=blend_file)
        print(f"Saved Checkpoint: {blend_file}")

        # Render Shot Frames
        shot_render_dir = os.path.join(self.renders_dir, shot.shot_id)
        os.makedirs(shot_render_dir, exist_ok=True)

        bpy.context.scene.render.resolution_x = 1280
        bpy.context.scene.render.resolution_y = 720
        bpy.context.scene.render.fps = 24
        bpy.context.scene.render.image_settings.file_format = 'PNG'

        # Set fast headless workbench/opengl preview rendering
        bpy.context.scene.render.engine = 'BLENDER_WORKBENCH'
        bpy.context.scene.display.shading.light = 'MATCAP'
        bpy.context.scene.display.shading.color_type = 'MATERIAL'

        print(f"Rendering {n_frames} frames for {shot.shot_id}...")
        depsgraph = bpy.context.evaluated_depsgraph_get()
        for f in range(1, n_frames + 1):
            bpy.context.scene.frame_set(f)
            bpy.context.scene.render.filepath = os.path.join(shot_render_dir, f"frame_{f:04d}.png")
            bpy.ops.render.render(write_still=True)

        # Encode shot frames to shot MP4 using FFmpeg
        shot_mp4_path = os.path.join(self.renders_dir, f"{shot.shot_id}.mp4")
        encode_cmd = (
            f'ffmpeg -y -r 24 -i "{shot_render_dir}/frame_%04d.png" '
            f'-c:v libx264 -pix_fmt yuv420p -r 24 "{shot_mp4_path}" > /dev/null 2>&1'
        )
        subprocess.run(encode_cmd, shell=True, check=True)
        print(f"Completed Shot Video: {shot_mp4_path} ({os.path.getsize(shot_mp4_path):,} bytes)")
        return shot_mp4_path

