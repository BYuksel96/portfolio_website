# EPIC-15: Folder Preview Mouth Anchor

## Epic Goal
Improve the folder hover preview so polaroid cards appear to come from inside the folder opening rather than sitting on top of the folder.

## Status
In Review

## Sprint
Sprint 15

## Stories

### Story: Preview Cards Emerge From Folder Mouth
As a visitor,  
I want hover preview cards to come out of the folder opening,  
So that the interaction feels physically believable.

#### Acceptance Criteria
Given I hover or focus a homepage folder,  
When the preview cards fan out,  
Then they appear anchored in the middle of the open folder flap rather than from the top edge.

Given the cards are partially hidden by the folder,  
When they fan out,  
Then the bottom of each card appears tucked inside the folder.

#### Test Notes
Moved the preview layer inside the folder icon stack in `src/pages/index.astro` and split the folder into back/front layers in `src/styles/global.css`, so card bottoms sit behind the front flap while the cards remain visible over the folder body.

## Sprint Review Summary
Adjusted folder hover previews to emerge from the folder mouth/opening and appear partially tucked inside the folder for a more natural physical interaction.
