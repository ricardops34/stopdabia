'use client'

import Image from 'next/image'

const LETTERS_LEFT  = ['a','b','c','d','e','f','g','h']
const LETTERS_RIGHT = ['i','j','l','m','n','o','p','r']

function FloatingLetters({ letters, side }: { letters: string[]; side: 'left' | 'right' }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {letters.map((l, i) => {
        const top  = `${6 + i * 11}%`
        const left = side === 'left' ? `${8 + (i % 3) * 22}%` : `${6 + (i % 3) * 26}%`
        const rot  = (i % 2 === 0 ? 1 : -1) * (8 + (i % 4) * 5)
        const size = 26 + (i % 3) * 10
        const op   = 0.5 + (i % 3) * 0.12
        return (
          <div
            key={l}
            className="animate-letter-wave"
            style={{ position: 'absolute', top, left, opacity: op, transform: `rotate(${rot}deg)`, animationDelay: `${i * 0.35}s` }}
          >
            <Image src={`/icons/letra_${l}.png`} alt="" width={size} height={size} style={{ objectFit: 'contain' }} />
          </div>
        )
      })}
    </div>
  )
}

const HOW_TO_PLAY = [
  { icon: '🔤', text: 'Escolha uma letra na trilha' },
  { icon: '⏱️', text: 'Preencha as categorias antes do tempo acabar' },
  { icon: '🛑', text: 'Dê STOP quando terminar' },
  { icon: '✅', text: 'A IA corrige suas respostas' },
  { icon: '🏆', text: 'Acumule pontos e suba no ranking' },
]

export default function DesktopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Painel esquerdo — fixo, só visível em desktop */}
      <div
        className="hidden lg:flex"
        style={{
          position: 'fixed', left: 0, top: 0, bottom: 0, width: 240,
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '40px 20px', zIndex: 5,
          backgroundColor: '#0a1628',
          backgroundImage: 'url(/ui/barra_fundo.png)', backgroundRepeat: 'repeat', backgroundSize: '200px',
          borderRight: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <FloatingLetters letters={LETTERS_LEFT} side="left" />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <Image
            src="/cachorra/2.png"
            alt="Mascote"
            width={160}
            height={160}
            className="animate-float-dog"
            style={{ objectFit: 'contain', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }}
          />
          <Image
            src="/logo.png"
            alt="STOP"
            width={130}
            height={93}
            className="animate-pulse-logo"
            style={{ objectFit: 'contain' }}
          />
          <p style={{ color: 'rgba(248,231,191,0.45)', fontSize: 11, fontWeight: 700, textAlign: 'center', letterSpacing: 1 }}>
            O jogo de STOP<br />mais divertido!
          </p>
        </div>
      </div>

      {/* Painel direito — fixo, só visível em desktop */}
      <div
        className="hidden lg:flex"
        style={{
          position: 'fixed', right: 0, top: 0, bottom: 0, width: 240,
          flexDirection: 'column', padding: '40px 16px', gap: 20, zIndex: 5,
          overflowY: 'auto', scrollbarWidth: 'none',
          backgroundColor: '#0a1628',
          backgroundImage: 'url(/ui/barra_fundo.png)', backgroundRepeat: 'repeat', backgroundSize: '200px',
          borderLeft: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <FloatingLetters letters={LETTERS_RIGHT} side="right" />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Como jogar */}
          <div style={{ backgroundColor: 'rgba(15,52,96,0.8)', borderRadius: 16, padding: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ color: '#FFD93D', fontSize: 12, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 12px' }}>Como Jogar</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {HOW_TO_PLAY.map(({ icon, text }, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ fontSize: 15, flexShrink: 0 }}>{icon}</span>
                  <span style={{ color: 'rgba(248,231,191,0.75)', fontSize: 12, fontWeight: 600, lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pontuação */}
          <div style={{ backgroundColor: 'rgba(15,52,96,0.8)', borderRadius: 16, padding: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ color: '#FFD93D', fontSize: 12, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 12px' }}>Pontuação</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { pts: '15', label: 'Resposta única', color: '#95E06C' },
                { pts: '10', label: 'Igual a outro jogador', color: '#FFD93D' },
                { pts: '0',  label: 'Inválida ou vazia', color: '#FF6B6B' },
              ].map(({ pts, label, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 17, fontWeight: 900, color, minWidth: 24, textAlign: 'right' }}>{pts}</span>
                  <span style={{ color: 'rgba(248,231,191,0.65)', fontSize: 11, fontWeight: 600 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Categorias */}
          <div style={{ backgroundColor: 'rgba(15,52,96,0.8)', borderRadius: 16, padding: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ color: '#FFD93D', fontSize: 12, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 10px' }}>Categorias</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {['Nome','Animal','Cor','Fruta','Objeto','Profissão','Cidade','País','Comida','Verbo','Personagem','Esporte','Filme','Série','Marca','Música'].map((cat) => (
                <span key={cat} style={{ backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 6, padding: '2px 7px', fontSize: 10, fontWeight: 700, color: 'rgba(248,231,191,0.6)' }}>
                  {cat}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Conteúdo central — margem lateral só em desktop */}
      <div
        className="lg-center-margins"
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        {children}
      </div>
    </>
  )
}
