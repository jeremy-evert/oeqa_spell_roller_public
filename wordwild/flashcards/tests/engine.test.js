import test from "node:test";
import assert from "node:assert/strict";
import { WORDS } from "../words.js";
import { CardRun, OUTCOME, Progress, blankState, checkAttempt, hintFor, migrate, normalize, rounds, shuffled } from "../engine.js";

test("normalize trims and lowercases but never autocorrects", () => {
  assert.equal(normalize("  SuPPer \n"), "supper");
  assert.equal(normalize("supr"), "supr");
});

test("checkAttempt: exact, wrong, empty", () => {
  assert.equal(checkAttempt("supper", " Supper ").correct, true);
  assert.equal(checkAttempt("supper", "suppr").correct, false);
  assert.equal(checkAttempt("supper", "   ").empty, true);
});

test("feedback is specific and never contains the answer", () => {
  for (const w of WORDS) {
    for (const bad of [w.word.slice(0, -1), w.word + "x", "x" + w.word.slice(1), w.word.slice(0, 3) + "zzz", "zzzz"]) {
      const r = checkAttempt(w.word, bad);
      if (r.correct) continue;
      assert.ok(!r.message.toLowerCase().includes(w.word), `message leaks ${w.word}`);
    }
  }
  assert.match(checkAttempt("supper", "supr").message, /first 3 letters are right/);
  assert.match(checkAttempt("supper", "zupper").message, /first letter is not quite right/);
});

test("hint reveals count and first letter only, never the whole word", () => {
  for (const w of WORDS) {
    const h = hintFor(w.word);
    assert.equal(h.letters, w.word.length);
    assert.ok(!h.masked.replace(/ /g, "").includes(w.word));
    assert.equal(h.masked.replace(/ /g, "").length, w.word.length);
  }
});

test("outcome: independent first try", () => {
  const r = new CardRun("tiger"); r.submit("tiger");
  assert.equal(r.outcome, OUTCOME.INDEPENDENT); assert.ok(r.done);
});
test("outcome: after retry (wrong then right)", () => {
  const r = new CardRun("tiger"); r.submit("tigr"); assert.ok(!r.done); r.submit("tiger");
  assert.equal(r.outcome, OUTCOME.AFTER_RETRY);
});
test("outcome: hint then correct is after_hint, even on the first typed try", () => {
  const r = new CardRun("tiger"); r.useHint(); r.submit("tiger");
  assert.equal(r.outcome, OUTCOME.AFTER_HINT);
});
test("outcome: reveal then fresh recall is after_reveal, and the answer is hidden again for the recall", () => {
  const r = new CardRun("tiger");
  assert.equal(r.answerVisible, false);
  r.reveal(); assert.equal(r.answerVisible, true);
  assert.ok(r.submit("tiger").ignored, "cannot submit while studying");
  assert.ok(!r.done);
  r.tryFromMemory(); assert.equal(r.answerVisible, false);
  r.submit("tiger"); assert.equal(r.outcome, OUTCOME.AFTER_REVEAL);
});
test("reveal beats hint beats retry in precedence", () => {
  const r = new CardRun("tiger"); r.submit("x"); r.useHint(); r.reveal(); r.tryFromMemory(); r.submit("tiger");
  assert.equal(r.outcome, OUTCOME.AFTER_REVEAL);
});
test("studied-first (Flip & Learn) card can never score as independent", () => {
  const r = new CardRun("tiger", { studied: true }); r.submit("tiger");
  assert.equal(r.outcome, OUTCOME.AFTER_REVEAL);
});
test("accessible mode shows the word and is never counted as independent", () => {
  const r = new CardRun("tiger", { accessible: true }); assert.equal(r.answerVisible, true); r.submit("tiger");
  assert.equal(r.outcome, OUTCOME.ASSISTED);
});
test("skip ends the run as skipped; empty submissions are not attempts", () => {
  const r = new CardRun("tiger"); r.submit(""); assert.equal(r.attempts, 0); r.skip();
  assert.equal(r.outcome, OUTCOME.SKIPPED);
  assert.ok(r.submit("tiger").ignored, "no changes after done");
});
test("after two misses the card offers help but never reveals on its own", () => {
  const r = new CardRun("tiger"); r.submit("a"); const res = r.submit("b");
  assert.equal(res.offerHelp, true); assert.equal(r.answerVisible, false);
});
test("the answer is only ever visible in study phase or accessible mode", () => {
  const r = new CardRun("tiger");
  for (const step of [() => r.submit("x"), () => r.useHint(), () => r.submit("y")]) { step(); assert.equal(r.answerVisible, false); }
});

test("progress distinguishes independent from helped, tracks tricky, reviewList, summary", () => {
  const p = new Progress(blankState(), () => "t");
  p.record("tiger", OUTCOME.INDEPENDENT);
  p.record("spider", OUTCOME.AFTER_HINT);
  p.record("ladder", OUTCOME.SKIPPED);
  p.record("sister", OUTCOME.AFTER_REVEAL);
  p.record("over", OUTCOME.ASSISTED);
  p.recordStudy("number");
  const s = p.summary();
  assert.equal(s.independentNow, 1);
  assert.equal(s.practiced, 5);
  assert.equal(s.studiedOnly, 1);
  assert.deepEqual(p.reviewList().sort(), ["ladder", "over", "sister", "spider"].sort());
  assert.equal(p.state.words.tiger.independent, 1);
  assert.equal(p.state.words.spider.afterHint, 1);
  assert.equal(p.state.words.over.independent, 0, "assisted never counts as independent");
});
test("a tricky word leaves the review list only after an independent first try", () => {
  const p = new Progress(blankState()); p.record("tiger", OUTCOME.AFTER_RETRY);
  assert.ok(p.reviewList().includes("tiger"));
  p.record("tiger", OUTCOME.AFTER_HINT); assert.ok(p.reviewList().includes("tiger"));
  p.record("tiger", OUTCOME.INDEPENDENT); assert.ok(!p.reviewList().includes("tiger"));
});
test("unknown words are rejected", () => { assert.throws(() => new Progress().record("zebra", OUTCOME.INDEPENDENT)); });

test("reset clears progress but keeps settings", () => {
  const p = new Progress(blankState()); p.state.settings.muted = true; p.record("tiger", OUTCOME.INDEPENDENT); p.reset();
  assert.equal(p.summary().practiced, 0); assert.equal(p.state.settings.muted, true);
});

test("migrate: survives garbage, wrong schema, extra words, negative or NaN numbers", () => {
  for (const junk of [null, undefined, 5, "x", [], {}, { schema: 99 }, { schema: 1, words: "nope" }]) {
    const m = migrate(junk); assert.equal(Object.keys(m.words).length, 20);
  }
  const m = migrate({ schema: 1, words: { tiger: { runs: -4, independent: "lots", last: "hacked", tricky: "yes" }, zebra: { runs: 9 } },
    settings: { muted: "yes" }, sessions: [null, { at: "t", mode: "listen", total: 5, independent: 3 }] });
  assert.equal(m.words.tiger.runs, 0); assert.equal(m.words.tiger.independent, 0); assert.equal(m.words.tiger.last, null);
  assert.equal(m.words.tiger.tricky, false); assert.equal(m.words.zebra, undefined); assert.equal(m.settings.muted, false);
  assert.equal(m.sessions.length, 1);
});
test("migrate round-trips a real state", () => {
  const p = new Progress(blankState(), () => "t"); p.record("tiger", OUTCOME.AFTER_RETRY); p.recordSession("listen", [OUTCOME.INDEPENDENT]);
  const back = migrate(JSON.parse(JSON.stringify(p.state)));
  assert.equal(back.words.tiger.afterRetry, 1); assert.equal(back.sessions.length, 1);
});

test("rounds are four breaks of five in canonical order", () => {
  const r = rounds(); assert.equal(r.length, 4); assert.ok(r.every((x) => x.length === 5));
  assert.deepEqual(r.flat(), WORDS.map((w) => w.word));
});
test("shuffle is a permutation and deterministic for a seed", () => {
  const a = shuffled(WORDS.map((w) => w.word), 42), b = shuffled(WORDS.map((w) => w.word), 42);
  assert.deepEqual(a, b); assert.deepEqual([...a].sort(), WORDS.map((w) => w.word).sort());
});
