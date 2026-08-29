export interface ModelConfig {
  temperature?: number
  maxOutputTokens?: number
  responseMimeType?: string
  responseSchema?: Record<string, unknown>
}

export interface GenerateContentRequest {
  systemPrompt: string
  inlineData: { mimeType: string; data: string }
  generationConfig?: ModelConfig
}

export interface GenerateContentResponse {
  text: string
  finishReason?: string
}

export interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> }
    finishReason?: string
  }>
}

export interface FunctionDeclaration {
  name: string
  description: string
  parameters: object
}

export interface FunctionCall {
  name: string
  args: Record<string, unknown>
}

export interface ChatMessage {
  role: 'user' | 'model'
  parts: Array<{
    text?: string
    functionCall?: FunctionCall
    functionResponse?: { name: string; response: unknown }
  }>
}

export interface ChatGenerateRequest {
  systemInstruction?: string
  history: ChatMessage[]
  tools?: Array<{ functionDeclarations: FunctionDeclaration[] }>
  generationConfig?: ModelConfig
}

export interface ChatGenerateResponse {
  text?: string
  functionCalls?: FunctionCall[]
  finishReason?: string
}
