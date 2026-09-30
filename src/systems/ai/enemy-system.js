// ========== enemy-system.js - Enemy system module ==========
// Covers monster frame config, boss config, elite affixes, boss skills and trait logic
// Global deps: player, enemies, projectiles, EnemyPool, AudioSys, particles, damageNumbers, slowMotion, I18N
// Global fn deps: createLevelUpBeam, triggerScreenShake, createDamageNumber, updateUI, checkPlayerDeath, createParticle, showNotification, isWall

// ========== Frame configuration ==========

// row 2:normal monstersframe index
const MONSTER_FRAMES = {
  'melee': 0,       // Fallen One
  'ranged': 1,      // Skeleton Archer
  'shaman': 2,      // Fallen One Shaman
  'zombie': 3,      // Zombie
  'skeleton': 4,    // Skeleton Warrior
  'ghost': 5,       // Ghost/Spectre
  'specter': 6,     // Lightning Spectre
  'mummy': 7,       // Mummy
  'vampire': 8      // Vampire
};

// No.3row:BOSSframe index
const BOSS_FRAMES = {
  'bloodRaven': 0,  // Blood Raven
  'countess': 1,    // the Countess
  'butcher': 2,     // the Butcher
  'duriel': 3,      // Treehead WoodFist
  'diablo': 4,      // Diablo
  'baal': 5         // Baal
};

// ========== Boss utility functions ==========

function syncBossSkillVisual(boss, action, duration) {
// Release keeps the wind-up facing; skills no longer snap-turn to track a moving player on hit.
  const previous = boss.bossSkillVisual;
  if (action === 'attack' && previous?.phase === 'cast') {
    boss.actionDirection = previous.direction;
    boss.actionDirectionTimer = duration;
  } else if (typeof setMonsterFacingToward === 'function') {
    setMonsterFacingToward(boss, player.x, player.y, duration);
  }
  boss.bossSkillVisual = {phase: action, timer: duration, duration,
    direction: boss.actionDirection || boss.facingDirection};
  if (typeof triggerMonsterAction === 'function') {
    triggerMonsterAction(boss, action, duration);
  }
}

function spawnBossTelegraph(effectId, x, y, scale = 1, rotation = 0) {
  if (typeof spawnVfxEffect === 'function') {
    spawnVfxEffect(effectId, x, y, scale, rotation);
  }
}

function startBossSkillWindup(boss, skillId, cooldown, data = {}) {
  if (boss.pendingSkill || boss.recoveryTimer > 0) return;
  const windup = data.windup || (skillId === 'groundSlam' ? .95 : .8);
  boss.pendingSkill = { id: skillId, timer: windup, duration: windup, data };
  if (typeof CombatTactics !== 'undefined') CombatTactics.bossStarted(boss, boss.pendingSkill);
  boss.skillCd = cooldown;
  syncBossSkillVisual(boss, 'cast', windup);
  spawnBossTelegraph('bossCastBurst', boss.x, boss.y, 1, 0);
  AudioSys.play('boss_cast');

// Danger zones draw straight from pendingSkill and vanish the same frame when interrupted.
}

function updateBossPendingSkill(boss, dt) {
  if (!boss.pendingSkill) return false;

  boss.pendingSkill.timer -= dt;
  if (boss.pendingSkill.timer > 0) return true;

  const pending = boss.pendingSkill;
  boss.pendingSkill = null;

  if (boss.dead || player.isDead) return true;

  if (pending.id === 'fireNova') {
    bossFireNova(boss, pending.data.radius, pending.data.damage);
  } else if (pending.id === 'groundSlam') {
    bossGroundSlam(boss);
  } else if (pending.id === 'summonMinions') {
    bossSummonMinions(boss);
  } else if (pending.id === 'breathAttack') {
    bossBreathAttack(boss, pending.data.angle);
  } else if (pending.id === 'tentacleAttack') {
    bossTentacleAttack(boss, pending.data.angle);
  }

  if (typeof CombatTactics !== 'undefined') CombatTactics.recover(boss, CombatTactics.rules.bossRecovery);
  return true;
}

// Strip difficulty prefixes (Nightmare/Hell/Torment etc.) shared by internal matching and lookups
function stripBossDifficultyPrefix(bossName) {
    return String(bossName).replace(/^(?:Nightmare|Hell|Torment\d*|Pesadilla|Infierno|地狱|噩梦)\s*/, '');
}

// Boss display names: keep the difficulty prefix as-is; the base name goes through the bestiary table
function bossDisplayName(bossName) {
    if (!bossName) return bossName;
    const base = stripBossDifficultyPrefix(bossName);
    return bossName.slice(0, bossName.length - base.length) + I18N.trPath('bestiary', base, 'name', base);
}

// Según nombre del Boss, obtener frameIndex
function getBossFrameIndex(bossName) {
  // Limpiar prefijos de dificultad
  const cleanName = stripBossDifficultyPrefix(bossName);

  const bossFrameMap = {
    // Canonical EN keys
    'Blood Raven': BOSS_FRAMES.bloodRaven,
    'The Countess': BOSS_FRAMES.countess,
    'The Butcher': BOSS_FRAMES.butcher,
    'Treehead WoodFist': BOSS_FRAMES.duriel,
    'Diablo': BOSS_FRAMES.diablo,
    'Baal': BOSS_FRAMES.baal,
    // Legacy ES fallbacks (old saves / old spawn names)
    'Cuervo Sangriento': BOSS_FRAMES.bloodRaven,
    'La Condesa': BOSS_FRAMES.countess,
    'El Carnicero': BOSS_FRAMES.butcher,
    'Puño de Madera': BOSS_FRAMES.duriel
  };

  return bossFrameMap[cleanName] || BOSS_FRAMES.bloodRaven;
}

// Configuración Base de Bosses
const BASE_BOSS_MAP = {
  2: { name: 'Blood Raven', hp: 400, dmg: 30, xp: 1000 },
  4: { name: 'The Countess', hp: 1000, dmg: 50, xp: 2000 },
  5: { name: 'The Butcher', hp: 1400, dmg: 65, xp: 2500 },
  7: { name: 'Treehead WoodFist', hp: 2800, dmg: 75, xp: 3000 },
  9: { name: 'Diablo', hp: 5000, dmg: 95, xp: 5000 },
  10: { name: 'Baal', hp: 6000, dmg: 120, xp: 8000 }
};

// Obtener información de generación de Boss
function getBossSpawnInfo(floor) {
  const cycle = Math.floor((floor - 1) / 10);
  const baseFloor = ((floor - 1) % 10) + 1;

  const config = BASE_BOSS_MAP[baseFloor];
  if (!config) return null;

  const hpMult = 1 + cycle * 1.5;
  const dmgMult = 1 + cycle * 0.6;
  const xpMult = 1 + cycle * 1.0;

  let prefix = "";
  if (cycle === 1) prefix = "Nightmare ";
  else if (cycle === 2) prefix = "Hell ";
  else if (cycle >= 3) prefix = "Torment " + (cycle - 2) + " ";

  return {
    name: prefix + config.name,
    originalName: config.name,
    hp: Math.floor(config.hp * hpMult),
    dmg: Math.floor(config.dmg * dmgMult),
    xp: Math.floor(config.xp * xpMult),
    speed: 90 + Math.min(cycle * 10, 100),
    cycle: cycle
  };
}

// ========== Boss Configuración y Presets ==========

const BOSS_AFFIX_PRESETS = {
  // Canonical EN keys
  'Blood Raven': {
    ai: 'ranged',
    affixes: ['multiple_shot'],
    bossTraits: { multiShot: 5, poisonOnHit: true, poisonDamage: 0.3 }
  },
  'The Countess': {
    ai: 'specter',
    affixes: ['fire_enchanted'],
    bossTraits: { canTeleport: true, teleportCooldown: 5, fireNovaOnTeleport: true }
  },
  'The Butcher': {
    ai: 'vampire',
    affixes: ['vampiric', 'extra_strong'],
    bossTraits: { dashDistance: 250, enrageThreshold: 0.3, enrageSpeedMult: 1.5, enrageDmgMult: 1.3 }
  },
  'Treehead WoodFist': {
    ai: 'chase',
    affixes: ['stone_skin'],
    bossTraits: { canSummon: true, summonCooldown: 12, summonCount: 2, groundSlam: true, slamCooldown: 6, slamRadius: 180 }
  },
  'Diablo': {
    ai: 'chase',
    affixes: ['lightning_enchanted', 'fire_enchanted'],
    bossTraits: { breathAttack: true, breathCooldown: 4, breathAngle: 60, breathRange: 220 }
  },
  'Baal': {
    ai: 'chase',
    affixes: ['cold_enchanted'],
    bossTraits: { freezeRadius: 150, freezeDuration: 1.0, tentacleAttack: true, tentacleCooldown: 6, tentacleCount: 4 }
  },
  // Legacy ES fallbacks
  'Cuervo Sangriento': { ai: 'ranged', affixes: ['multiple_shot'], bossTraits: { multiShot: 5, poisonOnHit: true, poisonDamage: 0.3 } },
  'La Condesa': { ai: 'specter', affixes: ['fire_enchanted'], bossTraits: { canTeleport: true, teleportCooldown: 5, fireNovaOnTeleport: true } },
  'El Carnicero': { ai: 'vampire', affixes: ['vampiric', 'extra_strong'], bossTraits: { dashDistance: 250, enrageThreshold: 0.3, enrageSpeedMult: 1.5, enrageDmgMult: 1.3 } },
  'Puño de Madera': { ai: 'chase', affixes: ['stone_skin'], bossTraits: { canSummon: true, summonCooldown: 12, summonCount: 2, groundSlam: true, slamCooldown: 6, slamRadius: 180 } }
};

// freeze damage 1.5x, freeze 0.8s
const BOSS_AFFIX_MULTIPLIERS = {
  fire_enchanted: { fireDmgMult: 1.5, explosionMult: 2.0 },  // fire damage 1.5x, explosion 2x
  cold_enchanted: { coldDmgMult: 1.5, freezeTime: 0.8 },     // freeze damage 1.5x, freeze 0.8s
  lightning_enchanted: { lightningDmgMult: 1.5 },
  vampiric: { lifeStealMult: 1.0 },       // life leech 50% -> 50%（keep）
  stone_skin: { reductionMult: 1.2 },     // lessenwound 50% -> 60%
  multiple_shot: { arrowCount: 5 },       // arrow 3 -> 5
  extra_strong: { dmgMult: 2.5 }          // damage 2x -> 2.5x
};

// Apply boss special traits
function applyBossTraits(boss, bossName, baseDmg) {
  const traits = boss.bossTraits || {};

  // base attribute adjustment
  if (traits.canTeleport) boss.canTeleport = true;
  if (traits.multiShot) boss.multiShot = traits.multiShot;
  if (traits.poisonOnHit) {
    boss.poisonOnHit = true;
    boss.poisonDamage = (traits.poisonDamage || 0.3) * baseDmg;
  }

  // skillcooldownInit
  if (traits.teleportCooldown) boss.teleportCdMax = traits.teleportCooldown;
  if (traits.summonCooldown) boss.summonCdMax = traits.summonCooldown;
  if (traits.slamCooldown) boss.slamCdMax = traits.slamCooldown;
  if (traits.breathCooldown) boss.breathCdMax = traits.breathCooldown;
  if (traits.tentacleCooldown) boss.tentacleCdMax = traits.tentacleCooldown;

  // Custom Traits Matching
  if (bossName.includes('Puño de Madera') || bossName.includes('Treehead WoodFist')) boss.slamRadius = traits.slamRadius;
  if (bossName.includes('El Carnicero') || bossName.includes('The Butcher')) boss.dashDistance = traits.dashDistance;
  if (bossName.includes('Diablo') || bossName.includes('Diablo')) {
    boss.breathAngle = traits.breathAngle;
    boss.breathRange = traits.breathRange;
  }
  if (bossName.includes('Baal') || bossName.includes('Baal')) boss.tentacleCount = traits.tentacleCount;

  boss.skillCd = 2 + Math.random() * 2;
}

// Actualizar habilidades de Boss
function updateBossSkills(boss, dt) {
  if (player.isDead || boss.recoveryTimer > 0) return;
  if (updateBossPendingSkill(boss, dt)) return;

  // Lógica de Furia de El Carnicero / Butcher
  if ((boss.name.includes('El Carnicero') || boss.name.includes('The Butcher')) && !boss.enraged) {
    if (boss.hp < boss.maxHp * 0.3) {
      boss.enraged = true;
      boss.speed *= 1.5;
      boss.dmg *= 1.3;
      showNotification(`${boss.name} enters Enrage!`);
      createParticle(boss.x, boss.y, '#ff0000', 20);
      boss.color = '#ff0000'; // turn red
    }
  }

// Teleport when the player is too far
  if (boss.skillCd > 0) {
    boss.skillCd -= dt;
    return;
  }

  const dist = Math.hypot(player.x - boss.x, player.y - boss.y);

// spawn VFX
  if (boss.canTeleport && dist > 250) { // Treehead WoodFist quake wave
    boss.x = player.x + (Math.random() - 0.5) * 100;
    boss.y = player.y + (Math.random() - 0.5) * 100;
    createParticle(boss.x, boss.y, '#ff4400', 10); // spawn VFX
    if (boss.bossTraits && boss.bossTraits.fireNovaOnTeleport) {
      startBossSkillWindup(boss, 'fireNova', boss.teleportCdMax || 5, {
        telegraph: 'circle',
        radius: 150,
        damage: boss.dmg * 0.8
      });
    } else {
      boss.skillCd = boss.teleportCdMax || 5;
    }
    showNotification(`${boss.name} used Teleport!`);
    return;
  }

// Diablo breath
  if (boss.bossTraits && boss.bossTraits.groundSlam && dist < 120) {
    startBossSkillWindup(boss, 'groundSlam', boss.slamCdMax || 6, {
      telegraph: 'circle',
      radius: boss.slamRadius || 150
    });
    return;
  }

// Baal tentacles
  if (boss.bossTraits && boss.bossTraits.canSummon && Math.random() < 0.3) {
    startBossSkillWindup(boss, 'summonMinions', boss.summonCdMax || 12);
    return;
  }

// ========== Boss skill implementations ==========
  if (boss.bossTraits && boss.bossTraits.breathAttack && dist < 200 && dist > 50) {
    const angleToPlayer = Math.atan2(player.y - boss.y, player.x - boss.x);
    startBossSkillWindup(boss, 'breathAttack', boss.breathCdMax || 4, {
      telegraph: 'cone',
      angle: angleToPlayer,
      range: boss.breathRange || 200
    });
    return;
  }

  // Baaltouchhand
  if (boss.bossTraits && boss.bossTraits.tentacleAttack) {
    const angleToPlayer = Math.atan2(player.y - boss.y, player.x - boss.x);
    startBossSkillWindup(boss, 'tentacleAttack', boss.tentacleCdMax || 6, {
      telegraph: 'line',
      angle: angleToPlayer,
      range: 240
    });
    return;
  }
}

// Flame particle effect

// Boss skill:flamenewstar
function bossFireNova(boss, radius, damage) {
  syncBossSkillVisual(boss, 'attack', 0.45);

  const dist = Math.hypot(player.x - boss.x, player.y - boss.y);
  if (dist < radius && player.invincibleTimer <= 0) {
    const fireDmg = damage * (1 - player.resistances.fire / 100);
    player.hp -= fireDmg;
    player.lastDamageSource = boss.name + "'s Flame Nova";
    player.invincibleTimer = 0.3;
    createDamageNumber(player.x, player.y - 30, Math.floor(fireDmg), '#ff4400');
    updateUI(); checkPlayerDeath();
  }
// Slow 1 second
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    createParticle(boss.x + Math.cos(angle) * radius * 0.7, boss.y + Math.sin(angle) * radius * 0.7, '#ff4400', 8);
  }
  showNotification(`${boss.name} unleashed a Flame Nova!`);
}

// Earthquake particles
function bossGroundSlam(boss) {
  syncBossSkillVisual(boss, 'attack', 0.55);

  const radius = boss.slamRadius || 150;
  const dist = Math.hypot(player.x - boss.x, player.y - boss.y);
  if (dist < radius && player.invincibleTimer <= 0) {
    const slamDmg = boss.dmg * 0.8;
    player.hp -= slamDmg;
    player.lastDamageSource = boss.name + "'s Quake Wave";
    player.invincibleTimer = 0.5;
    player.slowedTimer = 1.0; // slow 1 second
    createDamageNumber(player.x, player.y - 30, Math.floor(slamDmg), '#8b4513');
    updateUI(); checkPlayerDeath();
  }
// Avoid spawning inside walls
  for (let i = 0; i < 25; i++) {
    const angle = (i / 25) * Math.PI * 2;
    const r = radius * (0.3 + Math.random() * 0.7);
    createParticle(boss.x + Math.cos(angle) * r, boss.y + Math.sin(angle) * r, '#8b4513', 6);
  }
  showNotification(`${boss.name} unleashed a Quake Wave!`);
  AudioSys.play('hit');
}

// Use skeleton frames
function bossSummonMinions(boss) {
  syncBossSkillVisual(boss, 'attack', 0.65);

  const count = boss.summonCount || 2;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const spawnDist = 60 + Math.random() * 40;
    let x = boss.x + Math.cos(angle) * spawnDist;
    let y = boss.y + Math.sin(angle) * spawnDist;

// Mark as a summon; not counted in kill stats
    if (isWall(x, y)) continue;

    const minion = EnemyPool.acquire({
      x, y,
      hp: Math.floor(boss.maxHp * 0.1),
      maxHp: Math.floor(boss.maxHp * 0.1),
      dmg: Math.floor(boss.dmg * 0.4),
      speed: 100,
      radius: 12,
      dead: false,
      cooldown: 0,
      name: I18N.trPath('bestiary', 'Summon', 'name', 'Summon'),
      ai: 'chase',
      xpValue: 20,
      frameIndex: 0, // Summon VFX
      isSummon: true // Boss skill: breath attack (cone)
    });
    enemies.push(minion);
    // summonVFX
    for (let j = 0; j < 5; j++) createParticle(x, y, '#00ff00', 5);
  }
  showNotification(`${boss.name} summoned reinforcements!`);
}

// Check whether the player is inside the cone
function bossBreathAttack(boss, lockedAngle) {
  syncBossSkillVisual(boss, 'attack', 0.6);

  const range = boss.breathRange || 200;
  const halfAngle = (boss.breathAngle || 60) * Math.PI / 360; // Breath particles (cone)
  const angleToPlayer = typeof lockedAngle === 'number' ? lockedAngle : Math.atan2(player.y - boss.y, player.x - boss.x);

  const dist = Math.hypot(player.x - boss.x, player.y - boss.y);
  if (dist < range && player.invincibleTimer <= 0) {
// Boss skill: tentacle attack
    const playerAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
    let angleDiff = Math.abs(playerAngle - angleToPlayer);
    if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

    if (angleDiff <= halfAngle) {
      const breathDmg = boss.dmg * 1.2 * (1 - player.resistances.lightning / 100);
      player.hp -= breathDmg;
      player.lastDamageSource = boss.name + "'s Breath";
      player.invincibleTimer = 0.4;
      createDamageNumber(player.x, player.y - 30, Math.floor(breathDmg), '#ffff00');
      updateUI(); checkPlayerDeath();
    }
  }

// Cone distribution
  for (let i = 0; i < 15; i++) {
    const a = angleToPlayer + (Math.random() - 0.5) * halfAngle * 2;
    const r = range * (0.3 + Math.random() * 0.7);
    createParticle(boss.x + Math.cos(a) * r, boss.y + Math.sin(a) * r, '#ffff00', 6);
  }
  showNotification(`${boss.name} breathed Lightning Breath!`);
  AudioSys.play('thunder');
}

// Create tentacle projectiles
function bossTentacleAttack(boss, lockedAngle) {
  syncBossSkillVisual(boss, 'attack', 0.5);

  const count = boss.tentacleCount || 4;
  const baseAngle = typeof lockedAngle === 'number' ? lockedAngle : Math.atan2(player.y - boss.y, player.x - boss.x);

  for (let i = 0; i < count; i++) {
    const angle = baseAngle + (i - (count - 1) / 2) * 0.3; // Mark as tentacle
// Tentacle particles
    projectiles.push({
      x: boss.x,
      y: boss.y,
      angle: angle,
      speed: 180,
      life: 1.5,
      damage: boss.dmg * 0.6,
      color: '#9966ff',
      owner: boss,
      sourceName: boss.name,
      type: 'tentacle',
      isTentacle: true // markerin order totouchhand
    });
  }
// Start slow motion
  for (let i = 0; i < 10; i++) createParticle(boss.x, boss.y, '#9966ff', 5);
  showNotification(`${boss.name} unleashed Tentacles!`);
}

// Boss death VFX: slow motion + key light pillar + kill number
function triggerBossDeathEffect(boss, damage) {
  // startslow motion
  slowMotion.active = true;
  slowMotion.timer = 0.8;  // 0.8secondslow motion
  slowMotion.scale = 0.15; // 15%speed（un-oftenslow）

// Giant font
  triggerScreenShake(20, 0.6);

  AudioSys.play('boss_death');

// Boss name display
  damageNumbers.push({
    x: boss.x,
    y: boss.y - 50,
    val: `💀 ${Math.floor(damage)} 💀`,
    color: '#ff0000',
    life: 2.5,
    fontSize: 48, // giantbigfont
    vx: (Math.random() - 0.5) * 30,
    vy: -80,
    gravity: 60
  });

// Fixed to match game.js
  damageNumbers.push({
    x: boss.x,
    y: boss.y - 100,
    val: `⚔️ ${bossDisplayName(boss.name)} has been defeated ⚔️`,
    color: '#ffd700',
    life: 3.0,
    fontSize: 28, // fixin order tomatching game.js
    vx: 0,
    vy: -30,      // fixin order tomatching game.js
    gravity: 0    // fixin order tomatching game.js
  });

// Fire explosion
  particles.push({
    type: 'drop_beam',
    x: boss.x,
    y: boss.y,
    color: '#ff4400',
    glowColor: 'rgba(255, 68, 0, 0.6)',
    life: 1.5,
    maxLife: 1.5,
    height: 400,
    width: 80,
    isUnique: true
  });


}

// ========== Elite affix system ==========

const ELITE_AFFIXES = [
  {
    id: 'extra_fast',
    name: 'Extra Fast',
    color: '#00ffff',
    icon: 'speed',
    threatTag: 'mobility',
    description: 'Move speed +50%',
    applyStats: (enemy) => {
      enemy.speed *= 1.5;
    }
  },
  {
    id: 'extra_strong',
    name: 'Extra Strong',
    color: '#ff4400',
    icon: 'power',
    threatTag: 'burst',
    description: 'Damage +100%',
    applyStats: (enemy) => {
      enemy.dmg *= 2.0;
    }
  },
  {
    id: 'fire_enchanted',
    name: 'Fire Enchanted',
    color: '#ff6600',
    icon: 'fire',
    threatTag: 'elemental',
    description: 'Attacks deal fire damage; explodes on death',
    applyStats: (enemy) => {
      enemy.elementalDmg = enemy.elementalDmg || {};
      enemy.elementalDmg.fire = Math.floor(enemy.dmg * 0.5);
    },
    onDeath: (enemy) => {
// 0.3s invincibility frames
      const explosionRadius = 150;
// Explosion particle effect
      const explosionDamage = Math.min(enemy.maxHp * 0.15, 200);
      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      if (dist < explosionRadius && player.invincibleTimer <= 0) {
        const dmg = explosionDamage * (1 - dist / explosionRadius);
        const finalDmg = dmg * (1 - player.resistances.fire / 100);
        player.hp -= finalDmg;
        player.lastDamageSource = enemy.name + "'s Flame Blast";
        player.invincibleTimer = 0.3;  // 50% life leech
        createDamageNumber(player.x, player.y - 30, Math.floor(finalDmg), '#ff4400');
        showNotification('Flame blast!');
        updateUI(); checkPlayerDeath();
      }
// The affix zh name is the eliteAffixes lookup key: cache the original first; name/desc resolve only on module load and
      for (let i = 0; i < 20; i++) {
        createParticle(enemy.x, enemy.y, '#ff4400', 10);
      }
    }
  },
  {
    id: 'cold_enchanted',
    name: 'Cold Enchanted',
    color: '#00aaff',
    icon: 'cold',
    threatTag: 'control',
    description: 'Attacks can freeze the target',
    applyStats: (enemy) => {
      enemy.elementalDmg = enemy.elementalDmg || {};
      enemy.elementalDmg.cold = Math.floor(enemy.dmg * 0.4);
      enemy.freezeOnHit = true;
    }
  },
  {
    id: 'lightning_enchanted',
    name: 'Lightning Enchanted',
    color: '#ffff00',
    icon: 'lightning',
    threatTag: 'elemental',
    description: 'Attacks deal lightning damage',
    applyStats: (enemy) => {
      enemy.elementalDmg = enemy.elementalDmg || {};
      enemy.elementalDmg.lightning = Math.floor(enemy.dmg * 0.6);
    }
  },
  {
    id: 'stone_skin',
    name: 'Stone Skin',
    color: '#888888',
    icon: 'armor',
    threatTag: 'defense',
    description: 'Takes 50% less damage',
    applyStats: (enemy) => {
      enemy.damageReduction = 0.5;
    }
  },
  {
    id: 'magic_resistant',
    name: 'Magic Resistant',
    color: '#aa00ff',
    icon: 'resist',
    threatTag: 'defense',
    description: 'Takes 70% less damage from skills',
    applyStats: (enemy) => {
      enemy.magicResist = 0.7;
    }
  },
  {
    id: 'vampiric',
    name: 'Vampiric',
    color: '#cc0000',
    icon: 'leech',
    threatTag: 'sustain',
    description: 'Heals itself on hit',
    applyStats: (enemy) => {
      enemy.lifeSteal = 0.5;  // 50%life leech
    }
  },
  {
    id: 'mana_burn',
    name: 'Mana Burn',
    color: '#0066ff',
    icon: 'mana',
    threatTag: 'resource',
    description: 'Its attacks drain your mana',
    applyStats: (enemy) => {
      enemy.manaBurn = true;
    }
  },
  {
    id: 'cursed',
    name: 'Cursed',
    color: '#9900cc',
    icon: 'curse',
    threatTag: 'debuff',
    description: 'Lowers your Defense',
    applyStats: (enemy) => {
      enemy.cursed = true;
      enemy.curseArmorBreak = 0.25;
      enemy.curseDamageTakenMult = 1.2;
      enemy.curseDuration = 3.0;
    }
  },
  {
    id: 'multiple_shot',
    name: 'Multishot',
    color: '#ffaa00',
    icon: 'volley',
    threatTag: 'projectile',
    description: 'Ranged monsters fire 3 arrows',
    applyStats: (enemy) => {
      enemy.multiShot = 3;
      if (enemy.ai !== 'ranged') enemy.scatterVolley = true;
    }
  },
  {
    id: 'spectral_hit',
    name: 'Spectral Hit',
    color: '#00ffaa',
    icon: 'spectral',
    threatTag: 'pierce',
    description: 'Ignores armor',
    applyStats: (enemy) => {
      enemy.ignoreArmor = true;
    }
  }
];

// The affix zh name is the eliteAffixes lookup key: cache the original first; name/desc resolve only on module load and
// Resolved once on language switch; game.js per-frame drawing reads the localized fields directly.
const ELITE_AFFIX_ZH_LABELS = ELITE_AFFIXES.map(affix => ({ name: affix.name, description: affix.description }));

function refreshEliteAffixLabels() {
    const hasI18N = typeof I18N !== 'undefined';
    ELITE_AFFIXES.forEach((affix, i) => {
        const zh = ELITE_AFFIX_ZH_LABELS[i];
        affix.name = hasI18N ? I18N.trPath('eliteAffixes', zh.name, 'name', zh.name) : zh.name;
        affix.description = hasI18N ? I18N.trPath('eliteAffixes', zh.name, 'desc', zh.description) : zh.description;
    });
}
refreshEliteAffixLabels();
if (typeof I18N !== 'undefined' && typeof I18N.onChange === 'function') {
    I18N.onChange(refreshEliteAffixLabels);
}
