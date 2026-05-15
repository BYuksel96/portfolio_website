# EPIC-09: Folder Preview Hover

## Epic Goal
Add a tactile folder hover interaction that previews each folder's content without requiring visitors to open the full section first.

## Status
In Review

## Sprint
Sprint 9

## Stories

### Story: Fanned Folder Previews
As a visitor,  
I want folders to reveal a small preview of their contents on hover,  
So that I can get a quick sense of what is inside before clicking.

#### Acceptance Criteria
Given I hover over a folder,  
When the hover state activates,  
Then the folder slightly opens and three polaroid-style previews fan out halfway from behind the folder.

Given I move away from the folder,  
When hover ends,  
Then the previews tuck back into the folder.

#### Test Notes
Implemented with Astro-rendered preview markup and CSS transforms using each folder's first three post palettes.

### Story: Keyboard Accessible Preview
As a keyboard user,  
I want the folder preview effect to work on focus,  
So that the hover-only interaction is not mouse-only.

#### Acceptance Criteria
Given I tab to a folder link,  
When the folder receives keyboard focus,  
Then the same preview fan effect appears.

#### Test Notes
Implemented the effect for both `.folder:hover` and `.folder:focus-visible`.

### Story: Motion Sensitivity
As a visitor with reduced-motion preferences,  
I want non-essential animation reduced,  
So that the folder preview interaction does not create discomfort.

#### Acceptance Criteria
Given reduced motion is enabled,  
When the folder preview state changes,  
Then transitions are removed while the state remains understandable.

#### Test Notes
Added `prefers-reduced-motion: reduce` handling for the folder preview transition elements.

## Sprint Review Summary
Added an uncommitted folder preview interaction for review: folders open slightly and reveal three half-exposed polaroid previews fanned like cards, using existing post data and CSS only.
