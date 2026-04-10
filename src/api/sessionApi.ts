import type {
  InventorySlotConfig,
  PlacedItem,
  SessionConfig,
  SessionUpdate,
} from './types'

/**
 * Dev: empty string → same-origin requests so Vite proxies `/api` to the backend (no CORS).
 * Override with `VITE_API_BASE_URL` to call the API directly (backend CORS must allow your origin).
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? '' : 'http://localhost:3000')

export async function startSession(teamName: string, teamLeadName: string): Promise<SessionConfig> {
  const response = await fetch(`${API_BASE_URL}/api/session/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamName: teamName.trim(), teamLeadName: teamLeadName.trim() }),
  });
  
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || 'Failed to start session');
  }

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.message || 'Failed to start session');
  }

  return json.data as SessionConfig;
}

export async function updateSession(update: SessionUpdate): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/session/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: update.sessionId,
      placedItems: update.placedItems,
    }),
  });

  if (!response.ok) {
    console.error('Failed to update session');
  }
}

export async function getPuzzleQuestion(
  sessionId: string,
  puzzleId: string,
): Promise<{ success: boolean; question?: string; solved?: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/session/puzzle/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, puzzleId }),
    })

    if (!response.ok) {
      return { success: false, message: 'Server error' }
    }

    return await response.json()
  } catch (err) {
    console.error(err)
    return { success: false, message: 'Network error' }
  }
}

export async function verifyPuzzle(sessionId: string, puzzleId: string, answer: string): Promise<{ success: boolean; message?: string; inventory?: InventorySlotConfig[]; solvedPuzzleIds?: string[] }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/session/puzzle/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, puzzleId, answer }),
    });

    if (!response.ok) {
       return { success: false, message: 'Server error' };
    }

    return await response.json();
  } catch (err) {
    console.error(err)
    return { success: false, message: 'Network error' }
  }
}

export async function completeCircuit(sessionId: string): Promise<{ success: boolean; message?: string; completedAt?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/session/circuit/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });

    return await response.json();
  } catch (err) {
    console.error(err);
    return { success: false, message: 'Network error' };
  }
}

export type SessionSyncSnapshot = {
  sessionId: string | null
  teamName: string | null
  inventory: InventorySlotConfig[]
  placedItems: PlacedItem[]
  solvedPuzzleIds: string[]
}

export function buildSessionSyncSnapshot(
  state: {
    sessionId: string | null
    teamName: string | null
    hotbar: { slots: { itemId: string; quantity: number }[] | (null | { itemId: string; quantity: number })[] }
    grid: { itemId: string | null; variant: string; orientation: number }[][]
    solvedPuzzleIds: string[]
  },
): SessionSyncSnapshot {
  const inventory: InventorySlotConfig[] = []
  for (const s of state.hotbar.slots) {
    if (s) inventory.push({ itemId: s.itemId, quantity: s.quantity })
  }

  const placedItems: PlacedItem[] = []
  for (let r = 0; r < state.grid.length; r++) {
    for (let c = 0; c < state.grid[r].length; c++) {
      const id = state.grid[r][c].itemId
      if (id) {
        const variant = state.grid[r][c].variant
        const orientation = state.grid[r][c].orientation
        placedItems.push({
          row: r,
          col: c,
          itemId: id,
          ...(variant ? { variant } : {}),
          ...(orientation !== 0 ? { orientation } : {}),
        })
      }
    }
  }

  return {
    sessionId: state.sessionId,
    teamName: state.teamName,
    inventory,
    placedItems,
    solvedPuzzleIds: state.solvedPuzzleIds,
  }
}

export async function syncSessionToApi(snapshot: SessionSyncSnapshot): Promise<void> {
  if (!snapshot.sessionId || !snapshot.teamName) return
  await updateSession({
    sessionId: snapshot.sessionId,
    teamName: snapshot.teamName,
    inventory: snapshot.inventory,
    placedItems: snapshot.placedItems,
    solvedPuzzleIds: snapshot.solvedPuzzleIds,
  })
}
