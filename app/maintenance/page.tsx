'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const typeColors: Record<string, string> = {
  'Oil Change':  '#FF9F0A',
  'Tire Change': '#FF2200',
  'Brake Pads':  '#FF453A',
  'Inspection':  '#34C759',
  'Battery':     '#BF5AF2',
  'Other':       'rgba(255,255,255,0.4)',
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
    <div className="flex flex-col gap-3 pt-1 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-bold text-white">Service</h1>
          {!loading && (
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {records.length} records · ${totalCost.toLocaleString()} total
            </p>
          )}
        </div>
        <Link href="/maintenance/new" className="btn-primary h-9 px-4 text-[13px]">
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Log Service
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[0,1,2].map(i => <div key={i} className="skeleton h-16 rounded-[20px]" />)}
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-[20px] flex items-center justify-center"
            style={{ background: 'rgba(255,159,10,0.08)', border: '1px solid rgba(255,159,10,0.15)' }}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="rgba(255,159,10,0.5)" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <p className="text-[14px] font-semibold text-white">No service records</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {records.map((record, i) => {
            const color = typeColors[record.type] || 'rgba(255,255,255,0.4)'
            return (
              <div key={record.id} className="pressable rounded-[20px] p-4 flex items-center justify-between animate-fade-up"
                style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', animationDelay: `${i * 30}ms` }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0"
                    style={{ background: `${color}15` }}>
                    <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-[13px] text-white">{record.type}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      Vehicle #{record.vehicle_id} · {record.date}
                    </p>
                    {record.mileage_km && (
                      <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
                        {record.mileage_km?.toLocaleString()} km
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-[13px] text-white">${Number(record.cost).toLocaleString()}</p>
                  {record.notes && <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>note</p>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
