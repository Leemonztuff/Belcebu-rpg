// ========== 符文与镶嵌系统自动化测试 (Runes & Sockets Automated Tests) ==========
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert';

console.log('=== RUNNING RUNES AND SOCKETS SYSTEM REGRESSION TESTS ===');

// 1. 测试文件存在性与加载
const runesDataCode = fs.readFileSync('./runes-data.js', 'utf8');
const indexHtml = fs.readFileSync('./index.html', 'utf8');
const itemSystemCode = fs.readFileSync('./item-system.js', 'utf8');
const gameCode = fs.readFileSync('./game.js', 'utf8');
const styleCss = fs.readFileSync('./style.css', 'utf8');

// 2. 验证 index.html 引用
assert(indexHtml.includes('runes-data.js'), 'index.html must include runes-data.js');
console.log('✓ Test 1 Passed: index.html correctly includes runes-data.js');

// 3. 构建测试沙箱环境
const sandbox = {
    window: {},
    console: console,
    Math: Math,
    RARITY: { COMMON: 0, MAGIC: 1, RARE: 2, UNIQUE: 3, SET: 4 },
    BASE_ITEMS: [
        { name: '短剑', type: 'weapon', minDmg: 5, maxDmg: 10, rarity: 1 },
        { name: '布甲', type: 'armor', def: 10, rarity: 1 },
        { name: '皮帽', type: 'helm', def: 5, rarity: 1 }
    ],
    AFFIXES: { prefixes: [], suffixes: [] },
    calculateItemRequirements: () => ({ level: 1 }),
    player: {
        lvl: 10,
        str: 20,
        dex: 20,
        inventory: [],
        equipment: {},
        resistances: { fire: 0, cold: 0, lightning: 0, poison: 0 },
        elementalDamage: { fire: 0, cold: 0, lightning: 0, poison: 0 }
    }
};
sandbox.globalThis = sandbox;
sandbox.window = sandbox;

vm.createContext(sandbox);
vm.runInContext(runesDataCode, sandbox);

// 4. 验证 RUNES 和 RUNEWORDS 字典
assert(sandbox.RUNES && Object.keys(sandbox.RUNES).length >= 13, 'RUNES must contain at least 13 runes');
assert(sandbox.RUNEWORDS && Object.keys(sandbox.RUNEWORDS).length >= 6, 'RUNEWORDS must contain at least 6 recipes');
assert(sandbox.RUNES.el.weapon.attackRating === 25, 'Rune El weapon stat check');
assert(sandbox.RUNES.tal.armor.poisonRes === 30, 'Rune Tal armor stat check');
console.log('✓ Test 2 Passed: RUNES & RUNEWORDS dictionaries validated');

// 5. 验证创建符文物品
const runeTir = sandbox.createRuneItem('tir');
const runeEl = sandbox.createRuneItem('el');
assert(runeTir && runeTir.type === 'rune' && runeTir.runeKey === 'tir', 'createRuneItem(tir) failed');
assert(runeEl && runeEl.type === 'rune' && runeEl.runeKey === 'el', 'createRuneItem(el) failed');
console.log('✓ Test 3 Passed: createRuneItem generates valid rune objects');

// 6. 验证镶嵌与符文之语检测 (Steel: Tir + El in 2-socket weapon)
const testSword = {
    id: 'test_sword_1',
    name: '短剑',
    displayName: '短剑',
    type: 'weapon',
    slot: 'mainhand',
    rarity: 1,
    sockets: 2,
    socketedRunes: [],
    stats: {}
};

assert(sandbox.canItemAcceptRune(testSword, runeTir) === true, 'Sword should accept Rune Tir');
const res1 = sandbox.socketRuneIntoItem(testSword, runeTir);
assert(res1.success === true && testSword.socketedRunes.length === 1, 'First socketing must succeed');
assert(res1.runewordCompleted === false, '1/2 sockets must not complete runeword yet');

assert(sandbox.canItemAcceptRune(testSword, runeEl) === true, 'Sword should accept Rune El');
const res2 = sandbox.socketRuneIntoItem(testSword, runeEl);
assert(res2.success === true && testSword.socketedRunes.length === 2, 'Second socketing must succeed');
assert(res2.runewordCompleted === true, 'Tir + El must trigger Steel Runeword');
assert(testSword.isRuneword === true && testSword.runewordId === 'steel', 'Sword must have isRuneword=true and runewordId=steel');
console.log('✓ Test 4 Passed: Socketing sequence activates [Steel] runeword correctly');

// 7. 验证属性计算
const stats = sandbox.getSocketAndRunewordStats(testSword);
assert(stats.dmgPct === 25, 'Steel Runeword +25% dmgPct');
assert(stats.attackSpeed === 20, 'Steel Runeword +20% attackSpeed');
assert(stats.attackRating === 75, 'AttackRating = 50 from Steel + 25 from El');
assert(stats.mpRegen === 5, 'mpRegen = 5 from Tir');
console.log('✓ Test 5 Passed: getSocketAndRunewordStats accurately computes total composite stats');

// 8. 验证样式与死亡保护愤怒Buff逻辑
assert(styleCss.includes('.slot-sockets-bar') && styleCss.includes('.socket-pip'), 'style.css must have socket bar styles');
assert(gameCode.includes('player.rageBonus') && gameCode.includes('💢'), 'game.js must implement death protection rageBonus');
console.log('✓ Test 6 Passed: style.css and death protection integration verified');

console.log('ALL RUNES AND SOCKETS REGRESSION TESTS PASSED PERFECTLY!');
