// Little surprises for Super Sevens: a cheer for certain facts, rotating "7 fun facts", and a few hidden tricks.
// Pure data and helpers, so tests can check every claim.

// Shown when a fact is answered correctly. `emoji` is what the confetti turns into.
export const EGGS = {
  0:  { toast: "Weirdo! 🤪 Anything times 0 is 0.", emoji: ["🤪", "0️⃣", "🛸"] },
  1:  { toast: "Simply heaven! ☁️", emoji: ["☁️", "😇", "✨"] },
  2:  { toast: "Nifty keen! 😎", emoji: ["😎", "🆒", "👍"] },
  7:  { toast: "49! Seven sevens: seven squared!", emoji: ["7️⃣", "🟪", "⭐"] },
  8:  { toast: "5, 6, 7, 8! 🕺", emoji: ["5️⃣", "6️⃣", "7️⃣", "8️⃣"] },
  10: { toast: "Times ten? Just add a zero! 🔟", emoji: ["🔟", "🎯", "💯"] },
  11: { toast: "77! Double lucky sevens! 🎰", emoji: ["🎰", "7️⃣", "🍀"] },
  12: { toast: "A whole dozen of sevens! 🍩", emoji: ["🍩", "🍩", "🥯"] },
};

// True facts about seven. Each shows at most once per run until all have been shown.
export const FUN_FACTS = [
  "A rainbow has 7 colors: red, orange, yellow, green, blue, indigo, violet. 🌈",
  "There are 7 days in a week. 📅",
  "Most people count 7 continents on Earth. 🌍",
  "A music scale has 7 notes: do, re, mi, fa, sol, la, ti. 🎵",
  "The seven-spot ladybug is a real bug, and yes, it has 7 spots! 🐞",
  "On a die, opposite sides always add up to 7. 🎲",
  "A heptagon is a shape with 7 sides. ⬟",
  "Seven is a prime number: only 1 and 7 divide it evenly. 🔢",
  "The Seven Wonders of the Ancient World is a famous list of 7 amazing places. 🏛️",
  "Snow White met 7 dwarfs. 🍎",
];

export function makeBag(rng = Math.random) {
  const a = FUN_FACTS.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
// Take the next fun fact from a bag (refilling it when empty).
export function nextFact(bag, rng = Math.random) {
  if (!bag.length) bag.push(...makeBag(rng));
  return bag.pop();
}
export const eggFor = (n) => EGGS[n] || null;

export const SECRETS = {
  logoTaps: 7,          // tap the 7️⃣✨ in the header 7 times
  logoWindowMs: 4000,
  qmTaps: 3,            // tap the ? in the equation 3 times
  luckyStreak: 7,       // 7 right answers in a row
  factChance: 0.2,
};
