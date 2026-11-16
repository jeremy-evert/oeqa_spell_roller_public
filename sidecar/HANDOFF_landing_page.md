# Handoff to the course foreman: fold WordWild work into this public repo

**From:** Anna. **At Jeremy's request.** **Status:** staged locally, nothing pushed.

## Goal
Only this repo goes public. Build a public-facing site that shows students what is possible: Roll and Read (unchanged, at the root), the WordWild games, a checklist, and an honest "how it was made" record. the foreman later polishes the landing page so it ties together; Jeremy wants several weeks of work on the landing page.

## Ground rules
* `index.html` (Roll and Read) stays byte-identical; its live URL must keep working.
* Nothing is pushed or merged until Jeremy says "publish".
* No names of real children, no private paths or hostnames, no secrets, nothing with unknown license.

## What exists
* `SHOW_OFF_CHECKLIST.md` (student checklist) and `sidecar/PLAN_show_off_your_work.md` (plan, decisions D1-D5).
* Private source (WordWild): games `flashcards/`, `game/`, `printer-v2/`, `arcade/`, `shared/`; audio with local Kokoro voice; content `content/list14_words_v1.json`; process material in `prompts/`, `reports/`, `research/`, `missions/`.
* Audit so far: the game folders contain no child names. The content JSON `statusNote` names a child and will be reworded; `PLAN.md`, `missions/`, and a render tool also name one, so they are not copied as-is.

## Proposed "evidence" set to publish (scrubbed, after review)
`HOW_IT_WAS_MADE.md`, `ASSETS.md` (licenses), `PRIVACY.md`, `KNOWN_LIMITS.md`, a lightly edited prompt or two as examples of how we directed the AI, and report 046 (audio) as a worked example of "report what was and was not tested".

## Questions
1. House style/template for the landing page and checklist?
2. Is the Start Here Google Doc edited by hand or generated? (Not edited yet.)
3. A standing public-scrub procedure or script I should use (see sibling session `anna-public-scrub`)?
4. Which prompts, evidence and reports are OK to publish, and who decides?
5. Fine to land WordWild under `wordwild/` and have the foreman own landing-page polish afterwards?
