import { WORLD_HEIGHT, WORLD_WIDTH } from '../constants'

export function WorldBackground() {
  const w = WORLD_WIDTH
  const h = WORLD_HEIGHT

  return (
    <div className="world-bg-layer" aria-hidden>
      <div
        style={{
          left: 0,
          top: 0,
          width: w,
          height: h,
          background: '#2d5016',
        }}
      />
      <div
        style={{
          left: 0,
          top: 1400,
          width: w,
          height: 200,
          background: '#8B7355',
        }}
      />
      <div
        style={{
          left: 1400,
          top: 0,
          width: 200,
          height: h,
          background: '#8B7355',
        }}
      />
      <div
        style={{
          left: 2200,
          top: 200,
          width: 600,
          height: 400,
          background: '#1a4a6e',
          borderRadius: 8,
        }}
      />
      <div
        style={{
          left: 100,
          top: 2200,
          width: 500,
          height: 500,
          background: '#4a4a4a',
          borderRadius: 4,
        }}
      />
      <div
        style={{
          left: 0,
          top: 0,
          width: w,
          height: 24,
          background: '#1a2f0f',
        }}
      />
      <div
        style={{
          left: 0,
          top: h - 24,
          width: w,
          height: 24,
          background: '#1a2f0f',
        }}
      />
      <div
        style={{
          left: 0,
          top: 0,
          width: 24,
          height: h,
          background: '#1a2f0f',
        }}
      />
      <div
        style={{
          left: w - 24,
          top: 0,
          width: 24,
          height: h,
          background: '#1a2f0f',
        }}
      />
    </div>
  )
}
