import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { getRedis } from '@/lib/redis/client'

const BLOCKED_KEY = 'blocked:nicknames'

export async function POST(req: NextRequest) {
  const { nickname } = await req.json() as { nickname?: string }
  if (!nickname || nickname.trim().length < 2) {
    return NextResponse.json({ ok: false, reason: 'Nickname muito curto.' })
  }

  const name = nickname.trim().slice(0, 30)
  const nameLower = name.toLowerCase()

  // Checa lista de bloqueados no Redis (mais rápido que a IA)
  try {
    const redis = getRedis()
    const blocked = await redis.smembers(BLOCKED_KEY)
    const hit = blocked.find((term) => nameLower.includes(term))
    if (hit) {
      return NextResponse.json({ ok: false, reason: 'Esse apelido não é permitido. Escolha outro.' })
    }
  } catch { /* se Redis falhar, continua para IA */ }

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const chat = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      temperature: 0,
      max_tokens: 60,
      messages: [
        {
          role: 'system',
          content:
            'Você é um moderador de conteúdo para um jogo infantil (7–17 anos). ' +
            'Analise o nickname fornecido e responda APENAS com JSON: {"ok":true} ou {"ok":false,"reason":"motivo curto em português"}. ' +
            'Rejeite se contiver: palavrão, xingamento, conteúdo sexual, violência, referência a drogas, conteúdo político, ódio, discriminação ou qualquer coisa inapropriada para crianças. ' +
            'Aceite nomes criativos, apelidos, personagens, animais, frutas, etc.',
        },
        { role: 'user', content: `Nickname: "${name}"` },
      ],
    })

    const text = chat.choices[0]?.message?.content?.trim() ?? ''
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      const parsed = JSON.parse(match[0]) as { ok: boolean; reason?: string }
      return NextResponse.json(parsed)
    }
    return NextResponse.json({ ok: true })
  } catch {
    // Se IA falhar, aceita (não bloqueia o usuário por erro de API)
    return NextResponse.json({ ok: true })
  }
}
