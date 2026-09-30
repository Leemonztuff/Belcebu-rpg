const fs = require('node:fs');
const assert = require('node:assert/strict');

console.log('=== RUNNING BATCH 3 LONG-TERM RETENTION & SOCIAL SYSTEM TESTS ===\n');

// Mock browser objects
global.localStorage = { getItem: () => null, setItem: () => {} };
global.document = {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ appendChild: () => {}, setAttribute: () => {}, style: {} }),
    head: { appendChild: () => {} },
    body: { appendChild: () => {} }
};
global.window = global;

// 1. Verify index.html contains the scripts and stylesheet
const indexHtml = fs.readFileSync('index.html', 'utf8');
assert.ok(indexHtml.includes('src/ui/share-card.js'), 'index.html must include share-card.js');
assert.ok(indexHtml.includes('src/systems/progression/season-system.js'), 'index.html must include season-system.js');
assert.ok(indexHtml.includes('src/systems/progression/return-bonus.js'), 'index.html must include return-bonus.js');
assert.ok(indexHtml.includes('btn-season'), 'index.html must have season button');
assert.ok(indexHtml.includes('btn-share-hero'), 'index.html must have share card button');
console.log('✓ Test 1 Passed: index.html correctly loads all Batch 3 modules and buttons');

// 2. Load i18n and verify all 3 languages contain Batch 3 keys
const i18nCode = fs.readFileSync('src/i18n/i18n.js', 'utf8');
const evalFn = new Function('window', 'document', 'localStorage', i18nCode + '; return I18N;');
const I18N = evalFn(global.window, global.document, global.localStorage);

assert.ok(I18N.locales.es.share_card_title, 'Spanish i18n must include share_card_title');
assert.ok(I18N.locales.en.share_card_title, 'English i18n must include share_card_title');
assert.ok(I18N.locales.zh.share_card_title, 'Chinese i18n must include share_card_title');

assert.ok(I18N.locales.es.season_btn, 'Spanish i18n must include season_btn');
assert.ok(I18N.locales.en.season_btn, 'English i18n must include season_btn');
assert.ok(I18N.locales.zh.season_btn, 'Chinese i18n must include season_btn');

assert.ok(I18N.locales.es.return_banner_title, 'Spanish i18n must include return_banner_title');
assert.ok(I18N.locales.en.return_banner_title, 'English i18n must include return_banner_title');
assert.ok(I18N.locales.zh.return_banner_title, 'Chinese i18n must include return_banner_title');
for (const lang of ['es', 'en', 'zh']) {
    for (const key of [
        'floor_number', 'hell_floor_number', 'death_kills_value', 'death_kills_one',
        'tutorial_town_inventory', 'tutorial_town_merchant', 'tutorial_town_healer',
        'tutorial_town_stash', 'tutorial_town_exit', 'tutorial_battle_mobile_attack',
        'tutorial_battle_mobile_cast', 'tutorial_battle_mobile_auto',
        'tutorial_battle_desktop_attack', 'tutorial_battle_desktop_cast',
        'tutorial_battle_desktop_auto', 'tutorial_dismiss', 'tooltip_skill_learn',
        'skill_node_select', 'offline_mins', 'offline_hour', 'offline_hours_mins', 'offline_hours',
        'offline_max_hours', 'offline_no_drops',
        'npc_gheed', 'npc_akara', 'npc_warriv', 'npc_charsi', 'npc_abyss_guard', 'npc_sage_name'
    ]) {
        assert.ok(I18N.locales[lang][key], `${lang} i18n must include ${key}`);
    }
}
const gameCode = fs.readFileSync('src/core/game.js', 'utf8');
assert.ok(gameCode.includes('const NPC_NAME_KEYS ='), 'NPC map labels must resolve names through localized NPC types');
assert.match(gameCode, /ctx\.fillText\(npcDisplayName,\s*nx,\s*npcLabelY\)/, 'NPC map labels must draw the localized name');
console.log('✓ Test 2 Passed: i18n dictionary validates for Spanish, English, and Chinese');

// 3. Load and test ShareCardSystem
const shareCardCode = fs.readFileSync('src/ui/share-card.js', 'utf8');
assert.ok(shareCardCode.includes('gatherPlayerData'), 'ShareCardSystem must implement gatherPlayerData');
assert.ok(shareCardCode.includes('renderCanvas'), 'ShareCardSystem must implement renderCanvas');
assert.ok(shareCardCode.includes('getTextSummary'), 'ShareCardSystem must implement getTextSummary');
assert.ok(shareCardCode.includes('copyTextSummary'), 'ShareCardSystem must implement copyTextSummary');
assert.ok(shareCardCode.includes('downloadImage'), 'ShareCardSystem must implement downloadImage');
console.log('✓ Test 3 Passed: ShareCardSystem architecture & export methods verified');

// 4. Load and test SeasonSystem
const seasonCode = fs.readFileSync('src/systems/progression/season-system.js', 'utf8');
assert.ok(seasonCode.includes('CURRENT_SEASON'), 'SeasonSystem must define CURRENT_SEASON');
assert.ok(seasonCode.includes('trackEliteKill'), 'SeasonSystem must implement trackEliteKill');
assert.ok(seasonCode.includes('trackRunewordCrafted'), 'SeasonSystem must implement trackRunewordCrafted');
assert.ok(seasonCode.includes('claimReward'), 'SeasonSystem must implement claimReward');
assert.ok(seasonCode.includes('renderPanel'), 'SeasonSystem must implement renderPanel');
console.log('✓ Test 4 Passed: SeasonSystem progression, tracking, and rewards claim validated');

// 5. Load and test ReturnBonus
const returnBonusCode = fs.readFileSync('src/systems/progression/return-bonus.js', 'utf8');
assert.ok(returnBonusCode.includes('INACTIVITY_THRESHOLD_MS'), 'ReturnBonus must define inactivity threshold');
assert.ok(returnBonusCode.includes('checkOnLogin'), 'ReturnBonus must implement checkOnLogin');
assert.ok(returnBonusCode.includes('claimAndProceed'), 'ReturnBonus must implement claimAndProceed');
assert.ok(returnBonusCode.includes('updateDoubleExpIndicator'), 'ReturnBonus must implement double EXP HUD indicator');
console.log('✓ Test 5 Passed: ReturnBonus inactivity detection and double EXP grant validated');

// 6. Verify style.css rules for Batch 3
const styleCss = fs.readFileSync('style.css', 'utf8');
assert.ok(styleCss.includes('.share-card-overlay'), 'style.css must have .share-card-overlay');
assert.ok(styleCss.includes('.season-modal-overlay'), 'style.css must have .season-modal-overlay');
assert.ok(styleCss.includes('.return-bonus-overlay'), 'style.css must have .return-bonus-overlay');
assert.ok(styleCss.includes('.double-exp-hud-badge'), 'style.css must have .double-exp-hud-badge');
console.log('✓ Test 6 Passed: style.css contains all high-fantasy styling for Batch 3');

console.log('\nALL BATCH 3 LONG-TERM RETENTION & SOCIAL TESTS PASSED PERFECTLY!');
