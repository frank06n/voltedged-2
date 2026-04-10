export const TILE_SIZE = 32
/** Matches `public/map.png` (3072×3072); divisible by TILE_SIZE → 96×96 tiles. */
export const WORLD_WIDTH = 3072
export const WORLD_HEIGHT = 3072
export const PLAYER_SPEED = 3
export const PLAYER_SIZE = 32
export const EDGE_THRESHOLD = 200
export const HOTBAR_SLOTS = 16
export const MAX_STACK_SIZE = 99
export const GRID_COLS = Math.ceil(WORLD_WIDTH / TILE_SIZE)
export const GRID_ROWS = Math.ceil(WORLD_HEIGHT / TILE_SIZE)

/** Dev/debug: show interaction zone overlays (same idea as SHOW_PLACEMENT_ZONES). */
export const SHOW_INTERACTION_ZONES = true
