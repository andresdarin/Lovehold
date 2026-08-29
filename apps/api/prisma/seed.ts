/**
 * Finnic bootstrap (idempotente): ejecutá `pnpm prisma db seed` desde apps/api.
 * Solo crea registros faltantes; nunca actualiza ni elimina configuraciones existentes.
 * Requiere DATABASE_URL y deja un deployment activo para DEV, TEST y PROD.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { FINNIC_SYSTEM_PROMPT_V1 } from '../src/ai/prompts/finnic.prompt'

const environments = ['DEV', 'TEST', 'PROD']
const tools = [
  { name: 'get_financial_snapshot', requireConfirmation: false },
  { name: 'get_spending_capacity', requireConfirmation: false },
  { name: 'get_upcoming_obligations', requireConfirmation: false },
  { name: 'simulate_purchase', requireConfirmation: false },
  { name: 'create_expense', requireConfirmation: true },
]

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })
  const db = prisma as any

  try {
    const agent = await db.aiAgent.upsert({
      where: { slug: 'finnic' },
      update: {},
      create: { slug: 'finnic', name: 'Finnic', description: 'Asistente financiero personal de Lovehold' },
    })

    const prompt = await db.aiPrompt.upsert({
      where: { agentId_key: { agentId: agent.id, key: 'finnic-system' } },
      update: {},
      create: { agentId: agent.id, key: 'finnic-system', description: 'Prompt del sistema de Finnic' },
    })
    const existingVersion = await db.aiPromptVersion.findFirst({ where: { promptId: prompt.id } })
    const promptVersion = existingVersion ?? await db.aiPromptVersion.create({
      data: { promptId: prompt.id, version: 1, content: FINNIC_SYSTEM_PROMPT_V1, status: 'published' },
    })
    const publishedPrompt = promptVersion.status === 'published'
      ? promptVersion
      : await db.aiPromptVersion.findFirst({ where: { promptId: prompt.id, status: 'published' } })

    const modelConfig = await db.aiModelConfig.findFirst({ where: { agentId: agent.id, status: 'active' } })
      ?? await db.aiModelConfig.create({
        data: { agentId: agent.id, model: 'gemini-2.5-flash', temperature: 0.7, maxTokens: 2048, status: 'active' },
      })

    for (const tool of tools) {
      const exists = await db.aiToolConfig.findFirst({ where: { agentId: agent.id, toolName: tool.name } })
      if (!exists) {
        await db.aiToolConfig.create({
          data: { agentId: agent.id, toolName: tool.name, enabled: true, requireConfirmation: tool.requireConfirmation, status: 'active' },
        })
      }
    }

    if (publishedPrompt) {
      for (const environment of environments) {
        const deployment = await db.aiDeployment.findFirst({ where: { agentId: agent.id, environment, isActive: true } })
        if (!deployment) {
          await db.aiDeployment.create({
            data: { agentId: agent.id, environment, isActive: true, promptVersionId: publishedPrompt.id, modelConfigId: modelConfig.id },
          })
        }
      }
    }
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
