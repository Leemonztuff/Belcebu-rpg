// 校验主角各个动作在屏幕上的剪影尺寸：站立/行走/施法/倒地切换时不能忽大忽小，
// 施法与倒地必须叠上头饰层，且倒地整段必须共用一把缩放常数（不能逐帧按身高放大）。
// 走真实绘制路径（getHeroFrame -> drawActorSprite），逐像素量出剪影包围盒。
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
for (const name of ['getSpriteCellContentRows', 'normalizeHeroDirection', 'getCurrentHeroAction', 'getPaperdollMotionPose',
    'getHeroBodyGauge', 'contentHeightOnScreen', 'fitStripToHeroBody', 'fitDeathStripToHeroBody',
    'buildHeroStripLayers', 'getHeroFrame', 'drawActorSprite']) {
    vm.runInContext(extract(game, `function ${name}(`), scope);
}
// 逐像素量出实际画出来的剪影包围盒（只看 alpha，避免特效或底色干扰）
function inkBox(canvas) {
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    let top = height, bottom = -1, left = width, right = -1;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (data[(y * width + x) * 4 + 3] > 12) {
                if (y < top) top = y; if (y > bottom) bottom = y;
                if (x < left) left = x; if (x > right) right = x;
            }
        }
    }
    return { top, bottom, h: bottom - top + 1, w: right - left + 1 };
}
const W = 900, H = 700, PY = 420, TOL = 2;
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

        // cast：四帧都是站立施法，高度与脚线都要与站立一致
        assert.ok(paint('cast', 0).frame.layers.some(layer => layer.type === 'head'),
            `${direction} cast: 必须叠上头饰层，否则该动作下人物没有头`);
        for (let f = 0; f < 4; f++) {
            const shot = paint('cast', f);
            const label = `${direction} cast 第 ${f} 帧`;
            assert.ok(Math.abs(shot.box.h - idle.box.h) <= TOL,
                `${label}: 剪影高度 ${shot.box.h}px 与站立 ${idle.box.h}px 不一致，切换动作会跳变`);
            assert.ok(Math.abs(shot.box.bottom - idle.box.bottom) <= TOL,
                `${label}: 脚底线 ${shot.box.bottom}px 与站立 ${idle.box.bottom}px 不一致，人物会悬空或陷地`);
        }

        // death：塌陷动画，高度本来就会随身体倾倒变矮，所以不比高度；比的是
        // 1) 整段共用同一个 drawSize（不能逐帧按身高放大），
        // 2) 横卧帧的宽度必须是"站立帧同一把尺子"缩放出来的宽度。
        const deaths = [];
        for (let f = 0; f < 4; f++) deaths.push(paint('death', f));
        assert.ok(deaths[0].frame.layers.some(layer => layer.type === 'head'),
            `${direction} death: 必须叠上头饰层，否则该动作下人物没有头`);

        const drawSizes = deaths.map(shot => shot.frame.drawSize);
        assert.ok(drawSizes.every(size => size === drawSizes[0]),
            `${direction} death: 四帧必须共用一把缩放常数，实际为 ${drawSizes.join(' / ')}`);

        // 横卧帧（第 3 帧）身体最宽：按站立帧的比例尺换算它应该多宽。
        // 源条带内容宽度按同一比例尺缩放后的宽度，就是屏幕上该有的宽度。
        const sourceStanding = scope.art.frame('heroDeathSheet', 0, 0).contentBounds;
        const sourceProne = scope.art.frame('heroDeathSheet', 0, 3).contentBounds;
        const pixelsPerSource = drawSizes[0] / 128;      // drawSize 把 128px 单元格映射到屏幕
        const expectedWidth = sourceProne.sw * pixelsPerSource;
        const proneBody = deaths[3];
        // 只量身体层：头饰不参与身体缩放
        const bodyOnly = { ...proneBody.frame, layers: proneBody.frame.layers.filter(layer => layer.type !== 'head') };
        const canvas = createCanvas(W, H);
        scope.drawActorSprite(canvas.getContext('2d'), null, bodyOnly, W / 2, PY - renderHeight + (bodyOnly.offsetY || 0), renderHeight, renderHeight, null);
        const body = inkBox(canvas);
        assert.ok(Math.abs(body.w - expectedWidth) <= TOL,
            `${direction} death 横卧帧: 身体宽 ${body.w}px，按站立尺子应为 ${expectedWidth.toFixed(1)}px`
            + `（源宽 ${sourceProne.sw.toFixed(1)}px）——逐帧按身高缩放会把横卧帧撑大`);

        // 脚底线仍要钉在地面线上
        for (let f = 0; f < 4; f++) {
            assert.ok(Math.abs(deaths[f].box.bottom - idle.box.bottom) <= TOL,
                `${direction} death 第 ${f} 帧: 脚底线 ${deaths[f].box.bottom}px 与站立 ${idle.box.bottom}px 不一致`);
        }
    }
    console.log(`PASS: cast 四帧与站立同高同脚线；death 共用一把缩放常数，横卧帧宽度符合站立尺子，`
        + `四帧脚底均落在地面线（${directions.length} 个方向，容差 ${TOL}px）`);
})().catch(error => { console.error(error); process.exit(1); });
