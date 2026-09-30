const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const gameSource = fs.readFileSync(path.join(root, 'src/core/game.js'), 'utf8');

// Load constants.js to read GAME_CONFIG.ATTRIBUTE_CURVE directly.
const constantsScope = vm.createContext({ console });
vm.runInContext(fs.readFileSync(path.join(root, 'src/data/constants.js'), 'utf8') + '\nthis.cfg = GAME_CONFIG;', constantsScope);
const CURVE = constantsScope.cfg.ATTRIBUTE_CURVE;

// Extract the real updateStats so the test locks shipped behaviour, not a copy of the formula.
const start = gameSource.indexOf('function updateStats()');
const end = gameSource.indexOf('function updateStatsUI()');
assert.ok(start >= 0 && end > start, 'no se pudo extraer updateStats');
const updateStatsSource = gameSource.slice(start, end);

const SLOTS = ['helm', 'body', 'mainhand', 'offhand', 'gloves', 'boots', 'belt', 'ring', 'ring2', 'amulet'];

// Run the real updateStats with a bare player. No gear, no sets, no talents,
// no blessings: whatever it produces comes from the attributes alone.
function roll({ str, dex, vit, ene }) {
    const player = {
        str, dex, vit, ene,
        equipment: Object.fromEntries(SLOTS.map(s => [s, null])),
        resistances: { fire: 0, cold: 0, lightning: 0, poison: 0 },
        elementalDamage: { fire: 0, cold: 0, lightning: 0, poison: 0 }
    };
    const scope = vm.createContext({
        player,
        GAME_CONFIG: constantsScope.cfg,
        SET_ITEMS: {},
        console: { log() {} },
        calculateEquippedSets: () => ({}),
        getTalentEffect: () => 0,
        getDivineBlessingEffect: () => 0,
        checkSetAchievements() {},
        document: { getElementById: () => null }
    });
    vm.runInContext(updateStatsSource, scope);
    vm.runInContext('updateStats()', scope);
    return {
        damage: [...player.damage],
        maxHp: player.maxHp, maxMp: player.maxMp,
        armor: player.armor, critChance: player.critChance,
        critDamage: player.critDamage
    };
}

const test = (name, fn) => { fn(); console.log(`PASS ${name}`); };
const START = CURVE.START;
const atStart = roll(START);

// --- The curve is declared once, with the coefficients the balance depends on ---
test('la curva de atributos esta centralizada en GAME_CONFIG', () => {
    assert.ok(CURVE, 'GAME_CONFIG.ATTRIBUTE_CURVE debe existir');
    for (const key of ['STR_DAMAGE_SCALE', 'STR_DAMAGE_EXP', 'VIT_HP_PER_POINT',
        'ENE_MP_PER_POINT', 'DEX_ARMOR_PER_POINT', 'DEX_CRIT_PER_POINT', 'CRIT_BASE', 'CRIT_CAP',
        'DEX_CRIT_DAMAGE_PER_POINT', 'DEX_CRIT_DAMAGE_CAP']) {
        assert.equal(typeof CURVE[key], 'number', `falta ${key}`);
    }
    assert.ok(CURVE.STR_DAMAGE_EXP < 1, 'el exponente debe ser < 1 para que haya rendimientos decrecientes');
});

test('updateStats lee la curva y no tiene coeficientes magicos', () => {
    assert.ok(updateStatsSource.includes('GAME_CONFIG.ATTRIBUTE_CURVE'),
        'updateStats debe leer la curva central');
    // Scan code only: comments explain the old formula on purpose.
    const code = updateStatsSource
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/[^\n]*/g, '');
    for (const literal of ['vit * 5', 'ene * 3', 'dex * 0.5', 'str * 0.05', 'str / 5', 'Math.pow(str, 0.9)']) {
        assert.ok(!code.includes(literal),
            `updateStats aun tiene el coeficiente magico "${literal}"`);
    }
});

// --- Lock the exact numbers the current balance depends on ---
// These are the shipped values. Changing any of them is a balance change and
// must be a deliberate edit here, not an accident.
test('la curva produce el roll de dano actual', () => {
    assert.deepEqual(atStart.damage, [8, 11], 'atributos iniciales');
    assert.deepEqual(roll({ ...START, str: 40 }).damage, [18, 21], 'str 40');
    assert.deepEqual(roll({ ...START, str: 65 }).damage, [27, 30], 'str 65');
    assert.deepEqual(roll({ ...START, str: 90 }).damage, [36, 39], 'str 90');
    assert.deepEqual(roll({ ...START, str: 140 }).damage, [53, 56], 'str 140');
    assert.deepEqual(roll({ ...START, str: 514 }).damage, [167, 170], 'str 514 (nivel 100 todo en str)');
});

test('el dano base del personaje inicial no cambia', () => {
    // The concave curve is calibrated so a fresh character lands on the same
    // damage as before: early game must not feel different.
    assert.equal(atStart.damage[0], 8, 'str 15 sigue dando 8 de dano');
});

test('la curva produce el roll de vida, mana y armadura historico', () => {
    assert.equal(atStart.maxHp, 100, 'vit inicial -> 100 hp');
    assert.equal(atStart.maxMp, 30, 'ene inicial -> 30 mp');
    assert.equal(atStart.armor, START.dex, 'armadura inicial = dex');
    assert.equal(roll({ ...START, vit: 270 }).maxHp, 1350, 'vit 270 -> 1350 hp');
    assert.equal(roll({ ...START, ene: 270 }).maxMp, 810, 'ene 270 -> 810 mp');
    assert.equal(roll({ ...START, dex: 200 }).armor, 200, 'armadura = dex');
});

test('la curva produce el roll de critico historico', () => {
    assert.equal(atStart.critChance, 12.5, 'dex inicial -> 12.5%');
    assert.equal(roll({ ...START, dex: 120 }).critChance, 65, 'dex 120 -> 65%');
    assert.equal(roll({ ...START, dex: 190 }).critChance, 100, 'dex 190 -> tope');
    assert.equal(roll({ ...START, dex: 500 }).critChance, 100, 'dex 500 sigue topado');
});

// --- Isolation: only the attribute under test may move ---
test('cada atributo solo mueve lo que le corresponde', () => {
    const plus = (attr, by) => roll({ ...START, [attr]: START[attr] + by });
    assert.equal(plus('str', 10).maxHp, atStart.maxHp, 'str no toca hp');
    assert.equal(plus('str', 10).maxMp, atStart.maxMp, 'str no toca mp');
    assert.equal(plus('str', 10).armor, atStart.armor, 'str no toca armadura');
    assert.equal(plus('str', 10).critChance, atStart.critChance, 'str no toca critico');

    assert.equal(plus('vit', 10).maxMp, atStart.maxMp, 'vit no toca mp');
    assert.equal(plus('vit', 10).damage[0], atStart.damage[0], 'vit no toca dano');
    assert.equal(plus('vit', 10).armor, atStart.armor, 'vit no toca armadura');

    assert.equal(plus('ene', 10).maxHp, atStart.maxHp, 'ene no toca hp');
    assert.equal(plus('ene', 10).damage[0], atStart.damage[0], 'ene no toca dano');

    assert.equal(plus('dex', 10).maxHp, atStart.maxHp, 'dex no toca hp');
    assert.equal(plus('dex', 10).damage[0], atStart.damage[0], 'dex no toca dano');
    assert.equal(plus('dex', 10).maxMp, atStart.maxMp, 'dex no toca mp');
    // Under the crit cap dex gives no crit damage, so no other attribute leaks into it.
    assert.equal(plus('dex', 10).critDamage, atStart.critDamage, 'dex bajo el tope no da dano critico');
    assert.equal(plus('str', 10).critDamage, atStart.critDamage, 'str no toca dano critico');
    assert.equal(plus('vit', 10).critDamage, atStart.critDamage, 'vit no toca dano critico');
    assert.equal(plus('ene', 10).critDamage, atStart.critDamage, 'ene no toca dano critico');
});

// --- Known curve defects, pinned so a fix cannot land unnoticed ---
// These assert CURRENT behaviour including the two problems we want to fix in
// follow-up steps. When dex/str get rebalanced, these are the assertions to
// update deliberately - they are the tripwire, not the target.

test('FIX: dex aporta dano critico por encima del tope de critico', () => {
    const dexAtCap = (CURVE.CRIT_CAP - CURVE.CRIT_BASE) / CURVE.DEX_CRIT_PER_POINT;
    assert.equal(dexAtCap, 190, 'el tope de critico se alcanza en dex 190');
    // Under the cap nothing changes: this is the regression guard for every
    // existing build with 190 dex or less.
    for (const dex of [START.dex, 40, 100, 150, 189, 190]) {
        assert.equal(roll({ ...START, dex }).critDamage, 0, `dex ${dex} no debe dar dano critico`);
    }
    // Past the cap the overflow converts into crit damage.
    const overflow = (dex) => Math.min(CURVE.DEX_CRIT_DAMAGE_CAP,
        Math.max(0, dex - dexAtCap) * CURVE.DEX_CRIT_DAMAGE_PER_POINT);
    assert.equal(roll({ ...START, dex: 240 }).critDamage, overflow(240), 'dex 240');
    assert.equal(roll({ ...START, dex: 400 }).critDamage, overflow(400), 'dex 400');
    assert.equal(roll({ ...START, dex: 514 }).critDamage, overflow(514), 'dex 514 (nivel 100)');
    // Crit chance itself is still capped, so the new reward is the overflow only.
    assert.equal(roll({ ...START, dex: 514 }).critChance, CURVE.CRIT_CAP, 'critico sigue topado');
});

test('el dano critico de dex tiene tope y no se dispara', () => {
    const dexAtCap = (CURVE.CRIT_CAP - CURVE.CRIT_BASE) / CURVE.DEX_CRIT_PER_POINT;
    // Reaching the cap takes more dex than level 100 can buy (514), so the cap is a
    // safety rail for the long run, not a wall players hit in normal play.
    const dexToCap = dexAtCap + CURVE.DEX_CRIT_DAMAGE_CAP / CURVE.DEX_CRIT_DAMAGE_PER_POINT;
    assert.equal(dexToCap, 690, 'el tope se alcanza en dex 690');
    assert.ok(dexToCap > 15 + 99 * CURVE.POINTS_PER_LEVEL,
        'nivel 100 no alcanza el tope; si esto falla el balance de niveles cambio');
    assert.equal(roll({ ...START, dex: 2000 }).critDamage, CURVE.DEX_CRIT_DAMAGE_CAP, 'topado');
    // The cap matches the best 4-piece set bonus, so dex never out-earns the gear.
    assert.equal(CURVE.DEX_CRIT_DAMAGE_CAP, 100, 'el tope iguala al mejor set de 4 piezas');
});

test('FIX: str tiene rendimientos decrecientes, ya no super-lineal', () => {
    const dmg = (str) => roll({ ...START, str }).damage[0];
    // The analytic property: the curve is concave, so the derivative falls.
    const derivative = (str) => CURVE.STR_DAMAGE_SCALE * CURVE.STR_DAMAGE_EXP *
        Math.pow(str, CURVE.STR_DAMAGE_EXP - 1);
    assert.ok(derivative(30) > derivative(200), 'la derivada cae al subir str');
    assert.ok(derivative(200) > derivative(500), 'sigue cayendo cerca del final');

    // Over real 50-point windows, ignoring Math.floor jitter.
    const windows = [30, 80, 130, 180, 230, 280, 330, 380, 430, 480];
    const gains = windows.slice(1).map((from, i) => dmg(from + 50) - dmg(windows[i]));
    console.log(`      ganancia por 50 puntos: ${gains.join(', ')}`);
    const first = gains[0], last = gains[gains.length - 1];
    assert.ok(last < first, `el tramo final (+${last}) debe rendir menos que el inicial (+${first})`);

    // The whole level-1 to level-100 growth, previously 347x, is now ~21x.
    const growth = dmg(514) / dmg(START.str);
    assert.ok(growth < 25, `crecimiento total ${growth.toFixed(1)}x, debe quedar cerca de 20x`);
    assert.equal(dmg(514), 167, 'str 514 -> 167 de dano');
});

test('la curva de dano sigue creciendo: no crea otra zona muerta', () => {
    // Diminishing must not become capped: points past the last level still pay.
    const dmg = (str) => roll({ ...START, str }).damage[0];
    assert.ok(dmg(700) > dmg(514), 'dex/str siguen dando mas alla del nivel 100');
    assert.ok(dmg(2000) > dmg(700), 'no hay techo duro en la curva');
    assert.ok(dmg(2000) < dmg(514) * 4, 'pero el crecimiento se amortigua con la escala');
});

console.log(`\nCurva fijada: STR ${CURVE.STR_DAMAGE_SCALE} * str^${CURVE.STR_DAMAGE_EXP} (cóncava, rendimientos decrecientes), ` +
    `VIT x${CURVE.VIT_HP_PER_POINT}, ENE x${CURVE.ENE_MP_PER_POINT}, ` +
    `DEX x${CURVE.DEX_CRIT_PER_POINT} crit (cap ${CURVE.CRIT_CAP}) + x${CURVE.DEX_ARMOR_PER_POINT} armadura ` +
    `+ x${CURVE.DEX_CRIT_DAMAGE_PER_POINT} dano critico por encima de dex 190 (cap ${CURVE.DEX_CRIT_DAMAGE_CAP})`);
