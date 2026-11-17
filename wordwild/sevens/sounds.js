// Original sound effects for Super Sevens, synthesized live with the Web Audio API. No audio files.
// Each look (fire, space, candy) plays the same effects with its own wave shape and pitch.
// The AudioContext is created only after a button press; everything respects `muted`.
let ctx = null;
let muted = false;
let look = "fire";
export const stats = { played: 0, byName: {} };

const VOICES = {
  fire:  { wave: "square",   mul: 1,   gain: 0.55 },
  space: { wave: "sine",     mul: 1.2, gain: 1 },
  candy: { wave: "triangle", mul: 1.5, gain: 1 },
};

export function setLook(t) { look = VOICES[t] ? t : "fire"; }
export function setMuted(v) { muted = !!v; }
export function isMuted() { return muted; }
export function unlock() {
  try {
    if (!ctx) { const AC = globalThis.AudioContext || globalThis.webkitAudioContext; if (AC) ctx = new AC(); }
    if (ctx && ctx.state === "suspended") ctx.resume();
  } catch { ctx = null; }
  return !!ctx;
}

function tone(freq, start, dur, { type = null, gain = 0.16, slide = null } = {}) {
  const v = VOICES[look], o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + start;
  o.type = type || v.wave; o.frequency.setValueAtTime(freq * v.mul, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide * v.mul, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain * v.gain, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur + 0.05);
}
function noise(start, dur, { gain = 0.1, freq = 2000 } = {}) {
  const n = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = buf; f.type = "bandpass"; f.frequency.value = freq; g.gain.value = gain;
  s.connect(f).connect(g).connect(ctx.destination); s.start(ctx.currentTime + start);
}

const EFFECTS = {
  // a key tap: each digit has its own little pitch
  tap: (d = 0) => tone(380 + (d % 10) * 55, 0, 0.05, { gain: 0.08 }),
  // a new question whooshes in
  whoosh: () => { noise(0, 0.16, { gain: 0.07, freq: 1400 }); tone(220, 0, 0.14, { slide: 520, gain: 0.05 }); },
  pop: () => tone(300, 0, 0.09, { type: "sine", slide: 900, gain: 0.2 }),
  // right answer: a rising arpeggio that climbs higher with every answer in a row
  correct: (streak = 0) => {
    const base = 523 * Math.pow(1.0595, Math.min(streak, 12));
    [1, 1.25, 1.5, 2].forEach((r, i) => tone(base * r, i * 0.07, 0.2, { gain: 0.16 }));
  },
  // wrong answer: slide whistle down and a boing
  whoops: () => { tone(520, 0, 0.32, { type: "sawtooth", slide: 140, gain: 0.12 }); tone(90, 0.3, 0.16, { type: "square", gain: 0.1 }); },
  clue: () => { tone(880, 0, 0.07, { type: "sine", gain: 0.14 }); tone(1320, 0.08, 0.1, { type: "sine", gain: 0.12 }); },
  boing: () => tone(200, 0, 0.3, { type: "sine", slide: 600, gain: 0.18 }),
  // the clock ticks in the last ten seconds
  tick: () => tone(1000, 0, 0.04, { type: "square", gain: 0.07 }),
  // the screen changes colour: a short alarm that gets more urgent
  warn: (level = 1) => { for (let i = 0; i < level + 1; i++) tone(level === 3 ? 1400 : 900, i * 0.11, 0.08, { type: "square", gain: 0.1 }); },
  // a streak cheer
  streak: (n = 3) => { const b = 440 + Math.min(n, 20) * 12; [b, b * 1.25, b * 1.5, b * 2, b * 2.5].forEach((f, i) => tone(f, i * 0.06, 0.16, { gain: 0.15 })); noise(0.2, 0.25, { gain: 0.06, freq: 6000 }); },
  // time is up
  buzzer: () => { tone(160, 0, 0.5, { type: "sawtooth", slide: 60, gain: 0.2 }); tone(120, 0.1, 0.5, { type: "square", gain: 0.1, slide: 50 }); },
  drum: () => { for (let i = 0; i < 12; i++) { noise(i * 0.07, 0.06, { gain: 0.1 + i * 0.006, freq: 220 }); } tone(80, 0.84, 0.25, { type: "sine", gain: 0.25 }); },
  fanfare: () => { [392, 523, 659, 784, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.22, { gain: 0.13 })); noise(0.7, 0.4, { gain: 0.08, freq: 6000 }); },
  // a medal shimmer: a fast run of high notes
  medal: () => { for (let i = 0; i < 14; i++) tone(1046 * Math.pow(1.122, i % 8) , i * 0.045, 0.2, { type: "sine", gain: 0.1 }); tone(523, 0.7, 0.6, { gain: 0.14 }); tone(784, 0.7, 0.6, { gain: 0.12 }); tone(1046, 0.7, 0.7, { gain: 0.12 }); },
  sparkle: () => { for (let i = 0; i < 5; i++) tone(1500 + Math.random() * 1800, i * 0.04, 0.1, { type: "sine", gain: 0.07 }); },
};
export const EFFECT_NAMES = Object.keys(EFFECTS);

export function play(name, arg) {
  if (muted || !EFFECTS[name]) return false;
  if (!unlock()) return false;
  try { EFFECTS[name](arg); stats.played++; stats.byName[name] = (stats.byName[name] || 0) + 1; return true; }
  catch { return false; }
}
