import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { WORDS } from "../words.js";
import { OUTCOME, Progress, blankState } from "../engine.js";
import { KEY, load, save, wipe } from "../storage.js";
import { EFFECT_NAMES } from "../sfx.js";

const fake = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k), _m: m }; };

test("storage: save, load, resume, and reset", () => {
  const s = fake(); const p = new Progress(blankState(), () => "t"); p.record("tiger", OUTCOME.AFTER_HINT);
  assert.equal(save(p.state, s), true); assert.ok(s._m.has(KEY));
  assert.equal(load(s).words.tiger.afterHint, 1);
  wipe(s); assert.equal(load(s).words.tiger.runs, 0);
});
test("storage: corrupt JSON does not crash; blocked storage does not crash", () => {
  const s = fake(); s.setItem(KEY, "{not json"); assert.equal(Object.keys(load(s).words).length, 20);
  const blocked = { getItem() { throw new Error("denied"); }, setItem() { throw new Error("denied"); }, removeItem() { throw new Error("denied"); } };
  assert.equal(save(blankState(), blocked), false); assert.equal(Object.keys(load(blocked).words).length, 20);
});
test("storage keeps no child identity fields", () => {
  const p = new Progress(blankState(), () => "t"); p.record("tiger", OUTCOME.INDEPENDENT);
  assert.doesNotMatch(JSON.stringify(p.state), /name|email|voice|location|audio/i);
});

test("at least five distinct original sound effects exist", () => { assert.ok(EFFECT_NAMES.length >= 5, EFFECT_NAMES.join()); });

test("narration: manifest and a real, non-empty mp3 for all 20 words x (word, slow, sentence)", () => {
  const dir = new URL("../assets/audio/", import.meta.url);
  const man = JSON.parse(readFileSync(new URL("manifest.json", dir), "utf8"));
  assert.match(man.engine, /kokoro/i); assert.equal(Object.keys(man.clips).length, 20);
  for (const w of WORDS) for (const kind of ["word", "slow", "sentence"]) {
    const f = new URL(man.clips[w.word][kind], dir);
    assert.ok(existsSync(f), `${w.word} ${kind}`); assert.ok(statSync(f).size > 2000, `${w.word} ${kind} too small`);
  }
});
