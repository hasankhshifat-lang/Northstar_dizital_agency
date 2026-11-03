#!/usr/bin/env python3
"""Upload (and optionally schedule) a video on YouTube with the YouTube Data API v3.

Credentials come from environment variables (set as environment secrets, never in the repo):
  YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN

Usage:
  yt_upload.py check
  yt_upload.py upload VIDEO.mp4 --title T --description D [--tags a,b] [--category 27]
               [--publish-at 2026-11-05T14:00:00Z] [--privacy public|unlisted|private]
               [--made-for-kids] [--not-ai]
  yt_upload.py status VIDEO_ID

With --publish-at the video is uploaded as private and YouTube makes it public at that time.
Standard library only.
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

TOKEN_URL = "https://oauth2.googleapis.com/token"
API = "https://www.googleapis.com/youtube/v3"
UPLOAD = "https://www.googleapis.com/upload/youtube/v3/videos"
CHUNK = 8 * 1024 * 1024


def die(msg):
    print(json.dumps({"ok": False, "error": msg}))
    sys.exit(1)


def access_token():
    missing = [k for k in ("YT_CLIENT_ID", "YT_CLIENT_SECRET", "YT_REFRESH_TOKEN") if not os.environ.get(k)]
    if missing:
        die("missing environment variables: " + ", ".join(missing))
    body = urllib.parse.urlencode({
        "client_id": os.environ["YT_CLIENT_ID"],
        "client_secret": os.environ["YT_CLIENT_SECRET"],
        "refresh_token": os.environ["YT_REFRESH_TOKEN"],
        "grant_type": "refresh_token",
    }).encode()
    try:
        with urllib.request.urlopen(urllib.request.Request(TOKEN_URL, data=body), timeout=30) as r:
            return json.load(r)["access_token"]
    except urllib.error.HTTPError as e:
        die("token refresh failed: %s %s" % (e.code, e.read().decode(errors="replace")[:500]))


def call(method, url, token, data=None, headers=None):
    h = {"Authorization": "Bearer " + token}
    h.update(headers or {})
    req = urllib.request.Request(url, data=data, method=method, headers=h)
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            return r.status, dict(r.headers), r.read()
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), e.read()


def check(_args):
    token = access_token()
    code, _, body = call("GET", API + "/channels?part=id,snippet&mine=true", token)
    if code != 200:
        die("channels.list failed: %s %s" % (code, body.decode(errors="replace")[:500]))
    items = json.loads(body).get("items", [])
    print(json.dumps({"ok": True, "channels": [{"id": c["id"], "title": c["snippet"]["title"]} for c in items]}))


def upload(a):
    if not os.path.isfile(a.file):
        die("file not found: " + a.file)
    status = {
        "privacyStatus": "private" if a.publish_at else a.privacy,
        "selfDeclaredMadeForKids": a.made_for_kids,
        "containsSyntheticMedia": not a.not_ai,
    }
    if a.publish_at:
        status["publishAt"] = a.publish_at
    meta = {
        "snippet": {
            "title": a.title,
            "description": a.description,
            "categoryId": a.category,
            "tags": [t.strip() for t in a.tags.split(",") if t.strip()] if a.tags else [],
        },
        "status": status,
    }
    size = os.path.getsize(a.file)
    token = access_token()
    code, headers, body = call(
        "POST", UPLOAD + "?uploadType=resumable&part=snippet,status", token,
        data=json.dumps(meta).encode(),
        headers={"Content-Type": "application/json; charset=UTF-8",
                 "X-Upload-Content-Type": "video/*", "X-Upload-Content-Length": str(size)})
    location = {k.lower(): v for k, v in headers.items()}.get("location")
    if code != 200 or not location:
        die("could not start upload: %s %s" % (code, body.decode(errors="replace")[:800]))
    offset = 0
    with open(a.file, "rb") as f:
        while offset < size:
            f.seek(offset)
            chunk = f.read(CHUNK)
            end = offset + len(chunk) - 1
            code, headers, body = call("PUT", location, token, data=chunk, headers={
                "Content-Length": str(len(chunk)),
                "Content-Range": "bytes %d-%d/%d" % (offset, end, size)})
            if code in (200, 201):
                v = json.loads(body)
                print(json.dumps({"ok": True, "id": v["id"], "url": "https://youtu.be/" + v["id"],
                                  "privacyStatus": v["status"].get("privacyStatus"),
                                  "publishAt": v["status"].get("publishAt"),
                                  "uploadStatus": v["status"].get("uploadStatus")}))
                return
            if code == 308:
                rng = {k.lower(): v for k, v in headers.items()}.get("range")
                offset = int(rng.split("-")[1]) + 1 if rng else 0
                continue
            die("upload failed at byte %d: %s %s" % (offset, code, body.decode(errors="replace")[:800]))


def video_status(a):
    token = access_token()
    code, _, body = call("GET", API + "/videos?part=status,snippet,processingDetails&id=" + a.video_id, token)
    if code != 200:
        die("videos.list failed: %s %s" % (code, body.decode(errors="replace")[:500]))
    items = json.loads(body).get("items", [])
    if not items:
        die("video not found: " + a.video_id)
    v = items[0]
    print(json.dumps({"ok": True, "id": v["id"], "title": v["snippet"]["title"], "status": v["status"],
                      "processing": v.get("processingDetails", {}).get("processingStatus")}))


def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("check").set_defaults(fn=check)
    u = sub.add_parser("upload")
    u.add_argument("file")
    u.add_argument("--title", required=True)
    u.add_argument("--description", default="")
    u.add_argument("--tags", default="")
    u.add_argument("--category", default="27", help="27 = Education")
    u.add_argument("--publish-at", help="RFC 3339 UTC, e.g. 2026-11-05T14:00:00Z")
    u.add_argument("--privacy", default="public", choices=["public", "unlisted", "private"])
    u.add_argument("--made-for-kids", action="store_true")
    u.add_argument("--not-ai", action="store_true", help="do not mark as altered/synthetic content")
    u.set_defaults(fn=upload)
    s = sub.add_parser("status")
    s.add_argument("video_id")
    s.set_defaults(fn=video_status)
    a = p.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
