import { describe, expect, it, vi } from 'vitest'
import { AiConfigService } from './ai-config.service'

const makeDb = () => {
  const db: any = {
    aiAgent: { upsert: vi.fn(async (x) => ({ id: 'agent-1', ...x.create })), findUnique: vi.fn(async () => ({ id: 'agent-1', slug: 'finnic', name: 'Finnic' })) },
    aiPrompt: { upsert: vi.fn(async () => ({ id: 'prompt-1' })) },
    aiPromptVersion: { findFirst: vi.fn(async () => undefined), create: vi.fn(async (x) => ({ id: 'v1', ...x.data })), findUnique: vi.fn(async () => ({ id: 'v1', promptId: 'prompt-1' })), updateMany: vi.fn(), update: vi.fn() },
    aiDeployment: { updateMany: vi.fn(), create: vi.fn(async (x) => ({ id: 'd1', ...x.data })) },
  }
  db.$transaction = vi.fn(async (operations) => Promise.all(operations))
  return db
}

describe('AiConfigService', () => {
  it('creates drafts, publishes them, and activates the deployed version', async () => {
    const db = makeDb(); const service = new AiConfigService(db)
    const draft = await service.createPromptVersion('agent-1', 'system', 'draft')
    expect(draft.status).toBe('draft')
    await service.publishPromptVersion('v1')
    expect(db.aiPromptVersion.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: { status: 'archived' } }))
    await service.deploy({ agentSlug: 'finnic', environment: 'DEV', promptVersionId: 'v1' })
    expect(db.aiPromptVersion.update).toHaveBeenCalledWith({ where: { id: 'v1' }, data: { status: 'active' } })
  })

  it('isolates environments and deactivates the current deployment on rollback', async () => {
    const db = makeDb(); const service = new AiConfigService(db)
    await service.deploy({ agentSlug: 'finnic', environment: 'DEV', promptVersionId: 'v1' })
    await service.deploy({ agentSlug: 'finnic', environment: 'TEST', promptVersionId: 'v2' })
    await service.deploy({ agentSlug: 'finnic', environment: 'PROD', promptVersionId: 'v1' })
    expect(db.aiDeployment.updateMany).toHaveBeenCalledWith({ where: { agentId: 'agent-1', environment: 'TEST', isActive: true }, data: { isActive: false } })
    expect(db.aiDeployment.create).toHaveBeenLastCalledWith(expect.objectContaining({ data: expect.objectContaining({ environment: 'PROD', promptVersionId: 'v1', isActive: true }) }))
  })
})
