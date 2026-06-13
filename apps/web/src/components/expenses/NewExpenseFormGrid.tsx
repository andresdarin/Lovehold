'use client'

import ExpenseFormFields from './ExpenseFormFields'
import ExpenseSummary from './ExpenseSummary'
import type { useExpenseForm } from './hooks'

type ExpenseFormState = ReturnType<typeof useExpenseForm>

export default function NewExpenseFormGrid({
  form, profileName,
}: {
  form: ExpenseFormState
  profileName: string
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1fr_400px]">
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
  )
}
