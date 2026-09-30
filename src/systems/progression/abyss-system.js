// ========== abyss-system.js - Abyss challenge system ==========
// Core abyss mode logic: state management, score calc, weekly reset, talent rewards

const AbyssSystem = {
  // state
  isActive: false,       // whether in the abyss
  isTrial: false,        // trial abyss flag (level 10 entry, no leaderboard pressure, pure progression and rewards)
  currentFloor: 0,       // current abyss floor
  startTime: 0,          // this run start time
  score: 0,              // current score
  currentChampion: null, // this week champion nickname
  selectedContracts: [], // selected covenant id
  totalMultiplier: 1.0,  // total score multiplier


  // config
  BASE_LEVEL: 50,        // score calc base level
  MIN_LEVEL: 15,         // real abyss entry threshold (tuned 20 -> 15)
  TRIAL_LEVEL: 10,       // trial abyss threshold (level 10 to enter)

  // covenant configuration
  CONTRACTS: {
    'low_hp': { name: 'Anemia Pact', icon: '🩸', desc: 'Max HP reduced by 30%', multiplier: 0.3 },
    'glass_cannon': { name: 'Glass Pact', icon: '🛡️', desc: 'Defense reduced by 50%', multiplier: 0.4 },
    'slow_motion': { name: 'Slow Motion Pact', icon: '👣', desc: 'Movement speed reduced by 20%', multiplier: 0.2 },
    'elemental_curse': { name: 'Elemental Curse', icon: '🔥', desc: 'All resistances reduced by 40%', multiplier: 0.5 },
    'vampire_bane': { name: 'Vampire Bane Pact', icon: '💉', desc: 'Life leech is disabled', multiplier: 0.4 }
  },

  // bracket configuration
  BRACKETS: [
    { id: 'rookie', name: 'Rookie League', range: [20, 30], icon: '🌱' },
    { id: 'elite', name: 'Elite League', range: [31, 50], icon: '⚔️' },
    { id: 'peak', name: 'Peak League', range: [51, 999], icon: '🔥' }
  ],
  currentLeaderboardBracket: null, // currently viewed bracket id

  // abyss challengetier configuration
  TIERS: [
    { minScore: 25000, nameZh: 'Eternal Legend', nameEs: 'Leyenda Eterna', nameEn: 'Eternal Legend', icon: '👑', color: '#ff4444' },
    { minScore: 12000, nameZh: 'Abyss Master', nameEs: 'Maestro del Abismo', nameEn: 'Abyss Master', icon: '🔮', color: '#aa44ff' },
    { minScore: 6000,  nameZh: 'Diamond Conqueror', nameEs: 'Conquistador de Diamante', nameEn: 'Diamond Conqueror', icon: '💠', color: '#38bdf8' },
    { minScore: 3000,  nameZh: 'Platinum Lord', nameEs: 'Señor de Platino', nameEn: 'Platinum Lord', icon: '💎', color: '#34d399' },
    { minScore: 1500,  nameZh: 'Gold Guardian', nameEs: 'Guardián de Oro', nameEn: 'Gold Guardian', icon: '🥇', color: '#fbbf24' },
    { minScore: 500,   nameZh: 'Silver Vanguard', nameEs: 'Vanguardia de Plata', nameEn: 'Silver Vanguard', icon: '🥈', color: '#cbd5e1' },
    { minScore: 0,     nameZh: 'Bronze Trial', nameEs: 'Prueba de Bronce', nameEn: 'Bronze Trial', icon: '🥉', color: '#d97706' }
  ],

  // Get tier info by score (i18n-aware)
  getTier(score = 0) {
    const numScore = Number(score) || 0;
    const tier = this.TIERS.find(t => numScore >= t.minScore) || this.TIERS[this.TIERS.length - 1];
    // Tier names resolve through the abyssTiers table (keyed by minScore, entries are { name: {es,en,zh} }); TIERS keeps nameZh/nameEs/nameEn for other code
    const name = I18N.trPath('abyssTiers', tier.minScore, 'name', tier.nameZh);
    return {
      ...tier,
      name: `${tier.icon} ${name}`,
      rawName: name
    };
  },

  // Init
  init() {
    this.checkWeeklyReset();
    this.updatePlayerTitle(); // refresh title on startup
  },

  // Update player title by rank (also syncs server best)
  updatePlayerTitle() {
    if (typeof OnlineSystem === 'undefined' || !OnlineSystem.getAbyssLeaderboard) return;

    // Get my bracket range
    const myBracket = this.BRACKETS.find(b => player.lvl >= b.range[0] && player.lvl <= b.range[1]) || this.BRACKETS[this.BRACKETS.length - 1];

    OnlineSystem.getAbyssLeaderboard((data) => {
      if (data.error) return;

      // Sync my best record (from server)
      const myRecord = data.list.find(r => r.isSelf);
      if (myRecord) {
        const localScore = parseInt(localStorage.getItem('abyss_best_score') || '0');
        // Adopt server score if higher
        if (myRecord.score > localScore) {
          localStorage.setItem('abyss_best_score', myRecord.score);
          localStorage.setItem('abyss_best_floor', myRecord.floor);
          console.log(`[Abyss] syncing best record from ${myBracket.name}:`, myRecord.score, 'pts', myRecord.floor, 'F');
        }
      }

      // Get bracket champion (rank 1)
      if (data.list.length > 0) {
        this.currentChampion = data.list[0].name;
      } else {
        this.currentChampion = null;
      }

      // Note: data.myRank is the rank within this bracket
      const rank = data.myRank;

      if (rank <= 0) {
        player.abyssTitle = null;
        localStorage.setItem('abyss_last_rank', 0);
        return;
      }

      // Store bracket rank for weekly settlement
      localStorage.setItem('abyss_last_rank', rank);

      // Update bracket title from bracket rank
      const oldTitle = player.abyssTitle;
      if (rank === 1) {
        player.abyssTitle = `${myBracket.name} King`;
      } else if (rank <= 3) {
        player.abyssTitle = `${myBracket.name} Overlord`;
      } else if (rank <= 10) {
        player.abyssTitle = `${myBracket.name} Elite`;
      } else if (rank <= 50) {
        player.abyssTitle = `${myBracket.name} Walker`;
      } else {
        player.abyssTitle = null;
      }

      // Refresh acquired timestamp when the title changes
      if (player.abyssTitle && player.abyssTitle !== oldTitle) {
        player.abyssTitleObtainedTime = Date.now();
      }

      console.log(`[Abyss] ${myBracket.name} title update:`, player.abyssTitle, 'Rank:', rank);
    }, myBracket.range[0], myBracket.range[1]);
  },

  // Check weekly reset (Mondays 00:00)
  checkWeeklyReset() {
    const now = new Date();
    const lastReset = parseInt(localStorage.getItem('abyss_last_reset') || '0');

    // Timestamp of this Monday 00:00
    const day = now.getDay() || 7; // Sunday is 0; use 7
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(now.getDate() - day + 1);
    const resetTime = monday.getTime();

    if (lastReset < resetTime) {
      // Reset needed
      console.log("[Abyss] running weekly reset...");

      // Grant last week rewards (from stored rank)
      const lastRank = parseInt(localStorage.getItem('abyss_last_rank') || '0');
      if (lastRank > 0 && lastRank <= 50) {
        this.distributeWeeklyReward(lastRank);
      }

      // Reset records
      localStorage.setItem('abyss_last_reset', resetTime);
      localStorage.setItem('abyss_best_floor', 0);
      localStorage.setItem('abyss_best_score', 0);
      localStorage.setItem('abyss_last_rank', 0);
    }
  },

  // Grant weekly leaderboard rewards
  distributeWeeklyReward(rank) {
    const setData = SET_ITEMS['abyss_conqueror'];
    if (!setData) return;

    const pieceKeys = Object.keys(setData.pieces);
    let rewardPieceKeys = [];

    if (rank === 1) rewardPieceKeys = pieceKeys;
    else if (rank <= 3) rewardPieceKeys = this.shuffleArray([...pieceKeys]).slice(0, 3);
    else if (rank <= 10) rewardPieceKeys = this.shuffleArray([...pieceKeys]).slice(0, 2);
    else if (rank <= 50) rewardPieceKeys = this.shuffleArray([...pieceKeys]).slice(0, 1);

    // Space check: free slots in inventory + stash
    const freeInventorySlots = player.inventory.filter(slot => !slot).length;
    const freeStashSlots = player.stash.filter(slot => !slot).length;
    const totalFreeSlots = freeInventorySlots + freeStashSlots;

    if (totalFreeSlots < rewardPieceKeys.length) {
      // Not enough space: show warning panel, keep state
      this.showRewardPanel(rank, `🎒 Not enough space! Requires ${rewardPieceKeys.length} free slot(s)`, [], true);
      return;
    }

    // Enough space: start granting
    const receivedItems = [];
    rewardPieceKeys.forEach(pieceKey => {
      const piece = setData.pieces[pieceKey];
      const item = this.createSetItem('abyss_conqueror', pieceKey, piece);
      if (item) {
        // Inventory first, then stash
        if (!addItemToInventory(item)) {
          const stashIdx = player.stash.findIndex(slot => !slot);
          if (stashIdx !== -1) player.stash[stashIdx] = item;
        }
        receivedItems.push(piece.name);
      }
    });

    // Claimed; clear leaderboard record to prevent double claims
    localStorage.setItem('abyss_last_rank', 0);
    // Record settlement timestamp to avoid re-triggering within the same week
    const now = new Date();
    const day = now.getDay() || 7;
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(now.getDate() - day + 1);
    localStorage.setItem('abyss_last_reset', monday.getTime());

    // Show success panel
    const rewardTitle = rank === 1 ? "🔥 Congrats! Last week's Abyss #1 receives the full Abyss Conqueror set!" :
      rank <= 3 ? "⚔️ Last week's Abyss top 3 receive 3 pieces of the Abyss Conqueror set!" :
        rank <= 10 ? "💀 Last week's Abyss top 10 receive 2 pieces of the Abyss Conqueror set!" :
          "🌑 Last week's Abyss top 50 receive 1 piece of the Abyss Conqueror set!";

    this.showRewardPanel(rank, rewardTitle, receivedItems, false);
  },

  // Show weekly settlement panel
  showRewardPanel(rank, title, items, isFull = false) {
    const old = document.getElementById('abyss-reward-panel');
    if (old) old.remove();

    const titleIcon = isFull ? '⚠️' : (rank === 1 ? '👑' : rank <= 3 ? '⚔️' : rank <= 10 ? '💀' : '🌑');
    const titleColor = isFull ? '#ff4444' : (rank === 1 ? '#ffcc00' : rank <= 3 ? '#ff6666' : rank <= 10 ? '#aa66ff' : '#888888');

    let contentHtml = '';
    if (isFull) {
      contentHtml = `
        <div style="background: rgba(100,0,0,0.3); border: 1px solid #f44; border-radius: 8px; padding: 20px; margin: 15px 0; color: #ff9999; line-height: 1.6;">
          ${title}<br>Clear your bag or stash, then claim from <b>${I18N.t('npc_abyss_guard')}</b>!
        </div>
      `;
    } else {
      const itemsHtml = items.map(name =>
        `<div style="background: rgba(0,100,0,0.2); border: 1px solid #4a4; border-radius: 4px; padding: 8px 12px; margin: 5px 0; color: #88ff88;">
          🎁 ${name}
        </div>`
      ).join('');
      contentHtml = `
        <div style="font-size: 14px; color: #ffcc00; margin-bottom: 20px;">${title}</div>
        <div style="background: rgba(30,30,30,0.8); border: 1px solid #444; border-radius: 8px; padding: 15px; margin: 15px 0;">
          <div style="color: #aaa; font-size: 12px; margin-bottom: 10px;">Deposited into bag/stash:</div>
          ${itemsHtml}
        </div>
      `;
    }

    const html = `
      <div class="panel-header">
        ${titleIcon} Abyss Tournament Results ${titleIcon}
        <div class="panel-close" onclick="AbyssSystem.closeRewardPanel()"></div>
      </div>
      <div class="panel-content" style="padding: 25px; text-align: center;">
        <div style="font-size: 20px; color: ${titleColor}; margin-bottom: 15px;">
          🏆 Last week rank: #${rank}
        </div>
        ${contentHtml}
        <div style="margin-top: 20px;">
          <button class="abyss-btn" style="width: 100%;" 
            onclick="AbyssSystem.closeRewardPanel()">
            ${isFull ? 'Free Up Space' : '✨ Confirm'}
          </button>
        </div>
      </div>
    `;

    const div = document.createElement('div');
    div.id = 'abyss-reward-panel';
    div.className = 'panel active';
    div.style.cssText = 'position:fixed; top:50%; left:50%; width:320px; z-index:3000; box-shadow: 0 0 50px rgba(255,100,100,0.5);';
    div.innerHTML = html;
    document.body.appendChild(div);

    // Pop-in animation
    if (typeof GSAPAnims !== 'undefined') {
      GSAPAnims.panelIn(div, 'center');
    }

    // Play SFX
    if (typeof AudioSys !== 'undefined') {
      AudioSys.play('levelup');
    }
  },

  // Close reward panel
  closeRewardPanel() {
    const el = document.getElementById('abyss-reward-panel');
    if (!el) return;
    if (typeof GSAPAnims !== 'undefined') {
      GSAPAnims.panelOut(el, () => el.remove());
    } else {
      el.remove();
    }
  },

  // Create set item
  createSetItem(setId, pieceKey, pieceData) {
    return {
      id: `${setId}_${pieceKey}_${Date.now()}`,
      name: pieceData.name,
      icon: pieceData.icon,
      type: pieceData.type,
      rarity: 'set',
      setId: setId,
      setPieceKey: pieceKey,
      def: pieceData.def || 0,
      minDmg: pieceData.minDmg || 0,
      maxDmg: pieceData.maxDmg || 0,
      stats: { ...pieceData.stats },
      level: player.lvl
    };
  },

  // Shuffle array
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  },

  // Enter abyss
  enter() {
    if (player.lvl < this.MIN_LEVEL) {
      showNotification(`Level too low! Requires Lv.${this.MIN_LEVEL} for the Abyss`);
      return;
    }

    this.isActive = true;
    this.currentFloor = 1;
    this.startTime = Date.now();
    this.score = 0;

    // Apply selected covenant stat multipliers
    this.calculateMultiplier();


    // set player state
    player.isInHell = true; // reuse the Hell flag for monster strength
    player.hellFloor = 1;

    // disable auto battle
    if (typeof AutoBattle !== 'undefined') {
      AutoBattle.enabled = false;
    }

    // switch scene
    enterFloor(1); // reuse the existing enter-floor logic

    // play SFX and toast
    AudioSys.play('hell_enter');
    showNotification("🔥 Face the Abyss with your own body! Auto battle disabled!", 5000);

    // UpdateUI
    if (typeof updateWorldLabels !== 'undefined') updateWorldLabels();
  },

  // leave the abyss (death or abandon)
  exit(isDeath = false) {
    if (!this.isActive) return;

    const duration = (Date.now() - this.startTime) / 1000;
    this.calculateScore(duration);

    // record best result
    const bestScore = parseInt(localStorage.getItem('abyss_best_score') || '0');
    console.log('[Abyss] run score:', this.score, 'Personal best:', bestScore);

    if (this.score > bestScore) {
      localStorage.setItem('abyss_best_score', this.score);
      localStorage.setItem('abyss_best_floor', this.currentFloor);
      console.log('[Abyss] new record! Preparing upload...');

      // submit score to cloud
      if (typeof OnlineSystem !== 'undefined' && OnlineSystem.submitAbyssScore) {
        OnlineSystem.submitAbyssScore(this.score, this.currentFloor);
        // defer title update (wait for server response)
        setTimeout(() => this.updatePlayerTitle(), 1500);
      } else {
        console.warn('[Abyss] OnlineSystem.submitAbyssScore is undefined!');
      }
    } else {
      console.log('[Abyss] record not beaten, skipping upload');
    }

    // Show settlement panel
    this.showResultPanel(isDeath, duration);

    // Resetstate
    this.isActive = false;
    player.isInHell = false;

    // return to town
    if (typeof enterFloor === 'function') {
      enterFloor(0, 'end');
      // place player near the abyss warden（dungeonEntrance.x - 150, dungeonEntrance.y + 50）
      if (typeof dungeonEntrance !== 'undefined') {
        player.x = dungeonEntrance.x - 120;
        player.y = dungeonEntrance.y + 80;
      }
    }
    if (typeof updateHellIndicator === 'function') {
      updateHellIndicator();
    }

    // key:reset covenants and refresh stats，so values fully restore after returning to town
    this.selectedContracts = [];
    if (typeof updateStats === 'function') updateStats();
    if (typeof updateStatsUI === 'function') updateStatsUI();
  },

  // calc score
  // Score = floors reached × 100 + (base level - actual level) × 50 - elapsed seconds × 0.1
  calculateScore(durationSeconds) {
    const floorScore = this.currentFloor * 100;
    const levelBonus = Math.max(0, (this.BASE_LEVEL - player.lvl) * 50);
    const timePenalty = Math.floor(durationSeconds * 0.1);

    // base score
    let baseScore = floorScore + levelBonus - timePenalty;
    if (baseScore < 0) baseScore = 0;

    // apply covenant multipliers
    this.score = Math.floor(baseScore * this.totalMultiplier);

    console.log('[Abyss] score breakdown:');
    console.log('  Base score:', baseScore);
    console.log('  Pact multiplier: x' + this.totalMultiplier.toFixed(2));
    console.log('  Final score:', this.score);

    return this.score;
  },

  // calc current total multiplier
  calculateMultiplier() {
    let m = 1.0;
    this.selectedContracts.forEach(id => {
      const c = this.CONTRACTS[id];
      if (c) m += c.multiplier;
    });
    this.totalMultiplier = m;
    return m;
  },

  // switch covenant selection
  toggleContract(id) {
    const idx = this.selectedContracts.indexOf(id);
    if (idx >= 0) {
      this.selectedContracts.splice(idx, 1);
    } else {
      this.selectedContracts.push(id);
    }
    this.updateContractUI();

    // refresh stats immediately，so the player sees instant feedback（e.g. HP dropping）
    if (typeof updateStats === 'function') updateStats();
    if (typeof updateStatsUI === 'function') updateStatsUI();
  },

  // update covenant panel UI
  updateContractUI() {
    const listEl = document.getElementById('contract-list');
    if (!listEl) return;

    let html = '';
    for (let id in this.CONTRACTS) {
      const c = this.CONTRACTS[id];
      const selected = this.selectedContracts.includes(id);
      // covenant names/descs resolve through abyssContracts table，CONTRACTS keeps zh fields as fallback
      const cName = I18N.trPath('abyssContracts', id, 'name', c.name);
      const cDesc = I18N.trPath('abyssContracts', id, 'desc', c.desc);
      html += `
        <div class="contract-item ${selected ? 'selected' : ''}" onmousedown="event.stopPropagation(); AbyssSystem.toggleContract('${id}')">
          <div class="contract-icon">${c.icon}</div>
          <div class="contract-info">
            <div class="contract-name">${cName}</div>
            <div class="contract-desc">${cDesc}</div>
          </div>
          <div class="contract-multiplier">+${(c.multiplier * 100).toFixed(0)}%</div>
        </div>
      `;
    }
    listEl.innerHTML = html;

    const m = this.calculateMultiplier();
    const mEl = document.getElementById('total-multiplier-val');
    if (mEl) mEl.innerText = m.toFixed(2);
  },

// Show the covenant selection panel
  showContractPanel() {
    console.log('[Abyss] Opening contract panel...');
    try {
      this.closeEntrancePanel();
      this.selectedContracts = []; // reset selection before each entry

      let panel = document.getElementById('abyss-contract-panel');
      if (panel) panel.remove();

      panel = document.createElement('div');
      panel.id = 'abyss-contract-panel';
      panel.className = 'panel active';
      panel.onmousedown = (e) => e.stopPropagation();
      panel.style.cssText = 'position:fixed; top:50%; left:50%; width:320px; z-index:2500;';

      panel.innerHTML = `
      <div class="panel-header">
        📜 Sign Abyss Pact
        <div class="panel-close" onclick="AbyssSystem.closeContractPanel()"></div>
      </div>
      <div class="panel-content" style="padding:20px;">
        <div style="color:#aaa; font-size:12px; margin-bottom:15px; text-align:center;">
          Higher difficulty means a higher score multiplier. Climb fast!
        </div>
        
        <div id="contract-list" class="contract-list-scroll">
          <!-- Contract items list -->
        </div>

        <div style="margin: 15px 0; padding:10px; background:rgba(0,0,0,0.3); border:1px solid #444; border-radius:4px; display:flex; justify-content:space-between; align-items:center;">
          <span style="color:#aaa;">Current multiplier:</span>
          <span style="color:#ffcc00; font-size:20px; font-weight:bold;">x<span id="total-multiplier-val">1.00</span></span>
        </div>

        <button class="abyss-btn" style="width:100%; margin-top: 10px;" onclick="AbyssSystem.enter(); AbyssSystem.closeContractPanel(true)">
          🔥 Sign Pact & Start Challenge
        </button>
      </div>
    `;
      document.body.appendChild(panel);
      this.updateContractUI();

      // Pop-in animation
      if (typeof GSAPAnims !== 'undefined') {
        GSAPAnims.panelIn(panel, 'center');
      }
    } catch (e) {
      console.error('[Abyss] Error in showContractPanel:', e);
    }
  },

// Close the covenant panel and reset (cancel selection)
  closeContractPanel(isStarting = false) {
    const el = document.getElementById('abyss-contract-panel');
    if (el) {
      if (typeof GSAPAnims !== 'undefined') {
        GSAPAnims.panelOut(el, () => el.remove());
      } else {
        el.remove();
      }
    }
    if (!isStarting) {
      this.selectedContracts = []; // clear selection
      // refresh stats immediately（restorestate）
      if (typeof updateStats === 'function') updateStats();
      if (typeof updateStatsUI === 'function') updateStatsUI();
    }
  },

// Complete the current floor (reach the next-floor entrance)
  onFloorComplete() {
// Force-open the talent shop (free mode)
    if (typeof showTalentShop !== 'undefined') {
      showTalentShop(this.currentFloor + 1, true, true); // true = free mode
    } else {
// Without a talent system, go straight to the next floor
      this.proceedToNextFloor();
    }
  },

// Actually enter the next floor (called after picking talents)
  proceedToNextFloor() {
    this.currentFloor++;
    player.hellFloor = this.currentFloor;

    // playoverfloorSFX
    AudioSys.play('portal');

    // enternewfloor
    enterFloor(player.floor + 1); // these params do not affect floor generation in abyss mode; they mainly trigger a redraw

    showNotification(`Abyss Floor ${this.currentFloor}`);

    // Saveprogress
// (Designed as one-life runs; not persisted for now)
  },

// Open the leaderboard
  openLeaderboard() {
// Check OnlineSystem
    if (typeof OnlineSystem === 'undefined' || !OnlineSystem.getAbyssLeaderboard) {
      showNotification('Leaderboard not connected yet');
      return;
    }

// Create or get the panel
    let panel = document.getElementById('abyss-leaderboard-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'abyss-leaderboard-panel';
      panel.className = 'panel';
      panel.style.cssText = 'position:fixed; top:50%; left:50%; width:320px; z-index:2100;';
      panel.innerHTML = `
            <div class="panel-header">🏆 Abyss Leaderboard <div class="panel-close" onclick="AbyssSystem.closeLeaderboard()"></div></div>
            
            <!-- Bracket tabs -->
            <div class="leaderboard-tabs" id="lb-bracket-tabs">
                ${this.BRACKETS.map(b => `
                    <div class="lb-tab" id="tab-${b.id}" onclick="AbyssSystem.switchBracket('${b.id}')">
                        ${b.icon} ${I18N.trPath('abyssBrackets', b.id, 'name', b.name)}
                    </div>
                `).join('')}
            </div>

            <div class="lb-my-rank" id="lb-my-rank-container">
                <div>
                    <div style="color:#aaa; font-size:12px;" id="lb-bracket-title">My Rank</div>
                    <div style="color:#fff; font-size:16px;" id="lb-my-rank-val">Loading...</div>
                </div>
                <!-- Hall of fame banner -->
                <div id="lb-bracket-rank" style="background: linear-gradient(90deg, #530, #840); padding: 5px 15px; border-radius: 4px; border:1px solid #d80; display:none;">
                    👑 Bracket #<span id="lb-bracket-val" style="color:#ff0; font-size:18px; font-weight:bold;">1</span>
                </div>
            </div>
            <div class="lb-list" id="lb-container" style="flex:1; overflow-y:auto; padding:10px;">
                <div style="text-align:center; padding:50px;">Loading...</div>
            </div>
          `;
      document.body.appendChild(panel);
    }

    panel.classList.add('active');

    // Pop-in animation
    if (typeof GSAPAnims !== 'undefined') {
      GSAPAnims.panelIn(panel, 'center');
    }

// By default open the bracket matching the player's current level
    if (!this.currentLeaderboardBracket) {
      const playerBracket = this.BRACKETS.find(b => player.lvl >= b.range[0] && player.lvl <= b.range[1]) || this.BRACKETS[this.BRACKETS.length - 1];
      this.currentLeaderboardBracket = playerBracket.id;
    }

    this.switchBracket(this.currentLeaderboardBracket);
  },

  // switchbracket
  switchBracket(bracketId) {
    this.currentLeaderboardBracket = bracketId;
    const bracket = this.BRACKETS.find(b => b.id === bracketId);
    if (!bracket) return;

    // Updatetabstyle
    this.BRACKETS.forEach(b => {
      const tab = document.getElementById(`tab-${b.id}`);
      if (tab) tab.classList.toggle('active', b.id === bracketId);
    });

    // pulltake outdata
    const container = document.getElementById('lb-container');
    container.innerHTML = '<div style="text-align:center; padding:50px; color:#666;">⏳ Crossing planes...</div>';

    const bracketName = I18N.trPath('abyssBrackets', bracket.id, 'name', bracket.name);
    document.getElementById('lb-bracket-title').innerText = `${bracketName} · My Rank`;

    OnlineSystem.getAbyssLeaderboard((data) => {
      const myRankEl = document.getElementById('lb-my-rank-val');
      const bracketEl = document.getElementById('lb-bracket-rank');
      const bracketVal = document.getElementById('lb-bracket-val');

      // Updatemyinfo
      if (data.myRank > 0) {
        myRankEl.innerHTML = `#${data.myRank} <span style="color:#fa0; font-size:14px;">(${localStorage.getItem('abyss_best_score')} pts)</span>`;
      } else {
        myRankEl.innerText = "No scores yet";
      }

// Render the list
      if (data.list.length === 0) {
// Bracket level ranges use the abyssBrackets table's {min}/{max}
        const bracketRange = I18N.trPath('abyssBrackets', bracket.id, 'desc', '', { min: bracket.range[0], max: bracket.range[1] });
        container.innerHTML = `<div style="text-align:center; padding:50px; color:#666;">This bracket is empty - no champions yet<br><span style="font-size:12px; color:#444;">(${bracketRange})</span></div>`;
        return;
      }

      container.innerHTML = data.list.map(item => {
        const rankDisplay = item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : item.rank;
        return `
        <div class="lb-item ${item.isSelf ? 'self' : ''} ${item.rank <= 3 ? 'top' + item.rank : ''}">
            <div class="lb-item-rank">${rankDisplay}</div>
            <div class="lb-item-info">
                <div class="lb-item-name">${item.name} <span style="color:#666; font-size:11px;">Lv.${item.lvl}</span></div>
            </div>
            <div style="text-align:right">
                <div class="lb-item-score">${item.score}</div>
                <div class="lb-item-floor">Abyss Floor ${item.floor}</div>
            </div>
        </div>
      `;
      }).join('');
    }, bracket.range[0], bracket.range[1]);
  },

  closeLeaderboard() {
    const panel = document.getElementById('abyss-leaderboard-panel');
    if (panel) {
      if (typeof GSAPAnims !== 'undefined') {
        GSAPAnims.panelOut(panel, () => panel.remove());
      } else {
        panel.remove();
      }
    }
  },

  // Show settlement panel
  showResultPanel(isDeath, duration) {
// Simple dialog; can be upgraded to a dedicated UI later
    const timeStr = Math.floor(duration / 60) + "pts" + Math.floor(duration % 60) + "s";
    const title = isDeath ? "💀 Challenge Failed" : "🏳️ Challenge Over";

    // buildHTML
    const html = `
  < div class="panel-header" style = "color:${isDeath ? '#f44' : '#fff'}" > ${title}</div >
    <div class="panel-content" style="padding:20px; text-align:center;">
      <div style="font-size:18px; margin-bottom:10px;">Floor reached: <span style="color:#fb0">${this.currentFloor}</span></div>
      <div style="font-size:14px; color:#aaa; margin-bottom:10px;">Time: ${timeStr}</div>
      <div style="font-size:24px; color:#0f0; margin:15px 0;">Score: ${this.score}</div>
      <div style="font-size:12px; color:#888;">(Resets Mondays at 00:00)</div>
      <div class="panel-btn-group" style="margin-top:20px;">
        <button onclick="AbyssSystem.backToTown()" class="abyss-btn" style="width: 100%;">Return to Camp</button>
      </div>
    </div>
`;

// Use the standard Panel structure
    const div = document.createElement('div');
    div.id = 'abyss-result-panel';
    div.className = 'panel active'; // Use common panel class
    div.style.cssText = 'position:fixed; top:50%; left:50%; width:320px; z-index:2000;';
    div.innerHTML = html;
    document.body.appendChild(div);

    // Pop-in animation
    if (typeof GSAPAnims !== 'undefined') {
      GSAPAnims.panelIn(div, 'center');
    }
  },

  backToTown() {
    const el = document.getElementById('abyss-result-panel');
    if (el) {
      if (typeof GSAPAnims !== 'undefined') {
        GSAPAnims.panelOut(el, () => el.remove());
      } else {
        el.remove();
      }
    }

    // return to town
    player.isInHell = false;
    player.floor = 0;
    enterFloor(0);
    player.hp = player.maxHp;
    player.mp = player.maxMp;
    SaveSystem.save();
  },

// Enter trial abyss (level 10 entry, relaxed experience, free talent per floor)
  enterTrial() {
    if (player.lvl < this.TRIAL_LEVEL) {
      showNotification(`Level too low! Requires Lv.${this.TRIAL_LEVEL} to open the Trial Abyss`);
      return;
    }

    this.isActive = true;
    this.isTrial = true;
    this.currentFloor = 1;
    this.startTime = Date.now();
    this.score = 0;
    this.totalMultiplier = 1.0;
    this.selectedContracts = [];

    player.isInHell = true;
    player.hellFloor = 1;

    if (typeof AutoBattle !== 'undefined') {
      AutoBattle.enabled = false;
    }

    enterFloor(1);
    AudioSys.play('hell_enter');
    showNotification("🌱 Trial Abyss open! Hone yourself floor by floor and master ancient talents!", 5000);
    this.closeEntrancePanel();
  },

// Show the entrance panel
  showEntrancePanel() {
// Check level: below the trial level
    if (player.lvl < this.TRIAL_LEVEL) {
      showDialog('Abyss Guardian', `Your strength is not enough for the Abyss yet. Come back at Lv.${this.TRIAL_LEVEL} to open the trial.`, [{ text: 'Got it', action: () => closeDialog() }]);
      return;
    }

// Remove the old one first
    const old = document.getElementById('abyss-entrance-panel');
    if (old) old.remove();

// Compute the countdown (to next Monday 00:00)
    const now = new Date();
    const day = now.getDay(); // 0=Sunday, 1=Monday,...
    const daysUntilMonday = day === 0 ? 1 : (8 - day);
    const nextMonday = new Date(now);
    nextMonday.setHours(0, 0, 0, 0);
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    const diff = nextMonday.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    const bestFloor = localStorage.getItem('abyss_best_floor') || 0;
    const bestScore = localStorage.getItem('abyss_best_score') || 0;
    const lastRank = localStorage.getItem('abyss_last_rank');
    const currentRank = (lastRank && lastRank !== '0') ? lastRank : '-';

    const canEnterRanked = player.lvl >= this.MIN_LEVEL;

    const html = `
      <div class="panel-header">🔥 Abyss Challenge <div class="panel-close" onclick="AbyssSystem.closeEntrancePanel()"></div></div>
    <div class="panel-content" style="padding: 20px;">
      <div class="abyss-info-row">
        <span class="abyss-info-label">Weekly best:</span>
        <span class="abyss-info-value">Floor ${bestFloor} (${bestScore} pts)</span>
      </div>
      <div class="abyss-info-row">
        <span class="abyss-info-label">Current rank:</span>
        <span class="abyss-info-value" style="color: #ff8800;">${currentRank === '-' ? 'Not Ranked' : '#' + currentRank}</span>
      </div>

      <div class="abyss-time-left">
        ⏱️ This week left: ${days}d ${hours}h
      </div>

      <div style="background: rgba(100,30,30,0.3); border: 1px solid #633; border-radius: 6px; padding: 10px; margin: 12px 0;">
        <div style="color: #ffcc00; font-size: 13px; text-align: center; margin-bottom: 6px;">🏆 Weekly reward preview</div>
        <div style="font-size: 11px; line-height: 1.7; color: #ccc;">
          <div>🥇 <span style="color:#ff4400;">#1</span> → <span style="color:#00ff88;">Full Abyss Conqueror set</span> + title "Abyss Demon King"</div>
          <div>🥈 <span style="color:#cc2222;">#2-3</span> → 3 set pieces + title "Abyss Overlord"</div>
          <div>🥉 <span style="color:#9933ff;">#4-10</span> → 2 set pieces + title "Abyss Envoy"</div>
          <div>🌑 <span style="color:#888;">#11-50</span> → 1 set piece + title "Abyss Walker"</div>
        </div>
      </div>

      <div class="abyss-btn-group" style="display:flex; flex-direction:column; gap:8px;">
        ${canEnterRanked ? `
          <button class="abyss-btn" onclick="AbyssSystem.showContractPanel()">💀 Sign Pact · Ranked Abyss (Lv.${this.MIN_LEVEL}+)</button>
        ` : `
          <div style="color:#ff9999; font-size:11px; text-align:center;">Ranked Abyss unlocks at Lv.${this.MIN_LEVEL}</div>
        `}
        <button class="abyss-btn" style="background:linear-gradient(135deg, #2b582b, #153015); border-color:#50aa50;" onclick="AbyssSystem.enterTrial()">🌱 Open Trial Abyss (Lv.${this.TRIAL_LEVEL}+ practice mode)</button>
        <button class="abyss-btn" style="background:#222;" onclick="AbyssSystem.openLeaderboard()">🏆 View Tournament Leaderboard</button>
      </div>
    </div>
`;

    const div = document.createElement('div');
    div.id = 'abyss-entrance-panel';
    div.className = 'panel active';
    div.style.cssText = 'position:fixed; top:50%; left:50%; width:330px; z-index:2000;';
    div.innerHTML = html;
    document.body.appendChild(div);

    if (typeof GSAPAnims !== 'undefined') {
      GSAPAnims.panelIn(div, 'center');
    }
  },

  closeEntrancePanel() {
    const el = document.getElementById('abyss-entrance-panel');
    if (!el) return;

    if (typeof GSAPAnims !== 'undefined') {
      GSAPAnims.panelOut(el, () => el.remove());
    } else {
      el.remove();
    }
  },

// Render/update the abyss quick status bar on the HUD (retention polish 4.2)
  renderHUD() {
    if (!player || player.floor === undefined) return;
    let badge = document.getElementById('abyss-hud-status');
    if (player.lvl < this.TRIAL_LEVEL) {
      if (badge) badge.style.display = 'none';
      return;
    }

    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'abyss-hud-status';
      badge.onclick = () => this.showEntrancePanel();
      const container = document.getElementById('game-container') || document.body;
      container.appendChild(badge);
    }

    const lastRank = localStorage.getItem('abyss_last_rank');
    const bestScore = localStorage.getItem('abyss_best_score') || 0;
    const rankText = (lastRank && lastRank !== '0') ? `#${lastRank}` : 'Not Ranked';

    badge.innerHTML = `
      <span class="abyss-hud-badge">🔥 Abyss</span>
      <span>Rank: <b>${rankText}</b></span>
      <span style="color:#aaa; font-size:10px;">(${bestScore} pts)</span>
    `;
    badge.style.display = 'flex';
  },

  // Update HUD (called every frame)
  updateHUD() {
    const floorDisplay = document.getElementById('floor-display');
    const questTracker = document.getElementById('quest-tracker');

    if (!this.isActive) {
      const hud = document.getElementById('abyss-hud');
      if (hud && hud.style.display !== 'none') hud.style.display = 'none';
// Restore floor and quest display
      if (floorDisplay) floorDisplay.style.display = '';
      if (questTracker) questTracker.style.display = '';
      return;
    }

// Hide the original floor display and quest tracker (avoid overlap)
    if (floorDisplay) floorDisplay.style.display = 'none';
    if (questTracker) questTracker.style.display = 'none';

    let hud = document.getElementById('abyss-hud');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'abyss-hud';
      hud.className = 'active';
      hud.innerHTML = `
        <div class="abyss-hud-floor"></div>
        <div class="abyss-hud-time"></div>
        <div class="abyss-hud-warning">💀 Auto battle disabled</div>
      `;
      document.body.appendChild(hud);
    }
    hud.style.display = 'block';

    const duration = (Date.now() - this.startTime) / 1000;
    const min = Math.floor(duration / 60).toString().padStart(2, '0');
    const sec = Math.floor(duration % 60).toString().padStart(2, '0');

    hud.querySelector('.abyss-hud-floor').innerText = `Abyss Floor ${this.currentFloor}`;
    hud.querySelector('.abyss-hud-time').innerText = `⏱ ${min}:${sec} `;
  }
};

