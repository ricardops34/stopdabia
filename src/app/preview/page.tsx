'use client'

/**
 * Reprodução autossuficiente da tela inicial "STOP ADEDONHA"
 * (tema crochê / amigurumi).
 *
 * - Componente único, sem backend, sem router, sem chamadas de API.
 * - Dados estáticos / hardcoded.
 * - Usa <img> simples apontando para assets em /public.
 */

const NAVY = '#0D1B2A'
const CREAM = '#F8E7BF'
const YELLOW = '#FFD93D'
const CORAL = '#FF6B6B'
const TEAL = '#6CC8D6'

// Letras espalhadas pelas bordas (não no centro), em ângulos e tamanhos variados.
const SCATTERED_LETTERS: Array<{
  l: string
  top: string
  left: string
  size: number
  rot: number
  op: number
}> = [
  { l: 'a', top: '6%', left: '6%', size: 40, rot: -18, op: 0.7 },
  { l: 'b', top: '5%', left: '30%', size: 30, rot: 10, op: 0.6 },
  { l: 'c', top: '4%', left: '46%', size: 34, rot: -6, op: 0.7 },
  { l: 'd', top: '9%', left: '60%', size: 30, rot: 14, op: 0.6 },
  { l: 'e', top: '26%', left: '90%', size: 42, rot: -10, op: 0.8 },
  { l: 'f', top: '20%', left: '2%', size: 28, rot: 16, op: 0.6 },
  { l: 'g', top: '38%', left: '4%', size: 38, rot: -14, op: 0.75 },
  { l: 'h', top: '46%', left: '92%', size: 30, rot: 8, op: 0.6 },
  { l: 'm', top: '52%', left: '2%', size: 36, rot: 20, op: 0.7 },
  { l: 'p', top: '40%', left: '88%', size: 44, rot: -8, op: 0.85 },
  { l: 'k', top: '64%', left: '4%', size: 40, rot: -6, op: 0.7 },
  { l: 's', top: '60%', left: '90%', size: 34, rot: 12, op: 0.75 },
  { l: 't', top: '70%', left: '88%', size: 30, rot: -16, op: 0.6 },
  { l: 'z', top: '74%', left: '92%', size: 32, rot: 10, op: 0.6 },
  { l: 'j', top: '32%', left: '1%', size: 26, rot: 18, op: 0.55 },
  { l: 'w', top: '14%', left: '88%', size: 30, rot: -12, op: 0.6 },
  { l: 'r', top: '12%', left: '76%', size: 26, rot: 8, op: 0.55 },
  { l: 'n', top: '57%', left: '7%', size: 26, rot: -20, op: 0.55 },
  { l: 'v', top: '48%', left: '10%', size: 24, rot: 14, op: 0.5 },
  { l: 'q', top: '78%', left: '6%', size: 26, rot: 10, op: 0.55 },
]

function ScatteredLetters() {
  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden" aria-hidden>
      {SCATTERED_LETTERS.map(({ l, top, left, size, rot, op }, i) => (
        <img
          key={`${l}-${i}`}
          src={`/icons/letra_${l}.png`}
          alt=""
          style={{
            position: 'absolute',
            top,
            left,
            width: size,
            height: size,
            opacity: op,
            transform: `rotate(${rot}deg)`,
            objectFit: 'contain',
            filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.45))',
          }}
        />
      ))}
    </div>
  )
}

/* Ícones estilo silhueta (crochê/bordado) para os botões */

function PersonIcon({ size = 28, color = CREAM }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <circle cx="12" cy="7.5" r="4" />
      <path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
    </svg>
  )
}

function GroupIcon({ size = 32, color = CREAM }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <circle cx="12" cy="6.5" r="3" />
      <circle cx="5" cy="9" r="2.4" />
      <circle cx="19" cy="9" r="2.4" />
      <path d="M12 10.5c3.2 0 5.5 2 5.5 5V18h-11v-2.5c0-3 2.3-5 5.5-5z" />
      <path d="M5 12c-2.4 0-4 1.6-4 4V18h3.5v-2.5c0-1.4.4-2.6 1.1-3.5A4.7 4.7 0 0 0 5 12z" />
      <path d="M19 12c2.4 0 4 1.6 4 4V18h-3.5v-2.5c0-1.4-.4-2.6-1.1-3.5.2 0 .4 0 .6 0z" />
    </svg>
  )
}

function EnterIcon({ size = 28, color = CREAM }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 3h5a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-5" />
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
    </svg>
  )
}

function SoundIcon({ size = 24, color = CREAM }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M4 9v6h4l5 4V5L8 9H4z" />
      <path d="M16.5 8.5a4 4 0 0 1 0 7" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M18.5 6a7 7 0 0 1 0 12" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function FlowerIcon({ color }: { color: string }) {
  const petals = [0, 60, 120, 180, 240, 300]
  return (
    <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden>
      {petals.map((deg) => (
        <ellipse
          key={deg}
          cx="20"
          cy="9"
          rx="5.5"
          ry="8"
          fill={color}
          transform={`rotate(${deg} 20 20)`}
          opacity="0.92"
        />
      ))}
      <circle cx="20" cy="20" r="5.5" fill={YELLOW} />
      <circle cx="20" cy="20" r="2" fill={NAVY} opacity="0.5" />
    </svg>
  )
}

function BottomButton({
  children,
  label,
  size,
  primary,
  faded,
}: {
  children: React.ReactNode
  label: string
  size: number
  primary?: boolean
  faded?: boolean
}) {
  return (
    <button
      type="button"
      className={`flex flex-col items-center gap-1 transition-transform active:scale-95 ${
        primary ? 'animate-pulse-stop' : ''
      }`}
      style={{ outline: 'none', border: 'none', background: 'transparent', cursor: 'pointer' }}
    >
      <span
        className="flex items-center justify-center"
        style={{
          width: size,
          height: size,
          borderRadius: 18,
          backgroundColor: primary ? CORAL : faded ? 'rgba(255,255,255,0.06)' : 'rgba(15,52,96,0.55)',
          border: primary
            ? `3px solid ${YELLOW}`
            : '2px solid rgba(248,231,191,0.28)',
          boxShadow: primary
            ? '0 8px 22px rgba(255,107,107,0.45)'
            : 'inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 10px rgba(0,0,0,0.3)',
        }}
      >
        {children}
      </span>
      <span
        className="font-extrabold tracking-wide"
        style={{
          color: primary ? '#FFFFFF' : CREAM,
          fontSize: primary ? 10 : 9,
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </span>
    </button>
  )
}

export default function HomeStopPreview() {
  return (
    <div
      className="flex min-h-[100dvh] items-center justify-center"
      style={{ backgroundColor: '#05080f' }}
    >
      <main
        className="relative overflow-hidden"
        style={{
          width: 390,
          height: 844,
          maxWidth: '100vw',
          backgroundColor: NAVY,
          // Textura tecido/jeans: cruzado sutil + vinheta
          backgroundImage: `
            radial-gradient(120% 90% at 50% 0%, rgba(40,64,104,0.35) 0%, rgba(13,27,42,0) 55%),
            repeating-linear-gradient(45deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 4px),
            repeating-linear-gradient(-45deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 1px, transparent 1px, transparent 4px)
          `,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <ScatteredLetters />

        {/* Fio/lã diagonal no topo esquerdo */}
        <img
          src="/trail/fio_bg.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-2 top-0 opacity-90"
          style={{ width: 54, height: 190, objectFit: 'contain' }}
        />

        {/* LOGIN pill top right */}
        <button
          type="button"
          className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full px-3 py-2 transition-transform active:scale-95"
          style={{
            backgroundColor: 'rgba(10,22,40,0.92)',
            border: `2px solid ${'#D69B2B'}`,
            color: CREAM,
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          <span aria-hidden style={{ fontSize: 14 }}>
            🐾
          </span>
          LOGIN
        </button>

        {/* Conteúdo central */}
        <section className="relative z-10 flex h-full flex-col items-center px-5 pt-14 pb-[96px]">
          {/* Logo */}
          <img
            src="/imagens/logo-home.png"
            alt="STOP ADEDONHA"
            className="h-auto object-contain"
            style={{ width: 'min(320px, 84%)', filter: 'drop-shadow(0 10px 24px rgba(0,0,0,0.45))' }}
          />

          {/* Mascote */}
          <img
            src="/imagens/cachorra-home-1.png"
            alt="Mascote Boston Terrier de crochê"
            className="-mt-1 h-auto object-contain"
            style={{ width: 'min(220px, 58%)', filter: 'drop-shadow(0 18px 40px rgba(0,0,0,0.5))' }}
          />

          {/* Card de tagline */}
          <div
            className="relative mt-2 flex w-full items-center justify-center rounded-[26px] px-10 py-4 text-center"
            style={{
              backgroundColor: 'rgba(8,19,36,0.82)',
              border: `2px solid rgba(255,217,61,0.22)`,
              boxShadow: '0 12px 30px rgba(0,0,0,0.28)',
            }}
          >
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <FlowerIcon color="#9B59B6" />
            </span>
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <FlowerIcon color={TEAL} />
            </span>

            <div>
              <p
                className="font-extrabold leading-tight text-balance"
                style={{ fontSize: 26, color: CREAM }}
              >
                O jogo de <span style={{ color: YELLOW }}>STOP</span> mais divertido!
              </p>
              <p className="mt-1 font-semibold" style={{ fontSize: 15, color: TEAL }}>
                Sem cadastro. É só jogar
              </p>
            </div>
          </div>
        </section>

        {/* Barra inferior fixa */}
        <nav
          className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-center gap-4 px-4 pb-4 pt-3"
          style={{
            backgroundColor: 'rgba(7,16,30,0.92)',
            borderTop: '1px solid rgba(248,231,191,0.12)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <BottomButton label="INDIVIDUAL" size={60}>
            <PersonIcon size={28} />
          </BottomButton>

          <BottomButton label="CRIAR SALA" size={74} primary>
            <GroupIcon size={34} color="#FFFFFF" />
          </BottomButton>

          <BottomButton label="ENTRAR" size={60}>
            <EnterIcon size={28} />
          </BottomButton>

          <BottomButton label="SOM" size={52} faded>
            <SoundIcon size={24} />
          </BottomButton>
        </nav>
      </main>
    </div>
  )
}
