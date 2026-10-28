# MazeQuest Mini — first playable release

## Product goal
Give casual players a complete 3–8 minute top-down puzzle adventure in one browser tab. The player guides Pip, a lantern-bearing explorer, from the entrance to the Sun Gate by finding a key, opening a locked gate, activating a bridge, and crossing a pulsing trap. Optional gems reward detours.

## Audience and experience
Keyboard and touch users who enjoy readable, low-pressure exploration. Warm parchment, midnight-green ruins, mint pathways, and gold rewards distinguish the interface from a generic game prototype. All graphics are original code-drawn shapes; no remote assets, accounts, or tracking.

## Release scope

| Feature | Acceptance criteria |
|---|---|
| One maze | A fixed 19 × 15 tile level has a labeled start, one exit, connected corridors, dead-end reward branches, and an achievable solution. |
| One character | Pip moves one tile at a time up/down/left/right with arrows, WASD, on-screen buttons, or clicking an adjacent tile. |
| Collision | Walls and an inactive bridge block movement without changing position. Diagonal moves are never allowed. |
| Puzzle 1: key gate | A side branch holds one brass key. The gate blocks passage until the key is collected; entering the gate consumes the key and permanently opens it. |
| Puzzle 2: switch bridge | A switch activates a bridge. Entering the switch or clicking it while adjacent activates it permanently. The switch must be reached before crossing the bridge. |
| Puzzle 3: pulse trap | A required trap cycles between two active and two safe one-second beats. Active entry or an active beat while standing on the trap costs one heart and returns Pip to the entrance. Inventory and solved puzzles persist. |
| Exploration rewards | Six optional gems disappear when collected, increment the HUD counter, and contribute to the final result. Gems are not required to exit. |
| States and UI | Clickable title/start screen, gameplay HUD, instructions, pause/resume, restart confirmation, victory screen, and defeat/retry screen. Three hearts; no automatic movement after pause or completion. |
| Guidance | Show the next objective, explicit feedback for blocked moves/interactions, a legend, trap phase, and an optional progressive hint. |
| Responsive controls | The board fits narrow viewports and the D-pad remains available. Keyboard focus is visible; buttons have accessible names; feedback uses an aria-live region. |
| Local operation | Run by opening index.html or using a static server. No installation or network is required for play. No saved personal data or online requests. |

## User flow
Title → Start adventure → Explore and collect the key → Unlock gate → Find switch → Cross bridge → Time trap crossing → Reach exit → Review rewards and replay. Instructions and pause suspend the trap clock; restart returns all progress to the initial state after confirmation.

## Rules and implementation decisions
- Map and game state live in a standalone JavaScript engine; the view renders state without modifying rules.
- Clock advances only during active play. The visible trap indicator and tile use the same engine phase.
- Clicks on distant tiles do not pathfind; feedback explains that only adjacent tiles are reachable.
- A failed trap attempt keeps puzzle progress and collected gems, reducing repetitive backtracking.
- The exit requires all three mandatory obstacles to be traversable by topology. A route search must prove that blocking any of the gate, bridge, or trap disconnects the exit.
- First release is a single local session. Reloading begins a new game. No save slots, backend, enemies, combat, sound, procedural generation, or multiplayer.

## Design references
Original pre-implementation SVG mockups in `design/`: `01-title.svg`, `02-level.svg`. The first captures the title/start interaction; the second defines the maze/HUD/control composition. The final interface should preserve their palette, card hierarchy, and clear calls to action while allowing implementation refinements.

## Validation and release checklist
- Automated engine tests: map dimensions and connectivity, required obstacle chokepoints, wall collision, key consumption, switch activation, bridge collision, trap phase/damage, defeat, victory, gem uniqueness, reset, terminal-state protection, and a complete route through the level.
- Browser check: start, movement via keyboard and clickable controls, instructions/pause, collision feedback, restart, full victory flow, and narrow-screen layout.
- Repository includes runnable source, PRD, original UI mockups, setup/control instructions, testing results, and automated CI.

## Success measure
A player can understand controls, solve all three obstacles, and reach a visible victory state without developer intervention. All mandatory features above are included; test limitations are disclosed in TESTING.md.
