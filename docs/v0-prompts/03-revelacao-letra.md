IMPORTANT RULES — READ FIRST:
- Output a single self-contained React component (no external imports beyond react, tailwind classes, and lucide-react icons)
- NO Supabase, NO NextAuth, NO API calls, NO router, NO backend of any kind
- NO next/image — use plain <img> tags with placeholder src="/placeholder.svg" or a gray div
- All data is hardcoded/static inside the component
- Use only inline styles + tailwind classes
- The component must render and preview without any errors
---

Same visual style as my STOP ADEDONHA home screen: dark navy fabric texture, crochet amigurumi aesthetic, same color palette.

Create a mobile-first full-screen letter reveal screen for "STOP ADEDONHA". Background #1A1A2E. 390×844px. No bottom bar.

This screen appears for 5 seconds when a new round starts, revealing which letter players must use.

LAYOUT (vertically and horizontally centered, full screen):
- Small label above: "A letra é" — uppercase, tracked, 18px, bold, white 60% opacity
- Large circle: 280×280px, background #FFD93D, box-shadow: 0 0 60px rgba(255,217,61,0.5)
- Inside the circle: image placeholder 220×220px — label "Crochet amigurumi girl holding a chalkboard showing letter B — playful, colorful, 3D style"
- Entrance animation: the circle scales from 0.3 → 1.05 → 1.0 (springy bounce), duration 0.6s, triggered on mount

No bottom bar. No header. No other elements.
Pure focus on the letter reveal. Dark background #1A1A2E.
