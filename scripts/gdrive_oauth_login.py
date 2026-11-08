import urllib.request
import urllib.parse
import json
import webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler
import sys

CLIENT_ID = os.environ.get("GDRIVE_OAUTH_CLIENT_ID", "")
CLIENT_SECRET = os.environ.get("GDRIVE_OAUTH_CLIENT_SECRET", "")
PORT = 8085
REDIRECT_URI = f"http://localhost:{PORT}/"
SCOPES = "https://www.googleapis.com/auth/drive"

auth_code = None

class OAuthCallbackHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        global auth_code
        parsed_url = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed_url.query)
        if 'code' in params:
            auth_code = params['code'][0]
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b"<html><body style='font-family:sans-serif;text-align:center;padding:50px;background:#0b0f19;color:#00F0FF;'><h1>&#10004; Authorization Successful!</h1><p style='color:#fff;'>You can close this tab now. Google Drive is connected headlessly.</p></body></html>")
        else:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b"Failed to receive authorization code.")

    def log_message(self, format, *args):
        pass # Silence server logs

def get_tokens():
    global auth_code
    auth_params = {
        'client_id': CLIENT_ID,
        'redirect_uri': REDIRECT_URI,
        'response_type': 'code',
        'scope': SCOPES,
        'access_type': 'offline',
        'prompt': 'consent'
    }
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(auth_params)}"
    
    print("\n=== GOOGLE DRIVE 5TB HEADLESS AUTHORIZATION ===")
    print("1. Opening browser to authorize your 5TB Google Account...")
    print(f"URL: {auth_url}\n")
    
    webbrowser.open(auth_url)
    
    server = HTTPServer(('localhost', PORT), OAuthCallbackHandler)
    print("2. Waiting for approval in browser...")
    while not auth_code:
        server.handle_request()
    server.server_close()
    
    print("3. Authorization code received! Exchanging for permanent tokens...")
    token_url = "https://oauth2.googleapis.com/token"
    token_data = urllib.parse.urlencode({
        'code': auth_code,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'redirect_uri': REDIRECT_URI,
        'grant_type': 'authorization_code'
    }).encode('utf-8')
    
    req = urllib.request.Request(token_url, data=token_data, method='POST')
    try:
        with urllib.request.urlopen(req) as response:
            tokens = json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print("Token exchange error:", e.read().decode('utf-8'))
        return None
        
    token_file = "D:/New folder/gdrive_oauth_token.json"
    with open(token_file, "w") as f:
        json.dump(tokens, f, indent=2)
        
    print(f"\n[SUCCESS] Permanent OAuth tokens saved to: {token_file}")
    print(f"Has Refresh Token: {'refresh_token' in tokens}")
    return tokens

def list_drive_files(access_token):
    print("\n=== QUERYING FILES IN YOUR 5TB GOOGLE DRIVE ===")
    url = "https://www.googleapis.com/drive/v3/files?pageSize=20&fields=files(id,name,size,mimeType,modifiedTime)"
    req = urllib.request.Request(url, headers={'Authorization': f'Bearer {access_token}'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            files = data.get('files', [])
            print(f"Total files found (first {len(files)}):")
            for f in files:
                sz = f"{int(f['size'])/(1024**2):.2f} MB" if 'size' in f else "Folder/Doc"
                print(f"  - {f['name']} ({sz}) | ID: {f['id']}")
            return files
    except Exception as e:
        print("Drive listing error:", e)

if __name__ == "__main__":
    tokens = get_tokens()
    if tokens and 'access_token' in tokens:
        list_drive_files(tokens['access_token'])

