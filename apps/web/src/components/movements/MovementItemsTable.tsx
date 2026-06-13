'use client'

import { money } from '../expenses/constants'
import type { MovementItem } from './types'

interface Props {
  items: MovementItem[]
}

export default function MovementItemsTable({ items }: Props) {
  if (items.length === 0) return null

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-xs font-bold text-muted-foreground">
            <th className="px-2 py-2.5 text-left">Producto</th>
            <th className="px-2 py-2.5 text-left">Cant.</th>
            <th className="px-2 py-2.5 text-left">P. unit.</th>
            <th className="px-2 py-2.5 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/70">
          {items.map((item) => (
            <tr key={item.id} className="text-foreground">
              <td className="px-2 py-2.5">
                <p className="font-medium">{item.name}</p>
                {item.category && <p className="text-[11px] text-muted-foreground">{item.category}</p>}
              </td>
              <td className="px-2 py-2.5 text-muted-foreground">
                {item.quantity != null ? `${item.quantity}${item.unit ? ` ${item.unit}` : ''}` : '-'}
              </td>
              <td className="px-2 py-2.5 text-muted-foreground">
                {item.unitPrice != null ? money(item.unitPrice) : '-'}
              </td>
              <td className="px-2 py-2.5 text-right font-semibold">{money(item.totalPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
