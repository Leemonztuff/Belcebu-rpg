// ========== Runes & runewords system database ==========
// Inspired by classic Diablo II: gives normal, magic and rare gear sockets and deep customization.

// Rune definition table (13 core runes from El to Shael)
const RUNES = {
    el: {
        id: 1,
        runeKey: 'el',
        name: 'El',
        enName: 'El',
        esName: 'El',
        number: 1,
        icon: 'ᛖ',
        color: '#ffb74d',
        tier: 1,
        weapon: { attackRating: 25 },
        armor: { def: 15 },
        helm: { def: 15 },
        shield: { def: 15 },
        desc: {
            zh: 'Weapon: +25 Attack Rating | Armor/Helm/Shield: +15 Defense',
            en: 'Weapon: +25 Attack Rating | Armor/Helm/Shield: +15 Defense',
            es: 'Arma: +25 Puntería | Armadura/Casco/Escudo: +15 Defensa'
        }
    },
    eld: {
        id: 2,
        runeKey: 'eld',
        name: 'Eld',
        enName: 'Eld',
        esName: 'Eld',
        number: 2,
        icon: 'ᛚ',
        color: '#ffb74d',
        tier: 1,
        weapon: { dmgPct: 15 },
        armor: { blockChance: 10 },
        helm: { hpRegen: 3 },
        shield: { blockChance: 15 },
        desc: {
            zh: 'Weapon: +15% Damage | Armor: +3 HP Regen | Shield: +15% Block',
            en: 'Weapon: +15% Damage | Armor: +3 HP Regen | Shield: +15% Block',
            es: 'Arma: +15% Daño | Armadura: +3 Regen Vida | Escudo: +15% Bloqueo'
        }
    },
    tir: {
        id: 3,
        runeKey: 'tir',
        name: 'Tir',
        enName: 'Tir',
        esName: 'Tir',
        number: 3,
        icon: 'ᛏ',
        color: '#ffb74d',
        tier: 1,
        weapon: { mpRegen: 5 },
        armor: { maxMp: 25 },
        helm: { maxMp: 25 },
        shield: { maxMp: 25 },
        desc: {
            zh: 'Weapon: +5% Mana Regen | Armor/Helm/Shield: +25 Max Mana',
            en: 'Weapon: +5% Mana Regen | Armor/Helm/Shield: +25 Max Mana',
            es: 'Arma: +5% Regen Maná | Armadura/Casco/Escudo: +25 Maná Máx'
        }
    },
    nef: {
        id: 4,
        runeKey: 'nef',
        name: 'Nef',
        enName: 'Nef',
        esName: 'Nef',
        number: 4,
        icon: 'ᚾ',
        color: '#ffb74d',
        tier: 1,
        weapon: { attackRating: 30, knockback: true },
        armor: { def: 30 },
        helm: { def: 30 },
        shield: { def: 30 },
        desc: {
            zh: 'Weapon: +30 Attack Rating, Knockback | Armor/Helm/Shield: +30 Defense',
            en: 'Weapon: +30 Attack Rating, Knockback | Armor/Helm/Shield: +30 Defense',
            es: 'Arma: +30 Puntería, Empuje | Armadura/Casco/Escudo: +30 Defensa'
        }
    },
    eth: {
        id: 5,
        runeKey: 'eth',
        name: 'Eth',
        enName: 'Eth',
        esName: 'Eth',
        number: 5,
        icon: 'ᛖ',
        color: '#ffb74d',
        tier: 1,
        weapon: { dmgPct: 20 },
        armor: { hpRegen: 4, mpRegen: 5 },
        helm: { hpRegen: 4, mpRegen: 5 },
        shield: { def: 20, mpRegen: 5 },
        desc: {
            zh: 'Weapon: +20% Damage | Armor/Helm/Shield: +4 HP Regen, +5% Mana Regen',
            en: 'Weapon: +20% Damage | Armor/Helm/Shield: +4 HP Regen, +5% Mana Regen',
            es: 'Arma: +20% Daño | Armadura/Casco/Escudo: +4 Regen Vida, +5% Regen Maná'
        }
    },
    ith: {
        id: 6,
        runeKey: 'ith',
        name: 'Ith',
        enName: 'Ith',
        esName: 'Ith',
        number: 6,
        icon: 'ᛁ',
        color: '#ffa726',
        tier: 1,
        weapon: { maxDmg: 9 },
        armor: { damageReduction: 5 },
        helm: { damageReduction: 5 },
        shield: { damageReduction: 5 },
        desc: {
            zh: 'Weapon: +9 Max Damage | Armor/Helm/Shield: +5 Damage Reduction',
            en: 'Weapon: +9 Max Damage | Armor/Helm/Shield: +5 Damage Reduction',
            es: 'Arma: +9 Daño Máx | Armadura/Casco/Escudo: +5 Reducción de Daño'
        }
    },
    tal: {
        id: 7,
        runeKey: 'tal',
        name: 'Tal',
        enName: 'Tal',
        esName: 'Tal',
        number: 7,
        icon: 'ᚦ',
        color: '#66bb6a',
        tier: 2,
        weapon: { poisonDmg: 45 },
        armor: { poisonRes: 30 },
        helm: { poisonRes: 30 },
        shield: { poisonRes: 35 },
        desc: {
            zh: 'Weapon: +45 Poison Damage | Armor/Helm/Shield: +30%~35% Poison Resist',
            en: 'Weapon: +45 Poison Damage | Armor/Helm/Shield: +30%~35% Poison Resist',
            es: 'Arma: +45 Daño Veneno | Armadura/Casco/Escudo: +30%~35% Resist Veneno'
        }
    },
    ral: {
        id: 8,
        runeKey: 'ral',
        name: 'Ral',
        enName: 'Ral',
        esName: 'Ral',
        number: 8,
        icon: 'ᚱ',
        color: '#ef5350',
        tier: 2,
        weapon: { fireDmg: 35 },
        armor: { fireRes: 30 },
        helm: { fireRes: 30 },
        shield: { fireRes: 35 },
        desc: {
            zh: 'Weapon: +35 Fire Damage | Armor/Helm/Shield: +30%~35% Fire Resist',
            en: 'Weapon: +35 Fire Damage | Armor/Helm/Shield: +30%~35% Fire Resist',
            es: 'Arma: +35 Daño Fuego | Armadura/Casco/Escudo: +30%~35% Resist Fuego'
        }
    },
    ort: {
        id: 9,
        runeKey: 'ort',
        name: 'Ort',
        enName: 'Ort',
        esName: 'Ort',
        number: 9,
        icon: 'ᛟ',
        color: '#42a5f5',
        tier: 2,
        weapon: { lightningDmg: 45 },
        armor: { lightningRes: 30 },
        helm: { lightningRes: 30 },
        shield: { lightningRes: 35 },
        desc: {
            zh: 'Weapon: +45 Lightning Damage | Armor/Helm/Shield: +30%~35% Lightning Resist',
            en: 'Weapon: +45 Lightning Damage | Armor/Helm/Shield: +30%~35% Lightning Resist',
            es: 'Arma: +45 Daño Rayo | Armadura/Casco/Escudo: +30%~35% Resist Rayo'
        }
    },
    thul: {
        id: 10,
        runeKey: 'thul',
        name: 'Thul',
        enName: 'Thul',
        esName: 'Thul',
        number: 10,
        icon: 'ᚢ',
        color: '#29b6f6',
        tier: 2,
        weapon: { coldDmg: 25 },
        armor: { coldRes: 30 },
        helm: { coldRes: 30 },
        shield: { coldRes: 35 },
        desc: {
            zh: 'Weapon: +25 Cold Damage | Armor/Helm/Shield: +30%~35% Cold Resist',
            en: 'Weapon: +25 Cold Damage | Armor/Helm/Shield: +30%~35% Cold Resist',
            es: 'Arma: +25 Daño Hielo | Armadura/Casco/Escudo: +30%~35% Resist Hielo'
        }
    },
    amn: {
        id: 11,
        runeKey: 'amn',
        name: 'Amn',
        enName: 'Amn',
        esName: 'Amn',
        number: 11,
        icon: 'ᚨ',
        color: '#ab47bc',
        tier: 2,
        weapon: { lifeSteal: 7 },
        armor: { reflectDamage: 14 },
        helm: { reflectDamage: 14 },
        shield: { reflectDamage: 18 },
        desc: {
            zh: 'Weapon: +7% Life Steal | Armor/Helm/Shield: +14~18 Thorns Damage',
            en: 'Weapon: +7% Life Steal | Armor/Helm/Shield: +14~18 Thorns Damage',
            es: 'Arma: +7% Robo de Vida | Armadura/Casco/Escudo: +14~18 Daño de Espinas'
        }
    },
    sol: {
        id: 12,
        runeKey: 'sol',
        name: 'Sol',
        enName: 'Sol',
        esName: 'Sol',
        number: 12,
        icon: 'ᛊ',
        color: '#ffd54f',
        tier: 3,
        weapon: { minDmg: 9, dmgPct: 15 },
        armor: { damageReduction: 7 },
        helm: { damageReduction: 7 },
        shield: { damageReduction: 7 },
        desc: {
            zh: 'Weapon: +9 Min Damage, +15% Damage | Armor/Helm/Shield: +7 Damage Reduction',
            en: 'Weapon: +9 Min Damage, +15% Damage | Armor/Helm/Shield: +7 Damage Reduction',
            es: 'Arma: +9 Daño Mín, +15% Daño | Armadura/Casco/Escudo: +7 Reducción de Daño'
        }
    },
    shael: {
        id: 13,
        runeKey: 'shael',
        name: 'Shael',
        enName: 'Shael',
        esName: 'Shael',
        number: 13,
        icon: 'ᛋ',
        color: '#26a69a',
        tier: 3,
        weapon: { attackSpeed: 20 },
        armor: { hpRegen: 6 },
        helm: { hpRegen: 6 },
        shield: { blockChance: 20 },
        desc: {
            zh: 'Weapon: +20% Attack Speed | Shield: +20% Block Chance | Armor/Helm: +6 HP Regen',
            en: 'Weapon: +20% Attack Speed | Shield: +20% Block Chance | Armor/Helm: +6 HP Regen',
            es: 'Arma: +20% Vel. Ataque | Escudo: +20% Bloqueo | Armadura/Casco: +6 Regen Vida'
        }
    }
};

// Runeword recipe table
const RUNEWORDS = {
    steel: {
        id: 'steel',
        name: 'Steel',
        enName: 'Steel',
        esName: 'Acero',
        itemTypes: ['weapon'],
        sockets: 2,
        runes: ['tir', 'el'],
        desc: {
            zh: 'Classic early melee weapon with high attack speed and damage',
            en: 'Classic early melee weapon with high attack speed and damage',
            es: 'Clásica arma cuerpo a cuerpo con velocidad de ataque y daño letal'
        },
        stats: {
            dmgPct: 25,
            attackSpeed: 20,
            minDmg: 5,
            maxDmg: 10,
            attackRating: 50,
            lifeSteal: 3
        }
    },
    stealth: {
        id: 'stealth',
        name: 'Stealth',
        enName: 'Stealth',
        esName: 'Sigilo',
        itemTypes: ['armor', 'body'],
        sockets: 2,
        runes: ['tal', 'eth'],
        desc: {
            zh: 'Outstanding mobility and caster armor with recovery and poison resist',
            en: 'Outstanding mobility and caster armor with recovery and poison resist',
            es: 'Extraordinaria armadura para lanzadores con recuperación y resistencia'
        },
        stats: {
            def: 35,
            hpRegen: 6,
            mpRegen: 15,
            poisonRes: 30,
            damageReduction: 5
        }
    },
    spirit: {
        id: 'spirit',
        name: 'Spirit',
        enName: 'Spirit',
        esName: 'Espíritu',
        itemTypes: ['weapon'],
        sockets: 4,
        runes: ['tal', 'thul', 'ort', 'amn'],
        desc: {
            zh: 'Legendary caster runeword granting +2 to all skills and multi-resistances',
            en: 'Legendary caster runeword granting +2 to all skills and multi-resistances',
            es: 'Palabra rúnica legendaria con +2 a todas las habilidades y multirresistencias'
        },
        stats: {
            allSkills: 2,
            maxMp: 80,
            coldRes: 35,
            lightningRes: 35,
            poisonRes: 35,
            lifeSteal: 5,
            def: 40
        }
    },
    lore: {
        id: 'lore',
        name: 'Lore',
        enName: 'Lore',
        esName: 'Saber',
        itemTypes: ['helm'],
        sockets: 2,
        runes: ['ort', 'sol'],
        desc: {
            zh: 'Scholar helm granting +1 all skills and lightning protection',
            en: 'Scholar helm granting +1 all skills and lightning protection',
            es: 'Yelmo del erudito con +1 a todas las habilidades y protección eléctrica'
        },
        stats: {
            allSkills: 1,
            lightningRes: 30,
            damageReduction: 7,
            maxMp: 30,
            def: 20
        }
    },
    leaf: {
        id: 'leaf',
        name: 'Leaf',
        enName: 'Leaf',
        esName: 'Hoja',
        itemTypes: ['weapon'],
        sockets: 2,
        runes: ['tir', 'ral'],
        desc: {
            zh: 'Pyromancer staff greatly boosting fire damage and resistance',
            en: 'Pyromancer staff greatly boosting fire damage and resistance',
            es: 'Bastón piromante que potencia el daño de fuego y la resistencia ígnea'
        },
        stats: {
            fireDmg: 50,
            fireRes: 35,
            def: 15,
            mpRegen: 10,
            dmgPct: 20
        }
    },
    smoke: {
        id: 'smoke',
        name: 'Smoke',
        enName: 'Smoke',
        esName: 'Humo',
        itemTypes: ['armor', 'body'],
        sockets: 2,
        runes: ['nef', 'sol'],
        desc: {
            zh: 'Heavy stealth armor with +45 all resistances and high damage reduction',
            en: 'Heavy protective armor with +45 all resistances and damage mitigation',
            es: 'Armadura pesada de protección con +45 todas las resistencias y mitigación'
        },
        stats: {
            allRes: 45,
            def: 60,
            damageReduction: 10
        }
    },
    ancients_pledge: {
        id: 'ancients_pledge',
        name: "Ancient's Pledge",
        enName: "Ancient's Pledge",
        esName: 'Voto Ancestral',
        itemTypes: ['helm', 'armor', 'body'],
        sockets: 3,
        runes: ['ral', 'ort', 'tal'],
        desc: {
            zh: 'Ancient guardian ward granting massive elemental resistances',
            en: 'Ancient guardian ward granting massive elemental resistances',
            es: 'Voto de los ancestros que otorga una colosal resistencia elemental'
        },
        stats: {
            fireRes: 40,
            lightningRes: 40,
            coldRes: 40,
            poisonRes: 40,
            def: 45
        }
    }
};

// ========== Helper and core logic functions ==========

// Get the rune definition
function getRuneData(runeKey) {
    if (!runeKey) return null;
    return RUNES[runeKey.toLowerCase()] || null;
}

// ========== Rune & runeword localization helpers (render layer only) ==========
// RUNES/RUNEWORDS keep zh originals plus enName/esName fields for logic;
// UI copy resolves through tables at render time by current language.

function getRuneName(runeKey) {
    const r = getRuneData(runeKey);
    if (!r) return '';
    if (typeof I18N === 'undefined') return r.name;
    return I18N.trPath('runes', r.runeKey, 'name', r.name);
}

function getRuneDesc(runeKey) {
    const r = getRuneData(runeKey);
    if (!r) return '';
    const zhDesc = (r.desc && r.desc.zh) || '';
    if (typeof I18N === 'undefined') return zhDesc;
    return I18N.trPath('runes', r.runeKey, 'desc', zhDesc);
}

function getRunewordName(runewordId) {
    const rw = runewordId ? RUNEWORDS[runewordId] : null;
    if (!rw) return '';
    if (typeof I18N === 'undefined') return rw.name;
    return I18N.trPath('runewords', rw.id, 'name', rw.name);
}

function getRunewordDesc(runewordId) {
    const rw = runewordId ? RUNEWORDS[runewordId] : null;
    if (!rw) return '';
    const zhDesc = (rw.desc && rw.desc.zh) || '';
    if (typeof I18N === 'undefined') return zhDesc;
    return I18N.trPath('runewords', rw.id, 'desc', zhDesc);
}

// Check whether the item type fits the runeword base
function isItemTypeCompatibleForRuneword(item, supportedTypes) {
    if (!item || !supportedTypes) return false;
    const itemType = (item.type || '').toLowerCase();
    const itemSlot = (item.slot || '').toLowerCase();

    for (let t of supportedTypes) {
        const target = t.toLowerCase();
        if (itemType === target) return true;
        if (target === 'weapon' && (itemType === 'weapon' || itemSlot === 'mainhand')) return true;
        if ((target === 'armor' || target === 'body') && (itemType === 'armor' || itemType === 'body' || itemSlot === 'body')) return true;
        if (target === 'helm' && (itemType === 'helm' || itemSlot === 'helm')) return true;
    }
    return false;
}

// Create the rune drop/inventory item
function createRuneItem(runeKey) {
    const r = getRuneData(runeKey);
    if (!r) return null;

    const lang = (typeof I18N !== 'undefined' && I18N.currentLang) ? I18N.currentLang : 'zh';
    const runeName = getRuneName(r.runeKey);
    let displayName = runeName + ' Rune';
    if (lang === 'es') displayName = 'Runa ' + runeName;
    else if (lang === 'en') displayName = runeName + ' Rune';

    return {
        id: 'rune_' + r.runeKey + '_' + Math.random().toString(36).substr(2, 6),
        name: displayName,
        displayName: displayName,
        type: 'rune',
        runeKey: r.runeKey,
        runeNumber: r.number,
        rarity: RARITY.RARE, // Runes use gold/bright coloring
        icon: '💎',
        runeSymbol: r.icon,
        color: r.color,
        stackable: false,
        quantity: 1,
        stats: {},
        desc: getRuneDesc(r.runeKey)
    };
}

// Check whether socketed runes complete a runeword
function checkRuneword(item) {
    if (!item || !item.sockets || !item.socketedRunes || item.socketedRunes.length !== item.sockets) {
        return null;
    }

// Only normal gear (white, blue, rare - not unique or set) can form runewords
    if (item.rarity === RARITY.SET || item.rarity === RARITY.UNIQUE) {
        return null;
    }

    const currentSequence = item.socketedRunes.map(r => r.toLowerCase());

    for (let rwId in RUNEWORDS) {
        const rw = RUNEWORDS[rwId];
        if (rw.sockets === item.sockets &&
            isItemTypeCompatibleForRuneword(item, rw.itemTypes) &&
            rw.runes.length === currentSequence.length &&
            rw.runes.every((r, idx) => r.toLowerCase() === currentSequence[idx])) {
            
            item.isRuneword = true;
            item.runewordId = rwId;
            item.runewordName = rw.name;
            item.runewordData = rw;

            const rwTitle = getRunewordName(rwId);

            item.displayName = `★ ${rwTitle} ★ (${item.name})`;
            return rw;
        }
    }

    return null;
}

// Check whether the gear can socket the given rune
function canItemAcceptRune(item, runeItem) {
    if (!item || !runeItem) return false;
    if (runeItem.type !== 'rune' || !runeItem.runeKey) return false;
    
// Only weapons, chest armor and helms support socketing
    const validTypes = ['weapon', 'armor', 'body', 'helm'];
    const isEquip = validTypes.includes(item.type) || validTypes.includes(item.slot);
    if (!isEquip) return false;

    const totalSockets = item.sockets || 0;
    const socketedCount = (item.socketedRunes || []).length;

    return totalSockets > 0 && socketedCount < totalSockets;
}

// Execute the socketing action
function socketRuneIntoItem(targetItem, runeItem) {
    if (!canItemAcceptRune(targetItem, runeItem)) {
        return { success: false, reason: 'invalid_target' };
    }

    if (!targetItem.socketedRunes) {
        targetItem.socketedRunes = [];
    }

    const runeKey = runeItem.runeKey;
    targetItem.socketedRunes.push(runeKey);

// Check whether a runeword activates
    const completedRuneword = checkRuneword(targetItem);

    return {
        success: true,
        runewordCompleted: !!completedRuneword,
        runeword: completedRuneword
    };
}

// Get all stat bonuses the gear gains from socketed runes and runewords
function getSocketAndRunewordStats(item) {
    const stats = {};
    if (!item) return stats;

    const addStat = (k, v) => {
        if (!v) return;
        stats[k] = (stats[k] || 0) + v;
    };

    // 1. Bonuses from each individual rune
    if (item.socketedRunes && item.socketedRunes.length > 0) {
        const isWeapon = item.type === 'weapon' || item.slot === 'mainhand';
        const isHelm = item.type === 'helm' || item.slot === 'helm';
// Armor covers body/armor
        const runeCategory = isWeapon ? 'weapon' : (isHelm ? 'helm' : 'armor');

        for (let rKey of item.socketedRunes) {
            const rData = getRuneData(rKey);
            if (!rData) continue;
            const effect = rData[runeCategory] || rData.armor || {};
            for (let [k, v] of Object.entries(effect)) {
                if (typeof v === 'number') {
                    addStat(k, v);
                } else if (typeof v === 'boolean') {
                    stats[k] = v;
                }
            }
        }
    }

// 2. Whole-runeword bonuses
    if (item.isRuneword && item.runewordId && RUNEWORDS[item.runewordId]) {
        const rw = RUNEWORDS[item.runewordId];
        if (rw.stats) {
            for (let [k, v] of Object.entries(rw.stats)) {
                if (typeof v === 'number') {
                    addStat(k, v);
                } else if (typeof v === 'boolean') {
                    stats[k] = v;
                }
            }
        }
    }

    return stats;
}

// Export globals
if (typeof window !== 'undefined') {
    window.RUNES = RUNES;
    window.RUNEWORDS = RUNEWORDS;
    window.getRuneData = getRuneData;
    window.getRuneName = getRuneName;
    window.getRuneDesc = getRuneDesc;
    window.getRunewordName = getRunewordName;
    window.getRunewordDesc = getRunewordDesc;
    window.createRuneItem = createRuneItem;
    window.checkRuneword = checkRuneword;
    window.canItemAcceptRune = canItemAcceptRune;
    window.socketRuneIntoItem = socketRuneIntoItem;
    window.getSocketAndRunewordStats = getSocketAndRunewordStats;
}
