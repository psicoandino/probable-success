# PSICOANDINO — Stage Runtime RC0 Release

## Overview

`stage-runtime-rc0` is the minimal executable **Stage Runtime** release for PSICOANDINO. It materializes `stage-000` ("Demo Threshold"), loads `dialogues.json`, `geometry-package.json`, and `stage-visual-bindings.json`, resolves semantic tokens through Palette P2, renders the complete 12×10 grid stage and entities using 8×8 nearest-neighbor geometry glyphs, enforces terrain and entity collision, handles intro/outro dialogues, and integrates seamlessly with the preserved Dungeon Exploration Engine and 3×6 Tactical Battle Engine from the PSICOANDINO Story release.

---

## File Structure

```text
stage-runtime-rc0/
├── index.html                  # HTML5 container & preserved UI screens
├── styles.css                  # Stage Runtime & preserved Story stylesheets
├── app.js                      # Stage Runtime architecture & DungeonBattleAdapter
├── story-engine.js             # Preserved Story engine authority (L207-L289 byte-for-byte)
├── data/
│   ├── stage-000.json          # Stage map definition (12x10 grid, terrain, entities, triggers)
│   ├── dialogues.json          # Intro and outro dialogue sequences
│   ├── geometry-package.json   # 8x8 semantic token glyph matrices (v0.2)
│   └── stage-visual-bindings.json # Stage semantic type to geometry slot mappings
├── README.md                   # This specification & execution guide
├── INTEGRATION_REPORT.md       # Full architectural integration breakdown
└── VALIDATION_REPORT.md        # Comprehensive 20-item validation test report
```

---

## Runtime Architecture

The implementation strictly defines explicit functions for:

* `loadStagePackage()`: Loads `data/stage-000.json`.
* `loadGeometryPackage()`: Loads `data/geometry-package.json`.
* `loadVisualBindings()`: Loads `data/stage-visual-bindings.json`.
* `resolveGlyph(layer, slot, subslot)`: Retrieves 8×8 token matrix from Geometry Package.
* `resolvePalette(mode)`: Resolves semantic tokens (`oled`, `hueso`, `cobre`, `musgo`, `mostaza`, `sangre`, `amatista`) via Palette P2.
* `renderStage()`: Renders the complete 12×10 grid stage on HTML5 Canvas.
* `renderGlyph(ctx, glyphMatrix, palette, dx, dy, scale)`: Rasterizes 8×8 token glyphs using nearest-neighbor scaling.
* `attemptMovement(dx, dy)`: Handles grid movement and updates facing orientation.
* `isBlocked(x, y)`: Enforces terrain wall and solid entity collision.
* `findInteractionTarget()`: Verifies Manhattan distance = 1 and facing orientation before firing interaction triggers.
* `evaluateConditions(conditions)`: Declarative evaluator for `[{ "flag": "flagName", "equals": boolean }]`.
* `executeAction(actionObj)`: Declarative action execution (`start_dialogue`, `transition_to_dungeon`, `set_flag`).
* `openDialogue(dialogueId, trigger)`: Displays dialogue UI and locks movement (`movementLocked: true`).
* `advanceDialogue()`: Advances dialogue lines and executes `onComplete` actions.
* `enterDungeon(dungeonId, returnPointId)`: Activates the preserved Dungeon Exploration Engine.
* `returnToStage(returnPointId)`: Restores Stage Runtime and places player at return point `(5, 6)`.
* `completeDemo()`: Displays final Demo Complete state upon vertical slice completion.

---

## Controls

* **Movement**: WASD / Arrow keys
* **Interact / Talk**: Key `E` / Key `Enter`
* **Advance Dialogue**: Key `E` / Key `Enter` / Spacebar

---

## Reused Engine Authority & Traceability

No Dungeon or Battle mechanics have been rewritten or duplicated in `app.js`.

- **Preserved Engine File**: `stage-runtime-rc0/story-engine.js`
- **Source File**: `PSICOANDINO_STORY_v1.1-2.001_CRP_TESTER_RC/app/index.html`
- **Source Line Range**: Lines 207–289 (83 lines)
- **SHA256 Checksum**: `cdce6848e39cc7e30b67c7aa26ded9a4a82fbb2385fc868523568bac0fa32656`

---

## How to Run

1. **Local Browser**: Double click `index.html` or open directly in any web browser via `file://`.
2. **Local HTTP Server**:
   ```bash
   npx serve stage-runtime-rc0
   ```
