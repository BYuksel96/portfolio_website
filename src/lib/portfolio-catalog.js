import { folders, profile, socialNotes } from "../data/site.js";

export const HOME_VIEW = "home";
export const SEARCH_VIEW = "search";
export const CONTACTS_VIEW = "contacts";

export const FOLDER_ORDER = ["eyebrow-tattooing", "videography", "photography", "dance"];

const sourceIdToSlug = {
  brows: "eyebrow-tattooing",
  videography: "videography",
  photography: "photography",
  dance: "dance"
};

function normalizeSearchTerm(value) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, " ");
}

function makeLatestMedia(posts) {
  return Array.from({ length: 9 }, (_, index) => {
    const post = posts[index % posts.length];

    return {
      title: post.title,
      type: post.type,
      date: post.date,
      description: post.description,
      id: `${post.title.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${index + 1}`,
      alt: `${post.title} — latest work ${index + 1}`,
      mediaUrl: post.mediaUrl,
      palette: post.palette
    };
  });
}

function toFolderCatalogEntry(folder) {
  const slug = sourceIdToSlug[folder.id];
  const posts = folder.posts.map((post) => ({ ...post, tags: [...post.tags], palette: [...post.palette] }));

  return {
    slug,
    sourceId: folder.id,
    title: folder.label,
    color: folder.color,
    accent: folder.accent,
    description: folder.summary,
    cta: folder.cta,
    social: {
      label: folder.socialLabel,
      url: folder.socialUrl
    },
    tags: [...folder.tags],
    posts,
    latestMedia: makeLatestMedia(posts)
  };
}

const foldersBySlug = new Map(
  folders.map(toFolderCatalogEntry).map((folder) => [folder.slug, folder])
);

export const portfolioFolders = FOLDER_ORDER.map((slug) => foldersBySlug.get(slug));

export const portfolioContacts = {
  name: profile.name,
  handle: profile.handle,
  headline: profile.headline,
  intro: profile.intro,
  email: profile.email,
  bookingUrl: profile.booking,
  socials: [
    { label: "Instagram", url: profile.instagram },
    { label: "TikTok", url: profile.tiktok }
  ],
  notes: [...socialNotes]
};

export function getFolderBySlug(slug) {
  return foldersBySlug.get(slug) ?? null;
}

function getSearchText(folder, post) {
  return [
    folder.title,
    folder.description,
    folder.tags.join(" "),
    post?.title,
    post?.type,
    post?.description,
    post?.tags.join(" ")
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();
}

export function searchPortfolio(query) {
  const normalizedQuery = normalizeSearchTerm(query);

  return portfolioFolders.flatMap((folder) => {
    const folderMatches = !normalizedQuery || getSearchText(folder).includes(normalizedQuery);
    const posts = folder.posts.filter((post) => !normalizedQuery || getSearchText(folder, post).includes(normalizedQuery));

    if (!folderMatches && posts.length === 0) {
      return [];
    }

    return [{ folder, posts }];
  });
}

function cleanPathname(pathname) {
  const value = String(pathname ?? "/").trim();
  const path = value.startsWith("/") ? value : `/${value}`;
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

export function parsePortfolioRoute(pathname, search = "") {
  const path = cleanPathname(pathname);

  if (path === "/") {
    return { view: HOME_VIEW };
  }

  if (path === "/contacts") {
    return { view: CONTACTS_VIEW };
  }

  if (path === "/search") {
    return { view: SEARCH_VIEW, query: normalizeSearchTerm(new URLSearchParams(search).get("q")) };
  }

  const slug = path.slice(1);
  return getFolderBySlug(slug) ? { view: "folder", slug } : { view: HOME_VIEW };
}

export function toPortfolioPath(route) {
  if (route?.view === CONTACTS_VIEW) {
    return "/contacts";
  }

  if (route?.view === SEARCH_VIEW) {
    const query = normalizeSearchTerm(route.query);
    return query ? `/search?${new URLSearchParams({ q: query })}` : "/search";
  }

  if (route?.view === "folder" && getFolderBySlug(route.slug)) {
    return `/${route.slug}`;
  }

  return "/";
}
