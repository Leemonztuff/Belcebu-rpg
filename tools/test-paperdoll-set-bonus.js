// Validation script for Paperdoll set bonus rendering logic and NPC decoupling
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

class MockImage {
    constructor() {
        this.src = '';
        this.complete = true;
        this.naturalWidth = 128;
        this.naturalHeight = 128;
    }
}

const sandbox = {
    console: console,
    Image: MockImage,
    document: {
        getElementById: () => null,
        querySelector: () => null,
        querySelectorAll: () => [],
        createElement: () => ({ appendChild: () => {}, classList: { add: () => {}, remove: () => {} }, style: {} }),
        head: { appendChild: () => {} },
        body: { appendChild: () => {}, insertAdjacentHTML: () => {} }
    },
    player: {
        equipment: {
            helm: null,
            body: null,
            mainhand: null,
            offhand: null,
            gloves: null,
            boots: null,
            belt: null,
            ring: null,
            ring2: null,
            amulet: null
        },
        equippedSets: {},
        str: 10, dex: 10, vit: 10, ene: 10,
        lvl: 1, points: 0, skillPoints: 0,
        hp: 100, maxHp: 100, mp: 50, maxMp: 50,
        x: 0, y: 0,
        resistances: { fire: 0, cold: 0, lightning: 0, poison: 0 },
        elementalDamage: { fire: 0, cold: 0, lightning: 0, poison: 0 },
        discoveredSetPieces: {}
    },
    RARITY: { COMMON: 0, MAGIC: 1, RARE: 2, CRAFTED: 3, UNIQUE: 4, SET: 5 },
    COLORS: { npc: '#fff', setGreen: '#00ff00' }
};

const context = vm.createContext(sandbox);

// Run items-data.js and set-items.js
vm.runInContext(fs.readFileSync('./src/data/items-data.js', 'utf8') + '; globalThis.BASE_ITEMS = BASE_ITEMS; globalThis.BASE_ARMOR_SPRITES = BASE_ARMOR_SPRITES;', context);
vm.runInContext(fs.readFileSync('./src/data/set-items.js', 'utf8') + '; globalThis.SET_ITEMS = SET_ITEMS; globalThis.SET_BODY_SPRITES = SET_BODY_SPRITES;', context);

// Extract PaperdollSystem, NPCSpriteSystem, calculateEquippedSets from game.js
const gameCode = fs.readFileSync('./src/core/game.js', 'utf8');

const pdStart = gameCode.indexOf('const PaperdollSystem = {');
const pdEnd = gameCode.indexOf('// ========== NPC Spritesheet System');
assert(pdStart !== -1 && pdEnd !== -1, "PaperdollSystem definition found");
const pdCode = gameCode.substring(pdStart, pdEnd).replace('const PaperdollSystem = {', 'globalThis.PaperdollSystem = {');
vm.runInContext(pdCode, context);

const npcStart = gameCode.indexOf('const NPCSpriteSystem = {');
const npcEnd = gameCode.indexOf('// ========== Dynamic Touch Joystick System');
assert(npcStart !== -1 && npcEnd !== -1, "NPCSpriteSystem definition found");
const npcCode = gameCode.substring(npcStart, npcEnd).replace('const NPCSpriteSystem = {', 'globalThis.NPCSpriteSystem = {');
vm.runInContext(npcCode, context);

const calcSetsMatch = gameCode.match(/function calculateEquippedSets\(\) \{[\s\S]*?\n\}/);
assert(calcSetsMatch, "calculateEquippedSets found");
vm.runInContext('globalThis.calculateEquippedSets = ' + calcSetsMatch[0], context);

console.log("=== RUNNING PAPERDOLL & SET BONUS AUDIT TESTS ===");

const { player, PaperdollSystem, NPCSpriteSystem, calculateEquippedSets, BASE_ITEMS, SET_ITEMS } = sandbox;

// 1. Initial State: No armor equipped
player.equipment = { helm: null, body: null, mainhand: null, offhand: null, gloves: null, boots: null, belt: null, ring: null, ring2: null, amulet: null };
PaperdollSystem.updateEquipmentBody(player.equipment.body);
assert.strictEqual(PaperdollSystem.currentBodyKey, 'default', "Test 1 Failed: Without armor, player should have 'default' body");
console.log("✓ Test 1 Passed: Unarmored player body defaults to 'default'");

// 2. Base non-set armor equipped
const clothArmor = BASE_ITEMS.find(i => i.name === 'Cloth Armor');
player.equipment.body = { ...clothArmor };
PaperdollSystem.updateEquipmentBody(player.equipment.body);
assert.strictEqual(PaperdollSystem.currentBodyKey, 'armor_Cloth Armor', "Test 2 Failed: Base armor should update body key");
console.log("✓ Test 2 Passed: Base armor (Cloth Armor) updates body spritesheet to 'armor_Cloth Armor'");

// 3. Conditional Logic: 1 piece of a Set equipped (the body armor itself)
const talBody = { ...SET_ITEMS['tals_set'].pieces.body, setId: 'tals_set' };
player.equipment.body = talBody;
calculateEquippedSets();
assert.strictEqual(player.equippedSets['tals_set'], 1, "Count for tals_set should be 1");
PaperdollSystem.updateEquipmentBody(player.equipment.body);
assert.notStrictEqual(PaperdollSystem.currentBodyKey, 'set_body_tals_set', "Test 3 Failed: 1 piece must NOT trigger set appearance");
assert.strictEqual(PaperdollSystem.currentBodyKey, 'default', "Test 3 Failed: 1 piece should fall back to default body");
console.log("✓ Test 3 Passed: 1 piece of set armor does NOT activate set bonus appearance");

// 4. Conditional Logic: 2 pieces of a Set equipped (body + helm)
const talHelm = { ...SET_ITEMS['tals_set'].pieces.helm, setId: 'tals_set' };
player.equipment.helm = talHelm;
calculateEquippedSets();
assert.strictEqual(player.equippedSets['tals_set'], 2, "Count for tals_set should be 2");
PaperdollSystem.updateEquipmentBody(player.equipment.body);
assert.strictEqual(PaperdollSystem.currentBodyKey, 'set_body_tals_set', "Test 4 Failed: 2 pieces of set must activate set appearance");
console.log("✓ Test 4 Passed: 2 pieces of set armor successfully activates 'set_body_tals_set'");

// 5. Conditional Logic: 2 pieces of a Set equipped WITHOUT body (helm + amulet)
player.equipment.body = null;
const talAmulet = { ...SET_ITEMS['tals_set'].pieces.amulet, setId: 'tals_set' };
player.equipment.amulet = talAmulet;
calculateEquippedSets();
assert.strictEqual(player.equippedSets['tals_set'], 2, "Count for tals_set should be 2");
PaperdollSystem.updateEquipmentBody(player.equipment.body);
assert.strictEqual(PaperdollSystem.currentBodyKey, 'set_body_tals_set', "Test 5 Failed: 2 pieces of set without body must activate set appearance");
console.log("✓ Test 5 Passed: 2 pieces of set without body armor activates set bonus appearance");

// 6. Unequip down to 1 piece
player.equipment.amulet = null;
calculateEquippedSets();
assert.strictEqual(player.equippedSets['tals_set'], 1, "Count for tals_set should be 1");
PaperdollSystem.updateEquipmentBody(player.equipment.body);
assert.strictEqual(PaperdollSystem.currentBodyKey, 'default', "Test 6 Failed: Unequipping to 1 piece must revoke set appearance");
console.log("✓ Test 6 Passed: Unequipping to < 2 pieces immediately revokes set appearance");

// 7. Multiple Sets equipped: 3 pieces of Tal Rasha vs 2 pieces of Immortal King
player.equipment.helm = talHelm;
player.equipment.amulet = talAmulet;
player.equipment.gloves = { ...SET_ITEMS['tals_set'].pieces.gloves, setId: 'tals_set' }; // 3 tals
player.equipment.boots = { ...SET_ITEMS['immortal_king'].pieces.boots, setId: 'immortal_king' };
player.equipment.belt = { ...SET_ITEMS['immortal_king'].pieces.belt, setId: 'immortal_king' }; // 2 IK
calculateEquippedSets();
assert.strictEqual(player.equippedSets['tals_set'], 3);
assert.strictEqual(player.equippedSets['immortal_king'], 2);
PaperdollSystem.updateEquipmentBody(player.equipment.body);
assert.strictEqual(PaperdollSystem.currentBodyKey, 'set_body_tals_set', "Test 7 Failed: Set with higher count (3 > 2) should win");
console.log("✓ Test 7 Passed: Set with higher count takes precedence");

// 8. Multiple Sets with tie (2 vs 2): Body slot belongs to Immortal King
player.equipment.gloves = null; // now tals_set has 2
const ikBody = { ...SET_ITEMS['immortal_king'].pieces.body, setId: 'immortal_king' };
player.equipment.body = ikBody;
player.equipment.boots = null; // IK has belt, body = 2
calculateEquippedSets();
assert.strictEqual(player.equippedSets['tals_set'], 2);
assert.strictEqual(player.equippedSets['immortal_king'], 2);
PaperdollSystem.updateEquipmentBody(player.equipment.body);
assert.strictEqual(PaperdollSystem.currentBodyKey, 'set_body_immortal_king', "Test 8 Failed: Tie-breaker with equipped chest piece should win");
console.log("✓ Test 8 Passed: Tie-breaker with equipped body armor chooses matching set");

// 9. NPC Decoupling Audit:
const testNpcs = [
    { type: 'merchant', spriteSheet: 'public/spritesheets/Npc-00.webp', headSheet: 'public/players/Jobs/hair01_head_spritesheet.png' },
    { type: 'healer', spriteSheet: 'public/spritesheets/Npc-01.webp', headSheet: 'public/players/Jobs/hair06_head_spritesheet.png' },
    { type: 'stash', spriteSheet: 'public/spritesheets/Npc-02.webp', headSheet: 'public/players/Jobs/hair02_head_spritesheet.png' },
    { type: 'blacksmith', spriteSheet: 'public/spritesheets/Npc-03.webp', headSheet: 'public/players/Jobs/hair03_head_spritesheet.png' },
    { type: 'difficulty', spriteSheet: 'public/spritesheets/Npc-04.webp', headSheet: 'public/players/Jobs/hair04_head_spritesheet.png' },
    { type: 'respec', spriteSheet: 'public/spritesheets/Npc-05.webp', headSheet: 'public/players/Jobs/hair05_head_spritesheet.png' }
];

testNpcs.forEach((npc, idx) => {
    const sprite = NPCSpriteSystem.getSprite(npc, idx);
    assert(sprite.body, `NPC ${npc.type} must have a body`);
    assert(sprite.head, `NPC ${npc.type} must have a head`);
    assert(sprite.body.src.includes(`Npc-0${idx}`), `NPC ${npc.type} body must be Npc-0${idx}`);
});
console.log("✓ Test 9 Passed: All NPCs maintain independent bodies and heads, completely insulated from player equipment!");

console.log("\nALL 9 PAPERDOLL & SET BONUS TESTS PASSED PERFECTLY!");
