# Head Game Easter Egg Design

**Date:** 2026-09-23  
**Status:** Approved

## Overview

Add a hidden arcade game to the portfolio. The visitor opens it by minimizing the portfolio monitor, entering the novelty passcode `P3N15`, and starting the game from a dedicated menu. Restoring the minimized monitor exits the Easter egg from any state and returns the visitor to the Home composition.

The experience has five explicit states:

1. Portfolio
2. Passcode
3. Game Menu
4. Playing
5. Game Over

The passcode is a client-side novelty gate, not a security boundary.

## Portfolio-to-Easter-Egg Transition

The portfolio monitor replaces the three decorative window dots with one functional amber circular button containing the familiar horizontal minimize glyph. Its hover state uses a slightly darker amber. Activating it must safely finish or cancel any portfolio animation, make the full monitor inert, and animate the monitor into a Chrome-style tab fixed at the bottom-left of the viewport. The minimized tab displays the creator handle.

The tab remains visible throughout the passcode, game menu, gameplay, and game-over states. It is also the universal exit control. Activating it at any point must:

- Stop the game animation loop.
- Stop active timers and clear held input.
- Stop speech and synthesized sounds.
- Discard the current game session.
- Restore the full portfolio monitor.
- Return the portfolio to its Home composition.
- Restore focus to an appropriate portfolio control.

Every new minimize cycle starts at the passcode screen, even if the visitor previously entered the correct code. Only the high score persists between sessions.

## Passcode Screen

The passcode interface appears centered behind the monitor as the monitor shrinks into its tab. The centered label reads “Enter The Passcode”. Its rounded input should visually match the portfolio search bar, use the placeholder “Enter Code Here”, and include a visible animated caret. Focus moves to the input automatically when the transition completes.

The accepted passcode is `P3N15`. Validation trims surrounding whitespace and ignores letter case.

### Incorrect Passcode

An incorrect entry keeps the field available for another attempt and triggers a short response lasting approximately two seconds:

- A non-strobing red radial alarm pulse.
- A synthesized alarm sound, unless audio is muted.
- The wavy message: “Oooo GURRRLLL! You ain't saucy enough to enturrr!”

The response ends automatically. With reduced motion enabled, the visual effect must be softened and the wavy movement removed or substantially reduced while preserving clear error feedback.

### Correct Passcode

A correct entry transitions to the game menu. It does not persist authorization after the monitor is restored.

## Game Presentation

The game is rendered in a responsive canvas inside a rounded, black, misty arcade cabinet. The cabinet and canvas resize with the viewport and always leave enough space for the minimized creator tab at the bottom-left. The page must not gain unwanted document scrolling.

DOM elements are used for stateful interface and accessibility-sensitive controls, including the passcode form, menu, HUD, game-over controls, mute control, status announcements, and minimized tab. The canvas is responsible for real-time playfield rendering, sprites, player movement, collisions, and gameplay effects.

### Game Menu

The menu uses pixel typography and includes:

- The centered title “Head Game Strong”.
- The prompt “How good is your head game?”
- The persisted high score.
- A “Play Now!” action.

Decorative purple and gold sprites travel through unused background areas. Their paths must not cross or obscure menu copy or the play action.

## Gameplay Rules

Each run begins with:

- 60 seconds.
- A score of 0.
- Three unfilled life indicators.
- Baseline fall speed and spawn interval.

### Catching and Scoring

- Catching a purple sprite awards 1 point and adds 1 second.
- Catching a gold sprite awards 5 points and adds 5 seconds.
- On a catch, the head briefly switches from the open-mouth image to the closed-mouth image.
- The awarded score animates beside the head.
- The awarded time animates beside the timer.
- A short spoken “Yummy” plays unless audio is muted.

### Misses and Game Over

A sprite that passes the catch area without being caught counts as one miss. Each miss sequentially fills one of the three life indicators red and triggers a red edge pulse plus a brief cabinet shake. The third miss ends the run immediately.

The run also ends when the timer reaches zero. Game over stops active gameplay and presents the final score in the center, followed by the high score and a “Play Again” button. The score is compared with the stored high score when the run ends. The minimized creator tab remains available as the universal portfolio restore action.

### Spawn Scheduling and Difficulty

Each sprite spawns at a random horizontal position across the safe top width of the playfield, with enough margin to keep the complete sprite visible.

Purple is the standard spawn. At the start of a gold cycle, select a random integer from 5 through 10. After that many purple sprites have spawned, the next sprite is gold. Once gold spawns, select a new random purple count from 5 through 10 and repeat.

Difficulty advances by successful catch count, not by score. A gold catch therefore advances the curve by one catch rather than five score steps.

The progression is intentionally quick:

- Fall speed starts at 0.30 playfield heights per second and increases by 0.035 per successful catch. It reaches its hard cap of 0.65 playfield heights per second at the tenth catch.
- The spawn interval starts at 900 milliseconds and decreases by 45 milliseconds per successful catch. It reaches 450 milliseconds at the tenth catch, then continues decreasing to a hard floor of 270 milliseconds at the fourteenth catch.
- After the tenth catch, fall speed remains capped and additional pressure comes from denser spawning rather than objects becoming impossibly fast.
- At most ten falling sprites may be active simultaneously. If the cap is reached, the next spawn is delayed rather than exceeding it.

This makes the game feel reasonably fast by roughly ten caught sprites while preserving a playable movement window. Difficulty progression and gold scheduling are session-local and reset when a new run starts.

## Controls

The player head moves horizontally and remains within playfield bounds. Equivalent input must be available through:

- Left and Right arrow keys.
- Mouse movement over the game area.
- Touch dragging.

Held keyboard input must be cleared on blur, pause, state transitions, and restoration of the portfolio. Pointer and touch coordinates must be translated into current canvas coordinates after responsive resizing.

If the browser tab becomes hidden during a run, gameplay pauses so elapsed background time cannot unfairly consume the timer or create missed sprites. It resumes safely when the tab becomes visible again.

## Visual Assets

Assets live under `public/assets/easter-egg/` and include:

- A transparent purple game sprite with a white pixel outline.
- A transparent, highly veined gold variant with a white pixel outline.
- An open-mouth head placeholder.
- A closed-mouth head placeholder.

The two head placeholders must use identical dimensions and alignment so they can later be replaced with final photographs without changing collision or layout logic. Asset references should be centralized or otherwise obvious to replace.

## Audio

The experience includes:

- A short synthesized alarm for incorrect passcodes.
- A short spoken “Yummy” cue for catches.
- A visible mute control that affects both.

Audio begins only in response to user interaction as required by browser autoplay policies. Restoring the portfolio, ending a session, or otherwise leaving the relevant state stops active oscillators and speech. Repeated events must not leave overlapping or orphaned audio resources.

## Persistence

The high score persists in `localStorage`. Stored data must be parsed and validated as a finite, non-negative numeric score before use. If storage is unavailable, throws, or contains invalid data, the game continues with a session-only high score.

No passcode authorization or in-progress game state persists. Restoring and minimizing the monitor again always requires a fresh `P3N15` entry.

## Accessibility and Safety

- The portfolio monitor and Easter-egg layers alternate `inert` and `aria-hidden` according to which experience is active.
- Focus moves predictably to the passcode input, Play action, game-over action, and restored Home composition as states change.
- Keyboard controls do not trap focus or prevent use of the restore and mute controls.
- Essential status changes and game-over information are available outside canvas-only visuals through suitable DOM text or live announcements.
- The mute control has a persistent, readable state.
- Reduced-motion mode removes or softens monitor flight, cabinet shake, sprite decoration, wavy text, and bonus motion while retaining understandable feedback.
- Alarm and miss feedback use slow pulses and never rapid flashing.
- Color is not the only indicator of remaining lives, errors, muted state, or game over.
- Canvas dimensions and input mapping update responsively without stretching gameplay coordinates incorrectly.

## Runtime Cleanup

All paths out of gameplay must use shared cleanup behavior. Cleanup covers:

- `requestAnimationFrame` cancellation.
- Gameplay timer and timeout cancellation.
- Visibility, keyboard, pointer, touch, and resize listener cleanup as appropriate.
- Clearing held-key and pointer-drag state.
- Stopping speech synthesis and Web Audio oscillators.
- Removing temporary alarm, shake, pulse, and bonus states.
- Preventing callbacks from a discarded session from mutating a later state.

Starting a new run must begin from a clean state with no loops, listeners, sounds, entities, or timers carried over from the prior run.

## File Boundaries

The implementation is divided into three primary areas:

- `PortfolioMonitor.astro`: retains portfolio navigation and owns the amber minimize control plus a small coordination hook for minimizing and restoring.
- `EasterEgg.astro`: owns the minimized tab, passcode screen, menu, canvas host, HUD, game-over interface, accessibility announcements, and sound controls.
- `head-game.js`: owns deterministic game rules and state transitions for spawning, movement, collision, scoring, time, lives, difficulty, gold scheduling, and high-score decisions.

Game constants—including initial duration, rewards, life count, speed and interval progression, caps, gold range, and collision tolerance—must be centralized so behavior can be tuned without rewriting the engine.

Presentation should remain in the Astro component/styles, while rule calculations should remain in the game module wherever practical. Browser APIs such as storage, audio, focus, visibility, and animation-frame scheduling should be coordinated at the UI boundary rather than embedded throughout pure rule functions.

## Testing and Verification

Automated rule tests should cover:

- A purple catch awarding 1 point and 1 second.
- A gold catch awarding 5 points and 5 seconds.
- The first and second misses consuming lives without ending the game.
- The third miss ending the game.
- Timer expiration ending the game.
- Gold scheduling after an injected random count of 5 through 10 purple spawns and resetting the cycle afterward.
- Fall speed reaching 0.65 playfield heights per second at the tenth catch and never exceeding it.
- Spawn interval reaching 450 milliseconds at the tenth catch, reaching 270 milliseconds at the fourteenth catch, and never dropping below it.
- A gold catch advancing difficulty by one catch while still awarding five points.
- The ten-active-sprite cap delaying additional spawns.
- Random spawn positions remaining within the safe horizontal bounds.
- Collision behavior at inside, outside, and edge-touching boundaries.
- Valid high-score replacement and preservation.
- Invalid persisted scores falling back safely.

Integration and browser verification should cover:

- Minimizing the monitor from the portfolio and restoring it from the passcode, menu, playing, and game-over states.
- Requiring the passcode again after every restore-and-minimize cycle.
- Case-insensitive, whitespace-trimmed passcode acceptance.
- Incorrect-passcode feedback ending automatically and allowing immediate retry.
- Keyboard, mouse, and touch controls.
- Pausing and safe resumption on browser visibility changes.
- Cleanup of loops, timers, held input, speech, and synthesized sound on every exit path.
- High-score persistence and storage-failure fallback.
- Mute behavior for both alarm and catch audio.
- Reduced-motion behavior.
- Focus order, inert layers, accessible labels, and status announcements.
- Responsive canvas sizing, correct pointer mapping, bottom-left tab clearance, and absence of document scrolling across representative viewport sizes.

## Acceptance Criteria

The feature is complete when a visitor can minimize the portfolio, enter `P3N15`, play the fully responsive game with all approved scoring, timing, life, rarity, difficulty, control, audio, and accessibility behavior, and restore the portfolio safely from every state. Every restore requires a fresh passcode; only a validated high score survives. All resources are cleaned up, the experience respects reduced-motion and mute preferences, and the defined automated and browser checks pass.
