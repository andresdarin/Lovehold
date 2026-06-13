import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { AuthGuard, type AuthenticatedUser } from '../common/guards/auth.guard'
import { PersonalFinanceService } from './personal-finance.service'
import { CreatePersonalExpenseDto } from './dto/create-personal-expense.dto'

function defaultMonthKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

@Controller('personal-finance')
@UseGuards(AuthGuard)
export class PersonalFinanceController {
  constructor(private readonly service: PersonalFinanceService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('monthKey') monthKey?: string,
  ) {
    return this.service.findByMonth(user, monthKey ?? defaultMonthKey())
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePersonalExpenseDto,
  ) {
    return this.service.create(user, dto)
  }

  @Get('summary')
  getSummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query('monthKey') monthKey?: string,
  ) {
    return this.service.getSummary(user, monthKey ?? defaultMonthKey())
  }

  @Get('ranking')
  getProductRanking(
    @CurrentUser() user: AuthenticatedUser,
    @Query('monthKey') monthKey?: string,
  ) {
    return this.service.getProductRanking(user, monthKey ?? defaultMonthKey())
  }
}
