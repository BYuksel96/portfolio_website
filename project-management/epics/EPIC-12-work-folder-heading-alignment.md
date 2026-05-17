# EPIC-12: Work Folder Heading Alignment

## Epic Goal
Clean up the selected-work folder headers so the discipline heading is the clear primary label and visually aligns with its folder icon.

## Status
In Review

## Sprint
Sprint 12

## Stories

### Story: Remove Work Header Eyebrows
As a visitor,  
I want the selected-work section to avoid unnecessary micro-labels,  
So that the main discipline heading is easier to scan.

#### Acceptance Criteria
Given I view a selected-work folder section,  
When the section renders,  
Then the social eyebrow label above the folder heading is no longer displayed.

#### Test Notes
Removed the `folder.socialLabel` eyebrow from the work-folder summary markup.

### Story: Align Heading To Folder Icon
As a visitor,  
I want the folder heading to line up with the folder icon,  
So that the section header feels visually intentional.

#### Acceptance Criteria
Given I view a folder summary row,  
When the heading renders next to the folder icon,  
Then the heading's vertical midpoint aligns with the folder icon's vertical midpoint.

#### Test Notes
Added a folder-summary heading rule that centers the `h3` within the mini-folder height.

## Sprint Review Summary
Removed unnecessary social eyebrow labels from selected-work headers and aligned the main folder heading with the folder icon for cleaner visual hierarchy.
