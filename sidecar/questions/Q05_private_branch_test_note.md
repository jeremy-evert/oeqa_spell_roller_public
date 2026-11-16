# Q05: FYI, a stale test on the private integration branch
**Needs:** nobody yet. `tests/arcade_browser_smoke.mjs` on the private integration branch fails when all games are present (it assumes "absent games"). The public copy hides the game folders from its test server to keep the test meaningful. The private branch should get the same one-line fix.
