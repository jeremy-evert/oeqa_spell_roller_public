// Pure game logic for Super Sevens: no DOM, so the tests can run it in Node.
import { FACTS, MEDALS } from "./facts.js";

export const KEY = "wordwild.sevens.v1";

export function shuffle(list, rng = Math.random) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function newRound(rng = Math.random) { return shuffle(FACTS, rng); }

// Accepts "28", " 28 ", "028". Rejects empty, negative, decimal and words.
export function parseAnswer(text) {
  const t = String(text ?? "").trim();
  return /^\d{1,3}$/.test(t) ? Number(t) : null;
}

export function isCorrect(fact, text) { return parseAnswer(text) === fact.a; }

export function formatTime(ms) {
  const tenths = Math.floor(Math.max(0, ms) / 100);
  const s = Math.floor(tenths / 10);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}.${tenths % 10}`;
}

// The best medal earned for a finishing time in seconds, or null.
export function medalFor(seconds) {
  const earned = MEDALS.filter((m) => seconds <= m.seconds);
  return earned.length ? earned[earned.length - 1] : null;
}

// Stars: clean first try = "star"; right but needed a clue or a second try = "bulb".
export function outcomeFor({ tries, usedClue }) { return tries === 0 && !usedClue ? "star" : "bulb"; }

export function blankState() { return { bestMs: null, medals: {}, plays: 0 }; }
export function migrate(raw) {
  const s = blankState();
  if (!raw || typeof raw !== "object") return s;
  if (Number.isFinite(raw.bestMs) && raw.bestMs > 0) s.bestMs = raw.bestMs;
  for (const m of MEDALS) if (raw.medals && raw.medals[m.id] === true) s.medals[m.id] = true;
  if (Number.isInteger(raw.plays) && raw.plays >= 0) s.plays = raw.plays;
  return s;
}

let memory = null;
export function load(storage = globalThis.localStorage) {
  try { const raw = storage.getItem(KEY); return migrate(raw ? JSON.parse(raw) : null); }
  catch { return memory ? migrate(memory) : blankState(); }
}
export function save(state, storage = globalThis.localStorage) {
  memory = JSON.parse(JSON.stringify(state));
  try { storage.setItem(KEY, JSON.stringify(state)); return true; } catch { return false; }
}
export function wipe(storage = globalThis.localStorage) {
  memory = null;
  try { storage.removeItem(KEY); } catch { /* ignore */ }
}
