#!/usr/bin/env node
// Restores garbled machine-translated comment lines back to their original zh text
// by matching each garbled EN line against the zh line it was translated from.
// Matching: for each file, align comment lines (in order) between HEAD and worktree.
const fs = require('fs');
const cp = require('child_process');
const HAN = /[\u4e00-\u9fff]/;
const garbled = JSON.parse(fs.readFileSync(__dirname + '/garbled.json', 'utf8'));
const byFile = {};
for (const e of garbled) (byFile[e.f] = byFile[e.f] || []).push(e);

let restored = 0, unmatched = 0, filesChanged = 0;
for (const [file, entries] of Object.entries(byFile)) {
  let head;
  try { head = cp.execSync('git show HEAD:' + JSON.stringify(file), { encoding: 'utf8', maxBuffer: 1e9 }); }
  catch (e) { console.error('no HEAD for', file); continue; }
  const headLines = head.split('\n');
  // collect comment line indexes from HEAD (lines containing //)
  const headComments = [];
  for (let i = 0; i < headLines.length; i++) {
    const L = headLines[i];
    if (!L.includes('//')) continue;
    const idx = L.indexOf('//');
    const core = L.slice(idx).replace(/^\/\/+\s*/, '').replace(/\*\/\s*$/, '').trim();
    headComments.push({ i, core });
  }
  const cur = fs.readFileSync(file, 'utf8').split('\n');
  // map garbled entries to current line numbers; walk HEAD comments with a pointer
  // For each current comment line (any), if it matches a garbled entry line, find the
  // corresponding HEAD comment by order within the same file (comments keep relative order).
  const curCommentIdx = [];
  for (let i = 0; i < cur.length; i++) if (cur[i].includes('//')) curCommentIdx.push(i);
  // order alignment: garbled entries sorted by line; HEAD comments sorted by line
  const garbledLines = entries.map(e => e.line).sort((a, b) => a - b);
  // find indexes of current comment lines in curCommentIdx for garbled lines
  const posInCommentList = garbledLines.map(line => curCommentIdx.indexOf(line - 1));
  // HEAD comment list index = position of this comment among all current comment lines
  const allCur = curCommentIdx.length;
  let changed = false;
  for (let k = 0; k < garbledLines.length; k++) {
    const pos = posInCommentList[k];
    if (pos === -1 || pos >= headComments.length) { unmatched++; continue; }
    const hc = headComments[pos];
    const line = garbledLines[k] - 1;
    const e = entries.find(x => x.line === garbledLines[k]);
    // rebuild original HEAD comment line
    const orig = headLines[hc.i];
    if (!HAN.test(orig)) { unmatched++; continue; }
    if (e && e.before !== undefined && e.marker !== undefined && cur[line] !== undefined) {
      // trailing comment: keep code part from current, restore zh comment part
      cur[line] = e.before + orig.slice(orig.indexOf('//'));
    } else {
      cur[line] = orig;
    }
    changed = true;
    restored++;
  }
  if (changed) { fs.writeFileSync(file, cur.join('\n')); filesChanged++; }
}
console.log(`restored=${restored} unmatched=${unmatched} files=${filesChanged}`);
