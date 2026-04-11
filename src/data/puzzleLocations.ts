// Puzzle zone positions on the game map (id → world rect). Questions come from
// POST /api/session/puzzle/get; component rewards come from server milestones on verify.
// Rects use the same tile grid as placement zones (gridRectTiles).
import { gridRectTiles } from '../systems/placementZones'

type PuzzleRect = Pick<
  ReturnType<typeof gridRectTiles>,
  'x' | 'y' | 'width' | 'height'
>

/** Top-left tile (col, row), size in tiles — grid-aligned like PLACEMENT_ZONES. */
function pzl(
  col: number,
  row: number,
  colsWide: number,
  rowsTall: number,
): PuzzleRect {
  return gridRectTiles(col, row, colsWide, rowsTall)
}

export const PUZZLE_LOCATIONS: Record<string, PuzzleRect> = {
  // Shift 1
  s1q1: pzl(2, 2, 4, 4),
  s1q2: pzl(2, 76, 2, 2),
  s1q3: pzl(6, 48, 2, 2),
  s1q4: pzl(14, 22, 2, 2),
  s1q5: pzl(32, 6, 2, 2),
  s1q6: pzl(46, 88, 2, 2),
  s1q7: pzl(76, 48, 2, 2),
  s1q8: pzl(72, 90, 2, 2),
  s1q9: pzl(90, 40, 2, 2),
  s1q10: pzl(90, 76, 2, 2),

  // Shift 2
  s2q1: pzl(2, 2, 4, 4),
  s2q2: pzl(20, 86, 2, 2),
  s2q3: pzl(44, 2, 2, 2),
  s2q4: pzl(56, 89, 2, 2),
  s2q5: pzl(58, 10, 2, 2),
  s2q6: pzl(72, 64, 2, 2),
  s2q7: pzl(82, 8, 2, 2),
  s2q8: pzl(82, 76, 2, 2),
  s2q9: pzl(90, 40, 2, 2),
  s2q10: pzl(86, 88, 2, 2),
}
