#!/usr/bin/env python3
"""Full Pilot 1 episode, paper-collage stop-motion style, with science boards. Writes anim/episode.html."""
import json, re, sys
from pathlib import Path
S = Path(sys.argv[1])
sys.path.insert(0, str(S / "anim"))
src = (S / "anim/build.py").read_text()
# reuse BG / JACKETS / PROPS / FONT helpers from build.py without running its writer
ns = {"__name__": "x", "sys": type("s", (), {"argv": ["", str(S)]})}
exec(src.split("DATA = {")[0].replace("S = Path(sys.argv[1])", f"S = Path({str(S)!r})"), ns)
BG, JACKETS, PROPS, FONT_CSS = ns["BG"], ns["JACKETS"], ns["PROPS"], ns["FONT_CSS"]
chars = json.loads((S / "chars/chars.json").read_text())
tl = json.loads((S / "vo/timeline.json").read_text())

# ---- caption phrases (short), with explicit phrase END times where Whisper gave them ----
PH = {
 5: [("মামা, ভয় পেয়ো না।", 24.92), ("কোনো কিছু ডুববে কি না,", 26.7), ("সেটা শুধু উপাদানের ওপর নির্ভর করে না।", 29.1), ("আকৃতির ওপরও নির্ভর করে।", 30.96), ("দেখো!", None)],
 7: [("একই রাংতা, একই ওজন!", 37.64), ("নৌকার আকার ছড়ানো,", 39.52), ("তাই বেশি পানি সরায়।", 40.9), ("যত বেশি পানি সরে,", 42.6), ("পানি তত জোরে উপরে ধাক্কা দেয়।", 45.0), ("এই ধাক্কার নাম প্লবতা।", None)],
 8: [("লঞ্চের ভেতরটা ফাঁপা, বাতাসে ভরা।", 50.76), ("তাই লঞ্চ অনেক অনেক পানি সরায়।", 53.5), ("লঞ্চ ততটুকুই ডোবে,", 55.24), ("যতটুকু ডুবলে সরানো পানির ওজন", 57.6), ("লঞ্চের ওজনের সমান হয়।", 59.62), ("তাই লঞ্চ ভাসে।", 60.94), ("পেরেকটা নিরেট আর ছোট,", 63.0), ("নিজের ওজনের সমান পানি সরাতেই পারে না,", 65.78), ("তাই ডোবে।", None)],
 13: [("এই জন্যই মামা,", 82.0), ("লঞ্চে বেশি যাত্রী বা মাল তোলা বিপজ্জনক।", 85.04), ("ওজন বাড়লে লঞ্চ আরো ডোবে।", 87.3), ("সীমা ছাড়ালে বিপদ।", None)],
 15: [("এবার তোমাদের পালা!", 97.74), ("নদীর মিঠা পানি থেকে", 99.6), ("লঞ্চ সাগরের লোনা পানিতে গেলে,", 101.7), ("লঞ্চ কি একটু উপরে উঠবে,", 103.4), ("নাকি আরো ডুবে যাবে?", 105.06), ("কমেন্টে লেখো!", None)],
 2: [("এই লঞ্চও তো লোহার!", None), ("ছোট্ট পেরেক ডোবে,", None), ("এত্ত বড় লোহা ভাসবো ক্যামনে?", 12.6), ("আমরা সবাই ডুবমু!", None)],
}
caps = []
for ln in tl["lines"]:
    i, st, en = ln["i"], ln["start"], ln["end"]
    parts = PH.get(i) or [(ln["text"], None)]
    # fill missing end times proportionally to characters within the remaining span
    t0 = st; k = 0
    while k < len(parts):
        j = k
        while j < len(parts) and parts[j][1] is None and j < len(parts) - 1: j += 1
        span_end = parts[j][1] if parts[j][1] is not None else en
        group = parts[k:j + 1]; total = sum(len(p[0]) for p in group); tt = t0
        for p in group:
            d = (span_end - t0) * len(p[0]) / total
            caps.append({"s": round(tt, 2), "e": round(tt + d, 2), "t": p[0], "who": ln["speaker"]}); tt += d
        t0 = span_end; k = j + 1
DATA = {"chars": chars, "bg": BG, "jackets": JACKETS, "props": PROPS, "lines": tl["lines"], "caps": caps, "dur": tl["duration"]}

HTML = (S / "anim/episode_template.html").read_text()
out = S / "anim/episode.html"
out.write_text(HTML.replace("__FONTS__", FONT_CSS).replace("__DATA__", json.dumps(DATA, ensure_ascii=False)), encoding="utf-8")
print("wrote", out, len(caps), "caption phrases")
