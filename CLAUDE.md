@AGENTS.md

# Bia STOP — Documentação Completa do Projeto

Jogo de STOP digital (adedonha) para crianças e adolescentes (8–17 anos), visual crochê/amigurumi 3D. Funciona sem cadastro. Autenticação opcional libera ranking global.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 App Router, diretório `src/` |
| Linguagem | TypeScript estrito |
| Estilo | Tailwind CSS + inline styles (ver paleta abaixo) |
| Tempo real | Socket.IO 4 — servidor customizado em `server.js` |
| IA / Validação | Groq `llama-3.1-8b-instant` via `/api/validate` e `/api/hint` |
| Auth | Supabase Auth (Google) |
| Banco | Supabase PostgreSQL — schema em `docs/supabase-schema.sql` |
| Cache/Ranking | Redis (Upstash) — `src/lib/redis/` |
| Dev server | `npm run dev` — inicia servidor customizado que embute Socket.IO |

**Variável de ambiente obrigatória:** `GROQ_API_KEY` em `.env.local`

---

## Estrutura de Arquivos

```
src/
  app/
    page.tsx                    # Home: logo, cachorra aleatória, 3 botões
    layout.tsx                  # Root layout: fontes, meta, global CSS
    solo/page.tsx               # Modo individual completo (máquina de estados)
    room/[code]/page.tsx        # Multiplayer completo (Socket.IO)
    onboarding/page.tsx         # Configuração inicial após login
    auth/callback/route.ts      # Callback OAuth do Supabase
    api/
      hint/route.ts             # POST → sugestão de palavra via Groq
      validate/route.ts         # POST → valida respostas via Groq
      ranking/route.ts          # GET → top do ranking
      ranking/save/route.ts     # POST → salva resultado no Redis
      socket/route.ts           # Ponto de montagem do Socket.IO
  components/
    BottomBar.tsx               # Barra fixa + BtnPrimary + BtnSecondary + MuteToggle
  lib/
    audio/manager.ts            # playTrack / playSfx / stopTrack / getMuted / setMuted
    game/
      types.ts                  # Tipos TypeScript de toda a lógica de jogo
      config.ts                 # Letras, categorias, constantes, generateRoomCode, drawLetter
      scoring.ts                # computeCategoryScores, computeRoundTotal
      aviso.ts                  # avisoFromOutcome, avisoFromAnswer
      rules.json                # Mapeamento outcome → imagem de aviso
    socket/
      client.ts                 # connectSocket() — singleton do lado cliente
      handler.ts                # attachSocketServer() — toda lógica de sala no servidor
      events.ts                 # Tipos de eventos Socket.IO (ClientToServer, ServerToClient)
      store.ts                  # getRoom / setRoom / deleteRoom (Map em memória)
    supabase/
      client.ts                 # createClient() para browser
      server.ts                 # createServerClient() para Server Components
      auth.ts                   # signInWithGoogle / signOut
    redis/
      client.ts                 # Redis singleton
      ranking.ts                # saveGameResult, getRanking
  middleware.ts                 # Supabase auth middleware
  test/                         # Vitest — testes unitários
public/
  icons/           # Ícones crochê PNG (detalhado abaixo)
  letras_sorteio/  # A–Z.png — menina com quadro exibindo a letra (revelação)
  cachorra/        # 1–5.png — poses da mascote Boston Terrier
  aviso/           # avisos de feedback (menina de headphone)
  contagem/        # 01.png, 02.png, 03.png, vai.png — countdown
  easter/          # easter_egg_01.png–13.png
  avatar/          # avatar_01.png–17.png (usar apenas 01–15 no código)
  trail/           # fio.png, fio_bg.png, node_done.png, node_locked.png,
                   # node_glow.png, secao_classica.png, secao_escolar.png, secao_divertida.png
  ui/
    barra_fundo.png  # Textura crochê dark navy para o BottomBar
  imagens/
    logo-home.png         # Logo principal (hero da home)
    cachorra-home-1.png   # Cachorra pose 1 (home)
    cachorra-home-2.png   # Cachorra pose 2 (home / criar sala)
    cachorra-home-4.png   # Cachorra pose 4 (home / entrar na sala)
  logo.png         # Versão compacta do logo (trail e sala)
  favico.png
```

> **Atenção — assets com espaço no nome:** usar encode ou renomear antes de referenciar no código:
> - `public/aviso/erro sistema.png` → `/aviso/erro%20sistema.png`
> - `public/aviso/dica extra.png` → `/aviso/dica%20extra.png`

---

## Design System

### Paleta de Cores (valores exatos — nunca inventar outras)

| Nome | Hex | Uso principal |
|---|---|---|
| Fundo escuro | `#0a1628` | Background home e BottomBar |
| Fundo tela jogo | `#1A1A2E` | Playing, review, countdown |
| Fundo painel | `#0F3460` | Cards, inputs, painéis |
| Fundo detalhe | `#16213E` | Itens dentro de painel |
| Amarelo primário | `#FFD93D` | Borda BtnPrimary, letra selecionada, pontos |
| Creme texto | `#F8E7BF` | Texto principal em fundo escuro |
| Coral ação | `#FF6B6B` | Botão STOP, seção Clássico |
| Teal | `#4ECDC4` | Seção Escolar, resposta preenchida, progresso |
| Roxo | `#9B59B6` | Seção Divertida, entrar na sala |
| Laranja | `#FF9500` | Criar sala |
| Verde acerto | `#95E06C` | Resposta válida |
| Dourado login | `#D69B2B` | Borda LoginBadge |

### Tipografia

- Todo texto em **peso ≥ 700** (bold, extrabold, black)
- Nome de categoria em jogo: `text-4xl font-black` cor `#FFD93D`
- Labels de botão: `fontSize: 8–9px`, `fontWeight: 700–900`, `letterSpacing: 0.5`, uppercase
- Código de sala: `text-3xl font-extrabold tracking-[0.35em] uppercase`

### Layout Base

- Mobile-first: `max-w-[440px]` centrado em desktop
- Usar `min-h-[100dvh]` (suporte a notch mobile)
- `backgroundColor` sempre como inline style, não classe Tailwind (garante SSR)
- BottomBar: `position: fixed; bottom: 0; height: 76px; z-index: 40`
- Conteúdo scrollável: `paddingBottom: 96px` para não ficar sob a barra
- Scroll sem barra visual: `scrollbarWidth: 'none'`

### BottomBar — Como usar

```tsx
import BottomBar, { BtnPrimary, BtnSecondary } from '@/components/BottomBar'

<BottomBar
  left={<BtnSecondary onClick={fn} iconSrc="/icons/btn_voltar.png" label="VOLTAR" size={60} />}
  center={<BtnPrimary onClick={fn} iconSrc="/icons/btn_jogar.png" label="JOGAR" color="#FF9500" pulse size={74} />}
  right={<BtnSecondary onClick={fn} icon="→" label="PRÓXIMA" />}
/>
```

- `BtnPrimary`: cor de fundo configurável, borda sempre `#FFD93D`, tamanho padrão 56 (74 para destaque)
- `BtnSecondary`: fundo semitransparente `rgba(255,255,255,0.08)`, borda sutil
- `pulse`: adiciona animação `animate-pulse-stop`
- `MuteToggle` é renderizado automaticamente pelo BottomBar — não adicionar manualmente
- Preferir `iconSrc` (PNG de `/icons/`) a `icon` (emoji). Usar emoji só quando PNG não existe

---

## Ícones `public/icons/`

| Arquivo | Visual | Quando usar |
|---|---|---|
| `btn_stop.png` | Mão vermelha octógono | Botão STOP! |
| `btn_dica.png` | Lâmpada amarela acesa | Dica disponível |
| `btn_dica_usada.png` | Lâmpada cinza apagada | Dica já usada |
| `btn_voltar.png` | Seta ← creme | Voltar (navegação geral) |
| `btn_avançar.png` | Seta → creme | Avançar/confirmar (navegação geral) |
| `btn_anterior.png` | `<<` laranja | Categoria anterior (paginação interna) |
| `btn_proxima.png` | `>>` laranja | Próxima categoria (paginação interna) |
| `btn_inicio.png` | Casinha rosa | Voltar à home |
| `btn_resumo.png` | Clipboard roxo | Ir ao resumo |
| `btn_reiniciar.png` | Setas circulares teal | Jogar de novo |
| `btn_som_on.png` | Speaker teal ondas | Som ligado |
| `btn_som_off.png` | Speaker cinza cortado | Som mudo |
| `btn_jogar.png` | Play ▶ | Iniciar jogo |
| `letra_a.png`–`letra_z.png` | Letras crochê amarelo/roxo | Nós da trilha + header da rodada |
| `grupo.png` | Sprite sheet referência | **Nunca usar em código** |

**Distinção:** creme simples (voltar/avançar) = navegação entre telas; laranja duplo (anterior/proxima) = paginação de categorias.

---

## Avisos `public/aviso/`

Personagem: menina morena de headphone em crochê.

| Arquivo | Texto/Contexto | Outcome / Gatilho |
|---|---|---|
| `acerto.png` | "ACERTOU! MANDOU BEM!" | `outcome: 'acerto'` |
| `matando_aula.png` | Duplicata com outro jogador | `outcome: 'matando_aula'` |
| `palavra_nao_existe.png` | IA rejeitou a palavra | `outcome: 'palavra_nao_existe'` |
| `da_zero.png` | Sem resposta | `outcome: 'vazio'` |
| `demora.png` | >10s sem digitar | Timeout local |
| `erro.png` | Letra errada | `outcome: 'letra_errada'` |
| `erro sistema.png` | Falha de API | Erro de rede |
| `quase.png` | 2º lugar | `getPositionAviso(idx=1, total>2)` |
| `perdeu.png` | Último lugar | `getPositionAviso(idx=total-1)` |
| `vencedor.png` | 1º lugar | `getPositionAviso(idx=0)` |
| `caixa.png` | Quadro vazio genérico | Mensagem customizada sobreposta |
| `dica extra.png` | Token de dica extra | Sistema de tokens (futuro) |

Usar sempre `avisoFromOutcome(outcome)` de `src/lib/game/aviso.ts` — nunca hardcodar o caminho.

---

## Mascote (Cachorra) `public/cachorra/`

Boston Terrier crochê amigurumi.

| Arquivo | Pose | Quando usar |
|---|---|---|
| `1.png` | Patinhas pra cima, animada | STOP disparado / interlude |
| `2.png` | Em pé feliz com coleira | Home / resultado médio |
| `3.png` | Brincando com bola rosa | Final da trilha / resultado médio-baixo |
| `4.png` | Escavando terra | Resultado < 40% |
| `5.png` | Pulando com confetes | Resultado ≥ 70% |

**Mapeamento resultado solo:** `pct ≥ 0.7 → pose 5 | pct ≥ 0.4 → pose 3 | pct < 0.4 → pose 4`

Na home, cachorra é sorteada aleatoriamente entre poses 1–4 com `Math.floor(Math.random() * 4) + 1`.

---

## Regras de Negócio

### Letras sorteáveis

```
A B C D E F G H I J L M N O P Q R S T U V Z
(excluem-se K, W, X, Y)
```

### Categorias

| Grupo | IDs |
|---|---|
| `classica` | nome, animal, cor, fruta, objeto, profissao |
| `escolar` | cidade, pais, comida, verbo, personagem, esporte |
| `divertida` | filme, serie, marca, musica |

Mínimo 1, máximo 8 por rodada. Default: as 6 primeiras (clássica).

### Pontuação

| Situação | Pontos |
|---|---|
| Válida e única entre jogadores | **15** |
| Válida mas igual a outro jogador (duplicata) | **10** |
| Inválida / vazia | **0** |

### Validação via IA

`POST /api/validate` → Groq `llama-3.1-8b-instant`

**Fallback local** (se IA falhar): verifica se resposta começa com a letra correta e tem comprimento > 1.

### Sistema de dica

- `POST /api/hint` com `{ letter, categoryLabel }` → `{ word }`
- 1 uso por rodada; preenche automaticamente o campo da categoria atual
- Visual: `btn_dica.png` → `btn_dica_usada.png` após uso

---

## Máquina de Estados — Solo

```
trail → letter → countdown → playing → interlude → review → result
  ↑                                                    |
  └────────────────────────────────────────────────────┘
```

| Fase | Duração / Gatilho |
|---|---|
| `trail` | Indefinida — usuário escolhe letra |
| `letter` | 5 segundos (timer automático) |
| `countdown` | 3s × número + 2s no "VAI" |
| `playing` | 30/60/90s (configurável); encerra por timer ou STOP |
| `interlude` | 2s — exibe `cachorra/1.png` enquanto IA valida |
| `review` | Indefinida — usuário navega os cards |
| `result` | Indefinida — usuário decide |

### Trilha Solo

- **3 seções:** Clássico (A–J), Escolar (K–S), Divertido (T–Z)
- Nós em zigzag: offsets `[-56, -16, 16, 56]px` do centro, ciclicamente
- Imagem de nó: `node_done` (concluído) | `node_glow` (atual) | `node_locked` (bloqueado)
- Banner de seção: `/trail/secao_{id}.png` com gradiente colorido sobreposto
- Fio entre nós: `/trail/fio.png` (não aparece após o último nó da seção)
- Fio decorativo no canto: `/trail/fio_bg.png` (no canto superior esquerdo de telas de formulário)
- Badge de score: círculo amarelo no canto inferior direito do nó concluído

---

## Máquina de Estados — Multiplayer

```
lobby → countdown → playing → stopping → review → [próxima rodada ou finished] → rematch
```

| Fase | Descrição |
|---|---|
| `lobby` | Sala aberta; host configura e inicia |
| `countdown` | Letra revelada 5s + contagem 3→2→1→VAI |
| `playing` | Todos digitam; qualquer um pode dar STOP |
| `stopping` | 2s interlude + coleta de respostas + validação IA |
| `review` | Correção categoria por categoria, depois resumo por jogador |
| `finished` | Ranking final por 8s |
| `rematch` | Votação 20s; todos aceitam → reseta e reinicia |

### Regras do Lobby

- Máximo 10 jogadores por sala
- Quem entra com partida em andamento → `spectating: true` → joga na próxima rodada
- Código: 6 chars de `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (sem ambiguidades)
- Nickname duplicado na sala é rejeitado
- Host que desconecta: próximo jogador vira host automaticamente
- Sala é deletada quando o último jogador sai

### Reconexão

```ts
sessionStorage['stop_session']  // { code: string, nickname: string }
```

Fluxo: `room:sync` (até 3 tentativas, 1s) → se falhar → `room:reconnect` com nickname.

---

## Eventos Socket.IO

### Cliente → Servidor

| Evento | Payload | Callback |
|---|---|---|
| `room:create` | `nickname, avatar` | `{ code, error? }` |
| `room:join` | `code, nickname, avatar` | `{ ok, error?, spectating? }` |
| `room:start` | — | `{ ok, error? }` |
| `room:sync` | — | Servidor emite estado completo |
| `room:reconnect` | `code, nickname` | `ok: boolean` |
| `room:ready` | `code` | — |
| `room:settings` | `categoryIds[]` | — |
| `room:leave` | — | — |
| `game:stop` | — | — |
| `game:answers` | `Record<catId, string>` | — |
| `rematch:ready` | — | — |

### Servidor → Cliente

| Evento | Payload | Quando |
|---|---|---|
| `room:state` | `Room` | Qualquer mudança de estado |
| `room:players` | `Player[]` | Lista de jogadores muda |
| `game:phase` | `GamePhase` | Transição de fase |
| `game:letter` | `string` | Início do countdown |
| `game:countdown` | `number` (3→0) | Durante contagem |
| `game:timer` | `number` | A cada segundo em `playing` |
| `game:stopped` | `nickname` | Quando alguém deu STOP |
| `review:results` | `CategoryResult[]` | Após validação |
| `scoreboard:update` | `Player[]` | Após calcular pontos |
| `rematch:countdown` | `number` | A cada segundo no rematch |
| `room:error` | `string` | Erro de sala |

---

## APIs REST

### `POST /api/validate`

```json
{ "letter": "A", "category": "Animal", "answers": [{ "playerId": "x", "nickname": "João", "answer": "Arara" }] }
```
Retorna: `{ "results": [{ "playerId": "x", "valid": true, "outcome": "acerto" }] }`

### `POST /api/hint`

```json
{ "letter": "A", "categoryLabel": "Animal" }
```
Retorna: `{ "word": "Arara" }`

### `GET /api/ranking`

Retorna top do ranking do Redis.

### `POST /api/ranking/save`

```json
{ "mode": "solo", "nickname": "João", "score": 75, "letter": "A", "categories": 6, "answeredCorrect": 5 }
```
Fire-and-forget — silencioso se Redis offline.

---

## Persistência no Cliente

| Chave | Armazenamento | Conteúdo |
|---|---|---|
| `stop_solo_progress` | `localStorage` | `Record<letra, { score, maxScore }>` |
| `stop_player` | `localStorage` | `{ nickname: string, avatar: string }` |
| `audio_muted` | `localStorage` | `'0'` ou `'1'` |
| `stop_session` | `sessionStorage` | `{ code: string, nickname: string }` |

---

## Segurança e Sanitização

- Respostas sanitizadas no servidor: `.slice(0, 80).replace(/[<>]/g, '')`
- Nicknames: comprimento 3–20, sem palavras ofensivas (`puta merda caralho porra fodase foda cu`)
- Todas as inputs têm `maxLength` definido no cliente

---

## Easter Eggs

Durante countdown do multiplayer: **20% de chance** por rodada. Exibido por 3 segundos.
Imagens: `/easter/easter_egg_01.png` a `/easter/easter_egg_10.png` (código usa 1–10).
Sorteio: `Math.floor(Math.random() * 10) + 1`

---

## Modo Visitante vs. Autenticado

| | Visitante | Autenticado |
|---|---|---|
| Jogar | ✅ | ✅ |
| Progresso salvo | `localStorage` | Supabase |
| Ranking global | ❌ | ✅ |
| Migração de dados | — | ao fazer login |

Login: Google via Supabase Auth. Badge no canto superior direito da home.

---

## Banco Supabase

Schema completo em `docs/supabase-schema.sql`.

| Tabela | Função |
|---|---|
| `profiles` | Criado automaticamente via trigger `on_auth_user_created` |
| `trail_progress` | `{user_id, letra, score, maxScore}` |
| `match_results` | Resultados de partidas multiplayer |

View `ranking`: `SUM(score)` de `trail_progress` por usuário.

---

## Pendências (não implementado)

- [ ] Tela `/ranking` — leaderboard global
- [ ] Migração localStorage → Supabase ao fazer login
- [ ] Substituir emojis residuais na BottomBar por ícones PNG
- [ ] Renomear `dica extra.png` → `dica_extra.png` e `erro sistema.png` → `erro_sistema.png`
- [ ] Sistema de tokens de dica extra
- [ ] Easter eggs na trilha individual (atualmente só no multiplayer)
- [ ] Animações de transição entre fases
