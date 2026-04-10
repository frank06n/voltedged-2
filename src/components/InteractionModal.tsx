import { useEffect, useRef, useState } from 'react'
import {
  buildSessionSyncSnapshot,
  syncSessionToApi,
  verifyPuzzle,
} from '../api/sessionApi'
import { useGameStore } from '../store/gameState'

type Feedback = 'idle' | 'correct' | 'wrong'

export function InteractionModal() {
  const activeModal = useGameStore((s) => s.activeModal)
  const setActiveModal = useGameStore((s) => s.setActiveModal)
  const markZoneSolved = useGameStore((s) => s.markZoneSolved)
  const applyServerInventory = useGameStore((s) => s.applyServerInventory)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setAnswer('')
    setFeedback('idle')
  }, [activeModal?.id])

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  if (!activeModal) return null

  const questionLink = activeModal.question.trim()

  const handleClose = () => {
    setActiveModal(null)
    setAnswer('')
    setFeedback('idle')
  }

  const fireSync = () => {
    void syncSessionToApi(buildSessionSyncSnapshot(useGameStore.getState()))
  }

  const handleSubmit = async () => {
    if (activeModal.solved) {
      handleClose()
      return
    }

    const guess = answer.trim()
    const sessionId = useGameStore.getState().sessionId
    if (!sessionId) return

    const res = await verifyPuzzle(sessionId, activeModal.id, guess)

    if (res.success && res.inventory && res.solvedPuzzleIds) {
      setFeedback('correct')

      markZoneSolved(activeModal.id)
      applyServerInventory(res.inventory)

      fireSync()
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
      closeTimerRef.current = window.setTimeout(() => {
        closeTimerRef.current = null
        handleClose()
      }, 500)
    } else {
      setFeedback('wrong')
    }
  }

  if (activeModal.solved) {
    return (
      <div
        className="modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="puzzle-title"
      >
        <div className="modal-content">
          <h2 id="puzzle-title">Puzzle</h2>
          {questionLink ? (
            <p className="modal-question-link">
              <a href={questionLink} target="_blank" rel="noreferrer">
                Question link
              </a>
            </p>
          ) : null}
          <p className="modal-solved-text">Completed.</p>
          <div className="modal-actions">
            <button type="button" className="secondary" onClick={handleClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="puzzle-title"
    >
      <div className="modal-content">
        <h2 id="puzzle-title">Puzzle</h2>
        {questionLink ? (
          <p className="modal-question-link">
            <a href={questionLink} target="_blank" rel="noreferrer">
              Open question document
            </a>
          </p>
        ) : (
          <p className="modal-question-link">No question link for this puzzle.</p>
        )}
        <input
          type="text"
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value)
            setFeedback('idle')
          }}
          placeholder="Your answer"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Escape') handleClose()
            if (e.key === 'Enter') handleSubmit()
          }}
        />
        {feedback === 'correct' ? (
          <p className="modal-feedback modal-feedback-correct">Correct!</p>
        ) : null}
        {feedback === 'wrong' ? (
          <p className="modal-feedback modal-feedback-wrong">Try again.</p>
        ) : null}
        <div className="modal-actions">
          <button type="button" onClick={handleSubmit}>
            Submit
          </button>
          <button type="button" className="secondary" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
