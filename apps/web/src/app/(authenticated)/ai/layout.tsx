'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useProfile } from '@/features/auth/ProfileProvider'
import { ErrorState } from '@/features/ai/components/AiUi'
const tabs = [['/ai','Overview'],['/ai/behavior','Behavior'],['/ai/prompts','Prompts'],['/ai/tools','Tools'],['/ai/playground','Playground'],['/ai/versions','Versions']] as const
export default function AiLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); const { isAdmin } = useProfile(); const [apiError, setApiError] = useState<{ status: number; message: string } | null>(null)
  useEffect(() => { setApiError(null); const onError = (event: Event) => setApiError((event as CustomEvent<{ status: number; message: string }>).detail); window.addEventListener('finnic:api-error', onError); return () => window.removeEventListener('finnic:api-error', onError) }, [pathname])
  if (!isAdmin) return <AccessDenied />
  if (apiError) return <div className="mx-auto max-w-[720px] space-y-5"><ErrorState error={apiError.message} /><a href={apiError.status === 401 ? '/login' : '/dashboard'} className="inline-flex rounded-full bg-[#083A4F] px-5 py-3 text-sm font-bold text-white">{apiError.status === 401 ? 'Iniciar sesión' : 'Volver al dashboard'}</a></div>
  return <div className="mx-auto max-w-[1440px] space-y-5"><nav className="overflow-x-auto pb-1"><div className="inline-flex min-w-max gap-1 rounded-full p-1"><div className="flex gap-1">{tabs.map(([href, label]) => <Link key={href} href={href} className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${pathname === href ? 'bg-[#083A4F] text-white' : 'text-[#607078] hover:bg-white/70 hover:text-[#083A4F]'}`}>{label}</Link>)}</div></div></nav>{children}</div>
}

function AccessDenied() { return <div className="neu-raised mx-auto max-w-[720px] rounded-3xl border border-border bg-surface p-8 text-center"><h1 className="text-2xl font-semibold text-foreground">Acceso restringido</h1><p className="mt-3 text-sm text-muted-foreground">No tienes permisos de administrador para la consola Finnic.</p><Link href="/dashboard" className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">Volver al dashboard</Link></div> }
