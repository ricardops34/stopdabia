# Bia STOP

Jogo de `STOP` multiplayer para `celular` e `computador`, com visual moderno, ritmo rápido e foco em partidas em grupo.

## Visao do jogo

`Bia STOP` transforma o STOP classico em uma experiencia web social, colorida e responsiva, pensada para criancas e adolescentes.

O jogo foi desenhado para funcionar direto no navegador, sem instalacao obrigatoria, com fluxo simples:

- `Jogar` cria uma sala
- `Jogar com amigos` entra em uma sala por codigo
- `Jogar sozinho` abre um modo local de treino

## Caracteristicas principais

- multiplayer por `sala privada com codigo`
- jogo para `mobile` e `desktop`
- visual vibrante com identidade propria
- tela inicial baseada em arte do jogo
- botoes grandes e acessiveis para toque
- modo `hibrido` entre STOP classico e partida rapida
- validacao `mista`, combinando regra automatica e revisao do grupo
- categorias definidas pelo `host` a partir de uma lista pronta
- fluxo preparado para `criar sala`, `entrar na sala` e `treino solo`

## Regras do jogo

No `Bia STOP`, cada partida acontece em rodadas.

Fluxo base da rodada:

1. O `host` cria a sala e escolhe as categorias da partida.
2. Os jogadores entram usando o codigo da sala.
3. A rodada comeca com uma `letra sorteada`.
4. Todos precisam preencher as categorias usando palavras que comecem com essa letra.
5. A rodada termina quando o tempo acaba ou quando alguem aperta `STOP`.
6. As respostas passam por validacao.
7. O sistema calcula os pontos da rodada.
8. O ranking e atualizado para a proxima rodada.

### Regras do MVP

- as categorias sao escolhidas pelo `host` a partir de uma `lista pronta`
- cada sala usa entre `5 e 8 categorias`
- o jogo funciona com `tempo maximo por rodada`
- o botao `STOP` pode encerrar a rodada antes do tempo final
- respostas vazias nao pontuam
- respostas invalidas nao pontuam
- respostas duvidosas podem ser avaliadas pelo grupo
- a validacao e `mista`: parte automatica e parte social
- vence quem somar mais pontos ao final das rodadas

### Exemplos de categorias

- nome
- animal
- cor
- cidade
- comida
- objeto
- profissao
- pais
- verbo
- personagem

## Publico

O MVP foi pensado para jogadores de `8 a 17 anos`, com linguagem visual amigavel, interface clara e uso simples em telas pequenas.

## Estado atual

Hoje o projeto ja possui:

- home inicial em tela cheia com `inicio.png`
- navegacao inicial para `host`, `join` e `solo`
- favicon configurado
- base em `Next.js + TypeScript`
- testes iniciais com `Vitest` e `Testing Library`

## Roadmap do MVP

Proximas entregas previstas:

- tela real de `criar sala`
- tela real de `entrar com codigo`
- lobby com configuracao de categorias
- sincronizacao multiplayer em tempo real
- rodada com cronometro e botao `STOP`
- revisao das respostas e pontuacao
- placar final

## Stack

- `Next.js`
- `React`
- `TypeScript`
- `Tailwind CSS`
- `Vitest`
- `Testing Library`

## Como rodar

Instale as dependencias:

```bash
npm install
```

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

Abra no navegador:

```text
http://localhost:3000
```

## Como testar

Rodar testes:

```bash
npm test
```

Rodar lint:

```bash
npx eslint src/app/page.tsx src/app/page.test.tsx src/app/host/page.tsx src/app/host/page.test.tsx src/app/join/page.tsx src/app/join/page.test.tsx src/app/solo/page.tsx src/app/solo/page.test.tsx src/app/layout.tsx src/test/setup.ts vitest.config.ts --max-warnings 0
```

Gerar build:

```bash
npm run build
```

## Estrutura inicial

```text
src/app/page.tsx       -> tela inicial
src/app/host/page.tsx  -> criar sala
src/app/join/page.tsx  -> entrar na sala
src/app/solo/page.tsx  -> treino solo
public/inicio.png      -> arte principal da abertura
public/favico.png      -> icone do jogo
```

## Repositorio

Remote configurado:

```text
origin https://github.com/ricardops34/stopdabia.git
```
