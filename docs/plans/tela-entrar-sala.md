# Plano — Entrar na Sala (`src/app/page.tsx` → view `friends`)

**Última revisão:** 2026-06-20

---

## Estado atual

| Elemento | Status | Observação |
|---|---|---|
| FormScreen (wrapper pink) | ✅ | fundo inconsistente |
| AvatarPicker | ✅ | mesmo do Criar Sala |
| Input nickname | ✅ | |
| Input código da sala | ✅ | uppercase, 6 chars, tracking largo |
| BottomBar: VOLTAR + ENTRAR | ✅ | usa emojis 👫 |
| Validação dupla (nick + código) | ✅ | botão desabilitado até ambos preenchidos |

---

## Ajustes necessários

### 1. Fundo — navy `#0a1628`
Mesma mudança do Criar Sala.

### 2. Cachorra decorativa
- `cachorra/4.png` (cachorra escavando/curiosa) no topo — visual diferente do Criar Sala
- Tamanho: 120×120px

### 3. Input código — destaque visual
O código é a peça central desta tela.
- Fundo: `#0F3460`
- Borda: `3px solid #4ECDC4` (destaque em teal, diferente do nickname)
- Fonte: `font-extrabold`, `text-3xl`, `tracking-[0.35em]`, uppercase — já está
- Placeholder: `"CÓDIGO"` em vez de "Código da sala"
- Label acima: `"Código da sala"` em texto pequeno

### 4. BottomBar — substituir emojis
```
VOLTAR   →  BtnSecondary iconSrc="/icons/btn_voltar.png"
ENTRAR   →  BtnPrimary   iconSrc="/icons/btn_avançar.png"  color="#9B59B6"
```

### 5. Ordem dos campos
1. AvatarPicker
2. Input nickname
3. Input código (em destaque)
4. Mensagem de erro

---

## Layout final esperado

```
┌─────────────────────────────┐
│                             │
│      [cachorra/4.png]       │
│      "Entrar na Sala" (h2)  │
│                             │
│  Escolha seu avatar         │
│  ‹ [av][av][av][av]... ›   │
│                             │
│  [  Seu apelido...        ] │
│                             │
│  Código da sala             │
│  [     ABCD12             ] │  ← borda teal, fonte grande
│                             │
│  [mensagem de erro se houver]│
│                             │
│  [VOLTAR]      [ENTRAR]    [SOM]
└─────────────────────────────┘
  fundo: #0a1628
```
