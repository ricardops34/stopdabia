# Plano — BottomBar (`src/components/BottomBar.tsx`)

**Última revisão:** 2026-06-20

---

## Estado atual

| Elemento | Implementado | Problema |
|---|---|---|
| Footer fixo 76px navy | ✅ | — |
| Slots left / center / right | ✅ | — |
| MuteToggle fixo à direita | ✅ | usa emoji 🔇/🔊 em vez de PNG |
| BtnPrimary coral + borda amarela | ✅ | usa emoji como ícone |
| BtnSecondary glass | ✅ | usa emoji como ícone |
| Fundo `barra_fundo.png` | ❌ | não aplicado, fundo é CSS puro |

---

## Ajustes necessários

### 1. Fundo da barra
- Aplicar `public/ui/barra_fundo.png` como background da `<footer>`
- Usar `background-image` + `background-size: cover` ou `<Image fill>`
- Manter `backgroundColor: '#0a1628'` como fallback

### 2. MuteToggle — trocar emojis por PNGs
```
muted = false  →  src="/icons/btn_som_on.png"
muted = true   →  src="/icons/btn_som_off.png"
```
- Tamanho da imagem dentro do botão: 32×32px
- Label "SOM" mantida

### 3. BtnPrimary — suporte a PNG
Adicionar prop opcional `iconSrc?: string`:
- Se `iconSrc` presente → renderiza `<Image src={iconSrc} width={32} height={32} />`
- Se só `icon` (string) → mantém fallback emoji (compatibilidade)
- Borda amarela e fundo coral permanecem

### 4. BtnSecondary — suporte a PNG
Mesma lógica: prop `iconSrc?: string` como alternativa ao emoji `icon`

---

## Mapeamento de ícones por tela

| Contexto | Botão | iconSrc |
|---|---|---|
| STOP! | BtnPrimary | `/icons/btn_stop.png` |
| Dica disponível | BtnSecondary | `/icons/btn_dica.png` |
| Dica usada | BtnSecondary | `/icons/btn_dica_usada.png` |
| Próxima categoria | BtnSecondary | `/icons/btn_proxima.png` |
| Categoria anterior | BtnSecondary | `/icons/btn_anterior.png` |
| Voltar / cancelar | BtnSecondary | `/icons/btn_voltar.png` |
| Avançar | BtnSecondary | `/icons/btn_avançar.png` |
| Início/Home | BtnSecondary | `/icons/btn_inicio.png` |
| Resumo | BtnSecondary | `/icons/btn_resumo.png` |
| Resultado/Troféu | BtnPrimary | `/icons/btn_resultado.png` |
| Jogar/Play | BtnPrimary | `/icons/btn_jogar.png` |
| Sair da sala | BtnSecondary | `/icons/btn_sair.png` |
| Reiniciar | BtnSecondary | `/icons/btn_reiniciar.png` |

---

## Layout final esperado

```
┌────────────────────────────────────────────────────┐  ← barra_fundo.png
│  [left 56×56]   [center: gap-3]   [right 56×56]  [SOM 56×56] │
└────────────────────────────────────────────────────┘
     altura total: 76px, z-index: 40
```

---

## Sem breaking changes

Manter `icon` (string/emoji) como fallback — todas as chamadas existentes continuam funcionando.
