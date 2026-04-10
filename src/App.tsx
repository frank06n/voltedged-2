import { useState } from 'react'
import type { SessionConfig } from './api/types'
import { Game } from './components/Game'
import { StartScreen } from './components/StartScreen'
import { useGameStore } from './store/gameState'
import './styles/game.css'

function App() {
  const [screen, setScreen] = useState<'start' | 'game'>('start')

  const handleSessionStart = (config: SessionConfig) => {
    useGameStore.getState().loadSession(config)
    setScreen('game')
  }

  return screen === 'start' ? (
    <StartScreen onSessionStart={handleSessionStart} />
  ) : (
    <Game />
  )
}

export default App
