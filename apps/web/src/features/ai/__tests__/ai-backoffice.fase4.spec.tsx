import React from 'react'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'

const mocks = vi.hoisted(() => ({
  fetch: vi.fn(), mutation: vi.fn(), session: vi.fn(),
  config: vi.fn(), prompts: vi.fn(), lifecycle: vi.fn(), deployments: vi.fn(), runs: vi.fn(),
  playground: vi.fn(), executor: vi.fn(),
}))
vi.mock('@/lib/api', () => ({ ApiError: class ApiError extends Error { status: number; constructor(status: number, message: string) { super(message); this.status = status } }, apiFetch: mocks.fetch }))
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth: { getSession: mocks.session } }) }))
vi.mock('@/features/ai/hooks/useAiAdmin', () => ({ aiMutation: mocks.mutation, useAiConfig: mocks.config, useAiRuns: mocks.runs, useAiPrompts: mocks.prompts, useAiLifecycle: mocks.lifecycle, useAiDeployments: mocks.deployments, useAiRequest: (path: string) => { const { useState, useEffect } = React; const [state, setState] = useState<any>({ data: null, loading: true, error: null }); useEffect(() => { mocks.session().then((s: any) => mocks.fetch(path, undefined, s.data.session.access_token)).then((data: any) => setState({ data, loading: false, error: null })).catch((e: any) => setState({ data: null, loading: false, error: e.status === 403 ? 'No tienes permisos para la consola Finnic. Contacta admin.' : 'ErrorState' })) }, [path]); return { ...state, refresh: vi.fn() } } }))
vi.mock('@/features/ai/hooks/usePlayground', () => ({ usePlayground: mocks.playground }))
vi.mock('next/navigation', () => ({ usePathname: () => '/ai', useRouter: () => ({ push: vi.fn() }) }))
vi.mock('next/link', () => ({ default: ({ children, ...p }: any) => React.createElement('a', p, children) }))
vi.mock('framer-motion', () => ({ motion: { div: ({ children, ...p }: any) => React.createElement('div', p, children) } }))
vi.mock('@/components/ui/LiquidGlass', () => ({ default: ({ children }: any) => React.createElement('div', null, children) }))
vi.mock('@/components/ui/CustomSelect', () => ({ default: ({ value, options, onChange }: any) => React.createElement('select', { 'aria-label': 'environment', value, onChange: (e: any) => onChange(e.target.value) }, options.map((o: any) => React.createElement('option', { key: o.value, value: o.value }, o.label))) }))

import SidebarNav from '@/features/shell/sidebar/SidebarNav'
import AiOverview from '@/app/(authenticated)/ai/page'
import BehaviorPage from '@/app/(authenticated)/ai/behavior/page'
import VersionsPage from '@/app/(authenticated)/ai/versions/page'
import PlaygroundPage from '@/app/(authenticated)/ai/playground/page'
import { useAiRequest } from '@/features/ai/hooks/useAiAdmin'

const profile = (isAdmin: boolean) => ({ displayName: 'A', email: 'a@b.test', color: '#fff', isAdmin })
const navProps = (isAdmin: boolean) => ({ collapsed: false, profile: profile(isAdmin), navRef: { current: null }, itemRefs: { current: {} }, indicator: { top: 0, left: 0, width: 0, height: 0, opacity: 0 }, hoveredHref: null, onHoverChange: vi.fn() })
beforeEach(() => { vi.clearAllMocks(); mocks.session.mockResolvedValue({ data: { session: { access_token: 'token' } } }); mocks.runs.mockReturnValue({ data: [], loading: false }); mocks.mutation.mockResolvedValue({ id: 'v2' }) })

describe('AI backoffice Fase 4', () => {
  it('1. hides AI navigation for non-admins', () => { const { rerender } = render(<SidebarNav {...navProps(false)} />); expect(screen.queryByRole('link', { name: /ai/i })).toBeNull(); rerender(<SidebarNav {...navProps(true)} />); expect(screen.getByRole('link', { name: /ai/i })).toBeTruthy() })
  it('2. changes effective config with environment', () => { mocks.config.mockImplementation((env: string) => ({ data: { model: { model: env === 'development' ? 'dev-model' : 'prod-model' }, prompt: { key: env, version: 1 }, tools: [] }, loading: false })); const { rerender } = render(<AiOverview />); expect(screen.getByText('dev-model')).toBeTruthy(); fireEvent.change(screen.getByLabelText('environment'), { target: { value: 'production' } }); rerender(<AiOverview />); expect(screen.getByText('prod-model')).toBeTruthy() })
  it('3. keeps draft separate from published/deployed', () => { mocks.prompts.mockReturnValue({ data: [{ id: 'p1', key: 'finnic-system' }], loading: false }); mocks.lifecycle.mockReturnValue({ versions: { data: [{ version: 2, status: 'draft' }, { version: 1, status: 'published' }] }, draft: { version: 2 }, published: { version: 1 }, activeByEnv: { development: { version: 1 }, test: { version: 1 }, production: { version: 1 } } }); render(<BehaviorPage />); expect(screen.getByText('Draft · v2')).toBeTruthy(); expect(screen.getByText('Published · v1')).toBeTruthy(); expect(screen.getByText('Active · v1')).toBeTruthy() })
  it('4. publishing does not change active deployment', async () => { mocks.lifecycle.mockReturnValue({ versions: { data: [], loading: false }, draft: { version: 2, content: 'draft' }, published: { version: 1 }, activeByEnv: { development: { version: 1 }, test: { version: 1 }, production: { version: 1 } } }); render(<BehaviorPage />); fireEvent.click(screen.getByRole('button', { name: /publish version/i })); await waitFor(() => expect(mocks.mutation).toHaveBeenCalled()); expect(screen.getByText('Active · v1')).toBeTruthy() })
  it('5. deployment mutation is the transition to active', async () => { mocks.deployments.mockReturnValue({ data: [{ id: 'd1', isActive: false, promptVersion: { version: 2 } }], loading: false, refresh: vi.fn() }); mocks.config.mockReturnValue({ data: { prompt: { version: 1 } }, loading: false, refresh: vi.fn() }); render(<VersionsPage />); fireEvent.click(screen.getByRole('button', { name: /deploy active/i })); await waitFor(() => expect(mocks.mutation).toHaveBeenCalledWith('/ai/admin/deployments', 'POST', { environment: 'dev' })) })
  it('6. requires PROD confirmation for rollback', async () => { mocks.deployments.mockReturnValue({ data: [{ id: 'd1', isActive: true, promptVersion: { version: 1 } }], loading: false, refresh: vi.fn() }); mocks.config.mockReturnValue({ data: { prompt: { version: 1 } }, loading: false, refresh: vi.fn() }); render(<VersionsPage />); fireEvent.change(screen.getByLabelText('environment'), { target: { value: 'production' } }); fireEvent.click(screen.getByRole('button', { name: /rollback/i })); expect(mocks.mutation).not.toHaveBeenCalled(); expect(screen.getByText(/PROD/i)).toBeTruthy() })
  it('7. playground never executes a write tool', async () => { const send = vi.fn(); mocks.playground.mockReturnValue({ send, sending: false, error: null, result: { response: 'ok', toolCalls: [{ name: 'create_expense', risk: 'write' }] } }); render(<PlaygroundPage />); fireEvent.change(screen.getByRole('textbox'), { target: { value: 'create expense' } }); fireEvent.click(screen.getByRole('button', { name: '' })); await waitFor(() => expect(send).toHaveBeenCalled()); expect(mocks.executor).not.toHaveBeenCalled() })
  it('8. exposes 403 and 500 as UX errors without crashing', async () => { mocks.fetch.mockRejectedValueOnce({ status: 403 }).mockRejectedValueOnce({ status: 500, message: 'server' }); const first = renderHook(() => useAiRequest('/forbidden')); await waitFor(() => expect(first.result.current.error).toMatch(/permisos/)); const second = renderHook(() => useAiRequest('/broken')); await waitFor(() => expect(second.result.current.error).toBe('ErrorState')) })
})
