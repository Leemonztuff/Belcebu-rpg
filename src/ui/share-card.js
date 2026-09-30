/**
 * share-card.js - Brawlore battle report and hero achievement card generator
 * Generador de Tarjeta de Hazañas y Build de Héroe para compartir en redes y portapapeles.
 */

const ShareCardSystem = {
    modalId: 'share-card-modal',
    canvasId: 'share-card-canvas',
    currentCardData: null,

    init() {
        this.injectModal();
    },

    injectModal() {
        if (document.getElementById(this.modalId)) return;

        const overlay = document.createElement('div');
        overlay.id = this.modalId;
        overlay.className = 'share-card-overlay';
        overlay.style.display = 'none';
        overlay.onmousedown = (e) => {
            if (e.target === overlay) this.close();
        };

        overlay.innerHTML = `
            <div class="share-card-panel" onmousedown="event.stopPropagation()">
                <div class="share-card-header">
                    <div class="share-card-title">
                        <span class="share-icon">📜</span>
                        <span data-i18n="share_card_title">Hero Report & Build Sharing</span>
                    </div>
                    <button class="share-close-btn" onclick="ShareCardSystem.close()">✕</button>
                </div>
                <div class="share-card-body">
                    <div class="share-preview-container">
                        <canvas id="${this.canvasId}" width="640" height="840"></canvas>
                    </div>
                </div>
                <div class="share-card-footer">
                    <button class="share-action-btn copy-text-btn" onclick="ShareCardSystem.copyTextSummary()">
                        <span>📋</span> <span data-i18n="share_copy_text">Copy Text Report</span>
                    </button>
                    <button class="share-action-btn download-img-btn primary" onclick="ShareCardSystem.downloadImage()">
                        <span>🖼️</span> <span data-i18n="share_download_img">Save Report Image</span>
                    </button>
                    <button class="share-action-btn copy-img-btn" onclick="ShareCardSystem.copyImageToClipboard()">
                        <span>✨</span> <span data-i18n="share_copy_img">Copy Image</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    },

    open(customData = null) {
        if (!player) return;
        this.injectModal();
        const data = customData || this.gatherPlayerData();
        this.currentCardData = data;

        const overlay = document.getElementById(this.modalId);
        if (overlay) {
            overlay.style.display = 'flex';
            this.renderCanvas(data);
        }
    },

    close() {
        const overlay = document.getElementById(this.modalId);
        if (overlay) overlay.style.display = 'none';
    },

    gatherPlayerData() {
        const nickname = (typeof pb !== 'undefined' && pb.authStore && pb.authStore.model && pb.authStore.model.name) ||
                         localStorage.getItem('pb_nickname') ||
                         I18N.tr('shareCard', 'label_default_nickname', 'Valiant Warrior');

        const currentTitle = player.currentTitle || I18N.tr('shareCard', 'label_default_title', 'Sanctuary Novice');
        const floor = player.floor || 1;
        const maxFloor = player.highestFloor || player.maxFloor || floor;
        const lvl = player.lvl || 1;
        const kills = player.kills || 0;
        const gold = player.gold || 0;
        const defaultTierName = I18N.tr('shareCard', 'title_bronze_trial', '🥉 Bronze Trial');
        const abyssTier = (typeof AbyssSystem !== 'undefined' && typeof AbyssSystem.getTier === 'function' && AbyssSystem.getTier(player.abyssScore || 0)) || { name: defaultTierName };

// Collect gear info
        const equipSlots = ['weapon', 'body', 'helm', 'gloves', 'boots', 'belt', 'amulet', 'ring1', 'ring2', 'offhand'];
        const gearList = [];
        if (player.equipment) {
            equipSlots.forEach(slot => {
                const it = player.equipment[slot];
                if (it) {
                    let name = it.name || I18N.tr('shareCard', 'label_unknown_equipment', 'Unknown Gear');
                    if (typeof I18N !== 'undefined' && I18N.getItemDisplayName) {
                        name = I18N.getItemDisplayName(it) || name;
                    }
                    gearList.push({
                        slot,
                        name,
                        rarity: it.rarity || 'common',
                        quality: it.quality || 0,
                        runeword: it.runewordName || null,
                        sockets: it.sockets || 0,
                        runes: it.socketedRunes || []
                    });
                }
            });
        }

// Collect active affixes and key stats
        const dmg = Math.round(player.damage || (player.str * 1.5 + 5));
        const def = Math.round(player.defense || (player.dex * 0.8 + 2));
        const maxHp = Math.round(player.maxHp || 100);
        const maxMp = Math.round(player.maxMp || 50);

        return {
            nickname,
            title: currentTitle,
            level: lvl,
            floor,
            maxFloor,
            kills,
            gold,
            abyssScore: player.abyssScore || 0,
            abyssTier: abyssTier.name,
            stats: { dmg, def, maxHp, maxMp },
            gearList,
            achievementsCount: Object.keys(player.achievements || {}).length,
            discoveredMonstersCount: Object.keys(player.discoveredMonsters || {}).length,
            dateStr: new Date().toLocaleDateString()
        };
    },

    renderCanvas(data) {
        const canvas = document.getElementById(this.canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

// 1. Background (dark fantasy gradient with ancient stone texture)
        const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
        bgGrad.addColorStop(0, '#100b14');
        bgGrad.addColorStop(0.3, '#191122');
        bgGrad.addColorStop(0.7, '#140d18');
        bgGrad.addColorStop(1, '#0a060d');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        // 2. Gold fantasy double border with corner inscriptions
        ctx.strokeStyle = '#c5a059';
        ctx.lineWidth = 3;
        ctx.strokeRect(16, 16, W - 32, H - 32);

        ctx.strokeStyle = '#4a3820';
        ctx.lineWidth = 1;
        ctx.strokeRect(22, 22, W - 44, H - 44);

// Corner ornamental crests
        const cornerSize = 14;
        const corners = [[16, 16], [W - 16, 16], [16, H - 16], [W - 16, H - 16]];
        ctx.fillStyle = '#e6c378';
        corners.forEach(([cx, cy]) => {
            ctx.beginPath();
            ctx.arc(cx, cy, 5, 0, Math.PI * 2);
            ctx.fill();
        });

        // 3. top Header markertopic
        ctx.textAlign = 'center';
        ctx.font = 'bold 26px "Cinzel", "Georgia", "Microsoft YaHei", serif';
        ctx.fillStyle = '#ffd700';
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 10;
        ctx.fillText(I18N.tr('shareCard', 'label_card_header', '⚔️  Brawlore · Hero Chronicle  ⚔️'), W / 2, 60);
        ctx.shadowBlur = 0;

        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#a69279';
        ctx.fillText(I18N.tr('shareCard', 'label_card_subheader', 'BRAWLORE CHRONICLES  •  {date}', { date: data.dateStr }), W / 2, 82);

// Divider lines
        ctx.strokeStyle = '#3d2e1e';
        ctx.beginPath();
        ctx.moveTo(35, 95);
        ctx.lineTo(W - 35, 95);
        ctx.stroke();

// 4. Character banner (avatar emblem + nickname + title + level)
        ctx.fillStyle = 'rgba(255, 215, 0, 0.05)';
        ctx.fillRect(35, 105, W - 70, 75);
        ctx.strokeStyle = '#3d3020';
        ctx.strokeRect(35, 105, W - 70, 75);

        // Class/character emblem
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(75, 142, 26, 0, Math.PI * 2);
        ctx.fillStyle = '#2a1a3a';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#c5a059';
        ctx.stroke();

        ctx.font = '24px serif';
        ctx.fillStyle = '#ffd700';
        ctx.fillText('🗡️', 75, 150);

// Nickname and title
        ctx.textAlign = 'left';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(data.nickname, 115, 134);

        ctx.font = '13px sans-serif';
        ctx.fillStyle = '#ffb300';
        ctx.fillText(`👑 [${data.title}]`, 115, 156);

// Level and ladder badge
        ctx.textAlign = 'right';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillStyle = '#4ade80';
        ctx.fillText(`Lv.${data.level}`, W - 50, 135);

        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`🏆 ${data.abyssTier}`, W - 50, 156);

// 5. Core exploration dashboard (4 tiles: max floor / kills / overall DPS / collection progress)
        const statsBoxY = 195;
        const boxW = (W - 70 - 15 * 3) / 4;
        const boxH = 68;
        const metrics = [
            { icon: '🏰', label: I18N.tr('shareCard', 'label_max_floor', 'Max Floor'), val: `${data.maxFloor} F`, color: '#60a5fa' },
            { icon: '💀', label: I18N.tr('shareCard', 'label_kills', 'Kills'), val: `${data.kills}`, color: '#f87171' },
            { icon: '⚔️', label: I18N.tr('shareCard', 'label_damage', 'Damage'), val: `${data.stats.dmg}`, color: '#fbbf24' },
            { icon: '🛡️', label: I18N.tr('shareCard', 'label_defense', 'Defense'), val: `${data.stats.def}`, color: '#34d399' }
        ];

        metrics.forEach((m, idx) => {
            const bx = 35 + idx * (boxW + 15);
            ctx.fillStyle = 'rgba(20, 15, 30, 0.7)';
            ctx.fillRect(bx, statsBoxY, boxW, boxH);
            ctx.strokeStyle = '#3b2d45';
            ctx.strokeRect(bx, statsBoxY, boxW, boxH);

            ctx.textAlign = 'center';
            ctx.font = '14px sans-serif';
            ctx.fillStyle = '#cbd5e1';
            ctx.fillText(`${m.icon} ${m.label}`, bx + boxW / 2, statsBoxY + 24);

            ctx.font = 'bold 16px sans-serif';
            ctx.fillStyle = m.color;
            ctx.fillText(m.val, bx + boxW / 2, statsBoxY + 52);
        });

        // 6. Gear and build showcase
        const gearStartY = 280;
        ctx.textAlign = 'left';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = '#e2d4be';
        ctx.fillText(`📦 ${I18N.tr('shareCard', 'label_gear_section', 'Gear & Runewords')}`, 35, gearStartY);

        ctx.strokeStyle = '#2f2338';
        ctx.beginPath();
        ctx.moveTo(35, gearStartY + 8);
        ctx.lineTo(W - 35, gearStartY + 8);
        ctx.stroke();

        const rarityColors = {
            common: '#ffffff',
            magic: '#3b82f6',
            rare: '#facc15',
            set: '#22c55e',
            unique: '#d97706',
            runeword: '#ec4899'
        };

        const gearList = data.gearList || [];
        const itemRowH = 34;
        const maxItems = Math.min(gearList.length, 9);

        if (gearList.length === 0) {
            ctx.textAlign = 'center';
            ctx.font = '13px sans-serif';
            ctx.fillStyle = '#64748b';
            ctx.fillText(I18N.tr('shareCard', 'label_gear_empty', 'No equipment currently equipped'), W / 2, gearStartY + 60);
        } else {
            gearList.slice(0, maxItems).forEach((item, i) => {
                const iy = gearStartY + 20 + i * itemRowH;
                ctx.fillStyle = (i % 2 === 0) ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.2)';
                ctx.fillRect(35, iy, W - 70, itemRowH - 4);

// Quality mark and name
                const color = item.runeword ? rarityColors.runeword : (rarityColors[item.rarity] || '#ffffff');
                ctx.fillStyle = color;
                ctx.font = 'bold 13px sans-serif';
                ctx.textAlign = 'left';

                const prefix = item.runeword ? '★ ' : '▪ ';
                ctx.fillText(`${prefix}${item.name}`, 45, iy + 20);

// Sockets and runes / runewords
                ctx.textAlign = 'right';
                if (item.runeword) {
                    ctx.fillStyle = '#ec4899';
                    ctx.font = 'bold 12px sans-serif';
                    ctx.fillText(`[${item.runeword}]`, W - 45, iy + 20);
                } else if (item.sockets > 0) {
                    const runeText = item.runes && item.runes.length > 0
                        ? item.runes.map(r => r.name || r).join('-')
                        : I18N.tr('shareCard', 'label_socket_count', '{count} sockets', { count: item.sockets });
                    ctx.fillStyle = '#fbbf24';
                    ctx.font = '12px monospace';
                    ctx.fillText(`💎 ${runeText}`, W - 45, iy + 20);
                } else {
                    ctx.fillStyle = '#64748b';
                    ctx.font = '11px sans-serif';
                    ctx.fillText(item.slot.toUpperCase(), W - 45, iy + 20);
                }
            });
        }

// 7. Footer achievements and seals
        const footerY = H - 90;
        ctx.fillStyle = 'rgba(15, 10, 20, 0.9)';
        ctx.fillRect(35, footerY, W - 70, 56);
        ctx.strokeStyle = '#3d2e1e';
        ctx.strokeRect(35, footerY, W - 70, 56);

        ctx.textAlign = 'left';
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(`🏆 ${I18N.tr('shareCard', 'label_achievements', 'Achievements Unlocked:')} ${data.achievementsCount}`, 50, footerY + 24);
        ctx.fillText(`📖 ${I18N.tr('shareCard', 'label_monsters_discovered', 'Monsters Discovered:')} ${data.discoveredMonstersCount}`, 50, footerY + 44);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(I18N.tr('shareCard', 'label_card_footer', '✨ Brawlore · Sanctuary Legend'), W - 50, footerY + 34);
    },

    getTextSummary() {
        if (!this.currentCardData) this.currentCardData = this.gatherPlayerData();
        const d = this.currentCardData;

// The report text block now builds from placeholders; the gear list separator is per language (zh uses '、')
        const gearSep = I18N.currentLang === 'zh' ? '、' : ', ';
        const gear = d.gearList.slice(0, 4).map(g => g.name).join(gearSep);

        return I18N.tr('shareCard', 'text_header', '📜 [BRAWLORE · HERO CHRONICLE]') + '\n' +
            I18N.tr('shareCard', 'text_hero', '👤 Hero: {nickname} ({title})', { nickname: d.nickname, title: d.title }) + '\n' +
            I18N.tr('shareCard', 'text_level_floor', '⭐ Level: Lv.{level} | 🏰 Max Floor: {floor}', { level: d.level, floor: d.maxFloor }) + '\n' +
            I18N.tr('shareCard', 'text_stats', '⚔️ Damage: {dmg} | 🛡️ Defense: {def} | ❤️ Max HP: {hp}', { dmg: d.stats.dmg, def: d.stats.def, hp: d.stats.maxHp }) + '\n' +
            I18N.tr('shareCard', 'text_kills_tier', '💀 Total Kills: {kills} | 🏆 Abyss Tier: {tier}', { kills: d.kills, tier: d.abyssTier }) + '\n' +
            I18N.tr('shareCard', 'text_gear', '📦 Notable Gear: {gear}', { gear: gear || I18N.tr('shareCard', 'text_gear_empty', 'None') }) + '\n' +
            I18N.tr('shareCard', 'text_footer', '✨ Play it in your browser: Brawlore!');
    },

    copyTextSummary() {
        const text = this.getTextSummary();
        navigator.clipboard.writeText(text).then(() => {
            if (typeof showNotification === 'function') {
                showNotification(I18N.tr('shareCard', 'text_copy_success', '📋 Hero chronicle copied to clipboard!'));
            }
        }).catch(err => {
            console.error('Clipboard error:', err);
        });
    },

    downloadImage() {
        const canvas = document.getElementById(this.canvasId);
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `brawlore-hero-card-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        if (typeof showNotification === 'function') {
            showNotification(I18N.tr('shareCard', 'text_download_success', '🖼️ Hero card image saved!'));
        }
    },

    async copyImageToClipboard() {
        const canvas = document.getElementById(this.canvasId);
        if (!canvas) return;

        try {
            canvas.toBlob(async (blob) => {
                if (!blob) return;
                if (navigator.clipboard && window.ClipboardItem) {
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                    if (typeof showNotification === 'function') {
                        showNotification(I18N.tr('shareCard', 'text_copy_image_success', '✨ Hero card image copied to clipboard!'));
                    }
                } else {
                    this.downloadImage();
                }
            });
        } catch (e) {
            console.warn('Direct image clipboard unsupported, fallback to download:', e);
            this.downloadImage();
        }
    }
};

window.ShareCardSystem = ShareCardSystem;
