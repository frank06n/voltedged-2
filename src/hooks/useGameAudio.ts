import { useEffect, useRef } from 'react'
import {
  MUSIC_TRACKS,
  MUSIC_VOLUME,
  SFX_RUN_SRC,
  SFX_RUN_VOLUME,
} from '../audio/audioConfig'
import { useGameStore } from '../store/gameState'

/**
 * Run loop SFX while moving; alternating music after game (Game) mounts.
 * Music obeys `musicEnabled`; run SFX only when not in a modal.
 */
export function useGameAudio(musicEnabled: boolean) {
  const runRef = useRef<HTMLAudioElement | null>(null)
  const musicRef = useRef<HTMLAudioElement | null>(null)
  const trackIndexRef = useRef(0)
  const musicEnabledRef = useRef(musicEnabled)
  musicEnabledRef.current = musicEnabled

  const moving = useGameStore((s) => s.player.moving)
  const activeModal = useGameStore((s) => s.activeModal)

  useEffect(() => {
    const run = new Audio()
    run.loop = true
    run.preload = 'auto'
    run.src = SFX_RUN_SRC
    run.volume = SFX_RUN_VOLUME
    runRef.current = run

    const music = new Audio()
    music.preload = 'auto'
    music.volume = MUSIC_VOLUME
    music.onended = () => {
      if (!musicEnabledRef.current) return
      trackIndexRef.current = (trackIndexRef.current + 1) % MUSIC_TRACKS.length
      music.src = MUSIC_TRACKS[trackIndexRef.current]
      void music.play().catch(() => {})
    }
    musicRef.current = music

    return () => {
      run.pause()
      run.src = ''
      music.pause()
      music.src = ''
      runRef.current = null
      musicRef.current = null
    }
  }, [])

  useEffect(() => {
    const music = musicRef.current
    if (!music) return
    music.volume = MUSIC_VOLUME
    if (musicEnabled) {
      if (!music.src) {
        trackIndexRef.current = 0
        music.src = MUSIC_TRACKS[0]
      }
      void music.play().catch(() => {})
    } else {
      music.pause()
    }
  }, [musicEnabled])

  useEffect(() => {
    const run = runRef.current
    if (!run) return
    run.volume = SFX_RUN_VOLUME
    const shouldPlay = moving && !activeModal
    if (shouldPlay) {
      if (run.paused) void run.play().catch(() => {})
    } else {
      run.pause()
      run.currentTime = 0
    }
  }, [moving, activeModal])
}
