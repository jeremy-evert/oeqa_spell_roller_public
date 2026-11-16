// Original sound effects, synthesized live with the Web Audio API (oscillators, noise, envelopes). No audio files.
// The AudioContext is created only after a user gesture (browsers gate autoplay), and everything respects `muted`.
let ctx = null;
let muted = false;
export const sfxStats = { played: 0, byName: {} }; // lets tests prove effects really fired

export function setMuted(v) { muted = !!v; }
export function isMuted() { return muted; }
export function unlock() {
  try {
    if (!ctx) { const AC = globalThis.AudioContext || globalThis.webkitAudioContext; if (AC) ctx = new AC(); }
    if (ctx && ctx.state === "suspended") ctx.resume();
  } catch { ctx = null; }
  return !!ctx;
}

function note(freq, start, dur, { type = "sine", gain = 0.18, slideTo = null } = {}) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, ctx.currentTime + start);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + start + dur);
  g.gain.setValueAtTime(0.0001, ctx.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + start + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
  o.connect(g).connect(ctx.destination); o.start(ctx.currentTime + start); o.stop(ctx.currentTime + start + dur + 0.05);
}
function noise(start, dur, { gain = 0.12, freq = 2000 } = {}) {
  const n = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = buf; f.type = "bandpass"; f.frequency.value = freq; g.gain.value = gain;
  s.connect(f).connect(g).connect(ctx.destination); s.start(ctx.currentTime + start);
}

const EFFECTS = {
  // card flip: a quick whoosh and a soft click
  flip: () => { noise(0, 0.12, { gain: 0.1, freq: 3000 }); note(520, 0.09, 0.06, { type: "triangle", gain: 0.1 }); },
  // button pop
  pop: () => { note(300, 0, 0.09, { type: "sine", slideTo: 900, gain: 0.2 }); },
  // correct: happy rising arpeggio
  correct: () => { [523, 659, 784, 1046].forEach((f, i) => note(f, i * 0.09, 0.2, { type: "triangle", gain: 0.2 })); },
  // whoops: slide-whistle down plus a boing
  whoops: () => { note(520, 0, 0.35, { type: "sawtooth", slideTo: 140, gain: 0.12 }); note(90, 0.32, 0.18, { type: "square", gain: 0.1 }); },
  // celebration fanfare for finishing a round
  fanfare: () => { [392, 523, 659, 784, 659, 784, 1046].forEach((f, i) => note(f, i * 0.11, 0.22, { type: "square", gain: 0.12 }));
                   noise(0.7, 0.4, { gain: 0.08, freq: 6000 }); },
  // little tick when a hint is used
  hint: () => { note(880, 0, 0.07, { type: "sine", gain: 0.14 }); note(1320, 0.08, 0.1, { type: "sine", gain: 0.12 }); },
  // sneaky boing for skip
  boing: () => { note(200, 0, 0.3, { type: "sine", slideTo: 600, gain: 0.18 }); },
};
export const EFFECT_NAMES = Object.keys(EFFECTS);

export function play(name) {
  if (muted || !EFFECTS[name]) return false;
  if (!unlock()) return false;
  try { EFFECTS[name](); sfxStats.played++; sfxStats.byName[name] = (sfxStats.byName[name] || 0) + 1; return true; }
  catch { return false; }
}
