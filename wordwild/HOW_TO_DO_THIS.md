# Your turn: show off your own work

A student-sized path. About an hour for a small project. Steps marked 🤖 are where AI can help; **a person must check** what it produces.

1. **Pick one small thing.** One game, tool or report. Write one sentence: what is it, who is it for?
2. **Start a repo** with a remote, from minute one. Product files at the top; a folder called `sidecar/` for process.
3. **Add `sidecar/`.** Copy the layout in [`sidecar/README.md`](../sidecar/README.md): `prompts/`, `reports/`, `questions/`, `runs/`.
4. **Write one prompt.** `sidecar/prompts/01_your_thing.md`. Say the finish line, what must not be changed, "use only local/free tools", and "report what you did not test". Model: [prompt 045](../sidecar/prompts/045_finish_kokoro_and_arcade.md). 🤖 AI does the work; **you** decide the finish line.
5. **Get its report.** Save the answer as `sidecar/reports/01_your_thing_report.md`. Read the "not verified" part first. 🤖 **Check:** run what it says it ran. If it says tests passed, run them.
6. **Add one test.** Even one. Example: "the word list has exactly 20 words" ([`flashcards/tests/words.test.js`](flashcards/tests/words.test.js)). Run it: `node --test`. 🤖 AI can write it; **you** make sure it can fail (break the data on purpose and watch it fail).
7. **Write the honest notes.** README (what it is, how to try it), `ASSETS.md` (what you did not make, with licenses), `HOW_IT_WAS_MADE.md` (tools including AI, what a person checked), `PRIVACY.md`, `KNOWN_LIMITS.md`. Copy the headings from [this folder](./).
8. **Run the checklist:** [`CHECKLIST.md`](../CHECKLIST.md). Every box needs evidence, not memory. Run an audit script like [`scripts/public_audit.py`](../scripts/public_audit.py) for names, paths and secrets, keeping your own list of private names **outside** the repo.
9. **Publish on a branch**, get a second pair of eyes, merge, then test the **live** link in a private window and on a phone.
10. **Know how to take it down** and who to tell.

## What AI did here, and what a person must check
| AI helped with | A person must check |
|---|---|
| Drafting code, tests, wording | That it runs, and that the tests can fail |
| Writing README and notes | That every claim is true and tested |
| Finding private info with a script | The script's counts, and a human read of anything public |
| Suggesting licenses | The real license of every asset; ask your instructor if unsure |
