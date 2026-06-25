'use client'

import { createClient } from './client'

export async function signInWithGoogle() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? location.origin
  const redirectTo = `${base}/auth/callback`
  console.log('[auth] redirectTo:', redirectTo)
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
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
