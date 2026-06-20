# Prompts de Criação — Trilha Individual (`public/trail/`)

## Referências obrigatórias para anexar ao gerar

| Imagem | Por que usar |
|---|---|
| `public/icons/letra_a.png` | Estilo do patch de letra (cloud roxo + letra amarela) |
| `public/icons/letra_b.png` | Segunda cor (patch roxo + letra vermelha) — confirmar variação |
| `public/avatar/avatar_01.png` | Anel circular crochê: roxo externo → creme intermediário → teal interno |
| `public/ui/barra_fundo.png` | Tom navy escuro (#0a1628) do fundo do jogo |
| `public/cachorra/5.png` | Estilo de confetes e celebração (para node_done) |

---

## Prompt base universal

> Crochet amigurumi icon, thick fluffy yarn texture, soft 3D look, handmade cozy aesthetic,
> vibrant saturated colors, isolated on transparent background, no text, no letters,
> same art style as the reference image provided

Cole antes de qualquer prompt específico abaixo.

---

## 1. `fio.png` — Conector vertical entre nós

**Pasta:** `public/trail/`  
**Dimensões:** 20 × 100 px, PNG fundo transparente  
**Uso no código:** tile repetido entre dois nós da trilha; fica centralizado na coluna

```
Vertical segment of thick braided crochet rope / yarn cord,
cream white color, tightly twisted/braided texture, 3D raised look,
soft rounded ends at top and bottom (frayed yarn tips),
very narrow strip (20px wide, 100px tall),
isolated on transparent background, no background fill, no shadows,
same handmade crochet aesthetic as reference
```

> **Dica:** peça 3 ou 4 variações e escolha a que tile melhor (sem marca de corte visível no topo/base).

---

## 2. `node_done.png` — Nó completo (letra já jogada)

**Pasta:** `public/trail/`  
**Dimensões:** 140 × 140 px, PNG fundo transparente  
**Uso no código:** círculo de fundo atrás de `<Image src="/icons/letra_X.png">` — a imagem da letra fica sobreposta no centro  
**Estado:** letra já foi jogada nesta rodada

```
Crochet circular badge / coin, flat round disc shape,
outer thick ring in deep forest green (#2ECC71) crochê yarn,
middle thin ring in cream/off-white blanket-stitch yarn,
inner flat circle in medium green (#27AE60) crochet fabric fill,
small golden 5-pointed star emblem stitched in center (the letter image will overlay this),
top-right tiny golden star confetti detail,
3D slightly puffy look with soft drop shadow below,
transparent background, 140x140px,
same crochet amigurumi art style as avatar reference
```

---

## 3. `node_locked.png` — Nó bloqueado (ainda não desbloqueado)

**Pasta:** `public/trail/`  
**Dimensões:** 140 × 140 px, PNG fundo transparente  
**Uso no código:** substitui o node quando a letra ainda não está disponível

```
Crochet circular badge / coin, flat round disc shape,
outer thick ring in dark charcoal grey (#3A3A4A) crochê yarn,
middle thin ring in medium grey (#5A5A6A) yarn,
inner flat circle in dark navy-grey (#2A2A3E) crochet fabric fill,
small crochet padlock icon stitched in center (simple lock silhouette, same grey tones),
overall desaturated, muted, dim — looks sealed/locked,
no bright colors, no confetti,
3D slightly flat (less puffy than done node),
transparent background, 140x140px,
same crochet amigurumi art style as avatar reference
```

---

## 4. `node_glow.png` — Nó atual/ativo (próxima letra a jogar)

**Pasta:** `public/trail/`  
**Dimensões:** 140 × 140 px, PNG fundo transparente  
**Uso no código:** destaca a letra que o jogador deve jogar agora; letra sobreposta no centro

```
Crochet circular badge / coin, flat round disc shape,
outer thick ring in warm golden yellow (#FFD93D) crochê yarn,
middle thin ring in bright cream/white blanket-stitch yarn,
inner flat circle in deep golden amber (#F39C12) crochet fabric fill,
glowing golden-white halo / aura radiating outward from the ring (like Duolingo active node),
subtle sparkle dots (4–6) around the halo in white and yellow,
3D very puffy look with bright inner highlight,
transparent background, 140x140px,
same crochet amigurumi art style as avatar reference
```

> **Importante:** o brilho deve ser difuso (glow), não um contorno duro. A lupa no editor: verifique se o brilho não corta em 140px — peça pelo menos 160px e corte centrado.

---

## 5. `secao_classica.png` — Banner seção "Clássico"

**Pasta:** `public/trail/`  
**Dimensões:** 380 × 80 px, PNG arredondado (border-radius equivalente ~20px)  
**Uso no código:** banner horizontal que separa grupos de letras na trilha; texto "CLÁSSICO" renderizado via CSS por cima

```
Wide horizontal crochet banner / patch, rounded rectangle shape (380x80px),
background fill in warm coral red (#FF6B6B) dense crochet knit fabric,
thick embroidered cream border all around (blanket stitch, ~6px),
left 65% of banner: flat red crochet surface (smooth, for text overlay — no icons here),
right 25% of banner: small 3D crochet open book icon in cream/white yarn,
  book has two open pages visible, slight 3D raised look,
far right 10%: slight darker red vignette edge,
no text, no letters, transparent background,
same art style as reference
```

---

## 6. `secao_escolar.png` — Banner seção "Escolar"

**Pasta:** `public/trail/`  
**Dimensões:** 380 × 80 px, PNG arredondado  
**Uso no código:** igual ao clássico mas cor e ícone diferentes; texto "ESCOLAR" via CSS

```
Wide horizontal crochet banner / patch, rounded rectangle shape (380x80px),
background fill in teal (#4ECDC4) dense crochet knit fabric,
thick embroidered cream border all around (blanket stitch, ~6px),
left 65% of banner: flat teal crochet surface (smooth, for text overlay — no icons),
right 25% of banner: small 3D crochet graduation cap (mortarboard) icon,
  cap in dark navy yarn, flat top with teal tassel hanging to the right,
far right 10%: slight darker teal vignette edge,
no text, no letters, transparent background,
same art style as reference
```

---

## 7. `secao_divertida.png` — Banner seção "Divertido"

**Pasta:** `public/trail/`  
**Dimensões:** 380 × 80 px, PNG arredondado  
**Uso no código:** igual aos anteriores; texto "DIVERTIDO" via CSS

```
Wide horizontal crochet banner / patch, rounded rectangle shape (380x80px),
background fill in vivid purple (#9B59B6) dense crochet knit fabric,
thick embroidered golden-yellow border all around (blanket stitch, ~6px),
left 65% of banner: flat purple crochet surface (smooth, for text overlay — no icons),
right 25% of banner: small 3D crochet five-pointed star icon,
  star in bright yellow yarn, puffy 3D raised, gold outline stitch,
  2–3 tiny sparkle dots around the star,
far right 10%: slight darker purple vignette edge,
no text, no letters, transparent background,
same art style as reference
```

---

## Dicas de geração

### Tamanho dos nós (node_*.png)
Os patches de letra (`icons/letra_a.png`) têm ~300×300px e forma de cloud.  
O nó fica **atrás** da letra como anel colorido — gere com **centro vazio ou neutro**, porque a letra cobre essa área.  
Se a ferramenta não aceitar imagem com "buraco", peça a cor central neutra mais próxima do fundo do jogo (`#0a1628`).

### Banners de seção
O texto ("CLÁSSICO" / "ESCOLAR" / "DIVERTIDO") é renderizado em CSS por cima da imagem.  
Os 65% da esquerda devem ser **lisos e uniformes** — evitar textura grossa ou padrão que compita com o texto.

### Ferramentas
- **Midjourney:** use `--ar 19:4` para os banners (380×80), `--ar 1:1` para nós e fio; adicione `--style raw --v 6 --sref` com as referências
- **DALL-E 3:** descreva "same style as the crochet amigurumi images attached" + cole o prompt
- **Adobe Firefly:** "Text to Image" com estilo "Craft and Textile" selecionado
- **Stable Diffusion:** IP-Adapter com `avatar_01.png` como referência de estilo

### Checklist antes de aprovar
- [ ] Fundo transparente (PNG)
- [ ] Dimensões corretas (nós 140×140, fio 20×100, banners 380×80)
- [ ] Nenhum texto ou letra visível na imagem
- [ ] Centro dos nós sem ícone forte (área livre para a letra sobreposta)
- [ ] Banners: 65% esquerda liso, ícone apenas na direita
- [ ] Estilo crochê 3D consistente com `avatar_01.png` e `icons/letra_a.png`
