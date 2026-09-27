// Update announcement data - player-facing simplified version
// Sort newest first (latest version on top)
const CHANGELOG = [
    {
        version: "7.15",
        date: "2026-06-13",
        title: 'Mobile UI Fixes',
        highlights: [
            'Fixed: health and mana orbs were squashed by the skill bar on narrow screens',
            'Added: menu icons show a red dot for unspent attribute points, skill points, quest rewards and pending blessings',
            'Added: the chat icon shows a red dot when the world channel has unread messages'
        ]
    },
    {
        version: "7.14",
        date: "2026-05-08",
        title: 'Class Skill Visual Progression',
        highlights: [
            'Fireball now adds bursting fire-rain impact points for a much heavier flame hit area',
            'Lightning Strike now chains nearby enemies into a grid, so group fights read far better',
            'Multishot trails and hit feedback upgrade to a volley of arrow beams',
            'Holy Shield now adds holy pillar lines and reflective mirror shards, making the shield branch far clearer',
            'The basic physical attack gained proper half-moon, whirlwind and earth-splitter tiers, following the thin-arc blade standard',
            'Visuals only: skill damage, cooldowns, drops and mana costs are unchanged'
        ]
    },
    {
        version: "7.13",
        date: "2026-05-07",
        title: 'Physical Sweep Blades',
        highlights: [
            'Once the basic physical attack grows enough in level or Strength, it unleashes cleave, half-moon and sweeping blades when surrounded',
            'Sweeps hit whole groups ahead, so auto battle clears crowds smoothly in melee',
            'Added layered half-moon slashes, a sweep tell and extra hit feedback for a punchier warrior feel',
            'Sweeps only trigger with enough nearby enemies and carry a target cap and damage multiplier, so no screen wiping'
        ]
    },
    {
        version: "7.12",
        date: "2026-05-07",
        title: 'Auto Battle Spawn Density',
        highlights: [
            'More monsters spawn per floor, so early floors are worth farming for loot too',
            'Respawns are now batched, so cleared packs come back faster',
            'Auto battle keeps a higher monster target, so you waste less time running around',
            'Spawn points retry several times, so one bad random position no longer skips a whole round'
        ]
    },
    {
        version: "7.11",
        date: "2026-05-07",
        title: 'Boss Fights, Dungeon Atmosphere & Loot Visuals',
        highlights: [
            'Added a top boss health bar, phase callouts and much clearer danger-zone warnings',
            'Boss floors now have their own arena, floor runes, themed lighting and scenery',
            'Stronger wall-base shadows, rubble and floor edge blending give the dungeon real depth',
            'Magic loot and above now drop a ground halo; Rare, Unique and Set items get clearer rarity flair',
            'Your active skills, sets and high-tier weapons tint the ground halo and melee slash color'
        ]
    },
    {
        version: "7.10",
        date: "2026-05-05",
        title: 'Character, Monster, VFX & Audio Upgrade',
        highlights: [
            'Redone VFX for skill hits, status effects, elite affixes and boss warnings',
            'Real thunder SFX, plus casting, hit and death sounds for the whole combat loop',
            'Added all diagonal walk frames for the hero, so movement no longer reuses front or back poses',
            'Regular monsters now attack and flinch with real animation, making hits and damage reactions read better'
        ]
    },
    {
        version: "7.09",
        date: "2026-05-01",
        title: 'Camp, Combat & UI Polish',
        highlights: [
            'Rogue Encampment and the dungeon keep getting richer in detail and depth',
            'Fixed stalls blocking the view, wrong spot selection and vendors facing the wrong way',
            'Added contact shadows under heroes, NPCs and monsters, so everyone stands on the ground',
            'Punchier skill impact bursts, monster flinch animations and combat sounds',
            'The skill bar, panels and skill tree now have a dark metal look'
        ]
    },
    {
        version: "7.08",
        date: "2026-05-01",
        title: 'Map, Character, Monster & Combat Upgrade',
        highlights: [
            'Redone dungeon walls, corners, floor structure and foreground occlusion give exploration real depth',
            'Stronger forest, ice and hell themes with firelight and cold glow ambience',
            'Many monster sprites redrawn with cleaner silhouettes and better readability',
            'Hero sprites and movement animations polished; side and diagonal steps look natural',
            'Physical attack sounds, elite affixes and monster behaviour differences tuned for clearer combat'
        ]
    },
    {
        version: "6.99",
        date: "2026-01-11",
        title: 'AFK Balance & Set Scaling',
        highlights: [
            'Whispers: click a player name or type @name to start a private chat',
            'World channel: quick emote panel to send your favourites in one click',
            'Bigger chat box, sized for portrait phones',
            'AFK mode: 20% set drop rate, 40% unique drop rate',
            'Set bonuses scale with floor depth (attack speed, damage%, crit damage, and more)'
        ]
    },
    {
        version: "6.98",
        date: "2026-01-10",
        title: 'World Channel Item Sharing',
        highlights: [
            'Added a \"Share to world channel\" button to the equipment tooltip',
            'Item links in chat are now clickable to inspect full stats',
            'Item links are colored by rarity'
        ]
    },
    {
        version: "6.97",
        date: "2026-01-10",
        title: 'Combat Overhaul',
        highlights: [
            'Fixed shields being ignored by some monsters',
            'Fixed Chain Lightning so drops, XP and achievements now trigger correctly',
            'Armor now reduces damage by a percentage (100 armor = 50% damage reduction)',
            'Selling set or upgraded gear now asks for confirmation'
        ]
    },
    {
        version: "6.96",
        date: "2026-01-06",
        title: 'Long AFK Performance',
        highlights: [
            'Minimap caching: only redraws when you explore a new area, 0 cost while AFK',
            'Item label optimization: DOM updates are skipped while the camera is still',
            'Occlusion fix optimized: reused Set plus bitwise encoding removes GC pressure'
        ]
    },
    {
        version: "6.95",
        date: "2026-01-06",
        title: 'Title Shop',
        highlights: [
            'The Mystic Sage now has a title shop: 7 titles (10K~500M gold)',
            'Purchase with ceremony: a gold deduction animation and a title unlock popup',
            'Titles above 1M gold trigger a server-wide announcement and show in chat and above your head'
        ]
    },
    {
        version: "6.94",
        date: "2026-01-05",
        title: 'High-Level Experience',
        highlights: [
            'Monster XP now grows exponentially, making deep floors far more efficient',
            'Level 40+ characters level 2-4x faster',
            'Fixed the shield skill 3rd stage not unlocking, and added shield sounds'
        ]
    },
    {
        version: "6.93",
        date: "2026-01-03",
        title: 'Auto Battle Hiring Fee',
        highlights: [
            'Turning on auto battle now costs a 15% gold hiring fee',
            'A confirmation panel pops up the first time (the game pauses)'
        ]
    },
    {
        version: "6.92",
        date: "2026-01-03",
        title: 'Death & Revival',
        highlights: [
            'Death panel: shows your run stats (floor, kills, level, cause of death)',
            'Revive in place: pay gold to come back, and the price grows with level/floor',
            'Safe revive: a spot away from enemies, 1.5s invulnerable and full health and mana'
        ]
    },
    {
        version: "6.91",
        date: "2026-01-03",
        title: 'Auto Battle Looting',
        highlights: [
            'Auto battle now picks up gear at range, just like gold and potions',
            'Fully fixes the \"unreachable\" problem when gear spawns in a corner'
        ]
    },
    {
        version: "6.9",
        date: "2026-01-02",
        title: 'Shield Skill Added',
        highlights: [
            'Added the Shield skill and its skill tree',
            'Shield visuals: a golden oval halo and a gold rim on your health orb',
            'Auto battle support: casts Shield automatically below 50% health',
            'Lightning Strike buffed: stages 2/3 call down more bolts (1→2→4) and prioritise groups'
        ]
    },
    {
        version: "6.8",
        date: "2026-01-02",
        title: 'Skill Tree',
        highlights: [
            'Skill tree rebuilt: every skill has 3 stages, with branching paths at stages 2/3',
            'Branch choice: once picked, the path is locked and you need a respec to change it',
            'Old saves migrate automatically: skill levels convert and spare points are refunded'
        ]
    },
    {
        version: "6.7",
        date: "2026-01-01",
        title: 'Codex',
        highlights: [
            'Set codex: collect set pieces and track your set progress',
            'Monster codex: records every monster and boss you have killed, with kill counts'
        ]
    },
    {
        version: "6.6",
        date: "2025-12-30",
        title: 'Abyss Challenge',
        highlights: [
            'Abyss challenge unlocked: endless floors plus a weekly leaderboard that resets and pays out rewards',
            'Abyss-exclusive rewards: the 6-piece Abyss Conqueror set and its own title'
        ]
    },
    {
        version: "6.5",
        date: "2025-12-25",
        title: 'Boss Skills & Weekly Leaderboard',
        highlights: [
            'Boss abilities upgraded: ranged, poison bolts, enrage, summons, cone and multi-direction attacks',
            'New weekly leaderboard: resets every Monday, and new players can climb it too!'
        ]
    },
    {
        version: "6.4",
        date: "2025-12-24",
        title: 'Cloud Sync & UI Polish',
        highlights: [
            'Cloud sync is live: a 6-character sync code, and multiple devices at once',
            'Cross-device session takeover: signing in on another browser or device is detected and your session moves over',
            'UI polish: the gsap library is now in, and animations run smoother'
        ]
    },
    {
        version: "6.3.2",
        date: "2025-12-22",
        title: 'Save Protection & Gear Requirements',
        highlights: [
            '🛡️Save protection: fixed a save loss that very fast clicking could cause',
            'Fixed set and unique gear that could not be equipped because of too-high requirements'
        ]
    },
    {
        version: "6.3.1",
        date: "2025-12-22",
        title: 'Safety Fixes & Boss Difficulty',
        highlights: [
            'Skill UI improved: unlearned skills are greyed out and tapping them shows a hint',
            'Sign-up flow: patch notes and nickname registration now appear in order, never overlapped',
            'Nickname safety: chat filter word list added, registration is blocked with a warning',
            'Bosses upgraded: much more health and damage, plus more upgrade drops'
        ]
    },
    {
        version: "6.3.0",
        date: "2025-12-21",
        title: 'Achievements & Offline Earnings',
        highlights: [
            'Achievements expanded: from 6 to 30, across kills, exploration, collection, combat, economy and growth',
            'The achievement panel now fits desktop and portrait phones perfectly',
            'Added offline earnings while you are away'
        ]
    },
    {
        version: "6.2",
        date: "2025-12-21",
        title: 'Game Feel Overhaul & Breakables',
        highlights: [
            'Breakables: barrels, crates and pots in the dungeon can now be smashed',
            'Hit stop, entity scaling and screen shake, all toggleable in General settings',
            'Physics drops: items now arc through the air and bounce when they land',
            'Layered sounds: hit SFX now split into normal, crit and kill',
            'Loot reworked: only set items stay forever, everything else fades in stages',
            'Visual punch: physical blood splatter and knockback'
        ]
    },
    {
        version: "6.1.1",
        date: "2025-12-20",
        title: 'QoL & Looting',
        highlights: [
            'Auto battle treats gold like sets: gold pickup is top priority and works through walls',
            'Much clearer XP percentage text on the bar (white with a black outline)',
            'Precision fix: floating XP values no longer show long decimals on kill',
            'Smart unstuck: 10s movement monitoring, unreachable drops are skipped and blacklisted so AFK never hangs'
        ]
    },
    {
        version: "6.1",
        date: "2025-12-19",
        title: 'Performance Rebuild & Visual Upgrade',
        highlights: [
            'Deep performance work: the AI core was rebuilt, cutting CPU use sharply',
            'Rendering: blood is drawn on an offscreen canvas, doubling late-fight frame rate',
            'Elemental punch: cold and lightning damage get their own hit glow and numbers',
            'Inventory: rarity borders stay even when requirements are unmet, so legendaries stand out at a glance',
            'Key fixes: Gheed stock now syncs correctly and AI distance checks were corrected'
        ]
    },
    {
        version: "6.0",
        date: "2025-12-18",
        title: 'Daily Login & Shop Expansion',
        highlights: [
            'Daily login rebuilt: all 7 days now give buffs',
            'Day7: 24h of triple XP and a set item',
            'The shop now sells Double XP scrolls (1000G/1 hour)',
            'Bigger maps: 64×64 → 80×80 (+56% exploration space)',
            'Wider corridors: at least 2 tiles wide, so auto battle no longer jams',
            'Fixed daily quest bosses not counting'
        ]
    },
    {
        version: "5.9",
        date: "2025-12-17",
        title: 'Player Stalls',
        highlights: [
            'Player stalls: set up a stall in the Rogue Encampment to sell gear',
            'Stall fee: 500G/hour, up to 10 hours',
            'Offline stalls: your goods keep selling after you log off',
            'Live sales: instant notification when something sells',
            'Fixed: the gold display inside the embedded backpack'
        ]
    },
    {
        version: "5.8",
        date: "2025-12-16",
        title: 'Mobile Support',
        highlights: [
            'Now playable on mobile, including portrait screens',
            'Shop, stash and forge panels now embed the backpack',
            'One-tap sorting for backpack and stash',
            'Drop item hints and Enter to enter are gone',
            'Dropped items are no longer picked up for 5 seconds during auto battle',
            'Gear comparison now uses a two-column tooltip and reads much faster'
        ]
    },
    {
        version: "5.7",
        date: "2025-12-14",
        title: 'Daily Quests & Stash Expansion',
        highlights: [
            'Daily quest system rebuilt: chained unlocks (easy→medium→hard)',
            'Quest goals scale with your level, and hard quests reward skill points',
            'Stash expansion: pay gold for more slots, up to 3 times (36→54)',
            'Quests, announcements and achievements all show floor names (e.g. \"Deadwood Graveyard\")'
        ]
    },
    {
        version: "5.6",
        date: "2025-12-14",
        title: 'Social: World Chat & Fixes',
        highlights: [
            'New world chat channel for real-time talk',
            'Every dungeon floor now has its own name across three biomes: forest, ice and lava',
            'Portals let you travel to any floor you have reached',
            'Vampire AI: lunges in with a life-drain attack',
            'Lightning wraith AI: fires lightning orbs and moves through walls',
            'Fixed ranged monsters shooting through walls',
        ]
    },
    {
        version: "5.5",
        date: "2025-12-14",
        title: 'Auto Battle & Performance',
        highlights: [
            'Combat check: now triggers within 80 tiles of any enemy, so gold is never left behind',
            'Maps are pre-rendered to an offscreen canvas, ~5800x faster',
            'Leaderboard: added a richest-players ranking'
        ]
    },
    {
        version: "5.4",
        date: "2025-12-14",
        title: 'Performance & Graphics Settings',
        highlights: [
            'New graphics setting: High FX or Performance',
            'Removed constant screen shake on normal attacks, crits and taking hits',
            'Particle cap set to 200 for smoother play on low-end PCs',
            'Auto battle: opening a panel no longer pauses the game'
        ]
    },
    {
        version: "5.3",
        date: "2025-12-13",
        title: 'Server Announcements',
        highlights: [
            'Scrolling announcement bar at the top, showing live server activity',
            'Boss kills are announced server-wide in gold',
            'Set drops are announced server-wide in green'
        ]
    },
    {
        version: "5.2",
        date: "2025-12-13",
        title: 'World Detail Overhaul',
        highlights: [
            'Brand-new map decoration system: no more plain walls',
            'Biome-exclusive scenery: ancient forest trees, ice crystals and hell spires',
            'Hybrid rendering: procedural detail blends seamlessly with pixel-art tiles'
        ]
    },
    {
        version: "5.1",
        date: "2025-12-13",
        title: 'Visual Effects Update',
        highlights: [
            'Bloodstains when monsters die, fading out after 15-25 seconds',
            'Skill visuals upgraded: stronger Chain Lightning, Fireball trails and Multishot arrows',
            'Bosses and elites got their own death effects',
            'Level-up effect: golden flash, light pillar, particles and screen shake',
            'Items fly into you: pickup along a Bézier curve',
            'Town Portal Scroll got a more ceremonial feel',
            'New sound cues for low health and for spending points',
            'Crits hit harder: slow motion, golden numbers and heavier impact',
            'Combo counter: your hit streak is on screen (visual only, no stat changes)'
        ]
    },
    {
        version: "5.0",
        date: "2025-12-13",
        title: 'Multiple Save Slots',
        highlights: [
            '3 independent save slots, so you can run several characters at once',
            'Added a new-player guide',
            'Daily login rewards now have a claim effect'
        ]
    },
    {
        version: "4.9",
        date: "2025-12-12",
        title: 'Monster Roster Expansion',
        highlights: [
            '6 new monsters: zombie, skeleton warrior, ghost, lightning wraith, mummy and vampire',
            'Ghosts phase through walls and dodge 30% of hits, mummies poison and vampires drain 20% life',
            'Monsters unlock gradually as you go deeper and spawn from weighted pools'
        ]
    },
    {
        version: "4.8",
        date: "2025-12-11",
        title: 'Blacksmith Upgrades',
        highlights: [
            'New NPC Charsi offers gear upgrades',
            'Upgrade with 2 items of the same slot and rarity, up to +9',
            'Above +6 there is a failure risk and the level can drop'
        ]
    },
    {
        version: "4.7",
        date: "2025-12-11",
        title: 'Game Optimization',
        highlights: [
            'Codebase reworked for better performance',
            'Constants are now managed in one unified system'
        ]
    },
    {
        version: "4.6",
        date: "2025-12-10",
        title: 'Balance Tuning',
        highlights: [
            'Each Divine Blessing can now be gained up to 3 times',
            'Talent shop rerolls cost more each time',
            'Legendary talents unlock after the 5th tier',
            'Day3 login reward is now 24h of double XP'
        ]
    },
    {
        version: "4.5",
        date: "2025-12-10",
        title: 'Freeze System Tuning',
        highlights: [
            'Freeze hard CC: 2s→0.5s',
            'Added a 1.5s slow afterwards, so you can run and drink a potion',
            'Freeze immunity: 3s→5s',
            'Frozen elites show a ❄️ icon above their head'
        ]
    },
    {
        version: "4.4",
        date: "2025-12-10",
        title: 'Death System Tuning',
        highlights: [
            'The screen greys out on death, with a 5s countdown before you return to town',
            'Auto battle no longer spams town portal attempts when you have no scroll'
        ]
    },
    {
        version: "4.3",
        date: "2025-12-08",
        title: 'Loot Effects',
        highlights: [
            'Unique drops: golden light pillar and screen shake',
            'Set drops: green light pillar and a mysterious sound'
        ]
    },
    {
        version: "4.2",
        date: "2025-12-08",
        title: 'Daily Login Rewards',
        highlights: [
            '7-day reward cycle, Day7 hands out a unique item',
            'Drop rates tuned way down, so loot feels rare again'
        ]
    },
    {
        version: "4.1",
        date: "2025-12-08",
        title: 'Divine Blessing',
        highlights: [
            'Added several new blessing types',
            'The blessing panel now lists everything you have earned'
        ]
    },
    {
        version: "4.0",
        date: "2025-12-08",
        title: 'Talent Shop & Set Expansion',
        highlights: [
            'Talent shop available on entering each floor',
            'Sets expanded from 3 to 9 (54 pieces)'
        ]
    },
    {
        version: "3.9",
        date: "2025-12-08",
        title: 'Simpler Stats',
        highlights: [
            'Gear now shows what it does, e.g. +50% damage',
            'Ground item names moved above the icon'
        ]
    },
    {
        version: "3.8",
        date: "2025-12-08",
        title: 'Performance & Drop Rebalance',
        highlights: [
            'Enemy object pooling to cut stutters',
            'Floor depth bonus and a cumulative luck stat',
            'Every 8th monster always drops a consumable'
        ]
    },
    {
        version: "3.7",
        date: "2025-12-08",
        title: 'Leaderboard & Cheaper Skills',
        highlights: [
            'Leaderboard updates in real time',
            'All skills cost less mana',
            'Portals now let you pick a floor'
        ]
    },
    {
        version: "3.6",
        date: "2025-12-07",
        title: 'Endless Quests & Skill Icons',
        highlights: [
            'After 10 quests the quest system loops back around',
            'Skill icons are now pixel-art sprites'
        ]
    },
    {
        version: "3.5",
        date: "2025-12-07",
        title: 'Auto Battle Tweaks',
        highlights: [
            'Low-health enemies are prioritised',
            'Melee no longer mistakes walls for stuck spots'
        ]
    },
    {
        version: "3.4",
        date: "2025-12-07",
        title: 'Endless Floor Boss',
        highlights: [
            'Floor 11 starts the second cycle with an endless boss run',
            'Each cycle adds +150% boss health and +60% damage'
        ]
    },
    {
        version: "3.3",
        date: "2025-12-06",
        title: 'Combat Feel',
        highlights: [
            'Basic attacks now show a slash arc',
            'Auto battle: smarter looting and target locking'
        ]
    },
    {
        version: "3.2",
        title: 'Auto Battle Settings',
        highlights: [
            'Settings now save automatically',
            'Auto battle cannot be enabled in camp'
        ]
    },
    {
        version: "3.1",
        title: 'Auto Battle',
        highlights: [
            'Press F to toggle auto battle',
            'A* pathfinding, auto pickup and auto potion drinking',
            'Emergency town portal and anti-stuck safeguards'
        ]
    },
    {
        version: "3.0",
        title: 'Set System',
        highlights: [
            '3 new sets (mage, warrior, assassin)',
            '2/4/6 piece bonuses',
            'Set-related achievements'
        ]
    },
    {
        version: "2.9",
        title: 'Fireball Evolution',
        highlights: [
            'Lv5 unlocks the explosion',
            'Explosion radius and damage scale with level'
        ]
    },
    {
        version: "2.8",
        title: 'Hell Mode Fixes',
        highlights: [
            'Fixed Hell floor tracking and travel logic'
        ]
    },
    {
        version: "2.7",
        title: 'Respec System',
        highlights: [
            'New NPC: the Mystic Sage',
            'He resets your attribute and skill points'
        ]
    },
    {
        version: "2.6",
        title: 'Simplified Skills',
        highlights: [
            'Player frost damage removed, resistances kept'
        ]
    },
    {
        version: "2.5",
        title: 'Chain Lightning',
        highlights: [
            'Lv2+ unlocks Chain Lightning, which jumps between targets'
        ]
    },
    {
        version: "2.3",
        title: 'New Skill: Lightning Strike',
        highlights: [
            'Replaces Frost Nova: calls down lightning on enemies'
        ]
    },
    {
        version: "2.1",
        title: 'Hell Mode',
        highlights: [
            'Beat Baal to unlock Hell Mode',
            'Monsters: health×6, damage×4, XP×5'
        ]
    },
    {
        version: "2.0",
        title: 'Core Gameplay Update',
        highlights: [
            'Resistance system (fire/cold/lightning/poison)',
            '40+ gear affixes',
            '12 elite affixes',
            'Item level requirement system'
        ]
    },
    {
        version: "1.8",
        title: 'Mechanics Tuning',
        highlights: [
            'Click a distant item and your hero walks over to pick it up',
            'Boss health and damage are way up',
            'Fixed attacks through walls'
        ]
    },
    {
        version: "1.7",
        title: 'Achievements',
        highlights: [
            '6 hand-crafted achievements',
            'Live progress tracking'
        ]
    },
    {
        version: "1.6",
        title: 'Audio & Balance',
        highlights: [
            'Potion and arrow sounds',
            'Skill range limits',
            'Monster nameplates and health bars improved'
        ]
    },
    {
        version: "1.5",
        date: "2025-11-26",
        title: 'Stash',
        highlights: [
            'Visit Warriv to store and withdraw items',
            'Quests expanded to 10',
            'Backpack items can be dropped',
            'A first batch of art'
        ]
    },
    {
        version: "1.0",
        date: "2025-11-25",
        title: 'Core Features',
        highlights: [
            'Town, NPCs, random dungeons, town portal scroll and inventory',
            'Points, gear, attacks, skills, portals, bosses and auto gold pickup'
        ]
    }
];

// Get the current version
const CURRENT_VERSION = CHANGELOG[0].version;

// InitversionNo.Show
document.addEventListener('DOMContentLoaded', () => {
    const versionEl = document.getElementById('game-version');
    if (versionEl) versionEl.textContent = 'v' + CURRENT_VERSION;
});
