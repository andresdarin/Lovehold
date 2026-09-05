'use client'
import { useState, useRef, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { COMPOSER_PLACEHOLDERS } from '../constants'

interface Props { onSend: (text: string) => Promise<boolean>; disabled?: boolean }
export default function MessageComposer({ onSend, disabled }: Props) {
  const [placeholder] = useState(() => COMPOSER_PLACEHOLDERS[Math.floor(Math.random() * COMPOSER_PLACEHOLDERS.length)])
  const [text, setText] = useState('')
  const textarea = useRef<HTMLTextAreaElement>(null)
  const locked = useRef(false)
  useEffect(() => {
    if (textarea.current) { textarea.current.style.height = 'auto'; textarea.current.style.height = `${Math.min(textarea.current.scrollHeight, 120)}px`; textarea.current.scrollTop = textarea.current.scrollHeight }
  }, [text])
  useEffect(() => { if (!disabled) textarea.current?.focus() }, [disabled])
  async function submit() {
    if (disabled || locked.current || !text.trim()) return
    locked.current = true
    try {
      if (await onSend(text.trim())) { setText(''); requestAnimationFrame(() => textarea.current?.focus()) }
    }
    finally { locked.current = false }
  }
  const hasText = Boolean(text.trim())
  return <footer className="sticky bottom-0 z-10 shrink-0 bg-background/80 px-3 pt-2 backdrop-blur-xl sm:px-4 sm:pt-3 pb-[calc(8px+env(safe-area-inset-bottom))]">
    <div className="mx-auto max-w-2xl">
      <label htmlFor="finnic-message" className="sr-only">Mensaje para Finnic</label>
      <div className="relative flex items-end rounded-[1.35rem] bg-surface/95 p-1.5 shadow-[0_4px_20px_rgba(8,58,79,0.12)] ring-1 ring-black/[0.04] focus-within:ring-primary/40 dark:ring-white/[0.08]">
        <textarea id="finnic-message" ref={textarea} value={text}
          onChange={event => setText(event.target.value)}
          onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void submit() } }}
          placeholder={placeholder} rows={1} disabled={disabled}
          className="min-w-0 max-h-[120px] flex-1 resize-none bg-transparent px-3 py-2.5 pr-12 text-base leading-6 text-foreground outline-none placeholder:text-[13px] placeholder:leading-5 placeholder:text-muted-foreground disabled:opacity-60" />
        <button onClick={() => void submit()} disabled={disabled || !hasText} aria-label="Enviar mensaje"
          className="absolute bottom-1.5 right-1.5 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-40">
          <ArrowUp size={19} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  </footer>
}

