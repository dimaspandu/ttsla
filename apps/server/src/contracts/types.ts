export type GridCell = number;

export interface Answer {
  direction: "across" | "down";
  start: [number, number];
  word: string;
}

export interface CrosswordData {
  id: number;
  rows: number;
  cols: number;
  grid: GridCell[][];
  answers: Answer[];
}

// source: https://kbbi.web.id/${word}/ajax_submit${randId}
export interface KbbiEntry {
  x: number;
  w: string;       // the word itself
  d: string;       // HTML description
  msg?: string;    // optional message field
}
