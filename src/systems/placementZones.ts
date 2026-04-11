import { TILE_SIZE } from '../constants'

export type PlacementZone = {
  id: string
  x: number
  y: number
  width: number
  height: number
}

/** Pixel rect from top-left tile (col, row) spanning colsWide × rowsTall tiles — always grid-aligned. */
function zone(
  id: string,
  col: number,
  row: number,
  colsWide: number,
  rowsTall: number,
): PlacementZone {
  return {
    id,
    x: col * TILE_SIZE,
    y: row * TILE_SIZE,
    width: colsWide * TILE_SIZE,
    height: rowsTall * TILE_SIZE,
  }
}

export const SHOW_PLACEMENT_ZONES = true

export const PLACEMENT_ZONES: PlacementZone[] = [
  zone('pz-main', 36, 48, 32, 20),
]

export function isInsidePlacementZone(
  worldX: number,
  worldY: number,
): boolean {
  for (const z of PLACEMENT_ZONES) {
    if (
      worldX >= z.x &&
      worldX < z.x + z.width &&
      worldY >= z.y &&
      worldY < z.y + z.height
    ) {
      return true
    }
  }
  return false
}
