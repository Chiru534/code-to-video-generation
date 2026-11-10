"""Put a rendered video (and its thumbnails) into Google Drive from CI.

Credential order
----------------
1. OAuth refresh token (GDRIVE_REFRESH_TOKEN + client id/secret)
   -> uploads run as the human, bill the human's quota, and can CREATE files.
2. Service-account key (GDRIVE_SA_JSON)
   -> fallback. Can only overwrite a file the human already owns, because a free
      service account has zero storage quota and Google refuses to create bytes
      on its behalf (403 storageQuotaExceeded). It cannot create the dated
      folder either, for the same reason.

Layout
------
Every video gets its own dated folder under its parent, so both destinations
read as a chronology instead of a flat pile:

    <main folder>/
      2026-03-14_transformer/
        transformer.mp4
        transformer-thumbnail.jpg

    shorts/
      2026-11-10_littlebit/
        littlebit.mp4
        littlebit-thumbnail.jpg          YouTube 1280x720 upload spec
        littlebit-thumbnail-9x16.jpg     phone-shaped cover

Re-renders reuse the existing `*_<slug>` folder rather than creating a second
one on a later date; the date is when the video was first delivered, not when
it was last fixed.

A file that is still sitting flat in the parent (from before the dated layout)
is adopted: it is moved into the dated folder instead of being duplicated, so
the link you already shared keeps working.

Files are updated in place when the name already exists: same file id, same
link, new version, and Drive keeps the previous renders in version history.

Routing: a video shorter than the threshold goes to a dated short folder,
everything else to the main folder. Duration is read with ffprobe from the file
that was actually rendered — not from a config value, so the folder always
matches the bytes being uploaded.

Environment:
    GDRIVE_REFRESH_TOKEN, GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET   (preferred)
    GDRIVE_SA_JSON / GDRIVE_SA_FILE                                (fallback)
    GDRIVE_FOLDER_ID          main destination folder
    GDRIVE_SHORTS_FOLDER_ID   destination for videos under the threshold
    GDRIVE_SHORTS_MAX_SECONDS threshold, default 180
    GDRIVE_FILE_ID            exact file to overwrite (skips lookup and routing)
    GDRIVE_FILE_NAME          name to look up / create

Exit codes:
    0  uploaded, or Drive intentionally not configured (skipped with a warning)
    1  configured but the upload failed
"""
import argparse
import hashlib
import json
import os
import subprocess
import sys
from datetime import datetime, timezone

SCOPES = ["https://www.googleapis.com/auth/drive"]
MIME = "video/mp4"
FOLDER_MIME = "application/vnd.google-apps.folder"
FIELDS = "id,name,size,mimeType,version,md5Checksum,webViewLink"

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
            fields=FIELDS,
            supportsAllDrives=True,
        ).execute()

    if not (name and folder):
        return None

    query = (
        f"'{folder}' in parents and name = '{name}' "
        f"and mimeType != '{FOLDER_MIME}' and trashed = false"
    )
    found = svc.files().list(
        q=query,
        fields=f"files({FIELDS})",
        orderBy="modifiedTime desc",
        pageSize=1,
        supportsAllDrives=True,
        includeItemsFromAllDrives=True,
    ).execute().get("files", [])
    return found[0] if found else None


def child_folders(svc, parent: str) -> list:
    return svc.files().list(
        q=f"'{parent}' in parents and mimeType = '{FOLDER_MIME}' and trashed = false",
        fields="files(id,name)",
        orderBy="createdTime",
        pageSize=200,
        supportsAllDrives=True,
        includeItemsFromAllDrives=True,
    ).execute().get("files", [])


def dated_folder(svc, parent: str, slug: str, date: str, create: bool = True):
    """Return (id, name, created) for `<date>_<slug>` inside `parent`.

    Reuses any existing folder ending in `_<slug>` so a re-render does not
    scatter the same video across two dates. With create=False the folder is
    only looked up, never made, which is what the dry run needs.
    """
    for folder in child_folders(svc, parent):
        if folder["name"].endswith("_" + slug):
            return folder["id"], folder["name"], False

    name = f"{date}_{slug}"
    if not create:
        return "", name, False
    created = svc.files().create(
        body={"name": name, "mimeType": FOLDER_MIME, "parents": [parent]},
        fields="id,name",
        supportsAllDrives=True,
    ).execute()
    return created["id"], created["name"], True


def adopt_legacy(svc, parent: str, folder: str, name: str) -> str:
    """Move a pre-dated-layout file into `folder`, keeping its id and link.

    Without this, the first render after the dated layout arrived would leave
    the old flat file in place and create a second copy with a new link.
    """
    found = find_existing(svc, "", name, parent)
    if not found:
        return ""
    svc.files().update(
        fileId=found["id"],
        addParents=folder,
        removeParents=parent,
        fields="id",
        supportsAllDrives=True,
    ).execute()
    log(f"adopted  : moved existing '{name}' into the dated folder (link preserved)")
    return found["id"]


def mime_for(path: str) -> str:
    ext = os.path.splitext(path)[1].lower()
    return {".png": "image/png", ".webp": "image/webp"}.get(ext, "image/jpeg")


def md5_of(path: str) -> str:
    digest = hashlib.md5()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def probe_duration(path: str):
    """Duration in seconds, or None if ffprobe is missing or unhappy."""
    try:
        out = subprocess.run(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "csv=p=0",
                path,
            ],
            capture_output=True,
            text=True,
            timeout=120,
        )
        if out.returncode != 0:
            return None
        return float(out.stdout.strip())
    except (OSError, ValueError, subprocess.SubprocessError):
        return None


def upload_file(svc, path: str, name: str, folder: str, mimetype: str, file_id: str = ""):
    """Create or update one file. Returns (response, existed)."""
    from googleapiclient.http import MediaFileUpload

    size_local = os.path.getsize(path)
    local_md5 = md5_of(path)
    existing = find_existing(svc, file_id, name, folder)
    media = MediaFileUpload(path, mimetype=mimetype, resumable=True, chunksize=8 * 1024 * 1024)

    if existing:
        log(f"action   : update '{existing['name']}' v{existing.get('version')} (same link, new version)")
        request = svc.files().update(
            fileId=existing["id"],
            media_body=media,
            fields=FIELDS,
            supportsAllDrives=True,
        )
    else:
        if not folder:
            fail("no destination folder: set GDRIVE_FOLDER_ID (or GDRIVE_SHORTS_FOLDER_ID)")
        if not name:
            fail("GDRIVE_FILE_NAME is required to create a new file")
        log(f"action   : create '{name}' in folder {folder}")
        request = svc.files().create(
            body={"name": name, "parents": [folder], "mimeType": mimetype},
            media_body=media,
            fields=FIELDS,
            supportsAllDrives=True,
        )

    log(f"uploading {os.path.basename(path)} (resumable, 8 MiB chunks)...")
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
    log(
        f"verified : {response['name']} {remote_size} bytes, md5 match, "
        f"version {response.get('version')}"
    )
    return response, bool(existing)


def main() -> int:
    parser = argparse.ArgumentParser(description="Send a rendered video to Google Drive.")
    parser.add_argument("file", help="local video to upload")
    parser.add_argument("--file-id", default=os.environ.get("GDRIVE_FILE_ID", "").strip())
    parser.add_argument("--name", default=os.environ.get("GDRIVE_FILE_NAME", "").strip())
    parser.add_argument("--folder", default=os.environ.get("GDRIVE_FOLDER_ID", "").strip())
    parser.add_argument(
        "--shorts-folder", default=os.environ.get("GDRIVE_SHORTS_FOLDER_ID", "").strip()
    )
    parser.add_argument(
        "--shorts-max-seconds",
        type=float,
        default=float(os.environ.get("GDRIVE_SHORTS_MAX_SECONDS", "180")),
    )
    parser.add_argument(
        "--thumb",
        action="append",
        default=[],
        help="image to upload alongside the video (repeatable); goes in the same folder",
    )
    parser.add_argument(
        "--date",
        default=os.environ.get("GDRIVE_DATE", "").strip()
        or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        help="dated folder prefix, YYYY-MM-DD (default: today, UTC)",
    )
    args = parser.parse_args()

    if not os.path.exists(args.file):
        fail(f"local file not found: {args.file}")

    size_local = os.path.getsize(args.file)
    if size_local < 100_000:
        fail(f"refusing to upload {size_local} bytes, that is not a video")

    for thumb in args.thumb:
        if not os.path.exists(thumb):
            fail(f"thumbnail not found: {thumb}")

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

    svc = build("drive", "v3", credentials=creds, cache_discovery=False)

    log(f"auth     : {mode}")
    log(f"local    : {args.file} ({size_local} bytes, md5 {md5_of(args.file)})")

    slug = os.path.splitext(os.path.basename(args.file))[0]

    # Route by measured duration, so the folder always matches the real file.
    # Both destinations get a dated subfolder; only the parent changes.
    duration = None if args.file_id else probe_duration(args.file)
    target_folder = args.folder
    folder_name = ""
    folder_created = False
    routing = "explicit file id, folder not used"
    existing_id = args.file_id
    if not args.file_id:
        if duration is None:
            tag = "long-form"
            warn("could not read the video duration; treating it as long-form")
        elif args.shorts_folder and duration < args.shorts_max_seconds:
            tag = f"short {duration:.1f}s < {args.shorts_max_seconds:.0f}s"
            target_folder = args.shorts_folder
        else:
            tag = f"long-form {duration:.1f}s"
        log(f"duration : {duration:.2f}s" if duration is not None else "duration : unknown")

        if not target_folder:
            fail("no destination folder: set GDRIVE_FOLDER_ID (or GDRIVE_SHORTS_FOLDER_ID)")

        parent = target_folder
        target_folder, folder_name, folder_created = dated_folder(
            svc, parent, slug, args.date
        )
        routing = f"{tag} -> dated folder"
        log(f"folder   : {folder_name}  [{'created' if folder_created else 'existing'}]")

        existing_id = adopt_legacy(svc, parent, target_folder, args.name)

    response, existed = upload_file(
        svc, args.file, args.name, target_folder, MIME, existing_id
    )
    link = response.get("webViewLink") or f"https://drive.google.com/file/d/{response['id']}/view"

    thumbs = []
    if args.thumb:
        if not target_folder:
            warn("no folder resolved; skipping thumbnails")
        else:
            for thumb in args.thumb:
                uploaded, _ = upload_file(
                    svc, thumb, os.path.basename(thumb), target_folder, mime_for(thumb)
                )
                thumbs.append(uploaded)

    log(f"verified : {response['name']} v{response.get('version')}")
    log(f"link     : {link}")
    print(
        f"::notice::Drive upload verified: {response['name']} v{response.get('version')} "
        f"({response.get('size')} bytes) -> "
        f"{folder_name or target_folder} [{routing}] {link}",
        flush=True,
    )

    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        duration_row = f"| duration | {duration:.1f}s |\n" if duration is not None else ""
        folder_row = f"| folder | `{folder_name}` ({'created' if folder_created else 'existing'}) |\n" if folder_name else ""
        thumb_rows = "".join(
            f"| thumbnail | [{t['name']}]({t.get('webViewLink', '')}) |\n" for t in thumbs
        )
        with open(summary, "a", encoding="utf-8") as handle:
            handle.write(
                "\n### Google Drive\n\n"
                "| | |\n|---|---|\n"
                f"| file | [{response['name']}]({link}) |\n"
                f"| action | {'updated' if existed else 'created'} |\n"
                f"{duration_row}"
                f"{folder_row}"
                f"{thumb_rows}"
                f"| routing | {routing} |\n"
                f"| folder id | `{target_folder}` |\n"
                f"| version | {response.get('version')} |\n"
                f"| size | {response.get('size')} bytes |\n"
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
