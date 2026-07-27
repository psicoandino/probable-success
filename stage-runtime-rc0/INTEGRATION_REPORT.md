# INTEGRATION REPORT — PSICOANDINO Stage Runtime RC0.1

## 1. Executive Summary

This report documents the architectural integration of **Stage Runtime RC0.1** (`stage-runtime-rc0/`). The integration materializes `stage-000` ("Demo Threshold"), loads all four declarative data specifications, resolves semantic tokens through Palette P2, renders the complete 12×10 map grid using 8×8 geometry glyphs, enforces movement and collision, executes dialogue sequences, and delegates interior exploration and combat directly to the preserved PSICOANDINO Story engine authority.

Version **RC0.1** introduces `window.PSICOANDINO_STORY_ADAPTER` to eliminate the script-scoped variable lookup freeze at dungeon entry, establishing a clean transactional bridge between Stage Runtime and preserved Story engine authority.

---

## 2. Data Acquisition & Specifications

Stage Runtime RC0.1 loads and consumes four primary declarative contracts from `stage-runtime-rc0/data/`:

1. **`stage-000.json`**: Stage Package schema v0.1. Defines the 12×10 static map grid, initial spawn at `(1, 1)` facing `right`, terrain cells (`wall`, `walkable`, `path`, `cave_entrance`), entities (`npc-strange-being` at `(5, 1)`, `marker-cave` at `(9, 7)`), interactive triggers (`trg-intro`, `trg-cave-entry`, `trg-outro`), and return point `ret-from-cave` at `(5, 6)`.
2. **`dialogues.json`**: Narrative sequence specification containing `dialogue-intro` (3 lines spoken by "Ser extraño") and `dialogue-outro` (3 lines spoken by "Ser extraño").
3. **`geometry-package.json`**: Geometry Package schema v0.2. Stores 8×8 matrices of semantic tokens (`oled`, `hueso`, `cobre`, `musgo`, `mostaza`, `sangre`, `amatista`, `null`).
4. **`stage-visual-bindings.json`**: Visual Bindings schema v0.1. Maps stage cell types (`walkable`, `wall`, `path`, `cave_entrance`) and entity types (`player`, `strange_being`, `cave_marker`, `encountered_creature`, `battle_creature`) to specific layer, slot, and subslot indices in `geometry-package.json`.

---

## 3. Visual Pipeline & Palette P2 Resolution

Every visible map cell is rendered through an explicit 6-step resolution chain:

```text
stage semantic type (e.g., "wall")
  → STAGE_VISUAL_BINDINGS (terrain.wall -> layer: "terrain", slot: 1, subslot: 0)
  → geometry-package glyph matrix (8×8 token array)
  → palette resolver (P2 -> hex mapping)
  → HTML5 Canvas context
  → visible 48×48 px glyph on 576×480 px stage
```

### Palette P2 Token Mapping
- `oled`: `#000000` (OLED black background)
- `hueso`: `#f5f3ec` (Bone highlight)
- `cobre`: `#248692` (Copper primary accent)
- `musgo`: `#6d7c50` (Moss terrain accent)
- `mostaza`: `#b78627` (Mustard path & player highlight)
- `sangre`: `#c73a4a` (Sangre danger indicator)
- `amatista`: `#7b4f9d` (Amethyst cave portal frame)
- `null`: Transparent

Glyphs are rendered onto HTML5 Canvas with `imageSmoothingEnabled = false` and CSS `image-rendering: pixelated; crisp-edges;`, guaranteeing nearest-neighbor pixel rendering without antialiasing artifacts.

---

## 4. Controls, Movement & Collision

- **Movement Controls**: WASD and Arrow keys.
- **Facing Orientation**: Moves update player `facing` direction (`up`, `down`, `left`, `right`).
- **Collision Rules**:
  - `isBlocked(x, y)` checks grid boundary bounds (`0 <= x < 12`, `0 <= y < 10`).
  - Checks terrain cell solidity (`terrainCell.solid === true`). Wall cells block movement.
  - Checks entity cell solidity (`entity.solid === true`). `npc-strange-being` at `(5, 1)` blocks movement.
- **Interaction Rules**:
  - Triggered by `E` or `Enter`.
  - Requires Manhattan distance $= |px - ex| + |py - ey| = 1$.
  - Requires player `facing` orientation pointing directly towards target entity (e.g., player at `(4, 1)` facing `right` towards NPC at `(5, 1)`).
- **Movement Lock**: Player movement inputs are locked (`movementLocked = true`) whenever dialogue is open.

---

## 5. Declarative Condition & Action Engine

Condition evaluation uses standard JS comparison on `demoFlags`:
```json
{ "flag": "introDone", "equals": true }
```

Action execution evaluates explicit action objects:
- `start_dialogue`: Opens dialogue UI for specified `dialogueId`.
- `transition_to_dungeon`: Invokes `enterDungeon(targetDungeonId, returnPointId)`.
- `set_flag`: Updates `demoFlags[flag] = value`.

No `eval()` or `Function()` calls are used.

---

## 6. Adapter Boundary & Explicit State Bridge (RC0.1 Fix)

The integration of Dungeon Exploration and 3×6 Tactical Combat is governed by `window.PSICOANDINO_STORY_ADAPTER` and `app.js`.

### Explicit Bridge Definition (`story-engine.js`)
```javascript
let externalFloorCompleteHandler = null;

function stageAdapterStartDungeon(payload) {
  expedition = payload; // Sets internal script-scoped lexical variable
  show('story');
  renderStory();
}

function stageAdapterGetRuntimeState() {
  return { expedition, battle };
}

function stageAdapterSetFloorCompleteHandler(handler) {
  externalFloorCompleteHandler = handler;
}

window.PSICOANDINO_STORY_ADAPTER = {
  startDungeon: stageAdapterStartDungeon,
  getRuntimeState: stageAdapterGetRuntimeState,
  setFloorCompleteHandler: stageAdapterSetFloorCompleteHandler,
  generateFloor: generateFloor,
  show: show,
  renderStory: renderStory,
  completeFloor: completeFloor
};
```

### Transactional Transition (`app.js`)
1. Generates floor state via `adapter.generateFloor('seed-stage-000-root', 0)`.
2. Calls `adapter.setFloorCompleteHandler(...)` to handle floor 0 completion.
3. Invokes `adapter.startDungeon(payload)`.
4. Verifies `adapter.getRuntimeState().expedition` is non-null.
5. Hides `#stage-container` **ONLY** after successful activation.
6. Catches errors gracefully without unhandled exceptions or app freezes.

---

## 7. Reused Engine Authority Traceability

- **Preserved Source File**: `PSICOANDINO_STORY_v1.1-2.001_CRP_TESTER_RC/app/index.html`
- **Extracted Engine File**: `stage-runtime-rc0/story-engine.js` (lines 207–289)
- **Engine Mechanics Preserved**: Floor generation (`generateFloor`), dungeon movement (`moveStory`), encounter triggering, battle arena setup (`beginBattle`), real-time 3×6 player movement (`movePlayer`), laser firing (`fire`), enemy AI (`updateEnemy`), 10 cells/s laser physics (`updateLasers`), battle conclusion (`finishBattle`), and exit logic (`completeFloor`).

---

## 8. Vertical Slice Execution Flow

```text
Stage Runtime spawn (1, 1)
  → Move to (4, 1) facing right
  → Press E to interact with "npc-strange-being" at (5, 1)
  → Triggers dialogue-intro ("Has llegado al umbral...")
  → Complete dialogue → sets demoFlags.introDone = true
  → Move along path to cave entrance at (9, 7)
  → Step on (9, 7) → evaluates trg-cave-entry -> calls enterDungeon()
  → PSICOANDINO_STORY_ADAPTER.startDungeon() initializes lexical expedition
  → Preserved Story screen #story activated
  → Explore 100×100 procedural interior (Floor 0)
  → Move into enemy tile -> triggers beginBattle() -> 3×6 tactical arena
  → Defeat enemy -> finishBattle() returns to dungeon
  → Move to floor exit -> completeFloor() intercepted by externalFloorCompleteHandler
  → returnToStage("ret-from-cave") restores Stage Runtime at (5, 6) facing down
  → Step on (5, 6) -> evaluates trg-outro -> dialogue-outro
  → Complete dialogue -> sets demoFlags.demoComplete = true
  → Opens Demo Complete Modal (STAGE RETURNED / DEMO COMPLETE)
```
