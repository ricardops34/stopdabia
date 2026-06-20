import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

interface AnswerInput {
  playerId: string
  nickname: string
  answer: string
}

interface ValidationBody {
  letter: string
  category: string
  answers: AnswerInput[]
}

export async function POST(request: NextRequest) {
  const body: ValidationBody = await request.json()
  const { letter, category, answers } = body

  if (!letter || !category || !Array.isArray(answers)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const prompt = `Você é um validador do jogo STOP (Adedonha) em português brasileiro.

Letra sorteada: "${letter}"
Categoria: "${category}"

Analise cada resposta e determine se é válida. Uma resposta é válida quando:
1. Começa com a letra "${letter}" (ignorando acento na primeira letra)
2. É uma palavra real em português
3. Se enquadra na categoria "${category}"
4. Não é ofensiva

Respostas para validar:
${answers.map((a) => `- playerId "${a.playerId}" / jogador "${a.nickname}": "${a.answer}"`).join('\n')}

Responda APENAS com JSON puro, sem texto adicional, no formato:
{"results":[{"playerId":"id","valid":true}]}

Use os mesmos playerId da entrada. Seja justo e educativo.`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 512,
      temperature: 0,
    })

    const text = completion.choices[0]?.message?.content ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')

    const parsed = JSON.parse(jsonMatch[0]) as { results: { playerId: string; valid: boolean }[] }
    return NextResponse.json(parsed)
  } catch {
    // Fallback: starts with letter, length > 1
    const results = answers.map((a) => ({
      playerId: a.playerId,
      valid:
        a.answer.trim().length > 1 &&
        a.answer.trim().toLowerCase().startsWith(letter.toLowerCase()),
    }))
    return NextResponse.json({ results })
  }
}
