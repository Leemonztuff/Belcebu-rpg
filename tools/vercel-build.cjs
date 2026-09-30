#!/usr/bin/env node
// Vercel build: copy the whole static game into dist/ (the whole app is static).
// Keeps server-side files out: server.js, pb_hooks, pb_migrations are not needed by the browser.
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const out = path.join(root, 'dist');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

// Files and dirs copied verbatim
const files = [
  'index.html', 'manifest.json', 'sw.js', 'bun.lock',
  'style.css', 'skill-art.css',
  'gsap.min.js', 'pixi.min.js', 'pixi-effects.js', 'pocketbase.umd.js'
];
// src/ 是全部浏览器端游戏代码，整体复制保持子目录结构
const dirs = ['art', 'public', 'src'];

for (const f of files) {
  if (fs.existsSync(path.join(root, f))) fs.copyFileSync(path.join(root, f), path.join(out, f));
}
for (const d of dirs) {
  if (fs.existsSync(path.join(root, d))) fs.cpSync(path.join(root, d), path.join(out, d), { recursive: true });
}

// Top-level loose assets (png/webp/mp3/mp4/json/ico)
for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  if (/\.(png|webp|mp3|mp4|ogg|wav|ico|json)$/.test(entry.name) && entry.name !== 'package-lock.json') {
    fs.copyFileSync(path.join(root, entry.name), path.join(out, entry.name));
  }
}

const count = fs.readdirSync(out).length;
console.log(`vercel-build: copied ${count} entries into dist/`);
