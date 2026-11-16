#!/usr/bin/env node
// End-to-end smoke test in a REAL headless Chromium, driven over the DevTools protocol. No npm packages needed
// (Node 22+ has a built-in WebSocket). It uses trusted mouse/keyboard events, so browser autoplay rules apply for real.
//
//   python3 -m http.server 8765 --bind 127.0.0.1     # from the repo root, in another terminal
//   node flashcards/tools/e2e.mjs [--shots DIR] [--chromium /snap/bin/chromium] [--base http://127.0.0.1:8765/flashcards/]
//
// Prints PASS/FAIL per check and exits non-zero on any failure. Limits are listed in flashcards/README.md.
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { WORDS } from "../words.js";

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const BASE = arg("--base", "http://127.0.0.1:8765/flashcards/");
const SHOTS = arg("--shots", null);
const CHROMIUM = arg("--chromium", "chromium");
const PORT = 9333 + Math.floor(Math.random() * 500);
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

let failures = 0, checks = 0;
const ok = (cond, name, extra = "") => { checks++; if (!cond) failures++; console.log(`${cond ? "PASS" : "FAIL"}  ${name}${!cond && extra ? "  -> " + extra : ""}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- minimal CDP client ----------------------------------------------------------------------------------------
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

const profile = mkdtempSync(join(homedir(), "snap", "chromium", "common", "ww-e2e-"));
const chrome = spawn(CHROMIUM, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "--no-first-run", "--window-size=1000,900", "about:blank"], { stdio: "ignore" });
const cleanup = () => { try { chrome.kill(); } catch { /* ignore */ } };
process.on("exit", cleanup);

const cdp = await connect();
const requests = [];
cdp.on((m, p) => { if (m === "Network.requestWillBeSent") requests.push(p.request.url); });
const consoleErrors = [];
cdp.on((m, p) => { if (m === "Runtime.exceptionThrown") consoleErrors.push(p.exceptionDetails?.exception?.description || p.exceptionDetails?.text); });
await cdp.send("Page.enable"); await cdp.send("Runtime.enable"); await cdp.send("Network.enable");

// Count real AudioContext node creation so "sound effects fired" is measured at the Web Audio level, not just in our own counter.
await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: `
  window.__nodes = { osc: 0, buf: 0 };
  const AC = window.AudioContext; if (AC) { const co = AC.prototype.createOscillator, cb = AC.prototype.createBufferSource;
    AC.prototype.createOscillator = function () { window.__nodes.osc++; return co.apply(this, arguments); };
    AC.prototype.createBufferSource = function () { window.__nodes.buf++; return cb.apply(this, arguments); }; }` });

const ev = async (expr) => { const r = await cdp.send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || "evaluate failed: " + expr); return r.result.value; };
const goto = async (url) => { await cdp.send("Page.navigate", { url }); await sleep(900); await waitFor(`!!document.querySelector("#app h1, #app h2, #app .card")`); };
async function waitFor(expr, ms = 6000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await ev(expr)) return true; await sleep(100); } throw new Error("timeout waiting for " + expr); }
async function click(sel) { // trusted click at the element's centre
  const box = await ev(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; e.scrollIntoView({block:"center"}); const r = e.getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2 }; })()`);
  if (!box) throw new Error("no element " + sel);
  for (const type of ["mousePressed", "mouseReleased"]) await cdp.send("Input.dispatchMouseEvent", { type, x: box.x, y: box.y, button: "left", clickCount: 1 });
  await sleep(250);
}
async function type(sel, text) { await ev(`document.querySelector(${JSON.stringify(sel)}).focus()`); await cdp.send("Input.insertText", { text }); }
async function enter() { for (const type of ["keyDown", "keyUp"]) await cdp.send("Input.dispatchKeyEvent", { type, key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: type === "keyDown" ? "\r" : undefined }); await sleep(300); }
const html = () => ev(`document.documentElement.outerHTML.toLowerCase()`);
const text = () => ev(`document.body.innerText`);
const stats = () => ev(`({ sfx: window.__wordwild.sfxStats, voice: window.__wordwild.voiceStats, nodes: window.__nodes })`);
const stored = () => ev(`JSON.parse(localStorage.getItem("wordwild.flashcards.v1") || "null")`);
const shot = async (name) => { if (!SHOTS) return; const r = await cdp.send("Page.captureScreenshot", { format: "png" }); writeFileSync(join(SHOTS, name + ".png"), Buffer.from(r.data, "base64")); };
const leaks = async (word) => (await html()).includes(word);

try {
  // ===== 1. load, offline-ness, no errors =====================================================================
  await goto(BASE);
  ok((await text()).includes("List 14 Flashcards"), "home screen renders");
  ok(await ev(`!!document.querySelector('[data-action="start"][data-mode="listen"]')`), "Listen & Spell is offered");
  ok((await text()).includes("unavailable offline"), "Speak & Check is honestly shown as unavailable offline");
  await shot("01_home");

  // ===== 2. Round 1, card 1 (supper): answer hidden, audio, sfx, wrong -> hint -> right ======================
  await click('[data-action="start"][data-round="0"]'); await waitFor(`!!document.querySelector("#ans")`);
  ok(!(await leaks("supper")), "card 1: written word is NOT in the page (DOM, attributes, aria, alt)");
  ok((await text()).includes("Card 1 of 5"), "round has 5 cards");
  await shot("02_card");
  await click('[data-action="say"][data-kind="word"]'); await sleep(900);
  ok(requests.some((u) => u.includes("assets/audio/supper.mp3")), "narration clip for the word was requested and served locally");
  await click('[data-action="say"][data-kind="sentence"]'); await sleep(500);
  ok(requests.some((u) => u.includes("assets/audio/supper_sentence.mp3")), "silly-sentence clip requested");
  await type("#ans", "suppr"); await enter();
  ok((await text()).includes("first 4 letters are right"), "wrong answer gets specific feedback (names how many letters are right, not the word)", await text());
  ok(!(await leaks("supper")), "word still hidden after a wrong answer");
  let s = await stats();
  ok((s.sfx.byName.whoops || 0) >= 1 && s.nodes.osc > 0, "whoops sound effect fired (Web Audio oscillators created)", JSON.stringify(s));
  await click('[data-action="hint"]');
  ok((await text()).includes("6 letters") && !(await leaks("supper")), "hint shows letter count and first letter, not the word");
  await ev(`document.querySelector("#ans").value = ""`); await type("#ans", "supper"); await enter();
  ok((await text()).includes("Got it with a hint"), "correct after hint is labelled 'with a hint', not 'by yourself'");
  ok(/supper/i.test(await text()), "after answering, the word is shown with the silly sentence");
  await shot("03_result");
  s = await stats(); ok((s.sfx.byName.correct || 0) >= 1, "correct sound effect fired");
  let st = await stored(); ok(st.words.supper.afterHint === 1 && st.words.supper.independent === 0, "progress saved: supper = after_hint, not independent");

  // ===== 3. card 2 (number): Show/Study -> hidden again -> after_reveal =======================================
  await click('[data-action="next"]'); await waitFor(`!!document.querySelector("#ans")`);
  ok(!(await leaks("number")), "card 2: word hidden");
  await click('[data-action="study"]'); await sleep(200);
  ok((await text()).includes("Look closely") && /number/i.test(await text()) && !(await ev(`!!document.querySelector("#ans")`)), "Show/Study reveals the spelling and hides the input");
  await click('[data-action="try-memory"]'); await waitFor(`!!document.querySelector("#ans")`);
  ok(!(await leaks("number")), "after studying, the answer is hidden again for a fresh attempt");
  await type("#ans", "NUMBER "); await enter();
  ok((await text()).includes("Got it after studying"), "typed answer is case/space tolerant; labelled 'after studying'");

  // ===== 4. card 3 (over): skip =====================================================================================
  await click('[data-action="next"]'); await waitFor(`!!document.querySelector("#ans")`);
  await click('[data-action="skip"]');
  ok((await text()).includes("Skipped"), "skip is recorded as skipped");
  st = await stored(); ok(st.words.over.skipped === 1 && st.words.over.tricky === true, "skipped word goes on the review list");

  // ===== 5. card 4 (ladder) independent; card 5 (sister) retry; then the break screen ==========================
  await click('[data-action="next"]'); await waitFor(`!!document.querySelector("#ans")`);
  await type("#ans", "ladder"); await enter();
  ok((await text()).includes("Got it all by yourself"), "first-try correct with no help = independent");
  await click('[data-action="next"]'); await waitFor(`!!document.querySelector("#ans")`);
  await type("#ans", "sistor"); await enter(); await ev(`document.querySelector("#ans").value=""`); await type("#ans", "sister"); await enter();
  ok((await text()).includes("on a retry"), "wrong then right = after a retry");
  await click('[data-action="next"]'); await waitFor(`!!document.querySelector(".break")`);
  s = await stats(); ok((s.sfx.byName.fanfare || 0) >= 1, "celebration fanfare fired at the end of five cards");
  const t = await text(); ok(t.includes("1 of 5 spelled all by yourself"), "round summary is honest: only 1 of 5 independent", t.slice(0, 200));
  await shot("04_break");

  // ===== 6. refresh: progress resumes ===============================================================================
  await goto(BASE);
  ok((await text()).includes("1 of 20 words spelled by yourself"), "after a refresh progress resumes (1 independent of 20)");
  ok(await ev(`!document.querySelector('[data-mode="review"]').disabled`), "Quick Review is enabled because some words need practice");

  // ===== 7. Quick Review shows exactly the tricky words =============================================================
  await click('[data-mode="review"]'); await waitFor(`!!document.querySelector("#ans")`);
  ok((await text()).includes("Card 1 of 4"), "review contains the 4 words that were not independent (supper, number, over, sister)");
  await click('[data-action="home"]');

  // ===== 8. mute: no new sound effects while muted ==================================================================
  await ev(`void 0`); const before = (await stats()).sfx.played;
  await click('[data-setting="sfx"]'); // turn off
  await click('[data-action="start"][data-round="1"]'); await waitFor(`!!document.querySelector("#ans")`);
  await type("#ans", "zzzz"); await enter(); await click('[data-action="skip"]');
  const after = (await stats()).sfx.played;
  ok(after === before + 1 || after === before, "muted: wrong answer, skip and result made no sound effects (the +1 is the unmute-confirmation pop)", `${before} -> ${after}`);
  ok((await stored()).settings.muted === true, "mute setting is remembered");
  await click('[data-action="home"]');

  // ===== 9. narration fallback when clips are missing ===============================================================
  await ev(`window.Audio = undefined`);
  await click('[data-action="start"][data-round="2"]'); await waitFor(`!!document.querySelector("#ans")`);
  await click('[data-action="say"][data-kind="word"]'); await sleep(400);
  s = await stats(); ok(s.voice.fallbackSpeech + s.voice.failed >= 1, "with no audio support the game falls back to browser speech or fails quietly", JSON.stringify(s.voice));
  ok(await ev(`!!document.querySelector(".clue") && !!document.querySelector("#ans")`), "text-only play still works (clue + input present)");
  await click('[data-action="home"]');

  // ===== 10. reset ===================================================================================================
  await click('[data-action="reset-ask"]'); await click('[data-action="reset-yes"]'); await sleep(300);
  st = await stored(); ok(Object.values(st.words).every((w) => w.runs === 0) && (await text()).includes("0 of 20"), "Reset progress clears everything");

  // ===== 11. all 20 words appear in the game and every card keeps its word hidden ================================
  await goto(BASE); await click('[data-action="start"][data-round="all"]');
  let hiddenOK = 0, seen = [];
  for (let i = 0; i < 20; i++) {
    await waitFor(`!!document.querySelector("#ans")`);
    const w = WORDS[i]; if (!(await leaks(w.word))) hiddenOK++;
    const n = await text(); seen.push(n.match(/Card (\d+) of 20/)?.[1]);
    await type("#ans", w.word); await enter(); await waitFor(`!!document.querySelector(".result")`);
    await click('[data-action="next"]'); await sleep(150);
    if (i % 5 === 4 && i < 19) { await waitFor(`!!document.querySelector(".break")`); await click('[data-action="continue"]'); }
  }
  ok(hiddenOK === 20, "all 20 cards played in order, each with the word hidden before typing", `${hiddenOK}/20 hidden`);
  ok(seen.join(",") === Array.from({ length: 20 }, (_, i) => i + 1).join(","), "card counter ran 1..20");
  await waitFor(`!!document.querySelector(".break")`);
  ok((await text()).includes("Whole game: 20 of 20 spelled all by yourself"), "perfect run is recorded as 20/20 independent");
  ok((await stored()).sessions.length >= 4, "four 5-card breaks recorded");

  // ===== 12. mobile layout ===========================================================================================
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 375, height: 667, deviceScaleFactor: 2, mobile: true });
  await goto(BASE); await shot("05_mobile_home");
  ok(await ev(`document.documentElement.scrollWidth <= window.innerWidth + 1`), "mobile home: no horizontal scrolling");
  await click('[data-action="start"][data-round="3"]'); await waitFor(`!!document.querySelector("#ans")`); await shot("06_mobile_card");
  ok(await ev(`document.documentElement.scrollWidth <= window.innerWidth + 1`), "mobile card: no horizontal scrolling");
  ok(await ev(`[...document.querySelectorAll("button")].every(b => { const r=b.getBoundingClientRect(); return r.height===0 || (r.height>=44 && r.width>=44); })`), "all buttons are at least 44x44 px on a phone");
  await cdp.send("Emulation.clearDeviceMetricsOverride");

  // ===== 13. network: nothing left this machine ======================================================================
  const external = requests.filter((u) => !u.startsWith(BASE.split("/flashcards")[0]) && !u.startsWith("data:") && !u.startsWith("about:"));
  ok(external.length === 0, "every network request stayed on localhost (no CDN, analytics or cloud)", external.join(", "));
  ok(consoleErrors.length === 0, "no uncaught JavaScript errors", consoleErrors.join(" | "));

  // ===== 14. contact sheet of all 20 illustrations ===================================================================
  if (SHOTS) {
    await goto(BASE);
    await ev(`(async()=>{ const m = await import("./words.js"); const a = await import("./art.js");
      document.body.innerHTML = '<div id="sheet" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:8px;background:#fff">' +
        m.WORDS.map(w => '<div style="border:2px solid #222">' + a.sceneSVG(w.art, w.alt) + '<div style="font:700 13px sans-serif;padding:2px 6px">' + w.n + '</div></div>').join("") + '</div>'; })()`);
    await sleep(500); await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1200, height: 1250, deviceScaleFactor: 1, mobile: false }); await sleep(300); await shot("07_all_20_scenes");
  }
} catch (e) { failures++; console.log("FAIL  test aborted: " + e.message); }

console.log(`\n${checks - failures}/${checks} checks passed${failures ? ", " + failures + " FAILED" : ""}`);
cleanup(); process.exit(failures ? 1 : 0);
