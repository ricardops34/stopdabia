IMPORTANT RULES — READ FIRST:
- Output a single self-contained React component (no external imports beyond react, tailwind classes, and lucide-react icons)
- NO Supabase, NO NextAuth, NO API calls, NO router, NO backend of any kind
- NO next/image — use plain <img> tags with placeholder src="/placeholder.svg" or a gray div
- All data is hardcoded/static inside the component
- Use only inline styles + tailwind classes
- The component must render and preview without any errors
---

Same visual style as my STOP ADEDONHA home screen: dark navy fabric texture, crochet amigurumi aesthetic, same color palette.

Create a mobile-first multiplayer lobby screen for "STOP ADEDONHA". Background #1A1A2E. 390×844px.

HEADER (fixed top, shrink-0, flex justify-center, pt-4 pb-2 px-4):
- Logo placeholder 120px wide, centered

SCROLLABLE CONTENT (flex-1, overflow-y-auto, px-4, pb-32, flex-col, gap-3, no scrollbar):
Max-width 440px, mx-auto.

CARD 1 — Invite Friends (rounded 20px, bg #0F3460, border 2px #FFD93D, p-4, flex-col, items-center, gap-3):
- "Convide seus amigos" — xs bold uppercase tracked, white 50%
- Room code button (tap to copy): flex row, items-center, gap-2
  - "AB7K3M" — 40px extrabold tracking-[0.2em], #FFD93D
  - Clipboard icon 📋 or ✅ (after copy), text-lg, white 60%
- "Código copiado!" — xs bold #95E06C, animate fade-in (shown after copy)
- Two buttons side by side (flex row, gap-2, w-full):
  - "🔗 Copiar link" — flex-1, rounded 12px, bg #16213E, text #4ECDC4, py-2, text-sm bold
  - "📤 Compartilhar" — flex-1, rounded 12px, bg #16213E, text #FF9500, py-2, text-sm bold

CARD 2 — Players (rounded 20px, bg #0F3460, p-4, flex-col, gap-2):
- Header row: "Na sala" (xs bold uppercase white 60%) + "3/10" (xs white 40%)
- Player list (flex-col, gap-1.5):
  - Player "Bia" (host): avatar circle 36×36px bg #FFD93D, "Bia" text flex-1 sm, "host" pill badge (bg #FFD93D22 text #FFD93D xs px-2 py-0.5 rounded-full)
  - Player "Carlos": avatar circle bg #4ECDC4, "Carlos" text
  - Player "Mari": avatar circle bg #4ECDC4, "Mari" text
- "Aguardando amigos entrarem…" — xs white 40%, animate-pulse, text-center, pt-1

CARD 3 — Categories (host only, rounded 20px, bg #0F3460, overflow-hidden):
- Collapsible header button: full width, px-4 py-3, flex justify-between
  - "Categorias (6/8)" (xs bold uppercase white 60%) + "▼" or "▲" toggle (white 40%)
- Expanded content (px-4 pb-4, flex-wrap, gap-2):
  - Selected pill: bg #FF6B6B, white text, border 2px #FF6B6B, px-3 py-1.5 rounded-full text-sm medium
    Examples: "Nome", "Animal", "Cor", "Fruta", "Objeto", "Profissão"
  - Unselected pill: bg #16213E, white/50 text, border 2px transparent
    Examples: "Cidade", "País", "Comida", "Verbo", "Personagem", "Esporte", "Filme", "Série", "Marca", "Música"

CARD 4 — Non-host waiting message (rounded 20px, bg #0F3460, py-4, text-center):
- "Aguardando o host iniciar a partida…" — sm white 60%, animate-pulse

BOTTOM BAR (fixed 76px, dark navy, border-top rgba(255,255,255,0.08)):
- CENTER-LEFT: secondary button 56×56px, 🚪 door icon, label "SAIR"
- CENTER: primary button 74×74px, ▶ play icon, label "INICIAR", bg #FF6B6B, border #FFD93D, pulse. disabled (opacity-40) if <2 players.
- FAR RIGHT: mute toggle 56×56px, label "SOM"
