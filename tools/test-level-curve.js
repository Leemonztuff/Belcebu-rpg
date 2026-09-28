// Locks the level curve: what a level costs, what it gives, and the fact that
// every code path levelling the player shares one polynomial curve.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const gameSource = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
const constantsScope = vm.createContext({ console });
vm.runInContext(fs.readFileSync(path.join(root, 'constants.js'), 'utf8') + '\nthis.cfg = GAME_CONFIG;', constantsScope);
const CURVE = constantsScope.cfg.LEVEL_CURVE;
const getXpForLevel = n => CURVE.getXpForLevel(n);

const start = gameSource.indexOf('function updateStats()');
const end = gameSource.indexOf('function updateStatsUI()');
assert.ok(start >= 0 && end > start, 'no se pudo extraer updateStats');
const updateStatsSource = gameSource.slice(start, end);

const SLOTS = ['helm', 'body', 'mainhand', 'offhand', 'gloves', 'boots', 'belt', 'ring', 'ring2', 'amulet'];
const START = { str: 15, dex: 15, vit: 20, ene: 10 };

// Run the real updateStats so the test locks shipped behaviour, not a copy.
function roll({ str, dex, vit, ene, lvl }) {
    const player = {
        str, dex, vit, ene, lvl,
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
        damage: player.damage[0], maxHp: player.maxHp, maxMp: player.maxMp
    };
}

const test = (name, fn) => { fn(); console.log(`PASS ${name}`); };

// Monster XP is linear in the floor and a floor-appropriate monster sits at
// level*2, so this is how many kills a level actually costs in the open world.
const xpPerKill = level => 20 + Math.ceil(level / 2) * 5;
const killsToLevel = level => Math.ceil(getXpForLevel(level) / xpPerKill(level));

test('la curva de nivel esta centralizada en GAME_CONFIG', () => {
    assert.ok(CURVE, 'GAME_CONFIG.LEVEL_CURVE debe existir');
    for (const key of ['XP_BASE', 'XP_LINEAR', 'XP_QUADRATIC', 'DAMAGE_PER_LEVEL', 'HP_PER_LEVEL', 'MP_PER_LEVEL']) {
        assert.equal(typeof CURVE[key], 'number', `falta ${key}`);
    }
    assert.equal(typeof CURVE.getXpForLevel, 'function', 'falta getXpForLevel');
});

test('updateStats lee la curva de nivel y no tiene coeficientes magicos', () => {
    assert.ok(updateStatsSource.includes('GAME_CONFIG.LEVEL_CURVE'),
        'updateStats debe leer la curva central');
    const code = updateStatsSource.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
    for (const literal of ['* 10;', '* 5;']) {
        assert.ok(!code.includes(`maxHp${literal}`) && !code.includes(`maxMp${literal}`),
            `updateStats todavia tiene el coeficiente magico "${literal}"`);
    }
});

test('un personaje recien creado no cambia', () => {
    // Every per-level term is (level - 1) based, so level 1 must be identical
    // to the pre-curve values the attribute test pins.
    assert.equal(getXpForLevel(1), 100, 'nivel 1 -> 2 sigue pidiendo 100 xp');
    const fresh = roll({ ...START, lvl: 1 });
    assert.deepEqual(fresh.damage, 8, 'el dano inicial sigue siendo 8');
    assert.equal(fresh.maxHp, 100, 'la vida inicial sigue siendo 100');
    assert.equal(fresh.maxMp, 30, 'el mana inicial sigue siendo 30');
    const noLevel = roll({ ...START });
    assert.deepEqual(noLevel, fresh, 'un guardado sin lvl debe comportarse como nivel 1');
});

test('el nivel entrega poder real aunque no se gasten puntos', () => {
    // maxHp used to be recomputed from vit alone, so the `maxHp += 10` in
    // checkLevelUp was overwritten before anything read it: levelling granted
    // nothing. These are the values the curve is meant to hand out.
    assert.deepEqual(roll({ ...START, lvl: 10 }), { damage: 12, maxHp: 190, maxMp: 75 });
    assert.deepEqual(roll({ ...START, lvl: 50 }), { damage: 28, maxHp: 590, maxMp: 275 });
    assert.deepEqual(roll({ ...START, lvl: 100 }), { damage: 48, maxHp: 1090, maxMp: 525 });
    // Levelling 1 -> 50 hands out 490 hp / 245 mp / +20 damage with no points spent.
    assert.equal(roll({ ...START, lvl: 50 }).maxHp - roll({ ...START, lvl: 1 }).maxHp, 490);
    assert.ok(roll({ ...START, lvl: 50 }).damage > roll({ ...START, lvl: 1 }).damage,
        'subir de nivel tiene que pegar mas fuerte');
});

test('la curva es polinomial: los kills por nivel crecen, pero no explotan', () => {
    // The old bar compounded 1.38 per level while monster XP only grew with the
    // floor, so kills per level went 650 -> 12k -> 4.9M between levels 20 and 50.
    assert.ok(killsToLevel(1) > 0);
    assert.ok(killsToLevel(10) >= killsToLevel(5), 'sube de forma monotona');
    assert.ok(killsToLevel(50) > killsToLevel(20), 'sube de forma monotona');
    const growth = killsToLevel(200) / killsToLevel(20);
    assert.ok(growth < 20,
        `los kills por nivel habrian explotado: 20 -> 200 es ${growth.toFixed(1)}x (la curva vieja daba 7582x en 20 -> 50)`);
});

test('los niveles infinitos siguen siendo viables', () => {
    for (const level of [100, 500, 1000, 5000]) {
        const needed = getXpForLevel(level);
        assert.ok(Number.isFinite(needed) && needed > 0, `nivel ${level}: xp debe ser finito y positivo`);
        assert.ok(killsToLevel(level) < 1e6, `nivel ${level}: los kills por nivel se salen de escala`);
    }
    // A quadratic bar over a linear income means the grind grows linearly, so
    // doubling the level can never more than roughly quadruple the work.
    assert.ok(getXpForLevel(200) / getXpForLevel(100) < 5, 'la barra escala de forma polinomial, no exponencial');
});

test('todo xpNext se deriva de la curva, sin una segunda formula', () => {
    // OfflineSystem.claim used to recompute the bar with a 1.15 curve while
    // in-game levelling compounded 1.38. Claiming offline rewards collapsed the
    // bar permanently (x7584 at level 50) and nothing ever corrected it.
    // Every write to xpNext must now go through the shared curve, otherwise the
    // two paths can drift apart again.
    const assignments = gameSource.match(/player\.xpNext\s*=[^;\n]*/g) || [];
    assert.ok(assignments.length >= 4, `se esperaban varias escrituras de xpNext, hay ${assignments.length}`);
    for (const line of assignments) {
        assert.ok(/getXpForLevel|expectedXpNext/.test(line),
            `xpNext se esta escribiendo fuera de la curva: "${line.trim()}"`);
    }
    // The save migration has to correct the bar in both directions: the old
    // check only fixed bars that were too HIGH, so a bar collapsed by the
    // offline claim stayed collapsed forever.
    const migration = gameSource.slice(gameSource.indexOf('LEVEL_CURVE.getXpForLevel(player.lvl)'));
    assert.ok(migration.includes('!== expectedXpNext'),
        'la migracion debe resincronizar cualquier xpNext que no sea el de la curva');
});

test('todas las vias de subida usan la curva y las recompensas compartidas', () => {
    assert.ok(gameSource.includes('function grantLevelRewards('), 'debe existir grantLevelRewards');
    const levelUps = gameSource.match(/getXpForLevel\(/g) || [];
    assert.equal(levelUps.length, 3,
        `checkLevelUp, el reclamo offline y la migracion deben leer la curva (encontre ${levelUps.length} usos)`);
    const grant = gameSource.match(/function grantLevelRewards\([\s\S]*?\n\}/);
    assert.ok(grant, 'no se pudo extraer grantLevelRewards');
    for (const effect of ['player.points += 5', 'player.skillPoints += 1', 'updateStats()',
        'triggerLevelUpEffect', 'reach_level', 'divineBlessing']) {
        assert.ok(grant[0].includes(effect),
            `grantLevelRewards debe incluir ${effect}: el offline antes lo salteaba`);
    }
    // The offline claim must pass silent=true so a multi-level claim does not
    // fire the full-screen burst once per level.
    assert.ok(/grantLevelRewards\(nextLevel, true\)/.test(gameSource), 'el reclamo offline debe ser silencioso');
    // And maxHp/maxMp must not be incremented directly outside updateStats
    // anymore: it owns them now, and anything written elsewhere is dead code.
    const outsideUpdateStats = gameSource.replace(updateStatsSource, '');
    assert.ok(!/player\.maxHp \+= /.test(outsideUpdateStats),
        'maxHp ya no se debe incrementar fuera de updateStats');
    assert.ok(!/player\.maxMp \+= /.test(outsideUpdateStats),
        'maxMp ya no se debe incrementar fuera de updateStats');
});

console.log(`\nCurva fijada: XP = ${CURVE.XP_BASE} + ${CURVE.XP_LINEAR}*n + ${CURVE.XP_QUADRATIC}*n^2 (n = nivel-1), ` +
    `+${CURVE.DAMAGE_PER_LEVEL} dano / +${CURVE.HP_PER_LEVEL} hp / +${CURVE.MP_PER_LEVEL} mp por nivel. ` +
    `Kills por nivel: 20->${killsToLevel(20)}, 50->${killsToLevel(50)}, 100->${killsToLevel(100)}, 1000->${killsToLevel(1000)}`);
