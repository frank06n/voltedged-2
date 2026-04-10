import { useCallback, useEffect, useRef, useState } from 'react'
import { useGameLoop } from '../hooks/useGameLoop'
import { useKeyboard } from '../hooks/useKeyboard'
import { useMouse } from '../hooks/useMouse'
import { updateCamera } from '../systems/cameraSystem'
import { findActiveZone } from '../systems/interactionSystem'
import {
  isValidCell,
  placeItem,
  removeItem,
} from '../systems/gridSystem'
import { updatePlayerPosition } from '../systems/movementSystem'
import { useGameStore } from '../store/gameState'
import { Hotbar } from './Hotbar'
import { InteractionModal } from './InteractionModal'
import { World } from './World'

export function Game() {
  const keysRef = useKeyboard()
  const { mousePos, screenToWorld, worldToGrid } = useMouse()
  const containerRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight : 600,
  })
  const [hoverWorld, setHoverWorld] = useState<{
    x: number
    y: number
  } | null>(null)
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight : 600,
  }))

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      viewportRef.current = { width: w, height: h }
      setViewport({ width: w, height: h })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const tick = useCallback((deltaTime: number) => {
    const state = useGameStore.getState()
    if (state.activeModal) return

    const keys = keysRef.current
    const newPlayer = updatePlayerPosition(
      state.player,
      keys,
      deltaTime,
    )
    state.setPlayer(newPlayer)

    const { width: vw, height: vh } = viewportRef.current
    const newCam = updateCamera(newPlayer, state.camera, vw, vh)
    state.setCamera(newCam)
  }, [keysRef])

  useGameLoop(tick)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      const state = useGameStore.getState()
      if (state.activeModal) return

      const k = e.key.toLowerCase()
      if (k >= '1' && k <= '8') {
        const idx = Number.parseInt(k, 10) - 1
        state.setHotbarActive(idx)
        e.preventDefault()
        return
      }
      if (k === 'e') {
        const zone = findActiveZone(state.player, state.interactionZones)
        if (zone) {
          state.setActiveModal(zone)
          e.preventDefault()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const screenX = e.clientX - rect.left
    const screenY = e.clientY - rect.top
    mousePos.current = { x: screenX, y: screenY }
    const { camera } = useGameStore.getState()
    const { worldX, worldY } = screenToWorld(screenX, screenY, camera)
    setHoverWorld({ x: worldX, y: worldY })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const state = useGameStore.getState()
    if (state.activeModal) return

    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const screenX = e.clientX - rect.left
    const screenY = e.clientY - rect.top
    const { camera, grid, hotbar, setGrid } = state
    const { worldX, worldY } = screenToWorld(screenX, screenY, camera)
    const { gridCol, gridRow } = worldToGrid(worldX, worldY)

    if (!isValidCell(gridRow, gridCol)) return

    const cell = grid[gridRow][gridCol]

    if (e.button === 2) {
      e.preventDefault()
      if (cell.itemId) {
        setGrid(removeItem(grid, gridRow, gridCol))
      }
      return
    }

    if (e.button !== 0) return

    if (cell.itemId) {
      setGrid(removeItem(grid, gridRow, gridCol))
      return
    }

    const itemId = hotbar.slots[hotbar.activeIndex]
    if (itemId) {
      setGrid(placeItem(grid, gridRow, gridCol, itemId))
    }
  }

  return (
    <div
      ref={containerRef}
      className="game-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverWorld(null)}
      onMouseDown={handleMouseDown}
      onContextMenu={(ev) => ev.preventDefault()}
      role="application"
      aria-label="Game world"
    >
      <World
        hoverWorld={hoverWorld}
        viewportWidth={viewport.width}
        viewportHeight={viewport.height}
      />
      <Hotbar />
      <InteractionModal />
    </div>
  )
}
