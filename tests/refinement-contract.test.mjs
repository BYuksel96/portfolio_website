import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const component = await readFile(new URL("../src/components/PortfolioMonitor.astro", import.meta.url), "utf8");
const catalog = await readFile(new URL("../src/lib/portfolio-catalog.js", import.meta.url), "utf8");

test("dock folder controls reuse the layered Home folder artwork", () => {
  assert.match(component, /class="folder-stack dock-folder-stack"/);
  assert.match(component, /dock-folder-stack[\s\S]*?folder-back[\s\S]*?folder-front/);
  assert.doesNotMatch(component, /class="dock-icon mini-folder"/);
});

test("every folder renders one nine-card Latest Preview grid", () => {
  assert.match(component, />Latest Preview</);
  assert.match(component, /folder\.latestMedia\.map\(\(media, index\) => <article class="featured-card"/);
  assert.doesNotMatch(component, />Selected Work</);
  assert.doesNotMatch(component, />Latest contact sheet</);
  for (const field of ["title", "type", "date", "description"]) {
    assert.match(catalog, new RegExp(`${field}: post\\.${field}`));
  }
});

test("Home transitions leave enough time for control travel and letter crumble", () => {
  assert.match(component, /const controlMotionDuration = 1400/);
  assert.match(component, /const homeTransitionDuration = 1500/);
  assert.match(component, /duration: controlMotionDuration/);
  assert.match(component, /leaving \|\| returning \? homeTransitionDuration : 150/);
  assert.match(component, /\.is-leaving-home \.crumble-char\{animation:crumble \.8s/);
  assert.match(component, /offset: \.82/);
  assert.match(component, /offset: \.18/);
});

test("workspace headings have breathing room and workspace status bar is solid", () => {
  assert.match(component, /\.view-header p:last-child\{[^}]*margin:26px 0 0/);
  assert.match(component, /\.is-workspace \.monitor-bar[^\{]*\{[^}]*background:#e7ecea/);
});
