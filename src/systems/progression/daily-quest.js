// ========== Daily quest system ==========
// Chained unlock: finish one before the next shows
// Target values scale dynamically with player level

const DailyQuestSystem = {
// Countdown timer
    _countdownTimer: null,

// Start the countdown timer
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

// Stop the countdown timer
    stopCountdown() {
        if (this._countdownTimer) {
            clearInterval(this._countdownTimer);
            this._countdownTimer = null;
        }
    },

// Quest templates (targets computed by functions)
    // desc keeps the original text for saves and as dailyQuests fallback; display always goes through I18N.trPath('dailyQuests', type, 'desc', ...)
// Simple quest
    EASY_TEMPLATES: [
        { type: 'kill', calcTarget: lvl => 50 + lvl * 10, desc: lvl => `Slay ${50 + lvl * 10} monsters`, rewardMult: 1 },
        { type: 'collect_gold', calcTarget: lvl => 200 + lvl * 50, desc: lvl => `Collect ${200 + lvl * 50} gold`, rewardMult: 0.8 },
        { type: 'collect_item', calcTarget: lvl => 5 + Math.floor(lvl / 3), desc: lvl => `Pick up ${5 + Math.floor(lvl / 3)} items`, rewardMult: 1 },
        { type: 'use_potion', calcTarget: lvl => 2 + Math.floor(lvl / 5), desc: lvl => `Use ${2 + Math.floor(lvl / 5)} potions`, rewardMult: 0.8 },
    ],

    // inetc.quest
    MEDIUM_TEMPLATES: [
        { type: 'kill', calcTarget: lvl => 150 + lvl * 20, desc: lvl => `Slay ${150 + lvl * 20} monsters`, rewardMult: 1.5 },
        { type: 'kill_elite', calcTarget: lvl => 3 + Math.floor(lvl / 5), desc: lvl => `Slay ${3 + Math.floor(lvl / 5)} elite monsters`, rewardMult: 1.8 },
        { type: 'kill_boss', calcTarget: lvl => 1 + Math.floor(lvl / 10), desc: lvl => `Slay ${1 + Math.floor(lvl / 10)} bosses`, rewardMult: 2 },
        { type: 'collect_gold', calcTarget: lvl => 800 + lvl * 100, desc: lvl => `Collect ${800 + lvl * 100} gold`, rewardMult: 1.2 },
    ],

// Hard quest (skill point reward)
    HARD_TEMPLATES: [
        { type: 'kill', calcTarget: lvl => 300 + lvl * 30, desc: lvl => `Slay ${300 + lvl * 30} monsters`, rewardMult: 2 },
        { type: 'kill_elite', calcTarget: lvl => 8 + Math.floor(lvl / 3), desc: lvl => `Slay ${8 + Math.floor(lvl / 3)} elite monsters`, rewardMult: 2.2 },
        { type: 'kill_boss', calcTarget: lvl => 3 + Math.floor(lvl / 5), desc: lvl => `Slay ${3 + Math.floor(lvl / 5)} bosses`, rewardMult: 2.5 },
        { type: 'clear_floor', calcTarget: lvl => 3 + Math.floor(lvl / 5), desc: lvl => `Clear ${3 + Math.floor(lvl / 5)} dungeon floors`, rewardMult: 2 },
    ],

// Compute rewards by level
    calcReward(lvl, mult, isHard = false) {
        const baseGold = 50 + lvl * 20;
        const baseXp = 30 + lvl * 15;
        return {
            gold: Math.floor(baseGold * mult),
            xp: Math.floor(baseXp * mult),
            ...(isHard ? { skillPoint: 1 } : {})
        };
    },

// Get today's date string
    getTodayStr() {
        return getTodayDateString();
    },

// Init / reset check
    checkAndReset() {
        const today = this.getTodayStr();
        const lvl = player.lvl || 1;

// Init or reset
        if (!player.dailyQuests || player.dailyQuests.date !== today) {
            player.dailyQuests = {
                date: today,
                generatedAtLevel: lvl,
                quests: this.generateQuests(lvl)
            };
            console.log('[Daily Quest] reset:', player.dailyQuests);
            return true;
        }
        return false;
    },

    // generatedaily quest
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

// Get the currently active quest
    getCurrentQuest() {
        this.checkAndReset();
        if (!player.dailyQuests || !player.dailyQuests.quests) return null;
        return player.dailyQuests.quests.find(q => q.unlocked && !q.claimed);
    },

// Check whether a reward is claimable
    hasClaimableReward() {
        this.checkAndReset();
        if (!player.dailyQuests || !player.dailyQuests.quests) return false;
        return player.dailyQuests.quests.some(q => q.completed && !q.claimed);
    },

// Update quest progress
    updateProgress(type, amount = 1) {
        this.checkAndReset();
        if (!player.dailyQuests || !player.dailyQuests.quests) return;

        const currentQuest = this.getCurrentQuest();
        if (!currentQuest || currentQuest.type !== type || currentQuest.completed) return;

        currentQuest.progress = Math.min(currentQuest.progress + amount, currentQuest.target);

        if (currentQuest.progress >= currentQuest.target) {
            currentQuest.completed = true;
            showNotification('📋 Daily quest completed!');
            AudioSys.play('quest');
            if (typeof updateMenuIndicators === 'function') updateMenuIndicators();
        }

        this.updateUI();
        this.updateTracker();
    },

// Claim the quest reward and unlock the next
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
            createDamageNumber(player.x, player.y - 40 + offsetY, `+${quest.reward.skillPoint} Skill Points`, '#ff88ff');
            showNotification('🎉 Skill point obtained!');
        }

        quest.claimed = true;

// Unlock the next quest
        const nextQuest = player.dailyQuests.quests.find(q => !q.unlocked);
        if (nextQuest) {
            nextQuest.unlocked = true;
            showNotification('📋 New daily quest unlocked!');
        }

        AudioSys.play('sell');
        this.updateUI();
        this.updateTracker();
        updateUI();
        if (typeof updateMenuIndicators === 'function') updateMenuIndicators();
    },

// Reset the time countdown
    getResetTime() {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0); // next midnight
        const diff = midnight - now;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const hh = String(hours).padStart(2, '0');
        const mm = String(minutes).padStart(2, '0');
        const ss = String(seconds).padStart(2, '0');

        return I18N.t('dq_reset_in', { time: `${hh}:${mm}:${ss}` });
    },

// Update the quest panel UI
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
            if (q.reward.skillPoint) rewardText.push(`${q.reward.skillPoint} Skill Points`);

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

// Render the daily full-attendance chest (retention polish 3.3)
        if (completedCount === 3) {
            const chestClaimed = player.dailyQuests.chestClaimed;
            html += `
                <div class="daily-master-chest-card" style="margin-top:12px; background:linear-gradient(135deg, rgba(212,175,55,0.2), rgba(0,0,0,0.6)); border:1px solid #d4af37; border-radius:6px; padding:10px; text-align:center;">
                    <div style="color:#ffd700; font-size:14px; font-weight:bold; margin-bottom:4px;">🎁 Daily Master Chest</div>
                    <div style="color:#bbb; font-size:11px; margin-bottom:8px;">Ultimate reward for completing all 3 daily quests: guaranteed Rare/Unique gear + gold + chance of runes</div>
                    ${chestClaimed
                        ? `<div style="color:#888; font-size:12px;">✓ Daily chest claimed (refreshes tomorrow)</div>`
                        : `<button onclick="DailyQuestSystem.claimDailyChest()" style="background:linear-gradient(to bottom, #d4af37, #aa8020); color:#000; font-weight:bold; border:1px solid #ffd700; padding:6px 16px; border-radius:4px; cursor:pointer; font-size:13px; box-shadow:0 0 8px rgba(255,215,0,0.5);">Open Daily Master Chest</button>`
                    }
                </div>
            `;
        }

// Render the weekly goals module (retention polish 3.6)
        if (typeof WeeklyGoalSystem !== 'undefined') {
            WeeklyGoalSystem.checkAndReset();
            const wGoals = player.weeklyGoals ? player.weeklyGoals.goals : [];
            if (wGoals.length > 0) {
                html += `
                    <div style="margin-top:16px; border-top:1px solid #4a3b2a; padding-top:12px;">
                        <div style="color:#c7b377; font-size:14px; margin-bottom:8px;">🏆 Weekly Goals (refresh Mondays)</div>
                `;
                wGoals.forEach(g => {
                    const statusColor = g.claimed ? '#666' : (g.completed ? '#88ff88' : '#fff');
                    const bgColor = g.claimed ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.5)';
                    let rText = [];
                    if (g.reward.gold) rText.push(`${g.reward.gold}G`);
                    if (g.reward.xp) rText.push(`${g.reward.xp}XP`);
                    if (g.reward.skillPoints) rText.push(`${g.reward.skillPoints} Skill Points`);
                    if (g.reward.item === 'unique') rText.push(`Random Unique`);
// Weekly keys are weekly_<goalId>; a surviving desc serves as fallback
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

// Claim the daily full-attendance chest (retention polish 3.3)
    claimDailyChest() {
        if (!player.dailyQuests || player.dailyQuests.chestClaimed) return;
        const allClaimed = player.dailyQuests.quests.every(q => q.claimed);
        if (!allClaimed) return;

        player.dailyQuests.chestClaimed = true;
        const lvl = player.lvl || 1;

        // 1. goldrewards (level * 50)
        const goldReward = lvl * 50;
        addGold(goldReward);
        createDamageNumber(player.x, player.y - 40, `+${goldReward} G`, 'gold');

// 2. Always grants one rare/unique item
        const isUnique = Math.random() < 0.30;
        let chestItem = null;
        if (typeof createItem === 'function') {
            chestItem = createItem(null, Math.max(1, player.floor || 1));
            chestItem.rarity = isUnique ? RARITY.UNIQUE : RARITY.RARE;
            if (chestItem.rarity === RARITY.UNIQUE) {
                chestItem.displayName = "Unique · " + chestItem.name;
                chestItem.stats.allSkills = (chestItem.stats.allSkills || 0) + 1;
                chestItem.stats.dmgPct = (chestItem.stats.dmgPct || 0) + 50;
                chestItem.stats.lifeSteal = (chestItem.stats.lifeSteal || 0) + 5;
            }
            addItemToInventory(chestItem);
        }

// 3. Chance of a rune
        if (Math.random() < 0.40 && typeof createRuneItem === 'function') {
            const runeKeys = ['tal', 'ral', 'ort', 'thul', 'amn'];
            const rune = createRuneItem(runeKeys[Math.floor(Math.random() * runeKeys.length)]);
            if (rune) addItemToInventory(rune);
        }

        const lang = (typeof I18N !== 'undefined' && I18N.currentLang) ? I18N.currentLang : 'zh';
        let msg = `🎁 Opened the perfect-attendance chest! Got ${goldReward} gold and ${chestItem ? chestItem.displayName : 'a rare item'}`;
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

// Update the top-left tracker
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
                ? `<div style="margin-bottom:8px;"><span style="color:#88ff88; font-size:12px;">✓ Daily quest completed</span></div>`
                : `<div style="margin-bottom:8px;"><span style="color:#ffcc00; font-size:12px;">🎁 Reward available!</span></div>`;
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

// ========== Weekly Goals System (retention polish 3.6) ==========
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
                    { id: 'kill_500', type: 'kill', target: 500, progress: 0, completed: false, claimed: false, desc: 'Slay 500 monsters', reward: { gold: 500, xp: 1000 } },
                    { id: 'collect_rares', type: 'collect_rares', target: 5, progress: 0, completed: false, claimed: false, desc: 'Collect 5 Rare/Unique pieces of gear', reward: { item: 'unique' } },
                    { id: 'reach_floor_15', type: 'reach_floor', target: 15, progress: maxF, completed: maxF >= 15, claimed: false, desc: 'Reach Floor 15 of the dungeon', reward: { skillPoints: 2 } }
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
                if (typeof showNotification === 'function') showNotification('🏆 Weekly goal [Monster Cull] reached!', 'gold');
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
                if (typeof showNotification === 'function') showNotification('🏆 Weekly goal [Treasure Hunt] reached!', 'gold');
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
                if (typeof showNotification === 'function') showNotification('🏆 Weekly goal [Abyss Diver] reached!', 'gold');
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
            if (typeof showNotification === 'function') showNotification(`🎉 Obtained ${g.reward.skillPoints} Skill Point(s)!`, 'gold');
        }
        if (g.reward.item === 'unique' && typeof createItem === 'function') {
            const u = createItem(null, Math.max(1, player.floor || 1));
            u.rarity = RARITY.UNIQUE;
            u.displayName = "Unique · " + u.name;
            u.stats.allSkills = (u.stats.allSkills || 0) + 1;
            u.stats.dmgPct = (u.stats.dmgPct || 0) + 50;
            if (typeof addItemToInventory === 'function') addItemToInventory(u);
            if (typeof showNotification === 'function') showNotification(`🎁 Weekly reward: acquired Unique item "${u.displayName}"!`, 'gold');
        }

        if (typeof AudioSys !== 'undefined' && AudioSys.play) AudioSys.play('quest');
        DailyQuestSystem.updateUI();
        if (typeof updateUI === 'function') updateUI();
        if (typeof renderInventory === 'function') renderInventory();
        if (typeof SaveSystem !== 'undefined' && SaveSystem.save) SaveSystem.save(true);
    }
};

window.WeeklyGoalSystem = WeeklyGoalSystem;

