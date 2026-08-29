import { Injectable, Optional } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AiMessageRole } from '@prisma/client'
import { GeminiClient } from '../client/gemini.client'
import { ChatMessage, FunctionCall } from '../client/gemini.types'
import { FINNIC_PROMPT_ID } from '../prompts/finnic.prompt'
import { PromptRegistry } from '../prompts/prompt.registry'
import { ToolExecutor } from '../tools/tool.executor'
import { ToolRegistry } from '../tools/tool.registry'
import { AiConversationService } from '../conversation/ai-conversation.service'
import { AiPendingActionService } from '../pending/ai-pending-action.service'
import { AiObservabilityService } from '../observability/ai-observability.service'
import { AiContextService } from '../context/ai-context.service'
import { AiConfigResolver } from '../config/ai-config.resolver'
import type { EffectiveAiConfig } from '../config/ai-config.types'

export type AgentRequest = { profileId: string; conversationId: string; message: string }
export type AgentResponse = {
  text: string; conversationId: string; pendingActionId?: string
  pendingActionDescription?: string; toolCalls?: Array<{ name: string; args: unknown; success: boolean }>
}
export const MAX_ITERATIONS = 5
const FALLBACK = 'No pude completar la consulta. Intentá de nuevo.'

@Injectable()
export class AgentOrchestrator {
  constructor(
    private readonly gemini: GeminiClient, private readonly registry: ToolRegistry,
    private readonly executor: ToolExecutor, private readonly prompts: PromptRegistry,
    private readonly conversations: AiConversationService, private readonly pending: AiPendingActionService,
    private readonly observability: AiObservabilityService, private readonly context: AiContextService,
    @Optional() private readonly resolver?: AiConfigResolver,
    @Optional() private readonly config?: ConfigService,
  ) {}

  async run(req: AgentRequest): Promise<AgentResponse> {
    const effective = await this.resolveConfig()
    const prompt = { systemPrompt: effective.prompt.content, generationConfig: { temperature: effective.model.temperature, maxOutputTokens: effective.model.maxTokens, responseMimeType: effective.model.responseMimeType } }
    const enabledTools = new Set(effective.tools.filter(tool => tool.enabled).map(tool => tool.name))
    const declarations = this.registry.getDeclarations().filter(tool => enabledTools.has(tool.name))
    const run = await this.observability.startRun({ ...this.runMeta(req, effective.model.model), conversationId: req.conversationId })
    try {
      await this.context.assertConversationOwnership(req.profileId, req.conversationId)
      const window = await this.conversations.getRecentWindow(req.conversationId, 20)
      await this.conversations.createMessage({ conversationId: req.conversationId, role: AiMessageRole.USER, content: req.message })
      const history: ChatMessage[] = [...window.map((m) => ({ role: m.role === AiMessageRole.USER ? 'user' as const : 'model' as const, parts: [{ text: m.content }] })), { role: 'user', parts: [{ text: req.message }] }]
      const calls: AgentResponse['toolCalls'] = []
      for (let i = 0; i < effective.policy.limits.maxIterations; i++) {
        const result = await this.gemini.chat({ systemInstruction: prompt.systemPrompt, history, tools: declarations, generationConfig: prompt.generationConfig })
        if (!result.functionCalls?.length) return this.complete(run.id, req, result.text || 'No pude generar una respuesta.', calls)
        for (const call of result.functionCalls) {
          const toolConfig = effective.tools.find(tool => tool.name === call.name)
          if (!this.registry.has(call.name) || !toolConfig?.enabled) {
            calls.push({ name: call.name, args: call.args, success: false }); await this.log(run.id, call, 'unknown', false, 'Tool no permitida')
            history.push(this.modelCall(call), this.response(call.name, { success: false, error: 'Tool no permitida' })); continue
          }
          const definition = this.registry.get(call.name)
          if ((definition.risk === 'write' || definition.risk === 'destructive') && (toolConfig?.requireConfirmation ?? true)) {
            const action = await this.pending.create({ profileId: req.profileId, conversationId: req.conversationId, toolName: call.name, args: call.args, risk: 'write' })
            await this.log(run.id, call, definition.risk, false, 'pending_confirmation')
            await this.observability.endRun(run.id, { status: 'pending_confirmation' })
            return { text: `¿Confirmás ${definition.description}?`, conversationId: req.conversationId, pendingActionId: action.id, pendingActionDescription: definition.description, toolCalls: calls }
          }
          const started = Date.now(); const toolResult = await this.executor.execute(call, { profileId: req.profileId })
          calls.push({ name: call.name, args: call.args, success: toolResult.success }); await this.log(run.id, call, definition.risk, toolResult.success, toolResult.error, Date.now() - started)
          history.push(this.modelCall(call), this.response(call.name, toolResult))
        }
      }
      await this.observability.endRun(run.id, { status: 'failed', error: 'Maximum iterations reached' }); return { text: FALLBACK, conversationId: req.conversationId, toolCalls: calls }
    } catch (error) {
      await this.observability.endRun(run.id, { status: 'failed', error: error instanceof Error ? error.message : 'Agent error' }).catch(() => undefined)
      return { text: FALLBACK, conversationId: req.conversationId }
    }
  }

  async confirmPending(req: { profileId: string; pendingActionId: string }): Promise<AgentResponse> {
    const effective = await this.resolveConfig()
    const action = await this.pending.getForConfirm(req.profileId, req.pendingActionId)
    if (action.status === 'completed' || action.status === 'failed') return { text: this.resultText(action.result), conversationId: action.conversationId }
    if (action.status === 'cancelled' || action.status === 'expired') return { text: 'La operación ya no está disponible.', conversationId: action.conversationId }
    const run = await this.observability.startRun({ ...this.runMeta(req, effective.model.model), conversationId: action.conversationId })
    try {
      const confirmed = await (this.resolver
        ? this.pending.confirm(req.profileId, req.pendingActionId, effective.policy.limits)
        : this.pending.confirm(req.profileId, req.pendingActionId))
      if (!confirmed.claimed && confirmed.leaseActive) return { text: 'La operación ya está siendo procesada.', conversationId: confirmed.conversationId, pendingActionId: confirmed.id }
      if (!confirmed.claimed) return { text: 'La operación ya está siendo procesada.', conversationId: confirmed.conversationId }
      const started = Date.now(); let result: Awaited<ReturnType<ToolExecutor['execute']>>
      try {
        result = await this.executor.execute({ name: confirmed.toolName, args: confirmed.args }, { profileId: req.profileId, pendingId: confirmed.id, sourceMessageId: confirmed.id })
      } catch (error) {
        await this.pending.markFailed(confirmed.id, error instanceof Error ? error.message : 'Tool execution failed')
        throw error
      }
      if (result.success) await this.pending.markCompleted(confirmed.id, result)
      else await this.pending.markFailed(confirmed.id, result.error || 'Tool failed')
      await this.log(run.id, { name: confirmed.toolName, args: confirmed.args as Record<string, unknown> }, confirmed.risk, result.success, result.error, Date.now() - started)
      await this.conversations.createMessage({ conversationId: confirmed.conversationId, role: AiMessageRole.ASSISTANT, content: 'Tool ejecutada.', metadata: { functionCall: { name: confirmed.toolName, args: confirmed.args } } })
      await this.conversations.createMessage({ conversationId: confirmed.conversationId, role: AiMessageRole.ASSISTANT, content: 'Resultado de la operación.', metadata: { functionResponse: { name: confirmed.toolName, success: result.success } } })
      let text = result.success ? this.resultText(result.data, 'Listo, la operación fue registrada.') : 'No pude completar la operación.'
      if (result.success) {
        const final = await this.gemini.chat({ systemInstruction: effective.prompt.content, history: [this.modelCall({ name: confirmed.toolName, args: confirmed.args as Record<string, unknown> }), this.response(confirmed.toolName, { success: true, data: result.data })], tools: this.registry.getDeclarations().filter(tool => effective.tools.some(config => config.name === tool.name && config.enabled)), generationConfig: { temperature: effective.model.temperature, maxOutputTokens: effective.model.maxTokens, responseMimeType: effective.model.responseMimeType } }).catch(() => undefined)
        text = final?.text || text
      }
      await this.conversations.createMessage({ conversationId: confirmed.conversationId, role: AiMessageRole.ASSISTANT, content: text })
      await this.observability.endRun(run.id, { status: result.success ? 'completed' : 'failed', error: result.error }); return { text, conversationId: confirmed.conversationId, toolCalls: [{ name: confirmed.toolName, args: confirmed.args, success: result.success }] }
    } catch (error) { await this.observability.endRun(run.id, { status: 'failed', error: error instanceof Error ? error.message : 'Confirmation failed' }).catch(() => undefined); return { text: 'No pude confirmar la operación.', conversationId: action.conversationId } }
  }

  private runMeta(req: { profileId: string }, model?: string) { return { profileId: req.profileId, model: model || this.config?.get('GEMINI_API_MODEL') || 'gemini-2.5-flash', promptId: FINNIC_PROMPT_ID } }
  private resolveConfig(): Promise<EffectiveAiConfig> {
    if (this.resolver) return this.resolver.resolve('finnic', this.config?.get('AI_ENV') || process.env.AI_ENV || 'PROD')
    const names = typeof (this.registry as any).listNames === 'function'
      ? (this.registry as any).listNames()
      : this.registry.getDeclarations().map(tool => tool.name)
    const fallbackNames = names.length ? [...new Set([...names, 'create_expense'])] : ['get_financial_snapshot', 'get_spending_capacity', 'get_upcoming_obligations', 'simulate_purchase', 'create_expense']
    return Promise.resolve({ agent: { id: 'finnic', slug: 'finnic', name: 'Finnic' }, prompt: { id: FINNIC_PROMPT_ID, key: 'finnic-system', content: this.prompts.get(FINNIC_PROMPT_ID).systemPrompt, version: 1 }, model: { model: this.config?.get('GEMINI_API_MODEL') || 'gemini-2.5-flash', temperature: .5, maxTokens: 1024, responseMimeType: 'text/plain' }, tools: fallbackNames.map((name: string) => ({ name, enabled: true, requireConfirmation: name === 'create_expense', maxAttempts: 3 })), policy: { confirmationPolicy: 'writes', limits: { maxIterations: MAX_ITERATIONS, leaseMs: 120000, maxAttempts: 3 } } })
  }
  private async complete(id: string, req: AgentRequest, text: string, toolCalls: AgentResponse['toolCalls']) { await this.conversations.createMessage({ conversationId: req.conversationId, role: AiMessageRole.ASSISTANT, content: text }); await this.observability.endRun(id, { status: 'completed' }); await this.conversations.touch(req.conversationId); return { text, conversationId: req.conversationId, toolCalls } }
  private async log(runId: string, call: FunctionCall, risk: string, success: boolean, error?: string, durationMs?: number) { await this.observability.logToolCall({ runId, toolName: call.name, risk, input: call.args, success, error, durationMs }) }
  private modelCall(call: FunctionCall): ChatMessage { return { role: 'model', parts: [{ functionCall: call }] } }
  private response(name: string, response: unknown): ChatMessage { return { role: 'user', parts: [{ functionResponse: { name, response } }] } }
  private resultText(value: unknown, fallback = 'La operación fue procesada.') { return typeof value === 'string' ? value : fallback }
}
