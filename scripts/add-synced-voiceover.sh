#!/usr/bin/env bash
# Synced AI voiceover: per-step Neerja (or other) TTS placed from a Playwright timeline.
#
# Usage:
#   ./scripts/add-synced-voiceover.sh \
#     demo-videos/client-investor-demo-....webm \
#     demo-videos/.last-timeline-client-investor.json \
#     demo-videos/narration/client-investor-timed.json
#
# Env:
#   VOICE=en-US-AvaMultilingualNeural RATE=-2% PITCH=+0Hz AUDIO_LAG=0.7 VIDEO_OFFSET=0.35
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VIDEO="${1:-}"
TIMELINE="${2:-}"
LINES="${3:-}"
VOICE="${VOICE:-en-US-AvaMultilingualNeural}"
RATE="${RATE:--2%}"
PITCH="${PITCH:-+0Hz}"
OUT_DIR="${OUT_DIR:-$ROOT/demo-videos}"
VENV="$ROOT/.venv-demo"

if [[ -z "$VIDEO" || -z "$TIMELINE" || -z "$LINES" ]]; then
  echo "Usage: $0 <video.webm|mp4> <timeline.json> <timed-lines.json>"
  exit 1
fi

VIDEO="$(cd "$(dirname "$VIDEO")" && pwd)/$(basename "$VIDEO")"
TIMELINE="$(cd "$(dirname "$TIMELINE")" && pwd)/$(basename "$TIMELINE")"
LINES="$(cd "$(dirname "$LINES")" && pwd)/$(basename "$LINES")"

if [[ ! -x "$VENV/bin/edge-tts" ]]; then
  echo "Setting up edge-tts venv…"
  python3 -m venv "$VENV"
  "$VENV/bin/pip" install -q edge-tts
fi

STAMP="$(date -u +%Y-%m-%dT%H-%M-%S)"
BASE="$(basename "$VIDEO")"
BASE_NO_EXT="${BASE%.*}"
OUT="$OUT_DIR/${BASE_NO_EXT}-voiced-synced-${STAMP}.mp4"

export VOICE RATE PITCH
python3 "$ROOT/scripts/compose-synced-voiceover.py" \
  --video "$VIDEO" \
  --timeline "$TIMELINE" \
  --lines "$LINES" \
  --voice "$VOICE" \
  --rate "$RATE" \
  --pitch "$PITCH" \
  --lag "${AUDIO_LAG:-0.7}" \
  --video-offset "${VIDEO_OFFSET:-0.35}" \
  --edge-tts "$VENV/bin/edge-tts" \
  --out "$OUT"

ls -lh "$OUT"
