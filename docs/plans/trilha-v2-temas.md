# Plano — Trilha v2: Temas com Etapas (`trail_themes`)

**Última revisão:** 2026-06-20  
**Status:** aguardando aprovação antes de implementar

---

## O que muda

### Estrutura atual (v1)
```
Seção Clássico  → letras A–J
Seção Escolar   → letras K–R
Seção Divertido → letras S–Z
```
Progressão baseada em **letra do alfabeto**.

### Estrutura nova (v2)
```
Tema "Animais"      (nível 1) → 7 etapas: A B C D E F G
Tema "Profissões"   (nível 1) → 7 etapas: H I J K L M N
Tema "Gastronomia"  (nível 2) → 7 etapas: A B C D E F G
Tema "Esportes"     (nível 2) → 7 etapas: H I J K L M N
...
```
Progressão baseada em **tema**, com **7 letras fixas por tema**.  
Dificuldade sobe a cada nível — palavras mais difíceis.

---

## Schema Supabase

```sql
-- Temas da trilha (gerenciados por admin / seed)
CREATE TABLE trail_themes (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT    NOT NULL UNIQUE,        -- 'animais', 'gastronomia'
  name        TEXT    NOT NULL,               -- 'Animais'
  description TEXT    NOT NULL DEFAULT '',   -- subtítulo exibido na trilha
  level       INT     NOT NULL DEFAULT 1,    -- 1=fácil, 2=médio, 3=difícil
  color       TEXT    NOT NULL DEFAULT '#FF6B6B',
  sort_order  INT     NOT NULL DEFAULT 0,    -- ordem na trilha
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Etapas por tema: número variável conforme o tema
-- Temas simples: 5 etapas. Temas ricos: 10+ etapas.
CREATE TABLE trail_stages (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id    UUID    NOT NULL REFERENCES trail_themes(id) ON DELETE CASCADE,
  stage_num   INT     NOT NULL CHECK (stage_num >= 1),
  letter      CHAR(1) NOT NULL,              -- 'A' a 'Z'
  hint_word   TEXT    NOT NULL,              -- ex: "Arara" (dica para Animal com A)
  UNIQUE (theme_id, stage_num)
);
-- total de etapas = COUNT(*) FROM trail_stages WHERE theme_id = X

-- Progresso dos jogadores autenticados
CREATE TABLE trail_progress (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID    NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  theme_id    UUID    NOT NULL REFERENCES trail_themes(id),
  stage_num   INT     NOT NULL,              -- 1–7
  score       INT     NOT NULL DEFAULT 0,
  max_score   INT     NOT NULL DEFAULT 0,
  played_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, theme_id, stage_num)     -- upsert: uma linha por etapa por jogador
);
```

### RLS (Row Level Security)
```sql
ALTER TABLE trail_themes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE trail_stages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE trail_progress ENABLE ROW LEVEL SECURITY;

-- Temas e etapas: leitura pública (todos podem ver a trilha)
CREATE POLICY "trail_themes: leitura pública" ON trail_themes FOR SELECT USING (active = true);
CREATE POLICY "trail_stages: leitura pública" ON trail_stages FOR SELECT USING (true);

-- Progresso: cada jogador acessa só o seu
CREATE POLICY "trail_progress: próprio" ON trail_progress
  FOR ALL USING (auth.uid() = user_id);
```

---

## localStorage para visitantes (não cadastrados)

```ts
// chave: 'stop_trail_v2'
type LocalTrailProgress = {
  [themeId: string]: {
    [stageNum: number]: { score: number; maxScore: number; letter: string }
  }
}
```

---

## Seed inicial de temas (sugestão — etapas variam por tema)

| sort | name | level | etapas | letras sugeridas | description |
|---|---|---|---|---|---|
| 1 | Animais | 1 | 8 | A B C D E F G H | Bichos do mundo todo |
| 2 | Profissões | 1 | 6 | A B C D E F | O que as pessoas fazem |
| 3 | Frutas & Comidas | 1 | 7 | A B C D E F G | Para quem tem fome |
| 4 | Países | 2 | 10 | A B C D E F G H I J | Geografía do mundo |
| 5 | Esportes | 2 | 6 | A B C D E F | Muita energia! |
| 6 | Filmes & Séries | 2 | 8 | A B C D E F G H | Para quem ama tela |
| 7 | Ciências | 3 | 5 | A B C D E | Nível ninja |
| 8 | Mitologia | 3 | 5 | A B C D E | Para os estudiosos |

> O número de etapas e as letras são definidos no seed e podem ser alterados via painel admin futuramente.

---

## UI da trilha v2

### Tela principal da trilha
```
┌──────────────────────────────────────┐
│          [logo]                       │
├──────────────────────────────────────┤
│  ★ NÍVEL 1                           │  ← banner de nível
│                                      │
│  [banner Animais]  ████░░░ 4/7      │  ← card de tema com progresso
│  [banner Profissões] ██░░░░░ 2/7   │
│  [banner Frutas]   ░░░░░░░ 0/7     │
│                                      │
│  ★ NÍVEL 2  (desbloqueado ao 100% nível 1)
│                                      │
│  [banner Países]   🔒               │
│  ...                                 │
├──────────────────────────────────────┤
│ [INÍCIO]                       [SOM] │
└──────────────────────────────────────┘
```

### Tela de etapas do tema (ao clicar no tema)
```
┌──────────────────────────────────────┐
│ ← [nome do tema]      ████░░░ 4/8  │  ← X/total dinâmico
├──────────────────────────────────────┤
│                                      │
│   [node_done A]                      │
│       |fio|                          │
│         [node_done B]                │  ← zigzag, N nós conforme o tema
│             |fio|                    │
│           [node_done C]              │
│               |fio|                  │
│             [node_glow D]  ← atual  │
│               |fio|                  │
│           [node_locked E]            │
│               |fio|                  │
│         [node_locked F]              │
│               |fio|                  │
│           [node_locked G]            │
│               |fio|                  │
│         [node_locked H]  (tema de 8) │
│                                      │
├──────────────────────────────────────┤
│ [VOLTAR]                       [SOM] │
└──────────────────────────────────────┘
```

---

## Fluxo de desbloqueio

- **Nível 1**: todos os temas disponíveis de imediato
- **Nível 2**: desbloqueado quando o jogador completa pelo menos 1 etapa em TODOS os temas do nível 1
- **Nível N**: desbloqueado ao completar todos os temas do nível anterior
- Dentro de um tema: etapa 2 desbloqueada ao concluir etapa 1, e assim por diante

---

## Integração de dica (Groq)

A `hint_word` do banco serve como EXEMPLO, não como resposta.  
Quando o jogador pede dica, o Groq recebe:
```
letter: 'A'
categoryLabel: 'Animais'
hintExample: 'Arara'  ← do banco, para calibrar a dificuldade
```

---

## Arquivos a criar/modificar

| Arquivo | Ação |
|---|---|
| `docs/supabase-schema.sql` | Adicionar tabelas `trail_themes`, `trail_stages`, `trail_progress` |
| `src/lib/trail/types.ts` | Tipos: `TrailTheme`, `TrailStage`, `TrailProgress` |
| `src/lib/trail/client.ts` | Funções: `fetchThemes()`, `fetchProgress()`, `upsertProgress()` |
| `src/lib/trail/local.ts` | Funções localStorage para visitantes |
| `src/app/solo/page.tsx` | Refatorar `TrailScreen` para mostrar temas |
| `src/app/solo/[themeId]/page.tsx` | Nova tela: etapas de um tema (7 nós) |

---

## O que NÃO muda

- Assets da trilha (`trail/node_*.png`, `trail/fio.png`, `trail/secao_*.png`) — todos usados
- Máquina de estados: `letter → countdown → playing → review → result` — igual
- Sistema de dica Groq — igual, só passa `hintExample` adicional
- BottomBar, sons, avatares — iguais
