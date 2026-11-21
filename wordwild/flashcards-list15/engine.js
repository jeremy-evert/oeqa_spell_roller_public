// Pure game logic: no DOM, no audio, no network. Everything the scoring promises lives here so tests can prove it.
import { WORDS, ROUND_SIZE } from "./words.js";

// ---- outcomes -------------------------------------------------------------------------------------------
// One finished card-run ends in exactly one outcome. Only INDEPENDENT counts as independent recall.
export const OUTCOME = Object.freeze({
  INDEPENDENT: "independent_first_try", // typed correctly on the first try, no hint, no reveal, answer hidden
  AFTER_RETRY: "after_retry",           // correct on a later attempt, no hint, no reveal
  AFTER_HINT: "after_hint",             // correct after using the hint (no reveal)
  AFTER_REVEAL: "after_reveal",         // correct only after the spelling was shown; recall was hidden again first
  ASSISTED: "assisted",                 // accessible mode (word visible): never counted as independent
  SKIPPED: "skipped",
});
export const INDEPENDENT_KEYS = [OUTCOME.INDEPENDENT];


/* Potato Shop catalogue. Prices use spendable points; bought items live in the Locker.
   Hat order is deliberate: standard caps, metallic/rainbow caps, themed hats, seasonal last. */
export const HAT_STYLES = Object.freeze([
 {id:"none",label:"No hat",price:0,icon:"🥔",group:"Standard graduation caps"},
 {id:"classic",label:"Classic black graduation cap",price:0,icon:"🎓",group:"Standard graduation caps"},
 {id:"redcap",label:"Red graduation cap",price:5,icon:"🎓",group:"Standard graduation caps"},
 {id:"bluecap",label:"Blue graduation cap",price:5,icon:"🎓",group:"Standard graduation caps"},
 {id:"greencap",label:"Green graduation cap",price:5,icon:"🎓",group:"Standard graduation caps"},
 {id:"pinkcap",label:"Pink graduation cap",price:5,icon:"🎓",group:"Standard graduation caps"},
 {id:"purplecap",label:"Purple graduation cap",price:5,icon:"🎓",group:"Standard graduation caps"},
 {id:"orangecap",label:"Orange graduation cap",price:5,icon:"🎓",group:"Standard graduation caps"},
 {id:"sunshine",label:"Gold graduation cap",price:15,icon:"🌟",group:"Gold, silver and rainbow caps"},
 {id:"silvercap",label:"Silver graduation cap",price:15,icon:"🥈",group:"Gold, silver and rainbow caps"},
 {id:"rainbowcap",label:"Rainbow graduation cap",price:15,icon:"🌈",group:"Gold, silver and rainbow caps"},
 {id:"starlight",label:"Purple sparkle cap (original)",price:15,icon:"✨",group:"Gold, silver and rainbow caps"},
 {id:"tiara",label:"Crystal tiara",price:20,icon:"💎",group:"Costume hats and hoods"},
 {id:"crown",label:"Royal crown",price:20,icon:"👑",group:"Costume hats and hoods"},
 {id:"dino",label:"Dinosaur hood",price:20,icon:"🦖",group:"Costume hats and hoods"},
 {id:"wizard",label:"Magician's hat",price:20,icon:"🪄",group:"Costume hats and hoods"},
 {id:"space",label:"Space explorer helmet",price:20,icon:"🚀",group:"Costume hats and hoods"},
 {id:"turkey",label:"Thanksgiving turkey hat",price:10,seasonMonths:[11],icon:"🦃",group:"Seasonal celebrations"},
 {id:"pumpkin",label:"Jack-o'-lantern hat",price:10,seasonMonths:[10,11],icon:"🎃",group:"Seasonal celebrations"},
 {id:"santa",label:"Santa hat",price:10,seasonMonths:[11,12],icon:"🎅",group:"Seasonal celebrations"},
 {id:"heart",label:"Valentine heart hat",price:10,seasonMonths:[2],icon:"❤️",group:"Seasonal celebrations"},
 {id:"easter",label:"Easter egg hat",price:10,seasonMonths:[3,4],icon:"🥚",group:"Seasonal celebrations"}
]);
export const ACCESSORY_STYLES = Object.freeze([
 {id:"none",label:"No accessory",price:0,icon:"🥔"},
 {id:"bowtie",label:"Snazzy bow tie",price:4,icon:"🎀"},
 {id:"glasses",label:"Funny glasses",price:6,icon:"👓"},
 {id:"bandana",label:"Adventure bandana",price:8,icon:"🧣"},
 {id:"cape",label:"Superhero cape",price:12,icon:"🦸"},
 {id:"wings",label:"Dragon wings",price:20,icon:"🐉"}
]);
export const POTATO_COLORS = Object.freeze([
 {id:"classic",label:"Original potato",price:0,icon:"🥔"},
 {id:"rose",label:"Rose potato",price:0,icon:"🌸"},
 {id:"mint",label:"Mint potato",price:0,icon:"🍃"},
 {id:"lavender",label:"Lavender potato",price:3,icon:"🪻"},
 {id:"golden",label:"Golden potato",price:8,icon:"☀️"}
]);
export const BACKGROUND_THEMES = Object.freeze([
 {id:"original",label:"Original sunset",price:0,icon:"🌅"},
 {id:"pink",label:"Pink",price:0,icon:"🩷"},
 {id:"blue",label:"Blue",price:0,icon:"💙"},
 {id:"green",label:"Green",price:0,icon:"💚"},
 {id:"yellow",label:"Yellow",price:0,icon:"💛"},
 {id:"red",label:"Red",price:3,icon:"❤️"},
 {id:"orange",label:"Orange",price:3,icon:"🧡"},
 {id:"purple",label:"Purple",price:3,icon:"💜"},
 {id:"rainbow",label:"Rainbow",price:8,icon:"🌈"}
]);
export const COSMETIC_CATALOGS = Object.freeze({
 hatStyle:HAT_STYLES, accessoryStyle:ACCESSORY_STYLES,
 potatoColor:POTATO_COLORS, backgroundTheme:BACKGROUND_THEMES
});
export const SHOP_GROUPS = Object.freeze([
 {key:"hatStyle",label:"Hats & headgear"},
 {key:"accessoryStyle",label:"Accessories"},
 {key:"potatoColor",label:"Potato colors"},
 {key:"backgroundTheme",label:"Background colors"}
]);

// In-season items are the priciest within the seasonal section, not the whole shop.
// Once bought, an item belongs to the Locker even after the season changes.
export function itemPrice(item, month = new Date().getMonth() + 1) {
 return item.seasonMonths && item.seasonMonths.includes(month) ? 18 : item.price;
}
const freeOwned = () => Object.fromEntries(Object.entries(COSMETIC_CATALOGS).map(
 ([key,items]) => [key,items.filter(item=>item.price===0).map(item=>item.id)]
));

// Legacy "unlock at X lifetime points" was not a purchase. Honor old unlocks as gifts
// rather than removing choices or spending points during this shop upgrade.
const OLD_COSTS = Object.freeze({
 hatStyle:{none:0,classic:0,bluecap:2,dino:8,starlight:10,tiara:12,crown:20,sunshine:25,wizard:40,space:60},
 accessoryStyle:{none:0,bowtie:4,glasses:6,bandana:10,cape:22,wings:45},
 potatoColor:{classic:0,rose:0,mint:0,lavender:4,golden:16},
 backgroundTheme:{original:0,pink:0,blue:0,green:0,yellow:0,red:3,orange:3,purple:3,rainbow:14}
});

export const MAX_ATTEMPTS_BEFORE_OFFER = 2; // after this many wrong tries the card offers hint / study

export function normalize(input) {
  return String(input ?? "").trim().toLowerCase().replace(/\u0027/g, "’");
}

/** Compare an attempt with the target and build specific, supportive feedback that never reveals the answer. */
export function checkAttempt(target, attempt) {
  const a = normalize(attempt), t = normalize(target);
  if (a === "") return { correct: false, empty: true, message: "Type your spelling first. You can hear the word again any time." };
  if (a === t) return { correct: true };
  let prefix = 0;
  while (prefix < a.length && prefix < t.length && a[prefix] === t[prefix]) prefix++;
  let suffix = 0;
  while (suffix < a.length - prefix && suffix < t.length - prefix && a[a.length - 1 - suffix] === t[t.length - 1 - suffix]) suffix++;
  const lenDiff = a.length - t.length;
  let message;
  if (prefix === 0) message = "The very first letter is not quite right. Say the word slowly and listen to how it starts.";
  else if (prefix >= 1 && a.length > 0) {
    const tricky = prefix + 1; // the 1-based position of the first wrong letter
    message = `Nice! Your first ${prefix} letter${prefix === 1 ? " is" : "s are"} right. The tricky spot is letter ${tricky}.`;
  }
  if (lenDiff > 0) message += " Your try is a bit too long.";
  else if (lenDiff < 0) message += " Your try is a bit too short.";
  if (suffix > 0 && prefix > 0) message += ` The last ${suffix} letter${suffix === 1 ? " is" : "s are"} good.`;
  return { correct: false, prefix, suffix, lenDiff, message };
}

/** Hint: reveals the letter count and first letter only. Never the whole word. */
export function hintFor(target) {
  const t = target.toLowerCase();
  return { letters: t.length, first: t[0], masked: t[0] + " " + "_ ".repeat(t.length - 1).trim() };
}

// ---- one card run ---------------------------------------------------------------------------------------
// phases: "recall" (answer hidden, typing) -> "study" (answer shown after Show/Study) -> "recall" (hidden again) -> done
export class CardRun {
  constructor(word, { accessible = false, studied = false } = {}) {
    this.word = word.toLowerCase();
    this.accessible = accessible;
    this.phase = "recall";
    this.attempts = 0;       // number of typed submissions that had text
    this.wrong = 0;
    this.hintUsed = false;
    this.revealed = studied;   // true when the spelling was already shown (Flip & Learn): then success is AFTER_REVEAL
    this.done = false;
    this.outcome = null;
    this.lastFeedback = null;
  }
  /** Is the written target allowed on screen right now? Only in study phase or accessible mode. */
  get answerVisible() { return this.phase === "study" || this.accessible; }
  submit(attempt) {
    if (this.done) return { ignored: true };
    if (this.phase === "study") return { ignored: true, message: "Finish studying, then try it from memory." };
    const res = checkAttempt(this.word, attempt);
    if (res.empty) return (this.lastFeedback = res);
    this.attempts++;
    if (res.correct) {
      this.done = true;
      this.outcome = this.accessible ? OUTCOME.ASSISTED
        : this.revealed ? OUTCOME.AFTER_REVEAL
        : this.hintUsed ? OUTCOME.AFTER_HINT
        : this.attempts > 1 ? OUTCOME.AFTER_RETRY
        : OUTCOME.INDEPENDENT;
    } else {
      this.wrong++;
      res.offerHelp = this.wrong >= MAX_ATTEMPTS_BEFORE_OFFER;
    }
    return (this.lastFeedback = res);
  }
  useHint() { if (!this.done) this.hintUsed = true; return hintFor(this.word); }
  /** Show / Study: reveal the spelling. A fresh answer-hidden attempt must follow (tryFromMemory). */
  reveal() { if (this.done) return; this.revealed = true; this.phase = "study"; }
  tryFromMemory() { if (this.done) return; this.phase = "recall"; }
  skip() { if (this.done) return; this.done = true; this.outcome = OUTCOME.SKIPPED; }
}

// ---- progress -------------------------------------------------------------------------------------------
const SCHEMA = 1;
const emptyStats = () => ({ runs: 0, independent: 0, afterRetry: 0, afterHint: 0, afterReveal: 0, assisted: 0, skipped: 0,
                            studied: 0, last: null, tricky: false, lastSeen: null });

export function blankState() {
  const words = {};
  for (const w of WORDS) words[w.word] = emptyStats();
  return { schema: SCHEMA, shopVersion: 2, words, sessions: [], practicePoints: 0, pointBalance: 0, ownedCosmetics: freeOwned(), settings: { muted: false, reducedMotion: null, accessible: false, hatStyle: "classic", accessoryStyle: "none", potatoColor: "classic", backgroundTheme: "original" } };
}

const NUM = (v) => (Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0);

/** Defensive migration: accepts anything (corrupt JSON, wrong schema, extra words) and returns a clean state. */
export function migrate(raw) {
  const base = blankState();
  if (!raw || typeof raw !== "object" || raw.schema !== SCHEMA) return base;
  base.practicePoints = NUM(raw.practicePoints);
  if (raw.shopVersion === 2) {
    base.pointBalance = Math.min(base.practicePoints, NUM(raw.pointBalance));
    for (const [key,catalog] of Object.entries(COSMETIC_CATALOGS)) {
      const stored = Array.isArray(raw.ownedCosmetics?.[key]) ? raw.ownedCosmetics[key] : [];
      const known = new Set(catalog.map(item => item.id));
      base.ownedCosmetics[key] = [...new Set([...base.ownedCosmetics[key],...stored.filter(id => known.has(id))])];
    }
  } else {
    // One-time upgrade of the old cumulative-unlock game: preserve balances
    // and grant previously available cosmetics without charging for them.
    base.pointBalance = base.practicePoints;
    for (const [key, costs] of Object.entries(OLD_COSTS)) {
      base.ownedCosmetics[key] = [...new Set([
        ...base.ownedCosmetics[key],
        ...Object.entries(costs).filter(([id,cost]) =>
          base.practicePoints >= cost && COSMETIC_CATALOGS[key].some(item => item.id === id)
        ).map(([id]) => id)
      ])];
    }
  }
  for (const w of WORDS) {
    const r = raw.words && typeof raw.words === "object" ? raw.words[w.word] : null;
    if (!r || typeof r !== "object") continue;
    const s = base.words[w.word];
    for (const k of ["runs", "independent", "afterRetry", "afterHint", "afterReveal", "assisted", "skipped", "studied"]) s[k] = NUM(r[k]);
    s.last = Object.values(OUTCOME).includes(r.last) ? r.last : null;
    s.tricky = r.tricky === true;
    s.lastSeen = typeof r.lastSeen === "string" ? r.lastSeen.slice(0, 40) : null;
  }
  if (raw.settings && typeof raw.settings === "object") {
    base.settings.muted = raw.settings.muted === true;
    base.settings.reducedMotion = typeof raw.settings.reducedMotion === "boolean" ? raw.settings.reducedMotion : null;
    base.settings.accessible = raw.settings.accessible === true;
    // Preserve old hats and previously earned points across this upgrade.
    for (const [key, catalog] of [
      ["hatStyle", HAT_STYLES], ["accessoryStyle", ACCESSORY_STYLES],
      ["potatoColor", POTATO_COLORS], ["backgroundTheme", BACKGROUND_THEMES],
    ]) {
      const choice = catalog.find((item) => item.id === raw.settings[key]);
      if (choice && base.ownedCosmetics[key].includes(choice.id)) base.settings[key] = choice.id;
    }
  }
  if (Array.isArray(raw.sessions)) {
    base.sessions = raw.sessions.slice(-20).filter((s) => s && typeof s === "object").map((s) => ({
      at: typeof s.at === "string" ? s.at.slice(0, 40) : "", mode: typeof s.mode === "string" ? s.mode.slice(0, 20) : "",
      total: NUM(s.total), independent: NUM(s.independent) }));
  }
  return base;
}

export class Progress {
  constructor(state = blankState(), now = () => new Date().toISOString()) { this.state = state; this.now = now; }
  record(word, outcome) {
    const s = this.state.words[word.toLowerCase()];
    if (!s) throw new Error("Unknown word: " + word);
    s.runs++; s.last = outcome; s.lastSeen = this.now();
    // Award effort, not perfection; never deduct points for an incorrect attempt.
    if (outcome !== OUTCOME.SKIPPED) { this.state.practicePoints += 2; this.state.pointBalance += 2; }
    if (outcome === OUTCOME.INDEPENDENT) s.independent++;
    else if (outcome === OUTCOME.AFTER_RETRY) s.afterRetry++;
    else if (outcome === OUTCOME.AFTER_HINT) s.afterHint++;
    else if (outcome === OUTCOME.AFTER_REVEAL) s.afterReveal++;
    else if (outcome === OUTCOME.ASSISTED) s.assisted++;
    else if (outcome === OUTCOME.SKIPPED) s.skipped++;
    // A word stays on the review list until it is next answered independently on the first try.
    if (outcome !== OUTCOME.INDEPENDENT) s.tricky = true;
    else s.tricky = false;
  }
  recordStudy(word) {
    const s = this.state.words[word.toLowerCase()];
    if (s) {
      // One point for studying a word once; unlimited flips cannot farm points.
      if (!s.studied) { this.state.practicePoints++; this.state.pointBalance++; }
      s.studied++; s.lastSeen = this.now();
    }
  }
  isOwned(key, id) {
    return Object.hasOwn(COSMETIC_CATALOGS,key) &&
      this.state.ownedCosmetics[key].includes(id);
  }
  purchase(key, id, month = new Date().getMonth() + 1) {
    const catalog = Object.hasOwn(COSMETIC_CATALOGS,key) ? COSMETIC_CATALOGS[key] : null;
    const item = catalog?.find(entry=>entry.id===id);
    if (!item) return {ok:false,reason:"Unknown item"};
    if (this.isOwned(key,id)) return {ok:false,reason:"Already owned"};
    const price = itemPrice(item,month);
    if (this.state.pointBalance < price) return {ok:false,reason:"Not enough Potato Points"};
    this.state.pointBalance -= price;
    this.state.ownedCosmetics[key].push(id);
    return {ok:true,price};
  }
  equip(key,id) {
    if (!this.isOwned(key,id)) return false;
    this.state.settings[key] = id;
    return true;
  }
  // Backwards-compatible convenience methods only equip already-owned items.
  chooseHatStyle(id) { return this.equip("hatStyle",id); }
  chooseAccessory(id) { return this.equip("accessoryStyle",id); }
  choosePotatoColor(id) { return this.equip("potatoColor",id); }
  chooseBackground(id) { return this.equip("backgroundTheme",id); }
  setTricky(word, v) { const s = this.state.words[word.toLowerCase()]; if (s) s.tricky = !!v; }
  recordSession(mode, outcomes) {
    this.state.sessions.push({ at: this.now(), mode, total: outcomes.length,
      independent: outcomes.filter((o) => o === OUTCOME.INDEPENDENT).length });
    this.state.sessions = this.state.sessions.slice(-20);
  }
  /** Words to revisit: anything whose latest result was not an independent first try, plus tricky-flagged words. */
  reviewList() {
    return WORDS.filter((w) => { const s = this.state.words[w.word]; return s.tricky || (s.last !== null && s.last !== OUTCOME.INDEPENDENT); })
                .map((w) => w.word);
  }
  summary() {
    const rows = WORDS.map((w) => ({ word: w.word, ...this.state.words[w.word] }));
    return {
      total: WORDS.length,
      independentNow: rows.filter((r) => r.last === OUTCOME.INDEPENDENT).length,
      practiced: rows.filter((r) => r.runs > 0).length,
      studiedOnly: rows.filter((r) => r.runs === 0 && r.studied > 0).length,
      rows,
    };
  }
  reset() {
    const { muted, reducedMotion, accessible } = this.state.settings;
    this.state = blankState();
    Object.assign(this.state.settings, { muted, reducedMotion, accessible });
  }
}

// ---- rounds ---------------------------------------------------------------------------------------------
/** Break the 20 words into rounds of 5 in canonical order: [[1..5],[6..10],...]. */
export function rounds(size = ROUND_SIZE) {
  const out = [];
  for (let i = 0; i < WORDS.length; i += size) out.push(WORDS.slice(i, i + size).map((w) => w.word));
  return out;
}

/** Deterministic shuffle (mulberry32) so tests can pin a seed. */
export function shuffled(list, seed = Date.now() & 0xffffffff) {
  const a = list.slice(); let t = seed >>> 0;
  const rnd = () => { t += 0x6D2B79F5; let x = Math.imul(t ^ (t >>> 15), 1 | t); x ^= x + Math.imul(x ^ (x >>> 7), 61 | x); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
