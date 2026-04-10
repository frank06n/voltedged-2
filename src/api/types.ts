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
}

export type SessionConfig = {
  sessionId: string
  seed: string
  worldWidth: number
  worldHeight: number
  playerStart: { x: number; y: number }
  puzzles: PuzzleConfig[]
  inventory: InventorySlotConfig[]
  placedItems: PlacedItem[]
  solvedPuzzleIds: string[]
}

export type SessionUpdate = {
  sessionId: string
  seed: string
  inventory?: InventorySlotConfig[]
  placedItems?: PlacedItem[]
  solvedPuzzleIds?: string[]
}
