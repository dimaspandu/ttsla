import type { LetterStatus } from "~/contracts/types";
import evaluateGuess from "./evaluateGuess";
import mergeKeyStatuses from "./mergeKeyStatuses";

/**
 * RPC bridge for crossword modal logic.
 * This class allows client-side fallback logic when the server-provided
 * implementations are not yet synchronized.
 */
class CrosswordModalRPC {
  private _evaluateGuess: ((guess: string, answer: string) => LetterStatus[]) | null = null;
  private _mergeKeyStatuses:
    | ((
        prev: Record<string, LetterStatus | undefined>,
        updates: Record<string, LetterStatus>
      ) => Record<string, LetterStatus | undefined>)
    | null = null;

  /**
   * Sync the "evaluateGuess" function from the server.
   */
  syncEvaluateGuess(fn: (guess: string, answer: string) => LetterStatus[]): void {
    this._evaluateGuess = fn;
  }

  /**
   * Evaluate guess vs answer using the server-synced function if available,
   * otherwise fall back to the local implementation.
   */
  getStatuses(guess: string, answer: string): LetterStatus[] {
    const evaluator = this._evaluateGuess ?? evaluateGuess;
    return evaluator(guess, answer);
  }

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
   * Merge key status maps using the server-synced function if available,
   * otherwise fall back to the local implementation.
   */
  mergeKeyStatuses(
    prev: Record<string, LetterStatus | undefined>,
    updates: Record<string, LetterStatus>
  ): Record<string, LetterStatus | undefined> {
    const merger = this._mergeKeyStatuses ?? mergeKeyStatuses;
    return merger(prev, updates);
  }
}

export const crosswordModalRPC = new CrosswordModalRPC();
export default crosswordModalRPC;
