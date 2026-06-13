import { Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator'

export const EXPENSE_ITEM_CATEGORIES = [
  'ALIMENTOS',
  'VERDURAS',
  'FRUTAS',
  'LACTEOS',
  'CARNES_FIAMBRES',
  'PANIFICADOS',
  'BEBIDAS',
  'ALCOHOL',
  'SNACKS_DULCES',
  'HIGIENE',
  'LIMPIEZA_HOGAR',
  'MASCOTAS',
  'OTROS',
] as const

export type ExpenseItemCategory = (typeof EXPENSE_ITEM_CATEGORIES)[number]

export class CreateExpenseItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name!: string

  @IsIn(EXPENSE_ITEM_CATEGORIES)
  itemCategory!: ExpenseItemCategory

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  quantity?: number

  @IsOptional()
  @IsString()
  @MaxLength(24)
  unit?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  unitPrice?: number

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  total!: number

  @IsOptional()
  @IsString()
  @MaxLength(240)
  rawText?: string
}

export class CreateExpenseDto {
  @IsOptional()
  @IsIn(['personal', 'household'])
  scope?: 'personal' | 'household'

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string

  @IsOptional()
  @IsString()
  @MaxLength(120)
  merchant?: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  category!: string

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number

  @IsDateString()
  date!: string

  @IsOptional()
  @IsDateString()
  receiptDate?: string

  @IsOptional()
  @IsString()
  @MaxLength(80)
  paymentMethod?: string

  @IsOptional()
  @IsIn(['EQUAL', 'equal'])
  splitType?: 'EQUAL' | 'equal'

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateExpenseItemDto)
  items?: CreateExpenseItemDto[]
}
