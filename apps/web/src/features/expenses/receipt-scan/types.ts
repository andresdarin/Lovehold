export interface ScannedItem {
  name: string
  quantity: number | null
  unitPrice: number | null
  totalPrice: number
  category: string
}

export interface ScanReceiptResponse {
  merchant: string | null
  receiptDate: string | null
  currency: 'UYU' | 'USD'
  total: number | null
  subtotal: number | null
  discounts: number | null
  paymentMethod: string | null
  items: ScannedItem[]
  confidence: number
  warnings: string[]
}
