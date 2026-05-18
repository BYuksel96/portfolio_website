# EPIC-16: Folder Face Split Polish

## Epic Goal
Refine the homepage folder icon shape so the top/back section remains visible as the opening edge and the lower/front face reads as a clean solid folder-colour panel.

## Status
In Review

## Sprint
Sprint 16

## Stories

### Story: Clean Folder Split Line
As a visitor,  
I want each folder to have a clear split between the back/top section and front/lower section,  
So that the folder interaction looks closer to the requested visual reference.

#### Acceptance Criteria
Given I view a homepage folder,  
When I compare the icon to the reference direction,  
Then the visible top/back section remains above the split and the lower/front face is solid folder colour.

Given I hover or focus a homepage folder,  
When the folder opens,  
Then the flap opens from the split line rather than appearing as extra stacked stripes.

#### Test Notes
Updated the folder front panel in `src/styles/global.css` to keep the original folder colour while the tab/back pieces use a 20% lighter colour mix, plus a single higher split-line shadow and a top-edge transform origin for the opening motion.

## Sprint Review Summary
Polished the folder face design by removing the extra striped gradient treatment, keeping the front face at the original colour, and lightening the tab/back pieces while keeping the single higher split line and existing hover preview behaviour.
