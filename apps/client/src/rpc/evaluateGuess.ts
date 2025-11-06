import type { LetterStatus } from "../contracts/types";

/**
 * Evaluates a guessed word against the correct answer.
 * Wordle-style logic:
 * 1. Mark exact matches as "correct".
 * 2. Mark "present" if letter exists elsewhere (and count not depleted).
 */
export const evaluateGuess = (guess: string, answer: string): LetterStatus[] => {
  const result: LetterStatus[] = Array(answer.length).fill("absent");
  const letterCount: Record<string, number> = {};

  // Count letters in answer
  for (const ch of answer) {
    letterCount[ch] = (letterCount[ch] || 0) + 1;
  }

  // Pass 1: mark correct
  for (let i = 0; i < guess.length; i++) {
    const g = guess[i];
    if (g === answer[i]) {
      result[i] = "correct";
      letterCount[g]--;
    }
  }

  // Pass 2: mark present
  for (let i = 0; i < guess.length; i++) {
    const g = guess[i];
    if (result[i] === "correct") continue;
    if (letterCount[g] > 0) {
      result[i] = "present";
      letterCount[g]--;
    }
  }

  return result;
};

export default evaluateGuess;
