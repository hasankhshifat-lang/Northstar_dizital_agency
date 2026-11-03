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
  yt.py scopes               # which permissions the refresh token has
  --- need the youtube.force-ssl scope ---
  yt.py update ID [--title T] [--description-file D] [--tags a,b] [--publish-at UTC] [--privacy public|private|unlisted]
  yt.py delete ID --confirm  # ONLY when the user explicitly asked to delete that video
  yt.py comments [N]         # newest comment threads on the channel (with thread IDs)
  yt.py reply THREAD_ID "text"
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
    j = json.loads(b)
    global SCOPES
    SCOPES = j.get("scope", "")
    return j["access_token"]


SCOPES = ""
FULL = ("https://www.googleapis.com/auth/youtube.force-ssl", "https://www.googleapis.com/auth/youtube")


def need_full():
    if not any(x in SCOPES.split() for x in FULL):
        sys.exit("ERROR: this needs the youtube.force-ssl scope. The current refresh token only has: " + SCOPES +
                 "\nRe-authorise (see SKILL.md 'Re-authorising') and update YT_REFRESH_TOKEN in the environment settings.")


def send(url, tok, body=None, method="PUT"):
    s, _, b = _req(url, data=json.dumps(body).encode() if body is not None else None, method=method,
                   headers={"Authorization": "Bearer " + tok, "Content-Type": "application/json"})
    if s not in (200, 204):
        sys.exit(f"ERROR {s}: {b[:800]}")
    return json.loads(b) if b.strip() else {}


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
    sub.add_parser("scopes")
    up = sub.add_parser("update"); up.add_argument("id"); up.add_argument("--title"); up.add_argument("--description-file")
    up.add_argument("--tags"); up.add_argument("--publish-at"); up.add_argument("--privacy", choices=["public", "private", "unlisted"])
    d = sub.add_parser("delete"); d.add_argument("id"); d.add_argument("--confirm", action="store_true")
    c = sub.add_parser("comments"); c.add_argument("n", nargs="?", type=int, default=20)
    rp = sub.add_parser("reply"); rp.add_argument("thread"); rp.add_argument("text")
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

    elif a.cmd == "scopes":
        print(SCOPES)
    elif a.cmd == "update":
        need_full()
        v = get("videos", tok, part="snippet,status", id=a.id)["items"]
        if not v:
            sys.exit("ERROR: video not found")
        v = v[0]; sn, st = v["snippet"], v["status"]
        if a.title: sn["title"] = a.title[:100]
        if a.description_file: sn["description"] = open(a.description_file).read()[:5000]
        if a.tags is not None: sn["tags"] = [x.strip() for x in a.tags.split(",") if x.strip()]
        if a.publish_at:
            st["privacyStatus"] = "private"; st["publishAt"] = a.publish_at
        elif a.privacy:
            st["privacyStatus"] = a.privacy; st.pop("publishAt", None)
        body = {"id": a.id, "snippet": {k: sn[k] for k in ("title", "description", "tags", "categoryId", "defaultLanguage", "defaultAudioLanguage") if k in sn},
                "status": {k: st[k] for k in ("privacyStatus", "publishAt", "selfDeclaredMadeForKids", "embeddable", "license", "containsSyntheticMedia") if k in st}}
        r = send(f"{API}/videos?part=snippet,status", tok, body)
        print(json.dumps({"id": r["id"], "title": r["snippet"]["title"], "privacy": r["status"]["privacyStatus"], "publishAt": r["status"].get("publishAt")}))
    elif a.cmd == "delete":
        need_full()
        if not a.confirm:
            sys.exit("ERROR: pass --confirm, and only when the user explicitly asked to delete this video")
        send(f"{API}/videos?id={a.id}", tok, method="DELETE")
        print(json.dumps({"deleted": a.id}))
    elif a.cmd == "comments":
        need_full()
        j = get("commentThreads", tok, part="snippet", allThreadsRelatedToChannelId=CHANNEL, maxResults=min(a.n, 100), order="time")
        for t in j.get("items", []):
            c = t["snippet"]["topLevelComment"]["snippet"]
            print(json.dumps({"thread": t["id"], "video": t["snippet"].get("videoId"), "author": c.get("authorDisplayName"),
                              "text": c.get("textOriginal"), "published": c.get("publishedAt"), "replies": t["snippet"].get("totalReplyCount")}))
    elif a.cmd == "reply":
        need_full()
        r = send(f"{API}/comments?part=snippet", tok, {"snippet": {"parentId": a.thread, "textOriginal": a.text}}, method="POST")
        print(json.dumps({"reply_id": r["id"]}))


if __name__ == "__main__":
    main()
