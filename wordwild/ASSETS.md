# Assets, credits and licenses

Rule used: **every asset has a license line here. If it is unknown, it does not ship.** This is project guidance, not legal advice.

| Asset | What it is | Where from | License / terms | Status |
|---|---|---|---|---|
| Game code (JS, HTML, CSS) in `arcade/ flashcards/ game/ printer-v2/ shared/ tools/ tests/` | Hand-directed, AI-written code | Written for this project (see HOW_IT_WAS_MADE.md) | BSD 2-Clause (repository `LICENSE`), copyright Jeremy Evert | Ships |
| Content `content/list14_words_v1.json` | 20 words, clues, help text, 42 memory-trick jokes, review-only rule bank | Written for this project with AI drafting and the owner's direction | BSD 2-Clause | Ships; marked candidate, unreviewed |
| 20 spelling words | Common English words from a third-grade weekly list (List 14) | The child's school, via the project owner | Single common words are not copyrightable. Only these 20 words are used, not the whole list document. Credited to the school; our clues, sentences and jokes are our own | Ships (owner confirmed 2026-11-16) |
| Audio, 162 `.mp3` | Word, slow word, sentence and joke narration | Generated locally with **Kokoro-82M** (by hexgrad), voice `af_heart`, through `kokoro-onnx` (by thewh1teagle) | Model weights: **Apache-2.0** (model card, checked 2026-11-16). `kokoro-onnx`: **MIT** (its LICENSE and README). The voices file is style vectors from the same model; see Verification below. Generated clips are original output | Ships |
| Audio, 20 `.wav` in `game/assets/audio/clues/` | Clue narration for the first printer | Same Kokoro pipeline | Same | Ships |
| Fonts | None bundled. Pages use the visitor's system fonts | n/a | n/a | n/a |
| Images and icons | None bundled. Art is inline SVG/CSS and emoji characters drawn by code | Project | BSD 2-Clause (emoji glyphs come from the visitor's system) | Ships |
| Sound effects | Generated at run time with the Web Audio API | Project code | BSD 2-Clause | Ships |
| Build-time tools (not shipped to players) | `faster-whisper` (speech-to-text screening), `ffmpeg`, `espeak-ng` and `phonemizer` (GPL-3.0, used by the voice tool at build time) | Public packages | Their own licenses. Nothing from them is copied into this repo; only their audio output is | Documented |

## Not included on purpose
Private planning folders, research notes, internal mission files, and any real person's data. Third-party books and course materials are not used.

## Verification of the Kokoro voices file (2026-11-16)
Checked upstream, online:
* `hexgrad/Kokoro-82M` model card: `license: apache-2.0`, "Apache-licensed weights ... deployed anywhere from production environments to personal projects."
* `thewh1teagle/kokoro-onnx`: repository LICENSE is MIT; README "License" section: *kokoro-onnx: MIT, kokoro model: Apache 2.0*.
* The release page for the model files describes `voices-v1.0.bin` as "npz (numpy) key value pairs of style vectors" of the 26 Kokoro voices and states **no separate license** for it. Our copy matches the release's published sizes (`kokoro-v1.0.onnx` 325,532,387 bytes; `voices-v1.0.bin` 28,214,398 bytes). GitHub gave no checksum, so the match is by size only. Local SHA-256: model `7d5df8ec...36a6c5`, voices `bca610b8...f7d`.
* Conclusion: the voices come with the Apache-2.0 model; we found nothing restricting use or output. This is our reading of public pages, not legal advice. The model card also credits some CC BY training data (other languages); we credit Kokoro and its authors here.

## Open items
* A precise lawyer-level review of the voices file was not done; if you need certainty, ask the Kokoro authors or drop the audio.
* No bundled font, image or photo exists, so nothing else needs a credit.

## Math Mayhem and Super Sevens (added 2026-11-16)

| Asset | What it is | Where from | License / terms | Status |
|---|---|---|---|---|
| Code in `math/` and `sevens/` | Hub page and the 7s times-table game (engine, sounds, confetti, three looks) | Hand-directed, AI-written for this project | BSD 2-Clause | Ships |
| Questions, think hints, rhymes, fun facts | Written for this project. The rhymes for 0 to 4 are the owner's own words; the rest were written with AI help | Project | BSD 2-Clause | Ships; not teacher-reviewed (see KNOWN_LIMITS.md) |
| Sound effects | 16 effects in each of three looks (48 in all), synthesized live with the Web Audio API (`sevens/sounds.js`); no audio files, no sampled sounds. The barbershop chords are oscillators, not recorded voices | Project code | BSD 2-Clause | Ships |
| Confetti, decorations | Drawn by code on a canvas; emoji characters come from the visitor's system | Project code | BSD 2-Clause | Ships |
| Fonts, images, libraries | None | n/a | n/a | n/a |
