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
    if (!parsed.success) return { name: call.name, success: false, error: `Argumentos inválidos: ${parsed.error.message}` }
    try {
      return { name: call.name, success: true, data: await definition.execute(parsed.data, ctx) }
    } catch (error) {
      console.error(`Error ejecutando tool ${call.name}`, error)
      return { name: call.name, success: false, error: 'Error interno ejecutando tool' }
    }
  }
}
