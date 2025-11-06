import React, { useState, useEffect } from "react";
import type { Answer } from "../../contracts/types";
import type { CrosswordGridProps } from "../../contracts/props";
import CrosswordModal from "../CrosswordModal";
import crosswordModalRPC from "~/rpc/CrosswordModalRPC";
import evaluateGuessFromServer from "~/rpc/evaluateGuessFromServer";
import evaluateGuess from "~/rpc/evaluateGuess";
import mergeKeyStatusesFromServer from "~/rpc/mergeKeyStatusesFromServer";
import mergeKeyStatuses from "~/rpc/mergeKeyStatuses";
import styles from "./CrosswordGrid.module.scss";

const MAX_ATTEMPTS_PER_WORD = 6; // Matches modal

const CrosswordGrid: React.FC<CrosswordGridProps> = ({ data, onComplete }) => {
  const [selectedWord, setSelectedWord] = useState<Answer | null>(null);

  const [filledGrid, setFilledGrid] = useState<string[][]>(
    data.grid.map((row) => row.map(() => ""))
  );

  const [cellStatus, setCellStatus] = useState<string[][]>(
    data.grid.map((row) => row.map(() => ""))
  );

  const [lockedCells, setLockedCells] = useState<boolean[][]>(
    data.grid.map((row) => row.map(() => false))
  );

  // Track remaining attempts for each word
  const [remainingAttemptsMap, setRemainingAttemptsMap] = useState<Record<string, number>>(
    () => {
      const map: Record<string, number> = {};
      data.answers.forEach((a) => {
        map[a.word.toUpperCase()] = MAX_ATTEMPTS_PER_WORD;
      });
      return map;
    }
  );

  // Check if a word is fully solved
  const isWordSolved = (answer: Answer) => {
    const { start, direction, word } = answer;
    for (let i = 0; i < word.length; i++) {
      const r = direction === "across" ? start[0] : start[0] + i;
      const c = direction === "across" ? start[1] + i : start[1];
      if (cellStatus[r][c] !== "correct") return false;
    }
    return true;
  };

  // Handle click on a grid cell
  const handleCellClick = async (row: number, col: number) => {
    if (lockedCells[row][col]) return;

    const found = data.answers.find((a) => {
      const [startRow, startCol] = a.start;
      if (a.direction === "across")
        return startRow === row && col >= startCol && col < startCol + a.word.length;
      else
        return startCol === col && row >= startRow && row < startRow + a.word.length;
    });

    if (!found) return;

    const key = found.word.toUpperCase();

    // Only block if word is solved or attempts exhausted
    if (isWordSolved(found) || remainingAttemptsMap[key] === 0) return;

    // ---------------------------------------------------------
    // Sync server-side evaluation and merge logic.
    // If remote imports fail, fall back to local implementations.
    // ---------------------------------------------------------
    try {
      const [evaluateFn, mergeFn] = await Promise.all([
        evaluateGuessFromServer(),
        mergeKeyStatusesFromServer(),
      ]);

      if (typeof evaluateFn === "function") {
        crosswordModalRPC.syncEvaluateGuess(evaluateFn);
      } else {
        console.warn("[Crossword] evaluateGuessFromServer did not return a function, using local fallback.");
        crosswordModalRPC.syncEvaluateGuess(evaluateGuess);
      }

      if (typeof mergeFn === "function") {
        crosswordModalRPC.syncMergeKeyStatuses(mergeFn);
      } else {
        console.warn("[Crossword] mergeKeyStatusesFromServer did not return a function, using local fallback.");
        crosswordModalRPC.syncMergeKeyStatuses(mergeKeyStatuses);
      }

    } catch (error) {
      console.error("[Crossword] Failed to sync remote RPC functions. Using local fallback.", error);
      crosswordModalRPC.syncEvaluateGuess(evaluateGuess);
      crosswordModalRPC.syncMergeKeyStatuses(mergeKeyStatuses);
    }

    setSelectedWord(found);
  };

  const closeModal = () => setSelectedWord(null);

  // Handle submission from modal
  const handleSubmit = (guess: string, isCorrect: boolean) => {
    if (!selectedWord) return;

    const { start, direction, word } = selectedWord;
    const newGrid = filledGrid.map((r) => [...r]);
    const newStatus = cellStatus.map((r) => [...r]);
    const newLocked = lockedCells.map((r) => [...r]);

    const guessUpper = guess.toUpperCase();

    // Fill letters and update statuses
    for (let i = 0; i < word.length; i++) {
      const r = direction === "across" ? start[0] : start[0] + i;
      const c = direction === "across" ? start[1] + i : start[1];

      newGrid[r][c] = guessUpper[i];

      if (guessUpper[i] === word[i].toUpperCase()) newStatus[r][c] = "correct";
      else if (word.toUpperCase().includes(guessUpper[i])) newStatus[r][c] = "present";
      else newStatus[r][c] = "wrong";
    }

    setFilledGrid(newGrid);
    setCellStatus(newStatus);

    // Update remaining attempts
    setRemainingAttemptsMap((prev) => {
      const key = word.toUpperCase();
      const updated = { ...prev, [key]: Math.max((prev[key] ?? MAX_ATTEMPTS_PER_WORD) - 1, 0) };

      // Lock cells only if solved
      if (isCorrect) {
        for (let i = 0; i < word.length; i++) {
          const r = direction === "across" ? start[0] : start[0] + i;
          const c = direction === "across" ? start[1] + i : start[1];
          newLocked[r][c] = true;
        }
        setLockedCells(newLocked);
      }

      // Close modal if solved or attempts exhausted
      if (isCorrect || updated[key] === 0) closeModal();

      return updated;
    });
  };

  // Check if all words are either solved or attempts exhausted
  useEffect(() => {
    const allDone = data.answers.every((a) => {
      const key = a.word.toUpperCase();
      return isWordSolved(a) || remainingAttemptsMap[key] === 0;
    });

    if (allDone) {
      let correct = 0;
      let wrong = 0;

      for (let r = 0; r < data.rows; r++) {
        for (let c = 0; c < data.cols; c++) {
          if (data.grid[r][c] === 0) continue;
          const statusCell = cellStatus[r][c];
          if (statusCell === "correct") correct++;
          else wrong++;
        }
      }

      const result = wrong === 0 ? "perfect" : correct === 0 ? "all-wrong" : "partial";
      const todayKey = new Date().toISOString().slice(0, 10);
      localStorage.setItem("ttsla-completed-date", todayKey);
      localStorage.setItem("ttsla-result", result);

      onComplete?.(result);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingAttemptsMap, cellStatus, data, onComplete]);

  // Lock all cells if puzzle is already completed today
  useEffect(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const savedDate = localStorage.getItem("ttsla-completed-date");
    if (savedDate === todayKey) setLockedCells(data.grid.map((r) => r.map(() => true)));
  }, [data]);

  return (
    <div className={styles.crossword}>
      <div
        className={styles["crossword__grid"]}
        style={{
          gridTemplateRows: `repeat(${data.rows}, 1fr)`,
          gridTemplateColumns: `repeat(${data.cols}, 1fr)`,
        }}
      >
        {data.grid.map((row, rIndex) =>
          row.map((cell, cIndex) => {
            const disabled = cell === 0;
            const locked = lockedCells[rIndex][cIndex];
            const statusClass = cellStatus[rIndex][cIndex] || "";
            const isAlt = (rIndex + cIndex) % 2 === 0;

            return (
              <div
                key={`${rIndex}-${cIndex}`}
                className={`
                  ${styles["crossword__cell"]}
                  ${disabled ? styles["crossword__cell--disabled"] : ""}
                  ${locked ? styles["crossword__cell--locked"] : ""}
                  ${statusClass ? styles[`crossword__cell--${statusClass}`] : ""}
                  ${isAlt ? styles["crossword__cell--alt"] : ""}
                `}
                onClick={() => !disabled && !locked && handleCellClick(rIndex, cIndex)}
              >
                {filledGrid[rIndex][cIndex]}
              </div>
            );
          })
        )}
      </div>

      {selectedWord && (
        <CrosswordModal
          word={selectedWord}
          onClose={closeModal}
          onSubmit={handleSubmit}
          onRemainingAttempts={(remaining) => {
            setRemainingAttemptsMap((prev) => {
              const key = selectedWord.word.toUpperCase();
              return { ...prev, [key]: remaining };
            });
          }}
        />
      )}
    </div>
  );
};

export default CrosswordGrid;
