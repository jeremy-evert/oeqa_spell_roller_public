import test from "node:test";
import assert from "node:assert/strict";
import { EGGS, EGGS_ANY, TABLE_FACTS, MULTIPLY_FACTS, funFactsFor, FUN_FACTS, makeBag, nextFact, eggFor, SECRETS } from "../easter.js";
import { FACTS } from "../facts.js";

test("eggs only exist for real facts and have a cheer and some emoji", () => {
  for (const [n, e] of Object.entries(EGGS)) { assert.ok(FACTS.some((f) => f.n === Number(n)), `fact ${n}`); assert.ok(e.toast.length > 5); assert.ok(e.emoji.length >= 2); }
  assert.ok(eggFor(0) && eggFor(1) && eggFor(2)); assert.equal(eggFor(13), null);
});

test("the egg cheers that state a number are true", () => {
  assert.match(EGGS[7].toast, /49/); assert.equal(7 * 7, 49); assert.match(EGGS[11].toast, /77/); assert.equal(7 * 11, 77);
});

test("fun facts: enough of them, all different, no names or links", () => {
  assert.ok(FUN_FACTS.length >= 8); assert.equal(new Set(FUN_FACTS).size, FUN_FACTS.length);
  for (const f of FUN_FACTS) { assert.ok(f.length > 20); assert.ok(!/https?:|@|\d{3}-\d{4}/.test(f)); assert.ok(/7|seven|Seven/.test(f)); }
});

test("the bag shows every fact once before repeating", () => {
  const bag = []; const seen = new Set();
  for (let i = 0; i < FUN_FACTS.length; i++) seen.add(nextFact(bag));
  assert.equal(seen.size, FUN_FACTS.length); assert.equal(bag.length, 0);
  assert.ok(FUN_FACTS.includes(nextFact(bag))); assert.equal(makeBag().length, FUN_FACTS.length);
});

test("secrets are what the game says they are", () => {
  assert.equal(SECRETS.logoTaps, 7); assert.equal(SECRETS.luckyStreak, 7); assert.ok(SECRETS.factChance > 0 && SECRETS.factChance < 0.5);
});

test("any table gets cheers that fit it, and the square", () => {
  assert.equal(eggFor(7, 7), EGGS[7]); assert.equal(eggFor(11, 7), EGGS[11]);
  assert.equal(eggFor(10, 4), EGGS_ANY[10]); assert.equal(eggFor(5, 4), null);
  assert.match(eggFor(9, 9).toast, /^81!/); assert.match(eggFor(12, 12).toast, /^144!/); assert.equal(eggFor(1, 1), null);
  assert.ok(!/seven/i.test(eggFor(0, 3).toast + eggFor(12, 3).toast), "no 7s talk in other tables");
});

test("every table has fun facts, and the claims about 7s stay with the 7s", () => {
  for (let t = 1; t <= 20; t++) { const list = funFactsFor(t); assert.ok(list.length >= 6, `table ${t}`); assert.equal(new Set(list).size, list.length); if (t !== 7) assert.ok(TABLE_FACTS[t], `a fact for ${t}`); }
  assert.deepEqual(funFactsFor(7), FUN_FACTS); assert.ok(MULTIPLY_FACTS.length >= 5);
  const bag = []; assert.ok(funFactsFor(3).includes(nextFact(bag, Math.random, funFactsFor(3))));
});
