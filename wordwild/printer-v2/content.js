// Content loading. The ONLY authoritative source is ../content/list14_words_v1.json (PR #11). Nothing is rewritten here.
export const CONTENT_URL = "../content/list14_words_v1.json";

export async function loadContent(fetchFn = globalThis.fetch, url = CONTENT_URL) {
  const r = await fetchFn(url);
  if (!r.ok) throw new Error("Could not load the word list (" + r.status + ")");
  return checkContent(await r.json());
}

/** Minimal runtime sanity check. The real validator is tools/validate_list14_content.py. */
export function checkContent(doc) {
  if (!doc || doc.schemaVersion !== 1 || !Array.isArray(doc.words) || doc.words.length !== 20) throw new Error("Unexpected content package");
  for (const w of doc.words) {
    if (!w.id || !w.word || !w.clues?.primary || !w.jokes?.length || !w.miniCheck || !w.help) throw new Error("Incomplete word: " + (w.id || "?"));
  }
  return doc;
}

export const wordList = (doc) => doc.words.map((w) => w.word);
export const byWord = (doc, word) => doc.words.find((w) => w.word === word);

// One-line previews for alternates whose key vocabulary a 3rd grader may not know (PR #11 review item 4).
// Builder-side display text only; the content package is not edited. Shown before the joke, never required to get help.
export const PREVIEWS = Object.freeze({
  "list14-ladder-primary-v1": "Quick word: an adder is a kind of snake.",
  "list14-tiger-alternate-v1": "Quick word: a liger is half lion and half tiger.",
  "list14-chapter-alternate-v1": "Quick word: 'chap' is an old-fashioned word for a guy.",
});
