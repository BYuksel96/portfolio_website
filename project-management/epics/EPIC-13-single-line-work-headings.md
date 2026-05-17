# EPIC-13: Single-Line Work Headings

## Epic Goal
Keep selected-work folder headings visually compact by preferring one-line titles when there is enough horizontal space.

## Status
In Review

## Sprint
Sprint 13

## Stories

### Story: One-Line Work Titles
As a visitor,  
I want selected-work folder headings to stay on one line where possible,  
So that the section headers feel cleaner and easier to scan.

#### Acceptance Criteria
Given I view a work-folder summary with enough horizontal space,  
When the heading renders,  
Then the heading stays on one line and scales down responsively if needed.

Given I view the heading on a very narrow mobile layout,  
When one line would overflow,  
Then normal wrapping is allowed to preserve readability.

#### Test Notes
Added responsive clamp sizing and `white-space: nowrap` for folder summary headings with a mobile fallback.

## Sprint Review Summary
Adjusted selected-work headings to prefer a one-line layout using responsive font sizing while preserving mobile readability with fallback wrapping.
