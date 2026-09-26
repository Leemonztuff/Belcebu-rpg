/**
 * season-system.js - 菠萝战纪 赛季与天梯征程系统
 * Sistema de Temporadas, Objetivos Estacionales, Títulos Exclusivos y Recompensas de Rango.
 */

const SeasonSystem = {
    // 当前赛季配置 (S1: 破晓之剑)
    CURRENT_SEASON: {
        id: 'S1',
        name: {
            es: 'Temporada 1: Espada del Alba',
            en: 'Season 1: Sword of Dawnbreak',
            zh: '第一赛季：破晓之剑'
        },
        themeIcon: '⚔️',
        startDate: '2026-09-01',
        endDate: '2026-10-31',
        buffDescription: {
            es: '⚡ Bendición de Temporada: +15% Daño de Fuego y Rayo en mazmorras.',
            en: '⚡ Season Blessing: +15% Fire & Lightning Damage in dungeons.',
            zh: '⚡ 赛季赐福：地牢中火系与雷电伤害提升 15%。'
        },
        elementalBonus: 0.15,
        milestones: [
            {
                id: 's1_reach_f10',
                name: { es: 'Alcanzar el Piso 10', en: 'Reach Floor 10', zh: '踏足第10层' },
                desc: { es: 'Explora y supera los primeros 10 pisos del calabozo.', en: 'Explore and conquer the first 10 floors.', zh: '深入探索并通关前10层。' },
                target: 10,
                type: 'floor',
                reward: { gold: 1000, title: '破晓先锋', points: 100 },
                claimed: false
            },
            {
                id: 's1_kill_elites',
                name: { es: 'Cazador de Élite', en: 'Elite Hunter', zh: '精英猎魔人' },
                desc: { es: 'Derrota a 20 monstruos élite con afijos.', en: 'Defeat 20 elite monsters with affixes.', zh: '讨伐 20 只具有随机词缀的精英魔物。' },
                target: 20,
                type: 'elite_kills',
                reward: { gold: 2000, runes: ['Tal', 'Ral'], points: 200 },
                claimed: false
            },
            {
                id: 's1_craft_runeword',
                name: { es: 'Forjador de Runas', en: 'Runeword Crafter', zh: '符文工匠' },
                desc: { es: 'Engarza y crea al menos 1 Palabra Rúnica antigua.', en: 'Socket and craft at least 1 ancient Runeword.', zh: '成功镶嵌并激活至少 1 件远古符文之语。' },
                target: 1,
                type: 'runeword',
                reward: { gold: 3000, skillPoints: 1, points: 300 },
                claimed: false
            },
            {
                id: 's1_reach_f20',
                name: { es: 'Conquistador de la Oscuridad', en: 'Conqueror of Darkness', zh: '深渊征服者' },
                desc: { es: 'Alcanza el Piso 20 o supera la Prueba de Abismo.', en: 'Reach Floor 20 or conquer Trial Abyss.', zh: '达到第20层或完成深渊试炼。' },
                target: 20,
                type: 'floor',
                reward: { gold: 5000, title: '破晓征服者', skillPoints: 2, frame: 'season-border-gold', points: 500 },
                claimed: false
            }
        ]
    },

    modalId: 'season-modal',

    init() {
        this.injectModal();
    },

    injectModal() {
        if (document.getElementById(this.modalId)) return;

        const overlay = document.createElement('div');
        overlay.id = this.modalId;
        overlay.className = 'season-modal-overlay';
        overlay.style.display = 'none';
        overlay.onmousedown = (e) => {
            if (e.target === overlay) this.close();
        };

        overlay.innerHTML = `
            <div class="season-panel" onmousedown="event.stopPropagation()">
                <div class="season-header">
                    <div class="season-title-box">
                        <span class="season-badge" id="season-badge-tag">S1</span>
                        <div>
                            <h2 id="season-title-text">${I18N.trPath('season', 'season_1_name', 'label', this.CURRENT_SEASON.name.zh)}</h2>
                            <p class="season-buff-info" id="season-buff-text"></p>
                        </div>
                    </div>
                    <button class="season-close-btn" onclick="SeasonSystem.close()">✕</button>
                </div>
                <div class="season-body">
                    <div class="season-progress-overview">
                        <div class="season-score-display">
                            <span class="season-score-label" data-i18n="season_points">赛季积分</span>
                            <span class="season-score-val" id="season-current-points">0</span>
                        </div>
                        <div class="season-countdown" id="season-countdown-text">
                            ⏳ 剩余时间: 35 天
                        </div>
                    </div>
                    <div class="season-milestones-title" data-i18n="season_milestones_title">🏆 赛季征程目标</div>
                    <div class="season-milestones-list" id="season-milestones-list">
                        <!-- 动态里程碑任务 -->
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    },

    open() {
        if (!player) return;
        this.injectModal();
        this.ensurePlayerData();
        this.renderPanel();
        const overlay = document.getElementById(this.modalId);
        if (overlay) overlay.style.display = 'flex';
    },

    close() {
        const overlay = document.getElementById(this.modalId);
        if (overlay) overlay.style.display = 'none';
    },

    ensurePlayerData() {
        if (!player.seasonData) {
            player.seasonData = {
                seasonId: this.CURRENT_SEASON.id,
                points: 0,
                eliteKills: 0,
                runewordsCrafted: 0,
                claimedMilestones: {}
            };
        }
        if (player.seasonData.seasonId !== this.CURRENT_SEASON.id) {
            // 新赛季重置
            player.seasonData = {
                seasonId: this.CURRENT_SEASON.id,
                points: 0,
                eliteKills: 0,
                runewordsCrafted: 0,
                claimedMilestones: {}
            };
        }
    },

    trackEliteKill() {
        if (!player) return;
        this.ensurePlayerData();
        player.seasonData.eliteKills = (player.seasonData.eliteKills || 0) + 1;
        this.checkMilestonesAutoNotify();
    },

    trackRunewordCrafted() {
        if (!player) return;
        this.ensurePlayerData();
        player.seasonData.runewordsCrafted = (player.seasonData.runewordsCrafted || 0) + 1;
        this.checkMilestonesAutoNotify();
    },

    checkMilestonesAutoNotify() {
        this.ensurePlayerData();
        const maxFloor = player.highestFloor || player.maxFloor || player.floor || 1;
        const sd = player.seasonData;

        this.CURRENT_SEASON.milestones.forEach(m => {
            if (sd.claimedMilestones[m.id]) return;
            let current = 0;
            if (m.type === 'floor') current = maxFloor;
            else if (m.type === 'elite_kills') current = sd.eliteKills || 0;
            else if (m.type === 'runeword') current = sd.runewordsCrafted || 0;

            if (current >= m.target && !m.notified) {
                m.notified = true;
                const lang = (typeof I18N !== 'undefined') ? I18N.currentLang : 'zh';
                const name = m.name[lang] || m.name.zh;
                if (typeof showNotification === 'function') {
                    showNotification(`🏆 ${lang === 'es' ? '¡Hito de Temporada Completado:' : '赛季征程目标达成：'} ${name}`);
                }
            }
        });
    },

    claimReward(milestoneId) {
        this.ensurePlayerData();
        const m = this.CURRENT_SEASON.milestones.find(x => x.id === milestoneId);
        if (!m || player.seasonData.claimedMilestones[milestoneId]) return;

        const maxFloor = player.highestFloor || player.maxFloor || player.floor || 1;
        const sd = player.seasonData;
        let current = 0;
        if (m.type === 'floor') current = maxFloor;
        else if (m.type === 'elite_kills') current = sd.eliteKills || 0;
        else if (m.type === 'runeword') current = sd.runewordsCrafted || 0;

        if (current < m.target) return;

        // 标记已领取
        sd.claimedMilestones[milestoneId] = true;
        sd.points = (sd.points || 0) + (m.reward.points || 100);

        // 发放奖励
        if (m.reward.gold) {
            player.gold = (player.gold || 0) + m.reward.gold;
        }
        if (m.reward.skillPoints) {
            player.skillPoints = (player.skillPoints || 0) + m.reward.skillPoints;
        }
        if (m.reward.title) {
            player.titles = player.titles || [];
            if (!player.titles.includes(m.reward.title)) {
                player.titles.push(m.reward.title);
            }
            player.currentTitle = m.reward.title;
        }
        if (m.reward.frame) {
            player.avatarFrame = m.reward.frame;
        }
        if (m.reward.runes && typeof generateItem === 'function') {
            m.reward.runes.forEach(rName => {
                if (typeof RUNES_DATA !== 'undefined' && RUNES_DATA[rName]) {
                    const runeItem = {
                        name: RUNES_DATA[rName].name,
                        type: 'rune',
                        runeId: rName,
                        rarity: 'magic',
                        desc: RUNES_DATA[rName].weaponStatsDesc
                    };
                    if (player.inventory && player.inventory.length < (player.inventorySlots || 30)) {
                        player.inventory.push(runeItem);
                    }
                }
            });
        }

        const lang = (typeof I18N !== 'undefined') ? I18N.currentLang : 'zh';
        if (typeof showNotification === 'function') {
            showNotification(`🎁 ${lang === 'es' ? '¡Recompensa de Temporada Reclamada!' : '赛季奖励已领取！'}`);
        }
        if (typeof playSound === 'function') playSound('levelUp');
        if (typeof updateUI === 'function') updateUI();

        this.renderPanel();
    },

    renderPanel() {
        this.ensurePlayerData();
        const lang = (typeof I18N !== 'undefined') ? I18N.currentLang : 'zh';
        const season = this.CURRENT_SEASON;

        const titleEl = document.getElementById('season-title-text');
        const buffEl = document.getElementById('season-buff-text');
        const pointsEl = document.getElementById('season-current-points');
        const listEl = document.getElementById('season-milestones-list');

        if (titleEl) titleEl.textContent = I18N.trPath('season', 'season_1_name', 'label', season.name.zh);
        if (buffEl) buffEl.textContent = I18N.trPath('season', 'season_1_buff', 'label', season.buffDescription.zh);
        if (pointsEl) pointsEl.textContent = player.seasonData.points || 0;

        if (listEl) {
            listEl.innerHTML = '';
            const maxFloor = player.highestFloor || player.maxFloor || player.floor || 1;
            const sd = player.seasonData;

            season.milestones.forEach(m => {
                let current = 0;
                if (m.type === 'floor') current = maxFloor;
                else if (m.type === 'elite_kills') current = sd.eliteKills || 0;
                else if (m.type === 'runeword') current = sd.runewordsCrafted || 0;

                const progress = Math.min(current, m.target);
                const isComplete = current >= m.target;
                const isClaimed = !!sd.claimedMilestones[m.id];
                // 里程碑名称/说明统一走 season 表，CURRENT_SEASON 里的多语言对象保留为兜底
                const mNameKey = 'milestone_' + m.id + '_name';
                const mDescKey = 'milestone_' + m.id + '_desc';
                const mTitleKey = 'title_' + m.id;
                const name = I18N.trPath('season', mNameKey, 'label', m.name.zh);
                const desc = I18N.trPath('season', mDescKey, 'label', m.desc.zh);

                const itemDiv = document.createElement('div');
                itemDiv.className = `season-milestone-card ${isClaimed ? 'claimed' : (isComplete ? 'completed' : '')}`;

                let rewardDesc = `💰 ${m.reward.gold || 0}`;
                // 奖励称号按授予它的里程碑 id 查表，存档里仍保存中文字符串
                if (m.reward.title) rewardDesc += ` • 👑 [${I18N.trPath('season', mTitleKey, 'label', m.reward.title)}]`;
                if (m.reward.skillPoints) rewardDesc += ` • ✨ ${m.reward.skillPoints} ${lang === 'es' ? 'Pts Habilidad' : '技能点'}`;
                if (m.reward.frame) rewardDesc += ` • 🖼️ ${lang === 'es' ? 'Marco Exclusivo' : '限定头像框'}`;

                let btnHtml = '';
                if (isClaimed) {
                    btnHtml = `<button class="season-claim-btn claimed" disabled>${lang === 'es' ? 'Reclamado' : '已领取'}</button>`;
                } else if (isComplete) {
                    btnHtml = `<button class="season-claim-btn ready" onclick="SeasonSystem.claimReward('${m.id}')">${lang === 'es' ? 'Reclamar' : '领取奖励'}</button>`;
                } else {
                    btnHtml = `<div class="season-progress-pill">${progress} / ${m.target}</div>`;
                }

                itemDiv.innerHTML = `
                    <div class="milestone-info">
                        <div class="milestone-name">${name}</div>
                        <div class="milestone-desc">${desc}</div>
                        <div class="milestone-rewards">${rewardDesc}</div>
                    </div>
                    <div class="milestone-action">
                        ${btnHtml}
                    </div>
                `;

                listEl.appendChild(itemDiv);
            });
        }
    }
};

window.SeasonSystem = SeasonSystem;
