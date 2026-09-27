#!/usr/bin/env node
// Helper: list string literals containing Han in a JS file, skipping comments.
// Usage: node tools/i18n-migration/han-strings.cjs <file...>
const fs = require('fs');

const HAN_RE = /[\u4e00-\u9fff]/;

function stringsWithHan(src) {
  const res = [];
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') {
      let j = src.indexOf('\n', i);
      if (j === -1) j = n;
      i = j;
      continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      let j = src.indexOf('*/', i + 2);
      j = j === -1 ? n : j + 2;
      i = j;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') {
      const q = c;
      let j = i + 1;
      let raw = '';
      let closed = false;
      while (j < n) {
        const ch = src[j];
        if (ch === '\\') { raw += ch + (src[j + 1] || ''); j += 2; continue; }
        if (ch === q) { closed = true; break; }
        if (ch === '\n' && q !== '`') break;
        raw += ch;
        j++;
      }
      if (closed && HAN_RE.test(raw)) {
        const line = src.slice(0, i).split('\n').length;
        res.push({ line, raw, quote: q });
      }
      i = j + 1;
      continue;
    }
    i++;
  }
  return res;
}

for (const f of process.argv.slice(2)) {
  const src = fs.readFileSync(f, 'utf8');
  const hits = stringsWithHan(src);
  console.log(`=== ${f}: ${hits.length} string(s) with Han ===`);
  for (const h of hits.slice(0, 25)) {
    console.log(`${h.line}: ${JSON.stringify(h.raw).slice(0, 120)}`);
  }
  if (hits.length > 25) console.log(`... and ${hits.length - 25} more`);
}
