#!/usr/bin/env python3
"""Transcribe every audio clip locally (faster-whisper) and check the SPOKEN words against the private names list.
Prints counts only. Also reports any embedded metadata tags (ID3 etc.) that name a person or path.
    WW_NAMES_FILE=~/.wordwild_scrub_names.txt python3 scripts/audio_transcript_audit.py [dir]
Needs: faster-whisper, ffprobe. Whisper can mishear; this is a screen, not proof."""
import os, re, sys, json, pathlib, subprocess
from faster_whisper import WhisperModel
root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "wordwild")
nf = pathlib.Path(os.environ.get("WW_NAMES_FILE", "~/.wordwild_scrub_names.txt")).expanduser()
names = [l.strip() for l in nf.read_text().splitlines() if l.strip()]
rx = re.compile("|".join(re.escape(n) for n in names), re.I)
meta_rx = re.compile(r"(/home/|/srv/|@)", re.I)
m = WhisperModel("small", device="cpu", compute_type="int8")
files = sorted([*root.rglob("*.mp3"), *root.rglob("*.wav")]); spoken = tagged = 0
for f in files:
    text = " ".join(s.text for s in m.transcribe(str(f), language="en")[0])
    if rx.search(text): spoken += 1
    tags = json.loads(subprocess.run(["ffprobe","-v","quiet","-print_format","json","-show_format",str(f)],capture_output=True,text=True).stdout or "{}").get("format",{}).get("tags",{})
    if rx.search(json.dumps(tags)) or meta_rx.search(json.dumps(tags)): tagged += 1
print(f"{len(files)} audio files transcribed; names spoken: {spoken} files; identifying metadata tags: {tagged} files")
sys.exit(1 if spoken or tagged else 0)
