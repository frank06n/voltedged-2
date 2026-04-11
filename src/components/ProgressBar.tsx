import { useEffect, useState } from 'react'
import { getComponentDisplayName, getComponentImage } from '../data/itemDefinitions'
import { useGameStore } from '../store/gameState'

export function ProgressBar() {
  const solvedCount = useGameStore((s) => s.solvedCount)
  const totalPuzzles = useGameStore((s) => s.totalPuzzles)
  const totalComponents = useGameStore((s) => s.totalComponents)
  const componentsEarned = useGameStore((s) => s.componentsEarned)
  const lastUnlocked = useGameStore((s) => s.lastUnlockedComponents)
  const setLastUnlockedComponents = useGameStore((s) => s.setLastUnlockedComponents)
  const shift = useGameStore((s) => s.shift)

  const [unlockModal, setUnlockModal] = useState<{ itemId: string; quantity: number }[]>([])

  const progressPercent = totalPuzzles > 0 ? Math.round((solvedCount / totalPuzzles) * 100) : 0
  const componentsLeft = totalComponents - componentsEarned
  const allUnlocked = componentsLeft <= 0 && totalComponents > 0

  const CIRCUIT_HINTS: Record<number, string> = {
    1: 'Build a Solar Boost Converter using the PV cell, capacitors, inductor, IGBT, diode, and resistor',
    2: 'Build a Full-Bridge Inverter using the DC source, 4 IGBTs, 4 diodes, and resistor',
  }

  // Show unlock modal when new components are earned
  useEffect(() => {
    if (lastUnlocked.length > 0) {
      setUnlockModal([...lastUnlocked])
      setLastUnlockedComponents([])
    }
  }, [lastUnlocked, setLastUnlockedComponents])

  const dismissUnlock = () => {
    setUnlockModal([])
  }

  return (
    <>
      {/* Progress HUD */}
      <div className="progress-hud" role="status" aria-label="Puzzle progress">
        <div className="progress-header">
          <span className="progress-label">Progress</span>
          <span className="progress-pct">{progressPercent}%</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="progress-solved-count">
          {solvedCount} / {totalPuzzles} solved
        </div>
        <div className={`progress-hint${allUnlocked ? ' progress-hint--done' : ''}`}>
          {componentsLeft > 0 ? (
            <>
              <strong>{componentsLeft}</strong> component{componentsLeft !== 1 ? 's' : ''} left to unlock
            </>
          ) : allUnlocked ? (
            'All components unlocked'
          ) : null}
        </div>
      </div>

      {/* Circuit build hint — top-center banner, shown after all components are unlocked */}
      {allUnlocked && CIRCUIT_HINTS[shift] && (
        <div className="circuit-hint-banner">
          <span className="circuit-hint-tag">Objective</span>
          <span className="circuit-hint-text">{CIRCUIT_HINTS[shift]}</span>
        </div>
      )}

      {/* Unlock Modal — full screen popup */}
      {unlockModal.length > 0 && (
        <div className="unlock-overlay" onClick={dismissUnlock}>
          <div className="unlock-modal" onClick={(e) => e.stopPropagation()}>
            <div className="unlock-header">Component Obtained</div>
            <div className="unlock-items">
              {unlockModal.map((item, i) => (
                <div key={i} className="unlock-item">
                  <div className="unlock-item-icon">
                    {getComponentImage(item.itemId) ? (
                      <img
                        src={getComponentImage(item.itemId)}
                        alt={getComponentDisplayName(item.itemId)}
                      />
                    ) : (
                      <span style={{ color: '#50c878', fontSize: 18 }}>+</span>
                    )}
                  </div>
                  <div className="unlock-item-info">
                    <div className="unlock-item-name">
                      {getComponentDisplayName(item.itemId)}
                    </div>
                    <div className="unlock-item-qty">
                      x{item.quantity} added to inventory
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="unlock-dismiss" onClick={dismissUnlock}>
              Continue
            </button>
          </div>
        </div>
      )}
    </>
  )
}
