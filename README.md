# Creative Portfolio Website

This is a fast, static Astro website for a creative person who works across photography, video editing, TikTok/social content, street dance, and eyebrow tattooing.

The design direction is an iOS-style desktop with folders. Each folder represents a creative discipline and opens into curated work, tags, social links, and contact prompts.

## Why Astro

Astro was chosen because this site should be fast, easy to host, and mostly static. It sends very little JavaScript by default, which is useful for a portfolio that may later include heavier social embeds from TikTok or Instagram.

Compared with Next.js, Astro is simpler for this MVP. Compared with plain HTML/CSS/JS, Astro gives us a cleaner structure for reusable layouts, data, and future growth.

## Project Structure

```text
src/
  data/site.js          Editable profile, folder metadata, and placeholder posts
  data/social/*.json    Selected social post URLs and saved metadata per page
  components/PortfolioCard.astro  Native image/video cards
  layouts/BaseLayout.astro
  pages/index.astro     Main website page
  styles/global.css     Site styling

project-management/
  epics/                Agile epics and stories
  sprint-reviews/       High-level sprint summaries
  memory.md             Short future-agent memory snippets

web_design/             Supplied visual reference screenshots
```

## Before You Start

Install Node.js version 22.12.0 or newer. Astro 7 requires this version or newer.

On Windows PowerShell, use `npm.cmd` instead of `npm` if script execution is blocked.

## Install The Website

From the project folder:

```powershell
cd d:\Dev\portfolio_website
npm.cmd install
```

## Run Locally

```powershell
npm.cmd run dev
```

Astro will show a local URL, usually:

```text
http://localhost:4321
```

Open that URL in a browser.

## Test A Production Build

```powershell
npm.cmd run build
```

This creates a production-ready `dist/` folder.

To preview that production build:

```powershell
npm.cmd run preview
```

## Security Checks

Run this before deploying or after changing dependencies:

```powershell
npm.cmd audit
npm.cmd run check
npm.cmd run build
```

This project currently uses npm `overrides` in `package.json` to force patched YAML tooling under Astro's checker dependency chain. Keep those overrides unless a future Astro or `@astrojs/check` release removes the need for them and `npm.cmd audit` still reports zero vulnerabilities.

## Edit The Content

Most placeholder content is in:

```text
src/data/site.js
```

Replace:
- `Creator Name`
- `@creatorhandle`
- `hello@example.com`
- Instagram and TikTok links
- Folder summaries
- Placeholder post titles and descriptions

Do not treat the screenshots in `web_design/` as finished client portfolio assets. They are design references only.

Photography and Videography still use temporary seeded images from Lorem Picsum. Eyebrow Tattooing now has nine selected posts (six playable reels, two restricted reel previews, and a ten-image carousel), and Dance has one real selected social video. Replace the remaining placeholders with selected post URLs before public launch.

The hero split-flap background currently uses five temporary AI-generated landscape images in `public/assets/landscapes/`. They are placeholder review assets and should be replaced with client-approved imagery before launch.

## Update Selected Social Posts

Each portfolio page has its own JSON file in `src/data/social/`: `eyebrow-tattooing.json`, `videography.json`, `photography.json`, and `dance.json`.

Add the full URL of each selected public post to that page's `posts` array, with up to nine unique entries. Use Instagram `/p/` or `/reel/` URLs, or full TikTok `@account/video/id` URLs. An entry starts as:

```json
{
  "url": "https://www.instagram.com/reel/DbyTDW2BAdX/"
}
```

Set `accountUrl` to the relevant profile for the page's "Visit" link. To replace a selected post, replace its whole entry, including any existing `cached` block. Keep the previous version in Git until the new refresh succeeds.

Run the refresh after editing the URLs:

```powershell
npm.cmd run content:refresh
# Or refresh just one page:
npm.cmd run content:refresh -- --page dance
```

The command reads the public pages, extracts available caption/date/media, downloads the media and poster into `public/assets/social/`, and writes a generated `cached` block into each JSON entry. It uses no account credentials. TikTok's temporary anonymous session cookies stay in memory during the download; no cookie or signed CDN address is saved. HTML challenges, unsupported hosts, oversized downloads, and invalid media files are rejected. A failed post refresh retains that entry's previous saved content and returns a nonzero exit status.

The website uses these local files, so building and viewing saved posts needs no connection to the social platforms. Commit the JSON files and saved media together when publishing. Images link to their original post; video cards use native playback, expand to show the video, and stop when navigating away. Videos load only when played. Captions and dates are displayed in our own markup, with hashtags extracted into the final paragraph. Dated posts sort newest first, with `01` as the newest selected post; missing dates appear last.

Image carousels save all slides in a generated `cached.slides` array (up to 20 images supported). Cards provide previous/next arrows, an image counter, left/right keyboard navigation, Home/End keys, and touch swiping; cycling wraps at either end. Only the first image loads initially, and other images load as selected. Clicking a slide still opens the original post. All slide downloads and full image decoding must succeed before that post's cache is replaced. Sharp (already used by Astro, now also a direct dependency) rejects corrupt/truncated images and images above 40 million pixels. Mixed image/video carousels are not currently supported.

For a curated trial order, set `"order": "listed"` at the JSON file's top level to preserve the `posts` array order without changing actual dates. The brow trial currently uses this setting to keep the requested posts at 01–09. Remove it to return to newest-first sorting.

If Instagram marks video playback as copyright-blocked but still supplies a public preview image, only that image is saved (`cached.previewOnly: true`). The card displays a preview badge and links to the original reel with "Watch reel on Instagram"; the importer does not try to bypass the restriction or download the blocked video. This currently applies to brow posts 02 and 04. Native playback for those two requires an available playable source or client-supplied original files; the pasted embed HTML itself contains no video file.

Optional manual corrections live in `overrides`, outside the generated cache:

```json
{
  "url": "https://www.instagram.com/reel/DbyTDW2BAdX/",
  "overrides": {
    "publishedAt": "2026-08-07T00:00:00Z",
    "caption": "Approved caption #brows #pmu",
    "alt": "Description of the featured work"
  }
}
```

If a date cannot be extracted or supplied, the card says "Date unavailable". Real posts are never repeated to fill empty slots. Pages without any saved social entries retain their existing design placeholders.

This is an unsupported public-page extraction workflow, not an automatically discovered latest-nine feed. Platform markup can change or access can be blocked, requiring importer maintenance; the last saved media remains available. Private, login-only, or unavailable posts are not supported. Each image download is limited to 10 MB and each video to 120 MB; the current sample collection totals about 62 MB of cached media. Old content-addressed media files are kept rather than automatically deleted, so review unused assets as the collection grows.

## Future Booking Plan

For eyebrow tattooing bookings, use a dedicated booking page or section.

Recommended first option: Cal.com embed.

Why:
- It can be embedded into a static site.
- It avoids building a custom booking system.
- It can connect to a calendar and manage availability.

## Deploy To Vercel

1. Create a GitHub repository for this project.
2. Push the project to GitHub.
3. Go to Vercel and choose “Add New Project”.
4. Import the GitHub repository.
5. Use these settings:
   - Framework preset: Astro
   - Build command: `npm run build`
   - Output directory: `dist`
6. Deploy.

Before public launch, update `site` in `astro.config.mjs` from `https://example.com` to the real domain.

## Agile Working Notes

This project is managed like a small product team.

Read:
- `project-management/epics/` for epics, stories, acceptance criteria, and test notes.
- `project-management/sprint-reviews/` for completed sprint summaries.
- `project-management/memory.md` for short context snippets future AI agents can read quickly.
