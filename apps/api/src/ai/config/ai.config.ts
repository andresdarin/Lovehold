import { ConfigService } from '@nestjs/config'
import { z } from 'zod'

const aiConfigSchema = z.object({
  GEMINI_API_KEY: z.preprocess((value) => value === '' ? undefined : value, z.string().min(1).optional()),
  GEMINI_API_MODEL: z.string().min(1).default('gemini-2.5-flash'),
  GEMINI_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.1),
  GEMINI_MAX_OUTPUT_TOKENS: z.coerce.number().int().positive().default(2048),
  GEMINI_TIMEOUT_MS: z.coerce.number().int().positive().default(20000),
})

export type AiConfig = z.infer<typeof aiConfigSchema>

export const aiConfigProvider = {
  provide: 'AI_CONFIG',
  inject: [ConfigService],
  useFactory: (config: ConfigService): AiConfig =>
    aiConfigSchema.parse({
      GEMINI_API_KEY: config.get<string>('GEMINI_API_KEY'),
      GEMINI_API_MODEL: config.get<string>('GEMINI_API_MODEL'),
      GEMINI_TEMPERATURE: config.get<string>('GEMINI_TEMPERATURE'),
      GEMINI_MAX_OUTPUT_TOKENS: config.get<string>('GEMINI_MAX_OUTPUT_TOKENS'),
      GEMINI_TIMEOUT_MS: config.get<string>('GEMINI_TIMEOUT_MS'),
    }),
}
