import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { WORDS } from "../words.js";
import { SCENE_IDS, sceneSVG } from "../art.js";

// PUBLIC COPY: the private project parsed List 14 from a school curriculum file that is not published here.
// This copy checks the games against the published content package instead (content/list14_words_v1.json),
// so the tests run with no private data. Order and spelling of the 20 words must match it exactly.
function list14FromContent() {
  const doc = JSON.parse(readFileSync(new URL("../../content/list14_words_v1.json", import.meta.url), "utf8"));
  return doc.words.map((w, i) => ({ n: w.n ?? i + 1, word: w.word.toLowerCase() }));
}

test("exactly 20 words, in the canonical order, equal to the content package", () => {
  const src = list14FromContent();
  assert.equal(src.length, 20);
  assert.equal(WORDS.length, 20);
  assert.deepEqual(WORDS.map((w) => w.word), src.map((s) => s.word));
});

test("no duplicate words", () => { assert.equal(new Set(WORDS.map((w) => w.word)).size, 20); });

test("exactly two review words: upstairs and staring (also on List 13)", () => {
  assert.deepEqual(WORDS.filter((w) => w.review).map((w) => w.word), ["upstairs", "staring"]);
});

test("every word has a funny sentence containing the word, a clue with a blank, an illustration, and an honest note status", () => {
  for (const w of WORDS) {
    assert.match(w.sentence.toLowerCase(), new RegExp(`\\b${w.word}\\b`), `sentence for ${w.word} must say the word (it is spoken aloud)`);
    assert.match(w.clue, /_{3,}/, `clue for ${w.word} needs a blank`);
    assert.ok(SCENE_IDS.includes(w.art), `scene for ${w.word}`);
    assert.ok(sceneSVG(w.art, w.alt).startsWith("<svg"));
    assert.ok(["word-specific", "supported general pattern"].includes(w.notice.status), `notice status for ${w.word}`);
    assert.ok(w.chunks.join("") === w.word, `chunks must spell the word exactly for ${w.word}`);
    assert.ok(w.sentence.length > 40, "a real joke, not a stub");
  }
});

test("clues and alt text never reveal the target, or any 4+ letter piece of it", () => {
  for (const w of WORDS) {
    for (const [what, text] of [["clue", w.clue], ["alt", w.alt]]) {
      const low = text.toLowerCase();
      for (let L = 4; L <= w.word.length; L++)
        for (let i = 0; i + L <= w.word.length; i++) {
          const piece = w.word.slice(i, i + L);
          assert.ok(!low.includes(piece), `${what} for "${w.word}" leaks "${piece}"`);
        }
    }
  }
});

test("scene SVG markup never contains the target word (title, labels, text)", () => {
  for (const w of WORDS) assert.ok(!sceneSVG(w.art, w.alt).toLowerCase().includes(w.word), w.word);
});

test("no tentative rule is presented as a child-facing fact: no claim words like 'rule' or 'always'", () => {
  for (const w of WORDS) assert.doesNotMatch(w.notice.text, /\b(rule|always|never|all words)\b/i, w.word);
});
