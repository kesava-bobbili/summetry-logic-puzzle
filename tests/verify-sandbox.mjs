import {
  CLUE_COUNTS,
  analyzeBoard,
  createPuzzle,
} from "../puzzle-engine.mjs";

let failures = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failures += 1;
  }
}

for (const [level, expected] of Object.entries(CLUE_COUNTS)) {
  for (let seed = 1; seed <= 8; seed += 1) {
    const puzzle = createPuzzle(seed, level);
    const clueCount = puzzle.givens.filter((value) => value !== null).length;
    assert(clueCount === expected, `${level} seed ${seed} has ${expected} clues (got ${clueCount})`);
  }
}

const solvedGrid = [8, 1, 6, 3, 5, 7, 4, 9, 2];
const solved = analyzeBoard(solvedGrid);
assert(solved.solved, "valid equal-sum grid is accepted");
assert(solved.commonSum === 15, "valid grid common sum is 15");

const repeatGrid = [5, 5, 5, 5, 5, 5, 5, 5, 5];
const repeat = analyzeBoard(repeatGrid);
assert(repeat.solved, "all fives grid is valid");
assert(repeat.commonSum === 15, "all fives common sum is 15");

const partial = [1, 2, 3, null, null, null, null, null, null];
const partialAnalysis = analyzeBoard(partial);
assert(partialAnalysis.lineStates[0] === "aligned", "first row aligns on its own");
assert(partialAnalysis.commonSum === 6, "first row establishes sum 6");

const badRows = [1, 2, 3, 9, 9, 9, null, null, null];
const badAnalysis = analyzeBoard(badRows);
assert(badAnalysis.inconsistent, "rows with different sums conflict");

if (failures === 0) {
  console.log("All sandbox puzzle checks passed.");
} else {
  console.error(`${failures} check(s) failed.`);
  process.exit(1);
}
