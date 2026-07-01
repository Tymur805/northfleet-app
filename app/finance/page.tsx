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
    ]).then(([t, e, v]) => {
      setTrips(Array.isArray(t) ? t : [])
      setExpenses(Array.isArray(e) ? e : [])
      setVehicles(Array.isArray(v) ? v : [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const totalIncome = trips.reduce((s, t) => s + Number(t.earnings), 0)
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const cashFlow = totalIncome - totalExpenses

  return (
    <div className="flex flex-col gap-3 pt-1 animate-fade-up">
      <h1 className="text-[17px] font-bold text-white">Finance</h1>

      {/* Period widgets */}
      {!loading && (() => {
        const now = new Date()
        const todayStr = now.toISOString().split('T')[0]
        const monthStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
        const startWeek = new Date(now); startWeek.setDate(now.getDate()-now.getDay())
        const weekStr = startWeek.toISOString().split('T')[0]
        const todayInc = trips.filter(t=>t.start_date===todayStr).reduce((s,t)=>s+Number(t.earnings),0)
        const weekInc = trips.filter(t=>t.start_date>=weekStr).reduce((s,t)=>s+Number(t.earnings),0)
        const monthInc = trips.filter(t=>t.start_date?.startsWith(monthStr)).reduce((s,t)=>s+Number(t.earnings),0)
        return (
          <div className="grid grid-cols-3 gap-2">
            {[{l:'Today',v:todayInc},{l:'This Week',v:weekInc},{l:'This Month',v:monthInc}].map(w => (
              <div key={w.l} className="rounded-[20px] p-3.5" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="section-label" style={{ marginTop: 0 }}>{w.l}</p>
                <p className="text-[16px] font-bold mt-1.5 tabular-nums" style={{ color: '#34C759' }}>${w.v.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )
      })()}

      {/* All-time totals */}
      {!loading && (
        <div className="rounded-[20px] px-4 py-3.5 flex items-center gap-5"
          style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <p className="section-label" style={{ marginTop: 0, color: 'rgba(52,199,89,0.5)' }}>Total Income</p>
            <p className="text-[14px] font-bold mt-1 tabular-nums" style={{ color: '#34C759' }}>${totalIncome.toLocaleString()}</p>
          </div>
          <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <div>
            <p className="section-label" style={{ marginTop: 0, color: 'rgba(193,18,31,0.6)' }}>Expenses</p>
            <p className="text-[14px] font-bold mt-1 tabular-nums" style={{ color: '#E10600' }}>${totalExpenses.toLocaleString()}</p>
          </div>
          <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <div>
            <p className="section-label" style={{ marginTop: 0 }}>Profit</p>
            <p className="text-[14px] font-bold mt-1 tabular-nums" style={{ color: cashFlow >= 0 ? 'white' : '#E10600' }}>${cashFlow.toLocaleString()}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-2">
          {[0,1,2].map(i => <div key={i} className="skeleton h-12 rounded-[20px]" />)}
        </div>
      ) : (
        <FinanceTabs trips={trips} expenses={expenses} vehicles={vehicles} />
      )}
    </div>
  )
}
