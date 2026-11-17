// Original sound effects for Super Sevens, synthesized live with the Web Audio API. No audio files.
// Each look is its own little sound world, not just a re-pitched copy:
//   fire  = fireballs (launch whooshes, "fwoomp" ignitions, explosion booms), warm embers, rounded horns, war drums
//   space = asteroids (rock clacks, meteor fly-bys, impact thuds, a rumbling asteroid field), radar blips, a theremin wobble
//   candy = a bubble-gum barbershop: four-part quartet chords, bubble-gum inflate and pop, marimba keys, music-box bells
// The AudioContext is created only after a button press; everything respects `muted`.
let ctx = null, out = null, muted = false, look = "fire";
export const stats = { played: 0, byName: {} };

export const LOOKS = ["fire", "space", "candy"];
export function setLook(t) { look = LOOKS.includes(t) ? t : "fire"; }
export function setMuted(v) { muted = !!v; }
export function isMuted() { return muted; }

// Everything goes through one quiet master gain and a compressor, so loud moments never clip.
function makeOut(c) {
  const m = c.createGain(); m.gain.value = 1.3;
  const k = c.createDynamicsCompressor(); k.threshold.value = -14; k.ratio.value = 6;
  m.connect(k); k.connect(c.destination);
  return m;
}
export function unlock() {
  try {
    if (!ctx) { const AC = globalThis.AudioContext || globalThis.webkitAudioContext; if (AC) { ctx = new AC(); out = makeOut(ctx); } }
    if (ctx && ctx.state === "suspended") ctx.resume();
  } catch { ctx = null; out = null; }
  return !!ctx;
}
// For tests: render into an OfflineAudioContext instead of the speakers.
export function _useContext(c) { ctx = c; out = makeOut(c); }

/* ---------- building blocks ---------- */
function tone(freq, start, dur, { type = "sine", gain = 0.15, slide = null, vib = null, partials = null, attack = 0.01, lp = null } = {}) {
  const t = ctx.currentTime + start, g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  g.connect(out);
  for (const [mult, pg] of partials || [[1, 1]]) {
    const o = ctx.createOscillator(), p = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq * mult, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide * mult, t + dur);
    if (vib) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = vib[0]; lg.gain.value = vib[1] * mult; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + 0.05); }
    p.gain.value = pg; o.connect(p);
    if (lp) { const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = lp; f.Q.value = 0.8; p.connect(f); f.connect(g); } else p.connect(g);
    o.start(t); o.stop(t + dur + 0.05);
  }
}
function noise(start, dur, { gain = 0.1, freq = 2000, q = 1, type = "bandpass", sweepTo = null } = {}) {
  const n = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), t = ctx.currentTime + start;
  s.buffer = buf; f.type = type; f.Q.value = q; f.frequency.setValueAtTime(freq, t);
  if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
  g.gain.value = gain; s.connect(f); f.connect(g); g.connect(out); s.start(t);
}
// a spray of tiny clicks, like embers popping
function crackle(start, dur, { gain = 0.1, rate = 40 } = {}) {
  for (let i = 0; i < Math.max(2, Math.round(dur * rate)); i++) noise(start + Math.random() * dur, 0.02, { gain: gain * (0.5 + Math.random() * 0.7), freq: 500 + Math.random() * 1100, q: 0.7, type: "lowpass" });
}
const bell = (f, start, dur = 0.9, gain = 0.1) => tone(f, start, dur, { gain, attack: 0.003, partials: [[1, 1], [2.01, 0.5], [3.0, 0.25], [4.2, 0.12]] });
const marimba = (f, start, gain = 0.12) => tone(f, start, 0.35, { gain, attack: 0.002, partials: [[1, 1], [4, 0.35]] });
const bubble = (start, f = 450) => { tone(f, start, 0.07, { gain: 0.12, slide: f * 2.6, attack: 0.005 }); noise(start, 0.03, { gain: 0.03, freq: 3000 }); };
const laser = (start, f0 = 1900, f1 = 250, dur = 0.14, gain = 0.09) => tone(f0, start, dur, { type: "square", slide: f1, gain, attack: 0.004 });
// a warm rounded horn: a soft triangle with a quiet octave below and above, slow attack, gentle vibrato.
// (Not a trumpet: sawtooth "trumpets" sounded buzzy and fake.)
const brass = (f, start, dur = 0.2, gain = 0.12) => {
  tone(f, start, dur, { type: "triangle", gain: gain * 1.1, attack: 0.06, vib: [5, f * 0.006], lp: 1700 });
  tone(f * 0.5, start, dur, { gain: gain * 0.4, attack: 0.06 });
  tone(f * 2, start, dur * 0.8, { gain: gain * 0.15, attack: 0.06, lp: 2200 });
};
const gong = (f, start, dur = 1.6, gain = 0.15) => tone(f, start, dur, { gain, attack: 0.005, partials: [[1, 1], [1.5, 0.4], [2.76, 0.3], [5.4, 0.2]] });
// fireballs and explosions
const thud = (start, f = 90, gain = 0.25) => { tone(f, start, 0.28, { gain, slide: f * 0.4, attack: 0.004 }); noise(start, 0.16, { gain: gain * 0.5, freq: 250, type: "lowpass" }); };
const whump = (start, gain = 0.22) => { tone(95, start, 0.32, { gain, slide: 38, attack: 0.01 }); noise(start, 0.3, { gain: gain * 0.7, freq: 300, sweepTo: 1600, type: "lowpass", q: 0.6 }); };
const boom = (start, gain = 0.3) => { tone(75, start, 0.9, { gain, slide: 28, attack: 0.006 }); noise(start, 0.8, { gain: gain * 0.5, freq: 900, sweepTo: 120, type: "lowpass" }); crackle(start + 0.1, 0.6, { gain: 0.07, rate: 30 }); };
// asteroids
const rockhit = (start, gain = 0.16) => { noise(start, 0.06, { gain, freq: 1300, q: 2 }); tone(190, start, 0.1, { gain: gain * 0.9, slide: 70, attack: 0.003 }); };
const flyby = (start, dur = 0.5, gain = 0.13) => { noise(start, dur, { gain, freq: 3200, sweepTo: 450, q: 1.5 }); tone(1300, start, dur, { gain: gain * 0.5, slide: 320 }); };
const rumble = (start, dur = 0.9, gain = 0.16) => { noise(start, dur, { gain, freq: 140, type: "lowpass", q: 0.7 }); for (let i = 0; i < Math.round(dur * 6); i++) thud(start + Math.random() * dur, 60 + Math.random() * 60, 0.09); };
// bubble-gum barbershop: four voices (bass, baritone, lead, tenor) in close harmony, with a little vibrato
const MAJ6 = [0, 7, 16, 21], DOM7 = [0, 7, 16, 22], SUB = [5, 12, 21, 24];
const choir = (root, shape, start, dur = 0.5, gain = 0.06) => shape.forEach((semi, i) => tone(root * Math.pow(1.0595, semi), start, dur, { type: "sawtooth", gain: gain * (i === 3 ? 1.15 : 1), attack: 0.05, vib: [5.5, root * Math.pow(1.0595, semi) * 0.008], lp: 1100 }));
const gumInflate = (start, dur = 0.5, f0 = 300, f1 = 900) => tone(f0, start, dur, { gain: 0.1, slide: f1, vib: [9, 14], attack: 0.03 });
const gumPop = (start) => { noise(start, 0.07, { gain: 0.2, freq: 4500, type: "highpass" }); tone(1800, start, 0.06, { gain: 0.14, slide: 300, attack: 0.002 }); };
const PENT = (d) => [523.25, 587.33, 659.25, 783.99, 880][d % 5] * (d >= 5 ? 2 : 1);
const climb = (s) => Math.pow(1.0595, Math.min(s, 12));

/* ---------- three sound worlds ---------- */
const LIB = {
  fire: {
    // a warm "ember thump": a soft rounded tone that dips a little, a low puff underneath, a different low note for each digit
    tap: (d = 0) => { const f = [165, 196, 220, 262, 294][d % 5] * (d % 10 >= 5 ? 1.5 : 1); tone(f, 0, 0.14, { type: "triangle", gain: 0.3, slide: f * 0.82, attack: 0.004, lp: 1300 }); noise(0, 0.06, { gain: 0.14, freq: 450, type: "lowpass" }); },
    whoosh: () => { noise(0, 0.3, { gain: 0.24, freq: 250, sweepTo: 2600, type: "lowpass", q: 0.6 }); tone(120, 0, 0.3, { gain: 0.14, slide: 400 }); },
    pop: () => { noise(0, 0.1, { gain: 0.18, freq: 700, type: "lowpass" }); tone(140, 0, 0.1, { gain: 0.18, slide: 60 }); crackle(0.03, 0.15, { gain: 0.1, rate: 40 }); },
    correct: (s = 0) => { const b = 294 * climb(s); whump(0); [1, 1.25, 1.5].forEach((r, i) => brass(b * r, 0.08 + i * 0.08, 0.2, 0.12)); crackle(0.05, 0.35, { gain: 0.08, rate: 30 }); },
    whoops: () => { noise(0, 0.45, { gain: 0.14, freq: 700, sweepTo: 250, type: "lowpass" }); tone(220, 0, 0.45, { type: "sawtooth", slide: 70, gain: 0.1, lp: 900 }); tone(330, 0, 0.4, { type: "triangle", slide: 110, gain: 0.12 }); },
    clue: () => { tone(660, 0, 0.18, { type: "triangle", gain: 0.1 }); tone(990, 0.1, 0.22, { type: "triangle", gain: 0.09 }); crackle(0.05, 0.25, { gain: 0.06, rate: 30 }); },
    boing: () => { noise(0, 0.22, { gain: 0.16, freq: 700, sweepTo: 300, type: "lowpass" }); tone(170, 0, 0.22, { slide: 90, gain: 0.2 }); },
    // a soft log "tock" for the timer
    tick: () => { tone(300, 0, 0.07, { type: "triangle", gain: 0.3, slide: 240, attack: 0.003, lp: 1200 }); noise(0, 0.04, { gain: 0.14, freq: 500, type: "lowpass" }); },
    warn: (l = 1) => { for (let i = 0; i <= l; i++) tone(i % 2 ? 820 : 620, i * 0.12, 0.11, { type: "sawtooth", gain: 0.09, lp: 1800 }); },
    streak: () => { [0, 0.16, 0.32].forEach((t, i) => whump(t, 0.16 + i * 0.03)); [0, 1, 2, 3, 4].forEach((i) => brass(330 * Math.pow(1.25, i), 0.1 + i * 0.07, 0.2, 0.1)); crackle(0.1, 0.5, { gain: 0.07, rate: 35 }); },
    buzzer: () => boom(0, 0.34),
    drum: () => { for (let i = 0; i < 10; i++) tone(110 - (i % 2) * 18, i * 0.08, 0.12, { slide: 55, gain: 0.14 + i * 0.012 }); },
    fanfare: () => { whump(0, 0.2); [262, 330, 392, 523, 392, 523, 659].forEach((f, i) => brass(f, 0.1 + i * 0.12, 0.3, 0.13)); crackle(0.1, 0.9, { gain: 0.09, rate: 35 }); noise(0.8, 0.5, { gain: 0.08, freq: 900, sweepTo: 300, type: "lowpass" }); },
    medal: () => { boom(0, 0.2); gong(165, 0.1, 1.8, 0.16); [262, 330, 392, 523].forEach((f, i) => brass(f, 0.25 + i * 0.11, 0.5, 0.11)); crackle(0.3, 1, { gain: 0.08, rate: 40 }); },
    // a warm ember glow, not bright sparkles
    sparkle: () => { crackle(0, 0.25, { gain: 0.14, rate: 30 }); tone(392, 0, 0.2, { type: "triangle", gain: 0.1, slide: 330, attack: 0.01, lp: 1100 }); },
    intro: () => { whump(0, 0.16); crackle(0.05, 0.3, { gain: 0.08, rate: 50 }); [330, 440, 554].forEach((f, i) => brass(f, 0.12 + i * 0.09, 0.22, 0.1)); },
  },
  space: {
    // a warm "sonar blip" with a soft echo and a quiet thud underneath; a different low note for each digit
    tap: (d = 0) => { const f = [220, 247, 294, 330, 392][d % 5] * (d % 10 >= 5 ? 1.5 : 1); tone(f, 0, 0.16, { gain: 0.3, slide: f * 1.12, attack: 0.006, lp: 1400 }); tone(f, 0.1, 0.14, { gain: 0.1, slide: f * 1.12, attack: 0.006, lp: 1400 }); thud(0, 110, 0.08); },
    whoosh: () => flyby(0, 0.35, 0.2),
    pop: () => { rockhit(0, 0.24); thud(0.01, 120, 0.12); },
    correct: (s = 0) => { const b = 523 * climb(s); rockhit(0, 0.1); [1, 1.25, 1.5, 2].forEach((r, i) => { tone(b * r, 0.04 + i * 0.07, 0.12, { type: "square", gain: 0.07 }); tone(b * r, 0.04 + i * 0.07 + 0.14, 0.1, { type: "square", gain: 0.025 }); }); tone(b * 3, 0.34, 0.3, { gain: 0.07, partials: [[1, 1], [2.01, 0.3]] }); },
    whoops: () => { tone(700, 0, 0.55, { type: "sawtooth", slide: 70, gain: 0.09, vib: [9, 25] }); tone(350, 0, 0.55, { slide: 40, gain: 0.12 }); thud(0.3, 80, 0.12); },
    clue: () => { tone(1500, 0, 0.5, { gain: 0.18 }); tone(1500, 0.22, 0.4, { gain: 0.07 }); },
    boing: () => tone(330, 0, 0.35, { slide: 660, gain: 0.2, vib: [14, 40] }),
    tick: () => tone(1250, 0, 0.04, { gain: 0.2 }),
    warn: (l = 1) => { for (let i = 0; i <= l; i++) tone(i % 2 ? 660 : 440, i * 0.14, 0.13, { type: "square", gain: 0.08 }); },
    streak: () => { flyby(0, 0.4, 0.1); [0, 1, 2, 3, 4, 5].forEach((i) => tone(440 * Math.pow(1.189, i), 0.1 + i * 0.06, 0.14, { type: "square", gain: 0.07 })); rockhit(0.5, 0.1); },
    buzzer: () => { thud(0, 70, 0.34); rumble(0.05, 0.7, 0.16); tone(110, 0, 0.7, { type: "sawtooth", slide: 50, gain: 0.1 }); },
    drum: () => { rumble(0, 0.85, 0.2); for (let i = 0; i < 6; i++) thud(0.1 + i * 0.13, 100 - i * 6, 0.1 + i * 0.03); },
    fanfare: () => { flyby(0, 0.5, 0.1); [262, 330, 392, 523, 659, 784, 1046].forEach((f, i) => { tone(f, 0.15 + i * 0.07, 0.2, { type: "square", gain: 0.07 }); tone(f * 1.005, 0.15 + i * 0.07, 0.2, { type: "sawtooth", gain: 0.04 }); }); thud(0.7, 90, 0.16); },
    medal: () => { tone(300, 0, 0.6, { slide: 1800, gain: 0.12, vib: [7, 30] }); [1568, 1976, 2349, 3136].forEach((f, i) => tone(f, 0.5 + i * 0.08, 0.5, { gain: 0.06 })); for (let i = 0; i < 5; i++) rockhit(0.7 + i * 0.07, 0.06); },
    sparkle: () => { for (let i = 0; i < 5; i++) tone(1400 + Math.random() * 2200, i * 0.05, 0.14, { gain: 0.06 }); },
    intro: () => { flyby(0, 0.3, 0.1); [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.15 + i * 0.07, 0.14, { type: "square", gain: 0.06 })); rockhit(0.5, 0.1); },
  },
  candy: {
    tap: (d = 0) => marimba(PENT(d % 10), 0, 0.22),
    whoosh: () => { gumInflate(0, 0.22, 300, 1100); noise(0, 0.15, { gain: 0.03, freq: 6000, type: "highpass" }); },
    pop: () => gumPop(0),
    correct: (s = 0) => { const r = 261.63 * climb(s); choir(r, MAJ6, 0, 0.45, 0.07); [1, 1.25, 1.5, 2].forEach((m, i) => bell(r * 2 * m, 0.1 + i * 0.07, 0.5, 0.08)); },
    whoops: () => { choir(196, MAJ6, 0, 0.3, 0.06); tone(520, 0, 0.28, { type: "triangle", slide: 180, gain: 0.14 }); tone(180, 0.26, 0.2, { type: "triangle", slide: 420, gain: 0.12 }); },
    clue: () => { choir(261.63, MAJ6, 0, 0.5, 0.05); [1319, 1568, 2093].forEach((f, i) => bell(f, 0.1 + i * 0.08, 0.5, 0.06)); },
    boing: () => tone(220, 0, 0.35, { slide: 800, gain: 0.26, vib: [18, 30] }),
    tick: () => tone(650, 0, 0.06, { gain: 0.3, partials: [[1, 1], [3, 0.3]] }),
    warn: (l = 1) => { for (let i = 0; i <= l; i++) choir(i % 2 ? 233 : 262, i % 2 ? SUB : DOM7, i * 0.2, 0.18, 0.07); },
    streak: () => { [261.63, 293.66, 329.63, 392, 440].forEach((r, i) => choir(r, i % 2 ? DOM7 : MAJ6, i * 0.09, 0.22, 0.06)); gumPop(0.5); },
    buzzer: () => { [0, 0.35].forEach((t, i) => shapeSlide(196 / (1 + i * 0.12), t)); },
    drum: () => { for (let i = 0; i < 12; i++) marimba(PENT(i % 5) * 1.5, i * 0.065, 0.1 + i * 0.006); },
    fanfare: () => { choir(196, DOM7, 0, 0.35, 0.07); choir(262, MAJ6, 0.4, 0.9, 0.08); [523, 659, 784, 1046].forEach((f, i) => bell(f, 0.45 + i * 0.07, 0.6, 0.08)); gumInflate(0, 0.38, 300, 1400); gumPop(0.4); },
    medal: () => { choir(131, MAJ6, 0, 1.6, 0.08); choir(262, MAJ6, 0.15, 1.4, 0.05); for (let i = 0; i < 6; i++) bubble(0.3 + i * 0.09, 500 + i * 160); gumPop(0.1); },
    sparkle: () => { for (let i = 0; i < 4; i++) bubble(i * 0.05, 700 + Math.random() * 900); },
    intro: () => { choir(262, DOM7, 0, 0.3, 0.07); choir(349, MAJ6, 0.32, 0.5, 0.07); gumInflate(0.1, 0.28, 400, 1200); gumPop(0.58); },
  },
};
// a sad little "womp" by the quartet, gliding down
function shapeSlide(root, start) { MAJ6.forEach((semi, i) => tone(root * Math.pow(1.0595, semi), start, 0.4, { type: "sawtooth", gain: 0.06, slide: root * Math.pow(1.0595, semi) * 0.75, attack: 0.03, lp: 900 })); }
export const EFFECT_NAMES = Object.keys(LIB.fire);

// For tests: which effects each look defines, and a way to run one without the mute switch.
export const _effectsFor = (l) => Object.keys(LIB[l] || {});
export function _run(name, arg) { LIB[look][name](arg); }

export function play(name, arg) {
  if (muted || !LIB[look][name]) return false;
  if (!unlock()) return false;
  try { LIB[look][name](arg); stats.played++; stats.byName[name] = (stats.byName[name] || 0) + 1; return true; }
  catch { return false; }
}
