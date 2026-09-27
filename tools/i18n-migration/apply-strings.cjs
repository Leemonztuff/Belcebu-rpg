#!/usr/bin/env node
/* eslint-disable */
// One-off migration helper: replace zh string literals with EN translations.
// Whole-literal replacement via a small tokenizer so comments, escapes and
// template literals are respected. Usage:
//   node tools/i18n-migration/apply-strings.cjs <file...>
const fs = require('fs');
const path = require('path');

const HERE = __dirname;
const dict = Object.assign(
  {},
  JSON.parse(fs.readFileSync(path.join(HERE, 'zh-en-dict.json'), 'utf8')),
  JSON.parse(fs.readFileSync(path.join(HERE, 'en-missing.json'), 'utf8')),
  JSON.parse(fs.readFileSync(path.join(HERE, 'en-missing-tmpl.json'), 'utf8'))
);

const HAN_RE = /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/;

function processFile(file) {
  const src = fs.readFileSync(file, 'utf8');
  let out = '';
  let i = 0;
  let replaced = 0;
  const skipped = [];
  const n = src.length;
  while (i < n) {
    const c = src[i];
    // line comments
    if (c === '/' && src[i + 1] === '/') {
      let j = src.indexOf('\n', i);
      if (j === -1) j = n;
      out += src.slice(i, j);
      i = j;
      continue;
    }
    // block comments
    if (c === '/' && src[i + 1] === '*') {
      let j = src.indexOf('*/', i + 2);
      j = j === -1 ? n : j + 2;
      out += src.slice(i, j);
      i = j;
      continue;
    }
    // string literals
    if (c === "'" || c === '"' || c === '`') {
      const quote = c;
      let j = i + 1;
      let raw = '';
      let closed = false;
      while (j < n) {
        const ch = src[j];
        if (ch === '\\') {
          raw += ch + (src[j + 1] !== undefined ? src[j + 1] : '');
          j += 2;
          continue;
        }
        if (ch === quote) { closed = true; break; }
        if (ch === '\n' && quote !== '`') break; // unterminated: treat as plain char
        raw += ch;
        j++;
      }
      if (closed && raw.length > 0 && Object.prototype.hasOwnProperty.call(dict, raw)) {
        const val = dict[raw];
        // Safety: an unescaped quote char inside the value would break the literal
        const breaksLiteral = quote !== '`' && val.indexOf(quote) !== -1;
        if (!breaksLiteral) {
          out += quote + val + quote;
          replaced++;
          i = j + 1;
          continue;
        }
        skipped.push(raw);
      }
      out += src.slice(i, j + (closed ? 1 : 0));
      i = closed ? j + 1 : j;
      continue;
    }
    out += c;
    i++;
  }
  if (replaced > 0) fs.writeFileSync(file, out, 'utf8');
  return { replaced, skipped };
}

const files = process.argv.slice(2);
let total = 0;
for (const f of files) {
  const p = path.resolve(f);
  const { replaced, skipped } = processFile(p);
  console.log(`${String(replaced).padStart(4)}  ${f}`);
  for (const s of skipped) console.log(`  SKIP(quote): ${s.slice(0, 60)}`);
  total += replaced;
}
console.log(`TOTAL replaced: ${total}`);
