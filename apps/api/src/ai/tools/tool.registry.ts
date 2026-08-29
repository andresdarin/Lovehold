import { Injectable } from '@nestjs/common'
import { z } from 'zod'
import { CreateExpenseUseCase } from '../../finance/application/create-expense.usecase'
import { GetFinancialSnapshotUseCase } from '../../finance/application/get-financial-snapshot.usecase'
import { GetSpendingCapacityUseCase } from '../../finance/application/get-spending-capacity.usecase'
import { GetUpcomingObligationsUseCase } from '../../finance/application/get-upcoming-obligations.usecase'
import { SimulatePurchaseUseCase } from '../../finance/application/simulate-purchase.usecase'
import { ToolDefinition } from './tool.contract'

const windows = ['today', 'weekend', 'restOfMonth'] as const
const snapshotSchema = z.object({})
const capacitySchema = z.object({ window: z.enum(windows).default('today').optional() })
const obligationsSchema = z.object({ window: z.enum(windows).default('restOfMonth').optional() })
const simulateSchema = z.object({ amount: z.number().positive(), currency: z.enum(['UYU', 'USD']).default('UYU').optional(), description: z.string().optional() })
const expenseSchema = z.object({
  amount: z.number().positive(), currency: z.enum(['UYU', 'USD']).default('UYU'),
  category: z.string().min(1), title: z.string().min(1), date: z.string().optional(),
  notes: z.string().optional(), financeAccountId: z.string().optional(),
})

type Declaration = { name: string; description: string; parameters: object }
const declarations: Declaration[] = [
  { name: 'get_financial_snapshot', description: 'Obtiene snapshot financiero completo (balances, ingresos, gastos)', parameters: { type: 'object', properties: {}, additionalProperties: false } },
  { name: 'get_spending_capacity', description: 'Obtiene la capacidad de gasto disponible para una ventana temporal', parameters: { type: 'object', properties: { window: { type: 'string', enum: [...windows], default: 'today' } } } },
  { name: 'get_upcoming_obligations', description: 'Obtiene las obligaciones financieras próximas para una ventana temporal', parameters: { type: 'object', properties: { window: { type: 'string', enum: [...windows], default: 'restOfMonth' } } } },
  { name: 'simulate_purchase', description: 'Simula una compra y muestra su impacto financiero sin guardar cambios', parameters: { type: 'object', required: ['amount'], properties: { amount: { type: 'number', exclusiveMinimum: 0 }, currency: { type: 'string', enum: ['UYU', 'USD'], default: 'UYU' }, description: { type: 'string' } } } },
  { name: 'create_expense', description: 'Registra un gasto personal en las finanzas del perfil', parameters: { type: 'object', required: ['amount', 'category', 'title'], properties: { amount: { type: 'number', exclusiveMinimum: 0 }, currency: { type: 'string', enum: ['UYU', 'USD'], default: 'UYU' }, category: { type: 'string', minLength: 1 }, title: { type: 'string', minLength: 1 }, date: { type: 'string' }, notes: { type: 'string' }, financeAccountId: { type: 'string' } } } },
]

@Injectable()
export class ToolRegistry {
  private readonly tools = new Map<string, ToolDefinition>()

  constructor(
    private readonly snapshot: GetFinancialSnapshotUseCase,
    private readonly capacity: GetSpendingCapacityUseCase,
    private readonly obligations: GetUpcomingObligationsUseCase,
    private readonly simulate: SimulatePurchaseUseCase,
    private readonly createExpense: CreateExpenseUseCase,
  ) { this.init() }

  private init() {
    this.register({ name: 'get_financial_snapshot', description: declarations[0]!.description, risk: 'read', inputSchema: snapshotSchema, execute: (_, c) => this.snapshot.execute(c.profileId) })
    this.register({ name: 'get_spending_capacity', description: declarations[1]!.description, risk: 'read', inputSchema: capacitySchema, execute: (a, c) => this.capacity.execute(c.profileId, a.window ?? 'today') })
    this.register({ name: 'get_upcoming_obligations', description: declarations[2]!.description, risk: 'read', inputSchema: obligationsSchema, execute: (a, c) => this.obligations.execute(c.profileId, a.window ?? 'restOfMonth') })
    this.register({ name: 'simulate_purchase', description: declarations[3]!.description, risk: 'read', inputSchema: simulateSchema, execute: (a, c) => this.simulate.execute(c.profileId, { amount: a.amount, currency: a.currency, description: a.description }) })
    // Write tools must use the pending action id as their durable idempotency key.
    this.register({ name: 'create_expense', description: declarations[4]!.description, risk: 'write', inputSchema: expenseSchema, execute: (a, c) => this.createExpense.execute({
      profileId: c.profileId, input: { ...a, date: a.date ?? new Date().toISOString() },
      context: { source: 'web', sourceMessageId: c.pendingId ?? c.sourceMessageId, inputMethod: 'MANUAL' },
    }) })
  }

  private register(tool: ToolDefinition) { this.tools.set(tool.name, tool) }
  get(name: string) { const tool = this.tools.get(name); if (!tool) throw new Error(`Tool no registrada: ${name}`); return tool }
  list() { return [...this.tools.values()] }
  has(name: string) { return this.tools.has(name) }
  listNames() { return [...this.tools.keys()] }
  getDeclarations() { return declarations.map(({ name, description, parameters }) => ({ name, description, parameters })) }
}
