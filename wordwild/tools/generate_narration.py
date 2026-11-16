#!/usr/bin/env python3
"""Generate joke-narration clips with LOCAL Kokoro (kokoro-onnx), voice af_heart. No network, no cloud.

Existing samples have been heard by Jeremy. Finish missing local audio now, then sample-listen and correct pronunciation issues.
    python3 tools/generate_narration.py --model M.onnx --voices V.bin --only list14-supper-primary-v1 list14-tiger-primary-v1
Render the 38 missing clips without overwriting the four existing samples:
    python3 tools/generate_narration.py --model M.onnx --voices V.bin --missing
To intentionally regenerate every clip after editing scripts, use --all.
Needs: kokoro-onnx, soundfile, ffmpeg (a one-time build step; the game itself is static and needs none of this).
Writes printer-v2/assets/audio/narration/<jokeId>.mp3 and merges "narration" + "narrationMeta" into manifest.json.
Rendering is deterministic per text+speed; delete a clip and re-run to regenerate it.
"""
import argparse, json, subprocess, tempfile, datetime, pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser()
ap.add_argument("--model", required=True); ap.add_argument("--voices", required=True); ap.add_argument("--voice", default="af_heart")
ap.add_argument("--only", nargs="*", default=[]); ap.add_argument("--all", action="store_true")
ap.add_argument("--missing", action="store_true", help="render only joke clips missing from the manifest or filesystem; preserve existing samples")
a = ap.parse_args()
if not a.only and not a.all and not a.missing: sys.exit("choose --only <joke ids>, --missing, or --all")
if sum([bool(a.only), bool(a.all), bool(a.missing)]) != 1: sys.exit("choose exactly one of --only, --missing, --all")
import soundfile as sf
from kokoro_onnx import Kokoro

doc = json.loads((ROOT / "content" / "list14_words_v1.json").read_text(encoding="utf-8"))
jokes = {j["id"]: j for w in doc["words"] for j in w["jokes"]}
out = ROOT / "printer-v2" / "assets" / "audio"; (out / "narration").mkdir(parents=True, exist_ok=True)
mpath = out / "manifest.json"; manifest = json.loads(mpath.read_text())
if a.missing:
    ids = [i for i in jokes if not manifest.get("narration", {}).get(i)
           or not (out / manifest["narration"][i]).is_file()]
else:
    ids = list(jokes) if a.all else a.only
for i in ids:
    if i not in jokes: sys.exit("unknown joke id " + i)
if not ids:
    print("All narration clips already exist; nothing to render.")
    sys.exit(0)
print(f"Rendering {len(ids)} of {len(jokes)} jokes with local Kokoro ({a.voice}).")
k = Kokoro(a.model, a.voices)
manifest.setdefault("narration", {}); manifest.setdefault("narrationMeta", {})
# Voice-only respellings: what Kokoro SAYS for a clip, without touching the joke text or its stable id.
ovr_path = ROOT / "tools" / "narration_voice_overrides.json"
overrides = json.loads(ovr_path.read_text(encoding="utf-8")).get("overrides", {}) if ovr_path.is_file() else {}
for i in ids:
    text = overrides.get(i, {}).get("voiceText") or jokes[i]["narration"]
    samples, sr = k.create(text, voice=a.voice, speed=0.95, lang="en-us")
    with tempfile.TemporaryDirectory() as t:
        wav = pathlib.Path(t) / "x.wav"; sf.write(wav, samples, sr)
        subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-af",
            "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-18",
            "-ar", "24000", "-ac", "1", "-b:a", "48k", str(out / "narration" / f"{i}.mp3")])
    manifest["narration"][i] = f"narration/{i}.mp3"
    manifest["narrationMeta"][i] = {"seconds": round(len(samples) / sr, 2), "generated": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"), "status": "audition_sample" if (a.only and i not in overrides) else "rendered_unapproved"}
    if i in overrides: manifest["narrationMeta"][i]["voiceOverride"] = True
    print(i, manifest["narrationMeta"][i]["seconds"])
mpath.write_text(json.dumps(manifest, indent=2) + "\n")
