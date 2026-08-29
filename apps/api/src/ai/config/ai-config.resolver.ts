import { Injectable, Optional } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../prisma/prisma.service'
import { FINNIC_GENERATION_CONFIG, FINNIC_SYSTEM_PROMPT_V1 } from '../prompts/finnic.prompt'
import { EffectiveAiConfig } from './ai-config.types'

const TOOL_NAMES = ['get_financial_snapshot', 'get_spending_capacity', 'get_upcoming_obligations', 'simulate_purchase', 'create_expense']
const fallback = (id = 'finnic') : EffectiveAiConfig => ({ agent: { id, slug: 'finnic', name: 'Finnic' }, prompt: { id: 'finnic-system:v1', key: 'finnic-system', content: FINNIC_SYSTEM_PROMPT_V1, version: 1 }, model: { model: process.env.GEMINI_API_MODEL || 'gemini-2.5-flash', temperature: FINNIC_GENERATION_CONFIG.temperature ?? .5, maxTokens: FINNIC_GENERATION_CONFIG.maxOutputTokens ?? 1024, responseMimeType: FINNIC_GENERATION_CONFIG.responseMimeType }, tools: TOOL_NAMES.map(name => ({ name, enabled: true, requireConfirmation: name === 'create_expense', maxAttempts: 3 })), policy: { confirmationPolicy: 'writes', limits: { maxIterations: 5, leaseMs: 120000, maxAttempts: 3 } } })

@Injectable()
export class AiConfigResolver {
  private cache = new Map<string, { at: number; value: EffectiveAiConfig }>()
  constructor(private readonly prisma: PrismaService, @Optional() private readonly config?: ConfigService) {}
  invalidate() { this.cache.clear() }
  async resolve(agentSlug = 'finnic', environment = this.config?.get('AI_ENV') || process.env.AI_ENV || 'PROD'): Promise<EffectiveAiConfig> {
    const key = `${agentSlug}:${environment}`, cached = this.cache.get(key)
    if (cached && Date.now() - cached.at < 30000) return cached.value
    try {
      const agent = await (this.prisma as any).aiAgent.findUnique({ where: { slug: agentSlug } })
      if (!agent) return this.store(key, fallback())
      const deployment = await (this.prisma as any).aiDeployment.findFirst({ where: { agentId: agent.id, environment, isActive: true }, include: { promptVersion: { include: { prompt: true } }, modelConfig: true } })
      const prompt = deployment?.promptVersion
      const model = deployment?.modelConfig
      const rows = await (this.prisma as any).aiToolConfig.findMany({ where: { agentId: agent.id, enabled: true } })
      const tools = rows.length ? rows.map((t: any) => ({ name: t.toolName, enabled: t.enabled, requireConfirmation: t.requireConfirmation, maxAttempts: t.maxAttempts })) : fallback(agent.id).tools
      const base = fallback(agent.id)
      const value: EffectiveAiConfig = { agent: { id: agent.id, slug: agent.slug, name: agent.name }, prompt: prompt ? { id: prompt.id, key: prompt.prompt?.key || 'finnic-system', content: prompt.content, version: prompt.version } : base.prompt, model: prompt && model ? { model: model.model, temperature: model.temperature, maxTokens: model.maxTokens, responseMimeType: model.responseMimeType || undefined } : base.model, tools, policy: base.policy }
      return this.store(key, value)
    } catch { return fallback() }
  }
  private store(key: string, value: EffectiveAiConfig) { this.cache.set(key, { at: Date.now(), value }); return value }
}
