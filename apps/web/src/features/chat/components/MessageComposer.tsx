'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { COMPOSER_PLACEHOLDERS } from '../constants'

interface Props {
  onSend: (text: string) => Promise<boolean>
  disabled?: boolean
}

/**
 * Compositor de mensajes para el Copiloto Finnic.
 * Soporta geometría dinámica:
 * - 'rounded-full' cuando tiene una sola línea con centrado vertical óptico exacto.
 * - 'rounded-[1.75rem]' cuando el texto se expande a múltiples líneas.
 */
export default function MessageComposer({ onSend, disabled }: Props) {
  const [placeholder] = useState(
    () => COMPOSER_PLACEHOLDERS[Math.floor(Math.random() * COMPOSER_PLACEHOLDERS.length)]
  )
  const [text, setText] = useState('')
  const [isMultiLine, setIsMultiLine] = useState(false)
  const textarea = useRef<HTMLTextAreaElement>(null)
  const locked = useRef(false)

  useEffect(() => {
    if (textarea.current) {
      textarea.current.style.height = 'auto'
      const scrollH = textarea.current.scrollHeight
      const multi = scrollH > 44 || text.includes('\n')
      setIsMultiLine(multi)
      textarea.current.style.height = multi ? `${Math.min(scrollH, 120)}px` : '40px'
      textarea.current.scrollTop = textarea.current.scrollHeight
    }
  }, [text])

  useEffect(() => {
    if (!disabled) {
      textarea.current?.focus()
    }
  }, [disabled])

  async function submit() {
    if (disabled || locked.current || !text.trim()) return
    locked.current = true
    try {
      if (await onSend(text.trim())) {
        setText('')
        requestAnimationFrame(() => textarea.current?.focus())
      }
    } finally {
      locked.current = false
    }
  }

  const hasText = Boolean(text.trim())

  return (
    <footer className="sticky bottom-0 z-10 shrink-0 bg-background/80 px-3 pt-2 backdrop-blur-xl sm:px-4 sm:pt-3 pb-[calc(8px+env(safe-area-inset-bottom))] select-none">
      <div className="mx-auto max-w-2xl">
        <label htmlFor="finnic-message" className="sr-only">
          Mensaje para Finnic
        </label>
        <div
          className={`relative flex w-full bg-surface/95 p-1.5 shadow-[0_4px_20px_rgba(8,58,79,0.12)] ring-1 ring-black/[0.06] focus-within:ring-primary/40 dark:ring-white/[0.08] transition-[border-radius] duration-200 ${
            isMultiLine
              ? 'items-end rounded-[1.75rem]'
              : 'items-center rounded-full'
          }`}
        >
          <textarea
            id="finnic-message"
            ref={textarea}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault()
                void submit()
              }
            }}
            placeholder={placeholder}
            rows={1}
            disabled={disabled}
            className={`min-w-0 max-h-[120px] flex-1 resize-none bg-transparent pl-4.5 sm:pl-5 pr-13 text-[13.5px] sm:text-[14px] leading-5 text-foreground outline-none placeholder:text-[13.5px] placeholder:leading-5 placeholder:text-muted-foreground disabled:opacity-60 ${
              isMultiLine ? 'py-2.5' : 'py-2.5'
            }`}
          />

          <button
            onClick={() => void submit()}
            disabled={disabled || !hasText}
            aria-label="Enviar mensaje"
            className={`absolute right-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs transition-all hover:bg-primary-hover active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${
              isMultiLine ? 'bottom-1.5' : 'top-1/2 -translate-y-1/2'
            }`}
          >
            <ArrowUp size={19} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </footer>
  )
}
