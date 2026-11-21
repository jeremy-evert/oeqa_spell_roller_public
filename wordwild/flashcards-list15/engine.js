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

// Optional cosmetic rewards only: never affect the spelling score or unlock the lessons.
// Cosmetics unlock from total practice points. Items are kept forever; points are not spent.
export const HAT_STYLES = Object.freeze([
  { id: "none", label: "No hat", unlockAt: 0, icon: "🥔" },
  { id: "classic", label: "Graduation cap", unlockAt: 0, icon: "🎓" },
  { id: "bluecap", label: "Blue graduation cap", unlockAt: 2, icon: "🎓" },
  { id: "dino", label: "Dinosaur hood", unlockAt: 8, icon: "🦖" },
  { id: "starlight", label: "Purple sparkle cap", unlockAt: 10, icon: "✨" },
  { id: "tiara", label: "Crystal tiara", unlockAt: 12, icon: "💎" },
  { id: "crown", label: "Royal crown", unlockAt: 20, icon: "👑" },
  { id: "sunshine", label: "Golden graduation cap", unlockAt: 25, icon: "🌟" },
  { id: "wizard", label: "Starry wizard hat", unlockAt: 40, icon: "🪄" },
  { id: "space", label: "Space explorer helmet", unlockAt: 60, icon: "🚀" },
]);
export const ACCESSORY_STYLES = Object.freeze([
  { id: "none", label: "No accessory", unlockAt: 0, icon: "🥔" },
  { id: "bowtie", label: "Snazzy bow tie", unlockAt: 4, icon: "🎀" },
  { id: "glasses", label: "Funny glasses", unlockAt: 6, icon: "👓" },
  { id: "bandana", label: "Adventure bandana", unlockAt: 10, icon: "🧣" },
  { id: "cape", label: "Superhero cape", unlockAt: 22, icon: "🦸" },
  { id: "wings", label: "Dragon wings", unlockAt: 45, icon: "🐉" },
]);
export const POTATO_COLORS = Object.freeze([
  { id: "classic", label: "Original potato", unlockAt: 0, icon: "🥔" },
  { id: "rose", label: "Rose potato", unlockAt: 0, icon: "🌸" },
  { id: "mint", label: "Mint potato", unlockAt: 0, icon: "🍃" },
  { id: "lavender", label: "Lavender potato", unlockAt: 4, icon: "🪻" },
  { id: "golden", label: "Golden potato", unlockAt: 16, icon: "☀️" },
]);
export const BACKGROUND_THEMES = Object.freeze([
  { id: "original", label: "Original sunset", unlockAt: 0, icon: "🌅" },
  { id: "pink", label: "Pink", unlockAt: 0, icon: "🩷" },
  { id: "blue", label: "Blue", unlockAt: 0, icon: "💙" },
  { id: "green", label: "Green", unlockAt: 0, icon: "💚" },
  { id: "yellow", label: "Yellow", unlockAt: 0, icon: "💛" },
  { id: "red", label: "Red", unlockAt: 3, icon: "❤️" },
  { id: "orange", label: "Orange", unlockAt: 3, icon: "🧡" },
  { id: "purple", label: "Purple", unlockAt: 3, icon: "💜" },
  { id: "rainbow", label: "Rainbow", unlockAt: 14, icon: "🌈" },
]);

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
  return { schema: SCHEMA, words, sessions: [], practicePoints: 0, settings: { muted: false, reducedMotion: null, accessible: false, hatStyle: "classic", accessoryStyle: "none", potatoColor: "classic", backgroundTheme: "original" } };
}

const NUM = (v) => (Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0);

/** Defensive migration: accepts anything (corrupt JSON, wrong schema, extra words) and returns a clean state. */
export function migrate(raw) {
  const base = blankState();
  if (!raw || typeof raw !== "object" || raw.schema !== SCHEMA) return base;
  base.practicePoints = NUM(raw.practicePoints);
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
      if (choice && base.practicePoints >= choice.unlockAt) base.settings[key] = choice.id;
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
    if (outcome !== OUTCOME.SKIPPED) this.state.practicePoints += 2;
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
      if (!s.studied) this.state.practicePoints++;
      s.studied++; s.lastSeen = this.now();
    }
  }
  chooseCosmetic(key, id, catalog) {
    const choice = catalog.find((item) => item.id === id);
    if (!choice || this.state.practicePoints < choice.unlockAt) return false;
    this.state.settings[key] = choice.id;
    return true;
  }
  chooseHatStyle(id) { return this.chooseCosmetic("hatStyle", id, HAT_STYLES); }
  chooseAccessory(id) { return this.chooseCosmetic("accessoryStyle", id, ACCESSORY_STYLES); }
  choosePotatoColor(id) { return this.chooseCosmetic("potatoColor", id, POTATO_COLORS); }
  chooseBackground(id) { return this.chooseCosmetic("backgroundTheme", id, BACKGROUND_THEMES); }
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
