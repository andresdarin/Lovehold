import { BadRequestException, ForbiddenException, GoneException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { ToolRegistry } from '../tools/tool.registry'

export type PendingActionStatus = 'pending' | 'executing' | 'completed' | 'cancelled' | 'expired' | 'failed'
export interface AiPendingAction {
  id: string; conversationId: string; profileId: string; toolName: string; args: unknown
  risk: string; status: PendingActionStatus; expiresAt: Date; result?: unknown
  executedAt?: Date | null; attempts?: number; claimed?: boolean
  executionLeaseUntil?: Date | null; executionStartedAt?: Date | null; leaseActive?: boolean
}

const TTL_MS = 10 * 60 * 1000
export const LEASE_MS = 120_000
export const MAX_ATTEMPTS = 3
const json = (value: unknown): unknown => {
  if (value === undefined) return null
  if (typeof value === 'string') return value.length > 2000 ? `${value.slice(0, 2000)}…` : value
  if (Array.isArray(value)) return value.map(json)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, json(v)]))
  return value
}

// Keep the atomic updateMany path for Prisma, while supporting lightweight test doubles.
async function updateManyOrUpdate(model: any, args: { where: unknown; data: unknown }): Promise<{ count: number }> {
  if (typeof model.updateMany === 'function') return model.updateMany(args)
  await model.update(args)
  return { count: 1 }
}

@Injectable()
export class AiPendingActionService {
  constructor(private readonly prisma: PrismaService, private readonly registry: ToolRegistry) {}

  async create(params: { profileId: string; conversationId: string; toolName: string; args: unknown; risk: string }): Promise<AiPendingAction> {
    if (params.risk !== 'write' || !this.registry.has(params.toolName)) throw new BadRequestException('Invalid pending action')
    const parsed = this.registry.get(params.toolName).inputSchema.safeParse(params.args)
    if (!parsed.success) throw new BadRequestException('Invalid tool arguments')
    return (this.prisma as any).aiPendingAction.create({ data: { ...params, args: json(parsed.data), status: 'pending', attempts: 0, expiresAt: new Date(Date.now() + TTL_MS) } })
  }

  async getForConfirm(profileId: string, id: string): Promise<AiPendingAction> {
    const action = await (this.prisma as any).aiPendingAction.findUnique({ where: { id } })
    if (!action) throw new NotFoundException('Pending action not found')
    if (action.profileId !== profileId) throw new ForbiddenException()
    return action
  }

  async confirm(profileId: string, id: string, limits: { leaseMs?: number; maxAttempts?: number } = {}): Promise<AiPendingAction> {
    const leaseMs = limits.leaseMs ?? LEASE_MS
    const maxAttempts = limits.maxAttempts ?? MAX_ATTEMPTS
    return (this.prisma as any).$transaction(async (tx: any) => {
      const now = new Date()
      const action = await tx.aiPendingAction.findUnique({ where: { id } })
      if (!action) throw new NotFoundException('Pending action not found')
      if (action.profileId !== profileId) throw new ForbiddenException()
      if (['completed', 'failed', 'cancelled', 'expired'].includes(action.status)) return { ...action, claimed: false }
      if (action.status === 'executing') {
        if (this.isLeaseActive(action, now)) return { ...action, claimed: false, leaseActive: true }
        if ((action.attempts ?? 0) >= maxAttempts) {
          await updateManyOrUpdate(tx.aiPendingAction, { where: { id, profileId, status: 'executing', attempts: { gte: maxAttempts }, executionLeaseUntil: { lte: now } }, data: { status: 'failed', executedAt: now, executionLeaseUntil: null } })
          throw new GoneException('Pending action reached maximum attempts')
        }
        const reclaimed = await updateManyOrUpdate(tx.aiPendingAction, { where: { id, profileId, status: 'executing', OR: [{ executionLeaseUntil: { lte: now } }, { executionLeaseUntil: null }] }, data: { status: 'executing', executionLeaseUntil: new Date(now.getTime() + leaseMs), executionStartedAt: now, attempts: { increment: 1 } } })
        const current = await tx.aiPendingAction.findUnique({ where: { id } })
        return { ...current, claimed: reclaimed.count === 1, leaseActive: reclaimed.count !== 1 }
      }
      if (action.expiresAt <= now) {
        await tx.aiPendingAction.update({ where: { id }, data: { status: 'expired' } })
        throw new GoneException('Pending action expired')
      }
      if (!this.registry.has(action.toolName)) throw new BadRequestException('Tool is no longer available')
      const claimed = await updateManyOrUpdate(tx.aiPendingAction, { where: { id, profileId, status: 'pending' }, data: { status: 'executing', executionLeaseUntil: new Date(now.getTime() + leaseMs), executionStartedAt: now, attempts: { increment: 1 } } })
      const current = await tx.aiPendingAction.findUnique({ where: { id } })
      return { ...current, claimed: claimed.count === 1, leaseActive: claimed.count !== 1 }
    })
  }

  isLeaseActive(action: Pick<AiPendingAction, 'executionLeaseUntil'>, now = new Date()): boolean {
    return !!action.executionLeaseUntil && action.executionLeaseUntil > now
  }

  async cancel(profileId: string, id: string): Promise<AiPendingAction> {
    const action = await this.getForConfirm(profileId, id)
    if (['cancelled', 'completed', 'expired', 'failed', 'executing'].includes(action.status)) return action
    await updateManyOrUpdate((this.prisma as any).aiPendingAction, { where: { id, profileId, status: 'pending' }, data: { status: 'cancelled' } })
    return this.getForConfirm(profileId, id)
  }
  async expire(profileId: string, id: string): Promise<AiPendingAction> {
    const action = await this.getForConfirm(profileId, id)
    if (action.status !== 'pending') return action
    await updateManyOrUpdate((this.prisma as any).aiPendingAction, { where: { id, profileId, status: 'pending' }, data: { status: 'expired' } })
    return this.getForConfirm(profileId, id)
  }
  async markCompleted(id: string, result: unknown): Promise<void> {
    await updateManyOrUpdate((this.prisma as any).aiPendingAction, { where: { id, status: 'executing' }, data: { result: json(result), executedAt: new Date(), status: 'completed', executionLeaseUntil: null } })
  }
  async markFailed(id: string, error: string): Promise<void> {
    await updateManyOrUpdate((this.prisma as any).aiPendingAction, { where: { id, status: 'executing' }, data: { result: json({ error: error.slice(0, 500) }), executedAt: new Date(), status: 'failed', executionLeaseUntil: null } })
  }
}
