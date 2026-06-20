'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { connectSocket } from '@/lib/socket/client'

type View = 'home' | 'create' | 'join'

export default function HomePage() {
  const router = useRouter()
  const [view, setView] = useState<View>('home')
  const [nickname, setNickname] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleCreate() {
    setError('')
    if (nickname.trim().length < 3) {
      setError('Nickname precisa ter pelo menos 3 letras')
      return
    }
    setLoading(true)
    const socket = connectSocket()
    socket.once('connect', () => {
      socket.emit('room:create', nickname.trim(), (res) => {
        setLoading(false)
        if (res.error) {
          setError(res.error)
          return
        }
        sessionStorage.setItem('nickname', nickname.trim())
        sessionStorage.setItem('playerId', socket.id ?? '')
        router.push(`/room/${res.code}`)
      })
    })
    if (socket.connected) {
      socket.emit('room:create', nickname.trim(), (res) => {
        setLoading(false)
        if (res.error) {
          setError(res.error)
          return
        }
        sessionStorage.setItem('nickname', nickname.trim())
        sessionStorage.setItem('playerId', socket.id ?? '')
        router.push(`/room/${res.code}`)
      })
    }
  }

  function handleJoin() {
    setError('')
    if (nickname.trim().length < 3) {
      setError('Nickname precisa ter pelo menos 3 letras')
      return
    }
    if (code.trim().length < 6) {
      setError('Código inválido')
      return
    }
    setLoading(true)
    const socket = connectSocket()
    const doJoin = () => {
      socket.emit('room:join', code.trim().toUpperCase(), nickname.trim(), (res) => {
        setLoading(false)
        if (!res.ok) {
          setError(res.error ?? 'Erro ao entrar na sala')
          return
        }
        sessionStorage.setItem('nickname', nickname.trim())
        sessionStorage.setItem('playerId', socket.id ?? '')
        router.push(`/room/${code.trim().toUpperCase()}`)
      })
    }
    if (socket.connected) doJoin()
    else socket.once('connect', doJoin)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="animate-slide-up">
          <Image
            src="/inicio.png"
            alt="STOP - ADEDONHA"
            width={280}
            height={140}
            priority
            className="drop-shadow-[0_0_30px_rgba(255,107,107,0.5)]"
          />
        </div>

        {view === 'home' && (
          <div className="flex flex-col w-full gap-4 animate-slide-up">
            <button
              onClick={() => setView('create')}
              className="w-full py-4 text-xl font-bold rounded-2xl bg-coral text-white shadow-lg active:scale-95 transition-transform"
              style={{ backgroundColor: '#FF6B6B' }}
            >
              Criar Sala
            </button>
            <button
              onClick={() => setView('join')}
              className="w-full py-4 text-xl font-bold rounded-2xl border-2 text-white active:scale-95 transition-transform"
              style={{ borderColor: '#4ECDC4', color: '#4ECDC4' }}
            >
              Entrar na Sala
            </button>
          </div>
        )}

        {(view === 'create' || view === 'join') && (
          <div className="flex flex-col w-full gap-4 animate-slide-up">
            <button
              onClick={() => { setView('home'); setError('') }}
              className="self-start text-sm opacity-60 hover:opacity-100 transition-opacity"
            >
              ← Voltar
            </button>

            <h2 className="text-2xl font-bold text-center">
              {view === 'create' ? 'Criar Sala' : 'Entrar na Sala'}
            </h2>

            <input
              type="text"
              placeholder="Seu apelido"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              className="w-full px-4 py-4 text-lg rounded-2xl text-white placeholder-white/40 outline-none focus:ring-2"
              style={{ backgroundColor: '#0F3460', border: '2px solid #16213E' }}
              onFocus={(e) => (e.target.style.borderColor = '#4ECDC4')}
              onBlur={(e) => (e.target.style.borderColor = '#16213E')}
            />

            {view === 'join' && (
              <input
                type="text"
                placeholder="Código da sala"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full px-4 py-4 text-lg rounded-2xl text-white placeholder-white/40 outline-none focus:ring-2 tracking-widest uppercase"
                style={{ backgroundColor: '#0F3460', border: '2px solid #16213E' }}
                onFocus={(e) => (e.target.style.borderColor = '#FFD93D')}
                onBlur={(e) => (e.target.style.borderColor = '#16213E')}
              />
            )}

            {error && (
              <p className="text-center text-sm font-medium" style={{ color: '#FF6B6B' }}>
                {error}
              </p>
            )}

            <button
              onClick={view === 'create' ? handleCreate : handleJoin}
              disabled={loading}
              className="w-full py-4 text-xl font-bold rounded-2xl text-white shadow-lg active:scale-95 transition-all disabled:opacity-50"
              style={{ backgroundColor: view === 'create' ? '#FF6B6B' : '#4ECDC4', color: view === 'create' ? 'white' : '#1A1A2E' }}
            >
              {loading ? 'Aguarde...' : view === 'create' ? 'Criar' : 'Entrar'}
            </button>
          </div>
        )}

        <p className="text-sm opacity-30 mt-4">Sem cadastro. É só jogar.</p>
      </div>
    </main>
  )
}
