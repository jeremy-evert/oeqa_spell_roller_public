#!/usr/bin/env python3
"""Render answer-safe clue narration with the flashcard game's Kokoro voice."""
import argparse
import datetime
import hashlib
import json
import os
import subprocess
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

GAME = Path(__file__).resolve().parents[1]
ROOT = GAME.parent
WORDS_JS = "import('./words.js').then(m => console.log(JSON.stringify(m.words)))"


def word_bank():
    result = subprocess.run(
        ["node", "--input-type=module", "-e", WORDS_JS],
        cwd=GAME, check=True, capture_output=True, text=True,
    )
    rows = json.loads(result.stdout)
    if len(rows) != 20:
        raise SystemExit(f"Expected 20 words, found {len(rows)}")
    return rows


def digest(data):
    return hashlib.sha256(data).hexdigest()


def relative_path(path):
    try:
        return path.resolve().relative_to(ROOT.resolve()).as_posix()
    except ValueError:
        return str(path.resolve())


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model-dir", type=Path, default=ROOT / ".local/kokoro/models")
    parser.add_argument("--output-dir", type=Path, default=GAME / "assets/audio/clues")
    parser.add_argument("--limit", type=int, help="Render only the first N clues for a quick check")
    parser.add_argument("--voice", default="af_heart")
    args = parser.parse_args()

    model_path = args.model_dir / "kokoro-v1.0.onnx"
    voices_path = args.model_dir / "voices-v1.0.bin"
    for path in (model_path, voices_path):
        if not path.is_file():
            raise SystemExit(f"Missing {path}. Run game/tools/setup_kokoro.sh first.")

    rows = word_bank()
    default_output = (GAME / "assets/audio/clues").resolve()
    if args.limit is not None and args.output_dir.resolve() == default_output:
        raise SystemExit("Use --output-dir /tmp/... when rendering a partial sample")
    if args.limit is not None:
        if not 1 <= args.limit <= len(rows):
            raise SystemExit("--limit must be between 1 and 20")
        rows = rows[:args.limit]

    renderer = Kokoro(str(model_path), str(voices_path))
    source_bytes = (GAME / "words.js").read_bytes()
    renderer_bytes = Path(__file__).read_bytes()
    prompts = []
    for index, row in enumerate(rows, start=1):
        prompt = " ".join(row["clue"].split())
        if row["word"] in prompt.lower():
            raise SystemExit(f"Answer leak in the narration prompt for card {index}")
        prompts.append(prompt)

    args.output_dir = args.output_dir.resolve()
    args.output_dir.parent.mkdir(parents=True, exist_ok=True)
    manifest = {
        "schemaVersion": 1,
        "job": "wordwild-list14-clue-narration",
        "generatedUtc": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
        "source": {
            "path": relative_path(GAME / "words.js"),
            "sha256": digest(source_bytes),
        },
        "normalizedTextSha256": digest("\n".join(prompts).encode("utf-8")),
        "expectedChunks": len(rows),
        "engine": "kokoro-onnx",
        "engineVersion": "0.6.1",
        "model": {
            "name": "Kokoro v1.0",
            "path": relative_path(model_path),
            "sha256": digest(model_path.read_bytes()),
        },
        "voiceBundle": {
            "path": relative_path(voices_path),
            "sha256": digest(voices_path.read_bytes()),
        },
        "voice": args.voice,
        "language": "en-us",
        "renderer": {
            "path": relative_path(Path(__file__)),
            "version": "1.0",
            "sha256": digest(renderer_bytes),
        },
        "sampleRate": 24000,
        "format": "wav-pcm16-mono",
        "clips": [],
        "validatedChunks": [],
        "publication": {
            "kind": "static-game-assets",
            "outputDirectory": relative_path(args.output_dir),
            "status": "ready-for-commit",
        },
    }

    with tempfile.TemporaryDirectory(prefix="kokoro-clues-", dir=args.output_dir.parent) as staging:
        staging_dir = Path(staging)
        for index, (row, prompt) in enumerate(zip(rows, prompts, strict=True), start=1):
            audio, sample_rate = renderer.create(prompt, voice=args.voice, speed=0.9, lang="en-us")
            audio = np.asarray(audio, dtype=np.float32).reshape(-1)
            if sample_rate != 24000 or not audio.size or not np.isfinite(audio).all():
                raise SystemExit(f"Invalid generated audio for card {index}")
            peak = float(np.max(np.abs(audio)))
            if peak:
                audio = audio * (0.88 / peak)

            filename = f"clue-{index:02d}.wav"
            output = staging_dir / filename
            sf.write(output, audio, sample_rate, subtype="PCM_16")
            info = sf.info(output)
            if info.samplerate != 24000 or info.channels != 1 or info.subtype != "PCM_16" or info.frames <= 0:
                raise SystemExit(f"Audio validation failed for card {index}")
            audio_sha256 = digest(output.read_bytes())
            record = {
                "card": index,
                "file": filename,
                "textSha256": digest(prompt.encode("utf-8")),
                "sha256": audio_sha256,
                "bytes": output.stat().st_size,
                "seconds": round(info.frames / info.samplerate, 3),
                "status": "validated",
            }
            manifest["clips"].append(record)
            manifest["validatedChunks"].append(index)
            print(f"{index:02d}: {filename} ({audio.size / sample_rate:.2f}s)")

        staged_manifest = staging_dir / "manifest.json"
        staged_manifest.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
        args.output_dir.mkdir(parents=True, exist_ok=True)
        for index in range(1, len(rows) + 1):
            os.replace(staging_dir / f"clue-{index:02d}.wav", args.output_dir / f"clue-{index:02d}.wav")
        os.replace(staged_manifest, args.output_dir / "manifest.json")
    print(f"Rendered {len(rows)} answer-safe clue clips to {args.output_dir}")


if __name__ == "__main__":
    main()
