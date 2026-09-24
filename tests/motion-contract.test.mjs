import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/components/PortfolioMonitor.astro", import.meta.url), "utf8");

test("folder and search transitions measure source and dock targets in both directions", () => {
  assert.match(source, /getBoundingClientRect\(\)/);
  assert.match(source, /function animateDesktopControls\(toDock\)/);
  assert.match(source, /element\.animate/);
  assert.match(source, /animateDesktopControls\(leaving\s*\?\s*true\s*:\s*false\)/);
  assert.doesNotMatch(source, /\.is-leaving-home \.scattered-folder\s*\{/);
  assert.doesNotMatch(source, /\.is-leaving-home \.home-search\s*\{/);
});

test("reduced motion still initializes a static landscape before animation is gated", () => {
  const initialize = source.indexOf('face(tile, ".split-flap-face-front", images[0], index)');
  const motionGate = source.indexOf('if (images.length > 1 && tiles.length && !reducedMotion.matches)');
  assert.ok(initialize >= 0 && initialize < motionGate);
});

test("creator name keeps whole words together while animating individual letters", () => {
  assert.match(source, /class="crumble-word"/);
  assert.match(source, /\.crumble-word\{[^}]*white-space:\s*nowrap/);
});

test("short mobile Home has a dedicated compact layout", () => {
  assert.match(source, /@media\(max-width:480px\) and \(max-height:650px\)/);
});

test("normal-height mobile centers and compacts AirDrop away from the folders", () => {
  assert.match(source, /@media\(max-width:720px\) and \(min-height:651px\)[\s\S]*?\.airdrop-card\{[^}]*left:\s*50%[^}]*width:\s*min\(220px,58vw\)/);
  assert.match(source, /\.scattered-folder:nth-child\(4\)\{left:12%;bottom:22%\}/);
});
