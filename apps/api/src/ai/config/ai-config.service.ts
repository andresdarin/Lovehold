import { Injectable, Optional } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { AiConfigResolver } from './ai-config.resolver'

@Injectable()
export class AiConfigService {
  constructor(private readonly prisma: PrismaService, @Optional() private readonly resolver?: AiConfigResolver) {}

  ensureFinnicAgent() { return (this.prisma as any).aiAgent.upsert({ where: { slug: 'finnic' }, update: {}, create: { slug: 'finnic', name: 'Finnic' } }) }
  async createPromptVersion(agentId: string, key: string, content: string) {
    const prompt = await (this.prisma as any).aiPrompt.upsert({ where: { agentId_key: { agentId, key } }, update: {}, create: { agentId, key } })
    const last = await (this.prisma as any).aiPromptVersion.findFirst({ where: { promptId: prompt.id }, orderBy: { version: 'desc' } })
    return (this.prisma as any).aiPromptVersion.create({ data: { promptId: prompt.id, version: (last?.version || 0) + 1, content, status: 'draft' } })
  }
  async publishPromptVersion(id: string) {
    const version = await (this.prisma as any).aiPromptVersion.findUnique({ where: { id } })
    if (!version) throw new Error('Prompt version not found')
    await (this.prisma as any).$transaction([
      (this.prisma as any).aiPromptVersion.updateMany({ where: { promptId: version.promptId, status: { in: ['published', 'active'] } }, data: { status: 'archived' } }),
      (this.prisma as any).aiPromptVersion.update({ where: { id }, data: { status: 'published' } }),
    ])
    return (this.prisma as any).aiPromptVersion.findUnique({ where: { id } })
  }
  createModelConfig(agentId: string, data: { model: string; temperature?: number; maxTokens?: number; responseMimeType?: string }) {
    return (this.prisma as any).aiModelConfig.create({ data: { agentId, model: data.model, temperature: data.temperature ?? .5, maxTokens: data.maxTokens ?? 1024, responseMimeType: data.responseMimeType ?? 'text/plain', status: 'active' } })
  }
  createAiModelConfig(agentId: string, data: { model: string; temperature?: number; maxTokens?: number; responseMimeType?: string }) { return this.createModelConfig(agentId, data) }
  updateAiModelConfig(id: string, data: Record<string, unknown>) { return this.updateModelConfig(id, data) }
  updateModelConfig(id: string, data: Record<string, unknown>) { return (this.prisma as any).aiModelConfig.update({ where: { id }, data: { ...data, status: 'active' } }) }
  upsertToolConfig(agentId: string, toolName: string, data: { enabled?: boolean; requireConfirmation?: boolean; maxAttempts?: number }) { return (this.prisma as any).aiToolConfig.upsert({ where: { agentId_toolName: { agentId, toolName } }, update: { ...data, status: 'active' }, create: { agentId, toolName, ...data, status: 'active' } }) }
  async deploy(input: { agentSlug: string; environment: string; promptVersionId?: string; modelConfigId?: string }) {
    const agent = await (this.prisma as any).aiAgent.findUnique({ where: { slug: input.agentSlug } })
    if (!agent) throw new Error('Agent not found')
    const write = (db: any) => [
      db.aiDeployment.updateMany({ where: { agentId: agent.id, environment: input.environment, isActive: true }, data: { isActive: false } }),
      ...(input.promptVersionId ? [db.aiPromptVersion.update({ where: { id: input.promptVersionId }, data: { status: 'active' } })] : []),
      db.aiDeployment.create({ data: { agentId: agent.id, environment: input.environment, promptVersionId: input.promptVersionId, modelConfigId: input.modelConfigId, isActive: true } }),
    ]
    const transaction = async () => {
      if ((this.prisma as any).$executeRaw) {
        return (await (this.prisma as any).$transaction(async (tx: any) => {
          await tx.$executeRaw`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE`
          return (await Promise.all(write(tx))).at(-1)
        }))
      }
      return (await (this.prisma as any).$transaction(write(this.prisma))).at(-1)
    }
    let result: any
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        result = await transaction()
        break
      } catch (error: any) {
        if (error?.code !== 'P2002' || attempt === 1) throw error
      }
    }
    this.resolver?.invalidate()
    return result
  }
}
