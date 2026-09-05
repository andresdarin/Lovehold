'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { chatRequest } from './api'
import type { AiConversation, AiMessage, AgentResponse } from './types'

export function useFinnicChat() {
  const [conversation, setConversation] = useState<AiConversation | null>(null)
  const [messages, setMessages] = useState<AiMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const busy = useRef(false)
  const refresh = useCallback(async () => {
    if (busy.current) return
    setLoading(true)
    try {
      const active = await chatRequest<AiConversation>('/api/ai/chat/active')
      const history = await chatRequest<AiMessage[]>(`/api/ai/conversations/${active.id}/messages`)
      setConversation(active); setMessages(history); setError(null)
    } catch { setError('No pudimos cargar la conversación. Volvé a cargar para recuperar el historial.') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void refresh() }, [refresh])

  const sendMessage = async (content: string): Promise<boolean> => {
    const text = content.trim()
    if (!text || text.length > 2000 || busy.current || !conversation) return false
    busy.current = true; setSending(true); setError(null)
    try {
      await chatRequest<AgentResponse>('/api/ai/chat', { message: text, conversationId: conversation.id })
      setMessages(await chatRequest<AiMessage[]>(`/api/ai/conversations/${conversation.id}/messages`))
      return true
    } catch {
      setError('No pudimos verificar la respuesta. Conservamos tu texto: revisá el historial antes de volver a enviarlo.')
      return false
    } finally { busy.current = false; setSending(false) }
  }

  const resolveAction = async (id: string, decision: 'confirm' | 'cancel') => {
    if (busy.current || !conversation) return
    busy.current = true; setSending(true); setError(null)
    try {
      await chatRequest(`/api/ai/actions/${id}/${decision}`, {})
      setMessages(await chatRequest<AiMessage[]>(`/api/ai/conversations/${conversation.id}/messages`))
    } catch { setError('No pudimos verificar la operación. Volvé a cargar el historial antes de intentar confirmarla otra vez.') }
    finally { busy.current = false; setSending(false) }
  }
  return { conversation, messages, loading, sending, error, sendMessage, resolveAction, refresh }
}

