'use client'

import { useProfile } from '@/components/auth/ProfileProvider'
import ExpenseItemList from '@/components/expenses/ExpenseItemList'
import NewExpenseFormGrid from '@/components/expenses/NewExpenseFormGrid'
import NewExpenseHeader from '@/components/expenses/NewExpenseHeader'
import ReceiptScanSection from '@/components/expenses/receipt-scan/ReceiptScanSection'
import { useExpenseForm } from '@/components/expenses/hooks'
import { useReceiptScan } from '@/components/expenses/receipt-scan/hooks'
import { scanResultToFormItems } from '@/components/expenses/receipt-scan/utils'
import { makeItem, SAMPLE_ITEMS } from '@/components/expenses/constants'

export default function NewExpensePage() {
  const { profile } = useProfile()
  const profileName = profile?.displayName || profile?.email || 'Tu perfil'
  const form = useExpenseForm(profileName)
  const scan = useReceiptScan()

  function loadTataExample() {
    const items = SAMPLE_ITEMS.map((item, i) => makeItem({ ...item, localId: `tata-${i}`, quantity: '', unit: '', unitPrice: '' }))
    form.loadExample({
      form: { title: 'Compra Tata', merchant: 'Tata', category: 'Compras de súper', amount: '1042.01', date: '2026-06-09', paymentMethod: 'Débito VISA', notes: '' },
      items,
    })
  }

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

      <NewExpenseFormGrid form={form} profileName={profileName} />

      <ExpenseItemList
        items={form.items}
        onAddItem={form.addItem}
        onRemoveItem={form.removeItem}
        onUpdateItem={form.updateItem}
        onLoadExample={loadTataExample}
      />
    </form>
  )
}
