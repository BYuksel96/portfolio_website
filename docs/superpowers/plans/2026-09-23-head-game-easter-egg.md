# Head Game Easter Egg Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a hidden, accessible canvas catch game that opens when the portfolio monitor is minimized, ramps quickly through ten catches, caps fall speed, and always restores a clean Home state.

**Architecture:** `PortfolioMonitor.astro` keeps portfolio navigation and emits minimize/restore coordination events; a sibling `EasterEgg.astro` owns the five-state DOM, canvas controller, browser APIs, cleanup, persistence, and audio. A pure `head-game.js` module contains all deterministic rules so Node tests can exhaustively cover timing, spawn scheduling, collision, difficulty, and high-score behavior without a browser.

**Tech Stack:** Astro 6, browser Canvas 2D/Web Audio/Speech Synthesis APIs, ES modules, Node 20 `node:test`, Playwright Chromium, generated transparent WebP assets.

**Spec:** `docs/superpowers/specs/2026-09-23-head-game-easter-egg-design.md`

## Global Constraints

- The accepted passcode is exactly `P3N15` after trimming surrounding whitespace and ignoring letter case; it is never persisted.
- A run starts at 60 seconds, score 0, 0 misses, fall speed 0.30 playfield heights/second, and a 900 ms spawn interval.
- Purple catches award 1 point and 1 second; gold catches award 5 points and 5 seconds; either advances difficulty by exactly one successful catch.
- Fall speed adds 0.035 per catch and caps at 0.65 at catch 10; spawn interval subtracts 45 ms per catch through 450 ms at catch 10, then reaches and remains at the 270 ms floor at catch 14.
- Gold scheduling chooses 5–10 purple spawns, emits one gold, and immediately starts a new session-local cycle.
- No more than 10 sprites may be active; a due spawn is delayed while the cap is full.
- The third miss or timer reaching zero ends the run immediately.
- Only a finite, non-negative high score persists; storage failure and invalid values fall back to session-only state.
- Restoring from passcode, menu, playing, or game-over cancels every loop/timer/input/audio resource, discards the run, returns Home, and requires the passcode next time.
- Keyboard, mouse, and touch controls are equivalent; gameplay pauses while `document.hidden`; canvas coordinates must be recalculated after resize.
- Active and inactive portfolio/Easter-egg layers alternate `inert` and `aria-hidden`; focus transitions and meaningful status are available in DOM.
- Reduced motion softens/removes monitor flight, shake, decoration, waves, and bonus movement; feedback never rapidly flashes and color is never its only meaning.
- The responsive cabinet leaves the bottom-left creator tab clear and never introduces document scrolling.
- Runtime remains dependency-light: add Playwright only as a development dependency; do not add a game framework, animation library, audio library, or state library.
- Keep all tunable rule values in `GAME_CONSTANTS`; keep browser APIs out of pure engine functions.

## Review Focus

- A throttled or unusually large animation-frame delta must not teleport sprites, consume a hidden tab's time, or create several catch/miss outcomes at once; Task 2 owns a clamped-delta engine test and Task 6 owns the hidden-tab browser test.
- A catch on the same update that a sprite reaches the miss line must be counted exactly once as a catch, never also as a miss; Task 2 owns the catch-before-miss boundary test.
- Repeated minimize/restore/play cycles must retain exactly one active loop and one set of listeners, with stale callbacks unable to mutate a later session; Tasks 4 and 6 own controller instrumentation tests.
- Corrupt/throwing `localStorage` must never block menu or game-over rendering and must preserve a valid session high score; Tasks 3 and 6 own storage adapter and browser fallback tests.
- Tiny/rotated viewports and out-of-bounds pointer/touch input must clamp the head, preserve sprite aspect ratio, keep the restore tab usable, and avoid page scroll; Tasks 2 and 6 own coordinate/clamping and responsive browser tests.

---

## File Map and Stable Interfaces

- Create `src/lib/head-game.js`: pure state factory and reducers; exports `GAME_CONSTANTS`, `createGameState`, `getDifficulty`, `nextSpawnKind`, `spawnSprite`, `stepGame`, `movePlayer`, `recordCatch`, `recordMiss`, `parseStoredHighScore`, and `resolveHighScore`.
- Create `tests/head-game.test.mjs`: value-based unit tests for every pure rule and Review Focus engine boundary.
- Create `src/lib/easter-egg-storage.js`: guarded `loadHighScore(storage, fallback)` and `saveHighScore(storage, score)` adapter.
- Create `tests/easter-egg-storage.test.mjs`: invalid-data and throwing-storage unit tests.
- Create `src/components/EasterEgg.astro`: semantic screens, canvas/HUD, controller, audio, lifecycle cleanup, responsive sizing, and all Easter-egg presentation.
- Create `tests/easter-egg-contract.test.mjs`: source-level accessibility, lifecycle, asset, and coordination contract tests following the repository's existing convention.
- Create `tests/easter-egg.spec.mjs`: Playwright end-to-end coverage for transitions, controls, cleanup, responsive layout, focus, mute, reduced motion, visibility, and persistence.
- Create `playwright.config.mjs`: starts Astro on port 4321 and runs desktop/mobile/reduced-motion projects.
- Create `public/assets/easter-egg/purple-sprite.webp`, `gold-sprite.webp`, `head-open.webp`, `head-closed.webp`: transparent, matched game artwork.
- Modify `package.json`: add `test`, `test:unit`, and `test:e2e` scripts plus `@playwright/test`.
- Modify `src/components/PortfolioMonitor.astro`: replace dots with minimize button; expose `finishPortfolioTransition()` and `restoreHome()` through cancelable document events.
- Modify `src/pages/index.astro` and `src/pages/[view].astro`: render one `EasterEgg` sibling beside the monitor on every route.

Event interface (the only cross-component coupling):

```js
document.dispatchEvent(new CustomEvent("portfolio:minimize-request"));
document.addEventListener("portfolio:easter-egg-open", openPasscode);
document.dispatchEvent(new CustomEvent("portfolio:restore-request"));
document.addEventListener("portfolio:restored", focusRestoredHome);
```

The monitor handles `portfolio:minimize-request` by cancelling its transition, making itself inactive, and dispatching `portfolio:easter-egg-open`; the Easter egg handles `portfolio:restore-request` cleanup before the monitor restores Home and emits `portfolio:restored`.

### Task 1: Generated Art Assets and Test Harness

**Files:**
- Create: `public/assets/easter-egg/purple-sprite.webp`
- Create: `public/assets/easter-egg/gold-sprite.webp`
- Create: `public/assets/easter-egg/head-open.webp`
- Create: `public/assets/easter-egg/head-closed.webp`
- Create: `playwright.config.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: Astro's existing `npm run dev` command on Node >=20.
- Produces: four transparent 512×512 WebP assets at stable `/assets/easter-egg/*` URLs; `npm test`, `npm run test:unit`, and `npm run test:e2e`.

- [ ] **Step 1: Generate the two sprite sources with the image-generation skill**

Use the supplied purple reference image as the visual source with `imagegen`: preserve its exact silhouette and framing, remove the dark background, recolor it purple, and refine the existing white border into a crisp 8-bit pixel outline on a transparent square canvas readable at 48 px. Generate the gold variant from that result as a separate edit: preserve the exact silhouette, framing, scale, and outline while changing only the surface to metallic gold with pronounced decorative vein-like marbling. Save/export each as 512×512 WebP at the exact sprite paths above.

- [ ] **Step 2: Generate the matched head placeholders**

Use one contact sheet request: “Two aligned arcade avatar bust placeholders of the same fictional adult, front-facing, identical crop/scale/lighting; panel one open mouth, panel two closed mouth; bold editorial cutout, transparent background, no text.” Crop the two panels to identical 512×512 transparent canvases, saving the open and closed paths above. Verify their non-transparent bounding boxes share the same center and baseline.

- [ ] **Step 3: Inspect the exports at full size and thumbnail size**

Run: `Get-ChildItem public/assets/easter-egg | Select-Object Name,Length`

Expected: four non-empty `.webp` files. Open each with the local image viewer and verify transparency, no embedded text, full silhouette within bounds, clear 48 px readability, matched head alignment, and distinct purple/gold identification beyond hue alone (gold texture).

- [ ] **Step 4: Add the test scripts and Playwright dependency**

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "check": "astro check",
  "test": "npm run test:unit && npm run test:e2e",
  "test:unit": "node --test tests/*.test.mjs tests/*.test.js",
  "test:e2e": "playwright test"
},
"devDependencies": {
  "@astrojs/check": "^0.9.9",
  "@playwright/test": "^1.63.0",
  "typescript": "^5.9.0"
}
```

Run: `npm install`

Expected: lockfile updates and install succeeds without runtime dependencies beyond Astro.

- [ ] **Step 5: Add the browser configuration**

```js
// playwright.config.mjs
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.mjs",
  use: { baseURL: "http://127.0.0.1:4321", trace: "retain-on-failure" },
  webServer: { command: "npm run dev -- --host 127.0.0.1", url: "http://127.0.0.1:4321", reuseExistingServer: true },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    { name: "reduced-motion", use: { ...devices["Desktop Chrome"], reducedMotion: "reduce" } }
  ]
});
```

- [ ] **Step 6: Verify the unchanged suite and config**

Run: `npm run test:unit && npx playwright test --list && npm run build`

Expected: existing Node tests pass, Playwright lists zero tests without configuration error, and Astro builds.

- [ ] **Step 7: Commit the harness and assets**

```bash
git add package.json package-lock.json playwright.config.mjs public/assets/easter-egg
git commit -m "chore: add head game assets and test harness"
```

### Task 2: Pure Head Game Engine

**Files:**
- Create: `src/lib/head-game.js`
- Create: `tests/head-game.test.mjs`

**Interfaces:**
- Consumes: injected `random(): number` values in `[0, 1)` and normalized playfield coordinates.
- Produces: `createGameState(random = Math.random): GameState`; `getDifficulty(catches): { fallSpeed: number, spawnIntervalMs: number }`; `nextSpawnKind(state, random): { kind: "purple"|"gold", purplesUntilGold: number }`; `spawnSprite(state, random): GameState`; `stepGame(state, deltaSeconds, random): GameState`; `movePlayer(state, normalizedX): GameState`; `recordCatch(state, spriteId): GameState`; `recordMiss(state, spriteId): GameState`; `parseStoredHighScore(raw): number`; `resolveHighScore(previous, score): number`.

- [ ] **Step 1: Write failing constants and difficulty tests**

```js
import assert from "node:assert/strict";
import test from "node:test";
import { GAME_CONSTANTS, createGameState, getDifficulty } from "../src/lib/head-game.js";

test("new runs use the approved baseline", () => {
  const state = createGameState(() => 0);
  assert.deepEqual({ score: state.score, time: state.timeRemaining, misses: state.misses, catches: state.catchCount }, { score: 0, time: 60, misses: 0, catches: 0 });
  assert.equal(state.purplesUntilGold, 5);
});
test("difficulty is fast by ten catches and caps safely", () => {
  assert.deepEqual(getDifficulty(0), { fallSpeed: 0.30, spawnIntervalMs: 900 });
  assert.deepEqual(getDifficulty(10), { fallSpeed: 0.65, spawnIntervalMs: 450 });
  assert.deepEqual(getDifficulty(14), { fallSpeed: 0.65, spawnIntervalMs: 270 });
  assert.deepEqual(getDifficulty(100), { fallSpeed: 0.65, spawnIntervalMs: 270 });
  assert.equal(GAME_CONSTANTS.maxActiveSprites, 10);
});
```

- [ ] **Step 2: Run the focused tests and confirm RED**

Run: `node --test --test-name-pattern="baseline|difficulty" tests/head-game.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/lib/head-game.js`.

- [ ] **Step 3: Implement constants, state, and difficulty**

```js
export const GAME_CONSTANTS = Object.freeze({
  initialSeconds: 60, lives: 3, purpleReward: 1, goldReward: 5,
  initialFallSpeed: 0.30, fallSpeedStep: 0.035, maxFallSpeed: 0.65,
  initialSpawnIntervalMs: 900, spawnStepMs: 45, minSpawnIntervalMs: 270,
  goldMinPurples: 5, goldMaxPurples: 10, maxActiveSprites: 10,
  playerWidth: 0.18, playerHeight: 0.16, spriteSize: 0.09,
  catchTolerance: 0.012, maxDeltaSeconds: 0.05
});
const randomGoldCount = (random) => 5 + Math.floor(random() * 6);
export const getDifficulty = (catches) => ({
  fallSpeed: Math.min(0.65, Number((0.30 + Math.max(0, catches) * 0.035).toFixed(3))),
  spawnIntervalMs: Math.max(270, 900 - Math.max(0, catches) * 45)
});
export function createGameState(random = Math.random) {
  return { status: "playing", score: 0, timeRemaining: 60, misses: 0, catchCount: 0,
    playerX: 0.5, sprites: [], nextSpriteId: 1, spawnElapsedMs: 0,
    purplesUntilGold: randomGoldCount(random), effects: [] };
}
```

- [ ] **Step 4: Run focused tests and confirm GREEN**

Run: `node --test --test-name-pattern="baseline|difficulty" tests/head-game.test.mjs`

Expected: 2 tests pass.

- [ ] **Step 5: Add failing reward, miss, high-score, and gold-cycle tests**

```js
test("purple and gold catches award time and score but each count once", () => {
  const base = { ...createGameState(() => 0), sprites: [{ id: 1, kind: "purple" }, { id: 2, kind: "gold" }] };
  const purple = recordCatch(base, 1);
  assert.deepEqual([purple.score, purple.timeRemaining, purple.catchCount], [1, 61, 1]);
  const gold = recordCatch(purple, 2);
  assert.deepEqual([gold.score, gold.timeRemaining, gold.catchCount], [6, 66, 2]);
});
test("third miss and zero time end immediately", () => {
  let state = { ...createGameState(), sprites: [{ id: 1 }, { id: 2 }, { id: 3 }] };
  state = recordMiss(state, 1); state = recordMiss(state, 2);
  assert.equal(state.status, "playing");
  state = recordMiss(state, 3);
  assert.deepEqual([state.misses, state.status], [3, "game-over"]);
  assert.equal(stepGame({ ...createGameState(), timeRemaining: 0.01 }, 0.02, Math.random, 800, 600).status, "game-over");
});
test("gold follows injected purple count and resets its cycle", () => {
  let state = { ...createGameState(() => 0), purplesUntilGold: 1 };
  let result = nextSpawnKind(state, () => 0.999);
  assert.deepEqual(result, { kind: "purple", purplesUntilGold: 0 });
  result = nextSpawnKind({ ...state, purplesUntilGold: 0 }, () => 0.999);
  assert.deepEqual(result, { kind: "gold", purplesUntilGold: 10 });
});
test("stored scores accept only finite non-negative numbers", () => {
  assert.equal(parseStoredHighScore("12"), 12);
  for (const value of [null, "", "-1", "NaN", "Infinity", "{}"] ) assert.equal(parseStoredHighScore(value), 0);
  assert.equal(resolveHighScore(12, 7), 12);
  assert.equal(resolveHighScore(12, 20), 20);
});
```

- [ ] **Step 6: Implement rewards, misses, scheduling, and score validation**

```js
export function nextSpawnKind(state, random = Math.random) {
  return state.purplesUntilGold > 0
    ? { kind: "purple", purplesUntilGold: state.purplesUntilGold - 1 }
    : { kind: "gold", purplesUntilGold: randomGoldCount(random) };
}
export function recordCatch(state, spriteId) {
  const sprite = state.sprites.find((item) => item.id === spriteId);
  if (!sprite || state.status !== "playing") return state;
  const reward = sprite.kind === "gold" ? 5 : 1;
  return { ...state, score: state.score + reward, timeRemaining: state.timeRemaining + reward,
    catchCount: state.catchCount + 1, sprites: state.sprites.filter((item) => item.id !== spriteId),
    effects: [...state.effects, { type: "catch", value: reward, id: spriteId }] };
}
export function recordMiss(state, spriteId) {
  if (!state.sprites.some((item) => item.id === spriteId) || state.status !== "playing") return state;
  const misses = state.misses + 1;
  return { ...state, misses, status: misses >= 3 ? "game-over" : "playing",
    sprites: state.sprites.filter((item) => item.id !== spriteId), effects: [...state.effects, { type: "miss", id: spriteId }] };
}
export function parseStoredHighScore(raw) {
  if (raw === null || raw === "") return 0;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}
export const resolveHighScore = (previous, score) => Math.max(parseStoredHighScore(String(previous)), parseStoredHighScore(String(score)));
```

- [ ] **Step 7: Add failing spawn, collision, cap, clamp, and large-delta tests**

```js
test("spawns stay fully inside the safe width and stop at ten", () => {
  let state = createGameState(() => 0);
  for (let index = 0; index < 10; index++) state = spawnSprite(state, () => index / 10);
  assert.equal(state.sprites.length, 10);
  assert.ok(state.sprites.every((sprite) => sprite.x >= sprite.width / 2 && sprite.x <= 1 - sprite.width / 2));
  assert.equal(spawnSprite(state, () => 0.5), state);
});
test("movement clamps pointer and touch coordinates", () => {
  assert.equal(movePlayer(createGameState(), -4).playerX, GAME_CONSTANTS.playerWidth / 2);
  assert.equal(movePlayer(createGameState(), 9).playerX, 1 - GAME_CONSTANTS.playerWidth / 2);
});
test("catch wins over a same-frame miss and edge touching counts", () => {
  const state = { ...createGameState(), playerX: 0.5, sprites: [{ id: 1, kind: "purple", x: 0.5, y: 0.84, width: 0.09, height: 0.09 }] };
  const next = stepGame(state, 0.05, Math.random);
  assert.deepEqual([next.score, next.misses, next.sprites.length], [1, 0, 0]);
});
test("large deltas are clamped instead of teleporting", () => {
  const state = { ...createGameState(), sprites: [{ id: 1, kind: "purple", x: 0.1, y: 0, width: 0.09, height: 0.09 }] };
  const next = stepGame(state, 5, Math.random);
  assert.ok(next.sprites[0].y <= 0.65 * GAME_CONSTANTS.maxDeltaSeconds);
  assert.ok(next.timeRemaining > 59.9);
});
```

- [ ] **Step 8: Implement spawning, movement, collision-first stepping, and timer expiry**

```js
export function movePlayer(state, normalizedX) {
  const half = GAME_CONSTANTS.playerWidth / 2;
  return { ...state, playerX: Math.min(1 - half, Math.max(half, normalizedX)) };
}
export function spawnSprite(state, random = Math.random) {
  if (state.sprites.length >= GAME_CONSTANTS.maxActiveSprites || state.status !== "playing") return state;
  const schedule = nextSpawnKind(state, random);
  const width = GAME_CONSTANTS.spriteSize;
  const sprite = { id: state.nextSpriteId, kind: schedule.kind, x: width / 2 + random() * (1 - width), y: -width, width, height: width };
  return { ...state, sprites: [...state.sprites, sprite], nextSpriteId: state.nextSpriteId + 1, purplesUntilGold: schedule.purplesUntilGold };
}
const overlaps = (sprite, state) => {
  const halfPlayer = GAME_CONSTANTS.playerWidth / 2;
  const horizontal = Math.abs(sprite.x - state.playerX) <= halfPlayer + sprite.width / 2 + GAME_CONSTANTS.catchTolerance;
  return horizontal && sprite.y + sprite.height / 2 >= 1 - GAME_CONSTANTS.playerHeight;
};
export function stepGame(state, deltaSeconds, random = Math.random) {
  if (state.status !== "playing") return state;
  const delta = Math.min(GAME_CONSTANTS.maxDeltaSeconds, Math.max(0, deltaSeconds));
  let next = { ...state, timeRemaining: Math.max(0, state.timeRemaining - delta), effects: [] };
  if (next.timeRemaining === 0) return { ...next, status: "game-over" };
  const difficulty = getDifficulty(next.catchCount);
  next = { ...next, sprites: next.sprites.map((sprite) => ({ ...sprite, y: sprite.y + difficulty.fallSpeed * delta })), spawnElapsedMs: next.spawnElapsedMs + delta * 1000 };
  for (const sprite of [...next.sprites]) {
    if (overlaps(sprite, next)) next = recordCatch(next, sprite.id);
    else if (sprite.y - sprite.height / 2 > 1) next = recordMiss(next, sprite.id);
  }
  if (next.status === "playing" && next.spawnElapsedMs >= getDifficulty(next.catchCount).spawnIntervalMs && next.sprites.length < 10) {
    next = spawnSprite({ ...next, spawnElapsedMs: 0 }, random);
  }
  return next;
}
```

- [ ] **Step 9: Run engine tests and commit**

Run: `node --test tests/head-game.test.mjs`

Expected: all engine tests pass, including inside/outside/edge collision variants added beside the shown boundary test.

```bash
git add src/lib/head-game.js tests/head-game.test.mjs
git commit -m "feat: add deterministic head game engine"
```

### Task 3: Resilient High-Score Storage

**Files:**
- Create: `src/lib/easter-egg-storage.js`
- Create: `tests/easter-egg-storage.test.mjs`

**Interfaces:**
- Consumes: Storage-shaped `{ getItem(key), setItem(key, value) }`, pure `parseStoredHighScore`.
- Produces: `loadHighScore(storage, fallback = 0): number`; `saveHighScore(storage, score): boolean`; constant key `head-game:high-score`.

- [ ] **Step 1: Write failing storage tests**

```js
import assert from "node:assert/strict";
import test from "node:test";
import { loadHighScore, saveHighScore } from "../src/lib/easter-egg-storage.js";

test("invalid and unavailable storage retain the session fallback", () => {
  assert.equal(loadHighScore({ getItem: () => "broken" }, 9), 9);
  assert.equal(loadHighScore({ getItem: () => { throw new Error("denied"); } }, 9), 9);
  assert.equal(loadHighScore({ getItem: () => "12.0" }, 9), 12);
});
test("saving is guarded and reports availability", () => {
  const values = new Map();
  assert.equal(saveHighScore({ setItem: (key, value) => values.set(key, value) }, 12), true);
  assert.equal(values.get("head-game:high-score"), "12");
  assert.equal(saveHighScore({ setItem: () => { throw new Error("quota"); } }, 12), false);
  assert.equal(saveHighScore({ setItem: () => {} }, -1), false);
  assert.equal(saveHighScore({ setItem: () => {} }, Number.NaN), false);
});
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --test tests/easter-egg-storage.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Implement the guarded adapter**

```js
import { parseStoredHighScore } from "./head-game.js";
export const HIGH_SCORE_KEY = "head-game:high-score";
export function loadHighScore(storage, fallback = 0) {
  try {
    const raw = storage.getItem(HIGH_SCORE_KEY);
    if (raw === null || String(raw).trim() === "") return fallback;
    const numeric = Number(raw);
    return Number.isFinite(numeric) && numeric >= 0 ? parseStoredHighScore(raw) : fallback;
  } catch { return fallback; }
}
export function saveHighScore(storage, score) {
  const numeric = Number(score);
  if (!Number.isFinite(numeric) || numeric < 0) return false;
  try { storage.setItem(HIGH_SCORE_KEY, String(numeric)); return true; }
  catch { return false; }
}
```

- [ ] **Step 4: Run all unit tests and commit**

Run: `npm run test:unit`

Expected: engine, storage, and existing contract tests pass.

```bash
git add src/lib/easter-egg-storage.js tests/easter-egg-storage.test.mjs
git commit -m "feat: guard head game high score storage"
```

### Task 4: Easter Egg Component, Canvas Controller, Audio, and Cleanup

**Files:**
- Create: `src/components/EasterEgg.astro`
- Create: `tests/easter-egg-contract.test.mjs`

**Interfaces:**
- Consumes: all Task 2 engine functions, Task 3 storage functions, four Task 1 assets, `portfolio:easter-egg-open` and `portfolio:restore-request` events.
- Produces: DOM states `passcode|menu|playing|game-over`, `data-easter-egg`, `data-game-state`, restore tab, mute toggle, controller debug counters only when `?e2e=1`, and `portfolio:restore-request` dispatch.

- [ ] **Step 1: Write failing semantic and lifecycle contract tests**

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const source = await readFile(new URL("../src/components/EasterEgg.astro", import.meta.url), "utf8");

test("component exposes every accessible state and universal controls", () => {
  for (const token of ["Enter The Passcode", "Enter Code Here", "Head Game Strong", "How good is your head game?", "Play Now!", "Play Again", "data-game-canvas", "aria-live", "data-restore-portfolio", "data-mute"]) assert.match(source, new RegExp(token));
});
test("assets are centralized and head frames share one render box", () => {
  assert.match(source, /const ASSETS = Object\.freeze/);
  for (const file of ["purple-sprite.webp", "gold-sprite.webp", "head-open.webp", "head-closed.webp"]) assert.match(source, new RegExp(file));
});
test("one cleanup path cancels animation, timers, input, speech, and audio", () => {
  assert.match(source, /function cleanupSession/);
  for (const token of ["cancelAnimationFrame", "clearTimeout", "heldKeys.clear", "speechSynthesis.cancel", "oscillator", "sessionToken"]) assert.match(source, new RegExp(token.replace(".", "\\.")));
});
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --test tests/easter-egg-contract.test.mjs`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Create the full semantic shell**

```astro
<section class="easter-egg" data-easter-egg data-game-state="portfolio" aria-hidden="true" inert>
  <button type="button" class="creator-tab" data-restore-portfolio aria-label="Restore portfolio">@Cxndy</button>
  <div class="egg-screen passcode-screen" data-screen="passcode" hidden>
    <form data-passcode-form><label for="egg-code">Enter The Passcode</label><input id="egg-code" data-passcode-input placeholder="Enter Code Here" autocomplete="off" /><button>Enter</button></form>
    <p data-passcode-error role="alert" hidden>Oooo GURRRLLL! You ain't saucy enough to enturrr!</p>
  </div>
  <div class="egg-screen game-menu" data-screen="menu" hidden><h2>Head Game Strong</h2><p>How good is your head game?</p><p>High score: <output data-high-score>0</output></p><button type="button" data-play>Play Now!</button></div>
  <div class="egg-screen cabinet" data-screen="playing" hidden>
    <div class="hud"><span>Score <output data-score>0</output></span><span>Time <output data-time>60</output></span><span data-lives aria-label="3 lives remaining">○ ○ ○</span></div>
    <canvas data-game-canvas aria-label="Head Game playfield"></canvas>
  </div>
  <div class="egg-screen game-over" data-screen="game-over" hidden><h2>Game Over</h2><p>Final score: <output data-final-score>0</output></p><p>High score: <output data-final-high-score>0</output></p><button type="button" data-play-again>Play Again</button></div>
  <button type="button" data-mute aria-pressed="false">Sound on</button>
  <p class="sr-only" data-game-status aria-live="polite"></p>
</section>
```

- [ ] **Step 4: Add state, passcode, focus, persistence, and restore controller code**

```js
const ASSETS = Object.freeze({ purple: "/assets/easter-egg/purple-sprite.webp", gold: "/assets/easter-egg/gold-sprite.webp", open: "/assets/easter-egg/head-open.webp", closed: "/assets/easter-egg/head-closed.webp" });
let uiState = "portfolio", game = null, highScore = loadHighScore(localStorage), muted = false, sessionToken = 0;
function show(next) {
  uiState = next; root.dataset.gameState = next;
  screens.forEach((screen) => { screen.hidden = screen.dataset.screen !== next; });
  const target = next === "passcode" ? passcodeInput : next === "menu" ? playButton : next === "game-over" ? playAgain : null;
  target?.focus({ preventScroll: true });
}
passcodeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (passcodeInput.value.trim().toUpperCase() === "P3N15") { clearAlarm(); show("menu"); }
  else { showAlarmForTwoSeconds(); playAlarm(); passcodeInput.select(); }
});
function restorePortfolio() {
  cleanupSession(); passcodeInput.value = ""; clearAlarm(); show("portfolio");
  root.inert = true; root.setAttribute("aria-hidden", "true");
  document.dispatchEvent(new CustomEvent("portfolio:restore-request"));
}
```

- [ ] **Step 5: Add responsive canvas mapping, input, rendering, pause, and game loop**

```js
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect(), ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width * ratio); canvas.height = Math.round(rect.height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}
const normalizedPointerX = (event) => {
  const rect = canvas.getBoundingClientRect();
  return (event.clientX - rect.left) / rect.width;
};
function frame(now, token) {
  if (token !== sessionToken || uiState !== "playing") return;
  const delta = lastFrame ? (now - lastFrame) / 1000 : 0; lastFrame = now;
  if (!document.hidden) game = stepGame(applyHeldKeys(game, delta), delta, Math.random, canvas.clientWidth, canvas.clientHeight);
  renderCanvas(game); syncHud(game); consumeEffects(game.effects);
  if (game.status === "game-over") finishRun(); else frameId = requestAnimationFrame((time) => frame(time, token));
}
canvas.addEventListener("pointerdown", (event) => { dragging = true; canvas.setPointerCapture(event.pointerId); game = movePlayer(game, normalizedPointerX(event)); });
canvas.addEventListener("pointermove", (event) => { if (event.pointerType === "mouse" || dragging) game = movePlayer(game, normalizedPointerX(event)); });
window.addEventListener("keydown", onKeyDown); window.addEventListener("keyup", onKeyUp);
window.addEventListener("blur", () => heldKeys.clear());
document.addEventListener("visibilitychange", () => { heldKeys.clear(); lastFrame = 0; status.textContent = document.hidden ? "Game paused" : "Game resumed"; });
```

- [ ] **Step 6: Add bounded audio and shared cleanup**

```js
function playAlarm() {
  if (muted) return;
  stopOscillator(); const audio = audioContext || new AudioContext(); audioContext = audio;
  oscillator = audio.createOscillator(); const gain = audio.createGain();
  oscillator.type = "sawtooth"; oscillator.frequency.value = 180; gain.gain.value = 0.035;
  oscillator.connect(gain).connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + 0.35);
}
function sayYummy() {
  if (muted) return; speechSynthesis.cancel(); const cue = new SpeechSynthesisUtterance("Yummy"); cue.rate = 1.15; speechSynthesis.speak(cue);
}
function cleanupSession() {
  sessionToken += 1; cancelAnimationFrame(frameId); clearTimeout(alarmTimer); clearTimeout(mouthTimer);
  heldKeys.clear(); dragging = false; speechSynthesis.cancel(); stopOscillator();
  game = null; lastFrame = 0; root.classList.remove("is-alarm", "is-shaking", "has-edge-pulse");
}
muteButton.addEventListener("click", () => { muted = !muted; muteButton.setAttribute("aria-pressed", String(muted)); muteButton.textContent = muted ? "Muted" : "Sound on"; if (muted) { speechSynthesis.cancel(); stopOscillator(); } });
```

- [ ] **Step 7: Add complete component styles**

Define fixed full-viewport layering; centered passcode/menu/game-over panels; black rounded misty cabinet; `aspect-ratio: 4/3` canvas constrained by `max-height: calc(100dvh - 8rem)`; bottom-left tab clearance of at least `4rem`; pixel-style system fallback stack; explicit focus rings; DOM HUD and labeled lives (`○`, `●` plus accessible remaining count); slow red radial alarm/edge pulses; closed-mouth and bonus classes; decorative menu sprites confined with absolute paths outside the central copy safe zone. Under `prefers-reduced-motion: reduce`, disable decoration travel, waves, cabinet shake, and bonus transforms and reduce transitions to `.01ms`. At `max-width: 720px`, fit controls and canvas within `100dvh`; ensure `overflow: clip` on the root.

- [ ] **Step 8: Run contracts, type/build checks, and commit**

Run: `node --test tests/easter-egg-contract.test.mjs && npm run check && npm run build`

Expected: contract tests pass, Astro reports zero errors, and the production build succeeds.

```bash
git add src/components/EasterEgg.astro tests/easter-egg-contract.test.mjs
git commit -m "feat: build accessible head game experience"
```

### Task 5: Monitor Minimize/Restore Integration

**Files:**
- Modify: `src/components/PortfolioMonitor.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/[view].astro`
- Modify: `tests/easter-egg-contract.test.mjs`
- Modify: `tests/monitor-shell.test.mjs`

**Interfaces:**
- Consumes: Task 4 event contract and `EasterEgg` component.
- Produces: amber `[data-minimize-monitor]`, cancellation-safe minimize, forced Home restoration, predictable focus, and one EasterEgg instance on every route.

- [ ] **Step 1: Add failing monitor integration tests**

```js
test("monitor provides one accessible amber minimize action", async () => {
  const source = await read("../src/components/PortfolioMonitor.astro");
  assert.match(source, /data-minimize-monitor/);
  assert.match(source, /aria-label="Minimize portfolio and open game"/);
  assert.doesNotMatch(source, /<span class="window-dots"/);
});
test("restore cancels transitions, renders Home, and restores focus", async () => {
  const source = await read("../src/components/PortfolioMonitor.astro");
  assert.match(source, /portfolio:restore-request/);
  assert.match(source, /clearTimeout\(timer\)/);
  assert.match(source, /clearControlAnimations\(\)/);
  assert.match(source, /render\("home", true\)/);
});
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --test tests/monitor-shell.test.mjs tests/easter-egg-contract.test.mjs`

Expected: FAIL because the minimize button and integration events are absent.

- [ ] **Step 3: Replace decorative dots with the functional control**

```astro
<button class="monitor-minimize" type="button" data-minimize-monitor aria-label="Minimize portfolio and open game"><span aria-hidden="true"></span></button>
```

Style it as a 26 px amber circle (`#f6ad2f`) with a centered horizontal glyph, darker hover (`#d98d13`), and visible `:focus-visible` ring. Keep the bar's existing spacing by retaining the `window-dots` footprint as the button's wrapper class if necessary.

- [ ] **Step 4: Add cancellation-safe monitor coordination**

```js
const minimizeButton = app.querySelector("[data-minimize-monitor]");
function finishPortfolioTransition() {
  clearTimeout(timer); clearControlAnimations(); app.removeAttribute("aria-busy");
  app.classList.remove("is-transitioning", "is-leaving-home", "is-returning-home");
}
function restoreHome() {
  finishPortfolioTransition(); history.replaceState({ view: "home" }, "", "/");
  render("home", false); app.inert = false; app.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => minimizeButton?.focus({ preventScroll: true }));
  document.dispatchEvent(new CustomEvent("portfolio:restored"));
}
minimizeButton?.addEventListener("click", () => {
  finishPortfolioTransition(); app.inert = true; app.setAttribute("aria-hidden", "true");
  app.classList.add("is-minimized");
  document.dispatchEvent(new CustomEvent("portfolio:easter-egg-open"));
});
document.addEventListener("portfolio:restore-request", restoreHome);
```

- [ ] **Step 5: Mount the Easter egg on both routes**

```astro
---
import EasterEgg from "../components/EasterEgg.astro";
---
<BaseLayout title={`${portfolioContacts.name} | Creative Portfolio`}>
  <PortfolioMonitor initialView="home" />
  <EasterEgg handle={portfolioContacts.handle} />
</BaseLayout>
```

Apply the same import/sibling markup in `[view].astro`, retaining its existing `initialView={view}` value.

- [ ] **Step 6: Add monitor shrink/restore styles**

Add an `is-minimized` transition that visually moves the monitor toward the bottom-left tab before hiding it; make reduced motion immediate. Never use `display:none` until the transition finishes, and leave the separately owned creator tab visible. Ensure a restore removes `is-minimized`; inactive monitor content remains inert throughout.

- [ ] **Step 7: Run regression suite and commit**

Run: `npm run test:unit && npm run check && npm run build`

Expected: all old navigation/motion tests and new integration contracts pass; Astro check/build pass.

```bash
git add src/components/PortfolioMonitor.astro src/components/EasterEgg.astro src/pages/index.astro src/pages/[view].astro tests/monitor-shell.test.mjs tests/easter-egg-contract.test.mjs
git commit -m "feat: integrate monitor with head game easter egg"
```

### Task 6: Browser Interaction, Cleanup, Accessibility, and Responsive QA

**Files:**
- Create: `tests/easter-egg.spec.mjs`
- Modify: `src/components/EasterEgg.astro`
- Modify: `src/components/PortfolioMonitor.astro`

**Interfaces:**
- Consumes: completed UI and event contract from Tasks 4–5.
- Produces: browser-backed acceptance coverage and narrowly gated `window.__HEAD_GAME_DEBUG__` diagnostics when `?e2e=1`.

- [ ] **Step 1: Write the failing state/restore/passcode browser test**

```js
import { expect, test } from "@playwright/test";
async function openMenu(page) {
  await page.getByRole("button", { name: "Minimize portfolio and open game" }).click();
  await expect(page.getByLabel("Enter The Passcode")).toBeFocused();
  await page.getByLabel("Enter The Passcode").fill("  p3n15  ");
  await page.getByRole("button", { name: "Enter", exact: true }).click();
}
test("every state restores Home and the next cycle requires a code", async ({ page }) => {
  await page.goto("/?e2e=1"); await openMenu(page);
  await page.getByRole("button", { name: "Restore portfolio" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "Minimize portfolio and open game" }).click();
  await expect(page.getByLabel("Enter The Passcode")).toBeVisible();
});
```

- [ ] **Step 2: Run it and confirm RED**

Run: `npx playwright test tests/easter-egg.spec.mjs --project=desktop`

Expected: FAIL at the first missing or incorrect focus/transition assertion.

- [ ] **Step 3: Add incorrect-code, menu, playing, and game-over restore cases**

Test the exact two-second error dismissal using Playwright clock; immediate corrected resubmission; restore from all four Easter-egg states; a test-only `window.__HEAD_GAME_DEBUG__.endRun()` to deterministically reach game over; and assert Play Again focus. Keep the debug object behind `new URLSearchParams(location.search).has("e2e")` so production visits do not expose controls.

```js
await page.getByLabel("Enter The Passcode").fill("wrong");
await page.getByRole("button", { name: "Enter", exact: true }).click();
await expect(page.getByRole("alert")).toBeVisible();
await page.waitForTimeout(2100);
await expect(page.getByRole("alert")).toBeHidden();
```

- [ ] **Step 4: Add input, visibility, mute, persistence, and cleanup cases**

Use keyboard arrows, mouse coordinates, and `page.touchscreen.tap`; verify debug `playerX` changes and stays bounded. Override `document.hidden` through the debug pause hook, advance time, and assert the game timer is unchanged while hidden. Spy on `speechSynthesis.cancel`, AudioContext closure/oscillator stop, RAF cancellation, active-listener count, and `sessionToken`; repeat three play/restore cycles and assert one loop/listener set and no stale score mutation. Seed valid, corrupt, and throwing storage; assert valid high score loads and failures still render the menu.

- [ ] **Step 5: Add responsive and accessibility cases**

For desktop, Pixel 7, and a custom 320×568 viewport, assert `document.documentElement.scrollHeight === innerHeight`, canvas bounds remain within viewport, and creator tab does not overlap the canvas. Test portrait then `page.setViewportSize({ width: 740, height: 360 })`, move to both pointer extremes, and assert clamping. Assert inactive layer has both `inert` and `aria-hidden="true"`, mute exposes `aria-pressed`, lives include readable text/label, status announcements change, Tab reaches mute and restore without trapping, and reduced-motion computed animation durations are effectively zero.

- [ ] **Step 6: Run browser tests and fix only observed failures**

Run: `npx playwright test tests/easter-egg.spec.mjs`

Expected: all three configured projects pass. For each failure, preserve the public interfaces above and make the smallest component/style correction; rerun the single failing test before rerunning the file.

- [ ] **Step 7: Run full verification and commit**

Run: `npm test && npm run check && npm run build`

Expected: all unit/contract/browser tests pass, Astro check has zero errors, and production build succeeds.

```bash
git add tests/easter-egg.spec.mjs src/components/EasterEgg.astro src/components/PortfolioMonitor.astro
git commit -m "test: verify head game browser lifecycle"
```

### Task 7: Final Manual Browser QA and Documentation Proof

**Files:**
- Modify only if QA exposes a defect: `src/components/EasterEgg.astro`, `src/components/PortfolioMonitor.astro`, `tests/easter-egg.spec.mjs`, or `tests/head-game.test.mjs`

**Interfaces:**
- Consumes: production build and the complete acceptance suite.
- Produces: visually verified release candidate with any discovered regression pinned by a test.

- [ ] **Step 1: Start the production preview**

Run: `npm run build && npm run preview -- --host 127.0.0.1`

Expected: preview serves the built site without console errors.

- [ ] **Step 2: Inspect the full happy path at 1440×900**

Verify amber hover/focus, monitor-to-tab movement, passcode caret, exact menu copy, decorative paths avoiding text, open/closed head swap, score/time bonuses, three readable lives, gold texture, quick speed by roughly catch ten, capped fall speed afterward, denser spawning through catch fourteen, immediate third-miss/timer game over, high score, Play Again, mute, and universal restore.

- [ ] **Step 3: Inspect 320×568, 412×915, and 740×360**

Verify no document scrollbar, no tab/cabinet overlap, complete sprites within the playfield, correct mouse/touch mapping after resize/rotation, usable HUD/buttons, and visible focus rings. Capture screenshots for comparison but do not commit them unless the repository adopts snapshot artifacts.

- [ ] **Step 4: Inspect reduced motion, keyboard-only use, and browser console**

Enable reduced motion and verify softened alarm plus static/non-wavy feedback; use only Tab/Enter/arrows to enter, play, mute, and restore; background/foreground the tab; confirm no unexpected console errors, orphan speech, alarm, or timer jumps.

- [ ] **Step 5: Pin and repair every observed defect**

Before changing product code, add the smallest failing Node or Playwright regression test that reproduces the defect. Run that test to see the expected failure, apply the minimal fix, rerun it to green, then rerun `npm test && npm run check && npm run build`.

- [ ] **Step 6: Commit QA fixes, if any**

```bash
git add src/components/EasterEgg.astro src/components/PortfolioMonitor.astro tests/easter-egg.spec.mjs tests/head-game.test.mjs
git commit -m "fix: resolve head game browser QA findings"
```

- [ ] **Step 7: Record final evidence in the handoff**

Report the exact commands and passing counts, tested viewport/motion combinations, generated asset paths, and whether QA produced a final fix commit. Do not claim completion without current output from `npm test`, `npm run check`, and `npm run build`.
