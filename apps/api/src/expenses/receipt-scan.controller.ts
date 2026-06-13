import { Controller, Post, UploadedFile, UseGuards, UseInterceptors, BadRequestException } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { AuthGuard } from '../common/guards/auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import type { AuthenticatedUser } from '../common/guards/auth.guard'
import { ReceiptScanService } from './receipt-scan.service'
import { PrismaService } from '../prisma/prisma.service'
import type { ScanReceiptResponse } from './receipt-scan.types'

interface UploadedImage {
  buffer: Buffer
  mimetype: string
}

@Controller('expenses')
@UseGuards(AuthGuard)
export class ReceiptScanController {
  constructor(
    private readonly receiptScanService: ReceiptScanService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('scan-receipt')
  @UseInterceptors(FileInterceptor('image'))
  async scanReceipt(
    @UploadedFile() file: UploadedImage | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ScanReceiptResponse> {
    if (!file) {
      throw new BadRequestException('No se envió ninguna imagen. Enviá el campo "image" con un archivo.')
    }

    const result = await this.receiptScanService.scan(file.buffer, file.mimetype)

    const profile = await this.prisma.profile.findUnique({
      where: { authUserId: user.authUserId },
    })

    if (profile) {
      await this.prisma.profile.update({
        where: { id: profile.id },
        data: { gamificationXp: { increment: 10 } },
      })
    }

    return result
  }
}
