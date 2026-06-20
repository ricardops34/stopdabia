# Plano — Jogo Individual (`src/app/solo/page.tsx`)

**Última revisão:** 2026-06-20

---

## Máquina de estados

```
trail → config → letter → countdown → playing → interlude → review → result
```

---

## Estado: `trail` — Trilha

### Implementado
- Zigzag com offsets controlados (-72/-24/+24/+72px)
- Banners de seção com `trail/secao_*.png` + gradiente
- Nodes: `node_done` / `node_glow` / `node_locked`
- Fio entre nós na mesma coluna do nó
- `currentLetter` = primeira não concluída

### Ajustes pendentes
- [ ] Rolar automaticamente até `currentLetter` ao abrir (`scrollIntoView`)
- [ ] Score badge no nó concluído: mostrar estrelas em vez de número bruto (ex: ★★★ para 100%)
- [ ] Modal de seleção de tempo: substituir emoji `▶ JOGAR!` por `iconSrc="/icons/btn_jogar.png"`
- [ ] BottomBar INÍCIO: `iconSrc="/icons/btn_inicio.png"` em vez de emoji 🏠

---

## Estado: `config` — Configuração

### Implementado
- Seletor de tempo (30s / 60s / 90s)
- Chips de categorias (máx 8)
- BottomBar: VOLTAR + JOGAR!

### Ajustes pendentes
- [ ] BottomBar VOLTAR: `iconSrc="/icons/btn_voltar.png"`
- [ ] BottomBar JOGAR: `iconSrc="/icons/btn_jogar.png"`
- [ ] Mostrar cachorra/2.png no canto como decoração

---

## Estado: `letter` — Revelação da letra

### Implementado
- `letras_sorteio/${letter}.png` (menina com quadro) — **já corrigido**
- Círculo amarelo 280px com glow
- 5s antes de avançar

### Ajustes pendentes
- [ ] Adicionar texto "A letra é…" com animação fade-in mais suave
- [ ] Som de revelação ao entrar nesse estado

---

## Estado: `countdown` — Contagem regressiva

### Implementado
- `contagem/03.png` → `02.png` → `01.png` → `vai.png`
- `animate-letter-enter` no key do countdown
- Easter eggs ~20% das rodadas (TODO: não implementado ainda)

### Ajustes pendentes
- [ ] Implementar easter egg: ~20% das rodadas, sortear `easter/easter_egg_01–13.png` e exibir junto com o `vai.png`

---

## Estado: `playing` — Jogando

### Implementado
- Header: letra (círculo amarelo) + timer com barra de progresso
- Dots de categoria clicáveis
- Campo de resposta com `autoFocus` ao trocar categoria
- `showDemora` após 10s sem digitação
- BottomBar: anterior | dica + STOP | próxima

### Ajustes pendentes
- [ ] BottomBar STOP: `iconSrc="/icons/btn_stop.png"` (BtnPrimary)
- [ ] BottomBar DICA disponível: `iconSrc="/icons/btn_dica.png"` (BtnSecondary)
- [ ] BottomBar DICA usada: `iconSrc="/icons/btn_dica_usada.png"` (BtnSecondary, disabled)
- [ ] BottomBar ANTERIOR: `iconSrc="/icons/btn_anterior.png"`
- [ ] BottomBar PRÓXIMA: `iconSrc="/icons/btn_proxima.png"`
- [ ] Ícone da letra no header: já usa `/icons/letra_${letter}.png` ✅
- [ ] `showDemora`: imagem `aviso/demora.png` já usada ✅

---

## Estado: `interlude` — STOP disparado

### Implementado
- `cachorra/1.png` (patinhas levantadas) + texto "STOP!" pulsando

### Ajustes pendentes
- [ ] Exibir `icons/btn_stop_text.png` (placa STOP octogonal) acima da cachorra
- [ ] Animação `animate-bounce` na cachorra

---

## Estado: `review` — Correção por categoria

### Implementado
- `ReviewWordCard`: aviso hero 220×220px (`aviso/*.png`)
- Barra de progresso por segmentos
- Pontuação por categoria

### Ajustes pendentes
- [ ] BottomBar ANTERIOR: `iconSrc="/icons/btn_anterior.png"`
- [ ] BottomBar PRÓXIMA / RESUMO: `iconSrc="/icons/btn_proxima.png"` / `iconSrc="/icons/btn_resumo.png"`
- [ ] Última categoria: botão deve ser "RESUMO" com `iconSrc="/icons/btn_resumo.png"`

### Resumo (reviewStep = 'summary')
- Lista de categorias + aviso 56×56px + pontos
- BottomBar: botão RESULTADO

### Ajustes pendentes
- [ ] BottomBar RESULTADO: `iconSrc="/icons/btn_resultado.png"` (BtnPrimary)

---

## Estado: `result` — Resultado

### Implementado
- Cachorra por performance: `≥70%` → pose 2, `≥40%` → pose 3, `<40%` → pose 4
- Pontuação + barra de progresso
- BottomBar: TRILHA + DE NOVO

### Ajustes pendentes
- [ ] Corrigir mapeamento de pose: design doc diz `≥70%` → `5.png` (confetes), `≥40%` → `3.png`, `<40%` → `4.png`
  - Código atual usa `2` no lugar de `5` — **bug**
- [ ] BottomBar TRILHA: `iconSrc="/icons/btn_inicio.png"`
- [ ] BottomBar DE NOVO: `iconSrc="/icons/btn_reiniciar.png"`
- [ ] Mostrar aviso `aviso/vencedor.png` se `≥70%`, `aviso/quase.png` se `≥40%`, `aviso/perdeu.png` se `<40%`
