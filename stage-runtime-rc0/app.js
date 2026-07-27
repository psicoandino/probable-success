/**
 * PSICOANDINO STAGE RUNTIME RC0.1 — MAIN APPLICATION MODULE
 *
 * Implements the minimal executable Stage Runtime architecture for stage-000
 * and explicit PSICOANDINO_STORY_ADAPTER state bridge.
 */
'use strict';

// GLOBAL RUNTIME STATE
let stageData = null;
let geometryPackage = null;
let visualBindings = null;
let dialoguesData = null;

let player = { x: 1, y: 1, facing: 'right' };
let demoFlags = {
  introDone: false,
  returnedFromDungeon: false,
  outroDone: false,
  demoComplete: false
};

let activeRuntime = 'stage'; // 'stage' | 'dungeon' | 'battle'
let movementLocked = false;

let activeDialogue = null;
let activeDialogueIndex = 0;
let currentDialogueTrigger = null;
let activeReturnPointId = 'ret-from-cave';

const DEFAULT_P2_PALETTE = {
  oled: '#000000',
  hueso: '#f5f3ec',
  cobre: '#248692',
  musgo: '#6d7c50',
  mostaza: '#b78627',
  sangre: '#c73a4a',
  amatista: '#7b4f9d'
};

// DATA EMBEDDED FALLBACKS FOR OFFLINE / FILE:// PROTOCOL COMPATIBILITY
const EMBEDDED_DATA = {
  stage: {
    packageFormat: "PSICOANDINO_STAGE_PACKAGE",
    packageFormatVersion: "0.1",
    stage: { id: "stage-000", name: "Demo Threshold", width: 12, height: 10, spawn: { x: 1, y: 1, facing: "right" } },
    terrain: [
      { x: 0, y: 0, type: "wall", solid: true }, { x: 1, y: 0, type: "wall", solid: true }, { x: 2, y: 0, type: "wall", solid: true }, { x: 3, y: 0, type: "wall", solid: true }, { x: 4, y: 0, type: "wall", solid: true }, { x: 5, y: 0, type: "wall", solid: true }, { x: 6, y: 0, type: "wall", solid: true }, { x: 7, y: 0, type: "wall", solid: true }, { x: 8, y: 0, type: "wall", solid: true }, { x: 9, y: 0, type: "wall", solid: true }, { x: 10, y: 0, type: "wall", solid: true }, { x: 11, y: 0, type: "wall", solid: true },
      { x: 0, y: 1, type: "wall", solid: true }, { x: 1, y: 1, type: "walkable", solid: false }, { x: 2, y: 1, type: "walkable", solid: false }, { x: 3, y: 1, type: "walkable", solid: false }, { x: 4, y: 1, type: "walkable", solid: false }, { x: 5, y: 1, type: "walkable", solid: false }, { x: 6, y: 1, type: "walkable", solid: false }, { x: 7, y: 1, type: "walkable", solid: false }, { x: 8, y: 1, type: "walkable", solid: false }, { x: 9, y: 1, type: "walkable", solid: false }, { x: 10, y: 1, type: "walkable", solid: false }, { x: 11, y: 1, type: "wall", solid: true },
      { x: 0, y: 2, type: "wall", solid: true }, { x: 1, y: 2, type: "walkable", solid: false }, { x: 2, y: 2, type: "walkable", solid: false }, { x: 3, y: 2, type: "walkable", solid: false }, { x: 4, y: 2, type: "path", solid: false }, { x: 5, y: 2, type: "path", solid: false }, { x: 6, y: 2, type: "path", solid: false }, { x: 7, y: 2, type: "walkable", solid: false }, { x: 8, y: 2, type: "walkable", solid: false }, { x: 9, y: 2, type: "walkable", solid: false }, { x: 10, y: 2, type: "walkable", solid: false }, { x: 11, y: 2, type: "wall", solid: true },
      { x: 0, y: 3, type: "wall", solid: true }, { x: 1, y: 3, type: "walkable", solid: false }, { x: 2, y: 3, type: "walkable", solid: false }, { x: 3, y: 3, type: "walkable", solid: false }, { x: 4, y: 3, type: "walkable", solid: false }, { x: 5, y: 3, type: "walkable", solid: false }, { x: 6, y: 3, type: "path", solid: false }, { x: 7, y: 3, type: "walkable", solid: false }, { x: 8, y: 3, type: "walkable", solid: false }, { x: 9, y: 3, type: "walkable", solid: false }, { x: 10, y: 3, type: "walkable", solid: false }, { x: 11, y: 3, type: "wall", solid: true },
      { x: 0, y: 4, type: "wall", solid: true }, { x: 1, y: 4, type: "walkable", solid: false }, { x: 2, y: 4, type: "walkable", solid: false }, { x: 3, y: 4, type: "walkable", solid: false }, { x: 4, y: 4, type: "walkable", solid: false }, { x: 5, y: 4, type: "walkable", solid: false }, { x: 6, y: 4, type: "path", solid: false }, { x: 7, y: 4, type: "path", solid: false }, { x: 8, y: 4, type: "path", solid: false }, { x: 9, y: 4, type: "walkable", solid: false }, { x: 10, y: 4, type: "walkable", solid: false }, { x: 11, y: 4, type: "wall", solid: true },
      { x: 0, y: 5, type: "wall", solid: true }, { x: 1, y: 5, type: "walkable", solid: false }, { x: 2, y: 5, type: "walkable", solid: false }, { x: 3, y: 5, type: "walkable", solid: false }, { x: 4, y: 5, type: "walkable", solid: false }, { x: 5, y: 5, type: "walkable", solid: false }, { x: 6, y: 5, type: "walkable", solid: false }, { x: 7, y: 5, type: "walkable", solid: false }, { x: 8, y: 5, type: "path", solid: false }, { x: 9, y: 5, type: "walkable", solid: false }, { x: 10, y: 5, type: "walkable", solid: false }, { x: 11, y: 5, type: "wall", solid: true },
      { x: 0, y: 6, type: "wall", solid: true }, { x: 1, y: 6, type: "walkable", solid: false }, { x: 2, y: 6, type: "walkable", solid: false }, { x: 3, y: 6, type: "walkable", solid: false }, { x: 4, y: 6, type: "walkable", solid: false }, { x: 5, y: 6, type: "walkable", solid: false }, { x: 6, y: 6, type: "walkable", solid: false }, { x: 7, y: 6, type: "walkable", solid: false }, { x: 8, y: 6, type: "path", solid: false }, { x: 9, y: 6, type: "walkable", solid: false }, { x: 10, y: 6, type: "walkable", solid: false }, { x: 11, y: 6, type: "wall", solid: true },
      { x: 0, y: 7, type: "wall", solid: true }, { x: 1, y: 7, type: "walkable", solid: false }, { x: 2, y: 7, type: "walkable", solid: false }, { x: 3, y: 7, type: "walkable", solid: false }, { x: 4, y: 7, type: "walkable", solid: false }, { x: 5, y: 7, type: "walkable", solid: false }, { x: 6, y: 7, type: "walkable", solid: false }, { x: 7, y: 7, type: "walkable", solid: false }, { x: 8, y: 7, type: "path", solid: false }, { x: 9, y: 7, type: "cave_entrance", solid: false }, { x: 10, y: 7, type: "walkable", solid: false }, { x: 11, y: 7, type: "wall", solid: true },
      { x: 0, y: 8, type: "wall", solid: true }, { x: 1, y: 8, type: "walkable", solid: false }, { x: 2, y: 8, type: "walkable", solid: false }, { x: 3, y: 8, type: "walkable", solid: false }, { x: 4, y: 8, type: "walkable", solid: false }, { x: 5, y: 8, type: "walkable", solid: false }, { x: 6, y: 8, type: "walkable", solid: false }, { x: 7, y: 8, type: "walkable", solid: false }, { x: 8, y: 8, type: "walkable", solid: false }, { x: 9, y: 8, type: "walkable", solid: false }, { x: 10, y: 8, type: "walkable", solid: false }, { x: 11, y: 8, type: "wall", solid: true },
      { x: 0, y: 9, type: "wall", solid: true }, { x: 1, y: 9, type: "wall", solid: true }, { x: 2, y: 9, type: "wall", solid: true }, { x: 3, y: 9, type: "wall", solid: true }, { x: 4, y: 9, type: "wall", solid: true }, { x: 5, y: 9, type: "wall", solid: true }, { x: 6, y: 9, type: "wall", solid: true }, { x: 7, y: 9, type: "wall", solid: true }, { x: 8, y: 9, type: "wall", solid: true }, { x: 9, y: 9, type: "wall", solid: true }, { x: 10, y: 9, type: "wall", solid: true }, { x: 11, y: 9, type: "wall", solid: true }
    ],
    entities: [
      { id: "npc-strange-being", name: "Ser extraño", type: "npc", x: 5, y: 1, facing: "down", solid: true, interaction: { type: "dialogue", dialogueId: "dialogue-intro" } },
      { id: "marker-cave", name: "Entrada a cueva", type: "marker", x: 9, y: 7, facing: "up", solid: false }
    ],
    triggers: [
      { id: "trg-intro", type: "interaction", targetEntityId: "npc-strange-being", conditions: [{ flag: "introDone", equals: false }], action: "start_dialogue", dialogueId: "dialogue-intro", onComplete: [{ action: "set_flag", flag: "introDone", value: true }] },
      { id: "trg-cave-entry", type: "step", x: 9, y: 7, conditions: [{ flag: "introDone", equals: true }], action: "transition_to_dungeon", targetDungeonId: "root-forest", returnPointId: "ret-from-cave" },
      { id: "trg-outro", type: "step", x: 5, y: 6, conditions: [{ flag: "returnedFromDungeon", equals: true }, { flag: "outroDone", equals: false }], action: "start_dialogue", dialogueId: "dialogue-outro", onComplete: [{ action: "set_flag", flag: "outroDone", value: true }, { action: "set_flag", flag: "demoComplete", value: true }] }
    ],
    returnPoints: [
      { id: "ret-from-cave", x: 5, y: 6, facing: "down" }
    ]
  },
  dialogues: {
    dialogues: [
      { id: "dialogue-intro", lines: [{ speaker: "Ser extraño", text: "Has llegado al umbral. La cueva aguarda más adelante." }, { speaker: "Ser extraño", text: "Dentro habita una presencia. Enfréntala y regresa con vida." }, { speaker: "Ser extraño", text: "Sigue el sendero marcado hasta la entrada." }] },
      { id: "dialogue-outro", lines: [{ speaker: "Ser extraño", text: "Has retornado de las profundidades de la cueva." }, { speaker: "Ser extraño", text: "El umbral ha sido recorrido con éxito." }, { speaker: "Ser extraño", text: "La prueba de esta vertical slice ha concluido." }] }
    ]
  },
  bindings: {
    bindingsVersion: "0.1",
    stageId: "stage-000",
    packageFormat: "PSICOANDINO_GEOMETRY_PACKAGE",
    packageFormatVersion: "0.2",
    terrain: {
      walkable: { layer: "terrain", slot: 0, subslot: 0, semanticName: "walkable" },
      wall: { layer: "terrain", slot: 1, subslot: 0, semanticName: "wall" },
      path: { layer: "terrain", slot: 2, subslot: 0, semanticName: "path" },
      cave_entrance: { layer: "terrain", slot: 3, subslot: 0, semanticName: "cave_entrance" }
    },
    entities: {
      player: { layer: "entity", slot: 0, subslot: 0, semanticName: "player" },
      strange_being: { layer: "entity", slot: 1, subslot: 0, semanticName: "strange_being" },
      cave_marker: { layer: "entity", slot: 2, subslot: 0, semanticName: "cave_marker" },
      encountered_creature: { layer: "entity", slot: 3, subslot: 0, semanticName: "encountered_creature" },
      battle_creature: { layer: "entity", slot: 4, subslot: 0, semanticName: "battle_creature" }
    }
  }
};

// 1. DATA LOADING FUNCTIONS
async function loadStagePackage() {
  try {
    const res = await fetch('data/stage-000.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    stageData = await res.json();
  } catch (err) {
    console.warn('Using embedded fallback for stage-000.json', err);
    stageData = EMBEDDED_DATA.stage;
  }
  return stageData;
}

async function loadGeometryPackage() {
  try {
    const res = await fetch('data/geometry-package.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    geometryPackage = await res.json();
  } catch (err) {
    console.warn('Using embedded fallback for geometry-package.json', err);
    geometryPackage = window.EMBEDDED_GEOMETRY || null;
  }
  return geometryPackage;
}

async function loadVisualBindings() {
  try {
    const res = await fetch('data/stage-visual-bindings.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    visualBindings = await res.json();
  } catch (err) {
    console.warn('Using embedded fallback for stage-visual-bindings.json', err);
    visualBindings = EMBEDDED_DATA.bindings;
  }
  return visualBindings;
}

async function loadDialogues() {
  try {
    const res = await fetch('data/dialogues.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    dialoguesData = await res.json();
  } catch (err) {
    console.warn('Using embedded fallback for dialogues.json', err);
    dialoguesData = EMBEDDED_DATA.dialogues;
  }
  return dialoguesData;
}

// 2. PALETTE AND GLYPH RESOLUTION
function resolvePalette(mode = 'p2') {
  if (mode === 'p2') return { ...DEFAULT_P2_PALETTE };
  return { ...DEFAULT_P2_PALETTE };
}

function resolveGlyph(layer, slot, subslot = 0) {
  if (!geometryPackage || !geometryPackage.geometry || !geometryPackage.geometry.glyphs) {
    return Array.from({ length: 8 }, () => Array(8).fill(null));
  }
  const bank = geometryPackage.geometry.glyphs[layer];
  if (bank && bank[slot] && bank[slot][subslot]) {
    return bank[slot][subslot];
  }
  return Array.from({ length: 8 }, () => Array(8).fill(null));
}

// 3. STAGE RENDERING PIPELINE
function renderGlyph(ctx, glyphMatrix, palette, dx, dy, scale) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const token = glyphMatrix[r][c];
      if (token !== null && token !== undefined) {
        const color = palette[token] || '#000000';
        ctx.fillStyle = color;
        ctx.fillRect(dx + c * scale, dy + r * scale, scale, scale);
      }
    }
  }
}

function renderStage() {
  const canvas = document.getElementById('stageCanvas');
  if (!canvas || !stageData || !visualBindings) return;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const scale = 6; // 8x8 glyphs scaled 6x = 48x48 px per cell (12x10 grid = 576x480)
  const palette = resolvePalette('p2');

  // Clear background
  ctx.fillStyle = palette.oled || '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Render Terrain Grid (12x10)
  for (let y = 0; y < stageData.stage.height; y++) {
    for (let x = 0; x < stageData.stage.width; x++) {
      const terrainCell = stageData.terrain.find(t => t.x === x && t.y === y);
      const cellType = terrainCell ? terrainCell.type : 'walkable';
      const binding = visualBindings.terrain[cellType] || visualBindings.terrain.walkable;
      const glyph = resolveGlyph(binding.layer, binding.slot, binding.subslot);

      renderGlyph(ctx, glyph, palette, x * 8 * scale, y * 8 * scale, scale);
    }
  }

  // Render Static Entities
  if (stageData.entities) {
    for (const entity of stageData.entities) {
      let key = entity.id;
      if (key === 'npc-strange-being') key = 'strange_being';
      if (key === 'marker-cave') key = 'cave_marker';
      const binding = visualBindings.entities[key];
      if (binding) {
        const glyph = resolveGlyph(binding.layer, binding.slot, binding.subslot);
        renderGlyph(ctx, glyph, palette, entity.x * 8 * scale, entity.y * 8 * scale, scale);
      }
    }
  }

  // Render Player Entity
  const playerBinding = visualBindings.entities.player || { layer: 'entity', slot: 0, subslot: 0 };
  const playerGlyph = resolveGlyph(playerBinding.layer, playerBinding.slot, playerBinding.subslot);
  renderGlyph(ctx, playerGlyph, palette, player.x * 8 * scale, player.y * 8 * scale, scale);

  updateHud();
}

function updateHud() {
  const posEl = document.getElementById('hudPos');
  const facingEl = document.getElementById('hudFacing');
  const introEl = document.getElementById('hudIntro');
  const retEl = document.getElementById('hudReturned');

  if (posEl) posEl.textContent = `(${player.x}, ${player.y})`;
  if (facingEl) facingEl.textContent = player.facing.toUpperCase();
  if (introEl) introEl.textContent = demoFlags.introDone ? 'COMPLETE' : 'PENDING';
  if (retEl) retEl.textContent = demoFlags.returnedFromDungeon ? 'YES' : 'NO';
}

// 4. MOVEMENT AND COLLISION SYSTEM
function isBlocked(x, y) {
  if (x < 0 || x >= stageData.stage.width || y < 0 || y >= stageData.stage.height) {
    return true;
  }
  const terrainCell = stageData.terrain.find(t => t.x === x && t.y === y);
  if (terrainCell && terrainCell.solid) {
    return true;
  }
  const entity = stageData.entities.find(e => e.x === x && e.y === y);
  if (entity && entity.solid) {
    return true;
  }
  return false;
}

function attemptMovement(dx, dy) {
  if (movementLocked || activeRuntime !== 'stage') return;

  // Update facing orientation
  if (dx === 1) player.facing = 'right';
  else if (dx === -1) player.facing = 'left';
  else if (dy === 1) player.facing = 'down';
  else if (dy === -1) player.facing = 'up';

  const nx = player.x + dx;
  const ny = player.y + dy;

  if (!isBlocked(nx, ny)) {
    player.x = nx;
    player.y = ny;
    checkStepTriggers(nx, ny);
  }
  renderStage();
}

function checkStepTriggers(x, y) {
  if (!stageData || !stageData.triggers) return;
  const triggers = stageData.triggers.filter(t => t.type === 'step' && t.x === x && t.y === y);
  for (const trg of triggers) {
    if (evaluateConditions(trg.conditions)) {
      executeAction(trg);
    }
  }
}

// 5. INTERACTION MECHANICS
function findInteractionTarget() {
  if (movementLocked || activeRuntime !== 'stage') return;

  let tx = player.x;
  let ty = player.y;
  if (player.facing === 'right') tx++;
  else if (player.facing === 'left') tx--;
  else if (player.facing === 'down') ty++;
  else if (player.facing === 'up') ty--;

  const entity = stageData.entities.find(e => e.x === tx && e.y === ty);
  if (entity) {
    // Proximity check: Manhattan distance = 1
    const dist = Math.abs(player.x - entity.x) + Math.abs(player.y - entity.y);
    if (dist === 1) {
      const trigger = stageData.triggers.find(t => t.type === 'interaction' && t.targetEntityId === entity.id);
      if (trigger && evaluateConditions(trigger.conditions)) {
        executeAction(trigger);
      }
    }
  }
}

// 6. DECLARATIVE CONDITION & ACTION ENGINE
function evaluateConditions(conditions) {
  if (!conditions || !Array.isArray(conditions)) return true;
  for (const cond of conditions) {
    const currentVal = demoFlags[cond.flag];
    if (currentVal !== cond.equals) {
      return false;
    }
  }
  return true;
}

function executeAction(actionObj) {
  if (!actionObj) return;

  if (actionObj.action === 'start_dialogue') {
    openDialogue(actionObj.dialogueId, actionObj);
  } else if (actionObj.action === 'transition_to_dungeon') {
    enterDungeon(actionObj.targetDungeonId, actionObj.returnPointId);
  } else if (actionObj.action === 'set_flag') {
    demoFlags[actionObj.flag] = actionObj.value;
    if (actionObj.flag === 'demoComplete' && actionObj.value === true) {
      completeDemo();
    }
  }
}

// 7. DIALOGUE SYSTEM
function openDialogue(dialogueId, trigger) {
  if (!dialoguesData || !dialoguesData.dialogues) return;
  const dialogue = dialoguesData.dialogues.find(d => d.id === dialogueId);
  if (!dialogue) return;

  activeDialogue = dialogue;
  activeDialogueIndex = 0;
  currentDialogueTrigger = trigger;
  movementLocked = true;

  const overlay = document.getElementById('dialogueOverlay');
  if (overlay) overlay.classList.remove('hidden');
  renderDialogueLine();
}

function renderDialogueLine() {
  if (!activeDialogue || !activeDialogue.lines[activeDialogueIndex]) return;
  const line = activeDialogue.lines[activeDialogueIndex];
  const speakerEl = document.getElementById('dialogueSpeaker');
  const textEl = document.getElementById('dialogueText');
  if (speakerEl) speakerEl.textContent = line.speaker;
  if (textEl) textEl.textContent = line.text;
}

function advanceDialogue() {
  if (!activeDialogue) return;
  activeDialogueIndex++;
  if (activeDialogueIndex < activeDialogue.lines.length) {
    renderDialogueLine();
  } else {
    // Dialogue completed!
    const overlay = document.getElementById('dialogueOverlay');
    if (overlay) overlay.classList.add('hidden');

    if (currentDialogueTrigger && currentDialogueTrigger.onComplete) {
      for (const act of currentDialogueTrigger.onComplete) {
        executeAction(act);
      }
    }

    activeDialogue = null;
    currentDialogueTrigger = null;
    movementLocked = false;
    renderStage();
  }
}

// 8. DUNGEON AND BATTLE INTEGRATION ADAPTER (TRANSACTIONAL STATE BRIDGE)
function enterDungeon(dungeonId, returnPointId) {
  console.log('[STAGE] enterDungeon:start');
  activeReturnPointId = returnPointId;

  try {
    const charStats = { speed: 1, recovery: 2, force: 2, cadence: 2, mobility: 1 };
    const seed = 'seed-stage-000-root';
    console.log('[STORY] generating floor with seed:', seed);

    const adapter = window.PSICOANDINO_STORY_ADAPTER;
    if (!adapter) {
      throw new Error('window.PSICOANDINO_STORY_ADAPTER is not available');
    }

    const genFn = adapter.generateFloor || window.generateFloor;
    if (typeof genFn !== 'function') {
      throw new Error('generateFloor function not found on Story authority');
    }

    const floorState = genFn(seed, 0);
    console.log('[STORY] floor generated successfully:', floorState ? `W=${floorState.W}, H=${floorState.H}` : 'null');

    const payload = {
      id: 'exp-' + Date.now(),
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      usernameSnapshot: 'CRP_TESTER',
      characterId: 'char-stage-000',
      characterName: 'PSICOANDINO',
      character: {
        id: 'char-stage-000',
        name: 'PSICOANDINO',
        figure: 'triangle',
        color: '#b78627',
        stats: charStats
      },
      dungeonId: dungeonId,
      dungeonName: 'ROOT FOREST',
      seed: seed,
      currentFloor: 0,
      completedFloors: 0,
      totalDurationSeconds: 0,
      totalSteps: 0,
      totalHitsReceived: 0,
      totalShots: 0,
      totalHitsDealt: 0,
      floors: [],
      floorState: floorState
    };
    console.log('[STAGE] payload prepared:', payload.id);

    // Set completion handler via adapter
    adapter.setFloorCompleteHandler(() => {
      returnToStage(activeReturnPointId || 'ret-from-cave');
    });

    // Start dungeon via adapter (assigns lexical expedition and calls show('story') and renderStory())
    adapter.startDungeon(payload);
    console.log('[STORY] story screen active & renderStory complete');

    // Verify state
    const runtimeState = adapter.getRuntimeState();
    console.log('[STORY] verified internal expedition:', runtimeState && runtimeState.expedition ? runtimeState.expedition.id : 'null');
    if (!runtimeState || !runtimeState.expedition) {
      throw new Error('Dungeon activation failed state verification');
    }

    // Transactional confirmation: hide stage container ONLY after successful activation
    activeRuntime = 'dungeon';
    const stageContainer = document.getElementById('stage-container');
    if (stageContainer) stageContainer.style.display = 'none';

    const badge = document.getElementById('runtimeStateBadge');
    if (badge) badge.textContent = 'DUNGEON ACTIVE';

  } catch (err) {
    console.error('[STAGE] enterDungeon:failed', err);
    activeRuntime = 'stage';
    const stageContainer = document.getElementById('stage-container');
    if (stageContainer) stageContainer.style.display = 'flex';
    const badge = document.getElementById('runtimeStateBadge');
    if (badge) badge.textContent = 'DUNGEON ERROR';
    alert('Dungeon activation error: ' + err.message);
  }
}

function returnToStage(returnPointId) {
  console.log('[STAGE] returnToStage:start', returnPointId);
  activeRuntime = 'stage';

  // Find return point coordinates in stageData
  const rp = stageData.returnPoints.find(r => r.id === returnPointId) || { x: 5, y: 6, facing: 'down' };
  player.x = rp.x;
  player.y = rp.y;
  player.facing = rp.facing;

  demoFlags.returnedFromDungeon = true;

  // Hide preserved screens
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

  // Show Stage Container
  const stageContainer = document.getElementById('stage-container');
  if (stageContainer) stageContainer.style.display = 'flex';

  const badge = document.getElementById('runtimeStateBadge');
  if (badge) badge.textContent = 'STAGE RETURNED';

  renderStage();

  // Trigger step check at return point (triggers trg-outro)
  checkStepTriggers(player.x, player.y);
}

function completeDemo() {
  console.log('[STAGE] completeDemo reached!');
  const modal = document.getElementById('demoCompleteModal');
  if (modal) modal.classList.remove('hidden');
  const badge = document.getElementById('runtimeStateBadge');
  if (badge) badge.textContent = 'DEMO COMPLETE';
}

// 9. CONTROLS AND EVENT LISTENERS
function initInputHandlers() {
  window.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();

    // Stage Runtime Controls
    if (activeRuntime === 'stage') {
      if (activeDialogue) {
        if (k === 'e' || k === 'enter' || k === ' ') {
          e.preventDefault();
          advanceDialogue();
        }
        return;
      }

      if (k === 'w' || k === 'arrowup') {
        e.preventDefault();
        attemptMovement(0, -1);
      } else if (k === 's' || k === 'arrowdown') {
        e.preventDefault();
        attemptMovement(0, 1);
      } else if (k === 'a' || k === 'arrowleft') {
        e.preventDefault();
        attemptMovement(-1, 0);
      } else if (k === 'd' || k === 'arrowright') {
        e.preventDefault();
        attemptMovement(1, 0);
      } else if (k === 'e' || k === 'enter') {
        e.preventDefault();
        findInteractionTarget();
      }
    }
  });

  const overlay = document.getElementById('dialogueOverlay');
  if (overlay) {
    overlay.addEventListener('click', () => {
      if (activeDialogue) advanceDialogue();
    });
  }
}

// 10. INITIALIZATION
async function initApp() {
  await Promise.all([
    loadStagePackage(),
    loadGeometryPackage(),
    loadVisualBindings(),
    loadDialogues()
  ]);

  if (stageData && stageData.stage && stageData.stage.spawn) {
    player.x = stageData.stage.spawn.x;
    player.y = stageData.stage.spawn.y;
    player.facing = stageData.stage.spawn.facing;
  }

  initInputHandlers();
  renderStage();
}

window.addEventListener('DOMContentLoaded', initApp);
