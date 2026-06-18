'use client'

import { useState } from 'react'
import Link from 'next/link'

type Trip = { id: number; customer_name: string; start_date: string; earnings: number; vehicle_id: number }
type Expense = { id: number; category: string; description: string; amount: number; date: string; vendor: string; vehicle_id: number }
type Vehicle = { id: number; make: string; model: string; year: number; nickname?: string }

const PERIODS = ['This Month', 'Last Month', 'All Time']

function MonthlyChart({ trips, expenses }: { trips: Trip[]; expenses: Expense[] }) {
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleString('en', { month: 'short' }),
    }
  })

  const data = months.map(m => ({
    ...m,
    income: trips.filter(t => t.start_date.startsWith(m.key)).reduce((s, t) => s + Number(t.earnings), 0),
    expenses: expenses.filter(e => (e.date || '').startsWith(m.key)).reduce((s, e) => s + Number(e.amount), 0),
  }))

  const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expenses)), 1)

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Last 6 Months</p>
      <div className="flex items-end justify-between gap-1 h-28">
        {data.map(d => (
          <div key={d.key} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex gap-0.5 items-end" style={{ height: 80 }}>
              <div
                className="flex-1 bg-green-500/70 rounded-t"
                style={{ height: `${(d.income / maxVal) * 100}%`, minHeight: d.income > 0 ? 3 : 0 }}
              />
              <div
                className="flex-1 bg-red-400/60 rounded-t"
                style={{ height: `${(d.expenses / maxVal) * 100}%`, minHeight: d.expenses > 0 ? 3 : 0 }}
              />
            </div>
            <span className="text-[9px] text-zinc-500">{d.label}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-2">
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-green-500/70" /><span className="text-[10px] text-zinc-400">Income</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-red-400/60" /><span className="text-[10px] text-zinc-400">Expenses</span></div>
      </div>
    </div>
  )
}

export default function FinanceTabs({ trips, expenses, vehicles }: { trips: Trip[]; expenses: Expense[]; vehicles: Vehicle[] }) {
  const [tab, setTab] = useState<'overview' | 'income' | 'expenses' | 'vehicles'>('overview')
  const [period, setPeriod] = useState('This Month')

  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`

  function filterByPeriod<T extends { start_date?: string; date?: string }>(items: T[]): T[] {
    if (period === 'All Time') return items
    const month = period === 'This Month' ? thisMonth : lastMonth
    return items.filter(item => (item.start_date ?? item.date ?? '').startsWith(month))
  }

  const filteredTrips = filterByPeriod(trips)
  const filteredExpenses = filterByPeriod(expenses)

  const byCategory: Record<string, number> = {}
  filteredExpenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] ?? 0) + Number(e.amount) })
  const totalExpenses = Object.values(byCategory).reduce((a, b) => a + b, 0)
  const sortedCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1])

  const periodIncome = filteredTrips.reduce((s, t) => s + Number(t.earnings), 0)
  const periodExpenses = filteredExpenses.reduce((s, e) => s + Number(e.amount), 0)

  return (
    <div className="flex flex-col gap-4">
      {/* Period selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {PERIODS.map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${period === p ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'}`}>
            {p}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-800 rounded-xl p-1">
        {(['overview', 'income', 'expenses', 'vehicles'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${tab === t ? 'bg-zinc-600 text-white' : 'text-zinc-400'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="flex flex-col gap-3">
          <MonthlyChart trips={trips} expenses={expenses} />
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Income</p>
              <p className="text-xl font-bold text-green-400 mt-1">${periodIncome.toLocaleString()}</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">{filteredTrips.length} trips</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Profit</p>
              <p className={`text-xl font-bold mt-1 ${periodIncome - periodExpenses >= 0 ? 'text-white' : 'text-red-400'}`}>
                ${(periodIncome - periodExpenses).toLocaleString()}
              </p>
              <p className="text-[10px] text-zinc-600 mt-0.5">after expenses</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'income' && (
        <div className="flex flex-col gap-3">
          {filteredTrips.map(trip => (
            <div key={trip.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{trip.customer_name}</p>
                <p className="text-sm text-zinc-500 mt-0.5">{trip.start_date}</p>
              </div>
              <p className="font-semibold text-green-400">+${Number(trip.earnings).toLocaleString()}</p>
            </div>
          ))}
          {filteredTrips.length === 0 && <p className="text-center py-16 text-zinc-600">No income for this period.</p>}
        </div>
      )}

      {tab === 'expenses' && (
        <div className="flex flex-col gap-3">
          <Link href="/finance/expenses/new"
            className="flex items-center justify-center gap-2 border border-dashed border-zinc-700 rounded-2xl py-4 text-zinc-500 text-sm">
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
          {filteredExpenses.map(expense => (
            <div key={expense.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{expense.description || expense.category}</p>
                <p className="text-sm text-zinc-500 mt-0.5">{expense.category} · {expense.date}</p>
              </div>
              <p className="font-semibold text-red-400">-${Number(expense.amount).toLocaleString()}</p>
            </div>
          ))}
          {filteredExpenses.length === 0 && <p className="text-center py-16 text-zinc-600">No expenses for this period.</p>}
        </div>
      )}

      {tab === 'vehicles' && (
        <div className="flex flex-col gap-3">
          {vehicles.map(vehicle => {
            const earned = filteredTrips.filter(t => t.vehicle_id === vehicle.id).reduce((s, t) => s + Number(t.earnings), 0)
            const spent = filteredExpenses.filter(e => e.vehicle_id === vehicle.id).reduce((s, e) => s + Number(e.amount), 0)
            const profit = earned - spent
            return (
              <div key={vehicle.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
                <p className="font-semibold text-white">{vehicle.nickname ?? `${vehicle.year} ${vehicle.make} ${vehicle.model}`}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div><p className="text-xs text-zinc-500">Income</p><p className="text-sm font-semibold text-green-400">${earned.toLocaleString()}</p></div>
                  <div><p className="text-xs text-zinc-500">Expenses</p><p className="text-sm font-semibold text-red-400">${spent.toLocaleString()}</p></div>
                  <div><p className="text-xs text-zinc-500">Profit</p><p className={`text-sm font-semibold ${profit >= 0 ? 'text-white' : 'text-red-400'}`}>${profit.toLocaleString()}</p></div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
