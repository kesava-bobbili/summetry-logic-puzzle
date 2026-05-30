import {
  clueCountRange,
  clueLevels,
  countSolutions,
  createLines,
  createPuzzle,
  gridSizes,
  isBoardSolved,
} from "../puzzle-engine.mjs";

let failures = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failures += 1;
  }
}

const sizes = [3, 4, 5];
const levels = Object.keys(clueLevels);

for (const size of sizes) {
  const { max } = gridSizes[size];

  for (const level of levels) {
    for (let seed = 1; seed <= 12; seed += 1) {
      const puzzle = createPuzzle(size, seed, level);
      const clueCount = puzzle.givens.filter((value) => value !== null).length;
      const [minClues, maxClues] = clueCountRange(size, level);
      const solutions = countSolutions(size, puzzle.target, max, puzzle.givens);

      assert(puzzle.max === max, `${size}x${size} ${level} seed ${seed} max value`);
      assert(typeof puzzle.target === "number", `${size}x${size} ${level} seed ${seed} has a target`);
      assert(solutions === 1, `${size}x${size} ${level} seed ${seed} has exactly one solution (got ${solutions})`);
      assert(
        clueCount >= minClues && clueCount <= maxClues,
        `${size}x${size} ${level} seed ${seed} clue count ${clueCount} outside ${minClues}-${maxClues}`,
      );

      const lines = createLines(size);
      assert(
        isBoardSolved(puzzle.solution, lines, puzzle.target),
        `${size}x${size} ${level} seed ${seed} canonical solution satisfies sums`,
      );
    }
  }
}

const variedTargets = new Set();

for (let seed = 1; seed <= 12; seed += 1) {
  variedTargets.add(createPuzzle(3, seed, "medium").target);
}

assert(variedTargets.size > 1, "3x3 puzzles should use more than one target sum");

const repeatBoard = [5, 5, 5, 5, 5, 5, 5, 5, 5];
const repeatGivens = repeatBoard.map((value) => value);
const repeatSolutions = countSolutions(3, 15, 9, repeatGivens);
assert(repeatSolutions >= 1, "repeating values are allowed by the solver");

if (failures === 0) {
  console.log(`All puzzle verification checks passed (${sizes.length * levels.length * 12} puzzles).`);
} else {
  console.error(`${failures} verification check(s) failed.`);
  process.exit(1);
}
