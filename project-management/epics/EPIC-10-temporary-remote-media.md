# EPIC-10: Temporary Remote Media

## Epic Goal
Use temporary internet-hosted placeholder images so the portfolio can be reviewed with real media loading behaviour before client assets are available.

## Status
In Review

## Sprint
Sprint 10

## Stories

### Story: Placeholder Media URLs
As a product owner,  
I want each placeholder post to have temporary remote media,  
So that the portfolio can be visually reviewed before final client images or videos exist.

#### Acceptance Criteria
Given the local content data is loaded,  
When posts render,  
Then each post has a `mediaUrl` pointing to deterministic temporary placeholder imagery.

#### Test Notes
Added seeded Lorem Picsum WebP URLs to each post in `src/data/site.js`.

### Story: Render Real Image Placeholders
As a visitor,  
I want folder previews and post cards to show image content,  
So that the site feels closer to a real portfolio during review.

#### Acceptance Criteria
Given a folder has posts with `mediaUrl` values,  
When the homepage renders,  
Then hover polaroids and post cards display image placeholders instead of only gradients.

#### Test Notes
Rendered `img` elements in folder polaroids and poster cards with lazy loading.

### Story: Temporary Asset Disclosure
As a maintainer,  
I want temporary media clearly documented,  
So that placeholder internet content is not mistaken for final client-owned material.

#### Acceptance Criteria
Given the README or memory file is reviewed,  
When maintainers look for media guidance,  
Then they see that `mediaUrl` values are temporary and must be replaced before launch.

#### Test Notes
Updated README and project memory with temporary-media notes.

## Sprint Review Summary
Added temporary seeded Lorem Picsum image URLs to the content model and rendered them in folder hover previews and portfolio cards for visual review. These assets are explicitly marked as non-final placeholders.
