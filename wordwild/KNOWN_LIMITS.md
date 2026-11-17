# Known limits (what we did and did not check)

**Not reviewed by a teacher or literacy specialist:** all clues, pronunciation notes, 42 funny memory tricks, and six review-only phonics rule candidates (never shown to children). Status in the data: `candidate_parent_review`.

**Not studied for learning outcomes.** There has been no classroom or controlled test. No learning claim is made.

**Tested:** unit tests, content validator, arcade checks, and headless Chromium end-to-end checks of the second-edition printer (all 20 words, a 375-pixel-wide screen, keyboard, reduced motion). See [AUDIO.md](AUDIO.md) and `evidence/` for the audio report.

**Not tested:** touch screens, Firefox, Safari, Android, iOS, screen readers beyond basic structure, slow networks, and the published Pages address (until it is live and re-checked).

**Audio:** voices are synthetic (Kokoro, local). 38 narration clips were machine-checked (a speech-to-text pass) but **not all heard by a person**. Kokoro spells out some sound effects and says "P, P" as "pee-pee" (kept as a joke). The first Flashcards edition had two wrong pronunciation notes (tiger, soccer) that were corrected in this version.

**Scoring and progress:** the original Flashcards and second-edition printer keep separate progress (`wordwild.flashcards.v1` vs `wordwild.shared.v1`). They are not merged.

**Art:** placeholder and simple inline graphics. No finished illustrations.

**Word list:** 20 words (one weekly third-grade list, with two review words). See [ASSETS.md](ASSETS.md) for provenance.

## Super Sevens and Math Mayhem
**Not reviewed by a teacher:** the think hints, rhymes and fun facts are memory aids written for fun. The arithmetic in them is checked by tests; their teaching value is not. **Not studied for learning outcomes**, and timed play and medals have not been checked against the research on timed practice and math anxiety. The Think and More help steps and the untimed Practice mode exist partly for that reason.
**Medal times for 0 to 20** (150, 120 and 90 seconds) are a first guess scaled from the 0 to 12 times and may need tuning.
**Tested:** unit tests, scripted runs in headless Chromium at phone width for all three looks, and hands-on play by the owner on a real Android phone. **Not tested:** iOS, Firefox, Safari, screen readers beyond basic structure, and the sound effects by ear beyond the owner's play.
**Sound:** effects are synthesized and have been listened to by the owner only; some may be too loud or sharp for some children. There is a Sound effects switch on the menu.
**Newer modes (Guess the Missing Number, Tricky Facts, Build It):** tested by scripted full runs and unit tests, not yet by a child. The spaced-review gaps (a fact waits 0, 0, 1, 3 or 7 rounds depending on its level) are simple defaults, not tuned or checked against the research. Tricky Facts lives only in one browser on one device. Build It shows 7 × 20 as three small blocks of dots, which may be hard to count on a small phone; "Count with me" is the fallback.
**Sound design:** each look has its own synthesized sound world. All 48 sounds were rendered offline and measured (every one plays, none is silent or clipped, and the three looks differ in pitch profile), but whether they are *pleasant* was judged by the owner's ears only. The "barbershop" voices are synthesized chords, so they sound like a toy choir, not singers. Use `sevens/soundcheck.html` to hear them all.
