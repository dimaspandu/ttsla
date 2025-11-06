import React, { useState, useEffect } from "react";
import type { CrosswordModalProps } from "~/contracts/props";
import type { LetterStatus } from "~/contracts/types";
import styles from "./CrosswordModal.module.scss";
import crosswordModalRPC from "~/rpc/CrosswordModalRPC";

const MAX_ATTEMPTS = 6;

const CrosswordModal: React.FC<CrosswordModalProps> = ({
  word,
  onClose,
  onSubmit,
  onRemainingAttempts,
}) => {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [keyStatuses, setKeyStatuses] = useState<
    Record<string, LetterStatus | undefined>
  >({});

  const correctWord = word.word.toUpperCase();

  // --------------------------------------------------
  // Determine statuses for a guess vs the correct word.
  // Wordle-style rule for duplicates:
  // 1) First pass -> mark exact matches (correct).
  // 2) Second pass -> mark present only if remaining count > 0.
  // --------------------------------------------------
  const getStatuses = (guess: string, answer: string): LetterStatus[] => {
    return crosswordModalRPC.getStatuses(guess, answer) as unknown as LetterStatus[];
  };

  // --------------------------------------------------
  // Merge keyboard statuses with priority:
  // correct > present > absent. Never downgrade correct.
  // --------------------------------------------------
  const mergeKeyStatuses = (
    prev: Record<string, LetterStatus | undefined>,
    updates: Record<string, LetterStatus>
  ): Record<string, LetterStatus | undefined> => {
    return crosswordModalRPC.mergeKeyStatuses(prev, updates) as unknown as Record<string, LetterStatus | undefined>;
  };

  // --------------------------------------------------
  // Handle keyboard input
  // --------------------------------------------------
  const handleKey = (key: string) => {
    if (key === "ENTER") {
      if (currentGuess.length === correctWord.length) {
        const guessUpper = currentGuess.toUpperCase();
        const isCorrect = guessUpper === correctWord;

        const newGuesses = [...guesses, guessUpper];
        setGuesses(newGuesses);
        setCurrentGuess("");
        onSubmit?.(guessUpper, isCorrect);

        // Compute statuses for the guess
        const statuses = getStatuses(guessUpper, correctWord);

        // Build per-letter updates for the keyboard
        const perLetterUpdate: Record<string, LetterStatus> = {};
        for (let i = 0; i < guessUpper.length; i++) {
          const ch = guessUpper[i];
          const st = statuses[i];
          const prev = perLetterUpdate[ch];

          if (prev === "correct") continue;
          if (st === "correct") perLetterUpdate[ch] = "correct";
          else if (st === "present" && (prev as LetterStatus) !== "correct")
            perLetterUpdate[ch] = "present";
          else if (st === "absent" && !prev) perLetterUpdate[ch] = "absent";
        }

        // Merge into global keyStatuses
        setKeyStatuses((prev) => mergeKeyStatuses(prev, perLetterUpdate));

        // Notify remaining attempts
        onRemainingAttempts?.(MAX_ATTEMPTS - newGuesses.length);
      }
      return;
    }

    if (key === "DEL") {
      setCurrentGuess((prev) => prev.slice(0, -1));
      return;
    }

    if (currentGuess.length < correctWord.length && /^[A-Z]$/.test(key)) {
      setCurrentGuess((prev) => prev + key.toUpperCase());
    }
  };

  // Map status to SCSS class
  const statusToClass = (status?: LetterStatus) =>
    status ? styles[`crossword-modal__cell--${status}`] : "";

  const allKeys = "QWERTYUIOP ASDFGHJKL ZXCVBNM".split("");
  const isSolved = guesses.some((g) => g === correctWord);
  const isFailed = guesses.length >= MAX_ATTEMPTS && !isSolved;

  // Keyboard listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isSolved || isFailed) return;

      const key = e.key.toUpperCase();
      if (key === "BACKSPACE") handleKey("DEL");
      else if (key === "ENTER") handleKey("ENTER");
      else if (/^[A-Z]$/.test(key)) handleKey(key);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGuess, guesses, isSolved, isFailed]);

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  return (
    <div className={styles["crossword-modal__overlay"]}>
      <div className={styles["crossword-modal"]}>
        {/* Close button */}
        <button
          className={styles["crossword-modal__close-icon"]}
          onClick={onClose}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 6L18 18M18 6L6 18"
              stroke="#222222"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Title */}
        <h2 className={styles["crossword-modal__title"]}>
          Tebak kata ({word.word.length} huruf)
        </h2>

        {/* Guess grid */}
        <div className={styles["crossword-modal__grid"]}>
          {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => {
            const guess = guesses[rowIndex] || "";
            const isCurrent = rowIndex === guesses.length;
            const statuses =
              !isCurrent && guess ? getStatuses(guess, correctWord) : [];

            return (
              <div key={rowIndex} className={styles["crossword-modal__row"]}>
                {Array.from({ length: correctWord.length }).map((_, colIndex) => {
                  const letter =
                    isCurrent && colIndex < currentGuess.length
                      ? currentGuess[colIndex]
                      : guess[colIndex] || "";
                  const statusClass =
                    !isCurrent && guess
                      ? statusToClass(statuses[colIndex])
                      : "";

                  return (
                    <div
                      key={colIndex}
                      className={`${styles["crossword-modal__cell"]} ${statusClass}`}
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Virtual keyboard */}
        <div className={styles["crossword-modal__keyboard"]}>
          {allKeys.map((key, i) =>
            key === " " ? (
              <div key={i} className={styles["crossword-modal__spacer"]}></div>
            ) : (
              <button
                key={i}
                onClick={() => handleKey(key)}
                className={`${styles["crossword-modal__key"]} ${
                  keyStatuses[key]
                    ? styles[`crossword-modal__key--${keyStatuses[key]}`]
                    : ""
                }`}
                disabled={isSolved || isFailed}
              >
                {key}
              </button>
            )
          )}
          <button
            onClick={() => handleKey("DEL")}
            className={`${styles["crossword-modal__key"]} ${styles["crossword-modal__key--action"]}`}
          >
            ⌫
          </button>
          <button
            onClick={() => handleKey("ENTER")}
            className={`${styles["crossword-modal__key"]} ${styles["crossword-modal__key--action"]}`}
          >
            ⏎
          </button>
        </div>

        {/* Result display */}
        {(isSolved || isFailed) && (
          <div className={styles["crossword-modal__result"]}>
            {isSolved ? (
              <p className={styles["crossword-modal__success"]}>Kamu benar!</p>
            ) : (
              <p className={styles["crossword-modal__fail"]}>
                Jawaban: {correctWord}
              </p>
            )}
            <button
              onClick={onClose}
              className={styles["crossword-modal__close-button"]}
            >
              Tutup
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrosswordModal;
