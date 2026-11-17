# Report 046: What the research says about games for people living with cognitive decline, and how WordWild measures up

**Date:** 2026-11-17. **Prompt:** [046](../prompts/046_cognitive_research.md). **Status:** research and audit only. No game code was changed. A calm mode is **recommended below, not built**; the owner decides.

## The short version

- The research we could get says that **enjoyable, mentally engaging activity is reasonable to offer**, and that **claims a game protects or improves the brain are not supported** for commercial-style brain games. For structured, supervised training the picture is small, mixed and limited to specific skills.
- For this audience the design guidance is consistent: **no time pressure, forgiving feedback, big and few controls, predictable layouts, quiet and calm, and someone to play with**.
- Against that, the **Super Sevens clock modes work against this audience** (countdown, +5 second clue penalty, a screen that turns red and throbs, shake and red flash on a wrong answer). Most of the other games already fit better, and two of them already have a calm toggle.
- A **single shared Calm setting** looks like it would address most of these points, with effort I estimate as modest (an unvalidated estimate from reading the code, not a tested result). No health data is needed to do that.

## What I could and could not read (limits first)

I gathered 21 files (about 17 MB; manifest with URLs, licences and SHA-256 hashes is in the local-research repository, not here). Of those, 8 are full open-access papers or reviews, 4 are W3C accessibility pages, and the rest are summary or web pages. **The strongest evidence sources were not obtainable:** the full WHO guideline (second edition), the full national dementia guideline text, the full critical review of brain-training claims, the full Global Council on Brain Health report, and the Cochrane reviews on cognitive stimulation, cognitive training and reminiscence. Those hosts refused or blocked automated requests, and I did not work around them. Where I hold only a landing page, I say so and do not rely on it. I read abstracts and targeted passages, not every page of every file. Takeaways are my own words from the documents' own claims; treat anything surprising as unchecked.

## Sources by topic

Short names used below. "Full" means the full text was read in part; "page" means a web page or summary only.

| Short name | What it is | Held as |
|---|---|---|
| **Computer training, healthy adults (2014)** | Meta-analysis of computerised training in healthy older adults | full, open access |
| **Computer interventions, cognitive decline (2023)** | Systematic review with meta-analyses, community-dwelling people with cognitive decline | full, open access |
| **Technology training for MCI (2018)** | Systematic review of 26 studies | full, open access |
| **Software for MCI and dementia (2020)** | Systematic review of programs (19 studies, 11 programs) | full, open access |
| **Memory decline, non-drug (2012)** | Review of memory interventions in MCI and Alzheimer's | full, open access (non-commercial licence) |
| **Errorless learning trial (2017)** | Randomised trial in people with dementia living at home | full, open access |
| **Brain-training consensus (2014)** | Statement from a university longevity centre and a research institute | page |
| **Brain-training review summary (2016)** | Summary page of a major critical review | page (full review not held) |
| **Brain-health council summary (2017)** | AARP page describing the Global Council on Brain Health report | page (full report not held) |
| **National guideline, public summary (2018)** | Four-page public summary of the UK dementia guideline | summary (guideline text not held) |
| **WHO guideline, 2nd edition (2026)** | Landing page only | page (PDF not held; **not relied on**) |
| **Serious-games recommendations (2014)**, **Delphi panel (2017)**, **Design recommendations (2018)** | Three expert-panel and perspective papers on games for neurodegenerative disease | full, open access |
| **Games for dementia care review (2016)** | Conference review of games built for dementia care | full |
| **Older-adult cognitive game study (2017)** | Design-based study with older players | full, open access |
| **Cognitive accessibility note (2021)** | W3C note on making content usable for cognitive and learning disabilities | full page |
| **WCAG 2.2 pages (2023)** | "Pause, Stop, Hide", "Target Size (Minimum)", "Timing Adjustable" | full pages |
| **Activity ideas for dementia (n.d.)** | A national Alzheimer's charity's web page for carers | page |

### Topic 1: cognitive stimulation and training, and what is not supported

- **Computer training, healthy adults (2014).** Across about 50 trials the average benefit on untrained tests was small, it varied by skill, and it was larger for supervised group training than for training done alone at home. More than three sessions a week did no better than fewer. It covers healthy older adults only and does not show the gains last.
- **Computer interventions, cognitive decline (2023).** For people with MCI there were gains in some areas (memory, attention and speed, executive function) but not in overall cognition; for dementia the memory result leaned positive but was not statistically significant. The authors treat the evidence as limited.
- **Technology training for MCI (2018).** Results were promising but inconsistent: overall cognition improved in a minority of studies and memory in most. Adjusting difficulty to how the person is doing was a common and apparently important feature.
- **Software for MCI and dementia (2020).** Reports that programs exist and describes how they work; it does not settle whether they help. Useful mainly for how such programs are built and delivered.
- **Memory decline, non-drug (2012).** Memory training may improve performance in people with memory problems, but the authors say more studies are needed to know its real value.
- **Errorless learning trial (2017).** A structured relearning programme helped daily tasks and the gain lasted six months, but the errorless method did **no better** than ordinary trial and error. So "never let them be wrong" is not shown to be necessary, though gentle handling of mistakes is still good design.
- **Brain-training consensus (2014) and review summary (2016).** Sceptical: practice improves the practised task, transfer to other abilities is weak, claims in advertising are often exaggerated, and no study showed brain games prevent dementia. These are the main reason for rule 1 below.
- **Brain-health council summary (2017).** The council says the evidence that typical "brain games" help brain health is weak to non-existent, and points to activities that are enjoyable, mentally challenging and social, with physical activity and social engagement as added benefits.
- **National guideline public summary (2018) and WHO landing page (2026).** Held only as summaries; **not relied on** for any claim about cognitive training. (A search summary suggested the national guideline offers group cognitive stimulation but not cognitive training for mild to moderate dementia; I could not confirm that from a file I hold. Please check before anyone quotes it.)

**Where the evidence is thin or mixed:** nearly all of it is about *structured programmes*, mostly supervised, not about a free web game. Gains are small and domain-specific; for dementia the results are weaker than for MCI; long-term and everyday-life benefits are largely unshown; many trials are small or poorly controlled. Nothing I read tests word or times-table games like these.

### Topic 2: accessible and dementia-friendly game and interface design

- **Serious-games recommendations (2014), Delphi panel (2017), Design recommendations (2018).** Expert panels agree that games for this audience need simple, consistent controls, clear guidance and immediate feedback, forgiving error handling, adjustable difficulty, and often someone to play with. One panel's participants rated shorter, regular play (two to four days a week) highest; that is opinion, not a trial result.
- **Games for dementia care review (2016).** Most games are built for touch screens to avoid mouse problems, and people need simple guidance and quick feedback. The review argues for play that is fun and emotionally rewarding, not only cognitive drilling, and notes that cognitive decline can bring frustration and anxiety.
- **Older-adult cognitive game study (2017).** Older players struggled with unfamiliar interactions (tapping the wrong part of a control) and the study measured effort and frustration; the practical lesson is to test with real older users and enlarge effective tap areas.
- **Cognitive accessibility note (2021).** Practical patterns: keep things predictable and consistent, reduce memory load, avoid distracting motion, give people time and let them undo mistakes, and involve people with cognitive disabilities in testing.
- **WCAG 2.2 pages (2023).** The accessibility standard says time limits should be removable, adjustable or extendable; moving or blinking content should be pausable; and tap targets should be at least 24 by 24 CSS pixels (a minimum, not a comfortable size). These are accessibility rules, not proof about cognitive outcomes.

**Where it is thin:** the game-design material is mostly expert opinion and small design studies. I found no study in what I read that directly tests countdown timers or flashing alerts on people with dementia; the case against them rests on accessibility standards, the panels' emphasis on low frustration, and common sense.

### Topic 3: caregiver-facing activity guidance

- **Activity ideas for dementia (n.d.).** A charity's page for carers lists reading, board games, puzzles and apps among activities that exercise the mind, suggests adapting games that get hard (larger pieces, simpler rules, a helper), and stresses things the person still enjoys.
- **Brain-health council summary (2017)** supports the same message: choose activities that are enjoyable and fit the person's schedule, ideally with others.
- Thin: I could not obtain the national health institute's caregiver activity guides (blocked), so this topic rests on one charity page plus the panel papers.

## What the research would support us saying, and what it would not

**Would support (cite the sources above if asked):**
- WordWild can be offered as *gentle, enjoyable mental activity* that can be played alone or with a friend or carer.
- We designed it with common cognitive-accessibility guidance in mind (once that is true): no clock in calm mode, large buttons, forgiving wording, quiet and calm settings, nothing collected.
- Enjoyable, social, mentally engaging activity is a reasonable thing to offer, and is not claimed to do more.

**Would NOT support:**
- That the games prevent, delay, slow, treat or improve dementia, MCI, memory loss or "brain health", or "keep your brain young".
- That playing makes people better at everyday tasks, or that results transfer beyond the games.
- That timed play, streaks or medals help this audience (the gathered sources point the other way or are silent).
- That any "level", score or time reflects a person's cognition. The games must never present scores as a health measure.
- Any statement that sounds like screening or diagnosis.

## Reading the games against it

Checked in the code and by loading the live pages (the live pages all returned normally; I did not render them in a browser or test on a phone, so touch behaviour is unverified). "Fits" and "works against" are about this audience only; none of this is a defect for the children the games were made for.

### Super Sevens (and Math Mayhem times tables) — largest gap

| Fits already | Works against |
|---|---|
| Five modes are untimed (Practice, Guess the Missing Number, Tricky Facts, Build It, Count By). | Two modes are timed: **Bronze, Silver and Gold clock challenges** (a countdown with a hard limit of 60 to 150 seconds) and **Stopwatch**. |
| Wrong answers allow retry; wording is plain ("Not quite. Try again!"). | **A clue costs 5 seconds** in timed modes ("Think (+5s)"), so help is penalised. |
| Two-step help ("Think" then more help) and a Count With Me fallback. | **The screen changes colour as time runs out**: the timer box throbs, and in the last stage a **red tint pulses**. |
| A Sound effects switch exists on the menu; sound starts only after a button press. | **A wrong answer shakes the card and flashes the screen red.** Plus fly-up "+5s" text. |
| Medals and streaks are optional extras on top of untimed play. | **Streak cheers** ("N in a row", confetti) and medal drops with bouncing and large animated celebration. |
| Large type on the question (about 2 to 3.6 rem) and big keypad keys (about 42 to 58 px). | Constant ambient animation (rising flames, drifting stars, swaying candy) runs in all three looks, and the clue and question elements wiggle on a loop. Motion is only turned off if the **device** asks for reduced motion; there is **no in-game switch**. |
| Reduced-motion CSS exists. | Small text in places: build-it row labels about 0.7 to 0.8 rem, rhyme text about 0.9 rem on short screens, medal and star badges. Some small buttons are 44 px tall (OK) but several elements are smaller. |
| Progress is stored only in the browser; no health data. | Keypad shrinks on short screens (to about 42 px high), below a comfortable size for tremor or reduced dexterity. |

### Roll and Read (the main page)

| Fits already | Works against |
|---|---|
| No countdown; the only interval is the die-rolling animation. | **Partner race and a scoreboard** add competition and comparison. |
| Large base text (18 px) and big buttons (about 58 to 68 px). | Animated, tumbling dice; vibration and sound (a mute button exists, sound defaults on). |
| Reduced-motion rule present; "Hear it" spoken support; the teacher-sheet instruction page says stop when tired. | Written for children ("Read with your child"); wording and theme are not age-neutral. Not checked line by line. |

### Professor Potato's Flashcards

| Fits already | Works against |
|---|---|
| **No timers or scores that punish.** Hint and Study options after two wrong tries. | Mascot jokes on a wrong answer ("Oof! Even a professor potato makes mistakes", "Mashed potatoes are made of tries!") are playful for children but **not age-respectful** for adults. |
| **An in-game "Calm mode" checkbox** (less wiggling and confetti) and a Sound effects checkbox; it also follows the device's reduced-motion setting. | Child-themed art and word list (spelling words from a third-grade list), so the content is not a fit for adults. |
| Large word display (2 to 3.2 rem), text input about 1.6 rem, 60 px high field. | Some small badge text (0.7 rem tags). |

### Impossible 3D Printer, second edition (printer-v2)

| Fits already | Works against |
|---|---|
| **No timer**; scoring is honest about help ("after reveal"), and a **Help Me ladder** is always available. | Some small text: tags and hints around 0.75 to 0.9 rem. |
| **A Calm toggle** and a mute control; follows the device's reduced-motion setting. | Child framing (robot, castle, rocket) and a spelling list for children. |
| Input and primary buttons 56 to 70 px high; the page respects dark mode. | Wrong-answer wording was only spot-checked ("Not quite", "Stuck? That is okay"), not read in full. |

### Impossible 3D Printer, first edition (game/)

| Fits already | Works against |
|---|---|
| No timer in the game's script (no interval, clock or countdown; one focus delay only); a reduced-motion rule exists; buttons 48 to 52 px. | Least reviewed of the set. The heavy animated stylesheet (about 1,500 lines, five keyframe sets, a tall 300 to 515 px scene area) and audio were not examined closely. Superseded by the second edition. |

### WordWild arcade chooser and Math Mayhem hub

| Fits already | Works against |
|---|---|
| Plain tile layout, "skip to content" link on the hub, tap targets at least 44 px, no timer, no audio. | The Math Mayhem hub uses flames and "Beat the clock. Win the medal." as its tagline, which sets a pressured tone before play. A "Next drill" tile is a dead link marked disabled. |
| Back links on every page. | No setting on either page; a shared calm preference does not exist yet. |

### Cross-cutting

- Settings are stored in each game's own browser key; there is **no shared "calm" preference** across games.
- **No game was found to have a short, predictable session limit** (not checked exhaustively) (a natural "that's enough for today" ending); the research I read suggests short regular sessions are sensible, though that is panel opinion.
- **Content** (third-grade spelling, times tables, silly clues) is aimed at children. Word lists and prompts that are familiar and age-respectful are a separate piece of work (task T1.4).

## Recommendation: a "Calm mode" setting (not a new game)

One shared setting, off by default, stored locally with the other game settings under a single key (a plain on/off preference; it must not be labelled as a health or diagnostic setting, and no profile, score or log of health may ever be added). When on, in every game:

1. **No clock anywhere.** Super Sevens hides the clock challenges and the Stopwatch; only untimed modes are offered. Any remaining time display is removed.
2. **No penalty for help.** The "+5s" cost goes away; help is always free and never marked as a mistake (the "bulb" outcome stays neutral).
3. **No flashing, shaking, throbbing or tinting.** No red alert colours; no ambient animation; fewer and slower transitions (this also covers the "reduced motion" request).
4. **Quiet by default.** Sound off unless the person turns it on; no vibration; no loud effect on success.
5. **Bigger and fewer controls.** Larger text (a step up from now), larger tap areas (about 56 px or more), more spacing, one clear action per screen.
6. **Gentle wording.** Neutral, short feedback on a wrong answer ("That's not it. Have another go."), no mascot jokes, no streak or "in a row" messages, no ranking or comparison, no partner scoreboard.
7. **Short, predictable sessions.** For example a fixed small number of questions, then an unhurried "That's a good place to stop" screen, with the option to continue.
8. **Reminder:** it is a comfort setting. We do not claim it treats or improves anything.

**Rough effort** (focused AI-assisted sessions, plus a person to try it): Super Sevens, the largest piece, 1 to 2 sessions (hide timed modes, remove the penalty and alerts, calm CSS); the shared setting and its storage key, half a session; Flashcards and the second printer edition already have a toggle and need it widened and joined to the shared setting, about one session together; Roll and Read, half to one session (partner scoreboard, vibration, dice); tests for each, one session; **a human trial with a few consenting older adults or carers is separate, and is the real test** (not started). Reviewing the child-themed content for adults is a distinct, larger job.

## Open questions for the owner

1. Do we build the shared Calm mode, and in what order (Super Sevens first)?
2. Should calm mode be a toggle on each game, or one switch on the arcade page that every game obeys?
3. Do we want adult-oriented content (reminiscence-style prompts, familiar everyday words), or is Calm mode on the existing content enough for now?
4. Who could try it with consent (older adults or carers), and where do we record the findings (`KNOWN_LIMITS.md`)?

## What was not done or not checked

- Games were read in code and the live pages were fetched; **no browser or phone test, no screen reader test, no test with any person.**
- Source reading was partial (abstracts and targeted passages), and the strongest sources could not be obtained (see above). The conclusions about evidence are therefore a cautious floor, not a full review.
- No game code, content or tests were changed. `scripts/public_audit.py` and the page tests were run after writing this report; results are in the pull request.
