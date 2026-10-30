"""Turn a day's narration + shot plan into Remotion props, then render.

Usage (from the day's scratch folder that holds build.py, segments.json, vo/*.mp3, shots.json):
    python3 -I make_episode.py <scratch_dir> <date> [--render] [--shorts]

shots.json maps segment id -> list of shots. Each shot is a Remotion `Shot` (see
remotion/src/Episode.tsx) plus "at": the fraction of the segment where it starts (0..1).
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
            starts.append((round(t0 * FPS), {k: v for k, v in sh.items() if k != "at"}))
    for i, (f0, sh) in enumerate(starts):
        f1 = starts[i + 1][0] if i + 1 < len(starts) else total_frames
        sh["durationInFrames"] = max(1, f1 - f0)
        shots.append(sh)

    pub = os.path.join(REMOTION, "public", "episodes", date)
    os.makedirs(pub, exist_ok=True)
    shutil.copy(f"{out}/narration.wav", f"{pub}/narration.wav")
    shutil.copy(f"{out}/wind.wav", f"{pub}/wind.wav")
    props = {
        "shots": shots,
        "captions": [{"start": round(a, 2), "end": round(b, 2), "text": t} for a, b, t in events],
        "narration": f"episodes/{date}/narration.wav",
        "wind": f"episodes/{date}/wind.wav",
    }
    json.dump(props, open(f"{pub}/episode.json", "w"), indent=1)
    print("shots", len(shots), "frames", sum(s["durationInFrames"] for s in shots), "of", total_frames)

    if "--render" in sys.argv:
        render("Episode", f"{pub}/episode.json", f"{out}/long_remotion.mp4")
    if "--shorts" in sys.argv:
        for n, short in enumerate(json.load(open(os.path.join(scratch, "shorts.json"))), 1):
            seg = short["segment"]
            st, d = tm["starts"][seg]
            sp = dict(props, startFrame=round((st - 0.15) * FPS), durationInFrames=round((d + 0.5) * FPS), hook=short["hook"])
            path = f"{pub}/short-{n}.json"
            json.dump(sp, open(path, "w"))
            render("Short", path, f"{out}/short-{n}.mp4")


def render(comp, props, dest):
    cmd = ["npx", "remotion", "render", comp, dest, f"--props={props}", "--concurrency=4", "--log=error"]
    subprocess.run(cmd, cwd=REMOTION, check=True)
    print("rendered", dest)


if __name__ == "__main__":
    main()
