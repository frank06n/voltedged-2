import { useCallback, useEffect, useRef, useState } from 'react'
import {
  API_BASE_URL,
  buildSessionSyncSnapshot,
  checkCircuit,
  syncSessionToApi,
} from '../api/sessionApi'
import { playPickSfx, playPutSfx } from '../audio/playSfx'
import { getItemVariantOptions } from '../data/itemDefinitions'
import { useGameAudio } from '../hooks/useGameAudio'
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
import { ProgressBar } from './ProgressBar'
import { World } from './World'

const SYNC_COOLDOWN_MS = 5000    // 5s cooldown for sync
const CIRCUIT_COOLDOWN_MS = 10000 // 10s cooldown for circuit complete

const MUSIC_STORAGE_KEY = 'voltedge_music_enabled'

export function Game({ onLogout }: { onLogout: () => void }) {
  const [musicEnabled, setMusicEnabled] = useState(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem(MUSIC_STORAGE_KEY) !== 'false'
  })
  useGameAudio(musicEnabled)

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
  const [showCongrats, setShowCongrats] = useState(false)
  const [congratsTime, setCongratsTime] = useState('')
  const [gameOver, setGameOver] = useState(false)
  const [showJudgeHint, setShowJudgeHint] = useState(false)

  // Sync button state
  const [syncing, setSyncing] = useState(false)
  const [syncCooldown, setSyncCooldown] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')

  // Circuit cooldown state
  const [circuitCooldown, setCircuitCooldown] = useState(false)

  const toggleMusic = () => {
    setMusicEnabled((prev) => {
      const next = !prev
      localStorage.setItem(MUSIC_STORAGE_KEY, String(next))
      return next
    })
  }

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

    setCircuitMsg('')
    await syncSessionToApi(buildSessionSyncSnapshot(useGameStore.getState()))

    const res = await checkCircuit(sessionId)
    if (!res.success) {
      setCircuitMsg(res.message || 'Could not check circuit status')
      setCircuitCooldown(true)
      setTimeout(() => setCircuitCooldown(false), CIRCUIT_COOLDOWN_MS)
      return
    }

    if (res.circuitCorrect) {
      useGameStore.getState().setCircuitApproved(true)
      const t = res.completedAt
        ? new Date(res.completedAt).toLocaleTimeString()
        : new Date().toLocaleTimeString()
      setCongratsTime(t)
      setCircuitDone(true)
      setShowCongrats(true)
    } else {
      setShowJudgeHint(true)
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

  const sessionResumeRef = useRef(false)
  useEffect(() => {
    if (sessionResumeRef.current) return
    sessionResumeRef.current = true
    if (useGameStore.getState().circuitApproved) {
      setCircuitDone(true)
      setGameOver(true)
    }
  }, [])

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
        playPickSfx()
      }
      return
    }

    if (e.button !== 0) return

    if (cell.itemId) {
      if (canRemoveAt(worldX, worldY, gridRow, gridCol, grid)) {
        const itemId = cell.itemId
        setGrid(removeItem(grid, gridRow, gridCol))
        returnItem(itemId)
        playPickSfx()
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
    playPutSfx()
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
      <ProgressBar />

      {/* Top-right action buttons */}
      <div className="game-actions">
              {/* Music */}
      <button
        type="button"
        onClick={toggleMusic}
        className={`retro-btn ${musicEnabled ? 'retro-btn--done' : ''}`}
        aria-pressed={musicEnabled}
        title="Background music"
      >
        {musicEnabled ? 'Music: On' : 'Music: Off'}
      </button>
      
        <button
          className={`retro-btn ${circuitDone ? 'retro-btn--done' : ''}`}
          onClick={handleCircuitComplete}
          disabled={circuitDone || circuitCooldown}
        >
          {circuitDone ? 'Circuit Tested' : circuitCooldown ? 'Wait...' : 'Test Circuit'}
        </button>

        <button
          className={`retro-btn ${syncing ? 'retro-btn--active' : ''}`}
          onClick={handleSync}
          disabled={syncing || syncCooldown}
        >
          {syncing ? 'Saving...' : syncCooldown ? 'Wait...' : 'Save'}
        </button>

        <button
          className="retro-btn retro-btn--danger"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* Status messages */}
      {(syncMsg || circuitMsg) && (
        <div className="game-status-msg">{syncMsg || circuitMsg}</div>
      )}

      {/* Judge: manual circuit verification */}
      {showJudgeHint && (
        <div
          className="congrats-overlay"
          onClick={() => setShowJudgeHint(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="judge-hint-title"
        >
          <div className="congrats-modal" onClick={(e) => e.stopPropagation()}>
            <div className="congrats-title" id="judge-hint-title">
              See a judge
            </div>
            <div className="congrats-subtitle">
              Please go to a judge with your team so they can manually test your circuit. When they
              approve it in the admin panel, press <strong>Test Circuit</strong> again to finish.
            </div>
            <button
              type="button"
              className="congrats-dismiss"
              onClick={() => setShowJudgeHint(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Congrats popup on circuit completion */}
      {showCongrats && (
        <div className="congrats-overlay" onClick={() => { setShowCongrats(false); setGameOver(true); }}>
          <div className="congrats-modal" onClick={(e) => e.stopPropagation()}>
            <div className="congrats-title">Circuit Complete</div>
            <div className="congrats-subtitle">Your team successfully built and tested the circuit</div>
            <div className="congrats-time">Completed at {congratsTime}</div>
            <button className="congrats-dismiss" onClick={() => { setShowCongrats(false); setGameOver(true); }}>
              Close
            </button>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-content">
            <div className="game-over-title">THANKS FOR PLAYING!</div>
            <div className="game-over-credit">made with ❤ by Power Engineering UG2</div>
          </div>
        </div>
      )}
    </div>
  )
}
