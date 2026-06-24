'use client'

import { Howl, Howler } from 'howler'

let howl: Howl | null = null
let started = false

export function startMusic() {
  if (started) return
  started = true
  howl = new Howl({
    src: ['/audio/musica.mp3', '/audio/musica.wav'],
    loop: true,
    volume: 0.35,
    html5: true,
  })
  if (typeof window !== 'undefined') {
    Howler.mute(localStorage.getItem('audio_muted') === '1')
  }
  howl.play()
}

export function setMuted(muted: boolean) {
  Howler.mute(muted)
}

export function getMuted(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('audio_muted') === '1'
}
