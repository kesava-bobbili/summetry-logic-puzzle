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

Choose a puzzle size: `3x3`, `4x4`, or `5x5`.

Use each number in the puzzle range once:

- `3x3`: numbers `1-9`, target `15`
- `4x4`: numbers `1-16`, target `34`
- `5x5`: numbers `1-25`, target `65`

Every row, column, and diagonal must add up to the target sum.

## Features

- Playable 3x3, 4x4, and 5x5 magic-square puzzles
- Fixed clue cells
- Number-only inputs
- Instant right/wrong feedback for each input
- Duplicate number detection
- Row, column, and diagonal validation
- Helpful explanation when a completed line misses the target
- Timer that starts on first input and stops on solve
- Local top-five leaderboard per difficulty
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

## Project Files

- `index.html` - app structure
- `styles.css` - responsive visual design
- `script.js` - puzzle generation, validation, timer, leaderboard, hints, feedback, and interactions

## Suggested Roadmap

- Add a daily puzzle seed
- Add win streaks
- Add shareable result text
- Add puzzle archives
- Add difficulty levels based on clue count

## Project Note

This is an MVP designed to prove the suMMetry game concept quickly. The next best step is to review the gameplay, tune the difficulty, and decide whether the 3x3 format should stay as the main mode or become the beginner level for larger grids.
