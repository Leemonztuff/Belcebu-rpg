// ========== Set system database ==========
const SET_BODY_SPRITES = {
    'tals_set': 'public/spritesheets/frame_047.webp',
    'immortal_king': 'public/spritesheets/Armor/frame_009.webp',
    'shadow_dancer': 'public/spritesheets/Clothes/assasin_081.webp',
    'natalya': 'public/spritesheets/Armor/frame_058.webp',
    'griswold': 'public/spritesheets/Armor/frame_056.webp',
    'aldur': 'public/spritesheets/Clothes/druid_078.webp',
    'trang_oul': 'public/spritesheets/Clothes/necromancer_063.webp',
    'mavina': 'public/spritesheets/Clothes/frame_023.webp',
    'sigon': 'public/spritesheets/Armor/frame_046.webp',
    'abyss_conqueror': 'public/spritesheets/Armor/frame_002.webp'
};

const SET_ITEMS = {
    'tals_set': {
        name: "Tal Rasha's Regalia",
        description: "Mage-exclusive set that boosts fire skills",
        pieces: {
            helm: {
                name: "Tal Rasha's Ward",
                icon: '🪖',
                type: 'helm',
                def: 15,
                stats: { maxMp: 30, mpRegen: 5, allRes: 10 }  // mpRegenchangein order topercentage
            },
            body: {
                name: "Tal Rasha's Regalia",
                icon: '🛡️',
                type: 'armor',
                spriteUrl: 'public/spritesheets/frame_047.webp',
                def: 120,
                stats: { maxHp: 50, maxMp: 45, allRes: 15 }
            },
            amulet: {
                name: "Tal Rasha's Verdict",
                icon: '📿',
                type: 'amulet',
                stats: { maxMp: 45, fireDmg: 25, lightningDmg: 25 }
            },
            mainhand: {
                name: "Tal Rasha's Eternal Staff",
                icon: '⚔️',
                type: 'weapon',
                minDmg: 15,
                maxDmg: 35,
                stats: { maxMp: 60, fireDmg: 40 }
            },
            belt: {
                name: "Tal Rasha's Sash",
                icon: '🎗️',
                type: 'belt',
                def: 10,
                stats: { maxMp: 60, fireDmg: 15 }
            },
            gloves: {
                name: "Tal Rasha's Dexterity",
                icon: '🧤',
                type: 'gloves',
                def: 8,
                stats: { maxMp: 36, attackSpeed: 20, lightningDmg: 20 }
            }
        },
        bonuses: {
            2: {
                desc: "+50 All Resistances",
                stats: { allRes: 50 }
            },
            4: {
                desc: "+10% Mana Regen, +60 Max Mana",
                stats: { mpRegen: 10, maxMp: 60 }  // from100%lowerarrive at10%
            },
            6: {
                desc: "+200 Fire Damage, +5% Mana Regen, +10% Crit Chance",
                stats: { fireDmg: 200, mpRegen: 5, critChance: 10 }  // from50%lowerarrive at5%
            }
        }
    },

    'immortal_king': {
        name: "The Immortal King",
        description: "Warrior-exclusive set that boosts physical attacks",
        pieces: {
            helm: {
                name: "Immortal King's Will",
                icon: '🪖',
                type: 'helm',
                def: 20,
                stats: { dmgPct: 50, maxHp: 50 }
            },
            body: {
                name: "Immortal King's Soul Prison",
                icon: '🛡️',
                type: 'armor',
                spriteUrl: 'public/spritesheets/Armor/frame_009.webp',
                def: 200,
                stats: { dmgPct: 75, maxHp: 100, def: 50 }
            },
            boots: {
                name: "Immortal King's Trample",
                icon: '👢',
                type: 'boots',
                def: 15,
                stats: { dmgPct: 50, maxHp: 50 }
            },
            mainhand: {
                name: "Immortal King's Stonecrusher",
                icon: '🪓',
                type: 'weapon',
                minDmg: 30,
                maxDmg: 60,
                stats: { dmgPct: 175 }
            },
            belt: {
                name: "Immortal King's Detail",
                icon: '🥋',
                type: 'belt',
                def: 18,
                stats: { dmgPct: 60, maxHp: 75, def: 25 }
            },
            gloves: {
                name: "Immortal King's Iron Grasp",
                icon: '🧤',
                type: 'gloves',
                def: 12,
                stats: { dmgPct: 105, attackSpeed: 15 }
            }
        },
        bonuses: {
            2: {
                desc: "+100 Max Life",
                stats: { maxHp: 100 }
            },
            4: {
                desc: "+10% Life Steal, +30% Attack Speed",
                stats: { lifeSteal: 10, attackSpeed: 30 }
            },
            6: {
                desc: "+450% Physical Damage, +150 Defense",
                stats: { dmgPct: 450, def: 150 }
            }
        }
    },

    'shadow_dancer': {
        name: "Shadow Dancer",
        description: "Assassin-exclusive set that boosts crit and attack speed",
        pieces: {
            helm: {
                name: "Shadow Dancer's Mask",
                icon: '🪖',
                type: 'helm',
                def: 27,
                stats: { critChance: 8, attackSpeed: 10 }
            },
            body: {
                name: "Shadow Dancer's Cloak",
                icon: '🛡️',
                type: 'armor',
                spriteUrl: 'public/spritesheets/Clothes/assasin_081.webp',
                def: 100,
                stats: { critChance: 10, attackSpeed: 15 }
            },
            gloves: {
                name: "Shadow Dancer's Talons",
                icon: '🧤',
                type: 'gloves',
                def: 23,
                stats: { critChance: 8, attackSpeed: 20 }
            },
            boots: {
                name: "Shadow Dancer's Swiftness",
                icon: '👢',
                type: 'boots',
                def: 25,
                stats: { critChance: 8, attackSpeed: 15 }
            },
            belt: {
                name: "Shadow Dancer's Binding",
                icon: '🎗️',
                type: 'belt',
                def: 21,
                stats: { critChance: 6, attackSpeed: 12, critDamage: 20 }
            },
            amulet: {
                name: "Shadow Dancer's Sigil",
                icon: '📿',
                type: 'amulet',
                stats: { critChance: 9, critDamage: 30, dmgPct: 25 }
            }
        },
        bonuses: {
            2: {
                desc: "+30% Attack Speed",
                stats: { attackSpeed: 30 }
            },
            4: {
                desc: "+75% Crit Damage, +10% Crit Chance",
                stats: { critDamage: 75, critChance: 10 }
            },
            6: {
                desc: "+20% Crit Chance, +150% Damage, +40 Defense",
                stats: { critChance: 35, dmgPct: 150, def: 40 }
            }
        }
    },

    // ========== addsset v4.1 ==========

    'natalya': {
        name: "Natalya's Revenge",
        description: "Amazon set that boosts bows and lightning",
        pieces: {
            helm: {
                name: "Natalya's Gaze",
                icon: '🪖',
                type: 'helm',
                def: 18,
                stats: { lightningDmg: 30, critChance: 5 }
            },
            body: {
                name: "Natalya's Shadow Armor",
                icon: '🛡️',
                type: 'armor',
                spriteUrl: 'public/spritesheets/Armor/frame_058.webp',
                def: 85,
                stats: { lightningDmg: 45, def: 30, allRes: 15 }
            },
            gloves: {
                name: "Natalya's Touch",
                icon: '🧤',
                type: 'gloves',
                def: 10,
                stats: { lightningDmg: 35, attackSpeed: 25 }
            },
            boots: {
                name: "Natalya's Soul",
                icon: '👢',
                type: 'boots',
                def: 12,
                stats: { lightningDmg: 25, critChance: 6 }
            },
            ring: {
                name: "Natalya's Signet",
                icon: '💍',
                type: 'ring',
                stats: { lightningDmg: 40, dmgPct: 30 }
            },
            mainhand: {
                name: "Natalya's Edge",
                icon: '🗡️',
                type: 'weapon',
                minDmg: 20,
                maxDmg: 45,
                stats: { lightningDmg: 60, critChance: 8 }
            }
        },
        bonuses: {
            2: {
                desc: "+80 Lightning Damage",
                stats: { lightningDmg: 80 }
            },
            4: {
                desc: "+40% Attack Speed, +12% Crit Chance",
                stats: { attackSpeed: 40, critChance: 12 }
            },
            6: {
                desc: "+250 Lightning Damage, +100% Multishot Damage",
                stats: { lightningDmg: 250, dmgPct: 200 }
            }
        }
    },

    'griswold': {
        name: "Griswold's Legacy",
        description: "Paladin set that boosts defense and holy power",
        pieces: {
            helm: {
                name: "Griswold's Glory",
                icon: '🪖',
                type: 'helm',
                def: 35,
                stats: { def: 40, maxHp: 60, allRes: 20 }
            },
            body: {
                name: "Griswold's Sacred Plate",
                icon: '🛡️',
                type: 'armor',
                spriteUrl: 'public/spritesheets/Armor/frame_056.webp',
                def: 250,
                stats: { def: 80, maxHp: 120, allRes: 30 }
            },
            gloves: {
                name: "Griswold's Holy Hands",
                icon: '🧤',
                type: 'gloves',
                def: 20,
                stats: { def: 25, dmgPct: 40, lifeSteal: 3 }
            },
            boots: {
                name: "Griswold's Steadfastness",
                icon: '👢',
                type: 'boots',
                def: 22,
                stats: { def: 30, maxHp: 50 }
            },
            mainhand: {
                name: "Griswold's Redemption",
                icon: '⚔️',
                type: 'weapon',
                minDmg: 25,
                maxDmg: 50,
                stats: { dmgPct: 80, def: 35, lifeSteal: 5 }
            },
            amulet: {
                name: "Griswold's Holy Sigil",
                icon: '📿',
                type: 'amulet',
                stats: { allRes: 40, maxHp: 80, def: 20 }
            }
        },
        bonuses: {
            2: {
                desc: "+120 Defense, +30 All Resistances",
                stats: { def: 120, allRes: 30 }
            },
            4: {
                desc: "+200 Max Life, +8% Life Steal",
                stats: { maxHp: 200, lifeSteal: 8 }
            },
            6: {
                desc: "+300% Damage, -20% Damage Taken",
                stats: { dmgPct: 300, def: 200 }
            }
        }
    },

    'trang_oul': {
        name: "Trang Oul's Avatar",
        description: "Necromancer set that boosts poison and summons",
        pieces: {
            helm: {
                name: "Trang Oul's Visor",
                icon: '🪖',
                type: 'helm',
                def: 16,
                stats: { poisonDmg: 35, maxMp: 40 }
            },
            body: {
                name: "Trang Oul's Sacred Plate",
                icon: '🛡️',
                type: 'armor',
                spriteUrl: 'public/spritesheets/Clothes/necromancer_063.webp',
                def: 90,
                stats: { poisonDmg: 55, maxMp: 60, allRes: 20 }
            },
            gloves: {
                name: "Trang Oul's Talons",
                icon: '🧤',
                type: 'gloves',
                def: 9,
                stats: { poisonDmg: 40, coldDmg: 25 }
            },
            boots: {
                name: "Trang Oul's Scale Boots",
                icon: '👢',
                type: 'boots',
                def: 11,
                stats: { poisonDmg: 30, maxMp: 35 }
            },
            belt: {
                name: "Trang Oul's Belt",
                icon: '🎗️',
                type: 'belt',
                def: 8,
                stats: { poisonDmg: 45, mpRegen: 5 }  // mpRegenchangein order topercentage
            },
            mainhand: {
                name: "Trang Oul's Scepter",
                icon: '⚔️',
                type: 'weapon',
                minDmg: 18,
                maxDmg: 38,
                stats: { poisonDmg: 80, maxMp: 50 }
            }
        },
        bonuses: {
            2: {
                desc: "+100 Poison Damage",
                stats: { poisonDmg: 100 }
            },
            4: {
                desc: "+15% Mana Regen, +100 Max Mana",
                stats: { mpRegen: 15, maxMp: 100 }  // from150%lowerarrive at15%
            },
            6: {
                desc: "+300 Poison Damage, Double Poison Duration",
                stats: { poisonDmg: 300, dmgPct: 100 }
            }
        }
    },

    'aldur': {
        name: "Aldur's Rhythm",
        description: "Druid set that boosts nature and life regeneration",
        pieces: {
            helm: {
                name: "Aldur's Gaze",
                icon: '🪖',
                type: 'helm',
                def: 22,
                stats: { maxHp: 80, hpRegen: 20 }
            },
            body: {
                name: "Aldur's Exorcist Plate",
                icon: '🛡️',
                type: 'armor',
                spriteUrl: 'public/spritesheets/Clothes/druid_078.webp',
                def: 130,
                stats: { maxHp: 150, hpRegen: 35, allRes: 25 }
            },
            boots: {
                name: "Aldur's Advance",
                icon: '👢',
                type: 'boots',
                def: 18,
                stats: { maxHp: 60, hpRegen: 15, def: 20 }
            },
            mainhand: {
                name: "Aldur's Cadence",
                icon: '🪓',
                type: 'weapon',
                minDmg: 22,
                maxDmg: 48,
                stats: { dmgPct: 100, hpRegen: 25, lifeSteal: 6 }
            },
            gloves: {
                name: "Aldur's Might",
                icon: '🧤',
                type: 'gloves',
                def: 14,
                stats: { dmgPct: 50, maxHp: 50, hpRegen: 10 }
            },
            ring: {
                name: "Aldur's Fate",
                icon: '💍',
                type: 'ring',
                stats: { maxHp: 70, hpRegen: 30, allRes: 15 }
            }
        },
        bonuses: {
            2: {
                desc: "+50 Life Regen/s, +100 Max Life",
                stats: { hpRegen: 50, maxHp: 100 }
            },
            4: {
                desc: "+12% Life Steal, +50 All Resistances",
                stats: { lifeSteal: 12, allRes: 50 }
            },
            6: {
                desc: "+400 Max Life, +200% Damage",
                stats: { maxHp: 400, dmgPct: 200 }
            }
        }
    },

    'mavina': {
        name: "Mavina's Battle Song",
        description: "Berserker set that boosts rage and double damage",
        pieces: {
            helm: {
                name: "Mavina's True Face",
                icon: '🪖',
                type: 'helm',
                def: 25,
                stats: { dmgPct: 60, critDamage: 25 }
            },
            body: {
                name: "Mavina's Embrace",
                icon: '🛡️',
                type: 'armor',
                spriteUrl: 'public/spritesheets/Clothes/frame_023.webp',
                def: 110,
                stats: { dmgPct: 90, attackSpeed: 20 }
            },
            gloves: {
                name: "Mavina's Grasp",
                icon: '🧤',
                type: 'gloves',
                def: 15,
                stats: { dmgPct: 55, critDamage: 30, attackSpeed: 15 }
            },
            boots: {
                name: "Mavina's Achilles Heel",
                icon: '👢',
                type: 'boots',
                def: 17,
                stats: { dmgPct: 45, attackSpeed: 10 }
            },
            belt: {
                name: "Mavina's Corset",
                icon: '🎗️',
                type: 'belt',
                def: 13,
                stats: { dmgPct: 50, maxHp: 40 }
            },
            mainhand: {
                name: "Mavina's Bow",
                icon: '🏹',
                type: 'weapon',
                minDmg: 28,
                maxDmg: 55,
                stats: { dmgPct: 120, critDamage: 40 }
            }
        },
        bonuses: {
            2: {
                desc: "+100% Damage",
                stats: { dmgPct: 100 }
            },
            4: {
                desc: "+100% Crit Damage, +35% Attack Speed",
                stats: { critDamage: 100, attackSpeed: 35 }
            },
            6: {
                desc: "+400% Damage, +25% Crit Chance",
                stats: { dmgPct: 400, critChance: 25 }
            }
        }
    },

    'sigon': {
        name: "Sigon's Steel",
        description: "Chaos set with a balanced boost to all stats",
        pieces: {
            helm: {
                name: "Sigon's Faceguard",
                icon: '🪖',
                type: 'helm',
                def: 20,
                stats: { maxHp: 40, maxMp: 30, def: 15 }
            },
            body: {
                name: "Sigon's Iron Plate",
                icon: '🛡️',
                type: 'armor',
                spriteUrl: 'public/spritesheets/Armor/frame_046.webp',
                def: 140,
                stats: { maxHp: 80, def: 50, allRes: 20 }
            },
            gloves: {
                name: "Sigon's Iron Hands",
                icon: '🧤',
                type: 'gloves',
                def: 12,
                stats: { dmgPct: 35, attackSpeed: 15, critChance: 5 }
            },
            boots: {
                name: "Sigon's War Boots",
                icon: '👢',
                type: 'boots',
                def: 14,
                stats: { maxHp: 35, def: 20, allRes: 10 }
            },
            belt: {
                name: "Sigon's Belt",
                icon: '🥋',
                type: 'belt',
                def: 10,
                stats: { maxHp: 50, maxMp: 40, lifeSteal: 4 }
            },
            amulet: {
                name: "Sigon's Medal",
                icon: '📿',
                type: 'amulet',
                stats: { dmgPct: 40, critChance: 6, allRes: 25 }
            }
        },
        bonuses: {
            2: {
                desc: "+50 All Stats (Life/Mana/Defense)",
                stats: { maxHp: 50, maxMp: 50, def: 50 }
            },
            4: {
                desc: "+150% Damage, +40 All Resistances",
                stats: { dmgPct: 150, allRes: 40 }
            },
            6: {
                desc: "All Stats Greatly Increased",
                stats: { maxHp: 200, maxMp: 100, def: 100, dmgPct: 250, critChance: 15 }
            }
        }
    },

// ========== Abyss challenge exclusive sets ==========
    'abyss_conqueror': {
        name: "Abyss Conqueror",
        description: "Abyss challenge exclusive set, only earned by top weekly rankings",
        pieces: {
            helm: {
                name: "Abyss Conqueror's Crown",
                icon: '👑',
                type: 'helm',
                def: 45,
                stats: { dmgPct: 100, maxHp: 100, allRes: 30 }
            },
            body: {
                name: "Abyss Conqueror's War Plate",
                icon: '🛡️',
                type: 'armor',
                spriteUrl: 'public/spritesheets/Armor/frame_002.webp',
                def: 280,
                stats: { dmgPct: 150, maxHp: 200, def: 80, allRes: 40 }
            },
            gloves: {
                name: "Abyss Conqueror's Iron Fists",
                icon: '🧤',
                type: 'gloves',
                def: 28,
                stats: { dmgPct: 80, critChance: 12, attackSpeed: 25 }
            },
            boots: {
                name: "Abyss Conqueror's Trample",
                icon: '👢',
                type: 'boots',
                def: 30,
                stats: { dmgPct: 70, maxHp: 80, def: 40 }
            },
            belt: {
                name: "Abyss Conqueror's Binding",
                icon: '🎗️',
                type: 'belt',
                def: 22,
                stats: { dmgPct: 60, maxHp: 60, lifeSteal: 8 }
            },
            amulet: {
                name: "Abyss Conqueror's Sigil",
                icon: '📿',
                type: 'amulet',
                stats: { dmgPct: 120, critChance: 15, critDamage: 50 }
            }
        },
        bonuses: {
            2: {
                desc: "+200% Damage, +50 All Resistances",
                stats: { dmgPct: 200, allRes: 50 }
            },
            4: {
                desc: "+20% Crit Chance, +15% Life Steal",
                stats: { critChance: 20, lifeSteal: 15 }
            },
            6: {
                desc: "+500% Damage, +500 Max Life, +50% Attack Speed",
                stats: { dmgPct: 500, maxHp: 500, attackSpeed: 50 }
            }
        }
    }
};

// ========== Set localization helpers (render layer only) ==========
// SET_ITEMS keeps zh originals as the data source (saves/achievements/drop checks depend on it);
// UI copy resolves through the sets table at render time, so language switches never rebuild data.

function getSetName(setId) {
    const setData = SET_ITEMS[setId];
    if (!setData) return '';
    if (typeof I18N === 'undefined') return setData.name;
    return I18N.trPath('sets', setId, 'name', setData.name);
}

function getSetDescription(setId) {
    const setData = SET_ITEMS[setId];
    if (!setData) return '';
    const zhDesc = setData.description || '';
    if (typeof I18N === 'undefined') return zhDesc;
    return I18N.trPath('sets', setId, 'desc', zhDesc);
}

function getSetPieceName(setId, pieceSlot) {
    const setData = SET_ITEMS[setId];
    const pieceData = setData && setData.pieces ? setData.pieces[pieceSlot] : null;
    if (!pieceData) return '';
    if (typeof I18N === 'undefined') return pieceData.name;
    return I18N.trPath('sets', setId, 'pieces.' + pieceSlot + '.name', pieceData.name);
}

function getSetBonusDesc(setId, pieceCount) {
    const setData = SET_ITEMS[setId];
    const bonus = setData && setData.bonuses ? setData.bonuses[pieceCount] : null;
    if (!bonus) return '';
    const zhDesc = bonus.desc || '';
    if (typeof I18N === 'undefined') return zhDesc;
    return I18N.trPath('sets', setId, 'bonuses.' + pieceCount + '.desc', zhDesc);
}

// Export globals
if (typeof window !== 'undefined') {
    window.getSetName = getSetName;
    window.getSetDescription = getSetDescription;
    window.getSetPieceName = getSetPieceName;
    window.getSetBonusDesc = getSetBonusDesc;
}
