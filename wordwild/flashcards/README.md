# WordWild Flashcards: List 14 (Mission 003)

Funny, illustrated, audio-rich listening flashcards for all 20 List 14 spelling words. Static HTML/CSS/JS: no build step, no
dependencies, no network, no accounts. Progress is saved on the device only.

## Launch

From the repo root:

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

Then open **http://127.0.0.1:8765/flashcards/** in Chrome, Edge, Firefox or Android Chrome.
(Opening `index.html` as a `file://` page will not work, because the game loads its narration manifest with `fetch`.)
To play on a phone or tablet on the same Wi-Fi, bind to the LAN address you choose yourself, for example
`python3 -m http.server 8765 --bind <this-computer's-LAN-IP>`, and open `http://<that-IP>:8765/flashcards/`.
Do not expose it to the internet.

## What it does

| Mode | What happens | Counts as |
|---|---|---|
| **Listen & Spell** (the scored game) | You hear the word and a silly sentence. The word is **never on screen**: not in the text, picture description, hint or page source. You type it. Wrong tries get specific, kind feedback (for example "your first 4 letters are right; the tricky spot is letter 5") without the answer. | independent / after retry / after hint / after reveal / skipped |
| **Flip & Learn** | An illustrated card flips to show the spelling, sound chunks and one honest observation. | **studied**. Never mastery. "Try from memory" hides the word again, and a success after studying is labelled "after studying". |
| **Quick Review** | Replays words that were missed, skipped, helped, or flagged tricky. | same outcomes |
| Speak & Check | **Not built.** The menu says "unavailable offline". See below. | n/a |

Rounds: four rounds of five words in the school order, a random "Surprise 5", or "All 20" with a break and a silly cheer after every five.
Progress dots on the menu show a symbol and a number, never color alone, and never print the words.

### How progress is counted (kept honest)
Each finished card has exactly one outcome. Only a **typed first try, with no hint, no study and no accessible mode** is "independent".
A word stays on the review list until its next independent first try. "Accessible mode" (shows the word) is recorded as *assisted* and is
never independent. Everything is in `engine.js` and covered by tests.

## Sound
- **Sound effects (mandatory, done):** seven original effects (flip, pop, correct, whoops, fanfare, hint, boing) synthesized live with the
  Web Audio API. No audio files, no licenses to worry about. Audio starts only after a button press. Settings has a **Sound effects** switch.
- **Narration:** local **Kokoro** voice (`af_heart`, American English) rendered once into `assets/audio/` (20 words x word / slow / silly sentence = 60 small mp3s,
  about 0.9 MB). Generated locally by `tools/generate_audio.py` with `kokoro-onnx` and a local copy of the Kokoro v1.0 model files. No cloud calls.
  If a clip is missing the game falls back to the browser's own voice (`speechSynthesis`) if it has one, and otherwise plays as text only.
- Pronunciation was machine-checked (not a substitute for a human ear). See `reports/003_list14_audio_flashcards.md`.

## Privacy and safety
No accounts, names, analytics, ads, cloud calls, microphone, or recordings. Saved data (`localStorage`, key `wordwild.flashcards.v1`) is only per-word counts and settings.
**Settings > Reset my progress** erases it. Bad or blocked storage never crashes the game.

## Optional voice answers (deferred)
Speak & Check needs an on-device speech recognizer. Local `faster-whisper` models exist, but wiring a microphone path safely (permission, no recording stored,
and treating speaking as different from spelling) is not needed for a playable game, so it is deferred. The game says so honestly in the menu.

## Accessibility
Keyboard-only play works (Tab, Enter). Visible focus rings, 44 px minimum touch targets, no color-only states, an `aria-live` mascot line for feedback,
picture descriptions that describe the scene without giving away the word, Calm mode (also follows `prefers-reduced-motion`), and spell-check/autocorrect
switched off in the answer box so the browser cannot underline or fix the answer. Accessible mode shows the word for kids who need it and is labelled honestly.

## Tests
```bash
cd flashcards && node --test                      # 44 unit tests, no dependencies
python3 -m http.server 8765 --bind 127.0.0.1 &    # from the repo root
node flashcards/tools/e2e.mjs --chromium chromium [--shots DIR]   # 42 checks in real headless Chromium (Node 22+)
```
`e2e.mjs` drives Chromium over the DevTools protocol with trusted mouse and keyboard events and needs no npm packages.
`tools/verify_audio_asr.py` re-checks the narration with the local Whisper model.

## Manual playtest (about 10 minutes)
1. Open the menu. Press **Round 1**. A picture and a clue with a blank appear; **no word text**. Press **Hear it**, **Slowly**, **Silly sentence**.
2. Type a wrong spelling and press Enter. You get a "whoops" sound and a hint about which letter is tricky.
3. Press **Hint**, then spell it right. The card says "Got it with a hint" (not "by yourself").
4. On the next card press **Show / Study**, read it, press **Now try it from memory**, and spell it. It says "after studying".
5. **Skip** a card. Finish five cards: fanfare, confetti, and an honest "N of 5 by yourself" summary.
6. Refresh the page. Your dots are still there. Open **Quick Review** and see only the words that needed help.
7. Turn off **Sound effects** and play a card (silence). Turn on **Calm mode**. Try the page on a phone.
8. **Reset my progress** and confirm the dots clear.

## Files
`words.js` (the 20 words, jokes, clues, honest notes) / `engine.js` (scoring, progress, no DOM) / `views.js` (pure HTML templates) / `app.js` (controller) /
`art.js` (original SVG scenes and Professor Potato) / `sfx.js` / `voice.js` / `storage.js` / `assets/audio/` / `tools/` / `tests/`.

## Teaching claims
Notes on the cards are labelled `word-specific` (just the letters of this word) or `supported general pattern` (splitting into word parts, supported for reading by
LIT-01 p.26). **No spelling rule is taught.** PR #3 (the unreviewed rule inventory) is not used. "Sound chunks" are dictionary-style syllables meant as a
pronunciation aid; they were written by Anna and not checked against a source.
