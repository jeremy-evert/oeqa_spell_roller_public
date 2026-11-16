# `sidecar/`: the process lives here, the product lives outside

A **product** is what people use: the game, the page, the report you hand in. A **sidecar** is how you made it: the assignments you wrote, what came back, the questions you asked, and the plan. Keeping them apart means a visitor sees a clean project, and you (or your teacher) can still check the work.

```
oeqa_spell_roller_public/
├── index.html              ← product: Roll and Read (unchanged)
├── wordwild/               ← product: three spelling games, README, honest notes
├── CHECKLIST.md            ← product: the public-release checklist
└── sidecar/                ← process, not product
    ├── README.md           ← you are here
    ├── PLAN_show_your_work.md   the plan and the decisions
    ├── LANDING_MANIFEST.md      where each piece of the landing page lives
    ├── prompts/            ← what we asked the AI to do (numbered)
    │   └── 042_final_list14_story_package_for_builder.md
    ├── reports/            ← what came back (same number + "_report")
    │   └── 042_final_list14_story_package_for_builder_report.md
    ├── questions/          ← things a person must decide (not buried in chat)
    └── runs/               ← receipts of audits and test runs
```

## The convention in four rules
1. **Number it.** `prompts/NN_slug.md` is the assignment. `reports/NN_slug_report.md` is the answer. Same number, same slug, so a pair is easy to find.
2. **Report honestly.** A report says what was done, what was tested, and what was **not**. See any report's "not verified" section.
3. **Questions go in `questions/`**, one file each, so a person can find what is waiting on them.
4. **Receipts go in `runs/`**: a test run, an audit, with counts and dates, never secrets or private names.

## Real pairs to read
| Prompt | Report | What it teaches |
|---|---|---|
| [041](prompts/041_spelling_memory_writers_room.md) | [report](reports/041_spelling_memory_writers_room_report.md) | **A prompt that was redirected.** It improved on an earlier try but still produced wrong facts and copied ideas. The report is the "what went wrong" |
| [042](prompts/042_final_list14_story_package_for_builder.md) | [report](reports/042_final_list14_story_package_for_builder_report.md) | **A prompt that went well**: clear deliverables, a validator, honest labels |
| [045](prompts/045_finish_kokoro_and_arcade.md) | [report](reports/045_finish_kokoro_and_arcade_report.md) | **Finish line + honest testing**: local audio, real test results, a list of what is unverified |

Names, machines and private paths were removed from these copies (`scripts/scrub_copy.py`, then `scripts/public_audit.py`).

## Try it on your own project
See [`wordwild/HOW_TO_DO_THIS.md`](../wordwild/HOW_TO_DO_THIS.md).
