import { Body, Controller, Get, Param, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { AuthGuard, type AuthenticatedUser } from '../common/guards/auth.guard'
import { CreateExpenseDto } from './dto/create-expense.dto'
import { ListExpensesDto } from './dto/list-expenses.dto'
import { ExpensesService } from './expenses.service'

@Controller('expenses')
@UseGuards(AuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ValidationPipe({ transform: true })) query: ListExpensesDto,
  ) {
    return this.expensesService.findAll(user, query)
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.expensesService.findOne(user, id)
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expensesService.create(user, dto)
  }
}
