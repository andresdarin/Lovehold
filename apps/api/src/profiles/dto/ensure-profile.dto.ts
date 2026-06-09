import { IsOptional, IsString } from 'class-validator'

export class EnsureProfileDto {
  @IsOptional()
  @IsString()
  displayName?: string

  @IsOptional()
  @IsString()
  avatarUrl?: string

  @IsOptional()
  @IsString()
  color?: string
}
