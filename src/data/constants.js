// ========== Game configuration constants ==========

// Monster spawning
const GAME_CONFIG = {
// Monster spawning
    ELITE_SPAWN_RATE: 0.1,              // Elite spawn chance 10%
    DOUBLE_AFFIX_RATE: 0.3,             // Double-affix chance 30%
    MAX_ENEMIES: 80,                    // Max monster count (60x60 map)
    INITIAL_ENEMIES: 36,                // Initial spawn count on floor entry (60x60 map)
    ENEMY_SPAWN_INTERVAL: 1000,         // monster spawninterval(ms)
    ENEMY_SPAWN_MIN_DISTANCE: 260,      // Min monster spawn distance
    ENEMY_SPAWN_BATCH_SIZE: 3,          // normal mode dynamic per-wave respawn count
    AUTO_BATTLE_SPAWN_BATCH_SIZE: 6,    // auto battle dynamic per-wave respawn count
    AUTO_BATTLE_ENEMY_TARGET: 70,       // Monster count auto battle maintains

// Gamble chance
    GAMBLE_RARE_RATE: 0.3,              // Gamble rare chance 30%
    GAMBLE_UNIQUE_RATE: 0.05,           // Gamble unique chance 5%

// Auto battle thresholds
    AUTO_POTION_HP_THRESHOLD: 0.3,      // drink red potion at 30%
    AUTO_POTION_MP_THRESHOLD: 0.2,      // drink blue potion at 20%
    AUTO_EMERGENCY_HP: 0.15,            // 15% emergency town portal
    AUTO_KEEP_DISTANCE: 150,            // keepdistance150

    // monsterAIdistance
    MONSTER_MELEE_RANGE: 40,            // meleeattack distance (40²=1600)
    MONSTER_MELEE_RANGE_SQ: 1600,       // Melee attack distance squared (performance)
    MONSTER_CHASE_RANGE: 400,           // Chase range (400²=160000)
    MONSTER_CHASE_RANGE_SQ: 160000,     // Chase range squared
    MONSTER_DISENGAGE_RANGE: 35,        // Drop-combat distance (35²=1225)
    MONSTER_DISENGAGE_RANGE_SQ: 1225,   // Drop-combat distance squared
    MONSTER_RANGED_RETREAT: 150,        // Ranged retreat distance
    MONSTER_RANGED_MAX: 400,            // Ranged max attack distance
    PLAYER_MELEE_NO_LOS_RANGE: 50,      // Distance allowing corner basic attacks without line of sight

// Physical sweep: crowd-clearing power after basic-attack growth
    PHYSICAL_SWEEP_TIER1_LEVEL: 6,       // Cleave unlock level
    PHYSICAL_SWEEP_TIER1_STR: 35,        // Cleave strength threshold
    PHYSICAL_SWEEP_TIER2_LEVEL: 12,      // Half-Moon Slash unlock level
    PHYSICAL_SWEEP_TIER2_STR: 60,        // Half-Moon Slash strength threshold
    PHYSICAL_SWEEP_TIER3_LEVEL: 20,      // Sweeping Blade unlock level
    PHYSICAL_SWEEP_TIER3_STR: 90,        // Sweeping Blade strength threshold
    PHYSICAL_SWEEP_PRESSURE_RADIUS: 170, // Nearby radius to judge being swarmed
    PHYSICAL_SWEEP_TRIGGER_ENEMIES: 3,   // Sweep triggers with at least 3 nearby enemies
    PHYSICAL_SWEEP_TIER1_RANGE: 118,     // Cleave range
    PHYSICAL_SWEEP_TIER2_RANGE: 142,     // Half-Moon Slash range
    PHYSICAL_SWEEP_TIER3_RANGE: 168,     // Sweeping Blade range
    PHYSICAL_SWEEP_TIER1_ARC: 2.35,      // Cleave arc
    PHYSICAL_SWEEP_TIER2_ARC: 3.35,      // Half-Moon Slash arc
    PHYSICAL_SWEEP_TIER3_ARC: 4.7,       // Sweeping Blade arc
    PHYSICAL_SWEEP_TIER1_MAX_TARGETS: 2, // Cleave extra target cap
    PHYSICAL_SWEEP_TIER2_MAX_TARGETS: 4, // Half-Moon Slash extra target cap
    PHYSICAL_SWEEP_TIER3_MAX_TARGETS: 6, // Sweeping Blade extra target cap
    PHYSICAL_SWEEP_TIER1_DAMAGE_RATIO: 0.45,
    PHYSICAL_SWEEP_TIER2_DAMAGE_RATIO: 0.6,
    PHYSICAL_SWEEP_TIER3_DAMAGE_RATIO: 0.75,

// Interaction distance
    INTERACTION_RANGE: 60,              // Generic interaction distance
    NPC_INTERACTION_RANGE: 80,          // NPC interaction distance
    PORTAL_INTERACTION_RANGE: 60,       // Portal interaction distance

// Pickup distance
    PICKUP_RANGE: 400,                  // Auto-pickup detection distance
    PICKUP_MOVE_RANGE: 40,              // Distance to move to an item for pickup

    // autosave
    AUTO_SAVE_INTERVAL: 30,             // Autosave interval (seconds)// Item despawn time
    ITEM_DESPAWN_SET: 10 * 60 * 1000,   // Set items 10 minutes
    ITEM_DESPAWN_UNIQUE: 3 * 60 * 1000, // Unique items 3 minutes
    ITEM_DESPAWN_RARE: 2 * 60 * 1000,  // Rare items 2 minutes
    ITEM_DESPAWN_COMMON: 1 * 60 * 1000, // Normal items 1 minute

// ===== Attribute curve =====
// Single source of truth for how str/dex/vit/ene turn into combat stats.
// updateStats() only reads these; tools/test-attribute-curve.js locks them.
//
// STR damage is a concave power curve: STR_DAMAGE_SCALE * str ^ STR_DAMAGE_EXP.
// The exponent is below 1, so every point is worth slightly less than the last
// (diminishing returns) while still growing without a hard ceiling. It used to
// be (str / 5) * (1 + str * 0.05), whose multiplier compounded and made STR the
// only stat worth taking. Gear's dmgPct now carries the multiplicative growth.
    ATTRIBUTE_CURVE: {
        START: { str: 15, dex: 15, vit: 20, ene: 10 },
        POINTS_PER_LEVEL: 5,
        STR_DAMAGE_SCALE: 0.6,           // weapon damage += 0.6 * str ^ 0.9
        STR_DAMAGE_EXP: 0.9,             // < 1 gives diminishing returns
        VIT_HP_PER_POINT: 5,             // max hp = vit * 5
        ENE_MP_PER_POINT: 3,             // max mp = ene * 3
        DEX_ARMOR_PER_POINT: 1,          // armor += dex
        DEX_CRIT_PER_POINT: 0.5,         // crit chance += dex * 0.5
        CRIT_BASE: 5,                    // crit chance floor before dex
        CRIT_CAP: 100,                   // crit chance hard cap
        // Crit chance stops scaling at dex 190, so the points past it used to be
        // dead. Only the overflow converts, and only into crit damage:
        // builds at or under 190 dex keep exactly the stats they had before.
        DEX_CRIT_DAMAGE_PER_POINT: 0.2,  // crit damage += (dex - 190) * 0.2
        DEX_CRIT_DAMAGE_CAP: 100         // matches the best 4-piece set bonus
    },

// ===== Level curve =====
// Single source of truth for what a level costs and what it gives back.
// updateStats(), checkLevelUp(), the offline reward claim and the save
// migration all read this, so they cannot drift apart again.
//
// XP is polynomial, not exponential. It used to compound by 1.38 per level
// while monster XP only grew linearly with the floor (20 + floor * 5), so the
// kills needed per level exploded: ~650 at level 20, ~12k at 30, ~4.9M at 50.
// The game was effectively unplayable past level 30. A quadratic requirement
// divided by a linear income gives a linear grind, which stays viable forever.
//
// Every per-level term is (level - 1) based, so a fresh level-1 character
// gets exactly 0 and early game is untouched.
    LEVEL_CURVE: {
        XP_BASE: 100,          // XP to go from level 1 to 2
        XP_LINEAR: 60,         // + per level
        XP_QUADRATIC: 3.75,    // + per level squared
        DAMAGE_PER_LEVEL: 0.4, // weapon damage += 0.4 per level above 1
        HP_PER_LEVEL: 10,      // max hp += 10 per level above 1
        MP_PER_LEVEL: 5,       // max mp += 5 per level above 1

        // XP required to leave `level` and reach level + 1.
        // Closed form, not a running product: claiming offline rewards used to
        // recompute this with a 1.15 curve and permanently collapse the bar.
        getXpForLevel(level) {
            const n = Math.max(0, (Math.floor(level) || 1) - 1);
            return Math.floor(this.XP_BASE + this.XP_LINEAR * n + this.XP_QUADRATIC * n * n);
        }
    },

    // visualeffect
    LOW_HP_THRESHOLD: 0.2,              // Low-HP warning threshold 20%
    CAMERA_SMOOTH: 0.1                  // Camera smoothing factor
};

// Skill tree constants
const SKILL_TREE_MAX_LEVEL = 5;  // Max level per stage

// ========== Floor tile type configuration ==========

// Registry of distinct floor tile types that can be added without changing the
// tile indexing functions. Each entry needs a unique id and a friendly name for
// the UI/map tools. New entries are also automatically included in the
// FLOOR_TILE_IDS list so new tile types do not require changes in the
// texture-indexing functions.
const FLOOR_TILE = {
    // Existing types
    camp: { id: 'camp', name: 'Camp (Grass)' },
    stone: { id: 'stone', name: 'Stone' },

    // Reserved/new tile type
    lava: { id: 'lava', name: 'Lava', color: '#8a2a12', darkColor: '#4a1407' }
};

// Explicit list of known floor tile type ids. Keeping this in one place makes
// it easier to add a new tile type later, because only FLOOR_TILE needs to be
// updated. If you add an entry to FLOOR_TILE, add its id here too.
const FLOOR_TILE_IDS = [
    FLOOR_TILE.camp.id,
    FLOOR_TILE.stone.id,
    FLOOR_TILE.lava.id
];

// Read-only floor tile type per level. A real map or level loader can set this
// through the same interface that chooses floor textures, without touching the
// tile matrix. Levels 0 and 1 use 'camp' and 'stone' respectively; later
// floors use the new lava tile type placeholder.
function getFloorTileType(floor) {
    switch (floor) {
        case 0: return 'camp';   // Rogue Encampment (grass)
        case 1: return 'stone';  // normal dungeon floor (stone)
        default: return 'lava';  // placeholder new floor tile type (lava)
    }
}

