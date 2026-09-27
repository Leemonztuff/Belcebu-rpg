// ========== auto battlesystem ==========
// Depends on: constants.js, audio.js, game.js (globals)

const AutoBattle = {
    enabled: false,
    settings: {
        useSkill: true,                                     // prefer using skills
        keepDistance: GAME_CONFIG.AUTO_KEEP_DISTANCE,       // keep distance (ranged tactics)
        hpThreshold: GAME_CONFIG.AUTO_POTION_HP_THRESHOLD,  // red potion threshold
        mpThreshold: GAME_CONFIG.AUTO_POTION_MP_THRESHOLD,  // blue potion threshold
        emergencyHp: GAME_CONFIG.AUTO_EMERGENCY_HP,         // emergency town-portal threshold
        pickupUnique: true,                                 // auto-pickup Unique
        pickupSet: true                                     // auto-pickup Set
    },
    // hire costsystem
    sessionGold: 0,          // total gold earned this auto battle
    sessionFee: 0,           // total hire cost deducted this run
    currentTarget: null,
    stuckTimer: 0,               // stall detection timer when no target
    stuckPosTimer: 0,            // position drift stall detection timer
    lastPos: { x: 0, y: 0 },
    oscillationDetector: { positions: [], lastCheck: 0 },  // oscillation detector
    lastDamagedBy: null,         // record the last enemy that attacked me
    lastDamagedTime: 0,          // last attacked time
    lastTargetDamageDecisionTime: 0, // last retarget caused by taking damage
    moveDecisionTimer: 0,        // movement decision timer
    lastMoveDecision: null,      // last movement decision
    failedPaths: [],             // record failed pathfinding attempts
    pathCleanupTimer: 0,         // failed-path cleanup timer
    targetFailCount: 0,          // consecutive failures for the current target
    lastTargetId: null,          // last chased target (to detect target switching)
    blacklistedTargets: [],      // abandoned target blacklist [{target, until}]
    targetDecisionTimer: 0,      // target selection throttle timer
    pickupDecisionTimer: 0,      // pickup scan throttle timer
    targetDecisionInterval: 0.12, // target selection ~8Hz
    pickupDecisionInterval: 0.18, // pickup candidates ~5.5Hz
    losCache: new Map(),         // LOS cache: object + both tiles + area
    losObjectIds: new WeakMap(), // stable id for object references
    losNextObjectId: 1,
    losCacheAreaKey: null,
    losCacheMaxEntries: 600,

    getMeleeEngageDistance(target) {
        if (!target || !Number.isFinite(target.radius)) throw new Error('AutoBattle melee target missing radius');
        if (!Number.isFinite(player.radius)) throw new Error('Player missing radius');
        const targetRadius = target.radius;
        const playerRadius = player.radius;
        return Math.max(70, targetRadius + playerRadius + 35);
    },

    isTargetStillValid(target) {
        return !!target && !target.dead && enemies.includes(target);
    },

    getTargetDistanceSq(target) {
        const dx = target.x - player.x;
        const dy = target.y - player.y;
        return dx * dx + dy * dy;
    },

    canMeleeTarget(target, dist, hasLOS) {
        return (hasLOS || dist < GAME_CONFIG.PLAYER_MELEE_NO_LOS_RANGE) &&
            dist <= this.getMeleeEngageDistance(target);
    },

    shouldCloseForMelee(target, dist, hasLOS) {
        return !hasLOS &&
            dist >= GAME_CONFIG.PLAYER_MELEE_NO_LOS_RANGE &&
            dist <= this.getMeleeEngageDistance(target);
    },

    shouldSwitchTarget(candidate, reason) {
        if (!candidate || candidate.dead) return false;
        if (this.isTargetBlacklisted(candidate)) return false;
        if (!this.currentTarget || !this.isTargetStillValid(this.currentTarget)) return true;
        if (candidate === this.currentTarget) return false;

        const currentDistSq = this.getTargetDistanceSq(this.currentTarget);
        const candidateDistSq = this.getTargetDistanceSq(candidate);
        const meleeRange = this.getMeleeEngageDistance(this.currentTarget);
        if (currentDistSq <= meleeRange * meleeRange) return false;

        if (reason === 'damage') {
            return candidateDistSq < currentDistSq * 0.45 || candidateDistSq < 10000;
        }

        return candidateDistSq < currentDistSq * 0.65;
    },

    isTargetBlacklisted(target) {
        const now = Date.now();
        let writeIndex = 0;
        let blocked = false;
        for (let i = 0; i < this.blacklistedTargets.length; i++) {
            const entry = this.blacklistedTargets[i];
            if (entry.until <= now) continue;
            this.blacklistedTargets[writeIndex++] = entry;
            if (entry.target === target) blocked = true;
        }
        this.blacklistedTargets.length = writeIndex;
        return blocked;
    },

    canUseThunderOnTarget(target) {
        if (!target || target.dead) return false;
        if (!this.settings.useSkill) return false;
        if (!(player.skills.thunder > 0)) return false;
        if (player.skillCooldowns.thunder > 0) return false;
        const thunderCost = getSkillManaCost('thunder', player.skills.thunder);
        if (player.mp < thunderCost) return false;
        return this.getTargetDistanceSq(target) <= 200 * 200;
    },

    abandonCurrentTarget(target, durationMs = 6000) {
        if (!target) return;
        this.blacklistedTargets.push({ target, until: Date.now() + durationMs });
        if (this.currentTarget === target) this.currentTarget = null;
        this.targetFailCount = 0;
        this.lastTargetId = null;
        this.astarCache.path = null;
        this.astarCache.targetX = null;
        this.astarCache.targetY = null;
        this.astarCache.currentIndex = 0;
        player.targetX = null;
        player.targetY = null;
    },

    recordTargetPathFailure(target) {
        if (!target || this.canUseThunderOnTarget(target)) return false;
        if (this.lastTargetId !== target) {
            this.lastTargetId = target;
            this.targetFailCount = 0;
        }
        this.targetFailCount++;
        if (this.targetFailCount >= 2 && !this.hasCachedLineOfSightTo(target)) {
            this.abandonCurrentTarget(target);
            return true;
        }
        return false;
    },

    resetRuntimeState(reason) {
        this.currentTarget = null;
        this.lastDamagedBy = null;
        this.lastDamagedTime = 0;
        this.lastTargetDamageDecisionTime = 0;
        this.targetDecisionTimer = 0;
        this.pickupDecisionTimer = 0;
        this.stuckTimer = 0;
        this.stuckPosTimer = 0;
        this.lastPos = { x: player.x, y: player.y };
        this.failedPaths = [];
        this.blacklistedTargets = [];
        this.targetFailCount = 0;
        this.lastTargetId = null;
        this.moveDecisionTimer = 0;
        this.lastMoveDecision = null;
        this.losCache.clear();
        this.losCacheAreaKey = null;
        this.astarCache.path = null;
        this.astarCache.targetX = null;
        this.astarCache.targetY = null;
        this.astarCache.currentIndex = 0;
        player.targetItem = null;
        player.targetX = null;
        player.targetY = null;
    },

    // ====== A*pathingsystem ======
    astarCache: {
        path: null,              // currently cached path [{x, y},...]
        targetX: null,           // path target X
        targetY: null,           // path target Y
        currentIndex: 0,         // current waypoint index
        lastUpdateTime: 0        // last update time
    },

// Minimal binary heap implementation (for A* pathing optimization)
    MinHeap: class {
        constructor() {
            this.heap = [];
            this.nodeMap = new Map(); // key -> index quick lookup
        }

        size() { return this.heap.length; }

        push(node) {
            this.heap.push(node);
            const idx = this.heap.length - 1;
            this.nodeMap.set(node.key(), idx);
            this._bubbleUp(idx);
        }

        pop() {
            if (this.heap.length === 0) return null;
            const min = this.heap[0];
            const last = this.heap.pop();
            this.nodeMap.delete(min.key());
            if (this.heap.length > 0) {
                this.heap[0] = last;
                this.nodeMap.set(last.key(), 0);
                this._bubbleDown(0);
            }
            return min;
        }

// Update node (when a better path is found)
        updateNode(key, newNode) {
            const idx = this.nodeMap.get(key);
            if (idx === undefined) {
                this.push(newNode);
                return;
            }
            const oldF = this.heap[idx].f;
            this.heap[idx] = newNode;
            this.nodeMap.set(key, idx);
            if (newNode.f < oldF) {
                this._bubbleUp(idx);
            } else {
                this._bubbleDown(idx);
            }
        }

        has(key) {
            return this.nodeMap.has(key);
        }

        _bubbleUp(idx) {
            while (idx > 0) {
                const parentIdx = Math.floor((idx - 1) / 2);
                if (this.heap[idx].f >= this.heap[parentIdx].f) break;
                this._swap(idx, parentIdx);
                idx = parentIdx;
            }
        }

        _bubbleDown(idx) {
            const len = this.heap.length;
            while (true) {
                const left = 2 * idx + 1;
                const right = 2 * idx + 2;
                let smallest = idx;

                if (left < len && this.heap[left].f < this.heap[smallest].f) {
                    smallest = left;
                }
                if (right < len && this.heap[right].f < this.heap[smallest].f) {
                    smallest = right;
                }
                if (smallest === idx) break;
                this._swap(idx, smallest);
                idx = smallest;
            }
        }

        _swap(i, j) {
            const temp = this.heap[i];
            this.heap[i] = this.heap[j];
            this.heap[j] = temp;
            this.nodeMap.set(this.heap[i].key(), i);
            this.nodeMap.set(this.heap[j].key(), j);
        }
    },

// A* pathfinding implementation (binary-heap optimized)
    astarFindPath(startX, startY, goalX, goalY) {
        // convert totilecoords
        const startCol = Math.floor(startX / TILE_SIZE);
        const startRow = Math.floor(startY / TILE_SIZE);
        let goalCol = Math.floor(goalX / TILE_SIZE);
        let goalRow = Math.floor(goalY / TILE_SIZE);

        // bounds check
        if (startCol < 0 || startCol >= MAP_WIDTH || startRow < 0 || startRow >= MAP_HEIGHT) return null;
        if (goalCol < 0 || goalCol >= MAP_WIDTH || goalRow < 0 || goalRow >= MAP_HEIGHT) return null;

// If the goal is a wall, find the nearest walkable tile nearby
        if (mapData[goalRow][goalCol] === 0) {
            let found = false;
// Search radius expands gradually
            for (let radius = 1; radius <= 3 && !found; radius++) {
                for (let dr = -radius; dr <= radius && !found; dr++) {
                    for (let dc = -radius; dc <= radius && !found; dc++) {
                        if (Math.abs(dr) !== radius && Math.abs(dc) !== radius) continue; // check the outer ring only
                        const nr = goalRow + dr;
                        const nc = goalCol + dc;
                        if (nr >= 0 && nr < MAP_HEIGHT && nc >= 0 && nc < MAP_WIDTH && mapData[nr][nc] !== 0) {
                            goalRow = nr;
                            goalCol = nc;
                            found = true;
                        }
                    }
                }
            }
            if (!found) return null; // no walkable tile nearby
        }

// Node class
        class AStarNode {
            constructor(col, row, g, h, parent) {
                this.col = col;
                this.row = row;
                this.g = g;       // actual cost from start to this node
                this.h = h;       // estimated cost from this node to the goal (heuristic)
                this.f = g + h;   // total cost
                this.parent = parent;
            }

            equals(other) {
                return this.col === other.col && this.row === other.row;
            }

            key() {
                return `${this.col},${this.row}`;
            }
        }

// Heuristic: Euclidean distance
        const heuristic = (col, row) => {
            const dx = goalCol - col;
            const dy = goalRow - row;
            return Math.sqrt(dx * dx + dy * dy);
        };

// Get neighbor nodes (8 directions)
        const getNeighbors = (node) => {
            const neighbors = [];
            const directions = [
                { dc: -1, dr: 0, cost: 1 },      // left
                { dc: 1, dr: 0, cost: 1 },       // right
                { dc: 0, dr: -1, cost: 1 },      // up
                { dc: 0, dr: 1, cost: 1 },       // down
                { dc: -1, dr: -1, cost: 1.414 }, // top-left
                { dc: 1, dr: -1, cost: 1.414 },  // top-right
                { dc: -1, dr: 1, cost: 1.414 },  // bottom-left
                { dc: 1, dr: 1, cost: 1.414 }    // bottom-right
            ];

            for (let dir of directions) {
                const newCol = node.col + dir.dc;
                const newRow = node.row + dir.dr;

                // bounds check
                if (newCol < 0 || newCol >= MAP_WIDTH || newRow < 0 || newRow >= MAP_HEIGHT) continue;

// Wall check
                if (mapData[newRow][newCol] === 0) continue;

// Diagonal moves must check both sides are passable (prevents wall clipping)
                if (dir.dc !== 0 && dir.dr !== 0) {
                    if (mapData[node.row][newCol] === 0 || mapData[newRow][node.col] === 0) {
                        continue;
                    }
                }

                neighbors.push({
                    col: newCol,
                    row: newRow,
                    cost: dir.cost
                });
            }

            return neighbors;
        };

// Open list (binary heap) and closed list
        const openHeap = new this.MinHeap();
        const closedSet = new Set();
        const gScores = {}; // record the best g value per node

// Start node
        const startNode = new AStarNode(startCol, startRow, 0, heuristic(startCol, startRow), null);
        openHeap.push(startNode);
        gScores[startNode.key()] = 0;

        // main loop
        let iterations = 0;
        const maxIterations = 2000; // prevent infinite loops

        while (openHeap.size() > 0 && iterations < maxIterations) {
            iterations++;

            // Pop node with lowest f - O(log n)
            const current = openHeap.pop();

            // toreachtarget
            if (current.col === goalCol && current.row === goalRow) {
// Rebuild the path
                const path = [];
                let node = current;
                while (node !== null) {
// Convert back to pixel coords (tile center)
                    path.unshift({
                        x: node.col * TILE_SIZE + TILE_SIZE / 2,
                        y: node.row * TILE_SIZE + TILE_SIZE / 2
                    });
                    node = node.parent;
                }

// Path simplification: drop redundant midpoints (keep straight segments)
                if (path.length > 2) {
                    const simplified = [path[0]];
                    for (let i = 1; i < path.length - 1; i++) {
                        const prev = simplified[simplified.length - 1];
                        const curr = path[i];
                        const next = path[i + 1];

// Check whether a turn is needed (direction change)
                        const dx1 = curr.x - prev.x;
                        const dy1 = curr.y - prev.y;
                        const dx2 = next.x - curr.x;
                        const dy2 = next.y - curr.y;

// Compare after normalizing direction vectors
                        const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
                        const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

                        if (len1 > 0 && len2 > 0) {
                            const dot = (dx1 / len1) * (dx2 / len2) + (dy1 / len1) * (dy2 / len2);
// dot near 1 means same direction; skip the midpoint
                            if (dot < 0.99) { // allow up to 2 degrees of deviation
                                simplified.push(curr);
                            }
                        }
                    }
                    simplified.push(path[path.length - 1]);
                    return simplified;
                }

                return path;
            }

// Add to the closed list
            closedSet.add(current.key());

            // Checkneighbor
            const neighbors = getNeighbors(current);
            for (let neighbor of neighbors) {
                const neighborKey = `${neighbor.col},${neighbor.row}`;

// Skip if already in the closed list
                if (closedSet.has(neighborKey)) continue;

                // Calcnewgvalue
                const tentativeG = current.g + neighbor.cost;

// Check whether a better path was found
                if (gScores[neighborKey] === undefined || tentativeG < gScores[neighborKey]) {
                    gScores[neighborKey] = tentativeG;

// Create a new node
                    const h = heuristic(neighbor.col, neighbor.row);
                    const newNode = new AStarNode(neighbor.col, neighbor.row, tentativeG, h, current);

                    // Uses binary-heap updateNode (handles insert or update) - O(log n)
                    openHeap.updateNode(neighborKey, newNode);
                }
            }
        }

        // not yetfindtopath
        return null;
    },

    getTileKey(x, y) {
        return `${Math.floor(x / TILE_SIZE)},${Math.floor(y / TILE_SIZE)}`;
    },

    getLosAreaKey() {
        return `${player.floor}:${player.hellFloor}:${player.isInHell}:${isInTown()}`;
    },

    resetLosCacheIfAreaChanged() {
        const areaKey = this.getLosAreaKey();
        if (this.losCacheAreaKey !== areaKey) {
            this.losCache.clear();
            this.losCacheAreaKey = areaKey;
        }
        return areaKey;
    },

    getLosObjectId(target) {
        let id = this.losObjectIds.get(target);
        if (id === undefined) {
            id = this.losNextObjectId;
            this.losNextObjectId++;
            this.losObjectIds.set(target, id);
        }
        return id;
    },

    hasCachedLineOfSightTo(target) {
        const areaKey = this.resetLosCacheIfAreaChanged();
        const playerTile = this.getTileKey(player.x, player.y);
        const targetTile = this.getTileKey(target.x, target.y);
        const key = `${areaKey}:${this.getLosObjectId(target)}:${playerTile}:${targetTile}`;

        if (this.losCache.has(key)) {
            return this.losCache.get(key);
        }

        const result = hasLineOfSight(player.x, player.y, target.x, target.y);
        this.losCache.set(key, result);
        if (this.losCache.size > this.losCacheMaxEntries) {
            const firstKey = this.losCache.keys().next().value;
            this.losCache.delete(firstKey);
        }
        return result;
    },

// Find target - prefer near visible ones, then any far monster
// Optimization: use EnemyCache.aliveList to skip dead enemies
    findTarget() {
        if (!this.enabled || isInTown()) return null;

        let nearestVisible = null;   // nearest monster in sight
        let minVisibleDistSq = Infinity;
        let nearestCloseMelee = null; // nearby monster already in basic-attack range
        let minCloseMeleeDistSq = Infinity;
        let nearestCloseBlocked = null; // near monster that still needs closing in or repositioning
        let minCloseBlockedDistSq = Infinity;
        let nearestAny = null;       // Any nearest monster (for detours)
        let minAnyDistSq = Infinity;

// Use the cached alive list (dead enemies filtered)
        const aliveList = typeof EnemyCache !== 'undefined' ? EnemyCache.aliveList : enemies;
        const px = player.x, py = player.y;

        for (let i = 0, len = aliveList.length; i < len; i++) {
            const e = aliveList[i];
            if (e.dead) continue; // Handle the uncached case
            if (this.isTargetBlacklisted(e)) continue;

            const dx = e.x - px, dy = e.y - py;
            const distSq = dx * dx + dy * dy;

            const inVisibleScanRange = distSq < 360000;
            const hasLOS = inVisibleScanRange && this.hasCachedLineOfSightTo(e);

// Visible monsters: preferred, range 600
            if (hasLOS && distSq < minVisibleDistSq) {
                nearestVisible = e;
                minVisibleDistSq = distSq;
            }

// Split near monsters into basic-attackable and blocked-by-wall/obstacle, so wall-hugging targets don't outrank visible threats.
            if (distSq < 10000) {
                const dist = Math.sqrt(distSq);
                if (this.canMeleeTarget(e, dist, hasLOS)) {
                    if (distSq < minCloseMeleeDistSq) {
                        nearestCloseMelee = e;
                        minCloseMeleeDistSq = distSq;
                    }
                } else if (distSq < minCloseBlockedDistSq) {
                    nearestCloseBlocked = e;
                    minCloseBlockedDistSq = distSq;
                }
            }

// Any monster: range widened to 1500 (whole screen) for chase detours
            if (distSq < 2250000 && distSq < minAnyDistSq) { // 1500^2 = 2250000
                nearestAny = e;
                minAnyDistSq = distSq;
            }
        }

// Priority: attackable near > visible threat > blocked near > any
        return nearestCloseMelee || nearestVisible || nearestCloseBlocked || nearestAny;
    },

// Record being attacked
    onPlayerDamaged(attacker) {
        if (this.enabled && attacker) {
            this.lastDamagedBy = attacker;
            this.lastDamagedTime = Date.now();
        }
    },

// Decision action - minimal version
    decideAction(dt) {
        if (!this.enabled || isInTown()) return;

// 0. Physical position stall detection
        const moveDist = Math.hypot(player.x - this.lastPos.x, player.y - this.lastPos.y);

// With a pickup target, check whether we're closing in
        if (player.targetItem) {
            const distToItem = Math.hypot(player.x - player.targetItem.x, player.y - player.targetItem.y);
// Very close but can't pick up, or no progress for a long time: give up
            if (distToItem < 50 && moveDist < 5) {
                this.stuckPosTimer += dt;
            } else if (moveDist < 10) {
// Moving but slowly (detouring or stuck)
                this.stuckPosTimer += dt * 0.5;
            } else {
                this.stuckPosTimer = Math.max(0, this.stuckPosTimer - dt);
            }

            if (this.stuckPosTimer > 2) {
                this.blacklistedTargets.push({ target: player.targetItem, until: Date.now() + 30000 });
                // silentabandon，no toast
                player.targetItem = null;
                player.targetX = null;
                player.targetY = null;
                this.stuckPosTimer = 0;
            }
        } else if (moveDist < 2) {
            this.stuckPosTimer += dt;
            if (this.stuckPosTimer > 3) {
                this.escapeFromStuck();
                this.stuckPosTimer = 0;
            }
        } else {
            this.stuckPosTimer = 0;
        }
        this.lastPos = { x: player.x, y: player.y };

// 1. Survival: emergency town portal
        const hpPercent = player.hp / player.maxHp;
        if (hpPercent < this.settings.emergencyHp) {
            const hasScroll = player.inventory.some(it => it && it.type === 'scroll');
            if (hasScroll) {
                this.emergencyTownPortal();
                return;
            }
        }

        // 2. spawnkeep:drink potion
        if (hpPercent < this.settings.hpThreshold) {
            this.drinkPotion('health');
        }
        if (player.mp / player.maxMp < this.settings.mpThreshold) {
            this.drinkPotion('mana');
        }

// 2.5 Survival: cast shield skill (auto when below 50% HP with no shield)
        if (this.settings.useSkill && hpPercent < 0.5) {
            const shieldLevel = player.skillTree?.holy_shield?.stage1 || 0;
            const shieldCooldown = player.shield?.cooldown || 0;
            const shieldActive = player.shield?.active || false;
            const manaCost = SKILL_TREE?.holy_shield?.stage1?.manaCost || 15;

// Shield learned, not on cooldown, no active shield, enough mana
            if (shieldLevel > 0 && shieldCooldown <= 0 && !shieldActive && player.mp >= manaCost) {
                castSkill('holy_shield');
            }
        }

// 3. Pick up items: candidate scan throttled to ~5.5Hz to avoid per-frame ground scans
        this.pickupDecisionTimer += dt;
        const pickupDecisionDue = this.pickupDecisionTimer >= this.pickupDecisionInterval;
        if (pickupDecisionDue) {
            this.autoPickupItems();
            this.pickupDecisionTimer = 0;
        }

// 4. Choose target: scan throttled to ~8Hz; retarget immediately on death/disappearance/fresh hit
        this.targetDecisionTimer += dt;
        const targetDecisionDue = this.targetDecisionTimer >= this.targetDecisionInterval;
        const currentTargetInvalid = this.currentTarget && !this.isTargetStillValid(this.currentTarget);
        const damageTriggeredDecision = this.lastDamagedBy && !this.lastDamagedBy.dead &&
            this.lastDamagedTime > this.lastTargetDamageDecisionTime;
        if (currentTargetInvalid) {
            this.currentTarget = null;
        }
        if (!this.currentTarget) {
            this.currentTarget = this.findTarget();
            this.targetDecisionTimer = 0;
            if (damageTriggeredDecision) {
                this.lastTargetDamageDecisionTime = this.lastDamagedTime;
            }
        } else if (damageTriggeredDecision) {
            if (this.shouldSwitchTarget(this.lastDamagedBy, 'damage')) {
                this.currentTarget = this.lastDamagedBy;
            }
            this.lastTargetDamageDecisionTime = this.lastDamagedTime;
        } else if (targetDecisionDue) {
            const candidate = this.findTarget();
            if (this.shouldSwitchTarget(candidate, 'scan')) {
                this.currentTarget = candidate;
            }
            this.targetDecisionTimer = 0;
        }

        if (!this.currentTarget) {
// No enemies: wander and explore
            this.stuckTimer += dt;
            if (this.stuckTimer > 1) {
                this.moveToCenter();
                this.stuckTimer = 0;
            }
            return;
        }
        this.stuckTimer = 0;

// 5. Move: walk to the target when not picking up
        if (player.targetItem === null) {
            const tdx = this.currentTarget.x - player.x;
            const tdy = this.currentTarget.y - player.y;
            const dist = Math.hypot(tdx, tdy);
            const hasLOS = this.hasCachedLineOfSightTo(this.currentTarget);
            const engageDistance = this.getMeleeEngageDistance(this.currentTarget);
            const shouldCloseForMelee = this.shouldCloseForMelee(this.currentTarget, dist, hasLOS);
            if (tdx * tdx + tdy * tdy > engageDistance * engageDistance || shouldCloseForMelee) {
                this.moveTowards(this.currentTarget);
                if (!this.currentTarget) return;
                if (shouldCloseForMelee) return;
            } else {
                player.targetX = null;
                player.targetY = null;
            }
        }

        // 6. attack
        this.attackTarget(this.currentTarget);
    },

    // tighthurriedreturn to town
    emergencyTownPortal() {
// Emergency town portal (scroll already ensured before the call)
        useQuickItem('scroll');
        createFloatingText(player.x, player.y - 60, '⚠️ Emergency town portal!', COLORS.error, 2);
    },

    // drink potion
    drinkPotion(type) {
        let itemName = '';
        if (type === 'health') itemName = CONSUMABLE_NAME.HEALTH_POTION;
        if (type === 'mana') itemName = CONSUMABLE_NAME.MANA_POTION;

        const hasPotion = player.inventory.some(it => it && it.name === itemName);
        if (hasPotion) {
            useQuickItem(type);
        }
    },

// The walk corridor must fit the character body and honor the real X-then-Y collision order.
    canWalkSegment(startX, startY, endX, endY) {
        const dx = endX - startX, dy = endY - startY;
        const stepSize = Math.min(player.radius / 2, TILE_SIZE / 4);
        const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / stepSize));
        for (let i = 1; i <= steps; i++) {
            const x = startX + dx * i / steps;
            const y = startY + dy * i / steps;
            const previousY = startY + dy * (i - 1) / steps;
            if (!canPlayerOccupy(x, previousY) || !canPlayerOccupy(x, y)) return false;
        }
        return true;
    },

// A* pathing: use the cache for performance
    findPathToTarget(targetX, targetY, target = null) {
// 1. Check line of sight; walk straight if visible
        const hasDirectLOS = target ? this.hasCachedLineOfSightTo(target) : hasLineOfSight(player.x, player.y, targetX, targetY);
        if (hasDirectLOS && this.canWalkSegment(player.x, player.y, targetX, targetY)) {
            // clean outaircache
            this.astarCache.path = null;
            this.astarCache.currentIndex = 0;
            return { x: targetX, y: targetY };
        }

// 2. Check whether the cache is valid
        const now = Date.now();
        const targetChanged = this.astarCache.targetX !== null &&
            (Math.floor(this.astarCache.targetX / TILE_SIZE) !== Math.floor(targetX / TILE_SIZE) ||
                Math.floor(this.astarCache.targetY / TILE_SIZE) !== Math.floor(targetY / TILE_SIZE));

        const cacheExpired = now - this.astarCache.lastUpdateTime > 2000; // 2secondexpired
        const needNewPath = !this.astarCache.path || targetChanged || cacheExpired;

        // 3. ifneednewpath，runrowA*
        if (needNewPath) {
            const newPath = this.astarFindPath(player.x, player.y, targetX, targetY);

            if (newPath && newPath.length > 0) {
                // cachenewpath
                this.astarCache.path = newPath;
                this.astarCache.targetX = targetX;
                this.astarCache.targetY = targetY;
                this.astarCache.currentIndex = 0;
                this.astarCache.lastUpdateTime = now;

// After recompute the start center may be skipped, but only when the corridor is safe, to avoid timed back-and-forth.
                if (newPath.length > 1 && this.canWalkSegment(player.x, player.y, newPath[1].x, newPath[1].y)) {
                    this.astarCache.currentIndex = 1;
                }

                // Showdebuginfo（optional）
                if (window.DEBUG_ASTAR) {
                    console.log(`A* path found: ${newPath.length} waypoints`);
                }
            } else {
// A* failed: clear the cache and return null for the greedy fallback
                this.astarCache.path = null;
                this.astarCache.currentIndex = 0;

// Fall back to simple greedy pathing
                return this.fallbackGreedyPath(targetX, targetY);
            }
        }

        // 4. usecachepath
        if (this.astarCache.path && this.astarCache.path.length > 0) {
// Skip waypoints already reached
            while (this.astarCache.currentIndex < this.astarCache.path.length) {
                const waypoint = this.astarCache.path[this.astarCache.currentIndex];
                const distToWaypoint = Math.hypot(waypoint.x - player.x, waypoint.y - player.y);

// Matches the real 5px move stop threshold; early corner-cutting must confirm the next segment fits the body.
                const next = this.astarCache.path[this.astarCache.currentIndex + 1];
                if (distToWaypoint <= 5 || (next && distToWaypoint < TILE_SIZE * 0.6 &&
                    this.canWalkSegment(player.x, player.y, next.x, next.y))) {
                    this.astarCache.currentIndex++;
                } else {
// Return the current waypoint
                    return { x: waypoint.x, y: waypoint.y };
                }
            }

// All waypoints walked: clear the cache
            this.astarCache.path = null;
            this.astarCache.currentIndex = 0;
            return this.canWalkSegment(player.x, player.y, targetX, targetY)
                ? { x: targetX, y: targetY } : null;
        }

// 5. Empty cache: return null (let the caller decide)
        return null;
    },

// Greedy fallback pathing (used when A* fails)
    fallbackGreedyPath(targetX, targetY) {
        const toTargetAngle = Math.atan2(targetY - player.y, targetX - player.x);
        const stepDist = 80;

        const angles = [
            toTargetAngle,
            toTargetAngle - Math.PI / 4,
            toTargetAngle + Math.PI / 4,
            toTargetAngle - Math.PI / 2,
            toTargetAngle + Math.PI / 2,
            toTargetAngle - Math.PI * 3 / 4,
            toTargetAngle + Math.PI * 3 / 4,
            toTargetAngle + Math.PI  // counter-toward
        ];

        for (let a of angles) {
            const testX = player.x + Math.cos(a) * stepDist;
            const testY = player.y + Math.sin(a) * stepDist;

            if (this.canWalkSegment(player.x, player.y, testX, testY)) {
                return { x: testX, y: testY };
            }
        }

// Fully trapped: return the current position
        return { x: player.x, y: player.y };
    },

// Move toward the target (using pathing)
    moveTowards(target) {
        const pathPos = this.findPathToTarget(target.x, target.y, target);

        if (pathPos) {
// Check whether pathing succeeded (not the starting spot)
            const pathDist = Math.hypot(pathPos.x - player.x, pathPos.y - player.y);
            if (pathDist > 5) {
// Pathing succeeded: move to the new position
                this.targetFailCount = 0;
                this.lastTargetId = target;
                player.targetX = pathPos.x;
                player.targetY = pathPos.y;
            } else if (Math.hypot(target.x - player.x, target.y - player.y) <= 5) {
                player.targetX = null;
                player.targetY = null;
            } else {
// Pathing failed: stay put and try force-unstuck
                if (this.recordTargetPathFailure(target)) return;
                this.escapeFromStuck();
            }
        } else {
// No path possible: clear the target
            if (this.recordTargetPathFailure(target)) return;
            player.targetX = null;
            player.targetY = null;
        }

        player.targetItem = null;
    },

// Back away from the target (smart wall routing)
    retreatFrom(target) {
        const angle = Math.atan2(player.y - target.y, player.x - target.x);
        const retreatDist = 100;

// Try several retreat directions
        const retreatAngles = [
            angle,                    // justafterjust
            angle + Math.PI / 6,      // rightafter15ratio
            angle - Math.PI / 6,      // leftafter15ratio
            angle + Math.PI / 3,      // rightafter30ratio
            angle - Math.PI / 3,      // leftafter30ratio
            angle + Math.PI / 2,      // rightside
            angle - Math.PI / 2,      // leftside
        ];

        for (let a of retreatAngles) {
            const testX = player.x + Math.cos(a) * retreatDist;
            const testY = player.y + Math.sin(a) * retreatDist;

// Take the first walkable retreat spot
            if (!isWall(testX, testY)) {
                player.targetX = testX;
                player.targetY = testY;
                player.targetItem = null;
                return;
            }
        }

// If walls block every direction, try a short sideways move
        const sideAngles = [angle + Math.PI / 2, angle - Math.PI / 2];
        for (let a of sideAngles) {
            const testX = player.x + Math.cos(a) * 60;
            const testY = player.y + Math.sin(a) * 60;

            if (!isWall(testX, testY)) {
                player.targetX = testX;
                player.targetY = testY;
                player.targetItem = null;
                return;
            }
        }

// As a last resort, stay still
        player.targetX = null;
        player.targetY = null;
        player.targetItem = null;
    },

// Move toward the map center (anti-stall)
    moveToCenter() {
// Pick a random non-wall spot
        let attempts = 0;
        let foundPos = false;

        while (!foundPos && attempts < 20) {
            const randX = (10 + Math.random() * (MAP_WIDTH - 20)) * TILE_SIZE;
            const randY = (10 + Math.random() * (MAP_HEIGHT - 20)) * TILE_SIZE;

            if (!isWall(randX, randY)) {
                player.targetX = randX;
                player.targetY = randY;
                foundPos = true;
            }
            attempts++;
        }

        if (!foundPos) {
// Fall back to the map center if nothing is found
            player.targetX = MAP_WIDTH * TILE_SIZE / 2;
            player.targetY = MAP_HEIGHT * TILE_SIZE / 2;
        }

        player.targetItem = null;
    },

// Unstuck routine: escape when wedged against a wall (smart version)
    escapeFromStuck() {
// Record failed positions to avoid retrying them
        this.failedPaths.push({ x: player.x, y: player.y, time: Date.now() });
        if (this.failedPaths.length > 20) {
            this.failedPaths.shift();
        }

// Reset the movement decision timer to decide again now
        this.moveDecisionTimer = 999;

// Smart unstuck: bigger escape distance, avoid the target direction
        const escapeDistances = [150, 250];  // increase distance to escape the corner

// Compute the angle to avoid (avoid the target direction if any)
        let avoidAngle = null;
        if (this.currentTarget) {
            avoidAngle = Math.atan2(this.currentTarget.y - player.y, this.currentTarget.x - player.x);
        }

        // try to16direction
        for (let dist of escapeDistances) {
            const angles = [];
            for (let i = 0; i < 16; i++) {
                angles.push((Math.PI * 2 / 16) * i);
            }

// With an avoid-angle, sort angles (farthest from the target first)
            if (avoidAngle !== null) {
                angles.sort((a, b) => {
                    const distA = Math.abs(((a - avoidAngle + Math.PI) % (2 * Math.PI)) - Math.PI);
                    const distB = Math.abs(((b - avoidAngle + Math.PI) % (2 * Math.PI)) - Math.PI);
                    return distB - distA;  // The farther from the target direction, the higher the priority
                });
            }

            for (let angle of angles) {
                const testX = player.x + Math.cos(angle) * dist;
                const testY = player.y + Math.sin(angle) * dist;

                if (!isWall(testX, testY)) {
// Check whether it's on the failed-path blacklist
                    const isInBlacklist = this.failedPaths.some(p =>
                        Math.hypot(p.x - testX, p.y - testY) < 80
                    );

                    if (!isInBlacklist) {
                        player.targetX = testX;
                        player.targetY = testY;
                        player.targetItem = null;
                        return;
                    }
                }
            }
        }

// All directions failed: move to a random map spot
        this.moveToCenter();
    },

    // attacktarget
    attackTarget(target) {
        const dist = Math.hypot(target.x - player.x, target.y - player.y);

// Point the mouse position at the target (skills need it)
        mouse.worldX = target.x;
        mouse.worldY = target.y;

        // Checkline of sight
        const hasLOS = this.hasCachedLineOfSightTo(target);
        const canMelee = this.canMeleeTarget(target, dist, hasLOS);

        if (canMelee) {
            if (player.attackCooldown <= 0) {
                performAttack(target);
                return;
            }
        }

        // useskill
        if (this.settings.useSkill && player && player.skills && player.skillCooldowns) {
            // there isline of sight:firesphere/plentyre-priority
            if (hasLOS) {
                const fireballCost = getSkillManaCost('fireball', player.skills.fireball || 0);
                if ((player.skills.fireball || 0) > 0 && (player.skillCooldowns.fireball || 0) <= 0 && dist <= 450 && player.mp >= fireballCost) {
                    castSkill('fireball');
                    return;
                }

                const multishotCost = getSkillManaCost('multishot', player.skills.multishot || 0);
                if ((player.skills.multishot || 0) > 0 && (player.skillCooldowns.multishot || 0) <= 0 && dist <= 500 && player.mp >= multishotCost) {
                    castSkill('multishot');
                    return;
                }
            }

// Lightning: goes through walls, range 190
            const thunderCost = getSkillManaCost('thunder', player.skills.thunder || 0);
            if ((player.skills.thunder || 0) > 0 && (player.skillCooldowns.thunder || 0) <= 0 && dist <= 190 && player.mp >= thunderCost) {
                castSkill('thunder');
                return;
            }
        }

// Basic attacks route through performAttack so auto battle and manual attacks share one damage/animation source of truth.
    },

// Auto-pickup items (priority-driven)
    autoPickupItems() {
        const inventoryFull = player.inventory.filter(it => it !== null).length >= player.inventory.length;

// Check whether space can be made (any item below the target rarity can be dropped)
        const canMakeRoom = (targetRarity) => {
// Only gear (rarity >= 2) considers making space
            if (targetRarity < 2) return false;
            for (let i = 0; i < player.inventory.length; i++) {
                const it = player.inventory[i];
                if (!it) continue;
                // potions and scrolls are not dropped
                if (it.type === 'potion' || it.type === 'scroll') continue;
// An inventory item below the target rarity means space can be made
                if (it.rarity < targetRarity) return true;
            }
            return false;
        };

// Candidate item list
        let setItems = [];      // Set: highest priority
        let urgentPotions = []; // Emergency potion
        let uniqueItems = [];   // Unique/rare
        let goldItems = [];     // gold
        let consumables = [];   // potion/scroll
        let normalItems = [];   // blue/yellow

        const hasHealPotion = player.inventory.some(it => it && it.name === CONSUMABLE_NAME.HEALTH_POTION);
        const hasManaPotion = player.inventory.some(it => it && it.name === CONSUMABLE_NAME.MANA_POTION);

        for (let i = 0; i < groundItems.length; i++) {
            const it = groundItems[i];
            if (!it) continue;

// Filter blacklisted items
            if (this.blacklistedTargets.some(b => b.target === it && Date.now() < b.until)) continue;

            const dist = Math.hypot(it.x - player.x, it.y - player.y);
            if (it.dropTime && Date.now() - it.dropTime < 3000) continue; // Don't pick up just-dropped items

// LOS check: normal items need sight; top items (set/unique/gold) get picked nearby even without sight (may be around a corner)
            const isSuperRare = it.rarity >= 4 || it.type === 'gold';
            if (!isSuperRare && !this.hasCachedLineOfSightTo(it)) continue;
// Even without sight, top items have a distance cap (prevents cross-map runs)
            if (isSuperRare && dist > 800) continue;

            // minuteclass
            if (it.type === 'gold' && player.autoPickup.gold && dist < 600) {
                goldItems.push({ item: it, dist, priority: 1 }); // Gold priority raised to match set items
            } else if (it.rarity === 5 && dist < 500) {
                if (!inventoryFull || canMakeRoom(5)) setItems.push({ item: it, dist, priority: 1 });
            } else if (it.rarity === 4 && dist < 500) {
                if (!inventoryFull || canMakeRoom(4)) uniqueItems.push({ item: it, dist, priority: 3 });
            } else if (it.rarity === 3 && dist < 400) {
                if (!inventoryFull || canMakeRoom(3)) uniqueItems.push({ item: it, dist, priority: 4 });
            } else if ((it.name === CONSUMABLE_NAME.HEALTH_POTION || it.name === CONSUMABLE_NAME.MANA_POTION)) {
                if (player.autoPickup.potion && dist < 400) {
                    const needUrgent = (it.name === CONSUMABLE_NAME.HEALTH_POTION && !hasHealPotion) || (it.name === CONSUMABLE_NAME.MANA_POTION && !hasManaPotion);
                    if (needUrgent) urgentPotions.push({ item: it, dist, priority: 2 });
                    else consumables.push({ item: it, dist, priority: 6 });
                }
            } else if (it.name === CONSUMABLE_NAME.TOWN_PORTAL && player.autoPickup.scroll && dist < 400) {
                consumables.push({ item: it, dist, priority: 6 });
            } else if (it.rarity >= 2 && dist < 300 && !inventoryFull) {
                normalItems.push({ item: it, dist, priority: 7 });
            }
        }

// Priority decision logic
        let bestCandidate = null;
        const candidates = [...setItems, ...urgentPotions, ...uniqueItems, ...goldItems, ...consumables, ...normalItems];
        if (candidates.length > 0) {
            candidates.sort((a, b) => a.priority - b.priority || a.dist - b.dist);
            bestCandidate = candidates[0].item;
            bestCandidate.prioValue = candidates[0].priority;
        }

// Intense-combat detection
        const pX = player.x, pY = player.y;
        const inHeavyCombat = enemies.some(e => {
            if (e.dead) return false;
            const dx = e.x - pX, dy = e.y - pY;
            return dx * dx + dy * dy < 6400; // 80^2 = 6400
        });

// With a current target, check whether switching is needed
        if (player.targetItem) {
            const oldExists = groundItems.includes(player.targetItem);
            const oldPrio = player.targetItem.prioValue || 99;
            const oldDist = Math.hypot(player.targetItem.x - player.x, player.targetItem.y - player.y);

// Switch when: old target gone, new priority higher, or same priority and 50%+ closer
            const shouldSwitch = !oldExists ||
                (bestCandidate && bestCandidate.prioValue < oldPrio) ||
                (bestCandidate && bestCandidate.prioValue === oldPrio && bestCandidate.dist < oldDist * 0.5);

            if (shouldSwitch) {
// Switch to the new target
                player.targetItem = null;
            } else {
// Keep the old target unless it's in intense combat and unimportant
                if (inHeavyCombat && oldPrio > 3 && Math.hypot(player.targetItem.x - player.x, player.targetItem.y - player.y) > 100) {
                    player.targetItem = null; // Defer low-priority pickups during combat
                } else {
// Keep the old target but keep refreshing waypoints (for A*)
                    const item = player.targetItem;
                    if (this.hasCachedLineOfSightTo(item) && this.canWalkSegment(player.x, player.y, item.x, item.y)) {
                        player.targetX = item.x;
                        player.targetY = item.y;
                    } else {
                        const pathPoint = this.findPathToTarget(item.x, item.y, item);
                        if (pathPoint) {
                            player.targetX = pathPoint.x;
                            player.targetY = pathPoint.y;
                        } else {
                            // findnotarrive atroad，abandon
                            this.blacklistedTargets.push({ target: item, until: Date.now() + 30000 });
                            player.targetItem = null;
                            player.targetX = null;
                            player.targetY = null;
                        }
                    }
                    return;
                }
            }
        }

// Choose the best pickup target
        let selected = bestCandidate;
        if (selected && inHeavyCombat) {
// In intense combat, only set(1), emergency potions(2) or items already underfoot
            if (selected.prioValue > 2 && Math.hypot(selected.x - player.x, selected.y - player.y) > 150) {
                selected = null;
            }
        }

        if (selected) {
            if (inventoryFull && selected.rarity >= 3) {
                this.dropLowestValueItem(selected.rarity);
            }

// Check line of sight to pick the movement style
            if (this.hasCachedLineOfSightTo(selected) && this.canWalkSegment(player.x, player.y, selected.x, selected.y)) {
// With sight, walk straight over
                player.targetItem = selected;
                player.targetX = selected.x;
                player.targetY = selected.y;
            } else {
                // noline of sight，use A* pathing
                const pathPoint = this.findPathToTarget(selected.x, selected.y, selected);
                if (pathPoint) {
                    player.targetItem = selected;
                    player.targetX = pathPoint.x;
                    player.targetY = pathPoint.y;
                } else {
// A* found no path: give up on this item, blacklist for 30s
                    this.blacklistedTargets.push({ target: selected, until: Date.now() + 30000 });
                    player.targetItem = null;
                    player.targetX = null;
                    player.targetY = null;
                }
            }
            selected.prioValue = selected.prioValue; // Record the priority for the next comparison
        }
    },

// Drop the lowest-value inventory item (to make room for a higher rarity)
    dropLowestValueItem(targetRarity) {
        let lowestIdx = -1, lowestVal = Infinity;
        for (let i = 0; i < player.inventory.length; i++) {
            const it = player.inventory[i];
            if (!it) continue;
            // potions and scrolls are not dropped
            if (it.type === 'potion' || it.type === 'scroll') continue;
// Only items below the target rarity get dropped
            if (it.rarity < targetRarity) {
                const val = (it.rarity || 0) * 1000 + (it.def || 0) + (it.minDmg || 0);
                if (val < lowestVal) { lowestVal = val; lowestIdx = i; }
            }
        }
        if (lowestIdx >= 0) {
            const item = player.inventory[lowestIdx];
            player.inventory[lowestIdx] = null;
            groundItems.push({ ...item, x: player.x, y: player.y, dropTime: Date.now() });
            createFloatingText(player.x, player.y - 40, `Dropped ${item.name}`, '#888', 1.5);
            return true;
        }
        return false;
    },
};

// Auto-pickup settings toggle
function toggleAutoPickup(itemType) {
    let checkbox = null;
    if (itemType === 'gold') checkbox = cachedUI.chkAutoGold;
    else if (itemType === 'potion') checkbox = cachedUI.chkAutoPotion;
    else if (itemType === 'scroll') checkbox = cachedUI.chkAutoScroll;

    if (!checkbox) return;
    player.autoPickup[itemType] = checkbox.checked;
    SaveSystem.save();
    showNotification(`Auto-pickup ${itemType === 'gold' ? 'gold' : itemType === 'potion' ? 'potions' : 'scrolls'}: ${checkbox.checked ? 'on' : 'off'}`);
}
