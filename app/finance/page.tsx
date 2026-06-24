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
    <div className="flex flex-col gap-3 animate-fade-up">
      <h1 className="text-[17px] font-semibold text-white mb-1">Finance</h1>

      {/* All-time summary hero */}
      {!loading && (
        <div className="rounded-[20px] p-4" style={{
          background: 'linear-gradient(135deg, #111111 0%, #1C1C1E 100%)',
          border: '1px solid rgba(255,255,255,0.07)'
        }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>All Time</p>
          <div className="flex items-end gap-4 mt-2">
            <div>
              <p className="text-[11px]" style={{ color: 'rgba(52,199,89,0.7)' }}>Income</p>
              <p className="text-2xl font-bold" style={{ color: '#34C759' }}>${totalIncome.toLocaleString()}</p>
            </div>
            <div className="w-px self-stretch" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div>
              <p className="text-[11px]" style={{ color: 'rgba(255,69,58,0.7)' }}>Expenses</p>
              <p className="text-2xl font-bold" style={{ color: '#FF453A' }}>${totalExpenses.toLocaleString()}</p>
            </div>
            <div className="w-px self-stretch" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Profit</p>
              <p className="text-2xl font-bold" style={{ color: cashFlow >= 0 ? 'white' : '#FF453A' }}>${cashFlow.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-2 animate-pulse">
          {[0,1,2].map(i => <div key={i} className="skeleton h-14 rounded-[20px]" />)}
        </div>
      ) : (
        <FinanceTabs trips={trips} expenses={expenses} vehicles={vehicles} />
      )}
    </div>
  )
}
