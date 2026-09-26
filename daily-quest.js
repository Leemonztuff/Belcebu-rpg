// ========== 每日任务系统 ==========
// 链式解锁：完成一个才显示下一个
// 目标数值根据玩家等级动态计算

const DailyQuestSystem = {
    // 倒计时定时器
    _countdownTimer: null,

    // 启动倒计时定时器
    startCountdown() {
        this.stopCountdown();
        this._countdownTimer = setInterval(() => {
            if (this.checkAndReset()) {
                this.updateUI();
                this.updateTracker();
                if (typeof updateMenuIndicators === 'function') updateMenuIndicators();
                return;
            }
            const el = document.getElementById('daily-quest-countdown');
            if (el) {
                el.textContent = this.getResetTime();
            } else {
                this.stopCountdown();
            }
        }, 1000);
    },

    // 停止倒计时定时器
    stopCountdown() {
        if (this._countdownTimer) {
            clearInterval(this._countdownTimer);
            this._countdownTimer = null;
        }
    },

    // 任务模板（目标值用函数计算）
    // desc 保留中文原文，写入存档并作为 dailyQuests 表缺失时的兜底；展示时统一走 I18N.trPath('dailyQuests', type, 'desc', ...)
    // 简单任务
    EASY_TEMPLATES: [
        { type: 'kill', calcTarget: lvl => 50 + lvl * 10, desc: lvl => `击杀${50 + lvl * 10}只怪物`, rewardMult: 1 },
        { type: 'collect_gold', calcTarget: lvl => 200 + lvl * 50, desc: lvl => `收集${200 + lvl * 50}金币`, rewardMult: 0.8 },
        { type: 'collect_item', calcTarget: lvl => 5 + Math.floor(lvl / 3), desc: lvl => `拾取${5 + Math.floor(lvl / 3)}件装备`, rewardMult: 1 },
        { type: 'use_potion', calcTarget: lvl => 2 + Math.floor(lvl / 5), desc: lvl => `使用${2 + Math.floor(lvl / 5)}瓶药水`, rewardMult: 0.8 },
    ],

    // 中等任务
    MEDIUM_TEMPLATES: [
        { type: 'kill', calcTarget: lvl => 150 + lvl * 20, desc: lvl => `击杀${150 + lvl * 20}只怪物`, rewardMult: 1.5 },
        { type: 'kill_elite', calcTarget: lvl => 3 + Math.floor(lvl / 5), desc: lvl => `击杀${3 + Math.floor(lvl / 5)}只精英怪`, rewardMult: 1.8 },
        { type: 'kill_boss', calcTarget: lvl => 1 + Math.floor(lvl / 10), desc: lvl => `击杀${1 + Math.floor(lvl / 10)}个BOSS`, rewardMult: 2 },
        { type: 'collect_gold', calcTarget: lvl => 800 + lvl * 100, desc: lvl => `收集${800 + lvl * 100}金币`, rewardMult: 1.2 },
    ],

    // 困难任务（奖励技能点）
    HARD_TEMPLATES: [
        { type: 'kill', calcTarget: lvl => 300 + lvl * 30, desc: lvl => `击杀${300 + lvl * 30}只怪物`, rewardMult: 2 },
        { type: 'kill_elite', calcTarget: lvl => 8 + Math.floor(lvl / 3), desc: lvl => `击杀${8 + Math.floor(lvl / 3)}只精英怪`, rewardMult: 2.2 },
        { type: 'kill_boss', calcTarget: lvl => 3 + Math.floor(lvl / 5), desc: lvl => `击杀${3 + Math.floor(lvl / 5)}个BOSS`, rewardMult: 2.5 },
        { type: 'clear_floor', calcTarget: lvl => 3 + Math.floor(lvl / 5), desc: lvl => `通关${3 + Math.floor(lvl / 5)}层地牢`, rewardMult: 2 },
    ],

    // 根据等级计算奖励
    calcReward(lvl, mult, isHard = false) {
        const baseGold = 50 + lvl * 20;
        const baseXp = 30 + lvl * 15;
        return {
            gold: Math.floor(baseGold * mult),
            xp: Math.floor(baseXp * mult),
            ...(isHard ? { skillPoint: 1 } : {})
        };
    },

    // 获取今日日期字符串
    getTodayStr() {
        return getTodayDateString();
    },

    // 初始化/检查重置
    checkAndReset() {
        const today = this.getTodayStr();
        const lvl = player.lvl || 1;

        // 初始化或重置
        if (!player.dailyQuests || player.dailyQuests.date !== today) {
            player.dailyQuests = {
                date: today,
                generatedAtLevel: lvl,
                quests: this.generateQuests(lvl)
            };
            console.log('[每日任务] 已重置:', player.dailyQuests);
            return true;
        }
        return false;
    },

    // 生成每日任务
    generateQuests(lvl) {
        const pick = arr => arr[Math.floor(Math.random() * arr.length)];

        const easy = pick(this.EASY_TEMPLATES);
        const medium = pick(this.MEDIUM_TEMPLATES);
        const hard = pick(this.HARD_TEMPLATES);

        return [
            {
                id: 0, type: easy.type,
                target: easy.calcTarget(lvl),
                desc: easy.desc(lvl),
                reward: this.calcReward(lvl, easy.rewardMult),
                progress: 0, completed: false, claimed: false, unlocked: true
            },
            {
                id: 1, type: medium.type,
                target: medium.calcTarget(lvl),
                desc: medium.desc(lvl),
                reward: this.calcReward(lvl, medium.rewardMult),
                progress: 0, completed: false, claimed: false, unlocked: false
            },
            {
                id: 2, type: hard.type,
                target: hard.calcTarget(lvl),
                desc: hard.desc(lvl),
                reward: this.calcReward(lvl, hard.rewardMult, true),
                progress: 0, completed: false, claimed: false, unlocked: false
            }
        ];
    },

    // 获取当前活跃的任务
    getCurrentQuest() {
        this.checkAndReset();
        if (!player.dailyQuests || !player.dailyQuests.quests) return null;
        return player.dailyQuests.quests.find(q => q.unlocked && !q.claimed);
    },

    // 检查是否有可领取的奖励
    hasClaimableReward() {
        this.checkAndReset();
        if (!player.dailyQuests || !player.dailyQuests.quests) return false;
        return player.dailyQuests.quests.some(q => q.completed && !q.claimed);
    },

    // 更新任务进度
    updateProgress(type, amount = 1) {
        this.checkAndReset();
        if (!player.dailyQuests || !player.dailyQuests.quests) return;

        const currentQuest = this.getCurrentQuest();
        if (!currentQuest || currentQuest.type !== type || currentQuest.completed) return;

        currentQuest.progress = Math.min(currentQuest.progress + amount, currentQuest.target);

        if (currentQuest.progress >= currentQuest.target) {
            currentQuest.completed = true;
            showNotification('📋 每日任务完成！');
            AudioSys.play('quest');
            if (typeof updateMenuIndicators === 'function') updateMenuIndicators();
        }

        this.updateUI();
        this.updateTracker();
    },

    // 领取任务奖励并解锁下一个
    claimReward(questId) {
        if (this.checkAndReset()) {
            this.updateUI();
            this.updateTracker();
            if (typeof updateMenuIndicators === 'function') updateMenuIndicators();
            return;
        }
        if (!player.dailyQuests || !player.dailyQuests.quests) return;

        const quest = player.dailyQuests.quests.find(q => q.id === questId);
        if (!quest || !quest.completed || quest.claimed) return;

        let offsetY = 0;
        if (quest.reward.gold) {
            player.gold += quest.reward.gold;
            createDamageNumber(player.x, player.y - 40 + offsetY, `+${quest.reward.gold}G`, 'gold');
            offsetY -= 25;
        }
        if (quest.reward.xp) {
            player.xp += quest.reward.xp;
            checkLevelUp();
            createDamageNumber(player.x, player.y - 40 + offsetY, `+${quest.reward.xp}XP`, '#4d69cd');
            offsetY -= 25;
        }
        if (quest.reward.skillPoint) {
            player.skillPoints += quest.reward.skillPoint;
            createDamageNumber(player.x, player.y - 40 + offsetY, `+${quest.reward.skillPoint}技能点`, '#ff88ff');
            showNotification('🎉 获得技能点！');
        }

        quest.claimed = true;

        // 解锁下一个任务
        const nextQuest = player.dailyQuests.quests.find(q => !q.unlocked);
        if (nextQuest) {
            nextQuest.unlocked = true;
            showNotification('📋 新的每日任务已解锁！');
        }

        AudioSys.play('sell');
        this.updateUI();
        this.updateTracker();
        updateUI();
        if (typeof updateMenuIndicators === 'function') updateMenuIndicators();
    },

    // 重置时间倒计时
    getResetTime() {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0); // 下一个午夜
        const diff = midnight - now;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const hh = String(hours).padStart(2, '0');
        const mm = String(minutes).padStart(2, '0');
        const ss = String(seconds).padStart(2, '0');

        return I18N.t('dq_reset_in', { time: `${hh}:${mm}:${ss}` });
    },

    // 更新任务面板UI
    updateUI() {
        this.checkAndReset();
        if (!player.dailyQuests || !player.dailyQuests.quests) return;

        let container = document.getElementById('daily-quest-section');
        if (!container) {
            const questList = document.getElementById('quest-list');
            if (!questList) return;
            container = document.createElement('div');
            container.id = 'daily-quest-section';
            container.style.cssText = 'margin-top:20px; border-top:1px solid #4a3b2a; padding-top:15px;';
            questList.appendChild(container);
        }

        const quests = player.dailyQuests.quests;
        const completedCount = quests.filter(q => q.claimed).length;

        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <span style="color:#c7b377; font-size:14px;">📋 ${I18N.t('dq_title')} (${completedCount}/3)</span>
                <span id="daily-quest-countdown" style="color:#888; font-size:11px;">${this.getResetTime()}</span>
            </div>
        `;

        quests.forEach((q, idx) => {
            const isLocked = !q.unlocked;
            const statusColor = q.claimed ? '#666' : (q.completed ? '#88ff88' : (isLocked ? '#555' : '#fff'));
            const bgColor = q.claimed ? 'rgba(0,0,0,0.3)' : (isLocked ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.5)');

            let rewardText = [];
            if (q.reward.gold) rewardText.push(`${q.reward.gold}G`);
            if (q.reward.xp) rewardText.push(`${q.reward.xp}XP`);
            if (q.reward.skillPoint) rewardText.push(`${q.reward.skillPoint}技能点`);

            if (isLocked) {
                html += `
                    <div style="background:${bgColor}; border:1px solid #2a2a2a; padding:8px 10px; margin-bottom:6px; border-radius:4px; opacity:0.6;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="color:#555; font-size:13px;">${I18N.t('dq_locked')}</span>
                            <span style="color:#555; font-size:12px;">${rewardText.join(' ')}</span>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div style="background:${bgColor}; border:1px solid #3a3a3a; padding:8px 10px; margin-bottom:6px; border-radius:4px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="color:${statusColor}; font-size:13px;">${q.claimed ? '✓ ' : ''}${I18N.trPath('dailyQuests', q.type, 'desc', q.desc, { target: q.target })}</span>
                            ${q.completed && !q.claimed
                                ? `<button onclick="DailyQuestSystem.claimReward(${q.id})" style="background:#4a7c4a; color:#fff; border:none; padding:4px 10px; border-radius:3px; cursor:pointer; font-size:12px;">${I18N.t('btn_claim')}</button>`
                                : `<span style="color:#888; font-size:12px;">${rewardText.join(' ')}</span>`
                            }
                        </div>
                        ${!q.claimed ? `<div style="color:#aaa; font-size:11px; margin-top:4px;">${I18N.t('quest_progress')}: ${q.progress}/${q.target}</div>` : ''}
                    </div>
                `;
            }
        });

        // 渲染每日全勤宝箱 (留存优化 3.3)
        if (completedCount === 3) {
            const chestClaimed = player.dailyQuests.chestClaimed;
            html += `
                <div class="daily-master-chest-card" style="margin-top:12px; background:linear-gradient(135deg, rgba(212,175,55,0.2), rgba(0,0,0,0.6)); border:1px solid #d4af37; border-radius:6px; padding:10px; text-align:center;">
                    <div style="color:#ffd700; font-size:14px; font-weight:bold; margin-bottom:4px;">🎁 今日全勤宝箱 (Daily Master Chest)</div>
                    <div style="color:#bbb; font-size:11px; margin-bottom:8px;">完成全部3项每日任务的终极嘉奖：必出稀有/暗金装备 + 金币 + 概率符文</div>
                    ${chestClaimed
                        ? `<div style="color:#888; font-size:12px;">✓ 今日宝箱已领取 (明日刷新)</div>`
                        : `<button onclick="DailyQuestSystem.claimDailyChest()" style="background:linear-gradient(to bottom, #d4af37, #aa8020); color:#000; font-weight:bold; border:1px solid #ffd700; padding:6px 16px; border-radius:4px; cursor:pointer; font-size:13px; box-shadow:0 0 8px rgba(255,215,0,0.5);">开启今日全勤宝箱</button>`
                    }
                </div>
            `;
        }

        // 渲染周常目标模块 (留存优化 3.6)
        if (typeof WeeklyGoalSystem !== 'undefined') {
            WeeklyGoalSystem.checkAndReset();
            const wGoals = player.weeklyGoals ? player.weeklyGoals.goals : [];
            if (wGoals.length > 0) {
                html += `
                    <div style="margin-top:16px; border-top:1px solid #4a3b2a; padding-top:12px;">
                        <div style="color:#c7b377; font-size:14px; margin-bottom:8px;">🏆 周常目标 (每周一刷新)</div>
                `;
                wGoals.forEach(g => {
                    const statusColor = g.claimed ? '#666' : (g.completed ? '#88ff88' : '#fff');
                    const bgColor = g.claimed ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.5)';
                    let rText = [];
                    if (g.reward.gold) rText.push(`${g.reward.gold}G`);
                    if (g.reward.xp) rText.push(`${g.reward.xp}XP`);
                    if (g.reward.skillPoints) rText.push(`${g.reward.skillPoints}技能点`);
                    if (g.reward.item === 'unique') rText.push(`随机暗金`);
                    // 周常键为 weekly_<goalId>，存活的 desc 作兜底
                    const wKey = 'weekly_' + g.id;

                    html += `
                        <div style="background:${bgColor}; border:1px solid #3a3a3a; padding:8px 10px; margin-bottom:6px; border-radius:4px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="color:${statusColor}; font-size:13px;">${g.claimed ? '✓ ' : ''}${I18N.trPath('dailyQuests', wKey, 'desc', g.desc)}</span>
                                ${g.completed && !g.claimed
                                    ? `<button onclick="WeeklyGoalSystem.claimReward('${g.id}')" style="background:#d4af37; color:#000; font-weight:bold; border:none; padding:4px 10px; border-radius:3px; cursor:pointer; font-size:12px;">${I18N.t('btn_claim')}</button>`
                                    : `<span style="color:#888; font-size:12px;">${rText.join(' ')}</span>`
                                }
                            </div>
                            ${!g.claimed ? `<div style="color:#aaa; font-size:11px; margin-top:4px;">${I18N.t('quest_progress')}: ${g.progress}/${g.target}</div>` : ''}
                        </div>
                    `;
                });
                html += `</div>`;
            }
        }

        container.innerHTML = html;
        this.startCountdown();
    },

    // 领取每日全勤宝箱 (留存优化 3.3)
    claimDailyChest() {
        if (!player.dailyQuests || player.dailyQuests.chestClaimed) return;
        const allClaimed = player.dailyQuests.quests.every(q => q.claimed);
        if (!allClaimed) return;

        player.dailyQuests.chestClaimed = true;
        const lvl = player.lvl || 1;

        // 1. 金币奖励 (等级 * 50)
        const goldReward = lvl * 50;
        addGold(goldReward);
        createDamageNumber(player.x, player.y - 40, `+${goldReward} G`, 'gold');

        // 2. 必出一件稀有/暗金装备
        const isUnique = Math.random() < 0.30;
        let chestItem = null;
        if (typeof createItem === 'function') {
            chestItem = createItem(null, Math.max(1, player.floor || 1));
            chestItem.rarity = isUnique ? RARITY.UNIQUE : RARITY.RARE;
            if (chestItem.rarity === RARITY.UNIQUE) {
                chestItem.displayName = "暗金·" + chestItem.name;
                chestItem.stats.allSkills = (chestItem.stats.allSkills || 0) + 1;
                chestItem.stats.dmgPct = (chestItem.stats.dmgPct || 0) + 50;
                chestItem.stats.lifeSteal = (chestItem.stats.lifeSteal || 0) + 5;
            }
            addItemToInventory(chestItem);
        }

        // 3. 概率获得符文
        if (Math.random() < 0.40 && typeof createRuneItem === 'function') {
            const runeKeys = ['tal', 'ral', 'ort', 'thul', 'amn'];
            const rune = createRuneItem(runeKeys[Math.floor(Math.random() * runeKeys.length)]);
            if (rune) addItemToInventory(rune);
        }

        const lang = (typeof I18N !== 'undefined' && I18N.currentLang) ? I18N.currentLang : 'zh';
        let msg = `🎁 开启每日全勤宝箱！获得 ${goldReward} 金币与 ${chestItem ? chestItem.displayName : '稀有装备'}`;
        if (lang === 'es') msg = `🎁 ¡Cofre Diario abierto! ${goldReward} Oro y ${chestItem ? chestItem.displayName : 'Equipo Raro'}`;
        else if (lang === 'en') msg = `🎁 Opened Daily Master Chest! ${goldReward} Gold & ${chestItem ? chestItem.displayName : 'Rare Gear'}`;

        if (typeof showNotification === 'function') showNotification(msg, 'gold');
        if (typeof AudioSys !== 'undefined' && AudioSys.play) AudioSys.play('quest');
        if (typeof triggerScreenShake === 'function') triggerScreenShake(6, 0.2);

        this.updateUI();
        this.updateTracker();
        if (typeof updateUI === 'function') updateUI();
        if (typeof renderInventory === 'function') renderInventory();
        if (typeof SaveSystem !== 'undefined' && SaveSystem.save) SaveSystem.save(true);
    },

    // 更新左上角追踪器
    updateTracker() {
        this.checkAndReset();
        if (!player.dailyQuests || !player.dailyQuests.quests) return;

        const el = document.getElementById('quest-tracker');
        if (!el) return;

        let dailyTracker = document.getElementById('daily-quest-tracker');
        if (!dailyTracker) {
            dailyTracker = document.createElement('div');
            dailyTracker.id = 'daily-quest-tracker';
            el.appendChild(dailyTracker);
        }

        const currentQuest = this.getCurrentQuest();

        if (!currentQuest) {
            const allClaimed = player.dailyQuests.quests.every(q => q.claimed);
            dailyTracker.innerHTML = allClaimed
                ? `<div style="margin-bottom:8px;"><span style="color:#88ff88; font-size:12px;">✓ 今日任务已完成</span></div>`
                : `<div style="margin-bottom:8px;"><span style="color:#ffcc00; font-size:12px;">🎁 有奖励可领取！</span></div>`;
            return;
        }

        const isDone = currentQuest.completed;
        dailyTracker.innerHTML = `
            <div style="margin-bottom:8px;">
                <span style="color:${isDone ? '#88ff88' : '#c7b377'}; font-size:12px;">${isDone ? '✓ ' : '📋 '}${I18N.trPath('dailyQuests', currentQuest.type, 'desc', currentQuest.desc, { target: currentQuest.target })}</span><br>
                <span style="color:#aaa; font-size:11px;">${I18N.t('quest_progress')}: ${currentQuest.progress}/${currentQuest.target}</span>
            </div>
        `;
    }
};

window.DailyQuestSystem = DailyQuestSystem;

// ========== 周常目标系统 (Weekly Goals System - 留存优化 3.6) ==========
const WeeklyGoalSystem = {
    getWeekKey() {
        const d = new Date();
        const year = d.getFullYear();
        const date = new Date(d.getTime());
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        const week1 = new Date(date.getFullYear(), 0, 4);
        const weekNum = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
        return `${year}-W${weekNum}`;
    },

    checkAndReset() {
        if (!player) return false;
        const weekKey = this.getWeekKey();
        if (!player.weeklyGoals || player.weeklyGoals.weekKey !== weekKey) {
            const maxF = Math.max(player.maxFloor || 1, player.floor || 1);
            player.weeklyGoals = {
                weekKey: weekKey,
                goals: [
                    { id: 'kill_500', type: 'kill', target: 500, progress: 0, completed: false, claimed: false, desc: '击杀 500 只怪物', reward: { gold: 500, xp: 1000 } },
                    { id: 'collect_rares', type: 'collect_rares', target: 5, progress: 0, completed: false, claimed: false, desc: '收集 5 件稀有/暗金装备', reward: { item: 'unique' } },
                    { id: 'reach_floor_15', type: 'reach_floor', target: 15, progress: maxF, completed: maxF >= 15, claimed: false, desc: '在地牢中到达第 15 层', reward: { skillPoints: 2 } }
                ]
            };
            return true;
        }
        return false;
    },

    onMonsterKilled() {
        this.checkAndReset();
        if (!player.weeklyGoals) return;
        const g = player.weeklyGoals.goals.find(it => it.id === 'kill_500');
        if (g && !g.completed) {
            g.progress++;
            if (g.progress >= g.target) {
                g.progress = g.target;
                g.completed = true;
                if (typeof showNotification === 'function') showNotification('🏆 周常目标【怪物清剿】已达成！', 'gold');
            }
        }
    },

    onRareItemFound() {
        this.checkAndReset();
        if (!player.weeklyGoals) return;
        const g = player.weeklyGoals.goals.find(it => it.id === 'collect_rares');
        if (g && !g.completed) {
            g.progress++;
            if (g.progress >= g.target) {
                g.progress = g.target;
                g.completed = true;
                if (typeof showNotification === 'function') showNotification('🏆 周常目标【珍品收集】已达成！', 'gold');
            }
        }
    },

    onFloorReached(floor) {
        this.checkAndReset();
        if (!player.weeklyGoals) return;
        const g = player.weeklyGoals.goals.find(it => it.id === 'reach_floor_15');
        if (g && !g.completed) {
            g.progress = Math.max(g.progress, floor);
            if (g.progress >= g.target) {
                g.progress = g.target;
                g.completed = true;
                if (typeof showNotification === 'function') showNotification('🏆 周常目标【勇闯深渊】已达成！', 'gold');
            }
        }
    },

    claimReward(goalId) {
        this.checkAndReset();
        if (!player.weeklyGoals) return;
        const g = player.weeklyGoals.goals.find(it => it.id === goalId);
        if (!g || !g.completed || g.claimed) return;

        g.claimed = true;
        if (g.reward.gold) {
            if (typeof addGold === 'function') addGold(g.reward.gold);
            else player.gold = (player.gold || 0) + g.reward.gold;
            if (typeof createDamageNumber === 'function') createDamageNumber(player.x, player.y - 40, `+${g.reward.gold} G`, 'gold');
        }
        if (g.reward.xp) {
            player.xp += g.reward.xp;
            if (typeof checkLevelUp === 'function') checkLevelUp();
        }
        if (g.reward.skillPoints) {
            player.skillPoints += g.reward.skillPoints;
            if (typeof showNotification === 'function') showNotification(`🎉 获得 ${g.reward.skillPoints} 技能点！`, 'gold');
        }
        if (g.reward.item === 'unique' && typeof createItem === 'function') {
            const u = createItem(null, Math.max(1, player.floor || 1));
            u.rarity = RARITY.UNIQUE;
            u.displayName = "暗金·" + u.name;
            u.stats.allSkills = (u.stats.allSkills || 0) + 1;
            u.stats.dmgPct = (u.stats.dmgPct || 0) + 50;
            if (typeof addItemToInventory === 'function') addItemToInventory(u);
            if (typeof showNotification === 'function') showNotification(`🎁 周常奖励：获得暗金装备【${u.displayName}】！`, 'gold');
        }

        if (typeof AudioSys !== 'undefined' && AudioSys.play) AudioSys.play('quest');
        DailyQuestSystem.updateUI();
        if (typeof updateUI === 'function') updateUI();
        if (typeof renderInventory === 'function') renderInventory();
        if (typeof SaveSystem !== 'undefined' && SaveSystem.save) SaveSystem.save(true);
    }
};

window.WeeklyGoalSystem = WeeklyGoalSystem;

