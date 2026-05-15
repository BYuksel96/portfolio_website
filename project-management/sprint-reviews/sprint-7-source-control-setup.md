# Sprint 7 Review: Source Control Setup

## Completed
- Initialized Git in the project root.
- Set the default branch to `main`.
- Configured `origin` as `https://github.com/BYuksel96/portfolio_website.git`.
- Ignored `web_design/` so local reference screenshots are not committed.
- Added source-control epic and memory notes.

## Stories Completed
- Local Git Repository
- GitHub Remote
- Reference Asset Hygiene

## Test Evidence
- `git remote -v` shows the expected GitHub remote.
- `git status --short` confirms source files are tracked candidates and ignored reference screenshots are not listed.
- Remote lookup failed with Git reporting it could not read the repository, so push depends on GitHub repo availability or credentials.

## Follow-Ups
- Confirm the GitHub repository exists and this machine has access.
- Push `main` after GitHub access is available.
