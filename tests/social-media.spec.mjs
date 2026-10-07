import { expect, test } from "@playwright/test";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("video close control matches the minimise circle with a touch target and mouse-only red hover", async ({ page }, testInfo) => {
  await page.goto("/dance");
  const card = page.locator('[data-panel="dance"] .featured-card').first();
  await card.locator("[data-play-social]").click();
  const close = card.getByRole("button", { name: "Close video" });
  await expect(close).toBeVisible();
  const circle = close.locator("span");
  await expect(circle).toBeVisible();
  // Capture related rectangles together: playback can scroll the card between reads.
  const { circleBounds, minimiseBounds, target, numberBounds } = await close.evaluate(element => {
    const box = node => {
      const { x, y, width, height } = node.getBoundingClientRect();
      return { x, y, width, height };
    };
    return {
      circleBounds: box(element.querySelector("span")),
      minimiseBounds: box(document.querySelector(".monitor-minimize")),
      target: box(element),
      numberBounds: box(element.closest(".featured-media").querySelector(".media-number"))
    };
  });
  expect(circleBounds.width).toBe(minimiseBounds.width);
  expect(circleBounds.height).toBe(minimiseBounds.height);
  expect(target.width).toBeGreaterThanOrEqual(44);
  expect(target.height).toBeGreaterThanOrEqual(44);
  expect(circleBounds.x + circleBounds.width / 2).toBeCloseTo(target.x + target.width / 2, 1);
  expect(circleBounds.y + circleBounds.height / 2).toBeCloseTo(target.y + target.height / 2, 1);
  expect(circleBounds.y + circleBounds.height / 2).toBeCloseTo(numberBounds.y + numberBounds.height / 2, 1);
  await page.mouse.move(0, 0);
  const background = () => circle.evaluate(element => getComputedStyle(element).backgroundColor);
  const base = await background();
  const [red, green, blue] = base.match(/\d+/g).map(Number);
  expect(red).toBeGreaterThan(green * 1.5);
  expect(red).toBeGreaterThan(blue * 1.5);
  await close.hover();
  const supportsHover = await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches);
  if (supportsHover) await expect.poll(background).not.toBe(base);
  else expect(await background()).toBe(base);
  await page.screenshot({ path: join(tmpdir(), `social-close-${testInfo.project.name}.png`) });
  // The invisible margin around the circle must also close the video.
  await close.click({ position: { x: 5, y: 22 } });
  await expect(card.locator(".featured-media")).not.toHaveClass(/is-playing/);
  await expect(card.locator("[data-play-social]")).toBeFocused();
  expect(await card.locator("video").evaluate(element => element.paused)).toBe(true);
});

for (const sample of [
  { route: "eyebrow-tattooing", count: 9, caption: "When brow and lip sessions feel just like yap sessions with your girlfriends.", date: "7 August 2026", tag: "#pmu", url: "https://www.instagram.com/reel/DbyTDW2BAdX/" },
  { route: "dance", count: 1, caption: "The rare front view @leicamrv", date: "13 February 2026", tag: "#danceclass", url: "https://www.tiktok.com/@geyonceynowles/video/7606435375598406943" }
]) {
  test(`${sample.route} displays saved media without platform frames and plays inside the card`, async ({ page }, testInfo) => {
    const errors = [];
    const platformRequests = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("request", request => {
      if (/instagram\.com|tiktok\.com|tiktokcdn/.test(request.url())) platformRequests.push(request.url());
    });
    await page.goto(`/${sample.route}`);
    const panel = page.locator(`[data-panel="${sample.route}"]`);
    const card = panel.locator(".featured-card").first();
    const media = card.locator(".featured-media");
    const video = card.locator("video");
    await expect(panel.getByRole("heading", { level: 2 })).toBeVisible();
    await expect(panel.locator(".featured-card")).toHaveCount(sample.count);
    await expect(card.locator(".featured-copy > p").first()).toHaveText(sample.date);
    await expect(card.locator("h3")).toContainText(sample.caption);
    await expect(card.locator("h3")).not.toContainText("#");
    await expect(card.locator(".featured-copy > p").last()).toContainText(sample.tag);
    await expect(card.locator(".media-number")).toHaveText("01");
    await expect(card.getByRole("link", { name: "View original post" })).toHaveAttribute("href", sample.url);
    await expect(page.locator("iframe")).toHaveCount(0);
    await expect(video).not.toHaveAttribute("src");
    const initial = await media.boundingBox();
    expect(initial.width / initial.height).toBeCloseTo(4 / 3, 1);
    await page.screenshot({ path: join(tmpdir(), `social-${sample.route}-${testInfo.project.name}.png`) });

    await card.locator("[data-play-social]").click();
    await expect.poll(() => video.evaluate(element => element.currentTime), { timeout: 15000 }).toBeGreaterThan(0);
    await expect(video).toHaveAttribute("controls", "");
    await expect(media).toHaveClass(/is-playing/);
    expect((await media.boundingBox()).height).toBeGreaterThan(initial.height);
    expect(await video.evaluate(element => /** @type {HTMLVideoElement} */ (element).error)).toBeNull();
    const bounds = () => media.evaluate(element => ({
      bottom: element.getBoundingClientRect().bottom,
      workspaceBottom: element.closest(".workspace-scroll").getBoundingClientRect().bottom,
      width: element.getBoundingClientRect().width,
      cardWidth: element.closest(".featured-card").getBoundingClientRect().width
    }));
    await expect.poll(async () => {
      const result = await bounds();
      return result.bottom - result.workspaceBottom;
    }).toBeLessThanOrEqual(1);
    const playbackBounds = await bounds();
    expect(playbackBounds.bottom).toBeLessThanOrEqual(playbackBounds.workspaceBottom + 1);
    expect(playbackBounds.width).toBeCloseTo(playbackBounds.cardWidth - 2, 0);
    await page.screenshot({ path: join(tmpdir(), `social-${sample.route}-playing-${testInfo.project.name}.png`) });

    await card.locator("[data-close-social]").click();
    await expect(media).not.toHaveClass(/is-playing/);
    await expect(card.locator("[data-play-social]")).toBeFocused();
    expect(await video.evaluate(element => element.paused)).toBe(true);
    await card.locator("[data-play-social]").click();
    await expect.poll(() => video.evaluate(element => element.paused)).toBe(false);
    await card.getByRole("link", { name: "View original post" }).focus();
    await page.keyboard.press("Escape");
    await expect(media).not.toHaveClass(/is-playing/);
    await expect(card.locator("[data-play-social]")).toBeFocused();
    await card.locator("[data-play-social]").click();
    await expect.poll(() => video.evaluate(element => element.paused)).toBe(false);
    await page.locator(".monitor-dock [data-view=photography]").click();
    await expect(panel).toBeHidden();
    expect(await video.evaluate(element => element.paused)).toBe(true);
    expect(platformRequests).toEqual([]);
    expect(errors).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });
}

test("brow trial shows 01–09 in order with loaded image links and clearly labelled reel previews", async ({ page }, testInfo) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/eyebrow-tattooing");
  const panel = page.locator('[data-panel="eyebrow-tattooing"]');
  const cards = panel.locator(".featured-card");
  await expect(cards).toHaveCount(9);
  await expect(panel.locator(".media-number")).toHaveText(["01", "02", "03", "04", "05", "06", "07", "08", "09"]);
  await expect(panel.locator(".section-label")).toContainText("09 files");
  const samples = [
    { index: 1, url: "https://www.instagram.com/reel/DbrAuCTymDd/", caption: "She came in for her retouch", date: "5 August 2026", tag: "#ombrepowderbrows" },
    { index: 2, url: "https://www.instagram.com/p/Db3z4tzAZTh/", caption: "Sorry, I can’t come to the phone rn", date: "10 August 2026", tag: "#pmubrows" }
  ];
  for (const sample of samples) {
    const card = cards.nth(sample.index);
    await card.scrollIntoViewIfNeeded();
    await expect(card.locator(".media-link:visible")).toHaveAttribute("href", sample.url);
    await expect(card.locator(".media-link:visible")).toHaveAttribute("target", "_blank");
    await expect.poll(() => card.locator("img:visible").evaluate(element => element.complete && element.naturalWidth > 0)).toBe(true);
    await expect(card.locator("video")).toHaveCount(0);
    await expect(card.locator("h3")).toContainText(sample.caption);
    await expect(card.locator("h3")).not.toContainText("#");
    await expect(card.locator(".featured-copy > p").first()).toHaveText(sample.date);
    await expect(card.locator(".featured-copy > p").last()).toContainText(sample.tag);
  }
  await expect(cards.nth(1).getByRole("link", { name: "Watch reel on Instagram" })).toHaveAttribute("href", samples[0].url);
  for (const index of [1, 3]) {
    const label = cards.nth(index).locator(".media-preview-label");
    await expect(label).toHaveText("Video preview · watch on Instagram");
    const labelBounds = await label.boundingBox();
    expect(labelBounds.height).toBeLessThan(32);
    expect(labelBounds.width).toBeLessThan((await cards.nth(index).locator(".featured-media").boundingBox()).width);
    await expect(cards.nth(index).locator("video")).toHaveCount(0);
  }
  await expect(cards.nth(3).getByRole("link", { name: "Watch reel on Instagram" })).toHaveAttribute("href", "https://www.instagram.com/reel/DdCGtRYhnST/");
  const boxes = await Promise.all([0, 1, 2].map(index => cards.nth(index).boundingBox()));
  if (testInfo.project.name === "mobile") {
    expect(boxes[1].y).toBeGreaterThan(boxes[0].y + boxes[0].height);
    expect(boxes[2].y).toBeGreaterThan(boxes[1].y + boxes[1].height);
  } else {
    expect(boxes[1].y).toBeCloseTo(boxes[0].y, 1);
    expect(boxes[2].y).toBeCloseTo(boxes[0].y, 1);
    expect(boxes[1].x).toBeGreaterThan(boxes[0].x + boxes[0].width);
    expect(boxes[2].x).toBeGreaterThan(boxes[1].x + boxes[1].width);
  }
  await panel.locator(".latest-preview").scrollIntoViewIfNeeded();
  await page.screenshot({ path: join(tmpdir(), `brow-nine-posts-${testInfo.project.name}.png`) });
  await expect(page.locator("iframe")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  expect(errors).toEqual([]);
});

test("post 03 cycles all ten carousel images with buttons, keyboard, and touch swipes", async ({ page }, testInfo) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/eyebrow-tattooing");
  const card = page.locator('[data-panel="eyebrow-tattooing"] .featured-card').nth(2);
  const carousel = card.getByRole("region", { name: "Post 3 image carousel" });
  await expect(carousel).toBeVisible();
  const slides = carousel.locator("[data-carousel-slide]");
  const status = carousel.getByRole("status");
  const next = carousel.getByRole("button", { name: "Next image" });
  const previous = carousel.getByRole("button", { name: "Previous image" });
  await expect(slides).toHaveCount(10);
  await expect(status).toHaveText("1 / 10");
  await expect(slides.nth(9).locator("img")).not.toHaveAttribute("src");
  const imageSources = [];
  for (let index = 0; index < 10; index++) {
    const visible = carousel.locator("[data-carousel-slide]:visible");
    await expect(visible).toHaveCount(1);
    await expect(status).toHaveText(`${index + 1} / 10`);
    await expect(visible).toHaveAttribute("href", "https://www.instagram.com/p/Db3z4tzAZTh/");
    await expect.poll(() => visible.locator("img").evaluate(element => element.complete && element.naturalWidth > 0)).toBe(true);
    imageSources.push(await visible.locator("img").getAttribute("src"));
    await next.click();
  }
  expect(new Set(imageSources).size).toBe(10);
  await expect(status).toHaveText("1 / 10");
  await previous.click();
  await expect(status).toHaveText("10 / 10");
  await carousel.focus();
  await page.keyboard.press("ArrowRight");
  await expect(status).toHaveText("1 / 10");
  await page.keyboard.press("ArrowLeft");
  await expect(status).toHaveText("10 / 10");
  await page.keyboard.press("Home");
  await expect(status).toHaveText("1 / 10");
  await slides.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(status).toHaveText("2 / 10");
  await expect(carousel).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(status).toHaveText("3 / 10");
  await page.keyboard.press("Home");
  await expect(status).toHaveText("1 / 10");
  if (testInfo.project.name === "mobile") {
    await carousel.scrollIntoViewIfNeeded();
    const bounds = await carousel.boundingBox();
    const session = await page.context().newCDPSession(page);
    const y = bounds.y + bounds.height * 0.3;
    const swipe = async (from, to) => {
      await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: from, y }] });
      for (let step = 1; step <= 4; step++) await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: from + (to - from) * step / 4, y }] });
      await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    };
    await swipe(bounds.x + bounds.width * 0.75, bounds.x + bounds.width * 0.25);
    await expect(status).toHaveText("2 / 10");
    await swipe(bounds.x + bounds.width * 0.25, bounds.x + bounds.width * 0.75);
    await expect(status).toHaveText("1 / 10");
    expect(page.context().pages()).toHaveLength(1);
    await expect(page).toHaveURL(/\/eyebrow-tattooing$/);
    await session.detach();
  }
  await next.click();
  await expect(status).toHaveText("2 / 10");
  await card.scrollIntoViewIfNeeded();
  await page.screenshot({ path: join(tmpdir(), `brow-carousel-${testInfo.project.name}.png`) });
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test("new brow reels 05–09 play inside their cards and stop when closed", async ({ page }, testInfo) => {
  await page.goto("/eyebrow-tattooing");
  const cards = page.locator('[data-panel="eyebrow-tattooing"] .featured-card');
  const urls = ["Dc-C5iuBUN0", "DcfQbPBBwac", "DcZ2JYopJ2j", "DcSWuWRBaL3", "DcVDH0YBcdy"];
  for (const [offset, id] of urls.entries()) {
    const card = cards.nth(offset + 4);
    await expect(card.getByRole("link", { name: "View original post" })).toHaveAttribute("href", `https://www.instagram.com/reel/${id}/`);
    const video = card.locator("video");
    await expect(video).not.toHaveAttribute("src");
    await card.getByRole("button", { name: "Play video" }).click();
    await expect.poll(() => video.evaluate(element => element.currentTime), { timeout: 15000 }).toBeGreaterThan(0);
    expect(await video.evaluate(element => /** @type {HTMLVideoElement} */ (element).error)).toBeNull();
    await expect(card.locator(".featured-media")).toHaveClass(/is-playing/);
    if (offset === 0) await page.screenshot({ path: join(tmpdir(), `brow-05-playing-${testInfo.project.name}.png`) });
    await card.getByRole("button", { name: "Close video" }).click();
    expect(await video.evaluate(element => element.paused)).toBe(true);
    await expect(card.locator(".featured-media")).not.toHaveClass(/is-playing/);
  }
});
