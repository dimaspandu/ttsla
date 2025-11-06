import React, { useState, useEffect } from "react";
import type { CrosswordModalProps } from "~/contracts/props";
import styles from "./CrosswordModal.module.scss";

const MAX_ATTEMPTS = 6;

const CrosswordModal: React.FC<CrosswordModalProps> = ({
  word,
  onClose,
  onSubmit,
  onRemainingAttempts,
}) => {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [keyStatuses, setKeyStatuses] = useState<Record<string, string>>({});

  const correctWord = word.word.toUpperCase();

  const handleKey = (key: string) => {
    if (key === "ENTER") {
      if (currentGuess.length === correctWord.length) {
        const guessUpper = currentGuess.toUpperCase();
        const isCorrect = guessUpper === correctWord;

        const newGuesses = [...guesses, guessUpper];
        setGuesses(newGuesses);
        setCurrentGuess("");
        onSubmit?.(guessUpper, isCorrect);

        // update key statuses
        const newStatuses = { ...keyStatuses };
        guessUpper.split("").forEach((letter, index) => {
          if (correctWord[index] === letter) newStatuses[letter] = "correct";
          else if (correctWord.includes(letter) && newStatuses[letter] !== "correct")
            newStatuses[letter] = "present";
          else if (!correctWord.includes(letter)) newStatuses[letter] = "absent";
        });
        setKeyStatuses(newStatuses);

        // Notify parent about remaining attempts
        onRemainingAttempts?.(MAX_ATTEMPTS - newGuesses.length);

        return;
      }
    }

    if (key === "DEL") {
      setCurrentGuess((prev) => prev.slice(0, -1));
      return;
    }

    if (currentGuess.length < correctWord.length && /^[A-Z]$/.test(key)) {
      setCurrentGuess((prev) => prev + key.toUpperCase());
    }
  };

  const getStatus = (letter: string, index: number) => {
    const correctLetter = correctWord[index];
    if (letter === correctLetter)
      return styles["crossword-modal__cell--correct"];
    if (correctWord.includes(letter))
      return styles["crossword-modal__cell--present"];
    return styles["crossword-modal__cell--absent"];
  };

  const allKeys = "QWERTYUIOP ASDFGHJKL ZXCVBNM".split("");
  const isSolved = guesses.some((g) => g === correctWord);
  const isFailed = guesses.length >= MAX_ATTEMPTS && !isSolved;

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

        {/* Grid for guesses */}
        <div className={styles["crossword-modal__grid"]}>
          {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => {
            const guess = guesses[rowIndex] || "";
            const isCurrent = rowIndex === guesses.length;
            return (
              <div key={rowIndex} className={styles["crossword-modal__row"]}>
                {Array.from({ length: correctWord.length }).map((_, colIndex) => {
                  const letter =
                    isCurrent && colIndex < currentGuess.length
                      ? currentGuess[colIndex]
                      : guess[colIndex] || "";

                  const status =
                    !isCurrent && guess ? getStatus(letter, colIndex) : "";

                  return (
                    <div
                      key={colIndex}
                      className={`${styles["crossword-modal__cell"]} ${status}`}
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