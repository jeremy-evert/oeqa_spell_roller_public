// Pure game logic: no DOM, no audio, no network. Every scoring promise lives here so tests can prove it.

// ---- outcomes ---------------------------------------------------------------------------------------------
// One finished word ends in exactly one outcome. Only INDEPENDENT is independent recall.
export const OUTCOME = Object.freeze({
  INDEPENDENT: "independent",   // first typed try correct, answer hidden, no letter-revealing aid
  AFTER_RETRY: "after_retry",   // correct on a later try, no letter-revealing aid
  ASSISTED: "assisted",         // correct after a letter-revealing aid (pattern, partial letters, how-to-say-it)
  AFTER_REVEAL: "after_reveal", // correct only after the spelling was shown (funny memory help or Show me), then hidden again
  SKIPPED: "skipped",
});

// ---- aids -------------------------------------------------------------------------------------------------
export const AID = Object.freeze({
  LISTEN: "listen", SLOW: "slow", CLUE2: "clue2",       // meaning/sound only: do not change the outcome class
  SAY_NOTE: "say_note", PATTERN: "pattern", PARTIAL: "partial", FIRST: "first_letter", // show letters => assisted
  JOKE: "joke", REVEAL: "reveal",                       // show the whole word => after_reveal
});
const FREE_AIDS = new Set([AID.LISTEN, AID.SLOW, AID.CLUE2]);
const LETTER_AIDS = new Set([AID.SAY_NOTE, AID.PATTERN, AID.PARTIAL, AID.FIRST]);
const REVEAL_AIDS = new Set([AID.JOKE, AID.REVEAL]);

export const MAX_WRONG_BEFORE_NUDGE = 2;
export const ROUND_SIZE = 5;

export const normalize = (s) => String(s ?? "").trim().toLowerCase();

/** Specific, kind feedback about a typed attempt. It never reveals the answer. */
export function checkAttempt(target, attempt) {
  const a = normalize(attempt), t = target.toLowerCase();
  if (a === "") return { correct: false, empty: true, message: "Type your spelling first. You can hear the word again any time." };
  if (a === t) return { correct: true };
  let prefix = 0;
  while (prefix < a.length && prefix < t.length && a[prefix] === t[prefix]) prefix++;
  let suffix = 0;
  while (suffix < a.length - prefix && suffix < t.length - prefix && a[a.length - 1 - suffix] === t[t.length - 1 - suffix]) suffix++;
  const lenDiff = a.length - t.length;
  let message = prefix === 0
    ? "The very first letter is not quite right. Say the word slowly and listen to how it starts."
    : `Nice! Your first ${prefix} letter${prefix === 1 ? " is" : "s are"} right. The tricky spot is letter ${prefix + 1}.`;
  if (lenDiff > 0) message += " Your try is a bit too long.";
  else if (lenDiff < 0) message += " Your try is a bit too short.";
  if (suffix > 0 && prefix > 0) message += ` The last ${suffix} letter${suffix === 1 ? " is" : "s are"} good.`;
  return { correct: false, prefix, suffix, lenDiff, message };
}

// ---- one word -------------------------------------------------------------------------------------------
// phases: "recall" (answer hidden, typing) -> "study" (the word and a funny memory are shown) -> "recall" -> "done"
export class WordRun {
  constructor(entry) {
    this.entry = entry; this.word = entry.word.toLowerCase();
    this.phase = "recall"; this.attempts = 0; this.wrong = 0;
    this.aids = new Set(); this.revealed = false; this.done = false; this.outcome = null;
    this.jokeIndex = 0; this.miniChecks = []; // [{correct}] supported practice, never changes the outcome
  }
  get answerVisible() { return this.phase === "study" || this.done; }
  get aidList() { return [...this.aids]; }
  /** Record that a help item was used. Returns what the child may now see. */
  useAid(kind) {
    if (this.done || !Object.values(AID).includes(kind)) return null;
    this.aids.add(kind);
    if (REVEAL_AIDS.has(kind)) { this.revealed = true; this.phase = "study"; }
    const h = this.entry.help;
    switch (kind) {
      case AID.CLUE2: return { text: this.entry.clues.secondary };
      case AID.SAY_NOTE: return { text: h.pronunciationNote };
      case AID.PATTERN: return { text: h.patternHint };
      case AID.PARTIAL: return { text: h.partialLetterHint };
      case AID.FIRST: return { text: h.firstLetter };
      default: return {};
    }
  }
  /** Open one funny memory (Help A/B/C). Shows the word, so the next success is after_reveal. */
  openJoke(i = 0) { if (this.done) return null; this.jokeIndex = Math.max(0, Math.min(i, this.entry.jokes.length - 1)); this.useAid(AID.JOKE); return this.entry.jokes[this.jokeIndex]; }
  reveal() { this.useAid(AID.REVEAL); }
  tryFromMemory() { if (!this.done) this.phase = "recall"; }
  skip() { if (this.done) return; this.done = true; this.outcome = OUTCOME.SKIPPED; this.phase = "done"; }
  /** Word-specific mini-check: supported practice, scored separately. Does not change the word outcome. */
  answerMini(i) {
    const mc = this.entry.miniCheck, correct = i === mc.correctIndex;
    this.miniChecks.push({ correct });
    return { correct, feedback: correct ? mc.feedback : "Not quite. Look at the letters again and try another one." };
  }
  submit(text) {
    if (this.done) return { ignored: true };
    if (this.phase === "study") return { ignored: true, message: "Look at the funny memory first, then press 'Hide it and spell it myself'." };
    const res = checkAttempt(this.word, text);
    if (res.empty) return res;
    this.attempts++;
    if (res.correct) {
      this.done = true; this.phase = "done";
      const hasReveal = [...this.aids].some((a) => REVEAL_AIDS.has(a));
      const hasLetters = [...this.aids].some((a) => LETTER_AIDS.has(a));
      this.outcome = hasReveal ? OUTCOME.AFTER_REVEAL : hasLetters ? OUTCOME.ASSISTED : this.attempts > 1 ? OUTCOME.AFTER_RETRY : OUTCOME.INDEPENDENT;
    } else { this.wrong++; res.nudge = this.wrong >= MAX_WRONG_BEFORE_NUDGE; }
    return res;
  }
  /** What the shared progress module should store for this word. Free aids are kept in the list for transparency. */
  toEvent(game = "printer-v2") {
    return { type: "word_spelling", game, word: this.word, outcome: this.outcome, aids: this.aidList, attempts: this.attempts };
  }
}

/** The ladder shown by the Help Me panel, in order. Pure data so the view and tests agree. */
export function ladder(entry) {
  const hasC = entry.jokes.length > 2;
  return [
    { id: "listen", aid: AID.LISTEN, label: "Hear the word again", kind: "free" },
    { id: "slow", aid: AID.SLOW, label: "Hear it slowly", kind: "free" },
    { id: "clue2", aid: AID.CLUE2, label: "A different clue", kind: "free" },
    { id: "say_note", aid: AID.SAY_NOTE, label: "How to say it in beats", kind: "letters" },
    { id: "pattern", aid: AID.PATTERN, label: "What to look for", kind: "letters" },
    { id: "partial", aid: AID.PARTIAL, label: "Show some of the letters", kind: "letters" },
    { id: "jokeA", aid: AID.JOKE, joke: 0, label: "Funny memory trick A", kind: "reveal" },
    { id: "jokeB", aid: AID.JOKE, joke: 1, label: "Funny memory trick B", kind: "reveal" },
    ...(hasC ? [{ id: "jokeC", aid: AID.JOKE, joke: 2, label: "Funny memory trick C", kind: "reveal" }] : []),
    { id: "reveal", aid: AID.REVEAL, label: "Just show me the word", kind: "reveal" },
  ];
}

// ---- sessions -------------------------------------------------------------------------------------------
export function rounds(words, size = ROUND_SIZE) {
  const out = []; for (let i = 0; i < words.length; i += size) out.push(words.slice(i, i + size)); return out;
}
export function shuffled(list, seed = Date.now() & 0xffffffff) {
  const a = list.slice(); let t = seed >>> 0;
  const rnd = () => { t += 0x6D2B79F5; let x = Math.imul(t ^ (t >>> 15), 1 | t); x ^= x + Math.imul(x ^ (x >>> 7), 61 | x); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
/** A session is a list of up to five words played in order. */
export class Session {
  constructor(words, mode) { this.words = words.slice(0, ROUND_SIZE); this.mode = mode; this.index = 0; this.results = []; }
  get current() { return this.words[this.index] ?? null; }
  get finished() { return this.index >= this.words.length; }
  complete(outcome) { this.results.push(outcome); this.index++; }
  get independentCount() { return this.results.filter((o) => o === OUTCOME.INDEPENDENT).length; }
}
