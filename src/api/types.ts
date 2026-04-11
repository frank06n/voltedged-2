export type InventorySlotConfig = {
  itemId: string
  quantity: number
}

export type PlacedItem = {
  row: number
  col: number
  itemId: string
  variant?: string
  orientation?: number
}

export type SessionConfig = {
  sessionId: string
  teamName: string
  teamLeadName: string
  shift: number
  worldWidth: number
  worldHeight: number
  playerStart: { x: number; y: number }
  /** Which puzzles are active this session; question links loaded on demand via /puzzle/get. */
  assignedPuzzleIds: string[]
  inventory: InventorySlotConfig[]
  placedItems: PlacedItem[]
  solvedPuzzleIds: string[]
  circuitCompletedAt: string | null
  /** Judge/admin approved the physical circuit (manual). */
  circuitCorrect?: boolean
  /** Progress fields */
  solvedCount: number
  totalPuzzles: number
  totalComponents: number
  componentsEarned: number
}

export type SessionUpdate = {
  sessionId: string
  teamName: string
  inventory?: InventorySlotConfig[]
  placedItems?: PlacedItem[]
  solvedPuzzleIds?: string[]
}
