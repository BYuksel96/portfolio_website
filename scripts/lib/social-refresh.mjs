import { readFile, writeFile, mkdir, rename, unlink } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { join } from "node:path";
import sharp from "sharp";
import { normalizePostUrl, parseInstagram, parseTikTok } from "./social-extractors.mjs";
import { validatePostList } from "../../src/lib/social-source.js";

export const PAGES = ["eyebrow-tattooing", "videography", "photography", "dance"];
const HTML_LIMIT = 5 * 1024 * 1024;
const IMAGE_LIMIT = 10 * 1024 * 1024;
const VIDEO_LIMIT = 120 * 1024 * 1024;

function allowedAddress(value, platform, media) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.port || url.username || url.password) throw new Error("Unsupported source address");
  const host = url.hostname.toLowerCase();
  const domains = platform === "instagram"
    ? (media ? ["cdninstagram.com", "fbcdn.net"] : ["instagram.com"])
    : (media ? ["tiktok.com", "tiktokcdn.com", "tiktokcdn-eu.com", "tiktokcdn-us.com"] : ["tiktok.com"]);
  if (!domains.some(domain => host === domain || host.endsWith(`.${domain}`))) throw new Error("Unsupported source host");
  return url.href;
}

function receiveCookies(response, address, session) {
  const host = new URL(address).hostname;
  for (const header of response.headers.getSetCookie?.() ?? []) {
    const [pair, ...attributes] = header.split(";");
    const equals = pair.indexOf("=");
    if (equals < 1) continue;
    const name = pair.slice(0, equals).trim();
    const value = pair.slice(equals + 1).trim();
    const domainValue = attributes.find(attribute => /^\s*domain=/i.test(attribute))?.split("=").slice(1).join("=").trim().replace(/^\./, "").toLowerCase();
    const domain = domainValue || host;
    if (host !== domain && !host.endsWith(`.${domain}`)) continue;
    const path = attributes.find(attribute => /^\s*path=/i.test(attribute))?.split("=").slice(1).join("=").trim() || "/";
    const expired = attributes.some(attribute => /^\s*max-age=0\s*$/i.test(attribute));
    const index = session.findIndex(cookie => cookie.name === name && cookie.domain === domain && cookie.path === path);
    if (index >= 0) session.splice(index, 1);
    if (!expired && value) session.push({ name, value, domain, path, hostOnly: !domainValue });
  }
}

function sessionHeader(session, address) {
  const url = new URL(address);
  return session.filter(cookie =>
    (url.hostname === cookie.domain || (!cookie.hostOnly && url.hostname.endsWith(`.${cookie.domain}`))) &&
    (url.pathname === cookie.path || url.pathname.startsWith(cookie.path.endsWith("/") ? cookie.path : `${cookie.path}/`))
  ).map(cookie => `${cookie.name}=${cookie.value}`).join("; ");
}

async function fetchBytes(address, { source, media = false, limit, fetchImpl, session }) {
  const signal = AbortSignal.timeout(media ? 120000 : 30000);
  let url = address;
  for (let attempt = 0; attempt < 6; attempt++) {
    url = allowedAddress(url, source.platform, media);
    const cookie = sessionHeader(session, url);
    const response = await fetchImpl(url, {
      redirect: "manual", signal,
      headers: { ...(media ? { referer: source.url } : {}), ...(cookie ? { cookie } : {}) }
    });
    receiveCookies(response, url, session);
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location) throw new Error("Redirect without a destination");
      url = new URL(location, url).href;
      continue;
    }
    if (!response.ok) { await response.body?.cancel(); throw new Error(`Source returned HTTP ${response.status}`); }
    if (Number(response.headers.get("content-length")) > limit) { await response.body?.cancel(); throw new Error("Source exceeds the download size limit"); }
    const type = (response.headers.get("content-type") ?? "").split(";")[0];
    if (media && type.includes("html")) { await response.body?.cancel(); throw new Error("Source returned a challenge instead of media"); }
    const reader = response.body?.getReader();
    if (!reader) throw new Error("Empty source response");
    const chunks = [];
    let size = 0;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > limit) { await reader.cancel(); throw new Error("Source exceeds the download size limit"); }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
    return Buffer.concat(chunks, size);
  }
  throw new Error("Too many redirects");
}

function extension(bytes, mediaType) {
  if (mediaType === "video" && bytes.subarray(4, 8).toString() === "ftyp") return "mp4";
  if (mediaType === "image") {
    if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "jpg";
    if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "png";
    if (bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP") return "webp";
  }
  throw new Error("Source is not a supported media file");
}

async function saveMedia(address, mediaType, source, rootDir, fetchImpl, session) {
  const bytes = await fetchBytes(address, { source, media: true, limit: mediaType === "video" ? VIDEO_LIMIT : IMAGE_LIMIT, fetchImpl, session });
  const ext = extension(bytes, mediaType);
  // Fully decode images before allowing a new post cache to replace the old one.
  // Signature checks alone accept truncated files; bound decoded pixels as well.
  if (mediaType === "image") await sharp(bytes, { failOn: "warning", limitInputPixels: 40_000_000 }).stats();
  const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
  const name = `${source.platform}-${source.id}-${hash}.${ext}`;
  const directory = join(rootDir, "public/assets/social");
  await mkdir(directory, { recursive: true });
  const destination = join(directory, name);
  try {
    if ((await readFile(destination)).equals(bytes)) return `/assets/social/${name}`;
  } catch (error) { if (error.code !== "ENOENT") throw error; }
  const temporary = `${destination}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, bytes, { flag: "wx" });
    await rename(temporary, destination);
  } catch (error) {
    await unlink(temporary).catch(() => {});
    throw error;
  }
  return `/assets/social/${name}`;
}

export async function refreshPage({ rootDir, page, fetchImpl = fetch }) {
  if (!PAGES.includes(page)) throw new Error("Unknown portfolio page");
  const filename = join(rootDir, `src/data/social/${page}.json`);
  const data = validatePostList(JSON.parse(await readFile(filename, "utf8")));
  const result = { updated: 0, failed: 0, errors: [] };
  for (const post of data.posts) {
    const source = normalizePostUrl(post.url);
    const session = [];
    try {
      const html = (await fetchBytes(source.url, { source, limit: HTML_LIMIT, fetchImpl, session })).toString("utf8");
      let parsed;
      if (source.platform === "instagram") {
        const embed = (await fetchBytes(`${source.url}embed/`, { source, limit: HTML_LIMIT, fetchImpl, session })).toString("utf8");
        parsed = parseInstagram(embed, html, source.url);
      } else parsed = parseTikTok(html, source.url);
      const saved = [];
      for (const media of parsed.slides ?? [parsed]) {
        const mediaUrl = await saveMedia(media.mediaUrl, media.mediaType, source, rootDir, fetchImpl, session);
        const posterUrl = media.mediaType === "image" ? mediaUrl : await saveMedia(media.posterUrl, "image", source, rootDir, fetchImpl, session);
        saved.push({ mediaType: media.mediaType, width: media.width, height: media.height, mediaUrl, posterUrl });
      }
      // Commit metadata only after every slide and poster has been saved.
      post.url = source.url;
      post.cached = {
        caption: parsed.caption, publishedAt: parsed.publishedAt ?? post.cached?.publishedAt ?? null, mediaType: parsed.mediaType,
        ...(parsed.previewOnly ? { previewOnly: true } : {}),
        ...saved[0], ...(parsed.slides ? { slides: saved } : {}), fetchedAt: new Date().toISOString()
      };
      result.updated++;
    } catch (error) {
      result.failed++;
      result.errors.push({ id: `${source.platform}/${source.id}`, message: error instanceof Error ? error.message : "Refresh failed" });
    }
  }
  if (result.updated) {
    const temporary = `${filename}.tmp`;
    await writeFile(temporary, `${JSON.stringify(data, null, 2)}\n`);
    await rename(temporary, filename);
  }
  return result;
}
