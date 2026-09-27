// ========== Item data definitions ==========

const ITEM_TYPES = {
    WEAPON: { icon: '⚔️' }, ARMOR: { icon: '🛡️' }, RING: { icon: '💍' }, POTION: { icon: '🍷' }, SCROLL: { icon: '📜' },
    HELM: { icon: '🪖' }, GLOVES: { icon: '🧤' }, BOOTS: { icon: '👢' }, BELT: { icon: '🎗️' }, AMULET: { icon: '📿' }
};

// Difficulty modifiers
const DIFFICULTY_MODIFIERS = {
    normal: {
        monsterHpMult: 1,
        monsterDmgMult: 1,
        monsterSpeedMult: 1,
        xpMult: 1,
        dropQualityMult: 1
    },
    hell: {
        monsterHpMult: 6,
        monsterDmgMult: 4,
        monsterSpeedMult: 1.3,
        xpMult: 5,
        dropQualityMult: 3.5  // 150%increase = original250%
    }
};

const BASE_ARMOR_SPRITES = {
    'Cloth Armor': 'public/spritesheets/Clothes/clothes_072.webp',
    'Leather Armor': 'public/spritesheets/Clothes/frame_014.webp',
    'Plate Armor': 'public/spritesheets/Armor/frame_000.webp'
};

const BASE_ITEMS = [
    { name: 'Short Sword', type: 'weapon', minDmg: 2, maxDmg: 5, rarity: 1, icon: '🗡️' },
    { name: 'Great Axe', type: 'weapon', minDmg: 6, maxDmg: 14, rarity: 1, icon: '🪓' },
    { name: 'Cloth Armor', type: 'armor', def: 5, rarity: 1, icon: '👕', spriteUrl: 'public/spritesheets/Clothes/clothes_072.webp' },
    { name: 'Leather Armor', type: 'armor', def: 12, rarity: 1, icon: '🦺', spriteUrl: 'public/spritesheets/Clothes/frame_014.webp' },
    { name: 'Plate Armor', type: 'armor', def: 25, rarity: 1, icon: '🛡️', spriteUrl: 'public/spritesheets/Armor/frame_000.webp' },

    { name: 'Leather Cap', type: 'helm', def: 3, rarity: 1, icon: '🧢' },
    { name: 'Full Helm', type: 'helm', def: 8, rarity: 1, icon: '🪖' },

    { name: 'Leather Gloves', type: 'gloves', def: 2, rarity: 1, icon: '🧤' },
    { name: 'Heavy Gloves', type: 'gloves', def: 5, rarity: 1, icon: '🧤' },

    { name: 'Leather Boots', type: 'boots', def: 2, rarity: 1, icon: '👢' },
    { name: 'Chain Boots', type: 'boots', def: 6, rarity: 1, icon: '👢' },

    { name: 'Light Belt', type: 'belt', def: 2, rarity: 1, icon: '🎗️' },
    { name: 'Heavy Belt', type: 'belt', def: 5, rarity: 1, icon: '🥋' },

    { name: 'Copper Ring', type: 'ring', rarity: 1, icon: '💍' },
    { name: 'Amulet', type: 'amulet', rarity: 1, icon: '📿' },

    { name: 'Health Potion', type: 'potion', heal: 50, rarity: 0, stackable: true, icon: '🔴' },
    { name: 'Mana Potion', type: 'potion', mana: 30, rarity: 0, stackable: true, icon: '🔵' },
    { name: 'Town Portal Scroll', type: 'scroll', rarity: 0, stackable: true, icon: '📜' }
];

// Equipment affix system
const AFFIXES = {
    prefixes: [
        // base attributes
        { name: 'Cruel', stat: 'dmgPct', min: 10, max: 30 },
        { name: 'Savage', stat: 'dmgPct', min: 15, max: 40 },
        { name: 'Sturdy', stat: 'def', min: 5, max: 15 },
        { name: 'Vampiric', stat: 'lifeSteal', min: 3, max: 5 },
        { name: 'Swift', stat: 'attackSpeed', min: 5, max: 15 },
        // resistclass
        { name: 'of Flame', stat: 'fireRes', min: 15, max: 30 },
        { name: 'of Frost', stat: 'coldRes', min: 15, max: 30 },
        { name: 'of Lightning', stat: 'lightningRes', min: 15, max: 30 },
        { name: 'of Poison', stat: 'poisonRes', min: 15, max: 30 },
        { name: 'of Balance', stat: 'allRes', min: 8, max: 15 },
        // elemental damage
        { name: 'Burning', stat: 'fireDmg', min: 5, max: 20 },
        { name: 'Shocking', stat: 'lightningDmg', min: 5, max: 20 },
        { name: 'Venomous', stat: 'poisonDmg', min: 10, max: 40 },
// Special effects
        { name: 'Piercing', stat: 'armorPierce', min: 10, max: 25 },
        { name: 'Repelling', stat: 'knockback', min: 20, max: 40 },
        { name: 'Slowing', stat: 'slow', min: 25, max: 50 },
        { name: 'Deadly', stat: 'critDamage', min: 30, max: 80 },
        { name: 'of Flurry', stat: 'doubleHit', min: 10, max: 20 }
    ],
    suffixes: [
// Base stats (already converted to direct effects)
        { name: 'of the Bear', stat: 'maxHp', min: 25, max: 50 },
        { name: 'of the Eagle', stat: 'critChance', min: 3, max: 5 },
        { name: 'of the Leech', stat: 'lifeSteal', min: 3, max: 6 },
        { name: 'of Haste', stat: 'attackSpeed', min: 5, max: 10 },
        { name: 'of Strength', stat: 'dmgPct', min: 15, max: 30 },
        // resistclass
        { name: 'of Fire Res', stat: 'fireRes', min: 10, max: 25 },
        { name: 'of Cold Res', stat: 'coldRes', min: 10, max: 25 },
        { name: 'of Lightning Res', stat: 'lightningRes', min: 10, max: 25 },
        { name: 'of Poison Res', stat: 'poisonRes', min: 10, max: 25 },
        { name: 'of Protection', stat: 'allRes', min: 5, max: 12 },
// Special effects
        { name: 'of Regeneration', stat: 'hpRegen', min: 3, max: 10 },
        { name: 'of Meditation', stat: 'mpRegen', min: 3, max: 10 },  // switched to percentages (30-100 became 3-10%)
        { name: 'of Block', stat: 'blockChance', min: 10, max: 25 },
        { name: 'of Reflection', stat: 'reflectDamage', min: 5, max: 15 },
        { name: 'Divine Speed', stat: 'attackSpeed', min: 10, max: 20 },
        { name: 'of Iron Wall', stat: 'damageReduction', min: 3, max: 10 },
        { name: 'of Precision', stat: 'attackRating', min: 50, max: 150 },
        { name: 'of Fortune', stat: 'magicFind', min: 10, max: 30 }
    ]
};
