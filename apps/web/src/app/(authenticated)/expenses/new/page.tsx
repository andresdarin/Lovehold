'use client'

import { useProfile } from '@/features/auth/ProfileProvider'
import ExpenseItemList from '@/features/expenses/ExpenseItemList'
import NewExpenseFormGrid from '@/features/expenses/NewExpenseFormGrid'
import NewExpenseHeader from '@/features/expenses/NewExpenseHeader'
import ReceiptScanSection from '@/features/expenses/receipt-scan/ReceiptScanSection'
import { useExpenseForm } from '@/features/expenses/hooks'
import { useReceiptScan } from '@/features/expenses/receipt-scan/hooks'
import { scanResultToFormItems } from '@/features/expenses/receipt-scan/utils'

export default function NewExpensePage() {
  const { profile } = useProfile()
  const profileName = profile?.displayName || profile?.email || 'Tu perfil'
  const form = useExpenseForm(profileName)
  const scan = useReceiptScan()

  function applyScan() {
    if (!scan.result) return
    const formItems = scanResultToFormItems(scan.result)
    const warningsText = scan.result.warnings.length > 0 ? `Advertencias del scan:\n${scan.result.warnings.join('\n')}` : ''
    form.populateFromScan({
      merchant: scan.result.merchant ?? undefined,
      receiptDate: scan.result.receiptDate ?? undefined,
      total: scan.result.total ?? undefined,
      paymentMethod: scan.result.paymentMethod ?? undefined,
      notes: warningsText,
      items: formItems,
    })
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }} className="space-y-6">
      <NewExpenseHeader />

      <ReceiptScanSection
        preview={scan.preview}
        scanning={scan.scanning}
        error={scan.error}
        result={scan.result}
        onFileSelect={scan.selectFile}
        onScan={scan.submitScan}
        onClear={scan.clear}
        onApply={applyScan}
      />

      <NewExpenseFormGrid form={form} profileName={profileName} discounts={scan.result?.discounts ?? 0}>
        <ExpenseItemList
          items={form.items}
          onAddItem={form.addItem}
          onRemoveItem={form.removeItem}
          onClearItems={form.clearItems}
          onUpdateItem={form.updateItem}
          onUseItemsTotal={form.useItemsTotalAsAmount}
        />
      </NewExpenseFormGrid>
    </form>
  )
}
