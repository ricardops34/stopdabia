# Bia STOP — MVP Plan

**Última revisão:** 2026-06-20  
**Stack:** Next.js 16 · TypeScript · Tailwind CSS · Socket.IO 4 · Groq SDK

---

## Estado atual do MVP

| Área | Status |
|---|---|
| Home (`/`) | ✅ implementado |
| Modo solo — config/letra/countdown/jogando/revisão/resultado | ✅ implementado |
| Modo solo — trilha individual (TrailScreen) | ✅ implementado (aguarda assets `trail/`) |
| Multiplayer — lobby/countdown/jogando/revisão/resumo | ✅ implementado |
| BottomBar com BtnPrimary/BtnSecondary/MuteToggle | ✅ implementado |
| Sistema de Dica (IA via Groq) | ✅ implementado (`/api/hint`) |
| Paginação de categorias (jogando + revisão) | ✅ implementado |
| Aviso hero 220×220px na revisão | ✅ implementado |
| Assets de ícones da barra | ✅ todos criados |
| Assets da trilha (`public/trail/`) | ✅ todos criados (8 arquivos, inclui `fio_bg.png`) |
| **Autenticação Google + Apple** | ⏳ não implementado |
| **Banco de dados (progresso + ranking)** | ⏳ não implementado |
| Ranking/leaderboard (tela dedicada) | ⏳ não implementado |
| Sistema de tokens de dica | ⏳ não implementado |

---

## Arquitetura de arquivos

```
src/
  app/
    page.tsx                  ← home: logo, cachorra aleatória, 3 botões
    solo/page.tsx             ← modo solo completo (máquina de estados)
    room/[code]/page.tsx      ← multiplayer completo (máquina de estados)
    api/
      hint/route.ts           ← POST {letter, categoryLabel} → {word}
      validate/route.ts       ← validação de palavras
      socket/route.ts         ← Socket.IO server
  components/
    BottomBar.tsx             ← barra fixa + BtnPrimary + BtnSecondary
  lib/
    audio/manager.ts          ← getMuted / setMuted
public/
  icons/                      ← 15 ícones crochê + 26 letra_X.png
  letras_sorteio/             ← A–Z revelação (menina com quadro)
  cachorra/                   ← 5 poses da mascote
  aviso/                      ← 12 avisos da menina de headphone
  contagem/                   ← 01, 02, 03, vai
  easter/                     ← 13 easter eggs
  avatar/                     ← 15 avatares
  trail/                      ← ⏳ 7 assets pendentes de criação
  ui/
    barra_fundo.png           ← fundo da BottomBar
```

---

## Máquina de estados — Solo (`src/app/solo/page.tsx`)

```
trail → config → letter → countdown → playing → review → result
```

| Estado | Tela | Assets chave |
|---|---|---|
| `trail` | Trilha zigzag A–Z | `icons/letra_X.png` + `trail/node_*.png` (⏳) |
| `config` | Escolha de tempo e categorias | — |
| `letter` | Revelação da letra (5s auto) | `letras_sorteio/X.png` |
| `countdown` | 3-2-1-VAI (easter egg ~20%) | `contagem/0X.png` + `easter/easter_egg_XX.png` |
| `playing` | Uma categoria por página + dica | `icons/letra_X.png`, `btn_dica.png`, `btn_stop.png` |
| `review` | Aviso hero por categoria (prev/next) | `aviso/*.png` (220×220px) |
| `result` | Pontuação + cachorra por performance | `cachorra/5.png` ≥70% · `3.png` ≥40% · `4.png` <40% |

**Persistência solo:** `localStorage['stop_solo_progress']` → `{letra: {score, maxScore}}`  
**Nickname/avatar:** `localStorage['stop_player']` → `{nickname, avatarId}`

---

## Máquina de estados — Multiplayer (`src/app/room/[code]/page.tsx`)

```
lobby → countdown → playing → stopping → review → scoreboard → finished
```

| Estado | Tela | Assets chave |
|---|---|---|
| `lobby` | Lista de jogadores + config do host | `avatar/avatar_XX.png` |
| `countdown` | 3-2-1-VAI | `contagem/0X.png` |
| `playing` | Uma categoria por página + dica | `btn_dica.png`, `btn_stop.png`, `icons/letra_X.png` |
| `stopping` | Cachorra animada + `stop_text.png` | `cachorra/1.png`, `icons/stop_text.png` |
| `review` | Aviso hero por categoria (prev/next) | `aviso/*.png` (220×220px) |
| `scoreboard` | Resumo por jogador com avisos | `aviso/*.png` (48×48px) |
| `finished` | Ranking final | `aviso/vencedor.png`, `aviso/quase.png`, `aviso/perdeu.png` |

**Reconexão:** `sessionStorage['stop_session']` → `{code, playerId}`  
**Socket.IO:** eventos tipados em `src/lib/socket/`

---

## Paginação de categorias (playing + review)

Tanto o modo solo quanto o multiplayer usam o mesmo padrão:

```tsx
const [catIdx, setCatIdx] = useState(0)
const cat = selectedCats[catIdx]
// BottomBar: btn_anterior | btn_dica · btn_stop | btn_proxima
// Dots indicadores abaixo do campo
// key={cat.id} no input → autoFocus ao trocar página
```

A **Dica** sempre aponta para `selectedCats[catIdx]` (categoria visível no momento).

---

## Sistema de Dica — `src/app/api/hint/route.ts`

```
POST /api/hint
Body: { letter: string, categoryLabel: string }
Response: { word: string }
```

- Groq `llama-3.1-8b-instant`, max_tokens 20, temperature 0.7
- Prompt: responda APENAS com UMA palavra que começa com a letra e pertence à categoria
- 1 uso por rodada; estado `hintUsed` e `hintLoading` resetam ao entrar em `playing`
- Visual: `btn_dica.png` → `btn_dica_usada.png` após uso

---

## Trilha individual — layout e dados

### Seções e letras

| Seção | Letras | Cor | Banner |
|---|---|---|---|
| Clássico | A–J (10 letras) | Coral `#FF6B6B` | `trail/secao_classica.png` ⏳ |
| Escolar | K–R (8 letras) | Teal `#4ECDC4` | `trail/secao_escolar.png` ⏳ |
| Divertido | S–Z (8 letras) | Roxo `#9B59B6` | `trail/secao_divertida.png` ⏳ |

### Layout zigzag
Posições dos nós (4-cycle): `['flex-start', 'center', 'flex-end', 'center']`

### Estados dos nós
```tsx
// completed: score salvo no localStorage
<Image src="/trail/node_done.png" />   // ⏳ asset
<Image src="/icons/letra_X.png" />     // letra por cima

// current (próxima letra disponível)
<Image src="/trail/node_glow.png" />   // ⏳ asset
<Image src="/icons/letra_X.png" />

// locked
<Image src="/trail/node_locked.png" /> // ⏳ asset
<Image src="/icons/letra_X.png" style={{filter:'grayscale(1) opacity(0.4)'}} />

// conector entre nós
<Image src="/trail/fio.png" />         // ⏳ asset
```

---

## Banco de dados

### Schema principal (PostgreSQL via Prisma)

```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  provider    String   // "google" | "apple"
  nickname    String
  avatarId    Int      // 1–15
  createdAt   DateTime @default(now())

  trailProgress TrailProgress[]
  matchResults  MatchResult[]
}

model TrailProgress {
  id        String   @id @default(cuid())
  userId    String
  letter    String   // "A"–"Z"
  score     Int
  maxScore  Int
  playedAt  DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}

model MatchResult {
  id        String   @id @default(cuid())
  userId    String
  roomCode  String
  score     Int
  position  Int      // posição no ranking da sala
  playedAt  DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
```

### Ranking geral
Calculado com `SUM(score)` da tabela `TrailProgress` por usuário.  
Query: `SELECT userId, SUM(score) as total FROM TrailProgress GROUP BY userId ORDER BY total DESC`

---

## Autenticação

### Biblioteca
**Auth.js v5** (NextAuth) — suporte nativo a App Router do Next.js 16.

```ts
// src/auth.ts
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Apple from 'next-auth/providers/apple'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google, Apple],
  callbacks: {
    async signIn({ user, account }) {
      // upsert User no banco
    },
    async session({ session, token }) {
      // adicionar userId, nickname, avatarId à session
    },
  },
})
```

### Rotas
```
src/auth.ts                    ← configuração central
src/app/api/auth/[...nextauth]/route.ts  ← handler
src/app/onboarding/page.tsx    ← nickname + avatar (primeiro acesso)
src/app/ranking/page.tsx       ← leaderboard geral (requer login)
src/app/perfil/page.tsx        ← histórico pessoal (requer login)
```

### Fluxo de primeiro acesso
```
OAuth callback
  → verificar se User existe no banco
  → não existe: redirect /onboarding (escolher nickname + avatar)
  → existe: redirect para onde estava
```

### Sincronização localStorage → banco
Ao fazer login com progresso local existente:
```ts
const local = JSON.parse(localStorage.getItem('stop_solo_progress') ?? '{}')
if (Object.keys(local).length > 0) {
  // mostrar modal: "Você tem X letras salvas localmente. Sincronizar?"
  // POST /api/trail/sync com os dados
  // limpar localStorage após sync
}
```

---

## Modo visitante vs autenticado

| Ação | Visitante | Autenticado |
|---|---|---|
| Jogar trilha | ✅ | ✅ |
| Jogar multiplayer | ✅ | ✅ |
| Progresso da trilha | `localStorage` | Banco de dados |
| Ver ranking geral | ❌ | ✅ |
| Histórico de partidas | ❌ | ✅ |
| Tokens de dica | ❌ | ✅ (futuro) |
| Progresso entre dispositivos | ❌ | ✅ |

---

## Próximos passos

### Alta prioridade
1. ~~**Criar assets `public/trail/`**~~ ✅ concluído — integrar no TrailScreen
2. **Autenticação** — instalar Auth.js, configurar Google + Apple, criar tabela `users`
3. **Banco de dados** — Supabase (schema em `docs/supabase-schema.sql`)

### Média prioridade
4. **Tela de ranking** — leaderboard geral, só para autenticados (`/ranking`)
5. **Tela de onboarding** — nickname + avatar no primeiro login (`/onboarding`)
6. **Sync localStorage → banco** — modal ao fazer login com progresso local
7. **Substituir emojis da BottomBar pelos ícones PNG** — `MuteToggle`, `BtnPrimary`, `BtnSecondary`
8. **Renomear assets com espaço** — `aviso/dica extra.png` → `dica_extra.png`, `aviso/erro sistema.png` → `erro_sistema.png`

### Baixa prioridade
9. **Sistema de tokens de dica** — acumular após partidas, gastar para dicas extras, `aviso/dica_extra.png`
10. Easter eggs na trilha individual
11. Animações de transição entre estados

---

## Variáveis de ambiente

```env
# IA
GROQ_API_KEY=...

# Auth.js
AUTH_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
AUTH_APPLE_ID=...
AUTH_APPLE_SECRET=...

# Banco de dados
DATABASE_URL=postgresql://...
```
