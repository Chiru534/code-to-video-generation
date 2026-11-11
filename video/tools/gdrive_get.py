"""Download a delivered video from Drive, so a single scene can be re-rendered
and spliced back in.

The re-render pipeline is destructive by design: it writes the whole MP4. A
targeted clip replacement needs the OTHER scenes to survive untouched, so the
current file has to come back first.

The dated folder is found by the `<date>_<slug>` prefix, exactly the way
gdrive_upload.py creates it, so the two agree on where a video lives.

Usage:
    python tools/gdrive_get.py littlebit-film --out out/littlebit-film.mp4
    python tools/gdrive_get.py training-memory --shorts --out out/x.mp4
"""
import argparse
import os
import sys

SCOPES = ["https://www.googleapis.com/auth/drive"]
FOLDER_MIME = "application/vnd.google-apps.folder"


def log(msg: str) -> None:
    print(msg, flush=True)


def fail(msg: str) -> None:
    print(f"::error::{msg}", flush=True)
    sys.exit(1)


def credentials():
    refresh = os.environ.get("GDRIVE_REFRESH_TOKEN", "").strip()
    client_id = os.environ.get("GDRIVE_CLIENT_ID", "").strip()
    client_secret = os.environ.get("GDRIVE_CLIENT_SECRET", "").strip()
    if refresh and client_id and client_secret:
        from google.oauth2.credentials import Credentials

        return Credentials(
            None,
            refresh_token=refresh,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=client_id,
            client_secret=client_secret,
            scopes=SCOPES,
        )
    raw = os.environ.get("GDRIVE_SA_JSON", "").strip()
    path = os.environ.get("GDRIVE_SA_FILE", "").strip()
    if raw:
        import json

        from google.oauth2 import service_account

        return service_account.Credentials.from_service_account_info(
            json.loads(raw), scopes=SCOPES
        )
    if path and os.path.exists(path):
        from google.oauth2 import service_account

        return service_account.Credentials.from_service_account_file(path, scopes=SCOPES)
    fail("Google Drive is not configured")


def main() -> int:
    parser = argparse.ArgumentParser(description="Download a delivered video.")
    parser.add_argument("name", help="file name, e.g. littlebit-film.mp4")
    parser.add_argument("--out", required=True)
    parser.add_argument("--shorts", action="store_true", help="look in the shorts folder")
    parser.add_argument("--slug", default="", help="dated-folder slug (default: the file stem)")
    args = parser.parse_args()

    creds = credentials()
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaIoBaseDownload

    svc = build("drive", "v3", credentials=creds, cache_discovery=False)

    parent = os.environ.get(
        "GDRIVE_SHORTS_FOLDER_ID" if args.shorts else "GDRIVE_FOLDER_ID", ""
    ).strip()
    if not parent:
        fail("set GDRIVE_FOLDER_ID (or GDRIVE_SHORTS_FOLDER_ID with --shorts)")

    # The dated folder is named <date>_<slug>, and the slug is the episode's
    # slug, which is not always the file stem: the timed folder also holds
    # <slug>-timings.json and <slug>-audio.zip.
    slug = args.slug or os.path.splitext(os.path.basename(args.name))[0]
    folders = svc.files().list(
        q=f"'{parent}' in parents and mimeType = '{FOLDER_MIME}' and trashed = false",
        fields="files(id,name)",
        pageSize=200,
        supportsAllDrives=True,
        includeItemsFromAllDrives=True,
    ).execute().get("files", [])
    dated = [f for f in folders if f["name"].endswith("_" + slug)]
    if not dated:
        fail(f"no dated folder ending in _{slug} under the parent")
    folder = sorted(dated, key=lambda f: f["name"])[-1]
    log(f"folder   : {folder['name']}")

    found = svc.files().list(
        q=(
            f"'{folder['id']}' in parents and name = '{args.name}' "
            f"and mimeType != '{FOLDER_MIME}' and trashed = false"
        ),
        fields="files(id,name,size,md5Checksum)",
        supportsAllDrives=True,
        includeItemsFromAllDrives=True,
    ).execute().get("files", [])
    if not found:
        fail(f"'{args.name}' not found in {folder['name']}")

    meta = found[0]
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    request = svc.files().get_media(fileId=meta["id"])
    with open(args.out, "wb") as handle:
        downloader = MediaIoBaseDownload(handle, request)
        done = False
        while not done:
            _status, done = downloader.next_chunk()
    size = os.path.getsize(args.out)
    log(f"downloaded: {args.out} ({size:,} bytes, md5 {meta.get('md5Checksum')})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
