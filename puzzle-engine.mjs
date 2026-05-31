export const BOARD_SIZE = 3;
export const CELL_COUNT = 9;
export const MIN_VALUE = 1;
export const MAX_VALUE = 9;
export const LINE_COUNT = 8;

export const CLUE_COUNTS = {
  easy: 5,
  medium: 4,
  hard: 3,
};

export const RULES_MESSAGE =
  "Fill the 3×3 grid with digits 1–9 (repeats allowed). Every row, column, and diagonal must share the same sum. The sum is not shown until you solve it.";

export const LINE_NAMES = [
  "row 1",
  "row 2",
  "row 3",
  "column 1",
  "column 2",
  "column 3",
  "main diagonal",
  "anti-diagonal",
];

export function createLines() {
  const size = BOARD_SIZE;
  const result = [];

  for (let row = 0; row < size; row += 1) {
    result.push(Array.from({ length: size }, (_, col) => row * size + col));
  }

  for (let col = 0; col < size; col += 1) {
    result.push(Array.from({ length: size }, (_, row) => row * size + col));
  }

  result.push(Array.from({ length: size }, (_, index) => index * size + index));
  result.push(Array.from({ length: size }, (_, index) => index * size + (size - 1 - index)));
  return result;
}

export function createPuzzle(seed, level) {
  const clueCount = CLUE_COUNTS[level];
  const clueIndexes = pickClueIndexes(clueCount, seed);
  const givens = Array(CELL_COUNT).fill(null);

  clueIndexes.forEach((index) => {
    givens[index] = MIN_VALUE + ((seed * 17 + index * 11) % MAX_VALUE);
  });

  return {
    name: `${capitalize(level)} #${seed}`,
    level,
    givens,
    clueCount,
  };
}

function pickClueIndexes(clueCount, seed) {
  const indexes = [];

  for (let offset = 0; indexes.length < clueCount; offset += 1) {
    const cursor = (seed * 13 + offset * 5) % CELL_COUNT;

    if (!indexes.includes(cursor)) {
      indexes.push(cursor);
    }
  }

  return indexes;
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function isValidValue(value) {
  return Number.isInteger(value) && value >= MIN_VALUE && value <= MAX_VALUE;
}

export function analyzeBoard(cells) {
  const lines = createLines();
  const lineResults = lines.map((line, lineIndex) => {
    const values = line.map((index) => cells[index]);
    const filled = values.every((value) => value !== null && value !== "");
    const total = filled ? sum(values) : null;

    return {
      line,
      name: LINE_NAMES[lineIndex],
      filled,
      total,
    };
  });

  const completedTotals = lineResults.filter((result) => result.filled).map((result) => result.total);
  const uniqueTotals = [...new Set(completedTotals)];
  const inconsistent = uniqueTotals.length > 1;
  const commonSum = uniqueTotals.length === 1 ? uniqueTotals[0] : null;

  const lineStates = lineResults.map((result) => {
    if (!result.filled) {
      return "incomplete";
    }

    if (inconsistent) {
      return "conflict";
    }

    return "aligned";
  });

  const alignedLines = lineStates.filter((state) => state === "aligned").length;
  const allCellsFilled = cells.every((value) => value !== null && value !== "");
  const allLinesFilled = lineResults.every((result) => result.filled);
  const solved = allCellsFilled && allLinesFilled && !inconsistent && commonSum !== null;

  return {
    lineResults,
    lineStates,
    commonSum,
    inconsistent,
    alignedLines,
    solved,
  };
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value), 0);
}
