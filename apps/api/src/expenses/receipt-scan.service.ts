import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from './receipt-scan.types'
import type { ScanReceiptResponse } from './receipt-scan.types'
import { parseGeminiResponse } from './receipt-scan.parser'
import { validateAndNormalize } from './receipt-scan.utils'

const SYSTEM_PROMPT = `Analiza esta imagen de un ticket de supermercado de Uruguay.
Extrae SOLO JSON válido. No incluyas markdown, explicación ni texto fuera del JSON.
Sé CONCISO: no repitas info, usá nombres cortos de producto.

Estructura:
{
  "merchant": string | null,
  "receiptDate": string | null,
  "currency": "UYU",
  "total": number | null,
  "subtotal": number | null,
  "discounts": number | null,
  "paymentMethod": string | null,
  "items": [
    {
      "name": string,
      "quantity": number | null,
      "unitPrice": number | null,
      "totalPrice": number,
      "category": "ALIMENTOS" | "VERDURAS" | "FRUTAS" | "LACTEOS" | "CARNES_FIAMBRES" | "PANIFICADOS" | "BEBIDAS" | "ALCOHOL" | "SNACKS_DULCES" | "HIGIENE" | "LIMPIEZA_HOGAR" | "MASCOTAS" | "OTROS"
    }
  ],
  "confidence": number,
  "warnings": string[]
}

Reglas:
- No inventes productos.
- Si no podés leer algo con confianza, usá null.
- Conservá el significado del nombre del producto pero normalizalo un poco.
- Detectá total final pagado.
- Detectá descuentos/promociones si aparecen.
- confidence debe ir de 0 a 1.
- warnings debe explicar inconsistencias o datos dudosos.
- Los precios uruguayos pueden usar coma como separador decimal.
- Las fechas pueden estar en formato DD/MM/YYYY.`

@Injectable()
export class ReceiptScanService {
  private readonly apiKey: string | undefined
  private readonly model: string

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY') || process.env.GEMINI_API_KEY
    this.model = this.configService.get<string>('GEMINI_API_MODEL') || process.env.GEMINI_API_MODEL || 'gemini-2.5-flash'
  }

  async scan(imageBuffer: Buffer, mimeType: string): Promise<ScanReceiptResponse> {
    if (!this.apiKey) {
      throw new ServiceUnavailableException(
        'GEMINI_API_KEY no está configurada. Agregala en apps/api/.env o en las variables de entorno del servidor.',
      )
    }

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new BadRequestException(`Formato de imagen no soportado. Permitidos: ${ALLOWED_MIME_TYPES.join(', ')}`)
    }

    if (imageBuffer.length > MAX_FILE_SIZE) {
      throw new BadRequestException(`La imagen excede el tamaño máximo de ${MAX_FILE_SIZE / 1024 / 1024}MB.`)
    }

    const base64 = imageBuffer.toString('base64')

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: SYSTEM_PROMPT },
                { inlineData: { mimeType, data: base64 } },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 16384,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error')
      throw new ServiceUnavailableException(`Gemini API error: ${response.status} — ${errorBody}`)
    }

    const geminiResponse = await response.json() as {
      candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[]
    }

    const finishReason = geminiResponse?.candidates?.[0]?.finishReason
    if (finishReason && finishReason !== 'STOP') {
      console.error(`[ReceiptScan] Gemini finishReason: ${finishReason} — response may be incomplete.`)
    }

    const text = geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      throw new BadRequestException('Gemini no devolvió contenido en la respuesta.')
    }

    const parsed = parseGeminiResponse(text)
    if (!parsed) {
      const snippet = text.length > 500 ? text.slice(0, 500) + '…' : text
      throw new BadRequestException(
        `Gemini devolvió una respuesta que no pudo interpretarse como JSON. Respuesta: ${snippet}`,
      )
    }

    return validateAndNormalize(parsed)
  }
}
