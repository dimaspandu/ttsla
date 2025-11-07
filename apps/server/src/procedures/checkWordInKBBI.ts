import words from "../data/words.json" assert { type: "json" };

/**
 * Checks whether a given word exists in the local KBBI dataset (words.json).
 *
 * This is a simple offline check using a preloaded JSON dictionary.
 * The lookup is case-insensitive and ignores surrounding whitespace.
 *
 * @param word - The input word to check.
 * @returns true if the word exists in KBBI, false otherwise.
 */
export function checkWordInKBBI(word: string): boolean {
  if (!word || typeof word !== "string") return false;

  // Normalize the input
  const normalized = word.trim().toLowerCase();

  // Create a Set once for faster lookup (lazy initialized)
  if (!checkWordInKBBI._wordSet) {
    checkWordInKBBI._wordSet = new Set(
      (words as string[]).map((w) => w.trim().toLowerCase())
    );
  }

  // Perform lookup
  return checkWordInKBBI._wordSet.has(normalized);
}

// Internal cache container (shared between calls)
checkWordInKBBI._wordSet = undefined as unknown as Set<string>;
