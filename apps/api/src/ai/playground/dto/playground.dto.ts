import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength, ValidateNested, MinLength } from 'class-validator'
import { Type } from 'class-transformer'

export enum PlaygroundMode { SANDBOX = 'sandbox', REAL_READONLY = 'real_readonly' }
export enum PlaygroundEnvironment { DEV = 'DEV', TEST = 'TEST', PROD = 'PROD' }

export class ToolOverrideDto {
  @IsString() @IsNotEmpty() toolName!: string
  @IsBoolean() enabled!: boolean
}

export class PlaygroundRequestDto {
  @IsString() @IsNotEmpty() @MinLength(1) @MaxLength(2000) message!: string
  @IsEnum(PlaygroundMode) mode!: PlaygroundMode
  @IsOptional() @IsString() conversationId?: string
  @IsOptional() @IsString() promptVersionId?: string
  @IsOptional() @IsString() modelConfigId?: string
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ToolOverrideDto) toolOverrides?: ToolOverrideDto[]
  @IsOptional() @IsEnum(PlaygroundEnvironment) environment?: PlaygroundEnvironment
  /** Ephemeral client-provided history; it is never written to the conversation tables. */
  @IsOptional() @IsArray() @IsObject({ each: true }) history?: Array<{ role: 'user' | 'model'; parts: Array<{ text?: string }> }>
}

export interface PlaygroundToolCall { name: string; args: unknown; success: boolean; durationMs: number; error?: string; result?: unknown }
export class PlaygroundResponseDto {
  text!: string
  toolCalls!: PlaygroundToolCall[]
  model!: string
  promptKey!: string
  promptVersion!: number
  deploymentId?: string
  configUsed!: unknown
  latencyMs!: number
  error?: string
}
