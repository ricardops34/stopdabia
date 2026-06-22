IMPORTANT RULES — READ FIRST:
- Output a single self-contained React component (no external imports beyond react, tailwind classes, and lucide-react icons)
- NO Supabase, NO NextAuth, NO API calls, NO router, NO backend of any kind
- NO next/image — use plain <img> tags with placeholder src="/placeholder.svg" or a gray div
- All data is hardcoded/static inside the component
- Use only inline styles + tailwind classes
- The component must render and preview without any errors
---

Same visual style as my STOP ADEDONHA home screen: dark navy fabric texture, crochet amigurumi aesthetic, same color palette.

Create TWO multiplayer end-game screens for "STOP ADEDONHA".

═══════════════════════════════════
SCREEN A: Final Ranking (Finished)
═══════════════════════════════════
Background #1A1A2E. 390×844px. Flex-col, items-center, px-4, py-6, gap-4, max-w-md mx-auto.

- Trophy feedback image placeholder 180×180px — label "Crochet amigurumi girl celebrating with trophy and confetti — joyful expression"
  bounce-in animation on mount
- "Bia venceu! 🏆" — 28px bold, #FFD93D, text-center

RANKING LIST (w-full, flex-col, gap-2):
4 player cards, each: flex row, items-center, gap-3, px-4 py-3, rounded 16px

1st place: bg #1a1a0a (warm dark), border 2px rgba(255,217,61,0.27)
- "1" — xl extrabold #FFD93D, w-6 text-center
- Avatar image placeholder 40×40px, rounded-full (label "player avatar 1")
- "Bia" — font-semibold flex-1
- Feedback icon placeholder 36×36px (label "vencedor — crochet girl winner icon")
- "120" — bold #FFD93D

2nd place: bg #0F3460, no border
- "2" — xl extrabold rgba(192,192,192,1) silver
- Avatar placeholder, "Carlos", feedback icon (label "quase — crochet girl second place"), "95" yellow

3rd place: bg #0F3460
- "3" — xl extrabold rgba(205,127,50,1) bronze
- Avatar, "Mari", "80" yellow

4th place: bg #0F3460
- "4" — xl extrabold white
- Avatar, "João", feedback icon (label "perdeu — crochet girl losing"), "55" yellow

- "Preparando próxima partida…" — xs white 50%, animate-pulse, mt-2

BOTTOM BAR (fixed 76px):
- CENTER: secondary button 56×56px, 🚪 door icon, label "SAIR"
- FAR RIGHT: mute toggle "SOM"

═══════════════════════════════════
SCREEN B: Rematch Vote
═══════════════════════════════════
Background #1A1A2E. 390×844px. Flex-col, items-center, justify-center, px-4, gap-6, max-w-md mx-auto.

- "Jogar de novo?" — 24px bold, #FFD93D, text-center

- Countdown circle: 96×96px, rounded-full, bg #0F3460, border 4px #4ECDC4 (changes to #FF6B6B when ≤5s)
  - "15" inside — 36px extrabold, #FFD93D (changes to #FF6B6B when ≤5s)

- Description text (sm, white 60%, text-center):
  "Jogo começa em 15s ou quando todos aceitarem"
  "(2/4 prontos)" on second line

READY LIST (w-full, flex-col, gap-2):
4 player rows, each: flex row, items-center, gap-3, px-4 py-2, rounded 16px, bg #0F3460
- Avatar placeholder 36×36px rounded-full
- Player name — flex-1 font-medium
- Status icon: "✅" (ready) or "⏳" (waiting) — text-lg

BOTTOM BAR (fixed 76px):
STATE 1 (not ready yet):
- CENTER: primary button 74×74px, ✅ icon, label "VAMOS LÁ!", bg #FF6B6B, border #FFD93D, pulse

STATE 2 (already clicked ready):
- CENTER: muted text "Aguardando outros…" — sm bold white 50%, px-4

FAR RIGHT always: mute toggle 56×56px, label "SOM"
