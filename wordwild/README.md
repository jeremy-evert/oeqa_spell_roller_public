# WordWild: a spelling-game arcade (prototype)

Three small spelling games for a third-grade word list, built as a worked example of **how to build something and show it honestly**. Open the arcade, pick a game, spell the words.

* **Professor Potato's Flashcards** (`flashcards/`): hear a silly sentence, spell the word, meet the professor.
* **Impossible 3D Printer** (`game/`): the first edition. Spell words to feed a printer.
* **Impossible 3D Printer, second edition** (`printer-v2/`): a Help Me ladder, honest scoring, funny memory tricks, and a robot, castle or rocket that really builds.

No account, no install, nothing collected. Voices are pre-recorded clips, not a web service.

## Try it

Live: the `wordwild/` page of this site. To run it yourself:

```bash
cd wordwild
python3 -m http.server 8766 --bind 127.0.0.1
# open http://127.0.0.1:8766/
```
Open it from a server, not as a file: browsers block loading the word list from `file://`. To run the arcade at one address for all three games, serve this folder, then open `http://127.0.0.1:8766/`.

## What you should know (honest status)

* **Prototype.** The wording, clues and memory tricks are **candidates**. No teacher or literacy specialist has reviewed them, and no child's learning outcome has been measured. Nothing here claims to improve spelling.
* The funny memory tricks are **mnemonics**, not spelling rules or word-origin claims. They are labeled that way in `content/list14_words_v1.json`.
* Progress is saved in your browser only (localStorage, keys starting `wordwild.`). See [PRIVACY.md](PRIVACY.md). Known gaps: [KNOWN_LIMITS.md](KNOWN_LIMITS.md).
* How it was made, including AI help: [HOW_IT_WAS_MADE.md](HOW_IT_WAS_MADE.md). Everything we did not make, with licenses: [ASSETS.md](ASSETS.md). How the voice was made: [AUDIO.md](AUDIO.md).
* Examples of the prompts and report used to direct the work: [evidence/](evidence/).

## Tests
```bash
node --test                       # unit tests
node tests/validate_arcade.mjs    # arcade checks
python3 tools/validate_list14_content.py
python3 -m unittest discover -s tests -p 'test_*.py'
node tools/e2e_printer.mjs        # real-browser checks; needs Chromium
```

License: BSD 2-Clause, see the repository `LICENSE`. Third-party notices: [ASSETS.md](ASSETS.md).
