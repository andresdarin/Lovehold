'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { apiFetch } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    const session = data.session

    if (!session) {
      setError('No se pudo obtener la sesión. Revisá tus credenciales.')
      setLoading(false)
      return
    }

    try {
      await apiFetch('/api/profiles/ensure', {
        method: 'POST',
        body: JSON.stringify({}),
      }, session.access_token)

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar con el servidor')
      setLoading(false)
    }
  }

  return (
    <>
      {/* ═══════════ DESKTOP ═══════════ */}
      <main className="hidden min-h-screen overflow-hidden bg-[#FFF8F1] lg:block">
        {/* Left content column */}
        <section className="relative z-10 flex min-h-screen w-[40vw] max-w-[460px] flex-col justify-center ml-[72px]">
          <img
            src="/brand/lovehold-icon.svg"
            alt="Lovehold"
            className="h-10 w-10"
          />

          <h1 className="mt-10 text-5xl font-bold leading-tight text-[#2D255F]">
            Welcome to
            <br />
            Lovehold
          </h1>

          <p className="mt-3 text-lg text-[#2D255F]/60">
            Compartan todo. Lleven cuentas de lo que importa.
          </p>

          <h2 className="mt-10 text-xl font-semibold text-[#2D255F]">
            Iniciar sesión
          </h2>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-[#2D255F]/70"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#2D255F]/40" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full rounded-xl border border-[#E5E0D6] bg-white py-3.5 pl-11 pr-4 text-[#2D255F] placeholder:text-[#2D255F]/30 outline-none transition-colors focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-[#2D255F]/70"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#2D255F]/40" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#E5E0D6] bg-white py-3.5 pl-11 pr-4 text-[#2D255F] placeholder:text-[#2D255F]/30 outline-none transition-colors focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-xl bg-[#FF6B6B]/10 px-4 py-3 text-sm text-[#FF6B6B]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-[#FF6B6B] to-[#FF3D8B] py-3.5 font-semibold text-white shadow-lg shadow-[#FF6B6B]/25 transition-all hover:shadow-xl hover:shadow-[#FF6B6B]/30 disabled:opacity-50"
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#2D255F]/50">
            ¿No tenés cuenta?{' '}
            <Link
              href="/signup"
              className="font-medium text-[#FF6B6B] hover:underline"
            >
              Registrate
            </Link>
          </p>
        </section>

        {/* Right image — the curve IS the left border of this container */}
        <section
          className="absolute right-0 top-0 h-full w-[62vw] overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage: 'url(/brand/lovehold-bg.png)',
            borderTopLeftRadius: '48% 58%',
            borderBottomLeftRadius: '48% 58%',
          }}
        />
      </main>

      {/* ═══════════ MOBILE ═══════════ */}
      <main className="flex min-h-screen flex-col bg-[#FFF8F1] lg:hidden">
        <div className="h-[240px] shrink-0 overflow-hidden">
          <img
            src="/brand/lovehold-bg.png"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>

        <section className="relative -mt-8 flex flex-1 flex-col rounded-t-[32px] bg-[#FFF8F1] px-6 py-8">
          <div className="mx-auto w-full max-w-sm">
            <img
              src="/brand/lovehold-icon.svg"
              alt="Lovehold"
              className="h-10 w-10"
            />

            <h1 className="mt-8 text-4xl font-bold leading-tight text-[#2D255F]">
              Welcome to
              <br />
              Lovehold
            </h1>

            <p className="mt-2 text-lg text-[#2D255F]/60">
              Compartan todo. Lleven cuentas de lo que importa.
            </p>

            <h2 className="mt-8 text-xl font-semibold text-[#2D255F]">
              Iniciar sesión
            </h2>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
              <div>
                <label
                  htmlFor="email-mobile"
                  className="mb-1.5 block text-sm font-medium text-[#2D255F]/70"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#2D255F]/40" />
                  <input
                    id="email-mobile"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full rounded-xl border border-[#E5E0D6] bg-white py-3.5 pl-11 pr-4 text-[#2D255F] placeholder:text-[#2D255F]/30 outline-none transition-colors focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password-mobile"
                  className="mb-1.5 block text-sm font-medium text-[#2D255F]/70"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#2D255F]/40" />
                  <input
                    id="password-mobile"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-[#E5E0D6] bg-white py-3.5 pl-11 pr-4 text-[#2D255F] placeholder:text-[#2D255F]/30 outline-none transition-colors focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20"
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-xl bg-[#FF6B6B]/10 px-4 py-3 text-sm text-[#FF6B6B]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-[#FF6B6B] to-[#FF3D8B] py-3.5 font-semibold text-white shadow-lg shadow-[#FF6B6B]/25 transition-all hover:shadow-xl hover:shadow-[#FF6B6B]/30 disabled:opacity-50"
              >
                {loading ? 'Entrando…' : 'Entrar'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-[#2D255F]/50">
              ¿No tenés cuenta?{' '}
              <Link
                href="/signup"
                className="font-medium text-[#FF6B6B] hover:underline"
              >
                Registrate
              </Link>
            </p>
          </div>
        </section>
      </main>
    </>
  )
}
