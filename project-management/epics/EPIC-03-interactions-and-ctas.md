# EPIC-03: Search, Navigation, And CTAs

## Epic Goal
Add lightweight interactions that help visitors find relevant work and move toward socials or contact.

## Status
Done

## Sprint
Sprint 3

## Stories

### Story: Folder Navigation
As a visitor,  
I want to browse the creator’s work through visual folders,  
So that I can quickly understand the different creative services they offer.

#### Acceptance Criteria
Given I am on the homepage,  
When I select a portfolio folder,  
Then I am taken to the relevant category content.

Verify the folder UI is usable on mobile and desktop.
Verify keyboard focus states are visible.

#### Test Notes
Verified via anchor links and CSS focus states.

### Story: Portfolio Search
As a visitor,  
I want to search folders, tags, and posts,  
So that I can quickly find relevant creative work.

#### Acceptance Criteria
Given I type into the search field,  
When the query matches folder or post text,  
Then matching items remain visible and non-matching items are hidden.

Given the search field is cleared,  
When the query is empty,  
Then all folders and posts return.

#### Test Notes
Verified by reviewing the browser script and successful build.

### Story: Contact And Social Handoffs
As a potential collaborator or client,  
I want direct ways to contact or view socials,  
So that I can continue the journey on the channel I prefer.

#### Acceptance Criteria
Given I reach the CTA area,  
When I select email, Instagram, or TikTok,  
Then I am sent to the configured placeholder destination.

Verify external social links open safely with `rel="noreferrer"`.

#### Test Notes
Verified in rendered link markup.

## Sprint Review Summary
Implemented folder anchors, local search/filter behavior, social links, and contact CTAs with minimal JavaScript.
