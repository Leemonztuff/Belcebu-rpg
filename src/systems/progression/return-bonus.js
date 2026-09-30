/**
 * return-bonus.js - Brawlore returning-hero bundle and double XP system
 * Sistema de Regalo de Bienvenida por Regreso (Inactividad >= 3 días) con Buff de Doble EXP.
 */

const ReturnBonus = {
    INACTIVITY_THRESHOLD_MS: 3 * 24 * 60 * 60 * 1000, // 3 heaven
    BUFF_DURATION_MS: 30 * 60 * 1000, // 30-minute double XP
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
                    <h2 data-i18n="return_banner_title">Back to the Sanctuary · A Legend Returns</h2>
                    <p data-i18n="return_banner_sub">The Sanctuary has been waiting for a mighty hero's return! Your triumph spoils await:</p>
                </div>
                <div class="return-rewards-grid" id="return-rewards-grid">
                    <div class="return-reward-card exp-card">
                        <div class="reward-icon">⚡</div>
                        <div class="reward-info">
                            <h4 data-i18n="return_reward_exp">30-Min Double XP Blessing</h4>
                            <p data-i18n="return_reward_exp_desc">Earn 200% XP from all monsters</p>
                        </div>
                    </div>
                    <div class="return-reward-card gold-card">
                        <div class="reward-icon">💰</div>
                        <div class="reward-info">
                            <h4 id="return-gold-val-title">War Chest +3000 Gold</h4>
                            <p data-i18n="return_reward_gold_desc">For forging gear and learning new skills</p>
                        </div>
                    </div>
                    <div class="return-reward-card chest-card">
                        <div class="reward-icon">🎁</div>
                        <div class="reward-info">
                            <h4 data-i18n="return_reward_chest">Rare Mystery Gear Chest</h4>
                            <p data-i18n="return_reward_chest_desc">Guaranteed 1 strong Rare or Unique item</p>
                        </div>
                    </div>
                    <div class="return-reward-card sp-card">
                        <div class="reward-icon">⭐</div>
                        <div class="reward-info">
                            <h4 data-i18n="return_reward_sp">Skill Point +1</h4>
                            <p data-i18n="return_reward_sp_desc">Unlock advanced tactical skills in the skill tree</p>
                        </div>
                    </div>
                </div>
                <div class="return-bonus-footer">
                    <button class="return-claim-btn" onclick="ReturnBonus.claimAndProceed()">
                        <span class="btn-shine"></span>
                        <span data-i18n="return_claim_btn">⚔️ Claim Rewards & Return ⚔️</span>
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

// Decide the offline time
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
            // The army funds title contains gold interpolation; resolve through the returnBonus table's gold_title
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

// Activate 30-minute double XP
        player.doubleExpUntil = Date.now() + this.BUFF_DURATION_MS;

// Grant high-quality gear
        if (typeof generateItem === 'function') {
            const floor = Math.max(player.floor || 1, 3);
            const highTierItem = generateItem(floor, Math.random() < 0.35 ? 'unique' : 'rare');
            if (highTierItem && player.inventory && player.inventory.length < (player.inventorySlots || 30)) {
                player.inventory.push(highTierItem);
            }
        }

        if (typeof showNotification === 'function') {
            showNotification(I18N.trPath('returnBonus', 'claim_toast', 'label', '✨ Returning hero gift claimed! 2X EXP active for 30m.'));
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
// Update the double XP countdown on the HUD every second
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

// Badge text comes from the returnBonus table's double_exp_badge
        indicator.innerHTML = `<span>${I18N.trPath('returnBonus', 'double_exp_badge', 'label')}</span> <b>${timeStr}</b>`;
        indicator.style.display = 'flex';
    }
};

window.ReturnBonus = ReturnBonus;
