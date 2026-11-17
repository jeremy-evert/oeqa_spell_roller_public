// A tiny confetti cannon on a full-screen canvas. No libraries. Skipped for people who ask for reduced motion.
export function createConfetti(canvas) {
  const c = canvas.getContext("2d");
  let parts = [], raf = 0, look = { colors: ["#ff4d00", "#ffb703"], emoji: ["⭐"] };
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MAX = 450;
  const stats = { launched: 0 };

  function size() {
    const r = devicePixelRatio || 1;
    canvas.width = Math.floor(innerWidth * r); canvas.height = Math.floor(innerHeight * r);
    c.setTransform(r, 0, 0, r, 0, 0);
  }
  size(); addEventListener("resize", size);

  function frame() {
    c.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter((p) => p.y < innerHeight + 40 && p.life > 0);
    for (const p of parts) {
      p.vy += 0.16; p.vx *= 0.992; p.vy *= 0.992; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
      c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.globalAlpha = Math.min(1, p.life / 40);
      if (p.emoji) { c.font = `${p.size * 2}px serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(p.emoji, 0, 0); }
      else { c.fillStyle = p.color; c.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); }
      c.restore();
    }
    raf = parts.length ? requestAnimationFrame(frame) : 0;
    if (!parts.length) c.clearRect(0, 0, innerWidth, innerHeight);
  }
  function add(p) { if (parts.length < MAX) { parts.push(p); stats.launched++; } }
  function go() { if (!raf && parts.length) raf = requestAnimationFrame(frame); }

  return {
    stats,
    count: () => parts.length,
    setLook(l) { look = l; },
    // a burst from a point; angle is in radians (up is -PI/2)
    burst(x, y, n = 40, { angle = -Math.PI / 2, spread = Math.PI * 0.9, power = 11, emojiShare = 0.25 } = {}) {
      if (reduce()) return;
      for (let i = 0; i < n; i++) {
        const a = angle + (Math.random() - 0.5) * spread, v = power * (0.45 + Math.random() * 0.75);
        const useEmoji = Math.random() < emojiShare;
        add({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
              size: 7 + Math.random() * 8, color: look.colors[(Math.random() * look.colors.length) | 0],
              emoji: useEmoji ? look.emoji[(Math.random() * look.emoji.length) | 0] : null, life: 110 + Math.random() * 90 });
      }
      go();
    },
    // confetti falling from the top of the screen
    rain(n = 120) {
      if (reduce()) return;
      for (let i = 0; i < n; i++) {
        setTimeout(() => {
          add({ x: Math.random() * innerWidth, y: -20, vx: (Math.random() - 0.5) * 2, vy: 1 + Math.random() * 3, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
                size: 7 + Math.random() * 8, color: look.colors[(Math.random() * look.colors.length) | 0],
                emoji: Math.random() < 0.2 ? look.emoji[(Math.random() * look.emoji.length) | 0] : null, life: 260 });
          go();
        }, Math.random() * 1600);
      }
    },
    // the big one: cannons from both bottom corners, then rain
    finale() {
      if (reduce()) return;
      this.burst(0, innerHeight, 90, { angle: -Math.PI / 3, spread: 0.9, power: 17 });
      this.burst(innerWidth, innerHeight, 90, { angle: (-2 * Math.PI) / 3, spread: 0.9, power: 17 });
      setTimeout(() => this.burst(innerWidth / 2, innerHeight, 80, { spread: 1.3, power: 18 }), 350);
      this.rain(140);
    },
    clear() { parts = []; c.clearRect(0, 0, innerWidth, innerHeight); },
  };
}
