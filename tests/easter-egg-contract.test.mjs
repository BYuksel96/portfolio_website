import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../src/components/EasterEgg.astro", import.meta.url),
  "utf8",
);

test("component exposes every accessible state and universal controls", () => {
  for (const token of [
    "Enter The Passcode",
    "Enter Code Here",
    "Head Game Strong",
    "How good is your head game?",
    "Play Now!",
    "Play Again",
    "data-game-canvas",
    "aria-live",
    "data-restore-portfolio",
    "data-mute",
  ]) {
    assert.match(source, new RegExp(token));
  }
});

test("assets are centralized and head frames share one render box", () => {
  assert.match(source, /const ASSETS = Object\.freeze/);
  for (const file of [
    "purple-sprite.webp",
    "gold-sprite.webp",
    "head-open.webp",
    "head-closed.webp",
  ]) {
    assert.match(source, new RegExp(file));
  }
});

test("one cleanup path cancels animation, timers, input, speech, and audio", () => {
  assert.match(source, /function cleanupSession/);
  for (const token of [
    "cancelAnimationFrame",
    "clearTimeout",
    "heldKeys.clear",
    "speechSynthesis.cancel",
    "oscillator",
    "audioContext.close",
    "sessionToken",
  ]) {
    assert.match(source, new RegExp(token.replace(".", "\\.")));
  }
});

test("every portfolio route mounts exactly one Easter egg beside the monitor", async () => {
  for (const path of ["../src/pages/index.astro", "../src/pages/[view].astro"]) {
    const route = await readFile(new URL(path, import.meta.url), "utf8");
    assert.match(route, /import EasterEgg from/);
    assert.match(route, /<PortfolioMonitor[\s\S]*?<EasterEgg handle=\{portfolioContacts\.handle\}/);
    assert.equal((route.match(/<EasterEgg /g) || []).length, 1);
  }
});
