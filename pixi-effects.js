// ========== pixi-effects.js - PixiJS enhanced VFX system ==========
// Version: 1.0 | Depends on: pixi.min.js (v7.4)
// Purpose: WebGL-accelerated particle VFX layered on top of Canvas 2D rendering

const PixiEffects = {
  app: null,
  container: null,
  particles: [],
  textures: {},
  cameraX: 0,
  cameraY: 0,
  initialized: false,

  // Init the PixiJS application
  init(gameContainer, width, height) {
    if (typeof PIXI === 'undefined') {
      console.warn('PixiJS not loaded, effects disabled');
      return false;
    }

    try {
      // Create the PixiJS application
      this.app = new PIXI.Application({
        width: width,
        height: height,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
      });

      // Set canvas style
      this.app.view.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 10;
            `;

      // Add to game container
      gameContainer.appendChild(this.app.view);

      // Create particle container
      this.container = new PIXI.Container();
      this.app.stage.addChild(this.container);

      // Pre-generate textures
      this.createTextures();

      // Set update loop
      this.app.ticker.add(() => this._update());

      this.initialized = true;
      console.log('PixiEffects initialized');
      return true;
    } catch (e) {
      console.error('PixiEffects init failed:', e);
      return false;
    }
  },

  // Pre-generate textures
  createTextures() {
    const g = new PIXI.Graphics();

    // Circular particle
    g.beginFill(0xffffff);
    g.drawCircle(16, 16, 16);
    g.endFill();
    this.textures.circle = this.app.renderer.generateTexture(g);

    // Glow texture
    g.clear();
    const gradientRadius = 32;
    for (let i = gradientRadius; i > 0; i--) {
      const alpha = 1 - (i / gradientRadius);
      g.beginFill(0xffffff, alpha * 0.5);
      g.drawCircle(32, 32, i);
      g.endFill();
    }
    this.textures.glow = this.app.renderer.generateTexture(g);

    // Flame texture
    g.clear();
    g.beginFill(0xffffff);
    g.moveTo(8, 0);
    g.lineTo(16, 16);
    g.lineTo(8, 14);
    g.lineTo(0, 16);
    g.closePath();
    g.endFill();
    this.textures.flame = this.app.renderer.generateTexture(g);

    // Spark texture
    g.clear();
    g.beginFill(0xffffff);
    g.drawRect(0, 0, 4, 4);
    g.endFill();
    this.textures.spark = this.app.renderer.generateTexture(g);

    // Slash arc texture
    g.clear();
    g.lineStyle(4, 0xffffff);
    g.arc(16, 16, 14, -0.8, 0.8);
    this.textures.slash = this.app.renderer.generateTexture(g);

    g.destroy();
  },

  // Sync camera
  syncCamera(x, y) {
    this.cameraX = x;
    this.cameraY = y;
  },

  // Resize
  resize(width, height) {
    if (this.app && this.app.renderer) {
      this.app.renderer.resize(width, height);
    }
  },

  // Update loop
  _update() {
    const dt = this.app.ticker.deltaMS / 1000;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Update lifecycle
      p.life -= dt;
      if (p.life <= 0) {
        this.container.removeChild(p.sprite);
        p.sprite.destroy();
        this.particles.splice(i, 1);
        continue;
      }

      // Run custom update logic
      if (p.onUpdate) {
        p.onUpdate(p, dt);
      } else {
        // Default physics
        if (p.vx !== undefined) p.x += p.vx * dt;
        if (p.vy !== undefined) p.y += p.vy * dt;
        if (p.gravity) p.vy += p.gravity * dt;
      }

      // Update sprite positions (world coords to screen coords)
      p.sprite.x = p.x - this.cameraX;
      p.sprite.y = p.y - this.cameraY;

      // Update opacity
      const lifeRatio = p.life / p.maxLife;
      p.sprite.alpha = p.fadeOut ? (p.targetAlpha || 1) * lifeRatio : (p.targetAlpha || 1);

      // Update scale
      if (p.scaleDecay) {
        p.sprite.scale.set(p.sprite.scale.x * (1 - p.scaleDecay * dt));
      }
    }
  },

  // Get particle count
  getParticleCount() {
    return this.particles.length;
  },

  // Create particle
  _createParticle(options) {
    const texture = this.textures[options.texture] || this.textures.circle;
    const sprite = new PIXI.Sprite(texture);

    sprite.anchor.set(options.anchorX !== undefined ? options.anchorX : 0.5, options.anchorY !== undefined ? options.anchorY : 0.5);
    sprite.x = options.x - this.cameraX;
    sprite.y = options.y - this.cameraY;
    sprite.scale.set(options.scale || 0.2);
    sprite.tint = options.color || 0xffffff;
    sprite.alpha = options.alpha !== undefined ? options.alpha : 1;
    sprite.blendMode = options.blendMode || PIXI.BLEND_MODES.ADD;
    if (options.rotation !== undefined) sprite.rotation = options.rotation;

    this.container.addChild(sprite);

    const particle = {
      sprite,
      x: options.x,
      y: options.y,
      vx: options.vx || 0,
      vy: options.vy || 0,
      gravity: options.gravity || 0,
      life: options.life || 1,
      maxLife: options.life || 1,
      fadeOut: options.fadeOut !== false,
      scaleDecay: options.scaleDecay || 0,
      onUpdate: options.onUpdate,
      targetAlpha: options.alpha !== undefined ? options.alpha : 1
    };

    this.particles.push(particle);
    return particle;
  },

  // Slash arc
  slashEffect(x, y, angle, radius, isCrit) {
    if (!this.initialized) return;

    this._createParticle({
      x, y, texture: 'slash',
      color: isCrit ? 0xffdd00 : 0xffffff,
      scale: radius / 16, // Scale by radius (original texture ~32px)
      rotation: angle,
      life: 0.15,
      fadeOut: true,
      alpha: 0.8
    });

    if (isCrit) {
      this._createParticle({
        x, y, texture: 'glow',
        color: 0xffdd00,
        scale: 0.8,
        life: 0.1,
        fadeOut: true
      });
    }
  },

  // Flying pickup particle
  flyingPickup(startX, startY, type, item, targetPlayer) {
    if (!this.initialized) return;

    let color = 0xffd700;
    if (type === 'potion') color = item.heal ? 0xff4444 : 0x4499ff;
    else if (type === 'scroll') color = 0xaaaaff;

    const controlX1 = startX + (startX - targetPlayer.x) / 2 + (Math.random() - 0.5) * 60;
    const controlY1 = startY - 50 - Math.random() * 30;
    const controlX2 = targetPlayer.x + (Math.random() - 0.5) * 30;
    const controlY2 = targetPlayer.y - 40;

    this._createParticle({
      x: startX, y: startY,
      texture: 'circle',
      color: color,
      scale: type === 'gold' ? 0.1 : 0.15,
      life: 0.3 + Math.random() * 0.1,
      alpha: 1.0,
      onUpdate: (p, dt) => {
        p.elapsed = (p.elapsed || 0) + dt;
        const t = Math.min(1, p.elapsed / p.maxLife);

        // Bezier curve
        const it = 1 - t;
        p.x = it ** 3 * startX + 3 * it ** 2 * t * controlX1 + 3 * it * t ** 2 * controlX2 + t ** 3 * targetPlayer.x;
        p.y = it ** 3 * startY + 3 * it ** 2 * t * controlY1 + 3 * it * t ** 2 * controlY2 + t ** 3 * (targetPlayer.y - 30);

        // Shrink gradually and fly to the target
        p.sprite.scale.set(p.sprite.scale.x * (1 - 0.5 * dt));
      }
    });

    // Core highlight
    this._createParticle({
      x: startX, y: startY,
      texture: 'circle',
      color: 0xffffff,
      scale: 0.05,
      life: 0.3,
      alpha: 0.8,
      onUpdate: (p, dt) => {
        p.elapsed = (p.elapsed || 0) + dt;
        const t = Math.min(1, p.elapsed / p.maxLife);
        const it = 1 - t;
        p.x = it ** 3 * startX + 3 * it ** 2 * t * controlX1 + 3 * it * t ** 2 * controlX2 + t ** 3 * targetPlayer.x;
        p.y = it ** 3 * startY + 3 * it ** 2 * t * controlY1 + 3 * it * t ** 2 * controlY2 + t ** 3 * (targetPlayer.y - 30);
      }
    });
  },

  // ========== VFX functions ==========

  // Fireball explosion
  fireballExplosion(x, y, level) {
    if (!this.initialized) return;

    const count = 15 + level * 2;
    const radius = 50 + (level - 5) * 10;

    // Core flash
    this._createParticle({
      x, y, texture: 'glow',
      color: 0xffff00, scale: 1.5,
      life: 0.3, scaleDecay: 3
    });

    // Flame particles
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.3;
      const speed = radius * (0.8 + Math.random() * 0.4);
      const colors = [0xff4400, 0xff6600, 0xff8800, 0xffaa00];

      this._createParticle({
        x, y, texture: 'flame',
        color: colors[Math.floor(Math.random() * colors.length)],
        scale: 0.3 + Math.random() * 0.2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * 0.2,
        scaleDecay: 2
      });
    }

    // Sparks
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 150;

      this._createParticle({
        x, y, texture: 'spark',
        color: 0xffff00,
        scale: 0.15,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        gravity: 200,
        life: 0.5 + Math.random() * 0.3
      });
    }
  },

  // Lightning impact
  lightningImpact(x, y) {
    if (!this.initialized) return;

    // Center flash
    this._createParticle({
      x, y, texture: 'glow',
      color: 0xffffff, scale: 1.2,
      life: 0.2, scaleDecay: 5
    });

    // Arc particles
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 / 12) * i;
      const speed = 150 + Math.random() * 100;

      this._createParticle({
        x, y, texture: 'spark',
        color: 0x88ccff,
        scale: 0.2,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 100,
        vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 100,
        life: 0.2 + Math.random() * 0.1
      });
    }
  },

  // Crit
  criticalHit(x, y) {
    if (!this.initialized) return;

    // Gold burst
    this._createParticle({
      x, y, texture: 'glow',
      color: 0xffd700, scale: 0.8,
      life: 0.25, scaleDecay: 4
    });

    // Radiating light dots
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const speed = 120;

      this._createParticle({
        x, y, texture: 'circle',
        color: 0xffff00,
        scale: 0.1,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.2
      });
    }
  },

  // Kill effect
  killEffect(x, y, color = 0xff4444) {
    if (!this.initialized) return;

    // Blood mist burst
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 80;

      this._createParticle({
        x, y, texture: 'circle',
        color: color,
        scale: 0.15 + Math.random() * 0.1,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        gravity: 100,
        life: 0.4 + Math.random() * 0.2
      });
    }
  },

  // Healing effect
  healEffect(x, y) {
    if (!this.initialized) return;

    // Green rising light dots
    for (let i = 0; i < 12; i++) {
      this._createParticle({
        x: x + (Math.random() - 0.5) * 40,
        y: y + Math.random() * 20,
        texture: 'circle',
        color: 0x00ff88,
        scale: 0.12,
        vy: -80 - Math.random() * 60,
        life: 0.8 + Math.random() * 0.4
      });
    }
  },

  // Gold pickup
  goldPickup(x, y) {
    if (!this.initialized) return;

    // Gold sparks
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 40;

      this._createParticle({
        x, y, texture: 'spark',
        color: 0xffd700,
        scale: 0.15,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        gravity: 150,
        life: 0.3 + Math.random() * 0.2
      });
    }
  },

  // Level-up effect
  levelUpEffect(x, y) {
    if (!this.initialized) return;

    // Gold light pillar
    this._createParticle({
      x, y: y - 100, texture: 'glow',
      color: 0xffd700, scale: 2,
      life: 1, scaleDecay: 0.5
    });

    // Bottom aura
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 / 20) * i;
      const radius = 60;

      this._createParticle({
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius * 0.3,
        texture: 'circle',
        color: 0xffd700,
        scale: 0.15,
        vx: Math.cos(angle) * 30,
        vy: -100 - Math.random() * 50,
        life: 0.8 + Math.random() * 0.4
      });
    }
  },

  // ========== Generic particle functions (for migrating Canvas particles) ==========

// Generic hit particles (replaces createImpactParticles)
  impactParticles(x, y, color, count = 5) {
    if (!this.initialized) return;

    const hexColor = this._parseColor(color);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 80;

      this._createParticle({
        x, y, texture: 'circle',
        color: hexColor,
        scale: 0.08 + Math.random() * 0.06,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        gravity: 300,
        life: 0.4 + Math.random() * 0.3
      });
    }
  },

  // Generic single particle
  simpleParticle(x, y, color, vx, vy, life = 0.5, size = 3, gravity = 0) {
    if (!this.initialized) return;

    this._createParticle({
      x, y, texture: 'circle',
      color: this._parseColor(color),
      scale: size / 16,
      vx, vy, gravity,
      life, fadeOut: true
    });
  },

// Generic Nova effect (replaces createNovaEffect)
  novaEffect(x, y, color, count = 12) {
    if (!this.initialized) return;

    const hexColor = this._parseColor(color);

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i;
      const speed = 150;

      this._createParticle({
        x, y, texture: 'circle',
        color: hexColor,
        scale: 0.12,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.5
      });
    }
  },

  // Fireball trail particles
  fireballTrail(x, y) {
    if (!this.initialized) return;

    const colors = [0xff4400, 0xff6600, 0xff8800];

    this._createParticle({
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      texture: 'flame',
      color: colors[Math.floor(Math.random() * colors.length)],
      scale: 0.15 + Math.random() * 0.1,
      vx: (Math.random() - 0.5) * 30,
      vy: (Math.random() - 0.5) * 30,
      life: 0.3 + Math.random() * 0.2,
      scaleDecay: 3
    });
  },

  // Frost particles
  frostParticles(x, y, count = 8) {
    if (!this.initialized) return;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 50;

      this._createParticle({
        x, y, texture: 'spark',
        color: 0x88ccff,
        scale: 0.1 + Math.random() * 0.08,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        gravity: 50,
        life: 0.6 + Math.random() * 0.4
      });
    }
  },

  // Poison cloud particles
  poisonParticles(x, y, count = 6) {
    if (!this.initialized) return;

    for (let i = 0; i < count; i++) {
      this._createParticle({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 30,
        texture: 'glow',
        color: 0x33ff33,
        scale: 0.2 + Math.random() * 0.15,
        vx: (Math.random() - 0.5) * 20,
        vy: -30 - Math.random() * 20,
        life: 0.5 + Math.random() * 0.3,
        scaleDecay: 1.5
      });
    }
  },

  // Lightning chain particles
  lightningChain(x1, y1, x2, y2) {
    if (!this.initialized) return;

    const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const count = Math.floor(dist / 20);

    for (let i = 0; i < count; i++) {
      const t = i / count;
      const px = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 20;
      const py = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 20;

      this._createParticle({
        x: px, y: py, texture: 'spark',
        color: 0xaaddff,
        scale: 0.1,
        life: 0.15 + Math.random() * 0.1
      });
    }
  },

  // Blood splatter
  bloodSplash(x, y, count = 10) {
    if (!this.initialized) return;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100;

      this._createParticle({
        x, y, texture: 'circle',
        color: 0xaa0000,
        scale: 0.1 + Math.random() * 0.08,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        gravity: 400,
        life: 0.3 + Math.random() * 0.2
      });
    }
  },

  // Skill cooldown complete flash
  skillReadyFlash(x, y) {
    if (!this.initialized) return;

    this._createParticle({
      x, y, texture: 'glow',
      color: 0xffffff, scale: 0.6,
      life: 0.3, scaleDecay: 4
    });

    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 / 6) * i;
      this._createParticle({
        x, y, texture: 'spark',
        color: 0xffff88,
        scale: 0.1,
        vx: Math.cos(angle) * 80,
        vy: Math.sin(angle) * 80,
        life: 0.2
      });
    }
  },

  // Portal effect
  portalEffect(x, y) {
    if (!this.initialized) return;

    // Purple rotating particles
    for (let i = 0; i < 15; i++) {
      const angle = (Math.PI * 2 / 15) * i + performance.now() * 0.002;
      const radius = 30 + Math.random() * 20;

      this._createParticle({
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius * 0.5,
        texture: 'circle',
        color: 0x9966ff,
        scale: 0.1,
        vy: -50 - Math.random() * 30,
        life: 0.4 + Math.random() * 0.2
      });
    }
  },

  // Gear drop light pillar
  itemDropBeam(x, y, rarity) {
    if (!this.initialized) return;

    const colors = {
      normal: 0xffffff,
      magic: 0x4444ff,
      rare: 0xffff00,
      unique: 0xff8800,
      set: 0x00ff00
    };

    const color = colors[rarity] || 0xffffff;

    // Light pillar
    this._createParticle({
      x, y: y - 80, texture: 'glow',
      color: color, scale: 1.5,
      life: 0.8, scaleDecay: 0.8
    });

    // Orbiting particles
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 / 12) * i;
      this._createParticle({
        x: x + Math.cos(angle) * 20,
        y: y,
        texture: 'spark',
        color: color,
        scale: 0.12,
        vy: -100 - Math.random() * 80,
        life: 0.5 + Math.random() * 0.3
      });
    }
  },

  // Reward particle burst (daily check-in)
  rewardBurst(x, y, isSpecial = false) {
    if (!this.initialized) return;

    const colors = isSpecial ?
      [0xffd700, 0xffaa00, 0xff8800, 0xffffff, 0xffff00] :
      [0x87ceeb, 0x98fb98, 0xdda0dd, 0xffffff];
    const count = isSpecial ? 40 : 20;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
      const speed = 100 + Math.random() * 150;

      this._createParticle({
        x, y: y - 30,
        texture: 'circle',
        color: colors[Math.floor(Math.random() * colors.length)],
        scale: isSpecial ? 0.15 + Math.random() * 0.1 : 0.1 + Math.random() * 0.08,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 80,
        gravity: 120,
        life: 0.8 + Math.random() * 0.4
      });
    }

    // Extra rising stars on special days
    if (isSpecial) {
      for (let i = 0; i < 15; i++) {
        this._createParticle({
          x: x + (Math.random() - 0.5) * 60,
          y: y,
          texture: 'spark',
          color: 0xffd700,
          scale: 0.15,
          vy: -180 - Math.random() * 100,
          life: 1.2 + Math.random() * 0.5
        });
      }
    }
  },

  // Multishot trail
  multishotTrail(x, y) {
    if (!this.initialized) return;

    const colors = [0xaaff00, 0x88ff44, 0xffff00, 0xccff88];

    this._createParticle({
      x: x + (Math.random() - 0.5) * 6,
      y: y + (Math.random() - 0.5) * 6,
      texture: 'spark',
      color: colors[Math.floor(Math.random() * colors.length)],
      scale: 0.08 + Math.random() * 0.05,
      vx: (Math.random() - 0.5) * 40,
      vy: (Math.random() - 0.5) * 40,
      life: 0.15 + Math.random() * 0.1
    });
  },

  // Level-up gold particle burst
  levelUpBurst(x, y) {
    if (!this.initialized) return;

    const count = 40;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.2;
      const speed = 150 + Math.random() * 200;
      const colors = [0xffd700, 0xffaa00, 0xffcc44, 0xffffff];

      this._createParticle({
        x, y: y - 20,
        texture: 'spark',
        color: colors[Math.floor(Math.random() * colors.length)],
        scale: 0.12 + Math.random() * 0.1,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 80,
        gravity: 100,
        life: 1.0 + Math.random() * 0.5
      });
    }

    // Rising stars
    for (let i = 0; i < 15; i++) {
      this._createParticle({
        x: x + (Math.random() - 0.5) * 60,
        y: y,
        texture: 'circle',
        color: 0xffd700,
        scale: 0.15 + Math.random() * 0.1,
        vy: -200 - Math.random() * 150,
        life: 1.2 + Math.random() * 0.5
      });
    }
  },

  // Wall collision particles
  wallHit(x, y, count = 3) {
    if (!this.initialized) return;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 50;

      this._createParticle({
        x, y, texture: 'spark',
        color: 0xaaaaaa,
        scale: 0.08,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.3 + Math.random() * 0.2
      });
    }
  },

  // Vampire dash afterimage
  vampireDashTrail(x, y) {
    if (!this.initialized) return;

    this._createParticle({
      x, y,
      texture: 'circle',
      color: 0xaa0000,
      scale: 0.4,
      life: 0.3,
      alpha: 0.6,
      fadeOut: true,
      blendMode: PIXI.BLEND_MODES.NORMAL
    });
  },

  // Leech effect (particles sucked in)
  lifestealEffect(fromX, fromY, toX, toY) {
    if (!this.initialized) return;

    for (let i = 0; i < 5; i++) {
      const startX = fromX + (Math.random() - 0.5) * 30;
      const startY = fromY + (Math.random() - 0.5) * 30;

      const p = this._createParticle({
        x: startX, y: startY,
        texture: 'circle',
        color: 0xff0000,
        scale: 0.15,
        life: 0.4,
        fadeOut: true
      });

      // Compute a bit of physics manually so it flies to the target
      p.vx = (toX - fromX) * 2 + (Math.random() - 0.5) * 50;
      p.vy = (toY - fromY) * 2 + (Math.random() - 0.5) * 50;
    }
  },

  // Phoenix revive VFX
  phoenixResurrection(x, y) {
    if (!this.initialized) return;

    // Huge fire ring burst
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 / 30) * i;
      const speed = 150 + Math.random() * 150;

      this._createParticle({
        x, y,
        texture: 'flame',
        color: 0xff8800,
        scale: 0.3 + Math.random() * 0.2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        scaleDecay: 1.5
      });
    }

    // Core flash
    this._createParticle({
      x, y, texture: 'glow',
      color: 0xffaa00, scale: 2.5,
      life: 0.8, scaleDecay: 2
    });
  },

  // Boss death burst
  bossDeathBurst(x, y) {
    if (!this.initialized) return;

    // Massive burst particles
    const count = 60;
    const colors = [0xff4400, 0xff8800, 0xffcc00, 0xffffff, 0xff0000];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.3;
      const speed = 200 + Math.random() * 300;

      this._createParticle({
        x, y,
        texture: 'spark',
        color: colors[Math.floor(Math.random() * colors.length)],
        scale: 0.2 + Math.random() * 0.3,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 100,
        gravity: 150,
        life: 1.5 + Math.random() * 1.0
      });
    }

    // Red shockwave
    this._createParticle({
      x, y, texture: 'glow',
      color: 0xff0000, scale: 3.0,
      life: 0.6, scaleDecay: 4
    });
  },

  // Advanced segmented lightning (replaces complex Canvas lightning)
  advancedLightning(points, color = 0xffffff, isMain = true) {
    if (!this.initialized) return;

    const hexColor = this._parseColor(color);

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      // Create a few glow dots per segment
      this._createParticle({
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
        texture: 'spark',
        color: hexColor,
        scale: isMain ? 0.2 : 0.1,
        life: isMain ? 0.25 : 0.4,
        fadeOut: true,
        alpha: isMain ? 1.0 : 0.6
      });

      // For the main bolt, add halos at nodes
      if (isMain && Math.random() < 0.3) {
        this._createParticle({
          x: p1.x, y: p1.y,
          texture: 'glow',
          color: 0x88ccff,
          scale: 0.4,
          life: 0.2
        });
      }
    }
  },

  // Teleport ring
  teleportFlash(x, y) {
    if (!this.initialized) return;

    // Center burst
    this._createParticle({
      x, y, texture: 'glow',
      color: 0x8866ff, scale: 1.5,
      life: 0.4, scaleDecay: 3
    });

    // Ring particles
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 / 16) * i;
      const radius = 40;

      this._createParticle({
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius * 0.5,
        texture: 'circle',
        color: 0xaa88ff,
        scale: 0.1,
        vx: Math.cos(angle) * 60,
        vy: Math.sin(angle) * 60 - 50,
        life: 0.4 + Math.random() * 0.2
      });
    }
  },

  // Ambient atmosphere particles
  atmosphere(type, x, y) {
    if (!this.initialized) return;

    if (type === 'forest') {
      this._createParticle({
        x, y,
        texture: 'circle',
        color: Math.random() < 0.7 ? 0xaaff88 : 0xffffaa,
        scale: 0.05 + Math.random() * 0.05,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        life: 3 + Math.random() * 2,
        alpha: 0.6,
        blendMode: PIXI.BLEND_MODES.NORMAL
      });
    } else if (type === 'fire') {
      this._createParticle({
        x, y,
        texture: 'flame',
        color: Math.random() < 0.6 ? 0xff4400 : 0xffaa00,
        scale: 0.08 + Math.random() * 0.08,
        vx: (Math.random() - 0.5) * 30,
        vy: -30 - Math.random() * 30,
        life: 1.5 + Math.random(),
        alpha: 0.8
      });
    }
  },

  // ========== Helper functions ==========

  // Parse color (CSS color string to hex number)
  _parseColor(color) {
    if (typeof color === 'number') return color;
    if (typeof color !== 'string') return 0xffffff;

    // Strip the # prefix
    let hex = color.replace('#', '');

    // Handle shorthand
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    return parseInt(hex, 16) || 0xffffff;
  }
};

// Export globals
window.PixiEffects = PixiEffects;

