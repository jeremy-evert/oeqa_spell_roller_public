// Pure view functions: data in, HTML string out. No DOM access, so tests can prove the answer-hiding rules.
// RULE: while the answer is hidden, none of these strings may contain the target word. Not in text, aria-labels,
// alt text, attributes or class names. Audio file names are built in voice.js and never put in the DOM.
import { WORDS } from "./words.js";
import { sceneSVG, potatoSVG } from "./art.js";
import { OUTCOME, rounds, HAT_STYLES, ACCESSORY_STYLES, POTATO_COLORS, BACKGROUND_THEMES } from "./engine.js";

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const OUTCOME_LABEL = {
  [OUTCOME.INDEPENDENT]: { icon: "⭐", text: "Got it all by yourself!" },
  [OUTCOME.AFTER_RETRY]: { icon: "👍", text: "Got it on a retry" },
  [OUTCOME.AFTER_HINT]: { icon: "💡", text: "Got it with a hint" },
  [OUTCOME.AFTER_REVEAL]: { icon: "📖", text: "Got it after studying" },
  [OUTCOME.ASSISTED]: { icon: "🔎", text: "Practice (the word was showing)" },
  [OUTCOME.SKIPPED]: { icon: "⏭️", text: "Skipped. We will see it again!" },
};
const STATUS_NOTE = { "word-specific": "", "supported general pattern": "" };

export const CHEERS = ["Spelltacular!", "Brain muscles: flexed!", "That was smoother than a banana slide!", "Look at you go!", "Spelling superpowers: activated!"];
export const OOPS = [
  "Professor Potato is still smiling. Let's try again!",
  "Not yet, but you're learning. You've got this!",
  "Close one! Would hearing it again help?",
  "Good try! We'll figure this tricky part out together.",
];

const blankClue = (w) => esc(w.clue).replace(/_{3,}/g, '<span class="blank" aria-label="blank">______</span>');

function dots(progress) {
  return WORDS.map((w, i) => {
    const s = progress.state.words[w.word];
    let icon = "·", label = "not tried yet";
    if (s.last === OUTCOME.INDEPENDENT) { icon = "⭐"; label = "got it by yourself last time"; }
    else if (s.last === OUTCOME.SKIPPED) { icon = "⏭️"; label = "skipped last time"; }
    else if (s.last) { icon = "💡"; label = "needed help last time"; }
    else if (s.studied) { icon = "📖"; label = "studied, not tried from memory"; }
    return `<li class="dot" title="Card ${i + 1}: ${label}"><span aria-hidden="true">${icon}</span><span class="n">${i + 1}</span><span class="sr">Card ${i + 1}: ${label}</span></li>`;
  }).join("");
}

// A compact dress-up closet: each cosmetic is earned with practice, never purchased.
function closetShelf({ title, key, items, selected, points, isOpen }) {
  const current = items.find((item) => item.id === selected) || items[0];
  const cards = items.map((item) => {
    const unlocked = points >= item.unlockAt;
    const wearing = item.id === selected;
    return `<button type="button" class="costume-choice${wearing ? " selected" : ""}"
      data-action="choose-cosmetic" data-key="${key}" data-item="${item.id}"
      aria-pressed="${wearing}" ${unlocked ? "" : "disabled"}>
      <span class="costume-emoji" aria-hidden="true">${item.icon}</span>
      <span>${esc(item.label)}</span>
      <small>${wearing ? "Wearing it!" : unlocked ? "Choose this!" : item.unlockAt + " points to unlock"}</small>
    </button>`;
  }).join("");
  return `<details class="closet-shelf" ${isOpen ? "open" : ""}>
      <summary><strong>${esc(title)}</strong><span class="shelf-selected">Selected: ${esc(current.label)}</span></summary>
      <div class="costume-grid" role="group" aria-label="${esc(title)}">${cards}</div>
    </details>`;
}

export function homeView(progress, settings, voiceReady, openClosetCategory = "hatStyle") {
  const sum = progress.summary();
  const reviewCount = progress.reviewList().length;
  const r = rounds();
  return `
  <section class="home" aria-labelledby="h">
    <div class="hero">${potatoSVG("happy")}<div class="bubble"><h1 id="h">List 15 Flashcards</h1><p>First flip and learn. Then take the spelling quiz!</p></div></div>
    <p class="how">Pick a game. In <b>Listen &amp; Spell</b> the word stays hidden until <i>you</i> type it, so it really trains your brain.</p>
    <h2>Listen &amp; Spell <span class="tag">the scored game</span></h2>
    <div class="grid">
      ${r.map((_, i) => `<button class="big" data-action="start" data-mode="listen" data-round="${i}">Round ${i + 1}<small>cards ${i * 5 + 1} to ${i * 5 + 5}</small></button>`).join("")}
      <button class="big alt" data-action="start" data-mode="listen" data-round="surprise">Surprise 5<small>random mix</small></button>
      <button class="big alt" data-action="start" data-mode="listen" data-round="all">All 20<small>the full marathon (with breaks)</small></button>
    </div>
    <h2>Other ways to play</h2>
    <div class="grid">
      <button class="big" data-action="start" data-mode="flip">Flip &amp; Learn<small>study with pictures, then try from memory</small></button>
      <button class="big" data-action="start" data-mode="review" ${reviewCount ? "" : "disabled"}>Quick Review<small>${reviewCount ? reviewCount + " word" + (reviewCount === 1 ? "" : "s") + " to practice" : "nothing to review yet"}</small></button>
      <button class="big off" disabled aria-describedby="voicenote">Speak &amp; Check<small>unavailable offline</small></button>
    </div>
    <p id="voicenote" class="note">Voice answer checking is unavailable offline. Speaking a word is not the same as spelling it, so typing is how we check.</p>
    <h2>Your progress <span class="tag">saved on this device only</span></h2>
    <p class="count"><b>${sum.independentNow}</b> of 20 words spelled by yourself on the latest try. ${sum.practiced} tried so far.</p>
    <ol class="dots" aria-label="Progress by card">${dots(progress)}</ol>
    <h2>Professor Potato's Dress-Up Closet <span class="tag">just for fun</span></h2>
    <div class="dress-up-preview" aria-label="Your potato avatar">
      <div class="dress-up-potato">${potatoSVG("happy")}</div>
      <div><p><b>Your very own Professor Potato!</b></p>
      <p>Pick a hat, accessory, potato color, and background. Mix everything any way you like.</p>
      <p class="note">Dinosaur costumes, crowns, tiaras, and rainbow colors are for everyone!</p></div>
    </div>
    <p class="points-count"><b>${progress.state.practicePoints}</b> Potato Points earned!
      Earn 2 for spelling a word (even with help), or 1 for studying a new flip card. Mistakes never cost points.
      Items unlock when you've earned enough points, and unlocking never spends them.</p>
    ${closetShelf({title:"Hats & headgear",key:"hatStyle",items:HAT_STYLES,selected:settings.hatStyle,points:progress.state.practicePoints,isOpen:openClosetCategory==="hatStyle"})}
    ${closetShelf({title:"Fun accessories",key:"accessoryStyle",items:ACCESSORY_STYLES,selected:settings.accessoryStyle || "none",points:progress.state.practicePoints,isOpen:openClosetCategory==="accessoryStyle"})}
    ${closetShelf({title:"Potato colors",key:"potatoColor",items:POTATO_COLORS,selected:settings.potatoColor || "classic",points:progress.state.practicePoints,isOpen:openClosetCategory==="potatoColor"})}
    ${closetShelf({title:"Background colors",key:"backgroundTheme",items:BACKGROUND_THEMES,selected:settings.backgroundTheme || "original",points:progress.state.practicePoints,isOpen:openClosetCategory==="backgroundTheme"})}
    <p class="note">All quizzes, hints, and accessibility tools stay available to everyone. Dressing up is optional!</p>
    <h2>Settings</h2>
    <div class="settings">
      <label><input type="checkbox" data-setting="sfx" ${settings.muted ? "" : "checked"}> Sound effects</label>
      <label><input type="checkbox" data-setting="calm" ${settings.reducedMotion ? "checked" : ""}> Calm mode (less wiggling and confetti)</label>
      <label><input type="checkbox" data-setting="accessible" ${settings.accessible ? "checked" : ""}> Accessible mode: show the word on the card (does <b>not</b> count as spelling by yourself)</label>
    </div>
    <p class="note">${voiceReady ? "Narration: local Kokoro voice, no internet needed." : "Kokoro narration is not installed yet. You can still read the clues and use Flip & Learn. No robot voice will play."}</p>
    <div class="reset"><button class="link" data-action="reset-ask">Reset my progress</button><span id="resetbox"></span></div>
  </section>`;
}

/** The Listen & Spell card. `run` is a CardRun. While run.answerVisible is false the word never appears. */
export function cardView({ w, run, index, total, hint, mascotLine, flipMode }) {
  const showWord = run.answerVisible;
  const hintText = hint ? `<p class="hint" role="status">Hint: ${hint.letters} letters, starts with <b>${esc(hint.first.toUpperCase())}</b> <span class="mask" aria-hidden="true">${esc(hint.masked)}</span></p>` : "";
  const study = run.phase === "study" ? `
      <div class="study"><p class="label">Look closely!</p><p class="word">${esc(w.word)}</p>
      <p class="chunks">${w.chunks.map(esc).join(" · ")}</p><p class="notice">${esc(w.notice.text)}</p>
      <button class="big" data-action="try-memory">Now try it from memory</button></div>` : "";
  const entry = run.phase === "recall" ? `
      <form class="entry" data-action="submit" autocomplete="off">
        <label for="ans" class="label">Type the spelling:</label>
        <input id="ans" name="ans" type="text" inputmode="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" maxlength="30">
        <div class="btns"><button class="big go" type="submit">Check it!</button>
        <button type="button" class="btn" data-action="hint">💡 Hint</button>
        <button type="button" class="btn" data-action="study">📖 Show / Study</button>
        <button type="button" class="btn" data-action="skip">⏭️ Skip</button></div>
      </form>` : "";
  return `
  <section class="card" aria-labelledby="ch">
    <div class="topbar"><button class="btn" data-action="home">← Menu</button><span class="progress" id="ch">Card ${index + 1} of ${total}</span></div>
    <div class="split"><div class="art">${sceneSVG(w.art, w.alt)}</div><div class="side">
    <div class="listen">
      <button class="btn say" data-action="say" data-kind="word">🔊 Hear it</button>
      <button class="btn say" data-action="say" data-kind="slow">🐢 Slowly</button>
      <button class="btn say" data-action="say" data-kind="sentence">😂 Silly sentence</button>
    </div>
    <p class="clue">${blankClue(w)}</p>
    ${showWord && run.accessible ? `<p class="acc">Accessible mode: the word is <b>${esc(w.word)}</b>. This will not count as spelling by yourself.</p>` : ""}
    ${hintText}
    ${entry}
    ${study}
    <div class="mascot" aria-live="polite">${potatoSVG(run.lastFeedback && !run.lastFeedback.correct ? "oops" : "think")}<div class="bubble" id="fb">${esc(mascotLine || "Listen, then type what you hear!")}</div></div>
    </div></div>
  </section>`;
}

/** Shown after a card is finished. The word is allowed here: the attempt is already made. */
export function resultView({ w, run, index, total, cheer, last }) {
  const o = OUTCOME_LABEL[run.outcome];
  const joke = esc(w.sentence).replace(new RegExp(esc(w.word), "i"), (m) => `<mark>${m}</mark>`);
  const skipped = run.outcome === OUTCOME.SKIPPED;
  return `
  <section class="card result" aria-labelledby="rh">
    <div class="topbar"><button class="btn" data-action="home">← Menu</button><span class="progress">Card ${index + 1} of ${total}</span></div>
    <div class="split"><div class="art">${sceneSVG(w.art, w.alt)}</div><div class="side">
    <h2 id="rh">${skipped ? "No problem!" : esc(cheer)}</h2>
    <p class="word big-word">${esc(w.word)}</p>
    <p class="chunks">${w.chunks.map(esc).join(" · ")}</p>
    <p class="outcome"><span aria-hidden="true">${o.icon}</span> ${o.text}</p>
    <p class="joke">${joke}</p>
    <p class="notice">${esc(w.notice.text)}</p>
    <div class="mascot">${potatoSVG(skipped ? "think" : "cheer")}<div class="bubble">${skipped ? "We will bring it back later." : "That word is in your brain now."}</div></div>
    <div class="btns"><button class="btn say" data-action="say-result" data-kind="sentence">😂 Hear it again</button>
    <button class="big go" data-action="next">${last ? "Finish round" : "Next card →"}</button></div>
    </div></div>
  </section>`;
}

/** Flip & Learn front: picture and clue only, word hidden. */
export function flipFrontView({ w, index, total }) {
  return `
  <section class="card" aria-labelledby="ch">
    <div class="topbar"><button class="btn" data-action="home">← Menu</button><span class="progress" id="ch">Flip card ${index + 1} of ${total}</span></div>
    <div class="split"><div class="art">${sceneSVG(w.art, w.alt)}</div><div class="side">
    <div class="listen"><button class="btn say" data-action="say" data-kind="word">🔊 Hear it</button><button class="btn say" data-action="say" data-kind="sentence">😂 Silly sentence</button></div>
    <p class="clue">${blankClue(w)}</p>
    <div class="btns"><button class="big go" data-action="flip">🔄 Flip the card</button><button class="btn" data-action="next">Skip to next</button></div>
    <p class="note">Flipping shows the spelling, so it counts as <b>studying</b>. To prove you know it, use "Try from memory".</p>
    </div></div>
  </section>`;
}
export function flipBackView({ w, index, total }) {
  return `
  <section class="card back" aria-labelledby="ch">
    <div class="topbar"><button class="btn" data-action="home">← Menu</button><span class="progress" id="ch">Flip card ${index + 1} of ${total}</span></div>
    <p class="label">Studying</p><p class="word big-word">${esc(w.word)}</p>
    <p class="chunks">${w.chunks.map(esc).join(" · ")}</p>
    <p class="notice">${esc(w.notice.text)}</p>
    <p class="joke">${esc(w.sentence)}</p>
    <div class="art small">${sceneSVG(w.art, w.alt)}</div>
    <div class="btns"><button class="btn say" data-action="say" data-kind="slow">🐢 Slowly</button>
    <button class="big go" data-action="try-memory">✍️ Try from memory</button>
    <button class="btn" data-action="next">Next card →</button></div>
  </section>`;
}

export function breakView({ rows, kindLabel, hasMore, nextCard, totalCards, trickyCount = 0, stats, overall }) {
  const perfect = stats.independent === rows.length;
  return `
  <section class="break" aria-labelledby="bh">
    <div class="hero">${potatoSVG("cheer")}<div class="bubble">
      <h2 id="bh">${perfect ? "Perfect five!" : esc(kindLabel) + " done!"}</h2>
      <p>${stats.independent} of ${rows.length} spelled all by yourself. ${perfect ? "Wonderful work!" : "Every try helps your brain learn."}</p>
      ${overall ? `<p><b>Whole game: ${overall.independent} of ${overall.total} spelled independently.</b></p>` : ""}
      ${hasMore ? `<p><b>${nextCard - 1} of ${totalCards} complete.</b> Your game is not over yet!</p>` : "<p>You finished this set. Great work!</p>"}
    </div></div>
    <ul class="results">${rows.map((r) => `<li><span aria-hidden="true">${OUTCOME_LABEL[r.outcome].icon}</span> <b>${esc(r.word)}</b> <span class="muted">${OUTCOME_LABEL[r.outcome].text}</span></li>`).join("")}</ul>
    <div class="break-action">
    ${hasMore
      ? `<button class="big go continue-main" data-action="continue">Continue to card ${nextCard} of ${totalCards} →<small>Keep going in your game</small></button>`
      : `<button class="big go continue-main" data-action="play-another-five">Continue practicing →<small>Play another five words</small></button>`}
    </div>
    ${!hasMore && trickyCount ? `<div class="btns"><button class="btn" data-action="start-review">Practice ${trickyCount} tricky ${trickyCount === 1 ? "word" : "words"}</button></div>` : ""}
    ${!hasMore && !trickyCount ? '<p class="no-tricky">No tricky words to review. You are ready for another round!</p>' : ""}
    <div class="break-exit"><button class="link" data-action="home">Leave game · Back to menu</button></div>
  </section>`;
}

export function emptyReviewView() {
  return `<section class="break"><div class="hero">${potatoSVG("happy")}<div class="bubble"><h2>Nothing to review!</h2><p>Play some Listen &amp; Spell first. Missed and skipped words show up here.</p></div></div><div class="btns"><button class="big go" data-action="home">Back to menu</button></div></section>`;
}
