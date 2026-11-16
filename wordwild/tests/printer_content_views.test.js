import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { WordRun, AID } from "../printer-v2/engine.js";
import { recallView, jokeView, studyView, resultView, homeView, esc } from "../printer-v2/views.js";
import { PREVIEWS, checkContent } from "../printer-v2/content.js";
import { Narrator } from "../printer-v2/audio.js";

const root = new URL("../", import.meta.url);
const doc = checkContent(JSON.parse(readFileSync(new URL("content/list14_words_v1.json", root), "utf8")));
const has = (html, word) => new RegExp(`\\b${word}\\b`, "i").test(html.replace(/<[^>]+>/g, " "));

test("content package: 20 words in canonical order, 42 jokes, review flags on upstairs and staring", () => {
  assert.equal(doc.words.length, 20); assert.equal(doc.words.reduce((n, w) => n + w.jokes.length, 0), 42);
  assert.deepEqual(doc.words.filter((w) => w.isReview).map((w) => w.id), ["upstairs", "staring"]);
  assert.equal(doc.status, "candidate_parent_review");
});
test("BEFORE any help, the rendered recall screen never contains the target word, for all 20 words", () => {
  for (const w of doc.words) {
    const html = recallView({ run: new WordRun(w), position: 1, total: 5, helpOpen: false, texts: {}, feedback: null });
    assert.ok(!has(html, w.word), `${w.word} leaked before help`);
    assert.ok(!html.includes(".mp3"), "audio file names must not be in the DOM");
    for (const j of w.jokes) assert.ok(!html.includes(j.narration.slice(0, 25)), "joke text leaked before help");
  }
});
test("with the help panel OPEN and every non-revealing aid shown, the whole word still never appears", () => {
  for (const w of doc.words) {
    const run = new WordRun(w);
    const texts = { clue2: run.useAid(AID.CLUE2).text, say_note: run.useAid(AID.SAY_NOTE).text, pattern: run.useAid(AID.PATTERN).text, partial: run.useAid(AID.PARTIAL).text };
    const html = recallView({ run, position: 1, total: 5, helpOpen: true, texts, feedback: { message: "x", nudge: true } });
    assert.ok(!has(html, w.word), `${w.word} appears in letter-level help`);
  }
});
test("Read the sentence is available before the spelling attempt without revealing written answers", () => {
  for (const w of doc.words) {
    const run = new WordRun(w);
    const html = recallView({ run, position: 1, total: 5, helpOpen: false, texts: {}, feedback: null, sentenceAvailable: true });
    assert.match(html, /data-act="play-sentence"/);
    assert.match(html, /Read the sentence/);
    assert.ok(!has(html, w.word), `${w.word} leaked before listening`);
    assert.ok(!html.includes(".mp3"), "audio paths stay out of the rendered UI");
    assert.ok(!html.includes(w.jokes[0].narration.slice(0, 25)), "the spelling-memory story remains hidden");
    run.useAid(AID.LISTEN);
    const result = run.submit(w.word);
    assert.equal(result.correct, true, w.word);
    assert.equal(run.outcome, "independent", "hearing context alone must not penalize independent spelling");
  }
});

test("Help Me is a labeled, visible button on every word before any wrong attempt", () => {
  const html = recallView({ run: new WordRun(doc.words[0]), position: 1, total: 5, helpOpen: false, texts: {}, feedback: null });
  assert.match(html, /class="btn help-me"[^>]*aria-expanded="false"[^>]*aria-controls="help-panel"[^>]*>🆘 HELP ME</);
  assert.match(html, /autocorrect="off"/); assert.match(html, /spellcheck="false"/); assert.match(html, /autocomplete="off"/);
  assert.match(html, /<label for="answer" class="sr">/);
});
test("study and result views show the word, joke switcher, reactions, and a hide-and-try button", () => {
  for (const w of doc.words) {
    const run = new WordRun(w); run.openJoke(0);
    const ctx = { entry: w, jokeIndex: 0, pulse: false, reactions: {}, narrationAvailable: false, dev: false, mini: null, showMini: false };
    const s = studyView({ run, position: 1, total: 5, ...ctx });
    assert.ok(has(s, w.word)); assert.match(s, /Hide it and spell it myself/); assert.match(s, /👍 Funny!/); assert.match(s, /👍 Helped me remember!/);
    assert.equal((s.match(/data-act="pick-joke"/g) || []).length, w.jokes.length);
    assert.ok(!/list14-/.test(s), "joke ids are developer diagnostics only");
    run.tryFromMemory(); run.submit(w.word);
    const r = resultView({ run, position: 1, total: 5, last: false, ...ctx });
    assert.match(r, /Next word/); assert.match(r, /class="answer"/);
  }
});
test("joke ids appear only in dev mode", () => {
  const w = doc.words[0], ctx = { entry: w, jokeIndex: 0, pulse: false, reactions: {}, narrationAvailable: false, mini: null, showMini: false };
  assert.ok(!jokeView({ ...ctx, dev: false }).includes("list14-")); assert.ok(jokeView({ ...ctx, dev: true }).includes("list14-supper-primary-v1"));
});
test("previews exist for the unfamiliar-vocabulary jokes and are shown", () => {
  const ids = new Set(doc.words.flatMap((w) => w.jokes.map((j) => j.id)));
  for (const id of Object.keys(PREVIEWS)) assert.ok(ids.has(id), id);
  const w = doc.words.find((x) => x.id === "tiger");
  assert.match(jokeView({ entry: w, jokeIndex: 1, pulse: false, reactions: {}, narrationAvailable: false, dev: false, mini: null, showMini: false }), /liger is half lion/);
});
test("a joke with no recorded voice says so honestly instead of pretending", () => {
  const w = doc.words[1];
  const html = jokeView({ entry: w, jokeIndex: 0, pulse: false, reactions: {}, narrationAvailable: false, dev: false, mini: null, showMini: false });
  assert.match(html, /no voice recording yet/);
});
test("esc escapes HTML", () => { assert.equal(esc("<b>\"x\"&'"), "&lt;b&gt;&quot;x&quot;&amp;&#39;"); });
test("home view offers 4 rounds, surprise, tricky words; Tricky is disabled when empty", () => {
  const h = homeView({ players: [], active: null, blueprintId: "robot", reviewCount: 0, practiced: 0, independentNow: 0, status: "ok", dev: false });
  assert.equal((h.match(/data-act="start-round"/g) || []).length, 4); assert.match(h, /start-surprise/); assert.match(h, /start-review"[^>]*disabled/);
});

test("review-only rules are never used as scored rule quizzes in the game code", () => {
  const src = readdirSync(new URL("printer-v2/", root)).filter((f) => f.endsWith(".js")).map((f) => readFileSync(new URL("printer-v2/" + f, root), "utf8")).join("\n");
  assert.ok(!/generalRuleBank|rule_comprehension|reviewedRuleIds/.test(src.replace(/\/\/.*$/gm, "")), "game code must not read or score the rule bank");
});
test("there is no speechSynthesis fallback anywhere in the game", () => {
  const src = readdirSync(new URL("printer-v2/", root)).filter((f) => f.endsWith(".js")).map((f) => readFileSync(new URL("printer-v2/" + f, root), "utf8")).join("\n");
  assert.ok(!/speechSynthesis|SpeechSynthesisUtterance/.test(src.replace(/\/\/.*$/gm, "")));
});
test("audio manifest: every referenced clip exists and all 20 words have word + slow clips", () => {
  const dir = new URL("printer-v2/assets/audio/", root), m = JSON.parse(readFileSync(new URL("manifest.json", dir), "utf8"));
  for (const w of doc.words) for (const k of ["word", "slow", "sentence"]) assert.ok(existsSync(new URL(m.words[w.word][k], dir)), `${w.word} ${k}`);
  for (const [id, p] of Object.entries(m.narration)) assert.ok(existsSync(new URL(p, dir)), id);
  const ids = new Set(doc.words.flatMap((w) => w.jokes.map((j) => j.id)));
  for (const id of Object.keys(m.narration)) assert.ok(ids.has(id), "narration for unknown joke " + id);
  assert.equal(m.voice, "af_heart"); assert.match(m.provenance, /PR #4/);
});

test("Narrator: plays clips, reports missing ones, mute and stop work, and no speech fallback is used", async () => {
  const manifest = { words: { supper: { word: "supper.mp3", slow: "supper_slow.mp3", sentence: "supper_sentence.mp3" } }, narration: { "list14-supper-primary-v1": "narration/x.mp3" } };
  const made = [];
  class FakeAudio { constructor(src) { this.src = src; this.paused = false; made.push(this); this.l = {}; }
    addEventListener(e, f) { this.l[e] = f; } pause() { this.paused = true; } play() { setTimeout(() => this.l.ended?.(), 0); return Promise.resolve(); } }
  const n = new Narrator({ fetchFn: async () => ({ ok: true, json: async () => manifest }), AudioCtor: FakeAudio });
  assert.equal(await n.load(), true);
  assert.equal(await n.play("word", "supper"), "clip"); assert.equal(made[0].src, "assets/audio/supper.mp3");
  assert.equal(await n.play("sentence", "supper"), "clip"); assert.equal(made[1].src, "assets/audio/supper_sentence.mp3");
  assert.equal(await n.play("narration", "list14-supper-primary-v1"), "clip");
  assert.equal(await n.play("narration", "list14-number-primary-v1"), "missing");
  assert.equal(await n.play("slow", "zebra"), "missing");
  n.setMuted(true); assert.equal(await n.play("word", "supper"), "muted");
  n.setMuted(false); const pending = n.play("word", "supper"); n.stop(); assert.equal(made.at(-1).paused, true); await pending;
  const broken = new Narrator({ fetchFn: async () => { throw new Error("offline"); }, AudioCtor: FakeAudio });
  assert.equal(await broken.load(), false); assert.equal(await broken.play("word", "supper"), "missing");
});
