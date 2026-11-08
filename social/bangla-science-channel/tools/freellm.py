#!/usr/bin/env python3
"""Free LLM router for the Bangla science channel (standard library only).

Sends an OpenAI-style chat request to free-tier providers and falls over to the
next one on rate limits, server errors or timeouts:

  1. FreeLLMAPI, if FREELLMAPI_URL is set (e.g. http://localhost:3001/v1, key in FREELLMAPI_KEY)
  2. Google Gemini   (GEMINI_API_KEY)      - best Bangla quality of the free tiers
  3. Groq            (GROQ_API_KEY)
  4. OpenRouter free (OPENROUTER_API_KEY)

In the Claude Code cloud environment the keys are injected by the network proxy,
so a missing env var falls back to a placeholder that the proxy replaces.
Never commit real keys.

Usage:
  python3 freellm.py ask "প্রশ্ন..."
  python3 freellm.py draft --topic "..." --syllabus "..." --out drafts/x.md
"""
import argparse, json, os, sys, time, urllib.request, urllib.error
from pathlib import Path

HERE = Path(__file__).resolve().parent
CHANNEL = HERE.parent

def providers():
    p = []
    if os.environ.get("FREELLMAPI_URL"):
        p.append(("freellmapi", os.environ["FREELLMAPI_URL"].rstrip("/"), os.environ.get("FREELLMAPI_KEY", ""), "auto"))
    gkey = os.environ.get("GEMINI_API_KEY", "proxy-injected")
    for gm in os.environ.get("GEMINI_MODELS", "gemini-3.8-flash,gemini-3.5-flash").split(","):
        p.append(("gemini", "https://generativelanguage.googleapis.com/v1beta/openai", gkey, gm.strip()))
    p += [
        ("groq", "https://api.groq.com/openai/v1",
         os.environ.get("GROQ_API_KEY", "proxy-injected"), os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b")),
        ("openrouter", "https://openrouter.ai/api/v1",
         os.environ.get("OPENROUTER_API_KEY", "proxy-injected"), os.environ.get("OPENROUTER_MODEL", "openrouter/free")),
    ]
    return p

def chat(messages, temperature=0.7, max_tokens=8000, only=None):
    errors = []
    for name, base, key, model in providers():
        if only and name != only:
            continue
        body = json.dumps({"model": model, "messages": messages, "temperature": temperature,
                           "max_tokens": max_tokens}).encode()
        req = urllib.request.Request(base + "/chat/completions", data=body, method="POST",
                                     headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}",
                                              "User-Agent": "Mozilla/5.0 (golpe-biggan-script-tool)"})
        for attempt in range(2):
            try:
                with urllib.request.urlopen(req, timeout=180) as r:
                    data = json.load(r)
                text = data["choices"][0]["message"]["content"]
                if text and text.strip():
                    return {"provider": name, "model": data.get("model", model), "text": text}
                errors.append(f"{name}: empty response"); break
            except urllib.error.HTTPError as e:
                msg = e.read().decode(errors="replace")[:300]
                errors.append(f"{name} HTTP {e.code}: {msg}")
                if e.code in (429, 500, 502, 503, 504) and attempt == 0:
                    time.sleep(4); continue
                break
            except Exception as e:  # timeout, DNS, etc.
                errors.append(f"{name}: {e}"); break
    raise RuntimeError("All free providers failed:\n" + "\n".join(errors))

SYSTEM = """তুমি "গল্পে বিজ্ঞান" নামের বাংলা YouTube Shorts চ্যানেলের স্ক্রিপ্ট লেখক। চ্যানেলটা বাংলাদেশের NCTB পাঠ্যবইয়ের বিজ্ঞান
মজার কমিক গল্পে শেখায়। রিকশা-আর্ট স্টাইল। মূল চরিত্র (প্রতি পর্বে তিনজনই থাকবে):
- মন্টু মামা: চায়ের দোকানদার, বড় ভুঁড়ি, লুঙ্গি-ফতুয়া, গোঁফ; সবসময় একটা "দারুণ" ভুল আইডিয়া; ঢাকাইয়া টান ("আরে বাপ!", "কী কস!")।
- বিথী: ক্লাস এইটের বুদ্ধিমতী মেয়ে, চশমা; হাতে-কলমে দেখিয়ে ব্যাখ্যা করে।
- বল্টু: বিথীর ছোট ভাই; শুধু "কেন?" জিজ্ঞেস করে; স্ল্যাপস্টিক কমেডি।
নিয়ম:
- কাঠামো: মজার শুরু → অসম্ভব প্রশ্ন → ভুল চেষ্টা ও কমেডি → বিজ্ঞানের মোড় (খাতা প্যানেল) → সমাধান + টুইস্ট → কমেন্টের ধাঁধা।
- দৈর্ঘ্য ২:৩০–২:৫০, প্রতি ২–৪ সেকেন্ডে নতুন ভিজ্যুয়াল বিট। বাংলাদেশি পরিবেশ (চায়ের দোকান, রিকশা, লঞ্চ, গ্রাম, স্কুল)।
- প্রতিটা বৈজ্ঞানিক দাবি অবশ্যই দেওয়া পাঠ্যবইয়ের অধ্যায়ের সাথে মিলতে হবে। অনিশ্চিত সংখ্যা বা তথ্য বানাবে না; সন্দেহ থাকলে
  "[যাচাই দরকার: ...]" লিখে চিহ্নিত করবে।
- বিপজ্জনক পরীক্ষা ঘরে করতে বলবে না। কাউকে অপমান করবে না।
- আউটপুট Markdown, নিচের নমুনা পাইলটের মতো একই ফরম্যাটে: হেডার টেবিল, টাইটেল, টাইটেল প্লেটের লেখা, শট-বাই-শট স্ক্রিপ্ট
  (দৃশ্য / খাতা প্যানেল / সংলাপ / SFX), পিন করা কমেন্ট + উত্তর, ডেসক্রিপশন, কভার ফ্রেম, আর শেষে "যেসব দাবি যাচাই করতে হবে" তালিকা।
"""

def cmd_draft(a):
    example = (CHANNEL / "pilot-01-launch-bhashe.md").read_text(encoding="utf-8")
    example = example.split("## তথ্য যাচাই")[0]  # format example only
    user = (f"নতুন পর্ব লেখো।\nবিষয়: {a.topic}\nসিলেবাস: {a.syllabus}\n"
            + (f"পাঠ্যবইয়ের মূল তথ্য (এর বাইরে বৈজ্ঞানিক দাবি করবে না):\n{a.facts}\n" if a.facts else "")
            + "\n---\nফরম্যাটের নমুনা (বিষয়বস্তু কপি করবে না):\n" + example)
    res = chat([{"role": "system", "content": SYSTEM}, {"role": "user", "content": user}],
               temperature=0.8, only=a.provider)
    out = Path(a.out); out.parent.mkdir(parents=True, exist_ok=True)
    header = (f"<!-- খসড়া: {res['provider']} / {res['model']} দিয়ে লেখা, {time.strftime('%Y-%m-%d')}। "
              "প্রকাশের আগে পাঠ্যবই + বাইরের সূত্রে দুই ধাপে যাচাই বাধ্যতামূলক। -->\n\n")
    out.write_text(header + res["text"].strip() + "\n", encoding="utf-8")
    print(f"saved {out} via {res['provider']} ({res['model']}), {len(res['text'])} chars")

def cmd_ask(a):
    res = chat([{"role": "user", "content": a.prompt}], only=a.provider)
    print(f"[{res['provider']} / {res['model']}]\n{res['text']}")

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = ap.add_subparsers(dest="cmd", required=True)
    s = sp.add_parser("ask"); s.add_argument("prompt"); s.add_argument("--provider"); s.set_defaults(f=cmd_ask)
    s = sp.add_parser("draft"); s.add_argument("--topic", required=True); s.add_argument("--syllabus", required=True)
    s.add_argument("--facts", default=""); s.add_argument("--out", required=True); s.add_argument("--provider")
    s.set_defaults(f=cmd_draft)
    a = ap.parse_args(); a.f(a)

if __name__ == "__main__":
    main()
