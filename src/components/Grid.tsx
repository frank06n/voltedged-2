import { useEffect, useMemo, useRef, useState } from 'react'
import { TILE_SIZE } from '../constants'
import {
  getComponentDisplayName,
  getComponentImage,
} from '../data/itemDefinitions'
import { isValidCell } from '../systems/gridSystem'
import { isInsidePlacementZone } from '../systems/placementZones'
import { getWireConnections, getWireSpriteInfo } from '../systems/wireSystem'
import { useGameStore } from '../store/gameState'

type GridProps = {
  hoverWorld: { x: number; y: number } | null
  viewportWidth: number
  viewportHeight: number
}

const TOOLTIP_DELAY_MS = 500

function formatVariantLabel(itemId: string, variant: string): string {
  if (!variant) return ''
  if (itemId === 'igbt') {
    try {
      const o = JSON.parse(variant) as { frequency?: number; dutyCycle?: number }
      return `${o.frequency}Hz ${Math.round((o.dutyCycle ?? 0) * 100)}%`
    } catch {
      return variant
    }
  }
  return variant
}

export function Grid({
  hoverWorld,
  viewportWidth,
  viewportHeight,
}: GridProps) {
  const grid = useGameStore((s) => s.grid)
  const camera = useGameStore((s) => s.camera)
  const variantJustCycledCell = useGameStore((s) => s.variantJustCycledCell)
  const clearVariantJustCycled = useGameStore((s) => s.clearVariantJustCycled)

  const [tooltipCell, setTooltipCell] = useState<{
    row: number
    col: number
  } | null>(null)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startCol = Math.floor(camera.x / TILE_SIZE)
  const endCol = Math.ceil((camera.x + viewportWidth) / TILE_SIZE)
  const startRow = Math.floor(camera.y / TILE_SIZE)
  const endRow = Math.ceil((camera.y + viewportHeight) / TILE_SIZE)

  const items: { row: number; col: number }[] = []
  for (let row = Math.max(0, startRow); row <= Math.min(grid.length - 1, endRow); row++) {
    for (let col = Math.max(0, startCol); col <= Math.min(grid[0].length - 1, endCol); col++) {
      const id = grid[row][col].itemId
      if (id) items.push({ row, col })
    }
  }

  let hoverHighlight: { left: number; top: number } | null = null
  if (hoverWorld && isInsidePlacementZone(hoverWorld.x, hoverWorld.y)) {
    const col = Math.floor(hoverWorld.x / TILE_SIZE)
    const row = Math.floor(hoverWorld.y / TILE_SIZE)
    if (isValidCell(row, col)) {
      hoverHighlight = {
        left: col * TILE_SIZE,
        top: row * TILE_SIZE,
      }
    }
  }

  const hoveredItemCell = useMemo(() => {
    if (!hoverWorld) return null
    const col = Math.floor(hoverWorld.x / TILE_SIZE)
    const row = Math.floor(hoverWorld.y / TILE_SIZE)
    if (!isValidCell(row, col)) return null
    const id = grid[row][col].itemId
    if (!id) return null
    return { row, col }
  }, [hoverWorld, grid])

  const hoveredItemCellKey = hoveredItemCell
    ? `${hoveredItemCell.row},${hoveredItemCell.col}`
    : null

  useEffect(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }

    if (!hoveredItemCellKey) {
      setTooltipCell(null)
      return
    }

    setTooltipCell(null)
    const [row, col] = hoveredItemCellKey.split(',').map(Number) as [
      number,
      number,
    ]
    hoverTimerRef.current = setTimeout(() => {
      setTooltipCell({ row, col })
      hoverTimerRef.current = null
    }, TOOLTIP_DELAY_MS)

    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current)
        hoverTimerRef.current = null
      }
    }
  }, [hoveredItemCellKey])

  useEffect(() => {
    if (!variantJustCycledCell || !hoveredItemCellKey) return
    const [r, c] = hoveredItemCellKey.split(',').map(Number)
    if (
      variantJustCycledCell.row === r &&
      variantJustCycledCell.col === c
    ) {
      setTooltipCell({ row: r, col: c })
      clearVariantJustCycled()
    }
  }, [variantJustCycledCell, hoveredItemCellKey, clearVariantJustCycled])

  const tooltipText =
    tooltipCell &&
    grid[tooltipCell.row][tooltipCell.col].itemId
      ? (() => {
          const id = grid[tooltipCell.row][tooltipCell.col].itemId!
          const name = getComponentDisplayName(id)
          const v = formatVariantLabel(
            id,
            grid[tooltipCell.row][tooltipCell.col].variant,
          )
          return v ? `${name} (${v})` : name
        })()
      : null

  return (
    <>
      {items.map(({ row, col }) => {
        const tile = grid[row][col]
        const itemId = tile.itemId!
        if (itemId === 'wire') {
          const conn = getWireConnections(grid, row, col)
          const info = getWireSpriteInfo(conn)
          return (
            <div
              key={`${row}-${col}`}
              className="grid-item grid-item-wire"
              style={{
                left: col * TILE_SIZE,
                top: row * TILE_SIZE,
              }}
            >
              <img
                src={info.src}
                alt=""
                draggable={false}
                style={{
                  transform: `rotate(${info.rotationDeg}deg)`,
                }}
              />
            </div>
          )
        }
        const src = getComponentImage(itemId)
        return (
          <div
            key={`${row}-${col}`}
            className="grid-item"
            style={{
              left: col * TILE_SIZE,
              top: row * TILE_SIZE,
            }}
          >
            {src ? (
              <img
                src={src}
                alt=""
                draggable={false}
                style={{
                  transform: `rotate(${tile.orientation * 90}deg)`,
                }}
              />
            ) : null}
          </div>
        )
      })}
      {hoverHighlight ? (
        <div
          className="hover-highlight"
          style={{
            left: hoverHighlight.left,
            top: hoverHighlight.top,
          }}
        />
      ) : null}
      {tooltipCell && tooltipText ? (
        <div
          className="item-tooltip"
          style={{
            left: tooltipCell.col * TILE_SIZE + TILE_SIZE / 2,
            top: tooltipCell.row * TILE_SIZE - 28,
          }}
        >
          {tooltipText}
        </div>
      ) : null}
    </>
  )
}
