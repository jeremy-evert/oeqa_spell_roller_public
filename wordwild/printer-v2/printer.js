// The little printer: three blueprints with different geometry, five parts each (one part per word in a round).
// Pure data and markup strings. No DOM access, so it is unit-testable. Placeholder shapes only: no finished art.
// Geometry is in a 300 x 300 viewBox. top/bottom are the part's vertical extent (percent of height) and drive the
// bottom-to-top "layer" reveal and the nozzle position.

const rect = (x, y, w, h, fill, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#2a2a3a" stroke-width="3" ${extra}/>`;
const circ = (cx, cy, r, fill) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="#2a2a3a" stroke-width="3"/>`;
const poly = (pts, fill) => `<polygon points="${pts}" fill="${fill}" stroke="#2a2a3a" stroke-width="3" stroke-linejoin="round"/>`;
const pct = (y) => Math.round((y / 300) * 1000) / 10;
const part = (name, top, bottom, svg) => ({ name, top: pct(top), bottom: pct(bottom), svg });

export const BLUEPRINTS = Object.freeze([
  { id: "robot", name: "Wobbly Robot", blurb: "Boxes, bolts and one very loud beep.", parts: [
    part("feet", 258, 286, rect(70, 258, 160, 28, "#6c7a89", 'rx="6"')),
    part("legs", 200, 258, rect(100, 200, 100, 58, "#8aa0b4") + rect(108, 214, 84, 8, "#5b6d7e")),
    part("body", 130, 200, rect(80, 130, 140, 70, "#f0b429", 'rx="8"') + circ(150, 165, 14, "#ef4e4e") + circ(110, 165, 7, "#2fb5a6") + circ(190, 165, 7, "#2fb5a6")),
    part("head", 70, 130, rect(95, 70, 110, 60, "#8bd3dd", 'rx="12"') + circ(127, 98, 10, "#ffffff") + circ(173, 98, 10, "#ffffff") + circ(127, 98, 4, "#2a2a3a") + circ(173, 98, 4, "#2a2a3a")),
    part("antenna", 28, 70, `<line x1="150" y1="70" x2="150" y2="40" stroke="#2a2a3a" stroke-width="5"/>` + circ(150, 34, 9, "#ef4e4e")),
  ] },
  { id: "castle", name: "Tiny Castle", blurb: "Towers, a door, and a flag that flaps.", parts: [
    part("wall", 220, 284, rect(40, 220, 220, 64, "#b8a99a", 'rx="4"') + rect(130, 244, 40, 40, "#6d4c41", 'rx="18"')),
    part("keep", 128, 220, rect(105, 128, 90, 92, "#d7c8b8") + rect(138, 150, 24, 30, "#8bd3dd", 'rx="10"')),
    part("towers", 150, 220, rect(52, 150, 46, 70, "#c9b9a8") + rect(202, 150, 46, 70, "#c9b9a8") + rect(62, 170, 12, 22, "#8bd3dd", 'rx="5"') + rect(226, 170, 12, 22, "#8bd3dd", 'rx="5"')),
    part("roofs", 76, 150, poly("44,150 75,84 106,150", "#ef4e4e") + poly("194,150 225,84 256,150", "#ef4e4e") + poly("105,128 150,76 195,128", "#e86a4b")),
    part("flag", 22, 76, `<line x1="150" y1="76" x2="150" y2="28" stroke="#2a2a3a" stroke-width="5"/>` + poly("150,28 196,42 150,56", "#f0b429")),
  ] },
  { id: "rocket", name: "Bouncy Rocket", blurb: "Round, shiny, and a little bit silly.", parts: [
    part("fins", 214, 284, poly("96,284 96,222 130,262", "#ef4e4e") + poly("204,284 204,222 170,262", "#ef4e4e") + rect(122, 264, 56, 20, "#6c7a89", 'rx="4"')),
    part("lower body", 160, 264, `<path d="M104 264 L104 190 Q104 160 150 160 Q196 160 196 190 L196 264 Z" fill="#f4f1de" stroke="#2a2a3a" stroke-width="3"/>`),
    part("window", 176, 226, circ(150, 200, 24, "#8bd3dd") + circ(150, 200, 12, "#bfeaf0")),
    part("nose", 60, 160, `<path d="M104 160 Q104 90 150 60 Q196 90 196 160 Z" fill="#2fb5a6" stroke="#2a2a3a" stroke-width="3"/>`),
    part("star", 22, 62, poly("150,22 158,44 182,44 163,58 170,82 150,68 130,82 137,58 118,44 142,44", "#f0b429")),
  ] },
]);

export const blueprintById = (id) => BLUEPRINTS.find((b) => b.id === id) ?? BLUEPRINTS[0];

/** Sticker on a finished part. Printing always happens; the sticker is the only scoring signal. */
export function badgeFor(outcome) {
  if (outcome === "independent") return { symbol: "★", label: "Spelled it all by myself" };
  if (outcome === "skipped") return { symbol: "?", label: "Mystery part: skipped for now" };
  return { symbol: "", label: "" };
}

/** Reveal geometry for part i: the clip starts at the part's bottom edge and rises to its top edge. */
export function revealRange(bp, i) { const p = bp.parts[i]; return { from: p.bottom, to: p.top }; }

export class PrinterBuild {
  constructor(blueprintId) { this.bp = blueprintById(blueprintId); this.printed = []; }
  get count() { return this.printed.length; }
  get complete() { return this.printed.length >= this.bp.parts.length; }
  /** Print the next part. Always succeeds; the outcome only decides the sticker. */
  next(outcome) {
    if (this.complete) return null;
    const index = this.printed.length;
    const entry = { index, name: this.bp.parts[index].name, outcome, badge: badgeFor(outcome) };
    this.printed.push(entry);
    return entry;
  }
  get stars() { return this.printed.filter((p) => p.outcome === "independent").length; }
}

/** Markup for the stacked part layers. `animateIndex` marks the layer that is printing right now. */
export function stageMarkup(bp, printed, animateIndex = -1) {
  return bp.parts.map((p, i) => {
    const shown = i < printed.length, anim = i === animateIndex;
    const state = shown && !anim ? "shown" : anim ? "printing" : "hidden";
    const badge = shown ? printed[i].badge : { symbol: "" };
    const sticker = badge.symbol ? `<span class="sticker" style="top:${p.top + (p.bottom - p.top) / 2}%" aria-hidden="true">${badge.symbol}</span>` : "";
    return `<div class="layer ${state}" data-layer="${i}" style="--from:${p.bottom}%;--to:${p.top}%">` +
      `<svg viewBox="0 0 300 300" focusable="false" aria-hidden="true">${p.svg}</svg>${sticker}</div>`;
  }).join("");
}
