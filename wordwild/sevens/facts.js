// The 7s times table, 7 x 0 through 7 x 12. Each fact has a silly question and a clue.
// In every clue the answer's sound-alike is written in CAPITALS so it stands out.
export const FACTS = [
  { n: 0,  q: "7 pirates each found 0 treasure chests. How many chests in all?",
    clue: "Seven pirates, ZERO chests. Anything times zero is ZERO!" },
  { n: 1,  q: "7 frogs each caught 1 fly. How many flies in all?",
    clue: "One fly each, so nothing changes: 7 times 1 is still SEVEN." },
  { n: 2,  q: "7 llamas each wear 2 hats. How many hats in all?",
    clue: "Two weeks of 7 days is FOURTEEN days. 7 times 2 is 14." },
  { n: 3,  q: "7 dragons each juggle 3 flaming pickles. How many pickles in all?",
    clue: "Play twenty-ONE, like blackjack! 7 times 3 is 21. Three weeks is 21 days." },
  { n: 4,  q: "7 ducks each carry 4 umbrellas. How many umbrellas in all?",
    clue: "7 and 4 went on a DATE. 7 times 4 is 28 (twentyeIGHT)." },
  { n: 5,  q: "7 astronauts each pack 5 tacos. How many tacos in all?",
    clue: "Give a high FIVE! 7 times 5 is thirty-FIVE. Both end in five." },
  { n: 6,  q: "7 beetles have 6 legs each. How many legs in all?",
    clue: "7 and 6 went to the ZOO and counted forty-TWO kangaroos. 7 times 6 is 42." },
  { n: 7,  q: "7 wizards each cast 7 spells. How many spells in all?",
    clue: "7 times 7 is forty-NINE, and everything is FINE (fine, nine)." },
  { n: 8,  q: "7 octopuses have 8 arms each. How many arms in all?",
    clue: "Count it: FIVE, SIX, SEVEN, EIGHT. That is 56 = 7 times 8." },
  { n: 9,  q: "7 cats each have 9 lives. How many lives in all?",
    clue: "7 monkeys sat in a TREE: sixty-THREE (sixty-tree). 7 times 9 is 63. Also 6 + 3 = 9." },
  { n: 10, q: "7 monkeys each eat 10 bananas. How many bananas in all?",
    clue: "Times ten just adds a zero: 7 becomes SEVENTY." },
  { n: 11, q: "7 soccer teams have 11 players each. How many players in all?",
    clue: "Times eleven with one digit says it twice: 7 becomes 77. Double lucky SEVENS!" },
  { n: 12, q: "7 boxes hold 12 donuts each (a dozen). How many donuts in all?",
    clue: "A dozen sevens walked through the DOOR and found eighty-FOUR. 7 times 12 is 84." },
].map((f) => ({ ...f, a: 7 * f.n }));

// Medal challenges: all 13 facts, answered correctly before the clock runs out.
export const MEDALS = [
  { id: "bronze", label: "Bronze", seconds: 90, icon: "🥉" },
  { id: "silver", label: "Silver", seconds: 75, icon: "🥈" },
  { id: "gold",   label: "Gold",   seconds: 60, icon: "🥇" },
];
