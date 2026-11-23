# "Night Match Toon": Foot All FC's own animation style (2026-11-23)

Made because the owner asked to move away from the lemo-opuscar templates (the paper-puppet "Comic History Cartoon"). It is our own
design and code; only the lemo-opuscar **renderer** (`core/render/*.mjs`: frame capture, mux to -14 LUFS, readcheck) and its maths and audio
helpers (`core/lib.js`, `core/audio/sfx.py`) are reused, so the build stays one command.

| | Comic History Cartoon (old) | Night Match Toon (new) |
|---|---|---|
| Frame | a printed comic page: scoreboard panel, action panel, caption band | full-bleed 9:16 scene; graphics float over it |
| Space | flat side-on panels | 2.5D: a perspective camera over a real-scale pitch (goal 7.32 × 2.44 m, spot at 11 m); dolly, crane, tilt, long-lens and reverse angles |
| Characters | AI-drawn paper part sheets on split pins, posed on twos | flat vector toons drawn in code: cel shading, thick ink outline, 1970s mop / short / curly hair, eyes that look at the ball, brows + mouth expressions; smooth 24 fps motion, run cycles, dives with lift and rotation |
| Light | paper texture | night stadium: gradient sky, stars, crowd bowl with camera flashes, floodlight towers with light cones, haze, light pools on the grass; daylight palette for flashbacks |
| Graphics | paper slips, ink rings, rubber stamps | broadcast-style scorebug + live shoot-out tracker, slide-in name tags, kinetic pop text (Lilita One), word-by-word karaoke captions (Inter ExtraBold) lit by the voice's own timings |
| Effects | whip pans, freeze frames | slow-motion ramps with bars, impact flash + speed rays, ball motion trail, net that bulges where the ball hits, confetti |
| Sound | sampled brass band | original synthesized score (drums, bass, pads; heartbeat under slow motion, drop on the goal, soft keys for flashbacks) + synthesized stadium foley |

Safe areas: action in the top ~1180 px, captions at ~1290–1420, the bottom ~400 px left to the gradient (YouTube UI). Brand "FOOT ALL FC" top-left.
Rules unchanged: no real likenesses, crests, sponsors, league marks or footage; generic kits; players named by on-screen tags (or numbers when verified).
To make the next film: copy `videos/panenka-1976-short/`, keep the engine part of `index.html` (camera, stadium, pitch, goal, player, ball, graphics),
replace the timeline (`T`, `CAPS`), the scene functions and the sound cues.
