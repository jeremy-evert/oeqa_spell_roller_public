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

## Math Mayhem and Super Sevens (2026-11-16)
* **What a person did:** asked for the game for a third grader; wrote the first rhymes (for 0 to 4) in the fill-in-the-blank style; chose the extended 0 to 20 range, the three looks, the medal idea and the 90 / 75 / 60 second challenge; played it on a phone and reported real problems (the phone keypad covering the Check button, the Skip button too near Check, clues that did not teach a method); decided what stays out (no child's name on a public page).
* **What the AI did:** wrote the code, the other rhymes, the questions, the think hints and fun facts; wrote the tests; ran the game in a headless browser at phone width.
* **What a person did NOT check:** the rhymes and hints have not had a teacher's review; the sounds were judged by one listener.
* **Things we changed after finding problems:** the arcade menu broke when a sixth game was added because the page expected exactly five (fixed, with a test); the phone keypad hid the Check button (replaced by an on-screen number pad); Skip sat where a thumb lands after Check (moved to the top); a clue showed the answer straight away (now a Think step first, then the full help).
