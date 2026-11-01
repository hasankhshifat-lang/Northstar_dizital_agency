# GeoGlobeTales breakdown (2026-11-01)

What the channel does, studied frame by frame, and what we copy for our own channel. We copy techniques, not their videos.

**Channel:** @geoglobetales. Animated map history and geography Shorts.
- TikTok: 2.07M followers.
- YouTube: their Shorts get 0.8M–18M views each.
- Best video: "How America Bought Louisiana 🇺🇸🤯 Napoleon's $15M Deal 🇫🇷", 18.0M YouTube views and 2.4M TikTok plays.
- Other US topics: "Why Broadway Splits Manhattan" (4.1M), "Why Virginia Split Into Two States" (3.6M).

**What was studied:** the Louisiana video, 1080×1920 at 30 fps, 100.9 s. It was taken from their TikTok, because YouTube blocks downloads from our server.
- Frames sampled 1 per second (101 frames), plus 8 fps strips over the transitions.
- Whisper transcript.
- ffmpeg scene-cut detection.
- Audio spectrogram.

## 1. Camera: one continuous move, no hard cuts
- **Scene-cut detection found 0 hard cuts in 100 s.** The whole video is one camera flying over one map.
- A new place is reached by **panning or zooming the camera there**: US → Atlantic → France → Europe → North America → Caribbean → Haiti → Mississippi → New Orleans.
- The camera never stops. Even "still" moments have a slow drift or push-in.
- **Whip pans with motion blur** link distant places (12 s, 40 s).
- **Zoom-through:** the camera dives into the map and lands in a ground-level scene, such as a plantation at 40–42 s or a beach at 54 s. Then it pulls back out to the map.
- **Rewind** (11.4–12.8 s): ◀◀◀ chevrons, the earlier shots run backwards with blur, and the audio drops to silence. Then a big "1802" appears. This is the "let's start from the beginning" reset after the cold open.

## 2. The map look
- **Vintage map:** parchment land with relief texture, teal sea with paper grain, faint coastline detail.
- Later the map switches to a **satellite-style** look (Caribbean, Haiti) for variety.
- **Political areas** are flat, saturated fills with a thick dark outline: Britain red, France blue, USA teal, Spain orange. Names sit inside in a light **serif** font.
- **Callouts:**
  - big white bold sans with a black stroke, with a yellow sub-label, e.g. "Saint-Domingue (Haiti)"
  - hand-drawn yellow ellipses
  - fat white arrows
  - "Louisiana" in yellow serif with an arrow
- **Things that move on the map:**
  - territories pop or slide in
  - a river glows electric blue as the camera follows it
  - crates float down the Mississippi
  - ships sail along routes with a little wake
  - a flag is planted with a bounce
  - a FOR SALE sign flips to SOLD
- **Numbers become objects:**
  - money stacks
  - a "$10M" tag on a suitcase
  - "$15M"
  - "4¢ / acre" with a coin

## 3. Characters
- **Chibi bobbleheads** of the real people: big head, tiny body. They stand directly on the map, on their own country.
- They **pop in** with a scale overshoot, slide in, bob while idle, and turn to each other.
- **Big reaction faces**, e.g. a jaw-drop on "for the same price".
- **Thought bubbles** with a mini-map inside, used for "grand plans".
- Group moments: soldiers march, then fall over one by one for "yellow fever wiped out the army".
- A painted portrait cut-out (Napoleon) peeks in from the edge for one beat.

## 4. Text
- **Small subtitles, 1–4 words per chunk,** white with a soft shadow, around 70% down the frame. They change every 0.5–1 s with the voice.
- **Big date "cards"** ("1802", "1803") are just large white serif text on the map, with no box.
- Labels **live on the map** (country names, arrows). There are no separate title cards at all.

## 5. Pacing
- **Something new appears about every second**: a pop, an arrow, a character, a label.
- No dead air: 0 seconds of empty screen.
- **Hook = the payoff, said first:** "sent diplomats to buy one city… ended up buying the entire Louisiana Territory for almost the same price." Then the rewind and "let's start from the beginning".
- **End = one hard number:** "almost doubling the size of the US in a single day for just four cents an acre."

## 6. Sound (from the spectrogram)
- **A continuous music bed** runs under everything: low end at 20–340 Hz the whole time, plus light tonal melody lines.
- **Dense, short sound effects, roughly 2–4 per second,** each tied to something on screen. Pops when elements appear, whooshes on camera moves, clicks and tings on labels.
- **One deliberate silence** of about 0.4 s at the rewind (11.2–11.6 s). It works as an attention reset.

## What we do on Which Life Next (rules from now on)
1. **Native 1080×1920 map scenes with one continuous camera.** Fly between real places instead of cutting.
2. **Our map style:** a parchment and teal vintage map from real data (d3-geo with us-atlas/world-atlas). Flat colour fills with thick outlines for the places that matter.
3. **Kit as the chibi hero on the map:** pop-in with overshoot, reactions, riding or walking along real routes.
4. **Every number becomes an object or a counter.** Every place gets a pin, label and arrow.
5. **A sound effect on every visual event**, plus a light music bed, plus one silence beat before the twist.
6. **Hook = payoff first, then rewind (◀◀ plus a whoosh), then a big date.**
7. **No-voiceover Shorts:** the story is told in 1–5-word on-screen lines plus sound effects (the mute test taken to the limit).

First test of this format: `episodes/2026-11-01/pony-express/` (no voiceover, sound effects only).
