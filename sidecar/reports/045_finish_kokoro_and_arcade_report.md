# Report 046: Kokoro narration completion

**Author:** Anna (Claude Code on the build machine). **Base:** `integration/playable-arcade-flashcards-printer` (036416c). **Branch:** `claude/finish-list14-kokoro-narrations`.

## Result
* **38 clips newly rendered; 42 of 42 present** (all joke ids in `content/list14_words_v1.json`), each a nonzero mp3 and served 200 over HTTP. `narration` and `narrationMeta` both have 42 keys.
* **Four audition samples preserved byte-for-byte** (supper primary/alternate, tiger primary, upstairs primary; status `audition_sample`). The other 38 are `rendered_unapproved`.
* **Engine:** local `kokoro-onnx` 0.6.1, voice `af_heart`, speed 0.95, CPU on the build machine, models from `/path/to/kokoro/`. No network or cloud TTS. The venv is now durable at `<venv>` (earlier one was in a session scratchpad). Notes: `docs/KOKORO_NARRATION.md`.
* **No content JSON or joke ids changed.**

## What was heard, and how
No human has listened to the 38 new clips yet. I checked all 42 with local faster-whisper (machine listening only, `tools/listen_check_narration.py`). Most match their text. I fixed four by **voice-only overrides** (`tools/narration_voice_overrides.json`, spoken text differs, on-screen text unchanged):

| Clip | Problem | Voice fix |
|---|---|---|
| tiger-alternate | "liger" read as "Elijah" | "lie-gurr" (now transcribed as "Liger") |
| thunder-primary | "THHH" spelled T-H-H-H | "made the th sound" |
| chapter-primary | "TER!" spelled T-E-R | "turr!" (transcribed "her": ear check needed) |
| animal-primary | "AN! ih! MAL!" garbled | "Ann! Ih! Mull!" |

**Left as is on purpose:** supper-primary ("pee-pee", a human-heard sample), tiger-primary (GRRR/TIE spelled; approved sample). Whisper also flags mild differences it cannot judge (afternoon "mooed" heard as "mood", butterfly and newspaper puns, "Two C's" heard as "Two seas", which is the pun).
**Needs human ears first:** chapter "turr", animal, liger, thunder, soccer alternate, ladder alternate, and the three suppers.

## Tests actually run (local)
| Command | Result |
|---|---|
| `node --test` | 99 pass, 0 fail |
| `node tests/validate_arcade.mjs` | PASS (five configured games, local paths, workshop states) |
| `node tools/e2e_printer.mjs --shots /tmp/claude-1001/shots` | 72/72 checks |
| `python3 tools/validate_list14_content.py` | 20 words, 42 jokes, 0 errors, 0 warnings |
| `python3 -m unittest discover -s tests -p 'test_*.py'` | 15 tests OK |
| `git diff --check` | clean |
| `http.server 8784`: `/`, `/flashcards/`, `/game/`, `/printer-v2/`, `/shared/progress.html` | all 200 |
| all 42 narration mp3 over HTTP | 42/42 served, valid headers |

## Not done / not verified
* I did **not** click through the Arcade page in a real browser, play a first-letter or review word by hand, or test Stop/Mute manually; the e2e suite covers Printer v2 only, and the Arcade is covered by its static validator and HTTP checks. I did not exercise the original Flashcards' Silly sentence button.
* I did not test whether each of the 42 "Read the sentence" buttons plays its clip in the browser; I verified the manifest ids, files and HTTP serving.
* No back link from Flashcards to the Arcade was added (browser Back is acceptable per the prompt).
* No adapter between `wordwild.flashcards.v1` and `wordwild.shared.v1` (follow-up).

## Play it
```bash
git clone --branch claude/finish-list14-kokoro-narrations <private repo> <local clone>
cd <local clone> && python3 -m http.server 8784 --bind 127.0.0.1
```
Open http://127.0.0.1:8784/ (one address for all games). After the audio PR is merged, `git pull` the integration branch instead.
