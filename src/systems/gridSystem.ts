import {
  getComponentColorFromDefinition,
  initialVariantForComponent,
} from '../data/itemDefinitions'
import { GRID_COLS, GRID_ROWS } from '../constants'
import type { Tile } from '../types'

const EMPTY_TILE = (): Tile => ({
  itemId: null,
  variant: '',
  orientation: 0,
})

export function getItemColor(itemId: string): string {
  return getComponentColorFromDefinition(itemId)
}

export function isValidCell(row: number, col: number): boolean {
  return row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS
}

export function placeItem(
  grid: Tile[][],
  row: number,
  col: number,
  itemId: string,
): Tile[][] {
  if (!isValidCell(row, col)) return grid
  const cell = grid[row][col]
  if (cell.itemId !== null) return grid
  const variant = initialVariantForComponent(itemId)
  const newGrid = grid.map((r, ri) =>
    ri === row
      ? r.map((c, ci) =>
          ci === col
            ? { itemId, variant, orientation: 0 }
            : c,
        )
      : r,
  )
  return newGrid
}

export function removeItem(grid: Tile[][], row: number, col: number): Tile[][] {
  if (!isValidCell(row, col)) return grid
  const newGrid = grid.map((r, ri) =>
    ri === row ? r.map((c, ci) => (ci === col ? EMPTY_TILE() : c)) : r,
  )
  return newGrid
}
