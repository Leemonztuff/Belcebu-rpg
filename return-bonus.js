/**
 * return-bonus.js - 菠萝战纪 回归英雄专属礼包与双倍经验系统
 * Sistema de Regalo de Bienvenida por Regreso (Inactividad >= 3 días) con Buff de Doble EXP.
 */

const ReturnBonus = {
    INACTIVITY_THRESHOLD_MS: 3 * 24 * 60 * 60 * 1000, // 3 天
    BUFF_DURATION_MS: 30 * 60 * 1000, // 30 分钟双倍经验
    modalId: 'return-bonus-modal',

    init() {
        this.injectModal();
        this.setupHudTimer();
    },

    injectModal() {
        if (document.getElementById(this.modalId)) return;

        const overlay = document.createElement('div');
        overlay.id = this.modalId;
        overlay.className = 'return-bonus-overlay';
        overlay.style.display = 'none';
        overlay.onmousedown = (e) => {
            if (e.target === overlay) this.close();
        };

        overlay.innerHTML = `
            <div class="return-bonus-panel" onmousedown="event.stopPropagation()">
                <div class="return-bonus-banner">
                    <span class="banner-sparkle">✨</span>
                    <h2 data-i18n="return_banner_title">回归庇护所 · 传奇再临</h2>
                    <p data-i18n="return_banner_sub">庇护所一直在等待强大的勇者归来！这是为你准备的凯旋战礼：</p>
                </div>
                <div class="return-rewards-grid" id="return-rewards-grid">
                    <div class="return-reward-card exp-card">
                        <div class="reward-icon">⚡</div>
                        <div class="reward-info">
                            <h4 data-i18n="return_reward_exp">30分钟 双倍经验祝福</h4>
                            <p data-i18n="return_reward_exp_desc">讨伐所有魔物获得 200% 经验收益</p>
                        </div>
                    </div>
                    <div class="return-reward-card gold-card">
                        <div class="reward-icon">💰</div>
                        <div class="reward-info">
                            <h4 id="return-gold-val-title">军资黄金 +3000</h4>
                            <p data-i18n="return_reward_gold_desc">用于打造神兵与学习全新技能</p>
                        </div>
                    </div>
                    <div class="return-reward-card chest-card">
                        <div class="reward-icon">🎁</div>
                        <div class="reward-info">
                            <h4 data-i18n="return_reward_chest">稀有神秘神装宝箱</h4>
                            <p data-i18n="return_reward_chest_desc">必得 1 件强力黄色或暗金品质装备</p>
                        </div>
                    </div>
                    <div class="return-reward-card sp-card">
                        <div class="reward-icon">⭐</div>
                        <div class="reward-info">
                            <h4 data-i18n="return_reward_sp">技能悟性点 +1</h4>
                            <p data-i18n="return_reward_sp_desc">突破技能树，解锁高阶战术技能</p>
                        </div>
                    </div>
                </div>
                <div class="return-bonus-footer">
                    <button class="return-claim-btn" onclick="ReturnBonus.claimAndProceed()">
                        <span class="btn-shine"></span>
                        <span data-i18n="return_claim_btn">⚔️ 领取大礼并启程 ⚔️</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    },

    checkOnLogin() {
        if (!player) return;
        const now = Date.now();
        const lastLogin = player.lastLoginTime || now;
        player.lastLoginTime = now;

        // 判断离线时间
        const elapsed = now - lastLogin;
        if (elapsed >= this.INACTIVITY_THRESHOLD_MS && !player.pendingReturnBonus) {
            this.show(elapsed);
        }
    },

    show(elapsedMs = 0) {
        this.injectModal();
        const overlay = document.getElementById(this.modalId);
        if (!overlay) return;

        const bonusGold = Math.max(1500, (player.lvl || 1) * 300);
        const goldTitle = document.getElementById('return-gold-val-title');

        if (goldTitle) {
            // 军资标题含金币插值，统一走 returnBonus 表的 gold_title
            goldTitle.textContent = I18N.trPath('returnBonus', 'gold_title', 'label', '', { gold: bonusGold });
        }

        overlay.style.display = 'flex';
    },

    close() {
        const overlay = document.getElementById(this.modalId);
        if (overlay) overlay.style.display = 'none';
    },

    claimAndProceed() {
        if (!player) return;

        const bonusGold = Math.max(1500, (player.lvl || 1) * 300);
        player.gold = (player.gold || 0) + bonusGold;
        player.skillPoints = (player.skillPoints || 0) + 1;

        // 激活 30 分钟双倍经验
        player.doubleExpUntil = Date.now() + this.BUFF_DURATION_MS;

        // 发放高品质装备
        if (typeof generateItem === 'function') {
            const floor = Math.max(player.floor || 1, 3);
            const highTierItem = generateItem(floor, Math.random() < 0.35 ? 'unique' : 'rare');
            if (highTierItem && player.inventory && player.inventory.length < (player.inventorySlots || 30)) {
                player.inventory.push(highTierItem);
            }
        }

        if (typeof showNotification === 'function') {
            showNotification(I18N.trPath('returnBonus', 'claim_toast', 'label', '✨ 回归大礼已领取！30分钟双倍经验已激活！'));
        }

        if (typeof playSound === 'function') playSound('levelUp');
        if (typeof updateUI === 'function') updateUI();

        this.close();
        this.updateDoubleExpIndicator();
    },

    triggerMock() {
        this.show(this.INACTIVITY_THRESHOLD_MS + 1000);
    },

    setupHudTimer() {
        // 每秒更新 HUD 上的双倍经验倒计时
        setInterval(() => {
            this.updateDoubleExpIndicator();
        }, 1000);
    },

    updateDoubleExpIndicator() {
        let indicator = document.getElementById('double-exp-hud-badge');
        if (!player || !player.doubleExpUntil || Date.now() >= player.doubleExpUntil) {
            if (indicator) indicator.style.display = 'none';
            return;
        }

        if (!indicator) {
            const container = document.getElementById('game-container');
            if (!container) return;
            indicator = document.createElement('div');
            indicator.id = 'double-exp-hud-badge';
            indicator.className = 'double-exp-hud-badge';
            container.appendChild(indicator);
        }

        const remainingMs = player.doubleExpUntil - Date.now();
        const mins = Math.floor(remainingMs / 60000);
        const secs = Math.floor((remainingMs % 60000) / 1000);
        const timeStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

        // 徽标文案取自 returnBonus 表的 double_exp_badge
        indicator.innerHTML = `<span>${I18N.trPath('returnBonus', 'double_exp_badge', 'label')}</span> <b>${timeStr}</b>`;
        indicator.style.display = 'flex';
    }
};

window.ReturnBonus = ReturnBonus;
