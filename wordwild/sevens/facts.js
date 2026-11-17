// The 7s times table, 7 x 0 through 7 x 20. Each fact has a silly question, a `think` hint (a strategy,
// never the answer) and a `clue` (the full help).
// In every clue the answer's sound-alike is written in CAPITALS so it stands out.
export const FACTS = [
  { n: 0, think: "Zero groups of seven. What is left when there is nothing in the groups?", q: "7 pirates each found 0 treasure chests. How many chests in all?",
    clue: "Seven pirates, ZERO chests. Anything times zero is ZERO!" },
  { n: 1, think: "Only one group of seven. Does it grow, or stay the same?", q: "7 frogs each caught 1 fly. How many flies in all?",
    clue: "One fly each, so nothing changes: 7 times 1 is still SEVEN." },
  { n: 2, think: "Two groups of seven is a double. What is double 7?", q: "7 llamas each wear 2 hats. How many hats in all?",
    clue: "Two weeks of 7 days is FOURTEEN days. 7 times 2 is 14." },
  { n: 3, think: "Count by 7s: 7, 14, and then one more jump.", q: "7 dragons each juggle 3 flaming pickles. How many pickles in all?",
    clue: "Play twenty-ONE, like blackjack! 7 times 3 is 21. Three weeks is 21 days." },
  { n: 4, think: "4 is double 2, and 2 sevens is 14. Now double that.", q: "7 ducks each carry 4 umbrellas. How many umbrellas in all?",
    clue: "7 and 4 went on a DATE. 7 times 4 is 28 (twentyeIGHT)." },
  { n: 5, think: "5 is half of 10, and 10 sevens is 70. Take half.", q: "7 astronauts each pack 5 tacos. How many tacos in all?",
    clue: "Give a high FIVE! 7 times 5 is thirty-FIVE. Both end in five." },
  { n: 6, think: "6 is one more than 5. 5 sevens is 35. Add one more seven.", q: "7 beetles have 6 legs each. How many legs in all?",
    clue: "7 and 6 went to the ZOO and counted forty-TWO kangaroos. 7 times 6 is 42." },
  { n: 7, think: "Seven sevens! You know 6 sevens is 42. Add one more seven.", q: "7 wizards each cast 7 spells. How many spells in all?",
    clue: "7 times 7 is forty-NINE, and everything is FINE (fine, nine)." },
  { n: 8, think: "8 is 2 less than 10. 10 sevens is 70, and 2 sevens is 14. Take 14 away from 70.", q: "7 octopuses have 8 arms each. How many arms in all?",
    clue: "Count it: FIVE, SIX, SEVEN, EIGHT. That is 56 = 7 times 8." },
  { n: 9, think: "9 is 1 less than 10. 10 sevens is 70. Take away one seven.", q: "7 cats each have 9 lives. How many lives in all?",
    clue: "7 monkeys sat in a TREE: sixty-THREE (sixty-tree). 7 times 9 is 63. Also 6 + 3 = 9." },
  { n: 10, think: "Ten groups: just put a zero on the end of 7.", q: "7 monkeys each eat 10 bananas. How many bananas in all?",
    clue: "Times ten just adds a zero: 7 becomes SEVENTY." },
  { n: 11, think: "11 is 10 plus 1. 10 sevens is 70. Add one more seven.", q: "7 soccer teams have 11 players each. How many players in all?",
    clue: "Times eleven with one digit says it twice: 7 becomes 77. Double lucky SEVENS!" },
  { n: 12, think: "12 is 10 plus 2. 10 sevens is 70, and 2 sevens is 14. Put them together.", q: "7 boxes hold 12 donuts each (a dozen). How many donuts in all?",
    clue: "A dozen sevens walked through the DOOR and found eighty-FOUR. 7 times 12 is 84." },
  { n: 13, think: "13 is 10 plus 3. 10 sevens is 70, and 3 sevens is 21. Put them together.", q: "7 bakers each bake a baker's dozen, 13 cupcakes. How many cupcakes in all?",
    clue: "Unlucky thirteen! Split it: 7 times 10 is 70, 7 times 3 is 21, and 70 + 21 is NINETY-ONE." },
  { n: 14, think: "14 is 10 plus 4. 10 sevens is 70, and 4 sevens is 28. Put them together.", q: "7 unicorns each wear 14 rainbow ribbons. How many ribbons in all?",
    clue: "Double forty-NINE: 49 + 49 = ninety-EIGHT. (14 is two sevens, so it is 7 times 7, twice.)" },
  { n: 15, think: "15 is 10 plus 5. 10 sevens is 70, and 5 sevens is 35. Put them together.", q: "7 ninjas each throw 15 pillows. How many pillows in all?",
    clue: "Split it: 70 + 35 lands on one hundred FIVE. Both end in a high FIVE!" },
  { n: 16, think: "16 is 10 plus 6. 10 sevens is 70, and 6 sevens is 42. Put them together.", q: "7 knights each carry 16 shields. How many shields in all?",
    clue: "Sweet sixteen! 70 + 42 is one hundred TWELVE, a whole dozen past a hundred." },
  { n: 17, think: "17 is 3 less than 20. 20 sevens is 140, and 3 sevens is 21. Take 21 away from 140.", q: "7 robots each wear 17 hats. How many hats in all?",
    clue: "Just ONE short of 120! 7 times 17 is one hundred NINETEEN." },
  { n: 18, think: "18 is 2 less than 20. 20 sevens is 140, and 2 sevens is 14. Take 14 away from 140.", q: "7 golf courses have 18 holes each. How many holes in all?",
    clue: "Double sixty-THREE: 63 + 63 = one hundred twenty-SIX. (18 is two nines.)" },
  { n: 19, think: "19 is 1 less than 20. 20 sevens is 140. Take away one seven.", q: "7 sharks each lose 19 teeth. How many teeth in all?",
    clue: "Almost TWENTY! 7 times 20 is 140, so take one SEVEN off: 133." },
  { n: 20, think: "20 is double 10. 10 sevens is 70. Now double that.", q: "7 kids each have 20 fingers and toes. How many in all?",
    clue: "Times twenty is double times ten: 70 + 70 = one hundred FORTY." },
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
