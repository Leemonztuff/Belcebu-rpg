#!/usr/bin/env node
/* eslint-disable */
// One-off: replace zh fallbacks inside I18N.tr/I18N.trPath/I18N.tOr calls with
// the EN value taken from the i18n-content-* tables. Only rewrites the third
// argument when it currently contains Han and a matching EN value is found.
// Usage: node tools/i18n-migration/fix-fallbacks.cjs <file...>
const fs = require('fs');
const path = require('path');

// Load {table: {key: enValue}} from all i18n-content-*.js at project root
const ROOT = path.resolve(__dirname, '../..');
const tables = {};
for (const f of fs.readdirSync(ROOT)) {
  if (/^i18n-content-.+\.js$/.test(f)) {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    const re = /^\s{4,8}([a-zA-Z_0-9]+):\s*\{\s*es:\s*('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")\s*,\s*en:\s*('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/gm;
    let name = null;
    const nm = src.match(/registerTable\('([a-zA-Z]+)'/);
    name = nm ? nm[1] : f;
    tables[name] = tables[name] || {};
    let m;
    while ((m = re.exec(src)) !== null) {
      const key = m[1];
      let en = m[3];
      // strip quotes
      en = en.slice(1, -1);
      tables[name][key] = en;
    }
  }
}
// Also include top-level locales EN for tOr fallbacks
{
  const src = fs.readFileSync(path.join(ROOT, 'i18n.js'), 'utf8');
  const start = src.indexOf('        en: {');
  const end = src.indexOf('        zh: {');
  const enBlock = src.slice(start, end);
  const re = /^\s{12}([a-zA-Z_0-9]+):\s*"((?:[^"\\]|\\.)*)"/gm;
  const map = {};
  let m;
  while ((m = re.exec(enBlock)) !== null) map[m[1]] = m[2];
  tables.__locales = map;
}

const HAN_RE = /[\u4e00-\u9fff]/;

function processFile(file) {
  let src = fs.readFileSync(file, 'utf8');
  let count = 0;
  // I18N.tr('table', 'key', 'fallback', ...) or I18N.trPath(...)
  src = src.replace(/I18N\.(?:tr|trPath)\('([a-zA-Z]+)',\s*'([a-zA-Z_0-9]+)'/g, (full, table, key) => {
    // look at the remainder after this match for a zh fallback string literal
    return full;
  });
  // Simpler approach: regex over the whole call's first two args, then patch
  // a Han string literal that follows on the same logical argument chain.
  src = src.replace(
    /(I18N\.(?:tr|trPath|tOr)\((?:'([a-zA-Z]+)',\s*)?'([a-zA-Z_0-9]+)',\s*)('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g,
    (full, head, table, key, fb) => {
      if (!HAN_RE.test(fb)) return full;
      let enVal = null;
      if (table && tables[table] && tables[table][key] !== undefined) enVal = tables[table][key];
      else if (tables.__locales[key] !== undefined) enVal = tables.__locales[key];
      if (enVal === null || enVal === undefined) return full;
      const quote = fb[0];
      if (quote !== '`' && enVal.indexOf(quote) !== -1) return full; // would break literal
      count++;
      return `${head}${quote}${enVal}${quote}`;
    }
  );
  fs.writeFileSync(file, src, 'utf8');
  return count;
}

let total = 0;
for (const f of process.argv.slice(2)) {
  const n = processFile(path.resolve(f));
  console.log(`${String(n).padStart(4)}  ${f}`);
  total += n;
}
console.log(`TOTAL fallback fixes: ${total}`);
