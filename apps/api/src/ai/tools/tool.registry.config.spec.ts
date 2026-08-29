import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

describe('tool configuration boundaries', () => {
  it('does not make implementations, Zod, risk, idempotency, or Finance Engine configurable', () => {
    const source = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), 'tool.registry.ts'), 'utf8')
    expect(source).toContain('risk: \'write\'')
    expect(source).toContain('sourceMessageId: c.pendingId ?? c.sourceMessageId')
    expect(source).toContain('inputSchema: expenseSchema')
    expect(source).not.toContain('AiToolConfig')
  })
})
