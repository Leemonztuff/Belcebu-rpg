// ========== 勇士嘉奖：免费天赋 3 选 1 系统 (Free Talent Draft Selection) ==========
// 达成特定楼层里程碑（每通过 5 层）赠予玩家一次强力天赋免费抽取机会。

const TalentDraftSystem = {
    currentDraftOptions: [],
    currentFloor: 0,
    isOpen: false,

    // 检查并触发里程碑天赋三选一
    checkFloorMilestone: function (floor) {
        if (!player || floor <= 0) return;
        // 仅每5层触发（5, 10, 15, 20, 25...）
        if (floor % 5 !== 0) return;

        if (!player.floorTalentsClaimed) {
            player.floorTalentsClaimed = {};
        }

        // 检查该楼层是否已领取
        if (player.floorTalentsClaimed[floor]) {
            return;
        }

        // 延迟少许打开，确保切层动画与怪物加载就绪
        setTimeout(() => {
            this.openDraft(floor);
        }, 600);
    },

    // 生成候选天赋并打开抽取面板
    openDraft: function (floor) {
        if (typeof TALENTS === 'undefined') return;
        this.currentFloor = floor;

        // 筛选玩家未拥有或可继续强化的天赋
        const allTalentKeys = Object.keys(TALENTS);
        const ownedTalents = player.talents || {};
        
        // 优先从未拥有的天赋中抽取
        let pool = allTalentKeys.filter(k => !ownedTalents[k]);
        if (pool.length < 3) {
            pool = allTalentKeys; // 如果已近全满，回退到全部池
        }

        // 随机抽取 3 个互不相同的天赋
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        this.currentDraftOptions = shuffled.slice(0, 3);
        this.isOpen = true;

        this.renderModal();

        if (typeof AudioSys !== 'undefined' && AudioSys.play) {
            AudioSys.play('levelup');
        }
    },

    // 渲染三选一弹窗 DOM
    renderModal: function () {
        let modal = document.getElementById('talent-draft-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'talent-draft-modal';
            modal.className = 'talent-draft-modal';
            const container = document.getElementById('game-container') || document.body;
            container.appendChild(modal);
        }

        // 面板固定文案统一走 talentDraft 表
        const headerTitle = I18N.trPath('talentDraft', 'header', 'label', '', { floor: this.currentFloor });
        const subTitle = I18N.trPath('talentDraft', 'subtitle', 'label');
        const pickButton = I18N.trPath('talentDraft', 'pick_button', 'label');

        let cardsHtml = '';
        this.currentDraftOptions.forEach((tKey, idx) => {
            const t = TALENTS[tKey];
            if (!t) return;

            const name = (typeof I18N !== 'undefined' && I18N.getTalentName) ? I18N.getTalentName(tKey) : t.name;
            const desc = (typeof I18N !== 'undefined' && I18N.getTalentDesc) ? I18N.getTalentDesc(tKey) : t.desc;
            const tierColor = (typeof TALENT_TIER_COLORS !== 'undefined' && TALENT_TIER_COLORS[t.tier]) ? TALENT_TIER_COLORS[t.tier] : '#ffd700';

            cardsHtml += `
                <div class="talent-draft-card tier-${t.tier}" onclick="TalentDraftSystem.chooseTalent('${tKey}')" style="--tier-color: ${tierColor};">
                    <div class="talent-draft-icon">${t.icon || '✨'}</div>
                    <div class="talent-draft-tier" style="color:${tierColor};">${t.tier.toUpperCase()}</div>
                    <div class="talent-draft-name">${name}</div>
                    <div class="talent-draft-desc">${desc}</div>
                    <button class="talent-draft-btn">${pickButton}</button>
                </div>
            `;
        });

        modal.innerHTML = `
            <div class="talent-draft-content">
                <div class="talent-draft-header">${headerTitle}</div>
                <div class="talent-draft-subtitle">${subTitle}</div>
                <div class="talent-draft-cards">
                    ${cardsHtml}
                </div>
            </div>
        `;

        modal.style.display = 'flex';
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
    },

    // 玩家选择天赋
    chooseTalent: function (talentKey) {
        if (!this.isOpen || !TALENTS[talentKey]) return;

        const t = TALENTS[talentKey];
        if (!player.talents) player.talents = {};
        player.talents[talentKey] = (player.talents[talentKey] || 0) + 1;

        if (!player.floorTalentsClaimed) player.floorTalentsClaimed = {};
        player.floorTalentsClaimed[this.currentFloor] = true;

        this.isOpen = false;
        const modal = document.getElementById('talent-draft-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }

        const name = (typeof I18N !== 'undefined' && I18N.getTalentName) ? I18N.getTalentName(talentKey) : t.name;
        // 领取提示含天赋名插值，统一走 talentDraft 表的 success_toast
        const successMsg = I18N.trPath('talentDraft', 'success_toast', 'label', '', { name });

        if (typeof showNotification === 'function') {
            showNotification(successMsg, 'gold');
        }
        if (typeof AudioSys !== 'undefined' && AudioSys.play) {
            AudioSys.play('levelup');
        }
        if (typeof triggerScreenShake === 'function') {
            triggerScreenShake(6, 0.25);
        }

        // 刷新属性与UI
        if (typeof updateStats === 'function') updateStats();
        if (typeof updateStatsUI === 'function') updateStatsUI();
        if (typeof renderTalentHUD === 'function') renderTalentHUD();
        if (typeof SaveSystem !== 'undefined' && SaveSystem.save) SaveSystem.save(true);
    }
};

if (typeof window !== 'undefined') {
    window.TalentDraftSystem = TalentDraftSystem;
}
