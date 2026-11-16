// Sound for Printer v2.
//  1. Narration: pre-rendered local Kokoro `af_heart` clips only. There is deliberately NO speechSynthesis fallback:
//     if a clip is missing the game stays fully playable as text and says so.
//  2. Effects: small original Web Audio sounds, quiet by default, created only after a user gesture.
// One Mute switch silences both immediately; Stop silences narration immediately.

export class Narrator {
  constructor({ fetchFn = globalThis.fetch?.bind(globalThis), AudioCtor = globalThis.Audio, base = "assets/audio/" } = {}) {
    this.fetchFn = fetchFn; this.AudioCtor = AudioCtor; this.base = base;
    this.manifest = null; this.current = null; this.muted = false;
    this.stats = { clips: 0, failed: 0, stopped: 0, missing: 0 };
  }
  async load() {
    try { const r = await this.fetchFn(this.base + "manifest.json"); this.manifest = r.ok ? await r.json() : null; }
    catch { this.manifest = null; }
    return !!this.manifest;
  }
  /** kind: "word" | "slow" | "sentence" (key = word), or "narration" (key = joke id). */
  path(kind, key) {
    const m = this.manifest; if (!m) return null;
    if (kind === "narration") return m.narration?.[key] ?? null;
    return m.words?.[key]?.[kind] ?? null;
  }
  has(kind, key) { return !!this.path(kind, key); }
  isPlaying() { return !!this.current && !this.current.paused && !this.current.ended; }
  setMuted(v) { this.muted = !!v; if (this.muted) this.stop(); }
  stop() { try { if (this.current) { this.current.pause(); this.current = null; this.stats.stopped++; } } catch { /* ignore */ } }
  /** Resolves to "clip" | "missing" | "muted" | "failed". Never starts anything on its own: call from a button. */
  play(kind, key) {
    this.stop();
    if (this.muted) return Promise.resolve("muted");
    const p = this.path(kind, key);
    if (!p || typeof this.AudioCtor !== "function") { this.stats.missing++; return Promise.resolve("missing"); }
    return new Promise((resolve) => {
      try {
        const a = new this.AudioCtor(this.base + p); a.volume = 0.9; this.current = a;
        a.addEventListener("ended", () => { if (this.current === a) this.current = null; resolve("clip"); }, { once: true });
        a.addEventListener("error", () => { this.stats.failed++; resolve("failed"); }, { once: true });
        a.play().then(() => { this.stats.clips++; }).catch(() => { this.stats.failed++; resolve("failed"); });
      } catch { this.stats.failed++; resolve("failed"); }
    });
  }
}

// ---- effects ------------------------------------------------------------------------------------------------
let ctx = null, master = null, muted = false;
export const sfxStats = { played: 0, byName: {} };
export function setSfxMuted(v) { muted = !!v; }
export function unlock() {
  try {
    if (!ctx) { const AC = globalThis.AudioContext || globalThis.webkitAudioContext; if (AC) { ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.6; master.connect(ctx.destination); } }
    if (ctx && ctx.state === "suspended") ctx.resume();
  } catch { ctx = null; }
  return !!ctx;
}
function note(freq, start, dur, { type = "sine", gain = 0.16, slideTo = null } = {}) {
  const o = ctx.createOscillator(), g = ctx.createGain(), t0 = ctx.currentTime + start;
  o.type = type; o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(master); o.start(t0); o.stop(t0 + dur + 0.05);
}
function noise(start, dur, { gain = 0.1, freq = 2000 } = {}) {
  const n = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = buf; f.type = "bandpass"; f.frequency.value = freq; g.gain.value = gain; s.connect(f).connect(g).connect(master); s.start(ctx.currentTime + start);
}
const EFFECTS = {
  pop: () => note(300, 0, 0.09, { slideTo: 900, gain: 0.16 }),
  correct: () => [523, 659, 784, 1046].forEach((f, i) => note(f, i * 0.09, 0.2, { type: "triangle", gain: 0.16 })),
  whoops: () => { note(520, 0, 0.3, { type: "sawtooth", slideTo: 160, gain: 0.09 }); note(90, 0.28, 0.16, { type: "square", gain: 0.07 }); },
  hint: () => { note(880, 0, 0.07, { gain: 0.12 }); note(1320, 0.08, 0.1, { gain: 0.1 }); },
  boing: () => note(200, 0, 0.3, { slideTo: 600, gain: 0.14 }),
  fanfare: () => { [392, 523, 659, 784, 659, 784, 1046].forEach((f, i) => note(f, i * 0.11, 0.22, { type: "square", gain: 0.09 })); noise(0.7, 0.4, { gain: 0.06, freq: 6000 }); },
  // printer: a soft stepped whirr while the layers rise, then a friendly clunk and a ding
  print: () => { for (let i = 0; i < 8; i++) note(180 + i * 18, i * 0.17, 0.12, { type: "square", gain: 0.04 }); noise(0, 1.4, { gain: 0.03, freq: 900 }); },
  clunk: () => { note(110, 0, 0.12, { type: "square", gain: 0.1 }); note(1568, 0.1, 0.25, { type: "triangle", gain: 0.1 }); },
  sputter: () => { noise(0, 0.25, { gain: 0.07, freq: 500 }); note(140, 0, 0.2, { type: "sawtooth", slideTo: 70, gain: 0.07 }); },
  thumb: () => { note(660, 0, 0.08, { type: "triangle", gain: 0.13 }); note(990, 0.07, 0.14, { type: "triangle", gain: 0.12 }); },
};
export const EFFECT_NAMES = Object.keys(EFFECTS);
export function play(name) {
  if (muted || !EFFECTS[name]) return false;
  if (!unlock()) return false;
  try { EFFECTS[name](); sfxStats.played++; sfxStats.byName[name] = (sfxStats.byName[name] || 0) + 1; return true; } catch { return false; }
}
