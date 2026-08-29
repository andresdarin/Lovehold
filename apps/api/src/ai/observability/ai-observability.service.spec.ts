import { describe, expect, it, vi } from 'vitest'
import { AiObservabilityService } from './ai-observability.service'

describe('AiObservabilityService Fase 3', () => {
  it('registra runs y tool calls, incluyendo latency', async () => {
    const run = { id: 'run-1', startedAt: new Date(Date.now() - 25) }
    const prisma: any = {
      aiRun: { create: vi.fn(async () => run), findUnique: vi.fn(async () => run), update: vi.fn(async ({ data }: any) => data) },
      aiToolCall: { create: vi.fn(async ({ data }: any) => data) },
    }
    const service = new AiObservabilityService(prisma)
    await service.startRun({ profileId: 'p1', model: 'gemini', promptId: 'finnic' })
    await service.logToolCall({ runId: 'run-1', toolName: 'snapshot', risk: 'read', input: { ok: true }, success: true })
    await service.endRun('run-1', { status: 'completed' })
    expect(prisma.aiRun.create).toHaveBeenCalled()
    expect(prisma.aiToolCall.create).toHaveBeenCalled()
    expect(prisma.aiRun.update.mock.calls[0][0].data.latencyMs).toBeGreaterThanOrEqual(0)
  })

  it('recorta errores y no filtra secretos', async () => {
    const run = { id: 'run-1', startedAt: new Date() }
    const prisma: any = { aiRun: { findUnique: vi.fn(async () => run), update: vi.fn() }, aiToolCall: { create: vi.fn() } }
    const service = new AiObservabilityService(prisma)
    await service.endRun('run-1', { status: 'failed', error: 'stack interno\napi-key=SECRET\nmore details' })
    const error = prisma.aiRun.update.mock.calls[0][0].data.error
    expect(error).not.toContain('\n')
    expect(error.length).toBeLessThanOrEqual(500)
    expect(error).not.toContain('SECRET')
  })
})
