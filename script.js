const puzzles = [
  {
    name: "Classic 3x3",
    target: 15,
    solution: [8, 1, 6, 3, 5, 7, 4, 9, 2],
    givens: [8, null, null, null, 5, null, null, null, 2],
  },
  {
    name: "Cross Start",
    target: 15,
    solution: [6, 7, 2, 1, 5, 9, 8, 3, 4],
    givens: [null, 7, null, 1, 5, 9, null, 3, null],
  },
  {
    name: "Corner Lock",
    target: 15,
    solution: [4, 3, 8, 9, 5, 1, 2, 7, 6],
    givens: [4, null, 8, null, 5, null, 2, null, 6],
  },
];

const lines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const board = document.querySelector("#board");
const targetSum = document.querySelector("#target-sum");
const puzzleName = document.querySelector("#puzzle-name");
const progressCount = document.querySelector("#progress-count");
const lineStatus = document.querySelector("#line-status");
const message = document.querySelector("#message");
const checkButton = document.querySelector("#check-button");
const answerButton = document.querySelector("#answer-button");
const resetButton = document.querySelector("#reset-button");
const nextButton = document.querySelector("#next-button");

let puzzleIndex = 0;

function currentPuzzle() {
  return puzzles[puzzleIndex];
}

function buildBoard() {
  const puzzle = currentPuzzle();
  board.innerHTML = "";
  targetSum.textContent = puzzle.target;
  puzzleName.textContent = puzzle.name;

  puzzle.givens.forEach((value, index) => {
    const input = document.createElement("input");
    input.className = "cell";
    input.type = "text";
    input.inputMode = "numeric";
    input.maxLength = 1;
    input.setAttribute("aria-label", `Cell ${index + 1}`);
    input.dataset.index = index;

    if (value) {
      input.value = value;
      input.readOnly = true;
      input.classList.add("fixed");
      input.setAttribute("aria-label", `Fixed cell ${index + 1}, value ${value}`);
    }

    input.addEventListener("input", handleInput);
    input.addEventListener("focus", handleFocus);
    input.addEventListener("keydown", handleArrowKeys);
    board.append(input);
  });

  updateStatus();
  setMessage(`Fill the empty cells so every row, column, and diagonal adds to ${puzzle.target}.`);
}

function handleInput(event) {
  const input = event.target;
  input.value = input.value.replace(/[^1-9]/g, "").slice(0, 1);
  updateCellFeedback(input);
  updateStatus();
}

function handleFocus(event) {
  updateCellFeedback(event.target);
}

function handleArrowKeys(event) {
  const keys = {
    ArrowLeft: -1,
    ArrowRight: 1,
    ArrowUp: -3,
    ArrowDown: 3,
  };

  if (!(event.key in keys)) {
    return;
  }

  event.preventDefault();
  const nextIndex = Number(event.target.dataset.index) + keys[event.key];
  const nextCell = board.querySelector(`[data-index="${nextIndex}"]`);

  if (nextCell) {
    nextCell.focus();
  }
}

function values() {
  return [...board.querySelectorAll(".cell")].map((cell) => Number(cell.value) || null);
}

function updateStatus() {
  const puzzle = currentPuzzle();
  const cells = values();
  const filled = cells.filter(Boolean).length;
  const correctLines = lines.filter((line) => {
    const lineValues = line.map((index) => cells[index]);
    return lineValues.every(Boolean) && sum(lineValues) === puzzle.target;
  }).length;

  progressCount.textContent = `${filled}/9`;
  lineStatus.textContent = `${correctLines}/8`;
}

function checkBoard() {
  clearMarks();

  const puzzle = currentPuzzle();
  const cells = values();
  const missing = cells.some((value) => !value);
  const duplicates = findDuplicates(cells);
  const badCells = new Set();
  let correctLines = 0;

  lines.forEach((line) => {
    const lineValues = line.map((index) => cells[index]);

    if (lineValues.every(Boolean) && sum(lineValues) === puzzle.target) {
      correctLines += 1;
      line.forEach((index) => markCell(index, "good"));
      return;
    }

    if (lineValues.every(Boolean)) {
      line.forEach((index) => badCells.add(index));
    }
  });

  duplicates.forEach((index) => badCells.add(index));
  badCells.forEach((index) => markCell(index, "bad"));
  updateStatus();

  if (correctLines === lines.length && !missing && duplicates.length === 0) {
    setMessage("Solved. Every direction keeps the sum constant.", "win");
  } else if (duplicates.length > 0) {
    setMessage("Each number from 1 to 9 should appear once.", "warn");
  } else if (missing) {
    setMessage("Good start. Fill every empty cell, then check again.");
  } else {
    setMessage("Some lines miss the target. Adjust the highlighted cells.", "warn");
  }
}

function showAnswer() {
  const puzzle = currentPuzzle();

  board.querySelectorAll(".cell").forEach((cell, index) => {
    cell.value = puzzle.solution[index];
    cell.classList.remove("bad");
    cell.classList.add("good");

    if (!cell.classList.contains("fixed")) {
      cell.classList.add("revealed");
    }
  });

  updateStatus();
  setMessage("Answer shown. Study how each row, column, and diagonal totals 15.", "win");
}

function updateCellFeedback(input) {
  const index = Number(input.dataset.index);
  const value = Number(input.value) || null;
  input.classList.remove("good", "bad", "revealed");

  if (input.classList.contains("fixed")) {
    setMessage(`Cell ${index + 1} is fixed. It is part of the puzzle clue.`);
    return;
  }

  if (!value) {
    setMessage(`Cell ${index + 1}: enter a number from 1 to 9.`);
    return;
  }

  const cells = values();
  const duplicateIndexes = findDuplicates(cells);

  if (duplicateIndexes.includes(index)) {
    input.classList.add("bad");
    setMessage(`Cell ${index + 1}: ${value} is already used. Each number can appear only once.`, "warn");
    return;
  }

  if (value === currentPuzzle().solution[index]) {
    input.classList.add("good");
    setMessage(`Cell ${index + 1}: correct. This number keeps the hidden solution balanced.`, "win");
    return;
  }

  input.classList.add("bad");
  setMessage(`Cell ${index + 1}: wrong. ${explainWrongCell(index, cells)}`, "warn");
}

function explainWrongCell(index, cells) {
  const puzzle = currentPuzzle();
  const issue = relatedLineIssue(index, cells);

  if (issue) {
    return `Its ${issue.name} totals ${issue.total}, not ${puzzle.target}.`;
  }

  return "This spot needs a different number so all crossing lines can reach the target.";
}

function relatedLineIssue(index, cells) {
  const puzzle = currentPuzzle();
  const names = ["row", "row", "row", "column", "column", "column", "diagonal", "diagonal"];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];

    if (!line.includes(index)) {
      continue;
    }

    const lineValues = line.map((cellIndex) => cells[cellIndex]);

    if (lineValues.every(Boolean) && sum(lineValues) !== puzzle.target) {
      return {
        name: names[lineIndex],
        total: sum(lineValues),
      };
    }
  }

  return null;
}

function findDuplicates(cells) {
  const seen = new Map();
  const duplicateIndexes = [];

  cells.forEach((value, index) => {
    if (!value) {
      return;
    }

    if (seen.has(value)) {
      duplicateIndexes.push(seen.get(value), index);
      return;
    }

    seen.set(value, index);
  });

  return [...new Set(duplicateIndexes)];
}

function clearMarks() {
  board.querySelectorAll(".cell").forEach((cell) => {
    cell.classList.remove("good", "bad");
  });
}

function markCell(index, className) {
  const cell = board.querySelector(`[data-index="${index}"]`);
  cell.classList.add(className);
}

function setMessage(text, tone = "") {
  message.textContent = text;
  message.className = `message ${tone}`.trim();
}

function resetPuzzle() {
  buildBoard();
}

function nextPuzzle() {
  puzzleIndex = (puzzleIndex + 1) % puzzles.length;
  buildBoard();
}

function sum(valuesToAdd) {
  return valuesToAdd.reduce((total, value) => total + value, 0);
}

checkButton.addEventListener("click", checkBoard);
answerButton.addEventListener("click", showAnswer);
resetButton.addEventListener("click", resetPuzzle);
nextButton.addEventListener("click", nextPuzzle);

buildBoard();
