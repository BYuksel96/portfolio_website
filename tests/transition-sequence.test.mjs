import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/components/PortfolioMonitor.astro", import.meta.url), "utf8");

test("opening Home uses a staged text, AirDrop, folder, and rail timeline", () => {
  assert.match(source, /const exitFolderDelay = 1150/);
  assert.match(source, /const homeExitDuration = 2150/);
  assert.match(source, /\.is-leaving-home \.crumble-char\{animation:crumble \.65s/);
  assert.match(source, /\.is-leaving-home \.airdrop-card\{animation:airdrop-drop \.55s \.75s/);
  assert.match(source, /\.is-leaving-home \.workspace\{[^}]*animation:workspace-reveal \.5s 1\.45s/);
});

test("returning Home drops content before restoring controls, type, and AirDrop", () => {
  assert.match(source, /const returnFolderDelay = 650/);
  assert.match(source, /const homeReturnDuration = 2600/);
  assert.match(source, /\.is-returning-home \.workspace-scroll\{animation:workspace-drop \.65s/);
  assert.match(source, /\.is-returning-home \.monitor-dock\{animation:dock-dismiss \.3s 1\.45s/);
  assert.match(source, /\.is-returning-home \.crumble-char\{animation:restore \.7s[\s\S]*?1650ms/);
  assert.match(source, /\.is-returning-home \.airdrop-card\{animation:airdrop-land \.85s 1\.55s/);
});

test("measured control animations use direction-specific delays and finish before render", () => {
  assert.match(source, /const controlDelay = toDock \? exitFolderDelay : returnFolderDelay/);
  assert.match(source, /delay: controlDelay/);
  assert.match(source, /leaving \? homeExitDuration : returning \? homeReturnDuration : 150/);
});

test("gravity and landing keyframes resolve to stable resting states", () => {
  for (const name of ["airdrop-drop", "workspace-drop", "workspace-reveal", "dock-dismiss", "airdrop-land", "bar-clear"]) {
    assert.match(source, new RegExp(`@keyframes ${name}`));
  }
  assert.match(source, /@keyframes airdrop-land\{from\{[^}]*translate\(70vw,-24vh\)[^}]*rotate\(-14deg\)[\s\S]*?to\{[^}]*transform:var\(--airdrop-rest-transform,translateX\(0\)\)/);
});

test("both visual layers are inert and the monitor is busy during staged transitions", () => {
  assert.match(source, /function navigate[\s\S]*?homeScene\?\.setAttribute\("inert", ""\)/);
  assert.match(source, /function navigate[\s\S]*?workspace\?\.setAttribute\("inert", ""\)/);
  assert.match(source, /function navigate[\s\S]*?app\.setAttribute\("aria-busy", "true"\)/);
  assert.match(source, /function render[\s\S]*?app\.removeAttribute\("aria-busy"\)/);
});

test("AirDrop keeps its responsive resting transform throughout every keyframe", () => {
  assert.match(source, /@keyframes airdrop-drop\{from\{[^}]*var\(--airdrop-rest-transform[^}]*\}18%\{[^}]*var\(--airdrop-rest-transform[^}]*\}[\s\S]*?to\{[^}]*var\(--airdrop-rest-transform/);
  assert.match(source, /@keyframes airdrop-land\{from\{[^}]*var\(--airdrop-rest-transform[^}]*translate\(70vw,-24vh\)[^}]*\}72%\{[^}]*var\(--airdrop-rest-transform[^}]*translate\(-12px,4px\)[^}]*\}to\{[^}]*var\(--airdrop-rest-transform/);
  assert.match(source, /\.airdrop-card\{--airdrop-rest-transform:translateX\(0\)\}/);
});
