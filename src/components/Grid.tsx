import { TILE_SIZE, WORLD_HEIGHT, WORLD_WIDTH } from '../constants'
import { getItemColor, isValidCell } from '../systems/gridSystem'
import { useGameStore } from '../store/gameState'

type GridProps = {
  hoverWorld: { x: number; y: number } | null
  viewportWidth: number
  viewportHeight: number
}

export function Grid({
  hoverWorld,
  viewportWidth,
  viewportHeight,
}: GridProps) {
  const grid = useGameStore((s) => s.grid)
  const camera = useGameStore((s) => s.camera)

  const startCol = Math.floor(camera.x / TILE_SIZE)
  const endCol = Math.ceil((camera.x + viewportWidth) / TILE_SIZE)
  const startRow = Math.floor(camera.y / TILE_SIZE)
  const endRow = Math.ceil((camera.y + viewportHeight) / TILE_SIZE)

  const items: { row: number; col: number; itemId: string }[] = []
  for (let row = Math.max(0, startRow); row <= Math.min(grid.length - 1, endRow); row++) {
    for (let col = Math.max(0, startCol); col <= Math.min(grid[0].length - 1, endCol); col++) {
      const id = grid[row][col].itemId
      if (id) items.push({ row, col, itemId: id })
    }
  }

  let hoverHighlight: { left: number; top: number } | null = null
  if (hoverWorld) {
    const col = Math.floor(hoverWorld.x / TILE_SIZE)
    const row = Math.floor(hoverWorld.y / TILE_SIZE)
    if (isValidCell(row, col)) {
      hoverHighlight = {
        left: col * TILE_SIZE,
        top: row * TILE_SIZE,
      }
    }
  }

  const inWorld =
    hoverWorld &&
    hoverWorld.x >= 0 &&
    hoverWorld.x < WORLD_WIDTH &&
    hoverWorld.y >= 0 &&
    hoverWorld.y < WORLD_HEIGHT

  return (
    <>
      {items.map(({ row, col, itemId }) => (
        <div
          key={`${row}-${col}`}
          className="grid-item"
          style={{
            left: col * TILE_SIZE,
            top: row * TILE_SIZE,
            background: getItemColor(itemId),
          }}
        />
      ))}
      {hoverHighlight && inWorld && (
        <div
          className="hover-highlight"
          style={{
            left: hoverHighlight.left,
            top: hoverHighlight.top,
          }}
        />
      )}
    </>
  )
}
