// Pure game logic for Super Sevens: no DOM, so the tests can run it in Node.
import { FACTS, MEDALS, RANGES, THEMES } from "./facts.js";

export const KEY = "wordwild.sevens.v1";
export const DEFAULT_RANGE = 20;

export function shuffle(list, rng = Math.random) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// The rhyme as shown up front: the first line, then a line with the answer left blank.
export const rhymeLines = (f) => ({ lead: f.lead, blank: f.blank || `7 times ${f.n} is ___!` });

// "Guess the missing number": the same fact asked three different ways (fact family).
export const MISSING_KINDS = ["factor", "divide", "dividend"];
export function missingQuestion(f, rng = Math.random) {
  const kind = MISSING_KINDS[Math.min(2, Math.floor(rng() * 3))], a = f.a, n = f.n;
  const jump = a > 70 ? `10 sevens is 70. Keep jumping by 7s from there until you land on ${a}.` : `Count by 7s from 0 until you land on ${a}. How many jumps did you take?`;
  if (kind === "factor") return { kind, sum: `7 × ? = ${a}`, aria: `7 times what number equals ${a}`, answer: n, story: `7 equal groups hold ${a} in all. How many are in each group?`, think: jump };
  if (kind === "divide") return { kind, sum: `${a} ÷ 7 = ?`, aria: `${a} divided by 7`, answer: n, story: `${a} things are shared equally among 7 friends. How many does each friend get?`, think: `Which number times 7 makes ${a}? ${jump}` };
  return { kind, sum: `? ÷ 7 = ${n}`, aria: `what number divided by 7 equals ${n}`, answer: a, story: `Some things were shared equally among 7 friends, and each friend got ${n}. How many things were there?`, think: `7 friends each got ${n}, so there were 7 groups of ${n}. What is 7 × ${n}?` };
}
// The ordinary question, in the same shape.
export const classicQuestion = (f) => ({ kind: "classic", sum: `7 × ${f.n} = ?`, aria: `7 times ${f.n}`, answer: f.a, story: f.q, think: f.think });

// Spaced review (Leitner boxes). Box 1 = missed recently, box 4 = known. A fact in box b waits BOX_GAP[b] rounds before it is due again.
export const BOX_GAP = [0, 0, 1, 3, 7];
export function recordResult(learn, n, good, round) {
  const box = good ? Math.min(4, (learn[n] ? learn[n].box : 1) + 1) : 1;
  learn[n] = { box, due: round + BOX_GAP[box] };
  return learn;
}
// How many facts were missed last time (box 1) and still need a visit.
export const trickyCount = (learn, max) => Object.entries(learn).filter(([n, r]) => Number(n) <= max && r.box === 1).length;
// Pick up to k facts to revisit: recently missed first, then ones that are due, topped up with facts she has not seen.
export function pickTricky(learn, round, max, k = 10, rng = Math.random) {
  const all = factsFor(max);
  const missed = all.filter((f) => learn[f.n] && learn[f.n].box === 1);
  const picked = missed.slice(0, k);
  const due = all.filter((f) => learn[f.n] && learn[f.n].box > 1 && learn[f.n].due <= round && !picked.includes(f)).sort((a, b) => learn[a.n].box - learn[b.n].box || learn[a.n].due - learn[b.n].due);
  for (const f of due) if (picked.length < k) picked.push(f);
  for (const f of shuffle(all.filter((x) => !learn[x.n] && !picked.includes(x)), rng)) if (picked.length < Math.min(k, 6)) picked.push(f);
  return shuffle(picked, rng);
}

export const factsFor = (max) => FACTS.filter((f) => f.n <= max);
export const newRound = (max = DEFAULT_RANGE, rng = Math.random) => shuffle(factsFor(max), rng);
export const medalSeconds = (medal, max) => medal.seconds[max];

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

// The best medal earned for a finishing time (seconds) in a range, or null.
export function medalFor(max, seconds) {
  const earned = MEDALS.filter((m) => seconds <= m.seconds[max]);
  return earned.length ? earned[earned.length - 1] : null;
}

// How worried the screen should look: 0 calm, 1 half gone, 2 a quarter left, 3 final ten seconds.
export function alertLevel(leftMs, totalMs) {
  if (leftMs <= 10000) return 3;
  const f = leftMs / totalMs;
  return f <= 0.25 ? 2 : f <= 0.5 ? 1 : 0;
}

// Stars: clean first try = "star"; right but needed a clue or a second try = "bulb".
export function outcomeFor({ tries, usedClue }) { return tries === 0 && !usedClue ? "star" : "bulb"; }

// Cheer at 3 in a row, then every 5.
export const streakCheer = (n) => (n === 3 || (n >= 5 && n % 5 === 0) ? n : 0);

export function blankState() { return { v: 2, theme: "fire", range: DEFAULT_RANGE, muted: false, rhymes: true, round: 0, learn: {}, best: {}, medals: {}, plays: 0 }; }

// Older saves (v1) only knew the 0 to 12 table: bestMs and medals keyed by id.
export function migrate(raw) {
  const s = blankState();
  if (!raw || typeof raw !== "object") return s;
  if (THEMES.some((t) => t.id === raw.theme)) s.theme = raw.theme;
  if (RANGES.some((r) => r.max === raw.range)) s.range = raw.range;
  if (raw.muted === true) s.muted = true;
  if (raw.rhymes === false) s.rhymes = false;
  if (Number.isInteger(raw.round) && raw.round >= 0) s.round = raw.round;
  if (raw.learn && typeof raw.learn === "object") for (const [n, r] of Object.entries(raw.learn)) {
    if (Number.isInteger(Number(n)) && n >= 0 && n <= 20 && r && Number.isInteger(r.box) && r.box >= 1 && r.box <= 4 && Number.isInteger(r.due) && r.due >= 0) s.learn[n] = { box: r.box, due: r.due };
  }
  if (Number.isInteger(raw.plays) && raw.plays >= 0) s.plays = raw.plays;
  if (raw.v === 2) {
    for (const r of RANGES) {
      const b = raw.best && raw.best[r.max];
      if (Number.isFinite(b) && b > 0) s.best[r.max] = b;
      for (const m of MEDALS) if (raw.medals && raw.medals[`${r.max}:${m.id}`] === true) s.medals[`${r.max}:${m.id}`] = true;
    }
  } else {
    if (Number.isFinite(raw.bestMs) && raw.bestMs > 0) s.best[12] = raw.bestMs;
    for (const m of MEDALS) if (raw.medals && raw.medals[m.id] === true) s.medals[`12:${m.id}`] = true;
  }
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
