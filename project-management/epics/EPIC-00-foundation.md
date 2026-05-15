# EPIC-00: Foundation And Team Operating Model

## Epic Goal
Create the project foundation, tooling, and Agile tracking system so the work can be managed like a small product team.

## Status
Done

## Sprint
Sprint 0

## Stories

### Story: Project Scaffold
As an engineer,  
I want a fresh Astro project scaffold,  
So that the website has a performant static foundation that can grow safely.

#### Acceptance Criteria
Given the repo is empty apart from reference assets,  
When the scaffold is created,  
Then the project has package scripts, Astro config, source folders, layout, data, and styles.

Verify the existing screenshot references remain untouched in `web_design/`.

#### Test Notes
Verified by file inspection and build command.

### Story: Agile Tracking
As a product owner,  
I want epics and stories captured in project files,  
So that the delivery history is easy to review later.

#### Acceptance Criteria
Given development is run in sprints,  
When an epic is created,  
Then it includes a goal, status, sprint, stories, acceptance criteria, test notes, and review summary.

Verify each story uses “As a, I want, So that” format.

#### Test Notes
Verified by reviewing files under `project-management/epics/`.

### Story: Memory Layer
As a scrum master,  
I want concise project memory snippets,  
So that future agents can understand completed work without reading every file.

#### Acceptance Criteria
Given an epic is completed,  
When its work is summarized,  
Then `project-management/memory.md` records a compact status and future notes.

#### Test Notes
Verified in `project-management/memory.md`.

## Sprint Review Summary
Created a visible Agile operating layer with epics, stories, acceptance criteria, status, test notes, sprint reviews, and concise memory snippets.
