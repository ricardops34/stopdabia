import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import rules from '@/lib/game/rules.json'
import type { AnswerOutcome } from '@/lib/game/types'

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

interface ValidationResult {
  playerId: string
  outcome: AnswerOutcome
  valid: boolean
}

function outcomeToValid(outcome: AnswerOutcome): boolean {
  return rules.outcomes[outcome].valid
}

// Normaliza primeira letra ignorando acentos (Á→A, É→E, etc.)
function normalizeFirst(s: string): string {
  return s.trim().charAt(0).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()
}

// Regras determinísticas que a IA nunca pode sobrescrever
function hardCheck(answer: string, letter: string): AnswerOutcome | null {
  const trimmed = answer.trim()
  if (!trimmed) return 'vazio'
  if (normalizeFirst(trimmed) !== letter.toUpperCase()) return 'letra_errada'
  return null
}

function fallbackOutcome(answer: string, letter: string): AnswerOutcome {
  const hard = hardCheck(answer, letter)
  if (hard) return hard
  return answer.trim().length > 1 ? 'matando_aula' : 'palavra_nao_existe'
}

// Gera exemplos few-shot para a categoria + letra atual
function buildFewShot(letter: string, catKey: keyof typeof rules.categories): string {
  const cat = rules.categories[catKey]
  if (!cat) return ''

  // Pega até 2 exemplos válidos e 2 inválidos que comecem com a letra (ou usa genéricos)
  const validEx = cat.examples_valid.filter((e) => normalizeFirst(e) === letter.toUpperCase()).slice(0, 2)
  const invalidEx = cat.examples_invalid.filter((e) => normalizeFirst(e) === letter.toUpperCase()).slice(0, 1)

  const examples: string[] = []

  if (validEx.length > 0) {
    validEx.forEach((ex) => examples.push(`  Resposta: "${ex}" → acerto`))
  }
  if (invalidEx.length > 0) {
    invalidEx.forEach((ex) => examples.push(`  Resposta: "${ex}" → matando_aula`))
  }

  // Exemplo genérico de palavra inventada com a letra
  examples.push(`  Resposta: "${letter.toUpperCase()}${letter.toLowerCase()}xpto" → palavra_nao_existe`)

  return examples.length > 0 ? `\nExemplos para letra "${letter}" nesta categoria:\n${examples.join('\n')}` : ''
}

const SYSTEM_PROMPT = `Você é o árbitro oficial do jogo STOP (Adedonha) em português brasileiro, voltado para crianças e adolescentes.

Suas responsabilidades:
1. Avaliar se respostas são válidas para a categoria pedida
2. Ser GENEROSO e PERMISSIVO com respostas claramente corretas — não rejeite o óbvio
3. Conhecer bem o português brasileiro, incluindo nomes populares, regionalismos e gírias consagradas
4. Só rejeitar quando a resposta for claramente errada, inventada ou não pertencer à categoria

IMPORTANTE: Se a resposta for um exemplo clássico e conhecido da categoria (ex: "Rato" para Animal, "Rua" para Cidade, "Rosa" para Cor), sempre classifique como "acerto". Nunca rejeite o óbvio.

Você responde APENAS com JSON. Nunca adiciona texto, explicações ou markdown.`

export async function POST(request: NextRequest) {
  const body: ValidationBody = await request.json()
  const { letter, category, answers } = body

  if (!letter || !category || !Array.isArray(answers)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Hard check determinístico — letra errada e vazio nunca chegam à IA
  const preChecked = new Map<string, AnswerOutcome>()
  const needsAI: AnswerInput[] = []

  for (const a of answers) {
    const hard = hardCheck(a.answer, letter)
    if (hard) {
      preChecked.set(a.playerId, hard)
    } else {
      needsAI.push(a)
    }
  }

  if (needsAI.length === 0) {
    const results: ValidationResult[] = answers.map((a) => {
      const outcome = preChecked.get(a.playerId)!
      return { playerId: a.playerId, outcome, valid: outcomeToValid(outcome) }
    })
    return NextResponse.json({ results })
  }

  // Regras da categoria
  const catKey = category
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '') as keyof typeof rules.categories
  const catRules = rules.categories[catKey]

  const edge = catRules && 'edge_cases' in catRules
    ? (catRules as { edge_cases: string }).edge_cases
    : null

  const fewShot = buildFewShot(letter, catKey)

  const userPrompt = `## Tarefa de correção

**Letra sorteada:** "${letter}"
**Categoria:** "${category}"

### Definição da categoria
${catRules?.description ?? `Qualquer resposta válida relacionada a "${category}"`}

${catRules ? `**Aceito:** ${catRules.examples_valid.join(', ')}
**Não aceito:** ${catRules.examples_invalid.join(', ')}` : ''}
${edge ? `**Atenção:** ${edge}` : ''}
${fewShot}

### Classificações possíveis
- **"acerto"** — palavra real em português, encaixa perfeitamente na categoria. Aceite variações ortográficas menores (ex: "cocô" e "coco" são iguais). Nomes compostos valem se a PRIMEIRA palavra começa com "${letter}".
- **"erro_ortografia"** — a palavra encaixa na categoria e começa com "${letter}", mas tem erro de grafia claro (letra trocada, acento errado, etc.). Ex: letra A, Animal → "Arara" correto; "Ararra" ou "Aara" → erro_ortografia.
- **"matando_aula"** — começa com "${letter}", mas a palavra não existe no dicionário, é claramente inventada, ou não se encaixa na categoria. Ex: nome de pessoa em categoria de animal, fruta inventada, etc.
- **"palavra_nao_existe"** — sequência sem sentido, letras aleatórias, ou incompreensível. Mais grave que matando_aula.

### Respostas para classificar
Todas JÁ foram verificadas: começam com a letra "${letter}". Avalie APENAS se encaixam na categoria.

${needsAI.map((a, i) => `${i + 1}. playerId="${a.playerId}" | "${a.answer}"`).join('\n')}

### Formato de resposta (JSON puro, sem texto adicional)
{"results":[{"playerId":"...","outcome":"acerto|matando_aula|palavra_nao_existe"}]}`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 512,
      temperature: 0,
      response_format: { type: 'json_object' },
    })

    const text = completion.choices[0]?.message?.content ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')

    const parsed = JSON.parse(jsonMatch[0]) as { results: { playerId: string; outcome: AnswerOutcome }[] }
    const aiMap = new Map(parsed.results.map((r) => [r.playerId, r.outcome]))

    const validAiOutcomes: AnswerOutcome[] = ['acerto', 'matando_aula', 'palavra_nao_existe', 'erro_ortografia']

    const results: ValidationResult[] = answers.map((a) => {
      // Hard check sempre tem prioridade
      const hardOutcome = preChecked.get(a.playerId)
      if (hardOutcome) return { playerId: a.playerId, outcome: hardOutcome, valid: outcomeToValid(hardOutcome) }

      const aiOutcome = aiMap.get(a.playerId)
      const outcome: AnswerOutcome = aiOutcome && validAiOutcomes.includes(aiOutcome)
        ? aiOutcome
        : 'matando_aula'
      return { playerId: a.playerId, outcome, valid: outcomeToValid(outcome) }
    })

    return NextResponse.json({ results })
  } catch {
    const results: ValidationResult[] = answers.map((a) => {
      const outcome = preChecked.get(a.playerId) ?? fallbackOutcome(a.answer.trim(), letter)
      return { playerId: a.playerId, outcome, valid: outcomeToValid(outcome) }
    })
    return NextResponse.json({ results })
  }
}
