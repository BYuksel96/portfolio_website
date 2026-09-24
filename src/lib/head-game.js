export const GAME_CONSTANTS = Object.freeze({
  initialSeconds: 60,
  lives: 3,
  purpleReward: 1,
  goldReward: 5,
  initialFallSpeed: 0.3,
  fallSpeedStep: 0.035,
  maxFallSpeed: 0.65,
  initialSpawnIntervalMs: 900,
  spawnStepMs: 45,
  minSpawnIntervalMs: 270,
  goldMinPurples: 5,
  goldMaxPurples: 10,
  maxActiveSprites: 10,
  playerWidth: 0.18,
  playerHeight: 0.16,
  spriteSize: 0.09,
  catchTolerance: 0.012,
  maxDeltaSeconds: 0.05,
});

const randomGoldCount = (random) =>
  GAME_CONSTANTS.goldMinPurples +
  Math.floor(random() * (GAME_CONSTANTS.goldMaxPurples - GAME_CONSTANTS.goldMinPurples + 1));

export const getDifficulty = (catches) => ({
  fallSpeed: Math.min(
    GAME_CONSTANTS.maxFallSpeed,
    Number(
      (
        GAME_CONSTANTS.initialFallSpeed +
        Math.max(0, catches) * GAME_CONSTANTS.fallSpeedStep
      ).toFixed(3),
    ),
  ),
  spawnIntervalMs: Math.max(
    GAME_CONSTANTS.minSpawnIntervalMs,
    GAME_CONSTANTS.initialSpawnIntervalMs - Math.max(0, catches) * GAME_CONSTANTS.spawnStepMs,
  ),
});

export function createGameState(random = Math.random) {
  return {
    status: "playing",
    score: 0,
    timeRemaining: GAME_CONSTANTS.initialSeconds,
    misses: 0,
    catchCount: 0,
    playerX: 0.5,
    sprites: [],
    nextSpriteId: 1,
    spawnElapsedMs: 0,
    purplesUntilGold: randomGoldCount(random),
    effects: [],
  };
}

export function nextSpawnKind(state, random = Math.random) {
  return state.purplesUntilGold > 0
    ? { kind: "purple", purplesUntilGold: state.purplesUntilGold - 1 }
    : { kind: "gold", purplesUntilGold: randomGoldCount(random) };
}

export function recordCatch(state, spriteId) {
  const sprite = state.sprites.find((item) => item.id === spriteId);
  if (!sprite || state.status !== "playing") return state;
  const reward = sprite.kind === "gold" ? GAME_CONSTANTS.goldReward : GAME_CONSTANTS.purpleReward;
  return {
    ...state,
    score: state.score + reward,
    timeRemaining: state.timeRemaining + reward,
    catchCount: state.catchCount + 1,
    sprites: state.sprites.filter((item) => item.id !== spriteId),
    effects: [...state.effects, { type: "catch", value: reward, id: spriteId }],
  };
}

export function recordMiss(state, spriteId) {
  if (!state.sprites.some((item) => item.id === spriteId) || state.status !== "playing") return state;
  const misses = state.misses + 1;
  return {
    ...state,
    misses,
    status: misses >= GAME_CONSTANTS.lives ? "game-over" : "playing",
    sprites: state.sprites.filter((item) => item.id !== spriteId),
    effects: [...state.effects, { type: "miss", id: spriteId }],
  };
}

export function parseStoredHighScore(raw) {
  if (raw === null || raw === "") return 0;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

export const resolveHighScore = (previous, score) =>
  Math.max(parseStoredHighScore(String(previous)), parseStoredHighScore(String(score)));

export function movePlayer(state, normalizedX) {
  const half = GAME_CONSTANTS.playerWidth / 2;
  return {
    ...state,
    playerX: Math.min(1 - half, Math.max(half, normalizedX)),
  };
}

export function spawnSprite(state, random = Math.random) {
  if (state.sprites.length >= GAME_CONSTANTS.maxActiveSprites || state.status !== "playing") {
    return state;
  }
  const schedule = nextSpawnKind(state, random);
  const width = GAME_CONSTANTS.spriteSize;
  const sprite = {
    id: state.nextSpriteId,
    kind: schedule.kind,
    x: width / 2 + random() * (1 - width),
    y: -width,
    width,
    height: width,
  };
  return {
    ...state,
    sprites: [...state.sprites, sprite],
    nextSpriteId: state.nextSpriteId + 1,
    purplesUntilGold: schedule.purplesUntilGold,
  };
}

const overlaps = (sprite, state) => {
  const halfPlayer = GAME_CONSTANTS.playerWidth / 2;
  const horizontal =
    Math.abs(sprite.x - state.playerX) <=
    halfPlayer + sprite.width / 2 + GAME_CONSTANTS.catchTolerance;
  return horizontal && sprite.y + sprite.height / 2 >= 1 - GAME_CONSTANTS.playerHeight;
};

export function stepGame(state, deltaSeconds, random = Math.random) {
  if (state.status !== "playing") return state;
  const delta = Math.min(GAME_CONSTANTS.maxDeltaSeconds, Math.max(0, deltaSeconds));
  let next = {
    ...state,
    timeRemaining: Math.max(0, state.timeRemaining - delta),
    effects: [],
  };
  if (next.timeRemaining === 0) return { ...next, status: "game-over" };
  const difficulty = getDifficulty(next.catchCount);
  next = {
    ...next,
    sprites: next.sprites.map((sprite) => ({
      ...sprite,
      y: sprite.y + difficulty.fallSpeed * delta,
    })),
    spawnElapsedMs: next.spawnElapsedMs + delta * 1000,
  };
  for (const sprite of [...next.sprites]) {
    if (overlaps(sprite, next)) next = recordCatch(next, sprite.id);
    else if (sprite.y - sprite.height / 2 > 1) next = recordMiss(next, sprite.id);
  }
  const spawnInterval = getDifficulty(next.catchCount).spawnIntervalMs;
  if (
    next.status === "playing" &&
    next.spawnElapsedMs >= spawnInterval &&
    next.sprites.length < GAME_CONSTANTS.maxActiveSprites
  ) {
    next = spawnSprite({ ...next, spawnElapsedMs: 0 }, random);
  }
  return next;
}
