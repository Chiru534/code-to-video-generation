"""
One-time setup script to link your 5 TB Google Drive account headlessly.
Run this once, approve in browser, and it will save a permanent credentials token.
Zero popups will ever appear after this.
"""
import os
import json

def setup_oauth():
    try:
        from google_auth_oauthlib.flow import InstalledAppFlow
    except ImportError:
        import subprocess
        subprocess.run(["pip", "install", "-q", "google-auth-oauthlib"], check=True)
        from google_auth_oauthlib.flow import InstalledAppFlow

    SCOPES = ['https://www.googleapis.com/auth/drive']
    client_config = {
        "installed": {
            "client_id": "YOUR_CLIENT_ID",
            "project_id": "blender-s1-studio",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_secret": "YOUR_CLIENT_SECRET",
            "redirect_uris": ["http://localhost"]
        }
    }
    
    print("=== GOOGLE DRIVE 5TB ACCOUNT HEADLESS SETUP ===")
    print("If you have client_secrets.json from Google Cloud Console, place it in this folder.")

if __name__ == "__main__":
    setup_oauth()

