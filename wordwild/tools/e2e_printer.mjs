#!/usr/bin/env node
// End-to-end test of Printer v2 in a REAL headless Chromium over the DevTools protocol. No npm packages (Node 22+ WebSocket).
// It starts its own two local web servers (two different origins, to prove progress is NOT shared across origins).
//
//   node tools/e2e_printer.mjs [--shots DIR] [--chromium chromium]
//
// Exits non-zero on any failed check. What it cannot judge (humor, voice quality, real children, Android/iOS) is listed in the report.
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const doc = JSON.parse(readFileSync(join(ROOT, "content", "list14_words_v1.json"), "utf8"));
const WORDS = doc.words.map((w) => w.word);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const SHOTS = arg("--shots", null), CHROMIUM = arg("--chromium", "chromium");
const A = "http://127.0.0.1:8771", B = "http://127.0.0.1:8772";
const PORT = 9333 + Math.floor(Math.random() * 500);
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

let failures = 0, checks = 0;
const ok = (cond, name, extra = "") => { checks++; if (!cond) failures++; console.log(`${cond ? "PASS" : "FAIL"}  ${name}${!cond && extra ? "  -> " + extra : ""}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const servers = [8771, 8772].map((p) => spawn("python3", ["-m", "http.server", String(p), "--bind", "127.0.0.1"], { cwd: ROOT, stdio: "ignore" }));
const profile = mkdtempSync(join(homedir(), "snap", "chromium", "common", "ww-p2-"));
const chrome = spawn(CHROMIUM, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "--no-first-run", "--window-size=1000,900", "about:blank"], { stdio: "ignore" });
const cleanup = () => { for (const p of [chrome, ...servers]) { try { p.kill(); } catch { /* ignore */ } } };
process.on("exit", cleanup);

class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); this.handlers = []; ws.onmessage = (m) => {
    const d = JSON.parse(m.data); if (d.id && this.pending.has(d.id)) { const { res, rej } = this.pending.get(d.id); this.pending.delete(d.id); d.error ? rej(new Error(d.error.message)) : res(d.result); }
    else if (d.method) this.handlers.forEach((h) => h(d.method, d.params)); }; }
  send(method, params = {}) { const id = ++this.id; this.ws.send(JSON.stringify({ id, method, params })); return new Promise((res, rej) => this.pending.set(id, { res, rej })); }
  on(h) { this.handlers.push(h); }
}
async function connect() {
  for (let i = 0; i < 60; i++) { try { const l = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); const p = l.find((t) => t.type === "page"); if (p) { const ws = new WebSocket(p.webSocketDebuggerUrl); await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; }); return new CDP(ws); } } catch { /* retry */ } await sleep(250); }
  throw new Error("could not connect to Chromium");
}
for (let i = 0; i < 40; i++) { try { if ((await fetch(A + "/printer-v2/")).ok && (await fetch(B + "/printer-v2/")).ok) break; } catch { /* wait */ } await sleep(150); }

const cdp = await connect();
const requests = [], pageErrors = [];
cdp.on((m, p) => { if (m === "Network.requestWillBeSent") requests.push(p.request.url); if (m === "Runtime.exceptionThrown") pageErrors.push(p.exceptionDetails?.exception?.description || p.exceptionDetails?.text); });
await cdp.send("Page.enable"); await cdp.send("Runtime.enable"); await cdp.send("Network.enable");
await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: `
  window.__nodes = { osc: 0, buf: 0 };
  const AC = window.AudioContext; if (AC) { const co = AC.prototype.createOscillator, cb = AC.prototype.createBufferSource;
    AC.prototype.createOscillator = function () { window.__nodes.osc++; return co.apply(this, arguments); };
    AC.prototype.createBufferSource = function () { window.__nodes.buf++; return cb.apply(this, arguments); }; }` });

const ev = async (expr) => { const r = await cdp.send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || "evaluate failed: " + expr); return r.result.value; };
async function waitFor(expr, ms = 7000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await ev(expr)) return true; await sleep(100); } throw new Error("timeout waiting for " + expr); }
const goto = async (url, ready = `!!document.querySelector("#card h2, #card h1, #out table")`) => { await cdp.send("Page.navigate", { url }); await sleep(600); await waitFor(ready); };
async function click(sel) {
  const box = await ev(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; e.scrollIntoView({block:"center"}); const r = e.getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2 }; })()`);
  if (!box) throw new Error("no element " + sel);
  for (const type of ["mousePressed", "mouseReleased"]) await cdp.send("Input.dispatchMouseEvent", { type, x: box.x, y: box.y, button: "left", clickCount: 1 });
  await sleep(250);
}
async function type(sel, text) { await ev(`(() => { const i = document.querySelector(${JSON.stringify(sel)}); i.focus(); i.value = ""; })()`); await cdp.send("Input.insertText", { text }); }
async function enter() { for (const type of ["keyDown", "keyUp"]) await cdp.send("Input.dispatchKeyEvent", { type, key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: type === "keyDown" ? "\r" : undefined }); await sleep(350); }
async function key(k, code, vk) { for (const type of ["keyDown", "keyUp"]) await cdp.send("Input.dispatchKeyEvent", { type, key: k, code, windowsVirtualKeyCode: vk }); await sleep(200); }
const html = () => ev(`document.documentElement.outerHTML.toLowerCase()`);
const text = () => ev(`document.body.innerText.toLowerCase()`);
const shot = async (name) => { if (!SHOTS) return; const r = await cdp.send("Page.captureScreenshot", { format: "png" }); writeFileSync(join(SHOTS, name + ".png"), Buffer.from(r.data, "base64")); };
const events = () => ev(`window.__printer2.progress.events().filter(e => e.type === "word_spelling")`);
const submit = async (w) => { await type("#answer", w); await enter(); };
const resetOrigin = async (origin) => { await cdp.send("Page.navigate", { url: origin + "/printer-v2/" }); await sleep(500); await ev(`localStorage.clear()`); };
const setViewport = (w, h, mobile) => cdp.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile });
const wordInDom = async (w) => new RegExp(`\\b${w}\\b`, "i").test(await ev(`document.documentElement.outerHTML.replace(/<[^>]+>/g, " ")`));

// =================================================== desktop: one mixed round on origin A
await resetOrigin(A);
await goto(A + "/printer-v2/");
ok((await text()).includes("what shall the printer build"), "home loads");
ok(await ev(`document.querySelectorAll('input[name=bp]').length`) === 3, "three blueprints offered");
ok(await ev(`document.querySelectorAll('[data-act=start-round]').length`) === 4, "four rounds of five words offered");
ok(await ev(`document.querySelector('[data-act=start-review]').disabled`), "Tricky words is disabled before anything was practiced");
await click('label.bp:nth-of-type(3)');
ok(await ev(`window.__printer2.settings.bp`) === "rocket", "blueprint choice (rocket) is remembered");
await shot("01_home");
await click('[data-act=start-round][data-round="0"]');
await waitFor(`!!document.querySelector("#answer")`);

ok(!(await wordInDom("supper")), "word 1: the answer is NOT anywhere in the page before help");
const h = await html();
ok(!h.includes(".mp3") && !/list14-/.test(h), "audio file names and joke ids are not in the page");
ok(await ev(`(() => { const b = document.querySelector(".help-me"); const r = b.getBoundingClientRect(); return r.height >= 44 && r.top < innerHeight && r.bottom > 0 && b.textContent.includes("HELP ME"); })()`), "HELP ME is big, labeled, and on screen from the very first view");
ok(await ev(`!!document.querySelector('[data-act=play-word]') && !!document.querySelector('[data-act=play-slow]') && !!document.querySelector('[data-act=stop-sound]') && !!document.querySelector('#mute')`), "Play word, Say it slowly, Stop and Mute are all present");
ok(await ev(`!!document.querySelector('[data-act=play-sentence]')`), "Read the sentence is available before the first spelling attempt");
await click('[data-act=play-sentence]'); await sleep(550);
ok(await ev(`window.__printer2.narrator.stats.clips >= 1 && window.__printer2.narrator.stats.failed === 0`), "Pre-answer Kokoro context sentence plays without revealing the spelling");
ok(!(await wordInDom("supper")), "Pre-answer sentence audio does not show target letters");

await shot("02_word_card");

await click('[data-act=play-word]'); await sleep(700);
ok((await ev(`window.__printer2.narrator.stats.clips`)) >= 1 && (await ev(`window.__printer2.narrator.stats.failed`)) === 0, "Play word actually starts the local Kokoro clip");
await click('[data-act=play-slow]'); await sleep(500);
await click('[data-act=stop-sound]');
ok(await ev(`window.__printer2.narrator.current === null`), "Stop silences narration immediately");

await submit("supper");
await waitFor(`document.body.innerText.includes("all by yourself")`);
let evs = await events();
ok(evs.length === 1 && evs[0].outcome === "independent" && evs[0].aids.includes("listen"), "word 1: independent after hearing both the word and context sentence", JSON.stringify(evs));
ok(await ev(`document.querySelector("#printer").dataset.printing`) === "true", "the printer starts building a part (a layer is rising)");
await sleep(2100);
ok(await ev(`document.querySelector("#printer").dataset.printing`) === "false" && await ev(`document.querySelectorAll(".layer.shown").length`) === 1, "printing finishes cleanly: exactly one layer is built");
ok(await ev(`!!document.querySelector(".layer.shown .sticker")`), "an independent word earns a star sticker");
await shot("03_printing_done");
ok((await ev(`window.__printer2.sfx.played`)) > 0 && (await ev(`window.__nodes.osc`)) > 0, "sound effects really fired through the Web Audio API");
ok((await text()).includes("two peas"), "the funny sentence is revealed after the answer");
await click('[data-act=pick-joke][data-joke="1"]'); ok((await text()).includes("captain super"), "Try another joke: switching to Trick B shows the other story");
await click('[data-act=react-funny]'); await click('[data-act=react-helped]');
const rx = await ev(`window.__printer2.progress.events().map(e => e.type + ":" + e.jokeId)`);
ok(rx.includes("joke_reaction:list14-supper-alternate-v1") && rx.includes("joke_memory_feedback:list14-supper-alternate-v1"), "👍 Funny and 👍 Helped me are recorded separately, keyed to the joke");
ok((await ev(`window.__printer2.progress.events({type:"word_spelling"}).length`)) === 1, "thumbs do not create spelling results");
await click('[data-act=play-sentence]'); await sleep(600);
ok((await ev(`window.__printer2.narrator.stats.clips`)) >= 2, "the sentence clip for the audition sample plays");
await click('[data-act=next]');

await waitFor(`!!document.querySelector("#answer")`);
ok(!(await wordInDom("number")), "word 2: answer hidden");
await click(".help-me");
ok(await ev(`!document.querySelector("#help-panel").hidden && document.querySelector(".help-me").getAttribute("aria-expanded") === "true"`), "HELP ME opens the ladder before any mistake");
await click('[data-step="clue2"]');
ok((await text()).includes("a different clue"), "a different meaning clue appears");
await click('[data-step="partial"]');
ok((await text()).includes("nu__er"), "some letters appear");
ok((await ev(`document.querySelector('[data-step=partial]').textContent`)).toLowerCase().includes("shows some letters"), "the ladder labels letter-showing help honestly");
await type("#answer", "number"); await enter();
await waitFor(`document.body.innerText.includes("with some help")`);
evs = await events(); ok(evs[1].outcome === "assisted", "word 2: assisted, NOT independent", JSON.stringify(evs[1]));
await sleep(2000);
ok(!(await ev(`!!document.querySelector(".layer[data-layer='1'] .sticker")`)), "an assisted word gets its part but no star");
await click('[data-act=next]');

await waitFor(`!!document.querySelector("#answer")`);
await click(".help-me"); await click('[data-step="jokeA"]');
await waitFor(`document.body.innerText.includes("Here is a funny way to remember it")`);
ok((await text()).includes("rover"), "Funny memory trick A shows the story");
ok(await ev(`document.querySelectorAll(".tile.lit").length`) > 0, "the target letters are lit up");
await click('[data-act=do-tap]'); await sleep(300);
ok(await ev(`!!document.querySelector(".tiles.pulse")`), "the tap payoff animates the letters");
await click('[data-act=show-mini]'); await click('[data-act=mini][data-i="0"]');
ok((await ev(`window.__printer2.progress.events({type:"mini_check"}).length`)) === 1, "the word-specific mini-check is recorded as supported practice");
ok((await text()).includes("does not count as spelling it yourself"), "the mini-check says honestly that it is practice with help");
await click('[data-act=hide-and-try]');
ok(!(await ev(`!!document.querySelector(".tile")`)), "after Hide, the word is gone again");
await type("#answer", "over"); await enter();
await waitFor(`document.body.innerText.includes("looked, hid it")`);
evs = await events(); ok(evs[2].outcome === "after_reveal" && evs[2].aids.includes("joke"), "word 3: after_reveal", JSON.stringify(evs[2]));
await click('[data-act=next]');

await waitFor(`!!document.querySelector("#answer")`);
await submit("lader");
ok((await text()).includes("tricky spot is letter"), "a wrong try gets specific, kind feedback that does not reveal the answer");
ok(await ev(`document.querySelector("#printer").classList.contains("sputter")`), "the printer sputters comically on a wrong try");
await submit("ladar");
ok((await text()).includes("press help me"), "after two wrong tries the game gently points at HELP ME");
await submit("ladder"); await waitFor(`document.body.innerText.includes("another try")`);
evs = await events(); ok(evs[3].outcome === "after_retry", "word 4: after_retry", JSON.stringify(evs[3]));
await click('[data-act=next]');

await waitFor(`!!document.querySelector("#answer")`);
await click(".help-me"); await click('[data-act=skip]');
await waitFor(`document.body.innerText.includes("Skipped for now")`);
evs = await events(); ok(evs[4].outcome === "skipped", "word 5: skipped with no penalty");
await sleep(2000);
ok(await ev(`!!document.querySelector(".layer.shown[data-layer='4'] .sticker")`), "a skipped word still prints, with a mystery sticker");
await click('[data-act=next]');
await waitFor(`document.body.innerText.includes("is built")`);
ok(await ev(`document.querySelectorAll(".layer.shown").length`) === 5, "after five words the creation is complete (5 of 5 layers)");
ok((await text()).includes("1 of 5 spelled all by yourself"), "the round summary is honest: 1 of 5 independent");
await shot("04_round_done");

// =================================================== persistence, review, shared page, isolation
await goto(A + "/printer-v2/");
ok(await ev(`window.__printer2.progress.events({type:"word_spelling"}).length`) === 5, "progress survives a page reload");
ok(!(await ev(`document.querySelector('[data-act=start-review]').disabled`)) && (await text()).includes("4 to practice again"), "Tricky words lists the 4 non-independent words");
await click('[data-act=start-review]'); await waitFor(`!!document.querySelector("#answer")`);
ok(await ev(`window.__printer2.S.session.words.join(",")`) === "number,over,ladder,sister", "Tricky words replays exactly those four");
await goto(A + "/shared/progress.html");
ok((await text()).includes("practiced 5 of 20") && (await text()).includes("all by myself"), "another page on the SAME origin sees the real progress");
await goto(B + "/shared/progress.html");
ok((await text()).includes("practiced 0 of 20"), "the same game on a DIFFERENT port shares nothing (separate origin)");

// =================================================== all 20 words on origin B, four rounds
await goto(B + "/printer-v2/?dev=1");
for (let r = 0; r < 4; r++) {
  await click(`[data-act=start-round][data-round="${r}"]`);
  for (let i = 0; i < 5; i++) {
    await waitFor(`!!document.querySelector("#answer")`);
    const w = WORDS[r * 5 + i];
    if (!(await ev(`window.__printer2.S.run.word`) === w)) ok(false, "round order is canonical", w);
    if (i === 0 && !(await wordInDom(w)) === false) ok(false, "answer leaked on a fresh card", w);
    await submit(w); await waitFor(`!!document.querySelector('[data-act=next]')`);
    if (r === 0 && i === 0) ok((await text()).includes("list14-"), "?dev=1 shows joke ids (developer diagnostics only)");
    await click('[data-act=next]');
  }
  await waitFor(`document.body.innerText.includes("is built")`);
  if (r < 3) await click('[data-act=go-home]');
}
const all = await ev(`window.__printer2.progress.events({type:"word_spelling"}).map(e => e.word + ":" + e.outcome)`);
ok(all.length === 20 && new Set(all.map((s) => s.split(":")[0])).size === 20 && all.every((s) => s.endsWith(":independent")), "all 20 words work end to end across four rounds", all.join(" "));
ok(await ev(`window.__printer2.progress.reviewList(${JSON.stringify(WORDS)}).length`) === 0, "no tricky words after 20 independent results");
await goto(A + "/shared/progress.html"); ok((await text()).includes("practiced 5 of 20"), "origin A progress was not changed by origin B play");

// =================================================== keyboard, focus, mute, calm and reduced motion
await goto(A + "/printer-v2/");
await click('[data-act=start-surprise]'); await waitFor(`!!document.querySelector("#answer")`);
await ev(`document.querySelector("#answer").focus()`);
await key("Tab", "Tab", 9); await key("Tab", "Tab", 9);
ok(await ev(`document.activeElement.classList.contains("help-me") && getComputedStyle(document.activeElement).outlineStyle !== "none" && parseFloat(getComputedStyle(document.activeElement).outlineWidth) >= 2`), "Tab reaches HELP ME in two presses and a visible focus ring shows");
await ev(`document.querySelector(".help-me").click()`); await sleep(150);
ok(await ev(`!document.querySelector("#help-panel").hidden`), "HELP ME opens from the keyboard path");
await key("Escape", "Escape", 27);
ok(await ev(`document.querySelector("#help-panel").hidden`), "Escape closes the help ladder and returns to the answer box");
await click("#mute"); ok(await ev(`document.querySelector("#mute").getAttribute("aria-pressed")`) === "true", "Mute toggles");
const before = await ev(`window.__nodes.osc`); await click('[data-act=play-word]'); await submit("zzzz"); await sleep(300);
ok((await ev(`window.__nodes.osc`)) === before && (await ev(`window.__printer2.narrator.muted`)), "while muted, no effect or narration starts");
await click("#mute"); await click("#calm");
ok(await ev(`document.querySelector("#calm").getAttribute("aria-pressed")`) === "true", "Calm motion toggles");
const w0 = await ev(`window.__printer2.S.run.word`); await submit(w0); await waitFor(`!!document.querySelector(".outcome")`);
ok(await ev(`document.querySelectorAll(".layer.printing").length`) === 0 && await ev(`document.querySelectorAll(".layer.shown").length`) === 1, "Calm motion: the part appears instantly, with no animation");
await click("#calm");
await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
await click('[data-act=next]'); await waitFor(`!!document.querySelector("#answer")`);
const w1 = await ev(`window.__printer2.S.run.word`); await submit(w1); await waitFor(`!!document.querySelector(".outcome")`);
ok(await ev(`document.querySelectorAll(".layer.shown").length`) === 2, "prefers-reduced-motion: the part appears immediately");
await cdp.send("Emulation.setEmulatedMedia", { features: [] });

// =================================================== phone width
await setViewport(375, 740, false);
await goto(A + "/printer-v2/"); await click('[data-act=start-round][data-round="1"]'); await waitFor(`!!document.querySelector("#answer")`);
ok(await ev(`document.documentElement.scrollWidth <= window.innerWidth + 1`), "375px wide: no sideways scrolling");
ok(await ev(`(() => { const r = document.querySelector(".help-me").getBoundingClientRect(); return r.width > 200 && r.height >= 44 && r.left >= 0 && r.right <= innerWidth; })()`), "375px wide: HELP ME is large and fully on screen");
ok(await ev(`(() => { const r = document.querySelector("#answer").getBoundingClientRect(); return r.height >= 44 && r.right <= innerWidth; })()`), "375px wide: the answer box is usable");
ok(!(await wordInDom(WORDS[5])), "375px wide: the answer is still hidden");
await shot("05_phone_word");
await click(".help-me");
ok(await ev(`!document.querySelector("#help-panel").hidden`), "375px wide: HELP ME opens the ladder");
await click('[data-step="jokeA"]'); await waitFor(`document.body.innerText.includes("Here is a funny way")`);
ok(await ev(`document.documentElement.scrollWidth <= window.innerWidth + 1`), "375px wide: the funny-memory view fits");
ok(await ev(`[...document.querySelectorAll("#card .btn")].every((b) => b.getBoundingClientRect().height >= 40)`), "375px wide: every button in the card is at least 40px tall");
await shot("06_phone_joke");
await cdp.send("Emulation.clearDeviceMetricsOverride");

// =================================================== network and errors
const external = requests.filter((u) => !/^(http:\/\/127\.0\.0\.1:877[12]\/|data:|about:|blob:)/.test(u));
ok(external.length === 0, "every network request stayed on localhost", external.slice(0, 3).join(", "));
ok(pageErrors.length === 0, "no uncaught page errors", pageErrors.slice(0, 2).join(" | "));
console.log(`\n${checks - failures}/${checks} checks passed`);
cleanup(); process.exit(failures ? 1 : 0);
