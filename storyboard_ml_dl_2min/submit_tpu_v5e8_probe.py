"""Explicit Kaggle TpuV5E8 allocation and runtime identification only."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT.parent))
from scripts.kaggle_manager import KaggleManager

SLUG = "blender-s1-tpu-v5e8-explicit-hardware-probe"
cell = r'''import importlib.util, json, platform, shutil, subprocess, sys, time
from pathlib import Path
report = {"python": sys.version, "platform": platform.platform(), "packages": {}, "jax_devices": [], "torch_xla_devices": [], "errors": {}}
print("TPU V5E8 EXPLICIT HARDWARE PROBE")
for pkg in ("jax", "jaxlib", "torch", "torch_xla"):
    report["packages"][pkg] = importlib.util.find_spec(pkg) is not None
try:
    import jax
    report["jax_version"] = jax.__version__
    report["jax_devices"] = [{"platform": d.platform, "kind": getattr(d,"device_kind",None), "id": d.id} for d in jax.devices()]
    print("JAX", jax.__version__, "DEVICES", json.dumps(report["jax_devices"]), flush=True)
except Exception as e: report["errors"]["jax"] = repr(e)
try:
    import torch_xla
    import torch_xla.core.xla_model as xm
    report["torch_xla_devices"] = xm.get_xla_supported_devices()
    report["torch_xla_version"] = getattr(torch_xla,"__version__","unknown")
except Exception as e: report["errors"]["torch_xla"] = repr(e)
for cmd in (["nvidia-smi"], ["df","-h","/kaggle/working"], ["free","-h"]):
    try:
        p=subprocess.run(cmd,text=True,capture_output=True,timeout=15)
        report["system_"+cmd[0]] = (p.stdout or p.stderr)[-6000:]
        print("SYSTEM",cmd[0],(p.stdout or p.stderr)[-1200:],flush=True)
    except Exception as e: report["errors"][cmd[0]]=repr(e)
report["tpu_detected"] = any(d.get("platform","").lower()=="tpu" for d in report["jax_devices"]) or bool(report["torch_xla_devices"])
Path("/kaggle/working/tpu_v5e8_probe.json").write_text(json.dumps(report,indent=2))
print("TPU_V5E8_PROBE",json.dumps(report),flush=True)
if not report["tpu_detected"]: print("MODEL_TESTS_SKIPPED_NO_TPU", flush=True)
'''
notebook={
 "cells":[{"cell_type":"code","execution_count":None,"metadata":{"id":"tpu-v5e8-probe"},"outputs":[],"source":[cell]}],
 "metadata":{"kernelspec":{"display_name":"Python 3","language":"python","name":"python3"},"language_info":{"name":"python"}},
 "nbformat":4,"nbformat_minor":5,
}
path=ROOT/"tpu_v5e8_explicit_probe.ipynb"
path.write_text(json.dumps(notebook,indent=2),encoding="utf-8")
payload={"slug":f"chiranjeevimadem/{SLUG}","newTitle":SLUG,"text":json.dumps(notebook),"language":"python","kernelType":"notebook","isPrivate":True,"enableGpu":False,"enableTpu":True,"enableInternet":True,"machineShape":"TpuV5E8"}
result=KaggleManager()._request("kernels/push",data=payload,method="POST")
print("KERNEL_REF",result.get("ref",f"chiranjeevimadem/{SLUG}"))
print("PUSH_STATUS",result.get("status","submitted"))
print("MACHINE_SHAPE",result.get("machineShape",result.get("machineShapeNullable","TpuV5E8 requested")))
print("LOCAL_NOTEBOOK",path)
