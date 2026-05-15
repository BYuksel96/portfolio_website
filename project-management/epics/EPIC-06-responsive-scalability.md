# EPIC-06: Responsive Scalability

## Epic Goal
Make the full website and folder UI scale cleanly across mobile, tablet, laptop, desktop, and large desktop screen sizes.

## Status
Done

## Sprint
Sprint 6

## Stories

### Story: Scalable Folder UI
As a visitor on any device,  
I want the portfolio folders to scale up or down with the screen,  
So that the iOS folder concept remains usable and visually balanced.

#### Acceptance Criteria
Given I view the site on mobile, tablet, laptop, desktop, or large desktop,  
When the viewport changes size,  
Then folder icons, folder labels, spacing, and hit areas resize without breaking the layout.

Verify folder sizes are controlled by responsive CSS variables rather than fixed pixel-only values.

#### Test Notes
Implemented responsive folder variables in `src/styles/global.css` for base, mobile, tablet, laptop, and large desktop breakpoints.

### Story: Whole-Site Fluid Layout
As a visitor,  
I want the whole portfolio to adapt to my device size,  
So that content remains readable without awkward overflow or cramped grids.

#### Acceptance Criteria
Given the site is viewed across common device widths,  
When layout space changes,  
Then gutters, folder grids, post cards, notes, headings, and content sections adapt to available space.

Verify post and notes grids use auto-fit behaviour where appropriate.
Verify mobile keeps a clean reading order.

#### Test Notes
Refactored gutters, section widths, work grids, post grids, notes grids, and breakpoint-specific heading sizes.

### Story: Responsive Regression Check
As an engineer,  
I want responsive changes verified against build tooling,  
So that layout refinements do not break the Astro project.

#### Acceptance Criteria
Given responsive CSS changes are complete,  
When project checks run,  
Then audit, Astro check, and production build pass.

#### Test Notes
Verification recorded in the Sprint 6 review.

## Sprint Review Summary
Improved responsive behaviour across the site by replacing fixed folder dimensions with responsive CSS variables, adding device-specific folder scaling, and making content grids adapt more smoothly across viewport sizes.
