'use client'

import React, { useRef, useEffect } from 'react'
import type { AiMessage } from '../types'
import FinnicMarkdown from './FinnicMarkdown'

interface MessageListProps {
  messages: AiMessage[]
  sending: boolean
  onSelectSuggestion: (text: string) => void
  profile?: {
    displayName: string | null
    email: string
    color: string
    avatarUrl?: string | null
  } | null
}

const INITIAL_SUGGESTIONS = [
  '¿Cómo vienen mis gastos este mes?',
  'Ayudame a organizar mis finanzas',
  'Quiero ahorrar más este mes',
]

export default function MessageList({ messages, sending, onSelectSuggestion, profile }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  const userInitial = (profile?.displayName?.[0] ?? profile?.email?.[0] ?? 'U').toUpperCase()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 text-center select-none space-y-4">
        {/* Mascota Finnic y Saludo Inicial */}
        <div className="flex flex-col items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <img
              src="/brand/finnic-mascot.png"
              alt="Finnic el búho financiero"
              className="h-36 w-36 sm:h-40 sm:w-40 object-contain drop-shadow-sm transition-transform hover:scale-105 pointer-events-none select-none"
            />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-foreground">
              ¡Hola! Soy Finnic
            </h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-[280px] leading-relaxed">
              Tu copiloto financiero para entender tus números, revisar gastos y planificar tus metas.
            </p>
          </div>
        </div>

        {/* Sugerencias Rápidas */}
        <div className="w-full max-w-sm flex flex-col gap-2 pt-1">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Podés preguntarme
          </p>
          {INITIAL_SUGGESTIONS.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectSuggestion(suggestion)}
              className="w-full text-left px-3.5 py-2.5 rounded-2xl border border-border/80 bg-surface hover:bg-surface-soft hover:border-primary/30 text-xs font-semibold text-foreground transition-all shadow-xs active:scale-[0.99] cursor-pointer"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-3.5">
      {messages.map((msg) => {
        const isUser = msg.role === 'USER'
        return (
          <div
            key={msg.id}
            className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-end gap-2 ${isUser ? 'max-w-[85%] sm:max-w-[78%] flex-row-reverse' : 'max-w-[90%] sm:max-w-[85%] flex-row'}`}>
              {/* Avatar */}
              {isUser ? (
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold shadow-2xs overflow-hidden ring-1 ring-primary/30 text-white"
                  style={{
                    background: `linear-gradient(135deg, ${profile?.color ?? '#407E8C'}ee, #083A4F)`,
                  }}
                >
                  {profile?.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt="Foto de perfil"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{userInitial}</span>
                  )}
                </div>
              ) : (
                <img
                  src="/brand/finnic-avatar.png"
                  alt="Finnic"
                  className="h-9 w-9 shrink-0 object-contain drop-shadow-xs -mb-0.5"
                />
              )}

              {/* Burbuja del mensaje */}
              <div
                className={`rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-[#083A4F] text-white dark:bg-[#C0D5D6] dark:text-[#083A4F] font-medium rounded-br-xs'
                    : 'bg-surface border border-border/80 text-foreground font-normal rounded-bl-xs'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                ) : (
                  <div className="prose-finnic">
                    <FinnicMarkdown content={msg.content} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* Indicador de Pensando */}
      {sending && (
        <div className="flex justify-start items-end gap-2">
          <img
            src="/brand/finnic-avatar.png"
            alt="Finnic pensando"
            className="h-9 w-9 shrink-0 object-contain drop-shadow-xs animate-pulse -mb-0.5"
          />
          <div className="rounded-2xl rounded-bl-xs border border-border/80 bg-surface px-4 py-2.5 shadow-xs flex items-center gap-1.5">
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
