"""Submit a one-shot Wan2.1 text-to-video quality probe to the user's Kaggle account."""

from __future__ import annotations

import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT.parent))
from scripts.kaggle_manager import KaggleManager


SLUG = "blender-s1-wan21-catdog-micro-probe"
TITLE = SLUG

setup_cell = r'''import os, sys, time, json, shutil, subprocess, platform

print("WAN2.1 T2V MICRO-PROBE: environment check")
print("Python:", sys.version.split()[0], "Platform:", platform.platform())
print("Working directory free space (GB):", round(shutil.disk_usage("/kaggle/working").free / 1e9, 2))
subprocess.run(["nvidia-smi"], check=False)

# Install only inference/runtime dependencies; keep Kaggle's CUDA-enabled PyTorch build.
subprocess.check_call([
    sys.executable, "-m", "pip", "install", "-q", "-U",
    "diffusers>=0.33.0", "transformers>=4.48", "accelerate>=0.34",
    "sentencepiece", "ftfy", "imageio", "imageio-ffmpeg"
])
print("Inference dependencies ready.")
'''

generate_cell = r'''import gc, hashlib, json, os, subprocess, time
from pathlib import Path

import torch
from diffusers import AutoencoderKLWan, WanPipeline
from diffusers.schedulers.scheduling_unipc_multistep import UniPCMultistepScheduler
from diffusers.utils import export_to_video

assert torch.cuda.is_available(), "Kaggle did not provide a CUDA GPU; stop without falling back to CPU."
device = torch.cuda.get_device_properties(0)
print("GPU:", device.name, "VRAM_GB:", round(device.total_memory / 1e9, 2))
print("GPU_COUNT:", torch.cuda.device_count())

MODEL_ID = "Wan-AI/Wan2.1-T2V-1.3B-Diffusers"
PROMPT = (
    "Photorealistic educational documentary footage in a bright, warm living room. "
    "A ginger tabby cat on a sofa notices a golden retriever sitting nearby. "
    "The cat slowly turns its head and flicks one ear; the dog gently tilts its head, "
    "blinks, and shifts its weight. Natural breathing and subtle fur movement, "
    "believable animal anatomy, warm afternoon window light, shallow depth of field, "
    "one continuous camera move that gently pushes in, realistic live-action cinematography, "
    "no cuts, no text, no labels, no logos."
)
NEGATIVE = (
    "still image, frozen motion, slideshow, cartoon, illustration, painting, CGI look, "
    "extra legs, malformed paws, duplicate animals, fused bodies, distorted faces, "
    "text, subtitles, watermark, logos, blurry, low quality, flicker, abrupt cuts"
)
OUT = Path("/kaggle/working/wan21_catdog_motion_probe.mp4")
SEED = 24011
STEPS = 25

t0 = time.time()
torch.cuda.empty_cache()
vae = AutoencoderKLWan.from_pretrained(
    MODEL_ID, subfolder="vae", torch_dtype=torch.float32, use_safetensors=True
)
pipe = WanPipeline.from_pretrained(
    MODEL_ID, vae=vae, torch_dtype=torch.float16, use_safetensors=True
)
pipe.scheduler = UniPCMultistepScheduler.from_config(
    pipe.scheduler.config, flow_shift=5.0
)
pipe.enable_model_cpu_offload(gpu_id=0)

generator = torch.Generator(device="cuda").manual_seed(SEED)
with torch.inference_mode():
    result = pipe(
        prompt=PROMPT,
        negative_prompt=NEGATIVE,
        height=480,
        width=832,
        num_frames=81,
        num_inference_steps=STEPS,
        guidance_scale=5.0,
        generator=generator,
    )
frames = result.frames[0]
export_to_video(frames, str(OUT), fps=16)

probe = json.loads(subprocess.check_output([
    "ffprobe", "-v", "error", "-show_entries",
    "format=duration,size:stream=codec_name,width,height,r_frame_rate,nb_frames",
    "-of", "json", str(OUT)
]))
sha = hashlib.sha256(OUT.read_bytes()).hexdigest()
manifest = {
    "model": MODEL_ID,
    "task": "text-to-video",
    "prompt": PROMPT,
    "seed": SEED,
    "inference_steps": STEPS,
    "resolution": "832x480",
    "requested_frames": 81,
    "export_fps": 16,
    "gpu": device.name,
    "gpu_memory_bytes": int(device.total_memory),
    "elapsed_seconds": round(time.time() - t0, 2),
    "file_bytes": OUT.stat().st_size,
    "sha256": sha,
    "ffprobe": probe,
}
Path("/kaggle/working/wan21_catdog_motion_probe.json").write_text(
    json.dumps(manifest, indent=2), encoding="utf-8"
)
print("PROBE_COMPLETE", json.dumps(manifest, indent=2))
'''

notebook = {
    "cells": [
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [setup_cell],
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [generate_cell],
        },
    ],
    "metadata": {
        "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
        "language_info": {"name": "python"},
    },
    "nbformat": 4,
    "nbformat_minor": 5,
}

nb_path = ROOT / "wan21_micro_probe.ipynb"
nb_path.write_text(json.dumps(notebook, indent=2), encoding="utf-8")
response = KaggleManager().push_kernel(
    slug=f"chiranjeevimadem/{SLUG}",
    title=TITLE,
    notebook_content=json.dumps(notebook),
    enable_gpu=True,
    enable_internet=True,
    is_private=True,
)
print("KERNEL_REF", response.get("ref", f"chiranjeevimadem/{SLUG}"))
print("PUSH_STATUS", response.get("status", "submitted"))
print("LOCAL_NOTEBOOK", nb_path)
