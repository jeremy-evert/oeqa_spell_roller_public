import { FACTS, MEDALS } from "./facts.js";
import { newRound, parseAnswer, isCorrect, formatTime, outcomeFor, medalFor, load, save, wipe } from "./engine.js";
import { play, setMuted, isMuted, unlock } from "../flashcards/sfx.js";

const app = document.getElementById("app");
const fx = document.getElementById("fx");
let state = load();
let g = null;          // the game in progress, or null on the menu
let ticker = null;

const $ = (sel) => app.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const focusMain = () => app.focus({ preventScroll: true });
const stopTicker = () => { if (ticker) clearInterval(ticker); ticker = null; };

function confetti() {
  if (reduceMotion()) return;
  const bits = ["⭐", "7️⃣", "🎉", "✨", "🥔"];
  for (let i = 0; i < 24; i++) {
    const b = document.createElement("span");
    b.className = "bit"; b.textContent = bits[i % bits.length];
    b.style.left = `${Math.random() * 100}%`; b.style.animationDelay = `${Math.random() * 0.8}s`;
    fx.append(b); setTimeout(() => b.remove(), 3500);
  }
}

function menu() {
  stopTicker(); g = null;
  const medalRow = MEDALS.map((m) => `<div class="medal ${state.medals[m.id] ? "earned" : ""}"><span class="big-icon" aria-hidden="true">${m.icon}</span>${m.label}<br><small>${m.seconds} seconds</small><br><small>${state.medals[m.id] ? "Earned!" : "Not yet"}</small></div>`).join("");
  app.innerHTML = `
    <h1>Super Sevens</h1>
    <p>Learn the 7 times table, one silly question at a time. Type the answer, ask for a clue when you need one, and chase a medal.</p>
    <h2>Pick a game</h2>
    <div class="grid">
      <button class="big" data-mode="practice">Practice<small>silly questions, clues, and a score</small></button>
      <button class="big alt" data-mode="stopwatch">Stopwatch<small>how long do all 13 take you?${state.bestMs ? ` Best: ${formatTime(state.bestMs)}` : ""}</small></button>
    </div>
    <h2>Beat the clock <span class="tag">medals</span></h2>
    <p class="note">Answer all 13 facts before the time runs out. No clues while the clock runs.</p>
    <div class="medals">${medalRow}</div>
    <div class="grid">${MEDALS.map((m) => `<button class="big go" data-mode="clock" data-medal="${m.id}">${m.icon} ${m.label}<small>${m.seconds} seconds</small></button>`).join("")}</div>
    <h2>Settings</h2>
    <div class="settings"><label><input type="checkbox" id="snd" ${isMuted() ? "" : "checked"}> Sound effects</label></div>
    <button class="link reset" id="wipe">Erase my scores on this device</button>`;
  app.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => start(b.dataset.mode, b.dataset.medal)));
  $("#snd").addEventListener("change", (e) => setMuted(!e.target.checked));
  $("#wipe").addEventListener("click", () => { if (confirm("Erase all scores and medals on this device?")) { wipe(); state = load(); menu(); } });
}

function start(mode, medalId) {
  unlock(); play("pop");
  const medal = MEDALS.find((m) => m.id === medalId) || null;
  g = { mode, medal, queue: newRound(), results: [], tries: 0, usedClue: false, t0: null, ended: false };
  app.innerHTML = `<h1>${mode === "practice" ? "Practice" : mode === "stopwatch" ? "Stopwatch" : `${medal.icon} ${medal.label} challenge`}</h1>
    <p>${mode === "practice" ? "13 questions. A clean first try earns a ⭐. Need a clue? Tap Clue and you get a 💡 instead." :
         mode === "stopwatch" ? "The watch starts when you press Start. Answer all 13 facts. Clues are allowed." :
         `You have <strong>${medal.seconds} seconds</strong> for all 13 facts. Wrong answers just let you try again. Skip sends a question to the end.`}</p>
    <div class="btns"><button class="big go" id="go">Start</button><button class="big off" id="back" style="background:#fff;color:inherit">Back</button></div>`;
  $("#go").addEventListener("click", begin);
  $("#back").addEventListener("click", menu);
  focusMain();
}

function begin() {
  unlock(); play("pop");
  g.t0 = Date.now();
  if (g.mode !== "practice") ticker = setInterval(tick, 100);
  question();
}

const elapsed = () => Date.now() - g.t0;
const remaining = () => g.medal.seconds * 1000 - elapsed();

function tick() {
  const el = $("#clock"); if (!el) return;
  if (g.mode === "clock") {
    const left = remaining();
    if (left <= 0) return finish(false);
    el.textContent = formatTime(left); el.classList.toggle("low", left < 10000);
  } else el.textContent = formatTime(elapsed());
}

function question() {
  const f = g.queue[0]; g.tries = 0; g.usedClue = false;
  const done = g.results.length, total = FACTS.length;
  const clueOk = g.mode !== "clock";
  const clockText = g.mode === "clock" ? formatTime(remaining()) : g.mode === "stopwatch" ? formatTime(elapsed()) : "";
  app.innerHTML = `
    <div class="topbar"><span class="progress">Question ${done + 1} of ${total}</span>
      ${g.mode === "practice" ? `<span class="score">⭐ ${g.results.filter((r) => r === "star").length}</span>` : `<span class="clock" id="clock" role="timer" aria-label="${g.mode === "clock" ? "Time left" : "Time so far"}">${clockText}</span>`}</div>
    <div class="card">
      <p class="story">${esc(f.q)}</p>
      <p class="sum" aria-label="7 times ${f.n}">7 × ${f.n} = ?</p>
      <form class="entry" id="form" autocomplete="off">
        <label class="label" for="ans">Your answer</label>
        <input id="ans" class="num" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="3" enterkeyhint="done" autocomplete="off" autocapitalize="off" spellcheck="false">
        <p class="wrong" id="msg" role="status" aria-live="polite"></p>
        <div class="btns">
          <button class="big go" type="submit">Check</button>
          ${clueOk ? `<button class="big alt" type="button" id="clue">💡 Clue</button>` : ""}
          <button class="big off" type="button" id="skip" style="background:#fff;color:inherit">Skip</button>
        </div>
      </form>
      <div id="hintbox"></div>
    </div>
    <button class="link reset" id="quit">Stop and go back</button>`;
  $("#form").addEventListener("submit", (e) => { e.preventDefault(); submit(); });
  if (clueOk) $("#clue").addEventListener("click", showClue);
  $("#skip").addEventListener("click", skip);
  $("#quit").addEventListener("click", () => { if (g.mode === "practice" || confirm("Stop this run?")) menu(); });
  $("#ans").focus({ preventScroll: true });
}

function showClue() {
  const f = g.queue[0]; g.usedClue = true; play("hint");
  $("#hintbox").innerHTML = `<p class="hint">💡 ${esc(f.clue)}</p>`;
}

function submit() {
  const f = g.queue[0], input = $("#ans"), msg = $("#msg");
  const val = parseAnswer(input.value);
  if (val === null) { msg.textContent = "Type a number, then press Check."; input.focus(); return; }
  if (isCorrect(f, input.value)) {
    play("correct");
    g.results.push(outcomeFor(g)); g.queue.shift();
    if (!g.queue.length) return finish(true);
    return question();
  }
  g.tries++; play("whoops");
  input.value = ""; input.classList.add("wobble"); setTimeout(() => input.classList.remove("wobble"), 600);
  if (g.mode === "clock") { msg.textContent = "Not quite. Try again!"; }
  else if (g.tries >= 2 && !g.usedClue) { msg.textContent = "Not quite. Here is a clue to help!"; showClue(); }
  else msg.textContent = "Not quite. Try again!";
  input.focus();
}

function skip() { play("boing"); g.queue.push(g.queue.shift()); question(); }

function finish(allDone) {
  if (g.ended) return; g.ended = true; stopTicker();
  const ms = elapsed(), stars = g.results.filter((r) => r === "star").length;
  state.plays++;
  let body = "";
  if (g.mode === "practice") {
    play("fanfare"); confetti();
    body = `<div class="celebrate" aria-hidden="true">🎉</div><h1>Round complete!</h1>
      <p class="outcome">⭐ ${stars} of ${FACTS.length} on the first try, no clue.</p>
      <p class="note">⭐ = clean first try. 💡 = needed a clue or a second try. Run it again to turn the 💡 into ⭐.</p>`;
  } else if (g.mode === "stopwatch") {
    const record = !state.bestMs || ms < state.bestMs;
    if (record) state.bestMs = ms;
    play("fanfare"); confetti();
    body = `<div class="celebrate" aria-hidden="true">⏱️</div><h1>${formatTime(ms)}</h1>
      <p class="outcome">${record ? "New best time!" : `Best time so far: ${formatTime(state.bestMs)}`}</p>
      <p class="note">⭐ ${stars} of ${FACTS.length} on the first try, no clue.</p>`;
  } else if (allDone) {
    const won = ms <= g.medal.seconds * 1000;
    if (won) { state.medals[g.medal.id] = true; play("fanfare"); confetti(); }
    body = won
      ? `<div class="celebrate" aria-hidden="true">${g.medal.icon}</div><h1>${g.medal.label} medal!</h1><p class="outcome">All 13 in ${formatTime(ms)}. The limit was ${g.medal.seconds} seconds.</p>`
      : `<h1>So close!</h1><p class="outcome">All 13 done in ${formatTime(ms)}, just past the ${g.medal.seconds} second limit. Try again!</p>`;
  } else {
    play("boing");
    body = `<h1>Time's up!</h1><p class="outcome">You got ${g.results.length} of ${FACTS.length} in ${g.medal.seconds} seconds. Practice the tricky ones and try again.</p>`;
  }
  save(state);
  app.innerHTML = `${body}<div class="btns"><button class="big go" id="again">Play again</button><button class="big off" id="menu" style="background:#fff;color:inherit">Menu</button></div>`;
  const mode = g.mode, medal = g.medal;
  $("#again").addEventListener("click", () => start(mode, medal && medal.id));
  $("#menu").addEventListener("click", menu);
  focusMain();
}

menu();
