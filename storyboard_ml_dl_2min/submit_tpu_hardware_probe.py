import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT.parent))
from scripts.kaggle_manager import KaggleManager

SLUG = "chiranjeevimadem/blender-s1-tpu-gate1-hardware-probe"

probe = r'''import importlib.util, json, os, platform, subprocess, sys, time
from pathlib import Path

report = {
    "python": sys.version,
    "platform": platform.platform(),
    "packages": {},
    "devices": [],
    "probes": {},
}
print("TPU GATE 1: HARDWARE AND RUNTIME IDENTIFICATION")
print("PYTHON", report["python"])
print("PLATFORM", report["platform"])
for name in ("jax", "jaxlib", "torch", "torch_xla", "tensorflow"):
    spec = importlib.util.find_spec(name)
    report["packages"][name] = spec is not None
    print("PACKAGE", name, "AVAILABLE", spec is not None)

try:
    import jax
    import jax.numpy as jnp
    report["probes"]["jax_version"] = jax.__version__
    devices = jax.devices()
    report["devices"] = [{"platform": d.platform, "device_kind": getattr(d, "device_kind", None),
                           "id": d.id, "process_index": getattr(d, "process_index", None)} for d in devices]
    print("JAX_VERSION", jax.__version__)
    print("JAX_DEVICES", json.dumps(report["devices"]))
    if not devices:
        raise RuntimeError("JAX returned no devices")
    t0 = time.time()
    a = jnp.ones((512, 512), dtype=jnp.bfloat16)
    result = (a @ a).block_until_ready()
    report["probes"]["jax_bfloat16_matmul_seconds"] = round(time.time() - t0, 3)
    report["probes"]["jax_matmul_value"] = float(result[0, 0])
    print("JAX_MATMUL_SECONDS", report["probes"]["jax_bfloat16_matmul_seconds"])
except Exception as exc:
    report["probes"]["jax_error"] = repr(exc)
    print("JAX_PROBE_ERROR", repr(exc))

try:
    import torch_xla
    import torch_xla.core.xla_model as xm
    xla_devices = xm.get_xla_supported_devices()
    report["probes"]["torch_xla_version"] = getattr(torch_xla, "__version__", "unknown")
    report["probes"]["torch_xla_devices"] = xla_devices
    print("TORCH_XLA_VERSION", report["probes"]["torch_xla_version"])
    print("TORCH_XLA_DEVICES", json.dumps(xla_devices))
except Exception as exc:
    report["probes"]["torch_xla_error"] = repr(exc)
    print("TORCH_XLA_PROBE_ERROR", repr(exc))

for cmd in (["df", "-h", "/kaggle/working"], ["free", "-h"]):
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
        report["probes"][" ".join(cmd)] = r.stdout.strip()
        print("SYSTEM", " ".join(cmd), "\n", r.stdout)
    except Exception as exc:
        print("SYSTEM_PROBE_ERROR", cmd, repr(exc))

report["tpu_detected"] = any(d.get("platform", "").lower() == "tpu" for d in report["devices"])
out = Path("/kaggle/working/tpu_hardware_report.json")
out.write_text(json.dumps(report, indent=2), encoding="utf-8")
print("TPU_HARDWARE_REPORT", json.dumps(report, indent=2))
if not report["tpu_detected"]:
    raise RuntimeError("No TPU device was detected; stopping before any model download.")
'''

notebook = {
    "cells": [{"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": [probe]}],
    "metadata": {
        "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
        "language_info": {"name": "python"},
    },
    "nbformat": 4,
    "nbformat_minor": 5,
}
path = ROOT / "tpu_hardware_probe.ipynb"
path.write_text(json.dumps(notebook, indent=2), encoding="utf-8")
payload = {
    "slug": SLUG,
    "newTitle": SLUG.split("/", 1)[1],
    "text": json.dumps(notebook),
    "language": "python",
    "kernelType": "notebook",
    "isPrivate": True,
    "enableGpu": False,
    "enableTpu": True,
    "enableInternet": True,
}
result = KaggleManager()._request("kernels/push", data=payload, method="POST")
print("KERNEL_REF", result.get("ref", SLUG))
print("PUSH_STATUS", result.get("status", "submitted"))
print("VERSION_NUMBER", result.get("versionNumber", "not returned"))
print("LOCAL_NOTEBOOK", path)
