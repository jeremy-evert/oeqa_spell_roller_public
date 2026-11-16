# Example prompt: how we directed the AI

> Published as a teaching example, condensed and scrubbed from the original assignment. Names, machines and paths are removed.

**Objective:** finish the missing narration clips for the newest game and verify that the three games launch from one arcade.

**Rules we gave the assistant (these are the part worth copying):**
1. Execute, do not just plan. No new writing round.
2. **Preserve** what already works: do not overwrite the four clips a person already approved.
3. **Local only:** generate audio with the local model. No web API, no payments, no browser speech.
4. **Listen** to a varied sample. If a phrase sounds wrong, fix the *voice text only* in an override file; do not edit the content or change stable ids. Document every override.
5. Keep mnemonic and phonics honestly separate: never teach "two letters means two sounds".
6. **Run the tests and report real results.** Do not claim a test passed until it ran. Do not weaken a test to make it pass.
7. Put the work on its own branch with a small pull request. Do not merge.
8. Say plainly what was *not* verified.

**What came back:** a branch, a report ([report_audio_completion.md](report_audio_completion.md)), and a list of what still needs a human ear.

**Why this prompt works as a model:** it names the finish line, protects existing work, sets honest-reporting rules, and keeps a person as the approver.
