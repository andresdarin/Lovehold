'use client'
import { useEffect, useRef, useState } from 'react'
type Recognition = {
  lang: string; continuous: boolean; interimResults: boolean
  onresult: ((event: { results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>; resultIndex: number }) => void) | null
  onend: (() => void) | null; onerror: (() => void) | null
  start(): void; stop(): void; abort(): void
}
export function useDictation(onText: (text: string) => void) {
  const [supported, setSupported] = useState(false)
  const [recording, setRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognition = useRef<Recognition | null>(null)
  const callback = useRef(onText)
  useEffect(() => { callback.current = onText }, [onText])
  useEffect(() => {
    const browser = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition }
    const Constructor = browser.SpeechRecognition || browser.webkitSpeechRecognition
    if (!Constructor) return
    const instance = new Constructor()
    instance.lang = 'es-UY'; instance.continuous = true; instance.interimResults = false
    instance.onresult = event => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result?.isFinal) callback.current(result[0].transcript)
      }
    }
    instance.onend = () => setRecording(false)
    instance.onerror = () => { setRecording(false); setError('No pudimos usar el micrófono. Podés escribir el mensaje.') }
    recognition.current = instance; setSupported(true)
    return () => { instance.onend = null; instance.onerror = null; instance.onresult = null; instance.abort() }
  }, [])
  const stop = () => { recognition.current?.stop(); setRecording(false) }
  const toggle = () => {
    if (recording) return stop()
    setError(null)
    try { recognition.current?.start(); setRecording(true) }
    catch { setError('No pudimos iniciar el dictado. Intentá escribir el mensaje.') }
  }
  return { supported, recording, error, stop, toggle }
}

