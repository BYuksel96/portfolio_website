import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, mkdir, readFile, writeFile, rm, stat, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { refreshPage } from "../scripts/lib/social-refresh.mjs";

const url = "https://www.tiktok.com/@geyonceynowles/video/7606435375598406943";
const videoUrl = "https://v16.tiktokcdn.com/clip.mp4?expires=tomorrow";
const coverUrl = "https://p16.tiktokcdn.com/cover.jpg";
const video = Buffer.from([0, 0, 0, 24, 102, 116, 121, 112, 105, 115, 111, 109, 0, 0, 0, 0]);
const image = await sharp({ create: { width: 2, height: 2, channels: 3, background: "red" } }).jpeg().toBuffer();
function html(media = videoUrl) {
  return `<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">${JSON.stringify({ __DEFAULT_SCOPE__: { "webapp.video-detail": { itemInfo: { itemStruct: {
    id: "7606435375598406943", desc: "The rare front view #dance", createTime: 1771011275,
    video: { playAddr: media, cover: coverUrl, width: 1080, height: 1920 }
  } } } } })}</script>`;
}
async function setup(t, posts) {
  const rootDir = await mkdtemp(join(tmpdir(), "social-cache-test-"));
  t.after(() => rm(rootDir, { recursive: true, force: true }));
  await mkdir(join(rootDir, "src/data/social"), { recursive: true });
  const file = join(rootDir, "src/data/social/dance.json");
  const original = `${JSON.stringify({ accountUrl: "https://www.tiktok.com/@geyonceynowles", posts }, null, 2)}\n`;
  await writeFile(file, original);
  return { rootDir, file, original };
}
function publicResponses(request) {
  if (request === url) return new Response(html(), { headers: { "content-type": "text/html" } });
  if (request === videoUrl) return new Response(video, { headers: { "content-type": "video/mp4" } });
  if (request === coverUrl) return new Response(image, { headers: { "content-type": "image/jpeg" } });
  throw new Error("Unexpected request");
}

test("refresh saves local media and metadata, preserves overrides, and never persists signed CDN URLs", async t => {
  const { rootDir, file } = await setup(t, [{ url, overrides: { alt: "Dance class front view" } }]);
  const result = await refreshPage({ rootDir, page: "dance", fetchImpl: publicResponses });
  assert.equal(result.updated, 1);
  assert.equal(result.failed, 0);
  const content = await readFile(file, "utf8");
  const post = JSON.parse(content).posts[0];
  assert.equal(post.cached.caption, "The rare front view #dance");
  assert.equal(post.cached.publishedAt, "2026-02-13T19:34:35.000Z");
  assert.equal(post.overrides.alt, "Dance class front view");
  assert.match(post.cached.mediaUrl, /^\/assets\/social\/tiktok-7606435375598406943-[\da-f]+\.mp4$/);
  assert.deepEqual(await readFile(join(rootDir, "public", post.cached.mediaUrl)), video);
  assert.equal(content.includes("expires=tomorrow"), false);
});

test("a failed media download keeps the entire last successful manifest untouched", async t => {
  const { rootDir, file, original } = await setup(t, [{ url, cached: { mediaUrl: "/assets/social/previous.mp4", caption: "Saved" } }]);
  const result = await refreshPage({ rootDir, page: "dance", fetchImpl: request => request === videoUrl ? new Response("Blocked", { status: 403 }) : publicResponses(request) });
  assert.equal(result.failed, 1);
  assert.equal(result.updated, 0);
  assert.equal(await readFile(file, "utf8"), original);
});

test("a bot challenge cannot replace an existing video with an HTML file", async t => {
  const { rootDir, file, original } = await setup(t, [{ url }]);
  const result = await refreshPage({ rootDir, page: "dance", fetchImpl: request => request === videoUrl ? new Response("<html>Verify</html>", { headers: { "content-type": "text/html" } }) : publicResponses(request) });
  assert.equal(result.failed, 1);
  assert.equal(await readFile(file, "utf8"), original);
});

test("private and unrelated media addresses are rejected before they can be requested", async t => {
  const { rootDir } = await setup(t, [{ url }]);
  const requested = [];
  const result = await refreshPage({ rootDir, page: "dance", fetchImpl: request => {
    requested.push(request);
    return new Response(html("http://127.0.0.1/private"), { headers: { "content-type": "text/html" } });
  } });
  assert.equal(result.failed, 1);
  assert.deepEqual(requested, [url]);
});

test("redirects cannot escape the public CDN allowlist", async t => {
  const { rootDir } = await setup(t, [{ url }]);
  const requested = [];
  const result = await refreshPage({ rootDir, page: "dance", fetchImpl: request => {
    requested.push(request);
    return request === videoUrl ? new Response(null, { status: 302, headers: { location: "https://evil.test/file" } }) : publicResponses(request);
  } });
  assert.equal(result.failed, 1);
  assert.equal(requested.includes("https://evil.test/file"), false);
});

test("public metadata requests use default headers because browser overrides produce a different response", async t => {
  const { rootDir } = await setup(t, [{ url }]);
  const result = await refreshPage({ rootDir, page: "dance", fetchImpl: (request, options) => {
    if (options.headers?.["user-agent"] || (request === url && options.headers?.referer)) return new Response("Challenge", { status: 403 });
    return publicResponses(request);
  } });
  assert.equal(result.updated, 1);
});

test("TikTok's anonymous page session is used only on its cookie domain and never saved in content", async t => {
  const { rootDir, file } = await setup(t, [{ url }]);
  const sessionVideo = "https://v16-webapp-prime.tiktok.com/clip.mp4";
  const result = await refreshPage({ rootDir, page: "dance", fetchImpl: (request, options) => {
    if (request === url) return new Response(html(sessionVideo), { headers: {
      "content-type": "text/html", "set-cookie": "tt_chain_token=anonymous-public-session; Domain=.tiktok.com; Path=/; Secure; HttpOnly"
    } });
    if (request === sessionVideo) return options.headers.cookie === "tt_chain_token=anonymous-public-session"
      ? new Response(video, { headers: { "content-type": "video/mp4" } }) : new Response("No session", { status: 403 });
    if (request === coverUrl) {
      assert.equal(options.headers.cookie, undefined);
      return new Response(image, { headers: { "content-type": "image/jpeg" } });
    }
    throw new Error("Unexpected request");
  } });
  assert.equal(result.updated, 1);
  assert.equal((await readFile(file, "utf8")).includes("anonymous-public-session"), false);
});

test("refreshing identical media reuses the existing asset rather than risking a destructive rewrite", async t => {
  const { rootDir, file } = await setup(t, [{ url }]);
  await refreshPage({ rootDir, page: "dance", fetchImpl: publicResponses });
  const post = JSON.parse(await readFile(file, "utf8")).posts[0];
  const path = join(rootDir, "public", post.cached.mediaUrl);
  const savedTime = new Date("2001-01-01T00:00:00Z");
  await utimes(path, savedTime, savedTime);
  await refreshPage({ rootDir, page: "dance", fetchImpl: publicResponses });
  assert.equal((await stat(path)).mtime.toISOString(), "2001-01-01T00:00:00.000Z");
  assert.deepEqual(await readFile(path), video);
});

test("a refresh without a public timestamp preserves the previously observed date", async t => {
  const { rootDir, file } = await setup(t, [{ url, cached: { publishedAt: "2026-02-13T19:34:35.000Z" } }]);
  const result = await refreshPage({ rootDir, page: "dance", fetchImpl: request => request === url
    ? new Response(html().replace('"createTime":1771011275,', ""), { headers: { "content-type": "text/html" } })
    : publicResponses(request) });
  assert.equal(result.updated, 1);
  assert.equal(JSON.parse(await readFile(file, "utf8")).posts[0].cached.publishedAt, "2026-02-13T19:34:35.000Z");
});

for (const failure of [null, "http", "jpeg-signature", "png-signature", "truncated-jpeg"]) {
  test(failure ? `a later carousel slide failure (${failure}) retains the entire previous cached post` : "carousel refresh saves every slide locally without persisting CDN addresses", async t => {
    const igUrl = "https://www.instagram.com/p/Db3z4tzAZTh/";
    const { rootDir, file, original } = await setup(t, [{ url: igUrl, cached: { mediaType: "image", mediaUrl: "/assets/social/previous.jpg", caption: "Saved carousel" } }]);
    const addresses = ["https://scontent.cdninstagram.com/first.jpg?signature=temporary", "https://scontent.cdninstagram.com/second.jpg?signature=temporary"];
    const requested = [];
    const embed = `{"contextJSON":${JSON.stringify(JSON.stringify({ gql_data: { shortcode_media: {
      shortcode: "Db3z4tzAZTh", edge_media_to_caption: { edges: [{ node: { text: "Work #brows" } }] },
      edge_sidecar_to_children: { edges: addresses.map(display_url => ({ node: { is_video: false, display_url, dimensions: { width: 1080, height: 1440 } } })) }
    } } }))}}`;
    const result = await refreshPage({ rootDir, page: "dance", fetchImpl: request => {
      requested.push(request);
      if (request === igUrl) return new Response('<meta property="og:description" content="gandinkstudio on August 10, 2026: &quot;Work #brows&quot;">');
      if (request === `${igUrl}embed/`) return new Response(embed);
      const index = addresses.indexOf(request);
      if (index === 1 && failure === "http") return new Response("Unavailable", { status: 403 });
      if (index === 1 && failure === "jpeg-signature") return new Response(Buffer.from([255, 216, 255]));
      if (index === 1 && failure === "png-signature") return new Response(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      if (index === 1 && failure === "truncated-jpeg") return new Response(image.subarray(0, image.length - 12));
      if (index >= 0) return new Response(Buffer.concat([image, Buffer.from([index])]), { headers: { "content-type": "image/jpeg" } });
      throw new Error("Unexpected request");
    } });
    if (failure) {
      assert.equal(result.failed, 1);
      assert.equal(result.updated, 0);
      assert.equal(await readFile(file, "utf8"), original);
    } else {
      assert.equal(result.updated, 1);
      const content = await readFile(file, "utf8");
      const cached = JSON.parse(content).posts[0].cached;
      assert.equal(cached.slides?.length, 2);
      assert.equal(cached.mediaUrl, cached.slides[0].mediaUrl);
      for (const [index, slide] of cached.slides.entries()) {
        assert.deepEqual(await readFile(join(rootDir, "public", slide.mediaUrl)), Buffer.concat([image, Buffer.from([index])]));
      }
      assert.equal(content.includes("signature=temporary"), false);
    }
    assert.ok(requested.includes(addresses[1]));
  });
}
