export interface AiConversation { id: string; profileId: string; title: string | null; createdAt: string; updatedAt: string }
export type AiMessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM'
export type ActionStatus = 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled' | 'expired'
export interface AiMessage {
  id: string; conversationId: string; role: AiMessageRole; content: string; createdAt: string
  metadata?: { kind?: 'explanation' | 'query' | 'action' | 'error'; pendingActionId?: string; actionStatus?: ActionStatus; [key: string]: unknown } | null
}
export interface AgentResponse {
  text: string; conversationId: string; pendingActionId?: string; actionStatus?: ActionStatus
  kind?: 'explanation' | 'query' | 'action' | 'error'
}
export interface SendMessageResponse { userMessage: AiMessage; assistantMessage: AiMessage }

