export interface AiConversation {
  id: string
  profileId: string
  title: string | null
  createdAt: string
  updatedAt: string
}

export type AiMessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM'

export interface AiMessage {
  id: string
  conversationId: string
  role: AiMessageRole
  content: string
  metadata?: Record<string, unknown> | null
  createdAt: string
}

export interface SendMessageResponse {
  userMessage: AiMessage
  assistantMessage: AiMessage
}
