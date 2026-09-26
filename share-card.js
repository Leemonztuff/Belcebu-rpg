/**
 * share-card.js - 菠萝战纪 战报与英雄成就卡片生成系统
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
                        <span data-i18n="share_card_title">英雄战报 & 构筑分享</span>
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
                        <span>📋</span> <span data-i18n="share_copy_text">复制文本战报</span>
                    </button>
                    <button class="share-action-btn download-img-btn primary" onclick="ShareCardSystem.downloadImage()">
                        <span>🖼️</span> <span data-i18n="share_download_img">保存战报图片</span>
                    </button>
                    <button class="share-action-btn copy-img-btn" onclick="ShareCardSystem.copyImageToClipboard()">
                        <span>✨</span> <span data-i18n="share_copy_img">复制图片</span>
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
                         I18N.tr('shareCard', 'label_default_nickname', '暗黑冒险者');

        const currentTitle = player.currentTitle || I18N.tr('shareCard', 'label_default_title', '庇护所见习者');
        const floor = player.floor || 1;
        const maxFloor = player.highestFloor || player.maxFloor || floor;
        const lvl = player.lvl || 1;
        const kills = player.kills || 0;
        const gold = player.gold || 0;
        const defaultTierName = I18N.tr('shareCard', 'title_bronze_trial', '🥉 青铜试炼');
        const abyssTier = (typeof AbyssSystem !== 'undefined' && typeof AbyssSystem.getTier === 'function' && AbyssSystem.getTier(player.abyssScore || 0)) || { name: defaultTierName };

        // 收集装备信息
        const equipSlots = ['weapon', 'body', 'helm', 'gloves', 'boots', 'belt', 'amulet', 'ring1', 'ring2', 'offhand'];
        const gearList = [];
        if (player.equipment) {
            equipSlots.forEach(slot => {
                const it = player.equipment[slot];
                if (it) {
                    let name = it.name || I18N.tr('shareCard', 'label_unknown_equipment', '未知装备');
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

        // 收集激活词缀与强力属性
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

        // 1. 背景绘制 (高暗黑魔幻渐变与古老石纹质感)
        const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
        bgGrad.addColorStop(0, '#100b14');
        bgGrad.addColorStop(0.3, '#191122');
        bgGrad.addColorStop(0.7, '#140d18');
        bgGrad.addColorStop(1, '#0a060d');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        // 2. 金色魔幻双边框与四角铭文
        ctx.strokeStyle = '#c5a059';
        ctx.lineWidth = 3;
        ctx.strokeRect(16, 16, W - 32, H - 32);

        ctx.strokeStyle = '#4a3820';
        ctx.lineWidth = 1;
        ctx.strokeRect(22, 22, W - 44, H - 44);

        // 四角装饰纹章
        const cornerSize = 14;
        const corners = [[16, 16], [W - 16, 16], [16, H - 16], [W - 16, H - 16]];
        ctx.fillStyle = '#e6c378';
        corners.forEach(([cx, cy]) => {
            ctx.beginPath();
            ctx.arc(cx, cy, 5, 0, Math.PI * 2);
            ctx.fill();
        });

        // 3. 顶部 Header 标题
        ctx.textAlign = 'center';
        ctx.font = 'bold 26px "Cinzel", "Georgia", "Microsoft YaHei", serif';
        ctx.fillStyle = '#ffd700';
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 10;
        ctx.fillText(I18N.tr('shareCard', 'label_card_header', '⚔️  菠萝战纪 · 英雄战报  ⚔️'), W / 2, 60);
        ctx.shadowBlur = 0;

        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#a69279';
        ctx.fillText(I18N.tr('shareCard', 'label_card_subheader', 'BRAWLORE CHRONICLES  •  {date}', { date: data.dateStr }), W / 2, 82);

        // 分隔线
        ctx.strokeStyle = '#3d2e1e';
        ctx.beginPath();
        ctx.moveTo(35, 95);
        ctx.lineTo(W - 35, 95);
        ctx.stroke();

        // 4. 角色信息横幅 (头像徽章 + 昵称 + 称号 + 等级)
        ctx.fillStyle = 'rgba(255, 215, 0, 0.05)';
        ctx.fillRect(35, 105, W - 70, 75);
        ctx.strokeStyle = '#3d3020';
        ctx.strokeRect(35, 105, W - 70, 75);

        // 职业/角色图章
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

        // 昵称与称号
        ctx.textAlign = 'left';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(data.nickname, 115, 134);

        ctx.font = '13px sans-serif';
        ctx.fillStyle = '#ffb300';
        ctx.fillText(`👑 [${data.title}]`, 115, 156);

        // 等级与天梯徽章
        ctx.textAlign = 'right';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillStyle = '#4ade80';
        ctx.fillText(`Lv.${data.level}`, W - 50, 135);

        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`🏆 ${data.abyssTier}`, W - 50, 156);

        // 5. 核心探险数据仪表盘 (4个方块: 最高层数 / 击杀数 / 综合战力DPS / 收集进度)
        const statsBoxY = 195;
        const boxW = (W - 70 - 15 * 3) / 4;
        const boxH = 68;
        const metrics = [
            { icon: '🏰', label: I18N.tr('shareCard', 'label_max_floor', '探索层数'), val: `${data.maxFloor} F`, color: '#60a5fa' },
            { icon: '💀', label: I18N.tr('shareCard', 'label_kills', '讨伐魔物'), val: `${data.kills}`, color: '#f87171' },
            { icon: '⚔️', label: I18N.tr('shareCard', 'label_damage', '攻击力'), val: `${data.stats.dmg}`, color: '#fbbf24' },
            { icon: '🛡️', label: I18N.tr('shareCard', 'label_defense', '护甲防御'), val: `${data.stats.def}`, color: '#34d399' }
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

        // 6. 装备与神兵构筑展示
        const gearStartY = 280;
        ctx.textAlign = 'left';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = '#e2d4be';
        ctx.fillText(`📦 ${I18N.tr('shareCard', 'label_gear_section', '当前神兵与符文构筑')}`, 35, gearStartY);

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
            ctx.fillText(I18N.tr('shareCard', 'label_gear_empty', '当前未穿戴任何装备'), W / 2, gearStartY + 60);
        } else {
            gearList.slice(0, maxItems).forEach((item, i) => {
                const iy = gearStartY + 20 + i * itemRowH;
                ctx.fillStyle = (i % 2 === 0) ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.2)';
                ctx.fillRect(35, iy, W - 70, itemRowH - 4);

                // 品质标识与名称
                const color = item.runeword ? rarityColors.runeword : (rarityColors[item.rarity] || '#ffffff');
                ctx.fillStyle = color;
                ctx.font = 'bold 13px sans-serif';
                ctx.textAlign = 'left';

                const prefix = item.runeword ? '★ ' : '▪ ';
                ctx.fillText(`${prefix}${item.name}`, 45, iy + 20);

                // 孔位与符文 / 符文之语
                ctx.textAlign = 'right';
                if (item.runeword) {
                    ctx.fillStyle = '#ec4899';
                    ctx.font = 'bold 12px sans-serif';
                    ctx.fillText(`[${item.runeword}]`, W - 45, iy + 20);
                } else if (item.sockets > 0) {
                    const runeText = item.runes && item.runes.length > 0
                        ? item.runes.map(r => r.name || r).join('-')
                        : I18N.tr('shareCard', 'label_socket_count', '{count} 孔', { count: item.sockets });
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

        // 7. 底部成就与印记
        const footerY = H - 90;
        ctx.fillStyle = 'rgba(15, 10, 20, 0.9)';
        ctx.fillRect(35, footerY, W - 70, 56);
        ctx.strokeStyle = '#3d2e1e';
        ctx.strokeRect(35, footerY, W - 70, 56);

        ctx.textAlign = 'left';
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(`🏆 ${I18N.tr('shareCard', 'label_achievements', '已解锁成就:')} ${data.achievementsCount}`, 50, footerY + 24);
        ctx.fillText(`📖 ${I18N.tr('shareCard', 'label_monsters_discovered', '图鉴魔物收录:')} ${data.discoveredMonstersCount}`, 50, footerY + 44);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(I18N.tr('shareCard', 'label_card_footer', '✨ 菠萝战纪 · 庇护所传说'), W - 50, footerY + 34);
    },

    getTextSummary() {
        if (!this.currentCardData) this.currentCardData = this.gatherPlayerData();
        const d = this.currentCardData;

        // 战报文本整块改用占位符拼接，装备列表分隔符按语言区分（中文用「、」）
        const gearSep = I18N.currentLang === 'zh' ? '、' : ', ';
        const gear = d.gearList.slice(0, 4).map(g => g.name).join(gearSep);

        return I18N.tr('shareCard', 'text_header', '📜【菠萝战纪 · 英雄冒险战报】') + '\n' +
            I18N.tr('shareCard', 'text_hero', '👤 英雄：{nickname} · 👑 [{title}]', { nickname: d.nickname, title: d.title }) + '\n' +
            I18N.tr('shareCard', 'text_level_floor', '⭐ 等级：Lv.{level} | 🏰 最高探索：第 {floor} 层', { level: d.level, floor: d.maxFloor }) + '\n' +
            I18N.tr('shareCard', 'text_stats', '⚔️ 攻击：{dmg} | 🛡️ 防御：{def} | ❤️ 生命：{hp}', { dmg: d.stats.dmg, def: d.stats.def, hp: d.stats.maxHp }) + '\n' +
            I18N.tr('shareCard', 'text_kills_tier', '💀 讨伐魔物：{kills} 只 | 🏆 深渊段位：{tier}', { kills: d.kills, tier: d.abyssTier }) + '\n' +
            I18N.tr('shareCard', 'text_gear', '📦 核心神装：{gear}', { gear: gear || I18N.tr('shareCard', 'text_gear_empty', '暂无') }) + '\n' +
            I18N.tr('shareCard', 'text_footer', '✨ 踏入庇护所，开启你的暗黑奇幻冒险！');
    },

    copyTextSummary() {
        const text = this.getTextSummary();
        navigator.clipboard.writeText(text).then(() => {
            if (typeof showNotification === 'function') {
                showNotification(I18N.tr('shareCard', 'text_copy_success', '📋 战报文本已复制到剪贴板！'));
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
            showNotification(I18N.tr('shareCard', 'text_download_success', '🖼️ 战报图片已保存！'));
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
                        showNotification(I18N.tr('shareCard', 'text_copy_image_success', '✨ 战报图片已直接复制到剪贴板！'));
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
