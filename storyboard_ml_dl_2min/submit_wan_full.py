import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT.parent))
from scripts.kaggle_manager import KaggleManager

PLAN = json.loads((ROOT / "wan21_shot_plan.json").read_text(encoding="utf-8"))
PLAN_LITERAL = json.dumps(json.dumps(PLAN, ensure_ascii=False))

setup_cell = r'''import os, sys, time, json, shutil, subprocess, platform
print("WAN2.1 TWO-GPU VIDEO PRODUCTION")
print("Python:", sys.version.split()[0], "Platform:", platform.platform())
print("Free working space GB:", round(shutil.disk_usage("/kaggle/working").free / 1e9, 2))
subprocess.run(["nvidia-smi"], check=False)
subprocess.check_call([
    sys.executable, "-m", "pip", "install", "-q", "-U",
    "diffusers>=0.33.0", "transformers>=4.48", "accelerate>=0.34",
    "sentencepiece", "ftfy", "imageio", "imageio-ffmpeg"
])
print("WAN2.1 inference dependencies ready.")
'''

generate_template = r"""import json, os, subprocess, sys, time
from pathlib import Path

import torch

PLAN = json.loads(__PLAN_LITERAL__)
MODEL_ID = "Wan-AI/Wan2.1-T2V-1.3B-Diffusers"
OUT = Path("/kaggle/working/wan21_ml_dl")
OUT.mkdir(parents=True, exist_ok=True)
(OUT / "plan.json").write_text(json.dumps(PLAN, indent=2), encoding="utf-8")
assert torch.cuda.is_available(), "No Kaggle CUDA device; refusing CPU generation."
gpu_count = torch.cuda.device_count()
assert gpu_count >= 2, f"Expected the configured dual-T4 environment; found {gpu_count} GPU(s)."
print("MODEL", MODEL_ID, "GPU_COUNT", gpu_count, "SHOT_COUNT", len(PLAN["shots"]))

worker_code = r'''import gc, hashlib, json, os, sys, time, traceback
from pathlib import Path
import torch
from diffusers import AutoencoderKLWan, WanPipeline
from diffusers.schedulers.scheduling_unipc_multistep import UniPCMultistepScheduler
from diffusers.utils import export_to_video

MODEL_ID = "Wan-AI/Wan2.1-T2V-1.3B-Diffusers"
OUT = Path("/kaggle/working/wan21_ml_dl")
shots = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
physical_gpu = sys.argv[2]
assert torch.cuda.is_available() and torch.cuda.device_count() == 1
props = torch.cuda.get_device_properties(0)
print("WORKER_READY", physical_gpu, props.name, int(props.total_memory), flush=True)
torch.set_num_threads(2)
vae = AutoencoderKLWan.from_pretrained(
    MODEL_ID, subfolder="vae", torch_dtype=torch.float32, use_safetensors=True
)
pipe = WanPipeline.from_pretrained(
    MODEL_ID, vae=vae, torch_dtype=torch.float16, use_safetensors=True
)
pipe.scheduler = UniPCMultistepScheduler.from_config(pipe.scheduler.config, flow_shift=5.0)
pipe.enable_model_cpu_offload(gpu_id=0)
manifest = []
for shot in shots:
    name = shot["id"]
    target = OUT / f"{name}.mp4"
    meta_path = OUT / f"{name}.json"
    prompt = (shot["prompt"] + " Rich saturated but natural cinematic color, vivid color separation, "
              "continuous visible subject and camera motion throughout, no muted or monochrome look.")
    seed = 24011 + int(name[1:])
    success = False
    for attempt in (1, 2):
        started = time.time()
        try:
            print("SHOT_START", name, "GPU", physical_gpu, "ATTEMPT", attempt, flush=True)
            torch.cuda.empty_cache()
            generator = torch.Generator(device="cuda").manual_seed(seed)
            with torch.inference_mode():
                result = pipe(
                    prompt=prompt,
                    negative_prompt=("still image, frozen motion, slideshow, cartoon, illustration, "
                                     "painting, text, subtitles, watermark, logo, flicker, abrupt cuts, "
                                     "malformed anatomy, duplicate subjects, blurry, low quality"),
                    height=480, width=832, num_frames=81, num_inference_steps=25,
                    guidance_scale=5.0, generator=generator,
                )
            export_to_video(result.frames[0], str(target), fps=16)
            elapsed = round(time.time() - started, 2)
            digest = hashlib.sha256(target.read_bytes()).hexdigest()
            info = {
                "id": name, "visual": shot["visual"], "prompt": prompt,
                "model": MODEL_ID, "seed": seed, "steps": 25,
                "resolution": "832x480", "frames": 81, "fps": 16,
                "gpu": props.name, "elapsed_seconds": elapsed,
                "file_bytes": target.stat().st_size, "sha256": digest,
                "attempt": attempt,
            }
            meta_path.write_text(json.dumps(info, indent=2), encoding="utf-8")
            manifest.append(info)
            print("SHOT_DONE", name, "seconds", elapsed, "bytes", target.stat().st_size, flush=True)
            del result
            gc.collect()
            torch.cuda.empty_cache()
            success = True
            break
        except Exception as exc:
            print("SHOT_ERROR", name, "attempt", attempt, repr(exc), flush=True)
            traceback.print_exc()
            if target.exists(): target.unlink()
            gc.collect()
            torch.cuda.empty_cache()
    if not success:
        manifest.append({"id": name, "failed": True})
Path(OUT / f"worker_{physical_gpu}_manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
print("WORKER_COMPLETE", physical_gpu, "ok", sum(not x.get("failed") for x in manifest),
      "failed", sum(bool(x.get("failed")) for x in manifest), flush=True)
'''

worker_path = Path("/kaggle/working/wan21_worker.py")
worker_path.write_text(worker_code, encoding="utf-8")
jobs = []
for gpu in (0, 1):
    assigned = [shot for index, shot in enumerate(PLAN["shots"]) if index % 2 == gpu]
    shots_path = OUT / f"worker_{gpu}_shots.json"
    shots_path.write_text(json.dumps(assigned), encoding="utf-8")
    log_path = OUT / f"worker_{gpu}.log"
    env = os.environ.copy()
    env["CUDA_VISIBLE_DEVICES"] = str(gpu)
    env["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"
    handle = open(log_path, "w", encoding="utf-8", buffering=1)
    proc = subprocess.Popen([sys.executable, str(worker_path), str(shots_path), str(gpu)],
                            stdout=handle, stderr=subprocess.STDOUT, env=env)
    jobs.append({"gpu": gpu, "proc": proc, "handle": handle, "log": log_path})
    print("WORKER_SUBMITTED", gpu, "SHOTS", [s["id"] for s in assigned], flush=True)

t0 = time.time()
while any(job["proc"].poll() is None for job in jobs):
    time.sleep(180)
    elapsed = round((time.time() - t0) / 60, 1)
    for job in jobs:
        job["handle"].flush()
        lines = job["log"].read_text(encoding="utf-8", errors="replace").splitlines()
        last = lines[-1] if lines else "waiting for worker output"
        print("PROGRESS", "minutes", elapsed, "gpu", job["gpu"],
              "exit", job["proc"].poll(), "last", last[-220:], flush=True)
for job in jobs:
    rc = job["proc"].wait()
    job["handle"].close()
    print("WORKER_EXIT", job["gpu"], rc, flush=True)

metadata = []
for path in sorted(OUT.glob("S*.json")):
    if path.name.startswith("worker_"): continue
    try: metadata.append(json.loads(path.read_text(encoding="utf-8")))
    except Exception: pass
failed = sorted(set(s["id"] for s in PLAN["shots"]) - set(x["id"] for x in metadata))
if failed:
    raise RuntimeError("WAN generation failed for shots: " + ", ".join(failed))
manifest = {
    "title": PLAN["title"], "target_duration_seconds": 120,
    "model": MODEL_ID, "generation_resolution": "832x480", "source_fps": 16,
    "inference_steps": 25, "gpu_count": gpu_count,
    "elapsed_seconds": round(time.time() - t0, 2), "shots": metadata,
}
(OUT / "production_manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
concat_path = OUT / "clips_concat.txt"
concat_path.write_text("\n".join(f"file '{OUT / (shot['id'] + '.mp4')}'" for shot in PLAN["shots"]), encoding="utf-8")
master_path = Path("/kaggle/working/wan21_ml_vs_dl_2min_silent_720p.mp4")
subprocess.run([
    "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
    "-f", "concat", "-safe", "0", "-i", str(concat_path), "-t", "120",
    "-vf", "fps=24,scale=1280:720:flags=lanczos,eq=saturation=1.08:contrast=1.02",
    "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p",
    "-an", "-movflags", "+faststart", str(master_path),
], check=True)
probe = json.loads(subprocess.check_output([
    "ffprobe", "-v", "error", "-show_entries",
    "format=duration,size:stream=codec_name,width,height,r_frame_rate,nb_frames",
    "-of", "json", str(master_path),
]))
manifest["silent_master"] = {
    "file": master_path.name, "sha256": __import__("hashlib").sha256(master_path.read_bytes()).hexdigest(),
    "file_bytes": master_path.stat().st_size, "ffprobe": probe,
}
(OUT / "production_manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
print("PRODUCTION_COMPLETE", len(metadata), "clips", "elapsed_seconds", manifest["elapsed_seconds"], flush=True)
print("FINAL_SILENT_MASTER", json.dumps(manifest["silent_master"], indent=2), flush=True)
"""
generate_cell = generate_template.replace("__PLAN_LITERAL__", PLAN_LITERAL)

notebook = {
    "cells": [
        {"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": [setup_cell]},
        {"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": [generate_cell]},
    ],
    "metadata": {
        "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
        "language_info": {"name": "python"},
    },
    "nbformat": 4,
    "nbformat_minor": 5,
}

notebook_path = ROOT / "wan21_full_production.ipynb"
notebook_path.write_text(json.dumps(notebook, indent=2), encoding="utf-8")
kernel_ref = "chiranjeevimadem/blender-s1-ml-dl-wan21-production"
result = KaggleManager().push_kernel(
    slug=kernel_ref,
    title=kernel_ref.split("/", 1)[1],
    notebook_content=json.dumps(notebook),
    enable_gpu=True,
    enable_internet=True,
    is_private=True,
)
print("KERNEL_REF", result.get("ref", kernel_ref))
print("PUSH_STATUS", result.get("status", "submitted"))
print("LOCAL_NOTEBOOK", notebook_path)
