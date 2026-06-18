'use client'

import { useEffect, useState } from 'react'
import FinanceTabs from '../components/FinanceTabs'

export default function FinancePage() {
  const [trips, setTrips] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const h = { 'apikey': key, 'Authorization': `Bearer ${key}` }

    Promise.all([
      fetch(`${url}/rest/v1/Trips?select=*&order=start_date.desc`, { headers: h }).then(r => r.json()),
      fetch(`${url}/rest/v1/Expenses?select=*&order=date.desc`, { headers: h }).then(r => r.json()),
      fetch(`${url}/rest/v1/vehicles?select=*`, { headers: h }).then(r => r.json()),
    ]).then(([tripsData, expensesData, vehiclesData]) => {
      setTrips(Array.isArray(tripsData) ? tripsData : [])
      setExpenses(Array.isArray(expensesData) ? expensesData : [])
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const totalIncome = trips.reduce((sum, t) => sum + Number(t.earnings), 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const cashFlow = totalIncome - totalExpenses

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-white">Finance</h1>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex flex-col gap-1">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Income</p>
          <p className="text-lg font-bold text-green-400">${totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex flex-col gap-1">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Expenses</p>
          <p className="text-lg font-bold text-red-400">${totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex flex-col gap-1">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Profit</p>
          <p className={`text-lg font-bold ${cashFlow >= 0 ? 'text-white' : 'text-red-400'}`}>
            ${cashFlow.toLocaleString()}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-zinc-600">Loading...</div>
      ) : (
        <FinanceTabs trips={trips} expenses={expenses} vehicles={vehicles} />
      )}
    </div>
  )
}
