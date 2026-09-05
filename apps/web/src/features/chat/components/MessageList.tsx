'use client'
import { useRef, useEffect } from 'react'
import { ArrowRight, CheckCircle2, CircleAlert, Clock3, SearchCheck } from 'lucide-react'
import type { AiMessage } from '../types'
import FinnicMarkdown from './FinnicMarkdown'

interface Props {
  messages: AiMessage[]; sending: boolean
  onSelectSuggestion: (text: string) => void
  onResolveAction: (id: string, decision: 'confirm' | 'cancel') => void
  profile?: { displayName: string | null; email: string; color: string; avatarUrl?: string | null } | null
}
const suggestions = ['¿Cómo registro un gasto?', '¿Cuánto gasté este mes?', '¿Por qué mi saldo disponible es ese?']

export default function MessageList({ messages, sending, onSelectSuggestion, onResolveAction }: Props) {
  const scroll = useRef<HTMLDivElement>(null)
  const atBottom = useRef(true)
  useEffect(() => {
    const element = scroll.current
    if (element && atBottom.current) element.scrollTo({ top: element.scrollHeight, behavior: 'instant' })
  }, [messages, sending])
  return <div ref={scroll} onScroll={() => { const el = scroll.current; if (el) atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100 }} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-5 sm:px-4 sm:py-6">
    {!messages.length ? <div className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-5">
      <div><img src="/brand/finnic-mascot.png" alt="" className="h-20 w-20 object-contain sm:h-28 sm:w-28" />
        <h2 className="mt-3 text-xl font-semibold sm:text-2xl">Tus números, más claros.</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-relaxed">Revisemos tus movimientos y las opciones que tenés. Si querés registrar un gasto, te mostraré los datos antes de confirmarlo.</p>
      </div>
      <div className="divide-y divide-border">{suggestions.map(text => <button key={text} disabled={sending} onClick={() => onSelectSuggestion(text)} className="flex min-h-14 w-full items-center justify-between gap-3 py-3 text-left text-sm font-medium hover:text-primary"><span>{text}</span><ArrowRight size={18} className="shrink-0" /></button>)}</div>
    </div> : <div role="log" aria-label="Conversación con Finnic" aria-live="polite" className="space-y-4 sm:space-y-5">
      {messages.filter(msg => msg.role !== 'SYSTEM' && !msg.metadata?.functionCall && !msg.metadata?.functionResponse).map(msg => {
        const user = msg.role === 'USER'; const meta = msg.metadata; const pending = meta?.pendingActionId; const status = meta?.actionStatus
        const label = status === 'completed' ? 'Acción registrada' : status === 'executing' ? 'Operación en curso' : status === 'cancelled' ? 'Propuesta cancelada' : status === 'expired' ? 'Propuesta vencida' : status === 'failed' || meta?.kind === 'error' ? 'No se pudo completar' : pending ? 'Revisá antes de confirmar' : meta?.kind === 'query' ? 'Consulta completada' : null
        const Icon = status === 'completed' ? CheckCircle2 : status === 'failed' || meta?.kind === 'error' ? CircleAlert : pending ? Clock3 : SearchCheck
        return <article key={msg.id} className={user ? 'ml-auto max-w-[91%] sm:max-w-[88%]' : 'max-w-[96%] sm:max-w-full'}>
          <p className="mb-1 text-[11px] font-medium text-muted-foreground sm:text-xs">{user ? 'Vos' : 'Finnic'}</p>
          <div className={user ? 'rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2.5 text-primary-foreground sm:px-4 sm:py-3' : 'rounded-2xl rounded-tl-sm bg-surface px-3.5 py-3 shadow-sm ring-1 ring-black/[0.03] sm:px-4 sm:py-4'}>
            {label && <p className="mb-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground"><Icon size={16} />{label}</p>}
            {user ? <p className="whitespace-pre-wrap break-words text-[15px] leading-6 sm:text-base">{msg.content}</p> : <div className="prose-finnic text-[15px] leading-6 sm:text-base"><FinnicMarkdown content={msg.content} /></div>}
            {pending && status === 'pending' && <div className="mt-4 flex flex-wrap gap-2"><button disabled={sending} onClick={() => onResolveAction(pending, 'confirm')} className="min-h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">Confirmar gasto</button><button disabled={sending} onClick={() => onResolveAction(pending, 'cancel')} className="min-h-11 rounded-xl border border-border px-4 text-sm hover:bg-surface-soft disabled:opacity-50">Cancelar</button></div>}
          </div>
        </article>
      })}
    </div>}
    {sending && <p role="status" className="mt-4 text-sm text-muted-foreground">Esperando respuesta de Finnic…</p>}
  </div>
}
