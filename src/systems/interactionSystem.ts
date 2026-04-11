import { PLAYER_HEIGHT, PLAYER_WIDTH } from '../constants'
import type { InteractionZone, Player } from '../types'

/** Lower 32×32 of the player hitbox (feet); E only activates when this overlaps a zone. */
export function findActiveZone(
  player: Player,
  zones: InteractionZone[],
): InteractionZone | null {
  const pxLeft = player.x
  const pxRight = player.x + PLAYER_WIDTH
  const pyTop = player.y + PLAYER_HEIGHT / 2
  const pyBottom = player.y + PLAYER_HEIGHT

  for (const z of zones) {
    const zRight = z.x + z.width
    const zBottom = z.y + z.height
    if (
      pxLeft < zRight &&
      pxRight > z.x &&
      pyTop < zBottom &&
      pyBottom > z.y
    ) {
      return z
    }
  }
  return null
}
