import {
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
  RUN_FRAME_MS,
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

  const intentDx = (keys['d'] ? 1 : 0) - (keys['a'] ? 1 : 0)
  let facingRight = player.facingRight
  if (intentDx > 0) facingRight = true
  else if (intentDx < 0) facingRight = false

  if (dx !== 0 && dy !== 0) {
    const inv = 1 / Math.sqrt(2)
    dx *= inv
    dy *= inv
  }

  const nextX = player.x + dx * player.speed * deltaTime
  const nextY = player.y + dy * player.speed * deltaTime

  const maxX = WORLD_WIDTH - PLAYER_WIDTH
  const maxY = WORLD_HEIGHT - PLAYER_HEIGHT

  const moving = dx !== 0 || dy !== 0
  const deltaMs = deltaTime * 16.67
  let runAnimMs = player.runAnimMs
  let runFrame = player.runFrame

  if (moving) {
    runAnimMs += deltaMs
    while (runAnimMs >= RUN_FRAME_MS) {
      runAnimMs -= RUN_FRAME_MS
      runFrame = (runFrame + 1) % 4
    }
  } else {
    runAnimMs = 0
    runFrame = 0
  }

  return {
    ...player,
    x: Math.max(0, Math.min(maxX, nextX)),
    y: Math.max(0, Math.min(maxY, nextY)),
    facingRight,
    runFrame,
    runAnimMs,
    moving,
  }
}
