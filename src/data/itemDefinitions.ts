export const ComponentType = {
  RESISTOR: "resistor",
  CAPACITOR: "capacitor",
  INDUCTOR: "inductor",
  DIODE: "diode",
  IGBT: "igbt",
  WIRE: "wire",
  DC_SOURCE: "dc_source",
  SOLAR_CELL: "solar_cell",
} as const;

export type ComponentTypeValue =
  (typeof ComponentType)[keyof typeof ComponentType];

export const Orientation = {
  RIGHT: 0,
  DOWN: 1,
  LEFT: 2,
  UP: 3,
} as const;

export type OrientationValue = (typeof Orientation)[keyof typeof Orientation];

export const COMPONENT_DEFINITIONS = {
  resistor: {
    type: ComponentType.RESISTOR,
    polarized: false,
    variants: [1, 10, 100, 1000] as const,
  },

  diode: {
    type: ComponentType.DIODE,
    polarized: true,
  },

  capacitor: {
    type: ComponentType.CAPACITOR,
    polarized: true,
    variants: [1e-6, 1e-3] as const,
  },

  inductor: {
    type: ComponentType.INDUCTOR,
    polarized: false,
    variants: [1e-3, 1] as const,
  },

  igbt: {
    type: ComponentType.IGBT,
    polarized: true,
    variants: [{ frequency: 1000, dutyCycle: 0.5 }] as const,
  },

  wire: {
    type: ComponentType.WIRE,
    polarized: false,
  },

  dc_source: {
    type: ComponentType.DC_SOURCE,
    polarized: true,
    variants: [1.5, 3, 5, 9, 12] as const,
  },

  solar_cell: {
    type: ComponentType.SOLAR_CELL,
    polarized: true,
    variants: [1.5, 3, 5, 9, 12] as const,
  },
} as const;

type ComponentDefinitions = typeof COMPONENT_DEFINITIONS;

export type ComponentKey = keyof ComponentDefinitions;

export type Direction = "top" | "right" | "bottom" | "left";

export function getTerminalDirections(orientation: number): {
  A: Direction;
  B: Direction;
} {
  const order: Direction[] = ["top", "right", "bottom", "left"];
  const rotate = (dir: Direction): Direction =>
    order[(order.indexOf(dir) + orientation) % 4];
  return {
    A: rotate("left"),
    B: rotate("right"),
  };
}

export const COMPONENT_IMAGES: Record<ComponentKey, string> = {
  resistor: "/components/resistor.png",
  capacitor: "/components/capacitor.png",
  inductor: "/components/inductor.png",
  diode: "/components/diode.png",
  igbt: "/components/igbt.png",
  wire: "/components/wire.png",
  dc_source: "/components/dc_cell.png",
  solar_cell: "/components/pv_cell.png",
};

/**
 * Wire tile sprite contract (rotation 0°, CSS rotate clockwise):
 * - wire: straight segment only (left–right). Use rotation 0 (horizontal) or 90 (vertical).
 *   Not for L-corners.
 * - wire_2: L-corner; conductors on right + bottom, empty top + left. Adjacent pairs map with 0/90/180/270.
 * - wire_3: T-junction; missing fourth arm at **top** when rotation 0 (adjust with WIRE_T_JUNCTION_OFFSET_DEG).
 * - wire_4: symmetric cross.
 */
export const WIRE_SPRITE_IMAGES = {
  wire: "/components/wire.png",
  wire_2: "/components/wire_2.png",
  wire_3: "/components/wire_3.png",
  wire_4: "/components/wire_4.png",
} as const;

/** Add to all wire_3 rotations if the T sprite’s gap is not at the top at 0°. */
export const WIRE_T_JUNCTION_OFFSET_DEG = 0;

const DISPLAY_NAMES: Record<ComponentKey, string> = {
  resistor: "Resistor",
  capacitor: "Capacitor",
  inductor: "Inductor",
  diode: "Diode",
  igbt: "IGBT",
  wire: "Wire",
  dc_source: "DC Cell",
  solar_cell: "PV Cell",
};

const FALLBACK_COLORS: Record<ComponentKey, string> = {
  resistor: "#e6a846",
  capacitor: "#5b9bd5",
  inductor: "#9e7cc1",
  diode: "#7030a0",
  igbt: "#888888",
  wire: "#a6a6a6",
  dc_source: "#4caf50",
  solar_cell: "#ffeb3b",
};

const componentKeys = new Set<string>(Object.keys(COMPONENT_DEFINITIONS));

export function isComponentKey(id: string): id is ComponentKey {
  return componentKeys.has(id);
}

function serializeVariant(v: unknown): string {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  return JSON.stringify(v);
}

export function getComponentVariantOptions(key: string): string[] {
  if (!isComponentKey(key)) return [];
  const def = COMPONENT_DEFINITIONS[key];
  if (!("variants" in def) || !def.variants) return [];
  return [...def.variants].map(serializeVariant);
}

export function initialVariantForComponent(key: string): string {
  const opts = getComponentVariantOptions(key);
  return opts[0] ?? "";
}

export function getComponentDisplayName(key: string): string {
  if (isComponentKey(key)) return DISPLAY_NAMES[key];
  return key;
}

export function getComponentImage(key: string): string {
  if (!isComponentKey(key)) return "";
  return COMPONENT_IMAGES[key];
}

export function getComponentColorFromDefinition(key: string): string {
  if (isComponentKey(key)) return FALLBACK_COLORS[key];
  return "#ff00ff";
}

/** Back-compat aliases */
export const getItemDisplayName = getComponentDisplayName;
export const getItemImage = getComponentImage;
export const getItemVariantOptions = getComponentVariantOptions;
