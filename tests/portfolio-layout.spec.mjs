import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { splitCaption } from "../src/lib/social-content.js";

async function cardBoxes(cards) {
  return cards.evaluateAll(elements => elements.map(element => {
    const { x, y, width, height } = element.getBoundingClientRect();
    return { x, y, width, height };
  }));
}

async function expectStacked(cards, columns) {
  await expect.poll(async () => {
    const boxes = await cardBoxes(cards);
    return Math.max(...boxes.slice(columns).map((box, offset) => {
      const previous = boxes[offset];
      return Math.abs(box.y - previous.y - previous.height - 14);
    }));
  }).toBeLessThan(2);
  const boxes = await cardBoxes(cards);
  for (let index = columns; index < boxes.length; index++) expect(boxes[index].x).toBeCloseTo(boxes[index - columns].x, 1);
}

test("split-flap scenery is Home-only through direct routes, dock navigation, and history", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/eyebrow-tattooing");
  const board = page.locator(".split-flap-board");
  await expect(board).toBeHidden();
  for (const view of ["contacts", "search", "photography", "videography", "dance"]) {
    await page.locator(`.monitor-dock [data-view="${view}"]`).click();
    await expect(page.locator(`[data-panel="${view}"]`)).toBeVisible();
    await expect(board).toBeHidden();
  }
  await page.locator('.monitor-dock [data-view="home"]').click();
  await expect(page.locator("[data-monitor-app]")).toHaveClass(/is-home/);
  await expect(board).toBeVisible();
  await page.goBack();
  await expect(page.locator('[data-panel="dance"]')).toBeVisible();
  await expect(board).toBeHidden();
  await page.goto("/contacts");
  await expect(board).toBeHidden();
  await page.goto("/");
  await expect(board).toBeVisible();
  expect(errors).toEqual([]);
});

test("portfolio masonry stacks each column with equal gaps and reflows after playback and resizing", async ({ page }, testInfo) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/eyebrow-tattooing");
  const panel = page.locator('[data-panel="eyebrow-tattooing"]');
  const cards = panel.locator(".featured-card");
  await expect(cards).toHaveCount(9);
  const columns = testInfo.project.name === "mobile" ? 1 : 3;
  await expectStacked(cards, columns);
  await expect(panel.locator(".section-label")).not.toContainText("3 × 3");
  if (columns === 3) {
    const boxes = await cardBoxes(cards);
    expect(boxes[0].y).toBeCloseTo(boxes[1].y, 1);
    expect(boxes[1].y).toBeCloseTo(boxes[2].y, 1);
    expect(boxes[3].y).toBeLessThan(boxes[4].y);
  }
  await panel.locator(".latest-preview").scrollIntoViewIfNeeded();
  await page.screenshot({ path: join(tmpdir(), `portfolio-masonry-${testInfo.project.name}.png`) });
  await cards.nth(5).getByRole("button", { name: "Play video", exact: true }).click();
  await expect.poll(() => cards.nth(5).locator("video").evaluate(element => element.currentTime)).toBeGreaterThan(0);
  await expectStacked(cards, columns);
  await cards.nth(5).getByRole("button", { name: "Close video" }).click();
  await expectStacked(cards, columns);
  await page.setViewportSize({ width: 600, height: 850 });
  await expectStacked(cards, 1);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expectStacked(cards, 3);
  await page.locator('.monitor-dock [data-view="photography"]').click();
  await expect(page.locator('[data-panel="photography"]')).toBeVisible();
  await page.locator('.monitor-dock [data-view="eyebrow-tattooing"]').click();
  await expect(panel).toBeVisible();
  await expectStacked(cards, 3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  expect(errors).toEqual([]);
});

test("long captions preview with ellipsis, expand with video, and reset when closed or navigating", async ({ page }, testInfo) => {
  const data = JSON.parse(await readFile(new URL("../src/data/social/eyebrow-tattooing.json", import.meta.url), "utf8"));
  const full = splitCaption(data.posts[5].cached.caption).caption;
  await page.goto("/eyebrow-tattooing");
  const cards = page.locator('[data-panel="eyebrow-tattooing"] .featured-card');
  const card = cards.nth(5);
  const heading = card.locator("h3");
  const preview = (await heading.innerText()).trim();
  expect(preview.endsWith("...")).toBe(true);
  expect(preview.length).toBeLessThanOrEqual(243);
  expect(preview.length).toBeLessThan(full.length / 2);
  expect(full.startsWith(preview.slice(0, -3))).toBe(true);
  const captionButton = heading.getByRole("button");
  await expect(captionButton).toHaveAccessibleName(preview);
  await expect(captionButton).toHaveAccessibleDescription("Play video and read full caption");
  await captionButton.focus();
  await page.keyboard.press("Enter");
  await expect(card.locator(".featured-media")).toHaveClass(/is-playing/);
  await expect.poll(() => card.locator("video").evaluate(element => element.currentTime)).toBeGreaterThan(0);
  await expect(heading).toHaveText(full, { useInnerText: true });
  await expect(captionButton).toHaveAccessibleName(full);
  await page.screenshot({ path: join(tmpdir(), `portfolio-caption-expanded-${testInfo.project.name}.png`) });
  await card.getByRole("button", { name: "Close video" }).click();
  await expect(heading).toHaveText(preview, { useInnerText: true });
  await card.getByRole("button", { name: "Play video", exact: true }).click();
  await expect(heading).toHaveText(full, { useInnerText: true });
  await page.locator('.monitor-dock [data-view="contacts"]').click();
  await expect(page.locator('[data-panel="contacts"]')).toBeVisible();
  await page.locator('.monitor-dock [data-view="eyebrow-tattooing"]').click();
  await expect(card).toBeVisible();
  await expect(heading).toHaveText(preview, { useInnerText: true });
  for (const index of [1, 2, 3]) {
    const link = cards.nth(index).locator("h3 a");
    await expect(link).toHaveAttribute("href", data.posts[index].url);
    await expect(link).toHaveAttribute("target", "_blank");
  }
  // Exercise the actual links without depending on Instagram's network/login UI.
  await page.context().route("https://www.instagram.com/**", route => route.fulfill({ contentType: "text/html", body: "<p>Original post destination</p>" }));
  for (const index of [1, 2]) {
    const popupReady = page.waitForEvent("popup");
    await cards.nth(index).locator("h3 a").click();
    const popup = await popupReady;
    await expect(popup).toHaveURL(data.posts[index].url);
    await popup.close();
  }
  await expect(cards.first().locator("h3")).not.toContainText("...");
});

test("cards remain readable when JavaScript enhancement is unavailable", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
  try {
    const page = await context.newPage();
    await page.goto("http://localhost:4321/eyebrow-tattooing");
    const cards = page.locator('[data-panel="eyebrow-tattooing"] .featured-card');
    const boxes = await cardBoxes(cards);
    expect(boxes[3].y).toBeGreaterThanOrEqual(Math.max(...boxes.slice(0, 3).map(box => box.y + box.height)) + 13);
  } finally { await context.close(); }
});
