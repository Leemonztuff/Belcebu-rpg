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
  'i18n.js', 'i18n-content-bestiary.js', 'i18n-content-changelog.js',
  'i18n-content-gear.js', 'i18n-content-progression.js', 'i18n-content-skills.js',
  'i18n-content-social.js',
  'changelog.js', 'constants.js', 'items-data.js', 'set-items.js', 'runes-data.js',
  'item-system.js', 'audio.js', 'daily-quest.js', 'talent-draft.js', 'abyss-system.js',
  'share-card.js', 'season-system.js', 'return-bonus.js', 'save-system.js',
  'combat-tactics.js', 'enemy-system.js', 'auto-battle.js', 'vfx-manifest.js',
  'sprite-renderer.js', 'gsap.min.js', 'gsap-animations.js', 'ui-panels.js',
  'pixi.min.js', 'pixi-effects.js', 'elemental-3d.js', 'physical-3d.js',
  'shield-3d.js', 'skill-art.js', 'skill-branches.js', 'environment-art.js',
  'art-samples.js', 'online.js', 'market.js', 'pocketbase.umd.js', 'game.js'
];
const dirs = ['art', 'public'];

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
