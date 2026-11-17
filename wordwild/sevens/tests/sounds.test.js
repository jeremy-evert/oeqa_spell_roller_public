import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LOOKS, EFFECT_NAMES, _effectsFor, setLook, play } from "../sounds.js";
import { THEMES } from "../facts.js";

test("the sound looks are exactly the visual looks", () => {
  assert.deepEqual(LOOKS, THEMES.map((t) => t.id));
});

test("every look defines every effect (no look is missing a sound)", () => {
  for (const look of LOOKS) assert.deepEqual(_effectsFor(look).sort(), EFFECT_NAMES.slice().sort(), look);
  assert.ok(EFFECT_NAMES.length >= 15);
});

test("every sound the game asks for exists", () => {
  const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");
  const asked = new Set([...app.matchAll(/S\.play\("([a-z]+)"/g)].map((m) => m[1]));
  assert.ok(asked.size >= 12, `game asks for ${asked.size} sounds`);
  for (const name of asked) assert.ok(EFFECT_NAMES.includes(name), `app.js plays "${name}" but sounds.js has no such effect`);
});

test("play() is safe with no audio and when muted (Node has no Web Audio)", () => {
  setLook("candy"); assert.equal(play("correct", 3), false); assert.equal(play("no-such-sound"), false);
});
