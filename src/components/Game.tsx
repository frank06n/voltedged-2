import { useCallback, useEffect, useRef, useState } from 'react'
import {
  API_BASE_URL,
  buildSessionSyncSnapshot,
  completeCircuit,
  syncSessionToApi,
} from '../api/sessionApi'
import { getItemVariantOptions } from '../data/itemDefinitions'
import { useGameLoop } from '../hooks/useGameLoop'
import { useKeyboard } from '../hooks/useKeyboard'
import { useMouse } from '../hooks/useMouse'
import { updateCamera } from '../systems/cameraSystem'
import { findActiveZone } from '../systems/interactionSystem'
import { canPlaceAt, canRemoveAt } from '../systems/placementValidation'
import { isInsidePlacementZone } from '../systems/placementZones'
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

const SYNC_COOLDOWN_MS = 5000    // 5s cooldown for sync
const CIRCUIT_COOLDOWN_MS = 10000 // 10s cooldown for circuit complete

export function Game({ onLogout }: { onLogout: () => void }) {
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
  const hoverWorldRef = useRef<{
    x: number
    y: number
  } | null>(null)
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight : 600,
  }))

  const [circuitDone, setCircuitDone] = useState(false)
  const [circuitMsg, setCircuitMsg] = useState('')

  // Sync button state
  const [syncing, setSyncing] = useState(false)
  const [syncCooldown, setSyncCooldown] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')

  // Circuit cooldown state
  const [circuitCooldown, setCircuitCooldown] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/session/logout`, { method: 'POST' });
    } catch {
      // ignore network errors
    }
    localStorage.removeItem('session_teamName');
    onLogout();
  }

  const handleSync = async () => {
    if (syncing || syncCooldown) return
    setSyncing(true)
    setSyncMsg('')
    try {
      await syncSessionToApi(buildSessionSyncSnapshot(useGameStore.getState()))
      setSyncMsg('Synced!')
    } catch {
      setSyncMsg('Sync failed')
    }
    setSyncing(false)
    setSyncCooldown(true)
    setTimeout(() => setSyncCooldown(false), SYNC_COOLDOWN_MS)
    setTimeout(() => setSyncMsg(''), 3000)
  }

  const fireSync = () => {
    void syncSessionToApi(buildSessionSyncSnapshot(useGameStore.getState()))
  }

  const handleCircuitComplete = async () => {
    if (circuitCooldown || circuitDone) return
    const sessionId = useGameStore.getState().sessionId
    if (!sessionId) return

    // First sync the circuit state
    await syncSessionToApi(buildSessionSyncSnapshot(useGameStore.getState()))

    const res = await completeCircuit(sessionId)
    if (res.success) {
      setCircuitDone(true)
      setCircuitMsg(`Circuit completed at ${new Date(res.completedAt!).toLocaleTimeString()}`)
    } else {
      setCircuitMsg(res.message || 'Failed')
      // Start cooldown on failure
      setCircuitCooldown(true)
      setTimeout(() => setCircuitCooldown(false), CIRCUIT_COOLDOWN_MS)
    }
  }

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

      if (e.shiftKey && k >= '1' && k <= '6') {
        const idx = 9 + Number.parseInt(k, 10)
        state.setHotbarActive(idx)
        e.preventDefault()
        return
      }

      if (k >= '1' && k <= '9') {
        const idx = Number.parseInt(k, 10) - 1
        state.setHotbarActive(idx)
        e.preventDefault()
        return
      }

      if (k === '0') {
        state.setHotbarActive(9)
        e.preventDefault()
        return
      }

      if (k === 'r') {
        const hw = hoverWorldRef.current
        if (hw) {
          const { gridCol, gridRow } = worldToGrid(hw.x, hw.y)
          if (
            isInsidePlacementZone(hw.x, hw.y) &&
            isValidCell(gridRow, gridCol)
          ) {
            const cell = state.grid[gridRow][gridCol]
            if (cell.itemId) {
              if (state.cycleOrientation(gridRow, gridCol)) {
                e.preventDefault()
                fireSync()
                return
              }
            }
          }
        }
        return
      }

      if (k === 'e') {
        const hw = hoverWorldRef.current
        if (hw) {
          const { gridCol, gridRow } = worldToGrid(hw.x, hw.y)
          if (
            isInsidePlacementZone(hw.x, hw.y) &&
            isValidCell(gridRow, gridCol)
          ) {
            const cell = state.grid[gridRow][gridCol]
            const itemId = cell.itemId
            if (
              itemId &&
              getItemVariantOptions(itemId).length > 0
            ) {
              if (state.cycleVariant(gridRow, gridCol)) {
                e.preventDefault()
                return
              }
            }
          }
        }
        const zone = findActiveZone(state.player, state.interactionZones)
        if (zone) {
          state.setActiveModal(zone)
          e.preventDefault()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [worldToGrid])

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const screenX = e.clientX - rect.left
    const screenY = e.clientY - rect.top
    mousePos.current = { x: screenX, y: screenY }
    const { camera } = useGameStore.getState()
    const { worldX, worldY } = screenToWorld(screenX, screenY, camera)
    const next = { x: worldX, y: worldY }
    hoverWorldRef.current = next
    setHoverWorld(next)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const state = useGameStore.getState()
    if (state.activeModal) return

    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const screenX = e.clientX - rect.left
    const screenY = e.clientY - rect.top
    const { camera, grid, hotbar, setGrid, returnItem, consumeItem } = state
    const { worldX, worldY } = screenToWorld(screenX, screenY, camera)
    const { gridCol, gridRow } = worldToGrid(worldX, worldY)

    if (!isValidCell(gridRow, gridCol)) return

    const cell = grid[gridRow][gridCol]

    if (e.button === 2) {
      e.preventDefault()
      if (
        canRemoveAt(worldX, worldY, gridRow, gridCol, grid) &&
        cell.itemId
      ) {
        const itemId = cell.itemId
        setGrid(removeItem(grid, gridRow, gridCol))
        returnItem(itemId)
      }
      return
    }

    if (e.button !== 0) return

    if (cell.itemId) {
      if (canRemoveAt(worldX, worldY, gridRow, gridCol, grid)) {
        const itemId = cell.itemId
        setGrid(removeItem(grid, gridRow, gridCol))
        returnItem(itemId)
      }
      return
    }

    if (
      !canPlaceAt(
        worldX,
        worldY,
        gridRow,
        gridCol,
        grid,
        hotbar.slots,
        hotbar.activeIndex,
      )
    ) {
      return
    }

    const idx = hotbar.activeIndex
    const slot = hotbar.slots[idx]
    if (!slot) return

    const placed = placeItem(grid, gridRow, gridCol, slot.itemId)
    if (placed === grid) return

    if (!consumeItem(idx)) return
    setGrid(placed)
  }

  const btnBase: React.CSSProperties = {
    position: 'absolute',
    top: '16px',
    zIndex: 1000,
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    fontWeight: 'bold',
    cursor: 'pointer',
  }

  return (
    <div
      ref={containerRef}
      className="game-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        hoverWorldRef.current = null
        setHoverWorld(null)
      }}
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

      {/* Logout */}
      <button 
        onClick={handleLogout} 
        style={{ ...btnBase, right: '16px', background: 'rgba(255, 50, 50, 0.8)' }}
      >
        Logout
      </button>

      {/* Sync Circuit */}
      <button
        onClick={handleSync}
        disabled={syncing || syncCooldown}
        style={{
          ...btnBase,
          right: '100px',
          background: syncing ? 'rgba(200, 200, 50, 0.8)' : syncCooldown ? 'rgba(100, 100, 100, 0.6)' : 'rgba(50, 200, 150, 0.8)',
          cursor: (syncing || syncCooldown) ? 'default' : 'pointer',
        }}
      >
        {syncing ? 'Syncing…' : syncCooldown ? 'Wait…' : '⟳ Sync'}
      </button>

      {/* Complete Circuit */}
      <button
        onClick={handleCircuitComplete}
        disabled={circuitDone || circuitCooldown}
        style={{
          ...btnBase,
          right: '200px',
          background: circuitDone ? 'rgba(50, 200, 50, 0.8)' : circuitCooldown ? 'rgba(100, 100, 100, 0.6)' : 'rgba(50, 150, 255, 0.8)',
          cursor: (circuitDone || circuitCooldown) ? 'default' : 'pointer',
        }}
      >
        {circuitDone ? '✓ Circuit Done' : circuitCooldown ? 'Wait 10s…' : 'Complete Circuit'}
      </button>

      {/* Status messages */}
      {(syncMsg || circuitMsg) && (
        <div style={{
          position: 'absolute',
          top: '56px',
          right: '100px',
          zIndex: 1000,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '4px',
          fontSize: '0.85rem'
        }}>{syncMsg || circuitMsg}</div>
      )}
    </div>
  )
}
