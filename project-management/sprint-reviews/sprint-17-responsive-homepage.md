# Sprint 17 Review: Responsive Homepage

## Completed
- Added a mobile-only top-right AirDrop notification aligned near the creator handle.
- Changed the mobile AirDrop open animation so the card expands from the notification position.
- Fixed the mobile AirDrop card stretch by unsetting the inherited desktop bottom position.
- Replaced the notification dot shadow with a three-layer blue indicator: solid centre, lighter middle ring, and pale outer ring with sequential pulsing.
- Added a yellow minimise button on the mobile AirDrop card.
- Prevented hidden mobile AirDrop card content from remaining keyboard-focusable while minimised.
- Compacted tablet AirDrop sizing and spacing.
- Added narrow desktop and low-height desktop hero rules to reduce title/folder/AirDrop collisions.
- Tightened mobile folder sizing, hero title sizing, and search centering.

## Stories Completed
- Compact AirDrop Card
- Mobile AirDrop Notification
- Narrow Desktop Folder Repositioning
- Mobile Hero Flow

## Test Evidence
- `npm.cmd audit` passed with 0 vulnerabilities.
- `npm.cmd run check` passed with 0 errors, 0 warnings, and 0 hints.
- `npm.cmd run build` passed and generated the static site in `dist/`.

## Follow-Ups
- Run a manual visual pass in browser at common widths: 390px, 430px, 768px, 1024px, 1200px, and a short-height laptop viewport.
