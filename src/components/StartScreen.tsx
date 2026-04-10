import { useState } from 'react'
import type { SessionConfig } from '../api/types'
import { startSession } from '../api/sessionApi'

type StartScreenProps = {
  onSessionStart: (config: SessionConfig) => void
}

export function StartScreen({ onSessionStart }: StartScreenProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStart = async () => {
    setError(null)
    setLoading(true)
    try {
      const config = await startSession(code)
      localStorage.setItem('session_seed', config.seed)
      onSessionStart(config)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start session')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault()
      void handleStart()
    }
  }

  return (
    <div className="start-screen">
      <div className="start-card">
        <h1>Grid Game</h1>
        <p>Enter session code</p>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Session code"
          autoComplete="off"
          aria-label="Session code"
        />
        <button type="button" onClick={() => void handleStart()} disabled={loading}>
          {loading ? 'Starting…' : 'Start'}
        </button>
        {error ? <div className="start-error">{error}</div> : null}
      </div>
    </div>
  )
}
