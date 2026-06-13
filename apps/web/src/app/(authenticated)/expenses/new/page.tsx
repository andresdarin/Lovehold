'use client'

import Link from 'next/link'
import { ArrowLeft, ReceiptText } from 'lucide-react'
import { useProfile } from '@/components/auth/ProfileProvider'
import ExpenseFormFields from '@/components/expenses/ExpenseFormFields'
import ExpenseItemList from '@/components/expenses/ExpenseItemList'
import ExpenseSummary from '@/components/expenses/ExpenseSummary'
import ReceiptScanUploader from '@/components/expenses/receipt-scan/ReceiptScanUploader'
import ReceiptScanResultWarning from '@/components/expenses/receipt-scan/ReceiptScanResultWarning'
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
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/expenses"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-surface text-muted-foreground transition hover:bg-surface-soft hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="Volver a movimientos">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
            <ReceiptText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Nuevo gasto</h1>
            <p className="text-sm text-muted-foreground">Cargá un gasto compartido. Podés escanear un ticket o cargarlo manualmente.</p>
          </div>
        </div>
      </header>

      <ReceiptScanUploader
        preview={scan.preview}
        scanning={scan.scanning}
        onFileSelect={scan.selectFile}
        onScan={scan.submitScan}
        onClear={scan.clear}
      />

      {scan.error && (
        <div className="rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
          {scan.error}
        </div>
      )}

      {scan.result && !scan.scanning && (
        <div className="space-y-4">
          <ReceiptScanResultWarning
            confidence={scan.result.confidence}
            warnings={scan.result.warnings}
            onClear={scan.clear}
          />
          <button type="button" onClick={applyScan}
            className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
            Aplicar datos del escaneo
          </button>
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <ExpenseFormFields form={form.form} profileName={profileName} onUpdate={form.updateForm} />
        <ExpenseSummary
          itemsTotal={form.itemsTotal}
          declaredTotal={form.declaredTotal}
          difference={form.difference}
          hasBlockingDifference={form.hasBlockingDifference}
          isSupermarketExpense={form.isSupermarketExpense}
          itemsCount={form.items.length}
          canSubmit={form.canSubmit}
          isSubmitting={form.isSubmitting}
          error={form.error}
          success={form.success}
          onUseItemsTotal={form.useItemsTotalAsAmount}
          onSubmit={form.handleSubmit}
        />
      </section>

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
