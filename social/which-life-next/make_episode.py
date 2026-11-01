"""Turn a day's narration + shot plan into Remotion props, then render.

Usage (from the day's scratch folder that holds build.py, segments.json, vo/*.mp3, shots.json):
    python3 -I make_episode.py <scratch_dir> <date> [--render] [--shorts] [--standalone-short]

--standalone-short: the scratch folder holds ONE standalone story Short (its own script, 2-4 segments,
"_teaser" with 2 flashes + question). Renders the whole thing as a vertical Short to out/short.mp4
(cold open + full story; must be <= 120 s).

shots.json maps segment id -> list of shots. Each shot is a Remotion `Shot` (see
remotion/src/Episode.tsx) plus "at": the fraction of the segment where it starts (0..1).

Cold open (every episode): shots.json may hold "_teaser":
    {"clips": [{"find": "By the next morning, the corn is gone.", "keyword": "GONE."}, ...],   # 3-4 best moments
     "question": ["COULD YOU", "SURVIVE 1874?"], "sub": "THE BIGGEST SWARM EVER RECORDED"}
Each clip finds the narration sentence that starts with "find", reuses the shot on screen at that
moment (punched in, with the keyword), and plays that sentence's audio. Then a question card with a
boom, then the story starts from the beginning. Captions and Shorts are shifted to match.
The script converts those into frame durations that line up with the narration, writes
remotion/public/episodes/<date>/episode.json, and copies narration.wav and wind.wav there.
"""
import json, os, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REMOTION = os.path.join(HERE, "remotion")
FPS = 30


def main():
    scratch, date = sys.argv[1], sys.argv[2]
    sys.path.insert(0, scratch)
    import build  # the day's copy of build.py (narration timing, wind bed, caption timing)

    out = build.OUT
    if not os.path.exists(f"{out}/timing.json"):
        build.narration()
    if not os.path.exists(f"{out}/wind.wav"):
        build.wind_bed()
    tm = json.load(open(f"{out}/timing.json"))
    plan = json.load(open(os.path.join(scratch, "shots.json")))
    events = build.captions()

    shots, total_frames = [], round(tm["total"] * FPS)
    starts = []
    for seg in build.SEGS:
        st, d = tm["starts"][seg]
        for i, sh in enumerate(plan[seg]):
            t0 = 0.0 if (seg == build.SEGS[0] and i == 0) else st + sh.get("at", 0) * d
            if sh.get("atSentence"):  # start exactly when this narration sentence starts
                key = sh["atSentence"].strip().lower()
                ev = next((e for e in events if st - 0.5 <= e[0] <= st + d + 0.5 and e[2].strip().lower().startswith(key)), None)
                if ev:
                    t0 = max(0.0, ev[0] - 0.1)
                else:
                    print("atSentence not found:", sh["atSentence"])
            starts.append((round(t0 * FPS), {k: v for k, v in sh.items() if k not in ("at", "atSentence")}))
    starts.sort(key=lambda x: x[0])
    for i, (f0, sh) in enumerate(starts):
        f1 = starts[i + 1][0] if i + 1 < len(starts) else total_frames
        sh["durationInFrames"] = max(1, f1 - f0)
        shots.append(sh)

    pub = os.path.join(REMOTION, "public", "episodes", date)
    os.makedirs(pub, exist_ok=True)
    caps = [{"start": round(a, 2), "end": round(b, 2), "text": t} for a, b, t in events]
    T = 0.0
    if plan.get("_teaser"):
        tshots, tcaps, T = teaser(plan["_teaser"], events, starts, shots, out, plan)
        shots = tshots + shots
        caps = tcaps + [{"start": round(c["start"] + T, 2), "end": round(c["end"] + T, 2), "text": c["text"]} for c in caps]
        shutil.copy(f"{out}/narration_full.wav", f"{pub}/narration.wav")
    else:
        shutil.copy(f"{out}/narration.wav", f"{pub}/narration.wav")
    shutil.copy(f"{out}/wind.wav", f"{pub}/wind.wav")
    props = {
        "shots": shots,
        "captions": caps,
        "narration": f"episodes/{date}/narration.wav",
        "wind": f"episodes/{date}/wind.wav",
    }
    json.dump(props, open(f"{pub}/episode.json", "w"), indent=1)
    print("shots", len(shots), "frames", sum(s["durationInFrames"] for s in shots), "of", total_frames)

    if "--standalone-short" in sys.argv:
        total = sum(sh["durationInFrames"] for sh in shots)
        if total > 120 * FPS:
            print(f"WARNING: standalone Short is {total / FPS:.1f}s (> 120 s) — trim the script")
        tz = plan.get("_teaser", {})
        tq = sum(sh["durationInFrames"] for sh in shots[:len(tz.get("clips", [])) + 1]) if tz else 0
        sp = dict(props, startFrame=0, durationInFrames=total, hook=[], title=plan.get("_title", tz.get("question", [])), titleFrom=tq)
        path = f"{pub}/short.json"
        json.dump(sp, open(path, "w"))
        render("Short", path, f"{out}/short.mp4")
    if "--render" in sys.argv:
        render("Episode", f"{pub}/episode.json", f"{out}/long_remotion.mp4")
    if "--shorts" in sys.argv:
        for n, short in enumerate(json.load(open(os.path.join(scratch, "shorts.json"))), 1):
            seg = short["segment"]
            st, d = tm["starts"][seg]
            sp = dict(props, startFrame=round((st + T - 0.15) * FPS), durationInFrames=round((d + 0.5) * FPS), hook=short["hook"])
            path = f"{pub}/short-{n}.json"
            json.dump(sp, open(path, "w"))
            render("Short", path, f"{out}/short-{n}.mp4")


def teaser(cfg, events, starts, main_shots, out, plan=None):
    """Build the cold-open montage + question card and narration_full.wav (teaser audio + narration)."""
    clips, tshots, tcaps, t = [], [], [], 0.0
    for c in cfg["clips"]:
        key = c["find"].strip().lower()
        ev = next((e for e in events if e[2].strip().lower().startswith(key) or key in e[2].strip().lower()), None)
        if not ev:
            print("teaser: sentence not found:", c["find"]); continue
        a, b, text = ev
        b = min(b, a + 4.0)
        f0 = round(a * FPS)
        idx = max(i for i, (sf, _) in enumerate(starts) if sf <= f0)
        if c.get("seg") and c.get("shot") is not None:  # explicit shot for this flash
            want = plan[c["seg"]][c["shot"]]
            want_keys = {k: v for k, v in want.items() if k not in ("at", "atSentence")}
            idx = next((i for i, (_, s0) in enumerate(starts) if {k: v for k, v in s0.items() if k != "durationInFrames"} == want_keys), idx)
        # use the scene on screen; if that is a title card/board, the nearest real scene after (then before) it
        order = list(range(idx, len(starts))) + list(range(idx - 1, -1, -1))
        src = next((starts[j][1] for j in order if starts[j][1].get("kind") not in ("card", "board")), None)
        if src is None:
            continue
        sh = {k: v for k, v in src.items() if k not in ("timer", "keyword", "keywordAt", "durationInFrames")}
        d = (b - a) + 0.25
        cam = {"zoom": [1.3, 1.5]}
        k = sh.get("kit")
        if k and k.get("walkTo") is not None:  # freeze Kit where he is at that moment of the story
            sf = next(sf for sf, s0 in starts if s0 is src)
            sd = src.get("durationInFrames") or 1
            frac = min(1.0, max(0.0, (f0 - sf) / sd))
            k = dict(k, x=k["x"] + (k["walkTo"] - k["x"]) * frac)
            k.pop("walkTo")
            sh["kit"] = k
        if k and c.get("wide"):  # keep the threat in frame
            k = None
        if k:  # punch in on Kit's face
            z, sc = 1.9, k.get("scale", 1)
            kx, ky = k.get("x", 960), k.get("y", 940) - 300 * sc
            tx = max(-(z - 1) * 960, min((z - 1) * 960, z * (960 - kx)))
            ty = max(-(z - 1) * 540, min((z - 1) * 540, z * (540 - ky)))
            cam = {"zoom": [1.8, 2.0], "pan": [tx, tx], "panY": [ty, ty]}
            if c.get("expression"):
                sh["kit"] = dict(k, expression=c["expression"])
        sh.update(durationInFrames=round(d * FPS), cuts=False, camera=cam)
        if c.get("keyword"):
            sh.update(keyword=c["keyword"], keywordAt=0.05)
        clips.append((a - 0.05, b + 0.2, t))
        tshots.append(sh)
        tcaps.append({"start": round(t, 2), "end": round(t + d, 2), "text": c.get("caption", c["find"])})
        t += d
    q_dur = 2.6
    bg = {k: v for k, v in main_shots[0].items() if k not in ("durationInFrames", "kind", "card", "keyword", "timer")}
    tshots.append({"kind": "card", "durationInFrames": round(q_dur * FPS), "cuts": False,
                   "card": {"title": cfg["question"], "subtitle": cfg.get("sub"), "style": "hook", "background": bg}})
    qt, t = t, t + q_dur + 0.3
    tshots[-1]["durationInFrames"] = round((q_dur + 0.3) * FPS)
    # audio: narration slices + whoosh per clip + boom on the question
    nar = f"{out}/narration.wav"
    ins, filt, labels = [], [], []
    for i, (a, b, at) in enumerate(clips):
        ins += ["-i", nar]
        filt.append(f"[{i}:a]atrim={max(0,a)}:{b},asetpts=PTS-STARTPTS,aresample=44100,aformat=channel_layouts=mono,adelay={int(at*1000)}[v{i}]")
        labels.append(f"[v{i}]")
    n = len(clips)
    for i, (_, _, at) in enumerate(clips):
        ins += ["-f", "lavfi", "-t", "0.45", "-i", "anoisesrc=c=pink:a=0.35:r=44100"]
        filt.append(f"[{n+i}:a]highpass=f=900,afade=t=in:d=0.3,afade=t=out:st=0.3:d=0.15,aformat=channel_layouts=mono,adelay={max(0,int(at*1000)-250)}[w{i}]")
        labels.append(f"[w{i}]")
    ins += ["-f", "lavfi", "-t", "1.6", "-i", "sine=f=48:r=44100"]
    filt.append(f"[{2*n}:a]volume=1.6,afade=t=out:st=0.05:d=1.5,aformat=channel_layouts=mono,adelay={int(qt*1000)}[boom]")
    labels.append("[boom]")
    filt.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0,apad=whole_dur={t},atrim=0:{t}[tz]")
    subprocess.run(["ffmpeg", "-y", "-v", "error", *ins, "-filter_complex", ";".join(filt), "-map", "[tz]", "-ac", "1", "-ar", "44100", f"{out}/teaser.wav"], check=True)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", f"{out}/teaser.wav", "-i", nar, "-filter_complex",
                    "[0:a]aformat=channel_layouts=mono,aresample=44100[a];[1:a]aformat=channel_layouts=mono,aresample=44100[b];[a][b]concat=n=2:v=0:a=1[o]",
                    "-map", "[o]", "-c:a", "pcm_s16le", f"{out}/narration_full.wav"], check=True)
    print(f"teaser: {len(clips)} clips + question, {t:.1f}s")
    return tshots, tcaps, t


def render(comp, props, dest):
    cmd = ["npx", "remotion", "render", comp, dest, f"--props={props}", "--concurrency=4", "--log=error"]
    subprocess.run(cmd, cwd=REMOTION, check=True)
    print("rendered", dest)


if __name__ == "__main__":
    main()
