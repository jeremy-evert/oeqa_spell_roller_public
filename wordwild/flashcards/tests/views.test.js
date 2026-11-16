import test from "node:test";
import assert from "node:assert/strict";
import { WORDS } from "../words.js";
import { CardRun, Progress, blankState, hintFor } from "../engine.js";
import { cardView, flipFrontView, homeView, resultView, flipBackView } from "../views.js";

const settings = { muted: false, reducedMotion: false, accessible: false };
const idx = (w) => WORDS.indexOf(w);

test("ANSWER HIDDEN: a fresh scored card never contains its word anywhere (text, aria, alt, attributes)", () => {
  for (const w of WORDS) {
    const html = cardView({ w, run: new CardRun(w.word), index: idx(w), total: 20 }).toLowerCase();
    assert.ok(!html.includes(w.word), `${w.word} leaked on a fresh card`);
  }
});
test("ANSWER HIDDEN: still hidden after wrong tries, a hint and feedback", () => {
  for (const w of WORDS) {
    const run = new CardRun(w.word); run.submit("zz"); run.submit("zzz"); const hint = run.useHint();
    const line = "Oof! " + run.lastFeedback.message;
    const html = cardView({ w, run, index: 0, total: 20, hint, mascotLine: line }).toLowerCase();
    assert.ok(!html.includes(w.word), `${w.word} leaked after hint/feedback`);
  }
});
test("ANSWER HIDDEN: Flip & Learn front never shows the word", () => {
  for (const w of WORDS) assert.ok(!flipFrontView({ w, index: 0, total: 20 }).toLowerCase().includes(w.word), w.word);
});
test("ANSWER HIDDEN: the answer-hidden recall after studying hides it again", () => {
  for (const w of WORDS) {
    const run = new CardRun(w.word); run.reveal(); run.tryFromMemory();
    assert.ok(!cardView({ w, run, index: 0, total: 20 }).toLowerCase().includes(w.word), w.word);
  }
});
test("study view DOES show the word (explicit reveal), and the input is gone", () => {
  const w = WORDS[0]; const run = new CardRun(w.word); run.reveal();
  const html = cardView({ w, run, index: 0, total: 20 });
  assert.ok(html.toLowerCase().includes(w.word)); assert.ok(!html.includes('id="ans"'));
});
test("the home screen lists no words (only numbered progress dots)", () => {
  const p = new Progress(blankState()); const html = homeView(p, settings, true).toLowerCase();
  for (const w of WORDS) assert.ok(!html.includes(`>${w.word}<`) && !html.includes(w.word + " "), `home leaks ${w.word}`);
});
test("the text input switches off browser spell-check, autocorrect and autocapitalize", () => {
  const html = cardView({ w: WORDS[0], run: new CardRun("supper"), index: 0, total: 20 });
  for (const attr of ['spellcheck="false"', 'autocorrect="off"', 'autocapitalize="off"', 'autocomplete="off"']) assert.ok(html.includes(attr), attr);
});
test("no external URLs anywhere in any view (no CDN, no network)", () => {
  const w = WORDS[3]; const run = new CardRun(w.word); run.submit(w.word);
  const all = [homeView(new Progress(blankState()), settings, true), cardView({ w, run: new CardRun(w.word), index: 0, total: 20 }),
    resultView({ w, run, index: 0, total: 20, cheer: "Yay", last: false }), flipFrontView({ w, index: 0, total: 20 }), flipBackView({ w, index: 0, total: 20 })].join("");
  assert.doesNotMatch(all, /https?:\/\//);
  assert.doesNotMatch(all, /xlink:href|<img|<script|<link/);
});
test("accessible mode is labelled honestly as not independent", () => {
  const w = WORDS[0]; const html = cardView({ w, run: new CardRun(w.word, { accessible: true }), index: 0, total: 20 });
  assert.match(html, /will not count as spelling by yourself/);
});
test("result view highlights the word and states the outcome in words, not color alone", () => {
  const w = WORDS[6]; const run = new CardRun(w.word); run.submit("sokker"); run.submit(w.word);
  const html = resultView({ w, run, index: 6, total: 20, cheer: "Spelltacular!", last: false });
  assert.match(html, /<mark>/); assert.match(html, /Got it on a retry/);
});
