import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { ToolExecutor } from './tool.executor'

const schema = z.object({ amount: z.number().positive() })
const definition = { name: 'test_tool', description: 'test', risk: 'read' as const, inputSchema: schema, execute: vi.fn(async () => ({ ok: true })) }
const registry = (tool: any = definition, exists = true) => ({ has: vi.fn(() => exists), get: vi.fn(() => tool) })

describe('ToolExecutor', () => {
  it('rechaza argumentos inválidos con Zod', async () => {
    const result = await new ToolExecutor(registry()).execute({ name: 'test_tool', args: { amount: -5 } }, { profileId: 'p' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('Argumentos inválidos')
    expect(definition.execute).not.toHaveBeenCalled()
  })

  it('rechaza una tool fuera de la allowlist', async () => {
    const result = await new ToolExecutor(registry(definition, false)).execute({ name: 'missing', args: { amount: 1 } }, { profileId: 'p' })
    expect(result).toEqual({ name: 'missing', success: false, error: 'Tool no permitida' })
  })

  it('no expone errores internos', async () => {
    const failing = { ...definition, execute: vi.fn(async () => { throw new Error('secret database details') }) }
    const result = await new ToolExecutor(registry(failing)).execute({ name: 'test_tool', args: { amount: 1 } }, { profileId: 'p' })
    expect(result).toEqual({ name: 'test_tool', success: false, error: 'Error interno ejecutando tool' })
    expect(JSON.stringify(result)).not.toContain('secret database details')
  })
})
