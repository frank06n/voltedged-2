import { GRID_COLS, GRID_ROWS } from '../constants'
import type { Tile } from '../types'

const ITEM_COLORS: Record<string, string> = {
  wood: '#8B4513',
  stone: '#808080',
  brick: '#B22222',
}

export function getItemColor(itemId: string): string {
  return ITEM_COLORS[itemId] ?? '#ff00ff'
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
  const newGrid = grid.map((r, ri) =>
    ri === row ? r.map((c, ci) => (ci === col ? { itemId } : c)) : r,
  )
  return newGrid
}

export function removeItem(grid: Tile[][], row: number, col: number): Tile[][] {
  if (!isValidCell(row, col)) return grid
  const newGrid = grid.map((r, ri) =>
    ri === row ? r.map((c, ci) => (ci === col ? { itemId: null } : c)) : r,
  )
  return newGrid
}
