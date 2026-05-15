# EPIC-11: Search Suggestions

## Epic Goal
Improve the hero search experience with guided prompts and animated placeholder text so visitors understand what they can search for.

## Status
In Review

## Sprint
Sprint 11

## Stories

### Story: Suggested Search Prompts
As a visitor,  
I want suggested searches to appear when I click the search bar,  
So that I can quickly understand the kinds of work I can explore.

#### Acceptance Criteria
Given I focus the search input,  
When the search panel opens,  
Then I see suggested prompts similar to a search engine suggestion list.

Given I select a suggestion,  
When the suggestion is clicked,  
Then the search input is populated and the portfolio filter updates.

#### Test Notes
Added a custom suggestions panel using buttons with `data-suggestion` values and click handlers that reuse the existing filter logic.

### Story: Typewriter Placeholder
As a visitor,  
I want the search placeholder to cycle through useful prompt examples,  
So that the search bar feels active and guides discovery.

#### Acceptance Criteria
Given the search input is empty,  
When the page is idle,  
Then placeholder text appears with a typewriter-style cycle across multiple phrases.

Given I type into the input,  
When the input has a value,  
Then the typewriter placeholder pauses and does not overwrite my search term.

#### Test Notes
Added a lightweight placeholder loop that only updates `input.placeholder`, never `input.value`.

### Story: Accessible Search Behaviour
As a keyboard user,  
I want the suggestion list to be reachable and understandable,  
So that the search helper is not mouse-only.

#### Acceptance Criteria
Given I tab into the search input,  
When the panel receives focus,  
Then the suggestions become visible and can be tabbed to as buttons.

Verify the input advertises the suggestion panel with `aria-controls` and `aria-expanded`.

#### Test Notes
Added `aria-controls`, `aria-expanded`, `role="listbox"`, and button suggestions.

## Sprint Review Summary
Added guided search suggestions and a typewriter placeholder loop to make the hero search bar feel more interactive and easier to understand.
