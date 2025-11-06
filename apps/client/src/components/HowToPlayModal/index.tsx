import React from "react";
import type { HowToPlayModalProps } from "~/contracts/props";
import styles from "./HowToPlayModal.module.scss";

// -----------------------------------------
// Instructions content
// -----------------------------------------
const instructions = [
  {
    title: "TEKLA",
    description:
      "Tebak kata dengan clue yang berubah setiap harinya. Ambil inspirasi dari budaya lokal.",
  },
  {
    title: "TEKLU",
    description:
      "Gunakan logika dan intuisi. Huruf yang benar akan diberi warna hijau, huruf yang tepat namun salah posisi akan berwarna kuning.",
  },
  {
    title: "KATLA",
    description:
      "Kamu punya enam kesempatan. Bagi hasil tebakanmu dan ajak teman untuk ikut bermain!",
  },
  {
    title: "🟩 Hijau",
    description:
      "Huruf benar dan posisinya juga benar. Contoh: target = RUMAH, tebakan R U M O R → huruf R, U, M berada di posisi tepat sehingga berwarna hijau.",
  },
  {
    title: "🟨 Kuning",
    description:
      "Huruf benar tapi posisinya salah. Contoh: target = TANAH, tebakan ATLAS → huruf A ada di target namun di kolom berbeda sehingga menjadi kuning.",
  },
  {
    title: "⬛ Abu / ⬜ Abu Tua",
    description:
      "Huruf tidak ada di kata target. Hindari huruf ini pada tebakan berikutnya karena tidak membantu mencapai jawaban.",
  },
];

const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles["howtoplay-modal__overlay"]}>
      <div className={styles["howtoplay-modal"]}>
        {/* Close button */}
        <button
          className={styles["howtoplay-modal__close-icon"]}
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

        <h2 className={styles["howtoplay-modal__title"]}>
          Cara Bermain
        </h2>

        {/* Instructions content */}
        <div className={styles["howtoplay-modal__content"]}>
          {instructions.map((item, index) => (
            <div key={index} className={styles["howtoplay-modal__section"]}>
              <h3 className={styles["howtoplay-modal__section-title"]}>
                {item.title}
              </h3>
              <p className={styles["howtoplay-modal__section-description"]}>
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Close button at bottom */}
        <button
          className={styles["howtoplay-modal__close-button"]}
          onClick={onClose}
        >
          Tutup
        </button>
      </div>
    </div>
  );
};

export default HowToPlayModal;
