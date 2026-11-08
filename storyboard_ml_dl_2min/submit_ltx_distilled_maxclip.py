"""Submit the LTX-Video 2B distilled max-recommended-length probe to Kaggle."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT.parent))
from scripts.kaggle_manager import KaggleManager

SLUG = "blender-s1-ltx-2b-distilled-maxclip"

cell = r'''import hashlib, importlib, json, os, shutil, subprocess, sys, time, traceback
from pathlib import Path

job_start = time.perf_counter()
OUT = Path("/kaggle/working/ltx_distilled_sample")
OUT.mkdir(parents=True, exist_ok=True)
REPORT = OUT / "benchmark_report.json"
report = {"model": "Lightricks/LTX-Video ltxv-2b-0.9.8-distilled",
          "target_frames": 249, "fps": 30, "native_resolution": "512x288",
          "delivery_resolution": "832x480 (upscaled from 512x288)",
          "target_duration_seconds": 249/30, "setup_started_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
try:
    import torch
    assert torch.cuda.is_available(), "No CUDA GPU; refusing CPU fallback."
    report["gpu_devices"] = [{"name": torch.cuda.get_device_properties(i).name,
                              "vram_bytes": int(torch.cuda.get_device_properties(i).total_memory)}
                             for i in range(torch.cuda.device_count())]
    print("CUDA_DEVICES", json.dumps(report["gpu_devices"]), flush=True)
    assert len(report["gpu_devices"]) == 2, "Kaggle did not allocate the requested dual-T4 shape."

    repo = Path("/tmp/LTX-Video")
    setup_start = time.perf_counter()
    subprocess.run(["git", "clone", "--depth", "1", "https://github.com/Lightricks/LTX-Video.git", str(repo)], check=True)
    subprocess.run([sys.executable, "-m", "pip", "install", "-q", "-e", ".[inference]"], cwd=repo, check=True)
    # Kaggle's T4 supports FP16, not native BF16. Patch only this ephemeral clone;
    # model weights and all generation settings otherwise stay official.
    inference_py = repo / "ltx_video" / "inference.py"
    source = inference_py.read_text(encoding="utf-8")
    source = source.replace("torch.bfloat16", "torch.float16").replace('torch_dtype="bfloat16"', 'torch_dtype="float16"')
    source = source.replace(
        "    transformer = transformer.to(device)\n    vae = vae.to(device)\n    text_encoder = text_encoder.to(device)\n",
        "    # Keep the full stack on CPU at construction; Kaggle T4 has only 15 GB VRAM.\n",
    )
    source = source.replace(
        "    pipeline = pipeline.to(device)\n    return pipeline\n",
        "    pipeline.enable_model_cpu_offload(device=device)\n    return pipeline\n",
    )
    source = source.replace(
        "spatial_upscaler_model_path, pipeline.device",
        "spatial_upscaler_model_path, device",
    )
    inference_py.write_text(source, encoding="utf-8")
    vae_utils = repo / "ltx_video" / "models" / "autoencoders" / "vae_encode.py"
    vae_source = vae_utils.read_text(encoding="utf-8")
    vae_source = vae_source.replace(
        ".to(latents.dtype).view(1, -1, 1, 1, 1)",
        ".to(device=latents.device, dtype=latents.dtype).view(1, -1, 1, 1, 1)",
    )
    vae_utils.write_text(vae_source, encoding="utf-8")
    pipeline_source_path = repo / "ltx_video" / "pipelines" / "pipeline_ltx_video.py"
    pipeline_source = pipeline_source_path.read_text(encoding="utf-8")
    pipeline_source = pipeline_source.replace(
        "image = vae_decode(\n                latents,",
        "self.vae = self.vae.to(latents.device)\n            image = vae_decode(\n                latents,",
    )
    pipeline_source_path.write_text(pipeline_source, encoding="utf-8")
    report["setup_seconds"] = round(time.perf_counter() - setup_start, 2)
    print("SETUP_READY_SECONDS", report["setup_seconds"], flush=True)

    # Use the official 2B distilled multiscale config. Disable optional prompt
    # enhancement so timing measures the video generator, not another LLM.
    cfg = repo / "configs" / "ltxv-2b-0.9.8-distilled.yaml"
    cfg_text = cfg.read_text(encoding="utf-8").replace("prompt_enhancement_words_threshold: 120", "prompt_enhancement_words_threshold: 0")
    run_cfg = OUT / "ltxv-2b-0.9.8-distilled-t4.yaml"
    run_cfg.write_text(cfg_text, encoding="utf-8")

    sys.path.insert(0, str(repo))
    import ltx_video.inference as inference
    from ltx_video.pipelines.pipeline_ltx_video import LTXMultiScalePipeline
    timings = {}
    original_call = LTXMultiScalePipeline.__call__
    def timed_call(self, *args, **kwargs):
        torch.cuda.synchronize()
        started = time.perf_counter()
        print("INFERENCE_START", time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), flush=True)
        try:
            return original_call(self, *args, **kwargs)
        finally:
            torch.cuda.synchronize()
            timings["generation_pipeline_seconds"] = round(time.perf_counter() - started, 2)
            print("INFERENCE_FINISH_SECONDS", timings["generation_pipeline_seconds"], flush=True)
    LTXMultiScalePipeline.__call__ = timed_call

    prompt = (
        "A cinematic photorealistic educational science-film shot inside a modern AI research lab. "
        "The camera makes a continuous slow dolly forward past a transparent glass neural network "
        "display as bright cyan and violet data pulses travel through layered nodes from left to right. "
        "A researcher in the background moves naturally, studies the display, and gestures toward the "
        "flowing signals. Particles stream continuously, indicator lights pulse in sequence, reflections "
        "move across glass, shallow depth of field, natural human motion, physically plausible motion, "
        "rich saturated color, realistic cinematic lighting, one unbroken shot, no cuts, no text, no logos."
    )
    generation_start = time.perf_counter()
    inference.infer(inference.InferenceConfig(
        prompt=prompt,
        output_path=str(OUT),
        pipeline_config=str(run_cfg),
        seed=20261107,
        height=288,
        width=512,
        num_frames=249,
        frame_rate=30,
        offload_to_cpu=True,
        negative_prompt="still image, frozen motion, slideshow, jitter, flicker, abrupt cuts, text, subtitles, watermark, logo, blurry, distorted anatomy, malformed hands",
    ))
    timings["generation_call_wall_seconds"] = round(time.perf_counter() - generation_start, 2)
    LTXMultiScalePipeline.__call__ = original_call

    videos = sorted(OUT.glob("*.mp4"), key=lambda p: p.stat().st_mtime, reverse=True)
    assert videos, "Inference returned without creating an MP4."
    source_video = videos[0]
    video = OUT / "ltx_2b_distilled_249frames_480p.mp4"
    subprocess.run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-i", str(source_video), "-vf", "scale=832:480:flags=lanczos",
        "-r", "30", "-c:v", "libx264", "-preset", "medium", "-crf", "18",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(video),
    ], check=True)
    probe = json.loads(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries",
        "format=duration,size:stream=codec_name,width,height,r_frame_rate,nb_frames",
        "-of", "json", str(video)
    ]))
    report.update(timings)
    report["video_file"] = video.name
    report["native_video_file"] = source_video.name
    report["video_bytes"] = video.stat().st_size
    report["video_sha256"] = hashlib.sha256(video.read_bytes()).hexdigest()
    report["ffprobe"] = probe
    report["total_job_wall_seconds"] = round(time.perf_counter() - job_start, 2)
    report["status"] = "complete"
    REPORT.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print("LTX_BENCHMARK_COMPLETE", json.dumps(report), flush=True)
except Exception as exc:
    report["status"] = "error"
    report["error"] = repr(exc)
    report["traceback"] = traceback.format_exc()
    report["total_job_wall_seconds"] = round(time.perf_counter() - job_start, 2)
    REPORT.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print("LTX_BENCHMARK_ERROR", json.dumps(report), flush=True)
    raise
'''

notebook = {
    "cells": [{"cell_type": "code", "execution_count": None,
               "metadata": {"id": "ltx-distilled-maxclip"}, "outputs": [], "source": [cell]}],
    "metadata": {"kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
                 "language_info": {"name": "python"}},
    "nbformat": 4,
    "nbformat_minor": 5,
}
notebook_path = ROOT / "ltx_distilled_maxclip.ipynb"
notebook_path.write_text(json.dumps(notebook, indent=2), encoding="utf-8")

payload = {
    "slug": f"chiranjeevimadem/{SLUG}",
    "newTitle": SLUG,
    "text": json.dumps(notebook),
    "language": "python",
    "kernelType": "notebook",
    "isPrivate": True,
    "enableGpu": True,
    "enableInternet": True,
    "machineShape": "NvidiaTeslaT4",
}
result = KaggleManager()._request("kernels/push", data=payload, method="POST")
print("KERNEL_REF", result.get("ref", f"chiranjeevimadem/{SLUG}"))
print("PUSH_STATUS", result.get("status", "submitted"))
print("MACHINE_SHAPE", result.get("machineShape", result.get("machineShapeNullable", "requested NvidiaTeslaT4")))
print("LOCAL_NOTEBOOK", notebook_path)
