import { describe, expect, it } from 'vitest'
import { PromptRegistry } from './prompt.registry'

describe('PromptRegistry', () => {
  it('returns the receipt scan prompt and JSON config', () => {
    const prompt = new PromptRegistry().get('receipt-scan:v1')
    expect(prompt.systemPrompt).toContain('Uruguay')
    expect(prompt.generationConfig.responseMimeType).toBe('application/json')
  })

  it('rejects unknown prompts', () => {
    expect(() => new PromptRegistry().get('missing')).toThrow('Prompt no registrado')
  })

  it('lists registered prompt ids', () => {
    expect(new PromptRegistry().list()).toContain('receipt-scan:v1')
  })
})
