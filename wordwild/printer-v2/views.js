// Pure view functions: data in, HTML string out. No DOM access, so tests can prove what is on screen.
// RULE: while a word is in "recall" (answer hidden) NOTHING built here may contain the target word.
import { ladder } from "./engine.js";
import { PREVIEWS } from "./content.js";
import { BLUEPRINTS } from "./printer.js";

export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const btn = (act, label, cls = "", extra = "") => `<button type="button" class="btn ${cls}" data-act="${act}" ${extra}>${label}</button>`;

export function audioRow(narrationAvailable, { sentence = false } = {}) {
  return `<div class="audio-row" role="group" aria-label="Sound">` +
    btn("play-word", "🔊 Play word", "audio") + btn("play-slow", "🐢 Say it slowly", "audio") +
    (sentence ? btn("play-sentence", narrationAvailable ? "📖 Read the sentence" : "📖 Read the sentence (no voice yet)", "audio", narrationAvailable ? "" : 'aria-describedby="novoice"') : "") +
    btn("stop-sound", "⏹ Stop", "audio subtle") + `</div>` +
    (sentence && !narrationAvailable ? `<p id="novoice" class="note">This funny sentence has no voice recording yet. You can read it yourself.</p>` : "");
}

export function homeView({ players, active, blueprintId, reviewCount, practiced, independentNow, status, dev }) {
  const bps = BLUEPRINTS.map((b) => `<label class="bp ${b.id === blueprintId ? "on" : ""}"><input type="radio" name="bp" value="${b.id}" ${b.id === blueprintId ? "checked" : ""} data-act="pick-bp">` +
    `<span class="bp-name">${esc(b.name)}</span><span class="bp-blurb">${esc(b.blurb)}</span></label>`).join("");
  return `<section aria-labelledby="h-home"><h2 id="h-home">What shall the printer build?</h2>
    <fieldset class="bps"><legend class="sr">Choose a blueprint</legend>${bps}</fieldset>
    <h3>Pick five words</h3>
    <div class="modes">
      ${[1, 2, 3, 4].map((n) => btn("start-round", `Round ${n}<small>words ${(n - 1) * 5 + 1} to ${n * 5}</small>`, "mode", `data-round="${n - 1}"`)).join("")}
      ${btn("start-surprise", "Surprise me<small>five random words</small>", "mode")}
      ${btn("start-review", `Tricky words<small>${reviewCount ? reviewCount + " to practice again" : "nothing to review yet"}</small>`, "mode", reviewCount ? "" : "disabled")}
    </div>
    <p class="muted">You have practiced ${practiced} of 20 words. ${independentNow} you last spelled all by yourself.</p>
    ${status !== "ok" ? `<p class="note" role="status">${status === "memory-only" ? "Your progress cannot be saved in this browser right now, but you can still play." : "Old saved progress could not be read, so we started a fresh page."}</p>` : ""}
  </section>`;
}

/** The mystery card shown while the answer is hidden. `texts` holds whatever help the child has opened. */
export function recallView({ run, position, total, helpOpen, texts, feedback, sentenceAvailable = false }) {
  const e = run.entry;
  const steps = ladder(e);
  const helpItems = steps.map((s) => {
    const tag = s.kind === "letters" ? `<span class="tag">shows some letters</span>` : s.kind === "reveal" ? `<span class="tag warn">shows the word</span>` : "";
    return `<li>${btn("help-step", `${esc(s.label)} ${tag}`, `help-item ${s.kind}`, `data-step="${s.id}"`)}</li>`;
  }).join("");
  const shown = [
    texts.clue2 && `<div class="reveal-note"><strong>A different clue:</strong> ${esc(texts.clue2)}</div>`,
    texts.say_note && `<div class="reveal-note"><strong>How to say it:</strong> ${esc(texts.say_note)}</div>`,
    texts.pattern && `<div class="reveal-note"><strong>What to look for:</strong> ${esc(texts.pattern)}</div>`,
    texts.partial && `<div class="reveal-note"><strong>Some of the letters:</strong> <span class="mono">${esc(texts.partial)}</span></div>`,
  ].filter(Boolean).join("");
  return `<section class="card" aria-labelledby="h-word">
    <p class="progress-line">Word ${position} of ${total}</p>
    <h2 id="h-word" class="sr">Spell the mystery word</h2>
    <div class="mystery" role="img" aria-label="A mystery word. Listen to it and read the clue."><span aria-hidden="true">?</span></div>
    <p class="clue" id="clue">${esc(e.clues.primary)}</p>
    ${audioRow(sentenceAvailable, { sentence: true })}
    <form class="spell" data-form="spell" autocomplete="off">
      <label for="answer" class="sr">Type your spelling</label>
      <input id="answer" name="answer" type="text" inputmode="text" enterkeyhint="done" spellcheck="false" autocorrect="off" autocapitalize="off" autocomplete="off" maxlength="30" aria-describedby="fb clue" placeholder="Type the word here">
      ${btn("submit", "Check it", "primary", 'type="submit"')}
    </form>
    <div id="fb" class="feedback" role="status" aria-live="polite">${feedback ? esc(feedback.message || "") : ""}</div>
    ${feedback?.nudge ? `<p class="nudge">Stuck? That is okay. Press <strong>HELP ME</strong>. It is what it is for.</p>` : ""}
    <button type="button" class="btn help-me" data-act="toggle-help" aria-expanded="${helpOpen}" aria-controls="help-panel">🆘 HELP ME</button>
    <div id="help-panel" class="help-panel" ${helpOpen ? "" : "hidden"}>
      <h3>Help steps</h3><p class="muted">Start at the top. Using help is fine. We just remember which help you used.</p>
      <ol class="ladder">${helpItems}</ol>
      ${shown}
      ${btn("skip", "Skip this word for now", "subtle")}
    </div>
  </section>`;
}

/** Letter tiles for the study/result view with the target letters lit. Only shown once the word may be seen. */
export function tilesView(entry, targetRefs, pulse) {
  const word = entry.word, lit = new Set();
  for (const r of targetRefs) { const t = entry.spellingTargets[r]; if (t) for (let i = 0; i < t.letters.length; i++) lit.add(t.zeroBasedStart + i); }
  return `<div class="tiles ${pulse ? "pulse" : ""}" aria-label="The word, with the letters to remember lit up">` +
    [...word].map((c, i) => `<span class="tile ${lit.has(i) ? "lit" : ""}">${esc(c)}</span>`).join("") + `</div>`;
}

export function jokeView({ entry, jokeIndex, pulse, reactions, narrationAvailable, dev, mini, showMini }) {
  const j = entry.jokes[jokeIndex];
  const seg = entry.jokes.map((_, i) => btn("pick-joke", `Trick ${"ABC"[i]}`, i === jokeIndex ? "seg on" : "seg", `data-joke="${i}" aria-pressed="${i === jokeIndex}"`)).join("");
  const r = reactions[j.id] || {};
  return `<div class="joke" aria-live="polite">
    <div class="seg-row" role="group" aria-label="Choose a funny memory trick">${seg}</div>
    ${PREVIEWS[j.id] ? `<p class="preview">${esc(PREVIEWS[j.id])}</p>` : ""}
    <blockquote class="sentence">${esc(j.narration)}</blockquote>
    ${audioRow(narrationAvailable, { sentence: true })}
    ${tilesView(entry, j.targetRefs, pulse)}
    <p class="cue"><strong>Remember:</strong> ${esc(j.spellingCue)}</p>
    <div class="art-todo" role="img" aria-label="${esc(j.accessibleDescription)}">${esc(j.artPlaceholder)}</div>
    <p class="muted"><strong>Tap payoff idea:</strong> ${esc(j.tapAction)}</p>
    ${btn("do-tap", "✨ Do the tap!", "primary")}
    <div class="reactions" role="group" aria-label="What did you think?">
      ${btn("react-funny", "👍 Funny!", "react", `aria-pressed="${!!r.funny}"`)}
      ${btn("react-helped", "👍 Helped me remember!", "react", `aria-pressed="${!!r.helped}"`)}
    </div>
    ${showMini ? miniView(entry, mini) : btn("show-mini", "Quick check", "subtle")}
    ${dev ? `<p class="dev">dev: ${esc(j.id)} · ${esc(j.mode)} · ${esc(j.claimType)}</p>` : ""}
  </div>`;
}

export function miniView(entry, mini) {
  const m = entry.miniCheck;
  return `<div class="mini" role="group" aria-labelledby="mq"><p id="mq"><strong>Quick check:</strong> ${esc(m.question)}</p>` +
    m.options.map((o, i) => btn("mini", esc(o), "opt", `data-i="${i}" ${mini?.answered ? "disabled" : ""}`)).join("") +
    (mini?.answered ? `<p class="feedback" role="status">${esc(mini.feedback)}</p>` : "") +
    `<p class="muted">This is practice with help. It does not count as spelling it yourself.</p></div>`;
}

export function studyView({ run, position, total, ...ctx }) {
  return `<section class="card" aria-labelledby="h-study"><p class="progress-line">Word ${position} of ${total}</p>
    <h2 id="h-study">Here is a funny way to remember it</h2>
    ${jokeView({ entry: run.entry, ...ctx })}
    ${btn("hide-and-try", "🙈 Hide it and spell it myself", "primary big")}
  </section>`;
}

const OUTCOME_TEXT = {
  independent: "You spelled it all by yourself! ★",
  after_retry: "Got it on another try. Nice sticking with it!",
  assisted: "You got it with some help. That is exactly what help is for.",
  after_reveal: "You looked, hid it, and spelled it. That is real practice!",
  skipped: "Skipped for now. It will be waiting in Tricky words.",
};
export function resultView({ run, position, total, last, ...ctx }) {
  const done = run.outcome;
  return `<section class="card" aria-labelledby="h-res"><p class="progress-line">Word ${position} of ${total}</p>
    <h2 id="h-res">${done === "skipped" ? "Skipped for now" : "The word was <span class=\"answer\">" + esc(run.word) + "</span>"}</h2>
    <p class="outcome" role="status">${OUTCOME_TEXT[done] ?? ""}</p>
    ${jokeView({ entry: run.entry, ...ctx })}
    ${btn("next", last ? "Finish this round ➜" : "Next word ➜", "primary big")}
  </section>`;
}

export function roundDoneView({ build, session, nextRound, reviewCount, stars }) {
  return `<section class="card" aria-labelledby="h-done"><h2 id="h-done">Your ${esc(build.bp.name)} is built!</h2>
    <p>${session.independentCount} of ${session.results.length} spelled all by yourself${stars ? ` (${stars} ★)` : ""}. Great work. Take a break any time.</p>
    <div class="modes">
      ${nextRound !== null ? btn("start-round", "Another round", "mode primary", `data-round="${nextRound}"`) : ""}
      ${btn("start-surprise", "Surprise round", "mode")}
      ${reviewCount ? btn("start-review", `Tricky words (${reviewCount})`, "mode") : ""}
      ${btn("go-home", "Pick a different printer", "mode")}
    </div></section>`;
}
