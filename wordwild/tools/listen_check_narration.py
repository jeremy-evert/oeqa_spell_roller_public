#!/usr/bin/env python3
"""Machine-listening smoke test for narration clips (faster-whisper, local). NOT a substitute for human ears.
Transcribes every clip in printer-v2/assets/audio/narration/ and prints those whose transcript differs from the
text that was actually spoken (voice override if present, else jokes[].narration). Whisper mishears names and
puns, so each flag needs a human decision. Run from the repo root:
    python3 tools/listen_check_narration.py [--threshold 0.93]   (needs faster-whisper; see docs/KOKORO_NARRATION.md)
"""
import json,re,difflib
from faster_whisper import WhisperModel
doc=json.load(open("content/list14_words_v1.json"))
try: OV=json.load(open("tools/narration_voice_overrides.json"))["overrides"]
except FileNotFoundError: OV={}
J={j["id"]:j for w in doc["words"] for j in w["jokes"]}
m=WhisperModel("small",device="cpu",compute_type="int8")
n=lambda s:re.sub(r"[^a-z ]","",s.lower().replace("-"," ")).split()
for i,j in J.items():
    segs,_=m.transcribe(f"printer-v2/assets/audio/narration/{i}.mp3",language="en")
    h=" ".join(s.text.strip() for s in segs)
    r=difflib.SequenceMatcher(None,n(OV.get(i,{}).get("voiceText") or j["narration"]),n(h)).ratio()
    if r<0.93: print(round(r,2),i,"\n  SRC:",OV.get(i,{}).get("voiceText") or j["narration"],"\n  HEARD:",h)
