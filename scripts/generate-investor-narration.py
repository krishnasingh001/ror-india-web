#!/usr/bin/env python3
"""
Generate Kokoro narration beats for the investor demo.

Writes:
  demo-videos/narration/investor-flow.audio.json
  demo-videos/narration/beats/NN-id.wav
  demo-videos/narration/investor-flow.m4a  (preview concat)
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--flow", default="demo-videos/narration/investor-flow.json")
    ap.add_argument("--out-dir", default="demo-videos/narration")
    ap.add_argument("--voice", default="")
    ap.add_argument("--speed", type=float, default=0.0)
    args = ap.parse_args()

    root = Path(__file__).resolve().parent.parent
    flow_path = Path(args.flow)
    if not flow_path.is_absolute():
        flow_path = root / flow_path
    out_dir = Path(args.out_dir)
    if not out_dir.is_absolute():
        out_dir = root / out_dir
    beats_dir = out_dir / "beats"
    beats_dir.mkdir(parents=True, exist_ok=True)

    flow = json.loads(flow_path.read_text(encoding="utf-8"))
    voice = args.voice or flow.get("voice") or "af_heart"
    speed = args.speed or float(flow.get("speed") or 0.95)
    gap_ms = int(flow.get("gapMs") or 320)
    sr = 24000

    print(f"→ Kokoro voice={voice} speed={speed}", flush=True)
    from kokoro import KPipeline

    pipeline = KPipeline(lang_code="a")
    pieces: list[np.ndarray] = []
    beats_out = []
    gap = np.zeros(int(sr * gap_ms / 1000), dtype=np.float32)
    cursor = 0.0

    for i, beat in enumerate(flow["beats"]):
        text = beat["text"].strip()
        chunks: list[np.ndarray] = []
        for _gs, _ps, audio in pipeline(text, voice=voice, speed=speed, split_pattern=r"\n+"):
            chunks.append(np.asarray(audio, dtype=np.float32))
        if not chunks:
            raise SystemExit(f"No audio for beat {beat['id']}")
        clip = np.concatenate(chunks)
        dur = len(clip) / sr
        wav_name = f"{i:02d}-{beat['id']}.wav"
        wav_path = beats_dir / wav_name
        sf.write(wav_path, clip, sr)
        beats_out.append(
            {
                "id": beat["id"],
                "text": text,
                "start": round(cursor, 3),
                "duration": round(dur, 3),
                "durationMs": int(round(dur * 1000)),
                "wav": str(wav_path.relative_to(root)),
            }
        )
        print(f"  [{i}] {beat['id']}: {dur:.2f}s → {wav_name}", flush=True)
        pieces.append(clip)
        pieces.append(gap)
        cursor += dur + gap_ms / 1000.0

    if pieces:
        pieces = pieces[:-1]
        cursor -= gap_ms / 1000.0

    full = np.concatenate(pieces)
    wav = out_dir / "investor-flow.wav"
    m4a = out_dir / "investor-flow.m4a"
    meta = out_dir / "investor-flow.audio.json"
    sf.write(wav, full, sr)
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            str(wav),
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            str(m4a),
        ],
        check=True,
    )

    payload = {
        "engine": "kokoro",
        "voice": voice,
        "speed": speed,
        "sampleRate": sr,
        "gapMs": gap_ms,
        "totalDuration": round(len(full) / sr, 3),
        "m4a": str(m4a.relative_to(root)),
        "beats": beats_out,
    }
    meta.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"Saved: {m4a}")
    print(f"Meta:  {meta}")
    print(f"Total narration: {payload['totalDuration']}s")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
