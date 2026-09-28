// 校验主角四个动作在屏幕上的剪影尺寸完全一致：站立/行走/施法/倒地切换时人物不能忽大忽小，
// 且施法与倒地必须和纸娃娃一样叠上头饰层（否则起手瞬间会变成光头）。
// 走真实绘制路径（getHeroFrame -> drawActorSprite），逐像素量出剪影高度与脚底线。
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { createCanvas, Image } = require('@napi-rs/canvas');
const root = path.resolve(__dirname, '..');
const game = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
function extract(source, marker) {
    const start = source.indexOf(marker);
    assert.ok(start >= 0, `缺少真实代码入口 ${marker}`);
    let depth = 0;
    for (let i = source.indexOf('{', start); i < source.length; i++) {
        if (source[i] === '{') depth++;
        if (source[i] === '}' && --depth === 0) return source.slice(start, i + 1);
    }
    throw new Error(`无法提取 ${marker}`);
}
const ready = [];
class LocalImage extends Image {
    set src(url) {
        const onload = this.onload;
        let resolve, reject;
        ready.push(new Promise((yes, no) => { resolve = yes; reject = no; }));
        this.onload = () => { onload(); resolve(); };
        this.onerror = reject;
        const clean = url.split('?')[0].replace(/^\/+/, '');
        const candidates = [path.join(root, clean), path.join(root, 'art', clean), path.join(root, 'public', clean)];
        super.src = candidates.find(candidate => fs.existsSync(candidate)) || candidates[0];
    }
}
const scope = vm.createContext({ console, Image: LocalImage, document: { createElement: () => createCanvas(1, 1) }, player: {} });
vm.runInContext(fs.readFileSync(path.join(root, 'sprite-renderer.js'), 'utf8') + ';globalThis.HeroTintCache=SpriteRenderer.createTintCache();', scope);
vm.runInContext(fs.readFileSync(path.join(root, 'art-samples.js'), 'utf8') + ';globalThis.art=ArtSamples;', scope);
vm.runInContext(game.match(/const ACTOR_RENDER_SIZE\s*=\s*\d+;/)[0], scope);
vm.runInContext(game.match(/const PAPERDOLL_MOTION_PROFILES = Object\.freeze\(\{[\s\S]*?\n\}\);/)[0], scope);
vm.runInContext(game.match(/const ACTIVE_PAPERDOLL_MOTION_PROFILE\s*=\s*'[^']+';/)[0], scope);
vm.runInContext(game.match(/const HERO_SPRITE_CONTENT_CACHE\s*=\s*new WeakMap\(\);/)[0], scope);
vm.runInContext(game.match(/const HERO_DEATH_STRIP_SCALE\s*=\s*new Map\(\);/)[0], scope);
vm.runInContext(game.match(/const HERO_STRIP_HEAD_ROW\s*=\s*\{[^}]*\};/)[0], scope);
vm.runInContext('globalThis.motionProfiles=PAPERDOLL_MOTION_PROFILES;globalThis.activeMotionProfile=ACTIVE_PAPERDOLL_MOTION_PROFILE;', scope);
vm.runInContext(extract(game, 'const HERO_SPRITE_CONFIG =') + ';globalThis.heroCfg=HERO_SPRITE_CONFIG;', scope);
vm.runInContext(extract(game, 'const PaperdollSystem =') + ';globalThis.pd=PaperdollSystem;', scope);
for (const name of ['getSpriteCellContentRows', 'normalizeHeroDirection', 'getCurrentHeroAction', 'getPaperdollMotionPose', 'getHeroBodyGauge', 'fitStripToHeroBody', 'fitDeathStripToHeroBody', 'buildHeroStripLayers', 'getHeroFrame', 'drawActorSprite']) {
    vm.runInContext(extract(game, `function ${name}(`), scope);
}
// 逐像素量出实际画出来的剪影包围盒（只看 alpha，避免特效或底色干扰）
function inkBox(canvas) {
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    let top = height, bottom = -1;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (data[(y * width + x) * 4 + 3] > 12) { if (y < top) top = y; if (y > bottom) bottom = y; break; }
        }
    }
    return { top, bottom, h: bottom - top + 1 };
}
const W = 360, H = 460, PY = 300, TOL = 2;
(async () => {
    scope.pd.initDefaults();
    await Promise.all(ready);
    await scope.art.ensure(Object.keys(scope.art.definitions));
    const renderHeight = scope.heroCfg.renderSize;
    // 与玩家渲染处完全一致：offsetY 由调用方叠加，renderScale 由 drawActorSprite 内部处理
    function paint(action, frameIndex) {
        if (action === 'cast') {
            scope.player = { heroAction: 'cast', heroActionTimer: 1 - (frameIndex + 0.5) / 4, heroActionDuration: 1 };
        } else if (action === 'death') {
            scope.player = { isDead: true, deathTimer: (frameIndex + 0.5) / 4 * 0.9 };
        } else {
            scope.player = { heroAction: action };
        }
        const direction = paint.direction;
        const frame = scope.getHeroFrame(direction);
        const canvas = createCanvas(W, H);
        scope.drawActorSprite(canvas.getContext('2d'), null, frame, W / 2, PY - renderHeight + (frame.offsetY || 0), renderHeight, renderHeight, null);
        return { box: inkBox(canvas), frame };
    }
    const directions = Object.keys(scope.pd.rowMap);
    assert.ok(directions.length > 0, '纸娃娃方向表不能为空');
    for (const direction of directions) {
        paint.direction = direction;
        const idle = paint('idle', 0);
        assert.ok(idle.box.h > 0, `${direction}: 站立帧必须画出可见剪影`);
        for (const action of ['cast', 'death']) {
            // 施法与倒地必须走纸娃娃图层：条带当身体层 + 头饰层，否则起手/倒地时是光头
            const head = paint(action, 0).frame.layers;
            assert.ok(Array.isArray(head) && head.some(layer => layer.type === 'head'),
                `${direction} ${action}: 必须叠上头饰层，否则该动作下人物没有头`);
            for (let f = 0; f < 4; f++) {
                const shot = paint(action, f);
                const label = `${direction} ${action} 第 ${f} 帧`;
                assert.ok(Math.abs(shot.box.h - idle.box.h) <= TOL,
                    `${label}: 剪影高度 ${shot.box.h}px 与站立 ${idle.box.h}px 不一致，切换动作会跳变`);
                assert.ok(Math.abs(shot.box.bottom - idle.box.bottom) <= TOL,
                    `${label}: 脚底线 ${shot.box.bottom}px 与站立 ${idle.box.bottom}px 不一致，人物会悬空或陷地`);
            }
        }
    }
    console.log(`PASS: 施法与倒地四帧在 ${directions.length} 个方向都与站立纸娃娃同高同脚线，且都带头饰层（容差 ${TOL}px）`);
})().catch(error => { console.error(error); process.exit(1); });
