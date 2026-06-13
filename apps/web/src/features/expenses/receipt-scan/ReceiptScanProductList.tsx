'use client'

import { money } from '../constants'
import type { ScannedItem } from './types'

function formatQuantity(value: number): string {
  return Number.isInteger(value) ? value.toString() : value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')
}

function quantityParts(item: ScannedItem): { units: string; detail?: string } {
  if (item.quantity === null) return { units: '1 unidad' }
  if (!Number.isInteger(item.quantity)) return { units: '1 unidad', detail: `${formatQuantity(item.quantity)} kg` }
  return { units: `${item.quantity} ${item.quantity === 1 ? 'unidad' : 'unidades'}` }
}

export default function ReceiptScanProductList({ items }: { items: ScannedItem[] }) {
  return (
    <section className="mt-6" aria-labelledby="scan-products-title">
      <div className="flex items-end justify-between gap-4">
        <h3 id="scan-products-title" className="text-sm font-bold text-foreground">Productos detectados</h3>
        <span className="text-xs font-medium text-muted-foreground">{items.length} total</span>
      </div>

      <div className="scrollbar-salmon mt-4 max-h-80 overflow-y-auto border-y border-border/70 pr-2">
        <div className="grid grid-cols-[minmax(0,1fr)_88px_88px] gap-4 border-b border-border/70 py-2 text-xs font-bold text-muted-foreground">
          <span>Producto</span>
          <span className="text-right">Unidades</span>
          <span className="text-right">Total</span>
        </div>
        {items.map((item, index) => {
          const quantity = quantityParts(item)
          return (
            <div key={`${item.name}-${index}`} className="grid grid-cols-[minmax(0,1fr)_88px_88px] items-center gap-4 border-b border-border/50 py-3 last:border-b-0">
              <span className="min-w-0 truncate text-sm font-medium text-foreground">{item.name}</span>
              <span className="text-right text-sm text-muted-foreground">
                <span className="block">{quantity.units}</span>
                {quantity.detail && <span className="block text-xs">{quantity.detail}</span>}
              </span>
              <span className="text-right text-sm font-bold text-foreground">{money(item.totalPrice)}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
