import { useState } from 'react'
import type { SessionConfig } from '../api/types'
import { startSession } from '../api/sessionApi'

type StartScreenProps = {
  onSessionStart: (config: SessionConfig) => void
}

export function StartScreen({ onSessionStart }: StartScreenProps) {
  const [teamName, setTeamName] = useState('')
  const [teamLeadName, setTeamLeadName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStart = async () => {
    if (!teamName.trim() || !teamLeadName.trim()) {
      setError('Please fill in both fields')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const config = await startSession(teamName, teamLeadName)
      localStorage.setItem('session_teamName', config.teamName)
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
        <h1>Voltedged</h1>
        <p>Enter your team details</p>
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Team Name"
          autoComplete="off"
          aria-label="Team name"
        />
        <input
          type="text"
          value={teamLeadName}
          onChange={(e) => setTeamLeadName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Team Lead Name"
          autoComplete="off"
          aria-label="Team lead name"
          style={{ marginTop: '0.5rem' }}
        />
        <button type="button" onClick={() => void handleStart()} disabled={loading}>
          {loading ? 'Starting…' : 'Start'}
        </button>
        {error ? <div className="start-error">{error}</div> : null}
      </div>
    </div>
  )
}
