import { useGameStore } from '../store/gameState'

export function Player() {
  const player = useGameStore((s) => s.player)

  return (
    <div
      className="player"
      style={{ left: player.x, top: player.y }}
      aria-hidden
    />
  )
}
