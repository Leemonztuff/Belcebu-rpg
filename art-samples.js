// Native game transparent atlases: only slice frames and align; no color-keying of any pixel.
const ArtSamples = (() => {
    const atlases = new Map();
    const loading = new Map();
    let pending = 0;
    let loadError = null;
    const definitions = {
        heroHurt: { file: 'hero-hurt-painted.png', cols: 4, rows: 4 },
        melee: { file: 'monster-imp-painted.png', cols: 8, rows: 4 },
        zombie: { file: 'monster-zombie-painted.png', cols: 8, rows: 4 },
        ranged: { file: 'monster-archer-painted.png', cols: 8, rows: 4 },
        ruins: { file: 'ruins-props-painted.png', cols: 2, rows: 3 }
    };
// 4-frame one-way runtime strips for casting and death: skip the baked atlas manifest; normalize by alpha at load time.
    definitions.heroCastSheet = { file: 'public/spritesheets/Npc-06_cast_animation.webp', cols: 4, rows: 1, raw: true };
    definitions.heroDeathSheet = { file: 'public/spritesheets/Npc-06-death.webp', cols: 4, rows: 1, raw: true };
    for (const action of ['idle', 'walk', 'attack', 'cast', 'sit', 'walkDiagonal']) {
        definitions[`hero${action}`] = { file: `hero-${action}-painted.png`, cols: 4, rows: 4 };
    }
    for (const type of ['skeleton', 'shaman', 'mummy', 'ghost', 'specter', 'vampire', 'bloodRaven', 'countess', 'butcher', 'duriel', 'diablo', 'baal']) {
        definitions[type] = { file: `monster-${type}-painted.png`, cols: 8, rows: 4 };
    }
    const deathGroups = [
        ['hero','melee','zombie','ranged'], ['skeleton','shaman','mummy','ghost'],
        ['specter','vampire','bloodRaven','countess'], ['butcher','duriel','diablo','baal']
    ];
    const deaths = {};
    deathGroups.forEach((types, group) => {
        const key = `death${group}`;
        definitions[key] = {file:`death-${'abcd'[group]}-painted.png`,cols:4,rows:4};
        types.forEach((type,row) => { deaths[type] = {key,row}; });
    });
    // Measure the body scale manually from head to toe; weapons and VFX do not take part in body scaling.
// Horizontal anchors are marked at each frame's two-foot support center (as a share of the frame's visible width).
    const heroCalibration = {
        heroidle: [0.18, [0.53,0.53,0.53,0.53, 0.44,0.44,0.44,0.44, 0.59,0.59,0.59,0.59, 0.4,0.4,0.4,0.4]],
        herowalk: [0.187, [0.53,0.53,0.53,0.53, 0.44,0.44,0.44,0.44, 0.56,0.56,0.56,0.56, 0.43,0.43,0.43,0.43]],
        heroattack: [0.19, [0.53,0.59,0.37,0.53, 0.44,0.59,0.45,0.44, 0.6,0.63,0.6,0.6, 0.4,0.64,0.35,0.4]],
        herocast: [0.184, [0.53,0.60,0.65,0.60, 0.44,0.48,0.40,0.44, 0.60,0.65,0.64,0.58, 0.4,0.43,0.33,0.4]],
        herosit: [0.22, [0.47,0.47,0.47,0.47, 0.43,0.43,0.43,0.43, 0.6,0.6,0.6,0.6, 0.42,0.42,0.42,0.42]],
        heroHurt: [0.195, [0.53,0.53,0.53,0.53, 0.44,0.44,0.44,0.44, 0.59,0.59,0.59,0.59, 0.4,0.4,0.4,0.4]],
        herowalkDiagonal: [0.21, [0.52,0.52,0.52,0.52, 0.43,0.43,0.43,0.43, 0.43,0.43,0.43,0.43, 0.43,0.43,0.43,0.43]]
    };
    for (const [key,[bodyHeight,footX]] of Object.entries(heroCalibration)) {
        definitions[key].calibration = {bodyHeight,targetHeight:80,footX};
    }

    function heroFrame(action, direction, frameIndex) {
        const diagonals = ['frontLeft', 'frontRight', 'backLeft', 'backRight'];
        if (action === 'walk' && diagonals.includes(direction)) {
            return frame('herowalkDiagonal', diagonals.indexOf(direction), frameIndex);
        }
        const row = direction.startsWith('back') ? 1 : direction.endsWith('Left') || direction === 'left' ? 2
            : direction.endsWith('Right') || direction === 'right' ? 3 : 0;
        return frame(action === 'hurt' ? 'heroHurt' : `hero${action}`, row, frameIndex);
    }

// Frame selection for one-way 4-frame strips. Strips carry their own source and can draw directly, bypassing the old atlas.
// Death uses the same off-balance first-frame body scale as deathFrame; kneel/prone are not enlarged per frame.
    function heroSheetFrame(key, frameIndex, flipX = false) {
        if (!atlases.has(key)) return null;
        const sample = frame(key, 0, frameIndex, flipX);
        if (!sample) return null;
        if (key === 'heroDeathSheet') {
            const living = frame('heroidle', 0, 0);
            const first = frame(key, 0, 0);
            if (living && first) return { ...sample, death: true, renderScale: living.contentBounds.sh * 0.92 / first.contentBounds.sh };
        }
        return sample;
    }

    function deathFrame(type, elapsed, collapseDuration, flipX = false) {
        const mapping = deaths[type];
        if (!mapping) return null;
        const index = Math.max(0, Math.min(3, Math.floor(elapsed / collapseDuration * 4)));
        const sample = frame(mapping.key, mapping.row, index, flipX);
        const first = frame(mapping.key, mapping.row, 0);
        const living = frame(type === 'hero' ? 'heroidle' : type, 0, 0);
        if (!sample || !living) return null;
        // Calibrate each category only once with the off-balance first frame and standing pose; later kneel/prone poses keep the same body scale.
        return {...sample, death:true, renderScale:living.contentBounds.sh * 0.92 / first.contentBounds.sh};
    }

    function normalizeAtlas(source, cols, rows, calibration) {
        const scan = document.createElement('canvas');
        scan.width = source.width; scan.height = source.height;
        const scanContext = scan.getContext('2d');
        scanContext.drawImage(source, 0, 0);
        const data = scanContext.getImageData(0, 0, scan.width, scan.height).data;
        let transparent = 0;
        for (let i = 3; i < data.length; i += 4) if (data[i] === 0) transparent++;
        if (transparent < source.width * source.height * 0.15) throw new Error('Art template lacks a real alpha channel');
        // Generated art gutters are not necessarily even: look for nearby transparent divider lines; never cut characters to cram them into cells.
        function gutters(count, size, projection, optional = false) {
            const cuts=[0];
            for(let i=1;i<count;i++) {
                const ideal=i*size/count, radius=size/count*0.3;
                let best=-1;
                for(let at=Math.max(1,Math.ceil(ideal-radius));at<Math.min(size,ideal+radius);at++) {
                    if(projection[at]===0 && (best<0 || Math.abs(at-ideal)<Math.abs(best-ideal))) best=at;
                }
                if(best<0) {
                    if (optional) return null;
                    throw new Error(`Art template frames overlap: separator ${i} has no transparent padding`);
                }
                cuts.push(best);
            }
            return [...cuts,size];
        }
        const rowProjection=new Uint32Array(source.height);
        for(let y=0;y<source.height;y++) for(let x=0;x<source.width;x++) if(data[(y*source.width+x)*4+3]>12) rowProjection[y]++;
        const rowCuts=gutters(rows,source.height,rowProjection,true);
        const regions = new Array(rows*cols);
        if (rowCuts) for (let row = 0; row < rows; row++) {
            const y0=rowCuts[row], y1=rowCuts[row+1];
            const colProjection=new Uint32Array(source.width);
            for(let y=y0;y<y1;y++) for(let x=0;x<source.width;x++) if(data[(y*source.width+x)*4+3]>12) colProjection[x]++;
            const colCuts=gutters(cols,source.width,colProjection);
            for (let col = 0; col < cols; col++) {
            const x0=colCuts[col], x1=colCuts[col+1];
            regions[row*cols+col]={x0,x1,y0,y1};
            }
        } else {
            // When no horizontal gutters run across the sheet, verify vertical dividers column by column; cutting opaque pixels is still not allowed.
            const colProjection=new Uint32Array(source.width);
            for(let y=0;y<source.height;y++) for(let x=0;x<source.width;x++) if(data[(y*source.width+x)*4+3]>12) colProjection[x]++;
            const colCuts=gutters(cols,source.width,colProjection);
            for(let col=0;col<cols;col++) {
                const x0=colCuts[col],x1=colCuts[col+1], projection=new Uint32Array(source.height);
                for(let y=0;y<source.height;y++) for(let x=x0;x<x1;x++) if(data[(y*source.width+x)*4+3]>12) projection[y]++;
                const cuts=gutters(rows,source.height,projection);
                for(let row=0;row<rows;row++) regions[row*cols+col]={x0,x1,y0:cuts[row],y1:cuts[row+1]};
            }
        }
        const bounds = regions.map(({x0,x1,y0,y1},index) => {
            let left=x1, right=-1, top=y1, bottom=-1;
            for (let y=y0;y<y1;y++) for(let x=x0;x<x1;x++) if(data[(y*source.width+x)*4+3]>12) {
                left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
            }
            if (right < left) throw new Error(`Art template has an empty frame ${Math.floor(index/cols)}:${index%cols}`);
            return { x:left, y:top, width:right-left+1, height:bottom-top+1 };
        });
        // The whole sheet shares one scale so smaller poses are not enlarged individually, which causes breathing-like jitter.
        if (calibration && (!(calibration.bodyHeight > 0) || !(calibration.targetHeight > 0) || calibration.footX.length !== bounds.length
            || calibration.footX.some(x => !Number.isFinite(x) || x < 0 || x > 1))) throw new Error('Character body gauge or foot anchor invalid');
        const scale = calibration ? calibration.targetHeight / (source.height * calibration.bodyHeight)
            : Math.min(88 / Math.max(...bounds.map(b=>b.height)), 112 / Math.max(...bounds.map(b=>b.width)));
        const atlas = document.createElement('canvas');
        atlas.width = cols * 128; atlas.height = rows * 128;
        const ctx = atlas.getContext('2d');
        atlas.contentBounds = [];
        bounds.forEach((b, i) => {
            const w=b.width*scale, h=b.height*scale;
            const cellX=(i%cols)*128, cellY=Math.floor(i/cols)*128;
            const x=cellX+64-w*(calibration ? calibration.footX[i] : 0.5), y=cellY+124-h;
            if (x < cellX || x+w > cellX+128 || y < cellY) throw new Error(`Character gauge out of bounds: frame ${i}; fix body measurements or anchor`);
            ctx.drawImage(source,b.x,b.y,b.width,b.height,x,y,w,h);
            atlas.contentBounds.push({sx:x,sy:y,sw:w,sh:h});
        });
        scan.width=0;scan.height=0;
        return atlas;
    }

    function load(key, definition) {
        return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
// Asset input boundary: reject non-conforming images; existing atlases can still draw.
            try {
                atlases.set(key, prepareSource(image, definition)); resolve(key);
                if (typeof window !== 'undefined') window.dispatchEvent(new Event('art-atlas-loaded'));
            }
            catch (error) { reject(error); }
        };
        image.onerror = () => reject(new Error(`${definition.file} load failed`));
        image.src = `${assetPath(definition.file)}?v=2026090702`;
        });
    }

    function assetPath(file) {
        if (typeof ArtAtlasManifest === 'undefined') return file;
        const entry=ArtAtlasManifest[file];
        return entry ? (entry.runtimeFile || entry.file) : file;
    }
    function prepareSource(image, definition) {
// If the manifest has an entry, reuse the baked result; raw strips have none and normalize by alpha at runtime.
        const entry = typeof ArtAtlasManifest === 'undefined' ? null : ArtAtlasManifest[definition.file];
        if (!entry) return normalizeAtlas(image, definition.cols, definition.rows, definition.calibration);
        if (image.width !== entry.width || image.height !== entry.height || entry.contentBounds.length !== definition.cols * definition.rows) {
            throw new Error(`Prebuilt atlas does not match the manifest: ${definition.file}`);
        }
        image.contentBounds = entry.contentBounds;
        return image;
    }

    function frame(key, row, col, flipX = false) {
        const source=atlases.get(key);
        if (!source) {
            if (!loading.has(key)) ensure([key]).catch(error=>console.error('[Art Atlas] on-demand load failed',error));
            return null;
        }
        return { source, x:col*128, y:row*128, width:128, height:128, flipX, animated:true,
            contentBounds:source.contentBounds[row*definitions[key].cols+col] };
    }
    function ensure(keys) {
        return Promise.all([...new Set(keys)].map(key=>{
            if (!definitions[key]) throw new Error(`Unknown art atlas: ${key}`);
            if (!loading.has(key)) {
                pending++;
                const request=load(key,definitions[key]).finally(()=>{pending--;});
                request.catch(error=>{loadError=error;console.error('[Art Atlas] load failed',error);});
                loading.set(key,request);
            }
            return loading.get(key);
        }));
    }
    function ensureMonsters(types) {
        return ensure(types.flatMap(type=>[type,deaths[type].key]));
    }
    const ready = ensure([...Object.keys(heroCalibration),'death0','ruins','heroCastSheet','heroDeathSheet']);
    ready.catch(error => console.error('[Art Atlas] validation failed', error));
    return { frame, heroFrame, heroSheetFrame, deathFrame, normalizeAtlas, prepareSource, assetPath, definitions, ready, ensure, ensureMonsters, isLoaded:key=>atlases.has(key), get pending(){return pending;}, get loadError(){return loadError;} };
})();
