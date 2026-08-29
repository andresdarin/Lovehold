'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { apiFetch } from '@/lib/api'
import type { AiConversation, AiMessage, SendMessageResponse } from './types'

export function useFinnicChat() {
  const [conversation, setConversation] = useState<AiConversation | null>(null)
  const [messages, setMessages] = useState<AiMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Cargar o inicializar la conversación activa
  const loadConversation = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const activeConv = await apiFetch<AiConversation>('/api/ai/chat/active', {}, session.access_token)
      setConversation(activeConv)

      const history = await apiFetch<AiMessage[]>(
        `/api/ai/chat/conversations/${activeConv.id}/messages`,
        {},
        session.access_token,
      )
      setMessages(history)
    } catch (err: any) {
      console.error('Error cargando chat:', err)
      setError(err?.message || 'No pudimos cargar la conversación con Finnic.')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadConversation()
  }, [loadConversation])

  // Enviar mensaje
  const sendMessage = useCallback(
    async (content: string) => {
      const text = content.trim()
      if (!text || sending || !conversation) return

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const tempId = `temp-${Date.now()}`
      const optimisticUserMsg: AiMessage = {
        id: tempId,
        conversationId: conversation.id,
        role: 'USER',
        content: text,
        createdAt: new Date().toISOString(),
      }

      // Optimistic update
      setMessages((prev) => [...prev, optimisticUserMsg])
      setSending(true)
      setError(null)

      try {
        const res = await apiFetch<SendMessageResponse>(
          `/api/ai/chat/conversations/${conversation.id}/messages`,
          {
            method: 'POST',
            body: JSON.stringify({ content: text }),
          },
          session.access_token,
        )

        // Reemplazar mensaje temporal con el confirmado y agregar respuesta del asistente
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempId),
          res.userMessage,
          res.assistantMessage,
        ])
      } catch (err: any) {
        console.error('Error enviando mensaje:', err)
        setError(err?.message || 'Finnic no pudo responder en este momento. Intentá nuevamente.')
      } finally {
        setSending(false)
      }
    },
    [conversation, sending, supabase],
  )

  return {
    conversation,
    messages,
    loading,
    sending,
    error,
    sendMessage,
    refresh: loadConversation,
  }
}
