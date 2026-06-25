'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import BottomBar, { BtnSecondary } from '@/components/BottomBar'
import { Howler } from 'howler'

export default function SobrePage() {
  const router = useRouter()
  const [images, setImages] = useState<string[]>([])
  const [idx, setIdx] = useState(0)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  useEffect(() => {
    Howler.mute(true)
    const audio = new Audio('/agradecimentos/musica.mp3')
    audio.loop = true
    audio.volume = 0.75
    audio.play().catch(() => {})
    return () => {
      audio.pause()
      audio.src = ''
      Howler.mute(localStorage.getItem('audio_muted') === '1')
    }
  }, [])

  useEffect(() => {
    fetch('/api/agradecimentos')
      .then((r) => r.json())
      .then((d: { images: string[] }) => setImages(d.images ?? []))
      .catch(() => {})
  }, [])

  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length)
  const next = () => setIdx((i) => (i + 1) % images.length)

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }
  function onTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
    if (Math.abs(dx) > 40 && dy < 60) dx < 0 ? next() : prev()
  }

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#0a1628', backgroundImage: 'url(/ui/barra_fundo.png)', backgroundRepeat: 'repeat', backgroundSize: '200px', display: 'flex', flexDirection: 'column' }}>

      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 20px 100px', scrollbarWidth: 'none', maxWidth: 520, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* Carrossel */}
        {images.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            {/* Imagem */}
            <div
              style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', border: '3px solid rgba(255,217,61,0.3)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)', userSelect: 'none' }}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <Image
                key={images[idx]}
                src={images[idx]}
                alt={`Foto ${idx + 1}`}
                width={720}
                height={960}
                style={{ width: '100%', height: 'auto', display: 'block', transition: 'opacity 0.3s' }}
                priority
              />

              {/* Setas */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.55)', border: 'none', color: '#FFD93D', fontSize: 18, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >‹</button>
                  <button
                    onClick={next}
                    style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.55)', border: 'none', color: '#FFD93D', fontSize: 18, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >›</button>
                </>
              )}
            </div>

            {/* Dots + contador */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 }}>
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  style={{ width: i === idx ? 20 : 8, height: 8, borderRadius: 4, backgroundColor: i === idx ? '#FFD93D' : 'rgba(255,255,255,0.25)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.2s' }}
                />
              ))}
            </div>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 700, marginTop: 6 }}>
              {idx + 1} / {images.length}
            </p>
          </div>
        )}

        {/* Texto */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <p style={{ color: '#F8E7BF', fontSize: 16, fontWeight: 700, lineHeight: 1.7, margin: 0 }}>
            Este jogo é dedicado à minha filha,{' '}
            <span style={{ color: '#FFD93D', fontWeight: 900 }}>Beatriz Zangiromi Sotomayor</span>.
          </p>

          <p style={{ color: 'rgba(248,231,191,0.85)', fontSize: 15, fontWeight: 600, lineHeight: 1.8, margin: 0 }}>
            Uma menina muito teimosa, inteligente, criativa, bagunceira, preguiçosa, linda e cheia de personalidade — tudo aquilo que uma adolescente pode ser, e muito mais.
          </p>

          <p style={{ color: 'rgba(248,231,191,0.85)', fontSize: 15, fontWeight: 600, lineHeight: 1.8, margin: 0 }}>
            Cada uma dessas características faz de você uma pessoa única e especial. Tenho muito orgulho de acompanhar seu crescimento, suas descobertas, suas ideias e até mesmo suas teimosias.
          </p>

          <p style={{ color: 'rgba(248,231,191,0.85)', fontSize: 15, fontWeight: 600, lineHeight: 1.8, margin: 0 }}>
            Fiz este jogo com muito carinho e amor, pensando em você e em tudo o que torna você tão incrível.
          </p>

          <p style={{ color: 'rgba(248,231,191,0.85)', fontSize: 15, fontWeight: 600, lineHeight: 1.8, margin: 0 }}>
            Mas esta dedicação também tem outro propósito: mostrar a você que tudo é possível quando realmente queremos algo. Com dedicação, paciência e persistência, somos capazes de transformar ideias em realidade e sonhos em conquistas.
          </p>

          <p style={{ color: 'rgba(248,231,191,0.85)', fontSize: 15, fontWeight: 600, lineHeight: 1.8, margin: 0 }}>
            Espero que este jogo seja uma pequena prova disso e que você nunca deixe de acreditar no seu potencial.
          </p>

          <p style={{ color: '#FFD93D', fontSize: 16, fontWeight: 800, lineHeight: 1.7, margin: 0 }}>
            Te amo muito e espero que goste!
          </p>

          <div style={{ borderTop: '1px solid rgba(255,217,61,0.2)', paddingTop: 16, marginTop: 4 }}>
            <p style={{ color: 'rgba(248,231,191,0.6)', fontSize: 14, fontWeight: 700, margin: 0 }}>Com todo o meu amor,</p>
            <p style={{ color: '#F8E7BF', fontSize: 15, fontWeight: 900, margin: '4px 0 0' }}>Seu pai chato. ❤️</p>
          </div>
        </div>

      </div>

      <BottomBar
        left={<BtnSecondary onClick={() => router.back()} iconSrc="/icons/btn_voltar.png" label="VOLTAR" size={60} />}
      />
    </div>
  )
}
