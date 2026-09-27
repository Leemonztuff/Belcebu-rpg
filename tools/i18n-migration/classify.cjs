#!/usr/bin/env node
// classify.cjs — split CJK lines into "comment" vs "string" (code) buckets per file.
// Comment heuristics: line trims to // or /* or *; or the only Han text is inside a
// trailing // comment or a /* ... */ span. Everything containing Han inside quotes
// (outside comments) counts as a string line.
const fs = require('fs');
const files = process.argv.slice(2);
let commentTotal = 0, stringTotal = 0;
for (const f of files) {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  let inBlock = false;
  let c = 0, s = 0;
  const han = /[\p{Script=Han}]/u;
  lines.forEach((raw) => {
    if (!han.test(raw)) return;
    const line = raw;
    const trimmed = line.trim();
    if (inBlock || trimmed.startsWith('/*')) {
      if (!inBlock && trimmed.includes('*/') && trimmed.indexOf('*/') > trimmed.indexOf('/*')) inBlock = false;
      else inBlock = true;
      c++; return;
    }
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) { c++; return; }
    // Strip trailing // comments for string detection
    let codePart = line;
    const idx = line.indexOf('//');
    if (idx >= 0) codePart = line.slice(0, idx);
    if (han.test(codePart)) s++;
    else c++;
  });
  console.log(`${f}: comment=${c} string=${s}`);
  commentTotal += c; stringTotal += s;
}
console.log(`TOTAL comment=${commentTotal} string=${stringTotal}`);
