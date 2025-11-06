import { useEffect, useState } from "react";
import type { CrosswordData } from "~/contracts/types";
// import Alert from "~/components/Alert";
import CrosswordGrid from "~/components/CrosswordGrid";
import HowToPlayModal from "~/components/HowToPlayModal";
import styles from "./MainScene.module.scss";

// -----------------------------------------
// Lazy load crossword puzzle data generator
// -----------------------------------------
//
// This method dynamically imports a module from the server at runtime.
// The pattern is conceptually similar to RPC (Remote Procedure Call):
// - The client does not directly know the data logic implementation.
// - Instead, it calls a remote "procedure" (a server-side function).
// - The function is dynamically fetched and executed as if it were local.
// 
// This approach is flexible for prototyping since we avoid a traditional
// HTTP API layer and directly reuse the same TypeScript logic on both
// the client and server during development.
//
const fetchRandomCrossword = async () => {
  const remoteProcedureUrl =
    "http://localhost:5174/src/procedures/getRandomCrossword.ts";

  // The `@vite-ignore` comment prevents Vite from transforming the import path.
  // It tells the bundler to keep this dynamic import as-is so it can resolve at runtime.
  const { getRandomCrossword } = await import(/* @vite-ignore */ remoteProcedureUrl);

  // Execute the imported remote procedure.
  return getRandomCrossword();
};

export default function MainScene() {
  // -----------------------------------------
  // State definitions
  // -----------------------------------------
  const [puzzle, setPuzzle] = useState<CrosswordData>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locked, setLocked] = useState(false);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(true);

  // -----------------------------------------
  // Get today's date in YYYY-MM-DD format
  // -----------------------------------------
  const today = new Date().toISOString().split("T")[0];

  // -----------------------------------------
  // Load crossword puzzle or restore saved progress
  // -----------------------------------------
  const loadPuzzle = async () => {
    setLoading(true);
    try {
      const data = await fetchRandomCrossword();
      setPuzzle(data);
    } catch (err) {
      console.error("Failed to load crossword:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("crossword_progress");

    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) {
        setLocked(true);
        setGameResult(parsed.result);
        if (parsed.puzzle) {
          setPuzzle(parsed.puzzle);
        }
        setLoading(false);
        return;
      }
    }

    // Load a new puzzle if no progress exists for today
    loadPuzzle();
  }, [today]);

  // -----------------------------------------
  // Render message for users who already played today
  // -----------------------------------------
  const renderResultMessage = () => {
    if (!gameResult) return null;

    const emoji =
      gameResult === "perfect"
        ? "✅"
        : gameResult === "partial"
        ? "⚠️"
        : "❌";

    const text =
      gameResult === "perfect"
        ? "Sempurna! Semua jawabanmu benar."
        : gameResult === "partial"
        ? "Kamu sudah bermain hari ini, tapi ada beberapa jawaban salah."
        : "Semua jawaban salah. Coba lagi besok!";

    return (
      <div className={styles["main-scene__locked"]}>
        <h2>
          {emoji} {text}
        </h2>
        <p>Kamu sudah bermain hari ini. Kembali besok untuk teka-teki baru!</p>

        {puzzle && puzzle.answers && puzzle.answers.length > 0 && (
          <div className={styles["main-scene__answers"]}>
            <h3>Jawaban yang benar:</h3>
            <ul>
              {puzzle.answers.map((ans, index) => (
                <li key={index}>
                  <strong>{ans.word}</strong>{" "}
                  <span className={styles["main-scene__answer-meta"]}>
                    ({ans.direction}, baris {ans.start[0] + 1}, kolom{" "}
                    {ans.start[1] + 1})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // -----------------------------------------
  // Handle crossword completion
  // Save result in localStorage and lock game
  // -----------------------------------------
  const handleComplete = (result: string) => {
    if (!puzzle) return;

    localStorage.setItem(
      "crossword_progress",
      JSON.stringify({
        date: today,
        result,
        puzzle,
      })
    );
    setLocked(true);
    setGameResult(result);
  };

  // -----------------------------------------
  // Render main scene
  // -----------------------------------------
  return (
    <div className={styles["main-scene"]}>
      <h1 className={styles["main-scene__title"]}>Tekla. Teklu. Katla.</h1>
      <p className={styles["main-scene__subtitle"]}>
        Gim kata harian berbahasa Indonesia yang menggabungkan logika dan rasa.
        Masuk setiap hari, selesaikan teka-teki, dan lihat apakah kamu bisa menebak
        kata rahasia dalam enam langkah.
      </p>

      {/* Loading state */}
      {loading && (
        <p className={styles["main-scene__loading"]}>Sedang memuat teka-teki...</p>
      )}

      {/* Daily locked message */}
      {!loading && locked && renderResultMessage()}

      {/* Active crossword grid */}
      {!loading && !locked && puzzle && (
        <>
          {/* Developer helper alert (can be removed in production) */}
          {/* <Alert title="Kunci Jawaban (Dev Mode)" answers={puzzle.answers} className={styles["main-scene__alert-custom"]} /> */}
          <div className={styles["main-scene__grid"]}>
            <CrosswordGrid data={puzzle} onComplete={handleComplete} />
          </div>
        </>
      )}

      {/* Error message */}
      {!loading && !puzzle && !locked && (
        <p className={styles["main-scene__error"]}>
          Gagal memuat teka-teki, silakan coba lagi nanti.
        </p>
      )}

      {/* Refresh button */}
      {!locked && (
        <button
          className={`${styles["main-scene__button"]} ${
            refreshing ? styles["main-scene__button--disabled"] : ""
          }`}
          onClick={() => {
            if (!refreshing) {
              setRefreshing(true);
              loadPuzzle();
            }
          }}
          disabled={refreshing}
        >
          {refreshing ? "Membuat teka-teki..." : "Reset Kata"}
        </button>
      )}

      {/* How to play modal */}
      {!locked && <HowToPlayModal isOpen={showHelp} onClose={() => setShowHelp(false)} />}
    </div>
  );
}
