export const PLAYER_IDLE_SRC = '/player/idle.png'

export function getRunSpriteSrc(frame: number): string {
  const f = Math.max(0, Math.min(3, Math.floor(frame)))
  return `/player/run_${f}.png`
}
