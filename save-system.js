// ========== save-system.js - save system module ==========
// Split from game.js; owns IndexedDB save management

// IndexedDB configuration
const DB_NAME = 'DiabloCloneDB';
const DB_VERSION = 8;
let db;

// Save data version (for migrations)
const SAVE_DATA_VERSION = 2;  // v2: unified damage system, improved armor formula

// ========== Stat migration helpers ==========
// Convert legacy base attributes (str/dex/vit/ene) into direct-effect stats
function migrateItemStats() {
  let migratedCount = 0;

  // Migrate one item
  function migrateItem(item) {
    if (!item || !item.stats) return false;
    let migrated = false;

    // str → dmgPct (×5)
    if (item.stats.str) {
      item.stats.dmgPct = (item.stats.dmgPct || 0) + item.stats.str * 5;
      delete item.stats.str;
      migrated = true;
    }

    // vit → maxHp (×5)
    if (item.stats.vit) {
      item.stats.maxHp = (item.stats.maxHp || 0) + item.stats.vit * 5;
      delete item.stats.vit;
      migrated = true;
    }

    // ene → maxMp (×3)
    if (item.stats.ene) {
      item.stats.maxMp = (item.stats.maxMp || 0) + item.stats.ene * 3;
      delete item.stats.ene;
      migrated = true;
    }

    // dex → def + critChance
    if (item.stats.dex) {
      item.stats.def = (item.stats.def || 0) + item.stats.dex;
      item.stats.critChance = (item.stats.critChance || 0) + item.stats.dex * 0.5;
      delete item.stats.dex;
      migrated = true;
    }

    // mpRegen migration: legacy fixed values (30-100) became percentages (3-10%)
    // Detection: values > 20 are legacy fixed values, divide by 10
    if (item.stats.mpRegen && item.stats.mpRegen > 20) {
      item.stats.mpRegen = Math.round(item.stats.mpRegen / 10);
      migrated = true;
    }

    return migrated;
  }

  // Migrate inventory items
  player.inventory.forEach(item => {
    if (migrateItem(item)) migratedCount++;
  });

  // Migrate stash items
  player.stash.forEach(item => {
    if (migrateItem(item)) migratedCount++;
  });

  // Migrate equipped items
  Object.values(player.equipment).forEach(item => {
    if (migrateItem(item)) migratedCount++;
  });

  if (migratedCount > 0) {
    console.log(I18N.tr('saveErrors', 'log_stat_migration', '[Stat Migration] Converted legacy stats on {count} items', { count: migratedCount }));
    showNotification(I18N.tr('saveErrors', 'toast_stat_migrated', 'Auto-upgraded the stats of {count} items', { count: migratedCount }));
  }
}

// ========== Legacy name migration (Chinese -> English) ==========
// Old saves persisted localized item/affix names. English is now the storage
// language; display names are translated at render time via I18N.
function migrateLegacyNames() {
  if (typeof I18N === 'undefined' || !I18N.items || !I18N.affixes) return 0;
  let migratedCount = 0;

  // zh item key -> canonical EN item key
  const itemZhToEn = {};
  for (const [key, entry] of Object.entries(I18N.items)) {
    if (/[\u4e00-\u9fff]/.test(key)) itemZhToEn[key] = entry.en;
  }

  // zh affix key -> canonical EN affix key
  const affixZhToEn = {};
  for (const [key, entry] of Object.entries(I18N.affixes)) {
    if (/[\u4e00-\u9fff]/.test(key)) affixZhToEn[key] = entry.en;
  }

  const hasHan = (s) => typeof s === 'string' && /[\u4e00-\u9fff]/.test(s);

  function migrateItem(item) {
    if (!item || typeof item !== 'object') return false;
    let migrated = false;

    if (item.name && itemZhToEn[item.name]) {
      item.name = itemZhToEn[item.name];
      migrated = true;
    }

    if (hasHan(item.displayName)) {
      let dn = item.displayName;
      // Legacy unique prefix: Unique·BaseName -> Unique · BaseName
      if (dn.startsWith('暗金·')) {
        dn = 'Unique · ' + dn.slice('暗金·'.length);
      }
      // Replace zh affix fragments with their EN equivalents
      for (const [zh, en] of Object.entries(affixZhToEn)) {
        if (dn.includes(zh)) {
          dn = dn.split(zh).join(en);
        }
      }
      // Normalize spacing between base name and EN suffixes/prefixes
      dn = dn.replace(/([a-z])(A|S|O|D|V|B|I|H)/g, (m, a, b) => `${a} ${b}`)
             .replace(/\s{2,}/g, ' ').trim();
      item.displayName = dn;
      migrated = true;
    }

    return migrated;
  }

  (player.inventory || []).forEach(item => {
    if (migrateItem(item)) migratedCount++;
  });

  (player.stash || []).forEach(item => {
    if (migrateItem(item)) migratedCount++;
  });

  Object.values(player.equipment || {}).forEach(item => {
    if (migrateItem(item)) migratedCount++;
  });

  if (player.targetItem && migrateItem(player.targetItem)) migratedCount++;

  if (migratedCount > 0) {
    console.log(I18N.tr('saveErrors', 'log_name_migration', '[Name Migration] Converted legacy names on {count} items', { count: migratedCount }));
  }
  return migratedCount;
}

const SaveSystem = {
  currentSlot: 1,  // currently selected save slot
  MAX_SLOTS: 3,    // max save slots
  isReady: false,  // IndexedDBinitialized flag

  init: function () {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains('saveData')) database.createObjectStore('saveData', { keyPath: 'id' });
    };
    req.onsuccess = e => {
      db = e.target.result;
      this.migrateOldSave().then(() => {
        this.loadAllSlotsMeta();
        // Mark ready, activate start button
        this.setReady();
      });
    };
    req.onerror = e => {
      console.error("DB Init Failed", e);
      // Still mark ready on failure (allows new characters)
      this.setReady();
    };
  },

  // Mark save system ready
  setReady: function () {
    this.isReady = true;
    this.tryActivateStartButton();
    console.log('[SaveSystem] initialized');
  },

  // Activate start button (needs local saves + cloud sync ready)
  tryActivateStartButton: function () {
    const cloudReady = typeof CloudSync !== 'undefined' ? CloudSync.isReady : true;
    if (!this.isReady || !cloudReady) return;

    const startBtn = document.querySelector('.start-btn');
    if (startBtn) {
      startBtn.classList.remove('disabled');
      startBtn.disabled = false;
    }
  },

  // Migrate legacy save into slot 1
  migrateOldSave: async function () {
    return new Promise((resolve) => {
      if (!db) { resolve(); return; }
      const tx = db.transaction(['saveData'], 'readonly');
      const store = tx.objectStore('saveData');

      // Check for legacy save format
      const oldReq = store.get('player1');
      oldReq.onsuccess = (e) => {
        const oldData = e.target.result;
        if (oldData && !oldData.slotId) {
          // Legacy save found and unmigrated; move it to slot 1
          const newData = { ...oldData, id: 'slot_1', slotId: 1 };
          const writeTx = db.transaction(['saveData'], 'readwrite');
          const writeStore = writeTx.objectStore('saveData');
          writeStore.put(newData);
          writeStore.delete('player1');  // delete legacy save
          writeTx.oncomplete = () => {
            console.log(I18N.tr('saveErrors', 'log_slot_migration', '[Save Migration] Legacy save migrated to slot 1'));
            resolve();
          };
          writeTx.onerror = writeTx.onabort = () => resolve();
        } else {
          resolve();
        }
      };
      oldReq.onerror = () => resolve();
    });
  },

  // Load slot metadata for the save selection screen
  loadAllSlotsMeta: function () {
    if (!db) return;
    window.saveSlots = [null, null, null];  // 3slot

    const tx = db.transaction(['saveData'], 'readonly');
    const store = tx.objectStore('saveData');

    for (let i = 1; i <= this.MAX_SLOTS; i++) {
      const req = store.get(`slot_${i}`);
      req.onsuccess = (e) => {
        if (e.target.result) {
          const data = e.target.result;
          const pb = data.personalBest || {};
          window.saveSlots[i - 1] = {
            slotId: i,
            level: data.lvl || 1,
            kills: data.kills || 0,
            gold: data.gold || 0,
            maxFloor: pb.maxFloor || data.floor || 0,
            maxHellFloor: pb.maxHellFloor || 0,
            lastPlayed: data.lastPlayed || Date.now(),
            hasData: true
          };
        }
        // Update UI once every slot has been checked
        if (i === this.MAX_SLOTS) {
          this.updateStartScreenStatus();
        }
      };
    }
  },

  // Update start screen status
  updateStartScreenStatus: function () {
    const statusEl = document.getElementById('save-status');
    const hasAnySave = window.saveSlots && window.saveSlots.some(s => s && s.hasData);
    if (hasAnySave) {
      const filledSlots = window.saveSlots.filter(s => s && s.hasData).length;
      statusEl.innerHTML = I18N.tOr('save_status_found', `Found ${filledSlots} save slot(s)`, { count: filledSlots });
    } else {
      statusEl.innerHTML = '';
    }
  },

  // Save into the current slot
  save: function (silent = false) {
    if (!db) return Promise.resolve(false);
    const clean = i => { if (!i) return null; const { el, ...r } = i; return r; };
    const eq = {}; for (let k in player.equipment) eq[k] = clean(player.equipment[k]);

    // Refresh online time (offline reward calc)
    player.lastOnlineTime = Date.now();

    // Also write to localStorage (sync, reliable) as a backup
    try { localStorage.setItem(`lastOnlineTime_slot${this.currentSlot}`, player.lastOnlineTime.toString()); }
    catch (error) { console.warn(I18N.tr('saveErrors', 'log_timestamp_backup_failed', '[Save System] Timestamp backup failed:'), error); }

    const data = {
      id: `slot_${this.currentSlot}`,
      slotId: this.currentSlot,
      saveVersion: SAVE_DATA_VERSION,  // saveversion number，fordata migrations
      ...player,
      inventory: player.inventory.map(clean),
      equipment: eq,
      stash: player.stash.map(clean),
      targetItem: clean(player.targetItem),
      townPortal: townPortal,
      settings: Settings,
      autoBattleSettings: AutoBattle.settings,
      lastPlayed: Date.now()
    };
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(['saveData'], 'readwrite');
        tx.objectStore('saveData').put(data);
        tx.oncomplete = () => {
          // Auto-sync to cloud (silent, debounced) once the local transaction completesrre-trigger
          if (typeof CloudSync !== 'undefined' && CloudSync.isBound) {
            CloudSync.uploadSlotDebounced(this.currentSlot);
          }
          resolve(true);
        };
        tx.onerror = () => {
          console.error(I18N.tr('saveErrors', 'log_save_failed', '[Save System] Save failed:'), tx.error);
          if (!silent && typeof showNotification === 'function') {
            showNotification(I18N.tr('saveErrors', 'toast_save_failed', 'Save failed: check your browser storage permissions'));
          }
          resolve(false);
        };
        tx.onabort = () => {
          console.error(I18N.tr('saveErrors', 'log_save_aborted', '[Save System] Save aborted:'), tx.error);
          resolve(false);
        };
      } catch (e) {
        console.error(I18N.tr('saveErrors', 'log_save_exception', '[Save System] Save exception:'), e);
        if (!silent && typeof showNotification === 'function') {
          showNotification(I18N.tr('saveErrors', 'toast_save_failed', 'Save failed: check your browser storage permissions'));
        }
        resolve(false);
      }
    });

    // silent save，no toast（original:if (!silent) showNotification("gamealreadySave");）
  },

  // Load a specific slot
  loadSlot: function (slotId) {
    return new Promise((resolve, reject) => {
      if (!db) { reject(new Error(I18N.tr('saveErrors', 'error_db_not_ready', 'Save database is not ready, please reload the page'))); return; }
      const tx = db.transaction(['saveData']);
      const req = tx.objectStore('saveData').get(`slot_${slotId}`);
      req.onerror = tx.onerror = tx.onabort = () => reject(new Error(I18N.tr('saveErrors', 'error_load_failed', 'Could not read the save, please retry; the previous one was kept')));
      req.onsuccess = e => {
        this.currentSlot = slotId;
        if (e.target.result) {
          window.pendingLoadData = e.target.result;

          // Load Settings
          if (e.target.result.settings) {
            Object.assign(Settings, e.target.result.settings);
            document.getElementById('chk-bgm').checked = Settings.bgm;
            document.getElementById('chk-sfx').checked = Settings.sfx;
          }
          resolve(e.target.result);
        } else {
          window.pendingLoadData = null;
          resolve(null);
        }
      };
    });
  },

  // Delete a specific slot
  deleteSlot: function (slotId) {
    return new Promise((resolve) => {
      if (!db) { resolve(); return; }
      const tx = db.transaction(['saveData'], 'readwrite');
      tx.objectStore('saveData').delete(`slot_${slotId}`);
      tx.oncomplete = () => {
        if (window.saveSlots) window.saveSlots[slotId - 1] = null;
        resolve();
      };
    });
  },

  // Legacy load() kept for old callers
  load: function () {
    this.loadAllSlotsMeta();
  },

  // Reset current slot
  reset: function () {
    if (db) {
      this.deleteSlot(this.currentSlot).then(() => {
        location.reload();
      });
    }
  }
};
