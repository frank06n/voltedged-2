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
}

export type Hotbar = {
  slots: (string | null)[]
  activeIndex: number
}

export type InteractionZone = {
  id: string
  x: number
  y: number
  width: number
  height: number
  question: string
}

export type GameState = {
  player: Player
  camera: Camera
  grid: Tile[][]
  hotbar: Hotbar
  interactionZones: InteractionZone[]
  activeModal: InteractionZone | null

  setPlayer: (player: Player) => void
  setCamera: (camera: Camera) => void
  setGridTile: (row: number, col: number, tile: Tile) => void
  setGrid: (grid: Tile[][]) => void
  setHotbarActive: (index: number) => void
  setActiveModal: (zone: InteractionZone | null) => void
}
