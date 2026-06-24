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
    <div className="flex flex-col gap-2 animate-fade-up">
      <p className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>Finance</p>

      {/* Ramp-style top widgets */}
      {!loading && (() => {
        const now2 = new Date()
        const todayStr = now2.toISOString().split('T')[0]
        const monthStr = `${now2.getFullYear()}-${String(now2.getMonth()+1).padStart(2,'0')}`
        const startWeek = new Date(now2); startWeek.setDate(now2.getDate()-now2.getDay())
        const weekStr2 = startWeek.toISOString().split('T')[0]
        const todayInc = trips.filter(t=>t.start_date===todayStr).reduce((s,t)=>s+Number(t.earnings),0)
        const weekInc = trips.filter(t=>t.start_date>=weekStr2).reduce((s,t)=>s+Number(t.earnings),0)
        const monthInc = trips.filter(t=>t.start_date?.startsWith(monthStr)).reduce((s,t)=>s+Number(t.earnings),0)
        return (
          <div className="grid grid-cols-3 gap-1.5">
            {[{l:'Today',v:todayInc},{l:'This Week',v:weekInc},{l:'This Month',v:monthInc}].map(w=>(
              <div key={w.l} className="rounded-[14px] p-2.5" style={{background:'#111',border:'1px solid rgba(255,255,255,0.07)'}}>
                <p className="text-[9px] uppercase tracking-widest font-semibold" style={{color:'rgba(255,255,255,0.28)'}}>{w.l}</p>
                <p className="text-[15px] font-bold mt-1" style={{color:'#34C759'}}>${w.v.toLocaleString()}</p>
                <p className="text-[9px] mt-0.5" style={{color:'rgba(255,255,255,0.2)'}}>revenue</p>
              </div>
            ))}
          </div>
        )
      })()}

      {/* All-time row */}
      {!loading && (
        <div className="rounded-[14px] px-3 py-2.5 flex items-center justify-between"
          style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-[9px] uppercase tracking-widest" style={{ color: 'rgba(52,199,89,0.5)' }}>Total Income</p>
              <p className="text-sm font-bold" style={{ color: '#34C759' }}>${totalIncome.toLocaleString()}</p>
            </div>
            <div className="w-px h-6" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div>
              <p className="text-[9px] uppercase tracking-widest" style={{ color: 'rgba(255,69,58,0.5)' }}>Expenses</p>
              <p className="text-sm font-bold" style={{ color: '#FF453A' }}>${totalExpenses.toLocaleString()}</p>
            </div>
            <div className="w-px h-6" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div>
              <p className="text-[9px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Profit</p>
              <p className="text-sm font-bold" style={{ color: cashFlow >= 0 ? 'white' : '#FF453A' }}>${cashFlow.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-1.5 animate-pulse">
          {[0,1,2].map(i => <div key={i} className="skeleton h-12 rounded-[14px]" />)}
        </div>
      ) : (
        <FinanceTabs trips={trips} expenses={expenses} vehicles={vehicles} />
      )}
    </div>
  )
}
