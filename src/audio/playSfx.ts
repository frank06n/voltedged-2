import {
  SFX_PICK_SRC,
  SFX_PICK_VOLUME,
  SFX_PUT_SRC,
  SFX_PUT_VOLUME,
} from './audioConfig'

function playOneShot(src: string, volume: number) {
  const a = new Audio(src)
  a.volume = volume
  void a.play().catch(() => {})
}

export function playPutSfx() {
  playOneShot(SFX_PUT_SRC, SFX_PUT_VOLUME)
}

export function playPickSfx() {
  playOneShot(SFX_PICK_SRC, SFX_PICK_VOLUME)
}
