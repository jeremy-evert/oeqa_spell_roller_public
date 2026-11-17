import { FACTS, MEDALS, RANGES, THEMES } from "./facts.js";
import { newRound, rhymeLines, missingQuestion, classicQuestion, recordResult, trickyCount, pickTricky, parseAnswer, formatTime, outcomeFor, alertLevel, streakCheer, load, save, wipe } from "./engine.js";
import * as S from "./sounds.js";
import { createConfetti } from "./confetti.js";
import { eggFor, nextFact, SECRETS } from "./easter.js";

const app = document.getElementById("app");
const fx = document.getElementById("fx");
const tint = document.getElementById("tint");
const ambient = document.getElementById("ambient");
const confetti = createConfetti(document.getElementById("confetti"));
const CLUE_PENALTY_MS = 5000;
const UNTIMED = ["practice", "missing", "tricky", "build"];
const NAMES = { practice: "Practice", missing: "Guess the Missing Number", tricky: "Tricky Facts", build: "Build It", stopwatch: "Stopwatch" };

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
  closeSheet(); stopTicker(); g = null; setAlert(0); lastLevel = 0; confetti.clear(); document.body.classList.remove("playing");
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
    <h2>More ways to learn <span class="tag">new</span></h2>
    <div class="grid">
      <button class="big" data-mode="missing">🔎 Guess the Missing Number<small>7 × ? = 35, 35 ÷ 7 = ?</small></button>
      <button class="big alt" data-mode="tricky">🎯 Tricky Facts<small>${!Object.keys(state.learn).length ? "play a round first" : trickyCount(state.learn, max) ? `${trickyCount(state.learn, max)} missed fact${trickyCount(state.learn, max) === 1 ? "" : "s"} to revisit` : "none missed: a review mix"}</small></button>
      <button class="big go" data-mode="build">🧱 Build It<small>stack the dots, then count</small></button>
    </div>
    <h2>Beat the clock <span class="tag">medals</span></h2>
    <p class="note">All ${max + 1} facts before the time runs out. The screen changes color as time gets short. A clue costs 5 seconds.</p>
    <div class="medals">${medalRow}</div>
    <div class="grid">${MEDALS.map((m) => `<button class="big go" data-mode="clock" data-medal="${m.id}">${m.icon} ${m.label}<small>${m.seconds[max]} seconds</small></button>`).join("")}</div>
    <h2>Settings</h2>
    <div class="settings"><label><input type="checkbox" id="snd" ${state.muted ? "" : "checked"}> Sound effects</label>
      <label><input type="checkbox" id="rhy" ${state.rhymes ? "checked" : ""}> Show the rhyme with each question</label></div>
    <p class="note"><a href="soundcheck.html">🔊 Sound check: hear every sound in every look</a></p>
    <button class="link reset" id="wipe">Erase my scores on this device</button>`;
  app.querySelectorAll("[data-theme]").forEach((b) => b.addEventListener("click", () => { S.unlock(); state.theme = b.dataset.theme; applyTheme(); store(); S.play("intro"); confetti.burst(innerWidth / 2, innerHeight * 0.4, 30); menu(); }));
  app.querySelectorAll("[data-range]").forEach((b) => b.addEventListener("click", () => { S.unlock(); S.play("pop"); state.range = Number(b.dataset.range); store(); menu(); }));
  app.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => start(b.dataset.mode, b.dataset.medal)));
  $("#snd").addEventListener("change", (e) => { state.muted = !e.target.checked; S.setMuted(state.muted); store(); if (!state.muted) { S.unlock(); S.play("correct"); } });
  $("#rhy").addEventListener("change", (e) => { state.rhymes = e.target.checked; store(); });
  $("#wipe").addEventListener("click", () => { if (confirm("Erase all scores and medals on this device?")) { wipe(); state = load(); S.setMuted(state.muted); applyTheme(); menu(); } });
}

/* ---------- starting a run ---------- */
function start(mode, medalId) {
  S.unlock(); S.play("pop");
  const medal = MEDALS.find((m) => m.id === medalId) || null, max = state.range;
  const queue = mode === "tricky" ? pickTricky(state.learn, state.round, max, 10) : mode === "missing" ? newRound(max).slice(0, 10) : mode === "build" ? newRound(max).slice(0, 8) : newRound(max);
  g = { mode, timed: !UNTIMED.includes(mode), medal, max, total: queue.length, limitMs: medal ? medal.seconds[max] * 1000 : 0, queue, results: [], log: [], tries: 0, usedClue: false, streak: 0, up: 0, rows: 0, bag: [], t0: null, ended: false };
  document.body.classList.add("playing");
  const title = NAMES[mode] || `${medal.icon} ${medal.label} challenge`;
  const blurb = mode === "practice" ? `${g.total} questions. A clean first try earns a ⭐. Tap 💡 for a clue and you get a bulb instead.`
    : mode === "missing" ? `${g.total} questions where a number is hiding: 7 × ? = 35, 35 ÷ 7 = ?, and ? ÷ 7 = 5. They are all the same fact family. A clean first try earns a ⭐.`
    : mode === "tricky" ? `${g.total} facts to visit again: the ones you missed come first, and the ones you know well wait longer. That is how memory sticks.`
    : mode === "build" ? `${g.total} facts. Tap ➕ to stack rows of 7 dots, then count how many dots there are in all.`
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
  if (g.timed) ticker = setInterval(tick, 100);
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
  const f = g.queue[0]; g.tries = 0; g.usedClue = false; g.clueLevel = 0; g.rows = 0; g.counting = false;
  const q = g.q = g.mode === "missing" ? missingQuestion(f) : classicQuestion(f);
  if (g.mode === "build") q.story = f.n === 0 ? "7 × 0 means 0 rows of 7. Nothing to stack! How many dots in all?" : `Build 7 × ${f.n}: stack ${f.n} row${f.n === 1 ? "" : "s"} of 7, then count the dots.`;
  const done = g.results.length;
  const timed = g.timed;
  const clockText = g.mode === "clock" ? formatTime(remaining()) : g.mode === "stopwatch" ? formatTime(elapsed()) : "";
  const pct = g.mode === "clock" ? Math.max(0, remaining() / g.limitMs) * 100 : (done / g.total) * 100;
  S.play("whoosh");
  app.innerHTML = `
    <div class="topbar"><span class="progress">Question ${done + 1} of ${g.total}</span>
      ${timed ? `<span class="clock" id="clock" role="timer" aria-label="${g.mode === "clock" ? "Time left" : "Time so far"}">${clockText}</span>` : `<span class="score">⭐ ${g.results.filter((r) => r === "star").length}${g.streak >= 2 ? ` · 🔥 ${g.streak}` : ""}</span>`}</div>
    <div class="bar" aria-hidden="true"><i id="barfill" style="width:${pct}%"></i></div>
    <div class="card" id="card">
      <div class="helpers">
        <button class="mini alt" type="button" id="clue">💡 Think${timed ? " (+5s)" : ""}</button>
        <button class="mini" type="button" id="skip">Skip ⏭</button>
      </div>
      <p class="story">${esc(q.story)}</p>
      ${state.rhymes && g.mode !== "missing" && g.mode !== "build" ? (() => { const r = rhymeLines(f); return `<p class="rhyme" id="rhyme"><span>${esc(r.lead)}</span><span>${esc(r.blank).replace("___", '<b class="blank">___</b>')}</span></p>`; })() : ""}
      <div id="think" class="think" aria-live="polite"></div>
      <p class="sum" aria-label="${esc(q.aria)}">${q.sum.split(" ").map((t) => (/^[×÷=]$/.test(t) ? `<span class="op">${t}</span>` : `<span class="n${t === "?" ? " qm" : ""}">${t}</span>`)).join("")}</p>
      ${g.mode === "build" && f.n > 0 ? `<div id="build" class="build" aria-label="Your stack of dots"></div>
      <div class="btns buildbtns" id="buildbtns"><button class="big go" type="button" id="addrow">➕ Add a row of 7</button><button class="mini" type="button" id="countwith">🔢 Count with me</button></div>` : ""}
      <form class="entry" id="form" autocomplete="off" ${g.mode === "build" && f.n > 0 ? "hidden" : ""}>
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
    </div>
    <button class="link reset" id="quit">Stop and go back</button>`;
  $("#form").addEventListener("submit", (e) => { e.preventDefault(); submit(); });
  let qm = 0;
  $(".sum .qm")?.addEventListener("click", (e) => {
    const el = e.currentTarget; qm++; S.unlock(); S.play("boing"); el.classList.remove("spin"); void el.offsetWidth; el.classList.add("spin");
    if (qm === SECRETS.qmTaps) note("👀 Peek-a-boo! Nice try, but you have to work it out!", 2600);
  });
  app.querySelectorAll(".key[data-key]").forEach((k) => k.addEventListener("click", () => press(k.dataset.key)));
  $("#clue").addEventListener("click", () => giveHelp(true));
  $("#skip").addEventListener("click", skip);
  $("#quit").addEventListener("click", () => { if (!g.timed || confirm("Stop this run?")) menu(); });
  if (g.mode === "build" && f.n > 0) {
    $("#addrow").addEventListener("click", addRow);
    $("#countwith").addEventListener("click", () => { g.counting = true; g.usedClue = true; S.play("clue"); drawBuild(); });
    drawBuild();
  }
}

// Build It: stack rows of 7 dots, in blocks of ten rows side by side.
function drawBuild() {
  const f = g.queue[0], el = $("#build"); if (!el) return;
  const blocks = [];
  for (let start = 0; start < Math.max(g.rows, 1); start += 7) {
    const rows = [];
    for (let r = start; r < Math.min(g.rows, start + 7); r++) rows.push(`<div class="brow"><span class="rl">${g.counting ? 7 * (r + 1) : r + 1}</span><div class="drow r${r % 2}">${"<i></i>".repeat(7)}</div></div>`);
    blocks.push(`<div class="bblock">${rows.join("")}</div>`);
  }
  el.classList.toggle("b3", f.n > 14);
  el.innerHTML = g.rows ? blocks.join("") : `<p class="note">Tap ➕ to start stacking.</p>`;
  const done = g.rows >= f.n;
  const btn = $("#addrow"); if (btn) btn.disabled = done;
}
function addRow() {
  const f = g.queue[0]; if (g.rows >= f.n) return;
  g.rows++; S.unlock(); S.play("correct", g.rows); drawBuild();
  if (g.rows >= f.n) {
    $("#buildbtns").hidden = true; $("#form").hidden = false; S.play("whoosh");
    const dots = f.n * 7; confetti.burst(innerWidth / 2, innerHeight * 0.45, 16, { power: 8, emoji: ["🧱", "✨"] });
    note(g.counting ? "Built it! Now read the last number." : `Built it! Now count: how many dots in all?`, 2400);
    void dots;
  }
}

// The on-screen number pad (and a real keyboard, for desktops) edit the answer box.
function press(key) {
  const input = $("#ans"); if (!input || !g || g.ended) return;
  if (key === "back") { input.value = input.value.slice(0, -1); S.play("tap", 0); }
  else if (/^\d$/.test(key) && input.value.length < 3) { input.value += key; S.play("tap", Number(key)); }
  $("#msg").textContent = "";
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeSheet();
  if (!g || g.ended || !$("#ans") || $("#form").hidden || document.querySelector(".sheet-back") || e.ctrlKey || e.metaKey || e.altKey) return;
  if (/^\d$/.test(e.key)) { e.preventDefault(); press(e.key); }
  else if (e.key === "Backspace") { e.preventDefault(); press("back"); }
  else if (e.key === "Enter" && document.activeElement && document.activeElement.closest && !document.activeElement.closest("button")) { e.preventDefault(); submit(); }
});

// Two levels of help. Level 1 "think" is a strategy with no answer in it; level 2 is the full clue: rhyme, dots, pattern.
function giveHelp(manual) {
  const f = g.queue[0], timed = g.timed;
  if (g.clueLevel >= 2) return openSheet(f);          // already at the top: just show it again, no charge
  g.clueLevel++; g.usedClue = true; S.play("clue");
  if (manual && timed) { g.t0 -= CLUE_PENALTY_MS; flyPop("+5s", "bad"); }
  $("#think").innerHTML = `<strong>Think:</strong> ${esc(g.q.think)}`;
  const btn = $("#clue");
  btn.textContent = g.clueLevel === 1 ? `💡 More help${timed ? " (+5s)" : ""}` : "💡 Show again";
  if (g.clueLevel === 2) openSheet(f);
}

function closeSheet() { const el = document.querySelector(".sheet-back"); if (el) el.remove(); }
function openSheet(f) {
  closeSheet();
  const el = document.createElement("div");
  el.className = "sheet-back";
  el.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="Help for 7 times ${f.n}">
      <p class="think"><strong>Think:</strong> ${esc(g.q.think)}</p>
      <div class="hint">💡 ${esc(f.clue)}</div>${dotsHtml(f.n)}${patternHtml(f.n)}
      <button class="big go" type="button" id="gotit">Got it!</button></div>`;
  el.addEventListener("click", (e) => { if (e.target === el) closeSheet(); });
  document.body.append(el);
  el.querySelector("#gotit").addEventListener("click", closeSheet);
  el.querySelector("#gotit").focus({ preventScroll: true });
}

function submit() {
  const f = g.queue[0], input = $("#ans"), msg = $("#msg");
  const val = parseAnswer(input.value);
  if (val === null) { msg.textContent = "Tap the numbers, then press ✓."; return; }
  if (val === g.q.answer) {
    g.streak++; const cheer = streakCheer(g.streak);
    const r = $("#ans").getBoundingClientRect();
    S.play("correct", g.streak); S.play("sparkle");
    confetti.burst(r.left + r.width / 2, r.top, 38, { power: 12 });
    flyPop(String(g.q.answer), "good");
    if (g.mode === "build") { g.counting = true; drawBuild(); }
    const bl = document.querySelector("#rhyme .blank"); if (bl) { bl.textContent = String(f.a); bl.classList.add("filled"); }
    if (cheer) { S.play("streak", cheer); toast(`🔥 ${cheer} in a row!`); confetti.burst(innerWidth / 2, innerHeight * 0.55, 70, { power: 15, spread: Math.PI * 1.4 }); }
    surprise(f, r);
    const o = outcomeFor(g); g.results.push(o); g.log.push({ n: f.n, o });
    const before = state.learn[f.n] ? state.learn[f.n].box : 0; recordResult(state.learn, f.n, o === "star", state.round);
    if (state.learn[f.n].box > Math.max(before, 1)) g.up++;
    g.queue.shift();
    if (!g.queue.length) return finish(true);
    return question();
  }
  g.tries++; g.streak = 0; S.play("whoops");
  input.value = "";
  const card = $("#card"); card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake");
  document.body.classList.add("oops"); setTimeout(() => document.body.classList.remove("oops"), 450);
  msg.textContent = "Not quite. Try again!";
  if (!g.timed) {
    if (g.tries >= 2 && g.clueLevel < 1) { msg.textContent = "Not quite. Here is something to think about!"; giveHelp(false); }
    else if (g.tries >= 4 && g.clueLevel < 2) { msg.textContent = "Not quite. Here is more help!"; giveHelp(false); }
  } else if (g.tries >= 2 && g.clueLevel < 1) msg.textContent = "Not quite. Stuck? Tap 💡 (+5s).";
}

/* ---------- easter eggs ---------- */
function surprise(f, rect) {
  if (g.streak === SECRETS.luckyStreak) {
    S.play("fanfare"); toast("🍀 LUCKY 7 IN A ROW! 🍀");
    confetti.burst(innerWidth / 2, innerHeight * 0.5, 90, { power: 16, spread: Math.PI * 1.6, emoji: ["7️⃣", "🍀", "🌈", "⭐"] });
    return;
  }
  const egg = eggFor(f.n);
  if (egg) {
    S.play("sparkle"); note(egg.toast);
    confetti.burst(rect.left + rect.width / 2, rect.top, 34, { power: 13, spread: Math.PI * 1.3, emoji: egg.emoji });
  } else if (g.mode !== "clock" && Math.random() < SECRETS.factChance) {
    note(`✨ Fun fact: ${nextFact(g.bag)}`, 4200);
  }
}
function note(text, ms = 2200) {
  const el = document.createElement("div");
  el.className = "egg"; el.textContent = text; fx.append(el);
  setTimeout(() => el.remove(), ms);
}
// hidden: tap the 7 in the header seven times
let logoTaps = [];
document.querySelector(".logo")?.addEventListener("click", () => {
  const now = Date.now(); logoTaps = logoTaps.filter((t) => now - t < SECRETS.logoWindowMs); logoTaps.push(now);
  if (logoTaps.length >= SECRETS.logoTaps) {
    logoTaps = []; S.unlock(); S.play("fanfare"); toast("🌈 LUCKY 7! 🌈"); confetti.finale();
    const sweep = document.createElement("div"); sweep.className = "rainbow-sweep"; fx.append(sweep); setTimeout(() => sweep.remove(), 5200);
  }
});

function skip() { S.play("boing"); g.streak = 0; g.queue.push(g.queue.shift()); question(); }

/* ---------- the end ---------- */
function finish(allDone) {
  if (g.ended) return; closeSheet(); g.ended = true; stopTicker(); setAlert(0);
  const ms = Math.min(elapsed(), g.mode === "clock" ? g.limitMs : Infinity), stars = g.results.filter((r) => r === "star").length;
  state.plays++; state.round++;
  let body = "", after = () => {};
  if (!g.timed) {
    after = () => { S.play("fanfare"); confetti.finale(); };
    const heading = { practice: "Round complete!", missing: "Found every missing number!", tricky: "Tricky facts visited!", build: "Master builder!" }[g.mode];
    body = `<div class="celebrate" aria-hidden="true">🎉</div><h1 class="title">${heading}</h1>
      <p class="outcome"><span class="big-num" id="cu">0</span> of ${g.total} ⭐ on the first try, no clue.</p>
      ${g.mode === "tricky" ? `<p class="note">${g.up} fact${g.up === 1 ? "" : "s"} moved up a level. The ones you missed will come back sooner.</p>` : ""}`;
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
  if (cu && !g.timed) countUp(cu, stars, 900);
  else if (cu && g.mode === "stopwatch") countUp(cu, ms, 1100, formatTime);
  else if (cu) countUp(cu, ms, 900, formatTime);
  if (!g.timed || g.mode === "stopwatch" || (allDone && ms <= g.limitMs)) { S.play("drum"); setTimeout(after, reduceMotion() ? 0 : 850); } else after();
  $("#again").addEventListener("click", () => start(mode, medal && medal.id));
  $("#menu").addEventListener("click", menu);
  focusMain();
}

applyTheme();
menu();
