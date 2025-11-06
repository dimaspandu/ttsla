import type { LetterStatus } from "../contracts/types";

/**
 * Merge per-letter key statuses with priority:
 * correct > present > absent.
 */
export const mergeKeyStatuses = (
  prev: Record<string, LetterStatus | undefined>,
  updates: Record<string, LetterStatus>
): Record<string, LetterStatus | undefined> => {
  const next = { ...prev };

  for (const [key, value] of Object.entries(updates)) {
    const existing = next[key];

    if (existing === "correct") continue; // never downgrade
    if (value === "correct") next[key] = "correct";
    else if (value === "present" && (existing as LetterStatus) !== "correct")
      next[key] = "present";
    else if (value === "absent" && !existing) next[key] = "absent";
  }

  return next;
};
