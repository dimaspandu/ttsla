import React, { useEffect } from "react";
import styles from "./Snackbar.module.scss";

export type SnackbarVariant = "info" | "success" | "warning" | "error";

interface SnackbarProps {
  message: string;
  variant?: SnackbarVariant;
  duration?: number; // in ms
  onClose?: () => void;
}

const Snackbar: React.FC<SnackbarProps> = ({
  message,
  variant = "info",
  duration = 1500,
  onClose,
}) => {
  // Auto-close after duration
  useEffect(() => {
    if (!onClose) return;
    const timer = setTimeout(() => onClose(), duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`${styles.snackbar} ${styles[`snackbar--${variant}`]}`}>
      <span className={styles.snackbar__message}>{message}</span>
    </div>
  );
};

export default Snackbar;
