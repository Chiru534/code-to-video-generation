# Google Drive — Permanent Storage Reference

**Status as of 2026-11-08: NOT AUTHORIZED.** The credential files were lost in the folder wipe. This document explains how to reconnect Drive; it deliberately contains **no folder IDs, account emails, or keys**. Those identifiers are stored only in your local, unpublished notes.

## Target destination

| Item | Value |
|---|---|
| Base directory | `Drive/MyDrive/blender_s1/` |
| Folder ID | *(kept out of version control — local notes only)* |
| 5 TB account | Personal (or Workspace) Google Drive — **unverified by me; I never saw quota** |
| Purpose | Permanent storage for generated media (clips, audio, renders, final masters) — binaries live here, source lives in GitHub |

## Access paths in the codebase (committed on GitHub)

| Script | Auth route | Notes |
|---|---|---|
| `scripts/gdrive_headless.py` | Service account JSON, or env `GDRIVE_SERVICE_ACCOUNT_JSON`, or OAuth file | `HeadlessDriveManager` — upload/list files headlessly |
| `scripts/gdrive_oauth_login.py` | OAuth user flow, `localhost:8085` | Rebuild with your own installed-app OAuth client; the original script contained a hardcoded installed-app client ID — rotate it if you reuse it |
| `scripts/setup_drive_oauth.py` | OAuth setup helper | — |

## What is required before anything can be stored there

1. **Personal Google Drive:** service accounts have **zero quota** — files would be created with the service account owning them, and personal accounts cannot delegate quota. The correct route is **OAuth as you**: run `gdrive_oauth_login.py`, approve once in a browser, and the refresh token is stored locally.
2. **Workspace Shared Drive:** a service account works directly — but only if the `blender_s1/` folder lives in a Shared Drive and the service account was added to it. This does not apply to a personal 5 TB account.

## Hard rules

- Never commit `gdrive_service_account.json` or `gdrive_oauth_token.json` to GitHub — only the upload *scripts* contain identifiers.
- Verify quota/folder presence after re-authorization via `os.path.exists()` / Drive API `about.get` before uploading.
