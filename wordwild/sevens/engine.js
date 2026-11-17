// Pure game logic for Super Sevens: no DOM, so the tests can run it in Node.
import { factsOf, MEDALS, RANGES, THEMES, TABLES } from "./facts.js";

export const KEY = "wordwild.sevens.v1";
export const DEFAULT_RANGE = 20;
export const DEFAULT_TABLE = 7;
// Keys that keep every table's progress apart.
export const lk = (t, n) => `${t}:${n}`;
export const bestKey = (t, max) => `${t}:${max}`;
export const medalKey = (t, max, id) => `${t}:${max}:${id}`;

export function shuffle(list, rng = Math.random) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// The rhyme as shown up front: the first line, then a line with the answer left blank.
export const rhymeLines = (f) => ({ lead: f.lead, blank: f.blank || `${f.t} times ${f.n} is ___!` });

// "Guess the missing number": the same fact asked three different ways (fact family).
export const MISSING_KINDS = ["factor", "divide", "dividend"];
export function missingQuestion(f, rng = Math.random) {
  const kind = MISSING_KINDS[Math.min(2, Math.floor(rng() * 3))], a = f.a, n = f.n, t = f.t, ts = `${t}s`;
  const answer = kind === "dividend" ? a : n;
  // The 10s anchor only when it is not the answer itself.
  const jump = a > 10 * t && 10 * t !== answer ? `10 ${ts} is ${10 * t}. Keep jumping by ${ts} from there until you land on ${a}.` : `Count by ${ts} from 0 until you land on ${a}. How many jumps did you take?`;
  if (kind === "factor") return { kind, sum: `${t} × ? = ${a}`, aria: `${t} times what number equals ${a}`, answer: n, story: `${t} equal groups hold ${a} in all. How many are in each group?`, think: jump };
  if (kind === "divide") return { kind, sum: `${a} ÷ ${t} = ?`, aria: `${a} divided by ${t}`, answer: n, story: `${a} things are shared equally among ${t} friends. How many does each friend get?`, think: `Which number times ${t} makes ${a}? ${jump}` };
  return { kind, sum: `? ÷ ${t} = ${n}`, aria: `what number divided by ${t} equals ${n}`, answer: a, story: `Some things were shared equally among ${t} friends, and each friend got ${n}. How many things were there?`, think: `${t} friends each got ${n}, so there were ${t} groups of ${n}. What is ${t} × ${n}?` };
}
// The ordinary question, in the same shape.
export const classicQuestion = (f) => ({ kind: "classic", sum: `${f.t} × ${f.n} = ?`, aria: `${f.t} times ${f.n}`, answer: f.a, story: f.q, think: f.think });

// "Count by": a stretch of the skip-counting sequence t, 2t, 3t, ... with one number hiding. f.n is the position of the hidden number (1 to max).
export const COUNTBY_KINDS = ["next", "gap", "back"];
export function countByQuestion(f, max, rng = Math.random) {
  const t = f.t, k = f.n, at = (i) => t * i, ts = `${t}s`;
  const kinds = COUNTBY_KINDS.filter((x) => (x === "next" ? k >= 2 : x === "gap" ? k >= 2 && k + 1 <= max : k + 1 <= max));
  const kind = kinds[Math.min(kinds.length - 1, Math.floor(rng() * kinds.length))];
  let shown, hole, story, think;
  if (kind === "next") {
    shown = []; for (let i = Math.max(1, k - 4); i < k; i++) shown.push(at(i)); hole = shown.length; shown.push("?");
    story = `Count by ${ts}. What number comes next?`; think = `Every jump is ${t}. Start at ${at(k - 1)} and jump ${t} more.`;
  } else if (kind === "gap") {
    shown = []; for (let i = Math.max(1, k - 2); i <= Math.min(max, k + 2); i++) shown.push(i === k ? "?" : at(i)); hole = shown.indexOf("?");
    story = `Count by ${ts}. Which number is hiding?`; think = `Every jump is ${t}. Start at ${at(k - 1)} and jump ${t} more.`;
  } else {
    shown = []; for (let i = Math.min(max, k + 3); i > k; i--) shown.push(at(i)); hole = shown.length; shown.push("?");
    story = `Count backwards by ${ts}. What number comes next?`; think = `Going down, every jump takes away ${t}. Start at ${at(k + 1)} and jump back ${t}.`;
  }
  const sum = shown.join(" "), aria = `count by ${t}: ${shown.map((x) => (x === "?" ? "what number" : x)).join(", ")}`;
  const chant = [];   // the stretch of the chant for the help sheet, ending on the answer
  if (kind === "back") for (let i = Math.min(max, k + 3); i >= k; i--) chant.push(at(i)); else for (let i = Math.max(1, k - 4); i <= k; i++) chant.push(at(i));
  return { kind, sum, aria, answer: at(k), story, think, hole, chant };
}

// Spaced review (Leitner boxes). Box 1 = missed recently, box 4 = known. A fact in box b waits BOX_GAP[b] rounds before it is due again.
// Every times table keeps its own record, under "table:fact".
export const BOX_GAP = [0, 0, 1, 3, 7];
export function recordResult(learn, f, good, round) {
  const key = lk(f.t, f.n), box = good ? Math.min(4, (learn[key] ? learn[key].box : 1) + 1) : 1;
  learn[key] = { box, due: round + BOX_GAP[box] };
  return learn;
}
// How many facts were missed last time (box 1) and still need a visit.
export const trickyCount = (learn, t, max) => factsFor(max, t).filter((f) => learn[lk(t, f.n)] && learn[lk(t, f.n)].box === 1).length;
// Pick up to k facts to revisit: recently missed first, then ones that are due, topped up with facts she has not seen.
export function pickTricky(learn, round, t, max, k = 10, rng = Math.random) {
  const all = factsFor(max, t), rec = (f) => learn[lk(t, f.n)];
  const missed = all.filter((f) => rec(f) && rec(f).box === 1);
  const picked = missed.slice(0, k);
  const due = all.filter((f) => rec(f) && rec(f).box > 1 && rec(f).due <= round && !picked.includes(f)).sort((a, b) => rec(a).box - rec(b).box || rec(a).due - rec(b).due);
  for (const f of due) if (picked.length < k) picked.push(f);
  for (const f of shuffle(all.filter((x) => !rec(x) && !picked.includes(x)), rng)) if (picked.length < Math.min(k, 6)) picked.push(f);
  return shuffle(picked, rng);
}

export const factsFor = (max, t = DEFAULT_TABLE) => factsOf(t).filter((f) => f.n <= max);
export const newRound = (max = DEFAULT_RANGE, rng = Math.random, t = DEFAULT_TABLE) => shuffle(factsFor(max, t), rng);
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

export function blankState() { return { v: 3, theme: "fire", table: DEFAULT_TABLE, range: DEFAULT_RANGE, muted: false, rhymes: true, round: 0, learn: {}, best: {}, medals: {}, plays: 0 }; }

// Saves from before the table picker (v1, v2) were all about the 7s: their scores move to table 7.
export function migrate(raw) {
  const s = blankState();
  if (!raw || typeof raw !== "object") return s;
  if (THEMES.some((t) => t.id === raw.theme)) s.theme = raw.theme;
  if (RANGES.some((r) => r.max === raw.range)) s.range = raw.range;
  if (raw.v === 3 && TABLES.includes(raw.table)) s.table = raw.table;
  if (raw.muted === true) s.muted = true;
  if (raw.rhymes === false) s.rhymes = false;
  if (Number.isInteger(raw.round) && raw.round >= 0) s.round = raw.round;
  const okRec = (r) => r && Number.isInteger(r.box) && r.box >= 1 && r.box <= 4 && Number.isInteger(r.due) && r.due >= 0;
  if (raw.learn && typeof raw.learn === "object") for (const [k, r] of Object.entries(raw.learn)) {
    const m = raw.v === 3 ? /^(\d{1,2}):(\d{1,2})$/.exec(k) : /^(\d{1,2})$/.exec(k);
    const t = m ? (raw.v === 3 ? Number(m[1]) : 7) : 0, n = m ? Number(m[raw.v === 3 ? 2 : 1]) : -1;
    if (m && TABLES.includes(t) && n >= 0 && n <= 20 && okRec(r)) s.learn[lk(t, n)] = { box: r.box, due: r.due };
  }
  if (Number.isInteger(raw.plays) && raw.plays >= 0) s.plays = raw.plays;
  if (raw.v === 3) {
    for (const t of TABLES) for (const r of RANGES) {
      const b = raw.best && raw.best[bestKey(t, r.max)];
      if (Number.isFinite(b) && b > 0) s.best[bestKey(t, r.max)] = b;
      for (const m of MEDALS) if (raw.medals && raw.medals[medalKey(t, r.max, m.id)] === true) s.medals[medalKey(t, r.max, m.id)] = true;
    }
  } else if (raw.v === 2) {
    for (const r of RANGES) {
      const b = raw.best && raw.best[r.max];
      if (Number.isFinite(b) && b > 0) s.best[bestKey(7, r.max)] = b;
      for (const m of MEDALS) if (raw.medals && raw.medals[`${r.max}:${m.id}`] === true) s.medals[medalKey(7, r.max, m.id)] = true;
    }
  } else {
    if (Number.isFinite(raw.bestMs) && raw.bestMs > 0) s.best[bestKey(7, 12)] = raw.bestMs;
    for (const m of MEDALS) if (raw.medals && raw.medals[m.id] === true) s.medals[medalKey(7, 12, m.id)] = true;
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
