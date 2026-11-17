# Super Sevens

Practice the 7 times table, 7 x 0 through 7 x 20 (or the classic 0 to 12). Static HTML/CSS/JS: no build, no dependencies, no network, no accounts. Scores stay on the device.

**Three looks** for the same game: Fire, Space and Candy. Each has its own background, floating decorations, confetti, and sound flavour. Pick one on the menu, or open `?theme=space` (also `fire`, `candy`) and `?range=12` or `?range=20`.

| Mode | What happens |
|---|---|
| **Practice** | Silly questions in random order. A clean first try is a star; a clue or a second try is a light bulb. A clue appears by itself after two wrong tries. |
| **Stopwatch** | A clock that counts up from the moment Start is pressed; best time is kept per range. |
| **Beat the clock** | Every fact before time runs out. 0 to 12: Bronze 90 s, Silver 75 s, Gold 60 s. 0 to 20: Bronze 150 s, Silver 120 s, Gold 90 s. The background turns yellow, then orange, then flashing red as time runs short. Medals are remembered per range. |

**Number pad:** the game has its own big on-screen keypad (0 to 9, backspace, and a green check), so the phone's keyboard never opens and cannot cover a button. A computer keyboard works too: digits, Backspace and Enter.
**Help comes in two steps.** Tap 💡 once for a **Think** hint: a strategy that uses easy anchors (10s, 20s, doubles, the fact before) and never states the answer. For 7 x 17: "17 is 3 less than 20. 20 sevens is 140, and 3 sevens is 21." Tap again for **More help**: the rhyme or trick, a dot array (7 in a row, n rows) and a skip-counting strip, in a pop-up sheet. In the timed modes each step you ask for adds 5 seconds. In Practice, two wrong tries bring up the Think hint by themselves and four bring up the full help.
**Hidden surprises:** a few facts, streaks and secret taps do something special. Find them!
**Extras:** streak cheers at 3 in a row and every 5, confetti on right answers and a big finale, number animations, and about a dozen synthesized sound effects (no audio files).

Files: `facts.js` (questions, clues, ranges, medals), `engine.js` (logic and saving), `sounds.js`, `confetti.js`, `app.js`, `sevens.css`. Run `node --test tests/` here.

Honest limits: the clues are mnemonics written for fun and have not been reviewed by a teacher; the 0 to 20 medal times are a first guess scaled from the 0 to 12 times and may need tuning; tested in desktop Chrome (headless) at phone width and by Jeremy on a phone.
Licence: BSD 2-Clause, as the rest of this repo.
