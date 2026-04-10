import { create } from 'zustand'
import type { SessionConfig } from '../api/types'
import {
  GRID_COLS,
  GRID_ROWS,
  HOTBAR_SLOTS,
  PLAYER_SPEED,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../constants'
import {
  getItemVariantOptions,
  initialVariantForComponent,
} from '../data/itemDefinitions'
import {
  addItems,
  consumeFromSlot,
  inventoryConfigToSlots,
  returnToInventory,
} from '../systems/inventorySystem'
import type { GameState, InteractionZone, Tile } from '../types'
import { PUZZLE_LOCATIONS } from '../data/puzzleLocations'

function createEmptyGrid(): Tile[][] {
  return Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => ({
      itemId: null,
      variant: '',
      orientation: 0,
    })),
  )
}

function puzzlesToZones(
  assignedPuzzleIds: string[],
  solvedIds: string[],
): InteractionZone[] {
  return assignedPuzzleIds
    .filter((id) => PUZZLE_LOCATIONS[id])
    .map((id) => {
      const loc = PUZZLE_LOCATIONS[id]
      return {
        id,
        x: loc.x,
        y: loc.y,
        width: loc.width,
        height: loc.height,
        question: '', // fetched on-demand from backend
        rewardItems: loc.rewardItems,
        solved: solvedIds.includes(id),
      }
    })
}

function applyPlacedItems(grid: Tile[][], placed: SessionConfig['placedItems']): Tile[][] {
  let next = grid
  for (const p of placed) {
    const { row, col, itemId } = p
    if (
      row >= 0 &&
      row < GRID_ROWS &&
      col >= 0 &&
      col < GRID_COLS
    ) {
      const variant =
        p.variant !== undefined && p.variant !== ''
          ? p.variant
          : initialVariantForComponent(itemId)
      const orientation = p.orientation ?? 0
      next = next.map((r, ri) =>
        ri === row
          ? r.map((c, ci) =>
              ci === col ? { itemId, variant, orientation } : c,
            )
          : r,
      )
    }
  }
  return next
}

export const useGameStore = create<GameState>((set) => ({
  player: {
    x: WORLD_WIDTH / 2 - 16,
    y: WORLD_HEIGHT / 2 - 16,
    speed: PLAYER_SPEED,
  },
  camera: { x: 0, y: 0 },
  grid: createEmptyGrid(),
  hotbar: {
    slots: Array.from({ length: HOTBAR_SLOTS }, () => null),
    activeIndex: 0,
  },
  interactionZones: [],
  activeModal: null,
  sessionId: null,
  teamName: null,
  solvedPuzzleIds: [],
  variantJustCycledCell: null,

  setPlayer: (player) => set({ player }),
  setCamera: (camera) => set({ camera }),
  setGridTile: (row, col, tile) =>
    set((state) => {
      const newGrid = state.grid.map((r, ri) =>
        ri === row ? r.map((c, ci) => (ci === col ? tile : c)) : r,
      )
      return { grid: newGrid }
    }),
  setGrid: (grid) => set({ grid }),
  setHotbarActive: (index) =>
    set((state) => ({
      hotbar: {
        ...state.hotbar,
        activeIndex: Math.max(0, Math.min(HOTBAR_SLOTS - 1, index)),
      },
    })),
  setActiveModal: (zone) => set({ activeModal: zone }),

  loadSession: (config) => {
    const empty = createEmptyGrid()
    const grid = applyPlacedItems(empty, config.placedItems)
    const zones = puzzlesToZones(config.assignedPuzzleIds, config.solvedPuzzleIds)

    set({
      player: {
        x: config.playerStart.x,
        y: config.playerStart.y,
        speed: PLAYER_SPEED,
      },
      camera: { x: 0, y: 0 },
      grid,
      hotbar: {
        slots: inventoryConfigToSlots(config.inventory),
        activeIndex: 0,
      },
      interactionZones: zones,
      activeModal: null,
      sessionId: config.sessionId,
      teamName: config.teamName,
      solvedPuzzleIds: [...config.solvedPuzzleIds],
      variantJustCycledCell: null,
    })
  },

  consumeItem: (slotIndex) => {
    let ok = false
    set((state) => {
      const slot = state.hotbar.slots[slotIndex]
      if (!slot || slot.quantity <= 0) return state
      ok = true
      return {
        hotbar: {
          ...state.hotbar,
          slots: consumeFromSlot(state.hotbar.slots, slotIndex),
        },
      }
    })
    return ok
  },

  returnItem: (itemId) => {
    let ok = false
    set((state) => {
      const nextSlots = returnToInventory(state.hotbar.slots, itemId)
      if (nextSlots === state.hotbar.slots) return state
      ok = true
      return {
        hotbar: { ...state.hotbar, slots: nextSlots },
      }
    })
    return ok
  },

  markZoneSolved: (zoneId) =>
    set((state) => ({
      solvedPuzzleIds: state.solvedPuzzleIds.includes(zoneId)
        ? state.solvedPuzzleIds
        : [...state.solvedPuzzleIds, zoneId],
      interactionZones: state.interactionZones.map((z) =>
        z.id === zoneId ? { ...z, solved: true } : z,
      ),
    })),

  addRewardItems: (items) =>
    set((state) => ({
      hotbar: {
        ...state.hotbar,
        slots: addItems(state.hotbar.slots, items),
      },
    })),

  cycleVariant: (row, col) => {
    let cycled = false
    set((state) => {
      if (
        row < 0 ||
        row >= GRID_ROWS ||
        col < 0 ||
        col >= GRID_COLS
      ) {
        return state
      }
      const cell = state.grid[row][col]
      const itemId = cell.itemId
      if (!itemId) return state

      const opts = getItemVariantOptions(itemId)
      if (opts.length === 0) return state

      let idx = opts.indexOf(cell.variant)
      if (idx === -1) idx = 0
      const nextVariant = opts[(idx + 1) % opts.length]

      cycled = true
      const newGrid = state.grid.map((r, ri) =>
        ri === row
          ? r.map((c, ci) =>
              ci === col
                ? {
                    itemId,
                    variant: nextVariant,
                    orientation: cell.orientation,
                  }
                : c,
            )
          : r,
      )
      return {
        grid: newGrid,
        variantJustCycledCell: { row, col },
      }
    })
    return cycled
  },

  cycleOrientation: (row, col) => {
    let ok = false
    set((state) => {
      if (
        row < 0 ||
        row >= GRID_ROWS ||
        col < 0 ||
        col >= GRID_COLS
      ) {
        return state
      }
      const cell = state.grid[row][col]
      const itemId = cell.itemId
      if (!itemId) return state
      if (itemId === 'wire') return state

      ok = true
      const nextO = (cell.orientation + 1) % 4
      const newGrid = state.grid.map((r, ri) =>
        ri === row
          ? r.map((c, ci) =>
              ci === col
                ? {
                    itemId,
                    variant: cell.variant,
                    orientation: nextO,
                  }
                : c,
            )
          : r,
      )
      return {
        grid: newGrid,
        variantJustCycledCell: { row, col },
      }
    })
    return ok
  },

  clearVariantJustCycled: () => set({ variantJustCycledCell: null }),
}))
