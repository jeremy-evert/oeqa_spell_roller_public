// Controller: wires views, engine, sound, voice and storage together. All scoring rules live in engine.js.
import { WORDS } from "./words.js";
import { CardRun, OUTCOME, Progress, rounds, shuffled } from "./engine.js";
import { homeView, cardView, resultView, flipFrontView, flipBackView, breakView, emptyReviewView, CHEERS, OOPS } from "./views.js";
import * as sfx from "./sfx.js";
import * as voice from "./voice.js";
import { load, save, wipe } from "./storage.js";

const app = document.getElementById("app");
const byWord = Object.fromEntries(WORDS.map((w) => [w.word, w]));
const progress = new Progress(load());
const settings = progress.state.settings;
if (settings.reducedMotion === null) settings.reducedMotion = !!globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
sfx.setMuted(settings.muted);
applyCalm();

let session = null; // { mode, label, words, idx, outcomes, batchStart, run, hint, stage, line }
let voiceReady = false;
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const persist = () => save(progress.state);

function applyCalm() { document.body.classList.toggle("calm", !!settings.reducedMotion); }

function render(html, focusSel) {
  app.innerHTML = html;
  const el = focusSel ? app.querySelector(focusSel) : app.querySelector("h1,h2,#ch");
  if (el) { if (!el.hasAttribute("tabindex") && !/^(INPUT|BUTTON)$/.test(el.tagName)) el.setAttribute("tabindex", "-1"); el.focus({ preventScroll: false }); }
  window.scrollTo?.(0, 0);
}

function home() { session = null; voice.stop(); render(homeView(progress, settings, voiceReady)); }

// ---- sessions ----------------------------------------------------------------------------------------------
function startSession(mode, roundKey) {
  let words, label;
  if (mode === "review") {
    words = progress.reviewList().map((x) => byWord[x]);
    if (!words.length) return render(emptyReviewView());
    label = "Quick Review";
  } else if (mode === "flip") { words = WORDS.slice(); label = "Flip & Learn"; }
  else if (roundKey === "all") { words = WORDS.slice(); label = "All 20"; }
  else if (roundKey === "surprise") { words = shuffled(WORDS.map((w) => w.word)).slice(0, 5).map((x) => byWord[x]); label = "Surprise 5"; }
  else { const i = Number(roundKey); words = rounds()[i].map((x) => byWord[x]); label = "Round " + (i + 1); }
  session = { mode, label, words, idx: 0, outcomes: [], batchStart: 0, run: null, hint: null, line: "", stage: "front" };
  sfx.play("pop");
  showCard(true);
}

function showCard(autoplay) {
  const w = session.words[session.idx];
  session.hint = null; session.line = "";
  if (session.mode === "flip") {
    session.stage = "front"; session.run = null;
    render(flipFrontView({ w, index: session.idx, total: session.words.length }), "#ch");
  } else {
    session.run = new CardRun(w.word, { accessible: settings.accessible });
    draw();
  }
  if (autoplay) voice.say(w.word, w.sentence, "word");
}

function draw() {
  const w = session.words[session.idx], run = session.run;
  render(cardView({ w, run, index: session.idx, total: session.words.length, hint: session.hint, mascotLine: session.line }),
         run.phase === "recall" ? "#ans" : ".study .big");
}

function finishCard() {
  const w = session.words[session.idx], run = session.run;
  progress.record(w.word, run.outcome); persist();
  session.outcomes.push({ word: w.word, outcome: run.outcome });
  const last = (session.idx + 1) % 5 === 0 || session.idx + 1 === session.words.length;
  render(resultView({ w, run, index: session.idx, total: session.words.length, cheer: pick(CHEERS), last }), "#rh");
  if (run.outcome !== OUTCOME.SKIPPED) { sfx.play("correct"); confetti(); voice.say(w.word, w.sentence, "sentence"); }
  else sfx.play("boing");
}

function next() {
  session.idx++;
  const batchDone = session.idx % 5 === 0 || session.idx >= session.words.length;
  if (batchDone && session.outcomes.length) {
    const rows = session.outcomes.slice(session.batchStart);
    session.batchStart = session.outcomes.length;
    progress.recordSession(session.mode, rows.map((r) => r.outcome)); persist();
    sfx.play("fanfare"); confetti(true);
    render(breakView({ rows, kindLabel: session.idx >= session.words.length ? session.label : "Five cards",
      hasMore: session.idx < session.words.length, stats: { independent: rows.filter((r) => r.outcome === OUTCOME.INDEPENDENT).length },
      overall: session.idx >= session.words.length && session.words.length > 5
        ? { independent: session.outcomes.filter((r) => r.outcome === OUTCOME.INDEPENDENT).length, total: session.outcomes.length } : null }), "#bh");
    return;
  }
  if (session.idx >= session.words.length) return home();
  showCard(true);
}

// ---- delight -----------------------------------------------------------------------------------------------
function confetti(big = false) {
  if (settings.reducedMotion) return;
  const box = document.getElementById("fx"); if (!box) return;
  const bits = ["🎉", "⭐", "✨", "🥔", "🎈", "🌟"];
  for (let i = 0; i < (big ? 36 : 18); i++) {
    const s = document.createElement("span");
    s.textContent = pick(bits); s.className = "bit";
    s.style.left = Math.random() * 100 + "vw"; s.style.animationDelay = Math.random() * 0.5 + "s"; s.style.fontSize = 18 + Math.random() * 22 + "px";
    box.appendChild(s); setTimeout(() => s.remove(), 2600);
  }
}

// ---- events ------------------------------------------------------------------------------------------------
app.addEventListener("click", (e) => {
  const t = e.target.closest("[data-action]"); if (!t || t.tagName === "FORM") return;
  sfx.unlock();
  const a = t.dataset.action;
  const w = session && session.words[session.idx];
  switch (a) {
    case "start": return startSession(t.dataset.mode, t.dataset.round);
    case "home": sfx.play("pop"); return home();
    case "say": case "say-result": sfx.play("pop"); return void voice.say(w.word, w.sentence, t.dataset.kind);
    case "hint": { const h = session.run.useHint(); session.hint = h; session.line = "A hint! That is allowed. It just means this one counts as 'with a hint'."; sfx.play("hint"); return draw(); }
    case "study": session.run.reveal(); progress.recordStudy(w.word); persist(); sfx.play("flip"); return draw();
    case "try-memory":
      if (session.mode === "flip") { session.run = new CardRun(w.word, { accessible: settings.accessible, studied: true }); sfx.play("pop"); session.line = "Spelling is hidden again. You can do it!"; return draw(); }
      session.run.tryFromMemory(); session.line = "Spelling is hidden again. Type it from memory!"; sfx.play("pop"); return draw();
    case "skip": session.run.skip(); return finishCard();
    case "flip": progress.recordStudy(w.word); persist(); sfx.play("flip"); session.stage = "back";
      render(flipBackView({ w, index: session.idx, total: session.words.length }), "#ch"); return;
    case "next": sfx.play("pop"); if (session.run && !session.run.done && session.mode !== "flip") { session.run.skip(); return finishCard(); } return next();
    case "continue": sfx.play("pop"); return showCard(true);
    case "start-review": return startSession("review");
    case "reset-ask": document.getElementById("resetbox").innerHTML =
      ` Really erase all progress on this device? <button class="btn" data-action="reset-yes">Yes, erase it</button> <button class="btn" data-action="reset-no">Cancel</button>`; return;
    case "reset-no": document.getElementById("resetbox").textContent = ""; return;
    case "reset-yes": progress.reset(); wipe(); persist(); sfx.play("pop"); return home();
  }
});

app.addEventListener("submit", (e) => {
  e.preventDefault(); sfx.unlock();
  if (!session?.run) return;
  const input = app.querySelector("#ans"), run = session.run, w = session.words[session.idx];
  const res = run.submit(input ? input.value : "");
  if (res.ignored) return;
  if (res.empty) { session.line = res.message; return draw(); }
  if (res.correct) return finishCard();
  sfx.play("whoops");
  session.line = pick(OOPS) + " " + res.message + (res.offerHelp ? " Want a 💡 Hint, or 📖 Show / Study?" : "");
  draw();
  const bubble = document.getElementById("fb"); bubble?.classList.add("wobble");
});

app.addEventListener("change", (e) => {
  const s = e.target.dataset?.setting; if (!s) return;
  if (s === "sfx") { settings.muted = !e.target.checked; sfx.setMuted(settings.muted); if (!settings.muted) { sfx.unlock(); sfx.play("pop"); } }
  if (s === "calm") { settings.reducedMotion = e.target.checked; applyCalm(); }
  if (s === "accessible") settings.accessible = e.target.checked;
  persist();
});

voice.loadManifest().then((ok) => { voiceReady = ok; home(); });
globalThis.__wordwild = { sfxStats: sfx.sfxStats, voiceStats: voice.voiceStats }; // read-only counters for tests
