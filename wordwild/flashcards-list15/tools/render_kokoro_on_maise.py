#!/usr/bin/env python3
"""Render Professor Potato List 15 narration with Maise Audio Foundry's Kokoro runtime.

No cloud calls. Run from the public WordWild checkout using Maise's installed Kokoro:
  /srv/audio-foundry/venvs/kokoro/bin/python tools/render_kokoro_on_maise.py

Produces 60 MP3s and one manifest under assets/audio/, after probing each file.
No audio is published until you commit the reviewed MP3s and manifest.
"""
from __future__ import annotations

import argparse
import array
import hashlib
import json
import math
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile

HERE = Path(__file__).resolve().parents[1]
AUDIO_DIR = HERE / "assets" / "audio"
VOICE = "af_heart"
RATE = 24000

def read_words() -> list[dict]:
    node = shutil.which("node")
    if not node:
        raise SystemExit("Node.js is required to read the exact List 15 word data.")
    cmd = [node, "--input-type=module", "-e",
           'import { WORDS } from "./words.js"; console.log(JSON.stringify(WORDS));']
    items = json.loads(subprocess.check_output(cmd, cwd=HERE, text=True))
    if len(items) != 20 or len({w["word"] for w in items}) != 20:
        raise SystemExit("Expected 20 distinct List 15 words")
    return items

def filename(word: str, kind: str) -> str:
    stem = re.sub(r"[^a-z0-9]", "", word.lower())
    return stem + ("_slow" if kind == "slow" else "_sentence" if kind == "sentence" else "") + ".mp3"

def duration_seconds(mp3: Path) -> float:
    cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration",
           "-of", "default=noprint_wrappers=1:nokey=1", str(mp3)]
    seconds = float(subprocess.check_output(cmd, text=True).strip())
    if not math.isfinite(seconds) or not 0.25 < seconds < 90:
        raise ValueError(f"Bad or silent-duration MP3: {mp3}: {seconds}")
    decoded = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(mp3),
                                        "-f", "f32le", "-ac", "1", "-ar", str(RATE), "pipe:1"])
    arr = array.array("f")
    arr.frombytes(decoded)
    if not arr:
        raise ValueError(f"No audio samples: {mp3}")
    if any(not math.isfinite(v) for v in arr):
        raise ValueError(f"Non-finite audio samples: {mp3}")
    rms = math.sqrt(sum(v * v for v in arr) / len(arr))
    if rms < 0.0001:
        raise ValueError(f"Silent or near-silent MP3: {mp3}")
    return round(seconds, 2)

def convert_to_mp3(samples, sample_rate: int, mp3: Path) -> float:
    import soundfile as sf
    with tempfile.TemporaryDirectory(prefix="wordwild-kokoro-") as td:
        wav = Path(td) / "render.wav"
        encoded = Path(td) / "render.mp3"
        sf.write(wav, samples, sample_rate, subtype="PCM_16")
        subprocess.run(["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y",
                        "-i", str(wav), "-af",
                        "silenceremove=start_periods=1:start_threshold=-45dB,"
                        "areverse,silenceremove=start_periods=1:start_threshold=-45dB,"
                        "areverse,loudnorm=I=-18:LRA=7:TP=-2",
                        "-ar", str(RATE), "-ac", "1", "-codec:a", "libmp3lame",
                        "-b:a", "64k", str(encoded)], check=True)
        duration = duration_seconds(encoded)
        mp3.parent.mkdir(parents=True, exist_ok=True)
        os.replace(encoded, mp3)
    return duration

def render_text(pipeline, text: str, speed: float):
    import numpy as np
    parts = []
    for result in pipeline(text, voice=VOICE, speed=speed):
        if result.audio is not None:
            parts.append(result.audio.detach().cpu().numpy().astype(np.float32).reshape(-1))
    if not parts:
        raise RuntimeError(f"Kokoro produced no audio for {text!r}")
    if len(parts) == 1:
        return parts[0]
    silence = np.zeros(int(RATE * 0.13), dtype=np.float32)
    merged = []
    for i, part in enumerate(parts):
        if i: merged.append(silence)
        merged.append(part)
    return np.concatenate(merged)

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--device", choices=["cuda", "cpu"], default="cuda")
    parser.add_argument("--replace", action="store_true", help="Replace existing recordings, after listening/review.")
    args = parser.parse_args()
    for executable in ["node", "ffmpeg", "ffprobe"]:
        if not shutil.which(executable):
            raise SystemExit(f"Missing executable: {executable}")

    words = read_words()
    input_sha = hashlib.sha256((HERE / "words.js").read_bytes()).hexdigest()
    existing = AUDIO_DIR / "manifest.json"
    if existing.exists() and not args.replace:
        prior = json.loads(existing.read_text(encoding="utf-8"))
        if prior.get("source_sha256") != input_sha or prior.get("voice") != VOICE:
            raise SystemExit("Audio source/voice changed. Review files first, then use --replace to regenerate.")
    import torch
    from kokoro import KPipeline
    if args.device == "cuda" and not torch.cuda.is_available():
        raise SystemExit("Kokoro CUDA unavailable. Resolve GPU configuration on Maise or explicitly use --device cpu.")
    pipeline = KPipeline(lang_code="a", device=args.device)
    manifest = {
        "engine": "kokoro (Maise Audio Foundry runtime)",
        "voice": VOICE,
        "lang": "en-us",
        "source_sha256": input_sha,
        "sample_rate": RATE,
        "audio_format": "mp3",
        "clips": {},
    }
    seen = set()
    for index, item in enumerate(words, 1):
        word = item["word"]
        manifest["clips"][word] = {}
        print(f"[{index:02d}/20] {word}", flush=True)
        for kind, speed in [("word", 0.90), ("slow", 0.78), ("sentence", 0.95)]:
            name = filename(word, kind)
            if name in seen:
                raise SystemExit(f"Duplicate output name: {name}")
            seen.add(name)
            path = AUDIO_DIR / name
            if path.exists() and not args.replace:
                duration = duration_seconds(path)
            else:
                spoken = word.replace("’", "'") + "." if kind != "sentence" else item["sentence"].replace("’", "'")
                samples = render_text(pipeline, spoken, speed)
                duration = convert_to_mp3(samples, RATE, path)
            manifest["clips"][word][kind] = name
            manifest["clips"][word].setdefault("seconds", [])
            manifest["clips"][word]["seconds"].append(duration)
    if len(seen) != 60:
        raise SystemExit(f"Expected 60 clips, got {len(seen)}")
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    staged = existing.with_name("manifest.json.tmp")
    staged.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    os.replace(staged, existing)
    print("PASS: 60 verified MP3s and complete Kokoro manifest")
    print("Listen to representative words and sentences on your actual speakers BEFORE publishing.")

if __name__ == "__main__":
    main()
