// ========== i18n.js - Sistema Multilingüe (Español / English / 中文) ==========
// Proporciona soporte multilingüe completo con persistencia y actualización reactiva de la interfaz.

// Marcadores {nombre} compartidos por t()/tr()/trPath(). Se reutiliza la misma
// expresión para no crear un RegExp por parámetro en rutas recientes.
const I18N_PLACEHOLDER_RE = /\{([a-zA-Z0-9_]+)\}/g;

const I18N = {
    currentLang: 'es', // Idioma predeterminado
    listeners: [],

    // Tablas de contenido registradas por los archivos i18n-content-*.js.
    // Cada tabla agrupa entradas {es,en,zh}; se acceden con tr()/trPath().
    content: {},
    _missingWarned: new Set(),

    locales: {
        es: {
            // General & Marca
            game_title: "菠萝战纪 Brawlore",
            game_sub: "BRAWLORE",
            enter_sanctuary: "Entrar a Santuario",
            loading: "Cargando...",
            loading_zone: "Cargando recursos de la zona...",
            welcome_back: "Bienvenido de nuevo, {name}",
            changelog_btn: "Actualizaciones",
            changelog_title: "📜 Registro de Cambios",
            confirm: "Aceptar",
            cancel: "Cancelar",
            close: "Cerrar",
            leave: "Salir",
            btn_claim_reward: "Reclamar Recompensa",
            menu_title_shop: "Tienda de Títulos",
            quest_tracker_title: "Progreso",
            npc_akara: "Akara",
            npc_gheed: "Gheed (Comerciante)",
            npc_warriv: "Warriv (Almacén)",
            npc_charsi: "Charsi (Herrera)",
            tt_viewing: "Viendo",
            settings_graphics: "Ajustes Gráficos",
            stat_gold: "Oro",
            btn_close: "Cerrar",
            save_status_found: "Se encontraron {count} partidas guardadas",
            save_status_empty: "Sin partidas guardadas",
            cloud_sync: "Sinc. en la Nube",

            // Selección de personaje / Guardado
            select_slot: "Seleccionar Partida",
            new_character: "Nuevo Héroe",
            slot_level: "Nivel {lvl}",
            slot_highest: "Récord",
            slot_kills: "Bajas",
            slot_gold: "Oro",
            delete_slot_title: "⚠️ Eliminar Partida",
            delete_slot_prompt: "¿Seguro que deseas eliminar la partida {num}? ¡Esta acción es irreversible!",
            delete_slot_confirm_label: "Escribe \"eliminar\" para confirmar:",
            delete_slot_keyword: "eliminar",
            delete_slot_btn: "Eliminar",
            just_now: "Hace un momento",
            mins_ago: "hace {m} min",
            hours_ago: "hace {h} horas",
            days_ago: "hace {d} días",

            // Menús y navegación
            menu_stats: "Personaje",
            menu_inventory: "Objetos",
            menu_skills: "Habilidades",
            menu_quest: "Misiones",
            menu_achievements: "Logros",
            achievement_unlocked: "¡Logro Desbloqueado!",
            achievement_points: "Puntos",
            menu_waypoints: "Teletransporte",
            waypoint_title: "Puntos de Ruta (Teletransporte)",
            waypoint_subtitle: "Viaja rápidamente entre ubicaciones descubiertas",
            waypoint_interact_activate: "Activar Punto de Ruta",
            waypoint_interact_use: "Usar Punto de Ruta",
            waypoint_activated: "¡Punto de Ruta activado: {name}!",
            waypoint_already_here: "Ya estás en este lugar",
            waypoint_travel_to: "Viajar",
            waypoint_locked: "No Descubierto",
            waypoint_current: "Ubicación Actual",
            waypoint_safe_zone: "Zona Segura",
            waypoint_teleporting: "Teletransportando...",
            menu_codex: "Códice",
            menu_blessing: "🌟 Bendición",

            // HUD
            town_name: "Campamento de las Arpías",
            hell_mode: "Infierno",
            floor_display_town: "Campamento de las Arpías (Pueblo)",
            floor_display_floor: "Piso {floor} {name}",
            auto_battle_btn: "Batalla Auto(F)",
            auto_battle_tip: "Activar/Desactivar batalla automática",
            auto_battle_settings: "Ajustes de combate automático",
            auto_battle_earned: "Ganado:",
            auto_battle_fee: "Comisión:",

            // Chat
            world_chat: "💬 Canal Mundial",
            chat_placeholder: "Escribe un mensaje...",
            chat_send: "Enviar",
            chat_quick_666: "¡Genial!",
            chat_quick_carry: "¡Ayuda con jefe!",
            chat_quick_nice: "¡Bien hecho!",
            chat_quick_party: "¿Grupo?",
            chat_quick_thanks: "¡Gracias!",

            // Atributos & Estadísticas
            stats_title: "Atributos del Héroe",
            stat_level: "Nivel",
            stat_xp: "Experiencia",
            stat_points: "Puntos Disponibles",
            stat_str: "Fuerza",
            stat_dex: "Destreza",
            stat_vit: "Vitalidad",
            stat_ene: "Energía",
            stat_hp: "Vida (HP)",
            stat_mp: "Maná (MP)",
            stat_damage: "Daño",
            stat_defense: "Defensa",
            stat_crit: "Golpe Crítico",
            stat_ias: "Velocidad de Ataque",
            stat_ll: "Robo de Vida",
            stat_res_fire: "🔥 Resistencia al Fuego",
            stat_res_cold: "❄️ Resistencia al Frío",
            stat_res_lightning: "⚡ Resistencia al Rayo",
            stat_res_poison: "☠️ Resistencia al Veneno",

            // Inventario & Alijo
            inv_title: "Inventario",
            inv_gold: "Oro:",
            inv_sellable: "(Vendible en tienda)",
            inv_sort: "📦 Ordenar",
            inv_tips_click: "💡 Clic izq.: Usar o equipar (en cofre = depositar) Clic der.: Tirar (solo en mazmorra)",
            inv_tips_town: "💰 Habla con Gheed para comerciar y con Warriv para usar el alijo",
            stash_title: "Alijo Personal",
            stash_subtitle: "Vinculado al inventario, transfiere libremente",
            stash_expand: "Ampliar Alijo",
            bag_title: "📦 Mochila",
            bag_click_sell: "(Clic para vender)",
            bag_click_deposit: "(Clic para depositar)",
            bag_click_add: "(Clic para añadir)",

            // Habilidades
            skills_title: "Árbol de Habilidades",
            skills_points: "Puntos de Habilidad:",
            tab_fire: "🔥 Fuego",
            tab_thunder: "⚡ Rayo",
            tab_multishot: "🏹 Disparo",
            tab_holy_shield: "🛡️ Escudo",

            // Misiones
            quest_title: "Registro de Misiones",
            quest_completed_count: "Misiones completadas: {count}",
            quest_status_new: "Nueva Misión",
            quest_status_in_progress: "En progreso",
            quest_status_turn_in: "Lista para entregar (Habla con Akara)",
            quest_reward: "🎁 Recompensa:",
            quest_progress: "Progreso",
            quest_target: "Objetivo",
            quest_ready_turn_in: "¡Misión completada! Vuelve con Akara",
            quest_location: "En Piso {floor}: {name}",
            stat_floor: "Piso",
            delete_prompt: 'Escribe "{kw}" para confirmar:',

            // Tienda de Gheed
            shop_title: "Tienda de Gheed",
            shop_supplies: "Suministros (Mantén presionado para compra rápida)",
            shop_gamble: "Objetos no identificados (Apuesta)",
            item_health_pot: "Poción de Vida",
            item_mana_pot: "Poción de Maná",
            item_tp_scroll: "Pergamino Portal",
            item_xp_scroll: "Doble EXP",
            item_weapon: "Arma",
            item_armor: "Armadura",
            item_helm: "Casco",
            item_gloves: "Guantes",
            item_boots: "Botas",
            item_belt: "Cinturón",
            item_ring: "Anillo",
            item_amulet: "Amuleto",

            // Forja de Charsi
            forge_title: "⚒️ Herrería de Charsi",
            forge_target_slot: "Equipo Objetivo",
            forge_target_placeholder: "Equipo",
            forge_sacrifice_slot: "Ofrenda",
            forge_autofill: "⚡ Auto-llenar",
            forge_preview_tip: "Coloca el equipo a mejorar (Hasta +9)",
            forge_preview_subtip: "Misma ranura y rareza · Mejora atributos · Riesgo de fallo sobre +6",
            forge_cost: "Coste:",
            forge_btn: "Comenzar Mejora",

            // Ajustes
            settings_title: "Ajustes del Sistema",
            settings_tab_combat: "Estrategia",
            settings_tab_general: "General",
            settings_combat_heading: "Tácticas de Batalla",
            settings_use_skills: "Priorizar habilidades",
            settings_keep_distance: "Mantener distancia (A distancia)",
            settings_survival_heading: "Supervivencia",
            settings_hp_potion_at: "Beber poción de vida al",
            settings_mp_potion_at: "Beber poción de maná al",
            settings_tp_at: "Portal de emergencia al",
            settings_pickup_adv: "Recogida Avanzada",
            settings_pickup_unique: "Recoger objetos Únicos",
            settings_pickup_set: "Recoger objetos de Conjunto",
            settings_graphics_heading: "Gráficos y Rendimiento",
            settings_vfx_quality: "Calidad de efectos",
            settings_vfx_high: "Efectos Altos",
            settings_vfx_low: "Rendimiento Óptimo",
            settings_juice: "Impacto visceral (Pausa de golpe / escalado)",
            settings_sound_heading: "Sonido y Música",
            settings_bgm: "Música de fondo (BGM)",
            settings_sfx: "Efectos de sonido (SFX)",
            settings_pickup_basic: "Recogida Básica",
            settings_pickup_gold: "Recoger Oro",
            settings_pickup_potion: "Recoger Pociones",
            settings_pickup_scroll: "Recoger Pergaminos",
            settings_language: "Idioma / Language",

            // Muerte
            death_title: "Has Caído en Batalla",
            death_floor: "Piso alcanzado",
            death_kills: "Monstruos abatidos",
            death_level: "Nivel alcanzado",
            death_unknown_cause: "Causa desconocida",
            death_killed_by: "Derrotado por {source}",
            death_revive_here: "Resucitar Aquí",
            death_return_town: "Volver al Pueblo",
            death_free: "(Gratis)",
            death_current_gold: "Oro disponible:",

            // Tienda de Títulos
            title_shop_name: "Tienda de Títulos",
            title_current: "Título actual:",
            title_none: "Ninguno",

            // Bendición divina
            divine_title: "🌟 Bendición Celestial",
            divine_subtitle: "Elige una mejora permanente para esta incursión",

            // Recompensa diaria
            daily_title: "📅 Recompensa Diaria",
            daily_claim: "Reclamar Recompensa",

            // Recompensas sin conexión
            offline_title: "Recompensa Fuera de Línea",
            offline_duration: "Tiempo transcurrido",
            offline_floor: "Nivel de farmeo",
            offline_items: "Objetos obtenidos",
            offline_claim: "Reclamar Botín",
            offline_hint: "Máximo 8 horas de recompensa según tu piso más alto alcanzado.",

            // Tooltips y Objetos
            tt_equipped: "Equipado Actualmente",
            tt_damage: "Daño:",
            tt_defense: "Defensa:",
            tt_restore: "Restaura:",
            tt_quantity: "Cantidad:",
            tt_set: "Conjunto",
            tt_req_level: "Nivel {lvl}",
            tt_req_str: "Fuerza {str}",
            tt_req_dex: "Destreza {dex}",
            tt_share: "📢 Compartir en el chat",
            tt_sockets: "Huecos",
            tt_empty_socket: "⚪ Hueco Vacío",
            tt_runeword: "★ PALABRA RÚNICA ★",
            tt_socket_prompt: "💡 Toca esta runa y selecciona un equipo con huecos para engarzar",
            tt_weapon_effect: "En Armas:",
            tt_armor_effect: "En Armaduras/Cascos:",
            socket_success: "¡Runa engarzada con éxito!",
            socket_invalid: "¡Este equipo no tiene huecos libres!",

            // Tipos de rareza
            rarity_common: "Común",
            rarity_magic: "Mágico",
            rarity_rare: "Raro",
            rarity_unique: "Único",
            rarity_set: "Conjunto",

            // Títulos y Tienda
            title_equipped: "Equipado",
            title_equip: "Equipar",
            title_buy: "Comprar",
            title_free: "Gratis",

            // Bendición Divina
            divine_acquired_title: "🌟 Bendiciones Obtenidas",
            divine_no_blessings: "Sin bendiciones aún",
            divine_every_5_lvls: "Obtén una bendición cada 5 niveles",
            divine_total_bonus: "Bonificación Total",

            // Recompensa Diaria
            daily_already_claimed: "Reclamado Hoy",
            daily_consecutive_days: "Días consecutivos: <span style=\"font-size:20px;\">{days}</span>",

            // Recompensas Sin Conexión
            offline_mins: "{m} minutos",
            offline_hour: "{h} hora",
            offline_hours_mins: "{h} horas {m} minutos",
            offline_hours: "{h} horas",
            offline_max_hours: "(Máximo calculado: {h} horas)",
            offline_no_drops: "Sin equipo caído",
            offline_claimed: "¡Recompensas fuera de línea reclamadas!",
            offline_converted: "{count} objetos convertidos en {gold} de oro por falta de espacio",
            offline_levelup: "¡Felicidades! Subiste al Lv.{level}",
            floor_number: "Piso {floor}",
            hell_floor_number: "Infierno {floor}",
            death_kills_value: "{count} monstruos",
            death_kills_one: "{count} monstruo",
            tutorial_town_inventory: "Abre Objetos y equipa un arma",
            tutorial_town_merchant: "Compra y vende equipo y pociones aquí",
            tutorial_town_healer: "Habla con ella para aceptar misiones",
            tutorial_town_stash: "Guarda aquí tu equipo",
            tutorial_town_exit: "Esta es la entrada a la mazmorra",
            tutorial_battle_mobile_attack: "Toca un monstruo para atacar",
            tutorial_battle_mobile_cast: "Mantén pulsada la pantalla para usar una habilidad",
            tutorial_battle_mobile_auto: "Toca ⚔️ para activar el combate automático",
            tutorial_battle_desktop_attack: "Haz clic en un monstruo para atacar",
            tutorial_battle_desktop_cast: "Haz clic derecho en un enemigo para lanzar Bola de Fuego",
            tutorial_battle_desktop_auto: "Pulsa F para activar el combate automático",
            tutorial_dismiss: "Entendido",
            tooltip_skill_learn: "Aprende esta habilidad en el menú Habilidades",
            skill_node_select: "Seleccionar",

            // Muerte y Resurrección
            revive_no_gold: "¡Oro insuficiente para revivir!",
            revive_success: "¡Resurrección exitosa! Gastaste {cost} de oro",
            return_camp_from_hell: "Has regresado del Infierno al Campamento",
            return_camp: "Has regresado al Campamento",

            // Comisión de Batalla Auto
            ab_fee_title: "Servicio de Batalla Automática",
            ab_fee_p1: "Al activar la batalla automática, el sistema cobrará",
            ab_fee_p2: "el <span class=\"fee-highlight\">15%</span> de tus ganancias de oro como tarifa de mercenario",
            ab_fee_p3: "（Por cada 100 de oro, se cobran 15 de oro）",
            ab_fee_btn: "Entendido",

            // Tienda de Talentos
            talent_shop_title: "⚔️ Tienda de Talentos",
            talent_refresh: "🔄 Cambiar",
            talent_refresh_btn: "Actualizar",
            talent_skip: "Pasar",
            talent_bought: "¡Obtuviste el talento: {name}!",
            talent_already_owned: "¡Ya posees este talento!",
            talent_entering_floor: "A punto de entrar al Piso {floor}",
            talent_entering_abyss: "A punto de entrar al Abismo Piso {floor}",
            talent_free_pick: "(Selección gratuita)",
            talent_free: "Gratis",
            talent_price_gold: "{price} Oro",
            talent_refresh_cost: "{cost} Oro",
            talent_cost_short: "{cost} Oro",

            // Herrería
            forge_slots_full: "Las ranuras están llenas",
            forge_no_main: "Coloca primero el equipo principal",
            forge_no_matches: "No se encontraron ofrendas compatibles",
            forge_only_equipment: "Solo se puede mejorar equipamiento",
            forge_same_slot: "La ofrenda debe ser de la misma ranura ({type})",
            forge_same_rarity: "La ofrenda debe tener la misma rareza",
            forge_autofill_done: "Se autorrellenaron {count} ofrendas",
            forge_level_down: " ¡Nivel reducido!",
            forge_item_kept: " Objeto preservado",
            forge_max_level: "Nivel máximo de mejora alcanzado (+9)",
            forge_max_level_btn: "Nivel Máx.",
            forge_missing_mats: "Faltan Ofrendas",
            forge_not_enough_gold: "Oro Insuficiente",
            forge_preview_upgrade: 'Mejorar a <span style="color:#00ff00">+{nextLvl}</span> · Éxito <span style="color:{rateColor}">{successRate}%</span><br>Mejora de atributos +{statIncrease}%',
            forge_fail_warning: ' · <span style="color:#ff4444;">⚠Fallo puede degradar</span>',
            forge_success_float: "¡Mejora Exitosa!",
            forge_fail_float: "Mejora Fallida",

            // Diálogos de NPCs & Misiones
            npc_akara_all_done: "Has completado todas las misiones. ¡Eres un verdadero héroe!",
            npc_akara_need_help: "Guerrero, necesitamos tu ayuda.",
            npc_akara_in_progress: "La misión aún no se ha completado. ¡Date prisa!",
            npc_akara_reward_ready: "¡Buen trabajo! Esta es tu recompensa.",
            npc_akara_healed: "Akara ha curado tus heridas y restaurado tu maná",
            npc_thanks: "Gracias",
            npc_ok: "De acuerdo",
            npc_understood: "Entendido",
            npc_great: "¡Excelente!",
            quest_accept: "Aceptar Misión",
            btn_claim: "Reclamar",

            // Sabio Místico & Reinicio
            npc_sage_name: "Sabio Místico",
            npc_sage_dialog: "Joven héroe, el camino del destino está lleno de opciones. Puedo ayudarte a reiniciar tus atributos o habilidades, o proporcionarte títulos honoríficos.\n\nOro actual: {gold}\n\nElige el servicio que necesitas:",
            respec_stats_btn: "Reiniciar Atributos ({cost} Oro)",
            respec_skills_btn: "Reiniciar Habilidades ({cost} Oro)",
            respec_no_gold_stats: "¡Oro insuficiente! Necesitas {cost} de oro para reiniciar atributos.\n\nOro actual: {gold}",
            respec_no_gold_skills: "¡Oro insuficiente! Necesitas {cost} de oro para reiniciar habilidades.\n\nOro actual: {gold}",
            respec_stats_success: "✨ ¡Puntos de atributos reiniciados! ✨\n\nFuerza, Destreza, Vitalidad y Energía han vuelto a su estado inicial.\nTodos tus puntos han sido devueltos.\n\nCoste: {cost} Oro\nOro restante: {gold}",
            respec_skills_success: "✨ ¡Puntos de habilidad reiniciados! ✨\n\nTodas tus habilidades han sido reiniciadas (Bola de Fuego nivel 1).\nTodos tus puntos de habilidad han sido devueltos.\n\nCoste: {cost} Oro\nOro restante: {gold}",

            // Portal & Pisos
            portal_name: "Portal Teletransportador",
            portal_select_floor: "Selecciona el piso de destino:",
            portal_last_floor: "Piso {floor} {name} (Último)",
            portal_max_floor: "Piso {floor} {name} (Récord)",
            portal_floor_option: "Piso {floor} {name}",

            // Abismo
            npc_abyss_guard: "Guardián del Abismo",
            abyss_in_floor: "Actualmente en el Abismo Piso {floor}.",
            btn_return_camp: "Volver al Campamento",
            btn_continue_explore: "Continuar Explorando",
            abyss_need_kill_boss: "Debes derrotar al Jefe del Piso 10 ({name}) para desbloquear el Abismo.",

            // Misiones Diarias
            dq_title: "Misiones Diarias",
            dq_reset_in: "Reinicio en {time}",
            dq_locked: "🔒 Se desbloquea al completar la anterior",
            dq_kill: "Elimina {target} monstruos",
            dq_gold: "Recoge {target} de oro",
            dq_item: "Recoge {target} piezas de equipo",
            dq_potion: "Usa {target} pociones",
            dq_elite: "Elimina {target} monstruos de élite",
            dq_boss: "Elimina {target} jefes",
            dq_floor: "Supera {target} pisos",

            // Notificaciones
            notif_welcome_town: "Bienvenido de vuelta al Campamento de las Arpías",
            notif_inv_full: "¡Tu inventario está lleno!",
            notif_no_gold: "Oro insuficiente",
            notif_no_mana: "Maná insuficiente",
            notif_game_saved: "Partida guardada",
            notif_upgraded: "¡Mejora con éxito!",
            notif_failed: "La mejora ha fallado",

            // Lote 3: Compartir Tarjeta, Temporada y Regalo de Retorno
            share_card_title: "Tarjeta de Hazañas & Build de Héroe",
            share_copy_text: "Copiar Resumen",
            share_download_img: "Descargar Imagen",
            share_copy_img: "Copiar Imagen",
            btn_share_hero: "📢 Compartir Hazaña",
            season_btn: "🏆 Temporada S1",
            season_points: "Puntos de Temporada",
            season_milestones_title: "🏆 Objetivos de Temporada",
            return_banner_title: "Regreso a Santuario · El Renacer de la Leyenda",
            return_banner_sub: "¡Santuario te necesita! Hemos preparado estos pertrechos de guerra para tu regreso:",
            return_reward_exp: "30 Minutos de Doble Experiencia",
            return_reward_exp_desc: "Obtén +100% de EXP adicional en todas tus batallas.",
            return_reward_gold_desc: "Oro de intendencia para mejorar y forjar equipo.",
            return_reward_chest: "Cofre de Equipamiento Selecto",
            return_reward_chest_desc: "Contiene garantizada una pieza Rara o Única.",
            return_reward_sp: "1 Punto de Habilidad Extra",
            return_reward_sp_desc: "Desbloquea o potencia tácticas de combate.",
            return_claim_btn: "⚔️ Reclamar Pertrechos y Marchar ⚔️"
        },

        en: {
            // General & Brand
            game_title: "Brawlore",
            game_sub: "BRAWLORE",
            enter_sanctuary: "Enter Sanctuary",
            loading: "Loading...",
            loading_zone: "Loading zone assets...",
            welcome_back: "Welcome back, {name}",
            changelog_btn: "Patch Notes",
            changelog_title: "📜 Update Notes",
            confirm: "Confirm",
            cancel: "Cancel",
            close: "Close",
            leave: "Leave",
            btn_claim_reward: "Claim Reward",
            menu_title_shop: "Title Shop",
            quest_tracker_title: "Progress",
            npc_akara: "Akara",
            npc_gheed: "Gheed (Merchant)",
            npc_warriv: "Warriv (Stash)",
            npc_charsi: "Charsi (Blacksmith)",
            tt_viewing: "Viewing",
            settings_graphics: "Graphics Settings",
            stat_gold: "Gold",
            btn_close: "Close",
            save_status_found: "Found {count} save file(s)",
            save_status_empty: "No saved games found",
            cloud_sync: "Cloud Sync",

            // Slot selection
            select_slot: "Select Character",
            new_character: "New Hero",
            slot_level: "Lv.{lvl}",
            slot_highest: "Best",
            slot_kills: "Kills",
            slot_gold: "Gold",
            delete_slot_title: "⚠️ Delete Character",
            delete_slot_prompt: "Are you sure you want to delete slot {num}? This CANNOT be undone!",
            delete_slot_confirm_label: "Type \"delete\" to confirm:",
            delete_slot_keyword: "delete",
            delete_slot_btn: "Delete",
            just_now: "Just now",
            mins_ago: "{m}m ago",
            hours_ago: "{h}h ago",
            days_ago: "{d}d ago",

            // Navigation
            menu_stats: "Character",
            menu_inventory: "Items",
            menu_skills: "Skills",
            menu_quest: "Quests",
            menu_achievements: "Trophies",
            achievement_unlocked: "Achievement Unlocked!",
            achievement_points: "Points",
            menu_waypoints: "Waypoints",
            waypoint_title: "Waypoint Network",
            waypoint_subtitle: "Fast travel between discovered locations",
            waypoint_interact_activate: "Activate Waypoint",
            waypoint_interact_use: "Use Waypoint",
            waypoint_activated: "Waypoint activated: {name}!",
            waypoint_already_here: "You are already here",
            waypoint_travel_to: "Travel",
            waypoint_locked: "Undiscovered",
            waypoint_current: "Current Location",
            waypoint_safe_zone: "Safe Zone",
            waypoint_teleporting: "Teleporting...",
            menu_codex: "Codex",
            menu_blessing: "🌟 Blessing",

            // HUD
            town_name: "Rogue Encampment",
            hell_mode: "Hell",
            floor_display_town: "Rogue Encampment (Town)",
            floor_display_floor: "Floor {floor} {name}",
            auto_battle_btn: "Auto Battle(F)",
            auto_battle_tip: "Toggle auto combat",
            auto_battle_settings: "Auto battle settings",
            auto_battle_earned: "Earned:",
            auto_battle_fee: "Fee:",

            // Chat
            world_chat: "💬 World Channel",
            chat_placeholder: "Type a message...",
            chat_send: "Send",
            chat_quick_666: "Awesome!",
            chat_quick_carry: "Need boss help!",
            chat_quick_nice: "Well played!",
            chat_quick_party: "Party up?",
            chat_quick_thanks: "Thanks!",

            // Attributes
            stats_title: "Character Stats",
            stat_level: "Level",
            stat_xp: "Experience",
            stat_points: "Stat Points",
            stat_str: "Strength",
            stat_dex: "Dexterity",
            stat_vit: "Vitality",
            stat_ene: "Energy",
            stat_hp: "Health (HP)",
            stat_mp: "Mana (MP)",
            stat_damage: "Damage",
            stat_defense: "Defense",
            stat_crit: "Critical Rate",
            stat_ias: "Attack Speed",
            stat_ll: "Life Leech",
            stat_res_fire: "🔥 Fire Resistance",
            stat_res_cold: "❄️ Cold Resistance",
            stat_res_lightning: "⚡ Lightning Res.",
            stat_res_poison: "☠️ Poison Res.",

            // Inventory & Stash
            inv_title: "Inventory",
            inv_gold: "Gold:",
            inv_sellable: "(Can sell in shop)",
            inv_sort: "📦 Sort",
            inv_tips_click: "💡 Left click: Use or equip (in stash = store) Right click: Drop (dungeon only)",
            inv_tips_town: "💰 Visit Gheed to trade, visit Warriv to access personal stash",
            stash_title: "Private Stash",
            stash_subtitle: "Linked with bag, freely transfer items",
            stash_expand: "Expand Stash",
            bag_title: "📦 Backpack",
            bag_click_sell: "(Click to sell)",
            bag_click_deposit: "(Click to store)",
            bag_click_add: "(Click to add)",

            // Skills
            skills_title: "Skill Tree",
            skills_points: "Skill Points:",
            tab_fire: "🔥 Fire",
            tab_thunder: "⚡ Lightning",
            tab_multishot: "🏹 Archery",
            tab_holy_shield: "🛡️ Shield",

            // Quests
            quest_title: "Quest Log",
            quest_completed_count: "Completed quests: {count}",
            quest_status_new: "New Quest",
            quest_status_in_progress: "In Progress",
            quest_status_turn_in: "Ready to turn in (Find Akara)",
            quest_reward: "🎁 Reward:",
            quest_progress: "Progress",
            quest_target: "Target",
            quest_ready_turn_in: "Quest Complete! Return to Akara",
            quest_location: "At Floor {floor}: {name}",
            stat_floor: "Floor",
            delete_prompt: 'Type "{kw}" to confirm:',

            // Shop
            shop_title: "Gheed's Shop",
            shop_supplies: "Supplies (Long press for fast buy)",
            shop_gamble: "Unidentified Items (Gamble)",
            item_health_pot: "Health Potion",
            item_mana_pot: "Mana Potion",
            item_tp_scroll: "Portal Scroll",
            item_xp_scroll: "Double XP",
            item_weapon: "Weapon",
            item_armor: "Armor",
            item_helm: "Helm",
            item_gloves: "Gloves",
            item_boots: "Boots",
            item_belt: "Belt",
            item_ring: "Ring",
            item_amulet: "Amulet",

            // Forge
            forge_title: "⚒️ Charsi's Blacksmith",
            forge_target_slot: "Target Item",
            forge_target_placeholder: "Equipment",
            forge_sacrifice_slot: "Sacrifice",
            forge_autofill: "⚡ Auto-fill",
            forge_preview_tip: "Insert equipment to enhance (Up to +9)",
            forge_preview_subtip: "Same slot and rarity · Boosts stats · Failure risk above +6",
            forge_cost: "Cost:",
            forge_btn: "Start Upgrade",

            // Settings
            settings_title: "System Settings",
            settings_tab_combat: "Strategy",
            settings_tab_general: "General",
            settings_combat_heading: "Combat Tactics",
            settings_use_skills: "Prioritize skills",
            settings_keep_distance: "Keep distance (Ranged)",
            settings_survival_heading: "Survival Tactics",
            settings_hp_potion_at: "Drink Health Potion at",
            settings_mp_potion_at: "Drink Mana Potion at",
            settings_tp_at: "Emergency town portal at",
            settings_pickup_adv: "Advanced Looting",
            settings_pickup_unique: "Auto-loot Unique items",
            settings_pickup_set: "Auto-loot Set items",
            settings_graphics_heading: "Graphics & Visuals",
            settings_vfx_quality: "Visual Quality",
            settings_vfx_high: "High FX",
            settings_vfx_low: "Performance",
            settings_juice: "Combat Hit Impact (Frame pause/scaling)",
            settings_sound_heading: "Audio Settings",
            settings_bgm: "Background Music",
            settings_sfx: "Sound Effects",
            settings_pickup_basic: "Basic Looting",
            settings_pickup_gold: "Auto-loot Gold",
            settings_pickup_potion: "Auto-loot Potions",
            settings_pickup_scroll: "Auto-loot Scrolls",
            settings_language: "Language",

            // Death
            death_title: "You Have Died",
            death_floor: "Floor Reached",
            death_kills: "Enemies Slain",
            death_level: "Current Level",
            death_unknown_cause: "Cause of death unknown",
            death_killed_by: "Slain by {source}",
            death_revive_here: "Revive Here",
            death_return_town: "Return to Town",
            death_free: "(Free)",
            death_current_gold: "Current Gold:",

            // Title Shop
            title_shop_name: "Title Shop",
            title_current: "Current Title:",
            title_none: "None",

            // Divine Blessing
            divine_title: "🌟 Divine Blessing",
            divine_subtitle: "Choose one permanent enhancement for this run",

            // Daily Login
            daily_title: "📅 Daily Login Reward",
            daily_claim: "Claim Reward",

            // Offline
            offline_title: "Offline Rewards",
            offline_duration: "Offline Time",
            offline_floor: "Grind Floor",
            offline_items: "Equipment Drops",
            offline_claim: "Claim Rewards",
            offline_hint: "Up to 8 hours of rewards calculated based on highest floor cleared.",

            // Tooltips
            tt_equipped: "Currently Equipped",
            tt_damage: "Damage:",
            tt_defense: "Defense:",
            tt_restore: "Restores:",
            tt_quantity: "Qty:",
            tt_set: "Set",
            tt_req_level: "Lv.{lvl}",
            tt_req_str: "Str {str}",
            tt_req_dex: "Dex {dex}",
            tt_share: "📢 Share to World Chat",
            tt_sockets: "Sockets",
            tt_empty_socket: "⚪ Empty Socket",
            tt_runeword: "★ RUNEWORD ★",
            tt_socket_prompt: "💡 Click this rune and select socketed equipment to insert",
            tt_weapon_effect: "In Weapons:",
            tt_armor_effect: "In Armor/Helms:",
            socket_success: "Rune socketed successfully!",
            socket_invalid: "This equipment has no empty sockets!",

            // Rarity
            rarity_common: "Common",
            rarity_magic: "Magic",
            rarity_rare: "Rare",
            rarity_unique: "Unique",
            rarity_set: "Set",

            // Titles & Title Shop
            title_equipped: "Equipped",
            title_equip: "Equip",
            title_buy: "Buy",
            title_free: "Free",

            // Divine Blessing
            divine_acquired_title: "🌟 Acquired Blessings",
            divine_no_blessings: "No blessings yet",
            divine_every_5_lvls: "Gain a blessing every 5 levels",
            divine_total_bonus: "Total Bonuses",

            // Daily Login
            daily_already_claimed: "Claimed Today",
            daily_consecutive_days: "Consecutive Days: <span style=\"font-size:20px;\">{days}</span>",

            // Offline Rewards
            offline_mins: "{m} minutes",
            offline_hour: "{h} hour",
            offline_hours_mins: "{h} hours {m} minutes",
            offline_hours: "{h} hours",
            offline_max_hours: "(Max {h} hours calculated)",
            offline_no_drops: "No equipment dropped",
            offline_claimed: "Offline rewards claimed!",
            offline_converted: "{count} items converted to {gold} gold due to full bag",
            offline_levelup: "Congratulations! Reached Lv.{level}!",
            floor_number: "Floor {floor}",
            hell_floor_number: "Hell {floor}",
            death_kills_value: "{count} enemies",
            death_kills_one: "{count} enemy",
            tutorial_town_inventory: "Open Items and equip a weapon",
            tutorial_town_merchant: "Buy and sell gear and potions here",
            tutorial_town_healer: "Talk to her to accept quests",
            tutorial_town_stash: "Store your gear here",
            tutorial_town_exit: "This is the dungeon entrance",
            tutorial_battle_mobile_attack: "Tap a monster to attack",
            tutorial_battle_mobile_cast: "Press and hold the screen to use a skill",
            tutorial_battle_mobile_auto: "Tap ⚔️ to turn on auto battle",
            tutorial_battle_desktop_attack: "Click a monster to attack",
            tutorial_battle_desktop_cast: "Right-click an enemy to cast Fireball",
            tutorial_battle_desktop_auto: "Press F to turn on auto battle",
            tutorial_dismiss: "Got it",
            tooltip_skill_learn: "Learn this skill in the Skills menu",
            skill_node_select: "Select",

            // Death & Revive
            revive_no_gold: "Not enough gold to revive!",
            revive_success: "Revived successfully! Spent {cost} gold",
            return_camp_from_hell: "Returned from Hell to Camp",
            return_camp: "Returned to Camp",

            // Auto Battle Fee
            ab_fee_title: "Auto Battle Service",
            ab_fee_p1: "When auto battle is enabled, the system collects",
            ab_fee_p2: "a <span class=\"fee-highlight\">15%</span> mercenary fee on gold earned",
            ab_fee_p3: "(15 gold fee per 100 gold earned)",
            ab_fee_btn: "Understood",

            // Talent Shop
            talent_shop_title: "⚔️ Talent Shop",
            talent_refresh: "🔄 Refresh",
            talent_refresh_btn: "Refresh",
            talent_skip: "Skip",
            talent_bought: "Acquired talent: {name}!",
            talent_already_owned: "You already have this talent!",
            talent_entering_floor: "Entering Floor {floor}",
            talent_entering_abyss: "Entering Abyss Floor {floor}",
            talent_free_pick: "(Free Pick)",
            talent_free: "Free",
            talent_price_gold: "{price} Gold",
            talent_refresh_cost: "{cost} Gold",
            talent_cost_short: "{cost} Gold",

            // Blacksmith / Forge
            forge_slots_full: "Slots are full",
            forge_no_main: "Place target equipment first",
            forge_no_matches: "No matching sacrifice items found",
            forge_only_equipment: "Can only enhance equipment",
            forge_same_slot: "Sacrifice must be same slot item ({type})",
            forge_same_rarity: "Sacrifice must have the same rarity",
            forge_autofill_done: "Auto-filled {count} sacrifice item(s)",
            forge_level_down: " Level decreased!",
            forge_item_kept: " Item preserved",
            forge_max_level: "Reached maximum enhance level (+9)",
            forge_max_level_btn: "Max Level",
            forge_missing_mats: "Missing Sacrifices",
            forge_not_enough_gold: "Not Enough Gold",
            forge_preview_upgrade: 'Upgrade to <span style="color:#00ff00">+{nextLvl}</span> · Success Rate <span style="color:{rateColor}">{successRate}%</span><br>Stat Boost +{statIncrease}%',
            forge_fail_warning: ' · <span style="color:#ff4444;">⚠Failure may downgrade</span>',
            forge_success_float: "Upgrade Successful!",
            forge_fail_float: "Upgrade Failed",

            // NPC & Quests
            npc_akara_all_done: "You have completed all quests, true hero!",
            npc_akara_need_help: "Warrior, we need your assistance.",
            npc_akara_in_progress: "The quest is not yet complete. Hurry!",
            npc_akara_reward_ready: "Well done! Here is your reward.",
            npc_akara_healed: "Akara healed your wounds and restored your mana",
            npc_thanks: "Thank you",
            npc_ok: "Understood",
            npc_understood: "Understood",
            npc_great: "Great!",
            quest_accept: "Accept Quest",
            btn_claim: "Claim",

            // Mystic Sage & Respec
            npc_sage_name: "Mystic Sage",
            npc_sage_dialog: "Young hero, destiny is full of choices. I can help respec your attributes or skills, or offer honorary titles.\n\nCurrent Gold: {gold}\n\nChoose your desired service:",
            respec_stats_btn: "Reset Attributes ({cost} Gold)",
            respec_skills_btn: "Reset Skills ({cost} Gold)",
            respec_no_gold_stats: "Not enough gold! You need {cost} gold to reset attributes.\n\nCurrent gold: {gold}",
            respec_no_gold_skills: "Not enough gold! You need {cost} gold to reset skills.\n\nCurrent gold: {gold}",
            respec_stats_success: "✨ Attribute points reset! ✨\n\nStrength, Dexterity, Vitality and Energy restored to initial values.\nAll points returned.\n\nCost: {cost} Gold\nRemaining Gold: {gold}",
            respec_skills_success: "✨ Skill points reset! ✨\n\nAll skills reset (Fireball remains Lv.1).\nAll skill points refunded.\n\nCost: {cost} Gold\nRemaining Gold: {gold}",

            // Portal & Floors
            portal_name: "Town Portal",
            portal_select_floor: "Select destination floor:",
            portal_last_floor: "Floor {floor} {name} (Last)",
            portal_max_floor: "Floor {floor} {name} (Highest)",
            portal_floor_option: "Floor {floor} {name}",

            // Abyss
            npc_abyss_guard: "Abyss Guard",
            abyss_in_floor: "Currently at Abyss Floor {floor}.",
            btn_return_camp: "Return to Camp",
            btn_continue_explore: "Continue Exploring",
            abyss_need_kill_boss: "You must defeat the Floor 10 Boss ({name}) to unlock the Abyss.",

            // Daily Quests
            dq_title: "Daily Quests",
            dq_reset_in: "Reset in {time}",
            dq_locked: "🔒 Unlocks after completing previous",
            dq_kill: "Defeat {target} monsters",
            dq_gold: "Collect {target} gold",
            dq_item: "Pick up {target} equipment",
            dq_potion: "Use {target} potions",
            dq_elite: "Defeat {target} elite monsters",
            dq_boss: "Defeat {target} bosses",
            dq_floor: "Clear {target} dungeon floors",

            // Notifications
            notif_welcome_town: "Welcome back to Rogue Encampment",
            notif_inv_full: "Your inventory is full!",
            notif_no_gold: "Not enough gold",
            notif_no_mana: "Not enough mana",
            notif_game_saved: "Game saved",
            notif_upgraded: "Enhancement succeeded!",
            notif_failed: "Enhancement failed",

            // Batch 3: Share Card, Season, and Return Bonus
            share_card_title: "Hero Chronicle & Build Card",
            share_copy_text: "Copy Summary",
            share_download_img: "Save Card Image",
            share_copy_img: "Copy Image",
            btn_share_hero: "📢 Share Build",
            season_btn: "🏆 Season S1",
            season_points: "Season Points",
            season_milestones_title: "🏆 Season Journey Objectives",
            return_banner_title: "Return to Sanctuary · Legend Reborn",
            return_banner_sub: "Sanctuary has awaited your return! Here are your triumph war gifts:",
            return_reward_exp: "30-Min Double EXP Blessing",
            return_reward_exp_desc: "Gain +100% bonus EXP from all monster defeats.",
            return_reward_gold_desc: "Campaign gold to forge relics and learn skills.",
            return_reward_chest: "Rare Mystical Gear Chest",
            return_reward_chest_desc: "Guaranteed 1 Rare or Unique piece of equipment.",
            return_reward_sp: "1 Bonus Skill Point",
            return_reward_sp_desc: "Unlock and enhance high-tier combat masteries.",
            return_claim_btn: "⚔️ Claim Gifts & Embark ⚔️"
        },

        zh: {
            // 基础 & 品牌
            game_title: "菠萝战纪",
            game_sub: "BRAWLORE",
            enter_sanctuary: "踏入庇护所",
            loading: "正在加载...",
            loading_zone: "正在加载区域资源…",
            welcome_back: "欢迎回来，{name}",
            changelog_btn: "更新公告",
            changelog_title: "📜 更新公告",
            confirm: "确定",
            cancel: "取消",
            close: "关闭",
            leave: "离开",
            btn_claim_reward: "领取奖励",
            menu_title_shop: "称号商店",
            quest_tracker_title: "进度",
            npc_akara: "阿卡拉",
            npc_gheed: "基格商人",
            npc_warriv: "瓦瑞夫（仓库）",
            npc_charsi: "恰西铁匠",
            tt_viewing: "查看中",
            settings_graphics: "画质设置",
            stat_gold: "金币",
            btn_close: "关闭",
            save_status_found: "发现 {count} 个存档",
            save_status_empty: "暂无存档",
            cloud_sync: "云同步",

            // 槽位选择
            select_slot: "选择存档",
            new_character: "新建角色",
            slot_level: "Lv.{lvl}",
            slot_highest: "最高",
            slot_kills: "击杀",
            slot_gold: "金币",
            delete_slot_title: "⚠️ 删除存档",
            delete_slot_prompt: "确定要删除存档 {num} 吗？此操作不可恢复！",
            delete_slot_confirm_label: "请输入\"删除\"以确认：",
            delete_slot_keyword: "删除",
            delete_slot_btn: "确认删除",
            just_now: "刚刚",
            mins_ago: "{m}分钟前",
            hours_ago: "{h}小时前",
            days_ago: "{d}天前",

            // 菜单
            menu_stats: "角色",
            menu_inventory: "物品",
            menu_skills: "技能",
            menu_quest: "任务",
            menu_achievements: "成就",
            achievement_unlocked: "成就解锁",
            achievement_points: "点数",
            menu_waypoints: "传送小站",
            waypoint_title: "传送小站网络",
            waypoint_subtitle: "在已激活的地点之间快速传送",
            waypoint_interact_activate: "激活传送小站",
            waypoint_interact_use: "使用传送小站",
            waypoint_activated: "传送小站已激活：{name}！",
            waypoint_already_here: "当前已在此位置",
            waypoint_travel_to: "传送",
            waypoint_locked: "未发现",
            waypoint_current: "当前位置",
            waypoint_safe_zone: "安全区域",
            waypoint_teleporting: "正在传送...",
            menu_codex: "图鉴",
            menu_blessing: "🌟 赐福",

            // HUD
            town_name: "罗格营地",
            hell_mode: "地狱",
            floor_display_town: "罗格营地 (Town)",
            floor_display_floor: "{floor}层 {name}",
            auto_battle_btn: "自动战斗(F)",
            auto_battle_tip: "开启/关闭自动战斗",
            auto_battle_settings: "自动战斗设置",
            auto_battle_earned: "获得:",
            auto_battle_fee: "雇佣费:",

            // 聊天
            world_chat: "💬 世界频道",
            chat_placeholder: "输入消息...",
            chat_send: "发送",
            chat_quick_666: "666",
            chat_quick_carry: "大佬带带",
            chat_quick_nice: "厉害",
            chat_quick_party: "求组队",
            chat_quick_thanks: "谢谢",

            // 角色属性
            stats_title: "角色属性",
            stat_level: "等级",
            stat_xp: "经验",
            stat_points: "属性点",
            stat_str: "力量",
            stat_dex: "敏捷",
            stat_vit: "体力",
            stat_ene: "精力",
            stat_hp: "生命值 (HP)",
            stat_mp: "法力值 (MP)",
            stat_damage: "伤害",
            stat_defense: "防御",
            stat_crit: "暴击率",
            stat_ias: "攻速加成",
            stat_ll: "生命窃取",
            stat_res_fire: "🔥 火焰抗性",
            stat_res_cold: "❄️ 冰霜抗性",
            stat_res_lightning: "⚡ 闪电抗性",
            stat_res_poison: "☠️ 毒素抗性",

            // 物品与仓库
            inv_title: "物品栏",
            inv_gold: "金币:",
            inv_sellable: "(商店可售)",
            inv_sort: "📦 整理",
            inv_tips_click: "💡 左键：使用或装备物品（打开仓库时左键=存入） 右键：丢弃物品（仅在地牢）",
            inv_tips_town: "💰 罗格营地找基格可以买卖物品，找瓦瑞夫使用仓库",
            stash_title: "私人仓库",
            stash_subtitle: "与背包互通，可自由存取物品",
            stash_expand: "扩展仓库",
            bag_title: "📦 背包",
            bag_click_sell: "(点击出售)",
            bag_click_deposit: "(点击存入)",
            bag_click_add: "(点击添加)",

            // 技能树
            skills_title: "技能树",
            skills_points: "技能点:",
            tab_fire: "🔥 火焰",
            tab_thunder: "⚡ 雷电",
            tab_multishot: "🏹 射击",
            tab_holy_shield: "🛡️ 护盾",

            // 任务
            quest_title: "任务日志",
            quest_completed_count: "已完成任务: {count}",
            quest_status_new: "新任务",
            quest_status_in_progress: "进行中",
            quest_status_turn_in: "可交付 (去找阿卡拉)",
            quest_reward: "🎁 奖励:",
            quest_progress: "进度",
            quest_target: "目标",
            quest_ready_turn_in: "任务完成！回去找阿卡拉",
            quest_location: "目标在: 第{floor}层「{name}」",
            stat_floor: "层",
            delete_prompt: '请输入"{kw}"以确认：',

            // 商店
            shop_title: "基格商店",
            shop_supplies: "物资补给（长按可以快速购买）",
            shop_gamble: "未辨识装备 (赌博)",
            item_health_pot: "治疗药剂",
            item_mana_pot: "法力药剂",
            item_tp_scroll: "回城卷轴",
            item_xp_scroll: "双倍经验",
            item_weapon: "武器",
            item_armor: "护甲",
            item_helm: "头盔",
            item_gloves: "手套",
            item_boots: "鞋子",
            item_belt: "腰带",
            item_ring: "戒指",
            item_amulet: "项链",

            // 铁匠
            forge_title: "⚒️ 恰西的铁匠铺",
            forge_target_slot: "强化目标",
            forge_target_placeholder: "装备",
            forge_sacrifice_slot: "祭品",
            forge_autofill: "⚡ 一键填充",
            forge_preview_tip: "请放入需要强化的装备 (最高 +9)",
            forge_preview_subtip: "同部位同稀有度祭品 · 成功提升属性 · +6以上有失败风险",
            forge_cost: "消耗:",
            forge_btn: "开始强化",

            // 设置
            settings_title: "系统设置",
            settings_tab_combat: "挂机策略",
            settings_tab_general: "通用设置",
            settings_combat_heading: "战斗策略",
            settings_use_skills: "优先使用技能",
            settings_keep_distance: "保持距离 (远程)",
            settings_survival_heading: "生存设置",
            settings_hp_potion_at: "喝红药阈值",
            settings_mp_potion_at: "喝蓝药阈值",
            settings_tp_at: "紧急回城阈值",
            settings_pickup_adv: "高级拾取",
            settings_pickup_unique: "自动拾取暗金",
            settings_pickup_set: "自动拾取套装",
            settings_graphics_heading: "画质设置",
            settings_vfx_quality: "特效质量",
            settings_vfx_high: "华丽特效",
            settings_vfx_low: "性能优先",
            settings_juice: "打击感增强 (顿帧/实体缩放)",
            settings_sound_heading: "音效设置",
            settings_bgm: "背景音乐",
            settings_sfx: "音效",
            settings_pickup_basic: "基础拾取",
            settings_pickup_gold: "自动拾取金币",
            settings_pickup_potion: "自动拾取药水",
            settings_pickup_scroll: "自动拾取卷轴",
            settings_language: "语言",

            // 阵亡
            death_title: "你已阵亡",
            death_floor: "到达层数",
            death_kills: "击杀怪物",
            death_level: "当前等级",
            death_unknown_cause: "死因不明",
            death_killed_by: "被 {source} 击杀",
            death_revive_here: "原地复活",
            death_return_town: "回城",
            death_free: "(免费)",
            death_current_gold: "当前金币:",

            // 称号
            title_shop_name: "称号商店",
            title_current: "当前称号：",
            title_none: "无",

            // 赐福
            divine_title: "🌟 天神赐福",
            divine_subtitle: "选择一项永久强化",

            // 每日
            daily_title: "📅 每日登录奖励",
            daily_claim: "领取奖励",

            // 离线
            offline_title: "离线收益",
            offline_duration: "离线时长",
            offline_floor: "挂机层数",
            offline_items: "装备掉落",
            offline_claim: "领取奖励",
            offline_hint: "提示：离线收益最多8小时，以最高到达层数为挂机层数",

            // Tooltips
            tt_equipped: "已装备",
            tt_damage: "伤害:",
            tt_defense: "防御:",
            tt_restore: "恢复:",
            tt_quantity: "数量:",
            tt_set: "套装",
            tt_req_level: "等级{lvl}",
            tt_req_str: "力量{str}",
            tt_req_dex: "敏捷{dex}",
            tt_share: "📢 分享到世界频道",
            tt_sockets: "孔位",
            tt_empty_socket: "⚪ 空孔位",
            tt_runeword: "★ 符文之语 ★",
            tt_socket_prompt: "💡 点击此符文，然后点击有空孔的装备进行镶嵌",
            tt_weapon_effect: "镶嵌于武器：",
            tt_armor_effect: "镶嵌于防具/头盔：",
            socket_success: "符文镶嵌成功！",
            socket_invalid: "该装备没有空孔，无法镶嵌！",

            // 稀有度
            rarity_common: "普通",
            rarity_magic: "魔法",
            rarity_rare: "稀有",
            rarity_unique: "暗金",
            rarity_set: "套装",

            // 称号与商店
            title_equipped: "已装备",
            title_equip: "装备",
            title_buy: "购买",
            title_free: "免费",

            // 天神赐福
            divine_acquired_title: "🌟 已获得赐福",
            divine_no_blessings: "暂无赐福",
            divine_every_5_lvls: "每5级获得一次赐福机会",
            divine_total_bonus: "累计加成",

            // 每日登录
            daily_already_claimed: "今日已领取",
            daily_consecutive_days: "连续登录 <span style=\"font-size:20px;\">{days}</span> 天",

            // 离线收益
            offline_mins: "{m} 分钟",
            offline_hour: "{h} 小时",
            offline_hours_mins: "{h} 小时 {m} 分钟",
            offline_hours: "{h} 小时",
            offline_max_hours: "(最多计算{h}小时)",
            offline_no_drops: "无装备掉落",
            offline_claimed: "离线收益已领取！",
            offline_converted: "{count}件装备因背包已满转化为{gold}金币",
            offline_levelup: "恭喜升级到 Lv.{level}！",
            floor_number: "第{floor}层",
            hell_floor_number: "地狱第{floor}层",
            death_kills_value: "击杀 {count} 只",
            death_kills_one: "击杀 {count} 只",
            tutorial_town_inventory: "打开物品栏并装备一把武器",
            tutorial_town_merchant: "在这里买卖装备和药水",
            tutorial_town_healer: "找她接取任务",
            tutorial_town_stash: "在这里存放装备",
            tutorial_town_exit: "这里是地牢入口",
            tutorial_battle_mobile_attack: "点击怪物进行攻击",
            tutorial_battle_mobile_cast: "长按屏幕释放技能",
            tutorial_battle_mobile_auto: "点击 ⚔️ 按钮开启自动战斗",
            tutorial_battle_desktop_attack: "点击怪物进行物理攻击",
            tutorial_battle_desktop_cast: "右键点击敌人释放火球术",
            tutorial_battle_desktop_auto: "按 F 开启自动战斗，解放双手",
            tutorial_dismiss: "知道了",
            tooltip_skill_learn: "在技能菜单中学习此技能",
            skill_node_select: "点击选择",

            // 死亡与复活
            revive_no_gold: "金币不足，无法复活！",
            revive_success: "复活成功！消耗 {cost} 金币",
            return_camp_from_hell: "已从地狱返回营地",
            return_camp: "已返回营地",

            // 自动战斗雇佣费
            ab_fee_title: "自动战斗服务",
            ab_fee_p1: "启用自动战斗后，系统将收取",
            ab_fee_p2: "金币收益的 <span class=\"fee-highlight\">15%</span> 作为雇佣费",
            ab_fee_p3: "（每满100金币收取15金币）",
            ab_fee_btn: "我知道了",

            // 天赋商店
            talent_shop_title: "⚔️ 天赋商店",
            talent_refresh: "🔄 刷新",
            talent_refresh_btn: "刷新",
            talent_skip: "不买",
            talent_bought: "获得天赋：{name}！",
            talent_already_owned: "你已经拥有这个天赋了！",
            talent_entering_floor: "即将进入 第{floor}层",
            talent_entering_abyss: "即将进入 深渊{floor}层",
            talent_free_pick: "(免费选取)",
            talent_free: "免费",
            talent_price_gold: "{price} 金",
            talent_refresh_cost: "{cost}金",
            talent_cost_short: "{cost}金",

            // 铁匠铺
            forge_slots_full: "槽位已满",
            forge_no_main: "请先放入主装备",
            forge_no_matches: "没有找到匹配的祭品",
            forge_only_equipment: "只能强化装备",
            forge_same_slot: "祭品必须是同部位装备 ({type})",
            forge_same_rarity: "祭品必须是相同稀有度",
            forge_autofill_done: "自动填充了 {count} 个祭品",
            forge_level_down: " 等级下降!",
            forge_item_kept: " 物品保留",
            forge_max_level: "已达到最高强化等级 (+9)",
            forge_max_level_btn: "已满级",
            forge_missing_mats: "缺少祭品",
            forge_not_enough_gold: "金币不足",
            forge_preview_upgrade: '强化至 <span style="color:#00ff00">+{nextLvl}</span> · 成功率 <span style="color:{rateColor}">{successRate}%</span><br>属性提升 {statIncrease}%',
            forge_fail_warning: ' · <span style="color:#ff4444;">⚠失败可能降级</span>',
            forge_success_float: "强化成功!",
            forge_fail_float: "强化失败",

            // NPC 对话与任务
            npc_akara_all_done: "你已经完成了所有任务，真正的英雄！",
            npc_akara_need_help: "勇士，我们需要你的帮助。",
            npc_akara_in_progress: "任务还没完成。快去！",
            npc_akara_reward_ready: "干得漂亮！这是给你的奖励。",
            npc_akara_healed: "阿卡拉治愈了你",
            npc_thanks: "谢谢",
            npc_ok: "好的",
            npc_understood: "知道了",
            npc_great: "太好了！",
            quest_accept: "接受任务",
            btn_claim: "领取",

            // 神秘贤者
            npc_sage_name: "神秘贤者",
            npc_sage_dialog: "年轻的英雄，命运之路充满选择。我可以帮你重塑能力分配，或为你提供彰显身份的称号。\n\n当前金币：{gold}\n\n选择你需要的服务：",
            respec_stats_btn: "仅重置属性点（{cost} 金币）",
            respec_skills_btn: "仅重置技能点（{cost} 金币）",
            respec_no_gold_stats: "金币不足！你需要 {cost} 金币才能重置属性点。\n\n当前金币：{gold}",
            respec_no_gold_skills: "金币不足！你需要 {cost} 金币才能重置技能点。\n\n当前金币：{gold}",
            respec_stats_success: "✨ 属性点已重置！✨\n\n力量、敏捷、体力、精力已恢复到初始状态。\n所有属性点已返还。\n\n消耗：{cost} 金币\n剩余金币：{gold}",
            respec_skills_success: "✨ 技能点已重置！✨\n\n所有技能已重置（火球术保持1级）。\n技能点已全部返还。\n\n消耗：{cost} 金币\n剩余金币：{gold}",

            // 传送门
            portal_name: "传送门",
            portal_select_floor: "选择要前往的层数：",
            portal_last_floor: "{floor}层 {name} (上次)",
            portal_max_floor: "{floor}层 {name} (最高)",
            portal_floor_option: "{floor}层 {name}",

            // 深渊
            npc_abyss_guard: "深渊守卫",
            abyss_in_floor: "已在深渊第{floor}层。",
            btn_return_camp: "返回营地",
            btn_continue_explore: "继续探索",
            abyss_need_kill_boss: "你需要先去击杀第10层「{name}」的Boss才能开启深渊挑战。",

            // 每日任务
            dq_title: "每日任务",
            dq_reset_in: "{time} 后重置",
            dq_locked: "🔒 完成上一个任务后解锁",
            dq_kill: "击杀{target}只怪物",
            dq_gold: "收集{target}金币",
            dq_item: "拾取{target}件装备",
            dq_potion: "使用{target}瓶药水",
            dq_elite: "击杀{target}只精英怪",
            dq_boss: "击杀{target}个BOSS",
            dq_floor: "通关{target}层地牢",

            // 提示
            notif_welcome_town: "欢迎回到罗格营地",
            notif_inv_full: "背包已满！",
            notif_no_gold: "金币不足",
            notif_no_mana: "法力不足",
            notif_game_saved: "游戏已保存",
            notif_upgraded: "强化成功！",
            notif_failed: "强化失败",

            // Lote 3: 战报分享、赛季征程与回归大礼
            share_card_title: "英雄战报 & 构筑分享",
            share_copy_text: "复制文本战报",
            share_download_img: "保存战报图片",
            share_copy_img: "复制图片",
            btn_share_hero: "📢 战报分享",
            season_btn: "🏆 S1 赛季",
            season_points: "赛季积分",
            season_milestones_title: "🏆 赛季征程目标",
            return_banner_title: "回归庇护所 · 传奇再临",
            return_banner_sub: "庇护所一直在等待强大的勇者归来！这是为你准备的凯旋战礼：",
            return_reward_exp: "30分钟 双倍经验祝福",
            return_reward_exp_desc: "讨伐所有魔物获得 200% 经验收益",
            return_reward_gold_desc: "用于打造神兵与学习全新技能",
            return_reward_chest: "稀有神秘神装宝箱",
            return_reward_chest_desc: "必得 1 件强力黄色或暗金品质装备",
            return_reward_sp: "技能悟性点 +1",
            return_reward_sp_desc: "突破技能树，解锁高阶战术技能",
            return_claim_btn: "⚔️ 领取大礼并启程 ⚔️"
        }
    },

    // Nombres de pisos / Biomas traducidos
    floors: {
        town: { es: "Campamento de las Arpías", en: "Rogue Encampment", zh: "罗格营地" },
        forest: [
            { es: "Páramo Sangriento", en: "Blood Moor", zh: "荒芜旷野" },
            { es: "Bosque Oscuro", en: "Dark Wood", zh: "黑暗丛林" },
            { es: "Caverna de las Arañas", en: "Spider Cavern", zh: "蜘蛛洞穴" },
            { es: "Torre Olvidada", en: "Forgotten Tower", zh: "遗忘高塔" },
            { es: "Templo Corrupto", en: "Corrupted Temple", zh: "腐败神殿" },
            { es: "Pantano Ponzoñoso", en: "Poison Bog", zh: "毒沼深处" },
            { es: "Cementerio Marchito", en: "Deadwood Graveyard", zh: "枯木墓地" },
            { es: "Corazón del Bosque", en: "Heart of the Tree", zh: "古树之心" },
            { es: "Santuario Druida", en: "Druid Sanctuary", zh: "德鲁伊圣所" },
            { es: "Árbol del Mundo", en: "World Tree", zh: "世界之树" }
        ],
        ice: [
            { es: "Paso Helado", en: "Frozen Pass", zh: "冰封山道" },
            { es: "Guarida del Lobo Escarcha", en: "Frostwolf Den", zh: "霜狼巢穴" },
            { es: "Ruinas Glaciares", en: "Glacial Ruins", zh: "冻结废墟" },
            { es: "Cripta Gélida", en: "Frozen Crypt", zh: "寒冰墓穴" },
            { es: "Altar de la Tormenta", en: "Blizzard Altar", zh: "暴风祭坛" },
            { es: "Caverna de Cristal", en: "Crystal Cavern", zh: "冰晶洞窟" },
            { es: "Abismo Glacial", en: "Frigid Abyss", zh: "极寒深渊" },
            { es: "Trono Helado", en: "Frost Throne", zh: "冰霜王座" },
            { es: "Templo del Invierno", en: "Winter Temple", zh: "永冬神殿" },
            { es: "Santuario Congelado", en: "Frozen Sanctuary", zh: "冰封圣殿" }
        ],
        fire: [
            { es: "Fisura Ardiente", en: "Scorching Chasm", zh: "灼热裂隙" },
            { es: "Valle de Lava", en: "Lava Valley", zh: "熔岩河谷" },
            { es: "Mina en Llamas", en: "Burning Mine", zh: "燃烧矿坑" },
            { es: "Altar Ígneo", en: "Flame Altar", zh: "烈焰祭坛" },
            { es: "Abismo de Azufre", en: "Brimstone Abyss", zh: "硫磺深渊" },
            { es: "Forja Demoníaca", en: "Demon Forge", zh: "恶魔熔炉" },
            { es: "Catedral de la Ruina", en: "Ruin Cathedral", zh: "毁灭圣堂" },
            { es: "Corazón del Purgatorio", en: "Purgatory Heart", zh: "炼狱之心" },
            { es: "Fisura del Caos", en: "Chaos Rift", zh: "混沌裂口" },
            { es: "Piedra del Mundo", en: "Worldstone", zh: "世界之石" }
        ],
        cycles: {
            prefix: [
                { es: "", en: "", zh: "" },
                { es: "Abisal", en: "Abyssal", zh: "深渊" },
                { es: "Vacío", en: "Void", zh: "虚空" },
                { es: "Eterno", en: "Eternal", zh: "永恒" },
                { es: "Caos", en: "Chaos", zh: "混沌" },
                { es: "Juicio Final", en: "Doomsday", zh: "末日" }
            ],
            hell_prefix: { es: "Infierno", en: "Hell", zh: "地狱" }
        }
    },

    // Nombres base de objetos
    items: {
        '短剑': { es: 'Espada Corta', en: 'Short Sword', zh: '短剑' },
        '巨斧': { es: 'Gran Hacha', en: 'Great Axe', zh: '巨斧' },
        '布甲': { es: 'Armadura de Tela', en: 'Cloth Armor', zh: '布甲' },
        '皮甲': { es: 'Armadura de Cuero', en: 'Leather Armor', zh: '皮甲' },
        '板甲': { es: 'Armadura de Placas', en: 'Plate Armor', zh: '板甲' },
        '皮帽': { es: 'Gorra de Cuero', en: 'Leather Cap', zh: '皮帽' },
        '全盔': { es: 'Yelmo Completo', en: 'Full Helm', zh: '全盔' },
        '皮手套': { es: 'Guantes de Cuero', en: 'Leather Gloves', zh: '皮手套' },
        '重手套': { es: 'Guantes Pesados', en: 'Heavy Gloves', zh: '重手套' },
        '皮靴': { es: 'Botas de Cuero', en: 'Leather Boots', zh: '皮靴' },
        '锁链靴': { es: 'Botas de Malla', en: 'Chain Boots', zh: '锁链靴' },
        '轻扣带': { es: 'Cinto Ligero', en: 'Light Belt', zh: '轻扣带' },
        '重腰带': { es: 'Cinturón Pesado', en: 'Heavy Belt', zh: '重腰带' },
        '铜戒指': { es: 'Anillo de Cobre', en: 'Copper Ring', zh: '铜戒指' },
        '护身符': { es: 'Amuleto', en: 'Amulet', zh: '护身符' },
        '治疗药剂': { es: 'Poción de Vida', en: 'Health Potion', zh: '治疗药剂' },
        '法力药剂': { es: 'Poción de Maná', en: 'Mana Potion', zh: '法力药剂' },
        '回城卷轴': { es: 'Pergamino Portal', en: 'Town Portal Scroll', zh: '回城卷轴' },
        '双倍经验': { es: 'Doble EXP', en: 'Double XP', zh: '双倍经验' }
    },

    // Prefijos y sufijos de afijos mágicos
    affixes: {
        '残忍的': { es: 'Cruel', en: 'Cruel', zh: '残忍的' },
        '野蛮的': { es: 'Salvaje', en: 'Savage', zh: '野蛮的' },
        '坚固的': { es: 'Robusto', en: 'Sturdy', zh: '坚固的' },
        '吸血的': { es: 'Vampírico', en: 'Vampiric', zh: '吸血的' },
        '急速的': { es: 'Veloz', en: 'Swift', zh: '急速的' },
        '烈焰之': { es: 'de Fuego', en: 'of Flame', zh: '烈焰之' },
        '冰霜之': { es: 'de Hielo', en: 'of Frost', zh: '冰霜之' },
        '闪电之': { es: 'del Rayo', en: 'of Lightning', zh: '闪电之' },
        '剧毒之': { es: 'del Veneno', en: 'of Poison', zh: '剧毒之' },
        '全能之': { es: 'Omnipotente', en: 'of Balance', zh: '全能之' },
        '燃烧的': { es: 'Ardiente', en: 'Burning', zh: '燃烧的' },
        '雷电的': { es: 'Electrizante', en: 'Shocking', zh: '雷电的' },
        '穿刺的': { es: 'Perforante', en: 'Piercing', zh: '穿刺的' },
        '击退的': { es: 'Repulsor', en: 'Repelling', zh: '击退的' },
        '减速的': { es: 'Ralentizador', en: 'Slowing', zh: '减速的' },
        '致命的': { es: 'Mortal', en: 'Deadly', zh: '致命的' },
        '连击的': { es: 'del Combo', en: 'of Flurry', zh: '连击的' },
        '之巨熊': { es: 'del Oso', en: 'of the Bear', zh: '之巨熊' },
        '之猎豹': { es: 'del Guepardo', en: 'of the Cheetah', zh: '之猎豹' },
        '之灵蛇': { es: 'de la Serpiente', en: 'of the Viper', zh: '之灵蛇' },
        '之雏鹰': { es: 'del Águila', en: 'of the Eagle', zh: '之雏鹰' },
        '之智慧': { es: 'de la Sabiduría', en: 'of Wisdom', zh: '之智慧' },
        '之守卫': { es: 'del Guardián', en: 'of Warding', zh: '之守卫' },
        '之坚韧': { es: 'de la Tenacidad', en: 'of Fortitude', zh: '之坚韧' },
        '之毁灭': { es: 'de la Ruina', en: 'of Ruin', zh: '之毁灭' }
    },

    // Nombres de estadísticas
    stats: {
        str: { es: "Fuerza", en: "Strength", zh: "力量" },
        dex: { es: "Destreza", en: "Dexterity", zh: "敏捷" },
        vit: { es: "Vitalidad", en: "Vitality", zh: "体力" },
        ene: { es: "Energía", en: "Energy", zh: "能量" },
        def: { es: "Defensa", en: "Defense", zh: "防御" },
        maxHp: { es: "Vida", en: "Life", zh: "生命" },
        maxMp: { es: "Maná", en: "Mana", zh: "法力" },
        hp: { es: "Vida", en: "Life", zh: "生命" },
        mp: { es: "Maná", en: "Mana", zh: "法力" },
        lifeSteal: { es: "Robo de Vida %", en: "Life Leech %", zh: "吸血%" },
        attackSpeed: { es: "Velocidad de Ataque %", en: "Attack Speed %", zh: "攻速%" },
        critChance: { es: "Prob. Crítico %", en: "Crit Chance %", zh: "暴击%" },
        critDamage: { es: "Daño Crítico %", en: "Crit Damage %", zh: "暴伤%" },
        dmgPct: { es: "Daño %", en: "Damage %", zh: "伤害%" },
        allSkills: { es: "A todas las Habilidades", en: "To All Skills", zh: "技能" },
        fireRes: { es: "Resistencia al Fuego %", en: "Fire Res %", zh: "火抗" },
        coldRes: { es: "Resistencia al Frío %", en: "Cold Res %", zh: "冰抗" },
        lightningRes: { es: "Resistencia al Rayo %", en: "Lightning Res %", zh: "电抗" },
        poisonRes: { es: "Resistencia al Veneno %", en: "Poison Res %", zh: "毒抗" },
        allRes: { es: "Todas las Resistencias %", en: "All Resistances %", zh: "全抗" },
        fireDmg: { es: "Daño de Fuego", en: "Fire Damage", zh: "火伤" },
        coldDmg: { es: "Daño de Frío", en: "Cold Damage", zh: "冰伤" },
        lightningDmg: { es: "Daño de Rayo", en: "Lightning Damage", zh: "电伤" },
        poisonDmg: { es: "Daño de Veneno", en: "Poison Damage", zh: "毒伤" },
        hpRegen: { es: "Regeneración de Vida/s", en: "Life Regen/s", zh: "生命/秒" },
        mpRegen: { es: "Regen. Maná %", en: "Mana Regen %", zh: "法力%" },
        blockChance: { es: "Prob. Bloqueo %", en: "Block Chance %", zh: "格挡%" },
        thornsPct: { es: "Espinas %", en: "Thorns %", zh: "反伤%" },
        speedPct: { es: "Velocidad de Mov. %", en: "Move Speed %", zh: "移速%" },
        goldPct: { es: "Oro Extra %", en: "Extra Gold %", zh: "金币加成%" },
        dropRatePct: { es: "Prob. Hallazgo Mágico %", en: "Magic Find %", zh: "掉宝率%" }
    },

    // Nombres y ramas de habilidades
    skills: {
        fireball: { es: "Bola de Fuego", en: "Fireball", zh: "火球术" },
        thunder: { es: "Descarga Eléctrica", en: "Lightning Strike", zh: "雷电术" },
        multishot: { es: "Disparo Múltiple", en: "Multishot", zh: "多重射击" },
        holy_shield: { es: "Escudo Sagrado", en: "Holy Shield", zh: "神圣护盾" }
    },

    // Nombres de talentos
    talents: {
        flame_soul: { name: { es: "Alma de Llamas", en: "Flame Soul", zh: "烈焰之魂" }, desc: { es: "Los ataques infligen 30% daño de fuego adicional", en: "Attacks deal 30% extra fire damage", zh: "攻击附带30%火焰伤害" } },
        thunder_chain: { name: { es: "Rayo en Cadena", en: "Chain Lightning", zh: "连锁闪电" }, desc: { es: "Al matar un enemigo, electrocuta a los cercanos", en: "On kill, shock nearby enemies with lightning", zh: "击杀敌人时电击周围敌人" } },
        executioner: { name: { es: "Verdugo", en: "Executioner", zh: "处刑者" }, desc: { es: "+100% de daño contra enemigos con menos del 30% de vida", en: "+100% damage against enemies below 30% HP", zh: "对低于30%血量敌人伤害+100%" } },
        berserker: { name: { es: "Furia Berserker", en: "Berserker", zh: "狂战士" }, desc: { es: "+50% de daño, pero recibes +20% de daño adicional", en: "+50% damage dealt, but take +20% extra damage", zh: "伤害+50%，受到伤害+20%" } },
        critical_master: { name: { es: "Maestro Crítico", en: "Critical Master", zh: "暴击大师" }, desc: { es: "+15% prob. de crítico y +30% de daño crítico", en: "+15% crit chance and +30% crit damage", zh: "暴击率+15%，暴击伤害+30%" } },
        poison_blade: { name: { es: "Hoja Ponzoñosa", en: "Poison Blade", zh: "淬毒之刃" }, desc: { es: "Los ataques infligen 25% daño de veneno", en: "Attacks deal 25% poison damage", zh: "攻击附带25%毒素伤害" } },
        iron_wall: { name: { es: "Muro de Hierro", en: "Iron Wall", zh: "铁壁" }, desc: { es: "+80 Defensa, -10% Velocidad de movimiento", en: "+80 Defense, -10% Move speed", zh: "+80防御，移速-10%" } },
        vampire: { name: { es: "Vampiro", en: "Vampirism", zh: "吸血鬼" }, desc: { es: "+8% de robo de vida en cada golpe", en: "+8% Life leech on hit", zh: "生命偷取+8%" } },
        regeneration: { name: { es: "Regeneración", en: "Regeneration", zh: "再生" }, desc: { es: "Recupera 2% de vida máxima cada segundo", en: "Regenerate 2% max HP per second", zh: "每秒恢复2%最大生命值" } },
        elemental_shield: { name: { es: "Escudo Elemental", en: "Elemental Ward", zh: "元素护盾" }, desc: { es: "+25% a todas las resistencias elementales", en: "+25% to all elemental resistances", zh: "所有抗性+25%" } },
        thorns: { name: { es: "Espinas de Acero", en: "Steel Thorns", zh: "荆棘" }, desc: { es: "Devuelve 20% del daño recibido a los atacantes", en: "Reflect 20% of received damage to attackers", zh: "反弹20%受到的伤害" } },
        magnet: { name: { es: "Imán de Botín", en: "Loot Magnet", zh: "磁铁" }, desc: { es: "Duplica el radio de recogida automática", en: "Double auto-pickup range", zh: "自动拾取范围翻倍" } },
        greed: { name: { es: "Avaricia", en: "Greed", zh: "贪婪" }, desc: { es: "+50% de oro obtenido de enemigos", en: "+50% gold dropped by enemies", zh: "金币掉落+50%" } },
        treasure_hunter: { name: { es: "Cazatesoros", en: "Treasure Hunter", zh: "寻宝者" }, desc: { es: "+30% prob. de conseguir mejor equipo", en: "+30% equipment drop chance", zh: "装备掉落率+30%" } },
        swift: { name: { es: "Celeridad", en: "Swiftness", zh: "迅捷" }, desc: { es: "+25% de velocidad de movimiento", en: "+25% movement speed", zh: "移动速度+25%" } },
        mana_flow: { name: { es: "Torrente de Maná", en: "Mana Flow", zh: "法力涌动" }, desc: { es: "+50 Maná máx. y +3% regeneración de maná", en: "+50 Max mana and +3% mana regen", zh: "最大法力+50，法力恢复+3%" } },
        gambler: { name: { es: "Tahúr", en: "Gambler", zh: "赌徒" }, desc: { es: "El daño infligido varía aleatoriamente entre 0.5x y 2.0x", en: "Damage dealt randomly varies between 0.5x and 2.0x", zh: "伤害随机×0.5~×2.0" } },
        glass_cannon: { name: { es: "Cañón de Cristal", en: "Glass Cannon", zh: "玻璃大炮" }, desc: { es: "+100% de daño, pero -30% de vida máxima", en: "+100% damage, -30% max HP", zh: "伤害+100%，最大生命-30%" } },
        phoenix: { name: { es: "Fénix", en: "Phoenix", zh: "凤凰" }, desc: { es: "Resucita una vez con el 50% de vida al morir", en: "Revive once with 50% HP upon fatal blow", zh: "死亡时复活一次（50%生命）" } },
        bloodlust: { name: { es: "Sed de Sangre", en: "Bloodlust", zh: "嗜血" }, desc: { es: "Recupera 5% de vida máxima al matar a un enemigo", en: "Restore 5% max HP when killing an enemy", zh: "击杀敌人时恢复5%最大生命" } }
    },

    // Títulos de prestigio
    titles: {
        none: { es: 'Ninguno', en: 'None', zh: '无' },
        adventurer: { es: 'Aventurero', en: 'Adventurer', zh: '冒险者' },
        elite_hunter: { es: 'Cazador Élite', en: 'Elite Hunter', zh: '精英猎人' },
        hell_walker: { es: 'Caminante del Infierno', en: 'Hell Walker', zh: '地狱行者' },
        golden_lord: { es: 'Señor Dorado', en: 'Golden Lord', zh: '黄金领主' },
        billionaire: { es: 'Multimillonario', en: 'Billionaire', zh: '亿万富翁' },
        legend: { es: 'Leyenda Inmortal', en: 'Immortal Legend', zh: '不朽传奇' }
    },

    // Jefes y Monstruos
    monsters: {
        '血鸟': { es: 'Cuervo Sangriento', en: 'Blood Raven', zh: '血鸟' },
        '女伯爵': { es: 'La Condesa', en: 'The Countess', zh: '女伯爵' },
        '屠夫': { es: 'El Carnicero', en: 'The Butcher', zh: '屠夫' },
        '树头木拳': { es: 'Piedra de Madera', en: 'Treehead WoodFist', zh: '树头木拳' },
        '暗黑破坏神': { es: 'Diablo', en: 'Diablo', zh: '暗黑破坏神' },
        '巴尔': { es: 'Baal', en: 'Baal', zh: '巴尔' },
        '都瑞尔': { es: 'Duriel', en: 'Duriel', zh: '都瑞尔' },
        '僵尸': { es: 'Zombi', en: 'Zombie', zh: '僵尸' },
        '骷髅': { es: 'Esqueleto', en: 'Skeleton', zh: '骷髅' },
        '幽灵': { es: 'Fantasma', en: 'Ghost', zh: '幽灵' },
        '萨满': { es: 'Chamán', en: 'Shaman', zh: '萨满' },
        '小恶魔': { es: 'Diablillo', en: 'Imp', zh: '小恶魔' },
        '木乃伊': { es: 'Momia', en: 'Mummy', zh: '木乃伊' },
        '吸血鬼': { es: 'Vampiro', en: 'Vampire', zh: '吸血鬼' },
        '幽灵恶鬼': { es: 'Espectro', en: 'Specter', zh: '幽灵恶鬼' },
        '精英守卫': { es: 'Guardián Élite', en: 'Elite Guard', zh: '精英守卫' }
    },

    // Inicialización del sistema
    init() {
        const saved = localStorage.getItem('game_language');
        if (saved && (saved === 'es' || saved === 'en' || saved === 'zh')) {
            this.currentLang = saved;
        } else {
            // Detectar idioma del navegador
            const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
            if (browserLang.startsWith('es')) {
                this.currentLang = 'es';
            } else if (browserLang.startsWith('zh')) {
                this.currentLang = 'zh';
            } else {
                this.currentLang = 'en';
            }
        }

        // Inyectar estilos para el selector de idiomas
        this.injectStyles();
        
        // Traducir el DOM cuando esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.applyTranslations());
        } else {
            this.applyTranslations();
        }

        console.log(`[I18N] Sistema multilingüe inicializado en: ${this.currentLang.toUpperCase()}`);
    },

    // Inyectar CSS elegante para el selector de idiomas
    injectStyles() {
        if (document.getElementById('i18n-styles')) return;
        const style = document.createElement('style');
        style.id = 'i18n-styles';
        style.textContent = `
            /* Selector de idioma en pantalla de inicio */
            .lang-selector-bar {
                position: absolute;
                top: 20px;
                right: 25px;
                display: flex;
                gap: 8px;
                z-index: 100;
                background: rgba(12, 10, 8, 0.85);
                padding: 6px 12px;
                border: 1px solid #735429;
                border-radius: 6px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.7);
            }
            .lang-pill-btn {
                background: rgba(255,255,255,0.06);
                border: 1px solid #4a3a28;
                color: #cbb493;
                font-family: inherit;
                font-size: 12px;
                font-weight: 600;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                gap: 5px;
            }
            .lang-pill-btn:hover {
                background: rgba(200, 160, 90, 0.25);
                border-color: #d1aa66;
                color: #fff;
            }
            .lang-pill-btn.active {
                background: linear-gradient(180deg, #7c5a2c, #483318);
                border-color: #ffd700;
                color: #ffe8a8;
                box-shadow: 0 0 8px rgba(255, 215, 0, 0.35);
            }

            /* Selector flotante durante el juego en la barra superior */
            .quick-lang-btn {
                position: fixed;
                top: 10px;
                right: 170px;
                z-index: 101;
                background: rgba(10, 10, 15, 0.85);
                border: 1px solid #5a452a;
                color: #e6c88b;
                padding: 4px 10px;
                border-radius: 4px;
                font-size: 11px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 4px;
                transition: all 0.2s;
            }
            .quick-lang-btn:hover {
                border-color: #ffd700;
                background: rgba(30, 25, 20, 0.95);
            }
            @media (max-width: 768px) {
                .lang-selector-bar {
                    top: 10px;
                    right: 10px;
                    padding: 4px 8px;
                    gap: 5px;
                }
                .lang-pill-btn {
                    font-size: 10px;
                    padding: 4px 6px;
                }
                .quick-lang-btn {
                    right: 80px;
                    top: 10px;
                }
            }
        `;
        document.head.appendChild(style);
    },

    // Función principal de traducción
    t(key, params = {}) {
        const dict = this.locales[this.currentLang] || this.locales.en;
        let str = dict[key] || this.locales.en[key] || this.locales.zh[key] || key;

        return this.interpolate(str, params);
    },

    // Igual que t() pero devuelve la reserva cuando la clave no existe en ningún
    // idioma, en lugar de devolver la propia clave.
    tOr(key, fallback = '', params = null) {
        const dict = this.locales[this.currentLang] || this.locales.en;
        const str = dict[key] || this.locales.en[key] || this.locales.zh[key];
        if (str) return params ? this.interpolate(str, params) : str;
        return params ? this.interpolate(fallback, params) : fallback;
    },

    // Registrar una tabla de contenido externa (i18n-content-*.js)
    registerTable(name, table) {
        if (typeof name !== 'string' || !name || !table || typeof table !== 'object') {
            console.warn('[I18N] registerTable inválido:', name);
            return null;
        }
        if (this.content[name]) {
            console.warn(`[I18N] Tabla duplicada, se sobrescribe: ${name}`);
        }
        this.content[name] = table;
        return table;
    },

    // Resolver un valor {es,en,zh} (o texto plano) al idioma activo
    resolveEntry(entry) {
        if (entry == null) return '';
        if (typeof entry === 'string') return entry;
        if (typeof entry !== 'object') return '';
        return entry[this.currentLang] || entry.en || entry.zh || '';
    },

    // Sustituir marcadores {nombre} por los valores indicados en params
    interpolate(str, params) {
        if (!str || !params) return str;
        return str.replace(I18N_PLACEHOLDER_RE, (match, name) => (
            params[name] !== undefined && params[name] !== null ? params[name] : match
        ));
    },

    // Traducir una entrada de tabla de contenido
    tr(tableName, key, fallback = '', params = null) {
        const table = this.content[tableName];
        const entry = table ? table[key] : undefined;
        const raw = entry === undefined ? '' : this.resolveEntry(entry);

        if (raw) return params ? this.interpolate(raw, params) : raw;

        const missKey = `${tableName}.${key}`;
        if (fallback && !this._missingWarned.has(missKey)) {
            this._missingWarned.add(missKey);
            console.warn(`[I18N] Clave ausente: ${missKey}`);
        }
        return params ? this.interpolate(fallback, params) : fallback;
    },

    // Traducir un valor anidado dentro de una entrada de tabla
    trPath(tableName, key, path, fallback = '', params = null) {
        const table = this.content[tableName];
        let node = table ? table[key] : undefined;

        if (node !== undefined && node !== null && path) {
            for (const seg of String(path).split('.')) {
                if (node === null || typeof node !== 'object') { node = undefined; break; }
                node = node[seg];
            }
        } else if (path) {
            node = undefined;
        }

        const raw = node === undefined || node === null ? '' : this.resolveEntry(node);

        if (raw) return params ? this.interpolate(raw, params) : raw;

        const missKey = `${tableName}.${key}${path ? '.' + path : ''}`;
        if (fallback && !this._missingWarned.has(missKey)) {
            this._missingWarned.add(missKey);
            console.warn(`[I18N] Clave ausente: ${missKey}`);
        }
        return params ? this.interpolate(fallback, params) : fallback;
    },

    // Cambiar idioma activo
    setLanguage(lang) {
        if (!this.locales[lang]) return;
        this.currentLang = lang;
        localStorage.setItem('game_language', lang);
        document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;

        // Actualizar todos los elementos del DOM
        this.applyTranslations();

        // Notificar a los listeners
        this.listeners.forEach(fn => {
            try { fn(lang); } catch (e) { console.error('[I18N] Error in listener:', e); }
        });

        // Actualizar estado visual de los botones de idioma
        document.querySelectorAll('.lang-pill-btn').forEach(btn => {
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        const langSelect = document.getElementById('select-game-language');
        if (langSelect) langSelect.value = lang;

        // Si el juego está corriendo, refrescar paneles activos
        this.refreshGameUI();

        console.log(`[I18N] Idioma cambiado a: ${lang.toUpperCase()}`);
    },

    onChange(fn) {
        if (typeof fn === 'function') this.listeners.push(fn);
    },

    // Aplicar traducciones a elementos marcados con atributos en el DOM
    applyTranslations() {
        // Texto general [data-i18n]
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key) el.textContent = this.t(key);
        });

        // HTML interno [data-i18n-html]
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            if (key) el.innerHTML = this.t(key);
        });

        // Placeholders [data-i18n-placeholder]
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (key) el.placeholder = this.t(key);
        });

        // Títulos / Tooltips nativos [data-i18n-title]
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            if (key) el.title = this.t(key);
        });

        // Asegurar que elementos fijos conocidos se actualicen
        this.updateStaticUI();
    },

    // Traducir partes estáticas del DOM original sin romper selectores
    updateStaticUI() {
        const setTxt = (id, key) => {
            const el = document.getElementById(id);
            if (el) el.textContent = this.t(key);
        };

        // Botón de inicio
        const startBtn = document.querySelector('.start-btn');
        if (startBtn) startBtn.textContent = this.t('enter_sanctuary');

        // Botón de auto-batalla
        const abText = document.getElementById('auto-battle-text');
        if (abText) abText.textContent = this.t('auto_battle_btn');

        // Indicador de infierno
        const hellEl = document.getElementById('hell-indicator');
        if (hellEl) hellEl.textContent = this.t('hell_mode');

        // Botones de menú
        const btnStats = document.getElementById('btn-stats');
        if (btnStats) {
            const badge = document.getElementById('badge-stats');
            btnStats.innerHTML = `${this.t('menu_stats')}<span class="notification-badge" id="badge-stats">${badge ? badge.innerHTML : ''}</span>`;
        }
        const btnInv = document.getElementById('btn-inventory');
        if (btnInv) btnInv.textContent = this.t('menu_inventory');
        const btnSkills = document.getElementById('btn-skills');
        if (btnSkills) {
            const badge = document.getElementById('badge-skills');
            btnSkills.innerHTML = `${this.t('menu_skills')}<span class="notification-badge" id="badge-skills">${badge ? badge.innerHTML : ''}</span>`;
        }
        const btnQuest = document.getElementById('btn-quest');
        if (btnQuest) {
            const badge = document.getElementById('badge-quest');
            btnQuest.innerHTML = `${this.t('menu_quest')}<span class="notification-badge" id="badge-quest">${badge ? badge.innerHTML : ''}</span>`;
        }
        const btnAch = document.getElementById('btn-achievements');
        if (btnAch) btnAch.textContent = this.t('menu_achievements');
        const btnSet = document.getElementById('btn-set-collection');
        if (btnSet) btnSet.textContent = this.t('menu_codex');
        const btnDivine = document.getElementById('btn-divine-blessing');
        if (btnDivine) {
            const badge = btnDivine.querySelector('.db-count-badge');
            btnDivine.innerHTML = `🌟 ${this.t('menu_blessing').replace('🌟 ', '')}<span class="db-count-badge">${badge ? badge.textContent : '0'}</span>`;
        }

        // Títulos de paneles
        const setPanelHeader = (panelId, key) => {
            const panel = document.getElementById(panelId);
            if (panel) {
                const header = panel.querySelector('.panel-header');
                if (header) header.textContent = this.t(key);
            }
        };

        setPanelHeader('stats-panel', 'stats_title');
        setPanelHeader('inventory-panel', 'inv_title');
        setPanelHeader('skills-panel', 'skills_title');
        setPanelHeader('quest-panel', 'quest_title');
        setPanelHeader('achievements-panel', 'menu_achievements');
        setPanelHeader('set-collection-panel', 'menu_codex');
        setPanelHeader('stash-panel', 'stash_title');
        setPanelHeader('shop-panel', 'shop_title');
        setPanelHeader('auto-battle-panel', 'settings_title');

        // Pestañas de habilidades
        const skillTabs = document.querySelectorAll('.skill-tree-tab');
        skillTabs.forEach(tab => {
            const skill = tab.getAttribute('data-skill');
            if (skill === 'fireball') tab.textContent = this.t('tab_fire');
            else if (skill === 'thunder') tab.textContent = this.t('tab_thunder');
            else if (skill === 'multishot') tab.textContent = this.t('tab_multishot');
            else if (skill === 'holy_shield') tab.textContent = this.t('tab_holy_shield');
        });

        // Chat
        const chatTitle = document.querySelector('.chat-title');
        if (chatTitle) chatTitle.textContent = this.t('world_chat');
        const chatInput = document.getElementById('chat-input');
        if (chatInput) chatInput.placeholder = this.t('chat_placeholder');
        const chatSendBtn = document.getElementById('chat-send-btn');
        if (chatSendBtn) chatSendBtn.textContent = this.t('chat_send');

        // Changelog
        const changelogLink = document.getElementById('changelog-link');
        if (changelogLink) changelogLink.textContent = this.t('changelog_btn');
    },

    // Refrescar paneles abiertos dinámicamente
    refreshGameUI() {
        if (typeof player === 'undefined') return;

        // Actualizar HUD de piso
        const floorDisplay = document.getElementById('floor-display');
        if (floorDisplay) {
            const isInHell = player.isInHell || false;
            const currentFloor = isInHell ? player.hellFloor : player.floor;
            if (player.floor === 0 && !isInHell) {
                floorDisplay.innerText = this.t('floor_display_town');
            } else {
                const floorName = this.getFloorName(currentFloor, isInHell);
                floorDisplay.innerText = this.t('floor_display_floor', { floor: currentFloor, name: floorName });
            }
        }

        // Refrescar paneles si el juego está en marcha
        try {
            if (typeof updateStatsUI === 'function') updateStatsUI();
            if (typeof renderInventory === 'function') renderInventory();
            if (typeof updateSkillsUI === 'function') updateSkillsUI();
            if (typeof updateQuestUI === 'function') updateQuestUI();
            if (typeof renderStash === 'function') renderStash();
            if (typeof renderAchievements === 'function') renderAchievements();
        } catch (e) {
            console.warn('[I18N] refreshGameUI deferred:', e);
        }
    },

    // Traducir nombre de piso según número y bioma
    getFloorName(floor, isHell = false) {
        if (floor <= 0) return this.floors.town[this.currentLang] || this.floors.town.en;

        const lang = this.currentLang;
        if (isHell) {
            const index = ((floor - 1) % 10);
            const baseName = this.floors.fire[index][lang] || this.floors.fire[index].en;
            const hellPrefix = this.floors.cycles.hell_prefix[lang] || this.floors.cycles.hell_prefix.en;
            return `${hellPrefix} · ${baseName}`;
        }

        // Bosque (1-10)
        if (floor <= 10) {
            return this.floors.forest[floor - 1][lang] || this.floors.forest[floor - 1].en;
        }

        // Hielo (11-20)
        if (floor <= 20) {
            return this.floors.ice[floor - 11][lang] || this.floors.ice[floor - 11].en;
        }

        // Fuego / Ciclos (21+)
        const fireIndex = ((floor - 21) % 10);
        const cycle = Math.floor((floor - 21) / 10);
        const prefixObj = this.floors.cycles.prefix[Math.min(cycle, this.floors.cycles.prefix.length - 1)];
        const prefix = prefixObj ? (prefixObj[lang] || prefixObj.en) : "";
        const fireName = this.floors.fire[fireIndex][lang] || this.floors.fire[fireIndex].en;

        if (prefix) {
            return `${prefix} · ${fireName}`;
        }
        return fireName;
    },

    // Obtener nombre traducido de un objeto
    getItemDisplayName(item) {
        if (!item) return "";
        const lang = this.currentLang;

        // Si es poción o consumible
        if (this.items[item.name]) {
            return this.items[item.name][lang] || this.items[item.name].en;
        }

        // Si es único
        if (item.rarity === 4) {
            const baseTranslated = this.items[item.name] ? (this.items[item.name][lang] || this.items[item.name].en) : item.name;
            const uniquePrefix = this.t('rarity_unique');
            return `${uniquePrefix} · ${baseTranslated}`;
        }

        // Si es de conjunto (Set)
        if (item.rarity === 5 && item.displayName) {
            return item.displayName;
        }

        // Si tiene nombre base traducible
        let result = this.items[item.name] ? (this.items[item.name][lang] || this.items[item.name].en) : item.name;

        // Si tiene afijos mágicos
        if (item.displayName && item.displayName !== item.name) {
            for (const [zhAffix, trans] of Object.entries(this.affixes)) {
                if (item.displayName.includes(zhAffix)) {
                    const affixName = trans[lang] || trans.en;
                    if (lang === 'es') {
                        result = `${result} ${affixName}`;
                    } else if (lang === 'en') {
                        result = `${affixName} ${result}`;
                    } else {
                        result = `${zhAffix} ${result}`;
                    }
                    break;
                }
            }
        }

        return result;
    },

    // Traducir etiqueta de atributo
    getStatLabel(key) {
        const lang = this.currentLang;
        if (this.stats[key]) {
            return this.stats[key][lang] || this.stats[key].en;
        }
        return key;
    },

    // Traducir talento
    getTalentName(id) {
        if (this.talents[id]) {
            return this.talents[id].name[this.currentLang] || this.talents[id].name.en;
        }
        return id;
    },

    getTalentDesc(id) {
        if (this.talents[id]) {
            return this.talents[id].desc[this.currentLang] || this.talents[id].desc.en;
        }
        return "";
    },

    // Bendiciones Celestiales
    blessings: {
        'db_flame': { es: 'Alma de Fuego', en: 'Flame Soul', zh: '烈焰之魂' },
        'db_crit': { es: 'Maestro Crítico', en: 'Critical Master', zh: '暴击大师' },
        'db_dmg': { es: 'Berserker', en: 'Berserker', zh: '狂战士' },
        'db_poison': { es: 'Filo Envenenado', en: 'Poisoned Blade', zh: '淬毒之刃' },
        'db_def': { es: 'Muralla de Hierro', en: 'Iron Wall', zh: '铁壁' },
        'db_ls': { es: 'Vampiro', en: 'Vampire', zh: '吸血鬼' },
        'db_hpregen': { es: 'Regeneración', en: 'Regeneration', zh: '再生' },
        'db_res': { es: 'Escudo Elemental', en: 'Elemental Shield', zh: '元素护盾' },
        'db_thorns': { es: 'Espinas', en: 'Thorns', zh: '荆棘' },
        'db_mana': { es: 'Oleada de Maná', en: 'Mana Surge', zh: '法力涌动' },
        'db_gold': { es: 'Codicia', en: 'Greed', zh: '贪婪' },
        'db_drop': { es: 'Buscador de Tesoros', en: 'Treasure Hunter', zh: '寻宝者' },
        'db_blood': { es: 'Sed de Sangre', en: 'Bloodlust', zh: '嗜血' },
        '烈焰之魂': { es: 'Alma de Fuego', en: 'Flame Soul', zh: '烈焰之魂' },
        '暴击大师': { es: 'Maestro Crítico', en: 'Critical Master', zh: '暴击大师' },
        '狂战士': { es: 'Berserker', en: 'Berserker', zh: '狂战士' },
        '淬毒之刃': { es: 'Filo Envenenado', en: 'Poisoned Blade', zh: '淬毒之刃' },
        '铁壁': { es: 'Muralla de Hierro', en: 'Iron Wall', zh: '铁壁' },
        '吸血鬼': { es: 'Vampiro', en: 'Vampire', zh: '吸血鬼' },
        '再生': { es: 'Regeneración', en: 'Regeneration', zh: '再生' },
        '元素护盾': { es: 'Escudo Elemental', en: 'Elemental Shield', zh: '元素护盾' },
        '荆棘': { es: 'Espinas', en: 'Thorns', zh: '荆棘' },
        '法力涌动': { es: 'Oleada de Maná', en: 'Mana Surge', zh: '法力涌动' },
        '贪婪': { es: 'Codicia', en: 'Greed', zh: '贪婪' },
        '寻宝者': { es: 'Buscador de Tesoros', en: 'Treasure Hunter', zh: '寻宝者' },
        '嗜血': { es: 'Sed de Sangre', en: 'Bloodlust', zh: '嗜血' }
    },

    // Habilidades
    skillNames: {
        'fireball': { es: 'Bola de Fuego', en: 'Fireball', zh: '火球术' },
        'thunder': { es: 'Tormenta de Trueno', en: 'Thunderstorm', zh: '雷暴' },
        'multishot': { es: 'Disparo Múltiple', en: 'Multishot', zh: '多重射击' },
        'holy_shield': { es: 'Escudo Sagrado', en: 'Holy Shield', zh: '神圣护盾' },
        '火球术': { es: 'Bola de Fuego', en: 'Fireball', zh: '火球术' },
        '雷暴': { es: 'Tormenta de Trueno', en: 'Thunderstorm', zh: '雷暴' },
        '多重射击': { es: 'Disparo Múltiple', en: 'Multishot', zh: '多重射击' },
        '神圣护盾': { es: 'Escudo Sagrado', en: 'Holy Shield', zh: '神圣护盾' }
    },

    // Traducir bendición
    getBlessingName(nameOrId) {
        if (!nameOrId) return "";
        const lang = this.currentLang;
        const b = this.blessings[nameOrId];
        if (b) return b[lang] || b.en;
        return nameOrId;
    },

    // Traducir efecto de bendición
    getBlessingEffectName(key) {
        const lang = this.currentLang;
        const names = {
            dmgPct: { es: 'Daño', en: 'Damage', zh: '伤害' },
            lifeSteal: { es: 'Robo de Vida', en: 'Life Steal', zh: '生命偷取' },
            critChance: { es: 'Prob. Crítica', en: 'Crit Chance', zh: '暴击率' },
            critDamage: { es: 'Daño Crítico', en: 'Crit Damage', zh: '暴击伤害' },
            maxHp: { es: 'Vida Máx', en: 'Max HP', zh: '最大生命' },
            def: { es: 'Defensa', en: 'Defense', zh: '护甲' },
            allRes: { es: 'Res. Total', en: 'All Res', zh: '全抗' },
            hpRegenPct: { es: 'Regen. Vida/s', en: 'HP Regen/s', zh: '生命回复/秒' },
            maxMp: { es: 'Maná Máx', en: 'Max MP', zh: '最大法力' },
            mpRegenPct: { es: 'Regen. Maná/s', en: 'MP Regen/s', zh: '法力回复' },
            fireDmgPct: { es: 'Daño Fuego', en: 'Fire Damage', zh: '火焰伤害' },
            poisonDmgPct: { es: 'Daño Veneno', en: 'Poison Damage', zh: '毒素伤害' },
            thornsPct: { es: 'Espinas', en: 'Thorns', zh: '荆棘反伤' },
            goldPct: { es: 'Oro Extra', en: 'Gold Drop', zh: '金币掉落' },
            dropRatePct: { es: 'Botín Extra', en: 'Item Drops', zh: '装备掉落' },
            onKillHealPct: { es: 'Curación al matar', en: 'Heal on Kill', zh: '击杀回血' }
        };
        if (names[key]) return names[key][lang] || names[key].en;
        return key;
    },

    // Traducir recompensa diaria
    getDailyRewardName(reward) {
        if (!reward || !reward.name) return "";
        const lang = this.currentLang;
        const name = reward.name;
        if (name.includes('200 金币')) return lang === 'es' ? '200 Oro' : (lang === 'en' ? '200 Gold' : name);
        if (name.includes('12小时双倍金币')) return lang === 'es' ? '12h Doble Oro' : (lang === 'en' ? '12h Double Gold' : name);
        if (name.includes('24小时双倍经验')) return lang === 'es' ? '24h Doble EXP' : (lang === 'en' ? '24h Double XP' : name);
        if (name.includes('24小时双倍掉落')) return lang === 'es' ? '24h Doble Botín' : (lang === 'en' ? '24h Double Drops' : name);
        if (name.includes('24小时三倍经验 + 套装装备')) return lang === 'es' ? '24h Triple EXP + Conjunto' : (lang === 'en' ? '24h Triple XP + Set Gear' : name);
        return name;
    },

    // Traducir título
    getTitleName(id) {
        if (this.titles[id]) {
            return this.titles[id][this.currentLang] || this.titles[id].en;
        }
        return id;
    },

    // Traducir monstruo
    getMonsterName(name) {
        if (this.monsters[name]) {
            return this.monsters[name][this.currentLang] || this.monsters[name].en;
        }
        const bestiaryName = this.trPath('bestiary', name, 'name');
        if (bestiaryName) return bestiaryName;
        return name;
    },

    // Traducir notificaciones dinámicas en tiempo de ejecución
    translateNotification(msg) {
        if (!msg) return "";
        if (this.currentLang === 'zh') return msg;

        const lang = this.currentLang;

        // Mapeo exacto
        const exactMap = {
            '欢迎回到罗格营地': 'notif_welcome_town',
            '背包已满！': 'notif_inv_full',
            '背包已满': 'notif_inv_full',
            '金币不足': 'notif_no_gold',
            '金币不足！': 'notif_no_gold',
            '法力不足': 'notif_no_mana',
            '法力不足！': 'notif_no_mana',
            '游戏已保存': 'notif_game_saved',
            '强化成功！': 'notif_upgraded',
            '强化成功!': 'notif_upgraded',
            '强化失败': 'notif_failed',
            '只能强化装备': 'forge_only_equipment',
            '在罗格营地不能丢弃物品': lang === 'es' ? 'No puedes tirar objetos en el Campamento' : 'Cannot drop items in the encampment',
            '地狱之门已开启！': lang === 'es' ? '¡Las Puertas del Infierno se han abierto!' : 'The Gates of Hell have opened!',
            '已从地狱返回营地': 'return_camp_from_hell',
            '已返回罗格营地': 'notif_welcome_town',
            '已返回营地': 'return_camp',
            '技能未学习：神圣护盾': lang === 'es' ? 'Habilidad no aprendida: Escudo Sagrado' : 'Skill not learned: Holy Shield',
            '技能还未学习！打开技能面板升级': lang === 'es' ? '¡Habilidad no aprendida! Abre el panel de habilidades' : 'Skill not learned! Open skill panel',
            '🎉 教程完成！祝你冒险愉快！': lang === 'es' ? '🎉 ¡Tutorial completado! ¡Buena suerte!' : '🎉 Tutorial completed! Have a great adventure!',
            '📋 新的每日任务已解锁！': lang === 'es' ? '📋 ¡Nueva misión diaria desbloqueada!' : '📋 New daily quest unlocked!',
            '槽位已满': 'forge_slots_full',
            '📋 每日任务完成！': lang === 'es' ? '📋 ¡Misión diaria completada!' : '📋 Daily quest completed!',
            '任务完成！': lang === 'es' ? '¡Misión completada!' : 'Quest completed!',
            '没有找到匹配的祭品': 'forge_no_matches',
            '没有选中物品': lang === 'es' ? 'No hay objeto seleccionado' : 'No item selected',
            '深渊挑战中禁止使用自动战斗': lang === 'es' ? 'El combate automático está prohibido en el Abismo' : 'Auto battle is disabled in the Abyss',
            '🔥以此身躯，挑战深渊！禁自动战斗！': lang === 'es' ? '🔥 ¡Desafía el abismo con tus propias manos!' : '🔥 Face the abyss with your own hands!',
            '物品已添加到聊天框': lang === 'es' ? 'Objeto compartido en el chat' : 'Item linked to chat',
            '祭品必须是相同稀有度': 'forge_same_rarity',
            '聊天系统未加载': lang === 'es' ? 'El chat aún no está cargado' : 'Chat system not loaded',
            '背包已整理': lang === 'es' ? 'Mochila organizada' : 'Inventory sorted',
            '仓库已整理': lang === 'es' ? 'Alijo organizado' : 'Stash sorted',
            '仓库已达最大容量！': lang === 'es' ? '¡El alijo ha alcanzado su capacidad máxima!' : 'Stash is at maximum capacity!',
            '自动战斗仅在地牢中生效': lang === 'es' ? 'La batalla automática solo funciona en mazmorras' : 'Auto battle only works in dungeons',
            '自动战斗已关闭': lang === 'es' ? 'Combate automático desactivado' : 'Auto battle disabled',
            '自动战斗已开启': lang === 'es' ? 'Combate automático activado' : 'Auto battle enabled',
            '自动移动到物品处...': lang === 'es' ? 'Moviéndose automáticamente al objeto...' : 'Moving to item...',
            '获得 1 技能点！': lang === 'es' ? '¡Obtuviste 1 punto de habilidad!' : 'Obtained 1 skill point!',
            '🎉 获得技能点！': lang === 'es' ? '🎉 ¡Punto de habilidad obtenido!' : '🎉 Skill point obtained!',
            '请先放入主装备': 'forge_no_main',
            '请先登录才能分享': lang === 'es' ? 'Inicia sesión para compartir' : 'Please log in to share',
            '阿卡拉治愈了你': 'npc_akara_healed',
            '金币不足，无法复活！': 'revive_no_gold',
            '你已经拥有这个天赋了！': 'talent_already_owned',
            '⚡ 双倍经验延长1小时！': lang === 'es' ? '⚡ ¡Doble EXP extendido por 1 hora!' : '⚡ Double XP extended by 1 hour!',
            '⚡ 双倍经验已激活！持续1小时': lang === 'es' ? '⚡ ¡Doble EXP activado por 1 hora!' : '⚡ Double XP activated for 1 hour!'
        };

        if (exactMap[msg]) {
            const tr = this.t(exactMap[msg]);
            return (tr && tr !== exactMap[msg]) ? tr : exactMap[msg];
        }

        // Patrones dinámicos
        let m;
        if ((m = msg.match(/^🎁 Day(\d+) 奖励领取成功：(.+)！$/))) {
            const rName = this.getDailyRewardName({ name: m[2] });
            return lang === 'es' ? `🎁 ¡Recompensa del Día ${m[1]} reclamada: ${rName}!` : `🎁 Day ${m[1]} reward claimed: ${rName}!`;
        }
        if ((m = msg.match(/^🔥 三倍经验已激活！持续(\d+)小时$/))) {
            return lang === 'es' ? `🔥 ¡Triple EXP activado por ${m[1]} horas!` : `🔥 Triple XP activated for ${m[1]} hours!`;
        }
        if ((m = msg.match(/^(?:⚡ )?双倍经验已激活！持续(\d+)小时$/))) {
            return lang === 'es' ? `⚡ ¡Doble EXP activado por ${m[1]} horas!` : `⚡ Double XP activated for ${m[1]} hours!`;
        }
        if ((m = msg.match(/^双倍金币已激活！持续(\d+)小时$/))) {
            return lang === 'es' ? `💰 ¡Doble Oro activado por ${m[1]} horas!` : `💰 Double Gold activated for ${m[1]} hours!`;
        }
        if ((m = msg.match(/^双倍掉落已激活！持续(\d+)小时$/))) {
            return lang === 'es' ? `🎁 ¡Doble Botín activado por ${m[1]} horas!` : `🎁 Double Drops activated for ${m[1]} hours!`;
        }
        if ((m = msg.match(/^丢弃 (.+) 腾出空间$/))) {
            return lang === 'es' ? `Descartaste ${this.getItemDisplayName({ name: m[1] })} para hacer espacio` : `Dropped ${this.getItemDisplayName({ name: m[1] })} to make room`;
        }
        if ((m = msg.match(/^丢弃了 (.+)$/))) {
            return lang === 'es' ? `Descartaste ${this.getItemDisplayName({ name: m[1] })}` : `Dropped ${this.getItemDisplayName({ name: m[1] })}`;
        }
        if ((m = msg.match(/^仓库扩建成功！当前容量: (\d+) 格$/))) {
            return lang === 'es' ? `¡Alijo ampliado! Capacidad actual: ${m[1]} casillas` : `Stash expanded! Current capacity: ${m[1]} slots`;
        }
        if ((m = msg.match(/^深渊第 (\d+) 层$/))) {
            return lang === 'es' ? `Abismo Piso ${m[1]}` : `Abyss Floor ${m[1]}`;
        }
        if ((m = msg.match(/^击败了 (.+)！$/))) {
            return lang === 'es' ? `¡Derrotaste a ${this.getMonsterName(m[1])}!` : `Defeated ${this.getMonsterName(m[1])}!`;
        }
        if ((m = msg.match(/^📖 发现(首领|怪物): (.+)$/))) {
            const kind = m[1] === '首领' ? (lang === 'es' ? 'Jefe' : 'Boss') : (lang === 'es' ? 'Monstruo' : 'Monster');
            return `📖 ${kind}: ${this.getMonsterName(m[2])}`;
        }
        if ((m = msg.match(/^📚 发现套装部件: (.+) \((\d+)\/(\d+)\)$/))) {
            return `📚 ${lang === 'es' ? 'Pieza de conjunto descubierta:' : 'Set piece discovered:'} ${this.getItemDisplayName({ name: m[1] })} (${m[2]}/${m[3]})`;
        }
        if ((m = msg.match(/^复活成功！消耗 ([\d,]+)/))) {
            return this.t('revive_success', { cost: m[1] });
        }
        if ((m = msg.match(/^成就完成：(.+)！$/))) {
            return lang === 'es' ? `¡Logro completado: ${m[1]}!` : `Achievement completed: ${m[1]}!`;
        }
        if ((m = msg.match(/^技能未学习：(.+)$/))) {
            const sName = this.skillNames[m[1]] ? (this.skillNames[m[1]][lang] || this.skillNames[m[1]].en) : m[1];
            return lang === 'es' ? `Habilidad no aprendida: ${sName}` : `Skill not learned: ${sName}`;
        }
        if ((m = msg.match(/^拾取：(.+)$/))) {
            return lang === 'es' ? `Recogido: ${this.getItemDisplayName({ name: m[1] })}` : `Looted: ${this.getItemDisplayName({ name: m[1] })}`;
        }
        if ((m = msg.match(/^祭品必须是同部位装备 \((.+)\)$/))) {
            const slotName = this.t('item_' + m[1]) || m[1];
            return this.t('forge_same_slot', { type: slotName });
        }
        if ((m = msg.match(/^等级不足！需要 (\d+) 级才能挑战深渊$/))) {
            return lang === 'es' ? `¡Nivel insuficiente! Requiere nivel ${m[1]} para el Abismo` : `Level too low! Requires Lv.${m[1]} for the Abyss`;
        }
        if ((m = msg.match(/^自动填充了 (\d+) 个祭品$/))) {
            return this.t('forge_autofill_done', { count: m[1] });
        }
        if ((m = msg.match(/^花费 ([\d,]+) G - 购买 (.+)$/))) {
            return lang === 'es' ? `Gastaste ${m[1]} Oro - Compraste ${this.getItemDisplayName({ name: m[2] })}` : `Spent ${m[1]} G - Bought ${this.getItemDisplayName({ name: m[2] })}`;
        }
        if ((m = msg.match(/^花费 ([\d,]+) G$/))) {
            return lang === 'es' ? `Gastaste ${m[1]} Oro` : `Spent ${m[1]} G`;
        }
        if ((m = msg.match(/^获得天赋：(.+)！$/))) {
            return this.t('talent_bought', { name: this.getTalentName(m[1]) });
        }
        if ((m = msg.match(/^🏆 获得套装：(.+)$/))) {
            return lang === 'es' ? `🏆 ¡Obtuviste pieza de conjunto: ${this.getItemDisplayName({ name: m[1] })}!` : `🏆 Acquired set piece: ${this.getItemDisplayName({ name: m[1] })}!`;
        }
        if ((m = msg.match(/^进入第 (\d+) 层$/))) {
            return lang === 'es' ? `Entrando al Piso ${m[1]}` : `Entering Floor ${m[1]}`;
        }
        if ((m = msg.match(/^金币不足！需要 ([\d,]+) (金|G)$/))) {
            return lang === 'es' ? `¡Oro insuficiente! Requiere ${m[1]} Oro` : `Not enough gold! Requires ${m[1]} G`;
        }
        if ((m = msg.match(/^(.+)：(.+) \(永久\)$/))) {
            const bName = this.getBlessingName(m[1]);
            return lang === 'es' ? `${bName}: ${m[2]} (Permanente)` : `${bName}: ${m[2]} (Permanent)`;
        }

        return msg;
    },

    // Traducir descripción de misión
    getQuestDesc(q) {
        if (!q) return "";
        const lang = this.currentLang;
        const floorName = this.getFloorName(q.floor);
        const targetMonster = q.targetName ? this.getMonsterName(q.targetName) : "";

        if (q.id === 0) {
            if (lang === 'es') return `Elimina a 10 monstruos en el Piso 1 (${floorName}).`;
            if (lang === 'en') return `Defeat 10 monsters on Floor 1 (${floorName}).`;
            return `清除第1层「${floorName}」的 10 只怪物。`;
        }
        if (q.id === 1) {
            if (lang === 'es') return `Derrota a la élite "${targetMonster}" en el Piso 2 (${floorName}).`;
            if (lang === 'en') return `Defeat elite monster "${targetMonster}" on Floor 2 (${floorName}).`;
            return `在第2层「${floorName}」击杀精英怪"${targetMonster}"。`;
        }
        if (q.id === 2) {
            if (lang === 'es') return `Elimina a 15 monstruos en el Piso 3 (${floorName}).`;
            if (lang === 'en') return `Defeat 15 monsters on Floor 3 (${floorName}).`;
            return `在第3层「${floorName}」击杀 15 只怪物。`;
        }
        if (q.id === 3) {
            if (lang === 'es') return `Derrota a "${targetMonster}" en el Piso 4 (${floorName}).`;
            if (lang === 'en') return `Defeat "${targetMonster}" on Floor 4 (${floorName}).`;
            return `在第4层「${floorName}」击杀"${targetMonster}"。`;
        }
        if (q.id === 4) {
            if (lang === 'es') return `Derrota a "${targetMonster}" en el Piso 5 (${floorName}).`;
            if (lang === 'en') return `Defeat "${targetMonster}" on Floor 5 (${floorName}).`;
            return `在第5层「${floorName}」击杀${targetMonster}。`;
        }
        if (q.id === 5) {
            if (lang === 'es') return `Elimina a 20 monstruos en el Piso 6 (${floorName}).`;
            if (lang === 'en') return `Defeat 20 monsters on Floor 6 (${floorName}).`;
            return `清除第6层「${floorName}」的 20 只怪物。`;
        }
        if (q.id === 6) {
            if (lang === 'es') return `Derrota a la élite "${targetMonster}" en el Piso 7 (${floorName}).`;
            if (lang === 'en') return `Defeat elite monster "${targetMonster}" on Floor 7 (${floorName}).`;
            return `在第7层「${floorName}」击杀精英怪"${targetMonster}"。`;
        }
        if (q.id === 7) {
            if (lang === 'es') return `Elimina a 25 monstruos en el Piso 8 (${floorName}).`;
            if (lang === 'en') return `Defeat 25 monsters on Floor 8 (${floorName}).`;
            return `在第8层「${floorName}」击杀 25 只怪物。`;
        }
        if (q.id === 8) {
            if (lang === 'es') return `Derrota a "${targetMonster}" en el Piso 9 (${floorName}).`;
            if (lang === 'en') return `Defeat "${targetMonster}" on Floor 9 (${floorName}).`;
            return `在第9层「${floorName}」击杀"${targetMonster}"。`;
        }
        if (q.id === 9) {
            if (lang === 'es') return `Derrota a ${targetMonster} en el Piso 10 (${floorName}) para salvar el mundo.`;
            if (lang === 'en') return `Defeat ${targetMonster} on Floor 10 (${floorName}) to save the world.`;
            return `在第10层「${floorName}」击败${targetMonster}，拯救世界。`;
        }

        // Misiones infinitas (10+)
        if (q.type === 'kill_boss' || q.type === 'kill_elite') {
            if (lang === 'es') return `Derrota a ${targetMonster} en el Piso ${q.floor} (${floorName}).`;
            if (lang === 'en') return `Defeat ${targetMonster} on Floor ${q.floor} (${floorName}).`;
            return `在第${q.floor}层「${floorName}」击杀${targetMonster}。`;
        } else {
            if (lang === 'es') return `Elimina a ${q.target || 20} monstruos en el Piso ${q.floor} (${floorName}).`;
            if (lang === 'en') return `Defeat ${q.target || 20} monsters on Floor ${q.floor} (${floorName}).`;
            return `在第${q.floor}层「${floorName}」击杀 ${q.target || 20} 只怪物。`;
        }
    },

    // Traducir recompensa de misión
    getQuestReward(reward) {
        if (!reward) return "";
        const lang = this.currentLang;
        const rewardMap = {
            '1 技能点': { es: '1 Punto de Habilidad', en: '1 Skill Point', zh: '1 技能点' },
            '2 技能点': { es: '2 Puntos de Habilidad', en: '2 Skill Points', zh: '2 技能点' },
            '稀有戒指': { es: 'Anillo Raro', en: 'Rare Ring', zh: '稀有戒指' },
            '500 金币': { es: '500 Oro', en: '500 Gold', zh: '500 金币' },
            '1000 金币': { es: '1000 Oro', en: '1000 Gold', zh: '1000 金币' },
            '随机符文': { es: 'Runa Aleatoria', en: 'Random Rune', zh: '随机符文' },
            '暗金装备': { es: 'Equipo Único', en: 'Unique Equipment', zh: '暗金装备' },
            '暗金饰品': { es: 'Accesorio Único', en: 'Unique Accessory', zh: '暗金饰品' },
            '传奇装备': { es: 'Equipo Legendario', en: 'Legendary Equipment', zh: '传奇装备' },
            '终极神装': { es: 'Reliquia Divina Final', en: 'Ultimate Divine Relic', zh: '终极神装' }
        };

        if (rewardMap[reward]) {
            return rewardMap[reward][lang] || rewardMap[reward].en;
        }

        let res = reward;
        if (lang === 'es') {
            res = res.replace('金币', ' Oro').replace('& 1 技能点', '& 1 Punto de Habilidad').replace('& 随机装备', '& Equipo Aleatorio');
        } else if (lang === 'en') {
            res = res.replace('金币', ' Gold').replace('& 1 技能点', '& 1 Skill Point').replace('& 随机装备', '& Random Equipment');
        }
        return res;
    }
};

// Auto-inicializar
I18N.init();

// Exportar globalmente
window.I18N = I18N;
