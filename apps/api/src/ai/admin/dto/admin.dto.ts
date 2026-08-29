import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator'

export enum AdminEnvironment { DEV = 'DEV', TEST = 'TEST', PROD = 'PROD' }
export class AgentDto { id!: string; slug!: string; name!: string; description?: string }
export class PromptDto { id!: string; agentId!: string; key!: string; description?: string }
export class PromptVersionDto { id!: string; promptId!: string; version!: number; content!: string; status!: 'draft' | 'published' | 'archived' }
export class ModelConfigDto { id!: string; agentId!: string; model!: string; temperature!: number; maxTokens!: number; status!: string }
export class ToolConfigDto { id!: string; agentId!: string; toolName!: string; enabled!: boolean; requireConfirmation!: boolean; maxAttempts!: number }
export class DeploymentDto { id!: string; agentId!: string; environment!: AdminEnvironment; promptVersionId?: string; modelConfigId?: string; isActive!: boolean }

export class CreateAgentDto { @IsString() name!: string; @IsString() slug!: string; @IsOptional() @IsString() description?: string }
export class UpdateAgentDto { @IsOptional() @IsString() name?: string; @IsOptional() @IsString() description?: string }
export class CreatePromptDto { @IsString() key!: string; @IsOptional() @IsString() description?: string }
export class CreatePromptVersionDto { @IsString() content!: string }
export class PublishDto { @IsOptional() @IsBoolean() confirm?: boolean }
export class CreateModelConfigDto { @IsString() model!: string; @IsOptional() @IsNumber() @Min(0) @Max(2) temperature?: number; @IsOptional() @IsInt() @Min(1) maxTokens?: number }
export class UpdateToolConfigDto { @IsOptional() @IsBoolean() enabled?: boolean; @IsOptional() @IsBoolean() requireConfirmation?: boolean; @IsOptional() @IsInt() @Min(1) maxAttempts?: number }
export class DeployDto { @IsString() agentId!: string; @IsEnum(AdminEnvironment) environment!: AdminEnvironment; @IsOptional() @IsString() promptVersionId?: string; @IsOptional() @IsString() modelConfigId?: string }
