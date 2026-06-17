import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function createClient() {
  if (client) return client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    if (typeof window === 'undefined') {
      return createStubClient()
    }
    throw new Error(
      'Las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY son requeridas.'
    )
  }

  client = createBrowserClient(supabaseUrl, supabaseKey)
  return client
}

function createStubClient(): SupabaseClient {
  const stub = {} as SupabaseClient
  const trap = () => { throw new Error('Supabase client no disponible durante la generación estática') }
  stub.auth = { getSession: trap, signOut: trap, signInWithPassword: trap, signUp: trap } as any
  return stub
}
