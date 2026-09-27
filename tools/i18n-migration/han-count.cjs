#!/usr/bin/env node
// Helper: count Han chars in comments vs string literals per file.
const fs = require('fs');
const HAN_RE = /[\u4e00-\u9fff]/;

function analyze(src) {
  let commentHan = 0, stringHan = 0;
  let i = 0; const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') {
      let j = src.indexOf('\n', i); if (j === -1) j = n;
      const seg = src.slice(i, j);
      if (HAN_RE.test(seg)) commentHan += (seg.match(/[\u4e00-\u9fff]/g) || []).length;
      i = j; continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      let j = src.indexOf('*/', i + 2); j = j === -1 ? n : j + 2;
      const seg = src.slice(i, j);
      if (HAN_RE.test(seg)) commentHan += (seg.match(/[\u4e00-\u9fff]/g) || []).length;
      i = j; continue;
    }
    if (c === "'" || c === '"' || c === '`') {
      const q = c; let j = i + 1; let raw = ''; let closed = false;
      while (j < n) {
        const ch = src[j];
        if (ch === '\\') { raw += ch + (src[j + 1] || ''); j += 2; continue; }
        if (ch === q) { closed = true; break; }
        if (ch === '\n' && q !== '`') break;
        raw += ch; j++;
      }
      if (HAN_RE.test(raw)) stringHan += (raw.match(/[\u4e00-\u9fff]/g) || []).length;
      i = closed ? j + 1 : j; continue;
    }
    i++;
  }
  return { commentHan, stringHan };
}

let tc = 0, ts = 0;
for (const f of process.argv.slice(2)) {
  const src = fs.readFileSync(f, 'utf8');
  const { commentHan, stringHan } = analyze(src);
  tc += commentHan; ts += stringHan;
  console.log(`${f}: comment=${commentHan} string=${stringHan}`);
}
console.log(`TOTAL comment=${tc} string=${ts}`);
