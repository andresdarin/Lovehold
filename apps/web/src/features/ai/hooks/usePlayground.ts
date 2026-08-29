'use client'
import { useState } from 'react'
import { aiMutation } from './useAiAdmin'
import type { Environment, PlaygroundMode } from '../types'

const safe = (value: unknown) => typeof value === 'string' ? value.slice(0, 500) : JSON.stringify(value ?? '').slice(0, 500)
export function usePlayground() {
  const [result, setResult] = useState<any>(null); const [sending, setSending] = useState(false); const [error, setError] = useState<string | null>(null)
  const send = async (message: string, mode: PlaygroundMode, environment: Environment, promptVersionId?: string, modelConfigId?: string) => { setSending(true); setError(null); try { const response = await aiMutation<any>('/ai/playground/chat', 'POST', { message: message.trim(), mode, environment: environment === 'development' ? 'dev' : environment === 'production' ? 'prod' : 'test', promptVersionId, modelConfigId }); setResult({ ...response, response: safe(response.response ?? response.message), toolCalls: (response.toolCalls ?? response.tool_calls ?? []).map((t: any) => ({ ...t, args: safe(t.args ?? t.arguments), result: safe(t.result) })) }) } catch (e: any) { setError(e?.message || 'No pudimos probar a Finnic.') } finally { setSending(false) } }
  return { result, sending, error, send }
}
