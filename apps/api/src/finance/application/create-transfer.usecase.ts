import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { createTransferSchema, type CreateTransferInput } from './dto/schemas'

@Injectable()
export class CreateTransferUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: { profileId: string; input: CreateTransferInput }) {
    const input = createTransferSchema.parse(command.input)
    if (input.sourceAccountId === input.destinationAccountId) {
      throw new BadRequestException('La cuenta de origen y destino deben ser distintas.')
    }

    const profile = await this.prisma.profile.findUnique({
      where: { id: command.profileId },
      select: { timeZone: true },
    })
    const timeZone = profile?.timeZone ?? 'America/Montevideo'
    const date = new Date(input.date)
    const monthKey = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit' }).format(date)

    return this.prisma.$transaction(async (tx) => {
      const sourceAccount = await tx.financeAccount.findFirst({
        where: { id: input.sourceAccountId, profileId: command.profileId },
      })
      const destAccount = await tx.financeAccount.findFirst({
        where: { id: input.destinationAccountId, profileId: command.profileId },
      })

      if (!sourceAccount) throw new NotFoundException('Cuenta de origen no encontrada.')
      if (!destAccount) throw new NotFoundException('Cuenta de destino no encontrada.')

      // 1. Descontar de la cuenta de origen (ej. Banco)
      await tx.financeAccount.update({
        where: { id: sourceAccount.id },
        data: { balance: { decrement: input.amount } },
      })

      // 2. Si la cuenta destino es Tarjeta de Crédito, el pago reduce la deuda
      if (destAccount.type === 'CREDIT') {
        await tx.financeAccount.update({
          where: { id: destAccount.id },
          data: { balance: { decrement: input.amount } },
        })
      } else {
        // Si es cuenta bancaria o efectivo, aumenta los fondos disponibles
        await tx.financeAccount.update({
          where: { id: destAccount.id },
          data: { balance: { increment: input.amount } },
        })
      }

      // 3. Registrar el movimiento de transferencia (neutral frente a gastos e ingresos)
      const transferTitle =
        input.description?.trim() ||
        (destAccount.type === 'CREDIT'
          ? `Pago de tarjeta ${destAccount.name}`
          : `Transferencia a ${destAccount.name}`)

      const transfer = await tx.personalExpense.create({
        data: {
          profileId: command.profileId,
          title: transferTitle,
          amount: input.amount,
          currency: input.currency,
          date,
          type: 'variable',
          movementType: 'TRANSFER',
          inputMethod: 'MANUAL',
          category: 'TRANSFERENCIA',
          notes: input.description?.trim() || null,
          monthKey,
          financeAccountId: sourceAccount.id,
          destinationAccountId: destAccount.id,
        },
      })

      return {
        ...transfer,
        amount: Number(transfer.amount),
        sourceAccount: { id: sourceAccount.id, name: sourceAccount.name, type: sourceAccount.type },
        destinationAccount: { id: destAccount.id, name: destAccount.name, type: destAccount.type },
      }
    })
  }
}
