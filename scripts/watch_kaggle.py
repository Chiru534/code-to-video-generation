"""Live Kaggle kernel watcher with real, readable output.

Fixes the "everything is running but there's no output" problem:
  * Kaggle only publishes a kernel's log AFTER the run finishes -> this polls,
    detects the transition, then fetches + decodes + SAVES the log.
  * Decodes Kaggle's serialized event-stream log into plain text.
  * Downloads deliverables automatically.
  * Writes everything to logs/ so nothing is ever lost in a void again.

Usage:
    python scripts/watch_kaggle.py                     # watch all active kernels
    python scripts/watch_kaggle.py <slug> [<slug>...]  # watch specific kernels
    python scripts/watch_kaggle.py --once              # single snapshot, then exit
"""
import json
import os
import sys
import time
import urllib.error
import urllib.request

USER = "chiranjeevimadem"
BASE = "https://www.kaggle.com/api/v1"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOG_DIR = os.path.join(ROOT, "logs")
OUT_DIR = os.path.join(ROOT, "micro_batch_results")
TOKEN = open(os.path.expanduser("~/.kaggle/access_token")).read().strip()

ACTIVE = ("running", "queued")
DONE = ("complete", "error", "cancelAck")


def api(endpoint, timeout=90, retries=3):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(
                f"{BASE}/{endpoint}",
                headers={"Authorization": f"Bearer {TOKEN}", "User-Agent": "kaggle-api/v1"})
            raw = urllib.request.urlopen(req, timeout=timeout).read().decode()
            return json.loads(raw) if raw else {}
        except urllib.error.HTTPError:
            raise
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2 ** (attempt + 1))
            else:
                raise


def decode_log(raw):
    """Kaggle returns log as a serialized list of {stream_name,time,data} events."""
    if not raw:
        return ""
    try:
        events = json.loads(raw)
        if isinstance(events, list):
            return "".join(e.get("data", "") for e in events if isinstance(e, dict))
    except Exception:
        pass
    return raw.replace("\\n", "\n").replace('\\"', '"')


def active_kernels():
    data = api(f"kernels/list?user={USER}")
    slugs = []
    for k in data:
        slug = (k.get("ref") or "").split("/")[-1]
        if not slug:
            continue
        try:
            if api(f"kernels/status?userName={USER}&kernelSlug={slug}").get("status") in ACTIVE:
                slugs.append(slug)
        except Exception:
            continue
    return slugs


def harvest(slug, elapsed):
    """Run finished: pull log + files, save both."""
    os.makedirs(LOG_DIR, exist_ok=True)
    os.makedirs(OUT_DIR, exist_ok=True)
    try:
        out = api(f"kernels/output?userName={USER}&kernelSlug={slug}")
    except Exception as e:
        print(f"  ! cannot fetch output for {slug}: {e}")
        return

    text = decode_log(out.get("log", ""))
    log_path = os.path.join(LOG_DIR, f"{slug}.log")
    with open(log_path, "w", encoding="utf-8") as fh:
        fh.write(text)
    print(f"  log saved -> logs/{slug}.log  ({len(text)} chars)")

    files = out.get("files", [])
    print(f"  deliverables: {len(files)}")
    for f in files:
        name = os.path.basename(f.get("fileName", ""))
        if not name:
            continue
        dest = os.path.join(OUT_DIR, name)
        try:
            req = urllib.request.Request(
                f.get("url", ""), headers={"Authorization": f"Bearer {TOKEN}"})
            with urllib.request.urlopen(req, timeout=300) as r, open(dest, "wb") as fh:
                fh.write(r.read())
            print(f"    [saved] {name}  ({os.path.getsize(dest):,} bytes)")
        except Exception as e:
            print(f"    [fail ] {name}: {e}")

    if text:
        print("  ---- last 25 lines of remote log ----")
        for line in text.strip().splitlines()[-25:]:
            print("  | " + line)
        print("  " + "-" * 36)


def main():
    args = [a for a in sys.argv[1:]]
    once = "--once" in args
    slugs = [a for a in args if not a.startswith("--")]
    if not slugs:
        slugs = active_kernels()
        if not slugs:
            print("No active Kaggle kernels right now.")
            return

    print(f"Watching {len(slugs)} kernel(s): {', '.join(slugs)}\n")
    started = {s: time.time() for s in slugs}
    last = {s: None for s in slugs}
    done = set()
    tick = 0

    while len(done) < len(slugs):
        tick += 1
        for slug in slugs:
            if slug in done:
                continue
            try:
                st = api(f"kernels/status?userName={USER}&kernelSlug={slug}")
                status = st.get("status", "?")
                fail = st.get("failureMessage") or ""
            except Exception as e:
                print(f"[{tick}] {slug}: status error {e}")
                continue

            mins = int((time.time() - started[slug]) / 60)
            if status != last[slug]:
                print(f"[{mins:>3}m] {slug}")
                print(f"        status = {status}" + (f"  ({fail[:300]})" if fail else ""))
                last[slug] = status

            if status in DONE:
                harvest(slug, mins)
                done.add(slug)

        if len(done) < len(slugs):
            if tick % 4 == 0:  # heartbeat every minute
                pending = [f"{s.split('-')[-1]}={last[s]}" for s in slugs if s not in done]
                print(f"[{tick*15:>4}s] waiting: {', '.join(pending)}", flush=True)
            time.sleep(15)
            if once:
                break

    print("\nAll watched kernels finished.")


if __name__ == "__main__":
    main()
