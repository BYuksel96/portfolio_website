# EPIC-17: Responsive AirDrop

## Epic Goal
Make the AirDrop intro adapt cleanly across small tablets and mobile devices without blocking folders or taking too much space.

## Status
In Review

## Sprint
Sprint 17

## Stories

### Story: Compact AirDrop Card
As a mobile and tablet visitor,  
I want the AirDrop card to scale down on smaller screens,  
So that I can still read the intro without it covering key portfolio folders.

#### Acceptance Criteria
Given I view the homepage below desktop width,  
When the AirDrop card is shown in the page flow,  
Then it uses a constrained readable width and reduced spacing.

Verify the AirDrop card does not overlap the folder grid at tablet/mobile breakpoints.

#### Test Notes
Adjusted the `max-width: 900px` AirDrop sizing and spacing in `src/styles/global.css`.

### Story: Mobile AirDrop Notification
As a mobile visitor,  
I want the AirDrop card to start as a small notification,  
So that the main portfolio folders remain visible and easy to tap.

#### Acceptance Criteria
Given I view the homepage on a small mobile screen,  
When the page loads,  
Then I see a compact "Incoming AirDrop" notification aligned near the creator handle at the top-right of the shell instead of the full AirDrop card.

Given the mobile AirDrop notification is visible,  
When I watch the blue indicator,  
Then the centre dot stays solid, the lighter middle ring appears, the pale outer ring appears after it, and both rings disappear before the cycle repeats.

Given I tap the notification,  
When the AirDrop card opens,  
Then it expands from the notification position and I can read the intro and access the Accept link.

Given the AirDrop card is open on mobile,  
When I press the yellow minimise button,  
Then the card collapses back to the notification.

Verify minimised mobile AirDrop content is not keyboard-focusable while hidden.

#### Test Notes
Added mobile-only AirDrop toast/open/minimise controls in `src/pages/index.astro`, plus top-right shell positioning, morph-style scale animation, layered indicator ring animation, and accessibility state sync in `src/styles/global.css`.

## Sprint Review Summary
AirDrop now behaves responsively: compact in tablet-style layouts, and mobile-only as a polished top-right notification with a three-layer pulsing indicator that expands from the same position into the card and can be minimised again.
