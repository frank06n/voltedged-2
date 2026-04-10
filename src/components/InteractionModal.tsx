import { useEffect, useRef, useState } from 'react'
import { buildSessionSyncSnapshot, getPuzzleQuestion, syncSessionToApi } from '../api/sessionApi'
import { useGameStore } from '../store/gameState'

type Feedback = 'idle' | 'correct' | 'wrong'

export function InteractionModal() {
  const activeModal = useGameStore((s) => s.activeModal)
  const setActiveModal = useGameStore((s) => s.setActiveModal)
  const markZoneSolved = useGameStore((s) => s.markZoneSolved)
  const addRewardItems = useGameStore((s) => s.addRewardItems)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [question, setQuestion] = useState<string | null>(null)
  const [loadingQuestion, setLoadingQuestion] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch the question from the backend when the modal opens
  useEffect(() => {
    setAnswer('')
    setFeedback('idle')
    setQuestion(null)

    if (!activeModal) return

    const sessionId = useGameStore.getState().sessionId
    if (!sessionId) return

    setLoadingQuestion(true)
    getPuzzleQuestion(sessionId, activeModal.id).then((res) => {
      if (res.success && res.question) {
        setQuestion(res.question)
      } else {
        setQuestion('Failed to load question.')
      }
      setLoadingQuestion(false)
    })
  }, [activeModal?.id])

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  if (!activeModal) return null

  const handleClose = () => {
    setActiveModal(null)
    setAnswer('')
    setFeedback('idle')
    setQuestion(null)
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
    
    const { verifyPuzzle } = await import('../api/sessionApi')
    const res = await verifyPuzzle(sessionId, activeModal.id, guess)

    if (res.success && res.inventory && res.solvedPuzzleIds) {
      setFeedback('correct')
      
      markZoneSolved(activeModal.id)
      
      if (activeModal.rewardItems) {
         addRewardItems(activeModal.rewardItems)
      }
      
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
          <h2 id="puzzle-title">{question ?? 'Puzzle'}</h2>
          <p className="modal-solved-text">
            Completed.
          </p>
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
        {loadingQuestion ? (
          <h2 id="puzzle-title">Loading question…</h2>
        ) : (
          <h2 id="puzzle-title">{question ?? 'Unknown question'}</h2>
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
          disabled={loadingQuestion}
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
          <button type="button" onClick={handleSubmit} disabled={loadingQuestion}>
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
