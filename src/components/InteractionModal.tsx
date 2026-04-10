import { useState } from 'react'
import { useGameStore } from '../store/gameState'

export function InteractionModal() {
  const activeModal = useGameStore((s) => s.activeModal)
  const setActiveModal = useGameStore((s) => s.setActiveModal)
  const [answer, setAnswer] = useState('')

  if (!activeModal) return null

  const handleClose = () => {
    setActiveModal(null)
    setAnswer('')
  }

  const handleSubmit = () => {
    // Placeholder for Phase 7 LLM integration
    handleClose()
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="puzzle-title"
    >
      <div className="modal-content">
        <h2 id="puzzle-title">{activeModal.question}</h2>
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Your answer"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Escape') handleClose()
          }}
        />
        <div className="modal-actions">
          <button type="button" onClick={handleSubmit}>
            Submit
          </button>
          <button
            type="button"
            className="secondary"
            onClick={handleClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
