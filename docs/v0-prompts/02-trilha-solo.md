IMPORTANT RULES — READ FIRST:
- Output a single self-contained React component (no external imports beyond react, tailwind classes, and lucide-react icons)
- NO Supabase, NO NextAuth, NO API calls, NO router, NO backend of any kind
- NO next/image — use plain <img> tags with placeholder src="/placeholder.svg" or a gray div
- All data is hardcoded/static inside the component
- Use only inline styles + tailwind classes
- The component must render and preview without any errors
---

Same visual style as my STOP ADEDONHA home screen: dark navy fabric texture, crochet amigurumi aesthetic, same color palette.

Create a mobile-first solo trail/map screen for "STOP ADEDONHA". Dark navy fabric-textured background (#0D1B2A). 390×844px, scrollable content.

HEADER (fixed, shrink):
- Centered compact "STOP ADEDONHA" logo placeholder 140px wide, crochet patch style

SCROLLABLE TRAIL (3 sections, each with a banner + zigzag nodes):

SECTION 1 — CLÁSSICO:
- Banner: 68px tall, rounded 16px. Image placeholder on right side (crochet texture). Gradient overlay: #FF6B6B (left 40%) fading to transparent right.
- Text over gradient: "CLÁSSICO" (10px extrabold uppercase tracked, white 90%) + "Nome · Animal · Cor · Fruta · Objeto · Profissão" (10px, white 65%)
- 10 letter nodes (A–J) in zigzag layout, alternating horizontal offsets: -56, -16, +16, +56px from center, repeating cyclically
- Each node is 72×72px:
  - COMPLETED node: circular golden glow background, crochet letter badge centered (yellow/purple puffy letter, 40px), small yellow circle badge bottom-right showing score number (e.g. "12")
  - CURRENT node (next to play): circular bright glow (yellow-green), pulsing animation, letter badge full color
  - LOCKED node: circular dim gray bg, letter badge grayscale 45% opacity
- Thin vertical thread/yarn connector between nodes (16×18px image placeholder), not after last node in section

SECTION 2 — ESCOLAR:
- Banner: same layout, gradient from #4ECDC4
- Subtitle: "Cidade · País · Comida · Verbo · Personagem · Esporte"
- 9 nodes (K–S), zigzag continues

SECTION 3 — DIVERTIDO:
- Banner: gradient from #9B59B6
- Subtitle: "Filme · Série · Marca · Música"
- 7 nodes (T–Z)

End of scroll: Boston Terrier mascot image placeholder 120×120px centered (label: "crochet dog playing with pink ball")

BOTTOM SHEET MODAL (shown on node tap — use state to toggle):
- Dim overlay backdrop rgba(0,0,0,0.6)
- Sheet slides up from bottom, rounded-t-3xl, bg #0F3460, padding 24px
- Crochet letter badge 48px + "Letra B" (xl bold white)
- "Escolha o tempo por rodada" (xs, white 60%, centered)
- 3 time buttons side by side: [30s] [60s] [90s]
  - Selected (60s): bg #FF6B6B border 2px #FFD93D white bold
  - Unselected: bg #16213E transparent border
- "▶ JOGAR!" full-width button: bg #FF6B6B, border 2px #FFD93D, white extrabold 18px, rounded 16px, pulse animation

BOTTOM BAR (fixed 76px, dark navy):
- Left: secondary button 56×56px, home icon 🏠, label "INÍCIO"
- Far right: mute toggle 56×56px, speaker icon, label "SOM"
