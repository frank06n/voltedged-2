import { useEffect, useRef } from 'react'

export function useKeyboard() {
  const keys = useRef<Record<string, boolean>>({})

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true
    }
    const up = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false
    }

    const resetKeys = () => {
      keys.current = {}
    }

    const onVisibilityChange = () => {
      if (document.hidden) resetKeys()
    }

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', resetKeys)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', resetKeys)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return keys
}
