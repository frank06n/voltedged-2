# Frontend Backend Integration Plan

This document outlines the frontend changes required to migrate from the existing `localStorage` mock APIs to the new REST, MongoDB-backed API.

## Goal
Integrate the frontend (`voltedged-2`) with the Express backend (`voltedge-backend`) using standard REST JSON `fetch` calls, and securely migrate the puzzle verification logic to the server.

## Proposed Changes

### Configuration
#### [NEW] `c:\Users\sagni\voltedged-2\.env.local`
- We'll create a local environment file to set `VITE_API_BASE_URL=http://localhost:3000` so we can point to the backend locally and easily change it for production on Vercel.

---

### API Client Layer
#### [MODIFY] `c:\Users\sagni\voltedged-2\src\api\sessionApi.ts`
- Remove all `localStorage` fallback logic.
- `startSession(code)`: Will now `POST <VITE_API_BASE_URL>/api/session/start` instead.
- `updateSession(update)`: Will now `POST <VITE_API_BASE_URL>/api/session/update` containing `sessionId` and `placedItems`.
- **Add** `verifyPuzzle(sessionId, puzzleId, answer)`: A new function that hits `/api/session/puzzle/verify` returning whether the answer is true, the updated `inventory`, and `solvedPuzzleIds`.

---

### Type Adjustments
#### [MODIFY] `c:\Users\sagni\voltedged-2\src\types.ts` & `src/api/types.ts`
- Strip the `correctAnswer` property from `InteractionZone` and `SessionConfig['puzzles']`. The backend intentionally omits this now to prevent cheating in the source code.

---

### UI Components
#### [MODIFY] `c:\Users\sagni\voltedged-2\src\components\InteractionModal.tsx`
- Currently, this reads `activeModal.correctAnswer` to check the `guess`. We need to rewrite `handleSubmit` to call `verifyPuzzle()` through `sessionApi.ts` asynchronously.
- Note: It will show a loading state while awaiting the server response.
- Once verified correct, it will dispatch to the global store using a new sync action since the server handles giving us the rewards now.

---

### Global State (Zustand)
#### [MODIFY] `c:\Users\sagni\voltedged-2\src\store\gameState.ts`
- Update `InteractionZone` creation in `puzzlesToZones` to no longer require `correctAnswer`.
- Expose a `syncServerRewards(inventory, solvedPuzzleIds)` action to update local state post puzzle-verfication.

## User Review Required
> [!IMPORTANT]
> The biggest shift here is that the **frontend no longer knows the correct answer**. Checking puzzles requires an active network connection. Does this behavior sound good? Assuming yes, I can proceed with editing the frontend files.

## Verification
- We will boot up both the frontend and backend.
- Start a new game and enter a codebase. Verify it initializes from the server.
- Drop an item and reload the page. Ensure the layout persists.
- Try to answer a puzzle. Verify the request goes to the backend, returns the correct rewards, and marks the zone solved!
