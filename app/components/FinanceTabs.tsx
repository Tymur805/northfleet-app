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
    <div className="rounded-[20px] p-4" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
      <p className="section-label" style={{ marginTop: 0, marginBottom: 16 }}>Last 6 Months</p>
      <div className="flex items-end justify-between gap-1.5" style={{ height: 88 }}>
        {data.map((d, i) => (
          <div key={d.key} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex gap-0.5 items-end" style={{ height: 68 }}>
              <div className="flex-1 rounded-t chart-bar"
                style={{ height: `${(d.income / maxVal) * 100}%`, minHeight: d.income > 0 ? 2 : 0, background: 'linear-gradient(to top, #34C759, #30D158)', opacity: 0.8, animationDelay: `${i*60}ms` }} />
              <div className="flex-1 rounded-t chart-bar"
                style={{ height: `${(d.expenses / maxVal) * 100}%`, minHeight: d.expenses > 0 ? 2 : 0, background: 'linear-gradient(to top, #E0001A, #FF2200)', opacity: 0.7, animationDelay: `${i*60+30}ms` }} />
            </div>
            <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{d.label}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm" style={{ background: '#34C759' }} />
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Income</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm" style={{ background: '#FF2200' }} />
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Expenses</span>
        </div>
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
  const periodIncome = filteredTrips.reduce((s, t) => s + Number(t.earnings), 0)
  const periodExpenses = filteredExpenses.reduce((s, e) => s + Number(e.amount), 0)
  const profit = periodIncome - periodExpenses

  const byCategory: Record<string, number> = {}
  filteredExpenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] ?? 0) + Number(e.amount) })
  const totalExpCat = Object.values(byCategory).reduce((a, b) => a + b, 0)
  const sortedCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1])

  return (
    <div className="flex flex-col gap-3">
      {/* Period chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {PERIODS.map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className="pressable shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all"
            style={period === p
              ? { background: 'linear-gradient(135deg, #E0001A, #FF2200)', color: 'white', boxShadow: '0 0 20px rgba(255,34,0,0.45)' }
              : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}>
            {p}
          </button>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-[16px]" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
        {(['overview', 'income', 'expenses', 'vehicles'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="pressable flex-1 py-2 rounded-[10px] text-[11px] font-semibold transition-all"
            style={tab === t
              ? { background: '#181818', color: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }
              : { color: 'rgba(255,255,255,0.35)' }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="flex flex-col gap-2 animate-fade-up">
          <MonthlyChart trips={trips} expenses={expenses} />
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-[20px] p-3.5" style={{ background: 'rgba(52,199,89,0.06)', border: '1px solid rgba(52,199,89,0.15)' }}>
              <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'rgba(52,199,89,0.6)' }}>Income</p>
              <p className="text-[17px] font-bold mt-1 tabular-nums" style={{ color: '#34C759' }}>${periodIncome.toLocaleString()}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>{filteredTrips.length} trips</p>
            </div>
            <div className="rounded-[20px] p-3.5" style={{ background: 'rgba(255,34,0,0.06)', border: '1px solid rgba(255,34,0,0.2)' }}>
              <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,34,0,0.8)' }}>Expenses</p>
              <p className="text-[17px] font-bold mt-1 tabular-nums" style={{ color: '#FF2200' }}>${periodExpenses.toLocaleString()}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>{filteredExpenses.length} items</p>
            </div>
            <div className="rounded-[20px] p-3.5" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>Profit</p>
              <p className="text-[17px] font-bold mt-1 tabular-nums" style={{ color: profit >= 0 ? 'white' : '#E10600' }}>${profit.toLocaleString()}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>net</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'income' && (
        <div className="flex flex-col gap-2 animate-fade-up">
          {filteredTrips.map((trip, i) => (
            <div key={trip.id} className="pressable rounded-[20px] p-4 flex items-center justify-between"
              style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', animationDelay: `${i * 30}ms` }}>
              <div>
                <p className="font-semibold text-[13px] text-white">{trip.customer_name}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{trip.start_date}</p>
              </div>
              <p className="font-bold text-[13px]" style={{ color: '#34C759' }}>+${Number(trip.earnings).toLocaleString()}</p>
            </div>
          ))}
          {filteredTrips.length === 0 && <p className="text-center py-12 text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>No income for this period.</p>}
        </div>
      )}

      {tab === 'expenses' && (
        <div className="flex flex-col gap-2 animate-fade-up">
          <Link href="/finance/expenses/new"
            className="pressable flex items-center justify-center gap-2 rounded-[20px] py-3.5 text-[13px] font-semibold"
            style={{ border: '1px dashed rgba(255,34,0,0.3)', color: 'rgba(255,34,0,0.8)' }}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Expense
          </Link>
          {filteredExpenses.length > 0 && (
            <div className="rounded-[20px] p-4" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="section-label" style={{ marginTop: 0, marginBottom: 12 }}>By Category</p>
              <div className="flex flex-col gap-2.5">
                {sortedCategories.map(([cat, amount]) => (
                  <div key={cat} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-white">{cat}</span>
                      <span className="text-[12px] tabular-nums" style={{ color: 'rgba(255,255,255,0.45)' }}>${amount.toLocaleString()}</span>
                    </div>
                    <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full" style={{ width: `${(amount / totalExpCat) * 100}%`, background: 'linear-gradient(to right, #E0001A, #FF2200)', opacity: 0.8 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {filteredExpenses.map((e, i) => (
            <div key={e.id} className="pressable rounded-[20px] p-4 flex items-center justify-between"
              style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <p className="font-semibold text-[13px] text-white">{e.description || e.category}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{e.category} · {e.date}</p>
              </div>
              <p className="font-bold text-[13px]" style={{ color: '#FF2200' }}>-${Number(e.amount).toLocaleString()}</p>
            </div>
          ))}
          {filteredExpenses.length === 0 && <p className="text-center py-12 text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>No expenses for this period.</p>}
        </div>
      )}

      {tab === 'vehicles' && (
        <div className="flex flex-col gap-2 animate-fade-up">
          {vehicles.map(vehicle => {
            const earned = filteredTrips.filter(t => t.vehicle_id === vehicle.id).reduce((s, t) => s + Number(t.earnings), 0)
            const spent = filteredExpenses.filter(e => e.vehicle_id === vehicle.id).reduce((s, e) => s + Number(e.amount), 0)
            const vprofit = earned - spent
            return (
              <div key={vehicle.id} className="rounded-[20px] p-4" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="font-semibold text-[13px] text-white mb-3">{vehicle.nickname ?? `${vehicle.year} ${vehicle.make} ${vehicle.model}`}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>Income</p>
                    <p className="text-[13px] font-bold mt-0.5 tabular-nums" style={{ color: '#34C759' }}>${earned.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>Expenses</p>
                    <p className="text-[13px] font-bold mt-0.5 tabular-nums" style={{ color: '#FF2200' }}>${spent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>Profit</p>
                    <p className="text-[13px] font-bold mt-0.5 tabular-nums" style={{ color: vprofit >= 0 ? 'white' : '#E10600' }}>${vprofit.toLocaleString()}</p>
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
