#!/usr/bin/env bash
# Place Kokoro beat WAVs onto the investor demo using the Playwright timeline.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VIDEO="${1:-}"
TIMELINE="${2:-}"
AUDIO_META="${3:-$ROOT/demo-videos/narration/investor-flow.audio.json}"
OUT_DIR="${OUT_DIR:-$ROOT/demo-videos}"
LAG="${AUDIO_LAG:-0.45}"

if [[ -z "$VIDEO" || -z "$TIMELINE" ]]; then
  echo "Usage: $0 <video.webm> <timeline.json> [audio.json]"
  exit 1
fi

VIDEO="$(cd "$(dirname "$VIDEO")" && pwd)/$(basename "$VIDEO")"
TIMELINE="$(cd "$(dirname "$TIMELINE")" && pwd)/$(basename "$TIMELINE")"

STAMP="$(date -u +%Y-%m-%dT%H-%M-%S)"
BASE_NO_EXT="$(basename "$VIDEO")"
BASE_NO_EXT="${BASE_NO_EXT%.*}"
OUT="$OUT_DIR/${BASE_NO_EXT}-flow-${STAMP}.mp4"

python3 - "$VIDEO" "$TIMELINE" "$AUDIO_META" "$OUT" "$LAG" "$ROOT" <<'PY'
import json, subprocess, sys, tempfile, shutil
from pathlib import Path

video, timeline_path, meta_path, out, lag_s, root = sys.argv[1:7]
lag = float(lag_s)
root = Path(root)
tl = json.loads(Path(timeline_path).read_text())
meta = json.loads(Path(meta_path).read_text())
beats = {b["id"]: b for b in meta["beats"]}
steps = tl.get("steps") or []

def probe(path):
    return float(subprocess.check_output([
        "ffprobe","-v","error","-show_entries","format=duration",
        "-of","default=noprint_wrappers=1:nokey=1", str(path)
    ], text=True).strip())

video_dur = probe(video)
work = Path(tempfile.mkdtemp(prefix="investor-flow-"))
try:
    placed = []
    for i, step in enumerate(steps):
        bid = step["id"]
        beat = beats.get(bid)
        if not beat:
            print(f"  skip (no audio beat): {bid}")
            continue
        wav = root / beat["wav"]
        start = float(step["at"]) + lag
        if i + 1 < len(steps):
            window = max(0.8, float(steps[i+1]["at"]) - start - 0.1)
        else:
            window = max(0.8, video_dur - start - 0.1)
        # Convert wav → mp3, trim if somehow longer than window (shouldn't be)
        clip = work / f"{i:02d}.m4a"
        dur = probe(wav)
        af = f"apad=whole_dur={min(dur, window):.3f}" if dur > window else "anull"
        # just re-encode; trim with -t if needed
        cmd = ["ffmpeg","-y","-hide_banner","-loglevel","error","-i",str(wav)]
        if dur > window:
            cmd += ["-t", f"{window:.3f}"]
        cmd += ["-c:a","aac","-b:a","192k", str(clip)]
        subprocess.run(cmd, check=True)
        used = probe(clip)
        print(f"→ @{start:.1f}s ({used:.1f}s) {bid}")
        placed.append((start, clip))

    if not placed:
        raise SystemExit("No beats placed")

    inputs = ["-f","lavfi","-t",f"{video_dur:.3f}","-i","anullsrc=r=24000:cl=mono"]
    filters = []
    labels = ["[0:a]"]
    for idx,(start,clip) in enumerate(placed):
        inputs += ["-i", str(clip)]
        ms = int(round(start*1000))
        lab = f"a{idx}"
        filters.append(f"[{idx+1}:a]adelay={ms}|{ms},apad=whole_dur={video_dur:.3f}[{lab}]")
        labels.append(f"[{lab}]")
    filters.append(f"{''.join(labels)}amix=inputs={len(labels)}:duration=first:dropout_transition=0:normalize=0[aout]")
    mixed = work / "mixed.m4a"
    subprocess.run([
        "ffmpeg","-y","-hide_banner","-loglevel","error",
        *inputs, "-filter_complex", ";".join(filters),
        "-map","[aout]","-c:a","aac","-b:a","192k","-t",f"{video_dur:.3f}", str(mixed)
    ], check=True)

    subprocess.run([
        "ffmpeg","-y","-hide_banner","-loglevel","error",
        "-i", video, "-i", str(mixed),
        "-c:v","libx264","-preset","medium","-crf","18","-pix_fmt","yuv420p",
        "-c:a","aac","-b:a","192k",
        "-map","0:v:0","-map","1:a:0","-shortest","-movflags","+faststart",
        out
    ], check=True)
    stable = Path(out).parent / "investor-demo-flow.mp4"
    shutil.copyfile(out, stable)
    print(f"Saved: {out}")
    print(f"Also:  {stable}")
finally:
    shutil.rmtree(work, ignore_errors=True)
PY

ls -lh "$OUT" "$OUT_DIR/investor-demo-flow.mp4"
