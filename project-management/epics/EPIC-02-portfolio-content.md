# EPIC-02: Portfolio Content Model

## Epic Goal
Create a maintainable content model for the creator’s services and featured work while real media and client details are still pending.

## Status
Done

## Sprint
Sprint 2

## Stories

### Story: Portfolio Folders
As a visitor,  
I want the creator’s work grouped by discipline,  
So that I can quickly find the type of creative work I care about.

#### Acceptance Criteria
Given I browse the site,  
When I view the selected work area,  
Then I see Photography, Videography, Dance, and Eyebrow Tattooing sections.

Verify each section has summary copy, tags, posts, and a relevant social handoff.

#### Test Notes
Verified through `src/data/site.js` and rendered page structure.

### Story: Placeholder Content
As the site owner,  
I want realistic placeholder content,  
So that the client can review structure and tone before providing final media.

#### Acceptance Criteria
Given final client content is unavailable,  
When the MVP is built,  
Then placeholder names, links, post titles, and descriptions are clearly replaceable.

Verify placeholder content does not pretend to be final client-owned work.

#### Test Notes
Verified by data review and README content replacement guidance.

### Story: Future Integration Notes
As a future engineer,  
I want social and booking constraints documented,  
So that later integrations do not start from bad assumptions.

#### Acceptance Criteria
Given social feeds and booking are future work,  
When reviewing the project,  
Then notes explain Instagram, TikTok, and Cal.com direction.

#### Test Notes
Verified in README and memory docs.

## Sprint Review Summary
Created a local content model for four portfolio folders, featured post cards, service positioning, tags, social handoffs, and future integration notes.
