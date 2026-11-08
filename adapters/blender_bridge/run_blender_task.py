"""
Blender-S1 Controlled Background Runner (7-Call Bridge)
Standardized, bounded headless Blender execution adapter.

Supports 7 typed operations:
1. inspect_scene
2. load_approved_asset
3. apply_approved_transform
4. configure_camera
5. render_preview
6. validate_and_save_project
7. restore_checkpoint
"""

import os
import sys
import json
import math
import subprocess
from typing import Dict, Any, Optional, List


# ---------------------------------------------------------------------------
# In-Blender Implementation (Runs when imported inside Blender's python)
# ---------------------------------------------------------------------------
def _execute_in_blender(task: Dict[str, Any]) -> Dict[str, Any]:
    import bpy
    from mathutils import Vector, Matrix

    op = task.get("operation")
    args = task.get("args", {})

    if op == "inspect_scene":
        cam_name = bpy.context.scene.camera.name if bpy.context.scene.camera else None
        objs = []
        for o in bpy.data.objects:
            objs.append({
                "name": o.name,
                "type": o.type,
                "location": [round(v, 4) for v in o.location],
                "rotation_euler": [round(v, 4) for v in o.rotation_euler],
                "scale": [round(v, 4) for v in o.scale],
                "visible": not o.hide_render
            })
        return {
            "success": True,
            "scene_name": bpy.context.scene.name,
            "frame_range": [bpy.context.scene.frame_start, bpy.context.scene.frame_end],
            "frame_current": bpy.context.scene.frame_current,
            "active_camera": cam_name,
            "objects": objs,
            "materials": [m.name for m in bpy.data.materials],
            "render_engine": bpy.context.scene.render.engine
        }

    elif op == "load_approved_asset":
        filepath = args.get("filepath")
        collection_name = args.get("collection_name")
        object_name = args.get("object_name")

        if not filepath or not os.path.exists(filepath):
            raise FileNotFoundError(f"Asset file not found: {filepath}")

        # Append collection or object
        if collection_name:
            with bpy.data.libraries.load(filepath, link=False) as (data_from, data_to):
                if collection_name in data_from.collections:
                    data_to.collections = [collection_name]
                else:
                    raise ValueError(f"Collection '{collection_name}' not in {filepath}")
            for coll in data_to.collections:
                if coll:
                    bpy.context.scene.collection.children.link(coll)
            return {"success": True, "appended_collection": collection_name}

        elif object_name:
            with bpy.data.libraries.load(filepath, link=False) as (data_from, data_to):
                if object_name in data_from.objects:
                    data_to.objects = [object_name]
                else:
                    raise ValueError(f"Object '{object_name}' not in {filepath}")
            for obj in data_to.objects:
                if obj:
                    bpy.context.scene.collection.objects.link(obj)
            return {"success": True, "appended_object": object_name}
        else:
            raise ValueError("Either collection_name or object_name must be specified.")

    elif op == "apply_approved_transform":
        object_name = args.get("object_name")
        obj = bpy.data.objects.get(object_name)
        if not obj:
            raise KeyError(f"Object '{object_name}' not found in scene.")

        loc = args.get("location")
        rot = args.get("rotation")
        scl = args.get("scale")

        if loc is not None:
            obj.location = Vector(loc)
        if rot is not None:
            obj.rotation_euler = Vector(rot)
        if scl is not None:
            obj.scale = Vector(scl)

        keyframe = args.get("keyframe")
        if keyframe is not None:
            if loc is not None:
                obj.keyframe_insert(data_path="location", frame=keyframe)
            if rot is not None:
                obj.keyframe_insert(data_path="rotation_euler", frame=keyframe)
            if scl is not None:
                obj.keyframe_insert(data_path="scale", frame=keyframe)

        return {
            "success": True,
            "object_name": object_name,
            "new_location": list(obj.location),
            "new_rotation": list(obj.rotation_euler),
            "new_scale": list(obj.scale),
            "keyframe": keyframe
        }

    elif op == "configure_camera":
        cam_obj = bpy.context.scene.camera
        if not cam_obj:
            bpy.ops.object.camera_add()
            cam_obj = bpy.context.active_object
            bpy.context.scene.camera = cam_obj

        loc = args.get("location")
        look_at = args.get("look_at")
        focal_length = args.get("focal_length_mm", 35.0)

        if loc is not None:
            cam_obj.location = Vector(loc)

        if look_at is not None:
            dir_vec = Vector(look_at) - cam_obj.location
            rot_quat = dir_vec.to_track_quat('-Z', 'Y')
            cam_obj.rotation_euler = rot_quat.to_euler()

        cam_obj.data.lens = focal_length

        keyframe = args.get("keyframe")
        if keyframe is not None:
            cam_obj.keyframe_insert(data_path="location", frame=keyframe)
            cam_obj.keyframe_insert(data_path="rotation_euler", frame=keyframe)

        return {
            "success": True,
            "camera_name": cam_obj.name,
            "location": list(cam_obj.location),
            "rotation_euler": list(cam_obj.rotation_euler),
            "focal_length_mm": cam_obj.data.lens,
            "keyframe": keyframe
        }

    elif op == "render_preview":
        frame_number = args.get("frame_number", 1)
        output_path = args.get("output_path", "/tmp/preview.png")
        res_x = args.get("resolution_x", 640)
        res_y = args.get("resolution_y", 360)

        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

        bpy.context.scene.frame_set(frame_number)
        bpy.context.scene.render.resolution_x = res_x
        bpy.context.scene.render.resolution_y = res_y
        bpy.context.scene.render.filepath = output_path
        bpy.context.scene.render.image_settings.file_format = 'PNG'

        bpy.ops.render.render(write_still=True)

        size_bytes = os.path.getsize(output_path) if os.path.exists(output_path) else 0
        return {
            "success": os.path.exists(output_path),
            "output_path": output_path,
            "frame_number": frame_number,
            "size_bytes": size_bytes,
            "resolution": [res_x, res_y]
        }

    elif op == "validate_and_save_project":
        filepath = args.get("filepath")
        if not filepath:
            raise ValueError("Target filepath must be specified.")

        os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)

        # Sanity validation
        errors = []
        if not bpy.context.scene.camera:
            errors.append("Scene has no active camera.")
        if len(bpy.data.objects) == 0:
            errors.append("Scene has zero objects.")

        if errors:
            return {"success": False, "errors": errors}

        bpy.ops.wm.save_as_mainfile(filepath=filepath)
        return {
            "success": True,
            "filepath": filepath,
            "size_bytes": os.path.getsize(filepath),
            "object_count": len(bpy.data.objects)
        }

    elif op == "restore_checkpoint":
        filepath = args.get("filepath")
        if not filepath or not os.path.exists(filepath):
            raise FileNotFoundError(f"Checkpoint file not found: {filepath}")

        bpy.ops.wm.open_mainfile(filepath=filepath)
        return {
            "success": True,
            "filepath": filepath,
            "object_count": len(bpy.data.objects),
            "frame_range": [bpy.context.scene.frame_start, bpy.context.scene.frame_end]
        }

    else:
        raise ValueError(f"Unknown operation: {op}")


# ---------------------------------------------------------------------------
# CLI Entrypoint (Executed when launched via `blender -b -P run_blender_task.py -- ...`)
# ---------------------------------------------------------------------------
def _main_cli():
    argv = sys.argv
    if "--" in argv:
        args_idx = argv.index("--") + 1
        cli_args = argv[args_idx:]
    else:
        cli_args = []

    if not cli_args:
        print("ERROR: No task JSON passed after '--'")
        sys.exit(1)

    task_input = cli_args[0]
    if os.path.isfile(task_input):
        with open(task_input, "r") as f:
            task = json.load(f)
    else:
        task = json.loads(task_input)

    try:
        result = _execute_in_blender(task)
        output = {"status": "SUCCESS", "result": result}
    except Exception as e:
        output = {"status": "ERROR", "error": str(e)}

    print("===TASK_RESULT_START===")
    print(json.dumps(output))
    print("===TASK_RESULT_END===")


# ---------------------------------------------------------------------------
# External Python Wrapper Class (Used by Orchestrator / Tests)
# ---------------------------------------------------------------------------
class ControlledBackgroundRunner:
    """Invokes Blender headlessly to execute the 7 typed operations."""

    def __init__(self, blender_bin: str = "blender"):
        self.blender_bin = blender_bin
        self.script_path = os.path.abspath(__file__)

    def run_task(self, scene_file: Optional[str], operation: str, args: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        task = {
            "operation": operation,
            "args": args or {}
        }
        task_json = json.dumps(task)

        cmd = [self.blender_bin, "-b"]
        if scene_file and os.path.exists(scene_file):
            cmd.append(scene_file)
        cmd.extend(["-P", self.script_path, "--", task_json])

        res = subprocess.run(cmd, capture_output=True, text=True)

        stdout = res.stdout
        if "===TASK_RESULT_START===" not in stdout:
            return {
                "status": "FATAL_ERROR",
                "error": f"Blender failed to emit task result marker. Exit code: {res.returncode}",
                "stdout": stdout[-1000:],
                "stderr": res.stderr[-1000:]
            }

        start = stdout.index("===TASK_RESULT_START===") + len("===TASK_RESULT_START===")
        end = stdout.index("===TASK_RESULT_END===")
        result_json_str = stdout[start:end].strip()

        return json.loads(result_json_str)


if __name__ == "__main__":
    # Check if running inside Blender
    try:
        import bpy
        _main_cli()
    except ImportError:
        pass
