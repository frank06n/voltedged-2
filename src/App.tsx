import { useState, useEffect } from 'react'
import type { SessionConfig } from './api/types'
import { startSession } from './api/sessionApi'
import { Game } from './components/Game'
import { StartScreen } from './components/StartScreen'
import { useGameStore } from './store/gameState'
import './styles/game.css'

function App() {
  const [screen, setScreen] = useState<'start' | 'game' | 'loading'>('loading')

  useEffect(() => {
    const savedSeed = localStorage.getItem('session_seed')
    if (savedSeed) {
      startSession(savedSeed).then(config => {
        useGameStore.getState().loadSession(config)
        setScreen('game')
      }).catch((e) => {
        console.error('Auto-login failed:', e)
        localStorage.removeItem('session_seed')
        setScreen('start')
      })
    } else {
      setScreen('start')
    }
  }, [])

  const handleSessionStart = (config: SessionConfig) => {
    useGameStore.getState().loadSession(config)
    setScreen('game')
  }

  const handleLogout = () => {
    setScreen('start')
  }

  if (screen === 'loading') {
    return (
      <div className="start-screen">
        <div className="start-card">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return screen === 'start' ? (
    <StartScreen onSessionStart={handleSessionStart} />
  ) : (
    <Game onLogout={handleLogout} />
  )
}

export default App
