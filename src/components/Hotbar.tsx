import { HOTBAR_SLOTS } from '../constants'
import { getItemColor } from '../systems/gridSystem'
import { useGameStore } from '../store/gameState'

export function Hotbar() {
  const hotbar = useGameStore((s) => s.hotbar)
  const setHotbarActive = useGameStore((s) => s.setHotbarActive)

  return (
    <div className="hotbar" role="toolbar" aria-label="Item hotbar">
      {Array.from({ length: HOTBAR_SLOTS }, (_, i) => {
        const itemId = hotbar.slots[i]
        const active = i === hotbar.activeIndex
        return (
          <button
            key={i}
            type="button"
            className={`hotbar-slot${active ? ' active' : ''}`}
            onClick={() => setHotbarActive(i)}
            aria-pressed={active}
          >
            <span className="key-hint">{i + 1}</span>
            {itemId ? (
              <span
                className="item-swatch"
                style={{ background: getItemColor(itemId) }}
                title={itemId}
              />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
