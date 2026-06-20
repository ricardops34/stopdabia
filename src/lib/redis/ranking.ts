import { getRedis } from './client'

// Chaves Redis
// ranking:multi  — sorted set: score = totalScore, member = nickname
// ranking:solo   — sorted set: score = totalScore, member = nickname
// game:multi:{id} — hash com detalhes da partida
// game:solo:{id}  — hash com detalhes da partida solo

export type GameMode = 'multi' | 'solo'

export interface GameRecord {
  id: string
  nickname: string
  score: number
  letter: string
  categories: number
  answeredCorrect: number
  createdAt: number
}

export async function saveGameResult(mode: GameMode, record: GameRecord): Promise<void> {
  const redis = getRedis()
  const key = `game:${mode}:${record.id}`

  await redis.hset(key, {
    nickname: record.nickname,
    score: record.score,
    letter: record.letter,
    categories: record.categories,
    answeredCorrect: record.answeredCorrect,
    createdAt: record.createdAt,
  })
  await redis.expire(key, 60 * 60 * 24 * 30) // 30 dias

  // Ranking acumulado: somamos pontos ao score existente do jogador
  await redis.zincrby(`ranking:${mode}`, record.score, record.nickname)
}

export async function getTopRanking(mode: GameMode, limit = 10): Promise<{ nickname: string; score: number }[]> {
  const redis = getRedis()
  const raw = await redis.zrevrange(`ranking:${mode}`, 0, limit - 1, 'WITHSCORES')
  const result: { nickname: string; score: number }[] = []
  for (let i = 0; i < raw.length; i += 2) {
    result.push({ nickname: raw[i], score: Number(raw[i + 1]) })
  }
  return result
}

export async function getPlayerRank(mode: GameMode, nickname: string): Promise<{ rank: number; score: number } | null> {
  const redis = getRedis()
  const [rank, score] = await Promise.all([
    redis.zrevrank(`ranking:${mode}`, nickname),
    redis.zscore(`ranking:${mode}`, nickname),
  ])
  if (rank === null) return null
  return { rank: rank + 1, score: Number(score) }
}
