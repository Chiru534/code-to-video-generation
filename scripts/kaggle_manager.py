import urllib.request
import urllib.parse
import urllib.error
import json
import os
import time

TOKEN_FILE = os.path.expanduser("~/.kaggle/access_token")

class KaggleManager:
    """
    Autonomous Headless Kaggle Kernel Manager.
    Directly interfaces with Kaggle API v1 using personal access token.
    Controls environment parameters (enable_gpu, enable_internet, machineShape)
    and executes background workloads up to 12 hours.
    Features automatic network retry with exponential backoff.
    """
    BASE_URL = "https://www.kaggle.com/api/v1"

    def __init__(self, token=None):
        if token:
            self.token = token
        elif os.path.exists(TOKEN_FILE):
            with open(TOKEN_FILE, "r") as f:
                self.token = f.read().strip()
        elif os.environ.get("KAGGLE_API_TOKEN"):
            self.token = os.environ.get("KAGGLE_API_TOKEN")
        else:
            raise ValueError("No Kaggle API token found. Provide token or save to ~/.kaggle/access_token")
            
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "User-Agent": "kaggle-api/v1",
            "Content-Type": "application/json"
        }

    def _request(self, endpoint, data=None, method="GET", max_retries=3):
        url = f"{self.BASE_URL}/{endpoint}"
        req_data = json.dumps(data).encode("utf-8") if data else None
        
        for attempt in range(max_retries):
            try:
                req = urllib.request.Request(url, data=req_data, headers=self.headers, method=method)
                with urllib.request.urlopen(req) as resp:
                    raw = resp.read().decode("utf-8")
                    return json.loads(raw) if raw else {}
            except urllib.error.HTTPError as e:
                err_body = e.read().decode("utf-8")
                print(f"[Kaggle API Error {e.code}] {err_body}")
                raise
            except (urllib.error.URLError, TimeoutError) as e:
                if attempt < max_retries - 1:
                    wait = 2 ** (attempt + 1)
                    print(f"[Network Blip: {e}] Retrying in {wait}s ({attempt + 1}/{max_retries})...")
                    time.sleep(wait)
                else:
                    print(f"[Fatal Network Error after {max_retries} attempts] {e}")
                    raise

    def list_kernels(self, user="chiranjeevimadem"):
        return self._request(f"kernels/list?user={user}")

    def get_status(self, user="chiranjeevimadem", slug="projecttring"):
        try:
            return self._request(f"kernels/status?userName={user}&kernelSlug={slug}")
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return {"status": "no_runs_yet", "message": "No runs recorded for this kernel."}
            raise

    def pull_kernel(self, user="chiranjeevimadem", slug="projecttring"):
        return self._request(f"kernels/pull?userName={user}&kernelSlug={slug}")

    def get_output(self, user="chiranjeevimadem", slug="projecttring"):
        return self._request(f"kernels/output?userName={user}&kernelSlug={slug}")

    def push_kernel(self, slug, title, notebook_content, enable_gpu=True, enable_internet=True, is_private=True):
        """
        Pushes and executes a notebook with custom environment parameters:
        - enable_gpu: Allocates NVIDIA Tesla GPU (T4 / P100)
        - enable_internet: Grants outbound internet access for GDrive uploads
        """
        payload = {
            "slug": slug,
            "newTitle": title,
            "text": notebook_content,
            "language": "python",
            "kernelType": "notebook",
            "isPrivate": is_private,
            "enableGpu": enable_gpu,
            "enableInternet": enable_internet
        }
        return self._request("kernels/push", data=payload, method="POST")

if __name__ == "__main__":
    km = KaggleManager()
    print("Testing Kaggle Manager...")
    kernels = km.list_kernels()
    print(f"Found {len(kernels)} kernels for chiranjeevimadem:")
    for k in kernels:
        print(f"  - {k.get('ref')} ({k.get('title')}) | Last run: {k.get('lastRunTime')}")
    
    status = km.get_status(slug="projecttring")
    print(f"\nStatus for chiranjeevimadem/projecttring: {status}")
