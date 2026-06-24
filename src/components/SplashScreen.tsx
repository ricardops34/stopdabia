'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

const LETTERS = ['a','b','c','d','e','f','g','h','i','j','l','m','n','o','p','q','r','s','t','u','v','z']

const PRELOAD: string[] = [
  // Home
  '/imagens/logo-home.png',
  '/imagens/cachorra-home-2.png',
  '/imagens/cachorra-home-4.png',
  '/ui/barra_fundo.png',
  '/logo.png',
  '/trail/fio_bg.png',
  // Cachorras
  '/cachorra/1.png', '/cachorra/2.png', '/cachorra/3.png',
  '/cachorra/4.png', '/cachorra/5.png',
  // Botões da home
  '/icons/btn_individual.png',
  '/icons/btn_criar_sala.png',
  '/icons/btn_entrar.png',
  '/icons/btn_som_on.png',
  '/icons/btn_som_off.png',
  '/icons/btn_login.png',
  // Botões do jogo
  '/icons/btn_stop.png',
  '/icons/btn_dica.png',
  '/icons/btn_dica_usada.png',
  '/icons/btn_voltar.png',
  '/icons/btn_avançar.png',
  '/icons/btn_reiniciar.png',
  '/icons/btn_inicio.png',
  '/icons/btn_resumo.png',
  '/icons/btn_anterior.png',
  '/icons/btn_proxima.png',
  // Letras decorativas
  ...LETTERS.map(l => `/icons/letra_${l}.png`),
  // Contagem
  '/contagem/01.png', '/contagem/02.png',
  '/contagem/03.png', '/contagem/vai.png',
  // Avisos principais
  '/aviso/acerto.png',
  '/aviso/da_zero.png',
  '/aviso/erro.png',
  '/aviso/palavra_nao_existe.png',
  '/aviso/vencedor.png',
  '/aviso/perdeu.png',
  '/aviso/quase.png',
  // Letras sorteio (A–Z)
  ...LETTERS.map(l => `/letras_sorteio/${l.toUpperCase()}.png`),
]

const TOTAL = PRELOAD.length

export default function SplashScreen({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState(0)
  const [fading, setFading] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    // Só mostra o splash uma vez por sessão
    if (sessionStorage.getItem('splash_done')) {
      setHidden(true)
      return
    }

    let loaded = 0

    const done = () => {
      loaded++
      const pct = Math.round((loaded / TOTAL) * 100)
      setProgress(pct)

      if (loaded >= TOTAL) finish()
    }

    const finish = () => {
      sessionStorage.setItem('splash_done', '1')
      // Aguarda um momento mínimo de exibição antes de fade out
      setTimeout(() => {
        setFading(true)
        setTimeout(() => setHidden(true), 500)
      }, 400)
    }

    PRELOAD.forEach(src => {
      const img = new window.Image()
      img.onload = done
      img.onerror = done // não trava se alguma imagem falhar
      img.src = src
    })

    // Timeout de segurança: nunca bloqueia mais de 5s
    const timeout = setTimeout(finish, 5000)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <>
      {!hidden && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 36,
            backgroundColor: '#0a1628',
            backgroundImage: 'url(/ui/barra_fundo.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '200px',
            opacity: fading ? 0 : 1,
            transition: 'opacity 0.5s ease',
            pointerEvents: fading ? 'none' : 'all',
          }}
        >
          <Image
            src="/imagens/logo-home.png"
            alt="STOP ADEDONHA"
            width={300}
            height={215}
            priority
            style={{ objectFit: 'contain', maxWidth: '80vw' }}
          />

          {/* Barra de progresso */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: 220 }}>
            <div
              style={{
                width: '100%',
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255,255,255,0.1)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  borderRadius: 4,
                  backgroundColor: '#FFD93D',
                  width: `${progress}%`,
                  transition: 'width 0.15s ease',
                  boxShadow: '0 0 8px rgba(255,217,61,0.6)',
                }}
              />
            </div>
            <span
              style={{
                color: 'rgba(248,231,191,0.5)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 2,
              }}
            >
              CARREGANDO {progress}%
            </span>
          </div>
        </div>
      )}

      {children}
    </>
  )
}
