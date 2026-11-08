"""
Utility to decode base64 dumps from Colab to binary media files.
"""
import sys
import base64
import hashlib

def decode(in_txt: str, out_bin: str):
    with open(in_txt, "r", encoding="utf-8") as f:
        content = f.read().strip()
    data = base64.b64decode(content)
    with open(out_bin, "wb") as f:
        f.write(data)
    print(f"Successfully decoded {len(data):,} bytes to {out_bin}")
    print(f"SHA-256: {hashlib.sha256(data).hexdigest()}")

if __name__ == "__main__":
    if len(sys.argv) > 2:
        decode(sys.argv[1], sys.argv[2])

