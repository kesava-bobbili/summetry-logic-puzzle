# suMMetry
🔗 **Live Demo:** [Play suMMetry](https://kesava-bobbili.github.io/summetry-logic-puzzle/)
A playable number-and-logic puzzle project.

suMMetry is built around one simple idea: fill the grid so the sum stays constant in every direction. The game is quick to understand, but every move matters because each number affects a row, a column, and sometimes a diagonal.

## Why I Built This

This project was created as a polished browser-game prototype. The goal is to show a clean core game loop:

- understand the target sum
- fill the empty cells
- get immediate feedback
- solve the grid by balancing rows, columns, and diagonals

## How To Play

Fill the grid so that every row, every column, and both diagonals add up to the same target sum. Repeating numbers is allowed as long as the values stay within the allowed range for the selected grid size.

Choose a puzzle size: `3x3`, `4x4`, or `5x5`.

Choose a difficulty:

- **Easy** — about 50–60% of cells prefilled
- **Medium** — about 35–45% prefilled
- **Hard** — about 20–30% prefilled

Allowed values and target sums:

- `3x3`: digits `1–9`, target `15`
- `4x4`: values `1–16`, target `34`
- `5x5`: values `1–25`, target `65`

Every row, column, and diagonal must add up to the target sum. Each generated puzzle has exactly one valid solution.

## Features

- Playable 3x3, 4x4, and 5x5 sum puzzles
- Easy, Medium, and Hard clue levels
- Unique-solution puzzle generation with backtracking verification
- Repeating numbers allowed within the grid range
- Fixed clue cells
- Number-only inputs
- Instant right/wrong feedback for each input
- Row, column, and diagonal validation
- Helpful explanation when a completed line misses the target
- Timer that starts on first input and stops on solve
- Local top-five leaderboard per grid size
- Completion modal with celebration animation
- Hint system with three hints per puzzle
- Show Answer button for demo/review mode
- Reset and New Puzzle controls
- Keyboard arrow navigation
- Mobile number pad for touch play
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

## Verify Puzzles

Run the unique-solution verification checks:

```bash
node tests/verify-puzzles.mjs
```

## Project Files

- `index.html` - app structure
- `styles.css` - responsive visual design
- `script.js` - UI, validation, timer, leaderboard, hints, feedback, and interactions
- `puzzle-engine.mjs` - puzzle generation, solver, and uniqueness checks
- `tests/verify-puzzles.mjs` - automated puzzle verification

## Suggested Roadmap

- Add a daily puzzle seed
- Add win streaks
- Add shareable result text
- Add puzzle archives
- Add per-difficulty leaderboards

## Project Note

This is an MVP designed to prove the suMMetry game concept quickly. The next best step is to review the gameplay, tune the difficulty, and decide whether the 3x3 format should stay as the main mode or become the beginner level for larger grids.
