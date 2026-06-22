/**
 * Generates simple WAV audio files for the game.
 * Run: node scripts/generate-audio.js
 */
const fs = require('fs')
const path = require('path')

const SAMPLE_RATE = 44100
const OUT_DIR = path.join(__dirname, '..', 'public', 'audio')

// --- WAV writer ---

function writeWav(filename, samples) {
  const numChannels = 1
  const bitsPerSample = 16
  const byteRate = SAMPLE_RATE * numChannels * (bitsPerSample / 8)
  const blockAlign = numChannels * (bitsPerSample / 8)
  const dataSize = samples.length * 2

  const buf = Buffer.alloc(44 + dataSize)
  buf.write('RIFF', 0)
  buf.writeUInt32LE(36 + dataSize, 4)
  buf.write('WAVE', 8)
  buf.write('fmt ', 12)
  buf.writeUInt32LE(16, 16)
  buf.writeUInt16LE(1, 20) // PCM
  buf.writeUInt16LE(numChannels, 22)
  buf.writeUInt32LE(SAMPLE_RATE, 24)
  buf.writeUInt32LE(byteRate, 28)
  buf.writeUInt16LE(blockAlign, 32)
  buf.writeUInt16LE(bitsPerSample, 34)
  buf.write('data', 36)
  buf.writeUInt32LE(dataSize, 40)

  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    buf.writeInt16LE(Math.round(s * 32767), 44 + i * 2)
  }

  fs.writeFileSync(path.join(OUT_DIR, filename), buf)
  console.log('  wrote', filename)
}

// --- Helpers ---

function silence(secs) {
  return new Float32Array(Math.floor(SAMPLE_RATE * secs))
}

function tone(freq, secs, amp = 0.4, attack = 0.01, release = 0.05) {
  const n = Math.floor(SAMPLE_RATE * secs)
  const arr = new Float32Array(n)
  const attackSamples = Math.floor(SAMPLE_RATE * attack)
  const releaseSamples = Math.floor(SAMPLE_RATE * release)
  for (let i = 0; i < n; i++) {
    let env = 1
    if (i < attackSamples) env = i / attackSamples
    else if (i > n - releaseSamples) env = (n - i) / releaseSamples
    arr[i] = amp * env * Math.sin(2 * Math.PI * freq * i / SAMPLE_RATE)
  }
  return arr
}

function chord(freqs, secs, amp = 0.3) {
  const n = Math.floor(SAMPLE_RATE * secs)
  const arr = new Float32Array(n)
  for (const f of freqs) {
    const t = tone(f, secs, amp / freqs.length, 0.02, 0.1)
    for (let i = 0; i < n; i++) arr[i] += t[i]
  }
  return arr
}

function concat(...arrays) {
  const total = arrays.reduce((s, a) => s + a.length, 0)
  const out = new Float32Array(total)
  let offset = 0
  for (const a of arrays) { out.set(a, offset); offset += a.length }
  return out
}

function fade(arr, fadeIn = 0.05, fadeOut = 0.1) {
  const out = new Float32Array(arr)
  const fi = Math.floor(SAMPLE_RATE * fadeIn)
  const fo = Math.floor(SAMPLE_RATE * fadeOut)
  for (let i = 0; i < fi; i++) out[i] *= i / fi
  for (let i = 0; i < fo; i++) out[out.length - 1 - i] *= i / fo
  return out
}

// --- Audio generation ---

console.log('Generating audio files...')

// home.wav — cheerful looping arpeggio (C major: C4 E4 G4 C5)
{
  const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63]
  const arp = notes.map(f => tone(f, 0.18, 0.35, 0.01, 0.08))
  const gap = silence(0.04)
  const measure = concat(...arp.flatMap(n => [n, gap]))
  const loop = concat(measure, measure, measure, measure)
  writeWav('home.wav', fade(loop, 0.1, 0.2))
}

// game.wav — tense rhythmic pulse (A minor: A3 C4 E4 G4)
{
  const notes = [220, 261.63, 329.63, 392, 329.63, 261.63, 220, 220]
  const arp = notes.map((f, i) => tone(f, i % 4 === 0 ? 0.25 : 0.15, 0.4, 0.005, 0.04))
  const gap = silence(0.03)
  const measure = concat(...arp.flatMap(n => [n, gap]))
  const loop = concat(measure, measure, measure, measure)
  writeWav('game.wav', fade(loop, 0.1, 0.2))
}

// review.wav — calm sustained chords (F major: F4 A4 C5)
{
  const c1 = chord([349.23, 440, 523.25], 1.5, 0.35)
  const c2 = chord([293.66, 369.99, 493.88], 1.5, 0.35)
  const c3 = chord([261.63, 329.63, 392], 1.5, 0.35)
  const loop = concat(c1, c2, c3, c2, c1, c2, c3)
  writeWav('review.wav', fade(loop, 0.1, 0.3))
}

// stop.wav — sharp descending "STOP!" hit
{
  const hit = concat(
    tone(880, 0.06, 0.8, 0.002, 0.01),
    tone(660, 0.06, 0.7, 0.002, 0.01),
    tone(440, 0.08, 0.6, 0.002, 0.02),
    tone(330, 0.12, 0.5, 0.002, 0.05),
  )
  writeWav('stop.wav', hit)
}

// acerto.wav — ascending chime (correct!)
{
  const chime = concat(
    tone(523.25, 0.12, 0.5, 0.005, 0.04),
    tone(659.25, 0.12, 0.5, 0.005, 0.04),
    tone(783.99, 0.18, 0.6, 0.005, 0.08),
  )
  writeWav('acerto.wav', chime)
}

// erro.wav — low descending buzz (wrong)
{
  const buzz = concat(
    tone(220, 0.10, 0.5, 0.002, 0.02),
    tone(180, 0.10, 0.5, 0.002, 0.02),
    tone(150, 0.15, 0.4, 0.002, 0.06),
  )
  writeWav('erro.wav', buzz)
}

// countdown.wav — tick beep
{
  const tick = concat(
    tone(1000, 0.05, 0.5, 0.002, 0.02),
    silence(0.05),
  )
  writeWav('countdown.wav', tick)
}

console.log('Done! All files written to public/audio/')
