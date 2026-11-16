# How WordWild was made (what we used, how, and who checked what)

**Short version:** a parent directed the project and played it with their child; AI coding assistants wrote most of the code, wording and sound; a person approved and tested what shipped. The AI outputs are **not** expert-reviewed.

## Who did what
Roles are from the project's records. Split confirmed by the project owner on 2026-11-16.

| Who | Role |
|---|---|
| **Jeremy Evert** | The idea and the child-facing goals, direction and every decision; played the games with his child; supplied a few starting premises (the sneezed-peas supper scene; the up + stairs + air idea for *upstairs*); approves what ships |
| **The school** | The weekly third-grade spelling lists. The 20 words and their order come from there. Not involved in building or reviewing this project |
| **Claude Code** (Anthropic's coding assistant) | Wrote the first Flashcards, the final content package and validator, the second-edition printer, the audio pipeline, the tests and these notes |
| **Codex** (OpenAI's coding assistant) | Built the arcade chooser and the first printer game, and some planning and review work (a finer split is in the git history) |
| **ChatGPT** (OpenAI) | Wrote the writers'-room assignments and the review reports, and contributed joke sets |
| **Claude** (Anthropic chat) | Contributed joke sets in the writers' room (three briefs) |
| **Gemini** (Google), **Grok** (xAI), **DeepSeek** | Contributed joke sets in the writers' room (smaller pilots). Raw output was reviewed; most was discarded |
| **Kokoro-82M** (local text-to-speech) | Every voice clip, generated locally; no web voice service |

## How it was directed
Work moved in small, checkable steps: a written assignment, a build on its own branch, tests, a report, then human review. Examples of the assignment and report style are in [`evidence/`](evidence/).

## What a person checked
* Played Flashcards and the printer; chose which jokes to keep.
* Heard the first narration samples and approved the voice.

## What a person did NOT check
* The 38 later narration clips were machine-checked (speech-to-text), not all listened to.
* Pronunciation notes and phonics rule candidates have not had a literacy review.
* Two wrong notes slipped through an earlier version (tiger's hard "g", soccer's two C's). We found them while checking and corrected them, and recorded the correction in the content file. Lesson: AI-written facts need a human check, and mnemonic is not phonics.

## Things we changed after finding problems
* UI labels such as "Help ladder" gave away target words; renamed.
* Joke text that showed misspellings or taught "two letters = two sounds" was removed.
* Narration the voice read badly ("THHH", "liger") got voice-only respellings, recorded in `tools/narration_voice_overrides.json`.
