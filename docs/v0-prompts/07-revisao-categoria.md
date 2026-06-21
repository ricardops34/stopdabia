Same visual style as my STOP ADEDONHA home screen: dark navy fabric texture, crochet amigurumi aesthetic, same color palette.

Create a mobile-first review card screen for "STOP ADEDONHA". Background #1A1A2E. 390×844px.

After each round, players review one category at a time. This shows category 2 of 6 (Animal, letter B).

HEADER (fixed top, shrink-0, px-4 pt-5 pb-3):
- Row: circular badge 40×40px (bg #FFD93D, crochet letter "B" placeholder 30px) + "Animal" (xl bold #FFD93D flex-1) + "2/6" (sm white 40%)
- Progress bar below: 6 equal segments side by side, gap-1, h-1.5 rounded-full each.
  - Segments 1–2: bg #4ECDC4 (reviewed)
  - Segments 3–6: bg #0F3460 (pending)

CENTER CONTENT (flex-1, flex-col, items-center, justify-center, px-6, pb-24, gap-4):

1. Answer card: full width, rounded 16px, bg #0F3460, py-4 px-6, text-center
   - "Sua resposta" label — 10px bold uppercase tracked, white 50%, mb-1
   - "Baleia" — 32px extrabold, color #95E06C (green = valid)
   - (Show variant with #FF6B6B for invalid, and rgba(255,255,255,0.15) for empty "—")

2. Feedback character image placeholder 220×220px — label "Crochet amigurumi girl with headphone, happy expression, thumbs up — 'ACERTOU! MANDOU BEM!' text visible"
   drop-shadow-2xl, objectFit contain

3. Points badge: pill shape (px-8 py-2 rounded-full), bg rgba(255,217,61,0.15)
   - "+15 pontos" — 24px extrabold, #FFD93D
   - (Variant: "Zero pontos" with white 25% color and no bg tint)

BOTTOM BAR (fixed 76px, dark navy):
- LEFT slot: secondary button 56×56px, "←" arrow, label "ANTERIOR"
- RIGHT slot: primary button 74×74px, bg #4ECDC4, border #FFD93D, "→" icon, label "PRÓXIMA" 9px extrabold white
  (Last card variant: bg #FF6B6B, clipboard icon 📋, label "RESUMO", pulse)
- FAR RIGHT: mute toggle 56×56px, label "SOM"
