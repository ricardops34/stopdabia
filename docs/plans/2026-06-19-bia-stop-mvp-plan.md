# Bia STOP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Construir o MVP web em tempo real do `Bia STOP` para celular e desktop.

**Architecture:** Aplicação `Next.js` com frontend React, rotas e server runtime no mesmo projeto, sincronização em tempo real via `Socket.IO` e persistência relacional simples para salas, rodadas, respostas e pontuação.

**Tech Stack:** `Next.js`, `React`, `TypeScript`, `Tailwind CSS`, `Socket.IO`, `PostgreSQL`, `Vitest`, `Testing Library`

---

### Task 1: Scaffold do projeto

**Files:**
- Create: `app/*`
- Create: `components/*`
- Create: `lib/*`
- Create: `public/*`
- Create: `tests/*`
- Create: `package.json`

**Step 1: Gerar a base do projeto**

Run: `npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`

Expected: projeto Next.js criado sem erro.

**Step 2: Validar instalação**

Run: `npm install`

Expected: dependências resolvidas com sucesso.

**Step 3: Verificar build base**

Run: `npm run build`

Expected: build inicial concluído com exit code `0`.

### Task 2: Fundamentos visuais da marca

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/page.tsx`
- Create: `src/components/brand/*`

**Step 1: Escrever teste da home**

Criar teste cobrindo:
- render do nome `Bia STOP`
- CTA de criar sala
- CTA de entrar na sala

**Step 2: Rodar teste e confirmar falha**

Run: `npm test`

Expected: falha por componentes ainda não existentes ou texto divergente.

**Step 3: Implementar home**

Implementar landing com:
- hero
- cards de acesso
- visual responsivo
- identidade visual da marca

**Step 4: Rodar testes**

Run: `npm test`

Expected: testes passando.

### Task 3: Modelo de domínio do jogo

**Files:**
- Create: `src/lib/game/types.ts`
- Create: `src/lib/game/config.ts`
- Create: `src/lib/game/scoring.ts`
- Create: `src/tests/game/*`

**Step 1: Escrever testes de regras**

Cobrir:
- estados válidos da partida
- limites de categorias por sala
- regras de pontuação

**Step 2: Rodar testes e confirmar falha**

Run: `npm test`

Expected: falha por módulos ausentes.

**Step 3: Implementar domínio mínimo**

Criar:
- tipos centrais
- presets de categoria
- helpers de pontuação

**Step 4: Rodar testes**

Run: `npm test`

Expected: testes passando.

### Task 4: Lobby da sala

**Files:**
- Create: `src/app/room/[code]/page.tsx`
- Create: `src/components/room/*`
- Create: `src/lib/room/*`
- Create: `src/tests/room/*`

**Step 1: Escrever testes do lobby**

Cobrir:
- exibição do código da sala
- lista de jogadores
- seleção de categorias pelo host
- botão de iniciar

**Step 2: Rodar testes e confirmar falha**

Run: `npm test`

Expected: falha por rota e componentes ausentes.

**Step 3: Implementar lobby inicial**

Entregar:
- layout mobile-first
- categorias vindas da lista pronta
- controles do host

**Step 4: Rodar testes**

Run: `npm test`

Expected: testes passando.

### Task 5: Sincronização em tempo real

**Files:**
- Create: `src/lib/socket/*`
- Create: `src/app/api/socket/*`
- Modify: `src/app/room/[code]/page.tsx`
- Create: `src/tests/socket/*`

**Step 1: Escrever testes de eventos**

Cobrir:
- entrada na sala
- atualização de jogadores
- início da partida
- mudança de fase

**Step 2: Rodar testes e confirmar falha**

Run: `npm test`

Expected: falha por infraestrutura de socket ausente.

**Step 3: Implementar camada de eventos**

Entregar:
- servidor Socket.IO
- cliente socket
- eventos tipados
- sincronização inicial do lobby

**Step 4: Rodar testes**

Run: `npm test`

Expected: testes passando.

### Task 6: Tela de rodada

**Files:**
- Create: `src/components/game/*`
- Create: `src/app/game/[code]/page.tsx`
- Create: `src/tests/gameplay/*`

**Step 1: Escrever testes da rodada**

Cobrir:
- letra exibida
- cronômetro
- formulário de categorias
- botão `STOP`

**Step 2: Rodar testes e confirmar falha**

Run: `npm test`

Expected: falha por tela ainda não implementada.

**Step 3: Implementar rodada**

Entregar:
- grid responsiva
- campo por categoria
- interações visuais do cronômetro
- ação `STOP`

**Step 4: Rodar testes**

Run: `npm test`

Expected: testes passando.

### Task 7: Revisão e placar

**Files:**
- Create: `src/components/review/*`
- Create: `src/components/scoreboard/*`
- Create: `src/tests/review/*`

**Step 1: Escrever testes de revisão**

Cobrir:
- respostas inválidas automáticas
- votação simples
- cálculo de pontos
- ranking final

**Step 2: Rodar testes e confirmar falha**

Run: `npm test`

Expected: falha por fluxo ausente.

**Step 3: Implementar revisão e placar**

Entregar:
- tela de revisão
- ação de aprovar ou rejeitar
- resumo de pontos por rodada
- placar final animado

**Step 4: Rodar testes**

Run: `npm test`

Expected: testes passando.

### Task 8: Persistência inicial

**Files:**
- Create: `src/lib/db/*`
- Create: `prisma/*` or `drizzle/*`
- Create: `src/tests/db/*`

**Step 1: Escrever testes do modelo**

Cobrir:
- criação de sala
- gravação de jogadores
- registro de rodada

**Step 2: Rodar testes e confirmar falha**

Run: `npm test`

Expected: falha por camada de persistência ausente.

**Step 3: Implementar persistência mínima**

Entregar:
- schema inicial
- acesso ao banco
- repositórios mínimos

**Step 4: Rodar testes**

Run: `npm test`

Expected: testes passando.

### Task 9: Verificação final do MVP base

**Files:**
- Modify: `README.md`

**Step 1: Rodar suíte local**

Run: `npm test`

Expected: todos os testes passando.

**Step 2: Rodar build**

Run: `npm run build`

Expected: build concluído com exit code `0`.

**Step 3: Rodar lint**

Run: `npm run lint`

Expected: zero erros.

**Step 4: Documentar setup**

Adicionar no `README.md`:
- como instalar
- como rodar em desenvolvimento
- stack escolhida
- roadmap do MVP
