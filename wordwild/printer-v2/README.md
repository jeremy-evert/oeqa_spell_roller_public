# The Impossible 3D Printer, Second Edition (first playable)

A static HTML/CSS/JS spelling game for the 20 List 14 words. No build step, no network, no accounts. **All jokes are candidates waiting for a parent's approval, and all pictures are placeholders.**

## Run it

From the repository root (the folder that contains `content/`, `printer-v2/` and `shared/`):

```bash
python3 -m http.server 8780 --bind 127.0.0.1
```

Open **http://127.0.0.1:8780/printer-v2/**. Do not open `index.html` as a file (the browser blocks loading the word list). Serve this folder with any static file server, for example `python3 -m http.server 8780 --bind 127.0.0.1`.

Use the **same address every time**: progress is saved per browser and per exact address (`127.0.0.1:8780` and `localhost:8780` are different places).

## How a round works

1. Pick a printer (Wobbly Robot, Tiny Castle, Bouncy Rocket) and five words (Round 1 to 4, Surprise, or Tricky words).
2. Each word: hear it (Play word, Say it slowly, **Read the sentence**), read the clue, type the spelling. **HELP ME** is always visible, before any mistake.
3. Every finished word prints one part of the creation. Skipped and helped words print too; only a ★ sticker shows a word spelled all by yourself.
4. After the word: the funny sentence, a second joke (Trick A/B/C), 👍 Funny!, 👍 Helped me remember!, and an optional quick check.
5. After five words: a finished creation and a break.

## Honest scoring (one result per word)

| Result | What happened |
|---|---|
| independent | Correct on the first typed try. Listening, slow audio and the second clue are allowed; nothing that shows letters. |
| after_retry | Correct on a later try, no letter-showing help. |
| assisted | Correct after "How to say it in beats", "What to look for", or "Show some of the letters". |
| after_reveal | The word was shown (a funny memory trick or "Just show me"), then hidden, and the child spelled it. |
| skipped | Skipped for now. No penalty. |

A word stays on the **Tricky words** list until its latest result is independent. The quick check is practice with help and never changes a word's result. Thumbs are preferences, not learning evidence. **No spelling rule from the review-only bank is taught or quizzed.**

## Sound

- Narration is **only** the local Kokoro `af_heart` voice. There is no browser-voice fallback. If a clip is missing the game says so and stays playable as text.
- Word and slow clips (40 files), plus **20 pre-spelling contextual sentence clips**, are reused unchanged from original Flashcards (`af_heart`; provenance in `assets/audio/manifest.json`). The **Read the sentence** button is available on the first card, plays audio only, and does not reveal written letters or invalidate independent spelling. The funny spelling-memory narration remains behind deliberate Help/study or completed attempts.
- Joke sentences: **only 4 audition clips exist** (supper A and B, tiger A, upstairs A). Render the rest after a human has listened: `tools/generate_narration.py` (see its header).
- One **Sound on/off** switch silences narration and effects; **Stop sound** stops narration immediately. Effects are quiet and start only after a click or tap.

## Progress (`shared/local_progress.js`)

Events are stored in `localStorage` under `wordwild.shared.v1`: a preset-animal player with an opaque id, the word, the result, the kinds of help used, the attempt count, and voluntary 👍 events. Never raw typed answers or names. Same browser and same address only; a different port keeps separate progress. Grown-up corner: `/shared/progress.html` (view, copy, erase).

## Tests

```bash
node --test                              # 54 unit tests (plus 15 Python tests for the content validator)
node tools/e2e_printer.mjs --shots DIR   # 69 checks in real headless Chromium (needs Node 22+ and chromium)
python3 tools/validate_list14_content.py # the content package validator from PR #11
```

`?dev=1` shows joke ids for debugging.
