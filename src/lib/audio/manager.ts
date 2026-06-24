'use client'

import { Howl, Howler } from 'howler'

type Track = 'home' | 'game' | 'review'
type Sfx = 'stop' | 'acerto' | 'erro' | 'countdown'

const TRACKS: Record<Track, string[]> = {
  home:   ['/audio/home.mp3',   '/audio/home.wav'],
  game:   ['/audio/game.mp3',   '/audio/game.wav'],
  review: ['/audio/review.mp3', '/audio/review.wav'],
}

const SFX_PATHS: Record<Sfx, string[]> = {
  stop:      ['/audio/stop.mp3',      '/audio/stop.wav'],
  acerto:    ['/audio/acerto.mp3',    '/audio/acerto.wav'],
  erro:      ['/audio/erro.mp3',      '/audio/erro.wav'],
  countdown: ['/audio/countdown.mp3', '/audio/countdown.wav'],
}

let currentTrack: Track | null = null
let currentHowl: Howl | null = null
const sfxCache: Partial<Record<Sfx, Howl>> = {}

function loadSfx(name: Sfx): Howl {
  if (!sfxCache[name]) {
    sfxCache[name] = new Howl({ src: SFX_PATHS[name], volume: 0.7, preload: true })
  }
  return sfxCache[name]!
}

export function playTrack(name: Track, volume = 0.35) {
  if (currentTrack === name) return
  stopTrack()
  currentTrack = name
  currentHowl = new Howl({
    src: TRACKS[name],
    loop: true,
    volume,
    html5: true,
  })
  currentHowl.play()
}

export function stopTrack() {
  currentHowl?.fade(currentHowl.volume(), 0, 400)
  setTimeout(() => { currentHowl?.stop(); currentHowl = null }, 420)
  currentTrack = null
}

export function playSfx(name: Sfx) {
  try { loadSfx(name).play() } catch { /* arquivo ausente — silencioso */ }
}

export function setMuted(muted: boolean) {
  Howler.mute(muted)
}

export function getMuted(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('audio_muted') === '1'
}
