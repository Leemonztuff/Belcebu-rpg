// ========== Global constants ==========
// raritylevel
const RARITY = {
    COMMON: 0,      // normal(plain)
    NORMAL: 1,      // normalenhance(plain)
    MAGIC: 2,       // Magic(blue)
    RARE: 3,        // rare(yellow)
    UNIQUE: 4,      // Unique(gold coin)
    SET: 5          // set(green)
};

// item type
const ITEM_TYPE = {
    WEAPON: 'weapon',
    ARMOR: 'armor',
    HELM: 'helm',
    BELT: 'belt',
    GLOVES: 'gloves',
    BOOTS: 'boots',
    RING: 'ring',
    AMULET: 'amulet',
    POTION: 'potion',
    SCROLL: 'scroll',
    GOLD: 'gold'
};

// Consumable names
const CONSUMABLE_NAME = {
    HEALTH_POTION: 'Health Potion',
    MANA_POTION: 'Mana Potion',
    TOWN_PORTAL: 'Town Portal Scroll'
};

// Helper: check whether an item is protected (cannot be dropped)
function isProtectedItem(item) {
    if (!item) return false;
    return item.rarity >= RARITY.UNIQUE ||
        item.name === CONSUMABLE_NAME.HEALTH_POTION ||
        item.name === CONSUMABLE_NAME.MANA_POTION ||
        item.name === CONSUMABLE_NAME.TOWN_PORTAL;
}

const TILE_SIZE = 40;
const MAP_WIDTH = 60;
const MAP_HEIGHT = 60;

const COLORS = {
    // basecolor
    white: '#ffffff',
    blue: '#4850b8',
    yellow: '#ffff00',
    gold: '#908858',
    red: '#c23b22',
    green: '#00ff00',
    ice: '#00ccff',

    // mapelemental
    floor: '#0c0c0c',
    floorAlt: '#080808',
    wall: '#2C2C2C',
    townFloor: '#1a1a1a',
    exit: '#0055aa',
    entrance: '#aa5500',

    // raritycolor（item）
    rarityCommon: '#ffffff',     // white
    rarityMagic: '#4850b8',      // blue
    rarityRare: '#ffff00',       // yellow
    rarityUnique: '#908858',     // Unique
    raritySet: '#20ff20',        // set green

// Combat feedback
    damage: '#ff0000',           // damage numbers
    critical: '#ffff00',         // crit
    heal: '#00ff00',             // healing
    thornsDamage: '#88ff88',     // thorns reflect
    manaCost: '#0066ff',         // mana cost
    revive: '#ff00ff',           // revive

    // toast/warning
    warning: '#ff4444',          // warnings (inventory full etc.)
    error: '#ff0000',            // error
    success: '#00ff00',          // success
    info: '#4d94ff',             // info

    // elemental damage
    fire: '#ff4400',             // fire
    lightning: '#ffff00',        // lightning
    cold: '#00ccff',             // frost
    poison: '#00ff00',           // poison

    // NPC/enemy
    npc: '#00ff00',              // NPC markers
    enemy: '#ff0000',            // enemy
    boss: '#ff00ff',             // BOSS
    elite: '#ffaa00'             // elite
};

// Helper: get color by rarity
function getRarityColor(rarity) {
    const colorMap = {
        [RARITY.COMMON]: COLORS.rarityCommon,
        [RARITY.NORMAL]: COLORS.rarityCommon,
        [RARITY.MAGIC]: COLORS.rarityMagic,
        [RARITY.RARE]: COLORS.rarityRare,
        [RARITY.UNIQUE]: COLORS.rarityUnique,
        [RARITY.SET]: COLORS.raritySet
    };
    return colorMap[rarity] || COLORS.white;
}

// ========== Floor name configuration ==========
const FLOOR_NAMES = {
// Forest biome (floors 1-10)
    forest: [
        'Blood Moor',     // 1
        'Dark Wood',     // 2
        'Spider Cavern',     // 3
        'Forgotten Tower',     // 4
        'Corrupted Temple',     // 5
        'Poison Bog',     // 6
        'Deadwood Graveyard',     // 7
        'Heart of the Tree',     // 8
        'Druid Sanctuary',   // 9
        'World Tree'      // 10
    ],
// Tundra biome (floors 11-20)
    ice: [
        'Frozen Pass',     // 11
        'Frostwolf Den',     // 12
        'Glacial Ruins',     // 13
        'Frozen Crypt',     // 14
        'Blizzard Altar',     // 15
        'Crystal Cavern',     // 16
        'Frigid Abyss',     // 17
        'Frost Throne',     // 18
        'Winter Temple',     // 19
        'Frozen Sanctuary'      // 20
    ],
// Lava biome (floors 21+, looping)
    fire: [
        'Scorching Chasm',     // 21/31/41...
        'Lava Valley',     // 22/32/42...
        'Burning Mine',     // 23/33/43...
        'Flame Altar',     // 24/34/44...
        'Brimstone Abyss',     // 25/35/45...
        'Demon Forge',     // 26/36/46...
        'Ruin Cathedral',     // 27/37/47...
        'Purgatory Heart',     // 28/38/48...
        'Chaos Rift',     // 29/39/49...
        'Worldstone'      // 30/40/50...
    ],
// Cycle prefix (after floor 21, one cycle per 10 floors)
    cyclePrefix: ['', 'Abyssal', 'Void', 'Eternal', 'Chaos', 'Doomsday']
};

// Get the name for a floor
// Waypoint system configuration
const WAYPOINT_CONFIG = {
// Floor a waypoint sits on (0 = Rogue Encampment, others are normal dungeon floors)
    floors: [0, 1, 3, 5, 7, 10],
// Level labels and icons
    floorIcons: {
        0: '⛺',
        1: '🌲',
        3: '🏰',
        5: '🥩',
        7: '🕳️',
        10: '👑'
    }
};

function getFloorName(floor, isHell = false) {
    if (typeof I18N !== 'undefined' && I18N.getFloorName) {
        return I18N.getFloorName(floor, isHell);
    }
    if (floor <= 0) return 'Rogue Encampment';

// Hell mode: always use lava names
    if (isHell) {
        const index = ((floor - 1) % 10);
        return `Hell · ${FLOOR_NAMES.fire[index]}`;
    }

// Forest biome 1-10
    if (floor <= 10) {
        return FLOOR_NAMES.forest[floor - 1];
    }

// Tundra biome 11-20
    if (floor <= 20) {
        return FLOOR_NAMES.ice[floor - 11];
    }

// Lava biome 21+ (looping)
    const fireIndex = ((floor - 21) % 10);
    const cycle = Math.floor((floor - 21) / 10);  // 0=firstorder, 1=abyss, 2=weakvoid...
    const prefix = FLOOR_NAMES.cyclePrefix[Math.min(cycle, FLOOR_NAMES.cyclePrefix.length - 1)];

    if (prefix) {
        return `${prefix}·${FLOOR_NAMES.fire[fireIndex]}`;
    }
    return FLOOR_NAMES.fire[fireIndex];
}

// ========== Skill configuration ==========
const SKILL_CONFIG = {
    fireball: {
        baseMana: 10,
        manaPerLevel: 0,        // Fixed cost
        range: 450,
        cooldown: 0.5,
        explosionLevel: 3       // Explosion unlocked at level 3 (early QoL)
    },
    thunder: {
        baseMana: 8,
        manaPerLevel: 0.5,
        range: 190,
        cooldown: 0.8
    },
    multishot: {
        baseMana: 10,
        manaPerLevel: 0,
        range: 500,
        cooldown: 1.0
    }
};

// Utility functions:Calcskillmana cost
function getSkillManaCost(skillName, level) {
    const config = SKILL_CONFIG[skillName];
    if (!config) return 10;
    return config.baseMana + (level - 1) * config.manaPerLevel;
}

// Skill tree copy routing: SKILL_TREE name/desc are data fields, but every display site
// (renderSkillTree, confirmSkillChoice, selectSkillBranch) reads them directly,
// so getters hook the data layer to the skillTree table; ids, tiers and effect numbers stay untouched.
// Panels redraw often, so resolved results are cached per language to avoid splitting path strings on every read;
// a language change invalidates the whole cache and getters pick up the new language on the next read, with no onChange rewiring.
const SKILL_TREE_TEXT = { lang: '', map: Object.create(null) };
function skillTreeText(branch, path, zhText) {
    if (typeof I18N === 'undefined' || typeof I18N.trPath !== 'function') return zhText;
    if (SKILL_TREE_TEXT.lang !== I18N.currentLang) {
        SKILL_TREE_TEXT.lang = I18N.currentLang;
        SKILL_TREE_TEXT.map = Object.create(null);
    }
    const cacheKey = branch + '/' + path;
    const cached = SKILL_TREE_TEXT.map[cacheKey];
    if (cached !== undefined) return cached;
    const text = I18N.trPath('skillTree', branch, path, zhText);
    SKILL_TREE_TEXT.map[cacheKey] = text;
    return text;
}

// ========== Skill tree configuration ==========
const SKILL_TREE = {
    fireball: {
        get name() { return skillTreeText('fireball', 'stage1.fireball.name', 'Fireball'); },
        get desc() { return skillTreeText('fireball', 'stage1.fireball.desc', 'Hurls a fireball at enemies'); },
        stage2: {
            explosion: {
                get name() { return skillTreeText('fireball', 'stage2.explosion.name', 'Empowered Explosion'); },
                get desc() { return skillTreeText('fireball', 'stage2.explosion.desc', '+15% explosion radius and +8% explosion damage per level'); },
                effect: { explosionRadius: 0.15, explosionDamage: 0.08 }
            },
            burn: {
                get name() { return skillTreeText('fireball', 'stage2.burn.name', 'Burn'); },
                get desc() { return skillTreeText('fireball', 'stage2.burn.desc', 'Applies a burn DoT: 6% damage per second per level, lasting 2 + 0.4s per level'); },
                effect: { burnDPS: 0.06, burnDuration: 0.4, burnBase: 2 }
            }
        },
        stage3: {
            explosion: {
                meteor: {
                    get name() { return skillTreeText('fireball', 'stage3.meteor.name', 'Meteor'); },
                    get desc() { return skillTreeText('fireball', 'stage3.meteor.desc', 'The fireball becomes a meteor: +100% explosion damage and the impact point burns for 3s'); },
                    effect: { meteorMode: true, explosionBonus: 1.0, groundFire: 3 }
                },
                nova: {
                    get name() { return skillTreeText('fireball', 'stage3.nova.name', 'Fire Nova'); },
                    get desc() { return skillTreeText('fireball', 'stage3.nova.desc', 'On cast, a wave of fire erupts centered on yourself'); },
                    effect: { novaMode: true, novaDamageRatio: 0.5, knockback: true }
                }
            },
            burn: {
                spread: {
                    get name() { return skillTreeText('fireball', 'stage3.spread.name', 'Spread'); },
                    get desc() { return skillTreeText('fireball', 'stage3.spread.desc', 'Burn spreads to nearby enemies at 60% damage'); },
                    effect: { burnSpread: true, spreadRatio: 0.6 }
                },
                detonate: {
                    get name() { return skillTreeText('fireball', 'stage3.detonate.name', 'Immolate'); },
                    get desc() { return skillTreeText('fireball', 'stage3.detonate.desc', 'Burning enemies take +30% fire damage and explode when the burn ends'); },
                    effect: { burnAmplify: 0.3, burnDetonate: true }
                }
            }
        }
    },
    thunder: {
        get name() { return skillTreeText('thunder', 'stage1.thunder.name', 'Lightning Strike'); },
        get desc() { return skillTreeText('thunder', 'stage1.thunder.desc', 'Calls down lightning to strike enemies'); },
        stage2: {
            chain: {
                get name() { return skillTreeText('thunder', 'stage2.chain.name', 'Chain Lightning'); },
                get desc() { return skillTreeText('thunder', 'stage2.chain.desc', '+1 chain target and -5% chain falloff per level'); },
                effect: { chainTargets: 1, chainDecayReduce: 0.05 }
            },
            shock: {
                get name() { return skillTreeText('thunder', 'stage2.shock.name', 'Shock'); },
                get desc() { return skillTreeText('thunder', 'stage2.shock.desc', 'Paralyzes for 0.3 + 0.1s and takes 10% more lightning damage per level'); },
                effect: { stunBase: 0.3, stunPerLevel: 0.1, lightningAmp: 0.1 }
            }
        },
        stage3: {
            chain: {
                storm: {
                    get name() { return skillTreeText('thunder', 'stage3.storm.name', 'Thunderstorm'); },
                    get desc() { return skillTreeText('thunder', 'stage3.storm.desc', 'Creates a 3s storm that strikes with lightning every 0.5s and slows enemies by 30%'); },
                    effect: { stormMode: true, stormDuration: 3, stormInterval: 0.5, slowAmount: 0.3 }
                },
                overload: {
                    get name() { return skillTreeText('thunder', 'stage3.overload.name', 'Overload'); },
                    get desc() { return skillTreeText('thunder', 'stage3.overload.desc', 'Explodes on kill for 10% of the enemy max HP'); },
                    effect: { killExplode: true, explodeHpRatio: 0.1 }
                }
            },
            shock: {
                torture: {
                    get name() { return skillTreeText('thunder', 'stage3.torture.name', 'Electrocution'); },
                    get desc() { return skillTreeText('thunder', 'stage3.torture.desc', 'Shocked enemies keep losing HP every second equal to 20% of the lightning damage'); },
                    effect: { shockDOT: true, shockDPS: 0.2 }
                },
                shield: {
                    get name() { return skillTreeText('thunder', 'stage3.shield.name', 'Arc Shield'); },
                    get desc() { return skillTreeText('thunder', 'stage3.shield.desc', 'Landing a hit grants a shield equal to 15% of the damage and grants control immunity while it lasts'); },
                    effect: { arcShield: true, shieldRatio: 0.15, immuneCC: true }
                }
            }
        }
    },
    multishot: {
        get name() { return skillTreeText('multishot', 'stage1.multishot.name', 'Multishot'); },
        get desc() { return skillTreeText('multishot', 'stage1.multishot.desc', 'Fires a fan of arrows'); },
        stage2: {
            pierce: {
                get name() { return skillTreeText('multishot', 'stage2.pierce.name', 'Pierce'); },
                get desc() { return skillTreeText('multishot', 'stage2.pierce.desc', 'Pierces +1 enemy and loses 4% less damage per level'); },
                effect: { pierceTargets: 1, pierceDecayReduce: 0.04 }
            },
            spread: {
                get name() { return skillTreeText('multishot', 'stage2.spread.name', 'Spread'); },
                get desc() { return skillTreeText('multishot', 'stage2.spread.desc', '+1 extra arrow and +5° spread angle per level'); },
                effect: { extraArrows: 1, spreadAngle: 5 }
            }
        },
        stage3: {
            pierce: {
                rain: {
                    get name() { return skillTreeText('multishot', 'stage3.rain.name', 'Arrow Rain'); },
                    get desc() { return skillTreeText('multishot', 'stage3.rain.desc', 'Arrows split and rain from the sky, dealing 60% of single-arrow damage over the area'); },
                    effect: { rainMode: true, rainDamageRatio: 0.6 }
                },
                snipe: {
                    get name() { return skillTreeText('multishot', 'stage3.snipe.name', 'Snipe'); },
                    get desc() { return skillTreeText('multishot', 'stage3.snipe.desc', 'Hold to charge for 2s: +50% damage per second and +3 pierce'); },
                    effect: { snipeMode: true, chargeDamage: 0.5, chargeMaxTime: 2, chargePierce: 3 }
                }
            },
            spread: {
                barrage: {
                    get name() { return skillTreeText('multishot', 'stage3.barrage.name', 'Barrage'); },
                    get desc() { return skillTreeText('multishot', 'stage3.barrage.desc', 'Fires 3 waves 0.2s apart for +80% total damage'); },
                    effect: { barrageMode: true, barrageWaves: 3, barrageInterval: 0.2, barrageDamage: 0.8 }
                },
                split: {
                    get name() { return skillTreeText('multishot', 'stage3.split.name', 'Split Arrow'); },
                    get desc() { return skillTreeText('multishot', 'stage3.split.desc', 'Arrows split into 2 mid-flight, each dealing 50% damage'); },
                    effect: { splitMode: true, splitCount: 2, splitDamage: 0.5 }
                }
            }
        }
    },
    holy_shield: {
        get name() { return skillTreeText('holy_shield', 'stage1.holy_shield.name', 'Holy Shield'); },
        get desc() { return skillTreeText('holy_shield', 'stage1.holy_shield.desc', 'Summons a holy shield that absorbs damage'); },
        stage1: {
            manaCost: 15,
            cooldown: 12,
            shieldRatio: 0.20,
            shieldPerLevel: 0.02,
            duration: 5,
            durationPerLevel: 0.5
        },
        stage2: {
            reflect: {
                get name() { return skillTreeText('holy_shield', 'stage2.reflect.name', 'Reflective Shield'); },
                get desc() { return skillTreeText('holy_shield', 'stage2.reflect.desc', 'Reflects part of the damage back to the attacker'); },
                effect: { reflectRatio: 0.10, reflectPerLevel: 0.03 }
            },
            guard: {
                get name() { return skillTreeText('holy_shield', 'stage2.guard.name', 'Warding Shield'); },
                get desc() { return skillTreeText('holy_shield', 'stage2.guard.desc', 'Heals you when the shield breaks'); },
                effect: { healRatio: 0.10, healPerLevel: 0.02, ccReduction: 0.30, ccPerLevel: 0.05 }
            }
        },
        stage3: {
            reflect: {  // Reflect shield branch - counterattack style
                retribution: {
                    get name() { return skillTreeText('holy_shield', 'stage3.retribution.name', 'Retribution Aura'); },
                    get desc() { return skillTreeText('holy_shield', 'stage3.retribution.desc', 'Pulses damage and slows nearby enemies'); },
                    effect: { auraDamageRatio: 0.02, slowAmount: 0.15, pulseInterval: 2 }
                },
                fortress: {
                    get name() { return skillTreeText('holy_shield', 'stage3.fortress.name', 'Absolute Defense'); },
                    get desc() { return skillTreeText('holy_shield', 'stage3.fortress.desc', 'Immune to critical hits and heals on kill'); },
                    effect: { critImmunity: true, lifestealRatio: 0.05 }
                }
            },
            guard: {  // Guardian shield branch - sustain/survival style
                angel: {
                    get name() { return skillTreeText('holy_shield', 'stage3.angel.name', 'Guardian Angel'); },
                    get desc() { return skillTreeText('holy_shield', 'stage3.angel.desc', 'Grants brief invulnerability after the shield breaks'); },
                    effect: { invincibleDuration: 1.0, movespeedBonus: 0.40, canAttack: false }
                },
                link: {
                    get name() { return skillTreeText('holy_shield', 'stage3.link.name', 'Life Link'); },
                    get desc() { return skillTreeText('holy_shield', 'stage3.link.desc', 'Spawns a secondary shield when the first one breaks'); },
                    effect: { secondaryShieldRatio: 0.30, secondaryDuration: 3 }
                }
            }
        }
    }
};

// Skill tree constants
const SKILL_TREE_MAX_LEVEL = 5;  // Max level per stage

// Helper: get a skill's total level (for compatibility with existing systems)
function getSkillTotalLevel(skillName) {
    if (!player.skillTree || !player.skillTree[skillName]) {
        return player.skills ? player.skills[skillName] || 0 : 0;
    }
    const tree = player.skillTree[skillName];
    return tree.stage1 + (tree.stage2.level || 0) + (tree.stage3.level || 0);
}

// Helper: check whether a stage is unlocked
function isStageUnlocked(skillName, stage) {
    if (!player.skillTree || !player.skillTree[skillName]) return stage === 1;
    const tree = player.skillTree[skillName];
    if (stage === 1) return true;
    if (stage === 2) return tree.stage1 >= SKILL_TREE_MAX_LEVEL;
    if (stage === 3) return tree.stage2.level >= SKILL_TREE_MAX_LEVEL;
    return false;
}

// Helper: get skill tree effect bonuses
function getSkillTreeBonus(skillName) {
    const bonus = {};
    if (!player.skillTree || !player.skillTree[skillName]) return bonus;

    const tree = player.skillTree[skillName];
    const config = SKILL_TREE[skillName];
    if (!config) return bonus;

    // phase2bonus
    if (tree.stage2.chosen && tree.stage2.level > 0) {
        const s2Config = config.stage2[tree.stage2.chosen];
        if (s2Config && s2Config.effect) {
            for (const key in s2Config.effect) {
                bonus[key] = key.endsWith('Base') ? s2Config.effect[key] : s2Config.effect[key] * tree.stage2.level;
            }
        }
    }

// Stage 3 bonus (fixed effect, not per level)
    if (tree.stage3.chosen && tree.stage3.level > 0) {
        const s2Choice = tree.stage2.chosen;
        const s3Config = config.stage3[s2Choice]?.[tree.stage3.chosen];
        if (s3Config && s3Config.effect) {
            for (const key in s3Config.effect) {
// Stage 3 is the ultimate; level only affects whether it activates
                if (typeof s3Config.effect[key] === 'boolean') {
                    bonus[key] = s3Config.effect[key];
                } else {
                    bonus[key] = (bonus[key] || 0) + s3Config.effect[key];
                }
            }
        }
    }

    return bonus;
}

// ========== Game config constants ==========
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

    // visualeffect
    LOW_HP_THRESHOLD: 0.2,              // Low-HP warning threshold 20%
    CAMERA_SMOOTH: 0.1                  // Camera smoothing factor
};

// ========== Talent shop system ==========
// Talent database - purchasable random talents per floor
const TALENTS = {
// Offensive talents
    flame_soul: {
        id: 'flame_soul',
        get name() { return typeof I18N !== 'undefined' ? I18N.getTalentName('flame_soul') : 'Flame Soul'; },
        icon: '🔥',
        get desc() { return typeof I18N !== 'undefined' ? I18N.getTalentDesc('flame_soul') : 'Attacks deal 30% extra fire damage'; },
        tier: 'rare',      // normal/rare/epic/legendary
        price: 150,
        effect: { fireDmgPct: 30 }
    },
    thunder_chain: {
        id: 'thunder_chain',
        get name() { return typeof I18N !== 'undefined' ? I18N.getTalentName('thunder_chain') : 'Chain Lightning'; },
        icon: '⚡',
        get desc() { return typeof I18N !== 'undefined' ? I18N.getTalentDesc('thunder_chain') : 'On kill, shock nearby enemies with lightning'; },
        tier: 'epic',
        price: 200,
        effect: { onKillChainLightning: true }
    },
    executioner: {
        id: 'executioner',
        get name() { return typeof I18N !== 'undefined' ? I18N.getTalentName('executioner') : 'Executioner'; },
        icon: '💀',
        get desc() { return typeof I18N !== 'undefined' ? I18N.getTalentDesc('executioner') : '+100% damage against enemies below 30% HP'; },
        tier: 'rare',
        price: 120,
        effect: { executeDmgPct: 100, executeThreshold: 0.3 }
    },
    berserker: {
        id: 'berserker',
        get name() { return typeof I18N !== 'undefined' ? I18N.getTalentName('berserker') : 'Berserker'; },
        icon: '😡',
        get desc() { return typeof I18N !== 'undefined' ? I18N.getTalentDesc('berserker') : '+50% damage dealt, but take +20% extra damage'; },
        tier: 'rare',
        price: 100,
        effect: { dmgPct: 50, damageTakenPct: 20 }
    },
    critical_master: {
        id: 'critical_master',
        get name() { return typeof I18N !== 'undefined' ? I18N.getTalentName('critical_master') : 'Critical Master'; },
        icon: '🎯',
        get desc() { return typeof I18N !== 'undefined' ? I18N.getTalentDesc('critical_master') : '+15% crit chance and +30% crit damage'; },
        tier: 'epic',
        price: 180,
        effect: { critChance: 15, critDamage: 30 }
    },
    poison_blade: {
        id: 'poison_blade',
        get name() { return typeof I18N !== 'undefined' ? I18N.getTalentName('poison_blade') : 'Poison Blade'; },
        icon: '☠️',
        get desc() { return typeof I18N !== 'undefined' ? I18N.getTalentDesc('poison_blade') : 'Attacks deal 25% poison damage'; },
        tier: 'rare',
        price: 140,
        effect: { poisonDmgPct: 25 }
    },

// Defensive talents
    iron_wall: {
        id: 'iron_wall',
        get name() { return typeof I18N !== 'undefined' ? I18N.getTalentName('iron_wall') : 'Iron Wall'; },
        icon: '🛡️',
        get desc() { return typeof I18N !== 'undefined' ? I18N.getTalentDesc('iron_wall') : '+80 Defense, -10% Move speed'; },
        tier: 'normal',
        price: 80,
        effect: { def: 80, speedPct: -10 }
    },
    vampire: {
        id: 'vampire',
        get name() { return typeof I18N !== 'undefined' ? I18N.getTalentName('vampire') : 'Vampirism'; },
        icon: '🧛',
        get desc() { return typeof I18N !== 'undefined' ? I18N.getTalentDesc('vampire') : '+8% Life leech on hit'; },
        tier: 'rare',
        price: 130,
        effect: { lifeSteal: 8 }
    },
    regeneration: {
        id: 'regeneration',
        get name() { return typeof I18N !== 'undefined' ? I18N.getTalentName('regeneration') : 'Regeneration'; },
        icon: '💚',
        get desc() { return typeof I18N !== 'undefined' ? I18N.getTalentDesc('regeneration') : 'Regenerate 2% max HP per second'; },
        tier: 'rare',
        price: 150,
        effect: { hpRegenPct: 2 }
    },
    elemental_shield: {
        id: 'elemental_shield',
        get name() { return typeof I18N !== 'undefined' ? I18N.getTalentName('elemental_shield') : 'Elemental Ward'; },
        icon: '🌈',
        get desc() { return typeof I18N !== 'undefined' ? I18N.getTalentDesc('elemental_shield') : '+25% to all elemental resistances'; },
        tier: 'epic',
        price: 200,
        effect: { allRes: 25 }
    },
    thorns: {
        id: 'thorns',
        get name() { return typeof I18N !== 'undefined' ? I18N.getTalentName('thorns') : 'Steel Thorns'; },
        icon: '🌵',
        get desc() { return typeof I18N !== 'undefined' ? I18N.getTalentDesc('thorns') : 'Reflect 20% of received damage to attackers'; },
        tier: 'normal',
        price: 90,
        effect: { thornsPct: 20 }
    },

// Utility talents
    magnet: {
        id: 'magnet',
        get name() { return typeof I18N !== 'undefined' ? I18N.getTalentName('magnet') : 'Loot Magnet'; },
        icon: '🧲',
        get desc() { return typeof I18N !== 'undefined' ? I18N.getTalentDesc('magnet') : 'Double auto-pickup range'; },
        tier: 'normal',
        price: 50,
        effect: { pickupRange: 2 }
    },
    greed: {
        id: 'greed',
        get name() { return typeof I18N !== 'undefined' ? I18N.getTalentName('greed') : 'Greed'; },
        icon: '💰',
        get desc() { return typeof I18N !== 'undefined' ? I18N.getTalentDesc('greed') : '+50% gold dropped by enemies'; },
        tier: 'normal',
        price: 60,
        effect: { goldPct: 50 }
    },
    treasure_hunter: {
        id: 'treasure_hunter',
        get name() { return typeof I18N !== 'undefined' ? I18N.getTalentName('treasure_hunter') : 'Treasure Hunter'; },
        icon: '🗝️',
        get desc() { return typeof I18N !== 'undefined' ? I18N.getTalentDesc('treasure_hunter') : '+30% equipment drop chance'; },
        tier: 'rare',
        price: 160,
        effect: { dropRatePct: 30 }
    },
    swift: {
        id: 'swift',
        get name() { return typeof I18N !== 'undefined' ? I18N.getTalentName('swift') : 'Swiftness'; },
        icon: '💨',
        get desc() { return typeof I18N !== 'undefined' ? I18N.getTalentDesc('swift') : '+25% movement speed'; },
        tier: 'normal',
        price: 70,
        effect: { speedPct: 25 }
    },
    mana_flow: {
        id: 'mana_flow',
        get name() { return typeof I18N !== 'undefined' ? I18N.getTalentName('mana_flow') : 'Mana Flow'; },
        icon: '🔮',
        get desc() { return typeof I18N !== 'undefined' ? I18N.getTalentDesc('mana_flow') : '+50 Max mana and +3% mana regen'; },
        tier: 'rare',
        price: 120,
        effect: { maxMp: 50, mpRegenPct: 3 }
    },

// Special/legendary talents
    gambler: {
        id: 'gambler',
        get name() { return typeof I18N !== 'undefined' ? I18N.getTalentName('gambler') : 'Gambler'; },
        icon: '🎰',
        get desc() { return typeof I18N !== 'undefined' ? I18N.getTalentDesc('gambler') : 'Damage dealt randomly varies between 0.5x and 2.0x'; },
        tier: 'epic',
        price: 100,
        effect: { gamblerDamage: true }
    },
    glass_cannon: {
        id: 'glass_cannon',
        get name() { return typeof I18N !== 'undefined' ? I18N.getTalentName('glass_cannon') : 'Glass Cannon'; },
        icon: '💣',
        get desc() { return typeof I18N !== 'undefined' ? I18N.getTalentDesc('glass_cannon') : '+100% damage, -30% max HP'; },
        tier: 'legendary',
        price: 500,
        effect: { dmgPct: 100, maxHpPct: -30 }
    },
    phoenix: {
        id: 'phoenix',
        get name() { return typeof I18N !== 'undefined' ? I18N.getTalentName('phoenix') : 'Phoenix'; },
        icon: '🔥',
        get desc() { return typeof I18N !== 'undefined' ? I18N.getTalentDesc('phoenix') : 'Revive once with 50% HP upon fatal blow'; },
        tier: 'legendary',
        price: 1000,
        effect: { phoenixRevive: true }
    },
    bloodlust: {
        id: 'bloodlust',
        get name() { return typeof I18N !== 'undefined' ? I18N.getTalentName('bloodlust') : 'Bloodlust'; },
        icon: '🩸',
        get desc() { return typeof I18N !== 'undefined' ? I18N.getTalentDesc('bloodlust') : 'Restore 5% max HP when killing an enemy'; },
        tier: 'rare',
        price: 140,
        effect: { onKillHealPct: 5 }
    }
};

// Talent rarity price multiplier
const TALENT_TIER_MULT = {
    normal: 1,
    rare: 1,
    epic: 1,
    legendary: 1
};

// Talent rarity colors
const TALENT_TIER_COLORS = {
    normal: '#ffffff',
    rare: '#4850b8',
    epic: '#a335ee',
    legendary: '#ff8000'
};

// ========== Title system ==========
const TITLES = [
    { id: 'none', get name() { return typeof I18N !== 'undefined' ? I18N.getTitleName('none') : 'None'; }, price: 0, color: '#888888', style: 'normal' },
    { id: 'adventurer', get name() { return typeof I18N !== 'undefined' ? I18N.getTitleName('adventurer') : 'Adventurer'; }, price: 10000, color: '#ffffff', style: 'normal' },
    { id: 'elite_hunter', get name() { return typeof I18N !== 'undefined' ? I18N.getTitleName('elite_hunter') : 'Elite Hunter'; }, price: 100000, color: '#4488ff', style: 'normal' },
    { id: 'hell_walker', get name() { return typeof I18N !== 'undefined' ? I18N.getTitleName('hell_walker') : 'Hell Walker'; }, price: 1000000, color: '#ff6600', style: 'normal' },
    { id: 'golden_lord', get name() { return typeof I18N !== 'undefined' ? I18N.getTitleName('golden_lord') : 'Golden Lord'; }, price: 10000000, color: '#ffd700', style: 'glow' },
    { id: 'billionaire', get name() { return typeof I18N !== 'undefined' ? I18N.getTitleName('billionaire') : 'Billionaire'; }, price: 100000000, color: 'rainbow', style: 'rainbow' },
    { id: 'legend', get name() { return typeof I18N !== 'undefined' ? I18N.getTitleName('legend') : 'Immortal Legend'; }, price: 500000000, color: '#a335ee', style: 'glow' }
];
