import type { InventorySlot, Tile } from '../types'
import { canPlaceItem } from './inventorySystem'
import { isValidCell } from './gridSystem'
import { isInsidePlacementZone } from './placementZones'

export function canPlaceAt(
  worldX: number,
  worldY: number,
  gridRow: number,
  gridCol: number,
  grid: Tile[][],
  slots: (InventorySlot | null)[],
  activeIndex: number,
): boolean {
  if (!isInsidePlacementZone(worldX, worldY)) return false
  if (!isValidCell(gridRow, gridCol)) return false
  if (grid[gridRow][gridCol].itemId !== null) return false
  if (!canPlaceItem(slots, activeIndex)) return false
  return true
}

export function canRemoveAt(
  worldX: number,
  worldY: number,
  gridRow: number,
  gridCol: number,
  grid: Tile[][],
): boolean {
  if (!isInsidePlacementZone(worldX, worldY)) return false
  if (!isValidCell(gridRow, gridCol)) return false
  if (!grid[gridRow][gridCol].itemId) return false
  return true
}
