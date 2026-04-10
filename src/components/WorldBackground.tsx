import { WORLD_HEIGHT, WORLD_WIDTH } from '../constants'

export function WorldBackground() {
  const w = WORLD_WIDTH
  const h = WORLD_HEIGHT

  return (
    <div className="world-bg-layer" aria-hidden>
      <img
        alt=""
        className="world-map-bg"
        src="/map.png"
        width={w}
        height={h}
        draggable={false}
      />
    </div>
  )
}
