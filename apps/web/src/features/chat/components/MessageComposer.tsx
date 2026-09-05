'use client'
import { useState, useRef, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { useDictation } from '../useDictation'

interface Props { onSend: (text: string) => Promise<boolean>; disabled?: boolean }
export default function MessageComposer({ onSend, disabled }: Props) {
  const [text, setText] = useState('')
  const textarea = useRef<HTMLTextAreaElement>(null)
  const locked = useRef(false)
  const dictation = useDictation(part => setText(prev => `${prev} ${part}`.trim().slice(0, 2000)))
  useEffect(() => {
    if (textarea.current) { textarea.current.style.height = 'auto'; textarea.current.style.height = `${Math.min(textarea.current.scrollHeight, 144)}px` }
  }, [text])
  async function submit() {
    if (disabled || locked.current || !text.trim()) return
    locked.current = true; dictation.stop()
    try { if (await onSend(text.trim())) setText('') }
    finally { locked.current = false }
  }
  return <footer className="shrink-0 border-t border-border bg-background px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
    <div className="mx-auto max-w-2xl">
      <label htmlFor="finnic-message" className="sr-only">Mensaje para Finnic</label>
      <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface p-2 focus-within:border-primary">
        <textarea id="finnic-message" ref={textarea} value={text} maxLength={2000}
          onChange={event => setText(event.target.value)}
          onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void submit() } }}
          placeholder="Preguntá o contame qué querés registrar…" rows={1} disabled={disabled}
          className="min-w-0 max-h-36 flex-1 resize-none bg-transparent px-2 py-2.5 text-base text-foreground placeholder:text-muted-foreground disabled:opacity-60" />
        <button onClick={() => void submit()} disabled={disabled || !text.trim()} aria-label="Enviar mensaje"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-40"><ArrowUp size={20} /></button>
      </div>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        {dictation.supported ? <button disabled={disabled} aria-pressed={dictation.recording} onClick={dictation.toggle} className="min-h-11 px-1 underline underline-offset-4">{dictation.recording ? 'Detener dictado' : 'Dictar mensaje'}</button> : <span className="py-2">Shift + Enter para una nueva línea</span>}
        <span>{text.length}/2000</span>
      </div>
      {dictation.error && <p role="status" className="text-sm text-danger">{dictation.error}</p>}
    </div>
  </footer>
}

