import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class ChatRequestDto {
  @IsOptional()
  @IsString()
  conversationId?: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message!: string

  @IsOptional()
  @IsString()
  pendingActionId?: string
}

export class ChatResponseDto {
  text!: string
  conversationId!: string
  pendingActionId?: string
  pendingActionDescription?: string
  toolCalls?: Array<{ name: string; args: unknown; success: boolean }>
}
