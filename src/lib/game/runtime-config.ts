export interface GameConfig {
  easterChancePlaying: number    // 0-1: chance de easter egg durante o jogo (a cada intervalo)
  easterIntervalPlaying: number  // segundos entre verificações durante o jogo
  easterChanceCountdown: number  // 0-1: chance de easter egg no countdown
  easterChanceReview: number     // 0-1: chance ao avançar na correção (resposta normal)
  easterChanceReviewPerfect: number // 0-1: chance ao avançar na correção (15 pts)
}

export const DEFAULT_CONFIG: GameConfig = {
  easterChancePlaying: 0.6,
  easterIntervalPlaying: 10,
  easterChanceCountdown: 0.5,
  easterChanceReview: 0.55,
  easterChanceReviewPerfect: 0.8,
}

let cached: GameConfig | null = null

export async function getGameConfig(): Promise<GameConfig> {
  if (cached) return cached
  try {
    const res = await fetch('/api/config')
    if (res.ok) cached = await res.json() as GameConfig
    else cached = { ...DEFAULT_CONFIG }
  } catch {
    cached = { ...DEFAULT_CONFIG }
  }
  return cached!
}

export function clearConfigCache() {
  cached = null
}
