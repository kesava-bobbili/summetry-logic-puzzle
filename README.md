# suMMetry

A playable number-and-logic puzzle project.

suMMetry is built around one simple idea: fill the grid so the sum stays constant in every direction. The game is quick to understand, but every move matters because each number affects a row, a column, and sometimes a diagonal.

## Why I Built This

This project was created as a polished browser-game prototype. The goal is to show a clean core game loop:

- understand the target sum
- fill the empty cells
- get immediate feedback
- solve the grid by balancing rows, columns, and diagonals

## How To Play

Use each number in the puzzle range once.

Every row, column, and diagonal must add up to the target sum.

The target changes from puzzle to puzzle and stays below `100`.

## Features

- Playable 3x3 suMMetry puzzle
- 100 puzzle variations
- Changing target sums under 100
- Fixed clue cells
- Number-only inputs
- Instant right/wrong feedback for each input
- Duplicate number detection
- Row, column, and diagonal validation
- Helpful explanation when a completed line misses the target
- Show Answer button for demo/review mode
- Reset and New Puzzle controls
- Keyboard arrow navigation
- Responsive layout for desktop and mobile
- Dark monospace game interface

## Run Locally

This project is dependency-free. Open `index.html` directly in a browser, or run a local server:

```bash
python3 -m http.server 5173
```

Then visit:

```text
http://localhost:5173/
```

If this folder is inside a larger workspace, visit:

```text
http://localhost:5173/summetry/
```

## Project Files

- `index.html` - app structure
- `styles.css` - responsive visual design
- `script.js` - puzzle generation, validation, feedback, and interactions

## Suggested Roadmap

- Add a daily puzzle seed
- Add win streaks and completion time
- Add shareable result text
- Add a harder 4x4 mode
- Add a puzzle selector
- Add difficulty levels based on clue count

## Project Note

This is an MVP designed to prove the suMMetry game concept quickly. The next best step is to review the gameplay, tune the difficulty, and decide whether the 3x3 format should stay as the main mode or become the beginner level for larger grids.
