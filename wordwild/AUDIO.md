# WordWild narration: how the local Kokoro audio is made

Everything the game says is pre-rendered, local, and static. The game itself needs none of this at run time.
**No web TTS, no paid API, no browser `speechSynthesis`.** Voice: `af_heart` (Kokoro v1.0, `kokoro-onnx` 0.6.1, CPU).

## Where things live
| Thing | Location |
|---|---|
| Model + voices (local) | `/path/to/kokoro/kokoro-v1.0.onnx`, `voices-v1.0.bin` |
| Python venv (local) | `a local virtual environment` (kokoro-onnx 0.6.1, soundfile 0.14.0, onnxruntime 1.32.0, numpy 2.5.5) |
| Generator | `tools/generate_narration.py` |
| Voice-only respellings | `tools/narration_voice_overrides.json` |
| Machine-listening check | `tools/listen_check_narration.py` (needs `faster-whisper`) |
| Clips + manifest | `printer-v2/assets/audio/narration/<jokeId>.mp3`, `printer-v2/assets/audio/manifest.json` |
| Other audio | `flashcards/` (60 mp3: word, slow, sentence) and `printer-v2/assets/audio/` (word, slow, 20 context sentences) |

## Rebuild the venv (if it is ever lost)
```bash
uv venv a local virtual environment --python 3.12
uv pip install --python a local virtual environment/bin/python kokoro-onnx soundfile
# ffmpeg must be on PATH. The model files above are the existing local copies; do not re-download.
```

## Render
```bash
PY=a local virtual environment/bin/python
M=/path/to/kokoro
$PY tools/generate_narration.py --model $M/kokoro-v1.0.onnx --voices $M/voices-v1.0.bin --missing        # only clips not on disk
$PY tools/generate_narration.py --model ... --voices ... --only list14-tiger-alternate-v1                 # re-render chosen ids
```
`--all` regenerates everything and **overwrites the four approved samples**; do not use it casually.
A clip's text is `jokes[].narration` unless `tools/narration_voice_overrides.json` has an entry for that id, in which case the
override's `voiceText` is spoken. **Fix pronunciation with an override, not by editing the content JSON**: joke ids are stable
and a content edit would force a version bump and re-approval. The on-screen text never changes.

## Status values (`narrationMeta`)
* `audition_sample`: the four clips Jeremy heard first (supper primary and alternate, tiger primary, upstairs primary). Never overwritten.
* `rendered_unapproved`: rendered and machine-checked, not yet heard by a human. Replace with a human-approved status after listening.

## Known Kokoro behaviors (learned the hard way)
* Written letter names are spoken as letters. "P, P. Two P's!" in supper is heard as "pee-pee" (kept: a human heard it and liked it).
  Respelling does not help; it is a comic outcome, not a bug.
* Sound-effect spellings in capitals ("GRRR", "THHH", "TER") are often **spelled out** letter by letter. Keep the original tiger sample
  (approved). For new ones, describe the sound ("made the th sound") or respell as a word ("turr", "Ann! Ih! Mull!").
* Rare words can be misread by the phonemizer: "liger" came out as "Elijah". Respelled "lie-gurr".
* The `[word](/phonemes/)` markup is NOT supported by this build; it is read aloud as symbols. Do not use it.
* Mnemonic is not phonics: never write narration that teaches doubled letters as two sounds, or assigns a sound to one C of "cc".

## QA habit
1. Render. 2. Run `tools/listen_check_narration.py`; read each flagged clip's transcript against its text (Whisper mishears
puns and names, so flags are prompts for a human decision, not verdicts). 3. A person listens to the funniest and riskiest clips.
4. Record what was heard in the next audio report.
