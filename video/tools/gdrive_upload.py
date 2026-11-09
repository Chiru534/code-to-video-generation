"""Put a rendered video into Google Drive from CI, with no manual step.

Credential order
----------------
1. OAuth refresh token (GDRIVE_REFRESH_TOKEN + client id/secret)
   -> uploads run as the human, bill the human's quota, and can CREATE files.
2. Service-account key (GDRIVE_SA_JSON)
   -> fallback. Can only overwrite a file the human already owns, because a free
      service account has zero storage quota and Google refuses to create bytes
      on its behalf (403 storageQuotaExceeded).

Behaviour
---------
Look the name up in the target folder. If it exists, update it in place: same
file id, same link, new version, and Drive keeps the previous renders in the
file's version history. If it does not exist, create it (OAuth only).

Environment:
    GDRIVE_REFRESH_TOKEN, GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET   (preferred)
    GDRIVE_SA_JSON / GDRIVE_SA_FILE                                (fallback)
    GDRIVE_FOLDER_ID       destination folder
    GDRIVE_FILE_ID         exact file to overwrite (skips the name lookup)
    GDRIVE_FILE_NAME       name to look up / create

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


def _user_credentials():
    refresh = os.environ.get("GDRIVE_REFRESH_TOKEN", "").strip()
    client_id = os.environ.get("GDRIVE_CLIENT_ID", "").strip()
    client_secret = os.environ.get("GDRIVE_CLIENT_SECRET", "").strip()
    if not (refresh and client_id and client_secret):
        return None
    from google.oauth2.credentials import Credentials

    return Credentials(
        None,
        refresh_token=refresh,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=client_id,
        client_secret=client_secret,
        scopes=SCOPES,
    )


def _service_credentials():
    raw = os.environ.get("GDRIVE_SA_JSON", "").strip()
    if raw:
        try:
            info = json.loads(raw)
        except json.JSONDecodeError as exc:
            fail(f"GDRIVE_SA_JSON is not valid JSON: {exc}")
        if info.get("type") != "service_account":
            fail('GDRIVE_SA_JSON is not a service-account key (expected "type": "service_account")')
        from google.oauth2 import service_account

        return service_account.Credentials.from_service_account_info(info, scopes=SCOPES)

    path = os.environ.get("GDRIVE_SA_FILE", "").strip()
    if path and os.path.exists(path):
        from google.oauth2 import service_account

        return service_account.Credentials.from_service_account_file(path, scopes=SCOPES)
    return None


def find_existing(svc, file_id: str, name: str, folder: str) -> dict | None:
    if file_id:
        return svc.files().get(
            fileId=file_id,
            fields="id,name,size,mimeType,version,webViewLink",
            supportsAllDrives=True,
        ).execute()

    if not (name and folder):
        return None

    query = (
        f"'{folder}' in parents and name = '{name}' "
        "and mimeType != 'application/vnd.google-apps.folder' and trashed = false"
    )
    found = svc.files().list(
        q=query,
        fields="files(id,name,size,mimeType,version,webViewLink)",
        orderBy="modifiedTime desc",
        pageSize=1,
        supportsAllDrives=True,
        includeItemsFromAllDrives=True,
    ).execute().get("files", [])
    return found[0] if found else None


def md5_of(path: str) -> str:
    digest = hashlib.md5()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser(description="Send a rendered video to Google Drive.")
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

    user_creds = _user_credentials()
    sa_creds = _service_credentials() if user_creds is None else None
    creds = user_creds or sa_creds
    if creds is None:
        warn(
            "Google Drive is not configured (no refresh token or service-account key). "
            f"Skipping upload of {os.path.basename(args.file)}; the Actions artifact still exists."
        )
        return 0

    mode = "oauth-user" if user_creds else "service-account"
    if user_creds is None:
        warn(
            "Using the service-account fallback: it can only overwrite an existing "
            "file, never create one (zero storage quota)."
        )

    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload

    svc = build("drive", "v3", credentials=creds, cache_discovery=False)

    local_md5 = md5_of(args.file)
    log(f"auth     : {mode}")
    log(f"local    : {args.file} ({size_local} bytes, md5 {local_md5})")

    existing = find_existing(svc, args.file_id, args.name, args.folder)
    media = MediaFileUpload(args.file, mimetype=MIME, resumable=True, chunksize=8 * 1024 * 1024)

    if existing:
        log(f"action   : update '{existing['name']}' v{existing.get('version')} (same link, new version)")
        request = svc.files().update(
            fileId=existing["id"],
            media_body=media,
            fields="id,name,size,version,md5Checksum,webViewLink",
            supportsAllDrives=True,
        )
    else:
        if not args.folder:
            fail("GDRIVE_FOLDER_ID is required to create a new file")
        if not args.name:
            fail("GDRIVE_FILE_NAME is required to create a new file")
        log(f"action   : create '{args.name}' in folder {args.folder}")
        request = svc.files().create(
            body={"name": args.name, "parents": [args.folder], "mimeType": MIME},
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

    link = response.get("webViewLink") or f"https://drive.google.com/file/d/{response['id']}/view"
    log(f"verified : {remote_size} bytes, md5 match, version {response.get('version')}")
    log(f"link     : {link}")
    print(
        f"::notice::Drive upload verified: {response['name']} v{response.get('version')} "
        f"({remote_size} bytes) {link}",
        flush=True,
    )

    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a", encoding="utf-8") as handle:
            handle.write(
                "\n### Google Drive\n\n"
                "| | |\n|---|---|\n"
                f"| file | [{response['name']}]({link}) |\n"
                f"| action | {'updated' if existing else 'created'} |\n"
                f"| version | {response.get('version')} |\n"
                f"| size | {remote_size} bytes |\n"
                f"| checksum | md5 verified |\n"
                f"| auth | {mode} |\n"
            )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except HttpError as exc:
        detail = str(exc)
        if "storageQuotaExceeded" in detail:
            detail += (
                "\nThe service account has no storage quota. Configure GDRIVE_REFRESH_TOKEN "
                "so uploads run as the Drive owner."
            )
        print(f"::error::Drive API error: {detail}", flush=True)
        raise SystemExit(1)
