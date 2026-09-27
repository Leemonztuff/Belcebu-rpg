#!/usr/bin/env node
// extract-lines.js — dump every line containing CJK characters,
// annotated with file and line number, for batch translation review.
// Usage: node extract-lines.js <outfile> <file...>
const fs = require('fs');
const [out, ...files] = process.argv.slice(2);
const rows = [];
for (const f of files) {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  lines.forEach((l, i) => {
    if (/\p{Script=Han}/u.test(l)) rows.push(`${f}:${i + 1}: ${l}`);
  });
}
fs.writeFileSync(out, rows.join('\n') + '\n');
console.log(`Wrote ${rows.length} lines to ${out}`);
