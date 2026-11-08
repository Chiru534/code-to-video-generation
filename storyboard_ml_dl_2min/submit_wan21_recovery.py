"""Run a short, motion-forward Wan2.1 T2V recovery sample on Kaggle dual T4."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT.parent))
from scripts.kaggle_manager import KaggleManager

SLUG = "blender-s1-wan21-ltx-recovery-sample"

setup_cell = r'''import platform, subprocess, sys, time
print("WAN2.1 recovery sample setup", platform.platform())
subprocess.run(["nvidia-smi"], check=False)
setup_start = time.perf_counter()
subprocess.check_call([
    sys.executable, "-m", "pip", "install", "-q", "-U",
    "diffusers>=0.33.0", "transformers>=4.48", "accelerate>=0.34",
    "sentencepiece", "ftfy", "imageio", "imageio-ffmpeg"
])
print("DEPENDENCIES_READY_SECONDS", round(time.perf_counter()-setup_start, 2), flush=True)
'''

generate_cell = r'''import hashlib, json, subprocess, time
from pathlib import Path
import torch
from diffusers import AutoencoderKLWan, WanPipeline
from diffusers.schedulers.scheduling_unipc_multistep import UniPCMultistepScheduler
from diffusers.utils import export_to_video

assert torch.cuda.is_available(), "No CUDA GPU; refusing CPU fallback."
device = torch.cuda.get_device_properties(0)
gpu_count = torch.cuda.device_count()
print("GPU", device.name, "VRAM_GB", round(device.total_memory/1e9, 2), "GPU_COUNT", gpu_count, flush=True)
assert gpu_count == 2, f"Expected Kaggle dual T4, found {gpu_count} GPU(s)."
MODEL_ID = "Wan-AI/Wan2.1-T2V-1.3B-Diffusers"
PROMPT = (
    "Photorealistic cinematic educational documentary macro footage of a precision semiconductor "
    "processor on a dark modern circuit board. Bright cyan and amber data pulses flow continuously "
    "along copper traces and branch into the chip while tiny particles stream into its surface. "
    "Indicator lights pulse in sequence, realistic metal and silicon textures catch moving reflections, "
    "the camera makes one smooth low macro tracking move from the chip edge across the circuitry, "
    "shallow depth of field, vivid but natural colors, physically plausible motion, one unbroken shot, "
    "no cuts, no text, no labels, no logos."
)
NEGATIVE = (
    "still image, frozen motion, slideshow, cartoon, illustration, painting, text, letters, subtitles, "
    "watermark, logo, flicker, abrupt cuts, blurry, low quality, warped geometry, duplicated chip, "
    "overexposed, monochrome"
)
OUT = Path("/kaggle/working/wan21_recovery_sample.mp4")
REPORT = Path("/kaggle/working/wan21_recovery_report.json")
SEED, STEPS, FRAMES, FPS = 6152026, 20, 49, 16
job_start = time.perf_counter()
load_start = time.perf_counter()
vae = AutoencoderKLWan.from_pretrained(MODEL_ID, subfolder="vae", torch_dtype=torch.float32, use_safetensors=True)
pipe = WanPipeline.from_pretrained(MODEL_ID, vae=vae, torch_dtype=torch.float16, use_safetensors=True)
pipe.scheduler = UniPCMultistepScheduler.from_config(pipe.scheduler.config, flow_shift=5.0)
pipe.enable_model_cpu_offload(gpu_id=0)
model_load_seconds = round(time.perf_counter()-load_start, 2)
print("MODEL_LOADED_SECONDS", model_load_seconds, flush=True)
torch.cuda.empty_cache()
torch.cuda.synchronize()
generation_start = time.perf_counter()
print("GENERATION_START", flush=True)
with torch.inference_mode():
    result = pipe(
        prompt=PROMPT, negative_prompt=NEGATIVE,
        height=480, width=832, num_frames=FRAMES,
        num_inference_steps=STEPS, guidance_scale=5.0,
        generator=torch.Generator(device="cuda").manual_seed(SEED),
    )
torch.cuda.synchronize()
generation_seconds = round(time.perf_counter()-generation_start, 2)
export_to_video(result.frames[0], str(OUT), fps=FPS)
write_seconds = round(time.perf_counter()-generation_start, 2)
probe = json.loads(subprocess.check_output([
    "ffprobe", "-v", "error", "-show_entries",
    "format=duration,size:stream=codec_name,width,height,r_frame_rate,nb_frames",
    "-of", "json", str(OUT)
]))
report = {
    "status": "complete", "model": MODEL_ID, "prompt": PROMPT,
    "seed": SEED, "steps": STEPS, "native_resolution": "832x480",
    "frames": FRAMES, "fps": FPS,
    "duration_seconds": FRAMES/FPS,
    "gpu": device.name, "gpu_count": gpu_count,
    "model_load_seconds": model_load_seconds,
    "generation_pipeline_seconds": generation_seconds,
    "generation_plus_video_write_seconds": write_seconds,
    "total_job_seconds": round(time.perf_counter()-job_start, 2),
    "file_bytes": OUT.stat().st_size,
    "sha256": hashlib.sha256(OUT.read_bytes()).hexdigest(),
    "ffprobe": probe,
}
REPORT.write_text(json.dumps(report, indent=2), encoding="utf-8")
print("WAN21_RECOVERY_COMPLETE", json.dumps(report), flush=True)
'''

notebook = {
    "cells": [
        {"cell_type": "code", "execution_count": None, "metadata": {"id": "wan-recovery-setup"}, "outputs": [], "source": [setup_cell]},
        {"cell_type": "code", "execution_count": None, "metadata": {"id": "wan-recovery-generate"}, "outputs": [], "source": [generate_cell]},
    ],
    "metadata": {"kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"}, "language_info": {"name": "python"}},
    "nbformat": 4, "nbformat_minor": 5,
}
notebook_path = ROOT / "wan21_recovery_sample.ipynb"
notebook_path.write_text(json.dumps(notebook, indent=2), encoding="utf-8")
result = KaggleManager().push_kernel(
    slug=f"chiranjeevimadem/{SLUG}", title=SLUG,
    notebook_content=json.dumps(notebook), enable_gpu=True,
    enable_internet=True, is_private=True,
)
print("KERNEL_REF", result.get("ref", f"chiranjeevimadem/{SLUG}"))
print("PUSH_STATUS", result.get("status", "submitted"))
print("LOCAL_NOTEBOOK", notebook_path)
