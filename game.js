// ========== game.js - maingamelogic ==========
// Constant definitions moved to constants.js

// Helper: check whether in town
function isInTown() {
    return player.floor === 0 && !player.isInHell;
}

function getCurrentCombatFloor() {
    return player.isInHell ? player.hellFloor : player.floor;
}

// Stat tracking: add gold and update stats
function addGold(amount) {
    player.gold += amount;
    player.stats.totalGold += amount;
// Update best single-run gold
    if (player.gold > player.personalBest.maxGold) {
        player.personalBest.maxGold = player.gold;
    }
// Daily quest: collect gold
    if (typeof DailyQuestSystem !== 'undefined') {
        DailyQuestSystem.updateProgress('collect_gold', amount);
    }
// Achievement tracking: cumulative gold
    trackAchievement('total_gold', { amount });
}

// Stat tracking: update personal bests
function updatePersonalBest() {
    if (player.lvl > player.personalBest.maxLevel) {
        player.personalBest.maxLevel = player.lvl;
    }
    if (!player.isInHell && player.floor > player.personalBest.maxFloor) {
        player.personalBest.maxFloor = player.floor;
    }
    if (player.isInHell && player.hellFloor > player.personalBest.maxHellFloor) {
        player.personalBest.maxHellFloor = player.hellFloor;
    }
    if (player.kills > player.personalBest.maxKills) {
        player.personalBest.maxKills = player.kills;
    }
}

// Stat tracking: record rare item discovery
// Stat tracking: record rare item discovery (moved to item-system.js)

// Panel management system
// panelManager and isAnyPanelOpen moved to ui-panels.js

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const miniCanvas = document.getElementById('minimap');
const miniCtx = miniCanvas.getContext('2d');
const MAX_CANVAS_RENDER_PIXELS = 1600 * 900;
const renderViewport = {
    cssWidth: 0,
    cssHeight: 0,
    renderScaleX: 1,
    renderScaleY: 1
};

function getCanvasRenderPixelLimit() {
    return player.graphicsQuality === 'low' ? MAX_CANVAS_RENDER_PIXELS : Infinity;
}

function updateRenderViewport() {
    const cssWidth = Math.max(1, window.innerWidth);
    const cssHeight = Math.max(1, window.innerHeight);
    const pixelLimit = getCanvasRenderPixelLimit();
    const scale = Math.min(1, Math.sqrt(pixelLimit / (cssWidth * cssHeight)));
    const renderWidth = Math.max(1, Math.round(cssWidth * scale));
    const renderHeight = Math.max(1, Math.round(cssHeight * scale));

    renderViewport.cssWidth = cssWidth;
    renderViewport.cssHeight = cssHeight;
    renderViewport.renderScaleX = renderWidth / cssWidth;
    renderViewport.renderScaleY = renderHeight / cssHeight;

    canvas.width = renderWidth;
    canvas.height = renderHeight;
    canvas.style.width = cssWidth + 'px';
    canvas.style.height = cssHeight + 'px';
}

function clientToCanvasX(clientX) {
    const rect = canvas.getBoundingClientRect();
    return clientX - rect.left;
}

function clientToCanvasY(clientY) {
    const rect = canvas.getBoundingClientRect();
    return clientY - rect.top;
}

function canvasToCssX(x) {
    return x;
}

function canvasToCssY(y) {
    return y;
}

function getViewportWidth() {
    return renderViewport.cssWidth || canvas.width;
}

function getViewportHeight() {
    return renderViewport.cssHeight || canvas.height;
}

function applyRenderViewportTransform() {
    ctx.setTransform(renderViewport.renderScaleX, 0, 0, renderViewport.renderScaleY, 0, 0);
}

// DOM cacheobject
const cachedUI = {
    // Orbs
    hpFill: null, hpGhostFill: null, hpText: null, hpOrb: null,
    mpFill: null, mpGhostFill: null, mpText: null, mpOrb: null,
    shieldFill: null, shieldText: null,  // shield HUD
    // XP & Level
    xpFill: null, xpPercentage: null, hudLvl: null, hudGold: null, floorDisplay: null,
    // Indicators & FX
    lowHpVignette: null, hellIndicator: null, comboHud: null, comboCount: null, comboTimerFill: null,
    // Container
    worldLabels: null, notificationArea: null, floatingTexts: null,
    talentHud: null, tooltip: null, uiLayer: null,
    // Skills Bar
    skillBtns: {},
    cdSweeps: {},
    cdTimes: {},
    // Menu Badges
    badges: { stats: null, skills: null, quest: null },
    // Settings & System
    chkAutoGold: null, chkAutoPotion: null, chkAutoScroll: null,
    chkJuice: null,
    selectGraphicsQuality: null,
    saveStatus: null
};

// Init UI cache
function initUICache() {
    // Orbs
    cachedUI.hpFill = document.getElementById('hp-fill');
    cachedUI.hpGhostFill = document.getElementById('hp-ghost-fill');
    cachedUI.hpText = document.getElementById('hp-text');
    cachedUI.hpOrb = document.getElementById('health-orb');
    cachedUI.mpFill = document.getElementById('mp-fill');
    cachedUI.mpGhostFill = document.getElementById('mp-ghost-fill');
    cachedUI.mpText = document.getElementById('mp-text');
    cachedUI.mpOrb = document.getElementById('mana-orb');
    cachedUI.shieldFill = document.getElementById('shield-fill');
    cachedUI.shieldText = document.getElementById('shield-text');

    // XP & Level & Info
    cachedUI.xpFill = document.getElementById('xp-fill');
    cachedUI.xpPercentage = document.getElementById('xp-percentage');
    cachedUI.hudLvl = document.getElementById('hud-lvl');
// List of gold display elements
    cachedUI.goldDisplays = [
        document.getElementById('gold-display'),
        document.getElementById('shop-gold-display'),
        document.getElementById('stash-gold-display'),
        document.getElementById('forge-gold-display'),
        document.getElementById('talent-shop-gold')
    ].filter(el => el !== null);
    cachedUI.floorDisplay = document.getElementById('floor-display');

    // Indicators
    cachedUI.lowHpVignette = document.getElementById('low-hp-vignette');
    cachedUI.hellIndicator = document.getElementById('hell-indicator');
    cachedUI.comboHud = document.getElementById('combo-hud');
    cachedUI.comboCount = document.getElementById('combo-count');
    cachedUI.comboTimerFill = document.getElementById('combo-timer-fill');

    // Containers
    cachedUI.worldLabels = document.getElementById('world-labels');
    cachedUI.notificationArea = document.getElementById('notification-area');
    cachedUI.floatingTexts = document.getElementById('floating-texts-container');
    cachedUI.talentHud = document.getElementById('talent-hud');
    cachedUI.tooltip = document.getElementById('tooltip');
    initTooltipHoverEvents();  // Init tooltip hover events
    cachedUI.uiLayer = document.querySelector('.ui-layer');

    // Skills
    const skills = ['fireball', 'thunder', 'multishot', 'holy_shield'];
    skills.forEach(s => {
        cachedUI.skillBtns[s] = document.getElementById(`skill-${s}`);
        cachedUI.cdSweeps[s] = document.getElementById(`cd-sweep-${s}`);
        cachedUI.cdTimes[s] = document.getElementById(`cd-time-${s}`);
    });

    // Badges
    cachedUI.badges.stats = document.getElementById('badge-stats');
    cachedUI.badges.skills = document.getElementById('badge-skills');
    cachedUI.badges.quest = document.getElementById('badge-quest');

    // Settings
    cachedUI.chkAutoGold = document.getElementById('chk-auto-gold');
    cachedUI.chkAutoPotion = document.getElementById('chk-auto-potion');
    cachedUI.chkAutoScroll = document.getElementById('chk-auto-scroll');
    cachedUI.chkJuice = document.getElementById('chk-juice');
    cachedUI.selectGraphicsQuality = document.getElementById('select-graphics-quality');
    cachedUI.saveStatus = document.getElementById('save-status');
}

let gameActive = false;
let lastTime = 0;
let particles = [];
let vfxEffects = [];
let damageNumbers = [];
let slashEffects = [];
let enemies = [];
let groundItems = [];
let projectiles = [];
let npcs = [];
const NPC_NAME_KEYS = {
    merchant: 'npc_gheed',
    healer: 'npc_akara',
    stash: 'npc_warriv',
    blacksmith: 'npc_charsi',
    difficulty: 'npc_abyss_guard',
    respec: 'npc_sage_name'
};
let pendingNpcInteraction = null;
// bloodSplats is deprecated; blood now draws straight to the offscreen canvas (bloodCanvas)
let destructibles = []; // Destructible scene objects
let dungeonRoomFeatures = []; // room structure markers, visual only
let bossArena = null; // Visual arena info for boss-floor exit areas
let scenicProps = []; // Static environment foreground props, y-sorted into occlusion
let dungeonLightSources = []; // dungeon static lights drawn per frame for light ambience
const renderEnemies = [];
const foregroundActors = [];

// Map cache system (offscreen canvas optimization)
let mapCacheCanvas = null;
let mapCacheCtx = null;
let mapCacheValid = false;  // Whether the cache is valid

// Town portal ritual state
let portalRitual = {
    active: false,       // Whether casting
    phase: 0,            // 0=cast, 1=light effect, 2=plainflash, 3=fade in
    timer: 0,            // Current phase timing
    returnFloor: 0,      // Floor to return to
    scrollIdx: -1,       // Consumed scroll index
    flashAlpha: 0        // White flash opacity
};

const PORTAL_RITUAL_DURATIONS = {
    casting: 1.0,    // castcast bartime
    effect: 0.4,     // light effecttime
    flash: 0.3,      // White flash time
    fadeIn: 0.5      // fade intime
};

// Flying pickup particle array (Vampire-Survivors-like suck-in effect)
let flyingPickups = [];

// Occlusion fix reuses a Set (avoids per-frame new Set + string allocation)
const _occlusionSet = new Set();

// upgradeVFXstate
let levelUpEffect = {
    active: false,
    timer: 0,
    flashAlpha: 0,
    newLevel: 0
};

// slow motionstate（Bosson deathtrigger）
let slowMotion = {
    active: false,
    timer: 0,
    scale: 1.0  // Time scale multiplier
};

// Combo counter (pure game-juice visual feedback)
let combo = {
    count: 0,
    timer: 0,
    maxTimer: 2.5, // Combo window time
    scale: 1,      // Visual scale (pulse effect)
    shake: 0,      // visualjitter
    active: false  // Visibility flag
};

// ========== Game Juice system (hit feel and feedback) ==========
const Juice = {
    hitStopTimer: 0,
    lastLightHitStopAt: 0,

// Trigger the core hit-feel logic
    // entity: hurtone who, isCrit: isnocrit, isKill: isnokill
    hit: function (entity, isCrit, isKill) {
        if (!player.juiceEnabled) return; // Checkopenclose
        const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);

        // 1. hit stop (Hit Stop) - producespawncardfleshfeel
// Normal hits give a very short hit-stop, throttled so high attack speed doesn't look like stuttering
        if (isCrit || isKill) {
            this.hitStopTimer = isKill ? 0.06 : 0.03;
            if (isMobile) this.hitStopTimer *= 0.7; // slightly shorter on mobile to avoid false stall detection
        } else if (!isMobile) {
            const now = performance.now();
            if (now - this.lastLightHitStopAt > 90) {
                this.hitStopTimer = 0.012;
                this.lastLightHitStopAt = now;
            }
        }

        // 2. screen shake (Screen Shake)
        let intensity = isCrit ? 10 : 4;
        if (isKill) intensity += 6;
        if (isMobile) intensity *= 0.4; // Weaken visual shaking on mobile to protect eyes

        if (intensity > 2) {
            triggerScreenShake(intensity, 0.15);
        }

// 3. Haptic feedback (mobile vibrate)
        if (isMobile && navigator.vibrate) {
            if (isKill) navigator.vibrate(15);
            else if (isCrit) navigator.vibrate(8);
        }

// 4. Body hit feedback (squash & stretch)
        if (entity) {
            entity.juiceScale = 0.85; // Instant compression
            entity.juiceScaleTimer = 0.2; // 0.2secondrestore
        }
    },

    // Update Juice systemtime
    update: function (dt) {
        if (this.hitStopTimer > 0) {
            this.hitStopTimer -= dt;
            if (this.hitStopTimer < 0) this.hitStopTimer = 0;
            return true; // Hit-stop active: tell the main loop to pause logic updates
        }
        return false;
    }
};

// increasecombo count
function addCombo(amount = 1) {
    if (combo.count === 0) {
        combo.active = true;
    }
    combo.count += amount;
    combo.timer = combo.maxTimer;
    combo.scale = 1.5; // Bounce on hit
// Achievement tracking: max combo
    trackAchievement('max_combo', { combo: combo.count });
}


// --- Performance: generic object pool management ---
const ParticlePool = {
    _pool: [],
    acquire(props) {
        const p = this._pool.pop() || {};
        return Object.assign(p, props);
    },
    release(p) {
        if (this._pool.length < 500) {
// Clear physics props to prevent pollution on reuse
            p.z = undefined; p.vz = undefined; p.vx = undefined; p.vy = undefined;
            p.spin = undefined; p.gravity = undefined; p.type = undefined; p.canBake = undefined; p.size = 3;
            p.maxLife = undefined; p.radius = undefined; p.grow = undefined; p.width = undefined;
            p.maxAlpha = undefined;
            p.angle = undefined; p.length = undefined; p.color2 = undefined; p.rotation = undefined;
            this._pool.push(p);
        }
    }
};

const DamageNumberPool = {
    _pool: [],
    acquire(props) {
        const d = this._pool.pop() || {};
        return Object.assign(d, props);
    },
    release(d) {
        if (this._pool.length < 100) {
            d.el = undefined;
            d.mergeSource = null; d.mergeTime = 0;
            d.isHTML = false;
            d.isImportantText = false;
            d.isCrit = false;
            d.isGold = false;
            d.isLightning = false;
            d.isPoison = false;
            d.isIce = false;
            this._pool.push(d);
        }
    }
};

// Projectile pool - reduces GC pressure from frequent projectile creation/destruction
const ProjectilePool = {
    _pool: [],
    acquire(props) {
        const p = this._pool.pop() || {};
        return Object.assign(p, props);
    },
    release(p) {
        if (this._pool.length < 200) {
            // reset stats to prevent pollution on reuse
            p.type = undefined; p.freeze = undefined; p.owner = undefined; p.sourceName = undefined; p.age = undefined;
            p.visualTier = undefined;
            p.branch = undefined; p.hitEnemies = undefined; p.pierces = undefined; p.transformed = undefined; p.skillLevel = undefined; p.meteorTarget = undefined;
            this._pool.push(p);
        }
    }
};

// Flying pickup pool - reduces GC pressure from gold/potion fly animation objects
const FlyingPickupPool = {
    _pool: [],
    acquire(props) {
        const f = this._pool.pop() || {};
        return Object.assign(f, props);
    },
    release(f) {
        if (this._pool.length < 50) {
            // reset stats to prevent pollution on reuse
            f.item = undefined; f.type = undefined; f.value = undefined;
            this._pool.push(f);
        }
    }
};

// --- Performance: offscreen ground blood layer ---
let bloodCanvas = null;
let bloodCtx = null;

function initBloodCanvas() {
    if (!bloodCanvas) {
        bloodCanvas = document.createElement('canvas');
        bloodCanvas.width = MAP_WIDTH * TILE_SIZE;
        bloodCanvas.height = MAP_HEIGHT * TILE_SIZE;
        bloodCtx = bloodCanvas.getContext('2d');
    }
    clearBloodCanvas();
}

function clearBloodCanvas() {
    if (bloodCtx) bloodCtx.clearRect(0, 0, bloodCanvas.width, bloodCanvas.height);
}

// Enemy pool system - reuse objects to reduce GC pressure
const EnemyPool = {
    pool: [],           // Reusable enemy objects
    maxPoolSize: 100,   // Pool max capacity

// Get from the pool or create a new enemy object
    acquire(props) {
        let enemy;
        if (this.pool.length > 0) {
            enemy = this.pool.pop();
        } else {
            enemy = {};
        }
        // Resetallstats
        Object.assign(enemy, {
            x: 0, y: 0, hp: 0, maxHp: 0, dmg: 0, speed: 0, radius: 12,
            dead: false, cooldown: 0, name: '', rarity: 0, xpValue: 0,
            frameIndex: 0, ai: 'chase', monsterType: 'melee',
            isBoss: false, isQuestTarget: false, isElite: false,
            bossTraits: null, bossCooldowns: null, enraged: false,
            canTeleport: false, skillCd: 0, pendingSkill: null, bossSkillVisual: null,
            combatCue: null, recoveryTimer: 0, recoveryDuration: 0, pressureImmuneTimer: 0,
            teleportCdMax: 0, summonCdMax: 0, slamCdMax: 0, breathCdMax: 0, tentacleCdMax: 0,
            slamRadius: 0, dashDistance: 0, breathAngle: 0, breathRange: 0, tentacleCount: 0,
            summonCount: 0,
            facingDirection: 'front', lastSideDirection: 'right',
            facingLockTimer: 0, actionDirection: null, actionDirectionTimer: 0,
            monsterAction: null, monsterActionTimer: 0, monsterActionDuration: 0, monsterAnimTime: 0,
            eliteAffixes: null, frozenTimer: 0, slowedTimer: 0, lightningOverloadTimer: 0,
            poisoned: false, poisonTimer: 0, poisonDamagePerTick: 0, lastPoisonTick: 0,
            damageReduction: 0,
            elementalDmg: null, magicResist: 0, freezeOnHit: false, manaBurn: false,
            cursed: false, curseArmorBreak: 0, curseDamageTakenMult: 1, curseDuration: 0,
            multiShot: 0, scatterVolley: false, scatterVolleyCooldown: 0, ignoreArmor: false,
            phaseThrough: false, dodgeChance: 0, poisonOnHit: false, poisonDamage: 0,
            lifeSteal: 0, slamHit: false, blockChance: 0, moraleTimer: 0, fleeYellTimer: 0,
            isDashing: false, dashTimer: 0, dashCooldown: 0,
            hitFlashTimer: 0, hitReactTimer: 0, hitReactDuration: 0,
            hitReactX: 0, hitReactY: 0, hitTilt: 0,  // Hit flash white timer
            deathVisualTimer: 0, deathVisualDuration: 0,
            ...props
        });
        return enemy;
    },

// Recycle the enemy object into the pool
    release(enemy) {
        SkillBranchSystem.states.delete(enemy);
        if (this.pool.length < this.maxPoolSize) {
// Clear references to prevent memory leaks
            enemy.eliteAffixes = null;
            this.pool.push(enemy);
        }
    },

// Get pool stats (debug; run EnemyPool.getStats() in console)
    getStats() {
// Use EnemyCache (if initialized) to avoid repeat iterations
        const alive = typeof EnemyCache !== 'undefined' ? EnemyCache.aliveCount : enemies.filter(e => !e.dead).length;
        const dead = typeof EnemyCache !== 'undefined' ? EnemyCache.deadCount : enemies.filter(e => e.dead).length;
        return {
            poolSize: this.pool.length,      // Reusable object count in the pool
            totalInArray: enemies.length,    // Total enemies in the array
            aliveEnemies: alive,             // Alive enemy count
            deadBodies: dead,                // Corpse count (awaiting recycling)
            reuseRate: this.pool.length > 0 ? 'Object pool OK' : 'pool empty'
        };
    }
};
let autoSaveTimer = 0;
let cleanupTimer = 0;
let isAltPressed = false;

// ====== Enemy state cache (refreshed once per frame to avoid repeat iterations) ======
const EnemyCache = {
    aliveCount: 0,
    deadCount: 0,
    aliveList: [],          // Alive enemy references (distance-sorted)
    frameId: -1,            // Current frame id, preventing multi-updates within a frame

// Called once at the start of each frame
    update(currentFrameId) {
        if (this.frameId === currentFrameId) return; // No duplicate computation within the same frame
        this.frameId = currentFrameId;

        this.aliveCount = 0;
        this.deadCount = 0;
        this.aliveList.length = 0; // Clear the array but keep references

        for (let i = 0, len = enemies.length; i < len; i++) {
            const e = enemies[i];
            if (e.dead) {
                this.deadCount++;
            } else {
                this.aliveCount++;
                this.aliveList.push(e);
            }
        }
    },

// Get enemies near the player (for AutoBattle.findTarget etc.)
    getNearbyAlive(maxDistSq) {
        const result = [];
        const px = player.x, py = player.y;
        for (let i = 0, len = this.aliveList.length; i < len; i++) {
            const e = this.aliveList[i];
            const dx = e.x - px, dy = e.y - py;
            const distSq = dx * dx + dy * dy;
            if (distSq < maxDistSq) {
                result.push({ enemy: e, distSq });
            }
        }
        return result;
    }
};
let gameFrameId = 0; // Global frame counter
let enemySpawnIntervalId = null;
let enemySpawnCandidates = [];

// ====== Enemy spatial index (narrow queries for player projectiles/AoE) ======
const EnemySpatialGrid = {
    cellSize: 128,
    cells: new Map(),
    frameId: -1,
    ready: false,
    maxEnemyRadius: 0,

    rebuild(currentFrameId) {
        this.cells.clear();
        this.frameId = currentFrameId;
        this.ready = true;
        this.maxEnemyRadius = 0;

        for (let i = 0, len = enemies.length; i < len; i++) {
            const e = enemies[i];
            if (e.dead) continue;
            if (e.radius > this.maxEnemyRadius) this.maxEnemyRadius = e.radius;

            const cellX = Math.floor(e.x / this.cellSize);
            const cellY = Math.floor(e.y / this.cellSize);
            const key = `${cellX},${cellY}`;
            let bucket = this.cells.get(key);
            if (!bucket) {
                bucket = [];
                this.cells.set(key, bucket);
            }
            bucket.push(e);
        }
    },

    queryRadius(x, y, radius) {
        if (!this.ready || this.frameId !== gameFrameId) return enemies;

        const searchRadius = radius + this.maxEnemyRadius;
        const minCellX = Math.floor((x - searchRadius) / this.cellSize);
        const maxCellX = Math.floor((x + searchRadius) / this.cellSize);
        const minCellY = Math.floor((y - searchRadius) / this.cellSize);
        const maxCellY = Math.floor((y + searchRadius) / this.cellSize);
        const result = [];

        for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
            for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
                const bucket = this.cells.get(`${cellX},${cellY}`);
                if (!bucket) continue;
                for (let i = 0, len = bucket.length; i < len; i++) {
                    result.push(bucket[i]);
                }
            }
        }

        return result;
    }
};

function countAliveEnemiesDirect() {
    let count = 0;
    for (let i = 0, len = enemies.length; i < len; i++) {
        if (!enemies[i].dead) count++;
    }
    return count;
}

let mapData = [];
let visitedMap = [];
let dungeonExit = { x: 0, y: 0 };
let dungeonEntrance = { x: 0, y: 0 };
let townPortal = null;
let townPortalSpot = { x: 0, y: 0 }; // Fixed town portal position in town (right of the dungeon entrance)
let currentWaypoint = null; // nowfloorteleportsmallstandobject { x, y, floor }
let townWaypointSpot = { x: 0, y: 0 }; // Fixed waypoint position in town (left of the dungeon entrance)
let interactionTarget = null;

// Get the portal display position (fixed in town, actual in the dungeon)
function getPortalDisplayPosition() {
    if (!townPortal) return null;
    if (player.floor === 0) {
// Town: use the fixed position
        return { x: townPortalSpot.x, y: townPortalSpot.y };
    } else {
// Dungeon: use the actual portal position
        return { x: townPortal.x, y: townPortal.y };
    }
}

const mouse = { x: 0, y: 0, worldX: 0, worldY: 0, leftDown: false, rightDown: false };
const camera = { x: 0, y: 0 };

// Quest titles/descs derive from FLOOR_NAMES to keep one data source
const QUEST_DB = [
    { id: 0, get title() { return getFloorName(1); }, get desc() { return `Slay 10 monsters on Floor 1 (${getFloorName(1)}).`; }, type: 'kill_count', target: 10, floor: 1, reward: '1 Skill Point' },
    { id: 1, get title() { return getFloorName(2); }, get desc() { return `Defeat elite monster "Blood Raven" on Floor 2 (${getFloorName(2)}).`; }, type: 'kill_elite', targetName: 'Blood Raven', floor: 2, reward: 'Rare Ring' },
    { id: 2, get title() { return getFloorName(3); }, get desc() { return `Slay 15 monsters on Floor 3 (${getFloorName(3)}).`; }, type: 'kill_count', target: 15, floor: 3, reward: '500 Gold' },
    { id: 3, get title() { return getFloorName(4); }, get desc() { return `Defeat "The Countess" on Floor 4 (${getFloorName(4)}).`; }, type: 'kill_elite', targetName: 'The Countess', floor: 4, reward: 'Random Rune' },
    { id: 4, get title() { return getFloorName(5); }, get desc() { return `Defeat "The Butcher" on Floor 5 (${getFloorName(5)}).`; }, type: 'kill_boss', targetName: 'The Butcher', floor: 5, reward: 'Unique Equipment' },
    { id: 5, get title() { return getFloorName(6); }, get desc() { return `Slay 20 monsters on Floor 6 (${getFloorName(6)}).`; }, type: 'kill_count', target: 20, floor: 6, reward: '2 Skill Points' },
    { id: 6, get title() { return getFloorName(7); }, get desc() { return `Defeat "Treehead WoodFist" on Floor 7 (${getFloorName(7)}).`; }, type: 'kill_elite', targetName: 'Treehead WoodFist', floor: 7, reward: 'Unique Amulet' },
    { id: 7, get title() { return getFloorName(8); }, get desc() { return `Slay 25 monsters on Floor 8 (${getFloorName(8)}).`; }, type: 'kill_count', target: 25, floor: 8, reward: '1000 Gold' },
    { id: 8, get title() { return getFloorName(9); }, get desc() { return `Defeat "Diablo" on Floor 9 (${getFloorName(9)}).`; }, type: 'kill_elite', targetName: 'Diablo', floor: 9, reward: 'Legendary Equipment' },
    { id: 9, get title() { return getFloorName(10); }, get desc() { return `Defeat Baal on Floor 10 (${getFloorName(10)}) to save the world.`; }, type: 'kill_boss', targetName: 'Baal', floor: 10, reward: 'Divine Equipment' }
];

// Get the current or indexed quest (endless quests supported)
function getCurrentQuest(index) {
    const idx = (index !== undefined) ? index : player.questIndex;

// 1. Classic quests (0-9)
    if (idx < QUEST_DB.length) {
        return QUEST_DB[idx];
    }

// 2. Endless quest generation (10+)
    const currentFloor = idx + 1;
    const isBossLevel = (currentFloor % 10 === 0) || (currentFloor % 5 === 0); // Special every 5/10 floors

    // reward calc
    let rewardGold = Math.floor(currentFloor * 150 * (1 + Math.random() * 0.2));
    let rewardStr = `${rewardGold} Gold`;

// Skill point reward every 10 floors
    if (currentFloor % 10 === 0) {
        rewardStr += " & 1 Skill Point";
    }
// Boss floors grant bonus gear
    if (isBossLevel) {
        rewardStr += " & Random Equipment";
    }

    const floorName = getFloorName(currentFloor);
    if (isBossLevel) {
        // Bossquest
// Simplified boss-name logic
        const bossPool = ['Blood Raven', 'The Countess', 'The Butcher', 'Treehead WoodFist', 'Diablo', 'Baal'];
        const bossName = bossPool[Math.floor(currentFloor / 10) % bossPool.length] || 'Elite Guard';
        const isTrueBoss = (currentFloor % 10 === 0);

        return {
            id: idx,
            title: floorName,
            desc: `Defeat the mighty ${bossName} on Floor ${currentFloor} (${floorName}).`,
            type: isTrueBoss ? 'kill_boss' : 'kill_elite',
            targetName: bossName,
            floor: currentFloor,
            reward: rewardStr,
            isGenerated: true
        };
    } else {
// Kill-monster quest
        const targetCount = Math.min(50, 15 + Math.floor((idx - 9) * 2)); // Count grows gradually, capped at 50
        return {
            id: idx,
            title: floorName,
            desc: `Defeat ${targetCount} monsters on Floor ${currentFloor} (${floorName}).`,
            type: 'kill_count',
            target: targetCount,
            floor: currentFloor,
            reward: rewardStr,
            isGenerated: true
        };
    }
}

// Claim the quest reward (called by UI)
function claimQuestReward() {
    if (player.questState !== 2) return;

    const q = getCurrentQuest();
    if (!q) return;

    // grant rewards
    // 1. gold (parsestring "1500 Gold")
    const goldMatch = q.reward.match(/(\d+)\s*Gold/);
    if (goldMatch) {
        addGold(parseInt(goldMatch[1]));
    }
    // 2. skill point
    if (q.reward.includes('Skill Point')) {
        player.skillPoints += 1; // Simple approach: endless quests grant at most 1 point each
        showNotification("Obtained 1 Skill Point!");
    }
    // 3. gear
    if (q.reward.includes('Equipment') || q.reward.includes('Magic Ring') || q.reward.includes('Divine Relic')) {
        const item = createItem('Magic Ring', player.lvl);
        if (q.reward.includes('Unique') || q.reward.includes('Legendary') || q.reward.includes('Divine Relic')) {
            item.rarity = (Math.random() > 0.5) ? 3 : 2; // Slightly more generous
        }
        addItemToInventory(item);
    }
// Compat with the old hardcoded rewards (first 10 quests)
    if (q.id <= 9) {
// Just insurance; the generic parsing above should cover most cases
        if (q.reward.includes('500 Gold') && !goldMatch) addGold(500);
        if (q.reward.includes('1000 Gold') && !goldMatch) addGold(1000);
    }

    // completequest
    player.questIndex++;
    player.questState = 0; // Reset to not-started (or start directly? Usually accept -> in-progress. Set to 0; updateUI shows 'new quest')
    player.questProgress = 0;

// Auto-accept the next quest (for smooth flow, 'always a quest')
    player.questState = 1;

    AudioSys.play('levelup'); // borrow the level-up SFX, or the cash SFX
    showNotification(`Quest completed!`);

// Save and update the UI
    SaveSystem.save();
    updateUI();
    updateQuestTracker();
}

// row 2:normal monstersframe index
// row 2:normal monstersframe index (alreadymove to enemy-system.js)

// Apply boss special traits
// Apply Boss special traits (alreadymove to enemy-system.js)

const player = {
    x: 0, y: 0, radius: 12, color: '#eee', speed: 180, direction: 'front',
    lvl: 1, xp: 0, xpNext: 100, points: 0, skillPoints: 1,
    str: 15, dex: 15, vit: 20, ene: 10,
    floor: 0, kills: 0,
    hp: 100, maxHp: 100, mp: 50, maxMp: 50, damage: [2, 4], armor: 5, gold: 0,
    lifeSteal: 0, attackSpeed: 0, critChance: 0,
    resistances: { fire: 0, cold: 0, lightning: 0, poison: 0 },  // Resistance system
    elementalDamage: { fire: 0, cold: 0, lightning: 0, poison: 0 },  // elemental damage
    skills: { fireball: 1, thunder: 0, multishot: 0 }, activeSkill: 'fireball',
// Skill tree system (init the full default tree so systems run without a loaded save)
    skillTree: {
        fireball: { stage1: 1, stage2: { chosen: null, level: 0 }, stage3: { chosen: null, level: 0 } },
        thunder: { stage1: 0, stage2: { chosen: null, level: 0 }, stage3: { chosen: null, level: 0 } },
        multishot: { stage1: 0, stage2: { chosen: null, level: 0 }, stage3: { chosen: null, level: 0 } },
        holy_shield: { stage1: 0, stage2: { chosen: null, level: 0 }, stage3: { chosen: null, level: 0 } }
    },
    targetX: null, targetY: null, targetItem: null, attacking: false, attackCooldown: 0, attackAnim: 0,
    animTime: 0, moving: false, wasMoving: false, heroAction: null, heroActionTimer: 0,
    skillCooldowns: { fireball: 0, thunder: 0, multishot: 0 },
    // shieldsystem
    shield: {
        active: false,
        value: 0,
        maxValue: 0,
        timer: 0,
        cooldown: 0,
        type: null,
        stage3: null,
        invincibleTimer: 0
    },
// Store the currently active lightning VFX
    activeLightning: null,
    equipment: {
        mainhand: null, offhand: null, body: null, ring: null,
        helm: null, gloves: null, boots: null, belt: null, amulet: null
    },
    // settrack - recordcurrentwornsetpiecenumber { 'tals_set': 3, 'immortal_king': 2 }
    equippedSets: {},
// Record next boss respawn timestamps per floor (ms)
    bossRespawn: {},
    inventory: Array(30).fill(null),
    stash: Array(36).fill(null), // stash，base36grid
    stashLevel: 0, // Stash expansion level (0-3), +6 slots each
    questIndex: 0, questState: 0, questProgress: 0,
    died: false,
    achievements: {},
// Waypoint system - activated floor list; 0 is town (on by default)
    activatedWaypoints: [0],
// Auto-pickup settings
    autoPickup: {
        gold: true,      // Auto-pickup gold
        potion: true,    // Auto-pickup potions
        scroll: true     // Auto-pickup scrolls
    },
// Auto battle hire cost reminder acknowledged
    autoBattleFeeNotified: false,
    // hit feedbackSet
    juiceEnabled: false, // Hit-feel enhancements off by default
// Graphics quality settings
    graphicsQuality: 'high',  // 'high' = fancy VFX, 'low' = performance first
// Difficulty system
    defeatedBaal: false,  // whether Baal is defeated (also unlocks Hell mode)
    isInHell: false,      // currently in Hell
    hellFloor: 1,         // Hell floor（independent of dungeon floor）
// Portal floor memory
    maxFloor: 0,          // Highest floor reached
    lastFloor: 0,         // Floor when last returning to town
    // freezestate
    frozen: false,
    frozenTimer: 0,
    slowedTimer: 0,        // Chill duration (enters after freeze ends)
    freezeImmuneTimer: 0,  // Freeze immunity time
    // poisonstate
    poisoned: false,
    poisonTimer: 0,
    poisonDamage: 0,
    lastPoisonTick: 0,
// Drop system - accumulating luck mechanic
    luckAccumulator: 0,       // Accumulated luck (+1 per kill without a good drop)
    killsSincePotion: 0,      // Kills since the last consumable drop
    // Talent shop system
    talents: [],              // Array of active talent ids
    talentShop: [],           // Talents currently in the shop (3)
    phoenixUsed: false,       // whether the Phoenix talent was used (reset on each dungeon entry)
    highestTalentFloor: 0,        // Deepest normal-mode floor with a triggered shop (prevents shop farming)
    highestHellTalentFloor: 0,    // deepest floor with a triggered Hell talent shop
    // Divine Blessingsystem（foreverlong-lasting）
    divineBlessing: {
        pending: 0,           // Pending claims (0-3)
        obtained: []          // Obtained blessing list
    },
    lastBlessingLevel: 0,     // Level of the last blessing trigger (prevents repeats)
    // Title system
    currentTitle: 'none',      // currently equipped title id
    ownedTitles: ['none'],     // owned title id list
// Daily login reward system
    dailyLogin: {
        lastLoginDate: null,  // Last login date (YYYY-MM-DD)
        consecutiveDays: 0,   // Consecutive login days
        claimedToday: false   // Whether today was claimed
    },
    // deathstate
    isDead: false,        // Whether dead
    deathTimer: 0,        // Seconds of the death animation played (then wait for the revive choice)
    lastDamageSource: null, // Last damage source (for the cause-of-death display)
    invincibleTimer: 0,   // invincibility framestimer
    lightningOverloadTimer: 0, // Lightning overload visual timer
// Statistics (for leaderboards)
    stats: {
        totalGold: 0,         // Total gold earned
        uniqueFound: 0,       // Uniques discovered
        setFound: 0,          // discoverset piece count
        bossKills: 0,         // Bosskillnumber
        eliteKills: 0,        // Elite kills
        maxKillStreak: 0,     // Best kill streak (no potions)
        currentStreak: 0      // Current kill streak
    },
// Personal best records
    personalBest: {
        maxLevel: 1,          // highestlevel
        maxFloor: 0,          // max floor（normal）
        maxHellFloor: 0,      // max floor（Hell）
        maxKills: 0,          // Best kill count
        maxGold: 0,           // Best single-run gold
        fastestBaal: null     // fastest Baal kill (seconds)
    },
// Tutorial system
    tutorial: {
        completed: false,     // Whether the tutorial is done
        step: 0               // nowstep:0=enterdungeon, 1=attackmonster, 2=pickupitem, 3=openbackpack, 4=useskill
    },
    // offline rewardssystem
    lastOnlineTime: null,     // Last online timestamp (offline duration calc)
    offlineRewardsClaimed: false  // Whether offline rewards were claimed (false initially, set true after the first game entry)
};

function createDefaultSkillTree(skills) {
    const sourceSkills = skills === undefined || skills === null ? { fireball: 1, thunder: 0, multishot: 0 } : skills;
    const stage1Level = (skillId, defaultLevel) => {
        const rawValue = sourceSkills[skillId];
        const level = Number.isFinite(rawValue) ? rawValue : defaultLevel;
        return Math.max(0, Math.min(level, SKILL_TREE_MAX_LEVEL));
    };

    return {
        fireball: { stage1: stage1Level('fireball', 1), stage2: { chosen: null, level: 0 }, stage3: { chosen: null, level: 0 } },
        thunder: { stage1: stage1Level('thunder', 0), stage2: { chosen: null, level: 0 }, stage3: { chosen: null, level: 0 } },
        multishot: { stage1: stage1Level('multishot', 0), stage2: { chosen: null, level: 0 }, stage3: { chosen: null, level: 0 } },
        holy_shield: { stage1: 0, stage2: { chosen: null, level: 0 }, stage3: { chosen: null, level: 0 } }
    };
}

function ensurePlayerSkillTree() {
    if (!player.skills) player.skills = { fireball: 1, thunder: 0, multishot: 0 };
    if (!player.skillTree) player.skillTree = createDefaultSkillTree(player.skills);

    const defaults = createDefaultSkillTree(player.skills);
    for (const skillId of ['fireball', 'thunder', 'multishot', 'holy_shield']) {
        if (!player.skillTree[skillId]) {
            player.skillTree[skillId] = defaults[skillId];
            continue;
        }

        const tree = player.skillTree[skillId];
        if (!Number.isFinite(tree.stage1)) tree.stage1 = defaults[skillId].stage1;
        if (!tree.stage2) tree.stage2 = { chosen: null, level: 0 };
        if (!Number.isFinite(tree.stage2.level)) tree.stage2.level = 0;
        if (tree.stage2.chosen === undefined) tree.stage2.chosen = null;
        if (!tree.stage3) tree.stage3 = { chosen: null, level: 0 };
        if (!Number.isFinite(tree.stage3.level)) tree.stage3.level = 0;
        if (tree.stage3.chosen === undefined) tree.stage3.chosen = null;
    }
}

// UI visual state (for smooth animations and dirty checks)
let uiDisplayState = {
    hp: 100, hpGhost: 100, mp: 50, mpGhost: 50, xpPct: 0, lvl: -1, gold: -1,
    lastHp: -1, lastHpGhost: -1, lastMp: -1, lastMpGhost: -1, lastXpPct: -1,
    shieldPct: -1,  // Shield percentage
    activeSkill: '',
    lastLowHpState: null,
    lastPoisonedState: null,
    lastFrozenState: null,
    lastOverloadedState: null,
    dirty: true
};

// UI smooth render engine
// UI smooth render engine
function updateSmoothUI(dt) {
    // --- Combo HUD ---
    if (cachedUI.comboHud) {
        if (combo.active && combo.count > 1) {
            cachedUI.comboHud.classList.add('active');
            cachedUI.comboCount.innerText = combo.count;
            const pct = (combo.timer / combo.maxTimer) * 100;
            cachedUI.comboTimerFill.style.width = pct + '%';
            cachedUI.comboCount.style.transform = (combo.scale > 1) ? `scale(${combo.scale})` : 'scale(1)';
        } else {
            cachedUI.comboHud.classList.remove('active');
        }
    }

    // --- Smooth Logic ---
    const targetHp = (player.hp / player.maxHp) * 100;
    if (Math.abs(uiDisplayState.hp - targetHp) > 0.01) uiDisplayState.hp += (targetHp - uiDisplayState.hp) * dt * 8;
    else uiDisplayState.hp = targetHp;

    if (uiDisplayState.hpGhost > uiDisplayState.hp) uiDisplayState.hpGhost += (uiDisplayState.hp - uiDisplayState.hpGhost) * dt * 2.5;
    else uiDisplayState.hpGhost = uiDisplayState.hp;

    const targetMp = (player.mp / player.maxMp) * 100;
    if (Math.abs(uiDisplayState.mp - targetMp) > 0.01) uiDisplayState.mp += (targetMp - uiDisplayState.mp) * dt * 8;
    else uiDisplayState.mp = targetMp;

    if (uiDisplayState.mpGhost > uiDisplayState.mp) uiDisplayState.mpGhost += (uiDisplayState.mp - uiDisplayState.mpGhost) * dt * 2.5;
    else uiDisplayState.mpGhost = uiDisplayState.mp;

    const targetXp = player.xpNext > 0 ? (player.xp / player.xpNext * 100) : 0;
    if (Math.abs(uiDisplayState.xpPct - targetXp) > 0.01) uiDisplayState.xpPct += (targetXp - uiDisplayState.xpPct) * dt * 5;
    else uiDisplayState.xpPct = targetXp;

    // --- Granular DOM Implementation ---
    if (Math.abs(uiDisplayState.hp - uiDisplayState.lastHp) > 0.001) {
        uiDisplayState.lastHp = uiDisplayState.hp;
        if (cachedUI.hpFill) cachedUI.hpFill.style.height = uiDisplayState.hp + '%';
        if (cachedUI.hpText) cachedUI.hpText.innerText = Math.max(0, Math.floor(player.hp));
    }
    if (Math.abs(uiDisplayState.hpGhost - uiDisplayState.lastHpGhost) > 0.001) {
        uiDisplayState.lastHpGhost = uiDisplayState.hpGhost;
        if (cachedUI.hpGhostFill) cachedUI.hpGhostFill.style.height = uiDisplayState.hpGhost + '%';
    }
    if (Math.abs(uiDisplayState.mp - uiDisplayState.lastMp) > 0.001) {
        uiDisplayState.lastMp = uiDisplayState.mp;
        if (cachedUI.mpFill) cachedUI.mpFill.style.height = uiDisplayState.mp + '%';
        if (cachedUI.mpText) cachedUI.mpText.innerText = Math.max(0, Math.floor(player.mp));
    }
    if (Math.abs(uiDisplayState.mpGhost - uiDisplayState.lastMpGhost) > 0.001) {
        uiDisplayState.lastMpGhost = uiDisplayState.mpGhost;
        if (cachedUI.mpGhostFill) cachedUI.mpGhostFill.style.height = uiDisplayState.mpGhost + '%';
    }

// Shield bar update
    const shieldActive = player.shield?.active && player.shield?.value > 0;
    const shieldValue = shieldActive ? player.shield.value : 0;
    const shieldMax = shieldActive ? player.shield.maxValue : 1;
    const shieldPct = (shieldValue / shieldMax) * 100;
// Shield percentage relative to the HP bar height (shield stacks above the bar)
    const shieldHeightPct = shieldActive ? Math.min(100, (shieldValue / player.maxHp) * 100) : 0;

    if (uiDisplayState.shieldPct !== shieldHeightPct) {
        uiDisplayState.shieldPct = shieldHeightPct;
        if (cachedUI.shieldFill) {
            cachedUI.shieldFill.style.height = shieldHeightPct + '%';
        }
        if (cachedUI.shieldText) {
            cachedUI.shieldText.textContent = shieldActive ? `🛡️${Math.floor(shieldValue)}` : '';
        }
// Shield active state
        if (cachedUI.hpOrb) {
            if (shieldActive) {
                cachedUI.hpOrb.classList.add('shielded');
// Flicker warning when the shield is below 20%
                if (shieldPct < 20) {
                    cachedUI.hpOrb.classList.add('shield-low');
                } else {
                    cachedUI.hpOrb.classList.remove('shield-low');
                }
            } else {
                cachedUI.hpOrb.classList.remove('shielded', 'shield-low');
            }
        }
    }

    if (Math.abs(uiDisplayState.xpPct - uiDisplayState.lastXpPct) > 0.001) {
        uiDisplayState.lastXpPct = uiDisplayState.xpPct;
        if (cachedUI.xpFill) cachedUI.xpFill.style.width = Math.min(100, uiDisplayState.xpPct) + '%';
        if (cachedUI.xpPercentage) cachedUI.xpPercentage.innerText = uiDisplayState.xpPct.toFixed(2) + '%';
    }

    if (uiDisplayState.gold !== player.gold) {
        const oldGold = (uiDisplayState.gold === -1) ? player.gold : uiDisplayState.gold;
        uiDisplayState.gold = player.gold;

        cachedUI.goldDisplays.forEach(el => {
            if (el) {
// If visible, play the roll animation; otherwise just set the text
                if (el.offsetParent !== null) {
                    GSAPAnims.countUp(el, oldGold, player.gold, 0.8);
// Accompanied by a small scale pulse
                    if (el.parentElement) GSAPAnims.pulse(el.parentElement, 1.05);
                } else {
                    el.innerText = player.gold.toLocaleString();
                }
            }
        });
    }

    if (uiDisplayState.lvl !== player.lvl) {
        uiDisplayState.lvl = player.lvl;
        if (cachedUI.hudLvl) {
            cachedUI.hudLvl.innerText = player.lvl;
            GSAPAnims.pulse(cachedUI.hudLvl.parentElement, 1.2);
        }
    }

    if (uiDisplayState.activeSkill !== player.activeSkill) {
        uiDisplayState.activeSkill = player.activeSkill;
        if (cachedUI.skillBtns && cachedUI.skillBtns.fireball) {
            for (let k in cachedUI.skillBtns) if (cachedUI.skillBtns[k]) cachedUI.skillBtns[k].classList.remove('active');
            const currentSkill = (player.activeSkill === 'attack') ? 'fireball' : player.activeSkill;
            if (cachedUI.skillBtns[currentSkill]) cachedUI.skillBtns[currentSkill].classList.add('active');
        }
    }

// Poison visual sync
    if (uiDisplayState.lastPoisonedState !== player.poisoned) {
        uiDisplayState.lastPoisonedState = player.poisoned;
        if (cachedUI.hpOrb) {
            if (player.poisoned) cachedUI.hpOrb.classList.add('poisoned');
            else cachedUI.hpOrb.classList.remove('poisoned');
        }
    }

// Freeze/chill visual sync
    const isChilled = (player.frozen || player.slowedTimer > 0);
    if (uiDisplayState.lastFrozenState !== isChilled) {
        uiDisplayState.lastFrozenState = isChilled;
        if (cachedUI.hpOrb) {
            if (isChilled) cachedUI.hpOrb.classList.add('chilled');
            else cachedUI.hpOrb.classList.remove('chilled', 'frozen');
        }
    }

// Lightning overload visual sync
    const isOverloaded = (player.lightningOverloadTimer > 0);
    if (uiDisplayState.lastOverloadedState !== isOverloaded) {
        uiDisplayState.lastOverloadedState = isOverloaded;
        if (cachedUI.mpOrb) {
            if (isOverloaded) cachedUI.mpOrb.classList.add('overloaded');
            else cachedUI.mpOrb.classList.remove('overloaded');
        }
    }

// Low-HP warning dirty check
    const hpPercent = player.hp / player.maxHp;
    const isLowHp = hpPercent < 0.2 && player.hp > 0;
    if (uiDisplayState.lastLowHpState !== isLowHp) {
        uiDisplayState.lastLowHpState = isLowHp;
        if (cachedUI.lowHpVignette) {
            if (isLowHp) cachedUI.lowHpVignette.classList.add('active');
            else cachedUI.lowHpVignette.classList.remove('active');
        }
    }

    // --- Throttled Updates (10Hz) ---
    const now = Date.now();
    if (!uiDisplayState.lastThrottleTime || now - uiDisplayState.lastThrottleTime > 100) {
        uiDisplayState.lastThrottleTime = now;
        updateBuffIndicators();
        updateSkillCooldownUI();
        updateHellIndicator();
    }
}

// ========== Daily login reward config ==========
const DAILY_LOGIN_REWARDS = [
    { day: 1, icon: '💰', name: '200 Gold', type: 'gold', amount: 200 },
    { day: 2, icon: '💰', name: '12h Double Gold', type: 'buff_gold', amount: 12 },
    { day: 3, icon: '⚡', name: '24h Double XP', type: 'buff_xp', amount: 24 },
    { day: 4, icon: '⚡', name: '24h Double XP', type: 'buff_xp', amount: 24 },
    { day: 5, icon: '🎁', name: '24h Double Drops', type: 'buff_drop', amount: 24 },
    { day: 6, icon: '⚡', name: '24h Double XP', type: 'buff_xp', amount: 24 },
    { day: 7, icon: '🔥', name: '24h Triple XP + Set Gear', type: 'buff_xp_triple', amount: 24 }
];

// ========== Divine Blessing pool (reuses talent shop stat keys at roughly 1/3 value) ==========
const MAX_BLESSING_STACK = 3;  // Each blessing can be obtained at most 3 times

const DIVINE_BLESSING_POOL = [
// Offensive (matching the talent shop)
    { id: 'db_flame', name: 'Flame Soul', icon: '🔥', effect: { fireDmgPct: 10 }, rareEffect: { fireDmgPct: 15 } },
    { id: 'db_crit', name: 'Critical Master', icon: '🎯', effect: { critChance: 5, critDamage: 10 }, rareEffect: { critChance: 8, critDamage: 15 } },
    { id: 'db_dmg', name: 'Berserker', icon: '😡', effect: { dmgPct: 15 }, rareEffect: { dmgPct: 25 } },
    { id: 'db_poison', name: 'Poison Blade', icon: '☠️', effect: { poisonDmgPct: 8 }, rareEffect: { poisonDmgPct: 12 } },
    // defenseclass
    { id: 'db_def', name: 'Iron Wall', icon: '🛡️', effect: { def: 25 }, rareEffect: { def: 40 } },
    { id: 'db_ls', name: 'Vampirism', icon: '🧛', effect: { lifeSteal: 3 }, rareEffect: { lifeSteal: 5 } },
    { id: 'db_hpregen', name: 'Regeneration', icon: '💚', effect: { hpRegenPct: 0.5 }, rareEffect: { hpRegenPct: 1 } },
    { id: 'db_res', name: 'Elemental Ward', icon: '🌈', effect: { allRes: 8 }, rareEffect: { allRes: 12 } },
    { id: 'db_thorns', name: 'Steel Thorns', icon: '🌵', effect: { thornsPct: 6 }, rareEffect: { thornsPct: 10 } },
// Utility
    { id: 'db_mana', name: 'Mana Flow', icon: '🔮', effect: { maxMp: 15, mpRegenPct: 1 }, rareEffect: { maxMp: 25, mpRegenPct: 2 } },  // reduced from 3/5% to 1/2%
    { id: 'db_gold', name: 'Greed', icon: '💰', effect: { goldPct: 15 }, rareEffect: { goldPct: 25 } },
    { id: 'db_drop', name: 'Treasure Hunter', icon: '🗝️', effect: { dropRatePct: 10 }, rareEffect: { dropRatePct: 15 } },
    { id: 'db_blood', name: 'Bloodlust', icon: '🩸', effect: { onKillHealPct: 2 }, rareEffect: { onKillHealPct: 3 } }
];

const spriteSheet = new Image();

let spritesLoaded = false;
let processedSpriteSheet = null;
const TintCache = {
    white: null,  // Hit flash white
    ice: null,    // iceseal/slow
    poison: null, // poison
    lightning: null // Lightning overload
};

// Generate tinted sprite variants (filter pre-processing gives high quality without runtime cost)
function createTintedSpriteSheet(source, filterStr) {
    const canvas = document.createElement('canvas');
    canvas.width = source.width;
    canvas.height = source.height;
    const ctx = canvas.getContext('2d');
    ctx.filter = filterStr;
    ctx.drawImage(source, 0, 0);
    return canvas;
}
// --- Hero Animation Sprites ---
const heroSpriteSheet = new Image();
let heroSpritesLoaded = false;
let processedHeroSprites = null;
const HeroTintCache = SpriteRenderer.createTintCache();
const ACTOR_RENDER_SIZE = 88;

const HERO_SPRITE_CONFIG = {
    cols: 4,
    rows: 22,
    frameWidth: 128,
    frameHeight: 128,
    renderSize: ACTOR_RENDER_SIZE,
    fps: { idle: 3, walk: 7, attack: 10, cast: 8, sit: 2, hurt: 8 },
    rowsByAction: {
        idle: {
            front: { row: 0 }, back: { row: 1 }, left: { row: 2 }, right: { row: 3 }
        },
        walk: {
            front: { row: 4 }, back: { row: 5 }, left: { row: 6 }, right: { row: 6, flipX: true },
            frontLeft: { row: 18 }, frontRight: { row: 19 },
            backLeft: { row: 20 }, backRight: { row: 21 }
        },
        attack: {
            front: { row: 7 }, back: { row: 8 }, left: { row: 9 }, right: { row: 9, flipX: true }
        },
        cast: {
            front: { row: 10 }, back: { row: 11 }, left: { row: 12 }, right: { row: 13 }
        },
        sit: {
            front: { row: 14 }, back: { row: 15 }, left: { row: 16 }, right: { row: 17 }
        },
        hurt: {
            front: { row: 0 }, back: { row: 1 }, left: { row: 2 }, right: { row: 3 }
        }
    }
};

// ========== 4x4 Paperdoll (Modular Body & Head) System ==========
const PaperdollSystem = {
    enabled: true,
    cols: 4,
    rows: 4,
    rowMap: {
        'front': 0,       // Sur (South / Down)
        'frontLeft': 1,   // Izquierda
        'frontRight': 2,  // Derecha
        'left': 1,        // Izquierda (Left)
        'backLeft': 1,    // Izquierda
        'right': 2,       // Derecha (Right)
        'backRight': 2,   // Derecha
        'back': 3         // Norte (North / Up)
    },

    // Calibración de escala balanceada por dirección (Frente, Lados y Espalda uniformes)
    calibration: {
        baseHeight: 96,
        body: {
            scale: 1.02,
            directionalScales: {
                'front': 1.04,
                'frontLeft': 1.02,
                'frontRight': 1.02,
                'left': 1.02,
                'backLeft': 1.02,
                'right': 1.02,
                'backRight': 1.02,
                'back': 1.02
            },
            offsetX: 0,
            offsetY: 0
        },
        head: {
            scale: 0.54,
            directionalScales: {
                'front': 0.55,
                'frontLeft': 0.54,
                'frontRight': 0.54,
                'left': 0.54,
                'backLeft': 0.54,
                'right': 0.54,
                'backRight': 0.54,
                'back': 0.54
            },
            directionalOffsets: {
                'front':     { x: 0,  y: -35 },
                'frontLeft': { x: 1,  y: -35 },
                'frontRight':{ x: -1, y: -35 },
                'left':      { x: 1,  y: -35 },
                'backLeft':  { x: 1,  y: -35 },
                'right':     { x: -1, y: -35 },
                'backRight': { x: -1, y: -35 },
                'back':      { x: 0,  y: -35 }
            }
        }
    },

    headCalibrations: {},

    bodyImages: {},
    currentBodyKey: 'default',
    headImages: {},
    currentHeadKey: 'default',

    // Cargar imagen de cuerpo (Body / Armor)
    loadBody(key, url, callback) {
        if (!url) return;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            this.bodyImages[key] = img;
            if (callback) callback(img);
        };
        img.onerror = () => {
            let altUrl = '';
            if (url.startsWith('public/')) {
                altUrl = url.substring(7);
            } else if (!url.startsWith('http') && !url.startsWith('/')) {
                altUrl = 'public/' + url;
            }
            if (altUrl && altUrl !== url) {
                const altImg = new Image();
                altImg.crossOrigin = 'anonymous';
                altImg.onload = () => {
                    this.bodyImages[key] = altImg;
                    if (callback) callback(altImg);
                };
                altImg.onerror = () => {
                    console.warn(`[PaperdollSystem] Error al cargar cuerpo '${key}' desde ${url} y ${altUrl}`);
                };
                altImg.src = altUrl;
            } else {
                console.warn(`[PaperdollSystem] Error al cargar cuerpo '${key}' desde ${url}`);
            }
        };
        img.src = url;
    },

    // Cargar imagen de cabeza (Head / Helmet)
    loadHead(key, url, callback) {
        if (!url) return;
        if (this.headImages[key] && this.headImages[key].complete && this.headImages[key].naturalWidth > 0) {
            if (callback) callback(this.headImages[key]);
            return;
        }
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            this.headImages[key] = img;
            if (callback) callback(img);
        };
        img.onerror = () => {
            let altUrl = '';
            if (url.startsWith('public/')) {
                altUrl = url.substring(7);
            } else if (!url.startsWith('http') && !url.startsWith('/')) {
                altUrl = 'public/' + url;
            }
            if (altUrl && altUrl !== url) {
                const altImg = new Image();
                altImg.crossOrigin = 'anonymous';
                altImg.onload = () => {
                    this.headImages[key] = altImg;
                    if (callback) callback(altImg);
                };
                altImg.onerror = () => {
                    console.warn(`[PaperdollSystem] Error al cargar cabeza '${key}' desde ${url} y ${altUrl}`);
                };
                altImg.src = altUrl;
            } else {
                console.warn(`[PaperdollSystem] Error al cargar cabeza '${key}' desde ${url}`);
            }
        };
        img.src = url;
    },

    setBody(key) {
        this.currentBodyKey = key;
    },

    setHead(key) {
        this.currentHeadKey = key;
    },

    getBodyImage() {
        return this.bodyImages[this.currentBodyKey] || this.bodyImages['default'] || null;
    },

    getHeadImage() {
        return this.headImages[this.currentHeadKey] || this.headImages['default'] || null;
    },

    getFrame(direction, isMoving, animTime) {
        const row = this.rowMap[direction] ?? 0;
        const col = isMoving ? Math.floor((animTime || 0) * 8) % 4 : 0;
        return { row, col };
    },

    setHeadCalibration(headKey, scale, directionalOffsets) {
        this.headCalibrations[headKey] = { scale, directionalOffsets };
    },

    getHeadCalibration(headKey) {
        return this.headCalibrations[headKey] || this.calibration.head;
    },

    initDefaults() {
        // Cargar cabeza base del jugador
        const baseHeadUrl = 'public/players/Jobs/base_head_spritesheet.png';
        this.loadHead('default', baseHeadUrl);

        // Cargar cuerpo base sin armadura (Npc-06.webp)
        const defaultBodyUrl = 'public/spritesheets/Npc-06.webp';
        this.loadBody('default', defaultBodyUrl);

        // Precargar armaduras base comunes si están definidas en items-data.js
        if (typeof BASE_ARMOR_SPRITES !== 'undefined') {
            for (const [key, url] of Object.entries(BASE_ARMOR_SPRITES)) {
                this.loadBody(`base_armor_${key}`, url);
            }
        }

        // Precargar todos los sets de armadura para cambio visual instantáneo sin parpadeo
        const setMap = typeof SET_BODY_SPRITES !== 'undefined' ? SET_BODY_SPRITES : {};
        for (const [setId, url] of Object.entries(setMap)) {
            this.loadBody(`set_body_${setId}`, url);
        }
    },

    // Actualizar cuerpo según la armadura o kit de Set equipado (mínimo 2 partes equipadas para activar el sprite del Set)
    updateEquipmentBody(armorItem) {
        const setCounts = typeof calculateEquippedSets === 'function' ? calculateEquippedSets() : (player.equippedSets || {});
        let activeSetBodyKey = null;
        let activeSetBodyUrl = null;
        let maxCount = 0;

        const setMap = typeof SET_BODY_SPRITES !== 'undefined' ? SET_BODY_SPRITES : {};

        // Priorizar el Set con mayor cantidad de piezas equipadas (mínimo 2 requeridas).
        // En caso de empate (ej. 2 de un Set y 2 de otro), si el jugador lleva la armadura de pecho de uno de ellos, se prioriza ese Set.
        const bodySetId = (armorItem && armorItem.setId) ? armorItem.setId : null;

        for (const [setId, count] of Object.entries(setCounts)) {
            if (count >= 2 && setMap[setId]) {
                const isPreferred = (count > maxCount) || (count === maxCount && setId === bodySetId);
                if (isPreferred) {
                    maxCount = count;
                    activeSetBodyKey = `set_body_${setId}`;
                    activeSetBodyUrl = setMap[setId];
                }
            }
        }

        // Si se cumple la condición del Set (2 o más partes equipadas de ese Set),
        // aplicar la apariencia visual completa del Set en el Paperdoll del jugador
        if (activeSetBodyKey && activeSetBodyUrl) {
            this.setBody(activeSetBodyKey);
            if (!this.bodyImages[activeSetBodyKey]) {
                this.loadBody(activeSetBodyKey, activeSetBodyUrl);
            }
            return;
        }

        // Si NO se cumple la condición de Set (menos de 2 partes):
        // 1. Si armorItem es una pieza de Set (tiene setId), NO debe otorgar la apariencia del Set (requiere >= 2 partes).
        // 2. Si es una armadura normal con spriteUrl individual (no una pieza de Set incompleta), aplicar su sprite.
        if (armorItem) {
            const isSetPiece = Boolean(armorItem.setId);
            if (!isSetPiece && armorItem.spriteUrl) {
                const armorKey = armorItem.paperdollBodyKey || `armor_${armorItem.name || 'custom'}`;
                this.setBody(armorKey);
                if (!this.bodyImages[armorKey]) {
                    this.loadBody(armorKey, armorItem.spriteUrl);
                }
                return;
            }
        }

        // Fallback al cuerpo base por defecto (Npc-06 sin armadura)
        this.setBody('default');
    }
};

// Inicializar Paperdoll por defecto
PaperdollSystem.initDefaults();

// ========== NPC Spritesheet System (Independent from Player Paperdoll) ==========
const NPCSpriteSystem = {
    cache: {},
    defaultMap: {
        'merchant': {
            body: 'public/spritesheets/Npc-00.webp',
            head: 'public/players/Jobs/hair01_head_spritesheet.png'
        },   // Gheed the gambler merchant
        'healer': {
            body: 'public/spritesheets/Npc-01.webp',
            head: 'public/players/Jobs/hair06_head_spritesheet.png'
        },     // Akara
        'stash': {
            body: 'public/spritesheets/Npc-02.webp',
            head: 'public/players/Jobs/hair02_head_spritesheet.png'
        },      // Warriv (stash)
        'blacksmith': {
            body: 'public/spritesheets/Npc-03.webp',
            head: 'public/players/Jobs/hair03_head_spritesheet.png'
        }, // Charsi the blacksmith
        'difficulty': {
            body: 'public/spritesheets/Npc-04.webp',
            head: 'public/players/Jobs/hair04_head_spritesheet.png'
        }, // abyss warden (Abyss Guard)
        'respec': {
            body: 'public/spritesheets/Npc-05.webp',
            head: 'public/players/Jobs/hair05_head_spritesheet.png'
        },     // godhiddensageone who (Mystic Sage)
    },
    bodyPool: [
        'public/spritesheets/Npc-00.webp',
        'public/spritesheets/Npc-01.webp',
        'public/spritesheets/Npc-02.webp',
        'public/spritesheets/Npc-03.webp',
        'public/spritesheets/Npc-04.webp',
        'public/spritesheets/Npc-05.webp',
        'public/spritesheets/Npc-06.webp',
        'public/spritesheets/Npc-07.webp',
        'public/spritesheets/Npc-08.webp',
        'public/spritesheets/Npc-09.webp',
        'public/spritesheets/Npc-10.webp',
    ],
    headPool: [
        'public/players/Jobs/hair01_head_spritesheet.png',
        'public/players/Jobs/hair06_head_spritesheet.png',
        'public/players/Jobs/hair02_head_spritesheet.png',
        'public/players/Jobs/hair03_head_spritesheet.png',
        'public/players/Jobs/hair04_head_spritesheet.png',
        'public/players/Jobs/hair05_head_spritesheet.png',
        'public/players/Jobs/hair07_head_spritesheet.png',
        'public/players/Jobs/base_head_spritesheet.png',
    ],
    init() {
        // Preload all individual NPC bodies to prevent pop-in
        for (let i = 0; i <= 10; i++) {
            const pad = String(i).padStart(2, '0');
            this.loadImage(`public/spritesheets/Npc-${pad}.webp`);
        }
        // Preload all NPC heads
        for (const h of this.headPool) {
            this.loadImage(h);
        }
    },
    normalizeUrl(url) {
        if (!url) return '';
        if (typeof url === 'number') {
            const pad = String(url).padStart(2, '0');
            return `public/spritesheets/Npc-${pad}.webp`;
        }
        if (/^Npc-\d\d(\.webp)?$/i.test(url)) {
            const num = url.replace(/[^0-9]/g, '').padStart(2, '0');
            return `public/spritesheets/Npc-${num}.webp`;
        }
        if (/^npc[_-]?\d\d(\.webp)?$/i.test(url)) {
            const num = url.replace(/[^0-9]/g, '').padStart(2, '0');
            return `public/spritesheets/Npc-${num}.webp`;
        }
        if (/^hair0\d/i.test(url) && !url.includes('/')) {
            return `public/players/Jobs/${url}.png`;
        }
        return url;
    },
    loadImage(url) {
        if (!url) return null;
        url = this.normalizeUrl(url);
        if (this.cache[url]) return this.cache[url];

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            this.cache[url] = img;
        };
        img.onerror = () => {
            let altUrl = '';
            if (url.startsWith('public/')) {
                altUrl = url.substring(7);
            } else if (!url.startsWith('http') && !url.startsWith('/')) {
                altUrl = 'public/' + url;
            }
            if (altUrl && altUrl !== url) {
                const altImg = new Image();
                altImg.crossOrigin = 'anonymous';
                altImg.onload = () => {
                    this.cache[url] = altImg;
                    this.cache[altUrl] = altImg;
                };
                altImg.src = altUrl;
            }
        };
        img.src = url;
        this.cache[url] = img;
        return img;
    },
    getSprite(npc, index = 0) {
        if (!npc) return { body: null, head: null };
        let bodyUrl = npc.spriteUrl || npc.spriteSheet || npc.spritesheet;
        let headUrl = npc.headUrl || npc.headSheet;

        const defaultEntry = (npc.type && this.defaultMap[npc.type]) || null;

        if (!bodyUrl) {
            if (npc.spriteIndex !== undefined) {
                const pad = String(npc.spriteIndex).padStart(2, '0');
                bodyUrl = `public/spritesheets/Npc-${pad}.webp`;
            } else if (defaultEntry && defaultEntry.body) {
                bodyUrl = defaultEntry.body;
            } else if (npc.name) {
                let hash = 0;
                for (let i = 0; i < npc.name.length; i++) hash = ((hash << 5) - hash) + npc.name.charCodeAt(i);
                bodyUrl = this.bodyPool[Math.abs(hash) % this.bodyPool.length];
            } else {
                bodyUrl = this.bodyPool[index % this.bodyPool.length];
            }
        }

        if (!headUrl) {
            if (defaultEntry && defaultEntry.head) {
                headUrl = defaultEntry.head;
            } else if (npc.name) {
                let hash = 0;
                for (let i = 0; i < npc.name.length; i++) hash = ((hash << 5) - hash) + npc.name.charCodeAt(i);
                headUrl = this.headPool[Math.abs(hash) % this.headPool.length];
            } else {
                headUrl = this.headPool[index % this.headPool.length];
            }
        }

        bodyUrl = this.normalizeUrl(bodyUrl);
        headUrl = this.normalizeUrl(headUrl);

        const bodyImg = (this.cache[bodyUrl] && this.cache[bodyUrl].complete && this.cache[bodyUrl].naturalWidth > 0)
            ? this.cache[bodyUrl] : this.loadImage(bodyUrl);
        const headImg = (this.cache[headUrl] && this.cache[headUrl].complete && this.cache[headUrl].naturalWidth > 0)
            ? this.cache[headUrl] : this.loadImage(headUrl);

        return { body: bodyImg, head: headImg };
    }
};

NPCSpriteSystem.init();

// ========== Dynamic Touch Joystick System ==========
const TouchJoystick = {
    active: false,
    startX: 0,
    startY: 0,
    currX: 0,
    currY: 0,
    maxRadius: 50,
    touchId: null,

    start(touchId, x, y) {
        this.active = true;
        this.touchId = touchId;
        this.startX = x;
        this.startY = y;
        this.currX = x;
        this.currY = y;
    },

    move(x, y) {
        if (!this.active) return;
        this.currX = x;
        this.currY = y;
    },

    end() {
        this.active = false;
        this.touchId = null;
    },

    getVector() {
        if (!this.active) return { x: 0, y: 0, dist: 0 };
        const dx = this.currX - this.startX;
        const dy = this.currY - this.startY;
        const dist = Math.hypot(dx, dy);
        if (dist < 4) return { x: 0, y: 0, dist: 0 };
        const clamped = Math.min(dist, this.maxRadius);
        return {
            x: (dx / dist) * (clamped / this.maxRadius),
            y: (dy / dist) * (clamped / this.maxRadius),
            dist: clamped
        };
    },

    draw(ctx) {
        if (!this.active) return;
        ctx.save();

        // Anillo Base Exterior
        ctx.beginPath();
        ctx.arc(this.startX, this.startY, this.maxRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.stroke();

        // Anillo Guía Interior
        ctx.beginPath();
        ctx.arc(this.startX, this.startY, this.maxRadius * 0.45, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Botón Móvil (Stick Knob)
        const vec = this.getVector();
        const knobX = this.startX + vec.x * this.maxRadius;
        const knobY = this.startY + vec.y * this.maxRadius;

        ctx.beginPath();
        ctx.arc(knobX, knobY, 20, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(knobX - 4, knobY - 4, 2, knobX, knobY, 20);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        grad.addColorStop(0.6, 'rgba(234, 179, 8, 0.85)');
        grad.addColorStop(1, 'rgba(161, 98, 7, 0.65)');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        ctx.restore();
    }
};

const SKILL_IMPACT_PALETTES = {
    fireball: {
        core: '#fff3b0',
        main: '#ff6a18',
        glow: 'rgba(255, 82, 20, 0.34)',
        ember: '#ffbb55',
        ring: '#ff8a2a'
    },
    thunder: {
        core: '#ffffff',
        main: '#92e8ff',
        glow: 'rgba(95, 210, 255, 0.32)',
        ember: '#dff8ff',
        ring: '#66cfff'
    },
    multishot: {
        core: '#ffffcc',
        main: '#baff42',
        glow: 'rgba(178, 255, 68, 0.24)',
        ember: '#f7ff88',
        ring: '#d8ff5a'
    }
};

const SKILL_IMPACT_VFX = {
    fireball: 'fireballImpact',
    thunder: 'thunderImpact',
    multishot: 'multishotImpact'
};

const PROJECTILE_VFX = {
    fireball: 'fireballProjectile',
    lightning_ball: 'lightningProjectile',
    multishot: 'multishotProjectile',
    tentacle: 'tentacleProjectile'
};

const COMBAT_FEEDBACK_VFX = {
    meleeSlash: 'meleeSlashHit',
    criticalHit: 'criticalHitBurst',
    guardFlash: 'guardFlash'
};

const CAST_SOURCE_VFX = {
    fireball: 'fireballCastSource',
    thunder: 'thunderCastSource',
    multishot: 'multishotCastSource',
    enemyArrow: 'enemyArrowMuzzle',
    enemyLightning: 'enemyLightningMuzzle'
};

const KILL_FEEDBACK_VFX = {
    normal: 'monsterDeathDust',
    elite: 'eliteDeathBurst',
    boss: 'bossDeathBurst'
};

const scheduledMonsterAttacks = [];

const PLAYER_DAMAGE_VFX = {
    physical: 'playerPhysicalHit',
    fire: 'playerFireHit',
    cold: 'playerColdHit',
    lightning: 'playerLightningHit',
    poison: 'playerPoisonHit',
    lowHp: 'playerLowHpPulse'
};

const ELITE_AFFIX_AURA_VFX = {
    fire_enchanted: 'affixFireAura',
    cold_enchanted: 'affixColdAura',
    lightning_enchanted: 'affixLightningAura',
    extra_fast: 'affixThreatAura',
    extra_strong: 'affixThreatAura',
    vampiric: 'affixThreatAura',
    multiple_shot: 'affixThreatAura',
    stone_skin: 'affixDefenseAura',
    magic_resistant: 'affixDefenseAura',
    mana_burn: 'affixArcaneAura',
    cursed: 'affixArcaneAura',
    spectral_hit: 'affixArcaneAura'
};

const VFX_SPRITE_CONFIG = window.VFX_SPRITE_MANIFEST;
const vfxSpriteSheet = new Image();
let vfxSpritesLoaded = false;

if (VFX_SPRITE_CONFIG?.sheet) {
    vfxSpriteSheet.src = VFX_SPRITE_CONFIG.sheet;
    vfxSpriteSheet.onload = () => {
        vfxSpritesLoaded = true;
    };
    vfxSpriteSheet.onerror = () => {
        console.error('VFX sprite sheet failed to load:', VFX_SPRITE_CONFIG.sheet);
    };
} else {
    console.error('VFX_SPRITE_MANIFEST is missing.');
}

function spawnVfxEffect(effectId, x, y, scale = 1, rotation = 0) {
    if (effectId === 'poisonStatusBurst' || effectId === 'playerPoisonHit') {
        emitDriftingVeil(x, y, COLORS.poison, 22 * scale);
        return;
    }
    const effect = VFX_SPRITE_CONFIG?.effects?.[effectId];
    if (!effect) return;

    vfxEffects.push({
        effectId,
        x,
        y,
        scale,
        rotation,
        age: 0,
        duration: effect.frameCount / effect.fps
    });
}

function drawVfxEffect(ctx, fx) {
    const effect = VFX_SPRITE_CONFIG?.effects?.[fx.effectId];
    if (!vfxSpritesLoaded || !effect) return;

    const frameIndex = Math.min(effect.frameCount - 1, Math.floor(fx.age * effect.fps));
    const sx = frameIndex * effect.frameWidth;
    const sy = effect.row * effect.frameHeight;
    const renderSize = (effect.renderSize || effect.frameWidth) * (fx.scale || 1);
    const scale = renderSize / effect.frameWidth;
    const dx = fx.x - (effect.pivotX || effect.frameWidth / 2) * scale;
    const dy = fx.y - (effect.pivotY || effect.frameHeight / 2) * scale;

    ctx.save();
    if (effect.blend) ctx.globalCompositeOperation = effect.blend;
    if (fx.rotation) {
        ctx.translate(fx.x, fx.y);
        ctx.rotate(fx.rotation);
        ctx.drawImage(
            vfxSpriteSheet,
            sx, sy, effect.frameWidth, effect.frameHeight,
            dx - fx.x, dy - fx.y, renderSize, renderSize
        );
    } else {
        ctx.drawImage(
            vfxSpriteSheet,
            sx, sy, effect.frameWidth, effect.frameHeight,
            dx, dy, renderSize, renderSize
        );
    }
    ctx.restore();
}

function drawProjectileVfx(ctx, p) {
    if (typeof Elemental3D !== 'undefined' && Elemental3D.meteor(ctx,p,player.graphicsQuality !== 'low')) return true;
    const effectId = PROJECTILE_VFX[p.type] || (p.isTentacle ? PROJECTILE_VFX.tentacle : null);
    const effect = effectId ? VFX_SPRITE_CONFIG?.effects?.[effectId] : null;
    if (!vfxSpritesLoaded || !effect) return false;

    const frameIndex = Math.floor((p.age || 0) * effect.fps) % effect.frameCount;
    const sx = frameIndex * effect.frameWidth;
    const sy = effect.row * effect.frameHeight;
    const renderSize = effect.renderSize || effect.frameWidth;
    const scale = renderSize / effect.frameWidth;
    const dx = -(effect.pivotX || effect.frameWidth / 2) * scale;
    const dy = -(effect.pivotY || effect.frameHeight / 2) * scale;

    ctx.save();
    if (effect.blend) ctx.globalCompositeOperation = effect.blend;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle || 0);
    ctx.drawImage(
        vfxSpriteSheet,
        sx, sy, effect.frameWidth, effect.frameHeight,
        dx, dy, renderSize, renderSize
    );
    ctx.restore();
    return true;
}

function drawLoopingVfxEffect(ctx, effectId, x, y, scale = 1, rotation = 0, time = Date.now() / 1000) {
    const effect = VFX_SPRITE_CONFIG?.effects?.[effectId];
    if (!vfxSpritesLoaded || !effect) return false;

    const frameIndex = Math.floor(time * effect.fps) % effect.frameCount;
    const sx = frameIndex * effect.frameWidth;
    const sy = effect.row * effect.frameHeight;
    const renderSize = (effect.renderSize || effect.frameWidth) * scale;
    const frameScale = renderSize / effect.frameWidth;
    const dx = x - (effect.pivotX || effect.frameWidth / 2) * frameScale;
    const dy = y - (effect.pivotY || effect.frameHeight / 2) * frameScale;

    ctx.save();
    if (effect.blend) ctx.globalCompositeOperation = effect.blend;
    if (rotation) {
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.drawImage(
            vfxSpriteSheet,
            sx, sy, effect.frameWidth, effect.frameHeight,
            dx - x, dy - y, renderSize, renderSize
        );
    } else {
        ctx.drawImage(
            vfxSpriteSheet,
            sx, sy, effect.frameWidth, effect.frameHeight,
            dx, dy, renderSize, renderSize
        );
    }
    ctx.restore();
    return true;
}

function getEliteAffixAuraIds(enemy) {
    if (!enemy?.eliteAffixes?.length) return [];

    const auraIds = [];
    for (let i = 0; i < enemy.eliteAffixes.length; i++) {
        const effectId = ELITE_AFFIX_AURA_VFX[enemy.eliteAffixes[i].id];
        if (!effectId || auraIds.includes(effectId)) continue;
        auraIds.push(effectId);
        if (auraIds.length >= 2) break;
    }
    return auraIds;
}

function drawEliteAffixAuras(ctx, enemy, x, y) {
    const auraIds = getEliteAffixAuraIds(enemy);
    if (auraIds.length === 0) return;

    const baseScale = (enemy.isBoss ? 1.32 : (enemy.rarity > 0 ? 0.92 : 0.78)) * (ACTOR_RENDER_SIZE / 76);
    const now = Date.now() / 1000;
    for (let i = 0; i < auraIds.length; i++) {
        drawLoopingVfxEffect(ctx, auraIds[i], x, y + 2, baseScale * (1 + i * 0.08), i * 0.2, now + i * 0.17);
    }
}

function spawnCastSourceVfx(effectId, x, y, angle = 0, scale = 1, forward = 14, lift = 14) {
    spawnVfxEffect(
        effectId,
        x + Math.cos(angle) * forward,
        y - lift + Math.sin(angle) * 8,
        scale,
        angle
    );
}

function spawnEnemyDeathVfx(enemy) {
    const profile = getMonsterImpactProfile(enemy);
    if (profile.type === 'spirit') {
        emitDriftingVeil(enemy.x, enemy.y, profile.color, enemy.radius * 1.4);
    } else {
        createImpactParticles(enemy.x, enemy.y, profile.color, enemy.isBoss ? 5 : 3);
    }
}

function spawnMonsterAttackTelegraph(enemy, options) {
    if (!enemy || enemy.dead || !options) return;

    const targetX = options.targetX ?? player.x;
    const targetY = options.targetY ?? player.y;
    const angle = typeof options.angle === 'number' ? options.angle : Math.atan2(targetY - enemy.y, targetX - enemy.x);

    if (options.telegraph === 'projectile') {
        const effectId = options.telegraphVfx || (enemy.elementalDmg?.lightning ? CAST_SOURCE_VFX.enemyLightning : CAST_SOURCE_VFX.enemyArrow);
        spawnCastSourceVfx(effectId, enemy.x, enemy.y, angle, options.telegraphScale || 0.54, 12, 26);
        return;
    }

    if (options.telegraph === 'melee') {
        spawnVfxEffect(COMBAT_FEEDBACK_VFX.guardFlash, enemy.x, enemy.y - 10, enemy.slamHit ? 0.92 : 0.7, angle);
    }
}

function createMonsterAttackAim(enemy, targetX, targetY) {
    if (typeof targetX !== 'number' || typeof targetY !== 'number') {
        throw new Error('Monster attack missing target coordinates');
    }
    return {
        targetX,
        targetY,
        angle: Math.atan2(targetY - enemy.y, targetX - enemy.x)
    };
}

function startMonsterAttack(enemy, options) {
    if (!enemy || enemy.dead || !options || typeof options.resolve !== 'function') return;

    if (enemy.pendingSkill || enemy.combatCue || enemy.recoveryTimer > 0) return;
    const aim = createMonsterAttackAim(enemy, options.targetX, options.targetY);
    setMonsterFacingToward(enemy, aim.targetX, aim.targetY, options.duration);
    triggerMonsterAction(enemy, 'attack', options.duration);
    spawnMonsterAttackTelegraph(enemy, { ...options, targetX: aim.targetX, targetY: aim.targetY, angle: aim.angle });
    const attack = {
        enemy,
        aim,
        timer: options.impactDelay,
        resolve: options.resolve
    };
    scheduledMonsterAttacks.push(attack);
    if (typeof CombatTactics !== 'undefined') CombatTactics.attackStarted(enemy, options, attack);
}

function processScheduledMonsterAttacks(dt) {
    for (let i = scheduledMonsterAttacks.length - 1; i >= 0; i--) {
        const attack = scheduledMonsterAttacks[i];
        if (attack.cancelled) { scheduledMonsterAttacks.splice(i, 1); continue; }
        attack.timer -= dt;
        if (attack.timer > 0) continue;

        scheduledMonsterAttacks.splice(i, 1);
        const enemy = attack.enemy;
        if (enemy?.combatCue === attack) enemy.combatCue = null;
        if (!enemy || enemy.dead || player.isDead || !enemies.includes(enemy)) continue;
        if (enemy.pendingSkill || enemy.recoveryTimer > 0) continue;
        attack.resolve(enemy, attack.aim);
        if (attack.tactic === 'heavy' && typeof CombatTactics !== 'undefined') CombatTactics.recover(enemy, .8);
    }
}

function startRangedEnemyAttack(attacker) {
    if (!attacker || attacker.dead || attacker.cooldown > 0) return false;
    startMonsterAttack(attacker, {
        duration: 0.42,
        impactDelay: 0.18,
        telegraph: 'projectile',
        telegraphVfx: CAST_SOURCE_VFX.enemyArrow,
        targetX: player.x,
        targetY: player.y,
        resolve: (source, aim) => {
            const angle = aim.angle;
            spawnCastSourceVfx(CAST_SOURCE_VFX.enemyArrow, source.x, source.y, angle, 0.7, 18, 34);
            const arrowCount = source.multiShot || 1;
            const spread = arrowCount > 1 ? 0.18 : 0;
            for (let shotIndex = 0; shotIndex < arrowCount; shotIndex++) {
                const shotAngle = angle + (shotIndex - (arrowCount - 1) / 2) * spread;
                projectiles.push(ProjectilePool.acquire({
                    x: source.x + Math.cos(angle) * 18,
                    y: source.y - 36 + Math.sin(angle) * 10,
                    angle: shotAngle,
                    speed: 250,
                    life: 2,
                    damage: source.dmg,
                    color: '#ffaa00',
                    owner: source,
                    sourceName: source.name
                }));
            }
            AudioSys.play('enemy_arrow_cast');
        }
    });
    attacker.cooldown = 2.0;
    return true;
}

function getPlayerDamageFeedbackType(damageType, source) {
    if (damageType && damageType !== 'physical') return damageType;

    if (source?.elementalDmg) {
        let bestType = 'physical';
        let bestValue = 0;
        for (const type of ['fire', 'cold', 'lightning', 'poison']) {
            const value = source.elementalDmg[type] || 0;
            if (value > bestValue) {
                bestValue = value;
                bestType = type;
            }
        }
        if (bestValue > 0) return bestType;
    }

    if (source?.poisonOnHit) return 'poison';
    if (source?.freezeOnHit) return 'cold';
    return 'physical';
}

function spawnPlayerDamageVfx(damageType, source, wasLowHp) {
    const feedbackType = getPlayerDamageFeedbackType(damageType, source);
    const effectId = PLAYER_DAMAGE_VFX[feedbackType] || PLAYER_DAMAGE_VFX.physical;
    const sourceAngle = source ? Math.atan2(player.y - source.y, player.x - source.x) : 0;
    spawnVfxEffect(effectId, player.x, player.y - 12, feedbackType === 'physical' ? 0.78 : 0.86, sourceAngle);

    if (!wasLowHp && player.hp / player.maxHp <= GAME_CONFIG.LOW_HP_THRESHOLD) {
        spawnVfxEffect(PLAYER_DAMAGE_VFX.lowHp, player.x, player.y + 4, 1, 0);
    }
}

function isAffixCompatibleWithEnemy(affix, enemy) {
    if (!affix || !enemy) return false;
    if (affix.allowedAi && !affix.allowedAi.includes(enemy.ai)) return false;
    return true;
}

function rollEliteAffixesForEnemy(enemy) {
    const affixCount = Math.random() < GAME_CONFIG.DOUBLE_AFFIX_RATE ? 2 : 1;
    const availableAffixes = ELITE_AFFIXES.filter(affix => isAffixCompatibleWithEnemy(affix, enemy));
    const rolled = [];

    for (let i = 0; i < affixCount && availableAffixes.length > 0; i++) {
        const idx = Math.floor(Math.random() * availableAffixes.length);
        rolled.push(availableAffixes.splice(idx, 1)[0]);
    }

    return rolled;
}

function applyEliteAffixesToEnemy(enemy) {
    if (!enemy.eliteAffixes || enemy.eliteAffixes.length === 0) return;

    enemy.eliteAffixes.forEach(affix => {
        if (affix.applyStats) affix.applyStats(enemy);
    });

    if (enemy.cursed && !enemy.curseArmorBreak) enemy.curseArmorBreak = 0.35;
    if (enemy.cursed && !enemy.curseDuration) enemy.curseDuration = 4.0;
    enemy.maxHp = enemy.hp;
}

function applyMonsterBaseTraits(enemy, type, dmg) {
    enemy.phaseThrough = false;
    enemy.dodgeChance = 0;
    enemy.poisonOnHit = false;
    enemy.poisonDamage = 0;
    enemy.lifeSteal = 0;
    enemy.slamHit = false;
    enemy.blockChance = 0;

    if (type === 'ghost') {
        enemy.phaseThrough = true;
        enemy.dodgeChance = 0.3;
    } else if (type === 'mummy') {
        enemy.poisonOnHit = true;
        enemy.poisonDamage = Math.floor(dmg * 0.3);
    } else if (type === 'vampire') {
        enemy.lifeSteal = 0.2;
    } else if (type === 'zombie') {
        enemy.slamHit = true;
    } else if (type === 'skeleton') {
        enemy.blockChance = 0.14;
    }
}

function applyEnemyCursedHit(enemy, dealt) {
    if (!enemy || !enemy.cursed || dealt <= 0) return;

    const wasCursed = player.cursedTimer > 0;
    player.cursedTimer = Math.max(player.cursedTimer || 0, enemy.curseDuration || 4.0);
    player.cursedArmorBreak = enemy.curseArmorBreak || 0.35;
    player.curseDamageTakenMult = enemy.curseDamageTakenMult || 1.15;

    if (!wasCursed) {
        createDamageNumber(player.x, player.y - 55, 'Cursed!', '#cc66ff');
        for (let i = 0; i < 6; i++) {
            createParticle(player.x + (Math.random() - 0.5) * 28, player.y - 20 + (Math.random() - 0.5) * 24, '#aa44ff', 3);
        }
    }
}

function applyEnemyProjectileOnHit(enemy, dealt) {
    if (!enemy || dealt <= 0) return;

    applyEnemyCursedHit(enemy, dealt);

    if (enemy.freezeOnHit && !(player.freezeImmuneTimer > 0) && !(player.slowedTimer > 0)) {
        player.frozen = true;
        player.frozenTimer = 0.45 * SkillBranchSystem.controlMultiplier();
        player.frozen = player.frozenTimer > 0;
        createDamageNumber(player.x, player.y - 40, 'Frozen!', COLORS.ice);
    }

    if (enemy.manaBurn) {
        const manaBurned = Math.floor(Math.min(player.mp, dealt * 0.5));
        player.mp -= manaBurned;
        if (manaBurned > 0) createDamageNumber(player.x, player.y - 50, '-' + manaBurned + ' MP', COLORS.manaCost);
    }
}

function calculateEnemyOutgoingDamage(enemy, baseDamage) {
    let totalDamage = baseDamage;

    if (enemy && enemy.elementalDmg) {
        for (const type of ['fire', 'cold', 'lightning', 'poison']) {
            if (enemy.elementalDmg[type]) {
                totalDamage += enemy.elementalDmg[type] * (1 - (player.resistances[type] || 0) / 100);
            }
        }
        if (enemy.elementalDmg.lightning > 0) {
            const wasOverloaded = player.lightningOverloadTimer > 0;
            player.lightningOverloadTimer = 0.5;
            if (!wasOverloaded) spawnVfxEffect('lightningOverloadStatus', player.x, player.y + 4, 1, 0);
        }
    }

    return totalDamage;
}

function emitEnemyScatterVolley(enemy) {
    if (!enemy.scatterVolley || !(enemy.multiShot > 1)) return;
    if (enemy.scatterVolleyCooldown > 0) return;

    const baseAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    spawnCastSourceVfx(
        enemy.elementalDmg?.lightning ? CAST_SOURCE_VFX.enemyLightning : CAST_SOURCE_VFX.enemyArrow,
        enemy.x,
        enemy.y,
        baseAngle,
        enemy.elementalDmg?.lightning ? 0.74 : 0.68,
        16,
        24
    );
    const count = enemy.multiShot;
    const spread = 0.35;
    for (let shotIndex = 0; shotIndex < count; shotIndex++) {
        const shotAngle = baseAngle + (shotIndex - (count - 1) / 2) * spread;
        projectiles.push(ProjectilePool.acquire({
            x: enemy.x + Math.cos(baseAngle) * 16,
            y: enemy.y - 20 + Math.sin(baseAngle) * 8,
            angle: shotAngle,
            speed: 230,
            life: 1.4,
            damage: Math.max(1, Math.floor(enemy.dmg * 0.55)),
            color: enemy.elementalDmg?.lightning ? '#66ccff' : '#ffaa00',
            owner: enemy,
            sourceName: enemy.name,
            type: enemy.elementalDmg?.lightning ? 'lightning_ball' : 'scatter_shot'
        }));
    }
    enemy.scatterVolleyCooldown = 2.2;
    AudioSys.play(enemy.elementalDmg?.lightning ? 'enemy_lightning_cast' : 'enemy_arrow_cast');
}

function resolveEnemyMeleeImpact(enemy, options = {}) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const rangeSq = options.rangeSq ?? GAME_CONFIG.MONSTER_MELEE_RANGE_SQ;
    if (dx * dx + dy * dy > rangeSq) return 0;

    const damageMultiplier = options.damageMultiplier ?? 1;
    const dealt = playerTakeDamage(
        calculateEnemyOutgoingDamage(enemy, enemy.dmg * damageMultiplier),
        enemy,
        { ignoreArmor: enemy.ignoreArmor }
    );

    if (dealt <= 0) return dealt;

    if (options.slamHit) {
        player.slowedTimer = Math.max(player.slowedTimer || 0, 0.35);
        createDamageNumber(player.x, player.y - 60, "Smite!", '#ddaa66');
    }

    applyEnemyCursedHit(enemy, dealt);
    emitEnemyScatterVolley(enemy);

    let lifeStealRatio = 0;
    if (enemy.lifeSteal > 0) {
        lifeStealRatio = enemy.lifeSteal;
    } else if (options.lifeStealFallback > 0) {
        lifeStealRatio = options.lifeStealFallback;
    }
    if (lifeStealRatio > 0) {
        const heal = Math.floor(dealt * lifeStealRatio);
        if (heal > 0) {
            enemy.hp = Math.min(enemy.maxHp, enemy.hp + heal);
            createDamageNumber(enemy.x, enemy.y - 30, "+" + heal, COLORS.green);
        }
    }

    if (enemy.poisonOnHit && enemy.poisonDamage) {
        if (!player.poisoned) {
            spawnVfxEffect('poisonStatusBurst', player.x, player.y + 4, 1, 0);
            createDamageNumber(player.x, player.y - 45, "Poisoned!", COLORS.poison);
        }
        player.poisoned = true;
        player.poisonTimer = Math.max(player.poisonTimer || 0, 3.0);
        player.poisonDamage = Math.max(player.poisonDamage || 0, enemy.poisonDamage);
    }

    if (enemy.freezeOnHit && !(player.freezeImmuneTimer > 0) && !(player.slowedTimer > 0)) {
        player.frozen = true;
        player.frozenTimer = 0.5 * SkillBranchSystem.controlMultiplier();
        player.frozen = player.frozenTimer > 0;
        createDamageNumber(player.x, player.y - 40, "Frozen!", COLORS.ice);
    }

    if (enemy.manaBurn) {
        const manaBurned = Math.floor(Math.min(player.mp, dealt * 0.5));
        player.mp -= manaBurned;
        if (manaBurned > 0) {
            createDamageNumber(player.x, player.y - 50, "-" + manaBurned + " MP", COLORS.manaCost);
        }
    }

    return dealt;
}

function emitMummyDeathCloud(enemy) {
    if (enemy.monsterType !== 'mummy') return;

    const radius = 95;
    emitDriftingVeil(enemy.x, enemy.y, COLORS.poison, radius);

    if (Math.hypot(player.x - enemy.x, player.y - enemy.y) < radius) {
        if (!player.poisoned) spawnVfxEffect('poisonStatusBurst', player.x, player.y + 4, 1, 0);
        player.poisoned = true;
        player.poisonTimer = Math.max(player.poisonTimer || 0, 2.5);
        player.poisonDamage = Math.max(player.poisonDamage || 0, Math.floor(enemy.dmg * 0.25));
        createDamageNumber(player.x, player.y - 45, 'Poison Cloud!', COLORS.poison);
    }
}

heroSpriteSheet.onload = () => {
    // source art already has alpha，keep white highlights, purple details and translucent edges。
    processedHeroSprites = heroSpriteSheet;
    HERO_SPRITE_CONFIG.frameWidth = Math.floor(processedHeroSprites.width / HERO_SPRITE_CONFIG.cols);
    HERO_SPRITE_CONFIG.frameHeight = Math.floor(processedHeroSprites.height / HERO_SPRITE_CONFIG.rows);
    heroSpritesLoaded = true;
};

// --- Monster Animation Sprites ---
const monsterSpriteSheet = new Image();
let monsterSpritesLoaded = false;
let processedMonsterSprites = null;
const MonsterTintCache = SpriteRenderer.createTintCache();

const MONSTER_SPRITE_CONFIG = {
    cols: 4,
    rows: 116,
    frameWidth: 128,
    frameHeight: 128,
    renderSize: ACTOR_RENDER_SIZE,
    fps: { idle: 3, walk: 6, attack: 8, hurt: 8 },
    types: {
        melee: {
            idle: { front: { row: 0 }, side: { row: 1 } },
            walk: { front: { row: 2 }, side: { row: 3 } },
            attack: { front: { row: 4 }, side: { row: 5 } },
            hurt: { front: { row: 6 }, side: { row: 6 } }
        },
        zombie: {
            idle: { front: { row: 7 }, side: { row: 8 } },
            walk: { front: { row: 9 }, side: { row: 10 } },
            attack: { front: { row: 11 }, side: { row: 11 } },
            hurt: { front: { row: 11 }, side: { row: 11 } }
        },
        ranged: {
            idle: { front: { row: 12 }, side: { row: 13 } },
            walk: { front: { row: 14 }, side: { row: 15 } },
            attack: { front: { row: 16 }, side: { row: 17 } },
            hurt: { front: { row: 18 }, side: { row: 19 } }
        },
        skeleton: {
            idle: { front: { row: 20 }, side: { row: 21 } },
            walk: { front: { row: 22 }, side: { row: 23 } },
            attack: { front: { row: 24 }, side: { row: 25 } },
            hurt: { front: { row: 26 }, side: { row: 27 } }
        },
        shaman: {
            idle: { front: { row: 28 }, side: { row: 29 } },
            walk: { front: { row: 30 }, side: { row: 31 } },
            attack: { front: { row: 32 }, side: { row: 33 } },
            hurt: { front: { row: 34 }, side: { row: 35 } }
        },
        mummy: {
            idle: { front: { row: 36 }, side: { row: 37 } },
            walk: { front: { row: 38 }, side: { row: 39 } },
            attack: { front: { row: 40 }, side: { row: 41 } },
            hurt: { front: { row: 42 }, side: { row: 43 } }
        },
        ghost: {
            idle: { front: { row: 44 }, side: { row: 45 } },
            walk: { front: { row: 46 }, side: { row: 47 } },
            attack: { front: { row: 48 }, side: { row: 49 } },
            hurt: { front: { row: 50 }, side: { row: 51 } }
        },
        specter: {
            idle: { front: { row: 52 }, side: { row: 53 } },
            walk: { front: { row: 54 }, side: { row: 55 } },
            attack: { front: { row: 56 }, side: { row: 57 } },
            hurt: { front: { row: 58 }, side: { row: 59 } }
        },
        vampire: {
            idle: { front: { row: 60 }, side: { row: 61 } },
            walk: { front: { row: 62 }, side: { row: 63 } },
            attack: { front: { row: 64 }, side: { row: 65 } },
            hurt: { front: { row: 66 }, side: { row: 67 } }
        },
        bloodRaven: {
            idle: { front: { row: 68 }, side: { row: 69 } },
            walk: { front: { row: 70 }, side: { row: 71 } },
            attack: { front: { row: 72 }, side: { row: 73 } },
            hurt: { front: { row: 74 }, side: { row: 75 } }
        },
        countess: {
            idle: { front: { row: 76 }, side: { row: 77 } },
            walk: { front: { row: 78 }, side: { row: 79 } },
            attack: { front: { row: 80 }, side: { row: 81 } },
            hurt: { front: { row: 82 }, side: { row: 83 } }
        },
        butcher: {
            idle: { front: { row: 84 }, side: { row: 85 } },
            walk: { front: { row: 86 }, side: { row: 87 } },
            attack: { front: { row: 88 }, side: { row: 89 } },
            hurt: { front: { row: 90 }, side: { row: 91 } }
        },
        duriel: {
            idle: { front: { row: 92 }, side: { row: 93 } },
            walk: { front: { row: 94 }, side: { row: 95 } },
            attack: { front: { row: 96 }, side: { row: 97 } },
            hurt: { front: { row: 98 }, side: { row: 99 } }
        },
        diablo: {
            idle: { front: { row: 100 }, side: { row: 101 } },
            walk: { front: { row: 102 }, side: { row: 103 } },
            attack: { front: { row: 104 }, side: { row: 105 } },
            hurt: { front: { row: 106 }, side: { row: 107 } }
        },
        baal: {
            idle: { front: { row: 108 }, side: { row: 109 } },
            walk: { front: { row: 110 }, side: { row: 111 } },
            attack: { front: { row: 112 }, side: { row: 113 } },
            hurt: { front: { row: 114 }, side: { row: 115 } }
        }
    }
};

const BOSS_SPRITE_TYPES_BY_FRAME = ['bloodRaven', 'countess', 'butcher', 'duriel', 'diablo', 'baal'];

monsterSpriteSheet.onload = () => {
    // source art already has alpha，keep white highlights, purple details and translucent edges。
    processedMonsterSprites = monsterSpriteSheet;
    MONSTER_SPRITE_CONFIG.frameWidth = Math.floor(processedMonsterSprites.width / MONSTER_SPRITE_CONFIG.cols);
    MONSTER_SPRITE_CONFIG.frameHeight = Math.floor(processedMonsterSprites.height / MONSTER_SPRITE_CONFIG.rows);
    monsterSpritesLoaded = true;
};

spriteSheet.onload = () => {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = spriteSheet.width;
    tempCanvas.height = spriteSheet.height;
    tempCtx.drawImage(spriteSheet, 0, 0);

    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        if (data[i] < 25 && data[i + 1] < 25 && data[i + 2] < 25) data[i + 3] = 0;
    }
    tempCtx.putImageData(imageData, 0, 0);

    // about tonormal Image objectchangein order to Canvas object，justso as to TintCache reference
    processedSpriteSheet = document.createElement('canvas');
    processedSpriteSheet.width = tempCanvas.width;
    processedSpriteSheet.height = tempCanvas.height;
    processedSpriteSheet.getContext('2d').drawImage(tempCanvas, 0, 0);

// Warm the TintCache with parameters identical to the original runtime filter so visuals stay faithful
    TintCache.white = createTintedSpriteSheet(processedSpriteSheet, 'brightness(500%) sepia(100%) saturate(0%)');
    TintCache.ice = createTintedSpriteSheet(processedSpriteSheet, 'sepia(100%) saturate(150%) hue-rotate(180deg) brightness(120%)');
    TintCache.poison = createTintedSpriteSheet(processedSpriteSheet, 'sepia(100%) saturate(300%) hue-rotate(80deg) brightness(80%)');
    TintCache.lightning = createTintedSpriteSheet(processedSpriteSheet, 'brightness(300%) saturate(50%)');

    spritesLoaded = true;
};

const SPRITE_CONFIG = {
    frameWidth: 256,
    frameHeight: 341,
    heroRow: 0,
    monsterRow: 1,  // row 2:normal monsters
    bossRow: 2,     // ordinal3line up:BOSS
    npcRow: 3       // ordinal4line up:NPC
};

// --- Item Sprites ---
const itemSpriteSheet = new Image();
itemSpriteSheet.src = 'items-painted.webp?v=2026090801';
let itemSpritesLoaded = false;
let processedItemSprites = null; // Keep native transparency and dark gear details

itemSpriteSheet.onload = () => {
    processedItemSprites = itemSpriteSheet;
    itemSpritesLoaded = true;
    if (gameActive) { renderInventory(); updateBeltUI(); }
};

function drawBiomeFloorDecoration(ctx, x, y, size, type, seed, density = 1) {
    const tileC = Math.floor(x / TILE_SIZE);
    const tileR = Math.floor(y / TILE_SIZE);
    if (!isClearFloorFootprint(tileC, tileR, 1)) return false;

    const hash = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    const rand = hash - Math.floor(hash);
    const chance = Math.min(0.10, 0.024 * Math.max(1, density));
    if (rand > chance) return false;

    const painted = EnvironmentArt.floor(type, seed);
    if (!painted) return false;
    const { sx, sy, sw, sh } = painted.contentBounds;
    const ratio = sw / sh;
    const scale = 0.46 + rand * 0.20;
    let drawH = size * scale;
    let drawW = drawH * ratio;

    if (drawW > size * 0.82) {
        drawW = size * 0.82;
        drawH = drawW / ratio;
    }

    const margin = 3;
    const rawOffsetX = (size - drawW) / 2 + (mapTileNoise(seed + 9) - 0.5) * size * 0.10;
    const rawOffsetY = size - drawH - 5 + (mapTileNoise(seed + 17) - 0.5) * 2;
    const offsetX = Math.max(margin, Math.min(size - drawW - margin, rawOffsetX));
    const offsetY = Math.max(margin, Math.min(size - drawH - margin, rawOffsetY));

    ctx.save();
    ctx.globalAlpha = 0.88;
    ctx.drawImage(painted.source, sx, sy, sw, sh, x + offsetX, y + offsetY, drawW, drawH);
    ctx.restore();
    return true;
}

// Load environment decoration sprites
const envSpriteSheet = new Image();

let envSpritesLoaded = false;
let processedEnvSprites = null;
let envCellWidth = 0;
let envCellHeight = 0;
let envSpriteBounds = [];



envSpriteSheet.onload = () => {
    processedEnvSprites = envSpriteSheet;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = envSpriteSheet.width;
    tempCanvas.height = envSpriteSheet.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(envSpriteSheet, 0, 0);
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    envCellWidth = processedEnvSprites.width / 8;
    envCellHeight = processedEnvSprites.height / 8;
    envSpriteBounds = calculateSpriteCellBounds(imageData, 8, 8, 12);
    tempCanvas.width = tempCanvas.height = 0;
    envSpritesLoaded = true;
    if (gameActive && mapData.length > 0) generateMapCache();
};

// --- Destructible Sprites ---
const destructibleSpriteSheet = new Image();
let destructiblesLoaded = false;
let processedDestructibleSprites = null;
let destructibleSpriteBounds = [];

function calculateSpriteCellBounds(imageData, cols, rows, alphaThreshold = 16) {
    const bounds = [];
    const cellWidth = imageData.width / cols;
    const cellHeight = imageData.height / rows;
    const data = imageData.data;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const startX = Math.floor(col * cellWidth);
            const endX = Math.floor((col + 1) * cellWidth);
            const startY = Math.floor(row * cellHeight);
            const endY = Math.floor((row + 1) * cellHeight);
            let minX = endX;
            let minY = endY;
            let maxX = startX;
            let maxY = startY;

            for (let y = startY; y < endY; y++) {
                for (let x = startX; x < endX; x++) {
                    const alpha = data[(y * imageData.width + x) * 4 + 3];
                    if (alpha <= alphaThreshold) continue;
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }

            if (minX > maxX || minY > maxY) {
                bounds[row * cols + col] = { sx: startX, sy: startY, sw: cellWidth, sh: cellHeight };
                continue;
            }

            const padding = 4;
            minX = Math.max(startX, minX - padding);
            minY = Math.max(startY, minY - padding);
            maxX = Math.min(endX - 1, maxX + padding);
            maxY = Math.min(endY - 1, maxY + padding);
            bounds[row * cols + col] = {
                sx: minX,
                sy: minY,
                sw: maxX - minX + 1,
                sh: maxY - minY + 1
            };
        }
    }

    return bounds;
}

destructibleSpriteSheet.onload = () => {
    processedDestructibleSprites = destructibleSpriteSheet;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = destructibleSpriteSheet.width;
    tempCanvas.height = destructibleSpriteSheet.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(destructibleSpriteSheet, 0, 0);
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    DESTRUCTIBLE_CONFIG.cellWidth = processedDestructibleSprites.width / 2;
    DESTRUCTIBLE_CONFIG.cellHeight = processedDestructibleSprites.height / 3;
    destructibleSpriteBounds = calculateSpriteCellBounds(imageData, 2, 3);
    tempCanvas.width = tempCanvas.height = 0;
    destructiblesLoaded = true;
};

const DESTRUCTIBLE_CONFIG = {
    cellWidth: 0,
    cellHeight: 0,
    types: [
        { name: 'barrel', row: 0, color: '#8b4513' }, // wooden barrel
        { name: 'crate', row: 1, color: '#a0522d' },  // wooden crate
        { name: 'urn', row: 2, color: '#696969' }     // clay pot
    ],
    chestTypes: {
        chest: { name: 'chest', isChest: true, isGolden: false, color: '#d4af37' },
        golden_chest: { name: 'golden_chest', isChest: true, isGolden: true, color: '#ffd700' }
    }
};

const DestructibleSystem = {
    update: function (dt) {
// Remove objects broken for over 5 seconds
        const now = Date.now();
        for (let i = destructibles.length - 1; i >= 0; i--) {
            const d = destructibles[i];
            if (d.broken && d.brokenTime && now - d.brokenTime > 5000) {
                destructibles.splice(i, 1);
            }
        }
    },

    drawOne: function (ctx, d) {
        if (d.x < camera.x - 100 || d.x > camera.x + getViewportWidth() + 100 ||
            d.y < camera.y - 120 || d.y > camera.y + getViewportHeight() + 100) return;

// Chest-specific draw logic
        if (d.type && d.type.isChest) {
            ctx.save();
            if (!d.broken) {
                const auraGradient = ctx.createRadialGradient(d.x, d.y + 4, 2, d.x, d.y + 4, 18);
                auraGradient.addColorStop(0, d.type.isGolden ? 'rgba(255, 215, 0, 0.45)' : 'rgba(212, 175, 55, 0.3)');
                auraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = auraGradient;
                ctx.beginPath();
                ctx.arc(d.x, d.y + 4, 18, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.font = d.type.isGolden ? '26px sans-serif' : '22px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (d.broken) {
                ctx.globalAlpha = 0.55;
                ctx.fillText('📦', d.x, d.y - 4);
            } else {
                ctx.shadowColor = d.type.isGolden ? '#ffd700' : '#d4af37';
                ctx.shadowBlur = d.type.isGolden ? 12 : 6;
                ctx.fillText(d.type.isGolden ? '🎁' : '📦', d.x, d.y - 8);
            }
            ctx.restore();
            return;
        }

        const spriteIndex = d.type.row * 2 + (d.broken ? 1 : 0);
        const painted = EnvironmentArt.destructible(d.type.name, d.broken);
        if (!painted && (!destructiblesLoaded || !processedDestructibleSprites)) return;
        const spriteBounds = painted ? painted.contentBounds : destructibleSpriteBounds[spriteIndex] || {
            sx: d.broken ? DESTRUCTIBLE_CONFIG.cellWidth : 0,
            sy: d.type.row * DESTRUCTIBLE_CONFIG.cellHeight,
            sw: DESTRUCTIBLE_CONFIG.cellWidth,
            sh: DESTRUCTIBLE_CONFIG.cellHeight
        };
        const intact = EnvironmentArt.destructible(d.type.name, false);
        const intactBounds = intact ? intact.contentBounds : spriteBounds;
        const normalHeight = EnvironmentArt.visualHeights[`town_${d.type.name}`];
        const drawW = Math.round(normalHeight * intactBounds.sw / intactBounds.sh * (d.broken ? 1.04 : 1));
        const drawH = Math.round(drawW * spriteBounds.sh / spriteBounds.sw);
        const rx = Math.round(d.x - drawW / 2);
        const ry = Math.round(d.y - drawH + 12);

        ctx.save();
        ctx.filter = 'brightness(0.94) saturate(0.9)';
        ctx.drawImage(
            painted ? painted.source : processedDestructibleSprites,
            spriteBounds.sx, spriteBounds.sy, spriteBounds.sw, spriteBounds.sh,
            rx, ry, drawW, drawH
        );
        ctx.restore();
    },

    draw: function (ctx, mode = 'all') {
        destructibles.forEach(d => {
            if (mode === 'behindPlayer' && d.y > player.y + 4) return;
            if (mode === 'foreground' && d.y <= player.y + 4) return;
            this.drawOne(ctx, d);
        });
    },

    break: function (d) {
        if (d.broken) return;
        d.broken = true;
        d.brokenTime = Date.now(); // logbrokentime

        // screen shake
        triggerScreenShake(3, 0.1);

// Shatter particles
        for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 40 + Math.random() * 80;
            createSimpleParticle(d.x, d.y, d.type.color || '#d4af37', speed, angle);
        }

        const f = player.isInHell ? player.hellFloor : player.floor;

// Chest special generous drop logic
        if (d.type && d.type.isChest) {
            const isGolden = d.type.isGolden;
            const goldBase = isGolden ? (150 + f * 50) : (40 + f * 15);
            const goldAmount = Math.floor(goldBase * (0.9 + Math.random() * 0.4));

            groundItems.push({
                type: 'gold', val: Math.floor(goldAmount),
                x: d.x, y: d.y, z: 0,
                vx: (Math.random() - 0.5) * 100,
                vy: (Math.random() - 0.5) * 100,
                vz: 160 + Math.random() * 60,
                bounces: 2,
                soundLand: 'land_gold',
                rarity: 0, name: Math.floor(goldAmount) + " Gold", icon: '💰', dropTime: Date.now()
            });

            // geardrop
            const equipCount = isGolden ? 2 : 1;
            for (let eqIdx = 0; eqIdx < equipCount; eqIdx++) {
                if (typeof createItem === 'function') {
                    const item = createItem(null, f);
                    if (isGolden) {
                        item.rarity = Math.random() < 0.25 ? RARITY.UNIQUE : RARITY.RARE;
                        if (item.rarity === RARITY.UNIQUE) {
                            item.displayName = "Unique · " + item.name;
                            item.stats.allSkills = (item.stats.allSkills || 0) + 1;
                            item.stats.dmgPct = (item.stats.dmgPct || 0) + 50;
                        }
                    } else {
                        item.rarity = Math.random() < 0.35 ? RARITY.RARE : RARITY.MAGIC;
                    }

                    groundItems.push({
                        ...item,
                        x: d.x, y: d.y, z: 0,
                        vx: (Math.random() - 0.5) * 110,
                        vy: (Math.random() - 0.5) * 110,
                        vz: 170 + Math.random() * 60,
                        bounces: 2,
                        soundLand: 'land_hard',
                        dropTime: Date.now()
                    });

                    if (item.rarity >= RARITY.RARE && typeof createDropBeam === 'function') {
                        createDropBeam(d.x, d.y, item.rarity);
                    }
                }
            }

            // runedrop
            const runeRoll = isGolden ? 1.0 : 0.35;
            if (Math.random() < runeRoll && typeof createRuneItem === 'function') {
                const runePool = ['el', 'eld', 'tir', 'nef', 'eth'];
                if (f >= 4) runePool.push('ith', 'tal');
                if (f >= 7) runePool.push('ral', 'ort');
                if (f >= 10) runePool.push('thul', 'amn');
                if (f >= 14 || player.isInHell) runePool.push('sol', 'shael');
                const runeKey = runePool[Math.floor(Math.random() * runePool.length)];
                const rune = createRuneItem(runeKey);
                if (rune) {
                    groundItems.push({
                        ...rune,
                        x: d.x, y: d.y, z: 0,
                        vx: (Math.random() - 0.5) * 90,
                        vy: (Math.random() - 0.5) * 90,
                        vz: 180 + Math.random() * 50,
                        bounces: 2,
                        soundLand: 'land_hard',
                        dropTime: Date.now()
                    });
                }
            }

            if (typeof AudioSys !== 'undefined' && AudioSys.play) AudioSys.play('quest');
            triggerScreenShake(isGolden ? 6 : 4, 0.2);
            return;
        }

// Normal destructible drop logic
        const rand = Math.random();
        if (rand < 0.2) { // 20% chance to drop gold
            let goldAmount = Math.floor((5 + f * 2) * (0.8 + Math.random() * 0.4));
            groundItems.push({
                type: 'gold', val: Math.floor(goldAmount),
                x: d.x, y: d.y, z: 0,
                vx: (Math.random() - 0.5) * 80,
                vy: (Math.random() - 0.5) * 80,
                vz: 120 + Math.random() * 60,
                bounces: 1,
                soundLand: 'land_gold',
                rarity: 0, name: Math.floor(goldAmount) + " Gold", icon: '💰', dropTime: Date.now()
            });
        } else if (rand < 0.3) { // 10% chance to drop potions/scrolls
            const pRand = Math.random();
            let dropItem;
            if (pRand < 0.5) dropItem = { type: 'potion', name: 'Health Potion', heal: 50, rarity: 0, stackable: true, count: 1 };
            else if (pRand < 0.85) dropItem = { type: 'potion', name: 'Mana Potion', mana: 30, rarity: 0, stackable: true, count: 1 };
            else dropItem = { type: 'scroll', name: 'Town Portal Scroll', rarity: 0, stackable: true, count: 1 };

            groundItems.push({
                ...dropItem,
                x: d.x, y: d.y, z: 0,
                vx: (Math.random() - 0.5) * 60,
                vy: (Math.random() - 0.5) * 60,
                vz: 110 + Math.random() * 70,
                bounces: 1,
                soundLand: dropItem.type === 'potion' || dropItem.type === 'scroll' ? 'land_soft' : 'land_hard',
                dropTime: Date.now()
            });
        }

        // SFX
        AudioSys.play('land_hard');
    },

    checkMeleeCollision: function (x, y, range) {
        const rSq = range * range;
        destructibles.forEach(d => {
            if (!d.broken) {
                const dx = d.x - x, dy = d.y - y;
                if (dx * dx + dy * dy < rSq) {
                    this.break(d);
                }
            }
        });
    }
};

const SCENIC_PROP_LIBRARY = {
    forest: [
        { name: 'moss_rock', row: 0, col: 0, scale: 0.54, tall: true },
        { name: 'stump', row: 0, col: 1, scale: 0.52, tall: true },
        { name: 'shrub', row: 0, col: 2, scale: 0.48, tall: true },
        { name: 'lantern', row: 1, col: 4, scale: 0.58, tall: true, light: { color: 'rgba(255, 170, 82, 0.42)', radius: 120, strength: 0.65, flicker: true } },
        { name: 'bones', row: 1, col: 5, scale: 0.50, tall: false },
        { name: 'gravestone', row: 1, col: 6, scale: 0.56, tall: true, light: { color: 'rgba(100, 200, 120, 0.18)', radius: 100, strength: 0.35 } }
    ],
    ice: [
        { name: 'ice_cluster', row: 2, col: 0, scale: 0.58, tall: true, light: { color: 'rgba(130, 220, 255, 0.30)', radius: 130, strength: 0.50 } },
        { name: 'ice_spire', row: 2, col: 2, scale: 0.60, tall: true, light: { color: 'rgba(150, 230, 255, 0.24)', radius: 120, strength: 0.45 } },
        { name: 'frost_bones', row: 2, col: 3, scale: 0.52, tall: false },
        { name: 'blue_flame', row: 3, col: 3, scale: 0.52, tall: true, light: { color: 'rgba(90, 210, 255, 0.50)', radius: 150, strength: 0.70, flicker: true } },
        { name: 'rune_stone', row: 3, col: 5, scale: 0.58, tall: true, light: { color: 'rgba(80, 190, 255, 0.26)', radius: 115, strength: 0.48 } },
        { name: 'frost_pillar', row: 3, col: 6, scale: 0.62, tall: true }
    ],
    fire: [
        { name: 'lava_vent', row: 4, col: 0, scale: 0.56, tall: true, light: { color: 'rgba(255, 76, 22, 0.50)', radius: 150, strength: 0.78, flicker: true } },
        { name: 'lava_rock', row: 4, col: 1, scale: 0.58, tall: true, light: { color: 'rgba(255, 90, 28, 0.24)', radius: 110, strength: 0.40 } },
        { name: 'bone_pile', row: 4, col: 2, scale: 0.50, tall: false },
        { name: 'spike_cluster', row: 4, col: 3, scale: 0.58, tall: true },
        { name: 'hell_brazier', row: 4, col: 5, scale: 0.58, tall: true, light: { color: 'rgba(255, 118, 30, 0.58)', radius: 170, strength: 0.86, flicker: true } },
        { name: 'red_crystal', row: 5, col: 5, scale: 0.60, tall: true, light: { color: 'rgba(255, 64, 50, 0.30)', radius: 120, strength: 0.50 } }
    ]
};

function getScenicPropPool(biomeType) {
    return SCENIC_PROP_LIBRARY[biomeType] || SCENIC_PROP_LIBRARY.fire;
}

function pickScenicPropDef(biomeType, seed, wantsLight = false) {
    const pool = getScenicPropPool(biomeType);
    const filtered = wantsLight ? pool.filter(p => p.light) : pool;
    const source = filtered.length > 0 ? filtered : pool;
    return source[Math.floor(mapTileNoise(seed) * source.length) % source.length];
}

function getEnvSpriteBounds(row, col) {
    const index = row * 8 + col;
    return envSpriteBounds[index] || {
        sx: col * envCellWidth,
        sy: row * envCellHeight,
        sw: envCellWidth,
        sh: envCellHeight
    };
}

function drawScenicPropOne(ctx, prop) {
    if (prop.x < camera.x - 140 || prop.x > camera.x + getViewportWidth() + 140 ||
        prop.y < camera.y - 180 || prop.y > camera.y + getViewportHeight() + 140) return;

    const sample = EnvironmentArt.scenic(prop.name);
    if (!sample && (!envSpritesLoaded || !processedEnvSprites)) return;
    const bounds = sample ? sample.contentBounds : getEnvSpriteBounds(prop.row, prop.col);
    const ratio = bounds.sw / bounds.sh;
    const drawH = Math.round(sample ? EnvironmentArt.visualHeights[prop.name] * Math.max(0.9, Math.min(1.1, (prop.scale || 0.5) / 0.54))
        : (prop.drawH || 70) * (prop.scale || 1));
    const drawW = Math.round(drawH * ratio);
    const drawX = Math.round(prop.x - drawW / 2);
    const drawY = Math.round(prop.y - drawH + (prop.baseOffset || 8));
    const playerInside =
        player.x > drawX + drawW * 0.18 && player.x < drawX + drawW * 0.82 &&
        player.y > prop.y - drawH * 0.72 && player.y < prop.y + 8;

    ctx.save();
    ctx.globalAlpha = playerInside ? 0.62 : (prop.alpha || 0.94);
    ctx.filter = prop.filter || 'brightness(0.96) saturate(1.04) contrast(1.04)';
    ctx.drawImage(
        sample ? sample.source : processedEnvSprites,
        bounds.sx, bounds.sy, bounds.sw, bounds.sh,
        drawX, drawY, drawW, drawH
    );
    ctx.restore();
}

function drawScenicProps(ctx, mode = 'behindPlayer') {
    if (!scenicProps || scenicProps.length === 0) return;
    for (let i = 0, len = scenicProps.length; i < len; i++) {
        const prop = scenicProps[i];
        const sortY = prop.sortY ?? prop.y;
        if (mode === 'behindPlayer' && sortY > player.y + 4) continue;
        if (mode === 'foreground' && sortY <= player.y + 4) continue;
        drawScenicPropOne(ctx, prop);
    }
}

function addDungeonLightSource(x, y, light, seed) {
    if (!light) return;
    dungeonLightSources.push({
        x,
        y,
        color: light.color,
        radius: light.radius || 120,
        strength: light.strength || 0.5,
        flicker: !!light.flicker,
        phase: mapTileNoise(seed + 77) * Math.PI * 2
    });
}

function drawDungeonLightSources(ctx, biome) {
    const time = Date.now() / 1000;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const maxLights = 10;
    let drawn = 0;
    for (let i = 0, len = dungeonLightSources.length; i < len; i++) {
        const light = dungeonLightSources[i];
        if (light.x < camera.x - light.radius || light.x > camera.x + getViewportWidth() + light.radius ||
            light.y < camera.y - light.radius || light.y > camera.y + getViewportHeight() + light.radius) continue;
        if (drawn++ >= maxLights) break;

        const flicker = light.flicker ? 0.86 + Math.sin(time * 5.5 + light.phase) * 0.10 + Math.sin(time * 13 + light.phase) * 0.04 : 1;
        const radius = light.radius * flicker;
        const gradient = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, radius);
        gradient.addColorStop(0, light.color);
        gradient.addColorStop(0.48, light.color.replace(/0\.\d+\)/, `${(light.strength * 0.18).toFixed(2)})`));
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(light.x, light.y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    if (biome?.ambientGlow) {
        const px = Math.round(player.x);
        const py = Math.round(player.y);
        const gradient = ctx.createRadialGradient(px, py, 20, px, py, biome.ambientGlow.radius);
        gradient.addColorStop(0, biome.ambientGlow.color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(px, py, biome.ambientGlow.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function drawScenicPropBases(ctx, biome) {
    if (!scenicProps || scenicProps.length === 0) return;
    for (let i = 0, len = scenicProps.length; i < len; i++) {
        const prop = scenicProps[i];
        ctx.save();
        ctx.globalAlpha = 0.30;
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.beginPath();
        ctx.ellipse(prop.x, prop.y + 2, 18 + (prop.scale || 1) * 16, 7 + (prop.scale || 1) * 4, 0, 0, Math.PI * 2);
        ctx.fill();
        if (biome?.edge && mapTileNoise(prop.x + prop.y) > 0.55) {
            ctx.globalAlpha = 0.16;
            ctx.strokeStyle = biome.edge;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(prop.x, prop.y + 1, 20, 8, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }
}

function createSimpleParticle(x, y, color, speed, angle) {
    const p = ParticlePool.acquire();
    p.x = x; p.y = y; p.z = 5 + Math.random() * 10;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed;
    p.vz = 50 + Math.random() * 50;
    p.life = 0.5 + Math.random() * 0.5;
    p.color = color;
    p.size = 2 + Math.random() * 2;
    p.gravity = 600;
    p.canBake = true;
    particles.push(p);
}

const wallTiles = new Image();
wallTiles.src = 'art/brand-terrain/walls.webp?v=2026090803';
let wallTilesLoaded = false;
wallTiles.onload = () => {
    wallTilesLoaded = true;
    // regenerate map cache once assets finish loading
    if (gameActive && mapData.length > 0) generateMapCache();
};

function addBiomeAtmosphere(style) {
    if (style.type === 'forest') {
        return { ...style, ambientGlow: { color: 'rgba(72, 180, 90, 0.045)', radius: 260 }, fogColor: 'rgba(20, 36, 18, 0.10)' };
    }
    if (style.type === 'ice') {
        return { ...style, ambientGlow: { color: 'rgba(112, 220, 255, 0.055)', radius: 280 }, fogColor: 'rgba(50, 95, 120, 0.09)' };
    }
    return { ...style, ambientGlow: { color: 'rgba(255, 78, 22, 0.055)', radius: 250 }, fogColor: 'rgba(42, 6, 2, 0.10)' };
}

function getBiomeStyle(floor) {
    if (floor === 0 && !player.isInHell) return null; // Camp uses default
    const depth = player.isInHell ? player.hellFloor : floor;
    if (player.isInHell || depth > 20) {
        const deepThemes = [
            {
                name: 'Lava Rift',
                tint: 'rgba(145, 38, 12, 0.20)',
                floorWash: 'rgba(20, 4, 2, 0.18)',
                wallWash: 'rgba(48, 8, 2, 0.24)',
                edge: 'rgba(255, 105, 38, 0.20)',
                crack: 'rgba(255, 72, 18, 0.32)',
                type: 'fire',
                ice: false
            },
            {
                name: 'Scorched Stone Hall',
                tint: 'rgba(86, 64, 58, 0.22)',
                floorWash: 'rgba(8, 8, 8, 0.22)',
                wallWash: 'rgba(0, 0, 0, 0.28)',
                edge: 'rgba(180, 120, 84, 0.14)',
                crack: 'rgba(255, 120, 40, 0.18)',
                type: 'fire',
                ice: false
            },
            {
                name: 'Flesh Altar',
                tint: 'rgba(105, 12, 38, 0.22)',
                floorWash: 'rgba(24, 0, 10, 0.20)',
                wallWash: 'rgba(48, 0, 16, 0.24)',
                edge: 'rgba(230, 54, 82, 0.16)',
                crack: 'rgba(150, 0, 35, 0.28)',
                type: 'fire',
                ice: false
            },
            {
                name: 'Obsidian Abyss',
                tint: 'rgba(58, 35, 95, 0.22)',
                floorWash: 'rgba(5, 4, 14, 0.24)',
                wallWash: 'rgba(8, 4, 22, 0.28)',
                edge: 'rgba(130, 90, 220, 0.16)',
                crack: 'rgba(195, 80, 255, 0.18)',
                type: 'fire',
                ice: false
            }
        ];
        const themeIndex = player.isInHell
            ? Math.max(0, depth - 1) % deepThemes.length
            : Math.floor((depth - 21) / 7) % deepThemes.length;
        return addBiomeAtmosphere(deepThemes[themeIndex]);
    }

// 1-10: Misty Forest (green, damp)
    if (floor <= 10) {
        return addBiomeAtmosphere({
            tint: 'rgba(50, 200, 80, 0.22)',
            floorWash: 'rgba(12, 36, 18, 0.14)',
            wallWash: 'rgba(8, 42, 18, 0.18)',
            edge: 'rgba(126, 210, 112, 0.14)',
            crack: 'rgba(40, 110, 60, 0.18)',
            type: 'forest',
            ice: false
        });
    }
// 11-20: Frozen Ruins (blue, slick)
    if (floor <= 20) {
        return addBiomeAtmosphere({
            tint: 'rgba(100, 220, 255, 0.30)',
            floorWash: 'rgba(18, 42, 58, 0.16)',
            wallWash: 'rgba(16, 46, 70, 0.20)',
            edge: 'rgba(170, 235, 255, 0.18)',
            crack: 'rgba(130, 210, 255, 0.20)',
            type: 'ice',
            ice: true
        });
    }
    // 21+: lavaTorment (redcolor)
    return addBiomeAtmosphere({ tint: 'rgba(145, 38, 12, 0.20)', floorWash: 'rgba(20, 4, 2, 0.18)', wallWash: 'rgba(48, 8, 2, 0.24)', edge: 'rgba(255, 105, 38, 0.20)', crack: 'rgba(255, 72, 18, 0.32)', type: 'fire', ice: false });
}

// A coordinate hash picks the material variant so cache rebuilds don't flicker; it takes no part in map or collision generation.
function getTerrainVariant(col, row) {
    let hash = Math.imul(col + 1, 374761393) ^ Math.imul(row + 1, 668265263);
    hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
    return ((hash ^ (hash >>> 16)) >>> 0) % 3;
}

function getWallTextureIndex(floor) {
    if (player.isInHell) return 2;
// Reuse the existing 3 wall textures to match the tint
    if (floor <= 10) return 0; // Stone walls fit the forest
    if (floor <= 20) return 1; // cave walls fit the ice cavern
    return 2;                  // Hell walls fit lava
}

const floorTiles = new Image();
floorTiles.src = 'art/brand-terrain/floors.webp?v=2026090803';
let floorTilesLoaded = false;
floorTiles.onload = () => {
    floorTilesLoaded = true;
    // regenerate map cache once assets finish loading
    if (gameActive && mapData.length > 0) generateMapCache();
};

function getFloorTextureIndex(floor) {
    if (floor === 0) return 0;     // Camp (Grass)
    return 1;                      // Stone levels (All dungeons)
}

// Item sprite helpers (moved to item-system.js)

// Achievement definitions - grouped by category
// Categories: kill, explore, collect, combat, economy, growth
const ACHIEVEMENTS = [
    // ===== killclass (kill) =====
    {
        id: 'kill_fallen_100',
        name: 'Fallen Hunter',
        description: 'Slay 100 Fallen',
        target: 100,
        type: 'kill_monster',
        monsterName: 'Fallen',
        category: 'kill',
        icon: '🗡️',
        points: 5
    },
    {
        id: 'kill_fallen_1000',
        name: 'Fallen Slayer',
        description: 'Slay 1000 Fallen',
        target: 1000,
        type: 'kill_monster',
        monsterName: 'Fallen',
        category: 'kill',
        icon: '⚔️',
        points: 15
    },
    {
        id: 'kill_boss_5',
        name: 'Boss Hunter',
        description: 'Defeat 5 boss-level enemies',
        target: 5,
        type: 'kill_boss',
        category: 'kill',
        icon: '👹',
        points: 10
    },
    {
        id: 'kill_boss_20',
        name: 'Boss Terminator',
        description: 'Defeat 20 boss-level enemies',
        target: 20,
        type: 'kill_boss',
        category: 'kill',
        icon: '💀',
        points: 25
    },
    {
        id: 'kill_boss_50',
        name: 'Boss Destroyer',
        description: 'Defeat 50 boss-level enemies',
        target: 50,
        type: 'kill_boss',
        category: 'kill',
        icon: '☠️',
        points: 50
    },
    {
        id: 'kill_elite_30',
        name: 'Elite Hunter',
        description: 'Slay 30 elite monsters',
        target: 30,
        type: 'kill_elite',
        category: 'kill',
        icon: '🔱',
        points: 15
    },
    {
        id: 'kill_baal',
        name: 'World Savior',
        description: 'Defeat Baal',
        target: 1,
        type: 'kill_specific_boss',
        bossName: 'Baal',
        category: 'kill',
        icon: '🌍',
        points: 30
    },

    // ===== exploresearch forclass (explore) =====
    {
        id: 'reach_floor_5',
        name: 'First Descent',
        get description() { return `Reach Floor 5 (${getFloorName(5)})`; },
        target: 5,
        type: 'reach_floor',
        category: 'explore',
        icon: '🚪',
        points: 5
    },
    {
        id: 'reach_floor_10',
        name: 'Dungeon Conqueror',
        get description() { return `Reach Floor 10 (${getFloorName(10)})`; },
        target: 10,
        type: 'reach_floor',
        category: 'explore',
        icon: '🏔️',
        points: 15
    },
    {
        id: 'reach_floor_20',
        name: 'Abyss Explorer',
        get description() { return `Reach Floor 20 (${getFloorName(20)})`; },
        target: 20,
        type: 'reach_floor',
        category: 'explore',
        icon: '🌋',
        points: 25
    },
    {
        id: 'reach_floor_30',
        name: 'Endless Seeker',
        get description() { return `Reach Floor 30 (${getFloorName(30)})`; },
        target: 30,
        type: 'reach_floor',
        category: 'explore',
        icon: '🌌',
        points: 40
    },
    {
        id: 'enter_hell',
        name: 'Hell Walker',
        description: 'Enter Hell Mode',
        target: 1,
        type: 'enter_hell',
        category: 'explore',
        icon: '🔥',
        points: 20
    },

// ===== Collect (collect) =====
    {
        id: 'collect_unique_1',
        name: 'First Unique Drop',
        description: 'Obtain 1 Unique piece of equipment',
        target: 1,
        type: 'collect_unique',
        category: 'collect',
        icon: '✨',
        points: 5
    },
    {
        id: 'collect_unique_10',
        name: 'Unique Collector',
        description: 'Collect 10 Unique pieces of equipment',
        target: 10,
        type: 'collect_unique',
        category: 'collect',
        icon: '💎',
        points: 20
    },
    {
        id: 'collect_set_1',
        name: 'First Set Piece',
        description: 'Obtain 1 Set equipment piece',
        target: 1,
        type: 'collect_set_item',
        category: 'collect',
        icon: '🟢',
        points: 10
    },
    {
        id: 'collect_set_10',
        name: 'Set Collector',
        description: 'Collect 10 Set equipment pieces',
        target: 10,
        type: 'collect_set_item',
        category: 'collect',
        icon: '🎁',
        points: 30
    },
    {
        id: 'equip_full_set',
        name: 'Set Master',
        description: 'Wear a full set at once (6 pieces)',
        target: 6,
        type: 'equip_set',
        category: 'collect',
        icon: '👑',
        points: 50
    },

    // ===== combatclass (combat) =====
    {
        id: 'total_damage_100k',
        name: 'Damage Dealer',
        description: 'Deal 100,000 total damage',
        target: 100000,
        type: 'total_damage',
        category: 'combat',
        icon: '💥',
        points: 10
    },
    {
        id: 'total_damage_1m',
        name: 'Battlefield Reaper',
        description: 'Deal 1,000,000 total damage',
        target: 1000000,
        type: 'total_damage',
        category: 'combat',
        icon: '⚡',
        points: 30
    },
    {
        id: 'crit_count_100',
        name: 'Crit Novice',
        description: 'Land 100 critical hits',
        target: 100,
        type: 'crit_count',
        category: 'combat',
        icon: '💢',
        points: 10
    },
    {
        id: 'crit_count_1000',
        name: 'Critical Master',
        description: 'Land 1000 critical hits',
        target: 1000,
        type: 'crit_count',
        category: 'combat',
        icon: '🔥',
        points: 25
    },
    {
        id: 'combo_50',
        name: 'Combo Master',
        description: 'Reach a 50-hit combo',
        target: 50,
        type: 'max_combo',
        category: 'combat',
        icon: '🎯',
        points: 20
    },
    {
        id: 'use_skill_500',
        name: 'Skill Apprentice',
        description: 'Use skills 500 times',
        target: 500,
        type: 'skill_use',
        category: 'combat',
        icon: '🔮',
        points: 15
    },

// ===== Economy (economy) =====
    {
        id: 'gold_10k',
        name: 'Comfortable Living',
        description: 'Earn 10,000 gold in total',
        target: 10000,
        type: 'total_gold',
        category: 'economy',
        icon: '💰',
        points: 5
    },
    {
        id: 'gold_100k',
        name: 'Local Tycoon',
        description: 'Earn 100,000 gold in total',
        target: 100000,
        type: 'total_gold',
        category: 'economy',
        icon: '💵',
        points: 15
    },
    {
        id: 'gold_1m',
        name: 'Billionaire',
        description: 'Earn 1,000,000 gold in total',
        target: 1000000,
        type: 'total_gold',
        category: 'economy',
        icon: '🏆',
        points: 40
    },
    {
        id: 'enhance_5',
        name: 'Blacksmith Apprentice',
        description: 'Enhance gear up to +5',
        target: 5,
        type: 'max_enhance',
        category: 'economy',
        icon: '🔨',
        points: 15
    },
    {
        id: 'enhance_9',
        name: 'Blacksmith Master',
        description: 'Enhance gear up to +9',
        target: 9,
        type: 'max_enhance',
        category: 'economy',
        icon: '⚒️',
        points: 50
    },

    // ===== becomelongclass (growth) =====
    {
        id: 'reach_level_10',
        name: 'Rising Adventurer',
        description: 'Reach level 10',
        target: 10,
        type: 'reach_level',
        category: 'growth',
        icon: '⭐',
        points: 5
    },
    {
        id: 'reach_level_30',
        name: 'Legendary Hero',
        description: 'Reach level 30',
        target: 30,
        type: 'reach_level',
        category: 'growth',
        icon: '🌟',
        points: 20
    },
    {
        id: 'reach_level_50',
        name: 'Immortal War God',
        description: 'Reach level 50',
        target: 50,
        type: 'reach_level',
        category: 'growth',
        icon: '👼',
        points: 40
    },
    {
        id: 'buy_talent_30',
        name: 'Talent Collector',
        description: 'Purchase 30 talents',
        target: 30,
        type: 'talent_bought',
        category: 'growth',
        icon: '📚',
        points: 15
    },
    {
        id: 'blessing_10',
        name: 'Blessing Favorite',
        description: 'Receive 10 Divine Blessings',
        target: 10,
        type: 'blessing_count',
        category: 'growth',
        icon: '🌈',
        points: 20
    }
];

// Achievement category config (unified golden tones)
const ACHIEVEMENT_CATEGORIES = {
    kill: { name: 'Kills', color: '#c7b377' },
    explore: { name: 'Exploration', color: '#c7b377' },
    collect: { name: 'Collection', color: '#c7b377' },
    combat: { name: 'Combat', color: '#c7b377' },
    economy: { name: 'Economy', color: '#c7b377' },
    growth: { name: 'Growth', color: '#c7b377' }
};

// Compute achievement stats
function getAchievementStats() {
    let completed = 0, total = ACHIEVEMENTS.length, points = 0, maxPoints = 0;
    ACHIEVEMENTS.forEach(ach => {
        maxPoints += ach.points || 0;
        if (player.achievements[ach.id]?.completed) {
            completed++;
            points += ach.points || 0;
        }
    });
    return { completed, total, points, maxPoints };
}

function normalizeHeroDirection(direction) {
    return [
        'front', 'back', 'left', 'right',
        'frontLeft', 'frontRight', 'backLeft', 'backRight'
    ].includes(direction) ? direction : 'front';
}

function triggerHeroAction(action, duration) {
    player.heroAction = action;
    player.heroActionTimer = Math.max(player.heroActionTimer || 0, duration);
    player.heroActionDuration = duration;
    player.animTime = 0;
}

function getCurrentHeroAction() {
    if (player.isDead) return 'death';
    if (typeof MarketSystem !== 'undefined' && MarketSystem.isStalling) return 'sit';
    if (player.heroActionTimer > 0 && player.heroAction) return player.heroAction;
    if (player.moving) return 'walk';
    return 'idle';
}

const PAPERDOLL_MOTION_PROFILES = Object.freeze({
    standard: Object.freeze({
        walkFrequency: 4, walkBounce: 1.2, walkChestY: 0.055, walkChestX: 0.025,
        settleDuration: 0.28, settleFrequency: 25, settleBounce: 0.65, settleChestY: 0.018, settleChestX: 0.009,
        breathFrequency: 0.68, breathChestY: 0.04, breathChestX: 0.018,
        headWalkFollow: 0.4, headBounceFollow: 0.2
    }),
    anime: Object.freeze({
        walkFrequency: 4, walkBounce: 1.8, walkChestY: 0.085, walkChestX: 0.04,
        settleDuration: 0.34, settleFrequency: 19, settleBounce: 0.9, settleChestY: 0.03, settleChestX: 0.014,
        breathFrequency: 0.68, breathChestY: 0.04, breathChestX: 0.018,
        headWalkFollow: 0.75, headBounceFollow: 0.36
    })
});
const ACTIVE_PAPERDOLL_MOTION_PROFILE = 'anime';

function getPaperdollMotionPose(actor, isWalking, animTime) {
    const profile = PAPERDOLL_MOTION_PROFILES[ACTIVE_PAPERDOLL_MOTION_PROFILE];
    const pose = actor === player
        ? (PaperdollSystem.motionPose || (PaperdollSystem.motionPose = {}))
        : (actor.paperdollMotionPose || (actor.paperdollMotionPose = {}));
    pose.chestScaleY = 1;
    pose.chestScaleX = 1;
    pose.bounceY = 0;
    let bounceY = 0;
    const walkPhase = isWalking ? Math.sin((animTime || 0) * profile.walkFrequency * Math.PI) : 0;

    if (isWalking) {
        bounceY = walkPhase * profile.walkBounce;
        pose.chestScaleY = 1 + walkPhase * profile.walkChestY;
        pose.chestScaleX = 1 - walkPhase * profile.walkChestX;
        actor.lastWalkTime = Date.now();
    } else {
        const timeSinceWalk = (Date.now() - (actor.lastWalkTime || 0)) / 1000;
        if (timeSinceWalk < profile.settleDuration) {
            const settleFactor = 1 - timeSinceWalk / profile.settleDuration;
            const settlePhase = Math.sin(timeSinceWalk * profile.settleFrequency) * settleFactor;
            bounceY = settlePhase * profile.settleBounce;
            pose.chestScaleY = 1 + settlePhase * profile.settleChestY;
            pose.chestScaleX = 1 - settlePhase * profile.settleChestX;
        } else {
            const breathCycle = Math.sin((animTime || 0) * Math.PI * profile.breathFrequency);
            pose.chestScaleY = 1 + breathCycle * profile.breathChestY;
            pose.chestScaleX = 1 + breathCycle * profile.breathChestX;
        }
    }

    pose.bounceY = bounceY;
    pose.headWalkOffset = walkPhase * profile.headWalkFollow;
    pose.headBounceOffset = bounceY * profile.headBounceFollow;
    return pose;
}

function getHeroFrame(direction) {
    const action = getCurrentHeroAction();
    const safeDirection = action === 'sit' ? 'front' : normalizeHeroDirection(direction);
    const progress = player.heroActionDuration > 0
        ? Math.max(0, Math.min(0.999, 1 - player.heroActionTimer / player.heroActionDuration)) : 0;

// ========== Dedicated 4-frame cast/death strips ==========
// Must run before the paperdoll branch: the paperdoll has no cast/death frames and would draw both as a static stand.
    if (typeof ArtSamples !== 'undefined' && (action === 'cast' || action === 'death')) {
// Death keeps the right-facing mirror convention; cast strips face forward only, with a left mirror to tell sides apart.
        const strip = action === 'death'
            ? ArtSamples.heroSheetFrame('heroDeathSheet', Math.min(3, Math.floor((player.deathTimer || 0) / 0.9 * 4)), safeDirection.toLowerCase().includes('right'))
            : ArtSamples.heroSheetFrame('heroCastSheet', Math.floor(progress * 4), safeDirection.toLowerCase().includes('left'));
        if (strip) return strip;
    }

    // ========== 4x4 Paperdoll (Body & Head Calibrated Layering) ==========
    if (typeof PaperdollSystem !== 'undefined' && PaperdollSystem.enabled) {
        const bodyImg = PaperdollSystem.getBodyImage();
        const headImg = PaperdollSystem.getHeadImage();
        if (bodyImg || headImg) {
            const isMoving = action === 'walk';
            const { row, col } = PaperdollSystem.getFrame(safeDirection, isMoving, player.animTime);

            const cal = PaperdollSystem.calibration;
            const headCal = PaperdollSystem.getHeadCalibration(PaperdollSystem.currentHeadKey);
            const baseH = cal.baseHeight || 96;
            const dirOffset = (headCal.directionalOffsets && headCal.directionalOffsets[safeDirection]) || { x: 0, y: -35 };

            const bodyScale = (cal.body.directionalScales && cal.body.directionalScales[safeDirection]) || cal.body.scale || 1.02;
            const headScale = (headCal.directionalScales && headCal.directionalScales[safeDirection]) || headCal.scale || 0.54;

            const layers = [];
            let headOffsetY = dirOffset.y;
            const motionPose = getPaperdollMotionPose(player, action === 'walk', player.animTime);

            if (bodyImg) {
                const bW = Math.floor(bodyImg.width / 4);
                const bH = Math.floor(bodyImg.height / 4);
                const drawH = baseH * bodyScale;

                // 1. DIBUJAR CUERPO ENTERO Y SÓLIDO COMO BASE (0 cortes, 0 huecos, 100% continuo)
                layers.push({
                    type: 'body_base',
                    source: bodyImg,
                    frame: { x: col * bW, y: row * bH, width: bW, height: bH },
                    drawW: drawH,
                    drawH: drawH,
                    offsetX: cal.body.offsetX,
                    offsetY: cal.body.offsetY || 0
                });

                if (action === 'idle' || action === 'walk') {
                    // 2. CAPA SUPERIOR DE BUSTO / PECHO (Overlay dinámico sobre el cuerpo sólido)
                    // Solamente en vista frontal y laterales (row 0, 1, 2), no en espalda (row 3)
                    if (row !== 3) {
                        const chestRatio = 0.44; // Zona superior del Pecho / Busto (44%)
                        const topSrcH = Math.floor(bH * chestRatio);
                        const topDrawH = (drawH * chestRatio) * motionPose.chestScaleY;
                        const topDrawW = drawH * motionPose.chestScaleX;

                        // Posicionar overlay centrado en el pecho con offset de rebote
                        const chestOffsetX = cal.body.offsetX || 0;
                        const chestOffsetY = (cal.body.offsetY || 0) + drawH * chestRatio - topDrawH;

                        layers.push({
                            type: 'body_chest',
                            source: bodyImg,
                            frame: { x: col * bW, y: row * bH, width: bW, height: topSrcH },
                            drawW: topDrawW,
                            drawH: topDrawH,
                            offsetX: chestOffsetX,
                            offsetY: chestOffsetY
                        });
                    }

                    // Ligero movimiento de cabeza sincronizado
                    headOffsetY = dirOffset.y + motionPose.headWalkOffset + motionPose.headBounceOffset;
                }
            }
            if (headImg) {
                const hW = Math.floor(headImg.width / 4);
                const hH = Math.floor(headImg.height / 4);
                const drawH = baseH * headScale;
                layers.push({
                    type: 'head',
                    source: headImg,
                    frame: { x: col * hW, y: row * hH, width: hW, height: hH },
                    drawW: drawH,
                    drawH: drawH,
                    offsetX: dirOffset.x,
                    offsetY: headOffsetY
                });
            }

            return {
                x: 0,
                y: 0,
                width: 128,
                height: 128,
                animated: true,
                layers: layers,
                renderScale: 1
            };
        }
    }

    if (typeof ArtSamples !== 'undefined') {
        if (action === 'death') {
            const death = ArtSamples.deathFrame('hero', player.deathTimer, 0.9, safeDirection.toLowerCase().includes('right'));
            if (death) return death;
        }
        const transient = ['hurt', 'attack', 'cast'].includes(action);
        const sample = ArtSamples.heroFrame(action, safeDirection, transient ? Math.floor(progress * 4)
            : Math.floor((player.animTime || 0) * HERO_SPRITE_CONFIG.fps[action]) % 4);
        if (sample) return sample;
    }
    if (heroSpritesLoaded && processedHeroSprites) {
        const actionRows = HERO_SPRITE_CONFIG.rowsByAction[action] || HERO_SPRITE_CONFIG.rowsByAction.idle;
        const frameInfo = actionRows[safeDirection] || actionRows.front;
        const fps = HERO_SPRITE_CONFIG.fps[action] || HERO_SPRITE_CONFIG.fps.idle;
        const frameIndex = Math.floor((player.animTime || 0) * fps) % HERO_SPRITE_CONFIG.cols;
        return {
            x: frameIndex * HERO_SPRITE_CONFIG.frameWidth,
            y: frameInfo.row * HERO_SPRITE_CONFIG.frameHeight,
            width: HERO_SPRITE_CONFIG.frameWidth,
            height: HERO_SPRITE_CONFIG.frameHeight,
            flipX: !!frameInfo.flipX,
            animated: true
        };
    }

// While running a stall, use the sitting frame (index 4)
    if (typeof MarketSystem !== 'undefined' && MarketSystem.isStalling) {
        const frameX = 4 * SPRITE_CONFIG.frameWidth; // sit = 4
        const frameY = SPRITE_CONFIG.heroRow * SPRITE_CONFIG.frameHeight;
        return {
            x: frameX,
            y: frameY,
            width: SPRITE_CONFIG.frameWidth,
            height: SPRITE_CONFIG.frameHeight
        };
    }

    const frameMap = {
        'left': 0,
        'right': 1,
        'front': 2,
        'back': 3
    };
    const frameX = (frameMap[direction] || 0) * SPRITE_CONFIG.frameWidth;
    const frameY = SPRITE_CONFIG.heroRow * SPRITE_CONFIG.frameHeight;
    return {
        x: frameX,
        y: frameY,
        width: SPRITE_CONFIG.frameWidth,
        height: SPRITE_CONFIG.frameHeight
    };
}

let npcNeckAnchorCanvas = null;
const npcSpriteCellRectCache = new WeakMap();
const NPC_HEAD_ALPHA_COVERAGE_LIMIT = 0.9;
const NPC_FALLBACK_NECK_ANCHOR = Object.freeze({ x: 0.5, y: 0.2445, headX: 0.5 });

function getNPCSpriteCellRect(image, row, col) {
    let cells = npcSpriteCellRectCache.get(image);
    if (!cells) {
        cells = Array.from({ length: 4 }, (_, cellRow) => Array.from({ length: 4 }, (_, cellCol) => {
            const x = Math.round(cellCol * image.width / 4);
            const nextX = Math.round((cellCol + 1) * image.width / 4);
            const y = Math.round(cellRow * image.height / 4);
            const nextY = Math.round((cellRow + 1) * image.height / 4);
            return { x, y, width: nextX - x, height: nextY - y };
        }));
        npcSpriteCellRectCache.set(image, cells);
    }
    return cells[row][col];
}

function getNPCAlphaRowBounds(alphaData, width, y, bandStart = 0, bandEnd = width) {
    let left = bandEnd;
    let right = bandStart - 1;
    for (let x = bandStart; x < bandEnd; x++) {
        if (alphaData[(y * width + x) * 4 + 3] <= 24) continue;
        left = Math.min(left, x);
        right = Math.max(right, x);
    }
    return right < left ? null : { left, right, width: right - left + 1 };
}

function getNPCHeadAlphaCoverage(alphaData, width, height) {
    let opaque = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (alphaData[(y * width + x) * 4 + 3] > 24) opaque++;
        }
    }
    return opaque / (width * height);
}

function getNPCHeadNeckProfile(alphaData, width, height) {
    const bandStart = Math.floor(width * 0.18);
    const bandEnd = Math.ceil(width * 0.82);
    let contentBottom = -1;
    for (let y = height - 1; y >= 0; y--) {
        if (getNPCAlphaRowBounds(alphaData, width, y, bandStart, bandEnd)) {
            contentBottom = y;
            break;
        }
    }
    if (contentBottom < 0) return null;
    const sampleCount = Math.max(2, Math.round(height * 0.02));
    const samples = [];
    for (let y = Math.max(0, contentBottom - sampleCount + 1); y <= contentBottom; y++) {
        const bounds = getNPCAlphaRowBounds(alphaData, width, y, bandStart, bandEnd);
        if (bounds) samples.push({ width: bounds.width, center: (bounds.left + bounds.right + 1) / 2 });
    }
    if (samples.length === 0) return null;
    samples.sort((a, b) => a.width - b.width);
    return samples[Math.floor(samples.length / 2)];
}

function findNPCNeckAnchor(alphaData, width, height, targetWidth) {
    if (!(targetWidth > 0) || !Number.isFinite(targetWidth)) return null;
    const bandStart = Math.floor(width * 0.25);
    const bandEnd = Math.ceil(width * 0.75);
    const scanEnd = Math.max(3, Math.floor(height * 0.35));
    let bestScore = Infinity;
    let bestAnchor = null;

    for (let y = 0; y < scanEnd - 2; y++) {
        const first = getNPCAlphaRowBounds(alphaData, width, y, bandStart, bandEnd);
        const second = getNPCAlphaRowBounds(alphaData, width, y + 1, bandStart, bandEnd);
        const third = getNPCAlphaRowBounds(alphaData, width, y + 2, bandStart, bandEnd);
        if (!first || !second || !third) continue;
        const meanWidth = (first.width + second.width + third.width) / 3;
        const score = Math.abs(meanWidth - targetWidth);
        if (score >= bestScore) continue;
        bestScore = score;
        bestAnchor = {
            x: ((first.left + first.right + second.left + second.right + third.left + third.right + 3) / 6) / width,
            y: (y + 1) / height,
            width: meanWidth
        };
    }
    return bestAnchor;
}

function getNPCNeckAnchor(npc, bodyImage, headImage, row, col, bodyRenderW, headRenderW) {
    if (!npc.neckAnchorCache) npc.neckAnchorCache = Array.from({ length: 4 }, () => []);
    if (npc.neckAnchorCache[row][col]) return npc.neckAnchorCache[row][col];

    const bodyRect = getNPCSpriteCellRect(bodyImage, row, col);
    const headRect = getNPCSpriteCellRect(headImage, row, col);
    if (!npcNeckAnchorCanvas) npcNeckAnchorCanvas = document.createElement('canvas');
    if (npcNeckAnchorCanvas.width !== bodyRect.width || npcNeckAnchorCanvas.height !== bodyRect.height) {
        npcNeckAnchorCanvas.width = bodyRect.width;
        npcNeckAnchorCanvas.height = bodyRect.height;
    }
    const anchorCtx = npcNeckAnchorCanvas.getContext('2d', { willReadFrequently: true });
    anchorCtx.clearRect(0, 0, bodyRect.width, bodyRect.height);
    anchorCtx.drawImage(bodyImage, bodyRect.x, bodyRect.y, bodyRect.width, bodyRect.height, 0, 0, bodyRect.width, bodyRect.height);
    const bodyAlpha = anchorCtx.getImageData(0, 0, bodyRect.width, bodyRect.height).data;

    if (npcNeckAnchorCanvas.width !== headRect.width || npcNeckAnchorCanvas.height !== headRect.height) {
        npcNeckAnchorCanvas.width = headRect.width;
        npcNeckAnchorCanvas.height = headRect.height;
    }
    anchorCtx.clearRect(0, 0, headRect.width, headRect.height);
    anchorCtx.drawImage(headImage, headRect.x, headRect.y, headRect.width, headRect.height, 0, 0, headRect.width, headRect.height);
    const headAlpha = anchorCtx.getImageData(0, 0, headRect.width, headRect.height).data;
    const headCoverage = getNPCHeadAlphaCoverage(headAlpha, headRect.width, headRect.height);
    let anchor = null;
    if (headCoverage < NPC_HEAD_ALPHA_COVERAGE_LIMIT) {
        const headNeck = getNPCHeadNeckProfile(headAlpha, headRect.width, headRect.height);
        if (headNeck) {
            const bodyScale = bodyRenderW / bodyRect.width;
            const headScale = headRenderW / headRect.width;
            const desiredBodyWidth = headNeck.width * headScale / bodyScale;
            const bodyNeck = findNPCNeckAnchor(bodyAlpha, bodyRect.width, bodyRect.height, desiredBodyWidth);
            if (bodyNeck) anchor = { ...bodyNeck, headX: headNeck.center / headRect.width };
        }
    }
    if (!anchor) anchor = { ...NPC_FALLBACK_NECK_ANCHOR, width: 0 };
    npc.neckAnchorCache[row][col] = anchor;
    return anchor;
}

function drawActorSprite(ctx, source, frame, centerX, topY, drawW, drawH, tint = null) {
    if (frame.layers && frame.layers.length > 0) {
        if (frame.renderScale) {
            topY += drawH * (1 - frame.renderScale);
            drawW *= frame.renderScale; drawH *= frame.renderScale;
        }
        for (const layer of frame.layers) {
            if (layer.source) {
                const lW = layer.drawW || drawW;
                const lH = layer.drawH || drawH;
                const lX = layer.anchorX !== undefined
                    ? centerX + layer.anchorX - lW / 2
                    : centerX - lW / 2 + (layer.offsetX || 0);
                const baseBodyH = layer.drawW || drawH;
                const lY = layer.anchorY !== undefined
                    ? topY + layer.anchorY - lH
                    : layer.anchorBottom
                    ? (topY + baseBodyH - lH + (layer.offsetY || 0))
                    : (topY + (layer.offsetY || 0));

                if (frame.flipX) {
                    ctx.save();
                    ctx.translate(centerX, topY);
                    ctx.scale(-1, 1);
                    const localX = layer.anchorX !== undefined
                        ? layer.anchorX - lW / 2
                        : -lW / 2 + (layer.offsetX || 0);
                    SpriteRenderer.drawFrame(ctx, layer.source, layer.frame, localX, lY - topY, lW, lH, tint, HeroTintCache);
                    ctx.restore();
                } else {
                    SpriteRenderer.drawFrame(ctx, layer.source, layer.frame, lX, lY, lW, lH, tint, HeroTintCache);
                }
            }
        }
        return;
    }

    source = frame.source || source;
    if (frame.renderScale) {
        topY += drawH * (1 - frame.renderScale);
        drawW *= frame.renderScale; drawH *= frame.renderScale;
    }
    if (frame.flipX) {
        ctx.save();
        ctx.translate(centerX, topY);
        ctx.scale(-1, 1);
        SpriteRenderer.drawFrame(ctx, source, frame, -drawW / 2, 0, drawW, drawH, tint, HeroTintCache);
        ctx.restore();
        return;
    }

    SpriteRenderer.drawFrame(ctx, source, frame, centerX - drawW / 2, topY, drawW, drawH, tint, HeroTintCache);
}

function getEnemyMonsterType(enemy) {
    if (enemy?.monsterType || enemy?.type) return enemy.monsterType || enemy.type;
    if (enemy?.isBoss && Number.isInteger(enemy.frameIndex)) return BOSS_SPRITE_TYPES_BY_FRAME[enemy.frameIndex];
    return undefined;
}

const MONSTER_ACTION_PRIORITY = {
    attack: 1,
    hurt: 2
};

function getMonsterActionPriority(action) {
    if (!action || !Object.prototype.hasOwnProperty.call(MONSTER_ACTION_PRIORITY, action)) return 0;
    return MONSTER_ACTION_PRIORITY[action];
}

function triggerMonsterAction(enemy, action, duration) {
    const monsterType = getEnemyMonsterType(enemy);
    const typeConfig = MONSTER_SPRITE_CONFIG.types[monsterType];
    if (!enemy || !typeConfig || !typeConfig[action]) return;

    const currentAction = enemy.monsterActionTimer > 0 ? enemy.monsterAction : null;
    const currentPriority = getMonsterActionPriority(currentAction);
    const nextPriority = getMonsterActionPriority(action);
    if (currentAction && currentPriority > nextPriority) return;

    enemy.monsterAction = action;
    enemy.monsterActionTimer = duration;
    enemy.monsterActionDuration = duration;
    enemy.monsterAnimTime = 0;
}

function directionFromDelta(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) return dx >= 0 ? 'right' : 'left';
    return dy >= 0 ? 'front' : 'back';
}

function heroDirectionFromMoveDelta(dx, dy) {
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (absX > 0 && absY > 0 && Math.min(absX, absY) / Math.max(absX, absY) > 0.45) {
        if (dy >= 0) return dx >= 0 ? 'frontRight' : 'frontLeft';
        return dx >= 0 ? 'backRight' : 'backLeft';
    }
    return directionFromDelta(dx, dy);
}

function setMonsterFacingToward(enemy, targetX, targetY, lockDuration = 0) {
    if (!enemy) return;
    const direction = directionFromDelta(targetX - enemy.x, targetY - enemy.y);
    enemy.facingDirection = direction;
    if (direction === 'left' || direction === 'right') enemy.lastSideDirection = direction;
    if (lockDuration > 0) {
        enemy.actionDirection = direction;
        enemy.actionDirectionTimer = Math.max(enemy.actionDirectionTimer || 0, lockDuration);
    }
}

function getMonsterSpriteDirection(enemy) {
    if (enemy.actionDirectionTimer > 0 && enemy.actionDirection) return enemy.actionDirection;
    return enemy.facingDirection || 'front';
}

function getMonsterSpriteFrame(enemy) {
    const typeConfig = MONSTER_SPRITE_CONFIG.types[getEnemyMonsterType(enemy)];
    if (!typeConfig) return null;
    if (enemy.dead && typeof ArtSamples !== 'undefined') {
        const direction = getMonsterSpriteDirection(enemy);
        const death = ArtSamples.deathFrame(getEnemyMonsterType(enemy), enemy.deathVisualDuration - enemy.deathVisualTimer,
            enemy.isBoss ? 0.72 : 0.48, direction === 'right' || (direction === 'back' && enemy.lastSideDirection === 'right'));
        if (death) return death;
    }

    const skillVisual = enemy.bossSkillVisual?.timer > 0 ? enemy.bossSkillVisual : null;
    let action = 'idle';
    if (skillVisual) action = 'attack';
    else if (enemy.monsterActionTimer > 0 && enemy.monsterAction === 'hurt') action = 'hurt';
    else if (enemy.hitFlashTimer > 0) action = 'hurt';
    else if (enemy.monsterActionTimer > 0 && enemy.monsterAction === 'attack') action = 'attack';
    else if (enemy.wasMoving) action = 'walk';

    const direction = skillVisual ? skillVisual.direction : getMonsterSpriteDirection(enemy);
    const actionRows = typeConfig[action] || typeConfig.idle;
    let frameInfo;
    if (direction === 'left') frameInfo = actionRows.side;
    else if (direction === 'right') frameInfo = { ...actionRows.side, flipX: true };
    else if (direction === 'back' && actionRows.back) frameInfo = actionRows.back;
    else if (direction === 'back' && actionRows.side) frameInfo = {
        ...actionRows.side,
        flipX: enemy.lastSideDirection === 'right'
    };
    else frameInfo = actionRows.front || actionRows.side;

    const fps = MONSTER_SPRITE_CONFIG.fps[action] || MONSTER_SPRITE_CONFIG.fps.idle;
    let frameIndex;
    if (skillVisual) {
// The first two frames go to wind-up; release and recovery play only after damage lands; hit tinting never eats the animation.
        const progress = Math.max(0, Math.min(0.999, 1 - skillVisual.timer / skillVisual.duration));
        frameIndex = (skillVisual.phase === 'cast' ? 0 : 2) + Math.floor(progress * 2);
    } else if ((action === 'attack' || action === 'hurt') && enemy.monsterActionDuration > 0) {
        const progress = Math.max(0, Math.min(0.999, 1 - (enemy.monsterActionTimer / enemy.monsterActionDuration)));
        frameIndex = Math.floor(progress * MONSTER_SPRITE_CONFIG.cols);
    } else {
        frameIndex = Math.floor((enemy.monsterAnimTime || 0) * fps) % MONSTER_SPRITE_CONFIG.cols;
    }
    if (typeof ArtSamples !== 'undefined') {
        const side = direction === 'left' || direction === 'right' || direction === 'back';
        const sample = ArtSamples.frame(getEnemyMonsterType(enemy), { idle: 0, walk: 1, attack: 2, hurt: 3 }[action],
            frameIndex + (side ? 4 : 0), !!frameInfo.flipX);
        if (sample) return sample;
    }
    if (!monsterSpritesLoaded || !processedMonsterSprites) return null;
    return {
        x: frameIndex * MONSTER_SPRITE_CONFIG.frameWidth,
        y: frameInfo.row * MONSTER_SPRITE_CONFIG.frameHeight,
        width: MONSTER_SPRITE_CONFIG.frameWidth,
        height: MONSTER_SPRITE_CONFIG.frameHeight,
        flipX: !!frameInfo.flipX,
        animated: true
    };
}

function drawMonsterSprite(ctx, source, frame, centerX, bottomY, drawW, drawH, tint = null) {
    source = frame.source || source;
    if (frame.renderScale) { drawW *= frame.renderScale; drawH *= frame.renderScale; }
    if (frame.flipX) {
        ctx.save();
        ctx.translate(centerX, bottomY - drawH);
        ctx.scale(-1, 1);
        SpriteRenderer.drawFrame(ctx, source, frame, -drawW / 2, 0, drawW, drawH, tint, MonsterTintCache);
        ctx.restore();
        return;
    }

    SpriteRenderer.drawFrame(ctx, source, frame, centerX - drawW / 2, bottomY - drawH, drawW, drawH, tint, MonsterTintCache);
}

const ContactShadowCache = new Map();

function getContactShadowSprite(width, height, alpha) {
    const w = Math.max(8, Math.round(width));
    const h = Math.max(4, Math.round(height));
    const a = Math.round(alpha * 100);
    const key = `${w}x${h}:${a}`;
    if (ContactShadowCache.has(key)) return ContactShadowCache.get(key);

    const shadow = document.createElement('canvas');
    shadow.width = w;
    shadow.height = h;
    const shadowCtx = shadow.getContext('2d');
    const gradient = shadowCtx.createRadialGradient(w / 2, h / 2, 1, w / 2, h / 2, w / 2);
    gradient.addColorStop(0, `rgba(0, 0, 0, ${alpha})`);
    gradient.addColorStop(0.62, `rgba(0, 0, 0, ${alpha * 0.45})`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    shadowCtx.fillStyle = gradient;
    shadowCtx.fillRect(0, 0, w, h);
    ContactShadowCache.set(key, shadow);
    return shadow;
}

function drawContactShadow(ctx, x, y, width, height, alpha = 0.28) {
    const shadow = getContactShadowSprite(width, height, alpha);
    ctx.drawImage(shadow, Math.round(x - shadow.width / 2), Math.round(y - shadow.height / 2));
}

function drawOutlinedText(ctx, text, x, y, fillStyle, font, strokeStyle = 'rgba(0,0,0,0.85)', lineWidth = 3) {
    ctx.save();
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = fillStyle;
    ctx.fillText(text, x, y);
    ctx.restore();
}

function drawBossDangerTelegraphs(ctx) {
    CombatTactics.draw(ctx, enemies, camera, getViewportWidth(), getViewportHeight());
}

function getActiveBossForHud() {
    let selected = null;
    let selectedDist = Infinity;
    for (let i = 0, len = enemies.length; i < len; i++) {
        const e = enemies[i];
        if (!e?.isBoss || e.dead || e.hp <= 0) continue;
        const dist = Math.hypot(e.x - player.x, e.y - player.y);
        if (dist < selectedDist) {
            selected = e;
            selectedDist = dist;
        }
    }
    return selected;
}

function drawBossHealthHud() {
    const boss = getActiveBossForHud();
    if (!boss || isInTown()) return;

    const viewportWidth = getViewportWidth();
    const w = Math.min(620, Math.max(340, viewportWidth * 0.52));
    const h = 24;
    const x = (viewportWidth - w) / 2;
    const y = 78;
    const hpRatio = Math.max(0, Math.min(1, boss.hp / boss.maxHp));
    const enraged = boss.enraged || hpRatio <= 0.3;
    const phaseText = hpRatio <= 0.3 ? 'Enrage Phase' : (hpRatio <= 0.7 ? 'Overpower Phase' : 'Boss Phase');

    ctx.save();
    ctx.textAlign = 'center';
    ctx.shadowColor = enraged ? '#ff2200' : '#660000';
    ctx.shadowBlur = enraged ? 18 : 10;

    ctx.fillStyle = 'rgba(8, 6, 5, 0.82)';
    ctx.fillRect(x - 14, y - 2, w + 28, h + 30);
    ctx.strokeStyle = enraged ? 'rgba(255, 95, 50, 0.85)' : 'rgba(190, 52, 36, 0.75)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 14, y - 2, w + 28, h + 30);

    ctx.fillStyle = 'rgba(45, 10, 8, 0.95)';
    ctx.fillRect(x, y, w, h);
    const fill = ctx.createLinearGradient(x, y, x + w, y);
    fill.addColorStop(0, enraged ? '#ff2a16' : '#b81512');
    fill.addColorStop(0.55, enraged ? '#ff6a22' : '#e22b1d');
    fill.addColorStop(1, '#5c0504');
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w * hpRatio, h);

    ctx.fillStyle = 'rgba(255, 230, 180, 0.22)';
    ctx.fillRect(x, y, w * hpRatio, Math.max(3, h * 0.28));

    ctx.strokeStyle = 'rgba(255, 210, 120, 0.65)';
    ctx.lineWidth = 1;
    [0.7, 0.3].forEach(mark => {
        const mx = x + w * mark;
        ctx.beginPath();
        ctx.moveTo(mx, y - 4);
        ctx.lineTo(mx, y + h + 4);
        ctx.stroke();
    });

    clearGlow(ctx);
    ctx.fillStyle = '#f1d8a4';
    ctx.font = 'bold 15px Cinzel';
    ctx.fillText(boss.name, viewportWidth / 2, y + h + 16);
    ctx.font = '11px Cinzel';
    ctx.fillStyle = enraged ? '#ffb088' : '#c9a66a';
    ctx.fillText(`${phaseText}  ${Math.ceil(boss.hp)} / ${boss.maxHp}`, viewportWidth / 2, y + 16);
    ctx.restore();
}

function getPlayerVisualProfile() {
    const activeSkill = player.activeSkill && player.activeSkill !== 'attack' ? player.activeSkill : 'attack';
    const skillProfiles = {
        attack: { color: 'rgba(235, 220, 185, 0.34)', stroke: '#f1dfb8', trail: '#ffffff' },
        fireball: { color: 'rgba(255, 92, 24, 0.30)', stroke: '#ff7a28', trail: '#ff8a2a' },
        thunder: { color: 'rgba(92, 205, 255, 0.28)', stroke: '#8ee8ff', trail: '#9be8ff' },
        multishot: { color: 'rgba(185, 255, 72, 0.24)', stroke: '#caff62', trail: '#d7ff66' },
        holy_shield: { color: 'rgba(255, 220, 92, 0.26)', stroke: '#ffe17a', trail: '#ffe17a' }
    };
    const profile = skillProfiles[activeSkill] || skillProfiles.attack;
    const mainhand = player.equipment?.mainhand;
    const hasSetPower = Object.values(player.equippedSets || {}).some(count => count >= 4);

    if (mainhand?.rarity === RARITY.SET || hasSetPower) {
        return { ...profile, setColor: 'rgba(32, 255, 96, 0.34)', trail: '#41ff78' };
    }
    if (mainhand?.rarity >= RARITY.UNIQUE) {
        return { ...profile, trail: '#ffd76a', setColor: 'rgba(255, 210, 86, 0.28)' };
    }
    return profile;
}

function drawPlayerDisciplineAura(ctx, x, y) {
    const profile = getPlayerVisualProfile();
    const time = Date.now() / 1000;
    const pulse = 0.75 + Math.sin(time * 2.8) * 0.16;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(x, y + 2);
    ctx.scale(1, 0.42);

    const radius = 40 + pulse * 6;
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    glow.addColorStop(0, profile.color);
    glow.addColorStop(0.55, profile.color);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 0.62;
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.38;
    ctx.strokeStyle = profile.stroke;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(0, 0, 30 + pulse * 4, 0, Math.PI * 2);
    ctx.stroke();

    if (profile.setColor) {
        ctx.globalAlpha = 0.30;
        ctx.strokeStyle = profile.setColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 43 + pulse * 5, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();
}

function getPlayerShieldVisualProfile() {
    if (player.shield?.type === 'reflect') {
        return {
            edge: 'rgba(190, 132, 255, ',
            rim: '#c084fc',
            core: 'rgba(232, 213, 255, ',
            rune: '#f0e8ff',
            facet: 'rgba(235, 220, 255, '
        };
    }
    if (player.shield?.type === 'guard') {
        return {
            edge: 'rgba(92, 232, 140, ',
            rim: '#72f0a2',
            core: 'rgba(210, 255, 226, ',
            rune: '#caffd8',
            facet: 'rgba(214, 255, 228, '
        };
    }
    return {
        edge: 'rgba(255, 224, 96, ',
        rim: '#ffe680',
        core: 'rgba(255, 246, 188, ',
        rune: '#fff1a8',
        facet: 'rgba(255, 244, 190, '
    };
}

function getShieldVisualGrowthTier() {
    const tree = player.skillTree?.holy_shield;
    const stage1 = tree?.stage1 || 0;
    const stage2 = tree?.stage2?.level || 0;
    const stage3 = tree?.stage3?.level || 0;
    if (stage1 >= 10 || stage3 > 0) return 2;
    if (stage1 >= 5 || stage2 > 0) return 1;
    return 0;
}

function drawShieldSacredWallRunes(ctx, profile, visualTier, shieldPercent, pulse) {
    if (visualTier <= 0 && player.shield?.type !== 'guard') return;

    ctx.save();
    ctx.globalAlpha = (0.22 + shieldPercent * 0.22 + pulse * 0.08) * (visualTier >= 2 ? 1 : 0.72);
    ctx.strokeStyle = profile.rune;
    ctx.lineWidth = visualTier >= 2 ? 1.5 : 1.1;
    ctx.shadowColor = profile.rim;
    ctx.shadowBlur = 7 + visualTier * 3;
    ctx.lineCap = 'round';

    for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(side * (24 + visualTier * 3), -2);
        ctx.lineTo(side * (34 + visualTier * 5), -62);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(side * (18 + visualTier * 2), -38);
        ctx.lineTo(side * (29 + visualTier * 4), -46);
        ctx.lineTo(side * (22 + visualTier * 3), -54);
        ctx.stroke();
    }

    ctx.globalAlpha *= 0.62;
    ctx.setLineDash([4, 8]);
    ctx.beginPath();
    ctx.arc(0, -24, 30 + visualTier * 4, Math.PI * 0.16, Math.PI * 0.84);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
}

function drawShieldMirrorFacets(ctx, profile, visualTier, shieldPercent, pulse) {
    if (player.shield?.type !== 'reflect' && visualTier < 2) return;

    ctx.save();
    ctx.globalAlpha = 0.20 + shieldPercent * 0.22 + pulse * 0.08;
    ctx.strokeStyle = profile.facet + (0.48 + shieldPercent * 0.28).toFixed(2) + ')';
    ctx.lineWidth = visualTier >= 2 ? 1.45 : 1.05;
    ctx.shadowColor = profile.rim;
    ctx.shadowBlur = 8;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(-18, -54);
    ctx.lineTo(18, -54);
    ctx.lineTo(30, -28);
    ctx.lineTo(12, -2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(18, -54);
    ctx.lineTo(-18, -54);
    ctx.lineTo(-30, -28);
    ctx.lineTo(-12, -2);
    ctx.stroke();

    ctx.globalAlpha *= 0.6;
    ctx.beginPath();
    ctx.moveTo(-26, -34);
    ctx.lineTo(0, -18);
    ctx.lineTo(26, -34);
    ctx.stroke();
    ctx.restore();
}

function drawPlayerShieldBack(ctx, x, y) {
    if (!player.shield?.active || !(player.shield.value > 0)) return;
    if (player.graphicsQuality !== 'low' && typeof Shield3D !== 'undefined' && Shield3D.draw(ctx, x, y, player.shield, false)) return;

    const shieldPercent = Math.max(0, Math.min(1, player.shield.value / player.shield.maxValue));
    const profile = getPlayerShieldVisualProfile();
    const visualTier = getShieldVisualGrowthTier();
    const pulse = 0.5 + Math.sin(Date.now() / 260) * 0.5;
    const edgeAlpha = 0.16 + shieldPercent * 0.14 + pulse * 0.04;

    ctx.save();
    ctx.translate(x, y);

    const backGradient = ctx.createRadialGradient(0, -24, 14, 0, -24, 42);
    backGradient.addColorStop(0, 'rgba(255,255,255,0)');
    backGradient.addColorStop(0.52, profile.core + (edgeAlpha * 0.10).toFixed(2) + ')');
    backGradient.addColorStop(0.82, profile.edge + edgeAlpha.toFixed(2) + ')');
    backGradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = backGradient;
    ctx.beginPath();
    ctx.ellipse(0, -24, 34, 42, 0, 0, Math.PI * 2);
    ctx.fill();

    if (visualTier >= 1) {
        ctx.globalAlpha = 0.12 + shieldPercent * 0.08;
        ctx.strokeStyle = profile.rim;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, -24, 39 + visualTier * 4, 47 + visualTier * 3, 0, Math.PI * 1.04, Math.PI * 1.96);
        ctx.stroke();
    }

    ctx.globalAlpha = 0.18 + shieldPercent * 0.12;
    ctx.strokeStyle = profile.rim;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([7, 10]);
    ctx.beginPath();
    ctx.ellipse(0, -24, 30, 38, 0, Math.PI * 1.06, Math.PI * 1.94);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
}

function drawPlayerShieldFront(ctx, x, y) {
    if (!player.shield?.active || !(player.shield.value > 0)) return;
    if (player.graphicsQuality !== 'low' && typeof Shield3D !== 'undefined' && Shield3D.draw(ctx, x, y, player.shield, true)) {
        ctx.save();ctx.translate(x,y);
        const profile=getPlayerShieldVisualProfile(),tier=getShieldVisualGrowthTier();
        const ratio=Math.max(0,Math.min(1,player.shield.value/player.shield.maxValue));
        const pulse=.5+Math.sin(Date.now()/220)*.5;
        drawShieldSacredWallRunes(ctx,profile,tier,ratio,pulse);
        drawShieldMirrorFacets(ctx,profile,tier,ratio,pulse);
        ctx.restore();return;
    }

    const shieldPercent = Math.max(0, Math.min(1, player.shield.value / player.shield.maxValue));
    const profile = getPlayerShieldVisualProfile();
    const visualTier = getShieldVisualGrowthTier();
    const pulse = 0.5 + Math.sin(Date.now() / 220) * 0.5;
    const alpha = 0.36 + shieldPercent * 0.22 + pulse * 0.08;

    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = profile.edge + alpha.toFixed(2) + ')';
    ctx.lineWidth = 2.2;
    ctx.shadowColor = profile.rim;
    ctx.shadowBlur = 9 + pulse * 5;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.arc(0, -24, 34, Math.PI * 0.10, Math.PI * 0.90);
    ctx.stroke();

    ctx.lineWidth = 1.3;
    ctx.globalAlpha = 0.65;
    ctx.beginPath();
    ctx.arc(0, -24, 28, Math.PI * 0.04, Math.PI * 0.32);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -24, 28, Math.PI * 0.68, Math.PI * 0.96);
    ctx.stroke();

    drawShieldSacredWallRunes(ctx, profile, visualTier, shieldPercent, pulse);
    drawShieldMirrorFacets(ctx, profile, visualTier, shieldPercent, pulse);

    ctx.globalAlpha = 0.28 + shieldPercent * 0.16;
    ctx.shadowBlur = 0;
    ctx.strokeStyle = profile.rim;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 2, 24, 8, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
}

function drawEnemyActor(ctx, e) {
    if (!e || (e.dead && !(e.deathVisualTimer > 0))) return;
    if (e.x < camera.x - 100 || e.x > camera.x + getViewportWidth() + 100 ||
        e.y < camera.y - 120 || e.y > camera.y + getViewportHeight() + 100) return;

    const rx = Math.round(e.x);
    const ry = Math.round(e.y);
    const reactAlpha = e.hitReactTimer > 0 ? Math.max(0, e.hitReactTimer / (e.hitReactDuration || 0.12)) : 0;
    const bodyX = rx + (e.hitReactX || 0) * reactAlpha;
    const bodyY = ry + (e.hitReactY || 0) * reactAlpha;
    const animatedMonsterFrame = getMonsterSpriteFrame(e);
    const deathAlpha = e.dead ? Math.max(0, Math.min(1, e.deathVisualTimer / (e.isBoss ? 0.35 : 0.25))) : 1;
    const deathProgress = e.dead && !animatedMonsterFrame?.death ? 1 - deathAlpha : 0;

    const shadowWidth = e.isBoss ? Math.max(64, e.radius * 4.4) : (animatedMonsterFrame ? 46 : 34);
    const shadowHeight = e.isBoss ? 18 : (animatedMonsterFrame ? 12 : 9);
    drawContactShadow(ctx, rx, ry - 2, shadowWidth, shadowHeight, (e.isBoss ? 0.36 : 0.27) * deathAlpha);
    if (!e.dead) drawEliteAffixAuras(ctx, e, rx, ry);

    if (e.isBoss && !e.dead) {
        ctx.beginPath();
        ctx.arc(rx, ry, (e.radius + 5) / 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(180, 0, 0, 0.25)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 50, 50, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    if (animatedMonsterFrame) {
        const renderHeight = MONSTER_SPRITE_CONFIG.renderSize * (e.isBoss ? 1.6 : e.isElite ? 1.12 : 1);
        const renderWidth = renderHeight * animatedMonsterFrame.width / animatedMonsterFrame.height;

        let tint = null;
        if (e.dead) tint = null;
        else if (e.hitFlashTimer > 0) tint = 'white';
        else if (e.frozenTimer > 0 || e.slowedTimer > 0) tint = 'ice';
        else if (e.poisonTimer > 0) tint = 'poison';
        else if (e.lightningOverloadTimer > 0 && Math.floor(Date.now() / 50) % 2 === 0) tint = 'lightning';

        ctx.save();
        ctx.globalAlpha *= deathAlpha;
        ctx.translate(bodyX, bodyY + deathProgress * 6);
        if (reactAlpha > 0 && !e.dead) ctx.rotate((e.hitTilt || 0) * reactAlpha);
        const juiceScale = e.dead ? 1 : (e.juiceScale || 1.0);
        ctx.scale(juiceScale * (1 + deathProgress * 0.08), (1.0 / juiceScale) * (1 - deathProgress * 0.22));
        drawMonsterSprite(ctx, processedMonsterSprites, animatedMonsterFrame, 0, 0, renderWidth, renderHeight, tint);
        ctx.restore();
    } else if (spritesLoaded && processedSpriteSheet && e.frameIndex !== undefined) {
        const frame = e.isBoss ? getBossFrame(e.frameIndex) : getMonsterFrame(e.frameIndex);
        const renderHeight = ACTOR_RENDER_SIZE * (e.isBoss ? 1.6 : e.isElite ? 1.12 : 1);
        const renderWidth = renderHeight * frame.width / frame.height;

        let source = processedSpriteSheet;
        if (e.hitFlashTimer > 0) source = TintCache.white;
        else if (e.frozenTimer > 0 || e.slowedTimer > 0) source = TintCache.ice;
        else if (e.poisonTimer > 0) source = TintCache.poison;
        else if (e.lightningOverloadTimer > 0 && Math.floor(Date.now() / 50) % 2 === 0) source = TintCache.lightning;

        ctx.save();
        ctx.globalAlpha *= deathAlpha;
        ctx.translate(bodyX, bodyY + deathProgress * 6);
        if (reactAlpha > 0) ctx.rotate((e.hitTilt || 0) * reactAlpha);
        const juiceScale = e.juiceScale || 1.0;
        ctx.scale(juiceScale * (1 + deathProgress * 0.08), (1.0 / juiceScale) * (1 - deathProgress * 0.22));
        ctx.drawImage(source, frame.x, frame.y, frame.width, frame.height,
            -renderWidth / 2, -renderHeight, renderWidth, renderHeight);
        ctx.restore();
    } else {
        if (e.hitFlashTimer > 0) ctx.fillStyle = '#ffffff';
        else ctx.fillStyle = e.frozenTimer > 0 ? COLORS.ice : (e.rarity > 0 ? '#ffaa00' : (e.isBoss ? '#9000cc' : '#880000'));
        if (e.isQuestTarget) ctx.fillStyle = '#ff00aa';
        ctx.beginPath();
        ctx.arc(bodyX, bodyY, e.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    if (e.dead) return;

    ctx.fillStyle = '#500';
    ctx.fillRect(rx - 15, ry - e.radius - 8, 30, 4);
    ctx.fillStyle = '#f00';
    ctx.fillRect(rx - 15, ry - e.radius - 8, 30 * (e.hp / e.maxHp), 4);
    drawOutlinedText(ctx, e.isBoss ? '⚔ ' + e.name : e.name, rx, ry - e.radius - 35,
        e.isBoss ? '#ff5555' : (e.rarity > 0 ? '#ffaa00' : '#dddddd'), '10px Cinzel');

    if (e.eliteAffixes && e.eliteAffixes.length > 0) {
        let yOffset = -45;
        for (let ai = 0, aLen = e.eliteAffixes.length; ai < aLen; ai++) {
            const affix = e.eliteAffixes[ai];
            drawOutlinedText(ctx, affix.name, e.x, e.y - e.radius + yOffset, affix.color, '9px Cinzel', 'rgba(0,0,0,0.9)', 2);
            yOffset -= 12;
        }

        const affixIconMap = {
            speed: '»', power: '▲', fire: '🔥', cold: '❄', lightning: '⚡',
            armor: '◆', resist: '◇', leech: '♥', mana: '◆',
            curse: '☠', volley: '≋', spectral: '✦'
        };
        const iconY = e.y - e.radius - 52;
        const iconStartX = e.x - (e.eliteAffixes.length - 1) * 9;
        for (let ai = 0, aLen = e.eliteAffixes.length; ai < aLen; ai++) {
            const affix = e.eliteAffixes[ai];
            const icon = affixIconMap[affix.icon] || affix.icon || '✦';
            drawOutlinedText(ctx, icon, iconStartX + ai * 18, iconY, affix.color, '15px Arial');
        }
    }
}

function drawArrowProjectile(ctx, p, color, length = 22, width = 4) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.lineCap = 'round';
    ctx.shadowColor = color;
    ctx.shadowBlur = player.graphicsQuality === 'high' ? 8 : 0;

    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = width + 2;
    ctx.beginPath();
    ctx.moveTo(-length, 0);
    ctx.lineTo(4, 0);
    ctx.stroke();

    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(-length, 0);
    ctx.lineTo(4, 0);
    ctx.stroke();

    ctx.fillStyle = '#f8f1c8';
    ctx.beginPath();
    ctx.moveTo(9, 0);
    ctx.lineTo(-2, -5);
    ctx.lineTo(1, 0);
    ctx.lineTo(-2, 5);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-length + 4, -3);
    ctx.lineTo(-length - 4, -7);
    ctx.moveTo(-length + 4, 3);
    ctx.lineTo(-length - 4, 7);
    ctx.stroke();
    ctx.restore();
}

function drawOrbProjectile(ctx, p) {
    const color = p.color || '#ffaa00';
    const radius = p.type === 'fireball' ? 7 : 5;
    ctx.save();
    setGlow(ctx, p.type === 'fireball' ? 18 : 10, color);
    const grad = ctx.createRadialGradient(p.x - radius * 0.35, p.y - radius * 0.35, 1, p.x, p.y, radius);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.35, color);
    grad.addColorStop(1, 'rgba(0,0,0,0.15)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
    clearGlow(ctx);
    ctx.restore();
}

function emitSkillImpactBurst(type, x, y, angle = 0, power = 1) {
    if (type === 'multishot') {
        createImpactParticles(x, y, '#c3bb9d', power > 1.3 ? 4 : 2, angle);
        return;
    }
    const palette = SKILL_IMPACT_PALETTES[type];
    if (!palette) return;

    const vfxEffectId = SKILL_IMPACT_VFX[type];
    if (vfxEffectId) {
        spawnVfxEffect(vfxEffectId, x, y, Math.min(1.75, Math.max(0.72, power)), angle);
    }

    const maxP = getParticleConfig().maxParticles;
    if (particles.length >= maxP) return;

    const qualityScale = player.graphicsQuality === 'low' ? 0.68 : 1;
    const baseRadius = (type === 'fireball' ? 30 : type === 'thunder' ? 24 : 18) * power;
    const sparkCount = Math.max(4, Math.floor((type === 'fireball' ? 12 : type === 'thunder' ? 9 : 6) * power * qualityScale));

    particles.push(ParticlePool.acquire({
        x, y,
        type: 'skill_ground_glow',
        color: palette.glow,
        color2: palette.main,
        life: 0.22 + 0.06 * power,
        maxLife: 0.22 + 0.06 * power,
        radius: baseRadius,
        size: 1
    }));

    if (particles.length < maxP) {
        particles.push(ParticlePool.acquire({
            x, y,
            type: 'skill_impact_ring',
            color: palette.ring,
            life: 0.20 + 0.05 * power,
            maxLife: 0.20 + 0.05 * power,
            radius: baseRadius * 0.45,
            grow: baseRadius * 0.78,
            width: type === 'fireball' ? 3 : 2,
            rotation: angle
        }));
    }

    if (type === 'thunder') {
        for (let i = 0; i < 3; i++) {
            if (particles.length >= maxP) break;
            particles.push(ParticlePool.acquire({
                x, y,
                type: 'skill_impact_ray',
                color: i === 0 ? palette.core : palette.main,
                life: 0.16,
                maxLife: 0.16,
                angle: angle + (i - 1) * 2.05 + (Math.random() - 0.5) * 0.3,
                length: 22 + Math.random() * 18,
                width: i === 0 ? 3 : 2
            }));
        }
    }

    for (let i = 0; i < sparkCount; i++) {
        if (particles.length >= maxP) break;
        const spread = type === 'multishot' ? 0.95 : Math.PI * 2;
        const a = type === 'multishot'
            ? angle + Math.PI + (Math.random() - 0.5) * spread
            : Math.random() * Math.PI * 2;
        const speed = (type === 'fireball' ? 85 : type === 'thunder' ? 105 : 75) * (0.55 + Math.random() * 0.65) * power;
        particles.push(ParticlePool.acquire({
            x: x + (Math.random() - 0.5) * 6,
            y: y + (Math.random() - 0.5) * 6,
            vx: Math.cos(a) * speed,
            vy: Math.sin(a) * speed - (type === 'fireball' ? 22 : 8),
            color: Math.random() < 0.28 ? palette.core : (Math.random() < 0.55 ? palette.ember : palette.main),
            life: 0.22 + Math.random() * 0.22,
            size: (type === 'multishot' ? 1.4 : 2.2) + Math.random() * 2.2,
            gravity: type === 'fireball' ? 60 : 0
        }));
    }
}

function getSkillVisualGrowthTier(skillName) {
    const level = player.skills?.[skillName];
    if (!Number.isFinite(level)) return 0;
    if (level >= 10) return 2;
    if (level >= 5) return 1;
    return 0;
}

function getSkillVisualNearbyEnemies(x, y, range, limit, excludeSet = new Set()) {
    const candidates = [];
    const rSq = range * range;
    for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        if (e.dead || excludeSet.has(e)) continue;
        const dx = e.x - x;
        const dy = e.y - y;
        const distSq = dx * dx + dy * dy;
        if (distSq > rSq) continue;
        candidates.push({ enemy: e, distSq });
    }
    candidates.sort((a, b) => a.distSq - b.distSq);
    return candidates.slice(0, limit).map(item => item.enemy);
}

function emitFireballVisualGrowth(x, y, angle, tier) {
    if (tier <= 0) return;

    const maxP = getParticleConfig().maxParticles;
    const palette = SKILL_IMPACT_PALETTES.fireball;
    const meteorCount = tier >= 2 ? 5 : 3;
    const fanStep = tier >= 2 ? 22 : 19;
    const forward = tier >= 2 ? 28 : 18;

    for (let i = 0; i < meteorCount; i++) {
        const lane = i - (meteorCount - 1) / 2;
        const sideAngle = angle + Math.PI / 2;
        const mx = x + Math.cos(angle) * (forward + Math.random() * 12) + Math.cos(sideAngle) * lane * fanStep + (Math.random() - 0.5) * 8;
        const my = y + Math.sin(angle) * (forward + Math.random() * 12) + Math.sin(sideAngle) * lane * fanStep + (Math.random() - 0.5) * 8;

        spawnVfxEffect('fireballImpact', mx, my, tier >= 2 ? 0.72 : 0.58, angle + (Math.random() - 0.5) * 0.4);

        if (particles.length < maxP) {
            particles.push(ParticlePool.acquire({
                x: mx,
                y: my + 3,
                type: 'skill_ground_glow',
                color: palette.glow,
                color2: palette.main,
                life: 0.24,
                maxLife: 0.24,
                radius: tier >= 2 ? 26 : 20,
                size: 1
            }));
        }

        for (let j = 0; j < (tier >= 2 ? 4 : 3); j++) {
            if (particles.length >= maxP) break;
            particles.push(ParticlePool.acquire({
                x: mx + (Math.random() - 0.5) * 18,
                y: my - 62 - Math.random() * 28,
                vx: (Math.random() - 0.5) * 34,
                vy: 130 + Math.random() * 70,
                color: Math.random() < 0.35 ? palette.core : (Math.random() < 0.65 ? palette.ember : palette.main),
                life: 0.30 + Math.random() * 0.16,
                size: 2.4 + Math.random() * 2.8,
                gravity: 130
            }));
        }
    }
}

function emitThunderVisualGrowth(target, linkedTargets, tier) {
    if (!target || tier <= 0) return;

    const maxP = getParticleConfig().maxParticles;
    const palette = SKILL_IMPACT_PALETTES.thunder;
    const excludeSet = new Set([target]);
    const visibleTargets = [];

    for (let i = 0; i < linkedTargets.length; i++) {
        const t = linkedTargets[i];
        if (!t || t === target || t.dead || excludeSet.has(t)) continue;
        visibleTargets.push(t);
        excludeSet.add(t);
    }

    const range = tier >= 2 ? 210 : 155;
    const limit = tier >= 2 ? 5 : 3;
    const nearby = getSkillVisualNearbyEnemies(target.x, target.y, range, limit, excludeSet);
    const webTargets = visibleTargets.concat(nearby).slice(0, limit);

    if (particles.length < maxP) {
        particles.push(ParticlePool.acquire({
            x: target.x,
            y: target.y,
            type: 'skill_impact_ring',
            color: palette.ring,
            life: 0.24,
            maxLife: 0.24,
            radius: 18,
            grow: tier >= 2 ? 68 : 46,
            width: tier >= 2 ? 3 : 2,
            rotation: Math.random() * Math.PI
        }));
    }

    for (let i = 0; i < webTargets.length; i++) {
        const t = webTargets[i];
        createLightningChain(target.x, target.y, t.x, t.y);
        if (tier >= 2 && i > 0) {
            const prev = webTargets[i - 1];
            createLightningChain(prev.x, prev.y, t.x, t.y);
        }
    }
}

function createArrowCurtainTrail(p, pConfig) {
    if (p.type !== 'multishot' || !p.visualTier) return;
    const maxP = getParticleConfig().maxParticles;
    if (particles.length >= maxP) return;
    const chance = pConfig.multishotTrail * (p.visualTier >= 2 ? 0.55 : 0.32);
    if (Math.random() > chance) return;

    const sideAngle = p.angle + Math.PI / 2;
    const offset = (Math.random() - 0.5) * (p.visualTier >= 2 ? 18 : 12);
    particles.push(ParticlePool.acquire({
        x: p.x - Math.cos(p.angle) * 10 + Math.cos(sideAngle) * offset,
        y: p.y - Math.sin(p.angle) * 10 + Math.sin(sideAngle) * offset,
        type: 'skill_impact_ray',
        color: Math.random() < 0.35 ? '#ffffcc' : '#d8ff5a',
        life: 0.12,
        maxLife: 0.12,
        angle: p.angle + Math.PI + (Math.random() - 0.5) * 0.12,
        length: p.visualTier >= 2 ? 34 : 22,
        width: p.visualTier >= 2 ? 1.8 : 1.2
    }));
}

function emitMultishotVisualGrowth(x, y, angle, tier) {
    if (tier <= 0) return;


    const maxP = getParticleConfig().maxParticles;
    const palette = SKILL_IMPACT_PALETTES.multishot;
    const rayCount = tier >= 2 ? 9 : 5;
    const spread = tier >= 2 ? 0.9 : 0.56;

    for (let i = 0; i < rayCount; i++) {
        if (particles.length >= maxP) break;
        const t = rayCount === 1 ? 0 : i / (rayCount - 1);
        const rayAngle = angle + (t - 0.5) * spread;
        particles.push(ParticlePool.acquire({
            x: x - Math.cos(rayAngle) * 4 + (Math.random() - 0.5) * 5,
            y: y - Math.sin(rayAngle) * 4 + (Math.random() - 0.5) * 5,
            type: 'skill_impact_ray',
            color: i === Math.floor(rayCount / 2) ? palette.core : palette.ring,
            life: 0.16,
            maxLife: 0.16,
            angle: rayAngle,
            length: tier >= 2 ? 48 : 34,
            width: i === Math.floor(rayCount / 2) ? 2.2 : 1.5
        }));
    }
}

function drawGroundItemRarityAura(ctx, item, x, y) {
    if (item.rarity < RARITY.MAGIC) return;
    const color = getItemColor(item.rarity);
    const time = Date.now() / 1000;
    const pulse = 0.72 + Math.sin(time * 3.2 + x * 0.01 + y * 0.01) * 0.18;
    const radius = item.rarity >= RARITY.UNIQUE ? 22 : (item.rarity === RARITY.RARE ? 18 : 14);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(x, y + 2);
    ctx.scale(1, 0.42);
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    glow.addColorStop(0, color);
    glow.addColorStop(0.45, color);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = (item.rarity >= RARITY.RARE ? 0.20 : 0.10) * pulse;
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    if (item.rarity >= RARITY.RARE) {
        ctx.globalAlpha = 0.35 * pulse;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.82, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();
}

function drawGroundItem(ctx, i) {
    if (i.x < camera.x - 100 || i.x > camera.x + getViewportWidth() + 100 ||
        i.y < camera.y - 100 || i.y > camera.y + getViewportHeight() + 100) return;

    const isConsumable = i.type === 'gold' || i.type === 'potion' || i.type === 'scroll';
    if (!isAltPressed && !isConsumable && i.rarity < 2) return;

    const rx = Math.round(i.x);
    const ry = Math.round(i.y);
    const rz = Math.round(i.z || 0);
    drawGroundItemRarityAura(ctx, i, rx, ry);

    if (itemSpritesLoaded && processedItemSprites) {
        const coords = getItemSpriteCoords(i);
        const size = 32;
        const spriteSize = processedItemSprites.width / 4;

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(rx, ry, i.z > 0 ? 8 : 10, i.z > 0 ? 4 : 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.drawImage(processedItemSprites,
            coords.col * spriteSize, coords.row * spriteSize, spriteSize, spriteSize,
            rx - size / 2, ry - rz - size / 2, size, size
        );
    } else {
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(rx, ry, 10, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = getItemColor(i.rarity);
        ctx.textAlign = 'center';
        ctx.font = '20px serif';
        ctx.fillText(i.icon || '📦', rx, ry - rz + 7);
    }

    if (i.rarity >= 4) {
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = getItemColor(i.rarity);
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 9, ry - 70);
        ctx.lineTo(rx + 9, ry - 70);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

function drawGroundItems(ctx) {
    for (let gi = 0, gLen = groundItems.length; gi < gLen; gi++) drawGroundItem(ctx, groundItems[gi]);
}

function getNPCFrame(frameIndex) {
    const frameX = frameIndex * SPRITE_CONFIG.frameWidth;
    const frameY = SPRITE_CONFIG.npcRow * SPRITE_CONFIG.frameHeight;
    return {
        x: frameX,
        y: frameY,
        width: SPRITE_CONFIG.frameWidth,
        height: SPRITE_CONFIG.frameHeight
    };
}

function getMonsterFrame(frameIndex) {
    const frameX = frameIndex * SPRITE_CONFIG.frameWidth;
    const frameY = SPRITE_CONFIG.monsterRow * SPRITE_CONFIG.frameHeight;
    return {
        x: frameX,
        y: frameY,
        width: SPRITE_CONFIG.frameWidth,
        height: SPRITE_CONFIG.frameHeight
    };
}

function getBossFrame(frameIndex) {
    const frameX = frameIndex * SPRITE_CONFIG.frameWidth;
    const frameY = SPRITE_CONFIG.bossRow * SPRITE_CONFIG.frameHeight;
    return {
        x: frameX,
        y: frameY,
        width: SPRITE_CONFIG.frameWidth,
        height: SPRITE_CONFIG.frameHeight
    };
}

// Achievement tracking system
function trackAchievement(type, data = {}) {
    ACHIEVEMENTS.forEach(ach => {
        if (ach.type !== type || !player.achievements[ach.id]) return;
        if (player.achievements[ach.id].completed) return;

        let progress = player.achievements[ach.id].progress || 0;
        let shouldCheck = false;

        switch (type) {
            case 'kill_monster':
                if (data.monsterName === ach.monsterName) {
                    player.achievements[ach.id].progress = ++progress;
                    shouldCheck = true;
                }
                break;

            case 'kill_boss':
                if (data.isBoss || data.isQuestTarget) {
                    player.achievements[ach.id].progress = ++progress;
                    shouldCheck = true;
                }
                break;

            case 'kill_elite':
                if (data.isElite) {
                    player.achievements[ach.id].progress = ++progress;
                    shouldCheck = true;
                }
                break;

            case 'kill_specific_boss': {
                const incoming = (typeof stripBossDifficultyPrefix === 'function') ? stripBossDifficultyPrefix(data.name || '') : (data.name || '');
                if (incoming === ach.bossName) {
                    player.achievements[ach.id].progress = ++progress;
                    shouldCheck = true;
                }
                break;
            }

            case 'reach_floor':
                if (player.floor >= ach.target) {
                    completeAchievement(ach);
                }
                return;

            case 'reach_level':
                if (player.lvl >= ach.target) {
                    completeAchievement(ach);
                }
                return;

            case 'enter_hell':
                player.achievements[ach.id].progress = 1;
                completeAchievement(ach);
                return;

            case 'collect_unique':
                player.achievements[ach.id].progress = ++progress;
                shouldCheck = true;
                break;

            case 'collect_set_item':
                player.achievements[ach.id].progress = ++progress;
                shouldCheck = true;
                break;

            case 'total_damage':
                player.achievements[ach.id].progress = (progress + (data.damage || 0));
                shouldCheck = true;
                break;

            case 'crit_count':
                player.achievements[ach.id].progress = ++progress;
                shouldCheck = true;
                break;

            case 'max_combo':
                if ((data.combo || 0) > progress) {
                    player.achievements[ach.id].progress = data.combo;
                    shouldCheck = true;
                }
                break;

            case 'skill_use':
                player.achievements[ach.id].progress = ++progress;
                shouldCheck = true;
                break;

            case 'total_gold':
                player.achievements[ach.id].progress = (progress + (data.amount || 0));
                shouldCheck = true;
                break;

            case 'max_enhance':
                if ((data.level || 0) > progress) {
                    player.achievements[ach.id].progress = data.level;
                    shouldCheck = true;
                }
                break;

            case 'talent_bought':
                player.achievements[ach.id].progress = ++progress;
                shouldCheck = true;
                break;

            case 'blessing_count':
                player.achievements[ach.id].progress = ++progress;
                shouldCheck = true;
                break;
        }

        if (shouldCheck && player.achievements[ach.id].progress >= ach.target) {
            completeAchievement(ach);
        }
    });
}

// Achievement unlock notification queue and state
const achievementNotifyQueue = [];
let isShowingAchievementNotify = false;

function showAchievementUnlockNotification(achievement) {
    if (!achievement) return;
    achievementNotifyQueue.push(achievement);
    processAchievementNotifyQueue();
}

function processAchievementNotifyQueue() {
    if (isShowingAchievementNotify || achievementNotifyQueue.length === 0) return;

    const ach = achievementNotifyQueue.shift();
    isShowingAchievementNotify = true;

// Make sure notificationArea and its dedicated achievement slot exist
    const parentArea = (typeof cachedUI !== 'undefined' && cachedUI.notificationArea) ? cachedUI.notificationArea : document.getElementById('notification-area');
    let slot = document.getElementById('achievement-notify-slot');
    if (!slot && parentArea) {
        slot = document.createElement('div');
        slot.id = 'achievement-notify-slot';
        slot.className = 'achievement-notify-slot';
        parentArea.prepend(slot);
    }
    if (!slot) {
        isShowingAchievementNotify = false;
        return;
    }

    // languagei18ntext
    const unlockedLabel = typeof I18N !== 'undefined'
        ? I18N.tOr('achievement_unlocked', 'Achievement Unlocked')
        : 'Achievement Unlocked';
    const pointsLabel = typeof I18N !== 'undefined'
        ? I18N.tOr('achievement_points', 'Points')
        : 'Points';

    const banner = document.createElement('div');
    banner.className = 'achievement-unlock-banner achievement-slide-in';
    banner.setAttribute('role', 'alert');
    banner.setAttribute('aria-live', 'polite');

    const iconStr = ach.icon || '🏆';
    const points = ach.points || 10;
    const descStr = ach.description || '';

    banner.innerHTML = `
        <div class="ach-banner-shimmer"></div>
        <div class="ach-banner-icon-box">
            <span class="ach-banner-icon">${iconStr}</span>
            <div class="ach-banner-icon-ring"></div>
        </div>
        <div class="ach-banner-content">
            <div class="ach-banner-kicker">
                <span class="ach-kicker-star">★</span>
                <span class="ach-kicker-text">${unlockedLabel}</span>
                <span class="ach-kicker-star">★</span>
            </div>
            <div class="ach-banner-title">${ach.name}</div>
            <div class="ach-banner-desc">
                <span class="ach-banner-desc-text">${descStr}</span>
                <span class="ach-banner-reward">+${points} ${pointsLabel}</span>
            </div>
        </div>
        <div class="ach-banner-corner top-left"></div>
        <div class="ach-banner-corner top-right"></div>
        <div class="ach-banner-corner bottom-left"></div>
        <div class="ach-banner-corner bottom-right"></div>
    `;

    slot.innerHTML = '';
    slot.appendChild(banner);

// Stay visible and smoothly slide out before the end
    const DISPLAY_DURATION = 3400;
    const EXIT_ANIM_DURATION = 450;

    setTimeout(() => {
        banner.classList.remove('achievement-slide-in');
        banner.classList.add('achievement-slide-out');

        setTimeout(() => {
            if (banner.parentNode) {
                banner.parentNode.removeChild(banner);
            }
            isShowingAchievementNotify = false;
// If new achievements are queued, show the next one
            if (achievementNotifyQueue.length > 0) {
                setTimeout(processAchievementNotifyQueue, 150);
            }
        }, EXIT_ANIM_DURATION);
    }, DISPLAY_DURATION);
}

function completeAchievement(achievement) {
    player.achievements[achievement.id].completed = true;
    player.achievements[achievement.id].completedAt = Date.now();

    showAchievementUnlockNotification(achievement);
    AudioSys.play('quest');

    SaveSystem.save();
}

// check set collection achievement
function checkSetAchievements() {
// 2. Check 'Set Master': a full set worn at once
    const equipAch = ACHIEVEMENTS.find(a => a.id === 'equip_full_set');
    if (equipAch && player.achievements['equip_full_set']) {
// Find the most set pieces worn
        let maxEquipped = 0;
        for (let setId in player.equippedSets) {
            if (player.equippedSets[setId] > maxEquipped) {
                maxEquipped = player.equippedSets[setId];
            }
        }

        // Updateprogress（mostmany6piece）
        player.achievements['equip_full_set'].progress = Math.min(maxEquipped, 6);

// Check completion (all 6 pieces worn)
        if (!player.achievements['equip_full_set'].completed && maxEquipped >= 6) {
            completeAchievement(equipAch);
        }
    }
}

function checkNoDeathRun() {
    if (player.floor >= 10) {
        const ach = ACHIEVEMENTS.find(a => a.id === 'no_death_run');
        if (!ach || !player.achievements['no_death_run']) return;

        if (!player.achievements['no_death_run'].completed) {
            completeAchievement(ach);
        }
    }
}

function initAchievements() {
    ACHIEVEMENTS.forEach(ach => {
        if (!player.achievements[ach.id]) {
            player.achievements[ach.id] = {
                progress: 0,
                completed: false
            };
        }
    });
}

const SLOT_MAP = {
    'weapon': 'mainhand', 'armor': 'body', 'helm': 'helm', 'gloves': 'gloves',
    'boots': 'boots', 'belt': 'belt', 'ring': 'ring', 'amulet': 'amulet'
};


// Graphics quality toggle
function toggleGraphicsQuality() {
    if (!cachedUI.selectGraphicsQuality) return;
    const val = cachedUI.selectGraphicsQuality.value;
    player.graphicsQuality = val;
    document.body.classList.toggle('high-quality', val === 'high');
    resize();
    SaveSystem.save();
    showNotification(`VFX quality: ${val === 'high' ? 'Fancy VFX' : 'Performance'}`);
}

// ========== offline rewardssystem ==========
const OfflineRewards = {
    // Config constants
    MAX_OFFLINE_HOURS: 8,        // Max offline duration (hours)
    MIN_OFFLINE_MINUTES: 5,      // Min offline duration (minutes)
    EFFICIENCY: 0.5,             // Offline efficiency (50% of online)

// Base hourly earnings (at floor 1)
    BASE_GOLD_PER_HOUR: 600,
    BASE_XP_PER_HOUR: 80,

// Gear drop chance (per hour)
    MAGIC_DROP_CHANCE: 0.15,     // blueequip 15%/smallhour
    RARE_DROP_CHANCE: 0.03,      // yellowequip 3%/smallhour

// Gear-to-gold value
    MAGIC_TO_GOLD: 50,
    RARE_TO_GOLD: 150,

// Compute the floor factor (endless floors supported)
    getFloorMultiplier(floor) {
        // 1-10floor:1.0 + floor×0.1 = 1.1 ~ 2.0
        // 11-20floor:2.0 + (floor-10)×0.08 = 2.08 ~ 2.8
        // 21-30floor:2.8 + (floor-20)×0.06 = 2.86 ~ 3.4
        // 31+floor:3.4 + (floor-30)×0.04，sealpush5.0
        if (floor <= 10) {
            return 1.0 + floor * 0.1;
        } else if (floor <= 20) {
            return 2.0 + (floor - 10) * 0.08;
        } else if (floor <= 30) {
            return 2.8 + (floor - 20) * 0.06;
        } else {
            return Math.min(5.0, 3.4 + (floor - 30) * 0.04);
        }
    },

    // Calcoffline rewards
    calculate(lastOnlineTime, maxFloor) {
        const now = Date.now();
        const offlineMs = now - lastOnlineTime;
        const offlineMinutes = offlineMs / 60000;

// Under 5 minutes offline: no rewards
        if (offlineMinutes < this.MIN_OFFLINE_MINUTES) {
            return null;
        }

// Cap the max offline duration
        const cappedHours = Math.min(offlineMinutes / 60, this.MAX_OFFLINE_HOURS);

        // Use best normal floor (ignore Hell)
        const effectiveFloor = maxFloor || 1;

        const floorMult = this.getFloorMultiplier(effectiveFloor);

        // CalcgoldandXP
        const gold = Math.floor(this.BASE_GOLD_PER_HOUR * cappedHours * floorMult * this.EFFICIENCY);
        const xp = Math.floor(this.BASE_XP_PER_HOUR * cappedHours * floorMult * this.EFFICIENCY);

// Compute the gear drop count
        const magicRolls = cappedHours * this.MAGIC_DROP_CHANCE;
        const rareRolls = cappedHours * this.RARE_DROP_CHANCE;

// Generate the gear count via accumulated probability
        let magicCount = Math.floor(magicRolls);
        if (Math.random() < (magicRolls - magicCount)) magicCount++;

        let rareCount = Math.floor(rareRolls);
        if (Math.random() < (rareRolls - rareCount)) rareCount++;

// Generate the gear list
        const items = [];
        const itemLevel = Math.max(1, effectiveFloor);

        for (let i = 0; i < rareCount; i++) {
            items.push(this.generateOfflineItem(itemLevel, 3)); // yellowequip
        }
        for (let i = 0; i < magicCount; i++) {
            items.push(this.generateOfflineItem(itemLevel, 2)); // blueequip
        }

        return {
            offlineMinutes: Math.floor(offlineMinutes),
            cappedHours: cappedHours,
            gold: gold,
            xp: xp,
            items: items,
            floor: effectiveFloor
        };
    },

// Generate offline gear
    generateOfflineItem(level, rarity) {
        const types = ['weapon', 'armor', 'helm', 'gloves', 'boots', 'belt', 'ring', 'amulet'];
// Names must match BASE_ITEMS exactly, or createItem picks randomly (possibly potions/scrolls)
        const typeNames = ['Short Sword', 'Leather Armor', 'Leather Cap', 'Leather Gloves', 'Leather Boots', 'Light Belt', 'Copper Ring', 'Amulet'];
        const typeIdx = Math.floor(Math.random() * types.length);

        const item = createItem(typeNames[typeIdx], level);
        item.rarity = rarity;

// Regenerate stats by rarity
        if (rarity >= 2) {
            const p = AFFIXES.prefixes[Math.floor(Math.random() * AFFIXES.prefixes.length)];
            item.displayName = p.name + " " + item.name;
            item.stats[p.stat] = Math.floor(Math.random() * (p.max - p.min)) + p.min;
        }
        if (rarity >= 3) {
            const s = AFFIXES.suffixes[Math.floor(Math.random() * AFFIXES.suffixes.length)];
            item.displayName += s.name;
            item.stats[s.stat] = (item.stats[s.stat] || 0) + Math.floor(Math.random() * (s.max - s.min)) + s.min;
        }

        return item;
    },

    // claimoffline rewards
    claim(rewards) {
        if (!rewards) return { success: false };

        // 1. grantgold
        addGold(rewards.gold);

        // 2. grantXP
        const oldLvl = player.lvl;
        player.xp += rewards.xp;
        while (player.xp >= player.xpNext) {
            player.xp -= player.xpNext;
            player.lvl++;
            player.points += 5;
            player.skillPoints += 1;
            player.xpNext = Math.floor(100 * Math.pow(1.15, player.lvl - 1));
        }
        const leveledUp = player.lvl > oldLvl;

// 3. Grant gear (converts to gold if the inventory is full)
        let itemsReceived = 0;
        let itemsConverted = 0;
        let convertedGold = 0;

        for (const item of rewards.items) {
            const emptySlot = player.inventory.findIndex(x => !x);
            if (emptySlot >= 0) {
                player.inventory[emptySlot] = item;
                itemsReceived++;
                trackItemFound(item);
            } else {
// Inventory full: convert to gold
                const goldValue = item.rarity === 3 ? this.RARE_TO_GOLD : this.MAGIC_TO_GOLD;
                addGold(goldValue);
                itemsConverted++;
                convertedGold += goldValue;
            }
        }

        // mark as claimed
        player.offlineRewardsClaimed = true;
        player.lastOnlineTime = Date.now();

        // UpdateUI
        updateStats();
        updateUI();
        renderInventory();

        return {
            success: true,
            itemsReceived,
            itemsConverted,
            convertedGold,
            leveledUp,
            newLevel: player.lvl
        };
    },

    // Showoffline rewardspanel
    showPanel(rewards, playSound = true) {
        if (!rewards) return;

        const overlay = document.getElementById('offline-rewards-overlay');
        if (!overlay) return;

// Format the offline duration
        let timeText;
        if (rewards.offlineMinutes < 60) {
            timeText = typeof I18N !== 'undefined'
                ? I18N.t('offline_mins', { m: rewards.offlineMinutes })
                : `${rewards.offlineMinutes} min`;
        } else {
            const hours = Math.floor(rewards.offlineMinutes / 60);
            const mins = rewards.offlineMinutes % 60;
            timeText = typeof I18N !== 'undefined'
                ? (mins > 0
                    ? I18N.t('offline_hours_mins', { h: hours, m: mins })
                    : (hours === 1 ? I18N.t('offline_hour', { h: hours }) : I18N.t('offline_hours', { h: hours })))
                : (mins > 0 ? `${hours}h ${mins}m` : `${hours}h`);
        }

        // ifexceedover8smallhour，Showtoast
        if (rewards.cappedHours >= this.MAX_OFFLINE_HOURS) {
            const maxHoursText = typeof I18N !== 'undefined'
                ? I18N.t('offline_max_hours', { h: this.MAX_OFFLINE_HOURS })
                : `(capped at ${this.MAX_OFFLINE_HOURS}h)`;
            timeText += ` <span style="color:#888;">${maxHoursText}</span>`;
        }

        const floorText = typeof I18N !== 'undefined'
            ? I18N.t('floor_number', { floor: rewards.floor })
            : `Floor ${rewards.floor}`;

// Gear list HTML
        let itemsHtml = '';
        if (rewards.items.length > 0) {
            itemsHtml = '<div class="offline-items">';
            for (const item of rewards.items) {
                const color = item.rarity === 3 ? '#ffff00' : '#4d94ff';
                itemsHtml += `<div class="offline-item" style="color:${color};">${item.displayName}</div>`;
            }
            itemsHtml += '</div>';
        } else {
            const emptyText = typeof I18N !== 'undefined' ? I18N.t('offline_no_drops') : 'No equipment drops';
            itemsHtml = `<div class="offline-items-empty">${emptyText}</div>`;
        }

        document.getElementById('offline-time-text').innerHTML = timeText;
        document.getElementById('offline-floor-text').innerText = floorText;
        document.getElementById('offline-gold-text').innerText = rewards.gold.toLocaleString();
        document.getElementById('offline-xp-text').innerText = rewards.xp.toLocaleString();
        document.getElementById('offline-items-container').innerHTML = itemsHtml;

// Store pending claimable rewards
        window.pendingOfflineRewards = rewards;

        overlay.classList.add('active');
        if (playSound) AudioSys.play('levelup');
    },

    // close panelandclaim
    claimAndClose() {
        const rewards = window.pendingOfflineRewards;
        if (!rewards) return;

        const result = this.claim(rewards);

        // playclaimSFX
        AudioSys.play('coins');

        // Showfloating texteffect（goldandXP）
        const baseY = player.y - 40;
        let delay = 0;

        // goldfloating text（gold-colored）
        setTimeout(() => {
            createDamageNumber(player.x, baseY, `+${rewards.gold.toLocaleString()} G`, '#ffd700', true);
        }, delay);
        delay += 200;

        // XPfloating text（blue-greencolor）
        setTimeout(() => {
            createDamageNumber(player.x, baseY - 20, `+${rewards.xp.toLocaleString()} XP`, '#00ffff', true);
        }, delay);
        delay += 200;

// Gear count floating text (if any)
        if (result.itemsReceived > 0) {
            setTimeout(() => {
                createDamageNumber(player.x, baseY - 40, `+${result.itemsReceived} Equipment`, '#ff88ff', true);
            }, delay);
            delay += 200;
        }

        // upgradeVFX
        if (result.leveledUp) {
            setTimeout(() => {
                createDamageNumber(player.x, baseY - 60, `Level up! Lv.${result.newLevel}`, '#ffff00', true);
                AudioSys.play('levelup');
                // upgradeglow
                for (let i = 0; i < 20; i++) {
                    particles.push({
                        x: player.x, y: player.y,
                        vx: (Math.random() - 0.5) * 200,
                        vy: -Math.random() * 150 - 50,
                        life: 1, maxLife: 1,
                        color: '#ffd700', size: 4
                    });
                }
            }, delay);
        }

// Show the claim result toast
        let msg = `Offline rewards claimed!`;
        if (result.itemsConverted > 0) {
            msg += `\n${result.itemsConverted} item(s) converted to ${result.convertedGold} gold because the inventory was full`;
        }
        if (result.leveledUp) {
            msg += `\nLevel up to Lv.${result.newLevel}!`;
        }
        showNotification(msg);

        // close panel
        document.getElementById('offline-rewards-overlay').classList.remove('active');
        window.pendingOfflineRewards = null;

        // Save
        SaveSystem.save();
    }
};

// ========== Death panel system ==========
const DeathPanel = {
    // Config constants
    REVIVE_COST_PER_LEVEL: 500,     // Revive cost per level
    REVIVE_SAFE_DISTANCE: 350,      // Safe revive distance (away from enemies)
    REVIVE_INVINCIBLE_TIME: 1.5,    // Post-revive invincibility (seconds)

    // Calcrevivecost:max(level, stacks) × 500
    getReviveCost() {
        const floor = player.isInHell ? player.hellFloor : player.floor;
        const base = Math.max(player.lvl, floor);
        return base * this.REVIVE_COST_PER_LEVEL;
    },

    // Showdeathpanel
    show(playSound = true) {
        const overlay = document.getElementById('death-panel-overlay');
        if (!overlay) return;

// Fill the battle-record data
        const floorText = player.isInHell
            ? (typeof I18N !== 'undefined' ? I18N.t('hell_floor_number', { floor: player.hellFloor }) : `Hell Floor ${player.hellFloor}`)
            : (typeof I18N !== 'undefined' ? I18N.t('floor_number', { floor: player.floor }) : `Floor ${player.floor}`);
        document.getElementById('death-floor-text').innerText = floorText;
        document.getElementById('death-kills-text').innerText = typeof I18N !== 'undefined'
            ? I18N.t(player.kills === 1 ? 'death_kills_one' : 'death_kills_value', { count: player.kills })
            : `${player.kills} slain`;
        document.getElementById('death-level-text').innerText = `Lv.${player.lvl}`;

        // cause of death
        const monsterName = player.lastDamageSource ? ((typeof I18N !== 'undefined' && I18N.getMonsterName) ? I18N.getMonsterName(player.lastDamageSource) : player.lastDamageSource) : null;
        const causeText = monsterName
            ? (typeof I18N !== 'undefined' ? I18N.t('death_killed_by', { source: monsterName }) : `Slain by ${monsterName}`)
            : (typeof I18N !== 'undefined' ? I18N.t('death_unknown_cause') : 'Unknown cause of death');
        document.getElementById('death-cause-text').innerText = causeText;

// Gold display and revive cost
        const reviveCost = this.getReviveCost();
        document.getElementById('death-gold-text').innerText = player.gold.toLocaleString();
        document.getElementById('revive-cost-text').innerText = reviveCost.toLocaleString();

// Revive button state
        const reviveBtn = document.getElementById('death-revive-btn');
        if (player.gold >= reviveCost) {
            reviveBtn.disabled = false;
        } else {
            reviveBtn.disabled = true;
        }

        // Show panel
        overlay.classList.add('active');

        // playdeathSFX（usesinkre-killSFX）
        if (playSound) AudioSys.play('hit_kill');
    },

    // close panel
    hide() {
        const overlay = document.getElementById('death-panel-overlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    },

// Revive in place
    revive() {
        const reviveCost = this.getReviveCost();

        // check gold
        if (player.gold < reviveCost) {
            showNotification(typeof I18N !== 'undefined' ? I18N.t('revive_no_gold') : 'Not enough gold to revive!');
            return;
        }

        // deductiongold
        player.gold -= reviveCost;

// Compute a safe revive position (away from the nearest enemy)
        const safePos = this.findSafePosition(player.x, player.y);
        player.x = safePos.x;
        player.y = safePos.y;

// Restore full HP and mana
        player.hp = player.maxHp;
        player.mp = player.maxMp;

// Set invincibility time
        player.invincibleTimer = this.REVIVE_INVINCIBLE_TIME;

// Clear the death state
        player.isDead = false;
        player.deathTimer = 0;

// Remove the grayscale filter
        document.getElementById('game-container').classList.remove('dead-filter');

        // close panel
        this.hide();

        // reviveVFX
        this.playReviveEffect();

        // notify
        const costStr = reviveCost.toLocaleString();
        showNotification(typeof I18N !== 'undefined' ? I18N.t('revive_success', { cost: costStr }) : `Revived! Spent ${costStr} gold`);

        // UpdateUI
        updateStats();
        updateUI();

        // Save
        SaveSystem.save();
    },

    // return to town（free）
    returnToTown() {
// Clear the death state
        player.isDead = false;
        player.deathTimer = 0;

// Restore full HP and mana
        player.hp = player.maxHp;
        player.mp = player.maxMp;

        // Reset Hell state
        const wasInHell = player.isInHell;
        player.isInHell = false;

// Remove the grayscale filter
        document.getElementById('game-container').classList.remove('dead-filter');

        // close panel
        this.hide();

// Teleport back to town
        enterFloor(0);

        if (wasInHell) {
            showNotification(typeof I18N !== 'undefined' ? I18N.t('return_camp_from_hell') : 'Returned from Hell to Camp');
        } else {
            showNotification(typeof I18N !== 'undefined' ? I18N.t('return_camp') : 'Returned to Camp');
        }

        // Save
        SaveSystem.save();
    },

// Check whether a position is safe (not in a wall, considering the player radius)
    // Note:mapData[y][x] === 0 iswall，=== 1 isfloor
    isPositionSafe(x, y) {
        const radius = player.radius || 15;
// Check the center and surrounding cells
        const checkPoints = [
            { x: x, y: y },                           // center
            { x: x - radius, y: y },                  // left
            { x: x + radius, y: y },                  // right
            { x: x, y: y - radius },                  // up
            { x: x, y: y + radius },                  // down
            { x: x - radius * 0.7, y: y - radius * 0.7 }, // top-left
            { x: x + radius * 0.7, y: y - radius * 0.7 }, // top-right
            { x: x - radius * 0.7, y: y + radius * 0.7 }, // bottom-left
            { x: x + radius * 0.7, y: y + radius * 0.7 }  // bottom-right
        ];

        for (const p of checkPoints) {
            const tileX = Math.floor(p.x / TILE_SIZE);
            const tileY = Math.floor(p.y / TILE_SIZE);

// Outside the map bounds
            if (tileX < 0 || tileX >= MAP_WIDTH || tileY < 0 || tileY >= MAP_HEIGHT) {
                return false;
            }
            // atwallin（mapData === 0 iswall，=== 1 isfloor）
            if (!mapData[tileY] || mapData[tileY][tileX] !== 1) {
                return false;
            }
        }
        return true;
    },

// Find a safe revive position
    findSafePosition(deathX, deathY) {
// Find the nearest enemy
        let nearestEnemy = null;
        let nearestDist = Infinity;

        for (const e of enemies) {
            if (e.hp > 0) {
                const dist = Math.hypot(e.x - deathX, e.y - deathY);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestEnemy = e;
                }
            }
        }

// Compute the away-from-enemy direction (random if no enemies)
        const awayAngle = nearestEnemy
            ? Math.atan2(deathY - nearestEnemy.y, deathX - nearestEnemy.x)
            : Math.random() * Math.PI * 2;

// Try several directions and distances for a safe spot
        const distances = [this.REVIVE_SAFE_DISTANCE, 250, 200, 150, 100];
        const angleOffsets = [0, Math.PI / 6, -Math.PI / 6, Math.PI / 3, -Math.PI / 3,
            Math.PI / 2, -Math.PI / 2, Math.PI * 2 / 3, -Math.PI * 2 / 3,
            Math.PI * 5 / 6, -Math.PI * 5 / 6, Math.PI];

        for (const dist of distances) {
            for (const offsetAngle of angleOffsets) {
                const angle = awayAngle + offsetAngle;
                const testX = deathX + Math.cos(angle) * dist;
                const testY = deathY + Math.sin(angle) * dist;

                if (this.isPositionSafe(testX, testY)) {
                    return { x: testX, y: testY };
                }
            }
        }

// If still nothing, do a denser spiral search
        for (let r = 80; r <= 500; r += 40) {
            for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
                const testX = deathX + Math.cos(a) * r;
                const testY = deathY + Math.sin(a) * r;

                if (this.isPositionSafe(testX, testY)) {
                    return { x: testX, y: testY };
                }
            }
        }

// Last attempt: use the dungeon entrance position
        if (typeof dungeonEntrance !== 'undefined' && dungeonEntrance) {
            const entranceX = dungeonEntrance.x * TILE_SIZE + TILE_SIZE / 2;
            const entranceY = dungeonEntrance.y * TILE_SIZE + TILE_SIZE / 2;
            if (this.isPositionSafe(entranceX, entranceY)) {
                return { x: entranceX, y: entranceY };
            }
        }

// As a last resort, return the death position (extreme case)
        console.warn('DeathPanel: no safe revive spot found, reviving in place');
        return { x: deathX, y: deathY };
    },

    // reviveVFX
    playReviveEffect() {
        // Play SFX
        AudioSys.play('levelup');

// Create revive light particles
        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2;
            const speed = 100 + Math.random() * 100;
            particles.push({
                x: player.x,
                y: player.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 50,
                life: 1,
                maxLife: 1,
                color: '#ffdd44',
                size: 4 + Math.random() * 3
            });
        }

        // Createfloating text
        createFloatingText(player.x, player.y - 50, 'Revived!', '#ffdd44', 2);
    }
};

// claimoffline rewards（UIcall）
function claimOfflineRewards() {
    OfflineRewards.claimAndClose();
}

// Check offline rewards (called at game startup)
function checkOfflineRewards() {
// Use the offline time cached at the start of startGame() (read before enterFloor triggers a save)
    const cachedTime = _cachedOfflineTime;
    _cachedOfflineTime = null;

// Prefer the cached time (the real offline time saved when the browser closed)
    if (cachedTime) {
        player.lastOnlineTime = cachedTime;
    }

// New players or missing last-online time: initialize
    if (!player.lastOnlineTime) {
        player.lastOnlineTime = Date.now();
        player.offlineRewardsClaimed = true;
        return;
    }

    // Offline rewards use normal floors only (ignore Hell)
    const maxFloor = player.personalBest ? player.personalBest.maxFloor : (player.maxFloor || 1);
    const rewards = OfflineRewards.calculate(player.lastOnlineTime, maxFloor);

    if (rewards) {
        player.offlineRewardsClaimed = false;
// Show with a delay to avoid clashing with the daily login panel
        setTimeout(() => {
            const dailyPanel = document.getElementById('daily-login-panel');
            if (dailyPanel && dailyPanel.style.display !== 'none') {
                const checkInterval = setInterval(() => {
                    if (dailyPanel.style.display === 'none') {
                        clearInterval(checkInterval);
                        OfflineRewards.showPanel(rewards);
                    }
                }, 500);
            } else {
                OfflineRewards.showPanel(rewards);
            }
        }, 500);
    } else {
        player.offlineRewardsClaimed = true;
    }
}

// Elite affix system (with callbacks; kept in the main file)
// Elite affix system (moved to enemy-system.js)

function init() {
    resize(); window.addEventListener('resize', resize);
    initUICache();
    initDragging();
    SaveSystem.init();

// Save online time before the page closes (offline reward calc)
// Note: IndexedDB is async and may fail to write in beforeunload
// So the timestamp goes to localStorage (synchronous write, 100% reliable)
    window.addEventListener('beforeunload', () => {
// [Important] Save only after the game truly starts, to avoid overwriting saves on a homepage refresh
        if (!gameActive) return;

        const now = Date.now();
// Save the key timestamp in localStorage (synchronous, reliable)
        if (SaveSystem.currentSlot) {
            localStorage.setItem(`lastOnlineTime_slot${SaveSystem.currentSlot}`, now.toString());
        }
        // IndexedDB Saveas a backup（cancanfailure）
        player.lastOnlineTime = now;
        if (db && SaveSystem.currentSlot) {
            const clean = i => { if (!i) return null; const { el, ...r } = i; return r; };
            const eq = {}; for (let k in player.equipment) eq[k] = clean(player.equipment[k]);

            const data = {
                id: `slot_${SaveSystem.currentSlot}`,
                slotId: SaveSystem.currentSlot,
                ...player,
                inventory: player.inventory.map(clean),
                equipment: eq,
                stash: player.stash.map(clean),
                targetItem: clean(player.targetItem),
                townPortal: townPortal,
                settings: Settings,
                autoBattleSettings: AutoBattle.settings,
                lastPlayed: now,
                mapData: null,
                enemies: null,
                particles: null,
                projectiles: null,
                damageNumbers: null
            };

            const tx = db.transaction(['saveData'], 'readwrite');
            tx.objectStore('saveData').put(data);
        }
    });
}
function resize() { updateRenderViewport(); }

async function confirmResetSave() {
// Check whether a save exists
    const hasSave = cachedUI.saveStatus && cachedUI.saveStatus.innerText.includes('Save slot detected');

    let message = '⚠️ Warning: This will permanently delete all save data!\n\n';

    if (hasSave) {
// Extract save info
        const match = cachedUI.saveStatus.innerText.match(/发现存档: Lv(\d+) - (.+)/);
        if (match) {
            const level = match[1];
            const location = match[2];
            message += `Current save: Level ${level} - ${location}\n\n`;
        }
    }

    message += 'Are you sure you want to wipe all saves?\n\nThis cannot be undone!';

    const confirmed = await OnlineSystem.showConfirm(message, 'Reset Confirmation');
    if (confirmed) {
        SaveSystem.reset();
    }
}

// ========== Save selection system ==========
let pendingDeleteSlot = null;  // Slot pending deletion

// Show the save selection panel
async function showSlotSelection() {
// Defensive check: no operations while the save system isn't ready
    if (!SaveSystem.isReady) {
        console.warn('[SaveSystem] Not initialized yet, please wait...');
        return;
    }

// New-user detection: a start choice is required first
    if (typeof OnlineSystem !== 'undefined') {
        if (!OnlineSystem.nickname && typeof OnlineSystem.bootstrapLocalIdentity === 'function') {
            OnlineSystem.bootstrapLocalIdentity();
        }
        if (!OnlineSystem.nickname) {
            CloudSync.showNewUserDialog();
            return;
        }
    }

// Multi-device detection (users bound to cloud sync)
    if (typeof OnlineSystem !== 'undefined' && OnlineSystem.userId) {
        const check = await OnlineSystem.checkOtherDeviceOnline();
        if (check.online) {
            const confirmed = await OnlineSystem.showConfirm('Another device is currently playing.\n\nContinuing will kick that device. Proceed?', 'Login Notice');
            if (!confirmed) {
                return;
            }
// Take over the session
            await OnlineSystem.takeoverSession(check.recordId);
        }
    }

    const overlay = document.getElementById('slot-selection-overlay');
    const grid = document.getElementById('slot-selection-grid');

    // Render3save slot
    grid.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const slotData = window.saveSlots ? window.saveSlots[i] : null;
        const slotNum = i + 1;

        if (slotData && slotData.hasData) {
            // hassaveslot
            const floorText = slotData.maxHellFloor > 0
                ? (typeof I18N !== 'undefined' ? `${I18N.t('hell_mode')} ${slotData.maxHellFloor}` : `Hell ${slotData.maxHellFloor}F`)
                : (typeof I18N !== 'undefined' ? `${slotData.maxFloor} ${I18N.t('stat_floor')}` : `${slotData.maxFloor}F`);
            const lastPlayedText = formatLastPlayed(slotData.lastPlayed);
            const goldText = slotData.gold >= 10000 ? `${(slotData.gold / 10000).toFixed(1)}w` : slotData.gold;
            const highestLabel = typeof I18N !== 'undefined' ? I18N.t('slot_highest') : 'Best';
            const killsLabel = typeof I18N !== 'undefined' ? I18N.t('slot_kills') : 'Kills';
            const goldLabel = typeof I18N !== 'undefined' ? I18N.t('slot_gold') : 'Gold';

            grid.innerHTML += `
                <div class="slot-card" onclick="selectSlot(${slotNum})">
                    <div class="slot-card-number">#${slotNum}</div>
                    <div class="slot-card-delete" onclick="event.stopPropagation(); showDeleteConfirm(${slotNum})">✕</div>
                    <div class="slot-level">Lv.${slotData.level}</div>
                    <div class="slot-info">
                        <div class="slot-info-row">
                            <span class="slot-info-label">${highestLabel}</span>
                            <span class="slot-info-value">${floorText}</span>
                        </div>
                        <div class="slot-info-row">
                            <span class="slot-info-label">${killsLabel}</span>
                            <span class="slot-info-value">${slotData.kills}</span>
                        </div>
                        <div class="slot-info-row">
                            <span class="slot-info-label">${goldLabel}</span>
                            <span class="slot-info-value" style="color:#ffd700">${goldText}</span>
                        </div>
                    </div>
                    <div class="slot-last-played">${lastPlayedText}</div>
                </div>
            `;
        } else {
            // emptyslot
            const newCharLabel = typeof I18N !== 'undefined' ? I18N.t('new_character') : 'New Character';
            grid.innerHTML += `
                <div class="slot-card empty" onclick="selectSlot(${slotNum})">
                    <div class="slot-card-number">#${slotNum}</div>
                    <div class="slot-empty-icon">+</div>
                    <div class="slot-empty-text">${newCharLabel}</div>
                </div>
            `;
        }
    }

    overlay.classList.add('active');
}

// Hide the save selection panel
function hideSlotSelection() {
    document.getElementById('slot-selection-overlay').classList.remove('active');
}

// Format the last-played time
function formatLastPlayed(timestamp) {
    if (!timestamp) return '';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return typeof I18N !== 'undefined' ? I18N.t('just_now') : 'Just now';
    if (minutes < 60) return typeof I18N !== 'undefined' ? I18N.t('mins_ago', { m: minutes }) : `${minutes}m ago`;
    if (hours < 24) return typeof I18N !== 'undefined' ? I18N.t('hours_ago', { h: hours }) : `${hours}h ago`;
    if (days < 7) return typeof I18N !== 'undefined' ? I18N.t('days_ago', { d: days }) : `${days}d ago`;
    const localeStr = (typeof I18N !== 'undefined' && I18N.currentLang === 'es') ? 'es-ES' : ((typeof I18N !== 'undefined' && I18N.currentLang === 'en') ? 'en-US' : 'zh-CN');
    return new Date(timestamp).toLocaleDateString(localeStr);
}

// selectionsave slot
async function selectSlot(slotNum) {
    if (SaveSystem.loadingSlot) return;
    SaveSystem.loadingSlot = true;
    try {
        await SaveSystem.loadSlot(slotNum);
    } catch (error) {
        showNotification(error.message || 'Failed to load save, please retry');
        return;
    } finally {
        SaveSystem.loadingSlot = false;
    }
    hideSlotSelection();

// Establish online presence on game entry (heartbeat, Realtime subscriptions)
    if (typeof OnlineSystem !== 'undefined' && OnlineSystem.nickname) {
        await OnlineSystem.startOnline();
    }

    startGame();
}

// Show the delete-confirm dialog
function showDeleteConfirm(slotNum) {
    pendingDeleteSlot = slotNum;
    document.getElementById('delete-slot-num').textContent = slotNum;
    document.getElementById('delete-confirm-btn').disabled = true;
    document.getElementById('delete-slot-confirm').classList.add('active');

    const kw = typeof I18N !== 'undefined' ? I18N.tOr('delete_slot_keyword', 'Delete') : 'Delete';
    const promptElem = document.getElementById('delete-confirm-prompt');
    if (promptElem && typeof I18N !== 'undefined') {
        promptElem.textContent = I18N.t('delete_prompt', { kw });
    }
    const input = document.getElementById('delete-confirm-input');
    input.value = '';
    input.placeholder = kw;

    const validWords = ['Delete', 'delete', 'eliminar'];
    input.oninput = () => {
        const val = input.value.trim().toLowerCase();
        document.getElementById('delete-confirm-btn').disabled = !validWords.includes(val);
    };
    input.focus();
}

// Hide the delete-confirm dialog
function hideDeleteConfirm() {
    document.getElementById('delete-slot-confirm').classList.remove('active');
    pendingDeleteSlot = null;
}

// Confirm save deletion
async function confirmDeleteSlot() {
    if (!pendingDeleteSlot) return;
    const input = document.getElementById('delete-confirm-input');
    const validWords = ['Delete', 'delete', 'eliminar'];
    if (!validWords.includes(input.value.trim().toLowerCase())) return;

    await SaveSystem.deleteSlot(pendingDeleteSlot);
    hideDeleteConfirm();

// Refresh the save list
    SaveSystem.loadAllSlotsMeta();
    setTimeout(() => showSlotSelection(), 100);
}

// For saving the offline timestamp (read before enterFloor calls save)
let _cachedOfflineTime = null;

function startGame() {
// Before any SaveSystem.save() call, read the offline time from localStorage
    const localStorageKey = `lastOnlineTime_slot${SaveSystem.currentSlot}`;
    const localStorageTime = localStorage.getItem(localStorageKey);
    if (localStorageTime) {
        _cachedOfflineTime = parseInt(localStorageTime);
    }

    AudioSys.init();
    // Start BGM (requires user interaction)
    // Small delay so the audio context fully initializes
    setTimeout(() => {
        AudioSys.startBGM();
    }, 100);
    document.getElementById('start-screen').style.display = 'none';
    if (window.pendingLoadData) {
        Object.assign(player, window.pendingLoadData);
        if (!player.equipment.helm) player.equipment.helm = null;
        if (!player.equipment.gloves) player.equipment.gloves = null;
        if (!player.equipment.boots) player.equipment.boots = null;
        if (!player.equipment.belt) player.equipment.belt = null;
        if (!player.equipment.amulet) player.equipment.amulet = null;

        if (!player.skills) player.skills = { fireball: 1, thunder: 0, multishot: 0 };

// Back-compat: skill tree system migration
        if (!player.skillTree) {
// Migrate legacy skills into the skill tree
            player.skillTree = createDefaultSkillTree(player.skills);
// Refund excess points
            const oldTotal = (player.skills.fireball || 0) + (player.skills.thunder || 0) + (player.skills.multishot || 0);
            const newTotal = player.skillTree.fireball.stage1 + player.skillTree.thunder.stage1 + player.skillTree.multishot.stage1;
            const refund = oldTotal - newTotal;
            if (refund > 0) {
                player.skillPoints += refund;
                console.log(`[Skill tree migration] refunded ${refund} skill point(s)`);
            }
        } else {
// Ensure the skill tree structure is complete
            ensurePlayerSkillTree();
        }

        // back-compat:setsystem
        if (!player.equippedSets) player.equippedSets = {};
        if (!player.discoveredSetPieces) player.discoveredSetPieces = {};
        if (!player.discoveredMonsters) player.discoveredMonsters = {};

// Back-compat: auto-pickup settings
        if (!player.autoPickup) {
            player.autoPickup = { gold: true, potion: true, scroll: true };
        }

// Back-compat: graphics settings
        if (!player.graphicsQuality) {
            player.graphicsQuality = 'high';
        }
        document.body.classList.toggle('high-quality', player.graphicsQuality === 'high');

        if (player.died === undefined) player.died = false; // Init the death flag

        if (!player.achievements) player.achievements = {}; // Init achievement fields

// Back-compat: legacy saves lack the hire-cost reminder flag
        if (player.autoBattleFeeNotified === undefined) player.autoBattleFeeNotified = false;

        // back-compat:Title system
        if (!player.currentTitle) player.currentTitle = 'none';
        if (!player.ownedTitles || !Array.isArray(player.ownedTitles)) player.ownedTitles = ['none'];

        // Back-compat: old saves lack Hell fields, or have them false
        if (player.defeatedBaal === undefined || (player.defeatedBaal === false && window.pendingLoadData)) {
            // Condition: all quests done, reached floor 10, or the related achievement
            const hasCompletedAllQuests = (player.questIndex !== undefined && player.questIndex >= QUEST_DB.length);
            const hasReachedFloor10 = (player.floor >= 10);
            const hasKillBossAchievement = (player.achievements && player.achievements.kill_boss_5 && player.achievements.kill_boss_5.progress >= 5);

            console.log('[Hell Mode] backward-compat check:', {
                questIndex: player.questIndex,
                floor: player.floor,
                hasKillBoss: hasKillBossAchievement,
                questDBLength: QUEST_DB.length,
                defeatedBaal: player.defeatedBaal
            });

            if (hasCompletedAllQuests || hasReachedFloor10 || hasKillBossAchievement) {
                player.defeatedBaal = true;
                console.log('[Hell Mode] backward-compat: completion detected, Hell mode auto-unlocked');
            } else if (player.defeatedBaal === undefined) {
                player.defeatedBaal = false;
            }
        }

        // Back-compat: if Baal was defeated but the achievement is pending, complete it
        if (player.defeatedBaal && player.achievements && player.achievements['kill_baal'] && !player.achievements['kill_baal'].completed) {
            player.achievements['kill_baal'].progress = 1;
            player.achievements['kill_baal'].completed = true;
            console.log('[Achievement fix] Baal defeated detected, "World Savior" achievement auto-completed');
        }

// Init the achievement data structure
        initAchievements();

        if (player.questIndex === undefined) {
            player.questIndex = 0; player.questState = 0; player.questProgress = 0;
            if (player.quests && player.quests.q2 === 2) player.questIndex = QUEST_DB.length;
        }
        // Cleanup legacy
        if (player.quests) delete player.quests;

// Make sure the thunder skill is initialized
        if (player.skills.thunder === undefined || isNaN(player.skills.thunder)) {
            player.skills.thunder = 0;
        }
        if (player.skillCooldowns.thunder === undefined) {
            player.skillCooldowns.thunder = 0;
        }

// Load the stash expansion level
        player.stashLevel = window.pendingLoadData.stashLevel || 0;

// Load stash data, resizing by the expansion level
        const expectedSize = STASH_BASE_SIZE + player.stashLevel * STASH_EXPAND_PER_LEVEL;
        if (window.pendingLoadData.stash) {
// If the save has the legacy 60 slots, truncate to the current expected size
            if (window.pendingLoadData.stash.length === 60) {
                player.stash = window.pendingLoadData.stash.slice(0, expectedSize);
            } else {
                player.stash = window.pendingLoadData.stash;
            }
// Ensure the array size is correct
            while (player.stash.length < expectedSize) {
                player.stash.push(null);
            }
        } else if (!player.stash) {
            player.stash = Array(expectedSize).fill(null);
        }

        if (window.pendingLoadData.townPortal) {
            townPortal = window.pendingLoadData.townPortal;
// Fix: force-validate the portal position on save load, fixing legacy saves stuck in walls
            if (townPortal) {
                const fixed = validateAndFixPortalPosition(townPortal.x, townPortal.y);
                townPortal.x = fixed.x;
                townPortal.y = fixed.y;
            }
        }
        if (window.pendingLoadData.autoBattleSettings) {
            Object.assign(AutoBattle.settings, window.pendingLoadData.autoBattleSettings);
            syncAutoBattleUI();
        }
        if (!Array.isArray(player.activatedWaypoints) || player.activatedWaypoints.length === 0) {
            player.activatedWaypoints = [0];
        } else if (!player.activatedWaypoints.includes(0)) {
            player.activatedWaypoints.unshift(0);
        }
        if (isNaN(player.xp)) player.xp = 0;
        if (isNaN(player.xpNext) || player.xpNext <= 0) player.xpNext = 100 * Math.pow(1.38, player.lvl - 1);
// v4.8 save migration: fix the legacy 1.5x XP requirement being too high while keeping progress ratio
        const expectedXpNext = Math.floor(100 * Math.pow(1.38, player.lvl - 1));
        if (player.xpNext > expectedXpNext * 1.5) {
            const progress = player.xp / player.xpNext;  // Save the current progress ratio
            console.log(`[Save migration] xpNext fixed from ${player.xpNext} to ${expectedXpNext}, progress ${(progress * 100).toFixed(1)}%`);
            player.xpNext = expectedXpNext;
            player.xp = Math.floor(expectedXpNext * progress);  // Scale xp by the ratio
        }
// Back-compat: legacy saves lack maxFloor/lastFloor
        if (player.maxFloor === undefined) player.maxFloor = player.floor || 0;
        if (player.lastFloor === undefined) player.lastFloor = player.floor || 0;
// Back-compat: legacy saves lack drop-system luck
        if (player.luckAccumulator === undefined) player.luckAccumulator = 0;
        if (player.killsSincePotion === undefined) player.killsSincePotion = 0;

// Back-compat: legacy saves lack the talent system
        if (!player.talents) player.talents = [];
        if (!player.talentShop) player.talentShop = [];
        if (player.phoenixUsed === undefined) player.phoenixUsed = false;
        if (player.highestTalentFloor === undefined) player.highestTalentFloor = 0;
        if (player.highestHellTalentFloor === undefined) player.highestHellTalentFloor = 0;
        if (player.talentRefreshCount === undefined) player.talentRefreshCount = 0;

// Back-compat: legacy saves lack the Divine Blessing system
        if (!player.divineBlessing) player.divineBlessing = { pending: 0, obtained: [] };
        if (player.lastBlessingLevel === undefined) player.lastBlessingLevel = Math.floor(player.lvl / 5) * 5;

// Back-compat: legacy saves lack the daily login system
        if (!player.dailyLogin) player.dailyLogin = { lastLoginDate: null, consecutiveDays: 0, claimedToday: false };

// Back-compat: legacy saves lack stats and personal bests v4.9
        if (!player.stats) {
            player.stats = {
                totalGold: 0, uniqueFound: 0, setFound: 0,
                bossKills: 0, eliteKills: 0, maxKillStreak: 0, currentStreak: 0
            };
        }
        if (!player.personalBest) {
            player.personalBest = {
                maxLevel: player.lvl || 1,
                maxFloor: player.maxFloor || player.floor || 0,
                maxHellFloor: player.hellFloor || 0,
                maxKills: player.kills || 0,
                maxGold: player.gold || 0,
                fastestBaal: null
            };
        }

// Back-compat: legacy saves lack the tutorial; mark veterans as complete
        if (!player.tutorial) {
            player.tutorial = { completed: true, step: 5 };
        }

// Back-compat: legacy saves lack the offline reward system
        if (player.lastOnlineTime === undefined) player.lastOnlineTime = null;
        if (player.offlineRewardsClaimed === undefined) player.offlineRewardsClaimed = true;

// ========== Stat system migration v3.9 ==========
        // willoldbase attributes(str/dex/vit/ene)convert todirect-effect stats
        migrateItemStats();

        // ========== Legacy name migration (zh -> EN) ==========
        migrateLegacyNames();

// Scan the player's set items to fill discoveredSetPieces
// New player starting gear
        migrateSetCollection();
    }
    else {
// Force white
        const starterSword = createItem('Short Sword', 0);
        starterSword.rarity = 1;  // Remove requirement limits
        starterSword.requirements = null;  // 1. Weapon
        addItemToInventory(starterSword);  // 1. weapon
        addItemToInventory(createItem('Health Potion', 0));  // 2. one red potion
        addItemToInventory(createItem('Mana Potion', 0));  // 3. blue potion 1
        addItemToInventory(createItem('Mana Potion', 0));  // 4. blue potion 2
        addItemToInventory(createItem('Mana Potion', 0));  // 5. blue potion 3
        addItemToInventory(createItem('Town Portal Scroll', 0));  // 6. town portal
        player.floor = 0;

// Sync the auto-pickup checkbox states
        player.died = false;
        player.achievements = {};
        initAchievements();
        player.skillTree = createDefaultSkillTree(player.skills);
    }

// Sync the graphics quality select state
    document.getElementById('chk-auto-gold').checked = player.autoPickup.gold;
    document.getElementById('chk-auto-potion').checked = player.autoPickup.potion;
    document.getElementById('chk-auto-scroll').checked = player.autoPickup.scroll;

// Death state recovery: if saved while dead (refreshed before choosing), auto-return to town
    document.getElementById('select-graphics-quality').value = player.graphicsQuality || 'high';
    if (typeof Elemental3D !== 'undefined' && player.graphicsQuality !== 'low') Elemental3D.prepare();

// Remove any leftover grayscale filter
    if (player.isDead) {
        console.log('[Save load] death state detected, auto-recalled to town');
        player.isDead = false;
        player.deathTimer = 0;
        player.floor = 0;
        player.isInHell = false;
        player.hp = player.maxHp;
        player.mp = player.maxMp;
// Update the talent HUD display
        document.getElementById('game-container').classList.remove('dead-filter');
    }

    updateStats(); enterFloor(player.floor, 'start'); renderInventory(); updateStatsUI(); updateSkillsUI(); updateUI(); updateBeltUI(); updateQuestUI(); updateMenuIndicators();
    updateTalentHUD(); // UpdatetalentHUDShow
    updateDivineBlessingHUD(); // Check the daily login reward
    checkDailyLogin(); // Checkperday loginrewards
    checkOfflineRewards(); // Checkoffline rewards
    checkTutorial(); // Init the daily quest system
    // InitDaily quest system
    if (typeof DailyQuestSystem !== 'undefined') {
        DailyQuestSystem.checkAndReset();
    }
    updateQuestTracker(); // Check the returning-hero bundle and season journey goals
    // Check the returning-hero bundle and season journey goals
    if (typeof ReturnBonus !== 'undefined') {
        ReturnBonus.checkOnLogin();
    }
    if (typeof SeasonSystem !== 'undefined') {
        SeasonSystem.checkMilestonesAutoNotify();
    }
    gameActive = true; gameLoop(0); spawnEnemyTimer();
}

// Revised enterFloor with spawn point logic
function enterFloor(f, spawnAt = 'start') {
    SkillBranchSystem.reset();
// Update a different floor display depending on Hell
    player.rageBonus = 0;
// Update the max floor record (normal dungeon only; Hell doesn't count)
    if (player.isInHell) {
        player.hellFloor = f;
    } else {
        player.floor = f;
// Update personal best records
        if (f > player.maxFloor) {
            player.maxFloor = f;
        }
    }

// Submit to the leaderboard (updated on entering a new floor)
    updatePersonalBest();

// Recycle all objects into the pools
    if (typeof OnlineSystem !== 'undefined') {
        OnlineSystem.submitScore({
            level: player.lvl,
            kills: player.kills,
            maxFloor: player.isInHell ? (player.maxHellFloor || player.hellFloor) + 10 : player.maxFloor,
            isHell: player.isInHell,
            gold: player.gold || 0
        });
    }

// Clear destructible objects
    enemies.forEach(e => EnemyPool.release(e));
    projectiles.forEach(p => ProjectilePool.release(p));
    flyingPickups.forEach(f => FlyingPickupPool.release(f));
    enemies = []; groundItems = []; projectiles = []; npcs = []; flyingPickups = [];
    enemySpawnCandidates = [];
    vfxEffects = [];
    destructibles = []; // A new map invalidates enemies, drops, paths and LOS caches.
    dungeonRoomFeatures = [];
    scenicProps = [];
    dungeonLightSources = [];

// Achievement tracking: floor reached
    AutoBattle.resetRuntimeState('enterFloor');

// Fix: force-clear ground item labels on floor switch or revive
    trackAchievement('reach_floor', { floor: f });

// Reset Hell state when entering town
    document.getElementById('world-labels').innerHTML = '';

    if (f === 0) {
        // when entering town，reset Hell state
        if (player.isInHell) {
            player.isInHell = false;
        }

// Always add the abyss warden (patrol mode: roams the camp)
        resetTalents();

        document.getElementById('floor-display').innerText = "Rogue Encampment";
        generateTown();
        npcs.push({ x: dungeonEntrance.x - 100, y: dungeonEntrance.y - 100, name: "Gheed the Merchant", type: "merchant", spriteSheet: 'public/spritesheets/Npc-00.webp', headSheet: 'public/players/Jobs/hair01_head_spritesheet.png', radius: 20, frameIndex: 1, behavior: 'gaze', defaultDir: 'front' });
        npcs.push({ x: dungeonEntrance.x + 100, y: dungeonEntrance.y - 50, name: "Akara", type: "healer", spriteSheet: 'public/spritesheets/Npc-01.webp', headSheet: 'public/players/Jobs/hair06_head_spritesheet.png', radius: 20, quest: 'q1', frameIndex: 2, behavior: 'gaze', defaultDir: 'front' });
        npcs.push({ x: dungeonEntrance.x, y: dungeonEntrance.y + 100, name: "Warriv (Stash)", type: "stash", spriteSheet: 'public/spritesheets/Npc-02.webp', headSheet: 'public/players/Jobs/hair02_head_spritesheet.png', radius: 20, frameIndex: 0, behavior: 'gaze', defaultDir: 'front' });
        npcs.push({ x: dungeonEntrance.x + 80, y: dungeonEntrance.y + 80, name: "Charsi the Smith", type: "blacksmith", spriteSheet: 'public/spritesheets/Npc-03.webp', headSheet: 'public/players/Jobs/hair03_head_spritesheet.png', radius: 20, frameIndex: 5, behavior: 'gaze', defaultDir: 'left' });

// Stat-resetter - mysterious sage (patrol mode: wanders east of town)
        npcs.push({
            x: dungeonEntrance.x - 150, y: dungeonEntrance.y + 50,
            name: "Abyss Guardian", type: "difficulty", spriteSheet: 'public/spritesheets/Npc-04.webp', headSheet: 'public/players/Jobs/hair04_head_spritesheet.png', radius: 20, frameIndex: 3,
            behavior: 'patrol',
            patrolPath: [
                { x: dungeonEntrance.x - 150, y: dungeonEntrance.y + 50 },
                { x: dungeonEntrance.x - 150, y: dungeonEntrance.y - 120 },
                { x: dungeonEntrance.x + 120, y: dungeonEntrance.y - 120 },
                { x: dungeonEntrance.x + 120, y: dungeonEntrance.y + 50 }
            ],
            patrolIndex: 0,
            speed: 35
        });

// Init the market stall system
        npcs.push({
            x: dungeonEntrance.x + 150, y: dungeonEntrance.y + 50,
            name: "Mysterious Sage", type: "respec", spriteSheet: 'public/spritesheets/Npc-05.webp', headSheet: 'public/players/Jobs/hair05_head_spritesheet.png', radius: 20, frameIndex: 4,
            behavior: 'patrol',
            patrolPath: [
                { x: dungeonEntrance.x + 150, y: dungeonEntrance.y + 50 },
                { x: dungeonEntrance.x + 150, y: dungeonEntrance.y + 180 },
                { x: dungeonEntrance.x + 20, y: dungeonEntrance.y + 180 },
                { x: dungeonEntrance.x + 20, y: dungeonEntrance.y + 50 }
            ],
            patrolIndex: 0,
            speed: 28
        });

        showNotification("Welcome back to Rogue Encampment");

        // Init market stall system
        if (typeof MarketSystem !== 'undefined') {
            MarketSystem.init();
        }

        // ==== Boss refreshCheck ==== //
        // Town could host boss siege events (optional); for now config check only
        const bossInfo = getBossSpawnInfo(f);
        if (bossInfo) {
            const now = Date.now();
            const nextRespawn = player.bossRespawn[f] || 0;
            if (now >= nextRespawn) {
// The original logic checked floorBossMap[f] with f=0
                // Original logic checked floorBossMap[f] with f=0
                // The block below only really matters for f > 0; kept as-is
            }
        }

        // Make sure BGM is playing back in town
        AudioSys.resumeBGM();

// Update the Hell indicator (hidden while in town)
        if (spawnAt === 'portal' && townPortal) {
            const safePortalPos = validateAndFixPortalPosition(townPortal.x, townPortal.y);
            townPortal.x = safePortalPos.x;
            townPortal.y = safePortalPos.y;
        }

        if (spawnAt === 'end') { player.x = dungeonExit.x; player.y = dungeonExit.y + 40; }
        else if (spawnAt === 'portal') { if (townPortal) { player.x = townPortal.x; player.y = townPortal.y + 40; } else { player.x = dungeonEntrance.x; player.y = dungeonEntrance.y; } }
        else if (spawnAt === 'waypoint') { player.x = townWaypointSpot.x; player.y = townWaypointSpot.y + 35; }
        else { player.x = dungeonEntrance.x; player.y = dungeonEntrance.y; }

// Show a different floor name depending on Hell
        updateHellIndicator();
    } else {
// Get the current difficulty factor (always 'hell' in Hell)
        const isInHell = player.isInHell || false;
        const displayFloor = isInHell ? player.hellFloor : f;
        const floorName = getFloorName(displayFloor, isInHell);
        document.getElementById('floor-display').innerText = `${displayFloor}F ${floorName}`;

        generateDungeon();

// Monster count grows with floors: low floors still need density for auto battle farming
        const difficulty = isInHell ? DIFFICULTY_MODIFIERS.hell : DIFFICULTY_MODIFIERS.normal;

// Build the monster pool for the current floor
        const enemyScale = Math.min(1, 0.65 + f * 0.05);
        const enemyCount = Math.floor(GAME_CONFIG.INITIAL_ENEMIES * enemyScale);
        for (let i = 0; i < enemyCount; i++) {
            let x, y, v = false; while (!v) { x = Math.random() * MAP_WIDTH * TILE_SIZE; y = Math.random() * MAP_HEIGHT * TILE_SIZE; if (!isWall(x, y) && Math.hypot(x - dungeonEntrance.x, y - dungeonEntrance.y) > 300) v = true; }

// Pick a monster by weight
            const monsterPool = [
                { type: 'melee', name: 'Fallen', ai: 'chase', speed: 80, hpMult: 1, dmgMult: 1, weight: 20 }
            ];
            if (f >= 1) monsterPool.push({ type: 'zombie', name: 'Zombie', ai: 'chase', speed: 50, hpMult: 1.5, dmgMult: 0.8, weight: 20 });
            if (f >= 2) {
                monsterPool.push({ type: 'ranged', name: 'Skeleton Archer', ai: 'ranged', speed: 70, hpMult: 1, dmgMult: 1, weight: 20 });
                monsterPool.push({ type: 'skeleton', name: 'Skeleton Warrior', ai: 'chase', speed: 85, hpMult: 1, dmgMult: 1, weight: 15 });
            }
            if (f >= 3) monsterPool.push({ type: 'shaman', name: 'Fallen Shaman', ai: 'revive', speed: 60, hpMult: 1, dmgMult: 1, weight: 10 });
            if (f >= 4) monsterPool.push({ type: 'ghost', name: 'Ghost', ai: 'phase', speed: 90, hpMult: 0.6, dmgMult: 1.2, weight: 12 });
            if (f >= 5) monsterPool.push({ type: 'specter', name: 'Shock Spirit', ai: 'specter', speed: 70, hpMult: 0.8, dmgMult: 1.4, weight: 10 });
            if (f >= 6) monsterPool.push({ type: 'mummy', name: 'Mummy', ai: 'chase', speed: 55, hpMult: 1.3, dmgMult: 0.9, weight: 10 });
            if (f >= 7) monsterPool.push({ type: 'vampire', name: 'Vampirism', ai: 'vampire', speed: 60, hpMult: 1.2, dmgMult: 1.3, weight: 10 });

// Base stats
            const totalWeight = monsterPool.reduce((sum, m) => sum + m.weight, 0);
            let rand = Math.random() * totalWeight;
            let selected = monsterPool[0];
            for (const monster of monsterPool) {
                rand -= monster.weight;
                if (rand <= 0) { selected = monster; break; }
            }

            // base attributes
            let baseHp = 30 + Math.floor(f * f * 5);
            let baseDmg = 5 + f * 2;
// Fix slow leveling at 40 while preventing value blowup on very deep floors
// Floors 1-30: exponential growth
            let baseXp = f <= 30
                ? Math.floor(25 * Math.pow(1.15, f))           // Floors 31+: linear growth
                : Math.floor(1656 + (f - 30) * 100);           // Hell floors 1-30: exponential ×2

            if (isInHell) {
                baseHp = 60 + Math.floor(f * f * 10);
                baseDmg = 10 + f * 4;
                baseXp = f <= 30
                    ? Math.floor(50 * Math.pow(1.15, f))       // Hell1-30layer:exponent×2
                    : Math.floor(3312 + (f - 30) * 200);       // Hell31layer+:lineproperty×2
            }

// Endless-floor boss generation logic
            let hp = Math.floor(baseHp * difficulty.monsterHpMult * selected.hpMult);
            let dmg = Math.floor(baseDmg * difficulty.monsterDmgMult * selected.dmgMult);
            let speed = Math.floor(selected.speed * difficulty.monsterSpeedMult);
            let xpValue = Math.floor(baseXp * difficulty.xpMult);

            const isElite = Math.random() < GAME_CONFIG.ELITE_SPAWN_RATE;
            const enemy = EnemyPool.acquire({
                x, y, hp, maxHp: hp, dmg, speed, radius: 12,
                dead: false, cooldown: 0,
                name: (isElite ? "Elite" : "") + (isInHell ? "Hell" : "") + selected.name,
                rarity: isElite ? 1 : 0, xpValue: xpValue,
                ai: selected.ai,
                monsterType: selected.type,
                frameIndex: MONSTER_FRAMES[selected.type],
                eliteAffixes: [],
                isElite: isElite
            });

            applyMonsterBaseTraits(enemy, selected.type, dmg);
            if (isElite) {
                enemy.eliteAffixes = rollEliteAffixesForEnemy(enemy);
                applyEliteAffixesToEnemy(enemy);
            }

            enemies.push(enemy);
        }
// Check whether this floor's boss is on respawn cooldown
        const bossData = getBossSpawnInfo(f);
// Quest target, or simply this floor's boss
        const now = Date.now();
        const nextRespawn = player.bossRespawn[f] || 0;
        const bossCanSpawn = now >= nextRespawn;

        if (bossData && bossCanSpawn) {
            const currentQ = getCurrentQuest();
            const isQuestTarget = currentQ && player.questState === 1 && currentQ.floor === f;

            // Quest target, or simply this floor boss
            let x = dungeonExit.x, y = dungeonExit.y;
            if (bossArena) {
                x = bossArena.bossSpawnX;
                y = bossArena.bossSpawnY;
            } else if ((f % 5) !== 0) {
                // Fall back to random open ground only without arena info
                let v = false;
                while (!v) {
                    x = Math.random() * MAP_WIDTH * TILE_SIZE;
                    y = Math.random() * MAP_HEIGHT * TILE_SIZE;
                    if (!isWall(x, y)) v = true;
                }
            }

            // Apply difficulty modifiers
            let hp = Math.floor(bossData.hp * difficulty.monsterHpMult);
            let dmg = Math.floor(bossData.dmg * difficulty.monsterDmgMult);
            let speed = Math.floor(bossData.speed * difficulty.monsterSpeedMult);
            let xpValue = Math.floor(bossData.xp * difficulty.xpMult);

            // In Hell mode stats scale further (stacked on difficulty)
            if (isInHell) {
                hp = Math.floor(hp * 1.5);
                dmg = Math.floor(dmg * 1.2);
                xpValue = Math.floor(xpValue * 1.5);
            }

            // Get Boss presetconfig
            const bossPreset = BOSS_AFFIX_PRESETS[bossData.originalName] || { ai: 'chase', affixes: [], bossTraits: {} };

// Nightmare+ rolls one extra affix
            const bossAffixes = bossPreset.affixes.map(affixId =>
                ELITE_AFFIXES.find(a => a.id === affixId)
            ).filter(Boolean);

            // Nightmare+ rolls one extra affix
            if (bossData.cycle >= 1) {
                const extraAffix = ELITE_AFFIXES[Math.floor(Math.random() * ELITE_AFFIXES.length)];
                if (!bossAffixes.find(a => a.id === extraAffix.id)) {
                    bossAffixes.push(extraAffix);
                }
            }

            const bossEnemy = EnemyPool.acquire({
                x, y, hp, maxHp: hp, dmg, speed, radius: 30,
                dead: false, cooldown: 0, name: bossData.name,
                isBoss: true,
                isQuestTarget: isQuestTarget,
                xpValue: xpValue,
                ai: bossPreset.ai,  // usepreset AI
                frameIndex: getBossFrameIndex(bossData.originalName),
                eliteAffixes: bossAffixes,
                // Boss special traits
                bossTraits: { ...bossPreset.bossTraits },
                bossCooldowns: {},  // skill cooldowntimer
                enraged: false      // enraged flag
            });

            // Apply boss special traits
            applyBossTraits(bossEnemy, bossData.originalName, dmg);
            applyEliteAffixesToEnemy(bossEnemy);

            enemies.push(bossEnemy);

            const noticeText = isQuestTarget ? `Warning: ${bossData.name} detected!` : `A mighty foe approaches: ${bossData.name}!`;
            showNotification(noticeText);
        }
        showNotification(`Entering Floor ${f}`);

// Validate the dungeon floor's portal position (when teleported from town)
        AudioSys.resumeBGM();

// Free talent 3-pick-1 (every 5-floor milestone)
        if (spawnAt === 'portal' && townPortal) {
            const safeDungeonPos = validateAndFixDungeonPortalPosition(townPortal.x, townPortal.y);
            townPortal.x = safeDungeonPos.x;
            townPortal.y = safeDungeonPos.y;
        }

        if (spawnAt === 'end') { player.x = dungeonExit.x; player.y = dungeonExit.y; }
        else if (spawnAt === 'portal') { if (townPortal) { player.x = townPortal.x; player.y = townPortal.y; } else { player.x = dungeonEntrance.x; player.y = dungeonEntrance.y; } }
        else if (spawnAt === 'waypoint') { if (currentWaypoint) { player.x = currentWaypoint.x; player.y = currentWaypoint.y + 35; } else { player.x = dungeonEntrance.x; player.y = dungeonEntrance.y; } }
        else { player.x = dungeonEntrance.x; player.y = dungeonEntrance.y; }
    }
    player.targetX = null; updateQuestTracker(); SaveSystem.save();

    // freetalent 3 pick 1 (per 5 layerinprocessmonument)
    if (f > 0 && typeof TalentDraftSystem !== 'undefined') {
        TalentDraftSystem.checkFloorMilestone(f);
    }

    // weekly goal:floors reached
    if (f > 0 && typeof WeeklyGoalSystem !== 'undefined') {
        WeeklyGoalSystem.onFloorReached(f);
    }

// Generate the map cache (offscreen canvas optimization)
    if (typeof AbyssSystem !== 'undefined' && AbyssSystem.renderHUD) {
        AbyssSystem.renderHUD();
    }

// Reset the minimap cache
    generateMapCache();
    ArtSamples.ensureMonsters([...new Set(enemies.filter(e=>!e.dead).map(getEnemyMonsterType))])
        .catch(error=>showNotification(`Area art load failed: ${error.message}`));
}

function generateTown() {
    mapData = []; visitedMap = [];
    dungeonRoomFeatures = [];
    bossArena = null;
    scenicProps = [];
    dungeonLightSources = [];
    _minimapDirty = true; _minimapCache = null;  // Resetsmallmap cache
    for (let y = 0; y < MAP_HEIGHT; y++) { mapData.push(new Array(MAP_WIDTH).fill(0)); visitedMap.push(new Array(MAP_WIDTH).fill(true)); }
    const cx = Math.floor(MAP_WIDTH / 2), cy = Math.floor(MAP_HEIGHT / 2);
    const r = 10;           // market district extension in tiles to the right
    const marketExtend = 8; // market district extension in tiles to the right

// Generate market district (right-side ellipse extension)
    for (let y = cy - r; y <= cy + r; y++) {
        for (let x = cx - r; x <= cx + r; x++) {
            if (Math.hypot(x - cx, y - cy) < r) mapData[y][x] = 1;
        }
    }

    // Generate market district (right-side ellipse extension)
    const marketCx = cx + r - 2;  // market center shifted right
    const marketRx = marketExtend; // Vertical radius (slightly smaller than the main area)
    const marketRy = r - 2;        // Ellipse test
    for (let y = cy - marketRy; y <= cy + marketRy; y++) {
        for (let x = marketCx; x <= marketCx + marketRx; x++) {
// Fixed portal position: right of the dungeon entrance
            const dx = (x - marketCx) / marketRx;
            const dy = (y - cy) / marketRy;
            if (dx * dx + dy * dy < 1) mapData[y][x] = 1;
        }
    }

    dungeonEntrance = { x: cx * TILE_SIZE, y: cy * TILE_SIZE };
    dungeonExit = { x: cx * TILE_SIZE, y: (cy - r + 2) * TILE_SIZE };
// Fixed waypoint position: left of the dungeon entrance
    townPortalSpot = { x: dungeonExit.x + 80, y: dungeonExit.y };
// Validate and correct the portal position to stay inside the town's valid area
    townWaypointSpot = { x: dungeonExit.x - 90, y: dungeonExit.y };
    currentWaypoint = { x: townWaypointSpot.x, y: townWaypointSpot.y, floor: 0 };
    seedTownScenicProps(cx, cy, r, marketCx, marketRx, marketRy);
}

// Town facilities revolve around serving characters; central plaza, exit path and portal stay clear.
function getTownTileZone(c, r) {
    const cx = Math.floor(MAP_WIDTH / 2), cy = Math.floor(MAP_HEIGHT / 2);
    if (Math.hypot(c - cx, r - cy) <= 4.2) return 'plaza';
    if (Math.abs(c - cx) <= 2 && r >= cy - 10 && r <= cy + 4) return 'path';
    if (c >= cx + 6 && Math.abs(r - cy) <= 7) return 'market';
    return 'camp';
}

function drawTownFloorDetails(ctx, x, y, c, r) {
    const zone = getTownTileZone(c, r);
    const seed = r * 4099 + c * 131;
    const n = mapTileNoise(seed);

    ctx.save();
    if (zone === 'path') {
        ctx.fillStyle = 'rgba(92, 70, 48, 0.30)';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        if (r % 2 === 0) {
            ctx.strokeStyle = 'rgba(145, 115, 78, 0.16)';
            ctx.beginPath();
            ctx.moveTo(x + 5, y + TILE_SIZE - 5);
            ctx.lineTo(x + TILE_SIZE - 5, y + TILE_SIZE - 5);
            ctx.stroke();
        }
    } else if (zone === 'plaza') {
        ctx.fillStyle = 'rgba(86, 74, 56, 0.28)';
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        ctx.strokeStyle = 'rgba(170, 145, 95, 0.14)';
        ctx.strokeRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
    } else if (zone === 'market') {
        ctx.fillStyle = 'rgba(82, 58, 38, 0.22)';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = 'rgba(170, 115, 70, 0.16)';
        ctx.beginPath();
        ctx.moveTo(x + 6, y + 8 + (c % 2) * 6);
        ctx.lineTo(x + TILE_SIZE - 6, y + 8 + (c % 2) * 6);
        ctx.stroke();
    } else {
        ctx.fillStyle = 'rgba(28, 58, 26, 0.20)';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    }

    if (n > 0.78) {
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = zone === 'camp' ? 'rgba(72, 118, 58, 0.55)' : 'rgba(40, 28, 18, 0.55)';
        ctx.beginPath();
        ctx.ellipse(x + 8 + mapTileNoise(seed + 1) * 24, y + 10 + mapTileNoise(seed + 2) * 20, 5 + mapTileNoise(seed + 3) * 8, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    if (!hasFloorAtTile(c, r - 1)) {
        const grad = ctx.createLinearGradient(0, y, 0, y + TILE_SIZE * 0.65);
        grad.addColorStop(0, 'rgba(0,0,0,0.28)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE * 0.65);
    }
    ctx.restore();
}

function drawTownWallDetails(ctx, x, y, c, r) {
    if (!isWallBoundaryTile(c, r)) return;
    const floorS = hasFloorAtTile(c, r + 1);
    const floorN = hasFloorAtTile(c, r - 1);
    const floorW = hasFloorAtTile(c - 1, r);
    const floorE = hasFloorAtTile(c + 1, r);

    ctx.save();
    ctx.fillStyle = 'rgba(20, 42, 18, 0.24)';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    if (floorS) {
        const face = ctx.createLinearGradient(0, y + 4, 0, y + TILE_SIZE);
        face.addColorStop(0, 'rgba(74, 96, 55, 0.18)');
        face.addColorStop(1, 'rgba(0,0,0,0.38)');
        ctx.fillStyle = face;
        ctx.fillRect(x, y + 4, TILE_SIZE, TILE_SIZE - 4);
        ctx.strokeStyle = 'rgba(155, 190, 112, 0.18)';
        ctx.beginPath();
        ctx.moveTo(x + 3, y + TILE_SIZE - 9);
        ctx.lineTo(x + TILE_SIZE - 3, y + TILE_SIZE - 9);
        ctx.stroke();
    }
    if (floorN) {
        ctx.fillStyle = 'rgba(0,0,0,0.24)';
        ctx.fillRect(x, y, TILE_SIZE, 6);
    }
    if (floorW || floorE) {
        ctx.fillStyle = 'rgba(0,0,0,0.20)';
        if (floorW) ctx.fillRect(x, y, 7, TILE_SIZE);
        if (floorE) ctx.fillRect(x + TILE_SIZE - 7, y, 7, TILE_SIZE);
    }
    ctx.restore();
}

function seedTownScenicProps(cx, cy, r, marketCx, marketRx, marketRy) {
    scenicProps = [];
    dungeonLightSources = [];

    const townDefs = {
        barrel: { name: 'town_barrel', row: 6, col: 0, scale: 0.48, tall: true },
        crate: { name: 'town_crate', row: 6, col: 2, scale: 0.50, tall: true },
        urn: { name: 'town_urn', row: 6, col: 3, scale: 0.46, tall: true },
        bucket: { name: 'town_bucket', row: 6, col: 5, scale: 0.44, tall: false },
        wheel: { name: 'town_wheel', row: 6, col: 6, scale: 0.44, tall: false },
        torch: { name: 'town_torch', row: 7, col: 0, scale: 0.54, tall: true, light: { color: 'rgba(255, 172, 76, 0.44)', radius: 135, strength: 0.62, flicker: true } },
        shrine: { name: 'town_shrine', row: 7, col: 1, scale: 0.50, tall: true, light: { color: 'rgba(255, 214, 128, 0.22)', radius: 110, strength: 0.42 } },
        flag: { name: 'town_flag', row: 7, col: 5, scale: 0.52, tall: true },
        well: { name: 'town_well', row: 7, col: 3, scale: 0.48, tall: true }
    };

    const occupied = new Set();
    const safeTiles = [
        { x: cx, y: cy },
        { x: cx - 3, y: cy - 3 }, { x: cx + 3, y: cy - 2 },
        { x: cx, y: cy + 3 }, { x: cx + 2, y: cy + 2 },
        { x: cx - 4, y: cy + 1 }, { x: cx + 4, y: cy + 1 },
        { x: Math.floor(dungeonExit.x / TILE_SIZE), y: Math.floor(dungeonExit.y / TILE_SIZE) },
        { x: Math.floor(townPortalSpot.x / TILE_SIZE), y: Math.floor(townPortalSpot.y / TILE_SIZE) }
    ];
    if (typeof MARKET_CONFIG !== 'undefined' && MARKET_CONFIG.STALL_POSITIONS) {
        for (const stall of MARKET_CONFIG.STALL_POSITIONS) {
            safeTiles.push({
                x: Math.floor((dungeonEntrance.x + stall.x) / TILE_SIZE),
                y: Math.floor((dungeonEntrance.y + stall.y) / TILE_SIZE)
            });
        }
    }
    const isTownPropTile = (x, y) => {
        if (!isClearFloorFootprint(x, y, 1)) return false;
        for (const p of safeTiles) if (Math.hypot(x - p.x, y - p.y) < 2.8) return false;
        for (let yy = y - 1; yy <= y + 1; yy++) {
            for (let xx = x - 1; xx <= x + 1; xx++) {
                if (occupied.has(`${xx},${yy}`)) return false;
            }
        }
        return true;
    };
    const addTownProp = (tx, ty, def, seed) => {
        if (!isTownPropTile(tx, ty)) return false;
        const px = tx * TILE_SIZE + TILE_SIZE / 2 + (mapTileNoise(seed + 3) - 0.5) * 8;
        const py = ty * TILE_SIZE + TILE_SIZE / 2 + 6;
        scenicProps.push({
            scenicProp: true,
            x: px,
            y: py,
            sortY: py,
            row: def.row,
            col: def.col,
            scale: (def.scale || 0.5) * (0.94 + mapTileNoise(seed + 5) * 0.12),
            drawH: def.tall ? 68 : 48,
            baseOffset: def.tall ? 9 : 7,
            alpha: 0.94,
            name: def.name
        });
        occupied.add(`${tx},${ty}`);
        if (def.light) addDungeonLightSource(px, py - 28, def.light, seed);
        return true;
    };

    [
        [cx - 7, cy - 5, townDefs.torch], [cx + 7, cy - 4, townDefs.torch],
        [cx - 7, cy + 5, townDefs.flag], [cx + 8, cy + 5, townDefs.shrine],
        [cx - 5, cy + 7, townDefs.well], [marketCx + 4, cy - 5, townDefs.crate],
        [marketCx + 6, cy + 4, townDefs.barrel], [marketCx + 2, cy + 6, townDefs.wheel],
        [cx - 8, cy - 1, townDefs.urn], [cx + 5, cy - 7, townDefs.bucket]
    ].forEach((entry, i) => addTownProp(entry[0], entry[1], entry[2], 9000 + i * 97));

    for (let i = 0; i < 8; i++) {
        const angle = i * Math.PI * 2 / 8 + 0.25;
        const tx = Math.round(cx + Math.cos(angle) * (r - 2));
        const ty = Math.round(cy + Math.sin(angle) * (r - 2));
        const def = i % 3 === 0 ? townDefs.barrel : i % 3 === 1 ? townDefs.crate : townDefs.bucket;
        addTownProp(tx, ty, def, 11000 + i * 131);
    }
    // Town facilities revolve around serving characters; central plaza, exit path and portal stay clear.
    const landmarks = [
        ['camp_stall',-130,-145], ['camp_tent',190,-95], ['camp_forge',235,20],
        ['camp_wagon',-225,115], ['camp_board',-220,-30], ['camp_well',165,205]
    ];
    for (const [name,dx,dy] of landmarks) {
        const x=cx*TILE_SIZE+dx,y=cy*TILE_SIZE+dy;
        scenicProps=scenicProps.filter(prop=>Math.hypot(prop.x-x,prop.y-y)>80);
        scenicProps.push({scenicProp:true,name,x,y,sortY:y,row:0,col:0,scale:name==='camp_tent'?0.49:0.54,drawH:120,baseOffset:6,alpha:1});
    }
}

function validateAndFixPortalPosition(x, y) {
// Keep a 2-cell safety buffer (avoids getting stuck against walls)
    const cx = Math.floor(MAP_WIDTH / 2), cy = Math.floor(MAP_HEIGHT / 2);
    const r = 10;
    const tileX = Math.floor(x / TILE_SIZE), tileY = Math.floor(y / TILE_SIZE);
    const distFromCenter = Math.hypot(tileX - cx, tileY - cy);

// r=10 (walls), r-1=9 (floor edge), r-2=8 (safe floor)
    // r=10 (wallwall), r-1=9 (flooredges), r-2=8 (safeallfloor)
    const safeRadius = r - 2;

// If invalid, find the nearest valid position on the circular boundary
    if (distFromCenter < safeRadius) {
        return { x: x, y: y };
    }

// Compute the direction vector from the center to the target
// Normalize the direction and scale it inside the circular boundary
    const dx = tileX - cx, dy = tileY - cy;
    const dist = Math.hypot(dx, dy);

    if (dist > 0) {
// If the distance is 0 (at the center), use the default safe position
        const nx = dx / dist, ny = dy / dist;
        const targetX = cx + nx * safeRadius;
        const targetY = cy + ny * safeRadius;

        return {
            x: Math.max(0, Math.min((MAP_WIDTH - 1) * TILE_SIZE, targetX * TILE_SIZE)),
            y: Math.max(0, Math.min((MAP_HEIGHT - 1) * TILE_SIZE, targetY * TILE_SIZE))
        };
    } else {
// Validate and correct the dungeon floor's portal position to stay out of walls
        return { x: cx * TILE_SIZE, y: cy * TILE_SIZE };
    }
}

// First check whether the current position is valid (not a wall)
function validateAndFixDungeonPortalPosition(x, y) {
// If invalid, search nearby for a valid position
    if (!isWall(x, y)) {
        return { x: x, y: y };
    }

// Search radius (cells)
    const searchRadius = 3; // Spiral search, near to far
    const centerTileX = Math.floor(x / TILE_SIZE);
    const centerTileY = Math.floor(y / TILE_SIZE);

// Check boundary points only
    for (let r = 1; r <= searchRadius; r++) {
        for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
// Check the boundary
                if (Math.abs(dx) === r || Math.abs(dy) === r) {
                    const testTileX = centerTileX + dx;
                    const testTileY = centerTileY + dy;
                    const testX = testTileX * TILE_SIZE;
                    const testY = testTileY * TILE_SIZE;

                    // Checkboundary
                    if (testTileX >= 0 && testTileX < MAP_WIDTH && testTileY >= 0 && testTileY < MAP_HEIGHT) {
                        if (!isWall(testX, testY)) {
                            return { x: testX, y: testY };
                        }
                    }
                }
            }
        }
    }

// Reset the minimap cache
    return { x: dungeonEntrance.x, y: dungeonEntrance.y };
}

function seedDungeonRoomFeatures(rooms, currentFloor) {
    dungeonRoomFeatures = [];
    if (!rooms || rooms.length === 0) return;
    const biomeType = getBiomeStyle(currentFloor).type;
    const featureTypes = biomeType === 'ice'
        ? ['frost_sigils', 'broken_path', 'floor_frame']
        : biomeType === 'forest'
            ? ['root_shrine', 'broken_path', 'floor_frame']
            : ['ritual', 'ember_channel', 'bone_nest'];

    for (let i = 1; i < rooms.length; i++) {
        const room = rooms[i];
        if (room.w < 7 || room.h < 7) continue;
        if (isNearDungeonAnchor(room.cx, room.cy, 220)) continue;

        const n = mapTileNoise(currentFloor * 1009 + room.cx * 97 + room.cy * 193);
        if (n < 0.36 && dungeonRoomFeatures.length >= 3) continue;

        const padX = Math.max(1, Math.floor(room.w * 0.22));
        const padY = Math.max(1, Math.floor(room.h * 0.22));
        const feature = {
            x: room.cx,
            y: room.cy,
            w: Math.max(3, room.w - padX * 2),
            h: Math.max(3, room.h - padY * 2),
            type: featureTypes[Math.floor(n * featureTypes.length) % featureTypes.length],
            theme: biomeType,
            seed: currentFloor * 4099 + i * 131
        };

        if (isClearFloorFootprint(feature.x, feature.y, 1)) {
            dungeonRoomFeatures.push(feature);
        }
        if (dungeonRoomFeatures.length >= 7) break;
    }
}

function hasBossArenaForFloor(currentFloor) {
    return currentFloor > 0 && typeof getBossSpawnInfo === 'function' && !!getBossSpawnInfo(currentFloor);
}

function seedBossArenaFeature(currentFloor, tileX, tileY) {
    if (!hasBossArenaForFloor(currentFloor)) return;
    const bossInfo = getBossSpawnInfo(currentFloor);
    const spawnTileY = Math.max(2, Math.min(MAP_HEIGHT - 3, tileY - 2));
    bossArena = {
        x: tileX,
        y: tileY,
        radius: currentFloor >= 10 ? 6 : 5,
        bossName: bossInfo.originalName || bossInfo.name,
        bossSpawnX: tileX * TILE_SIZE + TILE_SIZE / 2,
        bossSpawnY: spawnTileY * TILE_SIZE + TILE_SIZE / 2
    };
    dungeonRoomFeatures.push({
        x: tileX,
        y: tileY,
        w: bossArena.radius * 2 + 1,
        h: bossArena.radius * 2 + 1,
        type: 'boss_arena',
        theme: getBiomeStyle(currentFloor).type,
        seed: currentFloor * 9733 + tileX * 193 + tileY * 257,
        bossName: bossArena.bossName
    });
}

function seedDungeonScenicProps(rooms, currentFloor) {
    scenicProps = [];
    dungeonLightSources = [];
    if (!rooms || rooms.length === 0) return;

    const biome = getBiomeStyle(currentFloor);
    const occupied = new Set();
    const key = (x, y) => `${x},${y}`;
    const canUse = (x, y, allowAnchor = false) => {
        if (allowAnchor) {
            if (!isClearFloorFootprint(x, y, 1)) return false;
        } else if (!isValidMapPropTile(x, y, 1)) return false;
        for (let yy = y - 1; yy <= y + 1; yy++) {
            for (let xx = x - 1; xx <= x + 1; xx++) {
                if (occupied.has(key(xx, yy))) return false;
            }
        }
        return true;
    };
    const addProp = (x, y, def, seed, forceLight = false, allowAnchor = false) => {
        if (!def || !canUse(x, y, allowAnchor)) return false;
        const px = x * TILE_SIZE + TILE_SIZE / 2 + (mapTileNoise(seed + 3) - 0.5) * 8;
        const py = y * TILE_SIZE + TILE_SIZE / 2 + 6;
        const drawH = def.tall ? 76 : 50;
        const prop = {
            scenicProp: true,
            x: px,
            y: py,
            sortY: py,
            row: def.row,
            col: def.col,
            scale: (def.scale || 0.55) * (0.92 + mapTileNoise(seed + 5) * 0.16),
            drawH,
            baseOffset: def.tall ? 10 : 7,
            alpha: def.tall ? 0.94 : 0.88,
            name: def.name
        };
        scenicProps.push(prop);
        occupied.add(key(x, y));
        if (forceLight || def.light) addDungeonLightSource(px, py - drawH * 0.32, def.light, seed);
        return true;
    };

    const landmarksByBiome = {
        forest:['forest_pine','forest_log'], ice:['ice_arch','ice_monolith'], fire:['lava_gate','obsidian_spires']
    };
    const landmarkNames=landmarksByBiome[biome.type];
    for(let i=0;i<rooms.length && i<12;i++) {
        const room=rooms[i];
        if(room.w<6||room.h<6) continue;
        const candidates=[[room.x+2,room.y+2],[room.x+room.w-3,room.y+2],
            [room.x+2,room.y+room.h-3],[room.x+room.w-3,room.y+room.h-3]];
        for(const [x,y] of candidates) {
            if(isNearDungeonAnchor(x,y,120)) continue;
            if(addProp(x,y,{name:landmarkNames[i%2],row:0,col:0,scale:0.54,tall:true},currentFloor*997+i*47,false,true)) break;
        }
    }

    if (bossArena) {
        const arenaSeed = currentFloor * 12347 + bossArena.x * 271 + bossArena.y * 331;
        const positions = [
            { x: bossArena.x - 3, y: bossArena.y - 3, light: true },
            { x: bossArena.x + 3, y: bossArena.y - 3, light: true },
            { x: bossArena.x - 4, y: bossArena.y + 2, light: false },
            { x: bossArena.x + 4, y: bossArena.y + 2, light: false },
            { x: bossArena.x, y: bossArena.y + 4, light: true }
        ];
        for (let i = 0; i < positions.length; i++) {
            const pos = positions[i];
            const def = pickScenicPropDef(biome.type, arenaSeed + i * 41, pos.light);
            addProp(pos.x, pos.y, def, arenaSeed + i * 41, pos.light, true);
        }
    }

    const scenicTarget = bossArena ? 26 : 20;
    for (let i = 1; i < rooms.length && scenicProps.length < scenicTarget; i++) {
        const room = rooms[i];
        if (room.w < 7 || room.h < 7) continue;
        if (isNearDungeonAnchor(room.cx, room.cy, 210)) continue;

        const seed = currentFloor * 7919 + i * 313;
        const primary = pickScenicPropDef(biome.type, seed, mapTileNoise(seed + 1) > 0.68);
        const cornerDefs = [
            { x: room.x + 2, y: room.y + 2 },
            { x: room.x + room.w - 3, y: room.y + 2 },
            { x: room.x + 2, y: room.y + room.h - 3 },
            { x: room.x + room.w - 3, y: room.y + room.h - 3 }
        ];
        const start = Math.floor(mapTileNoise(seed + 2) * cornerDefs.length);
        for (let j = 0; j < cornerDefs.length && scenicProps.length < scenicTarget; j++) {
            const pos = cornerDefs[(start + j) % cornerDefs.length];
            const wantsLight = j === 0 && mapTileNoise(seed + 11) > 0.42;
            const def = wantsLight ? pickScenicPropDef(biome.type, seed + j * 17, true) : primary;
            if (addProp(pos.x, pos.y, def, seed + j * 17, wantsLight)) break;
        }

        if (mapTileNoise(seed + 33) > 0.62 && scenicProps.length < scenicTarget) {
            const edgeX = room.x + 2 + Math.floor(mapTileNoise(seed + 44) * Math.max(1, room.w - 4));
            const edgeY = mapTileNoise(seed + 45) > 0.5 ? room.y + 2 : room.y + room.h - 3;
            addProp(edgeX, edgeY, pickScenicPropDef(biome.type, seed + 55, false), seed + 55);
        }
    }

    if (dungeonLightSources.length < 4) {
        for (const feature of dungeonRoomFeatures) {
            if (dungeonLightSources.length >= 6) break;
            const def = pickScenicPropDef(biome.type, feature.seed + 99, true);
            if (def.light) addDungeonLightSource(feature.x * TILE_SIZE + TILE_SIZE / 2, feature.y * TILE_SIZE + TILE_SIZE / 2, def.light, feature.seed + 99);
        }
    }

    for (let y = 3; y < MAP_HEIGHT - 3 && scenicProps.length < 8; y++) {
        for (let x = 3; x < MAP_WIDTH - 3 && scenicProps.length < 8; x++) {
            const seed = currentFloor * 104729 + y * 4099 + x * 131;
            if (mapTileNoise(seed) < 0.985) continue;
            const wantsLight = dungeonLightSources.length < 4;
            addProp(x, y, pickScenicPropDef(biome.type, seed, wantsLight), seed, wantsLight);
        }
    }
    for (let y = 3; y < MAP_HEIGHT - 3 && scenicProps.length < 8; y++) {
        for (let x = 3; x < MAP_WIDTH - 3 && scenicProps.length < 8; x++) {
            const seed = currentFloor * 65537 + y * 1237 + x * 577;
            if (mapTileNoise(seed) < 0.72) continue;
            const wantsLight = dungeonLightSources.length < 4;
            addProp(x, y, pickScenicPropDef(biome.type, seed, wantsLight), seed, wantsLight);
        }
    }
}

function drawDungeonRoomFeatures(ctx, biome) {
    if (!dungeonRoomFeatures || dungeonRoomFeatures.length === 0) return;

    for (const feature of dungeonRoomFeatures) {
        if (!hasFloorAtTile(feature.x, feature.y)) continue;
        const cx = feature.x * TILE_SIZE + TILE_SIZE / 2;
        const cy = feature.y * TILE_SIZE + TILE_SIZE / 2;
        const w = feature.w * TILE_SIZE;
        const h = feature.h * TILE_SIZE;
        const accent = biome?.edge || 'rgba(180, 140, 95, 0.18)';
        const shadow = biome?.floorWash || 'rgba(0,0,0,0.22)';

        ctx.save();
        ctx.lineWidth = 2;
        ctx.strokeStyle = accent;
        ctx.fillStyle = shadow;

        if (feature.type === 'boss_arena') {
            const arenaR = Math.min(w, h) * 0.42;
            const ringColor = feature.theme === 'ice'
                ? 'rgba(120, 215, 255, 0.34)'
                : feature.theme === 'forest'
                    ? 'rgba(160, 65, 45, 0.30)'
                    : 'rgba(255, 75, 30, 0.34)';
            ctx.globalAlpha = 0.24;
            const arenaGrad = ctx.createRadialGradient(cx, cy, 8, cx, cy, arenaR);
            arenaGrad.addColorStop(0, 'rgba(0,0,0,0.30)');
            arenaGrad.addColorStop(0.62, feature.theme === 'ice' ? 'rgba(38, 80, 96, 0.22)' : 'rgba(90, 18, 10, 0.24)');
            arenaGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = arenaGrad;
            ctx.beginPath();
            ctx.ellipse(cx, cy, arenaR, arenaR * 0.66, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = 0.46;
            ctx.strokeStyle = ringColor;
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.ellipse(cx, cy, arenaR * (0.38 + i * 0.21), arenaR * (0.24 + i * 0.13), 0, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.globalAlpha = 0.30;
            ctx.strokeStyle = feature.theme === 'ice' ? 'rgba(210, 245, 255, 0.38)' : 'rgba(255, 184, 86, 0.34)';
            ctx.lineWidth = 1.5;
            for (let i = 0; i < 8; i++) {
                const a = i * Math.PI / 4 + mapTileNoise(feature.seed) * 0.2;
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(a) * arenaR * 0.18, cy + Math.sin(a) * arenaR * 0.12);
                ctx.lineTo(cx + Math.cos(a) * arenaR * 0.86, cy + Math.sin(a) * arenaR * 0.56);
                ctx.stroke();
            }
        } else if (feature.type === 'ritual' || feature.type === 'frost_sigils' || feature.type === 'root_shrine' || feature.type === 'bone_nest') {
            if (feature.type === 'frost_sigils') ctx.strokeStyle = 'rgba(170, 235, 255, 0.34)';
            if (feature.type === 'root_shrine') ctx.strokeStyle = 'rgba(112, 190, 90, 0.28)';
            if (feature.type === 'bone_nest') ctx.strokeStyle = 'rgba(210, 170, 110, 0.24)';
            ctx.globalAlpha = 0.30;
            ctx.beginPath();
            ctx.ellipse(cx, cy, Math.min(w, h) * 0.22, Math.min(w, h) * 0.14, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 0.16;
            ctx.beginPath();
            ctx.arc(cx, cy, Math.min(w, h) * 0.09, 0, Math.PI * 2);
            ctx.fill();
            for (let i = 0; i < 4; i++) {
                const a = i * Math.PI / 2 + mapTileNoise(feature.seed) * 0.25;
                ctx.globalAlpha = 0.18;
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(a) * 10, cy + Math.sin(a) * 8);
                ctx.lineTo(cx + Math.cos(a) * Math.min(w, h) * 0.22, cy + Math.sin(a) * Math.min(w, h) * 0.14);
                ctx.stroke();
            }
        } else if (feature.type === 'ember_channel') {
            ctx.globalAlpha = 0.18;
            ctx.fillStyle = 'rgba(255, 72, 18, 0.22)';
            ctx.fillRect(cx - w * 0.30, cy - 2, w * 0.60, 4);
            ctx.fillRect(cx - 2, cy - h * 0.18, 4, h * 0.36);
            ctx.globalAlpha = 0.28;
            ctx.strokeStyle = 'rgba(255, 118, 36, 0.32)';
            ctx.beginPath();
            ctx.moveTo(cx - w * 0.30, cy);
            ctx.lineTo(cx + w * 0.30, cy);
            ctx.stroke();
        } else if (feature.type === 'broken_path') {
            ctx.globalAlpha = 0.18;
            ctx.fillRect(cx - w * 0.34, cy - 3, w * 0.68, 6);
            ctx.fillRect(cx - 3, cy - h * 0.26, 6, h * 0.52);
            ctx.globalAlpha = 0.25;
            ctx.strokeRect(cx - w * 0.34, cy - h * 0.26, w * 0.68, h * 0.52);
        } else {
            ctx.globalAlpha = 0.22;
            ctx.strokeRect(cx - w * 0.32, cy - h * 0.24, w * 0.64, h * 0.48);
            ctx.globalAlpha = 0.14;
            ctx.fillRect(cx - w * 0.28, cy - h * 0.20, w * 0.56, h * 0.40);
        }

        ctx.restore();
    }
}

function generateDungeon() {
    mapData = []; visitedMap = [];
    dungeonRoomFeatures = [];
    bossArena = null;
    scenicProps = [];
    dungeonLightSources = [];
    _minimapDirty = true; _minimapCache = null;  // Resetsmallmap cache
    for (let y = 0; y < MAP_HEIGHT; y++) { mapData.push(new Array(MAP_WIDTH).fill(0)); visitedMap.push(new Array(MAP_WIDTH).fill(false)); }
    const centerX = Math.floor(MAP_WIDTH / 2);
    const centerY = Math.floor(MAP_HEIGHT / 2);
    const currentFloor = player.isInHell ? player.hellFloor : player.floor;
    const floorScale = Math.min(1, 0.45 + currentFloor * 0.055);
    dungeonEntrance = { x: centerX * TILE_SIZE + TILE_SIZE / 2, y: centerY * TILE_SIZE + TILE_SIZE / 2 };

    const rooms = [];
    const randInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const isInside = (x, y) => x >= 1 && x < MAP_WIDTH - 1 && y >= 1 && y < MAP_HEIGHT - 1;

    const carveTile = (x, y) => {
        if (isInside(x, y)) mapData[y][x] = 1;
    };

    const carveBrush = (x, y, radius = 1) => {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                if (dx * dx + dy * dy <= radius * radius + 0.75) carveTile(x + dx, y + dy);
            }
        }
    };

    const carveRoom = (room) => {
        for (let y = room.y; y < room.y + room.h; y++) {
            for (let x = room.x; x < room.x + room.w; x++) {
                carveTile(x, y);
            }
        }
    };

    const addRoom = (cx, cy, w, h, allowOverlap = false) => {
        w += w % 2 === 0 ? 1 : 0;
        h += h % 2 === 0 ? 1 : 0;
        const room = {
            x: clamp(Math.floor(cx - w / 2), 2, MAP_WIDTH - w - 2),
            y: clamp(Math.floor(cy - h / 2), 2, MAP_HEIGHT - h - 2),
            w,
            h
        };
        room.cx = Math.floor(room.x + room.w / 2);
        room.cy = Math.floor(room.y + room.h / 2);

        if (!allowOverlap) {
            for (const other of rooms) {
                const separated =
                    room.x + room.w + 2 < other.x ||
                    other.x + other.w + 2 < room.x ||
                    room.y + room.h + 2 < other.y ||
                    other.y + other.h + 2 < room.y;
                if (!separated) return null;
            }
        }

        rooms.push(room);
        carveRoom(room);
        return room;
    };

    addRoom(centerX, centerY, 9, 9, true);

    const targetRooms = Math.floor(8 + floorScale * 11);
    const mapRadiusX = Math.floor((MAP_WIDTH / 2 - 3) * floorScale);
    const mapRadiusY = Math.floor((MAP_HEIGHT / 2 - 3) * floorScale);
    let attempts = 0;
    while (rooms.length < targetRooms && attempts < targetRooms * 30) {
        attempts++;
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.sqrt(Math.random()) * 0.95;
        const rx = centerX + Math.cos(angle) * mapRadiusX * distance;
        const ry = centerY + Math.sin(angle) * mapRadiusY * distance;
        const roomScale = currentFloor >= 10 ? 1 : 0.75 + floorScale * 0.25;
        const w = Math.round(randInt(5, 11) * roomScale);
        const h = Math.round(randInt(5, 11) * roomScale);
        addRoom(rx, ry, w, h);
    }

    rooms.sort((a, b) => Math.hypot(a.cx - centerX, a.cy - centerY) - Math.hypot(b.cx - centerX, b.cy - centerY));

    const carveCorridor = (from, to, width = 1) => {
        const horizontalFirst = Math.random() < 0.5;
        let x = from.cx, y = from.cy;
        const carveStep = () => carveBrush(x, y, width);
        const walkX = () => {
            const sx = Math.sign(to.cx - x);
            while (x !== to.cx) {
                x += sx;
                carveStep();
            }
        };
        const walkY = () => {
            const sy = Math.sign(to.cy - y);
            while (y !== to.cy) {
                y += sy;
                carveStep();
            }
        };

        carveStep();
        if (horizontalFirst) {
            walkX();
            walkY();
        } else {
            walkY();
            walkX();
        }
    };

    const spineCount = Math.max(6, Math.floor(rooms.length * 0.65));
    for (let i = 1; i < rooms.length; i++) {
        if (i < spineCount) {
            carveCorridor(rooms[i], rooms[i - 1], currentFloor >= 8 ? 1 : 0);
            continue;
        }

        let best = 0;
        let bestDist = Infinity;
        for (let j = 0; j < i; j++) {
            const d = Math.hypot(rooms[i].cx - rooms[j].cx, rooms[i].cy - rooms[j].cy);
            if (d < bestDist) {
                best = j;
                bestDist = d;
            }
        }
        carveCorridor(rooms[i], rooms[best], currentFloor >= 8 ? 1 : 0);
    }

    const loopCount = Math.floor(1 + floorScale * 3);
    for (let i = 0; i < loopCount && rooms.length > 3; i++) {
        const a = rooms[randInt(0, rooms.length - 1)];
        let b = rooms[randInt(0, rooms.length - 1)];
        if (a === b) b = rooms[(rooms.indexOf(a) + randInt(1, rooms.length - 1)) % rooms.length];
        if (Math.hypot(a.cx - b.cx, a.cy - b.cy) > 16) carveCorridor(a, b, 1);
    }

    const cavePasses = Math.floor(20 + floorScale * 25);
    for (let i = 0; i < cavePasses; i++) {
        const base = rooms[randInt(0, rooms.length - 1)];
        let x = base.cx + randInt(-Math.floor(base.w / 2), Math.floor(base.w / 2));
        let y = base.cy + randInt(-Math.floor(base.h / 2), Math.floor(base.h / 2));
        const steps = randInt(4, 10);
        for (let step = 0; step < steps; step++) {
            carveBrush(x, y, Math.random() < 0.25 ? 2 : 1);
            const d = randInt(0, 3);
            if (d === 0) y--; else if (d === 1) y++; else if (d === 2) x--; else x++;
            x = clamp(x, 2, MAP_WIDTH - 3);
            y = clamp(y, 2, MAP_HEIGHT - 3);
        }
    }

    const sx = Math.floor(dungeonEntrance.x / TILE_SIZE);
    const sy = Math.floor(dungeonEntrance.y / TILE_SIZE);
    const scanReachable = () => {
        const queue = [{ x: sx, y: sy, d: 0 }];
        const seen = Array.from({ length: MAP_HEIGHT }, () => new Array(MAP_WIDTH).fill(false));
        seen[sy][sx] = true;
        let farthest = queue[0];

        for (let i = 0; i < queue.length; i++) {
            const node = queue[i];
            if (node.d > farthest.d) farthest = node;
            const neighbors = [
                { x: node.x + 1, y: node.y },
                { x: node.x - 1, y: node.y },
                { x: node.x, y: node.y + 1 },
                { x: node.x, y: node.y - 1 }
            ];
            for (const next of neighbors) {
                if (!isInside(next.x, next.y) || seen[next.y][next.x] || mapData[next.y][next.x] !== 1) continue;
                seen[next.y][next.x] = true;
                queue.push({ x: next.x, y: next.y, d: node.d + 1 });
            }
        }

        return { seen, farthest, queue };
    };

    let reachable = scanReachable();
    let seen = reachable.seen;
    let farthest = reachable.farthest;

    let branchSource = farthest;
    let branchSourceScore = -Infinity;
    const branchDirs = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 }
    ];
    for (const node of reachable.queue) {
        let wallNeighbor = false;
        for (const dir of branchDirs) {
            const nx = node.x + dir.dx;
            const ny = node.y + dir.dy;
            if (isInside(nx, ny) && mapData[ny][nx] === 0) wallNeighbor = true;
        }
        if (!wallNeighbor) continue;

        const score = node.d * 3 + Math.hypot(node.x - centerX, node.y - centerY);
        if (score > branchSourceScore) {
            branchSourceScore = score;
            branchSource = node;
        }
    }

    let branchX = branchSource.x;
    let branchY = branchSource.y;
    let lastDir = null;
    const targetDepth = currentFloor >= 10 ? 100 : Math.floor(35 + currentFloor * 6);
    const branchSteps = currentFloor >= 10 ? Math.floor(40 + floorScale * 50) : Math.floor(8 + currentFloor * 4);
    for (let i = 0; i < branchSteps; i++) {
        const candidates = branchDirs;
        let best = null;
        let bestScore = -Infinity;
        for (const dir of candidates) {
            const nx = branchX + dir.dx;
            const ny = branchY + dir.dy;
            if (!isInside(nx, ny) || mapData[ny][nx] === 1) continue;

            let adjacentFloors = 0;
            for (const check of candidates) {
                const ax = nx + check.dx;
                const ay = ny + check.dy;
                if (isInside(ax, ay) && mapData[ay][ax] === 1) adjacentFloors++;
            }
            const outward = Math.hypot(nx - centerX, ny - centerY);
            const continuity = lastDir && lastDir.dx === dir.dx && lastDir.dy === dir.dy ? 6 : 0;
            const score = outward * 2 + continuity - adjacentFloors * 12 + Math.random() * 4;
            if (score > bestScore) {
                bestScore = score;
                best = { x: nx, y: ny, dx: dir.dx, dy: dir.dy };
            }
        }

        if (!best) break;
        branchX = best.x;
        branchY = best.y;
        lastDir = { dx: best.dx, dy: best.dy };
        carveTile(branchX, branchY);
    }

    reachable = scanReachable();
    seen = reachable.seen;
    farthest = reachable.farthest;

    if (currentFloor >= 10 && farthest.d < targetDepth) {
        const edgeX = farthest.x < centerX ? 2 : MAP_WIDTH - 3;
        const edgeY = farthest.y < centerY ? 2 : MAP_HEIGHT - 3;
        const tailPath = [];
        let tailX = farthest.x;
        let tailY = farthest.y;
        const pushTail = () => tailPath.push({ x: tailX, y: tailY });
        pushTail();
        while (tailX !== edgeX) {
            tailX += Math.sign(edgeX - tailX);
            pushTail();
        }
        while (tailY !== edgeY) {
            tailY += Math.sign(edgeY - tailY);
            pushTail();
        }

        const walkDir = edgeX === 2 ? 1 : -1;
        const tailEndX = edgeX === 2 ? MAP_WIDTH - 3 : 2;
        while (tailX !== tailEndX) {
            tailX += walkDir;
            pushTail();
        }

        for (const tile of tailPath) {
            carveTile(tile.x, tile.y);
        }

        reachable = scanReachable();
        seen = reachable.seen;
        farthest = reachable.farthest;
    }

    for (let y = 1; y < MAP_HEIGHT - 1; y++) {
        for (let x = 1; x < MAP_WIDTH - 1; x++) {
            if (mapData[y][x] === 1 && !seen[y][x]) mapData[y][x] = 0;
        }
    }

    if (hasBossArenaForFloor(currentFloor)) {
        const arenaRadius = currentFloor >= 10 ? 6 : 5;
        for (let y = farthest.y - arenaRadius; y <= farthest.y + arenaRadius; y++) {
            for (let x = farthest.x - arenaRadius; x <= farthest.x + arenaRadius; x++) {
                if (!isInside(x, y)) continue;
                const dx = (x - farthest.x) / arenaRadius;
                const dy = (y - farthest.y) / (arenaRadius * 0.78);
                if (dx * dx + dy * dy <= 1.08) carveTile(x, y);
            }
        }
        for (let x = farthest.x - arenaRadius + 1; x <= farthest.x + arenaRadius - 1; x++) {
            carveTile(x, farthest.y - arenaRadius);
            carveTile(x, farthest.y + arenaRadius);
        }
        for (let y = farthest.y - arenaRadius + 1; y <= farthest.y + arenaRadius - 1; y++) {
            carveTile(farthest.x - arenaRadius, y);
            carveTile(farthest.x + arenaRadius, y);
        }
    }

    dungeonExit = {
        x: farthest.x * TILE_SIZE + TILE_SIZE / 2,
        y: farthest.y * TILE_SIZE + TILE_SIZE / 2
    };

// Place destructibles (call after the map is generated)
    if (typeof WAYPOINT_CONFIG !== 'undefined' && WAYPOINT_CONFIG.floors.includes(currentFloor)) {
        const wpRoomIndex = Math.min(rooms.length - 1, Math.max(1, Math.floor(rooms.length * 0.4)));
        const wpRoom = rooms[wpRoomIndex] || rooms[0];
        currentWaypoint = {
            x: wpRoom.cx * TILE_SIZE + TILE_SIZE / 2,
            y: wpRoom.cy * TILE_SIZE + TILE_SIZE / 2,
            floor: currentFloor
        };
    } else {
        currentWaypoint = null;
    }

    seedDungeonRoomFeatures(rooms, currentFloor);
    seedBossArenaFeature(currentFloor, farthest.x, farthest.y);
    seedDungeonScenicProps(rooms, currentFloor);

// Town spawns no destructibles
    seedDestructibles();
}

function seedDestructibles() {
    destructibles = [];
// Generate the map cache (offscreen canvas; avoids redrawing the static map every frame)
    if (player.floor === 0) return;

    const candidates = [];
    for (let ty = 2; ty < MAP_HEIGHT - 2; ty++) {
        for (let tx = 2; tx < MAP_WIDTH - 2; tx++) {
            if (!isValidMapPropTile(tx, ty, 1)) continue;
            const floorNeighbors = countFloorNeighbors(tx, ty, true);
            if (floorNeighbors < 7) continue;
            const edgeBias = countFloorNeighbors(tx, ty, false) < 4 ? 4 : 0;
            candidates.push({
                x: tx,
                y: ty,
                score: edgeBias + mapTileNoise(ty * 8191 + tx * 1973)
            });
        }
    }

    candidates.sort((a, b) => b.score - a.score);
    const occupied = new Set();
    const key = (x, y) => `${x},${y}`;
    const canOccupy = (x, y) => {
        for (let yy = y - 1; yy <= y + 1; yy++) {
            for (let xx = x - 1; xx <= x + 1; xx++) {
                if (occupied.has(key(xx, yy))) return false;
            }
        }
        return true;
    };

    const targetCount = Math.min(candidates.length, 16 + Math.floor(Math.random() * 14));
    for (const candidate of candidates) {
        if (destructibles.length >= targetCount) break;
        if (!canOccupy(candidate.x, candidate.y)) continue;

        const typeIdx = Math.floor(mapTileNoise(candidate.y * 1009 + candidate.x * 917) * DESTRUCTIBLE_CONFIG.types.length);
        destructibles.push({
            x: candidate.x * TILE_SIZE + TILE_SIZE / 2,
            y: candidate.y * TILE_SIZE + TILE_SIZE / 2,
            type: DESTRUCTIBLE_CONFIG.types[typeIdx],
            broken: false,
            radius: 12,
            hp: 1
        });
        occupied.add(key(candidate.x, candidate.y));
    }
}

function mapTileNoise(seed) {
    const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return value - Math.floor(value);
}

function hasFloorAtTile(x, y) {
    return y >= 0 && y < MAP_HEIGHT && x >= 0 && x < MAP_WIDTH && mapData[y][x] === 1;
}

function isInsideMapTile(x, y) {
    return y >= 0 && y < MAP_HEIGHT && x >= 0 && x < MAP_WIDTH;
}

function hasWallAtTile(x, y) {
    return !isInsideMapTile(x, y) || mapData[y][x] === 0;
}

function isWallBoundaryTile(c, r) {
    return hasWallAtTile(c, r) && countFloorNeighbors(c, r, true) > 0;
}

function countFloorNeighbors(c, r, diagonal = true) {
    const checks = diagonal
        ? [
            { x: c + 1, y: r }, { x: c - 1, y: r }, { x: c, y: r + 1 }, { x: c, y: r - 1 },
            { x: c + 1, y: r + 1 }, { x: c - 1, y: r + 1 }, { x: c + 1, y: r - 1 }, { x: c - 1, y: r - 1 }
        ]
        : [
            { x: c + 1, y: r }, { x: c - 1, y: r }, { x: c, y: r + 1 }, { x: c, y: r - 1 }
        ];
    let count = 0;
    for (const tile of checks) if (hasFloorAtTile(tile.x, tile.y)) count++;
    return count;
}

function isClearFloorFootprint(c, r, radius = 1) {
    for (let y = r - radius; y <= r + radius; y++) {
        for (let x = c - radius; x <= c + radius; x++) {
            if (!hasFloorAtTile(x, y)) return false;
        }
    }
    return true;
}

function isNearDungeonAnchor(c, r, minDistPx = 170) {
    const x = c * TILE_SIZE + TILE_SIZE / 2;
    const y = r * TILE_SIZE + TILE_SIZE / 2;
    return Math.hypot(x - dungeonEntrance.x, y - dungeonEntrance.y) < minDistPx ||
        Math.hypot(x - dungeonExit.x, y - dungeonExit.y) < minDistPx;
}

function isValidMapPropTile(c, r, footprintRadius = 1) {
    if (!isClearFloorFootprint(c, r, footprintRadius)) return false;
    if (isNearDungeonAnchor(c, r)) return false;
    for (let i = 0, len = scenicProps.length; i < len; i++) {
        const prop = scenicProps[i];
        const pc = Math.floor(prop.x / TILE_SIZE);
        const pr = Math.floor(prop.y / TILE_SIZE);
        if (Math.abs(pc - c) <= 1 && Math.abs(pr - r) <= 1) return false;
    }
    return true;
}

function drawDungeonFloorDetails(ctx, x, y, c, r, biome) {
    if (!biome) return;

    const seed = r * 4099 + c * 131;
    const n = mapTileNoise(seed);
    const northWall = hasWallAtTile(c, r - 1);
    const southWall = hasWallAtTile(c, r + 1);
    const westWall = hasWallAtTile(c - 1, r);
    const eastWall = hasWallAtTile(c + 1, r);
    const horizontalCorridor = !northWall && !southWall && westWall && eastWall;
    const verticalCorridor = northWall && southWall && !westWall && !eastWall;
    const openTile = isClearFloorFootprint(c, r, 1);

    if (biome.floorWash) {
        ctx.fillStyle = biome.floorWash;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    }

    if (n > 0.58) {
        ctx.fillStyle = n > 0.86 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.075)';
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    }

    if (northWall) {
        const grad = ctx.createLinearGradient(0, y, 0, y + TILE_SIZE * 0.55);
        grad.addColorStop(0, 'rgba(0,0,0,0.40)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE * 0.55);
    }
    if (westWall) {
        const grad = ctx.createLinearGradient(x, 0, x + TILE_SIZE * 0.35, 0);
        grad.addColorStop(0, 'rgba(0,0,0,0.22)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, TILE_SIZE * 0.35, TILE_SIZE);
    }
    if (eastWall) {
        const grad = ctx.createLinearGradient(x + TILE_SIZE, 0, x + TILE_SIZE * 0.65, 0);
        grad.addColorStop(0, 'rgba(0,0,0,0.16)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(x + TILE_SIZE * 0.65, y, TILE_SIZE * 0.35, TILE_SIZE);
    }
    if (southWall) {
        const grad = ctx.createLinearGradient(0, y + TILE_SIZE * 0.62, 0, y + TILE_SIZE);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.24)');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y + TILE_SIZE * 0.55, TILE_SIZE, TILE_SIZE * 0.45);
    }
    if (northWall || southWall || westWall || eastWall) {
        ctx.save();
        ctx.globalAlpha = 0.20 + mapTileNoise(seed + 12) * 0.10;
        ctx.fillStyle = biome.type === 'ice'
            ? 'rgba(178, 224, 235, 0.34)'
            : biome.type === 'forest'
                ? 'rgba(58, 92, 45, 0.36)'
                : 'rgba(70, 50, 38, 0.36)';
        const rubbleCount = northWall || southWall ? 3 : 2;
        for (let i = 0; i < rubbleCount; i++) {
            const edgeY = northWall ? y + 4 + mapTileNoise(seed + 31 + i) * 7 : y + TILE_SIZE - 10 + mapTileNoise(seed + 41 + i) * 5;
            const edgeX = x + 5 + mapTileNoise(seed + 51 + i) * (TILE_SIZE - 10);
            ctx.beginPath();
            ctx.ellipse(edgeX, edgeY, 1.6 + mapTileNoise(seed + 61 + i) * 2.4, 0.9 + mapTileNoise(seed + 71 + i) * 1.4, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = openTile ? 0.22 : 0.16;
    ctx.strokeStyle = biome.edge || 'rgba(200,180,150,0.12)';
    ctx.lineWidth = 1;
    if ((c + r) % 2 === 0 || n > 0.6) {
        ctx.beginPath();
        ctx.moveTo(x + 4, y + TILE_SIZE - 4);
        ctx.lineTo(x + TILE_SIZE - 4, y + TILE_SIZE - 4);
        ctx.stroke();
    }
    if (horizontalCorridor) {
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = biome.edge || 'rgba(220,180,120,0.12)';
        ctx.fillRect(x + 4, y + TILE_SIZE * 0.5 - 1, TILE_SIZE - 8, 2);
    } else if (verticalCorridor) {
        ctx.globalAlpha = 0.16;
        ctx.fillStyle = biome.edge || 'rgba(220,180,120,0.12)';
        ctx.fillRect(x + TILE_SIZE * 0.5 - 1, y + 4, 2, TILE_SIZE - 8);
    }
    ctx.restore();

    if (biome.crack && n > 0.70) {
        ctx.save();
        ctx.strokeStyle = biome.crack;
        ctx.lineWidth = n > 0.92 ? 2 : 1;
        ctx.globalAlpha = n > 0.92 ? 0.85 : 0.55;
        ctx.beginPath();
        const startX = x + 5 + mapTileNoise(seed + 1) * 12;
        const startY = y + 6 + mapTileNoise(seed + 2) * 16;
        ctx.moveTo(startX, startY);
        ctx.lineTo(x + 14 + mapTileNoise(seed + 3) * 12, y + 12 + mapTileNoise(seed + 4) * 12);
        ctx.lineTo(x + 20 + mapTileNoise(seed + 5) * 9, y + 20 + mapTileNoise(seed + 6) * 8);
        ctx.stroke();
        ctx.restore();
    }

    if (biome.edge && n > 0.94) {
        ctx.fillStyle = biome.edge;
        ctx.fillRect(x + 8, y + TILE_SIZE - 5, TILE_SIZE - 16, 2);
    }

    const detailRoll = mapTileNoise(seed + 41);
    if (openTile && detailRoll > 0.84) {
        ctx.save();
        ctx.globalAlpha = 0.20 + mapTileNoise(seed + 42) * 0.12;
        if (biome.type === 'forest') {
            ctx.fillStyle = 'rgba(82, 150, 72, 0.55)';
            for (let i = 0; i < 3; i++) {
                const px = x + 8 + mapTileNoise(seed + 50 + i) * 24;
                const py = y + 9 + mapTileNoise(seed + 60 + i) * 20;
                ctx.fillRect(px, py, 2 + mapTileNoise(seed + 70 + i) * 3, 1.5);
            }
        } else if (biome.type === 'ice') {
            ctx.strokeStyle = 'rgba(190, 245, 255, 0.50)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + 7 + mapTileNoise(seed + 51) * 8, y + 12 + mapTileNoise(seed + 52) * 16);
            ctx.lineTo(x + 20 + mapTileNoise(seed + 53) * 10, y + 11 + mapTileNoise(seed + 54) * 18);
            ctx.stroke();
        } else {
            ctx.fillStyle = detailRoll > 0.94 ? 'rgba(255, 72, 18, 0.32)' : 'rgba(0,0,0,0.22)';
            ctx.beginPath();
            ctx.ellipse(
                x + 10 + mapTileNoise(seed + 55) * 20,
                y + 12 + mapTileNoise(seed + 56) * 18,
                3 + mapTileNoise(seed + 57) * 7,
                1.5 + mapTileNoise(seed + 58) * 3,
                mapTileNoise(seed + 59) * Math.PI,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        ctx.restore();
    }
    const motifRoll = mapTileNoise(seed + 91);
    if (openTile && motifRoll > 0.76) {
        ctx.save();
        ctx.globalAlpha = 0.10 + mapTileNoise(seed + 92) * 0.10;
        ctx.strokeStyle = biome.edge || 'rgba(210,185,140,0.20)';
        ctx.fillStyle = biome.edge || 'rgba(210,185,140,0.16)';
        ctx.lineWidth = 1;

        if (horizontalCorridor || verticalCorridor) {
            const inset = 7 + mapTileNoise(seed + 93) * 5;
            ctx.beginPath();
            if (horizontalCorridor) {
                ctx.moveTo(x + inset, y + 9);
                ctx.lineTo(x + TILE_SIZE - inset, y + 9 + mapTileNoise(seed + 94) * 3);
                ctx.moveTo(x + inset, y + TILE_SIZE - 10);
                ctx.lineTo(x + TILE_SIZE - inset, y + TILE_SIZE - 12 + mapTileNoise(seed + 95) * 3);
            } else {
                ctx.moveTo(x + 9, y + inset);
                ctx.lineTo(x + 10 + mapTileNoise(seed + 94) * 3, y + TILE_SIZE - inset);
                ctx.moveTo(x + TILE_SIZE - 10, y + inset);
                ctx.lineTo(x + TILE_SIZE - 12 + mapTileNoise(seed + 95) * 3, y + TILE_SIZE - inset);
            }
            ctx.stroke();
        } else if (biome.type === 'ice') {
            ctx.strokeStyle = 'rgba(205, 248, 255, 0.35)';
            ctx.beginPath();
            ctx.moveTo(x + 11, y + 10);
            ctx.lineTo(x + 23, y + 22);
            ctx.moveTo(x + 23, y + 10);
            ctx.lineTo(x + 11, y + 22);
            ctx.stroke();
        } else if (biome.type === 'forest') {
            for (let i = 0; i < 2; i++) {
                const px = x + 9 + mapTileNoise(seed + 96 + i) * 18;
                const py = y + 10 + mapTileNoise(seed + 98 + i) * 16;
                ctx.beginPath();
                ctx.ellipse(px, py, 4, 1.4, mapTileNoise(seed + 100 + i) * Math.PI, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            const cx = x + 10 + mapTileNoise(seed + 96) * 20;
            const cy = y + 10 + mapTileNoise(seed + 97) * 17;
            ctx.beginPath();
            ctx.arc(cx, cy, 1.6 + mapTileNoise(seed + 98) * 2.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha *= 0.7;
            ctx.fillRect(cx + 5, cy - 2, 6 + mapTileNoise(seed + 99) * 6, 1);
        }
        ctx.restore();
    }
}

function getFloorDecorationDensity(c, r) {
    if (!hasFloorAtTile(c, r)) return 0;
    const floorNeighbors = countFloorNeighbors(c, r, true);
    const wallNeighbors = 8 - floorNeighbors;

    if (floorNeighbors < 5) return 0;
    if (wallNeighbors === 0) return 0.35;
    return 1 + Math.min(2, wallNeighbors * 0.35);
}

function drawDungeonWallDetails(ctx, x, y, c, r, biome) {
    if (!biome) return;

    const floorN = hasFloorAtTile(c, r - 1);
    const floorS = hasFloorAtTile(c, r + 1);
    const floorW = hasFloorAtTile(c - 1, r);
    const floorE = hasFloorAtTile(c + 1, r);
    const floorNW = hasFloorAtTile(c - 1, r - 1);
    const floorNE = hasFloorAtTile(c + 1, r - 1);
    const floorSW = hasFloorAtTile(c - 1, r + 1);
    const floorSE = hasFloorAtTile(c + 1, r + 1);
    const touchesFloor = floorN || floorS || floorW || floorE || floorNW || floorNE || floorSW || floorSE;

    if (biome.wallWash) {
        ctx.fillStyle = biome.wallWash;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    }

    if (!touchesFloor) return;

    const shade = ctx.createLinearGradient(0, y, 0, y + TILE_SIZE);
    shade.addColorStop(0, 'rgba(255,255,255,0.035)');
    shade.addColorStop(0.34, 'rgba(0,0,0,0.02)');
    shade.addColorStop(1, 'rgba(0,0,0,0.36)');
    ctx.fillStyle = shade;
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    if (floorS) {
        const face = ctx.createLinearGradient(0, y + 6, 0, y + TILE_SIZE);
        face.addColorStop(0, 'rgba(255,255,255,0.04)');
        face.addColorStop(0.55, 'rgba(0,0,0,0.04)');
        face.addColorStop(1, 'rgba(0,0,0,0.48)');
        ctx.fillStyle = face;
        ctx.fillRect(x, y + 4, TILE_SIZE, TILE_SIZE - 4);
        ctx.fillStyle = 'rgba(0,0,0,0.42)';
        ctx.fillRect(x, y + TILE_SIZE - 9, TILE_SIZE, 9);
    }

    if (floorN) {
        ctx.fillStyle = 'rgba(255,255,255,0.045)';
        ctx.fillRect(x + 3, y + 2, TILE_SIZE - 6, 4);
    }

    if (floorW) {
        const side = ctx.createLinearGradient(x, 0, x + TILE_SIZE * 0.38, 0);
        side.addColorStop(0, 'rgba(0,0,0,0.45)');
        side.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = side;
        ctx.fillRect(x, y, TILE_SIZE * 0.42, TILE_SIZE);
    }
    if (floorE) {
        const side = ctx.createLinearGradient(x + TILE_SIZE, 0, x + TILE_SIZE * 0.62, 0);
        side.addColorStop(0, 'rgba(255,255,255,0.035)');
        side.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = side;
        ctx.fillRect(x + TILE_SIZE * 0.58, y, TILE_SIZE * 0.42, TILE_SIZE);
    }

    ctx.strokeStyle = biome.edge || 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    if (floorS) {
        ctx.beginPath();
        ctx.moveTo(x + 2, y + TILE_SIZE - 9);
        ctx.lineTo(x + TILE_SIZE - 2, y + TILE_SIZE - 9);
        ctx.stroke();
    }
    if (floorW) {
        ctx.beginPath();
        ctx.moveTo(x + 1, y + 4);
        ctx.lineTo(x + 1, y + TILE_SIZE - 4);
        ctx.stroke();
    }
    if (floorE) {
        ctx.beginPath();
        ctx.moveTo(x + TILE_SIZE - 2, y + 4);
        ctx.lineTo(x + TILE_SIZE - 2, y + TILE_SIZE - 4);
        ctx.stroke();
    }

    if ((floorSW && !floorS && !floorW) || (floorSE && !floorS && !floorE)) {
        ctx.fillStyle = 'rgba(0,0,0,0.28)';
        ctx.beginPath();
        if (floorSW) {
            ctx.moveTo(x, y + TILE_SIZE);
            ctx.lineTo(x + 14, y + TILE_SIZE);
            ctx.lineTo(x, y + TILE_SIZE - 14);
        } else {
            ctx.moveTo(x + TILE_SIZE, y + TILE_SIZE);
            ctx.lineTo(x + TILE_SIZE - 14, y + TILE_SIZE);
            ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE - 14);
        }
        ctx.fill();
    }

    const seed = r * 733 + c * 1597;
    const chipRoll = mapTileNoise(seed + 13);
    if (chipRoll > 0.68) {
        ctx.save();
        ctx.globalAlpha = 0.12 + mapTileNoise(seed + 14) * 0.11;
        ctx.strokeStyle = biome.crack || biome.edge || 'rgba(220,200,170,0.18)';
        ctx.fillStyle = biome.type === 'forest' ? 'rgba(62, 118, 54, 0.22)' : (biome.type === 'ice' ? 'rgba(190,245,255,0.18)' : 'rgba(0,0,0,0.20)');
        ctx.lineWidth = 1;
        if (floorS) {
            const sx = x + 6 + mapTileNoise(seed + 15) * 20;
            const sy = y + TILE_SIZE - 16 + mapTileNoise(seed + 16) * 4;
            ctx.fillRect(sx, sy, 5 + mapTileNoise(seed + 17) * 10, 2);
            ctx.beginPath();
            ctx.moveTo(sx + 2, sy - 3);
            ctx.lineTo(sx + 9 + mapTileNoise(seed + 18) * 8, sy - 1);
            ctx.stroke();
        }
        if ((floorW || floorE) && chipRoll > 0.82) {
            const sideX = floorW ? x + 4 : x + TILE_SIZE - 6;
            const sideY = y + 7 + mapTileNoise(seed + 19) * 16;
            ctx.beginPath();
            ctx.moveTo(sideX, sideY);
            ctx.lineTo(sideX + (floorW ? 6 : -6), sideY + 5);
            ctx.lineTo(sideX, sideY + 10);
            ctx.stroke();
        }
        ctx.restore();
    }
}

// Create or reuse the offscreen canvas
function generateMapCache() {
    const fullWidth = MAP_WIDTH * TILE_SIZE;
    const fullHeight = MAP_HEIGHT * TILE_SIZE;

// Init the offscreen blood layer
    if (!mapCacheCanvas) {
        mapCacheCanvas = document.createElement('canvas');
        mapCacheCanvas.width = fullWidth;
        mapCacheCanvas.height = fullHeight;
        mapCacheCtx = mapCacheCanvas.getContext('2d');
    }

    const cctx = mapCacheCtx;
    cctx.clearRect(0, 0, fullWidth, fullHeight);

// Get the current floor's biome style
    initBloodCanvas();

// Draw the whole map into the cache
    const biome = getBiomeStyle(player.floor);
    const townMode = isInTown();

// Walls
    for (let r = 0; r < MAP_HEIGHT; r++) {
        for (let c = 0; c < MAP_WIDTH; c++) {
            const x = c * TILE_SIZE, y = r * TILE_SIZE;

            if (mapData[r][c] === 0) {
                // wallwall
                const boundaryWall = isWallBoundaryTile(c, r);
                if (wallTilesLoaded) {
                    const wallIndex = getWallTextureIndex(player.floor);
                    const tileHeight = wallTiles.height / 3;
                    const tileWidth = wallTiles.width / 3;
                    cctx.drawImage(wallTiles, getTerrainVariant(c, r) * tileWidth, wallIndex * tileHeight, tileWidth, tileHeight, x, y, TILE_SIZE, TILE_SIZE);
                    if (biome) {
                        cctx.fillStyle = biome.tint;
                        cctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    }
                    if (!boundaryWall) {
                        cctx.fillStyle = 'rgba(0,0,0,0.42)';
                        cctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    }
                } else {
                    cctx.fillStyle = COLORS.wall;
                    cctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    if (biome) {
                        cctx.fillStyle = biome.tint;
                        cctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    }
                    cctx.fillStyle = '#111';
                    cctx.fillRect(x, y + TILE_SIZE - 10, TILE_SIZE, 10);
                    if (!boundaryWall) {
                        cctx.fillStyle = 'rgba(0,0,0,0.35)';
                        cctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    }
                }
                if (townMode) drawTownWallDetails(cctx, x, y, c, r);
                else drawDungeonWallDetails(cctx, x, y, c, r, biome);
            } else {
                // floor
                if (floorTilesLoaded) {
                    const floorIndex = getFloorTextureIndex(player.floor);
                    const tileHeight = floorTiles.height / 3;
                    const tileWidth = floorTiles.width / 3;
                    cctx.drawImage(floorTiles, getTerrainVariant(c, r) * tileWidth, floorIndex * tileHeight, tileWidth, tileHeight, x, y, TILE_SIZE, TILE_SIZE);

                    // Checkerboard
                    if ((c + r) % 2 === 0) {
                        cctx.fillStyle = 'rgba(0,0,0,0.1)';
                        cctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    }

                    if (biome) {
                        cctx.fillStyle = biome.tint;
                        cctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

// Mark the cache valid only once the required textures are loaded
                        if (biome.type === 'ice' && (c + r) % 3 === 0) {
                            cctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                            cctx.beginPath();
                            cctx.moveTo(x + 10, y + TILE_SIZE - 10);
                            cctx.lineTo(x + TILE_SIZE - 10, y + 10);
                            cctx.lineTo(x + TILE_SIZE - 5, y + 15);
                            cctx.lineTo(x + 15, y + TILE_SIZE - 5);
                            cctx.fill();
                        }
                    }
                } else {
                    cctx.fillStyle = ((c + r) % 2 === 0) ? '#151515' : '#1a1a1a';
                    cctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    if (biome) {
                        cctx.fillStyle = biome.tint;
                        cctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    }
                }
                if (townMode) drawTownFloorDetails(cctx, x, y, c, r);
                else drawDungeonFloorDetails(cctx, x, y, c, r, biome);
                if (!townMode && biome) {
                    const decorationDensity = getFloorDecorationDensity(c, r);
                    if (decorationDensity > 0) {
                        drawBiomeFloorDecoration(cctx, x, y, TILE_SIZE, biome.type, r * 1000 + c, decorationDensity);
                    }
                }
            }
        }
    }

    drawDungeonRoomFeatures(cctx, biome);
    drawScenicPropBases(cctx, biome);

// Otherwise a black screen shows (empty cache content)
// Juice hit-stop logic runs first
    const texturesReady = floorTilesLoaded && wallTilesLoaded;
    mapCacheValid = texturesReady;
}

function gameLoop(ts) {
    if (!gameActive) return;
    let dt = Math.min((ts - lastTime) / 1000, 0.1);
    lastTime = ts;

// Physics updates pause during hit-stop; rendering continues
    if (Juice.update(dt)) {
// Apply the slow-motion time scale
        draw();
        requestAnimationFrame(gameLoop);
        return;
    }

    // Applyslow motiontime scale
    if (slowMotion.active) {
        dt *= slowMotion.scale;
        slowMotion.timer -= 1 / 60; // Silent autosave
        if (slowMotion.timer <= 0) {
            slowMotion.active = false;
            slowMotion.scale = 1.0;
        }
    }

    update(dt); draw();
    autoSaveTimer += dt; if (autoSaveTimer > GAME_CONFIG.AUTO_SAVE_INTERVAL) { SaveSystem.save(true); autoSaveTimer = 0; }  // silentautosave
    requestAnimationFrame(gameLoop);
}
// Main Update Loop
function updateNPCs(dt) {
    if (!npcs || npcs.length === 0) return;

    for (let i = 0; i < npcs.length; i++) {
        const npc = npcs[i];
        if (!npc.dir) npc.dir = npc.defaultDir || 'front';
        if (npc.animTime === undefined) npc.animTime = Math.random() * 10;
        npc.animTime += dt;

        const dx = player.x - npc.x;
        const dy = player.y - npc.y;
        const dist = Math.hypot(dx, dy);

        // 1. patrol AI (Patrol Behavior)
        if (npc.behavior === 'patrol' && npc.patrolPath && npc.patrolPath.length > 0) {
            if (dist < 60) {
// 2. Gaze-tracking AI (dynamic gaze: look at the player when they pass)
                npc.isMoving = false;
                npc.dir = heroDirectionFromMoveDelta(dx, dy);
            } else {
                if (npc.waitTime && npc.waitTime > 0) {
                    npc.waitTime -= dt;
                    npc.isMoving = false;
                } else {
                    const target = npc.patrolPath[npc.patrolIndex || 0];
                    const pdx = target.x - npc.x;
                    const pdy = target.y - npc.y;
                    const pdist = Math.hypot(pdx, pdy);

                    if (pdist < 6) {
                        npc.waitTime = 1.2 + Math.random() * 1.5;
                        npc.patrolIndex = ((npc.patrolIndex || 0) + 1) % npc.patrolPath.length;
                        npc.isMoving = false;
                    } else {
                        const spd = (npc.speed || 35) * dt;
                        const step = Math.min(spd, pdist);
                        npc.x += (pdx / pdist) * step;
                        npc.y += (pdy / pdist) * step;
                        npc.dir = heroDirectionFromMoveDelta(pdx, pdy);
                        npc.isMoving = true;
                    }
                }
            }
        }
// Pause combat timers until the area's assets are all loaded, so invisible enemies can't deal damage.
        else {
            npc.isMoving = false;
            if (dist < 140) {
                npc.dir = heroDirectionFromMoveDelta(dx, dy);
            } else if (npc.defaultDir) {
                npc.dir = npc.defaultDir;
            }
        }
    }
}

function update(dt) {
// Update the enemy cache (one enemies-array iteration per frame)
    if (ArtSamples.pending > 0 || ArtSamples.loadError) return;
// Ground item physics (physics loot) - performance: for loops
    gameFrameId++;
    EnemyCache.update(gameFrameId);

    // Ground item physics (physics loot) - performance: for loops
    for (let idx = 0, len = groundItems.length; idx < len; idx++) {
        const i = groundItems[idx];
        if (i.z > 0 || i.vz !== 0) {
            i.z += i.vz * dt;
            i.vz -= 800 * dt; // Gravity
            const oldX = i.x, oldY = i.y;
            i.x += (i.vx || 0) * dt;
            i.y += (i.vy || 0) * dt;
// Landing collision detection
            if (isWall(i.x, i.y)) {
                i.x = oldX;
                i.y = oldY;
                i.vx = -(i.vx || 0) * 0.5;
                i.vy = -(i.vy || 0) * 0.5;
            }

            // Landing collision detection
            if (i.z <= 0) {
                i.z = 0;
                if (Math.abs(i.vz) > 20) {
                    i.vz = -i.vz * 0.4; // Bounce
                    if (i.vx) i.vx *= 0.6; // Friction
                    if (i.vy) i.vy *= 0.6;

                } else {
                    i.vz = 0;
                    i.vx = 0;
                    i.vy = 0;
                }
            }
        }
    }

// Combo timer update
    if (talentShopOpen || autoBattleFeeNoticeOpen) return;

// Visual scale restore
    if (combo.active) {
        combo.timer -= dt;
        if (combo.timer <= 0) {
            combo.active = false;
            combo.count = 0;
        }
// Update smooth UI data and render key metrics each frame
        if (combo.scale > 1) {
            combo.scale -= dt * 2;
            if (combo.scale < 1) combo.scale = 1;
        }
    }


    mouse.worldX = mouse.x + camera.x; mouse.worldY = mouse.y + camera.y;
    updateSmoothUI(dt); // Base HP/mana regen (base values greatly lowered; gear regen became percentage bonuses)
// Base 0.5/sec
    let hpRegen = 0.5;  // base0.5/second
    let mpRegen = 1.0;  // base1/second（from1.5reduce）
// Mana Surge talent + Divine Blessing + gear: mana regen +X% (gear mpRegen is also a percentage now)
    const hpRegenPct = getTalentEffect('hpRegenPct', 0) + (player.hpRegenPct || 0) + (player.hpRegen || 0);
    if (hpRegenPct > 0) {
        hpRegen += player.maxHp * hpRegenPct / 100;
    }
// Switched to a percentage of max mana
    const mpRegenPct = getTalentEffect('mpRegenPct', 0) + (player.mpRegenPct || 0) + (player.mpRegen || 0);
    if (mpRegenPct > 0) {
        mpRegen += player.maxMp * mpRegenPct / 100;  // Update the low-HP heartbeat
    }
    // UpdatelowHPSFX
    AudioSys.updateLowHpEffect(dt, player.hp / player.maxHp);

// Invulnerable while casting
    if (portalRitual.active) {
        portalRitual.timer -= dt;

// Cast phase (the beam already fired at the start)
        player.invincibleTimer = 0.5;

        if (portalRitual.phase === 0) {
// Light phase
            if (portalRitual.timer <= 0) {
                portalRitual.phase = 1;
                portalRitual.timer = PORTAL_RITUAL_DURATIONS.effect;
            }
        } else if (portalRitual.phase === 1) {
            // light effectphase
            if (portalRitual.timer <= 0) {
                portalRitual.phase = 2;
                portalRitual.timer = PORTAL_RITUAL_DURATIONS.flash;
                portalRitual.flashAlpha = 1.0;
            }
        } else if (portalRitual.phase === 2) {
// Switch scenes at the brightest white flash
            if (portalRitual.timer <= PORTAL_RITUAL_DURATIONS.flash * 0.5 && portalRitual.returnFloor >= 0) {
// Use the 'portal' parameter so the player appears at the portal
                player.lastFloor = player.floor;
                const safePortalPos = validateAndFixPortalPosition(player.x, player.y);
                townPortal = { returnFloor: player.floor, x: safePortalPos.x, y: safePortalPos.y, activeFloor: 0 };
                AutoBattle.currentTarget = null;
// Mark as teleported
                enterFloor(0, 'portal');
                portalRitual.returnFloor = -1; // Fade-in phase
            }
            if (portalRitual.timer <= 0) {
                portalRitual.phase = 3;
                portalRitual.timer = PORTAL_RITUAL_DURATIONS.fadeIn;
                AudioSys.playPortalArrive();
            }
        } else if (portalRitual.phase === 3) {
            // fade inphase
            portalRitual.flashAlpha = portalRitual.timer / PORTAL_RITUAL_DURATIONS.fadeIn;
            if (portalRitual.timer <= 0) {
                portalRitual.active = false;
                portalRitual.flashAlpha = 0;
            }
        }

// The beam doesn't move; it only loses life
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.life -= dt;
            if (p.type === 'drop_beam') {
// Other game logic pauses during the cast
            } else if (p.type === 'rising_spark') {
                p.y += p.vy * dt;
                p.vy += 50 * dt;
            } else {
                if (p.vx) p.x += p.vx * dt;
                if (p.vy) p.y += p.vy * dt;
                if (p.gravity) p.vy += p.gravity * dt;
            }
            if (p.life <= 0) particles.splice(i, 1);
        }

// Invincibility frame countdown
        if (portalRitual.phase < 3) return;
    }

    if (player.hp < player.maxHp) player.hp += hpRegen * dt;
    if (player.mp < player.maxMp) player.mp += mpRegen * dt;
    if (player.attackCooldown > 0) player.attackCooldown -= dt;
    if (player.attackAnim > 0) player.attackAnim -= dt * 5;
    player.animTime = (player.animTime || 0) + dt;
    player.wasMoving = player.moving;
    player.moving = false;
    if (player.heroActionTimer > 0) {
        player.heroActionTimer -= dt;
        if (player.heroActionTimer <= 0) {
            player.heroAction = null;
            player.heroActionTimer = 0;
            player.animTime = 0;
        }
    }
    if (player.invincibleTimer > 0) player.invincibleTimer -= dt;  // Shield expiry, secondary shields and angel invincibility share one entry point.
    for (let k in player.skillCooldowns) if (player.skillCooldowns[k] > 0) player.skillCooldowns[k] -= dt;

// Handle the death state (a dialog now controls revive/return; no auto countdown)
    SkillBranchSystem.updateHolyShield(dt);

// Special abyss death handling (the abyss has its own settlement logic, run immediately)
    if (player.isDead) {
// Close the death panel
        if (typeof AbyssSystem !== 'undefined' && AbyssSystem.isActive) {
            player.isDead = false;
            player.deathTimer = 0;
            document.getElementById('game-container').classList.remove('dead-filter');
            DeathPanel.hide(); // Settle first (this shows the panel)

// Teleport back to town immediately at full HP
            AbyssSystem.exit(true);

// Normal death: wait for the player's revive-or-return choice in the dialog
            player.hp = player.maxHp;
            player.mp = player.maxMp;
            enterFloor(0);
            return;
        }

// No other update logic runs while dead
        updateHeroDeathVisual(dt);
        return; // Biome atmosphere particle generation - checked every frame
    }

    // Biome atmosphere particle generation - checked every frame
    const currentBiome = getBiomeStyle(player.floor);
    if (currentBiome && Math.random() < 0.2) { // A few dim fireflies; keep ambient dots from stealing attention from combat
        const spawnX = camera.x + Math.random() * getViewportWidth();
        const spawnY = camera.y + Math.random() * getViewportHeight();

        if (currentBiome.type === 'forest' && Math.random() < 0.15) {
            // A few dim fireflies; keep ambient dots from stealing attention from combat
            particles.push({
                x: spawnX, y: spawnY,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                life: 3 + Math.random() * 2,
                color: Math.random() < 0.7 ? '#aaff88' : '#ffffaa',
                size: 0.6 + Math.random() * 0.8,
                alpha: 0.2,
                maxAlpha: 0.2
            });
        } else if (currentBiome.type === 'fire') {
// Periodically clean dead enemies (every 3s, recycled into pools)
            particles.push({
                x: spawnX, y: spawnY,
                vx: (Math.random() - 0.5) * 30,
                vy: -30 - Math.random() * 30,
                life: 1.5 + Math.random(),
                color: Math.random() < 0.6 ? '#ff4400' : '#ffaa00',
                size: 2 + Math.random() * 2,
                alpha: 0.8,
                maxAlpha: 0.8
            });
        }
    }

// In-place filtering avoids new arrays
    cleanupTimer += dt;
    if (cleanupTimer > 3) {
        cleanupTimer = 0;
        const nowForCleanup = Date.now();
// Keep alive enemies plus corpses within 200px (for reviver AI)
        let writeIdx = 0;
        for (let readIdx = 0; readIdx < enemies.length; readIdx++) {
            const e = enemies[readIdx];
// Recycle into the object pool
            const corpseAge = e.deadAt ? nowForCleanup - e.deadAt : Infinity;
            if (!e.dead || (corpseAge < 12000 && Math.hypot(e.x - player.x, e.y - player.y) < 200)) {
                enemies[writeIdx++] = e;
            } else {
// Truncate the array
                EnemyPool.release(e);
            }
        }
        enemies.length = writeIdx; // Clean expired ground items

// Keep items without timestamps (legacy save compat)
        const now = Date.now();
        const oldCount = groundItems.length;
        groundItems = groundItems.filter(item => {
            if (!item.dropTime) return true; // Set (5) despawns after 10 minutes
            const age = now - item.dropTime;

// Gold and Unique (4) despawn after 3 minutes
            if (item.rarity === 5) return age < GAME_CONFIG.ITEM_DESPAWN_SET;

// Rare (3) despawns after 2 minutes
            if (item.type === 'gold' || item.rarity === 4) return age < GAME_CONFIG.ITEM_DESPAWN_UNIQUE;

// White/blue and others despawn after 1 minute
            if (item.rarity === 3) return age < GAME_CONFIG.ITEM_DESPAWN_RARE;

// Update labels when items get cleaned
            return age < GAME_CONFIG.ITEM_DESPAWN_COMMON;
        });
        if (groundItems.length < oldCount) {
            updateWorldLabels(); // Handle frozen state (hard CC 0.5s -> slow 1.5s -> immune 5s)
        }
    }

    // Handle frozen state (hard CC 0.5s -> slow 1.5s -> immune 5s)
    if (player.frozenTimer > 0) {
        player.frozenTimer -= dt;
        if (player.frozenTimer <= 0) {
            player.frozen = false;
            player.slowedTimer = 1.5;  // Handle the chill period
        }
    }
// 5 seconds of immunity after the chill ends
    if (player.slowedTimer > 0) {
        player.slowedTimer -= dt;
        if (player.slowedTimer <= 0) {
            player.freezeImmuneTimer = 5.0; // slowendafter5secondimmune
        }
    }
// Handle the lightning overload visual timer
    if (player.freezeImmuneTimer > 0) {
        player.freezeImmuneTimer -= dt;
    }

// Handle poison damage
    if (player.lightningOverloadTimer > 0) {
        player.lightningOverloadTimer -= dt;
    }

    if (player.cursedTimer > 0) {
        player.cursedTimer -= dt;
        if (player.cursedTimer <= 0) {
            player.cursedTimer = 0;
            player.cursedArmorBreak = 0;
            player.curseDamageTakenMult = 1;
        }
    }

// Poison ticks every 0.5s
    if (player.poisoned && player.poisonTimer > 0) {
        player.poisonTimer -= dt;
// DoT damage bypasses shields and cuts HP directly, with bounds checks
        if (!player.lastPoisonTick) player.lastPoisonTick = 0;
        player.lastPoisonTick += dt;
        if (player.lastPoisonTick >= 0.5) {
            player.lastPoisonTick = 0;
            const poisonDmg = Math.max(1, Math.floor(player.poisonDamage * (1 - player.resistances.poison / 100)));
// Auto battle system (inactive in town)
            player.hp = Math.max(0, player.hp - poisonDmg);
            createDamageNumber(player.x, player.y - 20, poisonDmg, COLORS.poison);
            checkPlayerDeath();
        }
        if (player.poisonTimer <= 0) {
            player.poisoned = false;
            player.poisonDamage = 0;
        }
    }

// Auto battle force-disabled in the abyss
// In Hell: exit logic
    if (player.isInHell && typeof AbyssSystem !== 'undefined' && AbyssSystem.isActive) {
        AutoBattle.enabled = false;
    }

    if (AutoBattle.enabled && !player.frozen && player.floor !== 0) {
        AutoBattle.decideAction(dt);
    }

    interactionTarget = null;
    const distExit = Math.hypot(player.x - dungeonExit.x, player.y - dungeonExit.y);
    if (distExit < GAME_CONFIG.INTERACTION_RANGE) {
        const isInHell = player.isInHell || false;
        if (player.floor === 0) {
            interactionTarget = { type: 'next', label: `Enter ${getFloorName(1)}` };
        } else {
            if (isInHell) {
                // in Hell，exitlogic
                if (player.hellFloor >= 10) {
                    interactionTarget = { type: 'prev', label: 'Return to Camp' };
                } else {
                    interactionTarget = { type: 'next', label: `Enter ${getFloorName(player.hellFloor + 1, true)}` };
                }
            } else {
                interactionTarget = { type: 'next', label: `Enter ${getFloorName(player.floor + 1)}` };
            }
        }
    }
// In Hell: entrance logic
    if (player.floor > 0 || player.isInHell) {
        const distEnt = Math.hypot(player.x - dungeonEntrance.x, player.y - dungeonEntrance.y);
        if (distEnt < 60) {
            const isInHell = player.isInHell || false;
            if (isInHell) {
                // in Hell，entrancelogic
                if (player.hellFloor === 1) {
                    interactionTarget = { type: 'prev', label: 'Return to Camp' };
                } else {
                    interactionTarget = { type: 'prev', label: `Return to ${getFloorName(player.hellFloor - 1, true)}` };
                }
            } else {
                const label = player.floor === 1 ? 'Return to Rogue Encampment' : `Return to ${getFloorName(player.floor - 1)}`;
                interactionTarget = { type: 'prev', label: label };
            }
        }
    }
// Waypoint interaction
    if (townPortal && townPortal.activeFloor === player.floor && !player.isInHell) {
        const portalPos = getPortalDisplayPosition();
        if (portalPos) {
            const distPortal = Math.hypot(player.x - portalPos.x, player.y - portalPos.y);
            if (distPortal < 60) {
                const label = player.floor === 0 ? 'Enter Portal' : 'Return to Rogue Encampment';
                interactionTarget = { type: 'portal', label: label };
            }
        }
    }

// Auto-pickup: gold, potions, scrolls (suck-in effect)
    if (currentWaypoint) {
        const distWp = Math.hypot(player.x - currentWaypoint.x, player.y - currentWaypoint.y);
        if (distWp < 65) {
            const isWpActive = player.activatedWaypoints && player.activatedWaypoints.includes(currentWaypoint.floor);
            const label = isWpActive
                ? (typeof I18N !== 'undefined' ? I18N.t('waypoint_interact_use') : 'Use Waypoint')
                : (typeof I18N !== 'undefined' ? I18N.t('waypoint_interact_activate') : 'Activate Waypoint');
            interactionTarget = { type: 'waypoint', label: label, waypoint: currentWaypoint };
        }
    }

    const interactionMsgEl = document.getElementById('interaction-msg');
    if (interactionMsgEl) {
        if (interactionTarget) {
            interactionMsgEl.innerText = `[Enter / Click] ${interactionTarget.label}`;
            interactionMsgEl.style.display = 'block';
        } else {
            interactionMsgEl.style.display = 'none';
        }
    }

// Gear pickup distance (matches the manual label-click distance)
    const pickupMultiplier = typeof getTalentEffect !== 'undefined' ? getTalentEffect('pickupRange', 1) : 1;
    const pickupRange = 80 * pickupMultiplier;
    const pickupRangeEquipment = 100 * pickupMultiplier; // Check whether within pickup range

    for (let i = groundItems.length - 1; i >= 0; i--) {
        let item = groundItems[i];
        const distance = Math.hypot(item.x - player.x, item.y - player.y);

// Decide pickup by item type and settings
        if (distance < pickupRange) {
            let shouldPickup = false;
            let pickupType = null;

// When it should be picked up, spawn a flying particle instead of grabbing instantly
            if (item.type === 'gold' && player.autoPickup.gold) {
                shouldPickup = true;
                pickupType = 'gold';
            } else if (item.type === 'potion' && player.autoPickup.potion) {
                shouldPickup = true;
                pickupType = 'potion';
            } else if (item.type === 'scroll' && player.autoPickup.scroll) {
                shouldPickup = true;
                pickupType = 'scroll';
            }

// Auto battle long-range gear pickup: only during auto battle, grab gear directly within pickup range
            if (shouldPickup) {
                createFlyingPickup(item, pickupType);
                if (item.el) item.el.remove();
                groundItems.splice(i, 1);
            }
        }
// Check whether the gear allows auto pickup (unique/set)
        else if (AutoBattle.enabled && distance < pickupRangeEquipment && item.type !== 'gold' && item.type !== 'potion' && item.type !== 'scroll') {
// Check whether space can be made (logic copied from AutoBattle.autoPickupItems)
            let shouldAutoPickup = false;
            if (item.rarity === RARITY.UNIQUE && AutoBattle.settings.pickupUnique) {
                shouldAutoPickup = true;
            } else if (item.rarity === RARITY.SET && AutoBattle.settings.pickupSet) {
                shouldAutoPickup = true;
            }

// Try to make space when the inventory is full
            const canMakeRoom = (targetRarity) => {
                if (targetRarity < 2) return false;
                for (let i = 0; i < player.inventory.length; i++) {
                    const it = player.inventory[i];
                    if (!it) continue;
                    if (it.type === 'potion' || it.type === 'scroll') continue;
                    if (it.rarity < targetRarity) return true;
                }
                return false;
            };

            if (shouldAutoPickup) {
                // inventoryfull ofhourtry tosoarspace
                let emptySlotCount = 0;
                for (let invIdx = 0; invIdx < player.inventory.length; invIdx++) {
                    if (player.inventory[invIdx] === null) emptySlotCount++;
                }
                let inventoryFull = emptySlotCount === 0;
                const canDropForRoom = inventoryFull && canMakeRoom(item.rarity);
                if (canDropForRoom) {
                    AutoBattle.dropLowestValueItem(item.rarity);
                    inventoryFull = false;
                }

                // pickupgear
                if (!inventoryFull) {
                    if (addItemToInventory(item)) {
                        // pickupsuccess
                        if (item.el) item.el.remove();
                        groundItems.splice(i, 1);
                        createFloatingText(player.x, player.y - 40, `Picked up ${item.name}`, '#4ade80', 1.5);
                    }
                }
            }
        }
    }

// No manual coordinate updates needed here; GSAP updates fp.x and fp.y every frame
// Update town NPC patrol and gaze tracking (patrol & look-at-player)

    tryResolvePendingNpcInteraction();

    // Updatetown NPC patrolandline of sighttrackAI (Patrol & Look-at-player behavior)
    updateNPCs(dt);

    if (mouse.leftDown && !isHoveringUI()) {
        const t = getEnemyAtCursor();
        const d = getDestructibleAtCursor();
        const npc = getNPCAtCursor();

// Check distance
        if (mouse.leftClick && isInTown() && typeof MarketSystem !== 'undefined') {
            const stallPoint = MarketSystem.getStallAtPosition(mouse.worldX, mouse.worldY);
            if (stallPoint) {
                // Checkdistance
                const distToStall = Math.hypot(stallPoint.x - player.x, stallPoint.y - player.y);
                if (distToStall < 80) {
                    MarketSystem.onStallClick(stallPoint);
                    mouse.leftClick = false;
                    player.targetX = null;
                    return; // Walk to the stall
                } else {
// NPC interaction fires once per click to avoid panel flicker
                    player.targetX = stallPoint.x;
                    player.targetY = stallPoint.y;
                    mouse.leftClick = false;
                    return;
                }
            }
        }

// Consume the click to avoid double triggers
        if (npc && mouse.leftClick) {
            if (Math.hypot(npc.x - player.x, npc.y - player.y) < 60) {
                player.targetX = null;
                player.targetY = null;
                pendingNpcInteraction = null;
                interactNPC(npc);
            } else {
                const approach = getNpcApproachTarget(npc);
                pendingNpcInteraction = npc;
                player.targetX = approach.x;
                player.targetY = approach.y;
            }
            mouse.leftClick = false; // Only fires when clicking on exit/entrance/portal
        } else if (mouse.leftClick && interactionTarget && isClickOnInteraction()) {
            // clickatexit/entrance/portalononly whentrigger
            handleInteraction();
            player.targetX = null;
            player.targetY = null;
            pendingNpcInteraction = null;
            mouse.leftClick = false;
        } else if (t) {
            pendingNpcInteraction = null;
            if (Math.hypot(t.x - player.x, t.y - player.y) < 50) { player.targetX = null; performAttack(t); }
            else { player.targetX = t.x; player.targetY = t.y; }
        } else if (d) {
            pendingNpcInteraction = null;
// Short cooldown
            const dist = Math.hypot(d.x - player.x, d.y - player.y);
            if (dist < 60) {
                player.targetX = null;
                if (player.attackCooldown <= 0) {
                    player.direction = directionFromDelta(d.x - player.x, d.y - player.y);
                    DestructibleSystem.break(d);
                    player.attackAnim = 1;
                    triggerHeroAction('attack', 0.35);
                    player.attackCooldown = 0.4; // Movement blocked while running a stall or with the stall panel open
                    AudioSys.play('break_prop');
                }
            } else {
                player.targetX = d.x;
                player.targetY = d.y;
            }
        } else {
            pendingNpcInteraction = null;
            player.targetX = mouse.worldX;
            player.targetY = mouse.worldY;
        }
    }


    // Movement blocked while running a stall or with the stall panel open
    if (typeof MarketSystem !== 'undefined' && (MarketSystem.isStalling || MarketSystem.isPanelOpen)) {
        player.targetX = null;
        player.targetY = null;
    }

    // Actualizar movimiento continuo mediante Joystick táctil
    if (typeof TouchJoystick !== 'undefined' && TouchJoystick.active) {
        const vec = TouchJoystick.getVector();
        if (vec.dist > 0.08) {
            const lookDist = 120;
            player.targetX = player.x + vec.x * lookDist;
            player.targetY = player.y + vec.y * lookDist;
        }
    }

    if (player.targetX !== null) {
        const dx = player.targetX - player.x, dy = player.targetY - player.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 5) {
            const intendedDirection = heroDirectionFromMoveDelta(dx, dy);
            player.direction = intendedDirection;
            const speedMultiplier = player.frozen ? 0 : (player.slowedTimer > 0 ? 0.4 : 1.0);  // Reached the target position
            const move = player.speed * dt * speedMultiplier * SkillBranchSystem.playerMovementMultiplier();
            const actualMove = Math.min(move, dist);
            const nx = player.x + (dx / dist) * actualMove;
            const ny = player.y + (dy / dist) * actualMove;
            const oldX = player.x, oldY = player.y;
            movePlayerWithCollision(nx, ny);
            const movedX = player.x - oldX, movedY = player.y - oldY;
            player.moving = Math.hypot(movedX, movedY) > 0.35;
            if (player.moving) player.direction = heroDirectionFromMoveDelta(movedX, movedY);
            player.wasMoving = player.moving;
            if (actualMove > 0 && movedX === 0 && movedY === 0) player.targetX = null;
        } else {
// Check whether items await pickup
            player.targetX = null;

// Ensure within pickup range
            if (player.targetItem) {
                const item = player.targetItem;
                const finalDistance = Math.hypot(item.x - player.x, item.y - player.y);

// Pick up gold
                if (finalDistance < 100) {
                    if (item.type === 'gold') {
                        // pickupgold
                        addGold(item.val);
// Pick the item into the inventory
                        if (AutoBattle.enabled) {
                            processAutoBattleFee(item.val);
                        }
                        createDamageNumber(player.x, player.y - 40, "+" + item.val + "G", 'gold');
                        AudioSys.play('gold');
                    } else {
// Inventory full: check for high-priority items (set, unique, emergency potion) worth making space
                        if (!addItemToInventory(item)) {
// Try dropping low-value gear to make space
                            const isHighPriority = item.rarity >= 4 ||
                                (item.name === CONSUMABLE_NAME.MANA_POTION && !player.inventory.find(i => i && i.name === CONSUMABLE_NAME.MANA_POTION)) ||
                                (item.name === CONSUMABLE_NAME.HEALTH_POTION && !player.inventory.find(i => i && i.name === CONSUMABLE_NAME.HEALTH_POTION));

                            if (isHighPriority && AutoBattle.enabled) {
// Set items are never dropped
                                const forSet = item.rarity === 5;
                                let dropped = false;
                                for (let i = 0; i < player.inventory.length; i++) {
                                    const it = player.inventory[i];
                                    if (!it) continue;
// Potions and scrolls are never dropped
                                    if (it.rarity === 5) continue;
// When making room for a set, Unique (4) and Rare (3) can also be dropped
                                    if (it.type === 'potion' || it.type === 'scroll') continue;
// Non-set case: never drop Uniques; only blue and below
                                    if (forSet && it.rarity >= 3) {
                                        groundItems.push({ ...it, x: player.x + (Math.random() - 0.5) * 40, y: player.y + (Math.random() - 0.5) * 40 });
                                        player.inventory[i] = null;
                                        showNotification(`Dropped ${it.displayName || it.name} to make room`);
                                        dropped = true;
                                        break;
                                    }
// Try picking up again
                                    if (!forSet && it.rarity < 3) {
                                        groundItems.push({ ...it, x: player.x + (Math.random() - 0.5) * 40, y: player.y + (Math.random() - 0.5) * 40 });
                                        player.inventory[i] = null;
                                        showNotification(`Dropped ${it.displayName || it.name} to make room`);
                                        dropped = true;
                                        break;
                                    }
                                }
                                if (dropped) {
                                    // re-secondtry topickup
                                    if (!addItemToInventory(item)) {
                                        createFloatingText(player.x, player.y - 40, "Inventory is full!", COLORS.warning, 1.5);
                                        player.targetItem = null;
                                        return;
                                    }
                                } else {
                                    createFloatingText(player.x, player.y - 40, "Inventory is full!", COLORS.warning, 1.5);
                                    player.targetItem = null;
                                    return; // Don't remove the ground item
                                }
                            } else {
                                createFloatingText(player.x, player.y - 40, "Inventory is full!", COLORS.warning, 1.5);
                                player.targetItem = null;
                                return; // Remove the item and its UI element from the ground
                            }
                        }
                    }

// Clear the target item
                    groundItems = groundItems.filter(x => x !== item);
                    if (item.el) item.el.remove();
                    updateLabelsPosition();
                }

                player.targetItem = null; // cleargoalitem
            }
        }
    }

    const pc = Math.floor(player.x / TILE_SIZE), pr = Math.floor(player.y / TILE_SIZE);
    for (let y = pr - 8; y <= pr + 8; y++) for (let x = pc - 8; x <= pc + 8; x++) if (y >= 0 && y < MAP_HEIGHT && x >= 0 && x < MAP_WIDTH && mapData[y][x] && !visitedMap[y][x]) { visitedMap[y][x] = true; _minimapDirty = true; }
// Fireball trail particles (spawn chance adapts to quality)
    camera.x = Math.round(player.x) - getViewportWidth() / 2;
    camera.y = Math.round(player.y) - getViewportHeight() / 2;

    if (typeof Elemental3D !== 'undefined') Elemental3D.update(dt,player.graphicsQuality !== 'low',player.graphicsQuality !== 'low');
    SkillBranchSystem.update(dt);
    updateEnemies(dt);
    EnemySpatialGrid.rebuild(gameFrameId);

    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.age = (p.age || 0) + dt;
        p.life -= dt; p.x += Math.cos(p.angle) * p.speed * dt; p.y += Math.sin(p.angle) * p.speed * dt;
        if (p.branch) SkillBranchSystem.projectile(p, dt);

// Flames drift upward
        const pConfig = getParticleConfig();
        if (p.type === 'fireball' && Math.random() < pConfig.fireballTrail) {
            const trailColors = ['#ff4400', '#ff6600', '#ff8800', '#ffaa00'];
            particles.push({
                x: p.x + (Math.random() - 0.5) * 10,
                y: p.y + (Math.random() - 0.5) * 10,
                vx: -Math.cos(p.angle) * 30 + (Math.random() - 0.5) * 40,
                vy: -Math.sin(p.angle) * 30 + (Math.random() - 0.5) * 40 - 20,
                color: trailColors[Math.floor(Math.random() * trailColors.length)],
                life: 0.3 + Math.random() * 0.2,
                size: 3 + Math.random() * 3,
                gravity: -30  // Arrows already have directional trails; don't stack green dots on top.
            });
        }

// Use the unified damage function (projectile damage type inferred from the projectile kind)
        createArrowCurtainTrail(p, pConfig);

        if (!p.meteorTarget && isWall(p.x, p.y)) {
            if (p.type === 'fireball' || p.type === 'multishot') {
                emitSkillImpactBurst(p.type, p.x, p.y, p.angle, p.type === 'fireball' ? 0.75 : 0.55);
                if (p.type === 'fireball') emitFireballVisualGrowth(p.x, p.y, p.angle, p.visualTier || getSkillVisualGrowthTier('fireball'));
                if (p.type === 'multishot') emitMultishotVisualGrowth(p.x, p.y, p.angle, p.visualTier || getSkillVisualGrowthTier('multishot'));
            }
            p.life = 0;
            if (p.type !== 'fireball' && p.type !== 'multishot') createImpactParticles(p.x, p.y, '#aaa', 2, p.angle);
        }

        if (p.owner && p.owner !== player) {
            const dx = p.x - player.x, dy = p.y - player.y;
            if (dx * dx + dy * dy < (player.radius + 10) ** 2) {
// Player-fired projectiles: detect enemy hits
                const dmgType = p.type === 'lightning_ball' ? 'lightning' : 'physical';
                const projectileDamage = calculateEnemyOutgoingDamage(p.owner, p.damage);
                const dealt = playerTakeDamage(projectileDamage, p.owner, { damageType: dmgType, ignoreArmor: p.owner?.ignoreArmor, sourceName: p.sourceName });
                applyEnemyProjectileOnHit(p.owner, dealt);
                p.life = 0;
                createImpactParticles(p.x, p.y, '#bba997', 3, p.angle);
            }
        } else {
// takeDamage and skill-specific entries already own hit feedback.
            let hitTarget = null;
            const enemyCandidates = EnemySpatialGrid.queryRadius(p.x, p.y, 10);
            for (let e of enemyCandidates) {
                if (!e.dead && e !== p.owner && p.life > 0 && !p.meteorTarget && !p.hitEnemies?.has(e)) {
                    const dx = p.x - e.x, dy = p.y - e.y;
                    if (dx * dx + dy * dy < (e.radius + 10) ** 2) {
                        if (p.branch) SkillBranchSystem.hit(p, e);
                        else { takeDamage(e, p.damage, true); p.life = 0; }
                        hitTarget = e;
                        addCombo(1);
                        if (p.type === 'fireball' || p.type === 'multishot') {
                            const power = p.type === 'fireball' && player.skills.fireball >= 5 ? 1.45 : 1;
                            emitSkillImpactBurst(p.type, p.x, p.y, p.angle, power);
                            if (p.type === 'fireball') emitFireballVisualGrowth(p.x, p.y, p.angle, p.visualTier || getSkillVisualGrowthTier('fireball'));
                            if (p.type === 'multishot') emitMultishotVisualGrowth(p.x, p.y, p.angle, p.visualTier || getSkillVisualGrowthTier('multishot'));
                        }
                        if (p.freeze) { e.frozenTimer = p.freeze; createDamageNumber(e.x, e.y - 40, "Chilled!", COLORS.ice); }
// Detect destructible collisions
                        break;
                    }
                }
            }

// Mark the object as already hit
            if (!hitTarget && p.life > 0 && !p.meteorTarget) {
                for (let d of destructibles) {
                    if (!d.broken) {
                        const dx = p.x - d.x, dy = p.y - d.y;
                        if (dx * dx + dy * dy < (d.radius + 10) ** 2) {
                            DestructibleSystem.break(d);
                            if (p.branch && p.type === 'fireball') SkillBranchSystem.explosion(p, d);
                            if (p.type === 'fireball' || p.type === 'multishot') {
                                const power = p.type === 'fireball' && player.skills.fireball >= 5 ? 1.35 : 0.85;
                                emitSkillImpactBurst(p.type, p.x, p.y, p.angle, power);
                                if (p.type === 'fireball') emitFireballVisualGrowth(p.x, p.y, p.angle, p.visualTier || getSkillVisualGrowthTier('fireball'));
                                if (p.type === 'multishot') emitMultishotVisualGrowth(p.x, p.y, p.angle, p.visualTier || getSkillVisualGrowthTier('multishot'));
                            }
                            p.life = 0;
                            hitTarget = d; // Fireball explosion effect (level 5+)
                            break;
                        }
                    }
                }
            }

// Play the explosion SFX
            if (hitTarget && p.type === 'fireball' && player.skills.fireball >= 5 && !p.branch) {
                // playexplosionSFX
                AudioSys.playFireballExplosion(player.skills.fireball);

// level 5=50, level 10=100
                const explosionRadius = 50 + (player.skills.fireball - 5) * 10; // 5level=50, 10level=100
                const explosionDamageRatio = 0.2 + (player.skills.fireball - 5) * 0.04; // 5level=20%, 10level=40%
                const explosionDamage = p.damage * explosionDamageRatio;

// Create explosion particles (orange-red spread)
                const rSq = explosionRadius * explosionRadius;
                const explosionCandidates = EnemySpatialGrid.queryRadius(p.x, p.y, explosionRadius);
                explosionCandidates.forEach(e => {
                    const dx = p.x - e.x, dy = p.y - e.y;
                    if (!e.dead && e !== hitTarget && dx * dx + dy * dy < rSq) {
                        takeDamage(e, explosionDamage, true);
                    }
                });

// More particles at higher levels
                const particleCount = 10 + player.skills.fireball; // Particle speed adapts to the blast radius so visuals match the damage area
// Particle travel distance roughly equals the blast radius
                const baseSpeed = explosionRadius * 1; // random 70%-120% variation
                for (let j = 0; j < particleCount; j++) {
                    const angle = (Math.PI * 2 * j) / particleCount;
                    const speed = baseSpeed * (0.7 + Math.random() * 0.5); // Center flash effect (speed also adapts to the blast radius)
                    const colors = ['#ff4400', '#ff6600', '#ff8800', '#ffaa00', '#ff2200'];
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    particles.push({
                        x: p.x,
                        y: p.y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        color: color,
                        life: 0.5 + Math.random() * 0.3,
                        size: 3 + Math.random() * 2
                    });
                }

// Slower flash, staying in the center area
                const flashSpeed = explosionRadius * 0.5; // Particle physics update and recycling
                for (let j = 0; j < 8; j++) {
                    particles.push({
                        x: p.x,
                        y: p.y,
                        vx: (Math.random() - 0.5) * flashSpeed,
                        vy: (Math.random() - 0.5) * flashSpeed,
                        color: '#ffffff',
                        life: 0.2,
                        size: 5
                    });
                }
            }
        }

        if (p.life <= 0) {
            ProjectilePool.release(p);
            projectiles.splice(i, 1);
        }
    }

// Advanced physics particles (with Z axis)
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt;

        if (p.type === 'rising_spark') {
            p.y += p.vy * dt;
            p.vy += 50 * dt;
        } else if ((p.type === 'impact' || p.type === 'impact_facet')) {
            // Advanced physics particles (with Z axis)
            p.x += (p.vx || 0) * dt;
            p.y += (p.vy || 0) * dt;
            if (p.z !== undefined) {
                p.z += (p.vz || 0) * dt;
                p.vz -= (p.gravity || 800) * dt;

                // landingdetect
                if (p.z <= 0) {
                    p.z = 0;
                    if (Math.abs(p.vz) > 30) {
                        p.vz = -p.vz * 0.3; // reflect
                        p.vx *= 0.6; p.vy *= 0.6; // friction
                    } else {
                        // Fully landed
                        p.vz = 0; p.vx = 0; p.vy = 0;

// Mark for recycling
                        if (p.canBake && bloodCtx) {
                            const splatSize = p.size * (1.5 + Math.random());
                            drawSplatToCtx(bloodCtx, p.x, p.y, splatSize, p.color, 0.5 + Math.random() * 0.3);
                            p.life = 0; // markerreclaim
                        }
                    }
                }
            }
        } else if (p.type !== 'drop_beam') {
            if (p.vx) p.x += p.vx * dt;
            if (p.vy) p.y += p.vy * dt;
            if (p.gravity) p.vy += p.gravity * dt;
        }

        if (p.life <= 0) {
            ParticlePool.release(p);
            particles.splice(i, 1);
        }
    }

// Damage number physics update and recycling
    const maxP = getParticleConfig().maxParticles;
    while (particles.length > maxP) {
        ParticlePool.release(particles.shift());
    }

    for (let i = vfxEffects.length - 1; i >= 0; i--) {
        const fx = vfxEffects[i];
        fx.age += dt;
        if (fx.age >= fx.duration) {
            vfxEffects.splice(i, 1);
        }
    }

// --- DOM sync logic (high quality mode) ---
    for (let i = damageNumbers.length - 1; i >= 0; i--) {
        const d = damageNumbers[i];
        d.life -= dt;

        if (d.vx !== undefined) {
            d.x += d.vx * dt;
            d.y += d.vy * dt;
            d.vy += d.gravity * dt;
        } else {
            d.y -= 20 * dt;
        }

        // --- DOM synclogic (High Quality Mode) ---
        if (d.isHTML && d.el) {
            d.flickerTimer = (d.flickerTimer || 0) + dt;
            let drawX = d.x - camera.x;
            let drawY = d.y - camera.y;

            if (d.isLightning && Math.floor(d.flickerTimer * 20) % 2 === 0) {
                drawX += (Math.random() - 0.5) * 15;
                drawY += (Math.random() - 0.5) * 15;
            }

// Apply the scale effect
            d.el.style.transform = `translate(${canvasToCssX(drawX - d.sx)}px, ${canvasToCssY(drawY - d.sy)}px)`;

// Performance: reverse iteration avoids splice skipping elements
            let scale = 1;
            if (d.isPoison) scale = 0.8 + d.life * 0.2;
            else if (d.isIce) scale = 1.1 - (d.maxLife - d.life) * 0.2;
            else if (d.isLightning) scale = 1.2 + Math.sin(d.flickerTimer * 40) * 0.2;
            else scale = 1 + d.life * 0.1;

            d.el.style.transform += ` scale(${scale})`;
            d.el.style.opacity = d.life > 0.4 ? 1 : d.life / 0.4;
        }

        if (d.life <= 0) {
            if (d.isHTML && d.el) d.el.remove();
            DamageNumberPool.release(d);
            damageNumbers.splice(i, 1);
        }
    }

// Screen shake update
    for (let i = slashEffects.length - 1; i >= 0; i--) { const s = slashEffects[i]; s.life -= dt * (s.depthSweep ? 3.2 : 5); if (s.life <= 0) slashEffects.splice(i, 1); }

// Gradually weaken
    if (screenShake.duration > 0) {
        screenShake.duration -= dt;
        screenShake.intensity *= 0.9;  // Level-up VFX update
    }

    // upgradeVFXUpdate
    if (levelUpEffect.active) {
        levelUpEffect.timer -= dt;
        levelUpEffect.flashAlpha -= dt * 1.2;  // Enemy cleanup moved to the periodic sweeper (every 3s) with pool recycling
        if (levelUpEffect.timer <= 0) {
            levelUpEffect.active = false;
            levelUpEffect.flashAlpha = 0;
        }
    }

// Update destructibles

// Performance: for loops instead of forEach
    DestructibleSystem.update(dt);

    updateUI();
}

function updateEnemies(dt) {
    processScheduledMonsterAttacks(dt);

    // performance optimization:use for loopin place ofon behalf of forEach
    for (let idx = 0, len = enemies.length; idx < len; idx++) {
        const e = enemies[idx];
        if (e.dead) {
            if (e.deathVisualTimer > 0) {
                e.deathVisualTimer = Math.max(0, e.deathVisualTimer - dt);
                if (e.hitReactTimer > 0) e.hitReactTimer = Math.max(0, e.hitReactTimer - dt);
            }
            continue;
        }
        e.monsterAnimTime = (e.monsterAnimTime || 0) + dt;
        if (e.bossSkillVisual?.timer > 0) e.bossSkillVisual.timer = Math.max(0, e.bossSkillVisual.timer - dt);
        if (e.monsterActionTimer > 0) {
            e.monsterActionTimer -= dt;
            if (e.monsterActionTimer <= 0) {
                e.monsterActionTimer = 0;
                e.monsterActionDuration = 0;
                e.monsterAction = null;
            }
        }
        if (e.actionDirectionTimer > 0) {
            e.actionDirectionTimer -= dt;
            if (e.actionDirectionTimer <= 0) {
                e.actionDirectionTimer = 0;
                e.actionDirection = null;
            }
        }
        if (e.facingLockTimer > 0) e.facingLockTimer -= dt;
        const prevEnemyX = e.x;
        const prevEnemyY = e.y;
        if (e.hitFlashTimer > 0) e.hitFlashTimer -= dt; // Juice visual restore logic
        if (e.hitReactTimer > 0) e.hitReactTimer -= dt;

// Smoothly restore to 1.0
        if (e.juiceScaleTimer > 0) {
            e.juiceScaleTimer -= dt;
// Handle poison damage (DoT)
            e.juiceScale += (1.0 - e.juiceScale) * 0.2;
            if (e.juiceScaleTimer <= 0) e.juiceScale = 1.0;
        }

// Boss skill cooldown update
        if (e.poisoned && e.poisonTimer > 0) {
            e.poisonTimer -= dt;
            if (!e.lastPoisonTick) e.lastPoisonTick = 0;
            e.lastPoisonTick += dt;
            if (e.lastPoisonTick >= 0.5) {
                e.lastPoisonTick = 0;
                const pDmg = Math.max(1, Math.floor(e.poisonDamagePerTick || 1));
                e.hp -= pDmg;
                createDamageNumber(e.x, e.y, pDmg, COLORS.poison, null, e);
                if (e.hp <= 0) {
                    finalizeEnemyDeath(e, pDmg);
                    continue;
                }
            }
            if (e.poisonTimer <= 0) e.poisoned = false;
        }

        if (e.frozenTimer > 0) { e.frozenTimer -= dt; e.wasMoving = false; continue; }
        if (e.slowedTimer > 0) e.slowedTimer -= dt;
        if (e.moraleTimer > 0) e.moraleTimer -= dt;
        if (e.fleeYellTimer > 0) e.fleeYellTimer -= dt;
        if (e.scatterVolleyCooldown > 0) e.scatterVolleyCooldown -= dt;
        if (e.lightningOverloadTimer > 0) e.lightningOverloadTimer -= dt;
        if (e.cooldown > 0) e.cooldown -= dt;

        if (typeof CombatTactics !== 'undefined' && CombatTactics.tick(e, dt)) continue;
        if (e.combatCue) { e.wasMoving = false; continue; }

// Boss skill logic
        if (e.isBoss && e.bossCooldowns) {
            for (const key in e.bossCooldowns) {
                if (!key.endsWith('Max') && e.bossCooldowns[key] > 0) {
                    e.bossCooldowns[key] -= dt;
                }
            }
            // Boss skilllogic
            updateBossSkills(e, dt);
            if (e.pendingSkill || e.recoveryTimer > 0) { e.wasMoving = false; continue; }
        }

        const speedMultiplier = (e.slowedTimer > 0 ? 0.4 : 1.0) * (e.moraleTimer > 0 ? 1.25 : 1.0) * SkillBranchSystem.speedMultiplier(e, dt);
        const currentSpeed = e.speed * speedMultiplier;

        const dx = player.x - e.x, dy = player.y - e.y;
        const distSq = dx * dx + dy * dy;

        if (e.ai === 'ranged') {
            const hasLOS = hasLineOfSight(e.x, e.y, player.x, player.y);
            if (distSq < 22500) {
                // toonear，afterretreat (150^2 = 22500)
                const dist = Math.sqrt(distSq);
                if (dist > 0) {
                    setMonsterFacingToward(e, player.x, player.y, 0.12);
                    const beforeRetreatX = e.x;
                    const beforeRetreatY = e.y;
                    const moveX = e.x - (dx / dist) * currentSpeed * dt;
                    const moveY = e.y - (dy / dist) * currentSpeed * dt;
                    moveEnemyWithCollision(e, moveX, moveY);
                    const retreated = Math.hypot(e.x - beforeRetreatX, e.y - beforeRetreatY) > 0.5;
                    if (!retreated && hasLOS && e.cooldown <= 0) {
                        startRangedEnemyAttack(e);
                    }
                }
            } else if (distSq < 160000 && hasLOS) {
                // Shoots only with line of sight (400^2 = 160000)
                // Shoots only with line of sight
                startRangedEnemyAttack(e);
            } else if (distSq < 160000 && !hasLOS) { // 400^2 = 160000
                // noline of sight，try tolean onnear
                const dist = Math.sqrt(distSq);
                const nx = e.x + (dx / dist) * currentSpeed * dt;
                const ny = e.y + (dy / dist) * currentSpeed * dt;
                moveEnemyWithCollision(e, nx, ny);
            }
        } else if (e.ai === 'revive') {
            for (let mi = 0; mi < enemies.length; mi++) {
                const ally = enemies[mi];
                if (!ally.dead && ally.monsterType === 'melee' && Math.hypot(ally.x - e.x, ally.y - e.y) < 180) {
                    ally.moraleTimer = Math.max(ally.moraleTimer || 0, 0.6);
                }
            }
            if (e.cooldown <= 0) {
// Adjust the revive position to keep distance from the hero
                const body = enemies.find(other => other.dead && !other.isBoss && Math.hypot(other.x - e.x, other.y - e.y) < 200);
                if (body) {
                    startMonsterAttack(e, {
                        duration: 0.85,
                        impactDelay: 0.85,
                        tactic: 'revive',
                        targetX: body.x,
                        targetY: body.y,
                        resolve: () => {
                            if (!body.dead || body.isBoss || !enemies.includes(body)) return;
                            body.dead = false;
                            body.hp = body.maxHp;
                            body.deathVisualTimer = 0;

// If the corpse is too close, push the revive position 150-250px away from the hero
                            const distToPlayer = Math.hypot(body.x - player.x, body.y - player.y);
                            if (distToPlayer < 150) {
// 150-250px distance
                                const angle = Math.atan2(body.y - player.y, body.x - player.x);
                                const newDist = 150 + Math.random() * 100; // 150-250pixeldistance
                                body.x = player.x + Math.cos(angle) * newDist;
                                body.y = player.y + Math.sin(angle) * newDist;

// Try to find a non-wall spot nearby
                                if (isWall(body.x, body.y)) {
// If still nothing, keep the original position
                                    let foundPos = false;
                                    for (let angleOffset = 0; angleOffset < Math.PI * 2; angleOffset += Math.PI / 4) {
                                        const testX = player.x + Math.cos(angle + angleOffset) * newDist;
                                        const testY = player.y + Math.sin(angle + angleOffset) * newDist;
                                        if (!isWall(testX, testY)) {
                                            body.x = testX;
                                            body.y = testY;
                                            foundPos = true;
                                            break;
                                        }
                                    }
                                    // If still not found, keep the original position
                                    if (!foundPos) {
                                        body.x = player.x + Math.cos(angle) * newDist;
                                        body.y = player.y + Math.sin(angle) * newDist;
                                    }
                                }
                            }

                            createDamageNumber(body.x, body.y - 20, "Revived!", COLORS.revive);
                        }
                    });
                    e.cooldown = 5.0;
                    continue;
                }
            }
            if (distSq < 90000 && distSq > 10000) { // 300^2=90000, 100^2=10000
                const dist = Math.sqrt(distSq);
                const nx = e.x + (dx / dist) * currentSpeed * dt, ny = e.y + (dy / dist) * currentSpeed * dt;
                moveEnemyWithCollision(e, nx, ny);
            }
        } else if (e.ai === 'phase') {
            // Ghost AI: can pass through walls and chases the player in a straight line
            if (distSq < 160000 && distSq > 1225) { // 400^2=160000, 35^2=1225
                const dist = Math.sqrt(distSq);
                e.x += (dx / dist) * currentSpeed * dt;
                e.y += (dy / dist) * currentSpeed * dt;
            }
            if (distSq <= 1600 && e.cooldown <= 0) { // 40^2 = 1600
                startMonsterAttack(e, {
                    duration: 0.38,
                    impactDelay: 0.18,
                    telegraph: 'melee',
                    targetX: player.x,
                    targetY: player.y,
                    resolve: (attacker) => {
                        resolveEnemyMeleeImpact(attacker, { rangeSq: 1800 });
                    }
                });
                e.cooldown = 1.5;
            }
        } else if (e.ai === 'vampire') {
// Locked-route dashes run through the same telegraph and hit pipeline.
            if (!e.dashCooldown) e.dashCooldown = 0;
            if (e.dashCooldown > 0) e.dashCooldown -= dt;

// Non-dash state
            if (e.isDashing) {
                CombatTactics.charge(e, dt);
            } else {
                // Non-dash state
                if (distSq < 40000 && distSq > 1600 && e.dashCooldown <= 0) { // 200^2=40000, 40^2=1600
                    CombatTactics.beginCharge(e);
                } else if (distSq < 160000 && distSq > 10000) { // 400^2=160000, 100^2=10000
                    // gradualslowlean onnear
                    const dist = Math.sqrt(distSq);
                    const nx = e.x + (dx / dist) * currentSpeed * dt;
                    const ny = e.y + (dy / dist) * currentSpeed * dt;
                    moveEnemyWithCollision(e, nx, ny);
                } else if (distSq <= 1600 && e.cooldown <= 0) { // 40^2 = 1600
// Wall clipping only for approach; on losing sight, exit the wall first - never flee deeper into it.
                    startMonsterAttack(e, {
                        duration: 0.38,
                        impactDelay: 0.18,
                        telegraph: 'melee',
                        targetX: player.x,
                        targetY: player.y,
                        resolve: (attacker) => {
                            resolveEnemyMeleeImpact(attacker, { lifeStealFallback: 0.2, rangeSq: 1800 });
                        }
                    });
                    e.cooldown = 1.5;
                }
            }
        } else if (e.ai === 'specter') {
// Retreat preserves body space with stepped checks so long frames can't cross walls; no corner paths that lose sight.
            const clearBody = !isWall(e.x, e.y) &&
                !isWall(e.x - e.radius, e.y - e.radius) && !isWall(e.x + e.radius, e.y - e.radius) &&
                !isWall(e.x - e.radius, e.y + e.radius) && !isWall(e.x + e.radius, e.y + e.radius);
            const hasLOS = clearBody && hasLineOfSight(e.x, e.y, player.x, player.y) &&
                hasLineOfSight(player.x, player.y, e.x, e.y);
            let retreated = false;
            if (distSq < 14400 && distSq > 0 && hasLOS) {
                const dist = Math.sqrt(distSq);
                setMonsterFacingToward(e, player.x, player.y, 0.12);
                const distance = currentSpeed * dt;
                const steps = Math.max(1, Math.ceil(distance / 6));
                const stepX = -(dx / dist) * distance / steps;
                const stepY = -(dy / dist) * distance / steps;
                for (let step = 0; step < steps; step++) {
                    const nx = e.x + stepX, ny = e.y + stepY;
// can fight back in place even when the retreat is blocked
                    if (isWall(nx, ny) || isWall(nx - e.radius, ny - e.radius) ||
                        isWall(nx + e.radius, ny - e.radius) || isWall(nx - e.radius, ny + e.radius) ||
                        isWall(nx + e.radius, ny + e.radius) || !hasLineOfSight(nx, ny, player.x, player.y) ||
                        !hasLineOfSight(player.x, player.y, nx, ny)) break;
                    e.x = nx; e.y = ny; retreated = true;
                }
            }
            if (!retreated && distSq < 122500 && hasLOS) { // can fight back in place even when the retreat is blocked
// lightning ball type
                if (e.cooldown <= 0) {
                    startMonsterAttack(e, {
                        duration: 0.42,
                        impactDelay: 0.18,
                        telegraph: 'projectile',
                        telegraphVfx: CAST_SOURCE_VFX.enemyLightning,
                        telegraphScale: 0.58,
                        targetX: player.x,
                        targetY: player.y,
                        resolve: (attacker, aim) => {
                            const angle = aim.angle;
                            spawnCastSourceVfx(CAST_SOURCE_VFX.enemyLightning, attacker.x, attacker.y, angle, 0.78, 16, 30);
                            const boltCount = attacker.multiShot || 1;
                            const spread = boltCount > 1 ? 0.2 : 0;
                            for (let shotIndex = 0; shotIndex < boltCount; shotIndex++) {
                                const shotAngle = angle + (shotIndex - (boltCount - 1) / 2) * spread;
                                projectiles.push(ProjectilePool.acquire({
                                    x: attacker.x + Math.cos(angle) * 16,
                                    y: attacker.y - 32 + Math.sin(angle) * 8,
                                    angle: shotAngle,
                                    speed: 280,
                                    life: 2,
                                    damage: attacker.dmg,
                                    color: '#66ccff',
                                    owner: attacker,
                                    sourceName: attacker.name,
                                    type: 'lightning_ball'  // lightning ball type
                                }));
                            }
                            // Launch SFX (soft version)
                            AudioSys.play('enemy_lightning_cast');
                        }
                    });
                    e.cooldown = 1.8;
                }
            } else if (distSq > 0 && distSq < 202500 && (!hasLOS || distSq >= 122500)) { // 450^2 = 202500
// Normal chase AI
                const dist = Math.sqrt(distSq);
                const travel = Math.min(dist, currentSpeed * dt);
                e.x += (dx / dist) * travel;
                e.y += (dy / dist) * travel;
            }
        } else {
            // normalchase AI
            const shouldFlee = e.monsterType === 'melee' && !e.isElite && e.hp / e.maxHp < 0.35 && distSq < 62500;
            if (shouldFlee) {
                const dist = Math.sqrt(distSq);
                const fleeSpeed = currentSpeed * 1.15;
                const nx = e.x - (dx / dist) * fleeSpeed * dt;
                const ny = e.y - (dy / dist) * fleeSpeed * dt;
                moveEnemyWithCollision(e, nx, ny);
                if (!(e.fleeYellTimer > 0)) {
                    createDamageNumber(e.x, e.y - 22, "Fleeing!", '#ffcc66');
                    e.fleeYellTimer = 2.5;
                }
            } else if (distSq < GAME_CONFIG.MONSTER_CHASE_RANGE_SQ && distSq > GAME_CONFIG.MONSTER_DISENGAGE_RANGE_SQ) {
                const dist = Math.sqrt(distSq);
                const nx = e.x + (dx / dist) * currentSpeed * dt, ny = e.y + (dy / dist) * currentSpeed * dt;
                moveEnemyWithCollision(e, nx, ny);
            }
            if (!shouldFlee && distSq <= GAME_CONFIG.MONSTER_MELEE_RANGE_SQ && e.cooldown <= 0) {
                startMonsterAttack(e, {
                    duration: e.slamHit ? 0.7 : 0.38,
                    impactDelay: e.slamHit ? 0.7 : 0.18,
                    tactic: e.slamHit ? 'heavy' : null,
                    telegraph: 'melee',
                    targetX: player.x,
                    targetY: player.y,
                    resolve: (attacker) => {
                        resolveEnemyMeleeImpact(attacker, {
                            damageMultiplier: attacker.slamHit ? 1.35 : 1,
                            slamHit: attacker.slamHit,
                            rangeSq: GAME_CONFIG.MONSTER_MELEE_RANGE_SQ
                        });
                    }
                });
                e.cooldown = e.slamHit ? 2.1 : 1.5;
            }
        }
        const movedX = e.x - prevEnemyX;
        const movedY = e.y - prevEnemyY;
        e.wasMoving = Math.hypot(movedX, movedY) > 0.35;
        if (e.wasMoving && !(e.actionDirectionTimer > 0) && !(e.facingLockTimer > 0)) {
            e.facingDirection = directionFromDelta(movedX, movedY);
            if (e.facingDirection === 'left' || e.facingDirection === 'right') {
                e.lastSideDirection = e.facingDirection;
            }
        }
    }
}

// --- Rendering ---
function draw() {
    const loadingOverlay=document.getElementById('art-loading');
    loadingOverlay.hidden=ArtSamples.pending===0&&!ArtSamples.loadError;
    const loadingText=ArtSamples.loadError?'Failed to load area assets, please refresh and retry':'Loading area assets…';
    if(loadingOverlay.textContent!==loadingText)loadingOverlay.textContent=loadingText;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    applyRenderViewportTransform();
    const viewportWidth = getViewportWidth();
    const viewportHeight = getViewportHeight();

    // screen shakeeffect
    let shakeX = 0, shakeY = 0;
    if (screenShake.duration > 0) {
        shakeX = (Math.random() - 0.5) * screenShake.intensity * 2;
        shakeY = (Math.random() - 0.5) * screenShake.intensity * 2;
    }

// Draw the map from the offscreen canvas cache (performance: from 5000+ ctx calls per frame down to 1)
    ctx.save(); ctx.translate(-camera.x + shakeX, -camera.y + shakeY);
    const activeBiome = getBiomeStyle(player.isInHell ? player.hellFloor : player.floor);

// Compute the source region (cropped from the cache)
    let mapDrawn = false;
    if (mapCacheValid && mapCacheCanvas) {
// Source coords (in the cache), clamped to valid ranges
        const cacheW = mapCacheCanvas.width;
        const cacheH = mapCacheCanvas.height;

// Target coords (on the canvas)
        const srcX = Math.max(0, Math.floor(camera.x));
        const srcY = Math.max(0, Math.floor(camera.y));

// Draw width/height
        const dstX = Math.max(0, -Math.floor(camera.x));
        const dstY = Math.max(0, -Math.floor(camera.y));

// Fallback when the cache is invalid or drawing fails
        const drawW = Math.min(viewportWidth - dstX, cacheW - srcX);
        const drawH = Math.min(viewportHeight - dstY, cacheH - srcY);

        if (drawW > 0 && drawH > 0) {
            ctx.drawImage(mapCacheCanvas, srcX, srcY, drawW, drawH, srcX, srcY, drawW, drawH);
            mapDrawn = true;
        }
    }

    // Fallback when the cache is invalid or drawing fails
    if (!mapDrawn) {
        const sc = Math.floor(camera.x / TILE_SIZE), ec = sc + (viewportWidth / TILE_SIZE) + 1;
        const sr = Math.floor(camera.y / TILE_SIZE), er = sr + (viewportHeight / TILE_SIZE) + 1;
        const fallbackBiome = getBiomeStyle(player.floor);
        const fallbackTown = isInTown();

        for (let r = sr - 1; r < er + 1; r++) {
            for (let c = sc - 1; c < ec + 1; c++) {
                if (r >= 0 && r < MAP_HEIGHT && c >= 0 && c < MAP_WIDTH) {
                    const x = c * TILE_SIZE, y = r * TILE_SIZE;
                    if (mapData[r][c] === 0) {
                        ctx.fillStyle = COLORS.wall;
                        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                        if (!isWallBoundaryTile(c, r)) {
                            ctx.fillStyle = 'rgba(0,0,0,0.35)';
                            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                        }
                        if (fallbackTown) drawTownWallDetails(ctx, x, y, c, r);
                        else drawDungeonWallDetails(ctx, x, y, c, r, fallbackBiome);
                    } else {
                        ctx.fillStyle = ((c + r) % 2 === 0) ? '#151515' : '#1a1a1a';
                        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                        if (fallbackTown) drawTownFloorDetails(ctx, x, y, c, r);
                        else drawDungeonFloorDetails(ctx, x, y, c, r, fallbackBiome);
                    }
                }
            }
        }
    }

    // Render Exits
    if (isInTown()) {
// Hell mode: show the Hell entrance and exit
        drawDungeonExit(dungeonExit.x, dungeonExit.y, `Go to ${getFloorName(1)}`);
    } else if (player.isInHell) {
// Normal dungeon: show the dungeon entrance and exit
        const nextHellFloor = player.hellFloor + 1;
        let exitLabel = player.hellFloor >= 10 ? "Return to Rogue Encampment" : `Go to ${getFloorName(nextHellFloor, true)}`;
        drawDungeonExit(dungeonExit.x, dungeonExit.y, exitLabel);

        const prevHellFloor = player.hellFloor - 1;
        let entranceLabel = player.hellFloor === 1 ? "Return to Rogue Encampment" : `Back to ${getFloorName(prevHellFloor, true)}`;
        drawDungeonEntrance(dungeonEntrance.x, dungeonEntrance.y, entranceLabel);
    } else {
// Portals show only in normal dungeons, never in Hell
        const nextFloor = player.floor + 1;
        let exitLabel = `Go to ${getFloorName(nextFloor)}`;
        drawDungeonExit(dungeonExit.x, dungeonExit.y, exitLabel);

        const prevFloor = player.floor - 1;
        let entranceLabel = player.floor === 1 ? "Go to Rogue Encampment" : `Back to ${getFloorName(prevFloor)}`;
        drawDungeonEntrance(dungeonEntrance.x, dungeonEntrance.y, entranceLabel);
    }

// Render the waypoint
    if (townPortal && townPortal.activeFloor === player.floor && !player.isInHell) {
        const portalPos = getPortalDisplayPosition();
        if (portalPos) {
            let label = player.floor === 0 ? 'Portal' : 'Portal (to Rogue Encampment)';
            drawPortal(portalPos.x, portalPos.y, label);
        }
    }

// Render NPCs (each NPC owns a 4-direction dynamic spritesheet, decoupled from the player paperdoll)
    if (currentWaypoint) {
        const isWpActive = player.activatedWaypoints && player.activatedWaypoints.includes(currentWaypoint.floor);
        drawWaypoint(currentWaypoint.x, currentWaypoint.y, currentWaypoint.floor, isWpActive);
    }

    drawDungeonLightSources(ctx, activeBiome);

    // Render NPCs (each NPC owns a 4-direction dynamic spritesheet, decoupled from the player paperdoll)
    for (let ni = 0, nLen = npcs.length; ni < nLen; ni++) {
        const n = npcs[ni];
        const nx = Math.round(n.x);
        const ny = Math.round(n.y);
        const npcLabelY = ny - ACTOR_RENDER_SIZE - 32;
        drawContactShadow(ctx, nx, ny - 2, 32, 8, 0.24);

        const { body: npcBodyImg, head: npcHeadImg } = (typeof NPCSpriteSystem !== 'undefined')
            ? NPCSpriteSystem.getSprite(n, ni)
            : { body: null, head: null };

        if (npcBodyImg && npcBodyImg.complete && npcBodyImg.naturalWidth > 0) {
            const rowMap = { 'front': 0, 'frontLeft': 1, 'frontRight': 2, 'left': 1, 'backLeft': 1, 'right': 2, 'backRight': 2, 'back': 3 };
            const nDir = n.dir || n.defaultDir || 'front';
            const row = rowMap[nDir] !== undefined ? rowMap[nDir] : 0;
            const col = n.isMoving ? Math.floor(((n.animTime || 0) * 8) % 4) : 0;
            const motionPose = getPaperdollMotionPose(n, !!n.isMoving, n.animTime);
            const bodyRect = getNPCSpriteCellRect(npcBodyImg, row, col);
            const renderH = ACTOR_RENDER_SIZE;
            const renderW = renderH;

            const headLoaded = npcHeadImg && npcHeadImg.complete && npcHeadImg.naturalWidth > 0;
            const headRect = headLoaded ? getNPCSpriteCellRect(npcHeadImg, row, col) : { x: 0, y: 0, width: 0, height: 0 };
            const headCalibration = n.headCalibration || PaperdollSystem.calibration.head;
            const neckAnchor = headLoaded
                ? (n.headNeckAnchors?.[row]?.[col] || getNPCNeckAnchor(n, npcBodyImg, npcHeadImg, row, col, renderW, renderH * (headCalibration.directionalScales?.[nDir] || headCalibration.scale || 0.54)))
                : NPC_FALLBACK_NECK_ANCHOR;
            const headDirectionalOffset = headCalibration.directionalOffsets?.[nDir] || { x: 0, y: -35 };
            const baseHeight = PaperdollSystem.calibration.baseHeight || 96;
            const scaleRatio = renderH / baseHeight;
            const headRenderH = renderH *
                (headCalibration.directionalScales?.[nDir] || headCalibration.scale || 0.54);
            const directionalHeadOffsetX = (headDirectionalOffset.x || 0) * scaleRatio;
            const actorFrame = n.renderCompositeFrame || (n.renderCompositeFrame = {
                layers: [
                    { source: npcBodyImg, frame: { ...bodyRect }, drawW: renderW, drawH: renderH, anchorBottom: true },
                    { source: null, frame: { x: bodyRect.x, y: bodyRect.y, width: bodyRect.width, height: Math.floor(bodyRect.height * 0.44) }, drawW: renderW, drawH: renderH * 0.44 },
                    { source: null, frame: { ...headRect }, drawW: headRenderH, drawH: headRenderH, anchorX: 0, anchorY: 0 }
                ]
            });
            const bodyLayer = actorFrame.layers[0];
            bodyLayer.source = npcBodyImg;
            bodyLayer.frame.x = bodyRect.x;
            bodyLayer.frame.y = bodyRect.y;
            bodyLayer.frame.width = bodyRect.width;
            bodyLayer.frame.height = bodyRect.height;
            bodyLayer.drawW = renderW;
            bodyLayer.drawH = renderH;

            const chestLayer = actorFrame.layers[1];
            chestLayer.source = row === 3 ? null : npcBodyImg;
            if (row !== 3) {
                const chestRatio = 0.44;
                const topSrcH = Math.floor(bodyRect.height * chestRatio);
                chestLayer.frame.x = bodyRect.x;
                chestLayer.frame.y = bodyRect.y;
                chestLayer.frame.width = bodyRect.width;
                chestLayer.frame.height = topSrcH;
                chestLayer.drawH = renderH * chestRatio * motionPose.chestScaleY;
                chestLayer.drawW = renderH * motionPose.chestScaleX;
                chestLayer.offsetX = 0;
                chestLayer.offsetY = renderH * chestRatio - chestLayer.drawH;
            }

            const headLayer = actorFrame.layers[2];
            headLayer.source = headLoaded ? npcHeadImg : null;
            if (headLoaded) {
                headLayer.frame.x = headRect.x;
                headLayer.frame.y = headRect.y;
                headLayer.frame.width = headRect.width;
                headLayer.frame.height = headRect.height;
                headLayer.drawW = headRenderH;
                headLayer.drawH = headRenderH;
                if (chestLayer.source) {
                    const chestRatio = 0.44;
                    const sourceChestHeight = Math.floor(bodyRect.height * chestRatio);
                    const chestScaleX = chestLayer.drawW / bodyRect.width;
                    const chestScaleY = chestLayer.drawH / sourceChestHeight;
                    const neckX = chestLayer.offsetX + (neckAnchor.x - 0.5) * chestLayer.drawW;
                    const neckY = chestLayer.offsetY + neckAnchor.y * bodyRect.height * chestScaleY;
                    headLayer.anchorX = neckX + (0.5 - neckAnchor.headX) * headRenderH + directionalHeadOffsetX;
                    headLayer.anchorY = neckY;
                } else {
                    headLayer.anchorX = (neckAnchor.x - 0.5) * renderW + (0.5 - neckAnchor.headX) * headRenderH + directionalHeadOffsetX;
                    headLayer.anchorY = neckAnchor.y * renderH;
                }
            }

            // NPC body/head y jugador Paperdoll comparten el mismo compositor de capas.
            drawActorSprite(ctx, null, actorFrame, nx, ny - renderH, renderW, renderH);
        } else {
            const paintedNpc = EnvironmentArt.npc(n.type);
            if (paintedNpc) {
                const b = paintedNpc.contentBounds;
                const h = ACTOR_RENDER_SIZE, w = h * b.sw / b.sh;
                const frame = n.renderFallbackFrame || (n.renderFallbackFrame = { x: b.sx, y: b.sy, width: b.sw, height: b.sh });
                frame.x = b.sx; frame.y = b.sy; frame.width = b.sw; frame.height = b.sh;
                drawActorSprite(ctx, paintedNpc.source, frame, nx, ny - h, w, h);
            } else if (spritesLoaded && processedSpriteSheet && n.frameIndex !== undefined) {
                const frame = getNPCFrame(n.frameIndex);
                const renderHeight = ACTOR_RENDER_SIZE;
                const renderWidth = renderHeight * frame.width / frame.height;
                drawActorSprite(ctx, processedSpriteSheet, frame, nx, ny - renderHeight, renderWidth, renderHeight);
            } else {
                ctx.fillStyle = COLORS.npc; ctx.beginPath(); ctx.arc(nx, ny, 15, 0, Math.PI * 2); ctx.fill();
            }
        }

        // Quest Indicators (above name)
        if (n.type === 'healer') {
            if (player.questState === 0) {
                ctx.fillStyle = '#ffff00'; ctx.font = '20px Arial'; ctx.fillText("!", nx, npcLabelY - 18);
            } else if (player.questState === 2) {
                ctx.fillStyle = '#ffff00'; ctx.font = '20px Arial'; ctx.fillText("?", nx, npcLabelY - 18);
            }
        }

        // Name (above character)
        const npcNameKey = NPC_NAME_KEYS[n.type];
        const npcDisplayName = npcNameKey && typeof I18N !== 'undefined' ? I18N.t(npcNameKey) : n.name;
        ctx.fillStyle = '#fff'; ctx.font = '12px Cinzel'; ctx.textAlign = 'center'; ctx.fillText(npcDisplayName, nx, npcLabelY);

        // Abyss warden special display: weekly champion
        if (n.type === 'difficulty' && typeof AbyssSystem !== 'undefined') {
            const champion = AbyssSystem.currentChampion || 'Awaiting a Champion';
            ctx.save();
            ctx.font = '10px Cinzel';
            ctx.fillStyle = '#ff8800';
            ctx.shadowColor = '#ff4400';
            ctx.shadowBlur = 8;
            ctx.fillText(`🔥 Weekly champion: ${champion}`, nx, npcLabelY - 18);
            ctx.restore();
        }
    }

    // Render stalls (Rogue Encampment only)
    if (isInTown() && typeof MarketSystem !== 'undefined') {
        MarketSystem.drawStalls(ctx);
    }

    // Render offscreen blood layer (used to loop hundreds of objects; now a single drawImage)
    if (bloodCanvas) {
        const sx = Math.max(0, camera.x);
        const sy = Math.max(0, camera.y);
        const sw = Math.min(bloodCanvas.width - sx, viewportWidth);
        const sh = Math.min(bloodCanvas.height - sy, viewportHeight);
        if (sw > 0 && sh > 0) {
            ctx.drawImage(bloodCanvas, sx, sy, sw, sh, sx, sy, sw, sh);
        }
    }

    if (typeof Elemental3D !== 'undefined') Elemental3D.ground(ctx,projectiles,SkillBranchSystem.areas,{x:camera.x,y:camera.y,width:viewportWidth,height:viewportHeight},player.graphicsQuality !== 'low',player.graphicsQuality !== 'low');
// Draw lightning VFX (drawn on the topmost layer for visibility)
    drawGroundItems(ctx);
    DestructibleSystem.draw(ctx, 'behindPlayer');
    drawScenicProps(ctx, 'behindPlayer');

    renderEnemies.length = 0;
    for (let ei = 0, eLen = enemies.length; ei < eLen; ei++) {
        const e = enemies[ei];
        if (e.dead && !(e.deathVisualTimer > 0)) continue;
        if (e.x < camera.x - 100 || e.x > camera.x + viewportWidth + 100 ||
            e.y < camera.y - 120 || e.y > camera.y + viewportHeight + 100) continue;
        renderEnemies.push(e);
    }
    renderEnemies.sort((a, b) => a.y - b.y);

    for (let ei = 0, eLen = renderEnemies.length; ei < eLen; ei++) {
        const e = renderEnemies[ei];
        if (e.y > player.y + 4) continue;
        drawEnemyActor(ctx, e);
    }
// Draw polylines through the point sets
    if (player.activeLightning && player.activeLightning.life > 0) {
        const l = player.activeLightning;
        ctx.save();
        ctx.beginPath();
// Style: bright white core, blue glow
        if (l.points.length > 0) {
            ctx.moveTo(l.points[0].x, l.points[0].y);
            for (let i = 1; i < l.points.length; i++) {
                ctx.lineTo(l.points[i].x, l.points[i].y);
            }
        }

// Outer glow
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // outsideglow
        setGlow(ctx, 15, '#0088ff');

// Fast flicker
        ctx.strokeStyle = '#0088ff';
        ctx.lineWidth = 6;
        ctx.globalAlpha = l.life * 2; // Thin line core (white)
        ctx.stroke();

        // finelinecore (plaincolor)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.globalAlpha = l.life * 3;
        ctx.stroke();

        ctx.restore();

// Lasts about 20 frames
        l.life -= 0.05; // durationapprox 20 frame
    }


    if (player.targetX !== null) { ctx.strokeStyle = '#333'; ctx.beginPath(); ctx.arc(player.targetX, player.targetY, 5, 0, Math.PI * 2); ctx.stroke(); }
    const px = Math.round(player.x);
    const py = Math.round(player.y);

    drawPlayerShieldBack(ctx, px, py);
    const heroFrame = getHeroFrame(player.direction);
    if ((heroFrame && heroFrame.layers && heroFrame.layers.length > 0) || heroFrame.source || (heroSpritesLoaded && processedHeroSprites) || (spritesLoaded && processedSpriteSheet)) {
        const frame = heroFrame;
        const useHeroSheet = (frame.layers && frame.layers.length > 0) || !!frame.source || (heroSpritesLoaded && processedHeroSprites && frame.animated);
        const renderHeight = useHeroSheet ? HERO_SPRITE_CONFIG.renderSize : ACTOR_RENDER_SIZE;
        const renderWidth = renderHeight * frame.width / frame.height;
        const scale = useHeroSheet ? 1 : 1 + player.attackAnim * 0.2;

        let source = useHeroSheet ? processedHeroSprites : processedSpriteSheet;
        let tint = null;
        if (player.isDead) tint = null;
        else if (player.heroAction === 'hurt' && player.heroActionTimer > 0) tint = 'white';
        else if (player.frozen || player.slowedTimer > 0) tint = 'ice';
        else if (player.poisoned) tint = 'poison';
        else if (player.lightningOverloadTimer > 0 && Math.floor(Date.now() / 50) % 2 === 0) tint = 'lightning';
        if (!useHeroSheet && tint) {
            source = TintCache[tint];
            tint = null;
        }

        const isPlayerStalling = typeof MarketSystem !== 'undefined' && MarketSystem.isStalling;
        drawContactShadow(ctx, px, py - 2, useHeroSheet ? 44 : 30, useHeroSheet ? 12 : 8, isPlayerStalling ? 0.22 : 0.3);
        if (!isPlayerStalling && !player.isDead) drawPlayerDisciplineAura(ctx, px, py);

        if (typeof MarketSystem !== 'undefined' && MarketSystem.isStalling) {
            drawActorSprite(ctx, source, frame, px, py - renderHeight / (frame.source ? 1 : 2) + (frame.offsetY || 0), renderWidth, renderHeight, tint);
        } else if (scale === 1) {
            drawActorSprite(ctx, source, frame, px, py - renderHeight + (frame.offsetY || 0), renderWidth, renderHeight, tint);
        } else {
            ctx.save();
            ctx.translate(px, py - renderHeight / 2 + (frame.offsetY || 0));
            ctx.scale(scale, scale);
            drawActorSprite(ctx, source, frame, 0, -renderHeight / 2, renderWidth, renderHeight, tint);
            ctx.restore();
        }
        drawPlayerShieldFront(ctx, px, py);
    } else {
        ctx.fillStyle = player.color; ctx.beginPath(); ctx.arc(px, py, player.radius, 0, Math.PI * 2); ctx.fill();
        drawPlayerShieldFront(ctx, px, py);
    }

// Abyss title config
    const displayTitle = getPlayerDisplayTitle();
    if (displayTitle) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = 'bold 12px Cinzel';

// Decide between an abyss title and a purchased title
        const abyssTitleConfig = {
            'Abyss Demon King': { color: '#ff4400', glow: '#ff0000', icon: '🔥' },
            'Abyss Overlord': { color: '#cc2222', glow: '#880000', icon: '⚔️' },
            'Abyss Envoy': { color: '#9933ff', glow: '#6600cc', icon: '💀' },
            'Abyss Walker': { color: '#888888', glow: '#444444', icon: '🌑' }
        };

        let config;
        let titleText;

// Abyss title
        if (abyssTitleConfig[displayTitle]) {
            // abysstitle
            config = abyssTitleConfig[displayTitle];
            titleText = config.icon + ' ' + displayTitle + ' ' + config.icon;
        } else {
            // purchasetitle - from TITLES Getconfig
            const purchasedTitle = typeof TITLES !== 'undefined'
                ? TITLES.find(t => t.name === displayTitle)
                : null;
            if (purchasedTitle) {
                config = {
                    color: purchasedTitle.color,
                    glow: purchasedTitle.style === 'glow' ? purchasedTitle.color : '#888888',
                    icon: '👑'
                };
            } else {
                config = { color: '#ffd700', glow: '#ffa500', icon: '👑' };
            }
            titleText = config.icon + ' ' + displayTitle + ' ' + config.icon;
        }

        // glow effect
        ctx.shadowColor = config.glow;
        ctx.shadowBlur = 10;
        ctx.fillStyle = config.color;

// Performance: for loops for projectile rendering
        ctx.fillText(titleText, px, py - HERO_SPRITE_CONFIG.renderSize - 10);

        ctx.restore();
    }

// Viewport culling
    foregroundActors.length = 0;
    for (let di = 0, dLen = destructibles.length; di < dLen; di++) {
        const d = destructibles[di];
        if (d.y > player.y + 4) foregroundActors.push(d);
    }
    for (let ei = 0, eLen = renderEnemies.length; ei < eLen; ei++) {
        const e = renderEnemies[ei];
        if (e.y > player.y + 4) foregroundActors.push(e);
    }
    for (let si = 0, sLen = scenicProps.length; si < sLen; si++) {
        const prop = scenicProps[si];
        if ((prop.sortY ?? prop.y) > player.y + 4) foregroundActors.push(prop);
    }
    foregroundActors.sort((a, b) => (a.sortY ?? a.y) - (b.sortY ?? b.y));
    for (let ai = 0, aLen = foregroundActors.length; ai < aLen; ai++) {
        const actor = foregroundActors[ai];
        if (actor.scenicProp) drawScenicPropOne(ctx, actor);
        else if (actor.maxHp !== undefined) drawEnemyActor(ctx, actor);
        else DestructibleSystem.drawOne(ctx, actor);
    }
    if (AutoBattle.enabled && AutoBattle.currentTarget && !AutoBattle.currentTarget.dead) {
        const target = AutoBattle.currentTarget;
        drawOutlinedText(ctx, '▼', target.x, target.y - target.radius - 48, '#ff4444', 'bold 18px Arial');
    }

    if (typeof Elemental3D !== 'undefined') Elemental3D.foreground(ctx,SkillBranchSystem.areas,{x:camera.x,y:camera.y,width:viewportWidth,height:viewportHeight},player.graphicsQuality !== 'low',player.graphicsQuality !== 'low');
    for (let pi = 0, pLen = projectiles.length; pi < pLen; pi++) {
        const p = projectiles[pi];
// Performance: for loops for particle rendering
        if (p.x < camera.x - 50 || p.x > camera.x + viewportWidth + 50 ||
            p.y < camera.y - 50 || p.y > camera.y + viewportHeight + 50) continue;

        ctx.strokeStyle = p.color || '#fa0';
        ctx.fillStyle = p.color || '#fa0';
        ctx.lineWidth = 2;

        if (drawProjectileVfx(ctx, p)) {
            continue;
        }

        if (p.type === 'multishot') {
            drawArrowProjectile(ctx, p, '#aaff00', 26, 3);
        } else if (p.color === '#ffaa00' && p.owner !== player) {
            drawArrowProjectile(ctx, p, '#ffaa00', 22, 3);
        } else {
            drawOrbProjectile(ctx, p);
        }
    }

// Viewport culling
    for (let pti = 0, ptLen = particles.length; pti < ptLen; pti++) {
        const p = particles[pti];
// Render the lightning chain (enhanced)
        if (p.x < camera.x - 100 || p.x > camera.x + viewportWidth + 100 ||
            p.y < camera.y - 120 || p.y > camera.y + viewportHeight + 100) continue;

        if (p.type === 'lightning') {
            ctx.beginPath();
            ctx.moveTo(p.points[0].x, p.points[0].y);
            for (let j = 1; j < p.points.length; j++) ctx.lineTo(p.points[j].x, p.points[j].y);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.width * (p.life / 0.2);
            ctx.stroke();
            setGlow(ctx, 20, p.color);
            ctx.stroke();
            clearGlow(ctx);
        } else if (p.type === 'lightning_chain') {
// Outer glow (blue halo)
            const alpha = p.life / (p.maxLife || 0.3);

            ctx.beginPath();
            ctx.moveTo(p.points[0].x, p.points[0].y);
            for (let j = 1; j < p.points.length; j++) {
                ctx.lineTo(p.points[j].x, p.points[j].y);
            }

// Middle layer (body color)
            ctx.globalAlpha = alpha * 0.5;
            ctx.strokeStyle = p.glowColor || '#88ccff';
            ctx.lineWidth = (p.lineWidth || 2) + 6;
            setGlow(ctx, 25, p.glowColor || '#88ccff');
            ctx.stroke();

            // infloor（mainbodycolor）
            ctx.globalAlpha = alpha * 0.8;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = (p.lineWidth || 2) + 2;
            setGlow(ctx, 15, p.color);
            ctx.stroke();

// Render the drop beam
            if (p.isMain) {
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = p.lineWidth || 2;
                setGlow(ctx, 8, '#ffffff');
                ctx.stroke();
            }

            clearGlow(ctx);
            ctx.globalAlpha = 1.0;
        } else if (p.type === 'skill_ground_glow') {
            const alpha = Math.max(0, p.life / (p.maxLife || 0.25));
            const radius = (p.radius || 24) * (1.08 - alpha * 0.08);
            ctx.save();
            ctx.translate(p.x, p.y + 2);
            ctx.scale(1, 0.42);
            const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
            glowGradient.addColorStop(0, p.color2 || p.color);
            glowGradient.addColorStop(0.45, p.color);
            glowGradient.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.globalAlpha = alpha;
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            ctx.globalAlpha = 1.0;
        } else if (p.type === 'skill_impact_ring') {
            const alpha = Math.max(0, p.life / (p.maxLife || 0.24));
            const t = 1 - alpha;
            const radius = (p.radius || 12) + (p.grow || 24) * t;
            ctx.save();
            ctx.translate(p.x, p.y + 1);
            ctx.rotate(p.rotation || 0);
            ctx.scale(1, 0.48);
            ctx.globalAlpha = alpha * 0.85;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = Math.max(1, (p.width || 2) * alpha);
            setGlow(ctx, 14, p.color);
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.stroke();
            clearGlow(ctx);
            ctx.restore();
            ctx.globalAlpha = 1.0;
        } else if (p.type === 'skill_impact_ray') {
            const alpha = Math.max(0, p.life / (p.maxLife || 0.16));
            const len = (p.length || 30) * (1.15 - alpha * 0.15);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = Math.max(1, (p.width || 2) * alpha);
            ctx.lineCap = 'round';
            setGlow(ctx, 12, p.color);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + Math.cos(p.angle || 0) * len, p.y + Math.sin(p.angle || 0) * len);
            ctx.stroke();
            clearGlow(ctx);
            ctx.restore();
            ctx.globalAlpha = 1.0;
        } else if (p.type === 'drop_beam') {
// 0.2s fade-in
            const fadeIn = Math.min(1, (p.maxLife - p.life) / 0.2);  // 0.2secondfade in
            const fadeOut = Math.min(1, p.life / 0.3);               // 0.3secondfade out
            const alpha = fadeIn * fadeOut;

// Pulse effect
            const gradient = ctx.createLinearGradient(p.x, p.y, p.x, p.y - p.height);
            gradient.addColorStop(0, p.glowColor);
            gradient.addColorStop(0.3, p.color);
            gradient.addColorStop(0.7, p.color);
            gradient.addColorStop(1, 'rgba(255,255,255,0)');

            ctx.globalAlpha = alpha * 0.7;
            ctx.fillStyle = gradient;
            const beamWidth = p.width * (0.8 + 0.2 * Math.sin(Date.now() / 100));  // pulsingeffect
            ctx.fillRect(p.x - beamWidth / 2, p.y - p.height, beamWidth, p.height);

// Bottom halo
            setGlow(ctx, 30, p.color, true);
            ctx.fillRect(p.x - beamWidth / 4, p.y - p.height, beamWidth / 2, p.height);
            clearGlow(ctx);

// Hit splatter particles (with height and shadow)
            ctx.beginPath();
            const glowRadius = p.width * 1.5 * (0.8 + 0.2 * Math.sin(Date.now() / 80));
            const glowGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
            glowGradient.addColorStop(0, p.color);
            glowGradient.addColorStop(0.5, p.glowColor);
            glowGradient.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = glowGradient;
            ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = 1.0;
        } else if (p.type === 'rising_spark') {
            drawParticleSliver(ctx, p);
        } else if (p.type === 'drifting_veil') {
            drawDriftingVeil(ctx, p);
        } else if (p.type === 'impact_facet') {
            drawImpactFacet(ctx, p);
        } else if (p.type === 'impact') {
// Ellipses in flight too, for a livelier feel
            if (p.z > 0) {
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.beginPath();
                ctx.ellipse(p.x, p.y, p.size, p.size / 2, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.beginPath();
// Draw flying pickup particles (suck-in) - performance: for loops
            ctx.ellipse(p.x, p.y - (p.z || 0), p.size * 1.2, p.size * 0.8, Math.atan2(p.vy, p.vx), 0, Math.PI * 2);
            ctx.fill();
        } else if (p.maxAlpha === undefined) {
            drawParticleSliver(ctx, p);
        } else {
            ctx.fillStyle = p.color; ctx.globalAlpha = Math.min(1, p.life) * (p.maxAlpha === undefined ? 1 : p.maxAlpha); ctx.beginPath(); ctx.arc(p.x, p.y - (p.z || 0), p.size, 0, Math.PI * 2); ctx.fill();
        }
    }
    ctx.globalAlpha = 1;

    for (let vi = 0, vLen = vfxEffects.length; vi < vLen; vi++) {
        const fx = vfxEffects[vi];
        if (fx.x < camera.x - 140 || fx.x > camera.x + viewportWidth + 140 ||
            fx.y < camera.y - 160 || fx.y > camera.y + viewportHeight + 160) continue;
        drawVfxEffect(ctx, fx);
    }

// Gradient transparency
    for (let fpi = 0, fpLen = flyingPickups.length; fpi < fpLen; fpi++) {
        const fp = flyingPickups[fpi];
        ctx.save();
        const progress = fp.progress || 0;
        const alpha = 1 - progress * 0.3; // Gradually enlarge
        const scale = 1 + progress * 0.5; // Outer glow

        // outsideglow
        setGlow(ctx, 15, fp.color);

        // traileffect
        ctx.globalAlpha = alpha * 0.3;
        ctx.fillStyle = fp.color;
        ctx.beginPath();
        ctx.arc(fp.startX + (fp.x - fp.startX) * 0.3, fp.startY + (fp.y - fp.startY) * 0.3, fp.size * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = alpha * 0.6;
        ctx.beginPath();
        ctx.arc(fp.startX + (fp.x - fp.startX) * 0.6, fp.startY + (fp.y - fp.startY) * 0.6, fp.size * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // mainbody
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(fp.x, fp.y, fp.size * scale, 0, Math.PI * 2);
        ctx.fill();

// Draw slash arcs - performance: for loops
        clearGlow(ctx);
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = alpha * 0.8;
        ctx.beginPath();
        ctx.arc(fp.x, fp.y - fp.size * 0.3, fp.size * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

// Outer glow for crits and sweeps
    for (let si = 0, sLen = slashEffects.length; si < sLen; si++) {
        const s = slashEffects[si];
        if (typeof Physical3D !== 'undefined' && Physical3D.draw(ctx, s)) continue;
        const alpha = s.life;
        const color = s.color || '#ffffff';

// Clear the glow effect
        if (s.isCrit || s.isSweep) {
            setGlow(ctx, s.glowBlur || (s.isSweep ? 10 : 15), s.glowColor || '#ffdd00');
        }

        ctx.globalAlpha = alpha * (s.alphaScale || 1);
        ctx.strokeStyle = color;
        ctx.lineCap = 'round';

        ctx.lineWidth = (s.lineWidth || (s.isCrit ? 5 : 3)) * alpha;
        ctx.beginPath();
        const arcWidth = s.arcWidth || 0.8;
        ctx.arc(s.x, s.y, s.radius, s.angle - arcWidth, s.angle + arcWidth);
        ctx.stroke();

        // clearglow effect
        clearGlow(ctx);
        ctx.globalAlpha = 1;
    }

// Minimal fix: after entities draw, redraw the wall row (r+1) beneath each entity
// Reuse the Set; no per-frame new
    if (mapCacheCanvas) {
        _occlusionSet.clear();  // reuse Set，avoidevery frame new
        const collectOcclusion = (obj) => {
            const r = Math.floor(obj.y / TILE_SIZE), c = Math.floor(obj.x / TILE_SIZE);
            for (let dx = -1; dx <= 1; dx++) {
                const nc = c + dx, nr = r + 1;
                if (mapData[nr] && mapData[nr][nc] === 0) {
                    _occlusionSet.add((nr << 8) | nc);  // numberencode:row*256+col
                }
            }
        };
        for (let oi = 0, oLen = enemies.length; oi < oLen; oi++) { const e = enemies[oi]; if (!e.dead) collectOcclusion(e); }
        collectOcclusion(player);
// Bitwise decoding
        ctx.save();
        ctx.globalAlpha = 0.32;
        _occlusionSet.forEach(key => {
            const c = key & 0xFF, r = key >> 8;  // Performance: for loops for damage numbers
            const tx = c * TILE_SIZE, ty = r * TILE_SIZE;
            ctx.drawImage(mapCacheCanvas, tx, ty, TILE_SIZE, TILE_SIZE, tx, ty, TILE_SIZE, TILE_SIZE);
        });
        ctx.restore();
    }

    ctx.textAlign = 'center';
    drawBossDangerTelegraphs(ctx);
// Dynamic font size
    for (let di = 0, dLen = damageNumbers.length; di < dLen; di++) {
        const d = damageNumbers[di];
        if (d.isHTML) continue;
// Dead: the dialog is up; no more canvas countdown text
        const size = d.fontSize || 16;
        ctx.font = `bold ${size}px Arial`;
        ctx.fillStyle = d.color;
        ctx.fillText(d.val, d.x, d.y);
    }

    ctx.restore();

// Town portal ritual VFX

    const g = ctx.createRadialGradient(viewportWidth / 2, viewportHeight / 2, 200, viewportWidth / 2, viewportHeight / 2, viewportWidth / 1.2);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, viewportWidth, viewportHeight);
    drawBossHealthHud();

// Cast phase: show the cast bar only
    if (portalRitual.active) {
        ctx.save();

        if (portalRitual.phase === 0) {
// Cast bar UI
            const progress = 1 - (portalRitual.timer / PORTAL_RITUAL_DURATIONS.casting);

            // readentriesUI
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(viewportWidth / 2 - 100, viewportHeight - 80, 200, 20);
            ctx.fillStyle = '#6699ff';
            ctx.fillRect(viewportWidth / 2 - 98, viewportHeight - 78, 196 * progress, 16);
            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Teleporting...', viewportWidth / 2, viewportHeight - 65);

        } else if (portalRitual.phase === 1) {
// White flash overlay (phases 2 and 3)
        }

// Level-up VFX: gold flash overlay
        if (portalRitual.flashAlpha > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${portalRitual.flashAlpha})`;
            ctx.fillRect(0, 0, viewportWidth, viewportHeight);
        }

        ctx.restore();
    }

// Gold radial gradient flash
    if (levelUpEffect.active && levelUpEffect.flashAlpha > 0) {
        ctx.save();
// Combo counter rendering (HUD) - moved to DOM rendering (updateSmoothUI); logic kept here for non-smooth mode or future expansion
        const gradient = ctx.createRadialGradient(
            viewportWidth / 2, viewportHeight / 2, 0,
            viewportWidth / 2, viewportHeight / 2, viewportWidth * 0.8
        );
        gradient.addColorStop(0, `rgba(255, 215, 0, ${levelUpEffect.flashAlpha * 0.6})`);
        gradient.addColorStop(0.5, `rgba(255, 180, 0, ${levelUpEffect.flashAlpha * 0.3})`);
        gradient.addColorStop(1, `rgba(255, 150, 0, 0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, viewportWidth, viewportHeight);
        ctx.restore();
    }

    // Combo counter HUD (DOM) - already moved to DOM Render (updateSmoothUI); this spot keeps the logic for non-smooth mode or future expansion
    /*
    if (combo.active && combo.count > 1) {
        ... (retired: DOM rendering looks better and is alias-free)
    }
    */

    // Renderizar Joystick Táctil Dinámico
    if (typeof TouchJoystick !== 'undefined') TouchJoystick.draw(ctx);

    updateLabelsPosition();
    drawMinimap();
    updateTutorialBubble();
}

let _lastCamX = 0, _lastCamY = 0;
let _lastLabelsSignature = '';
function updateLabelsPosition() {
    let hasMovingDrop = false;
    for (let li = 0, lLen = groundItems.length; li < lLen; li++) {
        const i = groundItems[li];
        if ((i.z || 0) !== 0 || (i.vz || 0) !== 0 || (i.vx || 0) !== 0 || (i.vy || 0) !== 0) {
            hasMovingDrop = true;
            break;
        }
    }
    const camX = Math.round(camera.x);
    const camY = Math.round(camera.y);
    const signature = `${camX}|${camY}|${groundItems.length}|${hasMovingDrop ? 1 : 0}`;
    if (!hasMovingDrop && signature === _lastLabelsSignature) return;
    _lastLabelsSignature = signature;
    _lastCamX = camera.x; _lastCamY = camera.y;

    for (let li = 0, lLen = groundItems.length; li < lLen; li++) {
        const i = groundItems[li];
        if (i.el) {
            const sx = i.x - camera.x, sy = i.y - camera.y - (i.z || 0) - 25;
            if (sx > 0 && sx < getViewportWidth() && sy > 0 && sy < getViewportHeight()) {
                i.el.style.display = 'block'; i.el.style.left = canvasToCssX(sx) + 'px'; i.el.style.top = canvasToCssY(sy) + 'px';
            } else i.el.style.display = 'none';
        }
    }
}

// --- smallmap cacheoptimization ---
let _minimapDirty = true;
let _minimapCache = null;

function drawMinimap() {
    const s = 150 / MAP_WIDTH;

// Draw the exit (static)
    if (_minimapDirty || !_minimapCache) {
        if (!_minimapCache) {
            _minimapCache = document.createElement('canvas');
            _minimapCache.width = 150;
            _minimapCache.height = 150;
        }
        const cacheCtx = _minimapCache.getContext('2d');
        cacheCtx.fillStyle = '#000';
        cacheCtx.fillRect(0, 0, 150, 150);
        for (let y = 0; y < MAP_HEIGHT; y++) for (let x = 0; x < MAP_WIDTH; x++) {
            if (visitedMap[y][x]) {
                cacheCtx.fillStyle = mapData[y][x] === 0 ? '#777' : '#333';
                cacheCtx.fillRect(x * s, y * s, s, s);
            }
        }
        // drawexit（static）
        const ex = Math.floor(dungeonExit.x / TILE_SIZE), ey = Math.floor(dungeonExit.y / TILE_SIZE);
        if (visitedMap[ey] && visitedMap[ey][ex]) {
            cacheCtx.fillStyle = COLORS.exit;
            cacheCtx.fillRect(ex * s, ey * s, s, s);
        }
// Per frame: draw the cache plus dynamic elements
        if (currentWaypoint) {
            const wx = Math.floor(currentWaypoint.x / TILE_SIZE), wy = Math.floor(currentWaypoint.y / TILE_SIZE);
            if (visitedMap[wy] && visitedMap[wy][wx]) {
                const isWpActive = player.activatedWaypoints && player.activatedWaypoints.includes(currentWaypoint.floor);
                cacheCtx.fillStyle = isWpActive ? '#00e5ff' : '#64748b';
                cacheCtx.fillRect(wx * s - 0.5, wy * s - 0.5, s + 1, s + 1);
            }
        }
        _minimapDirty = false;
    }

// Player position (dynamic)
    miniCtx.drawImage(_minimapCache, 0, 0);

// Enemy positions (dynamic)
    const px = player.x / TILE_SIZE * s, py = player.y / TILE_SIZE * s;
    miniCtx.fillStyle = '#0f0';
    miniCtx.fillRect(px - 1, py - 1, 3, 3);

    // enemyposition（dynamic）
    miniCtx.fillStyle = '#f00';
    for (let mi = 0, mLen = enemies.length; mi < mLen; mi++) {
        const e = enemies[mi];
        if (!e.dead) {
            const ex = Math.floor(e.x / TILE_SIZE), ey = Math.floor(e.y / TILE_SIZE);
            if (ex >= 0 && visitedMap[ey] && visitedMap[ey][ex]) miniCtx.fillRect(ex * s, ey * s, 2, 2);
        }
    }
}

function interactNPC(npc) {
    if (npc.type === 'merchant') {
        togglePanel('shop');
    } else if (npc.type === 'stash') {
// Hell guard - enter/return from Hell
        const stashPanel = document.getElementById('stash-panel');
        stashPanel.style.display = 'block';
        renderStash();
    } else if (npc.type === 'difficulty') {
// Mysterious sage - stat reset service
        showHellPortalDialog();
    } else if (npc.type === 'respec') {
// Rare
        showRespecDialog();
    } else if (npc.type === 'blacksmith') {
        togglePanel('blacksmith');
    } else if (npc.type === 'healer') {
        const currentQ = getCurrentQuest();
        const npcName = typeof I18N !== 'undefined' ? I18N.t('npc_akara') : npc.name;

        if (!currentQ) {
            const allDoneMsg = typeof I18N !== 'undefined' ? I18N.t('npc_akara_all_done') : "You have completed every quest, a true hero!";
            const thanksMsg = typeof I18N !== 'undefined' ? I18N.t('npc_thanks') : "Thank you";
            showDialog(npcName, allDoneMsg, [{ text: thanksMsg, action: closeDialog }]);
            return;
        }

        const qDesc = (typeof I18N !== 'undefined' && I18N.getQuestDesc) ? I18N.getQuestDesc(currentQ) : currentQ.desc;
        const qReward = (typeof I18N !== 'undefined' && I18N.getQuestReward) ? I18N.getQuestReward(currentQ.reward) : currentQ.reward;
        const rewardLabel = typeof I18N !== 'undefined' ? I18N.t('quest_reward') : "Rewards:";

        if (player.questState === 0) {
            const helpText = typeof I18N !== 'undefined' ? I18N.t('npc_akara_need_help') : "Brave hero, we need your help.";
            const acceptText = typeof I18N !== 'undefined' ? I18N.t('quest_accept') : "Accept Quest";
            showDialog(npcName, `${helpText}\n\n${qDesc}\n\n${rewardLabel} ${qReward}`,
                [{ text: acceptText, action: () => { player.questState = 1; player.questProgress = 0; updateQuestUI(); updateQuestTracker(); updateMenuIndicators(); closeDialog(); } }]);
        } else if (player.questState === 1) {
            let progText = "";
            if (currentQ.type === 'kill_count') {
                const progWord = typeof I18N !== 'undefined' ? I18N.t('quest_tracker_title') : 'Progress';
                progText = ` (${progWord}: ${player.questProgress} / ${currentQ.target})`;
            }
            const inProgMsg = typeof I18N !== 'undefined' ? I18N.t('npc_akara_in_progress') : "The quest is not done yet. Go!";
            const okText = typeof I18N !== 'undefined' ? I18N.t('npc_ok') : "OK";
            showDialog(npcName, `${inProgMsg}\n${qDesc}${progText}`, [{ text: okText, action: closeDialog }]);
        } else if (player.questState === 2) {
            const readyMsg = typeof I18N !== 'undefined' ? I18N.t('npc_akara_reward_ready') : "Well done! Here is your reward.";
            const claimText = typeof I18N !== 'undefined' ? I18N.t('btn_claim_reward') : "Claim Reward";
            showDialog(npcName, readyMsg,
                [{
                    text: claimText, action: () => {
                        if (currentQ.reward.includes('Skill Point')) {
                            if (currentQ.reward.includes('2')) {
                                player.skillPoints += 2;
                            } else {
                                player.skillPoints++;
                            }
                        }
                        if (currentQ.reward.includes('Gold')) {
                            if (currentQ.reward.includes('1000')) {
                                addGold(1000);
                            } else {
                                addGold(500);
                            }
                        }
                        if (currentQ.reward.includes('Equipment') || currentQ.reward.includes('Magic Ring') || currentQ.reward.includes('Rune') || currentQ.reward.includes('Accessory')) {
                            addItemToInventory(createItem('Magic Ring', player.lvl));
                        }
                        if (currentQ.reward.includes('Unique Equipment') || currentQ.reward.includes('Legendary Equipment') || currentQ.reward.includes('Ultimate Divine Relic')) {
                            let item;
                            if (currentQ.reward.includes('Unique')) {
                                item = createItem('Magic Ring', player.lvl);
                                item.rarity = 3; // rare
                            } else if (currentQ.reward.includes('Legendary')) {
                                item = createItem('Magic Ring', player.lvl);
                                item.rarity = 4; // Unique
                            } else { // Stat reset dialog
                                item = createItem('Magic Ring', player.lvl);
                                item.rarity = 4;
                                item.displayName = "Ultimate Divine Relic";
                            }
                            addItemToInventory(item);
                        }

                        player.questIndex++;
                        player.questState = 0;
                        player.questProgress = 0;

                        updateSkillsUI(); updateQuestUI(); updateQuestTracker(); updateMenuIndicators(); closeDialog(); AudioSys.play('levelup');
                    }
                }]);
        } else {
            player.hp = player.maxHp; player.mp = player.maxMp; showNotification("Akara healed you");
        }
    }
}

function getNpcApproachTarget(npc) {
    const dx = player.x - npc.x;
    const dy = player.y - npc.y;
    const dist = Math.hypot(dx, dy) || 1;
    const stopDistance = Math.max(42, (npc.radius || 20) + player.radius + 14);
    const targetX = npc.x + (dx / dist) * stopDistance;
    const targetY = npc.y + (dy / dist) * stopDistance;

    if (!isWall(targetX, targetY)) {
        return { x: targetX, y: targetY };
    }

    return { x: npc.x, y: npc.y };
}

function tryResolvePendingNpcInteraction() {
    const npc = pendingNpcInteraction;
    if (!npc) return false;

    if (!npcs.includes(npc)) {
        pendingNpcInteraction = null;
        return false;
    }

    if (Math.hypot(npc.x - player.x, npc.y - player.y) < 60) {
        player.targetX = null;
        player.targetY = null;
        pendingNpcInteraction = null;
        interactNPC(npc);
        return true;
    }

    return false;
}

function showDialog(name, text, options) {
    const box = document.getElementById('dialog-box');
    document.getElementById('dialog-name').innerText = name;
    document.getElementById('dialog-text').innerHTML = text.replace(/\n/g, '<br>');
    const optsDiv = document.getElementById('dialog-options');
    optsDiv.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'dialog-btn';
        btn.innerText = opt.text;
        btn.onclick = (e) => {
            e.stopPropagation();
            opt.action();
        };
        btn.onmousedown = (e) => e.stopPropagation();
        optsDiv.appendChild(btn);
    });
    box.style.display = 'block';
}
function closeDialog() { document.getElementById('dialog-box').style.display = 'none'; }

// washtapdialog
function showRespecDialog() {
    const statCost = player.lvl * 300;
    const skillCost = player.lvl * 300;
    const sageName = typeof I18N !== 'undefined' ? I18N.t('npc_sage_name') : "Mysterious Sage";
    const understoodText = typeof I18N !== 'undefined' ? I18N.t('npc_understood') : "Got it";
    const greatText = typeof I18N !== 'undefined' ? I18N.t('npc_great') : "Excellent!";

    const dialogText = typeof I18N !== 'undefined' ?
        I18N.t('npc_sage_dialog', { gold: player.gold.toLocaleString() }) :
        `Young hero, your fate is full of choices. I can respec your stats or grant you a distinguished title.\n\nCurrent gold: ${player.gold.toLocaleString()}\n\nChoose your service:`;

    const options = [
        {
            text: typeof I18N !== 'undefined' ? I18N.t('menu_title_shop') : 'Title Shop',
            action: () => showTitleShop()
        },
        {
            text: typeof I18N !== 'undefined' ? I18N.t('respec_stats_btn', { cost: statCost }) : `Reset Stat Points (${statCost} gold)`,
            action: () => {
                if (player.gold < statCost) {
                    const noGoldMsg = typeof I18N !== 'undefined' ?
                        I18N.t('respec_no_gold_stats', { cost: statCost, gold: player.gold }) :
                        `Not enough gold! Respec costs ${statCost} gold.\n\nCurrent gold: ${player.gold}`;
                    showDialog(sageName, noGoldMsg, [{ text: understoodText, action: closeDialog }]);
                    return;
                }
                player.gold -= statCost;
                respecPlayer('stats');
                AudioSys.play('levelup');
                const successMsg = typeof I18N !== 'undefined' ?
                    I18N.t('respec_stats_success', { cost: statCost, gold: player.gold }) :
                    `✨ Stat points reset! ✨\n\nStrength, dexterity, vitality and energy restored to base.\nAll stat points refunded.\n\nCost: ${statCost} gold\nGold left: ${player.gold}`;
                showDialog(sageName, successMsg, [{ text: greatText, action: closeDialog }]);
            }
        },
        {
            text: typeof I18N !== 'undefined' ? I18N.t('respec_skills_btn', { cost: skillCost }) : `Reset Skill Points (${skillCost} gold)`,
            action: () => {
                if (player.gold < skillCost) {
                    const noGoldMsg = typeof I18N !== 'undefined' ?
                        I18N.t('respec_no_gold_skills', { cost: skillCost, gold: player.gold }) :
                        `Not enough gold! Respec costs ${skillCost} gold.\n\nCurrent gold: ${player.gold}`;
                    showDialog(sageName, noGoldMsg, [{ text: understoodText, action: closeDialog }]);
                    return;
                }
                player.gold -= skillCost;
                respecPlayer('skills');
                AudioSys.play('levelup');
                const successMsg = typeof I18N !== 'undefined' ?
                    I18N.t('respec_skills_success', { cost: skillCost, gold: player.gold }) :
                    `✨ Skill points reset! ✨\n\nAll skills reset (Fireball stays at level 1).\nAll skill points refunded.\n\nCost: ${skillCost} gold\nGold left: ${player.gold}`;
                showDialog(sageName, successMsg, [{ text: greatText, action: closeDialog }]);
            }
        },
        {
            text: typeof I18N !== 'undefined' ? I18N.t('leave') : 'Leave',
            action: closeDialog
        }
    ];

    showDialog(sageName, dialogText, options);
}

// titleshop
function showTitleShop() {
    const overlay = document.getElementById('title-shop-overlay');
    const currentSpan = document.getElementById('title-shop-current');
    const goldSpan = document.getElementById('title-shop-gold');
    const listDiv = document.getElementById('title-shop-list');

// Gold display
    const currentTitleData = TITLES.find(t => t.id === player.currentTitle) || TITLES[0];
    const currentTitleName = typeof I18N !== 'undefined' ? I18N.getTitleName(currentTitleData.id) : currentTitleData.name;
    currentSpan.innerHTML = `<span style="${getTitleStyle(currentTitleData)}">「${currentTitleName}」</span>`;

    // goldShow
    goldSpan.textContent = player.gold.toLocaleString();

// Title color styles
    let listHtml = '';
    TITLES.forEach(title => {
        const owned = player.ownedTitles.includes(title.id);
        const equipped = player.currentTitle === title.id;
        const canAfford = player.gold >= title.price;

// Price display
        let nameStyle = `color:${title.color};`;
        if (title.style === 'glow') {
            nameStyle += `text-shadow:0 0 8px ${title.color};`;
        } else if (title.style === 'rainbow') {
            nameStyle = `background:linear-gradient(90deg,#ff0000,#ff8800,#ffff00,#00ff00,#0088ff,#8800ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:bold;`;
        }

        // priceShow
        let priceText = title.price === 0 ?
            (typeof I18N !== 'undefined' ? I18N.t('title_free') : 'Free') :
            `💰 ${title.price.toLocaleString()}`;

// Show panel
        let statusClass = '';
        let btnHtml = '';

        if (equipped) {
            statusClass = 'equipped';
            const eqText = typeof I18N !== 'undefined' ? I18N.t('title_equipped') : 'Equipped';
            btnHtml = `<span class="title-item-status">${eqText}</span>`;
        } else if (owned) {
            statusClass = 'owned';
            const eqBtnText = typeof I18N !== 'undefined' ? I18N.t('title_equip') : 'Equipment';
            btnHtml = `<button class="title-item-btn equip" onclick="equipTitle('${title.id}')">${eqBtnText}</button>`;
        } else if (title.price > 0) {
            const buyText = typeof I18N !== 'undefined' ? I18N.t('title_buy') : 'Buy';
            btnHtml = `<button class="title-item-btn buy ${canAfford ? '' : 'disabled'}" onclick="buyTitle('${title.id}')" ${canAfford ? '' : 'disabled'}>${buyText}</button>`;
        }

        const tName = typeof I18N !== 'undefined' ? I18N.getTitleName(title.id) : title.name;
        listHtml += `<div class="title-item ${statusClass}">
            <div class="title-item-info">
                <span class="title-item-name" style="${nameStyle}">「${tName}」</span>
                <span class="title-item-price">${priceText}</span>
            </div>
            <div class="title-item-action">${btnHtml}</div>
        </div>`;
    });

    listDiv.innerHTML = listHtml;

    // Show panel
    overlay.classList.add('active');
}

// Closetitleshop
function closeTitleShop() {
    document.getElementById('title-shop-overlay').classList.remove('active');
}

// Gettitlestyle
function getTitleStyle(title) {
    if (title.style === 'rainbow') {
        return `background:linear-gradient(90deg,#ff0000,#ff8800,#ffff00,#00ff00,#0088ff,#8800ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:bold;`;
    } else if (title.style === 'glow') {
        return `color:${title.color};text-shadow:0 0 8px ${title.color};`;
    }
    return `color:${title.color};`;
}

// Buy title
function getPlayerDisplayTitle() {
    // purchasetitle
    const purchasedTitle = player.currentTitle && player.currentTitle !== 'none'
        ? (typeof TITLES !== 'undefined' ? TITLES.find(t => t.id === player.currentTitle)?.name : null)
        : null;
    // abysstitle
    const abyssTitle = player.abyssTitle || null;

    // ifallnotitle
    if (!purchasedTitle && !abyssTitle) return null;

// Both exist: compare acquired time (newest first)
    if (!purchasedTitle) return abyssTitle;
    if (!abyssTitle) return purchasedTitle;

// Gold spend animation
    const titleTime = player.titleObtainedTime || 0;
    const abyssTitleTime = player.abyssTitleObtainedTime || 0;

    return titleTime >= abyssTitleTime ? purchasedTitle : abyssTitle;
}

// Play the gold SFX
function showGoldSpend(amount) {
    const overlay = document.createElement('div');
    overlay.className = 'gold-spend-overlay';
    overlay.innerHTML = `<div class="gold-spend-text">-${amount.toLocaleString()} 💰</div>`;
    document.body.appendChild(overlay);

    // playgoldSFX
    AudioSys.play('buy');

// Title unlock VFX popup
    setTimeout(() => overlay.remove(), 1500);
}

// title unlock VFX popup
function showTitleUnlock(title) {
    const overlay = document.createElement('div');
    overlay.className = 'title-unlock-overlay';

    let titleStyle = `color:${title.color};`;
    if (title.style === 'glow') {
        titleStyle += `text-shadow: 0 0 20px ${title.color}, 0 0 40px ${title.color};`;
    } else if (title.style === 'rainbow') {
        titleStyle = `background: linear-gradient(90deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: bold;
            filter: drop-shadow(0 0 10px rgba(255,255,255,0.8));`;
    }

    overlay.innerHTML = `
        <div class="title-unlock-panel">
            <div class="title-unlock-glow"></div>
            <div class="title-unlock-icon">👑</div>
            <div class="title-unlock-label">Title Unlocked</div>
            <div class="title-unlock-name" style="${titleStyle}">「${title.name}」</div>
            <div class="title-unlock-hint">Click anywhere to close</div>
        </div>
    `;

    document.body.appendChild(overlay);

// Click to close
    AudioSys.play('drop_unique');

// Auto-close after 3 seconds
    overlay.onclick = () => overlay.remove();

// Buy title
    setTimeout(() => overlay.remove(), 3000);
}

// purchasetitle
function buyTitle(titleId) {
    const title = TITLES.find(t => t.id === titleId);
    if (!title) return;

    if (player.gold < title.price) {
        showNotification(`Not enough gold! Requires ${title.price.toLocaleString()} gold`);
        return;
    }

    // Closeshoppanel
    closeTitleShop();

    // gold deduction animation
    showGoldSpend(title.price);

    player.gold -= title.price;
    player.ownedTitles.push(titleId);
    player.currentTitle = titleId;  // autogear
    player.titleObtainedTime = Date.now();  // Delay the title VFX (wait for the gold animation)
    updateStatsUI();

// Server-wide announce for high-price titles (1,000,000+)
    setTimeout(() => {
        showTitleUnlock(title);

        // Server-wide announce for high-price titles (1,000,000+)
        if (title.price >= 1000000 && typeof OnlineSystem !== 'undefined' && OnlineSystem.nickname) {
            OnlineSystem.announce('title_unlock', title.name);
        }
    }, 800);
}

// geartitle
function equipTitle(titleId) {
    const title = TITLES.find(t => t.id === titleId);
    if (!title || !player.ownedTitles.includes(titleId)) return;

    player.currentTitle = titleId;
    AudioSys.play('click');
    updateStatsUI();
    showTitleShop();
}

// washtaplogic
function respecPlayer(type) {
    if (type === 'full' || type === 'stats') {
// Reset stats to initial values
        const totalPoints = (player.lvl - 1) * 5;

// Refund all stat points
        player.str = 15;
        player.dex = 15;
        player.vit = 20;
        player.ene = 10;

// Compute total skill points (level-ups + quest rewards)
        player.points = totalPoints;
    }

    if (type === 'full' || type === 'skills') {
// Skill points from levels (none at 1; +1 per level from 2)
        let totalSkillPoints = player.lvl - 1; // Add skill points from quest rewards (counting completed quests)

// Reset skill levels
        const completedQuests = player.questIndex;
        for (let i = 0; i < completedQuests; i++) {
            const quest = getCurrentQuest(i);
            if (quest && quest.reward) {
                if (quest.reward.includes('2 Skill Points')) {
                    totalSkillPoints += 2;
                } else if (quest.reward.includes('Skill Point')) {
                    totalSkillPoints += 1;
                }
            }
        }

// Fireball stays at 1 (starter skill)
        player.skills.fireball = 1; // Reset the skill tree
        player.skills.thunder = 0;
        player.skills.multishot = 0;

        // Resetskill tree
        player.skillTree = {
            fireball: {
                stage1: 1,  // Refund all skill points (minus Fireball's 1)
                stage2: { chosen: null, level: 0 },
                stage3: { chosen: null, level: 0 }
            },
            thunder: {
                stage1: 0,
                stage2: { chosen: null, level: 0 },
                stage3: { chosen: null, level: 0 }
            },
            multishot: {
                stage1: 0,
                stage2: { chosen: null, level: 0 },
                stage3: { chosen: null, level: 0 }
            },
            holy_shield: {
                stage1: 0,
                stage2: { chosen: null, level: 0 },
                stage3: { chosen: null, level: 0 }
            }
        };

// Recompute player stats
        player.skillPoints = totalSkillPoints;
    }

// Update UI
    updateStats();

    // UpdateUI
    updateStatsUI();
    updateSkillsUI();
    updateUI();
    updateMenuIndicators();  // Play SFX

    // Play SFX
    AudioSys.play('quest');
}

function showHellPortalDialog() {
    const isInHell = player.isInHell || false;
    const currentFloor = isInHell ? player.hellFloor : player.floor;
    const guardName = typeof I18N !== 'undefined' ? I18N.t('npc_abyss_guard') : 'Abyss Guardian';

    if (isInHell) {
// Check whether Hell is unlocked (Baal defeated)
        const inFloorMsg = typeof I18N !== 'undefined' ?
            I18N.t('abyss_in_floor', { floor: currentFloor }) :
            `Already on Abyss floor ${currentFloor}.`;
        const retCampText = typeof I18N !== 'undefined' ? I18N.t('btn_return_camp') : 'Return to Camp';
        const contExploreText = typeof I18N !== 'undefined' ? I18N.t('btn_continue_explore') : 'Keep Exploring';
        showDialog(guardName, inFloorMsg, [
            {
                text: retCampText,
                action: () => {
                    exitHell();
                    closeDialog();
                }
            },
            {
                text: contExploreText,
                action: () => {
                    closeDialog();
                }
            }
        ]);
    } else {
// In dungeon or town, ask whether to enter Hell
        if (!player.defeatedBaal) {
            const floor10Name = typeof I18N !== 'undefined' ? I18N.getFloorName(10) : getFloorName(10);
            const needKillMsg = typeof I18N !== 'undefined' ?
                I18N.t('abyss_need_kill_boss', { name: floor10Name }) :
                `Defeat the Floor 10 boss "${floor10Name}" first to unlock the Abyss.`;
            const understoodText = typeof I18N !== 'undefined' ? I18N.t('npc_understood') : 'Got it';
            showDialog(guardName, needKillMsg, [
                {
                    text: understoodText,
                    action: () => closeDialog()
                }
            ]);
            return;
        }

// Abyss mode entrance
        // abyss modeentrance
        if (typeof AbyssSystem !== 'undefined') {
            AbyssSystem.showEntrancePanel();
            return;
        }

        const infoText = `Enter Hell mode:\n• Monster damage x4, HP x6\n• XP gain x5\n• Drop quality up to 250%\n• All resistances -100%\n• 40% of monsters have elemental immunity`;

        showDialog('Abyss Guardian', infoText, [
            {
                text: 'Challenge the Abyss (Weekly)',
                action: () => {
                    enterHell(); // Compat with old callers; forwards to the abyss system
                    closeDialog();
                }
            },
            {
                text: 'Come Back Later',
                action: () => {
                    closeDialog();
                }
            }
        ]);
    }
}

function enterHell() {
    // Kept for old callers; forwards to the abyss system
    if (typeof AbyssSystem !== 'undefined') {
        AbyssSystem.enter();
    } else {
        // Fallback (should not happen if abyss-system.js is loaded)
        player.isInHell = true;
        if (!player.hellFloor || player.hellFloor < 1) player.hellFloor = 1;
        enterFloor(player.hellFloor, 'start');
    }
}

function exitHell() {
    if (typeof AbyssSystem !== 'undefined' && AbyssSystem.isActive) {
        AbyssSystem.exit(false); // Return to town (the Hell guard lives in town, so always return there)
        return;
    }
// return to Rogue Encampment
    player.isInHell = false;
    showNotification('Returned to Rogue Encampment');
    updateHellIndicator();
    enterFloor(0, 'end');  // return to Rogue Encampment
}

function updateHellIndicator() {
// Show the completed total
    if (cachedUI.hellIndicator) {
        if (player.isInHell) {
            cachedUI.hellIndicator.style.display = 'block';
            cachedUI.hellIndicator.innerText = 'Hell';
        } else {
            cachedUI.hellIndicator.style.display = 'none';
        }
    }
}

function updateQuestUI() {
    const list = document.getElementById('quest-list');
    list.innerHTML = '';

// Get the current quest
    const statsDiv = document.createElement('div');
    statsDiv.style.marginBottom = '15px';
    statsDiv.style.color = '#888';
    statsDiv.style.fontSize = '12px';
    statsDiv.style.textAlign = 'center';
    statsDiv.innerText = typeof I18N !== 'undefined'
        ? I18N.t('quest_completed_count', { count: player.questIndex })
        : `Quests completed: ${player.questIndex}`;
    list.appendChild(statsDiv);

// Progress bar
    const q = getCurrentQuest();
    if (!q) return;

    const d = document.createElement('div');
    d.className = 'quest-item';
    d.style.background = 'rgba(0,0,0,0.6)';
    d.style.border = '1px solid #4a3b2a';
    d.style.padding = '15px';

    let statusText = typeof I18N !== 'undefined' ? I18N.t('quest_status_in_progress') : "In Progress";
    let colorClass = "";

    if (player.questState === 0) {
        statusText = typeof I18N !== 'undefined' ? I18N.t('quest_status_new') : "New Quest";
    } else if (player.questState === 1) {
        statusText = typeof I18N !== 'undefined' ? I18N.t('quest_status_in_progress') : "In Progress";
        if (q.type === 'kill_count') {
            const pct = Math.floor((player.questProgress / q.target) * 100);
            statusText += ` ${player.questProgress}/${q.target}`;
            // progress bar
            d.innerHTML += `<div style="width:100%; height:4px; background:#333; margin-top:5px; border-radius:2px;"><div style="width:${pct}%; height:100%; background:#c7b377;"></div></div>`;
        }
    } else if (player.questState === 2) {
        statusText = typeof I18N !== 'undefined' ? I18N.t('quest_status_turn_in') : "Ready to Turn In (see Akara)";
        colorClass = "completed";
    }

    const questRewardLabel = typeof I18N !== 'undefined' ? I18N.t('quest_reward') : "🎁 Rewards:";
    const questDesc = (typeof I18N !== 'undefined' && I18N.getQuestDesc) ? I18N.getQuestDesc(q) : q.desc;
    const questReward = (typeof I18N !== 'undefined' && I18N.getQuestReward) ? I18N.getQuestReward(q.reward) : q.reward;

    let html = `<div class="quest-title" style="font-size:16px; margin-bottom:8px; color:#c7b377;">${q.title} <span class="quest-status ${colorClass}" style="float:right; font-size:12px;">${statusText}</span></div>`;
    html += `<div style="font-size:13px; color:#ccc; margin-bottom:10px; line-height:1.4;">${questDesc}</div>`;
    html += `<div style="font-size:12px; color:#88ff88; margin-top:5px;">${questRewardLabel} ${questReward}</div>`;

    d.innerHTML = html + (d.innerHTML || '');
    list.appendChild(d);

    // daily questarea
    if (typeof DailyQuestSystem !== 'undefined') {
        DailyQuestSystem.updateUI();
    }
}

function updateQuestTracker() {
    const el = document.getElementById('quest-tracker');
    if (!el) return;

    // Use a separate sub-container to avoid clashing with daily quests
    let mainTracker = document.getElementById('main-quest-tracker');
    if (!mainTracker) {
        mainTracker = document.createElement('div');
        mainTracker.id = 'main-quest-tracker';
        el.insertBefore(mainTracker, el.firstChild);
    }

// Daily quest tracker (always updated, independent of the main quest)
    const currentQ = getCurrentQuest();
    if (!currentQ || player.questState === 0) {
        mainTracker.innerHTML = '';
    } else {
        let text = "";
        let titleColor = "#c7b377";

        if (player.questState === 2) {
            text = typeof I18N !== 'undefined' ? I18N.t('quest_ready_turn_in') : "Quest completed! Return to Akara";
            titleColor = "#0f0";
        } else {
            const locText = (typeof I18N !== 'undefined')
                ? ` (${I18N.t('quest_location', { floor: currentQ.floor, name: getFloorName(currentQ.floor) })})`
                : ` (Target: Floor ${currentQ.floor} "${getFloorName(currentQ.floor)}")`;
            if (currentQ.type === 'kill_count') {
                const progLabel = typeof I18N !== 'undefined' ? I18N.t('quest_progress') : 'Progress';
                text = `${progLabel}: ${player.questProgress} / ${currentQ.target}`;
                if (player.floor !== currentQ.floor) text += locText;
            } else if (currentQ.type === 'kill_elite' || currentQ.type === 'kill_boss') {
                const targetLabel = typeof I18N !== 'undefined' ? I18N.t('quest_target') : 'Objective';
                const monsterName = (typeof I18N !== 'undefined' && I18N.getMonsterName) ? I18N.getMonsterName(currentQ.targetName) : currentQ.targetName;
                text = `${targetLabel}: ${monsterName}`;
                if (player.floor !== currentQ.floor) text += locText;
            }
        }

        mainTracker.innerHTML = `<div><span class="tracker-title" style="color:${titleColor}">${currentQ.title}</span><br><span class="tracker-desc">${text}</span></div>`;
    }

// Statistics
    if (typeof DailyQuestSystem !== 'undefined') {
        DailyQuestSystem.updateTracker();
    }
}

function renderAchievements() {
    const list = document.getElementById('achievement-list');
    if (!list) return;
    list.innerHTML = '';

    // stats trackinginfo
    const stats = getAchievementStats();

// Category tabs
    const header = document.createElement('div');
    header.className = 'ach-header';
    header.innerHTML = `
        <div class="ach-stats">
            <span class="ach-completed">Done ${stats.completed}/${stats.total}</span>
            <span class="ach-points">Ach. Points ${stats.points}/${stats.maxPoints}</span>
        </div>
        <div class="ach-tabs" id="ach-tabs"></div>
    `;
    list.appendChild(header);

// Category tabs - plain text
    const tabsContainer = header.querySelector('#ach-tabs');
    const currentFilter = list.dataset.filter || 'kill';

// Use zh names instead of emoji
    Object.keys(ACHIEVEMENT_CATEGORIES).forEach(cat => {
        const catInfo = ACHIEVEMENT_CATEGORIES[cat];
        const tab = document.createElement('span');
        tab.className = 'ach-tab' + (currentFilter === cat ? ' active' : '');
        tab.style.color = currentFilter === cat ? catInfo.color : '';
        tab.textContent = catInfo.name;  // in usetextnameso as toun-emoji
        tab.onclick = () => { list.dataset.filter = cat; renderAchievements(); };
        tabsContainer.appendChild(tab);
    });

// Filter and render achievements
    const listContainer = document.createElement('div');
    listContainer.className = 'ach-list-container';
    list.appendChild(listContainer);

// Compute progress percentage
    const filteredAch = ACHIEVEMENTS.filter(ach =>
        ach.category === currentFilter
    );

    filteredAch.forEach(ach => {
        const progress = player.achievements[ach.id];
        if (!progress) return;

        const isCompleted = progress.completed;
        const catInfo = ACHIEVEMENT_CATEGORIES[ach.category] || {};

        const div = document.createElement('div');
        div.className = 'achievement-item' + (isCompleted ? ' completed' : '');

// Progress text
        let currentProgress = progress.progress || 0;
        let progressPercent = Math.min(100, Math.floor((currentProgress / ach.target) * 100));

        // progresstext
        let progressText = '';
        if (isCompleted) {
            progressText = '✓ Completed';
        } else if (ach.type === 'reach_floor') {
            progressText = `F ${player.floor}/${ach.target}`;
            progressPercent = Math.min(100, Math.floor((player.floor / ach.target) * 100));
        } else if (ach.type === 'reach_level') {
            progressText = `Lv.${player.lvl}/${ach.target}`;
            progressPercent = Math.min(100, Math.floor((player.lvl / ach.target) * 100));
        } else if (ach.type === 'total_damage' || ach.type === 'total_gold') {
// Add the left color bar
            const formatNum = n => n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n;
            progressText = `${formatNum(currentProgress)}/${formatNum(ach.target)}`;
        } else {
            progressText = `${currentProgress}/${ach.target}`;
        }

        div.innerHTML = `
            <div class="ach-content">
                <div class="ach-name">${ach.name} <span class="ach-pts">+${ach.points || 0}</span></div>
                <div class="ach-desc">${ach.description}</div>
                <div class="ach-bar-container">
                    <div class="ach-bar" style="width:${progressPercent}%;background:${isCompleted ? '#4a4' : catInfo.color || '#666'}"></div>
                </div>
                <div class="ach-progress-text">${progressText}</div>
            </div>
        `;
        // Add the left color bar
        div.style.borderLeftColor = catInfo.color || '#666';
        listContainer.appendChild(div);
    });
}

// Indicators helper (implemented with caching at bottom of file)

// Render the set codex panel

// Ensure discoveredSetPieces exists
function renderSetCollection() {
    const list = document.getElementById('set-collection-list');
    if (!list) return;

// Statistics
    if (!player.discoveredSetPieces) {
        player.discoveredSetPieces = {};
    }

    // stats trackingdata
    let discoveredSets = 0;
    let totalPieces = 0;

// Abyss set special handling
    for (const setId in SET_ITEMS) {
        if (setId === 'abyss_conqueror') continue; // Abyss set special handling
        const setData = SET_ITEMS[setId];
        const discovered = player.discoveredSetPieces[setId] || {};
        const ownedCount = Object.keys(discovered).length;
        if (ownedCount > 0) discoveredSets++;
        totalPieces += ownedCount;
    }

// Generate set card HTML
    const discoveredCountEl = document.getElementById('set-discovered-count');
    const piecesCountEl = document.getElementById('set-pieces-count');
    if (discoveredCountEl) discoveredCountEl.textContent = discoveredSets;
    if (piecesCountEl) piecesCountEl.textContent = totalPieces;

// Abyss set shown separately at the end
    let html = '';
    for (const setId in SET_ITEMS) {
        if (setId === 'abyss_conqueror') continue; // Abyss set shown separately at the end

        const setData = SET_ITEMS[setId];
        const discovered = player.discoveredSetPieces[setId] || {};
        const pieces = setData.pieces;
        const totalPiecesInSet = Object.keys(pieces).length;
        const ownedCount = Object.keys(discovered).length;
        const isDiscovered = ownedCount > 0;
        const equippedCount = player.equippedSets[setId] || 0;

        html += `
            <div class="set-card ${isDiscovered ? 'discovered' : 'locked'}" data-set-id="${setId}">
                <div class="set-card-header" onclick="toggleSetCard('${setId}')">
                    <div>
                        <div class="set-card-title">${isDiscovered ? setData.name : '??? Unknown Set'}</div>
                        ${isDiscovered ? `<div style="font-size:11px; color:#666; margin-top:2px;">${setData.description}</div>` : ''}
                    </div>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div class="set-card-progress">
                            <span class="collected">${ownedCount}</span>/${totalPiecesInSet}
                        </div>
                        <span class="set-card-toggle">▼</span>
                    </div>
                </div>
                <div class="set-pieces-grid">
                    ${renderSetPieces(setId, pieces, discovered)}
                </div>
                <div class="set-bonuses">
                    ${renderSetBonuses(setData.bonuses, equippedCount)}
                </div>
            </div>
        `;
    }

// Render the set pieces list
    const abyssSet = SET_ITEMS['abyss_conqueror'];
    if (abyssSet) {
        const abyssDiscovered = player.discoveredSetPieces['abyss_conqueror'] || {};
        const abyssPieces = abyssSet.pieces;
        const abyssTotalPieces = Object.keys(abyssPieces).length;
        const abyssOwnedCount = Object.keys(abyssDiscovered).length;
        const abyssIsDiscovered = abyssOwnedCount > 0;
        const abyssEquippedCount = player.equippedSets['abyss_conqueror'] || 0;

        html += `
            <div style="margin: 15px 10px 5px; padding-top: 10px; border-top: 1px solid #333;">
                <div style="color: #ff6600; font-size: 11px; margin-bottom: 8px;">🏆 Abyss Exclusive</div>
            </div>
            <div class="set-card ${abyssIsDiscovered ? 'discovered' : 'locked'}" data-set-id="abyss_conqueror" style="border-color: ${abyssIsDiscovered ? '#ff6600' : '#333'};">
                <div class="set-card-header" onclick="toggleSetCard('abyss_conqueror')">
                    <div>
                        <div class="set-card-title" style="color: ${abyssIsDiscovered ? '#ff6600' : '#666'};">${abyssIsDiscovered ? abyssSet.name : '??? Abyss Set'}</div>
                        ${abyssIsDiscovered ? `<div style="font-size:11px; color:#666; margin-top:2px;">${abyssSet.description}</div>` : ''}
                    </div>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div class="set-card-progress">
                            <span class="collected" style="color:#ff6600;">${abyssOwnedCount}</span>/${abyssTotalPieces}
                        </div>
                        <span class="set-card-toggle">▼</span>
                    </div>
                </div>
                <div class="set-pieces-grid">
                    ${renderSetPieces('abyss_conqueror', abyssPieces, abyssDiscovered)}
                </div>
                <div class="set-bonuses">
                    ${renderSetBonuses(abyssSet.bonuses, abyssEquippedCount)}
                </div>
            </div>
        `;
    }

    list.innerHTML = html;
}

// Render set bonuses
function renderSetPieces(setId, pieces, discovered) {
    let html = '';
    for (const pieceKey in pieces) {
        const piece = pieces[pieceKey];
        const isOwned = discovered[pieceKey];
        html += `
            <div class="set-piece-row ${isOwned ? 'owned' : ''}">
                <div class="set-piece-icon">${piece.icon}</div>
                <div class="set-piece-name">${isOwned ? piece.name : '???'}</div>
                <div class="set-piece-status">${isOwned ? '✓' : '—'}</div>
            </div>
        `;
    }
    return html;
}

// Toggle set card expand/collapse
function renderSetBonuses(bonuses, equippedCount) {
    let html = '';
    for (const count in bonuses) {
        const bonus = bonuses[count];
        const isActive = equippedCount >= parseInt(count);
        html += `
            <div class="set-bonus-row ${isActive ? 'active' : ''}">
                <div class="set-bonus-count">(${count})</div>
                <div class="set-bonus-desc">${bonus.desc}</div>
            </div>
        `;
    }
    return html;
}

// Record discovered set pieces (called on acquiring set items)
function toggleSetCard(setId) {
    const card = document.querySelector(`.set-card[data-set-id="${setId}"]`);
    if (card) {
        card.classList.toggle('expanded');
    }
}

// On a newly discovered piece, record and toast
function discoverSetPiece(item) {
    if (!item || !item.setId || !item.setPieceKey) return;

    if (!player.discoveredSetPieces) {
        player.discoveredSetPieces = {};
    }
    if (!player.discoveredSetPieces[item.setId]) {
        player.discoveredSetPieces[item.setId] = {};
    }

// ========== Monster codex system ==========
    if (!player.discoveredSetPieces[item.setId][item.setPieceKey]) {
        player.discoveredSetPieces[item.setId][item.setPieceKey] = true;

        const setData = SET_ITEMS[item.setId];
        if (setData) {
            const discoveredCount = Object.keys(player.discoveredSetPieces[item.setId]).length;
            const totalCount = Object.keys(setData.pieces).length;
            showNotification(`📚 Set piece discovered: ${item.name} (${discoveredCount}/${totalCount})`);
        }
    }
}

// ========== monster codexsystem ==========

// monster codexdata
const MONSTER_CODEX = {
    // Common monsters (names/desc are static EN fallbacks; I18N bestiary table overrides at render)
    monsters: [
        { type: 'melee', name: 'Fallen', desc: 'The most common demon creature of the underworld.', floor: 1, frameIndex: 0 },
        { type: 'zombie', name: 'Zombie', desc: 'Slow but with great vitality.', floor: 1, frameIndex: 3 },
        { type: 'ranged', name: 'Skeleton Archer', desc: 'Undead archer with ranged attacks.', floor: 2, frameIndex: 1 },
        { type: 'skeleton', name: 'Skeleton Warrior', desc: 'Aggressive bone swordsman.', floor: 2, frameIndex: 4 },
        { type: 'shaman', name: 'Fallen Shaman', desc: 'Shaman capable of reviving its allies.', floor: 3, frameIndex: 2 },
        { type: 'ghost', name: 'Ghost', desc: 'Phases through walls and dodges physical attacks.', floor: 4, frameIndex: 5 },
        { type: 'specter', name: 'Shock Spirit', desc: 'Ethereal specter that fires ranged bolts.', floor: 5, frameIndex: 6 },
        { type: 'mummy', name: 'Mummy', desc: 'Its attacks inflict poison damage.', floor: 6, frameIndex: 7 },
        { type: 'vampire', name: 'Vampire', desc: 'Creature of the shadows that steals life on attack.', floor: 7, frameIndex: 8 }
    ],
    // BOSSES
    bosses: [
        { type: 'bloodRaven', name: 'Blood Raven', desc: 'Fallen huntress expert in poison arrows.', floor: 2, frameIndex: 0 },
        { type: 'countess', name: 'The Countess', desc: 'Teleports and summons fire novas.', floor: 4, frameIndex: 1 },
        { type: 'butcher', name: 'The Butcher', desc: 'Fierce demon with life steal and charges.', floor: 5, frameIndex: 2 },
        { type: 'duriel', name: 'Treehead WoodFist', desc: 'Giant capable of summoning bone armies.', floor: 7, frameIndex: 3 },
        { type: 'diablo', name: 'Diablo', desc: 'Lord of Terror with voracious fire breaths.', floor: 9, frameIndex: 4 },
        { type: 'baal', name: 'Baal', desc: 'Lord of Destruction, the supreme challenge.', floor: 10, frameIndex: 5 }
    ]
};

// Update tab states
function switchCodexTab(tabName) {
    // Updatetabstate
    document.querySelectorAll('.codex-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
// Render the matching content
    document.querySelectorAll('.codex-content').forEach(content => {
        content.classList.toggle('active', content.id === `codex-${tabName}`);
    });
// Render the monster codex
    if (tabName === 'sets') {
        renderSetCollection();
    } else if (tabName === 'monsters') {
        renderMonsterCodex();
    }
}

// Rendermonster codex
function renderMonsterCodex() {
    const list = document.getElementById('monster-codex-list');
    if (!list) return;

// Count discoveries
    if (!player.discoveredMonsters) {
        player.discoveredMonsters = {};
    }

// Update stats
    const totalMonsters = MONSTER_CODEX.monsters.length + MONSTER_CODEX.bosses.length;
    const discoveredCount = Object.keys(player.discoveredMonsters).length;

    // Updatestats tracking
    const countEl = document.getElementById('monster-discovered-count');
    if (countEl) countEl.textContent = discoveredCount;

    let html = '';

    // normal monstersarea
    html += '<div class="monster-section-title">Normal Monsters</div>';
    MONSTER_CODEX.monsters.forEach(monster => {
        const discovered = player.discoveredMonsters[monster.type];
        const kills = discovered ? discovered.kills : 0;
        html += renderMonsterCard(monster, false, discovered, kills);
    });

    // BOSSarea
    html += '<div class="monster-section-title boss">Boss Monsters</div>';
    MONSTER_CODEX.bosses.forEach(boss => {
        const discovered = player.discoveredMonsters[boss.type];
        const kills = discovered ? discovered.kills : 0;
        html += renderMonsterCard(boss, true, discovered, kills);
    });

    list.innerHTML = html;

// Render one monster card
    requestAnimationFrame(() => {
        renderMonsterIcons();
    });
}

// Render the monster icon (sprite-drawn)
function renderMonsterCard(monster, isBoss, discovered, kills) {
    const isDiscovered = !!discovered;
    return `
        <div class="monster-card ${isBoss ? 'boss' : ''} ${isDiscovered ? 'discovered' : 'locked'}" data-type="${monster.type}" data-is-boss="${isBoss}">
            <div class="monster-icon" data-frame="${monster.frameIndex}" data-is-boss="${isBoss}">
                ${isDiscovered ? `<canvas width="48" height="48"></canvas>` : `<span class="unknown-icon">?</span>`}
            </div>
            <div class="monster-info">
                <div class="monster-name">${isDiscovered ? monster.name : '???'}</div>
                <div class="monster-desc">${isDiscovered ? monster.desc : 'Not yet discovered'}</div>
                ${isDiscovered ? `<div class="monster-floor">Appears on Floor ${monster.floor}${isBoss ? '+' : ''}</div>` : ''}
            </div>
            ${isDiscovered ? `
                <div class="monster-kills">
                    <div class="count">${kills}</div>
                    <div>Slain</div>
                </div>
            ` : ''}
        </div>
    `;
}

// Record discovered monsters (called on kill)
function renderMonsterIcons() {

    document.querySelectorAll('.monster-icon canvas').forEach(canvas => {
        const parent = canvas.parentElement;
        const frameIndex = parseInt(parent.dataset.frame);
        const isBoss = parent.dataset.isBoss === 'true';

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 48, 48);

        const monsterType = canvas.closest('.monster-card').dataset.type;
        const frame = getMonsterSpriteFrame({ monsterType, frameIndex, isBoss, facingDirection: 'front', monsterAnimTime: 0 });
        if (frame) drawMonsterSprite(ctx, processedMonsterSprites, frame, 24, 48, 60, 60);
    });
}

// Record discovered monsters (called on kill)
function discoverMonster(enemy) {
    if (!enemy) return;

    if (!player.discoveredMonsters) {
        player.discoveredMonsters = {};
    }

    // Get monster type
    let monsterType = enemy.monsterType;

    // Boss special handling
    if (enemy.isBoss) {
        // Reverse-lookup boss type by name（Handles legacy zh/ES prefixes and new EN prefixes）
        const cleanName = (typeof stripBossDifficultyPrefix === 'function') ? stripBossDifficultyPrefix(enemy.name || '') : (enemy.name || '');
        const bossEntry = MONSTER_CODEX.bosses.find(b => b.name === cleanName);
        if (bossEntry) {
            monsterType = bossEntry.type;
        }
    }

    if (!monsterType) return;

    // On first discovery
    if (!player.discoveredMonsters[monsterType]) {
        player.discoveredMonsters[monsterType] = { kills: 0, firstKillTime: Date.now() };

        // Look up monster info
        const monsterInfo = [...MONSTER_CODEX.monsters, ...MONSTER_CODEX.bosses].find(m => m.type === monsterType);
        if (monsterInfo) {
            const isBoss = MONSTER_CODEX.bosses.some(b => b.type === monsterType);
            showNotification(`📖 ${isBoss ? 'Boss' : 'Monster'} discovered: ${monsterInfo.name}`);
        }
    }

// Legacy save migration: scan owned set items to fill the codex
    player.discoveredMonsters[monsterType].kills++;
}

// Reverse-lookup set info by item name
function migrateSetCollection() {
    if (!player.discoveredSetPieces) {
        player.discoveredSetPieces = {};
    }

    let migratedCount = 0;

// Handle one item
    function findSetInfoByName(itemName) {
        for (const setId in SET_ITEMS) {
            const setData = SET_ITEMS[setId];
            for (const pieceKey in setData.pieces) {
                if (setData.pieces[pieceKey].name === itemName) {
                    return { setId, pieceKey };
                }
            }
        }
        return null;
    }

// Without a setPieceKey, try looking it up by name
    function processItem(item) {
        if (!item) return;

        let setId = item.setId;
        let pieceKey = item.setPieceKey;

        // ifno setPieceKey，try toby namelook up
        if (item.rarity === RARITY.SET && (!setId || !pieceKey)) {
            const found = findSetInfoByName(item.name);
            if (found) {
                setId = found.setId;
                pieceKey = found.pieceKey;
                // fixitemdata
                item.setId = setId;
                item.setPieceKey = pieceKey;
            }
        }

        if (setId && pieceKey) {
            if (!player.discoveredSetPieces[setId]) {
                player.discoveredSetPieces[setId] = {};
            }
            if (!player.discoveredSetPieces[setId][pieceKey]) {
                player.discoveredSetPieces[setId][pieceKey] = true;
                migratedCount++;
            }
        }
    }

    // scaninventory
    player.inventory.forEach(processItem);

    // scanstash
    player.stash.forEach(processItem);

// Monster spawning stops only in town (continues in Hell)
    for (const slot in player.equipment) {
        processItem(player.equipment[slot]);
    }

    if (migratedCount > 0) {
        console.log(`[Set codex] migrated ${migratedCount} set item(s) to the codex`);
    }
}

function rebuildEnemySpawnCandidates() {
    enemySpawnCandidates = [];
    for (let y = 1; y < MAP_HEIGHT - 1; y++) {
        for (let x = 1; x < MAP_WIDTH - 1; x++) {
            if (!hasFloorAtTile(x, y)) continue;
            enemySpawnCandidates.push({
                x: x * TILE_SIZE + TILE_SIZE / 2,
                y: y * TILE_SIZE + TILE_SIZE / 2
            });
        }
    }
}

function findEnemySpawnPosition(minDistance = GAME_CONFIG.ENEMY_SPAWN_MIN_DISTANCE, maxAttempts = 64) {
    if (enemySpawnCandidates.length === 0) rebuildEnemySpawnCandidates();
    if (enemySpawnCandidates.length === 0) return null;

    const distanceSteps = [minDistance, Math.min(minDistance, 180), Math.min(minDistance, 100), Math.min(minDistance, 40), 0]
        .filter((value, index, values) => value >= 0 && values.indexOf(value) === index);

    for (const requiredDistance of distanceSteps) {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const candidate = enemySpawnCandidates[Math.floor(Math.random() * enemySpawnCandidates.length)];
            if (Math.hypot(candidate.x - player.x, candidate.y - player.y) < requiredDistance) continue;
            return { x: candidate.x, y: candidate.y };
        }

        const startIndex = Math.floor(Math.random() * enemySpawnCandidates.length);
        for (let offset = 0; offset < enemySpawnCandidates.length; offset++) {
            const candidate = enemySpawnCandidates[(startIndex + offset) % enemySpawnCandidates.length];
            if (Math.hypot(candidate.x - player.x, candidate.y - player.y) < requiredDistance) continue;
            return { x: candidate.x, y: candidate.y };
        }
    }

    return null;
}

function getDynamicEnemyTargetCount() {
    if (typeof AutoBattle !== 'undefined' && AutoBattle.enabled) return Math.min(GAME_CONFIG.MAX_ENEMIES, GAME_CONFIG.AUTO_BATTLE_ENEMY_TARGET);
    return Math.min(GAME_CONFIG.MAX_ENEMIES, Math.max(GAME_CONFIG.INITIAL_ENEMIES, Math.floor(GAME_CONFIG.MAX_ENEMIES * 0.65)));
}

function spawnEnemyTimer() {
    if (enemySpawnIntervalId !== null) return;

    enemySpawnIntervalId = setInterval(() => {
        if (document.hidden) return;

        const aliveEnemies = countAliveEnemiesDirect();
// Build the monster pool for the current floor
        if (!gameActive || aliveEnemies >= GAME_CONFIG.MAX_ENEMIES || isInTown()) return;

        const targetEnemies = getDynamicEnemyTargetCount();
        if (aliveEnemies >= targetEnemies) return;
        const batchSize = (typeof AutoBattle !== 'undefined' && AutoBattle.enabled) ? GAME_CONFIG.AUTO_BATTLE_SPAWN_BATCH_SIZE : GAME_CONFIG.ENEMY_SPAWN_BATCH_SIZE;
        const spawnCount = Math.min(batchSize, targetEnemies - aliveEnemies, GAME_CONFIG.MAX_ENEMIES - aliveEnemies);

        const f = getCurrentCombatFloor();
        const hp = 30 + Math.floor(f * f * 5);
        const dmg = 5 + f * 2;
        const xp = 20 + f * 5;

// Floor 1+: Zombies
        const monsterPool = [
            { type: 'melee', name: 'Fallen', ai: 'chase', speed: 80, hpMult: 1, dmgMult: 1, weight: 20 }
        ];

        // 1layer+: zombie
        if (f >= 1) {
            monsterPool.push({ type: 'zombie', name: 'Zombie', ai: 'chase', speed: 50, hpMult: 1.5, dmgMult: 0.8, weight: 20 });
        }
// Floor 3+: Fallen One Shamans
        if (f >= 2) {
            monsterPool.push({ type: 'ranged', name: 'Skeleton Archer', ai: 'ranged', speed: 70, hpMult: 1, dmgMult: 1, weight: 20 });
            monsterPool.push({ type: 'skeleton', name: 'Skeleton Warrior', ai: 'chase', speed: 85, hpMult: 1, dmgMult: 1, weight: 15 });
        }
        // Floor 3+: Fallen One Shamans
        if (f >= 3) {
            monsterPool.push({ type: 'shaman', name: 'Fallen Shaman', ai: 'revive', speed: 60, hpMult: 1, dmgMult: 1, weight: 10 });
        }
// Floor 5+: Lightning Spectres
        if (f >= 4) {
            monsterPool.push({ type: 'ghost', name: 'Ghost', ai: 'phase', speed: 90, hpMult: 0.6, dmgMult: 1.2, weight: 12 });
        }
        // Floor 5+: Lightning Spectres
        if (f >= 5) {
            monsterPool.push({ type: 'specter', name: 'Shock Spirit', ai: 'specter', speed: 70, hpMult: 0.8, dmgMult: 1.4, weight: 10 });
        }
        // Floor 6+: Mummies
        if (f >= 6) {
            monsterPool.push({ type: 'mummy', name: 'Mummy', ai: 'chase', speed: 55, hpMult: 1.3, dmgMult: 0.9, weight: 10 });
        }
        // 7layer+: life leechghost
        if (f >= 7) {
            monsterPool.push({ type: 'vampire', name: 'Vampirism', ai: 'vampire', speed: 60, hpMult: 1.2, dmgMult: 1.3, weight: 10 });
        }

        for (let spawnIndex = 0; spawnIndex < spawnCount; spawnIndex++) {
            const spawnPos = findEnemySpawnPosition();
            if (!spawnPos) continue;

// Elites keep their look; only the name gains a prefix
            const totalWeight = monsterPool.reduce((sum, m) => sum + m.weight, 0);
            let rand = Math.random() * totalWeight;
            let selected = monsterPool[0];
            for (const monster of monsterPool) {
                rand -= monster.weight;
                if (rand <= 0) {
                    selected = monster;
                    break;
                }
            }

            let type = selected.type;
            let name = selected.name;
            let ai = selected.ai;
            let speed = selected.speed;
            let hpMult = selected.hpMult;
            let dmgMult = selected.dmgMult;

            let frameIndex = MONSTER_FRAMES[type];
            const isElite = Math.random() < GAME_CONFIG.ELITE_SPAWN_RATE;

            if (isElite) {
// Apply the monster type's stat multipliers
                name = `Elite ${name}`;

            }

// Monster type tag
            const finalHp = Math.floor(hp * hpMult);
            const finalDmg = Math.floor(dmg * dmgMult);

            const enemy = EnemyPool.acquire({
                x: spawnPos.x, y: spawnPos.y, hp: finalHp, maxHp: finalHp, dmg: finalDmg, speed, radius: 12,
                dead: false, cooldown: 0, hitFlashTimer: 0, name, rarity: isElite ? 1 : 0, xpValue: xp,
                ai: ai, frameIndex: frameIndex,
                monsterType: type,              // Elite affix list
                eliteAffixes: [],               // Elite marker
                isElite: isElite                // elitemarker
            });

            applyMonsterBaseTraits(enemy, type, finalDmg);
            if (isElite) enemy.eliteAffixes = rollEliteAffixesForEnemy(enemy);

// Ghost dodge detection
            applyEliteAffixesToEnemy(enemy);

            enemies.push(enemy);
        }
    }, GAME_CONFIG.ENEMY_SPAWN_INTERVAL);
}

function takeDamage(e, dmg, isSkillDamage = false) {
    dmg = SkillBranchSystem.amplify(e, dmg);
    const feedbackAngle = Math.atan2(e.y - player.y, e.x - player.x);

// Handle the new damage system: physical and elemental
    if (e.dodgeChance && Math.random() < e.dodgeChance) {
        spawnVfxEffect(COMBAT_FEEDBACK_VFX.guardFlash, e.x, e.y - 8, 0.7, feedbackAngle);
        createDamageNumber(e.x, e.y - 20, "Dodge!", '#aaaaaa');
        return;
    }
    if (e.blockChance && !isSkillDamage && (typeof CombatTactics === 'undefined' || e.monsterType !== 'skeleton') && Math.random() < e.blockChance) {
        e.hitFlashTimer = 0.06;
        Juice.hit(e, false, false);
        spawnVfxEffect(COMBAT_FEEDBACK_VFX.guardFlash, e.x, e.y - 8, 0.8, feedbackAngle);
        createDamageNumber(e.x, e.y - 20, "Block!", '#dddddd');
        AudioSys.play('melee_hit');
        return;
    }

// Compat with old callers: plain numeric damage
    let totalDamage = 0;
    const isCrit = typeof dmg === 'object' && dmg.isCrit;
    const angle = feedbackAngle;

    if (typeof dmg === 'number') {
        // kept for old callers:purevaluedamage
        totalDamage = dmg;
    } else if (typeof dmg === 'object') {
// Physical damage (affected by armor)
// Simplified for now: armor reduces damage by 10%
        if (dmg.physical) {
            const armorReduction = e.armor ? e.armor * 0.1 : 0;  // for nowsimpleize:armordecrease10%damage
            totalDamage += Math.max(1, dmg.physical - armorReduction);
        }

// Future extension: if (e.resistances) { ... }
// ========== Talent effect application ==========
        totalDamage += (dmg.fire || 0);
        totalDamage += (dmg.cold || 0);
        totalDamage += (dmg.lightning || 0);
        totalDamage += (dmg.poison || 0);
    }

// Base damage bonus talents
// Death protection: Rage buff damage bonus (retention polish 3.1)
    const talentDmgPct = getTalentEffect('dmgPct', 0);
    if (talentDmgPct > 0) {
        totalDamage *= (1 + talentDmgPct / 100);
    }

// Executioner: double damage against low-HP enemies
    if (player.rageBonus && player.rageBonus > 0) {
        totalDamage *= (1 + player.rageBonus);
    }

    // Executioner: double damage against low-HP enemies
    if (hasTalent('executioner')) {
        const threshold = TALENTS.executioner.effect.executeThreshold;
        if (e.hp / e.maxHp < threshold) {
            totalDamage *= 2;
            createDamageNumber(e.x, e.y - 25, "Execute!", '#ff4444', angle);
        }
    }

    // Gambler: damage randomly fluctuates
    if (hasTalent('gambler')) {
        const mult = 0.5 + Math.random() * 1.5; // 0.5 ~ 2.0
        totalDamage *= mult;
        if (mult > 1.5) createDamageNumber(e.x, e.y - 25, "Lucky!", '#ffff00', angle);
        else if (mult < 0.7) createDamageNumber(e.x, e.y - 25, "Unlucky...", '#888888', angle);
    }

    // Flame Soul: adds fire damage
    if (hasTalent('flame_soul')) {
        const fireDmg = totalDamage * 0.3;
        totalDamage += fireDmg;
    }

    // Poisoned Blade: adds poison damage
    if (hasTalent('poison_blade')) {
        const poisonDmg = totalDamage * 0.25;
        totalDamage += poisonDmg;
    }

// Magic Resistance: 70% skill damage reduction
    if (e.eliteAffixes && e.eliteAffixes.length > 0) {
        // Magic Resistance: 70% skill damage reduction
        if (isSkillDamage && e.magicResist) {
            totalDamage *= (1 - e.magicResist);
            createDamageNumber(e.x, e.y - 20, "Resisted!", '#aa00ff', angle);
        }

        // Stone Skin: all damage reduced 50%
        if (e.damageReduction) {
            totalDamage *= (1 - e.damageReduction);
        }
    }

    if (typeof CombatTactics !== 'undefined') totalDamage *= CombatTactics.multiplier(e, isSkillDamage);
    // Round to avoid floating-point precision issues
    totalDamage = Math.floor(totalDamage);
    if (totalDamage < 1) totalDamage = 1; // mindamage1tap

    e.hp -= totalDamage;
    if (typeof CombatTactics !== 'undefined') CombatTactics.hit(e, totalDamage, isSkillDamage);
    e.hitFlashTimer = 0.1; // Achievement tracking: cumulative damage and crits
    e.hitReactDuration = isCrit ? 0.16 : 0.12;
    e.hitReactTimer = e.hitReactDuration;
    e.hitReactX = Math.cos(angle) * (isCrit ? 7 : 4);
    e.hitReactY = Math.sin(angle) * (isCrit ? 5 : 3);
    e.hitTilt = -Math.sin(angle) * (isCrit ? 0.14 : 0.08);
    setMonsterFacingToward(e, player.x, player.y, isSkillDamage ? 0.12 : 0.18);
    triggerMonsterAction(e, 'hurt', isSkillDamage ? 0.12 : 0.16);

// Knockback logic (micro-knockback)
    trackAchievement('total_damage', { damage: Math.floor(totalDamage) });
    if (isCrit) trackAchievement('crit_count');

// One hit emits a single set of chunky material shards; no status-tinted dots or repeated rings.
    const kbForce = e.pendingSkill || e.combatCue ? 0 : (isCrit ? 12 : 6);
    const nx = e.x + Math.cos(angle) * kbForce;
    const ny = e.y + Math.sin(angle) * kbForce;
    if (typeof isWall !== 'undefined') {
        if (!isWall(nx, e.y)) e.x = nx;
        if (!isWall(e.x, ny)) e.y = ny;
    } else {
        e.x = nx; e.y = ny;
    }

// Crits use bigger 3D shards and gold damage numbers; no longer stack white circular flash bursts.
    const impactProfile = getMonsterImpactProfile(e);
    createImpactParticles(e.x, e.y - 8, impactProfile.color, isCrit ? 5 : 3, angle);
    // Crits use bigger 3D shards and gold damage numbers; no longer stack white circular flash bursts.

    // triggerhit feedback
    Juice.hit(e, isCrit, e.hp <= 0);

// Elemental status handling
    DestructibleSystem.checkMeleeCollision(e.x, e.y, 40);

// Frost: slow/freeze handled in each skill; this only adds visual timing
    if (typeof dmg === 'object') {
        if (dmg.cold > 0) {
// Lightning: set the overload visuals
            e.slowedTimer = Math.max(e.slowedTimer || 0, 2.0);
        }
        if (dmg.lightning > 0) {
// Poisoned Blade applies poison DoT
            const wasOverloaded = e.lightningOverloadTimer > 0;
            e.lightningOverloadTimer = 0.5;
            if (!wasOverloaded) spawnVfxEffect('lightningOverloadStatus', e.x, e.y + 4, 0.9, 0);
        }
    }

    // Poisoned Blade applies poison DoT
    if (hasTalent('poison_blade')) {
        const poisonVal = (typeof dmg === 'object' && dmg.poison) ? dmg.poison : (totalDamage * 0.2);
        if (poisonVal > 0) {
            if (!e.poisoned) {
                spawnVfxEffect('poisonStatusBurst', e.x, e.y + 4, 0.9, angle);
                createDamageNumber(e.x, e.y - 25, "Poisoned!", COLORS.poison, angle);
            }
            e.poisoned = true;
            e.poisonTimer = 3.0; // 3secondpoison
            e.poisonDamagePerTick = poisonVal * 0.5; // perjumpdamage
        }
    }

// Layered hit SFX trigger
    let dmgColor = '#fff';
    if (typeof dmg === 'object') {
        if (dmg.poison > (dmg.physical || 0)) dmgColor = COLORS.poison;
        else if (dmg.cold > (dmg.physical || 0)) dmgColor = COLORS.ice;
        else if (dmg.lightning > (dmg.physical || 0)) dmgColor = COLORS.lightning;
        else if (dmg.fire > (dmg.physical || 0)) dmgColor = COLORS.fire;
    }

    createDamageNumber(e.x, e.y, Math.floor(totalDamage), isCrit ? COLORS.critical : dmgColor, angle, e);

// If the text matches the achievement-complete pattern, forward to the fancy slide-in banner
    if (e.hp <= 0) {
        if (!e.isBoss && !e.isElite) {
            AudioSys.play(isSkillDamage ? 'hit_kill' : 'melee_kill');
        }
    } else if (isCrit) {
        AudioSys.play(isSkillDamage ? 'hit_crit' : 'melee_crit');
    } else {
        AudioSys.play(isSkillDamage ? 'hit' : 'melee_hit');
    }

    if (e.hp <= 0) finalizeEnemyDeath(e, totalDamage);
}

let standardNotificationTimeout = null;

function showNotification(msg) {
    if (typeof I18N !== 'undefined') {
        if (typeof I18N.translateNotification === 'function') {
            msg = I18N.translateNotification(msg);
        } else {
            const notifMap = {
                'Welcome back to Rogue Encampment': 'notif_welcome_town',
                'Inventory is full!': 'notif_inv_full',
                'Your bag is full': 'notif_inv_full',
                'Not enough gold': 'notif_no_gold',
                'Not enough gold!': 'notif_no_gold',
                'Not enough mana': 'notif_no_mana',
                'Not enough mana!': 'notif_no_mana',
                'Game saved': 'notif_game_saved',
                'Enhancement succeeded!': 'notif_upgraded',
                'Enhancement failed': 'notif_failed'
            };
            if (notifMap[msg]) {
                msg = I18N.t(notifMap[msg]);
            }
        }
    }

// ========== Talent shop logic ==========
    if (typeof msg === 'string') {
        const achMatch = msg.match(/^成就完成：(.+)！$/);
        if (achMatch && typeof ACHIEVEMENTS !== 'undefined') {
            const achObj = ACHIEVEMENTS.find(a => a.name === achMatch[1]);
            if (achObj) {
                showAchievementUnlockNotification(achObj);
                return;
            }
        }
    }

    const standardSlot = document.getElementById('standard-notify-slot');
    if (standardSlot) {
        standardSlot.innerText = msg;
        standardSlot.style.opacity = '1';
        if (standardNotificationTimeout) clearTimeout(standardNotificationTimeout);
        standardNotificationTimeout = setTimeout(() => {
            standardSlot.style.opacity = '0';
        }, 2000);
    } else if (cachedUI.notificationArea) {
        cachedUI.notificationArea.innerText = msg;
        cachedUI.notificationArea.style.opacity = '1';
        if (standardNotificationTimeout) clearTimeout(standardNotificationTimeout);
        standardNotificationTimeout = setTimeout(() => {
            if (cachedUI.notificationArea) cachedUI.notificationArea.style.opacity = '0';
        }, 2000);
    }
}

// ========== Talent shop systemlogic ==========

// Get the talent effect value
function hasTalent(talentId) {
    return player.talents.includes(talentId);
}

// Randomly refresh the talent shop (3 talents)
function getTalentEffect(effectKey, defaultValue = 0) {
    let total = defaultValue;
    for (const talentId of player.talents) {
        const talent = TALENTS[talentId];
        if (talent && talent.effect && talent.effect[effectKey] !== undefined) {
            total += talent.effect[effectKey];
        }
    }
    return total;
}

// Exclude owned ones
function generateTalentShop() {
    const currentFloor = player.isInHell ? player.hellFloor : player.floor;
    const allTalentIds = Object.keys(TALENTS);

    const availableTalents = allTalentIds.filter(id => {
// Legendary talents only appear after floor 5
        if (player.talents.includes(id)) return false;
        // Legendary talents only appear after floor 5
        if (TALENTS[id].tier === 'legendary' && currentFloor < 5) return false;
        return true;
    });

// Pending next-floor info (used after confirming the talent shop)
    const shopTalents = [];
    const shuffled = availableTalents.sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(3, shuffled.length); i++) {
        shopTalents.push(shuffled[i]);
    }

    player.talentShop = shopTalents;
    return shopTalents;
}

// Whether the talent shop is open (pauses the game)
let pendingNextFloor = null;
// Free in abyss mode
let talentShopOpen = false;
let talentShopIsFree = false; // abyss modedownfree
// Talent cap
let autoBattleFeeNoticeOpen = false;

// talentcap
const MAX_TALENTS = 5;

// Show talent shop (call before going downstairs)
// isHell: whether Hell mode
// isHell: isnoisHell mode
// isFree: whetherfree（abyss mode）
function showTalentShop(nextFloor, isHell = false, isFree = false) {
// Not shown on Hell floor 1 either (just entered)
    if (nextFloor === 1 && !isHell) {
        proceedToNextFloor(nextFloor, isHell);
        return;
    }

// Prevents shop farming by re-entering floors: triggers only on deeper floors
    if (nextFloor === 1 && isHell) {
        proceedToNextFloor(nextFloor, isHell);
        return;
    }

// Hell and normal modes tracked separately
// Shop already triggered at or above this floor: enter directly
    const highestKey = isHell ? 'highestHellTalentFloor' : 'highestTalentFloor';
    const currentHighest = player[highestKey] || 0;

    if (nextFloor <= currentHighest) {
// Talents full: enter the next floor directly
        proceedToNextFloor(nextFloor, isHell);
        return;
    }

// Update the deepest triggered floor
    if (player.talents.length >= MAX_TALENTS) {
        proceedToNextFloor(nextFloor, isHell);
        return;
    }

// Store the pending floor info
    player[highestKey] = nextFloor;

// Generate shop talents
    pendingNextFloor = { floor: nextFloor, isHell: isHell };
    talentShopIsFree = isFree;

// Update UI
    generateTalentShop();

    // UpdateUI
    const overlay = document.getElementById('talent-shop-overlay');
    const floorEl = document.getElementById('talent-shop-floor');
    const goldEl = document.getElementById('talent-shop-gold');
    const gridEl = document.getElementById('talent-grid');

    floorEl.innerText = (isHell ?
        (typeof I18N !== 'undefined' ? I18N.t('talent_entering_abyss', { floor: nextFloor }) : `Entering Abyss Floor ${nextFloor}`) :
        (typeof I18N !== 'undefined' ? I18N.t('talent_entering_floor', { floor: nextFloor }) : `Entering Floor ${nextFloor}`)) +
        (isFree ? (' ' + (typeof I18N !== 'undefined' ? I18N.t('talent_free_pick') : '(Free Pick)')) : '');
    goldEl.innerText = player.gold;

// Show the shop
    gridEl.innerHTML = '';
    for (const talentId of player.talentShop) {
        const talent = TALENTS[talentId];
        if (!talent) continue;

        const isOwned = player.talents.includes(talentId);
        const canAfford = isFree ? true : player.gold >= talent.price;
        const displayPrice = isFree ?
            (typeof I18N !== 'undefined' ? I18N.t('talent_free') : "Free") :
            (typeof I18N !== 'undefined' ? I18N.t('talent_price_gold', { price: talent.price }) : `${talent.price} G`);
        const talentName = (typeof I18N !== 'undefined' && typeof I18N.getTalentName === 'function') ? I18N.getTalentName(talentId) : talent.name;
        const talentDesc = (typeof I18N !== 'undefined' && typeof I18N.getTalentDesc === 'function') ? I18N.getTalentDesc(talentId) : talent.desc;

        const card = document.createElement('div');
        card.className = `talent-card tier-${talent.tier}`;
        if (isOwned) card.classList.add('owned');
        if (!canAfford && !isOwned) card.classList.add('cant-afford');

        card.innerHTML = `
            <div class="talent-card-icon">${talent.icon}</div>
            <div class="talent-card-name" style="color: ${TALENT_TIER_COLORS[talent.tier]}">${talentName}</div>
            <div class="talent-card-desc">${talentDesc}</div>
            <div class="talent-price">${displayPrice}</div>
        `;

        if (!isOwned) {
            card.onclick = () => buyTalent(talentId);
        }

        gridEl.appendChild(card);
    }

    // Showshop
    overlay.classList.add('active');
    talentShopOpen = true;  // pausegame

// Confirm entering the next floor
    const refreshCostEl = document.getElementById('refresh-cost-display');
    if (refreshCostEl) {
        const nextRefreshCost = 30 * Math.pow(2, player.talentRefreshCount || 0);
        refreshCostEl.innerText = typeof I18N !== 'undefined' ? I18N.t('talent_refresh_cost', { cost: nextRefreshCost }) : `${nextRefreshCost}G`;
    }

    AudioSys.play('pickup');
}

// Daily quest: clear a floor (entering the next means the current was cleared)
function proceedToNextFloor(floor, isHell) {
// Sync the floor with the abyss system
    if (typeof DailyQuestSystem !== 'undefined' && floor > 1) {
        DailyQuestSystem.updateProgress('clear_floor', 1);
    }

    if (isHell) {
        player.isInHell = true;
// Players can walk out directly; after entering floor 1 the tutorial switches to combat steps, avoiding a stuck town step.
        if (typeof AbyssSystem !== 'undefined' && AbyssSystem.isActive) {
            AbyssSystem.currentFloor = floor;
        }
        enterFloor(floor, 'start');
    } else {
        enterFloor(floor, 'start');
    }
// Buy talent
    if (floor === 1 && !isHell && !player.tutorial.completed) {
        player.tutorial.step = Math.max(player.tutorial.step, TUTORIAL_TOWN_STEPS.length);
        hideTutorialBubble();
        setTimeout(() => showTutorialTip(player.tutorial.step), 800);
    }
}

// Check whether already owned
function buyTalent(talentId) {
    const talent = TALENTS[talentId];
    if (!talent) return;

    // Checkisnoowned
    if (player.talents.includes(talentId)) {
        showNotification('You already have this talent!');
        return;
    }

// In free mode (abyss), skip the gold check
    // ifisfreemode(abyss)，notcheck gold
    if (!talentShopIsFree && player.gold < talent.price) {
        showNotification('Not enough gold!');
        AudioSys.play('ui_error');
        return;
    }

    // deductiongold (onlyun-freemode)
    if (!talentShopIsFree) {
        player.gold -= talent.price;
    }

    // addtalent
    player.talents.push(talentId);

    // play SFXandnotify
    AudioSys.play('levelup');
    showNotification(`Acquired talent: ${talent.name}!`);

    // UpdateHUD
    updateTalentHUD();

// Save the game
    trackAchievement('talent_bought');

    // Savegame
    SaveSystem.save();

// Refresh the talent shop (cost doubles: 30 -> 60 -> 120 -> 240...)
    closeTalentShop();
}

// Re-render the shop
function refreshTalentShop() {
    const baseRefreshCost = 30;
    const refreshCost = baseRefreshCost * Math.pow(2, player.talentRefreshCount || 0);

    if (player.gold < refreshCost) {
        showNotification(`Not enough gold! Requires ${refreshCost} G`);
        AudioSys.play('ui_error');
        return;
    }

    player.gold -= refreshCost;
    player.talentRefreshCount = (player.talentRefreshCount || 0) + 1;
    generateTalentShop();

// Generate talent cards
    const goldEl = document.getElementById('talent-shop-gold');
    const gridEl = document.getElementById('talent-grid');

    goldEl.innerText = player.gold;

// Update the refresh cost display (shows the next refresh's price)
    gridEl.innerHTML = '';
    for (const talentId of player.talentShop) {
        const talent = TALENTS[talentId];
        if (!talent) continue;

        const isOwned = player.talents.includes(talentId);
        const canAfford = player.gold >= talent.price;

        const card = document.createElement('div');
        card.className = `talent-card tier-${talent.tier}`;
        if (isOwned) card.classList.add('owned');
        if (!canAfford && !isOwned) card.classList.add('cant-afford');

        card.innerHTML = `
            <div class="talent-card-icon">${talent.icon}</div>
            <div class="talent-card-name" style="color: ${TALENT_TIER_COLORS[talent.tier]}">${talent.name}</div>
            <div class="talent-card-desc">${talent.desc}</div>
            <div class="talent-price">${talent.price} G</div>
        `;

        if (!isOwned) {
            card.onclick = () => buyTalent(talentId);
        }

        gridEl.appendChild(card);
    }

// Close the talent shop and enter the next floor
    const refreshCostEl = document.getElementById('refresh-cost-display');
    if (refreshCostEl) {
        const nextRefreshCost = 30 * Math.pow(2, player.talentRefreshCount || 0);
        refreshCostEl.innerText = `${nextRefreshCost}G`;
    }

    AudioSys.play('pickup');
}

// Resume the game
function closeTalentShop() {
    talentShopOpen = false;  // restoregame
    talentShopIsFree = false; // Resetfreestate
    const overlay = document.getElementById('talent-shop-overlay');
    overlay.classList.remove('active');

// Update the talent HUD display
    if (pendingNextFloor) {
        proceedToNextFloor(pendingNextFloor.floor, pendingNextFloor.isHell);
        pendingNextFloor = null;
    }
}

// UpdatetalentHUDShow
function updateTalentHUD() {
    const hudEl = document.getElementById('talent-hud');
    if (!hudEl) return;

// no pointer cursor
    hudEl.querySelectorAll('.talent-hud-icon:not(.buff-hud-icon)').forEach(el => el.remove());

    for (const talentId of player.talents) {
        const talent = TALENTS[talentId];
        if (!talent) continue;

        const icon = document.createElement('div');
        icon.className = `talent-hud-icon tier-${talent.tier}`;
        icon.innerText = talent.icon;
        icon.style.cursor = 'default'; // no pointer cursor

// Stop click-through to the game canvas
        icon.addEventListener('mouseenter', (e) => {
            const tooltip = document.getElementById('tooltip');
            const tierColors = { normal: '#888', rare: '#4850b8', epic: '#a335ee', legendary: '#ff8000' };
            const tierColor = tierColors[talent.tier] || '#888';
            tooltip.innerHTML = `<div style="color:${tierColor}; font-weight:bold; margin-bottom:4px;">${talent.icon} ${talent.name}</div>
                <div style="color:#88ff88;">${talent.desc}</div>`;
            tooltip.style.display = 'block';
            tooltip.style.left = (e.clientX + 10) + 'px';
            tooltip.style.top = (e.clientY + 10) + 'px';
        });
        icon.addEventListener('mouseleave', () => {
            document.getElementById('tooltip').style.display = 'none';
        });
        icon.addEventListener('mousemove', (e) => {
            const tooltip = document.getElementById('tooltip');
            tooltip.style.left = (e.clientX + 10) + 'px';
            tooltip.style.top = (e.clientY + 10) + 'px';
        });
// Reset talents (called on return to town or death)
        icon.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });

        hudEl.appendChild(icon);
    }
}

// Resettalent（return to town/on deathcall）
function resetTalents() {
    player.talents = [];
    player.talentShop = [];
    player.phoenixUsed = false;
    player.highestTalentFloor = 0;      // Deepest floor with a triggered Hell shop
    player.highestHellTalentFloor = 0;  // deepest floor with a triggered Hell talent shop
    player.talentRefreshCount = 0;      // ========== Divine Blessing logic ==========
    updateTalentHUD();
}

// Update Divine Blessing HUD icon (always visible)
let divineBlessingOpen = false;
let divineBlessingCards = [];

// Update Divine Blessing HUD icon (always visible)
function updateDivineBlessingHUD() {
    const btn = document.getElementById('btn-divine-blessing');
    if (!btn) return;
    btn.style.display = 'block'; // always visible
    const badge = btn.querySelector('.db-count-badge');
    if (player.divineBlessing.pending > 0) {
// Nothing pending: idle state showing the obtained count
        btn.classList.add('has-pending');
        badge.style.display = 'inline';
        badge.innerText = player.divineBlessing.pending;
    } else {
// Generate 3 random blessing cards
        btn.classList.remove('has-pending');
        const obtainedCount = player.divineBlessing.obtained.length;
        if (obtainedCount > 0) {
            badge.style.display = 'inline';
            badge.innerText = obtainedCount;
        } else {
            badge.style.display = 'none';
        }
    }
    updateMobileMenuDot();
}

// Base rare rate 15%
const BLESSING_RARE_CHANCE = 0.15;   // baserarerate 15%
const BLESSING_PITY_THRESHOLD = 5;   // Count obtained times per blessing

function generateDivineBlessingCards() {
// Filter out blessings at their cap
    const obtainedCount = {};
    for (const b of player.divineBlessing.obtained) {
        obtainedCount[b.id] = (obtainedCount[b.id] || 0) + 1;
    }

// Init the pity counter (if missing)
    const pool = DIVINE_BLESSING_POOL.filter(b =>
        (obtainedCount[b.id] || 0) < MAX_BLESSING_STACK
    );

    const cards = [];
    const availablePool = [...pool];

// Pity: after 5 straight normals, a rare is guaranteed
    if (typeof player.divineBlessing.normalStreak === 'undefined') {
        player.divineBlessing.normalStreak = 0;
    }

    for (let i = 0; i < 3 && availablePool.length > 0; i++) {
        const idx = Math.floor(Math.random() * availablePool.length);
        const blessing = availablePool.splice(idx, 1)[0];

// Show the Divine Blessing pick screen
        const streak = player.divineBlessing.normalStreak || 0;
        const isRare = (streak >= BLESSING_PITY_THRESHOLD) || (Math.random() < BLESSING_RARE_CHANCE);

        cards.push({
            ...blessing,
            rarity: isRare ? 1 : 0,
            finalEffect: isRare ? blessing.rareEffect : blessing.effect
        });
    }
    return cards;
}

// Close the Divine Blessing screen
function showDivineBlessingUI() {
    if (player.divineBlessing.pending <= 0) return;
    divineBlessingCards = generateDivineBlessingCards();
    divineBlessingOpen = true;

    const panel = document.getElementById('divine-blessing-panel');
    const gridEl = document.getElementById('divine-blessing-grid');
    gridEl.innerHTML = '';

    for (let i = 0; i < divineBlessingCards.length; i++) {
        const card = divineBlessingCards[i];
        const effectText = Object.entries(card.finalEffect).map(([k, v]) => {
            const statName = (typeof I18N !== 'undefined' && typeof I18N.getBlessingEffectName === 'function') ?
                I18N.getBlessingEffectName(k) : (k);
            return `+${v}${k.includes('Pct') || k.includes('Chance') || k === 'allRes' || k === 'lifeSteal' ? '%' : ''} ${statName}`;
        }).join(', ');

        const blessingName = (typeof I18N !== 'undefined' && typeof I18N.getBlessingName === 'function') ?
            I18N.getBlessingName(card.id || card.name) : card.name;

        const cardEl = document.createElement('div');
        cardEl.className = `db-card ${card.rarity === 1 ? 'rare' : 'normal'}`;
        cardEl.innerHTML = `<div class="db-card-icon">${card.icon || '✨'}</div><div class="db-card-name">${blessingName}</div><div class="db-card-effect">${effectText}</div>`;
        cardEl.onclick = () => selectDivineBlessing(i);
        gridEl.appendChild(cardEl);
    }

    panel.style.display = 'block';
    panel.style.zIndex = 1000;
}

// Pick a blessing
function closeDivineBlessingUI() {
    divineBlessingOpen = false;
    document.getElementById('divine-blessing-panel').style.display = 'none';
}

// Add to the obtained list
function selectDivineBlessing(index) {
    const card = divineBlessingCards[index];
    if (!card) return;

// Update the pity counter
    player.divineBlessing.obtained.push({
        id: card.id,
        name: card.name,
        rarity: card.rarity,
        effect: card.finalEffect,
        level: player.lvl
    });

// Rare drawn: reset the counter
    if (card.rarity === 1) {
        player.divineBlessing.normalStreak = 0;  // Generate the effect text
    } else {
        player.divineBlessing.normalStreak = (player.divineBlessing.normalStreak || 0) + 1;
    }

    player.divineBlessing.pending--;
    divineBlessingOpen = false;

    closeDivineBlessingUI();

// Achievement tracking: blessing obtained
    const effectNames = {
        dmgPct: 'Damage', lifeSteal: 'Life Steal', critChance: 'Crit Chance', critDamage: 'Crit Damage',
        maxHp: 'Max HP', def: 'Defense', allRes: 'All Resistances %', hpRegenPct: 'HP Regen/s',
        maxMp: 'Max MP', mpRegenPct: 'MP Regen/s', fireDmgPct: 'Fire Damage',
        poisonDmgPct: 'Poison Damage', thornsPct: 'Thorns', goldPct: 'Gold Drop', dropRatePct: 'Item Drops',
        onKillHealPct: 'Heal on Kill'
    };
    const effectText = Object.entries(card.finalEffect).map(([k, v]) => {
        const isPercent = k.includes('Pct') || k.includes('Chance') || k === 'allRes' || k === 'lifeSteal';
        return `+${v}${isPercent ? '%' : ''} ${effectNames[k] || k}`;
    }).join(', ');

    createDamageNumber(player.x, player.y - 70, `${effectText} (Permanent)`, '#ffd700');
    showNotification(`${card.name}: ${effectText} (Permanent)`);
    AudioSys.play('cash');

    updateStats();
    updateStatsUI();
    updateDivineBlessingHUD();
// Still pending: keep popping up
    trackAchievement('blessing_count');
    SaveSystem.save();

// Get the Divine Blessing effect value
    if (player.divineBlessing.pending > 0) {
        setTimeout(() => showDivineBlessingUI(), 500);
    }
}

// Blessing button click handler
function getDivineBlessingEffect(effectKey, defaultValue = 0) {
    let total = defaultValue;
    for (const blessing of player.divineBlessing.obtained) {
        if (blessing.effect && blessing.effect[effectKey] !== undefined) {
            total += blessing.effect[effectKey];
        }
    }
    return total;
}

// No re-trigger while the pick screen is open (prevents option farming)
function onDivineBlessingBtnClick() {
    if (player.divineBlessing.pending > 0) {
// Show the obtained blessings panel
        if (divineBlessingOpen) return;
        showDivineBlessingUI();
    } else {
        showDivineBlessingListUI();
    }
}

// Effect name map
function showDivineBlessingListUI() {
    const panel = document.getElementById('divine-blessing-list-panel');
    const listEl = document.getElementById('divine-blessing-list');
    const summaryEl = document.getElementById('divine-blessing-summary');

// Generate the list
    const effectNames = {
        dmgPct: 'Damage', lifeSteal: 'Life Steal', critChance: 'Crit Chance', critDamage: 'Crit Damage',
        maxHp: 'Max HP', def: 'Defense', allRes: 'All Resistances %', hpRegenPct: 'HP Regen/s',
        maxMp: 'Max MP', mpRegenPct: 'MP Regen/s', fireDmgPct: 'Fire Damage',
        poisonDmgPct: 'Poison Damage', thornsPct: 'Thorns', goldPct: 'Gold Drop', dropRatePct: 'Item Drops',
        onKillHealPct: 'Heal on Kill'
    };

// Find the matching icon
    if (player.divineBlessing.obtained.length === 0) {
        listEl.innerHTML = '<div style="color:#888; text-align:center; padding:20px;">No blessings yet<br><span style="font-size:11px;">Gain a blessing every 5 levels</span></div>';
    } else {
        listEl.innerHTML = player.divineBlessing.obtained.map(b => {
            const effectText = Object.entries(b.effect).map(([k, v]) => {
                const isPercent = k.includes('Pct') || k.includes('Chance') || k === 'allRes' || k === 'lifeSteal';
                return `+${v}${isPercent ? '%' : ''} ${effectNames[k] || k}`;
            }).join(', ');
            const rarityClass = b.rarity === 1 ? 'rare' : 'normal';
// Summarize all effects
            const poolItem = DIVINE_BLESSING_POOL.find(p => p.id === b.id);
            const icon = poolItem ? poolItem.icon : '✨';
            return `<div class="db-list-item ${rarityClass}">
                <span class="db-list-icon">${icon}</span>
                <span class="db-list-name">${b.name}</span>
                <span class="db-list-effect">${effectText}</span>
                <span class="db-list-level">Lv.${b.level}</span>
            </div>`;
        }).join('');
    }

// Close the obtained blessings panel
    const totals = {};
    for (const b of player.divineBlessing.obtained) {
        for (const [k, v] of Object.entries(b.effect)) {
            totals[k] = (totals[k] || 0) + v;
        }
    }
    if (Object.keys(totals).length > 0) {
        const summaryText = Object.entries(totals).map(([k, v]) => {
            const isPercent = k.includes('Pct') || k.includes('Chance') || k === 'allRes' || k === 'lifeSteal';
            return `<span style="color:#88ff88">+${v}${isPercent ? '%' : ''} ${effectNames[k] || k}`;
        }).join('、');
        summaryEl.innerHTML = `<div style="color:#ffd700; font-size:12px; margin-bottom:5px;">Total Bonuses</div><div style="font-size:11px; color:#ccc; line-height:1.6;">${summaryText}</div>`;
    } else {
        summaryEl.innerHTML = '';
    }

    panel.style.display = 'block';
    panel.style.zIndex = 1000;
}

// ========== Daily login reward system ==========
function closeDivineBlessingListUI() {
    document.getElementById('divine-blessing-list-panel').style.display = 'none';
}

// Get today's date string (YYYY-MM-DD)

// Check and update login state
function getTodayDateString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// Auto check-in waits for the tutorial to finish and a safe return to town; the manual entry stays available.
let pendingDailyLoginPanel = false;

// Already logged in today: no popup, but it can be opened manually
function maybeShowDailyLoginPanel() {
    if (!pendingDailyLoginPanel || !player.tutorial.completed || player.floor !== 0) return;
    pendingDailyLoginPanel = false;
    if (!player.dailyLogin.claimedToday) showDailyLoginPanel();
}

function checkDailyLogin() {
    const today = getTodayDateString();
    const login = player.dailyLogin;

    if (login.lastLoginDate === today) {
// A new day
        return;
    }

    // newonesky
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (login.lastLoginDate === yesterdayStr) {
// Streak broken: start over
        login.consecutiveDays = (login.consecutiveDays % 7) + 1;
    } else {
        // interrupttag，re-newstart
        login.consecutiveDays = 1;
    }

    login.lastLoginDate = today;
    login.claimedToday = false;
    SaveSystem.save();

// Show the daily login panel
    setTimeout(() => {
        pendingDailyLoginPanel = true;
        maybeShowDailyLoginPanel();
    }, 500);
}

// Showeachday loginpanel
function showDailyLoginPanel() {
    pendingDailyLoginPanel = false;
    const panel = document.getElementById('daily-login-panel');
    const infoEl = document.getElementById('daily-login-info');
    const gridEl = document.getElementById('daily-login-grid');
    const claimBtn = document.getElementById('btn-claim-daily');

    const login = player.dailyLogin;
    const currentDay = login.consecutiveDays || 1;

    infoEl.innerHTML = typeof I18N !== 'undefined' ?
        I18N.t('daily_consecutive_days', { days: currentDay }) :
        `Logged in <span style="font-size:20px;">${currentDay}</span> days in a row`;

// claimed
    gridEl.innerHTML = DAILY_LOGIN_REWARDS.map((reward, idx) => {
        const day = idx + 1;
        let stateClass = '';
        if (day < currentDay) {
            stateClass = 'claimed'; // claimed
        } else if (day === currentDay) {
            stateClass = login.claimedToday ? 'claimed' : 'current'; // today
        } else {
            stateClass = 'locked'; // locked
        }
        const day7Class = day === 7 ? 'day7' : '';
        const rewardName = (typeof I18N !== 'undefined' && typeof I18N.getDailyRewardName === 'function') ?
            I18N.getDailyRewardName(reward) : reward.name;
        return `<div class="daily-reward-card ${stateClass} ${day7Class}">
            <div class="daily-reward-day">Day ${day}</div>
            <div class="daily-reward-icon">${reward.icon}</div>
            <div class="daily-reward-name">${rewardName}</div>
            ${stateClass === 'claimed' ? '<div class="daily-reward-check">✓</div>' : ''}
        </div>`;
    }).join('');

// Close the daily login panel
    if (login.claimedToday) {
        claimBtn.disabled = true;
        claimBtn.innerText = typeof I18N !== 'undefined' ? I18N.t('daily_already_claimed') : 'Already claimed today';
    } else {
        claimBtn.disabled = false;
        claimBtn.innerText = typeof I18N !== 'undefined' ? I18N.t('daily_claim') : 'Claim Reward';
    }

    panel.style.display = 'block';
    panel.style.zIndex = 1001;
}

// Closeeachday loginpanel
function closeDailyLoginPanel() {
    document.getElementById('daily-login-panel').style.display = 'none';
}

// Grant rewards
function claimDailyReward() {
    const login = player.dailyLogin;
    if (login.claimedToday) return;

    const currentDay = login.consecutiveDays || 1;
    const reward = DAILY_LOGIN_REWARDS[currentDay - 1];
    if (!reward) return;

    // grant rewards
    switch (reward.type) {
        case 'gold':
            addGold(reward.amount);
            break;
        case 'potion':
            for (let i = 0; i < reward.amount; i++) {
                if (reward.heal) {
                    addItemToInventory({ type: 'potion', name: 'Health Potion', heal: 50, rarity: 0, stackable: true, count: 1 });
                } else if (reward.mana) {
                    addItemToInventory({ type: 'potion', name: 'Mana Potion', mana: 30, rarity: 0, stackable: true, count: 1 });
                }
            }
            break;
        case 'scroll':
            for (let i = 0; i < reward.amount; i++) {
                addItemToInventory({ type: 'scroll', name: 'Town Portal Scroll', rarity: 0, stackable: true, count: 1 });
            }
            break;
        case 'buff_xp':
            // 24smallwhendouble XP buff
            player.xpBuffExpiry = Date.now() + reward.amount * 60 * 60 * 1000;  // Double gold buff
            showNotification(`Double XP activated for ${reward.amount}h`);
            break;
        case 'buff_gold':
// Double drop buff
            player.goldBuffExpiry = Date.now() + reward.amount * 60 * 60 * 1000;
            showNotification(`Double Gold activated for ${reward.amount}h`);
            break;
        case 'buff_drop':
// Triple XP buff + set gear
            player.dropBuffExpiry = Date.now() + reward.amount * 60 * 60 * 1000;
            showNotification(`Double Drops activated for ${reward.amount}h`);
            break;
        case 'buff_xp_triple':
            // triple XP buff + setgear
            player.xpBuffTripleExpiry = Date.now() + reward.amount * 60 * 60 * 1000;
            showNotification(`🔥 Triple XP activated for ${reward.amount}h`);
// Generate a random Unique (equippable items from BASE_ITEMS only)
            const setItem = generateRandomSetItem(Math.max(player.lvl, 10));
            if (setItem) {
                addItemToInventory(setItem);
                showNotification(`🏆 Acquired set piece: ${setItem.displayName || setItem.name}`);
            }
            break;
        case 'unique_item':
// Fancy claim VFX
            const equipableItems = BASE_ITEMS.filter(i => i.type !== 'potion' && i.type !== 'scroll');
            const randomBase = equipableItems[Math.floor(Math.random() * equipableItems.length)];
            const uniqueItem = createItem(randomBase.name, player.lvl);
            uniqueItem.rarity = 4;
            uniqueItem.displayName = "Unique · " + uniqueItem.name;
            uniqueItem.stats.allSkills = (uniqueItem.stats.allSkills || 0) + 1;
            uniqueItem.stats.dmgPct = (uniqueItem.stats.dmgPct || 0) + 50;
            uniqueItem.stats.lifeSteal = (uniqueItem.stats.lifeSteal || 0) + 5;
            addItemToInventory(uniqueItem);
            break;
    }

    login.claimedToday = true;

    // flashyclaimVFX
    playDailyRewardEffect(currentDay, reward);

    // UpdateUI
    updateUI();
    renderInventory();
    showDailyLoginPanel(); // Auto-close the panel 1.5s later
    SaveSystem.save();

// Daily reward claim VFX
    setTimeout(() => closeDailyLoginPanel(), 1500);
}

// Day 7 special grand prize
function playDailyRewardEffect(day, reward) {
    const isDay7 = day === 7;  // 1. Screen shake

    // 1. screen shakeeffect
    triggerScreenShake(isDay7 ? 12 : 6, isDay7 ? 0.4 : 0.25);

// 3. Particle burst
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: ${isDay7 ? 'radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(255,165,0,0.4) 50%, transparent 100%)' : 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)'};
        pointer-events: none; z-index: 9999;
        animation: dailyFlash ${isDay7 ? '0.8s' : '0.5s'} ease-out forwards;
    `;
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), isDay7 ? 800 : 500);

    // 3. particleburst
    const colors = isDay7 ?
        ['#ffd700', '#ffaa00', '#ff8800', '#ffffff', '#ffff00'] :
        ['#87ceeb', '#98fb98', '#dda0dd', '#ffffff'];
    const particleCount = isDay7 ? 40 : 20;

    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 / particleCount) * i + Math.random() * 0.5;
        const speed = 100 + Math.random() * 150;
        particles.push({
            x: player.x,
            y: player.y - 30,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 80,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 0.8 + Math.random() * 0.4,
            size: isDay7 ? 4 + Math.random() * 4 : 2 + Math.random() * 3,
            gravity: 120
        });
    }

// 5. Big floating text
    if (isDay7) {
        for (let i = 0; i < 15; i++) {
            particles.push({
                type: 'rising_spark',
                x: player.x + (Math.random() - 0.5) * 60,
                y: player.y,
                vy: -180 - Math.random() * 100,
                color: '#ffd700',
                life: 1.2 + Math.random() * 0.5,
                size: 4 + Math.random() * 3
            });
        }
    }

// 6. Play SFX
    createFloatingText(player.x, player.y - 80, `${reward.icon} ${reward.name}`, isDay7 ? '#ffd700' : '#87ceeb', isDay7 ? 2.5 : 2);

    // 6. Play SFX
    if (isDay7) {
        AudioSys.play('drop_unique');  // Unique drop SFX
        setTimeout(() => AudioSys.play('levelup'), 300);  // layered level-up SFX
    } else {
        AudioSys.play('quest');  // quest complete SFX
    }

    // 7. Shownotify
    showNotification(`🎁 Day ${day} reward claimed: ${reward.name}!`);
}

// Build the floor list: lastFloor first, then maxFloor, others descending
function showPortalFloorChoice(lastFloor, maxFloor) {
    const dialogBox = document.getElementById('dialog-box');
    const dialogName = document.getElementById('dialog-name');
    const dialogText = document.getElementById('dialog-text');
    const dialogOptions = document.getElementById('dialog-options');

    dialogName.innerText = typeof I18N !== 'undefined' ? I18N.t('portal_name') : 'Portal';
    dialogText.innerText = typeof I18N !== 'undefined' ? I18N.t('portal_select_floor') : 'Choose the floor to travel to:';

    const getFName = (f) => typeof I18N !== 'undefined' ? I18N.getFloorName(f) : getFloorName(f);

// 1. Last floor (if > 1)
    let floors = [];

    // 1. onsecondthereforeatfloor（if > 1）
    if (lastFloor > 1) {
        const label = typeof I18N !== 'undefined' ?
            I18N.t('portal_last_floor', { floor: lastFloor, name: getFName(lastFloor) }) :
            `${lastFloor}F ${getFloorName(lastFloor)} (last)`;
        floors.push({ floor: lastFloor, label: label });
    }

// 3. Other floors descending (excluding added ones and floor 1)
    if (maxFloor > 1 && maxFloor !== lastFloor) {
        const label = typeof I18N !== 'undefined' ?
            I18N.t('portal_max_floor', { floor: maxFloor, name: getFName(maxFloor) }) :
            `${maxFloor}F ${getFloorName(maxFloor)} (best)`;
        floors.push({ floor: maxFloor, label: label });
    }

// Generate button HTML
    for (let i = maxFloor; i >= 2; i--) {
        if (i !== lastFloor && i !== maxFloor) {
            const label = typeof I18N !== 'undefined' ?
                I18N.t('portal_floor_option', { floor: i, name: getFName(i) }) :
                `${i}F ${getFloorName(i)}`;
            floors.push({ floor: i, label: label });
        }
    }

// Choose the portal target floor
    let buttonsHtml = '<div class="portal-floor-list">';
    floors.forEach(f => {
        buttonsHtml += `<button class="dialog-btn portal-floor-btn" onclick="selectPortalFloor(${f.floor})">${f.label}</button>`;
    });
    buttonsHtml += '</div>';
    const cancelText = typeof I18N !== 'undefined' ? I18N.t('cancel') : 'Cancel';
    buttonsHtml += `<button class="dialog-btn" onclick="closeDialog()">${cancelText}</button>`;

    dialogOptions.innerHTML = buttonsHtml;
    dialogBox.style.display = 'block';
}

// Compute gear requirements
function selectPortalFloor(floor) {
    closeDialog();
    enterFloor(floor, 'portal');
}

// calculateItemRequirements (moved to item-system.js)
// createItem (moved to item-system.js)

// Generate a set item

// generateset items
// Randomly generate a set item (picked from all sets)

// generateRandomSetItem (moved to item-system.js)
// addItemToInventory (moved to item-system.js)

// Lightning: drops from directly above the target

function createLightningEffect(targetX, targetY) {
// Always falls from 250px above
    const startX = targetX + (Math.random() - 0.5) * 50;
    const startY = targetY - 250; // Random offset

    const segments = 8;
    let currentX = startX;
    let currentY = startY;
    const stepY = (targetY - startY) / segments;

    const points = [{ x: startX, y: startY }];

    for (let i = 1; i < segments; i++) {
        currentY += stepY;
        const offset = (Math.random() - 0.5) * 80; // randomoffset by
        currentX += (targetX - currentX) / (segments - i) + offset;
        points.push({ x: currentX, y: currentY });
    }
    points.push({ x: targetX, y: targetY });

// Initial life value
    player.activeLightning = {
        points: points,
        life: 1.0 // Fallback visual: create one burst particle at the target so the hit point is at least visible
    };

// Find the nearest enemy (for chain lightning)
    createNovaEffect(targetX, targetY, '#ffff00');
}

// Skip dead or already-hit enemies
function findNearestEnemy(x, y, maxRange, excludeSet) {
    let nearest = null;
    let minDist = maxRange;

    enemies.forEach(e => {
        if (e.dead || excludeSet.has(e)) return;  // Create chain lightning visuals (enhanced: forks + white flash + afterimages)

        const dist = Math.hypot(e.x - x, e.y - y);
        if (dist < minDist) {
            minDist = dist;
            nearest = e;
        }
    });

    return nearest;
}

// more segments make the lightning finer
function createLightningChain(fromX, fromY, toX, toY) {
    const segments = 8;  // more segments make the lightning finer
    const dx = toX - fromX;
    const dy = toY - fromY;
    const dist = Math.hypot(dx, dy);
    if (dist < 1) return;

    const points = [{ x: fromX, y: fromY }];

    for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const baseX = fromX + dx * t;
        const baseY = fromY + dy * t;

// Increase the offset
        const offset = (Math.random() - 0.5) * 40;  // Main bolt
        const perpX = -dy / dist;
        const perpY = dx / dist;

        points.push({
            x: baseX + perpX * offset,
            y: baseY + perpY * offset
        });
    }
    points.push({ x: toX, y: toY });

    // mainlightning
    particles.push({
        type: 'lightning_chain',
        points: points,
        life: 0.25,
        maxLife: 0.25,
        color: '#ffffff',  // body white
        glowColor: '#88ccff',  // outer glow blue
        lineWidth: 3,
        isMain: true
    });

// afterimage blue
    particles.push({
        type: 'lightning_chain',
        points: points.map(p => ({ x: p.x, y: p.y })),
        life: 0.4,
        maxLife: 0.4,
        color: '#4488ff',  // afterimage blue
        glowColor: '#2244aa',
        lineWidth: 2,
        isMain: false
    });

// 40% chance to fork
    const branchChance = 0.4;  // Random angle
    for (let i = 2; i < points.length - 2; i++) {
        if (Math.random() < branchChance) {
            const branchLength = 30 + Math.random() * 50;
            const branchAngle = (Math.random() - 0.5) * Math.PI * 0.8;  // randomangle
            const baseAngle = Math.atan2(dy, dx);

            const branchPoints = [{ x: points[i].x, y: points[i].y }];
            const branchSegments = 3;

            for (let j = 1; j <= branchSegments; j++) {
                const t = j / branchSegments;
                const angle = baseAngle + branchAngle;
                branchPoints.push({
                    x: points[i].x + Math.cos(angle) * branchLength * t + (Math.random() - 0.5) * 15,
                    y: points[i].y + Math.sin(angle) * branchLength * t + (Math.random() - 0.5) * 15
                });
            }

            particles.push({
                type: 'lightning_chain',
                points: branchPoints,
                life: 0.15,
                maxLife: 0.15,
                color: '#aaddff',
                glowColor: '#4488cc',
                lineWidth: 1.5,
                isMain: false
            });
        }
    }

// Create damage numbers (high-performance: pool-supported with central physics)
    for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 80 + Math.random() * 60;
        particles.push({
            x: toX,
            y: toY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: '#88ccff',
            life: 0.3 + Math.random() * 0.2,
            size: 2 + Math.random() * 2,
            gravity: 50
        });
    }
}



function createNovaEffect(x, y, color) {
    const count = 12;
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i;
        const speed = 150;
        particles.push({
            x: x, y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0.5,
            color: color,
            size: 3,
            type: 'particle'
        });
    }
}

function isPlainDamageNumberValue(val) {
    if (typeof val === 'number') return true;
    if (typeof val !== 'string') return false;
    return /^[+-]?\d+(\.\d+)?$/.test(val.trim());
}

function shouldUseDomDamageNumber(val, isCrit, isGold) {
    if (isCrit || isGold) return true;
    return typeof val === 'string' && !isPlainDamageNumberValue(val);
}

// Frequent synonymous hints yield to hit colors and status effects, so every swing doesn't re-explain mechanics.
function createDamageNumber(x, y, val, color, angle = null, source = null) {
// Numbers auto-round to avoid floating-point display issues
    if (['Execute!','Lucky!','Unlucky...','Resisted!'].includes(val)) return;
    const mergeTime = Date.now();
    if (source && typeof val === 'number') {
        const previous = damageNumbers.find(d => d.mergeSource === source && d.color === color && d.life > 0 && mergeTime - d.mergeTime < 140);
        if (previous) {
            previous.val += Math.floor(val);
            if (previous.el) previous.el.innerText = previous.val;
            return;
        }
    }
// Physics params precomputed
    if (typeof val === 'number') {
        val = Math.floor(val);
    }
    const isCrit = color === COLORS.critical || val === "Crit!" || (typeof val === 'string' && val.includes('Crit'));
    const isGold = color === 'gold' || (typeof val === 'string' && val.includes(' G'));
    const useDomDamageNumber = player.graphicsQuality === 'high'
        && cachedUI.floatingTexts
        && shouldUseDomDamageNumber(val, isCrit, isGold);

// Fancy layout rendering is reserved for crits, gold and important text; common frequent numbers go to Canvas.
    let vx = 0, vy = 0, gravity = 400, life = 1.0;
    const isPoison = color === COLORS.poison || color === '#00ff00' || color === 'poison';
    const isIce = color === COLORS.ice || color === '#00ccff' || color === 'ice';
    const isLightning = color === COLORS.lightning || color === '#ffff00' || color === 'lightning';

    if (isPoison) {
        vx = (Math.random() - 0.5) * 60; vy = -40 - Math.random() * 30; gravity = 150; life = 0.8;
    } else if (isIce) {
        vx = (Math.random() - 0.5) * 20; vy = -20 - Math.random() * 10; gravity = 50; life = 1.2;
    } else if (isLightning) {
        vx = (Math.random() - 0.5) * 300; vy = -180 - Math.random() * 120; gravity = 800; life = 0.6;
    } else {
        if (angle !== null) {
            const speed = isCrit ? 150 : 80;
            vx = Math.cos(angle) * speed + (Math.random() - 0.5) * 50;
            vy = Math.sin(angle) * speed - 100;
        } else {
            vx = (Math.random() - 0.5) * (isCrit ? 200 : 100);
            vy = isCrit ? -250 : -150;
        }
        gravity = isCrit ? 600 : 400;
    }

// Record the initial screen coords
    if (useDomDamageNumber) {
        const div = document.createElement('div');
        const className = isCrit ? 'dmg-crit' : (isGold ? 'dmg-gold' : 'dmg-normal');
        div.className = `damage-number ${className}`;
        div.innerText = val;
        if (!isCrit && !isGold) div.style.color = color;

// For crits, trigger the GSAP popup
        const screenX = x - camera.x;
        const screenY = y - camera.y;
        div.style.left = canvasToCssX(screenX) + 'px';
        div.style.top = canvasToCssY(screenY) + 'px';
        cachedUI.floatingTexts.appendChild(div);

        // ifiscrit，trigger GSAP VFXpopup
        if (isCrit) GSAPAnims.critPop(div);

        damageNumbers.push(DamageNumberPool.acquire({
            x, y, val, color, mergeSource: source, mergeTime, isHTML: true, el: div,
            vx, vy, gravity, life, maxLife: life,
            sx: screenX, sy: screenY,
            isLightning, isPoison, isIce, isCrit, isGold, isImportantText: !isCrit && !isGold,
            flickerTimer: 0
        }));
    } else {
        // baseRender (Canvas Mode)
        damageNumbers.push(DamageNumberPool.acquire({
            x, y, val, color, mergeSource: source, mergeTime, isHTML: false, el: null,
            life: isCrit ? 1.0 : 0.8,
            vx, vy, gravity,
            fontSize: isCrit ? 24 : 16,
            isLightning, isPoison, isIce, isCrit, isGold: false, isImportantText: false
        }));
    }
}

// triggerscreen shake
function createSlashEffect(fromX, fromY, toX, toY, damage = 50, isCrit = false) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const profile = getPlayerVisualProfile();

// Crits add 2 particles, capped at 5
    let count = damage < 50 ? 1 : damage < 150 ? 2 : 3;
    if (isCrit) count = Math.min(count + 2, 5);  // critincrease2entries，mostplenty5entries

    const getOffsets = (n) => {
        if (n === 1) return [0];
        if (n === 2) return [-0.5, 0.5];
        if (n === 3) return [-0.7, 0, 0.7];
        if (n === 4) return [-0.9, -0.3, 0.3, 0.9];
        return [-1.0, -0.5, 0, 0.5, 1.0];
    };

    const offsets = getOffsets(count);
    offsets.forEach(off => {
        slashEffects.push({
            x: fromX + Math.cos(angle) * 10,
            y: fromY + Math.sin(angle) * 10,
            angle: angle + off,
            radius: isCrit ? 45 : 30,  // Flag crit for rendering
            life: 1.0,
            isCrit: isCrit,  // One sweep emits one 3D blade-plane event, preventing dozens of stacked flat arcs at high attack speed.
            color: isCrit ? '#ffdd00' : profile.trail
        });
    });
}

function getPhysicalSweepTier() {
    if (player.lvl >= GAME_CONFIG.PHYSICAL_SWEEP_TIER3_LEVEL || player.str >= GAME_CONFIG.PHYSICAL_SWEEP_TIER3_STR) return 3;
    if (player.lvl >= GAME_CONFIG.PHYSICAL_SWEEP_TIER2_LEVEL || player.str >= GAME_CONFIG.PHYSICAL_SWEEP_TIER2_STR) return 2;
    if (player.lvl >= GAME_CONFIG.PHYSICAL_SWEEP_TIER1_LEVEL || player.str >= GAME_CONFIG.PHYSICAL_SWEEP_TIER1_STR) return 1;
    return 0;
}

function getPhysicalSweepConfig(tier) {
    if (tier >= 3) {
        return {
            name: 'Sweeping Blade',
            range: GAME_CONFIG.PHYSICAL_SWEEP_TIER3_RANGE,
            arc: GAME_CONFIG.PHYSICAL_SWEEP_TIER3_ARC,
            maxTargets: GAME_CONFIG.PHYSICAL_SWEEP_TIER3_MAX_TARGETS,
            damageRatio: GAME_CONFIG.PHYSICAL_SWEEP_TIER3_DAMAGE_RATIO,
            slashCount: 5
        };
    }
    if (tier === 2) {
        return {
            name: 'Crescent Slash',
            range: GAME_CONFIG.PHYSICAL_SWEEP_TIER2_RANGE,
            arc: GAME_CONFIG.PHYSICAL_SWEEP_TIER2_ARC,
            maxTargets: GAME_CONFIG.PHYSICAL_SWEEP_TIER2_MAX_TARGETS,
            damageRatio: GAME_CONFIG.PHYSICAL_SWEEP_TIER2_DAMAGE_RATIO,
            slashCount: 4
        };
    }
    if (tier === 1) {
        return {
            name: 'Cleave',
            range: GAME_CONFIG.PHYSICAL_SWEEP_TIER1_RANGE,
            arc: GAME_CONFIG.PHYSICAL_SWEEP_TIER1_ARC,
            maxTargets: GAME_CONFIG.PHYSICAL_SWEEP_TIER1_MAX_TARGETS,
            damageRatio: GAME_CONFIG.PHYSICAL_SWEEP_TIER1_DAMAGE_RATIO,
            slashCount: 3
        };
    }
    return null;
}

function getPhysicalGrowthVisualProfile(tier) {
    if (tier >= 3) {
        return {
            name: 'Earth Splitter',
            style: 'earthsplit',
            blade: '#fff0b8',
            glow: '#ffb84a',
            crack: '#d8b06a'
        };
    }
    if (tier === 2) {
        return {
            name: 'Whirlwind',
            style: 'whirlwind',
            blade: '#f6e8c4',
            glow: '#e8d39a',
            crack: '#c9b884'
        };
    }
    if (tier === 1) {
        return {
            name: 'Crescent Slash',
            style: 'halfmoon',
            blade: '#f1dfb8',
            glow: '#d7c18a',
            crack: '#b9a16c'
        };
    }
    return null;
}

function getAngleDelta(a, b) {
    let delta = a - b;
    while (delta > Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;
    return delta;
}

function canPhysicalSweepReachEnemy(enemy, dist) {
    if (!enemy || enemy.dead) return false;
    if (player.floor <= 0) return true;
    if (dist < GAME_CONFIG.PLAYER_MELEE_NO_LOS_RANGE) return true;
    return hasLineOfSight(player.x, player.y, enemy.x, enemy.y);
}

function getPhysicalSweepTargets(primaryTarget, attackAngle, tier) {
    const config = getPhysicalSweepConfig(tier);
    if (!config || !primaryTarget) return [];

    let pressureCount = 0;
    const candidates = [];
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        if (!enemy || enemy.dead) continue;

        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);
        if (dist <= GAME_CONFIG.PHYSICAL_SWEEP_PRESSURE_RADIUS && canPhysicalSweepReachEnemy(enemy, dist)) {
            pressureCount++;
        }

        if (enemy === primaryTarget || dist > config.range || !canPhysicalSweepReachEnemy(enemy, dist)) continue;
        const angle = Math.atan2(dy, dx);
        if (Math.abs(getAngleDelta(angle, attackAngle)) > config.arc / 2) continue;

        candidates.push({ enemy, distSq });
    }

    if (pressureCount < GAME_CONFIG.PHYSICAL_SWEEP_TRIGGER_ENEMIES) return [];
    candidates.sort((a, b) => a.distSq - b.distSq);
    return candidates.slice(0, config.maxTargets).map(item => item.enemy);
}

function createPhysicalSweepEffect(fromX, fromY, attackAngle, tier, hitCount, isCrit) {
    const config = getPhysicalSweepConfig(tier);
    if (!config || hitCount <= 0) return;

    if (player.graphicsQuality !== 'low' && typeof Physical3D !== 'undefined') {
// Create a DOM element for floating text
        let count=0;for(const fx of slashEffects)if(fx.depthSweep)count++;
        if(count>=6){const oldest=slashEffects.findIndex(fx=>fx.depthSweep);slashEffects.splice(oldest,1);}
        slashEffects.push({x:fromX,y:fromY,angle:attackAngle,radius:config.range*.82,tier,sweepArc:Math.min(config.arc,3.4),depthSweep:true,isCrit,life:1});
        createImpactParticles(fromX+Math.cos(attackAngle)*config.range*.55,fromY+Math.sin(attackAngle)*config.range*.55,'#d2ae70',isCrit?5:3,attackAngle);
        return;
    }
    const profile = getPlayerVisualProfile();
    const color = isCrit ? '#ffdd00' : profile.trail;
    const glowColor = isCrit ? '#ffdd00' : profile.trail;
    const slashCount = config.slashCount + Math.min(hitCount, 2);
    const fanWidth = Math.min(config.arc * 0.52, 1.95);

    for (let i = 0; i < slashCount; i++) {
        const spread = slashCount === 1 ? 0 : (i / (slashCount - 1) - 0.5);
        const depth = i / Math.max(1, slashCount - 1);
        const radiusJitter = (i % 2) * 5;
        slashEffects.push({
            x: fromX + Math.cos(attackAngle) * (12 + depth * 24),
            y: fromY + Math.sin(attackAngle) * (12 + depth * 24),
            angle: attackAngle + spread * fanWidth,
            radius: 34 + tier * 5 + depth * 24 + radiusJitter,
            life: 1.0,
            isCrit,
            isSweep: true,
            color,
            glowColor,
            glowBlur: isCrit ? 14 : 8,
            alphaScale: 0.52 + depth * 0.34,
            arcWidth: 0.52 + tier * 0.06 + depth * 0.08,
            lineWidth: 2.3 + tier * 0.25 + (isCrit ? 0.65 : 0)
        });
    }

    emitPhysicalGrowthVisuals(fromX, fromY, attackAngle, tier, hitCount, isCrit);
}

function emitPhysicalGrowthVisuals(fromX, fromY, attackAngle, tier, hitCount, isCrit) {
    const growth = getPhysicalGrowthVisualProfile(tier);
    if (!growth || hitCount <= 0) return;

    const color = isCrit ? '#ffdd00' : growth.blade;
    const glowColor = isCrit ? '#ffdd00' : growth.glow;

    slashEffects.push({
        x: fromX + Math.cos(attackAngle) * 24,
        y: fromY + Math.sin(attackAngle) * 24,
        angle: attackAngle,
        radius: 56 + tier * 8,
        life: 1.0,
        isCrit,
        isSweep: true,
        growthStyle: 'halfmoon',
        color,
        glowColor,
        glowBlur: isCrit ? 16 : 10,
        alphaScale: 0.48,
        arcWidth: tier >= 3 ? 0.86 : 0.78,
        lineWidth: 2.1 + tier * 0.25
    });

    if (tier >= 2) {
        const swirlCount = tier >= 3 ? 6 : 4;
        for (let i = 0; i < swirlCount; i++) {
            const swirlAngle = attackAngle + (Math.PI * 2 * i) / swirlCount + (i % 2) * 0.18;
            slashEffects.push({
                x: fromX,
                y: fromY,
                angle: swirlAngle,
                radius: 38 + i * 6,
                life: 0.9,
                isCrit,
                isSweep: true,
                growthStyle: 'whirlwind',
                color,
                glowColor,
                glowBlur: isCrit ? 14 : 8,
                alphaScale: 0.32 + i * 0.055,
                arcWidth: 0.46 + tier * 0.03,
                lineWidth: 2.0 + tier * 0.14
            });
        }
    }

    if (tier >= 3) {
        const maxP = getParticleConfig().maxParticles;
        const crackCount = Math.min(7, 3 + hitCount);
        for (let i = 0; i < crackCount; i++) {
            if (particles.length >= maxP) break;
            const spread = crackCount === 1 ? 0 : (i / (crackCount - 1) - 0.5) * 0.9;
            const rayAngle = attackAngle + spread;
            const startDist = 24 + i * 4;
            particles.push(ParticlePool.acquire({
                x: fromX + Math.cos(rayAngle) * startDist,
                y: fromY + Math.sin(rayAngle) * startDist,
                type: 'skill_impact_ray',
                growthStyle: 'earthsplit',
                color: isCrit ? '#ffe66a' : growth.crack,
                life: 0.26,
                maxLife: 0.26,
                angle: rayAngle,
                length: 58 + i * 8,
                width: isCrit ? 3 : 2.1
            }));
        }
    }
}

function triggerPhysicalSweep(primaryTarget, basePhysicalDamage, isCrit, attackAngle) {
    const tier = getPhysicalSweepTier();
    const config = getPhysicalSweepConfig(tier);
    if (!config) return 0;

    const targets = getPhysicalSweepTargets(primaryTarget, attackAngle, tier);
    if (targets.length === 0) return 0;

    const physicalDamage = Math.max(1, Math.floor(basePhysicalDamage * config.damageRatio));
    const sweepDamageObj = {
        physical: physicalDamage,
        fire: Math.floor(player.elementalDamage.fire * config.damageRatio),
        lightning: Math.floor(player.elementalDamage.lightning * config.damageRatio),
        poison: Math.floor(player.elementalDamage.poison * config.damageRatio),
        isCrit: isCrit,
        isSweep: true
    };

    for (let i = 0; i < targets.length; i++) {
        takeDamage(targets[i], sweepDamageObj, false);
    }

    createPhysicalSweepEffect(player.x, player.y, attackAngle, tier, targets.length, isCrit);
    return targets.length;
}

function createFloatingText(x, y, text, color = '#ffff00', duration = 2) {
// Use an animation instead of storing in the array
    if (!cachedUI.floatingTexts) return;

    const el = document.createElement('div');
    el.className = 'floating-text';
    el.textContent = text;
    el.style.color = color;
    el.style.left = canvasToCssX(x - camera.x) + 'px';
    el.style.top = canvasToCssY(y - camera.y - 20) + 'px';
    el.style.opacity = '1';

    cachedUI.floatingTexts.appendChild(el);

// pixels/sec
    let life = 0;
    const speed = 30; // pixel/second
    const interval = 50; // Updateinterval（ms）

    const animate = () => {
        life += interval / 1000;
        const progress = life / duration;

        if (progress >= 1) {
            el.remove();
            return;
        }

// Quality-dependent particle config
        const currentY = y - camera.y - 20 - (life * speed);
        el.style.top = canvasToCssY(currentY) + 'px';
        el.style.opacity = (1 - progress).toString();

        setTimeout(animate, interval);
    };

    animate();
}
// Don't create beyond the cap
const PARTICLE_CONFIG = {
    high: { maxParticles: 200, fireballTrail: 0.6, multishotTrail: 0.4 },
    low: { maxParticles: 100, fireballTrail: 0.25, multishotTrail: 0.15 }
};

function getParticleConfig() {
    return PARTICLE_CONFIG[player.graphicsQuality] || PARTICLE_CONFIG.high;
}

function createParticle(x, y, color, size = 3) {
    if (color === COLORS.poison || color === '#00ff00') {
        emitDriftingVeil(x, y, color, Math.max(18, size * 3));
        return;
    }
    const maxParticles = getParticleConfig().maxParticles;
    if (particles.length >= maxParticles) return;  // Poison clouds and spirits share low-opacity curved smoke bands: merged by area, concurrency capped, no per-frame smoke particles.
    particles.push(ParticlePool.acquire({ x, y, color, vx: (Math.random() - 0.5) * 100, vy: (Math.random() - 0.5) * 100, life: 0.5, size }));
}

// Poison clouds and spirits share low-opacity curved smoke bands: merged by area, concurrency capped, no per-frame smoke particles.
function emitDriftingVeil(x, y, color, radius) {
    let count = 0;
    for (const p of particles) {
        if (p.type !== 'drifting_veil') continue;
        count++;
        if (p.color === color && Math.hypot(p.x - x, p.y - y) < Math.min(p.size, radius)) {
            p.size = Math.max(p.size, radius);
            return;
        }
    }
    if (count >= (player.graphicsQuality === 'low' ? 6 : 16) || particles.length >= getParticleConfig().maxParticles) return;
    particles.push(ParticlePool.acquire({type:'drifting_veil',x,y,color,size:radius,life:.85,maxLife:.85}));
}

function drawDriftingVeil(ctx, p) {
    const age = 1 - p.life / p.maxLife, radius = p.size * (.75 + age * .25);
    const fade = Math.sin(Math.PI * Math.max(0, Math.min(1, age)));
    const layers = player.graphicsQuality === 'low' ? 2 : 3;
    ctx.save();
    for (let i = 0; i < layers; i++) {
        const lift = age * 20 + i * 8, sway = Math.sin(age * 4 + i * 2) * radius * .16;
        ctx.globalAlpha = fade * (i === 0 ? .2 : .12);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(p.x - radius, p.y - lift);
        ctx.bezierCurveTo(p.x - radius * .4 + sway, p.y - lift - radius * .42,
            p.x + radius * .35 + sway, p.y - lift + radius * .12, p.x + radius, p.y - lift - radius * .14);
        ctx.bezierCurveTo(p.x + radius * .3, p.y - lift + radius * .3,
            p.x - radius * .3, p.y - lift - radius * .08, p.x - radius, p.y - lift);
        ctx.closePath();ctx.fill();
    }
    ctx.restore();
}

// Scattered sparks, magic debris and rising dots become short speed-oriented light streaks; no circular halos.
function drawParticleSliver(ctx, p) {
    const size = Math.min(5, p.size), angle = Math.atan2(p.vy || -1, p.vx || 0);
    ctx.save();ctx.translate(p.x, p.y - (p.z || 0));ctx.rotate(angle);
    ctx.globalAlpha = Math.min(1, p.life) * .7;ctx.fillStyle = p.color;
    ctx.beginPath();ctx.moveTo(size * 2, 0);ctx.lineTo(0, size * .35);
    ctx.lineTo(-size * 1.4, 0);ctx.lineTo(0, -size * .35);ctx.closePath();ctx.fill();
    ctx.restore();
}

// only low-HP blood gets baked into the ground
function drawImpactFacet(ctx, p) {
    const a=p.spin+(0.42-p.life)*11,b=a*.73,c=Math.cos(a),s=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b);
    const vertices=[[1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1]].map(([x,y,z])=>{
        const rx=x*c-y*s,ry=x*s+y*c;
        return [rx,ry*cb-z*sb,ry*sb+z*cb];
    });
    const faces=[[0,1,2],[0,3,1],[0,2,3],[1,3,2]].sort((a,b)=>a.reduce((v,i)=>v+vertices[i][1],0)-b.reduce((v,i)=>v+vertices[i][1],0));
    const fade=Math.min(1,p.life/.15);
    ctx.save();ctx.globalAlpha=fade;
    if(p.z>0){ctx.fillStyle='rgba(0,0,0,.16)';ctx.beginPath();ctx.ellipse(p.x,p.y,p.size*.8,p.size*.3,0,0,Math.PI*2);ctx.fill();}
    for(const face of faces){
        const [v0,v1,v2]=face.map(i=>vertices[i]);
        const u=v1.map((v,i)=>v-v0[i]),v=v2.map((n,i)=>n-v0[i]);
        const normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
        const light=Math.max(0,(normal[0]*-.4+normal[1]*-.3+normal[2]*.8)/Math.hypot(...normal));
        ctx.beginPath();for(let i=0;i<face.length;i++){const q=vertices[face[i]],x=p.x+q[0]*p.size,y=p.y-p.z+(q[1]*.48-q[2]) * p.size;ctx[i?'lineTo':'moveTo'](x,y);}ctx.closePath();
        ctx.globalAlpha=fade;ctx.fillStyle=p.color;ctx.fill();
        ctx.fillStyle=light>.45?'#fff6da':'#171b23';ctx.globalAlpha=fade*(light>.45?(light-.45)*.7:(.45-light)*1.25);ctx.fill();
    }ctx.restore();
}

function createImpactParticles(x, y, color, count = 5, direction = null) {
    count = Math.min(count, player.graphicsQuality === 'low' ? 2 : 5);
    const maxP = getParticleConfig().maxParticles;
    for (let i = 0; i < count; i++) {
        if (particles.length >= maxP) break;
        const angle = direction === null ? Math.random() * Math.PI * 2 : direction + (Math.random() - .5) * 1.8;
        const speed = 40 + Math.random() * 80;
        particles.push(ParticlePool.acquire({
            x: x, y: y, z: 5 + Math.random() * 5,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            vz: 80 + Math.random() * 80,
            color: color || '#ff0000',
            life: 0.28 + Math.random() * 0.14,
            size: 3 + Math.random() * 2,
            spin: Math.random() * 6.28,
            gravity: 800,
            type: 'impact_facet',
            canBake: color === '#ff3333' // only low-HP blood gets baked into the ground
        }));
    }
}

function getMonsterImpactProfile(enemy) {
    const type = getEnemyMonsterType(enemy);
    if (enemy?.isBoss) {
        return { color: '#ff3333', secondary: '#ffcc66', type: 'flesh', text: null };
    }

    const profiles = {
        skeleton: { color: '#e8e2cf', secondary: '#9d9278', type: 'bone', text: null },
        ranged: { color: '#e8e2cf', secondary: '#9d9278', type: 'bone', text: null },
        zombie: { color: '#6f8f42', secondary: '#3f5f2a', type: 'rot', text: null },
        mummy: { color: '#d7c28f', secondary: '#8c7345', type: 'dust', text: null },
        ghost: { color: '#8fd8ff', secondary: '#d8f4ff', type: 'spirit', text: null },
        specter: { color: '#75d7ff', secondary: '#fff6a8', type: 'spirit', text: null },
        vampire: { color: '#b40022', secondary: '#ff6b7a', type: 'blood', text: null },
        shaman: { color: '#ff5333', secondary: '#ffd166', type: 'demon', text: null },
        melee: { color: '#ff3333', secondary: '#ff9a4d', type: 'flesh', text: null }
    };
    return profiles[type] || profiles.melee;
}

// ========== dropVFXsystem ==========
let screenShake = { intensity: 0, duration: 0 };

// force=true overrides the cap (for key VFX like boss deaths and unique drops)
// Canvas shadowBlur is a performance killer; enable only at ultra quality with modest object counts
function setGlow(ctx, blur, color, force = false) {
    if (player.graphicsQuality === 'high' || force) {
// We dynamically downgrade via a simple particle/item count check
// Screen shake
        if (particles.length > 50 && !force) return;
        ctx.shadowBlur = blur;
        ctx.shadowColor = color;
    }
}

function clearGlow(ctx) {
    ctx.shadowBlur = 0;
}

// screen shakeeffect
function triggerScreenShake(intensity = 10, duration = 0.3) {
    screenShake.intensity = intensity;
    screenShake.duration = duration;
}

// createDropBeam & createPortalBeam (moved to item-system.js)
// Create flying pickup particles (Vampire-Survivors-like suck-in)

// Control points: fly outward first, then curve inward
function createFlyingPickup(item, type) {
    const startX = item.x;
    const startY = item.y;

// Control point 1: outward + tossed upward
    const dirX = startX - player.x;
    const dirY = startY - player.y;
    const dist = Math.hypot(dirX, dirY);

    // controltap1:towardoutside+towardontoss
    const controlX1 = startX + (dirX / dist) * 40 + (Math.random() - 0.5) * 60;
    const controlY1 = startY - 50 - Math.random() * 30;

    // controltap2:lean onnearplayer
    const controlX2 = player.x + (Math.random() - 0.5) * 30;
    const controlY2 = player.y - 40;

    // color
    let color = '#ffd700'; // default gold
    if (type === 'potion') {
        color = item.heal ? '#ff4444' : '#4499ff'; // red/blue potions
    } else if (type === 'scroll') {
        color = '#aaaaff';
    }

    const fp = FlyingPickupPool.acquire({
        type: type,
        item: item,
        value: item.val || 0,
        x: startX,
        y: startY,
        startX: startX,
        startY: startY,
        controlX1: controlX1,
        controlY1: controlY1,
        controlX2: controlX2,
        controlY2: controlY2,
        progress: 0,
        color: color,
        size: type === 'gold' ? 4 : 6
    });

    flyingPickups.push(fp);

// Reward logic when the flight lands
    GSAPAnims.lootFly(fp, player, () => {
// Auto battle hire fee cut
        if (fp.type === 'gold') {
            addGold(fp.value);
// Remove from the array and recycle into the pool
            if (AutoBattle.enabled) {
                processAutoBattleFee(fp.value);
            }
            createDamageNumber(player.x, player.y - 40, `+${fp.value} G`, 'gold');
            AudioSys.play('gold');
        } else if (fp.type === 'potion' || fp.type === 'scroll') {
            if (addItemToInventory(fp.item)) {
                showNotification(`Looted: ${fp.item.displayName || fp.item.name}`);
            }
        }
// Trigger the level-up VFX
        const idx = flyingPickups.indexOf(fp);
        if (idx !== -1) {
            flyingPickups.splice(idx, 1);
            FlyingPickupPool.release(fp);
        }
    });
}

// 1.5s VFX duration
function triggerLevelUpEffect(newLevel) {
    levelUpEffect.active = true;
    levelUpEffect.timer = 1.5; // 1.5secondVFXduration
    levelUpEffect.flashAlpha = 0.8;
    levelUpEffect.newLevel = newLevel;

    // screen shake
    triggerScreenShake(10, 0.4);

    // SFX
    AudioSys.play('levelup');

    // Creategold-coloredlight pillar
    createLevelUpBeam(player.x, player.y);
    spawnVfxEffect('levelUpBurst', player.x, player.y, 1, 0);

// Create rising stars
    const particleCount = player.graphicsQuality === 'low' ? 4 : 10;
    for (let i = 0; i < particleCount && particles.length < getParticleConfig().maxParticles; i++) {
        const angle = (Math.PI * 2 / particleCount) * i + Math.random() * 0.2;
        const speed = 150 + Math.random() * 200;
        const sparkColor = ['#ffd700', '#ffaa00', '#ffcc44', '#ffffff'][Math.floor(Math.random() * 4)];

        particles.push({
            x: player.x,
            y: player.y - 20,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 80,
            color: sparkColor,
            life: 1.0 + Math.random() * 0.5,
            size: 3 + Math.random() * 4,
            gravity: 100
        });
    }

// Show the level-up text
    for (let i = 0; i < (player.graphicsQuality === 'low' ? 2 : 4) && particles.length < getParticleConfig().maxParticles; i++) {
        particles.push({
            type: 'rising_spark',
            x: player.x + (Math.random() - 0.5) * 60,
            y: player.y,
            vy: -200 - Math.random() * 150,
            color: '#ffd700',
            life: 1.2 + Math.random() * 0.5,
            size: 4 + Math.random() * 3
        });
    }

// Create the level-up beam (gold version)
    createDamageNumber(player.x, player.y - 80, `🎉 Lv.${newLevel} 🎉`, '#ffd700');
}

// Boss death VFX: slow motion + key beam + kill counter
function createLevelUpBeam(x, y) {
    const beamColor = '#ffd700';
    const glowColor = 'rgba(255, 215, 0, 0.6)';

    particles.push({
        type: 'drop_beam',
        x: x,
        y: y,
        color: beamColor,
        glowColor: glowColor,
        life: 1.5,
        maxLife: 1.5,
        height: 300,
        width: 60,
        isUnique: true
    });
}

// Boss death VFX: slow motion + key light pillar + kill number
// Boss death VFX:slow motion + key light pillar + kill counter (alreadymove to enemy-system.js)

// Elite death VFX: flashier than normal, lighter than boss
function triggerEliteDeathEffect(elite, damage) {
// 0.3s slow motion
    slowMotion.active = true;
    slowMotion.timer = 0.3;  // 0.3secondslow motion
    slowMotion.scale = 0.4;  // 40%speed

    // inetc.screen shake
    triggerScreenShake(12, 0.3);

    AudioSys.play('elite_death');

// Elite name hint
    damageNumbers.push({
        x: elite.x,
        y: elite.y - 40,
        val: `⚔ ${Math.floor(damage)} ⚔`,
        color: '#aa44ff',
        life: 1.8,
        fontSize: 32,
        vx: (Math.random() - 0.5) * 20,
        vy: -60,
        gravity: 50
    });

// Purple light pillar (shorter than the Boss)
    damageNumbers.push({
        x: elite.x,
        y: elite.y - 70,
        val: `${elite.name} slain`,
        color: '#ffaa00',
        life: 2.0,
        fontSize: 18,
        vx: 0,
        vy: -20,
        gravity: 0
    });

    // Purple light pillar (shorter than the Boss)
    particles.push({
        type: 'drop_beam',
        x: elite.x,
        y: elite.y,
        color: '#aa44ff',
        glowColor: 'rgba(170, 68, 255, 0.5)',
        life: 0.8,
        maxLife: 0.8,
        height: 200,
        width: 40,
        isUnique: false
    });


}

// Draw the portal (blue-purple rotating energy vortex)

// Outer halo (pulsing)
function drawPortal(x, y, label) {
    const time = Date.now() / 1000;
    const baseRadius = 18;

// Outer rotating ring (counterclockwise)
    const pulseScale = 1 + Math.sin(time * 3) * 0.15;
    const glowRadius = baseRadius * 1.8 * pulseScale;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
    gradient.addColorStop(0, 'rgba(100, 150, 255, 0.4)');
    gradient.addColorStop(0.5, 'rgba(80, 100, 200, 0.2)');
    gradient.addColorStop(1, 'rgba(60, 80, 180, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
    ctx.fill();

// Inner rotating ring (clockwise)
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-time * 1.5);
    ctx.strokeStyle = 'rgba(100, 180, 255, 0.7)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 / 6) * i;
        const arcStart = angle - 0.3;
        const arcEnd = angle + 0.3;
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius * 1.2, arcStart, arcEnd);
        ctx.stroke();
    }
    ctx.restore();

// Center energy core
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(time * 2.5);
    ctx.strokeStyle = 'rgba(180, 120, 255, 0.8)';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 4; i++) {
        const angle = (Math.PI * 2 / 4) * i;
        const arcStart = angle - 0.4;
        const arcEnd = angle + 0.4;
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius * 0.7, arcStart, arcEnd);
        ctx.stroke();
    }
    ctx.restore();

    // centerENEcore
    const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, baseRadius * 0.5);
    coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    coreGradient.addColorStop(0.5, 'rgba(150, 200, 255, 0.6)');
    coreGradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(x, y, baseRadius * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Floating energy particles (converging toward center)
    for (let i = 0; i < 5; i++) {
        const particleAngle = time * 2 + (Math.PI * 2 / 5) * i;
        const particleRadius = baseRadius * (0.8 + Math.sin(time * 4 + i) * 0.3);
        const px = x + Math.cos(particleAngle) * particleRadius;
        const py = y + Math.sin(particleAngle) * particleRadius;
        const pSize = 2 + Math.sin(time * 5 + i * 2) * 1;

        ctx.fillStyle = `rgba(200, 220, 255, ${0.6 + Math.sin(time * 3 + i) * 0.3})`;
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fill();
    }

    // tab
    ctx.fillStyle = '#aaddff';
    ctx.font = '12px Cinzel';
    ctx.textAlign = 'center';
    setGlow(ctx, 8, '#4488ff');
    ctx.fillText(label, x, y - 28);
    clearGlow(ctx);
}

// Outer glow
function drawDungeonExit(x, y, label) {
    const time = Date.now() / 1000;
    const size = 20;

// Descending stair effect (three rectangles)
    const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 1.5);
    glowGradient.addColorStop(0, 'rgba(60, 120, 200, 0.4)');
    glowGradient.addColorStop(0.7, 'rgba(40, 80, 160, 0.15)');
    glowGradient.addColorStop(1, 'rgba(20, 40, 80, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Descending stair effect (three rectangles)
    const pulseOffset = Math.sin(time * 2) * 2;
    ctx.fillStyle = '#1a3355';
    ctx.fillRect(x - size, y - size / 2 + pulseOffset, size * 2, size / 3);
    ctx.fillStyle = '#2a4466';
    ctx.fillRect(x - size * 0.7, y - size / 6 + pulseOffset, size * 1.4, size / 3);
    ctx.fillStyle = '#3a5577';
    ctx.fillRect(x - size * 0.4, y + size / 6 + pulseOffset, size * 0.8, size / 3);

    // borderglow
    ctx.strokeStyle = `rgba(80, 150, 255, ${0.6 + Math.sin(time * 3) * 0.3})`;
    ctx.lineWidth = 2;
    setGlow(ctx, 10, '#4488ff');
    ctx.strokeRect(x - size, y - size / 2 + pulseOffset, size * 2, size);
    clearGlow(ctx);

// Tab
    ctx.fillStyle = `rgba(100, 180, 255, ${0.7 + Math.sin(time * 4) * 0.2})`;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.6 + pulseOffset);
    ctx.lineTo(x - 6, y + pulseOffset);
    ctx.lineTo(x + 6, y + pulseOffset);
    ctx.closePath();
    ctx.fill();

    // tab
    ctx.fillStyle = '#88ccff';
    ctx.font = '12px Cinzel';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y - size - 8);
}

// Outer warm glow
function drawDungeonEntrance(x, y, label) {
    const time = Date.now() / 1000;
    const size = 18;

    // Outer warm glow
    const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 1.6);
    glowGradient.addColorStop(0, 'rgba(200, 150, 50, 0.35)');
    glowGradient.addColorStop(0.6, 'rgba(180, 120, 40, 0.15)');
    glowGradient.addColorStop(1, 'rgba(100, 80, 30, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(x, y, size * 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Arch shape
    const pulseScale = 1 + Math.sin(time * 2.5) * 0.05;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(pulseScale, pulseScale);

// Arch interior (lit)
    ctx.fillStyle = '#3d2a1a';
    ctx.beginPath();
    ctx.moveTo(-size, size * 0.6);
    ctx.lineTo(-size, -size * 0.3);
    ctx.arc(0, -size * 0.3, size, Math.PI, 0, false);
    ctx.lineTo(size, size * 0.6);
    ctx.closePath();
    ctx.fill();

// Border glow
    const innerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.7);
    innerGradient.addColorStop(0, 'rgba(255, 220, 150, 0.8)');
    innerGradient.addColorStop(0.7, 'rgba(255, 180, 80, 0.4)');
    innerGradient.addColorStop(1, 'rgba(200, 120, 50, 0.2)');
    ctx.fillStyle = innerGradient;
    ctx.beginPath();
    ctx.moveTo(-size * 0.6, size * 0.5);
    ctx.lineTo(-size * 0.6, -size * 0.2);
    ctx.arc(0, -size * 0.2, size * 0.6, Math.PI, 0, false);
    ctx.lineTo(size * 0.6, size * 0.5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // borderglow
    ctx.strokeStyle = `rgba(255, 200, 100, ${0.5 + Math.sin(time * 3) * 0.3})`;
    ctx.lineWidth = 2;
    setGlow(ctx, 8, '#ffaa44');
    ctx.beginPath();
    ctx.moveTo(x - size, y + size * 0.6);
    ctx.lineTo(x - size, y - size * 0.3);
    ctx.arc(x, y - size * 0.3, size, Math.PI, 0, false);
    ctx.lineTo(x + size, y + size * 0.6);
    ctx.stroke();
    clearGlow(ctx);

// Tab
    ctx.fillStyle = `rgba(255, 220, 120, ${0.6 + Math.sin(time * 4) * 0.3})`;
    const arrowY = y - size * 0.5 + Math.sin(time * 3) * 3;
    ctx.beginPath();
    ctx.moveTo(x, arrowY - 8);
    ctx.lineTo(x - 5, arrowY);
    ctx.lineTo(x + 5, arrowY);
    ctx.closePath();
    ctx.fill();

    // tab
    ctx.fillStyle = '#ffcc88';
    ctx.font = '12px Cinzel';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y - size - 12);
}

// 1. Ground shadow
function drawWaypoint(x, y, floor, isActive) {
    const time = Date.now() / 1000;
    const floorName = typeof getFloorName === 'function' ? getFloorName(floor) : `Floor ${floor}`;

    ctx.save();

    // 1. groundshadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(x, y + 4, 30, 18, 0, 0, Math.PI * 2);
    ctx.fill();

// Pedestal side thickness
    ctx.fillStyle = isActive ? '#1b263b' : '#1e2022';
    ctx.strokeStyle = isActive ? '#415a77' : '#33373b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y + 2, 26, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

// Inner rune steps
    ctx.fillStyle = isActive ? '#0d1b2a' : '#141618';
    ctx.beginPath();
    ctx.ellipse(x, y + 5, 26, 15, 0, 0, Math.PI);
    ctx.lineTo(x - 26, y + 2);
    ctx.ellipse(x, y + 2, 26, 15, 0, Math.PI, 0, true);
    ctx.closePath();
    ctx.fill();

// ========== Active state: brilliant arcane energy and light pillar ==========
    ctx.fillStyle = isActive ? '#0d1b2a' : '#181a1b';
    ctx.beginPath();
    ctx.ellipse(x, y, 20, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    if (isActive) {
        // ========== Active state: brilliant arcane energy and light pillar ==========
// B. Rotating rune circle
        const pulse = 1 + Math.sin(time * 3) * 0.12;
        const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, 38 * pulse);
        glowGrad.addColorStop(0, 'rgba(0, 229, 255, 0.45)');
        glowGrad.addColorStop(0.5, 'rgba(0, 140, 255, 0.2)');
        glowGrad.addColorStop(1, 'rgba(0, 80, 200, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.ellipse(x, y, 38 * pulse, 22 * pulse, 0, 0, Math.PI * 2);
        ctx.fill();

        // B. Rotating rune circle
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(1, 0.55); // Outer rune arc ring
        ctx.rotate(time * 0.8);

        ctx.strokeStyle = 'rgba(100, 230, 255, 0.85)';
        ctx.lineWidth = 1.5;
        setGlow(ctx, 8, '#00e5ff');

// Inner rotating cross geometry
        for (let i = 0; i < 4; i++) {
            const ang = (Math.PI / 2) * i;
            ctx.beginPath();
            ctx.arc(0, 0, 16, ang + 0.15, ang + (Math.PI / 2) - 0.15);
            ctx.stroke();
        }

// C. Vertical arcane light pillar
        ctx.beginPath();
        ctx.moveTo(-10, 0); ctx.lineTo(10, 0);
        ctx.moveTo(0, -10); ctx.lineTo(0, 10);
        ctx.stroke();

        ctx.restore();
        clearGlow(ctx);

        // C. Vertical arcane light pillar
        const beamGrad = ctx.createLinearGradient(x, y, x, y - 55);
        beamGrad.addColorStop(0, 'rgba(0, 229, 255, 0.45)');
        beamGrad.addColorStop(0.3, 'rgba(0, 180, 255, 0.25)');
        beamGrad.addColorStop(0.8, 'rgba(60, 100, 255, 0.08)');
        beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(x - 12, y);
        ctx.lineTo(x + 12, y);
        ctx.lineTo(x + 6, y - 55);
        ctx.lineTo(x - 6, y - 55);
        ctx.closePath();
        ctx.fill();

// ========== Inactive state: dull ancient stone pedestal with faint potential ==========
        for (let i = 0; i < 6; i++) {
            const pTime = (time * 1.6 + i * 0.35) % 1.0;
            const pY = y - pTime * 52;
            const pAngle = time * 2.5 + i * 1.05;
            const pX = x + Math.sin(pAngle) * (8 * (1 - pTime * 0.5));
            const pAlpha = (1 - pTime) * (0.6 + Math.sin(time * 5 + i) * 0.3);
            const pSize = (1.5 + (1 - pTime) * 1.5);

            ctx.fillStyle = `rgba(180, 245, 255, ${Math.max(0, pAlpha)})`;
            setGlow(ctx, 4, '#00e5ff');
            ctx.beginPath();
            ctx.arc(pX, pY, pSize, 0, Math.PI * 2);
            ctx.fill();
        }
        clearGlow(ctx);

    } else {
// Four dormant rune nodes at the corners
        const dimPulse = 0.3 + Math.sin(time * 2) * 0.15;
        ctx.strokeStyle = `rgba(100, 120, 145, ${dimPulse})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(x, y, 14, 8, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Four dormant rune nodes at the corners
        for (let i = 0; i < 4; i++) {
            const rad = (Math.PI / 2) * i + Math.PI / 4;
            const nx = x + Math.cos(rad) * 16;
            const ny = y + Math.sin(rad) * 9;
            ctx.fillStyle = '#475569';
            ctx.beginPath();
            ctx.arc(nx, ny, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

// Stone pillar body
    const pillarOffsets = [
        { dx: -22, dy: -5, h: 14 },
        { dx: 22, dy: -5, h: 14 },
        { dx: -16, dy: 9, h: 12 },
        { dx: 16, dy: 9, h: 12 }
    ];

    pillarOffsets.forEach((p, idx) => {
        const px = x + p.dx;
        const py = y + p.dy;
        
// Top energy crystal / rune spire
        ctx.fillStyle = isActive ? '#243b55' : '#22252a';
        ctx.fillRect(px - 2.5, py - p.h, 5, p.h);
        
        ctx.strokeStyle = isActive ? '#4a709c' : '#3a3f47';
        ctx.lineWidth = 1;
        ctx.strokeRect(px - 2.5, py - p.h, 5, p.h);

        // Top energy crystal / rune spire
        if (isActive) {
            const crystalFlicker = 0.7 + Math.sin(time * 4 + idx * 1.5) * 0.3;
            ctx.fillStyle = `rgba(0, 240, 255, ${crystalFlicker})`;
            setGlow(ctx, 6, '#00e5ff');
            ctx.beginPath();
            ctx.arc(px, py - p.h - 2, 2.5, 0, Math.PI * 2);
            ctx.fill();
            clearGlow(ctx);
        } else {
            ctx.fillStyle = '#4b5563';
            ctx.beginPath();
            ctx.arc(px, py - p.h - 1, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });

// Generic helper for drawing organic blood/splatter
    ctx.font = 'bold 12px Cinzel, "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';

    if (isActive) {
        ctx.fillStyle = '#67e8f9';
        setGlow(ctx, 8, '#00bcd4');
        const wpTitle = typeof I18N !== 'undefined' ? I18N.t('menu_waypoints') : 'Waypoint';
        ctx.fillText(`⚡ ${floorName} · ${wpTitle}`, x, y - 36);
        clearGlow(ctx);
    } else {
        ctx.fillStyle = '#94a3b8';
        setGlow(ctx, 4, '#334155');
        const wpLocked = typeof I18N !== 'undefined' ? I18N.t('waypoint_locked') : 'Waypoint not activated';
        ctx.fillText(`🔒 ${floorName} · ${wpLocked}`, x, y - 28);
        clearGlow(ctx);
    }

    ctx.restore();
}

// Random stretching simulates the irregularity of liquid splatter
function drawSplatToCtx(targetCtx, x, y, radius, baseColor, alpha) {
    targetCtx.save();
    targetCtx.translate(x, y);
    targetCtx.rotate(Math.random() * Math.PI * 2);
// Use matching deep/light gradients for each element
    targetCtx.scale(0.8 + Math.random() * 0.4, 0.6 + Math.random() * 0.4);

    const gradient = targetCtx.createRadialGradient(0, 0, 0, 0, 0, radius);
    if (baseColor === '#ff3333' || baseColor === COLORS.poison) {
        // Use matching deep/light gradients for each element
        const darkColor = baseColor === '#ff3333' ? 'rgba(80, 0, 0, 0)' : 'rgba(0, 50, 0, 0)';
        const midColor = baseColor === '#ff3333' ? `rgba(140, 0, 0, ${alpha})` : `rgba(0, 140, 0, ${alpha})`;
        gradient.addColorStop(0, midColor);
        gradient.addColorStop(1, darkColor);
    } else {
        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
    }

    targetCtx.fillStyle = gradient;
    targetCtx.beginPath();
    targetCtx.ellipse(0, 0, radius, radius * 0.7, 0, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.restore();
}

// Monster death - strong juice feel
function createBloodSplat(x, y, size) {
    if (!bloodCtx) return;
    const splatCount = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < splatCount; i++) {
        const sx = x + (Math.random() - 0.5) * size * 2;
        const sy = y + (Math.random() - 0.5) * size * 2;
        const radius = (size * 0.5) + Math.random() * size;
        drawSplatToCtx(bloodCtx, sx, sy, radius, '#ff3333', 0.4 + Math.random() * 0.3);
    }
}

function finalizeEnemyDeath(e, totalDamage) {
    if (!e || e.dead) return;
    SkillBranchSystem.killed();

    // Monster death - strong juice feel
    e.hp = 0;
    e.dead = true;
    e.deadAt = Date.now();
    e.deathVisualDuration = e.isBoss ? 1.5 : 1.05;
    e.deathVisualTimer = e.deathVisualDuration;
    e.bossSkillVisual = null;
    Juice.hit(e, false, true); // killrespond back
    spawnEnemyDeathVfx(e);

// Tutorial: step 5 - kill the first monster
    createBloodSplat(e.x, e.y, e.radius);
    emitMummyDeathCloud(e);

    player.kills++;
    if (typeof OnlineSystem !== 'undefined' && OnlineSystem.recordWeeklyKill) OnlineSystem.recordWeeklyKill();
// Monster codex: record discovery
    if (player.kills === 1) advanceTutorial(5);

    // Monster codex: record discovery
    discoverMonster(e);

    // Daily quest: kill monsters
    if (typeof DailyQuestSystem !== 'undefined') {
        DailyQuestSystem.updateProgress('kill', 1);
    }

    // Weekly goal: kill monsters
    if (typeof WeeklyGoalSystem !== 'undefined') {
        WeeklyGoalSystem.onMonsterKilled();
    }

    // Update kill stats
    player.stats.currentStreak++;
    if (player.stats.currentStreak > player.stats.maxKillStreak) {
        player.stats.maxKillStreak = player.stats.currentStreak;
    }
    if (e.isBoss) {
        player.stats.bossKills++;
        // Boss death VFX: slow motion + key light pillar + kill number
        triggerBossDeathEffect(e, totalDamage);
        // Server-wide announce: boss kill
        if (typeof OnlineSystem !== 'undefined') {
            OnlineSystem.announce('boss_kill', e.name);
        }
        // Daily quest: kill boss
        if (typeof DailyQuestSystem !== 'undefined') {
            DailyQuestSystem.updateProgress('kill_boss', 1);
        }
    }
    if (e.isElite) {
        player.stats.eliteKills++;
        // Elite death VFX: flashier than normal, lighter than boss
        triggerEliteDeathEffect(e, totalDamage);
        // Daily quest: kill elite
        if (typeof DailyQuestSystem !== 'undefined') {
            DailyQuestSystem.updateProgress('kill_elite', 1);
        }
        // Season journey: kill elites
        if (typeof SeasonSystem !== 'undefined') {
            SeasonSystem.trackEliteKill();
        }
    }

// Bloodthirst: restore life on kill (talent + Divine Blessing)
    // Bloodthirst: restore life on kill (talent + Divine Blessing)
    const onKillHealPct = getTalentEffect('onKillHealPct', 0) + (player.onKillHealPct || 0);
    if (onKillHealPct > 0) {
        const healAmt = player.maxHp * onKillHealPct / 100;
        player.hp = Math.min(player.maxHp, player.hp + healAmt);
        createDamageNumber(player.x, player.y - 30, `+${Math.floor(healAmt)}`, '#00ff00');
    }

// Use the normal damage flow so drops/XP/achievements fire correctly
    if (hasTalent('thunder_chain')) {
        const chainRange = 150;
        const chainDamage = totalDamage * 0.3;
        enemies.forEach(other => {
            if (!other.dead && other !== e) {
                const dist = Math.hypot(other.x - e.x, other.y - e.y);
                if (dist < chainRange) {
// Create lightning visuals
                    takeDamage(other, { lightning: chainDamage }, true);
// Trigger elite affix on-death effects
                    particles.push({
                        x: e.x, y: e.y,
                        tx: other.x, ty: other.y,
                        type: 'chain_lightning',
                        life: 0.3
                    });
                }
            }
        });
    }

    // Trigger elite affix on-death effects
    if (e.eliteAffixes && e.eliteAffixes.length > 0) {
        e.eliteAffixes.forEach(affix => {
            if (affix.onDeath) {
                affix.onDeath(e);
            }
        });
    }

    // Track boss-kill achievements
    if (e.isBoss || e.isQuestTarget) {
        trackAchievement('kill_boss', { isBoss: true, isQuestTarget: e.isQuestTarget, name: e.name });
        trackAchievement('kill_specific_boss', { name: e.name });

        // Set this floor boss respawn timer (5 min)
        const cooldown = 5 * 60 * 1000;
        player.bossRespawn[player.floor] = Date.now() + cooldown;
    }

    // Compute XP (checks double/triple XP buffs + level-gap factor)
    let xpGain = e.xpValue || 15;

    // Level-gap XP factor: rewards fighting level-appropriate monsters
    const currentFloor = player.isInHell ? player.hellFloor : player.floor;
    const monsterLevel = currentFloor * 2;  // monster level ≈ stacks × 2
    const levelDiff = player.lvl - monsterLevel;
    let levelMultiplier = 1;
    if (levelDiff > 5) {
        // Player 5+ levels above the monster: XP drops sharply (-15% per level, min 10%)
        levelMultiplier = Math.max(0.1, 1 - (levelDiff - 5) * 0.15);
    } else if (levelDiff < -5) {
// Double/triple XP buffs
        levelMultiplier = Math.min(1.3, 1 + Math.abs(levelDiff + 5) * 0.05);
    }
    xpGain *= levelMultiplier;

    // double/triple XP buff
    let xpMultiplier = 1;
    if (player.xpBuffTripleExpiry && Date.now() < player.xpBuffTripleExpiry) {
        xpMultiplier = 3;  // tripleXPpriority
    } else if ((player.xpBuffExpiry && Date.now() < player.xpBuffExpiry) || (player.doubleExpUntil && Date.now() < player.doubleExpUntil)) {
        xpMultiplier = 2;  // double XP (shop scroll or return bundle)
    }
    xpGain *= xpMultiplier;
    player.xp += xpGain;
    dropLoot(e);
    checkLevelUp();

    // QUEST LOGIC
    const currentQ = getCurrentQuest();
    if (currentQ && player.questState === 1) {
        let progressMade = false;

        if (currentQ.type === 'kill_count' && player.floor === currentQ.floor) {
            player.questProgress++;
            if (player.questProgress >= currentQ.target) {
                player.questState = 2;
                showNotification("Quest completed!");
                AudioSys.play('quest');
            }
            progressMade = true;
        } else if ((currentQ.type === 'kill_elite' || currentQ.type === 'kill_boss') && e.isQuestTarget) {
            player.questState = 2;
            showNotification(`Defeated ${e.name}!`);
            AudioSys.play('quest');
            progressMade = true;

            // Si es Baal (Boss del piso 10), desbloquear modo Infierno
            const baseBossName = (typeof stripBossDifficultyPrefix === 'function') ? stripBossDifficultyPrefix(e.name) : e.name;
            if (baseBossName.includes('Baal') && player.floor === 10) {
                player.defeatedBaal = true;
// ========== Unified player damage entry ==========
                trackAchievement('kill_baal', { name: e.name });
                showNotification('The Gates of Hell have opened!');
                AudioSys.play('quest');
            }
        }

        if (progressMade) { updateQuestTracker(); updateMenuIndicators(); }
    }
}

// ========== Unified player damage entry point ==========
// All enemy damage should flow through this so shields, armor and talents apply uniformly
function playerTakeDamage(rawDamage, source, options = {}) {
    const {
        ignoreShield = false,   // Whether to ignore armor
        ignoreArmor = false,    // damage type: physical/fire/cold/lightning/poison
        damageType = 'physical', // damage type: physical/fire/cold/lightning/poison
        sourceName = null
    } = options;

// 2. Shield invulnerability check (Guardian Angel skill)
    if (player.invincibleTimer > 0) return 0;

// 3. Berserker talent: damage taken +20%
    if (player.shield?.invincibleTimer > 0) return 0;

    let damage = rawDamage * SkillBranchSystem.enemyCriticalMultiplier(options.isCrit, options.critMultiplier);

    // 3. Berserker talent: damage taken +20%
    const damageTakenPct = getTalentEffect('damageTakenPct', 0);
    if (damageTakenPct > 0) {
        damage *= (1 + damageTakenPct / 100);
    }
    if (player.cursedTimer > 0 && player.curseDamageTakenMult > 1) {
        damage *= player.curseDamageTakenMult;
    }

// 5. Armor mitigation (physical, new formula: armor/(armor+100))
    if (damageType !== 'physical' && player.resistances[damageType]) {
        damage *= (1 - player.resistances[damageType] / 100);
    }

// 6. Shield absorption
    if (!ignoreArmor && damageType === 'physical' && player.armor > 0) {
        const armorBreak = player.cursedTimer > 0 ? (player.cursedArmorBreak || 0) : 0;
        const effectiveArmor = Math.max(0, player.armor * (1 - armorBreak));
        const reduction = effectiveArmor / (effectiveArmor + 100);
        damage *= (1 - reduction);
    }

    damage = Math.floor(damage);
    if (damage <= 0) return 0;

    // 6. shieldabsorb
    if (!ignoreShield) damage = SkillBranchSystem.absorb(damage);
    let shieldAbsorbed = 0;
    if (!ignoreShield && player.shield?.active && player.shield?.value > 0) {
        shieldAbsorbed = Math.min(player.shield.value, damage);
        player.shield.value -= shieldAbsorbed;
        damage -= shieldAbsorbed;

// Break effects apply instantly so the next hit in the same frame sees healing, invulnerability or the secondary shield.
        if (player.shield.type === 'reflect' && source && !source.dead) {
            const tree = player.skillTree?.holy_shield;
            const reflectRatio = tree?.stage2?.level > 0 ?
                (SKILL_TREE.holy_shield.stage2.reflect.effect.reflectRatio +
                 SKILL_TREE.holy_shield.stage2.reflect.effect.reflectPerLevel * (tree.stage2.level - 1)) : 0;
            if (reflectRatio > 0) {
                const reflectDmg = Math.floor(shieldAbsorbed * reflectRatio);
                if (reflectDmg > 0) {
                    source.hp -= reflectDmg;
                    createDamageNumber(source.x, source.y - 10, reflectDmg, '#ffff00');
                    if (source.hp <= 0) finalizeEnemyDeath(source, reflectDmg);
                }
            }
        }

        if (shieldAbsorbed > 0) {
            if (typeof Shield3D !== 'undefined') Shield3D.hit(source ? source.x-player.x : 1, source ? source.y-player.y : 0);
            const sourceAngle = source ? Math.atan2(player.y - source.y, player.x - source.x) : 0;
            spawnVfxEffect(COMBAT_FEEDBACK_VFX.guardFlash, player.x, player.y - 12, 0.82, sourceAngle);
            spawnVfxEffect('shieldPulseStatus', player.x, player.y + 4, 0.75, 0);
            createDamageNumber(player.x, player.y - 50, `Shield -${shieldAbsorbed}`, '#66ccff');
        }
    }

// 7. Deduct HP (bounds checked)
    if (shieldAbsorbed > 0 && player.shield.value <= 0) SkillBranchSystem.updateHolyShield(0);

// Hit feedback
    if (damage > 0) {
        const wasLowHp = player.hp / player.maxHp <= GAME_CONFIG.LOW_HP_THRESHOLD;
        player.hp = Math.max(0, player.hp - damage);
        player.lastDamageSource = sourceName || source?.name || player.lastDamageSource || 'Environmental damage';

        // hurtfeedback
        spawnPlayerDamageVfx(damageType, source, wasLowHp);
        createDamageNumber(player.x, player.y - 20, Math.floor(damage), COLORS.damage);
        if (cachedUI.hpOrb) GSAPAnims.shake(cachedUI.hpOrb, 8);
        AudioSys.play(wasLowHp ? `player_hit_${damageType}_low` : `player_hit_${damageType}`);
        triggerHeroAction('hurt', 0.25);

// Set invincibility frames
        combo.active = false;
        combo.count = 0;

// 8. Thorns reflect (talent + Divine Blessing)
        player.invincibleTimer = 0.3;
    }

    // 8. thornsreflect（talent+Divine Blessing）
    if (source && !source.dead) {
        const thornsPct = getTalentEffect('thornsPct', 0) + (player.thornsPct || 0);
        if (thornsPct > 0) {
            const thornsDmg = Math.floor(rawDamage * thornsPct / 100);
            if (thornsDmg > 0) {
                source.hp -= thornsDmg;
                createDamageNumber(source.x, source.y - 10, thornsDmg, COLORS.thornsDamage);
                if (source.hp <= 0) finalizeEnemyDeath(source, thornsDmg);
            }
        }
    }

    // 9. auto battlerecordattackone who
    if (source) AutoBattle.onPlayerDamaged(source);

    // 10. Checkdeath
    updateUI();
    checkPlayerDeath();

    return damage + shieldAbsorbed;
}

function updateHeroDeathVisual(dt) {
    const previous = player.deathTimer;
    player.deathTimer = Math.min(0.9, previous + dt);
    if (previous < 0.9 && player.deathTimer >= 0.9) DeathPanel.show();
}

function checkPlayerDeath() {
    if (player.isDead) return;
    if (player.hp <= 0) {
        // Phoenix talent: revive once on death
        if (hasTalent('phoenix') && !player.phoenixUsed) {
            player.phoenixUsed = true;
            player.hp = player.maxHp * 0.5;
            createFloatingText(player.x, player.y - 50, "Phoenix rebirth!", '#ff8800', 2);
            AudioSys.play('levelup');
            // CreatereviveVFX
            for (let i = 0; i < 20; i++) {
                particles.push({
                    x: player.x, y: player.y,
                    color: '#ff8800',
                    vx: (Math.random() - 0.5) * 200,
                    vy: (Math.random() - 0.5) * 200,
                    life: 1,
                    size: 5
                });
            }
            return; // Mark that the player has died
        }

// Death protection: Rage buff stacking (+10% damage per death, max 3 stacks, cleared on completion)
        player.died = true;

// Set the death state (no countdown anymore; a dialog asks instead)
        player.rageBonus = Math.min((player.rageBonus || 0) + 0.1, 0.3);
        const ragePct = Math.round(player.rageBonus * 100);
        const lang = (typeof I18N !== 'undefined' && I18N.currentLang) ? I18N.currentLang : 'zh';
        let rageMsg = `💢 Rage rising! Damage +${ragePct}% (stacks up to 3 times, cleared on completion)`;
        if (lang === 'es') rageMsg = `💢 ¡Furia activada! Daño +${ragePct}%`;
        else if (lang === 'en') rageMsg = `💢 Rage buff activated! Damage +${ragePct}%`;
        if (typeof showNotification === 'function') showNotification(rageMsg, 'danger');

// Add the fullscreen grayscale death filter
        player.isDead = true;
        SkillBranchSystem.reset();
        player.deathTimer = 0;

// Submit to the leaderboard (updated on death)
        document.getElementById('game-container').classList.add('dead-filter');

// Show the cause-of-death floating text
        if (typeof OnlineSystem !== 'undefined') {
            OnlineSystem.submitScore({
                level: player.lvl,
                kills: player.kills,
                maxFloor: player.isInHell ? (player.maxHellFloor || player.hellFloor) + 10 : player.maxFloor,
                isHell: player.isInHell,
                gold: player.gold || 0
            });
        }

        // Showcause of deathfloating text
        const deathMsg = player.lastDamageSource ? `Slain by ${player.lastDamageSource}` : "You died!";
        createFloatingText(player.x, player.y - 50, deathMsg, '#ff4444', 3);

        // Closeauto battle
        if (AutoBattle.enabled) {
            AutoBattle.enabled = false;
            document.getElementById('auto-battle-btn').classList.remove('active');
            document.getElementById('auto-battle-icon').textContent = '🛡️';
        }

// Stash expansion cost config
    }
}

// Get the current stash size
const STASH_EXPAND_COSTS = [1000, 5000, 20000];
const STASH_BASE_SIZE = 36;
const STASH_EXPAND_PER_LEVEL = 6;
const STASH_MAX_LEVEL = 3;

// Get the next expansion cost (null when maxed)
function getStashSize() {
    return STASH_BASE_SIZE + (player.stashLevel || 0) * STASH_EXPAND_PER_LEVEL;
}

// Expand the stash
function getStashExpandCost() {
    if (player.stashLevel >= STASH_MAX_LEVEL) return null;
    return STASH_EXPAND_COSTS[player.stashLevel];
}

// Extend the stash array
function expandStash() {
    const cost = getStashExpandCost();
    if (cost === null) {
        showNotification('Stash is at maximum capacity!');
        return;
    }
    if (player.gold < cost) {
        showNotification(`Not enough gold! Requires ${cost} G`);
        return;
    }

    player.gold -= cost;
    player.stashLevel++;

// Gold deduction floating text + sound (DOM element layered above panels)
    const newSize = getStashSize();
    while (player.stash.length < newSize) {
        player.stash.push(null);
    }

// Also update the gold display on item panels
    createFloatingText(player.x, player.y - 40, `-${cost}G`, '#ffd700', 1.5);
    AudioSys.play('gold');

    showNotification(`Stash expanded! Current capacity: ${newSize} slots`);
    renderStash();
    updateUI();

// Base 6 columns, +1 per level
    document.getElementById('gold-display').innerText = player.gold;
}

function renderStash() {
    const c = document.getElementById('stash-grid');
    c.innerHTML = '';

    const stashSize = getStashSize();
    const cols = 6 + (player.stashLevel || 0); // base6enumerate，perlevel+1enumerate

// 6-column embedded inventory
    const panel = document.getElementById('stash-panel');
    if (window.innerWidth >= 768) {
        const stashWidth = cols * 50 + 40;
        const embeddedBagWidth = 6 * 40 + 40; // Update the grid column count
        panel.style.width = Math.max(stashWidth, embeddedBagWidth) + 'px';
    }

// Ensure the stash array is large enough
    c.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

// Update the capacity display
    while (player.stash.length < stashSize) {
        player.stash.push(null);
    }

// Update the expand button
    const sizeInfo = document.getElementById('stash-size-info');
    if (sizeInfo) {
        const usedSlots = player.stash.filter(i => i !== null).length;
        sizeInfo.textContent = `(${usedSlots}/${stashSize})`;
    }

// Add the glow class by rarity
    const expandBtn = document.getElementById('stash-expand-btn');
    if (expandBtn) {
        const cost = getStashExpandCost();
        if (cost === null) {
            expandBtn.style.display = 'none';
        } else {
            expandBtn.style.display = 'block';
            const canAfford = player.gold >= cost;
            expandBtn.innerHTML = `🔨 Expand +${STASH_EXPAND_PER_LEVEL} slots <span style="color:${canAfford ? '#ffd700' : '#f66'}">${cost} G</span>`;
            expandBtn.className = 'stash-expand-btn' + (canAfford ? '' : ' disabled');
        }
    }

    for (let idx = 0; idx < stashSize; idx++) {
        const item = player.stash[idx];
        const slot = document.createElement('div');
        slot.className = 'bag-slot';

        if (item) {
            // add glow by rarity class
            if (item.rarity >= 3 && item.rarity <= 4) slot.classList.add('rarity-unique');
            else if (item.rarity === 5) slot.classList.add('rarity-set');
            else if (item.rarity === 2) slot.classList.add('rarity-rare');

// Render the embedded inventory
            if (item.requirements && !meetsRequirements(item)) {
                slot.classList.add('requirement-not-met');
            }

            applyItemSpriteToElement(slot, item);
            slot.style.display = 'flex';
            slot.style.justifyContent = 'center';
            slot.style.alignItems = 'center';

            if (item.quantity && item.quantity > 1) {
                slot.innerHTML += `<span class="item-count">${item.quantity}</span>`;
            }
            if (item.enhanceLvl > 0) {
                slot.innerHTML += `<span class="enhance-level">+${item.enhanceLvl}</span>`;
            }

            slot.onclick = (e) => {
                e.stopPropagation();
                moveItemFromStash(idx);
            };
            bindItemTooltip(slot, item);
            slot.onmousedown = (e) => e.stopPropagation();
        }

        c.appendChild(slot);
    }

// moveItemToStash/FromStash (moved to item-system.js)
    renderEmbeddedBag('stash');
}

// dropLoot (moved to item-system.js)

// Item filter: blue+ only by default (rarity >= 2); hold Alt to show all

function updateWorldLabels() {
    if (!cachedUI.worldLabels) return;
    cachedUI.worldLabels.innerHTML = '';
    groundItems.forEach(i => {
// Gold, potions and scrolls always show
// Skip low-quality items
        const isConsumable = i.type === 'gold' || i.type === 'potion' || i.type === 'scroll';
        if (!isAltPressed && !isConsumable && i.rarity < 2) {
            return; // Compute the player-item distance
        }

        const d = document.createElement('div');
        d.className = 'drop-label';
        d.innerText = i.displayName || i.name;
        d.style.color = getItemColor(i.rarity);
        if (i.rarity >= RARITY.MAGIC) {
            const glow = getItemColor(i.rarity);
            d.style.textShadow = i.rarity >= RARITY.RARE
                ? `0 0 8px ${glow}, 0 1px 2px #000`
                : `0 0 4px ${glow}, 0 1px 2px #000`;
        }

        d.onclick = e => {
            e.stopPropagation();

// Check whether within pickup range (100px)
            const distance = Math.hypot(i.x - player.x, i.y - player.y);

// Pick up directly
            if (distance < 100) {
// Pick up gold
                if (i.type === 'gold') {
                    // pickupgold
                    addGold(i.val);
                    createDamageNumber(player.x, player.y - 40, "+" + i.val + "G", 'gold');
                    AudioSys.play('gold');
                } else {
// Remove the item from the ground
                    if (!addItemToInventory(i)) {
                        createFloatingText(player.x, player.y - 40, "Inventory is full!", COLORS.warning, 1.5);
                        return;
                    }
                }

// Clear the target
                groundItems = groundItems.filter(x => x !== i);
                d.remove();
                player.targetItem = null; // cleargoal
            } else {
// Mark the item as a pickup destination
                player.targetX = i.x;
                player.targetY = i.y;
                player.targetItem = i; // markerwant togo topickupitem
                showNotification("Auto-moving to item...");
            }
        };

        i.el = d;
        cachedUI.worldLabels.appendChild(d);
    });
}

// The character uses a foot-centered circular collider; checking only the center cell is not enough.
function isWall(x, y) { const c = Math.floor(x / TILE_SIZE), r = Math.floor(y / TILE_SIZE); return c < 0 || r < 0 || c >= MAP_WIDTH || r >= MAP_HEIGHT || mapData[r][c] === 0; }

// Monster foot collision shares circular detection with the player; large-monster attack radius does not count as corridor footprint radius.
function canPlayerOccupy(x, y, radius = player.radius) {
    for(let r=Math.floor((y-radius)/TILE_SIZE);r<=Math.floor((y+radius)/TILE_SIZE);r++) {
        for(let c=Math.floor((x-radius)/TILE_SIZE);c<=Math.floor((x+radius)/TILE_SIZE);c++) {
            if(!isWall((c+.5)*TILE_SIZE,(r+.5)*TILE_SIZE))continue;
            const closestX=Math.max(c*TILE_SIZE,Math.min(x,(c+1)*TILE_SIZE));
            const closestY=Math.max(r*TILE_SIZE,Math.min(y,(r+1)*TILE_SIZE));
            if((x-closestX)**2+(y-closestY)**2<radius*radius-1e-8)return false;
        }
    }
    return true;
}

// Monster foot collision shares circular detection with the player; large-monster attack radius does not count as corridor footprint radius.
function moveEnemyWithCollision(enemy, nx, ny) {
    const radius = Math.min(enemy.radius, TILE_SIZE * .45);
    if (!canPlayerOccupy(enemy.x, enemy.y, radius)) {
// Legacy saves or portals that hug a wall get restored to a nearby legal standing spot first.
        let recovered = false;
        for (let distance = 1; distance <= TILE_SIZE && !recovered; distance++) {
            for (let i = 0; i < 8; i++) {
                const angle = i * Math.PI / 4;
                const x = enemy.x + Math.cos(angle) * distance, y = enemy.y + Math.sin(angle) * distance;
                if (canPlayerOccupy(x, y, radius)) { enemy.x = x; enemy.y = y; recovered = true; break; }
            }
        }
        if (!recovered) return;
    }
    const dx = nx - enemy.x, dy = ny - enemy.y;
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 6));
    for (let i = 0; i < steps; i++) {
        const x = enemy.x + dx / steps, y = enemy.y + dy / steps;
        if (canPlayerOccupy(x, enemy.y, radius)) enemy.x = x;
        if (canPlayerOccupy(enemy.x, y, radius)) enemy.y = y;
    }
}

function movePlayerWithCollision(nx, ny) {
// Check whether a wall blocks the two points
    if(!canPlayerOccupy(player.x,player.y)) {
        let safe=null;
        for(let distance=1;distance<=TILE_SIZE*2&&!safe;distance++)for(let i=0;i<8;i++){
            const angle=i*Math.PI/4,x=player.x+Math.cos(angle)*distance,y=player.y+Math.sin(angle)*distance;
            if(canPlayerOccupy(x,y)){safe={x,y};break;}
        }
        if(!safe)return;
        player.x=safe.x;player.y=safe.y;
    }
    const dx=nx-player.x,dy=ny-player.y;
    const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/Math.min(player.radius/2,TILE_SIZE/4)));
    for(let i=0;i<steps;i++){
        const x=player.x+dx/steps,y=player.y+dy/steps;
        if(canPlayerOccupy(x,player.y))player.x=x;
        if(canPlayerOccupy(player.x,y))player.y=y;
    }
}

// Check whether the current position is a wall
function hasLineOfSight(x1, y1, x2, y2) {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;

    let x = x1;
    let y = y1;

    while (true) {
// Arrived at the target point
        if (isWall(x, y)) return false;

// use a smaller step for a more precise check
        if (x === x2 && y === y2) break;

        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x += sx * TILE_SIZE / 4; // use a smaller step for a more precise check
        }
        if (e2 < dx) {
            err += dx;
            y += sy * TILE_SIZE / 4;
        }

// Check line of sight - a wall between player and target blocks the attack
        if (Math.abs(x - x1) > dx * 2 || Math.abs(y - y1) > dy * 2) break;
    }

    return true;
}

function getEnemyAtCursor() {
    for (let e of enemies) { if (e.dead) continue; if (Math.hypot(e.x - mouse.worldX, e.y - mouse.worldY) < e.radius + 10) return e; }
    return null;
}
function getNPCAtCursor() {
    for (let n of npcs) if (Math.hypot(n.x - mouse.worldX, n.y - mouse.worldY) < n.radius + 10) return n;
    return null;
}

function getDestructibleAtCursor() {
    const range = 25;
    if (!destructibles) return null;
    for (let d of destructibles) {
        if (!d.broken && Math.hypot(mouse.worldX - d.x, mouse.worldY - d.y) < range + 10) {
            return d;
        }
    }
    return null;
}

function performAttack(t) {
    if (!SkillBranchSystem.canAttack()) return;
    if (player.attackCooldown > 0) return;

// But close range skips the LOS check, allowing corner-hugging monsters to be attacked
// Increase the combo
    const dist = Math.hypot(t.x - player.x, t.y - player.y);
    if (player.floor > 0 && dist >= GAME_CONFIG.PLAYER_MELEE_NO_LOS_RANGE && !hasLineOfSight(player.x, player.y, t.x, t.y)) {
        return;
    }
    const attackAngle = Math.atan2(t.y - player.y, t.x - player.x);
    player.direction = directionFromDelta(t.x - player.x, t.y - player.y);

    // increasecombo
    addCombo(1);

    let dmg = Math.floor(Math.random() * (player.damage[1] - player.damage[0] + 1)) + player.damage[0];

// Crit damage bonus
    let isCrit = Math.random() * 100 < player.critChance;
    if (isCrit) {
// Crit slow motion removed for performance (was: 0.1s at 50% speed)
        const critMultiplier = 2 + (player.critDamage || 0) / 100;
        dmg = Math.floor(dmg * critMultiplier);

// Crit screen shake removed for performance

// Crit numbers and 3D hit feedback are all generated by the real damage entry.

// Normal-attack screen shake removed for performance
    }
// Build the damage object (physical and elemental)

// Pass isCrit to the slash effect
    const damageObj = {
        physical: dmg,
        fire: player.elementalDamage.fire,
        lightning: player.elementalDamage.lightning,
        poison: player.elementalDamage.poison,
        isCrit: isCrit
    };

    AudioSys.play('melee_swing');
    takeDamage(t, damageObj, false);
    createSlashEffect(player.x, player.y, t.x, t.y, dmg, isCrit);  // Skills disabled only in town (usable in Hell)
    triggerPhysicalSweep(t, dmg, isCrit, attackAngle);
    player.attackAnim = 1;
    triggerHeroAction('attack', 0.35);

    if (player.lifeSteal > 0) {
        let h = Math.ceil(dmg * player.lifeSteal / 100);
        if (h > 0) {
            player.hp = Math.min(player.maxHp, player.hp + h);
            createDamageNumber(player.x, player.y - 40, "+" + h, COLORS.green);
        }
    }
    player.attackCooldown = 0.8 / (1 + player.attackSpeed / 100);
}

function castSkill(skillName) {
    if (!SkillBranchSystem.canAttack()) return;
// Check whether an unlearned skill was chosen
    if (isInTown()) return;

// Shield skill level lives in skillTree; other skills live in skills
// Shield skill checks skillTree
    if (skillName === 'holy_shield') {
// Daily quests and achievements: use skills
        if (!player.skillTree || !player.skillTree.holy_shield || player.skillTree.holy_shield.stage1 <= 0) {
            showNotification('Skill not learned: Holy Shield');
            AudioSys.play('ui_error');
            return;
        }
    } else if (!player.skills[skillName] || player.skills[skillName] <= 0) {
        const typeNames = { fireball: 'Fireball', thunder: 'Lightning Strike', multishot: 'Multishot' };
        showNotification(`Skill not learned: ${typeNames[skillName] || skillName}`);
        AudioSys.play('ui_error');
        return;
    }

    if (SkillBranchSystem.cast(skillName)) return;

    if (skillName === 'fireball') {
        if (player.mp < 5) {
            createFloatingText(player.x, player.y - 40, 'Not enough mana! (Requires 5 mana)', '#4d94ff', 1.5);
            AudioSys.play('ui_error');
            if (cachedUI.mpOrb) GSAPAnims.shake(cachedUI.mpOrb, 5);
            return;
        }
        if (player.skillCooldowns.fireball > 0) return;
        player.mp -= 5; player.skillCooldowns.fireball = 0.5;
        const angle = Math.atan2(mouse.worldY - player.y, mouse.worldX - player.x);
        player.direction = directionFromDelta(Math.cos(angle), Math.sin(angle));
        triggerHeroAction('cast', 0.45);
        spawnCastSourceVfx(CAST_SOURCE_VFX.fireball, player.x, player.y, angle, 0.9, 16, 16);
        projectiles.push(ProjectilePool.acquire({
            x: player.x,
            y: player.y,
            angle,
            speed: 600,
            life: 0.5,
            damage: 10 * player.skills.fireball + player.ene,
            owner: player,
            type: 'fireball',
            color: '#ff4400',
            visualTier: getSkillVisualGrowthTier('fireball')
        }));
        AudioSys.play('fireball_cast');
        // Daily quests and achievements:useskill
        if (typeof DailyQuestSystem !== 'undefined') {
            DailyQuestSystem.updateProgress('use_skill', 1);
        }
        trackAchievement('skill_use');
    } else if (skillName === 'thunder') {
        const cost = 8 + (player.skills.thunder - 1) * 0.5;
        if (player.mp < cost) {
            createFloatingText(player.x, player.y - 60, "Not enough mana!", '#55aaff');
            AudioSys.play('ui_error');
            if (cachedUI.mpOrb) GSAPAnims.shake(cachedUI.mpOrb, 5);
            return;
        }
        if (player.skillCooldowns.thunder > 0) return;

// Check range (shrunk to 200 px)
        const target = getEnemyAtCursor() || getDestructibleAtCursor();
        if (!target) {
            return;
        }

        // Check range (shrunk to 200 px)
        if (Math.hypot(target.x - player.x, target.y - player.y) > 200) {
            createFloatingText(player.x, player.y - 60, "Target too far!", '#ff5555');
            AudioSys.play('ui_error');
            return;
        }

        player.mp -= cost;
        player.direction = directionFromDelta(target.x - player.x, target.y - player.y);
        triggerHeroAction('cast', 0.45);
        player.skillCooldowns.thunder = 2; // If a destructible was hit
        const thunderAngle = Math.atan2(target.y - player.y, target.x - player.x);
        spawnCastSourceVfx(CAST_SOURCE_VFX.thunder, player.x, player.y, thunderAngle, 0.92, 12, 14);
        AudioSys.play('thunder_cast');

// Damage calc: base damage + skill level bonus
        if (target.broken !== undefined) {
            DestructibleSystem.break(target);
            createLightningEffect(target.x, target.y);
            emitSkillImpactBurst('thunder', target.x, target.y, thunderAngle, 0.9);
            emitThunderVisualGrowth(target, [target], getSkillVisualGrowthTier('thunder'));
            AudioSys.play('thunder_impact');
            if (typeof DailyQuestSystem !== 'undefined') DailyQuestSystem.updateProgress('use_skill', 1);
            return;
        }

// Assume +15 base damage per level
// Energy (ene) bonus: +2% damage per point
        const baseDmg = 30 + (player.skills.thunder - 1) * 15;
// Deal lightning damage (main target)
        const dmg = Math.floor(baseDmg * (1 + player.ene * 0.02));

// Visuals: lightning (count grows by stage, preferring different enemies)
        takeDamage(target, { lightning: dmg }, true);
        emitSkillImpactBurst('thunder', target.x, target.y, Math.atan2(target.y - player.y, target.x - player.x), 1.08);
        AudioSys.play('thunder_impact');

// Stage 1: 1 bolt; stage 2: 2 bolts; stage 3: 4 bolts
// Find attackable enemies nearby (within 120px of the main target)
        const tree = player.skillTree?.thunder;
        let thunderCount = 1;
        if (tree?.stage3?.level > 0) {
            thunderCount = 4;
        } else if (tree?.stage2?.level > 0) {
            thunderCount = 2;
        }

// Release bolts one by one
        const nearbyTargets = [target];
        if (thunderCount > 1) {
            const searchRange = 120;
            for (let i = 0; i < enemies.length && nearbyTargets.length < thunderCount; i++) {
                const e = enemies[i];
                if (e.dead || e === target) continue;
                const dist = Math.hypot(e.x - target.x, e.y - target.y);
                if (dist <= searchRange) {
                    nearbyTargets.push(e);
                }
            }
        }

// Extra targets take 70% damage
        const extraDmgRatio = 0.7; // Not enough enemies: hit the main target
        for (let i = 0; i < thunderCount; i++) {
            const t = nearbyTargets[i] || target; // Deal damage to extra targets
            const delay = i * 40;
            setTimeout(() => {
                createLightningEffect(t.x, t.y);
// Daily quests and achievements: use skills
                if (i > 0 && t !== target) {
                    takeDamage(t, { lightning: Math.floor(dmg * extraDmgRatio) }, true);
                    emitSkillImpactBurst('thunder', t.x, t.y, Math.atan2(t.y - target.y, t.x - target.x), 0.76);
                }
            }, delay);
        }
        emitThunderVisualGrowth(target, nearbyTargets, getSkillVisualGrowthTier('thunder'));

        // Daily quests and achievements:useskill
        if (typeof DailyQuestSystem !== 'undefined') {
            DailyQuestSystem.updateProgress('use_skill', 1);
        }
        trackAchievement('skill_use');

// Lv1: no splash
        // Lv1: nosplash
        // Lv2: 1jump（40%damage）
        // Lv3: 1jump（50%damage）
        // Lv5: 2jump（50% → 25%）
        // Lv7: 2jump（50% → 25%），rangeincrease
        // Lv10: 3jump（60% → 30% → 15%）

        const skillLevel = player.skills.thunder;
        let chainCount = 0;  // Damage ratio per jump
        let chainDamageRatios = [];  // Splash search range
        let chainRange = 150;  // Lv7+ widens the range

        if (skillLevel >= 10) {
            chainCount = 3;
            chainDamageRatios = [0.60, 0.30, 0.15];
        } else if (skillLevel >= 7) {
            chainCount = 2;
            chainDamageRatios = [0.50, 0.25];
            chainRange = 200;  // Lv7+ rangeincrease
        } else if (skillLevel >= 5) {
            chainCount = 2;
            chainDamageRatios = [0.50, 0.25];
        } else if (skillLevel >= 3) {
            chainCount = 1;
            chainDamageRatios = [0.50];
        } else if (skillLevel >= 2) {
            chainCount = 1;
            chainDamageRatios = [0.40];
        }

// Record hit targets to prevent repeats
        if (chainCount > 0) {
            let currentTarget = target;
            const hitTargets = new Set([target]);  // Find the next target

            for (let i = 0; i < chainCount; i++) {
// No next target: stop the chain
                const nextTarget = findNearestEnemy(currentTarget.x, currentTarget.y, chainRange, hitTargets);

                if (!nextTarget) break;  // Compute chain damage

// Deal damage
                const chainDmg = Math.floor(dmg * chainDamageRatios[i]);

                // deal damage
                takeDamage(nextTarget, { lightning: chainDmg }, true);
                emitSkillImpactBurst('thunder', nextTarget.x, nextTarget.y, Math.atan2(nextTarget.y - currentTarget.y, nextTarget.x - currentTarget.x), 0.64);

// Record the hit
                createLightningChain(currentTarget.x, currentTarget.y, nextTarget.x, nextTarget.y);

// Update the current target
                hitTargets.add(nextTarget);

// Daily quests and achievements: use skills
                currentTarget = nextTarget;
            }
        }

    } else if (skillName === 'multishot') {
        if (player.mp < 8) {
            createFloatingText(player.x, player.y - 40, 'Not enough mana! (Requires 8 mana)', '#4d94ff', 1.5);
            AudioSys.play('ui_error');
            if (cachedUI.mpOrb) GSAPAnims.shake(cachedUI.mpOrb, 5);
            return;
        }
        if (player.skillCooldowns.multishot > 0) return;
        player.mp -= 8; player.skillCooldowns.multishot = 1;
        const base = Math.atan2(mouse.worldY - player.y, mouse.worldX - player.x);
        player.direction = directionFromDelta(Math.cos(base), Math.sin(base));
        triggerHeroAction('cast', 0.45);
        spawnCastSourceVfx(CAST_SOURCE_VFX.multishot, player.x, player.y, base, 0.92, 14, 14);
        // Daily quests and achievements:useskill
        if (typeof DailyQuestSystem !== 'undefined') {
            DailyQuestSystem.updateProgress('use_skill', 1);
        }
        trackAchievement('skill_use');
        const cnt = 2 + player.skills.multishot;

// type tag for trail particles
        for (let i = 0; i < cnt; i++) {
            const a = base - 0.3 + (0.6 / (cnt - 1)) * i;
            projectiles.push(ProjectilePool.acquire({
                x: player.x, y: player.y, angle: a, speed: 500, life: 1,
                damage: player.damage[0] * 0.8, color: '#aaff00', owner: player,
                type: 'multishot',  // type tag for trail particles
                visualTier: getSkillVisualGrowthTier('multishot')
            }));
        }
        AudioSys.play('multishot_cast');
    } else if (skillName === 'holy_shield') {
// Get the skill level
        if (player.shield.cooldown > 0) return;

        const manaCost = SKILL_TREE.holy_shield.stage1.manaCost;
        if (player.mp < manaCost) {
            createFloatingText(player.x, player.y - 40, 'Not enough mana! (Requires ' + manaCost + ' mana)', '#4d94ff', 1.5);
            AudioSys.play('ui_error');
            if (cachedUI.mpOrb) GSAPAnims.shake(cachedUI.mpOrb, 5);
            return;
        }

        // Getskilllevel
        let skillLevel = 0;
        if (player.skillTree && player.skillTree.holy_shield) {
            skillLevel = player.skillTree.holy_shield.stage1 || 0;
        }

        if (skillLevel <= 0) {
            showNotification('Skill not learned: Holy Shield');
            AudioSys.play('ui_error');
            return;
        }

        // castshield
        const config = SKILL_TREE.holy_shield.stage1;
        const shieldValue = Math.floor(player.maxHp * (config.shieldRatio + (skillLevel - 1) * config.shieldPerLevel));
        const duration = config.duration + (skillLevel - 1) * config.durationPerLevel;

        player.shield = {
            active: true,
            value: shieldValue,
            maxValue: shieldValue,
            timer: duration,
            cooldown: config.cooldown,
            type: player.skillTree.holy_shield.stage2.level > 0 ? player.skillTree.holy_shield.stage2.chosen : null,
            stage3: player.skillTree.holy_shield.stage3.level > 0 ? player.skillTree.holy_shield.stage3.chosen : null,
            invincibleTimer: 0
        };

        player.mp -= manaCost;
        triggerHeroAction('cast', 0.45);

// Daily quests and achievements
        AudioSys.play('shield');
        spawnVfxEffect('shieldPulseStatus', player.x, player.y + 4, 1, 0);
        createParticle(player.x, player.y, '#ffd700', 15);
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                createParticle(
                    player.x + (Math.random() - 0.5) * 40,
                    player.y + (Math.random() - 0.5) * 40,
                    '#ffd700',
                    8
                );
            }, i * 20);
        }

        // Daily quests and achievements
        if (typeof DailyQuestSystem !== 'undefined') {
            DailyQuestSystem.updateProgress('use_skill', 1);
        }
        trackAchievement('skill_use');
    }
}

// Apply shield absorption first
function applyDamageToPlayer(damage, attacker) {
    let actualDamage = damage;

// Shield absorption visuals
    if (player.shield.active && player.shield.value > 0) {
        const absorbed = Math.min(player.shield.value, damage);
        player.shield.value -= absorbed;
        actualDamage = damage - absorbed;

// Reflected damage (reflect shield)
        if (absorbed > 0) {
            createParticle(player.x, player.y, '#ffd700', 5);
        }

        // counter-shootdamage（counter-shootshield）
        if (player.shield.type === 'reflect' && attacker) {
            let level = 0;
            if (player.skillTree && player.skillTree.holy_shield && player.skillTree.holy_shield.stage2) {
                level = player.skillTree.holy_shield.stage2.level || 0;
            }
            if (level > 0) {
                const config = SKILL_TREE.holy_shield.stage2.reflect;
                const reflectRatio = config.effect.reflectRatio + (level - 1) * config.effect.reflectPerLevel;
                const reflectDamage = damage * reflectRatio * 0.5;

                if (attacker.hp) {
                    attacker.hp -= reflectDamage;
                    if (attacker.hp <= 0) {
// Absolute Defense heal-on-kill
                        player.kills++;
                        if (typeof OnlineSystem !== 'undefined' && OnlineSystem.recordWeeklyKill) OnlineSystem.recordWeeklyKill();
                        if (typeof DailyQuestSystem !== 'undefined') {
                            DailyQuestSystem.updateProgress('kill_monster', 1);
                        }
                        trackKill(enemy);

// Guardian Angel invulnerability
                        if (player.shield.stage3 === 'fortress') {
                            const lifesteal = reflectDamage * SKILL_TREE.holy_shield.stage3.reflect.fortress.effect.lifestealRatio;
                            player.hp = Math.min(player.maxHp, player.hp + lifesteal);
                        }
                    }
                    createDamageNumber(attacker.x, attacker.y - 20, '-' + Math.floor(reflectDamage), '#ffaa00');
                }
            }
        }
    }

// Check whether item requirements are met
    if (player.shield.invincibleTimer > 0) {
        actualDamage = 0;
    }

    return actualDamage;
}

function spawnBoss(x, y) { enemies.push(EnemyPool.acquire({ x, y, hp: 500, maxHp: 500, dmg: 20, speed: 100, isBoss: true, radius: 30, dead: false, cooldown: 0, xpValue: 5000, name: "The Butcher" })); }

// Add the glow class by rarity
function meetsRequirements(item) {
    if (!item || !item.requirements) return true;
    const req = item.requirements;
    if (req.level && player.lvl < req.level) return false;
    if (req.str && player.str < req.str) return false;
    if (req.dex && player.dex < req.dex) return false;
    return true;
}

const EQUIPMENT_SLOT_LABELS = {
    mainhand: 'Combat Weapon', body: 'Defense', ring: 'Magic Ring', helm: 'Helmet',
    gloves: 'Gloves', boots: 'Boots', belt: 'Belt', amulet: 'Mystic Amulet'
};

function renderInventory() {
    const c = document.getElementById('bag-grid'); c.innerHTML = '';
    player.inventory.forEach((i, idx) => {
        const s = document.createElement('div'); s.className = 'bag-slot';
        if (i) {
            // add glow by rarity class
            if (i.rarity >= 3 && i.rarity <= 4) s.classList.add('rarity-unique');
            else if (i.rarity === 5) s.classList.add('rarity-set');
            else if (i.rarity === 2) s.classList.add('rarity-rare');

// Rune system: render socket dot indicators on cells
            if (i.requirements && !meetsRequirements(i)) {
                s.classList.add('requirement-not-met');
            }

            applyItemSpriteToElement(s, i);
            s.style.display = 'flex'; s.style.justifyContent = 'center'; s.style.alignItems = 'center';
            if (i.quantity && i.quantity > 1) {
                s.innerHTML += `<span class="item-count">${i.quantity}</span>`;
            }
            if (i.enhanceLvl > 0) {
                s.innerHTML += `<span class="enhance-level">+${i.enhanceLvl}</span>`;
            }

// Socketing mode highlight
            if (i.sockets && i.sockets > 0) {
                const pipsDiv = document.createElement('div');
                pipsDiv.className = 'slot-sockets-bar';
                const filled = (i.socketedRunes || []).length;
                for (let k = 0; k < i.sockets; k++) {
                    const pip = document.createElement('span');
                    pip.className = 'socket-pip' + (k < filled ? ' filled' : '');
                    if (k < filled && typeof getRuneData === 'function') {
                        const rD = getRuneData(i.socketedRunes[k]);
                        if (rD && rD.color) pip.style.backgroundColor = rD.color;
                    }
                    pipsDiv.appendChild(pip);
                }
                s.appendChild(pipsDiv);
            }

// With the shop open: show the confirm button or handle selling
            const isSocketing = typeof isSocketingModeActive === 'function' && isSocketingModeActive();
            const activeRune = typeof getActiveSocketingRune === 'function' ? getActiveSocketingRune() : null;
            if (isSocketing) {
                if (i.type === 'rune' && activeRune && i.id === activeRune.id) {
                    s.classList.add('socket-source-rune');
                } else if (typeof canItemAcceptRune === 'function' && canItemAcceptRune(i, activeRune)) {
                    s.classList.add('socket-target-candidate');
                }
            }

// Pending confirmation: show the confirm button
            const shopPanel = document.getElementById('shop-panel');
            const isShopOpen = shopPanel && shopPanel.style.display === 'block';

            if (isShopOpen && pendingSellConfirmIdx === idx) {
// Clicking elsewhere on the cell cancels confirmation
                s.classList.add('sell-pending');
                const confirmBtn = document.createElement('div');
                confirmBtn.className = 'sell-confirm-btn';
                confirmBtn.textContent = 'Confirm';
                confirmBtn.onclick = (e) => {
                    e.stopPropagation();
                    sellItemFromInventory(idx);
                    pendingSellConfirmIdx = -1;
                    renderInventory();
                    renderEmbeddedBag('shop');
                };
                s.appendChild(confirmBtn);

// Rune socketing interaction mode
                s.onclick = (e) => {
                    e.stopPropagation();
                    pendingSellConfirmIdx = -1;
                    renderInventory();
                };
            } else {
                s.onclick = (e) => {
                    e.stopPropagation();

// Clicking a rune item enters socketing mode
                    if (typeof isSocketingModeActive === 'function' && isSocketingModeActive()) {
                        const activeRune = getActiveSocketingRune();
                        if (i.type === 'rune' && activeRune && i.id === activeRune.id) {
                            cancelSocketingMode();
                            return;
                        }
                        if (typeof canItemAcceptRune === 'function' && canItemAcceptRune(i, activeRune)) {
                            trySocketRuneIntoTarget(i, idx);
                            return;
                        }
                    }

// With the shop open, clicking sells the item
                    if (i.type === 'rune') {
                        if (typeof startSocketingMode === 'function') {
                            startSocketingMode(i, idx);
                            return;
                        }
                    }

// Set or enhanced gear requires a second confirmation
                    const shopPanel = document.getElementById('shop-panel');
                    const stashPanel = document.getElementById('stash-panel');
                    const blacksmithPanel = document.getElementById('blacksmith-panel');
                    if (shopPanel && shopPanel.style.display === 'block') {
// Clear the previous rarity class
                        if (needsSellConfirm(i)) {
                            pendingSellConfirmIdx = idx;
                            renderInventory();
                            return;
                        }
                        sellItemFromInventory(idx);
                        renderEmbeddedBag('shop');
                    } else if (stashPanel && stashPanel.style.display === 'block') {
                        moveItemToStash(idx);
                    } else if (blacksmithPanel && blacksmithPanel.style.display === 'block') {
                        moveItemToForge(idx);
                    } else {
                        useOrEquipItem(idx);
                    }
                };
            }
            s.oncontextmenu = (e) => { e.preventDefault(); e.stopPropagation(); dropItemFromInventory(idx); }
            bindItemTooltip(s, i);
            s.onmousedown = (e) => e.stopPropagation();
        }
        c.appendChild(s);
    });
    ['mainhand', 'body', 'ring'].forEach(sn => {
        const el = document.getElementById('slot-' + sn), i = player.equipment[sn];
        el.innerHTML = `<span class="equipment-slot-label">${EQUIPMENT_SLOT_LABELS[sn]}</span>`;
        el.setAttribute('aria-label', `${EQUIPMENT_SLOT_LABELS[sn]}: ${i ? i.name : 'Not Equipped'}`);
// Add the glow class by rarity
        el.classList.remove('rarity-unique', 'rarity-set', 'rarity-rare', 'socket-target-candidate');
        if (i) {
            // add glow by rarity class
            if (i.rarity >= 3 && i.rarity <= 4) el.classList.add('rarity-unique');
            else if (i.rarity === 5) el.classList.add('rarity-set');
            else if (i.rarity === 2) el.classList.add('rarity-rare');

            const ic = document.createElement('div');
            ic.style.width = '100%'; ic.style.height = '100%';
            applyItemSpriteToElement(ic, i);
            ic.style.border = 'none'; // Remove border for inner div as slot has border
            el.style.borderColor = getItemColor(i.rarity); // Set slot border instead
            el.appendChild(ic);
            if (i.enhanceLvl > 0) {
                el.innerHTML += `<span class="enhance-level">+${i.enhanceLvl}</span>`;
            }
            if (i.sockets && i.sockets > 0) {
                const pipsDiv = document.createElement('div');
                pipsDiv.className = 'slot-sockets-bar';
                const filled = (i.socketedRunes || []).length;
                for (let k = 0; k < i.sockets; k++) {
                    const pip = document.createElement('span');
                    pip.className = 'socket-pip' + (k < filled ? ' filled' : '');
                    if (k < filled && typeof getRuneData === 'function') {
                        const rD = getRuneData(i.socketedRunes[k]);
                        if (rD && rD.color) pip.style.backgroundColor = rD.color;
                    }
                    pipsDiv.appendChild(pip);
                }
                el.appendChild(pipsDiv);
            }
            if (typeof isSocketingModeActive === 'function' && isSocketingModeActive()) {
                const curRune = getActiveSocketingRune();
                if (typeof canItemAcceptRune === 'function' && canItemAcceptRune(i, curRune)) {
                    el.classList.add('socket-target-candidate');
                }
            }
            bindItemTooltip(el, i);
            el.onmousedown = (e) => e.stopPropagation();
        } else { el.onmouseenter = null; el.onmouseleave = null; el.ontouchstart = null; }
    });
    // Additional slots
    ['helm', 'gloves', 'boots', 'belt', 'amulet'].forEach(sn => {
        const el = document.getElementById('slot-' + sn);
        if (!el) return;
        const i = player.equipment[sn];
        el.innerHTML = `<span class="equipment-slot-label">${EQUIPMENT_SLOT_LABELS[sn]}</span>`;
        el.setAttribute('aria-label', `${EQUIPMENT_SLOT_LABELS[sn]}: ${i ? i.name : 'Not Equipped'}`);
// Add the glow class by rarity
        el.classList.remove('rarity-unique', 'rarity-set', 'rarity-rare', 'socket-target-candidate');
        if (i) {
            // add glow by rarity class
            if (i.rarity >= 3 && i.rarity <= 4) el.classList.add('rarity-unique');
            else if (i.rarity === 5) el.classList.add('rarity-set');
            else if (i.rarity === 2) el.classList.add('rarity-rare');

            const ic = document.createElement('div');
            ic.style.width = '100%'; ic.style.height = '100%';
            applyItemSpriteToElement(ic, i);
            ic.style.border = 'none';
            el.style.borderColor = getItemColor(i.rarity);
            el.appendChild(ic);
            if (i.enhanceLvl > 0) {
                el.innerHTML += `<span class="enhance-level">+${i.enhanceLvl}</span>`;
            }
            if (i.sockets && i.sockets > 0) {
                const pipsDiv = document.createElement('div');
                pipsDiv.className = 'slot-sockets-bar';
                const filled = (i.socketedRunes || []).length;
                for (let k = 0; k < i.sockets; k++) {
                    const pip = document.createElement('span');
                    pip.className = 'socket-pip' + (k < filled ? ' filled' : '');
                    if (k < filled && typeof getRuneData === 'function') {
                        const rD = getRuneData(i.socketedRunes[k]);
                        if (rD && rD.color) pip.style.backgroundColor = rD.color;
                    }
                    pipsDiv.appendChild(pip);
                }
                el.appendChild(pipsDiv);
            }
            if (typeof isSocketingModeActive === 'function' && isSocketingModeActive()) {
                const curRune = getActiveSocketingRune();
                if (typeof canItemAcceptRune === 'function' && canItemAcceptRune(i, curRune)) {
                    el.classList.add('socket-target-candidate');
                }
            }
            bindItemTooltip(el, i);
            el.onmousedown = (e) => e.stopPropagation();
        } else { el.onmouseenter = null; el.onmouseleave = null; el.ontouchstart = null; }
    });

    document.getElementById('gold-display').innerText = player.gold;
}

// Create the icon container

function updateBeltUI() {
    const countItem = (name) => {
        return player.inventory.filter(i => i && i.name === name).reduce((sum, i) => sum + (i.quantity || 1), 0);
    };
    const updateSlot = (slotId, name, type, heal) => {
        const el = document.getElementById(slotId);
        const count = countItem(name);
        const key = slotId.split('-')[1];

        el.innerHTML = `<span class="belt-key">${key}</span><span class="belt-count" id="count-${type}" style="${type === 'mana' ? 'color:#4d94ff' : ''}">${count}</span>`;

// below the text
        const iconDiv = document.createElement('div');
        iconDiv.style.width = '100%';
        iconDiv.style.height = '100%';
        iconDiv.style.position = 'absolute';
        iconDiv.style.top = '0';
        iconDiv.style.left = '0';
        iconDiv.style.zIndex = '0'; // below the text

        // Simulated item object for rendering
        const dummyItem = { type: 'potion', name: name };
        if (type === 'health') dummyItem.heal = true;
        if (type === 'mana') dummyItem.heal = false; // logic in getItemSpriteCoords cares if .heal is truthy
        if (type === 'scroll') dummyItem.type = 'scroll';

        applyItemSpriteToElement(iconDiv, dummyItem);

        // ifcountfor0，changegray
        if (count === 0) {
            iconDiv.style.filter = 'grayscale(100%) opacity(0.3)';
        }

        el.appendChild(iconDiv);
    };

    updateSlot('belt-1', 'Health Potion', 'health', true);
    updateSlot('belt-2', 'Mana Potion', 'mana', false);
    updateSlot('belt-3', 'Town Portal Scroll', 'scroll', false);
}

function gambleItem(type) {
    let cost = 500;
    if (type === 'ring') cost = 800; if (type === 'armor') cost = 400;
    if (player.gold >= cost) {
        player.gold -= cost;
        let rarity = 2;
        if (Math.random() < GAME_CONFIG.GAMBLE_RARE_RATE) rarity = 3; if (Math.random() < GAME_CONFIG.GAMBLE_UNIQUE_RATE) rarity = 4;

// Refund gold
        const typeMap = { weapon: 'weapon', armor: 'armor', helm: 'helm', gloves: 'gloves', boots: 'boots', belt: 'belt', ring: 'ring', amulet: 'amulet' };
        const candidates = BASE_ITEMS.filter(i => i.type === typeMap[type]);
        const baseName = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)].name : 'Short Sword';

        let item = createItem(baseName, player.lvl);
        item.rarity = rarity;
        if (rarity >= 2) {
            const p = AFFIXES.prefixes[Math.floor(Math.random() * AFFIXES.prefixes.length)];
            item.displayName = p.name + " " + item.name; item.stats[p.stat] = Math.floor(Math.random() * (p.max - p.min)) + p.min;
        }
        if (rarity >= 3) {
            const s = AFFIXES.suffixes[Math.floor(Math.random() * AFFIXES.suffixes.length)];
            item.displayName += s.name; item.stats[s.stat] = (item.stats[s.stat] || 0) + Math.floor(Math.random() * (s.max - s.min)) + s.min;
        }
        if (rarity === 4) { item.displayName = "Unique · " + item.name; item.stats = { allSkills: 1, dmgPct: 50, lifeSteal: 5 }; }

        if (!addItemToInventory(item)) {
            player.gold += cost; // returnyetgold
            createFloatingText(player.x, player.y - 40, "Inventory is full!", COLORS.warning, 1.5);
        } else {
            createDamageNumber(player.x, player.y - 40, `-${cost}G`, 'gold');
            showNotification(`Spent ${cost} G`);
            AudioSys.play('gold');
        }
    } else {
        showNotification("Not enough gold");
    }
}

// Double XP scroll: used directly, never enters the inventory
let buyHoldInterval = null;
let buyHoldTimeout = null;

function buyItem(type) {
    let cost = 0;
    let itemName = "";
    if (type === 'health') { cost = 50; itemName = CONSUMABLE_NAME.HEALTH_POTION; }
    else if (type === 'mana') { cost = 50; itemName = CONSUMABLE_NAME.MANA_POTION; }
    else if (type === 'scroll') { cost = 100; itemName = CONSUMABLE_NAME.TOWN_PORTAL; }
    else if (type === 'xp_scroll') {
// 1 hour
        cost = 1000;
        if (player.gold < cost) {
            showNotification("Not enough gold");
            return false;
        }
        player.gold -= cost;
        const duration = 1 * 60 * 60 * 1000; // 1smallhour
        const now = Date.now();
        if (player.xpBuffExpiry && now < player.xpBuffExpiry) {
// No buff: add one
            player.xpBuffExpiry += duration;
            showNotification('⚡ Double XP extended by 1 hour!');
        } else {
            // nobuff，adds
            player.xpBuffExpiry = now + duration;
            showNotification('⚡ Double XP activated for 1 hour');
        }
        createDamageNumber(player.x, player.y - 40, `-${cost}G`, 'gold');
        AudioSys.play('gold');
        updateBuffIndicators();
        renderInventory();
        renderEmbeddedBag('shop');
        return true;
    }

    if (player.gold >= cost) {
        const item = createItem(itemName, 0);
        if (addItemToInventory(item)) {
            player.gold -= cost;
            createDamageNumber(player.x, player.y - 40, `-${cost}G`, 'gold');
            showNotification(`Spent ${cost} G - Bought ${itemName}`);
            renderInventory();
            renderEmbeddedBag('shop');
            return true;  // Inventory full
        } else {
            createFloatingText(player.x, player.y - 40, "Inventory is full!", COLORS.warning, 1.5);
            return false;  // backpackfull
        }
    } else {
        showNotification("Not enough gold");
        return false;  // Start long-press buying
    }
}

// startlong presspurchase
function startBuyHold(type, event) {
    if (event) event.preventDefault();  // Buy one first
    buyItem(type);  // firstbuyone
// Stop if buying fails
    buyHoldTimeout = setTimeout(() => {
        buyHoldInterval = setInterval(() => {
            if (!buyItem(type)) {
                stopBuyHold();  // Buy one every 80ms
            }
        }, 80);  // per80msbuyone
    }, 300);
}

// stoplong presspurchase
function stopBuyHold() {
    if (buyHoldTimeout) {
        clearTimeout(buyHoldTimeout);
        buyHoldTimeout = null;
    }
    if (buyHoldInterval) {
        clearInterval(buyHoldInterval);
        buyHoldInterval = null;
    }
}

// Mouse events (desktop)
function initBuyButtons() {
    document.querySelectorAll('.buy-slot').forEach(slot => {
        const type = slot.dataset.type;
// Touch events (mobile)
        slot.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startBuyHold(type, e);
        });
        slot.addEventListener('mouseup', stopBuyHold);
        slot.addEventListener('mouseleave', stopBuyHold);

// Init after page load
        slot.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startBuyHold(type, e);
        }, { passive: false });
        slot.addEventListener('touchend', stopBuyHold);
        slot.addEventListener('touchcancel', stopBuyHold);
    });
}

// Check whether in town (dropping allowed in Hell)
document.addEventListener('DOMContentLoaded', initBuyButtons);

function unequipItem(s) {
    const i = player.equipment[s]; if (!i) return;
    if (addItemToInventory(i, { fromUnequip: true })) { player.equipment[s] = null; updateStats(); renderInventory(); updateStatsUI(); hideTooltip(); }
}

function dropItemFromInventory(idx) {
    const item = player.inventory[idx];
    if (!item) return;

// Copy the item and set its position
    if (isInTown()) {
        showNotification("Cannot drop items in the Rogue Encampment");
        return;
    }

// Remove the item from the inventory (handling stacks)
    const droppedItem = { ...item };
    droppedItem.x = player.x + Math.random() * 40 - 20;
    droppedItem.y = player.y + Math.random() * 40 - 20;
    droppedItem.dropTime = Date.now();

// Add to the ground
    if (item.stackable && item.quantity > 1) {
        item.quantity--;
    } else {
        player.inventory[idx] = null;
    }

    // addtoground
    groundItems.push(droppedItem);
    updateWorldLabels();
    renderInventory();
    updateBeltUI();
    showNotification(`Dropped ${item.displayName || item.name}`);
}

// Iterate all equipment slots
function calculateEquippedSets() {
    const sets = {};

// First count the set pieces currently worn
    Object.values(player.equipment).forEach(item => {
        if (item && item.setId) {
            sets[item.setId] = (sets[item.setId] || 0) + 1;
        }
    });

    player.equippedSets = sets;
    return sets;
}

function updateStats() {
// Sync the paperdoll body/outfit (no armadura = Npc-06.webp; set with 2+ pieces = set sprite)
    calculateEquippedSets();

    // sync Paperdoll bodybody/equipbind (there is no armadura = Npc-06.webp; set>=2piece = sprite del Set)
    if (typeof PaperdollSystem !== 'undefined') {
        PaperdollSystem.updateEquipmentBody(player.equipment.body);
    }

// Reset resistances and elemental damage
    const str = player.str, dex = player.dex, vit = player.vit, ene = player.ene;
    let baseDmg = 2, armor = 0, ls = 0, ias = 0;

// Init new stats
    player.resistances = { fire: 0, cold: 0, lightning: 0, poison: 0 };
    player.elementalDamage = { fire: 0, cold: 0, lightning: 0, poison: 0 };

    // Initnewstats
    let hpRegen = 0, mpRegen = 0, blockChance = 0, reflectDamage = 0;
    let damageReduction = 0, critDamage = 0, allRes = 0, bonusCritChance = 0;
    let dmgPct = 0;  // HP/MP granted directly by gear
    let bonusHp = 0, bonusMp = 0;  // Direct-effect stats (no longer reading str/dex/vit/ene)

    Object.values(player.equipment).forEach(i => {
        if (!i) return;
        if (i.stats) {
            // direct-effect stats（notre-readstr/dex/vit/ene）
            ls += (i.stats.lifeSteal || 0);
            ias += (i.stats.attackSpeed || 0);
            bonusHp += (i.stats.maxHp || 0);  // Direct MP bonus
            bonusMp += (i.stats.maxMp || 0);  // Resistances

            // resist
            player.resistances.fire += (i.stats.fireRes || 0);
            player.resistances.cold += (i.stats.coldRes || 0);
            player.resistances.lightning += (i.stats.lightningRes || 0);
            player.resistances.poison += (i.stats.poisonRes || 0);
            allRes += (i.stats.allRes || 0);

            // elemental damage
            player.elementalDamage.fire += (i.stats.fireDmg || 0);
            player.elementalDamage.lightning += (i.stats.lightningDmg || 0);
            player.elementalDamage.poison += (i.stats.poisonDmg || 0);

// Percentage damage
            hpRegen += (i.stats.hpRegen || 0);
            mpRegen += (i.stats.mpRegen || 0);
            blockChance += (i.stats.blockChance || 0);
            reflectDamage += (i.stats.reflectDamage || 0);
            damageReduction += (i.stats.damageReduction || 0);
            critDamage += (i.stats.critDamage || 0);
            dmgPct += (i.stats.dmgPct || 0);  // Crit rate bonus
            bonusCritChance += (i.stats.critChance || 0);  // crit ratebonus
        }
        if (i.minDmg) baseDmg = i.minDmg;
        if (i.def) armor += i.def;
// Rune and runeword stat calc
        if (i.stats) armor += (i.stats.def || 0);

// Apply all-resist
        if (typeof getSocketAndRunewordStats === 'function') {
            const socketStats = getSocketAndRunewordStats(i);
            ls += (socketStats.lifeSteal || 0);
            ias += (socketStats.attackSpeed || 0);
            bonusHp += (socketStats.maxHp || 0);
            bonusMp += (socketStats.maxMp || 0);
            player.resistances.fire += (socketStats.fireRes || 0);
            player.resistances.cold += (socketStats.coldRes || 0);
            player.resistances.lightning += (socketStats.lightningRes || 0);
            player.resistances.poison += (socketStats.poisonRes || 0);
            allRes += (socketStats.allRes || 0);
            player.elementalDamage.fire += (socketStats.fireDmg || 0);
            player.elementalDamage.lightning += (socketStats.lightningDmg || 0);
            player.elementalDamage.poison += (socketStats.poisonDmg || 0);
            hpRegen += (socketStats.hpRegen || 0);
            mpRegen += (socketStats.mpRegen || 0);
            blockChance += (socketStats.blockChance || 0);
            reflectDamage += (socketStats.reflectDamage || 0);
            damageReduction += (socketStats.damageReduction || 0);
            critDamage += (socketStats.critDamage || 0);
            dmgPct += (socketStats.dmgPct || 0);
            bonusCritChance += (socketStats.critChance || 0);
            if (socketStats.def) armor += socketStats.def;
            if (socketStats.minDmg) baseDmg += socketStats.minDmg;
            if (socketStats.allSkills) dmgPct += socketStats.allSkills * 15;
        }
    });

// Resistance cap 75%, floor -100%
    if (allRes > 0) {
        player.resistances.fire += allRes;
        player.resistances.cold += allRes;
        player.resistances.lightning += allRes;
        player.resistances.poison += allRes;
    }

    // resistcap75%，floor value-100%
    player.resistances.fire = Math.max(-100, Math.min(75, player.resistances.fire));
    player.resistances.cold = Math.max(-100, Math.min(75, player.resistances.cold));
    player.resistances.lightning = Math.max(-100, Math.min(75, player.resistances.lightning));
    player.resistances.poison = Math.max(-100, Math.min(75, player.resistances.poison));

// Count the set pieces currently worn
// Apply all active set bonuses
    const equippedSets = calculateEquippedSets();

// Disable the Abyss Conqueror set bonus during Abyss challenges (fair play)
    for (let setId in equippedSets) {
        const pieceCount = equippedSets[setId];
        const setData = SET_ITEMS[setId];

        if (!setData) continue;

        // Disable the Abyss Conqueror set bonus during Abyss challenges (fair play)
        if (setId === 'abyss_conqueror' && typeof AbyssSystem !== 'undefined' && AbyssSystem.isActive) {
            continue;
        }

// Apply set bonus direct effects (no longer using str/dex/vit/ene)
        for (let requiredPieces in setData.bonuses) {
            if (pieceCount >= parseInt(requiredPieces)) {
                const bonusStats = setData.bonuses[requiredPieces].stats;

// Resistance bonus
                ls += (bonusStats.lifeSteal || 0);
                ias += (bonusStats.attackSpeed || 0);
                armor += (bonusStats.def || 0);
                bonusHp += (bonusStats.maxHp || 0);
                bonusMp += (bonusStats.maxMp || 0);

                // resistbonus
                if (bonusStats.allRes) {
                    player.resistances.fire += bonusStats.allRes;
                    player.resistances.cold += bonusStats.allRes;
                    player.resistances.lightning += bonusStats.allRes;
                    player.resistances.poison += bonusStats.allRes;
                }

                // elemental damagebonus
                player.elementalDamage.fire += (bonusStats.fireDmg || 0);
                player.elementalDamage.lightning += (bonusStats.lightningDmg || 0);
                player.elementalDamage.poison += (bonusStats.poisonDmg || 0);

// Percentage damage bonus
                hpRegen += (bonusStats.hpRegen || 0);
                mpRegen += (bonusStats.mpRegen || 0);
                blockChance += (bonusStats.blockChance || 0);
                reflectDamage += (bonusStats.reflectDamage || 0);
                damageReduction += (bonusStats.damageReduction || 0);
                critDamage += (bonusStats.critDamage || 0);
                bonusCritChance += (bonusStats.critChance || 0);
                dmgPct += (bonusStats.dmgPct || 0);  // Re-apply stat caps (set bonuses may have changed resistances)
            }
        }
    }

// Recompute final stats (including set bonuses)
    player.resistances.fire = Math.max(-100, Math.min(75, player.resistances.fire));
    player.resistances.cold = Math.max(-100, Math.min(75, player.resistances.cold));
    player.resistances.lightning = Math.max(-100, Math.min(75, player.resistances.lightning));
    player.resistances.poison = Math.max(-100, Math.min(75, player.resistances.poison));

// Includes percentage bonuses from gear and sets
    const finalDmgMultiplier = 1 + dmgPct / 100;  // Base + gear/set bonuses
    // Attribute curve: GAME_CONFIG.ATTRIBUTE_CURVE is the single source of truth,
    // and tools/test-attribute-curve.js locks every coefficient used here.
    const CURVE = GAME_CONFIG.ATTRIBUTE_CURVE;
    // Concave power curve: diminishing returns, no ceiling. Replaces the old
    // (str / 5) * (1 + str * 0.05), whose multiplier compounded.
    const strDamage = CURVE.STR_DAMAGE_SCALE * Math.pow(str, CURVE.STR_DAMAGE_EXP);
    // Crit chance caps at dex 190, so the points past it used to do nothing.
    // Only the overflow converts, and only into crit damage, so every build at
    // or under the cap keeps the exact stats it had before.
    const dexAtCritCap = (CURVE.CRIT_CAP - CURVE.CRIT_BASE) / CURVE.DEX_CRIT_PER_POINT;
    critDamage += Math.min(CURVE.DEX_CRIT_DAMAGE_CAP,
        Math.max(0, dex - dexAtCritCap) * CURVE.DEX_CRIT_DAMAGE_PER_POINT);
    player.damage = [
        Math.floor((baseDmg + strDamage) * finalDmgMultiplier),
        Math.floor((baseDmg + 3 + strDamage) * finalDmgMultiplier)
    ];
    player.maxHp = vit * CURVE.VIT_HP_PER_POINT + bonusHp;  // base + gear/setbonus
    player.maxMp = ene * CURVE.ENE_MP_PER_POINT + bonusMp;  // base + gear/setbonus
    player.armor = armor + dex * CURVE.DEX_ARMOR_PER_POINT;
    player.lifeSteal = ls;
    player.attackSpeed = ias;
    player.critChance = Math.min(CURVE.CRIT_CAP, CURVE.CRIT_BASE + dex * CURVE.DEX_CRIT_PER_POINT + bonusCritChance);

// Update special stats
    const talentSpeedPct = typeof getTalentEffect !== 'undefined' ? getTalentEffect('speedPct', 0) : 0;
    player.speed = 180 * (1 + talentSpeedPct / 100);

    // Updatespecial traits
    player.hpRegen = hpRegen;
    player.mpRegen = mpRegen;
    player.blockChance = blockChance;
    player.reflectDamage = reflectDamage;
    player.damageReduction = damageReduction;
    player.critDamage = critDamage;

// Vampire talent: +8% life leech
    // Vampire talent: +8% life leech
    player.lifeSteal += getTalentEffect('lifeSteal', 0);
// Iron Wall talent: +80 defense
    player.critChance = Math.min(100, player.critChance + getTalentEffect('critChance', 0));
    player.critDamage += getTalentEffect('critDamage', 0);
// Elemental Shield talent: +25% all resistances
    player.armor += getTalentEffect('def', 0);
// Mana Surge talent: +50 max mana
    const talentAllRes = getTalentEffect('allRes', 0);
    if (talentAllRes > 0) {
        player.resistances.fire += talentAllRes;
        player.resistances.cold += talentAllRes;
        player.resistances.lightning += talentAllRes;
        player.resistances.poison += talentAllRes;
    }
// Glass Cannon talent: max HP -30%
    player.maxMp += getTalentEffect('maxMp', 0);
    // Glass Cannon talent: max HP -30%
    const maxHpPct = getTalentEffect('maxHpPct', 0);
    if (maxHpPct !== 0) {
        player.maxHp = Math.floor(player.maxHp * (1 + maxHpPct / 100));
    }

// Elemental damage
    player.damage[0] = Math.floor(player.damage[0] * (1 + getDivineBlessingEffect('dmgPct', 0) / 100));
    player.damage[1] = Math.floor(player.damage[1] * (1 + getDivineBlessingEffect('dmgPct', 0) / 100));
    player.lifeSteal += getDivineBlessingEffect('lifeSteal', 0);
    player.critChance = Math.min(100, player.critChance + getDivineBlessingEffect('critChance', 0));
    player.critDamage += getDivineBlessingEffect('critDamage', 0);
    player.armor += getDivineBlessingEffect('def', 0);
    player.maxMp += getDivineBlessingEffect('maxMp', 0);
    // elemental damage
    player.elementalDamage.fire += getDivineBlessingEffect('fireDmgPct', 0);
    player.elementalDamage.poison += getDivineBlessingEffect('poisonDmgPct', 0);
    // allwithstand
    const dbAllRes = getDivineBlessingEffect('allRes', 0);
    if (dbAllRes > 0) {
        player.resistances.fire += dbAllRes;
        player.resistances.cold += dbAllRes;
        player.resistances.lightning += dbAllRes;
        player.resistances.poison += dbAllRes;
    }
// Mana regen (percentage) - consistent with talents
    player.hpRegenPct = getDivineBlessingEffect('hpRegenPct', 0);
// thorns reflect
    player.mpRegenPct = getDivineBlessingEffect('mpRegenPct', 0);
    // thornscounter-wound
    player.thornsPct = getDivineBlessingEffect('thornsPct', 0);
    // golddrop
    player.goldPct = getDivineBlessingEffect('goldPct', 0);
    // geardroprate
    player.dropRatePct = getDivineBlessingEffect('dropRatePct', 0);
// Check set achievements
    player.onKillHealPct = getDivineBlessingEffect('onKillHealPct', 0);

// ========== Abyss covenant penalties ==========
    checkSetAchievements();

// Clamp HP and mana to their caps
    const isContractPanelOpen = document.getElementById('abyss-contract-panel')?.classList.contains('active');
    if (typeof AbyssSystem !== 'undefined' && (AbyssSystem.isActive || isContractPanelOpen) && AbyssSystem.selectedContracts.length > 0) {
        AbyssSystem.selectedContracts.forEach(id => {
            switch (id) {
                case 'low_hp': player.maxHp = Math.floor(player.maxHp * 0.7); break;
                case 'glass_cannon': player.armor = Math.floor(player.armor * 0.5); break;
                case 'slow_motion': player.speed *= 0.8; break;
                case 'elemental_curse':
                    player.resistances.fire -= 40;
                    player.resistances.cold -= 40;
                    player.resistances.lightning -= 40;
                    player.resistances.poison -= 40;
                    break;
                case 'vampire_bane': player.lifeSteal = 0; break;
            }
        });
// Clamp the resistance floor
        player.hp = Math.min(player.hp, player.maxHp);
        player.mp = Math.min(player.mp, player.maxMp);
// Update the abyss HUD
        player.resistances.fire = Math.max(-100, player.resistances.fire);
        player.resistances.cold = Math.max(-100, player.resistances.cold);
        player.resistances.lightning = Math.max(-100, player.resistances.lightning);
        player.resistances.poison = Math.max(-100, player.resistances.poison);
    }
}

function updateUI() {
    // UpdateabyssHUD
    if (typeof AbyssSystem !== 'undefined') {
        AbyssSystem.updateHUD();
    }

// Update the buff indicators (appended to the talent HUD area)
    uiDisplayState.dirty = true;
}

// detects whether the buff state changed
let lastBuffState = ''; // detects whether the buff state changed
function updateBuffIndicators() {
    if (!cachedUI.talentHud) return;

    const now = Date.now();

// Rebuild icons only when the buff state changes
    const currentState = [
        player.xpBuffTripleExpiry > now ? 'triple' : '',
        player.xpBuffExpiry > now ? 'xp' : '',
        player.goldBuffExpiry > now ? 'gold' : '',
        player.dropBuffExpiry > now ? 'drop' : ''
    ].join(',');

// Fetch fresh time data again for the text update
    const existingIcons = cachedUI.talentHud.getElementsByClassName('buff-hud-icon');
    if (existingIcons.length > 0 && currentState === lastBuffState) {
        const timeSpans = cachedUI.talentHud.getElementsByClassName('buff-time-text');
        let spanIdx = 0;

// Remove previous buff icons
        const updatedBuffs = [];
        if (player.xpBuffTripleExpiry && now < player.xpBuffTripleExpiry) {
            updatedBuffs.push(formatBuffTime(Math.ceil((player.xpBuffTripleExpiry - now) / 1000 / 60)).short);
        } else if (player.xpBuffExpiry && now < player.xpBuffExpiry) {
            updatedBuffs.push(formatBuffTime(Math.ceil((player.xpBuffExpiry - now) / 1000 / 60)).short);
        }
        if (player.goldBuffExpiry && now < player.goldBuffExpiry) {
            updatedBuffs.push(formatBuffTime(Math.ceil((player.goldBuffExpiry - now) / 1000 / 60)).short);
        }
        if (player.dropBuffExpiry && now < player.dropBuffExpiry) {
            updatedBuffs.push(formatBuffTime(Math.ceil((player.dropBuffExpiry - now) / 1000 / 60)).short);
        }

        updatedBuffs.forEach((timeStr, i) => {
            if (timeSpans[i]) timeSpans[i].textContent = timeStr;
        });
        return;
    }
    lastBuffState = currentState;

// Check each buff
    Array.from(existingIcons).forEach(el => el.remove());

    const buffs = [];

    // Checkeachkind ofbuff
    if (player.xpBuffTripleExpiry && now < player.xpBuffTripleExpiry) {
        const remaining = Math.ceil((player.xpBuffTripleExpiry - now) / 1000 / 60);
        const time = formatBuffTime(remaining);
        buffs.push({ icon: '🔥', name: 'Triple XP', timeShort: time.short, timeFull: time.full, color: '#ff6600' });
    } else if (player.xpBuffExpiry && now < player.xpBuffExpiry) {
        const remaining = Math.ceil((player.xpBuffExpiry - now) / 1000 / 60);
        const time = formatBuffTime(remaining);
        buffs.push({ icon: '⚡', name: 'Double XP', timeShort: time.short, timeFull: time.full, color: '#ffff00' });
    }

    if (player.goldBuffExpiry && now < player.goldBuffExpiry) {
        const remaining = Math.ceil((player.goldBuffExpiry - now) / 1000 / 60);
        const time = formatBuffTime(remaining);
        buffs.push({ icon: '💰', name: 'Double Gold', timeShort: time.short, timeFull: time.full, color: '#ffd700' });
    }

    if (player.dropBuffExpiry && now < player.dropBuffExpiry) {
        const remaining = Math.ceil((player.dropBuffExpiry - now) / 1000 / 60);
        const time = formatBuffTime(remaining);
        buffs.push({ icon: '🎁', name: 'Double Drops', timeShort: time.short, timeFull: time.full, color: '#88ff88' });
    }

// Hover shows details
    buffs.forEach(b => {
        const icon = document.createElement('div');
        icon.className = 'buff-hud-icon';
        icon.style.cssText = `
            box-sizing: border-box;
            width: 32px;
            height: 32px;
            background: rgba(20, 20, 25, 0.9);
            border: 2px solid ${b.color};
            border-radius: 5px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            cursor: default;
            position: relative;
        `;
        icon.innerHTML = `${b.icon}<span class="buff-time-text" style="font-size:7px; color:${b.color}; position:absolute; bottom:0px; white-space:nowrap;">${b.timeShort}</span>`;

// Stop click-through to the game canvas
        icon.addEventListener('mouseenter', (e) => {
            if (cachedUI.tooltip) {
                cachedUI.tooltip.innerHTML = `<div style="color:${b.color}; font-weight:bold; margin-bottom:4px;">${b.icon} ${b.name}</div>
                    <div style="color:#aaa;">Time left: ${b.timeFull}</div>`;
                cachedUI.tooltip.style.display = 'block';
                cachedUI.tooltip.style.left = (e.clientX + 10) + 'px';
                cachedUI.tooltip.style.top = (e.clientY + 10) + 'px';
            }
        });
        icon.addEventListener('mouseleave', () => {
            if (cachedUI.tooltip) cachedUI.tooltip.style.display = 'none';
        });
        icon.addEventListener('mousemove', (e) => {
            if (cachedUI.tooltip) {
                cachedUI.tooltip.style.left = (e.clientX + 10) + 'px';
                cachedUI.tooltip.style.top = (e.clientY + 10) + 'px';
            }
        });
// Format buff time remaining (short for icons, long for tooltips)
        icon.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });

        cachedUI.talentHud.appendChild(icon);
    });
}

// Short format (icon display)
function formatBuffTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

// Long format (tooltip display)
    let short;
    if (hours > 0) {
        short = mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
    } else {
        short = `${mins}m`;
    }

// Skill max cooldown
    let full;
    if (hours > 0) {
        full = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    } else {
        full = `${mins}m`;
    }

    return { short, full };
}

// Shield cooldown
const SKILL_MAX_CD = {
    fireball: 0.5,
    thunder: 2,
    multishot: 1,
    holy_shield: 12  // Update skill cooldown UI (fan-shaped mask)
};

// Update skill cooldown UI (fan-shaped mask)
function updateSkillCooldownUI() {
    const skills = ['fireball', 'thunder', 'multishot'];

    skills.forEach(skill => {
        const cd = player.skillCooldowns[skill];
        const maxCd = SKILL_MAX_CD[skill];
        const sweepEl = cachedUI.cdSweeps[skill];
        const timeEl = cachedUI.cdTimes[skill];

        if (!sweepEl || !timeEl) return;

        if (cd > 0) {
// Shield skill special handling (cooldown stored in player.shield.cooldown)
            const progress = (cd / maxCd) * 100;
            sweepEl.style.setProperty('--cd-progress', `${progress}%`);
            sweepEl.classList.add('active');
            timeEl.classList.add('active');
            timeEl.textContent = cd.toFixed(1);
        } else {
            sweepEl.classList.remove('active');
            timeEl.classList.remove('active');
            timeEl.textContent = '';
        }
    });

// Skill button click effect
    const shieldSweep = cachedUI.cdSweeps['holy_shield'];
    const shieldTime = cachedUI.cdTimes['holy_shield'];
    if (shieldSweep && shieldTime) {
        const cd = player.shield?.cooldown || 0;
        const maxCd = SKILL_MAX_CD.holy_shield;

        if (cd > 0) {
            const progress = (cd / maxCd) * 100;
            shieldSweep.style.setProperty('--cd-progress', `${progress}%`);
            shieldSweep.classList.add('active');
            shieldTime.classList.add('active');
            shieldTime.textContent = cd.toFixed(1);
        } else {
            shieldSweep.classList.remove('active');
            shieldTime.classList.remove('active');
            shieldTime.textContent = '';
        }
    }
}

// Update the title display
function triggerSkillClick(btn) {
    btn.classList.add('clicked');
    setTimeout(() => btn.classList.remove('clicked'), 300);
}

function updateStatsUI() {
    document.getElementById('stat-lvl').innerText = player.lvl; document.getElementById('stat-xp').innerText = `${Math.floor(player.xp)}/${Math.floor(player.xpNext)}`;
    document.getElementById('stat-points').innerText = player.points;

// Update the resistance display
    const titleEl = document.getElementById('stat-title');
    if (titleEl && player.currentTitle && player.currentTitle !== 'none') {
        const titleData = TITLES.find(t => t.id === player.currentTitle);
        if (titleData) {
            titleEl.innerHTML = `<span style="${getTitleStyle(titleData)}">「${titleData.name}」</span>`;
        } else {
            titleEl.innerHTML = '';
        }
    } else if (titleEl) {
        titleEl.innerHTML = '';
    }
    document.getElementById('stat-str').innerText = player.str; document.getElementById('stat-dex').innerText = player.dex;
    document.getElementById('stat-vit').innerText = player.vit; document.getElementById('stat-ene').innerText = player.ene;

    document.getElementById('stat-hp-val').innerText = Math.floor(player.maxHp);
    document.getElementById('stat-mp-val').innerText = Math.floor(player.maxMp);

    document.getElementById('stat-dmg').innerText = `${player.damage[0]}-${player.damage[1]}`;
    document.getElementById('stat-def').innerText = player.armor;
    document.getElementById('stat-crit').innerText = player.critChance.toFixed(1) + '%';
    document.getElementById('stat-ias').innerText = player.attackSpeed + '%'; document.getElementById('stat-ll').innerText = player.lifeSteal + '%';

// Update the skill point display
    const getResColor = (value) => value >= 0 ? (value >= 75 ? '#00ff00' : '#ffff00') : '#ff0000';
    document.getElementById('stat-fire-res').innerText = Math.floor(player.resistances.fire) + '%';
    document.getElementById('stat-fire-res').style.color = getResColor(player.resistances.fire);
    document.getElementById('stat-cold-res').innerText = Math.floor(player.resistances.cold) + '%';
    document.getElementById('stat-cold-res').style.color = getResColor(player.resistances.cold);
    document.getElementById('stat-lightning-res').innerText = Math.floor(player.resistances.lightning) + '%';
    document.getElementById('stat-lightning-res').style.color = getResColor(player.resistances.lightning);
    document.getElementById('stat-poison-res').innerText = Math.floor(player.resistances.poison) + '%';
    document.getElementById('stat-poison-res').style.color = getResColor(player.resistances.poison);
}

function updateSkillsUI() {
// Sync the skill tree into skills (compat)
    const skillPointsEl = document.getElementById('skill-points');
    if (skillPointsEl) skillPointsEl.innerText = player.skillPoints;

    // syncskill treeto skills（ensurecompat）
    syncSkillsFromTree();

// Render the skill tree panel
    const barFireball = document.getElementById('bar-lvl-fireball');
    const barThunder = document.getElementById('bar-lvl-thunder');
    const barMultishot = document.getElementById('bar-lvl-multishot');
    const barHolyShield = document.getElementById('bar-lvl-holy_shield');
    if (barFireball) barFireball.innerText = player.skills.fireball;
    if (barThunder) barThunder.innerText = player.skills.thunder;
    if (barMultishot) barMultishot.innerText = player.skills.multishot;
    if (barHolyShield) {
        const shieldLevel = (player.skillTree && player.skillTree.holy_shield) ? player.skillTree.holy_shield.stage1 || 0 : 0;
        barHolyShield.innerText = shieldLevel;
    }

    // Renderskill treepanel
    renderSkillTree();

// Unlearned skill
    const skills = ['fireball', 'thunder', 'multishot', 'holy_shield'];
    skills.forEach(skill => {
        const skillBtn = document.getElementById(`skill-${skill}`);
        if (skillBtn) {
            let isUnlocked = false;
            if (skill === 'holy_shield') {
                isUnlocked = player.skillTree && player.skillTree.holy_shield && player.skillTree.holy_shield.stage1 > 0;
            } else {
                isUnlocked = player.skills[skill] > 0;
            }

            if (!isUnlocked) {
// Learned skill
                skillBtn.classList.add('disabled');
                skillBtn.title = typeof I18N !== 'undefined'
                    ? I18N.t('tooltip_skill_learn')
                    : 'Learn this skill via the "Skills" menu';
            } else {
// Update the personal best level
                skillBtn.classList.remove('disabled');
                skillBtn.title = '';
            }
        }
    });
}

function checkLevelUp() {
    while (player.xp >= player.xpNext) {
        player.lvl++;

// Achievement tracking: level reached
        if (player.lvl > player.personalBest.maxLevel) {
            player.personalBest.maxLevel = player.lvl;
        }

// Server announce: level milestones (10/20/30...)
        trackAchievement('reach_level', { level: player.lvl });

// Trigger the fancy level-up VFX
        if (player.lvl % 10 === 0 && typeof OnlineSystem !== 'undefined') {
            OnlineSystem.announce('level_milestone', String(player.lvl));
        }

        player.xp -= player.xpNext;
        player.xpNext = Math.floor(player.xpNext * 1.38);
        player.points += 5;
        player.skillPoints += 1;
        player.maxHp += 10;
        player.maxMp += 5;
        player.hp = player.maxHp;
        player.mp = player.maxMp;

// ========== Divine Blessing trigger check ==========
        triggerLevelUpEffect(player.lvl);

// Submit to the leaderboard
        if (player.lvl % 5 === 0 && player.lvl > player.lastBlessingLevel && player.lvl <= 100) {
            player.lastBlessingLevel = player.lvl;
            if (player.divineBlessing.pending < 3) {
                player.divineBlessing.pending++;
                createDamageNumber(player.x, player.y - 100, "Gained a Divine Blessing!", '#ffd700');
                updateDivineBlessingHUD();
            } else {
                createDamageNumber(player.x, player.y - 100, "Blessing slots full, claim one first", '#ff8800');
            }
        }

// togglePanel moved to ui-panels.js
        if (typeof OnlineSystem !== 'undefined') {
            OnlineSystem.submitScore({
                level: player.lvl,
                kills: player.kills,
                maxFloor: player.isInHell ? (player.maxHellFloor || player.hellFloor) + 10 : player.maxFloor,
                isHell: player.isInHell,
                gold: player.gold || 0
            });
        }
    }
    updateStatsUI(); updateSkillsUI(); updateMenuIndicators();
    SaveSystem.save();
}

// Check whether the skill is learned
function selectSkill(k) {
// Shield skill is checked in skillTree
    if (k === 'holy_shield') {
// stat point SFX
        if (!player.skillTree || !player.skillTree.holy_shield || player.skillTree.holy_shield.stage1 <= 0) {
            showNotification(`Skill not learned! Open the skill panel to upgrade`);
            return;
        }
    } else if (player.skills[k] === 0) {
        showNotification(`Skill not learned! Open the skill panel to upgrade`);
        return;
    }
    player.activeSkill = k;
    updateUI();
}

function addStat(t) {
    if (player.points > 0) {
        player[t]++;
        player.points--;
        AudioSys.play('click');  // stat point SFX
        updateStats();
        updateStatsUI();
        updateMenuIndicators();
    }
}
function upgradeSkill(t) {
    if (player.skillPoints > 0) {
        player.skills[t]++;
        player.skillPoints--;
        AudioSys.play('click');  // stat point SFX
        updateSkillsUI();
        updateMenuIndicators();
    }
}

// ========== skill treesystem ==========

// Switch the skill tab
let currentSkillTab = 'fireball';

// Update tab styles
function switchSkillTab(skillId) {
    currentSkillTab = skillId;

// Re-render
    document.querySelectorAll('.skill-tree-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.skill === skillId);
    });

// Render the skill tree panel
    renderSkillTree();
}

// Renderskill treepanel
function renderSkillTree() {
    const container = document.getElementById('skill-tree-content');
    if (!container) return;

    let html = '';
    const skillId = currentSkillTab;
    const skillIcons = { fireball: '🔥', thunder: '⚡', multishot: '🏹' };
    const config = SKILL_TREE[skillId];
    const tree = (player && player.skillTree) ? player.skillTree[skillId] : null;
    if (!config || !tree) {
        container.innerHTML = '';
        return;
    }

    html += `<div class="skill-tree-branch" data-skill="${skillId}">`;

    // phase1:baseskill
    const s1Level = tree.stage1;
    const s1Maxed = s1Level >= SKILL_TREE_MAX_LEVEL;
    const s1Class = s1Maxed ? 'maxed' : (s1Level > 0 ? 'active' : '');

    html += `<div class="skill-tree-stage stage-1">`;
    html += renderSkillNode({
        skillId,
        stage: 1,
        nodeId: skillId,
        name: config.name,
        desc: config.desc,
        level: s1Level,
        maxLevel: SKILL_TREE_MAX_LEVEL,
        nodeClass: s1Class,
        canUpgrade: player.skillPoints > 0 && !s1Maxed,
        spriteClass: `skill-${skillId}`
    });
    html += `</div>`;

// Stage 2: fork choice
    const s2Unlocked = s1Maxed;
    html += `<div class="skill-tree-connector fork ${s2Unlocked ? 'active' : ''}">`;
    html += `<div class="line-left"></div><div class="line-right"></div>`;
    html += `</div>`;

    // phase2:forkselection
    html += `<div class="skill-tree-stage stage-fork">`;
    const s2Options = Object.keys(config.stage2);
    for (const optId of s2Options) {
        const opt = config.stage2[optId];
        const isChosen = tree.stage2.chosen === optId;
        const otherChosen = tree.stage2.chosen && tree.stage2.chosen !== optId;
        const s2Level = isChosen ? tree.stage2.level : 0;
        const s2Maxed = s2Level >= SKILL_TREE_MAX_LEVEL;

        let nodeClass = '';
        if (!s2Unlocked) {
            nodeClass = 'locked';
        } else if (otherChosen) {
            nodeClass = 'other-locked';
        } else if (s2Maxed) {
            nodeClass = 'maxed';
        } else if (isChosen) {
            nodeClass = 'active';
        } else {
            nodeClass = 'selectable';
        }

        const canUpgrade = s2Unlocked && isChosen && player.skillPoints > 0 && !s2Maxed;
        const canSelect = s2Unlocked && !tree.stage2.chosen;

        html += renderSkillNode({
            skillId,
            stage: 2,
            nodeId: optId,
            name: opt.name,
            desc: opt.desc,
            level: s2Level,
            maxLevel: SKILL_TREE_MAX_LEVEL,
            nodeClass,
            canUpgrade,
            canSelect,
            spriteClass: `skill-${skillId}`,
            parent: skillId,
            locked: !s2Unlocked,
            otherLocked: otherChosen
        });
    }
    html += `</div>`;

// Stage 3: ultimate fork
    const s2Choice = tree.stage2.chosen;
    const s3Unlocked = s2Choice && tree.stage2.level >= SKILL_TREE_MAX_LEVEL;
    const s2LeftChosen = s2Options[0] === s2Choice;
    const connectorClass = s3Unlocked ? 'active' : (s2Choice ? (s2LeftChosen ? 'active-left' : 'active-right') : '');
    html += `<div class="skill-tree-connector fork ${connectorClass}">`;
    html += `<div class="line-left"></div><div class="line-right"></div>`;
    html += `</div>`;

// Each route's endpoint is shown up front, so mechanics can be compared before choosing.
    html += `<div class="skill-tree-stage stage-fork">`;
    if (s2Choice && config.stage3[s2Choice]) {
        const s3Options = Object.keys(config.stage3[s2Choice]);
        for (const optId of s3Options) {
            const opt = config.stage3[s2Choice][optId];
            const isChosen = tree.stage3.chosen === optId;
            const otherChosen = tree.stage3.chosen && tree.stage3.chosen !== optId;
            const s3Level = isChosen ? tree.stage3.level : 0;
            const s3Maxed = s3Level >= SKILL_TREE_MAX_LEVEL;

            let nodeClass = '';
            if (!s3Unlocked) {
                nodeClass = 'locked';
            } else if (otherChosen) {
                nodeClass = 'other-locked';
            } else if (s3Maxed) {
                nodeClass = 'maxed';
            } else if (isChosen) {
                nodeClass = 'active';
            } else {
                nodeClass = 'selectable';
            }

            const canUpgrade = s3Unlocked && isChosen && player.skillPoints > 0 && !s3Maxed;
            const canSelect = s3Unlocked && !tree.stage3.chosen;

            html += renderSkillNode({
                skillId,
                stage: 3,
                nodeId: optId,
                name: opt.name,
                desc: opt.desc,
                level: s3Level,
                maxLevel: SKILL_TREE_MAX_LEVEL,
                nodeClass,
                canUpgrade,
                canSelect,
                spriteClass: `skill-${skillId}`,
                parent: skillId,
                locked: !s3Unlocked,
                otherLocked: otherChosen
            });
        }
    } else {
        // Each route's endpoint is shown up front, so mechanics can be compared before choosing.anism。
        for (const [branchId, options] of Object.entries(config.stage3)) {
            html += `<div class="skill-route-preview">`;
            html += `<div class="skill-node-name">${config.stage2[branchId].name} Path</div>`;
            for (const option of Object.values(options)) {
                html += `<div class="skill-route-option"><strong>${option.name}</strong><p>${option.desc}</p></div>`;
            }
            html += `<div class="skill-node-level">Pick one at Stage 2 max</div></div>`;
        }
    }
    html += `</div>`;

    html += `</div>`; // skill-tree-branch

    container.innerHTML = html;
}

// Skill node click handler
function renderSkillNode(opts) {
    const {
        skillId, stage, nodeId, name, desc, level, maxLevel,
        nodeClass, canUpgrade, canSelect, spriteClass, parent,
        locked, otherLocked
    } = opts;

    const progressPct = (level / maxLevel * 100).toFixed(0);
    const levelText = locked ? '🔒' : `${level}/${maxLevel}`;

    let html = `<div class="skill-tree-node ${nodeClass}"
        data-skill="${skillId}" data-stage="${stage}" data-node="${nodeId}"
        ${parent ? `data-parent="${parent}"` : ''}
        onclick="onSkillNodeClick('${skillId}', ${stage}, '${nodeId}')"
        title="${desc}">`;

    html += `<div class="skill-node-icon"><div class="skill-sprite ${spriteClass}"></div></div>`;
    html += `<div class="skill-node-name">${name}</div>`;
    html += `<div class="skill-node-desc">${desc}</div>`;
    html += `<div class="skill-node-level">${levelText}</div>`;

    if (!locked && !otherLocked) {
        html += `<div class="skill-node-progress"><div class="skill-node-progress-fill" style="width:${progressPct}%"></div></div>`;
    }

    if (canUpgrade) {
        html += `<div class="skill-node-upgrade" onclick="event.stopPropagation(); upgradeSkillTree('${skillId}', ${stage}, '${nodeId}')">+</div>`;
    } else if (canSelect) {
        html += `<div class="skill-node-hint">${I18N.t('skill_node_select')}</div>`;
    }

    if (level >= maxLevel && !locked) {
        html += `<span class="skill-node-check">✓</span>`;
    } else if (locked) {
        html += `<span class="skill-node-lock">🔒</span>`;
    }

    html += `</div>`;
    return html;
}

// Stage 1 upgrades directly
function onSkillNodeClick(skillId, stage, nodeId) {
    const tree = player.skillTree[skillId];
    if (!tree) return;

    if (stage === 1) {
// locked
        if (player.skillPoints > 0 && tree.stage1 < SKILL_TREE_MAX_LEVEL) {
            upgradeSkillTree(skillId, 1, nodeId);
        }
    } else if (stage === 2) {
        const s1Maxed = tree.stage1 >= SKILL_TREE_MAX_LEVEL;
        if (!s1Maxed) return; // notunlock

        if (!tree.stage2.chosen) {
            // selectionfork
            confirmSkillChoice(skillId, 2, nodeId);
        } else if (tree.stage2.chosen === nodeId) {
// locked
            if (player.skillPoints > 0 && tree.stage2.level < SKILL_TREE_MAX_LEVEL) {
                upgradeSkillTree(skillId, 2, nodeId);
            }
        }
    } else if (stage === 3) {
        const s2Maxed = tree.stage2.level >= SKILL_TREE_MAX_LEVEL;
        if (!s2Maxed) return; // notunlock

        if (!tree.stage3.chosen) {
            // selectionfork
            confirmSkillChoice(skillId, 3, nodeId);
        } else if (tree.stage3.chosen === nodeId) {
// Confirm the fork choice (using the generic game dialog)
            if (player.skillPoints > 0 && tree.stage3.level < SKILL_TREE_MAX_LEVEL) {
                upgradeSkillTree(skillId, 3, nodeId);
            }
        }
    }
}

// Use the generic game dialog
function confirmSkillChoice(skillId, stage, nodeId) {
    const config = SKILL_TREE[skillId];
    if (!config) return;

    let nodeName = '';
    let nodeDesc = '';
    if (stage === 2) {
        const nodeConfig = config.stage2[nodeId];
        nodeName = nodeConfig?.name || nodeId;
        nodeDesc = nodeConfig?.desc || '';
    } else if (stage === 3) {
        const s2Choice = player.skillTree[skillId].stage2.chosen;
        const nodeConfig = config.stage3[s2Choice]?.[nodeId];
        nodeName = nodeConfig?.name || nodeId;
        nodeDesc = nodeConfig?.desc || '';
    }

// Stop click-through
    const overlay = document.getElementById('game-dialog-overlay');
    const header = document.getElementById('game-dialog-header');
    const body = document.getElementById('game-dialog-body');
    const btnCancel = document.getElementById('game-dialog-btn-cancel');
    const btnConfirm = document.getElementById('game-dialog-btn-confirm');

    header.textContent = 'Choose Skill Branch';
    body.innerHTML = `<strong style="color:#ffd700;font-size:18px;">${nodeName}</strong><br><br>${nodeDesc}<br><br><span style="color:#ff6b6b;">⚠️ This choice is permanent!</span>`;
    btnCancel.style.display = 'block';
    btnCancel.textContent = 'Cancel';
    btnConfirm.textContent = 'Confirm Choice';
    overlay.classList.add('active');

    const stopEvent = (e) => e.stopPropagation();
    const cleanup = () => {
        btnConfirm.onclick = null;
        btnCancel.onclick = null;
        btnConfirm.onmousedown = null;
        btnCancel.onmousedown = null;
        overlay.onmousedown = null;
    };

// Choose the skill fork
    overlay.onmousedown = stopEvent;
    btnConfirm.onmousedown = stopEvent;
    btnCancel.onmousedown = stopEvent;

    btnConfirm.onclick = (e) => {
        e.stopPropagation();
        overlay.classList.remove('active');
        cleanup();
        selectSkillBranch(skillId, stage, nodeId);
    };

    btnCancel.onclick = (e) => {
        e.stopPropagation();
        overlay.classList.remove('active');
        cleanup();
        AudioSys.play('click');
    };

    AudioSys.play('click');
}

// Upgrade the skill tree node
function selectSkillBranch(skillId, stage, nodeId) {
    const tree = player.skillTree[skillId];
    if (!tree) return;

    if (stage === 2 && !tree.stage2.chosen) {
        tree.stage2.chosen = nodeId;
        AudioSys.play('pickup_unique');
        createFloatingText(window.innerWidth / 2, 100, `Selected: ${SKILL_TREE[skillId].stage2[nodeId].name}`, '#ffd700');
    } else if (stage === 3 && !tree.stage3.chosen) {
        tree.stage3.chosen = nodeId;
        AudioSys.play('pickup_unique');
        const s2Choice = tree.stage2.chosen;
        createFloatingText(window.innerWidth / 2, 100, `Selected: ${SKILL_TREE[skillId].stage3[s2Choice][nodeId].name}`, '#ffd700');
    }

    renderSkillTree();
    syncSkillsFromTree();
}

// Sync skill tree levels into player.skills (compat with existing systems)
function upgradeSkillTree(skillId, stage, nodeId) {
    if (player.skillPoints <= 0) return;

    const tree = player.skillTree[skillId];
    if (!tree) return;

    let upgraded = false;

    if (stage === 1) {
        if (tree.stage1 < SKILL_TREE_MAX_LEVEL) {
            tree.stage1++;
            upgraded = true;
        }
    } else if (stage === 2) {
        if (tree.stage2.chosen === nodeId && tree.stage2.level < SKILL_TREE_MAX_LEVEL) {
            tree.stage2.level++;
            upgraded = true;
        }
    } else if (stage === 3) {
        if (tree.stage3.chosen === nodeId && tree.stage3.level < SKILL_TREE_MAX_LEVEL) {
            tree.stage3.level++;
            upgraded = true;
        }
    }

    if (upgraded) {
        player.skillPoints--;
        AudioSys.play('click');
        renderSkillTree();
        syncSkillsFromTree();
        updateSkillsUI();
        updateMenuIndicators();
    }
}

// isHoveringUI moved to ui-panels.js
function syncSkillsFromTree() {
    if (!player || !player.skillTree || !player.skills) return;
    for (const skillId of ['fireball', 'thunder', 'multishot']) {
        const tree = player.skillTree[skillId];
        if (tree) {
            player.skills[skillId] = (tree.stage1 || 0) + (tree.stage2 ? (tree.stage2.level || 0) : 0) + (tree.stage3 ? (tree.stage3.level || 0) : 0);
        }
    }
}


// ========== Item tooltip system ==========

// Long-press detection config
// 400ms triggers a long press
const LONG_PRESS_DURATION = 400; // 400ms triggerlong press
let longPressTimer = null;
let tooltipHideTimer = null;  // Whether the tooltip is locked (locked after a mobile long press; closed manually)
let tooltipLocked = false;  // Item currently shown in the tooltip (for the share feature)
let currentTooltipItem = null;  // Whether the mouse is over the tooltip
let isMouseOverTooltip = false;  // Item data pending send (for chat sharing)
let pendingShareItem = null;  // Share the item to the chat channel

// Stop event bubbling to prevent reaching the game canvas
function shareItemToChat(e) {
// Check login state (via userId)
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }

    if (!currentTooltipItem) {
        showNotification('No item selected');
        return;
    }

    const item = currentTooltipItem;

    // Checkisnologin（use userId Decide）
    if (typeof OnlineSystem === 'undefined' || !OnlineSystem.userId) {
        showNotification('Please log in to share');
        return;
    }

    const chatInput = document.getElementById('chat-input');
    if (!chatInput) {
        showNotification('Chat system not loaded');
        return;
    }

// Use name, not displayName: displayName may already include the enhance level
    // Use name, not displayName: displayName may already include the enhance level
    const itemData = {
        n: item.name,  // Rarity
        r: item.rarity,                     // rarity
        t: item.type,                       // type
        s: item.setId || null,              // setID
        d: item.minDmg ? `${item.minDmg}-${item.maxDmg}` : null,  // damage
        f: item.def || null,                // defense
        st: item.stats || null,             // stats
        e: item.enhanceLvl || 0             // enhancelevel
    };

// Input box shows the item name only (user-friendly)
    pendingShareItem = itemData;

    // Input box shows the item name only (user-friendly)
    // Use name, not displayName: displayName may already include the enhance level
    const baseName = item.name;
    const enhanceText = item.enhanceLvl > 0 ? ` +${item.enhanceLvl}` : '';
    chatInput.value += `[${baseName}${enhanceText}]`;
    chatInput.focus();

// Stat key to label map
    const chatBox = document.getElementById('chat-box');
    if (chatBox && chatBox.classList.contains('collapsed')) {
        if (typeof ChatSystem !== 'undefined') {
            ChatSystem.toggle();
        }
    }

    hideTooltip();
    showNotification('Item linked to chat');
    console.log('[Share] done');
}

// Generate one item's stat HTML (single column for compare view)
function getStatLabel(k) {
    if (typeof I18N !== 'undefined' && I18N.getStatLabel) {
        return I18N.getStatLabel(k);
    }
    const map = {
        str: "Strength", dex: "Dexterity", vit: "Vitality", ene: "Energy", def: "Defense",
        maxHp: "Life", maxMp: "Mana", hp: "Life", mp: "Mana",
        lifeSteal: "Life Leech %", attackSpeed: "Attack Speed %", critChance: "Crit Chance %", critDamage: "Crit Damage %",
        dmgPct: "Damage %", allSkills: "To All Skills",
        fireRes: "Fire Res %", coldRes: "Cold Res %", lightningRes: "Lightning Res %", poisonRes: "Poison Res %", allRes: "All Resistances %",
        fireDmg: "Fire Damage", coldDmg: "Cold Damage", lightningDmg: "Lightning Damage", poisonDmg: "Poison Damage",
        hpRegen: "Life Regen/s", mpRegen: "Mana Regen %", blockChance: "Block Chance %",
        reflectDamage: "Thorns %", damageReduction: "Dmg Reduction %",
        armorPierce: "Pierce %", knockback: "Knockback %", slow: "Slow %",
        doubleHit: "Combo %", attackRating: "Accuracy", magicFind: "MF%"
    };
    return map[k] || k;
}

// Format rune stats as readable text
function generateItemStatsHTML(item) {
    let lines = [];
    const dmgLabel = typeof I18N !== 'undefined' ? I18N.t('tt_damage') : 'Damage';
    const defLabel = typeof I18N !== 'undefined' ? I18N.t('tt_defense') : 'Defense';

    if (item.minDmg) {
        const avg = Math.floor((item.minDmg + item.maxDmg) / 2);
        lines.push({ label: dmgLabel, value: avg, display: `${item.minDmg}-${item.maxDmg}` });
    }
    if (item.def) {
        lines.push({ label: defLabel, value: item.def, display: `+${item.def}` });
    }
    if (item.stats) {
        for (let [k, v] of Object.entries(item.stats)) {
            lines.push({ label: getStatLabel(k), value: v, display: `+${v}`, key: k });
        }
    }
    return lines;
}

// Generate tooltip content (unified generator, supports gear comparison)
function formatRuneEffect(effectObj) {
    if (!effectObj) return '';
    const parts = [];
    for (let [k, v] of Object.entries(effectObj)) {
        if (typeof v === 'number') {
            const label = typeof getStatLabel === 'function' ? getStatLabel(k) : k;
            parts.push(`${v > 0 ? '+' : ''}${v} ${label}`);
        } else if (typeof v === 'boolean' && v) {
            parts.push(k);
        }
    }
    return parts.join(', ');
}

// Rune special display
function generateTooltipHTML(item, showCloseBtn = false, showShareBtn = true) {
    const itemDisplayName = (typeof I18N !== 'undefined' && I18N.getItemDisplayName) ? I18N.getItemDisplayName(item) : (item.displayName || item.name);

    // runespecial display
    if (item.type === 'rune') {
        const rData = (typeof getRuneData === 'function') ? getRuneData(item.runeKey) : null;
        const color = item.color || '#ffb74d';
        let rHtml = '';
        if (showCloseBtn) rHtml += `<div class="tooltip-close" onclick="hideTooltip()">×</div>`;
        rHtml += `<div class="tooltip-title" style="color:${color}; font-size:15px; font-weight:bold;">${item.runeSymbol || 'ᚱ'} ${itemDisplayName}</div>`;
        rHtml += `<div class="tooltip-type" style="color:#d4af37;">${typeof I18N !== 'undefined' ? I18N.t('tt_runeword') : 'Ancient Rune'} #${item.runeNumber || 1}</div>`;
        if (rData) {
            rHtml += `<div class="tooltip-rune-effects" style="margin-top:8px; border-top:1px solid #443; padding-top:6px; font-size:11px; line-height:1.6;">`;
            rHtml += `<div style="color:#ffa726;">⚔️ ${typeof I18N !== 'undefined' ? I18N.t('tt_weapon_effect') : 'Weapons'}: <span style="color:#fff;">${formatRuneEffect(rData.weapon)}</span></div>`;
            rHtml += `<div style="color:#42a5f5;">🛡️ ${typeof I18N !== 'undefined' ? I18N.t('tt_armor_effect') : 'Armor/Helms'}: <span style="color:#fff;">${formatRuneEffect(rData.armor)}</span></div>`;
            rHtml += `</div>`;
        }
        rHtml += `<div style="margin-top:8px; font-size:10px; color:#aaa; font-style:italic; border-top:1px dashed #333; padding-top:5px;">`;
        rHtml += `${typeof I18N !== 'undefined' ? I18N.t('tt_socket_prompt') : '💡 Click this rune, then click gear with an empty socket to insert it'}`;
        rHtml += `</div>`;
        return rHtml;
    }

// Close button (mobile)
    let slot = null;
    if (item.type === 'weapon') slot = 'mainhand';
    else if (item.type === 'armor') slot = 'body';
    else if (item.type === 'ring') slot = 'ring';
    else if (item.type === 'helm') slot = 'helm';
    else if (item.type === 'gloves') slot = 'gloves';
    else if (item.type === 'boots') slot = 'boots';
    else if (item.type === 'belt') slot = 'belt';
    else if (item.type === 'amulet') slot = 'amulet';

    const equipped = slot ? player.equipment[slot] : null;
    const isComparing = equipped && item !== equipped;

    let html = '';

// ========== Compare mode: two columns side by side ==========
    if (showCloseBtn) {
        html += `<div class="tooltip-close" onclick="hideTooltip()">×</div>`;
    }

// Left column: inspected item
    if (isComparing) {
        const eqDisplayName = (typeof I18N !== 'undefined' && I18N.getItemDisplayName) ? I18N.getItemDisplayName(equipped) : (equipped.displayName || equipped.name);
        html += `<div class="tooltip-compare">`;

        // leftenumerate:viewinitem
        html += `<div class="tooltip-col tooltip-col-left">`;
        html += `<div class="tooltip-col-header">${typeof I18N !== 'undefined' ? I18N.t('tt_viewing') : 'Viewing'}</div>`;
        html += `<div class="tooltip-title" style="color:${getItemColor(item.rarity)}">${itemDisplayName}</div>`;
        if (item.setId && SET_ITEMS[item.setId]) {
            html += `<div style="color:${COLORS.setGreen}; font-size:10px;">${SET_ITEMS[item.setId].name}</div>`;
        }

        const itemStats = generateItemStatsHTML(item);
        const equippedStats = generateItemStatsHTML(equipped);

// Left column stats (with deltas)
        const allLabels = new Set();
        itemStats.forEach(s => allLabels.add(s.label));
        equippedStats.forEach(s => allLabels.add(s.label));

// they lack it and I have it: better
        for (let label of allLabels) {
            const stat = itemStats.find(s => s.label === label);
            const eqStat = equippedStats.find(s => s.label === label);
            if (stat) {
                let diffClass = '';
                let diffText = '';
                if (eqStat) {
                    const diff = stat.value - eqStat.value;
                    if (diff > 0) {
                        diffClass = 'stat-better';
                        diffText = ` <span class="stat-diff">(+${diff})</span>`;
                    } else if (diff < 0) {
                        diffClass = 'stat-worse';
                        diffText = ` <span class="stat-diff">(${diff})</span>`;
                    }
                } else {
                    diffClass = 'stat-better';  // they lack it and I have it: better
                    diffText = ` <span class="stat-diff">(+${stat.value})</span>`;
                }
                html += `<div class="tooltip-stat ${diffClass}">${stat.display} ${label}${diffText}</div>`;
            } else {
// Right column: equipped item
                const eqVal = eqStat ? eqStat.value : 0;
                html += `<div class="tooltip-stat stat-worse">- ${label} <span class="stat-diff">(-${eqVal})</span></div>`;
            }
        }
        html += `</div>`;

// Right column stats
        html += `<div class="tooltip-col tooltip-col-right">`;
        html += `<div class="tooltip-col-header">${typeof I18N !== 'undefined' ? I18N.t('tt_equipped') : 'Equipped'}</div>`;
        html += `<div class="tooltip-title" style="color:${getItemColor(equipped.rarity)}">${eqDisplayName}</div>`;
        if (equipped.setId && SET_ITEMS[equipped.setId]) {
            html += `<div style="color:${COLORS.setGreen}; font-size:10px;">${SET_ITEMS[equipped.setId].name}</div>`;
        }

        // Right column stats
        for (let label of allLabels) {
            const stat = itemStats.find(s => s.label === label);
            const eqStat = equippedStats.find(s => s.label === label);
            if (eqStat) {
                html += `<div class="tooltip-stat">${eqStat.display} ${label}</div>`;
            } else {
                html += `<div class="tooltip-stat stat-missing">- ${label}</div>`;
            }
        }
        html += `</div>`;

        html += `</div>`;  // .tooltip-compare

// ========== Normal mode: single column ==========
        if (item.requirements) {
            const req = item.requirements;
            html += `<div class="tooltip-req">`;
            if (req.level) {
                const ok = player.lvl >= req.level;
                html += `<span style="color:${ok ? '#888' : '#f44'}">Lv.${req.level}</span> `;
            }
            if (req.str) {
                const ok = player.str >= req.str;
                const strLbl = typeof I18N !== 'undefined' ? I18N.t('stat_str') : 'STR';
                html += `<span style="color:${ok ? '#888' : '#f44'}">${strLbl}${req.str}</span> `;
            }
            if (req.dex) {
                const ok = player.dex >= req.dex;
                const dexLbl = typeof I18N !== 'undefined' ? I18N.t('stat_dex') : 'DEX';
                html += `<span style="color:${ok ? '#888' : '#f44'}">${dexLbl}${req.dex}</span>`;
            }
            html += `</div>`;
        }

    } else {
// Set bonus
        html += `<div class="tooltip-title" style="color:${getItemColor(item.rarity)}">${itemDisplayName}</div>`;
        html += `<div class="tooltip-type">${item.type.toUpperCase()}</div>`;

        if (item.setId && SET_ITEMS[item.setId]) {
            html += `<div style="color:${COLORS.setGreen}; font-size:12px; margin-top:3px;">${SET_ITEMS[item.setId].name}</div>`;
        }

        if (item.quantity > 1) html += `<div class="tooltip-stat">${typeof I18N !== 'undefined' ? I18N.t('tt_quantity') : 'Qty'}: ${item.quantity}</div>`;
        if (item.minDmg) html += `<div class="tooltip-stat">${typeof I18N !== 'undefined' ? I18N.t('tt_damage') : 'Damage'}: ${item.minDmg}-${item.maxDmg}</div>`;
        if (item.def) html += `<div class="tooltip-stat">${typeof I18N !== 'undefined' ? I18N.t('tt_defense') : 'Defense'}: +${item.def}</div>`;
        if (item.heal) html += `<div class="tooltip-stat" style="color:#d00">${typeof I18N !== 'undefined' ? I18N.t('tt_restore') : 'Restores'}: ${item.heal}</div>`;

        if (item.stats) {
            for (let [k, v] of Object.entries(item.stats)) {
                html += `<div class="tooltip-stat" style="color:#4850b8">+${v} ${getStatLabel(k)}</div>`;
            }
        }

        // setbonus
        if (item.setId && SET_ITEMS[item.setId]) {
            const setData = SET_ITEMS[item.setId];
            const equippedCount = player.equippedSets[item.setId] || 0;
            const totalPieces = Object.keys(setData.pieces).length;

            html += `<div style="margin-top:8px; border-top:1px solid #20ff20; padding-top:5px;">`;
            html += `<div style="color:${COLORS.setGreen}; font-size:11px; margin-bottom:5px;">Set (${equippedCount}/${totalPieces}):</div>`;
            for (let req in setData.bonuses) {
                const active = equippedCount >= parseInt(req);
                html += `<div style="color:${active ? COLORS.setGreen : '#666'}; font-size:11px;">(${req}) ${setData.bonuses[req].desc}</div>`;
            }
            html += `</div>`;
        }

// Runeword special card
        if (item.sockets && item.sockets > 0) {
            const socketed = item.socketedRunes || [];
            const socketsLabel = typeof I18N !== 'undefined' ? I18N.t('tt_sockets') : 'Sockets';
            html += `<div class="tooltip-sockets-section" style="margin-top:6px; border-top:1px solid #3d3429; padding-top:5px;">`;
            html += `<div style="color:#c7b370; font-size:11px; font-weight:bold; margin-bottom:4px;">${socketsLabel} (${socketed.length}/${item.sockets}):</div>`;

            for (let sIdx = 0; sIdx < item.sockets; sIdx++) {
                if (sIdx < socketed.length) {
                    const rKey = socketed[sIdx];
                    const rData = (typeof getRuneData === 'function') ? getRuneData(rKey) : null;
                    const rName = rData ? (rData.name + ' (' + rData.enName + ')') : rKey;
                    const isWeapon = item.type === 'weapon' || item.slot === 'mainhand';
                    const isHelm = item.type === 'helm' || item.slot === 'helm';
                    const effect = rData ? (isWeapon ? rData.weapon : (isHelm ? rData.helm : rData.armor)) : {};
                    html += `<div style="color:${rData ? rData.color : '#ffb74d'}; font-size:11px; margin-left:4px; margin-bottom:2px;">`;
                    html += `[ ${rData ? rData.icon : '💎'} ${rName} ] <span style="color:#bbb;">${formatRuneEffect(effect)}</span>`;
                    html += `</div>`;
                } else {
                    const emptyText = typeof I18N !== 'undefined' ? I18N.t('tt_empty_socket') : '⚪ Empty Socket';
                    html += `<div style="color:#777; font-size:11px; margin-left:4px; margin-bottom:2px;">${emptyText}</div>`;
                }
            }
            html += `</div>`;

// Gear requirements
            if (item.isRuneword && item.runewordId && typeof RUNEWORDS !== 'undefined' && RUNEWORDS[item.runewordId]) {
                const rw = RUNEWORDS[item.runewordId];
                const lang = (typeof I18N !== 'undefined' && I18N.currentLang) ? I18N.currentLang : 'zh';
                let rwTitle = rw.name;
                if (lang === 'es') rwTitle = rw.esName;
                else if (lang === 'en') rwTitle = rw.enName;
                const rwDesc = rw.desc[lang] || rw.desc.zh || '';

                html += `<div class="tooltip-runeword-card" style="margin-top:6px; background:rgba(212,175,55,0.12); border:1px solid #d4af37; border-radius:4px; padding:6px;">`;
                html += `<div style="color:#ffd700; font-weight:bold; font-size:12px; text-shadow:0 0 4px rgba(255,215,0,0.6);">★ ${typeof I18N !== 'undefined' ? I18N.t('tt_runeword') : 'RUNEWORD'}: ${rwTitle} ★</div>`;
                if (rwDesc) html += `<div style="color:#d8ca9f; font-size:10px; margin-top:2px;">${rwDesc}</div>`;
                html += `</div>`;
            }
        }

// Share button (gear only; potions/scrolls excluded; not shown for chat-link tooltips)
        if (item.requirements) {
            const req = item.requirements;
            html += `<div style="margin-top:5px; border-top:1px solid #444; padding-top:5px; color:#888; font-size:11px;">`;
            if (req.level) {
                const ok = player.lvl >= req.level;
                const lvlLbl = typeof I18N !== 'undefined' ? I18N.t('stat_level') : 'Level';
                html += `<span style="color:${ok ? '#888' : '#f44'}">${lvlLbl} ${req.level}</span> `;
            }
            if (req.str) {
                const ok = player.str >= req.str;
                const strLbl = typeof I18N !== 'undefined' ? I18N.t('stat_str') : 'Strength';
                html += `<span style="color:${ok ? '#888' : '#f44'}">${strLbl} ${req.str}</span> `;
            }
            if (req.dex) {
                const ok = player.dex >= req.dex;
                const dexLbl = typeof I18N !== 'undefined' ? I18N.t('stat_dex') : 'Dexterity';
                html += `<span style="color:${ok ? '#888' : '#f44'}">${dexLbl} ${req.dex}</span>`;
            }
            html += `</div>`;
        }
    }

// Show the tooltip (desktop hover, follows the mouse)
    const isEquipment = !['potion', 'scroll', 'gold'].includes(item.type);
    if (showShareBtn && isEquipment && typeof OnlineSystem !== 'undefined') {
        const shareText = typeof I18N !== 'undefined' ? I18N.t('tt_share') : '📢 Share to World Chat';
        html += `<div class="tooltip-share-btn">${shareText}</div>`;
    }

    return html;
}

// If locked or the mouse is over the tooltip, don't switch items
function showTooltip(item, e) {
// While the mouse is over the tooltip, keep the current tooltip
    if (tooltipLocked || !cachedUI.tooltip) return;
    if (isMouseOverTooltip) return;  // Record the current item (for sharing)

    currentTooltipItem = item;  // lognowitem（forshare）
    const tt = cachedUI.tooltip;
    tt.style.display = 'block';
    tt.style.transform = 'none';  // reset transform

// Show the tooltip (mobile long press, centered)
    let left = e.clientX + 15;
    let top = e.clientY + 15;
    if (left + 250 > window.innerWidth) left = e.clientX - 265;
    if (top + 200 > window.innerHeight) top = e.clientY - 200;

    tt.style.left = left + 'px';
    tt.style.top = top + 'px';
    tt.innerHTML = generateTooltipHTML(item, false);
}

// Record the current item (for sharing)
function showTooltipAtCenter(item) {
    if (!cachedUI.tooltip) return;
    currentTooltipItem = item;  // lognowitem（forshare）
    const tt = cachedUI.tooltip;
    tt.style.display = 'block';
    tt.style.left = '50%';
    tt.style.top = '35%';
    tt.style.transform = 'translate(-50%, -50%)';
    tt.classList.add('locked');  // allow clicking the close button
    tt.innerHTML = generateTooltipHTML(item, true);
    tooltipLocked = true;
}

// Generate content (no close or share buttons)
function showTooltipForChatLink(item, event) {
    if (!cachedUI.tooltip) return;
    const tt = cachedUI.tooltip;
    tt.style.display = 'block';
    tt.style.transform = 'none';
    tt.classList.remove('locked');

// Render first to measure the size
    tt.innerHTML = generateTooltipHTML(item, false, false);

// Position: prefer above the tap point
    const rect = tt.getBoundingClientRect();
    const ttWidth = rect.width || 200;
    const ttHeight = rect.height || 150;

// Centered horizontally on the tap point
    const clickX = event.clientX;
    const clickY = event.clientY;
    const padding = 10;

    let left = clickX - ttWidth / 2;  // Above by default
    let top = clickY - ttHeight - padding;  // Not enough room above: show below

// Keep within the screen's left/right bounds
    if (top < padding) {
        top = clickY + padding;
    }

// Keep within the screen's bottom bound
    if (left < padding) left = padding;
    if (left + ttWidth > window.innerWidth - padding) {
        left = window.innerWidth - ttWidth - padding;
    }

// Unlocked; clicking outside closes it
    if (top + ttHeight > window.innerHeight - padding) {
        top = window.innerHeight - ttHeight - padding;
    }

    tt.style.left = left + 'px';
    tt.style.top = top + 'px';

// Chat-link tooltips don't record the item
    tooltipLocked = false;
    isMouseOverTooltip = false;
    currentTooltipItem = null;  // Click anywhere to close

// Clicks inside the tooltip don't close it
    const closeHandler = (e) => {
// Add with a delay so the current click doesn't immediately close it
        if (tt.contains(e.target)) return;
        hideTooltip();
        document.removeEventListener('click', closeHandler);
    };
// Hide the tooltip
    setTimeout(() => {
        document.addEventListener('click', closeHandler);
    }, 10);
}

// hide tooltip
function hideTooltip() {
    if (!cachedUI.tooltip) return;
    const tt = cachedUI.tooltip;
    tt.style.display = 'none';
    tt.style.transform = 'none';
    tt.classList.remove('locked');
    tooltipLocked = false;
    currentTooltipItem = null;  // clearnowitem
    isMouseOverTooltip = false;
    clearTimeout(longPressTimer);
    clearTimeout(tooltipHideTimer);
}

// 150ms delay
function scheduleHideTooltip() {
    clearTimeout(tooltipHideTimer);
    tooltipHideTimer = setTimeout(() => {
        if (!isMouseOverTooltip && !tooltipLocked) {
            hideTooltip();
        }
    }, 150);  // 150msdelay
}

// Bind item tooltip events (one binder supporting desktop hover and mobile long press)
function cancelHideTooltip() {
    clearTimeout(tooltipHideTimer);
}

// Desktop: hover
function bindItemTooltip(element, item) {
// Cancel any pending delayed hide
    element.onmouseenter = (e) => {
        cancelHideTooltip();  // Delayed hide gives users time to move onto the tooltip
        showTooltip(item, e);
    };
    element.onmouseleave = () => {
        if (!tooltipLocked) {
            scheduleHideTooltip();  // Mobile: long press
        }
    };

// Movement cancels the long press
    element.ontouchstart = (e) => {
        clearTimeout(longPressTimer);
        longPressTimer = setTimeout(() => {
            e.preventDefault();
            showTooltipAtCenter(item);
        }, LONG_PRESS_DURATION);
    };
    element.ontouchend = element.ontouchcancel = () => {
        clearTimeout(longPressTimer);
    };
    element.ontouchmove = () => {
        clearTimeout(longPressTimer);  // on movetake outremovelong press
    };
}

// Handle share clicks via event delegation (more reliable than inline onclick)
function initTooltipHoverEvents() {
    const tooltip = document.getElementById('tooltip');
    if (!tooltip) return;

    tooltip.onmouseenter = () => {
        isMouseOverTooltip = true;
        cancelHideTooltip();
    };
    tooltip.onmouseleave = () => {
        isMouseOverTooltip = false;
        if (!tooltipLocked) {
            scheduleHideTooltip();
        }
    };

// Click outside closes the tooltip (mobile)
    tooltip.addEventListener('click', (e) => {
        if (e.target.classList.contains('tooltip-share-btn')) {
            e.stopPropagation();
            e.preventDefault();
            shareItemToChat(e);
        }
    });
    tooltip.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('tooltip-share-btn')) {
            e.stopPropagation();
        }
    });
}

// Click outside closes the tooltip (mobile)
document.addEventListener('touchstart', (e) => {
    if (tooltipLocked && !e.target.closest('#tooltip')) {
        hideTooltip();
    }
}, { passive: true });

// Input
window.addEventListener('mousemove', e => { mouse.x = clientToCanvasX(e.clientX); mouse.y = clientToCanvasY(e.clientY); });
window.addEventListener('mousedown', e => {
// Mark as just-clicked (single fire)
    AudioSys.tryAutoStartBGM();
    if (e.button === 0) {
        mouse.leftDown = true;
        mouse.leftClick = true; // ============= Mobile touch event mapping =============
    }
    if (e.button === 2) { mouse.rightDown = true; castSkill(player.activeSkill); advanceTutorial(6); }
});
window.addEventListener('mouseup', e => {
    if (e.button === 0) {
        mouse.leftDown = false;
        mouse.leftClick = false;
    }
});
window.addEventListener('contextmenu', e => e.preventDefault());

// Touch state management
const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || ('ontouchstart' in window);

// touchstate management
const touchState = {
    activeTouchId: null,      // noweventtouchID
    startX: 0,                // Touch start Y
    startY: 0,                // Touch start time
    startTime: 0,             // Whether a tap (not a swipe)
    isTap: false,             // whetherin order toclick（un-smoothvibrate）
    isLongPress: false,       // whetherin order tolong press
    longPressTimer: null,     // Last tap time (for double-tap detection)
    lastTapTime: 0,           // Movement threshold: under this counts as a tap
    TAP_THRESHOLD: 10,        // Long-press trigger time (ms)
    LONG_PRESS_DELAY: 500     // Get the canvas position relative to the viewport
};

// Position relative to the canvas (if needed)
function getTouchPosition(touch) {
    return {
        x: clientToCanvasX(touch.clientX),
        y: clientToCanvasY(touch.clientY),
// Touch start
        canvasX: clientToCanvasX(touch.clientX),
        canvasY: clientToCanvasY(touch.clientY)
    };
}

// touchstart
function handleTouchStart(e) {
// Let UI elements handle touches normally
    if (e.target !== canvas && !e.target.closest('#gameCanvas')) {
        return; // Update the mouse position (touch mapping)
    }

    e.preventDefault();

    const touch = e.changedTouches[0];
    const pos = getTouchPosition(touch);

    touchState.activeTouchId = touch.identifier;
    touchState.startX = pos.x;
    touchState.startY = pos.y;
    touchState.startTime = Date.now();
    touchState.isTap = true;
    touchState.isLongPress = false;

    // Update the mouse position (touch mapping)
    mouse.x = pos.x;
    mouse.y = pos.y;
    mouse.leftDown = true;
    mouse.leftClick = true;

    // Activar Joystick Táctil Dinámico
    TouchJoystick.start(touch.identifier, touch.clientX, touch.clientY);

    // try tostartBGM
    AudioSys.tryAutoStartBGM();

    // Setlong pressdetect
    clearTimeout(touchState.longPressTimer);
    touchState.longPressTimer = setTimeout(() => {
        if (touchState.isTap && touchState.activeTouchId !== null) {
            touchState.isLongPress = true;
// Touch move
            castSkill(player.activeSkill);
            advanceTutorial(6);
        }
    }, touchState.LONG_PRESS_DELAY);
}

// touchmovement
function handleTouchMove(e) {
    if (touchState.activeTouchId === null) return;

    e.preventDefault();

// Check movement distance to decide if still a tap
    let touch = null;
    for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchState.activeTouchId) {
            touch = e.changedTouches[i];
            break;
        }
    }
    if (!touch) return;

    const pos = getTouchPosition(touch);

    // Check movement distance to decide if still a tap
    const dx = pos.x - touchState.startX;
    const dy = pos.y - touchState.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > touchState.TAP_THRESHOLD) {
        touchState.isTap = false;
        clearTimeout(touchState.longPressTimer);
    }

    // Actualizar posición del Joystick Táctil
    TouchJoystick.move(touch.clientX, touch.clientY);

// Touch end
    mouse.x = pos.x;
    mouse.y = pos.y;
}

// touchend
function handleTouchEnd(e) {
    TouchJoystick.end();

// Let UI elements handle touches normally without preventDefault so click events still fire
    if (e.target !== canvas && !e.target.closest('#gameCanvas')) {
// Find the matching touch point
        clearTimeout(touchState.longPressTimer);
        mouse.leftDown = false;
        mouse.leftClick = false;
        touchState.activeTouchId = null;
        return;
    }

    e.preventDefault();

// Double-tap detection (for skill casting)
    let touch = null;
    for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchState.activeTouchId) {
            touch = e.changedTouches[i];
            break;
        }
    }

    clearTimeout(touchState.longPressTimer);

    if (touch) {
        const pos = getTouchPosition(touch);
        mouse.x = pos.x;
        mouse.y = pos.y;

// Double tap: cast the skill
        const now = Date.now();
        if (touchState.isTap && now - touchState.lastTapTime < 300) {
            // double click:releaseskill
            castSkill(player.activeSkill);
            advanceTutorial(6);
        }
        touchState.lastTapTime = now;
    }

    // Resetstate
    mouse.leftDown = false;
    mouse.leftClick = false;
    touchState.activeTouchId = null;
}

// Bind touch events to the canvas
function handleTouchCancel(e) {
    TouchJoystick.end();
    clearTimeout(touchState.longPressTimer);
    mouse.leftDown = false;
    mouse.leftClick = false;
    touchState.activeTouchId = null;
}

// Mobile style polish
if (isMobileDevice) {
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchCancel, { passive: false });

// disable default gestures
    document.body.style.touchAction = 'none';  // disable default gestures
    document.body.style.userSelect = 'none';   // disable text selection
    document.body.style.webkitUserSelect = 'none';
    document.body.style.webkitTouchCallout = 'none';

    console.log('📱 Mobile touch controls enabled');
}

window.addEventListener('keydown', e => {
// Disable game hotkeys while the chat input has focus
    AudioSys.tryAutoStartBGM();

// Alt key controls the item filter
    if (window.chatInputFocused) return;

// Detect clicks on interaction targets (exit/entrance/portal)
    if (e.key === 'Alt') {
        isAltPressed = true;
        updateWorldLabels();
    }

    if (e.key === 'f' || e.key === 'F') toggleAutoBattle();

    if (e.key === '1') useQuickItem('health');
    if (e.key === '2') useQuickItem('mana');
    if (e.key === '3') useQuickItem('scroll');

    if (e.key === 'Enter') {
        handleInteraction();
    }
});

// Click hit-test range
function isClickOnInteraction() {
    const clickRange = 25; // clickhitbox area
    // detectexit
    if (Math.hypot(mouse.worldX - dungeonExit.x, mouse.worldY - dungeonExit.y) < clickRange) return true;
// Detect the portal (using its display position)
    if (Math.hypot(mouse.worldX - dungeonEntrance.x, mouse.worldY - dungeonEntrance.y) < clickRange) return true;
// Handle interaction (enter exit/entrance/portal)
    if (townPortal && townPortal.activeFloor === player.floor) {
        const portalPos = getPortalDisplayPosition();
        if (portalPos && Math.hypot(mouse.worldX - portalPos.x, mouse.worldY - portalPos.y) < clickRange) return true;
    }
    return false;
}

// Abyss mode: endless floors with a free talent pick each
function handleInteraction() {
    if (!interactionTarget) return false;
    if (interactionTarget.type === 'next') {
        const isInHell = player.isInHell || false;
        if (isInHell) {
// Compat with legacy Hell mode logic (if present)
            if (typeof AbyssSystem !== 'undefined' && AbyssSystem.isActive) {
                showTalentShop(player.hellFloor + 1, true, true);
            }
// Legacy Hell past floor 10 enters directly
            else if (player.hellFloor < 10) {
                showTalentShop(player.hellFloor + 1, true);
            } else {
// Multiple options: show the choice screen
                enterFloor(player.hellFloor + 1, 'start');
            }
        } else {
            showTalentShop(player.floor + 1, false);
        }
    }
    else if (interactionTarget.type === 'prev') {
        const isInHell = player.isInHell || false;
        if (isInHell) {
            if (player.hellFloor === 1) {
                exitHell();
            } else {
                enterFloor(player.hellFloor - 1, 'end');
            }
        } else {
            enterFloor(player.floor - 1, 'end');
        }
    }
    else if (interactionTarget.type === 'portal') {
        if (player.floor === 0) {
            if (townPortal) {
                const safeDungeonPos = validateAndFixDungeonPortalPosition(townPortal.x, townPortal.y);
                townPortal.x = safeDungeonPos.x;
                townPortal.y = safeDungeonPos.y;
            }
            if (player.maxFloor > 2) {
// Only floor 2 is selectable: enter directly
                showPortalFloorChoice(player.lastFloor || player.maxFloor, player.maxFloor);
            } else if (player.maxFloor === 2) {
                // onlyhasNo.2flooroptional，directlyenter
                enterFloor(2, 'portal');
            } else {
// Restore the item filter on Alt key-up
                enterFloor(1, 'portal');
            }
        }
        else enterFloor(0, 'portal');
    }
    return true;
}

// Restore the item filter on Alt key-up
window.addEventListener('keyup', e => {
    if (e.key === 'Alt') {
        isAltPressed = false;
        updateWorldLabels();
    }
});

// Prevent move on UI clicks
document.querySelectorAll('.sys-btn, .skill-btn, .stat-btn, .gamble-slot, .equip-slot, .bag-slot, .panel, .belt-slot').forEach(el => {
    el.onmousedown = (e) => {
        // If the click is on the panel title bar (.panel-header), let the event reach the document drag handler
        if (e.target.closest('.panel-header')) return;
        e.stopPropagation();
    };
});

// --- Dragging Logic ---
function initDragging() {
    if (initDragging._bound) return;
    initDragging._bound = true;

    let dragObj = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    function startDrag(header, clientX, clientY) {
        dragObj = header.parentElement;
        if (typeof panelManager !== 'undefined') {
// Make sure dynamic panels like the abyss stay on top
            const entry = Object.entries(panelManager.panels).find(([k, p]) => p.id === dragObj.id);
            if (entry) panelManager.bringToFront(entry[0]);
        }
// Boundary detection
        if (parseInt(dragObj.style.zIndex) < 2000) {
            dragObj.style.zIndex = 2500;
        }

        const rect = dragObj.getBoundingClientRect();
        dragObj.style.left = rect.left + 'px';
        dragObj.style.top = rect.top + 'px';
        dragObj.style.transform = 'none';

        dragOffsetX = clientX - rect.left;
        dragOffsetY = clientY - rect.top;
    }

    function moveDrag(clientX, clientY) {
        if (!dragObj) return;
// Dragging via event delegation, supporting dynamically generated panels (like the abyss panel)
        const maxX = window.innerWidth - 50;
        const maxY = window.innerHeight - 50;
        const newX = Math.max(0, Math.min(clientX - dragOffsetX, maxX));
        const newY = Math.max(0, Math.min(clientY - dragOffsetY, maxY));
        dragObj.style.left = newX + 'px';
        dragObj.style.top = newY + 'px';
    }

    function endDrag() {
        dragObj = null;
    }

// Mouse move
    document.addEventListener('mousedown', function (e) {
        if (window.innerWidth < 768) return;
        const header = e.target.closest('.panel-header');
        if (header) {
            e.preventDefault();
            e.stopPropagation();
            startDrag(header, e.clientX, e.clientY);
        }
    });

    document.addEventListener('touchstart', function (e) {
        if (window.innerWidth < 768) return;
        const header = e.target.closest('.panel-header');
        if (header) {
            e.preventDefault();
            e.stopPropagation();
            const touch = e.touches[0];
            startDrag(header, touch.clientX, touch.clientY);
        }
    }, { passive: false });

    // mousemovement
    document.addEventListener('mousemove', function (e) {
        if (dragObj) {
            e.preventDefault();
            moveDrag(e.clientX, e.clientY);
        }
    });

// Mouse release
    document.addEventListener('touchmove', function (e) {
        if (window.innerWidth < 768) return;
        if (dragObj) {
            e.preventDefault();
            const touch = e.touches[0];
            moveDrag(touch.clientX, touch.clientY);
        }
    }, { passive: false });

    // mouserelease
    document.addEventListener('mouseup', endDrag);
    // touchend
    document.addEventListener('touchend', endDrag);
    document.addEventListener('touchcancel', endDrag);
}

function setMobileFabDot(dotId, active) {
    const dot = document.getElementById(dotId);
    if (dot) dot.style.display = active ? 'block' : 'none';
}

function updateMobileChatUnreadDot(unreadCount) {
    const unread = document.getElementById('chat-unread');
    const numericCount = Number(unreadCount);
    const hasUnread = (Number.isFinite(numericCount) && numericCount > 0)
        || !!unread?.textContent.trim();
    setMobileFabDot('mobile-chat-dot', hasUnread);
}

function updateMobileMenuDot() {
    const badgeIds = ['badge-stats', 'badge-skills', 'badge-quest'];
    const hasPanelBadge = badgeIds.some(id => {
        const badge = document.getElementById(id);
        return !!badge && badge.style.display !== 'none' && getComputedStyle(badge).display !== 'none';
    });
    const hasBlessingReward = (player.divineBlessing?.pending || 0) > 0;
    setMobileFabDot('mobile-menu-dot', hasPanelBadge || hasBlessingReward);
}

function updateMenuIndicators() {
    if (cachedUI.badges.stats) cachedUI.badges.stats.style.display = player.points > 0 ? 'block' : 'none';
    if (cachedUI.badges.skills) cachedUI.badges.skills.style.display = player.skillPoints > 0 ? 'block' : 'none';
// Show the sell hint on item slots
    const hasMainQuestReward = player.questState === 2;
    const hasDailyQuestReward = typeof DailyQuestSystem !== 'undefined' && DailyQuestSystem.hasClaimableReward();
    if (cachedUI.badges.quest) cachedUI.badges.quest.style.display = (hasMainQuestReward || hasDailyQuestReward) ? 'block' : 'none';
    updateMobileMenuDot();
}

function isMobileLayout() {
    return window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
}

function closeMobileMenu() {
    document.body.classList.remove('mobile-menu-open');
}

function toggleMobileMenu(event) {
    if (event) event.stopPropagation();
    if (!isMobileLayout()) return;

    const opening = !document.body.classList.contains('mobile-menu-open');
    document.body.classList.toggle('mobile-menu-open', opening);
    if (opening) closeMobileChat();
}

function syncMobileChatState() {
    const chatBox = document.getElementById('chat-box');
    const chatOpen = !!chatBox && !chatBox.classList.contains('collapsed');
    document.body.classList.toggle('mobile-chat-open', isMobileLayout() && chatOpen);
}

function closeMobileChat() {
    const chatBox = document.getElementById('chat-box');
    if (!chatBox || chatBox.classList.contains('collapsed')) {
        syncMobileChatState();
        return;
    }

    if (typeof ChatSystem !== 'undefined') ChatSystem.toggle();
    else chatBox.classList.add('collapsed');
    syncMobileChatState();
}

function toggleMobileChat(event) {
    if (event) event.stopPropagation();
    if (!isMobileLayout()) return;

    closeMobileMenu();
    if (typeof ChatSystem !== 'undefined') ChatSystem.toggle();
    else document.getElementById('chat-box')?.classList.toggle('collapsed');
    syncMobileChatState();
}

function initMobileHudShell() {
    const chatBox = document.getElementById('chat-box');
    if (isMobileLayout() && chatBox) {
        chatBox.classList.add('collapsed');
        localStorage.setItem('chat_collapsed', 'true');
        if (typeof ChatSystem !== 'undefined') ChatSystem.isCollapsed = true;
    }
    syncMobileChatState();

    if (chatBox && typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(syncMobileChatState);
        observer.observe(chatBox, { attributes: true, attributeFilter: ['class'] });
    }

    const unread = document.getElementById('chat-unread');
    const syncUnreadDot = () => {
        updateMobileChatUnreadDot();
    };
    syncUnreadDot();
    if (unread && typeof MutationObserver !== 'undefined') {
        const unreadObserver = new MutationObserver(syncUnreadDot);
        unreadObserver.observe(unread, { childList: true, characterData: true, subtree: true });
    }

    document.addEventListener('click', (event) => {
        if (!isMobileLayout()) return;

        const target = event.target;
        if (target.closest('#mobile-menu-toggle, #mobile-chat-toggle, .chat-box, .panel')) return;
        if (target.closest('.menu-btns .sys-btn')) {
            setTimeout(closeMobileMenu, 0);
            return;
        }

        closeMobileMenu();
        closeMobileChat();
    });

    window.addEventListener('resize', () => {
        if (!isMobileLayout()) {
            closeMobileMenu();
            document.body.classList.remove('mobile-chat-open');
        } else {
            syncMobileChatState();
        }
    });
}

// Create the hint element
function showSellTooltip(idx, val) {
    const bagGrid = document.getElementById('bag-grid');
    if (!bagGrid) return;

    const slots = bagGrid.querySelectorAll('.bag-slot');
    if (idx >= slots.length) return;

    const slot = slots[idx];

// Add to the slot
    const tip = document.createElement('div');
    tip.style.position = 'absolute';
    tip.style.left = '0';
    tip.style.top = '0';
    tip.style.width = '100%';
    tip.style.height = '100%';
    tip.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
    tip.style.color = '#ffd700';
    tip.style.display = 'flex';
    tip.style.flexDirection = 'column';
    tip.style.justifyContent = 'center';
    tip.style.alignItems = 'center';
    tip.style.fontSize = '11px';
    tip.style.fontWeight = 'bold';
    tip.style.textAlign = 'center';
    tip.style.padding = '5px';
    tip.style.boxSizing = 'border-box';
    tip.style.zIndex = '1000';
    tip.style.pointerEvents = 'none';
    tip.style.animation = 'fadeOut 2s ease-out forwards';
    tip.innerHTML = `<div>Sold</div><div style="font-size:13px; margin-top:2px;">+${val}G</div>`;

    // addtoslot
    slot.style.position = 'relative';
    slot.appendChild(tip);

// ============= Auto battle UI interaction functions =============
    setTimeout(() => {
        if (tip.parentNode) {
            tip.parentNode.removeChild(tip);
        }
    }, 2000);
}

// Auto battle is banned in abyss mode

function toggleAutoBattle() {
    const btn = document.getElementById('auto-battle-btn');
    const icon = document.getElementById('auto-battle-icon');

// Refuse to enable while in town
    if (!AutoBattle.enabled && typeof AbyssSystem !== 'undefined' && AbyssSystem.isActive) {
        showNotification('Auto battle is disabled during Abyss challenges');
        return;
    }

// Show the hire cost reminder on first enable
    if (!AutoBattle.enabled && isInTown()) {
        showNotification('Auto battle only works in dungeons');
        return;
    }

// Reset this session's gold stats
    if (!AutoBattle.enabled && !player.autoBattleFeeNotified) {
        showAutoBattleFeeNotice();
        return;
    }

    AutoBattle.enabled = !AutoBattle.enabled;

    if (AutoBattle.enabled) {
        btn.classList.add('active');
        icon.textContent = '⚔️';
        showNotification('Auto battle enabled');
// Show the HUD
        AutoBattle.sessionGold = 0;
        AutoBattle.sessionFee = 0;
        updateAutoBattleFeeHUD();
        // ShowHUD
        document.getElementById('auto-battle-fee-hud').classList.add('active');
        // newtutorial:step7 - openauto battle
        advanceTutorial(7);
    } else {
        btn.classList.remove('active');
        icon.textContent = '🛡️';
        showNotification('Auto battle disabled');
        AutoBattle.currentTarget = null;
        player.targetX = null;
        player.targetY = null;
        // hideHUD
        document.getElementById('auto-battle-fee-hud').classList.remove('active');
    }
}

// Acknowledge the hire cost reminder
function showAutoBattleFeeNotice() {
    autoBattleFeeNoticeOpen = true;
    document.getElementById('auto-battle-fee-overlay').classList.add('active');
}

// Enable auto battle right after acknowledging
function confirmAutoBattleFee() {
    autoBattleFeeNoticeOpen = false;
    document.getElementById('auto-battle-fee-overlay').classList.remove('active');
    player.autoBattleFeeNotified = true;
// Update the auto battle hire cost HUD
    toggleAutoBattle();
}

// Updateauto battlehire costHUD
function updateAutoBattleFeeHUD() {
    document.getElementById('auto-battle-gold').textContent = AutoBattle.sessionGold;
    document.getElementById('auto-battle-fee').textContent = AutoBattle.sessionFee > 0 ? '-' + AutoBattle.sessionFee : '0';
}

// Compute the cut (15 per full 100 gold)
function processAutoBattleFee(goldAmount) {
    AutoBattle.sessionGold += goldAmount;
// Sync hit-feel settings
    const taxableHundreds = Math.floor(AutoBattle.sessionGold / 100);
    const newTotalFee = taxableHundreds * 15;
    const feeToDeduct = newTotalFee - AutoBattle.sessionFee;
    if (feeToDeduct > 0) {
        player.gold -= feeToDeduct;
        AutoBattle.sessionFee = newTotalFee;
    }
    updateAutoBattleFeeHUD();
}

function updateAutoBattleSettings() {
    AutoBattle.settings.useSkill = document.getElementById('auto-use-skill').checked;
    AutoBattle.settings.keepDistance = parseInt(document.getElementById('auto-keep-distance').value);
    AutoBattle.settings.hpThreshold = parseInt(document.getElementById('auto-hp-threshold').value) / 100;
    AutoBattle.settings.mpThreshold = parseInt(document.getElementById('auto-mp-threshold').value) / 100;
    AutoBattle.settings.emergencyHp = parseInt(document.getElementById('auto-emergency-hp').value) / 100;
    AutoBattle.settings.pickupUnique = document.getElementById('auto-pickup-unique').checked;
    AutoBattle.settings.pickupSet = document.getElementById('auto-pickup-set').checked;

    // synchit feedbackSet
    player.juiceEnabled = document.getElementById('chk-juice').checked;
}

function syncAutoBattleUI() {
    const s = AutoBattle.settings;
    document.getElementById('auto-use-skill').checked = s.useSkill;
    document.getElementById('auto-keep-distance').value = s.keepDistance;
    document.getElementById('auto-hp-threshold').value = Math.round(s.hpThreshold * 100);
    document.getElementById('auto-mp-threshold').value = Math.round(s.mpThreshold * 100);
    document.getElementById('auto-emergency-hp').value = Math.round(s.emergencyHp * 100);
    document.getElementById('auto-pickup-unique').checked = s.pickupUnique;
    document.getElementById('auto-pickup-set').checked = s.pickupSet;
    document.getElementById('chk-juice').checked = player.juiceEnabled || false;
    updateDistanceDisplay(); updateHpDisplay(); updateMpDisplay(); updateEmergencyDisplay();
}

function updateDistanceDisplay() {
    const val = document.getElementById('auto-keep-distance').value;
    document.getElementById('distance-display').textContent = val;
}

function updateHpDisplay() {
    const val = document.getElementById('auto-hp-threshold').value;
    document.getElementById('hp-threshold-display').textContent = val + '%';
}

function updateMpDisplay() {
    const val = document.getElementById('auto-mp-threshold').value;
    document.getElementById('mp-threshold-display').textContent = val + '%';
}

function updateEmergencyDisplay() {
    const val = document.getElementById('auto-emergency-hp').value;
    document.getElementById('emergency-display').textContent = val + '%';
}


function switchSettingsTab(tabName) {
    // Hide all contents
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    // Show selected content
    const content = document.getElementById(`tab-${tabName}`);
    if (content) content.style.display = 'block';

    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const btn = document.getElementById(`tab-btn-${tabName}`);
    if (btn) btn.classList.add('active');
}


// Update the slot display

let forgeState = {
    main: null,
    sub1: null,
    sub2: null
};

function renderBlacksmithPanel() {
    const slots = ['main', 'sub1', 'sub2'];
    let mainItem = forgeState.main;

// Clear old content
    slots.forEach(slotKey => {
        const item = forgeState[slotKey];
        const elId = slotKey === 'main' ? 'forge-main-slot' : (slotKey === 'sub1' ? 'forge-sub-slot-1' : 'forge-sub-slot-2');
        const el = document.getElementById(elId);

// Create the icon container
        el.innerHTML = '';
        el.className = `forge-slot ${slotKey === 'main' ? 'main-slot' : 'sacrifice-slot'}`;
        el.onclick = () => returnItemFromForge(slotKey);

        if (item) {
            el.classList.add('has-item');

// drop the inner border; use the slot border
            const iconDiv = document.createElement('div');
            iconDiv.style.width = '100%';
            iconDiv.style.height = '100%';
            applyItemSpriteToElement(iconDiv, item);
            iconDiv.style.border = 'none'; // drop the inner border; use the slot border

// Enhance level badge
            const color = getItemColor(item.rarity);
            el.style.borderColor = color;
            el.style.boxShadow = `0 0 10px ${color}`;

// reuse styles
            if (item.enhanceLvl > 0) {
                const badge = document.createElement('div');
                badge.className = 'item-count'; // reuse styles
                badge.innerText = `+${item.enhanceLvl}`;
                badge.style.right = '2px';
                badge.style.bottom = '2px';
                el.appendChild(badge);
            }

            el.appendChild(iconDiv);

            // Tooltip
            bindItemTooltip(el, item);
        } else {
            el.style.borderColor = '#555';
            el.style.boxShadow = 'inset 0 0 10px #000';
            const placeholder = document.createElement('span');
            placeholder.className = 'slot-placeholder';
            placeholder.innerText = slotKey === 'main'
                ? (typeof I18N !== 'undefined' ? I18N.t('forge_target_placeholder') : 'Equipment')
                : (typeof I18N !== 'undefined' ? I18N.t('forge_sacrifice_slot') : 'Sacrifice');
            el.appendChild(placeholder);
            el.onmouseenter = null;
            el.onmouseleave = null;
        }
    });

// Compute success rate and cost
    const previewText = document.getElementById('forge-preview-text');
    const costDisplay = document.getElementById('forge-cost-display');
    const btn = document.getElementById('btn-forge-action');
    const goldCostEl = document.getElementById('forge-gold-cost');

    if (mainItem) {
        const currentLvl = mainItem.enhanceLvl || 0;
        const nextLvl = currentLvl + 1;
        const isMaxLevel = currentLvl >= 9;

        if (isMaxLevel) {
            const maxLvlTxt = typeof I18N !== 'undefined' ? I18N.t('forge_max_level') : 'Already at max enhancement level (+9)';
            previewText.innerHTML = `<span style="color:#d4af37">${maxLvlTxt}</span>`;
            costDisplay.style.display = 'none';
            btn.disabled = true;
            btn.classList.remove('highlight-btn');
            btn.innerText = typeof I18N !== 'undefined' ? I18N.t('forge_max_level_btn') : 'Already maxed';
        } else {
            // Compute success rate and cost
            const successRate = Math.max(10, 100 - (currentLvl * 10)); // +0->+1: 100%, +8->+9: 20%
            const goldCost = (currentLvl + 1) * 1000 + (mainItem.rarity * 500); // Preview the stat gains

// Assume +10% base stats (defense/damage) per enhance
// Update the cost
            const statIncrease = 10;
            const rateColor = successRate >= 80 ? '#00ff00' : (successRate >= 50 ? '#ffff00' : '#ff4444');

            let previewHtml = typeof I18N !== 'undefined'
                ? I18N.t('forge_preview_upgrade', { nextLvl, rateColor, successRate, statIncrease })
                : `Enhance to <span style="color:#00ff00">+${nextLvl}</span> · Success rate <span style="color:${rateColor}">${successRate}%</span><br>Stats up ${statIncrease}%`;

            if (currentLvl >= 6) {
                previewHtml += typeof I18N !== 'undefined'
                    ? I18N.t('forge_fail_warning')
                    : ` · <span style="color:#ff4444;">⚠ Failure may downgrade</span>`;
            }

            previewText.innerHTML = previewHtml;

// Check conditions
            goldCostEl.innerText = goldCost;
            costDisplay.style.display = 'block';

// Gear check
            const hasMaterials = forgeState.sub1 && forgeState.sub2;
            const canAfford = player.gold >= goldCost;

            if (hasMaterials && canAfford) {
                btn.disabled = false;
                btn.classList.add('highlight-btn');
                btn.innerText = typeof I18N !== 'undefined' ? I18N.t('forge_btn') : 'Start Enhancement';
                btn.onclick = () => forgeItem(successRate, goldCost);
            } else {
                btn.disabled = true;
                btn.classList.remove('highlight-btn');
                btn.innerText = !hasMaterials
                    ? (typeof I18N !== 'undefined' ? I18N.t('forge_missing_mats') : 'Missing sacrifice items')
                    : (typeof I18N !== 'undefined' ? I18N.t('forge_not_enough_gold') : 'Not enough gold');
            }
        }
    } else {
        const tip = typeof I18N !== 'undefined' ? I18N.t('forge_preview_tip') : 'Place the equipment to enhance (max +9)';
        const subtip = typeof I18N !== 'undefined' ? I18N.t('forge_preview_subtip') : 'Same slot & rarity sacrifice · Boosts stats on success · Failure risk above +6';
        previewText.innerHTML = `${tip}<div style="color:#666; font-size:10px; margin-top:4px;">${subtip}</div>`;
        costDisplay.style.display = 'none';
        btn.disabled = true;
        btn.classList.remove('highlight-btn');
        btn.innerText = typeof I18N !== 'undefined' ? I18N.t('forge_btn') : 'Start Enhancement';
    }
}

function moveItemToForge(inventoryIdx) {
    const item = player.inventory[inventoryIdx];
    if (!item) return;

    // gearhitbox
    const isEquipment = ['weapon', 'helm', 'armor', 'gloves', 'boots', 'belt', 'shield', 'ring', 'amulet'].includes(item.type);
    if (!isEquipment) {
        showNotification(typeof I18N !== 'undefined' ? I18N.t('forge_only_equipment') : "Can only enhance equipment");
        return;
    }

    if (!forgeState.main) {
// borrow SFX
        forgeState.main = item;
        player.inventory[inventoryIdx] = null;
        AudioSys.play('gold'); // borrow SFX
    } else {
// Sacrifice requirement: same slot
// Sacrifice requirement: same rarity (or higher? Strictly same rarity here to keep it simple)
        if (item.type !== forgeState.main.type) {
            const slotName = typeof I18N !== 'undefined' ? I18N.tOr('item_' + forgeState.main.type, forgeState.main.type) : forgeState.main.type;
            showNotification(typeof I18N !== 'undefined' ? I18N.t('forge_same_slot', { type: slotName }) : `Sacrifice must be same slot item (${forgeState.main.type})`);
            return;
        }
// Unequipping the main piece also returns the sacrifice (accident-proof; keeping it in place is also fine and more convenient)
        if (item.rarity !== forgeState.main.rarity) {
            showNotification(typeof I18N !== 'undefined' ? I18N.t('forge_same_rarity') : "Sacrifice must have the same rarity");
            return;
        }

        if (!forgeState.sub1) {
            forgeState.sub1 = item;
            player.inventory[inventoryIdx] = null;
            AudioSys.play('gold');
        } else if (!forgeState.sub2) {
            forgeState.sub2 = item;
            player.inventory[inventoryIdx] = null;
            AudioSys.play('gold');
        } else {
            showNotification(typeof I18N !== 'undefined' ? I18N.t('forge_slots_full') : "Slots are full");
            return;
        }
    }

    hideTooltip();
    renderInventory();
    renderBlacksmithPanel();
    renderEmbeddedBag('blacksmith');
}

function returnItemFromForge(slotKey) {
    const item = forgeState[slotKey];
    if (!item) return;

    if (addItemToInventory(item, { fromForge: true })) {
        forgeState[slotKey] = null;

// We keep the sacrifice, but rendering re-checks it
// Fill sub1

        hideTooltip();
        renderInventory();
        renderBlacksmithPanel();
        renderEmbeddedBag('blacksmith');
    } else {
        showNotification(typeof I18N !== 'undefined' ? I18N.t('notif_inv_full') : "Your bag is full");
    }
}

function autoFillForgeMaterial() {
    if (!forgeState.main) {
        showNotification(typeof I18N !== 'undefined' ? I18N.t('forge_no_main') : "Place target equipment first");
        return;
    }

    const targetType = forgeState.main.type;
    const targetRarity = forgeState.main.rarity;
    let addedCount = 0;

    // fillsub1
    if (!forgeState.sub1) {
        const idx = player.inventory.findIndex(i => i && i.type === targetType && i.rarity === targetRarity);
        if (idx !== -1) {
            forgeState.sub1 = player.inventory[idx];
            player.inventory[idx] = null;
            addedCount++;
        }
    }

    // fillsub2
    if (!forgeState.sub2) {
        const idx = player.inventory.findIndex(i => i && i.type === targetType && i.rarity === targetRarity);
        if (idx !== -1) {
            forgeState.sub2 = player.inventory[idx];
            player.inventory[idx] = null;
            addedCount++;
        }
    }

    if (addedCount > 0) {
        renderInventory();
        renderBlacksmithPanel();
        showNotification(typeof I18N !== 'undefined' ? I18N.t('forge_autofill_done', { count: addedCount }) : `Auto-filled ${addedCount} sacrifice item(s)`);
        AudioSys.play('gold');
    } else {
        showNotification(typeof I18N !== 'undefined' ? I18N.t('forge_no_matches') : "No matching sacrifice items found");
    }
}

function forgeItem(successRate, cost) {
    if (!forgeState.main || !forgeState.sub1 || !forgeState.sub2) return;
    if (player.gold < cost) return;

    player.gold -= cost;

// success
    forgeState.sub1 = null;
    forgeState.sub2 = null;

    const mainItem = forgeState.main;
    const roll = Math.random() * 100;
    const isSuccess = roll < successRate;

    const mainSlotEl = document.getElementById('forge-main-slot');

    if (isSuccess) {
        // success
        mainItem.enhanceLvl = (mainItem.enhanceLvl || 0) + 1;

        // boostbase attributes
// Note: only integers should be kept here
// Percentage stats in stats usually don't improve; enhancing numeric stats makes more sense
        if (mainItem.def) mainItem.def = Math.floor(mainItem.def * 1.1);
        if (mainItem.minDmg) mainItem.minDmg = Math.floor(mainItem.minDmg * 1.1);
        if (mainItem.maxDmg) mainItem.maxDmg = Math.floor(mainItem.maxDmg * 1.1);
// But for game feel, stats can be tweaked slightly
        // But for game feel, stats can be tweaked slightly
        for (let key in mainItem.stats) {
// Update the name display
            if (mainItem.stats[key] > 5) {
                mainItem.stats[key] = Math.ceil(mainItem.stats[key] * 1.05);
            }
        }

// Success VFX
        if (!mainItem.originalName) mainItem.originalName = mainItem.displayName || mainItem.name;
        mainItem.displayName = `${mainItem.originalName} +${mainItem.enhanceLvl}`;

        // successVFX
        createUIForgeEffect('success');

        mainSlotEl.classList.add('forge-success-anim');
        setTimeout(() => mainSlotEl.classList.remove('forge-success-anim'), 1000);

// Server announce: enhance success
        const successTxt = typeof I18N !== 'undefined' ? I18N.t('forge_success_float') : "Enhancement succeeded!";
        createFloatingText(player.x, player.y - 60, successTxt, '#00ff00', 2);

// Achievement tracking: highest enhance level
        if (typeof OnlineSystem !== 'undefined') {
            OnlineSystem.announce('enhance_success', mainItem.displayName, mainItem.enhanceLvl);
        }

// Failure
        trackAchievement('max_enhance', { level: mainItem.enhanceLvl });

    } else {
        // failure
        let msg = typeof I18N !== 'undefined' ? I18N.t('forge_fail_float') : "Enhancement failed...";
// 50% chance to lose a level
        if ((mainItem.enhanceLvl || 0) >= 6) {
// Stat rollback is messy; simplified: keep stats, roll back only the level number, or subtract a little
            if (Math.random() > 0.5) {
                mainItem.enhanceLvl--;
                // Stat rollback is messy; simplified: keep stats, roll back only the level number, or subtract a little
// Failure VFX
                if (mainItem.def) mainItem.def = Math.floor(mainItem.def * 0.95);
                if (mainItem.minDmg) mainItem.minDmg = Math.floor(mainItem.minDmg * 0.95);
                if (mainItem.maxDmg) mainItem.maxDmg = Math.floor(mainItem.maxDmg * 0.95);

                mainItem.displayName = `${mainItem.originalName} +${mainItem.enhanceLvl}`;
                msg += typeof I18N !== 'undefined' ? I18N.t('forge_level_down') : " level lost!";
            } else {
                msg += typeof I18N !== 'undefined' ? I18N.t('forge_item_kept') : " item kept";
            }
        }

        // failureVFX
        createUIForgeEffect('fail');

        mainSlotEl.classList.add('forge-fail-anim');
        setTimeout(() => mainSlotEl.classList.remove('forge-fail-anim'), 1000);
        const failTxt = typeof I18N !== 'undefined' ? I18N.t('forge_fail_float') : "Enhancement failed";
        createFloatingText(player.x, player.y - 60, failTxt, '#ff4444', 2);
    }

    renderInventory();
    renderBlacksmithPanel();
    updateStats(); // UI particle VFX (for enhance success/failure, layered above panels)
}

// nudged slightly up to line up with the main slot
function createUIForgeEffect(type) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2 - 50; // nudged slightly up to line up with the main slot
    const container = document.body;

    const count = type === 'success' ? 40 : 20;
    const colors = type === 'success' ?
        ['#ffd700', '#ffaa00', '#ffff00', '#ffffff'] :
        ['#888888', '#555555', '#aaaaaa', '#000000'];

    // Play SFX
    if (type === 'success') {
        AudioSys.play('drop_unique'); // borrow the Unique drop SFX
    } else {
        AudioSys.play('ui_error');
    }

    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        const size = Math.random() * 4 + 2;
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        p.style.position = 'absolute';
        p.style.left = centerX + 'px';
        p.style.top = centerY + 'px';
        p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        p.style.borderRadius = '50%';
        p.style.zIndex = '2000'; // ensure it stays above panels
        p.style.pointerEvents = 'none';
        p.style.boxShadow = type === 'success' ? `0 0 ${size * 2}px ${p.style.backgroundColor}` : 'none';

        container.appendChild(p);

// Speed
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 100 + 50; // speed
        const life = 1.0 + Math.random() * 0.5; // duration

        // CSS transition
        p.style.transition = `all ${life}s ease-out`;

// Spread radius
        requestAnimationFrame(() => {
            const destX = centerX + Math.cos(angle) * velocity * 2; // success floats up, failure sinks down
            const destY = centerY + Math.sin(angle) * velocity * 2 + (type === 'success' ? -100 : 100); // success floats up, failure sinks down

            p.style.transform = `translate(${destX - centerX}px, ${destY - centerY}px)`;
            p.style.opacity = '0';
        });

        // Cleanup
        setTimeout(() => p.remove(), life * 1000);
    }

// ========== Update announcement system ==========
    if (type === 'success') {
        const flash = document.createElement('div');
        flash.style.position = 'fixed';
        flash.style.left = '0';
        flash.style.top = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.backgroundColor = 'rgba(255, 215, 0, 0.3)';
        flash.style.zIndex = '1999';
        flash.style.pointerEvents = 'none';
        flash.style.transition = 'opacity 0.5s ease-out';

        container.appendChild(flash);

        requestAnimationFrame(() => {
            flash.style.opacity = '0';
        });

        setTimeout(() => flash.remove(), 500);
    }
}

initDragging();
init();

// Max versions displayed
const CHANGELOG_MAX_DISPLAY = 30; // show only the latest two versions by date to avoid flooding with same-day updates
const CHANGELOG_MAX_LATEST_DATE_DISPLAY = 2; // show only the latest two versions by date to avoid flooding with same-day updates

// First visit does not auto-open the announcement to avoid blocking new users; recorded as read for the current version
function checkChangelog() {
    if (typeof CHANGELOG === 'undefined' || CHANGELOG.length === 0) return;

    const lastReadVersion = localStorage.getItem('changelog_read_version');
    const currentVersion = CURRENT_VERSION;

    // First visit does not auto-open the announcement to avoid blocking new users; recorded as read for the current version
    if (!lastReadVersion) {
        localStorage.setItem('changelog_read_version', currentVersion);
        return;
    }

// Show the update announcement panel
    if (lastReadVersion !== currentVersion) {
        showChangelogPanel();
    }
}

// Clear and load the update log
function showChangelogPanel() {
    const panel = document.getElementById('changelog-panel');
    const content = document.getElementById('changelog-content');

    if (!panel || !content) return;

// Localization: the changelog table keys by version; zh keeps the changelog.js original
    content.innerHTML = '';
    const displayItems = getChangelogDisplayItems();

    for (let i = 0; i < displayItems.length; i++) {
        const item = displayItems[i];
        const div = document.createElement('div');
        div.className = 'changelog-item';

        // localization:changelog tableso version forkey，zh keep changelog.js originaltext
        const entry = (I18N.content.changelog || {})[item.version];
        const title = entry ? (I18N.resolveEntry(entry.title) || item.title) : item.title;
        let highlights = item.highlights;
        if (entry && Array.isArray(entry.highlights) && entry.highlights.length === item.highlights.length) {
            highlights = entry.highlights.map(h => I18N.resolveEntry(h) || h);
        }

        const highlightsHtml = highlights
            .map(h => `<li>${h}</li>`)
            .join('');

// Close the update announcement panel
        const dateStr = item.date ? ` (${item.date.slice(5)})` : '';

        div.innerHTML = `
            <div class="changelog-version">
                <span class="changelog-version-num">v${item.version}${dateStr}</span>
                <span class="changelog-version-title">${title}</span>
            </div>
            <ul class="changelog-highlights">${highlightsHtml}</ul>
        `;
        content.appendChild(div);
    }

    panel.style.display = 'flex';
}

function getChangelogDisplayItems() {
    const latestDate = CHANGELOG[0]?.date || '';
    let latestDateCount = 0;
    const items = [];

    for (let i = 0; i < CHANGELOG.length && items.length < CHANGELOG_MAX_DISPLAY; i++) {
        const item = CHANGELOG[i];
        if (item.date === latestDate) {
            if (latestDateCount >= CHANGELOG_MAX_LATEST_DATE_DISPLAY) continue;
            latestDateCount++;
        }
        items.push(item);
    }

    return items;
}

// Record the read version
function closeChangelogPanel() {
    const panel = document.getElementById('changelog-panel');
    if (panel) {
        panel.style.display = 'none';
    }

// Check whether to show the announcement after page load
    if (typeof CURRENT_VERSION !== 'undefined') {
        localStorage.setItem('changelog_read_version', CURRENT_VERSION);
    }
}

// Init the abyss system
document.addEventListener('DOMContentLoaded', () => {
// Deferred check, waits for first-screen load to finish
    if (typeof AbyssSystem !== 'undefined') {
        AbyssSystem.init();
    }
    initMobileHudShell();
    // Deferred check, waits for first-screen load to finish
    setTimeout(checkChangelog, 500);
});

// Town bubble tutorial (steps 0-4)
// Combat tutorial (steps 5-7, top hints) - hints vary by device type
const TUTORIAL_TOWN_STEPS = [
    { id: 0, target: 'inventory-btn', textKey: 'tutorial_town_inventory', isUI: true },
    { id: 1, target: 'merchant', textKey: 'tutorial_town_merchant' },
    { id: 2, target: 'healer', textKey: 'tutorial_town_healer' },
    { id: 3, target: 'stash', textKey: 'tutorial_town_stash' },
    { id: 4, target: 'exit', textKey: 'tutorial_town_exit' }
];
// Get the world coords of the town tutorial targets
function getTutorialBattleSteps() {
    if (isMobileDevice) {
        return [
            { id: 5, text: I18N.t('tutorial_battle_mobile_attack'), key: null },
            { id: 6, text: I18N.t('tutorial_battle_mobile_cast'), key: I18N.currentLang === 'zh' ? 'Long Press' : (I18N.currentLang === 'es' ? 'Mantener' : 'Hold') },
            { id: 7, text: I18N.t('tutorial_battle_mobile_auto'), key: null }
        ];
    }
    return [
        { id: 5, text: I18N.t('tutorial_battle_desktop_attack'), key: null },
        { id: 6, text: I18N.t('tutorial_battle_desktop_cast'), key: I18N.currentLang === 'zh' ? 'Right Click' : (I18N.currentLang === 'es' ? 'Clic derecho' : 'Right-click') },
        { id: 7, text: I18N.t('tutorial_battle_desktop_auto'), key: 'F' }
    ];
}

// Update the town bubble position (called every frame)
function getTutorialTargetPos(targetType) {
    if (targetType === 'exit') {
        return { x: dungeonExit.x, y: dungeonExit.y };
    }
    const npc = npcs.find(n => n.type === targetType);
    if (npc) return { x: npc.x, y: npc.y };
    return null;
}

// Equipping itself completes step one; opening the panel yields the interaction area while keeping later tutorial progress.
function updateTutorialBubble() {
    maybeShowDailyLoginPanel();
    if (player.tutorial.completed || player.tutorial.step >= TUTORIAL_TOWN_STEPS.length || player.floor !== 0) {
        const existingBubble = document.getElementById('tutorial-bubble');
        if (existingBubble && (player.tutorial.completed || existingBubble.dataset.tutorialKind !== 'battle')) hideTutorialBubble();
        return;
    }

// Stop event bubbling to avoid triggering game clicks
    if (player.tutorial.step === 0 && player.equipment?.mainhand) advanceTutorial(0);
    if (Object.values(panelManager.panels).some(panel => panel.opened)) {
        hideTutorialBubble();
        return;
    }

    const step = TUTORIAL_TOWN_STEPS[player.tutorial.step];
    if (!step) return;

    let bubble = document.getElementById('tutorial-bubble');
    if (!bubble && cachedUI.uiLayer) {
        bubble = document.createElement('div');
        bubble.id = 'tutorial-bubble';
        bubble.innerHTML = `
            <span class="bubble-text"></span>
            <button class="bubble-btn">${I18N.t('tutorial_dismiss')}</button>
            <div class="bubble-arrow"></div>
        `;
// Button click events
        bubble.onmousedown = (e) => e.stopPropagation();
        bubble.onclick = (e) => e.stopPropagation();
// UI element positioning (like the item button)
        bubble.querySelector('.bubble-btn').onclick = (e) => {
            e.stopPropagation();
            advanceTutorial(player.tutorial.step);
        };
        cachedUI.uiLayer.appendChild(bubble);
    }

    if (!bubble) return;

    bubble.dataset.tutorialKind = 'town';
    bubble.querySelector('.bubble-btn').textContent = I18N.t('tutorial_dismiss');

// Bubble sits left of the button with the arrow pointing right
    if (step.isUI) {
        const btnId = step.target === 'inventory-btn' ? 'btn-inventory' : step.target;
        const btn = document.getElementById(btnId);
        if (!btn) return;

        const rect = btn.getBoundingClientRect();
// arrow points right
        const screenX = rect.left - 10;
        const screenY = rect.top + rect.height / 2;

        bubble.querySelector('.bubble-text').textContent = I18N.t(step.textKey);
        bubble.style.left = screenX + 'px';
        bubble.style.top = screenY + 'px';
        bubble.style.display = 'block';
        bubble.classList.add('arrow-right');  // arrow points right
        bubble.classList.remove('arrow-down');
        return;
    }

// Convert to screen coords
    const targetPos = getTutorialTargetPos(step.target);
    if (!targetPos) return;

// NPC names sit at y-70; bubbles above names need -160; the dungeon entrance needs -100
    const screenX = targetPos.x - camera.x;
// arrow defaults to pointing down at the NPC
    const yOffset = (step.target === 'exit') ? -100 : -160;
    const screenY = targetPos.y - camera.y + yOffset;

    bubble.querySelector('.bubble-text').textContent = I18N.t(step.textKey);
    bubble.style.left = canvasToCssX(screenX) + 'px';
    bubble.style.top = canvasToCssY(screenY) + 'px';
    bubble.style.display = 'block';
    bubble.classList.remove('arrow-right', 'arrow-down');  // arrow defaults to pointing down at the NPC
}

// Show the combat tutorial hint (top or bubble)
function hideTutorialBubble() {
    const bubble = document.getElementById('tutorial-bubble');
    if (bubble) bubble.style.display = 'none';
}

// Town tutorial uses bubbles, not top hints
function showTutorialTip(step) {
    if (player.tutorial.completed) return;
    if (step !== player.tutorial.step) return;

// Step 7 (auto battle) uses a bubble pointing at the button
    if (step < TUTORIAL_TOWN_STEPS.length) return;

    const battleStep = getTutorialBattleSteps().find(s => s.id === step);
    if (!battleStep) return;

// Show the auto battle tutorial bubble (pointing at the button)
    if (step === 7) {
        showAutoBattleTutorialBubble(battleStep.text);
        return;
    }

    let el = document.getElementById('tutorial-tip');
    if (!el) {
        el = document.createElement('div');
        el.id = 'tutorial-tip';
        document.querySelector('.ui-layer').appendChild(el);
    }

    el.innerHTML = `<span class="tutorial-text">${battleStep.text}</span>${battleStep.key ? `<span class="tutorial-key">${battleStep.key}</span>` : ''}`;
    el.style.display = 'flex';
    el.style.opacity = '0';
    setTimeout(() => el.style.opacity = '1', 50);
}

// Bubble sits left of the button with the arrow pointing right
function showAutoBattleTutorialBubble(text) {
    let bubble = document.getElementById('tutorial-bubble');
    if (!bubble) {
        bubble = document.createElement('div');
        bubble.id = 'tutorial-bubble';
        bubble.innerHTML = `
            <span class="bubble-text"></span>
            <button class="bubble-btn">${I18N.t('tutorial_dismiss')}</button>
            <div class="bubble-arrow"></div>
        `;
        bubble.onmousedown = (e) => e.stopPropagation();
        bubble.onclick = (e) => e.stopPropagation();
        bubble.querySelector('.bubble-btn').onclick = (e) => {
            e.stopPropagation();
            advanceTutorial(player.tutorial.step);
        };
        document.querySelector('.ui-layer').appendChild(bubble);
    }

    bubble.dataset.tutorialKind = 'battle';
    bubble.querySelector('.bubble-btn').textContent = I18N.t('tutorial_dismiss');
    const btn = document.querySelector('.auto-battle-btn');
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
// Hide the top tutorial hint
    const screenX = rect.left - 10;
    const screenY = rect.top + rect.height / 2;

    bubble.querySelector('.bubble-text').textContent = text;
    bubble.style.left = screenX + 'px';
    bubble.style.top = screenY + 'px';
    bubble.style.display = 'block';
    bubble.classList.add('arrow-right');
    bubble.classList.remove('arrow-down');
}

// Complete the current tutorial step and advance
function hideTutorialTip() {
    const el = document.getElementById('tutorial-tip');
    if (el) {
        el.style.opacity = '0';
        setTimeout(() => el.style.display = 'none', 300);
    }
}

// In the combat stage and already in the dungeon: show the top hint
function advanceTutorial(completedStep) {
    if (player.tutorial.completed) return;
    if (completedStep !== player.tutorial.step) return;

    hideTutorialTip();
    hideTutorialBubble();
    player.tutorial.step++;

    const totalSteps = TUTORIAL_TOWN_STEPS.length + getTutorialBattleSteps().length;
    if (player.tutorial.step >= totalSteps) {
        player.tutorial.completed = true;
        showNotification('🎉 Tutorial completed! Have a great adventure!');
    } else if (player.tutorial.step >= TUTORIAL_TOWN_STEPS.length && player.floor > 0) {
// Town bubbles update automatically in updateTutorialBubble
        setTimeout(() => showTutorialTip(player.tutorial.step), 800);
    }
// Check and start the tutorial (called after startGame)
}

// Players with progress (kills>0 or floor>0) are marked complete
function checkTutorial() {
    if (player.tutorial.completed) return;
// New players: town bubbles show automatically in updateTutorialBubble
    if (player.kills > 0 || player.floor > 0 || player.maxFloor > 0) {
        player.tutorial.completed = true;
        return;
    }
// ========== Embedded inventory system ==========
}

if (typeof I18N !== 'undefined') {
    I18N.onChange(() => {
        if (window.pendingOfflineRewards && document.getElementById('offline-rewards-overlay')?.classList.contains('active')) {
            OfflineRewards.showPanel(window.pendingOfflineRewards, false);
        }
        if (document.getElementById('death-panel-overlay')?.classList.contains('active')) {
            DeathPanel.show(false);
        }
        if (!player?.tutorial || player.tutorial.completed) return;

        const bubble = document.getElementById('tutorial-bubble');
        if (player.tutorial.step < TUTORIAL_TOWN_STEPS.length) {
            if (bubble?.dataset.tutorialKind === 'town' && bubble.style.display !== 'none') updateTutorialBubble();
            return;
        }

        const battleStep = getTutorialBattleSteps().find(step => step.id === player.tutorial.step);
        if (!battleStep) return;
        const tip = document.getElementById('tutorial-tip');
        if (tip && tip.style.display !== 'none') showTutorialTip(player.tutorial.step);
        if (bubble?.dataset.tutorialKind === 'battle' && bubble.style.display !== 'none') {
            showAutoBattleTutorialBubble(battleStep.text);
        }
    });
}

// Sell-confirm state: the slot index awaiting confirmation; -1 means none
// Decide whether an item needs sell confirmation (set or enhanced gear)
let pendingSellConfirmIdx = -1;

// Render the embedded inventory (for shop/stash/forge panels)
function needsSellConfirm(item) {
    if (!item) return false;
    return item.rarity === 5 || (item.enhanceLvl && item.enhanceLvl > 0);
}

// Rarity styles
function renderEmbeddedBag(panelType) {
    const gridId = {
        'shop': 'shop-embedded-bag',
        'stash': 'stash-embedded-bag',
        'blacksmith': 'forge-embedded-bag',
        'stall': 'stall-inventory-grid'
    }[panelType];

    const grid = document.getElementById(gridId);
    if (!grid) return;

    grid.innerHTML = '';

    player.inventory.forEach((item, idx) => {
        const slot = document.createElement('div');
        slot.className = 'embedded-bag-slot';

        if (item) {
            // raritystyle
            if (item.rarity >= 3 && item.rarity <= 4) slot.classList.add('rarity-unique');
            else if (item.rarity === 5) slot.classList.add('rarity-set');
            else if (item.rarity === 2) slot.classList.add('rarity-rare');

            applyItemSpriteToElement(slot, item);

// Shop panel: show the sell confirm button
            if (item.quantity && item.quantity > 1) {
                slot.innerHTML += `<span class="item-count">${item.quantity}</span>`;
            }
            if (item.enhanceLvl > 0) {
                slot.innerHTML += `<span class="enhance-level">+${item.enhanceLvl}</span>`;
            }

// Confirm the sale
            if (panelType === 'shop' && pendingSellConfirmIdx === idx) {
                slot.classList.add('sell-pending');
                const confirmBtn = document.createElement('div');
                confirmBtn.className = 'sell-confirm-btn';
                confirmBtn.textContent = 'Confirm';
                confirmBtn.onclick = (e) => {
                    e.stopPropagation();
                    // confirmsell
                    sellItemFromInventory(idx);
                    pendingSellConfirmIdx = -1;
                    renderEmbeddedBag(panelType);
                };
                slot.appendChild(confirmBtn);

// Normal click events
                slot.onclick = (e) => {
                    e.stopPropagation();
                    pendingSellConfirmIdx = -1;
                    renderEmbeddedBag(panelType);
                };
            } else {
// Bind the tooltip
                slot.onclick = (e) => {
                    e.stopPropagation();
                    handleEmbeddedBagClick(panelType, idx);
                };
            }

            // bindtooltip
            bindItemTooltip(slot, item);
        }

        grid.appendChild(slot);
    });

// Handle embedded inventory item clicks
    const goldDisplayIds = {
        'shop': 'shop-gold-display',
        'stash': 'stash-gold-display',
        'forge': 'forge-gold-display',
        'market': 'market-gold-display'
    };
    const goldDisplayId = goldDisplayIds[panelType];
    if (goldDisplayId) {
        const goldDisplay = document.getElementById(goldDisplayId);
        if (goldDisplay) goldDisplay.textContent = 'Gold: ' + player.gold;
    }
}

// Set or enhanced gear requires a second confirmation
function handleEmbeddedBagClick(panelType, idx) {
    const item = player.inventory[idx];
    if (!item) return;

    switch (panelType) {
        case 'shop':
// Don't hide the tooltip; wait for confirmation
            if (needsSellConfirm(item)) {
                pendingSellConfirmIdx = idx;
                renderEmbeddedBag(panelType);
                return; // Normal items sell instantly
            }
// Store into the stash
            sellItemFromInventory(idx);
            break;
        case 'stash':
// Add to forge slot
            moveItemToStash(idx);
            break;
        case 'blacksmith':
            // Add to forge slot
            moveItemToForge(idx);
            break;
        case 'stall':
            // onrackarrive atstallslot
            if (typeof MarketSystem !== 'undefined') {
                MarketSystem.addToShelf(idx);
            }
            break;
    }

    // hidetooltip
    hideTooltip();

// Sell the item from the inventory (shop panel)
    renderEmbeddedBag(panelType);
}

// Clear the confirm state and tooltip
function sellItemFromInventory(idx) {
    const item = player.inventory[idx];
    if (!item) return;

// Compute sale price
    pendingSellConfirmIdx = -1;
    hideTooltip();

    // Compute sale price
    let val = 50;
    if (item.rarity > 1) val *= item.rarity * 2;

    addGold(val);

    if (item.stackable && item.quantity > 1) {
        item.quantity--;
    } else {
        player.inventory[idx] = null;
    }

    createDamageNumber(player.x, player.y - 40, `+${val} G`, 'gold');
    AudioSys.play('gold');
    renderInventory();
    updateBeltUI();
}

// Item type sort priority
// Get the item's sort key
const SLOT_SORT_ORDER = {
    'mainhand': 0, 'helm': 1, 'body': 2, 'offhand': 3,
    'gloves': 4, 'belt': 5, 'boots': 6, 'ring': 7, 'amulet': 8,
    'potion': 10, 'scroll': 11
};

// Consumables
function getItemSortKey(item) {
    if (!item) return { type: 999, rarity: 0, enhance: 0, name: '' };

    // consumable
    if (item.type === 'potion') return { type: 10, rarity: 0, enhance: 0, name: item.name };
    if (item.type === 'scroll') return { type: 11, rarity: 0, enhance: 0, name: item.name };

    // gear
    const slotOrder = SLOT_SORT_ORDER[item.slot] ?? 9;
    const rarity = item.rarity ?? 0;
    const enhance = item.enhanceLevel ?? 0;

    return { type: slotOrder, rarity, enhance, name: item.name || '' };
}

// 1. Sort by type/slot
function compareItems(a, b) {
    const keyA = getItemSortKey(a);
    const keyB = getItemSortKey(b);

    // 1. bytype/slotsort
    if (keyA.type !== keyB.type) return keyA.type - keyB.type;

// 3. Same rarity: enhance level descending
    if (keyA.rarity !== keyB.rarity) return keyB.rarity - keyA.rarity;

// 4. Sort by name
    if (keyA.enhance !== keyB.enhance) return keyB.enhance - keyA.enhance;

    // 4. bynamesort
    return keyA.name.localeCompare(keyB.name);
}

// Extract all non-empty items
function sortInventory() {
// Sort
    const items = player.inventory.filter(item => item !== null);

    // sort
    items.sort(compareItems);

// Organize the stash
    const size = player.inventory.length;
    player.inventory = [];
    for (let i = 0; i < size; i++) {
        player.inventory[i] = items[i] || null;
    }

    renderInventory();
    showNotification('Inventory sorted');
    AudioSys.play('gold');
}
// Extract all non-empty items
function sortStash() {
// Sort
    const items = player.stash.filter(item => item !== null);

    // sort
    items.sort(compareItems);

    // re-newfillstash
    const size = player.stash.length;
    player.stash = [];
    for (let i = 0; i < size; i++) {
        player.stash[i] = items[i] || null;
    }

    renderStash();
    showNotification('Stash sorted');
    AudioSys.play('gold');
}

// Refresh the cache once the area's assets finish loading; failures already log via the asset loader boundaryttell，notableblockceasedsuccessplainmaterialShow。
window.addEventListener('art-atlas-loaded', renderMonsterIcons);
Promise.allSettled([ArtSamples.ready, EnvironmentArt.ready]).then(() => {
    if (gameActive && mapData.length > 0) generateMapCache();
    renderMonsterIcons();
});
