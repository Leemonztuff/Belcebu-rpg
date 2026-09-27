// i18n-content-bestiary.js - codexclasscontentexpress（monster / affix / Boss skill / crowdfaction / combattoast / codexUI）
(function () {
    'use strict';
    if (typeof window.I18N === 'undefined' || typeof window.I18N.registerTable !== 'function') return;

    // Monster and boss codex: keyed by legacy in-game zh names (kept for old saves)
    window.I18N.registerTable('bestiary', {
        '沉沦魔': {
            name: { es: 'Corruptor', en: 'Fallen', zh: '沉沦魔' },
            desc: { es: 'La criatura demoníaca más común del inframundo.', en: 'The most common demon creature of the underworld.', zh: '地狱中最常见的恶魔生物，总是一窝蜂地涌来。' }
        },
        '僵尸': {
            name: { es: 'Zombi', en: 'Zombie', zh: '僵尸' },
            desc: { es: 'Lento pero con gran resistencia vital.', en: 'Slow, but with tremendous vitality.', zh: '动作迟缓，却有着惊人的生命力。' }
        },
        '骷髅弓箭手': {
            name: { es: 'Esqueleto Arquero', en: 'Skeleton Archer', zh: '骷髅弓箭手' },
            desc: { es: 'Tirador no-muerto de ataques a distancia.', en: 'Undead shooter that attacks at range.', zh: '在远处射击的不死射手。' }
        },
        '骷髅战士': {
            name: { es: 'Esqueleto Guerrero', en: 'Skeleton Warrior', zh: '骷髅战士' },
            desc: { es: 'Agresivo espadachín óseo.', en: 'Aggressive skeletal swordsman.', zh: '凶悍的骨剑士，面前的伤害会被格挡。' }
        },
        '沉沦魔巫师': {
            name: { es: 'Hechicero Corruptor', en: 'Fallen Shaman', zh: '沉沦魔巫师' },
            desc: { es: 'Chamán capaz de resucitar a sus aliados.', en: 'Shaman able to resurrect his allies.', zh: '能复活附近同伴的萨满。' }
        },
        '幽灵鬼魂': {
            name: { es: 'Fantasma', en: 'Ghost', zh: '幽灵鬼魂' },
            desc: { es: 'Atraviesa paredes y esquiva ataques físicos.', en: 'Phases through walls and dodges physical attacks.', zh: '能够穿墙并闪避物理攻击。' }
        },
        '闪电幽魂': {
            name: { es: 'Alma Eléctrica', en: 'Shock Spirit', zh: '闪电幽魂' },
            desc: { es: 'Espectro etéreo que dispara rayos a distancia.', en: 'Ethereal specter that hurls lightning at range.', zh: '在远程发射闪电的幽魂。' }
        },
        '木乃伊': {
            name: { es: 'Momia', en: 'Mummy', zh: '木乃伊' },
            desc: { es: 'Sus ataques infligen daño por veneno.', en: 'Its attacks inflict poison damage.', zh: '攻击附带毒素伤害。' }
        },
        '吸血鬼': {
            name: { es: 'Vampiro', en: 'Vampire', zh: '吸血鬼' },
            desc: { es: 'Criatura de las sombras que roba vida al atacar.', en: 'Creature of the shadows that steals life on hit.', zh: '潜行于暗处的高手，攻击时吸取生命。' }
        },
        '血鸟': {
            name: { es: 'Cuervo Sangriento', en: 'Blood Raven', zh: '血鸟' },
            desc: { es: 'Cazadora caída experta en flechas de veneno.', en: 'Fallen hunter, expert with poison arrows.', zh: '擅长毒箭的堕落猎手，一次射出多支箭矢。' }
        },
        '女伯爵': {
            name: { es: 'La Condesa', en: 'The Countess', zh: '女伯爵' },
            desc: { es: 'Se teletransporta e invoca novás de fuego.', en: 'Teleports and summons fire novas.', zh: '会瞬移接近你，并在现身时引爆火焰新星。' }
        },
        '屠夫': {
            name: { es: 'El Carnicero', en: 'The Butcher', zh: '屠夫' },
            desc: { es: 'Demonio feroz con robo de vida y embestidas.', en: 'Fierce demon with life leech and charges.', zh: '凶猛的恶魔，攻击吸血并会蓄力突进。' }
        },
        '树头木拳': {
            name: { es: 'Piedra de Madera', en: 'Treehead WoodFist', zh: '树头木拳' },
            desc: { es: 'Gigante capaz de convocar ejércitos óseos.', en: 'Giant able to muster armies of bone.', zh: '能召唤骨之军队的巨兽，重击会掀起地震波。' }
        },
        '暗黑破坏神': {
            name: { es: 'Diablo', en: 'Diablo', zh: '暗黑破坏神' },
            desc: { es: 'Señor del Terror con voraces alientos de fuego.', en: 'Lord of Terror with voracious fire breath.', zh: '恐惧之王，喷吐足以吞噬一切的灼热吐息。' }
        },
        '巴尔': {
            name: { es: 'Baal', en: 'Baal', zh: '巴尔' },
            desc: { es: 'Señor de la Destrucción, el desafío supremo.', en: 'Lord of Destruction, the ultimate challenge.', zh: '毁灭之王，游戏中最终极的挑战。' }
        },
        'Cuervo Sangriento': {
            name: { es: 'Cuervo Sangriento', en: 'Blood Raven', zh: '血鸟' },
            desc: { es: 'Cazadora caída experta en flechas de veneno.', en: 'Fallen hunter, expert with poison arrows.', zh: '擅长毒箭的堕落猎手，一次射出多支箭矢。' }
        },
        'La Condesa': {
            name: { es: 'La Condesa', en: 'The Countess', zh: '女伯爵' },
            desc: { es: 'Se teletransporta e invoca novás de fuego.', en: 'Teleports and summons fire novas.', zh: '会瞬移接近你，并在现身时引爆火焰新星。' }
        },
        'El Carnicero': {
            name: { es: 'El Carnicero', en: 'The Butcher', zh: '屠夫' },
            desc: { es: 'Demonio feroz con robo de vida y embestidas.', en: 'Fierce demon with life leech and charges.', zh: '凶猛的恶魔，攻击吸血并会蓄力突进。' }
        },
        'Puño de Madera': {
            name: { es: 'Puño de Madera', en: 'Treehead WoodFist', zh: '树头木拳' },
            desc: { es: 'Gigante capaz de convocar ejércitos óseos.', en: 'Giant able to muster armies of bone.', zh: '能召唤骨之军队的巨兽，重击会掀起地震波。' }
        },
        'Diablo': {
            name: { es: 'Diablo', en: 'Diablo', zh: '暗黑破坏神' },
            desc: { es: 'Señor del Terror con voraces alientos de fuego.', en: 'Lord of Terror with voracious fire breath.', zh: '恐惧之王，喷吐足以吞噬一切的灼热吐息。' }
        },
        'Baal': {
            name: { es: 'Baal', en: 'Baal', zh: '巴尔' },
            desc: { es: 'Señor de la Destrucción, el desafío supremo.', en: 'Lord of Destruction, the ultimate challenge.', zh: '毁灭之王，游戏中最终极的挑战。' }
        },
        '精英沉沦魔': {
            name: { es: 'Corruptor Élite', en: 'Elite Fallen', zh: '精英沉沦魔' },
            desc: { es: 'Corruptor con afijos de élite que lo hacen más rápido o más fuerte.', en: 'Fallen carrying elite affixes that make it faster or stronger.', zh: '携带精英词缀的沉沦魔，属性远超普通个体。' }
        },
        '精英僵尸': {
            name: { es: 'Zombi Élite', en: 'Elite Zombie', zh: '精英僵尸' },
            desc: { es: 'Zombi con afijos de élite que lo hacen más rápido o más fuerte.', en: 'Zombie carrying elite affixes that make it faster or stronger.', zh: '携带精英词缀的僵尸，属性远超普通个体。' }
        },
        '精英骷髅弓箭手': {
            name: { es: 'Esqueleto Arquero Élite', en: 'Elite Skeleton Archer', zh: '精英骷髅弓箭手' },
            desc: { es: 'Arquero esquelético con afijos de élite que lo hacen más rápido o más fuerte.', en: 'Skeletal archer carrying elite affixes that make it faster or stronger.', zh: '携带精英词缀的骷髅射手，属性远超普通个体。' }
        },
        '精英骷髅战士': {
            name: { es: 'Esqueleto Guerrero Élite', en: 'Elite Skeleton Warrior', zh: '精英骷髅战士' },
            desc: { es: 'Guerrero esquelético con afijos de élite que lo hacen más rápido o más fuerte.', en: 'Skeletal warrior carrying elite affixes that make it faster or stronger.', zh: '携带精英词缀的骷髅剑士，属性远超普通个体。' }
        },
        '精英沉沦魔巫师': {
            name: { es: 'Hechicero Corruptor Élite', en: 'Elite Fallen Shaman', zh: '精英沉沦魔巫师' },
            desc: { es: 'Chamán caído con afijos de élite que lo hacen más rápido o más fuerte.', en: 'Fallen shaman carrying elite affixes that make it faster or stronger.', zh: '携带精英词缀的沉沦魔巫师，属性远超普通个体。' }
        },
        '精英幽灵鬼魂': {
            name: { es: 'Fantasma Élite', en: 'Elite Ghost', zh: '精英幽灵鬼魂' },
            desc: { es: 'Fantasma con afijos de élite que lo hacen más rápido o más fuerte.', en: 'Ghost carrying elite affixes that make it faster or stronger.', zh: '携带精英词缀的幽灵，属性远超普通个体。' }
        },
        '精英闪电幽魂': {
            name: { es: 'Alma Eléctrica Élite', en: 'Elite Shock Spirit', zh: '精英闪电幽魂' },
            desc: { es: 'Alma eléctrica con afijos de élite que lo hace más rápido o más fuerte.', en: 'Shock spirit carrying elite affixes that make it faster or stronger.', zh: '携带精英词缀的闪电幽魂，属性远超普通个体。' }
        },
        '精英木乃伊': {
            name: { es: 'Momia Élite', en: 'Elite Mummy', zh: '精英木乃伊' },
            desc: { es: 'Momia con afijos de élite que la hacen más rápida o más fuerte.', en: 'Mummy carrying elite affixes that make it faster or stronger.', zh: '携带精英词缀的木乃伊，属性远超普通个体。' }
        },
        '精英吸血鬼': {
            name: { es: 'Vampiro Élite', en: 'Elite Vampire', zh: '精英吸血鬼' },
            desc: { es: 'Vampiro con afijos de élite que lo hacen más rápido o más fuerte.', en: 'Vampire carrying elite affixes that make it faster or stronger.', zh: '携带精英词缀的吸血鬼，属性远超普通个体。' }
        },
        '召唤物': {
            name: { es: 'Invocado', en: 'Summon', zh: '召唤物' },
            desc: { es: 'Refuerzo invocado por un jefe; no cuenta como baja.', en: 'Reinforcement summoned by a boss; it does not count as a kill.', zh: 'Boss 召唤的援军，不计入击杀统计。' }
        },
        '精英守卫': {
            name: { es: 'Guardián Élite', en: 'Elite Guard', zh: '精英守卫' },
            desc: { es: 'Nombre heredado de una guardia de élite con afijos.', en: 'Legacy name for an elite gate guard with affixes.', zh: '旧版名称：守在门口的精英怪，携带词缀。' }
        },
        '都瑞尔': {
            name: { es: 'Duriel', en: 'Duriel', zh: '都瑞尔' },
            desc: { es: 'Alias de Puño de Madera, el gigante que convoca huesos.', en: 'Alias for Wooden Fist, the giant who summons bone.', zh: '树头木拳的别称，那头能够召唤骨军的巨兽。' }
        },
        '骷髅': {
            name: { es: 'Esqueleto', en: 'Skeleton', zh: '骷髅' },
            desc: { es: 'Denominación común de los enemigos esqueléticos.', en: 'Common name for the skeletal enemies.', zh: '骷髅类敌人的统称。' }
        },
        '幽灵': {
            name: { es: 'Fantasma', en: 'Ghost', zh: '幽灵' },
            desc: { es: 'Antiguo nombre del Espectro de Rayo.', en: 'Former name for the Lightning Specter.', zh: '闪电幽魂的旧称。' }
        },
        '幽灵恶鬼': {
            name: { es: 'Espectro', en: 'Specter', zh: '幽灵恶鬼' },
            desc: { es: 'Antiguo nombre del Espectro de Rayo.', en: 'Former name for the Lightning Specter.', zh: '闪电幽魂的旧称。' }
        },
        '萨满': {
            name: { es: 'Chamán', en: 'Shaman', zh: '萨满' },
            desc: { es: 'Antiguo nombre del Chamán Caído.', en: 'Former name for the Fallen Shaman.', zh: '沉沦魔巫师的旧称。' }
        },
        '小恶魔': {
            name: { es: 'Diablillo', en: 'Imp', zh: '小恶魔' },
            desc: { es: 'Nombre heredado de un diablillo rápido y agresivo.', en: 'Legacy name for a small, fast and aggressive devil.', zh: '旧版名称：迅捷而凶悍的小恶魔。' }
        },

        // EN alias keys (canonical runtime names)
        'Blood Raven': {
            name: { es: 'Cuervo Sangriento', en: 'Blood Raven', zh: '血鸟' },
            desc: { es: 'Cazadora caída experta en flechas de veneno.', en: 'Fallen hunter, expert with poison arrows.', zh: '擅长毒箭的堕落猎手，一次射出多支箭矢。' }
        },
        'The Countess': {
            name: { es: 'La Condesa', en: 'The Countess', zh: '女伯爵' },
            desc: { es: 'Se teletransporta e invoca novás de fuego.', en: 'Teleports and summons fire novas.', zh: '会瞬移接近你，并在现身时引爆火焰新星。' }
        },
        'The Butcher': {
            name: { es: 'El Carnicero', en: 'The Butcher', zh: '屠夫' },
            desc: { es: 'Demonio feroz con robo de vida y embestidas.', en: 'Fierce demon with life leech and charges.', zh: '凶猛的恶魔，攻击吸血并会蓄力突进。' }
        },
        'Treehead WoodFist': {
            name: { es: 'Puño de Madera', en: 'Treehead WoodFist', zh: '树头木拳' },
            desc: { es: 'Gigante capaz de convocar ejércitos óseos.', en: 'Giant able to muster armies of bone.', zh: '能召唤骨之军队的巨兽，重击会掀起地震波。' }
        },
        'Fallen': {
            name: { es: 'Corruptor', en: 'Fallen', zh: '沉沦魔' },
            desc: { es: 'La criatura demoníaca más común del inframundo.', en: 'The most common demon creature of the underworld.', zh: '地狱中最常见的恶魔生物，总是一窝蜂地涌来。' }
        },
        'Zombie': {
            name: { es: 'Zombi', en: 'Zombie', zh: '僵尸' },
            desc: { es: 'Lento pero con gran resistencia vital.', en: 'Slow, but with tremendous vitality.', zh: '动作迟缓，却有着惊人的生命力。' }
        },
        'Skeleton Archer': {
            name: { es: 'Esqueleto Arquero', en: 'Skeleton Archer', zh: '骷髅弓箭手' },
            desc: { es: 'Tirador no-muerto de ataques a distancia.', en: 'Undead shooter that attacks at range.', zh: '在远处射击的不死射手。' }
        },
        'Skeleton Warrior': {
            name: { es: 'Esqueleto Guerrero', en: 'Skeleton Warrior', zh: '骷髅战士' },
            desc: { es: 'Agresivo espadachín óseo.', en: 'Aggressive skeletal swordsman.', zh: '凶悍的骨剑士，面前的伤害会被格挡。' }
        },
        'Fallen Shaman': {
            name: { es: 'Hechicero Corruptor', en: 'Fallen Shaman', zh: '沉沦魔巫师' },
            desc: { es: 'Chamán capaz de resucitar a sus aliados.', en: 'Shaman able to resurrect his allies.', zh: '能复活附近同伴的萨满。' }
        },
        'Ghost': {
            name: { es: 'Fantasma', en: 'Ghost', zh: '幽灵鬼魂' },
            desc: { es: 'Atraviesa paredes y esquiva ataques físicos.', en: 'Phases through walls and dodges physical attacks.', zh: '能够穿墙并闪避物理攻击。' }
        },
        'Shock Spirit': {
            name: { es: 'Alma Eléctrica', en: 'Shock Spirit', zh: '闪电幽魂' },
            desc: { es: 'Espectro etéreo que dispara rayos a distancia.', en: 'Ethereal specter that hurls lightning at range.', zh: '在远程发射闪电的幽魂。' }
        },
        'Mummy': {
            name: { es: 'Momia', en: 'Mummy', zh: '木乃伊' },
            desc: { es: 'Sus ataques infligen daño por veneno.', en: 'Its attacks inflict poison damage.', zh: '攻击附带毒素伤害。' }
        },
        'Vampire': {
            name: { es: 'Vampiro', en: 'Vampire', zh: '吸血鬼' },
            desc: { es: 'Criatura de las sombras que roba vida al atacar.', en: 'Creature of the shadows that steals life on hit.', zh: '潜行于暗处的高手，攻击时吸取生命。' }
        },
    });

    // eliteaffix
    window.I18N.registerTable('eliteAffixes', {
        '额外快速': {
            name: { es: 'Extra Rápido', en: 'Extra Fast', zh: '额外快速' },
            desc: { es: 'Velocidad de movimiento +50%', en: 'Move speed +50%', zh: '移动速度+50%' }
        },
        '额外强壮': {
            name: { es: 'Extra Fuerte', en: 'Extra Strong', zh: '额外强壮' },
            desc: { es: 'Daño +100%', en: 'Damage +100%', zh: '伤害+100%' }
        },
        '火焰强化': {
            name: { es: 'Reforzado con Fuego', en: 'Fire Enchanted', zh: '火焰强化' },
            desc: { es: 'Ataques añaden daño de fuego; explota al morir', en: 'Attacks deal fire damage; explodes on death', zh: '攻击附带火焰伤害，死亡时爆炸' }
        },
        '寒冰强化': {
            name: { es: 'Reforzado con Hielo', en: 'Cold Enchanted', zh: '寒冰强化' },
            desc: { es: 'Ataques dejan al objetivo congelado', en: 'Attacks can freeze the target', zh: '攻击附带冰冻效果' }
        },
        '闪电强化': {
            name: { es: 'Reforzado con Rayo', en: 'Lightning Enchanted', zh: '闪电强化' },
            desc: { es: 'Ataques añaden daño de rayo', en: 'Attacks deal lightning damage', zh: '攻击附带闪电伤害' }
        },
        '石肤': {
            name: { es: 'Piel de Piedra', en: 'Stone Skin', zh: '石肤' },
            desc: { es: 'Reduce el daño recibido un 50%', en: 'Takes 50% less damage', zh: '受到伤害减少50%' }
        },
        '魔法抗性': {
            name: { es: 'Resistencia Arcana', en: 'Magic Resistant', zh: '魔法抗性' },
            desc: { es: 'Reduce un 70% el daño de habilidades', en: 'Takes 70% less damage from skills', zh: '技能伤害减免70%' }
        },
        '吸血': {
            name: { es: 'Vampírico', en: 'Vampiric', zh: '吸血' },
            desc: { es: 'Recupera vida al atacar', en: 'Heals itself on hit', zh: '攻击回复生命' }
        },
        '法力燃烧': {
            name: { es: 'Combustión de Maná', en: 'Mana Burn', zh: '法力燃烧' },
            desc: { es: 'Sus ataques drenan tu maná', en: 'Its attacks drain your mana', zh: '攻击消耗玩家法力' }
        },
        '诅咒': {
            name: { es: 'Maldición', en: 'Cursed', zh: '诅咒' },
            desc: { es: 'Reduce tu defensa', en: 'Lowers your Defense', zh: '降低玩家防御' }
        },
        '多重射击': {
            name: { es: 'Disparo Múltiple', en: 'Multiple Shot', zh: '多重射击' },
            desc: { es: 'Los monstruos a distancia disparan 3 flechas', en: 'Ranged monsters fire 3 arrows', zh: '远程怪物发射3支箭' }
        },
        '幽灵打击': {
            name: { es: 'Golpe Espectral', en: 'Spectral Hit', zh: '幽灵打击' },
            desc: { es: 'Ignora la armadura', en: 'Ignores armor', zh: '无视护甲' }
        }
    });

    // Boss andenemyskill
    window.I18N.registerTable('bossAbilities', {
        '新星': {
            name: { es: 'Nova', en: 'Nova', zh: '新星' },
            desc: { es: 'Aviso de carga de la nova de fuego: sal del círculo rojo antes de que termine.', en: 'Fire nova charge telegraph: leave the red circle before the cast finishes.', zh: '火焰新星的蓄力预警，读条结束前离开红圈。' }
        },
        '火焰新星': {
            name: { es: 'Nova de Fuego', en: 'Fire Nova', zh: '火焰新星' },
            desc: { es: 'Estalla en una nova de fuego a su alrededor y daña a todo lo que quede dentro.', en: 'Detonates a fire nova around itself and damages everything inside the radius.', zh: '以自身为中心引爆火焰新星，对范围内造成火焰伤害。' }
        },
        '重击': {
            name: { es: 'Golpe Pesado', en: 'Heavy Strike', zh: '重击' },
            desc: { es: 'Golpe de área con 0,95 s de carga; acumula suficiente daño de habilidad para cancelarlo.', en: 'Area slam with a 0.95s cast; enough skill damage cancels it.', zh: '蓄力0.95秒的沉重一击，技能伤害累计到阈值即可打断。' }
        },
        '地震波': {
            name: { es: 'Onda Sísmica', en: 'Ground Slam', zh: '地震波' },
            desc: { es: 'Golpea el suelo y lanza una onda circular que daña y ralentiza.', en: 'Slams the ground and sends out a circular shockwave that damages and slows.', zh: '砸击地面掀起环形冲击波，造成伤害并使你减速1秒。' }
        },
        '召唤': {
            name: { es: 'Invocación', en: 'Summon', zh: '召唤' },
            desc: { es: 'Invoca refuerzos; interrumpir la carga impide la invocación.', en: 'Calls in reinforcements; interrupting the cast prevents the summon.', zh: '召唤援军加入战斗，蓄力期间用技能命中即可取消。' }
        },
        '扇形闪电吐息': {
            name: { es: 'Aliento Eléctrico', en: 'Lightning Breath', zh: '扇形闪电吐息' },
            desc: { es: 'Escupe un cono de luz hacia la dirección fijada al empezar.', en: 'Spits a cone of light along the direction locked at cast time.', zh: '朝蓄力时锁定的方向喷出扇形闪电，横向走位可完全躲开。' }
        },
        '触手': {
            name: { es: 'Tentáculo', en: 'Tentacle', zh: '触手' },
            desc: { es: 'Lanza varias líneas de tentáculos que siguen su trayectoria real.', en: 'Fires several tentacle lines that follow their real trajectory.', zh: '射出多条直线触手弹道，必须按红线方向走位。' }
        },
        '冰冻': {
            name: { es: 'Congelación', en: 'Freeze', zh: '冰冻' },
            desc: { es: 'Sus golpes congelan brevemente al objetivo.', en: 'Its blows briefly freeze the target.', zh: '攻击附带冰冻效果，命中后短暂冻结你。' }
        },
        '瞬移': {
            name: { es: 'Teletransporte', en: 'Teleport', zh: '瞬移' },
            desc: { es: 'Aparece junto a ti cuando te alejas demasiado.', en: 'Appears next to you when you stray too far.', zh: '距离过远时瞬移到你身边，并可能引爆火焰新星。' }
        },
        '狂暴': {
            name: { es: 'Furia', en: 'Enrage', zh: '狂暴' },
            desc: { es: 'Al caer por debajo del 30% de vida aumenta su velocidad y su daño.', en: 'Below 30% health it gains extra speed and damage.', zh: '生命低于30%时进入狂暴，移动速度与伤害大幅提升。' }
        },
        '复活': {
            name: { es: 'Reanimación', en: 'Revive', zh: '复活' },
            desc: { es: 'Canaliza 0,85 s para levantar un cadáver cercano; interrumpirlo lo cancela.', en: 'Channels 0.85s to raise a nearby corpse; interrupting cancels it.', zh: '施法0.85秒复活附近尸体，打断会取消这次复活。' }
        },
        '突进': {
            name: { es: 'Embestida', en: 'Charge', zh: '突进' },
            desc: { es: 'Avanza por una ruta fija tras 0,65 s de aviso y queda expuesto al final.', en: 'Dashes along a fixed path after a 0.65s telegraph and is exposed at the end.', zh: '蓄力0.65秒后沿固定路线突进，收招时暴露破绽。' }
        },
        '火焰爆炸': {
            name: { es: 'Explosión de Fuego', en: 'Fire Explosion', zh: '火焰爆炸' },
            desc: { es: 'Explota al morir; el daño disminuye con la distancia.', en: 'Explodes on death; damage falls off with distance.', zh: '死亡时爆炸，伤害随距离衰减。' }
        },
        '多重射击': {
            name: { es: 'Disparo Múltiple', en: 'Multiple Shot', zh: '多重射击' },
            desc: { es: 'Como jefe, dispara 5 flechas en vez de 3.', en: 'As a boss it fires 5 arrows instead of 3.', zh: '作为首领时会一次射出5支箭矢。' }
        },
        '剧毒': {
            name: { es: 'Veneno', en: 'Poison', zh: '剧毒' },
            desc: { es: 'Sus ataques inyectan veneno que sigue dañando con el tiempo.', en: 'Its attacks inject poison that keeps damaging over time.', zh: '攻击附带毒素伤害，会持续造成额外伤害。' }
        }
    });

// Combat telegraphs and opening hints
    window.I18N.registerTable('biomes', {
        'town': {
            name: { es: 'Campamento de las Arpías', en: 'Rogue Encampment', zh: '罗格营地' },
            desc: { es: 'Refugio seguro para armar tu equipo, comerciar y viajar entre pisos.', en: 'Safe hub to gear up, trade and travel between floors.', zh: '安全营地，可整备装备、交易与楼层传送。' }
        },
        'forest': {
            name: { es: 'Bosque Brumoso', en: 'Fog Forest', zh: '迷雾森林' },
            desc: { es: 'Bosque húmedo y sombrío (pisos 1-10); abundan los caídos y los no-muertos.', en: 'Damp, shadowy woodland (floors 1-10); fallen and undead abound.', zh: '潮湿阴暗的森林地带（第1-10层），沉沦魔与亡灵出没。' }
        },
        'ice': {
            name: { es: 'Ruinas Heladas', en: 'Frozen Ruins', zh: '冰封废墟' },
            desc: { es: 'Ruinas heladas y resbaladizas (pisos 11-20); el suelo traiciona.', en: 'Slippery frozen ruins (floors 11-20); the ground betrays you.', zh: '湿滑的冰封废墟（第11-20层），地面极易打滑。' }
        },
        'fire': {
            name: { es: 'Infierno de Lava', en: 'Lava Inferno', zh: '熔岩炼狱' },
            desc: { es: 'Tierras devoradas por la lava (piso 21 en adelante); cada 10 pisos cambia el ciclo.', en: 'Lands consumed by lava (floor 21+); the cycle shifts every 10 floors.', zh: '熔岩肆虐的炼狱地带（第21层起），每10层进入新周目。' }
        },
        'hell': {
            name: { es: 'Infierno', en: 'Hell', zh: '地狱' },
            desc: { es: 'Modo Infierno: monstruos y botín más fuertes, con sus propios ciclos de pisos.', en: 'Hell mode: tougher monsters and better loot, with its own floor cycles.', zh: '地狱模式：怪物更强、掉落更好，层数独立循环。' }
        },
        'fire_rift': {
            name: { es: 'Fisura de Lava', en: 'Lava Rift', zh: '熔岩裂隙' },
            desc: { es: 'Tema profundo: una grieta abierta sobre ríos de lava.', en: 'Deep theme: a crack opening over rivers of lava.', zh: '深层主题：熔岩之河上裂开的炽热沟壑。' }
        },
        'fire_scorched_hall': {
            name: { es: 'Sala de Piedra Abrasada', en: 'Scorched Stone Hall', zh: '焦黑石殿' },
            desc: { es: 'Tema profundo: un salón de piedra ennegrecido por el fuego.', en: 'Deep theme: a stone hall blackened by fire.', zh: '深层主题：被烈火烧得焦黑的大殿。' }
        },
        'fire_flesh_altar': {
            name: { es: 'Altar de Carne', en: 'Flesh Altar', zh: '血肉祭坛' },
            desc: { es: 'Tema profundo: un altar de sacrificio construido con carne.', en: 'Deep theme: a sacrificial altar built out of flesh.', zh: '深层主题：以血肉堆砌而成的献祭祭坛。' }
        },
        'fire_obsidian_abyss': {
            name: { es: 'Abismo de Obsidiana', en: 'Obsidian Abyss', zh: '黑曜深渊' },
            desc: { es: 'Tema profundo: un abismo de obsidiana que absorbe la luz.', en: 'Deep theme: an obsidian abyss that swallows the light.', zh: '深层主题：吞噬光线的黑曜石深渊。' }
        },
        'cycle_abyss': {
            name: { es: 'Abisal', en: 'Abyssal', zh: '深渊' },
            desc: { es: 'Prefijo de ciclo a partir del segundo vuelta de pisos de lava.', en: 'Cycle prefix used from the second lap of the lava floors onwards.', zh: '熔岩层第二轮起使用的周目前缀。' }
        },
        'cycle_void': {
            name: { es: 'Vacío', en: 'Void', zh: '虚空' },
            desc: { es: 'Prefijo de ciclo de la tercera vuelta de pisos de lava.', en: 'Cycle prefix for the third lap of the lava floors.', zh: '熔岩层第三轮使用的周目前缀。' }
        },
        'cycle_eternal': {
            name: { es: 'Eterno', en: 'Eternal', zh: '永恒' },
            desc: { es: 'Prefijo de ciclo de la cuarta vuelta de pisos de lava.', en: 'Cycle prefix for the fourth lap of the lava floors.', zh: '熔岩层第四轮使用的周目前缀。' }
        },
        'cycle_chaos': {
            name: { es: 'Caos', en: 'Chaos', zh: '混沌' },
            desc: { es: 'Prefijo de ciclo de la quinta vuelta de pisos de lava.', en: 'Cycle prefix for the fifth lap of the lava floors.', zh: '熔岩层第五轮使用的周目前缀。' }
        },
        'cycle_doom': {
            name: { es: 'Juicio Final', en: 'Doomsday', zh: '末日' },
            desc: { es: 'Prefijo de ciclo de la sexta vuelta y de todas las siguientes.', en: 'Cycle prefix for the sixth lap and every lap after it.', zh: '熔岩层第六轮及之后所有轮次使用的周目前缀。' }
        }
    });

// Codex interface
    window.I18N.registerTable('tactics', {
        'heavy_strike': {
            name: { es: 'Golpe Pesado · Sal del círculo', en: 'Heavy Strike · Leave the red circle', zh: '重击 · 离开红圈' },
            desc: { es: 'Aviso de golpe pesado del jefe: sal del círculo rojo antes de que termine la carga.', en: 'Boss heavy-strike telegraph: leave the red circle before the cast finishes.', zh: 'Boss 重击预警：读条结束前离开红圈，否则必定命中。' }
        },
        'nova': {
            name: { es: 'Nova · Sal del círculo', en: 'Nova · Leave the red circle', zh: '新星 · 离开红圈' },
            desc: { es: 'Aviso de nova: el círculo entero recibe daño de fuego al terminar.', en: 'Nova telegraph: the whole circle takes fire damage when it ends.', zh: '新星预警：读条结束时整个红圈都会受到火焰伤害。' }
        },
        'breath': {
            name: { es: 'Aliento · Esquiva lateral', en: 'Breath · Dodge sideways', zh: '吐息 · 侧向躲避' },
            desc: { es: 'Aviso de aliento en cono: muévete de lado, nunca hacia atrás.', en: 'Cone breath telegraph: strafe sideways, never back.', zh: '扇形吐息预警：横向移动躲避，不要直线后退。' }
        },
        'tentacle': {
            name: { es: 'Tentáculo · Apártate de la línea', en: 'Tentacle · Avoid the red lines', zh: '触手 · 避开红线' },
            desc: { es: 'Cada línea roja es una trayectoria real de tentáculo.', en: 'Every red line is a real tentacle trajectory.', zh: '每条红线都是一条真实触手弹道，按线走位。' }
        },
        'summon': {
            name: { es: 'Invocación · Interrumpe con una habilidad', en: 'Summon · Interrupt with a skill', zh: '召唤 · 技能打断' },
            desc: { es: 'Acércate y golpéalo con una habilidad durante la carga.', en: 'Close in and land a skill hit during the cast.', zh: '在蓄力期间用技能命中即可取消召唤。' }
        },
        'charge': {
            name: { es: 'Embestida · Esquiva lateral', en: 'Charge · Dodge sideways', zh: '突进 · 侧向躲避' },
            desc: { es: 'La ruta queda fijada al empezar: esquiva de lado, no hacia delante.', en: 'The path is locked at cast time: dodge sideways, not forward.', zh: '路线在起手时锁定，向侧面闪避而非向前。' }
        },
        'revive': {
            name: { es: 'Reanimación · Interrumpe con una habilidad', en: 'Revive · Interrupt with a skill', zh: '复活 · 技能打断' },
            desc: { es: 'El aviso solo aparece durante el canalizado de 0,85 s.', en: 'The telegraph only shows during the 0.85s channel.', zh: '仅在0.85秒施法期间显示，此时打断即可取消复活。' }
        },
        'heavy_strike_melee': {
            name: { es: 'Golpe Pesado · Aléjate', en: 'Heavy Strike · Keep your distance', zh: '重击 · 拉开距离' },
            desc: { es: 'Golpe de un enemigo normal: sal de su alcance o interrúmpelo.', en: 'A normal enemy swing: leave its reach or interrupt it.', zh: '普通怪物的重击：拉开距离或用技能打断。' }
        },
        'break': {
            name: { es: 'Punto Débil +25%', en: 'Opening +25%', zh: '破绽 +25%' },
            desc: { es: 'Recibe un 25% más de daño y no puede moverse ni atacar.', en: 'Takes 25% more damage and can neither move nor attack.', zh: '敌人收招破绽：受到伤害+25%，期间停止移动与攻击。' }
        },
        'interrupt': {
            name: { es: 'Interrumpido · Punto Débil +25%', en: 'Interrupted · Opening +25%', zh: '打断 · 破绽 +25%' },
            desc: { es: 'Cancelas la carga del jefe y gansas 1,2 s de apertura.', en: 'You cancel the boss cast and gain a 1.2s opening.', zh: '成功打断蓄力，敌人进入1.2秒破绽。' }
        },
        'suppress': {
            name: { es: 'Suprimido · Punto Débil +25%', en: 'Suppressed · Opening +25%', zh: '压制 · 破绽 +25%' },
            desc: { es: 'Golpear a un tirador a menos de 85 píxeles cancela su disparo.', en: 'Hitting a shooter within 85 pixels cancels its shot.', zh: '85像素内近身命中可压制远程怪，取消其射击。' }
        },
        'interrupt_progress': {
            name: { es: 'Interrupción {value}%', en: 'Interrupt {value}%', zh: '打断 {value}%' },
            desc: { es: 'Progreso del daño de habilidad acumulado frente al umbral de interrupción.', en: 'Progress of the skill damage dealt toward the interrupt threshold.', zh: '累计技能伤害占打断阈值的进度。' }
        }
    });

    // codexUI
    window.I18N.registerTable('codex', {
        'title': {
            label: { es: 'Codex', en: 'Codex', zh: '图鉴' }
        },
        'sets': {
            label: { es: 'Sets', en: 'Sets', zh: '套装' }
        },
        'monsters': {
            label: { es: 'Monstruos', en: 'Monsters', zh: '怪物' }
        },
        'stats': {
            label: { es: 'Estadísticas', en: 'Stats', zh: '统计' }
        },
        'normal_monsters': {
            label: { es: 'Monstruos Comunes', en: 'Common Monsters', zh: '普通怪物' }
        },
        'bosses': {
            label: { es: 'Jefes', en: 'Bosses', zh: '首领怪物' }
        },
        'discovered': {
            label: { es: 'Descubiertos', en: 'Discovered', zh: '已发现' }
        },
        'collected': {
            label: { es: 'Recogidos', en: 'Collected', zh: '已收集' }
        },
        'pieces': {
            label: { es: 'Piezas', en: 'Pieces', zh: '部件' }
        },
        'kills': {
            label: { es: 'Bajas', en: 'Kills', zh: '击杀' }
        },
        'floor': {
            label: { es: 'Aparece en el piso', en: 'Appears on floor', zh: '出现于' }
        },
        'undiscovered': {
            label: { es: 'Sin descubrir', en: 'Not yet discovered', zh: '尚未发现' }
        },
        'unknown': {
            label: { es: '??? Desconocido', en: '??? Unknown', zh: '??? 未知' }
        },
        'unknown_set': {
            label: { es: '??? Set Desconocido', en: '??? Unknown Set', zh: '??? 未知套装' }
        },
        'discovery_entry': {
            label: { es: 'Descubierto', en: 'Discovered', zh: '发现' }
        },
        'melee': {
            label: { es: 'Caído', en: 'Fallen', zh: '沉沦魔' }
        },
        'zombie': {
            label: { es: 'Zombi', en: 'Zombie', zh: '僵尸' }
        },
        'ranged': {
            label: { es: 'Arquero Esqueleto', en: 'Skeleton Archer', zh: '骷髅弓箭手' }
        },
        'skeleton': {
            label: { es: 'Guerrero Esqueleto', en: 'Skeleton Warrior', zh: '骷髅战士' }
        },
        'shaman': {
            label: { es: 'Chamán Caído', en: 'Fallen Shaman', zh: '沉沦魔巫师' }
        },
        'ghost': {
            label: { es: 'Fantasma', en: 'Ghost', zh: '幽灵鬼魂' }
        },
        'specter': {
            label: { es: 'Espectro de Rayo', en: 'Lightning Specter', zh: '闪电幽魂' }
        },
        'mummy': {
            label: { es: 'Momia', en: 'Mummy', zh: '木乃伊' }
        },
        'vampire': {
            label: { es: 'Vampiro', en: 'Vampire', zh: '吸血鬼' }
        },
        'bloodRaven': {
            label: { es: 'Cuervo Sangriento', en: 'Blood Raven', zh: '血鸟' }
        },
        'countess': {
            label: { es: 'La Condesa', en: 'The Countess', zh: '女伯爵' }
        },
        'butcher': {
            label: { es: 'El Carnicero', en: 'The Butcher', zh: '屠夫' }
        },
        'duriel': {
            label: { es: 'Puño de Madera', en: 'Wooden Fist', zh: '树头木拳' }
        },
        'diablo': {
            label: { es: 'Diablo', en: 'Diablo', zh: '暗黑破坏神' }
        },
        'baal': {
            label: { es: 'Baal', en: 'Baal', zh: '巴尔' }
        }
    });
})();
