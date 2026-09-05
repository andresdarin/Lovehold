import type { ChatMessage } from '../client/gemini.types'
export function agentHistory(messages: Array<{ role: string; content: string; metadata?: unknown }>): ChatMessage[] {
  return messages.flatMap(message => {
    if (message.role === 'SYSTEM') return []
    const metadata = message.metadata as { modelContent?: ChatMessage; toolResponse?: ChatMessage; functionCall?: unknown; functionResponse?: unknown } | null
    if (metadata?.modelContent && metadata?.toolResponse) return [metadata.modelContent, metadata.toolResponse]
    if (metadata?.functionCall || metadata?.functionResponse) return []
    return [{ role: message.role === 'USER' ? 'user' : 'model', parts: [{ text: message.content }] } as ChatMessage]
  })
}
export function actionDescription(name: string, args: Record<string, unknown>, fallback: string) {
  if (name !== 'create_expense') return fallback
  const date = typeof args.date === 'string' ? args.date.slice(0, 10) : 'hoy'
  return `Registrar gasto: ${String(args.title || 'sin título')} · ${String(args.currency || 'moneda pendiente')} ${String(args.amount ?? '')} · categoría: ${String(args.category || 'pendiente')} · fecha: ${date}${args.financeAccountId ? ' · cuenta seleccionada' : ' · cuenta automática de la misma moneda'}${args.notes ? ` · nota: ${String(args.notes)}` : ''}.`
}

