import {
  RULES_MESSAGE,
  createLines,
  createPuzzle,
  gridSizes,
} from "./puzzle-engine.mjs";

const board = document.querySelector("#board");
const targetSum = document.querySelector("#target-sum");
const puzzleName = document.querySelector("#puzzle-name");
const progressCount = document.querySelector("#progress-count");
const lineStatus = document.querySelector("#line-status");
const timerText = document.querySelector("#timer");
const message = document.querySelector("#message");
const numberPad = document.querySelector("#number-pad");
const checkButton = document.querySelector("#check-button");
const hintButton = document.querySelector("#hint-button");
const answerButton = document.querySelector("#answer-button");
const resetButton = document.querySelector("#reset-button");
const nextButton = document.querySelector("#next-button");
const leaderboardButton = document.querySelector("#leaderboard-button");
const sizeButtons = document.querySelectorAll(".size-button");
const clueLevelButtons = document.querySelectorAll(".clue-level-button");
const completeModal = document.querySelector("#complete-modal");
const completeTime = document.querySelector("#complete-time");
const playAgainButton = document.querySelector("#play-again-button");
const leaderboardModal = document.querySelector("#leaderboard-modal");
const leaderboardList = document.querySelector("#leaderboard-list");
const closeLeaderboardButton = document.querySelector("#close-leaderboard-button");
const confettiLayer = document.querySelector("#confetti-layer");

let activeSize = 3;
let activeClueLevel = "medium";
let puzzleCounter = 1;
let puzzle = null;
let lines = [];
let selectedCellIndex = null;
let hintsRemaining = 3;
let elapsedSeconds = 0;
let timerId = null;
let timerStarted = false;
let solved = false;

function newPuzzle(size = activeSize, clueLevel = activeClueLevel) {
  completeModal.classList.add("hidden");
  activeSize = size;
  activeClueLevel = clueLevel;
  stopTimer();
  elapsedSeconds = 0;
  timerStarted = false;
  solved = false;
  hintsRemaining = 3;
  selectedCellIndex = null;
  lines = createLines(size);
  puzzle = createPuzzle(size, puzzleCounter, clueLevel);
  puzzleCounter += 1;
  buildBoard();
  buildNumberPad();
  updateSizeButtons();
  updateClueLevelButtons();
  updateStatus();
  updateTimer();
  updateHintButton();
  setMessage(RULES_MESSAGE);
}

function buildBoard() {
  board.innerHTML = "";
  board.style.setProperty("--size", puzzle.size);
  targetSum.textContent = puzzle.target;
  puzzleName.textContent = puzzle.name;

  puzzle.givens.forEach((value, index) => {
    const input = document.createElement("input");
    input.className = "cell";
    input.type = "text";
    input.inputMode = "numeric";
    input.maxLength = String(puzzle.max).length;
    input.setAttribute("aria-label", `Cell ${index + 1}`);
    input.dataset.index = index;

    if (value !== null) {
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
}

function buildNumberPad() {
  numberPad.innerHTML = "";

  for (let value = 1; value <= puzzle.max; value += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = value;
    button.addEventListener("click", () => applyPadValue(value));
    numberPad.append(button);
  }

  const clearButton = document.createElement("button");
  clearButton.type = "button";
  clearButton.textContent = "Clear";
  clearButton.className = "number-pad-clear";
  clearButton.addEventListener("click", () => applyPadValue(""));
  numberPad.append(clearButton);
}

function handleInput(event) {
  if (solved) {
    return;
  }

  startTimer();
  const input = event.target;
  input.value = input.value.replace(/\D/g, "").slice(0, String(puzzle.max).length);
  selectedCellIndex = Number(input.dataset.index);
  updateCellFeedback(input);
  updateStatus();
  detectSolved();
}

function handleFocus(event) {
  selectedCellIndex = Number(event.target.dataset.index);
  updateCellFeedback(event.target);
}

function handleArrowKeys(event) {
  const keys = {
    ArrowLeft: -1,
    ArrowRight: 1,
    ArrowUp: -puzzle.size,
    ArrowDown: puzzle.size,
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

function applyPadValue(value) {
  if (selectedCellIndex === null || solved) {
    setMessage("Select an editable cell first.");
    return;
  }

  const cell = getCell(selectedCellIndex);

  if (!cell || cell.readOnly) {
    setMessage("That cell is fixed. Pick an empty cell.");
    return;
  }

  cell.value = value;
  cell.focus();
  cell.dispatchEvent(new Event("input", { bubbles: true }));
}

function values() {
  return [...board.querySelectorAll(".cell")].map((cell) => Number(cell.value) || null);
}

function totalCells() {
  return puzzle.size * puzzle.size;
}

function updateStatus() {
  const cells = values();
  const filled = cells.filter(Boolean).length;
  const correctLines = lines.filter((line) => {
    const lineValues = line.map((index) => cells[index]);
    return lineValues.every(Boolean) && sum(lineValues) === puzzle.target;
  }).length;

  progressCount.textContent = `${filled}/${totalCells()}`;
  lineStatus.textContent = `${correctLines}/${lines.length}`;
}

function checkBoard() {
  clearMarks();
  const solvedNow = markBoardAndCheckSolved();

  if (solvedNow) {
    finishPuzzle();
    return;
  }

  const cells = values();
  const missing = cells.some((value) => !value);

  if (missing) {
    setMessage("Good start. Fill every empty cell, then check again.");
  } else {
    setMessage("Some lines miss the target. Adjust the highlighted cells.", "warn");
  }
}

function markBoardAndCheckSolved() {
  const cells = values();
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

  badCells.forEach((index) => markCell(index, "bad"));
  updateStatus();

  return correctLines === lines.length && cells.every(Boolean);
}

function detectSolved() {
  if (isBoardSolved()) {
    clearMarks();
    markBoardAndCheckSolved();
    finishPuzzle();
  }
}

function isBoardSolved() {
  const cells = values();

  if (!cells.every(Boolean)) {
    return false;
  }

  return lines.every((line) => {
    const lineValues = line.map((index) => cells[index]);
    return sum(lineValues) === puzzle.target;
  });
}

function showAnswer() {
  stopTimer();
  solved = true;

  board.querySelectorAll(".cell").forEach((cell, index) => {
    cell.value = puzzle.solution[index];
    cell.classList.remove("bad", "hinted");
    cell.classList.add("good");

    if (!cell.classList.contains("fixed")) {
      cell.classList.add("revealed");
    }
  });

  updateStatus();
  updateHintButton();
  setMessage(`Answer shown. Study how each row, column, and diagonal totals ${puzzle.target}.`, "win");
}

function useHint() {
  if (solved) {
    return;
  }

  if (hintsRemaining === 0) {
    setMessage("No hints left for this puzzle.", "warn");
    return;
  }

  const index = findHintIndex();

  if (index === null) {
    detectSolved();
    return;
  }

  startTimer();
  const cell = getCell(index);
  cell.value = puzzle.solution[index];
  cell.classList.remove("bad", "revealed");
  cell.classList.add("hinted", "good");
  hintsRemaining -= 1;
  selectedCellIndex = index;
  updateHintButton();
  updateStatus();
  setMessage(`Hint used: Cell ${index + 1} is ${puzzle.solution[index]}.`);
  detectSolved();
}

function findHintIndex() {
  const cells = values();
  const editableWrong = cells.findIndex(
    (value, index) => puzzle.givens[index] === null && value !== puzzle.solution[index],
  );
  return editableWrong === -1 ? null : editableWrong;
}

function updateCellFeedback(input) {
  const index = Number(input.dataset.index);
  const value = Number(input.value) || null;
  input.classList.remove("good", "bad", "revealed", "hinted");

  if (input.classList.contains("fixed")) {
    setMessage(`Cell ${index + 1} is fixed. It is part of the puzzle clue.`);
    return;
  }

  if (!value) {
    setMessage(`Cell ${index + 1}: enter a number from 1 to ${puzzle.max}.`);
    return;
  }

  if (!isInPuzzleRange(value)) {
    input.classList.add("bad");
    setMessage(`Cell ${index + 1}: ${value} is outside this puzzle. Use 1 to ${puzzle.max}.`, "warn");
    return;
  }

  const cells = values();
  const issue = relatedLineIssue(index, cells);

  if (issue) {
    input.classList.add("bad");
    setMessage(`Cell ${index + 1}: its ${issue.name} totals ${issue.total}, not ${puzzle.target}.`, "warn");
    return;
  }

  if (value === puzzle.solution[index]) {
    input.classList.add("good");
    setMessage(`Cell ${index + 1}: fits the unique solution for this puzzle.`, "win");
    return;
  }

  input.classList.add("bad");
  setMessage(`Cell ${index + 1}: does not match the unique solution. ${explainWrongCell(index, cells)}`, "warn");
}

function explainWrongCell(index, cells) {
  const issue = relatedLineIssue(index, cells);

  if (issue) {
    return `Its ${issue.name} totals ${issue.total}, not ${puzzle.target}.`;
  }

  return "Try a different value so the crossing lines can reach the target.";
}

function relatedLineIssue(index, cells) {
  const names = [
    ...Array(puzzle.size).fill("row"),
    ...Array(puzzle.size).fill("column"),
    "diagonal",
    "diagonal",
  ];

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

function isInPuzzleRange(value) {
  return value >= 1 && value <= puzzle.max;
}

function finishPuzzle() {
  if (solved) {
    return;
  }

  solved = true;
  stopTimer();
  updateHintButton();
  saveLeaderboardTime(activeSize, elapsedSeconds);
  flashCells();
  launchConfetti();
  completeTime.textContent = `Time: ${formatTime(elapsedSeconds)}`;
  completeModal.classList.remove("hidden");
  setMessage("Solved. Every direction keeps the sum constant.", "win");
}

function saveLeaderboardTime(size, seconds) {
  const key = leaderboardKey(size);
  const times = getLeaderboard(size);
  times.push(seconds);
  localStorage.setItem(key, JSON.stringify(times.sort((a, b) => a - b).slice(0, 5)));
}

function getLeaderboard(size) {
  try {
    return JSON.parse(localStorage.getItem(leaderboardKey(size))) || [];
  } catch {
    return [];
  }
}

function leaderboardKey(size) {
  return `summetry-leaderboard-${size}`;
}

function showLeaderboard() {
  leaderboardList.innerHTML = "";

  Object.values(gridSizes).forEach(({ size }) => {
    const section = document.createElement("section");
    const title = document.createElement("h3");
    const list = document.createElement("ol");
    const times = getLeaderboard(size);

    title.textContent = `${size}x${size}`;

    if (times.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "No solved times yet.";
      section.append(title, empty);
    } else {
      times.forEach((time) => {
        const item = document.createElement("li");
        item.textContent = formatTime(time);
        list.append(item);
      });
      section.append(title, list);
    }

    leaderboardList.append(section);
  });

  leaderboardModal.classList.remove("hidden");
}

function startTimer() {
  if (timerStarted || solved) {
    return;
  }

  timerStarted = true;
  timerId = window.setInterval(() => {
    elapsedSeconds += 1;
    updateTimer();
  }, 1000);
}

function stopTimer() {
  window.clearInterval(timerId);
  timerId = null;
}

function updateTimer() {
  timerText.textContent = formatTime(elapsedSeconds);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function resetPuzzle() {
  stopTimer();
  elapsedSeconds = 0;
  timerStarted = false;
  solved = false;
  hintsRemaining = 3;
  selectedCellIndex = null;
  buildBoard();
  updateStatus();
  updateTimer();
  updateHintButton();
  setMessage(RULES_MESSAGE);
}

function updateSizeButtons() {
  sizeButtons.forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.size) === activeSize);
  });
}

function updateClueLevelButtons() {
  clueLevelButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.level === activeClueLevel);
  });
}

function updateHintButton() {
  hintButton.textContent = `Hint (${hintsRemaining})`;
  hintButton.disabled = hintsRemaining === 0 || solved;
}

function flashCells() {
  board.querySelectorAll(".cell").forEach((cell, index) => {
    window.setTimeout(() => cell.classList.add("flash"), index * 28);
  });
}

function launchConfetti() {
  confettiLayer.innerHTML = "";

  for (let index = 0; index < 42; index += 1) {
    const piece = document.createElement("span");
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.animationDelay = `${Math.random() * 0.25}s`;
    piece.style.background = ["#78c56f", "#dcc35b", "#4c92d9", "#d7685f"][index % 4];
    confettiLayer.append(piece);
  }

  window.setTimeout(() => {
    confettiLayer.innerHTML = "";
  }, 1800);
}

function clearMarks() {
  board.querySelectorAll(".cell").forEach((cell) => {
    cell.classList.remove("good", "bad", "flash");
  });
}

function markCell(index, className) {
  getCell(index).classList.add(className);
}

function getCell(index) {
  return board.querySelector(`[data-index="${index}"]`);
}

function setMessage(text, tone = "") {
  message.textContent = text;
  message.className = `message ${tone}`.trim();
}

function sum(valuesToAdd) {
  return valuesToAdd.reduce((total, value) => total + value, 0);
}

sizeButtons.forEach((button) => {
  button.addEventListener("click", () => newPuzzle(Number(button.dataset.size), activeClueLevel));
});
clueLevelButtons.forEach((button) => {
  button.addEventListener("click", () => newPuzzle(activeSize, button.dataset.level));
});
checkButton.addEventListener("click", checkBoard);
hintButton.addEventListener("click", useHint);
answerButton.addEventListener("click", showAnswer);
resetButton.addEventListener("click", resetPuzzle);
nextButton.addEventListener("click", () => newPuzzle(activeSize, activeClueLevel));
leaderboardButton.addEventListener("click", showLeaderboard);
playAgainButton.addEventListener("click", () => {
  completeModal.classList.add("hidden");
  newPuzzle(activeSize, activeClueLevel);
});
closeLeaderboardButton.addEventListener("click", () => leaderboardModal.classList.add("hidden"));

newPuzzle(3, "medium");
