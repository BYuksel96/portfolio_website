# EPIC-01: Visual System And Folder Desktop

## Epic Goal
Create a polished iOS desktop/folder-inspired visual system that suits a creative multi-discipline profile.

## Status
Done

## Sprint
Sprint 1

## Stories

### Story: Folder Desktop Hero
As a visitor,  
I want to land on a visually memorable folder-style portfolio,  
So that I immediately understand the creator has distinct bodies of work.

#### Acceptance Criteria
Given I open the homepage,  
When the hero loads,  
Then I see the creator name, search field, profile prompt, and four portfolio folders.

Verify the first screen is the usable portfolio experience, not a marketing-only landing page.

#### Test Notes
Verified in `src/pages/index.astro` and responsive CSS.

### Story: Responsive Layout
As a mobile visitor,  
I want the folder concept to remain usable on a small screen,  
So that I can browse the creator’s profile without overlap or cramped text.

#### Acceptance Criteria
Given the viewport is narrow,  
When I view the homepage,  
Then folders stack into a simple grid and text remains inside its containers.

Verify no fixed desktop positioning breaks mobile reading order.

#### Test Notes
Verified through CSS media queries and build.

### Story: Accessible Visual States
As a keyboard user,  
I want visible focus states and semantic landmarks,  
So that I can navigate the page without a mouse.

#### Acceptance Criteria
Given I tab through interactive elements,  
When focus moves,  
Then links and inputs show a clear focus outline.

Verify the page uses semantic `main`, `section`, `nav`, headings, labels, and accessible names.

#### Test Notes
Verified by code review of markup and CSS.

## Sprint Review Summary
Delivered the primary iOS folder desktop direction with responsive layout, folder icons, search panel, AirDrop-style CTA, and accessible interaction states.
