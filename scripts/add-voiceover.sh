#!/usr/bin/env bash
# Add AI (edge-tts neural) voiceover to a demo video.
#
# Usage:
#   ./scripts/add-voiceover.sh demo-videos/client-investor-demo-....webm demo-videos/narration/client-investor-script.txt
#   VOICE=en-IN-NeerjaNeural RATE=-5% ./scripts/add-voiceover.sh ...
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VIDEO="${1:-}"
SCRIPT="${2:-}"
VOICE="${VOICE:-en-US-JennyNeural}"
RATE="${RATE:--5%}"
OUT_DIR="${OUT_DIR:-$ROOT/demo-videos}"
VENV="$ROOT/.venv-demo"

if [[ -z "$VIDEO" || -z "$SCRIPT" ]]; then
  echo "Usage: $0 <video.webm|mp4> <script.txt>"
  exit 1
fi

VIDEO="$(cd "$(dirname "$VIDEO")" && pwd)/$(basename "$VIDEO")"
SCRIPT="$(cd "$(dirname "$SCRIPT")" && pwd)/$(basename "$SCRIPT")"

if [[ ! -f "$VIDEO" ]]; then
  echo "Video not found: $VIDEO"
  exit 1
fi
if [[ ! -f "$SCRIPT" ]]; then
  echo "Script not found: $SCRIPT"
  exit 1
fi

if [[ ! -x "$VENV/bin/edge-tts" ]]; then
  echo "Setting up edge-tts venv…"
  python3 -m venv "$VENV"
  "$VENV/bin/pip" install -q edge-tts
fi

command -v ffmpeg >/dev/null
command -v ffprobe >/dev/null

STAMP="$(date -u +%Y-%m-%dT%H-%M-%S)"
BASE="$(basename "$VIDEO")"
BASE_NO_EXT="${BASE%.*}"
WORK="$OUT_DIR/.voiceover-work"
mkdir -p "$WORK" "$OUT_DIR"

AUDIO_RAW="$WORK/${BASE_NO_EXT}-narration-raw.mp3"
AUDIO_FIT="$WORK/${BASE_NO_EXT}-narration-fit.m4a"
OUT="$OUT_DIR/${BASE_NO_EXT}-voiced-${STAMP}.mp4"

echo "→ Generating neural voice ($VOICE, rate $RATE)…"
"$VENV/bin/edge-tts" \
  --voice "$VOICE" \
  --rate "$RATE" \
  --file "$SCRIPT" \
  --write-media "$AUDIO_RAW"

VIDEO_DUR="$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$VIDEO")"
AUDIO_DUR="$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$AUDIO_RAW")"

echo "  video: ${VIDEO_DUR}s"
echo "  audio: ${AUDIO_DUR}s"

# Fit narration to video length:
# - if audio shorter: pad with silence
# - if audio longer: slight speed-up (cap ~1.25x), then trim/pad
python3 - "$VIDEO_DUR" "$AUDIO_DUR" <<'PY' > "$WORK/fit-filter.txt"
import sys
v = float(sys.argv[1])
a = float(sys.argv[2])
if a <= 0:
    raise SystemExit('invalid audio duration')
if a <= v:
    # pad end
    pad = v - a
    print(f'apad=pad_dur={pad:.3f}')
else:
    ratio = a / v
    # atempo accepts 0.5–2.0; chain if needed
    filters = []
    r = ratio
    while r > 2.0:
        filters.append('atempo=2.0')
        r /= 2.0
    while r < 0.5:
        filters.append('atempo=0.5')
        r /= 0.5
    filters.append(f'atempo={r:.4f}')
    # tiny pad to avoid rounding underflow
    print(','.join(filters) + f',apad=whole_dur={v:.3f}')
PY

FILTER="$(cat "$WORK/fit-filter.txt")"
echo "→ Fitting audio ($FILTER)…"
ffmpeg -y -hide_banner -loglevel error \
  -i "$AUDIO_RAW" \
  -af "$FILTER" \
  -t "$VIDEO_DUR" \
  -c:a aac -b:a 192k \
  "$AUDIO_FIT"

echo "→ Muxing voiceover into video…"
ffmpeg -y -hide_banner -loglevel error \
  -i "$VIDEO" \
  -i "$AUDIO_FIT" \
  -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p \
  -c:a aac -b:a 192k \
  -map 0:v:0 -map 1:a:0 \
  -shortest \
  -movflags +faststart \
  "$OUT"

echo
echo "Saved: $OUT"
echo "Voice: $VOICE"
ls -lh "$OUT"
