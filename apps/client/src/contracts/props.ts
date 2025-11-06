import type { Answer, CrosswordData } from "./types";

export interface CrosswordGridProps {
  data: CrosswordData;
  onComplete?: (result: string) => void;
}

export interface CrosswordModalProps {
  word: Answer;
  onClose: () => void;
  onSubmit?: (lastGuess: string, isCorrect: boolean) => void;
  onRemainingAttempts?: (remaining: number) => void;
}

export interface AlertProps {
  title?: string;
  answers: { direction: string; start: [number, number]; word: string }[];
  className?: string;
}

export interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}