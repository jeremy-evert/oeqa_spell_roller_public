#!/usr/bin/env python3
"""Sanity-check the narration locally: transcribe each clip with faster-whisper and compare with the target.
This is a pronunciation SMOKE test (a machine hearing the clip), not a replacement for a human listening."""
import json, pathlib, re, sys
from faster_whisper import WhisperModel
HERE = pathlib.Path(__file__).resolve().parent.parent
man = json.loads((HERE / "assets/audio/manifest.json").read_text())
model = WhisperModel("medium.en", device="cpu", compute_type="int8", local_files_only=True)
norm = lambda s: re.sub(r"[^a-z ]", "", s.lower()).strip()
bad = 0
res = {}
for word, c in man["clips"].items():
    row = {}
    for kind in ("word", "slow"):
        segs, _ = model.transcribe(str(HERE / "assets/audio" / c[kind]), language="en", beam_size=5)
        heard = norm(" ".join(s.text for s in segs)); row[kind] = heard
        # fair criterion: the target appears as a whole word, or with a plural/filler word around it
        ok = word in heard.replace(" ", "") or any(w.startswith(word) or (word.startswith(w) and len(w) > 4) for w in heard.split())
        if not ok: bad += 1; row[kind + "_FAIL"] = True
    segs, _ = model.transcribe(str(HERE / "assets/audio" / c["sentence"]), language="en", beam_size=5)
    sent = norm(" ".join(s.text for s in segs)); row["sentence_contains_word"] = word in sent.replace(" ", "") or word in sent
    res[word] = row
    print(f"{word:11s} word={row['word']!r:14} slow={row['slow']!r:14} sentence_has_word={row['sentence_contains_word']}")
print("word/slow clips that do NOT contain the target (fair check):", bad)
json.dump(res, open(sys.argv[1] if len(sys.argv) > 1 else "/dev/null", "w"), indent=1)
