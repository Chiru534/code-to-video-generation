"""
Blender-S1 Phase 8: Production Verification Utility
"""
import os
import sys
import json
import hashlib
import subprocess

def hash_file(filepath: str) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def inspect_media(filepath: str):
    cmd = f'ffprobe -v quiet -print_format json -show_format -show_streams "{filepath}"'
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if res.returncode == 0:
        return json.loads(res.stdout)
    return None

if __name__ == "__main__":
    prod_dir = "d:/New folder/production"
    print("=== PHASE 8 LOCAL PRODUCTION AUDIT ===")
    for sub in ["shots", "renders", "audio", "assembly"]:
        p = os.path.join(prod_dir, sub)
        if os.path.exists(p):
            files = os.listdir(p)
            print(f"[{sub}]: {len(files)} files")
            for f in files:
                fp = os.path.join(p, f)
                sz = os.path.getsize(fp)
                print(f"  - {f} ({sz:,} bytes)")

