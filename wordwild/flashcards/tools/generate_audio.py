#!/usr/bin/env python3
"""Generate the narration clips for the flashcards with LOCAL Kokoro (kokoro-onnx). No network, no cloud.

Usage (one-time build step; the game itself is static and needs none of this):
    python tools/generate_audio.py --model /path/to/kokoro/kokoro-v1.0.onnx \
        --voices /path/to/kokoro/voices-v1.0.bin [--voice af_heart]
Needs: kokoro-onnx, soundfile, ffmpeg. Reads WORDS from words.js via node. Writes assets/audio/*.mp3 + manifest.json.
Clips per word: <word>.mp3 (word), <word>_slow.mp3 (slow word), <word>_sentence.mp3 (funny sentence).
"""
import argparse, json, subprocess, tempfile, hashlib, datetime, pathlib
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = pathlib.Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser()
ap.add_argument("--model", required=True); ap.add_argument("--voices", required=True)
ap.add_argument("--voice", default="af_heart")
a = ap.parse_args()

words = json.loads(subprocess.check_output(["node", "-e",
    "import('./words.js').then(m=>console.log(JSON.stringify(m.WORDS)))"], cwd=HERE))
k = Kokoro(a.model, a.voices)
out = HERE / "assets" / "audio"; out.mkdir(parents=True, exist_ok=True)

def clip(text, name, speed):
    samples, sr = k.create(text, voice=a.voice, speed=speed, lang="en-us")
    with tempfile.TemporaryDirectory() as t:
        wav = pathlib.Path(t) / "x.wav"; sf.write(wav, samples, sr)
        # trim near-silence at the ends, normalize loudness a little, small mp3
        subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-af",
            "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-18",
            "-ar", "24000", "-ac", "1", "-b:a", "48k", str(out / name)])
    return len(samples) / sr

manifest = {"engine": "kokoro-onnx (local)", "model": "kokoro-v1.0", "voice": a.voice, "lang": "en-us",
            "generated": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
            "licence_note": "Kokoro-82M is Apache-2.0. Clips are original synthesized audio created locally for this project.",
            "clips": {}}
for w in words:
    key = w["word"]
    # a trailing period gives the word a natural falling ending; the slow clip adds gentle pauses.
    d1 = clip(f"{key}.", f"{key}.mp3", 0.9)
    d2 = clip(f"{key}.", f"{key}_slow.mp3", 0.8)
    d3 = clip(w["sentence"], f"{key}_sentence.mp3", 0.95)
    manifest["clips"][key] = {"word": f"{key}.mp3", "slow": f"{key}_slow.mp3", "sentence": f"{key}_sentence.mp3",
                              "seconds": [round(d1, 2), round(d2, 2), round(d3, 2)]}
    print(key, manifest["clips"][key]["seconds"])
(out / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
print("done", len(manifest["clips"]), "words")
