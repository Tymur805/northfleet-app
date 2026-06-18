'use client'

import { useState } from 'react'
import Link from 'next/link'

type Trip = { id: number; customer_name: string; start_date: string; earnings: number }
type Expense = { id: number; category: string; description: string; amount: number; date: string; vendor: string }

export default function FinanceTabs({ trips, expenses }: { trips: Trip[]; expenses: Expense[] }) {
  const [tab, setTab] = useState<'income' | 'expenses'>('income')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 bg-zinc-800 rounded-xl p-1">
        {(['income', 'expenses'] as const).map((t) => (
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
          {trips.map((trip) => (
            <div key={trip.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{trip.customer_name}</p>
                <p className="text-sm text-zinc-500 mt-0.5">{trip.start_date} · Turo</p>
              </div>
              <p className="font-semibold text-green-400">+${Number(trip.earnings).toLocaleString()}</p>
            </div>
          ))}
          {trips.length === 0 && <p className="text-center py-16 text-zinc-600">No income yet.</p>}
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
          {expenses.map((expense) => (
            <div key={expense.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{expense.description}</p>
                <p className="text-sm text-zinc-500 mt-0.5">{expense.category} · {expense.date}</p>
                {expense.vendor && <p className="text-xs text-zinc-600 mt-0.5">{expense.vendor}</p>}
              </div>
              <p className="font-semibold text-red-400">-${Number(expense.amount).toLocaleString()}</p>
            </div>
          ))}
          {expenses.length === 0 && <p className="text-center py-16 text-zinc-600">No expenses yet.</p>}
        </div>
      )}
    </div>
  )
}
