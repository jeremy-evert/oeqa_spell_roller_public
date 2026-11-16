import test from "node:test";
import assert from "node:assert/strict";
import { SharedProgress, KEY, MAX_EVENTS } from "../shared/local_progress.js";

class Mem { constructor() { this.m = new Map(); } getItem(k) { return this.m.has(k) ? this.m.get(k) : null; } setItem(k, v) { this.m.set(k, String(v)); } removeItem(k) { this.m.delete(k); } }
const WORDS = ["supper", "number", "over", "staring"];
const mk = (storage = new Mem(), extra = {}) => new SharedProgress({ storage, words: WORDS, ...extra });

test("creates one opaque default player with a preset animal label", () => {
  const p = mk(); const a = p.activePlayer();
  assert.match(a.id, /^p-[a-z0-9]+$/); assert.equal(a.label, "Fox");
});

test("two games on the SAME storage share real recorded events", () => {
  const s = new Mem(); const flash = mk(s), printer = mk(s);
  assert.ok(flash.record({ type: "word_spelling", game: "printer-v2", word: "supper", outcome: "independent", attempts: 1 }).ok);
  assert.ok(printer.record({ type: "word_spelling", game: "other-game", word: "over", outcome: "after_reveal", aids: ["joke", "reveal"], attempts: 2 }).ok);
  const seenByFlash = flash.events();
  assert.equal(seenByFlash.length, 2);
  assert.deepEqual(seenByFlash.map((e) => e.game), ["printer-v2", "other-game"]);
});

test("different storage (different origin) shares nothing", () => {
  const a = mk(new Mem()), b = mk(new Mem());
  a.record({ type: "word_spelling", game: "g", word: "supper", outcome: "independent", attempts: 1 });
  assert.equal(b.events().length, 0);
});

test("nothing is invented: a fresh store has no events and an empty review list", () => {
  const p = mk(); assert.deepEqual(p.events(), []); assert.deepEqual(p.reviewList(WORDS), []);
  assert.equal(p.summary(WORDS).practiced, 0);
});

test("independent cannot be recorded with a letter-revealing aid or more than one attempt", () => {
  const p = mk();
  assert.equal(p.record({ type: "word_spelling", game: "g", word: "supper", outcome: "independent", aids: ["pattern"], attempts: 1 }).ok, false);
  assert.equal(p.record({ type: "word_spelling", game: "g", word: "supper", outcome: "independent", attempts: 2 }).ok, false);
  assert.equal(p.record({ type: "word_spelling", game: "g", word: "supper", outcome: "independent", aids: ["listen", "slow", "clue2"], attempts: 1 }).ok, true);
});

test("raw typed answers and unknown fields are never stored", () => {
  const p = mk();
  const r = p.record({ type: "word_spelling", game: "g", word: "supper", outcome: "after_retry", attempts: 2, typed: "super", name: "Alice", rawAttempts: ["super"] });
  assert.ok(r.ok);
  const raw = JSON.stringify(p.data);
  assert.ok(!raw.includes("super\"") && !raw.includes("Alice") && !raw.includes("rawAttempts"));
});

test("unknown words, outcomes, bad joke ids are rejected", () => {
  const p = mk();
  assert.equal(p.record({ type: "word_spelling", game: "g", word: "zebra", outcome: "independent" }).ok, false);
  assert.equal(p.record({ type: "word_spelling", game: "g", word: "supper", outcome: "perfect" }).ok, false);
  assert.equal(p.record({ type: "joke_reaction", game: "g", word: "supper", jokeId: "evil" }).ok, false);
  assert.equal(p.record({ type: "nope" }).ok, false);
  assert.equal(p.events().length, 0);
});

test("reactions are voluntary events keyed by joke id and separate from spelling", () => {
  const p = mk();
  assert.ok(p.record({ type: "joke_reaction", game: "g", word: "supper", jokeId: "list14-supper-primary-v1" }).ok);
  assert.ok(p.record({ type: "joke_memory_feedback", game: "g", word: "supper", jokeId: "list14-supper-alternate-v1" }).ok);
  const s = p.summary(WORDS);
  assert.equal(s.funnyCount, 1); assert.equal(s.helpedCount, 1); assert.equal(s.practiced, 0);
});

test("rule_comprehension is rejected unless the rule id was educator-approved", () => {
  const closed = mk();
  assert.equal(closed.record({ type: "rule_comprehension", game: "g", ruleId: "RC-02", correct: true }).ok, false);
  const open = mk(new Mem(), { reviewedRuleIds: ["RC-99"] });
  assert.equal(open.record({ type: "rule_comprehension", game: "g", ruleId: "RC-99", correct: true }).ok, true);
});

test("review list = latest result was not independent; recovers when later independent", () => {
  const p = mk();
  p.record({ type: "word_spelling", game: "g", word: "over", outcome: "assisted", aids: ["pattern"], attempts: 1 });
  p.record({ type: "word_spelling", game: "g", word: "supper", outcome: "independent", attempts: 1 });
  assert.deepEqual(p.reviewList(WORDS), ["over"]);
  p.record({ type: "word_spelling", game: "g", word: "over", outcome: "independent", attempts: 1 });
  assert.deepEqual(p.reviewList(WORDS), []);
});

test("players are separate and the grown-up actor is a different field", () => {
  const p = mk(); const first = p.activePlayer().id;
  p.record({ type: "word_spelling", game: "g", word: "supper", outcome: "independent", attempts: 1 });
  const second = p.addPlayer(1).id;
  assert.notEqual(first, second); assert.equal(p.events().length, 0);
  p.record({ type: "word_spelling", game: "g", word: "supper", outcome: "skipped", actor: "grown_up", attempts: 0 });
  assert.equal(p.events()[0].actor, "grown_up");
  assert.equal(p.events({ player: first }).length, 1);
});

test("corrupt storage is backed up and replaced, never thrown", () => {
  const s = new Mem(); s.setItem(KEY, "{not json");
  const p = mk(s);
  assert.equal(p.state, "recovered"); assert.equal(s.getItem(KEY + ".backup"), "{not json");
  assert.ok(p.record({ type: "word_spelling", game: "g", word: "supper", outcome: "skipped", attempts: 0 }).ok);
});

test("wrong schema version is treated as unreadable, not trusted", () => {
  const s = new Mem(); s.setItem(KEY, JSON.stringify({ schema: 99, players: [], events: [{ type: "word_spelling" }] }));
  const p = mk(s); assert.equal(p.state, "recovered"); assert.equal(p.events().length, 0);
});

test("storage that throws degrades to memory-only and keeps working", () => {
  const bad = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } };
  const p = mk(bad);
  assert.equal(p.state, "memory-only");
  assert.ok(p.record({ type: "word_spelling", game: "g", word: "supper", outcome: "independent", attempts: 1 }).ok);
  assert.equal(p.events().length, 1);
});

test("events are capped", () => {
  const p = mk();
  for (let i = 0; i < MAX_EVENTS + 25; i++) p.record({ type: "joke_reaction", game: "g", word: "supper", jokeId: "list14-supper-primary-v1" });
  assert.equal(p.events().length, MAX_EVENTS);
});

test("export contains no raw spellings and clearAll wipes everything for the origin", () => {
  const s = new Mem(); const p = mk(s);
  p.record({ type: "word_spelling", game: "g", word: "supper", outcome: "after_retry", attempts: 3 });
  assert.ok(p.exportJSON().includes("after_retry"));
  p.clearAll();
  assert.equal(p.events().length, 0); assert.equal(s.getItem(KEY + ".backup"), null);
});
