import { Type } from 'class-transformer'
import { IsIn, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator'

export class ListExpensesDto {
  @IsOptional()
  @IsString()
  month?: string

  @IsOptional()
  @IsString()
  q?: string

  @IsOptional()
  @IsString()
  category?: string

  @IsOptional()
  @IsIn(['fixed', 'variable', 'supermarket', 'subscription', 'debt', 'other'])
  kind?: string

  @IsOptional()
  @IsIn(['personal', 'household'])
  scope?: string

  @IsOptional()
  @IsString()
  paymentMethod?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(200)
  limit?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number
}

export class ExpenseDetailResponse {
  id!: string
  title!: string
  merchant!: string | null
  date!: string
  category!: string
  kind!: string
  scope!: string
  splitStatus!: string
  total!: number
  currency!: string
  paymentMethod!: string | null
  itemsCount!: number
  itemsTotal!: number
  discounts!: number | null
  notes!: string | null
  isRecurring!: boolean
  recurringLabel!: string | null
  items!: {
    id: string
    name: string
    category: string
    quantity: number | null
    unit: string | null
    unitPrice: number | null
    totalPrice: number
  }[]
  createdAt!: string
}

export class MonthSummary {
  month!: string
  totalSpent!: number
  fixedTotal!: number
  variableTotal!: number
  supermarketTotal!: number
  householdTotal!: number
  personalTotal!: number
  itemsCount!: number
}

export class PaginationInfo {
  limit!: number
  offset!: number
  hasMore!: boolean
}

export class ExpenseListResponse {
  items!: ExpenseDetailResponse[]
  summary!: MonthSummary
  pagination!: PaginationInfo
}
