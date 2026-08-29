import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { aiConfigProvider } from './config/ai.config'
import { GeminiClient } from './client/gemini.client'
import { PromptRegistry } from './prompts/prompt.registry'
import { FinanceModule } from '../finance/finance.module'
import { ToolExecutor, ToolRegistry } from './tools'
import { AiChatController } from './chat/ai-chat.controller'
import { AiChatService } from './chat/ai-chat.service'
import { PrismaModule } from '../prisma/prisma.module'
import { AiController } from './ai.controller'
import { AgentOrchestrator } from './agent/agent.orchestrator'
import { AiContextService } from './context/ai-context.service'
import { AiConversationService } from './conversation/ai-conversation.service'
import { AiPendingActionService } from './pending/ai-pending-action.service'
import { AiObservabilityService } from './observability/ai-observability.service'

@Module({
  imports: [ConfigModule, FinanceModule, PrismaModule],
  controllers: [AiChatController, AiController],
  providers: [aiConfigProvider, GeminiClient, PromptRegistry, ToolRegistry, ToolExecutor, AiChatService, AiContextService, AiConversationService, AiPendingActionService, AiObservabilityService, AgentOrchestrator],
  exports: [GeminiClient, PromptRegistry, ToolRegistry, ToolExecutor, AiChatService, AiContextService, AiConversationService, AiPendingActionService, AiObservabilityService, AgentOrchestrator],
})
export class AiModule {}
