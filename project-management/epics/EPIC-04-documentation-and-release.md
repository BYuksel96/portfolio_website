# EPIC-04: Documentation And Release Readiness

## Epic Goal
Make the project understandable for a non-technical user and ready for local testing and Vercel deployment.

## Status
Done

## Sprint
Sprint 4

## Stories

### Story: Non-Technical README
As a non-technical maintainer,  
I want clear setup and hosting instructions,  
So that I can run, test, and deploy the site without guessing.

#### Acceptance Criteria
Given I open the README,  
When I follow the steps,  
Then I understand what Astro is, why it was chosen, how to install, how to run locally, and how to deploy to Vercel.

Verify Windows commands use `npm.cmd` where needed.

#### Test Notes
Verified in `README.md`.

### Story: Sprint Review Records
As a scrum master,  
I want high-level sprint review summaries,  
So that completed work can be understood quickly later.

#### Acceptance Criteria
Given a sprint is complete,  
When the sprint review file is opened,  
Then it summarizes completed epics, stories, test evidence, and remaining follow-ups.

#### Test Notes
Verified in `project-management/sprint-reviews/`.

### Story: Release Checks
As an engineer,  
I want build checks to pass,  
So that the MVP is safe to preview and deploy.

#### Acceptance Criteria
Given dependencies are installed,  
When `npm.cmd run build` runs,  
Then Astro generates a production build in `dist/`.

#### Test Notes
Build verification recorded after command execution.

## Sprint Review Summary
Completed README, deployment notes, sprint review documents, and release-readiness checks for the MVP.
