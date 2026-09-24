import assert from "node:assert/strict";
import test from "node:test";
import { loadHighScore, saveHighScore } from "../src/lib/easter-egg-storage.js";

test("invalid and unavailable storage retain the session fallback", () => {
  assert.equal(loadHighScore({ getItem: () => "broken" }, 9), 9);
  assert.equal(
    loadHighScore({ getItem: () => { throw new Error("denied"); } }, 9),
    9,
  );
  assert.equal(loadHighScore({ getItem: () => "12.0" }, 9), 12);
});

test("saving is guarded and reports availability", () => {
  const values = new Map();
  assert.equal(saveHighScore({ setItem: (key, value) => values.set(key, value) }, 12), true);
  assert.equal(values.get("head-game:high-score"), "12");
  assert.equal(
    saveHighScore({ setItem: () => { throw new Error("quota"); } }, 12),
    false,
  );
  assert.equal(saveHighScore({ setItem: () => {} }, -1), false);
  assert.equal(saveHighScore({ setItem: () => {} }, Number.NaN), false);
});
