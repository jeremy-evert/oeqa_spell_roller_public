# The story of how WordWild was made

*A short, honest timeline. Dates are from the project's records (2026-11-15 to 2026-11-16). The project moved fast, in small steps, with a person approving each one. Mistakes are included on purpose.*

## 1. The idea (Nov 15)
A parent wanted a funny, safe spelling game for a third grader's weekly word lists. Thirty-two lists were gathered into one place. The first target was **List 14**: 20 words, two of them review words. The rule from day one: *the answer is never shown before the child tries, and help is honest about how much it gave away.*

## 2. Research first, with an honest scorecard (Nov 15)
Before building, we asked questions of a small library of learning-science and phonics sources and wrote the answers as "evidence cards", each with a status. The scorecard was mixed: some answers were **verified**, many were **provisional**, a few **failed to retrieve**, and several needed **outside literature we did not have**. We recorded that instead of pretending. The raw cards are not published (they quote copyrighted books), but the honest-status habit shaped everything after.

## 3. A plan with phases (Nov 15)
A written plan split the work into missions (word-rule inventory, a first playable printer, audio flashcards, a shared-progress idea, an arcade). Each mission had an owner, a finish line, and "what not to touch".

## 4. The writers' room, and what went wrong (Nov 15)
We asked several AI models to write funny memory tricks for each word, blind and in parallel. The first round was unusable in places. The second round (prompt 041) was better, then a review found real problems: written letters taught as if they were spoken sounds ("two P's = two P sounds"), a word-part trick sold as a literal meaning, a joke idea we planted in the prompt that came back as supposedly independent, and 13 of 20 jokes using the same rhyme trick. See [the prompt](../sidecar/prompts/041_spelling_memory_writers_room.md) and [its report](../sidecar/reports/041_spelling_memory_writers_room_report.md). **Lesson:** a prompt can seed what you get back; check the facts, not just the fun.

## 5. First playable: Flashcards (Nov 15)
The first game was Professor Potato's Flashcards: hear a silly sentence, spell the word. The parent's child played it with them, laughed, and played two rounds. That one informal success is all the evidence we have, and the notes say so.

## 6. A mistake we found in our own work (Nov 15)
While checking pronunciation we found two wrong notes in that first game: it said the "g" in *tiger* sounds like "j" (it is a hard g), and that one of the "c"s in *soccer* sounds like "s" (the two c's are written together and the middle sound is /k/). Our own earlier story draft had the same error. We did not quietly fix it: we wrote it down as a correction in the content file and in the report, and fixed the game in a separate, reviewable change.

## 7. The final content package (Nov 15)
One assistant made a final pass over all 20 words and wrote [prompt 042](../sidecar/prompts/042_final_list14_story_package_for_builder.md): 42 memory tricks as data, each labeled by how true it is (a memory trick, a real observation about the word, or a review-only rule), plus a **validator** that fails if a clue leaks the answer, if a joke omits the word, or if a rule slips in front of a child. The validator caught two defects in the writer's own work. See [the report](../sidecar/reports/042_final_list14_story_package_for_builder_report.md).

## 8. The second-edition printer (Nov 15-16)
A new printer game was built from that package: a visible Help Me ladder, five honest result types (alone, after a retry, with help, after the word was shown, skipped), a printer that really builds a robot, rocket or castle, and progress kept only in the browser. Automated tests caught a mistake we would have shipped: help labels like "Help ladder" and "Another clue" put the answer words *ladder* and *another* on screen before the child answered. We renamed them.

## 9. The voice (Nov 15-16)
Every spoken clip comes from a **local** text-to-speech model, so nothing is sent to a web service. A person heard the first four samples and liked the voice. The other 38 clips were rendered next, and a speech-to-text check flagged clips the voice read badly ("THHH" spelled letter by letter; "liger" read as a name). Four got voice-only respellings. One joke ("P, P") sounds like something else entirely, and we kept it. See [prompt 045](../sidecar/prompts/045_finish_kokoro_and_arcade.md) and [report](../sidecar/reports/045_finish_kokoro_and_arcade_report.md).

## 10. Going public (Nov 16)
The public repo already held a different game, live on a web page, so WordWild was **added beside it**, never over it. Making the copy public-safe meant:
* switching the arcade from root-absolute links (which break under a project web address) to relative ones;
* rewording one note that named a child, and finding no other names in the code, the content or the spoken audio (see the receipt in `sidecar/runs/`);
* adding a license line for every asset, and leaving out anything unlicensed or private;
* changing one test that read a private file so it runs on public data only, and one test whose "game folder missing" assumption was no longer true;
* writing down what is **not** tested (touch screens, other browsers, a child's use, human listening to most clips).

## What went wrong, in one list
Wrong pronunciation notes. A planted idea returned as "independent". Help labels that leaked answers. Voice read sound-effects as letters. Two tests that quietly depended on private files or on a game being absent. Each was found by checking, then recorded.

## What we would tell you
Make a small thing. Write down what you asked for and what came back. Test it. Say what you did not test. Then [do it yourself](HOW_TO_DO_THIS.md).
