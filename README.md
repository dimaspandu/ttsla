# TTSLA - Crossword Puzzle Inspired by Katla

**TTSLA (Teka Teki Silang berbasis Katla)** is an interactive word puzzle inspired by the Indonesian Wordle, Katla - but with a crossword twist.
Players guess interconnected words in a crossword grid using Katla-style mechanics, where letters reveal accuracy hints in color.

## Features

- Katla-style letter feedback (green/yellow/gray)
- Interconnected crossword logic with auto-solve for intersecting words
- Responsive grid layout with smooth interactions
- Daily lock system (one puzzle per day)
- Minimalist, modular, and fast - built for experimentation
- RPC-like "shared procedure imports" between client and server for fast iteration

## Tech Stack

### Frontend
- React 19 + Vite 7 + TypeScript
- SCSS (BEM-based)
- Zustand for state management
- React Router DOM 7
- Vitest for testing

### Backend
- Node.js + TypeScript (no heavy framework)
- Dynamic ES Module loading (import())
- Shared procedure concept (acts like local RPC)

## Project Structure

```
ttsla/
├── apps/
│   ├── client/                 # React + Vite frontend
│   │   └── src/
│   │       ├── components/
│   │       ├── rpc/             # Client-side RPC wrappers
│   │       └── scenes/
│   └── server/                 # Lightweight TypeScript server (Vite lib build)
│       └── src/
│           ├── procedures/      # Shared callable functions (RPC-style)
│           ├── data/            # Words and template data
│           └── utils/
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## RPC-like Procedure System

Instead of using REST or GraphQL APIs, this project employs RPC-like dynamic imports during development.

Example:
```ts
const remoteProcedureUrl = "http://localhost:5174/src/procedures/getRandomCrossword.ts";
const { getRandomCrossword } = await import(/* @vite-ignore */ remoteProcedureUrl);
const puzzle = await getRandomCrossword();
```

Concept:
- The client imports and executes TypeScript functions directly from the server.
- Works like a local Remote Procedure Call (RPC).
- Avoids creating API endpoints for each function.
- Suitable for rapid prototyping and local development.

## Getting Started

### Install Dependencies
```bash
pnpm install
```

### Start the Development Servers

Run both server and client from the repo root:

```bash
pnpm run dev
```

Or run separately:

```bash
# Terminal 1 - Run server
pnpm --filter ttsla-server dev
# -> http://localhost:5174/

# Terminal 2 - Run client
pnpm --filter ttsla-client dev
# -> http://localhost:4173/
```

The client dynamically imports logic from the server at runtime.

## Development Workflow

### Edit or Add a New Procedure
Place logic under:
```
apps/server/src/procedures/
```

Example:
```ts
export function getRandomCrossword() {
  return {
    id: 443,
    rows: 6,
    cols: 5,
    grid: [...],
    answers: [...]
  };
}
```

### Consume It from the Client
In the React side (e.g. `apps/client/src/scenes/MainScene/index.tsx`):
```ts
const { getRandomCrossword } = await import(
  /* @vite-ignore */ "http://localhost:5174/src/procedures/getRandomCrossword.ts"
);
const data = await getRandomCrossword();
setPuzzle(data);
```

This behaves just like calling a backend API, but directly reuses the same code file.

## How to Play

1. Click on a word slot in the crossword grid.
2. Guess the word using the Katla-style mini-game (6 tries max).
3. Color feedback uses green (correct letter and position), yellow (correct letter, wrong position), and gray (letter not in the word).
4. Solving one word can auto-solve intersecting ones.
5. Once completed, your progress is locked for the day.

## Scripts

| Command | Description |
|----------|--------------|
| `pnpm run dev` | Start both dev servers from repo root |
| `pnpm --filter ttsla-server dev` | Start the server dev build |
| `pnpm --filter ttsla-client dev` | Start the client dev server |
| `pnpm --filter ttsla-client build` | Build the frontend |
| `pnpm --filter ttsla-client test` | Run frontend tests |

## Changelog

See `CHANGELOG.md`.

## Tags

`crossword` `katla` `word-game` `indonesian` `react` `vite` `typescript` `zustand` `rpc-like`

## Author

Developed by Nam Do San - restructured for modern TypeScript prototyping.

## License

Licensed under the ISC License.