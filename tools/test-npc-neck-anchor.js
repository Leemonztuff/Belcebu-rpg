// 校验 NPC 身体/头部图集的颈部锚点标定：对空白单元格容错，并锁定缺少 alpha 通道的头部图集。
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const root = path.resolve(__dirname, '..');
const game = fs.readFileSync(path.join(root, 'src/core/game.js'), 'utf8');

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

const scope = vm.createContext({ Math, Date, Object, Array, Set, Map, JSON, Number });
for (const name of ['getNPCAlphaRowBounds', 'getNPCHeadAlphaCoverage', 'getNPCHeadNeckProfile', 'findNPCNeckAnchor']) {
    vm.runInContext(extract(game, `function ${name}(`), scope);
}
vm.runInContext(game.match(/const NPC_HEAD_ALPHA_COVERAGE_LIMIT\s*=\s*[\d.]+;/)[0], scope);
vm.runInContext(game.match(/const NPC_FALLBACK_NECK_ANCHOR\s*=\s*Object\.freeze\(\{[^}]+\}\);/)[0], scope);
vm.runInContext('globalThis.limit=NPC_HEAD_ALPHA_COVERAGE_LIMIT;globalThis.fallback=NPC_FALLBACK_NECK_ANCHOR;', scope);
const { limit, fallback } = scope;

assert.equal(typeof fallback.y, 'number', '回退锚点必须提供可用的纵向位置');
assert.ok(fallback.y > 0, '回退锚点不能贴在身体顶端之外');

const padded = new Uint8ClampedArray(20 * 20 * 4);
for (let y = 6; y < 9; y++) for (let x = 9; x < 12; x++) padded[(y * 20 + x) * 4 + 3] = 255;
const paddedNeck = scope.getNPCHeadNeckProfile(padded, 20, 20);
assert.ok(paddedNeck, '内容停在单元格上方的头部仍应测得颈宽');
assert.equal(paddedNeck.width, 3, '按最低不透明行取样，而不是按单元格底边');

const blank = new Uint8ClampedArray(20 * 20 * 4);
assert.equal(scope.getNPCHeadNeckProfile(blank, 20, 20), null, '空白单元格返回 null 而不是伪造颈宽');
assert.equal(scope.findNPCNeckAnchor(blank, 20, 20, 4), null, '目标颈宽不可测时不返回伪造锚点');

const opaque = new Uint8ClampedArray(20 * 20 * 4);
for (let i = 0; i < opaque.length; i += 4) opaque[i + 3] = 255;
assert.ok(scope.getNPCHeadAlphaCoverage(opaque, 20, 20) >= limit, '完全不透明的单元格判定为无 alpha 图集');
assert.ok(scope.getNPCHeadAlphaCoverage(padded, 20, 20) < limit, '带透明像素的单元格判定为可测量');

function cellRect(image, row, col) {
    const x = Math.round(col * image.width / 4);
    const y = Math.round(row * image.height / 4);
    return { x, y, width: Math.round((col + 1) * image.width / 4) - x, height: Math.round((row + 1) * image.height / 4) - y };
}
function alphaOf(image, rect) {
    const canvas = createCanvas(rect.width, rect.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);
    return ctx.getImageData(0, 0, rect.width, rect.height).data;
}
function coverageOf(alpha) {
    let opaque = 0;
    for (let i = 3; i < alpha.length; i += 4) if (alpha[i] > 24) opaque++;
    return opaque / (alpha.length / 4);
}

const headPoolMatch = game.match(/headPool:\s*\[([\s\S]*?)\]/);
assert.ok(headPoolMatch, 'NPCSpriteSystem.headPool 必须存在');
const headFiles = [...headPoolMatch[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
assert.ok(headFiles.length >= 8, `头部图集数量异常：${headFiles.length}`);

const RENDER_H = 88, HEAD_SCALE = 0.54;
const flattened = [], measurable = [], emptyCells = [];
let measuredCells = 0, fallbackCells = 0;

(async () => {
    for (const relative of headFiles) {
        const file = path.join(root, relative);
        assert.ok(fs.existsSync(file), `头部图集缺失：${relative}`);
        const image = await loadImage(file);
        for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) {
            const rect = cellRect(image, row, col);
            const alpha = alphaOf(image, rect);
            if (coverageOf(alpha) === 0) { emptyCells.push(`${path.basename(relative)}(${row},${col})`); continue; }
            const coverage = scope.getNPCHeadAlphaCoverage(alpha, rect.width, rect.height);
            if (coverage >= limit) { if (!flattened.includes(path.basename(relative))) flattened.push(path.basename(relative)); continue; }
            const neck = scope.getNPCHeadNeckProfile(alpha, rect.width, rect.height);
            assert.ok(neck, `${path.basename(relative)} 单元格(${row},${col}) 有像素却测不到颈部`);
            assert.ok(neck.width > 0 && neck.width < rect.width, `${path.basename(relative)} 单元格(${row},${col}) 颈宽不合理：${neck.width}/${rect.width}`);
            assert.ok(neck.center > 0 && neck.center <= rect.width, `${path.basename(relative)} 单元格(${row},${col}) 颈中心越界：${neck.center}`);
            const headScale = RENDER_H * HEAD_SCALE / rect.width;
            const anchor = scope.findNPCNeckAnchor(alpha, rect.width, rect.height, neck.width * headScale / (RENDER_H / rect.width));
            if (anchor) measuredCells++; else fallbackCells++;
        }
        if (!flattened.includes(path.basename(relative))) measurable.push(path.basename(relative));
    }

    assert.equal(emptyCells.length, 0, `头部图集存在空白单元格：${emptyCells.join(' ')}`);
    assert.ok(measuredCells > 0, '至少要有可用 alpha 的头部图集参与测量');

    if (flattened.length) {
        console.warn(`WARN: ${flattened.length}/${headFiles.length} 个头部图集没有 alpha 通道（实为 JPEG），已使用回退锚点：${flattened.join(', ')}`);
    }
    console.log(`PASS: 头部图集 ${headFiles.length} 个（可测量 ${measurable.length}，回退标定 ${flattened.length}）；测量 ${measuredCells} 格，回退 ${fallbackCells} 格，空白单元格 ${emptyCells.length}`);
})().catch(error => { console.error(error); process.exit(1); });
