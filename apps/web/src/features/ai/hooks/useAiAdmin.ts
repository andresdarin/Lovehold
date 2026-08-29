'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { apiFetch, ApiError } from '@/lib/api'
import type { Environment } from '../types'

const envName = (env: Environment) => env === 'development' ? 'dev' : env === 'production' ? 'prod' : 'test'

export type AiAccessError = { status: number; message: string }

function reportAiError(error: unknown) {
  if (typeof window === 'undefined') return
  const status = error instanceof ApiError ? error.status : 401
  const message = status === 403
    ? 'No tienes permisos para la consola Finnic. Contacta admin.'
    : status === 401 ? 'Sesión expirada, inicia sesión.' : error instanceof Error ? error.message : 'No pudimos cargar estos datos.'
  window.dispatchEvent(new CustomEvent<AiAccessError>('finnic:api-error', { detail: { status, message } }))
}

export function useAiRequest<T = any>(path: string, options?: RequestInit, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null)
  const refresh = useCallback(async () => { setLoading(true); setError(null); try { const { data: { session } } = await createClient().auth.getSession(); if (!session?.access_token) { const e = new ApiError(401, 'Sesión expirada, inicia sesión.'); reportAiError(e); throw e } setData(await apiFetch<T>(path, options, session.access_token)) } catch (e: any) { reportAiError(e); const message = e?.status === 403 ? 'No tienes permisos para la consola Finnic. Contacta admin.' : e?.status === 401 ? 'Sesión expirada, inicia sesión.' : e?.message || 'No pudimos cargar estos datos.'; setError(message) } finally { setLoading(false) } }, [path, JSON.stringify(options), ...deps])
  useEffect(() => { refresh() }, [refresh])
  return { data, loading, error, refresh }
}

export const useAiConfig = (env: Environment) => useAiRequest(`/ai/admin/config/finnic/${envName(env)}`, undefined, [env])
export const useAiAgents = () => useAiRequest('/ai/admin/agents')
export const useAiPrompts = () => useAiRequest('/ai/admin/prompts')
export const useAiPromptVersions = (id?: string) => useAiRequest(id ? `/ai/admin/prompts/${id}/versions` : '/ai/admin/prompts', undefined, [id])
export const useAiModelConfigs = () => useAiRequest('/ai/admin/model-configs')
export const useAiTools = () => useAiRequest('/ai/admin/tool-configs')
export const useAiDeployments = (env: Environment) => useAiRequest(`/ai/admin/deployments?environment=${envName(env)}`, undefined, [env])
export const useAiRuns = () => useAiRequest('/ai/admin/runs')

const environments: Environment[] = ['development', 'test', 'production']
const list = (data: any) => Array.isArray(data) ? data : data?.items || []

/** One source of truth for the editorial lifecycle shown by the admin screens. */
export function useAiLifecycle(promptId?: string) {
  const versions = useAiPromptVersions(promptId)
  const development = useAiDeployments('development')
  const test = useAiDeployments('test')
  const production = useAiDeployments('production')
  const devConfig = useAiConfig('development')
  const testConfig = useAiConfig('test')
  const prodConfig = useAiConfig('production')
  const deployments = { development, test, production }
  const configs = { development: devConfig, test: testConfig, production: prodConfig }
  const rows = list(versions.data)
  const draft = rows.find((v: any) => v.status === 'draft')
  const published = rows.find((v: any) => v.status === 'published')
  const activeByEnv = Object.fromEntries(environments.map(env => {
    const deployment = list(deployments[env].data).find((d: any) => d.isActive)
    const effective = configs[env].data?.prompt
    return [env, deployment?.isActive && effective ? { ...effective, deployment } : undefined]
  })) as Record<Environment, any>
  return { versions, deployments, configs, draft, published, activeByEnv, list }
}

export async function aiMutation<T = any>(path: string, method: string, body?: any) {
  const { data: { session } } = await createClient().auth.getSession(); if (!session?.access_token) { const e = new ApiError(401, 'Sesión expirada, inicia sesión.'); reportAiError(e); throw e }
  try { return await apiFetch<T>(path, { method, body: body === undefined ? undefined : JSON.stringify(body) }, session.access_token) } catch (e) { reportAiError(e); throw e }
}
