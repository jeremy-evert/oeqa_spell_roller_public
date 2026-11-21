// Pure view functions: data in, HTML string out. No DOM access, so tests can prove the answer-hiding rules.
// RULE: while the answer is hidden, none of these strings may contain the target word. Not in text, aria-labels,
// alt text, attributes or class names. Audio file names are built in voice.js and never put in the DOM.
import { WORDS } from "./words.js";
import { sceneSVG, potatoSVG } from "./art.js";
import { OUTCOME, rounds, HAT_STYLES, ACCESSORY_STYLES, POTATO_COLORS, BACKGROUND_THEMES, SHOP_GROUPS, itemPrice } from "./engine.js";

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

export const letterCount = (word) => [...word].filter(ch => /[a-z]/i.test(ch)).length;
const blankClue = (w) => esc(w.clue).replace(/_{3,}/g, () => {
  const count = letterCount(w.word);
  return '<span class="blank" aria-label="' + count + ' letters">' + '_'.repeat(count) + '</span>';
});

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


function selectionCatalog(progress, key) {
  const items = ({hatStyle:HAT_STYLES,accessoryStyle:ACCESSORY_STYLES,potatoColor:POTATO_COLORS,backgroundTheme:BACKGROUND_THEMES})[key];
  return items.filter(item => progress.isOwned(key,item.id));
}
const shopGroup = (progress, key, label, items, month) => {
  const cards = items.map(item => {
    const owned = progress.isOwned(key,item.id);
    const price = itemPrice(item,month);
    const affordable = progress.state.pointBalance >= price;
    const season = Array.isArray(item.seasonMonths) && item.seasonMonths.includes(month);
    const preview = key === "backgroundTheme"
      ? `<div class="theme-swatch theme-swatch-${item.id}"></div>`
      : potatoSVG("happy", {
          hatStyle:key === "hatStyle" ? item.id : "classic",
          accessoryStyle:key === "accessoryStyle" ? item.id : "none",
          potatoColor:key === "potatoColor" ? item.id : "classic",
        });
    return `<article class="shop-card${owned ? ' already-owned' : ''}">
      <div class="shop-avatar-preview" aria-hidden="true">${preview}</div>
      <h4>${esc(item.label)}</h4>
      ${season ? '<small class="season-label">In-season special</small>' : ''}
      <p class="shop-price">${price ? price + ' points' : 'Free'}</p>
      ${owned
        ? '<span class="ownership">✓ Owned · Find it in Locker</span>'
        : `<button class="btn shop-buy" type="button" data-action="buy" data-key="${key}" data-item="${item.id}" ${affordable ? '' : 'disabled'}>${affordable ? 'Buy for ' + price + ' points' : 'Need ' + (price - progress.state.pointBalance) + ' more points'}</button>`}
    </article>`;
  }).join("");
  return `<section class="shop-group"><h3>${esc(label)}</h3><div class="shop-grid">${cards}</div></section>`;
};

export function homeView(progress, settings, voiceReady) {
  const sum = progress.summary();
  const reviewCount = progress.reviewList().length;
  return `<section class="home" aria-labelledby="h">
    <div class="hero">${potatoSVG("happy")}<div class="bubble"><h1 id="h">List 15 Menu</h1>
      <p>First flip and learn. Then take the spelling quiz!</p>
      <p><button class="link" data-action="nav" data-page="shop">🛒 Visit the Potato Shop</button>
      <button class="link" data-action="nav" data-page="locker">👑 Dress up in the Locker</button></p>
    </div></div>
    <p>Earn Potato Points by practicing. Use the top tabs to visit the Shop, Locker, or Profile.</p>
    <h2>Listen &amp; Spell <span class="tag">the scored game</span></h2>
    <div class="grid">
      ${rounds().map((_,i)=>`<button class="big" data-action="start" data-mode="listen" data-round="${i}">Round ${i+1}<small>cards ${i*5+1} to ${i*5+5}</small></button>`).join("")}
      <button class="big alt" data-action="start" data-mode="listen" data-round="surprise">Surprise 5<small>random mix</small></button>
      <button class="big alt" data-action="start" data-mode="listen" data-round="all">All 20<small>the full marathon, with breaks!</small></button>
    </div>
    <h2>Other ways to play</h2>
    <div class="grid">
      <button class="big" data-action="start" data-mode="flip">Flip &amp; Learn<small>illustrated cards, then spell from memory</small></button>
      <button class="big" data-action="start" data-mode="review" ${reviewCount ? "" : "disabled"}>Quick Review<small>${reviewCount ? reviewCount + " tricky word(s)" : "Nothing tricky right now!"}</small></button>
      <button class="big off" disabled>Speak &amp; Check<small>unavailable offline</small></button>
    </div>
    <p class="count"><b>${sum.independentNow}</b> of 20 words spelled independently on the latest try. ${sum.practiced} tried so far.</p>
    <p class="note">${voiceReady ? 'Narration: original Kokoro voice.' : 'Kokoro narration unavailable. The spelling game still works without audio.'}</p>
  </section>`;
}

export function shopView(progress, month = new Date().getMonth()+1, feedback = "") {
  const hats = HAT_STYLES.filter(item => !item.seasonMonths);
  const seasonal = HAT_STYLES.filter(item => item.seasonMonths);
  const groups = ["Standard graduation caps","Gold, silver and rainbow caps","Costume hats and hoods"];
  const headgear = groups.map(group => shopGroup(progress,"hatStyle",group,hats.filter(item => item.group===group),month)).join("");
  const other = [
    shopGroup(progress,"accessoryStyle","Accessories",ACCESSORY_STYLES,month),
    shopGroup(progress,"potatoColor","Potato colors",POTATO_COLORS,month),
    shopGroup(progress,"backgroundTheme","Background colors",BACKGROUND_THEMES,month),
  ].join("");
  return `<section class="shop-page" aria-labelledby="shop-heading">
    <h1 id="shop-heading">🛍️ Potato Shop</h1>
    <p class="shop-wallet"><strong>${progress.state.pointBalance} Potato Points</strong> available to spend · ${progress.state.practicePoints} earned in total</p>
    <p>Buy something once, keep it forever! You can wear it later in your <button class="link" data-action="nav" data-page="locker">Locker</button>.</p>
    ${feedback ? `<p class="shop-feedback" role="status">${esc(feedback)}</p>` : ""}
    ${headgear}
    ${other}
    ${shopGroup(progress,"hatStyle","Seasonal celebrations",seasonal,month)}
    <p class="note">Seasonal outfits are listed last. Those celebrating this month cost 18 points; other seasonal hats cost 10. Once purchased, they stay yours all year. No real money, ads or account.</p>
  </section>`;
}

export function lockerView(progress) {
  const settings = progress.state.settings;
  const groups = SHOP_GROUPS.map(({key,label}) => {
    const items = selectionCatalog(progress,key);
    const cards = items.map(item => {
      const selected = settings[key]===item.id;
      return `<button class="costume-choice${selected ? ' selected' : ''}" type="button"
        data-action="equip" data-key="${key}" data-item="${item.id}" aria-pressed="${selected}">
        <span class="costume-emoji" aria-hidden="true">${item.icon}</span>
        <span>${esc(item.label)}</span><small>${selected ? 'Wearing it!' : 'Put it on'}</small>
      </button>`;
    }).join("");
    return `<section class="locker-group"><h2>${esc(label)}</h2><div class="costume-grid" role="group" aria-label="${esc(label)}">${cards}</div></section>`;
  }).join("");
  const total = SHOP_GROUPS.reduce((count,category) => count + selectionCatalog(progress,category.key).length,0);
  return `<section class="locker-page" aria-labelledby="locker-heading">
    <h1 id="locker-heading">🧳 Your Potato Locker</h1>
    <p>Everything you've bought stays here, even after the season ends. Changing your outfit is always free!</p>
    <div class="dress-up-preview"><div class="dress-up-potato">${potatoSVG("happy")}</div>
      <div><p><b>Your Professor Potato</b></p><p>${total} pieces owned, including free choices.</p>
      <p>Want more outfits? <button class="link" data-action="nav" data-page="shop">Visit the Shop</button></p></div>
    </div>
    ${groups}
    <p class="note">Mix and match anything you own. All costume styles and colors are for everyone.</p>
  </section>`;
}

export function profileView(progress, settings, voiceReady) {
  const sum = progress.summary(), sessions=progress.state.sessions;
  const totalSpells = WORDS.reduce((acc,w)=>acc+progress.state.words[w.word].runs,0);
  return `<section class="profile-page" aria-labelledby="profile-heading">
    <h1 id="profile-heading">⭐ My Profile</h1>
    <p class="note">Only saved in this browser on this device. No account or personal information required.</p>
    <div class="profile-stats">
      <div><strong>${progress.state.pointBalance}</strong><small>Points to spend</small></div>
      <div><strong>${progress.state.practicePoints}</strong><small>Total points earned</small></div>
      <div><strong>${sum.independentNow}/20</strong><small>Latest independent spellings</small></div>
      <div><strong>${totalSpells}</strong><small>Total spelling practices</small></div>
    </div>
    <h2>Spelling progress</h2>
    <p>You've tried ${sum.practiced} different words. ${progress.reviewList().length} words could use another try.</p>
    <ol class="dots" aria-label="Progress by card">${dots(progress)}</ol>
    <h2>Practice history</h2>
    <p>${sessions.length ? 'Recent rounds are saved right here.' : 'Play a round to start your history!'}</p>
    ${sessions.length ? `<ul class="profile-history">${sessions.slice(-8).reverse().map(s=>`<li>${esc(s.mode)}: ${s.independent}/${s.total} independent · ${esc(s.at.slice(0,10))}</li>`).join("")}</ul>` : ""}
    <h2>Settings</h2>
    <div class="settings">
      <label><input type="checkbox" data-setting="sfx" ${settings.muted ? "" : "checked"}> Sound effects</label>
      <label><input type="checkbox" data-setting="calm" ${settings.reducedMotion ? "checked" : ""}> Calm mode (less movement and confetti)</label>
      <label><input type="checkbox" data-setting="accessible" ${settings.accessible ? "checked" : ""}> Accessible mode: show spelling on the card (does not count as independent)</label>
    </div>
    <p class="note">${voiceReady ? 'Kokoro narration available.' : 'Kokoro narration unavailable.'}</p>
    <div class="reset"><button class="link" data-action="reset-ask">Reset all my List 15 progress, points and locker</button><span id="resetbox"></span></div>
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
