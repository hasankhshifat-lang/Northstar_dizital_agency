# পাইলট ১: পূর্ণ পর্ব (কাগজের কোলাজ স্টপ-মোশন স্টাইল)

বাছাই করা স্টাইল: **নমুনা ৪, কাগজের কোলাজ স্টপ-মোশন**। ১২ fps-এ স্টপ-মোশন, কাগজ কেটে বানানো চরিত্র (সাদা কাটা কিনারা, ছায়া),
এবড়োখেবড়ো কিনারা, কাগজের দানা, ক্রাফট-কাগজের "ল্যাব বোর্ড"।

`pilot1_paper_full.mp4`: ১:৪৮, 1080×1920, ভয়েস-ওভার `../../voiceover/pilot1_vo.mp3`।

## বিজ্ঞানের অংশে যা দেখানো হয় (ভয়েসের সাথে বাক্য ধরে সিঙ্ক)
| সময় | ভয়েস | পর্দায় |
|---|---|---|
| ০:০৫–০:০৭ | "পেরেক... ডুইবা গেল!" | গোল ক্লোজ-আপে পানিতে পেরেক তলিয়ে যাচ্ছে, বুদবুদ |
| ০:০৯–০:১৫ | "লঞ্চও তো লোহার... ভাসবো ক্যামনে?" | কার্ড: "লোহার পেরেক → ডোবে", "লোহার লঞ্চ → ভাসে?", বড় "?" |
| ০:২৫–০:৩১ | "শুধু উপাদানের ওপর নয়, আকৃতির ওপরও" | কার্ড: "শুধু উপাদান?" (লোহা) ✗, "আকৃতিও!" (নৌকা/গুলি) ✓ |
| ০:৩৬–০:৪৭ | রাংতার পরীক্ষা | দাঁড়িপাল্লায় একই ওজন → নৌকা আর গুলি তৈরি → দুই পানির ট্যাংকে: নৌকা ভাসে (বেশি পানি সরায়, পানির স্তর বাড়ে), গুলি ডোবে (অল্প পানি সরায়) → ↑ পানির ধাক্কা / ↓ ওজন তীর → "প্লবতা" স্ট্যাম্প |
| ০:৪৮–১:০৭ | লঞ্চ কেন ভাসে | লঞ্চের কাটা-ছবি: ভেতরে বাতাস → পানির নিচের অংশ "সরানো পানি" → লঞ্চ ততটুকু ডোবে → দাঁড়িপাল্লা: সরানো পানির ওজন = লঞ্চের ওজন → "তাই লঞ্চ ভাসে" → নিরেট পেরেক: সরানো পানি < পেরেকের ওজন, পাল্লা হেলে যায় → পেরেক ডোবে; ওপরে আর্কিমিডিসের নীতি |
| ১:০৮–১:১৪ | "লঞ্চ আসলে বিশাল রাংতার নৌকা!" | রাংতার নৌকা = লঞ্চ, "একদম ঠিক!" |
| ১:১৫–১:২১ | টিফিনের মজা | খাবার পড়তে থাকে, লাল "ওজন" তীর বড় হয়, সবুজ "প্লবতা" তীর একই থাকে → টিফিন ডোবে, "ওজন > প্লবতা" |
| ১:২১–১:৩০ | নিরাপত্তা | লঞ্চে যাত্রী আর মাল বাড়ে, লঞ্চ নিচে নামে, পানি ডেকের কাছে আসে, ওজনের মিটার লালে, "অনুমোদিত যাত্রী ধারণক্ষমতা" সাইনবোর্ড, "সীমা ছাড়ালে বিপদ!" |
| ১:৩৬–১:৪৮ | ধাঁধা | কাগজের ম্যাপ: নদী (মিঠা পানি) থেকে সাগর (লোনা পানি), লঞ্চ চলছে → "একটু উপরে উঠবে?" / "নাকি আরো ডুবে যাবে?" → "কমেন্টে লেখো!" |

ক্যাপশন: বড় বক্স ছাড়া, ছোট সাদা লেখা (কালো আউটলাইন), এক সময়ে একটা ছোট বাক্যাংশ।

## আবার রেন্ডার করতে
`engine/episode.py` (স্ক্র্যাচ ফোল্ডারের চরিত্র/ভয়েস টাইমলাইন পড়ে HTML বানায়) → `engine/capture_ep.js` (Playwright দিয়ে ফ্রেম) → ffmpeg (১২ fps → ২৪ fps, ভয়েস যোগ)।

## এখনো যা বাকি (পরের ধাপ)
- সাউন্ড ইফেক্ট (লঞ্চের ভোঁ, টুপ, ঝপাং) আর হালকা ব্যাকগ্রাউন্ড মিউজিক: এখন শুধু ভয়েস।
- চরিত্রের হাত নড়া / চোখের পলক: চরিত্রগুলো এখন এক টুকরো কাগজ (মুখের ভাব আর মুখ নড়া বদলায়)।

---

# সংস্করণ ২: রিকশা-আর্ট কাট-আউট (`pilot1_rickshaw_full.mp4`, ১:৫৬, 1080×1920, ২৪ fps)

- **হুক (০:০০–০:০৭):** স্ক্রিপ্টের মূল প্রশ্ন দিয়ে শুরু: মামার লাইন "এই লঞ্চও তো লোহার! ছোট্ট পেরেক ডোবে, এত্ত বড় লোহা ভাসবো ক্যামনে? আমরা সবাই ডুবমু!"
  দৃশ্য: লঞ্চের দিকে আঙুল তোলা মামা → পানিতে পেরেক ডুবছে → কার্ড "লোহার পেরেক ডোবে / লোহার লঞ্চ ভাসে?" আর বড় "?" → আতঙ্কিত মামার ক্লোজ-আপ।
- **চ্যানেল স্টিং (০:০৭–০:০৯):** ঘুরন্ত রিকশার চাকা, রিকশার বেলের শব্দ, তিন চরিত্র হাত নাড়ে (কোনো লেখা নেই)। তারপর মূল পর্ব (০:০৯ থেকে)।
- **হাত-মাথা নড়া:** চরিত্রের হাত আর মাথা এখন আলাদা অংশ (`engine-rickshaw/gen2.py`)। কথা বলার সময় হাত নাড়া, মামার হাত নাড়া/লঞ্চ দেখানো/মাথায় হাত, বল্টুর আঙুল তোলা ও কাঁধ ঝাঁকানো, বিথীর পরীক্ষার দিকে ইশারা, শেষে সবার হাত নাড়া।
- **লেখা:** শুধু বিজ্ঞানের ব্যাখ্যার লেখা (প্লবতা, সরানো পানি, ওজন, আর্কিমিডিসের নীতি, নিরাপত্তা সাইন ইত্যাদি)।
  সংলাপের সাবটাইটেল, টাইটেল প্লেট, "ভোঁ/টুপ" জাতীয় লেখা, "একদম ঠিক!", "ধাঁধা!", "কমেন্টে লেখো!" বাদ।
- **সাউন্ড ইফেক্ট (১০৬টা) আর মিউজিক:** সবই কোডে তৈরি (`engine-rickshaw/sound.py`), তাই লাইসেন্সের ঝামেলা নেই:
  রিকশার বেল, লঞ্চের ভোঁ, পেরেকের টুপ আর বুদবুদ, ছিটকানো পানি, রাংতা মোচড়ানো, হুশ, পপ, ✓ টুং, ✗ বাজার, পাল্লার ঠক, স্ট্যাম্প, লঞ্চের ক্যাঁচক্যাঁচ, সতর্ক বিপ, পানির কুলকুল।
  মিউজিক: ১০০ BPM লোকসুরের লুপ (একতারার মতো তার, তানপুরার মতো ড্রোন, ঢোলকের মতো তাল), কথা বলার সময় আপনা-আপনি কমে যায় (sidechain ducking)।
- **মিক্স:** −14.8 LUFS (YouTube-এর স্তরের কাছাকাছি)। যাচাই: পুরো মিক্স Whisper দিয়ে ট্রান্সক্রাইব করে দেখা হয়েছে, মিউজিক আর ইফেক্টের মধ্যেও সব সংলাপ (হুকসহ) শোনা যায়।

### v5 changes
- Story location redrawn as a detailed launch ghat (`engine-rickshaw/ghat_bg.py`): Old Dhaka skyline with mosque and water tower, three docked multi-deck launches with passengers, flags and life rings, country boats with boatmen, water hyacinth, steel pontoon with hazard edge, bollards and mooring ropes, gangway, lamp post, crows, porters and passers-by. No text in the background.
- End card: Bangla name plates over each character — মন্টু মামা, বিথী, বল্টু.

### v6 changes
- Lip-sync: each character has a mouth that follows the voice loudness frame by frame (`engine-rickshaw/mouth_env.py` -> `mouth_env.json`). Boltu's mouth now moves when he talks (before, both of his talk faces were the same).
- Calmer talking: arm, head and body gestures slowed to about a third of their old speed, and the face no longer flickers between two expressions.
- Text contrast: `engine-rickshaw/contrast_audit.js` measures every on-screen label against what is behind it. The free LLM router (`tools/freellm.py`) suggested the colour fixes: darker red/teal/green/blue, white outlines on labels over busy scenes, and dark text on Boltu's pink name plate. The "সরানো পানি" label is now drawn above the moving water block.

### v7 changes
- The schoolgirl character is renamed from টুনি (Tuni) to বিথী (Bithi) in all scripts, docs and the video's end-card name plate. The free LLM router proofread every renamed line (no problems found). No spoken line says her name, so the voice track is unchanged. Internal code keys (`tuni`) are kept.

### v8 changes
- Channel sting after the hook (0:07–0:08) now shows the Bangla name plates too: মন্টু মামা, বিথী, বল্টু.
