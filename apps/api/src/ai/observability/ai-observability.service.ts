import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

export interface AiRun { id: string; conversationId?: string | null; profileId: string; model: string; promptId: string; promptVersion?: string | null; status: string; startedAt: Date; finishedAt?: Date | null; latencyMs?: number | null; error?: string | null }
export interface AiToolCall { id: string; runId: string; toolName: string; risk: string; input: unknown; success: boolean; error?: string | null; durationMs?: number | null }

const sanitize = (value?: string) => value ? value.split(/\r?\n/, 1)[0]!.slice(0, 500) : undefined
const content = (value: unknown): unknown => {
  if (value === undefined) return null
  if (typeof value === 'string') return value.length > 2000 ? `${value.slice(0, 2000)}…` : value
  if (Array.isArray(value)) return value.map(content)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, content(v)]))
  return value
}

@Injectable()
export class AiObservabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async startRun(params: { conversationId?: string; profileId: string; model: string; promptId: string; promptVersion?: string }): Promise<AiRun> {
    return (this.prisma as any).aiRun.create({ data: { ...params, status: 'running', startedAt: new Date() } })
  }

  async endRun(runId: string, params: { status: string; error?: string }): Promise<void> {
    const run = await (this.prisma as any).aiRun.findUnique({ where: { id: runId } })
    if (!run) throw new NotFoundException('AI run not found')
    const finishedAt = new Date()
    const status = ['completed', 'failed', 'pending_confirmation'].includes(params.status) ? params.status : 'failed'
    await (this.prisma as any).aiRun.update({ where: { id: runId }, data: { status, finishedAt, latencyMs: Math.max(0, finishedAt.getTime() - run.startedAt.getTime()), error: sanitize(params.error) } })
  }

  async logToolCall(params: { runId: string; toolName: string; risk: string; input: unknown; success: boolean; error?: string; durationMs?: number }): Promise<AiToolCall> {
    const run = await (this.prisma as any).aiRun.findUnique({ where: { id: params.runId }, select: { id: true } })
    if (!run) throw new NotFoundException('AI run not found')
    return (this.prisma as any).aiToolCall.create({ data: { runId: params.runId, toolName: params.toolName, risk: params.risk, input: content(params.input), success: params.success, error: sanitize(params.error), durationMs: params.durationMs } })
  }
}
