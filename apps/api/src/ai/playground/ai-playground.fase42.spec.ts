import { describe, expect, it, vi } from 'vitest'
import { AiPlaygroundService } from './ai-playground.service'
import { AiPlaygroundController } from './ai-playground.controller'
import { PlaygroundMode } from './dto/playground.dto'

const base = (tools: any[] = []) => ({ prompt: { id: 'p', key: 'k', content: 'safe', version: 2 }, model: { model: 'm', temperature: .2, maxTokens: 20 }, tools, policy: { limits: { maxIterations: 2 } } }) as any
const subject = (answer: any, tools: any[] = [], executor: any = vi.fn(async () => ({ success: true, data: { ok: true } }))) => {
  const gemini: any = { chat: vi.fn(async () => answer) }; const resolver: any = { resolve: vi.fn(async () => base(tools)) }
  const registry: any = { getDeclarations: vi.fn(() => tools.map(t => ({ name: t.name, description: '', parameters: {} }))), has: vi.fn((n: string) => tools.some(t => t.name === n)), get: vi.fn((n: string) => tools.find(t => t.name === n)) }
  const prisma: any = { aiPromptVersion: { findUnique: vi.fn(async () => ({ id: 'draft', version: 9, content: 'draft text', prompt: { key: 'k' } })) } }
  return { service: new AiPlaygroundService(resolver, gemini, registry, { execute: executor } as any, prisma), gemini, resolver, executor }
}

describe('AI playground Fase 4.2', () => {
  it('requires auth then admin for POST playground', async () => {
    const auth = { canActivate: vi.fn(async (c: any) => { if (!c.switchToHttp().getRequest().headers.authorization) throw Object.assign(new Error(), { status: 401 }); return true }) }
    const req: any = { headers: {} }; await expect(auth.canActivate({ switchToHttp: () => ({ getRequest: () => req }) })).rejects.toMatchObject({ status: 401 })
    const admin = { canActivate: (c: any) => { if (!c.switchToHttp().getRequest().user?.isAdmin) throw Object.assign(new Error(), { status: 403 }); return true } }; req.headers.authorization = 'Bearer token'; expect(() => admin.canActivate({ switchToHttp: () => ({ getRequest: () => ({ user: {} }) }) })).toThrow(); expect(admin.canActivate({ switchToHttp: () => ({ getRequest: () => ({ user: { isAdmin: true } }) }) })).toBe(true)
  })
  it('uses a draft ephemerally and does not alter PROD', async () => { const s = subject({ text: 'answer' }); const result = await s.service.run('p1', { message: 'x', mode: PlaygroundMode.REAL_READONLY, promptVersionId: 'draft', environment: 'PROD' } as any); expect(result.configUsed).toMatchObject({ prompt: { content: 'draft text' } }); expect(s.resolver.resolve).toHaveBeenCalledWith('finnic', 'PROD') })
  it('executes readonly tools and never executes writes', async () => { const read = subject({ functionCalls: [{ name: 'get_financial_snapshot', args: {} }] }, [{ name: 'get_financial_snapshot', risk: 'read', enabled: true, requireConfirmation: false }]); const r = await read.service.run('p1', { message: 'x', mode: PlaygroundMode.REAL_READONLY } as any); expect(r.toolCalls[0]).toMatchObject({ name: 'get_financial_snapshot', success: true }); expect(read.executor).toHaveBeenCalled()
    const write = subject({ functionCalls: [{ name: 'create_expense', args: { amount: 1 } }] }, [{ name: 'create_expense', risk: 'write', enabled: true, requireConfirmation: false }]); const w = await write.service.run('p1', { message: 'x', mode: PlaygroundMode.REAL_READONLY } as any); expect(w.toolCalls.length).toBeGreaterThan(0); expect(w.toolCalls[0].success).toBe(false); expect(write.executor).not.toHaveBeenCalled() })
  it('sandbox does not call the expense executor and redacts secrets/reasoning', async () => { const s = subject({ text: 'done', secret: 'x-goog-api-key', reasoning: 'chain-of-thought' }, [{ name: 'create_expense', enabled: true }]); const r = await s.service.run('p1', { message: 'x', mode: PlaygroundMode.SANDBOX } as any); expect(s.executor).not.toHaveBeenCalled(); expect(JSON.stringify(r)).not.toMatch(/x-goog-api-key|chain-of-thought|secret/i) })
  it('controller resolves profile before invoking playground', async () => { const service: any = { run: vi.fn(async () => ({ text: 'ok' })) }; const prisma: any = { profile: { findUnique: vi.fn(async () => ({ id: 'p1' })) } }; const c = new AiPlaygroundController(service, prisma); await c.chat({ authUserId: 'u1' } as any, { message: 'x' } as any); expect(service.run).toHaveBeenCalledWith('p1', { message: 'x' }) })
})
