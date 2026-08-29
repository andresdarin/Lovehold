import { ZodSchema } from 'zod'

export type ToolRisk = 'read' | 'write' | 'destructive'

// Toda future write tool debe definir idempotencyKey = AiPendingAction.id y usarlo como sourceMessageId.
export interface ToolDefinition {
  name: string
  description: string
  risk: ToolRisk
  inputSchema: ZodSchema
  // Every risk:write tool must use AiPendingAction.id as its idempotency key.
  execute: (args: any, ctx: { profileId: string; sourceMessageId?: string; pendingId?: string }) => Promise<unknown>
}

export interface ToolCall { name: string; args: unknown }

export interface ToolResult {
  name: string
  success: boolean
  data?: unknown
  error?: string
}
