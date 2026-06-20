import rules from './rules.json'
import type { AnswerOutcome } from './types'

export function avisoFromOutcome(outcome: AnswerOutcome): string {
  return rules.outcomes[outcome].image
}

/** Fallback para quando outcome não está disponível — mantém comportamento antigo */
export function avisoFromAnswer(answer: string, letter: string, idx = 0): string {
  const erroAlternado = idx % 2 === 0
    ? rules.outcomes.letra_errada.image
    : rules.outcomes.palavra_nao_existe.image

  if (!answer || answer.trim() === '') return rules.outcomes.vazio.image
  if (answer.trim().toLowerCase().startsWith(letter.toLowerCase())) return rules.outcomes.matando_aula.image
  return erroAlternado
}

export { rules }
