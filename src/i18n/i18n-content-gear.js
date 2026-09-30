// ========== i18n-content-gear.js - gear localization (sets/runes/runewords/item types/affixes) ==========
(function () {
    'use strict';
    if (typeof window.I18N === 'undefined' || typeof window.I18N.registerTable !== 'function') return;

    // settable:keyis SET_ITEMS objectkey
    window.I18N.registerTable('sets', {
        tals_set: {
            name: { es: 'Túnica de Tal Rasha', en: "Tal Rasha's Regalia", zh: '塔拉夏的外袍' },
            desc: { es: 'Conjunto exclusivo de magos, potencia las habilidades de fuego', en: 'Mage-exclusive set that boosts fire skills', zh: '法师专属套装，强化火焰技能' },
            pieces: {
                helm: { name: { es: 'Guarda de Tal Rasha', en: "Tal Rasha's Ward", zh: '塔拉夏的守护' } },
                body: { name: { es: 'Túnica de Tal Rasha', en: "Tal Rasha's Regalia", zh: '塔拉夏的外袍' } },
                amulet: { name: { es: 'Juicio de Tal Rasha', en: "Tal Rasha's Verdict", zh: '塔拉夏的裁决' } },
                mainhand: { name: { es: 'Báculo Eterno de Tal Rasha', en: "Tal Rasha's Eternal Staff", zh: '塔拉夏的永恒权杖' } },
                belt: { name: { es: 'Cinturón de Tal Rasha', en: "Tal Rasha's Sash", zh: '塔拉夏的束带' } },
                gloves: { name: { es: 'Destreza de Tal Rasha', en: "Tal Rasha's Dexterity", zh: '塔拉夏的灵巧' } }
            },
            bonuses: {
                '2': { desc: { es: '+50 a todas las resistencias', en: '+50 All Resistances', zh: '+50 全抗性' } },
                '4': { desc: { es: '+10% Regen. Maná, +60 Maná Máx', en: '+10% Mana Regen, +60 Max Mana', zh: '法力恢复速度 +10%，最大法力 +60' } },
                '6': { desc: { es: '+200 Daño de Fuego, +5% Regen. Maná, +10% Prob. Crítico', en: '+200 Fire Damage, +5% Mana Regen, +10% Crit Chance', zh: '火焰伤害 +200，法力回复 +5%，暴击率 +10%' } }
            }
        },

        immortal_king: {
            name: { es: 'El Rey Inmortal', en: 'The Immortal King', zh: '不朽之王' },
            desc: { es: 'Conjunto exclusivo de guerreros, potencia el ataque físico', en: 'Warrior-exclusive set that boosts physical attacks', zh: '战士专属套装，强化物理攻击' },
            pieces: {
                helm: { name: { es: 'Voluntad del Rey Inmortal', en: "Immortal King's Will", zh: '不朽之王的意志' } },
                body: { name: { es: 'Prisión del Alma del Rey Inmortal', en: "Immortal King's Soul Prison", zh: '不朽之王的灵魂牢笼' } },
                boots: { name: { es: 'Pisotón del Rey Inmortal', en: "Immortal King's Trample", zh: '不朽之王的践踏' } },
                mainhand: { name: { es: 'Machacador de Piedra del Rey Inmortal', en: "Immortal King's Stonecrusher", zh: '不朽之王的石碎器' } },
                belt: { name: { es: 'Detalle del Rey Inmortal', en: "Immortal King's Detail", zh: '不朽之王的细节' } },
                gloves: { name: { es: 'Agarre de Hierro del Rey Inmortal', en: "Immortal King's Iron Grasp", zh: '不朽之王的钢铁之握' } }
            },
            bonuses: {
                '2': { desc: { es: '+100 Vida Máxima', en: '+100 Max Life', zh: '+100 最大生命' } },
                '4': { desc: { es: '+10% Robo de Vida, +30% Velocidad de Ataque', en: '+10% Life Steal, +30% Attack Speed', zh: '生命偷取 +10%，攻击速度 +30%' } },
                '6': { desc: { es: '+450% Daño Físico, +150 Defensa', en: '+450% Physical Damage, +150 Defense', zh: '物理伤害 +450%，防御 +150' } }
            }
        },

        shadow_dancer: {
            name: { es: 'El Bailarín de Sombras', en: 'Shadow Dancer', zh: '暗影舞者' },
            desc: { es: 'Conjunto exclusivo de asesinos, potencia el crítico y la velocidad de ataque', en: 'Assassin-exclusive set that boosts crit and attack speed', zh: '刺客专属套装，强化暴击和攻速' },
            pieces: {
                helm: { name: { es: 'Máscara del Bailarín de Sombras', en: "Shadow Dancer's Mask", zh: '暗影舞者的面罩' } },
                body: { name: { es: 'Capa del Bailarín de Sombras', en: "Shadow Dancer's Cloak", zh: '暗影舞者的披风' } },
                gloves: { name: { es: 'Garras del Bailarín de Sombras', en: "Shadow Dancer's Talons", zh: '暗影舞者的利爪' } },
                boots: { name: { es: 'Prisa del Bailarín de Sombras', en: "Shadow Dancer's Swiftness", zh: '暗影舞者的迅捷' } },
                belt: { name: { es: 'Ataduras del Bailarín de Sombras', en: "Shadow Dancer's Binding", zh: '暗影舞者的束缚' } },
                amulet: { name: { es: 'Emblema del Bailarín de Sombras', en: "Shadow Dancer's Sigil", zh: '暗影舞者的徽记' } }
            },
            bonuses: {
                '2': { desc: { es: '+30% Velocidad de Ataque', en: '+30% Attack Speed', zh: '攻击速度 +30%' } },
                '4': { desc: { es: '+75% Daño Crítico, +10% Prob. Crítico', en: '+75% Crit Damage, +10% Crit Chance', zh: '暴击伤害 +75%，暴击率 +10%' } },
                '6': { desc: { es: '+20% Prob. Crítico, +150% Daño, +40 Defensa', en: '+20% Crit Chance, +150% Damage, +40 Defense', zh: '暴击率 +20%，伤害 +150%，防御 +40' } }
            }
        },

        natalya: {
            name: { es: 'La Venganza de Natalya', en: "Natalya's Revenge", zh: '娜塔亚的复仇' },
            desc: { es: 'Conjunto de amazonas, potencia el arco y el rayo', en: 'Amazon set that boosts bows and lightning', zh: '亚马逊套装，强化弓箭和闪电' },
            pieces: {
                helm: { name: { es: 'Mirada de Natalya', en: "Natalya's Gaze", zh: '娜塔亚的凝视' } },
                body: { name: { es: 'Armadura Sombría de Natalya', en: "Natalya's Shadow Armor", zh: '娜塔亚的影甲' } },
                gloves: { name: { es: 'Toque de Natalya', en: "Natalya's Touch", zh: '娜塔亚的触感' } },
                boots: { name: { es: 'Alma de Natalya', en: "Natalya's Soul", zh: '娜塔亚的灵魂' } },
                ring: { name: { es: 'Sello de Natalya', en: "Natalya's Signet", zh: '娜塔亚的印记' } },
                mainhand: { name: { es: 'Filo de Natalya', en: "Natalya's Edge", zh: '娜塔亚的锋刃' } }
            },
            bonuses: {
                '2': { desc: { es: '+80 Daño de Rayo', en: '+80 Lightning Damage', zh: '闪电伤害 +80' } },
                '4': { desc: { es: '+40% Velocidad de Ataque, +12% Prob. Crítico', en: '+40% Attack Speed, +12% Crit Chance', zh: '攻击速度 +40%，暴击率 +12%' } },
                '6': { desc: { es: '+250 Daño de Rayo, +100% Daño de Disparo Múltiple', en: '+250 Lightning Damage, +100% Multishot Damage', zh: '闪电伤害 +250，多重射击伤害 +100%' } }
            }
        },

        griswold: {
            name: { es: 'La Herencia de Griswold', en: "Griswold's Legacy", zh: '格里斯沃尔德的传承' },
            desc: { es: 'Conjunto de paladines, potencia la defensa y lo sagrado', en: 'Paladin set that boosts defense and holy power', zh: '圣骑士套装，强化防御和神圣' },
            pieces: {
                helm: { name: { es: 'Gloria de Griswold', en: "Griswold's Glory", zh: '格里斯沃尔德的荣耀' } },
                body: { name: { es: 'Armadura Sagrada de Griswold', en: "Griswold's Sacred Plate", zh: '格里斯沃尔德的圣铠' } },
                gloves: { name: { es: 'Manos Santas de Griswold', en: "Griswold's Holy Hands", zh: '格里斯沃尔德的圣手' } },
                boots: { name: { es: 'Constancia de Griswold', en: "Griswold's Steadfastness", zh: '格里斯沃尔德的坚毅' } },
                mainhand: { name: { es: 'Redención de Griswold', en: "Griswold's Redemption", zh: '格里斯沃尔德的救赎' } },
                amulet: { name: { es: 'Relicario Sagrado de Griswold', en: "Griswold's Holy Sigil", zh: '格里斯沃尔德的圣符' } }
            },
            bonuses: {
                '2': { desc: { es: '+120 Defensa, +30 Todas las Resistencias', en: '+120 Defense, +30 All Resistances', zh: '防御 +120，全抗性 +30' } },
                '4': { desc: { es: '+200 Vida Máxima, +8% Robo de Vida', en: '+200 Max Life, +8% Life Steal', zh: '最大生命 +200，生命偷取 +8%' } },
                '6': { desc: { es: '+300% Daño, -20% Daño Recibido', en: '+300% Damage, -20% Damage Taken', zh: '伤害 +300%，受到伤害减少20%' } }
            }
        },

        trang_oul: {
            name: { es: 'El Avatar de Trang Oul', en: "Trang Oul's Avatar", zh: '庄·欧的化身' },
            desc: { es: 'Conjunto de nigromantes, potencia el veneno y las invocaciones', en: 'Necromancer set that boosts poison and summons', zh: '死灵法师套装，强化毒素和召唤' },
            pieces: {
                helm: { name: { es: 'Visera de Trang Oul', en: "Trang Oul's Visor", zh: '庄·欧的面甲' } },
                body: { name: { es: 'Armadura Sagrada de Trang Oul', en: "Trang Oul's Sacred Plate", zh: '庄·欧的圣甲' } },
                gloves: { name: { es: 'Garras de Trang Oul', en: "Trang Oul's Talons", zh: '庄·欧的利爪' } },
                boots: { name: { es: 'Botas Escamosas de Trang Oul', en: "Trang Oul's Scale Boots", zh: '庄·欧的鳞靴' } },
                belt: { name: { es: 'Cinturón de Trang Oul', en: "Trang Oul's Belt", zh: '庄·欧的腰带' } },
                mainhand: { name: { es: 'Báculo de Trang Oul', en: "Trang Oul's Scepter", zh: '庄·欧的权杖' } }
            },
            bonuses: {
                '2': { desc: { es: '+100 Daño de Veneno', en: '+100 Poison Damage', zh: '毒素伤害 +100' } },
                '4': { desc: { es: '+15% Regen. Maná, +100 Maná Máx', en: '+15% Mana Regen, +100 Max Mana', zh: '法力回复 +15%，最大法力 +100' } },
                '6': { desc: { es: '+300 Daño de Veneno, Doble duración del envenenamiento', en: '+300 Poison Damage, Double Poison Duration', zh: '毒素伤害 +300，敌人中毒持续时间翻倍' } }
            }
        },

        aldur: {
            name: { es: 'El Ritmo de Aldur', en: "Aldur's Rhythm", zh: '奥杜尔的节拍' },
            desc: { es: 'Conjunto de druidas, potencia la naturaleza y la regeneración de vida', en: 'Druid set that boosts nature and life regeneration', zh: '德鲁伊套装，强化自然和生命恢复' },
            pieces: {
                helm: { name: { es: 'Mirada de Aldur', en: "Aldur's Gaze", zh: '奥杜尔的凝视' } },
                body: { name: { es: 'Armadura Exorcista de Aldur', en: "Aldur's Exorcist Plate", zh: '奥杜尔的驱邪铠' } },
                boots: { name: { es: 'Avance de Aldur', en: "Aldur's Advance", zh: '奥杜尔的前进' } },
                mainhand: { name: { es: 'Cadencia de Aldur', en: "Aldur's Cadence", zh: '奥杜尔的节律' } },
                gloves: { name: { es: 'Fuerza Brutal de Aldur', en: "Aldur's Might", zh: '奥杜尔的蛮力' } },
                ring: { name: { es: 'Destino de Aldur', en: "Aldur's Fate", zh: '奥杜尔的命运' } }
            },
            bonuses: {
                '2': { desc: { es: '+50 Regen. Vida/s, +100 Vida Máxima', en: '+50 Life Regen/s, +100 Max Life', zh: '生命恢复 +50/秒，最大生命 +100' } },
                '4': { desc: { es: '+12% Robo de Vida, +50 Todas las Resistencias', en: '+12% Life Steal, +50 All Resistances', zh: '生命偷取 +12%，全抗性 +50' } },
                '6': { desc: { es: '+400 Vida Máxima, +200% Daño', en: '+400 Max Life, +200% Damage', zh: '最大生命 +400，伤害 +200%' } }
            }
        },

        mavina: {
            name: { es: 'El Canto de Batalla de Mavina', en: "Mavina's Battle Song", zh: '马维娜的战斗颂歌' },
            desc: { es: 'Conjunto de berserkers, potencia la furia y el daño doble', en: 'Berserker set that boosts rage and double damage', zh: '狂战套装，强化狂暴和双倍伤害' },
            pieces: {
                helm: { name: { es: 'El Verdadero Rostro de Mavina', en: "Mavina's True Face", zh: '马维娜的真面目' } },
                body: { name: { es: 'El Abrazo de Mavina', en: "Mavina's Embrace", zh: '马维娜的怀抱' } },
                gloves: { name: { es: 'El Apretón de Mavina', en: "Mavina's Grasp", zh: '马维娜的紧握' } },
                boots: { name: { es: 'Talón de Aquiles de Mavina', en: "Mavina's Achilles Heel", zh: '马维娜的跟腱' } },
                belt: { name: { es: 'Corsé de Mavina', en: "Mavina's Corset", zh: '马维娜的束腰' } },
                mainhand: { name: { es: 'Arco de Mavina', en: "Mavina's Bow", zh: '马维娜的弯弓' } }
            },
            bonuses: {
                '2': { desc: { es: '+100% Daño', en: '+100% Damage', zh: '伤害 +100%' } },
                '4': { desc: { es: '+100% Daño Crítico, +35% Velocidad de Ataque', en: '+100% Crit Damage, +35% Attack Speed', zh: '暴击伤害 +100%，攻击速度 +35%' } },
                '6': { desc: { es: '+400% Daño, +25% Prob. Crítico', en: '+400% Damage, +25% Crit Chance', zh: '伤害 +400%，暴击率 +25%' } }
            }
        },

        sigon: {
            name: { es: 'El Acero de Sigon', en: "Sigon's Steel", zh: '希冈的钢铁' },
            desc: { es: 'Conjunto del Caos, mejora todas las estadísticas de forma equilibrada', en: 'Chaos set with a balanced boost to all stats', zh: '混沌套装，全属性均衡提升' },
            pieces: {
                helm: { name: { es: 'Guarda Facial de Sigon', en: "Sigon's Faceguard", zh: '希冈的护面' } },
                body: { name: { es: 'Armadura de Hierro de Sigon', en: "Sigon's Iron Plate", zh: '希冈的铁甲' } },
                gloves: { name: { es: 'Manos de Hierro de Sigon', en: "Sigon's Iron Hands", zh: '希冈的铁手' } },
                boots: { name: { es: 'Botas Militares de Sigon', en: "Sigon's War Boots", zh: '希冈的军靴' } },
                belt: { name: { es: 'Cinturón de Sigon', en: "Sigon's Belt", zh: '希冈的腰带' } },
                amulet: { name: { es: 'Medalla de Sigon', en: "Sigon's Medal", zh: '希冈的徽章' } }
            },
            bonuses: {
                '2': { desc: { es: '+50 Todas las Estadísticas (Vida/Maná/Defensa)', en: '+50 All Stats (Life/Mana/Defense)', zh: '全属性 +50 (HP/MP/防御)' } },
                '4': { desc: { es: '+150% Daño, +40 Todas las Resistencias', en: '+150% Damage, +40 All Resistances', zh: '伤害 +150%，全抗性 +40' } },
                '6': { desc: { es: 'Mejora General de Todas las Estadísticas', en: 'All Stats Greatly Increased', zh: '全属性大幅提升' } }
            }
        },

        abyss_conqueror: {
            name: { es: 'El Conquistador del Abismo', en: 'Abyss Conqueror', zh: '深渊征服者' },
            desc: { es: 'Conjunto exclusivo del Desafío del Abismo, solo para los mejores del ranking semanal', en: 'Abyss challenge exclusive set, only earned by top weekly rankings', zh: '深渊挑战专属套装，只有周榜前列才能获得' },
            pieces: {
                helm: { name: { es: 'Corona del Conquistador del Abismo', en: "Abyss Conqueror's Crown", zh: '深渊征服者的冠冕' } },
                body: { name: { es: 'Armadura del Conquistador del Abismo', en: "Abyss Conqueror's War Plate", zh: '深渊征服者的战甲' } },
                gloves: { name: { es: 'Puños de Hierro del Conquistador del Abismo', en: "Abyss Conqueror's Iron Fists", zh: '深渊征服者的铁拳' } },
                boots: { name: { es: 'Pisotón del Conquistador del Abismo', en: "Abyss Conqueror's Trample", zh: '深渊征服者的践踏' } },
                belt: { name: { es: 'Ataduras del Conquistador del Abismo', en: "Abyss Conqueror's Binding", zh: '深渊征服者的束缚' } },
                amulet: { name: { es: 'Emblema del Conquistador del Abismo', en: "Abyss Conqueror's Sigil", zh: '深渊征服者的徽记' } }
            },
            bonuses: {
                '2': { desc: { es: '+200% Daño, +50 Todas las Resistencias', en: '+200% Damage, +50 All Resistances', zh: '伤害 +200%，全抗性 +50' } },
                '4': { desc: { es: '+20% Prob. Crítico, +15% Robo de Vida', en: '+20% Crit Chance, +15% Life Steal', zh: '暴击率 +20%，生命偷取 +15%' } },
                '6': { desc: { es: '+500% Daño, +500 Vida Máxima, +50% Velocidad de Ataque', en: '+500% Damage, +500 Max Life, +50% Attack Speed', zh: '伤害 +500%，最大生命 +500，攻速 +50%' } }
            }
        }
    });

// Rune table: keyed by RUNES runeKey
    window.I18N.registerTable('runes', {
        el: {
            name: { es: 'El', en: 'El', zh: '艾尔' },
            desc: { es: 'Arma: +25 Puntería | Armadura/Casco/Escudo: +15 Defensa', en: 'Weapon: +25 Attack Rating | Armor/Helm/Shield: +15 Defense', zh: '武器：命中+25 | 防具/头盔/盾牌：防御+15' }
        },
        eld: {
            name: { es: 'Eld', en: 'Eld', zh: '艾尔德' },
            desc: { es: 'Arma: +15% Daño | Armadura: +3 Regen Vida | Escudo: +15% Bloqueo', en: 'Weapon: +15% Damage | Armor: +3 HP Regen | Shield: +15% Block', zh: '武器：伤害+15% | 防具：生命恢复+3 | 盾牌：格挡率+15%' }
        },
        tir: {
            name: { es: 'Tir', en: 'Tir', zh: '特尔' },
            desc: { es: 'Arma: +5% Regen Maná | Armadura/Casco/Escudo: +25 Maná Máx', en: 'Weapon: +5% Mana Regen | Armor/Helm/Shield: +25 Max Mana', zh: '武器：法力恢复+5% | 防具/头盔/盾牌：最大法力+25' }
        },
        nef: {
            name: { es: 'Nef', en: 'Nef', zh: '那夫' },
            desc: { es: 'Arma: +30 Puntería, Empuje | Armadura/Casco/Escudo: +30 Defensa', en: 'Weapon: +30 Attack Rating, Knockback | Armor/Helm/Shield: +30 Defense', zh: '武器：命中+30，击退效果 | 防具/头盔/盾牌：防御+30' }
        },
        eth: {
            name: { es: 'Eth', en: 'Eth', zh: '爱斯' },
            desc: { es: 'Arma: +20% Daño | Armadura/Casco/Escudo: +4 Regen Vida, +5% Regen Maná', en: 'Weapon: +20% Damage | Armor/Helm/Shield: +4 HP Regen, +5% Mana Regen', zh: '武器：伤害+20% | 防具/头盔/盾牌：生命恢复+4，法力恢复+5%' }
        },
        ith: {
            name: { es: 'Ith', en: 'Ith', zh: '伊司' },
            desc: { es: 'Arma: +9 Daño Máx | Armadura/Casco/Escudo: +5 Reducción de Daño', en: 'Weapon: +9 Max Damage | Armor/Helm/Shield: +5 Damage Reduction', zh: '武器：最大伤害+9 | 防具/头盔/盾牌：物理伤害减免+5' }
        },
        tal: {
            name: { es: 'Tal', en: 'Tal', zh: '塔尔' },
            desc: { es: 'Arma: +45 Daño Veneno | Armadura/Casco/Escudo: +30%~35% Resist Veneno', en: 'Weapon: +45 Poison Damage | Armor/Helm/Shield: +30%~35% Poison Resist', zh: '武器：毒素伤害+45 | 防具/头盔/盾牌：毒素抗性+30%~35%' }
        },
        ral: {
            name: { es: 'Ral', en: 'Ral', zh: '拉尔' },
            desc: { es: 'Arma: +35 Daño Fuego | Armadura/Casco/Escudo: +30%~35% Resist Fuego', en: 'Weapon: +35 Fire Damage | Armor/Helm/Shield: +30%~35% Fire Resist', zh: '武器：火焰伤害+35 | 防具/头盔/盾牌：火焰抗性+30%~35%' }
        },
        ort: {
            name: { es: 'Ort', en: 'Ort', zh: '欧特' },
            desc: { es: 'Arma: +45 Daño Rayo | Armadura/Casco/Escudo: +30%~35% Resist Rayo', en: 'Weapon: +45 Lightning Damage | Armor/Helm/Shield: +30%~35% Lightning Resist', zh: '武器：闪电伤害+45 | 防具/头盔/盾牌：闪电抗性+30%~35%' }
        },
        thul: {
            name: { es: 'Thul', en: 'Thul', zh: '书尔' },
            desc: { es: 'Arma: +25 Daño Hielo | Armadura/Casco/Escudo: +30%~35% Resist Hielo', en: 'Weapon: +25 Cold Damage | Armor/Helm/Shield: +30%~35% Cold Resist', zh: '武器：冰霜伤害+25 | 防具/头盔/盾牌：冰霜抗性+30%~35%' }
        },
        amn: {
            name: { es: 'Amn', en: 'Amn', zh: '安姆' },
            desc: { es: 'Arma: +7% Robo de Vida | Armadura/Casco/Escudo: +14~18 Daño de Espinas', en: 'Weapon: +7% Life Steal | Armor/Helm/Shield: +14~18 Thorns Damage', zh: '武器：生命偷取+7% | 防具/头盔/盾牌：荆棘反弹+14~18' }
        },
        sol: {
            name: { es: 'Sol', en: 'Sol', zh: '索尔' },
            desc: { es: 'Arma: +9 Daño Mín, +15% Daño | Armadura/Casco/Escudo: +7 Reducción de Daño', en: 'Weapon: +9 Min Damage, +15% Damage | Armor/Helm/Shield: +7 Damage Reduction', zh: '武器：最小伤害+9，伤害+15% | 防具/头盔/盾牌：物理伤害减免+7' }
        },
        shael: {
            name: { es: 'Shael', en: 'Shael', zh: '夏勒' },
            desc: { es: 'Arma: +20% Velocidad de Ataque | Escudo: +20% Prob. de Bloqueo | Armadura/Casco: +6 Regen Vida', en: 'Weapon: +20% Attack Speed | Shield: +20% Block Chance | Armor/Helm: +6 HP Regen', zh: '武器：攻击速度+20% | 盾牌：格挡率+20% | 防具/头盔：生命恢复+6' }
        }
    });

// Runeword table: keyed by RUNEWORDS id
    window.I18N.registerTable('runewords', {
        steel: {
            name: { es: 'Acero', en: 'Steel', zh: '钢铁' },
            desc: { es: 'Clásica arma cuerpo a cuerpo con velocidad de ataque y daño letal', en: 'Classic early melee weapon with high attack speed and damage', zh: '入门级近战神兵，攻速与伤害兼备' }
        },
        stealth: {
            name: { es: 'Sigilo', en: 'Stealth', zh: '隐秘' },
            desc: { es: 'Extraordinaria armadura para lanzadores con recuperación y resistencia al veneno', en: 'Outstanding mobility and caster armor with recovery and poison resist', zh: '极佳的机动与法系护甲，提供全面恢复与抗毒' }
        },
        spirit: {
            name: { es: 'Espíritu', en: 'Spirit', zh: '精神' },
            desc: { es: 'Palabra rúnica legendaria con +2 a todas las habilidades y multirresistencias', en: 'Legendary caster runeword granting +2 to all skills and multi-resistances', zh: '终极法师与多重抗性神符之语，全技能+2' }
        },
        lore: {
            name: { es: 'Saber', en: 'Lore', zh: '知识' },
            desc: { es: 'Yelmo del erudito con +1 a todas las habilidades y protección eléctrica', en: 'Scholar helm granting +1 all skills and lightning protection', zh: '博学者头盔，全技能+1与闪电防护' }
        },
        leaf: {
            name: { es: 'Hoja', en: 'Leaf', zh: '叶子' },
            desc: { es: 'Bastón piromante que potencia el daño de fuego y la resistencia ígnea', en: 'Pyromancer staff greatly boosting fire damage and resistance', zh: '狂热火焰使者之杖，大幅强化火焰伤害与火抗' }
        },
        smoke: {
            name: { es: 'Humo', en: 'Smoke', zh: '烟雾' },
            desc: { es: 'Armadura pesada de sigilo con +45 todas las resistencias y alta reducción de daño', en: 'Heavy stealth armor with +45 all resistances and high damage reduction', zh: '隐匿与厚实全抗重甲，全抗性+45与高额减伤' }
        },
        ancients_pledge: {
            name: { es: 'Voto Ancestral', en: "Ancient's Pledge", zh: '古代人的誓约' },
            desc: { es: 'Voto de los ancestros que otorga una colosal resistencia elemental', en: 'Ancient guardian ward granting massive elemental resistances', zh: '古代先祖守护，全元素抗性极大幅度提升' }
        }
    });

    // item typetable:keyis item-system.js inzhstring
    window.I18N.registerTable('itemTypes', {
        'Basic Armor': { name: { es: 'Armadura Pesada', en: 'Body Armor', zh: '防具' } },
        'Chest Armor': { name: { es: 'Peto / Armadura', en: 'Chest Armor', zh: '胸甲' } },
        'Helmet': { name: { es: 'Casco de Batalla', en: 'Helmet', zh: '头盔' } },
        'Shield': { name: { es: 'Escudo de Protección', en: 'Shield', zh: '盾牌' } },
        'Magic Ring': { name: { es: 'Anillo Mágico', en: 'Magic Ring', zh: '戒指' } },
        'Mystic Amulet': { name: { es: 'Amuleto Místico', en: 'Mystic Amulet', zh: '项链' } },
        'Gloves': { name: { es: 'Guantes de Cuero', en: 'Gloves', zh: '手套' } },
        'Boots': { name: { es: 'Botas Mágicas', en: 'Boots', zh: '鞋子' } },
        'Belt': { name: { es: 'Cinturón de Táctica', en: 'Belt', zh: '腰带' } },
        'Legendary Equipment': { name: { es: 'Equipo de Leyenda', en: 'Legendary Equipment', zh: '稀有装备' } },
        'Unique · ': { name: { es: 'Único · ', en: 'Unique · ', zh: '暗金·' } },
        // Legacy zh aliases (old saves / old loot-popup tables)
        '武器': { name: { es: 'Arma de Combate', en: 'Combat Weapon', zh: '武器' } },
        '防具': { name: { es: 'Armadura Pesada', en: 'Body Armor', zh: '防具' } },
        '胸甲': { name: { es: 'Peto / Armadura', en: 'Chest Armor', zh: '胸甲' } },
        '头盔': { name: { es: 'Casco de Batalla', en: 'Helmet', zh: '头盔' } },
        '盾牌': { name: { es: 'Escudo de Protección', en: 'Shield', zh: '盾牌' } },
        '戒指': { name: { es: 'Anillo Mágico', en: 'Magic Ring', zh: '戒指' } },
        '项链': { name: { es: 'Amuleto Místico', en: 'Mystic Amulet', zh: '项链' } },
        '手套': { name: { es: 'Guantes de Cuero', en: 'Gloves', zh: '手套' } },
        '鞋子': { name: { es: 'Botas Mágicas', en: 'Boots', zh: '鞋子' } },
        '腰带': { name: { es: 'Cinturón de Táctica', en: 'Belt', zh: '腰带' } },
        '稀有装备': { name: { es: 'Equipo de Leyenda', en: 'Legendary Equipment', zh: '稀有装备' } },
        '暗金·': { name: { es: 'Único · ', en: 'Unique · ', zh: '暗金·' } }
    });

    // Affix supplement table: keyed by zh strings from items-data.js not covered by i18n.js
    window.I18N.registerTable('affixesExtra', {
        'Venomous': { name: { es: 'Venenoso', en: 'Venomous', zh: '剧毒的' } },
        'of the Bear': { name: { es: 'del Oso', en: 'of the Bear', zh: '之熊' } },
        'of the Eagle': { name: { es: 'del Águila', en: 'of the Eagle', zh: '之鹰' } },
        'of the Leech': { name: { es: 'de la Sanguijuela', en: 'of the Leech', zh: '之吸血' } },
        'of Haste': { name: { es: 'de la Rapidez', en: 'of Haste', zh: '之急速' } },
        'of Strength': { name: { es: 'de la Fuerza', en: 'of Strength', zh: '之力量' } },
        'of Fire Res': { name: { es: 'de Resistencia al Fuego', en: 'of Fire Res', zh: '之抗火' } },
        'of Cold Res': { name: { es: 'de Resistencia al Frío', en: 'of Cold Res', zh: '之抗冰' } },
        'of Lightning Res': { name: { es: 'de Resistencia al Rayo', en: 'of Lightning Res', zh: '之抗电' } },
        'of Poison Res': { name: { es: 'de Resistencia al Veneno', en: 'of Poison Res', zh: '之抗毒' } },
        'of Protection': { name: { es: 'de la Protección', en: 'of Protection', zh: '之守护' } },
        'of Regeneration': { name: { es: 'de la Regeneración', en: 'of Regeneration', zh: '之再生' } },
        'of Meditation': { name: { es: 'de la Meditación', en: 'of Meditation', zh: '之冥想' } },
        'of Block': { name: { es: 'de Bloqueo', en: 'of Block', zh: '之格挡' } },
        'of Reflection': { name: { es: 'de Reflexión', en: 'of Reflection', zh: '之反射' } },
        'Divine Speed': { name: { es: 'Divina Velocidad', en: 'Divine Speed', zh: '之神速' } },
        'of Iron Wall': { name: { es: 'de Muro de Hierro', en: 'of Iron Wall', zh: '之铁壁' } },
        'of Precision': { name: { es: 'de Precisión', en: 'of Precision', zh: '之精准' } },
        'of Fortune': { name: { es: 'de la Fortuna', en: 'of Fortune', zh: '之幸运' } }
    });
})();
