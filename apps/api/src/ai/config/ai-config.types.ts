export interface EffectiveAiConfig {
  agent: { id: string; slug: string; name: string }
  prompt: { id: string; key: string; content: string; version: number }
  model: { model: string; temperature: number; maxTokens: number; responseMimeType?: string }
  tools: Array<{ name: string; enabled: boolean; requireConfirmation: boolean; maxAttempts: number }>
  policy: { confirmationPolicy: string; limits: { maxIterations: number; leaseMs: number; maxAttempts: number } }
}

/** Runtime configuration only: identity/personality, prompts, model settings,
 * tool activation/confirmation and execution limits are configurable.
 * Tool implementations, Zod schemas, base risk classification, idempotency
 * (sourceMessageId), and Finance Engine behavior are deliberately NOT configurable. */
