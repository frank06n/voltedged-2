import {
  EDGE_THRESHOLD,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../constants'
import type { Camera, Player } from '../types'

export function updateCamera(
  player: Player,
  camera: Camera,
  viewportWidth: number,
  viewportHeight: number,
): Camera {
  let nextX = camera.x
  let nextY = camera.y

  const playerScreenX = player.x - camera.x
  const playerScreenY = player.y - camera.y

  if (playerScreenX > viewportWidth - EDGE_THRESHOLD) {
    nextX = player.x - (viewportWidth - EDGE_THRESHOLD)
  }
  if (playerScreenX < EDGE_THRESHOLD) {
    nextX = player.x - EDGE_THRESHOLD
  }
  if (playerScreenY > viewportHeight - EDGE_THRESHOLD) {
    nextY = player.y - (viewportHeight - EDGE_THRESHOLD)
  }
  if (playerScreenY < EDGE_THRESHOLD) {
    nextY = player.y - EDGE_THRESHOLD
  }

  const maxCamX = Math.max(0, WORLD_WIDTH - viewportWidth)
  const maxCamY = Math.max(0, WORLD_HEIGHT - viewportHeight)

  return {
    x: Math.max(0, Math.min(maxCamX, nextX)),
    y: Math.max(0, Math.min(maxCamY, nextY)),
  }
}
