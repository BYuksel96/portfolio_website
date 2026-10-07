import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { portfolioFolders } from "../src/lib/portfolio-catalog.js";

const component = await readFile(new URL("../src/components/PortfolioMonitor.astro", import.meta.url), "utf8");

test("dock folder controls reuse the layered Home folder artwork", () => {
  assert.match(component, /class="folder-stack dock-folder-stack"/);
  assert.match(component, /dock-folder-stack[\s\S]*?folder-back[\s\S]*?folder-front/);
  assert.doesNotMatch(component, /class="dock-icon mini-folder"/);
});

test("every folder supplies up to nine Latest Preview entries with usable copy", () => {
  assert.match(component, />Latest Preview</);
  assert.doesNotMatch(component, />Selected Work</);
  assert.doesNotMatch(component, />Latest contact sheet</);
  for (const folder of portfolioFolders) {
    assert.ok(folder.latestMedia.length > 0 && folder.latestMedia.length <= 9);
    for (const media of folder.latestMedia) {
      assert.equal(typeof media.title, "string");
      assert.equal(typeof media.date, "string");
      assert.equal(typeof media.description, "string");
    }
  }
});

test("Home transitions leave enough time for control travel and letter crumble", () => {
  assert.match(component, /const controlMotionDuration = 900/);
  assert.match(component, /const homeExitDuration = 2150/);
  assert.match(component, /const homeReturnDuration = 2600/);
  assert.match(component, /duration: controlMotionDuration/);
  assert.match(component, /leaving \? homeExitDuration : returning \? homeReturnDuration : 150/);
  assert.match(component, /\.is-leaving-home \.crumble-char\{animation:crumble \.65s/);
  assert.match(component, /offset: \.82/);
  assert.match(component, /offset: \.18/);
});

test("workspace headings have breathing room and workspace status bar is solid", () => {
  assert.match(component, /\.view-header p:last-child\{[^}]*margin:26px 0 0/);
  assert.match(component, /\.is-workspace \.monitor-bar[^\{]*\{[^}]*background:#e7ecea/);
});
