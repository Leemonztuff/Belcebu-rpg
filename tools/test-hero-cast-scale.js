// 校验施法条带的屏幕尺寸与站立/行走纸娃娃一致：切换动作瞬间人物不能整体缩放一圈。
// 走真实绘制路径（getHeroFrame -> drawActorSprite），逐像素量出剪影高度与脚底线。
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { createCanvas, loadImage, Image } = require('@napi-rs/canvas');
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
        super.src = path.join(root, url.split('?')[0]);
    }
}
const scope = vm.createContext({ console, Image: LocalImage, document: { createElement: () => createCanvas(1, 1) }, player: {} });
vm.runInContext(fs.readFileSync(path.join(root, 'sprite-renderer.js'), 'utf8') + ';globalThis.HeroTintCache=SpriteRenderer.createTintCache();', scope);
vm.runInContext(fs.readFileSync(path.join(root, 'art-samples.js'), 'utf8') + ';globalThis.art=ArtSamples;', scope);
vm.runInContext(game.match(/const ACTOR_RENDER_SIZE\s*=\s*\d+;/)[0], scope);
vm.runInContext(game.match(/const PAPERDOLL_MOTION_PROFILES = Object\.freeze\(\{[\s\S]*?\n\}\);/)[0], scope);
vm.runInContext(game.match(/const ACTIVE_PAPERDOLL_MOTION_PROFILE\s*=\s*'[^']+';/)[0], scope);
vm.runInContext('globalThis.motionProfiles=PAPERDOLL_MOTION_PROFILES;globalThis.activeMotionProfile=ACTIVE_PAPERDOLL_MOTION_PROFILE;', scope);
vm.runInContext(extract(game, 'const HERO_SPRITE_CONFIG =') + ';globalThis.heroCfg=HERO_SPRITE_CONFIG;', scope);
vm.runInContext(extract(game, 'const PaperdollSystem =') + ';globalThis.pd=PaperdollSystem;', scope);
vm.runInContext(game.match(/const HERO_SPRITE_CONTENT_CACHE\s*=\s*new WeakMap\(\);/)[0], scope);
for (const name of ['getSpriteCellContentRows', 'normalizeHeroDirection', 'getCurrentHeroAction', 'getPaperdollMotionPose', 'getHeroBodyDrawBox', 'fitCastStripToHeroBody', 'getHeroFrame', 'drawActorSprite']) {
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
    // 与玩家渲染处（game.js 10211/10213/10216）完全一致：offsetY 由调用方叠加，renderScale 由 drawActorSprite 内部处理
    function paint(action, progress, direction) {
        scope.player = action === 'cast'
            ? { heroAction: 'cast', heroActionTimer: 0.45 * (1 - progress), heroActionDuration: 0.45 }
            : { heroAction: 'idle' };
        const frame = scope.getHeroFrame(direction);
        const canvas = createCanvas(W, H);
        scope.drawActorSprite(canvas.getContext('2d'), null, frame, W / 2, PY - renderHeight + (frame.offsetY || 0), renderHeight, renderHeight, null);
        return { box: inkBox(canvas), frame };
    }
    const directions = Object.keys(scope.pd.rowMap);
    assert.ok(directions.length > 0, '纸娃娃方向表不能为空');
    for (const direction of directions) {
        const idle = paint('idle', 0, direction);
        assert.ok(idle.box.h > 0, `${direction}: 站立帧必须画出可见剪影`);
        // 四帧施法都要落在站立标尺上，而不是各自为政
        for (let f = 0; f < 4; f++) {
            const cast = paint('cast', (f + 0.5) / 4, direction);
            const label = `${direction} 第 ${f} 帧`;
            assert.ok(cast.frame.renderScale > 1,
                `${label}: 施法条带必须按纸娃娃标尺放大（renderScale=${cast.frame.renderScale}），否则会整体缩小一圈`);
            assert.ok(Math.abs(cast.box.h - idle.box.h) <= TOL,
                `${label}: 施法剪影高度 ${cast.box.h}px 与站立 ${idle.box.h}px 不一致，切换动作会跳变`);
            assert.ok(Math.abs(cast.box.bottom - idle.box.bottom) <= TOL,
                `${label}: 施法脚底线 ${cast.box.bottom}px 与站立 ${idle.box.bottom}px 不一致，人物会悬空或陷地`);
        }
    }
    console.log(`PASS: 施法四帧在 ${directions.length} 个方向都与站立纸娃娃同高同脚线（容差 ${TOL}px）`);
})().catch(error => { console.error(error); process.exit(1); });
