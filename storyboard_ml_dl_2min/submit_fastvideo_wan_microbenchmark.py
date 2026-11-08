"""Submit one FastVideo/FastWan 480p micro-benchmark to Kaggle T4."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT.parent))
from scripts.kaggle_manager import KaggleManager

SLUG = "blender-s1-fastwan-microbenchmark"

cell = r'''import hashlib, json, os, platform, shutil, subprocess, sys, time, traceback
from pathlib import Path

job_start = time.perf_counter()
out = Path("/kaggle/working/fastwan_micro")
out.mkdir(parents=True, exist_ok=True)
report = {"model": "FastVideo/FastWan2.1-T2V-1.3B-Diffusers", "target_frames": 49,
          "target_duration_seconds": 49/16, "resolution": "832x480", "fps": 16,
          "steps": 3, "host_python": sys.version, "platform": platform.platform()}
try:
    import torch
    if not torch.cuda.is_available():
        raise RuntimeError("CUDA GPU not allocated; refusing CPU fallback")
    report["gpus"] = [{"name": torch.cuda.get_device_properties(i).name,
                       "vram_bytes": int(torch.cuda.get_device_properties(i).total_memory)}
                      for i in range(torch.cuda.device_count())]
    print("GPU", json.dumps(report["gpus"]), flush=True)
    setup_start = time.perf_counter()
    # FastVideo officially requires Python 3.10–3.12 and recommends a clean uv env.
    subprocess.run([sys.executable, "-m", "pip", "install", "-q", "uv"], check=True)
    env_dir = "/tmp/fastvideo-env"
    subprocess.run(["uv", "venv", "--python", "3.12", "--seed", env_dir], check=True)
    py = str(Path(env_dir) / "bin" / "python")
    install_env = os.environ.copy()
    install_env["UV_TORCH_BACKEND"] = "cu126"
    subprocess.run(["uv", "pip", "install", "--python", py, "fastvideo"], env=install_env, check=True)
    report["install_seconds"] = round(time.perf_counter()-setup_start, 2)
    print("FASTVIDEO_INSTALLED", report["install_seconds"], flush=True)
    runner = out / "run_fastwan.py"
    runner.write_text(r"""import os, time, json, hashlib, subprocess
from pathlib import Path

def main():
    import torch
    from fastvideo import VideoGenerator, SamplingParam
    os.environ["FASTVIDEO_ATTENTION_BACKEND"] = "VIDEO_SPARSE_ATTN"
    model = "FastVideo/FastWan2.1-T2V-1.3B-Diffusers"
    report_path = Path("/kaggle/working/fastwan_micro/runtime.json")
    gen_start=time.perf_counter()
    generator=VideoGenerator.from_pretrained(model, num_gpus=1)
    load_seconds=time.perf_counter()-gen_start
    params=SamplingParam.from_pretrained(model)
    params.num_frames=49
    params.width=832
    params.height=480
    params.fps=16
    params.num_inference_steps=3
    params.guidance_scale=1.0
    params.seed=20261107
    params.return_frames=False
    prompt=("Cinematic photorealistic educational science documentary macro shot of a semiconductor "
    "processor on a dark circuit board, cyan and amber data pulses flow along copper traces, "
    "camera smoothly tracks across the chip, realistic silicon and metal reflections, vivid natural "
    "color, continuous visible motion, one unbroken shot, no text or logos.")
    torch.cuda.synchronize(); t=time.perf_counter()
    result=generator.generate_video(prompt, sampling_param=params,
     output_path="/kaggle/working/fastwan_micro/", save_video=True)
    torch.cuda.synchronize(); gen_seconds=time.perf_counter()-t
    files=sorted(Path("/kaggle/working/fastwan_micro").glob("*.mp4"),key=lambda p:p.stat().st_mtime,reverse=True)
    if not files: raise RuntimeError("FastVideo returned without an MP4")
    video=files[0]
    probe=json.loads(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration,size:stream=codec_name,width,height,r_frame_rate,nb_frames","-of","json",str(video)]))
    data=video.read_bytes()
    report={"status":"complete","model":model,"settings":{"num_frames":49,"fps":16,"resolution":"832x480","steps":3},
     "model_load_seconds":round(load_seconds,2),"generation_plus_decode_export_seconds":round(gen_seconds,2),
     "video_file":str(video),"video_bytes":len(data),"sha256":hashlib.sha256(data).hexdigest(),"ffprobe":probe}
    report_path.write_text(json.dumps(report,indent=2)); print("FASTWAN_RESULT",json.dumps(report),flush=True)

if __name__ == "__main__":
    main()
""", encoding="utf-8")
    run_start = time.perf_counter()
    subprocess.run([py, str(runner)], check=True)
    report["inference_seconds"] = round(time.perf_counter()-run_start, 2)
    runtime_path = out / "runtime.json"
    if runtime_path.exists():
        report["result"] = json.loads(runtime_path.read_text())
    report["total_job_seconds"] = round(time.perf_counter()-job_start, 2)
    report["status"] = "complete"
except Exception as exc:
    report["status"] = "error"
    report["error"] = repr(exc)
    report["traceback"] = traceback.format_exc()
    report["total_job_seconds"] = round(time.perf_counter()-job_start, 2)
    print("FASTWAN_ERROR", json.dumps(report), flush=True)
finally:
    (out / "benchmark_report.json").write_text(json.dumps(report, indent=2))
print("FASTWAN_BENCHMARK_FINAL", json.dumps(report), flush=True)
'''

notebook = {
    "cells": [{"cell_type": "code", "execution_count": None,
               "metadata": {"id": "fastwan-microbenchmark"}, "outputs": [], "source": [cell]}],
    "metadata": {"kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
                 "language_info": {"name": "python"}},
    "nbformat": 4, "nbformat_minor": 5,
}
notebook_path = ROOT / "fastwan_microbenchmark.ipynb"
notebook_path.write_text(json.dumps(notebook, indent=2), encoding="utf-8")
payload = {
    "slug": f"chiranjeevimadem/{SLUG}", "newTitle": SLUG,
    "text": json.dumps(notebook), "language": "python", "kernelType": "notebook",
    "isPrivate": True, "enableGpu": True, "enableInternet": True,
    "machineShape": "NvidiaTeslaT4",
}
result = KaggleManager()._request("kernels/push", data=payload, method="POST")
print("KERNEL_REF", result.get("ref", f"chiranjeevimadem/{SLUG}"))
print("PUSH_STATUS", result.get("status", "submitted"))
print("LOCAL_NOTEBOOK", notebook_path)
