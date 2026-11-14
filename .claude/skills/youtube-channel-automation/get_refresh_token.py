#!/usr/bin/env python3
"""Create a YouTube refresh token for ONE channel, on your own computer (not in a cloud session).

  python3 get_refresh_token.py

It asks for the agency's OAuth client ID and secret (Google Cloud project 168994544641, the same client
yt.py uses), opens Google's sign-in page in your browser, and catches the answer on http://127.0.0.1.
On Google's screen, choose the channel you want to connect (for example "As Printed"). The script then
prints which channel the token belongs to, and the refresh token itself.

Paste that token ONLY into the cloud environment's settings, as the environment variable named for the
channel (YT_REFRESH_TOKEN_ASPRINTED for As Printed). Never into a chat, a file in the repo, or a commit.
Standard library only (Python 3.8+).
"""
import getpass, hashlib, base64, http.server, json, os, secrets, sys, threading, urllib.parse, urllib.request, webbrowser

SCOPES = ["https://www.googleapis.com/auth/youtube.force-ssl", "https://www.googleapis.com/auth/youtube.upload",
          "https://www.googleapis.com/auth/youtube.readonly", "https://www.googleapis.com/auth/yt-analytics.readonly"]

cid = os.environ.get("YT_CLIENT_ID") or input("OAuth client ID: ").strip()
csec = os.environ.get("YT_CLIENT_SECRET") or getpass.getpass("OAuth client secret (hidden): ").strip()
state = secrets.token_urlsafe(16)
verifier = secrets.token_urlsafe(64)
challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b"=").decode()
got = {}

class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        if q.get("state", [""])[0] == state:
            got.update({k: v[0] for k, v in q.items()})
        self.send_response(200); self.send_header("Content-Type", "text/html"); self.end_headers()
        self.wfile.write(b"<p>Done. You can close this tab and go back to the terminal.</p>")
    def log_message(self, *a): pass

srv = http.server.HTTPServer(("127.0.0.1", 0), H)
redirect = f"http://127.0.0.1:{srv.server_address[1]}"
url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode({
    "client_id": cid, "redirect_uri": redirect, "response_type": "code", "scope": " ".join(SCOPES),
    "access_type": "offline", "prompt": "consent select_account", "state": state,
    "code_challenge": challenge, "code_challenge_method": "S256"})
print("Opening Google sign-in. If no browser opens, visit:\n" + url + "\n")
print('On Google\'s screens, pick the account and then the channel to connect (e.g. "As Printed").')
webbrowser.open(url)
t = threading.Thread(target=srv.handle_request); t.start(); t.join(timeout=600); srv.server_close()
if "code" not in got:
    sys.exit(f"No answer from Google ({got.get('error', 'timed out')}). If it says redirect_uri_mismatch, the OAuth "
             "client is a 'Web application': create a 'Desktop app' client in the same project, or add the URL above.")
tok = json.load(urllib.request.urlopen(urllib.request.Request("https://oauth2.googleapis.com/token", data=urllib.parse.urlencode({
    "code": got["code"], "client_id": cid, "client_secret": csec, "redirect_uri": redirect,
    "grant_type": "authorization_code", "code_verifier": verifier}).encode())))
if "refresh_token" not in tok:
    sys.exit("Google returned no refresh token. Remove the app's access at myaccount.google.com/permissions and run again.")
ch = json.load(urllib.request.urlopen(urllib.request.Request(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
    headers={"Authorization": "Bearer " + tok["access_token"]}))).get("items", [])
print("\nThis token manages:", ", ".join(f'{c["snippet"]["title"]} ({c["id"]})' for c in ch) or "NO CHANNEL")
print("\nRefresh token (paste it only into the environment variable, e.g. YT_REFRESH_TOKEN_ASPRINTED):\n")
print(tok["refresh_token"])
