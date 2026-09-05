import type { AgentResponse } from './agent.orchestrator'
import type { AiPendingActionService } from '../pending/ai-pending-action.service'
import type { ToolExecutor } from '../tools/tool.executor'
import type { AiConversationService } from '../conversation/ai-conversation.service'
import type { AiObservabilityService } from '../observability/ai-observability.service'
import type { EffectiveAiConfig } from '../config/ai-config.types'
import { AiMessageRole } from '@prisma/client'
type Dependencies = { pending: AiPendingActionService; executor: ToolExecutor; conversations: AiConversationService; observability: AiObservabilityService }
export async function confirmAction(deps: Dependencies, req: { profileId: string; pendingActionId: string }, effective: EffectiveAiConfig, useLimits: boolean): Promise<AgentResponse> {
  const { pending, executor, conversations, observability } = deps
  const action = await pending.getForConfirm(req.profileId, req.pendingActionId)
  const base = { conversationId: action.conversationId, kind: 'action' as const }
  if (action.status === 'completed') return { ...base, text: 'La operación ya fue registrada.', actionStatus: 'completed' }
  if (action.status === 'failed') return { ...base, text: 'No pude completar la operación.', actionStatus: 'failed', kind: 'error' }
  if (action.status === 'cancelled' || action.status === 'expired') return { ...base, text: 'La operación ya no está disponible.', actionStatus: action.status }
  if (!effective.tools.some(tool => tool.name === action.toolName && tool.enabled)) return { ...base, text: 'Esta operación ya no está habilitada.', kind: 'error' }
  const run = await observability.startRun({ profileId: req.profileId, conversationId: action.conversationId, model: effective.model.model, promptId: effective.prompt.id })
  try {
    const confirmed = await (useLimits ? pending.confirm(req.profileId, req.pendingActionId, effective.policy.limits) : pending.confirm(req.profileId, req.pendingActionId))
    if (!confirmed.claimed) {
      await observability.endRun(run.id, { status: 'completed' })
      return { ...base, text: confirmed.status === 'completed' ? 'La operación ya fue registrada.' : 'La operación ya está siendo procesada.', actionStatus: confirmed.status }
    }
    const result = await executor.execute({ name: confirmed.toolName, args: confirmed.args }, { profileId: req.profileId, pendingId: confirmed.id, sourceMessageId: confirmed.id })
    await Promise.resolve(observability.logToolCall({ runId: run.id, toolName: confirmed.toolName, risk: confirmed.risk, input: { fields: Object.keys(confirmed.args as Record<string, unknown>) }, success: result.success })).catch(() => undefined)
    if (result.success) await pending.markCompleted(confirmed.id, result)
    else await pending.markFailed(confirmed.id, 'No se pudo completar la operación.')
    const text = result.success ? 'Listo, el gasto fue registrado. Podés revisarlo en [Finanzas](/finanzas).' : 'No pude completar la operación. Revisá la cuenta, la moneda y los datos antes de crear otra propuesta.'
    const actionStatus = result.success ? 'completed' as const : 'failed' as const
    await conversations.createMessage({ conversationId: action.conversationId, role: AiMessageRole.ASSISTANT, content: text, metadata: { kind: result.success ? 'action' : 'error', actionStatus } })
    await observability.endRun(run.id, { status: result.success ? 'completed' : 'failed' })
    return { ...base, text, actionStatus, toolCalls: [{ name: confirmed.toolName, args: confirmed.args, success: result.success }] }
  } catch {
    // If persistence failed after the write, keep the lease/idempotency key. Never blindly re-run a write.
    await Promise.resolve(observability.endRun(run.id, { status: 'failed', error: 'Confirmation unavailable' })).catch(() => undefined)
    return { ...base, text: 'No pudimos verificar el resultado. Revisá el historial antes de volver a confirmar.', kind: 'error' }
  }
}

