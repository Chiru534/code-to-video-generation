import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT.parent))
from scripts.kaggle_manager import KaggleManager


PLAN = json.loads((ROOT / "wan21_shot_plan.json").read_text(encoding="utf-8"))
PLAN_LITERAL = json.dumps(json.dumps(PLAN, ensure_ascii=False))

setup = r'''import os, sys, subprocess, shutil
print("SHOT LOOKDEV: environment check")
print("Free working space GB:", round(shutil.disk_usage("/kaggle/working").free / 1e9, 2))
subprocess.run(["nvidia-smi"], check=False)
subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "-U", "diffusers>=0.33.0", "transformers>=4.48", "accelerate>=0.34", "safetensors", "sentencepiece", "ftfy", "pillow"])
print("Lookdev dependencies ready.")
'''

generate = f'''import hashlib, json, time
from pathlib import Path
import torch
from PIL import Image, ImageDraw, ImageFont
from diffusers import AutoPipelineForText2Image

PLAN = json.loads({PLAN_LITERAL})
MODEL_ID = "stabilityai/sdxl-turbo"
OUT = Path("/kaggle/working/lookdev")
OUT.mkdir(parents=True, exist_ok=True)
print("MODEL", MODEL_ID, "SHOTS", len(PLAN["shots"]))
pipe = AutoPipelineForText2Image.from_pretrained(
    MODEL_ID, torch_dtype=torch.float16, variant="fp16", use_safetensors=True
)
pipe.enable_model_cpu_offload(gpu_id=0)
font = ImageFont.load_default()
tiles = []
manifest = {{"model": MODEL_ID, "resolution": "672x384", "steps": 2, "shots": []}}
for index, shot in enumerate(PLAN["shots"]):
    prompt = shot["prompt"] + " vivid natural color, cinematic documentary lighting, clear readable composition"
    seed = 51400 + index
    generator = torch.Generator(device="cuda").manual_seed(seed)
    started = time.time()
    with torch.inference_mode():
        image = pipe(prompt=prompt, height=384, width=672, num_inference_steps=2,
                     guidance_scale=0.0, generator=generator).images[0]
    path = OUT / f"{{shot['id']}}.png"
    image.save(path)
    hsv = image.convert("HSV")
    saturation = sum(hsv.getchannel("S").getdata()) / (255 * image.width * image.height)
    manifest["shots"].append({{"id": shot["id"], "visual": shot["visual"], "file": path.name,
                              "seed": seed, "mean_saturation": round(saturation, 4),
                              "elapsed_seconds": round(time.time() - started, 2),
                              "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}})
    tile = image.resize((336, 192))
    draw = ImageDraw.Draw(tile)
    draw.rectangle((0, 0, 120, 20), fill=(0, 0, 0))
    draw.text((5, 4), f"{{shot['id']}} | {{shot['visual'][:31]}}", font=font, fill=(255, 255, 255))
    tiles.append(tile)
    print("LOOKDEV_DONE", shot["id"], "saturation", round(saturation, 3),
          "elapsed", round(time.time() - started, 1))

cols, rows = 4, 6
sheet = Image.new("RGB", (cols * 336, rows * 192), (12, 16, 24))
for i, tile in enumerate(tiles):
    sheet.paste(tile, ((i % cols) * 336, (i // cols) * 192))
sheet.save("/kaggle/working/lookdev_contact_sheet.jpg", quality=92)
Path("/kaggle/working/lookdev_manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
print("LOOKDEV_COMPLETE", len(tiles), "contact sheet ready")
'''

notebook = {
    "cells": [
        {"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": [setup]},
        {"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": [generate]},
    ],
    "metadata": {
        "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
        "language_info": {"name": "python"},
    },
    "nbformat": 4,
    "nbformat_minor": 5,
}

notebook_path = ROOT / "lookdev_preview.ipynb"
notebook_path.write_text(json.dumps(notebook, indent=2), encoding="utf-8")
kernel_ref = "chiranjeevimadem/blender-s1-ml-dl-lookdev-preview"
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
