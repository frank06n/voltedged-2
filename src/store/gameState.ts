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
  addItems,
  consumeFromSlot,
  inventoryConfigToSlots,
  returnToInventory,
} from '../systems/inventorySystem'
import type { GameState, InteractionZone, Tile } from '../types'

function createEmptyGrid(): Tile[][] {
  return Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => ({ itemId: null })),
  )
}

function puzzlesToZones(
  puzzles: SessionConfig['puzzles'],
  solvedIds: string[],
): InteractionZone[] {
  return puzzles.map((p) => ({
    id: p.id,
    x: p.x,
    y: p.y,
    width: p.width,
    height: p.height,
    question: p.question,
    correctAnswer: p.correctAnswer,
    rewardItems: p.rewardItems,
    solved: solvedIds.includes(p.id),
  }))
}

function applyPlacedItems(grid: Tile[][], placed: SessionConfig['placedItems']): Tile[][] {
  let next = grid
  for (const { row, col, itemId } of placed) {
    if (
      row >= 0 &&
      row < GRID_ROWS &&
      col >= 0 &&
      col < GRID_COLS
    ) {
      next = next.map((r, ri) =>
        ri === row
          ? r.map((c, ci) => (ci === col ? { itemId } : c))
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
  seed: null,
  solvedPuzzleIds: [],

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
    const zones = puzzlesToZones(config.puzzles, config.solvedPuzzleIds)

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
      seed: config.seed,
      solvedPuzzleIds: [...config.solvedPuzzleIds],
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
}))
