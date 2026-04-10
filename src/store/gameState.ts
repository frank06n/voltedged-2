import { create } from 'zustand'
import {
  GRID_COLS,
  GRID_ROWS,
  HOTBAR_SLOTS,
  PLAYER_SPEED,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../constants'
import type { GameState, Tile } from '../types'

function createEmptyGrid(): Tile[][] {
  return Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => ({ itemId: null })),
  )
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
    slots: ['wood', 'stone', 'brick', null, null, null, null, null],
    activeIndex: 0,
  },
  interactionZones: [
    {
      id: 'zone-1',
      x: 400,
      y: 400,
      width: 128,
      height: 128,
      question: 'What is 2 + 2?',
    },
    {
      id: 'zone-2',
      x: 1000,
      y: 800,
      width: 128,
      height: 128,
      question: 'Name the largest planet.',
    },
  ],
  activeModal: null,

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
}))
