# Plano — Ranking (`src/app/ranking/page.tsx`)

**Última revisão:** 2026-06-20

---

## Estado atual

Tela **não implementada**. Existe apenas o link no `LoginBadge` da home → `router.push('/ranking')`.

O schema do Supabase já tem a view `ranking` calculada (SUM de `trail_progress.score` por usuário).

---

## Requisitos

- Disponível apenas para usuários autenticados
- Redirecionar para home se visitante
- Atualizado após cada rodada da trilha concluída

---

## Dados

```ts
// View ranking (Supabase)
{
  id: UUID
  nickname: string
  avatar_id: number        // 1–15 → /avatar/avatar_XX.png
  total_score: number
  letters_played: number   // quantas letras jogou
  position: number         // RANK() no banco
}
```

Query: `supabase.from('ranking').select('*').order('total_score', { ascending: false }).limit(50)`

---

## Layout

```
┌─────────────────────────────┐
│ ← VOLTAR         RANKING    │  ← header
│                             │
│ ┌── Sua posição ──────────┐ │
│ │ #3  [avatar]  Você      │ │  ← card destacado (borda amarela)
│ │      1.234 pts · 18♪    │ │
│ └─────────────────────────┘ │
│                             │
│  #1  [av]  Jogador1  2.100  │
│  #2  [av]  Jogador2  1.800  │
│ ▶#3  [av]  Você      1.234  │  ← destacado na lista também
│  #4  [av]  Jogador4    980  │
│  ...                        │
│                             │
│  [bottom bar]   [SOM]       │
└─────────────────────────────┘
  fundo: #0a1628
```

---

## Componentes

### Header fixo
- Botão VOLTAR: `iconSrc="/icons/btn_voltar.png"` (BtnSecondary)
- Título "RANKING" em amarelo `#FFD93D`

### Card "sua posição" (fixo no topo)
- Borda: `2px solid #FFD93D`
- Avatar: `avatar/avatar_XX.png` (baseado em `avatar_id`)
- Nickname + total_score + letters_played
- Posição com `#` em destaque

### Lista scrollável
- 50 primeiros colocados
- Row: posição | avatar | nickname | pontuação
- Row do usuário logado: borda amarela + fundo ligeiramente mais claro
- Zona de top 3: posições com ícones 🥇🥈🥉 (manter emoji aqui)

### Zona de rebaixamento (inspiração Duolingo)
- Linha divisória vermelha após top ~80%
- Label: "Zona de risco" abaixo da linha
- Jogadores abaixo da linha com nome em vermelho suave

---

## Implementação

```
src/app/ranking/
  page.tsx           ← client component, fetch do Supabase
```

### Fluxo
```ts
useEffect(() => {
  supabase.auth.getUser().then(({ data }) => {
    if (!data.user) router.push('/')
    else fetchRanking()
  })
}, [])
```

---

## Assets usados
- `public/avatar/avatar_01–15.png` para cada jogador
- `public/aviso/vencedor.png` decorativo no topo (opcional)
- `public/cachorra/5.png` decorativo no header (opcional)
