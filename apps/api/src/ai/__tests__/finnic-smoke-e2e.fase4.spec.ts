import { describe, expect, it, vi } from 'vitest'
import { AiAdminService } from '../admin/ai-admin.service'
import { AiConfigService } from '../config/ai-config.service'
import { AiConfigResolver } from '../config/ai-config.resolver'
import { AgentOrchestrator } from '../agent/agent.orchestrator'
import { AiPendingActionService } from '../pending/ai-pending-action.service'
import { AiObservabilityService } from '../observability/ai-observability.service'
import { ToolExecutor } from '../tools/tool.executor'
import { ToolRegistry } from '../tools/tool.registry'
import { AiPlaygroundService } from '../playground/ai-playground.service'
import { PlaygroundMode } from '../playground/dto/playground.dto'
import { CreateExpenseUseCase } from '../../finance/application/create-expense.usecase'

/** A small in-memory Prisma-shaped store: no database or network is needed for this smoke test. */
function prismaMemory() {
  const data: any = {
    aiAgent: [{ id: 'agent-finnic', slug: 'finnic', name: 'Finnic' }],
    aiPrompt: [{ id: 'prompt-finnic', agentId: 'agent-finnic', key: 'finnic-system' }],
    aiPromptVersion: [{ id: 'prompt-v1', promptId: 'prompt-finnic', version: 1, content: 'version 1', status: 'published' }],
    aiDeployment: [{ id: 'deployment-prod-v1', agentId: 'agent-finnic', environment: 'PROD', promptVersionId: 'prompt-v1', isActive: true, deployedAt: new Date(1) }],
    aiToolConfig: [], aiModelConfig: [], aiRun: [], aiToolCall: [], aiPendingAction: [], personalExpense: [], profile: [], financeAccount: [],
  }
  let sequence = 0
  const matches = (row: any, where: any = {}): boolean => Object.entries(where).every(([key, value]: [string, any]) => {
    if (key === 'OR') return (value as any[]).some((part: any) => matches(row, part))
    if (value && typeof value === 'object' && 'in' in value) return value.in.includes(row[key])
    if (value && typeof value === 'object' && 'not' in value) return row[key] !== value.not
    if (value && typeof value === 'object' && 'gte' in value) return row[key] >= value.gte
    if (value && typeof value === 'object' && 'lte' in value) return row[key] <= value.lte
    if (value && typeof value === 'object' && 'isActive' in value) return row[key] === value.isActive
    if (value && typeof value === 'object' && Object.keys(value).length) return row[key] === undefined ? matches(row, value) : matches(row[key], value)
    return row[key] === value
  })
  const id = (name: string) => `${name}-${++sequence}`
  const model = (name: string) => ({
    findUnique: vi.fn(async ({ where, include }: any) => {
      const row = data[name].find((candidate: any) => matches(candidate, where))
      return row ? enrich(row, include) : null
    }),
    findFirst: vi.fn(async ({ where = {}, orderBy, include }: any = {}) => {
      const rows = data[name].filter((row: any) => matches(row, where))
      if (orderBy) { const [key, direction] = Object.entries(orderBy)[0] as [string, any]; rows.sort((a: any, b: any) => (a[key] > b[key] ? 1 : -1) * (direction === 'desc' ? -1 : 1)) }
      return rows[0] ? enrich(rows[0], include) : null
    }),
    findMany: vi.fn(async ({ where = {}, orderBy, take }: any = {}) => {
      const rows = data[name].filter((row: any) => matches(row, where))
      if (orderBy) { const [key, direction] = Object.entries(orderBy)[0] as [string, any]; rows.sort((a: any, b: any) => (a[key] > b[key] ? 1 : -1) * (direction === 'desc' ? -1 : 1)) }
      return (take ? rows.slice(0, take) : rows).map((row: any) => enrich(row))
    }),
    count: vi.fn(async ({ where = {} }: any = {}) => data[name].filter((row: any) => matches(row, where)).length),
    create: vi.fn(async ({ data: input }: any) => { const row = { id: id(name), ...input, createdAt: new Date(), deployedAt: new Date() }; data[name].push(row); return enrich(row) }),
    update: vi.fn(async ({ where, data: patch }: any) => { const row = data[name].find((candidate: any) => matches(candidate, where)); if (row) Object.assign(row, patch); return enrich(row) }),
    updateMany: vi.fn(async ({ where, data: patch }: any) => { const rows = data[name].filter((row: any) => matches(row, where)); rows.forEach((row: any) => Object.assign(row, patch)); return { count: rows.length } }),
    upsert: vi.fn(async ({ where, create, update }: any) => { const row = data[name].find((candidate: any) => matches(candidate, where)); if (row) { Object.assign(row, update); return row; } const created = { id: id(name), ...create }; data[name].push(created); return created }),
  })
  function enrich(row: any, include?: any) {
    if (!row) return row
    const copy = { ...row }
    if (include?.promptVersion || include?.prompt) copy.promptVersion = data.aiPromptVersion.find((v: any) => v.id === row.promptVersionId)
    if (include?.prompt || copy.promptId) copy.prompt = data.aiPrompt.find((p: any) => p.id === (row.promptId || copy.promptVersion?.promptId))
    if (copy.promptVersion) copy.promptVersion = { ...copy.promptVersion, prompt: data.aiPrompt.find((p: any) => p.id === copy.promptVersion.promptId) }
    return copy
  }
  const prisma: any = Object.fromEntries(Object.keys(data).map((name) => [name, model(name)]))
  prisma.$executeRaw = vi.fn(async () => undefined)
  prisma.$transaction = vi.fn(async (operation: any) => Array.isArray(operation) ? Promise.all(operation) : operation(prisma))
  return { prisma, data }
}

describe('Finnic Smoke E2E — Fase 4', () => {
  it('recorre los 10 pasos de configuración y valida las 4 integraciones', async () => {
    const { prisma, data } = prismaMemory()
    const resolver = new AiConfigResolver(prisma)
    const admin = new AiAdminService(prisma, resolver)
    const config = new AiConfigService(prisma, resolver)

    // 1. Draft v2; 2. Playground uses the draft without changing PROD.
    const draft = await admin.createDraft('prompt-finnic', 'test personality')
    expect(draft).toMatchObject({ version: 2, status: 'draft', content: 'test personality' })
    const registry = new ToolRegistry(
      { execute: vi.fn(async () => ({ balance: 100 })) } as any, { execute: vi.fn() } as any,
      { execute: vi.fn() } as any, { execute: vi.fn() } as any, { execute: vi.fn() } as any,
    )
    const gemini = { chat: vi.fn(async () => ({ text: 'sandbox response' })) }
    const playground = new AiPlaygroundService(resolver, gemini as any, registry, new ToolExecutor(registry), prisma)
    const playgroundResult = await playground.run('profile-1', { message: 'hello', promptVersionId: draft.id, environment: 'PROD', mode: PlaygroundMode.SANDBOX } as any)
    expect(playgroundResult.promptVersion).toBe(2)
    expect((await resolver.resolve('finnic', 'PROD')).prompt.version).toBe(1)

    // 3. Publish v2. 4. Publishing alone still does not alter the deployed PROD version.
    const published = await admin.publishVersion(draft.id)
    expect(published.status).toBe('published')
    expect((await resolver.resolve('finnic', 'PROD')).prompt.version).toBe(1)

    // 5–7. Deploy DEV, observe DEV, then deploy PROD.
    await config.deploy({ agentSlug: 'finnic', environment: 'DEV', promptVersionId: draft.id })
    expect((await resolver.resolve('finnic', 'DEV')).prompt.version).toBe(2)
    await config.deploy({ agentSlug: 'finnic', environment: 'PROD', promptVersionId: draft.id })
    expect((await resolver.resolve('finnic', 'PROD')).prompt.version).toBe(2)

    // 8. Real orchestrator path, including the effective DEV prompt in the Gemini request.
    const snapshot = { execute: vi.fn(async () => ({ balance: 100 })) }
    const tools = new ToolRegistry(snapshot as any, { execute: vi.fn() } as any, { execute: vi.fn() } as any, { execute: vi.fn() } as any, { execute: vi.fn() } as any)
    const executor = new ToolExecutor(tools)
    const conversations = { getRecentWindow: vi.fn(async () => []), createMessage: vi.fn(), touch: vi.fn() }
    const context = { assertConversationOwnership: vi.fn(async () => undefined) }
    const observations = new AiObservabilityService(prisma)
    const pending = new AiPendingActionService(prisma, tools)
    process.env.AI_ENV = 'DEV'
    const runtimeGemini = { chat: vi.fn().mockResolvedValueOnce({ text: 'respuesta v2' }) }
    const orchestrator = new AgentOrchestrator(runtimeGemini as any, tools, executor, { get: vi.fn() } as any, conversations as any, pending, observations, context as any, resolver)
    const runtime = await orchestrator.run({ profileId: 'profile-1', conversationId: 'conversation-1', message: 'hello' })
    expect(runtime.text).toBe('respuesta v2')
    expect(runtimeGemini.chat.mock.calls[0]![0].systemInstruction).toBe('test personality')

    // 9–10. Roll back by deploying the known previous version and verify restoration.
    await config.deploy({ agentSlug: 'finnic', environment: 'PROD', promptVersionId: 'prompt-v1' })
    expect((await resolver.resolve('finnic', 'PROD')).prompt.version).toBe(1)

    // Verification 1: read tool and successful AiToolCall.
    runtimeGemini.chat.mockResolvedValueOnce({ functionCalls: [{ name: 'get_financial_snapshot', args: {} }] }).mockResolvedValueOnce({ text: 'snapshot ok' })
    const read = await orchestrator.run({ profileId: 'profile-1', conversationId: 'conversation-1', message: 'balance' })
    expect(read.toolCalls).toEqual([{ name: 'get_financial_snapshot', args: {}, success: true }])
    expect((await prisma.aiToolCall.findMany({ where: {} })).some((call: any) => call.success)).toBe(true)

    // Verification 2: write is pending, then confirmed and completed.
    const actualExpense = new CreateExpenseUseCase(prisma)
    const writeTools = new ToolRegistry(snapshot as any, { execute: vi.fn() } as any, { execute: vi.fn() } as any, { execute: vi.fn() } as any, actualExpense)
    const writeOrchestrator = new AgentOrchestrator({ chat: vi.fn(async () => ({ functionCalls: [{ name: 'create_expense', args: { amount: 10, currency: 'UYU', category: 'OTROS', title: 'Test' } }] })) } as any, writeTools, new ToolExecutor(writeTools), { get: vi.fn() } as any, conversations as any, new AiPendingActionService(prisma, writeTools), observations, context as any, resolver)
    const pendingResult = await writeOrchestrator.run({ profileId: 'profile-1', conversationId: 'conversation-2', message: 'registrá' })
    expect(pendingResult.pendingActionId).toBeTruthy()
    const confirmed = await writeOrchestrator.confirmPending({ profileId: 'profile-1', pendingActionId: pendingResult.pendingActionId! })
    expect(confirmed.toolCalls?.[0]).toMatchObject({ name: 'create_expense', success: true })
    expect((await prisma.aiPendingAction.findUnique({ where: { id: pendingResult.pendingActionId } })).status).toBe('completed')
    expect(prisma.personalExpense.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ sourceMessageId: pendingResult.pendingActionId }) }))
    await actualExpense.execute({ profileId: 'profile-1', input: { amount: 10, currency: 'UYU', category: 'OTROS', title: 'Test', date: new Date().toISOString() }, context: { sourceMessageId: pendingResult.pendingActionId } })
    expect(prisma.personalExpense.create).toHaveBeenCalledTimes(1)
    await writeOrchestrator.confirmPending({ profileId: 'profile-1', pendingActionId: pendingResult.pendingActionId! })
    expect(prisma.personalExpense.create).toHaveBeenCalledTimes(1)

    // Verification 3–4: records are visible through the Overview service queries.
    expect((await admin.getRuns()).length).toBeGreaterThanOrEqual(3)
    expect(await prisma.aiToolCall.count({ where: {} })).toBeGreaterThanOrEqual(2)
    expect(data.aiDeployment.filter((deployment: any) => deployment.environment === 'PROD' && deployment.isActive)).toHaveLength(1)
  })
})
