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
