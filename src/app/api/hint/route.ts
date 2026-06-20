import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  const { letter, categoryLabel } = await req.json() as { letter: string; categoryLabel: string }

  if (!letter || !categoryLabel) {
    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
  }

  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content:
          'Você é um assistente do jogo STOP ADEDONHA. Responda APENAS com UMA palavra (ou nome próprio) que começa com a letra indicada e pertence à categoria dada. Sem explicação, sem pontuação, sem artigo — somente a palavra.',
      },
      {
        role: 'user',
        content: `Letra: ${letter.toUpperCase()}\nCategoria: ${categoryLabel}`,
      },
    ],
    max_tokens: 20,
    temperature: 0.7,
  })

  const word = completion.choices[0]?.message?.content?.trim().split(/\s+/)[0] ?? ''
  return NextResponse.json({ word })
}
