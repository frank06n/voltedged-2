import {
  WIRE_SPRITE_IMAGES,
  WIRE_T_JUNCTION_OFFSET_DEG,
  getTerminalDirections,
  type Direction,
} from '../data/itemDefinitions'
import type { Tile } from '../types'
import { isValidCell } from './gridSystem'

export type WireConnections = {
  top: boolean
  right: boolean
  bottom: boolean
  left: boolean
}

/** Direction on the neighbor cell that points toward (row, col). */
function directionFromNeighborToCell(
  nr: number,
  nc: number,
  row: number,
  col: number,
): Direction | null {
  if (nr === row - 1 && nc === col) return 'bottom'
  if (nr === row + 1 && nc === col) return 'top'
  if (nr === row && nc === col - 1) return 'right'
  if (nr === row && nc === col + 1) return 'left'
  return null
}

function neighborConnectsToCell(
  grid: Tile[][],
  nr: number,
  nc: number,
  row: number,
  col: number,
): boolean {
  if (!isValidCell(nr, nc)) return false
  const t = grid[nr][nc]
  if (!t.itemId) return false
  if (t.itemId === 'wire') return true
  const dir = directionFromNeighborToCell(nr, nc, row, col)
  if (!dir) return false
  const { A, B } = getTerminalDirections(t.orientation)
  return A === dir || B === dir
}

export function getWireConnections(
  grid: Tile[][],
  row: number,
  col: number,
): WireConnections {
  return {
    top: neighborConnectsToCell(grid, row - 1, col, row, col),
    right: neighborConnectsToCell(grid, row, col + 1, row, col),
    bottom: neighborConnectsToCell(grid, row + 1, col, row, col),
    left: neighborConnectsToCell(grid, row, col - 1, row, col),
  }
}

export type WireSpriteInfo = {
  src: string
  rotationDeg: number
}

const ORDER: (keyof WireConnections)[] = ['top', 'right', 'bottom', 'left']

/**
 * wire_2 at 0°: right + bottom connected (L in SE quadrant).
 * Rotate 90° CW for bottom+left, 180° for left+top, 270° for top+right.
 */
function cornerWire2Rotation(c: WireConnections): number {
  if (c.right && c.bottom) return 0
  if (c.bottom && c.left) return 90
  if (c.left && c.top) return 180
  if (c.top && c.right) return 270
  return 0
}

/**
 * Choose sprite + rotation for a wire tile from neighbor connections.
 */
export function getWireSpriteInfo(c: WireConnections): WireSpriteInfo {
  const count =
    (c.top ? 1 : 0) +
    (c.right ? 1 : 0) +
    (c.bottom ? 1 : 0) +
    (c.left ? 1 : 0)

  if (count === 4) {
    return { src: WIRE_SPRITE_IMAGES.wire_4, rotationDeg: 0 }
  }

  if (count === 3) {
    const missing = ORDER.find((k) => !c[k])
    const idx = missing ? ORDER.indexOf(missing) : 0
    return {
      src: WIRE_SPRITE_IMAGES.wire_3,
      rotationDeg: idx * 90 + WIRE_T_JUNCTION_OFFSET_DEG,
    }
  }

  if (count === 2) {
    if (c.top && c.bottom) {
      return { src: WIRE_SPRITE_IMAGES.wire, rotationDeg: 90 }
    }
    if (c.left && c.right) {
      return { src: WIRE_SPRITE_IMAGES.wire, rotationDeg: 0 }
    }
    return {
      src: WIRE_SPRITE_IMAGES.wire_2,
      rotationDeg: cornerWire2Rotation(c),
    }
  }

  if (count === 1) {
    if (c.top) return { src: WIRE_SPRITE_IMAGES.wire, rotationDeg: 90 }
    if (c.right) return { src: WIRE_SPRITE_IMAGES.wire, rotationDeg: 0 }
    if (c.bottom) return { src: WIRE_SPRITE_IMAGES.wire, rotationDeg: 90 }
    if (c.left) return { src: WIRE_SPRITE_IMAGES.wire, rotationDeg: 180 }
  }

  return { src: WIRE_SPRITE_IMAGES.wire, rotationDeg: 0 }
}
