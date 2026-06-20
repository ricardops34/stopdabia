import Redis from 'ioredis'

let client: Redis | null = null

export function getRedis(): Redis {
  if (!client) {
    client = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    })
    client.on('error', (err) => {
      if (process.env.NODE_ENV !== 'test') {
        console.error('[Redis] connection error:', err.message)
      }
    })
  }
  return client
}
