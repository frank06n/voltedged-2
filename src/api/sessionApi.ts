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
      id: 'z1',
      x: 384,
      y: 288,
      width: 96,
      height: 96,
      question: 'I resist current. What am I?',
      correctAnswer: 'resistor',
      rewardItems: [{ itemId: 'resistor', quantity: 2 }],
    },
    {
      id: 'z2',
      x: 800,
      y: 576,
      width: 128,
      height: 128,
      question: 'I store electric charge. What am I?',
      correctAnswer: 'capacitor',
      rewardItems: [{ itemId: 'capacitor', quantity: 2 }],
    },
    {
      id: 'z3',
      x: 1184,
      y: 480,
      width: 96,
      height: 96,
      question: 'I amplify signals. What am I?',
      correctAnswer: 'transistor',
      rewardItems: [{ itemId: 'transistor', quantity: 2 }],
    },
    {
      id: 'z4',
      x: 1984,
      y: 992,
      width: 160,
      height: 160,
      question: 'You flip me to open or close a circuit. What am I?',
      correctAnswer: 'switch',
      rewardItems: [{ itemId: 'switch', quantity: 2 }],
    },
    {
      id: 'z5',
      x: 2496,
      y: 1984,
      width: 96,
      height: 96,
      question: 'I glow when current passes through me. What am I?',
      correctAnswer: 'bulb',
      rewardItems: [{ itemId: 'bulb', quantity: 2 }],
    },
  ]
}

function defaultInventory(): InventorySlotConfig[] {
  return []
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
