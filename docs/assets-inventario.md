# Inventário de Assets — STOP ADEDONHA

> Última revisão: 2026-06-20 (trail/ concluída)  
> Estilo visual: **crochet amigurumi 3D** — lã, cores vibrantes, fundo transparente (PNG) ou fundo sólido.

---

## 🐾 Cachorra (mascote)

| Arquivo | Pose / Visual | Uso no jogo |
|---|---|---|
| `public/cachorra/1.png` | Filhote frente, patinhas levantadas, animado | STOP disparado (interlude solo + stopping multiplayer) |
| `public/cachorra/2.png` | De lado, em pé, sorrindo com coleira | Home screen (sorteio 1–5), resultado médio |
| `public/cachorra/3.png` | Deitada brincando com bola rosa | Fim da trilha individual, resultado médio-baixo |
| `public/cachorra/4.png` | Escavando terra, focada | Home screen (sorteio 1–5), resultado ruim (< 40%) |
| `public/cachorra/5.png` | Pulando com confetes coloridos | Resultado excelente (≥ 70%), vitória total |

**Mapeamento resultado solo:**
- `pct >= 0.7` → `5.png` (pulando/celebrando)
- `pct >= 0.4` → `3.png` (brincando)
- `pct < 0.4` → `4.png` (escavando)

---

## ✉️ Avisos de correção

> Personagem: menina morena de headphone em estilo crochê.  
> ⚠️ Dois arquivos têm espaço no nome — usar `encodeURIComponent` ou renomear.

| Arquivo | Visual | Quando usar |
|---|---|---|
| `public/aviso/acerto.png` | Menina dançando, "ACERTOU! MANDOU BEM! MUITO BEM!" | Resposta correta e única |
| `public/aviso/matando_aula.png` | (menina com expressão) | Resposta duplicada com outro jogador |
| `public/aviso/palavra_nao_existe.png` | (menina negando) | IA rejeitou a palavra |
| `public/aviso/da_zero.png` | (campo vazio / menina sem resposta) | Sem resposta enviada |
| `public/aviso/demora.png` | (menina impaciente) | > 10s sem digitar nada |
| `public/aviso/erro.png` | (menina preocupada) | Falha genérica na validação |
| `public/aviso/erro sistema.png` ⚠️ | Menina brava com triângulo de alerta `!` | Falha de API / sistema fora |
| `public/aviso/quase.png` | (menina animada) | 2º lugar no resultado |
| `public/aviso/perdeu.png` | (menina triste) | Último lugar no resultado |
| `public/aviso/vencedor.png` | (menina comemorando) | 1º lugar no resultado |
| `public/aviso/caixa.png` | Menina apontando para quadro **vazio** | Aviso genérico / caixa de mensagem sobreposta |
| `public/aviso/dica extra.png` ⚠️ | Menina segurando cartaz "Dica Extra" + lâmpada | Token de dica extra desbloqueado |

---

## 🔤 Letras do alfabeto

### Revelação da letra (tela de sorteio)
| Pasta | Visual | Uso |
|---|---|---|
| `public/letras_sorteio/A.png` … `Z.png` | Menina com quadro mostrando a letra (fundo escuro) | Tela `LetterReveal` — exibição da letra sorteada |

### Nós da trilha individual
| Pasta | Visual | Uso |
|---|---|---|
| `public/icons/letra_a.png` … `letra_z.png` | Letra em crochê amarelo/dourado com fundo roxo | Nó da trilha — ícone dentro do círculo de cada letra |

---

## 🎛️ Ícones da barra inferior e navegação

> Todos em `public/icons/`, fundo transparente, estilo crochet 3D.

| Arquivo | Visual | Função |
|---|---|---|
| `btn_stop.png` | Mão vermelha em octógono vermelho | Botão principal STOP! (encerrar rodada) |
| `btn_dica.png` | Lâmpada amarela brilhando | Dica disponível (1 uso por rodada) |
| `btn_dica_usada.png` | Lâmpada **cinza apagada** (mesma forma que btn_dica) | Dica já utilizada na rodada |
| `btn_voltar.png` | Seta ← creme (simples) | Voltar / cancelar |
| `btn_anterior.png` | Dupla seta << laranja | Categoria anterior (nav paginação) |
| `btn_proxima.png` | Dupla seta >> laranja | Próxima categoria (nav paginação) |
| `btn_avançar.png` | Seta → creme (simples, par do btn_voltar) | Avançar / confirmar |
| `btn_inicio.png` | Casinha rosa com telhado | Voltar à home |
| `btn_resumo.png` | Clipboard roxo com lista | Ir ao resumo/resultado |
| `btn_reiniciar.png` | Setas circulares teal (refresh) | Jogar de novo |
| `btn_som_on.png` | Speaker teal com ondas sonoras | Som ativo (toggle mute) |
| `btn_som_off.png` | Speaker cinza cortado | Som mudo (toggle mute) |
| `stop_text.png` | Placa STOP octogonal em crochê (com texto) | Hero interlude / tela de STOP disparado |
| `grupo.png` | Sprite sheet com todos os ícones juntos | Referência visual (não usar em código) |

---

## ⏱️ Contagem regressiva

| Arquivo | Exibe | Uso |
|---|---|---|
| `public/contagem/03.png` | "3" com personagem | Countdown 3 |
| `public/contagem/02.png` | "2" com personagem | Countdown 2 |
| `public/contagem/01.png` | "1" com personagem | Countdown 1 |
| `public/contagem/vai.png` | "VAI!" | Largada |

---

## 🎨 Interface (UI)

| Arquivo | Visual | Uso |
|---|---|---|
| `public/ui/barra_fundo.png` | Tira dark navy (~800×80px) textura crochê | Fundo da `BottomBar` fixa |
| `public/logo.png` | Logo "STOP ADEDONHA" colorido | Hero da home, header |
| `public/favico.png` | Ícone do site | favicon |

---

## 👤 Avatares dos jogadores

| Pasta | Quantidade | Uso |
|---|---|---|
| `public/avatar/avatar_01.png` … `avatar_15.png` | 15 opções | Seleção na home, lobby multiplayer, review |

---

## 🥚 Easter eggs

| Pasta | Quantidade | Uso |
|---|---|---|
| `public/easter/easter_egg_01.png` … `easter_egg_13.png` | 13 imagens | Aparece aleatoriamente na tela de countdown (~20% das rodadas) |

---

## 🖼️ Imagens de referência (só para design)

| Pasta | Quantidade | Uso |
|---|---|---|
| `public/imagens de referencia/` | 55 screenshots | Referência visual do Duolingo — **não usar no jogo** |

---

## ✅ Trilha individual (`public/trail/`) — concluída

| Arquivo | Descrição | Status |
|---|---|---|
| `fio.png` | Segmento de fio/corda vertical entre nós | ✅ criado |
| `fio_bg.png` | Variante com fundo (uso a definir) | ✅ criado |
| `node_done.png` | Nó completo — círculo cheio colorido | ✅ criado |
| `node_locked.png` | Nó bloqueado — círculo cinza apagado | ✅ criado |
| `node_glow.png` | Nó atual/ativo — círculo dourado com halo | ✅ criado |
| `secao_classica.png` | Banner seção Clássico — vermelho + ícone livro | ✅ criado |
| `secao_escolar.png` | Banner seção Escolar — teal + capelo | ✅ criado |
| `secao_divertida.png` | Banner seção Divertido — roxo + estrela | ✅ criado |

---

## ❌ Assets ainda faltantes

Nenhum asset pendente no momento. 🎉

### Botões concluídos recentemente (`public/icons/`)
| Arquivo | Visual | Função |
|---|---|---|
| `btn_resultado.png` | Troféu dourado com confetes coloridos | Tela de resultado final |
| `btn_jogar.png` | Triângulo play laranja | Iniciar partida |
| `btn_sair.png` | Porta arredondada com seta branca de saída | Sair da sala multiplayer |

---

## ⚠️ Problemas a corrigir

| Problema | Arquivo(s) | Ação |
|---|---|---|
| Espaço no nome do arquivo | `aviso/dica extra.png`, `aviso/erro sistema.png` | Renomear para `dica_extra.png` e `erro_sistema.png` |
| `btn_dica_usada.png` não visualizada | `icons/btn_dica_usada.png` | Confirmar visual e uso no código |
| Dois pares de navegação com função similar | `btn_voltar`/`btn_avançar` (creme) vs `btn_anterior`/`btn_proxima` (laranja) | Definir quando usar cada par para evitar inconsistência |
