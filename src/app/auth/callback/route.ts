import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  // Dentro do Docker atrás do Traefik, origin vira http://localhost:3000
  // Usar NEXT_PUBLIC_BASE_URL como base confiável quando disponível
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? origin
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('id', user.id)
          .single()

        if (!profile?.nickname || profile.nickname === user.email?.split('@')[0]) {
          return NextResponse.redirect(`${base}/onboarding`)
        }
      }
      return NextResponse.redirect(`${base}${next}`)
    }
  }

  return NextResponse.redirect(`${base}/?error=auth`)
}
