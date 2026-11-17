# Privacy

* **Nothing is collected or sent.** No accounts, no analytics, no cookies we set, no third-party scripts, fonts or images. Every request the game makes goes to the same site. (The browser test `tools/e2e_printer.mjs` checks "every network request stayed on localhost"; the same check against the published address is listed in [KNOWN_LIMITS.md](KNOWN_LIMITS.md) if it has not been run yet.)
* **Progress stays in your browser.** Games save settings and results with localStorage. Keys start with `wordwild.` (for example `wordwild.shared.v1`). Clearing site data erases them. The grown-up page `shared/progress.html` can show, copy and erase them.
* **Shared address, shared storage.** On GitHub Pages every project under one user address shares one browser origin, so other pages on the same address can technically read these keys. Prefixed keys avoid collisions; do not type private information into these games.
* **Stored spellings.** Shared progress stores outcomes and opaque player ids with preset animal labels, not typed spellings or real names.
* **Audio is pre-recorded.** The page plays local files. It does not use the browser's speech service or any microphone.
* **Super Sevens saves its own small record.** Under the key `wordwild.sevens.v1` it stores the look you picked (Fire, Space or Candy), the range, whether sound is muted, best times, medals and a play count. No names, no answers and no personal information. Clearing site data, or the "Erase my scores" button on its menu, removes it.
* **Tricky Facts keeps a tiny memory.** In the same `wordwild.sevens.v1` record it stores, for each fact from 0 to 20, a level from 1 to 4 and the round when it is due again, plus a round counter. No names and no typed answers.
