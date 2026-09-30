/**
 * GSAPAnims - game animation engine (GSAP powered)
 * Dedicated to UI number roll-ups, panel transitions and combat visual enhancements
 */
const GSAPAnims = {
  /**
   * Number growth roll-up effect
   * @param {HTMLElement} element target DOM element
   * @param {number} from start value
   * @param {number} to target value
   * @param {number} duration duration
   * @param {object} options extra config
   */
  countUp(element, from, to, duration = 1, options = {}) {
    if (!element || typeof gsap === 'undefined') return null;

    const {
      format = (v) => Math.floor(v).toLocaleString(),
      ease = 'power2.out',
      onComplete
    } = options;

    // If already animating, kill the previous animation
    gsap.killTweensOf(element);

    const obj = { value: from };
    return gsap.to(obj, {
      value: to,
      duration,
      ease,
      onUpdate: () => {
        element.textContent = format(obj.value);
      },
      onComplete
    });
  },

  /**
   * Panel pop-in animation
   */
  panelIn(element, direction = 'bottom') {
    if (!element || typeof gsap === 'undefined') return;

    gsap.killTweensOf(element);

    // Smart detection: for centered panels (50/50), GSAP takes over percentage movement to prevent position jumps after the animation
    const isCentered = element.style.top === '50%' && element.style.left === '50%' ||
      window.getComputedStyle(element).top === '50%';

    const toProps = {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.35,
      ease: "back.out(1.5)",
      clearProps: "opacity" // never clear transform properties; it breaks centering
    };

    const fromProps = { opacity: 0, scale: 0.95 };

    if (isCentered) {
      fromProps.xPercent = -50;
      fromProps.yPercent = -50;
      toProps.xPercent = -50;
      toProps.yPercent = -50;
    }

    if (direction === 'bottom') fromProps.y = 30;
    else if (direction === 'top') fromProps.y = -30;
    else if (direction === 'center') fromProps.scale = 0.8;

    gsap.fromTo(element, fromProps, toProps);
  },

  /**
   * Panel pop-out destroy animation
   */
  panelOut(element, onComplete) {
    if (!element || typeof gsap === 'undefined') {
      if (onComplete) onComplete();
      return;
    }

    gsap.to(element, {
      opacity: 0,
      scale: 0.8,
      y: 30,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });
  },

  /**
   * Crit popup animation
   */
  critPop(element) {
    if (!element || typeof gsap === 'undefined') return;

    const tl = gsap.timeline();
    tl.fromTo(element,
      { scale: 0.5, opacity: 0, rotation: -15 },
      { scale: 1.5, opacity: 1, rotation: 0, duration: 0.15, ease: 'power2.out' }
    )
      .to(element, { scale: 1, duration: 0.1, ease: 'power2.inOut' })
      .to(element, {
        filter: 'brightness(1.5) drop-shadow(0 0 8px gold)',
        duration: 0.15,
        yoyo: true,
        repeat: 3
      }, "-=0.1");

    return tl;
  },

  /**
   * Advanced pickup fly-to effect (supports dynamic tracking of the player)
   * @param {object} fp pickup object (needs x, y, startX, startY, etc.)
   * @param {object} player player object (for real-time position)
   * @param {function} onComplete callback when flight finishes (runs actual pickup logic)
   */
  lootFly(fp, player, onComplete) {
    if (!fp || !player || typeof gsap === 'undefined') return;

    // Core animation: drive a virtual progress value t (0 -> 1)
    const progress = { t: 0 };

    return gsap.to(progress, {
      t: 1,
      duration: 0.45 + Math.random() * 0.15, // Slightly longer flight time shows a graceful arc
      ease: "power2.in", // accelerating feel while being sucked in
      onUpdate: () => {
        const t = progress.t;
        const t2 = t * t;
        const t3 = t2 * t;
        const mt = 1 - t;
        const mt2 = mt * mt;
        const mt3 = mt2 * mt;

        // Real-time cubic Bezier interpolation
        // End point always follows the player's current position, creating a magnet effect
        fp.x = mt3 * fp.startX +
          3 * mt2 * t * fp.controlX1 +
          3 * mt * t2 * fp.controlX2 +
          t3 * player.x;

        fp.y = mt3 * fp.startY +
          3 * mt2 * t * fp.controlY1 +
          3 * mt * t2 * fp.controlY2 +
          t3 * (player.y - 20);

        // Record current progress for the render layer (e.g. scale or opacity)
        fp.progress = t;
      },
      onComplete: onComplete
    });
  },

  /**
   * Strong shake effect (for taking damage or not enough mana)
   */
  shake(element, intensity = 5) {
    if (!element || typeof gsap === 'undefined') return;
    gsap.killTweensOf(element);
    gsap.to(element, {
      x: `random(-${intensity}, ${intensity})`,
      y: `random(-${intensity}, ${intensity})`,
      duration: 0.05,
      repeat: 5,
      yoyo: true,
      onComplete: () => gsap.set(element, { x: 0, y: 0 })
    });
  },

  /**
   * UI pulse feedback (e.g. button click or item gain)
   */
  pulse(element, scale = 1.1) {
    if (!element || typeof gsap === 'undefined') return;
    gsap.to(element, {
      scale: scale,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    });
  }
};

window.GSAPAnims = GSAPAnims;
