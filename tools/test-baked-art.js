const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {createCanvas, loadImage} = require('@napi-rs/canvas');
const {loadCatalog, readManifest, sourceHash} = require('./prepare-art-atlases');
const root = path.resolve(__dirname, '..');
(async () => {
    // 模拟首次构建时不存在清单；不删除现有清单，也不生成产物。
    const existsSync = fs.existsSync, consoleError = console.error;
    const catalogErrors = [];
    let initialCatalog;
    try {
        fs.existsSync = filename => path.resolve(String(filename)) === path.join(root, 'art', 'atlas-manifest.js') ? false : existsSync(filename);
        console.error = (...args) => catalogErrors.push(args.map(String).join(' '));
        initialCatalog = loadCatalog(root);
        await new Promise(resolve => setImmediate(resolve));
    } finally {
        fs.existsSync = existsSync;
        console.error = consoleError;
    }
    assert.deepEqual(catalogErrors, [], '首次无清单构建不能把空清单注入运行时，导致图片路径 Promise 拒绝');
    assert.ok(initialCatalog.definitions.length > 0);
    console.log('PASS: 首次无清单可读取全部原始图集定义，无异步加载错误');
    const {definitions, normalizeAtlas} = loadCatalog(root);
    const manifest = readManifest(root, true);
    const runtime = vm.createContext({console, Image: class {}, ArtAtlasManifest: manifest,
        document: {createElement: () => {throw new Error('预烘焙运行时禁止创建归一化扫描画布');}}});
    for (const file of ['src/graphics/art-samples.js', 'src/graphics/environment-art.js']) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), runtime, {filename: file});
    vm.runInContext('this.art = ArtSamples; this.environment = EnvironmentArt;', runtime);
    assert.deepEqual(Object.keys(manifest).sort(), definitions.map(d => d.file).sort(), '所有实际定义均须烘焙，且清单不能包含过期定义');
    for (const definition of definitions) {
        const entry = manifest[definition.file];
        const raw = fs.readFileSync(path.join(root, definition.file));
        assert.equal(entry.sourceSHA256, sourceHash(raw), `${definition.file} 原图已变更，必须重新烘焙`);
        assert.equal(entry.width, definition.cols * 128);
        assert.equal(entry.height, definition.rows * 128);
        const bakedBytes = fs.readFileSync(path.join(root, entry.file));
        assert.equal(bakedBytes[25], 6, `${entry.file} 必须保留RGBA`);
        assert.equal(entry.atlasSHA256, sourceHash(bakedBytes), `${entry.file} 内容不符合清单`);
        const baked = await loadImage(path.join(root, entry.file));
        assert.equal(baked.width, entry.width); assert.equal(baked.height, entry.height);
        assert.equal(runtime.art.assetPath(definition.file), entry.runtimeFile || entry.file);
        assert.equal(runtime.art.prepareSource(baked, definition), baked, '运行时必须直接复用烘焙 Image');
        assert.deepEqual(baked.contentBounds, entry.contentBounds);
        if (runtime.environment.definitions[definition.key]) {
            runtime.environment.registerAtlas(definition.key, baked);
            assert.equal(runtime.environment.frame(definition.key, 0).source, baked, '环境图集也必须直接使用烘焙 Image');
        }
        const original = await loadImage(path.join(root, definition.file));
        const expected = normalizeAtlas(original, definition.cols, definition.rows, definition.calibration);
        assert.deepEqual(entry.contentBounds, JSON.parse(JSON.stringify(expected.contentBounds)), `${definition.file} 内容边界与运行时归一化不一致`);
        const canvas = createCanvas(baked.width, baked.height), ctx = canvas.getContext('2d');
        ctx.drawImage(baked, 0, 0);
        const actualPixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const expectedPixels = expected.getContext('2d').getImageData(0, 0, expected.width, expected.height).data;
        // Atlas SHA above already proves the committed bytes are unchanged. Re-rendering the
        // source here is a second, environment-dependent check, so allow a tiny resampling
        // tolerance: the atlases were baked on another machine and @napi-rs/canvas rounding
        // is not bit-identical across environments. A real art regression shifts whole
        // frames and blows past this budget by orders of magnitude.
        const totalPixels = actualPixels.length / 4;
        let drifted = 0;
        for (let i = 0; i < actualPixels.length; i += 4) {
            if (Math.abs(actualPixels[i] - expectedPixels[i]) > 2
                || Math.abs(actualPixels[i + 1] - expectedPixels[i + 1]) > 2
                || Math.abs(actualPixels[i + 2] - expectedPixels[i + 2]) > 2
                || Math.abs(actualPixels[i + 3] - expectedPixels[i + 3]) > 2) drifted++;
        }
        assert.ok(drifted / totalPixels < 0.0005,
            `${definition.file} 烘焙像素与运行时结果不等价：${drifted}/${totalPixels} 像素超出容差`);
        let transparent = 0;
        for (let i = 3; i < actualPixels.length; i += 4) if (actualPixels[i] === 0) transparent++;
        assert.ok(transparent > canvas.width * canvas.height * 0.15);
        assert.equal(entry.contentBounds.length, definition.cols * definition.rows);
        for (let i = 0; i < entry.contentBounds.length; i++) {
            const b = entry.contentBounds[i], x = (i % definition.cols) * 128, y = Math.floor(i / definition.cols) * 128;
            assert.ok(b.sw > 0 && b.sh > 0 && b.sx >= x && b.sy >= y && b.sx + b.sw <= x + 128 && b.sy + b.sh <= y + 128, `${entry.file} 第${i}帧越界或为空`);
        }
        console.log(`PASS: ${definition.file} → ${entry.file} / SHA、RGBA、尺寸、切格及逐像素等价（容差内 ${drifted} 像素）`);
    }
    console.log(`PASS: 全部 ${definitions.length} 个图集可直接加载，无需运行时扫描`);
    // raw 条带必须被烘焙目录排除，并在运行时按 alpha 自行归一化，不得依赖清单。
    const rawScope = vm.createContext({console, Image: class {}, ArtAtlasManifest: manifest,
        document: {createElement: () => createCanvas(1, 1)}});
    for (const file of ['src/graphics/art-samples.js']) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), rawScope, {filename: file});
    vm.runInContext('this.art = ArtSamples;', rawScope);
    const rawKeys = Object.keys(rawScope.art.definitions).filter(key => rawScope.art.definitions[key].raw);
    assert.deepEqual(rawKeys, ['heroCastSheet', 'heroDeathSheet'], '仅施法/倒地条带标记为 raw');
    for (const key of rawKeys) {
        const def = rawScope.art.definitions[key];
        assert.ok(!manifest[def.file], `${key} 不得写入烘焙清单`);
        assert.ok(!definitions.some(d => d.file === def.file), `${key} 不得进入烘焙目录`);
        assert.equal(rawScope.art.assetPath(def.file), def.file, `${key} 未命中清单时必须原样使用路径`);
        const original = await loadImage(path.join(root, def.file));
        const normalized = rawScope.art.prepareSource(original, def);
        assert.equal(normalized.width, def.cols * 128);
        assert.equal(normalized.height, def.rows * 128);
        assert.equal(normalized.contentBounds.length, def.cols * def.rows);
        for (const bounds of normalized.contentBounds) assert.ok(bounds.sw > 0 && bounds.sh > 0, `${key} 存在空帧`);
        console.log(`PASS: raw 条带 ${key} 排除烘焙并按 alpha 归一化为 ${normalized.width}x${normalized.height}`);
    }
})().catch(error => {console.error(error); process.exitCode = 1;});
