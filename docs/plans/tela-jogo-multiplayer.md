# Plano — Jogo Multiplayer (`src/app/room/[code]/page.tsx`)

**Última revisão:** 2026-06-20

---

## Máquina de estados

```
lobby → countdown → playing → stopping → review → scoreboard → finished → rematch
```

---

## Estado: `lobby`

### Implementado
- Lista de jogadores com avatar + nickname
- Código da sala em destaque
- Host pode iniciar

### Ajustes
- [ ] Avatar: usar `<Image>` em vez de `<img>` raw
- [ ] Ícone de coroa para o host (emoji 👑 → ok por enquanto)
- [ ] BottomBar SAIR: `iconSrc="/icons/btn_sair.png"`
- [ ] BottomBar INICIAR (host): `iconSrc="/icons/btn_jogar.png"`

---

## Estado: `countdown`

### Implementado
- `CountdownView`: `contagem/03.png` → `02.png` → `01.png` → `vai.png`
- `animate-letter-enter` por frame

### Ajustes
- [ ] Easter egg ao exibir `vai.png`: ~20% sortear `easter/easter_egg_01–13.png` sobreposto

---

## Estado: `playing` — `PlayingView`

### Implementado
- Header: letra em círculo amarelo + timer + barra de progresso
- Dots de categoria clicáveis
- Input grande com `autoFocus` ao trocar categoria
- `showDemora` após 10s sem digitação

### Ajustes — BottomBar
- [ ] ANTERIOR: `iconSrc="/icons/btn_anterior.png"` (BtnSecondary)
- [ ] DICA disponível: `iconSrc="/icons/btn_dica.png"` (BtnSecondary), fundo `rgba(255,217,61,0.15)`
- [ ] DICA usada: `iconSrc="/icons/btn_dica_usada.png"` (BtnSecondary, disabled), fundo `rgba(255,255,255,0.05)`
- [ ] STOP!: `iconSrc="/icons/btn_stop.png"` (BtnPrimary, pulse)
- [ ] PRÓXIMA: `iconSrc="/icons/btn_proxima.png"` (BtnSecondary)

### Bug a corrigir
- Barra de progresso usa `(timer / 90) * 100` — deveria usar o tempo configurado da sala, não hardcoded 90

---

## Estado: `stopping` — STOP disparado

### Implementado
- `cachorra/1.png` + quem deu STOP + "Corrigindo respostas…"

### Ajustes
- [ ] Adicionar `icons/btn_stop_text.png` (placa octogonal) acima da cachorra
- [ ] Animação `animate-bounce` na cachorra

---

## Estado: `review` — `ReviewCategoryCard`

### Implementado
- Uma categoria por vez com prev/next
- Aviso hero 64×64px por jogador (deveria ser maior na revisão individual)
- Barra de progresso por segmentos
- "Você" sempre primeiro na lista

### Ajustes
- [ ] BottomBar ANTERIOR: `iconSrc="/icons/btn_anterior.png"`
- [ ] BottomBar PRÓXIMA: `iconSrc="/icons/btn_proxima.png"`
- [ ] BottomBar RESUMO (última cat): `iconSrc="/icons/btn_resumo.png"` (BtnPrimary)
- [ ] Aviso: 48×48px no card de review por categoria está OK; manter

---

## Estado: `review` step `summary` — Resumo da rodada

### Implementado
- Cards por jogador com avatar, pontos da rodada, respostas por categoria
- Placar geral acumulado
- Botão PRÓXIMA RODADA ou RESULTADO FINAL

### Ajustes
- [ ] Avatar no card: usar `<Image>` em vez de `<img>` raw
- [ ] BottomBar PRÓXIMA RODADA: `iconSrc="/icons/btn_jogar.png"`
- [ ] BottomBar RESULTADO: `iconSrc="/icons/btn_resultado.png"`

---

## Estado: `finished` — Resultado final

### Implementado
- Ranking final de jogadores
- Botão NOVA PARTIDA + SAIR

### Ajustes
- [ ] 1º lugar: exibir `aviso/vencedor.png` + `cachorra/5.png`
- [ ] 2º lugar: exibir `aviso/quase.png`
- [ ] Último: exibir `aviso/perdeu.png`
- [ ] BottomBar NOVA PARTIDA: `iconSrc="/icons/btn_reiniciar.png"`
- [ ] BottomBar SAIR: `iconSrc="/icons/btn_sair.png"`
