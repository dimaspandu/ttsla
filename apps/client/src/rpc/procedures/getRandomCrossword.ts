import type { CrosswordData } from "../contracts/types";
import { generateRandomCrossword } from "../utils/generateRandomCrossword";

export function getRandomCrossword() {
  return generateRandomCrossword() as CrosswordData;
}