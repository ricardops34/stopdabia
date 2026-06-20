# Bia STOP — Design & Layout

**Produto:** Bia STOP  
**Público:** crianças e adolescentes de 8 a 17 anos  
**Plataforma:** navegador mobile e desktop  
**Última revisão:** 2026-06-20

---

## Visão do produto

Bia STOP é uma versão digital do jogo STOP clássico com dois modos: **trilha individual** (solo, sem sala) e **multiplayer em tempo real** (sala privada com código). O visual é crochê amigurumi 3D — colorido, fofo e cheio de personalidade.

O jogo funciona **sem login** (modo visitante), mas jogadores autenticados têm acesso a histórico de progresso na trilha e ao ranking geral.

---

## Autenticação

### Modos de acesso

| Modo | Acesso | Progresso da trilha | Ranking geral |
|---|---|---|---|
| **Visitante** | Sem cadastro | `localStorage` (só no dispositivo) | Não |
| **Autenticado** | Login Google ou Apple | Salvo no banco de dados | Sim |

### Login social
- **Google** — OAuth 2.0 via Auth.js (NextAuth v5)
- **Apple** — Sign in with Apple via Auth.js
- Sem senha, sem formulário de cadastro
- Ao fazer login pela primeira vez: escolhe nickname e avatar (salvos no banco)
- Ao fazer login em dispositivo novo: progresso da trilha sincroniza automaticamente

### Fluxo de login
```
Home → botão "Entrar" (opcional)
  → modal com "Continuar com Google" / "Continuar com Apple"
  → callback OAuth
  → se primeiro acesso: tela de escolha de nickname + avatar
  → redireciona de volta para onde estava
```

O botão de login fica discreto na home — o jogo não bloqueia nem exige login para jogar.

### Persistência por modo
- **Visitante:** `localStorage['stop_solo_progress']` + `localStorage['stop_player']`
- **Autenticado:** banco de dados (tabelas `users`, `trail_progress`, `match_results`)
- Ao fazer login estando com progresso local: oferecer migração do localStorage para o banco

---

## Identidade visual

### Estilo gráfico
Todas as imagens seguem o estilo **crochet amigurumi 3D**: objetos e personagens feitos de lã colorida, textura de pontos visível, aparência 3D macia, fundo transparente. Não há elementos flat ou minimalistas — tudo tem volume e cor.

### Paleta de cores (UI)
| Papel | Cor | Hex |
|---|---|---|
| Fundo principal | Navy escuro | `#0a1628` |
| Ação primária | Coral | `#FF6B6B` |
| Destaque / borda | Amarelo | `#FFD93D` |
| Confirmação | Verde | `#2ECC71` |
| Seção Clássico | Coral | `#FF6B6B` |
| Seção Escolar | Teal | `#4ECDC4` |
| Seção Divertido | Roxo | `#9B59B6` |

### Tipografia
- Fonte principal: sistema (sans-serif)
- Labels de botões: 8px, UPPERCASE, weight 700–900
- Títulos de tela: 20–24px, bold

### Mascotes
| Personagem | Descrição | Uso |
|---|---|---|
| **Cachorra** | Boston Terrier preto e branco em crochê, coleira vermelha | Mascote principal — aparece em transições, resultados, home |
| **Menina** | Menina morena de headphone em crochê | Personagem dos avisos de correção |

---

## Componentes de UI reutilizáveis

### BottomBar (`src/components/BottomBar.tsx`)
Barra fixa na base da tela, altura 76px, fundo `#0a1628` com borda superior sutil.  
Slots: `left`, `center`, `right` + `MuteToggle` fixo no canto.

Botões: 56×56px, borderRadius 16.
- **BtnPrimary** — fundo coral `#FF6B6B`, borda amarela 2.5px (ação principal)
- **BtnSecondary** — fundo `rgba(255,255,255,0.08)`, borda sutil (ação secundária)

Fundo da barra: `public/ui/barra_fundo.png` (textura crochê navy)

### Ícones da BottomBar (`public/icons/`)
Todos em crochê 3D, fundo transparente, ~120×120px originais usados em 56×56px no botão.

| Ícone | Arquivo | Estado atual |
|---|---|---|
| STOP! | `btn_stop.png` | ✅ |
| Dica disponível | `btn_dica.png` | ✅ |
| Dica usada | `btn_dica_usada.png` | ✅ |
| Voltar (←) | `btn_voltar.png` | ✅ |
| Avançar (→) | `btn_avançar.png` | ✅ |
| Categoria anterior (<<) | `btn_anterior.png` | ✅ |
| Próxima categoria (>>) | `btn_proxima.png` | ✅ |
| Início/Home | `btn_inicio.png` | ✅ |
| Resumo | `btn_resumo.png` | ✅ |
| Resultado/Troféu | `btn_resultado.png` | ✅ |
| Jogar/Play | `btn_jogar.png` | ✅ |
| Sair da sala | `btn_sair.png` | ✅ |
| Reiniciar | `btn_reiniciar.png` | ✅ |
| Som ativo | `btn_som_on.png` | ✅ |
| Som mudo | `btn_som_off.png` | ✅ |

**Distinção de navegação:**
- `btn_voltar` / `btn_avançar` (seta simples creme) = navegação entre telas
- `btn_anterior` / `btn_proxima` (chevron duplo laranja) = paginação de categorias dentro da rodada

### Avisos de correção (`public/aviso/`)
Imagens da Menina de headphone exibidas em hero (220×220px) durante a revisão.

| Arquivo | Quando |
|---|---|
| `acerto.png` | Resposta correta e única |
| `matando_aula.png` | Resposta duplicada com outro jogador |
| `palavra_nao_existe.png` | IA rejeitou a palavra |
| `da_zero.png` | Sem resposta enviada |
| `demora.png` | >10s sem digitar (durante a rodada) |
| `erro.png` | Falha genérica de validação |
| `erro_sistema.png` | Falha de API / sistema fora ⚠️ renomear |
| `quase.png` | 2º lugar no resultado |
| `perdeu.png` | Último lugar |
| `vencedor.png` | 1º lugar |
| `caixa.png` | Quadro vazio — mensagem genérica sobreposta |
| `dica_extra.png` | Token de dica extra desbloqueado ⚠️ renomear |

### Cachorra — poses semânticas (`public/cachorra/`)
| Arquivo | Pose | Uso |
|---|---|---|
| `1.png` | Patinhas pra cima, animada | STOP disparado (interlude) |
| `2.png` | Em pé, feliz com coleira | Home (sorteio), resultado médio |
| `3.png` | Brincando com bola | Fim da trilha, resultado médio-baixo |
| `4.png` | Escavando terra | Home (sorteio), resultado < 40% |
| `5.png` | Pulando com confetes | Resultado ≥ 70% (vitória!) |

**Mapeamento resultado solo:** `pct ≥ 0.7` → `5.png` · `pct ≥ 0.4` → `3.png` · `pct < 0.4` → `4.png`

---

## Telas e fluxos

### Home (`/`)
- Logo `public/logo.png` como hero
- Cachorra aleatória sorteada entre 1–5
- Três botões: **Jogar Sozinho** · **▶ JOGAR** (criar sala) · **Jogar com Amigos** (entrar com código)

### Trilha individual (`/solo`)

#### Tela: Trilha (trail)
Layout zigzag com 26 nós (letras A–Z), agrupados em 3 seções:
- **Clássico** (A–J) — fundo coral, ícone livro
- **Escolar** (K–R) — fundo teal, ícone capelo
- **Divertido** (S–Z) — fundo roxo, ícone estrela

Cada nó é um círculo com a imagem `public/icons/letra_X.png` por cima de um node background:
- `trail/node_glow.png` — nó atual (dourado com halo) ⏳ a criar
- `trail/node_done.png` — jogado (verde com estrela) ⏳ a criar
- `trail/node_locked.png` — bloqueado (cinza) ⏳ a criar

Conectores entre nós: `trail/fio.png` (corda crochê vertical tileável) ⏳ a criar

Banners de seção: `trail/secao_classica.png`, `trail/secao_escolar.png`, `trail/secao_divertida.png` ⏳ a criar  
→ Ícone à direita, texto da seção renderizado via CSS por cima (65% esquerda liso)

Progresso: `localStorage['stop_solo_progress']` guarda `{letra: {score, maxScore}}`

#### Telas: Config → Revelação → Countdown → Jogando → Revisão → Resultado
- Revelação da letra: `public/letras_sorteio/X.png` (menina com quadro)
- Countdown: `public/contagem/03.png` → `02.png` → `01.png` → `vai.png`
- Easter eggs: sorteados aleatoriamente entre `public/easter/easter_egg_01–13.png` (~20% das rodadas)

### Multiplayer (`/room/[code]`)

#### Tela: Lobby
- Código da sala em destaque
- Lista de jogadores com avatar e nickname
- Host seleciona categorias e tempo
- Avatar: `public/avatar/avatar_01–15.png`

#### Tela: Jogando (paginada)
Uma categoria por vez, com navegação prev/next na BottomBar:
- BottomBar: `btn_anterior` | `btn_dica` · `btn_stop` | `btn_proxima`
- Indicadores de ponto (dots) de quantas categorias há
- Campo grande de resposta com `autoFocus` ao trocar página
- `btn_stop.png` + placa `stop_text.png` na tela de interlude

#### Tela: Revisão (paginada por categoria)
- Uma categoria por vez com prev/next
- Aviso em hero 220×220px (`public/aviso/`)
- BottomBar: `btn_anterior` | `btn_proxima` (ou `btn_resumo` na última)

#### Tela: Resumo multiplayer
- Linha por jogador com avatar + pontos
- Aviso pequeno (48×48px) por resposta
- Cachorra: `1.png` (stopping) ou `5.png` (vencedor)

---

## Sistema de Dica (IA)

- Disponível 1× por rodada (solo e multiplayer)
- Alvo: categoria **atualmente visível** na página (não a primeira com campo vazio)
- Backend: `POST /api/hint` → Groq `llama-3.1-8b-instant` → retorna 1 palavra
- Estado: `hintUsed` (bool) + `hintLoading` (bool), reset a cada nova rodada
- Visual: `btn_dica.png` (disponível) → `btn_dica_usada.png` (esgotado)
- Futuro: sistema de tokens — jogadores acumulam dicas extras em partidas, aviso `dica_extra.png`

---

## Assets pendentes de criação

| Pasta | Arquivos | Status |
|---|---|---|
| `public/trail/` | `fio.png`, `node_done.png`, `node_locked.png`, `node_glow.png` | ⏳ prompts prontos |
| `public/trail/` | `secao_classica.png`, `secao_escolar.png`, `secao_divertida.png` | ⏳ prompts prontos |

Prompts disponíveis em `docs/prompts-faltantes.md`.

---

## Acessibilidade e responsividade

- Layout `height: 100dvh` + `overflow: hidden` — sem scroll da página, só scroll interno
- `pb-24` em containers scrolláveis para não cobrir a BottomBar (76px)
- Alvos de toque mínimo 56×56px (botões da barra)
- Contraste de texto sobre fundo navy
- `key={cat.id}` nos inputs aciona `autoFocus` ao trocar de categoria

---

## Ranking geral

Disponível apenas para jogadores autenticados. Exibe:
- Posição do jogador entre todos os usuários
- Pontuação total acumulada na trilha
- Avatar e nickname
- Zona de promoção/rebaixamento (inspirado no Duolingo — ref: `imagens de referencia/29_ranking-demotion-zone.png`)

Atualizado após cada rodada da trilha concluída.

---

## Non-goals (MVP)

- Autenticação com e-mail e senha (apenas social login)
- Categorias livres criadas pelo usuário
- Matchmaking público
- Chat em sala
- Múltiplos idiomas
- Moderação avançada de conteúdo
