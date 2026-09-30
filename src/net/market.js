// ========== stall system (Market System) ==========
// version: v1.0
// Features: player stalls, offline stalls, real-time trading

// ========== Configurable constants ==========
const MARKET_CONFIG = {
  TAX_RATE: 0.05,                          // trade tax rate 5%
  MAX_STALLS: 5,                           // Max stall count
  MAX_SLOTS: 10,                           // Max cells per stall
  STALL_FEE_PER_HOUR: 500,                 // Stall fee: 500 gold per hour
  MIN_STALL_HOURS: 1,                      // Min stall duration: 1 hour
  MAX_STALL_HOURS: 10,                     // Max stall duration: 10 hours
  STALL_NAME_MAX_LENGTH: 10,               // Max stall name length
  MIN_PRICE: 1,                            // Min listing price
  MAX_PRICE: 999999999,                    // Max listing price

// Stall coords (offsets relative to dungeonEntrance)
  STALL_POSITIONS: [
    { x: 420, y: -120 },  // stallslot1: outsidesideup
    { x: 455, y: 0 },     // stallslot2: outsidesidein
    { x: 420, y: 120 },   // Stall 3: outer lower
    { x: 315, y: -62 },   // stallslot4: withinsideup
    { x: 315, y: 62 }     // Stall 5: inner lower
  ]
};

// ========== Stall system core objects ==========
const MarketSystem = {
  // state
  stalls: [],              // All stall data (synced from the server)
  localStallId: null,      // The current player's own stall id
  isStalling: false,       // Whether running a stall
  isPanelOpen: false,      // Whether the stall setup panel is open
  stallStartTime: null,    // Stall start time
  realtimeSubscribed: false,
  initialized: false,
  expirationCheckTimer: null,
  buyLocks: new Set(),

// Stall index being operated on (for UI)
  currentStallIndex: -1,
  setupItems: [],          // Goods in the stall setup panel [{item, price}, ...]

  // ========== Init ==========
  init() {
    this.createUI();
    this.loadStalls();
    if (!this.initialized) {
      this.subscribeStalls();
      this.startExpirationCheck(); // Periodic stall expiry check
      this.initialized = true;
    }
    this.recoverPendingTransactions();
    this.checkPendingSales(); // Check unclaimed sales earnings
    console.log('[Stall System] initialized');
  },

  escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  parseItems(items) {
    if (!items) return [];
    if (Array.isArray(items)) return items;
    try {
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('[Stall System] item data parse failed:', e);
      return [];
    }
  },

  // ========== UI Create ==========
  createRequestId(prefix = 'market') {
    const userId = OnlineSystem?.userId || 'anonymous';
    return `${prefix}-${userId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  },

  isHookNotInstalled(error) {
    const status = error?.status || error?.response?.status || error?.data?.status;
    const text = `${error?.message || ''} ${error?.data?.message || ''}`.toLowerCase();
    return status === 404 || text.includes('not found') || text.includes('404');
  },

  getPbErrorMessage(error, fallbackMessage) {
    return error?.data?.message || error?.response?.message || error?.message || fallbackMessage;
  },

  transactionBusy: false,

  async requireReceiptProtocol(kind) {
    if (typeof pb === 'undefined' || typeof pb.send !== 'function') {
      throw new Error(I18N.tr('market', 'market_upgrading', 'Market upgrading, trading is unavailable right now'));
    }
    const protocol = await pb.send('/api/market/protocol', { method: 'GET' });
    if (protocol?.version !== 2) throw new Error(I18N.tr('market', 'market_upgrading', 'Market upgrading, trading is unavailable right now'));
    if (['open-stall', 'close-stall'].includes(kind) && !protocol.stallReceipts) {
      throw new Error(I18N.tr('market', 'market_upgrading_listings', 'Market upgrading, you cannot open or close a stall'));
    }
  },

  async tryServerPurchase(stall, slotData, itemIndex, totalPrice) {
    return this.runMarketTransaction('purchase', {
      stallId: stall.id, itemIndex, itemId: slotData.item.id,
      expectedPrice: slotData.price, expectedTotal: totalPrice,
      buyerId: OnlineSystem.userId, buyerName: OnlineSystem.nickname
    }, totalPrice);
  },

  async tryServerClaimSales(sales) {
    return this.runMarketTransaction('claim-sales', {
      saleIds: sales.map(sale => sale.id), sellerId: OnlineSystem.userId
    }, 0);
  },

// The request submits with the prepaid gold and character save together; on network errors only the original request replays.
  async runMarketTransaction(kind, body, reservedGold) {
    if (this.transactionBusy) {
      showNotification(I18N.tr('market', 'market_transaction_busy', 'A trade is in progress, please wait'), 'warning');
      return 'handled';
    }
    this.transactionBusy = true;
    try {
      await this.requireReceiptProtocol(player.marketPending?.kind || kind);
      if (player.marketPending) {
        await this.deliverPendingTransaction();
        showNotification(I18N.tr('market', 'market_previous_handled', 'Your last trade was handled, please confirm this one again'), 'info');
        return 'handled';
      }
      if (kind === 'purchase' && (!Number.isSafeInteger(reservedGold) || reservedGold <= 0 || player.gold < reservedGold)) {
        throw new Error(I18N.tr('market', 'market_gold_or_price_invalid', 'Not enough gold or invalid price'));
      }
      if (kind === 'purchase' && !player.inventory.includes(null)) {
        throw new Error(I18N.tr('market', 'market_bag_full', 'Your bag is full'));
      }
      const pending = { kind, body: { ...body, requestId: this.createRequestId(kind) }, reservedGold, applied: false };
      if (kind === 'open-stall') {
        if (!Number.isSafeInteger(reservedGold) || reservedGold <= 0 || player.gold < reservedGold) throw new Error('Not enough gold');
        const indices = body.items.map(s => player.inventory.findIndex(i => i && i.id === s.item.id));
        if (indices.some(i => i < 0) || new Set(indices).size !== indices.length) {
          throw new Error(I18N.tr('market', 'market_items_changed', 'Your items changed, please select them again'));
        }
        pending.reservedItems = indices.map(i => player.inventory[i]);
        indices.forEach(i => { player.inventory[i] = null; });
      }
      player.marketPending = pending;
      player.gold -= reservedGold;
// Never ask the server to finalize a sale before the save succeeds.
      let saved = false;
      try { saved = await SaveSystem.save(); }
      finally {
        if (!saved) {
          player.gold += reservedGold;
          this.restoreReservedItems(pending);
          delete player.marketPending;
        }
      }
      if (!saved) throw new Error(I18N.tr('market', 'market_save_failed_not_sent', 'Save failed, the trade was never sent'));
      await this.deliverPendingTransaction();
    } catch (error) {
      console.error('[Stall System] trade not completed:', error);
      showNotification(this.isHookNotInstalled(error)
        ? I18N.tr('market', 'market_upgrading', 'Market upgrading, trading is unavailable right now')
        : this.getPbErrorMessage(error, I18N.tr('market', 'market_pending_restore', 'Trade pending recovery, reopen the market later')), 'warning');
    } finally {
      this.transactionBusy = false;
      updateStats();
      renderInventory();
    }
    return 'handled';
  },

  async deliverPendingTransaction() {
    const pending = player.marketPending;
    if (!pending) return;
    const owner = pending.body.buyerId || pending.body.sellerId;
    if (owner !== OnlineSystem.userId) {
      throw new Error(I18N.tr('market', 'market_wrong_identity', 'Recover the trade with the same account that started it'));
    }
    if (!pending.applied) {
      let response;
      try {
        response = await pb.send(`/api/market/${pending.kind}`, { method: 'POST', body: pending.body });
      } catch (error) {
// Only errors where the server explicitly rejects with no sale allow refunds; disconnects and 5xx keep the request.
        const code = error?.data?.code || error?.response?.code;
        if (['sold_out', 'price_changed', 'invalid_stall', 'own_stall', 'forbidden', 'invalid_request'].includes(code)) {
          player.gold += pending.reservedGold;
          this.restoreReservedItems(pending);
          pending.applied = true;
          pending.rejected = true;
          if (!await SaveSystem.save()) {
            throw new Error(I18N.tr('market', 'market_refund_not_saved', 'The refund is not saved yet, retry the recovery'));
          }
          delete player.marketPending;
        }
        throw error;
      }
      if (response?.ok !== true || response.requestId !== pending.body.requestId) {
        throw new Error(I18N.tr('market', 'market_invalid_receipt', 'Invalid trade receipt, please retry later'));
      }
      if (pending.kind === 'purchase') {
        if (!response.item || response.totalPrice !== pending.reservedGold) {
          throw new Error(I18N.tr('market', 'market_purchase_receipt_error', 'Purchase receipt data is inconsistent'));
        }
// Delivery re-finds a free slot; pre-request inventory indexes are never reused.
        const index = player.inventory.findIndex(item => item === null);
        if (index === -1) {
          throw new Error(I18N.tr('market', 'market_bought_bag_full', 'Purchased, but your bag is full: free a slot and reopen the market to claim it'));
        }
        player.inventory[index] = response.item;
      } else if (pending.kind === 'close-stall') {
        if (!Array.isArray(response.items) || response.items.some(i => !i || !i.id)) {
          throw new Error(I18N.tr('market', 'market_close_receipt_error', 'Stall closing receipt is inconsistent'));
        }
        if (player.inventory.filter(i => i === null).length < response.items.length) {
          throw new Error(I18N.tr('market', 'market_closed_bag_full', 'Stall closed: free bag space and reopen the market to collect the items'));
        }
        response.items.forEach(item => { player.inventory[player.inventory.indexOf(null)] = item; });
      } else if (pending.kind === 'open-stall') {
        if (!response.stallId) throw new Error(I18N.tr('market', 'market_open_receipt_error', 'Stall opening receipt is inconsistent'));
        this.localStallId = response.stallId;
        this.isStalling = true;
        this.setupItems = [];
        this.closeSetupPanel();
        this.showCloseStallButton();
      } else {
        if (!Number.isSafeInteger(response.totalGold) || response.totalGold < 0) {
          throw new Error(I18N.tr('market', 'market_sales_receipt_error', 'Sales receipt data is inconsistent'));
        }
        player.gold += response.totalGold;
      }
      pending.applied = true;
    }
// applied shares one save transaction with gold/items, so restarts or save retries never double-deliver.
    if (!await SaveSystem.save()) {
      throw new Error(I18N.tr('market', 'market_saved_pending_retry', 'The trade went through but is not saved yet, retry the recovery'));
    }
    delete player.marketPending;
    if (pending.kind === 'close-stall') {
      this.localStallId = null;
      this.isStalling = false;
      this.stallStartTime = null;
      this._expirationWarned = false;
      this.currentStallIndex = -1;
      this.hideCloseStallButton();
    }
    if (pending.kind === 'open-stall' && !pending.rejected) {
      if (typeof AudioSys !== 'undefined') AudioSys.play('levelup');
      if (typeof OnlineSystem.announce === 'function') OnlineSystem.announce('stall_open', pending.body.stallName);
    }
    if (pending.kind === 'claim-sales' && !pending.rejected) {
      const claimedIds = new Set(pending.body.saleIds);
      this.pendingSales = (this.pendingSales || []).filter(sale => !claimedIds.has(sale.id));
      this.pendingGold = this.pendingSales.reduce((total, sale) => total + Number(sale.price), 0);
      const button = document.getElementById('claim-sales-btn');
      if (button) button.remove();
      if (this.pendingSales.length > 0) this.showClaimSalesButton(this.pendingGold);
    }
    showNotification(pending.rejected
      ? I18N.tr('market', 'market_rejected_refunded', 'The trade did not go through and the held gold was refunded')
      : I18N.tr('market', 'market_done_saved', 'Trade completed and saved'), 'success');
    this.closeViewPanel();
    this.loadStalls();
  },

  async recoverPendingTransactions() {
    if (!player.marketPending || this.transactionBusy) return;
    return this.runMarketTransaction(null, null, 0);
  },

  restoreReservedItems(pending) {
    for (const item of pending.reservedItems || []) {
      const index = player.inventory.indexOf(null);
      if (index >= 0) player.inventory[index] = item;
      else player.stash.push(item);
    }
    pending.reservedItems = [];
  },

  createUI() {
// Stall setup panel
    if (!document.getElementById('stall-setup-panel')) {
      const setupPanel = document.createElement('div');
      setupPanel.id = 'stall-setup-panel';
      setupPanel.className = 'panel';
      setupPanel.style.display = 'none';
      setupPanel.onmousedown = (e) => e.stopPropagation();
      setupPanel.innerHTML = this.getSetupPanelHTML();
      document.querySelector('.ui-layer')?.appendChild(setupPanel);
    }

// View stall panel
    if (!document.getElementById('stall-view-panel')) {
      const viewPanel = document.createElement('div');
      viewPanel.id = 'stall-view-panel';
      viewPanel.className = 'panel';
      viewPanel.style.display = 'none';
      viewPanel.onmousedown = (e) => e.stopPropagation();
      viewPanel.innerHTML = this.getViewPanelHTML();
      document.querySelector('.ui-layer')?.appendChild(viewPanel);
    }

// Pricing dialog
    if (!document.getElementById('stall-price-dialog')) {
      const priceDialog = document.createElement('div');
      priceDialog.id = 'stall-price-dialog';
      priceDialog.className = 'stall-price-overlay';
      priceDialog.style.display = 'none';
      priceDialog.onmousedown = (e) => e.stopPropagation();
      priceDialog.innerHTML = `
        <div class="stall-price-box">
          <div class="stall-price-title">${I18N.tr('market', 'stall_price_title', 'Set Price')}</div>
          <div class="stall-price-item" id="stall-price-item-name">${I18N.tr('market', 'stall_price_item_placeholder', 'Item name')}</div>
          <div class="stall-price-input-row">
            <input type="number" id="stall-price-input" min="1" placeholder="${I18N.tr('market', 'stall_price_input_placeholder', 'Enter gold amount')}">
            <span class="stall-price-unit">G</span>
          </div>
          <div class="stall-price-actions">
            <button class="stall-btn primary" onclick="MarketSystem.confirmPrice()">${I18N.tOr('confirm', 'Confirm')}</button>
            <button class="stall-btn" onclick="MarketSystem.cancelPrice()">${I18N.tOr('cancel', 'Cancel')}</button>
          </div>
        </div>
      `;
      document.querySelector('.ui-layer')?.appendChild(priceDialog);
    }

// Bind drag events for dynamically created panels
    this.bindPanelDrag('stall-setup-panel');
    this.bindPanelDrag('stall-view-panel');

// Bind input events so game hotkeys don't fire
    const stopPropagation = (e) => e.stopPropagation();

// 1. Stall name input (bound later since it's injected via innerHTML)
    // 2. priceinput field
    const priceInput = document.getElementById('stall-price-input');
    if (priceInput) {
      priceInput.addEventListener('keydown', stopPropagation);
      priceInput.addEventListener('keyup', stopPropagation);
    }
  },

// Bind the panel drag events
  bindPanelDrag(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return;

    const header = panel.querySelector('.panel-header');
    if (!header || header._dragBound) return;

    header._dragBound = true;

    let dragOffset = { x: 0, y: 0 };
    let isDragging = false;

    const startDrag = (clientX, clientY) => {
      if (window.innerWidth < 768) return; // Dragging disabled on small screens

      isDragging = true;
      document.querySelectorAll('.panel').forEach(p => p.style.zIndex = 60);
      panel.style.zIndex = 61;

      const rect = panel.getBoundingClientRect();
      panel.style.left = rect.left + 'px';
      panel.style.top = rect.top + 'px';
      panel.style.transform = 'none';

      dragOffset.x = clientX - rect.left;
      dragOffset.y = clientY - rect.top;
    };

    const moveDrag = (clientX, clientY) => {
      if (!isDragging) return;
      const maxX = window.innerWidth - 50;
      const maxY = window.innerHeight - 50;
      panel.style.left = Math.max(0, Math.min(clientX - dragOffset.x, maxX)) + 'px';
      panel.style.top = Math.max(0, Math.min(clientY - dragOffset.y, maxY)) + 'px';
    };

    const endDrag = () => {
      isDragging = false;
    };

// Mouse events
    header.onmousedown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      startDrag(e.clientX, e.clientY);
    };

    document.addEventListener('mousemove', (e) => {
      if (isDragging) moveDrag(e.clientX, e.clientY);
    });

    document.addEventListener('mouseup', endDrag);

// Touch events
    header.ontouchstart = (e) => {
      e.stopPropagation();
      const touch = e.touches[0];
      startDrag(touch.clientX, touch.clientY);
    };

    document.addEventListener('touchmove', (e) => {
      if (isDragging) {
        const touch = e.touches[0];
        moveDrag(touch.clientX, touch.clientY);
      }
    });

    document.addEventListener('touchend', endDrag);
  },

// Stall setup panel HTML (vertical layout, mobile-friendly)
  getSetupPanelHTML() {
// Generate duration options
    let durationOptions = '';
    for (let h = MARKET_CONFIG.MIN_STALL_HOURS; h <= MARKET_CONFIG.MAX_STALL_HOURS; h++) {
      const fee = h * MARKET_CONFIG.STALL_FEE_PER_HOUR;
      durationOptions += `<option value="${h}">${I18N.tr('market', 'stall_duration_option', '{hours}h - {fee}G', { hours: h, fee })}</option>`;
    }

    return `
            <div class="panel-close" onclick="MarketSystem.closeSetupPanel()"></div>
            <div class="panel-header">${I18N.tr('market', 'stall_setup_title', '🛒 Player Stall')}</div>
            <div class="stall-name-row">
                <label>${I18N.tr('market', 'stall_name_label', 'Stall Name:')}</label>
                <input type="text" id="stall-name-input" maxlength="${MARKET_CONFIG.STALL_NAME_MAX_LENGTH}" placeholder="${I18N.tr('market', 'stall_name_placeholder', 'Max {max} chars', { max: MARKET_CONFIG.STALL_NAME_MAX_LENGTH })}">
            </div>
            <div class="stall-section-title">${I18N.tr('market', 'stall_shelf_title', 'Stall shelf ({slots} slots)', { slots: MARKET_CONFIG.MAX_SLOTS })} <span style="color:#888;font-size:10px;">${I18N.tr('market', 'stall_click_to_remove', 'Tap to remove')}</span></div>
            <div id="stall-shelf-grid" class="stall-shelf-grid"></div>
            <div class="stall-duration-row">
                <label>${I18N.tr('market', 'stall_duration_label', 'Stall Duration:')}</label>
                <select id="stall-duration-select" onchange="MarketSystem.updateFeeDisplay()">
                    ${durationOptions}
                </select>
                <span class="stall-tax-notice">${I18N.tr('market', 'stall_tax_notice', '💡 Tax rate {rate}%', { rate: MARKET_CONFIG.TAX_RATE * 100 })}</span>
            </div>
            <div class="stall-setup-footer">
                <button id="stall-start-btn" class="stall-btn primary" onclick="MarketSystem.startStall()">${I18N.tr('market', 'stall_start_btn', 'Open Stall -{fee}G', { fee: MARKET_CONFIG.STALL_FEE_PER_HOUR })}</button>
            </div>
            <!-- Embedded bag -->
            <div class="embedded-bag-section">
                <div class="embedded-bag-header">${I18N.tOr('bag_title', '📦 Backpack')} <span style="color:#888;font-size:11px;">${I18N.tr('market', 'stall_click_to_list', '(tap to list)')}</span> <span id="market-gold-display" style="color:gold; float:right;">${I18N.tr('market', 'stall_gold_display', 'Gold: {gold}', { gold: 0 })}</span></div>
                <div id="stall-inventory-grid" class="embedded-bag-grid"></div>
            </div>
        `;
  },

// Update the button cost display
  updateFeeDisplay() {
    const select = document.getElementById('stall-duration-select');
    const btn = document.getElementById('stall-start-btn');
    if (select && btn) {
      const hours = parseInt(select.value);
      const fee = hours * MARKET_CONFIG.STALL_FEE_PER_HOUR;
      btn.textContent = I18N.tr('market', 'stall_start_btn', 'Open Stall -{fee}G', { fee });
    }
  },

// View stall panel HTML
  getViewPanelHTML() {
    return `
            <div class="panel-close" onclick="MarketSystem.closeViewPanel()"></div>
            <div class="panel-header" id="stall-view-header">${I18N.tr('market', 'stall_view_title', '🛒 Player Stall')}</div>
            <div id="stall-view-content" class="stall-view-content"></div>
        `;
  },

// ========== Stall data loading ==========
  async loadStalls() {
    if (typeof pb === 'undefined') {
      console.warn('[Stall System] PocketBase not loaded');
      return;
    }

    try {
// Get all unexpired stalls
      const now = new Date().toISOString().replace('T', ' ');
      const records = await pb.collection('market_stalls').getList(1, MARKET_CONFIG.MAX_STALLS, {
        filter: `expires_at >= "${now}"`,
        sort: 'stall_index'
      });

      this.stalls = records.items || [];
// Own stalls expired while offline load too, so the receipt flow can return the goods.
      if (typeof OnlineSystem !== 'undefined' && OnlineSystem.userId && !this.stalls.some(s => s.user_id === OnlineSystem.userId)) {
        const own = await pb.collection('market_stalls').getList(1, 1, {
          filter: `user_id = "${OnlineSystem.userId}"`, sort: '-created'
        });
        if (own.items?.length) this.stalls.push(own.items[0]);
      }
      console.log('[Stall System] loading stall:', this.stalls.length);

// Check whether the player has their own stall
      if (typeof OnlineSystem !== 'undefined' && OnlineSystem.userId) {
        const myStall = this.stalls.find(s => s.user_id === OnlineSystem.userId);
        if (myStall) {
          this.localStallId = myStall.id;
          this.isStalling = true;
          this.currentStallIndex = myStall.stall_index;
          this.stallStartTime = new Date(myStall.created).getTime();

// Move the player to the stall position
          const stallPos = this.getStallWorldPosition(myStall.stall_index);
          if (stallPos && typeof player !== 'undefined') {
            player.x = stallPos.x;
            player.y = stallPos.y;
            player.target = null; // Clear the movement target
          }

// Show the close-stall button
          this.showCloseStallButton();
          showNotification(I18N.tr('market', 'stall_now_stalling', 'Stalling at: {name}', { name: myStall.stall_name }), 'info');
        }
      }
    } catch (e) {
      console.error('[Stall System] stall load failed:', e);
    }
  },

// Get the stall's world coords
  getStallWorldPosition(stallIndex) {
    if (typeof dungeonEntrance === 'undefined') return null;
    const pos = MARKET_CONFIG.STALL_POSITIONS[stallIndex];
    if (!pos) return null;
    return {
      x: dungeonEntrance.x + pos.x,
      y: dungeonEntrance.y + pos.y
    };
  },

// Show the close-stall button
  showCloseStallButton() {
// Check whether it already exists
    if (document.getElementById('close-stall-btn')) return;

    const container = document.createElement('div');
    container.id = 'close-stall-container';
    container.className = 'close-stall-container';

    const btn = document.createElement('button');
    btn.id = 'close-stall-btn';
    btn.className = 'close-stall-btn';
    btn.innerHTML = I18N.tr('market', 'stall_close_btn', 'Close Stall');
    btn.onclick = (e) => {
      e.stopPropagation();
      MarketSystem.closeStall();
    };

    const timer = document.createElement('div');
    timer.id = 'stall-timer';
    timer.className = 'stall-timer';

    container.appendChild(btn);
    container.appendChild(timer);
    document.body.appendChild(container);

// Start the position updates and countdown
    this.updateCloseButtonPosition();
    this.startStallTimer();
  },

// Start the stall countdown
  startStallTimer() {
    if (this._stallTimerInterval) clearInterval(this._stallTimerInterval);

    this._stallTimerInterval = setInterval(() => {
      this.updateStallTimer();
    }, 1000);

    this.updateStallTimer(); // Update once immediately
  },

// Update the stall countdown display
  updateStallTimer() {
    const timer = document.getElementById('stall-timer');
    if (!timer || !this.isStalling || !this.localStallId) {
      if (this._stallTimerInterval) {
        clearInterval(this._stallTimerInterval);
        this._stallTimerInterval = null;
      }
      return;
    }

    const myStall = this.stalls.find(s => s.id === this.localStallId);
    if (!myStall) return;

    const expiresAt = new Date(myStall.expires_at.replace(' ', 'T'));
    const now = new Date();
    const remainingMs = expiresAt - now;

    if (remainingMs <= 0) {
      timer.textContent = I18N.tr('market', 'stall_expired', 'Expired');
      timer.style.color = '#ff4444';
      return;
    }

    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);

    if (minutes < 5) {
      timer.style.color = '#ff8800';
    } else {
      timer.style.color = '#aaa';
    }

    timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  },

// Update the close-stall button position (above the player's head)
  updateCloseButtonPosition() {
    const container = document.getElementById('close-stall-container');
    if (!container || !this.isStalling) return;

    if (typeof player !== 'undefined' && typeof camera !== 'undefined') {
      const screenX = player.x - camera.x;
      const screenY = player.y - camera.y - 70; // Above the player's head

// Position with transform to reduce reflows
      container.style.transform = `translate(${screenX}px, ${screenY}px) translateX(-50%)`;
    }

// Keep updating
    requestAnimationFrame(() => this.updateCloseButtonPosition());
  },

// Hide the close-stall button
  hideCloseStallButton() {
    const container = document.getElementById('close-stall-container');
    if (container) container.remove();

    if (this._stallTimerInterval) {
      clearInterval(this._stallTimerInterval);
      this._stallTimerInterval = null;
    }
  },

  // ========== real-timesubscribe ==========
  async subscribeStalls() {
    if (typeof pb === 'undefined') return;
    if (this.realtimeSubscribed) return;

    try {
      await pb.collection('market_stalls').subscribe('*', (e) => {
        if (e.action === 'create') {
          // newstallslot
          const existingIndex = this.stalls.findIndex(s => s.id === e.record.id);
          if (existingIndex === -1) {
            this.stalls.push(e.record);
          }
        } else if (e.action === 'update') {
// Update the stall
          const index = this.stalls.findIndex(s => s.id === e.record.id);
          if (index !== -1) {
            this.stalls[index] = e.record;

// If the player is viewing this stall, refresh the UI instantly
            if (this.currentViewStall && this.currentViewStall.id === e.record.id) {
              this.openViewPanel({ stall: e.record });
            }
          }
        } else if (e.action === 'delete') {
// Delete the stall
          this.stalls = this.stalls.filter(s => s.id !== e.record.id);

// If the player is viewing this stall, close the panel
          if (this.currentViewStall && this.currentViewStall.id === e.record.id) {
            this.closeViewPanel();
            showNotification(I18N.tr('market', 'stall_closed_by_owner', 'That stall has been closed'), 'info');
          }

          // Own stall was removed (goods sold out)
          if (this.localStallId === e.record.id) {
            this.localStallId = null;
            this.isStalling = false;
            this.stallStartTime = null;
            this.currentStallIndex = -1;
            this.hideCloseStallButton();
            showNotification(I18N.tr('market', 'sell_all_sold_out', '🎉 Sold out!'), 'success');
          }
        }
      });
      this.realtimeSubscribed = true;
      console.log('[Stall System] Realtime subscribed');

      // Subscribe to sales records; notify the seller in real time on new sales
      await pb.collection('market_sales').subscribe('*', (e) => {
        if (e.action === 'create') {
          // New sales record; check if it was sold to self
          if (e.record.seller_id === OnlineSystem?.userId && !e.record.claimed) {
            showNotification(I18N.tr('market', 'sell_item_sold_notice', '💰 {buyer} bought {item}! +{price}G to claim', {
              buyer: e.record.buyer_name, item: e.record.item_name, price: e.record.price
            }), 'success');
            if (typeof AudioSys !== 'undefined') AudioSys.play('gold');

// Send the sales announcement
            if (typeof OnlineSystem !== 'undefined' && e.record.item_name) {
              OnlineSystem.announce('item_sold', e.record.item_name, e.record.price);
            }

// Refresh the claim button
            this.checkPendingSales();
          }
        }
      });

    } catch (e) {
      console.warn('[Stall System] Realtime subscribe failed:', e);
    }
  },

// ========== Stall expiry checks ==========
  startExpirationCheck() {
    if (this.expirationCheckTimer) return;
// Checked once per minute
    this.expirationCheckTimer = setInterval(() => {
      this.checkExpiration();
      this.performMarketGC();
    }, 60000);
    // standi.e.Checkonesecond
    setTimeout(() => {
      this.checkExpiration();
      this.performMarketGC();
    }, 3000);
  },

  // Market garbage collection (opportunistic cleanup)
  performMarketGC() {
    if (typeof OnlineSystem === 'undefined' || !OnlineSystem.gc) return;

// Unclaimed goods must persist; expired stalls are recovered by the close-stall receipt.

// 2. Clean sales earnings unclaimed for 15+ days (kept 15 days per user request)
    const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString().replace('T', ' ');
    OnlineSystem.gc('market_sales', `created < "${fifteenDaysAgo}"`, 5);
  },

  checkExpiration() {
    if (!this.isStalling || !this.localStallId) return;

    const myStall = this.stalls.find(s => s.id === this.localStallId);
    if (!myStall) return;

    const expiresAt = new Date(myStall.expires_at.replace(' ', 'T'));
    const now = new Date();

    if (now >= expiresAt) {
// Expired: close the stall automatically
      this.handleExpiredStall(myStall);
    } else {
// Compute remaining time; warn under 5 minutes
      const remainingMs = expiresAt - now;
      const remainingMinutes = Math.floor(remainingMs / 60000);

      if (remainingMinutes <= 5 && remainingMinutes > 0 && !this._expirationWarned) {
        this._expirationWarned = true;
        showNotification(I18N.tr('market', 'stall_expiring_soon', '⏰ Your stall expires in {minutes} min', { minutes: remainingMinutes }), 'warning');
      }
    }
  },

  async handleExpiredStall(stall) {
    if (this.transactionBusy) return;
    return this.runMarketTransaction('close-stall', { sellerId: OnlineSystem.userId, stallId: stall.id }, 0);
  },

// ========== Check unclaimed sales earnings ==========
  async checkPendingSales() {
    if (typeof pb === 'undefined' || typeof OnlineSystem === 'undefined' || !OnlineSystem.userId) {
      return;
    }

    try {
      const records = await pb.collection('market_sales').getList(1, 50, {
        filter: `seller_id = "${OnlineSystem.userId}" && claimed = false`,
        sort: '-created'
      });

      if (records.items.length > 0) {
        const totalGold = records.items.reduce((sum, r) => sum + r.price, 0);

        // Showclaimtoast
        setTimeout(() => {
          this.showSalesNotification(records.items, totalGold);
        }, 1000);
      }
    } catch (e) {
      console.warn('[Stall System] sales check failed:', e);
    }
  },

// Show the earnings notification
  showSalesNotification(sales, totalGold) {
    showNotification(I18N.tr('market', 'sell_pending_summary', '💰 You have {count} items sold for {gold}G!', {
      count: sales.length, gold: totalGold
    }), 'success');

// Store the pending claim list
    this.pendingSales = sales;
    this.pendingGold = totalGold;

// Show the claim button
    this.showClaimSalesButton(totalGold);
  },

// Show the claim earnings button
  showClaimSalesButton(totalGold) {
// Remove old buttons
    const oldBtn = document.getElementById('claim-sales-btn');
    if (oldBtn) oldBtn.remove();

    const btn = document.createElement('button');
    btn.id = 'claim-sales-btn';
    btn.className = 'claim-sales-btn';
    btn.innerHTML = I18N.tr('market', 'sell_claim_btn', '💰 Claim {gold}G', { gold: totalGold });
    btn.onclick = (e) => {
      e.stopPropagation();
      MarketSystem.openSalesPanel();
    };
// Stop click-through from moving the player
    btn.onmousedown = (e) => e.stopPropagation();
    btn.ontouchstart = (e) => e.stopPropagation();
    document.body.appendChild(btn);
  },

// Open the sales detail panel
  openSalesPanel() {
    this.recoverPendingTransactions();
    // Createpanel（ifnotsaveat）
    let panel = document.getElementById('sales-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'sales-panel';
      panel.className = 'panel';
      panel.onmousedown = (e) => e.stopPropagation();
      document.querySelector('.ui-layer')?.appendChild(panel);
    }

    const sales = this.pendingSales || [];
    const totalGold = this.pendingGold || 0;

    let listHtml = '';
    for (const sale of sales) {
      const time = new Date(sale.created).toLocaleString('zh-CN', {
        month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      listHtml += `
        <div class="sales-row">
          <span class="sales-item">${this.escapeHtml(sale.item_name)}</span>
          <span class="sales-buyer">${this.escapeHtml(sale.buyer_name)}</span>
          <span class="sales-price">+${sale.price}G</span>
          <span class="sales-time">${time}</span>
        </div>
      `;
    }

    panel.innerHTML = `
      <div class="panel-close" onclick="MarketSystem.closeSalesPanel()"></div>
      <div class="panel-header">${I18N.tr('market', 'sell_details_title', '💰 Sales Details')}</div>
      <div class="sales-list">${listHtml || `<div class="sales-empty">${I18N.tr('market', 'sell_empty', 'No sales yet')}</div>`}</div>
      <div class="sales-total">
        <span>${I18N.tr('market', 'sell_total_count', 'Total: {count} items', { count: sales.length })}</span>
        <span class="sales-total-gold">${totalGold}G</span>
      </div>
      <button class="stall-btn primary sales-claim-all" onclick="MarketSystem.claimAllSales()">${I18N.tr('market', 'sell_claim_all', 'Claim All')}</button>
    `;

    // binddrag（at innerHTML Setafter，ensure panel-header saveat）
    this.bindPanelDrag('sales-panel');

    panel.style.display = 'block';
  },

// Close the sales detail panel
  closeSalesPanel() {
    const panel = document.getElementById('sales-panel');
    if (panel) panel.style.display = 'none';
  },

// Claim all earnings
  async claimAllSales() {
    const sales = this.pendingSales || [];
    if (sales.length === 0) return;

    await this.claimSales(sales);
    this.closeSalesPanel();
  },

// Claim sales earnings
  async claimSales(sales) {
    if (typeof pb === 'undefined' || typeof player === 'undefined') return;

    return this.tryServerClaimSales(sales);
  },

// ========== Get stall interaction points ==========
  getStallInteractionPoints() {
    if (typeof dungeonEntrance === 'undefined') return [];

    return MARKET_CONFIG.STALL_POSITIONS.map((pos, index) => ({
      index,
      x: dungeonEntrance.x + pos.x,
      y: dungeonEntrance.y + pos.y,
      stall: this.stalls.find(s => s.stall_index === index) || null
    }));
  },

// ========== Detect stall clicks ==========
  getStallAtPosition(worldX, worldY) {
    const points = this.getStallInteractionPoints();
    const clickRange = 30;

    for (const point of points) {
      if (Math.hypot(worldX - point.x, worldY - point.y) < clickRange) {
        return point;
      }
    }
    return null;
  },

// ========== Stall click handling ==========
  onStallClick(stallPoint) {
    if (!stallPoint) return;

    if (stallPoint.stall) {
// Occupied stall: open the view panel
      this.openViewPanel(stallPoint);
    } else {
      // Empty stall: open the setup panel and bind the clicked position
      this.openSetupPanel(stallPoint.index);
    }
  },

// ========== Open the stall setup panel ==========
  openSetupPanel(stallIndex = -1) {
    this.recoverPendingTransactions();
    if (this.isStalling) {
      showNotification(I18N.tr('market', 'stall_already_stalling', 'You are already stalling'), 'warning');
      return;
    }

    this.currentStallIndex = Number.isInteger(stallIndex) ? stallIndex : -1;
    this.setupItems = [];

    const panel = document.getElementById('stall-setup-panel');
    if (!panel) return;

// Stop player movement
    if (typeof player !== 'undefined') {
      player.target = null;
    }

    panel.style.display = 'block';
    this.isPanelOpen = true;

// Bind input events to stop bubbling
    const nameInput = document.getElementById('stall-name-input');
    if (nameInput) {
      nameInput.onkeydown = (e) => e.stopPropagation();
      nameInput.onkeyup = (e) => e.stopPropagation();
    }

    this.renderSetupPanel();
  },

// Close the setup panel
  closeSetupPanel() {
    const panel = document.getElementById('stall-setup-panel');
    if (panel) panel.style.display = 'none';
    this.isPanelOpen = false;

// Shelves only reference inventory items; closing the panel never returns them twice.
    this.setupItems = [];
    this.currentStallIndex = -1;
    renderInventory();
  },

// Render the setup panel
  renderSetupPanel() {
// Get inventory indexes of listed items
    const shelfInvIndexes = new Set();
    for (const slotData of this.setupItems) {
      if (slotData && slotData.invIndex !== undefined) {
        shelfInvIndexes.add(slotData.invIndex);
      }
    }

// Custom inventory render (marking listed items)
    const grid = document.getElementById('stall-inventory-grid');
    if (grid && typeof player !== 'undefined') {
      grid.innerHTML = '';
      player.inventory.forEach((item, idx) => {
        const slot = document.createElement('div');
        slot.className = 'embedded-bag-slot';

        if (item) {
// Check whether already listed
          if (shelfInvIndexes.has(idx)) {
            slot.classList.add('stall-on-shelf');
            slot.innerHTML = `<span style="color:#888;font-size:10px;">${I18N.tr('market', 'stall_listed_badge', 'Listed')}</span>`;
          } else {
            // raritystyle
            if (item.rarity >= 3 && item.rarity <= 4) slot.classList.add('rarity-unique');
            else if (item.rarity === 5) slot.classList.add('rarity-set');
            else if (item.rarity === 2) slot.classList.add('rarity-rare');

            if (typeof applyItemSpriteToElement === 'function') {
              applyItemSpriteToElement(slot, item);
            }

// Click events (consumables cannot be listed)
            if (item.type !== 'potion' && item.type !== 'scroll') {
              slot.onclick = (e) => {
                e.stopPropagation();
                MarketSystem.addToShelf(idx);
              };
            } else {
              slot.style.opacity = '0.5';
              slot.style.cursor = 'not-allowed';
            }

            if (typeof bindItemTooltip === 'function') {
              bindItemTooltip(slot, item);
            }
          }
        }

        grid.appendChild(slot);
      });

// Update the gold display
      const goldDisplay = document.getElementById('market-gold-display');
      if (goldDisplay) {
        goldDisplay.textContent = I18N.tr('market', 'stall_gold_display', 'Gold: {gold}', { gold: player.gold });
      }
    }

    // Render shelves (10 cells across)
    const shelfGrid = document.getElementById('stall-shelf-grid');
    if (shelfGrid) {
      shelfGrid.innerHTML = '';
      for (let i = 0; i < MARKET_CONFIG.MAX_SLOTS; i++) {
        const slotData = this.setupItems[i];
        const slot = document.createElement('div');
        slot.className = 'stall-shelf-slot';

        if (slotData && slotData.item) {
          const item = slotData.item;
          const color = getRarityColor(item.rarity);
          slot.classList.add('has-item');
          slot.style.borderColor = color;
          slot.onclick = () => MarketSystem.removeFromShelf(i);

// Render with sprites
          if (typeof applyItemSpriteToElement === 'function') {
            applyItemSpriteToElement(slot, item);
          }

          // pricetab
          const priceLabel = document.createElement('span');
          priceLabel.className = 'stall-item-price';
          priceLabel.textContent = slotData.price + 'G';
          slot.appendChild(priceLabel);

          // bind tooltip
          if (typeof bindItemTooltip === 'function') {
            bindItemTooltip(slot, item);
          }
        } else {
          slot.classList.add('empty');
          slot.textContent = '+';
        }

        shelfGrid.appendChild(slot);
      }
    }

// Update button states
    const startBtn = document.getElementById('stall-start-btn');
    if (startBtn) {
      const hasItems = this.setupItems.some(s => s && s.item);
      startBtn.disabled = !hasItems;
    }
  },

  // additemarrive atgoodsrack
  addToShelf(invIndex) {
    if (typeof player === 'undefined') return;

    const item = player.inventory[invIndex];
    if (!item) return;

// Only consumables (potions, scrolls) are barred from listing
    if (item.type === 'potion' || item.type === 'scroll') {
      showNotification(I18N.tr('market', 'stall_consumable_blocked', 'Consumables cannot be sold'), 'warning');
      return;
    }

// Find an empty shelf cell
    let emptySlot = -1;
    for (let i = 0; i < MARKET_CONFIG.MAX_SLOTS; i++) {
      if (!this.setupItems[i]) {
        emptySlot = i;
        break;
      }
    }

    if (emptySlot === -1) {
      showNotification(I18N.tr('market', 'stall_shelf_full', 'The shelf is full'), 'warning');
      return;
    }

// Store temp state and open the pricing dialog
    this.pendingItem = { invIndex, item, emptySlot };
    this.showPriceDialog(item);
  },

// Show the pricing dialog
  showPriceDialog(item) {
    const dialog = document.getElementById('stall-price-dialog');
    const itemName = document.getElementById('stall-price-item-name');
    const priceInput = document.getElementById('stall-price-input');

    if (!dialog) return;

    // Compute suggested sale price (based on rarity, a bit above merchant buy price)
    let suggestedPrice = 50;
    if (item.rarity > 1) suggestedPrice *= item.rarity * 2;
    suggestedPrice = Math.floor(suggestedPrice * 1.5); // 50% above the merchant buy price

    const color = getRarityColor(item.rarity);
    itemName.innerHTML = `<span style="color:${color}">${this.escapeHtml(item.name)}</span>`;
    priceInput.value = suggestedPrice;
    dialog.style.display = 'flex';

// Auto-focus the input
    setTimeout(() => priceInput.focus(), 100);
  },

// Confirm the price
  confirmPrice() {
    const priceInput = document.getElementById('stall-price-input');
    const priceNum = parseInt(priceInput?.value);

    if (isNaN(priceNum) || priceNum < MARKET_CONFIG.MIN_PRICE || priceNum > MARKET_CONFIG.MAX_PRICE) {
      showNotification(I18N.tr('market', 'stall_price_range', 'Price must be between {min} and {max}', {
        min: MARKET_CONFIG.MIN_PRICE, max: MARKET_CONFIG.MAX_PRICE
      }), 'warning');
      return;
    }

    if (!this.pendingItem) return;

    const { invIndex, item, emptySlot } = this.pendingItem;

// Validate the item is still in the inventory
    const currentItem = player.inventory[invIndex];
    if (!currentItem || currentItem.id !== item.id) {
      showNotification(I18N.tr('market', 'stall_item_not_in_bag', 'The item is no longer in your bag'), 'warning');
      this.closePriceDialog();
      this.renderSetupPanel();
      return;
    }

// Validate the item isn't already listed (prevents double listing)
    const alreadyShelf = this.setupItems.some(s => s && s.item && s.item.id === item.id);
    if (alreadyShelf) {
      showNotification(I18N.tr('market', 'stall_item_already_listed', 'That item is already on the shelf'), 'warning');
      this.closePriceDialog();
      return;
    }

// Note: never removed from the inventory, only the index recorded, so refreshes can't lose the item
    this.setupItems[emptySlot] = { item, price: priceNum, invIndex };

// Close the dialog and clear temp state
    this.closePriceDialog();

    this.renderSetupPanel();
  },

// Cancel pricing
  cancelPrice() {
    this.closePriceDialog();
  },

// Close the pricing dialog
  closePriceDialog() {
    const dialog = document.getElementById('stall-price-dialog');
    if (dialog) dialog.style.display = 'none';
    this.pendingItem = null;
  },

// Remove the item from the shelf
  removeFromShelf(shelfIndex) {
    const slotData = this.setupItems[shelfIndex];
    if (!slotData || !slotData.item) return;

// The item is still in the inventory; just clear the shelf record
    this.setupItems[shelfIndex] = null;
    this.renderSetupPanel();

// Force-hide the tooltip (call the global function if present, else touch the DOM)
    if (typeof hideTooltip === 'function') {
      hideTooltip();
    } else {
      const tt = document.getElementById('tooltip');
      if (tt) tt.style.display = 'none';
    }
  },

  // ========== startstall ==========
  async startStall() {
    const stallName = document.getElementById('stall-name-input')?.value.trim()
      || I18N.tr('market', 'stall_default_name', 'Stall');
    const itemsToSell = this.setupItems.filter(s => s && s.item);

    if (itemsToSell.length === 0) {
      showNotification(I18N.tr('market', 'stall_add_items_first', 'Add some items first'), 'warning');
      return;
    }

// Read the chosen stall duration
    const durationSelect = document.getElementById('stall-duration-select');
    const hours = durationSelect ? parseInt(durationSelect.value) : 1;
    const stallFee = hours * MARKET_CONFIG.STALL_FEE_PER_HOUR;

// Check whether gold is enough
    if (typeof player === 'undefined' || player.gold < stallFee) {
      showNotification(I18N.tr('market', 'stall_not_enough_gold', 'Not enough gold: {fee}G needed', { fee: stallFee }), 'warning');
      return;
    }

    if (typeof pb === 'undefined' || typeof OnlineSystem === 'undefined' || !OnlineSystem.userId) {
      showNotification(I18N.tr('market', 'stall_offline', 'Network not connected'), 'error');
      return;
    }

// Fetch the latest stall data live and look for a free spot
    await this.loadStalls();
    const occupiedIndices = this.stalls.map(s => s.stall_index);
    let assignedIndex = -1;

    if (this.currentStallIndex >= 0) {
      if (occupiedIndices.includes(this.currentStallIndex)) {
        showNotification(I18N.tr('market', 'stall_slot_taken', 'That stall is taken, pick another one'), 'warning');
        this.loadStalls();
        return;
      }
      assignedIndex = this.currentStallIndex;
    } else {
      for (let i = 0; i < MARKET_CONFIG.STALL_POSITIONS.length; i++) {
        if (!occupiedIndices.includes(i)) {
          assignedIndex = i;
          break;
        }
      }
    }

    if (assignedIndex === -1) {
      showNotification(I18N.tr('market', 'stall_all_full', 'All stalls are taken, try again later'), 'warning');
      return;
    }

    this.currentStallIndex = assignedIndex;

    await this.runMarketTransaction('open-stall', {
      sellerId: OnlineSystem.userId, nickname: OnlineSystem.nickname,
      stallName, stallIndex: assignedIndex, hours,
      items: itemsToSell.map(s => ({ item: s.item, price: s.price }))
    }, stallFee);
  },

// Server-side stall closing commits atomically with the receipt; offline keeps the request and never returns early.
  async closeStall() {
    if (!this.localStallId) return;
    return this.runMarketTransaction('close-stall', {
      sellerId: OnlineSystem.userId, stallId: this.localStallId
    }, 0);
  },

// ========== Open the view stall panel ==========
  openViewPanel(stallPoint) {
    this.recoverPendingTransactions();
    const stall = stallPoint.stall;
    if (!stall) return;

    this.currentViewStall = stall; // Store the currently viewed stall

    const panel = document.getElementById('stall-view-panel');
    const header = document.getElementById('stall-view-header');
    const content = document.getElementById('stall-view-content');

    if (!panel || !content) return;

    header.innerHTML = `🛒 ${this.escapeHtml(stall.stall_name)} <span style="color:#888">(${this.escapeHtml(stall.nickname)})</span>`;

// Parse the goods data
    const items = this.parseItems(stall.items);

// Clear and render via DOM
    content.innerHTML = '';

    if (items.length === 0) {
      content.innerHTML = `<div class="stall-empty-notice">${I18N.tr('market', 'stall_view_empty', 'This stall is empty')}</div>`;
      panel.style.display = 'block';
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'stall-view-grid';

    for (let i = 0; i < items.length; i++) {
      const slotData = items[i];
      if (!slotData || !slotData.item) continue;

      const item = slotData.item;
      const color = getRarityColor(item.rarity);
      const taxAmount = Math.ceil(slotData.price * MARKET_CONFIG.TAX_RATE);

      const row = document.createElement('div');
      row.className = 'stall-view-item';

      // itemicon
      const iconBox = document.createElement('div');
      iconBox.className = 'stall-view-icon';
      iconBox.style.borderColor = color;
      if (typeof applyItemSpriteToElement === 'function') {
        applyItemSpriteToElement(iconBox, item);
      }
      if (typeof bindItemTooltip === 'function') {
        bindItemTooltip(iconBox, item);
      }
      row.appendChild(iconBox);

      // iteminfo
      const info = document.createElement('div');
      info.className = 'stall-view-info';
      info.innerHTML = `
        <div class="stall-view-name" style="color:${color}">${this.escapeHtml(item.name)}</div>
        <div class="stall-view-price">${slotData.price}G <span class="stall-tax">${I18N.tr('market', 'stall_tax_suffix', '+{tax}G tax', { tax: taxAmount })}</span></div>
      `;
      row.appendChild(info);

// Buy button
      const buyBtn = document.createElement('button');
      buyBtn.className = 'stall-buy-btn';

      const isMyStall = (stall.user_id === OnlineSystem?.userId);

      if (isMyStall) {
        buyBtn.textContent = I18N.tr('market', 'buy_own_stall_label', 'Mine');
        buyBtn.disabled = true;
        buyBtn.style.opacity = '0.5';
        buyBtn.style.cursor = 'default';
        buyBtn.style.background = '#555';
      } else {
        buyBtn.textContent = I18N.tOr('title_buy', 'Buy');
        buyBtn.onclick = (e) => {
          e.stopPropagation();
          MarketSystem.buyItem(stall.id, i);
        };
      }
      row.appendChild(buyBtn);

      grid.appendChild(row);
    }

    content.appendChild(grid);
    panel.style.display = 'block';
  },

// Close the view panel
  closeViewPanel() {
    const panel = document.getElementById('stall-view-panel');
    if (panel) panel.style.display = 'none';
  },

  // ========== purchasegoods ==========
  async buyItem(stallId, itemIndex) {
    if (typeof pb === 'undefined' || typeof player === 'undefined') return;

    try {
// Re-fetch the latest stall data
      const stall = await pb.collection('market_stalls').getOne(stallId);

// Banned from buying your own
      if (stall.user_id === OnlineSystem?.userId) {
        showNotification(I18N.tr('market', 'buy_own_item_blocked', 'You cannot buy your own item'), 'warning');
        return;
      }

      const items = this.parseItems(stall.items);
      const slotData = items[itemIndex];

      if (!slotData || !slotData.item) {
        showNotification(I18N.tr('market', 'buy_item_sold', 'Item already sold'), 'warning');
        this.closeViewPanel();
        return;
      }

      const taxAmount = Math.ceil(slotData.price * MARKET_CONFIG.TAX_RATE);
      const totalPrice = slotData.price + taxAmount;

      // check gold
      if (player.gold < totalPrice) {
        showNotification(I18N.tr('market', 'buy_not_enough_gold', 'Not enough gold: {price}G needed', { price: totalPrice }), 'warning');
        return;
      }

// Check inventory space
      const emptySlot = player.inventory.findIndex(i => i === null);
      if (emptySlot === -1) {
        showNotification(I18N.tr('market', 'market_bag_full', 'Your bag is full'), 'warning');
        return;
      }

// Show the purchase confirm dialog
      this.showBuyConfirmDialog(stall, slotData, itemIndex, totalPrice, taxAmount, emptySlot);

    } catch (e) {
      console.error('[Stall System] item fetch failed:', e);
      showNotification(I18N.tr('market', 'buy_fetch_failed', 'Could not load the item info'), 'error');
    }
  },

// Show the purchase confirm dialog
  showBuyConfirmDialog(stall, slotData, itemIndex, totalPrice, taxAmount, emptySlot) {
    // Createpopup（ifnotsaveat）
    let dialog = document.getElementById('buy-confirm-dialog');
    if (!dialog) {
      dialog = document.createElement('div');
      dialog.id = 'buy-confirm-dialog';
      dialog.className = 'stall-price-overlay';
      dialog.onmousedown = (e) => e.stopPropagation();
      document.querySelector('.ui-layer')?.appendChild(dialog);
    }

    const item = slotData.item;
    const color = getRarityColor(item.rarity);
    const confirmLabel = I18N.tr('market', 'buy_confirm_label', 'Confirm Purchase');

    dialog.innerHTML = `
      <div class="stall-price-box buy-confirm-box">
        <div class="stall-price-title">${confirmLabel}</div>
        <div class="buy-confirm-item" style="color:${color}">${this.escapeHtml(item.name)}</div>
        <div class="buy-confirm-price">
          <div>${I18N.tr('market', 'buy_price_line', 'Price: {price}G', { price: slotData.price })}</div>
          <div class="buy-confirm-tax">${I18N.tr('market', 'buy_tax_line', '+ Tax: {tax}G', { tax: taxAmount })}</div>
          <div class="buy-confirm-total">${I18N.tr('market', 'buy_total_line', '= Total: {total}G', { total: totalPrice })}</div>
        </div>
        <div class="stall-price-actions">
          <button class="stall-btn primary" id="buy-confirm-yes">${confirmLabel}</button>
          <button class="stall-btn" id="buy-confirm-no">${I18N.tOr('cancel', 'Cancel')}</button>
        </div>
      </div>
    `;

    dialog.style.display = 'flex';

// Bind button events
    document.getElementById('buy-confirm-yes').onclick = () => {
      dialog.style.display = 'none';
      this.executeBuy(stall, slotData, itemIndex, totalPrice, emptySlot);
    };
    document.getElementById('buy-confirm-no').onclick = () => {
      dialog.style.display = 'none';
    };
  },

// Execute the purchase
  async executeBuy(stall, slotData, itemIndex, totalPrice, emptySlot) {
    return this.tryServerPurchase(stall, slotData, itemIndex, totalPrice);
  },

  // ========== render stallsarrive atgameworld ==========
  drawStalls(ctx) {
    const points = this.getStallInteractionPoints();

    for (const point of points) {
// Note: draw() already applies ctx.translate(-camera.x, -camera.y)
// So world coords are used directly here; no camera offset subtraction needed
      if (point.stall) {
// Occupied stall: draw the vendor (skip for your own stall since the player already renders)
        if (point.stall.user_id !== OnlineSystem?.userId) {
          this.drawStallOwner(ctx, point.x, point.y, point.stall);
        } else {
// Draw only your own stall's name bubble (pedestal + bubble, no vendor sprite)
          this.drawStallNameBubble(ctx, point.x, point.y, point.stall);
        }
      } else {
// Empty stall: draw the pedestal + the 'Empty' marker
        this.drawStallBase(ctx, point.x, point.y, point.index, true);
      }
    }
  },

// Empty-stall canvas label: cached per language to avoid per-frame lookups
  getEmptyStallMarker() {
    const lang = I18N.currentLang;
    if (this._emptyMarkerLang !== lang) {
      this._emptyMarkerLang = lang;
      this._emptyMarkerText = I18N.tr('market', 'stall_empty_marker', 'Free');
    }
    return this._emptyMarkerText;
  },

// Draw the stall pedestal (shared by empty and occupied stalls)
// isEmpty: true shows the 'Empty' mark, false hides it
  drawStallBase(ctx, x, y, index, isEmpty = true) {
    ctx.save();

    // groundshadow casting
    ctx.fillStyle = 'rgba(0, 0, 0, 0.36)';
    ctx.beginPath();
    ctx.ellipse(x, y + 24, 42, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stall carpet
    const rug = ctx.createLinearGradient(x, y - 4, x, y + 30);
    rug.addColorStop(0, '#5a261f');
    rug.addColorStop(1, '#2b1511');
    ctx.fillStyle = rug;
    ctx.beginPath();
    ctx.roundRect(x - 35, y + 2, 70, 30, 5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(230, 180, 96, 0.26)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 29, y + 8, 58, 16);

// Wooden counter
    const wood = ctx.createLinearGradient(x, y - 12, x, y + 24);
    wood.addColorStop(0, '#765034');
    wood.addColorStop(0.55, '#4a2f1d');
    wood.addColorStop(1, '#24140b');
    ctx.fillStyle = wood;
    ctx.beginPath();
    ctx.roundRect(x - 31, y - 11, 62, 34, 5);
    ctx.fill();

    // Canopy cloth
    const canopy = ctx.createLinearGradient(x, y - 36, x, y - 16);
    canopy.addColorStop(0, isEmpty ? '#4b3a30' : '#8f2f2b');
    canopy.addColorStop(1, isEmpty ? '#2a211d' : '#4a1714');
    ctx.fillStyle = canopy;
    ctx.beginPath();
    ctx.roundRect(x - 36, y - 38, 72, 18, 5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 205, 126, 0.25)';
    ctx.stroke();

    // sustainpillar
    ctx.strokeStyle = '#2a170d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 28, y - 22);
    ctx.lineTo(x - 26, y + 22);
    ctx.moveTo(x + 28, y - 22);
    ctx.lineTo(x + 26, y + 22);
    ctx.stroke();

// Wood grain and goods color blocks
    ctx.strokeStyle = 'rgba(255, 210, 140, 0.20)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x - 23, y - 4 + i * 8);
      ctx.lineTo(x + 23, y - 6 + i * 8);
      ctx.stroke();
    }
    if (!isEmpty) {
      ctx.fillStyle = '#d8b064';
      ctx.fillRect(x - 18, y - 4, 8, 6);
      ctx.fillStyle = '#7aa6ff';
      ctx.fillRect(x + 3, y - 5, 7, 7);
      ctx.fillStyle = '#8ed16f';
      ctx.fillRect(x + 15, y + 2, 6, 5);
    }

// Empty stalls show the 'Empty' mark and their number
    if (isEmpty) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
      ctx.beginPath();
      ctx.roundRect(x - 20, y - 1, 40, 18, 4);
      ctx.fill();
      ctx.fillStyle = '#b9a27a';
      ctx.font = 'bold 13px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.getEmptyStallMarker(), x, y + 8);

      ctx.fillStyle = '#75634a';
      ctx.font = '10px Arial';
      ctx.fillText(`#${index + 1}`, x, y + 32);
    }

    ctx.restore();
  },

  // drawstallmain
  drawStallOwner(ctx, x, y, stall) {
// Draw the wooden pedestal first (without the 'Empty' mark)
    this.drawStallBase(ctx, x, y, 0, false);

// Vendor (sitting sprite, first row 5th frame, index 4)
// Use the same draw parameters as game.js's player for visual consistency
    if (typeof processedSpriteSheet !== 'undefined' && processedSpriteSheet && typeof SPRITE_CONFIG !== 'undefined') {
      const frame = {
        x: 4 * SPRITE_CONFIG.frameWidth, // sit = 4 (ordinal5frame)
        y: SPRITE_CONFIG.heroRow * SPRITE_CONFIG.frameHeight,
        width: SPRITE_CONFIG.frameWidth,
        height: SPRITE_CONFIG.frameHeight
      };

// Render parameters consistent with game.js
      const renderHeight = 48;
      const renderWidth = renderHeight * frame.width / frame.height;
      ctx.drawImage(
        processedSpriteSheet,
        frame.x, frame.y, frame.width, frame.height,
        x - renderWidth / 2, y - renderHeight / 2, renderWidth, renderHeight
      );
    } else {
// Fallback: simple blue figure
      ctx.fillStyle = '#4a90d9';
      ctx.beginPath();
      ctx.arc(x, y - 15, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 8, y - 5, 16, 20);
    }

// Stall name bubble
    const name = stall.stall_name || I18N.tr('market', 'stall_default_name', 'Stall');
    ctx.font = 'bold 11px Arial';
    const textWidth = ctx.measureText(name).width;

// Bubble background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    const bubbleWidth = textWidth + 12;
    const bubbleHeight = 18;
    ctx.beginPath();
    ctx.roundRect(x - bubbleWidth / 2, y - 45, bubbleWidth, bubbleHeight, 4);
    ctx.fill();

// Bubble triangle
    ctx.beginPath();
    ctx.moveTo(x - 5, y - 27);
    ctx.lineTo(x + 5, y - 27);
    ctx.lineTo(x, y - 22);
    ctx.fill();

    // text
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, x, y - 36);

    // nickname
    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.fillText(stall.nickname, x, y + 35);
  },

// Draw only the stall name bubble (your own stall; no vendor sprite)
  drawStallNameBubble(ctx, x, y, stall) {
// Draw the wooden pedestal first (without the 'Empty' mark)
    this.drawStallBase(ctx, x, y, 0, false);

    const name = stall.stall_name || I18N.tr('market', 'stall_default_name', 'Stall');
    ctx.font = 'bold 11px Arial';
    const textWidth = ctx.measureText(name).width;

// Bubble background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    const bubbleWidth = textWidth + 12;
    const bubbleHeight = 18;
    ctx.beginPath();
    ctx.roundRect(x - bubbleWidth / 2, y - 45, bubbleWidth, bubbleHeight, 4);
    ctx.fill();

// Bubble triangle
    ctx.beginPath();
    ctx.moveTo(x - 5, y - 27);
    ctx.lineTo(x + 5, y - 27);
    ctx.lineTo(x, y - 22);
    ctx.fill();

    // text
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, x, y - 36);
  }
};

// ========== Helper functions ==========
// Get the item icon (reuse existing logic or a default)
function getItemIcon(item) {
  if (!item) return '?';

// Try the existing getItemEmoji function
  if (typeof getItemEmoji === 'function') {
    return getItemEmoji(item);
  }

  // defaulticon
  const iconMap = {
    'weapon': '⚔️',
    'armor': '🛡️',
    'helm': '🪖',
    'gloves': '🧤',
    'boots': '👢',
    'belt': '🎗️',
    'ring': '💍',
    'amulet': '📿',
    'potion': '🧪'
  };
  return iconMap[item.type] || '📦';
}
