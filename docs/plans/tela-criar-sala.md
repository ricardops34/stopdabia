# Plano — Criar Sala (`src/app/page.tsx` → view `play`)

**Última revisão:** 2026-06-20

---

## Estado atual

| Elemento | Status | Observação |
|---|---|---|
| FormScreen (wrapper pink) | ✅ | fundo inconsistente com o jogo |
| AvatarPicker (scroll horizontal) | ✅ | funciona, 15 avatares |
| Input nickname | ✅ | autoFocus, validação mín 3 chars |
| BottomBar: VOLTAR + CRIAR SALA | ✅ | usa emojis |
| Feedback de erro | ✅ | texto amarelo abaixo do input |
| Loading state | ✅ | label muda para "CRIANDO" |

---

## Ajustes necessários

### 1. Fundo — trocar para navy `#0a1628`
Consistente com o restante do jogo. Remover `FormScreen` com gradiente rosa.

### 2. Cachorra decorativa
- Exibir `cachorra/2.png` (cachorra feliz de lado) no topo da tela
- Tamanho: 120×120px, centralizada
- Substituir o logo no topo desta tela

### 3. AvatarPicker — melhorar visual
- Borda do avatar selecionado: amarela 3px (já está)
- Avatar: `object-cover` + `rounded-full` (já está)
- Aumentar tamanho do avatar para 72×72px (de 64px)
- Botões ‹ › : fundo `rgba(255,255,255,0.1)` com borda sutil

### 4. Input nickname — estilo navy
- Fundo: `#0F3460`
- Borda: `2px solid rgba(255,255,255,0.2)`
- Foco: borda `#4ECDC4`
- Placeholder: "Seu apelido…"

### 5. BottomBar — substituir emojis
```
VOLTAR       →  BtnSecondary iconSrc="/icons/btn_voltar.png"
CRIAR SALA   →  BtnPrimary   iconSrc="/icons/btn_jogar.png"  color="#FF9500"
```

---

## Layout final esperado

```
┌─────────────────────────────┐
│                             │
│      [cachorra/2.png]       │
│      "Criar Sala"  (h2)     │
│                             │
│  Escolha seu avatar         │
│  ‹ [av][av][av][av]... ›   │
│                             │
│  [  Seu apelido...        ] │
│                             │
│  [mensagem de erro se houver]│
│                             │
│  [VOLTAR]    [CRIAR SALA]  [SOM]
└─────────────────────────────┘
  fundo: #0a1628
```
