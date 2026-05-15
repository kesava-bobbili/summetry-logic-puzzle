# suMMetry

A playable prototype for the **Product Pickle Games** collection.

suMMetry is a small number-and-logic puzzle built around one simple idea: fill the grid so the sum stays constant in every direction. This version turns the coming-soon concept into a working browser game that can be reviewed, played, and extended.

## Why I Built This

Product Pickle Games already has a strong daily-puzzle identity: compact rules, clean interactions, and a dark retro interface. suMMetry fits that world as a math-logic companion to the word games already listed on the site.

The goal of this prototype is to show the core game loop clearly:

- understand the target sum
- fill the empty cells
- get immediate feedback
- solve the grid by balancing rows, columns, and diagonals

## How To Play

Use each number from `1` to `9` once.

Every row, column, and diagonal must add up to the target sum.

For the current 3x3 mode, the target is `15`.

## Features

- Playable 3x3 suMMetry puzzle
- Three starter puzzle layouts
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
- Dark monospace style inspired by Product Pickle Games

## Run Locally

This prototype is dependency-free. Open `index.html` directly in a browser, or run a local server:

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
- `styles.css` - responsive Product Pickle-inspired visual design
- `script.js` - puzzle data, validation, feedback, and interactions

## Suggested Product Roadmap

- Add a daily puzzle seed
- Add win streaks and completion time
- Add shareable result text
- Add a harder 4x4 mode
- Add puzzle generation instead of fixed puzzle data
- Integrate into the Product Pickle Games routing and layout

## Internship Handoff Note

This is an MVP designed to prove the suMMetry game concept quickly. The next best step is to review the gameplay with Product Pickle, agree on the final rules, and then adapt this prototype into their existing website structure.
