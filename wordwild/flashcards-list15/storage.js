// localStorage wrapper: every call is guarded (private windows and blocked storage must not break the game).
import { blankState, migrate } from "./engine.js";
export const KEY = "wordwild.flashcards.list15.v1";
let memory = null; // fallback when storage is unavailable

export function load(storage = globalThis.localStorage) {
  try {
    const raw = storage.getItem(KEY);
    return migrate(raw ? JSON.parse(raw) : null);
  } catch { return memory ? migrate(memory) : blankState(); }
}
export function save(state, storage = globalThis.localStorage) {
  memory = JSON.parse(JSON.stringify(state));
  try { storage.setItem(KEY, JSON.stringify(state)); return true; } catch { return false; }
}
export function wipe(storage = globalThis.localStorage) {
  memory = null;
  try { storage.removeItem(KEY); } catch { /* ignore */ }
}
