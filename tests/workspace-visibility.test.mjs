import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("workspace state visually removes the Home scene instead of leaving a ghost layer", async () => {
  const source = await readFile(new URL("../src/components/PortfolioMonitor.astro", import.meta.url), "utf8");
  assert.match(source, /\.is-workspace\s+\.home-scene[\s\S]*?(?:visibility:\s*hidden|opacity:\s*0)/);
});

test("inactive monitor layer is removed from keyboard navigation", async () => {
  const source = await readFile(new URL("../src/components/PortfolioMonitor.astro", import.meta.url), "utf8");
  assert.match(source, /homeScene\?\.toggleAttribute\("inert",\s*!home\)/);
  assert.match(source, /workspace\?\.toggleAttribute\("inert",\s*home\)/);
});
