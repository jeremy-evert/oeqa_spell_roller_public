# Report 042: Final List 14 Comedy and Learning-Content Handoff

**Author:** Anna (Claude Code, Sonnet 5.5). **Prompt:** `prompts/042_final_list14_story_package_for_builder.md`. **Status:** candidate, needs Jeremy's editorial approval. Every joke is `candidate_parent_review`: **no child has laughed at these specific variants and no mnemonic here has been shown to improve spelling.**

## What is in the package

| File | What it is |
|---|---|
| `content/list14_words_v1.json` | The machine-readable package: 20 words, **42 joke variants** (2 per word, plus an optional third for supper and staring), help text, mini-checks, a review-only rule bank. Source of truth. |
| `docs/design/list14_final_story_bible_candidate.md` | The human-readable book, **generated from the JSON** (`tools/render_list14_story_bible.py`). Never edit by hand. |
| `tools/validate_list14_content.py` | Validator, no dependencies, exits 1 on any error. |
| `tests/test_validate_list14_content.py` | 15 tests, including 14 that break the data on purpose and confirm the validator catches it. |
| `sidecar/TASKS.md` | Updated on this branch only (section 13). |

## The 20 choices

Technique key: **rhyme** = rhyme family, **swap** = swap one letter, **build** = join real parts, **chunk** = sound chunks you can hear, **shape/count** = visual letter count.

| # | Word | Default (source, technique) | Alternate (source, technique) | Letter focus | Rule status | Editorial flag |
|---|---|---|---|---|---|---|
| 1 | supper | Dad sneezes two peas, two P's (Jeremy's premise, shape/count) | Captain Super gets a second P (Opus C, swap). Optional third: pup on the upper bunk (Opus B, rhyme) | `pp` | observation; RC-05 review-only | peas premise is example-anchored, not independent |
| 2 | number | cucumber, slumber, lumber (Opus B, rhyme) | beaver swaps lumber to number (Opus C, swap) | `umber`, `mb` | observation | none |
| 3 | over | Rover, clover (Opus B, rhyme) | oven loses n, gains r (Opus C, swap) | `ver`, `er` | observation | **weakest pair**; short word, little to work with |
| 4 | ladder | grumpy adder gets madder (Opus B, rhyme) | two dachshunds are two D's (DeepSeek A/Gemini A, shape/count) | `dd`, `adder` | observation; RC-05 | adder preview card if unfamiliar |
| 5 | sister | Mister Mustache becomes sister (Opus C, swap) | blister, twister (Opus B, rhyme) | `ister` | observation | clue rewritten after review to be inclusive of step, half and adopted siblings; parent still to read |
| 6 | spider | cowboy rider becomes spider (Opus C, swap) | spider hangs from the dot of the i (DeepSeek A, shape/count) | `ider`, `i` | observation | i vs y is spelling choice, not sound proof |
| 7 | soccer | smelly sock grows a second c (Opus C, swap) | the ball splashes into two seas, two C's (original, letter-name pun) | `cc` | observation; RC-05 | two written C letters, middle pronounced /k/; no sound assigned to one C; original Flashcards say /s/ (wrong) |
| 8 | thunder | tongue-out THHH, dive under the bed (Opus B+C, sound chunk) | pirate blunder, plunder (Opus B, rhyme) | `th`, `under` | observation; RC-06 | under is a chunk, not a meaning |
| 9 | tiger | tie, then the GRRR is the hard g (original, chunk) | liger swaps l for t (Opus C, swap) | `g`, `ti` | observation | **hard g**; original Flashcards say /j/ (wrong); liger preview |
| 10 | chapter | chatty chipmunk chomped, CHAP, burp TER (Opus B, chunk) | cap + h = chap, + ter (Opus C, build) | `ch`, `chap`, `ter` | observation; RC-06 | chap is old-fashioned (preview card) |
| 11 | afternoon | raccoon, balloon, moon says "after noon" (Opus B, rhyme) | glue after to noon, palindrome (Opus C, build) | `after`, `noon`, `oo` | observation; RC-01 | none |
| 12 | scattering | SCAT cat, pitter patter (Opus B, rhyme) | scatter train with ing caboose (ChatGPT C, build) | `scatter`, `tt`, `ing` | observation; RC-02, RC-03 | scat is an echo, not the base |
| 13 | whispered | What? When? Where? Why? (Opus B, chunk) | ed hops onto whisper (Opus C, build) | `wh`, `ed` | observation; alternate is a **RULE_CANDIDATE** (RC-04, RC-06) | wh varies by accent; who is different |
| 14 | understand | Coach calls UNDER, STAND (Opus B, chunk) | basset hound under the lemonade stand (Opus C, build) | `under`, `stand` | mnemonic only | never a literal meaning compound |
| 15 | newspaper | a blank new paper gets an S (Opus C, build) | parrot hisses NEWSSS (Opus B, chunk) | `news`, `s`, `paper` | observation; RC-01 | none |
| 16 | butterfly | the butter mutters at the butterfly (Opus B, rhyme) | the greasy butter fly (Opus C, build) | `tt`, `butter`, `fly` | mnemonic only | not made of butter |
| 17 | upstairs | a burp full of air floats up the stairs (Jeremy's up+stairs+air standard, Gemini/DeepSeek, shape/count) | stairs, chairs, pairs, hairs: I need air (Opus B, rhyme) | `stairs`, `air` | observation; RC-01 | List 13 review word |
| 18 | staring | the e pops off like a bottle cap (DeepSeek/Gemini, build). Optional third: caring, sharing, glaring | the owl staring at the star starring (Opus C, shape/count) | `star`, `ing` | **RULE_CANDIDATE** RC-02, RC-03 | List 13 review word; silent-e rule stays review-only |
| 19 | animal | penguin cheerleaders AN, ih, MAL (Opus B, chunk) | N cuts in line in front of M (original, shape/count) | `an`, `nim`, `mal` | observation | alphabet fact verified: m is 13th, n is 14th |
| 20 | another | brother, Mother, another cookie (Opus B, rhyme) | peel the m off mother, add an (Opus C, swap) | `other`, `an` | observation | other is a chunk, not a compound rule |

Totals: **20 words, 42 variants, 0 validator errors, 0 warnings.**

## What I fixed from Failure Report 002

- **STOP: two written consonants called two sounds.** Every spelling cue says "two P letters", "two D letters", "two C letters", never two sounds. Letter names (P, D, C) appear only as jokes, and each caveat says so. The pronunciation notes say "doubled letters in the spelling are not said twice."
- **STOP: i versus y as a sound proof.** The spider cue treats it as an orthographic choice and says the vowel sound is the same as in "spy".
- **STOP: memory chunks sold as literal meaning.** understand, butterfly, thunder and newspaper carry explicit "mnemonic only / not literal meaning" caveats, and understand has a registry note that it must never be taught as a meaning compound.
- **HIGH: prompt contamination.** The supper peas premise came from Jeremy; I labeled it parent-proposed and example-anchored rather than independent.
- **HIGH: letter-shape alphabet parades and letter-name roll calls** (Opus A, ChatGPT B) were left out. Only two single-shape ideas survived (dachshund D's, the i dot).
- **HIGH: repetitive rhymes.** Opus B used a rhyme family for 13 of 20. Here 12 of 42 variants are rhymes, the default is a rhyme for 7 words, and the validator warns if a word's two variants use the same mode.
- **HIGH: wrong-spelling exposure.** No joke or mini-check shows a misspelling of the target word (checked by search). `aminal` is not shown anywhere; the animal alternate uses the alphabet-order fact instead. `stareing`, `upstares` and `spyder` do not appear.
- **MEDIUM: ambiguous clues.** Ten words have a spoken-word disambiguation note (supper/dinner, soccer/football, and so on); the validator requires a note whenever the flag is true.
- **MEDIUM: overpromising.** "Why this helps" is now `whyThisVersion` and `caveat`. Nothing says a mnemonic works.
- **Prior corrections to my own work.** See next section.

## Errors in earlier material, found while checking pronunciation (please read)

1. **Original Flashcards (`flashcards/words.js`, PR #4) say "tiger: the g sounds like a j".** That is false: tiger has a **hard g**. the child has seen this note.
2. **Original Flashcards say "soccer: the second c sounds like s".** That is false: the two c letters are written together and the middle of the word is pronounced /k/. Do not assign a sound to one of the two C's.
3. **My own Story Bible v2 (PR #7) said the second beat of tiger "starts with a j sound".** Same error; superseded by this package.

I did not change the Flashcards (the assignment forbids it). They need a one-line fix each in a separate small PR with your yes. Both are written into `corrections` in the JSON, so a builder sees them.

## What I discarded and why

- **My PR #7 story bible v2 scenes** (the hippo burp, the musical stairs, and so on) are *meaning scenes*, not spelling aids, so they are not used here. They are still good pre-answer pictures and could become the card art while the help jokes teach the letters. Your call.
- **Opus A letter-shape allegories** (tunnels, humps, antennae): too many symbols at once.
- **ChatGPT B whole-alphabet chants**: not funny and not phonics.
- **Grok B sound explanations**: contain the two-sounds error.
- **The v1 office-and-paperwork scenes**: retired earlier.
- **Hippo/goldfish/octopus ideas** that did not tie to a letter feature.

## Tests run

```
python3 tools/validate_list14_content.py
  20 words, 42 joke variants, 0 errors, 0 warnings
python3 -m unittest discover -s tests -p 'test_validate_list14*.py'
  Ran 15 tests ... OK
python3 tools/render_list14_story_bible.py > docs/design/list14_final_story_bible_candidate.md
git diff --check
```

The first validator run caught two real defects in my own writing (two alternates whose narration did not say the word), which I fixed.

**What the validator cannot check:** whether a joke is funny, whether a pronunciation or phoneme claim is true, ambiguity of a clue, or answer leaks through pictures, alt text or ARIA. The two pre-answer clues are checked for the exact word, for any four-letter piece of it, and for any other List 14 word.

## Still needs a human

1. **Jeremy:** approve or veto each of the 20 choices; pick which three would make the child laugh.
2. **Parent wording:** the rewritten `sister` clue ("a girl who is a kid in your family, like a brother but a girl").
3. **Literacy reviewer:** the pronunciation notes (for example "TY-ger", "AN-ih-mul"), all six rule candidates RC-01 to RC-06, and the letter-name puns.
4. **A human ear on Kokoro:** letter names in narration ("two P's", "C's") and the sound-effect words (THHH, GRRR).
5. **the child:** which jokes she laughs at and which she picks again. The `Funny` and `Helped me` thumbs are voluntary preferences, not learning evidence.
6. **Preview cards** for adder, liger and chap: the builder should show a one-line "what's an adder?" before those jokes, or hide them.

## Hand-off to the builder

**To Claude's gameplay builder (Printer v2 and Flashcards v2):**
1. Load `content/list14_words_v1.json`; the schema is documented in the `legend` and `helpLadder` blocks inside the file.
2. Show only `clues.primary` and `clues.secondary` before the answer, plus on-demand audio of `audio.word` and `audio.slowWord`. Everything else is post-answer or post-help.
3. Render narration from `jokes[].narration` with the local Kokoro `af_heart` pipeline (not the browser voice). Each joke id (`list14-<word>-<slot>-v<n>`) is stable; any text change bumps `n` and needs a new clip.
4. Treat any exposure of letters (`patternHint`, `partialLetterHint`, any joke cue, `miniCheck`) as marking that attempt **assisted**.
5. Never show `generalRuleBank` to a child.
6. Keep `Funny`, `Helped me`, and later independent spelling as three separate local events.

**To Codex/Luna visuals:** use `jokes[].artPlaceholder` and `accessibleDescription`; the pre-answer picture must not spell the word (no letters in SVG text, alt text or ARIA).

## What I did not do

No game engine, no images, no audio, no Flashcards or Printer changes, no merge, no edits to PRs #4, #5, #7, #8, and nothing on the home laptop.
