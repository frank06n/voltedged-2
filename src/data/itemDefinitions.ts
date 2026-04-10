export type ItemDefinition = {
  id: string
  displayName: string
  variants: string
  selected_variant: string
  image: string
  color: string
}

export const ITEM_DEFINITIONS: ItemDefinition[] = [
  {
    id: 'resistor',
    displayName: 'Resistor',
    variants: '1ohm,10ohm,100ohm,1kohm',
    selected_variant: '',
    image: '',
    color: '#e6a846',
  },
  {
    id: 'capacitor',
    displayName: 'Capacitor',
    variants: '1nF,10nF,100nF,1uF',
    selected_variant: '',
    image: '',
    color: '#5b9bd5',
  },
  {
    id: 'inductor',
    displayName: 'Inductor',
    variants: '1mH,10mH,100mH',
    selected_variant: '',
    image: '',
    color: '#9e7cc1',
  },
  {
    id: 'transistor',
    displayName: 'Transistor',
    variants: '',
    selected_variant: '',
    image: '',
    color: '#70ad47',
  },
  {
    id: 'switch',
    displayName: 'Switch',
    variants: 'on,off',
    selected_variant: '',
    image: '',
    color: '#c55a11',
  },
  {
    id: 'bulb',
    displayName: 'Bulb',
    variants: '',
    selected_variant: '',
    image: '',
    color: '#ffd966',
  },
  {
    id: 'wire',
    displayName: 'Wire',
    variants: '',
    selected_variant: '',
    image: '',
    color: '#a6a6a6',
  },
]

const byId = new Map(ITEM_DEFINITIONS.map((d) => [d.id, d]))

export function getItemDefinition(itemId: string): ItemDefinition | undefined {
  return byId.get(itemId)
}

export function getItemDisplayName(itemId: string): string {
  return getItemDefinition(itemId)?.displayName ?? itemId
}

export function getItemImage(itemId: string): string {
  return getItemDefinition(itemId)?.image ?? ''
}

export function getItemColorFromDefinition(itemId: string): string {
  return getItemDefinition(itemId)?.color ?? '#ff00ff'
}

/** Comma-separated `variants` field split into labels (empty if none). */
export function getItemVariantOptions(itemId: string): string[] {
  const raw = getItemDefinition(itemId)?.variants?.trim() ?? ''
  if (!raw) return []
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

/** First variant label when placing an item, or empty string if none. */
export function initialVariantForItem(itemId: string): string {
  const opts = getItemVariantOptions(itemId)
  return opts[0] ?? ''
}
