import { HOTBAR_SLOTS } from '../constants'
import {
  getComponentDisplayName,
  getComponentImage,
} from '../data/itemDefinitions'
import { getItemColor } from '../systems/gridSystem'
import { useGameStore } from '../store/gameState'

function slotKeyHint(i: number): string {
  if (i < 9) return String(i + 1)
  if (i === 9) return '0'
  return `S${i - 9}`
}

export function Hotbar() {
  const hotbar = useGameStore((s) => s.hotbar)
  const setHotbarActive = useGameStore((s) => s.setHotbarActive)

  return (
    <div className="hotbar" role="toolbar" aria-label="Item hotbar">
      {Array.from({ length: HOTBAR_SLOTS }, (_, i) => {
        const slot = hotbar.slots[i]
        const active = i === hotbar.activeIndex
        return (
          <button
            key={i}
            type="button"
            className={`hotbar-slot${active ? ' active' : ''}`}
            onClick={() => setHotbarActive(i)}
            aria-pressed={active}
          >
            <span className="key-hint">{slotKeyHint(i)}</span>
            {slot ? (
              <>
                {getComponentImage(slot.itemId) ? (
                  <img
                    className="item-swatch item-swatch-img"
                    src={getComponentImage(slot.itemId)}
                    alt=""
                    title={getComponentDisplayName(slot.itemId)}
                  />
                ) : (
                  <span
                    className="item-swatch"
                    style={{ background: getItemColor(slot.itemId) }}
                    title={getComponentDisplayName(slot.itemId)}
                  />
                )}
                <span className="slot-quantity">{slot.quantity}</span>
              </>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
