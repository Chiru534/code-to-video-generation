"""Delete videos from the Drive production folders, from CI.

Deliberately narrow. It removes named videos from a named parent folder, and
cleans up the dated folder that only existed to hold them. Nothing else is
touched: other files, other folders, and the shorts stay exactly as they are.

Every delete goes to Drive's trash, not straight to oblivion, so a mistake is
recoverable for 30 days.

Usage:
    python tools/gdrive_delete.py --in main --video HERO_NOVA.mp4
    python tools/gdrive_delete.py --in main --video a.mp4 --video b.mp4 --apply
"""
import argparse
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from gdrive_upload import (  # noqa: E402
    FOLDER_MIME,
    _user_credentials,
    child_folders,
    log,
)

# A dated folder looks like 2026-11-10_littlebit. Other folders may contain
# underscores too (studio_15min_documentary), so matching on "_" alone is
# wrong and once deleted the wrong copy of a file.
DATED = re.compile(r"^\d{4}-\d{2}-\d{2}_")


def list_children(svc, parent):
    return (
        svc.files()
        .list(
            q=f"'{parent}' in parents and trashed = false",
            fields="files(id,name,mimeType,size)",
            orderBy="name",
            pageSize=200,
            supportsAllDrives=True,
            includeItemsFromAllDrives=True,
        )
        .execute()
        .get("files", [])
    )


def list_trash(svc):
    """List what is in the Drive trash, with the ids needed to restore it."""
    items = (
        svc.files()
        .list(
            q="trashed = true",
            fields="files(id,name,mimeType,size,trashed,originalParents)",
            orderBy="trashedTime desc",
            pageSize=100,
            supportsAllDrives=True,
            includeItemsFromAllDrives=True,
        )
        .execute()
        .get("files", [])
    )
    if not items:
        log("trash    : empty")
    for item in items:
        size = f"{int(item.get('size', 0)) / 1e6:9.1f} MB"
        log(f"trash    : {item['name']:46s} {size}  id={item['id']}  "
            f"was in {item.get('originalParents')}")
    return items


def find_video(svc, parent, name):
    """Find a file by name under `parent`.

    Dated folders are searched before other subfolders, so a file that exists
    both in `<date>_<slug>/` and in a project folder is taken from the dated
    one. Otherwise the wrong copy gets deleted.
    """
    wanted = name.lower()
    for item in list_children(svc, parent):
        if item["mimeType"] == FOLDER_MIME:
            continue
        if item["name"].lower() == wanted:
            return item, parent
    folders = child_folders(svc, parent)
    dated = [f for f in folders if DATED.match(f["name"])]
    other = [f for f in folders if not DATED.match(f["name"])]
    for folder in dated + other:
        for item in list_children(svc, folder["id"]):
            if item["mimeType"] == FOLDER_MIME:
                continue
            if item["name"].lower() == wanted:
                return item, folder["id"]
    return None, None


def trash(svc, file_id):
    svc.files().delete(fileId=file_id, supportsAllDrives=True).execute()


def restore(svc, file_id):
    """Bring a trashed file back, to the folder it was in."""
    svc.files().update(
        fileId=file_id,
        body={"trashed": False},
        fields="id,name,parents",
        supportsAllDrives=True,
    ).execute()


def empty_dated_folders(svc, parent):
    """Remove dated folders left with nothing in them."""
    for folder in child_folders(svc, parent):
        if not DATED.match(folder["name"]):
            continue
        contents = list_children(svc, folder["id"])
        if not contents:
            log(f"folder   : '{folder['name']}' is now empty, removing it")
            trash(svc, folder["id"])


def main() -> int:
    parser = argparse.ArgumentParser(description="Delete videos from Drive.")
    parser.add_argument("--folder", default=os.environ.get("GDRIVE_FOLDER_ID", "").strip())
    parser.add_argument(
        "--shorts-folder", default=os.environ.get("GDRIVE_SHORTS_FOLDER_ID", "").strip()
    )
    parser.add_argument(
        "--in",
        dest="where",
        default="main",
        choices=["main", "shorts"],
        help="which parent folder to search",
    )
    parser.add_argument(
        "--video",
        action="append",
        default=[],
        help="exact file name to delete (repeatable)",
    )
    parser.add_argument(
        "--also-folder",
        default="",
        help="name of a whole subfolder to delete as well (recursive)",
    )
    parser.add_argument(
        "--file-id",
        action="append",
        default=[],
        help="delete this exact file id (repeatable); no name lookup",
    )
    parser.add_argument(
        "--restore-id",
        action="append",
        default=[],
        help="bring this trashed file id back to where it was (repeatable)",
    )
    parser.add_argument(
        "--list-trash",
        action="store_true",
        help="list what is in the Drive trash, with ids, and stop",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="actually delete; without it the script only prints the plan",
    )
    args = parser.parse_args()

    parent = args.folder if args.where == "main" else args.shorts_folder
    if not parent:
        print(f"::error::the {args.where} folder is not configured", flush=True)
        return 1

    creds = _user_credentials()
    if creds is None:
        print(
            "::error::this script needs the OAuth refresh token (GDRIVE_REFRESH_TOKEN "
            "+ client id/secret).",
            flush=True,
        )
        return 1

    from googleapiclient.discovery import build

    svc = build("drive", "v3", credentials=creds, cache_discovery=False)

    if args.list_trash:
        list_trash(svc)
        return 0

    deleted = 0
    for file_id in args.restore_id:
        log(f"restore  : {file_id}")
        if args.apply:
            restore(svc, file_id)
            log(f"restored : {file_id} is back in its folder")

    for file_id in args.file_id:
        log(f"target   : file id {file_id}")
        if args.apply:
            trash(svc, file_id)
            deleted += 1
            log(f"deleted  : {file_id} -> Drive trash")

    for name in args.video:
        item, holder = find_video(svc, parent, name)
        if item is None:
            log(f"not found: {name} (nothing was deleted for it)")
            continue
        log(f"target   : {item['name']}  {int(item.get('size', 0)) / 1e6:.1f} MB  "
            f"(in folder {holder})")
        if args.apply:
            trash(svc, item["id"])
            deleted += 1
            log(f"deleted  : {item['name']} -> Drive trash")

    if args.also_folder:
        for folder in child_folders(svc, parent):
            if folder["name"].lower() == args.also_folder.lower():
                log(f"target   : whole folder '{folder['name']}'")
                if args.apply:
                    trash(svc, folder["id"])
                    deleted += 1
                    log(f"deleted  : folder '{folder['name']}' -> Drive trash")
            else:
                log(f"not found: folder '{args.also_folder}'")

    if args.apply:
        empty_dated_folders(svc, parent)
        log(f"done: {deleted} item(s) moved to the Drive trash")
    else:
        log("dry run: nothing deleted. Add --apply to do it.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
