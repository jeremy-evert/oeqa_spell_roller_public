# Jeremy's decisions, 2026-11-16 (for Flo)

Recorded by Anna after Jeremy answered the open questions. These replace questions Q01-Q04.

1. **Spelling words: publish.** Credit the school as the source of the weekly list. Only the 20 List 14 words are used, not the whole list document. Done in `wordwild/ASSETS.md`.
2. **Who wrote what:** the split covers Codex, Claude Code, Claude, ChatGPT, Gemini, Grok, DeepSeek, Jeremy, and the school. Done in `wordwild/HOW_IT_WAS_MADE.md`. (Jeremy should skim it once for accuracy; roles come from project records.)
3. **Kokoro voices file license: verified upstream.** Model weights Apache-2.0, `kokoro-onnx` MIT, voices file described as style vectors of the model with no separate license; local file sizes match the release. Recorded in `wordwild/ASSETS.md`. Size match only; GitHub gave no checksum.
4. **Child mention: approved.** `STORY.md` says the parent's child played the game with them. No names anywhere.
5. **Linking `wordwild/` from the root `README.md`:** still open; Flo's landing page will link it.

## For the merge
* The public repo's `main` is **not protected**; Pages builds from `main` (`/`). Merging publishes within minutes.
* Commits on this branch are squashed into one, authored with the GitHub no-reply address already used on `main`, so no machine name or school email is added. (Older commits already on `main` carry a host-style author name and a school email; that is not changed here.)
* Waiting only on Jeremy's explicit "publish", then Flo's diff review against `CHECKLIST.md`.
