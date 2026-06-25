'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

const LETTERS = ['a','b','c','d','e','f','g','h','i','j','l','m','n','o','p','q','r','s','t','u','v','z']

const STATIC_IMAGES: string[] = [
  '/imagens/logo-home.png',
  '/imagens/cachorra-home-2.png',
  '/imagens/cachorra-home-4.png',
  '/ui/barra_fundo.png',
  '/logo.png',
  '/trail/fio_bg.png',
  '/cachorra/1.png', '/cachorra/2.png', '/cachorra/3.png',
  '/cachorra/4.png', '/cachorra/5.png',
  '/icons/btn_individual.png',
  '/icons/btn_criar_sala.png',
  '/icons/btn_entrar.png',
  '/icons/btn_som_on.png',
  '/icons/btn_som_off.png',
  '/icons/btn_login.png',
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
  ...LETTERS.map(l => `/icons/letra_${l}.png`),
  '/contagem/01.png', '/contagem/02.png',
  '/contagem/03.png', '/contagem/vai.png',
  '/aviso/acerto.png',
  '/aviso/da_zero.png',
  '/aviso/erro.png',
  '/aviso/palavra_nao_existe.png',
  '/aviso/vencedor.png',
  '/aviso/perdeu.png',
  '/aviso/quase.png',
  ...LETTERS.map(l => `/letras_sorteio/${l.toUpperCase()}.png`),
]

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new window.Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = src
  })
}

function preloadAudio(src: string): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio(src)
    audio.preload = 'auto'
    audio.oncanplaythrough = () => resolve()
    audio.onerror = () => resolve()
    // Força o browser a começar o download
    audio.load()
    // Timeout de segurança por arquivo
    setTimeout(resolve, 3000)
  })
}

export default function SplashScreen({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState(0)
  const [fading, setFading] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('splash_done')) {
      setHidden(true)
      return
    }

    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      sessionStorage.setItem('splash_done', '1')
      setTimeout(() => {
        setFading(true)
        setTimeout(() => setHidden(true), 500)
      }, 400)
    }

    // Timeout de segurança global: máximo 8s
    const safetyTimeout = setTimeout(finish, 8000)

    async function run() {
      // 1. Busca lista de easter eggs (imagens + áudios dinâmicos)
      let easterImages: string[] = []
      let easterAudio: string[] = []
      try {
        const res = await fetch('/api/easter')
        const data = await res.json() as { images: string[]; audio: string[] }
        easterImages = data.images ?? []
        easterAudio = data.audio ?? []
      } catch { /* segue sem easter eggs */ }

      const allImages = [...STATIC_IMAGES, ...easterImages]
      const total = allImages.length + easterAudio.length
      let loaded = 0

      const tick = () => {
        loaded++
        setProgress(Math.round((loaded / total) * 100))
        if (loaded >= total) finish()
      }

      // 2. Precarrega imagens em paralelo
      allImages.forEach(src => preloadImage(src).then(tick))

      // 3. Precarrega áudios em paralelo
      easterAudio.forEach(src => preloadAudio(src).then(tick))
    }

    void run()

    return () => clearTimeout(safetyTimeout)
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

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: 220 }}>
            <div style={{ width: '100%', height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
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
            <span style={{ color: 'rgba(248,231,191,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>
              CARREGANDO {progress}%
            </span>
          </div>
        </div>
      )}

      {children}
    </>
  )
}
