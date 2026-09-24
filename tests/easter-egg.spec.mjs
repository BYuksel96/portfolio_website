import { expect, test } from "@playwright/test";
const codeInput = (page) => page.getByLabel("Enter The Passcode");

async function minimize(page) {
  await page.getByRole("button", { name: "Minimize portfolio and open game" }).click();
  await expect(codeInput(page)).toBeVisible();
  await expect(codeInput(page)).toBeFocused();
}

async function unlock(page) {
  await minimize(page);
  await codeInput(page).fill("  p3n15  ");
  await page.getByRole("button", { name: "Enter", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Head Game Strong" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Play Now!" })).toBeFocused();
}

async function restore(page) {
  await page.getByRole("button", { name: "Restore portfolio" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: "Minimize portfolio and open game" })).toBeFocused();
  await expect(page).toHaveURL(/\/$/);
}

test("every Easter egg state restores Home and the next cycle requires the code", async ({ page }) => {
  await page.goto("/?e2e=1");
  await minimize(page);
  await restore(page);

  await unlock(page);
  await restore(page);

  await unlock(page);
  await page.getByRole("button", { name: "Play Now!" }).click();
  await expect(page.locator("[data-game-canvas]")).toBeVisible();
  await restore(page);

  await unlock(page);
  await page.getByRole("button", { name: "Play Now!" }).click();
  await page.evaluate(() => window.__HEAD_GAME_DEBUG__.endRun());
  await expect(page.getByRole("heading", { name: "Game Over" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Play Again" })).toBeFocused();
  await restore(page);

  await minimize(page);
  await expect(codeInput(page)).toHaveValue("");
});

test("wrong code alarms for two seconds and allows immediate correction", async ({ page }) => {
  await page.goto("/?e2e=1");
  await minimize(page);
  await codeInput(page).fill("NOPE");
  await page.getByRole("button", { name: "Enter", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("saucy enough");
  await codeInput(page).fill("P3N15");
  await page.getByRole("button", { name: "Enter", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Head Game Strong" })).toBeVisible();

  await restore(page);
  await minimize(page);
  await codeInput(page).fill("wrong");
  await page.getByRole("button", { name: "Enter", exact: true }).click();
  await page.waitForTimeout(2100);
  await expect(page.getByRole("alert")).toBeHidden();
});

test("keyboard, pointer, pause, mute, and responsive bounds remain playable", async ({ page }, testInfo) => {
  await page.goto("/?e2e=1");
  await unlock(page);
  await page.getByRole("button", { name: "Play Now!" }).click();
  const canvas = page.locator("[data-game-canvas]");
  await expect(canvas).toBeVisible();

  const initialX = await page.evaluate(() => window.__HEAD_GAME_DEBUG__.state.game.playerX);
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(120);
  await page.keyboard.up("ArrowRight");
  const keyboardX = await page.evaluate(() => window.__HEAD_GAME_DEBUG__.state.game.playerX);
  expect(keyboardX).toBeGreaterThan(initialX);

  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box.x + 1, box.y + box.height / 2);
  const pointerX = await page.evaluate(() => window.__HEAD_GAME_DEBUG__.state.game.playerX);
  expect(pointerX).toBeGreaterThanOrEqual(0);
  expect(pointerX).toBeLessThanOrEqual(1);

  await page.evaluate(() => window.__HEAD_GAME_DEBUG__.setHidden(true));
  const pausedAt = await page.evaluate(() => window.__HEAD_GAME_DEBUG__.state.game.timeRemaining);
  await page.waitForTimeout(220);
  const stillPausedAt = await page.evaluate(() => window.__HEAD_GAME_DEBUG__.state.game.timeRemaining);
  expect(stillPausedAt).toBe(pausedAt);
  await page.evaluate(() => window.__HEAD_GAME_DEBUG__.setHidden(false));

  const mute = page.locator("[data-mute]");
  await mute.click();
  await expect(mute).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-lives]")).toHaveAttribute("aria-label", /3 lives remaining/i);

  const metrics = await page.evaluate(() => {
    const canvasRect = document.querySelector("[data-game-canvas]").getBoundingClientRect();
    const tabRect = document.querySelector("[data-restore-portfolio]").getBoundingClientRect();
    return {
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight,
      canvasBottom: canvasRect.bottom,
      canvasRight: canvasRect.right,
      tabTop: tabRect.top,
      innerWidth,
      animationDuration: getComputedStyle(document.querySelector(".flyer")).animationDuration,
    };
  });
  expect(metrics.scrollHeight).toBe(metrics.innerHeight);
  expect(metrics.canvasRight).toBeLessThanOrEqual(metrics.innerWidth + 1);
  expect(metrics.canvasBottom).toBeLessThanOrEqual(metrics.tabTop + 1);
  if (testInfo.project.name === "reduced-motion") expect(parseFloat(metrics.animationDuration)).toBeLessThanOrEqual(0.01);
});

test("high score persists and game over offers replay", async ({ page }) => {
  await page.goto("/?e2e=1");
  await page.evaluate(() => localStorage.setItem("head-game:high-score", "42"));
  await page.reload();
  await unlock(page);
  await expect(page.locator("[data-high-score]")).toHaveText("42");
  await page.getByRole("button", { name: "Play Now!" }).click();
  await page.evaluate(() => window.__HEAD_GAME_DEBUG__.endRun());
  await expect(page.getByRole("heading", { name: "Game Over" })).toBeVisible();
  await expect(page.locator("[data-final-high-score]")).toHaveText("42");
  await expect(page.getByRole("button", { name: "Play Again" })).toBeVisible();
});
test("tiny portrait and short landscape preserve the playfield and clamped controls", async ({ page }) => {
  await page.goto("/?e2e=1");
  await unlock(page);
  await page.getByRole("button", { name: "Play Now!" }).click();
  const canvas = page.locator("[data-game-canvas]");

  for (const viewport of [{ width: 320, height: 568 }, { width: 740, height: 360 }]) {
    await page.setViewportSize(viewport);
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();

    await page.mouse.move(box.x - 100, box.y + box.height / 2);
    const left = await page.evaluate(() => window.__HEAD_GAME_DEBUG__.state.game.playerX);
    await page.mouse.move(box.x + box.width + 100, box.y + box.height / 2);
    const right = await page.evaluate(() => window.__HEAD_GAME_DEBUG__.state.game.playerX);
    expect(left).toBeGreaterThanOrEqual(0);
    expect(right).toBeLessThanOrEqual(1);

    const bounds = await page.evaluate(() => {
      const game = document.querySelector(".egg-screen:not([hidden])").getBoundingClientRect();
      const tab = document.querySelector("[data-restore-portfolio]").getBoundingClientRect();
      return { gameLeft: game.left, gameRight: game.right, gameBottom: game.bottom, tabTop: tab.top, width: innerWidth };
    });
    expect(bounds.gameLeft).toBeGreaterThanOrEqual(0);
    expect(bounds.gameRight).toBeLessThanOrEqual(bounds.width + 1);
    expect(bounds.gameBottom).toBeLessThanOrEqual(bounds.tabTop + 1);
  }
});
