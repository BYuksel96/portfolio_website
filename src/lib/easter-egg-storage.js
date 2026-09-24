import { parseStoredHighScore } from "./head-game.js";

export const HIGH_SCORE_KEY = "head-game:high-score";

export function loadHighScore(storage, fallback = 0) {
  try {
    const raw = storage.getItem(HIGH_SCORE_KEY);
    if (raw === null || String(raw).trim() === "") return fallback;
    const numeric = Number(raw);
    return Number.isFinite(numeric) && numeric >= 0 ? parseStoredHighScore(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveHighScore(storage, score) {
  const numeric = Number(score);
  if (!Number.isFinite(numeric) || numeric < 0) return false;
  try {
    storage.setItem(HIGH_SCORE_KEY, String(numeric));
    return true;
  } catch {
    return false;
  }
}
