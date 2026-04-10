import { WORLD_HEIGHT, WORLD_WIDTH } from '../constants'
import type {
  InventorySlotConfig,
  PlacedItem,
  SessionConfig,
  SessionUpdate,
} from './types'

function storageKey(seed: string): string {
  return `game_session_${seed.trim() || 'default'}`
}

function newSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function defaultPuzzles(): SessionConfig['puzzles'] {
  return [
    {
      id: 'puzzle-capacitor',
      x: 400,
      y: 400,
      width: 128,
      height: 128,
      question:
        'What two-terminal device stores energy in an electric field?',
      correctAnswer: 'capacitor',
      rewardItems: [{ itemId: 'stone', quantity: 2 }],
    },
    {
      id: 'puzzle-transistor',
      x: 1000,
      y: 800,
      width: 128,
      height: 128,
      question:
        'What semiconductor device acts as a switch or amplifier?',
      correctAnswer: 'transistor',
      rewardItems: [{ itemId: 'brick', quantity: 2 }],
    },
    {
      id: 'puzzle-resistor',
      x: 1600,
      y: 1200,
      width: 128,
      height: 128,
      question: 'What passive component opposes current flow?',
      correctAnswer: 'resistor',
      rewardItems: [{ itemId: 'wood', quantity: 3 }],
    },
    {
      id: 'puzzle-diode',
      x: 2200,
      y: 600,
      width: 128,
      height: 128,
      question: 'What component allows current in one direction only?',
      correctAnswer: 'diode',
      rewardItems: [{ itemId: 'stone', quantity: 1 }],
    },
  ]
}

function defaultInventory(): InventorySlotConfig[] {
  return [
    { itemId: 'wood', quantity: 3 },
    { itemId: 'stone', quantity: 2 },
    { itemId: 'brick', quantity: 2 },
  ]
}

function createFreshSession(seed: string): SessionConfig {
  return {
    sessionId: newSessionId(),
    seed: seed.trim() || 'default',
    worldWidth: WORLD_WIDTH,
    worldHeight: WORLD_HEIGHT,
    playerStart: { x: 1500, y: 1500 },
    puzzles: defaultPuzzles(),
    inventory: defaultInventory(),
    placedItems: [],
    solvedPuzzleIds: [],
  }
}

export async function startSession(code: string): Promise<SessionConfig> {
  const seed = code.trim() || 'default'
  const key = storageKey(seed)

  await Promise.resolve()

  try {
    const existing = localStorage.getItem(key)
    if (existing) {
      return JSON.parse(existing) as SessionConfig
    }
  } catch {
    // fall through to create fresh
  }

  const config = createFreshSession(seed)
  localStorage.setItem(key, JSON.stringify(config))
  return config
}

export async function updateSession(update: SessionUpdate): Promise<void> {
  await Promise.resolve()

  const key = storageKey(update.seed)
  const raw = localStorage.getItem(key)
  if (!raw) return

  let existing: SessionConfig
  try {
    existing = JSON.parse(raw) as SessionConfig
  } catch {
    return
  }

  if (existing.sessionId !== update.sessionId) return

  const merged: SessionConfig = {
    ...existing,
    ...(update.inventory !== undefined && { inventory: update.inventory }),
    ...(update.placedItems !== undefined && { placedItems: update.placedItems }),
    ...(update.solvedPuzzleIds !== undefined && {
      solvedPuzzleIds: update.solvedPuzzleIds,
    }),
  }

  localStorage.setItem(key, JSON.stringify(merged))
}

export type SessionSyncSnapshot = {
  sessionId: string | null
  seed: string | null
  inventory: InventorySlotConfig[]
  placedItems: PlacedItem[]
  solvedPuzzleIds: string[]
}

export function buildSessionSyncSnapshot(
  state: {
    sessionId: string | null
    seed: string | null
    hotbar: { slots: { itemId: string; quantity: number }[] | (null | { itemId: string; quantity: number })[] }
    grid: { itemId: string | null }[][]
    solvedPuzzleIds: string[]
  },
): SessionSyncSnapshot {
  const inventory: InventorySlotConfig[] = []
  for (const s of state.hotbar.slots) {
    if (s) inventory.push({ itemId: s.itemId, quantity: s.quantity })
  }

  const placedItems: PlacedItem[] = []
  for (let r = 0; r < state.grid.length; r++) {
    for (let c = 0; c < state.grid[r].length; c++) {
      const id = state.grid[r][c].itemId
      if (id) placedItems.push({ row: r, col: c, itemId: id })
    }
  }

  return {
    sessionId: state.sessionId,
    seed: state.seed,
    inventory,
    placedItems,
    solvedPuzzleIds: state.solvedPuzzleIds,
  }
}

export async function syncSessionToApi(snapshot: SessionSyncSnapshot): Promise<void> {
  if (!snapshot.sessionId || !snapshot.seed) return
  await updateSession({
    sessionId: snapshot.sessionId,
    seed: snapshot.seed,
    inventory: snapshot.inventory,
    placedItems: snapshot.placedItems,
    solvedPuzzleIds: snapshot.solvedPuzzleIds,
  })
}
