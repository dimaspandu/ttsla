import React from "react";
import type { AlertProps } from "~/contracts/props";
import styles from "./Alert.module.scss";

/**
 * Alert component used for displaying crossword answers during development.
 * Shows all words and their directions in a compact box.
 * Supports custom styling via className prop.
 */
const Alert: React.FC<AlertProps> = ({ title = "Debug Answers", answers, className }) => {
  if (!answers || answers.length === 0) return null;

  return (
    <div className={`${styles["alert"]} ${className || ""}`}>
      {title && <div className={styles["alert__title"]}>{title}</div>}
      <ul className={styles["alert__list"]}>
        {answers.map((a, i) => (
          <li key={i} className={styles["alert__item"]}>
            <span className={styles["alert__word"]}>{a.word}</span>
            <span className={styles["alert__meta"]}>
              ({a.direction} • {a.start.join(",")})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Alert;
