# EPIC-18: Responsive Hero Collision Guardrails

## Epic Goal
Prevent homepage folders, hero title, search, and AirDrop UI from overlapping or hiding each other at smaller viewport dimensions.

## Status
In Review

## Sprint
Sprint 17

## Stories

### Story: Narrow Desktop Folder Repositioning
As a visitor on a smaller laptop or narrow browser window,  
I want folders to reposition away from the title and AirDrop card,  
So that every homepage element remains readable and clickable.

#### Acceptance Criteria
Given the viewport is between tablet and large desktop widths,  
When the homepage loads,  
Then the blue folder no longer overlaps the creator name text.

Given the viewport has limited height,  
When the homepage loads,  
Then the yellow folder no longer sits behind the AirDrop card.

#### Test Notes
Added intermediate `901px-1200px` and low-height desktop rules in `src/styles/global.css` to resize the title, reposition folders, and compact the AirDrop card.

### Story: Mobile Hero Flow
As a mobile visitor,  
I want the hero content to flow in a readable order,  
So that the title, search, folders, and AirDrop entry point do not compete for the same space.

#### Acceptance Criteria
Given the viewport is mobile width,  
When I view the homepage,  
Then the creator title scales down and remains readable near the top.

Given the viewport is mobile width,  
When I compare the creator handle and AirDrop notification,  
Then the creator handle row is raised to align with the notification centreline and uses the same inner-shell inset from the left as the notification uses from the right.

Given the viewport is mobile width,  
When I view the folders,  
Then folders use a two-column grid and do not overlap the title, search, or AirDrop notification.

Given the viewport is mobile width,  
When I use search,  
Then the search bar remains centered and sized to the available width.

#### Test Notes
Refined mobile folder sizing, shell padding, title sizing, hero copy inset/alignment, and search panel centering in `src/styles/global.css`. Cleared inherited desktop offsets when foreground elements switch to relative positioning so mobile alignment rules actually apply.

### Story: Mobile Hero Content Layering
As a mobile visitor,  
I want the creator text and search bar to sit above the split-flap slices,  
So that the vertical board lines do not wash over the foreground UI.

#### Acceptance Criteria
Given the viewport is below tablet width,  
When the hero switches into flow layout,  
Then the creator handle, title, headline, search, folders, and AirDrop card remain layered above the split-flap board.

Given the search bar is visible on mobile,  
When I view it over the split-flap background,  
Then the vertical slice overlay does not appear on top of the search field.

#### Test Notes
Kept the responsive flow layout while restoring active stacking contexts in `src/styles/global.css` by setting foreground hero elements to `position: relative` with higher `z-index` values and clearing inherited desktop `inset` offsets.

## Sprint Review Summary
Hero layout now has stronger responsive guardrails for narrow desktop, low-height desktop, tablet, and mobile layouts so folders avoid the title/AirDrop UI and foreground content stays above the split-flap overlay.
