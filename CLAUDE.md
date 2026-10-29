# CLAUDE.md

## YouTube channels

There are two channels. Pick the profile by channel and read it before writing:

- **North Star Digital AI Agency** (parlor / small-business owners) - `.claude/youtube/voice.md`.
- **POV American History** (US audience, "POV: You..." animated history) -
  `.claude/youtube/voice-pov.md`. When a skill says to read `voice.md`, read this file instead
  for this channel. Scripts live in `.claude/youtube/pov/`.

Scripts, hooks, titles, descriptions, Shorts, comment replies and voiceovers all follow the
matching profile.

- **Voiceover:** every video uses the ElevenLabs voice "Mike - 2D & 3D POV/Storytime"
  (voice_id `zfc8CJQpe8Kqyl0vvCzo`, speed 1.10, stability 50%, similarity boost 75%). Do not
  choose a different voice unless the user asks for one on that video.
- **Script style:** the voice, audience and claim rules in the channel's profile apply to every
  script.
- The `yt-*` skills in `.claude/skills/` are the tools for this work.
