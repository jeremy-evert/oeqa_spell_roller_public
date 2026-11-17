// Little surprises for Super Sevens: a cheer for certain facts, rotating fun facts about the table, and a few hidden tricks.
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

// Cheers that work for any table (the ones above are about the 7s).
export const EGGS_ANY = {
  0:  EGGS[0],
  10: { toast: "Times ten? Just add a zero! 🔟", emoji: ["🔟", "🎯", "💯"] },
  12: { toast: "A whole dozen! 🍩", emoji: ["🍩", "🍩", "🥯"] },
};

// One true fact for each table, then facts about multiplying that work for any table.
export const TABLE_FACTS = {
  1: "Anything times 1 stays the same. 1 is the \"do nothing\" number. 🧍",
  2: "2 is the only even prime number. 🔢",
  3: "A triangle has 3 sides and 3 corners. 🔺",
  4: "A square has 4 equal sides. 🟦",
  5: "Your hand has 5 fingers, so counting by 5s is counting hands. ✋",
  6: "An insect has 6 legs. 🐜",
  8: "An octopus has 8 arms and a spider has 8 legs. 🐙",
  9: "A baseball team has 9 players on the field. ⚾",
  10: "We count in tens because most people have 10 fingers. 🔟",
  11: "A soccer team has 11 players on the field. ⚽",
  12: "A dozen is 12, and a year has 12 months. 📅",
  13: "A baker's dozen is 13. 🍩",
  14: "Two weeks is 14 days. 📅",
  15: "Fifteen minutes is a quarter of an hour. ⏰",
  16: "16 is a square number: 4 × 4. 🟦",
  17: "17 is a prime number: only 1 and 17 divide it evenly. 🔢",
  18: "A golf course has 18 holes. ⛳",
  19: "19 is a prime number: only 1 and 19 divide it evenly. 🔢",
  20: "Most people have 20 fingers and toes. 🦶",
};
export const MULTIPLY_FACTS = [
  "Multiplying is repeated adding: 4 × 3 means 3 + 3 + 3 + 3. ➕",
  "Order does not matter: 3 × 8 and 8 × 3 are the same. 🔄",
  "Anything times 0 is 0. 🕳️",
  "An even number times any number is even. 🎲",
  "Counting by a number is the same as going through its times table. 🪜",
  "Dividing is multiplying backwards: if 6 × 4 = 24, then 24 ÷ 4 = 6. ↩️",
];
// The fun facts for a table: the 7s have their own list, every other table gets its own fact plus the general ones.
export const funFactsFor = (t = 7) => (t === 7 ? FUN_FACTS : [TABLE_FACTS[t], ...MULTIPLY_FACTS].filter(Boolean));

export function makeBag(rng = Math.random, list = FUN_FACTS) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
// Take the next fun fact from a bag (refilling it when empty).
export function nextFact(bag, rng = Math.random, list = FUN_FACTS) {
  if (!bag.length) bag.push(...makeBag(rng, list));
  return bag.pop();
}
// A cheer for a correct answer, or null. `n` is the other number in the fact; `t` is the table.
export function eggFor(n, t = 7) {
  if (t === 7) return EGGS[n] || null;
  if (n === t && t >= 2) return { toast: `${t * t}! ${t} times ${t}: ${t} squared!`, emoji: ["🟪", "⭐", "✨"] };
  return EGGS_ANY[n] || null;
}

export const SECRETS = {
  logoTaps: 7,          // tap the 7️⃣✨ in the header 7 times
  logoWindowMs: 4000,
  qmTaps: 3,            // tap the ? in the equation 3 times
  luckyStreak: 7,       // 7 right answers in a row
  factChance: 0.2,
};
