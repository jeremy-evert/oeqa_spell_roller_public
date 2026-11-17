import test from "node:test";
import assert from "node:assert/strict";
import { FACTS, factsOf, TABLES, tableName, numberWords, MEDALS, RANGES, THEMES } from "../facts.js";
import { shuffle, missingQuestion, classicQuestion, countByQuestion, COUNTBY_KINDS, MISSING_KINDS, lk, bestKey, medalKey, recordResult, trickyCount, pickTricky, BOX_GAP, rhymeLines, factsFor, newRound, parseAnswer, isCorrect, formatTime, medalFor, alertLevel, streakCheer, outcomeFor, migrate, load, save, wipe, blankState } from "../engine.js";

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
  assert.deepEqual(s.best, { "7:12": 55000 }); assert.deepEqual(s.medals, { "7:12:gold": true, "7:12:bronze": true }); assert.equal(s.range, 20); assert.equal(s.table, 7);
});

test("migrate ignores junk and storage failures do not break the game", () => {
  assert.deepEqual(migrate("junk"), blankState());
  const s = migrate({ v: 2, theme: "lava", range: 7, best: { 12: -4, 20: 9000 }, medals: { "20:gold": "yes", "20:silver": true }, plays: 2.5 });
  assert.equal(s.theme, "fire"); assert.equal(s.range, 20); assert.deepEqual(s.best, { "7:20": 9000 }); assert.deepEqual(s.medals, { "7:20:silver": true }); assert.equal(s.plays, 0);
  const broken = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } };
  assert.equal(save(blankState(), broken), false); assert.deepEqual(load(broken), blankState()); wipe(broken);
});

test("save then load round-trips, including theme and range", () => {
  const box = {}; const store = { getItem: (k) => box[k] ?? null, setItem: (k, v) => { box[k] = v; }, removeItem: (k) => { delete box[k]; } };
  const st = { v: 3, theme: "space", table: 9, range: 12, muted: true, rhymes: false, round: 4, learn: { "9:3": { box: 2, due: 5 } }, best: { "9:20": 99000 }, medals: { "9:12:gold": true }, plays: 3 };
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

// Say a number 0 to 140 in words, so a test can check that each clue really contains its answer.
const ONES = ["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
const TENS = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
function words(n) {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");
  return "one hundred" + (n > 100 ? " " + words(n - 100) : "");
}
const norm = (x) => x.toLowerCase().replace(/-/g, " ").replace(/\band\b/g, "").replace(/\s+/g, " ");

test("every clue says its answer, in words or digits", () => {
  for (const f of FACTS) {
    const ok = norm(f.clue).includes(words(f.a)) || new RegExp(`(^|\\D)${f.a}(\\D|$)`).test(f.clue);
    assert.ok(ok, `clue for 7 x ${f.n} should say ${f.a} (${words(f.a)}): ${f.clue}`);
  }
});

test("every fact has a rhyme lead, and the lead never gives the answer away", () => {
  for (const f of FACTS) {
    const r = rhymeLines(f);
    assert.ok(r.lead && r.lead.length > 10, `lead for ${f.n}`); assert.ok(r.blank.includes("___"), `blank for ${f.n}`);
    if (f.n >= 2) {
      assert.ok(!norm(r.lead).includes(words(f.a)), `lead for ${f.n} says the answer in words`);
      assert.ok(!new RegExp(`(^|\\D)${f.a}(\\D|$)`).test(r.lead + " " + r.blank), `lead for ${f.n} has the digits ${f.a}`);
    }
  }
});

test("Jeremy's lead lines are kept word for word", () => {
  assert.equal(FACTS[3].lead, "7 times 3 is always fun."); assert.equal(FACTS[1].lead, "7 times one is simply heaven."); assert.equal(FACTS[2].lead, "7 times two is nifty keen.");
  assert.match(FACTS[0].lead, /weird 0 \(weirdo\)/); assert.equal(FACTS[4].lead, "7 and 4 went on a date.");
});

test("rhymes can be switched off and the setting survives a save", () => {
  assert.equal(blankState().rhymes, true); assert.equal(migrate({ v: 2, rhymes: false }).rhymes, false); assert.equal(migrate({ v: 2 }).rhymes, true);
});

test("missing-number questions: every kind, every fact, the arithmetic is right", () => {
  for (const f of FACTS) for (const r of [0.0, 0.4, 0.9]) {
    const q = missingQuestion(f, () => r);
    assert.ok(MISSING_KINDS.includes(q.kind)); assert.ok(q.sum.includes("?"));
    if (q.kind === "factor") assert.equal(7 * q.answer, f.a); if (q.kind === "divide") assert.equal(q.answer * 7, f.a); if (q.kind === "dividend") assert.equal(q.answer / 7, f.n);
    assert.ok(q.story.length > 20 && q.think.length > 20);
  }
});

test("the three kinds read as expected", () => {
  assert.equal(missingQuestion(FACTS[5], () => 0).sum, "7 × ? = 35"); assert.equal(missingQuestion(FACTS[5], () => 0.4).sum, "35 ÷ 7 = ?"); assert.equal(missingQuestion(FACTS[5], () => 0.9).sum, "? ÷ 7 = 5");
  assert.equal(missingQuestion(FACTS[5], () => 0.9).answer, 35); assert.equal(classicQuestion(FACTS[5]).answer, 35);
});

test("a missing-number think hint never contains the answer as a bare number", () => {
  for (const f of FACTS) for (const r of [0, 0.4]) { const q = missingQuestion(f, () => r); if (f.n >= 3 && q.answer !== 7) assert.ok(!new RegExp(`(^|\\D)${q.answer}(\\D|$)`).test(q.think), `${q.sum}: ${q.think}`); }
});

test("spaced review: a miss resets, success climbs the boxes, mastered facts wait", () => {
  const learn = {}, f3 = FACTS[3], k = lk(7, 3); recordResult(learn, f3, false, 0); assert.deepEqual(learn[k], { box: 1, due: 0 });
  recordResult(learn, f3, true, 1); assert.deepEqual(learn[k], { box: 2, due: 2 }); recordResult(learn, f3, true, 2); assert.equal(learn[k].box, 3); assert.equal(learn[k].due, 5);
  recordResult(learn, f3, true, 5); recordResult(learn, f3, true, 12); assert.equal(learn[k].box, 4); recordResult(learn, f3, false, 20); assert.equal(learn[k].box, 1);
  assert.deepEqual(BOX_GAP, [0, 0, 1, 3, 7]);
});

test("Tricky Facts puts the missed facts first and tops up with unseen ones", () => {
  const learn = {}; recordResult(learn, FACTS[6], false, 0); recordResult(learn, FACTS[9], false, 0); for (let i = 0; i < 3; i++) recordResult(learn, FACTS[4], true, 0);
  assert.equal(trickyCount(learn, 7, 20), 2); assert.equal(trickyCount(learn, 8, 20), 0, "another table does not see the 7s' misses");
  const picked = pickTricky(learn, 1, 7, 20, 10, () => 0.5).map((f) => f.n);
  assert.ok(picked.includes(6) && picked.includes(9)); assert.ok(!picked.includes(4), "a fact in a high box is not due yet"); assert.ok(picked.length >= 6 && picked.length <= 10);
  assert.equal(new Set(picked).size, picked.length);
  assert.ok(pickTricky(learn, 20, 7, 20, 10, () => 0.5).map((f) => f.n).includes(4), "once due, it comes back");
  assert.ok(pickTricky({}, 0, 7, 12, 10).every((f) => f.n <= 12));
  assert.ok(pickTricky(learn, 1, 8, 20, 10, () => 0.5).every((f) => f.t === 8), "Tricky Facts stays inside the chosen table");
});

test("learning records are cleaned up when loaded", () => {
  const s = migrate({ v: 2, round: 3, learn: { 3: { box: 2, due: 4 }, 99: { box: 2, due: 1 }, 5: { box: 9, due: 1 }, 6: "x" } });
  assert.deepEqual(s.learn, { "7:3": { box: 2, due: 4 } }); assert.equal(s.round, 3);
  const s3 = migrate({ v: 3, table: 12, learn: { "12:3": { box: 3, due: 2 }, "21:3": { box: 2, due: 1 }, "7:99": { box: 2, due: 1 }, "x": { box: 2, due: 1 } } });
  assert.deepEqual(s3.learn, { "12:3": { box: 3, due: 2 } }); assert.equal(s3.table, 12); assert.equal(migrate({ v: 3, table: 99 }).table, 7);
});

// ---------- any table ----------

const ALL = TABLES.flatMap((t) => factsOf(t));

test("tables 1 to 20, each with the 21 facts 0 to 20 and the right product", () => {
  assert.deepEqual(TABLES, Array.from({ length: 20 }, (_, i) => i + 1));
  for (const t of TABLES) { const fs = factsOf(t); assert.equal(fs.length, 21); fs.forEach((f, i) => { assert.equal(f.t, t); assert.equal(f.n, i); assert.equal(f.a, t * i); }); }
  assert.throws(() => factsOf(0)); assert.throws(() => factsOf(21)); assert.throws(() => factsOf(2.5));
  assert.equal(factsFor(12, 9).length, 13); assert.ok(newRound(20, undefined, 13).every((f) => f.t === 13));
});

test("number words and table names", () => {
  assert.deepEqual([0, 7, 13, 20, 42, 100, 105, 340, 400].map(numberWords), ["zero", "seven", "thirteen", "twenty", "forty-two", "one hundred", "one hundred five", "three hundred forty", "four hundred"]);
  assert.deepEqual([1, 6, 7, 12, 20].map(tableName), ["Ones", "Sixes", "Sevens", "Twelves", "Twenties"]);
});

test("every generated fact: a question that names its numbers, a shouted clue that says the answer", () => {
  for (const f of ALL) {
    assert.ok(new RegExp(`\\b${f.n}\\b`).test(f.q), `question for ${f.t} x ${f.n}`); assert.ok(new RegExp(`^${f.t}\\b`).test(f.q) || f.t === 7);
    assert.ok(/[A-Z]{3,}/.test(f.clue), `shout in clue for ${f.t} x ${f.n}`);
    assert.ok(norm(f.clue).includes(words400(f.a)) || new RegExp(`(^|\\D)${f.a}(\\D|$)`).test(f.clue), `clue for ${f.t} x ${f.n}: ${f.clue}`);
  }
});
function words400(n) { return norm(numberWords(n)); }

test("every think hint teaches without stating the answer, and its arithmetic is true", () => {
  let claims = 0;
  for (const f of ALL) {
    assert.ok(f.think.length > 15, `think for ${f.t} x ${f.n}`);
    if (f.n >= 3 && f.t > 1) assert.ok(!new RegExp(`(^|\\D)${f.a}(\\D|$)`).test(f.think), `think for ${f.t} x ${f.n} contains ${f.a}: ${f.think}`);
    const word = tableName(f.t).toLowerCase();
    for (const m of f.think.matchAll(new RegExp(`(\\d+) ${word} is (\\d+)`, "g"))) { claims++; assert.equal(f.t * Number(m[1]), Number(m[2]), `${f.t} x ${f.n}: ${m[0]}`); }
    for (const m of f.think.matchAll(/(\d+) tens is (\d+)/g)) { claims++; assert.equal(10 * Number(m[1]), Number(m[2]), `${f.t} x ${f.n}: ${m[0]}`); }
    for (const m of f.think.matchAll(/[Dd]ouble (\d+) is (\d+)/g)) { claims++; assert.equal(2 * Number(m[1]), Number(m[2]), `${f.t} x ${f.n}: ${m[0]}`); }
    for (const m of f.think.matchAll(/[Hh]alf of (\d+) is (\d+)/g)) { claims++; assert.equal(Number(m[1]) / 2, Number(m[2]), `${f.t} x ${f.n}: ${m[0]}`); }
    if (f.t !== 7) assert.ok(!/\d+s\b/.test(f.think.replace(/\b\d0s\b/g, "")), `think for ${f.t} x ${f.n} uses "3s" style: ${f.think}`);
  }
  assert.ok(claims > 200);
});

test("every lead is a line to read aloud, with a blank, and the answer stays out of it", () => {
  for (const f of ALL) {
    const r = rhymeLines(f);
    assert.ok(r.lead.length > 10 && r.blank.includes("___"), `lead for ${f.t} x ${f.n}`);
    if (f.n >= 2 && f.t > 1) assert.ok(!new RegExp(`(^|\\D)${f.a}(\\D|$)`).test(r.lead + " " + r.blank), `lead for ${f.t} x ${f.n} has the digits ${f.a}`);
  }
  assert.equal(factsOf(7)[3].lead, "7 times 3 is always fun.", "the 7s keep Jeremy's words");
});

test("missing-number questions are right in every table", () => {
  for (const f of ALL) for (const r of [0, 0.4, 0.9]) {
    const q = missingQuestion(f, () => r);
    if (q.kind === "factor") assert.equal(f.t * q.answer, f.a); if (q.kind === "divide") assert.equal(q.answer * f.t, f.a); if (q.kind === "dividend") assert.equal(q.answer / f.t, f.n);
    assert.ok(q.sum.includes("?"));
    if (f.n >= 3 && f.t > 1 && q.answer !== f.t) assert.ok(!new RegExp(`(^|\\D)${q.answer}(\\D|$)`).test(q.think), `${q.sum}: ${q.think}`);
  }
  assert.equal(missingQuestion(factsOf(9)[4], () => 0).sum, "9 × ? = 36");
});

test("count by: every question is true skip counting, the hole is the answer, and it never leaks", () => {
  for (const t of TABLES) for (const max of [12, 20]) for (let k = 1; k <= max; k++) for (const r of [0, 0.5, 0.99]) {
    const f = factsOf(t)[k], q = countByQuestion(f, max, () => r), parts = q.sum.split(" ");
    assert.ok(COUNTBY_KINDS.includes(q.kind)); assert.equal(q.answer, t * k); assert.equal(parts.filter((p) => p === "?").length, 1); assert.equal(parts[q.hole], "?");
    const nums = parts.filter((p) => p !== "?").map(Number);
    assert.ok(nums.every((n) => n % t === 0 && n >= t && n <= t * max), `${t}/${k}: ${q.sum}`);
    assert.ok(!nums.includes(q.answer), "the answer is not on show");
    const step = q.kind === "back" ? -t : t, full = parts.map((p, i) => (p === "?" ? q.answer : Number(p)));
    full.slice(1).forEach((v, i) => assert.equal(v - full[i], step, `${t}/${k}/${q.kind}: ${q.sum}`));
    assert.equal(q.chant[q.chant.length - 1], q.answer); assert.ok(q.hole >= 1, "there is always a number before the hole");
    if (q.answer !== t) assert.ok(!new RegExp(`(^|\\D)${q.answer}(\\D|$)`).test(q.think), `${t}/${k}: ${q.think}`);   // the step itself is always stated
  }
  assert.equal(countByQuestion(factsOf(8)[6], 12, () => 0).sum, "16 24 32 40 ?");
});

test("every save key is per table", () => {
  assert.equal(lk(8, 3), "8:3"); assert.equal(bestKey(8, 12), "8:12"); assert.equal(medalKey(8, 12, "gold"), "8:12:gold");
  const s = migrate({ v: 3, best: { "8:12": 5000, "7:12": 6000 }, medals: { "8:12:gold": true, "9:20:bronze": true, "8:12:platinum": true } });
  assert.deepEqual(s.best, { "8:12": 5000, "7:12": 6000 }); assert.deepEqual(s.medals, { "8:12:gold": true, "9:20:bronze": true });
});
