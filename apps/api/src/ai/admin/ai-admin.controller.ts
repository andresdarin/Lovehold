import { Body, Controller, Get, Logger, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '../../common/guards/auth.guard'
import { AdminGuard } from '../../common/guards/admin.guard'
import { AiAdminService } from './ai-admin.service'
import { CreateModelConfigDto, CreatePromptVersionDto, DeployDto, UpdateAgentDto, UpdateToolConfigDto } from './dto/admin.dto'

@Controller('ai/admin')
@UseGuards(AuthGuard, AdminGuard)
export class AiAdminController {
  private readonly logger = new Logger(AiAdminController.name)
  constructor(private readonly service: AiAdminService) {}
  private audit(action: string, id?: string) { this.logger.log(`admin action=${action}${id ? ` id=${id}` : ''}`) }

  @Get('config/:agentSlug/:env') config(@Param('agentSlug') slug: string, @Param('env') env: string) { this.audit('config.read', slug); return this.service.getEffectiveConfig(slug, env) }
  @Get('agents') agents() { return this.service.listAgents() }
  @Patch('agents/:id') updateAgent(@Param('id') id: string, @Body() dto: UpdateAgentDto) { this.audit('agent.update', id); return this.service.updateAgent(id, dto) }
  @Get('prompts') prompts(@Query('agentId') agentId: string) { return this.service.listPrompts(agentId) }
  @Get('prompts/:id/versions') versions(@Param('id') id: string) { return this.service.listPromptVersions(id) }
  @Post('prompts/:id/versions') draft(@Param('id') id: string, @Body() dto: CreatePromptVersionDto) { this.audit('prompt.draft', id); return this.service.createDraft(id, dto.content) }
  @Post('prompt-versions/:id/publish') publish(@Param('id') id: string) { this.audit('prompt.publish', id); return this.service.publishVersion(id) }
  @Get('model-configs') models(@Query('agentId') agentId?: string) { return this.service.listModelConfigs(agentId) }
  @Post('model-configs') model(@Query('agentId') agentId: string, @Body() dto: CreateModelConfigDto) { this.audit('model.create', agentId); return this.service.createModelConfig(agentId, dto) }
  @Patch('tool-configs/:id') tool(@Param('id') id: string, @Body() dto: UpdateToolConfigDto) { this.audit('tool.update', id); return this.service.updateToolConfig(id, dto) }
  @Get('deployments') deployments(@Query('agentId') agentId: string, @Query('environment') env: string) { return this.service.listDeployments(agentId, env) }
  @Post('deployments') deploy(@Body() dto: DeployDto) { this.audit('deployment.create', dto.agentId); return this.service.deploy(dto) }
  @Post('deployments/:id/promote') promote(@Param('id') id: string) { this.audit('deployment.promote', id); return this.service.promote(id) }
  @Post('deployments/:id/rollback') rollback(@Param('id') id: string) { this.audit('deployment.rollback', id); return this.service.rollback(id) }
  @Get('runs') runs(@Query('profileId') profileId?: string) { return this.service.getRuns(profileId) }
  @Get('runs/:id/tool-calls') calls(@Param('id') id: string) { return this.service.getToolCalls(id) }
}
