"""Upload a rendered video to Google Drive using a zero-quota service account.

Why this works the way it does
------------------------------
Google service accounts have **no storage quota**. Creating a file fails with
403 storageQuotaExceeded, even when the account is a writer on the folder.
They *can* replace the content of a file that someone else owns, because the
bytes are charged to the owner, not to the service account.

So the contract is: one Drive file per slot, owned by you, shared into the
target folder with the service account as Writer. Every render overwrites that
file in place: same link, same name, new version. Drive keeps the previous
renders in the file's version history, so nothing is lost.

Environment:
    GDRIVE_SA_JSON     service-account key JSON, inline (GitHub Actions secret)
    GDRIVE_SA_FILE     ...or a path to the key file (local use)
    GDRIVE_FOLDER_ID   folder to search when no file id is given
    GDRIVE_FILE_ID     exact file to overwrite (preferred: no ambiguity)

Usage:
    python tools/gdrive_upload.py out/finding-the-address.mp4 --name finding-the-address.mp4

Exit codes:
    0  uploaded, or Drive intentionally not configured (skipped with a warning)
    1  configured but the upload failed
"""
import argparse
import hashlib
import json
import os
import sys

SCOPES = ["https://www.googleapis.com/auth/drive"]
MIME = "video/mp4"

try:
    from googleapiclient.errors import HttpError
except ImportError:  # Drive is optional; keep the import from breaking the script
    class HttpError(Exception):
        pass


def log(msg: str) -> None:
    print(msg, flush=True)


def fail(msg: str) -> None:
    print(f"::error::{msg}", flush=True)
    sys.exit(1)


def warn(msg: str) -> None:
    print(f"::warning::{msg}", flush=True)


def load_credentials():
    """Return service-account credentials, or None when Drive is not configured."""
    raw = os.environ.get("GDRIVE_SA_JSON", "").strip()
    if raw:
        try:
            info = json.loads(raw)
        except json.JSONDecodeError as exc:
            fail(f"GDRIVE_SA_JSON is not valid JSON: {exc}")
        if info.get("type") != "service_account":
            fail("GDRIVE_SA_JSON is not a service-account key (expected \"type\": \"service_account\")")
        from google.oauth2 import service_account

        return service_account.Credentials.from_service_account_info(info, scopes=SCOPES)

    path = os.environ.get("GDRIVE_SA_FILE", "").strip()
    if path and os.path.exists(path):
        from google.oauth2 import service_account

        return service_account.Credentials.from_service_account_file(path, scopes=SCOPES)

    return None


def find_target(svc, file_id: str, name: str, folder: str) -> dict:
    if file_id:
        meta = svc.files().get(
            fileId=file_id, fields="id,name,size,mimeType,webViewLink", supportsAllDrives=True
        ).execute()
        return meta

    if not name:
        fail("nothing to target: pass --file-id, or --name together with GDRIVE_FOLDER_ID")
    if not folder:
        fail("GDRIVE_FOLDER_ID is required when targeting a file by name")

    query = f"'{folder}' in parents and name = '{name}' and trashed = false"
    found = svc.files().list(
        q=query,
        fields="files(id,name,size,mimeType,webViewLink,modifiedTime)",
        orderBy="modifiedTime desc",
        pageSize=1,
        supportsAllDrives=True,
        includeItemsFromAllDrives=True,
    ).execute().get("files", [])

    if not found:
        fail(
            f"no file named '{name}' in folder {folder}. "
            "Service accounts cannot create files (zero quota); upload the file once by hand, "
            "then every render overwrites it."
        )
    return found[0]


def md5_of(path: str) -> str:
    digest = hashlib.md5()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser(description="Overwrite a Drive file with a rendered video.")
    parser.add_argument("file", help="local video to upload")
    parser.add_argument("--file-id", default=os.environ.get("GDRIVE_FILE_ID", "").strip())
    parser.add_argument("--name", default=os.environ.get("GDRIVE_FILE_NAME", "").strip())
    parser.add_argument("--folder", default=os.environ.get("GDRIVE_FOLDER_ID", "").strip())
    args = parser.parse_args()

    if not os.path.exists(args.file):
        fail(f"local file not found: {args.file}")

    size_local = os.path.getsize(args.file)
    if size_local < 100_000:
        fail(f"refusing to upload {size_local} bytes, that is not a video")

    creds = load_credentials()
    if creds is None:
        warn(
            "Google Drive is not configured (GDRIVE_SA_JSON missing). "
            f"Skipping upload of {os.path.basename(args.file)}; the Actions artifact still exists."
        )
        return 0

    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
    from googleapiclient.http import MediaFileUpload

    svc = build("drive", "v3", credentials=creds, cache_discovery=False)

    target = find_target(svc, args.file_id, args.name, args.folder)
    log(f"target   : {target['name']} ({target.get('size', '?')} bytes, version {target.get('version', '?')})")
    log(f"local    : {args.file} ({size_local} bytes)")

    local_md5 = md5_of(args.file)
    log(f"md5      : {local_md5}")

    body = {}
    if args.name and target["name"] != args.name:
        body["name"] = args.name

    media = MediaFileUpload(args.file, mimetype=MIME, resumable=True, chunksize=8 * 1024 * 1024)
    request = svc.files().update(
        fileId=target["id"],
        body=body or None,
        media_body=media,
        fields="id,name,size,version,md5Checksum,webViewLink",
        supportsAllDrives=True,
    )

    log("uploading (resumable, 8 MiB chunks)...")
    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            log(f"  {int(status.progress() * 100):3d}%  {status.resumable_progress / 1e6:7.1f} MB")

    remote_size = int(response.get("size", 0))
    remote_md5 = response.get("md5Checksum", "")
    if remote_size != size_local:
        fail(f"size mismatch after upload: local {size_local}, remote {remote_size}")
    if remote_md5 and remote_md5 != local_md5:
        fail(f"checksum mismatch after upload: local {local_md5}, remote {remote_md5}")

    log(f"uploaded : version {response.get('version')}, {remote_size} bytes")
    log(f"link     : {response.get('webViewLink')}")
    print(
        f"::notice::Drive upload verified: {response['name']} v{response.get('version')} "
        f"({remote_size} bytes, md5 match)",
        flush=True,
    )

    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a", encoding="utf-8") as handle:
            handle.write(
                "\n### Google Drive\n\n"
                f"| | |\n|---|---|\n"
                f"| file | [{response['name']}]({response.get('webViewLink')}) |\n"
                f"| version | {response.get('version')} |\n"
                f"| size | {remote_size} bytes |\n"
                f"| checksum | md5 verified |\n"
            )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except HttpError as exc:  # noqa: F821 - imported lazily in main
        print(f"::error::Drive API error: {exc}", flush=True)
        raise SystemExit(1)
