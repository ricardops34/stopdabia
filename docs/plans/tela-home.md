# Plano — Tela Inicial (`src/app/page.tsx`)

**Última revisão:** 2026-06-20

---

## Estado atual

| Elemento | Status | Observação |
|---|---|---|
| Fundo pink gradient | ✅ | `#F472B6` radial — não é o estilo do jogo |
| Logo `logo.png` | ✅ | 260px de largura |
| Cachorra aleatória (1–4) | ✅ | dentro de círculo teal com borda amarela |
| Tagline + subtítulo | ✅ | funciona |
| Login badge top-right | ✅ | Google OAuth via Supabase |
| BackgroundLetters (A–F flutuantes) | ✅ | decorativo |
| BottomBar: INDIVIDUAL / CRIAR SALA / ENTRAR | ✅ | usa emojis 🎮 ▶ 👫 |
| View: criar sala e entrar sala inline | ✅ | usa `FormScreen` |

---

## Ajustes necessários

### 1. Fundo — trocar para navy `#0a1628`
O fundo rosa não combina com o visual do jogo (navy + crochê).
- Fundo: `#0a1628` (mesmo da BottomBar e das outras telas)
- Manter `BackgroundLetters` mas com opacidade reduzida (0.06)
- Remover `BG_PINK` e `BG_PINK_GRAD`

### 2. Cachorra — tamanho maior, sem círculo
- Remover o wrapper circular teal/amarelo
- Exibir `cachorra.png` diretamente, ~160×160px, com `drop-shadow`
- `animate-slide-up` mantida

### 3. Botões da BottomBar — substituir emojis por PNGs
```
INDIVIDUAL  →  iconSrc="/icons/btn_jogar.png"   (BtnSecondary)
CRIAR SALA  →  iconSrc="/icons/btn_jogar.png"   (BtnPrimary coral)
ENTRAR      →  iconSrc="/icons/btn_avançar.png" (BtnSecondary)
```

### 4. Login badge — manter mas revisar estilo
- Se logado: mostrar avatar salvo (16×16px) + nickname
- Dropdown: "🏆 Ranking" e "Sair" — mantidos
- Cor do badge logado: amarelo `#FFD93D` (já está)

### 5. Tagline — simplificar
Remover emoji 🎉 da tagline. Texto: **"O jogo de STOP mais divertido!"**

---

## Layout final esperado

```
┌─────────────────────────────┐
│ [login badge]           top │
│                             │
│      [logo.png 260px]       │
│                             │
│      [cachorra 160px]       │
│                             │
│   "O jogo de STOP mais..."  │
│  "Sem cadastro. É só jogar" │
│                             │
│  [bottom bar]               │
│  INDIVIDUAL | CRIAR | ENTRAR│
└─────────────────────────────┘
  fundo: #0a1628
```

---

## Sem mudanças funcionais
Lógica de `connectSocket`, `savePlayer`, `saveSession`, OAuth — mantidas intactas.
