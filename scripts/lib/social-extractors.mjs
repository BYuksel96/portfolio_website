import { normalizePostUrl } from "../../src/lib/social-source.js";
export { normalizePostUrl };

function decodeEntities(value) {
  const named = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " };
  return String(value ?? "").replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (entity, code) => {
    if (!code.startsWith("#")) return named[code.toLowerCase()] ?? entity;
    const point = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
    return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : entity;
  });
}

function meta(html, property) {
  for (const tag of html.matchAll(/<meta\b[^>]*>/gi)) {
    const name = tag[0].match(/\bproperty\s*=\s*["']([^"']+)["']/i)?.[1];
    if (name === property) return decodeEntities(tag[0].match(/\bcontent\s*=\s*"([^"]*)"/i)?.[1] ?? tag[0].match(/\bcontent\s*=\s*'([^']*)'/i)?.[1]);
  }
  return "";
}

function isoTimestamp(seconds) {
  const number = Number(seconds);
  return Number.isFinite(number) && number > 0 && number < 1e11 ? new Date(number * 1000).toISOString() : null;
}

function dimensions(media) {
  const width = Number(media.width ?? media.dimensions?.width);
  const height = Number(media.height ?? media.dimensions?.height);
  return { width: width > 0 && width <= 10000 ? width : null, height: height > 0 && height <= 10000 ? height : null };
}

export function parseInstagram(embedHtml, pageHtml, postUrl) {
  const source = normalizePostUrl(postUrl);
  const match = embedHtml.match(/"contextJSON"\s*:\s*("(?:\\.|[^"\\])*")/);
  if (!match) throw new Error("Instagram media unavailable in the public embed response");
  const context = JSON.parse(JSON.parse(match[1]));
  const post = context.gql_data?.shortcode_media;
  if (!post || post.shortcode !== source.id) throw new Error("Instagram response does not match the requested post");
  const children = post.edge_sidecar_to_children?.edges;
  if (children && (!Array.isArray(children) || !children.length || children.length > 20)) throw new Error("Unsupported Instagram carousel size");
  const slides = children?.map(({ node }) => {
    if (!node?.display_url || node.is_video) throw new Error("Instagram image carousel media unavailable");
    return { mediaType: "image", mediaUrl: node.display_url, posterUrl: node.display_url, ...dimensions(node) };
  });
  const media = children?.[0]?.node ?? post;
  // Respect restricted playback: use only the publicly supplied preview image.
  const previewOnly = Boolean(context.context?.copyright_blocked && media.is_video);
  const mediaType = media.is_video && !context.context?.copyright_blocked ? "video" : "image";
  const mediaUrl = mediaType === "video" ? media.video_url : media.display_url;
  if (!mediaUrl) throw new Error("Instagram media unavailable");
  const description = meta(pageHtml, "og:description");
  const date = description.match(/\bon ([A-Z][a-z]+ \d{1,2}, \d{4}):/);
  const parsedDate = date ? Date.parse(`${date[1]} 00:00:00 GMT`) : NaN;
  const metadataCaption = description.match(/:\s*["“]([\s\S]*?)["”][.]?\s*$/)?.[1] ?? "";
  return {
    ...source, mediaType, mediaUrl, posterUrl: media.display_url || meta(pageHtml, "og:image"),
    ...(previewOnly ? { previewOnly: true } : {}),
    ...(slides?.length > 1 ? { slides } : {}),
    caption: post.edge_media_to_caption?.edges?.[0]?.node?.text ?? metadataCaption,
    publishedAt: isoTimestamp(post.taken_at_timestamp) ?? (Number.isFinite(parsedDate) ? new Date(parsedDate).toISOString() : null),
    ...dimensions(media)
  };
}

function mediaAddress(value) {
  return typeof value === "string" ? value : value?.urlList?.[0] ?? value?.UrlList?.[0];
}

export function parseTikTok(html, postUrl) {
  const source = normalizePostUrl(postUrl);
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  const script = scripts.find(([, attributes]) => /\bid\s*=\s*["']__UNIVERSAL_DATA_FOR_REHYDRATION__["']/.test(attributes));
  if (!script) throw new Error("TikTok media unavailable in the public response");
  const data = JSON.parse(script[2]);
  const post = data.__DEFAULT_SCOPE__?.["webapp.video-detail"]?.itemInfo?.itemStruct;
  if (!post || post.id !== source.id) throw new Error("TikTok response does not match the requested post");
  const firstImage = post.imagePost?.images?.[0];
  const mediaType = firstImage ? "image" : "video";
  const mediaUrl = firstImage ? mediaAddress(firstImage.imageURL) : mediaAddress(post.video?.playAddr);
  if (!mediaUrl) throw new Error("TikTok media unavailable");
  return {
    ...source, mediaType, mediaUrl, posterUrl: firstImage ? mediaUrl : mediaAddress(post.video?.cover || post.video?.originCover),
    caption: post.desc ?? "", publishedAt: isoTimestamp(post.createTime), ...dimensions(firstImage ?? post.video ?? {})
  };
}
