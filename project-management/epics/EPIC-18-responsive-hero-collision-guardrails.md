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
When I view the folders,  
Then folders use a two-column grid and do not overlap the title, search, or AirDrop notification.

Given the viewport is mobile width,  
When I use search,  
Then the search bar remains centered and sized to the available width.

#### Test Notes
Refined mobile folder sizing, shell padding, title sizing, and search panel centering in `src/styles/global.css`.

## Sprint Review Summary
Hero layout now has stronger responsive guardrails for narrow desktop, low-height desktop, tablet, and mobile layouts so folders avoid the title and AirDrop UI.
