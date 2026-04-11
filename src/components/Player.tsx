import {
  getRunSpriteSrc,
  PLAYER_IDLE_SRC,
} from '../data/playerSprites'
import { useGameStore } from '../store/gameState'

export function Player() {
  const player = useGameStore((s) => s.player)

  const src = player.moving
    ? getRunSpriteSrc(player.runFrame)
    : PLAYER_IDLE_SRC

  return (
    <div
      className="player"
      style={{ left: player.x, top: player.y }}
      aria-hidden
    >
      <img
        className="player-sprite"
        src={src}
        alt=""
        draggable={false}
        style={{
          transform: player.facingRight
            ? 'translateX(-50%)'
            : 'translateX(-50%) scaleX(-1)',
        }}
      />
    </div>
  )
}
