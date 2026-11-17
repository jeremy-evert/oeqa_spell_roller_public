# Super Sevens

Practice the 7 times table, 7 x 0 to 7 x 12. Static HTML/CSS/JS: no build, no dependencies, no network, no accounts. Scores stay on the device.
It reuses the look and the synthesized sound effects from `../flashcards/`.

| Mode | What happens |
|---|---|
| **Practice** | 13 silly questions in random order. A clean first try is a star; a clue or a second try is a light bulb. A clue appears by itself after two wrong tries. |
| **Stopwatch** | A clock that counts up from the moment Start is pressed; best time is kept. Clues allowed. |
| **Beat the clock** | All 13 facts before time runs out: Bronze 90 s, Silver 75 s, Gold 60 s. No clues while the clock runs. Medals are remembered. |

The clue for each fact is in `facts.js` (answer sound-alike in CAPITALS). Logic is in `engine.js`; run `node --test tests/` here.

Honest limits: the clues are mnemonics written for fun and have not been reviewed by a teacher; tested in desktop Chrome (headless) at phone width, not yet on a phone.
Licence: BSD 2-Clause, as the rest of this repo.
