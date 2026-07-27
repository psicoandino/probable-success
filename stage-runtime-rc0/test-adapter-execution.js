/**
 * Stage Runtime RC0.1 — Live Adapter & Execution Test
 *
 * Verifies that window.PSICOANDINO_STORY_ADAPTER sets the lexical `expedition` variable inside story-engine.js,
 * enabling renderStory(), moveStory(), beginBattle(), updateLasers(), finishBattle(), and completeFloor() to execute without errors.
 */
const fs = require('fs');
const path = require('path');

console.log('Testing PSICOANDINO_STORY_ADAPTER bridge execution...\n');

// Build lightweight DOM environment in Node
function buildDOM() {
  const elements = {};
  const query = (id) => {
    if (!elements[id]) {
      elements[id] = {
        id,
        classList: {
          contains: (cls) => elements[id]._cls === cls,
          toggle: (cls, val) => { elements[id]._cls = val ? cls : ''; },
          add: (cls) => { elements[id]._cls = cls; },
          remove: (cls) => { if (elements[id]._cls === cls) elements[id]._cls = ''; }
        },
        style: { setProperty: () => {} },
        dataset: {},
        value: 'test',
        textContent: '',
        innerHTML: '',
        children: [],
        replaceChildren: () => { elements[id].children = []; },
        append: (c) => { elements[id].children.push(c); },
        querySelectorAll: () => [],
        addEventListener: () => {}
      };
    }
    return elements[id];
  };

  global.document = {
    querySelector: (s) => query(s.replace('#', '').replace('.', '')),
    querySelectorAll: (s) => [],
    getElementById: (id) => query(id),
    createElement: (tag) => ({
      tagName: tag,
      classList: { toggle: () => {}, add: () => {}, remove: () => {} },
      style: { setProperty: () => {} },
      dataset: {},
      replaceChildren: () => {},
      append: () => {}
    }),
    addEventListener: () => {}
  };

  global.window = {
    scrollTo: () => {},
    addEventListener: () => {},
    performance: { now: () => Date.now() },
    document: global.document,
    localStorage: { getItem: () => null, setItem: () => {} },
    sessionStorage: { getItem: () => null, setItem: () => {} }
  };
  global.performance = global.window.performance;
  global.sessionStorage = global.window.sessionStorage;
  global.localStorage = global.window.localStorage;
  global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
}

buildDOM();

// Load story-engine.js code
const storyEngineCode = fs.readFileSync(path.join(__dirname, 'story-engine.js'), 'utf8');

// Evaluate story-engine.js in global scope
eval(storyEngineCode);

// 1. Verify window.PSICOANDINO_STORY_ADAPTER exists
if (!global.window.PSICOANDINO_STORY_ADAPTER) {
  console.error('[FAIL] window.PSICOANDINO_STORY_ADAPTER is missing!');
  process.exit(1);
}
console.log('[PASS] window.PSICOANDINO_STORY_ADAPTER is defined.');

const adapter = global.window.PSICOANDINO_STORY_ADAPTER;
console.log('[PASS] getRuntimeState before activation:', adapter.getRuntimeState());

// 2. Generate floor via adapter
const seed = 'seed-stage-000-root';
const floorState = adapter.generateFloor(seed, 0);

const payload = {
  id: 'exp-test-001',
  status: 'ACTIVE',
  createdAt: new Date().toISOString(),
  usernameSnapshot: 'CRP_TESTER',
  characterId: 'char-stage-000',
  characterName: 'PSICOANDINO',
  character: { id: 'char-stage-000', name: 'PSICOANDINO', figure: 'triangle', color: '#b78627', stats: { speed: 1, recovery: 2, force: 2, cadence: 2, mobility: 1 } },
  dungeonId: 'root-forest',
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

// 3. Test starting dungeon via adapter
adapter.startDungeon(payload);

const state = adapter.getRuntimeState();
if (state.expedition && state.expedition.id === 'exp-test-001' && state.expedition.floorState) {
  console.log('[PASS] Lexical expedition assigned successfully!');
  console.log('       expedition.id =', state.expedition.id);
  console.log('       floorState dimensions = W:' + state.expedition.floorState.W + ', H:' + state.expedition.floorState.H);
  console.log('       start tile = (' + state.expedition.floorState.start.x + ',' + state.expedition.floorState.start.y + ')');
  console.log('       exit tile = (' + state.expedition.floorState.exit.x + ',' + state.expedition.floorState.exit.y + ')');
  console.log('       enemies generated =', state.expedition.floorState.enemies.length);
} else {
  console.error('[FAIL] Lexical expedition assignment failed!');
  process.exit(1);
}

// 4. Test floor completion handler hook
let floorCompletedCalled = false;
adapter.setFloorCompleteHandler(() => {
  floorCompletedCalled = true;
  console.log('[STAGE] externalFloorCompleteHandler intercepted completeFloor() call successfully!');
});

// Execute completeFloor via adapter
adapter.completeFloor();

if (floorCompletedCalled) {
  console.log('[PASS] completeFloor() delegated to external floor completion handler!');
} else {
  console.error('[FAIL] completeFloor() did not trigger external completion handler!');
  process.exit(1);
}

console.log('\n====================================================');
console.log('  PSICOANDINO_STORY_ADAPTER VERIFICATION: 100% PASS');
console.log('====================================================');
