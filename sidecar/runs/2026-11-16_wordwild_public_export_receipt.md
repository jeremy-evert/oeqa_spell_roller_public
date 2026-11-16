# Receipt: WordWild public export (staged, not pushed)

Date: 2026-11-16. Branch: `claude/show-off-plan` (local). Baseline: public `main` at 631a561. Export source: a private branch (fresh export, no history).
The list of private names is kept in an untracked local file and is **not** in this repo. Counts only.

## Name and privacy audit (`scripts/public_audit.py`)
Scanned 77 text files in `wordwild/`, `sidecar/`, `CHECKLIST.md` and `README.md` (`scripts/` is excluded because its own pattern lines match their patterns; it holds no names or host names, which live in the untracked file):
* private names: **0 hits in 0 files** (before the fix: 3 hits in 2 files in the content package and a tool, plus 1 more in the content JSON; reworded to "the child" / "the parent reviewer")
* private paths: 0 hits. Host names and user names: 0 hits (before: 3 files; reworded to generic text)
* email addresses: 0. Credential-looking strings: 0.
Non-text files: 162 `.mp3`, 20 `.wav` (each type has a license line in `wordwild/ASSETS.md`).

## Spoken audio and metadata (`scripts/audio_transcript_audit.py`, local speech-to-text)
182 audio files transcribed: **names spoken in 0 files; identifying metadata tags in 0 files.** (A speech-to-text pass can mishear; this is a screen, not proof.)

## Unchanged things
Roll and Read `index.html`, `LICENSE` and `README.md`: no diff against `origin/main`.

## Changes made to the exported copy (so it runs publicly)
1. Arcade links, fetch path and `index.html` references made relative (`arcade/`, `flashcards/`, ...).
2. `tests/validate_arcade.mjs`: expects relative paths.
3. `tests/arcade_browser_smoke.mjs`: now hides the real game folders from its test server, because the test models games that are "not installed" and here they are.
4. `flashcards/tests/words.test.js`: compared the word list to a private school-list file; now compares to `content/list14_words_v1.json` (public).
5. Reworded a note naming a child in the content file and a render tool; replaced machine paths in three READMEs/docstrings.

## Tests run on the staged export (from `wordwild/`)
```
node --test                                   # tests 99, pass 99, fail 0
node tests/validate_arcade.mjs                # PASS
node tests/arcade_browser_smoke.mjs           # PASS (needs Chromium)
python3 tools/validate_list14_content.py      # 20 words, 42 joke variants, 0 errors, 0 warnings
python3 -m unittest discover -s tests -p 'test_*.py'   # Ran 15 tests OK
node flashcards/tools/e2e.mjs --base http://127.0.0.1:8787/flashcards/   # 42/42 checks passed (needs Chromium, a local server)
node tools/e2e_printer.mjs                    # 72/72 checks passed (needs Chromium)
```
The original printer (`game/`) has **no tests**.

## Served under the Pages-style path
Copied the repo to a folder named `oeqa_spell_roller_public` and served its parent at `127.0.0.1`. `/oeqa_spell_roller_public/wordwild/`, `/flashcards/`, `/game/`, `/printer-v2/`, `/shared/progress.html` and `/` all returned 200. The arcade rendered 3 **Play** cards and 2 **In the workshop** cards in headless Chromium. No `http(s)://` address other than localhost appears in code.

## Not run
Touch devices, Firefox, Safari, Android, iOS; the published address (nothing is pushed); human listening to the 38 later audio clips.
