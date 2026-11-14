#!/usr/bin/env python3
"""YouTube Data API helper for the agency's channels (own Google Cloud OAuth client, one refresh token per channel).

Credentials come from the environment: YT_CLIENT_ID, YT_CLIENT_SECRET, plus one refresh token per channel:
  --channel whichlifenext (default)  YT_REFRESH_TOKEN
  --channel asprinted                YT_REFRESH_TOKEN_ASPRINTED
Never print them. Standard library only; HTTPS goes through the session proxy automatically.
Every run checks that the token belongs to the channel named, so a command never lands on the wrong channel.

Usage (all output is JSON; put --channel NAME before the command):
  yt.py whoami
  yt.py videos [--max 25]                       # latest uploads with status / publishAt / stats
  yt.py video VIDEO_ID                          # full snippet, status, statistics
  yt.py upload FILE --title T [--description D] [--tags a,b] [--publish-at ISO_UTC]
               [--privacy private|unlisted|public] [--category 22] [--kids]
  yt.py update VIDEO_ID [--title T] [--description D] [--tags a,b] [--publish-at ISO_UTC]
               [--privacy P] [--category N]      # only the fields given are changed
  yt.py thumbnail VIDEO_ID IMAGE
  yt.py comments [--video VIDEO_ID] [--unanswered] [--max 50]
  yt.py reply COMMENT_ID TEXT                   # COMMENT_ID = top-level comment / thread id
  yt.py playlist-add PLAYLIST_ID VIDEO_ID
  yt.py analytics START END [--metrics views,likes] [--dimensions day]
"""
import argparse, json, mimetypes, os, sys, urllib.error, urllib.parse, urllib.request

API = "https://www.googleapis.com/youtube/v3"
CHANNELS = {   # name -> (refresh-token variable, channel ID; None until the first connection is verified)
    "whichlifenext": ("YT_REFRESH_TOKEN", "UCPTrW0n3ONI9uU4WetWwFCQ"),
    "asprinted": ("YT_REFRESH_TOKEN_ASPRINTED", None),
}
CHANNEL = "whichlifenext"
CHANNEL_ID = CHANNELS[CHANNEL][1]
_token = None


def token():
    global _token
    if _token:
        return _token
    global CHANNEL_ID
    var = CHANNELS[CHANNEL][0]
    missing = [k for k in ("YT_CLIENT_ID", "YT_CLIENT_SECRET", var) if not os.environ.get(k)]
    if missing:
        sys.exit(f"Missing environment variables for channel '{CHANNEL}': {', '.join(missing)}")
    body = urllib.parse.urlencode({
        "client_id": os.environ["YT_CLIENT_ID"], "client_secret": os.environ["YT_CLIENT_SECRET"],
        "refresh_token": os.environ[var], "grant_type": "refresh_token"}).encode()
    _token = _call("POST", "https://oauth2.googleapis.com/token", data=body,
                   headers={"Content-Type": "application/x-www-form-urlencoded"}, auth=False)["access_token"]
    mine = _call("GET", f"{API}/channels", {"part": "id,snippet", "mine": "true"}).get("items", [])
    ids = [c["id"] for c in mine]
    want = CHANNELS[CHANNEL][1]
    if want and want not in ids:
        _token = None
        sys.exit(f"{var} belongs to {[c['snippet']['title'] for c in mine]}, not channel '{CHANNEL}' ({want}). Stopping.")
    if not ids:
        _token = None
        sys.exit(f"{var} has no YouTube channel. Stopping.")
    CHANNEL_ID = want or ids[0]
    return _token


def _call(method, url, params=None, body=None, data=None, headers=None, auth=True, raw=False):
    if params:
        url += ("&" if "?" in url else "?") + urllib.parse.urlencode(params)
    headers = dict(headers or {})
    if body is not None:
        data = json.dumps(body).encode()
        headers["Content-Type"] = "application/json; charset=UTF-8"
    if auth:
        headers["Authorization"] = f"Bearer {token()}"
    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=900) as r:
            if raw:
                return r
            text = r.read().decode()
            return json.loads(text) if text else {}
    except urllib.error.HTTPError as e:
        err = e.read().decode(errors="replace")
        sys.exit(f"HTTP {e.code} {method} {url.split('?')[0]}\n{err}")


def out(obj):
    print(json.dumps(obj, indent=1, ensure_ascii=False))


def video_summary(v):
    s, st = v.get("snippet", {}), v.get("status", {})
    return {"id": v["id"], "title": s.get("title"), "publishedAt": s.get("publishedAt"),
            "privacy": st.get("privacyStatus"), "publishAt": st.get("publishAt"),
            "uploadStatus": st.get("uploadStatus"), "stats": v.get("statistics")}


def cmd_whoami(a):
    r = _call("GET", f"{API}/channels", {"part": "snippet,statistics", "mine": "true"})
    out([{"id": c["id"], "title": c["snippet"]["title"], "handle": c["snippet"].get("customUrl"),
          **c.get("statistics", {})} for c in r.get("items", [])])


def cmd_videos(a):
    token()                                   # resolves CHANNEL_ID for the chosen channel
    uploads = "UU" + CHANNEL_ID[2:]
    items = _call("GET", f"{API}/playlistItems",
                  {"part": "contentDetails", "playlistId": uploads, "maxResults": min(a.max, 50)}).get("items", [])
    ids = ",".join(i["contentDetails"]["videoId"] for i in items)
    if not ids:
        return out([])
    r = _call("GET", f"{API}/videos", {"part": "snippet,status,statistics", "id": ids})
    out([video_summary(v) for v in r.get("items", [])])


def get_video(vid, part="snippet,status,statistics"):
    items = _call("GET", f"{API}/videos", {"part": part, "id": vid}).get("items", [])
    if not items:
        sys.exit(f"Video {vid} not found on this channel")
    return items[0]


def cmd_video(a):
    out(get_video(a.video_id))


def apply_fields(snippet, status, a):
    if a.title is not None:
        snippet["title"] = a.title
    if a.description is not None:
        snippet["description"] = a.description
    if a.tags is not None:
        snippet["tags"] = [t.strip() for t in a.tags.split(",") if t.strip()]
    if a.category is not None:
        snippet["categoryId"] = str(a.category)
    if a.privacy is not None:
        status["privacyStatus"] = a.privacy
    if a.publish_at is not None:
        status["privacyStatus"] = "private"  # YouTube requires private for a scheduled publish
        status["publishAt"] = a.publish_at


def cmd_upload(a):
    snippet = {"categoryId": "22"}
    status = {"privacyStatus": "private", "selfDeclaredMadeForKids": bool(a.kids)}
    apply_fields(snippet, status, a)
    size = os.path.getsize(a.file)
    ctype = mimetypes.guess_type(a.file)[0] or "video/mp4"
    r = _call("POST", "https://www.googleapis.com/upload/youtube/v3/videos",
              {"uploadType": "resumable", "part": "snippet,status"},
              body={"snippet": snippet, "status": status},
              headers={"X-Upload-Content-Type": ctype, "X-Upload-Content-Length": str(size)}, raw=True)
    location = r.headers["Location"]
    with open(a.file, "rb") as f:
        v = _call("PUT", location, data=f.read(), headers={"Content-Type": ctype})
    out(video_summary(v))


def cmd_update(a):
    v = get_video(a.video_id, "snippet,status")
    snippet, status = v["snippet"], v["status"]
    apply_fields(snippet, status, a)
    keep_snip = {k: snippet[k] for k in ("title", "description", "tags", "categoryId",
                                         "defaultLanguage", "defaultAudioLanguage") if k in snippet}
    keep_stat = {k: status[k] for k in ("privacyStatus", "publishAt", "embeddable", "license",
                                        "publicStatsViewable", "selfDeclaredMadeForKids") if k in status}
    r = _call("PUT", f"{API}/videos", {"part": "snippet,status"},
              body={"id": a.video_id, "snippet": keep_snip, "status": keep_stat})
    out(video_summary(r))


def cmd_thumbnail(a):
    ctype = mimetypes.guess_type(a.image)[0] or "image/jpeg"
    with open(a.image, "rb") as f:
        r = _call("POST", "https://www.googleapis.com/upload/youtube/v3/thumbnails/set",
                  {"videoId": a.video_id, "uploadType": "media"}, data=f.read(), headers={"Content-Type": ctype})
    out(r)


def cmd_comments(a):
    token()
    params = {"part": "snippet,replies", "maxResults": min(a.max, 100), "order": "time", "textFormat": "plainText"}
    if a.video:
        params["videoId"] = a.video
    else:
        params["allThreadsRelatedToChannelId"] = CHANNEL_ID
    rows = []
    for t in _call("GET", f"{API}/commentThreads", params).get("items", []):
        top = t["snippet"]["topLevelComment"]["snippet"]
        replies = t.get("replies", {}).get("comments", [])
        own_reply = any(r["snippet"].get("authorChannelId", {}).get("value") == CHANNEL_ID for r in replies)
        is_own = top.get("authorChannelId", {}).get("value") == CHANNEL_ID
        if a.unanswered and (own_reply or is_own):
            continue
        rows.append({"thread_id": t["id"], "video_id": t["snippet"].get("videoId"),
                     "author": top.get("authorDisplayName"), "text": top.get("textDisplay"),
                     "publishedAt": top.get("publishedAt"), "likes": top.get("likeCount"),
                     "reply_count": t["snippet"].get("totalReplyCount"), "channel_replied": own_reply})
    out(rows)


def cmd_reply(a):
    r = _call("POST", f"{API}/comments", {"part": "snippet"},
              body={"snippet": {"parentId": a.comment_id, "textOriginal": a.text}})
    out({"reply_id": r["id"], "parent": a.comment_id, "text": r["snippet"].get("textOriginal")})


def cmd_playlist_add(a):
    r = _call("POST", f"{API}/playlistItems", {"part": "snippet"},
              body={"snippet": {"playlistId": a.playlist_id,
                                "resourceId": {"kind": "youtube#video", "videoId": a.video_id}}})
    out({"playlist_item_id": r["id"]})


def cmd_analytics(a):
    params = {"ids": "channel==MINE", "startDate": a.start, "endDate": a.end, "metrics": a.metrics}
    if a.dimensions:
        params["dimensions"] = a.dimensions
    out(_call("GET", "https://youtubeanalytics.googleapis.com/v2/reports", params))


def main():
    global CHANNEL, CHANNEL_ID
    p = argparse.ArgumentParser()
    p.add_argument("--channel", choices=sorted(CHANNELS), default="whichlifenext")
    sp = p.add_subparsers(dest="cmd", required=True)
    sp.add_parser("whoami").set_defaults(f=cmd_whoami)
    s = sp.add_parser("videos"); s.add_argument("--max", type=int, default=25); s.set_defaults(f=cmd_videos)
    s = sp.add_parser("video"); s.add_argument("video_id"); s.set_defaults(f=cmd_video)

    def edit_args(s):
        s.add_argument("--title"); s.add_argument("--description"); s.add_argument("--tags")
        s.add_argument("--publish-at", dest="publish_at"); s.add_argument("--category")
        s.add_argument("--privacy", choices=["private", "unlisted", "public"])

    s = sp.add_parser("upload"); s.add_argument("file"); edit_args(s); s.add_argument("--kids", action="store_true")
    s.set_defaults(f=cmd_upload)
    s = sp.add_parser("update"); s.add_argument("video_id"); edit_args(s); s.set_defaults(f=cmd_update)
    s = sp.add_parser("thumbnail"); s.add_argument("video_id"); s.add_argument("image"); s.set_defaults(f=cmd_thumbnail)
    s = sp.add_parser("comments"); s.add_argument("--video"); s.add_argument("--unanswered", action="store_true")
    s.add_argument("--max", type=int, default=50); s.set_defaults(f=cmd_comments)
    s = sp.add_parser("reply"); s.add_argument("comment_id"); s.add_argument("text"); s.set_defaults(f=cmd_reply)
    s = sp.add_parser("playlist-add"); s.add_argument("playlist_id"); s.add_argument("video_id")
    s.set_defaults(f=cmd_playlist_add)
    s = sp.add_parser("analytics"); s.add_argument("start"); s.add_argument("end")
    s.add_argument("--metrics", default="views,estimatedMinutesWatched,likes,subscribersGained")
    s.add_argument("--dimensions"); s.set_defaults(f=cmd_analytics)
    a = p.parse_args()
    CHANNEL = a.channel; CHANNEL_ID = CHANNELS[CHANNEL][1]
    if a.cmd == "upload" and a.title is None:
        sys.exit("--title is required for upload")
    a.f(a)


if __name__ == "__main__":
    main()
