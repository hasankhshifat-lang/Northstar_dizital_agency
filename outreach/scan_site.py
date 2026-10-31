#!/usr/bin/env python3
"""Scan business websites: find public contact emails and detect existing chat / voice assistants.

Usage: python3 scan_site.py https://example.com [https://other.com ...]
Prints one JSON object per site:
  {"url", "ok", "emails": [...], "chatbot": true/false, "chatbot_hits": [...], "error"}

Needs outbound web access (environment Network access = Full).
"""
import json
import re
import sys
import urllib.parse
import urllib.request

UA = "Mozilla/5.0 (compatible; NorthStarSiteCheck/1.0)"
CONTACT_PATHS = ["", "/contact", "/contact-us", "/contact/", "/about", "/about-us"]

# Script/host signatures of chat, chatbot and AI voice widgets.
CHATBOT_SIGNS = [
    "intercom", "widget.intercom.io", "tidio", "drift.com", "driftt", "livechatinc", "livechat.com",
    "tawk.to", "embed.tawk", "podium.com", "birdeye.com", "zopim", "zendesk", "zdassets", "hs-scripts",
    "hubspot.com/conversations", "js.usemessages.com", "crisp.chat", "olark", "freshchat", "freshworks",
    "getweave", "ngage", "apexchat", "smith.ai", "chatra", "purechat", "manychat", "chatbase",
    "voiceflow", "botpress", "elevenlabs-convai", "elevenlabs.io/convai", "vapi.ai", "retellai", "landbot",
    "chatfuel", "gorgias", "kustomer", "liveperson", "botsonic", "customgpt", "dante-ai",
    "leadconnectorhq", "msgsndr", "chat-widget", "chatwidget", "webchat", "nicejob",
    "solutionreach", "localmed", "yext.*chat", "chat with us", "live chat", "ai assistant",
]
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
BAD_EMAIL = re.compile(
    r"(example\.|sentry|wixpress|godaddy|squarespace|domain\.com|email\.com|yourdomain|\.png|\.jpg|\.jpeg|\.gif|"
    r"\.webp|\.svg|noreply|no-reply|privacy@|abuse@|postmaster@|webmaster@|wordpress)",
    re.I,
)


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=15) as r:
        return r.read(800_000).decode("utf-8", "ignore")


def scan(site):
    base = site.rstrip("/")
    parsed = urllib.parse.urlparse(base)
    root = f"{parsed.scheme}://{parsed.netloc}"
    domain = parsed.netloc.lower().removeprefix("www.")
    out = {"url": site, "ok": False, "emails": [], "chatbot": False, "chatbot_hits": [], "error": None}
    emails, hits = [], set()
    for path in CONTACT_PATHS:
        url = base if path == "" else root + path
        try:
            html = fetch(url)
        except Exception as e:  # noqa: BLE001
            if path == "":
                out["error"] = f"{type(e).__name__}: {e}"
            continue
        out["ok"] = True
        low = html.lower()
        for sign in CHATBOT_SIGNS:
            if re.search(sign, low):
                hits.add(sign)
        for e in EMAIL_RE.findall(html):
            e = e.strip(".").lower()
            if not BAD_EMAIL.search(e) and e not in emails:
                emails.append(e)
        if emails and path:
            break
    # Prefer addresses on the business's own domain.
    emails.sort(key=lambda e: (not e.endswith(domain), e))
    out["emails"] = emails[:5]
    out["chatbot_hits"] = sorted(hits)
    out["chatbot"] = bool(hits)
    return out


if __name__ == "__main__":
    for s in sys.argv[1:]:
        print(json.dumps(scan(s)), flush=True)
