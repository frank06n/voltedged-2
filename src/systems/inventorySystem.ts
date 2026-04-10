import { HOTBAR_SLOTS, MAX_STACK_SIZE } from '../constants'
import type { InventorySlot } from '../types'

export function consumeFromSlot(
  slots: (InventorySlot | null)[],
  index: number,
): (InventorySlot | null)[] {
  if (index < 0 || index >= slots.length) return slots
  const slot = slots[index]
  if (!slot || slot.quantity <= 0) return slots

  const next = [...slots]
  if (slot.quantity <= 1) {
    next[index] = null
  } else {
    next[index] = { ...slot, quantity: slot.quantity - 1 }
  }
  return next
}

export function returnToInventory(
  slots: (InventorySlot | null)[],
  itemId: string,
): (InventorySlot | null)[] {
  const next = [...slots]

  for (let i = 0; i < next.length; i++) {
    const s = next[i]
    if (s && s.itemId === itemId && s.quantity < MAX_STACK_SIZE) {
      next[i] = { ...s, quantity: s.quantity + 1 }
      return next
    }
  }

  for (let i = 0; i < next.length; i++) {
    if (next[i] === null) {
      next[i] = { itemId, quantity: 1 }
      return next
    }
  }

  return slots
}

export function canPlaceItem(
  slots: (InventorySlot | null)[],
  index: number,
): boolean {
  const slot = slots[index]
  return slot !== null && slot !== undefined && slot.quantity > 0
}

export function addItems(
  slots: (InventorySlot | null)[],
  items: { itemId: string; quantity: number }[],
): (InventorySlot | null)[] {
  let next = [...slots]
  for (const { itemId, quantity } of items) {
    for (let q = 0; q < quantity; q++) {
      next = returnToInventory(next, itemId)
    }
  }
  return next
}

export function inventoryConfigToSlots(
  inventory: { itemId: string; quantity: number }[],
): (InventorySlot | null)[] {
  const slots: (InventorySlot | null)[] = Array.from(
    { length: HOTBAR_SLOTS },
    () => null,
  )
  let idx = 0
  for (const inv of inventory) {
    if (idx >= HOTBAR_SLOTS) break
    slots[idx] = { itemId: inv.itemId, quantity: inv.quantity }
    idx += 1
  }
  return slots
}
