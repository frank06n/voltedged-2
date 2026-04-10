import { useGameStore } from '../store/gameState'
import { Grid } from './Grid'
import { Player } from './Player'

type WorldProps = {
  hoverWorld: { x: number; y: number } | null
  viewportWidth: number
  viewportHeight: number
}

export function World({ hoverWorld, viewportWidth, viewportHeight }: WorldProps) {
  const camera = useGameStore((s) => s.camera)
  const interactionZones = useGameStore((s) => s.interactionZones)

  return (
    <div
      className="world"
      style={{
        transform: `translate(${-camera.x}px, ${-camera.y}px)`,
      }}
    >
      {interactionZones.map((zone) => (
        <div
          key={zone.id}
          className="interaction-zone"
          style={{
            left: zone.x,
            top: zone.y,
            width: zone.width,
            height: zone.height,
          }}
        />
      ))}
      <Grid
        hoverWorld={hoverWorld}
        viewportWidth={viewportWidth}
        viewportHeight={viewportHeight}
      />
      <Player />
    </div>
  )
}
