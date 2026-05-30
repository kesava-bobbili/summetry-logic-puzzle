export const gridSizes = {
  3: { size: 3, max: 9 },
  4: { size: 4, max: 16 },
  5: { size: 5, max: 25 },
};

const classicTargets = { 3: 15, 4: 34, 5: 65 };

export const clueLevels = {
  easy: { minRatio: 0.5, maxRatio: 0.6 },
  medium: { minRatio: 0.35, maxRatio: 0.45 },
  hard: { minRatio: 0.2, maxRatio: 0.3 },
};

export const RULES_MESSAGE =
  "Fill the grid so that every row, every column, and both diagonals add up to the same target sum. Repeating numbers is allowed as long as the values stay within the allowed range for the selected grid size.";

export function clueCountRange(size, level) {
  const total = size * size;
  const { minRatio, maxRatio } = clueLevels[level];
  const min = Math.max(2, Math.round(total * minRatio));
  const max = Math.min(total - 1, Math.max(min, Math.round(total * maxRatio)));
  return [min, max];
}

export function createPuzzle(size, seed, level) {
  const config = gridSizes[size];
  const [minClues, maxClues] = clueCountRange(size, level);
  let bestInRange = null;
  let bestFallback = null;

  for (let attempt = 0; attempt < 24; attempt += 1) {
    const candidate = buildPuzzleCandidate(size, seed + attempt, level, config);

    if (countSolutions(size, candidate.target, config.max, candidate.givens) !== 1) {
      continue;
    }

    const clueCount = candidate.givens.filter((value) => value !== null).length;
    const inRange = clueCount >= minClues && clueCount <= maxClues;

    if (inRange) {
      bestInRange = { ...candidate, clueCount };
      break;
    }

    const fallbackScore = clueDistance(clueCount, minClues, maxClues, level);
    const bestScore = bestFallback ? bestFallback.score : Number.POSITIVE_INFINITY;

    if (fallbackScore < bestScore) {
      bestFallback = { ...candidate, clueCount, score: fallbackScore };
    }
  }

  const chosen = bestInRange || bestFallback;

  if (!chosen) {
    const { solution, target } = createClassicSolution(size, seed);
    return {
      name: `${size}x${size} ${capitalize(level)} #${seed}`,
      size,
      target,
      max: config.max,
      clueLevel: level,
      solution,
      givens: solution.map((value) => value),
    };
  }

  return {
    name: `${size}x${size} ${capitalize(level)} #${seed} · target ${chosen.target}`,
    size,
    target: chosen.target,
    max: config.max,
    clueLevel: level,
    solution: chosen.solution,
    givens: chosen.givens,
  };
}

function clueDistance(clueCount, minClues, maxClues, level) {
  if (clueCount < minClues) {
    return minClues - clueCount;
  }

  if (clueCount > maxClues) {
    return clueCount - maxClues + (level === "hard" ? 0.25 : 1);
  }

  return 0;
}

function buildPuzzleCandidate(size, seed, level, config) {
  const [minClues, maxClues] = clueCountRange(size, level);
  const total = size * size;
  const { solution, target } = createPuzzleSolution(size, config.max, seed);
  let bestSet = null;
  let bestCount = total + 1;

  for (let shuffle = 0; shuffle < 8; shuffle += 1) {
    const clueSet = new Set(Array.from({ length: total }, (_, index) => index));
    const removalOrder = shuffledIndexes(total, seed * 19 + shuffle * 7 + size);

    for (const index of removalOrder) {
      if (clueSet.size <= minClues) {
        break;
      }

      clueSet.delete(index);
      const givens = buildGivens(solution, clueSet);

      if (countSolutions(size, target, config.max, givens) !== 1) {
        clueSet.add(index);
      }
    }

    if (clueSet.size > maxClues) {
      for (const index of removalOrder) {
        if (clueSet.size <= maxClues) {
          break;
        }

        if (!clueSet.has(index)) {
          continue;
        }

        clueSet.delete(index);
        const givens = buildGivens(solution, clueSet);

        if (countSolutions(size, target, config.max, givens) !== 1) {
          clueSet.add(index);
        }
      }
    }

    const targetCount = level === "easy" ? maxClues : level === "hard" ? minClues : Math.round((minClues + maxClues) / 2);
    const distance = Math.abs(clueSet.size - targetCount);

    if (distance < Math.abs(bestCount - targetCount) || (distance === Math.abs(bestCount - targetCount) && clueSet.size < bestCount)) {
      bestSet = new Set(clueSet);
      bestCount = clueSet.size;
    }
  }

  const clueSet = bestSet || new Set(Array.from({ length: total }, (_, index) => index));
  return {
    solution,
    target,
    givens: buildGivens(solution, clueSet),
  };
}

function createClassicSolution(size, seed) {
  const solution = transformBoard(createMagicSquare(size), size, seed);
  return { solution, target: classicTargets[size] };
}

function createPuzzleSolution(size, max, seed) {
  const minTarget = size * 2;
  const maxTarget = size * max - size;
  const targets = [];

  for (let target = minTarget; target <= maxTarget; target += 1) {
    if (target !== classicTargets[size]) {
      targets.push(target);
    }
  }

  const order = shuffledIndexes(targets.length, seed);

  for (let attempt = 0; attempt < Math.min(order.length, 28); attempt += 1) {
    const target = targets[order[attempt]];
    const solution = generateValidSolution(size, target, max, seed + target * 3);

    if (solution) {
      return { solution, target };
    }
  }

  return createClassicSolution(size, seed);
}

function shuffledValues(min, max, seed) {
  const values = Array.from({ length: max - min + 1 }, (_, index) => min + index);

  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapAt = (seed + index * 5) % (index + 1);
    [values[index], values[swapAt]] = [values[swapAt], values[index]];
  }

  return values;
}

export function generateValidSolution(size, target, max, seed) {
  const boardState = Array(size * size).fill(null);
  const lineDefs = createLines(size);
  const cellLines = Array.from({ length: size * size }, () => []);

  lineDefs.forEach((line) => {
    line.forEach((index) => {
      cellLines[index].push(line);
    });
  });

  function lineStats(line) {
    let filled = 0;
    let lineTotal = 0;

    line.forEach((index) => {
      const value = boardState[index];

      if (value !== null) {
        filled += 1;
        lineTotal += value;
      }
    });

    return { filled, empty: line.length - filled, total: lineTotal };
  }

  function partialLineValid(line) {
    const { empty, total: lineTotal } = lineStats(line);

    if (empty === 0) {
      return lineTotal === target;
    }

    const minTotal = lineTotal + empty;
    const maxTotal = lineTotal + empty * max;
    return lineTotal <= target && minTotal <= target && maxTotal >= target;
  }

  function constraintsValid(index) {
    return cellLines[index].every(partialLineValid);
  }

  function solve(index) {
    if (index === size * size) {
      return true;
    }

    for (const value of shuffledValues(1, max, seed + index * 11)) {
      boardState[index] = value;

      if (constraintsValid(index) && solve(index + 1)) {
        return true;
      }
    }

    boardState[index] = null;
    return false;
  }

  if (!solve(0)) {
    return null;
  }

  return [...boardState];
}

function buildGivens(solution, clueSet) {
  return solution.map((value, index) => (clueSet.has(index) ? value : null));
}

function shuffledIndexes(total, seed) {
  const indexes = Array.from({ length: total }, (_, index) => index);

  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swapAt = (seed + index * 13) % (index + 1);
    [indexes[index], indexes[swapAt]] = [indexes[swapAt], indexes[index]];
  }

  return indexes;
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function createMagicSquare(size) {
  if (size === 4) {
    return [16, 2, 3, 13, 5, 11, 10, 8, 9, 7, 6, 12, 4, 14, 15, 1];
  }

  const values = Array(size * size).fill(0);
  let row = 0;
  let col = Math.floor(size / 2);

  for (let value = 1; value <= size * size; value += 1) {
    values[row * size + col] = value;
    const nextRow = (row - 1 + size) % size;
    const nextCol = (col + 1) % size;

    if (values[nextRow * size + nextCol]) {
      row = (row + 1) % size;
    } else {
      row = nextRow;
      col = nextCol;
    }
  }

  return values;
}

export function transformBoard(values, size, seed) {
  const transforms = [
    (row, col) => [row, col],
    (row, col) => [col, size - 1 - row],
    (row, col) => [size - 1 - row, size - 1 - col],
    (row, col) => [size - 1 - col, row],
    (row, col) => [row, size - 1 - col],
    (row, col) => [size - 1 - row, col],
    (row, col) => [col, row],
    (row, col) => [size - 1 - col, size - 1 - row],
  ];
  const transform = transforms[seed % transforms.length];
  const output = Array(values.length);

  values.forEach((value, index) => {
    const row = Math.floor(index / size);
    const col = index % size;
    const [newRow, newCol] = transform(row, col);
    output[newRow * size + newCol] = value;
  });

  return output;
}

export function countSolutions(size, target, max, givens, limit = 2) {
  const boardState = givens.slice();
  const lineDefs = createLines(size);
  const cellLines = Array.from({ length: size * size }, () => []);

  lineDefs.forEach((line) => {
    line.forEach((index) => {
      cellLines[index].push(line);
    });
  });

  let count = 0;

  function lineStats(line) {
    let filled = 0;
    let lineTotal = 0;

    line.forEach((index) => {
      const value = boardState[index];

      if (value !== null) {
        filled += 1;
        lineTotal += value;
      }
    });

    return { filled, empty: line.length - filled, total: lineTotal };
  }

  function partialLineValid(line) {
    const { filled, empty, total: lineTotal } = lineStats(line);

    if (empty === 0) {
      return lineTotal === target;
    }

    const minTotal = lineTotal + empty;
    const maxTotal = lineTotal + empty * max;
    return lineTotal <= target && minTotal <= target && maxTotal >= target;
  }

  function constraintsValid(index) {
    return cellLines[index].every(partialLineValid);
  }

  function candidateValues(index) {
    if (givens[index] !== null) {
      return [givens[index]];
    }

    const values = [];

    for (let value = 1; value <= max; value += 1) {
      boardState[index] = value;

      if (constraintsValid(index)) {
        values.push(value);
      }
    }

    boardState[index] = null;
    return values;
  }

  function nextIndex(start) {
    let bestIndex = null;
    let bestOptions = null;

    for (let index = start; index < size * size; index += 1) {
      if (boardState[index] !== null) {
        continue;
      }

      const options = candidateValues(index);

      if (options.length === 0) {
        return { index, options };
      }

      if (bestOptions === null || options.length < bestOptions.length) {
        bestIndex = index;
        bestOptions = options;

        if (bestOptions.length === 1) {
          break;
        }
      }
    }

    return { index: bestIndex, options: bestOptions || [] };
  }

  function solve(start = 0) {
    if (count >= limit) {
      return;
    }

    const { index, options } = nextIndex(start);

    if (index === null) {
      count += 1;
      return;
    }

    if (options.length === 0) {
      return;
    }

    for (const value of options) {
      boardState[index] = value;
      solve(index + 1);

      if (count >= limit) {
        return;
      }
    }

    boardState[index] = null;
  }

  solve(0);
  return count;
}

export function createLines(size) {
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

export function isBoardSolved(cells, lines, target) {
  if (!cells.every(Boolean)) {
    return false;
  }

  return lines.every((line) => {
    const lineValues = line.map((index) => cells[index]);
    return lineValues.reduce((total, value) => total + value, 0) === target;
  });
}
