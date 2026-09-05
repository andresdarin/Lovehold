'use client'
import { useFinnicChat } from '@/features/chat/hooks'
import ChatHeader from '@/features/chat/components/ChatHeader'
import MessageList from '@/features/chat/components/MessageList'
import MessageComposer from '@/features/chat/components/MessageComposer'
export default function ChatPage() {
  const { conversation, messages, loading, sending, error, sendMessage, resolveAction, refresh } = useFinnicChat()
  return <div className="flex h-dvh flex-col overflow-hidden bg-background">
    <ChatHeader />
    {error && <div role="alert" className="mx-auto mt-3 w-full max-w-2xl px-4"><div className="rounded-xl border border-danger/40 bg-surface p-3 text-sm">
      <p>{error}</p><button disabled={sending} onClick={refresh} className="mt-1 min-h-11 text-primary underline underline-offset-4">Volver a cargar historial</button>
    </div></div>}
    <div className="mx-auto flex w-full max-w-2xl min-h-0 flex-1 flex-col">
      {loading ? <div role="status" className="space-y-4 p-6"><p className="text-sm text-muted-foreground">Cargando conversación…</p>{[1, 2, 3].map(n => <div key={n} className="h-16 rounded-2xl bg-surface-soft motion-safe:animate-pulse" />)}</div>
        : <MessageList messages={messages} sending={sending} onSelectSuggestion={sendMessage} onResolveAction={resolveAction} />}
    </div>
    <MessageComposer key={conversation?.id ?? 'new'} onSend={sendMessage} disabled={loading || sending} />
  </div>
}

