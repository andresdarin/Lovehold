'use client'
import { createContext, useContext, type ReactNode } from 'react'
import { usePersonalFinance } from '@/features/personal-finance/hooks'
const Context = createContext<ReturnType<typeof usePersonalFinance> | null>(null)
export function DashboardData({ children }: { children: ReactNode }) {
  const data = usePersonalFinance()
  return <Context.Provider value={data}>{children}</Context.Provider>
}
export function useDashboardData() {
  const value = useContext(Context)
  if (!value) throw new Error('DashboardData is required')
  return value
}

