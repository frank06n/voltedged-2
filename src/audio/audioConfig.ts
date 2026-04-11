/** Master levels (0–1). Tune here only. */
export const MUSIC_VOLUME = 0.35
export const SFX_RUN_VOLUME = 0.55
export const SFX_PUT_VOLUME = 0.6
export const SFX_PICK_VOLUME = 0.6

export const SFX_RUN_SRC = '/sfx/run.mp3'
export const SFX_PUT_SRC = '/sfx/put.mp3'
export const SFX_PICK_SRC = '/sfx/pick.mp3'

/** Alternating background tracks after one ends. */
export const MUSIC_TRACKS = [
  'https://warm-clafoutis-55ba38.netlify.app/thunder.mp3',
  'https://warm-clafoutis-55ba38.netlify.app/buck.mp3',
] as const
