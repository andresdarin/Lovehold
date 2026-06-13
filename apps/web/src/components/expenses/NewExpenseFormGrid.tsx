'use client'

import type { ReactNode } from 'react'
import ExpenseFormFields from './ExpenseFormFields'
import ExpenseSummary from './ExpenseSummary'
import type { useExpenseForm } from './hooks'

type ExpenseFormState = ReturnType<typeof useExpenseForm>

export default function NewExpenseFormGrid({
  form, profileName, discounts, children,
}: {
  form: ExpenseFormState
  profileName: string
  discounts: number
  children: ReactNode
}) {
  return (
    <section className="grid items-start gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <ExpenseSummary
        itemsTotal={form.itemsTotal}
        declaredTotal={form.declaredTotal}
        discounts={discounts}
        difference={form.difference}
        hasBlockingDifference={form.hasBlockingDifference}
        isSupermarketExpense={form.isSupermarketExpense}
        itemsCount={form.items.length}
        canSubmit={form.canSubmit}
        isSubmitting={form.isSubmitting}
        error={form.error}
        success={form.success}
        onSubmit={form.handleSubmit}
      />
      <div className="space-y-6">
        <ExpenseFormFields form={form.form} profileName={profileName} onUpdate={form.updateForm} />
        {children}
      </div>
    </section>
  )
}
