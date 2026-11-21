# Professor Potato: List 15

The List 15 edition of the original WordWild Flashcards. The existing List 14 game at ../flashcards/ is unchanged.

## Play
Open [Professor Potato: List 15](https://jeremy-evert.github.io/oeqa_spell_roller_public/wordwild/flashcards-list15/) or select it from WordWild Arcade.

- **Flip & Learn:** Explore all 20 illustrated words and spelling chunks. Turn a card over, then hide the spelling and try it from memory.
- **Listen & Spell:** Quiz in four rounds of five, a surprise set, or all 20. Every card has a picture, sentence clue, an answer box, honest results, and optional help.
- **Quick Review:** Revisit words that were missed, skipped, or required help.
- **Progress:** Separately saved in this browser only under `wordwild.flashcards.list15.v1`; no account or uploads.

## Audio
The original List 14 game has separately recorded Kokoro `af_heart` narration. The List 15 words and sentences require **60 locally generated Kokoro clips** (20 normal, 20 slow, 20 sentences). No browser text-to-speech fallback is allowed. The interface works with visible clues and flip cards until approved files arrive.

**Render on Maise** from this folder:

```bash
/srv/audio-foundry/venvs/kokoro/bin/python tools/render_kokoro_on_maise.py
```

The renderer uses Maise's existing `kokoro` Python package and GPU, voice `af_heart`, local FFmpeg normalization, and a strict 60-clip manifest. Listen to representative clips, including `o’clock` and its sentence, before committing the generated `assets/audio/` MP3 files and manifest. The public site never calls Maise and never records microphone input.

## Spelling focus
The first 16 words use consonant + `le` endings. The two review words are **understand** and **over** from List 14. The final two words are **until** and **o’clock**. The apostrophe in o’clock is required, but straight and curly keyboard apostrophes are treated alike.

Spelling notes and chunk choices are word-specific teaching aids, not universal phonics rules. As with the earlier game, the goal is helpful practice, not a claim of measured learning outcomes.

## Testing
From this directory: `node --test`. This is a static HTML/CSS/JS game; no build, account, external library, or CDN is needed.

## Magdalena's playtest improvements (List 15)

- Every five-word break offers a prominent **Continue** button. At the end of a set, it starts a new surprise round of five instead of leaving a dead end.
- A **Practice tricky words** button is available after finishing only if words actually need review. The main Continue button stays visible.
- Professor Potato's retry face now has kind eyebrows and a little smile instead of an angry expression.
- **Potato Points** are cosmetic rewards in this edition. 2 points for each completed spelling (even with hints or retries), and 1 point for studying a word the first time. Incorrect answers never subtract points. No accounts, purchases or leaderboards.
- Unlock a purple sparkle graduation cap at 10 points or a golden cap at 25 points. Both are just costumes, not quiz advantages. Points and selected cap stay in the existing List 15 browser-only storage.
