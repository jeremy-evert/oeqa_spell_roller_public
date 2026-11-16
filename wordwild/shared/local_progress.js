// WordWild shared on-device progress (Mission 005, first version).
// Scope: ONE browser profile, ONE exact origin (scheme + host + port). No accounts, no server, no network.
// Games that are served from the same origin and import this module read and write the same events.
// What is stored: opaque player ids with a preset animal label, and small whitelisted events. Never raw typed answers.
// Old `wordwild.flashcards.v1` data is left alone; a Flashcards adapter is a later, separate step.

export const KEY = "wordwild.shared.v1";
export const SCHEMA = 1;
export const MAX_EVENTS = 4000;
export const OUTCOMES = Object.freeze(["independent", "after_retry", "assisted", "after_reveal", "skipped"]);
export const AIDS = Object.freeze(["listen", "slow", "clue2", "say_note", "pattern", "partial", "first_letter", "joke", "reveal"]);
export const EVENT_TYPES = Object.freeze(["word_spelling", "joke_reaction", "joke_memory_feedback", "mini_check", "rule_comprehension"]);
export const PLAYER_LABELS = Object.freeze(["Fox", "Owl", "Otter", "Panda", "Gecko", "Moose", "Parrot", "Narwhal"]);
const JOKE_ID = /^list14-[a-z]+-(primary|alternate|extra)-v\d+$/;
const WORD = /^[a-z]{2,20}$/;

const clone = (o) => JSON.parse(JSON.stringify(o));
const freshData = () => ({ schema: SCHEMA, players: [], activePlayerId: null, events: [] });

function clean(raw) {
  // Defensive load: anything unexpected is dropped; never throws.
  const d = freshData();
  if (!raw || typeof raw !== "object" || raw.schema !== SCHEMA) return null;
  if (Array.isArray(raw.players)) {
    d.players = raw.players.filter((p) => p && typeof p.id === "string" && /^p-[a-z0-9]{6,16}$/.test(p.id))
      .map((p) => ({ id: p.id, label: PLAYER_LABELS.includes(p.label) ? p.label : "Player", createdAt: String(p.createdAt || "").slice(0, 30) })).slice(0, 12);
  }
  d.activePlayerId = d.players.some((p) => p.id === raw.activePlayerId) ? raw.activePlayerId : (d.players[0]?.id ?? null);
  if (Array.isArray(raw.events)) {
    d.events = raw.events.filter((e) => e && typeof e === "object" && EVENT_TYPES.includes(e.type) && typeof e.id === "string").slice(-MAX_EVENTS);
  }
  return d;
}

export class SharedProgress {
  /**
   * @param {object} o
   * @param {Storage} [o.storage]            defaults to globalThis.localStorage
   * @param {Set<string>|string[]} o.words    the allowed target words (from the content package)
   * @param {string[]} [o.reviewedRuleIds]    rule ids an educator has approved; default none (rule_comprehension is rejected)
   */
  constructor({ storage = globalThis.localStorage, words, reviewedRuleIds = [], now = () => new Date().toISOString(),
                rand = () => Math.random().toString(36).slice(2, 10) } = {}) {
    this.storage = storage; this.words = new Set(words || []); this.reviewed = new Set(reviewedRuleIds);
    this.now = now; this.rand = rand; this.state = "ok"; this.data = freshData();
    this.refresh(); this.ensurePlayer();
  }

  // ---- persistence --------------------------------------------------------------------------------------
  refresh() {
    try {
      const raw = this.storage.getItem(KEY);
      if (raw == null) return;
      let parsed;
      try { parsed = JSON.parse(raw); } catch { parsed = null; }
      const d = clean(parsed);
      if (d) { this.data = d; this.state = this.state === "memory-only" ? "memory-only" : "ok"; }
      else { try { this.storage.setItem(KEY + ".backup", raw); } catch { /* ignore */ } this.data = freshData(); this.state = "recovered"; }
    } catch { this.state = "memory-only"; }
  }
  _save() {
    try { this.storage.setItem(KEY, JSON.stringify(this.data)); if (this.state === "memory-only") this.state = "ok"; return true; }
    catch { this.state = "memory-only"; return false; }
  }

  // ---- players ------------------------------------------------------------------------------------------
  ensurePlayer() { if (!this.data.players.length) this.addPlayer(0); return this.activePlayer(); }
  addPlayer(labelIndex = 0) {
    const id = "p-" + this.rand().replace(/[^a-z0-9]/g, "").padEnd(6, "x").slice(0, 12);
    const label = PLAYER_LABELS[labelIndex] ?? "Player";
    if (this.data.players.length >= 12) return this.activePlayer();
    this.data.players.push({ id, label, createdAt: this.now() });
    this.data.activePlayerId = id; this._save();
    return this.activePlayer();
  }
  players() { return clone(this.data.players); }
  activePlayer() { return this.data.players.find((p) => p.id === this.data.activePlayerId) ?? null; }
  setActive(id) { if (this.data.players.some((p) => p.id === id)) { this.data.activePlayerId = id; this._save(); return true; } return false; }

  // ---- recording ----------------------------------------------------------------------------------------
  /** Validates, whitelists, and stores one event. Returns {ok:true,event} or {ok:false,reason}. Never stores raw spellings. */
  record(input) {
    this.refresh(); // pick up other games' events before appending
    const e = input || {};
    const actor = e.actor === "grown_up" ? "grown_up" : "child";
    const base = { v: 1, id: "e-" + this.rand(), t: this.now(), player: this.data.activePlayerId, actor,
                   game: typeof e.game === "string" ? e.game.replace(/[^a-z0-9._-]/gi, "").slice(0, 24) : "unknown", type: e.type };
    let evt;
    switch (e.type) {
      case "word_spelling": {
        if (!this.words.has(e.word)) return { ok: false, reason: "unknown word" };
        if (!OUTCOMES.includes(e.outcome)) return { ok: false, reason: "unknown outcome" };
        const aids = (Array.isArray(e.aids) ? e.aids : []).filter((a) => AIDS.includes(a));
        const attempts = Number.isInteger(e.attempts) && e.attempts >= 0 && e.attempts <= 99 ? e.attempts : 0;
        if (e.outcome === "independent" && (attempts > 1 || aids.some((a) => !["listen", "slow", "clue2"].includes(a)))) {
          return { ok: false, reason: "independent requires a first try with no letter-revealing aid" };
        }
        evt = { ...base, word: e.word, outcome: e.outcome, aids, attempts }; break;
      }
      case "joke_reaction":
      case "joke_memory_feedback": {
        if (!JOKE_ID.test(e.jokeId || "") || !this.words.has(e.word)) return { ok: false, reason: "bad joke id or word" };
        evt = { ...base, word: e.word, jokeId: e.jokeId, value: true }; break;
      }
      case "mini_check": {
        if (!this.words.has(e.word) || typeof e.correct !== "boolean") return { ok: false, reason: "bad mini check" };
        evt = { ...base, word: e.word, correct: e.correct, supported: true }; break;
      }
      case "rule_comprehension": {
        if (!this.reviewed.has(e.ruleId)) return { ok: false, reason: "rule is not educator-approved" };
        if (typeof e.correct !== "boolean") return { ok: false, reason: "bad rule event" };
        evt = { ...base, ruleId: String(e.ruleId).slice(0, 16), correct: e.correct }; break;
      }
      default: return { ok: false, reason: "unknown event type" };
    }
    this.data.events.push(evt);
    if (this.data.events.length > MAX_EVENTS) this.data.events = this.data.events.slice(-MAX_EVENTS);
    this._save();
    return { ok: true, event: clone(evt) };
  }

  // ---- reading ------------------------------------------------------------------------------------------
  events(filter = {}) {
    this.refresh();
    const player = filter.player ?? this.data.activePlayerId;
    return clone(this.data.events.filter((e) => (player === "all" || e.player === player)
      && (!filter.type || e.type === filter.type) && (!filter.word || e.word === filter.word) && (!filter.game || e.game === filter.game)));
  }
  latestOutcome(word, player) {
    const ev = this.events({ type: "word_spelling", word, player });
    return ev.length ? ev[ev.length - 1].outcome : null;
  }
  /** Words whose most recent result was not an independent first try. Words never practiced are not "review". */
  reviewList(wordOrder, player) {
    return wordOrder.filter((w) => { const o = this.latestOutcome(w, player); return o !== null && o !== "independent"; });
  }
  summary(wordOrder, player) {
    const rows = wordOrder.map((w) => {
      const ev = this.events({ type: "word_spelling", word: w, player });
      const count = (o) => ev.filter((e) => e.outcome === o).length;
      return { word: w, runs: ev.length, last: ev.length ? ev[ev.length - 1].outcome : null,
               independent: count("independent"), afterRetry: count("after_retry"), assisted: count("assisted"),
               afterReveal: count("after_reveal"), skipped: count("skipped") };
    });
    const memory = this.events({ type: "joke_memory_feedback", player }).length;
    const funny = this.events({ type: "joke_reaction", player }).length;
    return { total: wordOrder.length, practiced: rows.filter((r) => r.runs > 0).length,
             independentNow: rows.filter((r) => r.last === "independent").length, funnyCount: funny, helpedCount: memory, rows };
  }
  exportJSON() { this.refresh(); return JSON.stringify(this.data, null, 2); }
  /** Parent action: wipes ALL players and events for this origin. */
  clearAll() { this.data = freshData(); try { this.storage.removeItem(KEY); this.storage.removeItem(KEY + ".backup"); } catch { this.state = "memory-only"; } this.ensurePlayer(); }
}
