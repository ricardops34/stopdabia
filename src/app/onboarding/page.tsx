'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

const AVATARS = Array.from({ length: 15 }, (_, i) => `/avatar/avatar_${String(i + 1).padStart(2, '0')}.png`)
const BG = 'radial-gradient(circle at 20% 20%, #FB7185 0%, #F472B6 50%, #EC4899 100%)'

function AvatarPicker({ selected, onSelect }: { selected: string; onSelect: (a: string) => void }) {
  const idx = AVATARS.indexOf(selected)
  const prev = AVATARS[(idx - 1 + AVATARS.length) % AVATARS.length]
  const next = AVATARS[(idx + 1) % AVATARS.length]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', margin: 0 }}>Escolha seu avatar</p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>

        <button
          onClick={() => onSelect(prev)}
          style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.14)', color: '#FFD93D', fontWeight: 900, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >‹</button>

        <button
          onClick={() => onSelect(prev)}
          style={{ width: 60, height: 60, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.18)', backgroundColor: 'rgba(0,0,0,0.2)', padding: 3, opacity: 0.55, flexShrink: 0, cursor: 'pointer' }}
        >
          <Image src={prev} alt="avatar" width={50} height={50} style={{ borderRadius: '50%', objectFit: 'cover', width: '100%', height: '100%' }} />
        </button>

        <div style={{ width: 104, height: 104, borderRadius: '50%', border: '3px solid #FFD93D', backgroundColor: 'rgba(255,217,61,0.1)', padding: 5, boxShadow: '0 0 18px rgba(255,217,61,0.45)', flexShrink: 0 }}>
          <Image src={selected} alt="avatar selecionado" width={90} height={90} style={{ borderRadius: '50%', objectFit: 'cover', width: '100%', height: '100%' }} />
        </div>

        <button
          onClick={() => onSelect(next)}
          style={{ width: 60, height: 60, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.18)', backgroundColor: 'rgba(0,0,0,0.2)', padding: 3, opacity: 0.55, flexShrink: 0, cursor: 'pointer' }}
        >
          <Image src={next} alt="avatar" width={50} height={50} style={{ borderRadius: '50%', objectFit: 'cover', width: '100%', height: '100%' }} />
        </button>

        <button
          onClick={() => onSelect(next)}
          style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.14)', color: '#FFD93D', fontWeight: 900, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >›</button>

      </div>
      <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
        {idx + 1} / {AVATARS.length}
      </p>
    </div>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Pré-preencher com dado do Google se disponível
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace('/'); return }
      const name = data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? ''
      if (name) setNickname(name.split(' ')[0])
    })
  }, [router])

  async function handleSave() {
    const name = nickname.trim()
    if (name.length < 3) { setError('Apelido precisa ter pelo menos 3 letras'); return }
    setLoading(true)

    // Validação de conteúdo via IA
    try {
      const check = await fetch('/api/validate-nickname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: name }),
      })
      const result = await check.json() as { ok: boolean; reason?: string }
      if (!result.ok) {
        setError(result.reason ?? 'Apelido não permitido. Escolha outro.')
        setLoading(false)
        return
      }
    } catch { /* se IA falhar, continua */ }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/'); return }

    const avatarId = AVATARS.indexOf(avatar) + 1

    const { error: err } = await supabase
      .from('profiles')
      .upsert({ id: user.id, nickname: name, avatar_id: avatarId })

    if (err) { setError('Erro ao salvar. Tente novamente.'); setLoading(false); return }

    localStorage.setItem('stop_player', JSON.stringify({ nickname: name, avatar }))
    router.replace('/')
  }

  return (
    <main
      className="flex flex-col items-center justify-center min-h-[100dvh] px-6 gap-6"
      style={{ backgroundImage: BG }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="STOP ADEDONHA" width={180} style={{ height: 'auto' }} />

      <div
        className="w-full max-w-sm flex flex-col gap-5 rounded-3xl p-6"
        style={{ backgroundColor: 'rgba(0,0,0,0.25)', border: '1.5px solid rgba(255,255,255,0.15)' }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-white">Bem-vindo! 🎉</h1>
          <p className="text-white/60 text-sm mt-1">Escolha como vai aparecer no jogo</p>
        </div>

        <AvatarPicker selected={avatar} onSelect={setAvatar} />

        <input
          type="text"
          placeholder="Seu apelido…"
          value={nickname}
          onChange={(e) => { setNickname(e.target.value); setError('') }}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          maxLength={20}
          autoFocus
          className="w-full px-5 py-4 text-xl rounded-2xl text-white placeholder-white/40 outline-none text-center font-bold"
          style={{ backgroundColor: 'rgba(0,0,0,0.25)', border: '3px solid rgba(255,255,255,0.4)' }}
        />

        {error && <p className="text-center text-sm font-bold text-yellow-200">{error}</p>}

        <button
          onClick={handleSave}
          disabled={loading || nickname.trim().length < 3}
          className="w-full py-4 rounded-2xl font-extrabold text-lg text-white active:scale-95 transition-transform disabled:opacity-40"
          style={{ backgroundColor: '#FF6B6B', border: '2.5px solid #FFD93D' }}
        >
          {loading ? 'Salvando…' : 'Entrar no jogo →'}
        </button>
      </div>
    </main>
  )
}
