// Any times table from 1 to 20, each fact 0 to 20. A fact has a silly question (`q`), the first line of a rhyme or chant (`lead`, shown up
// front with the answer left blank), a `think` hint (a strategy, never the answer) and a `clue` (the full help, answer included).
// In every clue the answer's sound-alike is written in CAPITALS so it stands out.
//
// The 7s are written by hand (HAND7): Jeremy's rhymes for 0 to 4, Flo's for 5 to 20. Every other table is generated from templates
// by `factsOf(t)`, so the hints are always true arithmetic but the rhymes are chants, not poems.
const HAND7 = [
  { n: 0, lead: "0 is always a weird 0 (weirdo).", blank: "Anything times 0 is always ___!", think: "Zero groups of seven. What is left when there is nothing in the groups?", q: "7 pirates each found 0 treasure chests. How many chests in all?",
    clue: "0 is always a weird 0 (WEIRDO). Anything times 0 is always 0." },
  { n: 1, lead: "7 times one is simply heaven.", think: "Only one group of seven. Does it grow, or stay the same?", q: "7 frogs each caught 1 fly. How many flies in all?",
    clue: "7 times one is simply HEAVEN. 7 times one is SEVEN!" },
  { n: 2, lead: "7 times two is nifty keen.", think: "Two groups of seven is a double. What is double 7?", q: "7 llamas each wear 2 hats. How many hats in all?",
    clue: "7 times two is nifty KEEN. 7 times 2 is fourteen (FOURTEEN, nifty KEEN)!" },
  { n: 3, lead: "7 times 3 is always fun.", think: "Count by 7s: 7, 14, and then one more jump.", q: "7 dragons each juggle 3 flaming pickles. How many pickles in all?",
    clue: "7 times 3 is always FUN. 7 times 3 is twenty-ONE!" },
  { n: 4, lead: "7 and 4 went on a date.", think: "4 is double 2, and 2 sevens is 14. Now double that.", q: "7 ducks each carry 4 umbrellas. How many umbrellas in all?",
    clue: "7 and 4 went on a DATE. 7 times 4 is 28 (twentyeIGHT)." },
  { n: 5, lead: "7 times 5 helps us thrive.", think: "5 is half of 10, and 10 sevens is 70. Take half.", q: "7 astronauts each pack 5 tacos. How many tacos in all?",
    clue: "7 times 5 helps us thrive. 7 times 5 is thirty-FIVE!" },
  { n: 6, lead: "7 times 6 is quite a view.", think: "6 is one more than 5. 5 sevens is 35. Add one more seven.", q: "7 beetles have 6 legs each. How many legs in all?",
    clue: "7 times 6 is quite a view. 7 times 6 is forty-TWO!" },
  { n: 7, lead: "7 times 7 is feeling fine.", think: "Seven sevens! You know 6 sevens is 42. Add one more seven.", q: "7 wizards each cast 7 spells. How many spells in all?",
    clue: "7 times 7 is feeling fine. 7 times 7 is forty-NINE!" },
  { n: 8, lead: "7 times 8 is simply great.", think: "8 is 2 less than 10. 10 sevens is 70, and 2 sevens is 14. Take 14 away from 70.", q: "7 octopuses have 8 arms each. How many arms in all?",
    clue: "7 times 8 is simply great: count FIVE, SIX, SEVEN, EIGHT. It is fifty-six!" },
  { n: 9, lead: "7 times 9, up a tree.", think: "9 is 1 less than 10. 10 sevens is 70. Take away one seven.", q: "7 cats each have 9 lives. How many lives in all?",
    clue: "7 times 9, up a tree. 7 times 9 is sixty-THREE (sixty-TREE)!" },
  { n: 10, lead: "7 times 10, here we go again.", think: "Ten groups: just put a zero on the end of 7.", q: "7 monkeys each eat 10 bananas. How many bananas in all?",
    clue: "7 times 10, here we go again. Add a zero: SEVENTY!" },
  { n: 11, lead: "7 times 11, look twice!", think: "11 is 10 plus 1. 10 sevens is 70. Add one more seven.", q: "7 soccer teams have 11 players each. How many players in all?",
    clue: "7 times 11, look twice! Seven-seven, double SEVENS, how nice: seventy-seven!" },
  { n: 12, lead: "7 times 12 is at the door.", think: "12 is 10 plus 2. 10 sevens is 70, and 2 sevens is 14. Put them together.", q: "7 boxes hold 12 donuts each (a dozen). How many donuts in all?",
    clue: "7 times 12 is at the door. 7 times 12 is eighty-FOUR!" },
  { n: 13, lead: "Unlucky 13? No way!", think: "13 is 10 plus 3. 10 sevens is 70, and 3 sevens is 21. Put them together.", q: "7 bakers each bake a baker's dozen, 13 cupcakes. How many cupcakes in all?",
    clue: "Unlucky 13? No way! 7 times 13 is ninety-ONE, hooray!" },
  { n: 14, lead: "7 times 14, don't be late.", think: "14 is 10 plus 4. 10 sevens is 70, and 4 sevens is 28. Put them together.", q: "7 unicorns each wear 14 rainbow ribbons. How many ribbons in all?",
    clue: "7 times 14, don't be late. 7 times 14 is ninety-EIGHT!" },
  { n: 15, lead: "Fifteen sevens, jump and dive.", think: "15 is 10 plus 5. 10 sevens is 70, and 5 sevens is 35. Put them together.", q: "7 ninjas each throw 15 pillows. How many pillows in all?",
    clue: "Fifteen sevens, jump and dive: one hundred five (FIVE)!" },
  { n: 16, lead: "Sweet sixteen, a real treat.", think: "16 is 10 plus 6. 10 sevens is 70, and 6 sevens is 42. Put them together.", q: "7 knights each carry 16 shields. How many shields in all?",
    clue: "Sweet sixteen, a real treat: one hundred twelve (TWELVE) can't be beat!" },
  { n: 17, lead: "7 times 17 is almost one-twenty.", think: "17 is 3 less than 20. 20 sevens is 140, and 3 sevens is 21. Take 21 away from 140.", q: "7 robots each wear 17 hats. How many hats in all?",
    clue: "7 times 17 is almost one-twenty. One hundred nineteen (NINETEEN), that's plenty!" },
  { n: 18, lead: "7 times 18, golf clubs and sticks.", think: "18 is 2 less than 20. 20 sevens is 140, and 2 sevens is 14. Take 14 away from 140.", q: "7 golf courses have 18 holes each. How many holes in all?",
    clue: "7 times 18, golf clubs and sticks: it's one hundred twenty-SIX!" },
  { n: 19, lead: "7 times 19, wait and see.", think: "19 is 1 less than 20. 20 sevens is 140. Take away one seven.", q: "7 sharks each lose 19 teeth. How many teeth in all?",
    clue: "7 times 19, wait and see: one hundred thirty-THREE!" },
  { n: 20, lead: "7 times 20, that's a score.", think: "20 is double 10. 10 sevens is 70. Now double that.", q: "7 kids each have 20 fingers and toes. How many in all?",
    clue: "7 times 20, that's a score: one hundred forty (FORTY), no less, no more!" },
];

export const TABLES = Array.from({ length: 20 }, (_, i) => i + 1);

const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
// 0 to 999 in words: "forty-two", "one hundred five".
export function numberWords(n) {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : "");
  const h = `${ONES[Math.floor(n / 100)]} hundred`;
  return n % 100 ? `${h} ${numberWords(n % 100)}` : h;
}
const shout = (w) => w.replace(/([a-z]+)$/, (m) => m.toUpperCase());
// "Super Sevens", "Super Sixes", "Super Twenties".
export const tableName = (t) => { const w = ONES[t] || TENS[t / 10], cap = w[0].toUpperCase() + w.slice(1); return cap.endsWith("x") ? cap + "es" : cap.endsWith("y") ? cap.slice(0, -1) + "ies" : cap + "s"; };

// [one, many, verb for many, verb for one, thing, things]
const SCENES = [
  ["pirate", "pirates", "find", "finds", "treasure chest", "treasure chests"], ["frog", "frogs", "catch", "catches", "fly", "flies"],
  ["llama", "llamas", "wear", "wears", "hat", "hats"], ["dragon", "dragons", "juggle", "juggles", "flaming pickle", "flaming pickles"],
  ["duck", "ducks", "carry", "carries", "umbrella", "umbrellas"], ["astronaut", "astronauts", "pack", "packs", "taco", "tacos"],
  ["beetle", "beetles", "polish", "polishes", "tiny shoe", "tiny shoes"], ["wizard", "wizards", "cast", "casts", "spell", "spells"],
  ["octopus", "octopuses", "collect", "collects", "shell", "shells"], ["cat", "cats", "hide", "hides", "sock", "socks"],
  ["monkey", "monkeys", "eat", "eats", "banana", "bananas"], ["panda", "pandas", "hug", "hugs", "balloon", "balloons"],
  ["baker", "bakers", "bake", "bakes", "cupcake", "cupcakes"], ["unicorn", "unicorns", "wear", "wears", "rainbow ribbon", "rainbow ribbons"],
  ["ninja", "ninjas", "throw", "throws", "pillow", "pillows"], ["knight", "knights", "carry", "carries", "shield", "shields"],
  ["shark", "sharks", "lose", "loses", "tooth", "teeth"], ["mermaid", "mermaids", "collect", "collects", "pearl", "pearls"],
  ["penguin", "penguins", "roll", "rolls", "snowball", "snowballs"], ["alien", "aliens", "borrow", "borrows", "moon rock", "moon rocks"],
  ["dinosaur", "dinosaurs", "steal", "steals", "cookie", "cookies"],
];
const CHANTS = ["Here we go: {t} times {m}!", "Ready, set: {t} times {m}!", "Look out, here comes {t} times {m}!", "{t} times {m}, give it a go!", "Can you do {t} times {m}? Yes you can!", "Roll the drums for {t} times {m}!"];
const SHOUTS = ["Say it loud:", "Roll the drums:", "Ta-da!", "Here it is:"];

// A strategy for t x m that uses easy anchors (10s, 20s, doubles, halves) and never states the answer.
function thinkFor(t, m) {
  const s = `${t}s`;
  if (m === 0) return `Zero groups of ${t}. What is left when there is nothing in the groups?`;
  if (m === 1) return `Only one group of ${t}. Does it grow, or stay the same?`;
  if (t === 1) return "Each group holds just 1. Count the groups.";
  if (t === 2) return `Two in every group. Double ${m}: what is ${m} + ${m}?`;
  if (t === 10) return `Count by 10s, or put a zero on the end of ${m}.`;
  if (m === 2) return `Two groups of ${t} is a double. What is double ${t}?`;
  if (m === 3) return `Count by ${s}: ${t}, ${2 * t}, and then one more jump.`;
  if (m === 4) return `4 is double 2, and 2 ${s} is ${2 * t}. Now double that.`;
  if (m === 5) return `5 is half of 10, and 10 ${s} is ${10 * t}. Take half.`;
  if (m === 6) return `6 is one more than 5. 5 ${s} is ${5 * t}. Add one more ${t}.`;
  if (m === 7) return `7 is 5 plus 2. 5 ${s} is ${5 * t}, and 2 ${s} is ${2 * t}. Put them together.`;
  if (m === 8) return `8 is double 4. 4 ${s} is ${4 * t}. Now double that.`;
  if (m === 9) return `9 is 1 less than 10. 10 ${s} is ${10 * t}. Take away one ${t}.`;
  if (m === 10) return `Ten groups: just put a zero on the end of ${t}.`;
  if (m === 11) return `11 is 10 plus 1. 10 ${s} is ${10 * t}. Add one more ${t}.`;
  if (m <= 16) return `${m} is 10 plus ${m - 10}. 10 ${s} is ${10 * t}, and ${m - 10} ${s} is ${(m - 10) * t}. Put them together.`;
  if (m === 19) return `19 is 1 less than 20. 20 ${s} is ${20 * t}. Take away one ${t}.`;
  if (m === 20) return `20 is double 10. 10 ${s} is ${10 * t}. Now double that.`;
  return `${m} is ${20 - m} less than 20. 20 ${s} is ${20 * t}, and ${20 - m} ${s} is ${(20 - m) * t}. Take ${(20 - m) * t} away from ${20 * t}.`;
}

function makeFact(t, m) {
  const a = t * m, W = shout(numberWords(a));
  const [one, many, vMany, vOne, thing, things] = SCENES[(m + 4 * t) % SCENES.length];
  const base = { t, n: m, a, think: thinkFor(t, m),
    q: `${t} ${t === 1 ? one : many} each ${t === 1 ? vOne : vMany} ${m} ${m === 1 ? thing : things}. How many ${things} in all?` };
  if (m === 0) return { ...base, lead: HAND7[0].lead, blank: HAND7[0].blank, clue: `0 is always a weird 0 (WEIRDO). Anything times 0 is always ${W}!` };
  return { ...base, lead: CHANTS[(m + t) % CHANTS.length].replace("{t}", t).replace("{m}", m), clue: `${SHOUTS[(t + m) % SHOUTS.length]} ${t} times ${m} is ${W}!` };
}

const cache = new Map();
// All 21 facts (0 to 20) for a times table.
export function factsOf(t) {
  if (!Number.isInteger(t) || t < 1 || t > 20) throw new RangeError(`no times table ${t}`);
  if (!cache.has(t)) cache.set(t, Array.from({ length: 21 }, (_, m) => (t === 7 ? { ...HAND7[m], t, a: 7 * m } : makeFact(t, m))));
  return cache.get(t);
}
export const FACTS = factsOf(7);

// Which facts are in play: 0 to 12 (the classic table) or 0 to 20.
export const RANGES = [
  { max: 12, label: "0 to 12", sub: "13 facts" },
  { max: 20, label: "0 to 20", sub: "21 facts" },
];

// Medal challenges: every fact in the range answered correctly before the clock runs out.
// More facts get more time, at about the same seconds per fact.
export const MEDALS = [
  { id: "bronze", label: "Bronze", icon: "🥉", seconds: { 12: 90, 20: 150 } },
  { id: "silver", label: "Silver", icon: "🥈", seconds: { 12: 75, 20: 120 } },
  { id: "gold",   label: "Gold",   icon: "🥇", seconds: { 12: 60, 20: 90 } },
];

// Three looks for the same game.
export const THEMES = [
  { id: "fire",  label: "Fire",  icon: "🔥" },
  { id: "space", label: "Space", icon: "🚀" },
  { id: "candy", label: "Candy", icon: "🍭" },
];
