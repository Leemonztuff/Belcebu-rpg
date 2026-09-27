// PocketBase online system (official SDK)
const PB_URL = 'https://maikami.com/pb';
const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

// ========== cloud syncsystem ==========
const CloudSync = {
    syncCode: null,
    isBound: false,
    recordId: null,
    isReady: false,  // cloud syncinitialized flag
    uploadDebounceTimer: null,
    uploadTimers: {},
    uploadQueue: Promise.resolve(),
    conflictWarnings: new Set(),
    DEBOUNCE_DELAY: 2000,  // 2s debounce
    knownCloudTimes: {},
    rememberCloud(record) {
        for (let slot = 1; slot <= 3; slot++) this.knownCloudTimes[slot] = this.saveTime(this.parseCloudSlot(record[`slot_${slot}`])?.fullData);
    },

// Init: check whether locally bound
    async init() {
        this.syncCode = localStorage.getItem('cloud_sync_code');
        this.recordId = localStorage.getItem('cloud_record_id');
        this.isBound = !!this.syncCode;

// If bound, auto-sync the latest data from the cloud
        if (this.isBound && this.recordId) {
            await this.syncFromCloud();
        }

        this.isReady = true;
        this.updateUI();
// Notify SaveSystem to try activating the button
        if (typeof SaveSystem !== 'undefined' && SaveSystem.tryActivateStartButton) {
            SaveSystem.tryActivateStartButton();
        }
        console.log('[CloudSync] initialized, bound to:', this.isBound);
    },

// Freshness is judged by save time; keep a local backup before overwriting and never infer progress from level.
    saveTime(data) {
        return Number(data?.lastPlayed || data?.lastOnlineTime || 0);
    },

    async waitForLocalStore() {
        if (typeof SaveSystem === 'undefined') return;
        while (!SaveSystem.isReady) await new Promise(resolve => setTimeout(resolve, 20));
        if (typeof db === 'undefined' || !db) throw new Error(I18N.tr('online', 'sync_store_unavailable'));
    },

    async syncFromCloud() {
        try {
            await this.waitForLocalStore();
            const cloudRecord = await pb.collection('cloud_saves').getOne(this.recordId);
            if (!cloudRecord) return;

            const cloudSlots = [
                cloudRecord.slot_1 || null,
                cloudRecord.slot_2 || null,
                cloudRecord.slot_3 || null
            ];
            const localSlots = await this.getLocalSlots();

            let updated = false;
            for (let i = 0; i < 3; i++) {
                const cloud = this.parseCloudSlot(cloudSlots[i])?.fullData;
                const local = localSlots[i]?.fullData;

                if (!cloud) continue;

                if (!local || this.saveTime(cloud) > this.saveTime(local)) {
                    await this.saveToLocalSlot(i + 1, cloud);
                    updated = true;
                    console.log(`[CloudSync] slot ${i + 1}: restored newer cloud progress`);
                }
            }

            if (updated) {
// Refresh the save list display
                if (typeof SaveSystem !== 'undefined' && SaveSystem.loadAllSlotsMeta) {
                    SaveSystem.loadAllSlotsMeta();
                }
            }
            this.rememberCloud(cloudRecord);
        } catch (e) {
            console.error('[CloudSync] sync failed:', e);
        }
    },

// Save data to a local slot
    async saveToLocalSlot(slotId, data) {
        if (typeof db === 'undefined' || !db) throw new Error(I18N.tr('online', 'sync_store_unavailable_short'));

        // ensuredatathere isjustconfirm id draw slotId
        const saveData = {
            ...data,
            id: `slot_${slotId}`,
            slotId: slotId
        };

        return new Promise((resolve, reject) => {
            const tx = db.transaction(['saveData'], 'readwrite');
            const store = tx.objectStore('saveData');
            const previous = store.get(`slot_${slotId}`);
            previous.onsuccess = () => {
                if (previous.result) store.put({ ...previous.result, id: `backup_slot_${slotId}` });
                store.put(saveData);
            };
            tx.oncomplete = () => resolve(true);
            tx.onerror = tx.onabort = () => reject(new Error(I18N.tr('online', 'sync_write_failed')));
        });
    },

// Generate a 6-char sync code (capitals + digits)
    generateSyncCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  // exclude confusable I/O/0/1
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },

// Get all local slot save data
    async getLocalSlots() {
        const slots = [null, null, null];
        if (typeof db === 'undefined' || !db) throw new Error(I18N.tr('online', 'sync_store_unavailable_read'));

        for (let i = 1; i <= 3; i++) {
            try {
                const data = await new Promise((resolve, reject) => {
                    const tx = db.transaction(['saveData'], 'readonly');
                    const req = tx.objectStore('saveData').get(`slot_${i}`);
                    req.onsuccess = (e) => resolve(e.target.result);
                    req.onerror = tx.onerror = tx.onabort = () => reject(new Error(I18N.tr('online', 'sync_read_failed')));
                });
                if (data) {
                    slots[i - 1] = {
                        lvl: data.lvl || 1,
                        gold: data.gold || 0,
                        kills: data.kills || 0,
                        maxFloor: data.personalBest?.maxFloor || data.floor || 0,
                        maxHellFloor: data.personalBest?.maxHellFloor || 0,
                        nickname: data.nickname || I18N.tr('online', 'sync_slot_nickname_default'),
                        fullData: data
                    };
                }
            } catch (e) { throw e; }
        }
        return slots;
    },

    // bindaccount（new）
    async bindNew() {
        const code = this.generateSyncCode();
        const slots = await this.getLocalSlots();
        const nickname = OnlineSystem.nickname || I18N.tr('online', 'sync_default_warrior');

        try {
// Check whether the sync code already exists (very unlikely collision)
            const existing = await pb.collection('cloud_saves').getList(1, 1, {
                filter: `sync_code = "${code}"`
            });

            if (existing.items.length > 0) {
                // conflict，re-newbornbecome
                return this.bindNew();
            }

// Create the cloud save
            const record = await pb.collection('cloud_saves').create({
                sync_code: code,
                nickname: nickname,
                slot_1: slots[0]?.fullData || null,
                slot_2: slots[1]?.fullData || null,
                slot_3: slots[2]?.fullData || null,
                version: 1
            });

            // Savetolocal
            this.rememberCloud(record);
            this.syncCode = code;
            this.recordId = record.id;
            this.isBound = true;
            localStorage.setItem('cloud_sync_code', code);
            localStorage.setItem('cloud_record_id', record.id);

            this.updateUI();
            this.hideDialog();
            this.showSuccessMessage(I18N.tr('online', 'sync_bind_success', '', { code }));
            return true;
        } catch (e) {
            console.error('[CloudSync] binding failed:', e);
            this.showErrorMessage(I18N.tr('online', 'sync_bind_failed_retry'));
            return false;
        }
    },

    // bindaccount（alreadythere issynccode）
    async bindExisting(code) {
        code = code.toUpperCase().trim();
        if (!/^[A-Z0-9]{6}$/.test(code)) {
            this.showErrorMessage(I18N.tr('online', 'sync_code_format_error'));
            return false;
        }

        try {
            const records = await pb.collection('cloud_saves').getList(1, 1, {
                filter: `sync_code = "${code}"`
            });

            if (records.items.length === 0) {
                this.showErrorMessage(I18N.tr('online', 'sync_code_not_found'));
                return false;
            }

            const cloudRecord = records.items[0];
            const localSlots = await this.getLocalSlots();
            const cloudSlots = [
                this.parseCloudSlot(cloudRecord.slot_1),
                this.parseCloudSlot(cloudRecord.slot_2),
                this.parseCloudSlot(cloudRecord.slot_3)
            ];

// Check for conflicts
            const hasLocalData = localSlots.some(s => s !== null);
            const hasCloudData = cloudSlots.some(s => s !== null);

            if (hasLocalData && hasCloudData) {
// Show the conflict comparison panel and let the user pick the overwrite direction
                this.showBindConflictPanel(code, cloudRecord, localSlots, cloudSlots);
                return 'conflict';
            } else if (hasCloudData) {
// Local empty: use cloud directly
                await this.applyCloudSave(cloudRecord);
                this.completeBinding(code, cloudRecord.id, cloudRecord.nickname);
                return true;
            } else {
// Cloud empty: upload local
                await this.uploadAllSlots(cloudRecord.id);
                this.completeBinding(code, cloudRecord.id, cloudRecord.nickname);
                return true;
            }
        } catch (e) {
            console.error('[CloudSync] binding failed:', e);
            this.showErrorMessage(I18N.tr('online', 'sync_bind_failed_network'));
            return false;
        }
    },

// Parse the cloud slot data
    parseCloudSlot(data) {
        if (!data) return null;
        if (typeof data === 'string') data = JSON.parse(data);
        if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error(I18N.tr('online', 'sync_cloud_format_invalid'));
        return {
            lvl: data.lvl || 1,
            gold: data.gold || 0,
            kills: data.kills || 0,
            maxFloor: data.personalBest?.maxFloor || data.floor || 0,
            maxHellFloor: data.personalBest?.maxHellFloor || 0,
            nickname: data.nickname || I18N.tr('online', 'sync_slot_nickname_default'),
            fullData: data
        };
    },

    // completebind
    completeBinding(code, recordId, nickname = null) {
        this.syncCode = code;
        this.recordId = recordId;
        this.isBound = true;
        localStorage.setItem('cloud_sync_code', code);
        localStorage.setItem('cloud_record_id', recordId);

        // If a cloud nickname exists, save it locally and show a welcome message
        if (nickname) {
            localStorage.setItem('pb_nickname', nickname);
            OnlineSystem.nickname = nickname;
            const welcomeEl = document.getElementById('welcome-back');
            if (welcomeEl) welcomeEl.textContent = I18N.t('welcome_back', { name: nickname });
        }

        this.updateUI();
        this.hideDialog();
        this.showSuccessMessage(I18N.tr('online', 'sync_bind_success', '', { code }));
    },

// Restore a save (download via sync code)
    async restore(code) {
        code = code.toUpperCase().trim();
        if (!/^[A-Z0-9]{6}$/.test(code)) {
            this.showErrorMessage(I18N.tr('online', 'sync_code_format_error'));
            return false;
        }

        try {
            const records = await pb.collection('cloud_saves').getList(1, 1, {
                filter: `sync_code = "${code}"`
            });

            if (records.items.length === 0) {
                this.showErrorMessage(I18N.tr('online', 'sync_code_not_found'));
                return false;
            }

            const cloudRecord = records.items[0];
            const localSlots = await this.getLocalSlots();
            const cloudSlots = [
                this.parseCloudSlot(cloudRecord.slot_1),
                this.parseCloudSlot(cloudRecord.slot_2),
                this.parseCloudSlot(cloudRecord.slot_3)
            ];

            const hasCloudData = cloudSlots.some(s => s !== null);
            if (!hasCloudData) {
                this.showErrorMessage(I18N.tr('online', 'sync_code_no_data'));
                return false;
            }

            const hasLocalData = localSlots.some(s => s !== null);
            if (hasLocalData) {
// Show the conflict comparison panel
                this.showRestoreConflictPanel(code, cloudRecord, localSlots, cloudSlots);
                return 'conflict';
            } else {
// Local empty: restore directly
                await this.applyCloudSave(cloudRecord);
                this.completeBinding(code, cloudRecord.id);
                this.showSuccessMessage(I18N.tr('online', 'sync_restore_success'));
// Refresh the save list
                if (typeof SaveSystem !== 'undefined') {
                    SaveSystem.loadAllSlotsMeta();
                }
                return true;
            }
        } catch (e) {
            console.error('[CloudSync] restore failed:', e);
            this.showErrorMessage(I18N.tr('online', 'sync_restore_failed_network'));
            return false;
        }
    },

// Apply the cloud save locally
    async applyCloudSave(cloudRecord) {
        if (!db) throw new Error(I18N.tr('online', 'sync_store_unavailable_short'));

        const slots = [cloudRecord.slot_1, cloudRecord.slot_2, cloudRecord.slot_3];
        const tx = db.transaction(['saveData'], 'readwrite');
        const store = tx.objectStore('saveData');

        for (let i = 0; i < 3; i++) {
            const slot = this.parseCloudSlot(slots[i])?.fullData;
            const previous = store.get(`slot_${i + 1}`);
            previous.onsuccess = () => {
                if (previous.result) store.put({ ...previous.result, id: `backup_slot_${i + 1}` });
                if (slot) store.put({ ...slot, id: `slot_${i + 1}`, slotId: i + 1 });
                else store.delete(`slot_${i + 1}`);
            };
        }

        return new Promise((resolve, reject) => {
            tx.oncomplete = () => { this.rememberCloud(cloudRecord); resolve(); };
            tx.onerror = tx.onabort = () => reject(new Error(I18N.tr('online', 'sync_restore_write_failed')));
        });
    },

// Upload all slots to the cloud
    async uploadAllSlots(recordId = null) {
        const slots = await this.getLocalSlots();
        const updateData = {
            slot_1: slots[0]?.fullData || null,
            slot_2: slots[1]?.fullData || null,
            slot_3: slots[2]?.fullData || null,
            version: Date.now()
        };

        const id = recordId || this.recordId;
        if (!id) return false;

        try {
            await pb.collection('cloud_saves').update(id, updateData);
            this.rememberCloud(updateData);
            return true;
        } catch (e) {
            console.error('[CloudSync] upload failed:', e);
            throw e;
        }
    },

// Upload one slot (for auto sync, debounced)
    uploadSlotDebounced(slotId) {
        if (!this.isBound || !this.recordId) return;

        clearTimeout(this.uploadTimers[slotId]);
        this.uploadTimers[slotId] = setTimeout(() => {
            delete this.uploadTimers[slotId];
            this.uploadSlot(slotId);
        }, this.DEBOUNCE_DELAY);
    },

// Upload one slot
    uploadSlot(slotId) {
        this.uploadQueue = this.uploadQueue.catch(() => {}).then(() => this.uploadSlotNow(slotId));
        return this.uploadQueue;
    },

    async uploadSlotNow(slotId) {
        if (!this.isBound || !this.recordId) return;
        try {
            const slots = await this.getLocalSlots();
            const localSlot = slots[slotId - 1];
            if (!localSlot) return;
            const localLevel = localSlot.lvl || 0;
            const cloudRecord = await pb.collection('cloud_saves').getOne(this.recordId);
            const cloudSlot = this.parseCloudSlot(cloudRecord[`slot_${slotId}`])?.fullData;
            if (this.knownCloudTimes[slotId] === undefined || this.knownCloudTimes[slotId] !== this.saveTime(cloudSlot)) {
                console.warn('[CloudSync] cloud has updates from another device, upload paused to preserve both sides');
                if (!this.conflictWarnings.has(slotId) && typeof showNotification === 'function') {
                    this.conflictWarnings.add(slotId);
                    showNotification(I18N.tr('online', 'sync_conflict_paused'));
                }
                return;
            }

            if (cloudSlot) {
                if (this.saveTime(localSlot.fullData) <= this.saveTime(cloudSlot)) {
                    console.warn('[CloudSync] cloud save is newer or order unclear, keeping cloud progress');
                    return;
                }
            }

            const updateData = {
                [`slot_${slotId}`]: localSlot.fullData,
                version: Date.now()
            };
            await pb.collection('cloud_saves').update(this.recordId, updateData);
            this.knownCloudTimes[slotId] = this.saveTime(localSlot.fullData);
            console.log(`[CloudSync] slot ${slotId} uploaded (Lv${localLevel})`);
        } catch (e) {
            console.error('[CloudSync] slot upload failed:', e);
        }
    },

    // Showcloud syncpopup（olduser）
    showSyncDialog() {
        const overlay = document.getElementById('cloud-sync-overlay');
        const panel = document.getElementById('cloud-sync-panel');
        const content = document.getElementById('cloud-sync-content');
        if (!overlay || !content || !panel) return;

        content.innerHTML = `
            <div class="nickname-title">${I18N.tr('online', 'sync_manage_title')}</div>
            <div class="nickname-desc">${I18N.tr('online', 'sync_manage_desc')}</div>
            <div id="cloud-error" class="nickname-error"></div>
            <div class="cloud-start-options">
                <div class="cloud-start-option" onclick="CloudSync.handleBindNew()">
                    <div class="cloud-start-title">${I18N.tr('online', 'sync_create_account')}</div>
                    <div class="cloud-start-desc">${I18N.tr('online', 'sync_create_account_desc')}</div>
                </div>
                <div class="cloud-start-divider">${I18N.tr('online', 'sync_or')}</div>
                <div class="cloud-start-option restore">
                    <div class="cloud-start-title">${I18N.tr('online', 'sync_enter_code')}</div>
                    <div class="cloud-start-desc">${I18N.tr('online', 'sync_enter_code_desc')}</div>
                    <input type="text" id="sync-code-input" maxlength="6" autocomplete="off"
                           placeholder="${I18N.tr('online', 'sync_code_placeholder')}" onclick="event.stopPropagation()"
                           onkeydown="if(event.key==='Enter')CloudSync.handleSyncCode()">
                    <button id="cloud-restore-btn" onclick="event.stopPropagation();CloudSync.handleSyncCode()">${I18N.tr('online', 'sync_confirm_btn')}</button>
                </div>
            </div>
        `;
// Returning user dialog: show the close button
        const closeBtn = panel.querySelector('.panel-close');
        if (closeBtn) closeBtn.style.display = 'block';

        panel.style.display = 'block';
        overlay.classList.add('active');
    },

// Show the new-user dialog (create/restore/skip)
    showNewUserDialog() {
        console.log('[CloudSync] showNewUserDialog called');
        const overlay = document.getElementById('cloud-sync-overlay');
        const panel = document.getElementById('cloud-sync-panel');
        const content = document.getElementById('cloud-sync-content');
        console.log('[CloudSync] element check:', { overlay: !!overlay, panel: !!panel, content: !!content });
        if (!overlay || !content || !panel) {
            console.error('[CloudSync] missing elements, cannot show dialog');
            return;
        }

        content.innerHTML = `
            <div class="nickname-title">${I18N.tr('online', 'nickname_welcome_title')}</div>
            <div class="nickname-desc">${I18N.tr('online', 'sync_choose_start')}</div>
            <div id="cloud-error" class="nickname-error"></div>
            <div class="cloud-start-options">
                <div class="cloud-start-option" onclick="CloudSync.handleNewUserCreate()">
                    <div class="cloud-start-title">${I18N.tr('online', 'sync_create_character')}</div>
                    <div class="cloud-start-desc">${I18N.tr('online', 'sync_start_new_adventure')}</div>
                </div>
                <div class="cloud-start-divider">${I18N.tr('online', 'sync_or')}</div>
                <div class="cloud-start-option restore">
                    <div class="cloud-start-title">${I18N.tr('online', 'sync_restore_save')}</div>
                    <input type="text" id="sync-code-input" maxlength="6" autocomplete="off"
                           placeholder="${I18N.tr('online', 'sync_code_placeholder')}" onclick="event.stopPropagation()"
                           onkeydown="if(event.key==='Enter')CloudSync.handleNewUserRestore()">
                    <button id="cloud-restore-btn" onclick="event.stopPropagation();CloudSync.handleNewUserRestore()">${I18N.tr('online', 'sync_restore_btn')}</button>
                </div>
            </div>
        `;
// New-user dialog: hide close; a choice is required
        const closeBtn = panel.querySelector('.panel-close');
        if (closeBtn) closeBtn.style.display = 'none';

        panel.style.display = 'block';
        overlay.classList.add('active');
    },

// New user picks 'Create character' -> nickname input
    handleNewUserCreate() {
        this.hideDialog();
        OnlineSystem.showNicknameDialog();
    },

// New user picks 'Restore save'
    async handleNewUserRestore() {
        const input = document.getElementById('sync-code-input');
        if (!input || !input.value) {
            this.showErrorInPanel(I18N.tr('online', 'sync_enter_code_prompt'));
            return;
        }
        const result = await this.bindExisting(input.value);
        if (result === true) {
// Restore succeeded; the nickname was already saved in completeBinding
// Refresh the save list (startOnline only when entering the game)
            if (typeof SaveSystem !== 'undefined') {
                SaveSystem.loadAllSlotsMeta();
            }
        }
    },

    // hidepopup
    hideDialog() {
        const overlay = document.getElementById('cloud-sync-overlay');
        const panel = document.getElementById('cloud-sync-panel');
        if (overlay) overlay.classList.remove('active');
        if (panel) panel.style.display = 'none';
    },

// Handle account creation (returning users)
    async handleBindNew() {
        await this.bindNew();
    },

// Handle sync code input (auto-detect bind vs restore)
    async handleSyncCode() {
        const input = document.getElementById('sync-code-input');
        if (!input || !input.value) {
            this.showErrorInPanel(I18N.tr('online', 'sync_enter_code_prompt'));
            return;
        }
// Always use bindExisting; it handles every case
        await this.bindExisting(input.value);
    },

// Show the error inside the panel
    showErrorInPanel(msg) {
        const errorEl = document.getElementById('cloud-error');
        if (errorEl) {
            errorEl.textContent = msg;
            errorEl.style.display = 'block';
            setTimeout(() => { errorEl.style.display = 'none'; }, 3000);
        }
    },

// Show the binding conflict panel (user picks the overwrite direction)
    showBindConflictPanel(code, cloudRecord, localSlots, cloudSlots) {
        const overlay = document.getElementById('cloud-sync-overlay');
        const panel = document.getElementById('cloud-sync-panel');
        const content = document.getElementById('cloud-sync-content');
        if (!overlay || !panel || !content) return;

        content.innerHTML = `
            <div class="nickname-title" style="color:#ff6666;">${I18N.tr('online', 'sync_conflict_title')}</div>
            <div class="nickname-desc">${I18N.tr('online', 'sync_conflict_desc')}</div>
            <div class="conflict-compare">
                <div class="conflict-side">
                    <div class="conflict-side-title">${I18N.tr('online', 'sync_local_saves')}</div>
                    ${this.renderSlotList(localSlots)}
                </div>
                <div class="conflict-vs">VS</div>
                <div class="conflict-side">
                    <div class="conflict-side-title">${I18N.tr('online', 'sync_cloud_saves')}</div>
                    ${this.renderSlotList(cloudSlots)}
                </div>
            </div>
            <div class="conflict-actions">
                <button class="conflict-btn" onclick="CloudSync.resolveBindConflict('local', '${code}', '${cloudRecord.id}')">
                    ${I18N.tr('online', 'sync_overwrite_cloud')}
                </button>
                <button class="conflict-btn" onclick="CloudSync.resolveBindConflict('cloud', '${code}', '${cloudRecord.id}')">
                    ${I18N.tr('online', 'sync_overwrite_local')}
                </button>
            </div>
            <button class="conflict-cancel" onclick="CloudSync.hideDialog()">${I18N.tOr('cancel', 'Cancel')}</button>
        `;

// Temporarily store cloudRecord for later steps
        this._pendingCloudRecord = cloudRecord;

        // Show panel and overlay
        panel.style.display = 'block';
        overlay.classList.add('active');
    },

// Show the restore conflict panel
    showRestoreConflictPanel(code, cloudRecord, localSlots, cloudSlots) {
        this.hideDialog();
        const overlay = document.getElementById('cloud-sync-overlay');
        if (!overlay) return;

        const content = document.getElementById('cloud-sync-content');
        if (!content) return;

        content.innerHTML = `
            <div class="conflict-title">${I18N.tr('online', 'sync_conflict_title')}</div>
            <div class="conflict-desc">${I18N.tr('online', 'sync_restore_conflict_desc')}</div>
            <div class="conflict-compare">
                <div class="conflict-side">
                    <div class="conflict-side-title">${I18N.tr('online', 'sync_local_saves_overwritten')}</div>
                    ${this.renderSlotList(localSlots)}
                </div>
                <div class="conflict-vs">→</div>
                <div class="conflict-side">
                    <div class="conflict-side-title">${I18N.tr('online', 'sync_cloud_saves')}</div>
                    ${this.renderSlotList(cloudSlots)}
                </div>
            </div>
            <div class="conflict-warning">${I18N.tr('online', 'sync_overwrite_warning')}</div>
            <div class="conflict-actions">
                <button class="conflict-btn danger" onclick="CloudSync.resolveRestoreConflict('${code}', '${cloudRecord.id}')">
                    ${I18N.tr('online', 'sync_confirm_overwrite_local')}
                </button>
            </div>
            <button class="conflict-cancel" onclick="CloudSync.hideDialog()">${I18N.tOr('cancel', 'Cancel')}</button>
        `;

        this._pendingCloudRecord = cloudRecord;
        overlay.classList.add('active');
    },

// Render the slot list
    renderSlotList(slots) {
        return slots.map((slot, i) => {
            if (!slot) {
                return `<div class="conflict-slot empty">${I18N.tr('online', 'sync_slot_empty', '', { slot: i + 1 })}</div>`;
            }
            // Hell floorfor 0 hoursuffixkeepair
            const hellText = slot.maxHellFloor > 0 ? I18N.tr('online', 'sync_slot_hell_floor', '', { floor: slot.maxHellFloor }) : '';
            return `<div class="conflict-slot">
                ${I18N.tr('online', 'sync_slot_summary', '', { slot: i + 1, lvl: slot.lvl, floor: slot.maxFloor, hell: hellText })}
            </div>`;
        }).join('');
    },

// Resolve the binding conflict
    async resolveBindConflict(choice, code, recordId) {
        try {
            const cloudNickname = this._pendingCloudRecord?.nickname || null;

            if (choice === 'local') {
// Overwrite cloud with local
                await this.uploadAllSlots(recordId);
            } else {
// Overwrite local with cloud
                if (this._pendingCloudRecord) {
                    await this.applyCloudSave(this._pendingCloudRecord);
                    if (typeof SaveSystem !== 'undefined') {
                        SaveSystem.loadAllSlotsMeta();
                    }
                }
            }
            this.completeBinding(code, recordId, cloudNickname);
            this._pendingCloudRecord = null;
        } catch (error) { this.showErrorMessage(error.message || I18N.tr('online', 'sync_operation_failed_retry')); }
    },

// Resolve the restore conflict
    async resolveRestoreConflict(code, recordId) {
        try {
            if (this._pendingCloudRecord) {
                await this.applyCloudSave(this._pendingCloudRecord);
                if (typeof SaveSystem !== 'undefined') {
                    SaveSystem.loadAllSlotsMeta();
                }
            }
            this.completeBinding(code, recordId);
            this._pendingCloudRecord = null;
            this.showSuccessMessage(I18N.tr('online', 'sync_restore_success'));
        } catch (error) { this.showErrorMessage(error.message || I18N.tr('online', 'sync_operation_failed_retry')); }
    },

// Copy the sync code to the clipboard
    async copySyncCode() {
        if (!this.syncCode) return;

        try {
            await navigator.clipboard.writeText(this.syncCode);
            this.showSuccessMessage(I18N.tr('online', 'sync_code_copied'));
        } catch (e) {
// Fallback plan
            const input = document.createElement('input');
            input.value = this.syncCode;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            this.showSuccessMessage(I18N.tr('online', 'sync_code_copied'));
        }
    },

// Update the homepage UI state
    updateUI() {
        const bar = document.getElementById('cloud-sync-bar');
        if (!bar) return;

// Without a nickname (new user), hide the cloud sync status bar
        const hasNickname = localStorage.getItem('pb_nickname');
        if (!hasNickname) {
            bar.style.display = 'none';
            return;
        }

        // initialized，Showstatepanel
        bar.style.display = 'flex';

        const statusEl = document.getElementById('cloud-sync-status');
        const btnSync = document.getElementById('btn-cloud-sync');
        const codeEl = document.getElementById('cloud-sync-code');

        if (this.isBound) {
            bar.classList.add('bound');
            if (statusEl) statusEl.textContent = I18N.tr('online', 'sync_status_bound');
            if (btnSync) btnSync.style.display = 'none';
            if (codeEl) {
                codeEl.style.display = 'inline';
                codeEl.innerHTML = `<span class="sync-code-value">${this.syncCode}</span> <span class="copy-hint" onclick="CloudSync.copySyncCode()">${I18N.tr('online', 'sync_copy_hint')}</span>`;
            }
        } else {
            bar.classList.remove('bound');
            if (statusEl) statusEl.textContent = I18N.tr('online', 'sync_status_unbound');
            if (btnSync) btnSync.style.display = 'inline-block';
            if (codeEl) codeEl.style.display = 'none';
        }
    },

// Show a success message
    showSuccessMessage(msg) {
        if (typeof showNotification === 'function') {
            showNotification(msg);
        } else {
            this.showAlert(msg);
        }
    },

// Show an error message
    showErrorMessage(msg) {
        this.showErrorInPanel(msg);
    }
};

const OnlineSystem = {
    // commonuseconfirmbox (in place ofon behalf of confirm)
    showConfirm(content, title = I18N.tr('online', 'online_dialog_confirm_title')) {
        return new Promise((resolve) => {
            const overlay = document.getElementById('game-dialog-overlay');
            const header = document.getElementById('game-dialog-header');
            const body = document.getElementById('game-dialog-body');
            const btnCancel = document.getElementById('game-dialog-btn-cancel');
            const btnConfirm = document.getElementById('game-dialog-btn-confirm');

            header.textContent = title;
            body.innerHTML = content.replace(/\n/g, '<br>');
            btnCancel.style.display = 'block';
            overlay.classList.add('active');

            const onConfirm = () => {
                overlay.classList.remove('active');
                cleanup();
                resolve(true);
            };
            const onCancel = () => {
                overlay.classList.remove('active');
                cleanup();
                resolve(false);
            };
            const cleanup = () => {
                btnConfirm.removeEventListener('click', onConfirm);
                btnCancel.removeEventListener('click', onCancel);
            };

            btnConfirm.onclick = onConfirm;
            btnCancel.onclick = onCancel;
        });
    },

    // commonusetoastbox (in place ofon behalf of alert)
    showAlert(content, title = I18N.tr('online', 'online_notice_title')) {
        return new Promise((resolve) => {
            const overlay = document.getElementById('game-dialog-overlay');
            const header = document.getElementById('game-dialog-header');
            const body = document.getElementById('game-dialog-body');
            const btnCancel = document.getElementById('game-dialog-btn-cancel');
            const btnConfirm = document.getElementById('game-dialog-btn-confirm');

            header.textContent = title;
            body.innerHTML = content.replace(/\n/g, '<br>');
            btnCancel.style.display = 'none'; // Alert mode hides the cancel button
            overlay.classList.add('active');

            const onConfirm = () => {
                overlay.classList.remove('active');
                btnConfirm.onclick = null;
                resolve();
            };
            btnConfirm.onclick = onConfirm;
        });
    },

    escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    userId: null,
    nickname: null,
    recordId: null,
    heartbeatTimer: null,

    bootstrapLocalIdentity() {
        this.userId = localStorage.getItem('pb_user_id');
        this.nickname = localStorage.getItem('pb_nickname');

        if (this.nickname) {
            const welcomeEl = document.getElementById('welcome-back');
            if (welcomeEl) welcomeEl.textContent = I18N.t('welcome_back', { name: this.nickname });
        }

        return {
            userId: this.userId,
            nickname: this.nickname
        };
    },

    // Init
    /**
     * @param {boolean} showDialog - whether to show the nickname dialog (default true)
    /**
     * Init - loads user info and UI only; does not build online presence
     * Online presence builds only on game entry (selectSlot)
     */
    async init(showDialog = true) {
        this.bootstrapLocalIdentity();

        // Initcloud sync
        CloudSync.init();

// Returning users not just kicked: try cleaning leftover state owned by this page
        if (this.userId && !sessionStorage.getItem('kicked_reason')) {
            this.goOffline();
        }

        this.loadOnlineCount();
// Create the leaderboard button (data lazy-loaded)
        this.createLeaderboardUI();

// Check whether the homepage return was caused by a kick
        this.checkKickedStatus();
    },

// Check the kicked state and show a dialog
    checkKickedStatus() {
        const reason = sessionStorage.getItem('kicked_reason');
        if (reason === 'other_device') {
            sessionStorage.removeItem('kicked_reason');
// Popup with a tiny delay so the page finishes rendering
            setTimeout(() => {
                this.showAlert(I18N.tr('online', 'online_kicked_other_device'), I18N.tr('online', 'online_system_notice'));
            }, 500);
        }
    },

// Create the leaderboard button and panel (no data load)
    createLeaderboardUI() {
        let leftBtns = document.getElementById('left-menu-btns');
        if (!leftBtns) {
            leftBtns = document.createElement('div');
            leftBtns.id = 'left-menu-btns';
            leftBtns.className = 'menu-btns';
            leftBtns.style.cssText = 'left: 20px; right: auto;';
            leftBtns.onmousedown = (e) => e.stopPropagation();
            document.querySelector('.ui-layer')?.appendChild(leftBtns);
        }

        let btn = document.getElementById('btn-leaderboard');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'btn-leaderboard';
            btn.className = 'sys-btn';
            btn.innerHTML = I18N.tr('online', 'leaderboard_title');
            btn.onclick = () => {
                togglePanel('leaderboard');
// Load data only on click
                this.loadLeaderboard();
            };
            btn.onmousedown = (e) => e.stopPropagation();
            leftBtns.appendChild(btn);
        }

        let panel = document.getElementById('leaderboard-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'leaderboard-panel';
            panel.className = 'panel';
            panel.style.cssText = 'top: 15%; left: 20px; width: 320px;';
            panel.onmousedown = (e) => e.stopPropagation();
            panel.innerHTML = `<div class="panel-close" onclick="togglePanel('leaderboard')">X</div><div class="panel-header">${I18N.tr('online', 'leaderboard_title')}</div><div style="color: #666; text-align: center; padding: 20px;">${I18N.tr('online', 'leaderboard_loading')}</div>`;
            document.querySelector('.ui-layer')?.appendChild(panel);
        }
    },

// Leaderboard cache
    leaderboardCache: null,
    leaderboardCacheTime: 0,
    CACHE_DURATION: 5 * 60 * 1000,  // 5 minutescache

// Show the nickname input
    showNicknameDialog() {
        const overlay = document.createElement('div');
        overlay.id = 'nickname-overlay';
        overlay.innerHTML = `
            <div class="nickname-dialog">
                <div class="nickname-title">${I18N.tr('online', 'nickname_welcome_title')}</div>
                <div class="nickname-desc">${I18N.tr('online', 'nickname_prompt_desc')}</div>
                <div id="nickname-error" class="nickname-error" style="display: none;"></div>
                <input type="text" id="nickname-input" maxlength="12" placeholder="${I18N.tr('online', 'nickname_length_placeholder')}">
                <button id="nickname-confirm">${I18N.tr('online', 'nickname_confirm_btn')}</button>
                <button id="nickname-back" class="nickname-back-btn">${I18N.tr('online', 'nickname_back')}</button>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById('nickname-confirm').onclick = async () => {
            const input = document.getElementById('nickname-input').value.trim();
            if (input.length >= 2 && input.length <= 12) {
                const success = await this.setNickname(input);
                if (success) {
                    overlay.remove();
                }
            } else {
                this.showAlert(I18N.tr('online', 'nickname_length_error'), I18N.tr('online', 'nickname_format_error_title'));
            }
        };

        document.getElementById('nickname-back').onclick = () => {
            overlay.remove();
            CloudSync.showNewUserDialog();
        };

        document.getElementById('nickname-input').onkeydown = (e) => {
            if (e.key === 'Enter') {
                document.getElementById('nickname-confirm').click();
            }
        };

// Clear the error hint while typing
        document.getElementById('nickname-input').oninput = () => {
            const errorEl = document.getElementById('nickname-error');
            if (errorEl) {
                errorEl.style.display = 'none';
            }
        };
    },

    // Setnickname
    async setNickname(name) {
        if (typeof ChatSystem !== 'undefined' && ChatSystem.ensureBlockedWordsLoaded) {
            await ChatSystem.ensureBlockedWordsLoaded();
        }

// Check for sensitive words
        const filteredName = ChatSystem.filterSensitiveWords(name);
        if (filteredName !== name) {
// Sensitive word in the nickname: show the error hint
            const errorEl = document.getElementById('nickname-error');
            if (errorEl) {
                errorEl.textContent = I18N.tr('online', 'nickname_blocked_word');
                errorEl.style.display = 'block';
// Auto-hide after 3 seconds
                setTimeout(() => {
                    errorEl.style.display = 'none';
                }, 3000);
            }
            return false;
        }

        this.nickname = name;
        localStorage.setItem('pb_nickname', name);

        if (!this.userId) {
            this.userId = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
            localStorage.setItem('pb_user_id', this.userId);
        }

// Note: startOnline is not called here; it's called on game entry

// Once the nickname is set, show the cloud sync status bar
        CloudSync.updateUI();

        return true;
    },

// Start the online presence
    async startOnline() {
// Generate this session's token
        this.sessionToken = this.generateSessionToken();
        sessionStorage.setItem('current_session_token', this.sessionToken);

        await this.updateOnlineStatus(false);  // First login: no kick check
        this.heartbeatTimer = setInterval(() => this.updateOnlineStatus(true), 30000);  // Check kicks during heartbeats
        window.addEventListener('beforeunload', () => this.goOffline());

// Subscribe to online table changes for real-time kick detection
        await this.subscribeToSessionChanges();
    },

// Subscribe to session changes (real-time kick detection)
    async subscribeToSessionChanges() {
        console.log('[Online] subscribing, recordId:', this.onlineRecordId);
        if (!this.onlineRecordId) {
            console.warn('[Online] cannot subscribe: recordId is empty');
            return;
        }

        try {
            await pb.collection('online').subscribe(this.onlineRecordId, (e) => {
                console.log('[Online] Realtime event received:', e.action);
                if (e.action === 'update') {
                    const newToken = e.record.session_token;
                    console.log('[Online] current token:', this.sessionToken, 'New token:', newToken);
                    if (newToken && newToken !== this.sessionToken) {
                        console.log('[Online] Realtime detected session takeover');
                        this.handleKicked();
                    }
                }
            });
            console.log('[Online] Realtime subscribed, recordId:', this.onlineRecordId);
        } catch (e) {
            console.error('[Online] Realtime subscribe failed:', e);
        }
    },

// Generate the session token
    generateSessionToken() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

// Check whether other devices are online (pre-entry check)
    async checkOtherDeviceOnline() {
// Only checked when cloud sync is bound
        const cloudRecordId = CloudSync.recordId;
        if (!cloudRecordId) return { online: false };

        try {
            const records = await pb.collection('online').getList(1, 1, {
                filter: `cloud_record_id = "${cloudRecordId}"`
            });

            if (records.items.length > 0) {
                const record = records.items[0];
                const lastActive = new Date(record.last_active).getTime();
                const now = Date.now();

// Activity within 5 minutes counts as online
                if (now - lastActive < 5 * 60 * 1000) {
                    return {
                        online: true,
                        recordId: record.id,
                        lastActive: record.last_active
                    };
                }
            }
            return { online: false };
        } catch (e) {
            console.error('[Online] check failed:', e);
            return { online: false };
        }
    },

// Force-takeover the session (kick other devices)
    async takeoverSession(recordId) {
        this.sessionToken = this.generateSessionToken();
        sessionStorage.setItem('current_session_token', this.sessionToken);
        try {
            await pb.collection('online').update(recordId, {
                session_token: this.sessionToken,
                last_active: new Date().toISOString()
            });
            this.onlineRecordId = recordId;
            console.log('[Online] session taken over');
            return true;
        } catch (e) {
            console.error('[Online] takeover failed:', e);
            return false;
        }
    },

// Update presence (cloud_record_id enables cross-device detection)
    isUnknownPbFieldError(error, fieldName) {
        const text = JSON.stringify(error?.data || error?.response || error?.message || error || '').toLowerCase();
        return text.includes(fieldName.toLowerCase()) && (
            text.includes('unknown') ||
            text.includes('invalid') ||
            text.includes('field')
        );
    },

    async writeOnlineRecord(recordId, data) {
        try {
            if (recordId) {
                return await pb.collection('online').update(recordId, data);
            }
            return await pb.collection('online').create(data);
        } catch (e) {
            if (!Object.prototype.hasOwnProperty.call(data, 'user_id') || !this.isUnknownPbFieldError(e, 'user_id')) {
                throw e;
            }

            const retryData = { ...data };
            delete retryData.user_id;
            console.warn('[Online] online.user_id field missing, degraded to fallback status write. Direct message lookup will fall back to chat history.');
            if (recordId) {
                return await pb.collection('online').update(recordId, retryData);
            }
            return await pb.collection('online').create(retryData);
        }
    },

    async updateOnlineStatus(isHeartbeat = false) {
        const cloudRecordId = CloudSync.recordId;
        if (!cloudRecordId || !this.nickname) return;

        try {
// Try finding an existing record first (by cloud account id)
            const records = await pb.collection('online').getList(1, 1, {
                filter: `cloud_record_id = "${cloudRecordId}"`
            });

            if (records.items.length > 0) {
                const record = records.items[0];
                this.onlineRecordId = record.id;

// Kick checks only during heartbeats (not on first login)
                if (isHeartbeat && record.session_token && record.session_token !== this.sessionToken) {
// Kicked by another device
                    this.handleKicked();
                    return;
                }

// Update the existing record
                await this.writeOnlineRecord(this.onlineRecordId, {
                    nickname: this.nickname,
                    user_id: this.userId,
                    session_token: this.sessionToken,
                    last_active: new Date().toISOString()
                });
            } else {
// Create a new record
                const record = await this.writeOnlineRecord(null, {
                    cloud_record_id: cloudRecordId,
                    nickname: this.nickname,
                    user_id: this.userId,
                    session_token: this.sessionToken,
                    last_active: new Date().toISOString()
                });
                this.onlineRecordId = record.id;
            }
        } catch (e) {
            console.error('[Online] status update failed:', e);
        }
    },

    // handlebykick
    handleKicked() {
        console.log('[Online] account signed in on another device');

        // stopheartbeat
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
        try {
            if (this.onlineRecordId) {
                pb.collection('online').unsubscribe(this.onlineRecordId);
            }
        } catch (e) { }

// Set the kicked flag, read after page refresh
        sessionStorage.setItem('kicked_reason', 'other_device');

// Back to the homepage
        window.location.reload();
    },

// Go offline (clear presence)
    async goOffline() {
        const cloudRecordId = CloudSync.recordId || localStorage.getItem('cloud_record_id');
        const token = this.sessionToken || sessionStorage.getItem('current_session_token');
        if (!cloudRecordId || !token) return;

        try {
// Find records for this cloud account with a matching token
            const records = await pb.collection('online').getList(1, 10, {
                filter: `cloud_record_id = "${cloudRecordId}" && session_token = "${token}"`
            });

            for (const r of records.items) {
                await pb.collection('online').delete(r.id);
            }

            this.onlineRecordId = null;
            this.sessionToken = null;
            sessionStorage.removeItem('current_session_token');
            console.log('[Online] cleaned up online status for this page');
        } catch (e) {
            // silentfailure
        }
    },

// Load the online count (only users active within 2 minutes)
    async loadOnlineCount() {
        try {
// Compute 2 minutes ago (converted to PocketBase format: space instead of T)
            const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString().replace('T', ' ');
            const records = await pb.collection('online').getList(1, 1, {
                filter: `last_active >= "${twoMinutesAgo}"`
            });
            this.updateOnlineDisplay(records.totalItems || 0);

// Clean zombie records older than 5 minutes
            this.cleanupStaleRecords();
        } catch (e) {
            this.updateOnlineDisplay(0);
        }
        setTimeout(() => this.loadOnlineCount(), 60000);
    },

// Clean zombie records (inactive for 5+ minutes)
    async cleanupStaleRecords() {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString().replace('T', ' ');
        this.gc('online', `last_active < "${fiveMinutesAgo}"`, 10);
    },

// Opportunistic cleanup helpers (garbage collection)
    async gc(collection, filter, limit = 5) {
        try {
            const records = await pb.collection(collection).getList(1, limit, {
                filter: filter,
                sort: 'created',
                requestKey: 'gc_' + collection // use fixed keys to prevent concurrency conflicts
            });
            for (const r of records.items) {
// Try deleting; ignore 403 (permission) and 404 (already gone)
                await pb.collection(collection).delete(r.id).catch(e => {
                    if (e.status === 403) {
                        console.warn(`[GC] failed to clean ${collection}: open the Delete rule in the PocketBase admin`);
                    }
// 404 means the record is gone; ignore silently
                });
            }
        } catch (e) {
// List fetch failures are silent too
        }
    },

// Keep the most recent N records, delete the rest
    async gcKeepRecent(collection, keepCount = 20) {
        try {
            const total = await pb.collection(collection).getList(1, 1, {
                requestKey: 'gc_count_' + collection
            });
            if (total.totalItems <= keepCount) return;

            const toDelete = total.totalItems - keepCount;
            const batchSize = Math.min(toDelete, 100);
            const records = await pb.collection(collection).getList(1, batchSize, {
                sort: 'created',
                requestKey: 'gc_delete_' + collection
            });

            let deleted = 0;
            await Promise.all(records.items.map(r =>
                pb.collection(collection).delete(r.id)
                    .then(() => deleted++)
                    .catch(() => { })
            ));

            if (toDelete > batchSize && deleted > 0) {
                setTimeout(() => this.gcKeepRecent(collection, keepCount), 500);
            }
        } catch (e) { }
    },

// Update the online count display
// Update the online count display
    updateOnlineDisplay(count) {
// Temporarily hide the online count display
        let el = document.getElementById('online-count');
        if (el) {
            el.style.display = 'none';
        }
        return;
        /*
        if (!el) {
            el = document.createElement('div');
            el.id = 'online-count';
            document.querySelector('.ui-layer')?.appendChild(el);
        }
        el.innerHTML = `🟢 Online: ${count * 9}`;
        */
    },

    recordWeeklyKill() {
        const floor = player.isInHell ? (player.maxHellFloor || player.hellFloor || 0) + 10 : (player.maxFloor || 0);
        const score = player.lvl * 100 + player.kills + floor * 50;
// Cross-week first kills build the baseline from the pre-kill total, then record this kill.
        if (!player.weeklyLeaderboard || player.weeklyLeaderboard.version !== 2 || player.weeklyLeaderboard.week !== this.getWeekStart()) {
            this.getWeeklyProgress({ kills: player.kills - 1 }, score - 1);
        }
        this.getWeeklyProgress({ kills: player.kills }, score);
    },

    getWeeklyProgress(data, score) {
        const week = this.getWeekStart();
        const kills = Number(data.kills) || 0;
        let progress = player.weeklyLeaderboard;
        if (!progress || progress.week !== week || progress.version !== 2) {
            progress = player.weeklyLeaderboard = { version: 2, week, kills: 0, score: 0, lastKills: kills, lastScore: score };
        } else {
            progress.kills += Math.max(0, kills - progress.lastKills);
            progress.score += Math.max(0, score - progress.lastScore);
            progress.lastKills = kills;
            progress.lastScore = score;
        }
        return progress;
    },

// Submit scores to the leaderboard (dual-track match: sync_code first, user_id fallback)
    async submitScore(data) {
        if (!this.userId || !this.nickname) return;

// Get the sync_code (cloud sync code preferred, else temp id)
        let syncCode = CloudSync.syncCode;
        if (!syncCode) {
            let tempId = localStorage.getItem('temp_user_id');
            if (!tempId) {
                tempId = Math.random().toString(36).substr(2, 6).toUpperCase();
                localStorage.setItem('temp_user_id', tempId);
            }
            syncCode = tempId;
        }

        const currentWeekStart = this.getWeekStart();
        const scoreData = {
            user_id: this.userId,
            sync_code: syncCode,  // New: also write sync_code
            nickname: this.nickname,
            level: data.level || 1,
            kills: data.kills || 0,
            max_floor: data.maxFloor || 0,
            is_hell: data.isHell || false,
            gold: data.gold || 0,
            score: (data.level || 1) * 100 + (data.kills || 0) + (data.maxFloor || 0) * 50
        };
        const weekly = this.getWeeklyProgress(data, scoreData.score);

        try {
// Dual-track query: sync_code first, user_id fallback
            let records = await pb.collection('leaderboard').getList(1, 1, {
                filter: `sync_code = "${syncCode}"`
            });

            // if sync_code sinkfindarrive at，try touse user_id findoldlog
            if (records.items.length === 0) {
                records = await pb.collection('leaderboard').getList(1, 1, {
                    filter: `user_id = "${this.userId}"`
                });
            }

            if (records.items.length > 0) {
                const old = records.items[0];

// Check whether weekly data needs a reset (new week)
                const oldWeekStart = old.week_start || 0;
                const isNewWeek = oldWeekStart < currentWeekStart;

                // Weekly progress is saved in the character save; legacy saves establish a baseline on first load and do not count historical kills into this week.
                const weekKills = weekly.kills;
                const weekScore = weekly.score;

// Add weekly data fields
                scoreData.week_kills = weekKills;
                scoreData.week_score = weekScore;
                scoreData.week_start = currentWeekStart;

// Higher score, more gold, weekly change, or a sync_code migration all trigger updates
                const needsMigration = !old.sync_code || old.sync_code !== syncCode;
                const shouldUpdate = scoreData.score > old.score ||
                    scoreData.gold > (old.gold || 0) ||
                    isNewWeek ||
                    weekKills !== (old.week_kills || 0) ||
                    weekScore !== (old.week_score || 0) ||
                    needsMigration;

                if (shouldUpdate) {
// Updates exclude user_id (unique index fields can't be re-set)
                    const { user_id, ...updateData } = scoreData;
                    await pb.collection('leaderboard').update(old.id, updateData);
                    this.loadLeaderboard(true);  // Force refresh
                }
            } else {
// New characters build a weekly stats baseline first
                scoreData.week_kills = weekly.kills;
                scoreData.week_score = weekly.score;
                scoreData.week_start = currentWeekStart;
                await pb.collection('leaderboard').create(scoreData);
                this.loadLeaderboard(true);  // Force refresh
            }
        } catch (e) { console.error('[Leaderboard] submitScore error:', e); }
    },

// Load the leaderboard (cached)
    async loadLeaderboard(forceRefresh = false) {
        const now = Date.now();
        const queryKey = `${this.leaderboardMode}:${this.currentTab}:${this.getWeekStart()}`;

// Use the cache (no repeat requests within 5 minutes)
        if (!forceRefresh && this.leaderboardCacheKey === queryKey && this.leaderboardCache && (now - this.leaderboardCacheTime) < this.CACHE_DURATION) {
            this.updateLeaderboardDisplay(this.leaderboardCache);
            return;
        }

        try {
            const weekly = this.leaderboardMode === 'week';
            const field = weekly ? (this.currentTab === 'kills' ? 'week_kills' : 'week_score') :
                ({ kills: 'kills', gold: 'gold', floor: 'max_floor' }[this.currentTab] || 'score');
            const records = await pb.collection('leaderboard').getList(1, 50, {
                sort: `-${field}`,
                ...(weekly ? { filter: `week_start = ${this.getWeekStart()}` } : {})
            });
            if (queryKey !== `${this.leaderboardMode}:${this.currentTab}:${this.getWeekStart()}`) return;
            this.leaderboardCacheKey = queryKey;
            this.leaderboardCache = records.items || [];
            this.leaderboardCacheTime = now;
            this.updateLeaderboardDisplay(this.leaderboardCache);
        } catch (e) { }
    },

// Update the leaderboard display
    updateLeaderboardDisplay(items) {
        let leftBtns = document.getElementById('left-menu-btns');
        if (!leftBtns) {
            leftBtns = document.createElement('div');
            leftBtns.id = 'left-menu-btns';
            leftBtns.className = 'menu-btns';
            leftBtns.style.cssText = 'left: 20px; right: auto;';
            leftBtns.onmousedown = (e) => e.stopPropagation();
            document.querySelector('.ui-layer')?.appendChild(leftBtns);
        }

        let btn = document.getElementById('btn-leaderboard');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'btn-leaderboard';
            btn.className = 'sys-btn';
            btn.innerHTML = I18N.tr('online', 'leaderboard_title');
            btn.onclick = () => togglePanel('leaderboard');
            btn.onmousedown = (e) => e.stopPropagation();
            leftBtns.appendChild(btn);
        }

        let panel = document.getElementById('leaderboard-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'leaderboard-panel';
            panel.className = 'panel';
            panel.style.cssText = 'top: 15%; left: 20px; width: 320px;';
            panel.onmousedown = (e) => e.stopPropagation();
            document.querySelector('.ui-layer')?.appendChild(panel);
        }

        this.renderLeaderboardContent(panel, items);
        this.leaderboardData = items;
    },

// Currently selected board type
    currentTab: 'score',
// Weekly/all-time mode (weekly default)
    leaderboardMode: 'week',  // 'week' or 'all'

// Get this Monday 00:00 timestamp (weekly reset check)
    getWeekStart() {
        const now = new Date();
        const day = now.getDay();
        const diff = day === 0 ? 6 : day - 1; // Sunday is 0, so step back 6 days
        const monday = new Date(now);
        monday.setDate(now.getDate() - diff);
        monday.setHours(0, 0, 0, 0);
        return monday.getTime();
    },

// Get the time left until next Monday (for display)
    getTimeToNextWeek() {
        const now = Date.now();
        const weekStart = this.getWeekStart();
        const nextWeekStart = weekStart + 7 * 24 * 60 * 60 * 1000;
        const remaining = nextWeekStart - now;
        const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
        const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        return I18N.tr('online', 'leaderboard_reset_span', '', { days, hours });
    },

// Render the leaderboard content
    renderLeaderboardContent(panel, items) {
        let html = '<div class="panel-close" onclick="togglePanel(\'leaderboard\')"></div>';
        html += `<div class="panel-header">${I18N.tr('online', 'leaderboard_title')}</div>`;

// Weekly/all-time top toggle
        html += `<div class="leaderboard-mode-tabs">
            <span class="lb-mode-tab ${this.leaderboardMode === 'week' ? 'active' : ''}" onclick="OnlineSystem.switchMode('week')">${I18N.tr('online', 'leaderboard_week_mode')}</span>
            <span class="lb-mode-tab ${this.leaderboardMode === 'all' ? 'active' : ''}" onclick="OnlineSystem.switchMode('all')">${I18N.tr('online', 'leaderboard_all_time_mode')}</span>
        </div>`;

// Weekly countdown hint
        if (this.leaderboardMode === 'week') {
            html += `<div class="week-countdown">${I18N.tr('online', 'leaderboard_reset_countdown', '', { time: this.getTimeToNextWeek() })}</div>`;
        }

// Personal best area
        html += this.renderPersonalBest();

// Board tabs (weekly mode shows kills and overall only)
        if (this.leaderboardMode === 'week') {
            html += `<div class="leaderboard-tabs">
                <span class="lb-tab ${this.currentTab === 'score' ? 'active' : ''}" onclick="OnlineSystem.switchTab('score')">${I18N.tr('online', 'leaderboard_tab_overall')}</span>
                <span class="lb-tab ${this.currentTab === 'kills' ? 'active' : ''}" onclick="OnlineSystem.switchTab('kills')">${I18N.tOr('slot_kills', 'Slain')}</span>
                <span class="lb-tab ${this.currentTab === 'abyss' ? 'active' : ''}" onclick="OnlineSystem.switchTab('abyss')">${I18N.tr('online', 'leaderboard_tab_abyss')}</span>
            </div>`;
        } else {
            html += `<div class="leaderboard-tabs">
                <span class="lb-tab ${this.currentTab === 'score' ? 'active' : ''}" onclick="OnlineSystem.switchTab('score')">${I18N.tr('online', 'leaderboard_tab_overall')}</span>
                <span class="lb-tab ${this.currentTab === 'kills' ? 'active' : ''}" onclick="OnlineSystem.switchTab('kills')">${I18N.tOr('slot_kills', 'Slain')}</span>
                <span class="lb-tab ${this.currentTab === 'floor' ? 'active' : ''}" onclick="OnlineSystem.switchTab('floor')">${I18N.tr('online', 'leaderboard_tab_floor')}</span>
                <span class="lb-tab ${this.currentTab === 'gold' ? 'active' : ''}" onclick="OnlineSystem.switchTab('gold')">${I18N.tr('online', 'leaderboard_tab_gold')}</span>
                <span class="lb-tab ${this.currentTab === 'abyss' ? 'active' : ''}" onclick="OnlineSystem.switchTab('abyss')">${I18N.tr('online', 'leaderboard_tab_abyss')}</span>
            </div>`;
        }

// Leaderboard list
        if (items.length === 0) {
            html += `<div style="color: #666; text-align: center; padding: 20px;">${I18N.tr('online', 'leaderboard_empty')}</div>`;
        } else {
            const sortedItems = this.sortByTab(items).slice(0, 10); // Top 10 only
            if (sortedItems.length === 0) {
                html += `<div style="color: #666; text-align: center; padding: 20px;">${I18N.tr('online', 'leaderboard_week_empty')}</div>`;
            }
            sortedItems.forEach((item, i) => {
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
// Dual-track match: sync_code first, user_id fallback
                const mySyncCode = CloudSync.syncCode || localStorage.getItem('temp_user_id');
                const isMe = (mySyncCode && item.sync_code === mySyncCode) || item.user_id === this.userId;
                const valueText = this.getValueText(item);
                html += `<div class="stat-row" style="${isMe ? 'color: #ffff00; background: rgba(255,255,0,0.1);' : ''}">
                    <span>${medal} ${this.escapeHtml(item.nickname)}</span>
                    <span style="color: #888;">${valueText}</span>
                </div>`;
            });
        }

        panel.innerHTML = html;
        this.bindPanelDrag(panel);
    },

// Render personal bests
    renderPersonalBest() {
// Check whether the player object exists
        if (typeof player === 'undefined' || !player.personalBest) {
            return '';
        }
        const pb = player.personalBest;
        const stats = player.stats || {};

        let html = '<div class="personal-best">';
        html += `<div class="pb-title">${I18N.tr('online', 'leaderboard_welcome', '', { nickname: this.escapeHtml(OnlineSystem.nickname || I18N.tr('online', 'sync_default_warrior')) })}</div>`;
        html += '<div class="pb-grid">';
        html += `<div class="pb-item"><span class="pb-label">${I18N.tr('online', 'leaderboard_max_level')}</span><span class="pb-value">${I18N.tr('online', 'leaderboard_value_level', '', { level: pb.maxLevel || 1 })}</span></div>`;

// Show the max floor (normal or Hell)
        if (pb.maxHellFloor > 0) {
            html += `<div class="pb-item"><span class="pb-label">${I18N.tr('online', 'leaderboard_hell_floor')}</span><span class="pb-value" style="color:#ff6600;">${I18N.tr('online', 'leaderboard_value_hell_floor', '', { floor: pb.maxHellFloor })}</span></div>`;
        } else {
            html += `<div class="pb-item"><span class="pb-label">${I18N.tr('online', 'leaderboard_max_floor')}</span><span class="pb-value">${I18N.tr('online', 'leaderboard_value_floor', '', { floor: pb.maxFloor || 0 })}</span></div>`;
        }

        html += `<div class="pb-item"><span class="pb-label">${I18N.tr('online', 'leaderboard_total_kills')}</span><span class="pb-value">${player.kills || 0}</span></div>`;
        html += `<div class="pb-item"><span class="pb-label">${I18N.tr('online', 'leaderboard_boss_kills')}</span><span class="pb-value" style="color:#ff4444;">${stats.bossKills || 0}</span></div>`;
        html += '</div></div>';
        return html;
    },

// Switch board tabs
    switchTab(tab) {
        this.currentTab = tab;
        const panel = document.getElementById('leaderboard-panel');

// Abyss boards use a separate data source
        if (tab === 'abyss') {
            this.renderAbyssLeaderboard(panel);
            return;
        }

        this.loadLeaderboard(true);
    },

// Render the abyss leaderboard (same style as the normal board)
    renderAbyssLeaderboard(panel) {
        if (!panel) return;

// Show the loading state first, keeping the full UI structure
        let html = '<div class="panel-close" onclick="togglePanel(\'leaderboard\')"></div>';
        html += `<div class="panel-header">${I18N.tr('online', 'leaderboard_title')}</div>`;

// Weekly/all-time toggle (no split on abyss boards)
        html += `<div class="leaderboard-mode-tabs">
            <span class="lb-mode-tab ${this.leaderboardMode === 'week' ? 'active' : ''}" onclick="OnlineSystem.switchMode('week')">${I18N.tr('online', 'leaderboard_week_mode')}</span>
            <span class="lb-mode-tab ${this.leaderboardMode === 'all' ? 'active' : ''}" onclick="OnlineSystem.switchMode('all')">${I18N.tr('online', 'leaderboard_all_time_mode')}</span>
        </div>`;

// Abyss personal record
        const bestScore = parseInt(localStorage.getItem('abyss_best_score') || '0');
        const bestFloor = parseInt(localStorage.getItem('abyss_best_floor') || '0');
        html += `<div class="personal-best">
            <div class="pb-title">${I18N.tr('online', 'leaderboard_abyss_title')}</div>
            <div class="pb-grid">
                <div class="pb-item"><span class="pb-label">${I18N.tr('online', 'leaderboard_max_floor')}</span><span class="pb-value" style="color:#ff6600;">${I18N.tr('online', 'leaderboard_value_floor', '', { floor: bestFloor })}</span></div>
                <div class="pb-item"><span class="pb-label">${I18N.tr('online', 'leaderboard_best_score')}</span><span class="pb-value" style="color:#ffcc00;">${I18N.tr('online', 'leaderboard_value_score', '', { score: bestScore })}</span></div>
            </div>
        </div>`;

// Weekly reset countdown
        html += `<div class="week-countdown">${I18N.tr('online', 'leaderboard_abyss_reset_countdown', '', { time: this.getTimeToNextWeek() })}</div>`;


// Tab labels (consistent with other boards)
        html += `<div class="leaderboard-tabs">
            <span class="lb-tab" onclick="OnlineSystem.switchTab('score')">${I18N.tr('online', 'leaderboard_tab_overall')}</span>
            <span class="lb-tab" onclick="OnlineSystem.switchTab('kills')">${I18N.tOr('slot_kills', 'Slain')}</span>
            ${this.leaderboardMode !== 'week' ? `<span class="lb-tab" onclick="OnlineSystem.switchTab('floor')">${I18N.tr('online', 'leaderboard_tab_floor')}</span>` : ''}
            ${this.leaderboardMode !== 'week' ? `<span class="lb-tab" onclick="OnlineSystem.switchTab('gold')">${I18N.tr('online', 'leaderboard_tab_gold')}</span>` : ''}
            <span class="lb-tab active">${I18N.tr('online', 'leaderboard_tab_abyss')}</span>
        </div>`;

        html += `<div id="abyss-loading" style="color: #888; text-align: center; padding: 20px;">${I18N.tr('online', 'leaderboard_loading')}</div>`;
        panel.innerHTML = html;
        this.bindPanelDrag(panel);

        // Loadabyssdata
        this.getAbyssLeaderboard((data) => {
            if (this.currentTab !== 'abyss') return; // user has navigated away

            let listHtml = '';
            if (data.error) {
                listHtml = `<div style="color: #f44; text-align: center; padding: 20px;">${I18N.tr('online', 'leaderboard_load_failed')}</div>`;
            } else if (data.list.length === 0) {
                listHtml = `<div style="color: #666; text-align: center; padding: 20px;">${I18N.tr('online', 'leaderboard_abyss_empty')}</div>`;
            } else {
                data.list.slice(0, 10).forEach((item, i) => {
                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
                    listHtml += `<div class="stat-row" style="${item.isSelf ? 'color: #ffff00; background: rgba(255,255,0,0.1);' : ''}">
                        <span>${medal} ${this.escapeHtml(item.name)}</span>
                        <span style="color: #ff8800;">${I18N.tr('online', 'leaderboard_value_abyss_row', '', { floor: item.floor, score: item.score })}</span>
                    </div>`;
                });

                // myrank
                if (data.myRank > 0) {
                    listHtml += `<div class="stat-row" style="margin-top: 10px; border-top: 1px solid #333; padding-top: 10px; color: #ffcc00;">
                        <span>${I18N.tr('online', 'leaderboard_my_rank')}</span>
                        <span>${I18N.tr('online', 'leaderboard_rank_position', '', { rank: data.myRank })}</span>
                    </div>`;
                }
            }

// Update the list part only
            const loadingDiv = document.getElementById('abyss-loading');
            if (loadingDiv) {
                loadingDiv.outerHTML = listHtml;
            }
        });
    },

// Toggle weekly/all-time mode
    switchMode(mode) {
        this.leaderboardMode = mode;
// Weekly mode supports only score and kills
        if (mode === 'week' && this.currentTab !== 'score' && this.currentTab !== 'kills') {
            this.currentTab = 'score';
        }
        const panel = document.getElementById('leaderboard-panel');
        this.loadLeaderboard(true);
    },

// Sort by the current tab
    sortByTab(items) {
        const sorted = [...items];
        const isWeekMode = this.leaderboardMode === 'week';
        const currentWeekStart = this.getWeekStart();

        switch (this.currentTab) {
            case 'kills':
                if (isWeekMode) {
                    // weekly leaderboard:according to week_kills sort，filterfallnon-this weekdata
                    return sorted
                        .filter(item => (item.week_start || 0) >= currentWeekStart)
                        .sort((a, b) => (b.week_kills || 0) - (a.week_kills || 0));
                }
                return sorted.sort((a, b) => (b.kills || 0) - (a.kills || 0));
            case 'floor':
                return sorted.sort((a, b) => {
                    const aFloor = a.is_hell ? (a.max_floor || 0) + 10 : (a.max_floor || 0);
                    const bFloor = b.is_hell ? (b.max_floor || 0) + 10 : (b.max_floor || 0);
                    return bFloor - aFloor;
                });
            case 'gold':
                return sorted.sort((a, b) => (b.gold || 0) - (a.gold || 0));
            default: // score
                if (isWeekMode) {
                    // weekly leaderboard:according to week_score sort，filterfallnon-this weekdata
                    return sorted
                        .filter(item => (item.week_start || 0) >= currentWeekStart)
                        .sort((a, b) => (b.week_score || 0) - (a.week_score || 0));
                }
                return sorted.sort((a, b) => (b.score || 0) - (a.score || 0));
        }
    },

// Get the display text by the current tab
    getValueText(item) {
        const isWeekMode = this.leaderboardMode === 'week';

        switch (this.currentTab) {
            case 'kills':
                return I18N.tr('online', 'leaderboard_value_kills', '', { kills: isWeekMode ? (item.week_kills || 0) : (item.kills || 0) });
            case 'floor':
                return item.is_hell
                    ? I18N.tr('online', 'leaderboard_value_hell_floor', '', { floor: item.max_floor })
                    : I18N.tr('online', 'leaderboard_value_floor', '', { floor: item.max_floor });
            case 'gold':
                return I18N.tr('online', 'leaderboard_value_gold', '', { gold: (item.gold || 0).toLocaleString() });
            default:
                if (isWeekMode) {
                    return I18N.tr('online', 'leaderboard_value_week_score', '', { score: item.week_score || 0 });
                }
// {floor} expects localized floor text
                const floorText = item.is_hell
                    ? I18N.tr('online', 'leaderboard_value_hell_floor', '', { floor: item.max_floor })
                    : I18N.tr('online', 'leaderboard_value_floor', '', { floor: item.max_floor });
                return I18N.tr('online', 'leaderboard_value_overall', '', { level: item.level, floor: floorText });
        }
    },

    // bindpaneldrag
    bindPanelDrag(panel) {
        const header = panel.querySelector('.panel-header');
        if (!header) return;

        let dragOffsetX = 0, dragOffsetY = 0, isDragging = false;

        header.onmousedown = (e) => {
            e.preventDefault();
            e.stopPropagation();
            isDragging = true;

            document.querySelectorAll('.panel').forEach(p => p.style.zIndex = 60);
            panel.style.zIndex = 61;

            const rect = panel.getBoundingClientRect();
            panel.style.left = rect.left + 'px';
            panel.style.top = rect.top + 'px';
            panel.style.transform = 'none';

            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;

            const onMove = (e) => {
                if (isDragging) {
                    panel.style.left = (e.clientX - dragOffsetX) + 'px';
                    panel.style.top = (e.clientY - dragOffsetY) + 'px';
                }
            };
            const onUp = () => {
                isDragging = false;
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        };
    },

    leaderboardData: [],

// ========== Server announcement system ==========
    announcementQueue: [],      // Announcement queue
    isScrolling: false,         // Whether scrolling
    lastAnnouncementTime: 0,    // Last announcement fetch time
    shownAnnouncementIds: new Set(),  // Shown announcement ids (de-dup)
    realtimeSubscribed: false,  // Whether Realtime is subscribed
    announcementCooldowns: {},
    announcementPolicies: {
        boss_kill: { cooldownMs: 5 * 60 * 1000 },
        set_drop: { cooldownMs: 12 * 1000 },
        level_milestone: { cooldownMs: 10 * 60 * 1000 },
        enhance_success: { cooldownMs: 60 * 1000, minExtraData: 6 },
        title_unlock: { cooldownMs: 5 * 60 * 1000 },
        abyss_champion: { cooldownMs: 10 * 60 * 1000 },
        abyss_top10: { cooldownMs: 10 * 60 * 1000 },
        stall_open: { enabled: false },
        item_sold: { enabled: false }
    },

// Init the announcement system
    initAnnouncements() {
        this.createAnnouncementUI();
        this.loadAnnouncements();  // Load historical announcements first

        // ========== directioncaseB: Realtime real-timepush ==========
        this.subscribeAnnouncements();

// ========== Option A: polling (commented out) ==========
        // setInterval(() => this.loadAnnouncements(), 30000);
    },

// Realtime announcement subscription
    async subscribeAnnouncements() {
        try {
// Subscribe to all announcements table changes
            await pb.collection('announcements').subscribe('*', (e) => {
// Only handle newly created announcements
                if (e.action === 'create') {
                    const record = e.record;
                    // de-dupe
                    if (!this.shownAnnouncementIds.has(record.id)) {
                        this.shownAnnouncementIds.add(record.id);
                        this.announcementQueue.push(this.formatAnnouncement(record));

// Not currently scrolling: start immediately
                        if (!this.isScrolling) {
                            this.scrollNextAnnouncement();
                        }
                    }
                }
            });
            this.realtimeSubscribed = true;
            console.log('[Announcements] Realtime subscribed');
        } catch (e) {
            console.warn('[Announcements] Realtime subscribe failed, falling back to polling', e);
// Degrade to polling mode
            setInterval(() => this.loadAnnouncements(), 30000);
        }
    },

// Unsubscribe (called on page close)
    unsubscribeAnnouncements() {
        if (this.realtimeSubscribed) {
            pb.collection('announcements').unsubscribe('*');
            this.realtimeSubscribed = false;
        }
    },

    // CreateannounceUI
    createAnnouncementUI() {
        let bar = document.getElementById('announcement-bar');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'announcement-bar';
            bar.innerHTML = '<div id="announcement-content"></div>';
            document.querySelector('.ui-layer')?.appendChild(bar);
        }
    },

// Load historical announcements (once at init)
    async loadAnnouncements() {
        try {
// Init pulls only recent announcements so a refresh doesn't re-scroll history.
            const recentCutoff = new Date(Date.now() - 45 * 1000).toISOString().replace('T', ' ');
            const records = await pb.collection('announcements').getList(1, 8, {
                filter: `created >= "${recentCutoff}"`,
                sort: '-created'
            });

// Filter shown announcements and queue new ones
            for (const record of records.items.reverse()) {
                if (!this.shownAnnouncementIds.has(record.id)) {
                    this.shownAnnouncementIds.add(record.id);
                    this.announcementQueue.push(this.formatAnnouncement(record));
                }
            }

            // CleanupexpiredID（keepmostnear100entries）
            if (this.shownAnnouncementIds.size > 100) {
                const arr = Array.from(this.shownAnnouncementIds);
                this.shownAnnouncementIds = new Set(arr.slice(-50));
            }

            // startscroll
            if (!this.isScrolling && this.announcementQueue.length > 0) {
                this.scrollNextAnnouncement();
            }
        } catch (e) { }
    },

// Format the announcement text
    formatAnnouncement(record) {
// Stall announcements need no floor info
        const needsFloor = !['stall_open', 'item_sold'].includes(record.type);
        let floorText = '';
        if (needsFloor) {
            const floorName = getFloorName(record.floor, record.is_hell);
// {floor} receives localized floor text
            floorText = I18N.tr('online', 'announce_floor_label', '', { floor: record.floor, name: floorName });
        }

        switch (record.type) {
            case 'boss_kill':
                return {
                    text: I18N.tr('online', 'announce_boss_kill', '', { nickname: record.nickname, target: record.target_name, floor: floorText }),
                    type: 'boss'
                };
            case 'set_drop':
                return {
                    text: I18N.tr('online', 'announce_set_drop', '', { nickname: record.nickname, target: record.target_name, floor: floorText }),
                    type: 'set'
                };
            case 'level_milestone':
                return {
                    text: I18N.tr('online', 'announce_level_milestone', '', { nickname: record.nickname, level: record.target_name }),
                    type: 'level'
                };
            case 'enhance_success':
                return {
                    text: I18N.tr('online', 'announce_enhance_success', '', { nickname: record.nickname, item: record.target_name }),
                    type: 'enhance'
                };
            case 'stall_open':
                return {
                    text: I18N.tr('online', 'announce_stall_open', '', { nickname: record.nickname, stall: record.target_name }),
                    type: 'stall'
                };
            case 'item_sold':
                return {
                    text: I18N.tr('online', 'announce_item_sold', '', { nickname: record.nickname, item: record.target_name, gold: record.extra_data }),
                    type: 'gold'
                };
            case 'abyss_champion':
                return {
                    text: I18N.tr('online', 'announce_abyss_champion', '', { nickname: record.nickname, target: record.target_name }),
                    type: 'abyss'
                };
            case 'abyss_top10':
                return {
                    text: I18N.tr('online', 'announce_abyss_top10', '', { nickname: record.nickname, rank: record.extra_data }),
                    type: 'abyss'
                };
            case 'title_unlock':
                return {
                    text: I18N.tr('online', 'announce_title_unlock', '', { nickname: record.nickname, title: record.target_name }),
                    type: 'title'
                };
            default:
                return {
                    text: I18N.tr('online', 'announce_default', '', { nickname: record.nickname, text: record.target_name }),
                    type: 'default'
                };
        }
    },

// Scroll the next announcement
    scrollNextAnnouncement() {
        if (this.announcementQueue.length === 0) {
            this.isScrolling = false;
            return;
        }

        this.isScrolling = true;
        const announcement = this.announcementQueue.shift();
        const content = document.getElementById('announcement-content');
        if (!content) return;

// Set the announcement content and style
        content.innerText = announcement.text;
        const typeClassMap = {
            'boss': 'boss-announcement',
            'set': 'set-announcement',
            'level': 'level-announcement',
            'enhance': 'enhance-announcement',
            'abyss': 'abyss-announcement',
            'title': 'title-announcement'
        };
        content.className = typeClassMap[announcement.type] || 'set-announcement';

        // Resetanimation
        content.style.animation = 'none';
        content.offsetHeight; // triggerre-draw
        content.style.animation = 'scrollAnnouncement 8s linear';

// Show the next one after the animation
        setTimeout(() => this.scrollNextAnnouncement(), 8500);
    },

// Submit the announcement
    async announce(type, targetName, extraData) {
        if (!this.userId || !this.nickname) return;
        if (!this.shouldPublishAnnouncement(type, targetName, extraData)) return;

        const floor = typeof player !== 'undefined' ?
            (player.isInHell ? player.hellFloor : player.floor) : 1;
        const isHell = typeof player !== 'undefined' ? player.isInHell : false;

        const recordData = {
            type: type,
            nickname: this.nickname,
            floor: floor,
            is_hell: isHell,
            target_name: targetName
        };

        // ifthere isextradata（as ifsellgold coinforehead），addarrive atlogin
        if (extraData !== undefined) {
            recordData.extra_data = extraData.toString();
        }

        try {
            await pb.collection('announcements').create(recordData);
// Also clean old announcements, keeping the latest 30
            this.gcKeepRecent('announcements', 30);

            if (this.shouldMirrorAnnouncementToChat(type, extraData)) {
                this.sendAnnouncementToChat(type, targetName, floor, isHell, extraData);
            }
        } catch (e) {
            if (e.status === 403) {
                console.warn('[Announcements] cannot publish: please open the Create rule (empty string) for the announcements collection in the PocketBase admin.');
            } else {
                console.error('[Announcements] publish error:', e.message);
                if (e.response && e.response.data) {
                    console.error('[Announcements] error details:', JSON.stringify(e.response.data));
                }
            }
        }
    },

    shouldPublishAnnouncement(type, targetName, extraData) {
        const policy = this.announcementPolicies[type] || { cooldownMs: 60 * 1000 };
        if (policy.enabled === false) return false;

        if (policy.minExtraData !== undefined) {
            const numericExtra = Number(extraData);
            if (!Number.isFinite(numericExtra) || numericExtra < policy.minExtraData) return false;
        }

        const cooldownMs = policy.cooldownMs || 0;
        if (cooldownMs <= 0) return true;

        const key = policy.byTarget === true ? `${type}:${targetName || ''}` : type;
        const now = Date.now();
        if (this.announcementCooldowns[key] && now - this.announcementCooldowns[key] < cooldownMs) return false;
        this.announcementCooldowns[key] = now;
        return true;
    },

    shouldMirrorAnnouncementToChat(type, extraData) {
        return false;
    },

// Send the announcement to the world channel
    async sendAnnouncementToChat(type, targetName, floor, isHell, extraData) {
        // Generate announcement text (with type tag for display coloring); the only difference from the ticker is no emoji prefix
        const floorName = typeof getFloorName === 'function' ? getFloorName(floor, isHell) : I18N.tr('online', 'announce_floor_short', '', { floor });
// {floor} receives localized floor text
        const floorText = I18N.tr('online', 'announce_floor_label', '', { floor, name: floorName });

        let message = '';
        let msgType = '';
        switch (type) {
            case 'boss_kill':
                msgType = 'boss';
                message = I18N.tr('online', 'announce_boss_kill', '', { nickname: this.nickname, target: targetName, floor: floorText });
                break;
            case 'set_drop':
                msgType = 'set';
                message = I18N.tr('online', 'announce_set_drop', '', { nickname: this.nickname, target: targetName, floor: floorText });
                break;
            case 'level_milestone':
                msgType = 'level';
                message = I18N.tr('online', 'announce_level_milestone', '', { nickname: this.nickname, level: targetName });
                break;
            case 'enhance_success':
                msgType = 'enhance';
                message = I18N.tr('online', 'announce_enhance_success', '', { nickname: this.nickname, item: targetName });
                break;
            case 'title_unlock':
                msgType = 'title';
                message = I18N.tr('online', 'announce_chat_title_unlock', '', { nickname: this.nickname, title: targetName });
                break;
            case 'abyss_champion':
                msgType = 'abyss';
                message = I18N.tr('online', 'announce_chat_abyss_champion', '', { nickname: this.nickname, target: targetName });
                break;
            case 'abyss_top10':
                msgType = 'abyss';
                message = I18N.tr('online', 'announce_chat_abyss_top10', '', { nickname: this.nickname, rank: extraData });
                break;
            default:
                return; // othertype（stall、sell）notshoot outarrive atchatheaven
        }

        try {
// Message format: [type:xxx]content; type parsed and colored at display time
            await pb.collection('chat_messages').create({
                nickname: 'System',
                level: 0,
                message: `[type:${msgType}]${message}`,
                user_id: 'system',
                title: ''
            });
        } catch (e) {
// Silent failure; never disturbs the main flow
        }
    }
};

OnlineSystem.bootstrapLocalIdentity();

// ========== World chat system ==========
const ChatSystem = {
    isCollapsed: false,
    lastSendTime: 0,
    SEND_COOLDOWN: 3000,  // 3s chat cooldown
    MAX_MESSAGES: 50,     // Max retained messages
    HISTORY_FETCH_LIMIT: 80,
    HISTORY_DISPLAY_LIMIT: 20,
    realtimeSubscribed: false,
    unreadCount: 0,       // Unread message count
    isSending: false,     // Send lock prevents duplicate sends
    isReady: false,       // Whether chat is ready (sensitive-word list + Realtime subscription done)
    initStarted: false,
    blockedWordsReady: false,
    blockedWordsLoading: null,

// Get the title to display (newest first)
    getDisplayTitle() {
        if (typeof player === 'undefined') return '';

        const purchasedTitle = player.currentTitle && player.currentTitle !== 'none'
            ? (typeof TITLES !== 'undefined' ? TITLES.find(t => t.id === player.currentTitle)?.name : null)
            : null;
        const abyssTitle = player.abyssTitle || null;

        // ifallnotitle
        if (!purchasedTitle && !abyssTitle) return '';

// Only one: return it directly
        if (!purchasedTitle) return abyssTitle;
        if (!abyssTitle) return purchasedTitle;

// Both exist: compare acquired time (newest first)
        const titleTime = player.titleObtainedTime || 0;
        const abyssTitleTime = player.abyssTitleObtainedTime || 0;

        return titleTime >= abyssTitleTime ? purchasedTitle : abyssTitle;
    },

// Sensitive word list (loaded from the server; these are fallback defaults)
    BLOCKED_WORDS: ['sb', 'cnm', 'nmsl'],

// Load sensitive words from the server
    async loadBlockedWords() {
        try {
            const record = await pb.collection('settings').getFirstListItem('key = "blocked_words"');
            if (record && Array.isArray(record.value)) {
                this.BLOCKED_WORDS = record.value;
                console.log('[Chat] sensitive-word list loaded:', this.BLOCKED_WORDS.length, ' entries');
            }
        } catch (e) {
            console.warn('[Chat] failed to load sensitive words, using default list');
        } finally {
            this.blockedWordsReady = true;
        }
    },

    ensureBlockedWordsLoaded() {
        if (this.blockedWordsReady) return Promise.resolve();
        if (!this.blockedWordsLoading) {
            this.blockedWordsLoading = this.loadBlockedWords().finally(() => {
                this.blockedWordsLoading = null;
            });
        }
        return this.blockedWordsLoading;
    },

// Sensitive word filter (global; replaces with *)
    filterSensitiveWords(text) {
        let result = text;
        for (const word of this.BLOCKED_WORDS) {
// Case-insensitive replacement
            const regex = new RegExp(this.escapeRegex(word), 'gi');
            result = result.replace(regex, '*'.repeat(word.length));
        }
        return result;
    },

// Init the chat system
    async init() {
        if (this.initStarted) return;
        this.initStarted = true;

// Start with the chat box disabled (gray, collapsed, inert)
        this.setDisabled(true);

// Load the sensitive-word list and subscribe to messages in parallel
        await Promise.all([
            this.ensureBlockedWordsLoaded(),
            this.subscribeMessages()
        ]);

        this.bindEvents();
        this.loadRecentMessages();

// Restore the collapsed state from localStorage
        this.isCollapsed = localStorage.getItem('chat_collapsed') === 'true';
        if (this.isCollapsed) {
            document.getElementById('chat-box')?.classList.add('collapsed');
        }

// Init complete: activate the chat box
        this.setReady();
    },

// Set the chat ready state
    setReady() {
        this.isReady = true;
        this.setDisabled(false);
        console.log('[Chat] initialized, chat active');
    },

// Set the chat box disabled/enabled state
    setDisabled(disabled) {
        const chatBox = document.getElementById('chat-box');
        if (!chatBox) return;

        if (disabled) {
            chatBox.classList.add('chat-disabled');
        } else {
            chatBox.classList.remove('chat-disabled');
        }
    },

// Bind events
    bindEvents() {
        const input = document.getElementById('chat-input');
        if (input) {
            // Enter to send; stop event bubbling to the game
            input.onkeydown = (e) => {
                e.stopPropagation();  // Stop bubbling so game interactions don't fire
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            };
// Prevent game key conflicts
            input.onkeyup = (e) => e.stopPropagation();
            input.onfocus = () => {
// Disable game hotkeys while typing in chat
                window.chatInputFocused = true;
            };
            input.onblur = () => {
                window.chatInputFocused = false;
            };
        }
    },

    // subscribereal-timemessage
    async subscribeMessages() {
        try {
            await pb.collection('chat_messages').subscribe('*', (e) => {
                if (e.action === 'create') {
                    this.addMessage(e.record);
                }
            });
            this.realtimeSubscribed = true;
            console.log('[Chat] Realtime subscribed');
        } catch (e) {
            console.warn('[Chat] Realtime subscribe failed', e);
        }
    },

// Load recent messages
    async loadRecentMessages() {
        try {
            const records = await pb.collection('chat_messages').getList(1, this.HISTORY_FETCH_LIMIT, {
                sort: '-created'
            });
            const messages = records.items
                .filter(msg => !this.shouldHideSystemAnnouncement(msg))
                .slice(0, this.HISTORY_DISPLAY_LIMIT)
                .reverse();
            messages.forEach(msg => this.addMessage(msg, false));
            this.scrollToBottom();
        } catch (e) {
            console.warn('[Chat] failed to load history', e);
        }
    },

    // sendmessage
    // private chattargetcache { nickname: userId }
    whisperTargetCache: {},

    escapePbFilterValue(value) {
        return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    },

    async findOnlineUserIdByNickname(nickname) {
        const safeNickname = this.escapePbFilterValue(nickname);
        const activeCutoff = new Date(Date.now() - 2 * 60 * 1000).toISOString().replace('T', ' ');
        const records = await pb.collection('online').getList(1, 1, {
            filter: `nickname = "${safeNickname}" && last_active >= "${activeCutoff}"`,
            sort: '-last_active'
        });
        const userId = records.items[0]?.user_id;
        return userId || null;
    },

    async findRecentChatUserIdByNickname(nickname) {
        const safeNickname = this.escapePbFilterValue(nickname);
        const records = await pb.collection('chat_messages').getList(1, 1, {
            filter: `nickname = "${safeNickname}" && user_id != "system"`,
            sort: '-created'
        });
        const userId = records.items[0]?.user_id;
        return userId || null;
    },

    async findWhisperTargetUserId(nickname) {
        if (this.whisperTargetCache[nickname]) {
            return this.whisperTargetCache[nickname];
        }

        let userId = await this.findOnlineUserIdByNickname(nickname);
        if (!userId) {
            userId = await this.findRecentChatUserIdByNickname(nickname);
        }
        if (userId) {
            this.whisperTargetCache[nickname] = userId;
        }
        return userId;
    },

    async sendMessage() {
        const input = document.getElementById('chat-input');
        if (!input) return;

        const message = input.value.trim();
        if (!message) return;

        // Intercept local test commands
        if (message === '/sets' || message === '/set') {
            this.addSystemMessage('Sets disponibles: tals_set, immortal_king, shadow_dancer, natalya, griswold, trang_oul, aldur, mavina, sigon, abyss_conqueror. Uso: /set <id>');
            input.value = '';
            return;
        }
        if (message.startsWith('/set ')) {
            const setId = message.substring(5).trim();
            if (typeof window.cheatGetSet === 'function') {
                window.cheatGetSet(setId);
            } else {
                this.addSystemMessage('Sistema de trucos no disponible.');
            }
            input.value = '';
            return;
        }

// Prevent duplicate sends (during network lag)
        if (this.isSending) return;

// Check login state
        if (!OnlineSystem.nickname) {
            this.addSystemMessage(I18N.tr('online', 'chat_need_nickname'));
            return;
        }

        // Checkcooldown
        const now = Date.now();
        if (now - this.lastSendTime < this.SEND_COOLDOWN) {
            const remaining = Math.ceil((this.SEND_COOLDOWN - (now - this.lastSendTime)) / 1000);
            this.addSystemMessage(I18N.tr('online', 'chat_cooldown', '', { seconds: remaining }));
            return;
        }

        // parseprivate chattarget @playername
        let targetUserId = null;
        let targetNickname = null;
        let actualMessage = message;

        const whisperMatch = message.match(/^@([^\s]+)\s+(.+)/);
        if (whisperMatch) {
            targetNickname = whisperMatch[1];
            actualMessage = whisperMatch[2];

            // notcanprivate chatown
            if (targetNickname === OnlineSystem.nickname) {
                this.addSystemMessage(I18N.tr('online', 'chat_cannot_whisper_self'));
                return;
            }

            try {
                targetUserId = await this.findWhisperTargetUserId(targetNickname);
            } catch (e) {
                console.warn('[DM] user lookup failed', e);
            }

            if (!targetUserId) {
                this.addSystemMessage(I18N.tr('online', 'chat_player_not_found', '', { nickname: targetNickname }));
                return;
            }
        }

// Handle item share links (when an item awaits sending)
        let processedMessage = actualMessage;
        if (typeof pendingShareItem !== 'undefined' && pendingShareItem) {
            const itemData = pendingShareItem;
            const baseName = itemData.n;
            const enhanceText = itemData.e > 0 ? ` +${itemData.e}` : '';  // mind the spaces
            const placeholder = `[${baseName}${enhanceText}]`;

// Generate the encoded item link
            const encoded = btoa(encodeURIComponent(JSON.stringify(itemData)));
            const itemLink = `[item:${encoded}]`;

// Swap the display name for the encoded format
            processedMessage = actualMessage.replace(placeholder, itemLink);
            pendingShareItem = null;  // Clear the pending item
        }

// Sensitive word filter - but skip item link parts
        let filtered = processedMessage;
        const itemLinkMatch = processedMessage.match(/\[item:[A-Za-z0-9+/=]+\]/);
        if (itemLinkMatch) {
// Protect item links; filter the rest
            const linkPlaceholder = '___ITEM_LINK___';
            const tempMsg = processedMessage.replace(itemLinkMatch[0], linkPlaceholder);
            const filteredTemp = this.filterMessage(tempMsg);
            filtered = filteredTemp.replace(linkPlaceholder, itemLinkMatch[0]);
        } else {
            filtered = this.filterMessage(processedMessage);
        }

        // Getplayerlevel
        const level = typeof player !== 'undefined' ? player.lvl : 1;

        // Setsendlock
        this.isSending = true;
        input.disabled = true;

// Get the title to display (newest first)
        const displayTitle = this.getDisplayTitle();

        try {
            const msgData = {
                nickname: OnlineSystem.nickname,
                level: level,
                message: filtered,  // Send the filtered message
                user_id: OnlineSystem.userId,
                title: displayTitle  // title
            };

// Add the target user for whispers
            if (targetUserId) {
                msgData.targetUserId = targetUserId;
                msgData.targetNickname = targetNickname;
            }

            const record = await pb.collection('chat_messages').create(msgData);
            input.value = '';
            this.lastSendTime = now;
// Show your own sent message locally right away
            this.addMessage(record);
// Also clean old messages, keeping the latest 50
            OnlineSystem.gcKeepRecent('chat_messages', 50);
        } catch (e) {
            this.addSystemMessage(I18N.tr('online', 'chat_send_failed'));
        } finally {
// Release the send lock
            this.isSending = false;
            input.disabled = false;
            input.focus();
        }
    },

// Escape regex special characters
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

// Sensitive word filter (replaces with *)
    filterMessage(message) {
        return this.filterSensitiveWords(message);
    },

    shownMessageIds: new Set(),  // Prevent duplicate display

    shouldHideSystemAnnouncement(record) {
        return record.user_id === 'system' && typeof record.message === 'string' && /^\[type:\w+\]/.test(record.message);
    },

// Parse and render item links
    parseItemLinks(text) {
        // matching [item:base64data] format
        const itemLinkRegex = /\[item:([A-Za-z0-9+/=]+)\]/g;

        const result = text.replace(itemLinkRegex, (match, base64Data) => {
            try {
                const jsonStr = decodeURIComponent(atob(base64Data));
                const item = JSON.parse(jsonStr);

                // Getraritycolor
                const rarityColors = {
                    0: '#aaa', 1: '#fff', 2: '#4d94ff',
                    3: '#ffff00', 4: '#c7b377', 5: '#00ff00'
                };
                const color = rarityColors[item.r] || '#fff';
                const enhanceText = item.e > 0 ? ` +${item.e}` : '';  // mind the spaces

// Return a clickable item link
                return `<span class="chat-item-link" style="color:${color}" data-item='${this.escapeHtml(base64Data)}'>[${this.escapeHtml(item.n)}${enhanceText}]</span>`;
            } catch (e) {
                return match; // On parse failure, return as-is
            }
        });
        return result;
    },

// Show the item link tooltip (near the tap point, no share button)
    showItemLinkTooltip(base64Data, event) {
        try {
            const jsonStr = decodeURIComponent(atob(base64Data));
            const data = JSON.parse(jsonStr);

// Rebuild the item object for tooltip display
            const item = {
                name: data.n,
                displayName: data.n,
                rarity: data.r,
                type: data.t,
                setId: data.s,
                stats: data.st,
                def: data.f,
                enhanceLvl: data.e
            };

            // parsedamage
            if (data.d) {
                const [min, max] = data.d.split('-').map(Number);
                item.minDmg = min;
                item.maxDmg = max;
            }

// Use the dedicated chat-link tooltip renderer (positioned at the tap point, no share button)
            if (typeof showTooltipForChatLink === 'function') {
                showTooltipForChatLink(item, event);
            }
        } catch (e) {
            console.warn('Failed to parse item link', e);
        }
    },

// Add the message to the chat box
    addMessage(record, scroll = true) {
        const container = document.getElementById('chat-messages');
        if (!container) return;

        // de-dupe
        if (this.shownMessageIds.has(record.id)) return;
        if (this.shouldHideSystemAnnouncement(record)) return;
        this.shownMessageIds.add(record.id);
// Clean excess ids
        if (this.shownMessageIds.size > 200) {
            const arr = Array.from(this.shownMessageIds);
            this.shownMessageIds = new Set(arr.slice(-100));
        }

// Whisper filter: only sender and receiver see them
        const isWhisper = record.targetUserId && record.targetUserId.length > 0;
        if (isWhisper) {
            const isSender = record.user_id === OnlineSystem.userId;
            const isReceiver = record.targetUserId === OnlineSystem.userId;
            if (!isSender && !isReceiver) {
                return;  // Whispers unrelated to you are hidden
            }
        }

        const msgEl = document.createElement('div');
        const isSystem = record.user_id === 'system';
        msgEl.className = isSystem ? 'chat-msg system' : (isWhisper ? 'chat-msg whisper' : 'chat-msg');

// Decide whether it's your own message
        const isMe = record.user_id === OnlineSystem.userId;
        const nicknameColor = isSystem ? '#ffd700' : (isWhisper ? '#cc88ff' : (isMe ? '#ffff88' : '#88ccff'));

// System messages: parse the type tag and color it
        if (isSystem) {
            let msg = record.message;
            let color = '#ffd700';  // default gold

            // parsetypemark [type:xxx]
            const typeMatch = msg.match(/^\[type:(\w+)\]/);
            if (typeMatch) {
                const msgType = typeMatch[1];
                msg = msg.replace(/^\[type:\w+\]/, '');  // remove marker

// Color by type (consistent with the top announcements)
                const typeColors = {
                    boss: '#ffd700',    // gold
                    set: '#20ff20',     // green
                    level: '#ff66ff',   // pink
                    enhance: '#ff8800', // orange
                    abyss: '#ff4444',   // red
                    title: '#ffd700'    // gold
                };
                color = typeColors[msgType] || '#ffd700';
            }

            msgEl.innerHTML = `<span class="chat-msg-content" style="color:${color}">${this.escapeHtml(msg)}</span>`;
        } else {
            // titleShow
            let titleHtml = '';
            if (record.title) {
                titleHtml = `<span class="chat-msg-title">「${this.escapeHtml(record.title)}」</span>`;
            }

// Process content: escape HTML first, then parse item links
            const escapedMsg = this.escapeHtml(record.message);
            const parsedMsg = this.parseItemLinks(escapedMsg);

            // private chattab
            let whisperTag = '';
            if (isWhisper) {
                if (isMe) {
                    // mysendprivate chat
                    whisperTag = `<span class="chat-whisper-tag">${I18N.tr('online', 'chat_whisper_to', '', { nickname: this.escapeHtml(record.targetNickname || '?') })}</span>`;
                } else {
                    // collectarrive atprivate chat
                    whisperTag = `<span class="chat-whisper-tag">${I18N.tr('online', 'chat_whisper_in')}</span>`;
                }
            }

// Player nicknames are clickable to start whispers
            const nicknameHtml = isMe
                ? `<span class="chat-msg-nickname" style="color:${nicknameColor}">${this.escapeHtml(record.nickname)}</span>`
                : `<span class="chat-msg-nickname chat-nickname-clickable" style="color:${nicknameColor}" data-nickname="${this.escapeHtml(record.nickname)}">${this.escapeHtml(record.nickname)}</span>`;

// chat_level_prefix already ends with a colon, so no separate ":" here
            msgEl.innerHTML = `
                ${whisperTag}${nicknameHtml}${titleHtml}
                <span class="chat-msg-level">${this.escapeHtml(I18N.tr('online', 'chat_level_prefix', '', { level: record.level }))}</span>
                <span class="chat-msg-content">${parsedMsg}</span>
            `;
        }

// Bind item link click events
        msgEl.querySelectorAll('.chat-item-link').forEach(link => {
            link.onclick = (e) => {
                e.stopPropagation();
                const itemData = link.dataset.item;
                if (itemData) {
                    this.showItemLinkTooltip(itemData, e);
                }
            };
        });

// Bind nickname clicks (starts whispers)
        msgEl.querySelectorAll('.chat-nickname-clickable').forEach(nickname => {
            nickname.onclick = (e) => {
                e.stopPropagation();
                const targetNickname = nickname.dataset.nickname;
                if (targetNickname) {
                    this.startWhisper(targetNickname);
                }
            };
        });

        container.appendChild(msgEl);

// Cap the message count
        while (container.children.length > this.MAX_MESSAGES) {
            container.removeChild(container.firstChild);
        }

// While collapsed, count unread (own messages excluded)
        if (this.isCollapsed && scroll && !isMe) {
            this.unreadCount++;
            this.updateUnreadDisplay();
        }

        if (scroll) {
            this.scrollToBottom();
        }
    },

// Update the unread display
    updateUnreadDisplay() {
        const el = document.getElementById('chat-unread');
        if (!el) return;

        if (this.unreadCount > 0) {
            el.textContent = this.unreadCount > 99 ? '(99+)' : `(${this.unreadCount})`;
        } else {
            el.textContent = '';
        }
        if (typeof updateMobileChatUnreadDot === 'function') {
            updateMobileChatUnreadDot(this.unreadCount);
        }
    },

// Start a whisper (fills @name into the input)
    startWhisper(nickname) {
        const input = document.getElementById('chat-input');
        if (!input) return;

// Expand the chat box
        if (this.isCollapsed) {
            this.toggleExpand();
        }

        // Setinput fieldcontent
        input.value = `@${nickname} `;
        input.focus();

// Cache userId per nickname (online table first, then recent chat fallback)
// Non-blocking; searched in the background
        if (!this.whisperTargetCache[nickname]) {
            this.findWhisperTargetUserId(nickname).catch(() => {});
        }
    },

// Add a system message
    addSystemMessage(text) {
        const container = document.getElementById('chat-messages');
        if (!container) return;

        const msgEl = document.createElement('div');
        msgEl.className = 'chat-msg system';
        msgEl.innerHTML = `<span class="chat-msg-nickname">${I18N.tr('online', 'chat_system_tag')}</span> ${this.escapeHtml(text)}`;
        container.appendChild(msgEl);
        this.scrollToBottom();
    },

    // scrollarrive atbasesection
    scrollToBottom() {
        const container = document.getElementById('chat-messages');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    },

    // HTML revolvedef（defended against XSS）
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

// Toggle the collapsed state
    toggle() {
// No expanding while not ready
        if (!this.isReady && this.isCollapsed) {
            return;  // Stay collapsed; ignore clicks
        }

        this.isCollapsed = !this.isCollapsed;
        const chatBox = document.getElementById('chat-box');
        if (chatBox) {
            chatBox.classList.toggle('collapsed', this.isCollapsed);
        }
        localStorage.setItem('chat_collapsed', this.isCollapsed);

// On expand: clear unread, scroll to bottom, focus the input
        if (!this.isCollapsed) {
            this.unreadCount = 0;
            this.updateUnreadDisplay();
// Deferred so the CSS animation finishes
            setTimeout(() => {
                this.scrollToBottom();
                document.getElementById('chat-input')?.focus();
            }, 50);
        }
    }
};

// Global function: toggle the chat box
function toggleChatBox() {
    ChatSystem.toggle();
}

// Global function: send a chat message
function sendChatMessage() {
    ChatSystem.sendMessage();
}

// Global function: toggle the emote panel
function toggleEmotePanel(event) {
    event.stopPropagation();
    const panel = document.getElementById('emote-panel');
    if (!panel) return;

    const isVisible = panel.style.display !== 'none';
    panel.style.display = isVisible ? 'none' : 'block';

// Bind outside-click closing
    if (!isVisible) {
        setTimeout(() => {
            document.addEventListener('click', closeEmotePanelOnClickOutside);
        }, 10);
    }
}

// Outside clicks close the emote panel
function closeEmotePanelOnClickOutside(e) {
    const panel = document.getElementById('emote-panel');
    const btn = document.getElementById('emote-btn');
    if (panel && !panel.contains(e.target) && e.target !== btn) {
        panel.style.display = 'none';
        document.removeEventListener('click', closeEmotePanelOnClickOutside);
    }
}

// Init emote panel click events
function initEmotePanel() {
    const panel = document.getElementById('emote-panel');
    if (!panel) return;

    panel.addEventListener('click', (e) => {
        const item = e.target.closest('.emote-item');
        if (!item) return;

        e.stopPropagation();
        const emote = item.dataset.emote;
        if (!emote) return;

// Send the emote directly
        const input = document.getElementById('chat-input');
        if (input) {
            input.value = emote;
            ChatSystem.sendMessage();
        }

        // close panel
        panel.style.display = 'none';
        document.removeEventListener('click', closeEmotePanelOnClickOutside);
    });
}

// Init after page load
window.addEventListener('load', () => {
    OnlineSystem.bootstrapLocalIdentity();
    initEmotePanel();

// Check for unread update announcements
    const lastReadVersion = localStorage.getItem('changelog_read_version');
    const currentVersion = typeof CURRENT_VERSION !== 'undefined' ? CURRENT_VERSION : null;
    const hasUnreadChangelog = !lastReadVersion || lastReadVersion !== currentVersion;

    // Identity and cloud sync state must initialize first; the chat lexicon loads in background idle time.
    OnlineSystem.init(!hasUnreadChangelog);
    OnlineSystem.initAnnouncements();

    const startChat = () => ChatSystem.init();
    if ('requestIdleCallback' in window) {
        requestIdleCallback(startChat, { timeout: 3000 });
    } else {
        setTimeout(startChat, 0);
    }
});

// ========== Abyss leaderboard mock (patch) ==========
if (typeof OnlineSystem !== 'undefined') {
// ========== Abyss leaderboard (real) ==========
    OnlineSystem.getAbyssLeaderboard = async function (callback, minLvl, maxLvl) {
        try {
            let filter = '';
            if (minLvl !== undefined && maxLvl !== undefined) {
                filter = `level >= ${minLvl} && level <= ${maxLvl}`;
            } else if (minLvl !== undefined) {
                filter = `level >= ${minLvl}`;
            }

// Get the bracket's top 100
            const result = await pb.collection('abyss_rank').getList(1, 100, {
                sort: '-score',
                filter: filter,
                expand: 'user'
            });

            const records = result.items.map((item, index) => ({
                rank: index + 1,
                name: item.nickname || 'Unknown',
                lvl: item.level || 1,
                floor: item.floor || 1,
                score: item.score || 0,
// Identify yourself via sync code (including temp ids)
                isSelf: item.sync_code === CloudSync.syncCode ||
                    item.sync_code === localStorage.getItem('temp_user_id')
            }));

            // Getmyrank (ifatbefore100namein)
            let myRank = -1;
            let myLevelRank = -1;

            const myRecord = records.find(r => r.isSelf);
            if (myRecord) myRank = myRecord.rank;

// TODO: if outside the top 100, a separate query is needed

// Compute same-tier rank (simple filtering of the top 100 for display; accurate data needs backend support)
            const myLvl = player.lvl;
            const levelSubset = records.filter(r => Math.abs(r.lvl - myLvl) <= 5);
// Re-sort the subset
            levelSubset.sort((a, b) => b.score - a.score);

            if (myRecord) {
                myLevelRank = levelSubset.findIndex(r => r.isSelf) + 1;
            }

            if (callback) callback({
                list: records,
                myRank: myRank,
                myLevelRank: myLevelRank,
                totalPlayers: result.totalItems
            });

        } catch (e) {
            console.error('[Online] leaderboard fetch failed:', e);
            // On failure return empty or show an error; never fabricate data
            if (callback) callback({
                list: [],
                myRank: 0,
                myLevelRank: 0,
                totalPlayers: 0,
                error: true
            });
        }
    };

    OnlineSystem.submitAbyssScore = async function (score, floor) {
// Get the sync code, or the temp id (6 alphanumerics) when unbound
        let syncCode = CloudSync.syncCode;
        if (!syncCode) {
            let tempId = localStorage.getItem('temp_user_id');
            if (!tempId) {
                tempId = Math.random().toString(36).substr(2, 6).toUpperCase();
                localStorage.setItem('temp_user_id', tempId);
            }
            syncCode = tempId;
        }

        const data = {
            sync_code: syncCode,
            nickname: OnlineSystem.nickname || I18N.tr('online', 'sync_default_warrior'),
            score: score,
            floor: floor,
            level: player.lvl
        };

        console.log('[Abyss] submitting data:', JSON.stringify(data));

        try {
// Get the current rank 1 first (to detect overtaking)
            const topResult = await pb.collection('abyss_rank').getList(1, 1, {
                sort: '-score'
            });
            const previousChampion = topResult.items.length > 0 ? topResult.items[0] : null;
            const previousChampionScore = previousChampion ? previousChampion.score : 0;
            const previousChampionName = previousChampion ? previousChampion.nickname : null;

// Get my previous rank
            const previousRankData = await pb.collection('abyss_rank').getList(1, 1, {
                filter: `sync_code = "${syncCode}"`
            });
            const myPreviousScore = previousRankData.items.length > 0 ? previousRankData.items[0].score : 0;

// Query whether a record exists
            const existing = await pb.collection('abyss_rank').getList(1, 1, {
                filter: `sync_code = "${syncCode}"`
            });

            if (existing.items.length > 0) {
                const record = existing.items[0];
// Update only on a higher score
                if (score > record.score) {
                    await pb.collection('abyss_rank').update(record.id, data);
                    console.log('[Online] updating abyss record:', score);
                }
            } else {
                await pb.collection('abyss_rank').create(data);
                console.log('[Online] creating abyss record:', score);
            }

            // Get my bracket rank (ladder logic)
            const myBracket = player.lvl <= 30 ? [20, 30] : (player.lvl <= 50 ? [31, 50] : [51, 999]);
            const bracketFilter = `level >= ${myBracket[0]} && level <= ${myBracket[1]}`;

// Check whether rank 1 was overtaken in the bracket
            const bracketTopResult = await pb.collection('abyss_rank').getList(1, 1, {
                sort: '-score',
                filter: bracketFilter
            });
            const previousBracketChampion = bracketTopResult.items.length > 0 ? bracketTopResult.items[0] : null;

            if (score > (previousBracketChampion?.score || 0) && previousBracketChampion?.nickname !== data.nickname) {
// Square brackets are hardcoded in code; bracket names contain none
                const bracketName = player.lvl <= 30 ? I18N.tr('online', 'announce_bracket_rookie') : (player.lvl <= 50 ? I18N.tr('online', 'announce_bracket_elite') : I18N.tr('online', 'announce_bracket_peak'));
                OnlineSystem.announce('abyss_champion', `[${bracketName}]`, score);
                console.log(`[Abyss] announcement: surpass the ${bracketName} champion`);
            }

// Check whether the bracket top 10 was reached
            const bracketRankResult = await pb.collection('abyss_rank').getList(1, 10, {
                sort: '-score',
                filter: bracketFilter
            });
            const myBracketRank = bracketRankResult.items.findIndex(r => r.sync_code === syncCode) + 1;
            if (myBracketRank > 0 && myBracketRank <= 10 && myPreviousScore === 0) {
                OnlineSystem.announce('abyss_top10', 'Bracket Challenge', myBracketRank);
            }

        } catch (e) {
            console.error('[Online] score submit failed:', e);
// Print detailed error info
            if (e.response && e.response.data) {
                console.error('[Online] error details:', JSON.stringify(e.response.data));
            }
        }
    };
}
