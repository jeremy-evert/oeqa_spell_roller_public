# Prompt 042: Final WordWild List 14 Comedy and Learning-Content Handoff

**Copy this entire assignment into Claude Code on the build machine.**  
**Purpose:** Finish editorial work for **all 20** words and deliver a clean, testable content package to the game builder. **No more broad external comedy contests, research spirals or final artwork.**  
**Status:** Written brief. Claude's outputs still require Jeremy's approval before becoming default child-facing content.

---

## BEGIN CLAUDE CODE ASSIGNMENT

You are **the lead comedy editor, literacy-safety reviewer and content-packager** for WordWild. You have already shown that you can write comedy that an imaginative third-grader enjoys. Now we need to **finish and ship the writing to the builder**, not spend another evening auditioning hundreds of lines.

**Work in `<private repo>` on a new isolated branch or worktree from the current `origin/main`. Never switch or reset Codex's active the home laptop worktree, overwrite existing Flashcards, mutate PR #4/#5/#7/#8, or merge other people's branches.** Read the *actual file contents* before selecting/editing anything.

### 1. Inputs in priority order

1. **`docs/design/second_attempt/failure_report_002.md`** and `quick_audit_002.md`: failure modes, candidate shortlist, STOP-level sound-versus-letter errors, and recommended 0–20 editorial rubric.
2. **`docs/design/list14_spelling_feature_map_review_draft.md`**: all twenty correct spellings and candidate letter targets, plus flags for unreviewed phonics rules.
3. **`docs/design/second_attempt/`**: the **six full** ChatGPT/Claude Opus A/B/C sets (20 words apiece) and **nine five-word** DeepSeek/Grok/Gemini pilots. That is 165 submitted word entries; treat them as candidates, not automatically correct lessons. Give particular attention to Claude Opus B/C, ChatGPT C, and the best Gemini A visual ideas, while remaining willing to choose any genuinely stronger joke.
4. **`docs/design/`** older external comedy submissions and original Flashcards scenes: salvage exceptional jokes with real child humor, but **do not confuse fun meaning scenes with spelling-specific aids**.
5. **`prompts/041_spelling_memory_writers_room.md`**, `missions/004_rule_first_exposure.md`, `missions/005_shared_profiles_progress.md`, `missions/006_printer_v2_claude_lead.md`, and `sidecar/TASKS.md`: educational safety, future mechanics, local progress, and ownership.
6. Review PR #7 (private repo) Story Bible v2, including its alternatives and `tools/lint_story_bible.py`, if the content isn't already available in main. Inspect without merging or overwriting work.

**Canonical exact list/order:** Supper, Number, Over, Ladder, Sister, Spider, Soccer, Thunder, Tiger, Chapter, Afternoon, Scattering, Whispered, Understand, Newspaper, Butterfly, Upstairs, Staring, Animal, Another. `Upstairs` and `Staring` are also List 13 review words.

### 2. Make FINAL EDITORIAL CHOICES, not another generation exercise

For **each of the 20 words**:
- Pick and **polish one strongest default narrated comic spelling-memory aid**. The scene must be vivid, concise, laugh-worthy aloud, accurate for the word's meaning, and tied *directly* to **exact letters/order/count, a legitimate word comparison, or a genuinely meaningful part**. Its comic consequence should depend on that target feature, not a random burp glued to a spelling lecture.
- Pick and **polish one clearly different alternate memory approach** (for example, visual count versus rhyme family, or spoken rhythm versus a real word transformation). Two genuinely good choices beats three nearly identical jokes. **Optional third** only if it is truly distinct and excellent. Minimum **40 polished versioned story variants** across 20 words.
- Feel free to **write a completely new winner** when the existing candidates are flat. Prioritize originality and coherent comic timing over which model wrote it. Avoid overuse of office paperwork, generic animal hats, complicated abstract letter-shape parades, and relentless full-alphabet chanting. A bit of booger, burp or underpants comedy is welcome when actually funny.
- Use Jeremy's **two peas / two P's at supper** and `up + stairs` with `air` as excellent reference standards, but do not force them into every mode. Parent-proposed lines can be selected if they win.
- Do not fabricate a meaningful root or etymology, or confuse **phonemes** with **letter names**. `supper` has two written P's but not two separately pronounced /p/ sounds. `ladder` has two D's, not two distinct /d/ phonemes. `spi` vs `spy` is an **orthographic** distinction, not a proof of different vowel sounds. The **g** in `tiger` is **hard /g/**. `scatter + ing` keeps its existing `tt`; `stare + ing` removes the final `e`. `butterfly` and `understand` are not transparent literal meaning compounds. Explanations that fail these checks must be repaired or rejected, however funny.
- Clearly distinguish **(i) silly mnemonic only**, **(ii) verified observation about THIS word's letters**, and **(iii) proposed general phonics/morphology rule NOT YET APPROVED**. General rules and general-rule MC questions stay in a **separate review-only bank** until sourced and educator-approved. Do not let this block the game-ready word-specific jokes and study checks.

### 3. A useful, complete learning interaction for EVERY word

Supply content that lets the builder recreate the support the child actually uses in original Flashcards:

1. **Primary answer-hidden clue:** meaning/context with no printed target word and no hidden DOM/SVG/ARIA answer leak. If the word has reasonable synonyms (*dinner* for supper, *football* for soccer), say the spoken target word can disambiguate instead of falsely promising an unambiguous definition.
2. **Second stronger clue:** genuinely different context, not a paraphrase of the first.
3. **Approved narrator prompt:** exact target word for on-demand **Play Word / Slow Repeat** and a short, natural **Funny Sentence** audio script, suitable for original Flashcards' locally rendered **Kokoro `af_heart`**. Do not synthesize voice yet. Text-only fallback, Stop/Mute, no unpleasant browser TTS autoplay.
4. **Help A / Help B:** short accessible descriptions of the primary and alternate spelling mnemonic, each with precise letter mapping and a `[ART TODO: ...]` placeholder. Give one simple **tap/build/transform** action that practices the letter target *after* the learner deliberately requests study/help.
5. **Progressive help ladder:** listen again; meaning clue; pronunciation/chunk help only if linguistically honest; letter-target hint; optional first letter/partial letters; show full correct spelling → hide it → spell anew; skip. Any spelling-exposing help marks that attempt **assisted**, not independent.
6. **One word-specific mini-check** with 2–3 options, correct choice and gentle feedback. The mini-check must probe exact letters/order/pattern the joke targets. It is **not** a scored general phonics rule quiz or proof of unassisted spelling mastery.
7. **Post-answer replay**: default or alternate scene, optional `👍 Funny!`, separate `👍 Helped me remember!`, and `Try another joke`. Those reactions are voluntary preferences, **not** learning outcomes.

Keep the primary/alternate variants **stylistically different** when possible: **visual letter count/shape**, **sound/rhyme/chunk memory**, or **true compare/build/transform**. Do not require all three for every word or fabricate a rule to satisfy a category.

### 4. Deliver the actual builder-ready package, all 20 words NOW

Commit the following to your **own new branch**:

**A. `docs/design/list14_final_story_bible_candidate.md`**

For all twenty words, in order, a friendly human-readable book with:
- correct meaning and exact learning target;
- primary/secondary answer-hidden clues and explicit “spoken word disambiguates” notes where necessary;
- **default and alternate** final polished comedy lines, their joke IDs/source and why each teaches the named letters;
- corresponding image placeholders and click/tap payoffs;
- actual playable progressive hint text and mini-check question/feedback;
- spelling/phonics caveats, reviewed word observation versus unreviewed rule;
- a short scene-quality verdict: why this version won (one sentence, not a debate).

**B. `content/list14_words_v1.json`**

Valid UTF-8 JSON. Exactly **20 objects**, no placeholders or `TODO` for required **text**; `[ART TODO: ...]` is permitted for unfinished image assets. Suggested stable contract:

```json
{
  "schemaVersion": 1,
  "listId": "grade3-list14",
  "words": [
    {
      "id": "supper",
      "word": "supper",
      "isReview": false,
      "meaning": "evening meal",
      "clues": {
        "primary": "A family meal near the end of the day.",
        "secondary": "The meal after lunch that families might share at home."
      },
      "audio": {
        "word": "supper",
        "slowWord": "supper"
      },
      "spellingTargets": [
        {"kind": "letter_count", "letters": "pp", "zeroBasedStart": 2, "status": "word_observation"}
      ],
      "jokes": [
        {
          "id": "list14-supper-primary-v1",
          "mode": "visual_letter",
          "narration": "REPLACE WITH A FINAL, POLISHED FUNNY SENTENCE",
          "spellingCue": "REPLACE WITH A PRECISE pp MEMORY MAPPING",
          "artPlaceholder": "[ART TODO: ...]",
          "tapAction": "REPLACE WITH A SMALL LETTER-BASED PAYOFF",
          "provenance": "source file, provider or original editorial rewrite",
          "status": "candidate_parent_review"
        }
      ],
      "help": {
        "pronunciationNote": "",
        "patternHint": "The middle uses two written P letters.",
        "partialLetterHint": "su__er"
      },
      "miniCheck": {
        "question": "Which spelling uses exactly two P letters?",
        "options": ["super", "supper", "suppper"],
        "correctIndex": 1,
        "feedback": "Supper uses exactly two P letters."
      },
      "generalRuleRefs": []
    }
  ]
}
```

The example deliberately contains `REPLACE` markers so you know the schema; **your committed package must contain real final writing, no example text**. Adapt schema minimally if useful, but **document the final key contract** and validate it. Include both variants in `jokes`, and the audio line may be taken from each variant's `narration`. Do not generate forty separate audio files yet. **Each joke ID must be stable, unique, and versioned**; any future text revision bumps its version.

**C. `tools/validate_list14_content.py`** (or Node equivalent, with no new external dependencies)

Automated checks: exact 20 canonical targets and review flags; two distinct jokes per word; unique IDs; required nonempty text; correct `spellingTargets` substring/index matches; primary and secondary **pre-answer clues** never contain that exact target; full correct word in each *post-answer* narration; valid mini-check answer and options; parseable JSON; no accidental unapproved `generalRuleRefs` displayed as approved. Note that ambiguity, funny quality, phoneme accuracy and clue leaks through pictures/ARIA require additional human/browser review. The validator must exit nonzero on failures.

**D. `reports/042_final_comedy_handoff.md`**

Compact table of **20 rows**: word, selected default source/technique, alternate source/technique, precise letter focus, rule-review status, and any flagged editorial uncertainty. Briefly list what you discarded and why, what you fixed from Failure Report 002, tests you ran, what remains for Jeremy to approve, and exact instructions to hand the JSON to Claude's gameplay builder / Codex's asset team.

### 5. Editorial and delivery rules

- **This is a completion sprint, not an endless audition.** No new 180-joke run, no new research project, no waiting for another model to rewrite everything. Read, decide, polish, validate, ship the package.
- It must cover **all twenty now**. Do not stop at the five-word pilot. Preserve the pilot findings as an early quality checkpoint, but the final content includes the whole list.
- This assignment is **writing/content/validation only**. No game engine, rendered art, audio generation, web service, account, backend, cross-device sync or PR merge.
- Keep **original `flashcards/` fully intact**; original Printer `game/` also stays untouched. The future five game worlds and their versions can all consume this content library, with different joke choices and play mechanics.
- The final JSON must be **usable immediately by a builder using labeled artwork placeholders**. Correctly hide full spellings in pre-attempt UI: source JSON itself necessarily includes answers, so do not claim it is absent from JavaScript or view-source.
- Run validation, **fix issues yourself**, `git diff --check`, inspect the changed paths, commit and push your branch, then open **one PR** requesting Jeremy's final editorial approval. Do **not** merge it yourself.
- Mark all text `candidate_parent_review`, not `child_approved`, because the child has not laughed at these specific variants yet. Do not invent learner results or claim a mnemonic has been scientifically demonstrated effective.
- Update `sidecar/TASKS.md` **only on your branch** to mark writing package complete and next owner **Claude game builder (placeholders first)**, then **Codex/Luna visuals**, then **Jeremy/the child polish**. Don't overwrite main's tracker or active arcade files.

### Definition of Done

The branch has **20 complete words, at least 40 polished and genuinely distinct mnemonic jokes, playable help text for every word, precise spelling mappings, one optional letter mini-check per word, accurate rule labeling, versioned IDs, valid JSON, passing validator, and a PR ready for the builder**.

**Your final message:** PR URL, files changed, test command/results, five best comic samples, the number of words/variants covered, and what (if anything) is still a parental or literacy approval decision. Make it possible for Jeremy to say **“ship it to the builder”** without commissioning another creative round.

**North star:** A child who gets stuck presses **Help Me** and finds a *funny reason to remember the letters*. Then the answer disappears, and the child gets to try again. Fun enough to replay; honest enough to teach.

## END CLAUDE CODE ASSIGNMENT
