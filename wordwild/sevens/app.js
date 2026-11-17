import { FACTS, MEDALS, RANGES, THEMES } from "./facts.js";
import { newRound, parseAnswer, isCorrect, formatTime, outcomeFor, medalFor, alertLevel, streakCheer, load, save, wipe } from "./engine.js";
import * as S from "./sounds.js";
import { createConfetti } from "./confetti.js";

const app = document.getElementById("app");
const fx = document.getElementById("fx");
const tint = document.getElementById("tint");
const ambient = document.getElementById("ambient");
const confetti = createConfetti(document.getElementById("confetti"));
const CLUE_PENALTY_MS = 5000;

const LOOKS = {
  fire:  { colors: ["#ff4d00", "#ffb703", "#ffd166", "#ff006e", "#fff3b0"], emoji: ["🔥", "⭐", "✨", "7️⃣"], ambient: ["🔥", "✨", "🔥", "🌟"] },
  space: { colors: ["#7c5cff", "#00d1ff", "#ffd166", "#ff5cf0", "#ffffff"], emoji: ["🚀", "⭐", "🪐", "👽", "7️⃣"], ambient: ["⭐", "✨", "🪐", "☄️", "🌙"] },
  candy: { colors: ["#ff4fa3", "#25c2a0", "#ffd23f", "#8e6bff", "#ff9a3c"], emoji: ["🍭", "🍬", "🍩", "🌈", "7️⃣"], ambient: ["🍬", "🍭", "🫧", "🍩", "🌈"] },
};

let state = load();
const params = new URLSearchParams(location.search);
if (THEMES.some((t) => t.id === params.get("theme"))) state.theme = params.get("theme");
if (RANGES.some((r) => String(r.max) === params.get("range"))) state.range = Number(params.get("range"));
S.setMuted(state.muted);

let g = null;            // the game in progress, or null on the menu
let ticker = null;
let lastSec = null, lastLevel = 0;

const $ = (sel) => app.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const focusMain = () => app.focus({ preventScroll: true });
const stopTicker = () => { if (ticker) clearInterval(ticker); ticker = null; };
const store = () => save(state);

function applyTheme() {
  document.body.dataset.theme = state.theme;
  S.setLook(state.theme); confetti.setLook(LOOKS[state.theme]);
  ambient.replaceChildren();
  if (reduceMotion()) return;
  const set = LOOKS[state.theme].ambient;
  for (let i = 0; i < 16; i++) {
    const s = document.createElement("span");
    s.textContent = set[i % set.length];
    s.style.cssText = `left:${(i * 37 + 7) % 100}%;font-size:${14 + (i * 7) % 22}px;animation-duration:${9 + (i * 5) % 11}s;animation-delay:-${(i * 3) % 14}s`;
    ambient.append(s);
  }
}

function setAlert(level) {
  tint.className = `a${level}`;
  if (level > lastLevel && level > 0) S.play("warn", level);
  lastLevel = level;
}

function flyPop(text, cls = "") {
  const el = document.createElement("div");
  el.className = `flypop ${cls}`; el.textContent = text; fx.append(el);
  setTimeout(() => el.remove(), 1000);
}
function toast(text) {
  const el = document.createElement("div");
  el.className = "toast"; el.textContent = text; fx.append(el);
  setTimeout(() => el.remove(), 1500);
}
function countUp(el, to, ms, fmt = (v) => String(Math.round(v))) {
  if (reduceMotion()) { el.textContent = fmt(to); return; }
  const t0 = performance.now();
  (function step(t) {
    const k = Math.min(1, (t - t0) / ms);
    el.textContent = fmt(to * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(step); else el.textContent = fmt(to);
  })(t0);
}

/* ---------- clue: rhyme, dot array, and the skip-counting pattern ---------- */
function dotsHtml(n) {
  if (n === 0) return `<p class="note">Zero rows of seven dots: nothing at all!</p>`;
  const rows = Array.from({ length: n }, (_, r) => `<div class="drow r${r % 2}">${Array.from({ length: 7 }, () => "<i></i>").join("")}</div>`).join("");
  return `<div class="dots7" role="img" aria-label="${n} rows of 7 dots, which is 7 times ${n}">${rows}</div>`;
}
function patternHtml(n) {
  const from = Math.max(0, n - 4);
  const cells = [];
  for (let k = from; k <= n; k++) cells.push(`<span class="${k === n ? "hit" : ""}">${7 * k}</span>`);
  return `<div class="pattern"><span class="lbl">Count by 7s:</span>${cells.join("")}</div>`;
}

/* ---------- menu ---------- */
function menu() {
  stopTicker(); g = null; setAlert(0); lastLevel = 0; confetti.clear(); document.body.classList.remove("playing");
  const max = state.range, best = state.best[max];
  const themeBtns = THEMES.map((t) => `<button class="pick ${t.id === state.theme ? "on" : ""}" data-theme="${t.id}" aria-pressed="${t.id === state.theme}"><span aria-hidden="true">${t.icon}</span>${t.label}</button>`).join("");
  const rangeBtns = RANGES.map((r) => `<button class="pick ${r.max === max ? "on" : ""}" data-range="${r.max}" aria-pressed="${r.max === max}">${r.label}<small>${r.sub}</small></button>`).join("");
  const medalRow = MEDALS.map((m) => { const got = state.medals[`${max}:${m.id}`]; return `<div class="medal ${got ? "earned" : ""}"><span class="big-icon" aria-hidden="true">${m.icon}</span>${m.label}<br><small>${m.seconds[max]} seconds</small><br><small>${got ? "Earned!" : "Not yet"}</small></div>`; }).join("");
  app.innerHTML = `
    <h1 class="title">Super Sevens</h1>
    <p class="lede">The 7 times table, 7 × 0 to 7 × ${max}. Type the answer, tap 💡 when you need a clue, and chase a medal.</p>
    <h2>Pick a look</h2><div class="picks" role="group" aria-label="Look">${themeBtns}</div>
    <h2>How far?</h2><div class="picks" role="group" aria-label="Range">${rangeBtns}</div>
    <h2>Pick a game</h2>
    <div class="grid">
      <button class="big" data-mode="practice">Practice<small>silly questions, clues, and a score</small></button>
      <button class="big alt" data-mode="stopwatch">Stopwatch<small>how fast can you do all ${max + 1}?${best ? ` Best: ${formatTime(best)}` : ""}</small></button>
    </div>
    <h2>Beat the clock <span class="tag">medals</span></h2>
    <p class="note">All ${max + 1} facts before the time runs out. The screen changes color as time gets short. A clue costs 5 seconds.</p>
    <div class="medals">${medalRow}</div>
    <div class="grid">${MEDALS.map((m) => `<button class="big go" data-mode="clock" data-medal="${m.id}">${m.icon} ${m.label}<small>${m.seconds[max]} seconds</small></button>`).join("")}</div>
    <h2>Settings</h2>
    <div class="settings"><label><input type="checkbox" id="snd" ${state.muted ? "" : "checked"}> Sound effects</label></div>
    <button class="link reset" id="wipe">Erase my scores on this device</button>`;
  app.querySelectorAll("[data-theme]").forEach((b) => b.addEventListener("click", () => { S.unlock(); state.theme = b.dataset.theme; applyTheme(); store(); S.play("sparkle"); confetti.burst(innerWidth / 2, innerHeight * 0.4, 30); menu(); }));
  app.querySelectorAll("[data-range]").forEach((b) => b.addEventListener("click", () => { S.unlock(); S.play("pop"); state.range = Number(b.dataset.range); store(); menu(); }));
  app.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => start(b.dataset.mode, b.dataset.medal)));
  $("#snd").addEventListener("change", (e) => { state.muted = !e.target.checked; S.setMuted(state.muted); store(); if (!state.muted) { S.unlock(); S.play("correct"); } });
  $("#wipe").addEventListener("click", () => { if (confirm("Erase all scores and medals on this device?")) { wipe(); state = load(); S.setMuted(state.muted); applyTheme(); menu(); } });
}

/* ---------- starting a run ---------- */
function start(mode, medalId) {
  S.unlock(); S.play("pop");
  const medal = MEDALS.find((m) => m.id === medalId) || null, max = state.range;
  g = { mode, medal, max, total: max + 1, limitMs: medal ? medal.seconds[max] * 1000 : 0, queue: newRound(max), results: [], log: [], tries: 0, usedClue: false, streak: 0, t0: null, ended: false };
  document.body.classList.add("playing");
  const title = mode === "practice" ? "Practice" : mode === "stopwatch" ? "Stopwatch" : `${medal.icon} ${medal.label} challenge`;
  const blurb = mode === "practice" ? `${g.total} questions. A clean first try earns a ⭐. Tap 💡 for a clue and you get a bulb instead.`
    : mode === "stopwatch" ? `The watch starts when you press Start. Answer all ${g.total} facts. A clue adds 5 seconds.`
    : `You have <strong>${medal.seconds[max]} seconds</strong> for all ${g.total} facts. Wrong answers let you try again. Skip sends a question to the end. A clue costs 5 seconds. Watch the screen color!`;
  app.innerHTML = `<h1 class="title">${title}</h1><p class="lede">${blurb}</p>
    <div class="btns"><button class="big go" id="go">Start</button><button class="big ghost" id="back">Back</button></div>`;
  $("#go").addEventListener("click", begin);
  $("#back").addEventListener("click", menu);
  focusMain();
}

function begin() {
  S.unlock(); S.play("pop");
  g.t0 = Date.now(); lastSec = null; lastLevel = 0;
  if (g.mode !== "practice") ticker = setInterval(tick, 100);
  question();
}

const elapsed = () => Date.now() - g.t0;
const remaining = () => g.limitMs - elapsed();

function tick() {
  if (!g || g.ended) return;
  if (g.mode === "clock") {
    const left = remaining();
    if (left <= 0) return finish(false);
    const el = $("#clock"), bar = $("#barfill");
    if (el) { el.textContent = formatTime(left); el.classList.toggle("low", left < 10000); }
    if (bar) bar.style.width = `${(left / g.limitMs) * 100}%`;
    setAlert(alertLevel(left, g.limitMs));
    const sec = Math.ceil(left / 1000);
    if (left <= 10000 && sec !== lastSec) { lastSec = sec; S.play("tick"); }
  } else {
    const el = $("#clock"); if (el) el.textContent = formatTime(elapsed());
  }
}

/* ---------- a question ---------- */
function question() {
  const f = g.queue[0]; g.tries = 0; g.usedClue = false;
  const done = g.results.length;
  const timed = g.mode !== "practice";
  const clockText = g.mode === "clock" ? formatTime(remaining()) : g.mode === "stopwatch" ? formatTime(elapsed()) : "";
  const pct = g.mode === "clock" ? Math.max(0, remaining() / g.limitMs) * 100 : (done / g.total) * 100;
  S.play("whoosh");
  app.innerHTML = `
    <div class="topbar"><span class="progress">Question ${done + 1} of ${g.total}</span>
      ${timed ? `<span class="clock" id="clock" role="timer" aria-label="${g.mode === "clock" ? "Time left" : "Time so far"}">${clockText}</span>` : `<span class="score">⭐ ${g.results.filter((r) => r === "star").length}${g.streak >= 2 ? ` · 🔥 ${g.streak}` : ""}</span>`}</div>
    <div class="bar" aria-hidden="true"><i id="barfill" style="width:${pct}%"></i></div>
    <div class="card" id="card">
      <p class="story">${esc(f.q)}</p>
      <p class="sum" aria-label="7 times ${f.n}"><span class="n">7</span><span class="op">×</span><span class="n">${f.n}</span><span class="op">=</span><span class="n qm">?</span></p>
      <form class="entry" id="form" autocomplete="off">
        <label class="label" for="ans">Your answer</label>
        <input id="ans" class="num" type="text" inputmode="none" readonly maxlength="3" autocomplete="off" aria-describedby="msg" placeholder="?">
        <p class="wrong" id="msg" role="status" aria-live="polite"></p>
        <div class="keypad" role="group" aria-label="Number pad">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => `<button type="button" class="key" data-key="${d}">${d}</button>`).join("")}
          <button type="button" class="key back" data-key="back" aria-label="Backspace">⌫</button>
          <button type="button" class="key" data-key="0">0</button>
          <button type="submit" class="key check" aria-label="Check my answer">✓</button>
        </div>
      </form>
      <div class="btns two">
        <button class="big alt" type="button" id="clue">💡 Clue${timed ? " (+5s)" : ""}</button>
        <button class="big ghost" type="button" id="skip">Skip</button>
      </div>
      <div id="hintbox" aria-live="polite"></div>
    </div>
    <button class="link reset" id="quit">Stop and go back</button>`;
  $("#form").addEventListener("submit", (e) => { e.preventDefault(); submit(); });
  app.querySelectorAll(".key[data-key]").forEach((k) => k.addEventListener("click", () => press(k.dataset.key)));
  $("#clue").addEventListener("click", () => showClue(true));
  $("#skip").addEventListener("click", skip);
  $("#quit").addEventListener("click", () => { if (g.mode === "practice" || confirm("Stop this run?")) menu(); });
}

// The on-screen number pad (and a real keyboard, for desktops) edit the answer box.
function press(key) {
  const input = $("#ans"); if (!input || !g || g.ended) return;
  if (key === "back") { input.value = input.value.slice(0, -1); S.play("tap", 0); }
  else if (/^\d$/.test(key) && input.value.length < 3) { input.value += key; S.play("tap", Number(key)); }
  $("#msg").textContent = "";
}
document.addEventListener("keydown", (e) => {
  if (!g || g.ended || !$("#ans") || e.ctrlKey || e.metaKey || e.altKey) return;
  if (/^\d$/.test(e.key)) { e.preventDefault(); press(e.key); }
  else if (e.key === "Backspace") { e.preventDefault(); press("back"); }
  else if (e.key === "Enter" && document.activeElement && document.activeElement.closest && !document.activeElement.closest("button")) { e.preventDefault(); submit(); }
});

function showClue(manual) {
  const f = g.queue[0];
  if (manual && g.mode !== "practice" && !g.usedClue) { g.t0 -= CLUE_PENALTY_MS; flyPop("+5s", "bad"); }
  g.usedClue = true; S.play("clue");
  $("#hintbox").innerHTML = `<div class="hint">💡 ${esc(f.clue)}</div>${dotsHtml(f.n)}${patternHtml(f.n)}`;
  $("#hintbox").scrollIntoView({ block: "nearest", behavior: reduceMotion() ? "auto" : "smooth" });
}

function submit() {
  const f = g.queue[0], input = $("#ans"), msg = $("#msg");
  const val = parseAnswer(input.value);
  if (val === null) { msg.textContent = "Tap the numbers, then press ✓."; return; }
  if (isCorrect(f, input.value)) {
    g.streak++; const cheer = streakCheer(g.streak);
    const r = $("#ans").getBoundingClientRect();
    S.play("correct", g.streak); S.play("sparkle");
    confetti.burst(r.left + r.width / 2, r.top, 38, { power: 12 });
    flyPop(String(f.a), "good");
    if (cheer) { S.play("streak", cheer); toast(`🔥 ${cheer} in a row!`); confetti.burst(innerWidth / 2, innerHeight * 0.55, 70, { power: 15, spread: Math.PI * 1.4 }); }
    const o = outcomeFor(g); g.results.push(o); g.log.push({ n: f.n, o }); g.queue.shift();
    if (!g.queue.length) return finish(true);
    return question();
  }
  g.tries++; g.streak = 0; S.play("whoops");
  input.value = "";
  const card = $("#card"); card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake");
  document.body.classList.add("oops"); setTimeout(() => document.body.classList.remove("oops"), 450);
  if (g.mode !== "practice" || g.usedClue || g.tries < 2) msg.textContent = "Not quite. Try again!";
  else { msg.textContent = "Not quite. Here is a clue to help!"; showClue(false); }
  if (g.mode !== "practice" && g.tries >= 2 && !g.usedClue) msg.textContent = "Not quite. Stuck? Tap 💡 (+5s).";
}

function skip() { S.play("boing"); g.streak = 0; g.queue.push(g.queue.shift()); question(); }

/* ---------- the end ---------- */
function finish(allDone) {
  if (g.ended) return; g.ended = true; stopTicker(); setAlert(0);
  const ms = Math.min(elapsed(), g.mode === "clock" ? g.limitMs : Infinity), stars = g.results.filter((r) => r === "star").length;
  state.plays++;
  let body = "", after = () => {};
  if (g.mode === "practice") {
    after = () => { S.play("fanfare"); confetti.finale(); };
    body = `<div class="celebrate" aria-hidden="true">🎉</div><h1 class="title">Round complete!</h1>
      <p class="outcome"><span class="big-num" id="cu">0</span> of ${g.total} ⭐ on the first try, no clue.</p>`;
  } else if (g.mode === "stopwatch") {
    const record = !state.best[g.max] || ms < state.best[g.max];
    if (record) state.best[g.max] = ms;
    after = () => { S.play("fanfare"); confetti.finale(); };
    body = `<div class="celebrate" aria-hidden="true">⏱️</div><h1 class="title big-num" id="cu">0:00.0</h1>
      <p class="outcome">${record ? "🏆 New best time!" : `Best time so far: ${formatTime(state.best[g.max])}`}</p>
      <p class="note">⭐ ${stars} of ${g.total} on the first try, no clue.</p>`;
  } else if (allDone && ms <= g.limitMs) {
    state.medals[`${g.max}:${g.medal.id}`] = true;
    after = () => { S.play("medal"); S.play("fanfare"); confetti.finale(); setTimeout(() => confetti.finale(), 900); };
    body = `<div class="celebrate medal-drop" aria-hidden="true">${g.medal.icon}</div><h1 class="title">${g.medal.label} medal!</h1>
      <p class="outcome">All ${g.total} in <span id="cu">0:00.0</span>. The limit was ${g.medal.seconds[g.max]} seconds.</p>`;
  } else if (allDone) {
    after = () => S.play("boing");
    body = `<h1 class="title">So close!</h1><p class="outcome">All ${g.total} done in ${formatTime(ms)}, just past the ${g.medal.seconds[g.max]} second limit. Try again!</p>`;
  } else {
    after = () => { S.play("buzzer"); document.body.classList.add("oops"); setTimeout(() => document.body.classList.remove("oops"), 600); };
    body = `<h1 class="title">Time's up!</h1><p class="outcome">You got <span class="big-num">${g.results.length}</span> of ${g.total} in ${g.medal.seconds[g.max]} seconds. Practice the tricky ones and try again.</p>`;
  }
  const tricky = g.log.filter((r) => r.o === "bulb").map((r) => `<span>7 × ${r.n}</span>`).join("");
  store();
  app.innerHTML = `${body}${tricky ? `<p class="note">Practice these next:</p><div class="stars">${tricky}</div>` : ""}
    <div class="btns"><button class="big go" id="again">Play again</button><button class="big ghost" id="menu">Menu</button></div>`;
  const mode = g.mode, medal = g.medal, cu = $("#cu");
  if (cu && g.mode === "practice") countUp(cu, stars, 900);
  else if (cu && g.mode === "stopwatch") countUp(cu, ms, 1100, formatTime);
  else if (cu) countUp(cu, ms, 900, formatTime);
  if (g.mode === "practice" || g.mode === "stopwatch" || (allDone && ms <= g.limitMs)) { S.play("drum"); setTimeout(after, reduceMotion() ? 0 : 850); } else after();
  $("#again").addEventListener("click", () => start(mode, medal && medal.id));
  $("#menu").addEventListener("click", menu);
  focusMain();
}

applyTheme();
menu();
