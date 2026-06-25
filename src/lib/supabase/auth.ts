'use client'

import { createClient } from './client'

export async function signInWithGoogle() {
  console.log('[auth] NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('[auth] NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'OK (definida)' : 'INDEFINIDA')
  console.log('[auth] redirectTo:', `${location.origin}/auth/callback`)
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
    console.log('[auth] signInWithOAuth data:', data)
    console.log('[auth] signInWithOAuth error:', error)
  } catch (e) {
    console.error('[auth] signInWithGoogle falhou:', e)
    alert('Login indisponível no momento. Verifique o console.')
  }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
}

export async function getSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
