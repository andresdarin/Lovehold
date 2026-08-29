export const RECEIPT_SCAN_PROMPT_ID = 'receipt-scan:v1'

export const RECEIPT_SCAN_PROMPT_V1 = `Analiza esta imagen de un ticket de supermercado de Uruguay.
Extrae SOLO JSON válido. No incluyas markdown, explicación ni texto fuera del JSON.
Sé CONCISO: no repitas info, usá nombres cortos de producto.

Estructura:
{
  "merchant": string | null,
  "receiptDate": string | null,
  "currency": "UYU" | "USD",
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
- Detectá la moneda del ticket ("UYU" o "USD"). Si es en dólares, usá "USD". Si no se indica explícitamente o es en pesos, usá "UYU".
- Detectá descuentos/promociones si aparecen.
- confidence debe ir de 0 a 1.
- warnings debe listar solo problemas de lectura/OCR o datos dudosos.
- No valides aritmética de subtotal, descuentos, IVA o impuestos; el servidor lo recalcula.
- Si aparecen "Descuento" y "Total Descuentos", no los sumes dos veces.
- Los precios uruguayos pueden usar coma como separador decimal.
- Las fechas pueden estar en formato DD/MM/YYYY.`

export const RECEIPT_SCAN_GENERATION_CONFIG = {
  temperature: 0.1,
  maxOutputTokens: 2048,
  responseMimeType: 'application/json',
}
