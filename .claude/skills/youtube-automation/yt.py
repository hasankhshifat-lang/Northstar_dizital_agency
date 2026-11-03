#!/usr/bin/env python3
"""YouTube Data API helper for Which Life Next (own Google Cloud OAuth client).

Credentials come from env vars YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN.
Never prints tokens. Scopes on the refresh token: youtube.upload + youtube.readonly.

Usage:
  yt.py whoami
  yt.py upload FILE --title T --description-file D.txt [--tags a,b] [--publish-at 2026-11-04T22:00:00Z]
               [--category 27] [--thumbnail thumb.jpg] [--no-synthetic]
      Without --publish-at the video goes PUBLIC immediately (only when the user asked for that).
      With --publish-at it is uploaded private and YouTube makes it public at that UTC time.
  yt.py scheduled            # own uploads that are private with a future publishAt
  yt.py recent [N]           # last N uploads with status, publishAt and view counts
  yt.py stats ID [ID ...]    # views/likes/comments for videos
"""
import argparse, json, os, sys, urllib.error, urllib.parse, urllib.request, datetime

API = "https://www.googleapis.com/youtube/v3"
CHANNEL = "UCPTrW0n3ONI9uU4WetWwFCQ"


def _req(url, data=None, headers=None, method=None, timeout=900):
    r = urllib.request.Request(url, data=data, headers=headers or {}, method=method)
    try:
        with urllib.request.urlopen(r, timeout=timeout) as resp:
            return resp.status, dict(resp.headers), resp.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), e.read().decode()


def token():
    missing = [k for k in ("YT_CLIENT_ID", "YT_CLIENT_SECRET", "YT_REFRESH_TOKEN") if not os.environ.get(k)]
    if missing:
        sys.exit("ERROR: missing env vars " + ", ".join(missing) + " (set them in the cloud environment settings)")
    s, _, b = _req("https://oauth2.googleapis.com/token", urllib.parse.urlencode({
        "client_id": os.environ["YT_CLIENT_ID"], "client_secret": os.environ["YT_CLIENT_SECRET"],
        "refresh_token": os.environ["YT_REFRESH_TOKEN"], "grant_type": "refresh_token"}).encode())
    if s != 200:
        sys.exit(f"ERROR: token refresh failed ({s}): {json.loads(b).get('error_description', b[:200])}")
    return json.loads(b)["access_token"]


def get(path, tok, **params):
    s, _, b = _req(f"{API}/{path}?{urllib.parse.urlencode(params)}", headers={"Authorization": "Bearer " + tok})
    if s != 200:
        sys.exit(f"ERROR {s} on {path}: {b[:600]}")
    return json.loads(b)


def uploads(tok, n):
    pl = get("channels", tok, part="contentDetails", mine="true")["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]
    ids, page = [], None
    while len(ids) < n:
        p = dict(part="contentDetails", playlistId=pl, maxResults=50)
        if page: p["pageToken"] = page
        j = get("playlistItems", tok, **p)
        ids += [i["contentDetails"]["videoId"] for i in j["items"]]
        page = j.get("nextPageToken")
        if not page: break
    ids = ids[:n]
    out = []
    for k in range(0, len(ids), 50):
        out += get("videos", tok, part="snippet,status,statistics", id=",".join(ids[k:k + 50]))["items"]
    return out


def row(v):
    st, sn, stt = v["status"], v["snippet"], v.get("statistics", {})
    return {"id": v["id"], "title": sn["title"], "privacy": st["privacyStatus"],
            "publishAt": st.get("publishAt"), "published": sn.get("publishedAt"),
            "uploadStatus": st.get("uploadStatus"), "views": stt.get("viewCount")}


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("whoami")
    u = sub.add_parser("upload")
    u.add_argument("file"); u.add_argument("--title", required=True)
    u.add_argument("--description", default=""); u.add_argument("--description-file")
    u.add_argument("--tags", default=""); u.add_argument("--publish-at")
    u.add_argument("--category", default="27")  # 27 = Education
    u.add_argument("--thumbnail"); u.add_argument("--no-synthetic", action="store_true")
    sub.add_parser("scheduled")
    r = sub.add_parser("recent"); r.add_argument("n", nargs="?", type=int, default=20)
    s = sub.add_parser("stats"); s.add_argument("ids", nargs="+")
    a = ap.parse_args()
    tok = token()

    if a.cmd == "whoami":
        for c in get("channels", tok, part="snippet,statistics", mine="true")["items"]:
            print(json.dumps({"id": c["id"], "title": c["snippet"]["title"], **c["statistics"]}))
    elif a.cmd == "upload":
        desc = open(a.description_file).read() if a.description_file else a.description
        status = {"selfDeclaredMadeForKids": False, "embeddable": True, "license": "youtube",
                  "containsSyntheticMedia": not a.no_synthetic}
        if a.publish_at:
            t = datetime.datetime.fromisoformat(a.publish_at.replace("Z", "+00:00"))
            if t <= datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=15):
                sys.exit("ERROR: --publish-at must be at least 15 minutes in the future (UTC)")
            status.update(privacyStatus="private", publishAt=t.astimezone(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"))
        else:
            status["privacyStatus"] = "public"
        meta = {"snippet": {"title": a.title[:100], "description": desc[:5000], "categoryId": a.category,
                            "tags": [x.strip() for x in a.tags.split(",") if x.strip()],
                            "defaultLanguage": "en", "defaultAudioLanguage": "en"}, "status": status}
        size = os.path.getsize(a.file)
        H = {"Authorization": "Bearer " + tok}
        s_, h, b = _req(f"https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
                        data=json.dumps(meta).encode(), method="POST",
                        headers={**H, "Content-Type": "application/json; charset=UTF-8",
                                 "X-Upload-Content-Type": "video/mp4", "X-Upload-Content-Length": str(size)})
        if s_ != 200:
            sys.exit(f"ERROR: upload session {s_}: {b[:800]}")
        loc = h.get("Location") or h.get("location")
        with open(a.file, "rb") as f:
            s_, _, b = _req(loc, data=f.read(), method="PUT", headers={"Content-Type": "video/mp4", "Content-Length": str(size)})
        if s_ not in (200, 201):
            sys.exit(f"ERROR: upload {s_}: {b[:800]}")
        v = json.loads(b)
        res = {"id": v["id"], "url": f"https://youtube.com/shorts/{v['id']}", "privacy": v["status"]["privacyStatus"],
               "publishAt": v["status"].get("publishAt")}
        if a.thumbnail:
            with open(a.thumbnail, "rb") as f:
                ts, _, tb = _req(f"https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId={v['id']}",
                                 data=f.read(), method="POST", headers={**H, "Content-Type": "image/jpeg"})
            res["thumbnail"] = "set" if ts == 200 else f"failed {ts}: {tb[:200]}"
        print(json.dumps(res))
    elif a.cmd == "scheduled":
        for v in uploads(tok, 50):
            if v["status"]["privacyStatus"] == "private" and v["status"].get("publishAt"):
                print(json.dumps(row(v)))
    elif a.cmd == "recent":
        for v in uploads(tok, a.n):
            print(json.dumps(row(v)))
    elif a.cmd == "stats":
        for v in get("videos", tok, part="snippet,status,statistics", id=",".join(a.ids))["items"]:
            print(json.dumps({**row(v), **v.get("statistics", {})}))


if __name__ == "__main__":
    main()
