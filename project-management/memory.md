# Project Memory

Use this file as the token-light memory layer for future Codex/Claude sessions.

## Current Product Direction
- Build: Astro static portfolio site at repo root.
- Visual concept: iOS desktop/folder-inspired creator portfolio.
- MVP folders: Photography, Videography, Dance, Eyebrow Tattooing.
- Content strategy: curated local placeholders first; live social feeds later.
- Hosting default: Vercel.

## Epic Status
- EPIC-00 Foundation: Done. Astro scaffold, docs structure, README, and project tracking created.
- EPIC-01 Visual System: Done. Responsive iOS-folder hero, portfolio OS top bar, search field, folder icons, and accessible layout created.
- EPIC-02 Portfolio Content: Done. Local structured content powers folders, tags, post cards, social links, and CTA copy.
- EPIC-03 Interactions: Done. Client-side search/filter, folder anchors, social handoffs, and contact CTA implemented.
- EPIC-04 Documentation: Done. Non-technical README and sprint review summaries created.
- EPIC-05 Security Hardening: Done. Upgraded Astro to 6.3.3, updated @astrojs/check to 0.9.9, added npm overrides for patched YAML tooling, and verified `npm.cmd audit`, `check`, and `build` all pass.
- EPIC-06 Responsive Scalability: Done. Refactored CSS with responsive folder sizing variables, adaptive gutters, auto-fit content grids, and breakpoints for mobile, tablet, laptop, and large desktop.
- EPIC-07 Source Control Setup: Done locally. Initialized Git on `main`, configured `origin` as `https://github.com/BYuksel96/portfolio_website.git`, ignored local reference screenshots, and prepared the repo for initial push. Remote lookup failed pending GitHub access/repo availability.
- EPIC-08 Hero UI Polish: Done. Centered desktop search on the x-axis, moved the blue Photography folder away from the title, and reduced folder label font weight.
- EPIC-09 Folder Preview Hover: In review, not committed. Folder hover/focus now slightly opens the folder and reveals three half-exposed fanned polaroid previews from that folder's post data.
- EPIC-10 Temporary Remote Media: In review, not committed. Added seeded Lorem Picsum `mediaUrl` values and rendered them in folder preview polaroids plus portfolio post cards for visual review.
- EPIC-11 Search Suggestions: In review, not committed. Added Google-style suggested search prompts and a typewriter placeholder loop for the hero search input.
- EPIC-12 Work Folder Heading Alignment: In review, not committed. Removed work-section social eyebrow labels and aligned each main folder heading vertically to the center of its folder icon.
- EPIC-13 Single-Line Work Headings: In review, not committed. Work-folder headings now prefer a one-line layout with responsive font sizing and mobile fallback wrapping.
- EPIC-14 Hero Split-Flap Landscape Board: In review, not committed. Generated five temporary hyper-realistic landscape images and added a 24-column split-flap hero background that sweeps left-to-right; each tile is now a two-sided 180-degree flip card with the current image on the front and next image on the back, waits 5 seconds after completion, then cycles.
- EPIC-15 Folder Preview Mouth Anchor: In review, not committed. Folder hover polaroids sit between the folder back/body and front flap, fan out from the folder mouth, and retract upward inside the folder without clipping below the body.
- EPIC-16 Folder Face Split Polish: In review, not committed. Folder front face keeps the original colour while tab/back pieces share the exact same 20% lighter colour; tab is smaller than the original but tuned wider and ~3px taller, with one higher split line where the front flap opens and previews emerge.
- EPIC-17 Responsive AirDrop: In review, not committed. AirDrop compacts on tablet-style layouts and becomes a mobile-only top-right notification aligned near the creator handle, with a solid blue dot and two pulsing blue glow layers, expanding into a correctly sized card with a yellow minimise button.
- EPIC-18 Responsive Hero Collision Guardrails: In review, not committed. Added narrow desktop, low-height desktop, tablet, mobile, and short-phone layout rules to keep folders away from creator title/search/AirDrop UI; mobile shell now fits viewport with equal gutters, foreground stacking is restored, and folders are raised toward the search-to-bottom midpoint.

## Future Notes
- Replace placeholder identity, email, social URLs, and media before launch.
- Instagram live feed requires Creator/Business account and current Meta API verification.
- TikTok can be upgraded with official embeds for supplied post URLs.
- Future booking default is a Cal.com embed on a dedicated eyebrow tattooing booking page.
- Keep `package.json` overrides for `volar-service-yaml` and `yaml-language-server` until the upstream Astro checker chain no longer needs them and audit remains clean.
- `web_design/` is ignored intentionally because it contains third-party/client-provided inspiration screenshots, not deployable site assets.
- Current `mediaUrl` values are temporary Lorem Picsum placeholders and must be replaced with approved client media before launch.
- Hero split-flap landscapes live in `public/assets/landscapes/` and are temporary AI-generated review assets.
