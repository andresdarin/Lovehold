import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

describe('tool configuration boundaries', () => {
  it('does not make implementations, Zod, risk, idempotency, or Finance Engine configurable', () => {
    const source = readFileSync(join(process.cwd(), 'apps/api/src/ai/tools/tool.registry.ts'), 'utf8')
    expect(source).toContain('risk: \'write\'')
    expect(source).toContain('sourceMessageId: c.pendingId ?? c.sourceMessageId')
    expect(source).toContain('inputSchema: expenseSchema')
    expect(source).not.toContain('AiToolConfig')
  })
})
