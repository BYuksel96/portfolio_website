# EPIC-05: Security Hardening

## Epic Goal
Remove known dependency vulnerabilities and document the security posture so the project operates with security as a core team concern.

## Status
Done

## Sprint
Sprint 5

## Stories

### Story: Dependency Audit
As a security-conscious development team,  
I want dependency advisories inspected,  
So that we understand the risk before changing packages.

#### Acceptance Criteria
Given dependencies are installed,  
When `npm.cmd audit` is run with registry access,  
Then the team can see which packages are vulnerable and what fix path npm recommends.

#### Test Notes
Audit initially reported moderate advisories in Astro and YAML tooling.

### Story: Security Upgrade
As an engineer,  
I want vulnerable dependencies upgraded or overridden safely,  
So that the dependency tree reports zero known vulnerabilities.

#### Acceptance Criteria
Given npm recommends a breaking Astro upgrade,  
When the fix is applied,  
Then Astro is upgraded and the site still builds.

Given a vulnerable transitive YAML tool remains,  
When a patched override is added,  
Then `npm.cmd audit` reports zero vulnerabilities.

#### Test Notes
Upgraded Astro to `^6.3.3`, updated `@astrojs/check` to `^0.9.9`, and added overrides for `volar-service-yaml@0.0.71` and `yaml-language-server@1.23.0`.

### Story: Regression Verification
As a product owner,  
I want security fixes verified against the working site,  
So that hardening does not break the MVP experience.

#### Acceptance Criteria
Given dependency security fixes are complete,  
When checks run,  
Then audit, Astro check, and production build all pass.

#### Test Notes
Verified `npm.cmd audit`, `npm.cmd run check`, and `npm.cmd run build` all pass.

## Sprint Review Summary
Resolved all known npm audit vulnerabilities, accepted the Astro 6 upgrade, patched the remaining YAML tooling chain with npm overrides, and revalidated audit/check/build successfully.
