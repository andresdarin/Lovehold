'use client'

import { useProfile } from '@/features/auth/ProfileProvider'
import { useFinnicChat } from '@/features/chat/hooks'
import ChatHeader from '@/features/chat/components/ChatHeader'
import MessageList from '@/features/chat/components/MessageList'
import MessageComposer from '@/features/chat/components/MessageComposer'
import { Loader2 } from 'lucide-react'

export default function ChatPage() {
  const { profile } = useProfile()
  const { messages, loading, sending, error, sendMessage } = useFinnicChat()

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      {/* 1. Header Navy Compacto */}
      <ChatHeader />

      {/* Alerta de Error amigable */}
      {error && (
        <div className="mx-auto mt-2 max-w-xl w-full px-4">
          <div className="rounded-2xl border border-danger/30 bg-danger/10 px-3.5 py-2 text-xs font-medium text-danger text-center">
            {error}
          </div>
        </div>
      )}

      {/* 2. Área Central de Mensajes */}
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col min-h-0">
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
          </div>
        ) : (
          <MessageList
            messages={messages}
            sending={sending}
            onSelectSuggestion={sendMessage}
            profile={profile}
          />
        )}
      </div>

      {/* 3. Composer Fijo Inferior */}
      <MessageComposer
        onSend={sendMessage}
        disabled={loading || sending}
      />
    </div>
  )
}
