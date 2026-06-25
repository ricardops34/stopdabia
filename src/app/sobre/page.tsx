'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import BottomBar, { BtnSecondary } from '@/components/BottomBar'
import { Howler } from 'howler'

export default function SobrePage() {
  const router = useRouter()

  useEffect(() => {
    // Silencia a música de fundo enquanto a dedicatória toca
    Howler.mute(true)

    const audio = new Audio('/agradecimentos/musica.mp3')
    audio.loop = true
    audio.volume = 0.75
    audio.play().catch(() => {})

    return () => {
      audio.pause()
      audio.src = ''
      // Restaura o estado de mudo conforme preferência do usuário
      const wasMuted = localStorage.getItem('audio_muted') === '1'
      Howler.mute(wasMuted)
    }
  }, [])

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#0a1628', backgroundImage: 'url(/ui/barra_fundo.png)', backgroundRepeat: 'repeat', backgroundSize: '200px', display: 'flex', flexDirection: 'column' }}>

      <div style={{ flex: 1, overflowY: 'auto', padding: '40px 24px 100px', scrollbarWidth: 'none', maxWidth: 520, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* Foto */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{ borderRadius: 24, overflow: 'hidden', border: '3px solid #FFD93D44', boxShadow: '0 12px 40px rgba(0,0,0,0.5)', width: '100%', maxWidth: 360, aspectRatio: '4/3', position: 'relative' }}>
            <Image
              src="/agradecimentos/imagen.jpeg"
              alt="Beatriz"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        </div>

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
            <p style={{ color: '#F8E7BF', fontSize: 15, fontWeight: 900, margin: '4px 0 0' }}>
              Seu pai chato. ❤️
            </p>
          </div>
        </div>

      </div>

      <BottomBar
        left={<BtnSecondary onClick={() => router.back()} iconSrc="/icons/btn_voltar.png" label="VOLTAR" size={60} />}
      />
    </div>
  )
}
