import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const getGroq = () => new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  const { letter, categoryLabel } = await req.json() as { letter: string; categoryLabel: string }

  if (!letter || !categoryLabel) {
    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
  }

  const completion = await getGroq().chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: `Você é um assistente do jogo STOP ADEDONHA para crianças e adolescentes brasileiros. Responda APENAS com JSON no formato {"word":"resposta completa","explanation":"explicação curta em 1 frase simples de até 15 palavras"}.

REGRAS:
- "word" deve ser o NOME COMPLETO e correto que representa a categoria. Exemplos por categoria:
  • Nome → nome próprio de pessoa (ex: "Juliana")
  • Animal → nome do animal (ex: "Jaguar")
  • Cor → nome da cor (ex: "Jade")
  • Fruta → nome da fruta (ex: "Jabuticaba")
  • Objeto → nome do objeto (ex: "Jarro")
  • Profissão → nome da profissão (ex: "Jornalista")
  • Cidade → nome completo da cidade (ex: "João Pessoa")
  • País → nome completo do país (ex: "Jamaica")
  • Comida → nome da comida (ex: "Jiló")
  • Verbo → verbo no infinitivo (ex: "Jogar")
  • Personagem → nome completo do personagem (ex: "João Bobo")
  • Esporte → nome do esporte (ex: "Judô")
  • Filme → título completo do filme (ex: "Jumanji")
  • Série → título completo da série (ex: "Jornada nas Estrelas")
  • Marca → nome da marca (ex: "Jeep")
  • Música → título completo da música (ex: "Jejum de Amor")
- A resposta DEVE começar com a letra indicada.
- A EXPLICAÇÃO contextualiza a resposta dentro da categoria (não o significado genérico da palavra).
- NUNCA retorne só a primeira palavra de um nome composto.
- Use PORTUGUÊS BRASILEIRO obrigatório.`,
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
    const word = (parsed.word ?? '').trim()
    const explanation = parsed.explanation ?? ''
    return NextResponse.json({ word, explanation })
  } catch {
    const word = raw.trim()
    return NextResponse.json({ word, explanation: '' })
  }
}
