// Puzzle zone positions on the game map. Only IDs, location, and rewards.
// Questions are fetched from /api/session/puzzle/get at runtime.
export const PUZZLE_LOCATIONS: Record<
  string,
  {
    x: number;
    y: number;
    width: number;
    height: number;
    rewardItems: { itemId: string; quantity: number }[];
  }
> = {
  // Shift 1
  s1q1: { x: 384, y: 288, width: 96, height: 96, rewardItems: [{ itemId: 'resistor', quantity: 2 }] },
  s1q2: { x: 800, y: 576, width: 128, height: 128, rewardItems: [{ itemId: 'capacitor', quantity: 2 }] },
  s1q3: { x: 1184, y: 480, width: 96, height: 96, rewardItems: [{ itemId: 'transistor', quantity: 2 }] },
  s1q4: { x: 1984, y: 992, width: 160, height: 160, rewardItems: [{ itemId: 'switch', quantity: 2 }] },
  s1q5: { x: 2496, y: 1984, width: 96, height: 96, rewardItems: [{ itemId: 'bulb', quantity: 2 }] },
  s1q6: { x: 1000, y: 2000, width: 96, height: 96, rewardItems: [{ itemId: 'diode', quantity: 1 }] },
  s1q7: { x: 2000, y: 1000, width: 96, height: 96, rewardItems: [{ itemId: 'transformer', quantity: 1 }] },
  s1q8: { x: 400, y: 2200, width: 96, height: 96, rewardItems: [{ itemId: 'inductor', quantity: 1 }] },
  s1q9: { x: 2400, y: 400, width: 96, height: 96, rewardItems: [{ itemId: 'ammeter', quantity: 1 }] },
  s1q10: { x: 1500, y: 500, width: 96, height: 96, rewardItems: [{ itemId: 'voltmeter', quantity: 1 }] },
  s1q11: { x: 1200, y: 1500, width: 96, height: 96, rewardItems: [{ itemId: 'motor', quantity: 1 }] },
  s1q12: { x: 1800, y: 2500, width: 96, height: 96, rewardItems: [{ itemId: 'battery', quantity: 1 }] },
  s1q13: { x: 500, y: 800, width: 96, height: 96, rewardItems: [{ itemId: 'switch', quantity: 1 }] },
  s1q14: { x: 2200, y: 1800, width: 96, height: 96, rewardItems: [{ itemId: 'fuse', quantity: 1 }] },
  s1q15: { x: 1600, y: 2800, width: 96, height: 96, rewardItems: [{ itemId: 'resistor', quantity: 1 }] },

  // Shift 2
  s2q1: { x: 384, y: 288, width: 96, height: 96, rewardItems: [{ itemId: 'resistor', quantity: 2 }] },
  s2q2: { x: 800, y: 576, width: 128, height: 128, rewardItems: [{ itemId: 'capacitor', quantity: 2 }] },
  s2q3: { x: 1184, y: 480, width: 96, height: 96, rewardItems: [{ itemId: 'transistor', quantity: 2 }] },
  s2q4: { x: 1984, y: 992, width: 160, height: 160, rewardItems: [{ itemId: 'switch', quantity: 2 }] },
  s2q5: { x: 2496, y: 1984, width: 96, height: 96, rewardItems: [{ itemId: 'bulb', quantity: 2 }] },
  s2q6: { x: 1000, y: 2000, width: 96, height: 96, rewardItems: [{ itemId: 'diode', quantity: 1 }] },
  s2q7: { x: 2000, y: 1000, width: 96, height: 96, rewardItems: [{ itemId: 'transformer', quantity: 1 }] },
  s2q8: { x: 400, y: 2200, width: 96, height: 96, rewardItems: [{ itemId: 'inductor', quantity: 1 }] },
  s2q9: { x: 2400, y: 400, width: 96, height: 96, rewardItems: [{ itemId: 'ammeter', quantity: 1 }] },
  s2q10: { x: 1500, y: 500, width: 96, height: 96, rewardItems: [{ itemId: 'voltmeter', quantity: 1 }] },
  s2q11: { x: 1200, y: 1500, width: 96, height: 96, rewardItems: [{ itemId: 'motor', quantity: 1 }] },
  s2q12: { x: 1800, y: 2500, width: 96, height: 96, rewardItems: [{ itemId: 'battery', quantity: 1 }] },
  s2q13: { x: 500, y: 800, width: 96, height: 96, rewardItems: [{ itemId: 'switch', quantity: 1 }] },
  s2q14: { x: 2200, y: 1800, width: 96, height: 96, rewardItems: [{ itemId: 'fuse', quantity: 1 }] },
  s2q15: { x: 1600, y: 2800, width: 96, height: 96, rewardItems: [{ itemId: 'resistor', quantity: 1 }] },
};
