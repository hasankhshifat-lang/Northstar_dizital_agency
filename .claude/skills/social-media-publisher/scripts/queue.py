#!/usr/bin/env python3
"""Persistent publishing queue helper for the social-media-publisher skill.

Stdlib only. Handles the queue file, locking, due-task detection, status changes,
duplicate prevention, history and daily reports. It makes no network calls:
platform uploads are done separately through the official APIs.

Usage (run from anywhere; --root defaults to ./social-media):
  queue.py init
  queue.py list [--date YYYY-MM-DD] [--platform P] [--status S]
  queue.py add --platform P --media PATH --metadata PATH --publish-at ISO
               [--id ID] [--thumbnail PATH] [--format F] [--timezone TZ]
  queue.py due [--window-min N]          # tasks to run now (JSON); flags missed ones
  queue.py claim ID                      # lock a task for execution (UPLOADING)
  queue.py set-status ID STATUS [--platform-id X] [--url U] [--thumbnail-status S]
               [--session S] [--error-type T] [--error-message M] [--retryable]
  queue.py approve ID [ID ...] | --all
  queue.py cancel ID
  queue.py report [--date YYYY-MM-DD]
"""
import argparse
import contextlib
import datetime as dt
import fcntl
import hashlib
import json
import os
import sys
import tempfile
from zoneinfo import ZoneInfo

STATUSES = ["PENDING", "VALIDATING", "SCHEDULED", "UPLOADING", "PROCESSING",
            "PUBLISHED", "FAILED", "CANCELLED", "REQUIRES_AUTHORIZATION"]
PLATFORMS = ["youtube", "facebook", "tiktok"]
PREFIX = {"youtube": "yt", "facebook": "fb", "tiktok": "tt"}
TERMINAL = {"PUBLISHED", "CANCELLED"}
REDACT_KEYS = ("token", "secret", "password", "authorization")


def now_utc():
    return dt.datetime.now(dt.timezone.utc)


def paths(root):
    return {
        "calendar": os.path.join(root, "schedule", "publishing-calendar.json"),
        "history": os.path.join(root, "logs", "publishing-history.json"),
        "reports": os.path.join(root, "logs", "reports"),
        "lock": os.path.join(root, "schedule", ".queue.lock"),
    }


def read_json(path, default):
    if not os.path.exists(path):
        return default
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def write_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=os.path.dirname(path), suffix=".tmp")
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    os.replace(tmp, path)  # atomic: a crash never leaves a half-written queue


@contextlib.contextmanager
def locked(root):
    p = paths(root)
    os.makedirs(os.path.dirname(p["lock"]), exist_ok=True)
    with open(p["lock"], "w") as lf:
        fcntl.flock(lf, fcntl.LOCK_EX)
        try:
            yield
        finally:
            fcntl.flock(lf, fcntl.LOCK_UN)


def redact(value):
    if isinstance(value, dict):
        return {k: ("[REDACTED]" if any(r in k.lower() for r in REDACT_KEYS) else redact(v))
                for k, v in value.items()}
    if isinstance(value, str) and ("access_token=" in value or "Bearer " in value):
        return "[REDACTED]"
    return value


def task_tz(cal, task):
    return ZoneInfo(task.get("timezone") or cal.get("timezone") or "UTC")


def publish_dt(cal, task):
    """Return the task's publish time as an aware datetime, or None for 'now'."""
    raw = task["publish_at"]
    if raw == "now":
        return None
    t = dt.datetime.fromisoformat(raw)
    if t.tzinfo is None:
        t = t.replace(tzinfo=task_tz(cal, task))
    return t


def fingerprint(task):
    key = "|".join([task["platform"], task.get("format", ""), task.get("media", ""),
                    task["publish_at"]])
    return hashlib.sha256(key.encode()).hexdigest()[:16]


def find(cal, task_id):
    for t in cal["tasks"]:
        if t["id"] == task_id:
            return t
    sys.exit(f"error: no task with id {task_id!r}")


def log_history(root, cal, task, status):
    p = paths(root)
    hist = read_json(p["history"], [])
    pub = publish_dt(cal, task)
    res = task.get("result") or {}
    hist.append(redact({
        "at": now_utc().isoformat(timespec="seconds"),
        "task_id": task["id"],
        "platform": task["platform"],
        "content": os.path.splitext(os.path.basename(task.get("media") or task["id"]))[0],
        "status": status,
        "publish_time_local": pub.isoformat() if pub else "now",
        "platform_id": res.get("platform_id"),
        "url": res.get("url"),
        "thumbnail_status": res.get("thumbnail_status"),
        "error": task.get("error"),
    }))
    write_json(p["history"], hist)


def load(root):
    cal = read_json(paths(root)["calendar"], None)
    if cal is None:
        sys.exit(f"error: no queue at {paths(root)['calendar']} (run `init`)")
    cal.setdefault("tasks", [])
    return cal


def save(root, cal):
    write_json(paths(root)["calendar"], cal)


# ---------- commands ----------

def cmd_init(a):
    p = paths(a.root)
    for sub in ["youtube/videos", "youtube/thumbnails", "youtube/metadata",
                "facebook/videos", "facebook/images", "facebook/metadata",
                "tiktok/videos", "tiktok/metadata", "schedule", "logs/reports"]:
        os.makedirs(os.path.join(a.root, sub), exist_ok=True)
    if not os.path.exists(p["calendar"]):
        write_json(p["calendar"], {"timezone": a.timezone, "mode": "APPROVAL", "tasks": []})
    if not os.path.exists(p["history"]):
        write_json(p["history"], [])
    print(f"initialised {a.root}")


def cmd_add(a):
    if a.platform not in PLATFORMS:
        sys.exit(f"error: platform must be one of {PLATFORMS}")
    with locked(a.root):
        cal = load(a.root)
        task = {
            "id": a.id or f"{PREFIX[a.platform]}-{a.publish_at[:10]}-"
                          f"{os.path.splitext(os.path.basename(a.media or 'text'))[0]}",
            "platform": a.platform,
            "media": a.media,
            "metadata": a.metadata,
            "publish_at": a.publish_at,
            "status": "PENDING",
        }
        for k in ("thumbnail", "format", "timezone"):
            if getattr(a, k):
                task[k] = getattr(a, k)
        if task["publish_at"] != "now":
            publish_dt(cal, task)  # validates the timestamp
        task["fingerprint"] = fingerprint(task)
        for t in cal["tasks"]:
            if t.get("fingerprint") == task["fingerprint"] and t["status"] != "CANCELLED":
                sys.exit(f"error: duplicate of task {t['id']!r} (same platform/media/time)")
            if t["id"] == task["id"]:
                sys.exit(f"error: task id {task['id']!r} already exists; pass a different --id")
        cal["tasks"].append(task)
        save(a.root, cal)
        log_history(a.root, cal, task, "PENDING")
    print(json.dumps(task, indent=2))


def cmd_list(a):
    cal = load(a.root)
    rows = []
    for t in cal["tasks"]:
        pub = publish_dt(cal, t)
        if a.date and (pub is None or pub.astimezone(task_tz(cal, t)).date().isoformat() != a.date):
            continue
        if a.platform and t["platform"] != a.platform:
            continue
        if a.status and t["status"] != a.status:
            continue
        rows.append((pub.isoformat() if pub else "now", t["platform"], t["status"],
                     "approved" if t.get("approved") else "-", t["id"]))
    rows.sort()
    print(f"timezone: {cal.get('timezone')}  mode: {cal.get('mode', 'APPROVAL')}")
    for r in rows:
        print("  ".join(r))
    if not rows:
        print("(no matching tasks)")


def cmd_due(a):
    """Tasks that should run now. Missed = due more than --window-min ago."""
    cal = load(a.root)
    now = now_utc()
    out = {"now_utc": now.isoformat(timespec="seconds"), "due": [], "missed": [],
           "awaiting_approval": [], "resume": []}
    for t in cal["tasks"]:
        st = t["status"]
        if st in ("UPLOADING", "PROCESSING"):
            out["resume"].append(t)  # interrupted run: resume the saved session, don't re-upload
            continue
        if st != "PENDING":
            continue
        pub = publish_dt(cal, t)
        # YouTube (and FB within Meta's window) are uploaded ahead with native scheduling;
        # the agent decides that. Here we only flag tasks whose time has arrived.
        if pub is not None and pub > now:
            continue
        if not t.get("approved"):
            out["awaiting_approval"].append(t)
        elif pub is not None and (now - pub).total_seconds() > a.window_min * 60:
            out["missed"].append(t)  # ask the user before publishing late
        else:
            out["due"].append(t)
    print(json.dumps(out, indent=2))


def cmd_claim(a):
    with locked(a.root):
        cal = load(a.root)
        t = find(cal, a.id)
        if t["status"] in TERMINAL:
            sys.exit(f"error: task {a.id} is {t['status']}; refusing to run it again")
        if (t.get("result") or {}).get("platform_id"):
            sys.exit(f"error: task {a.id} already has platform id "
                     f"{t['result']['platform_id']}; verify on the platform instead of re-uploading")
        if t["status"] == "UPLOADING" and not a.force:
            sys.exit(f"error: task {a.id} is already UPLOADING (another run?). "
                     "Use --force only to resume its saved session.")
        t["status"] = "UPLOADING"
        t["attempts"] = t.get("attempts", 0) + 1
        save(a.root, cal)
        log_history(a.root, cal, t, "UPLOADING")
    print(json.dumps(t, indent=2))


def cmd_set_status(a):
    if a.status not in STATUSES:
        sys.exit(f"error: status must be one of {STATUSES}")
    with locked(a.root):
        cal = load(a.root)
        t = find(cal, a.id)
        if a.status == "PUBLISHED" and not (a.platform_id or (t.get("result") or {}).get("platform_id")):
            sys.exit("error: PUBLISHED requires --platform-id confirmed by the platform")
        res = t.setdefault("result", {})
        if a.platform_id:
            res["platform_id"] = a.platform_id
        if a.url:
            res["url"] = a.url
        if a.thumbnail_status:
            res["thumbnail_status"] = a.thumbnail_status
        if a.session:
            t["upload_session"] = a.session
        if a.status in ("PUBLISHED", "SCHEDULED"):
            res["verified_at"] = now_utc().isoformat(timespec="seconds")
        if a.error_type:
            t["error"] = {"type": a.error_type, "message": redact(a.error_message or ""),
                          "retryable": bool(a.retryable),
                          "at": now_utc().isoformat(timespec="seconds")}
        elif a.status in ("PUBLISHED", "SCHEDULED", "PROCESSING"):
            t["error"] = None
        t["status"] = a.status
        save(a.root, cal)
        log_history(a.root, cal, t, a.status)
    print(f"{a.id}: {a.status}")


def cmd_approve(a):
    with locked(a.root):
        cal = load(a.root)
        targets = cal["tasks"] if a.all else [find(cal, i) for i in a.ids]
        for t in targets:
            if t["status"] == "PENDING":
                t["approved"] = True
                print(f"approved {t['id']}")
        save(a.root, cal)


def cmd_cancel(a):
    with locked(a.root):
        cal = load(a.root)
        t = find(cal, a.id)
        if t["status"] == "PUBLISHED":
            sys.exit("error: already published; delete it on the platform if the user asks")
        on_platform = (t.get("result") or {}).get("platform_id")
        t["status"] = "CANCELLED"
        save(a.root, cal)
        log_history(a.root, cal, t, "CANCELLED")
    print(f"{a.id}: CANCELLED")
    if on_platform:
        print(f"note: platform object {on_platform} still exists (e.g. scheduled on YouTube/Facebook). "
              "Ask the user before deleting it there.")


LABEL = {"youtube": "YouTube", "facebook": "Facebook", "tiktok": "TikTok"}


def cmd_report(a):
    cal = load(a.root)
    tz = ZoneInfo(cal.get("timezone") or "UTC")
    day = a.date or now_utc().astimezone(tz).date().isoformat()
    day_dt = dt.date.fromisoformat(day)
    lines = ["SOCIAL MEDIA PUBLISHING REPORT", "",
             f"Date: {day_dt.strftime('%d %B %Y')}", f"Timezone: {cal.get('timezone')}", ""]
    counts = {}
    for plat in PLATFORMS:
        items = []
        for t in cal["tasks"]:
            if t["platform"] != plat:
                continue
            pub = publish_dt(cal, t)
            if pub is not None and pub.astimezone(tz).date() != day_dt:
                continue
            if pub is None and t["status"] not in ("PUBLISHED", "FAILED", "PROCESSING"):
                continue
            res = t.get("result") or {}
            name = os.path.splitext(os.path.basename(t.get("media") or t["id"]))[0]
            line = f"- {name}: {t['status'].replace('_', ' ').title()}"
            if t["status"] == "SCHEDULED" and pub is not None:
                line += f" ({pub.astimezone(tz).strftime('%Y-%m-%d %H:%M')})"
            if res.get("url"):
                line += f" — {res['url']}"
            if t.get("error") and t["status"] in ("FAILED", "REQUIRES_AUTHORIZATION"):
                line += f" — {t['error'].get('type')}: {t['error'].get('message', '')}"
            if plat == "youtube" and res.get("thumbnail_status"):
                line += f" [thumbnail: {res['thumbnail_status']}]"
            items.append(line)
            counts[t["status"]] = counts.get(t["status"], 0) + 1
        if items:
            lines += [f"{LABEL[plat]}:", *items, ""]
    total = sum(counts.values())
    lines += ["Summary:", f"Total tasks: {total}"]
    for st in STATUSES:
        if counts.get(st):
            lines.append(f"{st.replace('_', ' ').title()}: {counts[st]}")
    text = "\n".join(lines) + "\n"
    out = os.path.join(paths(a.root)["reports"], f"{day}.md")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        f.write(text)
    print(text)
    print(f"(saved to {out})")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--root", default="social-media")
    sp = ap.add_subparsers(dest="cmd", required=True)

    p = sp.add_parser("init"); p.add_argument("--timezone", default="Asia/Singapore"); p.set_defaults(f=cmd_init)
    p = sp.add_parser("add")
    p.add_argument("--platform", required=True); p.add_argument("--media")
    p.add_argument("--metadata", required=True); p.add_argument("--publish-at", required=True)
    p.add_argument("--id"); p.add_argument("--thumbnail"); p.add_argument("--format"); p.add_argument("--timezone")
    p.set_defaults(f=cmd_add)
    p = sp.add_parser("list"); p.add_argument("--date"); p.add_argument("--platform"); p.add_argument("--status")
    p.set_defaults(f=cmd_list)
    p = sp.add_parser("due"); p.add_argument("--window-min", type=int, default=30); p.set_defaults(f=cmd_due)
    p = sp.add_parser("claim"); p.add_argument("id"); p.add_argument("--force", action="store_true"); p.set_defaults(f=cmd_claim)
    p = sp.add_parser("set-status"); p.add_argument("id"); p.add_argument("status")
    for opt in ("--platform-id", "--url", "--thumbnail-status", "--session", "--error-type", "--error-message"):
        p.add_argument(opt)
    p.add_argument("--retryable", action="store_true"); p.set_defaults(f=cmd_set_status)
    p = sp.add_parser("approve"); p.add_argument("ids", nargs="*"); p.add_argument("--all", action="store_true")
    p.set_defaults(f=cmd_approve)
    p = sp.add_parser("cancel"); p.add_argument("id"); p.set_defaults(f=cmd_cancel)
    p = sp.add_parser("report"); p.add_argument("--date"); p.set_defaults(f=cmd_report)

    a = ap.parse_args()
    a.f(a)


if __name__ == "__main__":
    main()
