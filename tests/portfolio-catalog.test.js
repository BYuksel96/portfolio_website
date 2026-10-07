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
  assert.equal(consultation[0].folder.title, "Eyebrow Tattooing");
  assert.deepEqual(night.map((result) => result.folder.slug), ["videography"]);
  assert.equal(night[0].posts[0].title, "Night Edit Reel");
});

test("selected social posts replace repeated placeholders and are searchable by caption and hashtag", () => {
  const dance = getFolderBySlug("dance");
  assert.equal(dance.latestMedia.length, 1);
  assert.equal(dance.posts[0].title, "The rare front view @leicamrv");
  assert.equal(dance.posts[0].date, "13 February 2026");
  assert.equal(dance.posts[0].mediaType, "video");
  assert.match(dance.posts[0].posterUrl, /^\/assets\/social\//);
  assert.equal(searchPortfolio("rare front")[0].folder.slug, "dance");
  assert.equal(searchPortfolio("danceclass")[0].posts[0].permalink, "https://www.tiktok.com/@geyonceynowles/video/7606435375598406943");
});

test("brow trial displays nine unique selected posts in the requested grid order", () => {
  const brows = getFolderBySlug("eyebrow-tattooing");
  assert.deepEqual(brows.latestMedia.map(post => post.permalink), [
    "https://www.instagram.com/reel/DbyTDW2BAdX/",
    "https://www.instagram.com/reel/DbrAuCTymDd/",
    "https://www.instagram.com/p/Db3z4tzAZTh/",
    "https://www.instagram.com/reel/DdCGtRYhnST/",
    "https://www.instagram.com/reel/Dc-C5iuBUN0/",
    "https://www.instagram.com/reel/DcfQbPBBwac/",
    "https://www.instagram.com/reel/DcZ2JYopJ2j/",
    "https://www.instagram.com/reel/DcSWuWRBaL3/",
    "https://www.instagram.com/reel/DcVDH0YBcdy/"
  ]);
  for (const post of brows.latestMedia) {
    assert.match(post.mediaUrl, /^\/assets\/social\//);
    assert.ok(post.publishedAt);
    assert.ok(post.title && !post.title.includes("#"));
  }
  assert.equal(brows.latestMedia[2].slides?.length, 10);
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
