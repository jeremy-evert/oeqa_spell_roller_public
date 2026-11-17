import test from "node:test";
import assert from "node:assert/strict";
import { FACTS, MEDALS, RANGES, THEMES } from "../facts.js";
import { shuffle, factsFor, newRound, parseAnswer, isCorrect, formatTime, medalFor, alertLevel, streakCheer, outcomeFor, migrate, load, save, wipe, blankState } from "../engine.js";

test("facts cover 7 x 0 through 7 x 20 with correct answers", () => {
  assert.equal(FACTS.length, 21);
  FACTS.forEach((f, i) => { assert.equal(f.n, i); assert.equal(f.a, 7 * i); });
});

test("ranges pick the right facts", () => {
  assert.equal(factsFor(12).length, 13); assert.equal(factsFor(20).length, 21);
  assert.deepEqual(RANGES.map((r) => r.max), [12, 20]);
  assert.equal(newRound(12).length, 13); assert.ok(newRound(12).every((f) => f.n <= 12));
});

test("every fact has a question that names its number and a clue with a capitalised sound-alike", () => {
  for (const f of FACTS) {
    assert.ok(new RegExp(`\\b${f.n}\\b`).test(f.q) || (f.n === 12 && /dozen/.test(f.q)), `question for ${f.n}`);
    assert.ok(/[A-Z]{3,}/.test(f.clue), `clue for ${f.n}`);
    assert.ok(f.clue.length > 20);
  }
});

test("the 7 x 4 clue is Jeremy's rhyme", () => {
  assert.match(FACTS[4].clue, /DATE/); assert.match(FACTS[4].clue, /twentyeIGHT/);
});

test("the stated arithmetic in the 13 to 20 clues is true", () => {
  assert.equal(70 + 21, FACTS[13].a); assert.equal(49 + 49, FACTS[14].a); assert.equal(70 + 35, FACTS[15].a);
  assert.equal(70 + 42, FACTS[16].a); assert.equal(120 - 1, FACTS[17].a); assert.equal(63 + 63, FACTS[18].a);
  assert.equal(140 - 7, FACTS[19].a); assert.equal(70 + 70, FACTS[20].a);
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

test("isCorrect: zero is a real answer; three digit answers work", () => {
  assert.equal(isCorrect(FACTS[0], "0"), true); assert.equal(isCorrect(FACTS[0], ""), false);
  assert.equal(isCorrect(FACTS[20], "140"), true); assert.equal(isCorrect(FACTS[20], "14"), false);
});

test("formatTime", () => {
  assert.equal(formatTime(0), "0:00.0"); assert.equal(formatTime(61234), "1:01.2"); assert.equal(formatTime(-5), "0:00.0");
});

test("medals: 0 to 12 is 90/75/60 seconds, 0 to 20 is 150/120/90", () => {
  assert.deepEqual(MEDALS.map((m) => [m.id, m.seconds[12], m.seconds[20]]), [["bronze", 90, 150], ["silver", 75, 120], ["gold", 60, 90]]);
  assert.equal(medalFor(12, 91), null); assert.equal(medalFor(12, 90).id, "bronze"); assert.equal(medalFor(12, 75).id, "silver"); assert.equal(medalFor(12, 60).id, "gold");
  assert.equal(medalFor(20, 151), null); assert.equal(medalFor(20, 150).id, "bronze"); assert.equal(medalFor(20, 90).id, "gold");
});

test("alertLevel warns as time runs out", () => {
  assert.equal(alertLevel(90000, 90000), 0); assert.equal(alertLevel(44000, 90000), 1);
  assert.equal(alertLevel(22000, 90000), 2); assert.equal(alertLevel(9999, 90000), 3); assert.equal(alertLevel(0, 90000), 3);
});

test("streakCheer fires at 3, 5, 10, 15 and 20", () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6, 10, 15, 20, 21].map(streakCheer), [0, 0, 3, 0, 5, 0, 10, 15, 20, 0]);
});

test("outcomeFor: only a clean first try earns a star", () => {
  assert.equal(outcomeFor({ tries: 0, usedClue: false }), "star");
  assert.equal(outcomeFor({ tries: 1, usedClue: false }), "bulb");
  assert.equal(outcomeFor({ tries: 0, usedClue: true }), "bulb");
});

test("old saves keep their 0 to 12 best time and medals", () => {
  const s = migrate({ bestMs: 55000, medals: { gold: true, bronze: true }, plays: 3 });
  assert.deepEqual(s.best, { 12: 55000 }); assert.deepEqual(s.medals, { "12:gold": true, "12:bronze": true }); assert.equal(s.range, 20);
});

test("migrate ignores junk and storage failures do not break the game", () => {
  assert.deepEqual(migrate("junk"), blankState());
  const s = migrate({ v: 2, theme: "lava", range: 7, best: { 12: -4, 20: 9000 }, medals: { "20:gold": "yes", "20:silver": true }, plays: 2.5 });
  assert.equal(s.theme, "fire"); assert.equal(s.range, 20); assert.deepEqual(s.best, { 20: 9000 }); assert.deepEqual(s.medals, { "20:silver": true }); assert.equal(s.plays, 0);
  const broken = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } };
  assert.equal(save(blankState(), broken), false); assert.deepEqual(load(broken), blankState()); wipe(broken);
});

test("save then load round-trips, including theme and range", () => {
  const box = {}; const store = { getItem: (k) => box[k] ?? null, setItem: (k, v) => { box[k] = v; }, removeItem: (k) => { delete box[k]; } };
  const st = { v: 2, theme: "space", range: 12, muted: true, best: { 20: 99000 }, medals: { "12:gold": true }, plays: 3 };
  save(st, store); assert.deepEqual(load(store), st);
});

test("three themes", () => { assert.deepEqual(THEMES.map((t) => t.id), ["fire", "space", "candy"]); });

test("every fact has a think hint that teaches a strategy but never states the answer", () => {
  for (const f of FACTS) {
    assert.ok(f.think && f.think.length > 15, `think for ${f.n}`);
    if (f.n >= 3) assert.ok(!new RegExp(`\\b${f.a}\\b`).test(f.think), `think for ${f.n} must not contain ${f.a}`);
  }
});

test("every 'N sevens is M' claim in a think hint is true", () => {
  let claims = 0;
  for (const f of FACTS) for (const m of f.think.matchAll(/(\d+) sevens is (\d+)/g)) { claims++; assert.equal(7 * Number(m[1]), Number(m[2]), `${f.n}: ${m[0]}`); }
  assert.ok(claims >= 15);
});

test("the 17 hint is the one Jeremy wrote", () => {
  assert.match(FACTS[17].think, /17 is 3 less than 20/); assert.match(FACTS[17].think, /20 sevens is 140/); assert.match(FACTS[17].think, /3 sevens is 21/);
});

test("Jeremy's rhymes for 0, 1 and 2", () => {
  assert.match(FACTS[0].clue, /weird 0 \(WEIRDO\)/); assert.match(FACTS[1].clue, /HEAVEN/); assert.match(FACTS[1].clue, /SEVEN/);
  assert.match(FACTS[2].clue, /nifty KEEN/); assert.match(FACTS[2].clue, /FOURTEEN/);
});
