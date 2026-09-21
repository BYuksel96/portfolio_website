import assert from "node:assert/strict";
import test from "node:test";

import {
  CONTACTS_VIEW,
  FOLDER_ORDER,
  HOME_VIEW,
  SEARCH_VIEW,
  getFolderBySlug,
  parsePortfolioRoute,
  portfolioFolders,
  searchPortfolio,
  toPortfolioPath
} from "../src/lib/portfolio-catalog.js";

test("catalog presents the four folders in the required control-rail order", () => {
  assert.deepEqual(FOLDER_ORDER, ["eyebrow-tattooing", "videography", "photography", "dance"]);
  assert.deepEqual(
    portfolioFolders.map((folder) => folder.slug),
    ["eyebrow-tattooing", "videography", "photography", "dance"]
  );
  assert.equal(getFolderBySlug("eyebrow-tattooing").title, "Eyebrow Tattooing");
});

test("catalog retains current folder copy, social links, tags, and media", () => {
  const photography = getFolderBySlug("photography");

  assert.equal(photography.description, "Portraits, street moments, beauty details, and editorial sets.");
  assert.equal(photography.social.url, "https://instagram.com/");
  assert.deepEqual(photography.tags, ["portraits", "editorial", "street", "beauty"]);
  assert.equal(photography.posts[0].title, "Street Portrait Study");
  assert.equal(photography.posts[0].mediaUrl, "https://picsum.photos/seed/photography-street/900/1200.webp");
  assert.deepEqual(photography.posts[0].palette, ["#f3f0e8", "#202020", "#6ea6c6"]);
});

test("search finds folders from descriptive metadata and matching post details", () => {
  const consultation = searchPortfolio("consultation");
  const night = searchPortfolio("handheld texture");

  assert.deepEqual(consultation.map((result) => result.folder.slug), ["eyebrow-tattooing"]);
  assert.equal(consultation[0].posts[0].title, "Brow Mapping Preview");
  assert.deepEqual(night.map((result) => result.folder.slug), ["videography"]);
  assert.equal(night[0].posts[0].title, "Night Edit Reel");
});

test("search normalizes whitespace and returns all folders for an empty query", () => {
  assert.deepEqual(
    searchPortfolio("  STREET   DANCE ").map((result) => result.folder.slug),
    ["dance"]
  );
  assert.equal(searchPortfolio("").length, 4);
  assert.deepEqual(searchPortfolio("not-a-real-term"), []);
});

test("route helpers map canonical paths and preserve normalized search queries", () => {
  assert.deepEqual(parsePortfolioRoute("/"), { view: HOME_VIEW });
  assert.deepEqual(parsePortfolioRoute("/photography/"), { view: "folder", slug: "photography" });
  assert.deepEqual(parsePortfolioRoute("/search", "?q=beauty%20detail"), {
    view: SEARCH_VIEW,
    query: "beauty detail"
  });
  assert.deepEqual(parsePortfolioRoute("/contacts"), { view: CONTACTS_VIEW });
  assert.deepEqual(parsePortfolioRoute("/unknown"), { view: HOME_VIEW });
  assert.equal(toPortfolioPath({ view: "folder", slug: "dance" }), "/dance");
  assert.equal(toPortfolioPath({ view: SEARCH_VIEW, query: "  beauty details  " }), "/search?q=beauty+details");
  assert.equal(toPortfolioPath({ view: CONTACTS_VIEW }), "/contacts");
});
