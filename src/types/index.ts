import type { SessionConfig } from '../api/types'

export type Player = {
  x: number
  y: number
  speed: number
}

export type Camera = {
  x: number
  y: number
}

export type Tile = {
  itemId: string | null
  variant: string
}

export type InventorySlot = {
  itemId: string
  quantity: number
}

export type Hotbar = {
  slots: (InventorySlot | null)[]
  activeIndex: number
}

export type InteractionZone = {
  id: string
  x: number
  y: number
  width: number
  height: number
  question: string
  correctAnswer: string
  rewardItems: { itemId: string; quantity: number }[]
  solved: boolean
}

export type GameState = {
  player: Player
  camera: Camera
  grid: Tile[][]
  hotbar: Hotbar
  interactionZones: InteractionZone[]
  activeModal: InteractionZone | null
  sessionId: string | null
  seed: string | null
  solvedPuzzleIds: string[]
  variantJustCycledCell: { row: number; col: number } | null

  setPlayer: (player: Player) => void
  setCamera: (camera: Camera) => void
  setGridTile: (row: number, col: number, tile: Tile) => void
  setGrid: (grid: Tile[][]) => void
  setHotbarActive: (index: number) => void
  setActiveModal: (zone: InteractionZone | null) => void

  loadSession: (config: SessionConfig) => void
  consumeItem: (slotIndex: number) => boolean
  returnItem: (itemId: string) => boolean
  markZoneSolved: (zoneId: string) => void
  addRewardItems: (items: { itemId: string; quantity: number }[]) => void
  cycleVariant: (row: number, col: number) => boolean
  clearVariantJustCycled: () => void
}
