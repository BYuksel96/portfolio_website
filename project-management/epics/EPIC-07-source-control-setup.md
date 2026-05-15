# EPIC-07: Source Control Setup

## Epic Goal
Initialize source control and connect the project to the GitHub repository while keeping non-production reference files out of version control.

## Status
Done Locally

## Sprint
Sprint 7

## Stories

### Story: Local Git Repository
As an engineer,  
I want the project initialized as a Git repository,  
So that all source changes can be tracked and reviewed.

#### Acceptance Criteria
Given the project is not currently a Git repository,  
When Git is initialized,  
Then the repo uses the `main` branch and shows trackable source files.

#### Test Notes
Initialized Git locally and renamed the default branch to `main`.

### Story: GitHub Remote
As a maintainer,  
I want the local repository connected to GitHub,  
So that the project can be pushed and hosted through the team repository.

#### Acceptance Criteria
Given the GitHub repository URL is provided,  
When `origin` is configured,  
Then `git remote -v` shows the expected fetch and push URL.

#### Test Notes
Configured `origin` as `https://github.com/BYuksel96/portfolio_website.git`. Remote branch lookup failed, likely because the repository is private, unavailable, or local credentials do not have access.

### Story: Reference Asset Hygiene
As a security-conscious development team,  
I want local inspiration screenshots excluded from Git,  
So that third-party reference material is not accidentally published.

#### Acceptance Criteria
Given `web_design/` contains reference screenshots,  
When Git status is checked,  
Then those files are ignored and not staged for commit.

#### Test Notes
Added `web_design/` to `.gitignore`.

## Sprint Review Summary
Initialized local Git, configured the requested GitHub remote, protected local reference screenshots from accidental publication, and documented that the remote still needs GitHub access/repo availability before push can complete.
