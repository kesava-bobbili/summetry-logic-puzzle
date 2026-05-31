# suMMetry

**[Play live](https://kesava-bobbili.github.io/summetry-logic-puzzle/)** · [Repository](https://github.com/kesava-bobbili/summetry-logic-puzzle)

A **3×3 equal-sum sandbox** puzzle. This is not a magic square — there is no hidden answer and no fixed target shown during play.

## Rules

- Grid size is **3×3** only.
- Use digits **1–9**. Numbers may **repeat**.
- You start with **prefilled clues** (see difficulty below).
- **No target sum** is displayed while you play.
- When a **row, column, or diagonal** is completely filled, the game immediately shows whether it matches the **current common sum** (the sum agreed on by all completed lines so far).
- You win when **all nine cells** are filled and **all eight lines** (3 rows, 3 columns, 2 diagonals) share the **same sum**.
- Any arrangement that satisfies those equal-sum constraints is accepted.
- After you solve the puzzle, the game reveals the **common sum you achieved**.

## Difficulty

| Level  | Prefilled clues |
|--------|-----------------|
| Easy   | 5               |
| Medium | 4               |
| Hard   | 3               |

Clues are random digits in random cells. They are starting hints only — not a hidden solution.

## Features

- Live line feedback on completed rows, columns, and diagonals
- Check button for full-board validation
- Timer and per-difficulty leaderboard
- Reset and New Puzzle
- Number pad and keyboard navigation

## Run Locally

```bash
python3 -m http.server 5173
```

Open http://localhost:5173/ (or `/summetry/` if this folder lives inside a larger repo).

## Verify

```bash
npm test
```

## Project Files

- `index.html` — layout and rules copy
- `styles.css` — visuals
- `script.js` — UI and gameplay
- `puzzle-engine.mjs` — clue generation and equal-sum analysis
- `tests/verify-sandbox.mjs` — automated checks
