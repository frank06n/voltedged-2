export type PlacementZone = {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export const SHOW_PLACEMENT_ZONES = true

export const PLACEMENT_ZONES: PlacementZone[] = [
  { id: 'pz-crossroads', x: 1344, y: 1344, width: 320, height: 320 },
  { id: 'pz-north', x: 1344, y: 600, width: 320, height: 256 },
  { id: 'pz-east', x: 2000, y: 1344, width: 320, height: 320 },
  { id: 'pz-south', x: 1344, y: 2000, width: 320, height: 256 },
  { id: 'pz-west', x: 600, y: 1344, width: 320, height: 320 },
]

export function isInsidePlacementZone(
  worldX: number,
  worldY: number,
): boolean {
  for (const z of PLACEMENT_ZONES) {
    if (
      worldX >= z.x &&
      worldX < z.x + z.width &&
      worldY >= z.y &&
      worldY < z.y + z.height
    ) {
      return true
    }
  }
  return false
}
