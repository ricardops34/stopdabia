IMPORTANT RULES — READ FIRST:
- Output a single self-contained React component (no external imports beyond react, tailwind classes, and lucide-react icons)
- NO Supabase, NO NextAuth, NO API calls, NO router, NO backend of any kind
- NO next/image — use plain <img> tags with placeholder src="/placeholder.svg" or a gray div
- All data is hardcoded/static inside the component
- Use only inline styles + tailwind classes
- The component must render and preview without any errors
---

Same visual style as my STOP ADEDONHA home screen: dark navy fabric texture, crochet amigurumi aesthetic, same color palette.

Create a mobile-first active gameplay screen for "STOP ADEDONHA". Background #1A1A2E. 390×844px.

This is the main screen where players type their answers during a timed round.
Current state: letter "B", category "Animal", timer at 42s (not urgent yet), player answered 3 of 6 categories.

HEADER (fixed top, px-4 pt-4 pb-2, flex row):
- LEFT: circle badge 52×52px, background #FFD93D, contains crochet letter "B" image placeholder (40px, label "crochet letter B badge — yellow/purple puffy knitted style")
- RIGHT: timer block (flex column, align end)
  - "42s" — 24px bold tabular-nums, color #FFD93D (changes to #FF6B6B when ≤10s)
  - Progress bar: 112px wide, 8px tall, rounded-full, track bg #0F3460, fill bg #4ECDC4, width proportional to remaining time

CENTER CONTENT (flex-1, flex-col, items-center, justify-center, gap-6, px-6):

1. Category progress dots — row of 6 dots, gap-2:
   - Current (index 1): 10×10px circle, #FFD93D
   - Answered (indexes 0,2): 8×8px circle, #4ECDC4
   - Empty (indexes 3,4,5): 8×8px circle, #0F3460
   - Each dot is tappable to jump to that category

2. Category label (text-center):
   - "2 / 6" — 10px bold uppercase tracked, white 40%, mb-1
   - "Animal" — 40px extrabold, #FFD93D

3. Text input (full width):
   - Rounded 16px, bg #0F3460, border 2px #4ECDC4 (has content) or #16213E (empty)
   - Value: "Baleia" — 24px bold white, text-center
   - Placeholder: "Com B…" — white 25%
   - padding px-4 py-5
   - Focus: border turns #4ECDC4

BOTTOM BAR (fixed 76px, dark navy, border-top rgba(255,255,255,0.08)):
Row with max-width 460px centered, items-center, justify-between, gap-3, px-3:

- LEFT slot (w-56): secondary button 56×56px — "←" arrow or image placeholder "prev category arrow", label "ANTERIOR" 8px bold white/60, rounded 16px, bg rgba(255,255,255,0.08), border rgba(255,255,255,0.15)

- CENTER (flex-1, flex, justify-center, gap-3):
  - Hint button 56×56px: bg rgba(255,217,61,0.15), rounded 16px, lightbulb icon 💡, label "DICA" 8px. After use: bg rgba(255,255,255,0.05), icon ✅, label "USADA", disabled.
  - STOP button PRIMARY 74×74px: bg #FF6B6B, border 2.5px #FFD93D, rounded 16px, image placeholder "red octagon hand STOP icon — crochet style" 40px, label "STOP!" 9px extrabold white, pulse animation

- RIGHT slot (w-56): secondary button 56×56px — "→" arrow, label "PRÓXIMA" 8px bold white/60

- Mute toggle 56×56px (always shown): bg rgba(255,255,255,0.08), border rgba(255,255,255,0.12), speaker icon, label "SOM" 8px white/50
