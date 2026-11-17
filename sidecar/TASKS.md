# Tasks for WordWild

Open work for the WordWild games (spelling games, Math Mayhem, Super Sevens). One task per heading, newest at the top. Each task says why it matters and
what would show it is done. Honest status only: "not started" means not started.

## T1. Make the games helpful for people living with cognitive decline (added 2026-11-17)

Status: **research done, awaiting the owner's decision on a calm mode** (2026-11-17). Steps 1 and 2 are complete; step 3 is a recommendation only, nothing is built. Report: [`reports/046_cognitive_research_report.md`](reports/046_cognitive_research_report.md). Owner decides; an AI assistant did the research.

**Why:** The owner's request: "The games should also help with people struggling with cognitive decline. So we should research that as well." The same
games that help a third grader practice facts may also suit adults who want gentle daily mental activity, and older players or their caregivers. We should
build from what is known, not from guesses.

**Steps**
1. **Research first (gathering only). DONE 2026-11-17:** 21 files gathered and listed in a private manifest (the strongest sources were blocked; see the report's limits). Collect free, legal, open-access material, the way the multiplication research intake was done: systematic reviews
   and guidelines on cognitive training and cognitive stimulation for older adults and people with mild cognitive impairment or dementia; dementia-friendly
   and accessible game and interface design (large targets, contrast, simple layouts, errorless and low-stress feedback, avoiding time pressure); and
   caregiver-facing practice guides. Record title, authors, year, URL, license and a one-line reason for each. Files stay local; nothing is ingested into
   the RAG without the owner's yes. Say plainly where evidence is thin or mixed.
2. **Read the games against it. DONE 2026-11-17** (code and live pages; no phone or person test): see the report's per-game tables. For each game, list what already fits and what works against it. Known tension to check first: Super Sevens' timers,
   clue time penalties, flashing alert colors and streak pressure; sound-heavy effects; small tap targets on some screens; text size.
3. **Propose a calm mode. RECOMMENDATION WRITTEN, NOT BUILT** (report 046): A setting (not a new game) that could include: no clock, no penalty for help, larger text and buttons, slower or no animation,
   quieter or no sound, high contrast, gentle wording on a wrong answer, and a short, predictable session. Decide with the owner before building.
4. **Content that suits adults.** Word lists and prompts that are familiar and age-respectful, not childish. Consider reminiscence-style prompts.
5. **Test with real people, with consent.** Ask a few older adults or caregivers to try it and say what helps. Collect no health information in the games.

**Rules for this task**
- **No medical claims.** Do not say the games prevent, treat, slow or improve any condition unless the research we gathered supports that exact claim, and then
  cite it. "Gentle, enjoyable mental activity" is a claim we can make; "protects the brain" is not.
- **No health data.** The games stay local-only. Do not add a field, score or log that records anyone's health or diagnosis. Keep `PRIVACY.md` true.
- **No names or personal details** of any person on public pages (see `wordwild/PRIVACY.md`).
- Add what we learn to `wordwild/KNOWN_LIMITS.md` (what is untested, who has and has not tried it).

**Done when:** a research manifest exists with at least a dozen sources across the three topics; a short plain-language report says what the research
suggests and where it is weak; a written list maps each game to changes with a recommendation; and the owner has said yes or no to building a calm mode.

## T2. Build a shared Calm mode (proposed, waiting on the owner's yes)

Status: **not started; needs the owner's decision.** Follows from T1 and report 046. One shared on/off setting that every game obeys: no clock (hide Super Sevens clock challenges and Stopwatch), no help penalty, no flashing, shaking or red alert tints, no ambient animation, sound off, larger text and tap targets (about 56 px or more), gentle wording, no streaks or partner scoreboard, short predictable sessions. **Done when** the owner has approved the design, it is built and tested in a real browser at phone width, `KNOWN_LIMITS.md` says what is untested, and no health data is stored anywhere.

## T3. Test Calm mode with a few consenting older adults or carers

Status: **not started; blocked on T2.** Ask them what helps and what annoys; write findings into `wordwild/KNOWN_LIMITS.md` without names or health details. No health information collected by the games.

## T4. Get the sources the research could not reach

Status: **not started.** The full WHO dementia risk-reduction guideline (second edition), the national dementia guideline text, the full critical review of brain-training claims, the full Global Council on Brain Health report, the National Academies prevention report, and the Cochrane reviews on cognitive stimulation, training and reminiscence were blocked or needed a login. Fetch them by hand or a permitted route, record terms, then re-check the report's evidence sections. No ingest without the owner's yes.

## T5. Adult-appropriate content (from T1 step 4)

Status: **not started.** Review word lists and prompts for an adult audience (familiar everyday words, reminiscence-style prompts) separate from the child-themed spelling and times-table content; drop mascot jokes on wrong answers in calm mode. No health claims.

