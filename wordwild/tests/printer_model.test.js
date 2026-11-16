import test from "node:test";
import assert from "node:assert/strict";
import { BLUEPRINTS, PrinterBuild, stageMarkup, badgeFor, blueprintById, revealRange } from "../printer-v2/printer.js";

test("three blueprints with five parts each, and genuinely different geometry", () => {
  assert.equal(BLUEPRINTS.length, 3);
  for (const b of BLUEPRINTS) assert.equal(b.parts.length, 5);
  const sig = BLUEPRINTS.map((b) => b.parts.map((p) => p.svg).join("|"));
  assert.equal(new Set(sig).size, 3);
  const shapes = BLUEPRINTS.map((b) => ["polygon", "path", "circle", "rect"].map((t) => b.parts.some((p) => p.svg.includes("<" + t))));
  assert.notDeepEqual(shapes[0], shapes[1]); // robot is boxes only, castle has triangles
});
test("parts rise: each reveal range goes from the part's bottom edge up to its top edge", () => {
  for (const b of BLUEPRINTS) b.parts.forEach((p, i) => { const r = revealRange(b, i); assert.ok(r.from > r.to, `${b.id} ${p.name}`); assert.ok(r.from <= 100 && r.to >= 0); });
});
test("printing always succeeds; only the sticker depends on the outcome (scoring is separate from animation)", () => {
  const b = new PrinterBuild("castle");
  for (const o of ["independent", "assisted", "skipped", "after_reveal", "after_retry"]) assert.ok(b.next(o));
  assert.equal(b.complete, true); assert.equal(b.next("independent"), null); assert.equal(b.stars, 1);
  assert.equal(badgeFor("independent").symbol, "★"); assert.equal(badgeFor("assisted").symbol, "");
  assert.equal(badgeFor("skipped").symbol, "?");
});
test("stage markup: shown, printing and hidden layers; stickers only on finished parts", () => {
  const b = new PrinterBuild("robot"); b.next("independent"); b.next("assisted");
  const html = stageMarkup(b.bp, b.printed, 1);
  assert.match(html, /layer shown" data-layer="0"/); assert.match(html, /layer printing" data-layer="1"/); assert.match(html, /layer hidden" data-layer="2"/);
  assert.equal((html.match(/class="sticker"/g) || []).length, 1);
  assert.ok(!/aria-hidden="false"/.test(html));
});
test("unknown blueprint falls back safely", () => { assert.equal(blueprintById("nope").id, "robot"); });
