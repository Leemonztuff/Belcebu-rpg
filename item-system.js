// ========== item-system.js - Item system module ==========
// Item generation, usage, equipping, drops and management logic
// Global deps: player, enemies, groundItems, SET_ITEMS, BASE_ITEMS, AFFIXES, AudioSys, particles, damageNumbers
// Global fn deps: updateUI, renderInventory, renderStash, updateBeltUI, showNotification, trackAchievement, getTalentEffect, triggerScreenShake

// ========== Drop position helpers ==========
// Ensure drops land on walkable tiles so A* pathing never fails
function ensureValidDropPosition(x, y) {
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);

    // Inside map and on a wall: find the nearest floor tile
    if (col >= 0 && col < MAP_WIDTH && row >= 0 && row < MAP_HEIGHT && mapData[row][col] === 0) {
        // Search a 3x3 area for a floor tile
        for (let radius = 1; radius <= 3; radius++) {
            for (let dr = -radius; dr <= radius; dr++) {
                for (let dc = -radius; dc <= radius; dc++) {
                    const nr = row + dr;
                    const nc = col + dc;
                    if (nr >= 0 && nr < MAP_HEIGHT && nc >= 0 && nc < MAP_WIDTH && mapData[nr][nc] !== 0) {
                        // Return that tile center
                        return {
                            x: nc * TILE_SIZE + TILE_SIZE / 2,
                            y: nr * TILE_SIZE + TILE_SIZE / 2
                        };
                    }
                }
            }
        }
    }
    // Original spot is fine, return as-is
    return { x, y };
}

// ========== Item visual configuration ==========

const ITEM_FRAMES = {
  'gold': { col: 0, row: 0 },
  'potion_health': { col: 1, row: 0 },
  'potion_mana': { col: 2, row: 0 },
  'scroll': { col: 3, row: 0 },
  'weapon': { col: 0, row: 1 }, // sword default
  'axe': { col: 1, row: 1 },
  'staff': { col: 2, row: 1 },
  'bow': { col: 3, row: 1 },
  'helm': { col: 0, row: 2 },
  'armor': { col: 1, row: 2 },
  'gloves': { col: 2, row: 2 },
  'boots': { col: 3, row: 2 },
  'belt': { col: 0, row: 3 },
  'shield': { col: 1, row: 3 },
  'ring': { col: 2, row: 3 },
  'amulet': { col: 3, row: 3 }
};

function getItemSpriteCoords(item) {
  let type = item.type;
  let key = type;

  if (type === 'potion') {
    key = item.heal ? 'potion_health' : 'potion_mana';
  } else if (type === 'weapon') {
    if (item.name.includes('Axe')) key = 'axe';
    else if (item.name.includes('Bow')) key = 'bow';
    else if (item.name.includes('Staff')) key = 'staff';
    else key = 'weapon';
  } else if (type === 'body') {
    key = 'armor';
  } else if (type === 'gold') {
    key = 'gold';
  }

  // Fallback for mapped names
  if (!ITEM_FRAMES[key] && ITEM_FRAMES[type]) key = type;

  return ITEM_FRAMES[key] || ITEM_FRAMES['gold'];
}

function applyItemSpriteToElement(el, item) {
  // Special rune rendering
  if (item && item.type === 'rune') {
    el.innerText = item.runeSymbol || 'ᚱ';
    el.style.backgroundImage = 'none';
    el.style.backgroundColor = '#181410';
    el.style.color = item.color || '#ffb74d';
    el.style.fontSize = '22px';
    el.style.fontWeight = 'bold';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.borderRadius = '4px';
    el.style.border = `1px solid ${item.color || '#ffb74d'}`;
    el.style.boxShadow = `0 0 6px rgba(255, 183, 77, 0.4), inset 0 1px 3px #000`;
    return;
  }

  // Gear, belts and drop previews share the dark base and small radius; rarity is conveyed by border only.
  el.style.backgroundColor = '#151411';
  el.style.borderRadius = '4px';
  if (typeof itemSpritesLoaded !== 'undefined' && itemSpritesLoaded) {
    const coords = getItemSpriteCoords(item);
    el.innerText = '';
    el.style.backgroundImage = "url('items-painted.webp?v=2026090801')";
    el.style.backgroundSize = '400% 400%';
    el.style.backgroundPosition = `${coords.col * 33.333}% ${coords.row * 33.333}%`;
    el.style.backgroundRepeat = 'no-repeat';
    // Remove text color as we use image now
    el.style.color = 'transparent';

    // Rarity Border
    const rarityColor = getItemColor(item.rarity);
    el.style.border = `1px solid ${rarityColor}`;
    if (item.rarity >= RARITY.RARE) {
      el.style.boxShadow = `0 0 3px ${rarityColor}, inset 0 1px 2px #000`;
    } else {
      el.style.boxShadow = 'inset 0 1px 2px #000';
    }
  } else {
    // Fallback text
    el.innerText = item.icon || '📦';
    el.style.backgroundImage = 'none';
    el.style.color = getItemColor(item.rarity);
    el.style.border = `1px solid ${getItemColor(item.rarity)}`;
    el.style.boxShadow = 'none';
  }
}

function getItemColor(r) {
  if (typeof getRarityColor !== 'undefined') {
    return getRarityColor(r);
  }
  // Fallback if constants.js not loaded (should not happen)
  return '#ffffff';
}

// Stat tracking: record rare item discovery
function trackItemFound(item) {
  if (!item) return;
  if (item.rarity === RARITY.UNIQUE) { // UNIQUE
    player.stats.uniqueFound++;
  } else if (item.rarity === RARITY.SET) { // SET
    player.stats.setFound++;
  }
}

// ========== Item generation logic ==========

function calculateItemRequirements(item, level, rarity) {
  // Potions and scrolls have no requirements
  if (item.type === 'potion' || item.type === 'scroll') {
    return null;
  }

  const requirements = {};
  const effectiveLevel = Math.max(1, level);

  // Base level requirement = floor level
  let levelReq = effectiveLevel;

  // Raise level requirement by rarity
  if (rarity === RARITY.MAGIC) levelReq += 2;  // Magic
  if (rarity === RARITY.RARE) levelReq += 5;  // rare
  if (rarity === RARITY.UNIQUE) levelReq += 10; // Unique
  if (rarity === RARITY.SET) levelReq += 5;  // Set (requirements below Unique)

  requirements.level = levelReq;

  // Requirement caps: make sure gear is equippable at drop level
  // Formula: level × 8 + 15; ~55 at floor 5, ~95 at floor 10, fits sensible stat allocation
  const strCap = effectiveLevel * 8 + 15;
  const dexCap = effectiveLevel * 6 + 10;

  // Set Strength/Dexterity requirements by gear type
  if (item.type === 'weapon') {
    // Weapons: based on damage
    if (item.minDmg) {
      const avgDmg = (item.minDmg + item.maxDmg) / 2;
      requirements.str = Math.min(Math.floor(avgDmg * 2), strCap);
      requirements.dex = Math.min(Math.floor(avgDmg * 1.5), dexCap);
    }
  } else if (item.type === 'armor' || item.type === 'helm' || item.type === 'gloves' ||
    item.type === 'boots' || item.type === 'belt') {
    // Armor: based on defense
    if (item.def) {
      requirements.str = Math.min(Math.floor(item.def * 1.5), strCap);
    }
  } else if (item.type === 'ring' || item.type === 'amulet') {
    // Accessories: lower requirements
    requirements.str = Math.floor(levelReq / 2);
    requirements.dex = Math.floor(levelReq / 2);
  }

  // Keep requirements non-zero
  if (requirements.str) requirements.str = Math.max(5, requirements.str);
  if (requirements.dex) requirements.dex = Math.max(5, requirements.dex);

  return requirements;
}

function createItem(baseName, level) {
  let base = BASE_ITEMS.find(i => i.name === baseName) || BASE_ITEMS[Math.floor(Math.random() * BASE_ITEMS.length)];
  let item = { ...base, id: Math.random().toString(36), stats: {}, displayName: base.name, quantity: 1 };

  if (!item.icon) {
    if (item.type === 'weapon') item.icon = '⚔️';
    if (item.type === 'armor') item.icon = '🛡️';
    if (item.type === 'ring') item.icon = '💍';
  }

  if (level > 1) {
    if (item.minDmg) { item.minDmg += level; item.maxDmg += level * 2; }
    if (item.def) item.def += level;
  }
  if (item.type !== 'potion' && item.type !== 'scroll') {
    const rand = Math.random(); item.rarity = rand < 0.05 ? RARITY.UNIQUE : rand < 0.2 ? RARITY.RARE : rand < 0.5 ? RARITY.MAGIC : RARITY.NORMAL;
  }
  if (item.rarity >= RARITY.MAGIC) {
    const p = AFFIXES.prefixes[Math.floor(Math.random() * AFFIXES.prefixes.length)];
    item.displayName = p.name + " " + item.name; item.stats[p.stat] = Math.floor(Math.random() * (p.max - p.min)) + p.min;
  }
  if (item.rarity >= RARITY.RARE) {
    const s = AFFIXES.suffixes[Math.floor(Math.random() * AFFIXES.suffixes.length)];
    item.displayName += (/^[A-Za-z]/.test(s.name) ? ' ' : '') + s.name; item.stats[s.stat] = (item.stats[s.stat] || 0) + Math.floor(Math.random() * (s.max - s.min)) + s.min;
  }
  if (item.rarity === RARITY.UNIQUE) { item.displayName = "Unique · " + item.name; item.stats.allSkills = 1; item.stats.dmgPct = 50; item.stats.lifeSteal = 5; }

// Compute and add gear requirements
  const requirements = calculateItemRequirements(item, level || 1, item.rarity);
  if (requirements) {
    item.requirements = requirements;
  }

// Rune system: socket generation (weapons, armor, helms)
  item.sockets = 0;
  item.socketedRunes = [];
  item.isRuneword = false;
  item.runewordId = null;

  if (['weapon', 'armor', 'body', 'helm'].includes(item.type)) {
    let maxSockets = 2;
    if (item.type === 'weapon') maxSockets = (level >= 10) ? 4 : ((level >= 5) ? 3 : 2);
    else if (item.type === 'armor' || item.type === 'body') maxSockets = (level >= 8) ? 3 : 2;
    else if (item.type === 'helm') maxSockets = 2;

// White gear has the highest socket chance (35%), blue 25%, rare 20%; uniques/sets never roll sockets
    let socketChance = 0;
    if (item.rarity === RARITY.NORMAL) socketChance = 0.35;
    else if (item.rarity === RARITY.MAGIC) socketChance = 0.25;
    else if (item.rarity === RARITY.RARE) socketChance = 0.20;

    if (Math.random() < socketChance) {
      item.sockets = Math.floor(Math.random() * maxSockets) + 1;
    }
  }

  return item;
}

// generateset items
function createSetItem(setId, pieceSlot, level) {
  const setData = SET_ITEMS[setId];
  if (!setData || !setData.pieces[pieceSlot]) {
    console.error(`Invalid set item: ${setId} - ${pieceSlot}`);
    return null;
  }

  const pieceData = setData.pieces[pieceSlot];

  // Create set item
  const item = {
    ...pieceData,
    setId: setId,
    setPieceKey: pieceSlot,  // Add the piece-slot tag used for codex tracking
    setName: setData.name,
    rarity: RARITY.SET,  // setrarityin order to5（greencolor）
    displayName: pieceData.name,
    id: Math.random().toString(36),
    quantity: 1,
    stats: { ...pieceData.stats }  // Copy the stats object
  };

// Scale stats by level
  if (level > 1) {
    if (item.minDmg) {
      item.minDmg += Math.floor(level * 1.5);
      item.maxDmg += Math.floor(level * 2.5);
    }
    if (item.def) {
      item.def += Math.floor(level * 2);
    }

// Boost some stats in stats per floor (+2% each)
// Unscaled stats: capped or regen types
    const noScaleStats = ['critChance', 'allRes', 'lifeSteal', 'hpRegen', 'mpRegen', 'blockChance',
                          'fireRes', 'coldRes', 'lightningRes', 'poisonRes'];
    if (item.stats) {
      for (let key in item.stats) {
        if (noScaleStats.includes(key)) continue;
// Other stats: maxHp, maxMp, def, dmgPct, attackSpeed, critDamage, fireDmg, etc.
        item.stats[key] = Math.floor(item.stats[key] * (1 + level * 0.02));
      }
    }
  }

// Add gear requirements
  const requirements = calculateItemRequirements(item, level || 1, RARITY.SET);
  if (requirements) {
    item.requirements = requirements;
  }

  return item;
}

// Randomly generate a set item (picked from all sets)
function generateRandomSetItem(level) {
  const setIds = Object.keys(SET_ITEMS).filter(id => id !== 'abyss_conqueror');
  const randomSetId = setIds[Math.floor(Math.random() * setIds.length)];
  const setData = SET_ITEMS[randomSetId];
  const pieceSlots = Object.keys(setData.pieces);
  const randomSlot = pieceSlots[Math.floor(Math.random() * pieceSlots.length)];

  return createSetItem(randomSetId, randomSlot, level);
}

// ========== Rare/Unique/Set loot pickup toppop-up animation system ==========

function formatItemLootName(item) {
  if (!item) return '';
  let name = item.displayName || item.name || '';
  if (typeof I18N === 'undefined') return name;
  // Unique prefix ("Unique · " for new saves, legacy zh prefix for old ones)
  if (name.startsWith('Unique · ')) {
    name = name.replace('Unique · ', I18N.trPath('itemTypes', 'Unique · ', 'name', 'Unique · '));
  } else if (name.startsWith('\u6697\u91d1\u00b7')) {
    name = name.replace('\u6697\u91d1\u00b7', I18N.trPath('itemTypes', 'Unique · ', 'name', 'Unique · '));
  }
  return name;
}

// Item type -> itemTypes table key (English since the i18n base-language migration)
const ITEM_TYPE_KEYS = {
  weapon: 'Combat Weapon', armor: 'Basic Armor', body: 'Chest Armor', helm: 'Helmet', shield: 'Shield',
  ring: 'Magic Ring', amulet: 'Mystic Amulet', gloves: 'Gloves', boots: 'Boots', belt: 'Belt'
};

// Legacy zh keys kept so loot popups from old saves still resolve
const ITEM_TYPE_ZH_KEYS = {
  weapon: '\u6b66\u5668', armor: '\u9632\u5177', body: '\u80f8\u7532', helm: '\u5934\u76d4', shield: '\u76fe\u724c',
  ring: '\u622a\u6307', amulet: '\u9879\u94fe', gloves: '\u624b\u5957', boots: '\u978b\u5b50', belt: '\u8170\u5e26'
};

// Affix localization: prefixes via the i18n.js affixes dict, suffixes via the affixesExtra table
function getSlotTypeName(item, lang) {
  const type = (item && item.type) || 'weapon';
  if (typeof I18N === 'undefined') return ITEM_TYPE_KEYS[type] || 'Legendary Equipment';
  const enKey = ITEM_TYPE_KEYS[type] || 'Legendary Equipment';
  const enEntry = I18N.trPath('itemTypes', enKey, 'name', '');
  if (enEntry) return enEntry;
  const zhKey = ITEM_TYPE_ZH_KEYS[type] || '\u7a00\u6709\u88c5\u5907';
  return I18N.trPath('itemTypes', zhKey, 'name', enKey);
}

// Affix localization: English and legacy zh keys both resolve through I18N.affixes,
// falling back to the affixesExtra content table.
function getAffixDisplayName(affix) {
  if (!affix) return '';
  if (typeof I18N === 'undefined') return affix;
  const lang = I18N.currentLang || 'zh';
  const flat = I18N.affixes ? I18N.affixes[affix] : null;
  if (flat) return flat[lang] || flat.en || affix;
  return I18N.trPath('affixesExtra', affix, 'name', affix);
}

const LootPopupManager = {
  queue: [],
  activeElements: [],

  show: function(item) {
    if (!item) return;
    // only fires forUnique(UNIQUE=4) or set(SET=5) items
    if (item.rarity !== RARITY.UNIQUE && item.rarity !== RARITY.SET && item.rarity < RARITY.UNIQUE) return;

    this.queue.push(item);
    this.processQueue();
  },

  processQueue: function() {
    if (this.queue.length === 0) return;

    let container = document.getElementById('loot-popup-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'loot-popup-container';
      const gameContainer = document.getElementById('game-container') || document.body;
      gameContainer.appendChild(container);
    }

    if (this.activeElements.length >= 3) return;

    const item = this.queue.shift();
    this.createPopupCard(container, item);

    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 300);
    }
  },

  createPopupCard: function(container, item) {
    const lang = (typeof I18N !== 'undefined' && I18N.currentLang) ? I18N.currentLang : 'es';
    const isSet = item.rarity === RARITY.SET;
    const rarityClass = isSet ? 'rarity-set' : 'rarity-unique';

    let headerText = '';
    if (isSet) {
      headerText = lang === 'es' ? '★ OBJETO DE CONJUNTO ★' : (lang === 'en' ? '★ SET ITEM ★' : '★ Set equipment acquired ★');
    } else {
      headerText = lang === 'es' ? '★ OBJETO LEGENDARIO ★' : (lang === 'en' ? '★ LEGENDARY ITEM ★' : '★ Unique equipment acquired ★');
    }

    const nameText = formatItemLootName(item);
    const slotType = getSlotTypeName(item, lang);

    const card = document.createElement('div');
    card.className = `loot-popup-card ${rarityClass}`;

    const iconFrame = document.createElement('div');
    iconFrame.className = 'loot-popup-icon-frame';

    const iconInner = document.createElement('div');
    iconInner.className = 'loot-popup-icon-inner';

    if (typeof applyItemSpriteToElement === 'function') {
      applyItemSpriteToElement(iconInner, item);
    } else {
      iconInner.innerText = item.icon || (item.type === 'weapon' ? '⚔️' : '🛡️');
    }
    iconFrame.appendChild(iconInner);

    const content = document.createElement('div');
    content.className = 'loot-popup-content';

    const header = document.createElement('div');
    header.className = 'loot-popup-header';
    header.innerText = headerText;

    const title = document.createElement('div');
    title.className = 'loot-popup-title';
    title.innerText = nameText;

    const subtitle = document.createElement('div');
    subtitle.className = 'loot-popup-subtitle';
    subtitle.innerText = slotType;

    content.appendChild(header);
    content.appendChild(title);
    content.appendChild(subtitle);

    card.appendChild(iconFrame);
    card.appendChild(content);

    container.appendChild(card);
    this.activeElements.push(card);

    if (typeof AudioSys !== 'undefined' && AudioSys.play) {
      AudioSys.play(isSet ? 'quest' : 'levelup');
    }

    requestAnimationFrame(() => {
      card.classList.add('show');
    });

    setTimeout(() => {
      card.classList.remove('show');
      card.classList.add('hide');

      setTimeout(() => {
        if (card.parentNode) {
          card.parentNode.removeChild(card);
        }
        const idx = this.activeElements.indexOf(card);
        if (idx !== -1) this.activeElements.splice(idx, 1);

        this.processQueue();
      }, 350);
    }, 2800);
  }
};

// Collect achievements advance only once the item actually enters the inventory, so unclaimed drops don't count

function addItemToInventory(i, options = {}) {
  if (i.stackable) {
    const existing = player.inventory.find(invItem => invItem && invItem.name === i.name);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
      renderInventory();
      updateBeltUI();
      AudioSys.play('gold');
      return true;
    }
  }
  const idx = player.inventory.findIndex(x => !x);
  if (idx < 0) return false;
  player.inventory[idx] = i;

  renderInventory();
  updateBeltUI();
  AudioSys.play('gold');

// Check set collection achievements and codex discovery
  trackItemFound(i);

// Daily quest: pick up gear (consumables excluded)
  if (i.rarity === RARITY.UNIQUE) trackAchievement('collect_unique');
  if (i.rarity === RARITY.SET) trackAchievement('collect_set_item');

// Weekly goal: collect rare/unique/set gear
  if (i.setId) {
    if (typeof discoverSetPiece !== 'undefined') discoverSetPiece(i);
    if (typeof checkSetAchievements !== 'undefined') checkSetAchievements();
  }

// Trigger the top pop-up animation for rare/set/unique pickups
  if (typeof DailyQuestSystem !== 'undefined' && i.type !== 'potion' && i.type !== 'scroll' && i.type !== 'gold') {
    DailyQuestSystem.updateProgress('collect_item', 1);
  }

// Find a free stash slot
  if (typeof WeeklyGoalSystem !== 'undefined' && (i.rarity === RARITY.RARE || i.rarity === RARITY.UNIQUE || i.rarity === RARITY.SET)) {
    WeeklyGoalSystem.onRareItemFound();
  }

// Move the item
  if (i && (i.rarity === RARITY.UNIQUE || i.rarity === RARITY.SET) && !options.fromStash && !options.fromUnequip && !options.fromForge) {
    if (typeof LootPopupManager !== 'undefined') {
      LootPopupManager.show(i);
    }
  }

  return true;
}

function moveItemToStash(inventoryIdx) {
  const item = player.inventory[inventoryIdx];
  if (!item) return;

// Refresh the UI
  const stashIdx = player.stash.findIndex(i => !i);
  if (stashIdx === -1) {
    showNotification('Stash is full!');
    return;
  }

  // movementitem
  player.stash[stashIdx] = item;
  player.inventory[inventoryIdx] = null;

  // refreshUI
  hideTooltip();
  renderInventory();
  renderStash();
  showNotification(`Deposited ${item.displayName || item.name} into the stash`);

  // check set collection achievement
  if (item.setId) {
    if (typeof checkSetAchievements !== 'undefined') checkSetAchievements();
  }
}

function moveItemFromStash(stashIdx) {
  const item = player.stash[stashIdx];
  if (!item) return;

// Refresh the UI
  const inventoryIdx = player.inventory.findIndex(i => !i);
  if (inventoryIdx === -1) {
    showNotification('Inventory is full!');
    return;
  }

  // movementitem
  player.inventory[inventoryIdx] = item;
  player.stash[stashIdx] = null;

  // refreshUI
  hideTooltip();
  renderInventory();
  renderStash();
  showNotification(`Withdrew ${item.displayName || item.name} from the stash`);

  // check set collection achievement
  if (item.setId) {
    if (typeof checkSetAchievements !== 'undefined') checkSetAchievements();
  }
}

// drinking a red potion resets the kill streak

function useOrEquipItem(idx) {
  const item = player.inventory[idx]; if (!item) return;

  const shop = document.getElementById('shop-panel');
  if (shop.style.display === 'block') {
    let val = 50;
    if (item.rarity > RARITY.NORMAL) val *= item.rarity * 2;
    addGold(val);

    if (item.stackable && item.quantity > 1) {
      item.quantity--;
    } else {
      player.inventory[idx] = null;
    }

    createDamageNumber(player.x, player.y - 40, `+${val} G`, 'gold');
    AudioSys.play('gold');
    renderInventory();
    updateBeltUI();

// play the potion-drinking SFX
    if (typeof showSellTooltip !== 'undefined') showSellTooltip(idx, val);
    return;
  }

  if (item.type === 'potion') {
    if (item.heal) {
      player.hp = Math.min(player.maxHp, player.hp + item.heal);
      player.stats.currentStreak = 0; // drinking a red potion resets the kill streak
    }
    if (item.mana) player.mp = Math.min(player.maxMp, player.mp + item.mana);
    AudioSys.play('potion'); // play the potion-drinking SFX
    if (typeof spawnVfxEffect !== 'undefined') {
      spawnVfxEffect('potionUse', player.x, player.y + 8, 1, 0);
    }
    // daily quest:usepotion
    if (typeof DailyQuestSystem !== 'undefined') {
      DailyQuestSystem.updateProgress('use_potion', 1);
    }

    if (item.quantity > 1) {
      item.quantity--;
    } else {
      player.inventory[idx] = null;
    }
  }
  else if (item.type === 'scroll') {
    // Hellinthere is nomethodusetown portal scroll
    if (player.isInHell) {
      showNotification("Cannot use Town Portal in Hell");
      return;
    }
    if (player.floor !== 0) {
// Fire the beam effect and SFX immediately (don't wait for the cast)
      if (typeof portalRitual !== 'undefined') {
        portalRitual.active = true;
        portalRitual.phase = 0;
        portalRitual.timer = PORTAL_RITUAL_DURATIONS.casting;
        portalRitual.returnFloor = player.floor;
        portalRitual.scrollIdx = idx;
        portalRitual.flashAlpha = 0;
      }

      // consumescroll
      if (item.quantity > 1) item.quantity--; else player.inventory[idx] = null;

// Requirements unmet: refuse to equip
      if (typeof createPortalBeam !== 'undefined') createPortalBeam(player.x, player.y);
      if (typeof spawnVfxEffect !== 'undefined') {
        spawnVfxEffect('portalOpen', player.x, player.y, 1, 0);
      }
      AudioSys.playPortalOpen();
      triggerScreenShake(4, 0.2);

      showNotification("Casting town portal...");
    } else {
      showNotification("You are already in camp");
    }
  }
  else {
    let s = null;
    if (item.type === 'weapon') s = 'mainhand'; if (item.type === 'armor') s = 'body'; if (item.type === 'ring') s = 'ring';
    if (item.type === 'helm') s = 'helm'; if (item.type === 'gloves') s = 'gloves'; if (item.type === 'boots') s = 'boots';
    if (item.type === 'belt') s = 'belt'; if (item.type === 'amulet') s = 'amulet';

    if (s) {
// Requirements met: equip
      if (item.requirements) {
        const req = item.requirements;
        const failedReqs = [];

        if (req.level && player.lvl < req.level) {
          failedReqs.push(`Lv${req.level}`);
        }
        if (req.str && player.str < req.str) {
          failedReqs.push(`STR ${req.str}`);
        }
        if (req.dex && player.dex < req.dex) {
          failedReqs.push(`DEX ${req.dex}`);
        }

        // Requirements unmet: refuse to equip
        if (failedReqs.length > 0) {
          createFloatingText(player.x, player.y - 40, `Requirements not met: ${failedReqs.join(', ')}`, '#ff4444', 2);
          return;
        }
      }

// ========== Drop system ==========
      const cur = player.equipment[s];
      player.equipment[s] = item;
      player.inventory[idx] = cur;
      if (typeof updateStats !== 'undefined') updateStats();
    }
  }
  renderInventory();
  if (typeof updateStatsUI !== 'undefined') updateStatsUI();
  updateBeltUI();
}

function useQuickItem(type) {
  let targetName = "";
  if (typeof CONSUMABLE_NAME !== 'undefined') {
    if (type === 'health') targetName = CONSUMABLE_NAME.HEALTH_POTION;
    if (type === 'mana') targetName = CONSUMABLE_NAME.MANA_POTION;
    if (type === 'scroll') targetName = CONSUMABLE_NAME.TOWN_PORTAL;
  } else {
    // Fallback hardcoded values
    if (type === 'health') targetName = 'Health Potion';
    if (type === 'mana') targetName = 'Mana Potion';
    if (type === 'scroll') targetName = 'Town Portal Scroll';
  }

  const idx = player.inventory.findIndex(i => i && i.name === targetName);
  if (idx !== -1) {
    useOrEquipItem(idx);
  } else {
    showNotification("No such item!");
  }
}

// ========== dropsystem ==========

// Create beam particles
function createDropBeam(x, y, rarity) {
  const isRare = rarity === RARITY.RARE;
  const isUnique = rarity === RARITY.UNIQUE;
  const isSet = rarity === RARITY.SET;

  if (!isRare && !isUnique && !isSet) return;
  if (typeof spawnVfxEffect !== 'undefined') {
    spawnVfxEffect('rareDropBurst', x, y, isUnique ? 1.05 : (isSet ? 0.98 : 0.78), 0);
  }

  // light pillarcolor
  const beamColor = isUnique ? '#ffd700' : (isSet ? '#00ff88' : '#fff05a');
  const glowColor = isUnique ? 'rgba(255, 215, 0, 0.6)' : (isSet ? 'rgba(0, 255, 136, 0.6)' : 'rgba(255, 240, 90, 0.42)');

// Play SFX and shake the screen
  particles.push({
    type: 'drop_beam',
    x: x,
    y: y,
    color: beamColor,
    glowColor: glowColor,
    life: isRare ? 0.85 : 1.5,
    maxLife: isRare ? 0.85 : 1.5,
    height: isRare ? 125 : 200,
    width: isUnique ? 40 : (isSet ? 30 : 22),
    isUnique: isUnique
  });

// Achievement tracking: Fallen One kill
  const sparkCount = isUnique ? 25 : (isSet ? 15 : 9);
  for (let i = 0; i < sparkCount; i++) {
    const angle = (Math.PI * 2 / sparkCount) * i + Math.random() * 0.3;
    const speed = 80 + Math.random() * 120;
    const sparkColor = isUnique ?
      ['#ffd700', '#ffaa00', '#ff8800', '#ffffff'][Math.floor(Math.random() * 4)] :
      isSet ?
        ['#00ff88', '#00ffaa', '#88ffcc', '#ffffff'][Math.floor(Math.random() * 4)] :
        ['#fff05a', '#ffd24a', '#ffffff'][Math.floor(Math.random() * 3)];

    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 100 + Math.random() * 50,
      color: sparkColor,
      life: (isRare ? 0.45 : 1.0) + Math.random() * 0.5,
      size: (isRare ? 2 : 3) + Math.random() * (isRare ? 2 : 4),
      gravity: 200
    });
  }

  // play SFXandscreen shake
  if (isUnique) {
    AudioSys.play('drop_unique');
    triggerScreenShake(8, 0.25);
  } else {
    if (isSet) AudioSys.play('drop_set');
    triggerScreenShake(isSet ? 5 : 3, isSet ? 0.2 : 0.12);
  }
}

function dropLoot(monster) {
  // Achievement tracking: Fallen One kill
  trackAchievement('kill_monster', { monsterName: monster.name });

// ========== Gold drops (floor bonus) ==========
  if (monster.isBoss || monster.isQuestTarget) {
    trackAchievement('kill_boss', { isBoss: monster.isBoss, isQuestTarget: monster.isQuestTarget });
    const baseMonsterName = (typeof stripBossDifficultyPrefix === 'function') ? stripBossDifficultyPrefix(monster.name) : monster.name.replace(/^(?:Hell|Pesadilla|Infierno|Tormento\\d*)\s*/, '');
    trackAchievement('kill_specific_boss', { name: baseMonsterName });
  }

  const x = monster.x;
  const y = monster.y;
  const f = player.isInHell ? player.hellFloor : player.floor;
  const isBoss = monster.isBoss || monster.isQuestTarget;
  const isElite = monster.rarity > 0;

// Base gold grows with floors
  if (isElite && !isBoss) {
    trackAchievement('kill_elite', { isElite: true });
  }

// Greed talent + Divine Blessing: gold bonus
  let goldBase = 10 + f * 5;  // Double gold buff
  let goldAmount = Math.floor(goldBase + Math.random() * goldBase);
  if (isBoss) goldAmount *= 3;
  else if (isElite) goldAmount *= 1.5;

  // Greed talent + Divine Blessing: gold bonus
  const greedBonus = getTalentEffect('goldPct', 0) + (player.goldPct || 0);
  if (greedBonus > 0) {
    goldAmount = Math.floor(goldAmount * (1 + greedBonus / 100));
  }

// Every 8 monsters or a boss kill guarantees a consumable
  if (player.goldBuffExpiry && Date.now() < player.goldBuffExpiry) {
    goldAmount *= 2;
  }

  const validPos = ensureValidDropPosition(x, y);
  groundItems.push({
    type: 'gold', val: Math.floor(goldAmount),
    x: validPos.x, y: validPos.y, z: 0,
    vx: (Math.random() - 0.5) * 150,
    vy: (Math.random() - 0.5) * 150,
    vz: 150 + Math.random() * 100,
    bounces: 2,
    soundLand: 'land_gold',
    rarity: RARITY.COMMON, name: Math.floor(goldAmount) + " Gold", icon: '💰', dropTime: Date.now()
  });

// ========== Gear drop system ==========
  player.killsSincePotion = (player.killsSincePotion || 0) + 1;
  if (player.killsSincePotion >= 8 || isBoss) {
// Floor bonus: +2% drop rate and +1% quality per floor (reduced magnitudes)
    const rand = Math.random();
    let dropItem;
    if (rand < 0.6) {
      dropItem = { type: 'potion', name: 'Health Potion', heal: 50, rarity: RARITY.COMMON, stackable: true, count: 1 };
    } else if (rand < 0.88) {
      dropItem = { type: 'potion', name: 'Mana Potion', mana: 30, rarity: RARITY.COMMON, stackable: true, count: 1 };
    } else {
      dropItem = { type: 'scroll', name: 'Town Portal Scroll', rarity: RARITY.COMMON, stackable: true, count: 1 };
    }
    const validPos = ensureValidDropPosition(x, y);
    groundItems.push({
      ...dropItem,
      x: validPos.x, y: validPos.y, z: 0,
      vx: (Math.random() - 0.5) * 100,
      vy: (Math.random() - 0.5) * 100,
      vz: 120 + Math.random() * 80,
      bounces: 2,
      soundLand: dropItem.type === 'potion' || dropItem.type === 'scroll' ? 'land_soft' : 'land_hard',
      dropTime: Date.now()
    });
    player.killsSincePotion = 0;
  }

// Max +25%
// Max +15%
  const floorDropBonus = Math.min(f * 0.02, 0.25);      // highest+25%
  const floorQualityBonus = Math.min(f * 0.01, 0.15);   // highest+15%

// Treasure Hunter talent + Divine Blessing: drop rate bonus
  const luckBonus = Math.min((player.luckAccumulator || 0) * 0.005, 0.15);  // highest+15%

// Extra +100% drop rate
  let treasureHunterBonus = (getTalentEffect('dropRatePct', 0) + (player.dropRatePct || 0)) / 100;

// Boss gear count scales with floors: 3 on 1-10, 4 on 11-20, 5 on 21+
  if (player.dropBuffExpiry && Date.now() < player.dropBuffExpiry) {
    treasureHunterBonus += 1.0;  // additional+100%droprate
  }

// Bosses drop 3-5 gear pieces by floor
  let bossEquipmentCount = 3;
  if (f > 20) bossEquipmentCount = 5;
  else if (f > 10) bossEquipmentCount = 4;

// Boss base +30% quality
  let dropChance, dropCount, qualityBonus;

  if (isBoss) {
    dropChance = 1.0;
    dropCount = bossEquipmentCount;  // BOSSbyfloordrop3-5piecegear
    qualityBonus = 0.30 + floorQualityBonus;  // BOSSbase+30%quality
  } else if (isElite) {
    dropChance = 0.45 + floorDropBonus + luckBonus + treasureHunterBonus;  // 45%startstep
    dropCount = 1;
    qualityBonus = 0.10 + floorQualityBonus + luckBonus;
  } else {
    dropChance = 0.25 + floorDropBonus + luckBonus + treasureHunterBonus;  // 25%startstep
    dropCount = 1;
    qualityBonus = floorQualityBonus + luckBonus;
  }

  let droppedGoodItem = false;  // Set drop rate ×0.2 (-80%)

// Unique drop rate ×0.4 (-60%)
  const isAutoBattle = typeof AutoBattle !== 'undefined' && AutoBattle.enabled;
  const autoBattleSetPenalty = isAutoBattle ? 0.2 : 1.0;      // setfallrate ×0.2（lower80%）
  const autoBattleUniquePenalty = isAutoBattle ? 0.4 : 1.0;   // Uniquefallrate ×0.4（lower60%）

  for (let i = 0; i < dropCount; i++) {
    if (Math.random() < dropChance) {
      let item = null;

      // ========== setdrop ==========
// Luck influence reduced to 5%
      const setBaseChance = isBoss ? 0.15 : (isElite ? 0.03 : (f >= 5 ? 0.01 : 0.003));
      const setFloorBonus = f >= 10 ? 0.01 : 0;  // 10layerabove+1%
      const setLuckBonus = luckBonus * 0.05;     // Server announce: set obtained
      const setChance = (setBaseChance + setFloorBonus + setLuckBonus) * autoBattleSetPenalty;  // ========== Normal gear drops ==========
      if (Math.random() < setChance) {
        item = generateRandomSetItem(f);
        if (item) {
          droppedGoodItem = true;
          // server-wide announce:unlockedset
          if (typeof OnlineSystem !== 'undefined') {
            OnlineSystem.announce('set_drop', item.displayName || item.name);
          }
        }
      }

// The higher the bonus, the better the loot
      if (!item) {
        item = createItem(null, f);

// Bosses guarantee a rare and have raised unique odds (matching the buffed difficulty)
        const qualityRoll = Math.random();
        const adjustedRoll = qualityRoll - qualityBonus;  // AFK mode: unique threshold ×0.7

        if (isBoss) {
// elite
// Normal monster
          if (adjustedRoll < 0.05 * autoBattleUniquePenalty) { item.rarity = RARITY.UNIQUE; droppedGoodItem = true; }
          else if (adjustedRoll < 0.35) { item.rarity = RARITY.RARE; droppedGoodItem = true; }
          else { item.rarity = RARITY.MAGIC; droppedGoodItem = true; }
        } else if (isElite) {
          // elite
          if (adjustedRoll < 0.015 * autoBattleUniquePenalty) { item.rarity = RARITY.UNIQUE; droppedGoodItem = true; }
          else if (adjustedRoll < 0.12) { item.rarity = RARITY.RARE; droppedGoodItem = true; }
          else if (adjustedRoll < 0.45) { item.rarity = RARITY.MAGIC; droppedGoodItem = true; }
          else item.rarity = RARITY.NORMAL;
        } else {
          // normalmonster
          if (adjustedRoll < 0.005 * autoBattleUniquePenalty) { item.rarity = RARITY.UNIQUE; droppedGoodItem = true; }
          else if (adjustedRoll < 0.04) { item.rarity = RARITY.RARE; droppedGoodItem = true; }
          else if (adjustedRoll < 0.20) { item.rarity = RARITY.MAGIC; droppedGoodItem = true; }
          else item.rarity = RARITY.NORMAL;
        }

// High-quality drop VFX
        if (item.rarity === RARITY.UNIQUE && !item.displayName.startsWith('Unique')) {
          item.displayName = "Unique · " + item.name;
          item.stats.allSkills = (item.stats.allSkills || 0) + 1;
          item.stats.dmgPct = (item.stats.dmgPct || 0) + 50;
          item.stats.lifeSteal = (item.stats.lifeSteal || 0) + 5;
        }
      }

// ========== Rune drops ==========
      const angle = (Math.PI * 2 / dropCount) * i + (Math.random() * 0.5 - 0.25);
      const speed = 80 + Math.random() * 60;

      const validPos = ensureValidDropPosition(x, y);
      item.x = validPos.x;
      item.y = validPos.y;
      item.z = 0;
      item.vx = Math.cos(angle) * speed;
      item.vy = Math.sin(angle) * speed;
      item.vz = (item.rarity >= RARITY.UNIQUE ? 200 : 150) + Math.random() * 50;
      item.bounces = 2;
      item.soundLand = 'land_hard';
      item.dropTime = Date.now();
      groundItems.push(item);

// ========== Boss bonus drops (gold piles + potions + town portal) ==========
      if (item.rarity >= RARITY.RARE) {
        createDropBeam(item.x, item.y, item.rarity);
      }
    }
  }

  // ========== runedrop (Rune Drops) ==========
  const runeDropChance = isBoss ? 0.35 : (isElite ? 0.12 : 0.025);
  if (Math.random() < runeDropChance && typeof createRuneItem === 'function') {
    const runePool = ['el', 'eld', 'tir', 'nef', 'eth'];
    if (f >= 4) runePool.push('ith', 'tal');
    if (f >= 7) runePool.push('ral', 'ort');
    if (f >= 10) runePool.push('thul', 'amn');
    if (f >= 14 || player.isInHell) runePool.push('sol', 'shael');

    const chosenKey = runePool[Math.floor(Math.random() * runePool.length)];
    const rune = createRuneItem(chosenKey);
    if (rune) {
      const validPos = ensureValidDropPosition(x, y);
      groundItems.push({
        ...rune,
        x: validPos.x,
        y: validPos.y,
        z: 0,
        vx: (Math.random() - 0.5) * 110,
        vy: (Math.random() - 0.5) * 110,
        vz: 170 + Math.random() * 60,
        bounces: 2,
        soundLand: 'land_hard',
        dropTime: Date.now()
      });
      createDropBeam(validPos.x, validPos.y, RARITY.RARE);
    }
  }

  // ========== BOSSextradrop（goldpile+potion+town portal scroll） ==========
  if (isBoss) {
// 3-5 piles
    // fixlogic
    const coinStacks = 3 + Math.floor(Math.random() * 3); // 3-5pile
    for (let i = 0; i < coinStacks; i++) {
      let goldAmount;
      if (f <= 10) goldAmount = 100 + Math.floor(Math.random() * 200); // 1-10layer:100-300
      else if (f <= 20) goldAmount = 300 + Math.floor(Math.random() * 300); // 11-20layer:300-600
      else goldAmount = 500 + Math.floor(Math.random() * 500); // 21layer+:500-1000

      const angle = (Math.PI * 2 / coinStacks) * i + (Math.random() * 0.5 - 0.25);
      const speed = 60 + Math.random() * 40;

      const validPos = ensureValidDropPosition(x, y);
      groundItems.push({
        type: 'gold', val: Math.floor(goldAmount),
        x: validPos.x, y: validPos.y, z: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        vz: 120 + Math.random() * 80,
        bounces: 2,
        soundLand: 'land_gold',
        rarity: RARITY.COMMON, name: Math.floor(goldAmount) + " Gold", icon: '💰', dropTime: Date.now()
      });
    }
    // Potions: 1-2 of each red and blue
    const healthPotionCount = 1 + Math.floor(Math.random() * 2); // 1-2 bottles
    const manaPotionCount = 1 + Math.floor(Math.random() * 2); // 1-2 bottles

    for (let i = 0; i < healthPotionCount; i++) {
      const angle = (Math.PI * 2 / healthPotionCount) * i + (Math.random() * 0.5 - 0.25);
      const speed = 40 + Math.random() * 40;
      const validPos = ensureValidDropPosition(x + Math.cos(angle) * speed, y + Math.sin(angle) * speed);
      groundItems.push({
        type: 'potion', name: 'Health Potion', heal: 50, rarity: RARITY.COMMON, stackable: true, count: 1,
        x: validPos.x, y: validPos.y, z: 0,
        vx: (Math.random() - 0.5) * 80,
        vy: (Math.random() - 0.5) * 80,
        vz: 100 + Math.random() * 50,
        bounces: 2,
        soundLand: 'land_soft',
        dropTime: Date.now()
      });
    }

    for (let i = 0; i < manaPotionCount; i++) {
      const angle = (Math.PI * 2 / manaPotionCount) * i + (Math.random() * 0.5 - 0.25);
      const speed = 40 + Math.random() * 40;
      const validPos = ensureValidDropPosition(x + Math.cos(angle) * speed, y + Math.sin(angle) * speed);
      groundItems.push({
        type: 'potion', name: 'Mana Potion', mana: 30, rarity: RARITY.COMMON, stackable: true, count: 1,
        x: validPos.x, y: validPos.y, z: 0,
        vx: (Math.random() - 0.5) * 80,
        vy: (Math.random() - 0.5) * 80,
        vz: 100 + Math.random() * 50,
        bounces: 2,
        soundLand: 'land_soft',
        dropTime: Date.now()
      });
    }

    // town portal scroll:1-2
    const scrollCount = 1 + Math.floor(Math.random() * 2); // 1-2
    for (let i = 0; i < scrollCount; i++) {
      const angle = (Math.PI * 2 / scrollCount) * i + (Math.random() * 0.5 - 0.25);
      const speed = 40 + Math.random() * 40;
      const validPos = ensureValidDropPosition(x + Math.cos(angle) * speed, y + Math.sin(angle) * speed);
      groundItems.push({
        type: 'scroll', name: 'Town Portal Scroll', rarity: RARITY.COMMON, stackable: true, count: 1,
        x: validPos.x, y: validPos.y, z: 0,
        vx: (Math.random() - 0.5) * 100,
        vy: (Math.random() - 0.5) * 100,
        vz: 120 + Math.random() * 80,
        bounces: 2,
        soundLand: 'land_soft',
        dropTime: Date.now()
      });
    }
  }

// Beam color: blue-purple theme
  if (droppedGoodItem) {
    player.luckAccumulator = 0;
  } else {
    player.luckAccumulator = Math.min((player.luckAccumulator || 0) + 1, 50);
  }

  if (typeof updateWorldLabels !== 'undefined') updateWorldLabels();
}

// Create beam particles
function createPortalBeam(x, y) {
// Lasts 1.2 seconds
  const beamColor = '#6699ff';
  const glowColor = 'rgba(100, 150, 255, 0.6)';

// Taller beam
  particles.push({
    type: 'drop_beam',
    x: x,
    y: y,
    color: beamColor,
    glowColor: glowColor,
    life: 1.2,           // duration1.2second
    maxLife: 1.2,
    height: 250,         // Spark particles (blue family)
    width: 50,
    isUnique: true       // Offset upward
  });

// Gravity effect
  const sparkCount = 30;
  for (let i = 0; i < sparkCount; i++) {
    const angle = (Math.PI * 2 / sparkCount) * i + Math.random() * 0.3;
    const speed = 100 + Math.random() * 150;
    const sparkColor = ['#6699ff', '#88aaff', '#aaccff', '#ffffff'][Math.floor(Math.random() * 4)];

    particles.push({
      x: x,
      y: y - 20,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 120,  // towardupoffset by
      color: sparkColor,
      life: 0.8 + Math.random() * 0.4,
      size: 2 + Math.random() * 4,
      gravity: 120  // gravityeffect
    });
  }

// ========== Socketing mode controller ==========
  for (let i = 0; i < 15; i++) {
    particles.push({
      type: 'rising_spark',
      x: x + (Math.random() - 0.5) * 40,
      y: y,
      vy: -180 - Math.random() * 120,
      color: beamColor,
      life: 1.0 + Math.random() * 0.5,
      size: 3 + Math.random() * 3
    });
  }
}

// ========== Trucos para Pruebas de Sets ==========
window.cheatGetSet = function(setId) {
  if (typeof SET_ITEMS === 'undefined') {
    showNotification('Base de datos de sets no disponible.');
    return;
  }
  const setData = SET_ITEMS[setId];
  if (!setData) {
    const list = Object.keys(SET_ITEMS).join(', ');
    showNotification(`Set no encontrado: ${setId}`);
    console.warn(`Set no encontrado: ${setId}. Disponibles: ${list}`);
    return;
  }

  showNotification(`¡Obteniendo piezas del set: ${getSetName(setId)}!`);
  let count = 0;
  Object.keys(setData.pieces).forEach(pieceSlot => {
    const item = createSetItem(setId, pieceSlot, player.lvl || 12);
    if (item) {
      const added = addItemToInventory(item);
      if (added) count++;
    }
  });

  if (count > 0) {
    showNotification(`Añadidas ${count} piezas al inventario.`);
  } else {
    showNotification('No se pudieron añadir piezas (¿inventario lleno?)');
  }
};

// Refresh the inventory to highlight socketable gear
let currentSocketingRune = null;
let currentSocketingIndex = -1;

function isSocketingModeActive() {
  return !!currentSocketingRune;
}

function getActiveSocketingRune() {
  return currentSocketingRune;
}

function startSocketingMode(runeItem, index) {
  if (!runeItem || runeItem.type !== 'rune') return;

// Validate the target gear
  if (currentSocketingRune && currentSocketingRune.id === runeItem.id) {
    cancelSocketingMode();
    return;
  }

  currentSocketingRune = runeItem;
  currentSocketingIndex = index;

  const lang = (typeof I18N !== 'undefined' && I18N.currentLang) ? I18N.currentLang : 'zh';
  let msg = 'Click gear with an empty socket to socket (click the rune again to cancel)';
  if (lang === 'es') msg = 'Haz clic en un equipo con huecos libres para engarzar';
  else if (lang === 'en') msg = 'Click an equipment with empty sockets to insert the rune';

  if (typeof showNotification === 'function') {
    showNotification(msg, 'gold');
  }
  if (typeof AudioSys !== 'undefined' && AudioSys.play) {
    AudioSys.play('gold');
  }

// Consume the rune
  if (typeof renderInventory === 'function') renderInventory();
  if (typeof renderStash === 'function') renderStash();
}

function cancelSocketingMode() {
  if (!currentSocketingRune) return;
  currentSocketingRune = null;
  currentSocketingIndex = -1;

  if (typeof renderInventory === 'function') renderInventory();
  if (typeof renderStash === 'function') renderStash();
}

function trySocketRuneIntoTarget(targetItem, targetSlotIndex) {
  if (!currentSocketingRune) return false;

// Cheat command to test rune acquisition quickly
  if (typeof canItemAcceptRune === 'function' && !canItemAcceptRune(targetItem, currentSocketingRune)) {
    const lang = (typeof I18N !== 'undefined' && I18N.currentLang) ? I18N.currentLang : 'zh';
    let err = 'No empty socket here, or this rune cannot be inserted!';
    if (lang === 'es') err = '¡Este equipo no tiene huecos libres para engarzar!';
    else if (lang === 'en') err = 'This equipment has no empty sockets!';
    if (typeof showNotification === 'function') showNotification(err, 'danger');
    return false;
  }

  const res = socketRuneIntoItem(targetItem, currentSocketingRune);
  if (!res || !res.success) {
    return false;
  }

  // consumerune
  const runeIdx = currentSocketingIndex;
  if (player.inventory[runeIdx] && player.inventory[runeIdx].id === currentSocketingRune.id) {
    player.inventory[runeIdx] = null;
  } else {
    const foundIdx = player.inventory.findIndex(it => it && it.id === currentSocketingRune.id);
    if (foundIdx !== -1) player.inventory[foundIdx] = null;
  }

  if (typeof AudioSys !== 'undefined' && AudioSys.play) {
    AudioSys.play('craft');
  }

  const lang = (typeof I18N !== 'undefined' && I18N.currentLang) ? I18N.currentLang : 'zh';

  if (res.runewordCompleted && res.runeword) {
    if (typeof SeasonSystem !== 'undefined') {
      SeasonSystem.trackRunewordCrafted();
    }
    const rw = res.runeword;
    const rwName = getRunewordName(rw.id);

    let successMsg = `✨ Runeword "${rwName}" awakened!`;
    if (lang === 'es') successMsg = `✨ ¡Palabra Rúnica [${rwName}] Despertada!`;
    else if (lang === 'en') successMsg = `✨ Runeword [${rwName}] Activated!`;

    if (typeof showNotification === 'function') {
      showNotification(successMsg, 'gold');
    }
    if (typeof AudioSys !== 'undefined' && AudioSys.play) {
      AudioSys.play('quest');
    }
    if (typeof triggerScreenShake === 'function') {
      triggerScreenShake(8, 0.3);
    }
  } else {
    let successMsg = `Rune socketed into "${targetItem.displayName || targetItem.name}"`;
    if (lang === 'es') successMsg = `Runa engarzada en ${targetItem.displayName || targetItem.name}`;
    else if (lang === 'en') successMsg = `Rune socketed into ${targetItem.displayName || targetItem.name}`;
    if (typeof showNotification === 'function') showNotification(successMsg, 'gold');
  }

  currentSocketingRune = null;
  currentSocketingIndex = -1;

  if (typeof updateStats === 'function') updateStats();
  if (typeof renderInventory === 'function') renderInventory();
  if (typeof renderStash === 'function') renderStash();
  if (typeof updateStatsUI === 'function') updateStatsUI();
  if (typeof SaveSystem !== 'undefined' && SaveSystem.save) SaveSystem.save(true);

  return true;
}

// Cheat command to test rune acquisition quickly
window.cheatGetRune = function(runeKey) {
  if (typeof createRuneItem !== 'function') return;
  const rune = createRuneItem(runeKey || 'tir');
  if (rune) {
    addItemToInventory(rune);
    showNotification(`Acquired test rune: ${rune.displayName}`);
    renderInventory();
  }
};

window.isSocketingModeActive = isSocketingModeActive;
window.getActiveSocketingRune = getActiveSocketingRune;
window.startSocketingMode = startSocketingMode;
window.cancelSocketingMode = cancelSocketingMode;
window.trySocketRuneIntoTarget = trySocketRuneIntoTarget;

