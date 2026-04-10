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
    const savedTeamName = localStorage.getItem('session_teamName')
    if (savedTeamName) {
      // Re-login with the saved team name. teamLeadName isn't needed for
      // returning sessions since the backend matches on teamName.
      startSession(savedTeamName, 'returning').then(config => {
        useGameStore.getState().loadSession(config)
        setScreen('game')
      }).catch((e) => {
        console.error('Auto-login failed:', e)
        localStorage.removeItem('session_teamName')
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
