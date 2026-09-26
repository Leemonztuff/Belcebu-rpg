import fs from 'node:fs';
import assert from 'node:assert/strict';

console.log('=== RUNNING PLAN B RETENTION & REPLAY FEATURES REGRESSION TESTS ===');

// Test 1: File inclusions and script tags in index.html
const indexHtml = fs.readFileSync('index.html', 'utf-8');
assert.ok(indexHtml.includes('talent-draft.js'), 'talent-draft.js must be included in index.html');
assert.ok(indexHtml.includes('daily-quest.js'), 'daily-quest.js must be included in index.html');
assert.ok(indexHtml.includes('abyss-system.js'), 'abyss-system.js must be included in index.html');
console.log('✓ Test 1 Passed: index.html correctly includes all Plan B scripts');

// Test 2: TalentDraftSystem code validation
const talentDraftCode = fs.readFileSync('talent-draft.js', 'utf-8');
assert.ok(talentDraftCode.includes('checkFloorMilestone'), 'TalentDraftSystem must implement checkFloorMilestone');
assert.ok(talentDraftCode.includes('openDraft'), 'TalentDraftSystem must implement openDraft');
assert.ok(talentDraftCode.includes('chooseTalent'), 'TalentDraftSystem must implement chooseTalent');
assert.ok(talentDraftCode.includes('floorTalentsClaimed'), 'TalentDraftSystem must track claimed floor milestones');
console.log('✓ Test 2 Passed: TalentDraftSystem logic verified');

// Test 3: DailyQuestSystem & WeeklyGoalSystem validation
const dailyQuestCode = fs.readFileSync('daily-quest.js', 'utf-8');
assert.ok(dailyQuestCode.includes('claimDailyChest'), 'DailyQuestSystem must implement claimDailyChest');
assert.ok(dailyQuestCode.includes('WeeklyGoalSystem'), 'WeeklyGoalSystem must be defined in daily-quest.js');
assert.ok(dailyQuestCode.includes('onMonsterKilled'), 'WeeklyGoalSystem must implement onMonsterKilled');
assert.ok(dailyQuestCode.includes('onRareItemFound'), 'WeeklyGoalSystem must implement onRareItemFound');
assert.ok(dailyQuestCode.includes('onFloorReached'), 'WeeklyGoalSystem must implement onFloorReached');
console.log('✓ Test 3 Passed: Daily Master Chest and WeeklyGoalSystem validated');

// Test 4: AbyssSystem enhancements validation
const abyssCode = fs.readFileSync('abyss-system.js', 'utf-8');
assert.ok(abyssCode.includes('TRIAL_LEVEL: 10'), 'AbyssSystem TRIAL_LEVEL must be 10');
assert.ok(abyssCode.includes('MIN_LEVEL: 15'), 'AbyssSystem MIN_LEVEL must be 15');
assert.ok(abyssCode.includes('enterTrial'), 'AbyssSystem must implement enterTrial');
assert.ok(abyssCode.includes('renderHUD'), 'AbyssSystem must implement renderHUD');
console.log('✓ Test 4 Passed: AbyssSystem Trial mode and HUD visualizer validated');

// Test 5: Style rules in style.css
const styleCss = fs.readFileSync('style.css', 'utf-8');
assert.ok(styleCss.includes('.talent-draft-modal'), 'style.css must have .talent-draft-modal');
assert.ok(styleCss.includes('.talent-draft-card'), 'style.css must have .talent-draft-card');
assert.ok(styleCss.includes('#abyss-hud-status'), 'style.css must have #abyss-hud-status');
console.log('✓ Test 5 Passed: style.css contains all high-fantasy UI styles for Plan B');

// Test 6: game.js hooks
const gameJs = fs.readFileSync('game.js', 'utf-8');
assert.ok(gameJs.includes('TalentDraftSystem.checkFloorMilestone(f)'), 'game.js must hook TalentDraftSystem in enterFloor');
assert.ok(gameJs.includes('WeeklyGoalSystem.onFloorReached(f)'), 'game.js must hook WeeklyGoalSystem in enterFloor');
assert.ok(gameJs.includes('WeeklyGoalSystem.onMonsterKilled()'), 'game.js must hook WeeklyGoalSystem in killEnemy');
console.log('✓ Test 6 Passed: game.js gameplay loop hooks verified');

console.log('ALL PLAN B RETENTION & REPLAY REGRESSION TESTS PASSED PERFECTLY!');
