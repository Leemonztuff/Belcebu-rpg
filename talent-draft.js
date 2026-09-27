// ========== Warrior's Reward: free talent 3-pick-1 system ==========
// Reaching floor milestones (every 5 floors) grants a free powerful talent draft.

const TalentDraftSystem = {
    currentDraftOptions: [],
    currentFloor: 0,
    isOpen: false,

    // Check and trigger the milestone talent 3-pick-1
    checkFloorMilestone: function (floor) {
        if (!player || floor <= 0) return;
        // Only every 5 floors (5, 10, 15, 20, 25...)
        if (floor % 5 !== 0) return;

        if (!player.floorTalentsClaimed) {
            player.floorTalentsClaimed = {};
        }

        // Check whether this floor was already claimed
        if (player.floorTalentsClaimed[floor]) {
            return;
        }

        // Open with a small delay so the floor transition and monster loading are ready
        setTimeout(() => {
            this.openDraft(floor);
        }, 600);
    },

    // Generate candidate talents and open the draft panel
    openDraft: function (floor) {
        if (typeof TALENTS === 'undefined') return;
        this.currentFloor = floor;

        // Filter talents the player does not own or can further enhance
        const allTalentKeys = Object.keys(TALENTS);
        const ownedTalents = player.talents || {};
        
        // Prefer drawing from unowned talents
        let pool = allTalentKeys.filter(k => !ownedTalents[k]);
        if (pool.length < 3) {
            pool = allTalentKeys; // If nearly full, fall back to the full pool
        }

        // Randomly draw 3 distinct talents
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        this.currentDraftOptions = shuffled.slice(0, 3);
        this.isOpen = true;

        this.renderModal();

        if (typeof AudioSys !== 'undefined' && AudioSys.play) {
            AudioSys.play('levelup');
        }
    },

    // Render the 3-pick-1 popup DOM
    renderModal: function () {
        let modal = document.getElementById('talent-draft-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'talent-draft-modal';
            modal.className = 'talent-draft-modal';
            const container = document.getElementById('game-container') || document.body;
            container.appendChild(modal);
        }

        // Fixed panel copy resolves through the talentDraft table
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

    // Player picks a talent
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
        // The claim toast contains the talent name; resolve through the talentDraft table's success_toast
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

        // Refresh stats and UI
        if (typeof updateStats === 'function') updateStats();
        if (typeof updateStatsUI === 'function') updateStatsUI();
        if (typeof renderTalentHUD === 'function') renderTalentHUD();
        if (typeof SaveSystem !== 'undefined' && SaveSystem.save) SaveSystem.save(true);
    }
};

if (typeof window !== 'undefined') {
    window.TalentDraftSystem = TalentDraftSystem;
}
