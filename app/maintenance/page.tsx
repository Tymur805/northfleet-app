'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const typeColors: Record<string, string> = {
  'Oil Change': '#FF9F0A',
  'Tire Change': '#0A84FF',
  'Brake Pads': '#FF453A',
  'Inspection': '#34C759',
  'Battery': '#BF5AF2',
  'Other': 'rgba(255,255,255,0.4)',
}

export default function MaintenancePage() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    fetch(`${url}/rest/v1/Maintenance?select=*&order=date.desc`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    }).then(r => r.json()).then(d => setRecords(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const totalCost = records.reduce((s, r) => s + Number(r.cost), 0)

  return (
    <div className="flex flex-col gap-2 animate-fade-up">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="text-[13px] font-semibold text-white">Service</h1>
          {!loading && <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{records.length} records · ${totalCost.toLocaleString()} total</p>}
        </div>
        <Link href="/maintenance/new" className="pressable h-8 px-3 rounded-full text-sm font-medium flex items-center gap-1.5"
          style={{ background: '#0A84FF', color: 'white', boxShadow: '0 0 16px rgba(10,132,255,0.3)' }}>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2 animate-pulse">
          {[0,1,2].map(i => <div key={i} className="skeleton h-16 rounded-[20px]" />)}
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.2)' }}>
          <p className="text-4xl mb-3">🔧</p>
          <p className="text-sm">No service records yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {records.map((record, i) => {
            const color = typeColors[record.type] || 'rgba(255,255,255,0.4)'
            return (
              <div key={record.id} className="pressable rounded-[20px] p-3.5 flex items-center justify-between animate-fade-up"
                style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', animationDelay: `${i * 30}ms` }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0"
                    style={{ background: `${color}18` }}>
                    <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-white">{record.type}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      Vehicle #{record.vehicle_id} · {record.date}
                    </p>
                    {record.mileage_km && (
                      <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>{record.mileage_km?.toLocaleString()} km</p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-sm text-white">${Number(record.cost).toLocaleString()}</p>
                  {record.notes && <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>note</p>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
