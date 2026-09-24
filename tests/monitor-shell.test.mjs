import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("monitor shell exposes the required dock order and accessible navigation state", async () => {
  const component = await read("../src/components/PortfolioMonitor.astro");
  assert.match(component, /<nav class="monitor-dock"[\s\S]*?portfolioFolders\.map[\s\S]*?data-view="search"[\s\S]*?data-view="contacts"[\s\S]*?data-view="home"/);
  assert.match(component, /data-view=\{folder\.slug\}/);
  assert.match(component, /aria-current=\{initialView === folder\.slug/);

  assert.match(component, /aria-current/);
  assert.match(component, /data-monitor-heading/);
  assert.match(component, /data-airdrop-accept/);
});

test("all refresh-safe monitor routes are generated from the shared shell", async () => {
  const route = await read("../src/pages/[view].astro");
  const home = await read("../src/pages/index.astro");

  for (const slug of [
    "eyebrow-tattooing",
    "videography",
    "photography",
    "dance",
    "search",
    "contacts"
  ]) {
    assert.ok(route.includes(`\"${slug}\"`), `${slug} should have a static route`);
  }

  assert.match(route, /PortfolioMonitor/);
  assert.match(home, /PortfolioMonitor/);
});

test("monitor navigation uses History API and responds to back and forward", async () => {
  const component = await read("../src/components/PortfolioMonitor.astro");

  assert.match(component, /history\.pushState/);
  assert.match(component, /popstate/);
  assert.match(component, /URLSearchParams/);
  assert.match(component, /prefers-reduced-motion/);
});

test("the document is viewport locked while the monitor workspace owns overflow", async () => {
  const css = await read("../src/styles/global.css");

  assert.match(css, /html[\s\S]*?overflow:\s*hidden/);
  assert.match(css, /body[\s\S]*?overflow:\s*hidden/);
  assert.match(css, /\.workspace-scroll[\s\S]*?overflow-y:\s*auto/);
  assert.match(css, /\.monitor-dock/);
  assert.match(css, /@media\s*\(max-width:\s*720px\)[\s\S]*?grid-template-rows/);
});


test("monitor provides one accessible amber minimize action", async () => {
  const source = await read("../src/components/PortfolioMonitor.astro");
  assert.match(source, /data-minimize-monitor/);
  assert.match(source, /aria-label="Minimize portfolio and open game"/);
  assert.doesNotMatch(source, /<span class="window-dots"/);
});

test("restore cancels transitions, renders Home, and restores focus", async () => {
  const source = await read("../src/components/PortfolioMonitor.astro");
  assert.match(source, /portfolio:restore-request/);
  assert.match(source, /clearTimeout\(timer\)/);
  assert.match(source, /clearControlAnimations\(\)/);
  assert.match(source, /render\("home", true\)/);
});
test("contacts contains an email form and search renders grouped results", async () => {
  const component = await read("../src/components/PortfolioMonitor.astro");

  assert.match(component, /data-contact-form/);
  assert.match(component, /name=\"email\"/);
  assert.match(component, /data-search-results/);
  assert.match(component, /data-search-empty/);
});
