import type { LetterStatus } from "~/contracts/types";
import evaluateGuess from "./evaluateGuess";
import mergeKeyStatuses from "./mergeKeyStatuses";

/**
 * RPC bridge for crossword modal logic.
 *
 * This class serves as a dynamic bridge to functions that are typically
 * provided by the development server (RPC-style). It supports both:
 * - client-side fallback implementations (for offline dev use), and
 * - server-synced functions (for shared logic consistency).
 */
class CrosswordModalRPC {
  private _evaluateGuess: ((guess: string, answer: string) => LetterStatus[]) | null = null;
  private _mergeKeyStatuses:
    | ((
        prev: Record<string, LetterStatus | undefined>,
        updates: Record<string, LetterStatus>
      ) => Record<string, LetterStatus | undefined>)
    | null = null;

  // -------------------------------------------------------------
  // Evaluate Guess (server-synced with local fallback)
  // -------------------------------------------------------------

  /**
   * Sync the "evaluateGuess" function from the server.
   */
  syncEvaluateGuess(fn: (guess: string, answer: string) => LetterStatus[]): void {
    this._evaluateGuess = fn;
  }

  /**
   * Evaluate a guess against the answer.
   * Falls back to the local implementation if not synced.
   */
  getStatuses(guess: string, answer: string): LetterStatus[] {
    const evaluator = this._evaluateGuess ?? evaluateGuess;
    return evaluator(guess, answer);
  }

  // -------------------------------------------------------------
  // Merge Key Statuses (server-synced with local fallback)
  // -------------------------------------------------------------

  /**
   * Sync the "mergeKeyStatuses" function from the server.
   */
  syncMergeKeyStatuses(
    fn: (
      prev: Record<string, LetterStatus | undefined>,
      updates: Record<string, LetterStatus>
    ) => Record<string, LetterStatus | undefined>
  ): void {
    this._mergeKeyStatuses = fn;
  }

  /**
   * Merge key status maps.
   * Falls back to the local implementation if not synced.
   */
  mergeKeyStatuses(
    prev: Record<string, LetterStatus | undefined>,
    updates: Record<string, LetterStatus>
  ): Record<string, LetterStatus | undefined> {
    const merger = this._mergeKeyStatuses ?? mergeKeyStatuses;
    return merger(prev, updates);
  }
}

// -------------------------------------------------------------
// Export a singleton instance
// -------------------------------------------------------------
export const crosswordModalRPC = new CrosswordModalRPC();
export default crosswordModalRPC;
