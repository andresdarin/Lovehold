import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { GeminiClient } from '../client/gemini.client'
import { ChatMessage, FunctionCall } from '../client/gemini.types'
import { AiConfigResolver } from '../config/ai-config.resolver'
import { EffectiveAiConfig } from '../config/ai-config.types'
import { ToolExecutor } from '../tools/tool.executor'
import { ToolRegistry } from '../tools/tool.registry'
import { PlaygroundRequestDto, PlaygroundResponseDto, PlaygroundToolCall, PlaygroundMode } from './dto/playground.dto'

const LIMIT = 500

@Injectable()
export class AiPlaygroundService {
  constructor(private readonly resolver: AiConfigResolver, private readonly gemini: GeminiClient, private readonly registry: ToolRegistry, private readonly executor: ToolExecutor, private readonly prisma: PrismaService) {}

  async run(profileId: string, dto: PlaygroundRequestDto): Promise<PlaygroundResponseDto> {
    const started = Date.now()
    let effective = await this.resolver.resolve('finnic', dto.environment || 'DEV')
    try {
      effective = await this.overrides(effective, dto)
      const tools = this.registry.getDeclarations().filter(t => effective.tools.some(c => c.name === t.name && c.enabled))
      const history: ChatMessage[] = (dto.history || []).map(m => ({ role: m.role, parts: m.parts.map(p => ({ text: this.clip(p.text) })) }))
      history.push({ role: 'user', parts: [{ text: this.clip(dto.message) }] })
      const calls: PlaygroundToolCall[] = []
      const generationConfig = { temperature: effective.model.temperature, maxOutputTokens: effective.model.maxTokens, responseMimeType: effective.model.responseMimeType }
      for (let iteration = 0; iteration < Math.min(5, effective.policy.limits.maxIterations); iteration++) {
        const answer = await this.gemini.chat({ model: effective.model.model, systemInstruction: effective.prompt.content, history, tools, generationConfig })
        if (!answer.functionCalls?.length) return this.response(answer.text || 'No pude generar una respuesta.', calls, effective, started)
        for (const call of answer.functionCalls) {
          const result = await this.handleTool(call, profileId, dto.mode, effective, calls)
          history.push({ role: 'model', parts: [{ functionCall: call }] }, { role: 'user', parts: [{ functionResponse: { name: call.name, response: result } }] })
        }
      }
      return this.response('No pude completar la consulta.', calls, effective, started, 'Se alcanzó el máximo de iteraciones.')
    } catch {
      return this.response('No pude completar la consulta.', [], effective, started, 'Error seguro ejecutando el playground.')
    }
  }

  private async overrides(base: EffectiveAiConfig, dto: PlaygroundRequestDto): Promise<EffectiveAiConfig> {
    const config: EffectiveAiConfig = { ...base, prompt: { ...base.prompt }, model: { ...base.model }, tools: base.tools.map(t => ({ ...t })) }
    if (dto.promptVersionId) {
      const prompt = await (this.prisma as any).aiPromptVersion.findUnique({ where: { id: dto.promptVersionId }, include: { prompt: true } })
      if (prompt) config.prompt = { id: prompt.id, key: prompt.prompt?.key || config.prompt.key, content: prompt.content, version: prompt.version }
    }
    if (dto.modelConfigId) {
      const model = await (this.prisma as any).aiModelConfig.findUnique({ where: { id: dto.modelConfigId } })
      if (model) config.model = { model: model.model, temperature: model.temperature, maxTokens: model.maxTokens, responseMimeType: model.responseMimeType || undefined }
    }
    if (dto.toolOverrides) config.tools = config.tools.map(tool => ({ ...tool, enabled: dto.toolOverrides!.find(o => o.toolName === tool.name)?.enabled ?? tool.enabled }))
    return config
  }

  private async handleTool(call: FunctionCall, profileId: string, mode: PlaygroundMode, config: EffectiveAiConfig, calls: PlaygroundToolCall[]) {
    const started = Date.now(), definition = this.registry.has(call.name) ? this.registry.get(call.name) : undefined
    const toolConfig = config.tools.find(t => t.name === call.name)
    let success = false, error: string | undefined, result: unknown
    if (!definition || !toolConfig?.enabled) error = 'Tool no permitida'
    else if (definition.risk === 'write' || definition.risk === 'destructive') error = 'Playground no ejecuta writes'
    else if (mode === PlaygroundMode.SANDBOX) { success = true; result = { mock: true, tool: call.name } }
    else {
      const executed = await this.executor.execute(call, { profileId })
      success = executed.success; error = executed.error; result = executed.data
    }
    calls.push({ name: call.name, args: this.sanitize(call.args), success, durationMs: Date.now() - started, ...(error ? { error } : {}), ...(result !== undefined ? { result: this.sanitize(result) } : {}) })
    return { success, ...(error ? { error } : {}), ...(result !== undefined ? { data: this.sanitize(result) } : {}) }
  }

  private response(text: string, toolCalls: PlaygroundToolCall[], config: EffectiveAiConfig, started: number, error?: string): PlaygroundResponseDto {
    return { text: this.clip(text), toolCalls, model: config.model.model, promptKey: config.prompt.key, promptVersion: config.prompt.version, configUsed: this.sanitize(config), latencyMs: Date.now() - started, ...(error ? { error } : {}) }
  }
  private clip(value: unknown): string { return typeof value === 'string' ? value.slice(0, LIMIT) : '' }
  private sanitize(value: unknown): any {
    if (value === undefined || value === null || typeof value === 'number' || typeof value === 'boolean') return value
    if (typeof value === 'string') return value.slice(0, LIMIT)
    if (Array.isArray(value)) return value.slice(0, 20).map(v => this.sanitize(v))
    if (typeof value === 'object') return Object.fromEntries(Object.entries(value as Record<string, unknown>).filter(([key]) => !/key|secret|token|password|reasoning/i.test(key)).map(([key, v]) => [key, this.sanitize(v)]))
    return undefined
  }
}
