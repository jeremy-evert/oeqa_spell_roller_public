# Prompt 045 — Claude on the build machine: Finish Kokoro Narration and Verify the Playable Arcade

**Status:** Execute now. Do not commission another writing round.  
**Baseline:** PR #16 (private repo), branch `integration/playable-arcade-flashcards-printer`.  
**Date:** November 15, 2026 (evening).  
**Owner:** Claude Code on **the build machine** for local audio rendering and QA, Jeremy for listening/playtest.  
**Objective:** Make the current **WordWild Arcade** the local entry point to Professor Potato's Flashcards and both Printer editions, and finish the missing pre-rendered Kokoro comedy audio in the newest Printer.

## BEGIN CLAUDE CODE ASSIGNMENT

Claude: We're done letting a trivial audio task block a playable spelling game. Jeremy has heard the samples and says the Kokoro voice is good. He wants to **play tonight**.

**You have access to the build machine and its local Kokoro model, and you have the working repository. Execute now, not just plan it.**

### First: inspect the actual combined branch, without damaging any other work

- GitHub: `<private repo>`, PR #16, branch `integration/playable-arcade-flashcards-printer`.
- The source branch **already contains**:
  - `index.html` plus `arcade/`, Codex's live game chooser.
  - `flashcards/`, original Flashcards plus the two corrected phonics notes, with 60 original MP3 files.
  - `game/`, original Printer version 1.
  - `printer-v2/`, new Printer v2 plus PR #14's 20 original pre-answer *context sentence* recordings.
  - `content/list14_words_v1.json`, 20 words with 42 candidate mnemonic jokes.
  - `shared/` same-origin local progress and `tools/generate_narration.py` with a NEW `--missing` option.
  - Unit and Arcade/browser test scripts.
- Preserve the original `<local clone>` and `<local clone>` checkouts on the home laptop. On the build machine, use a fresh separate clone/worktree in a safe nonconflicting folder. Do not merge upstream PRs #4, #11, #12, #13, #14 or #16.
- Confirm `git status` is clean, and use your own branch based on `origin/integration/playable-arcade-flashcards-printer`, e.g. `claude/finish-list14-kokoro-narrations`.

### Step 1. Finish 38 missing narration clips, locally, now

The existing four audition clips are already in `printer-v2/assets/audio/narration/`. The other 38 new joke narrations were delayed only for human-ear review. Jeremy now wants forward progress.

Inspect `tools/generate_narration.py`, the 42 entries in `content/list14_words_v1.json`, and `printer-v2/assets/audio/manifest.json`. Check that the machine has the cached files:

```bash
ls -l /path/to/kokoro/kokoro-v1.0.onnx
ls -l /path/to/kokoro/voices-v1.0.bin
python3 -c 'import kokoro_onnx, soundfile; print("Kokoro dependencies available")'
ffmpeg -version | head -n 1
```

If the Python imports are missing, use an isolated venv and install only the documented audio dependencies, without modifying the game's runtime. If the paths have changed, **find the existing local model first**, rather than downloading a copy or blocking on another machine.

Render all currently missing clips, preserving the four approved samples:

```bash
python3 tools/generate_narration.py \
  --model /path/to/kokoro/kokoro-v1.0.onnx \
  --voices /path/to/kokoro/voices-v1.0.bin \
  --missing
```

- **Local generation only** with `af_heart`; no web API, payments, browser `speechSynthesis`, or remote TTS.
- `--missing` should render exactly **38** if no one else has rendered additional clips.
- The `narration` dictionary must cover **all 42 joke IDs**; verify every referenced MP3 exists and has nonzero size, and all `narrationMeta` keys have a status (initial samples are historical, others may remain `rendered_unapproved` until human listening).
- Do not delete or overwrite the four existing samples. Do not change versioned joke IDs or the learner's canonical spelling targets.
- **Listen** to a small but varied selection: `supper` (P/P name confusion), `ladder` (D/D), `soccer` (C/C), `tiger` (“TIE” / “GRRR”), `upstairs`, and at least three full alternate jokes. If a phrase sounds foolish or spells out punctuation, favor a small **voice-only rendering override** rather than rewriting the content JSON and silently invalidating stable joke IDs. Document any such overrides and re-render just those IDs. A funny “pee pee” is a comic outcome, not a reason to refuse to generate the others.
- Never teach “two letter P's = two separately pronounced consonant sounds.” Keep mnemonic versus phonics distinction accurate.

### Step 2. Verify the three original games actually launch together

Run the combined branch on the build machine or use the home laptop clone `<local clone>` when appropriate. Serve the **repository root** from ONE local address:

```bash
python3 -m http.server 8784 --bind 127.0.0.1
```

The Arcade root `/` should show **Play** for these present local paths:

- `/flashcards/` Original Professor Potato Flashcards
- `/game/` Original 3D Printer
- `/printer-v2/` New second-edition Printer

The two future games should be shown **In the workshop**, not broken links. The original Flashcards' **Silly sentence** control must work before typing; Printer v2's **Read the sentence** must work before typing; new mnemonic joke **Read the sentence** buttons should work after revealing or attempting the word for all 42 versions. Before typing, the word and mnemonic letters must stay hidden in the displayed UI.

**Keep the word-help and scoring behaviors unchanged.** Audio listening alone does not reduce independent status; spelling-revealing mnemonics do. Read and compare the original Flashcards instead of reinventing its UI.

### Step 3. Run actual tests, and report the results

In the integrated checkout:

```bash
node --test
node tests/validate_arcade.mjs
node tools/e2e_printer.mjs --shots /tmp/wordwild-playground-shots
python3 tools/validate_list14_content.py
python3 -m unittest discover -s tests -p 'test_*.py'
git diff --check
```

These may require on-box Chromium (the Printer browser script defaults to `chromium`), a free `8771/8772` test port pair, and local `ffmpeg`. Do not claim tests passed until run; resolve genuine failures rather than silently editing tests to weaken them. Also manually play one first-letter word and one later review word, check Stop/Mute.

**Important scope:** Original Flashcards historical progress is `wordwild.flashcards.v1`; Printer v2 has `wordwild.shared.v1`. They share an origin but do NOT automatically merge scores. Adding a tested adapter is follow-up work, **not** a blocker for launching the Arcade.

### Step 4. Hand Jeremy a playable branch and report

- Commit the new MP3s and manifest in a **small audio PR targeting `integration/playable-arcade-flashcards-printer`** (not `main`). Keep this branch independent of Codex's art worktree.
- In `reports/046_kokoro_audio_completion.md`, list how many clips were newly rendered, how many are present, model/voice/device, exactly which were human-listened, fixed odd phrases if any, and all actual test commands/results.
- Provide a specific way Jeremy can pull the integration after audio is merged and open one Arcade URL. If audio PR isn't yet merged, provide a safe **separate clone** launch instruction for the audio branch.
- Add a short visible navigation path to the Arcade from the original Flashcards if needed, but do not redesign the original loved game. Browser Back is acceptable for the first full playtest.
- Treat **graphics as optional polish**. The important success criterion is three accessible games with complete sound in an integrated Arcade.
- Don't generate more unreviewed educational “rules.” We have enough.

### Completion

**All three games launch from one Arcade; original Flashcards remain intact; all twenty Printer v2 words have their pre-spelling contextual sentences; all 42 new joke narrations have local Kokoro clips; existing scoring/audio tests remain green; and Jeremy can play immediately.**

No more audio “pending” except a clearly enumerated human-ear correction, if one remains. Bring back a concrete PR URL and a simple launch command.

## END CLAUDE CODE ASSIGNMENT
