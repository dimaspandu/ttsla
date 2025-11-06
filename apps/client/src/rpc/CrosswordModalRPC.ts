import type { LetterStatus } from "~/contracts/types";

class CrosswordModalRPC {
  _evaluateGuess = null;
  _mergeKeyStatuses = null;

  syncEvaluateGuess(evaluateGuessFromServer: never) {
    this._evaluateGuess = evaluateGuessFromServer;
  }

  getStatuses(guess: string, answer: string) {
    if (this._evaluateGuess) {
      return (this._evaluateGuess as CallableFunction)(guess, answer);
    }
  }

  syncMergeKeyStatuses(mergeKeyStatusesFromServer: never) {
    this._mergeKeyStatuses = mergeKeyStatusesFromServer;
  }

  mergeKeyStatuses(
    prev: Record<string, LetterStatus | undefined>,
    updates: Record<string, LetterStatus>
  ) {
    if (this._mergeKeyStatuses) {
      return (this._mergeKeyStatuses as CallableFunction)(prev, updates);
    }
  }
}

export const crosswordModalRPC = new CrosswordModalRPC();

export default crosswordModalRPC;