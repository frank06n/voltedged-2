export type AssignedPuzzle = {
  id: string
  /** Question document URL from the server (no answer). */
  question: string
}

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
  /** Redundant list of ids; same order as `assignedPuzzles`. */
  assignedPuzzleIds: string[]
  /** From API only: puzzle id + question link. Bounds/rewards come from `PUZZLE_LOCATIONS` on the client. */
  assignedPuzzles?: AssignedPuzzle[]
  inventory: InventorySlotConfig[]
  placedItems: PlacedItem[]
  solvedPuzzleIds: string[]
  circuitCompletedAt: string | null
}

export type SessionUpdate = {
  sessionId: string
  teamName: string
  inventory?: InventorySlotConfig[]
  placedItems?: PlacedItem[]
  solvedPuzzleIds?: string[]
}
