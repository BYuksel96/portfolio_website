export function normalizePostUrl(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error("Invalid public post URL"); }
  if (url.protocol !== "https:" || url.port || url.username || url.password) throw new Error("Invalid public post URL");
  const host = url.hostname.toLowerCase();
  const instagram = /^(?:www\.)?instagram\.com$/.test(host) && url.pathname.match(/^\/(p|reel|tv)\/([\w-]{5,40})\/?$/);
  if (instagram) return { platform: "instagram", id: instagram[2], url: `https://www.instagram.com/${instagram[1]}/${instagram[2]}/` };
  const tiktok = /^(?:www\.)?tiktok\.com$/.test(host) && url.pathname.match(/^\/@([\w.]{1,40})\/video\/(\d{15,25})\/?$/);
  if (tiktok) return { platform: "tiktok", id: tiktok[2], url: `https://www.tiktok.com/@${tiktok[1]}/video/${tiktok[2]}` };
  throw new Error("Expected an Instagram or TikTok public post URL");
}

export function validatePostList(data) {
  if (!Array.isArray(data.posts) || data.posts.length > 9) throw new Error("Each page must contain at most nine posts");
  const seen = new Set();
  for (const post of data.posts) {
    const source = normalizePostUrl(post.url);
    const identity = `${source.platform}/${source.id}`;
    if (seen.has(identity)) throw new Error("Duplicate post identity");
    seen.add(identity);
  }
  return data;
}
