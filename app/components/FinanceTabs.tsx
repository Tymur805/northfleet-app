'use client'

import { useState } from 'react'
import Link from 'next/link'

type Trip = { id: number; customer_name: string; start_date: string; earnings: number; vehicle_id: number }
type Expense = { id: number; category: string; description: string; amount: number; date: string; vendor: string; vehicle_id: number }
type Vehicle = { id: number; make: string; model: string; year: number; nickname?: string }

const PERIODS = ['This Month', 'Last Month', 'All Time']

export default function FinanceTabs({ trips, expenses, vehicles }: { trips: Trip[]; expenses: Expense[]; vehicles: Vehicle[] }) {
  const [tab, setTab] = useState<'income' | 'expenses' | 'vehicles'>('income')
  const [period, setPeriod] = useState('This Month')

  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`

  function filterByPeriod<T extends { start_date?: string; date?: string }>(items: T[]): T[] {
    if (period === 'All Time') return items
    const month = period === 'This Month' ? thisMonth : lastMonth
    return items.filter((item) => {
      const date = item.start_date ?? item.date ?? ''
      return date.startsWith(month)
    })
  }

  const filteredTrips = filterByPeriod(trips)
  const filteredExpenses = filterByPeriod(expenses)

  const byCategory: Record<string, number> = {}
  filteredExpenses.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + Number(e.amount)
  })
  const totalExpenses = Object.values(byCategory).reduce((a, b) => a + b, 0)
  const sortedCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1])

  return (
    <div className="flex flex-col gap-4">
      {/* Period selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              period === p ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-800 rounded-xl p-1">
        {(['income', 'expenses', 'vehicles'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              tab === t ? 'bg-zinc-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'income' && (
        <div className="flex flex-col gap-3">
          {filteredTrips.map((trip) => (
            <div key={trip.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{trip.customer_name}</p>
                <p className="text-sm text-zinc-500 mt-0.5">{trip.start_date} · Turo</p>
              </div>
              <p className="font-semibold text-green-400">+${Number(trip.earnings).toLocaleString()}</p>
            </div>
          ))}
          {filteredTrips.length === 0 && <p className="text-center py-16 text-zinc-600">No income for this period.</p>}
        </div>
      )}

      {tab === 'expenses' && (
        <div className="flex flex-col gap-3">
          <Link
            href="/finance/expenses/new"
            className="flex items-center justify-center gap-2 border border-dashed border-zinc-700 rounded-2xl py-4 text-zinc-500 hover:text-white hover:border-zinc-500 transition-colors text-sm"
          >
            + Add Expense
          </Link>

          {filteredExpenses.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-sm font-semibold text-zinc-400">By Category</p>
              {sortedCategories.map(([cat, amount]) => (
                <div key={cat} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white">{cat}</span>
                    <span className="text-zinc-400">${amount.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${(amount / totalExpenses) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredExpenses.map((expense) => (
            <div key={expense.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{expense.description}</p>
                <p className="text-sm text-zinc-500 mt-0.5">{expense.category} · {expense.date}</p>
                {expense.vendor && <p className="text-xs text-zinc-600 mt-0.5">{expense.vendor}</p>}
              </div>
              <p className="font-semibold text-red-400">-${Number(expense.amount).toLocaleString()}</p>
            </div>
          ))}
          {filteredExpenses.length === 0 && <p className="text-center py-16 text-zinc-600">No expenses for this period.</p>}
        </div>
      )}
      {tab === 'vehicles' && (
        <div className="flex flex-col gap-3">
          {vehicles.map((vehicle) => {
            const earned = filteredTrips
              .filter((t) => t.vehicle_id === vehicle.id)
              .reduce((sum, t) => sum + Number(t.earnings), 0)
            const spent = filteredExpenses
              .filter((e) => e.vehicle_id === vehicle.id)
              .reduce((sum, e) => sum + Number(e.amount), 0)
            const profit = earned - spent

            return (
              <div key={vehicle.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
                <p className="font-semibold text-white">
                  {vehicle.nickname ?? `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-zinc-500">Income</p>
                    <p className="text-sm font-semibold text-green-400">${earned.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Expenses</p>
                    <p className="text-sm font-semibold text-red-400">${spent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Profit</p>
                    <p className={`text-sm font-semibold ${profit >= 0 ? 'text-white' : 'text-red-400'}`}>
                      ${profit.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
