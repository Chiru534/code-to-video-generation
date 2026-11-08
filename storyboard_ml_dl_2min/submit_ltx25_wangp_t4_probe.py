from __future__ import annotations
import json, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT.parent))
from scripts.kaggle_manager import KaggleManager

SLUG = "blender-s1-ltx25-wangp-t4-probe"

setup_cell = r'''import json, os, platform, shutil, subprocess, sys, time, traceback
from pathlib import Path

job_start = time.perf_counter()
out = Path("/kaggle/working/ltx25_t4_probe")
out.mkdir(parents=True, exist_ok=True)
report_path = out / "benchmark_report.json"
report = {
    "model": "LTX-2.5 22B Distilled NVFP4 via official Wan2GP headless API",
    "model_type": "ltx2_25_22B_distilled_nvfp4",
    "target_frames": 121, "fps": 24, "target_duration_seconds": 121/24,
    "resolution": "832x480", "steps": 8,
    "seed": 20261107, "python": sys.version, "platform": platform.platform(),
    "started_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
}
try:
    import torch
    if not torch.cuda.is_available():
        raise RuntimeError("No CUDA GPU allocated; refusing CPU fallback.")
    report["gpus"] = [{"name": torch.cuda.get_device_properties(i).name,
                       "vram_bytes": int(torch.cuda.get_device_properties(i).total_memory)}
                      for i in range(torch.cuda.device_count())]
    report["torch"] = torch.__version__
    report["cuda"] = torch.version.cuda
    print("GPU_ALLOCATED", json.dumps(report["gpus"]), flush=True)
    if len(report["gpus"]) != 2:
        raise RuntimeError(f"Expected the available dual-T4 Kaggle GPU shape; got {len(report['gpus'])} GPU(s).")
    usage = shutil.disk_usage("/tmp")
    report["disk_before_setup"] = {"total_bytes": usage.total, "free_bytes": usage.free}
    report["ram_bytes"] = int(os.sysconf("SC_PAGE_SIZE") * os.sysconf("SC_PHYS_PAGES"))
    print("DISK_RAM", json.dumps({"tmp_free_gb": round(usage.free/1e9,2), "ram_gb": round(report['ram_bytes']/1e9,2)}), flush=True)

    setup_start = time.perf_counter()
    repo = Path("/tmp/Wan2GP")
    subprocess.run(["git", "clone", "--depth", "1", "https://github.com/DeepBeepMeep/Wan2GP.git", str(repo)], check=True)
    report["wangp_commit"] = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=repo, text=True).strip()
    # Put model weights in temporary disk space, not the notebook output tree.
    ckpts = repo / "ckpts"
    if not ckpts.exists():
        os.symlink("/tmp/ltx25_models", str(ckpts), target_is_directory=True)
    Path("/tmp/ltx25_models").mkdir(parents=True, exist_ok=True)

    req_lines = (repo / "requirements.txt").read_text(encoding="utf-8").splitlines()
    # These optional packages are unrelated to video generation and their pinned Linux/Python
    # builds are unreliable in Kaggle's Python 3.13 image. Keep the model/runtime dependencies.
    req_lines = [line for line in req_lines
                 if "insightface" not in line.lower()
                 and "onnxruntime-gpu" not in line.lower()
                 and "smplfitter" not in line.lower()]
    req_file = Path("/tmp/wangp-kaggle-requirements.txt")
    req_file.write_text("\n".join(req_lines) + "\n", encoding="utf-8")
    print("INSTALLING_WANGP_REQUIREMENTS", flush=True)
    subprocess.run([sys.executable, "-m", "pip", "install", "-q", "--prefer-binary", "-r", str(req_file)], check=True)
    report["setup_seconds"] = round(time.perf_counter()-setup_start, 2)
    print("DEPENDENCIES_READY_SECONDS", report["setup_seconds"], flush=True)
    disk_after = shutil.disk_usage("/tmp")
    report["disk_after_setup"] = {"total_bytes": disk_after.total, "free_bytes": disk_after.free}
    print("DISK_FREE_AFTER_SETUP_GB", round(disk_after.free/1e9,2), flush=True)
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print("SETUP_REPORT_SAVED", str(report_path), flush=True)
except Exception as exc:
    report["status"] = "setup_error"
    report["error"] = repr(exc)
    report["traceback"] = traceback.format_exc()
    report["total_job_seconds"] = round(time.perf_counter()-job_start, 2)
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print("LTX25_SETUP_ERROR", json.dumps(report), flush=True)
    raise
'''

generate_cell = r'''import hashlib, json, os, subprocess, sys, time, traceback
from pathlib import Path

job_start = time.perf_counter()
out = Path("/kaggle/working/ltx25_t4_probe")
report_path = out / "benchmark_report.json"
report = json.loads(report_path.read_text(encoding="utf-8"))
try:
    os.environ["WAN2GP_DISABLE_AUDIO"] = "1"
    os.environ["HF_HOME"] = "/tmp/hf_cache"
    os.environ["HF_HUB_DISABLE_TELEMETRY"] = "1"
    sys.path.insert(0, "/tmp/Wan2GP")
    # Kaggle notebook stdout is an OutStream without reconfigure(); Wan2GP's wgp.py
    # calls sys.stdout.reconfigure(...) at import time. Guard it before import.
    for _s in (sys.stdout, sys.stderr):
        if not hasattr(_s, "reconfigure"):
            _s.reconfigure = lambda **_kw: None
    from shared.api import init
    from pathlib import Path as P

    # T4 offers 15.6 GB per device, so use Wan2GP's low-VRAM profile and SDPA.
    # The checkpoint is NVFP4; this consumer T4 uses Wan2GP's compatibility path.
    session = init(root=P("/tmp/Wan2GP"),
                   output_dir=out,
                   cli_args=["--attention", "sdpa", "--profile", "4"],
                   console_output=True, console_isatty=False)
    model_type = "ltx2_25_22B_distilled_nvfp4"
    model_def = session.get_model_def(model_type)
    if not model_def:
        raise RuntimeError(f"Wan2GP does not define expected model type {model_type}")
    defaults = session.get_default_settings(model_type)
    settings = dict(defaults)
    settings.update({
        "model_type": model_type,
        "prompt": (
            "Photorealistic cinematic science documentary macro shot inside a modern semiconductor lab. "
            "A real silicon processor sits on a detailed dark circuit board as cyan and amber light pulses "
            "travel continuously down copper traces and branch into the chip. The camera makes a smooth "
            "low macro tracking move from left to right, tiny indicator lights pulse in sequence, moving "
            "reflections cross brushed metal, shallow depth of field, physically plausible motion, rich "
            "natural color, one continuous unbroken live-action shot, no cuts, no words, no logos."
        ),
        "resolution": "832x480",
        "video_length": 121,
        "force_fps": 24,
        "num_inference_steps": 8,
        "seed": 20261107,
        "audio_prompt_type": "",
        "prompt_enhancer": "",
    })
    (out / "effective_settings.json").write_text(json.dumps(settings, indent=2), encoding="utf-8")
    print("MODEL_DEF", json.dumps({k:model_def.get(k) for k in ["name","architecture","ltx2_pipeline","URLs","text_encoder_URLs","fps","frames_minimum","frames_steps"]}), flush=True)
    print("SETTINGS", json.dumps({k:settings.get(k) for k in ["model_type","resolution","video_length","force_fps","num_inference_steps","seed","audio_prompt_type"]}), flush=True)
    disk = __import__('shutil').disk_usage("/tmp")
    report["disk_before_model_load"] = {"free_bytes": disk.free}
    print("MODEL_LOAD_AND_GENERATION_START", time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), flush=True)
    inference_start = time.perf_counter()
    job = session.submit_task(settings)
    # Drain progress/stream events so Kaggle retains useful diagnostics during long downloads/inference.
    while not job.done:
        for event in job.events.iter(timeout=1.0):
            if event.kind == "progress":
                d = event.data
                print("PROGRESS", json.dumps({"phase":getattr(d,"phase",None),"status":getattr(d,"status",None),
                     "progress":getattr(d,"progress",None),"step":getattr(d,"current_step",None),
                     "steps":getattr(d,"total_steps",None)}), flush=True)
            elif event.kind == "stream":
                d = event.data
                print("WAN2GP_LOG", getattr(d,"text",str(d))[-700:], flush=True)
    result = job.result()
    report["inference_wall_seconds"] = round(time.perf_counter()-inference_start, 2)
    report["generation_success"] = bool(result.success)
    report["generation_errors"] = [getattr(e,"message",str(e)) for e in result.errors]
    report["generated_files"] = list(result.generated_files or [])
    if not result.success:
        raise RuntimeError("Wan2GP generation failed: " + "; ".join(report["generation_errors"]))

    candidates = [Path(p) for p in report["generated_files"] if str(p).lower().endswith(".mp4") and Path(p).exists()]
    if not candidates:
        candidates = sorted(out.rglob("*.mp4"), key=lambda p:p.stat().st_mtime, reverse=True)
    if not candidates:
        raise RuntimeError("Wan2GP reported success but no MP4 artifact exists")
    source = candidates[0]
    video = out / "ltx25_nvfp4_t4_5s_480p.mp4"
    if source.resolve() != video.resolve():
        import shutil
        shutil.copy2(source, video)
    probe = json.loads(subprocess.check_output([
        "ffprobe","-v","error","-show_entries",
        "format=duration,size:stream=codec_name,width,height,r_frame_rate,nb_frames",
        "-of","json",str(video)
    ]))
    report["video_file"] = video.name
    report["video_bytes"] = video.stat().st_size
    report["sha256"] = hashlib.sha256(video.read_bytes()).hexdigest()
    report["ffprobe"] = probe
    report["source_video"] = str(source)
    report["nvfp4_kernel_lines"] = "T4 execution is logged by Wan2GP; see notebook output for selected kernel or fallback."

    # One-fps contact sheet provides a small visual QA artifact alongside the actual MP4.
    sheet = out / "contact_sheet.jpg"
    subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(video),
                    "-vf","fps=1,scale=416:-1,tile=4x2","-frames:v","1",str(sheet)], check=True)
    report["contact_sheet_file"] = sheet.name
    report["total_job_seconds"] = round(time.perf_counter()-job_start, 2)
    report["status"] = "complete"
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print("LTX25_T4_PROBE_COMPLETE", json.dumps(report), flush=True)
except Exception as exc:
    report["status"] = "generation_error"
    report["error"] = repr(exc)
    report["traceback"] = traceback.format_exc()
    report["total_job_seconds"] = round(time.perf_counter()-job_start, 2)
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print("LTX25_T4_PROBE_ERROR", json.dumps(report), flush=True)
    raise
'''

notebook = {
  "cells": [
    {"cell_type":"markdown","metadata":{"id":"summary"},"source":[
      "# LTX-2.5 NVFP4 on Kaggle dual T4\n",
      "One fixed 5.04-second, 832x480, 24 fps, 8-step text-to-video micro-probe using the public DeepBeepMeep LTX-2.5 checkpoint and official Wan2GP headless API. No CPU fallback. This is an empirical sample benchmark, not a 15-minute production render.\n"
    ]},
    {"cell_type":"code","execution_count":None,"metadata":{"id":"setup"},"outputs":[],"source":[setup_cell]},
    {"cell_type":"code","execution_count":None,"metadata":{"id":"generate"},"outputs":[],"source":[generate_cell]}
  ],
  "metadata":{"kernelspec":{"display_name":"Python 3","language":"python","name":"python3"},"language_info":{"name":"python"}},
  "nbformat":4,"nbformat_minor":5
}
nbpath = ROOT / "ltx25_wangp_t4_probe.ipynb"
nbpath.write_text(json.dumps(notebook, indent=2), encoding="utf-8")
km = KaggleManager()
payload = {
  "slug": f"chiranjeevimadem/{SLUG}", "newTitle": SLUG,
  "text": json.dumps(notebook), "language":"python", "kernelType":"notebook",
  "isPrivate": True, "enableGpu": True, "enableInternet": True,
  "machineShape":"NvidiaTeslaT4"
}
result = km._request("kernels/push", data=payload, method="POST")
print("KERNEL_REF", result.get("ref", f"chiranjeevimadem/{SLUG}"))
print("PUSH_STATUS", result.get("status", "submitted"))
print("LOCAL_NOTEBOOK", nbpath)
