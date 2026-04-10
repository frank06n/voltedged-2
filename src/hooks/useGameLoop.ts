import { useEffect, useRef } from 'react'

export function useGameLoop(callback: (deltaTime: number) => void) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    let frame: number
    let lastTime = performance.now()

    const loop = (now: number) => {
      const deltaMs = now - lastTime
      lastTime = now
      const deltaTime = deltaMs / 16.67
      callbackRef.current(deltaTime)
      frame = requestAnimationFrame(loop)
    }

    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [])
}
