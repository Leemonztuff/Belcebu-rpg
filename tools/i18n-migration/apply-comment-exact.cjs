#!/usr/bin/env node
// Applies the exact comment translation map (comment-exact.json) to files.
// Only touches comment lines; idempotent.
const fs = require('fs');
const HAN_RE = /[\u4e00-\u9fff]/;
const map = JSON.parse(fs.readFileSync(__dirname + '/comment-exact.json', 'utf8'));

let applied = 0, missing = [];
const files = new Set();
// Find every comment line containing Han and try exact match on its core text
const allFiles = fs.readdirSync('.').filter(f => f.endsWith('.js'))
  .concat(['style.css', 'index.html', 'sw.js'],
    fs.existsSync('pb_hooks') ? fs.readdirSync('pb_hooks').map(f => 'pb_hooks/' + f) : [],
    fs.existsSync('pb_migrations') ? fs.readdirSync('pb_migrations').map(f => 'pb_migrations/' + f) : []);

for (const file of allFiles) {
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) continue;
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split('\n');
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!HAN_RE.test(line)) continue;
    const trimmed = line.trim();
    const isLeading = trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*');
    let out = null;
    if (isLeading) {
      const indent = line.match(/^\s*/)[0];
      const m = trimmed.match(/^(\/\/+|\/\*\*?|\*+)\s*/);
      const marker = m ? m[1] : '';
      let core = trimmed.slice(marker.length);
      let tailClose = '';
      if (/\*\/\s*$/.test(core)) { tailClose = ' */'; core = core.replace(/\*\/\s*$/, ''); }
      const key = core.trim();
      if (HAN_RE.test(key)) {
        const en = map[key];
        if (en !== undefined) out = indent + marker + (en ? ' ' + en : '') + tailClose;
      }
    } else {
      const idx = line.indexOf('//');
      if (idx !== -1) {
        const before = line.slice(0, idx);
        // Only skip when the code before // still has unbalanced quotes (comment inside a string)
        const sq = (before.match(/'/g) || []).length;
        const dq = (before.match(/"/g) || []).length;
        const bt = (before.match(/`/g) || []).length;
        if (sq % 2 === 0 && dq % 2 === 0 && bt % 2 === 0) {
          const seg = line.slice(idx);
          const sm = seg.match(/^\/+/);
          const smarker = sm ? sm[0] : '//';
          const key = seg.slice(smarker.length).trim();
          if (HAN_RE.test(key)) {
            const en = map[key];
            if (en !== undefined) out = before + smarker + (en ? ' ' + en : '');
          }
        }
      }
    }
    if (out !== null) {
      lines[i] = out;
      changed = true;
      applied++;
      files.add(file);
    }
  }
  if (changed) fs.writeFileSync(file, lines.join('\n'));
}
console.log(`applied=${applied} files=${files.size}`);
