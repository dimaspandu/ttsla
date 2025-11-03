import templatesJson from "./templates.json";
import kbbiJson from "./kbbiWords.json";

export type Arah = "mendatar" | "menurun";

export interface TTSSlot {
  no: number;
  arah: Arah;
  start: [number, number];
  length: 4 | 5 | 6;
}

export interface TTSTemplate {
  id: string;
  name: string;
  gridSize: [number, number];
  words: TTSSlot[];
}

interface KBBIWordBanks {
  KBBI_4: string[];
  KBBI_5: string[];
  KBBI_6: string[];
}

const templatesData = templatesJson as TTSTemplate[];
const kbbiWordBanks = kbbiJson as KBBIWordBanks;

export const TTS_TEMPLATES: TTSTemplate[] = templatesData.map((template) => ({
  ...template,
  words: template.words.map((slot) => ({ ...slot })) as TTSSlot[]
}));

export const KBBI_4: string[] = [...kbbiWordBanks.KBBI_4];
export const KBBI_5: string[] = [...kbbiWordBanks.KBBI_5];
export const KBBI_6: string[] = [...kbbiWordBanks.KBBI_6];

export function getKbbiByLength(len: number): string[] {
  if (len === 4) return KBBI_4;
  if (len === 5) return KBBI_5;
  if (len === 6) return KBBI_6;
  return [];
}

export function isKBBIWord(word: string, len: number): boolean {
  const list = getKbbiByLength(len);
  const lower = word.trim().toLowerCase();
  return list.some((w) => w.toLowerCase() === lower);
}

export function seedFromDate(dateStr: string): number {
  let h = 0;
  for (let i = 0; i < dateStr.length; i += 1) {
    h = (h * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function pickFromArray<T>(arr: T[] | null | undefined, seed: number, offset = 0): T | null {
  if (!arr || arr.length === 0) return null;
  const idx = Math.abs(seed + offset) % arr.length;
  return arr[idx];
}

export function getTodayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface JawabanHarianEntry {
  no: number;
  jawaban: string | null;
  kbbi_valid: boolean;
  playable: boolean;
}

export interface DailyPuzzle {
  date: string;
  template_id: string;
  jawaban_harian: JawabanHarianEntry[];
}

export function getDailyPuzzle(dateStr: string = getTodayISO()): DailyPuzzle | null {
  const seed = seedFromDate(dateStr);
  const template = pickFromArray(TTS_TEMPLATES, seed);
  if (!template) return null;

  const jawaban_harian = template.words.map((slot, idx) => {
    const bank = getKbbiByLength(slot.length);
    const picked = pickFromArray(bank, seed, idx);
    const valid = !!picked && isKBBIWord(picked, slot.length);
    return {
      no: slot.no,
      jawaban: valid ? picked!.toUpperCase() : null,
      kbbi_valid: valid,
      playable: valid
    } satisfies JawabanHarianEntry;
  });

  return {
    date: dateStr,
    template_id: template.id,
    jawaban_harian
  } satisfies DailyPuzzle;
}

export function fillWordOnBoard(
  board: string[][],
  template: TTSTemplate,
  wordNo: number,
  answer: string
): string[][] {
  const slot = template.words.find((w) => w.no === wordNo);
  if (!slot) return board;
  const [sr, sc] = slot.start;
  const chars = answer.split("");
  const newBoard = board.map((row) => [...row]);

  for (let i = 0; i < chars.length; i += 1) {
    if (slot.arah === "mendatar") {
      newBoard[sr][sc + i] = chars[i];
    } else {
      newBoard[sr + i][sc] = chars[i];
    }
  }

  return newBoard;
}

// Example consumption
const daily = getDailyPuzzle("2025-11-03");
if (daily) {
  const template = TTS_TEMPLATES.find((t) => t.id === daily.template_id)!;
  // render template.gridSize
  // render numbers from template.words
  // onClick number N → open Katla with daily.jawaban_harian.find(x => x.no === N)?.jawaban
  void template;
}
