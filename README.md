# Creative Portfolio Website

This is a fast, static Astro website for a creative person who works across photography, video editing, TikTok/social content, street dance, and eyebrow tattooing.

The design direction is an iOS-style desktop with folders. Each folder represents a creative discipline and opens into curated work, tags, social links, and contact prompts.

## Why Astro

Astro was chosen because this site should be fast, easy to host, and mostly static. It sends very little JavaScript by default, which is useful for a portfolio that may later include heavier social embeds from TikTok or Instagram.

Compared with Next.js, Astro is simpler for this MVP. Compared with plain HTML/CSS/JS, Astro gives us a cleaner structure for reusable layouts, data, and future growth.

## Project Structure

```text
src/
  data/site.js          Editable profile, folders, posts, and social notes
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

Install Node.js version 20 or newer. This machine currently has Node installed.

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

## Social Feed Plan

The MVP uses curated static content because it is faster, more reliable, and easier to approve with the client.

Future upgrades:
- TikTok: add official embeds for selected TikTok post URLs.
- Instagram: verify current Meta API requirements before building live feeds. Instagram API access usually requires a Creator or Business account.
- Performance: avoid loading every social embed on the homepage at once. Prefer selected featured posts or lazy-loaded embeds.

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
