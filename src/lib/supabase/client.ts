import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY)

export function createClient() {
  if (!supabaseConfigured) {
    throw new Error('Supabase não configurado — adicione NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local')
  }
  return createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
}
