"""Live Kaggle kernel status + log inspector.

Usage:
    python scripts/kaggle_status.py                      # list all kernels
    python scripts/kaggle_status.py <slug>               # status + log tail for one kernel
    python scripts/kaggle_status.py <slug> --wait       # block, print status every 15s until done
    python scripts/kaggle_status.py <slug> --log N       # print last N chars of log
"""
import json
import os
import sys
import time
import urllib.error
import urllib.request

BASE = "https://www.kaggle.com/api/v1"
USER = "chiranjeevimadem"
TOKEN_FILE = os.path.expanduser("~/.kaggle/access_token")


def headers():
    with open(TOKEN_FILE) as f:
        token = f.read().strip()
    return {"Authorization": f"Bearer {token}", "User-Agent": "kaggle-api/v1"}


def api(endpoint, timeout=60, retries=3):
    """GET with exponential backoff (AGENTS.md rule for DNS blips)."""
    url = f"{BASE}/{endpoint}"
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=headers())
            raw = urllib.request.urlopen(req, timeout=timeout).read().decode()
            return json.loads(raw) if raw else {}
        except urllib.error.HTTPError:
            raise
        except Exception as e:
            if attempt < retries - 1:
                wait = 2 ** (attempt + 1)
                print(f"[network blip] {e} -> retry in {wait}s", flush=True)
                time.sleep(wait)
            else:
                raise


def list_kernels():
    data = api(f"kernels/list?user={USER}")
    print(f"Kernels for {USER}: {len(data)}")
    for k in data:
        ref = k.get("ref", "?")
        print(f"  {ref}")
        print(f"     last_run={k.get('lastRunTime')}  gpu={k.get('enableGpu')}")
    return data


def status(slug):
    return api(f"kernels/status?userName={USER}&kernelSlug={slug}")


def output(slug):
    return api(f"kernels/output?userName={USER}&kernelSlug={slug}", timeout=90)


def main():
    args = [a for a in sys.argv[1:]]
    if not args:
        list_kernels()
        return

    slug = args[0]
    wait = "--wait" in args
    log_chars = 4000
    if "--log" in args:
        log_chars = int(args[args.index("--log") + 1])

    start = time.time()
    last = None
    while True:
        try:
            st = status(slug)
            s = st.get("status", "unknown")
        except urllib.error.HTTPError as e:
            print(f"[{int(time.time()-start):4d}s] status HTTP {e.code} (slug/title mismatch?)")
            return
        except Exception as e:
            print(f"[{int(time.time()-start):4d}s] status error: {e}")
            s = "unknown"

        if s != last:
            print(f"[{int(time.time()-start):4d}s] status = {s}", flush=True)
            last = s

        if s in ("complete", "error", "cancelAck") or not wait:
            break
        time.sleep(15)

    print()
    try:
        out = output(slug)
    except Exception as e:
        print(f"Cannot fetch output yet: {e}")
        return

    files = out.get("files", [])
    log = out.get("log", "") or ""
    print(f"Deliverables: {len(files)} file(s)")
    for f in files:
        print(f"  - {f.get('fileName')}  ({f.get('totalBytes', '?')} bytes)")
    print(f"\nLog: {len(log)} chars")
    if log:
        print("=" * 70)
        print(log[-log_chars:])
        print("=" * 70)
    else:
        print("(log empty - Kaggle only publishes logs after the run finishes)")
        if files:
            print("\nSaving log -> scripts/last_kernel.log")
            with open(os.path.join(os.path.dirname(__file__), "last_kernel.log"), "w", encoding="utf-8") as fh:
                fh.write(log)


if __name__ == "__main__":
    main()
