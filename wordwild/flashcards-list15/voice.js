// Narration: local Kokoro-generated clips in assets/audio/ (see tools/generate_audio.py).
// Fallback 1: the browser's speechSynthesis (if present). Fallback 2: nothing; the game is fully playable as text.
// Audio is only ever started from a button press. The word is never put in the DOM; clip URLs are built here in JS.
let manifest = null;
let current = null;
export const voiceStats = { clips: 0, fallbackSpeech: 0, failed: 0 };

export async function loadManifest(fetchFn = globalThis.fetch) {
  try {
    const r = await fetchFn("assets/audio/manifest.json");
    manifest = r.ok ? await r.json() : null;
  } catch { manifest = null; }
  return !!manifest;
}
export function hasClips() { return !!manifest; }

export function stop() { try { if (current) { current.pause(); current = null; } globalThis.speechSynthesis?.cancel(); } catch { /* ignore */ } }

function speakFallback(text, rate) {
  const s = globalThis.speechSynthesis;
  if (!s || typeof globalThis.SpeechSynthesisUtterance !== "function") return false;
  try { const u = new SpeechSynthesisUtterance(text); u.lang = "en-US"; u.rate = rate; s.cancel(); s.speak(u); voiceStats.fallbackSpeech++; return true; }
  catch { return false; }
}

/** kind: "word" | "slow" | "sentence". Resolves to "clip" | "speech" | "none". */
export function say(word, sentence, kind = "word") {
  stop();
  const clip = manifest?.clips?.[word]?.[kind];
  return new Promise((resolve) => {
    const fallback = () => {
      const text = kind === "sentence" ? sentence : word;
      const ok = speakFallback(text, kind === "slow" ? 0.6 : 0.9);
      if (!ok) voiceStats.failed++;
      resolve(ok ? "speech" : "none");
    };
    if (!clip || typeof globalThis.Audio !== "function") return fallback();
    try {
      const a = new Audio("assets/audio/" + clip);
      current = a;
      a.addEventListener("error", fallback, { once: true });
      a.addEventListener("ended", () => resolve("clip"), { once: true });
      a.play().then(() => { voiceStats.clips++; }).catch(fallback);
    } catch { fallback(); }
  });
}
