# Landing-page manifest (staged 2026-11-16, not pushed)

For Flo's one landing page (`swosu-computing` `/show-your-work/`). Every link target lives in this repo, served by GitHub Pages with relative paths under `wordwild/` and `sidecar/`. Repo-relative paths below; the live URL is `https://jeremy-evert.github.io/oeqa_spell_roller_public/<path>` once published.
Status: **ready** (done and audited), **needs scrub** (needs a human read or a decision), **not ready**. Nothing is "not ready". Jeremy's decisions are in `sidecar/DECISIONS_2026-11-16.md`; the only open question is `sidecar/questions/Q05_private_branch_test_note.md` (FYI).
Audit receipt: `sidecar/runs/2026-11-16_wordwild_public_export_receipt.md`. Roll and Read `index.html`, `LICENSE`, `README.md`: unchanged. `CHECKLIST.md` still has **28** tick items (I added only an unticked "two-minute version" line, so the course page's 28 ticks stay in sync).

## 1. Sidecar structure
| Link | What a student sees | Status |
|---|---|---|
| `sidecar/README.md` | One screen: product outside, process inside, a file tree, four rules, three real pairs | ready |
| `sidecar/prompts/041_spelling_memory_writers_room.md` ↔ `sidecar/reports/041_spelling_memory_writers_room_report.md` | A prompt that was **redirected**: better than round one, then a review found wrong facts and a planted idea | ready (scripted scrub + audit; a human read of the 41 pair is still wise: it quotes AI-written jokes) |
| `sidecar/prompts/042_final_list14_story_package_for_builder.md` ↔ `sidecar/reports/042_final_list14_story_package_for_builder_report.md` | A prompt that **went well**: deliverables, validator, honest labels | ready |
| `sidecar/prompts/045_finish_kokoro_and_arcade.md` ↔ `sidecar/reports/045_finish_kokoro_and_arcade_report.md` | Finish line, protect existing work, real test results, "not verified" | ready |
| `sidecar/questions/` (Q05 only; Q01-Q04 resolved in `DECISIONS_2026-11-16.md`), `sidecar/runs/` (receipt), `sidecar/PLAN_show_your_work.md` | Questions waiting on a person; a receipt with counts; the plan | ready |

## 2. Unit tests (run from `wordwild/`)
One command for 99 JavaScript tests: `cd wordwild && node --test`. Real result on the staged export: **tests 99, pass 99, fail 0**. No private data is read.

| File (under `wordwild/`) | Tests | What it checks | Needs |
|---|---:|---|---|
| `flashcards/tests/words.test.js` | 7 | Exactly 20 words, in order, equal to `content/list14_words_v1.json`; no duplicates; two review words; each has a sentence containing the word, a clue and a note status | node |
| `flashcards/tests/engine.test.js` | 22 | Flashcards rounds, scoring and hints | node |
| `flashcards/tests/views.test.js` | 10 | Pure views never print the answer before an attempt | node |
| `flashcards/tests/storage_audio.test.js` | 5 | Safe local storage and audio controls | node |
| `tests/shared_progress.test.js` | 16 | Shared-progress contract: whitelisted events, no raw spellings or names | node |
| `tests/printer_engine.test.js` | 16 | Help ladder and honest scoring (alone / retry / assisted / revealed / skipped) | node |
| `tests/printer_model.test.js` | 5 | Printer builds parts; badges | node |
| `tests/printer_content_views.test.js` | 15 | Content package loads; views hide answers and leak no target words | node |
| `tests/test_validate_list14_content.py` | 15 | The content validator catches 14 deliberately broken copies | `python3 -m unittest discover -s tests -p 'test_*.py'` |
| `tests/validate_arcade.mjs` | script | Arcade config: 5 tiles, relative local paths, workshop states, accessibility hooks | `node tests/validate_arcade.mjs` |
| `tools/validate_list14_content.py` | script | 20 words, 42 jokes: ids, targets, clue leaks, narration contains the word | `python3 tools/validate_list14_content.py` (0 errors, 0 warnings) |
| `tests/arcade_browser_smoke.mjs` | script | Real browser: absent/ready game doors, keyboard, 375px, no off-origin requests | `node tests/arcade_browser_smoke.mjs` (Chromium) PASS |
| `flashcards/tools/e2e.mjs` | script | Real browser play of Flashcards | local server + Chromium: **42/42** |
| `tools/e2e_printer.mjs` | script | Real browser play of second-edition printer, all 20 words, 375px, keyboard, mute, two ports share nothing | Chromium: **72/72** |

**No tests:** the first printer (`game/`) has none. Not tested at all: touch screens, Firefox, Safari, Android, iOS. Two tests were changed for the public copy (see the receipt); both changes are commented in the files. Full command lines are in the receipt.

## 3. Prompts (scrubbed set, each paired with its report)
Same three pairs as section 1. Suggested order for the page: **041 (what went wrong)**, **042 (what went well)**, **045 (honest testing)**. Also `wordwild/evidence/example_prompt_finish_audio.md` and `wordwild/evidence/report_audio_completion.md`: a condensed, teaching-sized version of the 045 pair. Status: ready (pending Flo's review of the diff). Raw `missions/`, `PLAN.md`, `research/` and the evidence cards stay private.

## 4. Games (all relative links, no network except localhost per `PRIVACY.md`)
| Game | Path | One line | Icon idea | Status |
|---|---|---|---|---|
| Arcade (front door) | `wordwild/` | Pick a game; three Play doors and two "In the workshop" doors | arcade cabinet | ready |
| Professor Potato's Flashcards | `wordwild/flashcards/` | Hear a silly sentence, spell the word | stack of cards / potato | ready |
| Impossible 3D Printer, first edition | `wordwild/game/` | Spell words to feed the printer | 3D printer | ready (loads and renders; **not played through**, no tests) |
| Impossible 3D Printer, second edition | `wordwild/printer-v2/` | Help Me ladder, honest scoring, builds a robot, rocket or castle | printer with a rocket | ready |
| Grown-up corner | `wordwild/shared/progress.html` | See, copy or erase saved progress | clipboard | ready |
| Roll and Read (existing) | `index.html` (repo root) | Phone spelling game, unchanged | a die | ready |

**Play-test:** served the repo under a folder named `oeqa_spell_roller_public` on a local static server. All six paths returned 200; the arcade rendered 3 Play and 2 workshop cards. Real-browser scripts played Flashcards (42 checks) and the second printer (72 checks: all 20 words, keyboard, 375px, mute/stop). I did **not** click through the first printer by hand beyond confirming its home screen renders, and nothing was tried on a phone or a touch screen. I searched all code for `http(s)://` addresses: none other than localhost.

## 5. The story
`wordwild/STORY.md`: ten short phases from idea (Nov 15) to going public (Nov 16), with a "what went wrong" list and links to the prompt/report pairs. Sources: git history, prompt and report numbers, the evidence-card scorecard (described, not published). **Status: ready**: the child mention is approved (Decision 4); no names.

## 6. Your turn
`wordwild/HOW_TO_DO_THIS.md`: ten steps from "pick one small thing" to "know how to take it down", marks where AI helps and what a person must check, links to `CHECKLIST.md` and to the sidecar pattern. Status: ready.

## Also in `wordwild/` (evidence set Flo asked for)
`README.md`, `HOW_IT_WAS_MADE.md` (who wrote what: updated per Decision 2), `ASSETS.md` (word list credited to the school; Kokoro voices-file license verified, Decisions 1 and 3), `PRIVACY.md`, `KNOWN_LIMITS.md`, `AUDIO.md`, `evidence/`. Unlicensed items left out: none found; the private curriculum file, research cards (they quote books), missions, `PLAN.md` and raw prompts 040/041 chat transcripts were **not** copied.
