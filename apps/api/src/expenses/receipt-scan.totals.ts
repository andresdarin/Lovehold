interface ReconcileReceiptTotalsInput {
  itemCount: number
  itemsTotal: number
  total: number | null
  subtotal: number | null
  discounts: number | null
  warnings: string[]
}

interface ReconciledReceiptTotals {
  subtotal: number | null
  discounts: number | null
}

const MONEY_TOLERANCE = 0.05

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

export function reconcileReceiptTotals(input: ReconcileReceiptTotalsInput): ReconciledReceiptTotals {
  let { subtotal, discounts } = input
  if (input.itemCount === 0 || input.total === null) return { subtotal, discounts }

  const diff = roundMoney(input.itemsTotal - input.total)
  if (diff > MONEY_TOLERANCE) {
    if (subtotal === null) subtotal = roundMoney(input.itemsTotal)

    if (discounts !== null && Math.abs(discounts - diff) > MONEY_TOLERANCE) {
      input.warnings.push(
        `El descuento informado ($${discounts.toFixed(2)}) no coincide con la diferencia entre ítems y total ($${diff.toFixed(2)}); se ajustó a $${diff.toFixed(2)}.`,
      )
    }
    discounts = diff
  } else if (diff < -MONEY_TOLERANCE) {
    input.warnings.push(
      `La suma de los ítems ($${input.itemsTotal.toFixed(2)}) es menor que el total declarado ($${input.total.toFixed(2)}). Revisá los precios unitarios.`,
    )
  }

  return { subtotal, discounts }
}
