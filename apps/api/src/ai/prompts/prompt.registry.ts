import { Injectable } from '@nestjs/common'
import {
  RECEIPT_SCAN_GENERATION_CONFIG,
  RECEIPT_SCAN_PROMPT_ID,
  RECEIPT_SCAN_PROMPT_V1,
} from './receipt-scan.prompt'
import type { ModelConfig } from '../client/gemini.types'

export interface RegisteredPrompt {
  systemPrompt: string
  generationConfig: ModelConfig
}

@Injectable()
export class PromptRegistry {
  private readonly prompts = new Map<string, RegisteredPrompt>([
    [RECEIPT_SCAN_PROMPT_ID, { systemPrompt: RECEIPT_SCAN_PROMPT_V1, generationConfig: RECEIPT_SCAN_GENERATION_CONFIG }],
  ])

  get(promptId: string): RegisteredPrompt {
    const prompt = this.prompts.get(promptId)
    if (!prompt) throw new Error(`Prompt no registrado: ${promptId}`)
    return prompt
  }

  has(promptId: string): boolean {
    return this.prompts.has(promptId)
  }

  list(): string[] {
    return [...this.prompts.keys()]
  }
}
