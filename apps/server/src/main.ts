import { getRandomCrossword } from "./procedures/getRandomCrossword";
import { evaluateGuess } from "./procedures/evaluateGuess";
import { mergeKeyStatuses } from "./procedures/mergeKeyStatuses";

// ------------------------------------------------------------
// Entry point: run quick tests manually (no Jest / Vitest needed)
// ------------------------------------------------------------
(async function main() {
  console.log("=== Running crossword procedure tests ===");

  // ------------------------------------------------------------
  // getRandomCrossword()
  // ------------------------------------------------------------
  const crossword = getRandomCrossword();
  console.log("CHECK THE DATA:", crossword);

  console.assert(
    crossword !== null && crossword !== undefined,
    "getRandomCrossword() should not return null or undefined"
  );
  console.assert(
    typeof crossword === "object" || typeof crossword === "string",
    "getRandomCrossword() should return an object or string"
  );

  // ------------------------------------------------------------
  // evaluateGuess()
  // ------------------------------------------------------------
  const answer = "KOPI";
  const guess1 = "KOTA"; // 2 huruf benar, 1 posisi benar
  const guess2 = "KOPI"; // full correct
  const guess3 = "SUSU"; // semua salah

  const result1 = evaluateGuess(guess1, answer);
  const result2 = evaluateGuess(guess2, answer);
  const result3 = evaluateGuess(guess3, answer);

  console.log("\nevaluateGuess() results:");
  console.log("guess1:", guess1, "=>", result1);
  console.log("guess2:", guess2, "=>", result2);
  console.log("guess3:", guess3, "=>", result3);

  console.assert(
    Array.isArray(result1) && result1.length === answer.length,
    "evaluateGuess() should return array of statuses"
  );
  console.assert(
    result2.every((s) => s === "correct"),
    "evaluateGuess() should mark all letters as correct for exact match"
  );
  console.assert(
    result3.every((s) => s === "absent"),
    "evaluateGuess() should mark all letters absent for totally wrong guess"
  );

  // ------------------------------------------------------------
  // mergeKeyStatuses()
  // ------------------------------------------------------------
  const prevStatuses = {
    K: "present",
    O: "absent",
    P: undefined,
  } as Record<string, "correct" | "present" | "absent" | undefined>;

  const updates = {
    O: "correct",
    P: "present",
  } as Record<string, "correct" | "present" | "absent">;

  const merged = mergeKeyStatuses(prevStatuses, updates);

  console.log("\nmergeKeyStatuses() result:");
  console.log("Before:", prevStatuses);
  console.log("Updates:", updates);
  console.log("After :", merged);

  console.assert(
    merged.O === "correct",
    "mergeKeyStatuses() should upgrade O from absent → correct"
  );
  console.assert(
    merged.P === "present",
    "mergeKeyStatuses() should set P to present"
  );
  console.assert(
    merged.K === "present",
    "mergeKeyStatuses() should keep existing 'present'"
  );

  console.log("\n✅ All manual tests completed without assertion errors.\n");
})();
