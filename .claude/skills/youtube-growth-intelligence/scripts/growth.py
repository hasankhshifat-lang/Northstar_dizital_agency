#!/usr/bin/env python3
"""YouTube Growth Intelligence: analytics collector and append-only performance database.

Uses the agency's own Google Cloud OAuth client through yt.py (youtube-channel-automation skill), so the same
--channel names, tokens and channel checks apply. Nothing here uploads, edits or deletes anything: read-only.

Commands (put --channel NAME before the command; default whichlifenext):
  snapshot [--video ID ...] [--due] [--all]   append per-video checkpoint metrics to the database
  due                                         list videos that passed a checkpoint (24h..28d) with no snapshot yet
  channel-report [--write]                    7 / 28 / 90-day / lifetime comparison, Shorts and long-form apart,
                                              US share, traffic sources, search terms, US time-zone mix
  retention VIDEO_ID                          retention curve with the biggest drop-offs, in seconds
  monetization [--write]                      YPP progress (subscribers, long-form watch hours 365 d, Shorts views 90 d)
  publish-times                               publish time in ET/CT/PT next to the first 24 h / 72 h / 7 d views

Database: youtube-growth/<channel>/analytics/snapshots.jsonl (one JSON object per line, never rewritten).
Every record carries collected_at (UTC) and data_through (the Analytics API lags ~2-3 days).
Impressions, impressions CTR, returning viewers and "when your viewers are on YouTube" are NOT in the public
YouTube Analytics API: get them from vidIQ (vidiq_channel_analytics_extended) or a Studio export, and say so.
"""
import argparse, json, os, sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[3].parent  # repo root
sys.path.insert(0, str(ROOT / ".claude/skills/youtube-channel-automation"))
import yt  # noqa: E402

API = "https://www.googleapis.com/youtube/v3"
ANALYTICS = "https://youtubeanalytics.googleapis.com/v2/reports"
CHECKPOINTS = [("24h", 24), ("48h", 48), ("72h", 72), ("7d", 168), ("14d", 336), ("28d", 672)]
TZS = {"ET": "America/New_York", "CT": "America/Chicago", "MT": "America/Denver", "PT": "America/Los_Angeles"}
# US state -> dominant time zone (split states use the zone most of their population lives in).
STATE_TZ = {**{s: "ET" for s in "CT DE DC FL GA IN KY ME MD MA MI NH NJ NY NC OH PA RI SC VT VA WV".split()},
            **{s: "CT" for s in "AL AR IL IA KS LA MN MS MO NE ND OK SD TN TX WI".split()},
            **{s: "MT" for s in "AZ CO ID MT NM UT WY".split()},
            **{s: "PT" for s in "CA NV OR WA".split()}, "AK": "AK", "HI": "HI"}


def now():
    return datetime.now(timezone.utc)


def db_dir():
    d = ROOT / "youtube-growth" / yt.CHANNEL / "analytics"
    d.mkdir(parents=True, exist_ok=True)
    return d


def report(metrics, start, end, dims=None, filters=None, sort=None, max_results=None):
    p = {"ids": "channel==MINE", "startDate": start, "endDate": end, "metrics": metrics}
    if dims: p["dimensions"] = dims
    if filters: p["filters"] = filters
    if sort: p["sort"] = sort
    if max_results: p["maxResults"] = max_results
    try:
        r = yt._call("GET", ANALYTICS, p)
    except SystemExit as e:  # yt._call exits on HTTP errors; keep going and record the gap
        return {"error": str(e)[:300]}
    cols = [c["name"] for c in r.get("columnHeaders", [])]
    return {"columns": cols, "rows": r.get("rows", [])}


def rows_as_dicts(r):
    return [dict(zip(r["columns"], row)) for row in r.get("rows", [])] if "rows" in r else []


def uploads(limit=200):
    yt.token()
    pl = "UU" + yt.CHANNEL_ID[2:]
    ids, page = [], None
    while len(ids) < limit:
        p = {"part": "contentDetails", "playlistId": pl, "maxResults": 50}
        if page: p["pageToken"] = page
        try:
            r = yt._call("GET", f"{API}/playlistItems", p)
        except SystemExit:
            break  # empty channel: no uploads playlist yet
        ids += [i["contentDetails"]["videoId"] for i in r.get("items", [])]
        page = r.get("nextPageToken")
        if not page: break
    vids = []
    for i in range(0, len(ids), 50):
        r = yt._call("GET", f"{API}/videos", {"part": "snippet,contentDetails,statistics,status", "id": ",".join(ids[i:i + 50])})
        vids += r.get("items", [])
    return vids


def iso_dur(s):
    import re
    m = re.fullmatch(r"P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", s or "")
    if not m: return None
    d, h, mi, se = (int(x or 0) for x in m.groups())
    return d * 86400 + h * 3600 + mi * 60 + se


def published(v):
    return datetime.fromisoformat(v["snippet"]["publishedAt"].replace("Z", "+00:00"))


def is_public(v):
    return v["status"].get("privacyStatus") == "public"


def checkpoint_for(age_h):
    passed = [c for c, h in CHECKPOINTS if age_h >= h]
    return passed[-1] if passed else "early"


def existing():
    f = db_dir() / "snapshots.jsonl"
    if not f.exists(): return []
    return [json.loads(l) for l in f.read_text().splitlines() if l.strip()]


def due_videos(vids):
    done = {(r["video_id"], r["checkpoint"]) for r in existing()}
    out = []
    for v in vids:
        if not is_public(v): continue
        age = (now() - published(v)).total_seconds() / 3600
        cp = checkpoint_for(age)
        if cp != "early" and (v["id"], cp) not in done:
            out.append((v, cp, age))
    return out


def snapshot_one(v, cp, age):
    vid, pub = v["id"], published(v)
    start, end = pub.date().isoformat(), now().date().isoformat()
    core = report("views,engagedViews,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,"
                  "subscribersGained,subscribersLost,likes,comments,shares", start, end, filters=f"video=={vid}")
    us = report("views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage", start, end,
                filters=f"video=={vid};country==US")
    traffic = report("views,estimatedMinutesWatched", start, end, dims="insightTrafficSourceType", filters=f"video=={vid}")
    days = report("views", start, end, dims="day", filters=f"video=={vid}")
    day_rows = rows_as_dicts(days)
    rec = {
        "collected_at": now().isoformat(timespec="seconds"), "channel": yt.CHANNEL, "video_id": vid,
        "title": v["snippet"]["title"], "published_at": v["snippet"]["publishedAt"],
        "format": "short" if (iso_dur(v["contentDetails"].get("duration")) or 999) <= 180 else "long",
        "duration_s": iso_dur(v["contentDetails"].get("duration")),
        "age_hours": round(age, 1), "checkpoint": cp,
        "data_through": day_rows[-1]["day"] if day_rows else None,
        "public_stats": {k: int(v["statistics"].get(k, 0)) for k in ("viewCount", "likeCount", "commentCount")},
        "analytics": (rows_as_dicts(core) or [{}])[0] if "error" not in core else {"error": core["error"]},
        "us": (rows_as_dicts(us) or [{}])[0] if "error" not in us else {"error": us["error"]},
        "traffic_sources": {r["insightTrafficSourceType"]: r["views"] for r in rows_as_dicts(traffic)},
        "unavailable_in_api": ["impressions", "impressions_ctr", "returning_viewers", "shorts_feed_impressions"],
        "source": "YouTube Data API + YouTube Analytics API (own OAuth client)",
    }
    a = rec["analytics"]
    if a.get("views"):
        rec["derived"] = {"engaged_ratio": round(a.get("engagedViews", 0) / a["views"], 3),
                          "us_view_share": round((rec["us"].get("views") or 0) / a["views"], 3)}
    with open(db_dir() / "snapshots.jsonl", "a") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    return rec


def cmd_snapshot(a):
    vids = uploads()
    if a.video:
        sel = [(v, checkpoint_for((now() - published(v)).total_seconds() / 3600),
                (now() - published(v)).total_seconds() / 3600) for v in vids if v["id"] in a.video]
    elif a.all:
        sel = [(v, checkpoint_for((now() - published(v)).total_seconds() / 3600),
                (now() - published(v)).total_seconds() / 3600) for v in vids if is_public(v)]
        sel = [(v, cp if cp != "early" else "early", age) for v, cp, age in sel]
    else:
        sel = due_videos(vids)
    out = [snapshot_one(v, cp, age) for v, cp, age in sel]
    print(json.dumps({"channel": yt.CHANNEL, "written": len(out),
                      "videos": [{"id": r["video_id"], "checkpoint": r["checkpoint"], "views": r["analytics"].get("views"),
                                  "data_through": r["data_through"]} for r in out],
                      "database": str((db_dir() / "snapshots.jsonl").relative_to(ROOT))}, indent=1))


def cmd_due(a):
    print(json.dumps([{"id": v["id"], "title": v["snippet"]["title"], "checkpoint": cp, "age_hours": round(age, 1)}
                      for v, cp, age in due_videos(uploads())], indent=1, ensure_ascii=False))


def period(days, end):
    return (end - timedelta(days=days - 1)).isoformat(), end.isoformat()


def cmd_channel_report(a):
    end = (now() - timedelta(days=2)).date()  # analytics lag
    yt.token()
    ch = yt._call("GET", f"{API}/channels", {"part": "snippet,statistics", "id": yt.CHANNEL_ID})["items"][0]
    created = ch["snippet"]["publishedAt"][:10]
    periods = {"7d": period(7, end), "prev7d": period(7, end - timedelta(days=7)), "28d": period(28, end),
               "prev28d": period(28, end - timedelta(days=28)), "90d": period(90, end), "lifetime": (created, end.isoformat())}
    m = "views,engagedViews,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,subscribersLost"
    out = {"channel": yt.CHANNEL, "generated_at": now().isoformat(timespec="seconds"), "data_through": end.isoformat(),
           "subscribers": ch["statistics"].get("subscriberCount"), "total_views": ch["statistics"].get("viewCount"),
           "videos": ch["statistics"].get("videoCount"), "periods": {}}
    for name, (s, e) in periods.items():
        out["periods"][name] = {
            "range": [s, e],
            "by_format": {r["creatorContentType"]: r for r in rows_as_dicts(report(m, s, e, dims="creatorContentType"))},
            "us": (rows_as_dicts(report("views,estimatedMinutesWatched,averageViewDuration", s, e, filters="country==US")) or [{}])[0],
            "all": (rows_as_dicts(report("views,estimatedMinutesWatched", s, e)) or [{}])[0],
        }
    s, e = periods["28d"]
    out["last28"] = {
        "traffic_sources": rows_as_dicts(report("views,estimatedMinutesWatched", s, e, dims="insightTrafficSourceType", sort="-views")),
        "top_countries": rows_as_dicts(report("views,estimatedMinutesWatched,averageViewDuration", s, e, dims="country", sort="-views", max_results=10)),
        "search_terms": rows_as_dicts(report("views", s, e, dims="insightTrafficSourceDetail", filters="insightTrafficSourceType==YT_SEARCH", sort="-views", max_results=20)),
        "devices": rows_as_dicts(report("views", s, e, dims="deviceType")),
        "subscribed_status": rows_as_dicts(report("views,averageViewDuration", s, e, dims="subscribedStatus")),
        "top_videos": rows_as_dicts(report("views,engagedViews,averageViewPercentage,subscribersGained", s, e, dims="video", sort="-views", max_results=10)),
    }
    tz = {}
    for r in rows_as_dicts(report("views", s, e, dims="province", filters="country==US", sort="-views", max_results=60)):
        z = STATE_TZ.get(r["province"].split("-")[-1], "other")
        tz[z] = tz.get(z, 0) + r["views"]
    tot = sum(tz.values()) or 1
    out["last28"]["us_time_zone_mix"] = {k: f"{v} views ({v / tot:.0%})" for k, v in sorted(tz.items(), key=lambda x: -x[1])}
    out["unavailable_in_api"] = ["impressions", "impressions CTR", "returning/new viewers",
                                 "when your viewers are on YouTube"]
    text = json.dumps(out, indent=1, ensure_ascii=False)
    if a.write:
        d = ROOT / "youtube-growth" / yt.CHANNEL / "analytics" / "weekly"
        d.mkdir(parents=True, exist_ok=True)
        (d / f"{now().date().isoformat()}-channel-report.json").write_text(text + "\n")
    print(text)


def cmd_retention(a):
    yt.token()
    v = yt.get_video(a.video_id, "snippet,contentDetails")
    dur = iso_dur(v["contentDetails"]["duration"]) or 0
    start = v["snippet"]["publishedAt"][:10]
    r = rows_as_dicts(report("audienceWatchRatio,relativeRetentionPerformance", start, now().date().isoformat(),
                             dims="elapsedVideoTimeRatio", filters=f"video=={a.video_id}"))
    if not r:
        print(json.dumps({"video": a.video_id, "note": "no retention data yet (analytics lag or too few views)"})); return
    drops = []
    for i in range(1, len(r)):
        d = r[i]["audienceWatchRatio"] - r[i - 1]["audienceWatchRatio"]
        drops.append((d, r[i]["elapsedVideoTimeRatio"]))
    rises = sorted([x for x in drops if x[0] > 0], reverse=True)[:3]
    drops = sorted(drops)[:5]
    pick = lambda t: round(t * dur, 1)
    print(json.dumps({
        "video": a.video_id, "duration_s": dur,
        "curve_every_10pct": [{"at_s": pick(x["elapsedVideoTimeRatio"]), "watch_ratio": round(x["audienceWatchRatio"], 3),
                               "vs_similar": round(x["relativeRetentionPerformance"], 3)} for x in r[::10]],
        "biggest_drops": [{"at_s": pick(t), "change": round(d, 3)} for d, t in drops],
        "rewatch_spikes": [{"at_s": pick(t), "change": round(d, 3)} for d, t in rises],
        "note": "Map each at_s to the script line and scene in the storyboard before diagnosing. "
                "watch_ratio > 1 early on is rewatches/loops (common on Shorts).",
    }, indent=1))


# YPP thresholds as last checked (verify on support.google.com/youtube/answer/72851 before relying on them;
# they differ by country and change over time). Update LAST_CHECKED when you re-verify.
YPP = {"last_checked": "2026-11-15 (from prior knowledge; re-verify on the official page)",
       "full": {"subscribers": 1000, "public_watch_hours_365d": 4000, "or_public_shorts_views_90d": 10_000_000},
       "early_fan_funding": {"subscribers": 500, "public_uploads_90d": 3, "public_watch_hours_365d": 3000,
                             "or_public_shorts_views_90d": 3_000_000}}


def cmd_monetization(a):
    end = (now() - timedelta(days=2)).date()
    yt.token()
    ch = yt._call("GET", f"{API}/channels", {"part": "statistics", "id": yt.CHANNEL_ID})["items"][0]["statistics"]
    s365, s90 = (end - timedelta(days=364)).isoformat(), (end - timedelta(days=89)).isoformat()
    longf = (rows_as_dicts(report("estimatedMinutesWatched", s365, end.isoformat(), filters="creatorContentType==videoOnDemand")) or [{}])[0]
    shorts = (rows_as_dicts(report("views", s90, end.isoformat(), filters="creatorContentType==shorts")) or [{}])[0]
    pub90 = sum(1 for v in uploads() if is_public(v) and (now() - published(v)).days <= 90)
    hours = round((longf.get("estimatedMinutesWatched") or 0) / 60, 1)
    out = {"channel": yt.CHANNEL, "checked_at": now().isoformat(timespec="seconds"), "data_through": end.isoformat(),
           "subscribers": int(ch.get("subscriberCount", 0)), "long_form_watch_hours_365d": hours,
           "shorts_views_90d": shorts.get("views") or 0, "public_uploads_90d": pub90, "thresholds": YPP,
           "caveats": ["API watch hours include all long-form views; YPP counts only valid public watch hours "
                       "(Studio > Earn shows the official figure).",
                       "Shorts views here are all Shorts views; YPP counts valid public Shorts feed views.",
                       "Eligibility also needs policy compliance, no active Community Guidelines strikes, 2-Step "
                       "Verification and an AdSense account: check Studio > Earn."]}
    if a.write:
        f = ROOT / "youtube-growth" / yt.CHANNEL / "monetization" / "eligibility-log.jsonl"
        f.parent.mkdir(parents=True, exist_ok=True)
        with open(f, "a") as fh: fh.write(json.dumps(out) + "\n")
    print(json.dumps(out, indent=1))


def cmd_publish_times(a):
    snaps = existing()
    rows = []
    for v in uploads():
        if not is_public(v): continue
        pub = published(v)
        by_cp = {r["checkpoint"]: r["analytics"].get("views") for r in snaps if r["video_id"] == v["id"]}
        rows.append({"id": v["id"], "title": v["snippet"]["title"][:60], "utc": pub.isoformat(),
                     **{k: pub.astimezone(ZoneInfo(z)).strftime("%a %H:%M") for k, z in TZS.items() if k != "MT"},
                     "views_24h": by_cp.get("24h"), "views_72h": by_cp.get("72h"), "views_7d": by_cp.get("7d")})
    print(json.dumps(rows, indent=1, ensure_ascii=False))


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--channel", choices=sorted(yt.CHANNELS), default="whichlifenext")
    sp = p.add_subparsers(dest="cmd", required=True)
    s = sp.add_parser("snapshot"); s.add_argument("--video", nargs="*"); s.add_argument("--all", action="store_true")
    s.add_argument("--due", action="store_true", help="default behaviour; kept for readability"); s.set_defaults(f=cmd_snapshot)
    sp.add_parser("due").set_defaults(f=cmd_due)
    s = sp.add_parser("channel-report"); s.add_argument("--write", action="store_true"); s.set_defaults(f=cmd_channel_report)
    s = sp.add_parser("retention"); s.add_argument("video_id"); s.set_defaults(f=cmd_retention)
    s = sp.add_parser("monetization"); s.add_argument("--write", action="store_true"); s.set_defaults(f=cmd_monetization)
    sp.add_parser("publish-times").set_defaults(f=cmd_publish_times)
    a = p.parse_args()
    yt.CHANNEL = a.channel; yt.CHANNEL_ID = yt.CHANNELS[a.channel][1]
    a.f(a)


if __name__ == "__main__":
    main()
