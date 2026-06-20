# Inventário de Assets — STOP ADEDONHA

## Estilo visual
Todas as imagens seguem o estilo **crochet amigurumi 3D** — personagens e ícones feitos de lã, cores vibrantes, fundo transparente (PNG) ou branco/preto.

---

## ✅ Assets existentes

### Logo
| Arquivo | Uso atual |
|---|---|
| `public/logo.png` | Header de todas as telas, hero da home |

### Cachorra (mascote)
| Arquivo | Pose | Uso atual |
|---|---|---|
| `public/cachorra/1.png` | Patinhas pra cima, animada | STOP! (interlude solo + stopping multiplayer) |
| `public/cachorra/2.png` | Em pé, feliz | Home screen (aleatório 1–4) |
| `public/cachorra/3.png` | Brincando com bola | Fim da trilha individual |
| `public/cachorra/4.png` | Cavoucando terra | Home screen (aleatório 1–4) |

**Resultado solo — pose por pontuação:**
- ≥ 70% → `2.png` (feliz)
- ≥ 40% → `3.png` (jogando)
- < 40% → `4.png` (cavoucando)

### Letras do alfabeto
| Pasta | Formato | Uso |
|---|---|---|
| `public/letras/letra_a.png` … `letra_z.png` | minúsculo | Cabeçalho do review, nós da trilha, header do playing |
| `public/letras/A.png` … `Z.png` | maiúsculo | LetterReveal (tela de revelação da letra) |

### Contagem regressiva
| Arquivo | Uso |
|---|---|
| `public/contagem/03.png` | Countdown: 3 |
| `public/contagem/02.png` | Countdown: 2 |
| `public/contagem/01.png` | Countdown: 1 |
| `public/contagem/vai.png` | Countdown: VAI! |

### Avisos de correção
| Arquivo | Significado | Quando aparece |
|---|---|---|
| `public/aviso/acerto.png` | Resposta correta e única | Validação OK, sem duplicata |
| `public/aviso/matando_aula.png` | Duplicata (mesmo que outro jogador) | Resposta duplicada |
| `public/aviso/palavra_nao_existe.png` | IA rejeitou a palavra | Validação negativa |
| `public/aviso/da_zero.png` | Campo vazio | Sem resposta |
| `public/aviso/demora.png` | Demorando pra responder | Após 10s sem digitar nada |
| `public/aviso/erro.png` | Erro de sistema | Falha na API de validação |
| `public/aviso/vencedor.png` | 1º lugar | Tela de resultado (posição 1) |
| `public/aviso/quase.png` | 2º lugar | Tela de resultado (posição 2, >2 jogadores) |
| `public/aviso/perdeu.png` | Último lugar | Tela de resultado (último, >1 jogador) |

### Avatares dos jogadores
| Arquivo | Uso |
|---|---|
| `public/avatar/avatar_01.png` … `avatar_15.png` | Seleção de avatar na home, lobby, review multiplayer |

### Easter eggs (aparecem ~20% das rodadas)
| Arquivo | Uso |
|---|---|
| `public/easter/easter_egg_01.png` … `easter_egg_N.png` | Tela de countdown aleatória |

---

## ❌ Assets faltantes

### Barra inferior (UI)
| Arquivo | Descrição |
|---|---|
| `public/ui/barra_fundo.png` | Textura/fundo da barra fixa inferior |
| `public/icons/btn_voltar.png` | Seta ← (navegar categoria anterior / voltar) |
| `public/icons/btn_avancar.png` | Seta → (navegar próxima categoria) |
| `public/icons/btn_stop.png` | Mão levantada (botão STOP!) |
| `public/icons/btn_dica.png` | Lâmpada acesa (dica disponível) |
| `public/icons/btn_dica_usada.png` | Checkmark verde (dica já usada) |
| `public/icons/btn_som_on.png` | Alto-falante com ondas (som ativo) |
| `public/icons/btn_som_off.png` | Alto-falante cortado (mudo) |
| `public/icons/btn_inicio.png` | Casa (voltar à home) |
| `public/icons/btn_resumo.png` | Clipboard (ir ao resumo) |
| `public/icons/btn_resultado.png` | Troféu (ver resultado) |
| `public/icons/btn_jogar.png` | Play ▶ (iniciar jogo) |
| `public/icons/btn_sair.png` | Porta (sair da sala) |
| `public/icons/btn_reiniciar.png` | Seta circular (jogar de novo) |

### Trilha individual
| Arquivo | Descrição |
|---|---|
| `public/trail/fio.png` | Segmento de fio/corda entre nós (tile vertical, 16×80px) |
| `public/trail/node_done.png` | Nó já jogado (círculo cheio, sem letra — letra sobreposta via código) |
| `public/trail/node_locked.png` | Nó bloqueado (círculo cinza) |
| `public/trail/node_glow.png` | Nó atual/ativo (brilho amarelo) |
| `public/trail/secao_classica.png` | Banner seção Clássico (vermelho, livro) |
| `public/trail/secao_escolar.png` | Banner seção Escolar (teal, capelo) |
| `public/trail/secao_divertida.png` | Banner seção Divertido (roxo, estrela) |

### Outros
| Arquivo | Descrição |
|---|---|
| `public/cachorra/5.png` | Pose extra: cachorra pulando/celebrando (para vitória total) |
| `public/ui/stop_text.png` | Palavra "STOP!" em crochê (para tela de interlude maior) |
