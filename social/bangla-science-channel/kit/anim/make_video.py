"""Render HTML animation frames in parallel and encode to video with audio using ffmpeg."""

import argparse, os, subprocess, sys

def main():
    parser = argparse.ArgumentParser(description="Render frames and encode video.")
    parser.add_argument("--html", required=True, help="Path to HTML file")
    parser.add_argument("--frames", default="e3f", help="Frames directory")
    parser.add_argument("--audio", default="mix3.wav", help="Path to audio file")
    parser.add_argument("--out", required=True, help="Output video path")
    parser.add_argument("--fps", type=int, default=24, help="Frames per second")
    parser.add_argument("--workers", type=int, default=4, help="Parallel worker processes")
    parser.add_argument("--range", dest="ranges", action="append", nargs=2, type=int, metavar=("START", "END"), help="Frame ranges to render")
    parser.add_argument("--total", type=int, help="Total frames if no range given")
    parser.add_argument("--rebuild", help="Scratchpad file to pass to episode3.py")
    args = parser.parse_args()

    if args.rebuild:
        res = subprocess.run([sys.executable, "episode3.py", args.rebuild])
        if res.returncode != 0:
            sys.exit(f"Failed to rebuild with episode3.py {args.rebuild}")

    ranges = args.ranges
    if not ranges:
        if args.total is None:
            sys.exit("Either --range or --total must be provided.")
        ranges = [[0, args.total]]

    html_path = os.path.abspath(args.html)
    procs = []
    for s_start, s_end in ranges:
        if s_start >= s_end:
            continue
        count = s_end - s_start
        w = max(1, min(args.workers, count))
        chunk_size = (count + w - 1) // w
        for i in range(w):
            c_start = s_start + i * chunk_size
            c_end = min(s_end, c_start + chunk_size)
            if c_start >= c_end:
                break
            cmd = ["node", "capture_ep.js", html_path, args.frames, str(args.fps), str(c_start), str(c_end), "1"]
            procs.append(subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL))

    for p in procs:
        if p.wait() != 0:
            sys.exit("A worker process failed during frame capture.")

    if not os.path.isdir(args.frames):
        sys.exit(f"Frames directory '{args.frames}' does not exist.")

    files = set(os.listdir(args.frames))
    max_idx = -1
    for f in files:
        if f.endswith(".jpg") and len(f) == 9 and f[:5].isdigit():
            max_idx = max(max_idx, int(f[:5]))

    if max_idx < 0:
        sys.exit("No frames found in directory.")

    missing = [i for i in range(max_idx + 1) if f"{i:05d}.jpg" not in files]
    if missing:
        sys.exit(f"Missing frame indices: {missing}")

    ff_cmd = [
        "ffmpeg", "-y", "-loglevel", "error", "-framerate", str(args.fps),
        "-i", os.path.join(args.frames, "%05d.jpg"), "-i", args.audio,
        "-c:v", "libx264", "-preset", "medium", "-crf", "21",
        "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
        "-shortest", "-movflags", "+faststart", args.out
    ]
    if subprocess.run(ff_cmd).returncode != 0:
        sys.exit("FFmpeg encoding failed.")

    size_mb = os.path.getsize(args.out) / (1024 * 1024)
    probe = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                            "-of", "default=noprint_wrappers=1:nokey=1", args.out],
                           capture_output=True, text=True)
    dur = probe.stdout.strip()
    print(f"Output: {args.out} ({size_mb:.2f} MB, {dur}s)")

if __name__ == "__main__":
    main()
