#!/usr/bin/env python3
"""
Place per-step neural TTS clips onto a silent bed using a Playwright timeline.

Usage:
  compose-synced-voiceover.py \
    --video demo.webm \
    --timeline demo-videos/.last-timeline-client-investor.json \
    --lines demo-videos/narration/client-investor-timed.json \
    --voice en-IN-NeerjaNeural \
    --rate -5% \
    --out demo-videos/out.mp4
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


def run(cmd: list[str], **kwargs) -> subprocess.CompletedProcess:
    kwargs.setdefault("check", True)
    return subprocess.run(cmd, **kwargs)


def probe_duration(path: Path) -> float:
    out = run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(path),
        ],
        capture_output=True,
        text=True,
    ).stdout.strip()
    return float(out)


def edge_tts(
    venv_edge: Path, text: str, voice: str, rate: str, dest: Path, pitch: str = "+0Hz"
) -> None:
    # edge-tts --text can be flaky with long quotes; use a temp file
    script = dest.with_suffix(".txt")
    script.write_text(text.strip() + "\n", encoding="utf-8")
    run(
        [
            str(venv_edge),
            "--voice",
            voice,
            "--rate",
            rate,
            "--pitch",
            pitch,
            "--file",
            str(script),
            "--write-media",
            str(dest),
        ],
    )


def fit_clip(src: Path, dest: Path, max_seconds: float) -> float:
    """Speed up clip slightly if longer than window; return final duration."""
    dur = probe_duration(src)
    if max_seconds <= 0.4:
        max_seconds = 0.4
    if dur <= max_seconds:
        shutil.copyfile(src, dest)
        return dur

    ratio = dur / max_seconds
    # atempo 0.5–2.0; chain if needed
    filters: list[str] = []
    r = ratio
    while r > 2.0:
        filters.append("atempo=2.0")
        r /= 2.0
    # Fit within window; allow up to ~1.55x before hard trim
    r = min(r, 1.55)
    filters.append(f"atempo={r:.4f}")
    run(
        [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            str(src),
            "-af",
            ",".join(filters),
            "-t",
            f"{max_seconds:.3f}",
            "-c:a",
            "mp3",
            "-q:a",
            "3",
            str(dest),
        ]
    )
    return min(probe_duration(dest), max_seconds)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--video", required=True)
    ap.add_argument("--timeline", required=True)
    ap.add_argument("--lines", required=True)
    ap.add_argument("--voice", default=os.environ.get("VOICE", "en-US-AvaMultilingualNeural"))
    ap.add_argument("--rate", default=os.environ.get("RATE", "-2%"))
    ap.add_argument("--pitch", default=os.environ.get("PITCH", "+0Hz"))
    ap.add_argument(
        "--lag",
        type=float,
        default=float(os.environ.get("AUDIO_LAG", "0.75")),
        help="Seconds after step start before narration (lets UI settle).",
    )
    ap.add_argument(
        "--video-offset",
        type=float,
        default=float(os.environ.get("VIDEO_OFFSET", "0.35")),
        help="Extra delay if screen still feels late vs audio.",
    )
    ap.add_argument("--edge-tts", default="")
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    video = Path(args.video).resolve()
    timeline_path = Path(args.timeline).resolve()
    lines_path = Path(args.lines).resolve()
    out = Path(args.out).resolve()
    out.parent.mkdir(parents=True, exist_ok=True)

    root = Path(__file__).resolve().parent.parent
    edge = Path(args.edge_tts) if args.edge_tts else root / ".venv-demo" / "bin" / "edge-tts"
    if not edge.exists():
        print(f"edge-tts not found at {edge}", file=sys.stderr)
        return 1

    timeline = json.loads(timeline_path.read_text(encoding="utf-8"))
    lines_doc = json.loads(lines_path.read_text(encoding="utf-8"))
    lines: dict[str, str] = lines_doc.get("lines") or lines_doc

    video_dur = probe_duration(video)
    steps = timeline.get("steps") or []
    if not steps:
        print("Timeline has no steps", file=sys.stderr)
        return 1

    work = Path(tempfile.mkdtemp(prefix="synced-vo-"))
    try:
        placed: list[tuple[float, Path]] = []
        for i, step in enumerate(steps):
            sid = step["id"]
            text = lines.get(sid)
            if not text:
                print(f"  skip (no line): {sid}")
                continue

            start = float(step["at"]) + args.lag + args.video_offset
            if i + 1 < len(steps):
                next_at = float(steps[i + 1]["at"]) + args.video_offset
            else:
                next_at = float(timeline.get("endedAt") or video_dur)
            # Leave a tiny gap before next step
            window = max(0.8, next_at - start - 0.15)
            # Don't run past video end
            window = min(window, max(0.5, video_dur - start - 0.1))

            raw = work / f"step-{i:02d}-raw.mp3"
            fitted = work / f"step-{i:02d}.mp3"
            print(f"→ TTS [{i}] @{start:.1f}s window={window:.1f}s — {sid}")
            edge_tts(edge, text, args.voice, args.rate, raw, pitch=args.pitch)
            used = fit_clip(raw, fitted, window)
            if start + used > video_dur:
                start = max(0.0, video_dur - used - 0.05)
            placed.append((start, fitted))
            print(f"   placed {used:.1f}s of audio")

        if not placed:
            print("No narration clips generated", file=sys.stderr)
            return 1

        # Build ffmpeg amix graph: silence bed + delayed clips
        # Generate each delayed stream, then amix
        inputs: list[str] = ["-f", "lavfi", "-t", f"{video_dur:.3f}", "-i", "anullsrc=r=24000:cl=mono"]
        filter_parts: list[str] = []
        mix_labels = ["[0:a]"]
        for idx, (start, clip) in enumerate(placed):
            inputs += ["-i", str(clip)]
            delay_ms = int(round(start * 1000))
            label = f"a{idx}"
            # adelay for mono; pad to full length so amix aligns
            filter_parts.append(
                f"[{idx + 1}:a]adelay={delay_ms}|{delay_ms},apad=whole_dur={video_dur:.3f}[{label}]"
            )
            mix_labels.append(f"[{label}]")

        n = len(mix_labels)
        filter_parts.append(
            f"{''.join(mix_labels)}amix=inputs={n}:duration=first:dropout_transition=0:normalize=0[aout]"
        )
        filter_complex = ";".join(filter_parts)
        audio_m4a = work / "mixed.m4a"
        run(
            [
                "ffmpeg",
                "-y",
                "-hide_banner",
                "-loglevel",
                "error",
                *inputs,
                "-filter_complex",
                filter_complex,
                "-map",
                "[aout]",
                "-c:a",
                "aac",
                "-b:a",
                "192k",
                "-t",
                f"{video_dur:.3f}",
                str(audio_m4a),
            ]
        )

        print("→ Muxing synced voiceover…")
        run(
            [
                "ffmpeg",
                "-y",
                "-hide_banner",
                "-loglevel",
                "error",
                "-i",
                str(video),
                "-i",
                str(audio_m4a),
                "-c:v",
                "libx264",
                "-preset",
                "medium",
                "-crf",
                "20",
                "-pix_fmt",
                "yuv420p",
                "-c:a",
                "aac",
                "-b:a",
                "192k",
                "-map",
                "0:v:0",
                "-map",
                "1:a:0",
                "-shortest",
                "-movflags",
                "+faststart",
                str(out),
            ]
        )
        print(f"Saved: {out}")
        print(f"Voice: {args.voice}  rate={args.rate}  pitch={args.pitch}  lag={args.lag}s  video_offset={args.video_offset}s")
        return 0
    finally:
        shutil.rmtree(work, ignore_errors=True)


if __name__ == "__main__":
    raise SystemExit(main())
