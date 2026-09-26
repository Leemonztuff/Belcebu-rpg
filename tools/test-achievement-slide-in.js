// Validation script for Achievement Notification Slide-in CSS Animation & Queue Logic
import assert from 'assert';
import fs from 'fs';
import vm from 'vm';

console.log('=== RUNNING ACHIEVEMENT SLIDE-IN NOTIFICATION TESTS ===');

// 1. Validate style.css rules
const styleContent = fs.readFileSync('style.css', 'utf-8');

assert.ok(
    /#notification-area\s*\{[\s\S]*?top:\s*60px;/.test(styleContent),
    'FAIL: #notification-area must maintain top: 60px anchor'
);
console.log('✓ Test 1 Passed: #notification-area maintains top: 60px anchor');

assert.ok(
    styleContent.includes('@keyframes achievementSlideIn'),
    'FAIL: style.css missing @keyframes achievementSlideIn'
);
assert.ok(
    styleContent.includes('@keyframes achievementSlideOut'),
    'FAIL: style.css missing @keyframes achievementSlideOut'
);
assert.ok(
    styleContent.includes('.achievement-unlock-banner.achievement-slide-in'),
    'FAIL: style.css missing .achievement-unlock-banner.achievement-slide-in'
);
assert.ok(
    styleContent.includes('.achievement-unlock-banner.achievement-slide-out'),
    'FAIL: style.css missing .achievement-unlock-banner.achievement-slide-out'
);
assert.ok(
    styleContent.includes('.ach-banner-shimmer'),
    'FAIL: style.css missing .ach-banner-shimmer light sweep'
);
assert.ok(
    styleContent.includes('@media (prefers-reduced-motion: reduce)'),
    'FAIL: style.css missing prefers-reduced-motion accessibility rules'
);
console.log('✓ Test 2 Passed: style.css contains all required slide-in keyframes, classes, shimmer, and reduced-motion rules');

// 2. Validate index.html slots and versions
const indexContent = fs.readFileSync('index.html', 'utf-8');
assert.ok(
    indexContent.includes('id="achievement-notify-slot"'),
    'FAIL: index.html missing id="achievement-notify-slot"'
);
assert.ok(
    indexContent.includes('id="standard-notify-slot"'),
    'FAIL: index.html missing id="standard-notify-slot"'
);
assert.ok(
    /style\.css\?v=\d+/.test(indexContent),
    'FAIL: index.html missing updated style.css version'
);
assert.ok(
    /game\.js\?v=\d+/.test(indexContent),
    'FAIL: index.html missing updated game.js version'
);
assert.ok(
    /i18n\.js\?v=\d+/.test(indexContent),
    'FAIL: index.html missing updated i18n.js version'
);
console.log('✓ Test 3 Passed: index.html contains notification slots and bumped version assets');

// 3. Validate i18n translations
const i18nContent = fs.readFileSync('i18n.js', 'utf-8');
assert.ok(
    i18nContent.includes('achievement_unlocked: "¡Logro Desbloqueado!"'),
    'FAIL: i18n.js missing Spanish achievement_unlocked'
);
assert.ok(
    i18nContent.includes('achievement_unlocked: "Achievement Unlocked!"'),
    'FAIL: i18n.js missing English achievement_unlocked'
);
assert.ok(
    i18nContent.includes('achievement_unlocked: "成就解锁"'),
    'FAIL: i18n.js missing Chinese achievement_unlocked'
);
console.log('✓ Test 4 Passed: i18n.js contains translations for all supported languages');

// 4. Validate runtime behavior in VM
class MockElement {
    constructor(id = '', className = '') {
        this.id = id;
        this.className = className;
        this.children = [];
        this.innerHTML = '';
        this.innerText = '';
        this.style = {};
        this.attributes = {};
        this.parentNode = null;
        this.classList = {
            add: (cls) => {
                const parts = this.className.split(' ').filter(Boolean);
                if (!parts.includes(cls)) parts.push(cls);
                this.className = parts.join(' ');
            },
            remove: (cls) => {
                const parts = this.className.split(' ').filter(Boolean);
                this.className = parts.filter(c => c !== cls).join(' ');
            },
            contains: (cls) => this.className.split(' ').includes(cls)
        };
    }
    appendChild(child) {
        child.parentNode = this;
        this.children.push(child);
    }
    removeChild(child) {
        const idx = this.children.indexOf(child);
        if (idx !== -1) {
            this.children.splice(idx, 1);
            child.parentNode = null;
        }
    }
    prepend(child) {
        child.parentNode = this;
        this.children.unshift(child);
    }
    setAttribute(name, val) {
        this.attributes[name] = val;
    }
}

const mockDoc = {
    elements: {},
    getElementById(id) {
        if (!this.elements[id]) {
            this.elements[id] = new MockElement(id);
        }
        return this.elements[id];
    },
    createElement(tag) {
        return new MockElement('', tag);
    }
};

const notifyArea = mockDoc.getElementById('notification-area');
const achSlot = mockDoc.getElementById('achievement-notify-slot');
const stdSlot = mockDoc.getElementById('standard-notify-slot');
notifyArea.appendChild(achSlot);
notifyArea.appendChild(stdSlot);

const sandbox = {
    document: mockDoc,
    console: console,
    cachedUI: {
        notificationArea: notifyArea
    },
    I18N: {
        currentLanguage: 'es',
        t(key) {
            if (key === 'achievement_unlocked') return '¡Logro Desbloqueado!';
            if (key === 'achievement_points') return 'Puntos';
            return key;
        }
    },
    AudioSys: {
        play: () => {}
    },
    SaveSystem: {
        save: () => {}
    },
    player: {
        achievements: {
            'test_ach_1': { progress: 0, completed: false },
            'test_ach_2': { progress: 0, completed: false }
        }
    },
    ACHIEVEMENTS: [
        {
            id: 'test_ach_1',
            name: '沉沦魔猎手',
            description: '击杀100只沉沦魔',
            target: 100,
            icon: '🗡️',
            points: 15
        },
        {
            id: 'test_ach_2',
            name: 'BOSS猎人',
            description: '击败5个首领级敌人',
            target: 5,
            icon: '👹',
            points: 25
        }
    ],
    setTimeout: (fn, delay) => {
        // Fast-forward simulator for tests
        return { fn, delay };
    },
    clearTimeout: () => {}
};

const gameCode = fs.readFileSync('game.js', 'utf-8');

// Extract the achievement notification and completeAchievement code to run in sandbox
const funcMatch = gameCode.match(/const achievementNotifyQueue = \[\];[\s\S]*?function completeAchievement\(achievement\) \{[\s\S]*?SaveSystem\.save\(\);\s*\}/);
assert.ok(funcMatch, 'FAIL: Could not locate achievement notification functions in game.js');

vm.createContext(sandbox);
vm.runInContext(
    funcMatch[0] +
    '; globalThis.achievementNotifyQueue = achievementNotifyQueue;' +
    ' globalThis.getIsShowing = () => isShowingAchievementNotify;' +
    ' globalThis.completeAchievement = completeAchievement;' +
    ' globalThis.showAchievementUnlockNotification = showAchievementUnlockNotification;',
    sandbox
);

// Test 5: Call completeAchievement and inspect DOM
sandbox.completeAchievement(sandbox.ACHIEVEMENTS[0]);

assert.strictEqual(sandbox.player.achievements['test_ach_1'].completed, true, 'FAIL: achievement should be marked completed');
assert.ok(sandbox.achievementNotifyQueue.length === 0, 'FAIL: achievement should be dequeued for display');
assert.strictEqual(sandbox.getIsShowing(), true, 'FAIL: isShowingAchievementNotify should be true');

// Check that banner was inserted into achSlot
assert.strictEqual(achSlot.children.length, 1, 'FAIL: Banner should be added to achievement slot');
const banner = achSlot.children[0];
assert.ok(banner.classList.contains('achievement-slide-in'), 'FAIL: Banner must have achievement-slide-in class');
assert.ok(banner.innerHTML.includes('沉沦魔猎手'), 'FAIL: Banner must display achievement name');
assert.ok(banner.innerHTML.includes('🗡️'), 'FAIL: Banner must display achievement icon');
assert.ok(banner.innerHTML.includes('击杀100只沉沦魔'), 'FAIL: Banner must display description');
assert.ok(banner.innerHTML.includes('+15 Puntos'), 'FAIL: Banner must display points and reward');
assert.ok(banner.innerHTML.includes('¡Logro Desbloqueado!'), 'FAIL: Banner must display translated kicker');
console.log('✓ Test 5 Passed: completeAchievement creates animated slide-in banner with rich details');

// Test 6: Queue a second achievement while first is showing
sandbox.completeAchievement(sandbox.ACHIEVEMENTS[1]);
assert.strictEqual(sandbox.achievementNotifyQueue.length, 1, 'FAIL: Second achievement should wait in queue while first is active');
console.log('✓ Test 6 Passed: Simultaneous achievement unlocks are queued cleanly');

console.log('\nALL ACHIEVEMENT SLIDE-IN NOTIFICATION TESTS PASSED PERFECTLY!');
