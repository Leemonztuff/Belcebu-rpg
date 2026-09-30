// ========== Floor tile type configuration ==========

// Registry of distinct floor tile types that can be added without changing the
// tile indexing functions. Each entry needs a unique id and a friendly name for
// the UI/map tools. New entries are also automatically included in the
// FLOOR_TILE_IDS list so new tile types do not require changes in the
// texture-indexing functions.
const FLOOR_TILE = {
    // Existing types
    camp: { id: 'camp', name: 'Camp (Grass)' },
    stone: { id: 'stone', name: 'Stone' },

    // Reserved/new tile type
    lava: { id: 'lava', name: 'Lava', color: '#8a2a12', darkColor: '#4a1407' }
};

// Explicit list of known floor tile type ids. Keeping this in one place makes
// it easier to add a new tile type later, because only FLOOR_TILE needs to be
// updated. If you add an entry to FLOOR_TILE, add its id here too.
const FLOOR_TILE_IDS = [
    FLOOR_TILE.camp.id,
    FLOOR_TILE.stone.id,
    FLOOR_TILE.lava.id
];

// Read-only floor tile type per level. A real map or level loader can set this
// through the same interface that chooses floor textures, without touching the
// tile matrix. Levels 0 and 1 use 'camp' and 'stone' respectively; later
// floors use the new lava tile type placeholder.
function getFloorTileType(floor) {
    switch (floor) {
        case 0: return 'camp';   // Rogue Encampment (grass)
        case 1: return 'stone';  // normal dungeon floor (stone)
        default: return 'lava';  // placeholder new floor tile type (lava)
    }
}

