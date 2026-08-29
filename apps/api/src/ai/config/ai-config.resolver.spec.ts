import { describe, expect, it, vi } from 'vitest'
import { AiConfigResolver } from './ai-config.resolver'

const db = (deployment: any = null) => ({
  aiAgent: { findUnique: vi.fn(async () => ({ id: 'a1', slug: 'finnic', name: 'Finnic' })) },
  aiDeployment: { findFirst: vi.fn(async () => deployment) },
  aiToolConfig: { findMany: vi.fn(async () => [{ toolName: 'get_financial_snapshot', enabled: true, requireConfirmation: false, maxAttempts: 2 }, { toolName: 'create_expense', enabled: true, requireConfirmation: true, maxAttempts: 4 }]) },
})

describe('AiConfigResolver', () => {
  it('resolves DB prompt/model and only enabled tools', async () => {
    const value = await new AiConfigResolver(db({ promptVersion: { id: 'v2', version: 2, content: 'db', prompt: { key: 'system' } }, modelConfig: { model: 'custom', temperature: 1.2, maxTokens: 333, responseMimeType: 'json' } }) as any).resolve('finnic', 'DEV')
    expect(value.prompt.content).toBe('db'); expect(value.model).toMatchObject({ model: 'custom', temperature: 1.2, maxTokens: 333 })
    expect(value.tools.map(tool => tool.name)).toEqual(['get_financial_snapshot', 'create_expense'])
  })

  it('uses bootstrap fallback without an agent or deployment', async () => {
    const database: any = { aiAgent: { findUnique: vi.fn(async () => null) } }
    const value = await new AiConfigResolver(database).resolve('finnic', 'PROD')
    expect(value.prompt.version).toBe(1); expect(value.model.maxTokens).toBeGreaterThan(0); expect(value.tools.length).toBeGreaterThan(0)
  })

  it('keeps DEV, TEST, and PROD cache entries independent', async () => {
    const database: any = db(); const resolver = new AiConfigResolver(database)
    await resolver.resolve('finnic', 'DEV'); await resolver.resolve('finnic', 'TEST'); await resolver.resolve('finnic', 'PROD')
    expect(database.aiDeployment.findFirst).toHaveBeenCalledTimes(3)
  })
})
