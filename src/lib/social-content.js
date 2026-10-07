import { normalizePostUrl, validatePostList } from "./social-source.js";

export function splitCaption(value) {
  const text = String(value ?? "");
  const pattern = /(?<![\p{L}\p{N}_])#[\p{L}\p{N}\p{M}_]+/gu;
  const hashtags = [...new Set(text.match(pattern) ?? [])];
  const caption = text.replace(pattern, "").split(/\r?\n/).map(line => line.replace(/[\t ]+/g, " ").trim()).join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return { caption, hashtags };
}

function localMedia(value) {
  if (value && !/^\/assets\/social\/[\w.-]+\.(mp4|jpg|png|webp)$/.test(value)) throw new Error("Social media must use a saved local asset");
  return value;
}

export function normalizeSocialPosts(data) {
  validatePostList(data);
  const posts = data.posts.filter(post => post.cached?.mediaUrl).map(post => {
    const source = normalizePostUrl(post.url);
    const cache = post.cached;
    if (cache.slides && (!Array.isArray(cache.slides) || !cache.slides.length || cache.slides.length > 20)) throw new Error("Unsupported carousel slides");
    const slides = cache.slides?.map(slide => {
      if (slide?.mediaType !== "image" || !slide.mediaUrl) throw new Error("Carousel slide must have a saved local image");
      return { mediaType: "image", mediaUrl: localMedia(slide.mediaUrl), width: slide.width, height: slide.height };
    });
    const { caption, hashtags } = splitCaption(post.overrides?.caption ?? cache.caption);
    const dateValue = post.overrides?.publishedAt ?? cache.publishedAt;
    const publishedAt = dateValue && Number.isFinite(Date.parse(dateValue)) ? new Date(dateValue).toISOString() : null;
    return {
      id: `${source.platform}-${source.id}`, permalink: source.url, platform: source.platform,
      title: caption || "Untitled post", type: slides?.length > 1 ? "Carousel" : cache.previewOnly ? "Video preview" : cache.mediaType === "video" ? "Video" : "Photo", mediaType: cache.mediaType,
      ...(slides ? { slides } : {}),
      previewOnly: Boolean(cache.previewOnly),
      description: hashtags.join(" "), tags: hashtags.map(tag => tag.slice(1)), publishedAt,
      date: publishedAt ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(publishedAt)) : "Date unavailable",
      mediaUrl: localMedia(cache.mediaUrl), posterUrl: localMedia(cache.posterUrl),
      width: cache.width, height: cache.height, alt: post.overrides?.alt || caption || `${source.platform} post`
    };
  });
  return data.order === "listed" ? posts : posts.sort((a, b) => (b.publishedAt ? Date.parse(b.publishedAt) : 0) - (a.publishedAt ? Date.parse(a.publishedAt) : 0));
}
