import { useCallback, useRef } from 'react'
import { TILE_SIZE } from '../constants'
import type { Camera } from '../types'

export function useMouse() {
  const mousePos = useRef({ x: 0, y: 0 })

  const screenToWorld = useCallback(
    (screenX: number, screenY: number, camera: Camera) => ({
      worldX: screenX + camera.x,
      worldY: screenY + camera.y,
    }),
    [],
  )

  const worldToGrid = useCallback((worldX: number, worldY: number) => ({
    gridCol: Math.floor(worldX / TILE_SIZE),
    gridRow: Math.floor(worldY / TILE_SIZE),
  }), [])

  return { mousePos, screenToWorld, worldToGrid }
}
