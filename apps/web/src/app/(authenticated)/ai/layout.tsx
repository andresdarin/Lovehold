'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LiquidGlass from '@/components/ui/LiquidGlass'
import { useEffect, useState } from 'react'
import { useProfile } from '@/features/auth/ProfileProvider'
import { ErrorState } from '@/features/ai/components/AiUi'
const tabs = [['/ai','Overview'],['/ai/behavior','Behavior'],['/ai/prompts','Prompts'],['/ai/tools','Tools'],['/ai/playground','Playground'],['/ai/versions','Versions']] as const
export default function AiLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); const { isAdmin } = useProfile(); const [apiError, setApiError] = useState<{ status: number; message: string } | null>(null)
  useEffect(() => { setApiError(null); const onError = (event: Event) => setApiError((event as CustomEvent<{ status: number; message: string }>).detail); window.addEventListener('finnic:api-error', onError); return () => window.removeEventListener('finnic:api-error', onError) }, [pathname])
  if (!isAdmin) return <AccessDenied />
  if (apiError) return <div className="mx-auto max-w-[720px] space-y-5"><ErrorState error={apiError.message} /><a href={apiError.status === 401 ? '/login' : '/dashboard'} className="inline-flex rounded-full bg-[#083A4F] px-5 py-3 text-sm font-bold text-white">{apiError.status === 401 ? 'Iniciar sesión' : 'Volver al dashboard'}</a></div>
  return <div className="mx-auto max-w-[1440px] space-y-5"><nav className="overflow-x-auto pb-1"><LiquidGlass variant="nav" className="inline-flex min-w-max gap-1 rounded-full p-1"><div className="flex gap-1">{tabs.map(([href, label]) => <Link key={href} href={href} className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${pathname === href ? 'bg-[#083A4F] text-white shadow-md' : 'text-[#607078] hover:bg-white/70 hover:text-[#083A4F]'}`}>{label}</Link>)}</div></LiquidGlass></nav>{children}</div>
}

function AccessDenied() { return <div className="mx-auto max-w-[720px] rounded-3xl border border-[#DDD9D4] bg-[#FFFDF9] p-8 text-center shadow-sm"><h1 className="text-2xl font-semibold text-[#083A4F]">Acceso restringido</h1><p className="mt-3 text-sm text-[#607078]">No tienes permisos de administrador para la consola Finnic.</p><Link href="/dashboard" className="mt-6 inline-flex rounded-full bg-[#083A4F] px-5 py-3 text-sm font-bold text-white">Volver al dashboard</Link></div> }
