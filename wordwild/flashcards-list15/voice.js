// List 15: use only recorded Kokoro audio. NEVER replace a missing clip with browser TTS.
let manifest = null;
let current = null;
export const voiceStats = { clips: 0, fallbackSpeech: 0, failed: 0 };

function validManifest(data) {
  if (!data || !String(data.engine).toLowerCase().includes("kokoro") || data.voice !== "af_heart") return false;
  const clips = data.clips;
  if (!clips || typeof clips !== "object" || Object.keys(clips).length !== 20) return false;
  return Object.values(clips).every(row =>
    ["word", "slow", "sentence"].every(kind =>
      typeof row?.[kind] === "string" && /^[a-z0-9_]+\.mp3$/.test(row[kind])));
}

export async function loadManifest(fetchFn = globalThis.fetch) {
  try {
    const r = await fetchFn("assets/audio/manifest.json");
    const data = r.ok ? await r.json() : null;
    manifest = validManifest(data) ? data : null;
  } catch { manifest = null; }
  return !!manifest;
}
export function hasClips() { return !!manifest; }

export function stop() {
  try { if (current) current.pause(); } catch { /* ignore */ }
  current = null;
}

/** Returns "clip" on completed playback, or "none" if missing/error/blocked. Never browser synthesis. */
export function say(word, _sentence, kind = "word") {
  stop();
  const clip = manifest?.clips?.[word]?.[kind];
  return new Promise(resolve => {
    if (!clip || typeof globalThis.Audio !== "function") {
      voiceStats.failed++;
      resolve("none");
      return;
    }
    try {
      const a = new Audio("assets/audio/" + clip);
      current = a;
      let settled = false;
      const done = outcome => {
        if (settled) return;
        settled = true;
        if (outcome === "clip") voiceStats.clips++;
        else voiceStats.failed++;
        resolve(outcome);
      };
      a.addEventListener("error", () => done("none"), { once: true });
      a.addEventListener("ended", () => done("clip"), { once: true });
      a.play().catch(() => done("none"));
    } catch { voiceStats.failed++; resolve("none"); }
  });
}
