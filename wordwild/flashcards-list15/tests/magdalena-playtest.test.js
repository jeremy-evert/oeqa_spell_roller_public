import test from "node:test";
import assert from "node:assert/strict";
import { WORDS } from "../words.js";
import { OUTCOME, Progress, blankState, migrate } from "../engine.js";
import { breakView, homeView } from "../views.js";
import { potatoSVG, setPotatoHat } from "../art.js";

const rows = (outcome) => WORDS.slice(0, 5).map((w) => ({ word: w.word, outcome }));
const breakHtml = (hasMore, trickyCount = 0) => breakView({
  rows: rows(OUTCOME.INDEPENDENT), kindLabel: hasMore ? "Five cards" : "All 20",
  hasMore, nextCard: hasMore ? 6 : 21, totalCards: 20, trickyCount,
  stats: { independent: 5 }, overall: hasMore ? null : { independent: 20, total: 20 }
});

test("perfect 5/20 break has a clear Continue to card 6 button", () => {
  const html = breakHtml(true);
  assert.match(html, /data-action="continue"/);
  assert.match(html, /Continue to card 6 of 20/);
  assert.doesNotMatch(html, /data-action="start-review"/);
});

test("last 20/20 break ALWAYS offers Continue practicing, never a dead end", () => {
  const html = breakHtml(false);
  assert.match(html, /data-action="play-another-five"/);
  assert.match(html, /Continue practicing/);
  assert.doesNotMatch(html, /data-action="start-review"/);
});

test("review only appears when there are tricky words, without hiding Continue", () => {
  const html = breakHtml(false, 2);
  assert.match(html, /Practice 2 tricky words/);
  assert.match(html, /data-action="play-another-five"/);
});

test("Potato Points reward effort and never deduct for incorrect attempts", () => {
  const p = new Progress(blankState());
  p.record(WORDS[0].word, OUTCOME.AFTER_HINT);
  assert.equal(p.state.practicePoints, 2);
  p.record(WORDS[1].word, OUTCOME.SKIPPED);
  assert.equal(p.state.practicePoints, 2);
  p.recordStudy(WORDS[2].word);
  p.recordStudy(WORDS[2].word);
  assert.equal(p.state.practicePoints, 3);
  assert.equal(p.chooseHatStyle("starlight"), false);
  for (let i = 0; i < 4; i++) p.record(WORDS[3].word, OUTCOME.AFTER_RETRY);
  assert.equal(p.state.practicePoints, 11);
  assert.equal(p.chooseHatStyle("starlight"), true);
  assert.equal(p.chooseHatStyle("sunshine"), false);
  const restored = migrate(JSON.parse(JSON.stringify(p.state)));
  assert.equal(restored.settings.hatStyle, "starlight");
  assert.equal(restored.practicePoints, 11);
});

test("hat closet is optional, cosmetic, and present in List 15 menu", () => {
  const p = new Progress(blankState());
  const html = homeView(p, p.state.settings, true);
  assert.match(html, /Hat Closet/);
  assert.match(html, /Potato Points/);
  assert.match(html, /All quizzes, hints, and accessibility tools stay available/);
});

test("Professor Potato has a smiling mistake face and earns colored hats", () => {
  setPotatoHat("classic");
  const kind = potatoSVG("oops");
  assert.match(kind, /M85 127 Q100 140 115 127/);
  assert.doesNotMatch(kind, /M62 76 l26 6/);
  setPotatoHat("starlight");
  assert.match(potatoSVG("happy"), /#7954d4/);
  setPotatoHat("sunshine");
  assert.match(potatoSVG("happy"), /#d99616/);
  setPotatoHat("classic");
});
