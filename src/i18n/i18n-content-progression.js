(function () {
    'use strict';
    if (typeof window.I18N === 'undefined' || typeof window.I18N.registerTable !== 'function') return;

    // Achievement catalog: keyed by game.js ACHIEVEMENTS id; consistent with existing title/talent names in i18n.js
    window.I18N.registerTable('achievements', {
        kill_fallen_100: {
            name: { es: 'Rastreador de Corruptores', en: 'Fallen Hunter', zh: '沉沦魔猎手' },
            desc: { es: 'Mata a 100 Corruptores', en: 'Slay 100 Fallen', zh: '击杀100只沉沦魔' },
        },
        kill_fallen_1000: {
            name: { es: 'Cazador de Corruptores', en: 'Fallen Slayer', zh: '沉沦魔克星' },
            desc: { es: 'Mata a 1000 Corruptores', en: 'Slay 1000 Fallen', zh: '击杀1000只沉沦魔' },
        },
        kill_boss_5: {
            name: { es: 'Cazador de Jefes', en: 'Boss Hunter', zh: 'BOSS猎人' },
            desc: { es: 'Derrota a 5 enemigos de nivel jefe', en: 'Defeat 5 boss-level enemies', zh: '击败5个首领级敌人' },
        },
        kill_boss_20: {
            name: { es: 'Verdugo de Jefes', en: 'Boss Terminator', zh: 'BOSS终结者' },
            desc: { es: 'Derrota a 20 enemigos de nivel jefe', en: 'Defeat 20 boss-level enemies', zh: '击败20个首领级敌人' },
        },
        kill_boss_50: {
            name: { es: 'Destructor de Jefes', en: 'Boss Destroyer', zh: 'BOSS毁灭者' },
            desc: { es: 'Derrota a 50 enemigos de nivel jefe', en: 'Defeat 50 boss-level enemies', zh: '击败50个首领级敌人' },
        },
        kill_elite_30: {
            name: { es: 'Cazador Élite', en: 'Elite Hunter', zh: '精英猎人' },
            desc: { es: 'Mata a 30 monstruos élites', en: 'Slay 30 elite monsters', zh: '击杀30只精英怪物' },
        },
        kill_baal: {
            name: { es: 'Salvador del Mundo', en: 'World Savior', zh: '世界拯救者' },
            desc: { es: 'Derrota a Baal', en: 'Defeat Baal', zh: '击败巴尔' },
        },
        reach_floor_5: {
            name: { es: 'Primer Descenso', en: 'First Descent', zh: '初探地牢' },
            desc: { es: 'Alcanza el Piso 5 ({floorName})', en: 'Reach Floor 5 ({floorName})', zh: '到达第5层「{floorName}」' },
        },
        reach_floor_10: {
            name: { es: 'Conquistador de la Mazmorra', en: 'Dungeon Conqueror', zh: '地牢征服者' },
            desc: { es: 'Alcanza el Piso 10 ({floorName})', en: 'Reach Floor 10 ({floorName})', zh: '到达第10层「{floorName}」' },
        },
        reach_floor_20: {
            name: { es: 'Explorador del Abismo', en: 'Abyss Explorer', zh: '深渊探险家' },
            desc: { es: 'Alcanza el Piso 20 ({floorName})', en: 'Reach Floor 20 ({floorName})', zh: '到达第20层「{floorName}」' },
        },
        reach_floor_30: {
            name: { es: 'Buscador Sin Fin', en: 'Endless Seeker', zh: '无尽追寻者' },
            desc: { es: 'Alcanza el Piso 30 ({floorName})', en: 'Reach Floor 30 ({floorName})', zh: '到达第30层「{floorName}」' },
        },
        enter_hell: {
            name: { es: 'Caminante del Infierno', en: 'Hell Walker', zh: '地狱行者' },
            desc: { es: 'Entra en el modo Infierno', en: 'Enter Hell Mode', zh: '进入地狱模式' },
        },
        collect_unique_1: {
            name: { es: 'Primer Equipo Único', en: 'First Unique Drop', zh: '暗金初见' },
            desc: { es: 'Consigue 1 pieza de equipo Único', en: 'Obtain 1 Unique piece of equipment', zh: '获得1件暗金装备' },
        },
        collect_unique_10: {
            name: { es: 'Coleccionista de Únicos', en: 'Unique Collector', zh: '暗金收藏家' },
            desc: { es: 'Acumula 10 piezas de equipo Único', en: 'Collect 10 Unique pieces of equipment', zh: '累计获得10件暗金装备' },
        },
        collect_set_1: {
            name: { es: 'Primer Conjunto', en: 'First Set Piece', zh: '套装初识' },
            desc: { es: 'Consigue 1 pieza de equipo de conjunto', en: 'Obtain 1 Set equipment piece', zh: '获得1件套装装备' },
        },
        collect_set_10: {
            name: { es: 'Coleccionista de Conjuntos', en: 'Set Collector', zh: '套装收藏家' },
            desc: { es: 'Acumula 10 piezas de equipo de conjunto', en: 'Collect 10 Set equipment pieces', zh: '累计获得10件套装装备' },
        },
        equip_full_set: {
            name: { es: 'Maestro de Conjuntos', en: 'Set Master', zh: '套装大师' },
            desc: { es: 'Equipa un conjunto completo a la vez (6 piezas)', en: 'Wear a full set at once (6 pieces)', zh: '同时穿戴一套完整套装（6件）' },
        },
        total_damage_100k: {
            name: { es: 'Generador de Daño', en: 'Damage Dealer', zh: '伤害输出者' },
            desc: { es: 'Inflige 100,000 puntos de daño en total', en: 'Deal 100,000 total damage', zh: '累计造成10万点伤害' },
        },
        total_damage_1m: {
            name: { es: 'Cosechador del Campo de Batalla', en: 'Battlefield Reaper', zh: '战场收割者' },
            desc: { es: 'Inflige 1,000,000 puntos de daño en total', en: 'Deal 1,000,000 total damage', zh: '累计造成100万点伤害' },
        },
        crit_count_100: {
            name: { es: 'Novato del Crítico', en: 'Crit Novice', zh: '暴击新手' },
            desc: { es: 'Logra 100 golpes críticos', en: 'Land 100 critical hits', zh: '触发100次暴击' },
        },
        crit_count_1000: {
            name: { es: 'Maestro Crítico', en: 'Critical Master', zh: '暴击大师' },
            desc: { es: 'Logra 1000 golpes críticos', en: 'Land 1000 critical hits', zh: '触发1000次暴击' },
        },
        combo_50: {
            name: { es: 'Experto en Combos', en: 'Combo Master', zh: '连击达人' },
            desc: { es: 'Alcanza una cadena de 50 golpes', en: 'Reach a 50-hit combo', zh: '达成50连击' },
        },
        use_skill_500: {
            name: { es: 'Aprendiz de Habilidades', en: 'Skill Apprentice', zh: '技能练习生' },
            desc: { es: 'Usa habilidades 500 veces', en: 'Use skills 500 times', zh: '使用技能500次' },
        },
        gold_10k: {
            name: { es: 'Hogar Acomodado', en: 'Comfortable Living', zh: '小康之家' },
            desc: { es: 'Acumula 10,000 de oro', en: 'Earn 10,000 gold in total', zh: '累计获得1万金币' },
        },
        gold_100k: {
            name: { es: 'El más Rico de la Zona', en: 'Local Tycoon', zh: '富甲一方' },
            desc: { es: 'Acumula 100,000 de oro', en: 'Earn 100,000 gold in total', zh: '累计获得10万金币' },
        },
        gold_1m: {
            name: { es: 'Multimillonario', en: 'Billionaire', zh: '亿万富翁' },
            desc: { es: 'Acumula 1,000,000 de oro', en: 'Earn 1,000,000 gold in total', zh: '累计获得100万金币' },
        },
        enhance_5: {
            name: { es: 'Aprendiz de Herrero', en: 'Blacksmith Apprentice', zh: '铁匠学徒' },
            desc: { es: 'Mejora el equipo hasta +5', en: 'Enhance gear up to +5', zh: '将装备强化至+5' },
        },
        enhance_9: {
            name: { es: 'Maestro Herrero', en: 'Blacksmith Master', zh: '铁匠大师' },
            desc: { es: 'Mejora el equipo hasta +9', en: 'Enhance gear up to +9', zh: '将装备强化至+9' },
        },
        reach_level_10: {
            name: { es: 'Promesa Aventurera', en: 'Rising Adventurer', zh: '冒险新秀' },
            desc: { es: 'Alcanza el nivel 10', en: 'Reach level 10', zh: '达到等级10' },
        },
        reach_level_30: {
            name: { es: 'Héroe Legendario', en: 'Legendary Hero', zh: '传奇英雄' },
            desc: { es: 'Alcanza el nivel 30', en: 'Reach level 30', zh: '达到等级30' },
        },
        reach_level_50: {
            name: { es: 'Dios de la Guerra Inmortal', en: 'Immortal War God', zh: '不朽战神' },
            desc: { es: 'Alcanza el nivel 50', en: 'Reach level 50', zh: '达到等级50' },
        },
        buy_talent_30: {
            name: { es: 'Coleccionista de Talentos', en: 'Talent Collector', zh: '天赋收集者' },
            desc: { es: 'Compra 30 talentos', en: 'Purchase 30 talents', zh: '购买30个天赋' },
        },
        blessing_10: {
            name: { es: 'Favorito de la Bendición', en: 'Blessing Favorite', zh: '赐福宠儿' },
            desc: { es: 'Recibe 10 Bendiciones Divinas', en: 'Receive 10 Divine Blessings', zh: '获得10次天神赐福' },
        },
    });

    // Achievement categories: keyed by game.js ACHIEVEMENT_CATEGORIES category id
    window.I18N.registerTable('achievementCategories', {
        kill: { label: { es: 'Bajas', en: 'Kills', zh: '击杀' } },
        explore: { label: { es: 'Exploración', en: 'Exploration', zh: '探索' } },
        collect: { label: { es: 'Colección', en: 'Collection', zh: '收集' } },
        combat: { label: { es: 'Combate', en: 'Combat', zh: '战斗' } },
        economy: { label: { es: 'Economía', en: 'Economy', zh: '经济' } },
        growth: { label: { es: 'Progresión', en: 'Growth', zh: '成长' } },
    });

    // Ten main quests: keyed by String(QUEST_DB[i].id); name reuses the floor_display_floor pattern, es descriptions keep the original hardcoded Spanish
    window.I18N.registerTable('quests', {
        0: {
            name: { es: 'Piso {floor} {floorName}', en: 'Floor {floor} {floorName}', zh: '{floor}层 {floorName}' },
            desc: {
                es: 'Elimina 10 monstruos en el Piso 1 「{floorName}」.',
                en: 'Slay 10 monsters on Floor 1 ({floorName}).',
                zh: '清除第1层「{floorName}」的 10 只怪物。',
            },
        },
        1: {
            name: { es: 'Piso {floor} {floorName}', en: 'Floor {floor} {floorName}', zh: '{floor}层 {floorName}' },
            desc: {
                es: 'Derrota a "Cuervo Sangriento" en el Piso 2 「{floorName}」.',
                en: 'Defeat elite "Blood Raven" on Floor 2 ({floorName}).',
                zh: '在第2层「{floorName}」击杀精英怪「血鸟」。',
            },
        },
        2: {
            name: { es: 'Piso {floor} {floorName}', en: 'Floor {floor} {floorName}', zh: '{floor}层 {floorName}' },
            desc: {
                es: 'Elimina 15 monstruos en el Piso 3 「{floorName}」.',
                en: 'Slay 15 monsters on Floor 3 ({floorName}).',
                zh: '清除第3层「{floorName}」的 15 只怪物。',
            },
        },
        3: {
            name: { es: 'Piso {floor} {floorName}', en: 'Floor {floor} {floorName}', zh: '{floor}层 {floorName}' },
            desc: {
                es: 'Derrota a "La Condesa" en el Piso 4 「{floorName}」.',
                en: 'Defeat "The Countess" on Floor 4 ({floorName}).',
                zh: '在第4层「{floorName}」击杀「女伯爵」。',
            },
        },
        4: {
            name: { es: 'Piso {floor} {floorName}', en: 'Floor {floor} {floorName}', zh: '{floor}层 {floorName}' },
            desc: {
                es: 'Derrota a "El Carnicero" en el Piso 5 「{floorName}」.',
                en: 'Defeat "The Butcher" on Floor 5 ({floorName}).',
                zh: '在第5层「{floorName}」击杀「屠夫」。',
            },
        },
        5: {
            name: { es: 'Piso {floor} {floorName}', en: 'Floor {floor} {floorName}', zh: '{floor}层 {floorName}' },
            desc: {
                es: 'Elimina 20 monstruos en el Piso 6 「{floorName}」.',
                en: 'Slay 20 monsters on Floor 6 ({floorName}).',
                zh: '清除第6层「{floorName}」的 20 只怪物。',
            },
        },
        6: {
            name: { es: 'Piso {floor} {floorName}', en: 'Floor {floor} {floorName}', zh: '{floor}层 {floorName}' },
            desc: {
                es: 'Derrota a "Puño de Madera" en el Piso 7 「{floorName}」.',
                en: 'Defeat elite "Treehead WoodFist" on Floor 7 ({floorName}).',
                zh: '在第7层「{floorName}」击杀精英怪「树头木拳」。',
            },
        },
        7: {
            name: { es: 'Piso {floor} {floorName}', en: 'Floor {floor} {floorName}', zh: '{floor}层 {floorName}' },
            desc: {
                es: 'Elimina 25 monstruos en el Piso 8 「{floorName}」.',
                en: 'Slay 25 monsters on Floor 8 ({floorName}).',
                zh: '清除第8层「{floorName}」的 25 只怪物。',
            },
        },
        8: {
            name: { es: 'Piso {floor} {floorName}', en: 'Floor {floor} {floorName}', zh: '{floor}层 {floorName}' },
            desc: {
                es: 'Derrota a "Diablo" en el Piso 9 「{floorName}」.',
                en: 'Defeat "Diablo" on Floor 9 ({floorName}).',
                zh: '在第9层「{floorName}」击杀「暗黑破坏神」。',
            },
        },
        9: {
            name: { es: 'Piso {floor} {floorName}', en: 'Floor {floor} {floorName}', zh: '{floor}层 {floorName}' },
            desc: {
                es: 'Vence a Baal en el Piso 10 「{floorName}」 y salva el mundo.',
                en: 'Defeat Baal on Floor 10 ({floorName}) and save the world.',
                zh: '在第10层「{floorName}」击败巴尔，拯救世界。',
            },
        },
    });

// Endless quest description templates: kill_boss/kill_count match i18n.js getQuestDesc verbatim; gen_* matches text generated by game.js getCurrentQuest
    window.I18N.registerTable('questGoals', {
        kill_boss: {
            template: {
                es: 'Derrota a {monster} en el Piso {floor} ({floorName}).',
                en: 'Defeat {monster} on Floor {floor} ({floorName}).',
                zh: '在第{floor}层「{floorName}」击杀{monster}。',
            },
        },
        kill_count: {
            template: {
                es: 'Elimina a {count} monstruos en el Piso {floor} ({floorName}).',
                en: 'Defeat {count} monsters on Floor {floor} ({floorName}).',
                zh: '在第{floor}层「{floorName}」击杀 {count} 只怪物。',
            },
        },
        gen_kill_boss: {
            template: {
                es: 'Derrota al poderoso {monster} en el Piso {floor} 「{floorName}」.',
                en: 'Defeat the mighty {monster} on Floor {floor} ({floorName}).',
                zh: '在第{floor}层「{floorName}」击杀强大的{monster}。',
            },
        },
        gen_kill_count: {
            template: {
                es: 'Elimina {count} monstruos del Piso {floor} 「{floorName}」.',
                en: 'Clear {count} monsters from Floor {floor} ({floorName}).',
                zh: '清除第{floor}层「{floorName}」的 {count} 只怪物。',
            },
        },
    });

    // Quest reward text: keyed by the reward string as passed, covering i18n.js rewardMap, QUEST_DB Spanish rewards, endless-quest fragments and weekly rewards
    window.I18N.registerTable('questRewards', {
        '1 技能点': { label: { es: '1 Punto de Habilidad', en: '1 Skill Point', zh: '1 技能点' } },
        '2 技能点': { label: { es: '2 Puntos de Habilidad', en: '2 Skill Points', zh: '2 技能点' } },
        '稀有戒指': { label: { es: 'Anillo Raro', en: 'Rare Ring', zh: '稀有戒指' } },
        '500 金币': { label: { es: '500 Oro', en: '500 Gold', zh: '500 金币' } },
        '1000 金币': { label: { es: '1000 Oro', en: '1000 Gold', zh: '1000 金币' } },
        '随机符文': { label: { es: 'Runa Aleatoria', en: 'Random Rune', zh: '随机符文' } },
        '暗金装备': { label: { es: 'Equipo Único', en: 'Unique Equipment', zh: '暗金装备' } },
        '暗金饰品': { label: { es: 'Accesorio Único', en: 'Unique Accessory', zh: '暗金饰品' } },
        '传奇装备': { label: { es: 'Equipo Legendario', en: 'Legendary Equipment', zh: '传奇装备' } },
        '终极神装': { label: { es: 'Reliquia Divina Final', en: 'Ultimate Divine Relic', zh: '终极神装' } },
        '1 Punte de Habilidad': { label: { es: '1 Punte de Habilidad', en: '1 Skill Point', zh: '1 技能点' } },
        '2 Puntos de Habilidad': { label: { es: '2 Puntos de Habilidad', en: '2 Skill Points', zh: '2 技能点' } },
        '500 Oro': { label: { es: '500 Oro', en: '500 Gold', zh: '500 金币' } },
        '1000 Oro': { label: { es: '1000 Oro', en: '1000 Gold', zh: '1000 金币' } },
        'Anillo Raro': { label: { es: 'Anillo Raro', en: 'Rare Ring', zh: '稀有戒指' } },
        'Runa Aleatoria': { label: { es: 'Runa Aleatoria', en: 'Random Rune', zh: '随机符文' } },
        'Equipo Único': { label: { es: 'Equipo Único', en: 'Unique Equipment', zh: '暗金装备' } },
        'Amuleto Único': { label: { es: 'Amuleto Único', en: 'Unique Amulet', zh: '暗金饰品' } },
        'Equipo Legendario': { label: { es: 'Equipo Legendario', en: 'Legendary Equipment', zh: '传奇装备' } },
        'Equipo Divino': { label: { es: 'Equipo Divino', en: 'Divine Equipment', zh: '终极神装' } },
        '金币': { label: { es: 'Oro', en: 'Gold', zh: '金币' } },
        '& 1 技能点': { label: { es: '& 1 Punto de Habilidad', en: '& 1 Skill Point', zh: '& 1 技能点' } },
        '& 随机装备': { label: { es: '& Equipo Aleatorio', en: '& Random Equipment', zh: '& 随机装备' } },
        '随机暗金': { label: { es: 'Único Aleatorio', en: 'Random Unique', zh: '随机暗金' } },
    });

    // Daily quests and weekly goals: keyed by daily-quest.js template type; weekly keys are weekly_<goalId>; desc uses {target} interpolation
    window.I18N.registerTable('dailyQuests', {
        kill: {
            name: { es: 'Cazar Monstruos', en: 'Monster Hunt', zh: '击杀怪物' },
            desc: { es: 'Mata a {target} monstruos', en: 'Slay {target} monsters', zh: '击杀{target}只怪物' },
        },
        kill_elite: {
            name: { es: 'Caza de Élites', en: 'Elite Hunt', zh: '击杀精英怪' },
            desc: { es: 'Mata a {target} monstruos élites', en: 'Slay {target} elite monsters', zh: '击杀{target}只精英怪' },
        },
        kill_boss: {
            name: { es: 'Cacería de Jefes', en: 'Boss Hunt', zh: '击杀BOSS' },
            desc: { es: 'Mata a {target} jefes', en: 'Slay {target} bosses', zh: '击杀{target}个BOSS' },
        },
        collect_gold: {
            name: { es: 'Acopio de Oro', en: 'Gold Rush', zh: '收集金币' },
            desc: { es: 'Reúne {target} de oro', en: 'Gather {target} gold', zh: '收集{target}金币' },
        },
        collect_item: {
            name: { es: 'Recolectar Equipo', en: 'Gear Gathering', zh: '拾取装备' },
            desc: { es: 'Recoge {target} piezas de equipo', en: 'Pick up {target} pieces of gear', zh: '拾取{target}件装备' },
        },
        use_potion: {
            name: { es: 'Uso de Pociones', en: 'Potion Use', zh: '使用药水' },
            desc: { es: 'Usa {target} pociones', en: 'Use {target} potions', zh: '使用{target}瓶药水' },
        },
        clear_floor: {
            name: { es: 'Dominar la Mazmorra', en: 'Floor Clearing', zh: '通关地牢' },
            desc: { es: 'Supera {target} pisos de la mazmorra', en: 'Clear {target} dungeon floors', zh: '通关{target}层地牢' },
        },
        weekly_kill_500: {
            name: { es: 'Purga de Monstruos', en: 'Monster Purge', zh: '怪物清剿' },
            desc: { es: 'Mata a 500 monstruos', en: 'Slay 500 monsters', zh: '击杀 500 只怪物' },
        },
        weekly_collect_rares: {
            name: { es: 'Colección de Tesoros', en: 'Treasure Collection', zh: '珍品收集' },
            desc: { es: 'Reúne 5 piezas de equipo Raro/Único', en: 'Collect 5 Rare/Unique pieces of gear', zh: '收集 5 件稀有/暗金装备' },
        },
        weekly_reach_floor_15: {
            name: { es: 'Descenso al Abismo', en: 'Abyss Descent', zh: '勇闯深渊' },
            desc: { es: 'Llega al Piso 15 de la mazmorra', en: 'Reach Floor 15 of the dungeon', zh: '在地牢中到达第 15 层' },
        },
    });

    // Abyss covenants: keyed by abyss-system.js CONTRACTS id
    window.I18N.registerTable('abyssContracts', {
        low_hp: {
            name: { es: 'Contrato Anémico', en: 'Anemia Pact', zh: '贫血契约' },
            desc: { es: 'Vida máxima reducida un 30%', en: 'Max HP reduced by 30%', zh: '最大生命降低 30%' },
        },
        glass_cannon: {
            name: { es: 'Contrato Frágil', en: 'Glass Pact', zh: '脆皮契约' },
            desc: { es: 'Defensa reducida un 50%', en: 'Defense reduced by 50%', zh: '防御力降低 50%' },
        },
        slow_motion: {
            name: { es: 'Contrato Lento', en: 'Slow Motion Pact', zh: '慢速契约' },
            desc: { es: 'Velocidad de movimiento reducida un 20%', en: 'Movement speed reduced by 20%', zh: '移动速度降低 20%' },
        },
        elemental_curse: {
            name: { es: 'Contrato Elemental', en: 'Elemental Curse', zh: '元素契约' },
            desc: { es: 'Todas las resistencias reducidas un 40%', en: 'All resistances reduced by 40%', zh: '全抗性降低 40%' },
        },
        vampire_bane: {
            name: { es: 'Contrato Antivampirismo', en: 'Vampire Bane Pact', zh: '绝愈契约' },
            desc: { es: 'El robo de vida no funciona', en: 'Life leech is disabled', zh: '生命偷取无效' },
        },
    });

    // Abyss brackets: keyed by BRACKETS id; desc renders the level range with {min}/{max}
    window.I18N.registerTable('abyssBrackets', {
        rookie: {
            name: { es: 'Liga Novato', en: 'Rookie League', zh: '新秀赛' },
            desc: { es: 'Niveles {min}-{max}', en: 'Levels {min}-{max}', zh: '等级 {min}-{max}' },
        },
        elite: {
            name: { es: 'Liga Élite', en: 'Elite League', zh: '精英赛' },
            desc: { es: 'Niveles {min}-{max}', en: 'Levels {min}-{max}', zh: '等级 {min}-{max}' },
        },
        peak: {
            name: { es: 'Liga Cima', en: 'Peak League', zh: '巅峰赛' },
            desc: { es: 'Niveles {min}-{max}', en: 'Levels {min}-{max}', zh: '等级 {min}-{max}' },
        },
    });

    // Abyss tiers: keyed by TIERS minScore (the only stable runtime identifier); es/en reuse the original nameEs/nameEn
    window.I18N.registerTable('abyssTiers', {
        25000: { name: { es: 'Leyenda Eterna', en: 'Eternal Legend', zh: '永恒至尊' } },
        12000: { name: { es: 'Maestro del Abismo', en: 'Abyss Master', zh: '深渊宗师' } },
        6000: { name: { es: 'Conquistador de Diamante', en: 'Diamond Conqueror', zh: '钻石征服者' } },
        3000: { name: { es: 'Señor de Platino', en: 'Platinum Lord', zh: '铂金领主' } },
        1500: { name: { es: 'Guardián de Oro', en: 'Gold Guardian', zh: '黄金卫士' } },
        500: { name: { es: 'Vanguardia de Plata', en: 'Silver Vanguard', zh: '白银先锋' } },
        0: { name: { es: 'Prueba de Bronce', en: 'Bronze Trial', zh: '青铜试炼' } },
    });

    // Season S1: all keys use { label }; milestones split into _name/_desc; title_ keys are the milestone id granting the title
    window.I18N.registerTable('season', {
        season_1_name: {
            label: { es: 'Temporada 1: Espada del Alba', en: 'Season 1: Sword of Dawnbreak', zh: '第一赛季：破晓之剑' },
        },
        season_1_buff: {
            label: { es: '⚡ Bendición de Temporada: +15% Daño de Fuego y Rayo en mazmorras.', en: '⚡ Season Blessing: +15% Fire & Lightning Damage in dungeons.', zh: '⚡ 赛季赐福：地牢中火系与雷电伤害提升 15%。' },
        },
        milestone_s1_reach_f10_name: {
            label: { es: 'Alcanzar el Piso 10', en: 'Reach Floor 10', zh: '踏足第10层' },
        },
        milestone_s1_reach_f10_desc: {
            label: { es: 'Explora y supera los primeros 10 pisos del calabozo.', en: 'Explore and conquer the first 10 floors.', zh: '深入探索并通关前10层。' },
        },
        milestone_s1_kill_elites_name: {
            label: { es: 'Cazador de Élite', en: 'Elite Hunter', zh: '精英猎魔人' },
        },
        milestone_s1_kill_elites_desc: {
            label: { es: 'Derrota a 20 monstruos élite con afijos.', en: 'Defeat 20 elite monsters with affixes.', zh: '讨伐 20 只具有随机词缀的精英魔物。' },
        },
        milestone_s1_craft_runeword_name: {
            label: { es: 'Forjador de Runas', en: 'Runeword Crafter', zh: '符文工匠' },
        },
        milestone_s1_craft_runeword_desc: {
            label: { es: 'Engarza y crea al menos 1 Palabra Rúnica antigua.', en: 'Socket and craft at least 1 ancient Runeword.', zh: '成功镶嵌并激活至少 1 件远古符文之语。' },
        },
        milestone_s1_reach_f20_name: {
            label: { es: 'Conquistador de la Oscuridad', en: 'Conqueror of Darkness', zh: '深渊征服者' },
        },
        milestone_s1_reach_f20_desc: {
            label: { es: 'Alcanza el Piso 20 o supera la Prueba de Abismo.', en: 'Reach Floor 20 or conquer Trial Abyss.', zh: '达到第20层或完成深渊试炼。' },
        },
        title_s1_reach_f10: {
            label: { es: 'Vanguardia del Alba', en: 'Dawnbreak Vanguard', zh: '破晓先锋' },
        },
        title_s1_reach_f20: {
            label: { es: 'Conquistor del Alba', en: 'Dawnbreak Conqueror', zh: '破晓征服者' },
        },
    });

    // Returning hero bundle: first 10 entries match i18n.js flat return_* dict verbatim; gold_title/claim_toast/double_exp_badge are the only gaps
    window.I18N.registerTable('returnBonus', {
        banner_title: { label: { es: 'Regreso a Santuario · El Renacer de la Leyenda', en: 'Return to Sanctuary · Legend Reborn', zh: '回归庇护所 · 传奇再临' } },
        banner_sub: { label: { es: '¡Santuario te necesita! Hemos preparado estos pertrechos de guerra para tu regreso:', en: 'Sanctuary has awaited your return! Here are your triumph war gifts:', zh: '庇护所一直在等待强大的勇者归来！这是为你准备的凯旋战礼：' } },
        reward_exp: { label: { es: '30 Minutos de Doble Experiencia', en: '30-Min Double EXP Blessing', zh: '30分钟 双倍经验祝福' } },
        reward_exp_desc: { label: { es: 'Obtén +100% de EXP adicional en todas tus batallas.', en: 'Gain +100% bonus EXP from all monster defeats.', zh: '讨伐所有魔物获得 200% 经验收益' } },
        gold_title: { label: { es: 'Oro de Campaña +{gold}', en: 'Campaign Gold +{gold}', zh: '军资黄金 +{gold}' } },
        reward_gold_desc: { label: { es: 'Oro de intendencia para mejorar y forjar equipo.', en: 'Campaign gold to forge relics and learn skills.', zh: '用于打造神兵与学习全新技能' } },
        reward_chest: { label: { es: 'Cofre de Equipamiento Selecto', en: 'Rare Mystical Gear Chest', zh: '稀有神秘神装宝箱' } },
        reward_chest_desc: { label: { es: 'Contiene garantizada una pieza Rara o Única.', en: 'Guaranteed 1 Rare or Unique piece of equipment.', zh: '必得 1 件强力黄色或暗金品质装备' } },
        reward_sp: { label: { es: '1 Punto de Habilidad Extra', en: '1 Bonus Skill Point', zh: '技能悟性点 +1' } },
        reward_sp_desc: { label: { es: 'Desbloquea o potencia tácticas de combate.', en: 'Unlock and enhance high-tier combat masteries.', zh: '突破技能树，解锁高阶战术技能' } },
        claim_btn: { label: { es: '⚔️ Reclamar Pertrechos y Marchar ⚔️', en: '⚔️ Claim Gifts & Embark ⚔️', zh: '⚔️ 领取大礼并启程 ⚔️' } },
        claim_toast: { label: { es: '✨ ¡Paquete de héroe retornado reclamado! 2X EXP activo por 30m.', en: '✨ Returning hero gift claimed! 2X EXP active for 30m.', zh: '✨ 回归大礼已领取！30分钟双倍经验已激活！' } },
        double_exp_badge: { label: { es: '⭐ 2X EXP:', en: '⭐ 2X EXP:', zh: '⭐ 2X EXP:' } },
    });

    // Talent 3-pick-1 panel: keyed by fixed panel copy; title/success_toast use {floor}/{name} interpolation
    window.I18N.registerTable('talentDraft', {
        header: { label: { es: '🌟 Recompensa del Piso {floor} 🌟', en: '🌟 Floor {floor} Milestone Reward 🌟', zh: '🌟 勇者勋赏：第 {floor} 层通关嘉奖 🌟' } },
        subtitle: { label: { es: 'Selecciona 1 talento gratuito para potenciar a tu héroe:', en: 'Choose 1 free ancient talent to empower your hero:', zh: '从下方 3 项古代天赋中选择 1 项免费获取（无需消耗金币）：' } },
        pick_button: { label: { es: 'Elegir Talento', en: 'Pick Talent', zh: '选择天赋' } },
        success_toast: { label: { es: '🎉 ¡Has obtenido el talento gratuito [{name}]!', en: '🎉 Gained free talent [{name}]!', zh: '🎉 免费领悟天赋【{name}】！' } },
    });

    // Titles missing from i18n.js titles: keyed by zh strings season-system.js writes into player.titles
    window.I18N.registerTable('titlesExtra', {
        '破晓先锋': { name: { es: 'Vanguardia del Alba', en: 'Dawnbreak Vanguard', zh: '破晓先锋' } },
        '破晓征服者': { name: { es: 'Conquistor del Alba', en: 'Dawnbreak Conqueror', zh: '破晓征服者' } },
    });

    // i18n.js talents' 20 entries already cover all constants.js TALENTS; this table stays empty as a placeholder for future talents
    window.I18N.registerTable('talentsExtra', {});
})();
