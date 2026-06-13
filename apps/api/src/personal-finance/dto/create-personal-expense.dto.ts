import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator'

export const PERSONAL_EXPENSE_TYPES = ['fixed', 'variable', 'supermarket'] as const
export type PersonalExpenseType = (typeof PERSONAL_EXPENSE_TYPES)[number]

export class CreatePersonalExpenseItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name!: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  category!: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  quantity?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  unitPrice?: number

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  totalPrice!: number

  @IsOptional()
  @IsString()
  @MaxLength(500)
  rawLine?: string
}

export class CreatePersonalExpenseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string

  @IsOptional()
  @IsString()
  @MaxLength(120)
  merchant?: string

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number

  @IsDateString()
  date!: string

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  type!: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  category!: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(31)
  recurrenceDay?: number

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePersonalExpenseItemDto)
  items?: CreatePersonalExpenseItemDto[]
}
