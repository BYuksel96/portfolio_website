# EPIC-08: Hero UI Polish

## Epic Goal
Refine the homepage hero layout based on visual review feedback so the iOS desktop concept reads cleanly.

## Status
Done

## Sprint
Sprint 8

## Stories

### Story: Centered Search Bar
As a visitor,  
I want the search bar centered horizontally in the hero,  
So that the desktop layout feels balanced and intentional.

#### Acceptance Criteria
Given I view the desktop hero,  
When the page loads,  
Then the search bar is centered on the x-axis while keeping its current vertical placement.

#### Test Notes
Updated `.search-panel` to use `left: 50%` and `transform: translateX(-50%)`, with mobile reset rules.

### Story: Clear Title Area
As a visitor,  
I want the blue folder to avoid the creator name text,  
So that the title remains readable and the folder interaction remains clear.

#### Acceptance Criteria
Given I view the desktop hero,  
When the folder layout renders,  
Then the blue Photography folder no longer sits behind the creator name.

#### Test Notes
Moved the first folder placement away from the title block in `src/styles/global.css`.

### Story: Softer Folder Labels
As a visitor,  
I want folder labels to feel less heavy,  
So that the folders match the softer visual reference style.

#### Acceptance Criteria
Given I view the folder labels,  
When the page renders,  
Then folder label text is not bold.

#### Test Notes
Reduced `.folder` font weight from bold to regular-medium weight.

## Sprint Review Summary
Applied focused hero polish: centered the search field horizontally, moved the blue folder out of the title area, and softened folder label weight.
