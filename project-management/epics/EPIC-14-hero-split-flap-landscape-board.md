# EPIC-14: Hero Split-Flap Landscape Board

## Epic Goal
Turn the hero window's vertical grid into a split-flap display board that cycles through temporary landscape images with a left-to-right flip sequence.

## Status
In Review

## Sprint
Sprint 14

## Stories

### Story: Temporary Landscape Assets
As a product owner,  
I want temporary landscape images available for the hero board,  
So that the visual concept can be reviewed before final client media exists.

#### Acceptance Criteria
Given the hero board needs image content,  
When temporary assets are generated,  
Then five hyper-realistic landscape images are available locally in the project.

#### Test Notes
Generated five temporary AI landscape images and copied them to `public/assets/landscapes/`.

### Story: Split-Flap Board Animation
As a visitor,  
I want the hero background columns to flip like a split-flap board,  
So that the open-window design feels dynamic and memorable.

#### Acceptance Criteria
Given I view the hero,  
When the board animation runs,  
Then vertical columns flip from left to right to reveal the next landscape.

Given the final column has flipped,  
When the reveal completes,  
Then the board waits 5 seconds before starting the next image transition.

#### Test Notes
Added 24 split-flap columns with staggered JavaScript timing and local landscape image sources.

### Story: Motion Preference Handling
As a visitor with reduced-motion preferences,  
I want non-essential board motion reduced,  
So that the hero remains comfortable to view.

#### Acceptance Criteria
Given reduced motion is enabled,  
When the board would animate,  
Then flip transitions are disabled.

#### Test Notes
Extended the existing reduced-motion CSS to include split-flap tiles.

## Sprint Review Summary
Added a project-local AI landscape asset set and a split-flap hero background that flips columns left-to-right through the landscapes, with a 5-second pause after each full reveal.
