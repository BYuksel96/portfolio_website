import assert from "node:assert/strict";
import test from "node:test";
import { normalizePostUrl, parseInstagram, parseTikTok } from "../scripts/lib/social-extractors.mjs";
import { normalizeSocialPosts, splitCaption } from "../src/lib/social-content.js";

const igUrl = "https://www.instagram.com/reel/DbyTDW2BAdX/";
const ttUrl = "https://www.tiktok.com/@geyonceynowles/video/7606435375598406943";

test("only canonical public post URLs are accepted, with tracking removed", () => {
  assert.equal(normalizePostUrl(`${igUrl}?utm_source=embed`).url, igUrl);
  assert.equal(normalizePostUrl(ttUrl).id, "7606435375598406943");
  for (const url of ["https://instagram.com/", "http://127.0.0.1/reel/abc123/", "https://instagram.com.evil.test/reel/abc123/", "https://www.tiktok.com/@user", "https://www.instagram.com:4430/reel/abc123/"]) {
    assert.throws(() => normalizePostUrl(url), /post URL/i);
  }
});

test("Instagram context JSON provides standalone video and caption, with page metadata supplying the date", () => {
  const context = JSON.stringify({ gql_data: { shortcode_media: {
    shortcode: "DbyTDW2BAdX", is_video: true, video_url: "https://scontent.cdninstagram.com/clip.mp4",
    display_url: "https://scontent.cdninstagram.com/cover.jpg", dimensions: { width: 1080, height: 1920 },
    edge_media_to_caption: { edges: [{ node: { text: "Brows & lips 🩷 #pmu #brows" } }] }
  } } });
  const embed = `<script>{"contextJSON":${JSON.stringify(context)}}</script>`;
  const page = '<meta property="og:description" content="gandinkstudio on August 7, 2026: &quot;Brows &amp; lips&quot;">';
  const result = parseInstagram(embed, page, igUrl);
  assert.equal(result.mediaUrl, "https://scontent.cdninstagram.com/clip.mp4");
  assert.equal(result.posterUrl, "https://scontent.cdninstagram.com/cover.jpg");
  assert.equal(result.caption, "Brows & lips 🩷 #pmu #brows");
  assert.equal(result.publishedAt, "2026-08-07T00:00:00.000Z");
  assert.equal(result.mediaType, "video");
  assert.equal(result.height, 1920);
});

test("Instagram photo posts use the image and reject mismatched or unavailable posts", () => {
  const html = (data) => `{"contextJSON":${JSON.stringify(JSON.stringify({ gql_data: { shortcode_media: data } }))}}`;
  const image = { shortcode: "DbyTDW2BAdX", is_video: false, display_url: "https://scontent.cdninstagram.com/image.jpg" };
  assert.equal(parseInstagram(html(image), "", igUrl).mediaType, "image");
  assert.throws(() => parseInstagram(html({ ...image, shortcode: "different" }), "", igUrl), /match/i);
  assert.throws(() => parseInstagram("Login required", "", igUrl), /unavailable/i);
});

test("Instagram image carousels expose every slide in its original order", () => {
  const nodes = [
    { is_video: false, display_url: "https://scontent.cdninstagram.com/first.jpg", dimensions: { width: 1512, height: 2016 } },
    { is_video: false, display_url: "https://scontent.cdninstagram.com/second.jpg", dimensions: { width: 1080, height: 1080 } }
  ];
  const embed = values => `{"contextJSON":${JSON.stringify(JSON.stringify({ gql_data: { shortcode_media: {
    shortcode: "DbyTDW2BAdX", edge_sidecar_to_children: { edges: values.map(node => ({ node })) }
  } } }))}}`;
  const parsed = parseInstagram(embed(nodes), "", igUrl);
  assert.deepEqual(parsed.slides?.map(slide => slide.mediaUrl), [
    "https://scontent.cdninstagram.com/first.jpg", "https://scontent.cdninstagram.com/second.jpg"
  ]);
  assert.equal(parsed.mediaUrl, "https://scontent.cdninstagram.com/first.jpg");
  assert.equal(parsed.slides[1].width, 1080);
  assert.throws(() => parseInstagram(embed([nodes[0], { is_video: false }]), "", igUrl), /unavailable/i);
  assert.throws(() => parseInstagram(embed(Array(21).fill(nodes[0])), "", igUrl), /carousel/i);
});

test("carousel normalization preserves local slides and rejects unsafe or incomplete slide caches", () => {
  const cached = {
    mediaType: "image", mediaUrl: "/assets/social/first.jpg", caption: "Carousel #brows",
    slides: [
      { mediaType: "image", mediaUrl: "/assets/social/first.jpg", width: 1512, height: 2016 },
      { mediaType: "image", mediaUrl: "/assets/social/second.jpg", width: 1080, height: 1080 }
    ]
  };
  const result = normalizeSocialPosts({ posts: [{ url: igUrl, cached }] });
  assert.equal(result[0].type, "Carousel");
  assert.deepEqual(result[0].slides?.map(slide => slide.mediaUrl), ["/assets/social/first.jpg", "/assets/social/second.jpg"]);
  for (const badSlide of [{ mediaType: "image", mediaUrl: "https://evil.test/image.jpg" }, { mediaType: "image" }]) {
    assert.throws(() => normalizeSocialPosts({ posts: [{ url: igUrl, cached: { ...cached, slides: [cached.slides[0], badSlide] } }] }), /local|slide/i);
  }
});

test("copyright-blocked Instagram videos expose only their available preview image", () => {
  const context = JSON.stringify({ context: { copyright_blocked: true }, gql_data: { shortcode_media: {
    shortcode: "DbyTDW2BAdX", is_video: true, display_url: "https://scontent.cdninstagram.com/preview.jpg",
    edge_media_to_caption: { edges: [{ node: { text: "Brow retouch #brows" } }] }
  } } });
  const result = parseInstagram(`{"contextJSON":${JSON.stringify(context)}}`, "", igUrl);
  assert.equal(result.mediaType, "image");
  assert.equal(result.mediaUrl, "https://scontent.cdninstagram.com/preview.jpg");
  assert.equal(result.previewOnly, true);
  assert.equal(result.caption, "Brow retouch #brows");
  const unavailable = JSON.stringify({ context: { copyright_blocked: true }, gql_data: { shortcode_media: {
    shortcode: "DbyTDW2BAdX", is_video: true, video_url: "https://scontent.cdninstagram.com/blocked.mp4"
  } } });
  assert.throws(() => parseInstagram(`{"contextJSON":${JSON.stringify(unavailable)}}`, "", igUrl), /unavailable/i);
});

test("Instagram keeps an available metadata caption when caption edges are missing", () => {
  const context = JSON.stringify({ gql_data: { shortcode_media: {
    shortcode: "DbyTDW2BAdX", is_video: false, display_url: "https://scontent.cdninstagram.com/image.jpg"
  } } });
  const page = '<meta property="og:description" content="gandinkstudio on August 7, 2026: &quot;Brows &amp; lips #pmu&quot;. ">';
  assert.equal(parseInstagram(`{"contextJSON":${JSON.stringify(context)}}`, page, igUrl).caption, "Brows & lips #pmu");
});

test("TikTok hydration JSON supplies the requested video, caption and exact timestamp", () => {
  const payload = { __DEFAULT_SCOPE__: { "webapp.video-detail": { itemInfo: { itemStruct: {
    id: "7606435375598406943", desc: "The rare front view #danceclass #vegas @leicamrv",
    createTime: "1771011275", video: { playAddr: "https://v16.tiktokcdn.com/clip.mp4", cover: "https://p16.tiktokcdn.com/cover.jpg", width: 1080, height: 1920 }
  } } } } };
  const html = `<script type="application/json" id="__UNIVERSAL_DATA_FOR_REHYDRATION__">${JSON.stringify(payload)}</script>`;
  const result = parseTikTok(html, ttUrl);
  assert.equal(result.mediaUrl, "https://v16.tiktokcdn.com/clip.mp4");
  assert.equal(result.caption, "The rare front view #danceclass #vegas @leicamrv");
  assert.equal(result.publishedAt, "2026-02-13T19:34:35.000Z");
  assert.throws(() => parseTikTok(html, "https://www.tiktok.com/@user/video/7606435375598406944"), /match/i);
});

test("hashtag extraction supports Unicode, removes duplicates, and preserves mentions and line breaks", () => {
  assert.deepEqual(splitCaption("The rare front view #danceclass #vegas\n@leicamrv #danceclass #ダンス"), {
    caption: "The rare front view\n@leicamrv", hashtags: ["#danceclass", "#vegas", "#ダンス"]
  });
});

test("cached posts sort newest first without repetition and contain only local media", () => {
  const cached = { mediaType: "video", mediaUrl: "/assets/social/tiktok-clip.mp4", posterUrl: "/assets/social/tiktok-cover.jpg", caption: "Dance #dance", publishedAt: "2026-02-13T19:34:35.000Z" };
  const posts = normalizeSocialPosts({ posts: [
    { url: ttUrl, cached },
    { url: igUrl, cached: { ...cached, caption: "Brows #pmu", publishedAt: "2026-08-07T00:00:00.000Z" } }
  ] });
  assert.equal(posts.length, 2);
  assert.equal(posts[0].permalink, igUrl);
  assert.equal(posts[0].title, "Brows");
  assert.equal(posts[0].description, "#pmu");
  assert.equal(posts[0].date, "7 August 2026");
  assert.equal(normalizeSocialPosts({ posts: [{ url: ttUrl }] }).length, 0);
  assert.throws(() => normalizeSocialPosts({ posts: [{ url: ttUrl, cached: { ...cached, mediaUrl: "https://evil.test/video.mp4" } }] }), /local/i);
  assert.throws(() => normalizeSocialPosts({ posts: Array(10).fill({ url: ttUrl }) }), /nine/i);
});

test("different URL forms for the same post identity cannot create duplicate cards", () => {
  assert.throws(() => normalizeSocialPosts({ posts: [
    { url: igUrl }, { url: "https://www.instagram.com/p/DbyTDW2BAdX/" }
  ] }), /duplicate/i);
  assert.throws(() => normalizeSocialPosts({ posts: [
    { url: ttUrl }, { url: "https://www.tiktok.com/@differentname/video/7606435375598406943" }
  ] }), /duplicate/i);
});

test("listed trial order preserves positions without changing real publication dates", () => {
  const cached = { mediaType: "image", mediaUrl: "/assets/social/preview.jpg", caption: "Brows #pmu", publishedAt: "2026-08-07T00:00:00.000Z" };
  const posts = normalizeSocialPosts({ order: "listed", posts: [
    { url: igUrl, cached },
    { url: "https://www.instagram.com/reel/DbrAuCTymDd/", cached: { ...cached, previewOnly: true, publishedAt: "2026-08-05T00:00:00.000Z" } },
    { url: "https://www.instagram.com/p/Db3z4tzAZTh/", cached: { ...cached, publishedAt: "2026-08-10T00:00:00.000Z" } }
  ] });
  assert.deepEqual(posts.map(post => post.id), ["instagram-DbyTDW2BAdX", "instagram-DbrAuCTymDd", "instagram-Db3z4tzAZTh"]);
  assert.equal(posts[1].type, "Video preview");
  assert.equal(posts[2].date, "10 August 2026");
});
