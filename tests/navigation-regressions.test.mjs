import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/components/PortfolioMonitor.astro", import.meta.url), "utf8");

test("popstate cancels any pending transition before rendering browser history", () => {
  assert.match(source, /popstate[\s\S]*?clearTimeout\(timer\)[\s\S]*?render\(routeView\(\),\s*true\)/);
});

test("rendering Search synchronizes filters from the current URL", () => {
  assert.match(source, /function render[\s\S]*?if\s*\(view\s*===\s*"search"\)\s*syncQuery\(\)/);
});

test("the reverse Home transition makes the Home scene visible during restoration", () => {
  assert.match(source, /\.is-returning-home\s+\.home-scene[\s\S]*?visibility:\s*visible/);
});

test("rendering or interrupting navigation cancels retained control animations", () => {
  assert.match(source, /let controlAnimations\s*=\s*\[\]/);
  assert.match(source, /function clearControlAnimations\(\)[\s\S]*?animation\.cancel\(\)/);
  assert.match(source, /function render\(view[\s\S]*?clearControlAnimations\(\)/);
});

test("search travel preserves its centered Home transform", () => {
  assert.match(source, /translateX\(-50%\) translate\(\$\{dx\}px, \$\{dy\}px\) scale\(\.18\)/);
});

test("Home search relies on URL-synchronized render without a stale delayed query", () => {
  assert.doesNotMatch(source, /navigate\("search", \{ query \}\);\s*setTimeout\(\(\) => setQuery\(query\)/);
});

test("returning Home animates above the outgoing workspace", () => {
  assert.match(source, /\.is-returning-home\s+\.home-scene\{[^}]*z-index:\s*9/);
});
