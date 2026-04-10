import { PLAYER_SIZE } from '../constants'
import type { InteractionZone, Player } from '../types'

export function findActiveZone(
  player: Player,
  zones: InteractionZone[],
): InteractionZone | null {
  const pxLeft = player.x
  const pxRight = player.x + PLAYER_SIZE
  const pyTop = player.y
  const pyBottom = player.y + PLAYER_SIZE

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
