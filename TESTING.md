# Release verification

Tested October 28, 2026.

## Automated game-rule suite

**18 tests passed; 0 failed.** Run with `node --test tests/*.test.cjs` or `npm test`.

Coverage:

1. Map dimensions, boundaries, entrance, and exit.
2. Reachability of every collectible and interaction.
3. Mandatory gate, bridge, and trap chokepoints: blocking any of them disconnects the exit.
4. Wall collision and rejection of diagonal/multiple-tile movement.
5. Four cardinal directions.
6. Locked gate behavior, key pickup, key consumption, and permanent unlock.
7. Inactive bridge collision and adjacent-click switch activation.
8. Switch activation by movement; distant click rejection.
9. Unique gem collection and optional reward behavior.
10. Trap damage, checkpoint return, and discovery preservation.
11. Two active/two safe beat cycle; damage when a trap wakes under Pip.
12. Successful safe crossing without damage.
13. Three-hit defeat and ignored input after defeat.
14. Frozen movement/clock during pause; resume.
15. Ready and victory states ignore movement/clock input.
16. Complete legal playthrough with all six gems, three hearts, opened gate, activated bridge, and victory.
17. Fresh-state reset and independent state arrays.
18. Adjacent-tile clicks and distant-click guidance.

## Real browser playtest

Verified through the actual rendered interface:

- Start adventure shows the level and HUD.
- Keyboard movement, D-pad buttons, and adjacent tile clicking move the same character.
- Key pickup updates the next objective; entering the brass gate opens it.
- Three western reward detours and the upper branch update gem counts.
- Pause and help dialogs open, provide instructions, and return to gameplay.
- Clicking the switch from an adjacent tile activates the bridge and updates the objective.
- The active/safe trap appearance matches its HUD indicator. Waiting for mint, then moving across and off the trap succeeds.
- **Full browser run: victory, 6/6 gems, 3 hearts remaining, 98 moves.**
- Play again starts a fresh run. Restart shows confirmation and resets position, hearts, gems, key, bridge, and move count.
- Desktop layout checked at 1280 × 900; mobile layout checked at 390 × 844. The mobile page had no horizontal overflow and exposed the D-pad below the board.

## Limits

- Automated tests cover defeat and trap damage; the browser playthrough focused on a successful full run and did not intentionally exhaust all hearts.
- Responsive browser checks used viewport sizes, not a physical touchscreen device.
- Verification used the available Chromium-based in-app browser; Safari/Firefox and assistive-technology sessions were not separately tested.
- No persistence, online service, or multiplayer is included in the first release.
