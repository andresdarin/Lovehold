import { Injectable } from '@nestjs/common'
import { ToolCall, ToolResult } from './tool.contract'
import { ToolRegistry } from './tool.registry'

@Injectable()
export class ToolExecutor {
  constructor(private readonly registry: ToolRegistry) {}

  async execute(call: ToolCall, ctx: { profileId: string; sourceMessageId?: string; pendingId?: string }): Promise<ToolResult> {
    if (!this.registry.has(call.name)) return { name: call.name, success: false, error: 'Tool no permitida' }
    const definition = this.registry.get(call.name)
    const parsed = definition.inputSchema.safeParse(call.args)
    if (!parsed.success) return { name: call.name, success: false, error: `Argumentos inválidos. Revisar: ${parsed.error.issues.map(issue => issue.path.join('.')).join(', ')}` }
    if (definition.risk !== 'read' && !ctx.pendingId) return { name: call.name, success: false, error: 'La operación requiere una confirmación vinculada.' }
    try {
      return { name: call.name, success: true, data: await definition.execute(parsed.data, ctx) }
    } catch {
      console.error(`Error ejecutando tool ${call.name}`)
      return { name: call.name, success: false, error: 'Error interno ejecutando tool' }
    }
  }
}
