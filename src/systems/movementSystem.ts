import {
  PLAYER_SIZE,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../constants'
import type { Player } from '../types'

export function updatePlayerPosition(
  player: Player,
  keys: Record<string, boolean>,
  deltaTime: number,
): Player {
  let dx = 0
  let dy = 0

  if (keys['w']) dy -= 1
  if (keys['s']) dy += 1
  if (keys['a']) dx -= 1
  if (keys['d']) dx += 1

  if (dx !== 0 && dy !== 0) {
    const inv = 1 / Math.sqrt(2)
    dx *= inv
    dy *= inv
  }

  const nextX = player.x + dx * player.speed * deltaTime
  const nextY = player.y + dy * player.speed * deltaTime

  const maxX = WORLD_WIDTH - PLAYER_SIZE
  const maxY = WORLD_HEIGHT - PLAYER_SIZE

  return {
    ...player,
    x: Math.max(0, Math.min(maxX, nextX)),
    y: Math.max(0, Math.min(maxY, nextY)),
  }
}
