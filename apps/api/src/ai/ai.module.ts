import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { aiConfigProvider } from './config/ai.config'
import { GeminiClient } from './client/gemini.client'
import { PromptRegistry } from './prompts/prompt.registry'

@Module({
  imports: [ConfigModule],
  providers: [aiConfigProvider, GeminiClient, PromptRegistry],
  exports: [GeminiClient, PromptRegistry],
})
export class AiModule {}
