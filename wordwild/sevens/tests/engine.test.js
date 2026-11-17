import test from "node:test";
import assert from "node:assert/strict";
import { FACTS, MEDALS } from "../facts.js";
import { shuffle, parseAnswer, isCorrect, formatTime, medalFor, outcomeFor, migrate, load, save, wipe, blankState } from "../engine.js";

test("facts cover 7 x 0 through 7 x 12 with correct answers", () => {
  assert.equal(FACTS.length, 13);
  FACTS.forEach((f, i) => { assert.equal(f.n, i); assert.equal(f.a, 7 * i); });
});

test("every fact has a question that names its number and a clue that names the answer", () => {
  for (const f of FACTS) {
    assert.ok(f.q.includes(String(f.n)), `question for ${f.n}`);
    assert.ok(/[A-Z]{3,}/.test(f.clue), `clue for ${f.n} has a capitalised sound-alike`);
    assert.ok(f.clue.length > 20);
  }
});

test("the 7 x 4 clue is Jeremy's rhyme", () => {
  assert.match(FACTS[4].clue, /DATE/); assert.match(FACTS[4].clue, /twentyeIGHT/);
});

test("shuffle keeps every fact exactly once and does not mutate the input", () => {
  const before = FACTS.map((f) => f.n);
  const out = shuffle(FACTS, () => 0.3);
  assert.deepEqual(out.map((f) => f.n).sort((a, b) => a - b), before);
  assert.deepEqual(FACTS.map((f) => f.n), before);
});

test("parseAnswer accepts digits and rejects everything else", () => {
  assert.equal(parseAnswer(" 28 "), 28); assert.equal(parseAnswer("0"), 0); assert.equal(parseAnswer("084"), 84);
  for (const bad of ["", "  ", "-7", "2.8", "twenty", "28a", null, undefined, "1234"]) assert.equal(parseAnswer(bad), null, String(bad));
});

test("isCorrect: zero is a real answer", () => {
  assert.equal(isCorrect(FACTS[0], "0"), true); assert.equal(isCorrect(FACTS[0], ""), false);
  assert.equal(isCorrect(FACTS[4], "28"), true); assert.equal(isCorrect(FACTS[4], "27"), false);
});

test("formatTime", () => {
  assert.equal(formatTime(0), "0:00.0"); assert.equal(formatTime(61234), "1:01.2"); assert.equal(formatTime(-5), "0:00.0");
});

test("medals are 90 / 75 / 60 seconds, bronze / silver / gold", () => {
  assert.deepEqual(MEDALS.map((m) => [m.id, m.seconds]), [["bronze", 90], ["silver", 75], ["gold", 60]]);
  assert.equal(medalFor(91), null); assert.equal(medalFor(90).id, "bronze"); assert.equal(medalFor(76).id, "bronze");
  assert.equal(medalFor(75).id, "silver"); assert.equal(medalFor(60).id, "gold"); assert.equal(medalFor(12).id, "gold");
});

test("outcomeFor: only a clean first try earns a star", () => {
  assert.equal(outcomeFor({ tries: 0, usedClue: false }), "star");
  assert.equal(outcomeFor({ tries: 1, usedClue: false }), "bulb");
  assert.equal(outcomeFor({ tries: 0, usedClue: true }), "bulb");
});

test("migrate ignores junk and storage failures do not break the game", () => {
  assert.deepEqual(migrate("junk"), blankState());
  assert.deepEqual(migrate({ bestMs: -4, medals: { gold: "yes", silver: true }, plays: 2.5 }), { bestMs: null, medals: { silver: true }, plays: 0 });
  const broken = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } };
  assert.equal(save(blankState(), broken), false);
  assert.deepEqual(load(broken), blankState());
  wipe(broken);
});

test("save then load round-trips", () => {
  const box = {}; const store = { getItem: (k) => box[k] ?? null, setItem: (k, v) => { box[k] = v; }, removeItem: (k) => { delete box[k]; } };
  save({ bestMs: 55000, medals: { gold: true }, plays: 3 }, store);
  assert.deepEqual(load(store), { bestMs: 55000, medals: { gold: true }, plays: 3 });
});
