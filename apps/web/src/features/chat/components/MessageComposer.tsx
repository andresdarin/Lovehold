'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ArrowUp, Mic, MicOff } from 'lucide-react'

interface MessageComposerProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export default function MessageComposer({ onSend, disabled }: MessageComposerProps) {
  const [text, setText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)

  // Inicializar SpeechRecognition si el navegador lo soporta
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'es-UY'

      recognition.onresult = (event: any) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        if (transcript) {
          setText((prev) => {
            const separator = prev && !prev.endsWith(' ') ? ' ' : ''
            return `${prev}${separator}${transcript}`.trim()
          })
        }
      }

      recognition.onerror = () => {
        setIsRecording(false)
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current = recognition
    }
  }, [])

  function toggleRecording() {
    if (!recognitionRef.current) {
      alert('El dictado por voz no está disponible en este navegador.')
      return
    }

    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsRecording(true)
      } catch (err) {
        console.error('Error iniciando dictado:', err)
      }
    }
  }

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`
    }
  }, [text])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function submit() {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsRecording(false)
    }
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  return (
    <footer className="sticky bottom-0 z-30 w-full bg-transparent px-3.5 sm:px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-2 select-none pointer-events-auto">
      {/* Pill flotante sin contenedor rectangular */}
      <div className="mx-auto flex max-w-xl items-end gap-2">
        {/* Input Pill Principal */}
        <div className="neu-inset flex flex-1 items-center gap-2 rounded-full border border-border/50 px-4 py-1.5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15 transition-all">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? 'Escuchando audio...' : 'Escribile a Finnic...'}
            rows={1}
            disabled={disabled}
            className="max-h-24 flex-1 resize-none bg-transparent py-1.5 text-xs sm:text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
          />

          {/* Botón de Audio / Dictado integrado en la pill */}
          <button
            type="button"
            onClick={toggleRecording}
            disabled={disabled}
            aria-label={isRecording ? 'Detener dictado' : 'Enviar por audio'}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all active:scale-95 cursor-pointer focus:outline-none ${
              isRecording
                ? 'bg-danger text-white animate-pulse shadow-xs'
                : 'text-muted-foreground hover:bg-surface-soft hover:text-primary'
            }`}
            title={isRecording ? 'Detener dictado' : 'Dictar mensaje por voz'}
          >
            {isRecording ? <MicOff className="h-4 w-4 stroke-[2.2]" /> : <Mic className="h-4 w-4 stroke-[2]" />}
          </button>
        </div>

        {/* Botón Circular de Enviar Flotante */}
        <button
          type="button"
          onClick={submit}
          disabled={!text.trim() || disabled}
          aria-label="Enviar mensaje"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#083A4F] hover:bg-[#062c3c] text-white dark:bg-[#C0D5D6] dark:text-[#083A4F] shadow-md transition-all active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer focus:outline-none"
        >
          <ArrowUp className="h-4 w-4 stroke-[2.5]" />
        </button>
      </div>
    </footer>
  )
}
