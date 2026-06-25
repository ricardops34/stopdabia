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

const EASTER_COUNT = 14

export function playEasterEgg() {
  if (typeof window === 'undefined') return
  const n = Math.floor(Math.random() * EASTER_COUNT) + 1
  const padded = String(n).padStart(3, '0')
  // HTMLAudioElement ignora o mute do Howler — toca sempre
  const audio = new Audio(`/audio/easter/${padded}.mp3`)
  audio.volume = 0.8
  audio.play().catch(() => {})
}

export function setMuted(muted: boolean) {
  Howler.mute(muted)
}

export function getMuted(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('audio_muted') === '1'
}
