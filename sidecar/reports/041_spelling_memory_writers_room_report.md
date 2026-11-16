# WordWild Failure Report 002 — Prompt 041: The Spelling-Memory Audition

**Date:** 2026-11-15 (America/Chicago)  
**Status:** Editorial/instructional failure analysis and **provisional portfolio triage**, not a child-learning study or approved phonics curriculum  
**Author:** ChatGPT, reviewing the actual 15 files in `docs/design/second_attempt/` (private file)  
**Previous:** Failure Report 001 (private file) and Quick Audit 002 (private file)  
**Prompt:** 041 Spelling Memory Workshop (private file)  
**Action:** Stop indiscriminate mass generation, preserve candidates, fix a few teaching hazards, shortlist and playtest five words first.

## Executive diagnosis

**Prompt 041 fixed the main failure of Prompt 040:** submissions generally name exact letters, integrate them into visual or spoken action, provide a study/assistance pathway, and distinguish observed spelling from invented word history. This is a meaningful improvement.

**But the second experiment still produced four recurrent problems:**

1. **Written letters were treated as spoken sounds.** A doubled `pp` in **supper** and `dd` in **ladder** are *two letters*, not two separately pronounced /p/ or /d/ consonant phonemes in ordinary English pronunciation. Mode B sometimes confuses letter-name chanting, spelling chunks, actual syllables and phonics. A vivid mnemonic can be retained while the accompanying explanation is rejected.
2. **The mechanics became templated.** Physical objects shaped like letters (A), characters shouting letter names (B), and inserting/swapping one tile (C) sometimes replaced genuine comic invention. Being an exact spelling puzzle is necessary, but not enough for a delightful game.
3. **The prompt seeded ideas that came back as supposed independent creativity.** The parent-supplied two-peas-from-Dad's-nose story appears closely echoed in **Grok A**, and “Sup?” / “Per!” dialogue recurs in several Mode B runs. This is a *prompt contamination/design failure*, not evidence of plagiarism or dishonest providers.
4. **No human learning outcomes or real error profile.** We know the submitted jokes *could* cue a letter. We do **not** know which letters the child actually misses, which jokes make her laugh, which ones she chooses voluntarily, or whether she recalls a spelling later. A model's `Why this helps` paragraph is a hypothesis, not a measured effect.

**Recommendation:** retain all candidate files, but stop treating every run as equally worthy of development. **Do not expand the three pilot-only providers to full twenty-word sets yet.** Prioritize a small mixed shortlist and genuine playtest.

## Inventory and limits

| Source | Mode A (shape/letter count) | Mode B (spoken/chunk) | Mode C (contrast/build) | Entries |
|---|---:|---:|---:|---:|
| ChatGPT | 20 | 20 | 20 | 60 |
| Claude Opus | 20 | 20 | 20 | 60 |
| DeepSeek | 5 | 5 | 5 | 15 |
| Grok (stored filename `grock`) | 5 | 5 | 5 | 15 |
| Gemini | 5 | 5 | 5 | 15 |
| **Total** | **55** | **55** | **55** | **165** |

The five common pilot targets are **supper, ladder, spider, upstairs, staring**, in List 14 positions 1, 4, 6, 17, 18. The full sets additionally cover the remaining fifteen words.

All 15 files contain their expected twenty/five target-letter mappings, narrated jokes and rationales. **That is structure compliance, not content approval.** The supplied model names/settings are file provenance claims; exact inference versions, sampling settings, and true run independence are not verified. We did not run a learner trial, independently listen to all narrations, or quantitatively score all 165 jokes against children.

## Failure taxonomy with source-grounded examples

| Priority | What is meaningfully wrong | Concrete example from the submissions | Correction and test |
|---|---|---|---|
| **STOP** | **Two written consonants mistaken for two separate phonemes** | Grok Mode B (private file) explains `supper` as “two p-sounds” and `ladder` as “two d-sounds”; Gemini B (private file) also blurs a written `pp` with two “sounds/letters” | Say **two written P letters / D letters**. A teacher checks the actual phoneme claim. Chanting “P! P!” is acceptable as **spoken letter names**, not natural-word pronunciation |
| **STOP** | **Wrong sound inferred from correct spelling analogy** | Grok B spider (private file) implies the long-I sound requires the letter `i` and forbids `y`; `spy` and `spi-` can represent the same long-I vowel sound in these words | Frame `i` versus `y` as an **orthographic choice**, not a sound proof. A spider dangling from the dot of `i` may be a better visual reminder |
| **STOP** | **A memory chunk sold as a productive rule or literal meaning** | Claude Opus C understand (private file) builds `under + stand`; ChatGPT A butterfly (private file) makes visible `butter`/`fly` chunks. Both identify cautions, but a UI could erase the caveat | Can use **correct letter sequence** in a silly picture; cannot claim the whole word's modern meaning literally follows from those pieces. Prohibit unapproved general rule quizzes |
| **HIGH** | **Weak or fabricated independent creativity** | Grok A supper (private file) launches two pea-pods from Dad's nose after the prompt gave “Dad blows two peas out his nose” | For new auditions use *other* words in demonstration examples; hide the target idea being evaluated. Mark this as **example-anchored**, not independently original |
| **HIGH** | **Arbitrary visual alphabet choreography is not a memorable joke** | Claude Opus A number (private file) uses tunnels, valleys, boots and antennae as a complicated proxy for letter shapes; its self-audit notes repeated humps/tunnels across words. ChatGPT A number (private file) has NUM noodles and BER bears instead of a specific difficult letter | Require a child to point to the **exact one or two characters and positions** being remembered, using one clear image and one meaningful action. Reject too many simultaneous symbolic objects |
| **HIGH** | **Letter-name roll call impersonates sound play** | ChatGPT B over (private file): O opera singer and three mice squeak V-E-R; ChatGPT B animal (private file): whole-letter orchestra. Valid letter names, but not phonics and not notably funny by themselves | Mode B must be authentic brief dialogue, meaningful rhyme, spoken rhythm or memorable word family; if it only spells every letter, label as optional **spelling chant**, not a premium creative script |
| **HIGH** | **Exact transformations became repetitive with weak comedy** | Claude Opus C (private file) self-audits repeated one-letter swaps in `number, sister, tiger, over`; ChatGPT C (private file) self-audits generic parts-joining in `number` and `butterfly` | Retain mechanically correct puzzle, rewrite its **consequence**. Make the letter change cause the laugh rather than adding a random pants accident afterward |
| **HIGH** | **Too many rhyming analogies in one set** | Claude Opus B (private file) self-identifies 13/20 rhyming-family structures. A set can be accurate but monotonous | Keep the **best rhyme per word**, but distribute mechanisms across a play session; alternate with visual/morphology routes instead of 13 consecutively |
| **HIGH** | **Tempting wrong spellings could be rehearsed too often** | Claude Opus C animal (private file) repeatedly presents “aminal” for correction; several games include `spyder`, `stareing`, `upstares` | Brief contrast is allowed only **after intentional help/study** and with the correct spelling highlighted; don't repeatedly narrate or reward a wrong spelling. `upstares` is an invented wrong spelling, whereas `stairs` and `stares` are actual words |
| **MEDIUM** | **Advanced or unfamiliar comparison words add cognitive load** | Claude Opus C ladder (private file) uses `adder` (a snake), and its `tiger` uses `liger`; Claude Opus B (private file) also uses `cider`, `blister` and `twister` families | Allow “What's an adder?” preview or choose a familiar comparator. Don't make a new vocabulary quiz a prerequisite to learning the target |
| **MEDIUM** | **All modes overpromise retained learning** | Every model supplies a `Why this helps spell it` explanation, but no future hidden recall was tested | Rewrite as “What this is designed to cue.” Track **👍 Funny**, **👍 Helped me** (self-report), and **later independent spelling** as distinct outcomes |
| **MEDIUM** | **The pre-answer clue is not always answer-unique** | “Evening meal” fits both `dinner` and `supper`; “sport with a kicked ball” may be `football` or `soccer` in different regions | On-demand pleasant **spoken target word** resolves an exact spelling task. Don't judge a semantically reasonable alternative as bad comprehension |
| **MEDIUM** | **No prioritization by actual child error** | We repeatedly chose `pp`, `dd`, `i/y` without first confirming that those are the child's hardest letters | Use these as safe pilot examples, then tune content to *locally observed* miss patterns and hint use without storing raw child responses remotely |

## Provisional contributor/approach triage: invest selectively, not equally

**These are editorial rankings of *these stored submissions*, not rankings of provider intelligence.** All models retain the right to try again with a sharper scope. Some "weak" groups can still contribute art or jokes.

| Source / set | Strongest contribution | Weakness or blocker | Allocation now |
|---|---|---|---|
| **Claude Opus B, 20 words** | **Best current *written-word analogy* pool**: `supper/upper`, `ladder/adder/madder`, `spider/glider/rider`, `number/lumber`. Uses real letter sequences | Overuses rhyme family for 13/20; `tiger` “tie loses e,” `soccer` “sock+er” risk confusing the spelling | **PRIORITY SOURCE:** extract accurate one or two per target; rewrite weak ones |
| **Claude Opus C, 20 words** | **Best current word transformation pool**: `rider→spider`, `lumber→number`, `stare→staring`, `staring/starring` | Some jokes flat; `liger` unfamiliar; `aminal` wrong-form exposure; word-parts sometimes misleading | **PRIORITY SOURCE:** use builds with precise correctness and a better comic payoff |
| **ChatGPT C, 20 words** | Reliable **game-engine blueprint** for letter insertion, comparison, full-word construction, help/mini-check | Some outcomes are interchangeable mechanical accidents; visual polish alone will not fix weak writing | **PRIORITY FOR SKELETON:** Claude implements, later choose best narration per word |
| **Gemini A, five-word pilot** | **Strong physical cartoons**: two p-shaped penguins in `supper`, two d-shaped dinosaurs in `ladder` | Letter form may depend on specific pose; jokes need spoken editing and child preference test | **PRIORITY VISUAL PILOT:** test a small selection with Luna/Codex after writing |
| **DeepSeek A, five-word pilot** | Direct letter/scene integration: two p-shaped pickles, an i-shaped fly after `sp` | Repeats letter-shaped object pattern; humor may be weaker than the sketch | **KEEP SELECTIVE:** useful letter illustrations, no full run yet |
| **DeepSeek B, five-word pilot** | `Sup?`/`Per?`, `Lad`/`Der` written-chunk join is a nice dual-letter mnemonic | Chunks sound like two sounds unless clearly treated as orthographic chunks; dialogue formula repeats | **KEEP WITH SCRIPT FIX:** no independent phonics claim |
| **DeepSeek C, five-word pilot** | Accurate mechanical transformations, particularly `stare→staring` and `up+stairs` | Very similar to Claude/ChatGPT C; minimal additional comedy | **BACKUP ENGINE IDEAS:** no need for a full 20 yet |
| **Gemini B, five-word pilot** | Accessible dialogue and physical humor | `Sup/Per` echoes prompt example; some letter-versus-sound language is ambiguous | **REWRITE BEFORE CHILD USE** |
| **Gemini C, five-word pilot** | Correct `up+stairs`, `stare+ing` build scenes; useful visual effects | Similar transform action for all five, jokes sometimes generic | **KEEP SELECTIVE** |
| **Grok A, five-word pilot** | Simple physical visuals and two-letter references | `supper` pea-pod nose scene closely tracks prompt's parent example; independence weakened | **LOW PRIORITY AS INDEPENDENT COMEDY**; keep the useful visual note |
| **Grok B, five-word pilot** | Energetic spoken delivery | **Misrepresents doubled written letters as two sounds**; `i/y` vowel explanation misleading | **REJECT AS WRITTEN for child-facing sound instruction**; no full B request before correction |
| **Grok C, five-word pilot** | Mostly straightforward letter-tile transformations | Mechanically similar to higher-quality C material; modest novelty | **DEFER FULL RUN** |
| **Claude Opus A, 20 words** | A few interesting visual moments (`upstairs` whoopee cushion and `staring` egg falls) | Several *obscure letter-shape allegories*, especially `number` and `animal`; self-audit acknowledges similar humps/tunnels | **DEPRIORITIZE AS A PRIMARY LEARNING SCRIPT**; salvage select illustrations |
| **ChatGPT A, 20 words** | Accurate visible letter-count scenes and some physical comedy | Many elaborate letter-shaped props per word; story focus can be overrun by the alphabet spectacle | **KEEP SELECTIVE VISUALS**, simplify aggressively |
| **ChatGPT B, 20 words** | Clear complete letter-name sequences, supervised `whisper+ed` and `scatter+ing` distinctions | Too many letters shouting the entire spelling; often a chant rather than a funny sound-based explanation | **DEPRIORITIZE AS THE MAIN NARRATOR**, keep a few optional spelling chants |

### Direct answer: should any model stop?

- **No wholesale ban for DeepSeek, Gemini, Grok, Claude Opus or ChatGPT** on this evidence. Five-word pilots cannot prove a provider is generally worse, and the full/pilot groups are not a fair matched comparison.
- **Yes, stop investing in particular *current variants*.** Grok B's **sound explanations** are not acceptable as written; the most opaque shape allegories in Claude A and the monotonous full-alphabet chants in ChatGPT B should not be polished into final art. Preserve as historical experimental data, not a release candidate.
- **Do not purchase or commission more full-set generations yet.** We have more than enough to make a five-word game slice and get real feedback.

## Five-word shortlist for a controlled human comparison

Choose **two contrasting candidates per word** first, not 15 jokes in one sitting. These are **candidates for rewrite and review**, not approved winners.

| Word | Candidate 1: best spelling route | Candidate 2: contrasting route | What to ask the child |
|---|---|---|---|
| **supper** | **Claude Opus B:** `upper` and `supper` share the written `upper` ending and `pp`; funny pup/upper bunk | **Gemini A:** two purple p-shaped penguins physically fill `pp` | “Which helps you remember there are **two** P's?” After reveal/hint |
| **ladder** | **Claude Opus C:** add `l` to `adder` to preserve `dd`, with simpler explanation | **Gemini A:** two d-shaped dinosaurs climb together | “Can you rebuild the middle without looking?” |
| **spider** | **Claude Opus B:** `glider/rider/spider` share written `ider`; i rather than y | **DeepSeek A:** the i-dot fly lands immediately after `sp` | “Which third letter belongs after SP?” |
| **upstairs** | **Claude Opus C:** distinguish genuine `stairs` from `stares`, then combine `up+stairs` | **Gemini C or ChatGPT C:** `air` balloons inflate the stairs | “Can you find A-I-R inside STAIRS?” |
| **staring** | **Claude Opus C:** `stare−e+ing`; contrast real words `staring` / `starring` | **Gemini C:** final E pops off when ING arrives | “Where did E go? Why isn't there an extra R?” |

**Word-specific mini-check after hint/study** is permitted. It does **not** count as general phonics-rule comprehension or first independent spelling. After a *later* hidden-answer attempt, score unassisted spelling separately.

## What to nail down for the 'little monkeys' before the next assignment

### A. Freeze the **learning contract**, not the jokes

1. Every item declares **canonical exact spelling**, target letter(s) and positions, allowed answer-hidden clue, one or more *approved* helpful alternatives, and which spelling confusion it aims to address.
2. Every joke declares an immutable `jokeId`, source file/line or heading, text version, modality (`visual-letter`, `spoken-chunk`, `compare-transform`), target-feature ID, approval status, and **one cause-and-effect punchline tied to the letters**. A funny generic scene can be tagged `entertainment-only`, not falsely called a spelling mnemonic.
3. **Pre-answer:** only nonrevealing art/meaning and optional spoken target; **post-attempt or deliberate study:** explicit letters, tile puzzles, comparisons and mnemonic hints. Any letter exposure marks the ensuing attempt **assisted**, even if the card is hidden again. First independent try is reserved for an actual first attempt without a spelling clue.
4. **Claims have a required type:** `MNEMONIC` (imaginary letter action), `WORD OBSERVATION` (checked actual spelling), or `GENERAL RULE—REVIEWED` (specific sourced rule, scope, examples, exception/counterexample). No model may silently promote a rule candidate to the last category.
5. Spoken **letter names**, **pronounced phonemes**, **written spelling chunks**, and **syllables** get separate fields. **No equation like “double pp = two P sounds.”** Audio scripts should use deliberate human-readable spacing; Kokoro pronunciation must be approved by an ear, not just machine transcription.
6. The **help ladder** is nonnegotiable: Say word → Slow/repeat → Better meaning example → exact spelling-specific mnemonic/pattern → optional first-letter/letter-count clue → Show/Hide/Spell/Check → Quick Review. The child may ask for help before the first mistake.
7. For rule questions: reviewed general rules only, with source, correctly delimited claim, two examples, condition/exception, 3–4 fair choices and `I'm not sure`. Offer **one optional rule check after roughly five encounters**, never as a forced interruption. A two-P joke is a *mnemonic check*, not proof of a consonant-doubling rule.
8. Separate voluntary **👍 Funny**, **👍 Helped me**, and later **first unassisted spelling**, tracked locally (same browser, profile and origin); no public identities, raw typed answers, remote analytics or server yet.
9. Limit a child-facing round to **five words**, **at most two alternatives per target on demand**, and soft sound with Stop/Mute. User can pick another joke, skip or end. Do not introduce fifteen variants in a single round.
10. Keep visual polish on hold until a **working five-word skeleton** with placeholder art demonstrates both a laugh and a truly usable aid. Reuse approved Kokoro `af_heart` voice; never autoplay a harsh browser fallback.

### B. One reviewer rubric, applied to EVERY candidate

| Measure | 0 = fail | 2 = good | 4 = excellent |
|---|---|---|---|
| **Exact spelling fidelity** | wrong letter/sound claim or fabricated rule | feature and positions correct, caveats needed | fully verified feature, precise mechanism and guardrails |
| **Memory mapping** | joke could be reused for any word | mapped to correct letter(s), some explanation needed | funny action **cannot occur without** target letters/number/order |
| **Laugh/read-aloud** | flat or laborious | clear smile/physical surprise | surprising, age-appropriate, short, strong spoken payoff |
| **Support usability** | child can't recover from confusion | hint shows exact cue after opting in | interactive cue, honest assistance, easy hidden retry |
| **Distinctness/reusability** | derivative or nearly identical | a recognizably different approach | genuinely different mental route and visuals; useful across game worlds |

**Score 0–4 per dimension, total 0–20**, but treat scoring as **reviewer judgment**, not an automated education metric. **Hard stop** overrides any total for a false spelling/phonics statement, inadvertent answer leak, unreliable hint scoring, or seriously inappropriate content. **Candidate shortlist threshold:** aim for `>=16/20` and no hard stops; reserve a human-review bucket for candidates with 13–15. This threshold is an editorial gate, not a validated educational test.

### C. Short staged handoffs

1. **Claude Code:** audit the 10 shortlist candidates for *real* orthographic/phonological correctness. Convert them into a tiny versioned `five_word_candidate_cards.json` with exact letter targets, hidden-state controls, typed support and approved/hold flags. **Do not silently invent a new rule.**
2. **ChatGPT:** rewrite the final *spoken* sentences where the jokes don't land, without touching a verified letter map. Independent creativity is welcome: original authorship is not a veto.
3. **Claude Code:** implement a **five-word interactive playground** using text placeholders and the approved sound: Visual Trick / Say the Parts / Build and Compare, plus visible Help, Stop Audio, Skip, reveal/study, mini-check and honest progress.
4. **Codex/Luna:** propose **two art treatments for one word**, not twenty finished images. We iterate with Jeremy first.
5. **Jeremy/the child:** laugh, thumbs up, ask for help, spell later with answer hidden. Compare actual user behavior; if no one can find the help, the design failed even if unit tests pass.
6. Only after this passes: expand to other fifteen words, then diversify across five different arcade worlds.

## Evidence and limits

- Evidence ledger: WordWild Learning Science Evidence Ledger (private file) and Mission 001 draft rule inventory (private repo). The former is a project synthesis, the latter labels exact patterns pending literacy review. These sources support researching and teaching grapheme/phoneme mappings and authentic word parts, **not** automatic validation of these jokes.
- Mission 004 (private file) describes the rule-review gate, Mission 005 (private file) describes local event tracking, and Production Board (private file) assigns creative and code roles.
- **No child tested these 165 ideas yet.** This report does not say any specific joke works, any model is innately better, or any creative candidate is already approved for the child.

**Bottom line:** We should retire the **bad explanations and weak templates**, not entire models. We have enough promising spelling mnemonics to run a serious five-word test now.
