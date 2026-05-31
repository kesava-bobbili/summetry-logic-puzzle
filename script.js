import {
  MAX_VALUE,
  MIN_VALUE,
  RULES_MESSAGE,
  analyzeBoard,
  createLines,
  createPuzzle,
  isValidValue,
} from "./puzzle-engine.mjs";

const board = document.querySelector("#board");
const puzzleName = document.querySelector("#puzzle-name");
const progressCount = document.querySelector("#progress-count");
const lineStatus = document.querySelector("#line-status");
const timerText = document.querySelector("#timer");
const message = document.querySelector("#message");
const numberPad = document.querySelector("#number-pad");
const checkButton = document.querySelector("#check-button");
const resetButton = document.querySelector("#reset-button");
const nextButton = document.querySelector("#next-button");
const leaderboardButton = document.querySelector("#leaderboard-button");
const clueLevelButtons = document.querySelectorAll(".clue-level-button");
const completeModal = document.querySelector("#complete-modal");
const completeTime = document.querySelector("#complete-time");
const completeSum = document.querySelector("#complete-sum");
const playAgainButton = document.querySelector("#play-again-button");
const leaderboardModal = document.querySelector("#leaderboard-modal");
const leaderboardList = document.querySelector("#leaderboard-list");
const closeLeaderboardButton = document.querySelector("#close-leaderboard-button");
const confettiLayer = document.querySelector("#confetti-layer");

const lines = createLines();

let activeClueLevel = "medium";
let puzzleCounter = 1;
let puzzle = null;
let selectedCellIndex = null;
let elapsedSeconds = 0;
let timerId = null;
let timerStarted = false;
let solved = false;

function newPuzzle(clueLevel = activeClueLevel) {
  completeModal.classList.add("hidden");
  activeClueLevel = clueLevel;
  stopTimer();
  elapsedSeconds = 0;
  timerStarted = false;
  solved = false;
  selectedCellIndex = null;
  puzzle = createPuzzle(puzzleCounter, clueLevel);
  puzzleCounter += 1;
  buildBoard();
  buildNumberPad();
  updateClueLevelButtons();
  updateStatus();
  updateTimer();
  applyLineFeedback();
  setMessage(RULES_MESSAGE);
}

function buildBoard() {
  board.innerHTML = "";
  board.style.setProperty("--size", 3);
  puzzleName.textContent = puzzle.name;

  puzzle.givens.forEach((value, index) => {
    const input = document.createElement("input");
    input.className = "cell";
    input.type = "text";
    input.inputMode = "numeric";
    input.maxLength = 1;
    input.setAttribute("aria-label", `Cell ${index + 1}`);
    input.dataset.index = index;

    if (value !== null) {
      input.value = value;
      input.readOnly = true;
      input.classList.add("fixed");
      input.setAttribute("aria-label", `Clue cell ${index + 1}, value ${value}`);
    }

    input.addEventListener("input", handleInput);
    input.addEventListener("focus", handleFocus);
    input.addEventListener("keydown", handleArrowKeys);
    board.append(input);
  });
}

function buildNumberPad() {
  numberPad.innerHTML = "";

  for (let value = MIN_VALUE; value <= MAX_VALUE; value += 1) {
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
  input.value = input.value.replace(/\D/g, "").slice(0, 1);
  selectedCellIndex = Number(input.dataset.index);
  updateCellMessage(input);
  applyLineFeedback();
  updateStatus();
  detectSolved();
}

function handleFocus(event) {
  selectedCellIndex = Number(event.target.dataset.index);
  updateCellMessage(event.target);
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

function applyPadValue(value) {
  if (selectedCellIndex === null || solved) {
    setMessage("Select an editable cell first.");
    return;
  }

  const cell = getCell(selectedCellIndex);

  if (!cell || cell.readOnly) {
    setMessage("That cell is a clue and cannot be changed.");
    return;
  }

  cell.value = value;
  cell.focus();
  cell.dispatchEvent(new Event("input", { bubbles: true }));
}

function values() {
  return [...board.querySelectorAll(".cell")].map((cell) => {
    const raw = cell.value.trim();
    return raw === "" ? null : Number(raw);
  });
}

function updateStatus() {
  const cells = values();
  const filled = cells.filter((value) => value !== null).length;
  const analysis = analyzeBoard(cells);

  progressCount.textContent = `${filled}/9`;
  lineStatus.textContent = `${analysis.alignedLines}/8`;
}

function applyLineFeedback() {
  const cells = values();
  const analysis = analyzeBoard(cells);

  board.querySelectorAll(".cell").forEach((cell) => {
    if (!cell.classList.contains("fixed")) {
      cell.classList.remove("good", "bad");
    }
  });

  analysis.lineStates.forEach((state, lineIndex) => {
    if (state === "incomplete") {
      return;
    }

    const className = state === "aligned" ? "good" : "bad";
    lines[lineIndex].forEach((index) => markCell(index, className));
  });
}

function checkBoard() {
  const cells = values();
  const analysis = analyzeBoard(cells);

  applyLineFeedback();

  if (analysis.solved) {
    finishPuzzle(analysis.commonSum);
    return;
  }

  if (cells.some((value) => value === null)) {
    setMessage("Fill every cell, then check again.");
    return;
  }

  if (analysis.inconsistent) {
    setMessage("Completed lines disagree on the sum. Adjust the highlighted lines.", "warn");
    return;
  }

  if (analysis.commonSum !== null) {
    setMessage(
      `Lines share sum ${analysis.commonSum} so far. Keep going until every row, column, and diagonal matches.`,
    );
    return;
  }

  setMessage("Some lines still need work. Check the highlighted rows, columns, or diagonals.", "warn");
}

function detectSolved() {
  const analysis = analyzeBoard(values());

  if (analysis.solved) {
    finishPuzzle(analysis.commonSum);
  }
}

function updateCellMessage(input) {
  const index = Number(input.dataset.index);
  const value = input.value === "" ? null : Number(input.value);

  if (input.classList.contains("fixed")) {
    setMessage(`Cell ${index + 1} is a clue.`);
    return;
  }

  if (value === null) {
    setMessage(`Cell ${index + 1}: enter a digit from 1 to 9.`);
    return;
  }

  if (!isValidValue(value)) {
    setMessage(`Cell ${index + 1}: use digits 1 to 9 only.`, "warn");
    return;
  }

  const analysis = analyzeBoard(values());
  const touching = lines
    .map((line, lineIndex) => ({ line, lineIndex, state: analysis.lineStates[lineIndex] }))
    .filter((entry) => entry.line.includes(index) && entry.state !== "incomplete");

  if (touching.some((entry) => entry.state === "conflict")) {
    setMessage(`Cell ${index + 1}: completed lines disagree on the sum.`, "warn");
    return;
  }

  const aligned = touching.filter((entry) => entry.state === "aligned");

  if (aligned.length > 0 && analysis.commonSum !== null) {
    setMessage(`Cell ${index + 1}: its completed lines match sum ${analysis.commonSum}.`);
    return;
  }

  setMessage(`Cell ${index + 1}: value accepted. Complete a line to check its sum.`);
}

function finishPuzzle(commonSum) {
  if (solved) {
    return;
  }

  solved = true;
  stopTimer();
  saveLeaderboardTime(activeClueLevel, elapsedSeconds);
  applyLineFeedback();
  flashCells();
  launchConfetti();
  completeSum.textContent = `Common sum: ${commonSum}`;
  completeTime.textContent = `Time: ${formatTime(elapsedSeconds)}`;
  completeModal.classList.remove("hidden");
  setMessage(`Solved. Every row, column, and diagonal sums to ${commonSum}.`, "win");
}

function saveLeaderboardTime(level, seconds) {
  const key = leaderboardKey(level);
  const times = getLeaderboard(level);
  times.push(seconds);
  localStorage.setItem(key, JSON.stringify(times.sort((a, b) => a - b).slice(0, 5)));
}

function getLeaderboard(level) {
  try {
    return JSON.parse(localStorage.getItem(leaderboardKey(level))) || [];
  } catch {
    return [];
  }
}

function leaderboardKey(level) {
  return `summetry-leaderboard-${level}`;
}

function showLeaderboard() {
  leaderboardList.innerHTML = "";

  Object.keys({ easy: 5, medium: 4, hard: 3 }).forEach((level) => {
    const section = document.createElement("section");
    const title = document.createElement("h3");
    const list = document.createElement("ol");
    const times = getLeaderboard(level);

    title.textContent = capitalize(level);

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

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
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
  selectedCellIndex = null;
  buildBoard();
  updateStatus();
  updateTimer();
  applyLineFeedback();
  setMessage(RULES_MESSAGE);
}

function updateClueLevelButtons() {
  clueLevelButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.level === activeClueLevel);
  });
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

clueLevelButtons.forEach((button) => {
  button.addEventListener("click", () => newPuzzle(button.dataset.level));
});
checkButton.addEventListener("click", checkBoard);
resetButton.addEventListener("click", resetPuzzle);
nextButton.addEventListener("click", () => newPuzzle(activeClueLevel));
leaderboardButton.addEventListener("click", showLeaderboard);
playAgainButton.addEventListener("click", () => {
  completeModal.classList.add("hidden");
  newPuzzle(activeClueLevel);
});
closeLeaderboardButton.addEventListener("click", () => leaderboardModal.classList.add("hidden"));

newPuzzle("medium");
