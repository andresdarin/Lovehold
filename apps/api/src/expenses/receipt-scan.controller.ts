import { Controller, Post, UploadedFile, UseGuards, UseInterceptors, BadRequestException } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { AuthGuard } from '../common/guards/auth.guard'
import { ReceiptScanService } from './receipt-scan.service'
import type { ScanReceiptResponse } from './receipt-scan.types'

interface UploadedImage {
  buffer: Buffer
  mimetype: string
}

@Controller('expenses')
@UseGuards(AuthGuard)
export class ReceiptScanController {
  constructor(private readonly receiptScanService: ReceiptScanService) {}

  @Post('scan-receipt')
  @UseInterceptors(FileInterceptor('image'))
  async scanReceipt(@UploadedFile() file: UploadedImage | undefined): Promise<ScanReceiptResponse> {
    if (!file) {
      throw new BadRequestException('No se envió ninguna imagen. Enviá el campo "image" con un archivo.')
    }

    return this.receiptScanService.scan(file.buffer, file.mimetype)
  }
}
