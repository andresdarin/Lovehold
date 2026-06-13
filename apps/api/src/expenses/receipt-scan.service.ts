import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from './receipt-scan.types'
import type { ScanReceiptResponse } from './receipt-scan.types'
import { validateAndNormalize } from './receipt-scan.utils'

const GEMINI_MODEL = 'gemini-3-flash'

const SYSTEM_PROMPT = `Analiza esta imagen de un ticket de supermercado de Uruguay.
Extrae los datos visibles y devuelve únicamente JSON válido.
No incluyas markdown, explicación ni texto fuera del JSON.

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

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY')
  }

  async scan(imageBuffer: Buffer, mimeType: string): Promise<ScanReceiptResponse> {
    if (!this.apiKey) {
      throw new ServiceUnavailableException('GEMINI_API_KEY no está configurada en el servidor.')
    }

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new BadRequestException(`Formato de imagen no soportado. Permitidos: ${ALLOWED_MIME_TYPES.join(', ')}`)
    }

    if (imageBuffer.length > MAX_FILE_SIZE) {
      throw new BadRequestException(`La imagen excede el tamaño máximo de ${MAX_FILE_SIZE / 1024 / 1024}MB.`)
    }

    const base64 = imageBuffer.toString('base64')

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${this.apiKey}`,
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
            maxOutputTokens: 4096,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error')
      throw new ServiceUnavailableException(`Gemini API error: ${response.status} — ${errorBody}`)
    }

    const geminiResponse = await response.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[]
    }

    const text = geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      throw new BadRequestException('Gemini no devolvió contenido en la respuesta.')
    }

    const cleaned = text
      .replace(/```(?:json)?\s*/gi, '')
      .replace(/```/g, '')
      .trim()

    let parsed: unknown
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      throw new BadRequestException(
        'Gemini devolvió JSON inválido. Revisá la calidad de la imagen e intentá de nuevo.',
      )
    }

    return validateAndNormalize(parsed)
  }
}
