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

// Uma única Promise reutilizada — garante que o fetch só acontece uma vez
let easterPromise: Promise<void> | null = null
let easterAudio: string[] = []
let easterImages: string[] = []

function ensureEasterLoaded(): Promise<void> {
  if (!easterPromise) {
    easterPromise = fetch('/api/easter')
      .then((r) => r.json() as Promise<{ audio: string[]; images: string[] }>)
      .then((data) => {
        easterAudio = data.audio ?? []
        easterImages = data.images ?? []
      })
      .catch(() => {}) // falha silenciosa — arrays ficam vazios
  }
  return easterPromise
}

// Pré-carrega assim que o módulo é importado no browser
if (typeof window !== 'undefined') {
  void ensureEasterLoaded()
}

function pickRandom<T>(arr: T[]): T | null {
  if (!arr.length) return null
  return arr[Math.floor(Math.random() * arr.length)]
}

export function playEasterEgg() {
  if (typeof window === 'undefined') return
  // Se ainda carregando, espera e toca depois
  ensureEasterLoaded().then(() => {
    const src = pickRandom(easterAudio)
    if (!src) return
    const audio = new Audio(src)
    audio.volume = 0.8
    audio.play().catch(() => {})
  })
}

export function pickEasterImage(): string | null {
  // Síncrono — retorna null se ainda não carregou (raro após pré-load)
  return pickRandom(easterImages)
}

export async function pickEasterImageAsync(): Promise<string | null> {
  await ensureEasterLoaded()
  return pickRandom(easterImages)
}

export function setMuted(muted: boolean) {
  Howler.mute(muted)
}

export function getMuted(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('audio_muted') === '1'
}
