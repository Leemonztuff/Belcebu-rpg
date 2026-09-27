// ========== ui-panels.js - UI panel management system ==========
// Owns panel open/close, z-order management and position calc
// Depends on globals: GSAPAnims.panelIn, hideTooltip, renderInventory, updateSkillsUI, etc.

// ========== Panel manager ==========
const panelManager = {
  panels: {
    'stats': { id: 'stats-panel', group: 'left', top: 10, baseTop: 10, opened: false, zIndex: 0 },
    'achievements': { id: 'achievements-panel', group: 'left', top: 10, baseTop: 10, opened: false, zIndex: 0 },
    'quest': { id: 'quest-panel', group: 'left', top: 15, baseTop: 15, opened: false, zIndex: 0 },
    'set-collection': { id: 'set-collection-panel', group: 'left', top: 10, baseTop: 10, opened: false, zIndex: 0 },
    'inventory': { id: 'inventory-panel', group: 'right', top: 10, baseTop: 10, opened: false, zIndex: 0 },
    'stash': { id: 'stash-panel', group: 'right', top: 15, baseTop: 15, opened: false, zIndex: 0 },
    'skills': { id: 'skills-panel', group: 'center', top: 15, baseTop: 15, opened: false, zIndex: 0 },
    'shop': { id: 'shop-panel', group: 'center', top: 10, baseTop: 10, opened: false, zIndex: 0 },
    'blacksmith': { id: 'blacksmith-panel', group: 'center', top: 15, baseTop: 15, opened: false, zIndex: 0 },
    'waypoint': { id: 'waypoint-panel', group: 'center', top: 12, baseTop: 12, opened: false, zIndex: 0 },
    'auto-battle': { id: 'auto-battle-panel', group: 'right', top: 10, baseTop: 10, opened: false, zIndex: 0 }
  },
  maxZIndex: 100,

  // Compute panel position dynamically
  calculatePosition(panelId) {
    const panel = this.panels[panelId];
    const element = document.getElementById(panel.id);

    // Count open panels in the same group
    const openedInGroup = Object.values(this.panels).filter(
      p => p.group === panel.group && p.opened && p.id !== panel.id
    ).length;

    // Adjust position dynamically by the group's open panel count
    const offset = openedInGroup * 8; // Stagger panels by 8%
    const newTop = panel.baseTop + offset;

    // For center-group panels without a left property (e.g. achievements), keep CSS centering
    if (panel.group === 'center' && !panel.left) {
      // Do not touch position; let the CSS transform centering work
      return newTop;
    }

    element.style.top = newTop + '%';

    // For middle-group panels, stagger horizontally
    if (panel.group === 'center' && panel.left) {
      const centerOffset = (openedInGroup % 2) * 50 - 25; // Stagger left/right
      element.style.left = (panel.left + centerOffset) + 'px';
    }

    // Small-screen fit: on small screens keep CSS centering, no position adjustment
    if (window.innerWidth < 768) return newTop;

    // On large screens ensure panels stay inside the viewport
    requestAnimationFrame(() => {
      const rect = element.getBoundingClientRect();
      const padding = 10;
      // Overflows right
      if (rect.right > window.innerWidth - padding) {
        element.style.left = Math.max(padding, window.innerWidth - rect.width - padding) + 'px';
        element.style.right = 'auto';
      }
      // The entrance animation temporarily scales and shifts down; use final layout height to avoid bottom overflow after the animation.
      element.style.top = Math.max(padding, Math.min(
        window.innerHeight * newTop / 100,
        window.innerHeight - element.offsetHeight - padding
      )) + 'px';
      // Overflows left
      if (rect.left < padding) {
        element.style.left = padding + 'px';
        element.style.right = 'auto';
      }
    });

    return newTop;
  },

  // Settings panel on top
  bringToFront(panelId) {
    const panel = this.panels[panelId];
    const element = document.getElementById(panel.id);

    this.maxZIndex += 10;
    panel.zIndex = this.maxZIndex;
    element.style.zIndex = this.maxZIndex;
  },

  // Open panel
  open(panelId) {
    const panel = this.panels[panelId];
    panel.opened = true;
    this.calculatePosition(panelId);
    this.bringToFront(panelId);
  },

  // Close panel
  close(panelId) {
    const panel = this.panels[panelId];
    panel.opened = false;
    panel.zIndex = 0;
  }
};

// After window resize, open panels must be re-constrained to the new viewport.
window.addEventListener('resize', () => {
  for (const [id, panel] of Object.entries(panelManager.panels)) {
    if (panel.opened) panelManager.calculatePosition(id);
  }
});

// ========== Helper functions ==========

// Check whether any important panel is open (excluding auto battle settings)
function isAnyPanelOpen() {
  return Object.entries(panelManager.panels).some(
    ([key, p]) => p.opened && key !== 'auto-battle'
  );
}

// Detect whether the mouse hovers a UI element
function isHoveringUI() {
  if (typeof mouse === 'undefined') return false;
  if (mouse.y > window.innerHeight - 140) return true;
  const panels = ['stats-panel', 'inventory-panel', 'skills-panel', 'shop-panel', 'menu-btns', 'quest-panel', 'achievements-panel', 'set-collection-panel', 'dialog-box',
    'waypoint-panel', 'abyss-entrance-panel', 'abyss-leaderboard-panel', 'abyss-result-panel'];
  for (let id of panels) {
    const el = document.getElementById(id);
    if (el) {
      const style = window.getComputedStyle(el);
      if (style.display !== 'none' || id === 'menu-btns') {
        const r = el.getBoundingClientRect();
        if (mouse.x >= r.left && mouse.x <= r.right && mouse.y >= r.top && mouse.y <= r.bottom) return true;
      }
    }
  }
  return false;
}

// ========== Panel switching ==========

function togglePanel(id) {
  const panelElement = document.getElementById(id + '-panel');
  const isOpening = panelElement.style.display !== 'block';

  if (isOpening) {
    // Open panel
    panelElement.style.display = 'block';
    // Play the pop-in animation with GSAP
    if (typeof GSAPAnims !== 'undefined') {
      GSAPAnims.panelIn(panelElement, 'bottom');
    }

    // Use the panel manager for dynamic position and z-order
    if (panelManager && panelManager.panels[id]) {
      panelManager.open(id);
    }

    // Call the matching UI update function by panel type
    const updateFunctions = {
      'inventory': typeof renderInventory !== 'undefined' ? renderInventory : null,
      'skills': typeof updateSkillsUI !== 'undefined' ? updateSkillsUI : null,
      'stats': typeof updateStatsUI !== 'undefined' ? updateStatsUI : null,
      'quest': typeof updateQuestUI !== 'undefined' ? updateQuestUI : null,
      'achievements': typeof renderAchievements !== 'undefined' ? renderAchievements : null,
      'shop': typeof renderEmbeddedBag !== 'undefined' ? () => renderEmbeddedBag('shop') : null,
      'stash': typeof renderStash !== 'undefined' ? renderStash : null,
      'blacksmith': typeof renderBlacksmithPanel !== 'undefined' ? () => { renderBlacksmithPanel(); renderEmbeddedBag('blacksmith'); } : null,
      'waypoint': typeof renderWaypointPanel !== 'undefined' ? renderWaypointPanel : null,
      'set-collection': typeof renderSetCollection !== 'undefined' ? () => {
        renderSetCollection();
        // If the monster tab is active, render the monster codex too
        const monsterTab = document.querySelector('.codex-tab[data-tab="monsters"]');
        if (monsterTab && monsterTab.classList.contains('active') && typeof renderMonsterCodex !== 'undefined') {
          renderMonsterCodex();
        }
      } : null
    };

    if (updateFunctions[id]) {
      updateFunctions[id]();
    }
  } else {
    // Close panel
    panelElement.style.display = 'none';

    // Hide the tooltip to avoid leftovers
    if (typeof hideTooltip !== 'undefined') {
      hideTooltip();
    }

    // Clear sell-confirm state
    if (typeof pendingSellConfirmIdx !== 'undefined') {
      pendingSellConfirmIdx = -1;
    }

    // Update panel manager state
    if (panelManager && panelManager.panels[id]) {
      panelManager.close(id);
    }
  }
}
