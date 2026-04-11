import type { InventorySlotConfig, SessionConfig } from '../api/types'

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
  orientation: number
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
  /** Unused at zone creation; question link is loaded in the modal via POST /api/session/puzzle/get. */
  question: string
  rewardItems?: { itemId: string; quantity: number }[]
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
  teamName: string | null
  shift: number
  solvedPuzzleIds: string[]
  variantJustCycledCell: { row: number; col: number } | null
  /** Progress tracking */
  solvedCount: number
  totalPuzzles: number
  totalComponents: number
  componentsEarned: number
  /** Toast: components just unlocked (cleared after display) */
  lastUnlockedComponents: { itemId: string; quantity: number }[]

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
  /** Replace hotbar from API inventory (e.g. after puzzle verify). */
  applyServerInventory: (inventory: InventorySlotConfig[]) => void
  addRewardItems: (items: { itemId: string; quantity: number }[]) => void
  updateProgress: (solvedCount: number, totalPuzzles: number, totalComponents: number, componentsEarned: number) => void
  setLastUnlockedComponents: (items: { itemId: string; quantity: number }[]) => void
  cycleVariant: (row: number, col: number) => boolean
  cycleOrientation: (row: number, col: number) => boolean
  clearVariantJustCycled: () => void
}
