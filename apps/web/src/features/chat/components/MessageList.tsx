'use client'

import React, { useRef, useEffect } from 'react'
import { Sparkles, Bot, User } from 'lucide-react'
import type { AiMessage } from '../types'

interface MessageListProps {
  messages: AiMessage[]
  sending: boolean
  onSelectSuggestion: (text: string) => void
}

const INITIAL_SUGGESTIONS = [
  '¿Cómo vienen mis gastos este mes?',
  'Ayudame a organizar mis finanzas',
  'Quiero ahorrar más este mes',
]

export default function MessageList({ messages, sending, onSelectSuggestion }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 text-center select-none space-y-5">
        {/* Isotipo y Saludo Inicial */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-xs">
            <Sparkles className="h-6 w-6 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-foreground">
              ¡Hola! Soy Finnic
            </h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-[280px] leading-relaxed">
              Tu copiloto financiero para entender tus números, revisar gastos y planificar tus metas.
            </p>
          </div>
        </div>

        {/* Sugerencias Rápidas */}
        <div className="w-full max-w-sm flex flex-col gap-2 pt-2">
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
            <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[78%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Icono discreto de avatar */}
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] shadow-2xs ${
                  isUser
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-primary/20 bg-primary/10 text-primary'
                }`}
              >
                {isUser ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
              </div>

              {/* Burbuja del mensaje */}
              <div
                className={`rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-[#083A4F] text-white dark:bg-[#C0D5D6] dark:text-[#083A4F] font-medium rounded-br-xs'
                    : 'bg-surface border border-border/80 text-foreground font-normal rounded-bl-xs'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              </div>
            </div>
          </div>
        )
      })}

      {/* Indicador de Pensando */}
      {sending && (
        <div className="flex justify-start items-end gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
            <Bot className="h-3 w-3" />
          </div>
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
