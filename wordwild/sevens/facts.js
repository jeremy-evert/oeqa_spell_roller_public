// The 7s times table, 7 x 0 through 7 x 20. Each fact has a silly question, a `think` hint (a strategy,
// never the answer) and a `clue` (the full help).
// In every clue the answer's sound-alike is written in CAPITALS so it stands out.
export const FACTS = [
  { n: 0, think: "Zero groups of seven. What is left when there is nothing in the groups?", q: "7 pirates each found 0 treasure chests. How many chests in all?",
    clue: "0 is always a weird 0 (WEIRDO). Anything times 0 is always 0." },
  { n: 1, think: "Only one group of seven. Does it grow, or stay the same?", q: "7 frogs each caught 1 fly. How many flies in all?",
    clue: "7 times one is simply HEAVEN. 7 times one is SEVEN!" },
  { n: 2, think: "Two groups of seven is a double. What is double 7?", q: "7 llamas each wear 2 hats. How many hats in all?",
    clue: "7 times two is nifty KEEN. 7 times 2 is fourteen (FOURTEEN, nifty KEEN)!" },
  { n: 3, think: "Count by 7s: 7, 14, and then one more jump.", q: "7 dragons each juggle 3 flaming pickles. How many pickles in all?",
    clue: "7 times 3 is always FUN. 7 times 3 is twenty-ONE!" },
  { n: 4, think: "4 is double 2, and 2 sevens is 14. Now double that.", q: "7 ducks each carry 4 umbrellas. How many umbrellas in all?",
    clue: "7 and 4 went on a DATE. 7 times 4 is 28 (twentyeIGHT)." },
  { n: 5, think: "5 is half of 10, and 10 sevens is 70. Take half.", q: "7 astronauts each pack 5 tacos. How many tacos in all?",
    clue: "7 times 5 helps us thrive. 7 times 5 is thirty-FIVE!" },
  { n: 6, think: "6 is one more than 5. 5 sevens is 35. Add one more seven.", q: "7 beetles have 6 legs each. How many legs in all?",
    clue: "7 times 6 is quite a view. 7 times 6 is forty-TWO!" },
  { n: 7, think: "Seven sevens! You know 6 sevens is 42. Add one more seven.", q: "7 wizards each cast 7 spells. How many spells in all?",
    clue: "7 times 7 is feeling fine. 7 times 7 is forty-NINE!" },
  { n: 8, think: "8 is 2 less than 10. 10 sevens is 70, and 2 sevens is 14. Take 14 away from 70.", q: "7 octopuses have 8 arms each. How many arms in all?",
    clue: "7 times 8 is simply great: count FIVE, SIX, SEVEN, EIGHT. It is fifty-six!" },
  { n: 9, think: "9 is 1 less than 10. 10 sevens is 70. Take away one seven.", q: "7 cats each have 9 lives. How many lives in all?",
    clue: "7 times 9, up a tree. 7 times 9 is sixty-THREE (sixty-TREE)!" },
  { n: 10, think: "Ten groups: just put a zero on the end of 7.", q: "7 monkeys each eat 10 bananas. How many bananas in all?",
    clue: "7 times 10, here we go again. Add a zero: SEVENTY!" },
  { n: 11, think: "11 is 10 plus 1. 10 sevens is 70. Add one more seven.", q: "7 soccer teams have 11 players each. How many players in all?",
    clue: "7 times 11, look twice! Seven-seven, double SEVENS, how nice: seventy-seven!" },
  { n: 12, think: "12 is 10 plus 2. 10 sevens is 70, and 2 sevens is 14. Put them together.", q: "7 boxes hold 12 donuts each (a dozen). How many donuts in all?",
    clue: "7 times 12 is at the door. 7 times 12 is eighty-FOUR!" },
  { n: 13, think: "13 is 10 plus 3. 10 sevens is 70, and 3 sevens is 21. Put them together.", q: "7 bakers each bake a baker's dozen, 13 cupcakes. How many cupcakes in all?",
    clue: "Unlucky 13? No way! 7 times 13 is ninety-ONE, hooray!" },
  { n: 14, think: "14 is 10 plus 4. 10 sevens is 70, and 4 sevens is 28. Put them together.", q: "7 unicorns each wear 14 rainbow ribbons. How many ribbons in all?",
    clue: "7 times 14, don't be late. 7 times 14 is ninety-EIGHT!" },
  { n: 15, think: "15 is 10 plus 5. 10 sevens is 70, and 5 sevens is 35. Put them together.", q: "7 ninjas each throw 15 pillows. How many pillows in all?",
    clue: "Fifteen sevens, jump and dive: one hundred five (FIVE)!" },
  { n: 16, think: "16 is 10 plus 6. 10 sevens is 70, and 6 sevens is 42. Put them together.", q: "7 knights each carry 16 shields. How many shields in all?",
    clue: "Sweet sixteen, a real treat: one hundred twelve (TWELVE) can't be beat!" },
  { n: 17, think: "17 is 3 less than 20. 20 sevens is 140, and 3 sevens is 21. Take 21 away from 140.", q: "7 robots each wear 17 hats. How many hats in all?",
    clue: "7 times 17 is almost one-twenty. One hundred nineteen (NINETEEN), that's plenty!" },
  { n: 18, think: "18 is 2 less than 20. 20 sevens is 140, and 2 sevens is 14. Take 14 away from 140.", q: "7 golf courses have 18 holes each. How many holes in all?",
    clue: "7 times 18, golf clubs and sticks: it's one hundred twenty-SIX!" },
  { n: 19, think: "19 is 1 less than 20. 20 sevens is 140. Take away one seven.", q: "7 sharks each lose 19 teeth. How many teeth in all?",
    clue: "7 times 19, wait and see: one hundred thirty-THREE!" },
  { n: 20, think: "20 is double 10. 10 sevens is 70. Now double that.", q: "7 kids each have 20 fingers and toes. How many in all?",
    clue: "7 times 20, that's a score: one hundred forty (FORTY), no less, no more!" },
].map((f) => ({ ...f, a: 7 * f.n }));

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
