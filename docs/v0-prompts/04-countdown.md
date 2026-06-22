IMPORTANT RULES — READ FIRST:
- Output a single self-contained React component (no external imports beyond react, tailwind classes, and lucide-react icons)
- NO Supabase, NO NextAuth, NO API calls, NO router, NO backend of any kind
- NO next/image — use plain <img> tags with placeholder src="/placeholder.svg" or a gray div
- All data is hardcoded/static inside the component
- Use only inline styles + tailwind classes
- The component must render and preview without any errors
---

Same visual style as my STOP ADEDONHA home screen: dark navy fabric texture, crochet amigurumi aesthetic, same color palette.

Create a mobile-first full-screen countdown screen for "STOP ADEDONHA". Background #1A1A2E. 390×844px. No bottom bar.

This screen cycles through: 3 → 2 → 1 → "VAI!" (3 seconds per number, 2 seconds on "VAI!").

Show TWO variants side by side as preview:

VARIANT A — Number "3":
- Full dark background #1A1A2E
- Centered image placeholder 300×300px — label "Crochet amigurumi number 3 — colorful, puffy, 3D knitted texture, playful"
- Bounce-in animation on each number change (scale 0.5 → 1 with overshoot, fade in), re-triggers when number changes (key-based re-mount)
- No other UI

VARIANT B — "VAI!":
- Same layout
- Image placeholder 300×300px — label "Crochet 'VAI!' text — bold, green, playful, 3D knitted style"
- Same bounce animation

No header. No bottom bar. Minimal — just the image, centered, full screen.
