Same visual style as my STOP ADEDONHA home screen: dark navy fabric texture, crochet amigurumi aesthetic, same color palette.

Create TWO screens for "STOP ADEDONHA" — show them as separate sections/tabs in the preview.

═══════════════════════════════════
SCREEN A: Round Summary (Resumo)
═══════════════════════════════════
Background #1A1A2E. Scrollable. 390×844px.

HEADER (shrink-0, px-4 pt-5 pb-3, flex row):
- Circular badge 44×44px (bg #FFD93D, crochet letter "B" 34px)
- "Resumo" — xl bold white flex-1

LIST (flex-col gap-2, px-4):
6 answer rows, each a card: rounded 16px, bg #0F3460, px-4 py-3, flex row, gap-3, items-center

Row structure: [feedback icon] [category + answer] [points]
- Feedback icon: image placeholder 56×56px (label "crochet amigurumi girl — happy/sad/neutral expression")
- Left content (flex-1, flex-col, min-w-0):
  - Category name: xs white 50%
  - Answer: base bold truncate, colored (green #95E06C valid, red #FF6B6B invalid, white 25% empty "—")
- Points: base extrabold shrink-0, min-w-8 text-right (#FFD93D if >0, white 25% if 0)

Sample rows:
1. icon | "Animal" / "Baleia" (green) | "+15" yellow
2. icon | "Nome" / "Bruno" (green, note: duplicate) | "+10" yellow
3. icon | "Cor" / "Bege" (green) | "+15" yellow
4. icon | "Fruta" / "—" (empty white) | "0" faded
5. icon | "Objeto" / "Bola" (green) | "+15" yellow
6. icon | "Profissão" / "Bombeiro" (red) | "0" faded

TOTAL ROW (rounded 16px, bg #16213E, px-4 py-3, flex justify-between):
- "Total" bold white 70%
- "55 / 90" — 24px bold #FFD93D

BOTTOM BAR (fixed 76px):
- RIGHT: primary button 74×74px, 🏆 trophy icon, label "RESULTADO", bg #4ECDC4, border #FFD93D, pulse
- FAR RIGHT: mute "SOM"

═══════════════════════════════════
SCREEN B: Final Result (Resultado)
═══════════════════════════════════
Background #1A1A2E. Centered vertically. No scroll. 390×844px.

CONTENT (flex-col, items-center, gap-6, px-4, py-8, max-w-md mx-auto):
- Mascot image placeholder 200×200px — label "Boston Terrier crochet amigurumi dog jumping with colorful confetti — celebratory pose" — bounce-in animation
- "55 pontos!" — 32px bold, #FFD93D
- "de 90 possíveis com a letra B" — 14px white 60%
- Progress bar: full width, h-4 rounded-full, track bg #0F3460, fill bg #95E06C, width ~61%

BOTTOM BAR (fixed 76px):
- CENTER-LEFT: secondary button 56×56px, 🗺️ map icon, label "TRILHA"
- CENTER-RIGHT: primary button 74×74px, 🔄 reload icon, label "DE NOVO", bg #FF6B6B, border #FFD93D, pulse
- FAR RIGHT: mute "SOM"
