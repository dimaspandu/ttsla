import words from "../data/words.json";

type Direction = "across" | "down";

interface Answer {
  direction: Direction;
  start: [number, number];
  word: string;
}

interface Crossword {
  id: number;
  rows: number;
  cols: number;
  grid: number[][];
  answers: Answer[];
}

// Create empty grid
function createGrid(rows: number, cols: number): string[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(""));
}

// Check if a word can be safely placed inside the grid
function canPlace(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  direction: Direction
): boolean {
  const rows = grid.length;
  const cols = grid[0].length;

  for (let i = 0; i < word.length; i++) {
    const r = direction === "down" ? row + i : row;
    const c = direction === "across" ? col + i : col;

    if (r < 0 || c < 0 || r >= rows || c >= cols) return false;
    const cell = grid[r][c];
    if (cell !== "" && cell !== word[i]) return false;
  }

  return true;
}

// Place word in grid
function placeWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  direction: Direction
) {
  for (let i = 0; i < word.length; i++) {
    const r = direction === "down" ? row + i : row;
    const c = direction === "across" ? col + i : col;
    grid[r][c] = word[i];
  }
}

// Generate random integer within range
function rand(max: number): number {
  return Math.floor(Math.random() * max);
}

// Generate crossword with random placement pattern
export function generateRandomCrossword(
  sourceWords: string[] = words,
  rows = 6,
  cols = 5
): Crossword {
  const grid = createGrid(rows, cols);
  const answers: Answer[] = [];

  const shuffled = [...sourceWords].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 4).map(w => w.toUpperCase());

  // Try placing each word at a random valid position
  for (const word of selected) {
    const direction: Direction = Math.random() > 0.5 ? "across" : "down";

    // Random starting position that fits within grid
    const maxRow = direction === "across" ? rows : rows - word.length;
    const maxCol = direction === "down" ? cols : cols - word.length;
    const startRow = rand(Math.max(1, maxRow));
    const startCol = rand(Math.max(1, maxCol));

    if (canPlace(grid, word, startRow, startCol, direction)) {
      placeWord(grid, word, startRow, startCol, direction);
      answers.push({ direction, start: [startRow, startCol], word });
    }
  }

  // Convert to binary 1/0 grid
  const binaryGrid = grid.map(row => row.map(cell => (cell ? 1 : 0)));

  return {
    id: Math.floor(Math.random() * 1000),
    rows,
    cols,
    grid: binaryGrid,
    answers,
  };
}
