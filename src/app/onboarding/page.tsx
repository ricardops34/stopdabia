'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

const AVATARS = Array.from({ length: 15 }, (_, i) => `/avatar/avatar_${String(i + 1).padStart(2, '0')}.png`)
const BG = 'radial-gradient(circle at 20% 20%, #FB7185 0%, #F472B6 50%, #EC4899 100%)'

function AvatarPicker({ selected, onSelect }: { selected: string; onSelect: (a: string) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  return (
    <div className="flex flex-col gap-2 w-full">
      <p className="text-white/70 text-sm font-bold">Escolha seu avatar</p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => scrollRef.current?.scrollBy({ left: -160, behavior: 'smooth' })}
          className="shrink-0 rounded-full flex items-center justify-center"
          style={{ width: 32, height: 32, backgroundColor: 'rgba(0,0,0,0.25)', color: 'white', fontSize: 18 }}
        >‹</button>
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto flex-1 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
          {AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => onSelect(a)}
              className="rounded-full active:scale-90 transition-transform shrink-0 snap-center"
              style={{
                width: 64, height: 64, padding: 3,
                border: selected === a ? '3px solid #FFD93D' : '3px solid rgba(255,255,255,0.2)',
                backgroundColor: 'rgba(0,0,0,0.2)',
              }}
            >
              <Image src={a} alt="avatar" width={54} height={54} className="rounded-full object-cover" />
            </button>
          ))}
        </div>
        <button
          onClick={() => scrollRef.current?.scrollBy({ left: 160, behavior: 'smooth' })}
          className="shrink-0 rounded-full flex items-center justify-center"
          style={{ width: 32, height: 32, backgroundColor: 'rgba(0,0,0,0.25)', color: 'white', fontSize: 18 }}
        >›</button>
      </div>
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
    if (nickname.trim().length < 3) { setError('Apelido precisa ter pelo menos 3 letras'); return }
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/'); return }

    const avatarId = AVATARS.indexOf(avatar) + 1

    const { error: err } = await supabase
      .from('profiles')
      .upsert({ id: user.id, nickname: nickname.trim(), avatar_id: avatarId })

    if (err) { setError('Erro ao salvar. Tente novamente.'); setLoading(false); return }

    // Salvar também no localStorage para o jogo usar sem buscar do banco
    localStorage.setItem('stop_player', JSON.stringify({ nickname: nickname.trim(), avatar }))

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
