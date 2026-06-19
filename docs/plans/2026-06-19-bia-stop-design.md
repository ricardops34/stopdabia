# Bia STOP Design

**Product:** `Bia STOP`

**Audience:** crianças e adolescentes de `8 a 17 anos`

**Platform:** navegador em `celular` e `desktop`

## Product Vision

`Bia STOP` é um jogo multiplayer em tempo real inspirado no STOP clássico, com visual moderno, energético e animado. O foco do MVP é permitir que um grupo entre rapidamente em uma sala privada, configure a partida, jogue rodadas curtas e valide respostas em conjunto.

O produto precisa funcionar bem em telas pequenas, ter baixa fricção de entrada e transmitir uma identidade social e competitiva sem parecer infantil demais.

## Accessibility And Responsiveness

Esses requisitos são centrais no produto, não acabamento:

- mobile-first em toda tela principal
- layout funcional em celular e desktop sem perda de fluxo
- alvos de toque grandes
- contraste suficiente em textos e ações principais
- navegação por teclado e landmarks semânticos
- textos e estados claros para jogadores mais novos

## MVP Decisions

- Entrada por `sala privada com código`
- Ritmo de jogo `híbrido`
- Validação `mista`
- Público `8 a 17 anos`
- Rodada com `tempo máximo + botão STOP`
- Categorias `clássicas + escolares`
- Categorias escolhidas pelo `host` a partir de uma `lista pronta`

## Core Experience

O fluxo principal do MVP é:

1. Jogador abre a home
2. Cria sala ou entra com código
3. Host escolhe categorias e parâmetros da partida
4. Jogadores entram na sala
5. Host inicia a partida
6. Servidor sorteia letra e abre a rodada
7. Jogadores preenchem respostas
8. Rodada termina por tempo ou por `STOP`
9. Sistema faz validação básica
10. Grupo vota nos casos discutíveis
11. Pontos são calculados
12. Ranking é exibido
13. Próxima rodada ou fim de jogo

## Room Rules

O criador da sala atua como `host` e controla:

- início da partida
- seleção de categorias da lista pronta
- quantidade de rodadas
- tempo por rodada

Para o MVP, a sala deve permitir algo entre `5` e `8` categorias por partida. A biblioteca inicial precisa incluir grupos como:

- clássicas
- escolares
- divertidas

Exemplos de categorias para o MVP:

- nome
- animal
- cor
- cidade
- comida
- objeto
- profissão
- país
- verbo
- personagem

## Match Flow

A sala precisa compartilhar uma máquina de estados sincronizada:

- `lobby`
- `countdown`
- `playing`
- `stopping`
- `review`
- `scoreboard`
- `finished`

Todas as mudanças de estado precisam ser definidas pelo servidor para impedir inconsistências entre clientes.

## Validation Model

A validação do MVP será `mista`:

- o sistema rejeita vazios e formatos claramente inválidos
- o sistema pode marcar respostas duplicadas exatas quando necessário para pontuação
- respostas duvidosas seguem para votação dos jogadores

Esse modelo mantém o ritmo sem remover o aspecto social do STOP.

## Visual Direction

A identidade visual deve ser vibrante e atual, com sensação de game social. Direção recomendada:

- tipografia expressiva e legível
- paleta com `coral`, `amarelo`, `azul piscina` e `verde lima`
- fundos com gradientes e formas orgânicas
- cards grandes e botões com alto contraste
- elementos de interface com bastante presença em mobile

## Animation Direction

As animações devem valorizar os momentos de maior tensão:

- entrada dramática da letra da rodada
- pulso visual do botão `STOP`
- cronômetro com urgência crescente
- transição curta entre rodada, revisão e placar
- feedback animado de pontuação e mudança de ranking

## Technical Direction

Arquitetura recomendada para o MVP:

- `Next.js` no frontend e backend app layer
- `TypeScript`
- comunicação em tempo real com `Socket.IO`
- persistência em `PostgreSQL`
- apelido temporário sem cadastro obrigatório

## Non-Goals For MVP

- categorias livres criadas por texto
- autenticação completa com conta e senha
- matchmaking público
- chat complexo
- múltiplos modos de jogo paralelos
- moderação avançada

## Success Criteria

O MVP está correto quando:

- jogadores conseguem criar e entrar em salas pelo celular e desktop
- a interface se mantém legível e operável em celular e computador
- a sala sincroniza rodadas corretamente
- o host consegue escolher categorias da lista pronta
- a rodada termina por tempo ou `STOP`
- respostas podem ser revisadas com votação simples
- o ranking final é exibido de forma clara e animada
