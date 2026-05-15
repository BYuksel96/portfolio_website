# Sprint 5 Review: Security Hardening

## Completed
- Investigated npm audit findings instead of ignoring moderate advisories.
- Applied npm's required Astro security upgrade to `^6.3.3`.
- Updated `@astrojs/check` to `^0.9.9`.
- Added npm overrides for patched YAML tooling:
  - `volar-service-yaml@0.0.71`
  - `yaml-language-server@1.23.0`
- Added README security-check guidance.

## Stories Completed
- Dependency Audit
- Security Upgrade
- Regression Verification

## Test Evidence
- `npm.cmd audit` passed with 0 vulnerabilities.
- `npm.cmd run check` passed with 0 errors, 0 warnings, and 0 hints.
- `npm.cmd run build` passed and generated the static site in `dist/`.

## Follow-Ups
- Revisit npm overrides after future Astro checker updates; remove them only if audit stays clean.
- Run audit before every deployment and after every dependency change.
