---
name: vibevoice-voiceover
description: Make English voiceovers and narration with Microsoft VibeVoice (open-source, runs on CPU, no per-character cost). Use for EVERY English voiceover - YouTube long-form and Shorts, Facebook videos/Reels, ads, explainers, lemo-opuscar films - in chat and in scheduled tasks. Not for Bangla (Bangla uses ElevenLabs).
---

# VibeVoice English voiceover

Owner rule (2026-11-15): **every English voiceover is made with VibeVoice**, everywhere, in chat and in
every scheduled task. Don't use ElevenLabs, Gemini TTS, OpenAI TTS, Kokoro (lemo-opuscar's built-in voice)
or any other TTS for English narration. **Bangla voiceovers stay on ElevenLabs** (`eleven_v4`): VibeVoice
can't speak Bangla (tested 2026-11-15, the output was gibberish).

Model: `microsoft/VibeVoice-Realtime-0.5B` (github.com/microsoft/VibeVoice). It runs on CPU at about half
real time: a 55 s Short takes about 2 minutes to make. The long-form multi-speaker VibeVoice-TTS model is
not available (Microsoft removed its code), so there is one speaker per call.

## Install

The Default cloud environment's setup script installs it at session start (`/opt/VibeVoice`, venv
`/opt/vibevoice-env`). If it's missing (other environment, failed setup), run:

```bash
bash .claude/skills/vibevoice-voiceover/scripts/install.sh
```

The first generation in each session downloads the model from Hugging Face (about 10–20 s).

## Make a voiceover

```bash
bash .claude/skills/vibevoice-voiceover/scripts/voiceover.sh script.txt narration.wav Frank
```

- Output `.wav` (44.1 kHz) or `.mp3` (192k) by the extension. It prints the duration.
- **Voices** (English): Frank (default, recommended: clean, steady narrator), Carter, Davis, Mike (male);
  Emma, Grace (female). `Samuel` is Indian English. Keep the same voice across a channel's videos;
  Which Life Next uses **Frank**.
- Write the whole script in one call for consistent delivery. It is free, so regenerate the whole take
  if something is off.

## Writing for VibeVoice

- **No audio tags.** `[tense]`, `[whispers]` and similar are ElevenLabs features; the wrapper strips them.
  Shape delivery with punctuation: `...` for a pause, short sentences for tension, a question mark for lift.
- **Write numbers as words** ("seventeen eighteen", "five gunshots"), and spell out abbreviations.
- English only. Other languages produce unpredictable audio.

## Check every take (required)

1. Duration with ffprobe against the target (Shorts 45–60 s).
2. Transcribe it (faster-whisper locally, or Groq Whisper `whisper-large-v3` at api.groq.com) and compare
   word by word with the script. Sound-alikes like "Cruz"/"crews" are the transcriber's error; missing,
   repeated or extra words are the voice's error: regenerate.
3. Check the first second: a take once started with a stray sound heard as "But". Regenerate if the
   transcript starts with a word that isn't in the script. Leading silence (about 0.6 s) is normal;
   trim it with ffmpeg if the hook must start on frame 0.
4. Listen for robotic artefacts or clipped endings in the last second.

## Disclosure

The audio is still AI-generated: keep "Narration voiced with AI." in descriptions and captions, and
declare synthetic media on YouTube uploads as before.
