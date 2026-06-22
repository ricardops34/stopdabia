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
        content: 'Você é um assistente do jogo STOP ADEDONHA para crianças e adolescentes brasileiros. Responda APENAS com JSON no formato {"word":"palavra","explanation":"explicação curta em 1 frase simples de até 15 palavras"}. A palavra DEVE ser em PORTUGUÊS BRASILEIRO, começar com a letra indicada e pertencer à categoria. NUNCA use palavras em inglês ou outro idioma.',
      },
      {
        role: 'user',
        content: `Letra: ${letter.toUpperCase()}\nCategoria: ${categoryLabel}\nIdioma: Português Brasileiro obrigatório`,
      },
    ],
    max_tokens: 80,
    temperature: 0.7,
    response_format: { type: 'json_object' },
  })

  const raw = completion.choices[0]?.message?.content?.trim() ?? '{}'
  try {
    const parsed = JSON.parse(raw) as { word?: string; explanation?: string }
    const word = (parsed.word ?? '').split(/\s+/)[0]
    const explanation = parsed.explanation ?? ''
    return NextResponse.json({ word, explanation })
  } catch {
    const word = raw.split(/\s+/)[0]
    return NextResponse.json({ word, explanation: '' })
  }
}
