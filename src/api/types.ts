export type PuzzleConfig = {
  id: string
  x: number
  y: number
  width: number
  height: number
  question: string
  correctAnswer?: string
  rewardItems: { itemId: string; quantity: number }[]
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
  assignedPuzzleIds: string[]
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
