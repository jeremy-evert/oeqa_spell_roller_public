import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { WordRun, OUTCOME, AID, checkAttempt, ladder, rounds, Session, ROUND_SIZE, shuffled } from "../printer-v2/engine.js";
import { SharedProgress } from "../shared/local_progress.js";

const doc = JSON.parse(readFileSync(new URL("../content/list14_words_v1.json", import.meta.url), "utf8"));
const W = (id) => doc.words.find((w) => w.id === id);
const run = (id = "supper") => new WordRun(W(id));

test("checkAttempt gives specific, kind feedback and never contains the answer", () => {
  for (const w of doc.words) {
    for (const bad of ["x" + w.word.slice(1), w.word.slice(0, -1), w.word + "s", "zzz"]) {
      const r = checkAttempt(w.word, bad);
      if (!r.correct) assert.ok(!r.message.toLowerCase().includes(w.word), `feedback leaked ${w.word}`);
    }
  }
  assert.match(checkAttempt("supper", "super").message, /first 3 letters are right/);
});

test("independent: first typed try, answer hidden, no aids", () => {
  const r = run(); assert.equal(r.submit("supper").correct, true); assert.equal(r.outcome, OUTCOME.INDEPENDENT);
});
test("listening, slow audio and the second clue do NOT break independence (they show no letters)", () => {
  const r = run(); r.useAid(AID.LISTEN); r.useAid(AID.SLOW); r.useAid(AID.CLUE2); r.submit("supper");
  assert.equal(r.outcome, OUTCOME.INDEPENDENT); assert.deepEqual(r.aidList.sort(), ["clue2", "listen", "slow"]);
});
test("after_retry: a wrong try first, no letter aid", () => {
  const r = run(); assert.equal(r.submit("super").correct, false); r.submit("supper"); assert.equal(r.outcome, OUTCOME.AFTER_RETRY);
});
for (const aid of [AID.SAY_NOTE, AID.PATTERN, AID.PARTIAL, AID.FIRST]) {
  test(`letter-showing aid "${aid}" makes the success ASSISTED, never independent`, () => {
    const r = run(); r.useAid(aid); r.submit("supper"); assert.equal(r.outcome, OUTCOME.ASSISTED);
  });
}
test("funny memory help shows the word, so success is AFTER_REVEAL and needs a hidden fresh attempt", () => {
  const r = run(); r.openJoke(0);
  assert.equal(r.phase, "study"); assert.equal(r.answerVisible, true);
  assert.equal(r.submit("supper").ignored, true); assert.equal(r.done, false);   // cannot type the visible word
  r.tryFromMemory(); assert.equal(r.answerVisible, false);
  r.submit("supper"); assert.equal(r.outcome, OUTCOME.AFTER_REVEAL);
});
test("Show me the word is also AFTER_REVEAL and reveal outranks letter aids", () => {
  const r = run(); r.useAid(AID.PATTERN); r.reveal(); r.tryFromMemory(); r.submit("supper"); assert.equal(r.outcome, OUTCOME.AFTER_REVEAL);
});
test("skip is its own outcome and later input is ignored", () => {
  const r = run(); r.skip(); assert.equal(r.outcome, OUTCOME.SKIPPED); assert.equal(r.submit("supper").ignored, true);
});
test("the answer is not visible during recall, only in study or when done", () => {
  const r = run(); assert.equal(r.answerVisible, false); r.openJoke(1); assert.equal(r.answerVisible, true);
  r.tryFromMemory(); assert.equal(r.answerVisible, false); r.submit("supper"); assert.equal(r.answerVisible, true);
});
test("empty submit is not an attempt", () => {
  const r = run(); assert.equal(r.submit("   ").empty, true); assert.equal(r.attempts, 0);
});
test("nudge appears after two wrong tries", () => {
  const r = run(); assert.ok(!r.submit("a").nudge); assert.equal(r.submit("b").nudge, true);
});
test("mini-check is supported practice: it never changes the word outcome", () => {
  const r = run(); r.submit("supper"); const before = r.outcome;
  const bad = r.answerMini((r.entry.miniCheck.correctIndex + 1) % r.entry.miniCheck.options.length);
  assert.equal(bad.correct, false); assert.equal(r.outcome, before);
});
test("every outcome from the engine is accepted by the shared progress module for ALL 20 words", () => {
  const words = doc.words.map((w) => w.word);
  const store = new Map(); const mem = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v), removeItem: (k) => store.delete(k) };
  const p = new SharedProgress({ storage: mem, words });
  for (const w of doc.words) {
    for (const make of [
      (r) => r.submit(w.word),
      (r) => { r.useAid(AID.LISTEN); r.submit(w.word); },
      (r) => { r.submit("zz"); r.submit(w.word); },
      (r) => { r.useAid(AID.PATTERN); r.submit(w.word); },
      (r) => { r.openJoke(0); r.tryFromMemory(); r.submit(w.word); },
      (r) => r.skip(),
    ]) { const r = new WordRun(w); make(r); const res = p.record(r.toEvent("printer-v2")); assert.ok(res.ok, `${w.word} ${r.outcome}: ${res.reason}`); }
  }
  assert.equal(p.events().length, 120);
});
test("the help ladder shows A and B for every word, C only where the content has a third joke", () => {
  for (const w of doc.words) {
    const ids = ladder(w).map((s) => s.id);
    assert.ok(ids.includes("jokeA") && ids.includes("jokeB") && ids.includes("reveal"));
    assert.equal(ids.includes("jokeC"), w.jokes.length > 2, w.id);
  }
  assert.deepEqual(ladder(W("supper")).map((s) => s.kind).slice(0, 3), ["free", "free", "free"]);
});
test("the ladder can be used BEFORE any wrong attempt", () => {
  const r = run(); assert.equal(r.wrong, 0); assert.ok(r.useAid(AID.PATTERN)); assert.equal(r.aids.has(AID.PATTERN), true);
});
test("rounds are 4 x 5 in canonical order; sessions cap at 5", () => {
  const words = doc.words.map((w) => w.word), rs = rounds(words);
  assert.equal(rs.length, 4); assert.ok(rs.every((x) => x.length === 5)); assert.deepEqual(rs.flat(), words);
  const s = new Session(words, "x"); assert.equal(s.words.length, ROUND_SIZE);
  for (let i = 0; i < 5; i++) s.complete(i < 2 ? OUTCOME.INDEPENDENT : OUTCOME.ASSISTED);
  assert.equal(s.finished, true); assert.equal(s.independentCount, 2);
  assert.deepEqual(shuffled(words, 7), shuffled(words, 7));
});
