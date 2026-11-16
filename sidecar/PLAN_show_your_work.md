# Plan: how to show off your work

Status: PLAN. Nothing in this file has been built yet.
Branch: `claude/plan-show-your-work`. Reviewer: Jeremy.

## The lesson

> When you want to show off your work, here is what to do well, and here is what to avoid.

This repository is the worked example. `Roll and Read` is a small, real, public project. We use it to teach the habits that make a project safe and pleasant to show to other people. The class will see the finished repository, the checklist, and this plan, including the mistakes we caught on the way.

## What we will make

| # | Deliverable | Where | Purpose |
|---|---|---|---|
| 1 | This plan | `sidecar/PLAN_show_your_work.md` | The work order, and the lesson in outline |
| 2 | Public-release checklist | `CHECKLIST.md` (linked from `README.md`) | Students walk through it before they make anything public |
| 3 | Finished project files | repo root | License, README, credits, how-it-was-made notes |
| 4 | Links to the checklist | `swosu-computing` copy, Computing Commons, CS1, CS2, DSCT and Computer Architecture courses, Start Here Google Doc | Students find the checklist from one place |
| 5 | Short "before and after" write-up | `sidecar/BEFORE_AND_AFTER.md` | Shows what we changed to get from "works" to "ready to show" |

Order of work: 1, 2, 3, 5, then 4 last. The Start Here link is added only when Jeremy says the checklist is ready.

## Do this well

1. **Know who it is for and what it does, in one sentence.** The first lines of the README answer: what is it, who is it for, how do I try it. If a stranger cannot tell in ten seconds, fix the README before anything else.
2. **Make trying it effortless.** A live link beats install steps. Say plainly what is not needed (no account, no install).
3. **Pick a license on purpose and say so.** Put a `LICENSE` file at the root and name it in the README. Know that without a license, others have no right to reuse your work.
4. **Give credit for everything you did not make.** Libraries, fonts, sounds, images, worksheets, ideas, other people's text. Write what it is, where it came from, and the license it came under.
5. **Say how you made it, honestly, including AI tools.** Which tools, what you asked them to do, what you checked yourself. A reader trusts honest notes more than a polished claim. Mark what is original and what is new.
6. **Say what it does with data.** Even "nothing is collected" is worth saying, as this README already does.
7. **Tell the truth about its limits.** What is untested, unreviewed, unfinished, or only works on some phones. A listed gap is a gift to the next person.
8. **Look at it fresh before you publish.** Open the page in a private window and on a phone. Click every link. Read the README as a stranger.
9. **Make it easy to undo.** Work on a branch, publish through a reviewed merge, keep history clean. Publishing is the one step you cannot fully take back.

## Avoid this

1. **Secrets.** Passwords, keys, tokens, and login files. Once public, assume copied forever, even if deleted. If one slips out, rotate it first, then clean up.
2. **Other people's private information.** Names, emails, photos, grades, or work from classmates or students. Get permission, or leave it out.
3. **Your own private information.** Home folder paths, computer names, phone numbers, and location data hidden in files and photos.
4. **Content you do not have the right to share.** Commercial books and course materials, copied images or worksheets, other people's code without its license. "I found it online" is not permission.
5. **Publishing your whole working folder.** Notes, drafts, test data, and scratch files go public with it. Publish a deliberate, trimmed copy, not the workshop.
6. **A missing or contradictory license.** Or a license that does not match what you borrowed.
7. **Overclaiming.** "Educator-approved," "secure," "accurate," or "private" when you did not check. Say what you verified and how.
8. **Hiding the AI help, or trusting it unchecked.** Do not claim sole authorship of what a tool wrote. Do not ship what you did not read and run.
9. **Broken links and dead instructions.** Links to private repos, local paths, or pages that need a login. A student-facing link must work for a stranger.
10. **Leaving it unmaintained with no word.** Say if it is finished, paused, or open for suggestions, and how to reach you.

## Checklist outline (to be written as `CHECKLIST.md`)

Plain language, one page, tick boxes, grouped as: **Before you start** (decide what is public, check rights), **Clean** (secrets, private data, scratch files), **Explain** (README, how it was made, credits, limits), **Legal** (license, third-party material), **Test as a stranger** (fresh browser, phone, every link), **Publish** (branch, review, merge, enable the page), **After** (watch for problems, how to take it down). Each item is a yes/no question a student can answer, with one example from this repo.

Acceptance test for the checklist: a student who has never published anything can follow it to a clean public repo, and a reviewer can mark each box from evidence in the repo, not from memory.

## Work on this repo

Items to confirm or fix, taken from reading the repo as it stands:

- [ ] The README links to `jeremy-evert/oeqa` ("how this was made"). Confirm that page is public and says what we want taught.
- [ ] The game keeps a teacher's worksheet "word for word." Record where the worksheet came from, who owns it, and whether we have permission to republish it under a BSD license. If not, change the wording or the claim.
- [ ] Add `CREDITS` (or a README section): worksheet source, fonts, sounds, any borrowed code.
- [ ] Add a "How this was made" note: tools used, how, and what a person checked.
- [ ] Decide the commit author name shown on the history. The first commit shows a tool name rather than a person or project; decide whether that is the story we want to tell.
- [ ] State the limits in the README: not educator-reviewed, voice typing may use a cloud service (already stated), tested on which phones.
- [ ] Open the live page in a private window on a phone and click every link.
- [ ] Decide what from the private `wordwild` project is allowed here. Nothing moves across without the checklist above, and not the curriculum, research, or mission folders.

## Decisions (Jeremy, 2026-11-16)

1. **Where it lives:** here as `CHECKLIST.md`, duplicated in the `swosu-computing` course site, because that is where students will use it.
2. **Who gets it:** all classes. Post it on Computing Commons and link to it from the CS1, CS2, DSCT and Computer Architecture courses.
3. **Students read it.** It is not a template yet; a template is a future goal.
4. **License:** BSD 2-Clause was Jeremy's choice here. The best default for student work is still open; see below.

## License recommendation (for Jeremy to decide)

- Keep BSD 2-Clause on this repository. Changing a license on a published repo adds noise and gains nothing; BSD 2-Clause and MIT have nearly the same effect.
- Teach a short menu in the checklist: MIT or BSD 2-Clause for code, Creative Commons CC BY 4.0 for writing and images, no license with a clear note for work that stays closed. The checklist already says this.
- The lesson that matters more than which license: **a license covers only what you own.** The worksheet in this game may not be ours to relicense; see the work list above.

## Next steps

- [x] Write `CHECKLIST.md` (this branch).
- [ ] Jeremy reads it and says go or edit.
- [ ] Copy it to `swosu-computing` (separate repo; review before pushing, since that site is public).
- [ ] Post it on Computing Commons and add the link to the CS1, CS2, DSCT and Computer Architecture courses (Canvas writes happen under an authorized mission, not from this plan).
- [ ] Add the link to the course Start Here Google Doc under Quick links.
- [ ] Work the repo to-do list above and write `BEFORE_AND_AFTER.md`.

## Not in scope this week

Moving any private `wordwild` code or content here. Editing the Start Here Google Doc before you say go. Changing the game itself.
