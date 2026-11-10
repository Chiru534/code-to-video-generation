"""Reorganise the Drive folders into dated per-video folders. No rendering.

What it does
------------
For each parent folder (the main folder and the shorts folder):

1. list the videos sitting directly in it (the old flat layout)
2. work out the date each video was created, from Drive's own createdTime
3. create (or reuse) a folder named ``<created-date>_<stem>`` in that parent
4. move the video into it, plus the files that belong to it (a thumbnail, a
   subtitle), so each folder is self-contained
5. give every video a thumbnail next to it, if it does not have one yet

Nothing is deleted and no video is re-rendered. Running it twice changes
nothing the second time.

Environment:
    GDRIVE_REFRESH_TOKEN, GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET
    GDRIVE_FOLDER_ID          main destination folder
    GDRIVE_SHORTS_FOLDER_ID   destination for short videos
    GDRIVE_DATE               fallback date for files with no createdTime
"""
import argparse
import os
import subprocess
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from gdrive_upload import (  # noqa: E402
    FOLDER_MIME,
    _user_credentials,
    child_folders,
    dated_folder,
    log,
    mime_for,
    upload_file,
)

VIDEO_EXT = (".mp4", ".mov", ".mkv", ".webm")
CHUNK_BYTES = 24 * 1024 * 1024  # enough for the first ~10 s of a 20 Mbps file
THUMB_SECONDS = 4.0

BLUR_16x9 = (
    "[0:v]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,"
    "gblur=sigma=60,eq=brightness=-0.22:saturation=1.25[bg];"
    "[0:v]scale=-2:720[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2"
)


def list_children(svc, parent):
    return (
        svc.files()
        .list(
            q=f"'{parent}' in parents and trashed = false",
            fields="files(id,name,mimeType,size,createdTime,webViewLink)",
            orderBy="name",
            pageSize=200,
            supportsAllDrives=True,
            includeItemsFromAllDrives=True,
        )
        .execute()
        .get("files", [])
    )


def is_video(item) -> bool:
    return item["name"].lower().endswith(VIDEO_EXT)


def stem_of(item) -> str:
    return os.path.splitext(item["name"])[0]


def date_of(item, fallback: str) -> str:
    created = item.get("createdTime", "")
    if len(created) >= 10:
        return created[:10]
    return fallback


def token_for(creds):
    if not creds.valid:
        from google.auth.transport.requests import Request

        creds.refresh(Request())
    return creds.token


def fetch_head(svc, creds, file_id, path):
    """Download the first CHUNK_BYTES of a file into `path`.

    The renders are written with +faststart, so the index sits at the front
    and a partial file is still seekable by ffmpeg.
    """
    import requests

    url = f"https://www.googleapis.com/drive/v3/files/{file_id}?alt=media&supportsAllDrives=true"
    headers = {
        "Authorization": f"Bearer {token_for(creds)}",
        "Range": f"bytes=0-{CHUNK_BYTES - 1}",
    }
    response = requests.get(url, headers=headers, timeout=180)
    response.raise_for_status()
    data = response.content[:CHUNK_BYTES]
    if len(data) < 1024:
        return False
    with open(path, "wb") as handle:
        handle.write(data)
    return True


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, timeout=300)


def make_thumbnails(frame_png, width, height, out_dir, stem):
    """Build the 16:9 upload thumbnail (and the native 9:16 cover)."""
    made = []
    jpg = os.path.join(out_dir, f"{stem}-thumbnail.jpg")
    if width > height:
        result = run(
            ["ffmpeg", "-y", "-v", "error", "-i", frame_png,
             "-vf", "scale=1280:720:flags=lanczos", "-q:v", "3", jpg]
        )
    else:
        result = run(
            ["ffmpeg", "-y", "-v", "error", "-i", frame_png,
             "-filter_complex", BLUR_16x9, "-q:v", "3", jpg]
        )
    if result.returncode != 0 or not os.path.exists(jpg):
        return made
    made.append(jpg)

    if height > width:
        cover = os.path.join(out_dir, f"{stem}-thumbnail-9x16.jpg")
        result = run(
            ["ffmpeg", "-y", "-v", "error", "-i", frame_png,
             "-vf", "scale=1080:1920:flags=lanczos", "-q:v", "3", cover]
        )
        if result.returncode == 0 and os.path.exists(cover):
            made.append(cover)
    return made


def video_size(path):
    result = run(
        ["ffprobe", "-v", "error", "-select_streams", "v",
         "-show_entries", "stream=width,height", "-of", "csv=p=0", path]
    )
    if result.returncode != 0:
        return 0, 0
    parts = [p for p in result.stdout.strip().split(",") if p]
    if len(parts) < 2:
        return 0, 0
    return int(parts[0]), int(parts[1])


def thumbnail_for(svc, creds, item, out_dir, stem):
    """Frame -> thumbnails for one video. Returns [] if it cannot be done."""
    part = os.path.join(out_dir, f"{stem}-part.mp4")
    frame = os.path.join(out_dir, f"{stem}-frame.png")
    try:
        if not fetch_head(svc, creds, item["id"], part):
            return []
        result = run(
            ["ffmpeg", "-y", "-v", "error", "-ss", str(THUMB_SECONDS),
             "-i", part, "-frames:v", "1", "-update", "1", frame]
        )
        if result.returncode != 0 or not os.path.exists(frame):
            log(f"    ! no frame could be decoded from {item['name']}")
            return []
        width, height = video_size(part)
        return make_thumbnails(frame, width, height, out_dir, stem)
    except Exception as exc:  # a thumbnail must never break the migration
        log(f"    ! thumbnail failed for {item['name']}: {exc}")
        return []
    finally:
        for path in (part, frame):
            if os.path.exists(path):
                os.remove(path)


def move_into(svc, file_id, old_parent, new_parent):
    svc.files().update(
        fileId=file_id,
        addParents=new_parent,
        removeParents=old_parent,
        fields="id",
        supportsAllDrives=True,
    ).execute()


def ensure_thumbnail(svc, creds, folder_id, video, dry_run):
    """Give one video a thumbnail in its folder, if it has none."""
    contents = list_children(svc, folder_id)
    if any(c["name"].lower().endswith(".jpg") for c in contents):
        return True
    stem = stem_of(video)
    if dry_run:
        log(f"    would add a thumbnail for {video['name']}")
        return False
    with tempfile.TemporaryDirectory() as tmp:
        thumbs = thumbnail_for(svc, creds, video, tmp, stem)
    for path in thumbs:
        upload_file(svc, path, os.path.basename(path), folder_id, mime_for(path))
        log(f"    uploaded {os.path.basename(path)}")
    if not thumbs:
        log("    no thumbnail produced (the file may not be a faststart mp4)")
    return bool(thumbs)


def organise(svc, creds, parent, fallback_date, dry_run, label=""):
    children = list_children(svc, parent)
    videos = [c for c in children if is_video(c)]
    others = [c for c in children if not is_video(c) and c["mimeType"] != FOLDER_MIME]

    moved = 0
    for video in videos:
        stem = stem_of(video)
        date = date_of(video, fallback_date)
        folder_id, folder_name, created = dated_folder(
            svc, parent, stem, date, create=not dry_run
        )
        siblings = [
            o for o in others
            if o["name"] == stem or o["name"].startswith(stem + "-")
        ]

        if dry_run:
            log(f"{label}: would move {video['name']} -> {folder_name}/")
            for sib in siblings:
                log(f"    would move {sib['name']} too")
            continue

        log(f"{label}: {video['name']} -> {folder_name}/"
            f" [{'new folder' if created else 'existing folder'}]")
        move_into(svc, video["id"], parent, folder_id)
        for sib in siblings:
            move_into(svc, sib["id"], parent, folder_id)
            log(f"    moved {sib['name']}")
        moved += 1

        ensure_thumbnail(svc, creds, folder_id, video, dry_run)

    # Videos already sitting in a dated folder still need a thumbnail if the
    # folder does not have one. This is the common case on a second run.
    for folder in child_folders(svc, parent):
        contents = list_children(svc, folder["id"])
        for video in [c for c in contents if is_video(c)]:
            ensure_thumbnail(svc, creds, folder["id"], video, dry_run)

    if not moved and not dry_run:
        log(f"{label}: nothing flat to move")
    return moved


def main() -> int:
    parser = argparse.ArgumentParser(description="Sort Drive into dated folders.")
    parser.add_argument("--folder", default=os.environ.get("GDRIVE_FOLDER_ID", "").strip())
    parser.add_argument(
        "--shorts-folder", default=os.environ.get("GDRIVE_SHORTS_FOLDER_ID", "").strip()
    )
    parser.add_argument(
        "--date",
        default=os.environ.get("GDRIVE_DATE", "").strip(),
        help="fallback date for files with no createdTime (YYYY-MM-DD)",
    )
    parser.add_argument("--dry-run", action="store_true", help="plan only, change nothing")
    args = parser.parse_args()

    creds = _user_credentials()
    if creds is None:
        print(
            "::error::this script needs the OAuth refresh token (GDRIVE_REFRESH_TOKEN "
            "+ client id/secret). The service-account fallback cannot move files.",
            flush=True,
        )
        return 1

    from googleapiclient.discovery import build

    svc = build("drive", "v3", credentials=creds, cache_discovery=False)

    total = 0
    for parent, label in ((args.folder, "main"), (args.shorts_folder, "shorts")):
        if not parent:
            log(f"{label}: not configured, skipping")
            continue
        log(f"--- {label} folder ---")
        total += organise(svc, creds, parent, args.date, args.dry_run, label)

    log(f"done: {total} video(s) {'planned' if args.dry_run else 'placed'} in dated folders")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
