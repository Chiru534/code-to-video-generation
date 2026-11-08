import os
import json
from google.oauth2 import service_account
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SCOPES = ['https://www.googleapis.com/auth/drive']

class HeadlessDriveManager:
    """
    Headless Google Drive Manager (Zero-Popup / MongoDB Style).
    Supports either:
      1. Service Account JSON key (for automated backend uploads)
      2. OAuth2 Refresh Token (for direct 5TB personal/workspace accounts)
    """

    def __init__(self, credentials_path=None, credentials_dict=None):
        self.creds = None
        self.service = None
        self._init_credentials(credentials_path, credentials_dict)

    def _init_credentials(self, credentials_path, credentials_dict):
        # 1. Direct dictionary
        if credentials_dict:
            if "type" in credentials_dict and credentials_dict["type"] == "service_account":
                self.creds = service_account.Credentials.from_service_account_info(
                    credentials_dict, scopes=SCOPES
                )
            else:
                self.creds = Credentials.from_authorized_user_info(credentials_dict, scopes=SCOPES)
        # 2. File path
        elif credentials_path and os.path.exists(credentials_path):
            with open(credentials_path, "r") as f:
                data = json.load(f)
            if "type" in data and data["type"] == "service_account":
                self.creds = service_account.Credentials.from_service_account_file(
                    credentials_path, scopes=SCOPES
                )
            else:
                self.creds = Credentials.from_authorized_user_file(credentials_path, scopes=SCOPES)
        # 3. Environment variable fallback
        elif os.environ.get("GDRIVE_SERVICE_ACCOUNT_JSON"):
            data = json.loads(os.environ["GDRIVE_SERVICE_ACCOUNT_JSON"])
            self.creds = service_account.Credentials.from_service_account_info(data, scopes=SCOPES)

        if not self.creds:
            raise ValueError(
                "No valid Google Drive credentials provided. "
                "Provide a Service Account JSON or OAuth2 credentials file."
            )

        self.service = build('drive', 'v3', credentials=self.creds)

    def upload_file(self, local_file_path, folder_id, file_name=None, mime_type=None):
        """
        Uploads a file headlessly to a specific Google Drive folder.
        Returns the file metadata including ID and direct webViewLink.
        """
        if not os.path.exists(local_file_path):
            raise FileNotFoundError(f"Local file not found: {local_file_path}")

        name = file_name or os.path.basename(local_file_path)
        media = MediaFileUpload(local_file_path, mimetype=mime_type, resumable=True)

        file_metadata = {
            'name': name,
            'parents': [folder_id]
        }

        print(f"[HeadlessDrive] Uploading {name} to folder {folder_id}...")
        file = self.service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, name, webViewLink, webContentLink, size'
        ).execute()

        print(f"[HeadlessDrive] Upload Complete! ID: {file.get('id')}")
        print(f"[HeadlessDrive] Direct Link: {file.get('webViewLink')}")
        return file

    def list_folder_files(self, folder_id, max_results=20):
        """Lists files in a specific folder."""
        query = f"'{folder_id}' in parents and trashed = false"
        results = self.service.files().list(
            q=query,
            pageSize=max_results,
            fields="files(id, name, mimeType, size, webViewLink)"
        ).execute()
        return results.get('files', [])

if __name__ == "__main__":
    print("Headless Drive Manager ready for integration.")

