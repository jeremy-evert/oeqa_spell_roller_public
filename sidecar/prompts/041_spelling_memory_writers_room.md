# Prompt 041: Funny Spelling Memory Workshop — Letters First, Laughs Still Required

**Version:** 041-v1, November 15, 2026  
**Supersedes as experiment:** Prompt 040 (private file) (preserved for provenance; do NOT overwrite).  
**Grounded in:** Failure Report 001 (private file), List 14 feature map (private file), the [WWC K–3 guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/21), and [Reading Rockets: Spelling in Practice](https://www.readingrockets.org/reading-101/reading-101-learning-modules/course-modules/spelling/practice).  
**Owner:** ChatGPT creates first creative specification; Claude Code challenges instructional claims; Jeremy approves; the child supplies actual preference and independent spelling evidence.

## The critical change

**Old prompt:** Invent one memorable joke for the *meaning* of each word, then append a generic memory note.

**New prompt:** For each word, first choose a **real, specific, correct set of letters or word parts** that a learner is likely to confuse, then make those letters the star of the joke and the action. Offer **multiple different learning routes**:

- **A — Letter/shape/count visual comedy:** e.g. the two **P**eas in `su**pp**er`, two **D**ucks standing for `dd` in `ladder`. Make the actual letters visible after an intentional hint, not before an independent spelling attempt.
- **B — Sound, spoken rhythm, chunk dialogue:** a tiny dialogue with accurate word-specific sound and spelling chunks, a playful rhyme or alliteration that reinforces the *target letter sequence*, not merely the first sound. Do not invent pronunciation rules or make arbitrary chunk breaks into linguistic facts.
- **C — Compare/build/transform:** a correct contrast or real structure such as `super / supper`, `stare + ing → staring`, `after + noon`, `news + paper`, `up + stairs`. When the word has no vetted productive rule, make a truthful **word-specific letter puzzle**, not a fake compound.

Each creative route should contain a joke funny enough to read aloud three times. **A spelling-aiding illustration is not just a funny picture of what the word means.**

## Run plan: small pilot, then full list

1. **Pilot first:** three fresh model runs, mode A then mode B then mode C, each on **five words only**: `supper, ladder, spider, staring, upstairs`. These intentionally test doubled consonants, a potentially confused i/y, the final-e change, and transparent compound / embedded `air`. **Review results before 20-word runs.** Save outputs without removing failure cases.
2. **Scale only after the pilot passes:** run each mode on all 20 words with the same prompt. For one provider, that yields **60 genuinely mechanism-distinct candidates**, not 60 paraphrases of the same owl or squirrel. DeepSeek, Grok, Gemini and Opus are all eligible.
3. New chat/empty context per mode; do **not** paste other providers' jokes or earlier WordWild versions into an audition. Keep the target-feature map identical across providers so the comparison is fair.
4. Record provider, exact exposed model ID, sampling/temperature if accessible, whether the interface is browser or API, date and revision. Consumer chat model labels might not match API model IDs. No child names, personal histories or API keys in submissions.

## Copy-paste prompt

Copy from BEGIN to END. Change **`{{MODE}}`** to `A`, `B`, or `C`. Set **`{{SCOPE}}`** to `PILOT` for the first five target words or `FULL` for all twenty. Change **`{{PROVIDER_LABEL}}`** to the tool/model you're using. All required spelling targets are provided below; no repository access or web research is required for the creative model.

### BEGIN PROMPT

You are auditioning for **WordWild**, a funny, local third-grade spelling game. An imaginative 8–9-year-old likes belly laughs, boogers, underpants, burps, physical surprises, lively voices and memorable images. She also needs help with the **actual spelling** of words. We have already tested lots of silly jokes: many described the *meaning* but did NOTHING to help remember the letters. **That failure must not happen again.**

**Creative task:** For the exact spelling words below, produce **one original comic spelling-memory aid per target**, not just a definition joke. Before writing each joke, identify the actual letter sequence, doubled letter, sound-letter mapping, or properly checked meaningful word part the child should remember. **Make that feature indispensable to the funny scene.** A child should be able to point at the target letters after seeing the picture.

**Your assigned technique is `{{MODE}}`. Scope is `{{SCOPE}}`.**
- **A = PHYSICAL LETTER COMEDY.** Turn correct **letter shapes/counts/positions** into ridiculous objects or characters. Two actual letters become two peas, two ducks, or something independently invented. The visual gag MUST help reconstruct the correct spelling. Avoid twenty identical letter-people.
- **B = SOUND/CHUNK DIALOGUE.** Turn accurate parts of the *spoken and written* word into a memorable mini-dialogue, sound cue, safe rhyme, oral chant or alliterative exchange. Make the difficult spelling visible in an optional follow-up, not just the first consonant. A playful `“Sup?” “Per!”` style conversation could be a **written chunk memory trick**, but it is not automatically an accurate syllable/phoneme lesson.
- **C = COMPARE/BUILD/TRANSFORM.** Use a truthful contrast, actual spelling transformation, properly meaningful word parts or an honest word-specific build. A short comic consequence should follow the child moving or changing the letters. Do not invent an etymology or mislabel a random substring as a root. If there's no reviewed rule, explicitly say `WORD-SPECIFIC MEMORY TRICK` rather than producing a bogus “rule.”

**Scope selector:**
- If `{{SCOPE}} = PILOT`, output **exactly five** entries, in this order: 1 supper, 4 ladder, 6 spider, 17 upstairs, 18 staring. Use their original List 14 numbers.
- If `{{SCOPE}} = FULL`, output **exactly twenty** entries in the list order provided.

**Canonical List 14 and safe target-feature map** (these are writing targets, **not** blanket phonics claims):

1. **supper** — double **pp**; can contrast `super` vs `supper` after checking pronunciation/short-vowel explanation. Goal: remember 2 p letters.
2. **number** — written `num` and `ber` chunks, final `er`; **NOT** derived from `numb+er`.
3. **over** — first `o`, rest `ver`, written `er`; do not pretend `O+VER` is etymology.
4. **ladder** — double **dd**; two strong visible `d` shapes.
5. **sister** — `sis` and `ter` as *letter-memory chunks*, not transparent morphemes; female sibling who shares at least one parent.
6. **spider** — `spi` with **i**, NOT **spy**; initial `sp` sequence.
7. **soccer** — **cc** written together. No invented “two goals cause two c's” explanation or claim both C's make distinct sounds here.
8. **thunder** — initial **th**; exact visible sound/spelling sequence `th + under` is a memory chunk, not a literal semantic compound.
9. **tiger** — `ti` with long i, **g pronounced /g/ (hard g, NOT j)**, written `er` ending.
10. **chapter** — initial **ch** letter team; `chap` and `ter` as letter chunks; don't call `ter` a suffix.
11. **afternoon** — meaningful `after + noon`, with double **oo** in `noon`.
12. **scattering** — base `scatter + ing`; **tt** is already in `scatter` and is RETAINED, not newly doubled by `ing`.
13. **whispered** — `wh` beginning; `whisper + ed` past tense, with written **ed** regardless of the usual spoken final sound.
14. **understand** — visible `under` and `stand` spelling chunks; modern meaning is to comprehend, **not** literally stand underneath.
15. **newspaper** — meaningful `news + paper`.
16. **butterfly** — visible `butter + fly` chunks and `tt`; do NOT claim real butterflies are made of butter or that literal meaning proves the spelling.
17. **upstairs** — meaningful `up + stairs`; `stairs` contains visible **air** letters, `st + air + s`. Also a List 13 review word.
18. **staring** — written `stare + ing → staring`, removing final **e** from `stare`. **star** is visible in the result but the standalone word `star` has a different vowel sound. Also a List 13 review word.
19. **animal** — the full sequence `a-n-i-m-a-l`, possible syllable chunks pending review; no fake `AN+I+MAL` meaning parts.
20. **another** — exact written `a-n-o-t-h-e-r`, visible `an` and `other` as memory chunks; no unreviewed “compound word” rule.

**Additional parent inspiration, for understanding the assignment, not a script to copy verbatim:**
- “Dad blew **two P**eas out his nose at **supper**.” The peas cue the **pp**. **This is a mnemonic**, not the reason English spells supper with pp.
- “**Bears** have **ears**; **pears** have **ears** in their letters.” Both contain the exact written `ears` sequence; that does **NOT** mean `ear` has the same vowel sound in **ears**, **bears**, and **pears**. Do not invent a phonics rule from this. **Peaches** doesn't contain `ears`.
- “Going **upstairs** takes you up into the **air**.” This notices genuine `up + stairs` and **air** inside **stairs**. A staircase filled with AIR letter-balloons could give the child an exact letter puzzle.
- **Do not merely recycle these examples**, especially for supper. Pitch your own independent, equally precise visual or spoken idea.

**Mandatory learning design for EACH target:**
1. **Exact spelling focus:** list the exact grapheme(s)/letters being practiced, including count and placement. All target spellings must be accurate.
2. **Funny narrated sentence:** 8–30 words, contains the exact target word naturally, surprising and delightful as spoken language. It must be a **spelling-memory scene**, not just a meaning gag with a letter note bolted on.
3. **Memory mapping:** one sentence explaining how the comic action physically or verbally maps to the exact letters. If you cannot make the letters essential to the joke, abandon that concept and write a new one.
4. **Picture + tap:** a clearly drawable image and one child-triggered change that rehearses the target letters. Before the recall attempt, do NOT display the spelling in pictures/alt/accessibility labels; letter drawings are **only after deliberately opening help/study**.
5. **Meaning clue:** short, answer-hidden, specific; if several answers fit (e.g. `supper` vs `dinner`), rely on on-demand **spoken target word** rather than pretend the clue is unique. No written target word before the attempt.
6. **Progressive help:** (i) different concrete meaning context, (ii) on-demand word pronunciation/repeat in pleasant voice, (iii) word-specific mnemonic or *reviewed* pattern, (iv) first letter or exact partial letter aid **marked assisted**, (v) Show → Hide → Spell → Check with honest scoring. The child can ask for help **before failing**.
7. **Micro-check:** after studying, ask ONE fair question that targets the letter feature: e.g. “Which spelling has two p's?” with 2–3 visible options and explanation. This is a **spelling/mnemonic check**, **NOT** a quiz on a general phonics rule and **NOT** independent word mastery. Re-hide before later recall.
8. **Claim label:** `MNEMONIC`, `WORD OBSERVATION`, or `RULE CANDIDATE—NEEDS LITERACY REVIEW`. If a sentence refers to a general rule, include its exact scope, a counterexample or exception, and `NEEDS REVIEW`. Never state an unreviewed rule as fact.
9. **No hidden leaks:** the target spelling must not appear in meaning clue, pre-attempt visible art labels, hidden alt/ARIA or unassisted quiz wording. In a *deliberate hint*, some letters may be shown and the attempt is then flagged `assisted`.
10. **Different mechanisms:** prefer silly surprise and age-appropriate gross humor in moderation, but don't make every word about boogers. Favor distinctive sounds, acts, relationships and choices, with jokes easy to hear repeatedly.

**Output format:** Use numbered entries. For each entry write these fields, one line each:
- `Word / target letters:`
- `Narrated memory joke:`
- `Why this helps spell it:`
- `Picture and tap:`
- `Answer-hidden meaning clue:`
- `Meaning hint + spoken/chunk hint:`
- `After-help mini-check + correct answer:`
- `Claim category / accuracy caution:`

At the end include:
- **Three strongest spelling-memory hooks** and why they map exactly to letters.
- **Three weakest or uncertain hooks** and what should be rewritten before a child sees them.
- **Self-audit:** exact word count and sequence for selected scope; exact target in every narrated joke; no target in unassisted clue; any letter/phonics claims that require educator review; any two concepts that are suspiciously alike.
- `MODEL: {{PROVIDER_LABEL}} / MODE: {{MODE}} / SCOPE: {{SCOPE}}`.

**Your priority order:** correct spelling support **and** laughter together, then spoken rhythm, then beautiful future artwork. A funny picture that cannot help rebuild the target spelling has failed this audition. A technically accurate but boring mnemonic also fails. DO NOT write application code, generate image files or claim educational efficacy.

### END PROMPT

## Reviewer checklist after PILOT

| Check | What passing looks like | If failed |
|---|---|---|
| **Exact letter mapping** | Each scene forces the child to notice and later reproduce a named letter or letter sequence; counting reveals exact correct number | Reject generic “cute animal” joke and rewrite, not just append note |
| **Comic payoff** | Would likely be funny out loud, and different from neighboring jokes | Two independent rewrites before accepting |
| **Word/letter accuracy** | Correct spellings, no fabricated derivations, actual phonics reviewed separately | Flag and require editor correction |
| **Help ladder** | Meaning context, audio/chunk, letter-level hint, show/hide/retry; assistance honestly scored | Ask model to revise toward actual student support |
| **Mechanism diversity** | A shows letter shapes/counts, B shows accurate sound/chunks, C shows safe compare/build | Re-run in fresh context with named mechanism |
| **Actual learner evidence** | Likes recorded separately from perceived helpfulness and later independent word spelling | Don't report a claimed learning improvement |

## Rule-teaching verification gate

**Existing high-level guidance:** The WWC K–3 guide recommends explicit sound-to-letter work and word analysis, plus writing words. Reading Rockets' spelling guide describes common primary-grade spelling rule classes such as adding suffixes, final-e deletion, compound words and consonant patterns. Neither source magically validates the invented jokes or all twenty analyses.

**Before Rule Lab (general rule MC):** literacy reviewer must confirm `ruleId`, exact statement, two matching examples, one exception/counterexample or condition, pronunciation/segment accuracy, age-appropriate explanation and a source reference. Then have Claude build a 30–60 second interact-and-notice demonstration, one meaningful 3–4-choice question with an `I'm not sure` choice, correct explanation and an optional later retrieval question. Keep this separate from the word-specific memory mini-checks above. See Mission 004 (private file).

**Approved local tracking scope:** `👍 Funny` and `👍 Helped me` are separate voluntary signals, and word spelling first-try vs assisted and actual rule comprehension are three separate outcomes. Same browser + same origin only, no login/backend. See Mission 005 (private file) and Sidecar TASKS (private file).

**Versioning:** keep Prompt 040 and Failure Report 001 unchanged as source experiments. Save each 041 run with provider/brief/scope/model/version metadata under `docs/design/external_comedy/p041/`. Do not publish any raw child performance logs or API secrets.
