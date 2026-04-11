import { useEffect, useRef, useState } from 'react'
import {
  buildSessionSyncSnapshot,
  getPuzzleQuestion,
  syncSessionToApi,
  verifyPuzzle,
} from '../api/sessionApi'
import {
  getComponentDisplayName,
  getComponentImage,
} from '../data/itemDefinitions'
import { useGameStore } from '../store/gameState'

type Feedback = 'idle' | 'correct' | 'wrong'

export function InteractionModal() {
  const activeModal = useGameStore((s) => s.activeModal)
  const setActiveModal = useGameStore((s) => s.setActiveModal)
  const markZoneSolved = useGameStore((s) => s.markZoneSolved)
  const applyServerInventory = useGameStore((s) => s.applyServerInventory)
  const updateProgress = useGameStore((s) => s.updateProgress)
  const setLastUnlockedComponents = useGameStore((s) => s.setLastUnlockedComponents)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [questionLink, setQuestionLink] = useState<string | null>(null)
  const [questionLoading, setQuestionLoading] = useState(false)
  const [questionError, setQuestionError] = useState<string | null>(null)
  const [unlockedItems, setUnlockedItems] = useState<{ itemId: string; quantity: number }[]>([])
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setAnswer('')
    setFeedback('idle')
    setUnlockedItems([])
  }, [activeModal?.id])

  useEffect(() => {
    if (!activeModal?.id) {
      setQuestionLink(null)
      setQuestionLoading(false)
      setQuestionError(null)
      return
    }

    const sessionId = useGameStore.getState().sessionId
    if (!sessionId) {
      setQuestionError('No session.')
      setQuestionLink(null)
      setQuestionLoading(false)
      return
    }

    let cancelled = false
    setQuestionLoading(true)
    setQuestionError(null)
    setQuestionLink(null)

    getPuzzleQuestion(sessionId, activeModal.id).then((res) => {
      if (cancelled) return
      setQuestionLoading(false)
      if (res.success && res.question) {
        setQuestionLink(res.question.trim() || null)
      } else {
        setQuestionError(res.message ?? 'Could not load question link.')
      }
    })

    return () => {
      cancelled = true
    }
  }, [activeModal?.id])

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  if (!activeModal) return null

  const linkHref = questionLink ?? ''

  const handleClose = () => {
    setActiveModal(null)
    setAnswer('')
    setFeedback('idle')
    setUnlockedItems([])
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

      // Update progress state
      if (res.solvedCount !== undefined && res.totalPuzzles !== undefined && res.totalComponents !== undefined && res.componentsEarned !== undefined) {
        updateProgress(res.solvedCount, res.totalPuzzles, res.totalComponents, res.componentsEarned)
      }

      // Trigger unlock modal via ProgressBar
      const unlocked = res.unlockedComponents ?? []
      if (unlocked.length > 0) {
        setUnlockedItems(unlocked)
        setLastUnlockedComponents(unlocked)
      }

      fireSync()
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
      const delay = unlocked.length > 0 ? 2500 : 500
      closeTimerRef.current = window.setTimeout(() => {
        closeTimerRef.current = null
        handleClose()
      }, delay)
    } else {
      setFeedback('wrong')
    }
  }

  const questionBlock = questionLoading ? (
    <p className="modal-question-link">Loading question...</p>
  ) : questionError ? (
    <p className="modal-question-link modal-question-error">{questionError}</p>
  ) : linkHref ? (
    <p className="modal-question-link">
      <a href={linkHref} target="_blank" rel="noreferrer" style={{ color: '#50c878' }}>
        Open question document
      </a>
    </p>
  ) : (
    <p className="modal-question-link">No link available for this puzzle.</p>
  )

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
          {questionBlock}
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
        {questionBlock}
        <input
          type="text"
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value)
            setFeedback('idle')
          }}
          placeholder="Your answer"
          autoFocus={!questionLoading}
          disabled={questionLoading}
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

        {/* Show unlocked components inline */}
        {feedback === 'correct' && unlockedItems.length > 0 && (
          <div className="modal-unlocked">
            <div className="modal-unlocked-label">Component Obtained</div>
            {unlockedItems.map((item, i) => (
              <div key={i} className="modal-unlocked-item">
                {getComponentImage(item.itemId) ? (
                  <img
                    src={getComponentImage(item.itemId)}
                    alt={getComponentDisplayName(item.itemId)}
                  />
                ) : null}
                <span>
                  {item.quantity}x {getComponentDisplayName(item.itemId)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={questionLoading}
          >
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
