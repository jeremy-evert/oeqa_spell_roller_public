import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const config = JSON.parse(await readFile(new URL("../arcade/games.json", import.meta.url), "utf8"));
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const app = await readFile(new URL("../arcade/app.js", import.meta.url), "utf8");
const css = await readFile(new URL("../arcade/style.css", import.meta.url), "utf8");
const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");

const expected = [
  ["Professor Potato's Flashcards", "flashcards/"],
  ["Super Sevens", "sevens/"],
  ["Impossible 3D Printer", "game/"],
  ["Impossible 3D Printer", "printer-v2/"],
  ["Flashcards: Illustrated Edition", "flashcards-v2/"],
  ["Rule Lab", "rule-lab/"]
];

assert.equal(config.version, 1);
assert.equal(config.games.length, expected.length);
assert.deepEqual(config.games.map(({ title, href }) => [title, href]), expected);
assert.equal(new Set(config.games.map(({ id }) => id)).size, expected.length, "tile ids must be unique");
for (const game of config.games) {
  assert.ok(game.id && game.edition && game.invitation && game.art && game.hue, `${game.id} needs complete tile copy/art metadata`);
  assert.match(game.entry, /^[a-z0-9-]+\/index\.html$/);
  assert.equal(new URL(game.href, "http://wordwild.test").origin, "http://wordwild.test", `${game.id} link must stay local`);
  assert.equal(new URL(game.entry, "http://wordwild.test").origin, "http://wordwild.test", `${game.id} probe must stay local`);
}
assert.match(html, /<main\b/);
assert.match(html, /href="#games"/);
assert.match(html, /aria-live="polite"/);
assert.match(html, /id="refresh-games"/);
assert.doesNotMatch(html, /https?:\/\//);
assert.doesNotMatch(app, /speechSynthesis|Audio\(/);
assert.match(app, /method: "HEAD"/);
assert.match(app, /cache: "no-store"/);
assert.match(app, /credentials: "same-origin"/);
assert.match(app, /In the workshop/);
assert.match(app, /entries\.sort/);
assert.match(css, /:focus-visible/);
assert.match(css, /min-height: 44px/);
assert.match(css, /max-width: 430px/);
assert.match(css, /prefers-reduced-motion/);
assert.match(readme, /http:\/\/127\.0\.0\.1:8766\//);
console.log("PASS: five configured local games, local-only paths, workshop states, responsive/accessibility hooks, and launch guidance.");
