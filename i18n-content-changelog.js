// 更新公告本地化内容表：键为 changelog.js 的 version，zh 为原始中文
(function () {
    'use strict';
    if (typeof window.I18N === 'undefined' || typeof window.I18N.registerTable !== 'function') return;

    window.I18N.registerTable('changelog', {
        '7.15': {
            title: { es: 'Arreglos de interfaz en móvil', en: 'Mobile UI Fixes', zh: '手机端界面修复' },
            highlights: [
                { es: 'Corregido: las orbes de vida y maná se aplastaban contra la barra de habilidades en pantallas estrechas', en: 'Fixed: health and mana orbs were squashed by the skill bar on narrow screens', zh: '修复手机端血球和法力球在窄屏下被中间技能栏挤扁的问题' },
                { es: 'Añadido: los iconos del menú muestran punto rojo si tienes puntos de atributo o de habilidad sin usar, recompensas de misión o bendiciones por recoger', en: 'Added: menu icons show a red dot for unspent attribute points, skill points, quest rewards and pending blessings', zh: '手机端菜单入口现在会同步显示属性点、技能点、任务奖励和赐福待领取红点' },
                { es: 'Añadido: el icono de chat muestra un punto rojo cuando el canal mundial tiene mensajes sin leer', en: 'Added: the chat icon shows a red dot when the world channel has unread messages', zh: '手机端聊天入口现在会在世界频道有未读消息时显示红点' },
            ],
        },
        '7.14': {
            title: { es: 'Evolución visual de las habilidades de clase', en: 'Class Skill Visual Progression', zh: '职业技能视觉成长' },
            highlights: [
                { es: 'Bola de Fuego añade puntos de impacto de lluvia de fuego: el área golpeada se siente mucho más aplastante', en: 'Fireball now adds bursting fire-rain impact points for a much heavier flame hit area', zh: '火球术在成长后追加爆裂火雨落点，命中区域有更强的火焰压迫感' },
                { es: 'Descarga Eléctrica encadena a los enemigos cercanos en una red: se lee mucho mejor en grupos', en: 'Lightning Strike now chains nearby enemies into a grid, so group fights read far better', zh: '雷电术成长后会把周围敌人连成链式电网，群怪场面更清晰' },
                { es: 'Disparo Múltiple sube sus estelas e impacto a una cortina de haces de flechas', en: 'Multishot trails and hit feedback upgrade to a volley of arrow beams', zh: '多重射击成长后飞行拖尾和命中反馈升级为箭幕线束' },
                { es: 'Escudo Sagrado añade pilares sagrados y fragmentos de espejo reflectantes: la rama de escudo se distingue mucho más', en: 'Holy Shield now adds holy pillar lines and reflective mirror shards, making the shield branch far clearer', zh: '神圣护盾成长后增加圣壁柱线和反射镜面折线，护盾分支辨识度更高' },
                { es: 'El ataque físico básico ya tiene niveles de media luna, remolino y tajo de tierra, con el estándar de hoja de arco fino', en: 'The basic physical attack gained proper half-moon, whirlwind and earth-splitter tiers, following the thin-arc blade standard', zh: '物理普攻成长补齐半月、旋风和裂地斩视觉层级，沿用细弧刀锋标准' },
                { es: 'Solo efectos visuales: el daño, los enfriamientos, el botín y el coste de maná no cambian', en: 'Visuals only: skill damage, cooldowns, drops and mana costs are unchanged', zh: '本次只强化视觉表现，不改变技能伤害、冷却、掉落或法力消耗' },
            ],
        },
        '7.13': {
            title: { es: 'Tajos de barrido físico', en: 'Physical Sweep Blades', zh: '物理横扫刀锋' },
            highlights: [
                { es: 'Cuando el ataque físico básico crece en nivel o Fuerza, ejecuta tajo, media luna y barrido si te rodean', en: 'Once the basic physical attack grows enough in level or Strength, it unleashes cleave, half-moon and sweeping blades when surrounded', zh: '物理普攻成长到一定等级或力量后，会在多人围攻时触发顺劈、半月斩和横扫刀锋' },
                { es: 'El barrido golpea a todo el grupo delantero: el combate automático limpia más rápido en cuerpo a cuerpo', en: 'Sweeps hit whole groups ahead, so auto battle clears crowds smoothly in melee', zh: '横扫会命中前方成片敌人，自动战斗近身刷怪时清怪更顺畅' },
                { es: 'Añadidos destellos de media luna por capas, aviso de barrido y más impacto: los guerreros se sienten más protagonistas', en: 'Added layered half-moon slashes, a sweep tell and extra hit feedback for a punchier warrior feel', zh: '新增多层半月刀光、横扫提示和额外命中反馈，强化战士系爽感' },
                { es: 'El barrido solo se activa con suficientes enemigos cerca y tiene límite de objetivos y multiplicador de daño: nada de borrar la pantalla', en: 'Sweeps only trigger with enough nearby enemies and carry a target cap and damage multiplier, so no screen wiping', zh: '横扫只在附近敌人足够多时触发，并有额外目标上限和伤害倍率，避免无脑清屏' },
            ],
        },
        '7.12': {
            title: { es: 'Más monstruos en combate automático', en: 'Auto Battle Spawn Density', zh: '自动战斗刷怪密度优化' },
            highlights: [
                { es: 'Más monstruos por piso: los pisos bajos también sirven para cazar botín', en: 'More monsters spawn per floor, so early floors are worth farming for loot too', zh: '提高每层初始怪物数量，低层也更适合刷怪刷宝' },
                { es: 'La reposición es por lotes: los grupos que limpias se recuperan antes', en: 'Respawns are now batched, so cleared packs come back faster', zh: '动态刷新改为批量补怪，怪物被清掉后会更快回补' },
                { es: 'El combate automático mantiene un objetivo de monstruos más alto: menos tiempo corriendo en vacío', en: 'Auto battle keeps a higher monster target, so you waste less time running around', zh: '自动战斗开启时维持更高怪物目标数量，减少空跑时间' },
                { es: 'Los puntos de aparición reintentan varias veces: una posición cercana ya no anula toda la ronda', en: 'Spawn points retry several times, so one bad random position no longer skips a whole round', zh: '刷新点增加多次重试，不再因为一次随机位置太近就整轮不刷' },
            ],
        },
        '7.11': {
            title: { es: 'Jefes, ambiente del dungeon y botín con más presencia', en: 'Boss Fights, Dungeon Atmosphere & Loot Visuals', zh: 'Boss战、地牢氛围与掉落视觉升级' },
            highlights: [
                { es: 'Añadida barra de vida superior del jefe, avisos de fase y alertas de zona de peligro mucho más claras', en: 'Added a top boss health bar, phase callouts and much clearer danger-zone warnings', zh: '新增 Boss 顶部血条、阶段提示和更清晰的危险范围预警' },
                { es: 'Los pisos de jefe tienen arena propia, runas en el suelo, iluminación temática y decoración', en: 'Boss floors now have their own arena, floor runes, themed lighting and scenery', zh: 'Boss 层加入专属竞技场、地面符文、主题光源和场景装饰' },
                { es: 'Sombras en la base de los muros, escombro y bordes de suelo mejor definidos: el dungeon gana profundidad', en: 'Stronger wall-base shadows, rubble and floor edge blending give the dungeon real depth', zh: '强化地牢墙脚阴影、碎石和地面边缘过渡，空间层次更明显' },
                { es: 'El botín Mágico y superior deja un halo en el suelo; Raro, Único y Conjunto tienen un brillo de rareza más claro', en: 'Magic loot and above now drop a ground halo; Rare, Unique and Set items get clearer rarity flair', zh: '蓝装以上掉落增加地面光环，黄装、暗金和套装拥有更清楚的稀有度演出' },
                { es: 'Tus habilidades activas, conjuntos y armas de alta calidad tiñen el halo del suelo y el color del tajo', en: 'Your active skills, sets and high-tier weapons tint the ground halo and melee slash color', zh: '玩家主动技能、套装和高品质武器会影响脚底光环与近战斩击颜色' },
            ],
        },
        '7.10': {
            title: { es: 'Héroes, monstruos, efectos y sonido', en: 'Character, Monster, VFX & Audio Upgrade', zh: '角色、怪物、特效与音效升级' },
            highlights: [
                { es: 'VFX rehechos: impactos de habilidad, estados, afijos de élite y avisos de jefe', en: 'Redone VFX for skill hits, status effects, elite affixes and boss warnings', zh: '重做技能命中、状态、精英词缀和 Boss 预警 VFX' },
                { es: 'Truenos reales y sonidos de lanzamiento, impacto y muerte para todo el combate', en: 'Real thunder SFX, plus casting, hit and death sounds for the whole combat loop', zh: '接入真实闪电音效，并补齐施法、受击、死亡等关键战斗音效' },
                { es: 'Añadidos los fotogramas de caminar en diagonal del héroe: el movimiento ya no reutiliza la pose frontal ni trasera', en: 'Added all diagonal walk frames for the hero, so movement no longer reuses front or back poses', zh: '补齐主角四向斜走帧，移动时不再复用正面或背面动作' },
                { es: 'Los monstruos normales atacan y reaccionan con animación real: los golpes y el daño se leen mucho mejor', en: 'Regular monsters now attack and flinch with real animation, making hits and damage reactions read better', zh: '强化普通怪攻击与受击动作，命中反馈和挨打反应更连贯' },
            ],
        },
        '7.09': {
            title: { es: 'Campamento, combate e interfaz más finos', en: 'Camp, Combat & UI Polish', zh: '营地、战斗与界面体验优化' },
            highlights: [
                { es: 'El Campamento de las Arpías y el dungeon siguen ganando detalle y profundidad', en: 'Rogue Encampment and the dungeon keep getting richer in detail and depth', zh: '罗格营地和地牢细节继续优化，场景层次更丰富' },
                { es: 'Corregido: puestos que tapan la vista, selección de sitio errónea y vendedores mirando al revés', en: 'Fixed stalls blocking the view, wrong spot selection and vendors facing the wrong way', zh: '修复摊位遮挡、选位错误和摆摊坐姿朝向异常' },
                { es: 'Añadidas sombras de contacto bajo héroes, NPC y monstruos: los personajes se apoyan en el suelo', en: 'Added contact shadows under heroes, NPCs and monsters, so everyone stands on the ground', zh: '新增主角、NPC 和怪物脚底接触阴影，角色更贴地' },
                { es: 'Impactos de habilidad más rotundos, animaciones de daño y sonidos de combate mejorados', en: 'Punchier skill impact bursts, monster flinch animations and combat sounds', zh: '强化技能命中爆点、怪物受击动作和战斗音效' },
                { es: 'La barra de habilidades, los paneles y el árbol de habilidades ganan un acabado de metal oscuro', en: 'The skill bar, panels and skill tree now have a dark metal look', zh: '升级技能栏、面板和技能树的暗黑金属质感' },
            ],
        },
        '7.08': {
            title: { es: 'Mapa, héroe, monstruos y combate mejorados', en: 'Map, Character, Monster & Combat Upgrade', zh: '地图、角色、怪物与战斗升级' },
            highlights: [
                { es: 'Paredes, esquinas, suelo y oclusiones del dungeon rehechos: la exploración gana profundidad', en: 'Redone dungeon walls, corners, floor structure and foreground occlusion give exploration real depth', zh: '重做地牢墙体、转角、地面结构和前景遮挡，探索画面更有层次' },
                { es: 'Temas de bosque, hielo e infierno más fuertes, con luz de fuego y resplandor frío', en: 'Stronger forest, ice and hell themes with firelight and cold glow ambience', zh: '强化森林、冰窟和地狱主题，并加入火光、冷光等环境氛围' },
                { es: 'Muchos sprites de monstruos redibujados: siluetas más limpias y mejor lectura', en: 'Many monster sprites redrawn with cleaner silhouettes and better readability', zh: '多种怪物贴图重新绘制，轮廓更清晰，辨识度更高' },
                { es: 'Sprites del héroe y animaciones de movimiento pulidos: pasos laterales y diagonales más naturales', en: 'Hero sprites and movement animations polished; side and diagonal steps look natural', zh: '主角贴图与移动动画优化，左右和斜向移动更自然' },
                { es: 'Sonidos de ataque físico, afijos de élite y diferencias de comportamiento ajustados: combate más claro', en: 'Physical attack sounds, elite affixes and monster behaviour differences tuned for clearer combat', zh: '优化物理攻击音效、精英词缀和怪物行为差异，战斗反馈更清晰' },
            ],
        },
        '6.99': {
            title: { es: 'Equilibrio de AFK y escalado de conjuntos', en: 'AFK Balance & Set Scaling', zh: '挂机平衡 & 套装缩放' },
            highlights: [
                { es: 'Mensajes privados: haz clic en un jugador o escribe @nombre para hablar en privado', en: 'Whispers: click a player name or type @name to start a private chat', zh: '私聊功能：点击玩家名或输入@玩家名发起私聊' },
                { es: 'Canal mundial: panel de emotes rápidos para enviar los favoritos con un clic', en: 'World channel: quick emote panel to send your favourites in one click', zh: '世界频道：快捷表情面板，一键发送常用表情' },
                { es: 'Caja de chat más grande, adaptada a móviles en vertical', en: 'Bigger chat box, sized for portrait phones', zh: '聊天框宽高放大，适配手机竖屏' },
                { es: 'Modo AFK: 20% de botín de conjunto, 40% de botín único', en: 'AFK mode: 20% set drop rate, 40% unique drop rate', zh: '挂机模式：套装掉率20%，暗金掉率40%' },
                { es: 'Los conjuntos escalan con la profundidad (velocidad de ataque, daño%, daño crítico y más)', en: 'Set bonuses scale with floor depth (attack speed, damage%, crit damage, and more)', zh: '套装属性随层数增强（攻速、伤害%、暴击伤害等）' },
            ],
        },
        '6.98': {
            title: { es: 'Compartir objetos en el canal mundial', en: 'World Channel Item Sharing', zh: '世界频道物品分享' },
            highlights: [
                { es: 'Añadido botón "Compartir en el canal mundial" en el tooltip de los objetos', en: 'Added a "Share to world channel" button to the equipment tooltip', zh: '装备tooltip新增「分享到世界频道」按钮' },
                { es: 'Los enlaces de objetos del chat se pueden pulsar para ver todas sus estadísticas', en: 'Item links in chat are now clickable to inspect full stats', zh: '聊天中的物品链接可点击查看详细属性' },
                { es: 'Los enlaces de objetos se colorean según su rareza', en: 'Item links are colored by rarity', zh: '物品链接按稀有度显示对应颜色' },
            ],
        },
        '6.97': {
            title: { es: 'Gran revisión del combate', en: 'Combat Overhaul', zh: '战斗系统大修' },
            highlights: [
                { es: 'Corregido: algunos monstruos ignoraban los escudos', en: 'Fixed shields being ignored by some monsters', zh: '修复护盾被部份怪物穿透' },
                { es: 'Corregido: el Rayo en Cadena ahora activa correctamente el botín, la experiencia y los logros', en: 'Fixed Chain Lightning so drops, XP and achievements now trigger correctly', zh: '修复连锁闪电正确触发掉落、经验、成就' },
                { es: 'La armadura ahora reduce el daño en porcentaje (100 armadura = 50% de reducción)', en: 'Armor now reduces damage by a percentage (100 armor = 50% damage reduction)', zh: '护甲公式改为百分比减伤(100护甲=50%减伤)' },
                { es: 'Vender conjuntos o equipo mejorado ahora pide confirmación', en: 'Selling set or upgraded gear now asks for confirmation', zh: '卖出套装、强化装备时需要二次确认' },
            ],
        },
        '6.96': {
            title: { es: 'Rendimiento en sesiones AFK largas', en: 'Long AFK Performance', zh: '长时间挂机性能优化' },
            highlights: [
                { es: 'Caché del minimapa: solo se redibuja al explorar zonas nuevas, 0 coste en AFK', en: 'Minimap caching: only redraws when you explore a new area, 0 cost while AFK', zh: '小地图缓存系统：只在探索新区域时重绘，挂机时 0 开销' },
                { es: 'Etiquetas de objeto: se saltan las actualizaciones del DOM si la cámara está quieta', en: 'Item label optimization: DOM updates are skipped while the camera is still', zh: '物品标签优化：摄像机静止时跳过 DOM 更新' },
                { es: 'Oclusión optimizada: Set reutilizado y codificación bit a bit eliminan la presión del GC', en: 'Occlusion fix optimized: reused Set plus bitwise encoding removes GC pressure', zh: '遮挡修复优化：复用 Set + 位运算编码，消除 GC 压力' },
            ],
        },
        '6.95': {
            title: { es: 'Tienda de títulos', en: 'Title Shop', zh: '称号商店系统' },
            highlights: [
                { es: 'El Sabio Místico ya tiene tienda de títulos: 7 títulos (10K~500M de oro)', en: 'The Mystic Sage now has a title shop: 7 titles (10K~500M gold)', zh: '神秘贤者新增称号商店，7种称号（1万~5亿金币）' },
                { es: 'Compra con ceremonia: animación del oro descontado y ventana de título obtenido', en: 'Purchase with ceremony: a gold deduction animation and a title unlock popup', zh: '购买仪式感：金币扣除动画 + 称号获得特效弹窗' },
                { es: 'Los títulos de 1M de oro o más se anuncian en todo el servidor y salen en el chat y sobre tu cabeza', en: 'Titles above 1M gold trigger a server-wide announcement and show in chat and above your head', zh: '100万以上称号购买时全服公告，称号显示在聊天/头顶' },
            ],
        },
        '6.94': {
            title: { es: 'Experiencia en niveles altos', en: 'High-Level Experience', zh: '高等级经验优化' },
            highlights: [
                { es: 'La experiencia de monstruo ahora crece de forma exponencial: los pisos altos cunden mucho más', en: 'Monster XP now grows exponentially, making deep floors far more efficient', zh: '怪物经验改为指数增长，高层刷怪效率大幅提升' },
                { es: 'Los personajes de nivel 40+ suben de nivel 2-4 veces más rápido', en: 'Level 40+ characters level 2-4x faster', zh: '40级以上玩家升级速度提升2-4倍' },
                { es: 'Corregido: la etapa 3 del Escudo no se podía desbloquear; añadidos sonidos de escudo', en: 'Fixed the shield skill 3rd stage not unlocking, and added shield sounds', zh: '修复护盾技能第3阶段无法点亮的问题，增加护盾音效' },
            ],
        },
        '6.93': {
            title: { es: 'Comisión del combate automático', en: 'Auto Battle Hiring Fee', zh: '自动战斗雇佣费' },
            highlights: [
                { es: 'Activar el combate automático ahora cobra una comisión del 15% del oro', en: 'Turning on auto battle now costs a 15% gold hiring fee', zh: '开启自动战斗时收取15%金币雇佣费' },
                { es: 'La primera vez aparece un panel de aviso (el juego se pausa)', en: 'A confirmation panel pops up the first time (the game pauses)', zh: '首次开启时弹出提醒面板（游戏暂停）' },
            ],
        },
        '6.92': {
            title: { es: 'Muerte y regreso', en: 'Death & Revival', zh: '死亡复活系统' },
            highlights: [
                { es: 'Panel de muerte: muestra el resumen de la partida (piso, bajas, nivel, causa)', en: 'Death panel: shows your run stats (floor, kills, level, cause of death)', zh: '死亡弹窗：显示战绩统计（层数、击杀、等级、死因）' },
                { es: 'Revivir en el sitio: paga oro para volver; el coste crece con nivel/piso', en: 'Revive in place: pay gold to come back, and the price grows with level/floor', zh: '原地复活：消耗金币复活，费用随等级/层数增长' },
                { es: 'Revivir seguro: un punto lejos de los enemigos + 1.5s de invulnerabilidad + vida y maná llenos', en: 'Safe revive: a spot away from enemies, 1.5s invulnerable and full health and mana', zh: '安全复活：远离敌人的安全位置+1.5秒无敌 + 满血满蓝' },
            ],
        },
        '6.91': {
            title: { es: 'Recogida mejorada en combate automático', en: 'Auto Battle Looting', zh: '自动战斗拾取优化' },
            highlights: [
                { es: 'El combate automático recoge equipo a distancia, igual que el oro y las pociones', en: 'Auto battle now picks up gear at range, just like gold and potions', zh: '自动战斗时装备远距离拾取：和金币药水一样' },
                { es: 'Resuelve de raíz el problema de equipo "inalcanzable" en las esquinas', en: 'Fully fixes the "unreachable" problem when gear spawns in a corner', zh: '彻底解决装备在墙角导致的\'无法到达\'问题' },
            ],
        },
        '6.9': {
            title: { es: 'Nueva habilidad: Escudo', en: 'Shield Skill Added', zh: '增加护盾技能' },
            highlights: [
                { es: 'Añadida la habilidad de Escudo y su árbol de habilidades', en: 'Added the Shield skill and its skill tree', zh: '增加护盾技能和技能树' },
                { es: 'Efectos del escudo: halo ovalado dorado y borde dorado en el orbe de vida', en: 'Shield visuals: a golden oval halo and a gold rim on your health orb', zh: '护盾视觉效果：金色椭圆光环 + 血球金边' },
                { es: 'Combate automático: lanza el Escudo automáticamente por debajo del 50% de vida', en: 'Auto battle support: casts Shield automatically below 50% health', zh: '自动战斗支持：血量低于50%自动释放护盾' },
                { es: 'Descarga Eléctrica mejorada: las etapas 2/3 llaman más rayos (1→2→4) y priorizan grupos', en: 'Lightning Strike buffed: stages 2/3 call down more bolts (1→2→4) and prioritise groups', zh: '雷电术增强：阶段2/3多落雷(1→2→4根)，优先攻击群怪' },
            ],
        },
        '6.8': {
            title: { es: 'Sistema de árbol de habilidades', en: 'Skill Tree', zh: '技能树系统' },
            highlights: [
                { es: 'Árbol de habilidades rehecho: cada habilidad tiene 3 etapas, con rutas ramificadas en la 2 y la 3', en: 'Skill tree rebuilt: every skill has 3 stages, with branching paths at stages 2/3', zh: '技能树重构：每个技能3个阶段，第2/3阶段可选择分叉路线' },
                { es: 'Elección de rama: al elegir, la ruta se bloquea y hace falta un reinicio de puntos para cambiarla', en: 'Branch choice: once picked, the path is locked and you need a respec to change it', zh: '分叉选择：选择后锁定路线，需洗点才能重选' },
                { es: 'Las partidas antiguas migran solas: los niveles se convierten y los puntos sobrantes se devuelven', en: 'Old saves migrate automatically: skill levels convert and spare points are refunded', zh: '老存档迁移：自动转换技能等级，多余点数返还' },
            ],
        },
        '6.7': {
            title: { es: 'Sistema de códice', en: 'Codex', zh: '图鉴系统' },
            highlights: [
                { es: 'Códice de conjuntos: reúne las piezas y sigue tu progreso', en: 'Set codex: collect set pieces and track your set progress', zh: '套装图鉴：收集套装装备，追踪套装完成度' },
                { es: 'Códice de monstruos: registra cada monstruo y jefe abatido, con sus bajas', en: 'Monster codex: records every monster and boss you have killed, with kill counts', zh: '怪物图鉴：记录击杀过的怪物和BOSS，统计击杀数' },
            ],
        },
        '6.6': {
            title: { es: 'Desafío del Abismo', en: 'Abyss Challenge', zh: '深渊挑战系统' },
            highlights: [
                { es: 'Desafío del Abismo desbloqueado: pisos infinitos y una clasificación semanal que se reinicia y reparte recompensas', en: 'Abyss challenge unlocked: endless floors plus a weekly leaderboard that resets and pays out rewards', zh: '开启深渊挑战：无限层级，每周重置榜单发放奖励' },
                { es: 'Recompensas exclusivas del Abismo: el conjunto de 6 piezas del Conquistador del Abismo y su título', en: 'Abyss-exclusive rewards: the 6-piece Abyss Conqueror set and its own title', zh: '深渊专属奖励：深渊征服者6件套装及专属称号' },
            ],
        },
        '6.5': {
            title: { es: 'Habilidades de jefe y clasificación semanal', en: 'Boss Skills & Weekly Leaderboard', zh: 'Boss技能系统 & 周榜系统' },
            highlights: [
                { es: 'Habilidades de jefe mejoradas: distancia, veneno, furia, invocaciones, cono y ataques multidireccionales', en: 'Boss abilities upgraded: ranged, poison bolts, enrage, summons, cone and multi-direction attacks', zh: 'boss 增强技能：远距、毒箭、狂暴、召唤小怪、扇形、多方向等' },
                { es: 'Nueva clasificación semanal: se reinicia cada lunes y ¡los nuevos también pueden subir!', en: 'New weekly leaderboard: resets every Monday, and new players can climb it too!', zh: '新增周榜：每周一重置，新玩家也能冲榜！' },
            ],
        },
        '6.4': {
            title: { es: 'Sincronización en la nube y retoque de interfaz', en: 'Cloud Sync & UI Polish', zh: '多端云同步 & UI精修' },
            highlights: [
                { es: 'Sincronización en la nube disponible: código de 6 caracteres y varios dispositivos a la vez', en: 'Cloud sync is live: a 6-character sync code, and multiple devices at once', zh: '上线多端云同步：同步码6位，支持多端登录' },
                { es: 'Sesión entre dispositivos: si entras desde otro navegador u otro dispositivo, se detecta y tu sesión pasa allí', en: 'Cross-device session takeover: signing in on another browser or device is detected and your session moves over', zh: '多设备互踢：跨浏览器/跨设备登录自动检测并接管会话' },
                { es: 'Interfaz pulida: se incorpora la librería gsap y las animaciones mejoran', en: 'UI polish: the gsap library is now in, and animations run smoother', zh: '界面精修：引入 gsap 库，优化动画效果' },
            ],
        },
        '6.3.2': {
            title: { es: 'Protección de partida y equilibrio de requisitos', en: 'Save Protection & Gear Requirements', zh: '存档保护 & 装备需求平衡' },
            highlights: [
                { es: '🛡️Protección de partida: corregida una pérdida de partida que podían causar los clics muy rápidos', en: '🛡️Save protection: fixed a save loss that very fast clicking could cause', zh: '🛡️存档保护：修复极端情况下快速点击可能导致存档丢失的问题' },
                { es: 'Corregido: conjuntos y únicos que no se podían equipar por requisitos demasiado altos', en: 'Fixed set and unique gear that could not be equipped because of too-high requirements', zh: '修复套装/暗金装备需求过高无法装备的问题' },
            ],
        },
        '6.3.1': {
            title: { es: 'Arreglos de seguridad y jefes más duros', en: 'Safety Fixes & Boss Difficulty', zh: '安全修复 & Boss难度升级' },
            highlights: [
                { es: 'Interacción de habilidades mejorada: las no aprendidas aparecen en gris y al pulsarlas avisan', en: 'Skill UI improved: unlearned skills are greyed out and tapping them shows a hint', zh: '技能交互改进：未学习的技能按钮灰色禁用，点击提示引导' },
                { es: 'Registro: las notas de la versión y el nombre de usuario se muestran en orden, sin solaparse', en: 'Sign-up flow: patch notes and nickname registration now appear in order, never overlapped', zh: '注册流程优化：更新公告和昵称注册按顺序显示，避免重叠' },
                { es: 'Seguridad del nombre: lista de palabras sensibles del chat integrada; bloquea el registro y avisa', en: 'Nickname safety: chat filter word list added, registration is blocked with a warning', zh: '昵称安全升级：集成聊天敏感词库，包含敏感词时阻止注册并提示' },
                { es: 'Jefes mejorados: mucha más vida y daño, y más botín de mejora', en: 'Bosses upgraded: much more health and damage, plus more upgrade drops', zh: 'BOSS升级：全面提升血量和伤害，掉落升级数量' },
            ],
        },
        '6.3.0': {
            title: { es: 'Logros y ganancias sin conexión', en: 'Achievements & Offline Earnings', zh: '成就系统 & 离线收益' },
            highlights: [
                { es: 'Logros ampliados: de 6 a 30, repartidos en bajas, exploración, colección, combate, economía y progreso', en: 'Achievements expanded: from 6 to 30, across kills, exploration, collection, combat, economy and growth', zh: '成就扩展：从6个增加到30个，涵盖击杀、探索、收集、战斗、经济、成长六大类别' },
                { es: 'El panel de logros encaja a la perfección en escritorio y en móviles verticales', en: 'The achievement panel now fits desktop and portrait phones perfectly', zh: '成就面板优化：完美适配电脑和直屏手机' },
                { es: 'Añadidas ganancias mientras no juegas', en: 'Added offline earnings while you are away', zh: '增加离线收益系统' },
            ],
        },
        '6.2': {
            title: { es: 'Revolución del impacto y escenario destructible', en: 'Game Feel Overhaul & Breakables', zh: '打击感革命 & 场景破坏系统' },
            highlights: [
                { es: 'Escenario destructible: barriles, cajas y jarras del dungeon ahora se rompen', en: 'Breakables: barrels, crates and pots in the dungeon can now be smashed', zh: '场景破坏：地牢新增可破坏的木桶、木箱和陶罐' },
                { es: 'Frame de impacto, escalado de entidades y sacudida de pantalla, activables en Ajustes generales', en: 'Hit stop, entity scaling and screen shake, all toggleable in General settings', zh: '受击顿帧、实体缩放、屏幕震动反馈，可在通用设置开启' },
                { es: 'Botín con física: los objetos describen un arco y rebotan al tocar el suelo', en: 'Physics drops: items now arc through the air and bounce when they land', zh: '物理掉落系统：物品掉落现在拥有抛物线轨迹、落地弹跳' },
                { es: 'Sonidos por capas: los impactos se dividen en normal, crítico y muerte', en: 'Layered sounds: hit SFX now split into normal, crit and kill', zh: '阶梯式音效：受击音效现在分为普通/暴击/击杀' },
                { es: 'Botín rediseñado: solo los conjuntos permanecen para siempre, el resto desaparece por etapas', en: 'Loot reworked: only set items stay forever, everything else fades in stages', zh: '掉落机制重塑：仅套装永久保留，其他分阶梯消失' },
                { es: 'Efectos mejorados: salpicaduras de sangre y empujones físicos', en: 'Visual punch: physical blood splatter and knockback', zh: '视觉增强：物理血溅、物理击退' },
            ],
        },
        '6.1.1': {
            title: { es: 'Comodidad y recogida mejorada', en: 'QoL & Looting', zh: '体验优化 & 拾取增强' },
            highlights: [
                { es: 'Combate automático: el oro vale tanto como un conjunto, tiene máxima prioridad y detecta a través de paredes', en: 'Auto battle treats gold like sets: gold pickup is top priority and works through walls', zh: '自动战斗优化：视金钱如套装！金币拾取优先级提至最高，且支持隔墙侦测' },
                { es: 'Texto de porcentaje de experiencia mucho más legible (blanco con sombra negra)', en: 'Much clearer XP percentage text on the bar (white with a black outline)', zh: '视觉增强：大幅提升经验条百分比文字清晰度（白色+黑边阴影）' },
                { es: 'Corrección de precisión: la experiencia flotante ya no muestra tantos decimales al matar', en: 'Precision fix: floating XP values no longer show long decimals on kill', zh: '精度修补：修复击杀怪物时漂浮经验值出现多位小数的浮点误差问题' },
                { es: 'Desatasco inteligente: vigilancia de 10s, los objetos inalcanzables se descartan y bloquean para que el AFK no se cuelgue', en: 'Smart unstuck: 10s movement monitoring, unreachable drops are skipped and blacklisted so AFK never hangs', zh: '智能脱困：增加10秒位置位移监控，自动放弃并拉黑无法到达的掉落物，防止挂机卡死' },
            ],
        },
        '6.1': {
            title: { es: 'Reconstrucción del rendimiento y mejora visual', en: 'Performance Rebuild & Visual Upgrade', zh: '性能重构 & 视觉升级' },
            highlights: [
                { es: 'Optimización a fondo: se rehízo el núcleo de IA y el uso de CPU bajó mucho', en: 'Deep performance work: the AI core was rebuilt, cutting CPU use sharply', zh: '深度性能优化：重构AI计算内核，CPU占用大幅降低' },
                { es: 'Renderizado: la sangre se dibuja en un canvas fuera de pantalla y la tasa de fotogramas se duplica al final del combate', en: 'Rendering: blood is drawn on an offscreen canvas, doubling late-fight frame rate', zh: '渲染优化：离屏Canvas绘制血迹，后期战斗帧率翻倍' },
                { es: 'Elementos mejorados: el daño de frío y de rayo tienen su propio destello de impacto y sus números', en: 'Elemental punch: cold and lightning damage get their own hit glow and numbers', zh: '元素视觉增强：冰冷/闪电伤害拥有专属受击光效和数字特效' },
                { es: 'Inventario: el borde de rareza se mantiene aunque falten requisitos, para reconocer las piezas legends al instante', en: 'Inventory: rarity borders stay even when requirements are unmet, so legendaries stand out at a glance', zh: '物品栏优化：需求不足时保留稀有度边框，一眼辨识神器' },
                { es: 'Correcciones clave: el stock de Gheed se sincroniza bien y la IA calcula la distancia correctamente', en: 'Key fixes: Gheed stock now syncs correctly and AI distance checks were corrected', zh: '关键修复：基格商人库存同步修复，AI距离计算修正' },
            ],
        },
        '6.0': {
            title: { es: 'Login diario y más tienda', en: 'Daily Login & Shop Expansion', zh: '每日登录 & 商店扩展' },
            highlights: [
                { es: 'Login diario rehecho: los 7 días dan ahora buffs', en: 'Daily login rebuilt: all 7 days now give buffs', zh: '每日登录重做：7天全是buff奖励' },
                { es: 'Day7: 24h de EXP x3 y equipo de conjunto', en: 'Day7: 24h of triple XP and a set item', zh: 'Day7：24小时三倍经验 + 套装装备' },
                { es: 'La tienda ya vende pergaminos de EXP doble (1000G/1 hora)', en: 'The shop now sells Double XP scrolls (1000G/1 hour)', zh: '商店新增双倍经验卷轴（1000G/1小时）' },
                { es: 'Mapas más grandes: 64×64 → 80×80 (+56% de espacio explorable)', en: 'Bigger maps: 64×64 → 80×80 (+56% exploration space)', zh: '地图放大：64×64 → 80×80（+56%探索空间）' },
                { es: 'Pasillos más anchos: al menos 2 casillas, el combate automático ya no se atasca', en: 'Wider corridors: at least 2 tiles wide, so auto battle no longer jams', zh: '走廊加宽：至少2格宽，自动战斗不再卡住' },
                { es: 'Corregido: los jefes de las misiones diarias no contaban', en: 'Fixed daily quest bosses not counting', zh: '修复：每日任务Boss不计数' },
            ],
        },
        '5.9': {
            title: { es: 'Puestos de jugador', en: 'Player Stalls', zh: '玩家摆摊系统' },
            highlights: [
                { es: 'Puestos de jugador: monta un puesto en el Campamento de las Arpías para vender equipo', en: 'Player stalls: set up a stall in the Rogue Encampment to sell gear', zh: '玩家摆摊：在罗格营地可摆摊出售装备' },
                { es: 'Coste del puesto: 500G/hora, hasta 10 horas', en: 'Stall fee: 500G/hour, up to 10 hours', zh: '摊位费：500G/小时，最多10小时' },
                { es: 'Puestos offline: la venta continúa aunque cierres el juego', en: 'Offline stalls: your goods keep selling after you log off', zh: '离线摆摊：关闭游戏也能卖货' },
                { es: 'Ventas en vivo: aviso inmediato cuando se vende algo', en: 'Live sales: instant notification when something sells', zh: '实时交易：商品售出即时通知' },
                { es: 'Corregido: el oro mostrado en la mochila incrustada', en: 'Fixed: the gold display inside the embedded backpack', zh: '修正：内嵌背包金币显示' },
            ],
        },
        '5.8': {
            title: { es: 'Adaptación a móvil', en: 'Mobile Support', zh: '移动端适配' },
            highlights: [
                { es: 'Jugable en móvil, también en vertical', en: 'Now playable on mobile, including portrait screens', zh: '适配移动端（含直屏）' },
                { es: 'Los paneles de tienda, alijo y herrería incluyen la mochila', en: 'Shop, stash and forge panels now embed the backpack', zh: '商店/仓库/锻造面板内嵌背包' },
                { es: 'Ordenar con un toque en mochila y alijo', en: 'One-tap sorting for backpack and stash', zh: '背包/仓库一键整理功能' },
                { es: 'Se retiraron los avisos de objeto y el acceso con Enter', en: 'Drop item hints and Enter to enter are gone', zh: '取消入口提示和 Enter 键进入' },
                { es: 'Los objetos soltados no se recogen durante 5 segundos en combate automático', en: 'Dropped items are no longer picked up for 5 seconds during auto battle', zh: '自动战斗时物品丢弃 5 秒内不再拾取' },
                { es: 'La comparación de equipo usa dos columnas y se lee mucho mejor', en: 'Gear comparison now uses a two-column tooltip and reads much faster', zh: '装备属性对比改为双栏气泡更直观' },
            ],
        },
        '5.7': {
            title: { es: 'Misiones diarias y ampliación del alijo', en: 'Daily Quests & Stash Expansion', zh: '每日任务 & 仓库扩建' },
            highlights: [
                { es: 'Misiones diarias rehechas: desbloqueo en cadena (fácil→media→difícil)', en: 'Daily quest system rebuilt: chained unlocks (easy→medium→hard)', zh: '每日任务系统重做：链式解锁（简单→中等→困难）' },
                { es: 'Los objetivos se calculan según tu nivel y las misiones difíciles dan puntos de habilidad', en: 'Quest goals scale with your level, and hard quests reward skill points', zh: '任务目标根据等级动态计算，困难任务奖励技能点' },
                { es: 'Ampliación del alijo: paga oro para más casillas, hasta 3 veces (36→54)', en: 'Stash expansion: pay gold for more slots, up to 3 times (36→54)', zh: '仓库扩建：花费金币扩容，最多3次（36→54格）' },
                { es: 'Misiones, anuncios y logros muestran el nombre del piso (p. ej. "Cementerio Marchito")', en: 'Quests, announcements and achievements all show floor names (e.g. "Deadwood Graveyard")', zh: '任务/公告/成就统一显示楼层名（如「枯木墓地」）' },
            ],
        },
        '5.6': {
            title: { es: 'Social: chat mundial y arreglos', en: 'Social: World Chat & Fixes', zh: '社交：世界聊天 & 优化' },
            highlights: [
                { es: 'Nuevo canal de chat mundial para hablar en tiempo real', en: 'New world chat channel for real-time talk', zh: '新增世界聊天频道，实时畅聊' },
                { es: 'Cada piso del dungeon tiene nombre propio en tres biomas: bosque, hielo y lava', en: 'Every dungeon floor now has its own name across three biomes: forest, ice and lava', zh: '地牢每层都有独特名称（森林/冰原/熔岩三大群系）' },
                { es: 'Los portales permiten ir a cualquier piso que ya hayas alcanzado', en: 'Portals let you travel to any floor you have reached', zh: '传送门支持选择任意已到达层数' },
                { es: 'IA del vampiro: embiste con un ataque de robo de vida', en: 'Vampire AI: lunges in with a life-drain attack', zh: '吸血鬼AI：突进吸血攻击' },
                { es: 'IA del espectro de rayo: lanza orbes de rayo y atraviesa paredes', en: 'Lightning wraith AI: fires lightning orbs and moves through walls', zh: '闪电幽魂AI：发射闪电球+穿墙移动' },
                { es: 'Corregido: los monstruos a distancia atacaban a través de las paredes', en: 'Fixed ranged monsters shooting through walls', zh: '修复远程怪物隔墙攻击的问题' },
            ],
        },
        '5.5': {
            title: { es: 'Mejoras de combate automático y rendimiento', en: 'Auto Battle & Performance', zh: '自动战斗优化 & 性能优化' },
            highlights: [
                { es: 'Detección de combate: ahora actúa a 80 casillas de cualquier enemigo, sin dejar oro atrás', en: 'Combat check: now triggers within 80 tiles of any enemy, so gold is never left behind', zh: '激烈战斗判定：改为任意敌人80内，不会忘记拣金币' },
                { es: 'Los mapas se pre-dibujan en un canvas fuera de pantalla, ~5800 veces más rápido', en: 'Maps are pre-rendered to an offscreen canvas, ~5800x faster', zh: '地图离屏Canvas缓存绘制，性能提升 ~5800 倍' },
                { es: 'Clasificación: nueva tabla de los más ricos', en: 'Leaderboard: added a richest-players ranking', zh: '排行榜：增加富豪榜' },
            ],
        },
        '5.4': {
            title: { es: 'Rendimiento y ajustes de gráficos', en: 'Performance & Graphics Settings', zh: '性能优化 & 画质设置' },
            highlights: [
                { es: 'Nuevo ajuste de gráficos: Efectos Altos o Rendimiento', en: 'New graphics setting: High FX or Performance', zh: '新增画质设置：华丽特效/性能优先 可选' },
                { es: 'Eliminado el temblor constante de pantalla en ataques, críticos y al recibir daño', en: 'Removed constant screen shake on normal attacks, crits and taking hits', zh: '移除高频震屏（普通攻击/暴击/被击中等）' },
                { es: 'Límite de 200 partículas para ir fluido en PCs modestos', en: 'Particle cap set to 200 for smoother play on low-end PCs', zh: '粒子上限200个，优化低配电脑性能' },
                { es: 'Combate automático: abrir un panel ya no pausa el juego', en: 'Auto battle: opening a panel no longer pauses the game', zh: '自动战斗：打开面板不再暂停' },
            ],
        },
        '5.3': {
            title: { es: 'Anuncios del servidor', en: 'Server Announcements', zh: '全服公告系统' },
            highlights: [
                { es: 'Barra de anuncios en la parte superior con la actividad del servidor en vivo', en: 'Scrolling announcement bar at the top, showing live server activity', zh: '顶部滚动公告栏：实时显示全服玩家动态' },
                { es: 'Matar a un jefe se anuncia en todo el servidor en dorado', en: 'Boss kills are announced server-wide in gold', zh: '击杀Boss全服通报（金色）' },
                { es: 'Conseguir un conjunto se anuncia en todo el servidor en verde', en: 'Set drops are announced server-wide in green', zh: '获得套装全服通报（绿色）' },
            ],
        },
        '5.2': {
            title: { es: 'El mundo con más detalle', en: 'World Detail Overhaul', zh: '世界细节重塑' },
            highlights: [
                { es: 'Nuevo sistema de decoración del mapa: se acabaron las paredes vacías', en: 'Brand-new map decoration system: no more plain walls', zh: '全新地图装饰系统：告别单调墙壁' },
                { es: 'Decoración propia de cada bioma: árboles ancestrales, cristales de hielo y torres del infierno', en: 'Biome-exclusive scenery: ancient forest trees, ice crystals and hell spires', zh: '三大群系专属装饰：森林古树、冰原水晶、地狱尖塔' },
                { es: 'Renderizado híbrido: el detalle procedural se funde a la perfección con las texturas pixel art', en: 'Hybrid rendering: procedural detail blends seamlessly with pixel-art tiles', zh: '混合渲染技术：程序化细节 + 像素风贴图完美融合' },
            ],
        },
        '5.1': {
            title: { es: 'Actualización de efectos visuales', en: 'Visual Effects Update', zh: '视觉效果更新' },
            highlights: [
                { es: 'Charcos de sangre al morir los monstruos, que se desvanecen en 15-25 segundos', en: 'Bloodstains when monsters die, fading out after 15-25 seconds', zh: '怪物死亡地面血迹效果，15-25秒渐隐消失' },
                { es: 'Efectos de habilidad mejorados: Rayo en Cadena más visible, Bola de Fuego con estela y Disparo Múltiple con flechas', en: 'Skill visuals upgraded: stronger Chain Lightning, Fireball trails and Multishot arrows', zh: '技能视觉优化：闪电链视觉增强、火球增加拖尾粒子、多重射击箭矢及拖尾' },
                { es: 'Los jefes y los élites tienen ya efectos de muerte propios', en: 'Bosses and elites got their own death effects', zh: 'Boss和精英怪增加死亡特效' },
                { es: 'Efecto de nivel: destello dorado, pilar de luz, partículas y sacudida de pantalla', en: 'Level-up effect: golden flash, light pillar, particles and screen shake', zh: '升级特效：金色闪光+光柱+粒子+震屏' },
                { es: 'Los objetos salen volando al personaje: recogida con curva de Bézier', en: 'Items fly into you: pickup along a Bézier curve', zh: '物品吸入效果：贝塞尔曲线飞行拾取' },
                { es: 'El Pergamino Portal gana un efecto mucho más especial', en: 'Town Portal Scroll got a more ceremonial feel', zh: '回城卷轴增加仪式感' },
                { es: 'Nuevo sonido con poca vida y al gastar puntos', en: 'New sound cues for low health and for spending points', zh: '低血量和加点时增加音效' },
                { es: 'Críticos más potentes: cámara lenta, números dorados y más impacto', en: 'Crits hit harder: slow motion, golden numbers and heavier impact', zh: '暴击反馈增强：慢动作+金色数字+更强打击感' },
                { es: 'Contador de combo: ves tu racha de golpes (solo visual, sin bonus)', en: 'Combo counter: your hit streak is on screen (visual only, no stat changes)', zh: '连击系统：显示连击数（纯视觉爽感，无数值影响）' },
            ],
        },
        '5.0': {
            title: { es: 'Varias partidas', en: 'Multiple Save Slots', zh: '多存档系统' },
            highlights: [
                { es: '3 partidas independientes para llevar varios personajes a la vez', en: '3 independent save slots, so you can run several characters at once', zh: '支持3个独立存档，可同时培养多个角色' },
                { es: 'Añadida la guía para nuevos jugadores', en: 'Added a new-player guide', zh: '增加新手引导' },
                { es: 'Las recompensas del login diario ya tienen efecto al reclamarlas', en: 'Daily login rewards now have a claim effect', zh: '每日登录奖励增加领取特效' },
            ],
        },
        '4.9': {
            title: { es: 'Se amplía el bestiario', en: 'Monster Roster Expansion', zh: '怪物系统大扩展' },
            highlights: [
                { es: '6 nuevos monstruos: zombi, guerrero esqueleto, fantasma, espectro de rayo, momia y vampiro', en: '6 new monsters: zombie, skeleton warrior, ghost, lightning wraith, mummy and vampire', zh: '新增6种怪物：僵尸、骷髅战士、幽灵鬼魂、闪电幽魂、木乃伊、吸血鬼' },
                { es: 'Los fantasmas atraviesan paredes y esquivan un 30%, las momias envenenan y los vampiros drenan un 20%', en: 'Ghosts phase through walls and dodge 30% of hits, mummies poison and vampires drain 20% life', zh: '幽灵可穿墙+30%闪避，木乃伊中毒攻击，吸血鬼20%吸血' },
                { es: 'Los monstruos se desbloquean por profundidad y aparecen según tablas de probabilidad', en: 'Monsters unlock gradually as you go deeper and spawn from weighted pools', zh: '怪物按层数逐步解锁，权重池随机生成' },
            ],
        },
        '4.8': {
            title: { es: 'Mejora de equipo en la herrería', en: 'Blacksmith Upgrades', zh: '铁匠铺强化系统' },
            highlights: [
                { es: 'Nueva NPC Charsi ofrece mejoras de equipo', en: 'New NPC Charsi offers gear upgrades', zh: '新增NPC恰西，提供装备强化服务' },
                { es: 'Mejora con 2 objetos del mismo tipo y rareza, hasta +9', en: 'Upgrade with 2 items of the same slot and rarity, up to +9', zh: '消耗2件同部位同品质装备强化，最高+9' },
                { es: 'Por encima de +6 hay riesgo de fallo y el nivel puede bajar', en: 'Above +6 there is a failure risk and the level can drop', zh: '+6以上有失败风险，可能降级' },
            ],
        },
        '4.7': {
            title: { es: 'Optimización general', en: 'Game Optimization', zh: '游戏优化' },
            highlights: [
                { es: 'Arquitectura de código rehecha, con más rendimiento', en: 'Codebase reworked for better performance', zh: '代码架构重构，性能提升' },
                { es: 'Las constantes se gestionan ahora en un sistema unificado', en: 'Constants are now managed in one unified system', zh: '常量系统统一管理' },
            ],
        },
        '4.6': {
            title: { es: 'Ajuste de números', en: 'Balance Tuning', zh: '数值平衡' },
            highlights: [
                { es: 'Cada Bendición Divina ahora se puede obtener hasta 3 veces', en: 'Each Divine Blessing can now be gained up to 3 times', zh: '天神赐福每种最多获得3次' },
                { es: 'Cada renueva de la tienda de talentos cuesta más', en: 'Talent shop rerolls cost more each time', zh: '天赋商店刷新价格递增' },
                { es: 'Los talentos legendarios se desbloquean tras el nivel 5', en: 'Legendary talents unlock after the 5th tier', zh: '传奇天赋第5层后解锁' },
                { es: 'La recompensa del Day3 ahora es EXP doble durante 24h', en: 'Day3 login reward is now 24h of double XP', zh: 'Day3登录奖励改为24小时双倍经验' },
            ],
        },
        '4.5': {
            title: { es: 'Ajustes de la congelación', en: 'Freeze System Tuning', zh: '冰冻系统优化' },
            highlights: [
                { es: 'Control duro de congelación: 2s→0.5s', en: 'Freeze hard CC: 2s→0.5s', zh: '冰冻硬控时间2秒→0.5秒' },
                { es: 'Añadida una ralentización de 1.5s para poder huir y beber una poción', en: 'Added a 1.5s slow afterwards, so you can run and drink a potion', zh: '新增1.5秒减速期，可逃跑喝药' },
                { es: 'Inmunidad a la congelación: 3s→5s', en: 'Freeze immunity: 3s→5s', zh: '冰冻免疫时间3秒→5秒' },
                { es: 'Los élites congelados muestran el icono ❄️ sobre la cabeza', en: 'Frozen elites show a ❄️ icon above their head', zh: '冰冻精英怪头顶显示❄️图标' },
            ],
        },
        '4.4': {
            title: { es: 'Ajustes del sistema de muerte', en: 'Death System Tuning', zh: '死亡系统优化' },
            highlights: [
                { es: 'Al morir la pantalla se pone gris, con 5s de cuenta atrás para volver al pueblo', en: 'The screen greys out on death, with a 5s countdown before you return to town', zh: '死亡时画面变灰，5秒倒计时后回城' },
                { es: 'El combate automático ya no insiste con el Pergamino Portal si no tienes', en: 'Auto battle no longer spams town portal attempts when you have no scroll', zh: '自动战斗：没有回城卷时不再重复尝试' },
            ],
        },
        '4.3': {
            title: { es: 'Efectos de botín', en: 'Loot Effects', zh: '掉落特效' },
            highlights: [
                { es: 'Botín único: pilar de luz dorado y sacudida de pantalla', en: 'Unique drops: golden light pillar and screen shake', zh: '暗金装备掉落：金色光柱+震屏' },
                { es: 'Botín de conjunto: pilar de luz verde y un sonido misterioso', en: 'Set drops: green light pillar and a mysterious sound', zh: '套装装备掉落：绿色光柱+神秘音效' },
            ],
        },
        '4.2': {
            title: { es: 'Recompensas del login diario', en: 'Daily Login Rewards', zh: '每日登录奖励' },
            highlights: [
                { es: 'Ciclo de 7 días, el Day7 regala equipo único', en: '7-day reward cycle, Day7 hands out a unique item', zh: '7天循环奖励，Day7送暗金装备' },
                { es: 'Tasas de botín muy reducidas: el botín vuelve a sentirse escaso', en: 'Drop rates tuned way down, so loot feels rare again', zh: '掉落率大幅下调，提升稀缺感' },
            ],
        },
        '4.1': {
            title: { es: 'Bendición Divina mejorada', en: 'Divine Blessing', zh: '天神赐福优化' },
            highlights: [
                { es: 'Añadidos varios tipos nuevos de bendición', en: 'Added several new blessing types', zh: '新增多种赐福类型' },
                { es: 'El panel de bendiciones muestra todo lo que has conseguido', en: 'The blessing panel now lists everything you have earned', zh: '赐福面板可查看已获得列表' },
            ],
        },
        '4.0': {
            title: { es: 'Tienda de talentos y más conjuntos', en: 'Talent Shop & Set Expansion', zh: '天赋商店 & 套装扩展' },
            highlights: [
                { es: 'Tienda de talentos disponible al entrar a cada piso', en: 'Talent shop available on entering each floor', zh: '每层进入时可购买天赋强化角色' },
                { es: 'Conjuntos ampliados de 3 a 9 (54 piezas)', en: 'Sets expanded from 3 to 9 (54 pieces)', zh: '套装从3套扩展到9套（54件装备）' },
            ],
        },
        '3.9': {
            title: { es: 'Atributos más simples', en: 'Simpler Stats', zh: '属性系统简化' },
            highlights: [
                { es: 'El equipo muestra directamente su efecto, p. ej. +50% de daño', en: 'Gear now shows what it does, e.g. +50% damage', zh: '装备属性直接显示效果（如+50%伤害）' },
                { es: 'Los nombres de los objetos del suelo pasan encima del icono', en: 'Ground item names moved above the icon', zh: '地面物品名称移至图标上方' },
            ],
        },
        '3.8': {
            title: { es: 'Rendimiento y reequilibrio del botín', en: 'Performance & Drop Rebalance', zh: '性能优化 & 掉落重平衡' },
            highlights: [
                { es: 'Agrupación de objetos para enemigos: menos tirones', en: 'Enemy object pooling to cut stutters', zh: '敌人对象池系统，减少卡顿' },
                { es: 'Bonus por profundidad y estadística de suerte acumulada', en: 'Floor depth bonus and a cumulative luck stat', zh: '层数加成、累积幸运机制' },
                { es: 'Cada monstruo número 8 suelta siempre un consumible', en: 'Every 8th monster always drops a consumable', zh: '每8只怪必掉1个消耗品' },
            ],
        },
        '3.7': {
            title: { es: 'Clasificación y habilidades más baratas', en: 'Leaderboard & Cheaper Skills', zh: '排行榜 & 技能减负' },
            highlights: [
                { es: 'La clasificación se actualiza en tiempo real', en: 'Leaderboard updates in real time', zh: '排行榜实时更新' },
                { es: 'Todas las habilidades cuestan menos maná', en: 'All skills cost less mana', zh: '所有技能法力消耗降低' },
                { es: 'Los portales permiten elegir piso', en: 'Portals now let you pick a floor', zh: '传送门支持层数选择' },
            ],
        },
        '3.6': {
            title: { es: 'Misiones infinitas e iconos de habilidad', en: 'Endless Quests & Skill Icons', zh: '无限任务 & 技能图标' },
            highlights: [
                { es: 'Tras 10 misiones el sistema de misiones reinicia el ciclo', en: 'After 10 quests the quest system loops back around', zh: '完成10个任务后任务系统重置循环' },
                { es: 'Los iconos de habilidad ahora son sprites pixel art', en: 'Skill icons are now pixel-art sprites', zh: '技能图标改为像素风格精灵图' },
            ],
        },
        '3.5': {
            title: { es: 'Ajustes de combate automático', en: 'Auto Battle Tweaks', zh: '自动战斗优化' },
            highlights: [
                { es: 'Los enemigos con poca vida tienen prioridad', en: 'Low-health enemies are prioritised', zh: '低血量敌人优先击杀' },
                { es: 'El cuerpo a cuerpo ya no confunde los muros con atascos', en: 'Melee no longer mistakes walls for stuck spots', zh: '近战不再误判为卡墙' },
            ],
        },
        '3.4': {
            title: { es: 'Jefes infinitos por pisos', en: 'Endless Floor Boss', zh: '无限层级BOSS' },
            highlights: [
                { es: 'El piso 11 arranca el segundo ciclo con un jefe sin fin', en: 'Floor 11 starts the second cycle with an endless boss run', zh: '11层开启二周目，BOSS无限循环' },
                { es: 'Cada ciclo suma +150% de vida y +60% de daño al jefe', en: 'Each cycle adds +150% boss health and +60% damage', zh: '每周目BOSS血量+150%，伤害+60%' },
            ],
        },
        '3.3': {
            title: { es: 'Más sensación de combate', en: 'Combat Feel', zh: '战斗体验优化' },
            highlights: [
                { es: 'El ataque básico muestra ahora un arco de tajo', en: 'Basic attacks now show a slash arc', zh: '普攻显示斩击弧特效' },
                { es: 'Combate automático: recogida más inteligente y fijación de objetivo', en: 'Auto battle: smarter looting and target locking', zh: '自动战斗：智能拾取、目标锁定' },
            ],
        },
        '3.2': {
            title: { es: 'Ajustes de combate automático', en: 'Auto Battle Settings', zh: '自动战斗设置' },
            highlights: [
                { es: 'Los ajustes ahora se guardan solos', en: 'Settings now save automatically', zh: '设置自动保存' },
                { es: 'No se puede activar el combate automático en el campamento', en: 'Auto battle cannot be enabled in camp', zh: '营地无法开启自动战斗' },
            ],
        },
        '3.1': {
            title: { es: 'Sistema de combate automático', en: 'Auto Battle', zh: '自动战斗系统' },
            highlights: [
                { es: 'Pulsa F para activar el combate automático', en: 'Press F to toggle auto battle', zh: '按F键开启自动战斗' },
                { es: 'Ruta con A*, recogida automática y uso automático de pociones', en: 'A* pathfinding, auto pickup and auto potion drinking', zh: 'A*寻路、自动拾取、自动喝药' },
                { es: 'Regreso de emergencia al pueblo y protección antiatascos', en: 'Emergency town portal and anti-stuck safeguards', zh: '紧急回城、防卡死机制' },
            ],
        },
        '3.0': {
            title: { es: 'Sistema de conjuntos', en: 'Set System', zh: '套装系统' },
            highlights: [
                { es: '3 conjuntos nuevos (mago, guerrero, asesino)', en: '3 new sets (mage, warrior, assassin)', zh: '新增3套套装（法师/战士/刺客）' },
                { es: 'Las piezas 2/4/6 dan bonificaciones por tramos', en: '2/4/6 piece bonuses', zh: '2/4/6件套提供阶段性加成' },
                { es: 'Logros relacionados con los conjuntos', en: 'Set-related achievements', zh: '套装相关成就' },
            ],
        },
        '2.9': {
            title: { es: 'Evolución de la Bola de Fuego', en: 'Fireball Evolution', zh: '火球术进化' },
            highlights: [
                { es: 'Lv5 desbloquea la explosión', en: 'Lv5 unlocks the explosion', zh: 'Lv5解锁爆炸效果' },
                { es: 'El radio y el daño de la explosión suben con el nivel', en: 'Explosion radius and damage scale with level', zh: '爆炸范围和伤害随等级提升' },
            ],
        },
        '2.8': {
            title: { es: 'Arreglos del Modo Infierno', en: 'Hell Mode Fixes', zh: '地狱模式修复' },
            highlights: [
                { es: 'Corregida la gestión de pisos del Infierno y la lógica de teletransporte', en: 'Fixed Hell floor tracking and travel logic', zh: '修复地狱层数管理和传送逻辑' },
            ],
        },
        '2.7': {
            title: { es: 'Sistema de reinicio de puntos', en: 'Respec System', zh: '洗点系统' },
            highlights: [
                { es: 'Nuevo NPC: el Sabio Místico', en: 'New NPC: the Mystic Sage', zh: '新增神秘贤者NPC' },
                { es: 'Puede reiniciar tus puntos de atributo y de habilidad', en: 'He resets your attribute and skill points', zh: '可重置属性点和技能点' },
            ],
        },
        '2.6': {
            title: { es: 'Habilidades más simples', en: 'Simplified Skills', zh: '技能体系简化' },
            highlights: [
                { es: 'Se elimina el daño de frío del jugador y se conservan las resistencias', en: 'Player frost damage removed, resistances kept', zh: '移除玩家冰霜伤害，保留抗性' },
            ],
        },
        '2.5': {
            title: { es: 'Rayo en Cadena', en: 'Chain Lightning', zh: '雷电术闪电链' },
            highlights: [
                { es: 'Lv2+ desbloquea el Rayo en Cadena, que salta entre varios objetivos', en: 'Lv2+ unlocks Chain Lightning, which jumps between targets', zh: 'Lv2+解锁闪电链，可跳跃多个目标' },
            ],
        },
        '2.3': {
            title: { es: 'Nueva habilidad: Descarga Eléctrica', en: 'New Skill: Lightning Strike', zh: '新技能：雷电术' },
            highlights: [
                { es: 'Sustituye a la Nova de Hielo: invoca rayos contra los enemigos', en: 'Replaces Frost Nova: calls down lightning on enemies', zh: '替换冰霜新星，召唤闪电打击敌人' },
            ],
        },
        '2.1': {
            title: { es: 'Modo Infierno', en: 'Hell Mode', zh: '地狱模式' },
            highlights: [
                { es: 'Derrota a Baal para desbloquear el Modo Infierno', en: 'Beat Baal to unlock Hell Mode', zh: '击败巴尔解锁地狱模式' },
                { es: 'Monstruos: vida×6, daño×4, experiencia×5', en: 'Monsters: health×6, damage×4, XP×5', zh: '怪物血量×6，伤害×4，经验×5' },
            ],
        },
        '2.0': {
            title: { es: 'Gran actualización del núcleo', en: 'Core Gameplay Update', zh: '核心玩法大更新' },
            highlights: [
                { es: 'Sistema de resistencias (fuego/hielo/rayo/veneno)', en: 'Resistance system (fire/cold/lightning/poison)', zh: '抗性系统（火/冰/雷/毒）' },
                { es: 'Más de 40 afijos de equipo', en: '40+ gear affixes', zh: '40+种装备词缀' },
                { es: '12 afijos de monstruo élite', en: '12 elite affixes', zh: '12种精英怪词缀' },
                { es: 'Sistema de requisitos de nivel del equipo', en: 'Item level requirement system', zh: '装备等级需求系统' },
            ],
        },
        '1.8': {
            title: { es: 'Ajustes de mecánicas', en: 'Mechanics Tuning', zh: '游戏机制优化' },
            highlights: [
                { es: 'Haz clic en un objeto lejano y camina hasta él para recogerlo', en: 'Click a distant item and your hero walks over to pick it up', zh: '点击远处物品自动走过去拾取' },
                { es: 'La vida y el daño de los jefes aumentan mucho', en: 'Boss health and damage are way up', zh: 'BOSS血量和伤害大幅增强' },
                { es: 'Corregidos los ataques a través de paredes', en: 'Fixed attacks through walls', zh: '修复隔墙攻击问题' },
            ],
        },
        '1.7': {
            title: { es: 'Logros', en: 'Achievements', zh: '成就系统' },
            highlights: [
                { es: '6 logros cuidadosamente diseñados', en: '6 hand-crafted achievements', zh: '6个精心设计的成就' },
                { es: 'Seguimiento del progreso en tiempo real', en: 'Live progress tracking', zh: '实时进度追踪' },
            ],
        },
        '1.6': {
            title: { es: 'Sonido y equilibrio', en: 'Audio & Balance', zh: '音效与平衡' },
            highlights: [
                { es: 'Sonidos de pociones y flechas', en: 'Potion and arrow sounds', zh: '药剂音效、箭矢音效' },
                { es: 'Límite de rango en las habilidades', en: 'Skill range limits', zh: '技能射程限制' },
                { es: 'Nombres y barras de vida de monstruos mejorados', en: 'Monster nameplates and health bars improved', zh: '怪物名称血条优化' },
            ],
        },
        '1.5': {
            title: { es: 'Sistema de alijo', en: 'Stash', zh: '仓库系统' },
            highlights: [
                { es: 'Habla con Warriv para guardar y retirar objetos', en: 'Visit Warriv to store and withdraw items', zh: '找瓦瑞夫存取物品' },
                { es: 'Las misiones aumentan a 10', en: 'Quests expanded to 10', zh: '任务扩展至10个' },
                { es: 'Puedes soltar objetos de la mochila', en: 'Backpack items can be dropped', zh: '背包物品可丢弃' },
                { es: 'Primeras texturas del juego', en: 'A first batch of art', zh: '少量贴图' },
            ],
        },
        '1.0': {
            title: { es: 'Desarrollo de las funciones básicas', en: 'Core Features', zh: '基本功能开发' },
            highlights: [
                { es: 'Pueblo, NPC, mazmorra aleatoria, Pergamino Portal e inventario', en: 'Town, NPCs, random dungeons, town portal scroll and inventory', zh: '城镇、NPC、随机地牢、回程卷轴、物品栏' },
                { es: 'Puntos, equipo, ataques, habilidades, portales, jefes y recogida automática de oro', en: 'Points, gear, attacks, skills, portals, bosses and auto gold pickup', zh: '点数、装备、攻击、技能、传送门、boss、自动拾取金币' },
            ],
        },
    });
})();
