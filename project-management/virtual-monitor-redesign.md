# Virtual Monitor Redesign

## Approved outcome

Convert the portfolio from a vertically stacked page into a viewport-locked “Portfolio OS.” The outer document must not scroll; Home retains the scattered desktop composition, while all folder, search, and contact content opens inside the monitor and scrolls only within its workspace.

The persistent control rail is ordered: Eyebrow Tattooing, Videography, Photography, Dance, Search, Contacts, Home. It becomes a bottom dock on narrow screens. Opening any folder—or accepting AirDrop—moves the folders and search affordance into the dock, removes the Home identity/AirDrop with playful motion, marks the active view accessibly, and opens the selected content. Home reverses that transition. Navigation must support direct routes, History API transitions, Back/Forward, keyboard/touch input, focus management, and reduced motion.

Routes: `/`, `/eyebrow-tattooing`, `/videography`, `/photography`, `/dance`, `/search?q=…`, and `/contacts`.

## Source content that must be preserved

`src/data/site.js` currently exports exactly four named values:

- `profile`: name `Creator Name`; handle `@creatorhandle`; location `London, UK`; headline `Creative direction, movement, image-making, and beauty work.`; the multi-discipline AirDrop introduction; `hello@example.com`; Instagram and TikTok root URLs; booking anchor `#booking`.
- `heroLandscapes`: five local WebP assets—mountain valley, black-sand coast, desert canyon, rainforest waterfall, and arctic aurora—with descriptive alt text.
- `folders`: four category records. Each supplies `id`, `label`, `color`, `accent`, `summary`, `cta`, social label/URL, four tags, and three post records. Each post supplies title, type, placeholder date, description, two tags, three palette colours, and a Picsum media URL.
- `socialNotes`: three MVP/integration disclosures covering curated local content, Meta/Instagram API requirements, and future official TikTok embeds.

Folder data/order in the current export is Photography (`photography`, blue), Videography (`videography`, green), Dance (`dance`, pink), Eyebrow Tattooing (`brows`, yellow). The new dock must deliberately use the approved order and map public `/eyebrow-tattooing` to the existing `brows` data ID (or migrate the ID consistently).

All current folder copy should remain available in its folder view: summary, tags, social CTA, and all three existing Selected Work cards. The requested 3×3 media presentation cannot be populated with nine unique items from current data; there are only three posts per category. Do not silently invent canonical project copy or imply that Picsum placeholders are a live Instagram feed.

The current “Next step” content to relocate into Contacts is:

- Eyebrow: `Next step`
- Heading: `Make the profile easy to book, share, and trust.`
- Copy: `Replace the placeholder content with approved creator details, then connect selected social posts and a booking flow for eyebrow tattooing consultations.`
- Actions: Email Enquiry (`mailto:hello@example.com`), Instagram, and TikTok.
- The three `socialNotes` disclosures.

There is currently no email form or submission endpoint. Existing contact behavior is mailto plus external social links; any form added by this redesign needs an explicit non-deceptive fallback (for example, client-side mailto composition) unless a backend is introduced.

## Existing presentation and behavior

- `BaseLayout` receives title `${profile.name} | Creative Portfolio`.
- The monitor header contains window dots, location, and `Portfolio OS`.
- The background is a 24-tile split-flap board driven by `data-landscapes`; it cycles through all five sources using staggered 80 ms tile flips, 760 ms flip duration, and a 5 s pause.
- Home renders the profile identity, search, four scattered folders with three preview cards each, and AirDrop. Folder links currently target same-page hashes (`#${folder.id}`).
- Search has six hard-coded suggestions and an animated placeholder sequence. Input matching is case-insensitive substring matching over `data-search-text`; it hides nonmatching folder links/cards and folder sections with no visible cards. Submit is prevented. This must be deliberately replaced by the route-backed Search view without losing folder/post/tag/description coverage.
- Desktop AirDrop shows the intro and an `Accept` mailto link. At `max-width: 580px`, the card is hidden/inert until an “Incoming AirDrop” toast opens it; minimise closes it and updates `aria-expanded`/`aria-hidden`/`inert`. The redesigned Accept action must navigate to Contacts, while retaining accessible expanded-state handling if the compact toast/card pattern remains.
- Folder hover/focus opens the folder face and fans out its three previews. Reduced-motion CSS disables transitions/animations for folders, search suggestions, AirDrop pulse, and split-flap flipping.
- Current responsive breakpoints are 900 px, 580 px, short mobile (`580 px` plus `740 px` height), desktop widths through 1200 px, short desktop (`760 px` height), and 1600 px+. Current mobile monitor height is already viewport-bound, but desktop uses minimum heights and the lower work/contact bands create document scrolling.

## Existing DOM and styling hooks

JavaScript/query hooks that are contracts until replaced intentionally:

- `#portfolio-search`, `.search-panel`, `[data-suggestion]`
- `.desktop-shell[data-landscapes]`, `.split-flap-tile`, `.split-flap-face-front`, `.split-flap-face-back`, `.is-flipping`, `.is-resetting`
- `[data-search-item][data-search-text]`, `[data-folder-section]`, `.post-card`
- `#airdrop-card`, `[data-airdrop-toast]`, `[data-airdrop-minimise]`, `.is-open`

Principal layout/content hooks include `.hero`, `.top-bar`, `.window-dots`, `.hero-copy`, `.search-field-row`, `.search-suggestions`, `.folder-grid`, `.folder`, `.folder-{blue|green|pink|yellow}`, `.folder-stack`, `.folder-icon`, `.folder-back`, `.folder-front`, `.folder-previews`, `.folder-polaroid`, `.airdrop-card`, `.airdrop-toast`, `.work-band`, `.folder-sections`, `.work-folder`, `.folder-summary`, `.mini-folder`, `.tag-row`, `.post-grid`, `.post-card`, `.poster`, `.post-copy`, `.contact-band`, `.contact-grid`, `.contact-actions`, and `.notes-list`.

Accessibility already present and worth preserving includes the Home `aria-labelledby`, named status/folder navigation regions, visually hidden search label, search `aria-controls`/`aria-expanded`, suggestion listbox roles, AirDrop names/states, focus-visible outlines, meaningful landscape alt text, and decorative empty alt text on preview/post imagery. The new views should use meaningful item alt text when real project media is supplied.

## Implementation and preservation risks

- Astro direct-route support needs actual route output or a catch-all/static strategy; `history.pushState` alone will fail on hard refresh without matching pages and host rewrites.
- Re-initializing scripts after client-side content replacement can duplicate timers/listeners, especially the perpetual split-flap and placeholder timeouts. Prefer one persistent controller with teardown/guarding.
- FLIP-style Home-to-dock motion needs stable element identity and measured before/after rectangles. Re-rendering different folder nodes will break position-aware animation.
- Locking `html/body` overflow can trap content on short screens unless the monitor workspace has a bounded height, `min-height: 0`, and its own accessible overflow region. Mobile bottom-dock space must be reserved.
- Crumbling identity text should preserve one semantic heading for assistive technology, avoid splitting accessible text into noisy characters, and fall back cleanly under `prefers-reduced-motion`.
- Active navigation needs `aria-current` plus a non-colour indicator; route changes should focus the new view heading without breaking browser Back/Forward behavior.
- External Picsum images introduce network/layout-failure risk. Preserve palette fallbacks and explicit image sizing; current URLs and content are placeholders, not owned media.
- Existing `profile.booking` points at `#booking`; changing to `/contacts` requires updating or maintaining compatibility for old internal links.
- Search currently matches folder summaries/tags and post titles/types/descriptions/tags. The new index must retain at least that search corpus and provide grouped/empty states without hiding dock navigation.

## Verification ledger

- Confirm no page-level scroll on desktop, narrow mobile, and short-height viewports; only the active monitor workspace scrolls.
- Verify all seven controls, exact order, accessible active state, keyboard operation, focus transfer, rapid-click guarding, reduced motion, and desktop/mobile dock placement.
- Verify each direct URL, refresh, client navigation, and Back/Forward state restoration.
- Verify all data listed above remains rendered/reachable and every external/mail link retains its destination and security attributes.
- Verify Home folder previews, split-flap landscape cycle, AirDrop-to-Contacts transition, reverse Home animation, search suggestions/query results/empty state, and contact-form fallback.
- Run the project’s existing checks/build plus browser visual QA for overflow, clipping, and animation continuity.
