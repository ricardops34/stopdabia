IMPORTANT RULES — READ FIRST:
- Output a single self-contained React component (no external imports beyond react, tailwind classes, and lucide-react icons)
- NO Supabase, NO NextAuth, NO API calls, NO router, NO backend of any kind
- NO next/image — use plain <img> tags with placeholder src="/placeholder.svg" or a gray div
- All data is hardcoded/static inside the component
- Use only inline styles + tailwind classes
- The component must render and preview without any errors
---

Create a mobile-first game home screen for "STOP ADEDONHA", a Brazilian word game.
Mobile width 390px, height 844px (iPhone 14 proportions). No scroll.

VISUAL STYLE: Cozy crochet/amigurumi aesthetic. Everything looks hand-knitted or embroidered in fabric. Dark navy fabric-textured background. Colorful, playful, child-friendly (ages 8–17).

BACKGROUND:
- Very dark navy, almost black (#0D1B2A), with a subtle woven/denim fabric texture overlay
- Scattered all around the edges (not center): 20+ single letters (A B C D E F G H I J K L M N O P Q R S T U V W X Y Z) as colorful 3D crochet badge icons — each letter a different bright color (red, yellow, green, teal, purple, orange, pink), slightly rotated at random angles, sizes 28–48px, opacity 70–90%. They feel like embroidered patches floating on the fabric.
- Top left area: a thin yarn/thread line going diagonally

TOP RIGHT:
- Small pill button "🐾 LOGIN" — dark bg, golden/yellow border 2px, cream text, 12px bold

CENTER CONTENT (stacked vertically, centered):

1. LOGO: Large badge/patch shape (rounded rectangle with stitched border effect). Inside:
   - "STOP" in huge 3D crochet letters, each letter a different color: S=red, T=hot pink, O=yellow, P=teal. Letters look puffy, knitted, with visible texture and drop shadow.
   - "ADEDONHA" below in smaller cream/white bold letters on dark purple background
   - Small heart icon above the STOP text
   - The whole logo has a dark purple rounded-rectangle background with a stitched/dashed border effect

2. MASCOT: A Boston Terrier dog in amigurumi crochet 3D style. Black and white, sitting upright with both paws raised up happily. It has a small "S" letter on its chest. It sits on a small round colorful rug/mat. Two yarn balls (one pink, one orange/yellow) on each side. The dog looks very cute, detailed crochet texture.
   Size: about 220×240px centered.

3. TAGLINE CARD: Rounded rectangle card below the dog, dark semi-transparent (#08132480), very subtle golden border.
   - Text: "O jogo de " + "STOP" (in yellow/golden bold) + " mais divertido!" — large, 28px extrabold, cream color
   - Below: "Sem cadastro. É só jogar" in teal/cyan, 16px semibold
   - Small decorative flower icons on left and right of the text

BOTTOM BAR (fixed bottom, ~80px, dark navy bg with subtle top separator):
Four buttons in a row, horizontally centered:

1. INDIVIDUAL — secondary style: dark rounded-rect ~60×60px, person/user icon (crochet-style), label "INDIVIDUAL" 8px bold white below

2. CRIAR SALA — PRIMARY: larger ~74×74px, rounded-rect, background RED (#FF6B6B), border 3px YELLOW (#FFD93D), group/people icon (crochet-style), label "CRIAR SALA" 9px extrabold white. Slight glow/pulse effect.

3. ENTRAR — secondary: same style as INDIVIDUAL, door or arrow icon, label "ENTRAR"

4. SOM — smallest: ~52×52px, speaker icon, label "SOM", semi-transparent bg

All button icons should look crochet/embroidered style if possible. Labels in ALL CAPS.
Use placeholder images (next/image with src as placeholder URL or gray box) for the mascot, logo and icons.
