// Controller: wires the pure modules to the page. All scoring decisions live in engine.js / shared/local_progress.js.
import { loadContent, wordList, byWord } from "./content.js";
import { WordRun, Session, AID, ladder, rounds, shuffled, ROUND_SIZE } from "./engine.js";
import { PrinterBuild, blueprintById, stageMarkup, BLUEPRINTS } from "./printer.js";
import { Narrator, play as sfx, unlock, setSfxMuted, sfxStats } from "./audio.js";
import * as V from "./views.js";
import { SharedProgress } from "../shared/local_progress.js";

const GAME = "printer-v2";
const SETTINGS_KEY = "wordwild.printer2.v1";
const $ = (s) => document.querySelector(s);
const dev = new URLSearchParams(location.search).get("dev") === "1";

const loadSettings = () => { try { return { muted: false, calm: false, bp: "robot", ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") }; } catch { return { muted: false, calm: false, bp: "robot" }; } };
const saveSettings = () => { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* storage may be blocked */ } };
const settings = loadSettings();
const reduceMotion = () => settings.calm || globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

let doc, words, progress, narrator;
const S = { screen: "home", session: null, run: null, build: null, helpOpen: false, texts: {}, feedback: null, jokeIndex: 0, pulse: false,
            reactions: {}, mini: null, showMini: false, printing: false, printTimer: null };

// ---- rendering --------------------------------------------------------------------------------------------
function narrationFor(entry, i) { return narrator.has("narration", entry.jokes[i].id); }
function jokeCtx() {
  const e = S.run.entry;
  return { entry: e, jokeIndex: S.jokeIndex, pulse: S.pulse, reactions: S.reactions, narrationAvailable: narrationFor(e, S.jokeIndex), dev, mini: S.mini, showMini: S.showMini };
}
function render(focusSel) {
  const card = $("#card"), typed = card.querySelector("#answer")?.value ?? "";
  const pos = S.session ? S.session.index + 1 : 0, total = S.session ? S.session.words.length : 0;
  let html = "";
  if (S.screen === "home") {
    const active = progress.activePlayer();
    html = V.homeView({ players: progress.players(), active, blueprintId: settings.bp, reviewCount: progress.reviewList(words).length,
      practiced: progress.summary(words).practiced, independentNow: progress.summary(words).independentNow, status: progress.state, dev });
  } else if (S.screen === "play") {
    const run = S.run;
    if (run.done) html = V.resultView({ run, position: pos, total, last: S.session.index + 1 >= S.session.words.length, ...jokeCtx() });
    else if (run.phase === "study") html = V.studyView({ run, position: pos, total, ...jokeCtx() });
    else html = V.recallView({ run, position: pos, total, helpOpen: S.helpOpen, texts: S.texts, feedback: S.feedback, sentenceAvailable: narrator.has("sentence", run.word) });
  } else if (S.screen === "done") {
    const cur = S.session.mode.startsWith("round") ? Number(S.session.mode.slice(5)) : -1;
    html = V.roundDoneView({ build: S.build, session: S.session, stars: S.build.stars, reviewCount: progress.reviewList(words).length,
      nextRound: cur >= 0 && cur + 1 < rounds(words).length ? cur + 1 : null });
  }
  card.innerHTML = html;
  const input = card.querySelector("#answer"); if (input && typed) input.value = typed;
  $("#stage-wrap").hidden = S.screen === "home";
  document.body.dataset.screen = S.screen;
  if (focusSel) card.querySelector(focusSel)?.focus({ preventScroll: false });
}

function renderStage(animateIndex = -1) {
  const b = S.build; if (!b) return;
  $("#layers").innerHTML = stageMarkup(b.bp, b.printed, animateIndex);
  $("#layer-count").textContent = `Layer ${Math.min(b.count, b.bp.parts.length)} of ${b.bp.parts.length}`;
  $("#printer").dataset.printing = animateIndex >= 0 ? "true" : "false";
  $("#printer").setAttribute("aria-label", `${b.bp.name} printer, ${b.count} of ${b.bp.parts.length} parts built`);
  const p = b.bp.parts[Math.max(animateIndex, 0)];
  $("#nozzle").style.setProperty("--n-from", p.bottom + "%"); $("#nozzle").style.setProperty("--n-to", p.top + "%");
}

function printPart(entry) {
  clearTimeout(S.printTimer);
  const index = entry.index;
  if (reduceMotion()) { renderStage(-1); sfx("clunk"); return; }
  S.printing = true; renderStage(index); sfx("print");
  const finish = () => { if (!S.printing) return; S.printing = false; clearTimeout(S.printTimer); $("#skip-anim").hidden = true; renderStage(-1); sfx("clunk"); };
  S.printTimer = setTimeout(finish, 1700);
  $("#skip-anim").hidden = false;
  S.finishPrint = finish;
}

// ---- flow -------------------------------------------------------------------------------------------------
function startSession(mode, list) {
  if (!list.length) return;
  S.session = new Session(list, mode); S.build = new PrinterBuild(settings.bp); S.printing = false; $("#skip-anim").hidden = true;
  S.screen = "play"; renderStage(-1); nextWord();
}
function nextWord() {
  if (S.session.finished) { S.screen = "done"; sfx("fanfare"); render("h2"); return; }
  S.run = new WordRun(byWord(doc, S.session.current));
  Object.assign(S, { helpOpen: false, texts: {}, feedback: null, jokeIndex: 0, pulse: false, reactions: {}, mini: null, showMini: false });
  render("#answer");
}
function finishWord() {
  const run = S.run;
  const r = progress.record(run.toEvent(GAME));
  if (!r.ok) console.warn("progress rejected an event:", r.reason);
  S.session.complete(run.outcome);
  const entry = S.build.next(run.outcome);
  S.jokeIndex = 0; S.helpOpen = false;
  render("h2"); if (entry) printPart(entry);
  sfx(run.outcome === "skipped" ? "boing" : "correct");
}
function react(kind) {
  const j = S.run.entry.jokes[S.jokeIndex], slot = S.reactions[j.id] ||= {};
  if (slot[kind]) return;
  slot[kind] = true;
  progress.record({ type: kind === "funny" ? "joke_reaction" : "joke_memory_feedback", game: GAME, word: S.run.word, jokeId: j.id });
  sfx("thumb"); render();
}

// ---- events -----------------------------------------------------------------------------------------------
function onAct(act, el) {
  unlock();
  const run = S.run;
  switch (act) {
    case "pick-bp": settings.bp = el.value; saveSettings(); document.querySelectorAll(".bp").forEach((l) => l.classList.toggle("on", l.contains(el))); sfx("pop"); return;
    case "start-round": return startSession("round" + el.dataset.round, rounds(words)[Number(el.dataset.round)]);
    case "start-surprise": return startSession("surprise", shuffled(words).slice(0, ROUND_SIZE));
    case "start-review": return startSession("review", progress.reviewList(words).slice(0, ROUND_SIZE));
    case "go-home": narrator.stop(); S.screen = "home"; S.session = null; render("h2"); return;
    case "play-word": case "play-slow": {
      const slow = act === "play-slow"; if (run && !run.done) run.useAid(slow ? AID.SLOW : AID.LISTEN);
      narrator.play(slow ? "slow" : "word", run.word).then((r) => { if (r === "missing") say("No voice clip for this word, but you can still play with the clue."); });
      return;
    }
    case "play-sentence": {
      // Before spelling, play the original Flashcards' context sentence. It says
      // the word naturally but never tells the child its letters or shows text.
      // This is listening, so a correct first spelling remains independent.
      if (!run.done && run.phase === "recall") {
        run.useAid(AID.LISTEN);
        narrator.play("sentence", run.word).then((r) => { if (r === "missing") say("The sentence recording is unavailable. You can still play the word."); });
      } else {
        // Once the child has studied or completed the word, play the funny
        // spelling-memory story, which may intentionally reveal letter clues.
        const j = run.entry.jokes[S.jokeIndex];
        narrator.play("narration", j.id).then((r) => { if (r === "missing") say("This sentence has no voice recording yet."); });
      }
      return;
    }
    case "stop-sound": narrator.stop(); return;
    case "toggle-help": S.helpOpen = !S.helpOpen; sfx("pop"); render(S.helpOpen ? "#help-panel button" : "#answer"); return;
    case "help-step": {
      const step = ladder(run.entry).find((s) => s.id === el.dataset.step); if (!step) return;
      if (step.aid === AID.LISTEN || step.aid === AID.SLOW) return onAct(step.aid === AID.LISTEN ? "play-word" : "play-slow", el);
      if (step.aid === AID.JOKE) { S.jokeIndex = step.joke; run.openJoke(step.joke); sfx("hint"); render("h2"); return; }
      if (step.aid === AID.REVEAL) { run.reveal(); S.jokeIndex = 0; sfx("hint"); render("h2"); return; }
      const out = run.useAid(step.aid); S.texts[step.id] = out.text; sfx("hint"); render("#help-panel .reveal-note"); return;
    }
    case "skip": run.skip(); return finishWord();
    case "hide-and-try": run.tryFromMemory(); S.feedback = { message: "Now spell it from memory. Take your time." }; S.helpOpen = false; sfx("pop"); render("#answer"); return;
    case "pick-joke": S.jokeIndex = Number(el.dataset.joke); S.pulse = false; sfx("pop"); render(); return;
    case "do-tap": S.pulse = false; render(); requestAnimationFrame(() => { S.pulse = true; render(); }); sfx("boing"); return;
    case "react-funny": return react("funny");
    case "react-helped": return react("helped");
    case "show-mini": S.showMini = true; render(); return;
    case "mini": {
      const res = run.answerMini(Number(el.dataset.i)); S.mini = { answered: true, ...res };
      progress.record({ type: "mini_check", game: GAME, word: run.word, correct: res.correct }); sfx(res.correct ? "correct" : "hint"); render(); return;
    }
    case "next": narrator.stop(); nextWord(); return;
  }
}
function say(msg) { S.feedback = { message: msg }; const fb = $("#fb"); if (fb) fb.textContent = msg; }

function onSubmit(ev) {
  ev.preventDefault(); unlock();
  const run = S.run, value = ev.target.querySelector("#answer").value;
  const res = run.submit(value);
  if (res.ignored) { S.feedback = { message: res.message }; return render("#answer"); }
  if (res.empty) { S.feedback = res; return render("#answer"); }
  if (res.correct) return finishWord();
  S.feedback = res; sfx("whoops");
  if (S.build) { const pr = $("#printer"); pr.classList.remove("sputter"); void pr.offsetWidth; if (!reduceMotion()) { pr.classList.add("sputter"); sfx("sputter"); } }
  render("#answer"); const inp = $("#answer"); if (inp) { inp.value = value; inp.select(); }
}

function setMuted(v) {
  settings.muted = v; saveSettings(); narrator.setMuted(v); setSfxMuted(v);
  const b = $("#mute"); b.setAttribute("aria-pressed", String(v)); b.textContent = v ? "🔇 Sound off" : "🔊 Sound on";
}

async function boot() {
  try { doc = await loadContent(); } catch (e) { $("#card").innerHTML = `<p class="note" role="alert">Could not load the words: ${V.esc(e.message)}. Start the game from a local web server (see README).</p>`; return; }
  words = wordList(doc);
  progress = new SharedProgress({ words });
  narrator = new Narrator(); await narrator.load();
  setMuted(settings.muted);
  document.addEventListener("click", (ev) => {
    const el = ev.target.closest("[data-act]"); if (!el || el.disabled) return;
    onAct(el.dataset.act, el);
  });
  document.addEventListener("change", (ev) => { const el = ev.target.closest('[data-act="pick-bp"]'); if (el) onAct("pick-bp", el); });
  document.addEventListener("submit", (ev) => { if (ev.target.matches("[data-form=spell]")) onSubmit(ev); });
  $("#mute").addEventListener("click", () => setMuted(!settings.muted));
  $("#stop").addEventListener("click", () => narrator.stop());
  $("#calm").addEventListener("click", () => { settings.calm = !settings.calm; saveSettings(); $("#calm").setAttribute("aria-pressed", String(settings.calm)); });
  $("#calm").setAttribute("aria-pressed", String(settings.calm));
  $("#skip-anim").addEventListener("click", () => S.finishPrint?.());
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && S.helpOpen && S.screen === "play" && !S.run.done) { S.helpOpen = false; render("#answer"); } });
  window.__printer2 = { sfx: sfxStats, narrator, S, progress, get settings() { return settings; } };
  render("h2");
}
boot();
