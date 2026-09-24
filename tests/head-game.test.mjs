import assert from "node:assert/strict";
import test from "node:test";
import {
  GAME_CONSTANTS,
  createGameState,
  getDifficulty,
  movePlayer,
  nextSpawnKind,
  parseStoredHighScore,
  recordCatch,
  recordMiss,
  resolveHighScore,
  spawnSprite,
  stepGame,
} from "../src/lib/head-game.js";

test("new runs use the approved baseline", () => {
  const state = createGameState(() => 0);
  assert.deepEqual(
    { score: state.score, time: state.timeRemaining, misses: state.misses, catches: state.catchCount },
    { score: 0, time: 60, misses: 0, catches: 0 },
  );
  assert.equal(state.purplesUntilGold, 5);
});

test("difficulty is fast by ten catches and caps safely", () => {
  assert.deepEqual(getDifficulty(0), { fallSpeed: 0.3, spawnIntervalMs: 900 });
  assert.deepEqual(getDifficulty(10), { fallSpeed: 0.65, spawnIntervalMs: 450 });
  assert.deepEqual(getDifficulty(14), { fallSpeed: 0.65, spawnIntervalMs: 270 });
  assert.deepEqual(getDifficulty(100), { fallSpeed: 0.65, spawnIntervalMs: 270 });
  assert.equal(GAME_CONSTANTS.maxActiveSprites, 10);
});

test("purple and gold catches award time and score but each count once", () => {
  const base = {
    ...createGameState(() => 0),
    sprites: [
      { id: 1, kind: "purple" },
      { id: 2, kind: "gold" },
    ],
  };
  const purple = recordCatch(base, 1);
  assert.deepEqual([purple.score, purple.timeRemaining, purple.catchCount], [1, 61, 1]);
  const gold = recordCatch(purple, 2);
  assert.deepEqual([gold.score, gold.timeRemaining, gold.catchCount], [6, 66, 2]);
});

test("third miss and zero time end immediately", () => {
  let state = {
    ...createGameState(),
    sprites: [{ id: 1 }, { id: 2 }, { id: 3 }],
  };
  state = recordMiss(state, 1);
  state = recordMiss(state, 2);
  assert.equal(state.status, "playing");
  state = recordMiss(state, 3);
  assert.deepEqual([state.misses, state.status], [3, "game-over"]);
  assert.equal(stepGame({ ...createGameState(), timeRemaining: 0.01 }, 0.02, Math.random).status, "game-over");
});

test("gold follows injected purple count and resets its cycle", () => {
  const state = { ...createGameState(() => 0), purplesUntilGold: 1 };
  let result = nextSpawnKind(state, () => 0.999);
  assert.deepEqual(result, { kind: "purple", purplesUntilGold: 0 });
  result = nextSpawnKind({ ...state, purplesUntilGold: 0 }, () => 0.999);
  assert.deepEqual(result, { kind: "gold", purplesUntilGold: 10 });
});

test("stored scores accept only finite non-negative numbers", () => {
  assert.equal(parseStoredHighScore("12"), 12);
  for (const value of [null, "", "-1", "NaN", "Infinity", "{}"]) {
    assert.equal(parseStoredHighScore(value), 0);
  }
  assert.equal(resolveHighScore(12, 7), 12);
  assert.equal(resolveHighScore(12, 20), 20);
});

test("spawns stay fully inside the safe width and stop at ten", () => {
  let state = createGameState(() => 0);
  for (let index = 0; index < 10; index += 1) {
    state = spawnSprite(state, () => index / 10);
  }
  assert.equal(state.sprites.length, 10);
  assert.ok(
    state.sprites.every(
      (sprite) => sprite.x >= sprite.width / 2 && sprite.x <= 1 - sprite.width / 2,
    ),
  );
  assert.equal(spawnSprite(state, () => 0.5), state);
});

test("movement clamps pointer and touch coordinates", () => {
  assert.equal(movePlayer(createGameState(), -4).playerX, GAME_CONSTANTS.playerWidth / 2);
  assert.equal(movePlayer(createGameState(), 9).playerX, 1 - GAME_CONSTANTS.playerWidth / 2);
});

test("catch wins over a same-frame miss and edge touching counts", () => {
  const state = {
    ...createGameState(),
    playerX: 0.5,
    sprites: [{ id: 1, kind: "purple", x: 0.5, y: 0.84, width: 0.09, height: 0.09 }],
  };
  const next = stepGame(state, 0.05, Math.random);
  assert.deepEqual([next.score, next.misses, next.sprites.length], [1, 0, 0]);
});

test("sprites outside the player bounds are not caught", () => {
  const state = {
    ...createGameState(),
    playerX: 0.5,
    sprites: [{ id: 1, kind: "purple", x: 0.1, y: 0.84, width: 0.09, height: 0.09 }],
  };
  const next = stepGame(state, 0.01, Math.random);
  assert.equal(next.score, 0);
  assert.equal(next.sprites.length, 1);
});

test("large deltas are clamped instead of teleporting", () => {
  const state = {
    ...createGameState(),
    sprites: [{ id: 1, kind: "purple", x: 0.1, y: 0, width: 0.09, height: 0.09 }],
  };
  const next = stepGame(state, 5, Math.random);
  assert.ok(next.sprites[0].y <= 0.65 * GAME_CONSTANTS.maxDeltaSeconds);
  assert.ok(next.timeRemaining > 59.9);
});
