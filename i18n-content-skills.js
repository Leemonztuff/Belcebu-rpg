(function () {
    'use strict';
    if (typeof window.I18N === 'undefined' || typeof window.I18N.registerTable !== 'function') return;

    // 技能树文案：与 constants.js 的 SKILL_TREE 逐层对应，zh 为原始中文
    window.I18N.registerTable('skillTree', {
        fireball: {
            stage1: {
                fireball: {
                    name: { es: 'Bola de Fuego', en: 'Fireball', zh: '火球术' },
                    desc: { es: 'Lanza bolas de fuego contra los enemigos', en: 'Hurls a fireball at enemies', zh: '发射火球攻击敌人' },
                },
            },
            stage2: {
                explosion: {
                    name: { es: 'Explosión Potenciada', en: 'Empowered Explosion', zh: '爆炸强化' },
                    desc: { es: 'Radio de explosión +15% y daño de explosión +8% por nivel', en: '+15% explosion radius and +8% explosion damage per level', zh: '爆炸范围+15%/级，爆炸伤害+8%/级' },
                },
                burn: {
                    name: { es: 'Quemadura', en: 'Burn', zh: '灼烧' },
                    desc: { es: 'Aplica quemadura continua: 6% de daño por segundo y por nivel, dura 2 + 0.4 s por nivel', en: 'Applies a burn DoT: 6% damage per second per level, lasting 2 + 0.4s per level', zh: '附加灼烧DOT，每秒6%伤害/级，持续2+0.4秒/级' },
                },
            },
            stage3: {
                meteor: {
                    name: { es: 'Meteoro', en: 'Meteor', zh: '陨石术' },
                    desc: { es: 'La bola de fuego se convierte en meteoro: +100% de daño de explosión y el punto de impacto arde 3 s', en: 'The fireball becomes a meteor: +100% explosion damage and the impact point burns for 3s', zh: '火球变陨石，爆炸伤害+100%，落点燃烧3秒' },
                },
                nova: {
                    name: { es: 'Nova de Fuego', en: 'Fire Nova', zh: '火焰新星' },
                    desc: { es: 'Al lanzarla, estalla a tu alrededor una onda de fuego', en: 'On cast, a wave of fire erupts centered on yourself', zh: '释放时同时以自身为中心爆发火焰波' },
                },
                spread: {
                    name: { es: 'Propagación', en: 'Spread', zh: '蔓延' },
                    desc: { es: 'La quemadura se contagia a los enemigos cercanos con un 60% del daño', en: 'Burn spreads to nearby enemies at 60% damage', zh: '灼烧传染给周围敌人，传染伤害60%' },
                },
                detonate: {
                    name: { es: 'Inmolación', en: 'Immolate', zh: '焚尽' },
                    desc: { es: 'Los enemigos quemados reciben +30% de daño de fuego y explotan al terminar la quemadura', en: 'Burning enemies take +30% fire damage and explode when the burn ends', zh: '灼烧中敌人受火伤+30%，灼烧结束时引爆' },
                },
            },
        },
        thunder: {
            stage1: {
                thunder: {
                    name: { es: 'Descarga Eléctrica', en: 'Lightning Strike', zh: '雷电术' },
                    desc: { es: 'Invoca rayos que golpean a los enemigos', en: 'Calls down lightning to strike enemies', zh: '召唤雷电打击敌人' },
                },
            },
            stage2: {
                chain: {
                    name: { es: 'Encadenado', en: 'Chain Lightning', zh: '连锁' },
                    desc: { es: '+1 objetivo encadenado y -5% de pérdida de daño por salto y nivel', en: '+1 chain target and -5% chain falloff per level', zh: '弹射目标+1/级，弹射衰减-5%/级' },
                },
                shock: {
                    name: { es: 'Electrochoque', en: 'Shock', zh: '感电' },
                    desc: { es: 'Paraliza 0.3 + 0.1 s y aumenta un 10% el daño de rayo recibido, por nivel', en: 'Paralyzes for 0.3 + 0.1s and takes 10% more lightning damage per level', zh: '麻痹0.3+0.1秒/级，受雷伤+10%/级' },
                },
            },
            stage3: {
                storm: {
                    name: { es: 'Tormenta', en: 'Thunderstorm', zh: '雷暴' },
                    desc: { es: 'Crea una tormenta de 3 s que descarga un rayo cada 0.5 s y ralentiza un 30%', en: 'Creates a 3s storm that strikes with lightning every 0.5s and slows enemies by 30%', zh: '创造雷暴区域3秒，每0.5秒落雷，区域减速30%' },
                },
                overload: {
                    name: { es: 'Sobrecarga', en: 'Overload', zh: '超载' },
                    desc: { es: 'Explota al matar: la explosión inflige un 10% de la vida máxima del enemigo', en: 'Explodes on kill for 10% of the enemy max HP', zh: '击杀时爆炸，爆炸=敌人10%最大生命' },
                },
                torture: {
                    name: { es: 'Tortura Eléctrica', en: 'Electrocution', zh: '电刑' },
                    desc: { es: 'Mientras el enemigo está electrizado pierde vida cada segundo: un 20% del daño del rayo', en: 'Shocked enemies keep losing HP every second equal to 20% of the lightning damage', zh: '感电期间持续掉血，每秒=雷电伤害×20%' },
                },
                shield: {
                    name: { es: 'Escudo de Arco', en: 'Arc Shield', zh: '电弧护盾' },
                    desc: { es: 'Cada impacto genera un escudo igual al 15% del daño y te protege del control mientras dura', en: 'Landing a hit grants a shield equal to 15% of the damage and grants control immunity while it lasts', zh: '击中获得护盾=伤害×15%，护盾期间免控' },
                },
            },
        },
        multishot: {
            stage1: {
                multishot: {
                    name: { es: 'Disparo Múltiple', en: 'Multishot', zh: '多重射击' },
                    desc: { es: 'Dispara varias flechas en abanico', en: 'Fires a fan of arrows', zh: '扇形发射多支箭矢' },
                },
            },
            stage2: {
                pierce: {
                    name: { es: 'Perforación', en: 'Pierce', zh: '穿透' },
                    desc: { es: 'Atraviesa +1 enemigo y pierde un 4% menos de daño por nivel', en: 'Pierces +1 enemy and loses 4% less damage per level', zh: '穿透+1敌人/级，穿透衰减-4%/级' },
                },
                spread: {
                    name: { es: 'Dispersión', en: 'Spread', zh: '扩散' },
                    desc: { es: '+1 flecha adicional y +5° de abanico por nivel', en: '+1 extra arrow and +5° spread angle per level', zh: '额外箭矢+1/级，扩散角+5°/级' },
                },
            },
            stage3: {
                rain: {
                    name: { es: 'Lluvia de Flechas', en: 'Arrow Rain', zh: '箭雨' },
                    desc: { es: 'Las flechas se dividen y caen del cielo, causando un 60% del daño de una flecha en el área', en: 'Arrows split and rain from the sky, dealing 60% of single-arrow damage over the area', zh: '箭矢飞行后分裂下落，覆盖范围伤害=单箭×60%' },
                },
                snipe: {
                    name: { es: 'Disparo de Precisión', en: 'Snipe', zh: '狙击' },
                    desc: { es: 'Mantén pulsado hasta 2 s: +50% de daño por segundo y +3 de perforación', en: 'Hold to charge for 2s: +50% damage per second and +3 pierce', zh: '长按蓄力2秒，伤害+50%/秒，穿透+3' },
                },
                barrage: {
                    name: { es: 'Andanada', en: 'Barrage', zh: '弹幕' },
                    desc: { es: 'Dispara 3 andanadas con 0.2 s de intervalo y un +80% de daño total', en: 'Fires 3 waves 0.2s apart for +80% total damage', zh: '连发3波，间隔0.2秒，总伤害+80%' },
                },
                split: {
                    name: { es: 'Flecha Dividida', en: 'Split Arrow', zh: '分裂箭' },
                    desc: { es: 'Las flechas se dividen en 2 durante el vuelo, con un 50% de daño por flecha pequeña', en: 'Arrows split into 2 mid-flight, each dealing 50% damage', zh: '箭矢飞行中分裂成2支，小箭伤害50%' },
                },
            },
        },
        holy_shield: {
            stage1: {
                holy_shield: {
                    name: { es: 'Escudo Sagrado', en: 'Holy Shield', zh: '神圣护盾' },
                    desc: { es: 'Invoca un escudo sagrado que absorbe daño', en: 'Summons a holy shield that absorbs damage', zh: '召唤神圣护盾吸收伤害' },
                },
            },
            stage2: {
                reflect: {
                    name: { es: 'Escudo Reflejo', en: 'Reflective Shield', zh: '反射护盾' },
                    desc: { es: 'Devuelve parte del daño al atacante', en: 'Reflects part of the damage back to the attacker', zh: '反弹部分伤害给攻击者' },
                },
                guard: {
                    name: { es: 'Escudo Guardián', en: 'Warding Shield', zh: '守护护盾' },
                    desc: { es: 'Cuando el escudo desaparece te cura a ti mismo', en: 'Heals you when the shield breaks', zh: '护盾消失时治疗自身' },
                },
            },
            stage3: {
                retribution: {
                    name: { es: 'Aura de Castigo', en: 'Retribution Aura', zh: '惩戒光环' },
                    desc: { es: 'Emite pulsos de daño y ralentiza a los enemigos cercanos', en: 'Pulses damage and slows nearby enemies', zh: '脉冲伤害并减速周围敌人' },
                },
                fortress: {
                    name: { es: 'Defensa Absoluta', en: 'Absolute Defense', zh: '绝对防御' },
                    desc: { es: 'Inmune a los golpes críticos y cura vida al matar', en: 'Immune to critical hits and heals on kill', zh: '免疫暴击，击杀回血' },
                },
                angel: {
                    name: { es: 'Ángel Guardián', en: 'Guardian Angel', zh: '守护天使' },
                    desc: { es: 'Tras romperse el escudo te vuelves invulnerable un instante', en: 'Grants brief invulnerability after the shield breaks', zh: '护盾消失后短暂无敌' },
                },
                link: {
                    name: { es: 'Enlace Vital', en: 'Life Link', zh: '生命链接' },
                    desc: { es: 'Genera un escudo secundario cuando se rompe el principal', en: 'Spawns a secondary shield when the first one breaks', zh: '生成次级护盾' },
                },
            },
        },
    });

    // 赐福词条标签与说明：替代 game.js 中的纯中文 effectNames 映射
    window.I18N.registerTable('blessingEffects', {
        dmgPct: {
            label: { es: 'Daño', en: 'Damage', zh: '伤害' },
            desc: { es: 'Aumenta el daño total infligido', en: 'Increases total damage dealt', zh: '提高造成的总伤害' },
        },
        lifeSteal: {
            label: { es: 'Robo de Vida', en: 'Life Steal', zh: '生命偷取' },
            desc: { es: 'Recupera vida en proporción al daño infligido', en: 'Heals you for a share of the damage you deal', zh: '按造成伤害的比例回复生命' },
        },
        critChance: {
            label: { es: 'Prob. Crítica', en: 'Crit Chance', zh: '暴击率' },
            desc: { es: 'Aumenta la probabilidad de golpe crítico', en: 'Raises the chance to land a critical hit', zh: '提升暴击触发几率' },
        },
        critDamage: {
            label: { es: 'Daño Crítico', en: 'Crit Damage', zh: '暴击伤害' },
            desc: { es: 'Aumenta el daño de los golpes críticos', en: 'Increases the damage dealt by critical hits', zh: '提升暴击造成的伤害' },
        },
        maxHp: {
            label: { es: 'Vida Máx', en: 'Max HP', zh: '最大生命' },
            desc: { es: 'Aumenta tu vida máxima', en: 'Raises your maximum HP', zh: '直接提高生命上限' },
        },
        def: {
            label: { es: 'Defensa', en: 'Defense', zh: '护甲' },
            desc: { es: 'Suma armadura y reduce el daño recibido', en: 'Adds armor, reducing incoming damage', zh: '增加护甲，降低受到的伤害' },
        },
        allRes: {
            label: { es: 'Res. Total', en: 'All Res', zh: '全抗' },
            desc: { es: 'Aumenta todas las resistencias elementales', en: 'Raises all elemental resistances', zh: '提升全部元素抗性' },
        },
        hpRegenPct: {
            label: { es: 'Regen. Vida/s', en: 'HP Regen/s', zh: '生命回复/秒' },
            desc: { es: 'Regenera vida cada segundo según tu vida máxima', en: 'Regenerates HP each second as a share of max HP', zh: '每秒按最大生命的百分比回复生命' },
        },
        maxMp: {
            label: { es: 'Maná Máx', en: 'Max MP', zh: '最大法力' },
            desc: { es: 'Aumenta tu maná máximo', en: 'Raises your maximum MP', zh: '直接提高法力上限' },
        },
        mpRegenPct: {
            label: { es: 'Regen. Maná/s', en: 'MP Regen/s', zh: '法力回复' },
            desc: { es: 'Aumenta la regeneración de maná', en: 'Speeds up mana regeneration', zh: '加快法力回复速度' },
        },
        fireDmgPct: {
            label: { es: 'Daño Fuego', en: 'Fire Damage', zh: '火焰伤害' },
            desc: { es: 'Aumenta el daño de fuego', en: 'Increases fire damage', zh: '提升火焰元素伤害' },
        },
        poisonDmgPct: {
            label: { es: 'Daño Veneno', en: 'Poison Damage', zh: '毒素伤害' },
            desc: { es: 'Aumenta el daño de veneno', en: 'Increases poison damage', zh: '提升毒素元素伤害' },
        },
        thornsPct: {
            label: { es: 'Espinas', en: 'Thorns', zh: '荆棘反伤' },
            desc: { es: 'Devuelve parte del daño recibido a los atacantes', en: 'Reflects part of the damage you take back at attackers', zh: '把部分受到的伤害反弹给攻击者' },
        },
        goldPct: {
            label: { es: 'Oro Extra', en: 'Gold Drop', zh: '金币掉落' },
            desc: { es: 'Aumenta el oro que sueltan los enemigos', en: 'Increases the gold dropped by enemies', zh: '提高敌人掉落的金币' },
        },
        dropRatePct: {
            label: { es: 'Botín Extra', en: 'Item Drops', zh: '装备掉落' },
            desc: { es: 'Aumenta la probabilidad de conseguir equipo', en: 'Increases equipment drop chance', zh: '提高装备掉落几率' },
        },
        onKillHealPct: {
            label: { es: 'Curación al matar', en: 'Heal on Kill', zh: '击杀回血' },
            desc: { es: 'Te cura al matar a un enemigo', en: 'Heals you when you kill an enemy', zh: '击杀敌人时按比例回复生命' },
        },
    });

    // 普攻横扫档位文案：tier_0 为未解锁状态，tier_1~3 对应 getPhysicalSweepConfig
    window.I18N.registerTable('sweepTiers', {
        tier_0: {
            name: { es: 'Sin Barrido', en: 'No Sweep', zh: '无横扫' },
            desc: { es: 'Todavía no has desbloqueado el barrido: el ataque básico solo alcanza a un enemigo', en: 'Sweep not unlocked yet; basic attacks only reach a single enemy', zh: '尚未解锁横扫，普通攻击只影响单一目标' },
            label: { es: 'Ninguno', en: 'None', zh: '无' },
        },
        tier_1: {
            name: { es: 'Tajo Descendente', en: 'Cleave', zh: '顺劈' },
            desc: { es: 'Lanza 3 arcos de hoja con forma de media luna y barre a 2 enemigos cercanos con un 45% de daño', en: 'Swings 3 half-moon blade arcs, sweeping 2 nearby enemies for 45% damage', zh: '挥出3道半月斩刀光，横扫附近2名敌人并造成45%伤害' },
            label: { es: 'Barrido I', en: 'Sweep I', zh: '横扫 I' },
        },
        tier_2: {
            name: { es: 'Media Luna', en: 'Crescent Slash', zh: '半月斩' },
            desc: { es: 'La hoja gira como un remolino y barre a 4 enemigos cercanos con un 60% de daño', en: 'The blade spins as a whirlwind, sweeping 4 nearby enemies for 60% damage', zh: '刀光化作旋风斩，横扫附近4名敌人并造成60%伤害' },
            label: { es: 'Barrido II', en: 'Sweep II', zh: '横扫 II' },
        },
        tier_3: {
            name: { es: 'Filo Devastador', en: 'Sweeping Blade', zh: '横扫刀锋' },
            desc: { es: 'El filo parte la tierra y barre a 6 enemigos cercanos con un 75% de daño', en: 'The blade splits the ground, sweeping 6 nearby enemies for 75% damage', zh: '刀锋裂地斩撕裂大地，横扫附近6名敌人并造成75%伤害' },
            label: { es: 'Barrido III', en: 'Sweep III', zh: '横扫 III' },
        },
    });
})();
